import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TabBar } from "@/components/layout/TabBar";

// Display face — headings and page titles
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

// Body face — everything readable
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Mono face — timestamps, references, recorded data
const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "KnightLog",
  description: "The fastest way to complete your site diary.",
  appleWebApp: {
    capable: true,
    title: "KnightLog",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#12503A",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB">
      <body
        className={`${bricolage.variable} ${inter.variable} ${jetbrains.variable}`}
      >
        <div className="mx-auto max-w-[520px] md:max-w-none md:pl-[248px]">
          {children}
        </div>
        <TabBar />
      </body>
    </html>
  );
}