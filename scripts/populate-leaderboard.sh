#!/bin/bash
# Populate leaderboard with sample data for testing
# 
# Usage:
#   ./scripts/populate-leaderboard.sh
#   API_URL=https://sudoku.kyros.party ./scripts/populate-leaderboard.sh

API_URL="${API_URL:-http://localhost:3011}"

echo "🏆 Populating Leaderboard with Test Data..."
echo "API: $API_URL"
echo ""

# Sample players and times
declare -a PLAYERS=(
  "Alice Johnson"
  "Bob Smith"
  "Charlie Brown"
  "Diana Prince"
  "Eve Anderson"
  "Frank Miller"
  "Grace Lee"
  "Henry Davis"
  "Ivy Chen"
  "Jack Wilson"
  "Karen White"
  "Leo Martinez"
)

# Casual Easy
echo "📊 Adding Casual Easy entries..."
./scripts/add-to-leaderboard.sh "${PLAYERS[0]}" 120 casual easy
./scripts/add-to-leaderboard.sh "${PLAYERS[1]}" 145 casual easy
./scripts/add-to-leaderboard.sh "${PLAYERS[2]}" 180 casual easy
./scripts/add-to-leaderboard.sh "${PLAYERS[3]}" 210 casual easy

# Casual Medium
echo "📊 Adding Casual Medium entries..."
./scripts/add-to-leaderboard.sh "${PLAYERS[4]}" 240 casual medium
./scripts/add-to-leaderboard.sh "${PLAYERS[5]}" 280 casual medium
./scripts/add-to-leaderboard.sh "${PLAYERS[6]}" 320 casual medium

# Daily Easy
echo "📊 Adding Daily Easy entries..."
./scripts/add-to-leaderboard.sh "${PLAYERS[7]}" 150 daily easy
./scripts/add-to-leaderboard.sh "${PLAYERS[8]}" 175 daily easy
./scripts/add-to-leaderboard.sh "${PLAYERS[9]}" 200 daily easy

# Challenge Hard
echo "📊 Adding Challenge Hard entries..."
./scripts/add-to-leaderboard.sh "${PLAYERS[10]}" 360 challenge hard
./scripts/add-to-leaderboard.sh "${PLAYERS[11]}" 420 challenge hard

echo ""
echo "✅ Leaderboard populated with sample data!"
echo "Visit: ${API_URL%:*}/leaderboard"
echo ""

