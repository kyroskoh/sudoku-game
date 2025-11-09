#!/usr/bin/env node
/**
 * Helper Script: Add User to Leaderboard
 * 
 * Usage:
 *   node scripts/add-to-leaderboard.js --name "John Doe" --time 180 --mode casual --difficulty easy
 *   node scripts/add-to-leaderboard.js --name "Jane Smith" --time 240000 --mode daily --difficulty medium
 * 
 * Options:
 *   --name <string>       Display name for leaderboard (required)
 *   --time <number>       Completion time in seconds or milliseconds (required)
 *   --mode <string>       Game mode: casual, daily, challenge (default: casual)
 *   --difficulty <string> Difficulty: easy, medium, hard, expert, extreme (default: easy)
 *   --date <YYYY-MM-DD>   For daily mode, specific date (default: today)
 *   --api <url>           API base URL (default: http://localhost:3011)
 */

const https = require('https');
const http = require('http');

// Parse command line arguments
function parseArgs() {
  const args = {
    name: null,
    time: null,
    mode: 'casual',
    difficulty: 'easy',
    date: null,
    api: process.env.API_URL || 'http://localhost:3011'
  };

  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    const nextArg = process.argv[i + 1];

    switch (arg) {
      case '--name':
        args.name = nextArg;
        i++;
        break;
      case '--time':
        args.time = parseFloat(nextArg);
        i++;
        break;
      case '--mode':
        args.mode = nextArg;
        i++;
        break;
      case '--difficulty':
        args.difficulty = nextArg;
        i++;
        break;
      case '--date':
        args.date = nextArg;
        i++;
        break;
      case '--api':
        args.api = nextArg;
        i++;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
    }
  }

  return args;
}

function printHelp() {
  console.log(`
🏆 Add User to Leaderboard Helper

Usage:
  node scripts/add-to-leaderboard.js [options]

Options:
  --name <string>       Display name for leaderboard (required)
  --time <number>       Completion time in seconds or milliseconds (required)
  --mode <string>       Game mode: casual, daily, challenge (default: casual)
  --difficulty <string> Difficulty: easy, medium, hard, expert, extreme (default: easy)
  --date <YYYY-MM-DD>   For daily mode, specific date (default: today)
  --api <url>           API base URL (default: http://localhost:3011)

Examples:
  # Add casual easy completion in 3 minutes (180 seconds)
  node scripts/add-to-leaderboard.js --name "John Doe" --time 180 --mode casual --difficulty easy

  # Add daily medium completion in 5 minutes (300000 ms)
  node scripts/add-to-leaderboard.js --name "Jane Smith" --time 300000 --mode daily --difficulty medium

  # Add challenge hard with specific date
  node scripts/add-to-leaderboard.js --name "Pro Player" --time 120 --mode challenge --difficulty hard

  # Use production API
  node scripts/add-to-leaderboard.js --name "Test User" --time 200 --api https://sudoku.kyros.party

Time Format:
  - If < 10000: Treated as seconds (e.g., 180 = 3 minutes)
  - If >= 10000: Treated as milliseconds (e.g., 180000 = 3 minutes)
`);
}

function validateArgs(args) {
  const errors = [];

  if (!args.name) {
    errors.push('❌ --name is required');
  }

  if (args.time === null) {
    errors.push('❌ --time is required');
  }

  const validModes = ['casual', 'daily', 'challenge'];
  if (!validModes.includes(args.mode)) {
    errors.push(`❌ --mode must be one of: ${validModes.join(', ')}`);
  }

  const validDifficulties = ['easy', 'medium', 'hard', 'expert', 'extreme'];
  if (!validDifficulties.includes(args.difficulty)) {
    errors.push(`❌ --difficulty must be one of: ${validDifficulties.join(', ')}`);
  }

  if (errors.length > 0) {
    console.error('\n' + errors.join('\n'));
    console.log('\nRun with --help for usage information\n');
    process.exit(1);
  }
}

