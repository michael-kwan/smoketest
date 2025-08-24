import { useState, useCallback, useRef, useEffect } from 'react'
import type { PracticeSession, ExerciseAttempt, UserStroke, Exercise, Character } from '@/types'
import { PracticeSessionStorage } from '@/lib/strokeStorage'

interface UseMultiExerciseSessionOptions {
  exercises: Exercise[]
  onSessionComplete?: (session: PracticeSession) => void
  onExerciseComplete?: (attempt: ExerciseAttempt) => void
  autoSave?: boolean
  endlessMode?: boolean
  onNeedMoreExercises?: () => Promise<Exercise[]>
}

interface UseMultiExerciseSessionReturn {
  // Session state
  currentSession: PracticeSession | null
  currentExercise: Exercise | null
  currentCharacter: Character | null
  isActive: boolean
  
  // Progress tracking
  currentExerciseIndex: number
  currentCharacterIndex: number
  sessionProgress: number // 0-100
  exerciseProgress: number // 0-100
  
  // Current exercise data
  currentAttempt: ExerciseAttempt | null
  totalStrokes: number
  currentAccuracy: number
  
  // Session actions
  startSession: () => void
  endSession: () => void
  addStroke: (stroke: UserStroke) => void
  saveSnapshot: (dataUrl: string) => void
  nextCharacter: () => boolean // Returns true if more characters available
  nextExercise: () => boolean // Returns true if more exercises available
  previousCharacter: () => boolean
  previousExercise: () => boolean
  
  // Exercise management
  completeCurrentExercise: () => void
  skipExercise: () => void
  resetCurrentExercise: () => void
}

