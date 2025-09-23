'use client';

export default function AnalyzingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mb-6"></div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Analyzing Your Item
        </h2>

        <p className="text-gray-600">
          This will just take a moment...
        </p>
      </div>
    </div>
  );
}