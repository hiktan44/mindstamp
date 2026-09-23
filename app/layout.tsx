import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { LangProvider } from "@/components/LangProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'İnteraktiff', statusBarStyle: 'default' },
  metadataBase: new URL("https://mindstamp.seymata.com"),
  title: "interaktiff — Videolarını Etkileşimli Hale Getir",
  description:
    "interaktiff ile videolarına butonlar, sorular, hotspot'lar ve yapay zeka sohbet ekle. İzleyiciyi tıklatan, ölçülebilir ve dönüşüm getiren interaktif video deneyimleri oluştur.",
  keywords: [
    "interaktif video",
    "etkileşimli video",
    "video pazarlama",
    "video quiz",
    "interaktiff",
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "interaktiff — Videolarını Etkileşimli Hale Getir",
    description:
      "Butonlar, sorular, hotspot'lar ve yapay zeka ile videolarını etkileşimli deneyimlere dönüştür.",
    url: "https://mindstamp.seymata.com",
    siteName: "interaktiff",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "interaktiff — Videolarını Etkileşimli Hale Getir",
    description: "Videolarını tıklanabilir, ölçülebilir ve dönüşüm getiren deneyimlere dönüştür.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "interaktiff",
              applicationCategory: "MultimediaApplication",
              operatingSystem: "Web",
              url: "https://mindstamp.seymata.com",
              description: "Videolara buton, soru, hotspot ve yapay zeka sohbeti ekleyerek etkileşimli deneyimler oluşturun.",
              publisher: {
                "@type": "Organization",
                name: "STRATEJİ DANIŞMANLIK HİZMETLERİ SAN. VE TİC. A.Ş.",
                taxID: "7810520457",
                email: "info@stratejidanismanlik.com.tr",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <LangProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
          <Toaster />
        </LangProvider>
      <LegalFooter />
      <script dangerouslySetInnerHTML={{ __html: "if('serviceWorker' in navigator && (location.protocol==='https:' || location.hostname==='localhost')){window.addEventListener('load', function(){navigator.serviceWorker.register('/sw.js').catch(function(){});})}"}} />
      </body>
    </html>
  );
}


function LegalFooter() { return <footer className="border-t border-slate-200 bg-white px-5 py-5 text-center text-sm text-slate-600"><div className="flex flex-wrap justify-center gap-4"><a href="/privacy">Gizlilik ve KVKK</a><a href="/terms">Kullanım Koşulları</a><a href="/cookies">Çerez Politikası</a><a href="/contact">İletişim</a></div><p className="mt-3">STRATEJİ DANIŞMANLIK HİZMETLERİ SAN. VE TİC. A.Ş. · <a href="mailto:info@stratejidanismanlik.com.tr">info@stratejidanismanlik.com.tr</a></p></footer>; }

export const viewport = { themeColor: '#0f4c81' };
