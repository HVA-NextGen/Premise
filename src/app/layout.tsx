import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const displayFont = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Premise — Suunnittele ohjelmiston epicit ja ominaisuudet",
  description:
    "Premise muuttaa ohjelmiston epicin tai ominaisuusidean jäsennellyksi, toteutuskelpoiseksi suunnitelmaksi.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="fi"
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
