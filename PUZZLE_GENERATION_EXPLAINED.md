# 🎲 Puzzle Generation Explained

## Overview

Sudoku Mastery uses different seed strategies for different game modes to provide the best experience:

1. **Casual & Challenge**: Random unique puzzles every time
2. **Daily**: Same puzzle for all users per day/difficulty

## How Seeds Work

### Seed Definition

A **seed** is a string that determines the puzzle layout. The same seed always generates the exact same puzzle.

```typescript
seed: "abc123" → Always generates Puzzle A
seed: "xyz789" → Always generates Puzzle B
seed: "abc123" → Still generates Puzzle A (deterministic)
```

## Casual Mode 🎮

### Behavior
**Every puzzle is unique and random.**

### Implementation
```typescript
// backend/src/services/puzzle-service.ts
async getCasualPuzzle(difficulty: Difficulty): Promise<any> {
  // Always generate fresh puzzles
  return this.generatePuzzle('casual', difficulty);
}

// backend/src/services/sudoku-generator.ts
public generatePuzzle(difficulty: Difficulty, seed?: string): PuzzleResult {
  const actualSeed = seed || this.generateSeed(); // ← No seed provided, so generates random
  // ...
}

private generateSeed(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
  // Example: "mhrvco791l9z3m2oinn" (timestamp + random)
}
```

### Result
```
User A plays Casual Easy:
  - Seed: "mhrvco791l9z3m2oinn"
  - Puzzle: [unique pattern A]

User A plays another Casual Easy:
  - Seed: "mhrvd1892m0a4n3pjkk"  ← Different!
  - Puzzle: [unique pattern B]     ← Different!

User B plays Casual Easy:
  - Seed: "mhrvf2903n1b5o4qmll"  ← Different!
  - Puzzle: [unique pattern C]     ← Different!
```

**Every casual game is a fresh challenge!** 🎲

## Challenge Mode 🏆

### Behavior
**Same as Casual - every puzzle is unique and random.**

### Implementation
```typescript
async getChallengePuzzle(difficulty: Difficulty, challengeType: string): Promise<any> {
  return this.generatePuzzle('challenge', difficulty);
  // Also generates random seed each time
}
```

### Result
Same behavior as Casual mode - every challenge puzzle is unique.

## Daily Mode 📅

### Behavior
**All users worldwide get the same puzzle for each day + difficulty.**

### Why?
- Fair competition on leaderboards
- Social aspect (everyone solves the same puzzle)
- Streak tracking makes sense
- Can discuss the puzzle with others

### Implementation

#### 1. Date-Based Seed Generation
```typescript
// backend/src/services/daily-puzzle.ts
private getDateKey(date: Date, difficulty: Difficulty): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `daily-${year}-${month}-${day}-${difficulty}`;
}

// Example outputs:
// "daily-2025-11-10-easy"
// "daily-2025-11-10-medium"
// "daily-2025-11-10-hard"
// "daily-2025-11-11-easy"  ← Next day
```

#### 2. Salt Protection (Security)
```typescript
private createSaltedSeed(dateKey: string): string {
  const hash = crypto
    .createHash('sha256')
    .update(dateKey + PUZZLE_SALT)  // Secret from environment
    .digest('hex');
  return `salted_${hash.substring(0, 32)}`;
}

// Example:
// Input:  "daily-2025-11-10-easy"
// Output: "salted_a3f7b9c2d4e5f6a8b1c3d5e7f9..."
//         ↑ Deterministic (same every time for same input)
//         ↑ But unpredictable (can't guess without PUZZLE_SALT)
```

#### 3. Puzzle Generation
```typescript
async getTodaysPuzzle(difficulty: Difficulty, ...) {
  const todaySGT = this.getTodayDateSGT();
  const dateKey = this.getDateKey(todaySGT, difficulty);
  const saltedSeed = this.createSaltedSeed(dateKey);
  
  // Pass the seed to generator
  const puzzleData = sudokuGenerator.generatePuzzle(difficulty, saltedSeed);
  
  // Store with clean seed for display
  await prisma.puzzle.create({
    seed: dateKey,  // "daily-2025-11-10-easy" (displayed to users)
    // But generated with saltedSeed (not displayed)
  });
}
```

