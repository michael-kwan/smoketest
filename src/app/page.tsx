'use client'

import { useState } from 'react'

export default function Home() {
  const [isStarted, setIsStarted] = useState(false)

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full text-center space-y-8">
        {/* App Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            煙測
          </h1>
          <p className="text-lg text-gray-600">
            SmokeTest
          </p>
          <p className="text-sm text-gray-500 leading-relaxed">
            Learn traditional Chinese characters through stroke order practice with adaptive difficulty
          </p>
        </div>

        {/* Quick Start Button */}
        {!isStarted ? (
          <div className="space-y-4">
            <button
              onClick={() => setIsStarted(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Start Learning
            </button>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/50 rounded-lg p-3">
                <div className="font-medium text-gray-700">Characters</div>
                <div className="text-gray-500">1000+</div>
              </div>
              <div className="bg-white/50 rounded-lg p-3">
                <div className="font-medium text-gray-700">Stroke Order</div>
                <div className="text-gray-500">Validated</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Ready to Practice!
              </h2>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Canvas drawing system - Coming next</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Character database - In progress</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span>Stroke validation - Planned</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsStarted(false)}
              className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              ← Back to Start
            </button>
          </div>
        )}

        {/* Footer Info */}
        <div className="pt-8 text-xs text-gray-400 space-y-1">
          <p>Progressive Web App</p>
          <p>Works offline • Install on home screen</p>
        </div>
      </div>
    </main>
  )
}