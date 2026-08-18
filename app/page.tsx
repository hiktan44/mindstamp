'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
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
  Plus,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/* Veri                                                                */
/* ------------------------------------------------------------------ */

const features = [
  {
    icon: MousePointerClick,
    title: 'Tıklanabilir butonlar',
    desc: 'Videonun istediğin anına çağrı-eylem butonu koy; izleyiciyi ürüne, forma ya da bir sonraki bölüme gönder.',
    bg: 'bg-[#FF6B35]',
    text: 'text-white',
  },
  {
    icon: MessageSquare,
    title: 'Sorular & quizler',
    desc: 'Video içinde soru sor, cevaba göre yolu değiştir, öğrenmeyi gerçekten ölç.',
    bg: 'bg-[#FFD166]',
    text: 'text-[#1a1a1a]',
  },
  {
    icon: Target,
    title: 'Hotspot alanları',
    desc: 'Görüntü üzerinde tıklanabilir bölgeler tanımla; ürün detayı, ipucu ve gizli içerik aç.',
    bg: 'bg-[#06D6A0]',
    text: 'text-[#1a1a1a]',
  },
  {
    icon: GitBranch,
    title: 'Dallanan senaryolar',
    desc: 'Herkes aynı videoyu izlemesin. Seçime göre farklı sahnelere dallan, kişiye özel akış kur.',
    bg: 'bg-[#EF476F]',
    text: 'text-white',
  },
  {
    icon: Sparkles,
    title: 'Genie AI asistan',
    desc: 'Videonun transkripti üzerinde eğitilmiş yapay zekâ, izleyicinin sorusunu videonun içinde yanıtlar.',
    bg: 'bg-[#118AB2]',
    text: 'text-white',
  },
  {
    icon: BarChart3,
    title: 'Saniye saniye analitik',
    desc: 'Kim nerede tıkladı, nerede bıraktı, hangi cevabı verdi — hepsini gör.',
    bg: 'bg-[#FFF1E6]',
    text: 'text-[#1a1a1a]',
  },
  {
    icon: Upload,
    title: 'Kolay içe aktarma',
    desc: 'MP4, MOV, WEBM yükle ya da YouTube / Vimeo bağlantısını yapıştır. Hepsi bu.',
    bg: 'bg-[#E9F5DB]',
    text: 'text-[#1a1a1a]',
  },
  {
    icon: Zap,
    title: 'Lead toplama',
    desc: 'Kritik anda e-posta iste. İzleyiciyi akışı bozmadan müşteriye çevir.',
    bg: 'bg-[#1a1a1a]',
    text: 'text-white',
  },
]

const steps = [
  {
    n: '1',
    title: 'Videonu ekle',
    desc: 'Dosya yükle ya da YouTube/Vimeo bağlantısını yapıştır.',
    color: 'bg-[#FF6B35]',
  },
  {
    n: '2',
    title: 'Etkileşimi yerleştir',
    desc: 'Sürükle-bırak editörle buton, soru ve hotspot’u istediğin saniyeye koy.',
    color: 'bg-[#06D6A0]',
  },
  {
    n: '3',
    title: 'Paylaş ve ölç',
    desc: 'Bağlantıyla paylaş ya da sitene göm; her tıklamayı canlı izle.',
    color: 'bg-[#118AB2]',
  },
]

const useCases = [
  { t: 'E-ticaret', d: 'Ürün videosunda “Sepete Ekle”, varyant seçimi, kampanya.', c: 'bg-[#FF6B35]' },
  { t: 'Online eğitim', d: 'Ders içi quiz, dallanan anlatım, tamamlama takibi.', c: 'bg-[#FFD166]' },
  { t: 'Pazarlama', d: 'İnteraktif reklam, lead formu, A/B ölçümü.', c: 'bg-[#EF476F]' },
  { t: 'Kurumsal eğitim', d: 'İç eğitimde sınav, sertifika ve katılım raporu.', c: 'bg-[#06D6A0]' },
]

