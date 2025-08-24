'use client'

import { useState, useEffect } from 'react'
import type { Character } from '@/types'
import { StrokeAnalytics, type CharacterInsights, type SessionSummary } from '@/lib/strokeStorage'

interface StrokeInsightsProps {
  character: Character
  currentSession?: SessionSummary | null
  className?: string
}

export default function StrokeInsights({
  character,
  currentSession,
  className = ''
}: StrokeInsightsProps) {
  const [insights, setInsights] = useState<CharacterInsights | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  // Load character insights
  useEffect(() => {
    const characterInsights = StrokeAnalytics.generateCharacterInsights(character.id)
    setInsights(characterInsights)
  }, [character.id, currentSession]) // Refresh when character changes OR session updates

  if (!insights) return null

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${className}`}>
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Practice Insights
          </h3>
          <div className="flex items-center space-x-4">
            {/* Quick stats */}
            <div className="text-sm text-gray-500">
              {insights.charactersCompleted} completed
            </div>
            <div className="text-sm text-gray-500">
              {insights.averageAccuracy.toFixed(1)}% avg
            </div>
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Current Session Preview */}
        {currentSession && (
          <div className="mt-2 flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Current: {currentSession.accuracy.toFixed(1)}%</span>
            </div>
            <div className="text-gray-500">
              {currentSession.totalStrokes} strokes
            </div>
            <div className="text-gray-500">
              {(currentSession.totalTime / 1000).toFixed(1)}s
            </div>
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-6">
          {/* Performance Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                {insights.totalStrokes}
              </div>
              <div className="text-sm text-blue-600">Strokes</div>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">
                {insights.averageAccuracy.toFixed(0)}%
              </div>
              <div className="text-sm text-green-600">Accuracy</div>
            </div>
            
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">
                {insights.improvementTrend > 0 ? '+' : ''}{insights.improvementTrend.toFixed(1)}%
              </div>
              <div className="text-sm text-purple-600">Trend</div>
            </div>

            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">
                {character.strokeCount}
              </div>
              <div className="text-sm text-orange-600">Expected</div>
            </div>
          </div>

          {/* Improvement Trend */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Progress Trend</h4>
            <div className="flex items-center">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    insights.improvementTrend > 5 ? 'bg-green-500' :
                    insights.improvementTrend > 0 ? 'bg-yellow-500' :
                    insights.improvementTrend > -5 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ 
                    width: `${Math.max(10, Math.min(90, 50 + insights.improvementTrend))}%`
                  }}
                ></div>
              </div>
              <span className={`ml-3 text-sm font-medium ${
                insights.improvementTrend > 0 ? 'text-green-600' : 
                insights.improvementTrend < -5 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {insights.improvementTrend > 5 ? '📈 Improving' :
                 insights.improvementTrend > 0 ? '📊 Stable' :
                 insights.improvementTrend > -5 ? '📉 Declining' : '⚠️ Needs attention'}
              </span>
            </div>
          </div>

          {/* Strengths */}
          {insights.strengths.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Strengths</h4>
              <div className="flex flex-wrap gap-2">
                {insights.strengths.map((strength, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    ✓ {strength}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Common Mistakes */}
          {insights.commonMistakes.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Areas to Improve</h4>
              <div className="flex flex-wrap gap-2">
                {insights.commonMistakes.map((mistake, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                  >
                    ⚠ {mistake}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Recommendations</h4>
            <ul className="space-y-1">
              {insights.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="text-blue-500 mr-2 mt-0.5">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          {/* Current Session Details */}
          {currentSession && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Current Session</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Accuracy:</span>
                  <span className="ml-2 font-medium">{currentSession.accuracy.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-gray-500">Strokes:</span>
                  <span className="ml-2 font-medium">{currentSession.totalStrokes}</span>
                </div>
                <div>
                  <span className="text-gray-500">Time:</span>
                  <span className="ml-2 font-medium">{(currentSession.totalTime / 1000).toFixed(1)}s</span>
                </div>
                <div>
                  <span className="text-gray-500">Avg Speed:</span>
                  <span className="ml-2 font-medium">{currentSession.averageSpeed.toFixed(2)} px/ms</span>
                </div>
                <div>
                  <span className="text-gray-500">Avg Length:</span>
                  <span className="ml-2 font-medium">{currentSession.averageStrokeLength.toFixed(0)} px</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className={`ml-2 font-medium ${currentSession.completed ? 'text-green-600' : 'text-yellow-600'}`}>
                    {currentSession.completed ? 'Complete' : 'In progress'}
                  </span>
                </div>
              </div>

              {/* Stroke Type Breakdown */}
              {Object.keys(currentSession.strokeTypes).length > 0 && (
                <div className="mt-4">
                  <div className="text-sm text-gray-500 mb-2">Stroke Types:</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(currentSession.strokeTypes).map(([type, count]) => (
                      <span key={type} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {type}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}