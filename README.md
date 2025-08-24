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

**Tech Stack:**
- **Frontend:** HTML5 Canvas API or SVG
- **Frameworks:** React + Konva.js or Paper.js for drawing
- **Mobile:** Touch events with pointer event handling
- **Data format:** JSON arrays of stroke coordinates with timestamps

**Implementation Tasks:**
```
Task 1.1: Basic Canvas Setup
- Create responsive canvas component
- Implement touch/mouse event handlers
- Add basic drawing with stroke visualization

Task 1.2: Stroke Data Collection
- Record stroke paths as coordinate arrays
- Capture timing data (start/end times per stroke)
- Store stroke order sequence
- Add undo/clear functionality

Task 1.3: Drawing Optimization
- Implement stroke smoothing algorithms
- Add pressure sensitivity (if supported)
- Optimize performance for real-time drawing
- Handle different screen sizes and DPI
```

### 2. Character Database & Content Management
**Purpose:** Store character data, stroke patterns, and learning content

**Key Requirements:**
- Traditional Chinese characters with stroke order data
- Jyutping pronunciations and English translations
- Difficulty ratings and learning progression data
- Efficient querying for spaced repetition

**Tech Stack:**
- **Database:** PostgreSQL or MongoDB for character data
- **ORM:** Prisma (if SQL) or Mongoose (if MongoDB)
- **Data sources:** CC-CEDICT, Make Me a Hanzi project
- **API:** GraphQL or REST endpoints

**Implementation Tasks:**
```
Task 2.1: Database Schema Design
- Characters table (id, traditional, simplified, strokes_count)
- Stroke_patterns table (character_id, stroke_order, svg_paths)
- Translations table (character_id, jyutping, english, frequency)
- User_progress table (user_id, character_id, mastery_level, accuracy)

Task 2.2: Data Import Pipeline
- Scripts to import CC-CEDICT dictionary data
- Parse and validate stroke order from Make Me a Hanzi
- Generate difficulty ratings based on stroke count/frequency
- Create seed data for 1000+ most common characters

Task 2.3: Content API Development
- GET /characters - list with pagination and filtering
- GET /characters/:id - detailed character with stroke data
- GET /characters/practice - next characters for user practice
- POST /characters/:id/progress - update user performance
```

### 3. Stroke Recognition Engine
**Purpose:** Validate user strokes against correct patterns with high accuracy

**Key Requirements:**
- Compare user strokes to ground truth patterns
- Handle variations in writing style and device input
- Provide stroke-by-stroke feedback
- 95%+ accuracy threshold for advancement

**Tech Stack:**
- **ML Framework:** TensorFlow.js for client-side or Python backend
- **Algorithms:** Dynamic Time Warping (DTW), Hausdorff distance
- **Preprocessing:** Canvas coordinate normalization
- **Fallback:** Template matching for simpler validation

**Implementation Tasks:**
```
Task 3.1: Stroke Preprocessing
- Normalize stroke coordinates (scale, center, rotate)
- Resample strokes to consistent point density
- Smooth out input noise while preserving shape
- Extract stroke features (direction, curvature, endpoints)

Task 3.2: Template Matching System
- Load ground truth stroke patterns from database
- Implement DTW algorithm for sequence comparison
- Calculate similarity scores for each stroke
- Combine individual stroke scores for overall accuracy

Task 3.3: Machine Learning Enhancement (Future)
- Collect user stroke data for training
- Build stroke classifier using TensorFlow.js
- Implement online learning for style adaptation
- A/B test ML vs template matching approaches
```

### 4. Spaced Repetition System
**Purpose:** Intelligently schedule character review based on user performance

**Key Requirements:**
- Adaptive scheduling based on SM-2 or similar algorithm
- Track individual character mastery levels
- Factor in stroke complexity and user accuracy
- Prevent interference between similar characters

**Tech Stack:**
- **Algorithm:** Modified SM-2 or Anki-style scheduling
- **Storage:** User progress in database with review timestamps
- **Logic:** Server-side calculation with client caching
- **Optimization:** Background jobs for schedule updates

**Implementation Tasks:**
```
Task 4.1: Core Scheduling Algorithm
- Implement SM-2 spaced repetition algorithm
- Adapt for stroke writing (factor in complexity)
- Calculate next review intervals based on accuracy
- Handle initial learning vs. long-term retention phases

Task 4.2: Progress Tracking System
- Store user attempts with accuracy scores
- Calculate rolling averages and learning curves
- Identify characters needing more practice
- Generate daily practice sessions

Task 4.3: Advanced Scheduling Features
- Prevent similar character interference
- Weight difficult characters appropriately
- Implement overdue review handling
- Add manual review options for users
```

### 5. Adaptive Difficulty System
**Purpose:** Gradually remove prompt elements as user demonstrates mastery

**Key Requirements:**
- 5-tier difficulty progression
- Automatic advancement based on accuracy thresholds
- Fallback to easier levels if performance drops
- Character-specific difficulty tracking

**Tech Stack:**
- **State Management:** React Context or Redux for UI state
- **Database:** User difficulty levels per character
- **Logic:** Rules engine for advancement decisions
- **UI:** Dynamic component rendering based on difficulty

