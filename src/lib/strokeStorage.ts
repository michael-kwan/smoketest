import type { UserStroke, PracticeSession, Character, Point } from '@/types'

/**
 * Local storage key constants
 */
const STORAGE_KEYS = {
  PRACTICE_SESSIONS: 'smoketest_practice_sessions',
  USER_PROGRESS: 'smoketest_user_progress',
  STROKE_ANALYTICS: 'smoketest_stroke_analytics',
  SETTINGS: 'smoketest_settings'
} as const

/**
 * Stroke analysis utilities
 */
export class StrokeAnalyzer {
  /**
   * Calculate stroke length (total path distance)
   */
  static calculateLength(stroke: UserStroke): number {
    if (stroke.path.length < 2) return 0
    
    let length = 0
    for (let i = 1; i < stroke.path.length; i++) {
      const prev = stroke.path[i - 1]
      const curr = stroke.path[i]
      length += Math.sqrt(
        Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
      )
    }
    return length
  }

  /**
   * Calculate stroke duration
   */
  static calculateDuration(stroke: UserStroke): number {
    return stroke.endTime - stroke.startTime
  }

  /**
   * Calculate stroke speed (pixels per millisecond)
   */
  static calculateSpeed(stroke: UserStroke): number {
    const length = this.calculateLength(stroke)
    const duration = this.calculateDuration(stroke)
    return duration > 0 ? length / duration : 0
  }

  /**
   * Calculate stroke direction vector
   */
  static calculateDirection(stroke: UserStroke): { x: number; y: number } {
    if (stroke.path.length < 2) return { x: 0, y: 0 }
    
    const start = stroke.path[0]
    const end = stroke.path[stroke.path.length - 1]
    const dx = end.x - start.x
    const dy = end.y - start.y
    const magnitude = Math.sqrt(dx * dx + dy * dy)
    
    return magnitude > 0 
      ? { x: dx / magnitude, y: dy / magnitude }
      : { x: 0, y: 0 }
  }

  /**
   * Detect stroke type based on direction and shape
   */
  static classifyStroke(stroke: UserStroke): 'horizontal' | 'vertical' | 'diagonal' | 'curve' | 'dot' {
    const direction = this.calculateDirection(stroke)
    const length = this.calculateLength(stroke)
    
    // Very short strokes are dots
    if (length < 10) return 'dot'
    
    const absX = Math.abs(direction.x)
    const absY = Math.abs(direction.y)
    
    // Classify based on primary direction
    if (absX > 0.8 && absY < 0.3) return 'horizontal'
    if (absY > 0.8 && absX < 0.3) return 'vertical'
    if (absX > 0.4 && absY > 0.4) return 'diagonal'
    
    // Check for curves by analyzing direction changes
    if (this.hasCurvature(stroke)) return 'curve'
    
    return 'diagonal' // Default fallback
  }

  /**
   * Detect if stroke has significant curvature
   */
  private static hasCurvature(stroke: UserStroke): boolean {
    if (stroke.path.length < 5) return false
    
    const points = stroke.path
    let angleChanges = 0
    
    for (let i = 2; i < points.length; i++) {
      const p1 = points[i - 2]
      const p2 = points[i - 1]  
      const p3 = points[i]
      
      const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x)
      const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x)
      const angleDiff = Math.abs(angle2 - angle1)
      
      if (angleDiff > Math.PI / 6) { // 30 degrees
        angleChanges++
      }
    }
    
    return angleChanges > points.length * 0.1
  }

  /**
   * Generate comprehensive stroke analysis
   */
  static analyzeStroke(stroke: UserStroke): StrokeAnalysis {
    return {
      length: this.calculateLength(stroke),
      duration: this.calculateDuration(stroke),
      speed: this.calculateSpeed(stroke),
      direction: this.calculateDirection(stroke),
      type: this.classifyStroke(stroke),
      pointCount: stroke.path.length,
      averagePressure: stroke.path.reduce((sum, p) => sum + (p.pressure || 1), 0) / stroke.path.length,
      boundingBox: this.calculateBoundingBox(stroke)
    }
  }

  /**
   * Calculate bounding box of stroke
   */
  private static calculateBoundingBox(stroke: UserStroke): BoundingBox {
    if (stroke.path.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 }
    }

    let minX = stroke.path[0].x
    let minY = stroke.path[0].y
    let maxX = stroke.path[0].x
    let maxY = stroke.path[0].y

    for (const point of stroke.path) {
      minX = Math.min(minX, point.x)
      minY = Math.min(minY, point.y)
      maxX = Math.max(maxX, point.x)
      maxY = Math.max(maxY, point.y)
    }

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    }
  }
}

