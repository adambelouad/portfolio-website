import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const charcoalCY = localFont({
  src: "./fonts/Charcoal_CY.ttf",
  variable: "--font-charcoal-cy",
  display: "swap",
});

const geneva = localFont({
  src: "./fonts/geneva-9-1.otf.woff2",
  variable: "--font-geneva",
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  title: "adam belouad",
  description: "Adam Belouad's Personal Website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${charcoalCY.variable} ${geneva.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
