import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// Create or get user by username
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, name, email } = body

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUser) {
      return NextResponse.json({
        user: existingUser,
        message: 'User already exists'
      })
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        username,
        name: name || username,
        email,
        isGuest: false
      }
    })

    return NextResponse.json({
      user,
      message: 'User created successfully'
    })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

// Get user by username
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        _count: {
          select: {
            practiceAttempts: true,
            practiceSessions: true,
            userProgress: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}