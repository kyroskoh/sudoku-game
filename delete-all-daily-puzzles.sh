#!/bin/bash

# Delete ALL Daily Puzzles from Database
# This forces complete regeneration with the fixed code

echo "🗑️  DELETING ALL DAILY PUZZLES"
echo "================================"
echo ""

echo "⚠️  This will delete ALL daily puzzles from the database"
echo "   They will regenerate with the fixed code"
echo ""

# Delete all daily puzzles
docker exec sudoku-backend node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteAll() {
  try {
    console.log('📊 Checking current daily puzzles...');
    const before = await prisma.puzzle.count({
      where: { mode: 'daily' }
    });
    console.log(\`   Found \${before} daily puzzles\`);
    console.log('');
    
    if (before > 0) {
      console.log('🗑️  Deleting all daily puzzles...');
      const result = await prisma.puzzle.deleteMany({
        where: { mode: 'daily' }
      });
      console.log(\`   ✅ Deleted \${result.count} daily puzzles\`);
    } else {
      console.log('   ✅ No daily puzzles to delete');
    }
    
    console.log('');
    console.log('🎉 Database cleared! New puzzles will regenerate on next request.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.\$disconnect();
  }
}

deleteAll();
"

echo ""
echo "🔄 Restarting backend to clear memory cache..."
docker restart sudoku-backend

echo ""
echo "⏳ Waiting for backend to restart..."
sleep 8

echo ""
echo "✅ Done! Now test with a fresh puzzle:"
echo ""
echo "🧪 Test URLs (will generate NEW puzzles):"
echo "   https://sudoku.kyros.party/daily?difficulty=easy&t=$(date +%s)"
echo "   https://sudoku.kyros.party/daily?showans=true&difficulty=easy&t=$(date +%s)"
echo ""
echo "   The &t=$(date +%s) prevents browser cache"
echo ""

