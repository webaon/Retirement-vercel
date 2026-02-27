import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Financial Planner — วางแผนเกษียณอายุอย่างมั่นใจ",
  description:
    "วางแผนเกษียณอายุแบบครบวงจร คำนวณเงินออม เป้าหมายการเงิน ประกันชีวิต Monte Carlo Simulation และ Export รายงานในที่เดียว",
  keywords: [
    "วางแผนเกษียณ",
    "retirement planning",
    "financial planner",
    "เงินออม",
    "ประกันชีวิต",
    "Monte Carlo",
    "คำนวณเกษียณ",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    title: "Financial Planner — วางแผนเกษียณอายุอย่างมั่นใจ",
    description:
      "วางแผนเกษียณอย่างมั่นคง ครอบคลุมเงินออม ประกัน และการลงทุน ใช้งานง่าย ฟรี",
    locale: "th_TH",
    type: "website",
  },
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Financial Planner",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "THB" },
  description:
    "วางแผนเกษียณอายุแบบครบวงจร คำนวณเงินออม เป้าหมายการเงิน ประกันชีวิต",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
