#!/bin/bash

# Check Leaderboard Entries
# Debug script to see what's in the leaderboard

echo "🔍 Checking Leaderboard Entries"
echo "================================"
echo ""

# Check all leaderboard entries
echo "📊 All Leaderboard Entries:"
echo "----------------------------"
docker exec sudoku-backend node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const entries = await prisma.leaderboard.findMany({
    include: {
      puzzle: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 20
  });
  
  if (entries.length === 0) {
    console.log('   ❌ No leaderboard entries found!');
    return;
  }
  
  console.log(\`   Found \${entries.length} entries:\`);
  console.log('');
  
  entries.forEach((entry, i) => {
    const time = (entry.timeMs / 1000).toFixed(1);
    const name = entry.displayName || 'Anonymous';
    console.log(\`   \${i+1}. \${entry.puzzle.mode} - \${entry.puzzle.difficulty}: \${time}s by \${name}\`);
  });
  
  await prisma.\$disconnect();
}

check();
"

echo ""
echo "🎮 Challenge Mode Entries:"
echo "----------------------------"
docker exec sudoku-backend node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const entries = await prisma.leaderboard.findMany({
    include: {
      puzzle: true
    },
    where: {
      puzzle: {
        mode: 'challenge'
      }
    },
    orderBy: {
      timeMs: 'asc'
    }
  });
  
  if (entries.length === 0) {
    console.log('   ❌ No challenge mode entries found!');
    return;
  }
  
  console.log(\`   Found \${entries.length} challenge entries:\`);
  console.log('');
  
  const byDifficulty = {};
  entries.forEach(entry => {
    if (!byDifficulty[entry.puzzle.difficulty]) {
      byDifficulty[entry.puzzle.difficulty] = [];
    }
    byDifficulty[entry.puzzle.difficulty].push(entry);
  });
  
  for (const [diff, list] of Object.entries(byDifficulty)) {
    console.log(\`   \${diff.toUpperCase()}:\`);
    list.forEach((entry, i) => {
      const time = (entry.timeMs / 1000).toFixed(1);
      const name = entry.displayName || 'Anonymous';
      console.log(\`     \${i+1}. \${time}s by \${name}\`);
    });
  }
  
  await prisma.\$disconnect();
}

check();
"

echo ""
echo "🗄️  Recent Completed Attempts:"
echo "----------------------------"
docker exec sudoku-backend node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const attempts = await prisma.attempt.findMany({
    where: {
      result: 'completed',
      finishedAt: {
        not: null
      }
    },
    include: {
      puzzle: true
    },
    orderBy: {
      finishedAt: 'desc'
    },
    take: 10
  });
  
  if (attempts.length === 0) {
    console.log('   ❌ No completed attempts found!');
    return;
  }
  
  console.log(\`   Found \${attempts.length} completed attempts:\`);
  console.log('');
  
  attempts.forEach((att, i) => {
    const time = att.timeMs ? (att.timeMs / 1000).toFixed(1) : 'N/A';
    console.log(\`   \${i+1}. \${att.puzzle.mode} - \${att.puzzle.difficulty}: \${time}s\`);
    console.log(\`      Result: \${att.result}, Time: \${att.timeMs || 'none'}\`);
  });
  
  await prisma.\$disconnect();
}

check();
"

echo ""
echo "💡 Tips:"
echo "   - On leaderboard page, change Mode dropdown to 'Challenge'"
echo "   - Make sure you entered your name after completing the puzzle"
echo "   - Leaderboard only shows top 10 times"
echo ""

