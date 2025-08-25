/**
 * Minimal localStorage wrapper for user preferences only
 * All practice data goes to PostgreSQL database
 */

export class SimpleStorage {
  private static readonly USERNAME_KEY = 'smoketest-username'
  
  /**
   * Save username to localStorage
   */
  static saveUsername(username: string): void {
    try {
      localStorage.setItem(this.USERNAME_KEY, username.trim())
    } catch (error) {
      console.warn('Failed to save username to localStorage:', error)
      // App continues to work without localStorage
    }
  }

  /**
   * Get saved username from localStorage
   */
  static getUsername(): string | null {
    try {
      return localStorage.getItem(this.USERNAME_KEY)
    } catch (error) {
      console.warn('Failed to read username from localStorage:', error)
      return null
    }
  }

  /**
   * Clear saved username
   */
  static clearUsername(): void {
    try {
      localStorage.removeItem(this.USERNAME_KEY)
    } catch (error) {
      console.warn('Failed to clear username from localStorage:', error)
    }
  }

  /**
   * Check if localStorage is available and working
   */
  static isAvailable(): boolean {
    try {
      const test = 'storage-test'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Clear all SmokeTest data from localStorage (if needed for debugging)
   */
  static clearAll(): void {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('smoketest')) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('Failed to clear localStorage:', error)
    }
  }

  /**
   * Get current localStorage usage (for debugging)
   */
  static getUsageInfo(): { used: number; quota: number } {
    try {
      let used = 0
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length
        }
      }
      
      // Rough estimate of localStorage quota (5MB typical)
      const quota = 5 * 1024 * 1024
      
      return { used, quota }
    } catch (error) {
      return { used: 0, quota: 0 }
    }
  }
}

// Export a simple function interface for easy usage
export const userStorage = {
  saveUsername: SimpleStorage.saveUsername,
  getUsername: SimpleStorage.getUsername,
  clearUsername: SimpleStorage.clearUsername,
  isAvailable: SimpleStorage.isAvailable
}