/**
 * Practice session storage manager
 */
export class PracticeSessionStorage {
  /**
   * Save a practice session to local storage
   */
  static saveSession(session: PracticeSession): void {
    try {
      const sessions = this.getAllSessions()
      sessions.push(session)
      
      // Keep only last 100 sessions to avoid storage bloat
      const recentSessions = sessions.slice(-100)
      
      localStorage.setItem(STORAGE_KEYS.PRACTICE_SESSIONS, JSON.stringify(recentSessions))
    } catch (error) {
      console.error('Failed to save practice session:', error)
    }
  }

  /**
   * Get all practice sessions from local storage
   */
  static getAllSessions(): PracticeSession[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRACTICE_SESSIONS)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to load practice sessions:', error)
      return []
    }
  }

  /**
   * Get practice sessions for a specific character (adapted for new multi-exercise structure)
   */
  static getSessionsForCharacter(characterId: string): PracticeSession[] {
    return this.getAllSessions().filter(session => 
      session.exerciseAttempts && 
      session.exerciseAttempts.some(attempt => attempt.characterId === characterId)
    )
  }

  /**
   * Get recent practice sessions (last N sessions)
   */
  static getRecentSessions(limit: number = 10): PracticeSession[] {
    return this.getAllSessions().slice(-limit)
  }

  /**
   * Clear all practice sessions
   */
  static clearAllSessions(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.PRACTICE_SESSIONS)
      localStorage.removeItem(STORAGE_KEYS.STROKE_ANALYTICS) // Clear analytics cache too
    } catch (error) {
      console.error('Failed to clear practice sessions:', error)
    }
  }

  /**
   * Clear current session and reset analytics
   */
  static clearCurrentSession(): void {
    try {
      // Remove the most recent session (last in array)
      const sessions = this.getAllSessions()
      if (sessions.length > 0) {
        const updatedSessions = sessions.slice(0, -1) // Remove last session
        localStorage.setItem(STORAGE_KEYS.PRACTICE_SESSIONS, JSON.stringify(updatedSessions))
        localStorage.removeItem(STORAGE_KEYS.STROKE_ANALYTICS) // Clear analytics cache
      }
    } catch (error) {
      console.error('Failed to clear current session:', error)
    }
  }
}

/**
 * Stroke analytics and insights
 */
export class StrokeAnalytics {
  /**
   * Generate practice session summary
   */
  static generateSessionSummary(session: PracticeSession): SessionSummary {
    const analyses = session.userStrokes.map(stroke => StrokeAnalyzer.analyzeStroke(stroke))
    
    return {
      sessionId: session.id,
      characterId: session.characterId,
      totalStrokes: session.userStrokes.length,
      accuracy: session.accuracy,
      totalTime: session.timeSpent,
      averageStrokeTime: analyses.reduce((sum, a) => sum + a.duration, 0) / analyses.length || 0,
      averageStrokeLength: analyses.reduce((sum, a) => sum + a.length, 0) / analyses.length || 0,
      averageSpeed: analyses.reduce((sum, a) => sum + a.speed, 0) / analyses.length || 0,
      strokeTypes: this.countStrokeTypes(analyses),
      completed: session.completed,
      timestamp: session.createdAt
    }
  }

  /**
   * Count stroke types in analyses
   */
  private static countStrokeTypes(analyses: StrokeAnalysis[]): Record<string, number> {
    const counts: Record<string, number> = {}
    
    for (const analysis of analyses) {
      counts[analysis.type] = (counts[analysis.type] || 0) + 1
    }
    
    return counts
  }

