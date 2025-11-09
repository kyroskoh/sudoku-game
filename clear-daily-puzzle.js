/**
 * Clear Today's Daily Puzzle
 * Run this to regenerate today's daily puzzle after fixing the bug
 * 
 * Usage:
 *   Local: node clear-daily-puzzle.js
 *   Docker: docker compose exec -T sudoku-backend node clear-daily-puzzle.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearTodaysPuzzle() {
  console.log('🗑️  Clearing today\'s daily puzzles...\n');

  try {
    // Get today's date in Singapore Time
    const now = new Date();
    const sgtOffset = 8 * 60; // SGT is UTC+8
    const sgtTime = new Date(now.getTime() + (sgtOffset + now.getTimezoneOffset()) * 60000);
    
    const year = sgtTime.getFullYear();
    const month = String(sgtTime.getMonth() + 1).padStart(2, '0');
    const day = String(sgtTime.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    
    console.log(`📅 Today's date (SGT): ${dateKey}`);
    console.log(`📅 Looking for puzzles with seed starting with: daily-${dateKey}`);
    console.log('');

    // Find all daily puzzles for today
    const puzzles = await prisma.puzzle.findMany({
      where: {
        mode: 'daily',
        seed: {
          startsWith: `daily-${dateKey}`
        }
      }
    });

    if (puzzles.length === 0) {
      console.log('✅ No daily puzzles found for today. Database is clean!');
      return;
    }

    console.log(`Found ${puzzles.length} daily puzzle(s) for today:`);
    puzzles.forEach(p => {
      console.log(`   - ${p.seed} (${p.difficulty})`);
    });
    console.log('');

    // Delete them
    const result = await prisma.puzzle.deleteMany({
      where: {
        mode: 'daily',
        seed: {
          startsWith: `daily-${dateKey}`
        }
      }
    });

    console.log(`✅ Deleted ${result.count} puzzle(s)`);
    console.log('');
    console.log('🎉 Daily puzzles cleared! New puzzles will be generated on next request.');
    console.log('');
    console.log('Test with:');
    console.log(`   http://localhost:3010/daily?difficulty=easy`);
    console.log(`   http://localhost:3010/daily?showans=true&difficulty=easy`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearTodaysPuzzle();

