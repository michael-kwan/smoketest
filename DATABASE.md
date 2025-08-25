# Database Documentation

## Overview

SmokeTest uses PostgreSQL as the primary database with Prisma as the ORM. The database stores Chinese characters, practice exercises, user progress, and detailed stroke analytics.

## Prerequisites

1. **PostgreSQL** - Install locally or use a cloud provider
2. **Database URL** - Set the `DATABASE_URL` environment variable

### Local PostgreSQL Setup

```bash
# macOS with Homebrew
brew install postgresql
brew services start postgresql

# Create database
createdb smoketest

# Set environment variable
export DATABASE_URL="postgresql://username@localhost:5432/smoketest"
```

### Cloud Database Options

- **Railway**: railway.app (recommended for hobby projects)
- **Supabase**: supabase.com (free tier with 500MB)
- **Neon**: neon.tech (serverless PostgreSQL)
- **PlanetScale**: planetscale.com (MySQL alternative)

## Database Schema

### Core Tables

#### Characters
Stores traditional Chinese characters with metadata:
```sql
- id: Unique identifier
- traditional: Traditional Chinese character
- simplified: Simplified version (optional)
- jyutping: Pronunciation guide
- english: English meaning
- stroke_count: Number of strokes required
- frequency: Usage frequency ranking (1 = most common)
- difficulty: Learning difficulty (1-5)
```

#### Exercises
Learning exercises containing single characters or phrases:
```sql
- id: Unique identifier
- type: 'character' or 'phrase'
- title: Exercise name
- description: Optional description
- difficulty: Exercise difficulty level
- total_strokes: Sum of all character strokes
- jyutping: Phrase pronunciation (phrases only)
- english: Phrase meaning (phrases only)
```

#### Practice Attempts
Individual user attempts when "Check Answer" is clicked:
```sql
- id: Unique identifier
- user_id: Reference to user
- session_uuid: Links to practice session
- exercise_id: Which exercise was practiced
- character_id: Specific character attempted
- accuracy: Calculated accuracy score (0-100)
- time_spent: Milliseconds from start to check answer
- stroke_count: Number of strokes drawn
- stroke_vectors: JSON array of detailed stroke data
- canvas_snapshot: Base64 PNG of final drawing
- completed: Whether attempt finished normally
- difficulty_level: Learning level when attempted
- exercise_type: 'character' or 'phrase'
```

### Key Relationships

```
Users (1) → (M) Practice Sessions (1) → (M) Practice Attempts
Exercises (1) → (M) Exercise Characters (M) → (1) Characters
Characters (1) → (M) Stroke Patterns
Users (1) → (M) User Progress (M) → (1) Characters
```

## Initial Setup

### 1. Set Environment Variables
```bash
# Required
export DATABASE_URL="postgresql://user:pass@host:port/database"

# Optional
export NODE_ENV="development"
```

### 2. Initialize Database
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed with initial data
npm run db:seed
```

### 3. Verify Setup
```bash
# Open Prisma Studio to browse data
npx prisma studio

# Check that tables exist
psql $DATABASE_URL -c "\dt"
```

## Data Management

### Backup & Restore
```bash
# Backup database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql

# Backup specific table
pg_dump $DATABASE_URL -t practice_attempts > attempts_backup.sql
```

### Migrations
```bash
# Create new migration
npx prisma migrate dev --name descriptive_name

# Apply pending migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Seeding Process

The seed script (`prisma/seed.ts`) creates:
1. **Sample Characters** - Basic characters with stroke counts
2. **Practice Exercises** - Both single characters and phrases
3. **Default User** - Guest user for anonymous practice

```bash
# Run seed script directly
npx tsx prisma/seed.ts

# Or use npm script
npm run db:seed
```

## Performance Considerations

### Indexes
Critical indexes automatically created by Prisma:
- `users.username` (unique)
- `characters.traditional` (unique)
- `practice_attempts.session_uuid`
- `practice_attempts.user_id`
- `user_progress.user_id + character_id` (composite unique)

### Query Optimization
```sql
-- Use EXPLAIN ANALYZE for slow queries
EXPLAIN ANALYZE SELECT * FROM practice_attempts 
WHERE user_id = 'user_id' AND created_at > NOW() - INTERVAL '7 days';

-- Create additional indexes if needed
CREATE INDEX idx_practice_attempts_created_at ON practice_attempts(created_at);
CREATE INDEX idx_practice_attempts_accuracy ON practice_attempts(accuracy);
```

### Data Retention
```sql
-- Archive old sessions (example policy)
-- Keep completed sessions for 90 days
-- Keep incomplete sessions for 7 days

DELETE FROM practice_attempts 
WHERE session_uuid IN (
  SELECT session_uuid FROM practice_sessions 
  WHERE completed = false 
  AND created_at < NOW() - INTERVAL '7 days'
);
```

## Monitoring

### Key Metrics
```sql
-- Database size
SELECT pg_size_pretty(pg_database_size('smoketest'));

-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Active practice sessions
SELECT COUNT(*) FROM practice_sessions WHERE completed = false;

-- Daily practice attempts
SELECT 
  DATE(created_at) as date,
  COUNT(*) as attempts,
  AVG(accuracy) as avg_accuracy
FROM practice_attempts 
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Health Checks
```sql
-- Check for orphaned records
SELECT COUNT(*) FROM practice_attempts pa
LEFT JOIN users u ON pa.user_id = u.id
WHERE u.id IS NULL;

-- Check data consistency
SELECT 
  COUNT(*) as total_attempts,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT session_uuid) as unique_sessions
FROM practice_attempts;
```

## Troubleshooting

### Common Issues

**"relation does not exist" error**
```bash
# Schema not applied to database
npx prisma db push
```

**"Client is not ready" error**
```bash
# Prisma client not generated
npx prisma generate
```

**Connection timeout**
```bash
# Check DATABASE_URL format
echo $DATABASE_URL
# Should be: postgresql://user:pass@host:port/database

# Test connection
psql $DATABASE_URL -c "SELECT version();"
```

**Seed data missing**
```bash
# Check if seed ran successfully
psql $DATABASE_URL -c "SELECT COUNT(*) FROM characters;"

# Re-run seed
npm run db:seed
```

### Development Reset
```bash
# Nuclear option - completely reset database
npm run db:reset

# This will:
# 1. Drop all tables
# 2. Recreate schema
# 3. Run seed data
```

## Security Notes

- Database credentials should be stored in environment variables, never in code
- Use connection pooling in production (Prisma handles this automatically)
- Consider read-only database replicas for analytics queries
- Regular backups are essential - practice attempts contain user data
- Stroke vectors and canvas snapshots can grow large - consider compression or archival strategies