# 🏆 Leaderboard Helper Scripts

## Overview

Three helper scripts to add users to the leaderboard for testing and development.

## Scripts

### 1. `add-to-leaderboard.js` (Node.js)
Full-featured JavaScript implementation with better error handling.

### 2. `add-to-leaderboard.sh` (Bash)
Simple shell script using curl (Linux/Mac).

### 3. `add-to-leaderboard.ps1` (PowerShell)
Windows PowerShell version (Windows).

### 4. `populate-leaderboard.sh` (Bash)
Quickly populate with sample data.

## Installation

```bash
# Make scripts executable (Unix/Mac/Linux)
chmod +x scripts/*.sh
chmod +x scripts/*.js
```

## Usage

### Node.js Version (Recommended)

#### Basic Usage
```bash
# Add a user to casual easy
node scripts/add-to-leaderboard.js --name "John Doe" --time 180 --mode casual --difficulty easy

# Add to daily medium (time in milliseconds)
node scripts/add-to-leaderboard.js --name "Jane Smith" --time 300000 --mode daily --difficulty medium

# Add to challenge hard
node scripts/add-to-leaderboard.js --name "Pro Player" --time 120 --mode challenge --difficulty hard
```

#### With Production API
```bash
node scripts/add-to-leaderboard.js \
  --name "Test User" \
  --time 200 \
  --mode casual \
  --difficulty easy \
  --api https://sudoku.kyros.party
```

#### All Options
```bash
node scripts/add-to-leaderboard.js \
  --name "Display Name"       # Required: Name to show on leaderboard
  --time 180                  # Required: Time in seconds (or milliseconds if > 10000)
  --mode casual               # Optional: casual|daily|challenge (default: casual)
  --difficulty easy           # Optional: easy|medium|hard|expert|extreme (default: easy)
  --date 2025-11-10          # Optional: For daily mode
  --api http://localhost:3011 # Optional: API URL
```

#### Help
```bash
node scripts/add-to-leaderboard.js --help
```

### Bash Version (Linux/Mac)

#### Basic Usage
```bash
# Syntax: ./scripts/add-to-leaderboard.sh <name> <time_seconds> [mode] [difficulty]

# Add to casual easy (3 minutes)
./scripts/add-to-leaderboard.sh "John Doe" 180 casual easy

# Add to daily medium (5 minutes)
./scripts/add-to-leaderboard.sh "Jane Smith" 300 daily medium

# Add to challenge hard (2 minutes)
./scripts/add-to-leaderboard.sh "Pro Player" 120 challenge hard
```

#### With Custom API
```bash
API_URL=https://sudoku.kyros.party ./scripts/add-to-leaderboard.sh "Test User" 200 casual easy
```

### PowerShell Version (Windows)

#### Basic Usage
```powershell
# Add to casual easy (3 minutes)
.\scripts\add-to-leaderboard.ps1 -Name "John Doe" -Time 180 -Mode casual -Difficulty easy

# Add to daily medium (5 minutes)
.\scripts\add-to-leaderboard.ps1 -Name "Jane Smith" -Time 300 -Mode daily -Difficulty medium

# Add to challenge hard (2 minutes)
.\scripts\add-to-leaderboard.ps1 -Name "Pro Player" -Time 120 -Mode challenge -Difficulty hard
```

#### With Custom API
```powershell
.\scripts\add-to-leaderboard.ps1 -Name "Test User" -Time 200 -Mode casual -Difficulty easy -ApiUrl https://sudoku.kyros.party
```

#### Help
```powershell
Get-Help .\scripts\add-to-leaderboard.ps1 -Detailed
```

### Populate Script

Quickly add multiple test entries:

```bash
# Local development
./scripts/populate-leaderboard.sh

# Production
API_URL=https://sudoku.kyros.party ./scripts/populate-leaderboard.sh
```

This adds:
- 4 entries to Casual Easy
- 3 entries to Casual Medium
- 3 entries to Daily Easy
- 2 entries to Challenge Hard

## Time Format

### Node.js Script
- **< 10000**: Treated as seconds
  - `180` = 3 minutes
  - `300` = 5 minutes
  
- **>= 10000**: Treated as milliseconds
  - `180000` = 3 minutes
  - `300000` = 5 minutes

### Bash Script
- Always in **seconds**
  - `180` = 3 minutes
  - `300` = 5 minutes
  - Automatically converted to milliseconds

## How It Works

### Step-by-Step Process

