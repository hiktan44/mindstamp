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
  metadataBase: new URL("https://interaktiff.com"),
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
    url: "https://interaktiff.com",
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
              url: "https://interaktiff.com",
              description: "Videolara buton, soru, hotspot ve yapay zeka sohbeti ekleyerek etkileşimli deneyimler oluşturun.",
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
      </body>
    </html>
  );
}
