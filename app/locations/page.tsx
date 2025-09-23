'use client'
import { useState, useEffect } from 'react'
import { MapPin, Recycle, Clock, Package } from 'lucide-react'

interface Location {
  id: number
  name: string
  address: string
  accepts: string
  hours: string
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch real locations data
    fetch('/api/locations')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setLocations(data.map((loc: any, idx: number) => ({
            id: idx + 1,
            name: loc.name || 'Location ' + (idx + 1),
            address: loc.address || '',
            accepts: loc.accepts ? loc.accepts.join(', ') : '',
            hours: loc.hours || ''
          })))
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load locations:', err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-300 p-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Recycle className="text-green-600" size={24} />
          Recycle Terre Haute
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MapPin className="text-green-600" size={20} />
          Recycling Locations
        </h2>

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            Loading locations...
          </div>
        ) : (
          <div className="space-y-4">
            {locations.map((location, index) => (
              <div
                key={location.id}
                className="border-2 border-gray-300 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Location Number Badge */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg text-gray-800">
                    {location.name}
                  </h3>
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                    #{index + 1}
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Address */}
                  <div className="flex items-start gap-2">
                    <MapPin className="text-gray-400 mt-0.5" size={16} />
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Address</p>
                      <p className="text-sm text-gray-700">{location.address || 'No address available'}</p>
                    </div>
                  </div>

                  {/* Accepts */}
                  <div className="flex items-start gap-2">
                    <Package className="text-gray-400 mt-0.5" size={16} />
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Accepts</p>
                      <p className="text-sm text-gray-700">{location.accepts || 'Contact for details'}</p>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-2">
                    <Clock className="text-gray-400 mt-0.5" size={16} />
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Hours</p>
                      <p className="text-sm text-gray-700">{location.hours || 'Check website for hours'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}