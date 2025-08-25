import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

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
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get user progress with character details
    const progress = await prisma.userProgress.findMany({
      where: { userId: user.id },
      include: {
        character: {
          select: {
            traditional: true,
            jyutping: true,
            english: true,
            strokeCount: true,
            difficulty: true
          }
        }
      },
      orderBy: {
        lastPracticed: 'desc'
      }
    })

    // Get recent practice attempts
    const recentAttempts = await prisma.practiceAttempt.findMany({
      where: { userId: user.id },
      include: {
        character: {
          select: {
            traditional: true,
            jyutping: true,
            english: true
          }
        },
        exercise: {
          select: {
            title: true,
            type: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    })

    // Calculate overall statistics
    const totalAttempts = await prisma.practiceAttempt.count({
      where: { userId: user.id }
    })

    const avgAccuracyResult = await prisma.practiceAttempt.aggregate({
      where: { userId: user.id },
      _avg: {
        accuracy: true
      }
    })

    const charactersLearned = progress.length
    const masteredCharacters = progress.filter(p => p.masteryLevel >= 4).length

    // Characters due for review
    const dueForReview = await prisma.userProgress.count({
      where: {
        userId: user.id,
        nextReview: {
          lte: new Date()
        }
      }
    })

    const stats = {
      totalAttempts,
      averageAccuracy: avgAccuracyResult._avg.accuracy || 0,
      charactersLearned,
      masteredCharacters,
      dueForReview
    }

    return NextResponse.json({
      progress,
      recentAttempts,
      stats
    })

  } catch (error) {
    console.error('Error fetching user progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user progress' },
      { status: 500 }
    )
  }
}