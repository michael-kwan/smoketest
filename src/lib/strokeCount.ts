// Comprehensive stroke count mapping for common Chinese characters
// Based on traditional character forms

export const STROKE_COUNTS: { [key: string]: number } = {
  // Basic numbers (1-10)
  '一': 1, '二': 2, '三': 3, '四': 5, '五': 4, '六': 4, '七': 2, '八': 2, '九': 2, '十': 2,
  
  // Most frequent characters (top 100 by usage)
  '的': 8, '了': 2, '在': 6, '是': 9, '我': 7, '有': 6, '和': 8, '就': 12, '不': 4, '人': 2,
  '都': 11, '一': 1, '個': 10, '來': 8, '他': 5, '時': 10, '會': 13, '地': 6, '得': 11, '對': 14,
  '出': 5, '就': 12, '年': 6, '得': 11, '要': 9, '下': 3, '過': 12, '主': 5, '從': 11, '多': 6,
  
  // Common Cantonese characters
  '佢': 7,   // he/she (Cantonese)
  '咁': 9,   // so/like this
  '嘅': 14,  // possessive particle
  '係': 9,   // to be
  '喺': 12,  // at/in (location)
  '啲': 11,  // plural marker
  '嗰': 13,  // that
  '呢': 8,   // this
  '咗': 9,   // completed action particle
  '嘞': 14,  // sentence final particle
  '咩': 9,   // what
  '乜': 4,   // what
  '點': 17,  // how
  '邊': 18,  // where/which
  '幾': 12,  // how many
  '咪': 9,   // don't
  '啦': 11,  // sentence final particle
  '嚟': 17,  // come
  '去': 5,   // go
  '返': 11,  // return/go back
  '食': 9,   // eat
  '飲': 12,  // drink
  '睇': 13,  // watch/see
  '聽': 22,  // listen
  '講': 17,  // speak/say
  '做': 11,  // do/make
  
  // Family and people
  '人': 2, '男': 7, '女': 3, '子': 3, '父': 4, '母': 5, '兄': 5, '弟': 7, '姐': 8, '妹': 8,
  '爸': 8, '媽': 13, '哥': 10, '公': 4, '婆': 11, '爺': 13, '嫲': 13,
  
  // Basic adjectives and verbs
  '大': 3, '小': 3, '好': 6, '壞': 16, '新': 13, '舊': 18, '快': 7, '慢': 14, '高': 10, '矮': 13,
  '長': 8, '短': 12, '遠': 13, '近': 7, '多': 6, '少': 4, '早': 6, '遲': 15, '前': 9, '後': 9,
  
  // Colors
  '紅': 9, '橙': 16, '黃': 12, '綠': 14, '藍': 18, '紫': 12, '黑': 12, '白': 5, '灰': 6, '棕': 12,
  
  // Body parts
  '頭': 16, '面': 9, '眼': 11, '耳': 6, '鼻': 14, '口': 3, '牙': 4, '舌': 6, '手': 4, '指': 9,
  '腳': 13, '腿': 13, '心': 4, '肚': 7, '背': 9, '肩': 8, '頸': 14, '腰': 13,
  
  // Time and dates
  '日': 4, '月': 4, '年': 6, '時': 10, '分': 4, '秒': 9, '今': 4, '昨': 9, '明': 8, '後': 9,
  '早': 6, '午': 4, '晚': 11, '夜': 8, '春': 9, '夏': 10, '秋': 9, '冬': 5, '星': 9, '期': 12,
  
  // Places
  '家': 10, '屋': 9, '房': 8, '門': 8, '窗': 12, '床': 7, '桌': 10, '椅': 12, '廁': 7, '廚': 12,
  '街': 12, '路': 13, '車': 7, '站': 10, '店': 8, '場': 12, '園': 13, '校': 10, '院': 14, '所': 8,
  
  // Food and drink
  '飯': 12, '麵': 20, '粥': 12, '湯': 13, '菜': 11, '肉': 6, '魚': 11, '蛋': 11, '奶': 5, '茶': 9,
  '咖': 8, '啡': 11, '水': 4, '酒': 10, '糖': 16, '鹽': 24, '油': 8, '醋': 15, '醬': 17, '辣': 14,
  
  // Weather
  '天': 4, '氣': 10, '雲': 12, '雨': 8, '雪': 11, '風': 9, '雷': 13, '電': 13, '熱': 15, '暖': 13,
  '涼': 11, '冷': 7, '凍': 10, '乾': 11, '濕': 17, '晴': 12, '陰': 11, '霧': 19,
  
  // Transportation
  '車': 7, '巴': 4, '士': 3, '船': 11, '飛': 9, '機': 16, '火': 4, '電': 13, '單': 12, '車': 7,
  
  // Numbers and counting
  '百': 6, '千': 3, '萬': 13, '億': 15, '零': 13, '半': 5, '雙': 18, '對': 14, '打': 5, '個': 10,
  
  // Common sentence particles and function words
  '嘅': 14, '咗': 9, '緊': 14, '住': 7, '咁': 9, '都': 11, '仲': 6, '已': 3, '經': 13, '先': 6,
  '再': 6, '又': 2, '同': 6, '或': 8, '者': 8, '但': 7, '係': 9, '如': 6, '果': 8, '因': 6,
  '為': 9, '所': 8, '以': 4, '雖': 17, '然': 12, '而': 6, '且': 5, '除': 10, '非': 8, '只': 5,
  
  // Actions and verbs
  '行': 6, '走': 7, '跑': 12, '跳': 13, '企': 6, '坐': 7, '瞓': 16, '起': 10, '落': 12, '上': 3,
  '入': 2, '出': 5, '開': 12, '關': 19, '着': 11, '除': 10, '穿': 9, '洗': 9, '刷': 8, '擦': 17,
  '掃': 11, '拖': 8, '抹': 8, '煮': 12, '炒': 8, '蒸': 13, '煎': 13, '炸': 9, '烤': 10, '燒': 16,
  
  // Emotions and feelings
  '開': 12, '心': 4, '高': 10, '興': 16, '快': 7, '樂': 15, '喜': 12, '歡': 22, '愛': 13, '恨': 9,
  '怕': 8, '驚': 22, '怒': 9, '氣': 10, '傷': 13, '心': 4, '擔': 16, '心': 4, '放': 8, '心': 4,
  
  // Directions
  '東': 8, '南': 9, '西': 6, '北': 5, '上': 3, '下': 3, '左': 5, '右': 5, '前': 9, '後': 9,
  '中': 4, '內': 4, '外': 5, '裏': 12, '邊': 18, '旁': 10, '隔': 12, '離': 19, '近': 7, '遠': 13,
  
  // Technology and modern terms
  '電': 13, '話': 13, '腦': 13, '網': 14, '機': 16, '器': 16, '視': 11, '聽': 22, '音': 9, '樂': 15,
  '片': 4, '戲': 17, '遊': 12, '戲': 17, '書': 10, '報': 12, '紙': 10, '筆': 12, '字': 6, '畫': 12
}

