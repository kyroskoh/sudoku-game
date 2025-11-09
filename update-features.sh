#!/bin/bash
# Quick update script for new features

echo "🚀 Updating Sudoku Mastery with new features..."
echo ""
echo "✨ New Features & Fixes:"
echo "  - 🏆 Global Leaderboard"
echo "  - 🎯 Fixed Difficulty Selection (Casual & Challenge)"
echo "  - 📊 Rankings by Mode & Difficulty"
echo "  - ⬅️ Change Difficulty Button During Gameplay"
echo "  - ✅ Better Loading States & Feedback"
echo ""

# Push to repository
echo "📤 Pushing to repository..."
git add .
git commit -m "Add leaderboard and fix difficulty selection in game modes" || echo "Nothing to commit"
git push origin main

echo ""
echo "✅ Done! Now deploy on your server:"
echo ""
echo "  ssh sudoku@breezehost-jp"
echo "  cd ~/sudoku-game"
echo "  git pull"
echo "  ./quick-deploy.sh"
echo ""
echo "🌐 Then visit:"
echo "  - https://sudoku.kyros.party/leaderboard"
echo "  - https://sudoku.kyros.party/casual (test difficulty selector)"
echo "  - https://sudoku.kyros.party/challenge (test difficulty selector)"