  /**
   * Generate progress insights for a character
   */
  static generateCharacterInsights(characterId: string): CharacterInsights {
    const sessions = PracticeSessionStorage.getSessionsForCharacter(characterId)
    
    // Extract exercise attempts for this specific character
    const characterAttempts = sessions
      .flatMap(session => session.exerciseAttempts || [])
      .filter(attempt => attempt.characterId === characterId)
    
    if (characterAttempts.length === 0) {
      return {
        characterId,
        charactersCompleted: 0,
        averageAccuracy: 0,
        improvementTrend: 0,
        commonMistakes: [],
        strengths: [],
        recommendations: ['Start practicing this character to see insights']
      }
    }

    // Only count completed character attempts
    const completedAttempts = characterAttempts.filter(attempt => attempt.completed)
    const charactersCompleted = completedAttempts.length
    const averageAccuracy = completedAttempts.length > 0 
      ? completedAttempts.reduce((sum, attempt) => sum + attempt.accuracy, 0) / completedAttempts.length 
      : 0
    
    // Calculate improvement trend based on recent vs older attempts
    const improvementTrend = this.calculateAttemptsTrend(characterAttempts)
    
    return {
      characterId,
      charactersCompleted,
      averageAccuracy,
      improvementTrend,
      commonMistakes: this.identifyCommonMistakesFromAttempts(characterAttempts),
      strengths: this.identifyStrengthsFromAttempts(characterAttempts),
      recommendations: this.generateRecommendationsFromAttempts(characterAttempts, improvementTrend)
    }
  }

  /**
   * Calculate improvement trend for exercise attempts
   */
  static calculateAttemptsTrend(attempts: any[]): number {
    if (attempts.length < 2) return 0
    
    // Sort by creation date
    const sortedAttempts = [...attempts].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    
    const recent = sortedAttempts.slice(-Math.ceil(sortedAttempts.length / 2))
    const older = sortedAttempts.slice(0, Math.floor(sortedAttempts.length / 2))
    
    const recentAvg = recent.reduce((sum, a) => sum + a.accuracy, 0) / recent.length
    const olderAvg = older.reduce((sum, a) => sum + a.accuracy, 0) / older.length
    
    return recentAvg - olderAvg
  }

  /**
   * Identify common mistakes from exercise attempts
   */
  static identifyCommonMistakesFromAttempts(attempts: any[]): string[] {
    const mistakes = []
    const lowAccuracyAttempts = attempts.filter(a => a.accuracy < 70)
    
    if (lowAccuracyAttempts.length > attempts.length * 0.3) {
      mistakes.push('Stroke accuracy needs improvement')
    }
    
    const slowAttempts = attempts.filter(a => a.timeSpent > 10000) // 10+ seconds
    if (slowAttempts.length > attempts.length * 0.5) {
      mistakes.push('Take more time for accuracy')
    }
    
    return mistakes
  }

  /**
   * Identify strengths from exercise attempts
   */
  static identifyStrengthsFromAttempts(attempts: any[]): string[] {
    const strengths = []
    const avgAccuracy = attempts.reduce((sum, a) => sum + a.accuracy, 0) / attempts.length
    
    if (avgAccuracy > 90) {
      strengths.push('Excellent stroke accuracy')
    } else if (avgAccuracy > 80) {
      strengths.push('Good stroke control')
    }
    
    const consistentAttempts = attempts.filter(a => Math.abs(a.accuracy - avgAccuracy) < 10)
    if (consistentAttempts.length > attempts.length * 0.7) {
      strengths.push('Consistent performance')
    }
    
    return strengths
  }

  /**
   * Generate recommendations from exercise attempts
   */
  static generateRecommendationsFromAttempts(attempts: any[], trend: number): string[] {
    const recommendations = []
    const avgAccuracy = attempts.reduce((sum, a) => sum + a.accuracy, 0) / attempts.length
    
    if (trend < -5) {
      recommendations.push('Take a break and return with fresh focus')
    } else if (trend > 5) {
      recommendations.push('Great improvement! Keep practicing')
    }
    
    if (avgAccuracy < 70) {
      recommendations.push('Focus on stroke accuracy over speed')
    } else if (avgAccuracy > 95) {
      recommendations.push('Try practicing without visual aids')
    }
    
    return recommendations.length > 0 ? recommendations : ['Keep practicing regularly']
  }

