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
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Fixed Header */}
      <header className="bg-white border-b-2 border-gray-300 p-3 flex-shrink-0 z-10">
        <h1 className="text-lg font-bold flex items-center gap-2 text-black">
          <Recycle className="text-green-600" size={20} />
          Recycle Terre Haute
        </h1>
      </header>

      {/* Main Content - Scrollable */}
      <main className="flex-1 p-3 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
        <h2 className="text-base font-bold mb-3 flex items-center gap-2 text-black">
          <MapPin className="text-green-600" size={18} />
          Recycling Locations
        </h2>

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            Loading locations...
          </div>
        ) : (
          <div className="space-y-3">
            {locations.map((location, index) => (
              <div
                key={location.id}
                className="border border-gray-300 rounded-lg p-3 bg-white"
              >
                {/* Location Header */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-sm text-black pr-2">
                    {location.name}
                  </h3>
                  <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                    #{index + 1}
                  </span>
                </div>

                <div className="space-y-2">
                  {/* Address */}
                  <div className="flex items-start gap-2">
                    <MapPin className="text-green-600 mt-0.5 flex-shrink-0" size={14} />
                    <p className="text-xs text-gray-700">{location.address || 'No address available'}</p>
                  </div>

                  {/* Accepts */}
                  <div className="flex items-start gap-2">
                    <Package className="text-green-600 mt-0.5 flex-shrink-0" size={14} />
                    <p className="text-xs text-gray-700">{location.accepts || 'Contact for details'}</p>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-2">
                    <Clock className="text-green-600 mt-0.5 flex-shrink-0" size={14} />
                    <p className="text-xs text-gray-700">{location.hours || 'Check website for hours'}</p>
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