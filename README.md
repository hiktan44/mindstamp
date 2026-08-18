# interaktiff - Interaktif Video Platformu

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-latest)](https://ui.shadcn.com/)

Videolarınıza etkileşimli öğeler (butonlar, sorular, hotspot'lar, metin, resim) ekleyerek dinamik deneyimler oluşturduğunuz modern bir SaaS platformu.

## 🚀 Özellikler

### ✅ Tamamlanan Özellikler (MVP)

- **Video Yönetimi**
  - MP4, MOV, WEBM formatında video yükleme
  - URL ile video ekleme (YouTube, Vimeo altyapısı hazır)
  - Video kütüphanesi (liste, filtreleme, arama)
  - Taslak/Yayınlanmış durum yönetimi

- **Etkileşim Editörü**
  - Görsel timeline editörü
  - Sürükle-bırak konumlandırma
  - Canlı önizleme
  - 5 temel etkileşim tipi: Button, Hotspot, Question, Text, Image
  - Zaman tabanlı gösterim/gizleme

- **Video Player**
  - Özel HTML5 video player
  - Klavye kısayolları
  - Oynatma hız kontrolü
  - Tam ekran desteği
  - Etkileşim overlay sistemi

- **Paylaşım & Yayınlama**
  - Paylaşım linki oluşturma
  - Embed kodu üretimi
  - Sosyal medya entegrasyonu (Facebook, Twitter, LinkedIn)
  - Gizlilik ayarları

- **Analitik**
  - Görüntülenme istatistikleri
  - Etkileşim performans raporları
  - Cihaz dağılımı
  - İzleyici verileri

- **Kullanıcı Sistemi**
  - E-posta/şifre ile kayıt
  - Google OAuth entegrasyonu
  - GitHub OAuth entegrasyonu
  - Rol bazlı yetkilendirme (USER, ADMIN, SUPER_ADMIN)

### 🔜 Planlanan Özellikler

- [ ] Lead Capture (İzleyici bilgisi toplama)
- [ ] Magic Menu (Overlay menü)
- [ ] End Screen (Bitiş ekranı)
- [ ] Chapters & Captions (Bölümler & Altyazılar)
- [ ] Video Branching (Videoya dallanma)
- [ ] Genie AI (Transcript + Chat)
- [ ] Variables & Conditional Logic
- [ ] Paywall (Stripe entegrasyonu)
- [ ] SCORM Export (LMS uyumluluğu)

## 🛠️ Tech Stack

| Kategori | Teknoloji |
|----------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **UI** | shadcn/ui + TailwindCSS |
| **State** | Zustand |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | NextAuth.js v5 |
| **Video** | HLS.js (yakında) |
| **Forms** | React Hook Form (yakında) |
| **Analytics** | Recharts (yakında) |

## 📋 Kurulum

### Gereksinimler

- Node.js 18+ ve npm
- PostgreSQL veritabanı
- (Opsiyonel) S3-compatible storage (Cloudflare R2, MinIO)
- (Opsiyonel) Mux account (video streaming)

### Adım Adım Kurulum

```bash
# 1. Repo'yu klonlayın
git clone <repo-url>
cd interaktiff

# 2. Bağımlılıkları yükleyin
npm install

# 3. Environment variables'ı yapılandırın
cp .env.example .env.local
```

### `.env.local` Dosyası

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/interaktiff?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="rastgele-uzun-secret-key-buraya"

# OAuth Providers (Opsiyonel)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

# File Storage (S3/R2)
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET_NAME="interaktiff-videos"
S3_REGION="auto"
S3_ENDPOINT="https://..."

# Video Processing (Mux - Opsiyonel)
MUX_TOKEN_ID="your-mux-token"
MUX_SECRET_KEY="your-mux-secret"

# OpenAI (Genie AI - Opsiyonel)
OPENAI_API_KEY="your-openai-key"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="interaktiff"
```

```bash
# 4. Veritabanını başlatın
npx prisma generate
npx prisma db push

# 5. Development server'ı başlatın
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## 📁 Proje Yapısı

```
interaktiff/
├── app/
│   ├── (auth)/                    # Auth routes
│   │   ├── giris/                 # Login page
│   │   └── kayit/                 # Register page
│   ├── (dashboard)/               # Protected dashboard
│   │   ├── layout.tsx             # Dashboard layout (sidebar)
│   │   ├── page.tsx               # Dashboard home
│   │   ├── videos/
│   │   │   ├── page.tsx           # Video library
│   │   │   ├── new/page.tsx       # New video / upload
│   │   │   └── [id]/
│   │   │       ├── edit/page.tsx   # Video editor
│   │   │       ├── share/page.tsx  # Share settings
│   │   │       └── analytics/      # Analytics dashboard
│   ├── api/                       # API routes
│   │   ├── auth/
│   │   │   ├── [...nextauth]/      # NextAuth
│   │   │   └── register/          # Register endpoint
│   │   └── videos/
│   │       ├── upload/route.ts     # Upload API
│   │       └── [id]/route.ts       # Video CRUD
│   ├── watch/[id]/                # Public video player
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Landing page
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── editor/
│   │   └── editor-layout.tsx      # Video editor
│   ├── player/
│   │   ├── video-player.tsx        # Video player
│   │   └── interaction-overlay.tsx # Interaction overlay
│   └── upload-zone.tsx            # Upload component
├── lib/
│   ├── auth.ts                    # NextAuth config
│   ├── db.ts                      # Prisma client
│   └── utils.ts                   # Utilities
├── prisma/
│   └── schema.prisma              # Database schema
├── middleware.ts                  # Auth middleware
└── public/                        # Static assets
```

## 🗄️ Database Schema

```prisma
// Ana modeller
User          // Kullanıcı hesapları
Video         // Videolar
Interaction   // Etkileşimler (button, question, vs.)
Analytics     // İzleme verileri
Lead          // Toplanan lead bilgileri
Chapter        // Video bölümleri
Caption        // Altyazılar
Transcript    // Transkriptler
Organization   // Organizasyonlar
```

## 🎨 Kullanım

### 1. Kayıt Olun

`/kayit` sayfasından hesap oluşturun veya Google ile giriş yapın.

### 2. Video Yükleyin

Dashboard > Videolar > Yeni Video ile:
- Dosya sürükleyip bırakın
- Veya YouTube/Vimeo URL'i girin

### 3. Etkileşim Ekleyin

Video editöründe:
- **Buton**: Tıklanabilir butonlar ekleyin
- **Hotspot**: Video üstünde tıklanabilir alanlar oluşturun
- **Soru**: Quiz/sınav soruları ekleyin
- **Metin**: Bilgilendirici metin kutuları
- **Resim**: Resim overlay'leri

### 4. Tasarımı Özelleştirin

Tasarım sekmesinden:
- Renkleri ayarlayın
- Font'ları seçin
- Animasyonları yapılandırın

### 5. Yayınlayın ve Paylaşın

- Durumu "Yayında" yapın
- Paylaşım linkini kopyalayın
- Embed kodunu alın
- Sosyal medyada paylaşın

### 6. Analitikleri Görüntüleyin

- Görüntülenme sayıları
- Etkileşim performansı
- İzleyici demografisi

## 🔑 Klavye Kısayolları

| Kısayol | İşlev |
|---------|-------|
| `Space` / `K` | Oynat/Duraklat |
| `←` | 10 saniye geri |
| `→` | 10 saniye ileri |
| `M` | Sesi kapat/aç |
| `F` | Tam ekran |

## 🚀 Deployment

### Vercel (Önerilen)

```bash
# 1. Veritabanı oluşturun (Vercel Postgres, Supabase, vs.)
# 2. Environment variables'ı ekleyin
# 3. Deploy edin
vercel
```

### Docker

```bash
# Dockerfile ve docker-compose.config.ts yakında eklenecek
```

## 📝 Lisans

MIT License - tıbbi, eğitim ve ticari kullanım için uygundur.

## 🤝 Katkıda Bulunma

1. Repo'yu fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📧 İletişim

Sorular ve öneriler için: [GitHub Issues](https://github.com/your-repo/issues)

---

**Not**: Bu interaktiff eğitim ve demonstrasyon amaçlıdır. Üretim kullanımı için ek güvenlik önlemleri alınmalıdır.
