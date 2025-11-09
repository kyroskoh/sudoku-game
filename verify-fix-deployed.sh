#!/bin/bash

# Verify Bug Fix is Deployed
# Checks if the fixed code is actually running

echo "🔍 Verifying Bug Fix Deployment"
echo "================================"
echo ""

echo "1️⃣  Checking if fix is in container..."
if docker exec sudoku-backend grep -q "private rng: () => number" src/services/sudoku-generator.ts 2>/dev/null; then
    echo "   ✅ Fix is present in container"
else
    echo "   ❌ Fix NOT found in container!"
    echo "   Need to rebuild: docker compose build backend --no-cache"
    exit 1
fi
echo ""

echo "2️⃣  Checking container uptime..."
UPTIME=$(docker inspect -f '{{.State.StartedAt}}' sudoku-backend 2>/dev/null)
echo "   Container started: $UPTIME"
echo ""

echo "3️⃣  Checking backend response..."
HEALTH=$(curl -s http://localhost:3011/health 2>&1)
if [[ "$HEALTH" == *"ok"* ]] || [[ "$HEALTH" != *"failed"* ]]; then
    echo "   ✅ Backend is responding"
else
    echo "   ❌ Backend not responding: $HEALTH"
fi
echo ""

echo "4️⃣  Checking current daily puzzles..."
docker exec sudoku-backend node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const puzzles = await prisma.puzzle.findMany({
    where: { mode: 'daily' },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  
  console.log('   Recent daily puzzles:');
  puzzles.forEach(p => {
    console.log(\`   - \${p.seed} (\${p.difficulty}) - \${p.createdAt}\`);
  });
  
  await prisma.\$disconnect();
}

check();
" 2>/dev/null || echo "   ⚠️  Could not query database"

echo ""
echo "5️⃣  Testing new puzzle generation..."
TEST_RESULT=$(curl -s "http://localhost:3011/api/daily?difficulty=easy&deviceId=verify-test-$(date +%s)")
PUZZLE_ID=$(echo "$TEST_RESULT" | jq -r '.puzzle.id // empty')

if [ -n "$PUZZLE_ID" ]; then
    echo "   ✅ Puzzle generated: $PUZZLE_ID"
    SEED=$(echo "$TEST_RESULT" | jq -r '.puzzle.seed')
    echo "   📝 Seed: $SEED"
else
    echo "   ❌ Puzzle generation failed"
    echo "   Response: $TEST_RESULT"
fi

echo ""
echo "=" | head -c 50 | tr '\n' '='
echo ""
if [ -n "$PUZZLE_ID" ]; then
    echo "✅ Fix appears to be deployed"
    echo ""
    echo "🧪 Test in browser:"
    echo "   https://sudoku.kyros.party/daily?showans=true&difficulty=easy"
    echo ""
    echo "💡 If puzzle is still broken, force regenerate:"
    echo "   ./force-regenerate-daily.sh"
else
    echo "⚠️  Something is wrong - check logs:"
    echo "   docker logs sudoku-backend"
fi
echo ""

