import { PrismaClient } from '../../generated/prisma'
import type { Character, Exercise } from '@/types'

// Global Prisma instance
declare global {
  var prisma: PrismaClient | undefined
}

const prisma = globalThis.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

// Convert Prisma character to our app's Character type
function convertPrismaCharacter(prismaChar: any): Character {
  return {
    id: prismaChar.id,
    traditional: prismaChar.traditional,
    simplified: prismaChar.simplified,
    jyutping: prismaChar.jyutping,
    english: prismaChar.english,
    strokeCount: prismaChar.strokeCount,
    frequency: prismaChar.frequency,
    difficulty: prismaChar.difficulty,
    strokes: prismaChar.strokePatterns?.map((pattern: any) => ({
      id: pattern.strokeOrder,
      path: pattern.pathData,
      direction: pattern.strokeType || 'horizontal',
      timing: {
        start: 0,
        end: 1000
      }
    })) || []
  }
}

// Convert Prisma exercise to our app's Exercise type  
function convertPrismaExercise(prismaExercise: any): Exercise {
  return {
    id: prismaExercise.id,
    type: prismaExercise.type as 'character' | 'phrase',
    title: prismaExercise.title,
    description: prismaExercise.description,
    difficulty: prismaExercise.difficulty,
    totalStrokes: prismaExercise.totalStrokes,
    jyutping: prismaExercise.jyutping,
    english: prismaExercise.english,
    characters: prismaExercise.exerciseCharacters?.map((ec: any) => 
      convertPrismaCharacter(ec.character)
    ).sort((a: any, b: any) => a.orderIndex - b.orderIndex) || []
  }
}

export const DatabaseService = {
  // Get all exercises with their characters
  async getExercises(): Promise<Exercise[]> {
    const exercises = await prisma.exercise.findMany({
      include: {
        exerciseCharacters: {
          include: {
            character: {
              include: {
                strokePatterns: {
                  orderBy: {
                    strokeOrder: 'asc'
                  }
                }
              }
            }
          },
          orderBy: {
            orderIndex: 'asc'
          }
        }
      },
      orderBy: [
        { difficulty: 'asc' },
        { createdAt: 'asc' }
      ]
    })

    return exercises.map(convertPrismaExercise)
  },

  // Get a specific character by ID
  async getCharacterById(id: string): Promise<Character | null> {
    const character = await prisma.character.findUnique({
      where: { id },
      include: {
        strokePatterns: {
          orderBy: {
            strokeOrder: 'asc'
          }
        }
      }
    })

    if (!character) return null
    return convertPrismaCharacter(character)
  },

  // Get character by traditional form
  async getCharacterByTraditional(traditional: string): Promise<Character | null> {
    const character = await prisma.character.findUnique({
      where: { traditional },
      include: {
        strokePatterns: {
          orderBy: {
            strokeOrder: 'asc'
          }
        }
      }
    })

    if (!character) return null
    return convertPrismaCharacter(character)
  },

  // Get characters by difficulty level
  async getCharactersByDifficulty(difficulty: number, limit = 50): Promise<Character[]> {
    const characters = await prisma.character.findMany({
      where: { difficulty },
      include: {
        strokePatterns: {
          orderBy: {
            strokeOrder: 'asc'
          }
        }
      },
      orderBy: [
        { frequency: 'asc' },
        { strokeCount: 'asc' }
      ],
      take: limit
    })

    return characters.map(convertPrismaCharacter)
  },

  // Get exercises by type
  async getExercisesByType(type: 'character' | 'phrase'): Promise<Exercise[]> {
    const exercises = await prisma.exercise.findMany({
      where: { type },
      include: {
        exerciseCharacters: {
          include: {
            character: {
              include: {
                strokePatterns: {
                  orderBy: {
                    strokeOrder: 'asc'
                  }
                }
              }
            }
          },
          orderBy: {
            orderIndex: 'asc'
          }
        }
      },
      orderBy: [
        { difficulty: 'asc' },
        { createdAt: 'asc' }
      ]
    })

    return exercises.map(convertPrismaExercise)
  },

  // Get exercises by difficulty
  async getExercisesByDifficulty(difficulty: number): Promise<Exercise[]> {
    const exercises = await prisma.exercise.findMany({
      where: { difficulty },
      include: {
        exerciseCharacters: {
          include: {
            character: {
              include: {
                strokePatterns: {
                  orderBy: {
                    strokeOrder: 'asc'
                  }
                }
              }
            }
          },
          orderBy: {
            orderIndex: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return exercises.map(convertPrismaExercise)
  },

  // Save practice session (simplified for now)
  async savePracticeSession(sessionData: any): Promise<string> {
    // This would normally save the full session data
    // For now, just return a mock session ID
    console.log('Practice session saved:', sessionData)
    return 'session_' + Date.now()
  },

  // Get user progress for a character (placeholder)
  async getUserProgress(userId: string, characterId: string): Promise<any> {
    // This would return actual user progress from the database
    // For now, return mock data
    return {
      masteryLevel: 0,
      difficultyLevel: 1,
      totalAttempts: 0,
      averageAccuracy: 0,
      lastPracticed: null,
      nextReview: null
    }
  }
}

export { prisma }
export default DatabaseService