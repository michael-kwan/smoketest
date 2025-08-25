import { NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export async function GET() {
  try {
    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not configured')
      return NextResponse.json(
        { error: 'Database not configured. Please set DATABASE_URL environment variable.' }, 
        { status: 500 }
      )
    }

    const allExercises = await DatabaseService.getExercises()
    
    // Group exercises by difficulty level (which corresponds to learning levels)
    const exercisesByLevel = new Map<number, typeof allExercises>()
    
    for (const exercise of allExercises) {
      if (!exercisesByLevel.has(exercise.difficulty)) {
        exercisesByLevel.set(exercise.difficulty, [])
      }
      exercisesByLevel.get(exercise.difficulty)!.push(exercise)
    }
    
    // Shuffle exercises within each level
    const shuffledExercises: typeof allExercises = []
    
    for (let level = 1; level <= 5; level++) {
      const levelExercises = exercisesByLevel.get(level) || []
      const shuffledLevelExercises = shuffleArray(levelExercises)
      shuffledExercises.push(...shuffledLevelExercises)
    }
    
    return NextResponse.json({ exercises: shuffledExercises })
  } catch (error) {
    console.error('Error fetching exercises:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exercises' }, 
      { status: 500 }
    )
  }
}