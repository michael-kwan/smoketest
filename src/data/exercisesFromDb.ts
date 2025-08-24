import { DatabaseService } from '@/lib/database'
import type { Exercise } from '@/types'

// Cache exercises to avoid repeated database calls
let cachedExercises: Exercise[] | null = null

export async function getExercises(): Promise<Exercise[]> {
  if (cachedExercises) {
    return cachedExercises
  }

  try {
    const exercises = await DatabaseService.getExercises()
    cachedExercises = exercises
    return exercises
  } catch (error) {
    console.error('Failed to load exercises from database:', error)
    // Fallback to empty array or could fallback to hardcoded exercises
    return []
  }
}

export async function getCharacterExercises(): Promise<Exercise[]> {
  try {
    return await DatabaseService.getExercisesByType('character')
  } catch (error) {
    console.error('Failed to load character exercises:', error)
    return []
  }
}

export async function getPhraseExercises(): Promise<Exercise[]> {
  try {
    return await DatabaseService.getExercisesByType('phrase')
  } catch (error) {
    console.error('Failed to load phrase exercises:', error)
    return []
  }
}

export async function getExercisesByDifficulty(difficulty: number): Promise<Exercise[]> {
  try {
    return await DatabaseService.getExercisesByDifficulty(difficulty)
  } catch (error) {
    console.error(`Failed to load exercises for difficulty ${difficulty}:`, error)
    return []
  }
}

export function getExerciseById(exercises: Exercise[], id: string): Exercise | undefined {
  return exercises.find(ex => ex.id === id)
}

// Clear cache (useful for development)
export function clearExerciseCache() {
  cachedExercises = null
}