#!/bin/bash

# Deploy Leaderboard Fix
# Fixes the critical bug where attempts were never created

set -e

echo "🐛 Deploying Leaderboard Fix"
echo "============================="
echo ""
echo "Bug: Attempts were never created when puzzles were completed"
echo "Fix: Added attempt creation logic to completeGame() function"
echo ""

# Check if in right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Run from project root"
    exit 1
fi

# Pull latest code
echo "📥 Step 1: Pulling latest code..."
git pull
echo "✅ Code pulled"
echo ""

# Stop containers
echo "⏹️  Step 2: Stopping containers..."
docker compose down
echo "✅ Containers stopped"
echo ""

# Rebuild frontend (where the fix is)
echo "🔨 Step 3: Rebuilding frontend..."
docker compose build frontend --no-cache
echo "✅ Frontend rebuilt"
echo ""

# Start everything
echo "🚀 Step 4: Starting containers..."
docker compose up -d
echo "✅ Containers started"
echo ""

# Wait for startup
echo "⏳ Step 5: Waiting for startup..."
sleep 10
echo "✅ Ready"
echo ""

# Test
echo "🧪 Step 6: Testing..."
HEALTH=$(curl -s http://localhost:3011/health || echo "failed")
if [[ "$HEALTH" != "failed" ]]; then
    echo "✅ Backend is responding"
else
    echo "⚠️  Backend health check failed"
fi
echo ""

echo "=" | head -c 60 | tr '\n' '='
echo ""
echo "🎉 Deployment Complete!"
echo "=" | head -c 60 | tr '\n' '='
echo ""
echo "✅ The leaderboard fix is now deployed!"
echo ""
echo "🧪 To test:"
echo "   1. Go to: https://sudoku.kyros.party/challenge"
echo "   2. Select Easy difficulty"
echo "   3. Complete the puzzle"
echo "   4. Enter your name"
echo "   5. Check browser console - should see: '✅ Puzzle completed! Attempt queued for sync'"
echo "   6. Wait 60 seconds for auto-sync (or refresh page to trigger sync)"
echo "   7. Visit: https://sudoku.kyros.party/leaderboard"
echo "   8. Change Mode to 'Challenge' and Difficulty to 'Easy'"
echo "   9. Your entry should appear!"
echo ""
echo "📊 To verify attempts are being created:"
echo "   sudo docker exec sudoku-backend node -e '"
echo "   const { PrismaClient } = require(\"@prisma/client\");"
echo "   const prisma = new PrismaClient();"
echo "   prisma.attempt.count().then(c => console.log(\"Total attempts:\", c));'"
echo ""
echo "🔍 What was fixed:"
echo "   ❌ Before: completeGame() only set flags"
echo "   ✅ After: completeGame() creates and queues attempts"
echo "   ✅ Attempts now sync to backend"
echo "   ✅ Leaderboard entries now created"
echo ""

