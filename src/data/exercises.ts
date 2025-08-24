import type { Character, Exercise } from '@/types'

// Individual characters
const characters: Character[] = [
  {
    id: '1',
    traditional: '一',
    jyutping: 'jat1',
    english: 'one',
    strokeCount: 1,
    frequency: 1,
    difficulty: 1,
    strokes: [
      {
        id: 1,
        path: [
          { x: 50, y: 150 },
          { x: 250, y: 150 }
        ],
        direction: 'horizontal'
      }
    ]
  },
  {
    id: '2',
    traditional: '二',
    jyutping: 'ji6',
    english: 'two',
    strokeCount: 2,
    frequency: 2,
    difficulty: 1,
    strokes: [
      {
        id: 1,
        path: [
          { x: 50, y: 120 },
          { x: 250, y: 120 }
        ],
        direction: 'horizontal'
      },
      {
        id: 2,
        path: [
          { x: 50, y: 180 },
          { x: 250, y: 180 }
        ],
        direction: 'horizontal'
      }
    ]
  },
  {
    id: '3',
    traditional: '三',
    jyutping: 'saam1',
    english: 'three',
    strokeCount: 3,
    frequency: 3,
    difficulty: 1,
    strokes: [
      {
        id: 1,
        path: [
          { x: 50, y: 100 },
          { x: 250, y: 100 }
        ],
        direction: 'horizontal'
      },
      {
        id: 2,
        path: [
          { x: 50, y: 150 },
          { x: 250, y: 150 }
        ],
        direction: 'horizontal'
      },
      {
        id: 3,
        path: [
          { x: 50, y: 200 },
          { x: 250, y: 200 }
        ],
        direction: 'horizontal'
      }
    ]
  }
]

// Character lookup helper
const getCharacter = (id: string): Character => {
  const char = characters.find(c => c.id === id)
  if (!char) throw new Error(`Character not found: ${id}`)
  return char
}

// Practice exercises
export const exercises: Exercise[] = [
  // Individual Characters
  {
    id: 'char-1',
    type: 'character',
    title: 'Character: 一 (one)',
    difficulty: 1,
    characters: [getCharacter('1')],
    totalStrokes: 1
  },
  {
    id: 'char-2',
    type: 'character',
    title: 'Character: 二 (two)',
    difficulty: 1,
    characters: [getCharacter('2')],
    totalStrokes: 2
  },
  {
    id: 'char-3',
    type: 'character',
    title: 'Character: 三 (three)',
    difficulty: 1,
    characters: [getCharacter('3')],
    totalStrokes: 3
  },

  // Phrase Exercises
  {
    id: 'phrase-12',
    type: 'phrase',
    title: 'Phrase: 一二 (one-two)',
    description: 'Practice writing "one" and "two" in sequence',
    jyutping: 'jat1 ji6',
    english: 'one-two',
    difficulty: 2,
    characters: [getCharacter('1'), getCharacter('2')],
    totalStrokes: 3
  },
  {
    id: 'phrase-13',
    type: 'phrase',
    title: 'Phrase: 一三 (one-three)',
    description: 'Practice writing "one" and "three" in sequence',
    jyutping: 'jat1 saam1',
    english: 'one-three',
    difficulty: 2,
    characters: [getCharacter('1'), getCharacter('3')],
    totalStrokes: 4
  },
  {
    id: 'phrase-23',
    type: 'phrase',
    title: 'Phrase: 二三 (two-three)',
    description: 'Practice writing "two" and "three" in sequence',
    jyutping: 'ji6 saam1',
    english: 'two-three',
    difficulty: 2,
    characters: [getCharacter('2'), getCharacter('3')],
    totalStrokes: 5
  }
]

// Helper functions
export const getExerciseById = (id: string): Exercise | undefined => {
  return exercises.find(ex => ex.id === id)
}

export const getCharacterExercises = (): Exercise[] => {
  return exercises.filter(ex => ex.type === 'character')
}

export const getPhraseExercises = (): Exercise[] => {
  return exercises.filter(ex => ex.type === 'phrase')
}

export const getExercisesByDifficulty = (difficulty: number): Exercise[] => {
  return exercises.filter(ex => ex.difficulty === difficulty)
}