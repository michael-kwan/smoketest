import { getStrokeCount, calculateDifficulty } from './strokeCount'

export interface LearningLevel {
  level: number
  name: string
  description: string
  characterCount: number
  maxDifficulty: number
  characters: string[]
}

// Most frequent Cantonese characters for progressive learning
// Based on usage frequency in Cantonese conversation and media
export const FREQUENCY_ORDERED_CHARACTERS = [
  // Level 1: Essential basics (10 characters) - Absolute must-knows
  '一', '二', '三', '我', '你', '係', '有', '個', '嘅', '喺',
  
  // Level 2: Core foundation (40 more = 50 total) - Daily conversation basics
  '四', '五', '六', '七', '八', '九', '十', '人', '大', '小',
  '好', '唔', '去', '嚟', '食', '飲', '屋', '企', '家', '佢',
  '咁', '都', '會', '得', '要', '做', '睇', '聽', '講', '時',
  '日', '月', '年', '今', '明', '早', '夜', '上', '下', '中',
  '前', '後', '左', '右', '裏', '度', '邊', '咩', '點', '幾',
  
  // Level 3: Practical expansion (50 more = 100 total) - Practical daily life
  '百', '千', '萬', '零', '先', '再', '已', '經', '仲', '同',
  '或', '但', '因', '為', '所', '以', '如', '果', '雖', '然',
  '而', '且', '只', '都', '又', '也', '就', '已', '還', '更',
  '最', '很', '太', '非', '常', '真', '假', '新', '舊', '快',
  '慢', '高', '矮', '長', '短', '遠', '近', '多', '少', '開',
  
  // Level 4: Advanced daily life (100 more = 200 total)
  '心', '手', '腳', '頭', '面', '眼', '口', '耳', '鼻', '髮',
  '身', '體', '肚', '背', '肩', '指', '牙', '舌', '頸', '腰',
  '紅', '藍', '綠', '黃', '黑', '白', '灰', '橙', '紫', '棕',
  '天', '氣', '雨', '雪', '風', '熱', '冷', '暖', '涼', '乾',
  '濕', '晴', '陰', '雲', '電', '雷', '霧', '水', '火', '土',
  '金', '木', '石', '草', '花', '樹', '葉', '果', '菜', '米',
  '飯', '麵', '粥', '湯', '肉', '魚', '蛋', '奶', '茶', '咖',
  '啡', '糖', '鹽', '油', '醋', '辣', '甜', '酸', '苦', '淡',
  '車', '船', '飛', '機', '巴', '士', '火', '電', '單', '的',
  '街', '路', '橋', '站', '場', '店', '市', '鋪', '廠', '園',
  
  // Level 5: Cultural and social (100 more = 300 total)
  '學', '校', '生', '老', '師', '同', '學', '朋', '友', '鄰',
  '居', '客', '人', '主', '人', '老', '闆', '員', '工', '醫',
  '生', '護', '士', '司', '機', '廚', '師', '服', '務', '員',
  '警', '察', '消', '防', '員', '郵', '差', '清', '潔', '工',
  '書', '報', '紙', '雜', '誌', '新', '聞', '電', '視', '收',
  '音', '機', '電', '話', '手', '機', '電', '腦', '網', '路',
  '遊', '戲', '電', '影', '音', '樂', '歌', '舞', '蹈', '畫',
  '畫', '照', '片', '相', '機', '錄', '影', '帶', '光', '碟',
  '銀', '行', '錢', '幣', '卡', '信', '用', '卡', '現', '金',
  '買', '賣', '價', '錢', '便', '宜', '貴', '平', '打', '折'
]

export const LEARNING_LEVELS: LearningLevel[] = [
  {
    level: 1,
    name: 'Foundation',
    description: 'Essential characters for basic communication',
    characterCount: 10,
    maxDifficulty: 2,
    characters: FREQUENCY_ORDERED_CHARACTERS.slice(0, 10)
  },
  {
    level: 2,
    name: 'Core Vocabulary',
    description: 'Daily conversation fundamentals',
    characterCount: 50,
    maxDifficulty: 3,
    characters: FREQUENCY_ORDERED_CHARACTERS.slice(0, 50)
  },
  {
    level: 3,
    name: 'Practical Communication',
    description: 'Real-world usage and practical expressions',
    characterCount: 100,
    maxDifficulty: 4,
    characters: FREQUENCY_ORDERED_CHARACTERS.slice(0, 100)
  },
  {
    level: 4,
    name: 'Advanced Daily Life',
    description: 'Complex daily situations and detailed descriptions',
    characterCount: 200,
    maxDifficulty: 4,
    characters: FREQUENCY_ORDERED_CHARACTERS.slice(0, 200)
  },
  {
    level: 5,
    name: 'Cultural Fluency',
    description: 'Cultural context and sophisticated expression',
    characterCount: 300,
    maxDifficulty: 5,
    characters: FREQUENCY_ORDERED_CHARACTERS.slice(0, 300)
  }
]

export interface ProgressionConfig {
  currentLevel: number
  completedCharacters: Set<string>
  masteryThreshold: number // Accuracy needed to consider character mastered
  advancementThreshold: number // Percentage of level characters needed to advance
}