const faqs = [
  {
    q: 'Teknik bilgi gerekiyor mu?',
    a: 'Hayır. Sürükle-bırak editörle kod yazmadan buton, soru ve hotspot ekleyebilirsin. Videonu yüklemen yeterli.',
  },
  {
    q: 'Kendi YouTube veya Vimeo videomu kullanabilir miyim?',
    a: 'Evet. Dosya yüklemenin yanında YouTube ve Vimeo bağlantılarını doğrudan yapıştırıp üzerine etkileşim ekleyebilirsin.',
  },
  {
    q: 'Videoları siteme gömebilir miyim?',
    a: 'Kesinlikle. Her interaktif video için paylaşım bağlantısı ve gömme kodu üretilir; kendi sitene saniyeler içinde eklersin.',
  },
  {
    q: 'Ücretsiz planda ne kadar ileri gidebilirim?',
    a: 'Ücretsiz planla temel etkileşimlerin hepsini deneyip ilk videolarını yayınlayabilirsin. Kredi kartı istemiyoruz.',
  },
  {
    q: 'Analitik verilerini dışa aktarabilir miyim?',
    a: 'Pro ve Kurumsal planlarda görüntülenme, etkileşim ve lead verilerini CSV olarak dışa aktarabilirsin.',
  },
]

const testimonials = [
  {
    quote:
      'Eğitim videolarımıza quiz koyduk, tamamlanma oranı %38 arttı. Kurulum bir öğleden sonra sürdü.',
    name: 'Elif Demir',
    role: 'Eğitim Müdürü, Akademi+',
    c: 'bg-[#FFD166]',
  },
  {
    quote:
      'Ürün videosuna “Sepete Ekle” butonu koyduk; videodan gelen satış üç katına çıktı.',
    name: 'Barış Yıldız',
    role: 'Kurucu, TicaretPlus',
    c: 'bg-[#06D6A0]',
  },
  {
    quote:
      'Genie AI izleyicinin sorusunu videonun içinde yanıtlıyor. Destek taleplerimiz gözle görülür azaldı.',
    name: 'Selin Kaya',
    role: 'Pazarlama Lideri, Bulut360',
    c: 'bg-[#FF6B35]',
  },
]

type Plan = {
  name: string
  tagline: string
  monthly: { try: number; usd: number }
  annual: { try: number; usd: number }
  limits: string[]
  features: string[]
  cta: string
  accent: string
  highlighted?: boolean
}

const plans: Plan[] = [
  {
    name: 'Ücretsiz',
    tagline: 'Denemek ve başlamak için',
    monthly: { try: 0, usd: 0 },
    annual: { try: 0, usd: 0 },
    limits: ['3 interaktif video', '1 yönetici', '10 dk video süresi', '1.000 dk/ay yayın'],
    features: [
      'Buton, soru, hotspot',
      'YouTube / Vimeo içe aktarma',
      'Temel analitik',
      'Sınırsız izleyici',
      'interaktiff filigranı',
    ],
    cta: 'Ücretsiz başla',
    accent: 'bg-[#FFD166]',
  },
  {
    name: 'Pro',
    tagline: 'İçerik üreticileri ve küçük ekipler',
    monthly: { try: 899, usd: 29 },
    annual: { try: 719, usd: 23 },
    limits: ['25 interaktif video', '2 yönetici', '60 dk video süresi', '15.000 dk/ay yayın'],
    features: [
      'Tüm etkileşimler + dallanma',
      'Genie AI asistan',
      'Lead toplama & formlar',
      'Altyazı, bölüm, bitiş ekranı',
      'Gelişmiş analitik + CSV',
      'Filigran yok',
    ],
    cta: '14 gün ücretsiz dene',
    accent: 'bg-[#FF6B35]',
    highlighted: true,
  },
  {
    name: 'İşletme',
    tagline: 'Büyüyen ekipler ve ajanslar',
    monthly: { try: 2499, usd: 79 },
    annual: { try: 1999, usd: 63 },
    limits: ['100 interaktif video', '5 yönetici', 'Sınırsız video süresi', '60.000 dk/ay yayın'],
    features: [
      'Pro’daki her şey',
      'Takım & rol yönetimi',
      'Müşteri ve klasör organizasyonu',
      'Marka özelleştirme (renk, font, oynatıcı)',
      'Öncelikli e-posta desteği',
    ],
    cta: '14 gün ücretsiz dene',
    accent: 'bg-[#06D6A0]',
  },
  {
    name: 'Kurumsal',
    tagline: 'Ölçek, süreç ve özel destek',
    monthly: { try: 5999, usd: 199 },
    annual: { try: 4799, usd: 159 },
    limits: ['Sınırsız video', '15 yönetici', 'Sınırsız video süresi', '250.000+ dk/ay yayın'],
    features: [
      'İşletme’deki her şey',
      'Kurulum ve ekip eğitimi',
      'Özel entegrasyon desteği',
      'Özel sözleşme & faturalandırma',
      'Adanmış destek yöneticisi',
    ],
    cta: 'Bizimle iletişime geç',
    accent: 'bg-[#118AB2]',
  },
]

