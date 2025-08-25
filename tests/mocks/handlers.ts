import { http, HttpResponse } from 'msw'
import type { Exercise, Character } from '@/types'

// Mock data
const mockCharacters: Character[] = [
  {
    id: '1',
    traditional: '一',
    simplified: '一',
    jyutping: 'jat1',
    english: 'one',
    strokeCount: 1,
    frequency: 1,
    difficulty: 1,
    strokes: [
      {
        id: 1,
        path: [{ x: 50, y: 150 }, { x: 250, y: 150 }],
        direction: 'horizontal',
        timing: { start: 0, end: 1000 }
      }
    ]
  },
  {
    id: '2',
    traditional: '二',
    simplified: '二',
    jyutping: 'ji6',
    english: 'two',
    strokeCount: 2,
    frequency: 2,
    difficulty: 1,
    strokes: [
      {
        id: 1,
        path: [{ x: 50, y: 120 }, { x: 250, y: 120 }],
        direction: 'horizontal',
        timing: { start: 0, end: 500 }
      },
      {
        id: 2,
        path: [{ x: 50, y: 180 }, { x: 250, y: 180 }],
        direction: 'horizontal',
        timing: { start: 500, end: 1000 }
      }
    ]
  }
]

const mockExercises: Exercise[] = [
  {
    id: 'ex1',
    type: 'character',
    title: 'L1: 一 (one)',
    description: 'Level 1 - Basic Numbers: Practice writing 一',
    difficulty: 1,
    totalStrokes: 1,
    characters: [mockCharacters[0]]
  },
  {
    id: 'ex2',
    type: 'character',
    title: 'L1: 二 (two)',
    description: 'Level 1 - Basic Numbers: Practice writing 二',
    difficulty: 1,
    totalStrokes: 2,
    characters: [mockCharacters[1]]
  },
  {
    id: 'ex3',
    type: 'phrase',
    title: 'Numbers 1-2',
    description: 'Practice the numbers one and two together',
    difficulty: 1,
    totalStrokes: 3,
    jyutping: 'jat1 ji6',
    english: 'one two',
    characters: mockCharacters
  }
]

export const handlers = [
  // Exercises API
  http.get('/api/exercises', () => {
    return HttpResponse.json({ exercises: mockExercises })
  }),

  // User progress API
  http.get('/api/users/:username/progress', ({ params }) => {
    const { username } = params
    
    const mockStats = {
      totalAttempts: 25,
      averageAccuracy: 85.5,
      charactersLearned: 10,
      masteredCharacters: 3,
      dueForReview: 2
    }

    const mockProgress = [
      {
        id: '1',
        userId: 'user1',
        characterId: '1',
        masteryLevel: 3,
        difficultyLevel: 2,
        accuracyHistory: [80, 85, 90],
        totalAttempts: 5,
        streak: 2,
        lastPracticed: new Date().toISOString(),
        nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        character: mockCharacters[0]
      }
    ]

    const mockRecentAttempts = [
      {
        id: '1',
        userId: 'user1',
        sessionUuid: 'session1',
        exerciseId: 'ex1',
        characterId: '1',
        accuracy: 90,
        timeSpent: 5000,
        strokeCount: 1,
        completed: true,
        createdAt: new Date().toISOString(),
        character: mockCharacters[0],
        exercise: mockExercises[0]
      }
    ]

    return HttpResponse.json({
      progress: mockProgress,
      recentAttempts: mockRecentAttempts,
      stats: mockStats
    })
  }),

  // Practice attempts API
  http.post('/api/attempts', async ({ request }) => {
    const body = await request.json()
    
    return HttpResponse.json({
      success: true,
      attemptId: 'attempt_' + Date.now(),
      message: 'Practice attempt saved successfully'
    })
  }),

  // Database error simulation
  http.get('/api/exercises/error', () => {
    return HttpResponse.json(
      { error: 'Database not configured. Please set DATABASE_URL environment variable.' },
      { status: 500 }
    )
  })
]