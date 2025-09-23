'use client'
import { useState } from 'react'
import Image from 'next/image'

export default function TestPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const testAppleImage = async () => {
    setLoading(true)
    setError('')
    setResult('')

    try {
      // Load the apple image and convert to base64
      const response = await fetch('/test-images/apple.jpg')
      const blob = await response.blob()

      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result as string

        // Call our API
        const apiResponse = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ image: base64 })
        })

        const data = await apiResponse.json()

        if (!apiResponse.ok) {
          setError(`API Error: ${data.error}\nDetails: ${data.details || 'No details'}\nHint: ${data.hint || 'No hint'}`)
        } else {
          setResult(JSON.stringify(data, null, 2))
        }
        setLoading(false)
      }
      reader.readAsDataURL(blob)
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">OpenAI API Test Page</h1>

      <div className="border-2 border-gray-300 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Apple Image</h2>

        <div className="mb-4">
          <Image
            src="/test-images/apple.jpg"
            alt="Test apple"
            width={200}
            height={200}
            className="rounded-lg"
          />
        </div>

        <button
          onClick={testAppleImage}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Testing...' : 'Test Apple Detection'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 mb-4">
          <h3 className="font-bold text-red-700 mb-2">Error:</h3>
          <pre className="text-red-600 whitespace-pre-wrap">{error}</pre>
        </div>
      )}

      {result && (
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
          <h3 className="font-bold text-green-700 mb-2">Success!</h3>
          <pre className="text-green-600 whitespace-pre-wrap">{result}</pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-bold mb-2">Setup Instructions:</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>Get an OpenAI API key from <a href="https://platform.openai.com/api-keys" target="_blank" className="text-blue-600 underline">https://platform.openai.com/api-keys</a></li>
          <li>Add it to your <code className="bg-gray-200 px-1">.env.local</code> file as <code className="bg-gray-200 px-1">OPENAI_API_KEY=sk-...</code></li>
          <li>Restart the Next.js dev server</li>
          <li>Click the test button above</li>
        </ol>

        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="text-sm font-mono">Current API Key Status: Check console logs</p>
        </div>
      </div>
    </div>
  )
}