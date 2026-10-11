# Mindstamp oturum güvenliği

Rapor F38: `useSession().update()` gövdesi imzalı JWT üzerine yayılıyor; kullanıcı kimliği, `sub` ve rol değiştirilebiliyordu. Güncelleme gövdesi artık kimlik kaynağı değildir. Her JWT yenilemesinde doğrulanmış `user.id` veya yeni sürüm JWT'nin `sub` alanıyla sunucudaki kullanıcı kaydı okunur. Kimlik, rol ve profil bu kayıttan üretilir; parola alanı sorgulanmaz. Yönetici rolünün kaldırılması ve hesap silinmesi sonraki oturum kontrolünde uygulanır.

Eski tokenların `sub` alanı da değiştirilebildiği için yalnız alanları filtrelemek geçmişte üretilmiş oturumları güvenli hale getirmez. Yeni `authVersion: 2` yalnız sunucunun doğruladığı yeni girişte atanır. Eski oturumlar kapatılır ve kullanıcılar yeniden giriş yapar. İstemci bu sürüm alanını güncelleyerek oturumunu yükseltemez.

`npm run test:auth`, gerçek `lib/auth.ts` callbacklerini ve gerçek video GET/PATCH/DELETE işleyicilerini yürütür. Auth.js kurulumu, Prisma kayıtları ve dış taşıma deneme nesneleriyle sınırlandırılır. Başka hesaba kimlik/rol güncellemesi, silinen hesap, yetki iptali, veritabanı hatası ve video sahipliği kontrol edilir. Gerçek Auth.js HTTP oturumu, üretim tokenı veya müşteri videosu kullanılmaz. `tsconfig.auth-security.json` gerçek Auth.js/Prisma türleriyle kimlik modülünü ayrıca kontrol eder; tüm uygulamanın tür kontrolüyle karıştırılmamalıdır.

Canlı geçişte doğru Coolify kaynak commitini doğrulayın, yeni sürümü dağıtın ve normal/yönetici hesaplarıyla yeniden giriş yapın. İki deneme kullanıcısıyla video sahipliği ve yönetici yetkisi iptalini kontrol edin. Bu değişiklik kullanıcı parolalarını veya diğer kayıtları değiştirmez. Coolify dağıtımı bu PR hazırlanırken yapılmadı.

Kaynak: [Auth.js JWT callback](https://authjs.dev/reference/core#jwt).