/* ------------------------------------------------------------------ */

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [currency, setCurrency] = useState<'try' | 'usd'>('try')
  const [annual, setAnnual] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const money = (v: number) => (v === 0 ? '0' : currency === 'try' ? `₺${v}` : `$${v}`)

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] antialiased selection:bg-[#FFD166]">
      {/* ---------------- Nav ---------------- */}
      <header className="sticky top-0 z-50 border-b-2 border-[#1a1a1a] bg-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
            <span className="text-xl font-extrabold tracking-tight">interaktiff</span>
          </Link>

          <div className="hidden items-center gap-7 text-sm font-medium md:flex">
            <a href="#ozellikler" className="hover:text-[#FF6B35]">Özellikler</a>
            <a href="#nasil" className="hover:text-[#FF6B35]">Nasıl çalışır</a>
            <a href="#fiyat" className="hover:text-[#FF6B35]">Fiyatlar</a>
            <a href="#sss" className="hover:text-[#FF6B35]">SSS</a>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/giris" className="text-sm font-medium hover:text-[#FF6B35]">
              Giriş yap
            </Link>
            <Link
              href="/kayit"
              className="rounded-full border-2 border-[#1a1a1a] bg-[#FF6B35] px-5 py-2 text-sm font-bold text-white shadow-[3px_3px_0_0_#1a1a1a] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              Ücretsiz başla
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-lg border-2 border-[#1a1a1a] p-1.5 md:hidden"
            aria-label="Menü"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t-2 border-[#1a1a1a] bg-[#FFF8F0] px-5 py-4 md:hidden">
            <div className="flex flex-col gap-4 text-sm font-medium">
              <a href="#ozellikler" onClick={() => setMenuOpen(false)}>Özellikler</a>
              <a href="#nasil" onClick={() => setMenuOpen(false)}>Nasıl çalışır</a>
              <a href="#fiyat" onClick={() => setMenuOpen(false)}>Fiyatlar</a>
              <a href="#sss" onClick={() => setMenuOpen(false)}>SSS</a>
              <Link href="/giris">Giriş yap</Link>
              <Link
                href="/kayit"
                className="rounded-full border-2 border-[#1a1a1a] bg-[#FF6B35] px-5 py-2 text-center font-bold text-white"
              >
                Ücretsiz başla
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden border-b-2 border-[#1a1a1a] bg-[#FFF8F0]">
        {/* noktalı doku */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage: 'radial-gradient(#1a1a1a 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:py-24 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-[#1a1a1a] bg-[#FFD166] px-3 py-1 text-xs font-bold">
              <span className="h-2 w-2 rounded-full bg-[#EF476F]" />
              Yapay zekâ destekli interaktif video platformu
            </span>

            <h1 className="mt-6 text-[2.6rem] font-extrabold leading-[1.02] tracking-tight sm:text-6xl">
              İzlenen video değil,{' '}
              <span className="relative inline-block">
                <span className="relative z-10">tıklanan</span>
                <Squiggle />
              </span>{' '}
              video yap.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#4a4a4a]">
              interaktiff ile videolarına buton, soru, hotspot ve yapay zekâ ekle.
              İzleyici sadece izlemesin — <strong className="text-[#1a1a1a]">katılsın</strong>,
              tıklasın, cevap versin. Sen de her hareketi ölç.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/kayit"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#1a1a1a] bg-[#FF6B35] px-7 py-3.5 text-base font-bold text-white shadow-[5px_5px_0_0_#1a1a1a] transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
              >
                Ücretsiz başla <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#nasil"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#1a1a1a] bg-white px-7 py-3.5 text-base font-bold shadow-[5px_5px_0_0_#1a1a1a] transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
              >
                <Play className="h-4 w-4" /> Nasıl çalışır?
              </a>
            </div>

            <p className="mt-4 text-sm text-[#6b6b6b]">
              Kredi kartı gerekmez · 2 dakikada ilk videon
            </p>
          </div>

          <HeroMockup />
        </div>
      </section>

      {/* ---------------- İstatistik şeridi ---------------- */}
      <section className="border-b-2 border-[#1a1a1a] bg-[#1a1a1a] text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x-2 divide-white/15 md:grid-cols-4">
          {[
            { k: '%38', v: 'daha yüksek tamamlanma', c: 'text-[#FFD166]' },
            { k: '3.2x', v: 'daha fazla dönüşüm', c: 'text-[#06D6A0]' },
            { k: '2 dk', v: 'ilk videoyu yayınlama', c: 'text-[#FF6B35]' },
            { k: '%100', v: 'kod yazmadan', c: 'text-[#EF476F]' },
          ].map((s) => (
            <div key={s.v} className="px-5 py-7 text-center">
              <div className={`text-3xl font-extrabold ${s.c}`}>{s.k}</div>
              <div className="mt-1 text-xs text-white/70">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Özellikler ---------------- */}
      <section id="ozellikler" className="mx-auto max-w-6xl px-5 py-20">
        <Heading
          kicker="Özellikler"
          kickerBg="bg-[#06D6A0]"
          title="İzleyiciyi harekete geçiren her şey"
          sub="Tek editörde, kod yok. Videonun içine gömülü, ölçülebilir etkileşimler."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`rounded-2xl border-2 border-[#1a1a1a] p-6 shadow-[5px_5px_0_0_#1a1a1a] transition hover:-translate-y-1 hover:shadow-[7px_9px_0_0_#1a1a1a] ${f.bg} ${f.text}`}
              style={{ transform: `rotate(${(i % 2 === 0 ? -0.6 : 0.6).toFixed(2)}deg)` }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-current/25 bg-white/25">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-extrabold leading-snug">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed opacity-85">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Nasıl çalışır + video ---------------- */}
      <section id="nasil" className="border-y-2 border-[#1a1a1a] bg-[#E9F5DB]">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <Heading
            kicker="Nasıl çalışır"
            kickerBg="bg-[#FFD166]"
            title="Üç adım, hepsi bu"
            sub="Yüklemekten yayınlamaya dakikalar içinde."
          />

          <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-center">
            <ol className="space-y-5">
              {steps.map((s) => (
                <li
                  key={s.n}
                  className="flex gap-4 rounded-2xl border-2 border-[#1a1a1a] bg-white p-5 shadow-[4px_4px_0_0_#1a1a1a]"
                >
                  <span
                    className={`flex h-11 w-11 flex-none items-center justify-center rounded-full border-2 border-[#1a1a1a] text-lg font-extrabold text-white ${s.color}`}
                  >
                    {s.n}
                  </span>
                  <div>
                    <h3 className="font-extrabold">{s.title}</h3>
                    <p className="mt-1 text-sm text-[#4a4a4a]">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="rounded-3xl border-2 border-[#1a1a1a] bg-white p-3 shadow-[7px_7px_0_0_#1a1a1a]">
              <div className="overflow-hidden rounded-2xl border-2 border-[#1a1a1a]">
                <video
                  className="aspect-video w-full bg-[#1a1a1a]"
                  controls
                  playsInline
                  preload="metadata"
                  poster="/interaktiff-demo-poster.svg"
                >
                  <source src="/interaktiff-demo.mp4" type="video/mp4" />
                </video>
              </div>
              <p className="px-2 py-3 text-center text-xs font-medium text-[#6b6b6b]">
                interaktiff ile hazırlanmış kısa tanıtım
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Kullanım alanları ---------------- */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <Heading
          kicker="Kimler kullanıyor"
          kickerBg="bg-[#EF476F]"
          title="Bir video, sonsuz kullanım"
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {useCases.map((u) => (
            <div
              key={u.t}
              className="overflow-hidden rounded-2xl border-2 border-[#1a1a1a] bg-white shadow-[5px_5px_0_0_#1a1a1a]"
            >
              <div className={`h-2 ${u.c}`} />
              <div className="p-6">
                <h3 className="font-extrabold">{u.t}</h3>
                <p className="mt-2 text-sm text-[#4a4a4a]">{u.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Fiyatlandırma ---------------- */}
      <section id="fiyat" className="border-y-2 border-[#1a1a1a] bg-[#FFF8F0]">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <Heading
            kicker="Fiyatlar"
            kickerBg="bg-[#118AB2]"
            title="Sana uygun bir plan var"
            sub="İstediğin zaman yükselt ya da iptal et. Gizli ücret yok."
          />

          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="inline-flex items-center rounded-full border-2 border-[#1a1a1a] bg-white p-1 text-sm font-bold">
              <button
                onClick={() => setAnnual(false)}
                className={`rounded-full px-4 py-1.5 transition ${!annual ? 'bg-[#1a1a1a] text-white' : ''}`}
              >
                Aylık
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`rounded-full px-4 py-1.5 transition ${annual ? 'bg-[#1a1a1a] text-white' : ''}`}
              >
                Yıllık <span className="text-[#FF6B35]">−%20</span>
              </button>
            </div>

            <div className="inline-flex items-center rounded-full border-2 border-[#1a1a1a] bg-white p-1 text-sm font-bold">
              <button
                onClick={() => setCurrency('try')}
                className={`rounded-full px-4 py-1.5 transition ${currency === 'try' ? 'bg-[#1a1a1a] text-white' : ''}`}
              >
                ₺ TRY
              </button>
              <button
                onClick={() => setCurrency('usd')}
                className={`rounded-full px-4 py-1.5 transition ${currency === 'usd' ? 'bg-[#1a1a1a] text-white' : ''}`}
              >
                $ USD
              </button>
            </div>
          </div>

          <div className="mt-12 grid items-start gap-5 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((p) => {
              const price = annual ? p.annual : p.monthly
              const val = currency === 'try' ? price.try : price.usd
              return (
                <div
                  key={p.name}
                  className={`relative overflow-hidden rounded-3xl border-2 border-[#1a1a1a] bg-white ${
                    p.highlighted
                      ? 'shadow-[8px_8px_0_0_#1a1a1a] lg:-translate-y-3'
                      : 'shadow-[5px_5px_0_0_#1a1a1a]'
                  }`}
                >
                  <div className={`h-2.5 ${p.accent}`} />
                  {p.highlighted && (
                    <span className="absolute right-3 top-5 rounded-full border-2 border-[#1a1a1a] bg-[#FFD166] px-2.5 py-0.5 text-[11px] font-extrabold">
                      En popüler
                    </span>
                  )}

                  <div className="p-6">
                    <h3 className="text-lg font-extrabold">{p.name}</h3>
                    <p className="mt-1 text-xs text-[#6b6b6b]">{p.tagline}</p>

                    <div className="mt-4 flex items-end gap-1">
                      <span className="text-4xl font-extrabold tracking-tight">{money(val)}</span>
                      {val !== 0 && <span className="mb-1 text-xs text-[#6b6b6b]">/ ay</span>}
                    </div>
                    <p className="mt-1 h-4 text-[11px] font-medium text-[#FF6B35]">
                      {val !== 0 && annual ? 'yıllık faturalandırılır' : ''}
                    </p>

                    <Link
                      href="/kayit"
                      className={`mt-5 block rounded-full border-2 border-[#1a1a1a] px-4 py-2.5 text-center text-sm font-bold shadow-[3px_3px_0_0_#1a1a1a] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                        p.highlighted ? 'bg-[#FF6B35] text-white' : 'bg-white'
                      }`}
                    >
                      {p.cta}
                    </Link>

                    {/* limitler */}
                    <ul className="mt-5 space-y-1.5 rounded-xl border-2 border-dashed border-[#1a1a1a]/20 bg-[#FFF8F0] p-3 text-[13px] font-semibold">
                      {p.limits.map((l) => (
                        <li key={l} className="flex items-center gap-2">
                          <span className={`h-1.5 w-1.5 flex-none rounded-full ${p.accent}`} />
                          {l}
                        </li>
                      ))}
                    </ul>

                    {/* özellikler */}
                    <ul className="mt-4 space-y-2.5 text-[13px]">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <span className="mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full bg-[#06D6A0]">
                            <Check className="h-3 w-3 text-[#1a1a1a]" strokeWidth={3} />
                          </span>
                          <span className="text-[#3a3a3a]">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>

          <p className="mt-8 text-center text-xs text-[#6b6b6b]">
            Fiyatlara KDV dahil değildir · Tüm planlarda sınırsız izleyici ve sınırsız etkileşim ·
            İstediğin zaman iptal et
          </p>
        </div>
      </section>

      {/* ---------------- Testimonials ---------------- */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <Heading kicker="Kullanıcılar" kickerBg="bg-[#FFD166]" title="Sonuçlar kendini gösteriyor" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <figure
              key={t.name}
              className="rounded-2xl border-2 border-[#1a1a1a] bg-white p-6 shadow-[5px_5px_0_0_#1a1a1a]"
              style={{ transform: `rotate(${i === 1 ? 0.8 : -0.5}deg)` }}
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="h-4 w-4 fill-[#FFD166] text-[#1a1a1a]" />
                ))}
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed text-[#3a3a3a]">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#1a1a1a] font-extrabold ${t.c}`}
                >
                  {t.name.charAt(0)}
                </span>
                <div>
                  <div className="text-sm font-bold">{t.name}</div>
                  <div className="text-xs text-[#6b6b6b]">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ---------------- SSS ---------------- */}
      <section id="sss" className="border-t-2 border-[#1a1a1a] bg-[#FFF1E6]">
        <div className="mx-auto max-w-3xl px-5 py-20">
          <Heading kicker="SSS" kickerBg="bg-[#06D6A0]" title="Merak edilenler" />
          <div className="mt-10 space-y-3">
            {faqs.map((f, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border-2 border-[#1a1a1a] bg-white shadow-[4px_4px_0_0_#1a1a1a]"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-bold"
                >
                  {f.q}
                  <Plus
                    className={`h-5 w-5 flex-none transition-transform ${openFaq === i ? 'rotate-45' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <p className="border-t-2 border-dashed border-[#1a1a1a]/20 px-5 py-4 text-sm leading-relaxed text-[#4a4a4a]">
                    {f.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="border-y-2 border-[#1a1a1a] bg-[#FF6B35]">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center text-white md:py-20">
          <h2 className="text-3xl font-extrabold leading-tight md:text-5xl">
            İlk interaktif videonu bugün yayınla
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/90">
            Ücretsiz başla, kredi kartı gerekmez. İzleyicilerini dakikalar içinde
            katılımcıya dönüştür.
          </p>
          <Link
            href="/kayit"
            className="mt-8 inline-flex items-center gap-2 rounded-full border-2 border-[#1a1a1a] bg-white px-8 py-4 text-base font-extrabold text-[#1a1a1a] shadow-[5px_5px_0_0_#1a1a1a] transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          >
            Ücretsiz başla <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer className="bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-5 py-10 md:flex-row">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="font-extrabold">interaktiff</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-5 text-sm font-medium">
            <a href="#ozellikler" className="hover:text-[#FF6B35]">Özellikler</a>
            <a href="#fiyat" className="hover:text-[#FF6B35]">Fiyatlar</a>
            <Link href="/giris" className="hover:text-[#FF6B35]">Giriş yap</Link>
            <Link href="/kvkk" className="hover:text-[#FF6B35]">KVKK</Link>
            <Link href="/gizlilik" className="hover:text-[#FF6B35]">Gizlilik</Link>
          </div>
          <p className="text-xs text-[#6b6b6b]">© {new Date().getFullYear()} interaktiff</p>
        </div>
      </footer>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Parçalar                                                            */
/* ------------------------------------------------------------------ */

function Logo() {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#1a1a1a] bg-[#FF6B35] shadow-[2px_2px_0_0_#1a1a1a]">
      <Play className="h-4 w-4 fill-white text-white" />
    </span>
  )
}

function Squiggle() {
  return (
    <svg
      className="absolute -bottom-2 left-0 h-3 w-full"
      viewBox="0 0 200 12"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M2 8 C 40 2, 60 11, 100 6 S 165 2, 198 7"
        fill="none"
        stroke="#FFD166"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function Heading({
  kicker,
  kickerBg,
  title,
  sub,
}: {
  kicker: string
  kickerBg: string
  title: string
  sub?: string
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span
        className={`inline-block rounded-full border-2 border-[#1a1a1a] px-3 py-1 text-xs font-extrabold uppercase tracking-wide ${kickerBg}`}
      >
        {kicker}
      </span>
      <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h2>
      {sub && <p className="mt-4 text-[#4a4a4a]">{sub}</p>}
    </div>
  )
}

/* Hero'daki canlı, açık temalı ürün mockup'ı */
function HeroMockup() {
  return (
    <div className="relative">
      {/* tarayıcı çerçevesi */}
      <div className="itf-float-slow rounded-3xl border-2 border-[#1a1a1a] bg-white p-3 shadow-[9px_9px_0_0_#1a1a1a]">
        <div className="mb-2 flex items-center gap-1.5 px-1">
          <span className="h-2.5 w-2.5 rounded-full bg-[#EF476F]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FFD166]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#06D6A0]" />
        </div>

        {/* video alanı */}
        <div className="relative aspect-video overflow-hidden rounded-2xl border-2 border-[#1a1a1a] bg-[#1a1a1a]">
          {/* sahne */}
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#118AB2_0%,#06D6A0_55%,#FFD166_100%)] opacity-90" />

          {/* orta oynat */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#1a1a1a] bg-white shadow-[3px_3px_0_0_#1a1a1a]">
              <span className="itf-ring absolute inset-0 rounded-full border-2 border-white" />
              <Play className="ml-0.5 h-6 w-6 fill-[#1a1a1a] text-[#1a1a1a]" />
            </span>
          </div>

          {/* quiz kartı */}
          <div
            className="itf-rise absolute left-3 top-3 w-44 rounded-xl border-2 border-[#1a1a1a] bg-white p-2.5 shadow-[3px_3px_0_0_#1a1a1a]"
            style={{ animationDelay: '0.25s' }}
          >
            <p className="text-[11px] font-bold">Hangisini seçersin?</p>
            <div className="mt-2 space-y-1.5">
              <div className="rounded-md border-2 border-[#1a1a1a] bg-[#FF6B35] px-2 py-1 text-[11px] font-bold text-white">
                A · Pro plan
              </div>
              <div className="rounded-md border-2 border-[#1a1a1a] bg-[#FFF1E6] px-2 py-1 text-[11px] font-semibold">
                B · Ücretsiz
              </div>
            </div>
          </div>

          {/* AI balonu */}
          <div
            className="itf-rise absolute bottom-10 right-3 flex w-40 items-start gap-2 rounded-xl border-2 border-[#1a1a1a] bg-[#FFD166] p-2.5 shadow-[3px_3px_0_0_#1a1a1a]"
            style={{ animationDelay: '0.7s' }}
          >
            <Sparkles className="mt-0.5 h-4 w-4 flex-none" />
            <p className="text-[11px] font-semibold leading-snug">Bunu bir özetler misin?</p>
          </div>

          {/* CTA + cursor */}
          <div className="absolute bottom-9 left-3">
            <div className="itf-float rounded-lg border-2 border-[#1a1a1a] bg-[#EF476F] px-3 py-1.5 text-[11px] font-extrabold text-white shadow-[3px_3px_0_0_#1a1a1a]">
              Sepete ekle
            </div>
          </div>
          <div className="itf-cursor pointer-events-none absolute bottom-11 left-6">
            <MousePointerClick className="h-5 w-5 text-white drop-shadow-[2px_2px_0_#1a1a1a]" />
          </div>

          {/* kontrol çubuğu */}
          <div className="absolute bottom-0 left-0 right-0 border-t-2 border-[#1a1a1a] bg-white px-3 py-2">
            <div className="h-1.5 w-full rounded-full bg-[#1a1a1a]/10">
              <div className="h-full w-2/3 rounded-full bg-[#FF6B35]" />
            </div>
          </div>
        </div>
      </div>

      {/* yüzen rozetler */}
      <div className="itf-float absolute -left-3 top-16 hidden rounded-xl border-2 border-[#1a1a1a] bg-[#06D6A0] px-3 py-2 text-xs font-extrabold shadow-[3px_3px_0_0_#1a1a1a] sm:block">
        +38% tamamlanma
      </div>
      <div className="itf-float-slow absolute -right-2 bottom-14 hidden rounded-xl border-2 border-[#1a1a1a] bg-white px-3 py-2 text-xs font-extrabold shadow-[3px_3px_0_0_#1a1a1a] sm:block">
        3.2x dönüşüm
      </div>
    </div>
  )
}
