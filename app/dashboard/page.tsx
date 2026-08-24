'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Video, Plus, BarChart3, Users, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n'

const getQuickStats = (t: (key: string) => string) => [
  {
    title: t('dashboard.total_videos'),
    value: '0',
    description: t('dashboard.video_library'),
    icon: Video,
    color: 'text-indigo-600',
    bg: 'bg-indigo-100',
  },
  {
    title: t('dashboard.total_views'),
    value: '0',
    description: t('dashboard.last_30_days'),
    icon: BarChart3,
    color: 'text-sky-600',
    bg: 'bg-sky-100',
  },
  {
    title: t('dashboard.unique_viewers'),
    value: '0',
    description: t('dashboard.last_30_days'),
    icon: Users,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
  },
  {
    title: t('dashboard.avg_engagement'),
    value: '%0',
    description: t('dashboard.avg'),
    icon: TrendingUp,
    color: 'text-amber-600',
    bg: 'bg-amber-100',
  },
]

const getQuickActions = (t: (key: string) => string) => [
  {
    title: t('dashboard.new_video'),
    description: t('dashboard.new_video_desc'),
    icon: Plus,
    href: '/dashboard/videos/new',
    variant: 'default' as const,
  },
  {
    title: t('dashboard.view_videos'),
    description: t('dashboard.view_videos_desc'),
    icon: Video,
    href: '/dashboard/videos',
    variant: 'outline' as const,
  },
]

export default function DashboardPage() {
  const { t } = useT()

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
          {t('dashboard.nav.dashboard')}
        </h2>
        <p className="text-muted-foreground">
          {t('dashboard.welcome')}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {getQuickStats(t).map((stat) => (
          <Card key={stat.title} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', stat.bg)}>
                <stat.icon className={cn('h-5 w-5', stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={cn('text-2xl font-bold', stat.color)}>{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {getQuickActions(t).map((action) => (
          <Card key={action.title} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <action.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle>{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href={action.href} className="w-full">
                <Button
                  variant={action.variant}
                  className="w-full"
                >
                  {action.title === t('dashboard.new_video') ? t('dashboard.start') : t('dashboard.view')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.guide_title')}</CardTitle>
          <CardDescription>
            {t('dashboard.guide_desc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                1
              </span>
              <span>
                <strong className="text-foreground">{t('dashboard.guide_step1_title')}</strong>{' '}
                {t('dashboard.guide_step1_desc')}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                2
              </span>
              <span>
                <strong className="text-foreground">{t('dashboard.guide_step2_title')}</strong>{' '}
                {t('dashboard.guide_step2_desc')}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                3
              </span>
              <span>
                <strong className="text-foreground">{t('dashboard.guide_step3_title')}</strong>{' '}
                {t('dashboard.guide_step3_desc')}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                4
              </span>
              <span>
                <strong className="text-foreground">{t('dashboard.guide_step4_title')}</strong>{' '}
                {t('dashboard.guide_step4_desc')}
              </span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
