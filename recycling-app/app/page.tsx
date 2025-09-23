'use client';

import { useState, useRef } from 'react';
import { Camera, Upload } from 'lucide-react';
import AnalyzingScreen from '@/components/AnalyzingScreen';
import ResultsScreen from '@/components/ResultsScreen';
import { RecyclingResult } from '@/types/recycling';

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<RecyclingResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setIsAnalyzing(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;

      try {
        const response = await fetch('/api/identify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64String }),
        });

        if (!response.ok) throw new Error('Failed to analyze image');

        const data = await response.json();
        if (!data.success || !data.item) {
          throw new Error(data.error || 'Failed to analyze image');
        }

        const recyclingResult: RecyclingResult = {
          item_name: String(data.item?.name || 'Unknown Item'),
          is_recyclable: Boolean(data.item?.is_recyclable),
          bin_color: (data.item?.bin_color as 'Blue' | 'Green' | 'Black' | 'Special') || 'Black',
          disposal_method: String(data.item?.disposal_method || 'Place in regular trash'),
          preparation: String(data.item?.preparation || ''),
          special_instructions: data.item?.special_instructions,
          disposal_location: data.item?.disposal_location,
          disposal_address: data.item?.disposal_address,
          disposal_phone: data.item?.disposal_phone,
          confidence: Number(data.confidence) || 0.5
        };

        setResult(recyclingResult);
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to analyze image. Please try again.');
      } finally {
        setIsAnalyzing(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const resetApp = () => {
    setResult(null);
    setIsAnalyzing(false);
  };

  if (isAnalyzing) return <AnalyzingScreen />;
  if (result) return <ResultsScreen result={result} onReset={resetApp} />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-green-600 mb-3">
            RecycleIt!
          </h1>
          <p className="text-gray-600">
            Snap a photo to find out how to recycle any item
          </p>
        </div>

        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative bg-white rounded-3xl p-12 cursor-pointer
            border-3 border-dashed transition-all
            ${isDragging
              ? 'border-green-400 bg-green-50 scale-105'
              : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'}
          `}
        >
          <div className="text-center">
            <Camera className={`w-20 h-20 mx-auto mb-4 ${isDragging ? 'text-green-500' : 'text-gray-400'}`} />

            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {isDragging ? 'Drop your image here!' : 'Click or drag an image'}
            </h2>

            <p className="text-sm text-gray-500 mb-6">
              JPG, PNG, or HEIF • Max 10MB
            </p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-6 py-3 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Take Photo
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-6 py-3 bg-white border-2 border-green-600 text-green-600 rounded-full font-medium hover:bg-green-50 transition-colors flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Browse Files
              </button>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl">
            <div className="text-3xl mb-3">♻️</div>
            <h3 className="font-semibold text-gray-800 mb-1">Blue Bin</h3>
            <p className="text-sm text-gray-600">Paper, plastic, metal, glass</p>
          </div>

          <div className="bg-white p-6 rounded-2xl">
            <div className="text-3xl mb-3">🌱</div>
            <h3 className="font-semibold text-gray-800 mb-1">Green Bin</h3>
            <p className="text-sm text-gray-600">Food waste, yard waste</p>
          </div>

          <div className="bg-white p-6 rounded-2xl">
            <div className="text-3xl mb-3">🗑️</div>
            <h3 className="font-semibold text-gray-800 mb-1">Black Bin</h3>
            <p className="text-sm text-gray-600">Non-recyclable waste</p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          capture="environment"
        />
      </div>
    </div>
  );
}