import React from 'react';

interface IdentifiedItem {
  name: string;
  confidence: number;
  is_recyclable: boolean;
  bin_type: 'recycling' | 'trash' | 'compost' | 'special';
  category: string;
  special_instructions: string;
  contamination_notes: string;
  alternative_disposal?: string;
  vision_labels?: string[];
  matching_method?: 'direct' | 'category' | 'material' | 'fuzzy' | 'none';
}

interface EnhancedRecyclingCardProps {
  item: IdentifiedItem;
  showDetails?: boolean;
}

export default function EnhancedRecyclingCard({ item, showDetails = false }: EnhancedRecyclingCardProps) {
  const getBinColor = () => {
    switch (item.bin_type) {
      case 'recycling':
        return 'border-primary-500 bg-primary-50';
      case 'trash':
        return 'border-red-500 bg-red-50';
      case 'compost':
        return 'border-green-600 bg-green-50';
      case 'special':
        return 'border-secondary-500 bg-secondary-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getBinIcon = () => {
    switch (item.bin_type) {
      case 'recycling':
        return '♻️';
      case 'trash':
        return '🗑️';
      case 'compost':
        return '🌱';
      case 'special':
        return '⚠️';
      default:
        return '❓';
    }
  };

  const getConfidenceColor = () => {
    if (item.confidence >= 80) return 'text-green-600 bg-green-100';
    if (item.confidence >= 60) return 'text-yellow-600 bg-yellow-100';
    if (item.confidence >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getMatchMethodLabel = () => {
    switch (item.matching_method) {
      case 'direct':
        return 'Direct Match';
      case 'category':
        return 'Category Match';
      case 'material':
        return 'Material Code Match';
      case 'fuzzy':
        return 'Approximate Match';
      case 'none':
        return 'No Match Found';
      default:
        return '';
    }
  };

  return (
    <div className={`rounded-xl shadow-lg border-2 ${getBinColor()} p-6 transition-all hover:shadow-xl`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{getBinIcon()}</span>
            <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
          </div>
          <p className="text-sm text-gray-600">Category: {item.category}</p>
        </div>

        {/* Confidence Score */}
        <div className="text-center">
          <div className={`inline-flex flex-col items-center px-3 py-2 rounded-lg ${getConfidenceColor()}`}>
            <span className="text-2xl font-bold">{item.confidence}%</span>
            <span className="text-xs">Confidence</span>
          </div>
          {item.matching_method && item.matching_method !== 'none' && (
            <p className="text-xs text-gray-500 mt-1">{getMatchMethodLabel()}</p>
          )}
        </div>
      </div>

      {/* Recyclable Status */}
      <div className="mb-4">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold ${
          item.is_recyclable
            ? 'bg-green-500 text-white'
            : item.bin_type === 'special'
            ? 'bg-yellow-500 text-white'
            : 'bg-red-500 text-white'
        }`}>
          {item.is_recyclable ? 'RECYCLABLE' : item.bin_type === 'special' ? 'SPECIAL DISPOSAL' : 'NOT RECYCLABLE'}
        </div>
      </div>

      {/* Instructions */}
      {item.special_instructions && (
        <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-700 mb-1 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Instructions
          </h4>
          <p className="text-sm text-gray-600">{item.special_instructions}</p>
        </div>
      )}

      {/* Contamination Notes */}
      {item.contamination_notes && (
        <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h4 className="font-semibold text-yellow-800 mb-1 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Important
          </h4>
          <p className="text-sm text-yellow-700">{item.contamination_notes}</p>
        </div>
      )}

      {/* Alternative Disposal */}
      {item.alternative_disposal && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-1 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Alternative Option
          </h4>
          <p className="text-sm text-blue-700">{item.alternative_disposal}</p>
        </div>
      )}

      {/* Vision Labels (Debug/Details) */}
      {showDetails && item.vision_labels && item.vision_labels.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-xs font-semibold text-gray-500 mb-2">Detected Labels</h4>
          <div className="flex flex-wrap gap-1">
            {item.vision_labels.map((label, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Low Confidence Warning */}
      {item.confidence < 50 && (
        <div className="mt-4 p-3 bg-orange-100 rounded-lg border border-orange-300">
          <p className="text-sm text-orange-800">
            <strong>Low confidence match.</strong> Consider using manual search for more accurate results.
          </p>
        </div>
      )}
    </div>
  );
}