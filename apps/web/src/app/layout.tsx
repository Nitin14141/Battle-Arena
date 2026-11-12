import "./globals.css";
import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

const siteName = "Battle Arena";
const siteTitle = "Battle Arena — Every Universe. Every Legend. One Battlefield.";
const siteDescription =
  "Pit legends from every universe and era against each other. Ten battle scenarios, 100 deterministic trials, and detailed battle reports.";
const socialImage = {
  url: "/images/og-battle-arena.jpg",
  width: 1200,
  height: 630,
  alt: "Battle Arena — a neon battle arena with two fighters facing off",
  type: "image/jpeg",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  applicationName: siteName,
  title: {
    default: "Battle Arena | Every Universe. Every Legend. One Battlefield.",
    template: "%s | Battle Arena",
  },
  description: siteDescription,
  keywords: ["Battle Arena", "character battles", "fictional battles", "historical battles", "AI battle simulator"],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName,
    title: siteTitle,
    description: siteDescription,
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [socialImage],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-arena-bg font-sans text-arena-text antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-arena-purple focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Navbar />
        <div id="main">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
