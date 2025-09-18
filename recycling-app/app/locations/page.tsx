'use client';

import { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, Navigation } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

type Location = {
  name: string;
  address: string;
  phone?: string;
  hours: string;
  type: string;
  materials: string[];
  distance?: number;
  lat?: number;
  lng?: number;
  fee?: string;
};

const locations: Location[] = [
  {
    name: 'Vigo County Household Hazardous Waste Center',
    address: '3025 S 4 1/2 St, Terre Haute, IN 47802',
    phone: '(812) 462-3370',
    hours: 'Tue-Fri: 8AM-4PM, Sat: 8AM-12PM',
    type: 'hazardous',
    materials: ['Batteries', 'Paint', 'Chemicals', 'Electronics', 'Oil'],
    lat: 39.4259,
    lng: -87.3837,
    fee: 'Free for residents'
  },
  {
    name: 'Republic Services Recycling Center',
    address: '3400 S 7th St, Terre Haute, IN 47802',
    phone: '(812) 232-2627',
    hours: 'Mon-Fri: 7AM-5PM, Sat: 8AM-12PM',
    type: 'recycling',
    materials: ['Paper', 'Cardboard', 'Plastic', 'Glass', 'Metal'],
    lat: 39.4221,
    lng: -87.3912
  },
  {
    name: 'Goodwill Store & Donation Center',
    address: '2931 Ohio St, Terre Haute, IN 47803',
    phone: '(812) 235-1827',
    hours: 'Mon-Sat: 9AM-8PM, Sun: 12PM-6PM',
    type: 'donation',
    materials: ['Clothing', 'Furniture', 'Electronics', 'Books'],
    lat: 39.4685,
    lng: -87.3789
  },
  {
    name: 'Best Buy - Electronics Recycling',
    address: '3401 US-41, Terre Haute, IN 47802',
    phone: '(812) 234-2617',
    hours: 'Mon-Sat: 10AM-9PM, Sun: 11AM-7PM',
    type: 'electronics',
    materials: ['TVs', 'Computers', 'Phones', 'Cables', 'Batteries'],
    lat: 39.4232,
    lng: -87.3901,
    fee: 'Some items have fees'
  },
  {
    name: 'Walmart Supercenter - Plastic Bag Recycling',
    address: '5555 US-41, Terre Haute, IN 47802',
    phone: '(812) 238-0506',
    hours: '24 hours',
    type: 'retail',
    materials: ['Plastic bags', 'Plastic film'],
    lat: 39.3981,
    lng: -87.3862
  }
];

const materialFilters = [
  { label: 'All', value: 'all' },
  { label: 'Hazardous', value: 'hazardous', color: 'bg-yellow-500' },
  { label: 'Electronics', value: 'electronics', color: 'bg-blue-500' },
  { label: 'Regular', value: 'recycling', color: 'bg-green-500' },
  { label: 'Donation', value: 'donation', color: 'bg-purple-500' }
];

export default function LocationsPage() {
  const [filter, setFilter] = useState('all');
  const [filteredLocations, setFilteredLocations] = useState(locations);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredLocations(locations);
    } else {
      setFilteredLocations(locations.filter(loc => loc.type === filter));
    }
  }, [filter]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hazardous': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'electronics': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'recycling': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'donation': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const openDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-center">Drop-off Locations</h1>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-14 z-30">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {materialFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
                  filter === f.value
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {f.color && (
                  <span className={`inline-block w-2 h-2 rounded-full ${f.color} mr-2`}></span>
                )}
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Locations List */}
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="space-y-4">
          {filteredLocations.map((location, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
            >
              <div className="p-4">
                {/* Location Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{location.name}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getTypeColor(location.type)}`}>
                      {location.type === 'hazardous' ? 'Hazardous Waste' :
                       location.type === 'electronics' ? 'Electronics' :
                       location.type === 'recycling' ? 'Recycling Center' :
                       location.type === 'donation' ? 'Donation Center' :
                       'Drop-off'}
                    </span>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start space-x-2 mb-2 text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{location.address}</p>
                </div>

                {/* Hours */}
                <div className="flex items-start space-x-2 mb-2 text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{location.hours}</p>
                </div>

                {/* Phone */}
                {location.phone && (
                  <div className="flex items-center space-x-2 mb-3 text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <a href={`tel:${location.phone}`} className="text-sm hover:text-green-600">
                      {location.phone}
                    </a>
                  </div>
                )}

                {/* Materials Accepted */}
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Accepts:</p>
                  <div className="flex flex-wrap gap-1">
                    {location.materials.map((material, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-md"
                      >
                        {material}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Fee Info */}
                {location.fee && (
                  <div className="mb-3 text-sm text-green-600 dark:text-green-400 font-medium">
                    {location.fee}
                  </div>
                )}

                {/* Get Directions Button */}
                <button
                  onClick={() => openDirections(location.address)}
                  className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Get Directions</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredLocations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No locations found for this filter.
            </p>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}