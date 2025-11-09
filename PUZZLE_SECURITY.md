# 🔐 Puzzle Security - Salt Protection

## Overview

To prevent cheating, puzzle seeds are salted with a secret key before generation. This means players cannot reproduce the puzzle themselves even if they see the seed.

## The Problem

Without salt:
```
Seed: daily-2025-11-10-easy
↓
Player can use this seed to generate the solution
↓
Player cheats by looking up the solution
```

## The Solution

With salt:
```
Display Seed: daily-2025-11-10-easy (shown to users)
↓
Actual Generation Seed: salted_a3f7b9c2... (secret, salted)
↓
Player cannot reproduce the puzzle
↓
Cheating prevented ✅
```

## How It Works

### 1. Environment Variable

```env
PUZZLE_SALT="your_secret_random_salt_here_change_in_production"
```

- **MUST be kept secret**
- **MUST be changed in production**
- **MUST be consistent** (don't change or puzzles will differ)

### 2. Seed Salting

```typescript
// Display seed (stored in database, shown to users)
const dateKey = "daily-2025-11-10-easy";

// Actual generation seed (never stored, never shown)
const saltedSeed = crypto
  .createHash('sha256')
  .update(dateKey + PUZZLE_SALT)
  .digest('hex');
// Result: "salted_a3f7b9c2d4e5f6..." (first 32 chars of hash)

// Generate puzzle with salted seed
const puzzle = sudokuGenerator.generatePuzzle(difficulty, saltedSeed);

// Store with display seed
await prisma.puzzle.create({
  data: {
    seed: dateKey, // Unsalted, for display
    givens: puzzle.givens,
    solution: puzzle.solution // Solution stays secret in backend
  }
});
```

### 3. User Interface

Users see:
```
📅 Daily - Easy
November 10, 2025
Puzzle: daily-2025-11-10-easy

(The seed they see is NOT the seed used for generation)
```

## Security Measures

### ✅ What's Protected

1. **Puzzle Generation**
   - Actual seed is salted with secret
   - Cannot be reproduced without salt

2. **Solution**
   - Never sent to frontend
   - Only backend knows full solution
   - Validation happens server-side

3. **Display Seed**
   - Shown for transparency
   - Useful for support/debugging
   - But useless for cheating

### ❌ What Users Cannot Do

1. **Reproduce Puzzle**
   ```javascript
   // User tries:
   generatePuzzle('easy', 'daily-2025-11-10-easy')
   // Gets a different puzzle (no salt)
   // Cannot match the actual puzzle
   ```

2. **Predict Future Puzzles**
   ```javascript
   // User tries:
   generatePuzzle('easy', 'daily-2025-11-11-easy')
   // Gets a different puzzle (no salt)
   // Cannot pre-solve tomorrow's puzzle
   ```

3. **Brute Force Solutions**
   - Solution never sent to frontend
   - Validation requires server request
   - Rate limiting can be added

## Implementation

### Backend Changes

**File: `backend/src/services/daily-puzzle.ts`**

```typescript
// Import crypto
import crypto from 'crypto';

// Get salt from environment
const PUZZLE_SALT = process.env.PUZZLE_SALT || 'default_salt';

// Create salted seed
private createSaltedSeed(dateKey: string): string {
  const hash = crypto
    .createHash('sha256')
    .update(dateKey + PUZZLE_SALT)
    .digest('hex');
  return `salted_${hash.substring(0, 32)}`;
}

// Use salted seed for generation
private async generateDailyPuzzle(date, dateKey, difficulty) {
  const saltedSeed = this.createSaltedSeed(dateKey);
  const puzzle = sudokuGenerator.generatePuzzle(difficulty, saltedSeed);
  // Store with unsalted dateKey for display
  await prisma.puzzle.create({ seed: dateKey, ... });
}
```

### Frontend Changes

**Display seed in UI:**

```typescript
<p className={styles.subtitle}>
  Puzzle: {puzzle.seed || `daily-${puzzle.id}`}
</p>
```

Users see the seed but cannot use it to cheat.

## Deployment

### 1. Set Environment Variable

```bash
# On your server
cd ~/sudoku-game

# Edit .env file
nano backend/.env

# Add (or update):
PUZZLE_SALT="your_random_secret_string_here"
```

### 2. Generate Strong Salt

```bash
# Generate a random salt
openssl rand -hex 32

# Output: 3f8a9b2c4d5e6f7a8b9c0d1e2f3a4b5c...
# Copy this to PUZZLE_SALT in .env
```

### 3. Restart Services

```bash
sudo docker compose down
sudo docker compose build --no-cache
sudo docker compose up -d
```

## Important Notes

### ⚠️ Salt Must Be Consistent

**DO:**
```bash
# Set once in production
PUZZLE_SALT="3f8a9b2c4d5e6f7a8b9c0d1e2f3a4b5c"

# Never change it!
# (Or all puzzles will be different)
```

**DON'T:**
```bash
# Changing salt breaks consistency
Day 1: PUZZLE_SALT="salt1"  # Generates puzzle A
Day 2: PUZZLE_SALT="salt2"  # Same seed generates different puzzle B
# Users get different puzzles = bad!
```

### 🔒 Keep Salt Secret

**Never expose:**
- ❌ Don't commit to git
- ❌ Don't share publicly
- ❌ Don't send to frontend
- ❌ Don't log in console

**Store securely:**
- ✅ In .env file (gitignored)
- ✅ In environment variables
- ✅ In secret management service
- ✅ Document for team privately

### 📝 .gitignore

Ensure `.env` is in `.gitignore`:

```
backend/.env
backend/data/
node_modules/
```

## Testing

### Test Salt is Working

```bash
# Test 1: Generate same puzzle twice
curl "http://localhost:3011/api/daily?difficulty=easy&deviceId=test1"
curl "http://localhost:3011/api/daily?difficulty=easy&deviceId=test2"
# Should return SAME puzzle ID

# Test 2: Display seed is clean
curl "http://localhost:3011/api/daily?difficulty=easy&deviceId=test" | jq '.puzzle.seed'
# Should return: "daily-2025-11-10-easy" (not salted_...)

# Test 3: Solution not exposed
curl "http://localhost:3011/api/daily?difficulty=easy&deviceId=test" | jq '.puzzle.solution'
# Should return: null (not exposed to frontend)
```

### Test Different Salts Generate Different Puzzles

```bash
# With salt1
PUZZLE_SALT="salt1" npm run dev
# Get puzzle, note givens

# With salt2  
PUZZLE_SALT="salt2" npm run dev
# Get puzzle, should have different givens
```

## Additional Security Layers

### 1. Solution Validation Server-Side

**Already implemented:**
```typescript
// Backend validates solution
POST /api/puzzles/{id}/validate
{ "board": [[1,2,3...]] }

// Response:
{ "valid": true/false }
```

### 2. Rate Limiting (Optional Enhancement)

```typescript
// Add to backend
import rateLimit from 'express-rate-limit';

const validateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10 // Max 10 validation attempts per minute
});

app.post('/api/puzzles/:id/validate', validateLimiter, ...);
```

### 3. Attempt Tracking (Already Implemented)

- Every attempt recorded in database
- Suspicious patterns can be detected
- Multiple rapid completions flagged

## Benefits

### ✅ Prevents Cheating

**Scenario 1: Reproduce Puzzle**
```
Attacker sees: "daily-2025-11-10-easy"
Attacker tries: generatePuzzle('easy', 'daily-2025-11-10-easy')
Result: Different puzzle (no salt)
Outcome: Cannot cheat ✅
```

**Scenario 2: Pre-solve Tomorrow**
```
Attacker knows tomorrow's seed: "daily-2025-11-11-easy"
Attacker tries: Pre-generate solution
Result: Different puzzle (no salt)
Outcome: Cannot cheat ✅
```

**Scenario 3: Share Solutions**
```
User A completes puzzle
User A shares solution with User B
User B enters solution
Result: Still recorded, but...
- Same deviceId/userId would be suspicious
- Extremely fast completion time is suspicious
- Can be detected by analytics
```

### ✅ Maintains Consistency

- Same seed + same salt = same puzzle
- All players get identical puzzle per date/difficulty
- Leaderboards remain fair

### ✅ Transparency

- Users see the seed (trust)
- Support can identify puzzles (debugging)
- Historical tracking works
- But cannot reproduce = secure

## Monitoring

### Check Salt is Set

```bash
# On server
cd ~/sudoku-game
sudo docker exec -it sudoku-backend sh
echo $PUZZLE_SALT

# Should show your secret salt
# If empty or "default_salt", UPDATE IT!
```

### Check Logs

```bash
sudo docker compose logs backend | grep "Generating"

# Should see:
# [Daily Puzzle] Generating easy puzzle with seed: daily-2025-11-10-easy (salted)
```

## Migration

### Existing Puzzles

Puzzles generated before salt implementation:
- Still work fine
- Can coexist with new salted puzzles
- No migration needed

### Future Puzzles

All new puzzles:
- Generated with salt
- Cannot be reproduced
- Secure by default

## Summary

### Security Model

```
Public Information (Safe to Show):
- Display seed: "daily-2025-11-10-easy"
- Puzzle givens: [[0,3,0,...]]
- Difficulty level
- Date

Secret Information (Never Exposed):
- PUZZLE_SALT environment variable
- Actual generation seed: "salted_a3f7b9c2..."
- Full solution: [[5,3,8,...]]

Result: Players can see enough info for transparency,
        but cannot cheat or reproduce puzzles
```

### Action Items

1. ✅ Set `PUZZLE_SALT` in production `.env`
2. ✅ Use strong random string (32+ characters)
3. ✅ Never change salt once set
4. ✅ Never expose salt publicly
5. ✅ Display seeds to users for transparency
6. ✅ Solution validation stays server-side

## 🎉 Result

Your Sudoku game is now **cheat-resistant** while remaining **transparent** and **fair**!

Players can see:
- ✅ The seed (for trust and debugging)
- ✅ The puzzle givens
- ✅ Their progress

Players cannot:
- ❌ Reproduce the puzzle
- ❌ Generate the solution
- ❌ Pre-solve future puzzles

Perfect balance of transparency and security! 🔐✨

