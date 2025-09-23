'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Camera, MapPin, MessageCircle } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-300 z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center flex-1 h-full ${
            pathname === '/' ? 'text-green-600' : 'text-gray-500'
          }`}
        >
          <Camera size={24} />
          <span className="text-xs mt-1">Scan</span>
        </Link>

        <Link
          href="/locations"
          className={`flex flex-col items-center justify-center flex-1 h-full ${
            pathname === '/locations' ? 'text-green-600' : 'text-gray-500'
          }`}
        >
          <MapPin size={24} />
          <span className="text-xs mt-1">Locations</span>
        </Link>

        <Link
          href="/chat"
          className={`flex flex-col items-center justify-center flex-1 h-full ${
            pathname === '/chat' ? 'text-green-600' : 'text-gray-500'
          }`}
        >
          <MessageCircle size={24} />
          <span className="text-xs mt-1">Chat</span>
        </Link>
      </div>
    </nav>
  )
}