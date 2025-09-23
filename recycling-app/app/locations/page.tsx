'use client'
import { useState } from 'react'
import Header from '@/components/Header'
import { MapPin } from 'lucide-react'

interface Location {
  id: number
  address: string
  purpose: string
  phone: string
}

export default function Locations() {
  const [locations, setLocations] = useState<Location[]>([
    {
      id: 1,
      address: '1234 Wabash Ave, Terre Haute',
      purpose: 'Glass, Plastic, Paper',
      phone: '(812) 555-0100'
    },
    { id: 2, address: '', purpose: '', phone: '' },
    { id: 3, address: '', purpose: '', phone: '' }
  ])

  const updateLocation = (id: number, field: keyof Location, value: string) => {
    setLocations(prev => prev.map(loc =>
      loc.id === id ? { ...loc, [field]: value } : loc
    ))
  }

  return (
    <>
      <Header />
      <main className="p-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <MapPin className="text-green-600" />
          Recycling Locations
        </h2>

        <div className="space-y-4">
          {locations.map((location, index) => (
            <div key={location.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-3">Location {index + 1}</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Address"
                  value={location.address}
                  onChange={(e) => updateLocation(location.id, 'address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  placeholder="Materials Accepted"
                  value={location.purpose}
                  onChange={(e) => updateLocation(location.id, 'purpose', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  placeholder="Phone / Hours"
                  value={location.phone}
                  onChange={(e) => updateLocation(location.id, 'phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}