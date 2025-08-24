'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DrawingCanvas from '@/components/DrawingCanvas'
import StrokeInsights from '@/components/StrokeInsights'
import { useMultiExerciseSession } from '@/hooks/useMultiExerciseSession'
import { PracticeSessionStorage } from '@/lib/strokeStorage'
import type { UserStroke, Exercise, PracticeSession } from '@/types'

export default function PracticePage() {
  const router = useRouter()
  const [showPrompts, setShowPrompts] = useState({
    character: true,
    jyutping: true,
    english: true,
    strokes: true
  })
  const [sessionStarted, setSessionStarted] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error' | 'info'
    show: boolean
  }>({ message: '', type: 'info', show: false })
  const [currentSnapshot, setCurrentSnapshot] = useState<string | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load exercises from database
  useEffect(() => {
    async function loadExercises() {
      try {
        setLoading(true)
        const response = await fetch('/api/exercises')
        if (!response.ok) {
          throw new Error('Failed to load exercises')
        }
        const data = await response.json()
        setExercises(data.exercises || [])
        console.log('Loaded exercises from database:', data.exercises?.length)
      } catch (err) {
        console.error('Error loading exercises:', err)
        setError(err instanceof Error ? err.message : 'Failed to load exercises')
      } finally {
        setLoading(false)
      }
    }

    loadExercises()
  }, [])

  // Ensure hydration consistency
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Multi-exercise session management
  const session = useMultiExerciseSession({
    exercises,
    onSessionComplete: (session: PracticeSession) => {
      console.log('Session completed:', session)
      alert(`Session completed!\nOverall accuracy: ${session.overallAccuracy.toFixed(1)}%\nTotal time: ${(session.totalTimeSpent / 1000 / 60).toFixed(1)} minutes`)
    },
    onExerciseComplete: (attempt) => {
      console.log('Exercise completed:', attempt)
    },
    autoSave: true
  })

  const {
    currentSession,
    currentExercise,
    currentCharacter,
    isActive,
    currentExerciseIndex,
    currentCharacterIndex,
    exerciseProgress,
    currentAttempt,
    totalStrokes,
    currentAccuracy,
    startSession,
    endSession,
    addStroke,
    nextCharacter,
    nextExercise,
    previousCharacter,
    previousExercise,
    completeCurrentExercise,
    saveSnapshot,
    resetCurrentExercise
  } = session

  // Auto-start session when component mounts (only on client)
  useEffect(() => {
    if (isClient && !sessionStarted && exercises.length > 0) {
      const timer = setTimeout(() => {
        startSession()
        setSessionStarted(true)
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [isClient, sessionStarted, startSession])

  const handleStrokeComplete = useCallback((stroke: UserStroke) => {
    addStroke(stroke)
    console.log('Stroke completed:', stroke)
  }, [addStroke])

  const handleSnapshot = useCallback((dataUrl: string) => {
    setCurrentSnapshot(dataUrl)
    saveSnapshot(dataUrl)
    console.log('Canvas snapshot captured')
  }, [saveSnapshot])

  const handleClear = useCallback(() => {
    // Reset current exercise to clear strokes
    resetCurrentExercise()
  }, [resetCurrentExercise])

  const handleCheckAnswer = () => {
    if (totalStrokes === 0) return
    
    const accuracy = currentAccuracy.toFixed(1)
    const expected = currentCharacter?.strokeCount || 0
    
    let message = `Accuracy: ${accuracy}% • Strokes: ${totalStrokes}/${expected}`
    let type: 'success' | 'error' | 'info' = 'info'
    
    if (currentAccuracy >= 95) {
      message += ' • 🎉 Excellent!'
      type = 'success'
    } else if (currentAccuracy >= 80) {
      message += ' • 👍 Good job!'
      type = 'success'
    } else if (currentAccuracy >= 60) {
      message += ' • 📝 Keep practicing'
      type = 'info'
    } else {
      message += ' • 💪 Try again'
      type = 'error'
    }
    
    setNotification({ message, type, show: true })
    
    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }))
    }, 3000)
    
    // Mark current character as completed and auto-advance
    setTimeout(() => {
      completeCurrentExercise()
      handleNext()
    }, 1500)
  }

  const handleNext = () => {
    // Try to advance to next character first, then next exercise
    if (!nextCharacter()) {
      nextExercise() // Always succeeds now (cycles back to beginning)
    }
  }

  const handlePrevious = () => {
    // Try to go back to previous character first, then previous exercise
    if (!previousCharacter()) {
      previousExercise()
    }
  }

  const handleCompleteExercise = () => {
    completeCurrentExercise()
    if (currentAccuracy >= 80) {
      handleNext()
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exercises from database...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Exercises</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Show empty state
  if (exercises.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-xl mb-4">📚</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Exercises Available</h2>
          <p className="text-gray-600 mb-4">The database doesn't contain any practice exercises yet.</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
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
              Multi-Exercise Practice
            </h1>
            <div className="text-sm text-gray-500">
              {isClient && currentExercise ? 
                `${currentExercise.type === 'phrase' ? 'Phrase' : 'Character'} ${currentExerciseIndex + 1}/${exercises.length}` +
                (currentExercise.type === 'phrase' ? ` • Char ${currentCharacterIndex + 1}/${currentExercise.characters.length}` : '') :
                'Loading...'
              }
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Character Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              {/* Exercise Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {isClient && currentExercise ? currentExercise.title : 'Loading...'}
                  </h2>
                  {currentExercise?.description && (
                    <p className="text-sm text-gray-600 mt-1">{currentExercise.description}</p>
                  )}
                </div>
                
                {/* Navigation Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevious}
                    disabled={!isActive}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
                    title="Previous"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-sm text-gray-500">
                    {isClient && currentExercise ? 
                      `${currentExerciseIndex + 1}/${exercises.length}` +
                      (currentExercise.type === 'phrase' ? `.${currentCharacterIndex + 1}` : '') :
                      'Loading'
                    }
                  </span>
                  <button
                    onClick={handleNext}
                    disabled={!isActive}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
                    title="Next"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Exercise Progress - Only for phrases */}
              {currentExercise?.type === 'phrase' && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Current Exercise</span>
                    <span>{exerciseProgress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${exerciseProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Current Character Display */}
              {showPrompts.character && currentCharacter && (
                <div className="text-center mb-6">
                  <div className="text-8xl font-serif text-gray-800 mb-2">
                    {isClient ? currentCharacter.traditional : '一'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {isClient ? 
                      `${currentCharacter.traditional} (${currentCharacter.strokeCount} stroke${currentCharacter.strokeCount !== 1 ? 's' : ''})` :
                      'Loading...'
                    }
                  </div>
                  
                  {/* Show full phrase for phrase exercises */}
                  {currentExercise?.type === 'phrase' && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-700">Full Phrase:</div>
                      <div className="text-2xl font-serif text-blue-900">
                        {currentExercise.characters.map(char => char.traditional).join('')}
                      </div>
                      <div className="text-sm text-blue-600 mt-1">
                        {currentExercise.jyutping} • {currentExercise.english}
                      </div>
                    </div>
                  )}
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
                      {isClient && currentCharacter ? currentCharacter.jyutping : 'Loading...'}
                    </div>
                  </div>
                )}
                
                {showPrompts.english && (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-sm font-medium text-green-700 mb-1">
                      Meaning
                    </div>
                    <div className="text-lg text-green-900">
                      {isClient && currentCharacter ? currentCharacter.english : 'Loading...'}
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

            {/* Stroke Insights */}
            {currentCharacter && (
              <StrokeInsights 
                character={currentCharacter}
                currentSession={currentAttempt ? {
                  sessionId: currentSession?.id || '',
                  characterId: currentCharacter.id,
                  totalStrokes,
                  accuracy: currentAccuracy,
                  totalTime: currentAttempt.timeSpent,
                  averageStrokeTime: currentAttempt.timeSpent / Math.max(totalStrokes, 1),
                  averageStrokeLength: 100, // placeholder
                  averageSpeed: 0.5, // placeholder
                  strokeTypes: {},
                  completed: currentAttempt.completed,
                  timestamp: currentAttempt.createdAt
                } : null}
                className="mb-6"
              />
            )}

            {/* Practice Stats */}
            {isActive && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Practice Stats
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-indigo-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-700">
                      {currentSession ? currentSession.exerciseAttempts.length : 0}
                    </div>
                    <div className="text-sm text-indigo-600">Characters</div>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">
                      {currentSession && currentSession.exerciseAttempts.length > 0 ? 
                        (currentSession.exerciseAttempts.reduce((sum, attempt) => sum + attempt.accuracy, 0) / currentSession.exerciseAttempts.length).toFixed(1) :
                        currentAccuracy.toFixed(1)}%
                    </div>
                    <div className="text-sm text-green-600">Avg Accuracy</div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 text-center">
                  {(currentSession && currentSession.exerciseAttempts.length > 0 ? 
                    (currentSession.exerciseAttempts.reduce((sum, attempt) => sum + attempt.accuracy, 0) / currentSession.exerciseAttempts.length) :
                    currentAccuracy) >= 95 ? '🎉 Excellent!' :
                   (currentSession && currentSession.exerciseAttempts.length > 0 ? 
                    (currentSession.exerciseAttempts.reduce((sum, attempt) => sum + attempt.accuracy, 0) / currentSession.exerciseAttempts.length) :
                    currentAccuracy) >= 80 ? '👍 Good job!' :
                   (currentSession && currentSession.exerciseAttempts.length > 0 ? 
                    (currentSession.exerciseAttempts.reduce((sum, attempt) => sum + attempt.accuracy, 0) / currentSession.exerciseAttempts.length) :
                    currentAccuracy) >= 60 ? '📝 Keep practicing' :
                   '💪 Try again'}
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
                key={`canvas-${currentExerciseIndex}-${currentCharacterIndex}-${sessionStarted}`}
                onStrokeComplete={handleStrokeComplete}
                onClear={handleClear}
                onSnapshot={handleSnapshot}
                className="mx-auto"
              />
              
              {/* Inline Notification */}
              {notification.show && (
                <div className={`mt-4 p-4 rounded-lg border transition-all duration-300 ${
                  notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                  notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                  'bg-blue-50 border-blue-200 text-blue-800'
                }`}>
                  <div className="text-center font-medium">
                    {notification.message}
                  </div>
                </div>
              )}
              
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleCheckAnswer}
                  disabled={totalStrokes === 0}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  Check Answer
                </button>
                
                {/* Navigation and Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handlePrevious}
                    disabled={!isActive}
                    className="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!isActive}
                    className="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    Next →
                  </button>
                </div>

                {totalStrokes > 0 && currentAccuracy >= 80 && (
                  <button
                    onClick={handleCompleteExercise}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    🎉 Complete & Continue
                  </button>
                )}

                {/* Session Controls */}
                <div className="flex gap-2 text-sm">
                  <button
                    onClick={handleClear}
                    disabled={!isActive || totalStrokes === 0}
                    className="flex-1 bg-yellow-100 hover:bg-yellow-200 disabled:bg-gray-50 disabled:text-gray-400 text-yellow-700 py-2 px-4 rounded-lg transition-colors"
                  >
                    Reset Exercise
                  </button>
                  
                  <button
                    onClick={() => {
                      setSessionStarted(false)
                      endSession()
                      PracticeSessionStorage.clearCurrentSession() // Clear analytics cache
                      setTimeout(() => {
                        startSession()
                        setSessionStarted(true)
                      }, 100)
                    }}
                    disabled={!isActive}
                    className="flex-1 bg-red-100 hover:bg-red-200 disabled:bg-gray-50 disabled:text-gray-400 text-red-700 py-2 px-4 rounded-lg transition-colors"
                  >
                    Clear Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}