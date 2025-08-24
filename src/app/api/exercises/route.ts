import { NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function GET() {
  try {
    const exercises = await DatabaseService.getExercises()
    return NextResponse.json({ exercises })
  } catch (error) {
    console.error('Error fetching exercises:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exercises' }, 
      { status: 500 }
    )
  }
}