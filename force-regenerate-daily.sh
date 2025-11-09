#!/bin/bash

# Force Regenerate Today's Daily Puzzle
# This completely removes and regenerates today's puzzle

echo "🔄 Force Regenerating Today's Daily Puzzle"
echo "==========================================="
echo ""

# Get today's date
TODAY=$(date +%Y-%m-%d)
echo "📅 Today: $TODAY"
echo ""

# Copy clear script
echo "📋 Copying clear script..."
docker cp clear-daily-puzzle.js sudoku-backend:/app/
echo ""

# Clear today's puzzle
echo "🗑️  Clearing today's puzzle from database..."
docker exec sudoku-backend node clear-daily-puzzle.js
echo ""

# Restart backend to ensure clean state
echo "🔄 Restarting backend..."
docker compose restart sudoku-backend
echo ""

# Wait for restart
echo "⏳ Waiting for backend to restart..."
sleep 8
echo ""

# Test puzzle generation for all difficulties
echo "🧪 Testing puzzle generation..."
for diff in easy medium hard expert extreme; do
    echo "   Testing $diff..."
    RESULT=$(curl -s "http://localhost:3011/api/daily?difficulty=$diff&deviceId=test-$(date +%s)" | jq -r '.puzzle.id // "FAILED"')
    if [ "$RESULT" != "FAILED" ]; then
        echo "   ✅ $diff: $RESULT"
    else
        echo "   ❌ $diff: FAILED"
    fi
done

echo ""
echo "✅ Done! Try the puzzle now:"
echo "   https://sudoku.kyros.party/daily?showans=true&difficulty=easy"
echo ""

