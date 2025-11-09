#!/bin/bash

# Deploy Critical Bug Fix - Unsolvable Daily Puzzles
# This fixes the seeded random number generator that was creating invalid puzzles

set -e  # Exit on error

echo "🐛 Deploying CRITICAL bug fix..."
echo "   Issue: Daily puzzles were unsolvable"
echo "   Fix: Proper RNG management in puzzle generator"
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml not found!"
    echo "   Please run this script from the project root"
    exit 1
fi

# Commit changes
echo "📝 Committing changes..."
git add backend/src/services/sudoku-generator.ts
git add CRITICAL_BUG_FIX.md
git add DEV_MODE_FEATURES.md
git add frontend/src/components/Header.tsx
git add frontend/src/components/Header.module.css
git commit -m "🐛 CRITICAL FIX: Fix unsolvable daily puzzles

- Fixed seeded RNG that corrupted global Math.random
- Changed to instance-level RNG (this.rng)
- Daily puzzles now generate properly
- Added showid=true debug feature for device ID display
- All seeded puzzles now work correctly

This was a critical bug that made daily puzzles unsolvable.
The fix uses instance-level RNG instead of mutating global state."

echo ""
echo "✅ Changes committed!"
echo ""

# Push to git
read -p "📤 Push to GitHub? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Pushing to GitHub..."
    git push
    echo "✅ Pushed to GitHub!"
fi

echo ""
echo "🚀 Deploying to production server..."
echo ""
echo "Run these commands on your production server:"
echo ""
echo "---------------------------------------------------"
echo "cd ~/sudoku-game"
echo "git pull"
echo "sudo docker compose down"
echo "sudo docker compose build backend --no-cache"
echo "sudo docker compose up -d"
echo ""
echo "# Test the fix"
echo "curl -s 'https://sudoku.kyros.party/api/daily?difficulty=easy&deviceId=test' | jq '.puzzle.id'"
echo "---------------------------------------------------"
echo ""
echo "Or run this one-liner on production:"
echo ""
echo "ssh your-server 'cd ~/sudoku-game && git pull && sudo docker compose down && sudo docker compose build backend --no-cache && sudo docker compose up -d'"
echo ""
echo "✅ Deployment prepared!"
echo ""
echo "📋 What was fixed:"
echo "   ❌ Before: Math.random was overwritten globally"
echo "   ✅ After: Instance-level RNG used"
echo "   ❌ Before: Daily puzzles were unsolvable"
echo "   ✅ After: All puzzles work correctly"
echo ""
echo "🧪 Test with: https://sudoku.kyros.party/daily?showans=true&difficulty=easy"
echo ""

