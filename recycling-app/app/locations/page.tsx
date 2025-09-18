'use client';

import { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, Navigation, Sparkles, Recycle, AlertTriangle, Monitor, Heart, ShoppingBag } from 'lucide-react';
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
  { label: 'All', value: 'all', icon: Sparkles, gradient: 'from-gray-400 to-gray-600' },
  { label: 'Hazardous', value: 'hazardous', icon: AlertTriangle, gradient: 'from-amber-400 to-orange-600' },
  { label: 'Electronics', value: 'electronics', icon: Monitor, gradient: 'from-blue-400 to-indigo-600' },
  { label: 'Recycling', value: 'recycling', icon: Recycle, gradient: 'from-green-400 to-emerald-600' },
  { label: 'Donation', value: 'donation', icon: Heart, gradient: 'from-pink-400 to-purple-600' }
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

  const getTypeGradient = (type: string) => {
    switch (type) {
      case 'hazardous': return 'from-amber-400 to-orange-600';
      case 'electronics': return 'from-blue-400 to-indigo-600';
      case 'recycling': return 'from-green-400 to-emerald-600';
      case 'donation': return 'from-pink-400 to-purple-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hazardous': return AlertTriangle;
      case 'electronics': return Monitor;
      case 'recycling': return Recycle;
      case 'donation': return Heart;
      case 'retail': return ShoppingBag;
      default: return MapPin;
    }
  };

  const openDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <div className="min-h-screen relative pb-20">
      {/* Beautiful gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Animated orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-green-300 to-emerald-400 rounded-full opacity-20 animate-float blur-3xl" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-br from-cyan-300 to-blue-400 rounded-full opacity-20 animate-float blur-3xl" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-gradient-to-br from-purple-300 to-pink-400 rounded-full opacity-20 animate-float blur-3xl" style={{ animationDelay: '4s' }} />
      </div>

      {/* Header */}
      <header className="relative glass sticky top-0 z-40 border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl mb-3 shadow-lg">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Drop-off Locations
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Find the perfect place to recycle</p>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="relative sticky top-[108px] z-30 glass border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide justify-center flex-wrap">
            {materialFilters.map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`group relative px-5 py-2.5 rounded-2xl font-medium transition-all transform hover:scale-105 ${
                    filter === f.value
                      ? `bg-gradient-to-r ${f.gradient} text-white shadow-lg`
                      : 'bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {f.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Locations List */}
      <main className="relative max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredLocations.map((location, index) => {
            const TypeIcon = getTypeIcon(location.type);
            return (
              <div
                key={index}
                className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Gradient header */}
                <div className={`h-2 bg-gradient-to-r ${getTypeGradient(location.type)}`} />

                <div className="p-6">
                  {/* Icon and Title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${getTypeGradient(location.type)} rounded-2xl shadow-lg`}>
                      <TypeIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-1">{location.name}</h3>
                      <span className="inline-block px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-xs font-semibold rounded-full text-gray-700 dark:text-gray-200">
                        {location.type === 'hazardous' ? 'Hazardous Waste' :
                         location.type === 'electronics' ? 'Electronics' :
                         location.type === 'recycling' ? 'Recycling Center' :
                         location.type === 'donation' ? 'Donation Center' :
                         location.type === 'retail' ? 'Retail Drop-off' :
                         'Drop-off'}
                      </span>
                    </div>
                  </div>

                  {/* Info sections */}
                  <div className="space-y-3 mb-4">
                    {/* Address */}
                    <div className="flex items-start gap-3 group/item">
                      <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                        <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 flex-1">{location.address}</p>
                    </div>

                    {/* Hours */}
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 flex-1">{location.hours}</p>
                    </div>

                    {/* Phone */}
                    {location.phone && (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Phone className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <a
                          href={`tel:${location.phone}`}
                          className="text-sm text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                          {location.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Materials */}
                  <div className="mb-4">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Accepts</p>
                    <div className="flex flex-wrap gap-2">
                      {location.materials.map((material, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 text-xs font-medium rounded-xl text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
                        >
                          {material}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Fee Badge */}
                  {location.fee && (
                    <div className="mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 text-sm font-semibold text-emerald-700 dark:text-emerald-300 rounded-xl">
                        <Sparkles className="w-3 h-3" />
                        {location.fee}
                      </span>
                    </div>
                  )}

                  {/* Get Directions Button */}
                  <button
                    onClick={() => openDirections(location.address)}
                    className={`w-full py-3.5 px-6 bg-gradient-to-r ${getTypeGradient(location.type)} text-white font-semibold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 group`}
                  >
                    <Navigation className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span>Get Directions</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredLocations.length === 0 && (
          <div className="col-span-full text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-3xl mb-4">
              <MapPin className="w-10 h-10 text-gray-500 dark:text-gray-400" />
            </div>
            <p className="text-xl font-medium text-gray-500 dark:text-gray-400">
              No locations found for this filter
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Try selecting a different category
            </p>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}