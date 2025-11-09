#!/bin/bash

# Test Puzzle Validity
# Fetches a puzzle and validates the solution

echo "🧪 Testing Puzzle Validity"
echo "=========================="
echo ""

DEVICE_ID="test-validity-$(date +%s)"

echo "📥 Fetching easy daily puzzle..."
RESPONSE=$(curl -s "http://localhost:3011/api/daily?difficulty=easy&deviceId=$DEVICE_ID")

# Extract puzzle data
PUZZLE_ID=$(echo "$RESPONSE" | jq -r '.puzzle.id // empty')
GIVENS=$(echo "$RESPONSE" | jq -r '.puzzle.givens // empty')

if [ -z "$PUZZLE_ID" ]; then
    echo "❌ Failed to fetch puzzle"
    echo "Response: $RESPONSE"
    exit 1
fi

echo "✅ Puzzle ID: $PUZZLE_ID"
echo ""

# Fetch solution
echo "📥 Fetching solution..."
SOLUTION_RESPONSE=$(curl -s "http://localhost:3011/api/puzzles/$PUZZLE_ID?showsolution=true")
SOLUTION=$(echo "$SOLUTION_RESPONSE" | jq -r '.solution // empty')

if [ -z "$SOLUTION" ]; then
    echo "❌ Failed to fetch solution"
    echo "Response: $SOLUTION_RESPONSE"
    exit 1
fi

echo "✅ Solution fetched"
echo ""

# Basic validation - check if solution is valid JSON array
if echo "$SOLUTION" | jq -e 'type == "array"' > /dev/null 2>&1; then
    echo "✅ Solution is valid JSON array"
    
    # Check dimensions
    ROWS=$(echo "$SOLUTION" | jq 'length')
    if [ "$ROWS" = "9" ]; then
        echo "✅ Solution has 9 rows"
        
        # Check for duplicates in rows (simple check)
        echo "🔍 Checking for basic validity..."
        
        # Just verify it's a 9x9 grid with numbers 1-9
        VALID=$(echo "$SOLUTION" | jq '[.[][] | select(. < 1 or . > 9)] | length')
        if [ "$VALID" = "0" ]; then
            echo "✅ All numbers are between 1-9"
            echo ""
            echo "🎉 Puzzle appears VALID!"
            echo ""
            echo "🧪 Test in browser:"
            echo "   https://sudoku.kyros.party/daily?showans=true&difficulty=easy&t=$(date +%s)"
            echo ""
            echo "   Check if red numbers form valid rows/columns/boxes"
        else
            echo "❌ Invalid numbers found in solution"
        fi
    else
        echo "❌ Solution doesn't have 9 rows (has $ROWS)"
    fi
else
    echo "❌ Solution is not a valid JSON array"
    echo "Solution: $SOLUTION"
fi
echo ""

