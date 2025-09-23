import { Recycle } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-md mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Recycle className="text-green-600" size={28} />
          RecycleIt! Terre Haute
        </h1>
      </div>
    </header>
  )
}