### Result

#### Same Day, Same Difficulty → Same Puzzle
```
November 10, 2025, Easy difficulty:

User A in USA (8:00 AM local):
  - Display Seed: "daily-2025-11-10-easy"
  - Actual Seed: "salted_a3f7b9c2..." (hidden)
  - Puzzle: [specific pattern X]

User B in Japan (10:00 PM local, same SGT day):
  - Display Seed: "daily-2025-11-10-easy"
  - Actual Seed: "salted_a3f7b9c2..." (same!)
  - Puzzle: [specific pattern X] ← SAME PUZZLE!

User C in UK (2:00 PM local):
  - Display Seed: "daily-2025-11-10-easy"
  - Actual Seed: "salted_a3f7b9c2..." (same!)
  - Puzzle: [specific pattern X] ← SAME PUZZLE!
```

#### Different Difficulties → Different Puzzles
```
November 10, 2025:

Easy difficulty:
  - Seed: "daily-2025-11-10-easy"
  - Puzzle: [pattern X]

Medium difficulty:
  - Seed: "daily-2025-11-10-medium"  ← Different!
  - Puzzle: [pattern Y]              ← Different!

Hard difficulty:
  - Seed: "daily-2025-11-10-hard"    ← Different!
  - Puzzle: [pattern Z]              ← Different!
```

#### Next Day → New Puzzles
```
November 10, 2025, Easy:
  - Seed: "daily-2025-11-10-easy"
  - Puzzle: [pattern X]

November 11, 2025, Easy:
  - Seed: "daily-2025-11-11-easy"  ← Different date!
  - Puzzle: [pattern A]            ← New puzzle!
```

**5 unique puzzles per day (one per difficulty)!** 📅

## Comparison Table

| Feature | Casual/Challenge | Daily |
|---------|-----------------|-------|
| **Seed Type** | Random | Date-based |
| **Seed Format** | `mhrvco791l9z3m2oinn` | `daily-2025-11-10-easy` |
| **Same for All Users?** | ❌ No (every puzzle unique) | ✅ Yes (per day/difficulty) |
| **Reproducible?** | ❌ No (random every time) | ✅ Yes (same seed = same puzzle) |
| **Leaderboard** | Global (all puzzles) | Per date/difficulty |
| **Security** | No salt needed | Salted seed (cheat-proof) |
| **Display Seed?** | ✅ Yes (casual-abc123) | ✅ Yes (daily-2025-11-10-easy) |
| **Actual Seed** | Same as display | Salted (hidden) |

## Security: Why Salt Daily Puzzles?

### Without Salt (Vulnerable)
```
Player sees: "daily-2025-11-10-easy"
Player runs locally: generatePuzzle('easy', 'daily-2025-11-10-easy')
Result: Gets exact same puzzle → Can solve offline → Cheats!
```

### With Salt (Secure)
```
Player sees: "daily-2025-11-10-easy"
Server uses: "salted_a3f7b9c2..." (dateKey + SECRET_SALT)

Player tries locally: generatePuzzle('easy', 'daily-2025-11-10-easy')
Result: Gets DIFFERENT puzzle (no salt) → Cannot cheat!
```

**Players can see the seed for transparency, but cannot reproduce the puzzle!** 🔐

## Why Not Salt Casual/Challenge?

**No need!** Each puzzle already has a random unique seed:
- Player A: `seed1` → Puzzle A
- Player B: `seed2` → Puzzle B
- Player C: `seed3` → Puzzle C

Even if they knew the seed, they can't "pre-solve" because:
1. They don't know future random seeds
2. Each puzzle is different anyway
3. No competitive advantage