export function useMultiExerciseSession({
  exercises,
  onSessionComplete,
  onExerciseComplete,
  autoSave = true,
  endlessMode = false,
  onNeedMoreExercises
}: UseMultiExerciseSessionOptions): UseMultiExerciseSessionReturn {
  const [currentSession, setCurrentSession] = useState<PracticeSession | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [allExercises, setAllExercises] = useState<Exercise[]>(exercises)
  const sessionStartTime = useRef<number>(0)
  const exerciseStartTime = useRef<number>(0)
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null)

  // Update exercises when prop changes
  useEffect(() => {
    setAllExercises(exercises)
  }, [exercises])

  // Current exercise and character
  const currentExercise = currentSession ? allExercises[currentSession.currentExerciseIndex] || null : null
  const currentCharacter = currentExercise && currentSession ? 
    currentExercise.characters[currentSession.currentCharacterIndex] || null : null

  // Progress calculations (for endless mode, don't calculate total progress)
  const sessionProgress = currentSession && !endlessMode ? 
    ((currentSession.currentExerciseIndex + (currentSession.currentCharacterIndex / (currentExercise?.characters.length || 1))) / allExercises.length) * 100 : 0
  
  const exerciseProgress = currentExercise && currentSession ? 
    (currentSession.currentCharacterIndex / currentExercise.characters.length) * 100 : 0

  // Current attempt data
  const currentAttempt = currentSession && currentExercise ? 
    currentSession.exerciseAttempts.find(attempt => 
      attempt.exerciseId === currentExercise.id && 
      attempt.characterId === currentCharacter?.id
    ) || null : null

  const totalStrokes = currentAttempt?.userStrokes.length || 0
  const currentAccuracy = currentAttempt?.accuracy || 0

  // Start a new multi-exercise session
  const startSession = useCallback(() => {
    if (exercises.length === 0) return
    
    const now = Date.now()
    sessionStartTime.current = now
    exerciseStartTime.current = now
    
    const session: PracticeSession = {
      id: `session_${now}`,
      userId: 'guest',
      exercises,
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
    
    console.log('Multi-exercise session started with', exercises.length, 'exercises')
  }, [exercises])

  // End the current session
  const endSession = useCallback(() => {
    if (!currentSession || !isActive) return
    
    const endTime = Date.now()
    const totalDuration = endTime - sessionStartTime.current
    
    const completedSession: PracticeSession = {
      ...currentSession,
      totalTimeSpent: totalDuration,
      completed: true,
      completedAt: new Date(endTime),
      overallAccuracy: calculateOverallAccuracy(currentSession.exerciseAttempts)
    }
    
    setCurrentSession(completedSession)
    setIsActive(false)
    
    // Save session
    if (autoSave) {
      PracticeSessionStorage.saveSession(completedSession)
    }
    
    // Notify completion callback
    onSessionComplete?.(completedSession)
    
    console.log('Multi-exercise session completed:', completedSession)
  }, [currentSession, isActive, autoSave, onSessionComplete])

  // Add a stroke to the current exercise attempt
  const addStroke = useCallback((stroke: UserStroke) => {
    if (!currentSession || !isActive || !currentExercise || !currentCharacter) return
    
    const now = Date.now()
    const exerciseDuration = now - exerciseStartTime.current
    
    // Find or create current attempt
    const existingAttemptIndex = currentSession.exerciseAttempts.findIndex(attempt => 
      attempt.exerciseId === currentExercise.id && 
      attempt.characterId === currentCharacter.id
    )
    
    let updatedAttempts: ExerciseAttempt[]
    
    if (existingAttemptIndex >= 0) {
      // Update existing attempt
      const existingAttempt = currentSession.exerciseAttempts[existingAttemptIndex]
      const updatedAttempt: ExerciseAttempt = {
        ...existingAttempt,
        userStrokes: [...existingAttempt.userStrokes, stroke],
        timeSpent: exerciseDuration,
        accuracy: calculateExerciseAccuracy([...existingAttempt.userStrokes, stroke], currentCharacter)
      }
      
      updatedAttempts = [...currentSession.exerciseAttempts]
      updatedAttempts[existingAttemptIndex] = updatedAttempt
    } else {
      // Create new attempt
      const newAttempt: ExerciseAttempt = {
        exerciseId: currentExercise.id,
        characterId: currentCharacter.id,
        userStrokes: [stroke],
        accuracy: calculateExerciseAccuracy([stroke], currentCharacter),
        timeSpent: exerciseDuration,
        completed: false,
        attempts: 1,
        createdAt: new Date(now)
      }
      
      updatedAttempts = [...currentSession.exerciseAttempts, newAttempt]
    }
    
    const updatedSession: PracticeSession = {
      ...currentSession,
      exerciseAttempts: updatedAttempts,
      totalTimeSpent: now - sessionStartTime.current
    }
    
    setCurrentSession(updatedSession)
    
    // Auto-save periodically
    if (autoSave) {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
      
      autoSaveTimer.current = setTimeout(() => {
        PracticeSessionStorage.saveSession(updatedSession)
      }, 2000)
    }
  }, [currentSession, isActive, currentExercise, currentCharacter, autoSave])

  // Save canvas snapshot to current attempt
  const saveSnapshot = useCallback((dataUrl: string) => {
    if (!currentSession || !currentExercise || !currentCharacter) return
    
    const existingAttemptIndex = currentSession.exerciseAttempts.findIndex(attempt => 
      attempt.exerciseId === currentExercise.id && 
      attempt.characterId === currentCharacter.id
    )
    
    if (existingAttemptIndex >= 0) {
      const updatedAttempts = [...currentSession.exerciseAttempts]
      updatedAttempts[existingAttemptIndex] = {
        ...updatedAttempts[existingAttemptIndex],
        canvasSnapshot: dataUrl
      }
      
      const updatedSession: PracticeSession = {
        ...currentSession,
        exerciseAttempts: updatedAttempts
      }
      
      setCurrentSession(updatedSession)
      
      if (autoSave) {
        PracticeSessionStorage.saveSession(updatedSession)
      }
    }
  }, [currentSession, currentExercise, currentCharacter, autoSave])

  // Navigation functions
  const nextCharacter = useCallback((): boolean => {
    if (!currentSession || !currentExercise) return false
    
    const nextCharIndex = currentSession.currentCharacterIndex + 1
    if (nextCharIndex < currentExercise.characters.length) {
      setCurrentSession(prev => prev ? {
        ...prev,
        currentCharacterIndex: nextCharIndex
      } : null)
      exerciseStartTime.current = Date.now()
      return true
    }
    
    return false
  }, [currentSession, currentExercise])

  const nextExercise = useCallback(async (): Promise<boolean> => {
    if (!currentSession) return false
    
    const nextExIndex = currentSession.currentExerciseIndex + 1
    
    // In endless mode, try to load more exercises if needed
    if (endlessMode && nextExIndex >= allExercises.length) {
      if (onNeedMoreExercises) {
        try {
          const newExercises = await onNeedMoreExercises()
          if (newExercises.length > 0) {
            setAllExercises(prev => [...prev, ...newExercises])
            // Continue with next exercise
            setCurrentSession(prev => prev ? {
              ...prev,
              currentExerciseIndex: nextExIndex,
              currentCharacterIndex: 0
            } : null)
            exerciseStartTime.current = Date.now()
            return true
          }
        } catch (error) {
          console.error('Failed to load more exercises:', error)
        }
      }
      // If we can't get more exercises in endless mode, cycle back
    }
    
    // Cycle back to beginning if reached end or use next index
    const actualNextIndex = nextExIndex >= allExercises.length ? 0 : nextExIndex
    
    setCurrentSession(prev => prev ? {
      ...prev,
      currentExerciseIndex: actualNextIndex,
      currentCharacterIndex: 0
    } : null)
    exerciseStartTime.current = Date.now()
    return true
  }, [currentSession, allExercises.length, endlessMode, onNeedMoreExercises])

  const previousCharacter = useCallback((): boolean => {
    if (!currentSession) return false
    
    const prevCharIndex = currentSession.currentCharacterIndex - 1
    if (prevCharIndex >= 0) {
      setCurrentSession(prev => prev ? {
        ...prev,
        currentCharacterIndex: prevCharIndex
      } : null)
      exerciseStartTime.current = Date.now()
      return true
    }
    
    return false
  }, [currentSession])

  const previousExercise = useCallback((): boolean => {
    if (!currentSession) return false
    
    const prevExIndex = currentSession.currentExerciseIndex - 1
    if (prevExIndex >= 0) {
      const prevExercise = exercises[prevExIndex]
      setCurrentSession(prev => prev ? {
        ...prev,
        currentExerciseIndex: prevExIndex,
        currentCharacterIndex: prevExercise.characters.length - 1 // Go to last character of previous exercise
      } : null)
      exerciseStartTime.current = Date.now()
      return true
    }
    
    return false
  }, [currentSession, exercises])

  const completeCurrentExercise = useCallback(() => {
    if (!currentSession || !currentExercise || !currentCharacter) return
    
    // Mark current attempt as completed
    const updatedAttempts = currentSession.exerciseAttempts.map(attempt => 
      attempt.exerciseId === currentExercise.id && attempt.characterId === currentCharacter.id
        ? { ...attempt, completed: true }
        : attempt
    )
    
    setCurrentSession(prev => prev ? {
      ...prev,
      exerciseAttempts: updatedAttempts
    } : null)
    
    const currentAttemptData = updatedAttempts.find(attempt => 
      attempt.exerciseId === currentExercise.id && attempt.characterId === currentCharacter.id
    )
    
    if (currentAttemptData) {
      onExerciseComplete?.(currentAttemptData)
    }
  }, [currentSession, currentExercise, currentCharacter, onExerciseComplete])

  const skipExercise = useCallback(() => {
    nextExercise()
  }, [nextExercise])

  const resetCurrentExercise = useCallback(() => {
    if (!currentSession || !currentExercise) return
    
    // Remove attempts for current exercise
    const filteredAttempts = currentSession.exerciseAttempts.filter(attempt => 
      attempt.exerciseId !== currentExercise.id
    )
    
    setCurrentSession(prev => prev ? {
      ...prev,
      exerciseAttempts: filteredAttempts,
      currentCharacterIndex: 0
    } : null)
    
    exerciseStartTime.current = Date.now()
  }, [currentSession, currentExercise])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
      
      // Auto-save session if still active on unmount
      if (isActive && currentSession && autoSave) {
        const endTime = Date.now()
        const totalDuration = endTime - sessionStartTime.current
        
        const finalSession: PracticeSession = {
          ...currentSession,
          totalTimeSpent: totalDuration,
          completed: false
        }
        
        PracticeSessionStorage.saveSession(finalSession)
      }
    }
  }, [currentSession, isActive, autoSave])

  return {
    // Session state
    currentSession,
    currentExercise,
    currentCharacter,
    isActive,
    
    // Progress tracking
    currentExerciseIndex: currentSession?.currentExerciseIndex || 0,
    currentCharacterIndex: currentSession?.currentCharacterIndex || 0,
    sessionProgress,
    exerciseProgress,
    
    // Current exercise data
    currentAttempt,
    totalStrokes,
    currentAccuracy,
    
    // Session actions
    startSession,
    endSession,
    addStroke,
    saveSnapshot,
    nextCharacter,
    nextExercise,
    previousCharacter,
    previousExercise,
    
    // Exercise management
    completeCurrentExercise,
    skipExercise,
    resetCurrentExercise
  }
}

