# SmokeTest Operations Playbook

## First-Time Setup

### Prerequisites Setup

**1. Install PostgreSQL**

**macOS:**
```bash
# Using Homebrew (recommended)
brew install postgresql
brew services start postgresql

# Create database user
createuser -s smoketest
createdb -O smoketest smoketest
```

**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Run installer and follow setup wizard
- Add PostgreSQL bin directory to PATH

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres createuser -s smoketest
sudo -u postgres createdb -O smoketest smoketest
```

**2. Set Environment Variables**
```bash
# Local PostgreSQL
export DATABASE_URL="postgresql://smoketest:password@localhost:5432/smoketest"

# Or create .env file in project root
echo 'DATABASE_URL="postgresql://smoketest:password@localhost:5432/smoketest"' > .env
```

**3. Alternative: Cloud Database (Recommended for Quick Start)**
```bash
# Railway.app (free tier)
# 1. Visit railway.app and create account
# 2. Create new PostgreSQL database
# 3. Copy connection string to .env

# Supabase (free tier) 
# 1. Visit supabase.com and create project
# 2. Go to Settings > Database
# 3. Copy connection string to .env

# Neon.tech (serverless, free tier)
# 1. Visit neon.tech and create database
# 2. Copy connection string to .env
```

**4. Run Setup Script**
```bash
chmod +x setup.sh
./setup.sh
```

## Quick Start Commands

### Development Environment Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## Database Operations

### Database Setup & Reset
```bash
# Reset database with fresh schema and seed data
npm run db:reset

# Seed database only (without reset)
npm run db:seed
```

### Prisma Commands
```bash
# Generate Prisma client
npx prisma generate

# Deploy schema changes to database
npx prisma db push

# View data in Prisma Studio
npx prisma studio

# Create a new migration
npx prisma migrate dev --name migration_name
```

### Direct PostgreSQL Access
```bash
# Connect to database via psql (requires DATABASE_URL env var)
psql $DATABASE_URL

# Or connect with individual parameters
psql -h localhost -p 5432 -U username -d database_name
```

## Common Database Queries

### Exercise Management
```sql
-- View all exercises with character counts
SELECT 
  e.id, e.title, e.type, e.difficulty,
  COUNT(ec.character_id) as character_count
FROM exercises e
LEFT JOIN exercise_characters ec ON e.id = ec.exercise_id
GROUP BY e.id, e.title, e.type, e.difficulty
ORDER BY e.difficulty, e.title;

-- Get characters in a specific exercise
SELECT 
  e.title,
  c.traditional, c.jyutping, c.english, c.stroke_count,
  ec.order_index
FROM exercises e
JOIN exercise_characters ec ON e.id = ec.exercise_id
JOIN characters c ON ec.character_id = c.id
WHERE e.id = 'exercise_id_here'
ORDER BY ec.order_index;
```

### User Progress Analytics
```sql
-- User session summary
SELECT 
  u.username,
  COUNT(DISTINCT ps.session_uuid) as total_sessions,
  COUNT(pa.id) as total_attempts,
  AVG(pa.accuracy)::DECIMAL(5,2) as avg_accuracy,
  SUM(pa.time_spent) / 1000 / 60 as total_minutes
FROM users u
LEFT JOIN practice_sessions ps ON u.id = ps.user_id
LEFT JOIN practice_attempts pa ON ps.session_uuid = pa.session_uuid
GROUP BY u.id, u.username
ORDER BY total_attempts DESC;

-- Recent practice activity
SELECT 
  u.username,
  c.traditional,
  pa.accuracy,
  pa.stroke_count,
  pa.time_spent / 1000 as seconds_spent,
  pa.created_at
FROM practice_attempts pa
JOIN users u ON pa.user_id = u.id
JOIN characters c ON pa.character_id = c.id
ORDER BY pa.created_at DESC
LIMIT 20;
```

### Character Difficulty Analysis
```sql
-- Characters by difficulty (based on user performance)
SELECT 
  c.traditional,
  c.stroke_count,
  COUNT(pa.id) as attempt_count,
  AVG(pa.accuracy)::DECIMAL(5,2) as avg_accuracy,
  STDDEV(pa.accuracy)::DECIMAL(5,2) as accuracy_stddev
FROM characters c
LEFT JOIN practice_attempts pa ON c.id = pa.character_id
GROUP BY c.id, c.traditional, c.stroke_count
HAVING COUNT(pa.id) >= 5
ORDER BY avg_accuracy ASC, accuracy_stddev DESC;
```

### Data Cleanup
```sql
-- Remove practice sessions older than 30 days
DELETE FROM practice_sessions 
WHERE created_at < NOW() - INTERVAL '30 days' 
AND completed = false;

-- Remove guest users with no recent activity
DELETE FROM users 
WHERE is_guest = true 
AND updated_at < NOW() - INTERVAL '7 days'
AND id NOT IN (
  SELECT DISTINCT user_id 
  FROM practice_attempts 
  WHERE created_at > NOW() - INTERVAL '7 days'
);
```

## Troubleshooting

### Common Issues

**Database Connection Errors**
```bash
# Check if DATABASE_URL is set
echo $DATABASE_URL

# Test connection
npx prisma db push --preview-feature
```

**Prisma Client Out of Sync**
```bash
# Regenerate client
npx prisma generate

# If schema changed, push changes
npx prisma db push
```

**Seed Data Issues**
```bash
# Clear and reseed
npm run db:reset

# Check seed file
cat prisma/seed.ts
```

### Performance Monitoring
```sql
-- Check database size
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY schemaname, tablename, attname;

-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Long running queries
SELECT 
  pid,
  user,
  application_name,
  client_addr,
  state,
  query_start,
  query
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY query_start;
```

## Environment Variables

Required environment variables:
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/smoketest"
```

Optional environment variables:
```bash
NODE_ENV="development"
PORT="3000"
```