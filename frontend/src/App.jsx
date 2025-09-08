import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          ✅ ¡Tailwind v3 funcionando!
        </h1>
        <p className="text-gray-600 mb-6">
          Versión compatible con Node.js 22.11.0
        </p>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
          Todo bien ahora
        </button>
      </div>
    </div>
  )
}


export default App
