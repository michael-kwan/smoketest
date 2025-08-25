import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'
import { learningProgression } from '@/lib/learningProgression'

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const level = parseInt(searchParams.get('level') || '1')
    const count = parseInt(searchParams.get('count') || '20')
    
    // Get exercises based on learning progression
    const nextCharacters = learningProgression.getNextCharactersForPractice(count * 2) // Get more to allow for shuffling
    
    // Shuffle the character list to make it unpredictable
    const shuffledCharacters = shuffleArray(nextCharacters).slice(0, count)
    
    // Convert character list to exercises from database
    const exercises = []
    
    for (const char of shuffledCharacters) {
      const character = await DatabaseService.getCharacterByTraditional(char)
      if (character) {
        // Create a dynamic exercise for this character
        exercises.push({
          id: `endless-${char}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'character',
          title: `Practice: ${char}`,
          description: `Learn to write ${char} - ${character.english}`,
          difficulty: character.difficulty,
          totalStrokes: character.strokeCount,
          characters: [character]
        })
      }
    }
    
    // Final shuffle of exercises to ensure randomness
    const finalExercises = shuffleArray(exercises)
    
    // Get progression stats
    const stats = learningProgression.getProgressionStats()
    
    return NextResponse.json({
      exercises: finalExercises,
      progression: stats,
      hasMore: true, // Always true for endless mode
      totalAvailable: finalExercises.length
    })
    
  } catch (error) {
    console.error('Error generating endless exercises:', error)
    return NextResponse.json(
      { error: 'Failed to generate exercises' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { character, accuracy } = body
    
    if (!character || accuracy === undefined) {
      return NextResponse.json(
        { error: 'Character and accuracy are required' },
        { status: 400 }
      )
    }
    
    // Mark character as completed if accuracy is high enough
    learningProgression.markCharacterCompleted(character, accuracy)
    
    // Check if level can be advanced
    const canAdvance = learningProgression.canAdvanceLevel()
    let levelAdvanced = false
    
    if (canAdvance) {
      levelAdvanced = learningProgression.advanceLevel()
    }
    
    const stats = learningProgression.getProgressionStats()
    
    return NextResponse.json({
      success: true,
      levelAdvanced,
      progression: stats
    })
    
  } catch (error) {
    console.error('Error updating progression:', error)
    return NextResponse.json(
      { error: 'Failed to update progression' },
      { status: 500 }
    )
  }
}