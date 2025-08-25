/**
 * Simple user storage for basic preferences only
 * All practice data should go to PostgreSQL database
 */

/**
 * Local storage key constants - only for basic user preferences
 */
const STORAGE_KEYS = {
  USER_PREFERENCES: 'smoketest_user_prefs',
} as const

export interface UserPreferences {
  username: string
  lastSessionUuid?: string
  settings: {
    showPrompts: {
      character: boolean
      jyutping: boolean
      english: boolean
    }
    theme?: 'light' | 'dark'
    language?: 'en' | 'zh'
  }
}

/**
 * User preferences storage manager - lightweight only
 */
export class UserStorage {
  /**
   * Save user preferences to localStorage
   */
  static savePreferences(preferences: UserPreferences): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences))
    } catch (error) {
      console.error('Failed to save user preferences:', error)
      // Gracefully fail - app should still work without localStorage
    }
  }

  /**
   * Get user preferences from localStorage
   */
  static getPreferences(): UserPreferences | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('Failed to load user preferences:', error)
      return null
    }
  }

  /**
   * Get just the username (most common operation)
   */
  static getUsername(): string | null {
    try {
      const prefs = this.getPreferences()
      return prefs?.username || null
    } catch (error) {
      console.error('Failed to load username:', error)
      return null
    }
  }

  /**
   * Save just the username (most common operation)
   */
  static saveUsername(username: string): void {
    try {
      const existingPrefs = this.getPreferences()
      const preferences: UserPreferences = {
        username,
        settings: {
          showPrompts: {
            character: true,
            jyutping: true,
            english: true
          }
        },
        ...existingPrefs
      }
      this.savePreferences(preferences)
    } catch (error) {
      console.error('Failed to save username:', error)
    }
  }

  /**
   * Update prompt settings
   */
  static savePromptSettings(showPrompts: UserPreferences['settings']['showPrompts']): void {
    try {
      const existingPrefs = this.getPreferences()
      if (existingPrefs) {
        existingPrefs.settings.showPrompts = showPrompts
        this.savePreferences(existingPrefs)
      }
    } catch (error) {
      console.error('Failed to save prompt settings:', error)
    }
  }

  /**
   * Clear all user data (logout)
   */
  static clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES)
    } catch (error) {
      console.error('Failed to clear user preferences:', error)
    }
  }

  /**
   * Get estimated storage usage (for debugging)
   */
  static getStorageInfo(): { used: number; available: number } {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES)
      const used = stored ? stored.length : 0
      return {
        used,
        available: 5242880 - used // Rough localStorage limit estimate
      }
    } catch (error) {
      return { used: 0, available: 5242880 }
    }
  }
}