// Helper functions
function calculateExerciseAccuracy(userStrokes: UserStroke[], character: Character): number {
  if (userStrokes.length === 0) return 0
  
  // Basic accuracy calculation based on stroke count
  const expectedStrokes = character.strokeCount
  const actualStrokes = userStrokes.length
  
  // Penalty for wrong number of strokes
  let accuracy = Math.max(0, 100 - Math.abs(expectedStrokes - actualStrokes) * 20)
  
  // Placeholder: reduce accuracy based on stroke quality
  const avgStrokeQuality = userStrokes.reduce((sum, stroke) => {
    const length = stroke.path.length
    const duration = stroke.endTime - stroke.startTime
    const quality = Math.min(100, (length * 2) + Math.min(50, duration / 50))
    return sum + quality
  }, 0) / userStrokes.length
  
  // Combine stroke count accuracy with stroke quality
  accuracy = (accuracy * 0.6) + (avgStrokeQuality * 0.4)
  
  return Math.max(0, Math.min(100, accuracy))
}

function calculateOverallAccuracy(attempts: ExerciseAttempt[]): number {
  if (attempts.length === 0) return 0
  
  const totalAccuracy = attempts.reduce((sum, attempt) => sum + attempt.accuracy, 0)
  return totalAccuracy / attempts.length
}