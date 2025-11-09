#!/bin/bash

# Fix Unhealthy Backend
# Handles containers that are running but unhealthy

set -e

echo "🏥 Fixing Unhealthy Backend"
echo "==========================="
echo ""

echo "📊 Current Status:"
docker ps | grep sudoku
echo ""

echo "📋 Checking Backend Logs..."
echo "----------------------------"
docker logs --tail=30 sudoku-backend
echo ""

# Test if backend is actually responding
echo "🧪 Testing Backend Response..."
HEALTH=$(curl -s http://localhost:3011/health 2>&1 || echo "Connection failed")
echo "Response: $HEALTH"
echo ""

if [[ "$HEALTH" == *"Connection failed"* ]] || [[ "$HEALTH" == *"Connection refused"* ]]; then
    echo "❌ Backend is not responding on port 3011"
    echo ""
    echo "🔍 Possible issues:"
    echo "   1. Backend crashed on startup"
    echo "   2. Missing .env file"
    echo "   3. Database error"
    echo "   4. Port binding issue"
    echo ""
    echo "📊 Full Backend Logs:"
    docker logs sudoku-backend
    echo ""
    exit 1
fi

echo "✅ Backend is responding!"
echo ""

# Try to run migrations
echo "🗃️  Running Database Migrations..."
if docker exec -it sudoku-backend npx prisma migrate deploy 2>&1; then
    echo "✅ Migrations complete"
else
    echo "⚠️  Migration may have failed, but continuing..."
fi
echo ""

# Copy and run clear script
echo "📋 Copying clear script..."
docker cp clear-daily-puzzle.js sudoku-backend:/app/clear-daily-puzzle.js
echo "✅ Script copied"
echo ""

echo "🗑️  Clearing Daily Puzzle Cache..."
if docker exec -it sudoku-backend node clear-daily-puzzle.js; then
    echo "✅ Cache cleared!"
else
    echo "⚠️  Could not clear cache, but backend is running"
fi
echo ""

# Test puzzle generation
echo "🧪 Testing Puzzle Generation..."
PUZZLE=$(curl -s "http://localhost:3011/api/daily?difficulty=easy&deviceId=test")
PUZZLE_ID=$(echo $PUZZLE | jq -r '.puzzle.id // empty' 2>/dev/null || echo "")

if [ -n "$PUZZLE_ID" ]; then
    echo "✅ Puzzle Generated! ID: $PUZZLE_ID"
    echo ""
    echo "🎉 Backend is working!"
    echo ""
    echo "🧪 Test URL:"
    echo "   https://sudoku.kyros.party/daily?showans=true&difficulty=easy"
else
    echo "⚠️  Puzzle generation test:"
    echo "$PUZZLE" | jq '.' 2>/dev/null || echo "$PUZZLE"
fi
echo ""

echo "📊 Container Health Status:"
docker ps | grep sudoku
echo ""

echo "💡 Note: Containers may show 'unhealthy' but still work fine."
echo "   This usually means the health check endpoint is not configured."
echo ""

