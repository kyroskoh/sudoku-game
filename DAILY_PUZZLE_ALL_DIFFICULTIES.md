# 🎯 Daily Puzzle - All Difficulties Available

## What Changed

The daily puzzle system has been updated to **allow users to choose their preferred difficulty** instead of having it assigned based on the day of the week.

### Before ❌
```
Sunday → Easy
Monday → Easy  
Tuesday → Medium
Wednesday → Medium
Thursday → Hard
Friday → Hard
Saturday → Expert

(Users had no choice)
```

### After ✅
```
Every Day → User picks: Easy, Medium, Hard, Expert, or Extreme

(Users choose their challenge level!)
```

## Key Features

### 1. User Choice
- Players select difficulty each day
- Same experience as Casual and Challenge modes
- No forced difficulty based on day

### 2. Multiple Daily Puzzles Per Day
- **5 different puzzles per day** (one for each difficulty)
- Each difficulty has its own unique puzzle
- All puzzles share the same SGT date

### 3. Deterministic Seeds
- Seeds now include difficulty: `daily-2025-11-10-easy`
- Everyone gets the same puzzle for a given date + difficulty
- Consistent across all players worldwide

### 4. Separate Leaderboards
- Each daily difficulty has its own top 10
- Fair competition within difficulty levels
- Example: Daily Easy leaderboard, Daily Medium leaderboard, etc.

## How It Works

### Seed Format

```
Old: daily-2025-11-10
New: daily-2025-11-10-easy
     daily-2025-11-10-medium
     daily-2025-11-10-hard
     daily-2025-11-10-expert
     daily-2025-11-10-extreme
```

### API Changes

**Request:**
```bash
GET /api/daily?difficulty=easy&deviceId=uuid
```

**Response:**
```json
{
  "puzzle": {
    "id": "uuid...",
    "givens": [[...]],
    "difficulty": "easy",
    "mode": "daily",
    "seed": "daily-2025-11-10-easy",
    "date": "2025-11-10T00:00:00.000Z"
  },
  "streak": {
    "currentStreak": 5,
    "lastPlayedDate": "2025-11-09T..."
  }
}
```

### Database

```sql
-- Easy puzzle for today
SELECT * FROM Puzzle 
WHERE seed = 'daily-2025-11-10-easy';

-- Medium puzzle for today
SELECT * FROM Puzzle 
WHERE seed = 'daily-2025-11-10-medium';

-- All daily puzzles for today
SELECT * FROM Puzzle 
WHERE seed LIKE 'daily-2025-11-10-%';
```

## User Experience

### Daily Page Flow

```
1. Visit /daily
   ↓
2. See difficulty selector
   - Easy
   - Medium  
   - Hard
   - Expert
   - Extreme
   ↓
3. Click preferred difficulty
   ↓
4. Click "Start [Difficulty] Daily"
   ↓
5. Play today's puzzle for that difficulty
   ↓
6. During game: Can click "← Change Difficulty"
   ↓
7. Complete and see leaderboard for that difficulty
```

### Example User Journey

```
Monday:
- Player chooses Easy → Completes in 3:00
- Sees Easy Daily leaderboard
- Rank #5

Tuesday:
- Player feels confident
- Chooses Medium → Completes in 4:30
- Sees Medium Daily leaderboard
- Rank #8

Wednesday:
- Player wants challenge
- Chooses Hard → Takes 8:45
- Sees Hard Daily leaderboard
- Rank #12 (not in top 10, but recorded!)
```

## Benefits

### ✅ Player Freedom
- Choose challenge level each day
- Progress at your own pace
- No forced difficulty jumps

### ✅ Fair Competition
- Compete against players at same difficulty
- Meaningful leaderboards
- Clear skill progression

### ✅ Flexibility
- Busy day? Choose Easy
- Feeling sharp? Try Expert
- Every day can be different

### ✅ Engagement
- 5 puzzles per day instead of 1
- More content to explore
- Players can try multiple difficulties

## Technical Implementation

### Backend Changes

1. **Updated `getTodaysPuzzle()`**
   - Now requires `difficulty` parameter
   - Returns puzzle for specific difficulty + date

2. **Updated Seed Generation**
   - Includes difficulty in seed
   - Format: `daily-YYYY-MM-DD-{difficulty}`

3. **Removed Day-Based Difficulty**
   - No more `getDifficultyForDate()`
   - User choice replaces automatic selection

### Frontend Changes

1. **Added Difficulty Selector**
   - Same UI as Casual/Challenge modes
   - 5 difficulty buttons
   - Visual feedback for selection

2. **Updated API Call**
   - Passes selected difficulty
   - Handles difficulty parameter

3. **Change Difficulty Button**
   - Available during gameplay
   - Returns to selector screen

## Leaderboards

### How Leaderboards Work Now

**Global Daily Leaderboards:**
```bash
GET /api/leaderboard/global?mode=daily&difficulty=easy
# Top 10 across ALL daily easy puzzles

GET /api/leaderboard/global?mode=daily&difficulty=expert
# Top 10 across ALL daily expert puzzles
```

**Specific Puzzle Leaderboard:**
```bash
GET /api/leaderboard?puzzleId=uuid
# Top 10 for specific puzzle (e.g., today's easy puzzle)
```

### Leaderboard Structure

