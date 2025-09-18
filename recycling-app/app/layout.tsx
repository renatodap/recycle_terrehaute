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
  title: "Terre Haute Recycling Assistant",
  description: "AI-powered recycling assistant for Terre Haute, Indiana. Identify recyclable items, find drop-off locations, and check pickup schedules for Vigo County.",
  keywords: "recycling, Terre Haute, Indiana, Vigo County, waste management, sustainability",
  openGraph: {
    title: "Terre Haute Recycling Assistant",
    description: "Know what's recyclable in Vigo County",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
