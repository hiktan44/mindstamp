import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

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
  openGraph: {
    title: "interaktiff — Videolarını Etkileşimli Hale Getir",
    description:
      "Butonlar, sorular, hotspot'lar ve yapay zeka ile videolarını etkileşimli deneyimlere dönüştür.",
    url: "https://interaktiff.com",
    siteName: "interaktiff",
    locale: "tr_TR",
    type: "website",
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
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
