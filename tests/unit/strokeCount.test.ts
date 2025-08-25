import { getStrokeCount, calculateDifficulty } from '../../src/lib/strokeCount'

describe('Stroke Count Utilities', () => {
  it('should return stroke count for known characters', () => {
    expect(getStrokeCount('一')).toBe(1)
    expect(getStrokeCount('二')).toBe(2)
    expect(getStrokeCount('三')).toBe(3)
    expect(getStrokeCount('人')).toBe(2)
  })

  it('should return stroke count for unknown characters', () => {
    // The function might calculate strokes or use a default value
    const strokeCount = getStrokeCount('未知字')
    expect(typeof strokeCount).toBe('number')
    expect(strokeCount).toBeGreaterThan(0)
  })

  it('should calculate difficulty correctly', () => {
    expect(calculateDifficulty(1)).toBe(1)   // 1 stroke = difficulty 1
    expect(calculateDifficulty(3)).toBe(1)   // 3 strokes = difficulty 1
    expect(calculateDifficulty(5)).toBe(2)   // 5 strokes = difficulty 2
    expect(calculateDifficulty(10)).toBe(3)  // 10 strokes = difficulty 3
    expect(calculateDifficulty(15)).toBe(4)  // 15 strokes = difficulty 4
    expect(calculateDifficulty(20)).toBe(5)  // 20+ strokes = difficulty 5
  })

  it('should handle edge cases', () => {
    expect(calculateDifficulty(0)).toBe(1)   // Minimum difficulty
    expect(calculateDifficulty(-1)).toBe(1)  // Negative should default to 1
  })
})