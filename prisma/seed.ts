import { PrismaClient } from '../generated/prisma'
import * as fs from 'fs'
import * as path from 'path'
import { FREQUENCY_ORDERED_CHARACTERS, LEARNING_LEVELS } from '../src/lib/learningProgression'
import { getStrokeCount } from '../src/lib/strokeCount'

const prisma = new PrismaClient()

interface ParsedCharacter {
  traditional: string
  simplified?: string
  mandarin: string
  jyutping: string
  english: string
  strokeCount: number
  frequency: number
  difficulty: number
}

// Stroke count data for common characters (approximate counts)
const strokeCounts: { [key: string]: number } = {
  // Numbers
  '一': 1, '二': 2, '三': 3, '四': 5, '五': 4, '六': 4, '七': 2, '八': 2, '九': 2, '十': 2,
  
  // Basic characters  
  '人': 2, '大': 3, '小': 3, '中': 4, '上': 3, '下': 3, '左': 5, '右': 5, '前': 9, '後': 9,
  
  // Pronouns & family
  '我': 7, '你': 7, '他': 5, '她': 6, '爸': 8, '媽': 13, '哥': 10, '姐': 8, '弟': 7, '妹': 8,
  
  // Common verbs
  '是': 9, '有': 6, '去': 5, '來': 8, '食': 9, '飲': 12, '睇': 13, '聽': 22, '講': 17, '做': 11,
  
  // Time
  '日': 4, '月': 4, '年': 6, '今': 4, '昨': 9, '明': 8, '早': 6, '晏': 10, '夜': 8, '時': 10,
  
  // Colors
  '紅': 9, '藍': 18, '綠': 14, '黃': 12, '白': 5, '黑': 12,
  
  // Common adjectives
  '好': 6, '壞': 16, '快': 7, '慢': 14, '高': 10, '矮': 13, '長': 8, '短': 12, '新': 13, '舊': 18,
  
  // Body parts
  '頭': 16, '手': 4, '腳': 13, '眼': 11, '口': 3,
  
  // Food
  '飯': 12, '麵': 20, '茶': 9, '水': 4, '奶': 5,
  
  // Weather
  '熱': 15, '凍': 10, '雨': 8, '風': 9, '雪': 11,
  
  // Transportation
  '車': 7, '船': 11,
  
  // Places
  '屋': 9, '家': 10, '學': 16, '校': 10, '醫': 18, '院': 14, '銀': 14, '行': 6,
  
  // Animals
  '狗': 8, '貓': 11, '魚': 11, '雞': 18, '豬': 15,
  
  // Question words
  '點': 17, '乜': 4, '邊': 18, '幾': 12, '多': 6, '咩': 9, '邊個': 25, '咁': 9, '點解': 30
}

// Calculate difficulty based on stroke count
function calculateDifficulty(strokeCount: number): number {
  if (strokeCount <= 3) return 1
  if (strokeCount <= 6) return 2
  if (strokeCount <= 10) return 3
  if (strokeCount <= 15) return 4
  return 5
}