function convertTime(time) {
  // If time is less than 10000, treat as seconds, otherwise milliseconds
  if (time < 10000) {
    return time * 1000; // Convert to ms
  }
  return time;
}

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

async function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function main() {
  const args = parseArgs();
  validateArgs(args);

  const timeMs = convertTime(args.time);
  const formattedTime = formatTime(timeMs);

  console.log('\n🏆 Adding to Leaderboard...\n');
  console.log(`Name: ${args.name}`);
  console.log(`Mode: ${args.mode}`);
  console.log(`Difficulty: ${args.difficulty}`);
  console.log(`Time: ${formattedTime} (${timeMs}ms)`);
  if (args.date) console.log(`Date: ${args.date}`);
  console.log(`API: ${args.api}\n`);

  try {
    // Step 1: Get or create a puzzle
    console.log('📦 Step 1: Getting puzzle...');
    const puzzleUrl = `${args.api}/api/puzzles?mode=${args.mode}&difficulty=${args.difficulty}`;
    const puzzleResponse = await httpRequest(puzzleUrl);
    
    if (puzzleResponse.status !== 200) {
      throw new Error(`Failed to get puzzle: ${JSON.stringify(puzzleResponse.data)}`);
    }

    const puzzle = puzzleResponse.data;
    console.log(`✅ Got puzzle: ${puzzle.id}`);

    // Step 2: Create a device (for the user)
    console.log('\n📱 Step 2: Creating device...');
    const deviceId = 'test-device-' + Date.now();
    // We'll use the deviceId directly without creating it in the DB for simplicity
    console.log(`✅ Using device ID: ${deviceId}`);

    // Step 3: Create an attempt (completed)
    console.log('\n⏱️  Step 3: Creating completed attempt...');
    const attemptData = {
      puzzleId: puzzle.id,
      deviceId: deviceId,
      mode: args.mode,
      difficulty: args.difficulty,
      timeMs: timeMs,
      result: 'completed',
      mistakes: 0,
      hintsUsed: 0
    };

    const attemptUrl = `${args.api}/api/attempts`;
    const attemptResponse = await httpRequest(attemptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: attemptData
    });

    if (attemptResponse.status !== 200 && attemptResponse.status !== 201) {
      throw new Error(`Failed to create attempt: ${JSON.stringify(attemptResponse.data)}`);
    }

    const attempt = attemptResponse.data;
    console.log(`✅ Created attempt: ${attempt.id}`);

    // Step 4: Update device with display name
    console.log('\n👤 Step 4: Setting display name...');
    const deviceUrl = `${args.api}/api/device/${deviceId}`;
    const deviceResponse = await httpRequest(deviceUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: { displayName: args.name }
    });

    if (deviceResponse.status === 200) {
      console.log(`✅ Set display name: ${args.name}`);
    } else {
      console.log(`⚠️  Could not set display name (device may not exist yet)`);
    }

    // Step 5: Verify leaderboard entry
    console.log('\n🏆 Step 5: Verifying leaderboard...');
    const leaderboardUrl = `${args.api}/api/leaderboard/global?mode=${args.mode}&difficulty=${args.difficulty}&limit=10`;
    const leaderboardResponse = await httpRequest(leaderboardUrl);

    if (leaderboardResponse.status === 200) {
      const entries = leaderboardResponse.data;
      const userEntry = entries.find(e => e.displayName === args.name || e.deviceId === deviceId);
      
      if (userEntry) {
        const rank = entries.indexOf(userEntry) + 1;
        console.log(`✅ Found on leaderboard!`);
        console.log(`   Rank: #${rank}`);
        console.log(`   Time: ${formatTime(userEntry.timeMs)}`);
      } else {
        console.log(`⚠️  Entry created but not in top 10`);
      }
    }

    console.log('\n✅ Success! User added to leaderboard.\n');
    console.log(`View at: ${args.api.replace(/:\d+/, '')}/leaderboard\n`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();

