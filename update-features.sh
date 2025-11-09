#!/bin/bash
# Quick update script for new features

echo "🚀 Updating Sudoku Mastery with new features..."
echo ""
echo "✨ New Features:"
echo "  - 🏆 Global Leaderboard"
echo "  - 🎯 Enhanced Difficulty Selection"
echo "  - 📊 Rankings by Mode & Difficulty"
echo ""

# Push to repository
echo "📤 Pushing to repository..."
git add .
git commit -m "Add leaderboard system and enhance game modes" || echo "Nothing to commit"
git push origin main

echo ""
echo "✅ Done! Now deploy on your server:"
echo ""
echo "  ssh sudoku@breezehost-jp"
echo "  cd ~/sudoku-game"
echo "  git pull"
echo "  ./quick-deploy.sh"
echo ""
echo "🌐 Then visit: https://sudoku.kyros.party/leaderboard"

