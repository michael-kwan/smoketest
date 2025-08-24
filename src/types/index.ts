// Core character and stroke data types
export interface Character {
  id: string
  traditional: string
  simplified?: string
  jyutping: string
  english: string
  strokeCount: number
  frequency?: number
  difficulty: number
  strokes: Stroke[]
}

// Practice exercises - can be individual characters or phrases
export interface Exercise {
  id: string
  type: 'character' | 'phrase'
  title: string
  description?: string
  difficulty: number
  characters: Character[]
  totalStrokes: number
  // For phrases
  jyutping?: string
  english?: string
}

export interface Stroke {
  id: number
  path: Point[]
  direction: 'horizontal' | 'vertical' | 'left-falling' | 'right-falling' | 'turning'
  timing?: {
    start: number
    end: number
  }
}

export interface Point {
  x: number
  y: number
  pressure?: number
  timestamp?: number
}

// User progress and learning data
export interface UserProgress {
  userId: string
  exerciseId: string
  characterId?: string // For individual character progress within an exercise
  masteryLevel: number // 0-5
  difficultyLevel: number // 1-5
  accuracy: number // 0-100
  attempts: number
  lastReview: Date
  nextReview: Date
  streak: number
}

// Multi-exercise practice session
export interface PracticeSession {
  id: string
  userId: string
  exercises: Exercise[]
  currentExerciseIndex: number
  currentCharacterIndex: number // For multi-character exercises (phrases)
  exerciseAttempts: ExerciseAttempt[]
  overallAccuracy: number
  totalTimeSpent: number
  completed: boolean
  startedAt: Date
  completedAt?: Date
}

// Individual exercise attempt within a session
export interface ExerciseAttempt {
  exerciseId: string
  characterId?: string // For tracking specific characters within phrases
  userStrokes: UserStroke[]
  accuracy: number
  timeSpent: number
  completed: boolean
  attempts: number
  createdAt: Date
  canvasSnapshot?: string // Base64 encoded PNG snapshot
}

export interface UserStroke {
  path: Point[]
  startTime: number
  endTime: number
  valid: boolean
  accuracy?: number
}

// UI and app state types
export interface AppState {
  currentCharacter?: Character
  practiceMode: 'learning' | 'review' | 'test'
  difficultyLevel: number
  showPrompts: {
    character: boolean
    jyutping: boolean
    english: boolean
    strokes: boolean
  }
}

export interface CanvasState {
  isDrawing: boolean
  currentStroke: Point[]
  completedStrokes: UserStroke[]
  canvasSize: {
    width: number
    height: number
  }
}