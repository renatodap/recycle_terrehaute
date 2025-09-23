import React from 'react';

interface RecyclingInfoCardProps {
  item: string;
  category: string;
  recyclable: string;
  instructions?: string;
  confidence?: number;
}

export default function RecyclingInfoCard({
  item,
  category,
  recyclable,
  instructions,
  confidence
}: RecyclingInfoCardProps) {
  const isRecyclable = recyclable.toLowerCase() === 'yes';
  const isSpecial = recyclable.toLowerCase() === 'special';
  const isPartial = recyclable.toLowerCase() === 'partial';

  const getBadgeColor = () => {
    if (isRecyclable) return 'bg-primary-500 text-white';
    if (isSpecial) return 'bg-secondary-400 text-gray-900';
    if (isPartial) return 'bg-yellow-400 text-gray-900';
    return 'bg-red-500 text-white';
  };

  const getBorderColor = () => {
    if (isRecyclable) return 'border-primary-500';
    if (isSpecial) return 'border-secondary-400';
    if (isPartial) return 'border-yellow-400';
    return 'border-red-500';
  };

  const getIcon = () => {
    if (isRecyclable) return '♻️';
    if (isSpecial) return '⚠️';
    if (isPartial) return '⚡';
    return '🚫';
  };

  const getStatusText = () => {
    if (isRecyclable) return 'Recyclable';
    if (isSpecial) return 'Special Disposal';
    if (isPartial) return 'Partially Recyclable';
    return 'Not Recyclable';
  };

  return (
    <div className={`bg-white rounded-lg shadow-md border-2 ${getBorderColor()} p-6 transition-all hover:shadow-lg`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{item}</h3>
          <p className="text-sm text-gray-600">Category: {category}</p>
        </div>
        <div className="text-3xl ml-4">{getIcon()}</div>
      </div>

      <div className="mb-4">
        <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${getBadgeColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {confidence && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Confidence</span>
            <span>{Math.round(confidence * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all"
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
        </div>
      )}

      {instructions && (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700 mb-1">Instructions:</p>
          <p className="text-sm text-gray-600">{instructions}</p>
        </div>
      )}
    </div>
  );
}