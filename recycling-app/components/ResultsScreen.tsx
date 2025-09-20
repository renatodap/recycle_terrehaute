'use client';

import { useState } from 'react';
import {
  Recycle,
  Trash2,
  AlertTriangle,
  Leaf,
  MapPin,
  HelpCircle,
  Camera,
  X,
  ChevronRight
} from 'lucide-react';
import { RecyclingResult } from '@/types/recycling';

interface Props {
  result: RecyclingResult;
  onReset: () => void;
}

export default function ResultsScreen({ result, onReset }: Props) {
  const [showWhy, setShowWhy] = useState(false);
  const [showLocations, setShowLocations] = useState(false);

  // Determine the main icon and color based on disposal method
  const getDisposalDisplay = () => {
    switch (result.bin_color) {
      case 'Blue':
        return {
          icon: <Recycle className="w-24 h-24 text-white" />,
          bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
          textColor: 'text-blue-600',
          borderColor: 'border-blue-200',
          label: '♻️ Recycle',
          instruction: 'Place in your blue recycling bin'
        };
      case 'Green':
        return {
          icon: <Leaf className="w-24 h-24 text-white" />,
          bgColor: 'bg-gradient-to-br from-green-500 to-green-600',
          textColor: 'text-green-600',
          borderColor: 'border-green-200',
          label: '🌱 Compost',
          instruction: result.disposal_method
        };
      case 'Black':
        return {
          icon: <Trash2 className="w-24 h-24 text-white" />,
          bgColor: 'bg-gradient-to-br from-gray-600 to-gray-700',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          label: '🗑️ Trash',
          instruction: 'Place in your regular trash bin'
        };
      case 'Special':
        return {
          icon: <AlertTriangle className="w-24 h-24 text-white" />,
          bgColor: 'bg-gradient-to-br from-amber-500 to-amber-600',
          textColor: 'text-amber-600',
          borderColor: 'border-amber-200',
          label: '⚠️ Special Disposal',
          instruction: result.disposal_method
        };
      default:
        return {
          icon: <HelpCircle className="w-24 h-24 text-white" />,
          bgColor: 'bg-gradient-to-br from-gray-500 to-gray-600',
          textColor: 'text-gray-600',
          borderColor: 'border-gray-200',
          label: 'Check Guidelines',
          instruction: result.disposal_method
        };
    }
  };

  const display = getDisposalDisplay();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-white">
      {/* Header with back button */}
      <header className="px-4 py-4 flex items-center justify-between">
        <button
          onClick={onReset}
          className="p-2 rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow"
        >
          <Camera className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">Result</h1>
        <div className="w-9" /> {/* Spacer for centering */}
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-8">
        <div className="max-w-md mx-auto space-y-6">
          {/* Item Detection */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Detected:</p>
            <h2 className="text-2xl font-bold text-gray-900">{result.item_name}</h2>
            {result.confidence < 0.7 && (
              <p className="text-xs text-amber-600 mt-1">Low confidence - verify item type</p>
            )}
          </div>

          {/* Big Icon with Disposal Method */}
          <div className="text-center">
            <div className={`w-48 h-48 mx-auto rounded-3xl ${display.bgColor} shadow-2xl flex items-center justify-center mb-4`}>
              {display.icon}
            </div>
            <h3 className="text-3xl font-bold mb-2">{display.label}</h3>
            <p className="text-gray-700 text-lg px-4">{display.instruction}</p>
          </div>

          {/* Preparation Instructions */}
          {result.preparation && (
            <div className={`bg-white rounded-2xl border-2 ${display.borderColor} p-4`}>
              <p className="text-sm font-medium text-gray-700 mb-1">Preparation:</p>
              <p className="text-gray-600">{result.preparation}</p>
            </div>
          )}

          {/* Special Instructions */}
          {result.special_instructions && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
              <p className="text-sm font-medium text-amber-800 mb-1">⚠️ Important:</p>
              <p className="text-amber-700">{result.special_instructions}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Why Button */}
            <button
              onClick={() => setShowWhy(!showWhy)}
              className="w-full flex items-center justify-between bg-white rounded-2xl border-2 border-gray-200 p-4 hover:border-green-500 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">Why?</span>
              </div>
              <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${showWhy ? 'rotate-90' : ''}`} />
            </button>

            {/* Special Disposal Location */}
            {result.bin_color === 'Special' && result.disposal_location && (
              <button
                onClick={() => setShowLocations(!showLocations)}
                className="w-full flex items-center justify-between bg-white rounded-2xl border-2 border-gray-200 p-4 hover:border-green-500 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Find Drop-off Location</span>
                </div>
                <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${showLocations ? 'rotate-90' : ''}`} />
              </button>
            )}

            {/* Take Another Photo */}
            <button
              onClick={onReset}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Take Another Photo
            </button>
          </div>
        </div>
      </main>

      {/* Why Modal */}
      {showWhy && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-w-md mx-auto p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Why this disposal method?</h3>
              <button
                onClick={() => setShowWhy(false)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-3">
              {result.bin_color === 'Blue' && (
                <>
                  <p className="text-gray-700">This item is made from materials that can be processed and turned into new products.</p>
                  <p className="text-sm text-gray-600">✅ Accepted in Terre Haute curbside recycling</p>
                  <p className="text-sm text-gray-600">📊 Help reach Indiana&apos;s 50% recycling goal (currently 19.5%)</p>
                </>
              )}

              {result.bin_color === 'Black' && (
                <>
                  <p className="text-gray-700">This item cannot be recycled due to:</p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• Multi-layer materials that can&apos;t be separated</li>
                    <li>• Contamination that makes recycling impossible</li>
                    <li>• No local facilities to process this material</li>
                  </ul>
                  <p className="text-sm text-green-600 mt-3">💡 Tip: Look for alternatives with less packaging!</p>
                </>
              )}

              {result.bin_color === 'Green' && (
                <>
                  <p className="text-gray-700">Composting organic waste:</p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• Reduces methane emissions from landfills</li>
                    <li>• Creates nutrient-rich soil</li>
                    <li>• Diverts 30% of household waste</li>
                  </ul>
                  <p className="text-sm text-green-600 mt-3">🌱 Consider starting a home compost bin!</p>
                </>
              )}

              {result.bin_color === 'Special' && (
                <>
                  <p className="text-gray-700">Requires special handling because:</p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• Contains hazardous materials</li>
                    <li>• Can damage recycling equipment</li>
                    <li>• Needs specialized processing</li>
                  </ul>
                  <p className="text-sm text-red-600 mt-3">⚠️ Never put in regular trash or recycling!</p>
                </>
              )}

              <div className="pt-3 border-t border-gray-200">
                <a
                  href="https://www.vigocountysolidwaste.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  View full Vigo County guidelines →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Locations Modal */}
      {showLocations && result.disposal_location && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-w-md mx-auto p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Drop-off Location</h3>
              <button
                onClick={() => setShowLocations(false)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{result.disposal_location}</h4>
                {result.disposal_address && (
                  <p className="text-sm text-gray-600 mb-1">📍 {result.disposal_address}</p>
                )}
                {result.disposal_phone && (
                  <p className="text-sm text-gray-600">📞 {result.disposal_phone}</p>
                )}
              </div>

              <button
                onClick={() => {
                  if (result.disposal_address) {
                    window.open(`https://maps.google.com/?q=${encodeURIComponent(result.disposal_address)}`, '_blank');
                  }
                }}
                className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Open in Maps
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}