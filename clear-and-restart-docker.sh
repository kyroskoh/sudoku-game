#!/bin/bash

# Clear Daily Puzzle and Restart Backend in Docker
# Run this after deploying the bug fix to production

set -e  # Exit on error

echo "🔧 Clearing Daily Puzzle Cache and Restarting Backend"
echo "====================================================="
echo ""

# Check if Docker Compose is running
if ! docker compose ps | grep -q "sudoku-backend"; then
    echo "❌ Error: Backend container is not running!"
    echo "   Start it with: docker compose up -d"
    exit 1
fi

echo "🗑️  Clearing today's cached daily puzzle..."
echo ""

# Run clear script inside the backend container
docker compose exec sudoku-backend node ../clear-daily-puzzle.js

echo ""
echo "🔄 Restarting backend container..."
docker compose restart sudoku-backend

echo ""
echo "⏳ Waiting for backend to be ready..."
sleep 5

echo ""
echo "✅ Backend restarted with bug fix!"
echo ""
echo "🧪 Test the fix:"
echo "   Production:"
echo "   https://sudoku.kyros.party/daily?showans=true&difficulty=easy"
echo ""
echo "   Local:"
echo "   http://localhost:3010/daily?showans=true&difficulty=easy"
echo ""
echo "🔍 What was fixed:"
echo "   ❌ Before: Math.random was corrupted by seeding"
echo "   ✅ After:  Instance-level RNG used correctly"
echo "   ❌ Before: Daily puzzles were unsolvable"
echo "   ✅ After:  All puzzles work correctly"
echo ""
echo "✨ Daily puzzle will regenerate on next request!"
echo ""

