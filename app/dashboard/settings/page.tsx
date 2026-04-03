import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { revalidatePath } from 'next/cache'

async function updateProfile(formData: FormData) {
  'use server'
  const session = await auth()
  if (!session?.user?.email) return
  
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  
  await prisma.user.update({
    where: { email: session.user.email },
    data: { name, phone }
  })
  
  revalidatePath('/dashboard/settings')
}

export default async function SettingsPage() {
  const session = await auth()
  
  const user = session?.user?.email ? await prisma.user.findUnique({
    where: { email: session.user.email }
  }) : null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Ayarlar</h2>
        <p className="text-muted-foreground">
          Hesap bilgilerinizi ve proje tercihlerinizi yapılandırın.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profil Bilgileri</CardTitle>
            <CardDescription>
              Kişisel bilgilerinizi buradan güncelleyebilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-posta Adresi (Değiştirilemez)</Label>
                <Input id="email" type="email" disabled value={user?.email || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Ad Soyad</Label>
                <Input id="name" name="name" defaultValue={user?.name || ''} placeholder="Adınız Soyadınız" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon Numarası</Label>
                <Input id="phone" name="phone" defaultValue={user?.phone || ''} placeholder="+90 555 123 4567" />
              </div>
              <Button type="submit">Değişiklikleri Kaydet</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hesap Detayları</CardTitle>
            <CardDescription>
              Plan ve rol bilgileriniz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Mevcut Rol</div>
              <div className="text-2xl font-bold">{user?.role}</div>
            </div>
            <div className="rounded-lg border p-4 space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Kayıt Tarihi</div>
              <div className="text-lg font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : '-'}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