  /**
   * Calculate improvement trend (positive = improving, negative = declining)
   */
  private static calculateImprovementTrend(summaries: SessionSummary[]): number {
    if (summaries.length < 2) return 0
    
    const recent = summaries.slice(-5) // Last 5 sessions
    const older = summaries.slice(0, Math.max(1, summaries.length - 5))
    
    const recentAvg = recent.reduce((sum, s) => sum + s.accuracy, 0) / recent.length
    const olderAvg = older.reduce((sum, s) => sum + s.accuracy, 0) / older.length
    
    return recentAvg - olderAvg
  }

  /**
   * Identify common mistakes based on session data
   */
  private static identifyCommonMistakes(summaries: SessionSummary[]): string[] {
    const mistakes: string[] = []
    
    const avgAccuracy = summaries.reduce((sum, s) => sum + s.accuracy, 0) / summaries.length
    const avgSpeed = summaries.reduce((sum, s) => sum + s.averageSpeed, 0) / summaries.length
    const avgTime = summaries.reduce((sum, s) => sum + s.averageStrokeTime, 0) / summaries.length
    
    if (avgAccuracy < 70) mistakes.push('Low overall accuracy')
    if (avgSpeed < 0.1) mistakes.push('Drawing too slowly')
    if (avgSpeed > 2.0) mistakes.push('Drawing too quickly')
    if (avgTime > 3000) mistakes.push('Taking too long per stroke')
    
    return mistakes
  }

  /**
   * Identify user strengths
   */
  private static identifyStrengths(summaries: SessionSummary[]): string[] {
    const strengths: string[] = []
    
    const avgAccuracy = summaries.reduce((sum, s) => sum + s.accuracy, 0) / summaries.length
    const consistency = this.calculateConsistency(summaries)
    
    if (avgAccuracy >= 85) strengths.push('High accuracy')
    if (consistency >= 0.8) strengths.push('Consistent performance')
    if (summaries.length >= 10) strengths.push('Dedicated practice')
    
    return strengths
  }

  /**
   * Calculate performance consistency (0-1 scale)
   */
  private static calculateConsistency(summaries: SessionSummary[]): number {
    if (summaries.length < 2) return 1
    
    const accuracies = summaries.map(s => s.accuracy)
    const mean = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length
    const variance = accuracies.reduce((sum, acc) => sum + Math.pow(acc - mean, 2), 0) / accuracies.length
    const stdDev = Math.sqrt(variance)
    
    // Convert standard deviation to consistency score (lower deviation = higher consistency)
    return Math.max(0, 1 - (stdDev / 50))
  }

  /**
   * Generate personalized recommendations
   */
  private static generateRecommendations(summaries: SessionSummary[], trend: number): string[] {
    const recommendations: string[] = []
    
    const avgAccuracy = summaries.reduce((sum, s) => sum + s.accuracy, 0) / summaries.length
    
    if (trend < -5) {
      recommendations.push('Your performance has declined recently. Take a break and come back refreshed.')
    } else if (trend > 10) {
      recommendations.push('Great improvement! Keep up the consistent practice.')
    }
    
    if (avgAccuracy < 70) {
      recommendations.push('Focus on accuracy over speed. Take your time with each stroke.')
    } else if (avgAccuracy > 90) {
      recommendations.push('Excellent accuracy! Try increasing difficulty or learning new characters.')
    }
    
    if (summaries.length < 5) {
      recommendations.push('Practice this character more to build muscle memory.')
    }
    
    return recommendations.length > 0 ? recommendations : ['Keep practicing regularly to improve!']
  }
}

/**
 * Type definitions for analysis results
 */
export interface StrokeAnalysis {
  length: number
  duration: number
  speed: number
  direction: { x: number; y: number }
  type: 'horizontal' | 'vertical' | 'diagonal' | 'curve' | 'dot'
  pointCount: number
  averagePressure: number
  boundingBox: BoundingBox
}

export interface BoundingBox {
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
}

export interface SessionSummary {
  sessionId: string
  characterId: string
  totalStrokes: number
  accuracy: number
  totalTime: number
  averageStrokeTime: number
  averageStrokeLength: number
  averageSpeed: number
  strokeTypes: Record<string, number>
  completed: boolean
  timestamp: Date
}

export interface CharacterInsights {
  characterId: string
  charactersCompleted: number
  averageAccuracy: number
  improvementTrend: number
  commonMistakes: string[]
  strengths: string[]
  recommendations: string[]
}