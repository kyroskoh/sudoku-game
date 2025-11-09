# 🔧 Troubleshooting Guide

## Error: "Failed to get puzzle"

This error means the database hasn't been initialized yet.

### Solution: Initialize Database

```bash
# Check backend logs first
sudo docker compose logs backend

# Initialize the database
sudo docker exec -it sudoku-backend npx prisma migrate deploy

# Or if that doesn't work, try:
sudo docker exec -it sudoku-backend sh -c "npx prisma migrate dev --name init"

# Restart backend
sudo docker compose restart backend
```

### Quick Fix Script

```bash
#!/bin/bash
echo "🗄️ Initializing database..."
sudo docker exec -it sudoku-backend npx prisma migrate deploy
echo "🔄 Restarting backend..."
sudo docker compose restart backend
echo "✅ Done! Test: curl http://localhost:3011/api/health"
```

## Common Issues

### 1. Database File Doesn't Exist

**Symptom:** `Error code 14: Unable to open the database file`

**Fix:**
```bash
# Create data directory
sudo docker exec sudoku-backend mkdir -p /app/data

# Initialize database
sudo docker exec -it sudoku-backend npx prisma migrate deploy

# Restart
sudo docker compose restart backend
```

### 2. Prisma Client Not Generated

**Symptom:** `Cannot find module '@prisma/client'`

**Fix:**
```bash
# Rebuild with no cache
sudo docker compose down
sudo docker compose build --no-cache
sudo docker compose up -d
```

### 3. Migration Files Missing

**Symptom:** `No migrations found`

**Fix:**
```bash
# Create initial migration
sudo docker exec -it sudoku-backend sh
cd /app
npx prisma migrate dev --name init
exit

# Restart
sudo docker compose restart backend
```

### 4. Backend Container Keeps Restarting

**Check logs:**
```bash
sudo docker compose logs backend --tail=50
```

**Common causes:**
- Database not initialized → See fix #1
- Port conflict → Check if port 3011 is free
- Missing .env file → Check backend/.env exists

### 5. Frontend Can't Reach API

**Symptom:** 404 errors for /api/* requests

**Fix:**
```bash
# Check nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl reload nginx

# Verify backend is accessible
curl http://localhost:3011/api/health
```

### 6. CORS Errors

**Symptom:** Browser console shows CORS errors

**Fix:** The backend already has CORS enabled. If still getting errors:
```bash
# Check backend logs
sudo docker compose logs backend

# Verify nginx proxy headers are set correctly
sudo nginx -t
```

## Quick Diagnostic Commands

```bash
# Check all container status
sudo docker compose ps

# Check backend health
curl http://localhost:3011/api/health

# Check frontend health  
curl http://localhost:3010/health

# View real-time logs
sudo docker compose logs -f

# Check database exists
sudo docker exec sudoku-backend ls -la /app/data/

# Test database connection
sudo docker exec -it sudoku-backend npx prisma db push
```

## Manual Database Setup

If automatic migration doesn't work:

```bash
# 1. Enter backend container
sudo docker exec -it sudoku-backend sh

# 2. Create database
cd /app
npx prisma db push

# 3. Verify tables exist
npx prisma studio
# (Opens GUI at localhost:5555 - press Ctrl+C to exit)

# 4. Exit container
exit

# 5. Restart backend
sudo docker compose restart backend
```

## Reset Everything (Nuclear Option)

```bash
# Stop and remove everything
sudo docker compose down -v

# Remove database
rm -rf backend/data/app.sqlite

# Rebuild from scratch
sudo docker compose build --no-cache

# Start
sudo docker compose up -d

# Initialize database
sudo docker exec -it sudoku-backend npx prisma migrate deploy

# Test
curl http://localhost:3011/api/health
curl "http://localhost:3011/api/puzzles?mode=casual&difficulty=easy"
```

## Verify Deployment Checklist

```bash
# 1. Containers running?
sudo docker compose ps
# Should show: sudoku-backend (Up), sudoku-frontend (Up)

# 2. Backend healthy?
curl http://localhost:3011/api/health
# Should return: {"status":"ok","timestamp":"..."}

# 3. Database exists?
sudo docker exec sudoku-backend ls -la /app/data/
# Should show: app.sqlite

# 4. Can generate puzzle?
curl "http://localhost:3011/api/puzzles?mode=casual&difficulty=easy"
# Should return: JSON with puzzle data

# 5. Frontend accessible?
curl http://localhost:3010/health
# Should return: OK

# 6. Nginx configured?
sudo nginx -t
# Should return: syntax is ok, test is successful

# 7. Domain working?
curl https://sudoku.kyros.party/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

## Need More Help?

1. **Check logs:** `sudo docker compose logs -f`
2. **Check backend specifically:** `sudo docker compose logs backend --tail=100`
3. **Interactive debugging:** `sudo docker exec -it sudoku-backend sh`
4. **Review configuration:** Check `backend/.env` file exists with correct values

## Contact

Open an issue on GitHub with:
- Error message
- Output of `sudo docker compose logs backend --tail=50`
- Output of `sudo docker compose ps`

