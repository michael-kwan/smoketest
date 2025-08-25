import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'
import { prisma } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      username,
      sessionUuid,
      exerciseId,
      characterId,
      accuracy,
      timeSpent,
      strokeVectors, // Array of stroke data with coordinates, pressure, timing
      canvasSnapshot, // Base64 image data
      difficultyLevel,
      exerciseType
    } = body

    // Validate required fields
    if (!username || !sessionUuid || !exerciseId || !characterId || accuracy === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: username, sessionUuid, exerciseId, characterId, accuracy' },
        { status: 400 }
      )
    }

    // Get or create user by username
    let user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user) {
      // Create new user if doesn't exist
      user = await prisma.user.create({
        data: {
          username,
          name: username,
          isGuest: false
        }
      })
    }

    // Get or create practice session
    let session = await prisma.practiceSession.findUnique({
      where: { sessionUuid }
    })

    if (!session) {
      // Create new session
      session = await prisma.practiceSession.create({
        data: {
          sessionUuid,
          userId: user.id,
          currentExerciseIndex: 0,
          currentCharacterIndex: 0
        }
      })
    }

    // Count strokes from stroke vectors
    const strokeCount = strokeVectors ? strokeVectors.length : 0

    // Save the practice attempt
    const attempt = await prisma.practiceAttempt.create({
      data: {
        userId: user.id,
        sessionUuid,
        exerciseId,
        characterId,
        accuracy: parseFloat(accuracy.toString()),
        timeSpent: parseInt(timeSpent?.toString() || '0'),
        strokeCount,
        strokeVectors: strokeVectors || [],
        canvasSnapshot,
        difficultyLevel: parseInt(difficultyLevel?.toString() || '1'),
        exerciseType: exerciseType || 'character',
        completed: true
      }
    })

    // Update user progress based on this attempt
    await updateUserProgress(user.id, characterId, accuracy)

    // Update session statistics
    await updateSessionStats(sessionUuid)

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      message: 'Practice attempt saved successfully'
    })

  } catch (error) {
    console.error('Error saving practice attempt:', error)
    return NextResponse.json(
      { error: 'Failed to save practice attempt' },
      { status: 500 }
    )
  }
}

// Update user progress for spaced repetition
async function updateUserProgress(userId: string, characterId: string, accuracy: number) {
  const existingProgress = await prisma.userProgress.findUnique({
    where: {
      userId_characterId: {
        userId,
        characterId
      }
    }
  })

  if (existingProgress) {
    // Update existing progress
    const newAccuracyHistory = [...(existingProgress.accuracyHistory as number[]), accuracy].slice(-10) // Keep last 10 attempts
    const averageAccuracy = newAccuracyHistory.reduce((sum, acc) => sum + acc, 0) / newAccuracyHistory.length
    const newStreak = accuracy >= 80 ? existingProgress.streak + 1 : 0
    
    // Calculate next review time based on accuracy and streak (spaced repetition)
    const nextReviewDelay = calculateNextReviewDelay(averageAccuracy, newStreak)
    const nextReview = new Date(Date.now() + nextReviewDelay)

    await prisma.userProgress.update({
      where: {
        userId_characterId: {
          userId,
          characterId
        }
      },
      data: {
        accuracyHistory: newAccuracyHistory,
        totalAttempts: existingProgress.totalAttempts + 1,
        streak: newStreak,
        lastPracticed: new Date(),
        nextReview,
        masteryLevel: calculateMasteryLevel(averageAccuracy, newStreak)
      }
    })
  } else {
    // Create new progress record
    const nextReviewDelay = calculateNextReviewDelay(accuracy, accuracy >= 80 ? 1 : 0)
    const nextReview = new Date(Date.now() + nextReviewDelay)

    await prisma.userProgress.create({
      data: {
        userId,
        characterId,
        accuracyHistory: [accuracy],
        totalAttempts: 1,
        streak: accuracy >= 80 ? 1 : 0,
        lastPracticed: new Date(),
        nextReview,
        masteryLevel: calculateMasteryLevel(accuracy, accuracy >= 80 ? 1 : 0)
      }
    })
  }
}

// Calculate next review delay for spaced repetition (in milliseconds)
function calculateNextReviewDelay(accuracy: number, streak: number): number {
  const baseDelay = 1000 * 60 * 60 * 24 // 1 day in milliseconds
  
  if (accuracy < 60) {
    return baseDelay * 0.5 // Review in 12 hours if struggling
  } else if (accuracy < 80) {
    return baseDelay * 1 // Review in 1 day
  } else {
    // Exponential backoff based on streak
    const multiplier = Math.min(Math.pow(2, streak), 30) // Max 30 days
    return baseDelay * multiplier
  }
}

// Calculate mastery level (0-5)
function calculateMasteryLevel(averageAccuracy: number, streak: number): number {
  if (averageAccuracy >= 95 && streak >= 5) return 5
  if (averageAccuracy >= 90 && streak >= 4) return 4
  if (averageAccuracy >= 85 && streak >= 3) return 3
  if (averageAccuracy >= 75 && streak >= 2) return 2
  if (averageAccuracy >= 60 && streak >= 1) return 1
  return 0
}

// Update session overall statistics
async function updateSessionStats(sessionUuid: string) {
  const attempts = await prisma.practiceAttempt.findMany({
    where: { sessionUuid }
  })

  if (attempts.length === 0) return

  const totalAccuracy = attempts.reduce((sum, attempt) => sum + attempt.accuracy, 0)
  const averageAccuracy = totalAccuracy / attempts.length
  const totalTime = attempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0)

  await prisma.practiceSession.update({
    where: { sessionUuid },
    data: {
      overallAccuracy: averageAccuracy,
      totalTimeSpent: totalTime
    }
  })
}

// GET endpoint to retrieve user attempts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const characterId = searchParams.get('characterId')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user) {
      return NextResponse.json({ attempts: [] })
    }

    const whereClause: any = { userId: user.id }
    if (characterId) {
      whereClause.characterId = characterId
    }

    const attempts = await prisma.practiceAttempt.findMany({
      where: whereClause,
      include: {
        character: true,
        exercise: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    return NextResponse.json({ attempts })

  } catch (error) {
    console.error('Error fetching attempts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attempts' },
      { status: 500 }
    )
  }
}