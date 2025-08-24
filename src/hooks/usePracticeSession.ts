import { useState, useCallback, useRef, useEffect } from 'react'
import type { PracticeSession, UserStroke, Character } from '@/types'
import { PracticeSessionStorage, StrokeAnalytics, type SessionSummary } from '@/lib/strokeStorage'

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
  sessionSummary: SessionSummary | null
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
    
    const session: PracticeSession = {
      id: `session_${now}_${character.id}`,
      userId: 'guest', // Will be replaced with real user ID later
      characterId: character.id,
      userStrokes: [],
      accuracy: 0,
      timeSpent: 0,
      completed: false,
      createdAt: new Date(now)
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
      timeSpent: duration,
      completed: true
    }
    
    setCurrentSession(completedSession)
    setIsActive(false)
    
    // Save session
    if (autoSave) {
      PracticeSessionStorage.saveSession(completedSession)
    }
    
    // Notify completion callback
    onSessionComplete?.(completedSession)
    
    console.log('Practice session completed:', completedSession)
  }, [currentSession, isActive, autoSave, onSessionComplete])

  // Add a stroke to the current session
  const addStroke = useCallback((stroke: UserStroke) => {
    if (!currentSession || !isActive) return
    
    const updatedSession: PracticeSession = {
      ...currentSession,
      userStrokes: [...currentSession.userStrokes, stroke],
      timeSpent: Date.now() - sessionStartTime.current
    }
    
    // Calculate accuracy (placeholder - will be improved with actual stroke validation)
    const accuracy = calculateSessionAccuracy(updatedSession, character)
    updatedSession.accuracy = accuracy
    
    setCurrentSession(updatedSession)
    
    // Auto-save periodically
    if (autoSave) {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
      
      autoSaveTimer.current = setTimeout(() => {
        PracticeSessionStorage.saveSession(updatedSession)
      }, 2000) // Save 2 seconds after last stroke
    }
  }, [currentSession, isActive, character, autoSave])

  // Save current session manually
  const saveSession = useCallback(() => {
    if (!currentSession) return
    
    PracticeSessionStorage.saveSession(currentSession)
    console.log('Session saved manually')
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

  // Generate session summary
  const sessionSummary = currentSession 
    ? StrokeAnalytics.generateSessionSummary(currentSession)
    : null

  // Computed values
  const accuracy = currentSession?.accuracy || 0
  const totalStrokes = currentSession?.userStrokes.length || 0
  const sessionDuration = currentSession?.timeSpent || 0

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
          timeSpent: duration,
          completed: false // Mark as incomplete since user navigated away
        }
        
        PracticeSessionStorage.saveSession(finalSession)
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
function calculateSessionAccuracy(session: PracticeSession, character: Character): number {
  const { userStrokes } = session
  
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