export class LearningProgressionSystem {
  private config: ProgressionConfig

  constructor(config: Partial<ProgressionConfig> = {}) {
    this.config = {
      currentLevel: 1,
      completedCharacters: new Set(),
      masteryThreshold: 85, // 85% accuracy to master a character
      advancementThreshold: 80, // 80% of level characters mastered to advance
      ...config
    }
  }

  getCurrentLevel(): LearningLevel {
    return LEARNING_LEVELS[this.config.currentLevel - 1] || LEARNING_LEVELS[0]
  }

  getNextCharactersForPractice(count: number = 10): string[] {
    const currentLevel = this.getCurrentLevel()
    const availableCharacters = currentLevel.characters.filter(
      char => !this.config.completedCharacters.has(char)
    )

    if (availableCharacters.length === 0) {
      // All characters in current level mastered, advance or recycle
      return this.handleLevelCompletion()
    }

    // Group by difficulty for balanced selection
    const charactersByDifficulty = new Map<number, string[]>()
    
    for (const char of availableCharacters) {
      const difficulty = calculateDifficulty(getStrokeCount(char))
      if (!charactersByDifficulty.has(difficulty)) {
        charactersByDifficulty.set(difficulty, [])
      }
      charactersByDifficulty.get(difficulty)!.push(char)
    }

    // Get characters from each difficulty level, with some randomization
    const selectedCharacters: string[] = []
    const difficulties = Array.from(charactersByDifficulty.keys()).sort()
    
    // Prioritize easier characters but include some variety
    for (const difficulty of difficulties) {
      const chars = charactersByDifficulty.get(difficulty)!
      
      // Sort by frequency but add some randomization
      const sortedChars = chars.sort((a, b) => {
        const freqA = currentLevel.characters.indexOf(a)
        const freqB = currentLevel.characters.indexOf(b)
        
        // Add random factor to frequency sorting (80% frequency, 20% random)
        const randomA = Math.random() * 0.2
        const randomB = Math.random() * 0.2
        
        return (freqA * 0.8 + randomA) - (freqB * 0.8 + randomB)
      })
      
      // Take characters from this difficulty level
      const charsToTake = Math.min(sortedChars.length, Math.max(1, Math.floor(count / difficulties.length)))
      selectedCharacters.push(...sortedChars.slice(0, charsToTake))
      
      if (selectedCharacters.length >= count) break
    }

    // If we need more characters, fill with remaining ones
    if (selectedCharacters.length < count) {
      const remaining = availableCharacters
        .filter(char => !selectedCharacters.includes(char))
        .sort((a, b) => currentLevel.characters.indexOf(a) - currentLevel.characters.indexOf(b))
      
      selectedCharacters.push(...remaining.slice(0, count - selectedCharacters.length))
    }

    return selectedCharacters.slice(0, count)
  }

  markCharacterCompleted(character: string, accuracy: number): void {
    if (accuracy >= this.config.masteryThreshold) {
      this.config.completedCharacters.add(character)
    }
  }

  canAdvanceLevel(): boolean {
    const currentLevel = this.getCurrentLevel()
    const masteredInLevel = currentLevel.characters.filter(
      char => this.config.completedCharacters.has(char)
    ).length
    
    const masteryPercentage = (masteredInLevel / currentLevel.characterCount) * 100
    return masteryPercentage >= this.config.advancementThreshold
  }

  advanceLevel(): boolean {
    if (this.canAdvanceLevel() && this.config.currentLevel < LEARNING_LEVELS.length) {
      this.config.currentLevel++
      return true
    }
    return false
  }

  private handleLevelCompletion(): string[] {
    if (this.canAdvanceLevel()) {
      this.advanceLevel()
      return this.getNextCharactersForPractice()
    } else {
      // Review mode - return random selection from current level for reinforcement
      const currentLevel = this.getCurrentLevel()
      const reviewCharacters = [...currentLevel.characters]
      return this.shuffleArray(reviewCharacters).slice(0, 10)
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  getProgressionStats() {
    const currentLevel = this.getCurrentLevel()
    const masteredInLevel = currentLevel.characters.filter(
      char => this.config.completedCharacters.has(char)
    ).length
    
    return {
      currentLevel: this.config.currentLevel,
      levelName: currentLevel.name,
      totalMastered: this.config.completedCharacters.size,
      masteredInCurrentLevel: masteredInLevel,
      totalInCurrentLevel: currentLevel.characterCount,
      levelProgress: (masteredInLevel / currentLevel.characterCount) * 100,
      canAdvance: this.canAdvanceLevel()
    }
  }

  // Generate endless exercises based on current progression
  generateEndlessExercises(): string[] {
    const practiceCharacters = this.getNextCharactersForPractice(20)
    const reviewCharacters = this.getReviewCharacters(10)
    
    // Mix practice and review for optimal learning
    return [...practiceCharacters, ...reviewCharacters]
  }

  private getReviewCharacters(count: number): string[] {
    // Get characters that need reinforcement (completed but might need review)
    const completedCharacters = Array.from(this.config.completedCharacters)
    return this.shuffleArray(completedCharacters).slice(0, count)
  }
}

// Export singleton instance for global use
export const learningProgression = new LearningProgressionSystem()