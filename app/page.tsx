'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Video,
  MousePointerClick,
  BarChart3,
  Sparkles,
  MessageSquare,
  GitBranch,
  Target,
  Upload,
  ArrowRight,
  Check,
  Play,
  Star,
  Menu,
  X,
  Zap,
  Shield,
  Globe,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/* Veri                                                                */
/* ------------------------------------------------------------------ */

const features = [
  {
    icon: MousePointerClick,
    title: 'Tıklanabilir Butonlar',
    desc: "Videonun herhangi bir anına çağrı-eylem butonları ekle; izleyiciyi ürüne, forma ya da bir sonraki bölüme yönlendir.",
  },
  {
    icon: MessageSquare,
    title: 'Sorular & Quizler',
    desc: 'Video içinde çoktan seçmeli sorular sor, cevaba göre farklı yollara dallandır, öğrenmeyi ölç.',
  },
  {
    icon: Target,
    title: 'Hotspot & Sıcak Noktalar',
    desc: 'Görüntü üzerinde tıklanabilir alanlar tanımla; ürün detayları, ipuçları ve gizli içerikler aç.',
  },
  {
    icon: GitBranch,
    title: 'Dallanan Senaryolar',
    desc: 'İzleyicinin seçimine göre videoyu farklı sahnelere yönlendir; kişiye özel akışlar kur.',
  },
  {
    icon: Sparkles,
    title: 'Genie AI Asistan',
    desc: 'Videonun transkripti üzerinde eğitilmiş yapay zeka; izleyicinin sorularını videonun içinde yanıtlar.',
  },
  {
    icon: BarChart3,
    title: 'Detaylı Analitik',
    desc: 'Görüntülenme, tıklama, cevap ve terk noktalarını saniye saniye izle; nelerin işe yaradığını gör.',
  },
  {
    icon: Upload,
    title: 'Kolay İçe Aktarma',
    desc: "MP4, MOV, WEBM yükle ya da YouTube / Vimeo bağlantısını yapıştır — saniyeler içinde başla.",
  },
  {
    icon: Zap,
    title: 'Lead Toplama',
    desc: 'Videonun kritik anında e-posta / form iste; izleyiciyi kesintisiz akışta müşteriye dönüştür.',
  },
]

const steps = [
  {
    n: '01',
    title: 'Videonu ekle',
    desc: 'Dosya yükle ya da YouTube/Vimeo bağlantısını yapıştır. Dönüştürme ve oynatma bizde.',
  },
  {
    n: '02',
    title: 'Etkileşim ekle',
    desc: 'Sürükle-bırak editörle buton, soru, hotspot ve AI’yı istediğin saniyeye yerleştir.',
  },
  {
    n: '03',
    title: 'Paylaş & ölç',
    desc: 'Bağlantıyla paylaş ya da sitene göm. Her tıklamayı, cevabı ve dönüşümü canlı izle.',
  },
]

const useCases = [
  { icon: Globe, t: 'E-ticaret', d: 'Ürün videolarında “Sepete Ekle” butonu ve varyant seçimi.' },
  { icon: Sparkles, t: 'Online Eğitim', d: 'Ders içi quizler, dallanan senaryolar ve tamamlama takibi.' },
  { icon: BarChart3, t: 'Pazarlama', d: 'İnteraktif reklamlar, lead formları ve A/B ölçümü.' },
  { icon: Shield, t: 'Kurumsal Eğitim', d: 'İç eğitimlerde sınav, sertifika ve katılım raporu.' },
]

const faqs = [
  {
    q: 'interaktiff’i kullanmak için teknik bilgi gerekir mi?',
    a: 'Hayır. Sürükle-bırak editörle kod yazmadan buton, soru ve hotspot ekleyebilirsin. Videonu yüklemen yeterli.',
  },
  {
    q: 'Kendi YouTube veya Vimeo videomu kullanabilir miyim?',
    a: 'Evet. Dosya yüklemenin yanında YouTube ve Vimeo bağlantılarını doğrudan yapıştırıp etkileşim ekleyebilirsin.',
  },
  {
    q: 'Videoları siteme gömebilir miyim?',
    a: 'Kesinlikle. Her interaktif video için paylaşım bağlantısı ve gömme (embed) kodu üretilir; kendi sitene saniyeler içinde eklersin.',
  },
  {
    q: 'Ücretsiz planda ne kadar ileri gidebilirim?',
    a: 'Ücretsiz planla platformun tüm temel etkileşimlerini deneyebilir, ilk videolarını yayınlayabilirsin. Kredi kartı istemiyoruz.',
  },
  {
    q: 'Analitik verilerini dışa aktarabilir miyim?',
    a: 'Pro ve Kurumsal planlarda görüntülenme, etkileşim ve lead verilerini CSV olarak dışa aktarabilirsin.',
  },
]

const testimonials = [
  {
    quote:
      'İnteraktif quizler sayesinde eğitim videolarımızda tamamlanma oranı %38 arttı. Kurulumu bir öğleden sonra sürdü.',
    name: 'Elif Demir',
    role: 'Eğitim Müdürü, Akademi+',
  },
  {
    quote:
      'Ürün videolarına “Sepete Ekle” butonu koyduk, videodan gelen satış üç katına çıktı. interaktiff olmadan düşünemiyorum.',
    name: 'Barış Yıldız',
    role: 'Kurucu, TicaretPlus',
  },
  {
    quote:
      'Genie AI, izleyicilerin sorularını videonun içinde yanıtlıyor. Destek taleplerimiz gözle görülür azaldı.',
    name: 'Selin Kaya',
    role: 'Pazarlama Lideri, Bulut360',
  },
]

/* Fiyatlandırma — TRY / USD, aylık / yıllık */
type Plan = {
  name: string
  tagline: string
  priceMonthly: { try: number; usd: number }
  priceAnnual: { try: number; usd: number } // aylık eşdeğer (yıllıkta indirimli)
  features: string[]
  cta: string
  highlighted?: boolean
}

const plans: Plan[] = [
  {
    name: 'Ücretsiz',
    tagline: 'Denemek ve başlamak için',
    priceMonthly: { try: 0, usd: 0 },
    priceAnnual: { try: 0, usd: 0 },
    features: [
      '3 interaktif video',
      'Buton, soru, hotspot',
      'YouTube / Vimeo içe aktarma',
      'Temel analitik',
      'interaktiff filigranı',
    ],
    cta: 'Ücretsiz Başla',
  },
  {
    name: 'Pro',
    tagline: 'Büyüyen ekipler ve içerik üreticileri',
    priceMonthly: { try: 499, usd: 19 },
    priceAnnual: { try: 399, usd: 15 },
    features: [
      'Sınırsız interaktif video',
      'Tüm etkileşim türleri + dallanma',
      'Genie AI asistan',
      'Gelişmiş analitik + CSV dışa aktarma',
      'Lead toplama & form',
      'Filigran yok, özel marka',
    ],
    cta: '14 Gün Ücretsiz Dene',
    highlighted: true,
  },
  {
    name: 'Kurumsal',
    tagline: 'Ölçek, güvenlik ve destek',
    priceMonthly: { try: 1499, usd: 59 },
    priceAnnual: { try: 1199, usd: 47 },
    features: [
      'Pro’daki her şey',
      'Takım & rol yönetimi',
      'SSO ve gelişmiş güvenlik',
      'Öncelikli destek + eğitim',
      'API erişimi & webhooks',
      'Özel entegrasyonlar',
    ],
    cta: 'Bizimle İletişime Geç',
  },
]

