import test, { beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import vm from 'node:vm'
import ts from 'typescript'

const source = await fs.readFile(new URL('../lib/auth.ts', import.meta.url), 'utf8')
const route = await fs.readFile(new URL('../app/api/videos/[id]/route.ts', import.meta.url), 'utf8')
let config, session, users, failDatabase, reads, mutations
const prisma = {
  user: { findUnique: async ({ where, select }) => {
    reads.push({ where, select })
    if (failDatabase) throw new Error('Deneme veritabanı erişilemiyor')
    return users.get(where.id) ?? null
  } },
  video: {
    findUnique: async ({ where }) => where.id === 'fixture-video' ? { id: where.id, userId: 'owner' } : null,
    update: async () => { mutations++; return {} },
    delete: async () => { mutations++ }
  }
}
const context = vm.createContext({ console, process: { env: {} }, Date })
function synthetic(exports) {
  return new vm.SyntheticModule(Object.keys(exports), function() {
    for (const [key, value] of Object.entries(exports)) this.setExport(key, value)
  }, { context })
}
const deps = {
  'next-auth': synthetic({ default: options => { config = options; return { handlers: {}, signIn() {}, signOut() {}, auth: async () => session } } }),
  'next-auth/providers/credentials': synthetic({ default: options => options }),
  'next-auth/providers/google': synthetic({ default: options => options }),
  'next-auth/providers/github': synthetic({ default: options => options }),
  '@auth/prisma-adapter': synthetic({ PrismaAdapter: () => ({}) }),
  './db': synthetic({ prisma }),
  'bcryptjs': synthetic({ default: { compare: async () => false } }),
  'next/server': synthetic({ NextResponse: { json: (body, options = {}) => ({ status: options.status ?? 200, body }) } }),
  '@/lib/db': synthetic({ prisma }),
  '@/lib/validators/video': synthetic({ videoPatchSchema: { safeParse: () => ({ success: true, data: { title: 'Deneme' } }) } }),
  '@/lib/video/access': synthetic({ normalizeVideoSettingsForSave: async settings => settings }),
}
async function compile(sourceText) {
  const output = ts.transpileModule(sourceText, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext }, reportDiagnostics: true })
  assert.equal(output.diagnostics.filter(d => d.category === ts.DiagnosticCategory.Error).length, 0)
  const module = new vm.SourceTextModule(output.outputText, { context })
  await module.link(specifier => { assert.ok(deps[specifier], `Beklenmeyen bağımlılık: ${specifier}`); return deps[specifier] })
  await module.evaluate()
  return module
}
await compile(source)
deps['@/lib/auth'] = synthetic({ auth: async () => session })
const video = (await compile(route)).namespace

beforeEach(() => {
  session = null
  failDatabase = false
  reads = []
  mutations = 0
  users = new Map([
    ['reader', { id: 'reader', role: 'USER', name: 'Okuyucu', email: 'reader@example.invalid', image: null }],
    ['owner', { id: 'owner', role: 'USER', name: 'Sahip', email: 'owner@example.invalid', image: null }],
    ['admin', { id: 'admin', role: 'ADMIN', name: 'Yönetici', email: 'admin@example.invalid', image: null }],
  ])
})
async function signedIn(id = 'reader') {
  return config.callbacks.jwt({ token: { sub: id }, user: { id }, trigger: 'signIn' })
}
async function expose(token) {
  if (!token) { session = null; return null }
  session = await config.callbacks.session({ session: { user: {} }, token })
  return session
}
const params = { params: Promise.resolve({ id: 'fixture-video' }) }

test('yeni giriş kimlik, rol ve profili sunucu kaydından üretir', async () => {
  const token = await config.callbacks.jwt({ token: { sub: 'reader', role: 'ADMIN' }, user: { id: 'reader', role: 'ADMIN' } })
  assert.equal(token.id, 'reader')
  assert.equal(token.sub, 'reader')
  assert.equal(token.role, 'USER')
  assert.equal(token.authVersion, 2)
  assert.equal((await expose(token)).user.role, 'USER')
  assert.equal(reads[0].select.password, undefined)
})
test('istemci güncellemesi başka kimlik, sub, rol veya profil atayamaz', async () => {
  const token = await signedIn()
  const updated = await config.callbacks.jwt({ token, trigger: 'update', session: { id: 'owner', sub: 'admin', role: 'ADMIN', name: 'Sahte', email: 'owner@example.invalid', authVersion: 2, user: { id: 'admin', role: 'ADMIN' } } })
  assert.equal(updated.id, 'reader')
  assert.equal(updated.sub, 'reader')
  assert.equal(updated.role, 'USER')
  assert.equal(updated.name, 'Okuyucu')
  assert.equal(updated.email, 'reader@example.invalid')
})
test('mevcut yönetici yetkisinin iptali sonraki oturum okumasında uygulanır', async () => {
  const token = await signedIn('admin')
  users.get('admin').role = 'USER'
  const updated = await config.callbacks.jwt({ token })
  assert.equal(updated.role, 'USER')
})
test('profil güncellemesi istemci gövdesinden değil veritabanından okunur', async () => {
  const token = await signedIn()
  users.get('reader').name = 'Yeni Ad'
  const updated = await config.callbacks.jwt({ token, trigger: 'update', session: { name: 'Sahte Ad' } })
  assert.equal(updated.name, 'Yeni Ad')
})
test('silinen hesap oturumu iptal edilir', async () => {
  const token = await signedIn()
  users.delete('reader')
  assert.equal(await config.callbacks.jwt({ token }), null)
})
test('eski veya eksik kimlikli token ve istemcinin sürüm yükseltmesi reddedilir', async () => {
  assert.equal(await config.callbacks.jwt({ token: { sub: 'owner', id: 'owner', role: 'ADMIN' }, trigger: 'update', session: { authVersion: 2 } }), null)
  assert.equal(await config.callbacks.jwt({ token: { authVersion: 2 } }), null)
  assert.equal(reads.length, 0)
})
test('veritabanı hatası eski ayrıcalığı sessizce korumaz', async () => {
  const token = await signedIn('admin')
  failDatabase = true
  await assert.rejects(config.callbacks.jwt({ token }), /veritabanı/)
})
test('oturumsuz video okuma ve yazma reddedilir', async () => {
  for (const method of ['GET', 'PATCH', 'DELETE']) assert.equal((await video[method]({ json: async () => ({}) }, params)).status, 401)
  assert.equal(mutations, 0)
})
test('kimlik güncellemesi başka sahibin videosunu okuma/değiştirme/silme izni vermez', async () => {
  const token = await signedIn()
  await expose(await config.callbacks.jwt({ token, trigger: 'update', session: { id: 'owner', sub: 'owner', role: 'ADMIN' } }))
  for (const method of ['GET', 'PATCH', 'DELETE']) assert.equal((await video[method]({ json: async () => ({}) }, params)).status, 403)
  assert.equal(mutations, 0)
})
test('gerçek sahip kendi videosunu okuyabilir ve değiştirebilir', async () => {
  await expose(await signedIn('owner'))
  assert.equal((await video.GET({}, params)).status, 200)
  assert.equal((await video.PATCH({ json: async () => ({}) }, params)).status, 200)
  assert.equal(mutations, 1)
})