```
1. Get/Create Puzzle
   ↓
   GET /api/puzzles?mode=casual&difficulty=easy
   Returns: { id: "puzzle-123", ... }

2. Generate Device ID
   ↓
   Create unique ID: "test-device-1699632000"

3. Create Completed Attempt
   ↓
   POST /api/attempts
   Body: {
     puzzleId: "puzzle-123",
     deviceId: "test-device-1699632000",
     timeMs: 180000,
     result: "completed",
     ...
   }
   → This automatically creates leaderboard entry!

4. Set Display Name
   ↓
   PATCH /api/device/test-device-1699632000
   Body: { displayName: "John Doe" }
   → Updates device record with name

5. Verify
   ↓
   GET /api/leaderboard/global?mode=casual&difficulty=easy
   → Check if entry appears in top 10
```

## Parameters

### Required
- **name**: Display name for leaderboard
- **time**: Completion time (seconds or milliseconds)

### Optional
- **mode**: `casual`, `daily`, `challenge` (default: `casual`)
- **difficulty**: `easy`, `medium`, `hard`, `expert`, `extreme` (default: `easy`)
- **date**: For daily mode, specific date (default: today)
- **api**: API base URL (default: `http://localhost:3011`)

## Examples

### Fast Times (Top Leaderboard)
```bash
# 2 minute completion (120 seconds)
node scripts/add-to-leaderboard.js --name "Speed Runner" --time 120 --difficulty easy

# 1.5 minute completion (90 seconds)
node scripts/add-to-leaderboard.js --name "Pro Solver" --time 90 --difficulty medium
```

### Slow Times (Lower Leaderboard)
```bash
# 10 minute completion (600 seconds)
node scripts/add-to-leaderboard.js --name "Beginner" --time 600 --difficulty easy

# 30 minute completion (1800 seconds)
node scripts/add-to-leaderboard.js --name "Learning" --time 1800 --difficulty hard
```

### Different Modes
```bash
# Casual mode
node scripts/add-to-leaderboard.js --name "Casual Player" --time 240 --mode casual --difficulty medium

# Daily mode
node scripts/add-to-leaderboard.js --name "Daily Solver" --time 180 --mode daily --difficulty easy

# Challenge mode
node scripts/add-to-leaderboard.js --name "Challenger" --time 150 --mode challenge --difficulty hard
```

### All Difficulties
```bash
# Easy
node scripts/add-to-leaderboard.js --name "Player A" --time 120 --difficulty easy

# Medium
node scripts/add-to-leaderboard.js --name "Player B" --time 180 --difficulty medium

# Hard
node scripts/add-to-leaderboard.js --name "Player C" --time 300 --difficulty hard

# Expert
node scripts/add-to-leaderboard.js --name "Player D" --time 420 --difficulty expert

# Extreme
node scripts/add-to-leaderboard.js --name "Player E" --time 600 --difficulty extreme
```

## Output Example

```
🏆 Adding to Leaderboard...

Name: John Doe
Mode: casual
Difficulty: easy
Time: 3:00 (180000ms)
API: http://localhost:3011

📦 Step 1: Getting puzzle...
✅ Got puzzle: abc-123-def-456

📱 Step 2: Creating device...
✅ Using device ID: test-device-1699632000

⏱️  Step 3: Creating completed attempt...
✅ Created attempt: xyz-789-ghi-012

👤 Step 4: Setting display name...
✅ Set display name: John Doe

🏆 Step 5: Verifying leaderboard...
✅ Found on leaderboard!
   Rank: #3
   Time: 3:00

✅ Success! User added to leaderboard.

View at: http://localhost:3010/leaderboard
```

## Troubleshooting

### Issue: "Failed to get puzzle"
**Solution**: Make sure backend is running
```bash
cd backend
npm run dev
```

### Issue: "Failed to create attempt"
**Solution**: Check backend logs for errors
```bash
# Backend should be running and accessible
curl http://localhost:3011/api/health
```

### Issue: "Not in top 10"
**Solution**: Entry was created but time is too slow for top 10
- Use faster time: `--time 60` (1 minute)
- Or check full leaderboard in database

### Issue: "Device may not exist yet"
**Solution**: This is just a warning, entry was still created
- The name will appear on leaderboard
- Device is created on first attempt

## API Endpoints Used

```
GET  /api/puzzles?mode=<mode>&difficulty=<difficulty>
POST /api/attempts
PATCH /api/device/:id
GET  /api/leaderboard/global?mode=<mode>&difficulty=<difficulty>
```

