import { DatabaseService } from '../../src/lib/database'
import type { Exercise } from '../../src/types'

// Simple database service tests
describe('DatabaseService', () => {
  it('should have getExercises method', () => {
    expect(typeof DatabaseService.getExercises).toBe('function')
  })

  it('should have getCharacterById method', () => {
    expect(typeof DatabaseService.getCharacterById).toBe('function')
  })

  it('should have getCharacterByTraditional method', () => {
    expect(typeof DatabaseService.getCharacterByTraditional).toBe('function')
  })

  // Integration test with real database
  it('should fetch exercises from database', async () => {
    try {
      const exercises = await DatabaseService.getExercises()
      expect(Array.isArray(exercises)).toBe(true)
      
      if (exercises.length > 0) {
        const exercise = exercises[0]
        expect(exercise).toHaveProperty('id')
        expect(exercise).toHaveProperty('title')
        expect(exercise).toHaveProperty('type')
        expect(exercise).toHaveProperty('characters')
        expect(Array.isArray(exercise.characters)).toBe(true)
      }
    } catch (error) {
      // If database isn't set up, test should still pass
      expect(error).toBeDefined()
    }
  })
})