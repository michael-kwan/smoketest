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
  onSnapshot?: (dataUrl: string) => void
}

export default function DrawingCanvas({
  width,
  height,
  onStrokeComplete,
  onClear,
  disabled = false,
  className = '',
  onSnapshot
}: DrawingCanvasProps) {
  const windowSize = useWindowSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentStroke, setCurrentStroke] = useState<Point[]>([])
  const [completedStrokes, setCompletedStrokes] = useState<UserStroke[]>([])
  const [startTime, setStartTime] = useState<number>(0)

  // Calculate responsive canvas size (always square)
  const baseSize = width || (windowSize.width && windowSize.width < 768 ? Math.min(windowSize.width - 64, 300) : 300)
  const canvasSize = {
    width: baseSize,
    height: height || baseSize // Ensure square canvas
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
    const canvas = canvasRef.current
    const ctx = getContext()
    if (!canvas || !ctx) return
    
    // Use actual canvas dimensions
    const actualWidth = canvas.width
    const actualHeight = canvas.height
    
    ctx.save() // Save current context state
    ctx.strokeStyle = '#e5e7eb' // Lighter gray
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4]) // Shorter dashes for better visibility
    
    // Vertical center line - ensure it goes full height, slightly inset from edges
    ctx.beginPath()
    ctx.moveTo(Math.floor(actualWidth / 2) + 0.5, 0.5)
    ctx.lineTo(Math.floor(actualWidth / 2) + 0.5, actualHeight - 0.5)
    ctx.stroke()
    
    // Horizontal center line - ensure it goes full width, slightly inset from edges  
    ctx.beginPath()
    ctx.moveTo(0.5, Math.floor(actualHeight / 2) + 0.5)
    ctx.lineTo(actualWidth - 0.5, Math.floor(actualHeight / 2) + 0.5)
    ctx.stroke()
    
    ctx.restore() // Restore context state (includes resetting line dash)
  }, [getContext])

  // Redraw all strokes
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = getContext()
    if (!canvas || !ctx) return
    
    // Clear canvas using actual canvas dimensions
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
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
  }, [completedStrokes, currentStroke, drawGuideLines, getContext])

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

  // Capture canvas snapshot
  const captureSnapshot = useCallback(() => {
    const canvas = canvasRef.current
    if (canvas && onSnapshot) {
      const dataUrl = canvas.toDataURL('image/png')
      onSnapshot(dataUrl)
    }
  }, [onSnapshot])

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
      
      // Capture snapshot after stroke completion
      setTimeout(() => captureSnapshot(), 100)
    }
    
    setCurrentStroke([])
  }, [isDrawing, disabled, currentStroke, startTime, onStrokeComplete, captureSnapshot])

  // Clear all strokes
  const handleClear = useCallback(() => {
    setCompletedStrokes([])
    setCurrentStroke([])
    setIsDrawing(false)
    onClear?.()
    // Canvas will redraw automatically via useEffect when strokes change
  }, [onClear])

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

  // Canvas will clear automatically when component remounts due to key prop change

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