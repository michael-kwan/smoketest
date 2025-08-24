'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import type { Point, UserStroke } from '@/types'
import { useWindowSize } from '@/hooks/useWindowSize'

interface DrawingCanvasProps {
  width?: number
  height?: number
  onStrokeComplete?: (stroke: UserStroke) => void
  onClear?: () => void
  disabled?: boolean
  className?: string
}

export default function DrawingCanvas({
  width,
  height,
  onStrokeComplete,
  onClear,
  disabled = false,
  className = ''
}: DrawingCanvasProps) {
  const windowSize = useWindowSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentStroke, setCurrentStroke] = useState<Point[]>([])
  const [completedStrokes, setCompletedStrokes] = useState<UserStroke[]>([])
  const [startTime, setStartTime] = useState<number>(0)

  // Calculate responsive canvas size
  const canvasSize = {
    width: width || (windowSize.width && windowSize.width < 768 ? Math.min(windowSize.width - 64, 300) : 300),
    height: height || (windowSize.width && windowSize.width < 768 ? Math.min(windowSize.width - 64, 300) : 300)
  }

  // Get canvas context and set up drawing properties
  const getContext = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return null
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#000000'
    
    return ctx
  }, [])

  // Get pointer position relative to canvas
  const getPointerPos = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }, [])

  // Draw guide lines for Chinese character practice
  const drawGuideLines = useCallback(() => {
    const ctx = getContext()
    if (!ctx) return
    
    ctx.strokeStyle = '#f0f0f0'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    
    // Vertical center line
    ctx.beginPath()
    ctx.moveTo(canvasSize.width / 2, 0)
    ctx.lineTo(canvasSize.width / 2, canvasSize.height)
    ctx.stroke()
    
    // Horizontal center line
    ctx.beginPath()
    ctx.moveTo(0, canvasSize.height / 2)
    ctx.lineTo(canvasSize.width, canvasSize.height / 2)
    ctx.stroke()
    
    ctx.setLineDash([])
  }, [canvasSize, getContext])

  // Redraw all strokes
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = getContext()
    if (!canvas || !ctx) return
    
    // Clear canvas
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)
    
    // Draw guide lines
    drawGuideLines()
    
    // Draw completed strokes
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 3
    completedStrokes.forEach(stroke => {
      if (stroke.path.length < 2) return
      
      ctx.beginPath()
      ctx.moveTo(stroke.path[0].x, stroke.path[0].y)
      
      for (let i = 1; i < stroke.path.length; i++) {
        ctx.lineTo(stroke.path[i].x, stroke.path[i].y)
      }
      ctx.stroke()
    })
    
    // Draw current stroke
    if (currentStroke.length >= 2) {
      ctx.beginPath()
      ctx.moveTo(currentStroke[0].x, currentStroke[0].y)
      
      for (let i = 1; i < currentStroke.length; i++) {
        ctx.lineTo(currentStroke[i].x, currentStroke[i].y)
      }
      ctx.stroke()
    }
  }, [canvasSize, completedStrokes, currentStroke, drawGuideLines, getContext])

  // Handle pointer events
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return
    
    e.preventDefault()
    setIsDrawing(true)
    const pos = getPointerPos(e)
    const now = Date.now()
    setStartTime(now)
    
    if (pos) {
      const point: Point = {
        x: pos.x,
        y: pos.y,
        timestamp: now,
        pressure: (e as any).pressure || 1
      }
      setCurrentStroke([point])
    }
  }, [disabled, getPointerPos])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return
    
    e.preventDefault()
    const pos = getPointerPos(e)
    
    if (pos) {
      const point: Point = {
        x: pos.x,
        y: pos.y,
        timestamp: Date.now(),
        pressure: (e as any).pressure || 1
      }
      setCurrentStroke(prev => [...prev, point])
    }
  }, [isDrawing, disabled, getPointerPos])

  const handlePointerUp = useCallback(() => {
    if (!isDrawing || disabled) return
    
    setIsDrawing(false)
    const endTime = Date.now()
    
    if (currentStroke.length > 0) {
      const stroke: UserStroke = {
        path: currentStroke,
        startTime,
        endTime,
        valid: true,
        accuracy: undefined
      }
      
      setCompletedStrokes(prev => [...prev, stroke])
      onStrokeComplete?.(stroke)
    }
    
    setCurrentStroke([])
  }, [isDrawing, disabled, currentStroke, startTime, onStrokeComplete])

  // Clear all strokes
  const handleClear = useCallback(() => {
    setCompletedStrokes([])
    setCurrentStroke([])
    setIsDrawing(false)
    onClear?.()
    redrawCanvas()
  }, [onClear, redrawCanvas])

  // Undo last stroke
  const handleUndo = useCallback(() => {
    if (completedStrokes.length > 0) {
      setCompletedStrokes(prev => prev.slice(0, -1))
    }
  }, [completedStrokes])

  // Initialize canvas on mount
  useEffect(() => {
    redrawCanvas()
  }, [redrawCanvas])

  // Redraw when strokes change
  useEffect(() => {
    redrawCanvas()
  }, [completedStrokes, currentStroke, redrawCanvas])

  // Prevent default touch behavior
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const preventDefault = (e: TouchEvent) => e.preventDefault()
    
    canvas.addEventListener('touchstart', preventDefault, { passive: false })
    canvas.addEventListener('touchmove', preventDefault, { passive: false })
    canvas.addEventListener('touchend', preventDefault, { passive: false })
    
    return () => {
      canvas.removeEventListener('touchstart', preventDefault)
      canvas.removeEventListener('touchmove', preventDefault)
      canvas.removeEventListener('touchend', preventDefault)
    }
  }, [])

  return (
    <div className={`relative ${className}`}>
      {/* Canvas Container */}
      <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="drawing-canvas block"
          style={{ touchAction: 'none' }}
        />
      </div>
      
      {/* Controls */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">
          Strokes: {completedStrokes.length}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleClear}
            disabled={disabled || completedStrokes.length === 0}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Clear
          </button>
          
          <button
            onClick={handleUndo}
            disabled={disabled || completedStrokes.length === 0}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Undo
          </button>
        </div>
      </div>
    </div>
  )
}