'use client'
import { useState, useRef } from 'react'
import { Camera, Upload, Recycle } from 'lucide-react'
import Header from '@/components/Header'
import Image from 'next/image'

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [itemIdentified, setItemIdentified] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
        // Simulate item identification after 1 second
        setTimeout(() => setItemIdentified(true), 1000)
      }
      reader.readAsDataURL(file)
    }
  }

  const resetScanner = () => {
    setSelectedImage(null)
    setItemIdentified(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <>
      <Header />
      <main className="p-4 max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Scanner Area */}
          <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 mb-4">
            {selectedImage ? (
              <div className="relative w-full h-full">
                <Image
                  src={selectedImage}
                  alt="Scanned item"
                  fill
                  style={{ objectFit: 'cover' }}
                />
                {itemIdentified && (
                  <div className="absolute inset-x-0 bottom-0 bg-black/70 text-white p-4">
                    <p className="font-semibold">Glass Bottle</p>
                    <p className="text-sm">Go to Hub on Wabash Ave</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Camera size={64} />
                <p className="mt-2 text-sm">Upload or take photo</p>
              </div>
            )}
          </div>

          {/* Buttons */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            className="hidden"
          />

          {!selectedImage ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Camera size={20} />
              Scan Item
            </button>
          ) : (
            <button
              onClick={resetScanner}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Scan New Item
            </button>
          )}
        </div>
      </main>
    </>
  )
}