import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.mischgo.com"),
  title: {
    default: "Studio Flatland — Michael Abraham · Grafik & Editorial Design, Wien",
    template: "%s — Studio Flatland",
  },
  description:
    "Editorial Design, Magazin- und Katalogproduktion, Corporate Publishing. Von Layout und Satz bis zum druckfertigen PDF. Michael Abraham, Wien.",
  openGraph: {
    title: "Studio Flatland — Michael Abraham · Grafik & Editorial Design, Wien",
    description:
      "Editorial Design, Magazin- und Katalogproduktion, Corporate Publishing. Von Layout und Satz bis zum druckfertigen PDF.",
    url: "https://www.mischgo.com",
    siteName: "Studio Flatland",
    locale: "de_AT",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