## Database Impact

### Creates Records In:

**1. Device Table**
```sql
INSERT INTO Device (id, displayName)
VALUES ('test-device-1699632000', 'John Doe');
```

**2. Attempt Table**
```sql
INSERT INTO Attempt (puzzleId, deviceId, timeMs, result, ...)
VALUES ('puzzle-123', 'test-device-1699632000', 180000, 'completed', ...);
```

**3. Leaderboard Table** (automatic)
```sql
-- Created automatically by attempt-service when result = 'completed'
INSERT INTO Leaderboard (puzzleId, deviceId, displayName, timeMs)
VALUES ('puzzle-123', 'test-device-1699632000', 'John Doe', 180000);
```

## Testing Scenarios

### Scenario 1: Populate Empty Leaderboard
```bash
# Run populate script
./scripts/populate-leaderboard.sh

# Result: 12 entries across different modes/difficulties
```

### Scenario 2: Test Top 10 Ranking
```bash
# Add 15 entries with different times
for i in {1..15}; do
  TIME=$((100 + i * 10))
  node scripts/add-to-leaderboard.js --name "Player $i" --time $TIME --difficulty easy
done

# Result: Leaderboard with top 10 fastest times
```

### Scenario 3: Test All Modes
```bash
# Casual
node scripts/add-to-leaderboard.js --name "Test 1" --time 180 --mode casual --difficulty easy

# Daily
node scripts/add-to-leaderboard.js --name "Test 2" --time 200 --mode daily --difficulty easy

# Challenge
node scripts/add-to-leaderboard.js --name "Test 3" --time 150 --mode challenge --difficulty easy

# Result: Entries in all 3 mode leaderboards
```

### Scenario 4: Test Name Display
```bash
# Without name entry
node scripts/add-to-leaderboard.js --name "Anonymous" --time 300 --difficulty easy

# Check leaderboard: Should show "Anonymous"
```

## Environment Variables

### Node.js Script
```bash
# Set API URL
export API_URL=https://sudoku.kyros.party
node scripts/add-to-leaderboard.js --name "Test" --time 180 --difficulty easy

# Or inline
API_URL=https://sudoku.kyros.party node scripts/add-to-leaderboard.js --name "Test" --time 180 --difficulty easy
```

### Bash Script
```bash
# Set API URL
export API_URL=https://sudoku.kyros.party
./scripts/add-to-leaderboard.sh "Test" 180 casual easy

# Or inline
API_URL=https://sudoku.kyros.party ./scripts/add-to-leaderboard.sh "Test" 180 casual easy
```

## Production Use

### Add Real User Data
```bash
# Use production API
node scripts/add-to-leaderboard.js \
  --name "Real Player Name" \
  --time 234 \
  --mode daily \
  --difficulty medium \
  --api https://sudoku.kyros.party
```

### Batch Import
```bash
# Create a CSV file: users.csv
# name,time,mode,difficulty
# Alice,180,casual,easy
# Bob,240,daily,medium
# Charlie,300,challenge,hard

# Import script (example)
while IFS=, read -r name time mode difficulty; do
  node scripts/add-to-leaderboard.js \
    --name "$name" \
    --time "$time" \
    --mode "$mode" \
    --difficulty "$difficulty" \
    --api https://sudoku.kyros.party
done < users.csv
```

## Files

```
scripts/
├── add-to-leaderboard.js      # Node.js version (recommended)
├── add-to-leaderboard.sh      # Bash version
├── populate-leaderboard.sh    # Populate with sample data
└── README.md                  # This file
```

## Quick Reference

```bash
# Single entry (Node.js)
node scripts/add-to-leaderboard.js --name "Name" --time 180 --mode casual --difficulty easy

# Single entry (Bash)
./scripts/add-to-leaderboard.sh "Name" 180 casual easy

# Multiple entries
./scripts/populate-leaderboard.sh

# Help
node scripts/add-to-leaderboard.js --help
./scripts/add-to-leaderboard.sh --help

# Custom API
API_URL=https://sudoku.kyros.party ./scripts/add-to-leaderboard.sh "Name" 180 casual easy
```

## 🎉 Ready to Use!

Test the leaderboard feature:
```bash
# Populate with sample data
./scripts/populate-leaderboard.sh

# Visit leaderboard
http://localhost:3010/leaderboard
```

Perfect for testing and development! 🏆✨

