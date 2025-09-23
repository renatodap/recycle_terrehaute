import './globals.css'
import { Inter } from 'next/font/google'
import BottomNav from '@/components/BottomNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'RecycleIt! Terre Haute',
  description: 'AI-powered recycling app for Terre Haute',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 pb-20">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  )
}