const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const { pathToFileURL } = require("node:url");
const { randomBytes } = require("node:crypto");
const { test } = require("node:test");
const ts = require("typescript");

function loadTs(file, dependencies) {
  const { outputText } = ts.transpileModule(fs.readFileSync(path.join(__dirname, file), "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  });
  const loaded = { exports: {} };
  new Function("require", "module", "exports", outputText)((name) => dependencies[name] ?? require(name), loaded, loaded.exports);
  return loaded.exports;
}

const BASE = "https://fixture.invalid";
const COOKIE = "__Secure-authjs.session-token";
test('GitHub requires the authenticated primary verified email and never trusts a public display email', async () => {
  const { githubVerifiedProfile }=loadTs('../lib/github-profile.ts',{});
  const profile={id:917,login:'fixture',email:'untrusted-public@example.invalid'};
  function requestForRows(rows,object=profile){return async(url,options)=>{
    assert.equal(new URL(url).origin,'https://api.github.com');assert.equal(options.redirect,'error');
    return Response.json(new URL(url).pathname==='/user'?object:rows);
  };}
  const tokens={access_token:'fixture-only-token'};
  const result=await githubVerifiedProfile({tokens},requestForRows([{email:' Verified@Example.invalid ',primary:true,verified:true}]));
  assert.equal(result.id,917);assert.equal(result.email,'verified@example.invalid');
  for(const rows of [[],[{email:'a@example.invalid',primary:true,verified:false},{email:'b@example.invalid',primary:false,verified:true}],[{email:'a@example.invalid',primary:'true',verified:true}],[{email:'a@example.invalid',primary:true,verified:'true'}],[{email:'',primary:true,verified:true}]]){
    await assert.rejects(githubVerifiedProfile({tokens},requestForRows(rows)),/GITHUB_EMAIL_UNVERIFIED/);
  }
  await assert.rejects(githubVerifiedProfile({tokens},requestForRows([{email:'a@example.invalid',primary:true,verified:true}],{id:'917',login:'fixture'})),/GITHUB_SUBJECT_UNVERIFIED/);
  let calls=0;await assert.rejects(githubVerifiedProfile({tokens:{}},async()=>{calls++;throw Error('must not fetch');}),/GITHUB_TOKEN_UNAVAILABLE/);assert.equal(calls,0);
  await assert.rejects(githubVerifiedProfile({tokens},async()=>Response.json({},{status:401})),/GITHUB_PROFILE_UNAVAILABLE/);
  const pageRows=Array.from({length:100},()=>({email:'secondary@example.invalid',primary:false,verified:true}));
  const paged=await githubVerifiedProfile({tokens},async(url)=>Response.json(new URL(url).pathname==='/user'?profile:(new URL(url).searchParams.get('page')==='1'?pageRows:[{email:'primary@example.invalid',primary:true,verified:true}])));
  assert.equal(paged.email,'primary@example.invalid');
});
function outgoingSession(response) {
  return response.headers.getSetCookie().filter((s) => s.startsWith(`${COOKIE}=`) || s.startsWith(`${COOKIE}.`));
}
function requestFor(route = "callback/credentials", cookie) {
  return new Request(`${BASE}/api/auth/${route}`, {
    method: "POST", headers: { "X-Auth-Return-Redirect": "1", ...(cookie ? { cookie } : {}) },
  });
}
function responseFor(token, chunked = false) {
  const headers = new Headers({ Location: `${BASE}/dashboard` });
  if (chunked) {
    for (let i = 0; i < token.length; i += 100) headers.append("Set-Cookie", `${COOKIE}.${i / 100}=${token.slice(i, i + 100)}; Path=/; HttpOnly; Secure`);
  } else headers.append("Set-Cookie", `${COOKIE}=${token}; Path=/; HttpOnly; Secure; Expires=Wed, 31 Dec 2031 23:59:59 GMT`);
  return new Response(null, { status: 302, headers });
}

test("new Auth.js sessions are released only after canonical durable journal commit", async (t) => {
  const nextRequire = createRequire(require.resolve("next-auth"));
  const { Auth, customFetch } = await import(pathToFileURL(nextRequire.resolve("@auth/core")).href);
  const jwt = await import(pathToFileURL(require.resolve("next-auth/jwt")).href);
  const { default: Credentials } = await import(pathToFileURL(require.resolve("next-auth/providers/credentials")).href);
  const { default: Google } = await import(pathToFileURL(require.resolve("next-auth/providers/google")).href);
  const saved = { AUTH_SECRET: process.env.AUTH_SECRET, NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET, SUPER_ADMIN_EMAILS: process.env.SUPER_ADMIN_EMAILS };
  const secret = randomBytes(32).toString("hex");
  process.env.AUTH_SECRET = secret;
  process.env.SUPER_ADMIN_EMAILS = "bootstrap@example.invalid";
  const canonical = { id: "account-fixture", email: "customer@example.invalid", name: "Fixture", password: "fixture", role: "USER", businessId: "business-fixture" };
  let actor = { ...canonical };
  let rows = new Map();
  let fail = false;
  let queries = [];
  let oauthAccountLinked = true;
  let accountLinks = [];
  const db = {
    user: { findUnique: async (query) => { queries.push(query); return actor; } },
    $transaction: async (fn, options) => {
      assert.deepEqual(options, { maxWait: 2000, timeout: 5000 });
      const staged = new Map(rows);
      const result = await fn({ user: db.user,
        $executeRaw: async (sql, id, actorId, excluded) => {
          assert.match(sql.join('?'), /INSERT INTO public.abone_login_events/);
          if (fail) throw new Error("PRIVATE_DATABASE_DETAIL");
          if (!staged.has(id)) staged.set(id, { event_id: id, actor_id: actorId, excluded, at: new Date() });
          return 1;
        },
        $queryRaw: async (sql, id) => {
          assert.match(sql.join('?'), /SELECT actor_id FROM public.abone_login_events/);
          const row = staged.get(id); return row ? [{ actor_id: row.actor_id }] : [];
        },
      });
      rows = staged;
      return result;
    },
  };
  let config;
  const { githubVerifiedProfile } = loadTs('../lib/github-profile.ts', {});
  loadTs("../lib/auth.ts", {
    "next-auth": (value) => { config = value; return {}; },
    "next-auth/providers/credentials": Credentials,
    "next-auth/providers/google": Google,
    "next/headers": { headers: async () => new Headers() },
    "bcryptjs": { compare: async (password) => password === "fixture-password", hash: async () => "unused-fixture" },
    "./db": { prisma: db },
    "./github-profile": { githubVerifiedProfile },
    "@auth/prisma-adapter": { PrismaAdapter: () => ({ getUserByAccount: async () => oauthAccountLinked ? actor : null, getUser: async () => actor, getUserByEmail: async () => actor, linkAccount: async (value) => { accountLinks.push(value); oauthAccountLinked = true; return value; }, updateUser: async (value) => ({ ...actor, ...value }) }) },
    "@randevu/validation": { loginSchema: { safeParse: (data) => ({ success: true, data }) } },
    "@/lib/rate-limit": { rateLimit: () => true, clientIpFromHeaders: () => "fixture" },
  });
  const { journalLoginResponse: journal } = loadTs("../lib/login-journal-response.ts", { "next-auth/jwt": jwt });
  const coreConfig = () => ({ ...config, secret, basePath: "/api/auth", logger: { error() {}, warn() {}, debug() {} } });
  const encoded = (claims = {}, options = {}) => jwt.encode({
    secret, salt: COOKIE,
    token: { id: canonical.id, role: canonical.role, businessId: canonical.businessId, ...claims }, ...options,
  });
  async function credentials(password = "fixture-password", priorCookie, configPatch = {}) {
    const conf = { ...coreConfig(), ...configPatch };
    const csrf = await Auth(new Request(`${BASE}/api/auth/csrf`), conf);
    const { csrfToken } = await csrf.json();
    assert.equal(typeof csrfToken, "string");
    const cookies = csrf.headers.getSetCookie().map((s) => s.split(";", 1)[0]).join("; ");
    const request = new Request(`${BASE}/api/auth/callback/credentials`, {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", "X-Auth-Return-Redirect": "1", cookie: `${cookies}${priorCookie ? `; ${priorCookie}` : ""}` },
      body: new URLSearchParams({ email: canonical.email, password, csrfToken, callbackUrl: `${BASE}/dashboard` }),
    });
    return { request, response: await Auth(request, conf) };
  }
  const previousWarn = console.warn;
  let warnings = [];
  console.warn = (...args) => warnings.push(args);
  try {
    await t.test("actual framework swallows event exceptions and still creates the new session", async () => {
      const pair = await credentials("fixture-password", undefined, { events: { signIn: async () => { throw new Error("fixture event error"); } } });
      assert.equal(pair.response.status, 200);
      assert.equal(outgoingSession(pair.response).length, 1);
      assert.equal(rows.size, 0);
      assert.equal(config.events, undefined, "production must not keep a second fail-open writer");
    });
    await t.test("Google account linking requires a verified address owned by Google", async () => {
      const gmail = {email:'customer@gmail.com',email_verified:true};
      for (const profile of [undefined, {}, {...gmail,email_verified:false}, {...gmail,email_verified:'true'}, {...gmail,email_verified:1}, {...gmail,email:undefined}, {...gmail,email:'attacker@evil@gmail.com'}, {...gmail,email:'customer@gmail.com.attacker.invalid'}, {...gmail,email:canonical.email}, {...gmail,email:canonical.email,hd:''}, {...gmail,email:canonical.email,hd:' '}, {...gmail,email:canonical.email,hd:true}]) {
        assert.equal(await config.callbacks.signIn({account:{provider:'google'},profile}),false);
      }
      assert.equal(await config.callbacks.signIn({account:{provider:'google'},profile:gmail}),true);
      assert.equal(await config.callbacks.signIn({account:{provider:'google'},profile:{...gmail,email:'Customer@GMAIL.COM'}}),true);
      assert.equal(await config.callbacks.signIn({account:{provider:'google'},profile:{email:canonical.email,email_verified:true,hd:'example.invalid'}}),true);
      assert.equal(config.providers.find((p)=>p.id==='google').options.allowDangerousEmailAccountLinking,true);
      assert.notEqual(config.providers.find((p)=>p.id==='github').options.allowDangerousEmailAccountLinking,true);
    });
    await t.test("actual CSRF + credentials callback uses the response wrapper and persisted canonical identity", async () => {
      rows = new Map(); queries = [];
      const pair = await credentials();
      const routes = loadTs("../app/api/auth/[...nextauth]/route.ts", {
        "@/lib/auth": { handlers: { GET: async () => pair.response, POST: async () => pair.response } },
        "@/lib/db": { prisma: db }, "@/lib/login-journal-response": { journalLoginResponse: journal },
      });
      const result = await routes.POST(pair.request);
      assert.equal(result, pair.response);
      assert.equal(outgoingSession(result).length, 1);
      assert.equal(rows.size, 1);
      const row = [...rows.values()][0];
      assert.match(row.event_id, /^login:[0-9a-f]{64}$/);
      assert.equal(row.actor_id, canonical.id); assert.equal(row.excluded, false); assert.ok(row.at instanceof Date);
      assert.deepEqual(Object.keys(row).sort(), ["event_id", "actor_id", "excluded", "at"].sort());
      assert.deepEqual(queries.at(-1).where, { id: canonical.id });
    });
    await t.test("wrong password and failed CSRF issue no session and write no event", async () => {
      rows = new Map();
      const pair = await credentials("wrong-password");
      assert.equal(await journal(pair.request, pair.response, db), pair.response);
      assert.equal(outgoingSession(pair.response).length, 0);
      const request = new Request(`${BASE}/api/auth/callback/credentials`, {
        method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", "X-Auth-Return-Redirect": "1" },
        body: new URLSearchParams({ email: canonical.email, password: "fixture-password", csrfToken: "invalid" }),
      });
      const response = await Auth(request, coreConfig());
      assert.equal(await journal(request, response, db), response);
      assert.equal(outgoingSession(response).length, 0); assert.equal(rows.size, 0);
    });
    await t.test("storage failure withholds the actual new JWT and never clears a previous session", async () => {
      rows = new Map(); fail = true;
      const oldToken = await encoded();
      const priorCookie = `${COOKIE}=${oldToken}`;
      const pair = await credentials("fixture-password", priorCookie);
      assert.equal(outgoingSession(pair.response).length, 1);
      const response = await journal(pair.request, pair.response, db);
      assert.equal(response.status, 503); assert.deepEqual(response.headers.getSetCookie(), []);
      assert.equal(rows.size, 0); assert.equal(new URL((await response.json()).url).searchParams.get("error"), "Configuration");
      assert.ok(pair.request.headers.get("cookie").includes(priorCookie));
      const stillValid = await jwt.decode({ token: oldToken, salt: COOKIE, secret });
      assert.equal(stillValid.id, canonical.id);
      assert.deepEqual(warnings.at(-1), ["[login_events] session issuance withheld: durable journal unavailable"]);
      fail = false;
    });
    await t.test("encrypted Google-shaped chunks use canonical id and deduplicate the same issued session", async () => {
      rows = new Map();
      const token = await encoded({ sub: "external-google-subject" });
      const request = requestFor("callback/google");
      const response = responseFor(token, true);
      assert.equal(await journal(request, response, db), response);
      assert.equal(await journal(request, response, db), response);
      assert.equal(rows.size, 1); assert.equal([...rows.values()][0].actor_id, canonical.id);
    });
    await t.test("actual Google OAuth callback links an existing password account and journals its canonical identity", async () => {
      rows = new Map(); actor = { ...canonical }; oauthAccountLinked = false; accountLinks = [];
      const coreRequire = createRequire(nextRequire.resolve("@auth/core"));
      const { SignJWT, generateKeyPair, exportJWK } = await import(pathToFileURL(coreRequire.resolve("jose")).href);
      const { privateKey, publicKey } = await generateKeyPair("RS256");
      const issuer = "https://oidc.fixture.invalid";
      let invalidAudience = false; let verifiedEmail = true; let hostedDomain = 'example.invalid';
      let exchanges = 0;
      const provider = Google({
        ...config.providers.find((p)=>p.id==='google').options,
        clientId: "fixture-client", clientSecret: "fixture-only-secret", issuer,
        [customFetch]: async (input, init) => {
          const url = new URL(input instanceof Request ? input.url : String(input));
          assert.equal(url.origin, issuer, "OAuth fixture never sends a network request");
          if (url.pathname === "/.well-known/openid-configuration") return Response.json({
            issuer, authorization_endpoint: `${issuer}/authorize`, token_endpoint: `${issuer}/token`,
            userinfo_endpoint: `${issuer}/userinfo`, jwks_uri: `${issuer}/jwks`,
            response_types_supported: ["code"], subject_types_supported: ["public"],
            code_challenge_methods_supported: ["S256"], id_token_signing_alg_values_supported: ["RS256"],
          });
          if (url.pathname === "/jwks") return Response.json({ keys: [{ ...await exportJWK(publicKey), kid: "fixture-key", use: "sig", alg: "RS256" }] });
          if (url.pathname === "/token") {
            exchanges += 1;
            assert.ok(init.body.get("code_verifier"), "actual Auth.js PKCE verifier is present");
            const id_token = await new SignJWT({ sub: "external-google-subject", email: canonical.email, email_verified: verifiedEmail, hd: hostedDomain, name: "Fixture" })
              .setProtectedHeader({ alg: "RS256", kid: "fixture-key" }).setIssuer(issuer).setAudience(invalidAudience ? "wrong-audience" : "fixture-client")
              .setIssuedAt().setExpirationTime("5m").sign(privateKey);
            return Response.json({ access_token: "fixture-only-access", token_type: "Bearer", expires_in: 300, id_token });
          }
          throw new Error("UNEXPECTED_FIXTURE_ENDPOINT");
        },
      });
      const conf = { ...coreConfig(), providers: [provider] };
      async function oauthCallback() {
        const csrf = await Auth(new Request(`${BASE}/api/auth/csrf`), conf);
        const { csrfToken } = await csrf.json();
        const cookies = new Map(csrf.headers.getSetCookie().map((header) => {
          const pair = header.split(";", 1)[0]; const index = pair.indexOf("="); return [pair.slice(0, index), pair.slice(index + 1)];
        }));
        const signin = await Auth(new Request(`${BASE}/api/auth/signin/google`, {
          method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", "X-Auth-Return-Redirect": "1", cookie: [...cookies].map(([k,v]) => `${k}=${v}`).join("; ") },
          body: new URLSearchParams({ csrfToken, callbackUrl: `${BASE}/dashboard` }),
        }), conf);
        const authorization = new URL((await signin.json()).url);
        assert.equal(authorization.origin, issuer);
        assert.ok(authorization.searchParams.get("code_challenge"));
        for (const header of signin.headers.getSetCookie()) {
          const pair = header.split(";", 1)[0]; const index = pair.indexOf("="); cookies.set(pair.slice(0, index), pair.slice(index + 1));
        }
        const query = new URLSearchParams({ code: "fixture-only-code" });
        if (authorization.searchParams.has("state")) query.set("state", authorization.searchParams.get("state"));
        const request = new Request(`${BASE}/api/auth/callback/google?${query}`, { headers: { cookie: [...cookies].map(([k,v]) => `${k}=${v}`).join("; ") } });
        return { request, response: await Auth(request, conf) };
      }
      const pair = await oauthCallback();
      assert.equal(pair.response.status, 302); assert.equal(outgoingSession(pair.response).length, 1);
      assert.equal(await journal(pair.request, pair.response, db), pair.response);
      assert.equal(rows.size, 1); assert.equal([...rows.values()][0].actor_id, canonical.id);
      assert.equal(accountLinks.length,1); assert.equal(accountLinks[0].userId,canonical.id);
      assert.equal(accountLinks[0].provider,'google'); assert.equal(accountLinks[0].providerAccountId,'external-google-subject');
      const returning = await oauthCallback();
      assert.equal(outgoingSession(returning.response).length,1); assert.equal(accountLinks.length,1,'returning Google login must reuse the link');
      verifiedEmail = false; rows = new Map();
      const denied = await oauthCallback();
      assert.equal(outgoingSession(denied.response).length, 0);
      assert.equal(await journal(denied.request, denied.response, db), denied.response);
      assert.equal(rows.size, 0); assert.equal(exchanges, 3);
      verifiedEmail = true; hostedDomain = undefined; oauthAccountLinked = false; accountLinks = [];
      const thirdParty = await oauthCallback();
      assert.equal(outgoingSession(thirdParty.response).length,0); assert.equal(accountLinks.length,0);
      assert.equal(await journal(thirdParty.request,thirdParty.response,db),thirdParty.response);assert.equal(rows.size,0);
      hostedDomain = 'example.invalid'; oauthAccountLinked = true;
      verifiedEmail = true; invalidAudience = true;
      const invalid = await oauthCallback();assert.equal(outgoingSession(invalid.response).length,0);
      assert.equal(await journal(invalid.request,invalid.response,db),invalid.response);assert.equal(rows.size,0);
    });
    await t.test("successful replacement accepts Auth.js cleanup headers before new chunks", async () => {
      rows = new Map();
      const token = await encoded(); const response = responseFor(token, true);
      response.headers.append("Set-Cookie", `${COOKIE}=; Max-Age=0; Path=/`);
      assert.equal(await journal(requestFor(), response, db), response); assert.equal(rows.size, 1);
    });
    await t.test("actual GitHub callback journals only the adapter account after code exchange and withholds on journal failure", async () => {
      rows = new Map(); actor = { ...canonical };
      const { default: GitHub } = await import(pathToFileURL(require.resolve('next-auth/providers/github')).href);
      const issuer='https://github.fixture.invalid';let denied=false;
      const provider=GitHub({clientId:'fixture-client',clientSecret:'fixture-only-secret',enterprise:{baseUrl:issuer},
        [customFetch]:async(input)=>{
          const url=new URL(input instanceof Request?input.url:String(input));assert.equal(url.origin,issuer);assert.equal(url.pathname,'/login/oauth/access_token');
          return denied?Response.json({error:'invalid_grant'},{status:400}):Response.json({access_token:'fixture-only-access',token_type:'Bearer',scope:'read:user user:email'});
        },
        userinfo:{url:issuer+'/api/v3/user',request:async(ctx)=>githubVerifiedProfile(ctx,async(url,options)=>{
          assert.equal(options.headers.Authorization,'Bearer fixture-only-access');assert.equal(new URL(url).origin,'https://api.github.com');
          if(new URL(url).pathname==='/user')return Response.json({id:917,login:'fixture-provider',name:'Fixture',email:'untrusted-display@example.invalid',avatar_url:null});
          assert.equal(new URL(url).pathname,'/user/emails');return Response.json([{email:canonical.email,primary:true,verified:true}]);
        })},
      });
      const conf={...coreConfig(),providers:[provider]};
      async function callback(){
        const csrf=await Auth(new Request(`${BASE}/api/auth/csrf`),conf);const {csrfToken}=await csrf.json();
        const cookies=new Map();const take=(response)=>{for(const header of response.headers.getSetCookie()){const pair=header.split(';',1)[0];const at=pair.indexOf('=');cookies.set(pair.slice(0,at),pair.slice(at+1));}};take(csrf);
        const signin=await Auth(new Request(`${BASE}/api/auth/signin/github`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','X-Auth-Return-Redirect':'1',cookie:[...cookies].map(([k,v])=>`${k}=${v}`).join('; ')},body:new URLSearchParams({csrfToken,callbackUrl:`${BASE}/dashboard`})}),conf);
        const authorization=new URL((await signin.json()).url);assert.equal(authorization.origin,issuer);take(signin);
        const query=new URLSearchParams({code:'fixture-code'});if(authorization.searchParams.has('state'))query.set('state',authorization.searchParams.get('state'));
        const request=new Request(`${BASE}/api/auth/callback/github?${query}`,{headers:{cookie:[...cookies].map(([k,v])=>`${k}=${v}`).join('; ')}});
        return {request,response:await Auth(request,conf)};
      }
      const success=await callback();assert.equal(outgoingSession(success.response).length,1);
      assert.equal(await journal(success.request,success.response,db),success.response);assert.equal(rows.size,1);assert.equal([...rows.values()][0].actor_id,canonical.id);
      fail=true;const unavailable=await callback();assert.equal(outgoingSession(unavailable.response).length,1);
      const blocked=await journal(unavailable.request,unavailable.response,db);assert.equal(blocked.status,503);assert.deepEqual(blocked.headers.getSetCookie(),[]);assert.equal(rows.size,1);fail=false;
      denied=true;const failed=await callback();assert.equal(outgoingSession(failed.response).length,0);assert.equal(await journal(failed.request,failed.response,db),failed.response);assert.equal(rows.size,1);
    });
    await t.test("client session updates cannot replace the canonical identity, role or signed-token fields", async () => {
      actor={...canonical,image:null};queries=[];
      const original={id:canonical.id,sub:canonical.id,role:'USER',jti:'fixture-jti',iat:123,exp:456};
      const refreshed=await config.callbacks.jwt({token:{...original},trigger:'update',session:{id:'other-fixture',sub:'other-fixture',role:'SUPER_ADMIN',jti:'attacker',iat:999,exp:999999,name:'client-name',email:'client@example.invalid'}});
      assert.equal(refreshed.id,canonical.id);assert.equal(refreshed.sub,canonical.id);assert.equal(refreshed.role,'USER');assert.equal(refreshed.jti,original.jti);assert.equal(refreshed.iat,original.iat);assert.equal(refreshed.exp,original.exp);assert.equal(refreshed.name,canonical.name);assert.equal(refreshed.email,canonical.email);
      assert.deepEqual(queries.at(-1).where,{id:canonical.id});
      actor=null;await assert.rejects(config.callbacks.jwt({token:{...original},trigger:'update',session:{id:'other-fixture'}}),/SESSION_ACTOR_UNAVAILABLE/);actor={...canonical};
    });
    await t.test("tampered, expired and wrong-key sessions are withheld without customer details", async () => {
      rows = new Map();
      for (const token of ["tampered.invalid.token", await encoded({}, { maxAge: -120 }), await encoded({}, { secret: randomBytes(32).toString("hex") })]) {
        const response = await journal(requestFor(), responseFor(token), db);
        assert.equal(response.status, 503); assert.equal(response.headers.getSetCookie().length, 0);
      }
      assert.equal(rows.size, 0);
    });
    await t.test("missing actor and stale role token cannot release a new session", async () => {
      rows = new Map();
      for (const nextActor of [null, { ...canonical, role: "SUPER_ADMIN" }]) {
        actor = nextActor;
        const response = await journal(requestFor(), responseFor(await encoded()), db);
        assert.equal(response.status, 503); assert.equal(response.headers.getSetCookie().length, 0);
      }
      actor = { ...canonical }; assert.equal(rows.size, 0);
    });
    await t.test("platform administrator roles are allowed but excluded from customer telemetry", async () => {
      rows = new Map();
      actor = { ...canonical, role: "SUPER_ADMIN" };
      let response = responseFor(await encoded({ role: "SUPER_ADMIN" }));
      assert.equal(await journal(requestFor(), response, db), response);
      actor = { ...canonical, role: "ADMIN" };
      response = responseFor(await encoded({ role: "ADMIN" }));
      assert.equal(await journal(requestFor(), response, db), response);
      assert.equal(rows.size, 2); assert.ok([...rows.values()].every(row => row.excluded === true)); actor = { ...canonical };
    });
    await t.test("a verified ordinary account requires no organization membership", async () => {
      rows = new Map(); actor = { ...canonical, businessId: null };
      const response = responseFor(await encoded({ businessId: null }));
      assert.equal(await journal(requestFor(), response, db), response);
      assert.equal([...rows.values()][0].excluded, false); actor = { ...canonical };
    });
    await t.test("platform owner is excluded at write time without excluding tenant organization roles", async () => {
      rows = new Map(); actor = { ...canonical, email: "hikmet044@gmail.com" };
      const response = responseFor(await encoded());
      assert.equal(await journal(requestFor(), response, db), response);
      assert.equal(rows.size, 1); assert.equal([...rows.values()][0].excluded, true);
      actor = { ...canonical };
    });
    await t.test("same event keeps original eligibility after role/account changes and never mutates history", async () => {
      rows = new Map(); actor = { ...canonical };
      const response = responseFor(await encoded());
      assert.equal(await journal(requestFor(), response, db), response);
      const original = [...rows.values()][0];
      actor = { ...canonical, email: "hikmet044@gmail.com" };
      assert.equal(await journal(requestFor(), response, db), response);
      assert.equal(rows.size, 1); assert.equal([...rows.values()][0], original); assert.equal(original.excluded, false);
      actor = null;
      assert.equal((await journal(requestFor(), response, db)).status, 503);
      assert.equal(rows.size, 1); assert.equal([...rows.values()][0], original);
      actor = { ...canonical };
    });
    await t.test("an event identity conflict withholds the new session and rolls back", async () => {
      rows = new Map(); actor = { ...canonical };
      const response = responseFor(await encoded());
      assert.equal(await journal(requestFor(), response, db), response);
      const original = [...rows.values()][0];
      rows.set(original.event_id, { ...original, actor_id: "other-fixture" });
      const result = await journal(requestFor(), response, db);
      assert.equal(result.status, 503); assert.deepEqual(result.headers.getSetCookie(), []);
      assert.equal(rows.size, 1);
    });
    await t.test("ordinary session refresh and unchanged session cookie are not new logins", async () => {
      rows = new Map(); const token = await encoded();
      const request = new Request(`${BASE}/api/auth/session`, { headers: { cookie: `${COOKIE}=${token}` } });
      const response = await Auth(request, coreConfig());
      assert.equal(response.status, 200); assert.equal(outgoingSession(response).length, 1);
      assert.equal(await journal(request, response, db), response);
      const echoed = responseFor(token);
      assert.equal(await journal(requestFor("callback/credentials", `${COOKIE}=${token}`), echoed, db), echoed);
      assert.equal(rows.size, 0);
    });
    await t.test("provider redirects, failed callback and cookie clearing are not counted", async () => {
      rows = new Map();
      for (const response of [new Response(null, { status: 302, headers: { Location: `${BASE}/giris?error=google` } }), new Response(null, { status: 400 }), new Response(null, { status: 302, headers: { "Set-Cookie": `${COOKIE}=; Max-Age=0` } })]) {
        assert.equal(await journal(requestFor("callback/google"), response, db), response);
      }
      assert.equal(rows.size, 0);
    });
    await t.test("gapped or ambiguous cookie chunks cannot be treated as a verified issuance", async () => {
      rows = new Map();
      for (const headers of [
        [["Set-Cookie", `${COOKIE}.0=first`], ["Set-Cookie", `${COOKIE}.2=last`]],
        [["Set-Cookie", `${COOKIE}=one`], ["Set-Cookie", `${COOKIE}.0=two`]],
      ]) {
        const response = await journal(requestFor(), new Response(null, { status: 302, headers }), db);
        assert.equal(response.status, 503); assert.deepEqual(response.headers.getSetCookie(), []);
      }
      assert.equal(rows.size, 0);
    });
    await t.test("OAuth/browser journal failure returns a retryable response without new or deletion cookies", async () => {
      rows = new Map(); fail = true;
      const request = new Request(`${BASE}/api/auth/callback/google`);
      const response = await journal(request, responseFor(await encoded()), db);
      assert.equal(response.status, 503); assert.equal(response.headers.get("Retry-After"), "5");
      assert.deepEqual(response.headers.getSetCookie(), []); assert.match(await response.text(), /yeniden deneyin/);
      fail = false;
    });
    await t.test("legacy NEXTAUTH_SECRET is supported with the same precedence as NextAuth", async () => {
      rows = new Map(); delete process.env.AUTH_SECRET; process.env.NEXTAUTH_SECRET = secret;
      const response = responseFor(await encoded());
      assert.equal(await journal(requestFor(), response, db), response); assert.equal(rows.size, 1);
      process.env.AUTH_SECRET = secret;
    });
    assert.ok(warnings.every((args) => args.length === 1 && args[0] === "[login_events] session issuance withheld: durable journal unavailable"));
  } finally {
    console.warn = previousWarn;
    for (const [key, value] of Object.entries(saved)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  }
});
