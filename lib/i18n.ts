'use client'

import { useLang } from './use-lang'

type Lang = 'tr' | 'en'

/**
 * Translation dictionary with namespace organization
 */
export const DICT: Record<string, { tr: string; en: string }> = {
  // Navigation
  'nav.features': { tr: 'Özellikler', en: 'Features' },
  'nav.how_it_works': { tr: 'Nasıl çalışır', en: 'How it works' },
  'nav.pricing': { tr: 'Fiyatlar', en: 'Pricing' },
  'nav.faq': { tr: 'SSS', en: 'FAQ' },
  'nav.login': { tr: 'Giriş yap', en: 'Log in' },
  'nav.start_free': { tr: 'Ücretsiz başla', en: 'Start free' },
  'nav.menu': { tr: 'Menü', en: 'Menu' },

  // Hero section
  'hero.badge': { tr: 'Yapay zekâ destekli interaktif video platformu', en: 'AI-powered interactive video platform' },
  'hero.title': { tr: 'İzlenen video değil, tıklanan video yap.', en: 'Make videos that get clicked, not just watched.' },
  'hero.description': { tr: 'interaktiff ile videolarına buton, soru, hotspot ve yapay zekâ ekle. İzleyici sadece izlemesin — katılsın, tıklasın, cevap versin. Sen de her hareketi ölç.', en: 'Add buttons, questions, hotspots and AI to your videos with interaktiff. Don\'t just make viewers watch — make them participate, click, and respond. Then measure every move.' },
  'hero.start_free': { tr: 'Ücretsiz başla', en: 'Start free' },
  'hero.how_it_works': { tr: 'Nasıl çalışır?', en: 'How it works?' },
  'hero.no_credit_card': { tr: 'Kredi kartı gerekmez · 2 dakikada ilk videon', en: 'No credit card required · Your first video in 2 minutes' },

  // Stats section
  'stats.completion': { tr: 'daha yüksek tamamlanma', en: 'higher completion' },
  'stats.conversion': { tr: 'daha fazla dönüşüm', en: 'more conversion' },
  'stats.first_video': { tr: 'ilk videoyu yayınlama', en: 'to publish first video' },
  'stats.no_code': { tr: 'kod yazmadan', en: 'without code' },

  // Features
  'features.title': { tr: 'İzleyiciyi harekete geçiren her şey', en: 'Everything that moves viewers to action' },
  'features.subtitle': { tr: 'Tek editörde, kod yok. Videonun içine gömülü, ölçülebilir etkileşimler.', en: 'All in one editor, no code. Embedded, measurable interactions in your videos.' },
  
  'feature.clickable_buttons.title': { tr: 'Tıklanabilir butonlar', en: 'Clickable buttons' },
  'feature.clickable_buttons.desc': { tr: 'Videonun istediğin anına çağrı-eylem butonu koy; izleyiciyi ürüne, forma ya da bir sonraki bölüme gönder.', en: 'Add call-to-action buttons at any moment; send viewers to products, forms, or the next section.' },
  
  'feature.questions.title': { tr: 'Sorular & quizler', en: 'Questions & quizzes' },
  'feature.questions.desc': { tr: 'Video içinde soru sor, cevaba göre yolu değiştir, öğrenmeyi gerçekten ölç.', en: 'Ask questions during video, change path based on answer, truly measure learning.' },
  
  'feature.hotspots.title': { tr: 'Hotspot alanları', en: 'Hotspot areas' },
  'feature.hotspots.desc': { tr: 'Görüntü üzerinde tıklanabilir bölgeler tanımla; ürün detayı, ipucu ve gizli içerik aç.', en: 'Define clickable regions on image; reveal product details, hints and hidden content.' },
  
  'feature.branching.title': { tr: 'Dallanan senaryolar', en: 'Branching scenarios' },
  'feature.branching.desc': { tr: 'Herkes aynı videoyu izlemesin. Seçime göre farklı sahnelere dallan, kişiye özel akış kur.', en: 'Not everyone watches the same video. Branch to different scenes by choice, create personalized flow.' },
  
  'feature.ai_assistant.title': { tr: 'Genie AI asistan', en: 'Genie AI assistant' },
  'feature.ai_assistant.desc': { tr: 'Videonun transkripti üzerinde eğitilmiş yapay zekâ, izleyicinin sorusunu videonun içinde yanıtlar.', en: 'AI trained on video transcript answers viewer questions inside the video.' },
  
  'feature.analytics.title': { tr: 'Saniye saniye analitik', en: 'Second-by-second analytics' },
  'feature.analytics.desc': { tr: 'Kim nerede tıkladı, nerede bıraktı, hangi cevabı verdi — hepsini gör.', en: 'See who clicked where, dropped off where, gave which answer — see it all.' },
  
  'feature.import.title': { tr: 'Kolay içe aktarma', en: 'Easy import' },
  'feature.import.desc': { tr: 'MP4, MOV, WEBM yükle ya da YouTube / Vimeo bağlantısını yapıştır. Hepsi bu.', en: 'Upload MP4, MOV, WEBM or paste YouTube / Vimeo link. That\'s it.' },
  
  'feature.leads.title': { tr: 'Lead toplama', en: 'Lead collection' },
  'feature.leads.desc': { tr: 'Kritik anda e-posta iste. İzleyiciyi akışı bozmadan müşteriye çevir.', en: 'Request email at critical moment. Convert viewer to customer without breaking flow.' },

  // How it works
  'how.title': { tr: 'Üç adım, hepsi bu', en: 'Three steps, that\'s it' },
  'how.subtitle': { tr: 'Yüklemekten yayınlamaya dakikalar içinde.', en: 'From upload to publish in minutes.' },
  
  'step.upload.title': { tr: 'Videonu ekle', en: 'Add your video' },
  'step.upload.desc': { tr: 'Dosya yükle ya da YouTube/Vimeo bağlantısını yapıştır.', en: 'Upload file or paste YouTube/Vimeo link.' },
  
  'step.interact.title': { tr: 'Etkileşimi yerleştir', en: 'Place interactions' },
  'step.interact.desc': { tr: 'Sürükle-bırak editörle buton, soru ve hotspot\'u istediğin saniyeye koy.', en: 'Put buttons, questions and hotspots at any second with drag-and-drop editor.' },
  
  'step.share.title': { tr: 'Paylaş ve ölç', en: 'Share and measure' },
  'step.share.desc': { tr: 'Bağlantıyla paylaş ya da sitene göm; her tıklamayı canlı izle.', en: 'Share via link or embed on your site; watch every click live.' },

  // Use cases
  'use_cases.title': { tr: 'Bir video, sonsuz kullanım', en: 'One video, infinite uses' },
  
  'use_case.ecommerce': { tr: 'E-ticaret', en: 'E-commerce' },
  'use_case.ecommerce.desc': { tr: 'Ürün videosunda "Sepete Ekle", varyant seçimi, kampanya.', en: '"Add to Cart", variant selection, campaign on product video.' },
  
  'use_case.education': { tr: 'Online eğitim', en: 'Online education' },
  'use_case.education.desc': { tr: 'Ders içi quiz, dallanan anlatım, tamamlama takibi.', en: 'In-lesson quiz, branching narrative, completion tracking.' },
  
  'use_case.marketing': { tr: 'Pazarlama', en: 'Marketing' },
  'use_case.marketing.desc': { tr: 'İnteraktif reklam, lead formu, A/B ölçümü.', en: 'Interactive ad, lead form, A/B testing.' },
  
  'use_case.corporate': { tr: 'Kurumsal eğitim', en: 'Corporate training' },
  'use_case.corporate.desc': { tr: 'İç eğitimde sınav, sertifika ve katılım raporu.', en: 'Exam, certificate and participation report in internal training.' },

  // Pricing
  'pricing.title': { tr: 'Sana uygun bir plan var', en: 'There\'s a plan for you' },
  'pricing.subtitle': { tr: 'İstediğin zaman yükselt ya da iptal et. Gizli ücret yok.', en: 'Upgrade or cancel anytime. No hidden fees.' },
  'pricing.monthly': { tr: 'Aylık', en: 'Monthly' },
  'pricing.annual': { tr: 'Yıllık', en: 'Annual' },
  'pricing.annual_discount': { tr: '−%20', en: '−%20' },
  'pricing.try': { tr: '₺ TRY', en: '₺ TRY' },
  'pricing.usd': { tr: '$ USD', en: '$ USD' },
  'pricing.per_month': { tr: '/ ay', en: '/mo' },
  'pricing.billed_annually': { tr: 'yıllık faturalandırılır', en: 'billed annually' },
  'pricing.disclaimer': { tr: 'Fiyatlara KDV dahil değildir · Tüm planlarda sınırsız izleyici ve sınırsız etkileşim · İstediğin zaman iptal et', en: 'Prices exclude VAT · Unlimited viewers and interactions on all plans · Cancel anytime' },

  'plan.free.name': { tr: 'Ücretsiz', en: 'Free' },
  'plan.free.tagline': { tr: 'Denemek ve başlamak için', en: 'To try and get started' },
  'plan.free.cta': { tr: 'Ücretsiz başla', en: 'Start free' },
  'plan.free.limits.video': { tr: '3 interaktif video', en: '3 interactive videos' },
  'plan.free.limits.admin': { tr: '1 yönetici', en: '1 admin' },
  'plan.free.limits.duration': { tr: '10 dk video süresi', en: '10 min video duration' },
  'plan.free.limits.usage': { tr: '1.000 dk/ay yayın', en: '1,000 min/month streaming' },
  'plan.free.features.buttons': { tr: 'Buton, soru, hotspot', en: 'Buttons, questions, hotspots' },
  'plan.free.features.import': { tr: 'YouTube / Vimeo içe aktarma', en: 'YouTube / Vimeo import' },
  'plan.free.features.analytics': { tr: 'Temel analitik', en: 'Basic analytics' },
  'plan.free.features.viewers': { tr: 'Sınırsız izleyici', en: 'Unlimited viewers' },
  'plan.free.features.watermark': { tr: 'interaktiff filigranı', en: 'interaktiff watermark' },

  'plan.pro.name': { tr: 'Pro', en: 'Pro' },
  'plan.pro.tagline': { tr: 'İçerik üreticileri ve küçük ekipler', en: 'Content creators and small teams' },
  'plan.pro.cta': { tr: '14 gün ücretsiz dene', en: 'Try 14 days free' },
  'plan.pro.popular': { tr: 'En popüler', en: 'Most popular' },
  'plan.pro.limits.video': { tr: '25 interaktif video', en: '25 interactive videos' },
  'plan.pro.limits.admin': { tr: '2 yönetici', en: '2 admins' },
  'plan.pro.limits.duration': { tr: '60 dk video süresi', en: '60 min video duration' },
  'plan.pro.limits.usage': { tr: '15.000 dk/ay yayın', en: '15,000 min/month streaming' },
  'plan.pro.features.all': { tr: 'Tüm etkileşimler + dallanma', en: 'All interactions + branching' },
  'plan.pro.features.ai': { tr: 'Genie AI asistan', en: 'Genie AI assistant' },
  'plan.pro.features.leads': { tr: 'Lead toplama & formlar', en: 'Lead collection & forms' },
  'plan.pro.features.subtitles': { tr: 'Altyazı, bölüm, bitiş ekranı', en: 'Subtitles, chapters, end screen' },
  'plan.pro.features.advanced_analytics': { tr: 'Gelişmiş analitik + CSV', en: 'Advanced analytics + CSV' },
  'plan.pro.features.no_watermark': { tr: 'Filigran yok', en: 'No watermark' },

  'plan.business.name': { tr: 'İşletme', en: 'Business' },
  'plan.business.tagline': { tr: 'Büyüyen ekipler ve ajanslar', en: 'Growing teams and agencies' },
  'plan.business.cta': { tr: '14 gün ücretsiz dene', en: 'Try 14 days free' },
  'plan.business.limits.video': { tr: '100 interaktif video', en: '100 interactive videos' },
  'plan.business.limits.admin': { tr: '5 yönetici', en: '5 admins' },
  'plan.business.limits.duration': { tr: 'Sınırsız video süresi', en: 'Unlimited video duration' },
  'plan.business.limits.usage': { tr: '60.000 dk/ay yayın', en: '60,000 min/month streaming' },
  'plan.business.features.everything_pro': { tr: 'Pro\'daki her şey', en: 'Everything in Pro' },
  'plan.business.features.team': { tr: 'Takım & rol yönetimi', en: 'Team & role management' },
  'plan.business.features.organization': { tr: 'Müşteri ve klasör organizasyonu', en: 'Client and folder organization' },
  'plan.business.features.branding': { tr: 'Marka özelleştirme (renk, font, oynatıcı)', en: 'Brand customization (color, font, player)' },
  'plan.business.features.support': { tr: 'Öncelikli e-posta desteği', en: 'Priority email support' },

  'plan.enterprise.name': { tr: 'Kurumsal', en: 'Enterprise' },
  'plan.enterprise.tagline': { tr: 'Ölçek, süreç ve özel destek', en: 'Scale, process and dedicated support' },
  'plan.enterprise.cta': { tr: 'Bizimle iletişime geç', en: 'Contact us' },
  'plan.enterprise.limits.video': { tr: 'Sınırsız video', en: 'Unlimited videos' },
  'plan.enterprise.limits.admin': { tr: '15 yönetici', en: '15 admins' },
  'plan.enterprise.limits.duration': { tr: 'Sınırsız video süresi', en: 'Unlimited video duration' },
  'plan.enterprise.limits.usage': { tr: '250.000+ dk/ay yayın', en: '250,000+ min/month streaming' },
  'plan.enterprise.features.everything_business': { tr: 'İşletme\'deki her şey', en: 'Everything in Business' },
  'plan.enterprise.features.training': { tr: 'Kurulum ve ekip eğitimi', en: 'Setup and team training' },
  'plan.enterprise.features.integration': { tr: 'Özel entegrasyon desteği', en: 'Custom integration support' },
  'plan.enterprise.features.contract': { tr: 'Özel sözleşme & faturalandırma', en: 'Custom contract & billing' },
  'plan.enterprise.features.manager': { tr: 'Adanmış destek yöneticisi', en: 'Dedicated support manager' },

  // Testimonials
  'testimonials.title': { tr: 'Sonuçlar kendini gösteriyor', en: 'Results speak for themselves' },
  'testimonial.quote1': { tr: 'Eğitim videolarımıza quiz koyduk, tamamlanma oranı %38 arttı. Kurulum bir öğleden sonra sürdü.', en: 'We added quizzes to training videos, completion rate increased 38%. Setup took one afternoon.' },
  'testimonial.name1': { tr: 'Elif Demir', en: 'Elif Demir' },
  'testimonial.role1': { tr: 'Eğitim Müdürü, Akademi+', en: 'Training Manager, Akademi+' },
  'testimonial.quote2': { tr: 'Ürün videosuna "Sepete Ekle" butonu koyduk; videodan gelen satış üç katına çıktı.', en: 'We added "Add to Cart" button to product video; sales from video tripled.' },
  'testimonial.name2': { tr: 'Barış Yıldız', en: 'Barış Yıldız' },
  'testimonial.role2': { tr: 'Kurucu, TicaretPlus', en: 'Founder, TicaretPlus' },
  'testimonial.quote3': { tr: 'Genie AI izleyicinin sorusunu videonun içinde yanıtlıyor. Destek taleplerimiz gözle görülür azaldı.', en: 'Genie AI answers viewer questions inside the video. Support requests noticeably decreased.' },
  'testimonial.name3': { tr: 'Selin Kaya', en: 'Selin Kaya' },
  'testimonial.role3': { tr: 'Pazarlama Lideri, Bulut360', en: 'Marketing Lead, Bulut360' },

  // FAQ
  'faq.title': { tr: 'Merak edilenler', en: 'Common questions' },
  'faq.q1': { tr: 'Teknik bilgi gerekiyor mu?', en: 'Do I need technical knowledge?' },
  'faq.a1': { tr: 'Hayır. Sürükle-bırak editörle kod yazmadan buton, soru ve hotspot ekleyebilirsin. Videonu yüklemen yeterli.', en: 'No. With drag-and-drop editor you can add buttons, questions and hotspots without coding. Just upload your video.' },
  'faq.q2': { tr: 'Kendi YouTube veya Vimeo videomu kullanabilir miyim?', en: 'Can I use my own YouTube or Vimeo videos?' },
  'faq.a2': { tr: 'Evet. Dosya yüklemenin yanında YouTube ve Vimeo bağlantılarını doğrudan yapıştırıp üzerine etkileşim ekleyebilirsin.', en: 'Yes. Besides file upload, you can directly paste YouTube and Vimeo links and add interactions on top.' },
  'faq.q3': { tr: 'Videoları siteme gömebilir miyim?', en: 'Can I embed videos on my site?' },
  'faq.a3': { tr: 'Kesinlikle. Her interaktif video için paylaşım bağlantısı ve gömme kodu üretilir; kendi sitene saniyeler içinde eklersin.', en: 'Absolutely. Share link and embed code are generated for each interactive video; you add to your own site in seconds.' },
  'faq.q4': { tr: 'Ücretsiz planda ne kadar ileri gidebilirim?', en: 'How far can I go on free plan?' },
  'faq.a4': { tr: 'Ücretsiz planla temel etkileşimlerin hepsini deneyip ilk videolarını yayınlayabilirsin. Kredi kartı istemiyoruz.', en: 'You can try all basic interactions and publish your first videos with free plan. We don\'t ask for credit card.' },
  'faq.q5': { tr: 'Analitik verilerini dışa aktarabilir miyim?', en: 'Can I export analytics data?' },
  'faq.a5': { tr: 'Pro ve Kurumsal planlarda görüntülenme, etkileşim ve lead verilerini CSV olarak dışa aktarabilirsin.', en: 'In Pro and Enterprise plans you can export view, interaction and lead data as CSV.' },

  // CTA section
  'cta.title': { tr: 'İlk interaktif videonu bugün yayınla', en: 'Publish your first interactive video today' },
  'cta.description': { tr: 'Ücretsiz başla, kredi kartı gerekmez. İzleyicilerini dakikalar içinde katılımcıya dönüştür.', en: 'Start free, no credit card required. Turn viewers into participants in minutes.' },
  'cta.button': { tr: 'Ücretsiz başla', en: 'Start free' },

  // Footer
  'footer.rights': { tr: '© {year} interaktiff', en: '© {year} interaktiff' },
  'footer.privacy': { tr: 'Gizlilik', en: 'Privacy' },
  'footer.kvkk': { tr: 'KVKK', en: 'KVKK' },

  // Dashboard
  'dashboard.welcome': { tr: 'Hoş geldiniz! İşte video platformunuzun özeti.', en: 'Welcome! Here\'s your video platform overview.' },
  'dashboard.total_videos': { tr: 'Toplam Video', en: 'Total Videos' },
  'dashboard.video_library': { tr: 'Video kütüphaneniz', en: 'Your video library' },
  'dashboard.total_views': { tr: 'Toplam Görüntülenme', en: 'Total Views' },
  'dashboard.last_30_days': { tr: 'Son 30 gün', en: 'Last 30 days' },
  'dashboard.unique_viewers': { tr: 'Benzersiz İzleyici', en: 'Unique Viewers' },
  'dashboard.avg_engagement': { tr: 'Etkileşim Oranı', en: 'Engagement Rate' },
  'dashboard.avg': { tr: 'Ortalama', en: 'Average' },
  
  'dashboard.new_video': { tr: 'Yeni Video Oluştur', en: 'Create New Video' },
  'dashboard.new_video_desc': { tr: 'Video yükleyin veya URL ekleyin', en: 'Upload video or add URL' },
  'dashboard.view_videos': { tr: 'Videoları Görüntüle', en: 'View Videos' },
  'dashboard.view_videos_desc': { tr: 'Tüm videolarınızı yönetin', en: 'Manage all your videos' },
  'dashboard.start': { tr: 'Başla', en: 'Start' },
  'dashboard.view': { tr: 'Görüntüle', en: 'View' },
  
  'dashboard.guide_title': { tr: 'Başlangıç Rehberi', en: 'Getting Started Guide' },
  'dashboard.guide_desc': { tr: 'Platformu kullanmaya başlamak için bu adımları takip edin', en: 'Follow these steps to get started with the platform' },
  'dashboard.guide_step1_title': { tr: 'Video Yükleyin:', en: 'Upload Video:' },
  'dashboard.guide_step1_desc': { tr: 'MP4, MOV veya WEBM formatında video yükleyin veya YouTube/Vimeo URL\'i ekleyin', en: 'Upload video in MP4, MOV or WEBM format or add YouTube/Vimeo URL' },
  'dashboard.guide_step2_title': { tr: 'Etkileşim Ekleyin:', en: 'Add Interactions:' },
  'dashboard.guide_step2_desc': { tr: 'Butonlar, sorular, metinler ve daha fazlasını video üzerine ekleyin', en: 'Add buttons, questions, texts and more on top of video' },
  'dashboard.guide_step3_title': { tr: 'Tasarlayın:', en: 'Customize:' },
  'dashboard.guide_step3_desc': { tr: 'Renkleri, fontları ve stilleri markanıza göre özelleştirin', en: 'Customize colors, fonts and styles to match your brand' },
  'dashboard.guide_step4_title': { tr: 'Yayınlayın:', en: 'Publish:' },
  'dashboard.guide_step4_desc': { tr: 'Videoyu paylaşın, gömün ve analizleri izleyin', en: 'Share, embed video and track analytics' },

  'dashboard.nav.dashboard': { tr: 'Dashboard', en: 'Dashboard' },
  'dashboard.nav.videos': { tr: 'Videolar', en: 'Videos' },
  'dashboard.nav.folders': { tr: 'Klasörler', en: 'Folders' },
  'dashboard.nav.leads': { tr: 'Müşteriler', en: 'Leads' },
  'dashboard.nav.analytics': { tr: 'Analitik', en: 'Analytics' },
  'dashboard.nav.genie': { tr: 'Genie AI', en: 'Genie AI' },
  'dashboard.nav.settings': { tr: 'Ayarlar', en: 'Settings' },
  'dashboard.nav.user': { tr: 'Kullanıcı', en: 'User' },
  'dashboard.nav.settings_action': { tr: 'Ayarlar', en: 'Settings' },
  'dashboard.nav.logout': { tr: 'Çıkış Yap', en: 'Log out' },

  // Auth pages
  'auth.tagline': { tr: 'Videolarınızı etkileşimli hale getirin', en: 'Make your videos interactive' },
  'auth.register_title': { tr: 'Kayıt Ol', en: 'Sign Up' },
  'auth.register_desc': { tr: 'Ücretsiz hesap oluşturun ve hemen başlayın', en: 'Create free account and start immediately' },
  'auth.login_title': { tr: 'Giriş Yap', en: 'Log In' },
  'auth.login_desc': { tr: 'Hesabınıza giriş yapın', en: 'Log in to your account' },
  'auth.forgot_password': { tr: 'Şifremi Unuttum', en: 'Forgot Password' },
  'auth.name': { tr: 'Ad Soyad', en: 'Full Name' },
  'auth.name_placeholder': { tr: 'Ahmet Yılmaz', en: 'John Doe' },
  'auth.email': { tr: 'E-posta', en: 'Email' },
  'auth.email_placeholder': { tr: 'ornek@email.com', en: 'example@email.com' },
  'auth.password': { tr: 'Şifre', en: 'Password' },
  'auth.password_placeholder': { tr: 'En az 8 karakter', en: 'At least 8 characters' },
  'auth.confirm_password': { tr: 'Şifre Tekrar', en: 'Confirm Password' },
  'auth.confirm_password_placeholder': { tr: 'Şifre tekrar', en: 'Confirm password' },
  'auth.terms': { tr: 'Hizmet şartlarını', en: 'Terms of service' },
  'auth.privacy_policy': { tr: 'gizlilik politikasını', en: 'privacy policy' },
  'auth.terms_accept': { tr: 'okudum ve kabul ediyorum', en: 'read and accepted' },
  'auth.register_submit': { tr: 'Kayıt Ol', en: 'Sign Up' },
  'auth.registering': { tr: 'Kayıt yapılıyor...', en: 'Registering...' },
  'auth.login_submit': { tr: 'Giriş Yap', en: 'Log In' },
  'auth.logging_in': { tr: 'Giriş yapılıyor...', en: 'Logging in...' },
  'auth.or_login_with': { tr: 'Veya şununla giriş yapın', en: 'Or log in with' },
  'auth.already_have_account': { tr: 'Zaten hesabınız var mı?', en: 'Already have an account?' },
  'auth.login_link': { tr: 'Giriş yapın', en: 'Log in' },
  'auth.no_account': { tr: 'Hesabınız yok mu?', en: 'Don\'t have an account?' },
  'auth.register_link': { tr: 'Kayıt olun', en: 'Sign up' },
  'auth.google': { tr: 'Google', en: 'Google' },
  'auth.github': { tr: 'GitHub', en: 'GitHub' },

  // Error messages
  'auth.error_terms_required': { tr: 'Şartları ve koşulları kabul etmeniz gerekiyor', en: 'You must accept terms and conditions' },
  'auth.error_password_mismatch': { tr: 'Şifreler eşleşmiyor', en: 'Passwords do not match' },
  'auth.error_password_short': { tr: 'Şifre en az 8 karakter olmalıdır', en: 'Password must be at least 8 characters' },
  'auth.error_generic': { tr: 'Bir hata oluştu', en: 'An error occurred' },
  'auth.error_login_failed': { tr: 'Giriş başarısız', en: 'Login failed' },
  'auth.error_register_failed': { tr: 'Kayıt başarısız', en: 'Registration failed' },
  'auth.success_register': { tr: 'Kayıt başarılı! Lütfen giriş yapın.', en: 'Registration successful! Please log in.' },
  'auth.success_register_login': { tr: 'Kayıt başarılı! Giriş yapıldı.', en: 'Registration successful! Logged in.' },
  'auth.error_login_failed_msg': { tr: 'Giriş başarısız', en: 'Login failed' },

  // Common
  'common.language': { tr: 'Dil', en: 'Language' },
  'common.required': { tr: 'Gerekli', en: 'Required' },
  'common.optional': { tr: 'İsteğe bağlı', en: 'Optional' },
  'common.save': { tr: 'Kaydet', en: 'Save' },
  'common.cancel': { tr: 'İptal', en: 'Cancel' },
  'common.delete': { tr: 'Sil', en: 'Delete' },
  'common.edit': { tr: 'Düzenle', en: 'Edit' },
  'common.create': { tr: 'Oluştur', en: 'Create' },
  'common.update': { tr: 'Güncelle', en: 'Update' },
  'common.search': { tr: 'Ara', en: 'Search' },
  'common.filter': { tr: 'Filtrele', en: 'Filter' },
  'common.sort': { tr: 'Sırala', en: 'Sort' },
  'common.loading': { tr: 'Yükleniyor...', en: 'Loading...' },
  'common.no_results': { tr: 'Sonuç bulunamadı', en: 'No results found' },
  'common.try_again': { tr: 'Tekrar dene', en: 'Try again' },
  'common.back': { tr: 'Geri', en: 'Back' },
  'common.next': { tr: 'İleri', en: 'Next' },
  'common.previous': { tr: 'Önceki', en: 'Previous' },
  'common.close': { tr: 'Kapat', en: 'Close' },
  'common.open': { tr: 'Aç', en: 'Open' },
  'common.view_all': { tr: 'Tümünü Gör', en: 'View All' },
  'common.show_more': { tr: 'Daha Fazla Göster', en: 'Show More' },
  'common.show_less': { tr: 'Daha Az Göster', en: 'Show Less' },
}

/**
 * Get translation by key with variable interpolation
 */
export function t(
  key: string,
  lang: Lang,
  vars?: Record<string, string | number>
): string {
  const entry = DICT[key]
  if (!entry) {
    console.warn(`Translation key not found: ${key}`)
    return key
  }

  let text = lang === 'tr' ? entry.tr : entry.en

  // Variable interpolation: {year}, {name}, etc.
  if (vars) {
    Object.entries(vars).forEach(([varKey, value]) => {
      text = text.replace(new RegExp(`{${varKey}}`, 'g'), String(value))
    })
  }

  return text
}

/**
 * Hook that combines useLang and t
 * Usage: const { t, lang } = useT()
 */
export function useT() {
  const { lang, isHydrated } = useLang()

  const translate = (key: string, vars?: Record<string, string | number>) => {
    return t(key, lang, vars)
  }

  return {
    t: translate,
    lang,
    isHydrated,
  }
}
