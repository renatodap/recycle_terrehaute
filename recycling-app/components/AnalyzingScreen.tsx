'use client';

import { useEffect, useState } from 'react';
import { Recycle } from 'lucide-react';

export default function AnalyzingScreen() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-white px-4">
      <div className="text-center">
        {/* Animated Icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto">
            {/* Spinning circle */}
            <div className="absolute inset-0 border-4 border-green-200 rounded-full animate-pulse" />
            <div className="absolute inset-0 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />

            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Recycle className="w-12 h-12 text-green-600 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Text */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Analyzing your item{dots}
        </h2>
        <p className="text-gray-600">
          Checking Terre Haute recycling guidelines
        </p>

        {/* Loading bar */}
        <div className="mt-8 w-64 mx-auto">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full animate-loading-bar" />
          </div>
        </div>
      </div>
    </div>
  );
}