import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const charcoal = localFont({
  src: "./fonts/charcoal.ttf",
  variable: "--font-charcoal",
  display: "swap",
});

const geneva = localFont({
  src: "./fonts/geneva.woff2",
  variable: "--font-geneva",
  display: "swap",
  weight: "400",
});

const appleGaramond = localFont({
  src: [
    {
      path: "./fonts/apple-garamond-light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/apple-garamond.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/apple-garamond-bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-apple-garamond",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Adam Belouad",
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
        className={`${geistSans.variable} ${geistMono.variable} ${charcoal.variable} ${geneva.variable} ${appleGaramond.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
