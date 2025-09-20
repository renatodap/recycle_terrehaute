'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function HelpPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">How to Use</h1>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* How it Works */}
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">How RecycleIt! Works</h2>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Take a Photo</h3>
                  <p className="text-sm text-gray-600">Snap a picture of any item you&apos;re unsure about</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Get Instant Results</h3>
                  <p className="text-sm text-gray-600">AI identifies your item and checks Terre Haute guidelines</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Follow Instructions</h3>
                  <p className="text-sm text-gray-600">See exactly which bin to use or where to take special items</p>
                </div>
              </div>
            </div>
          </section>

          {/* Understanding Results */}
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Understanding Results</h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">♻️</span>
                <div>
                  <p className="font-medium text-gray-900">Blue Bin - Recycle</p>
                  <p className="text-xs text-gray-600">Curbside recycling accepted</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-2xl">🗑️</span>
                <div>
                  <p className="font-medium text-gray-900">Black Bin - Trash</p>
                  <p className="text-xs text-gray-600">Regular garbage only</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-2xl">🌱</span>
                <div>
                  <p className="font-medium text-gray-900">Green - Compost</p>
                  <p className="text-xs text-gray-600">Organic waste for composting</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-medium text-gray-900">Special Disposal</p>
                  <p className="text-xs text-gray-600">Requires drop-off at specific location</p>
                </div>
              </div>
            </div>
          </section>

          {/* Tips */}
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tips for Best Results</h2>

            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <p className="text-sm text-gray-600">Take clear photos with good lighting</p>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <p className="text-sm text-gray-600">Show the whole item when possible</p>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <p className="text-sm text-gray-600">Clean items before recycling</p>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <p className="text-sm text-gray-600">Check plastic numbers on bottom</p>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <p className="text-sm text-gray-600">When in doubt, throw it out</p>
              </li>
            </ul>
          </section>

          {/* Key Locations */}
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Drop-off Locations</h2>

            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-gray-900">ISU Recycling Center</p>
                <p className="text-gray-600">Glass bottles & jars (not curbside)</p>
              </div>

              <div>
                <p className="font-medium text-gray-900">Vigo County Hazardous Waste</p>
                <p className="text-gray-600">3025 S 4½ St • (812) 462-3370</p>
                <p className="text-gray-600">Batteries, paint, chemicals</p>
              </div>

              <div>
                <p className="font-medium text-gray-900">Composting Site</p>
                <p className="text-gray-600">10970 S Sullivan Place</p>
                <p className="text-gray-600">Yard waste & food scraps</p>
              </div>

              <div>
                <p className="font-medium text-gray-900">Grocery Stores</p>
                <p className="text-gray-600">Plastic bag recycling bins</p>
              </div>
            </div>
          </section>

          {/* About */}
          <section className="bg-green-50 rounded-2xl p-6 border-2 border-green-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">About This App</h2>
            <p className="text-sm text-gray-700 mb-3">
              Created by a Rose-Hulman student to help Terre Haute reduce recycling contamination and reach Indiana&apos;s 50% recycling goal.
            </p>
            <p className="text-xs text-gray-600">
              Current recycling rate: 19.5% • Goal: 50%
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}