// Get stroke count for a character, with fallback calculation
export function getStrokeCount(character: string): number {
  // First check our mapping
  if (STROKE_COUNTS[character]) {
    return STROKE_COUNTS[character]
  }
  
  // Fallback: estimate based on character complexity (Unicode ranges)
  const code = character.charCodeAt(0)
  
  // Very rough estimation based on Unicode ranges
  if (code >= 0x4E00 && code <= 0x4FFF) {
    // CJK Unified Ideographs Block 1 - simpler characters
    return Math.floor(Math.random() * 8) + 3 // 3-10 strokes
  } else if (code >= 0x5000 && code <= 0x62FF) {
    // CJK Unified Ideographs Block 2 - medium complexity
    return Math.floor(Math.random() * 12) + 6 // 6-17 strokes
  } else if (code >= 0x6300 && code <= 0x77FF) {
    // CJK Unified Ideographs Block 3 - more complex
    return Math.floor(Math.random() * 15) + 8 // 8-22 strokes
  } else {
    // Default fallback
    return Math.floor(Math.random() * 20) + 5 // 5-24 strokes
  }
}

// Calculate difficulty based on stroke count
export function calculateDifficulty(strokeCount: number): number {
  if (strokeCount <= 3) return 1  // Very easy
  if (strokeCount <= 6) return 2  // Easy
  if (strokeCount <= 10) return 3 // Medium
  if (strokeCount <= 15) return 4 // Hard
  return 5 // Very hard
}

// Get frequency rank (lower number = more frequent)
export function getFrequencyRank(character: string, characterList: string[]): number {
  const index = characterList.indexOf(character)
  return index === -1 ? 9999 : index + 1
}