**Implementation Tasks:**
```
Task 5.1: Difficulty Level Management
- Define 5 difficulty levels with specific prompt combinations
- Implement advancement rules (3-5 correct answers to advance)
- Create fallback logic for accuracy drops
- Store per-character difficulty levels

Task 5.2: Dynamic UI Components
- Prompt component that shows/hides elements by difficulty
- Smooth transitions between difficulty levels
- Visual indicators for current difficulty
- Settings for manual difficulty adjustment

Task 5.3: Performance Analytics
- Track accuracy by difficulty level per character
- Generate advancement recommendations
- Create difficulty progression reports
- A/B test different advancement thresholds
```

### 6. User Authentication & Progress Sync
**Purpose:** Enable user accounts with cross-device progress synchronization

**Key Requirements:**
- Secure user registration and login
- Cloud storage of learning progress
- Offline functionality with sync when online
- Guest mode for trying the app

**Tech Stack:**
- **Authentication:** NextAuth.js or Firebase Auth
- **Backend:** Node.js with Express or Next.js API routes
- **Database:** PostgreSQL with user/progress tables
- **Sync:** Background sync service with conflict resolution

**Implementation Tasks:**
```
Task 6.1: Authentication System
- User registration/login with email/password
- OAuth integration (Google, Apple)
- Guest mode with optional account creation
- Password reset and account management

Task 6.2: Progress Synchronization
- API endpoints for uploading/downloading progress
- Conflict resolution for offline changes
- Background sync service
- Data compression for mobile users

Task 6.3: Offline Functionality
- IndexedDB for local progress storage
- Service worker for offline app functionality
- Queue system for pending sync operations
- Graceful handling of network failures
```

### 7. Progressive Web App Infrastructure
**Purpose:** Create app-like experience that works across devices

**Key Requirements:**
- Installable on mobile home screens
- Offline functionality for core features
- Fast loading and smooth performance
- Responsive design for all screen sizes

**Tech Stack:**
- **Framework:** Next.js or Vite + React
- **PWA:** Workbox for service worker
- **Styling:** Tailwind CSS for responsive design
- **Performance:** Code splitting and lazy loading

**Implementation Tasks:**
```
Task 7.1: PWA Setup
- Configure service worker with Workbox
- Create web app manifest for installation
- Implement offline-first caching strategy
- Add app update notifications

Task 7.2: Performance Optimization
- Code splitting for faster initial loads
- Lazy loading of character data
- Image optimization for stroke examples
- Bundle size analysis and optimization

Task 7.3: Responsive Design System
- Mobile-first CSS architecture
- Touch-optimized UI components
- Accessibility features (screen readers, keyboard nav)
- Cross-browser compatibility testing
```

## Development Phases & Checkpoints

### Phase 1: Core Drawing & Validation (Weeks 1-4)
**Deliverable:** Basic app that can capture strokes and validate against templates

**Checkpoint Tasks:**
- [ ] Canvas drawing component working on mobile/desktop
- [ ] Basic character database with 100 characters
- [ ] Simple template matching for stroke validation
- [ ] User can practice writing with immediate feedback

### Phase 2: Spaced Repetition & Difficulty (Weeks 5-8)
**Deliverable:** Complete learning system with adaptive difficulty

**Checkpoint Tasks:**
- [ ] Spaced repetition algorithm implemented
- [ ] 5-tier difficulty system with prompt removal
- [ ] User progress tracking and scheduling
- [ ] 500+ characters available for practice

### Phase 3: User Accounts & Sync (Weeks 9-12)
**Deliverable:** Multi-device app with user accounts

**Checkpoint Tasks:**
- [ ] User authentication system
- [ ] Cloud progress synchronization
- [ ] Offline functionality with sync
- [ ] 1000+ characters with full features

### Phase 4: Polish & Advanced Features (Weeks 13-16)
**Deliverable:** Production-ready app with advanced ML

**Checkpoint Tasks:**
- [ ] Advanced stroke recognition with ML
- [ ] Performance optimizations
- [ ] Analytics and user insights
- [ ] Full PWA capabilities with app store submission

## Tech Stack Summary

**Frontend:**
- React 18 + TypeScript
- Next.js or Vite for build system
- Tailwind CSS for styling
- Konva.js or Paper.js for canvas drawing

**Backend:**
- Node.js + Express or Next.js API routes
- PostgreSQL with Prisma ORM
- NextAuth.js for authentication
- Background job processing

**ML/AI:**
- TensorFlow.js for client-side processing
- Python backend for advanced ML (optional)
- Dynamic Time Warping for stroke comparison
- Template matching as fallback

**Infrastructure:**
- Vercel or Netlify for hosting
- Railway or Supabase for database
- Service worker for offline functionality
- IndexedDB for local storage

## LLM Implementation Notes

Each task above can be implemented independently with clear inputs/outputs. When requesting LLM assistance:

1. **Specify the exact task number** (e.g., "Implement Task 3.1: Stroke Preprocessing")
2. **Provide current project context** (tech stack choices, existing code structure)
3. **Include sample data formats** for inputs/outputs
4. **Specify testing requirements** for validation

The modular structure allows for incremental development with working checkpoints at each phase.