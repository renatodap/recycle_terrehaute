import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RecycleIt! Terre Haute",
  description: "Your recycling companion for Terre Haute",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 overscroll-none`} suppressHydrationWarning>
        <div className="min-h-screen pb-20 max-w-md mx-auto bg-white overflow-hidden">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
