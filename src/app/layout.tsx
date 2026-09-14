import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/context";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { CartDrawer } from "@/components/store/CartDrawer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "بيت الدلة | Beit El Dallah - القهوة العربية الفاخرة ومستلزمات الكافيهات",
  description:
    "متجر مصري رائد في تحميص وتوزيع أجود حبوب البن ومستلزمات الكافيهات. بن الدله، ستار كوفي، اسبريسو، بن تركي، شاي سيلاني ومعدات القهوة مع دفع عربون ميسر عبر واتساب.",
  keywords: [
    "بن الدله",
    "قهوة عربية",
    "اسبريسو",
    "بن تركي",
    "مستلزمات كافيهات مصر",
    "Beit El Dallah",
    "Specialty Coffee Egypt",
  ],
  openGraph: {
    title: "بيت الدلة | Beit El Dallah",
    description: "أصالة القهوة العربية ومستلزمات الكافيهات الفاخرة",
    url: "https://beit-el-dallah.com",
    siteName: "Beit El Dallah",
    images: [
      {
        url: "/logo.svg",
        width: 800,
        height: 600,
      },
    ],
    locale: "ar_EG",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen flex flex-col bg-brand-cream text-brand-text">
        <I18nProvider>
          <Navbar />
          <CartDrawer />
          <main className="flex-1">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
