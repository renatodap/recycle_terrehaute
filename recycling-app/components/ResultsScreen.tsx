'use client';

import { ArrowLeft, MapPin, Phone } from 'lucide-react';
import { RecyclingResult } from '@/types/recycling';

interface Props {
  result: RecyclingResult;
  onReset: () => void;
}

export default function ResultsScreen({ result, onReset }: Props) {
  const getBinInfo = () => {
    switch (result.bin_color) {
      case 'Blue':
        return {
          emoji: '♻️',
          color: 'bg-blue-100 border-blue-300 text-blue-900',
          label: 'Recyclable'
        };
      case 'Green':
        return {
          emoji: '🌱',
          color: 'bg-green-100 border-green-300 text-green-900',
          label: 'Compostable'
        };
      case 'Black':
        return {
          emoji: '🗑️',
          color: 'bg-gray-100 border-gray-300 text-gray-900',
          label: 'Regular Trash'
        };
      case 'Special':
        return {
          emoji: '⚠️',
          color: 'bg-amber-100 border-amber-300 text-amber-900',
          label: 'Special Disposal'
        };
      default:
        return {
          emoji: '❓',
          color: 'bg-gray-100 border-gray-300 text-gray-900',
          label: 'Unknown'
        };
    }
  };

  const binInfo = getBinInfo();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Item Name */}
        <div className="bg-white rounded-2xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {result.item_name}
          </h1>
          <p className="text-sm text-gray-500">
            {((result.confidence || 0) * 100).toFixed(0)}% confidence
          </p>
        </div>

        {/* Disposal Method */}
        <div className={`rounded-2xl p-6 mb-6 border-2 ${binInfo.color}`}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{binInfo.emoji}</span>
            <h2 className="text-2xl font-bold">{binInfo.label}</h2>
          </div>
          <p className="text-lg">{result.disposal_method}</p>
        </div>

        {/* Preparation */}
        {result.preparation && (
          <div className="bg-white rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-2">How to Prepare:</h3>
            <p className="text-gray-700">{result.preparation}</p>
          </div>
        )}

        {/* Special Instructions */}
        {result.special_instructions && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-amber-900 mb-2">⚠️ Important Note</h3>
            <p className="text-amber-800">{result.special_instructions}</p>
          </div>
        )}

        {/* Drop-off Location */}
        {result.disposal_location && (
          <div className="bg-white rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-3">📍 Drop-off Location</h3>
            <p className="font-semibold text-gray-900 mb-2">{result.disposal_location}</p>

            {result.disposal_address && (
              <div className="flex items-start gap-2 text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mt-0.5" />
                <p className="text-sm">{result.disposal_address}</p>
              </div>
            )}

            {result.disposal_phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <a href={`tel:${result.disposal_phone}`} className="text-sm text-blue-600 hover:underline">
                  {result.disposal_phone}
                </a>
              </div>
            )}

            {result.disposal_address && (
              <button
                onClick={() => window.open(`https://maps.google.com?q=${encodeURIComponent(result.disposal_address!)}`, '_blank')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Directions
              </button>
            )}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onReset}
          className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold text-lg hover:bg-green-700 transition-colors"
        >
          Scan Another Item
        </button>
      </div>
    </div>
  );
}