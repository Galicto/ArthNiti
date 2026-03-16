import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ArthNiti — AI-Powered Financial Intelligence",
  description: "Institutional-grade financial intelligence that helps you make smarter decisions, spot opportunities, and build lasting wealth.",
};

import { SmoothScrolling } from "@/components/SmoothScrolling";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/logo.png" as="image" />
        <link rel="preload" href="/phone1_clear.png" as="image" />
        <link rel="preload" href="/phone2_clear.png" as="image" />
        <link rel="preload" href="/stand.png" as="image" />
      </head>
      <body className={inter.className}>
        <SmoothScrolling>
          {children}
        </SmoothScrolling>
      </body>
    </html>
  );
}
