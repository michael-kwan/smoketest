import { useState, useCallback, useRef, useEffect } from 'react'
import type { PracticeSession, ExerciseAttempt, UserStroke, Character, Exercise } from '@/types'
// Removed PracticeSessionStorage and StrokeAnalytics - data now handled by database

interface UsePracticeSessionOptions {
  character: Character
  onSessionComplete?: (session: PracticeSession) => void
  autoSave?: boolean
}

interface UsePracticeSessionReturn {
  // Session state
  currentSession: PracticeSession | null
  isActive: boolean
  
  // Session actions
  startSession: () => void
  endSession: () => void
  addStroke: (stroke: UserStroke) => void
  
  // Session data
  sessionSummary: null // Analytics moved to database
  accuracy: number
  totalStrokes: number
  sessionDuration: number
  
  // Session management
  saveSession: () => void
  resetSession: () => void
}

export function usePracticeSession({
  character,
  onSessionComplete,
  autoSave = true
}: UsePracticeSessionOptions): UsePracticeSessionReturn {
  const [currentSession, setCurrentSession] = useState<PracticeSession | null>(null)
  const [isActive, setIsActive] = useState(false)
  const sessionStartTime = useRef<number>(0)
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null)

  // Start a new practice session
  const startSession = useCallback(() => {
    const now = Date.now()
    sessionStartTime.current = now
    
    // Create a single-character exercise
    const singleCharExercise: Exercise = {
      id: `exercise_${character.id}`,
      type: 'character',
      title: `Practice ${character.traditional}`,
      difficulty: character.difficulty,
      characters: [character],
      totalStrokes: character.strokeCount
    }
    
    const session: PracticeSession = {
      id: `session_${now}_${character.id}`,
      userId: 'guest', // Will be replaced with real user ID later
      exercises: [singleCharExercise],
      currentExerciseIndex: 0,
      currentCharacterIndex: 0,
      exerciseAttempts: [],
      overallAccuracy: 0,
      totalTimeSpent: 0,
      completed: false,
      startedAt: new Date(now)
    }
    
    setCurrentSession(session)
    setIsActive(true)
    
    console.log('Practice session started for character:', character.traditional)
  }, [character])

  // End the current practice session
  const endSession = useCallback(() => {
    if (!currentSession || !isActive) return
    
    const endTime = Date.now()
    const duration = endTime - sessionStartTime.current
    
    const completedSession: PracticeSession = {
      ...currentSession,
      totalTimeSpent: duration,
      completed: true,
      completedAt: new Date(endTime)
    }
    
    setCurrentSession(completedSession)
    setIsActive(false)
    
    // Session data is now saved to database via API calls, not localStorage
    
    // Notify completion callback
    onSessionComplete?.(completedSession)
    
    console.log('Practice session completed:', completedSession)
  }, [currentSession, isActive, autoSave, onSessionComplete])

  // Add a stroke to the current session
  const addStroke = useCallback((stroke: UserStroke) => {
    if (!currentSession || !isActive) return
    
    const currentExercise = currentSession.exercises[0] // Single character exercise
    const now = Date.now()
    const duration = now - sessionStartTime.current
    
    // Find or create attempt for this character
    const existingAttemptIndex = currentSession.exerciseAttempts.findIndex(attempt => 
      attempt.exerciseId === currentExercise.id && attempt.characterId === character.id
    )
    
    let updatedAttempts: ExerciseAttempt[]
    
    if (existingAttemptIndex >= 0) {
      // Update existing attempt
      const existingAttempt = currentSession.exerciseAttempts[existingAttemptIndex]
      const updatedAttempt: ExerciseAttempt = {
        ...existingAttempt,
        userStrokes: [...existingAttempt.userStrokes, stroke],
        timeSpent: duration,
        accuracy: calculateStrokeAccuracy([...existingAttempt.userStrokes, stroke], character)
      }
      updatedAttempts = [...currentSession.exerciseAttempts]
      updatedAttempts[existingAttemptIndex] = updatedAttempt
    } else {
      // Create new attempt
      const newAttempt: ExerciseAttempt = {
        exerciseId: currentExercise.id,
        characterId: character.id,
        userStrokes: [stroke],
        accuracy: calculateStrokeAccuracy([stroke], character),
        timeSpent: duration,
        completed: false,
        attempts: 1,
        createdAt: new Date(now)
      }
      updatedAttempts = [...currentSession.exerciseAttempts, newAttempt]
    }
    
    const updatedSession: PracticeSession = {
      ...currentSession,
      exerciseAttempts: updatedAttempts,
      totalTimeSpent: duration
    }
    
    setCurrentSession(updatedSession)
    
    // Auto-save periodically (now saves to database via API)
    if (autoSave) {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
      
      autoSaveTimer.current = setTimeout(() => {
        // Session data saved to database via API calls, not localStorage
      }, 2000)
    }
  }, [currentSession, isActive, character, autoSave])

  // Save current session manually
  const saveSession = useCallback(() => {
    if (!currentSession) return
    
    // Session data is now saved to database via API calls
    console.log('Session data handled by database API')
  }, [currentSession])

  // Reset current session
  const resetSession = useCallback(() => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current)
    }
    
    setCurrentSession(null)
    setIsActive(false)
    sessionStartTime.current = 0
  }, [])

  // Generate session summary - disabled for now since analytics moved to database
  const sessionSummary = null

  // Computed values from exercise attempts
  const currentAttempt = currentSession?.exerciseAttempts.find(attempt => 
    attempt.characterId === character.id
  )
  const accuracy = currentAttempt?.accuracy || 0
  const totalStrokes = currentAttempt?.userStrokes.length || 0
  const sessionDuration = currentSession?.totalTimeSpent || 0

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
      
      // Auto-end session if still active on unmount
      if (isActive && currentSession && autoSave) {
        const endTime = Date.now()
        const duration = endTime - sessionStartTime.current
        
        const finalSession: PracticeSession = {
          ...currentSession,
          totalTimeSpent: duration,
          completed: false // Mark as incomplete since user navigated away
        }
        
        // Session data is now saved to database via API calls
      }
    }
  }, [currentSession, isActive, autoSave])

  return {
    // Session state
    currentSession,
    isActive,
    
    // Session actions
    startSession,
    endSession,
    addStroke,
    
    // Session data
    sessionSummary,
    accuracy,
    totalStrokes,
    sessionDuration,
    
    // Session management
    saveSession,
    resetSession
  }
}

/**
 * Calculate session accuracy based on strokes and expected character
 * This is a placeholder implementation - will be enhanced with proper stroke validation
 */
function calculateStrokeAccuracy(userStrokes: UserStroke[], character: Character): number {
  if (userStrokes.length === 0) return 0
  
  // Basic accuracy calculation based on stroke count
  const expectedStrokes = character.strokeCount
  const actualStrokes = userStrokes.length
  
  // Penalty for wrong number of strokes
  let accuracy = Math.max(0, 100 - Math.abs(expectedStrokes - actualStrokes) * 20)
  
  // Placeholder: reduce accuracy based on stroke quality
  // In real implementation, this would use stroke validation algorithms
  const avgStrokeQuality = userStrokes.reduce((sum, stroke) => {
    // Placeholder quality score based on stroke length and duration
    const length = stroke.path.length
    const duration = stroke.endTime - stroke.startTime
    const quality = Math.min(100, (length * 2) + Math.min(50, duration / 50))
    return sum + quality
  }, 0) / userStrokes.length
  
  // Combine stroke count accuracy with stroke quality
  accuracy = (accuracy * 0.6) + (avgStrokeQuality * 0.4)
  
  return Math.max(0, Math.min(100, accuracy))
}