import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import LightMode from "./light-mode";

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

export const viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="light" style={{ colorScheme: 'light' }}>
      <head>
        <Script
          id="light-mode-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              document.documentElement.classList.remove('dark');
              document.documentElement.classList.add('light');
              document.documentElement.style.colorScheme = 'light';
              document.documentElement.style.backgroundColor = '#ffffff';
            `
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}
        suppressHydrationWarning
        style={{
          colorScheme: 'light',
          backgroundColor: '#ffffff',
          color: '#111827'
        }}
      >
        <LightMode />
        {children}
      </body>
    </html>
  );
}
