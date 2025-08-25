'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface UserStats {
  totalAttempts: number
  averageAccuracy: number
  charactersLearned: number
  masteredCharacters: number
  dueForReview: number
}

export default function Home() {
  const [isStarted, setIsStarted] = useState(false)
  const [username, setUsername] = useState('')
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Load saved username from localStorage and clean up old data
  useEffect(() => {
    // Clean up old localStorage data that was causing quota issues
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('smoketest_practice_sessions') || 
            key.startsWith('smoketest_stroke_analytics') ||
            key.startsWith('smoketest_user_progress')) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('Failed to clean up old localStorage data:', error)
    }

    const savedUsername = localStorage.getItem('smoketest-username')
    if (savedUsername) {
      setUsername(savedUsername)
      fetchUserStats(savedUsername)
    }
  }, [])

  const fetchUserStats = async (usernameParam: string) => {
    if (!usernameParam) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/${usernameParam}/progress`)
      if (response.ok) {
        const data = await response.json()
        setUserStats(data.stats)
      } else if (response.status === 404) {
        // User doesn't exist yet - will be created on first practice
        setUserStats({
          totalAttempts: 0,
          averageAccuracy: 0,
          charactersLearned: 0,
          masteredCharacters: 0,
          dueForReview: 0
        })
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      const trimmedUsername = username.trim()
      localStorage.setItem('smoketest-username', trimmedUsername)
      setUsername(trimmedUsername)
      fetchUserStats(trimmedUsername)
    }
  }

  const handleStartPractice = () => {
    if (username.trim()) {
      localStorage.setItem('smoketest-username', username.trim())
      router.push('/practice')
    } else {
      alert('Please enter a username first')
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full text-center space-y-8">
        {/* App Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            煙測
          </h1>
          <p className="text-lg text-gray-600">
            SmokeTest
          </p>
          <p className="text-sm text-gray-500 leading-relaxed">
            Learn traditional Chinese characters through stroke order practice with adaptive difficulty
          </p>
        </div>

        {/* Username Form */}
        <div className="bg-white rounded-xl p-6 shadow-lg space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Welcome Back!</h2>
          
          <form onSubmit={handleUsernameSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            {username && !userStats && !isLoading && (
              <button
                type="submit"
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Load Progress
              </button>
            )}
          </form>

          {isLoading && (
            <div className="text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-2"></div>
              Loading your progress...
            </div>
          )}

          {userStats && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Your Progress</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-indigo-50 rounded-lg p-3">
                  <div className="font-medium text-indigo-700">Practice Attempts</div>
                  <div className="text-indigo-900 text-lg font-bold">{userStats.totalAttempts}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="font-medium text-green-700">Avg Accuracy</div>
                  <div className="text-green-900 text-lg font-bold">{userStats.averageAccuracy.toFixed(1)}%</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="font-medium text-blue-700">Characters Learned</div>
                  <div className="text-blue-900 text-lg font-bold">{userStats.charactersLearned}</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="font-medium text-purple-700">Mastered</div>
                  <div className="text-purple-900 text-lg font-bold">{userStats.masteredCharacters}</div>
                </div>
              </div>
              
              {userStats.dueForReview > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-yellow-700">
                    {userStats.dueForReview} character{userStats.dueForReview !== 1 ? 's' : ''} due for review!
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Start Practice Button */}
        <div className="space-y-4">
          <button
            onClick={handleStartPractice}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            {userStats && userStats.totalAttempts > 0 ? 'Continue Learning' : 'Start Learning'}
          </button>
          
          {!userStats && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/50 rounded-lg p-3">
                <div className="font-medium text-gray-700">Characters</div>
                <div className="text-gray-500">1000+</div>
              </div>
              <div className="bg-white/50 rounded-lg p-3">
                <div className="font-medium text-gray-700">Stroke Order</div>
                <div className="text-gray-500">Validated</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="pt-8 text-xs text-gray-400 space-y-1">
          <p>Progressive Web App</p>
          <p>Works offline • Install on home screen</p>
        </div>
      </div>
    </main>
  )
}