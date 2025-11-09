# 🐋 Docker Deployment - Critical Bug Fix

## Quick Reference

### Full Deployment (Rebuild Everything)
```bash
./deploy-fix-production.sh
```

### Quick Fix (Cache Clear Only)
```bash
./quick-fix-docker.sh
```

### Manual Steps
```bash
# 1. Pull changes
git pull

# 2. Rebuild and restart
docker compose down
docker compose build backend --no-cache
docker compose up -d

# 3. Clear cache
docker compose exec -T sudoku-backend node clear-daily-puzzle.js

# 4. Test
curl "https://sudoku.kyros.party/api/daily?difficulty=easy&deviceId=test"
```

## Scripts Overview

### 1. `deploy-fix-production.sh` (Full Deployment)
Complete deployment workflow:
- ✅ Pull from git
- ✅ Stop containers
- ✅ Copy scripts
- ✅ Rebuild backend
- ✅ Start containers
- ✅ Clear cache
- ✅ Test generation

**When to use:**
- First deployment of fix
- After code changes
- Complete rebuild needed

**Time:** ~5-10 minutes

```bash
chmod +x deploy-fix-production.sh
./deploy-fix-production.sh
```

### 2. `quick-fix-docker.sh` (Cache Clear Only)
Just clears the daily puzzle cache:
- ✅ Copy clear script
- ✅ Clear today's puzzle
- ✅ Quick test

**When to use:**
- Backend already rebuilt
- Just need fresh puzzle
- Quick fix needed

**Time:** ~10 seconds

```bash
chmod +x quick-fix-docker.sh
./quick-fix-docker.sh
```

### 3. `clear-and-restart-docker.sh` (Clear + Restart)
Clears cache and restarts backend:
- ✅ Clear today's puzzle
- ✅ Restart backend container
- ✅ Verification

**When to use:**
- After manual code edits
- Backend not responding
- Need clean restart

**Time:** ~30 seconds

```bash
chmod +x clear-and-restart-docker.sh
./clear-and-restart-docker.sh
```

### 4. `clear-daily-puzzle.js` (Node Script)
Core script to clear database:
- Finds today's daily puzzles
- Deletes from database
- Next request regenerates

**When to use:**
- Run inside container
- Called by other scripts
- Manual database cleanup

```bash
# Local
cd backend
node ../clear-daily-puzzle.js

# Docker
docker compose exec -T sudoku-backend node clear-daily-puzzle.js
```

## Deployment Workflows

### Scenario 1: First Time Deploying Fix

```bash
# On your production server
cd ~/sudoku-game
git pull

# Run full deployment
chmod +x deploy-fix-production.sh
./deploy-fix-production.sh

# Test
curl -s "https://sudoku.kyros.party/api/daily?difficulty=easy&deviceId=test" | jq '.puzzle.id'
```

### Scenario 2: Backend Already Updated, Just Clear Cache

```bash
cd ~/sudoku-game

# Quick cache clear
chmod +x quick-fix-docker.sh
./quick-fix-docker.sh

# Or manual
docker compose exec -T sudoku-backend node clear-daily-puzzle.js
```

### Scenario 3: Manual Step-by-Step

```bash
cd ~/sudoku-game

# 1. Update code
git pull

# 2. Copy clear script to backend
cp clear-daily-puzzle.js backend/

# 3. Stop containers
docker compose down

# 4. Rebuild backend only
docker compose build backend --no-cache

# 5. Start everything
docker compose up -d

# 6. Wait for backend to start
sleep 10

# 7. Clear today's puzzle
docker compose exec -T sudoku-backend node clear-daily-puzzle.js

# 8. Test
curl -s "https://sudoku.kyros.party/api/daily?difficulty=easy&deviceId=test"
```

### Scenario 4: Emergency Fix on Live Server

```bash
# SSH to server
ssh your-server

# Quick fix
cd ~/sudoku-game && \
git pull && \
docker compose exec -T sudoku-backend node clear-daily-puzzle.js && \
docker compose restart sudoku-backend

# Verify
curl "http://localhost:3011/api/daily?difficulty=easy&deviceId=test"
```

## Testing After Deployment

### 1. API Test
```bash
# Test all difficulties
for diff in easy medium hard expert extreme; do
  echo "Testing $diff..."
  curl -s "https://sudoku.kyros.party/api/daily?difficulty=$diff&deviceId=test" \
    | jq -r '.puzzle | "\(.difficulty): \(.id)"'
done
```

### 2. Browser Test
```
https://sudoku.kyros.party/daily?showans=true&difficulty=easy
```

