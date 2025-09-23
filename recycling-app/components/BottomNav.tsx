'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Camera, MapPin, MessageCircle } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', icon: Camera, label: 'Camera' },
    { href: '/locations', icon: MapPin, label: 'Location' },
    { href: '/chat', icon: MessageCircle, label: 'Chat' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-green-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={24} />
              <span className="text-xs mt-1">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}