/* ------------------------------------------------------------------ */
/* Sayfa                                                               */
/* ------------------------------------------------------------------ */

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [currency, setCurrency] = useState<'try' | 'usd'>('try')
  const [annual, setAnnual] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const money = (v: number) =>
    v === 0 ? '0' : currency === 'try' ? `₺${v}` : `$${v}`

  return (
    <div className="min-h-screen bg-[#0b0713] text-white antialiased selection:bg-fuchsia-500/40">
      {/* arka plan ışıltıları */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-violet-600/25 blur-[140px]" />
        <div className="absolute top-1/3 -right-40 h-[32rem] w-[32rem] rounded-full bg-fuchsia-600/20 blur-[130px]" />
        <div className="absolute bottom-0 -left-40 h-[30rem] w-[30rem] rounded-full bg-indigo-600/20 blur-[130px]" />
      </div>

      <div className="relative">
        {/* ---------------- Nav ---------------- */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0713]/70 backdrop-blur-xl">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
            <Link href="/" className="flex items-center gap-2">
              <Logo />
              <span className="text-lg font-semibold tracking-tight">
                interaktiff
              </span>
            </Link>

            <div className="hidden items-center gap-8 text-sm text-white/70 md:flex">
              <a href="#ozellikler" className="transition hover:text-white">Özellikler</a>
              <a href="#nasil" className="transition hover:text-white">Nasıl Çalışır</a>
              <a href="#fiyat" className="transition hover:text-white">Fiyatlandırma</a>
              <a href="#sss" className="transition hover:text-white">SSS</a>
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <Link
                href="/giris"
                className="text-sm text-white/80 transition hover:text-white"
              >
                Giriş Yap
              </Link>
              <Link href="/kayit">
                <Button className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-white shadow-lg shadow-fuchsia-600/30 hover:opacity-95">
                  Ücretsiz Başla
                </Button>
              </Link>
            </div>

            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-lg p-2 text-white/80 md:hidden"
              aria-label="Menü"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </nav>

          {menuOpen && (
            <div className="border-t border-white/10 px-5 py-4 md:hidden">
              <div className="flex flex-col gap-4 text-sm text-white/80">
                <a href="#ozellikler" onClick={() => setMenuOpen(false)}>Özellikler</a>
                <a href="#nasil" onClick={() => setMenuOpen(false)}>Nasıl Çalışır</a>
                <a href="#fiyat" onClick={() => setMenuOpen(false)}>Fiyatlandırma</a>
                <a href="#sss" onClick={() => setMenuOpen(false)}>SSS</a>
                <Link href="/giris">Giriş Yap</Link>
                <Link href="/kayit">
                  <Button className="w-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600">
                    Ücretsiz Başla
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </header>

        {/* ---------------- Hero ---------------- */}
        <section className="mx-auto max-w-7xl px-5 pt-16 pb-10 md:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
                Yapay zekâ destekli interaktif video platformu
              </span>

              <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
                Videolarını{' '}
                <span className="itf-gradient-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                  tıklanabilir
                </span>{' '}
                deneyimlere dönüştür
              </h1>

              <p className="mt-6 max-w-xl text-lg text-white/70">
                interaktiff ile videolarına buton, soru, hotspot ve yapay zekâ ekle.
                İzleyiciyi izleyen değil <span className="text-white">katılan</span> hâle
                getir; her tıklamayı ölç, dönüşümü artır.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/kayit">
                  <Button
                    size="lg"
                    className="w-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-7 text-base text-white shadow-xl shadow-fuchsia-600/30 hover:opacity-95 sm:w-auto"
                  >
                    Ücretsiz Başla <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
                <a href="#nasil">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full rounded-full border-white/20 bg-white/5 px-7 text-base text-white hover:bg-white/10 sm:w-auto"
                  >
                    <Play className="mr-1 h-4 w-4" /> Nasıl çalışır?
                  </Button>
                </a>
              </div>

              <p className="mt-4 text-xs text-white/50">
                Kredi kartı gerekmez · Saniyeler içinde kurulum
              </p>
            </div>

            {/* interaktif mockup */}
            <HeroMockup />
          </div>
        </section>

        {/* ---------------- Logo şeridi ---------------- */}
        <section className="mx-auto max-w-7xl px-5 py-10">
          <p className="text-center text-xs uppercase tracking-widest text-white/40">
            Eğitim, e-ticaret ve pazarlama ekiplerinin tercihi
          </p>
          <div className="relative mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
            <div className="itf-marquee flex w-max gap-12 opacity-70">
              {[...brandRow, ...brandRow].map((b, i) => (
                <span key={i} className="whitespace-nowrap text-lg font-semibold text-white/60">
                  {b}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Özellikler ---------------- */}
        <section id="ozellikler" className="mx-auto max-w-7xl px-5 py-20">
          <SectionHeading
            eyebrow="Özellikler"
            title="İzleyiciyi harekete geçiren her şey"
            sub="Tek bir editörde; kod yok, karmaşa yok. Videonun içine gömülü, ölçülebilir etkileşimler."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-fuchsia-500/40 hover:bg-white/[0.06]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 ring-1 ring-white/10">
                  <f.icon className="h-5 w-5 text-fuchsia-300" />
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-white/60">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- Nasıl çalışır + video ---------------- */}
        <section id="nasil" className="mx-auto max-w-7xl px-5 py-20">
          <SectionHeading
            eyebrow="Nasıl Çalışır"
            title="Üç adımda interaktif video"
            sub="Yüklemekten yayınlamaya, dakikalar içinde."
          />

          <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-center">
            <ol className="space-y-6">
              {steps.map((s) => (
                <li key={s.n} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <span className="bg-gradient-to-br from-violet-400 to-fuchsia-400 bg-clip-text text-2xl font-bold text-transparent">
                    {s.n}
                  </span>
                  <div>
                    <h3 className="font-semibold">{s.title}</h3>
                    <p className="mt-1 text-sm text-white/60">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>

            {/* Demo video */}
            <div className="relative rounded-3xl border border-white/10 bg-black/40 p-2 shadow-2xl shadow-fuchsia-900/20">
              <div className="overflow-hidden rounded-2xl">
                <video
                  className="aspect-video w-full"
                  controls
                  playsInline
                  preload="metadata"
                  poster="/interaktiff-demo-poster.svg"
                >
                  <source src="/interaktiff-demo.mp4" type="video/mp4" />
                </video>
              </div>
              <p className="px-3 py-3 text-center text-xs text-white/50">
                interaktiff ile üretilmiş kısa tanıtım
              </p>
            </div>
          </div>
        </section>

        {/* ---------------- Kullanım alanları ---------------- */}
        <section className="mx-auto max-w-7xl px-5 py-20">
          <SectionHeading
            eyebrow="Her sektör için"
            title="Bir video, sonsuz olasılık"
            sub="Eğitimden e-ticarete, izleyiciyi katılımcıya dönüştür."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {useCases.map((u) => (
              <div key={u.t} className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-6">
                <u.icon className="h-6 w-6 text-fuchsia-300" />
                <h3 className="mt-4 font-semibold">{u.t}</h3>
                <p className="mt-2 text-sm text-white/60">{u.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- Fiyatlandırma ---------------- */}
        <section id="fiyat" className="mx-auto max-w-7xl px-5 py-20">
          <SectionHeading
            eyebrow="Fiyatlandırma"
            title="Sana uygun bir plan var"
            sub="İstediğin zaman yükselt ya da iptal et. Gizli ücret yok."
          />

          {/* toggler'lar */}
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-sm">
              <button
                onClick={() => setAnnual(false)}
                className={`rounded-full px-4 py-1.5 transition ${!annual ? 'bg-white text-[#0b0713]' : 'text-white/70'}`}
              >
                Aylık
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`rounded-full px-4 py-1.5 transition ${annual ? 'bg-white text-[#0b0713]' : 'text-white/70'}`}
              >
                Yıllık <span className="text-fuchsia-500">−20%</span>
              </button>
            </div>

            <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-sm">
              <button
                onClick={() => setCurrency('try')}
                className={`rounded-full px-4 py-1.5 transition ${currency === 'try' ? 'bg-white text-[#0b0713]' : 'text-white/70'}`}
              >
                ₺ TRY
              </button>
              <button
                onClick={() => setCurrency('usd')}
                className={`rounded-full px-4 py-1.5 transition ${currency === 'usd' ? 'bg-white text-[#0b0713]' : 'text-white/70'}`}
              >
                $ USD
              </button>
            </div>
          </div>

          <div className="mt-12 grid items-start gap-6 lg:grid-cols-3">
            {plans.map((p) => {
              const price = annual ? p.priceAnnual : p.priceMonthly
              const val = currency === 'try' ? price.try : price.usd
              return (
                <div
                  key={p.name}
                  className={`relative rounded-3xl border p-7 ${
                    p.highlighted
                      ? 'border-fuchsia-500/50 bg-gradient-to-b from-fuchsia-600/15 to-violet-600/5 shadow-2xl shadow-fuchsia-900/30'
                      : 'border-white/10 bg-white/[0.03]'
                  }`}
                >
                  {p.highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-1 text-xs font-semibold">
                      En popüler
                    </span>
                  )}
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <p className="mt-1 text-sm text-white/55">{p.tagline}</p>

                  <div className="mt-5 flex items-end gap-1">
                    <span className="text-4xl font-bold">{money(val)}</span>
                    {val !== 0 && (
                      <span className="mb-1 text-sm text-white/50">/ ay</span>
                    )}
                  </div>
                  {val !== 0 && annual && (
                    <p className="mt-1 text-xs text-fuchsia-300">Yıllık faturalandırılır</p>
                  )}

                  <Link href={p.name === 'Kurumsal' ? '/kayit' : '/kayit'}>
                    <Button
                      className={`mt-6 w-full rounded-full ${
                        p.highlighted
                          ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:opacity-95'
                          : 'bg-white/10 text-white hover:bg-white/15'
                      }`}
                    >
                      {p.cta}
                    </Button>
                  </Link>

                  <ul className="mt-6 space-y-3 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-white/75">
                        <Check className="mt-0.5 h-4 w-4 flex-none text-fuchsia-400" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </section>

        {/* ---------------- Testimonials ---------------- */}
        <section className="mx-auto max-w-7xl px-5 py-20">
          <SectionHeading
            eyebrow="Kullanıcılar ne diyor"
            title="Sonuçlar kendini gösteriyor"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex gap-0.5 text-fuchsia-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm text-white/80">“{t.quote}”</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-semibold">
                    {t.name.charAt(0)}
                  </span>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-white/50">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* ---------------- SSS ---------------- */}
        <section id="sss" className="mx-auto max-w-3xl px-5 py-20">
          <SectionHeading eyebrow="SSS" title="Merak edilenler" />
          <div className="mt-10 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03]">
            {faqs.map((f, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-medium">{f.q}</span>
                  <span className={`transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>
                    <X className="h-4 w-4 rotate-45 text-fuchsia-400" />
                  </span>
                </button>
                {openFaq === i && (
                  <p className="px-6 pb-5 text-sm text-white/65">{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- CTA ---------------- */}
        <section className="mx-auto max-w-7xl px-5 py-16">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-600/25 via-fuchsia-600/20 to-indigo-600/25 p-10 text-center md:p-16">
            <div className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-fuchsia-500/30 blur-3xl" />
            <h2 className="relative text-3xl font-bold md:text-4xl">
              İlk interaktif videonu bugün yayınla
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-white/70">
              Ücretsiz başla, kredi kartı gerekmez. Dakikalar içinde izleyicilerini
              katılımcıya dönüştür.
            </p>
            <div className="relative mt-8 flex justify-center">
              <Link href="/kayit">
                <Button
                  size="lg"
                  className="rounded-full bg-white px-8 text-base font-semibold text-[#0b0713] hover:bg-white/90"
                >
                  Ücretsiz Başla <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ---------------- Footer ---------------- */}
        <footer className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 py-10 md:flex-row">
            <div className="flex items-center gap-2">
              <Logo />
              <span className="font-semibold">interaktiff</span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm text-white/60">
              <a href="#ozellikler" className="hover:text-white">Özellikler</a>
              <a href="#fiyat" className="hover:text-white">Fiyatlandırma</a>
              <Link href="/giris" className="hover:text-white">Giriş Yap</Link>
              <Link href="/kvkk" className="hover:text-white">KVKK</Link>
              <Link href="/gizlilik" className="hover:text-white">Gizlilik</Link>
            </div>
            <p className="text-xs text-white/40">
              © {new Date().getFullYear()} interaktiff
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

const brandRow = ['Akademi+', 'TicaretPlus', 'Bulut360', 'EduLab', 'MarkaVideo', 'SatışPro', 'Kursify']

/* ------------------------------------------------------------------ */
/* Küçük bileşenler                                                    */
/* ------------------------------------------------------------------ */

function Logo() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-fuchsia-600/40">
      <Video className="h-4 w-4 text-white" />
    </span>
  )
}

function SectionHeading({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string
  title: string
  sub?: string
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="text-xs font-semibold uppercase tracking-widest text-fuchsia-400">
        {eyebrow}
      </span>
      <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
      {sub && <p className="mt-4 text-white/60">{sub}</p>}
    </div>
  )
}

/* Hero'daki canlı interaktif video mockup'ı */
function HeroMockup() {
  return (
    <div className="relative">
      <div className="itf-float-slow relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-3 shadow-2xl shadow-fuchsia-900/30 backdrop-blur">
        {/* video alanı */}
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-[#1a0f2e] to-fuchsia-900">
          {/* sahte sahne parıltıları */}
          <div className="absolute inset-0 opacity-60 [background:radial-gradient(circle_at_30%_30%,rgba(139,92,246,0.5),transparent_45%),radial-gradient(circle_at_75%_60%,rgba(217,70,239,0.45),transparent_45%)]" />

          {/* orta oynat butonu */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/15 backdrop-blur">
              <span className="itf-ring absolute inset-0 rounded-full border border-white/40" />
              <Play className="h-6 w-6 fill-white text-white" />
            </span>
          </div>

          {/* quiz kartı */}
          <div className="itf-rise absolute left-4 top-4 w-48 rounded-xl border border-white/15 bg-black/50 p-3 backdrop-blur" style={{ animationDelay: '0.3s' }}>
            <p className="text-[11px] font-medium text-white/90">Hangisini tercih edersin?</p>
            <div className="mt-2 space-y-1.5">
              <div className="rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-500 px-2 py-1 text-[11px] font-medium">A · Pro Plan</div>
              <div className="rounded-md bg-white/10 px-2 py-1 text-[11px] text-white/80">B · Ücretsiz</div>
            </div>
          </div>

          {/* AI sohbet balonu */}
          <div className="itf-rise absolute bottom-4 right-4 flex w-44 items-start gap-2 rounded-xl border border-white/15 bg-black/50 p-3 backdrop-blur" style={{ animationDelay: '0.8s' }}>
            <Sparkles className="mt-0.5 h-4 w-4 flex-none text-fuchsia-300" />
            <p className="text-[11px] text-white/85">Bu videoda anlatılanları özetler misin?</p>
          </div>

          {/* CTA buton + tıklayan cursor */}
          <div className="absolute bottom-4 left-4">
            <div className="itf-float rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-1.5 text-[11px] font-semibold shadow-lg shadow-fuchsia-600/40">
              Sepete Ekle
            </div>
          </div>
          <div className="itf-cursor pointer-events-none absolute bottom-6 left-6">
            <MousePointerClick className="h-5 w-5 text-white drop-shadow" />
          </div>

          {/* ilerleme çubuğu */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
            <div className="h-full w-2/3 bg-gradient-to-r from-violet-400 to-fuchsia-400" />
          </div>
        </div>
      </div>

      {/* yüzen istatistik rozetleri */}
      <div className="itf-float absolute -left-4 top-10 hidden rounded-xl border border-white/10 bg-[#140b22]/90 px-3 py-2 text-xs shadow-xl backdrop-blur sm:block">
        <div className="font-semibold text-fuchsia-300">+38%</div>
        <div className="text-white/60">tamamlanma</div>
      </div>
      <div className="itf-float-slow absolute -right-3 bottom-8 hidden rounded-xl border border-white/10 bg-[#140b22]/90 px-3 py-2 text-xs shadow-xl backdrop-blur sm:block">
        <div className="font-semibold text-violet-300">3.2x</div>
        <div className="text-white/60">dönüşüm</div>
      </div>
    </div>
  )
}