// Parse the CC-Canto file and prioritize by frequency
function parseCCCantoFile(filePath: string): ParsedCharacter[] {
  console.log(`📖 Reading CC-Canto file: ${filePath}`)
  
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const ccCantoCharacters = new Map<string, {jyutping: string, english: string, simplified?: string}>()
  
  // First pass: extract all character data from CC-Canto
  for (const line of lines) {
    if (line.startsWith('#') || line.trim() === '') continue
    
    const match = line.match(/^(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+\{([^}]+)\}\s+\/([^\/]+)\//)
    if (!match) continue
    
    const [, traditional, simplified, mandarin, jyutping, english] = match
    if (traditional.length > 1) continue // Skip phrases
    
    // Store the character data (use first occurrence)
    if (!ccCantoCharacters.has(traditional)) {
      ccCantoCharacters.set(traditional, {
        jyutping: jyutping.split(' ')[0],
        english: english.trim().replace(/\s+/g, ' '),
        simplified: simplified !== traditional ? simplified : undefined
      })
    }
  }
  
  console.log(`📊 Extracted ${ccCantoCharacters.size} characters from CC-Canto`)
  
  // Second pass: build character list based on our frequency ordering
  const characters: ParsedCharacter[] = []
  
  for (let i = 0; i < FREQUENCY_ORDERED_CHARACTERS.length; i++) {
    const traditional = FREQUENCY_ORDERED_CHARACTERS[i]
    const ccData = ccCantoCharacters.get(traditional)
    
    if (!ccData) {
      console.log(`⚠️  Character ${traditional} not found in CC-Canto, using fallback data`)
      // Create fallback data for important characters not in CC-Canto
      const strokeCount = getStrokeCount(traditional)
      characters.push({
        traditional,
        mandarin: '',
        jyutping: traditional, // Fallback - would need better mapping
        english: `Character: ${traditional}`,
        strokeCount,
        frequency: i + 1,
        difficulty: calculateDifficulty(strokeCount)
      })
    } else {
      const strokeCount = getStrokeCount(traditional)
      characters.push({
        traditional,
        simplified: ccData.simplified,
        mandarin: '',
        jyutping: ccData.jyutping,
        english: ccData.english,
        strokeCount,
        frequency: i + 1, // Position in frequency order
        difficulty: calculateDifficulty(strokeCount)
      })
    }
  }
  
  console.log(`✅ Built frequency-ordered character list with ${characters.length} characters`)
  return characters
}

// Basic stroke patterns for simple characters
const strokePatterns = [
  // 一 (one) - single horizontal stroke
  {
    traditional: '一',
    strokes: [
      {
        strokeOrder: 1,
        pathData: [
          { x: 50, y: 150 },
          { x: 250, y: 150 }
        ],
        strokeType: 'horizontal'
      }
    ]
  },
  // 二 (two) - two horizontal strokes
  {
    traditional: '二',
    strokes: [
      {
        strokeOrder: 1,
        pathData: [
          { x: 50, y: 120 },
          { x: 250, y: 120 }
        ],
        strokeType: 'horizontal'
      },
      {
        strokeOrder: 2,
        pathData: [
          { x: 50, y: 180 },
          { x: 250, y: 180 }
        ],
        strokeType: 'horizontal'
      }
    ]
  },
  // 三 (three) - three horizontal strokes
  {
    traditional: '三',
    strokes: [
      {
        strokeOrder: 1,
        pathData: [
          { x: 50, y: 100 },
          { x: 250, y: 100 }
        ],
        strokeType: 'horizontal'
      },
      {
        strokeOrder: 2,
        pathData: [
          { x: 50, y: 150 },
          { x: 250, y: 150 }
        ],
        strokeType: 'horizontal'
      },
      {
        strokeOrder: 3,
        pathData: [
          { x: 50, y: 200 },
          { x: 250, y: 200 }
        ],
        strokeType: 'horizontal'
      }
    ]
  },
  // 人 (person) - two strokes forming a person
  {
    traditional: '人',
    strokes: [
      {
        strokeOrder: 1,
        pathData: [
          { x: 100, y: 80 },
          { x: 150, y: 180 }
        ],
        strokeType: 'left-falling'
      },
      {
        strokeOrder: 2,
        pathData: [
          { x: 200, y: 80 },
          { x: 150, y: 180 }
        ],
        strokeType: 'right-falling'
      }
    ]
  },
  // 口 (mouth) - square shape
  {
    traditional: '口',
    strokes: [
      {
        strokeOrder: 1,
        pathData: [
          { x: 100, y: 100 },
          { x: 100, y: 200 }
        ],
        strokeType: 'vertical'
      },
      {
        strokeOrder: 2,
        pathData: [
          { x: 100, y: 200 },
          { x: 200, y: 200 }
        ],
        strokeType: 'horizontal'
      },
      {
        strokeOrder: 3,
        pathData: [
          { x: 200, y: 200 },
          { x: 200, y: 100 },
          { x: 100, y: 100 }
        ],
        strokeType: 'turning'
      }
    ]
  },
  // 大 (big) - person with arms outstretched
  {
    traditional: '大',
    strokes: [
      {
        strokeOrder: 1,
        pathData: [
          { x: 150, y: 80 },
          { x: 150, y: 200 }
        ],
        strokeType: 'vertical'
      },
      {
        strokeOrder: 2,
        pathData: [
          { x: 80, y: 140 },
          { x: 220, y: 140 }
        ],
        strokeType: 'horizontal'
      },
      {
        strokeOrder: 3,
        pathData: [
          { x: 100, y: 180 },
          { x: 200, y: 180 }
        ],
        strokeType: 'horizontal'
      }
    ]
  }
]

async function main() {
  console.log('🌱 Starting database seed with CC-Canto data...')

  // Parse the CC-Canto file
  const ccCantoPath = path.join(process.cwd(), 'db', 'cccanto-webdist.txt')
  const characters = parseCCCantoFile(ccCantoPath)

  // Create a default user
  console.log('👤 Creating default user...')
  const defaultUser = await prisma.user.create({
    data: {
      username: 'guest',
      email: 'guest@smoketest.app',
      name: 'Guest User',
      isGuest: true,
    }
  })

  console.log(`✅ Created default user: ${defaultUser.id}`)

  // Create characters
  console.log('📝 Creating characters...')
  const createdCharacters: { [key: string]: string } = {}

  for (const char of characters) {
    try {
      const character = await prisma.character.create({
        data: {
          traditional: char.traditional,
          simplified: char.simplified,
          jyutping: char.jyutping,
          english: char.english,
          strokeCount: char.strokeCount,
          frequency: char.frequency,
          difficulty: char.difficulty,
        }
      })
      createdCharacters[char.traditional] = character.id
    } catch (error) {
      // Skip duplicates or errors
      console.log(`⚠️  Skipped character ${char.traditional}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  console.log(`✅ Created ${Object.keys(createdCharacters).length} characters`)

  // Create stroke patterns for characters that have them defined
  console.log('🎨 Creating stroke patterns...')
  let strokeCount = 0

  for (const pattern of strokePatterns) {
    const characterId = createdCharacters[pattern.traditional]
    if (!characterId) continue

    for (const stroke of pattern.strokes) {
      await prisma.strokePattern.create({
        data: {
          characterId,
          strokeOrder: stroke.strokeOrder,
          pathData: stroke.pathData,
          strokeType: stroke.strokeType,
        }
      })
      strokeCount++
    }
  }

  console.log(`✅ Created ${strokeCount} stroke patterns`)

  // Create progressive learning exercises based on levels
  console.log('🎯 Creating progressive learning exercises...')
  let exerciseCount = 0

  // Create exercises for each learning level
  for (const level of LEARNING_LEVELS) {
    console.log(`📚 Creating Level ${level.level}: ${level.name} exercises...`)
    
    // Individual character exercises for this level
    const levelChars = level.characters
      .map(char => characters.find(c => c.traditional === char))
      .filter(char => char !== undefined) // Remove undefined entries
      .sort((a, b) => a!.difficulty - b!.difficulty || a!.strokeCount - b!.strokeCount)
    
    for (const char of levelChars) {
      if (!char) continue
      
      const characterId = createdCharacters[char.traditional]
      if (!characterId) continue
      
      const exercise = await prisma.exercise.create({
        data: {
          type: 'character',
          title: `L${level.level}: ${char.traditional} (${char.english})`,
          description: `Level ${level.level} - ${level.name}: Practice writing ${char.traditional}`,
          difficulty: level.level, // Use level number as difficulty
          totalStrokes: char.strokeCount,
        }
      })

      await prisma.exerciseCharacter.create({
        data: {
          exerciseId: exercise.id,
          characterId,
          orderIndex: 0,
        }
      })
      
      exerciseCount++
    }
  }

  // Create phrase exercises using the most basic characters
  const basicChars = characters.filter(c => c.difficulty <= 2).slice(0, 10)
  const phrases = [
    {
      characters: ['一', '二'],
      title: 'Numbers: One-Two',
      description: 'Practice writing numbers one and two in sequence',
      jyutping: 'jat1 ji6',
      english: 'one-two',
      difficulty: 2,
    },
    {
      characters: ['一', '三'],
      title: 'Numbers: One-Three', 
      description: 'Practice writing numbers one and three in sequence',
      jyutping: 'jat1 saam1',
      english: 'one-three',
      difficulty: 2,
    },
    {
      characters: ['二', '三'],
      title: 'Numbers: Two-Three',
      description: 'Practice writing numbers two and three in sequence',
      jyutping: 'ji6 saam1', 
      english: 'two-three',
      difficulty: 2,
    }
  ]

  // Only create phrase exercises if we have the characters
  for (const phrase of phrases) {
    const phraseCharIds = phrase.characters.map(char => createdCharacters[char]).filter(Boolean)
    if (phraseCharIds.length !== phrase.characters.length) continue

    const totalStrokes = phrase.characters.reduce((sum, char) => {
      const charData = characters.find(c => c.traditional === char)
      return sum + (charData?.strokeCount || 0)
    }, 0)

    const exercise = await prisma.exercise.create({
      data: {
        type: 'phrase',
        title: phrase.title,
        description: phrase.description,
        jyutping: phrase.jyutping,
        english: phrase.english,
        difficulty: phrase.difficulty,
        totalStrokes,
      }
    })

    for (let i = 0; i < phrase.characters.length; i++) {
      const charId = createdCharacters[phrase.characters[i]]
      if (charId) {
        await prisma.exerciseCharacter.create({
          data: {
            exerciseId: exercise.id,
            characterId: charId,
            orderIndex: i,
          }
        })
      }
    }
    
    exerciseCount++
  }

  console.log(`✅ Created ${exerciseCount} exercises`)

  console.log('🎉 Database seeded successfully with CC-Canto data!')
  console.log(`📊 Summary:`)
  console.log(`   - ${Object.keys(createdCharacters).length} characters from CC-Canto dictionary`)
  console.log(`   - ${strokeCount} stroke patterns`)
  console.log(`   - ${exerciseCount} exercises`)
  console.log(`   - 1 default user`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })