'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search } from 'lucide-react';

const faqItems = [
  // Recyclable items
  { item: 'Aluminum Cans', recyclable: true, icon: '♻️', category: 'recycle', instructions: 'Rinse clean, place in blue bin' },
  { item: 'Cardboard Boxes', recyclable: true, icon: '♻️', category: 'recycle', instructions: 'Flatten completely, remove tape' },
  { item: 'Paper (Office/Newspaper)', recyclable: true, icon: '♻️', category: 'recycle', instructions: 'Keep dry and clean' },
  { item: 'Plastic Bottles (#1, #2, #5)', recyclable: true, icon: '♻️', category: 'recycle', instructions: 'Check number on bottom, rinse clean' },
  { item: 'Steel/Tin Cans', recyclable: true, icon: '♻️', category: 'recycle', instructions: 'Rinse clean, labels OK' },

  // Special recycling
  { item: 'Glass Bottles/Jars', recyclable: true, icon: '🏫', category: 'special', instructions: 'Take to ISU Recycling Center - NOT curbside!' },
  { item: 'Plastic Bags', recyclable: false, icon: '🏪', category: 'special', instructions: 'Return to grocery store bins' },

  // Trash items
  { item: 'Styrofoam', recyclable: false, icon: '🗑️', category: 'trash', instructions: 'Never recyclable - regular trash' },
  { item: 'Chip Bags', recyclable: false, icon: '🗑️', category: 'trash', instructions: 'Multi-layer material - trash only' },
  { item: 'Pizza Boxes (Greasy)', recyclable: false, icon: '🗑️', category: 'trash', instructions: 'Food contamination - trash' },
  { item: 'Candy Wrappers', recyclable: false, icon: '🗑️', category: 'trash', instructions: 'Too small, multi-layer - trash' },
  { item: 'Tissues/Paper Towels', recyclable: false, icon: '🗑️', category: 'trash', instructions: 'Contaminated paper - trash' },
  { item: 'Broken Ceramics', recyclable: false, icon: '🗑️', category: 'trash', instructions: 'Not recyclable - trash' },

  // Compostable
  { item: 'Food Scraps', recyclable: false, icon: '🌱', category: 'compost', instructions: 'Home compost or Vigo County site' },
  { item: 'Yard Waste', recyclable: false, icon: '🌱', category: 'compost', instructions: 'Vigo County Composting Site' },
  { item: 'Leaves & Grass', recyclable: false, icon: '🌱', category: 'compost', instructions: 'NO plastic bags at compost site' },

  // Hazardous
  { item: 'Batteries', recyclable: false, icon: '⚠️', category: 'hazard', instructions: 'Vigo County Hazardous Waste Center' },
  { item: 'Electronics', recyclable: false, icon: '⚠️', category: 'hazard', instructions: 'E-waste drop-off or Best Buy' },
  { item: 'Paint', recyclable: false, icon: '⚠️', category: 'hazard', instructions: 'Hazardous waste or Tox Away events' },
  { item: 'Fluorescent Bulbs', recyclable: false, icon: '⚠️', category: 'hazard', instructions: 'Contains mercury - hazardous waste' },
  { item: 'Motor Oil', recyclable: false, icon: '⚠️', category: 'hazard', instructions: 'Never dump - hazardous waste center' },
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const router = useRouter();

  const filteredItems = faqItems.filter(item => {
    const matchesSearch = item.item.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'All Items', color: 'bg-gray-100 text-gray-700' },
    { id: 'recycle', label: '♻️ Recycle', color: 'bg-blue-100 text-blue-700' },
    { id: 'trash', label: '🗑️ Trash', color: 'bg-gray-100 text-gray-700' },
    { id: 'compost', label: '🌱 Compost', color: 'bg-green-100 text-green-700' },
    { id: 'hazard', label: '⚠️ Hazard', color: 'bg-amber-100 text-amber-700' },
    { id: 'special', label: '🏪 Special', color: 'bg-purple-100 text-purple-700' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Can I Recycle...?</h1>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-green-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? category.color + ' shadow-md scale-105'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Item List */}
      <main className="px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No items found matching &quot;{searchTerm}&quot;</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{item.icon}</span>
                        <h3 className="font-semibold text-gray-900">{item.item}</h3>
                      </div>
                      <p className="text-sm text-gray-600 ml-10">{item.instructions}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.recyclable
                        ? 'bg-green-100 text-green-700'
                        : item.category === 'trash'
                        ? 'bg-gray-100 text-gray-700'
                        : item.category === 'compost'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.recyclable ? 'Yes' : item.category === 'compost' ? 'Compost' : 'No'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Card */}
          <div className="mt-8 bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">📊 Did you know?</h3>
            <p className="text-sm text-blue-800">
              Indiana&apos;s recycling rate is only 19.5%. Help Terre Haute reach the 50% goal by recycling correctly!
            </p>
          </div>

          {/* Resources */}
          <div className="mt-6 space-y-3">
            <a
              href="https://www.vigocountysolidwaste.org"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <p className="font-medium text-gray-900 mb-1">Vigo County Solid Waste →</p>
              <p className="text-sm text-gray-600">Official recycling guidelines</p>
            </a>

            <a
              href="tel:8124623370"
              className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <p className="font-medium text-gray-900 mb-1">📞 (812) 462-3370</p>
              <p className="text-sm text-gray-600">Call for hazardous waste questions</p>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}