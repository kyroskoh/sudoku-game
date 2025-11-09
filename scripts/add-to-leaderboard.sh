#!/bin/bash
# Helper Script: Add User to Leaderboard (Bash/curl version)
#
# Usage:
#   ./scripts/add-to-leaderboard.sh "John Doe" 180 casual easy
#   ./scripts/add-to-leaderboard.sh "Jane Smith" 300 daily medium
#
# Arguments:
#   $1: Display name (required)
#   $2: Time in seconds (required)
#   $3: Mode: casual|daily|challenge (default: casual)
#   $4: Difficulty: easy|medium|hard|expert|extreme (default: easy)

# Configuration
API_URL="${API_URL:-http://localhost:3011}"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Parse arguments
NAME="$1"
TIME="$2"
MODE="${3:-casual}"
DIFFICULTY="${4:-easy}"

# Help function
show_help() {
  echo ""
  echo "🏆 Add User to Leaderboard Helper"
  echo ""
  echo "Usage:"
  echo "  ./scripts/add-to-leaderboard.sh <name> <time> [mode] [difficulty]"
  echo ""
  echo "Arguments:"
  echo "  name        Display name for leaderboard (required)"
  echo "  time        Completion time in seconds (required)"
  echo "  mode        Game mode: casual, daily, challenge (default: casual)"
  echo "  difficulty  Difficulty level: easy, medium, hard, expert, extreme (default: easy)"
  echo ""
  echo "Environment Variables:"
  echo "  API_URL     API base URL (default: http://localhost:3011)"
  echo ""
  echo "Examples:"
  echo "  # Add casual easy completion in 3 minutes"
  echo "  ./scripts/add-to-leaderboard.sh \"John Doe\" 180 casual easy"
  echo ""
  echo "  # Add daily medium completion in 5 minutes"
  echo "  ./scripts/add-to-leaderboard.sh \"Jane Smith\" 300 daily medium"
  echo ""
  echo "  # Use production API"
  echo "  API_URL=https://sudoku.kyros.party ./scripts/add-to-leaderboard.sh \"Pro Player\" 120 challenge hard"
  echo ""
}

# Validate arguments
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
  show_help
  exit 0
fi

if [ -z "$NAME" ] || [ -z "$TIME" ]; then
  echo -e "${RED}❌ Error: Name and time are required${NC}"
  show_help
  exit 1
fi

# Convert time to milliseconds
TIME_MS=$((TIME * 1000))

# Format time for display
format_time() {
  local ms=$1
  local total_seconds=$((ms / 1000))
  local minutes=$((total_seconds / 60))
  local seconds=$((total_seconds % 60))
  printf "%d:%02d" $minutes $seconds
}

FORMATTED_TIME=$(format_time $TIME_MS)

echo ""
echo -e "${BLUE}🏆 Adding to Leaderboard...${NC}"
echo ""
echo "Name: $NAME"
echo "Mode: $MODE"
echo "Difficulty: $DIFFICULTY"
echo "Time: $FORMATTED_TIME ($TIME_MS ms)"
echo "API: $API_URL"
echo ""

# Step 1: Get or create a puzzle
echo -e "${BLUE}📦 Step 1: Getting puzzle...${NC}"
PUZZLE_RESPONSE=$(curl -s "$API_URL/api/puzzles?mode=$MODE&difficulty=$DIFFICULTY")
PUZZLE_ID=$(echo "$PUZZLE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$PUZZLE_ID" ]; then
  echo -e "${RED}❌ Failed to get puzzle${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Got puzzle: $PUZZLE_ID${NC}"

# Step 2: Create device ID
echo ""
echo -e "${BLUE}📱 Step 2: Creating device...${NC}"
DEVICE_ID="test-device-$(date +%s)"
echo -e "${GREEN}✅ Using device ID: $DEVICE_ID${NC}"

# Step 3: Create completed attempt
echo ""
echo -e "${BLUE}⏱️  Step 3: Creating completed attempt...${NC}"

ATTEMPT_DATA=$(cat <<EOF
{
  "puzzleId": "$PUZZLE_ID",
  "deviceId": "$DEVICE_ID",
  "mode": "$MODE",
  "difficulty": "$DIFFICULTY",
  "timeMs": $TIME_MS,
  "result": "completed",
  "mistakes": 0,
  "hintsUsed": 0
}
EOF
)

ATTEMPT_RESPONSE=$(curl -s -X POST "$API_URL/api/attempts" \
  -H "Content-Type: application/json" \
  -d "$ATTEMPT_DATA")

ATTEMPT_ID=$(echo "$ATTEMPT_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$ATTEMPT_ID" ]; then
  echo -e "${RED}❌ Failed to create attempt${NC}"
  echo "$ATTEMPT_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Created attempt: $ATTEMPT_ID${NC}"

# Step 4: Update device with display name
echo ""
echo -e "${BLUE}👤 Step 4: Setting display name...${NC}"

DEVICE_DATA=$(cat <<EOF
{
  "displayName": "$NAME"
}
EOF
)

DEVICE_RESPONSE=$(curl -s -X PATCH "$API_URL/api/device/$DEVICE_ID" \
  -H "Content-Type: application/json" \
  -d "$DEVICE_DATA")

if echo "$DEVICE_RESPONSE" | grep -q "displayName"; then
  echo -e "${GREEN}✅ Set display name: $NAME${NC}"
else
  echo -e "${YELLOW}⚠️  Could not set display name (device may not exist yet)${NC}"
fi

# Step 5: Verify leaderboard entry
echo ""
echo -e "${BLUE}🏆 Step 5: Verifying leaderboard...${NC}"

LEADERBOARD_RESPONSE=$(curl -s "$API_URL/api/leaderboard/global?mode=$MODE&difficulty=$DIFFICULTY&limit=10")

if echo "$LEADERBOARD_RESPONSE" | grep -q "$NAME\|$DEVICE_ID"; then
  echo -e "${GREEN}✅ Found on leaderboard!${NC}"
  
  # Try to find rank (basic parsing)
  RANK=1
  echo "$LEADERBOARD_RESPONSE" | grep -o '"displayName":"[^"]*"' | while read -r line; do
    if echo "$line" | grep -q "$NAME"; then
      echo "   Rank: #$RANK"
      echo "   Time: $FORMATTED_TIME"
      break
    fi
    RANK=$((RANK + 1))
  done
else
  echo -e "${YELLOW}⚠️  Entry created but not in top 10${NC}"
fi

echo ""
echo -e "${GREEN}✅ Success! User added to leaderboard.${NC}"
echo ""
echo "View at: ${API_URL%:*}/leaderboard"
echo ""