**What to check:**
- ✅ Red numbers (answers) are visible
- ✅ Numbers form valid rows (no duplicates)
- ✅ Numbers form valid columns (no duplicates)
- ✅ Numbers form valid 3x3 boxes (no duplicates)
- ✅ Puzzle is solvable

### 3. Full Debug Test
```
https://sudoku.kyros.party/daily?showans=true&showid=true&difficulty=easy
```

**What to check:**
- ✅ Debug info shows in header
- ✅ Device ID displayed
- ✅ Answers visible in grid
- ✅ Puzzle is valid

## Troubleshooting

### Issue: "Backend container not found"
```bash
# Check containers
docker compose ps

# Start if not running
docker compose up -d
```

### Issue: "Permission denied" on scripts
```bash
# Make executable
chmod +x deploy-fix-production.sh
chmod +x quick-fix-docker.sh
chmod +x clear-and-restart-docker.sh
```

### Issue: "Database is locked"
```bash
# Stop containers
docker compose down

# Wait a bit
sleep 5

# Start again
docker compose up -d
```

### Issue: "jq: command not found"
```bash
# Install jq (optional, for testing)
# Ubuntu/Debian
sudo apt-get install jq

# Or test without jq
curl -s "https://sudoku.kyros.party/api/daily?difficulty=easy&deviceId=test"
```

### Issue: Puzzle still broken after deployment
```bash
# 1. Verify backend is using new code
docker compose exec sudoku-backend cat /app/src/services/sudoku-generator.ts | grep "private rng"

# Should show: private rng: () => number = Math.random;

# 2. Clear cache again
docker compose exec -T sudoku-backend node clear-daily-puzzle.js

# 3. Restart backend
docker compose restart sudoku-backend

# 4. Test fresh puzzle
curl "http://localhost:3011/api/daily?difficulty=easy&deviceId=test-$(date +%s)"
```

## Files Location in Docker

### Backend Container
```
/app/
├── src/
│   └── services/
│       └── sudoku-generator.ts    ← Fixed file
├── prisma/
│   └── data/
│       └── app.sqlite              ← Database with cached puzzles
├── clear-daily-puzzle.js           ← Clear script (copy here)
└── node_modules/
```

### Clear Script Location
```bash
# Host: project root
clear-daily-puzzle.js

# Container: /app/
docker compose exec sudoku-backend ls -la clear-daily-puzzle.js
```

## Environment Variables

Make sure these are set in `backend/.env`:

```bash
DATABASE_URL="file:./data/app.sqlite"
PORT=3011
NODE_ENV=production
PUZZLE_SALT="your-secret-salt-here-change-this"
```

## Verification Checklist

After deployment, verify:

- [ ] Backend container is running
  ```bash
  docker compose ps | grep sudoku-backend
  ```

- [ ] Backend is responding
  ```bash
  curl http://localhost:3011/health
  ```

- [ ] Daily puzzle generates
  ```bash
  curl "http://localhost:3011/api/daily?difficulty=easy&deviceId=test"
  ```

- [ ] Puzzle is valid (use showans=true)
  ```
  https://sudoku.kyros.party/daily?showans=true&difficulty=easy
  ```

- [ ] All difficulties work
  ```bash
  for diff in easy medium hard expert extreme; do
    curl -s "http://localhost:3011/api/daily?difficulty=$diff&deviceId=test" | jq '.puzzle.id'
  done
  ```

## Quick Command Reference

```bash
# Full deployment
./deploy-fix-production.sh

# Quick cache clear
./quick-fix-docker.sh

# Clear + restart
./clear-and-restart-docker.sh

# Manual clear
docker compose exec -T sudoku-backend node clear-daily-puzzle.js

# Check logs
docker compose logs -f sudoku-backend

# Restart backend
docker compose restart sudoku-backend

# Rebuild backend
docker compose build backend --no-cache

# Full restart
docker compose down && docker compose up -d

# Check backend health
curl http://localhost:3011/health

# Test puzzle generation
curl "http://localhost:3011/api/daily?difficulty=easy&deviceId=test"
```

## Summary

**Problem:** Daily puzzles were unsolvable due to corrupted seeded RNG.

**Solution:** Fixed sudoku-generator.ts to use instance-level RNG.

**Deployment:**
1. Pull latest code
2. Rebuild backend Docker image
3. Restart containers
4. Clear today's cached puzzle
5. Test new puzzle generation

**Scripts:** Three deployment scripts for different scenarios.

**Time:** 5-10 minutes for full deployment, 10 seconds for cache clear.

**Status:** ✅ Ready to deploy!