```
Daily Easy Leaderboard
1. 🥇 ProGamer     2:15  (Nov 10)
2. 🥈 SpeedRunner  2:18  (Nov 9)
3. 🥉 QuickSolver  2:22  (Nov 10)
...

Daily Expert Leaderboard  
1. 🥇 MasterSudoku 8:30  (Nov 10)
2. 🥈 BrainPower   8:45  (Nov 8)
3. 🥉 ThinkFast    9:12  (Nov 10)
...
```

## Streak Tracking

### How Streaks Work

- Streak is based on **completing any daily puzzle each day**
- Difficulty doesn't matter for streak
- Completing Easy or Extreme both count

**Example:**
```
Nov 8: Completed Easy → Streak: 1
Nov 9: Completed Hard → Streak: 2
Nov 10: Completed Medium → Streak: 3
Nov 11: No completion → Streak: 0
```

**Multiple Completions Same Day:**
```
Nov 10: 
  - Complete Easy (10:00 AM) → Streak: 5
  - Complete Medium (2:00 PM) → Streak: still 5 (same day)
  - Complete Hard (8:00 PM) → Streak: still 5 (same day)
  
All count as achievements, but streak only +1 per day
```

## Migration

### No Database Migration Needed!

The existing schema already supports this:
- `seed` field is text, can hold any format
- `difficulty` field exists
- `date` field for SGT date

### Backward Compatibility

Old daily puzzles (without difficulty in seed) still work:
```sql
-- Old format
SELECT * FROM Puzzle WHERE seed = 'daily-2025-11-08';

-- New format
SELECT * FROM Puzzle WHERE seed = 'daily-2025-11-10-easy';

-- Both coexist peacefully
```

## Deployment

```bash
cd ~/sudoku-game
git pull
sudo docker compose down
sudo docker compose build --no-cache
sudo docker compose up -d
```

No migration required! System will automatically:
1. Generate new puzzles with difficulty in seed
2. Work with existing old-format puzzles
3. Maintain all leaderboards

## Testing

### Test Difficulty Selection

```bash
# Test Easy
curl "http://localhost:3011/api/daily?difficulty=easy&deviceId=test" | jq '.puzzle.seed'
# Should return: "daily-2025-11-10-easy"

# Test Medium
curl "http://localhost:3011/api/daily?difficulty=medium&deviceId=test" | jq '.puzzle.seed'
# Should return: "daily-2025-11-10-medium"

# Test all 5 difficulties
for diff in easy medium hard expert extreme; do
  echo "Testing $diff:"
  curl -s "http://localhost:3011/api/daily?difficulty=$diff&deviceId=test" | jq '.puzzle.seed'
done
```

### Test Puzzle Consistency

```bash
# User 1 requests Easy
PUZZLE1=$(curl -s "http://localhost:3011/api/daily?difficulty=easy&deviceId=user1" | jq -r '.puzzle.id')

# User 2 requests Easy
PUZZLE2=$(curl -s "http://localhost:3011/api/daily?difficulty=easy&deviceId=user2" | jq -r '.puzzle.id')

# Should be same
if [ "$PUZZLE1" == "$PUZZLE2" ]; then
  echo "✅ Same Easy puzzle for both users"
else
  echo "❌ Different puzzles!"
fi
```

### Test Different Difficulties Same Day

```bash
# Get Easy puzzle
EASY=$(curl -s "http://localhost:3011/api/daily?difficulty=easy&deviceId=test" | jq -r '.puzzle.id')

# Get Hard puzzle
HARD=$(curl -s "http://localhost:3011/api/daily?difficulty=hard&deviceId=test" | jq -r '.puzzle.id')

# Should be different
if [ "$EASY" != "$HARD" ]; then
  echo "✅ Different puzzles for different difficulties"
else
  echo "❌ Same puzzle!"
fi
```

## FAQ

### Q: Can I play multiple difficulties in one day?

**A:** Yes! You can play Easy, then Medium, then Hard all in the same day. Each completion is tracked separately.

### Q: Does completing multiple difficulties give multiple streak days?

**A:** No, streak is +1 per calendar day regardless of how many difficulties you complete.

### Q: Will I appear in multiple leaderboards?

**A:** Yes! If you complete Easy, Medium, and Hard daily puzzles, you can appear in all 3 leaderboards.

### Q: What happened to the old day-based difficulty system?

**A:** Removed! Now every day offers all 5 difficulties for you to choose from.

### Q: Do all difficulties reset at the same time?

**A:** Yes, all 5 daily puzzles (Easy through Extreme) reset at 12:00 AM SGT simultaneously.

## Summary

### What You Get Now

✅ **5 daily puzzles per day** (one for each difficulty)
✅ **User choice** - pick your challenge level
✅ **Consistent puzzles** - everyone gets same puzzle per difficulty
✅ **Fair leaderboards** - compete within your difficulty
✅ **Flexibility** - choose different difficulty each day
✅ **More content** - can play multiple difficulties same day
✅ **Same SGT reset** - 12:00 AM Singapore Time
✅ **Streak tracking** - any difficulty counts

### User Flow

```
Old: Visit /daily → Get assigned difficulty → Play → Done

New: Visit /daily → Choose difficulty → Play → Can try another difficulty → Done
```

## 🎉 Ready to Deploy!

All code is complete, tested, and ready. Users will now have full control over their daily puzzle experience!

