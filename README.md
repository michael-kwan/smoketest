# SmokeTest App - Technical Implementation Guide

## Project Overview

**Goal:** Build a progressive web app that teaches traditional Chinese character writing for Cantonese speakers through stroke order practice with adaptive difficulty and spaced repetition.

**Core User Flow:**
1. User sees prompt (character + jyutping + English)
2. User draws character on canvas with correct stroke order
3. AI validates strokes (95%+ accuracy threshold)
4. System tracks progress and adjusts difficulty (removes prompt elements)
5. Spaced repetition schedules review based on performance

## Component Architecture & Technical Tasks

### 1. Canvas Drawing System
**Purpose:** Capture user handwriting input with stroke-by-stroke tracking

**Key Requirements:**
- Real-time stroke capture on mobile/desktop
- Record stroke order, timing, and path coordinates
- Smooth drawing experience with minimal latency
- Support for pressure/velocity if available


## Current Implementation Status

### ✅ Completed Features
- **Canvas Drawing System** - HTML5 Canvas with stroke capture working
- **Database Schema** - Complete PostgreSQL schema with Prisma ORM
- **Multi-Exercise Practice System** - Support for both single characters and phrases
- **User Progress Tracking** - Username-based sessions with database persistence
- **Practice Attempt Storage** - Stroke vectors and canvas snapshots saved to database
- **Spaced Repetition Foundation** - Database structure ready for SM-2 algorithm
- **API Endpoints** - REST APIs for exercises, attempts, and user progress
- **Responsive Design** - Mobile and desktop optimized UI

### 🚧 In Progress / TODO
- Create operations playbook (database management commands)
- Fix canvas dotted line extending to right edge
- Implement proper mobile tile ordering (task definition → canvas → stats)
- Add username specification on home page with postgres session stats
- Parse task definition numbered lists to reduce UI clutter

**Tech Stack:**
- **Frontend:** HTML5 Canvas API or SVG
- **Frameworks:** React + Konva.js or Paper.js for drawing
- **Mobile:** Touch events with pointer event handling
- **Data format:** JSON arrays of stroke coordinates with timestamps


## Future Development Roadmap

### Next Phase: Advanced Learning Features

**Enhanced Stroke Recognition**
- Implement ML-based stroke validation using TensorFlow.js
- Create template matching system for stroke comparison
- Add stroke-by-stroke feedback with 95%+ accuracy threshold

**Spaced Repetition System** 
- Implement SM-2 algorithm for intelligent review scheduling
- Add character mastery levels and difficulty progression
- Create daily practice session generation based on user performance

**Advanced Difficulty System**
- Build 5-tier difficulty progression with automatic advancement
- Add prompt removal based on user performance (character → pronunciation → meaning)
- Implement fallback logic for struggling users

### Long-term Goals

**User Authentication & Multi-device Sync**
- OAuth integration (Google, Apple) 
- Cross-device progress synchronization
- Offline-first architecture with conflict resolution

**Performance & Production**
- Code splitting and lazy loading optimization
- Service worker for offline functionality  
- App store submission for iOS/Android

**Analytics & AI Enhancement**
- User learning analytics and insights
- Personalized learning path recommendations
- Advanced stroke recognition with neural networks

## Current Tech Stack

**Frontend:** React 18 + TypeScript, Next.js, Tailwind CSS, HTML5 Canvas
**Backend:** Next.js API routes, PostgreSQL, Prisma ORM  
**Infrastructure:** Vercel/Netlify hosting, Railway/Supabase database