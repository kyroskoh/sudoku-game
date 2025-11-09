#!/bin/bash

# Quick Fix for Docker - Clear Cache Only
# Use this if backend is already rebuilt, just need to clear cache

set -e  # Exit on error

echo "⚡ Quick Fix: Clear Daily Puzzle Cache"
echo "======================================"
echo ""

# Copy clear script if not already there
if [ ! -f "backend/clear-daily-puzzle.js" ]; then
    echo "📋 Copying clear script to backend..."
    cp clear-daily-puzzle.js backend/
fi

# Clear the cache
echo "🗑️  Clearing today's cached daily puzzle..."
docker compose exec -T sudoku-backend node clear-daily-puzzle.js

echo ""
echo "✅ Cache cleared! New puzzle will generate on next request."
echo ""
echo "🧪 Test: https://sudoku.kyros.party/daily?difficulty=easy"
echo ""

