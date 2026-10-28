import type { GitHubProfile } from 'next-auth/providers/github'

/** Provider access token only; no credentials or provider responses are logged. */
export async function githubVerifiedProfile(
  { tokens }: { tokens: { access_token?: string } },
  request: typeof fetch = fetch,
): Promise<GitHubProfile> {
  if (typeof tokens.access_token !== 'string' || !tokens.access_token) throw new Error('GITHUB_TOKEN_UNAVAILABLE')
  const options: RequestInit = {
    headers: { Authorization: `Bearer ${tokens.access_token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'interaktiff-auth' },
    signal: AbortSignal.timeout(8000), redirect: 'error',
  }
  async function json(url: string): Promise<unknown> {
    const response = await request(url, options)
    if (!response.ok) throw new Error('GITHUB_PROFILE_UNAVAILABLE')
    return response.json()
  }
  async function primaryEmail(): Promise<string> {
    for (let page = 1; page <= 10; page += 1) {
      const rows = await json(`https://api.github.com/user/emails?per_page=100&page=${page}`)
      if (!Array.isArray(rows) || rows.length > 100) throw new Error('GITHUB_EMAIL_UNVERIFIED')
      const primary = rows.find((row: unknown) => row !== null && typeof row === 'object' && 'primary' in row && row.primary === true)
      if (primary) {
        if (primary.verified !== true || typeof primary.email !== 'string' || !primary.email.trim()) throw new Error('GITHUB_EMAIL_UNVERIFIED')
        return primary.email.trim().toLowerCase()
      }
      if (rows.length < 100) break
    }
    throw new Error('GITHUB_EMAIL_UNVERIFIED')
  }
  const [profile, email] = await Promise.all([json('https://api.github.com/user'), primaryEmail()])
  if (!profile || typeof profile !== 'object' || !('id' in profile) || !Number.isSafeInteger(profile.id) || Number(profile.id) < 1 || !('login' in profile) || typeof profile.login !== 'string' || !profile.login) throw new Error('GITHUB_SUBJECT_UNVERIFIED')
  return { ...profile, email } as GitHubProfile
}
