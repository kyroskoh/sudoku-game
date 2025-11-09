#!/bin/bash

# Quick Clear Cache
# Minimal script to just clear the daily puzzle cache

echo "🗑️  Clearing Daily Puzzle Cache"
echo "================================"
echo ""

# Copy script to container
echo "📋 Copying script to container..."
docker cp clear-daily-puzzle.js sudoku-backend:/app/clear-daily-puzzle.js
echo "✅ Copied"
echo ""

# Run it
echo "🗑️  Running clear script..."
docker exec -it sudoku-backend node clear-daily-puzzle.js

echo ""
echo "✅ Done! New puzzle will generate on next request."
echo ""
echo "🧪 Test: https://sudoku.kyros.party/daily?difficulty=easy"
echo ""

