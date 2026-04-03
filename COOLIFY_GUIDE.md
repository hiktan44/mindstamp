# Mindstamp Klonu - Coolify Self-Hosting Guide
# ============================================

## 🚀 Coolify ile Deployment

Coolify, Docker konteynerlı uygulamaları self-host etmek için en kolay platformlardan biridir.

### Gereksinimler

- Coolify instance (VPS veya kendi sunucu)
- GitHub repository
- PostgreSQL database
- (Opsiyonel) S3-compatible storage

### Adım Adım Deployment

#### 1. Repository'yi GitHub'a Push Edin

```bash
# İlk commit
git add .
git commit -m "Initial commit: Mindstamp klonu"

# Repository oluştur (GitHub'da)
git remote add origin https://github.com/kullanici-adi/mindstamp.git
git branch -M main
git push -u origin main
```

#### 2. Coolify'de Proje Oluştur

1. Coolify paneline giriş yapın
2. **Resources** → **+ New Resource** tıklayın
3. **Service** seçin
4. GitHub repository'nizi seçin
5. Branch: `main`
6. **Environment** ayarlarını yapın

#### 3. Environment Variables

```env
# Database (Coolify'in built-in PostgreSQL'unu kullanın)
DATABASE_URL=postgresql://user:password@postgres:5432/mindstamp

# NextAuth (rastgele string oluştur)
NEXTAUTH_URL=https://your-domain.coolify.com
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars

# App
NEXT_PUBLIC_APP_URL=https://your-domain.coolify.com
NEXT_PUBLIC_APP_NAME=Mindstamp Klonu

# Storage (MinIO veya S3)
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=mindstamp-videos
S3_ENDPOINT=https://your-minio-domain.com

# Mux (Opsiyonel)
MUX_TOKEN_ID=your-mux-token-id
MUX_SECRET_KEY=your-mux-secret
MUX_WEBHOOK_SIGNING_SECRET=your-webhook-secret
```

#### 4. Database Bağlantısı

1. **Resources** → **+ New Resource** → **Database** (PostgreSQL)
2. Database adı: `mindstamp`
3. Resource Linking: App service'i database'e bağla

#### 5. Deploy

- **Deploy** butonuna tıklayın
- Deployment otomatik başlar
- Log sekmesinden ilerlemeyi takip edin
