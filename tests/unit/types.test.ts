// Test type definitions and utility functions
import type { Character, Exercise, UserStroke, Point } from '../../src/types'

describe('Type Definitions', () => {
  it('should define Character type correctly', () => {
    const mockCharacter: Character = {
      id: '1',
      traditional: '一',
      simplified: '一',
      jyutping: 'jat1',
      english: 'one',
      strokeCount: 1,
      frequency: 1,
      difficulty: 1,
      strokes: []
    }
    
    expect(mockCharacter.id).toBe('1')
    expect(mockCharacter.traditional).toBe('一')
    expect(mockCharacter.strokeCount).toBe(1)
  })

  it('should define Exercise type correctly', () => {
    const mockExercise: Exercise = {
      id: 'ex1',
      type: 'character',
      title: 'Test Exercise',
      description: 'Test description',
      difficulty: 1,
      totalStrokes: 1,
      characters: []
    }
    
    expect(mockExercise.type).toBe('character')
    expect(mockExercise.difficulty).toBe(1)
  })

  it('should define UserStroke type correctly', () => {
    const mockPoint: Point = {
      x: 100,
      y: 100,
      timestamp: Date.now(),
      pressure: 0.5
    }
    
    const mockStroke: UserStroke = {
      path: [mockPoint],
      startTime: Date.now() - 1000,
      endTime: Date.now(),
      valid: true,
      accuracy: 95.5
    }
    
    expect(mockStroke.path.length).toBe(1)
    expect(mockStroke.valid).toBe(true)
    expect(mockStroke.accuracy).toBe(95.5)
  })

  it('should handle optional properties', () => {
    const minimalCharacter: Character = {
      id: '1',
      traditional: '一',
      jyutping: 'jat1', 
      english: 'one',
      strokeCount: 1,
      frequency: 1,
      difficulty: 1,
      strokes: []
    }
    
    expect(minimalCharacter.simplified).toBeUndefined()
  })
})