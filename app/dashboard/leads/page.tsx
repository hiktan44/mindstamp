import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Mail, Phone, Calendar } from 'lucide-react'

export default async function LeadsPage() {
  const session = await auth()
  if (!session?.user) redirect('/giris')

  // Get leads for videos owned by the user
  const leads = await prisma.lead.findMany({
    where: {
      video: {
        userId: session.user.id
      }
    },
    include: {
      video: {
        select: { title: true }
      }
    },
    orderBy: { capturedAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kazanılan Müşteriler (Leads)</h1>
          <p className="text-muted-foreground">Videolarınızdan toplanan müşteri bilgileri.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Toplanan Bilgiler ({leads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Henüz hiçbir müşteri verisi toplanmadı.</p>
              <p className="text-sm mt-2">Video ayarlarından "Lead Capture" özelliğini aktif ettiğinizden emin olun.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-3">İsim</th>
                    <th className="px-4 py-3">E-posta</th>
                    <th className="px-4 py-3">Telefon</th>
                    <th className="px-4 py-3">Geldiği Video</th>
                    <th className="px-4 py-3">Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead: any) => (
                    <tr key={lead.id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {lead.name || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {lead.email}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {lead.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {lead.phone}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3">{lead.video.title}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(lead.capturedAt).toLocaleDateString('tr-TR')}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
