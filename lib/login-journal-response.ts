import { createHash } from "node:crypto";
import { decode } from "next-auth/jwt";
import type { PrismaClient } from "@prisma/client";

const SESSION_NAMES = ["__Secure-authjs.session-token", "authjs.session-token"];

// Match next-auth 5.0.0-beta.30 / @auth/core 0.41.0, including its legacy alias.
function authSecret(): string | string[] {
  const primary = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (primary) return primary;
  const rotated = [3, 2, 1].map((i) => process.env[`AUTH_SECRET_${i}`]).filter((s): s is string => Boolean(s));
  if (!rotated.length) throw new Error("AUTH_SECRET_UNAVAILABLE");
  return rotated;
}

function readChunks(cookies: Map<string, string>, base: string): string | null {
  const entries = [...cookies].filter(([name]) => name === base || name.startsWith(`${base}.`));
  if (!entries.length) return null;
  if (cookies.has(base)) {
    if (entries.length !== 1) throw new Error("SESSION_COOKIE_AMBIGUOUS");
    return cookies.get(base)!;
  }
  const parts = entries.map(([name, value]) => {
    const suffix = name.slice(base.length + 1);
    if (!/^(0|[1-9][0-9]*)$/.test(suffix)) throw new Error("SESSION_CHUNK_INVALID");
    return { index: Number(suffix), value };
  }).sort((a, b) => a.index - b.index);
  if (parts.length > 64 || parts.some((part, index) => part.index !== index)) throw new Error("SESSION_CHUNK_GAP");
  return parts.map((part) => part.value).join("");
}

function cookiePair(value: string): [string, string] {
  const pair = value.split(";", 1)[0]!;
  const separator = pair.indexOf("=");
  if (separator < 1) throw new Error("COOKIE_INVALID");
  return [pair.slice(0, separator).trim(), decodeURIComponent(pair.slice(separator + 1).trim())];
}

function unavailable(request: Request): Response {
  // Discard ALL of the candidate response's Set-Cookie headers. This withholds
  // the new session without clearing or replacing any previous browser session.
  const headers = { "Cache-Control": "no-store", "Retry-After": "5" };
  if (request.headers.has("X-Auth-Return-Redirect")) {
    return Response.json({ url: new URL("/giris?error=Configuration", request.url).href }, { status: 503, headers });
  }
  return new Response("Giriş tamamlanamadı. Lütfen kısa süre sonra yeniden deneyin.", {
    status: 503,
    headers: { ...headers, "Content-Type": "text/plain; charset=utf-8" },
  });
}

/**
 * Auth.js catches events.signIn exceptions, so that event cannot enforce durable
 * delivery. Guard the final callback response instead, after Auth.js has verified
 * credentials/provider and encrypted a new JWT, but before Set-Cookie is sent.
 */
export async function journalLoginResponse(request: Request, response: Response, prisma: PrismaClient): Promise<Response> {
  if (!/\/callback\/(credentials|google|github)\/?$/.test(new URL(request.url).pathname) ||
      response.status < 200 || response.status >= 400) return response;

  try {
    const outgoing = new Map<string, string>();
    // Do not split a combined Set-Cookie header: Expires itself contains commas.
    for (const header of response.headers.getSetCookie()) {
      const [name, value] = cookiePair(header);
      if (!SESSION_NAMES.some((base) => name === base || name.startsWith(`${base}.`))) continue;
      if (!value || /;\s*max-age=0(?:;|$)/i.test(header)) outgoing.delete(name);
      else outgoing.set(name, value);
    }
    const issued = SESSION_NAMES.map((name) => ({ name, value: readChunks(outgoing, name) })).filter((c) => c.value !== null);
    // Error redirects, provider consent redirects and cookie clearing are not logins.
    if (!issued.length) return response;
    if (issued.length !== 1) throw new Error("SESSION_COOKIE_AMBIGUOUS");
    const { name, value } = issued[0]!;
    if (!value || value.length > 256_000) throw new Error("SESSION_COOKIE_INVALID");

    const incoming = new Map<string, string>();
    for (const part of (request.headers.get("cookie") ?? "").split(";")) {
      if (!part.trim()) continue;
      // A malformed pre-existing cookie must not prevent a valid replacement.
      try { const [key, val] = cookiePair(part); incoming.set(key, val); } catch { /* ignored */ }
    }
    let previous: string | null = null;
    try { previous = readChunks(incoming, name); } catch { /* invalid old session */ }
    if (previous === value) return response;

    const token = await decode({ token: value, secret: authSecret(), salt: name });
    const now = Math.floor(Date.now() / 1000);
    if (!token || typeof token.id !== "string" || !token.id ||
        typeof token.jti !== "string" || !token.jti ||
        typeof token.iat !== "number" || token.iat > now + 5 || token.iat < now - 60 ||
        typeof token.exp !== "number" || token.exp <= now) throw new Error("SESSION_TOKEN_INVALID");

    await prisma.$transaction(async (tx) => {
      const actor = await tx.user.findUnique({
        where: { id: token.id as string },
        select: { id: true, role: true, email: true },
      });
      // PrismaAdapter returns the canonical DB account for OAuth; credentials
      // does the same. token.id is issued by our JWT callback, never by a client.
      if (!actor || actor.role !== token.role) throw new Error("SESSION_ACTOR_UNVERIFIED");
      if (!["USER", "ADMIN", "SUPER_ADMIN"].includes(actor.role)) throw new Error("SESSION_ROLE_UNVERIFIED");
      const email = actor.email.trim().toLowerCase();
      const excludedIds = (process.env.ABONE_TAKIP_EXCLUDED_ACCOUNT_IDS ?? "").split(",").map((value) => value.trim()).filter(Boolean);
      // Exclusion is decided once, with the verified actor, and survives later
      // account deletion or role changes. Tenant organization roles are not platform roles.
      const excluded = actor.role === "ADMIN" || actor.role === "SUPER_ADMIN" ||
        email === "hikmet044@gmail.com" || excludedIds.includes(actor.id);
      // Store an irreversible event identifier, never the session JWT or jti.
      // This separate no-FK journal is append-only at DB level. Its timestamp is
      // forced by the database clock; it cannot disappear with User/Business.
      const id = `login:${createHash("sha256").update(token.jti as string).digest("hex")}`;
      await tx.$executeRaw`INSERT INTO public.abone_login_events (event_id, actor_id, excluded)
        VALUES (${id}, ${actor.id}, ${excluded}) ON CONFLICT (event_id) DO NOTHING`;
      const rows = await tx.$queryRaw<{ actor_id: string }[]>`SELECT actor_id FROM public.abone_login_events WHERE event_id=${id}`;
      if (rows.length !== 1 || rows[0]!.actor_id !== actor.id) throw new Error("LOGIN_EVENT_CONFLICT");
    }, { maxWait: 2000, timeout: 5000 });
    return response;
  } catch {
    // The failure may contain SQL, a token or account details; never print it.
    console.warn("[login_events] session issuance withheld: durable journal unavailable");
    return unavailable(request);
  }
}
