'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import DrawingCanvas from '@/components/DrawingCanvas'
import type { UserStroke, Character } from '@/types'

// Mock character data for testing
const mockCharacter: Character = {
  id: '1',
  traditional: '一',
  jyutping: 'jat1',
  english: 'one',
  strokeCount: 1,
  frequency: 1,
  difficulty: 1,
  strokes: [
    {
      id: 1,
      path: [
        { x: 50, y: 150 },
        { x: 250, y: 150 }
      ],
      direction: 'horizontal'
    }
  ]
}

export default function PracticePage() {
  const router = useRouter()
  const [userStrokes, setUserStrokes] = useState<UserStroke[]>([])
  const [showPrompts, setShowPrompts] = useState({
    character: true,
    jyutping: true,
    english: true,
    strokes: true
  })
  const [accuracy, setAccuracy] = useState<number | null>(null)

  const handleStrokeComplete = useCallback((stroke: UserStroke) => {
    setUserStrokes(prev => [...prev, stroke])
    
    // Simple accuracy calculation (placeholder)
    // This will be replaced with proper stroke validation later
    const strokeAccuracy = Math.random() * 30 + 70 // 70-100%
    setAccuracy(strokeAccuracy)
    
    console.log('Stroke completed:', stroke)
  }, [])

  const handleClear = useCallback(() => {
    setUserStrokes([])
    setAccuracy(null)
  }, [])

  const handleCheckAnswer = () => {
    if (userStrokes.length === 0) return
    
    // Placeholder validation logic
    const overallAccuracy = userStrokes.length === mockCharacter.strokeCount ? 95 : 60
    setAccuracy(overallAccuracy)
    
    // Show feedback
    alert(`Accuracy: ${overallAccuracy.toFixed(1)}%`)
  }

  const handleNextCharacter = () => {
    handleClear()
    setAccuracy(null)
    // In a real app, this would load the next character
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ← Back to Home
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              Character Practice
            </h1>
            <div className="text-sm text-gray-500">
              Stroke {userStrokes.length}/{mockCharacter.strokeCount}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Character Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Practice Character
              </h2>
              
              {/* Character Display */}
              {showPrompts.character && (
                <div className="text-center mb-6">
                  <div className="text-8xl font-serif text-gray-800 mb-2">
                    {mockCharacter.traditional}
                  </div>
                </div>
              )}
              
              {/* Pronunciation and Meaning */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {showPrompts.jyutping && (
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-700 mb-1">
                      Pronunciation
                    </div>
                    <div className="text-lg text-blue-900">
                      {mockCharacter.jyutping}
                    </div>
                  </div>
                )}
                
                {showPrompts.english && (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-sm font-medium text-green-700 mb-1">
                      Meaning
                    </div>
                    <div className="text-lg text-green-900">
                      {mockCharacter.english}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Difficulty Controls */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">
                  Prompts (Difficulty Level 1)
                </h3>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showPrompts.character}
                      onChange={(e) => setShowPrompts(prev => ({
                        ...prev,
                        character: e.target.checked
                      }))}
                      className="rounded text-indigo-600 mr-2"
                    />
                    Character
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showPrompts.jyutping}
                      onChange={(e) => setShowPrompts(prev => ({
                        ...prev,
                        jyutping: e.target.checked
                      }))}
                      className="rounded text-indigo-600 mr-2"
                    />
                    Pronunciation
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showPrompts.english}
                      onChange={(e) => setShowPrompts(prev => ({
                        ...prev,
                        english: e.target.checked
                      }))}
                      className="rounded text-indigo-600 mr-2"
                    />
                    Meaning
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showPrompts.strokes}
                      onChange={(e) => setShowPrompts(prev => ({
                        ...prev,
                        strokes: e.target.checked
                      }))}
                      className="rounded text-indigo-600 mr-2"
                    />
                    Stroke Guide
                  </label>
                </div>
              </div>
            </div>

            {/* Accuracy Display */}
            {accuracy !== null && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Performance
                </h3>
                
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-indigo-600">
                    {accuracy.toFixed(1)}%
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {accuracy >= 95 ? '🎉 Excellent!' :
                     accuracy >= 80 ? '👍 Good job!' :
                     accuracy >= 60 ? '📝 Keep practicing' :
                     '💪 Try again'}
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${accuracy}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Drawing Canvas */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Draw the Character
              </h2>
              
              <DrawingCanvas
                onStrokeComplete={handleStrokeComplete}
                onClear={handleClear}
                className="mx-auto"
              />
              
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleCheckAnswer}
                  disabled={userStrokes.length === 0}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  Check Answer
                </button>
                
                {accuracy !== null && accuracy >= 80 && (
                  <button
                    onClick={handleNextCharacter}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Next Character →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}