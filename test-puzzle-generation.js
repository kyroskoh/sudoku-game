/**
 * Test Puzzle Generation
 * Verifies that puzzles are valid and solvable
 */

const difficulties = ['easy', 'medium', 'hard', 'expert', 'extreme'];
const baseUrl = process.env.API_URL || 'http://localhost:3011';
const testDeviceId = 'test-device-' + Date.now();

async function testPuzzle(mode, difficulty) {
  console.log(`\n🧪 Testing ${mode} (${difficulty})...`);
  
  try {
    let url;
    if (mode === 'daily') {
      url = `${baseUrl}/api/daily?difficulty=${difficulty}&deviceId=${testDeviceId}`;
    } else {
      url = `${baseUrl}/api/puzzles?mode=${mode}&difficulty=${difficulty}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error(`   ❌ Error: ${data.error}`);
      return false;
    }

    const puzzle = data.puzzle || data;
    
    // Check puzzle structure
    if (!puzzle.givens || !puzzle.solution) {
      console.error(`   ❌ Missing givens or solution`);
      return false;
    }

    const givens = JSON.parse(puzzle.givens);
    const solution = JSON.parse(puzzle.solution);

    // Validate solution
    if (!validateSolution(solution)) {
      console.error(`   ❌ Invalid solution`);
      console.error(`   Solution:`, solution);
      return false;
    }

    // Check that givens are subset of solution
    let givenCount = 0;
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (givens[row][col] !== 0) {
          givenCount++;
          if (givens[row][col] !== solution[row][col]) {
            console.error(`   ❌ Given at [${row}][${col}] doesn't match solution`);
            console.error(`   Given: ${givens[row][col]}, Solution: ${solution[row][col]}`);
            return false;
          }
        }
      }
    }

    console.log(`   ✅ Valid puzzle with ${givenCount} givens`);
    console.log(`   📝 Puzzle ID: ${puzzle.id}`);
    if (puzzle.seed) {
      console.log(`   🌱 Seed: ${puzzle.seed}`);
    }
    return true;
  } catch (error) {
    console.error(`   ❌ Exception: ${error.message}`);
    return false;
  }
}

function validateSolution(board) {
  // Check rows
  for (let row = 0; row < 9; row++) {
    const seen = new Set();
    for (let col = 0; col < 9; col++) {
      const num = board[row][col];
      if (num < 1 || num > 9 || seen.has(num)) {
        console.error(`   ❌ Invalid row ${row}: duplicate or invalid number ${num}`);
        return false;
      }
      seen.add(num);
    }
  }

  // Check columns
  for (let col = 0; col < 9; col++) {
    const seen = new Set();
    for (let row = 0; row < 9; row++) {
      const num = board[row][col];
      if (seen.has(num)) {
        console.error(`   ❌ Invalid column ${col}: duplicate number ${num}`);
        return false;
      }
      seen.add(num);
    }
  }

  // Check 3x3 boxes
  for (let boxRow = 0; boxRow < 9; boxRow += 3) {
    for (let boxCol = 0; boxCol < 9; boxCol += 3) {
      const seen = new Set();
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const num = board[boxRow + i][boxCol + j];
          if (seen.has(num)) {
            console.error(`   ❌ Invalid box at [${boxRow}][${boxCol}]: duplicate number ${num}`);
            return false;
          }
          seen.add(num);
        }
      }
    }
  }

  return true;
}

async function runTests() {
  console.log('🧪 Puzzle Generation Test Suite');
  console.log('================================\n');
  console.log(`API URL: ${baseUrl}`);
  console.log(`Test Device ID: ${testDeviceId}`);

  let passed = 0;
  let failed = 0;

  // Test casual mode
  console.log('\n📦 Testing Casual Mode');
  console.log('----------------------');
  for (const difficulty of difficulties) {
    const result = await testPuzzle('casual', difficulty);
    if (result) passed++;
    else failed++;
  }

  // Test challenge mode
  console.log('\n📦 Testing Challenge Mode');
  console.log('-------------------------');
  for (const difficulty of difficulties) {
    const result = await testPuzzle('challenge', difficulty);
    if (result) passed++;
    else failed++;
  }

  // Test daily mode (most important - uses seeds!)
  console.log('\n📅 Testing Daily Mode (SEEDED - Critical!)');
  console.log('------------------------------------------');
  for (const difficulty of difficulties) {
    const result = await testPuzzle('daily', difficulty);
    if (result) passed++;
    else failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total:  ${passed + failed}`);
  console.log('='.repeat(50));

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Puzzle generation is working correctly!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