**Daily needs salt because:**
- Everyone gets the same puzzle
- Seed is predictable (`daily-2025-11-11-easy` is tomorrow's seed)
- Without salt, could pre-solve tomorrow's puzzle

## Code Flow

### Casual/Challenge Flow
```
User clicks "Play Casual Easy"
    ↓
GET /api/puzzles?mode=casual&difficulty=easy
    ↓
puzzleService.getCasualPuzzle('easy')
    ↓
generatePuzzle('casual', 'easy')
    ↓
sudokuGenerator.generatePuzzle('easy') ← No seed parameter
    ↓
generateSeed() → "mhrvco791l9z3m2oinn" (random)
    ↓
Generate puzzle with random seed
    ↓
Store in database with seed
    ↓
Return to user with seed displayed
```

### Daily Flow
```
User clicks "Play Daily Easy"
    ↓
GET /api/daily?difficulty=easy
    ↓
dailyPuzzleService.getTodaysPuzzle('easy')
    ↓
getTodayDateSGT() → November 10, 2025 (SGT)
    ↓
getDateKey() → "daily-2025-11-10-easy"
    ↓
createSaltedSeed() → "salted_a3f7b9c2..." (deterministic)
    ↓
Check if puzzle exists with this dateKey
    ↓
If not, generate:
    sudokuGenerator.generatePuzzle('easy', saltedSeed)
    ↓
    Store with display seed: "daily-2025-11-10-easy"
    ↓
Return puzzle (same for all users)
```

## Database Storage

### Casual Puzzle Entry
```sql
id: "abc-123-def-456"
mode: "casual"
difficulty: "easy"
seed: "mhrvco791l9z3m2oinn"  -- Random unique seed
givens: [[0,3,0,...]]
solution: [[5,3,8,...]]
createdAt: "2025-11-10T10:30:00Z"
```

### Daily Puzzle Entry
```sql
id: "xyz-789-ghi-012"
mode: "daily"
difficulty: "easy"
seed: "daily-2025-11-10-easy"  -- Date-based seed (displayed)
givens: [[0,3,0,...]]           -- Generated with salted seed (hidden)
solution: [[5,3,8,...]]
date: "2025-11-10T00:00:00Z"   -- SGT midnight
createdAt: "2025-11-10T00:01:00Z"
```

## User Experience

### Casual Mode
```
Player: "I want to practice Easy puzzles"
System: "Here's a fresh unique puzzle!"
Player: *solves it*
Player: "Give me another Easy puzzle"
System: "Here's a completely different puzzle!"
         ↑ Different seed, different layout
```

### Daily Mode
```
Player A (USA): "What's today's Easy daily?"
System: "Here's today's puzzle (daily-2025-11-10-easy)"
Player A: *solves in 10 minutes*

Player B (Japan): "What's today's Easy daily?"
System: "Here's today's puzzle (daily-2025-11-10-easy)"
         ↑ SAME puzzle as Player A got!
Player B: *solves in 12 minutes*

Leaderboard shows:
  1. Player A - 10:00
  2. Player B - 12:00
     ↑ Fair comparison (same puzzle!)
```

## Summary

### ✅ Current Implementation

**Casual & Challenge Modes:**
- ✅ Random unique seed for every puzzle
- ✅ No two puzzles are the same
- ✅ Infinite variety
- ✅ Seed displayed for transparency
- ✅ No salt needed (already random)

**Daily Mode:**
- ✅ Same puzzle for all users (per day + difficulty)
- ✅ Date-based deterministic seed
- ✅ Salted for security (cheat-proof)
- ✅ Display seed shown (clean format)
- ✅ Actual generation seed hidden (salted)
- ✅ 5 puzzles per day (one per difficulty)
- ✅ Resets at 12:00 AM SGT
- ✅ Fair leaderboard competition

### 🎯 Design Goals Achieved

1. **Variety**: Casual/Challenge never repeat ✅
2. **Fairness**: Daily is same for everyone ✅
3. **Security**: Cannot cheat by reproducing puzzles ✅
4. **Transparency**: Seeds are displayed to users ✅
5. **Consistency**: Daily puzzles are deterministic ✅
6. **Fun**: Fresh content every day ✅

## Technical Details

### Random Seed Generation
```typescript
private generateSeed(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Breakdown:
// Date.now()              → 1699632000000 (timestamp in ms)
// .toString(36)           → "mhrvco79" (base36 encoding)
// Math.random()           → 0.123456789
// .toString(36)           → "0.1l9z3m2oinn"
// .substr(2)              → "1l9z3m2oinn" (remove "0.")
// Combined                → "mhrvco791l9z3m2oinn"
//
// Result: Short, unique, random string
```

### Deterministic Seed Generation (Daily)
```typescript
private getDateKey(date: Date, difficulty: Difficulty): string {
  const year = date.getFullYear();        // 2025
  const month = String(date.getMonth() + 1).padStart(2, '0');  // "11"
  const day = String(date.getDate()).padStart(2, '0');         // "10"
  return `daily-${year}-${month}-${day}-${difficulty}`;
  // Result: "daily-2025-11-10-easy"
  // Same input = same output (deterministic)
}
```

### Salt Hashing (Security)
```typescript
private createSaltedSeed(dateKey: string): string {
  const hash = crypto
    .createHash('sha256')                    // SHA-256 algorithm
    .update(dateKey + PUZZLE_SALT)           // Combine seed + secret
    .digest('hex');                          // Output as hex string
  return `salted_${hash.substring(0, 32)}`;  // Take first 32 chars
}

// Example:
// Input:  "daily-2025-11-10-easy" + "secret_salt_abc123"
// SHA256: "a3f7b9c2d4e5f6a8b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5"
// Output: "salted_a3f7b9c2d4e5f6a8b1c3d5e7f9a1b3c5"
//         ↑ Deterministic (same every time)
//         ↑ Unpredictable (can't guess without secret salt)
```

## Testing

### Test Casual Randomness
```bash
# Generate 3 casual puzzles
curl "http://localhost:3011/api/puzzles?mode=casual&difficulty=easy" | jq '.seed'
# Output: "mhrvco791l9z3m2oinn"

curl "http://localhost:3011/api/puzzles?mode=casual&difficulty=easy" | jq '.seed'
# Output: "mhrvd1892m0a4n3pjkk"  ← Different!

curl "http://localhost:3011/api/puzzles?mode=casual&difficulty=easy" | jq '.seed'
# Output: "mhrvf2903n1b5o4qmll"  ← Different!
```

### Test Daily Consistency
```bash
# User A gets daily puzzle
curl "http://localhost:3011/api/daily?difficulty=easy&deviceId=userA" | jq '.puzzle.seed'
# Output: "daily-2025-11-10-easy"

# User B gets daily puzzle
curl "http://localhost:3011/api/daily?difficulty=easy&deviceId=userB" | jq '.puzzle.seed'
# Output: "daily-2025-11-10-easy"  ← Same!

# Compare puzzle givens (should be identical)
curl "http://localhost:3011/api/daily?difficulty=easy&deviceId=userA" | jq '.puzzle.givens[0]'
curl "http://localhost:3011/api/daily?difficulty=easy&deviceId=userB" | jq '.puzzle.givens[0]'
# Both return: [0,3,0,0,0,1,8,5,9]  ← Same puzzle!
```

## Conclusion

**The current implementation provides the perfect balance:**

- **Casual/Challenge**: Endless variety with random unique puzzles
- **Daily**: Fair competition with same puzzle for everyone
- **Security**: Cheat-proof with salted seeds
- **Transparency**: Seeds displayed but cannot be exploited

**Users get the best of both worlds!** 🎮📅🔐✨

