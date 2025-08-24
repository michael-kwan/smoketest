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
  characterId: string
  masteryLevel: number // 0-5
  difficultyLevel: number // 1-5
  accuracy: number // 0-100
  attempts: number
  lastReview: Date
  nextReview: Date
  streak: number
}

export interface PracticeSession {
  id: string
  userId: string
  characterId: string
  userStrokes: UserStroke[]
  accuracy: number
  timeSpent: number
  completed: boolean
  createdAt: Date
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