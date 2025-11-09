# 🌏 Daily Puzzle System - Singapore Time (SGT)

## Overview

The daily puzzle system now uses **Singapore Time (SGT/UTC+8)** and resets at **12:00 AM SGT** every day.

## Key Features

### ✅ What's Implemented

1. **SGT Timezone**
   - Daily puzzles reset at midnight Singapore Time
   - UTC+8 (no daylight saving time)
   - Consistent for all players worldwide

2. **Deterministic Seeding**
   - Each day has a unique seed: `daily-YYYY-MM-DD`
   - Same seed = same puzzle for everyone
   - Example: `daily-2025-11-09`

3. **Automatic Generation**
   - Puzzle generated on first request each day
   - Cached in database
   - Subsequent requests return same puzzle

4. **Difficulty Rotation**
   - Sunday: Easy
   - Monday: Easy
   - Tuesday: Medium
   - Wednesday: Medium
   - Thursday: Hard
   - Friday: Hard
   - Saturday: Expert

## How It Works

### Daily Puzzle Flow

```
1. User requests daily puzzle
   ↓
2. System checks current SGT date
   ↓
3. Generate date key: "daily-2025-11-09"
   ↓
4. Look for puzzle with this seed in database
   ↓
5a. Found → Return existing puzzle
5b. Not found → Generate new puzzle with seed
   ↓
6. Return puzzle to user
```

### Time Zone Handling

```javascript
Current Time: 2025-11-09 11:00 PM SGT
Date Key: "daily-2025-11-09"
Next Reset: In 1h 0m

Current Time: 2025-11-10 12:01 AM SGT  (After midnight)
Date Key: "daily-2025-11-10"  (New puzzle!)
Next Reset: In 23h 59m
```

### Global Synchronization

```
Player in Singapore:  11:59 PM Nov 9 → Puzzle A
                      12:00 AM Nov 10 → Puzzle B ✅

Player in New York:   10:59 AM Nov 9 (same UTC time)
                      → Still gets Puzzle A
                      11:00 AM Nov 9 (after SGT midnight)
                      → Now gets Puzzle B ✅

Everyone synchronized to SGT timezone!
```

## API Endpoints

### GET /api/daily

Get today's daily puzzle (based on SGT).

**Request:**
```bash
GET /api/daily?deviceId=uuid&userId=uuid
```

**Response:**
```json
{
  "puzzle": {
    "id": "uuid",
    "givens": [[0,3,0,...]],
    "difficulty": "medium",
    "date": "2025-11-09T00:00:00.000Z",
    "mode": "daily",
    "seed": "daily-2025-11-09"
  },
  "streak": {
    "currentStreak": 5,
    "lastPlayedDate": "2025-11-08T..."
  }
}
```

### GET /api/daily/info

Get information about daily puzzle timing.

**Request:**
```bash
GET /api/daily/info
```

**Response:**
```json
{
  "timezone": "Asia/Singapore (SGT)",
  "utcOffset": "+08:00",
  "currentSGT": "11/9/2025, 11:30:00 PM",
  "dateKey": "daily-2025-11-09",
  "nextResetIn": "0h 30m"
}
```

## Implementation Details

### Date Key Generation

```typescript
private getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `daily-${year}-${month}-${day}`;
}
```

### SGT Date Calculation

```typescript
private getTodayDateSGT(): Date {
  // Get current time in SGT
  const now = new Date();
  const sgtString = now.toLocaleString('en-US', { timeZone: 'Asia/Singapore' });
  const sgtDate = new Date(sgtString);
  
  // Set to midnight SGT
  sgtDate.setHours(0, 0, 0, 0);
  
  return sgtDate;
}
```

### Puzzle Lookup

```typescript
// Find puzzle by seed (which is the date key)
const puzzle = await prisma.puzzle.findFirst({
  where: {
    mode: 'daily',
    seed: 'daily-2025-11-09' // Unique per day
  }
});
```

## Frontend Integration

### Display Reset Time

```typescript
// In your DailyGame component
useEffect(() => {
  const fetchInfo = async () => {
    const response = await fetch('/api/daily/info');
    const data = await response.json();
    
    console.log(`Next reset in: ${data.nextResetIn}`);
    console.log(`Current SGT: ${data.currentSGT}`);
  };
  
  fetchInfo();
}, []);
```

### Show Countdown

```typescript
const [timeUntilReset, setTimeUntilReset] = useState('');

useEffect(() => {
  const updateCountdown = async () => {
    const response = await fetch('/api/daily/info');
    const data = await response.json();
    setTimeUntilReset(data.nextResetIn);
  };
  
  updateCountdown();
  const interval = setInterval(updateCountdown, 60000); // Update every minute
  
  return () => clearInterval(interval);
}, []);

return (
  <div>
    <p>New puzzle in: {timeUntilReset}</p>
  </div>
);
```

## Database Schema

### Puzzle Seed Field

The `seed` field now serves dual purpose:
1. **Deterministic generation** - Same seed = same puzzle
2. **Daily puzzle identifier** - Format: `daily-YYYY-MM-DD`

```sql
-- Find today's daily puzzle
SELECT * FROM Puzzle 
WHERE mode = 'daily' 
  AND seed = 'daily-2025-11-09';

-- All daily puzzles
SELECT * FROM Puzzle 
WHERE mode = 'daily' 
ORDER BY date DESC;
```

## Benefits

### ✅ Consistency
- Everyone worldwide gets the same puzzle each SGT day
- No confusion about "which day's puzzle"
- Leaderboards make sense (all solving same puzzle)

### ✅ Simplicity
- One puzzle per day, no timezone confusion
- Clear reset time (12 AM SGT)
- Easy to explain to users

### ✅ Fairness
- Everyone has 24 hours to complete puzzle
- Reset time is fixed and predictable
- No advantage based on location

### ✅ Performance
- Puzzle generated once per day
- Cached in database
- Fast subsequent requests

## Testing

### Test Different Times

```bash
# Morning SGT (should get current day's puzzle)
curl "http://localhost:3011/api/daily/info"

# Just after midnight SGT (should get new puzzle)
curl "http://localhost:3011/api/daily?deviceId=test"

# Check puzzle seed matches date
curl "http://localhost:3011/api/daily?deviceId=test" | jq '.puzzle.seed'
# Should return: "daily-2025-11-09"
```

### Test Across Timezones

```bash
# Set system to different timezone
export TZ="America/New_York"
curl "http://localhost:3011/api/daily/info"

# Should still show SGT time
export TZ="Europe/London"
curl "http://localhost:3011/api/daily/info"

# All should return same puzzle for same SGT date
```

### Test Puzzle Consistency

```bash
# Request 1
curl "http://localhost:3011/api/daily?deviceId=user1" | jq '.puzzle.id'

# Request 2 (different user, same day)
curl "http://localhost:3011/api/daily?deviceId=user2" | jq '.puzzle.id'

# Both should return SAME puzzle ID
```

## Deployment

No database migration needed! The existing schema already supports this:

```bash
cd ~/sudoku-game
git pull
sudo docker compose down
sudo docker compose build --no-cache
sudo docker compose up -d
```

The system will automatically:
1. Use SGT timezone for new puzzles
2. Generate date-based seeds
3. Work with existing puzzles

## User Experience

### What Users See

1. **Daily Page Header**
   ```
   📅 Daily Challenge
   Today's Puzzle: Medium
   New puzzle in: 2h 15m
   🔥 Your streak: 7 days
   ```

2. **After Midnight SGT**
   ```
   🎉 New daily puzzle available!
   Today's Puzzle: Hard (Thursday)
   Complete to continue your streak!
   ```

3. **Leaderboard**
   ```
   📅 November 9, 2025 - Daily Leaderboard
   
   1. 🥇 ProGamer     2:34
   2. 🥈 SpeedRunner  2:45
   3. 🥉 SudokuMaster 3:12
   
   All times for the same SGT day puzzle ✅
   ```

## Monitoring & Debugging

### Check Current SGT Status

```bash
# Get detailed info
curl http://localhost:3011/api/daily/info | jq

{
  "timezone": "Asia/Singapore (SGT)",
  "utcOffset": "+08:00",
  "currentSGT": "11/9/2025, 11:45:00 PM",
  "dateKey": "daily-2025-11-09",
  "nextResetIn": "0h 15m"
}
```

### Check Database

```sql
-- Today's puzzle
SELECT * FROM Puzzle 
WHERE seed LIKE 'daily-%' 
ORDER BY date DESC LIMIT 1;

-- All daily puzzles this week
SELECT 
  seed,
  difficulty,
  date,
  createdAt
FROM Puzzle 
WHERE mode = 'daily' 
  AND date >= date('now', '-7 days')
ORDER BY date DESC;
```

### Logs

Backend logs will show:
```
[Daily Puzzle] Requesting puzzle for SGT date: daily-2025-11-09
[Daily Puzzle] Found existing puzzle for daily-2025-11-09
```

Or:
```
[Daily Puzzle] Requesting puzzle for SGT date: daily-2025-11-10
[Daily Puzzle] Generating new puzzle for daily-2025-11-10
[Daily Puzzle] Generating medium puzzle with seed: daily-2025-11-10
```

## FAQ

### Q: What if I'm in a different timezone?

**A:** The daily puzzle resets at 12 AM SGT regardless of your location. You might see the reset at a different local time (e.g., 11 AM EST), but everyone gets the same puzzle.

### Q: Can I play yesterday's puzzle?

**A:** Currently no, only today's puzzle is available. Historical puzzles could be added as a feature.

### Q: What if the server restarts at midnight?

**A:** The puzzle is cached in the database, so restarts don't affect it. The seed-based system ensures the same puzzle is always generated for a given date.

### Q: Why Singapore Time?

**A:** SGT is stable (no DST), geographically central for Asia-Pacific region, and provides a consistent reference point for all players worldwide.

## Future Enhancements

1. **Custom Timezone** - Let users choose their preferred reset time
2. **Historical Puzzles** - Browse and play past daily puzzles
3. **Preview Next** - See tomorrow's difficulty
4. **Weekly Challenge** - Complete all 7 days for bonus
5. **Time Zone Display** - Show local reset time to users

## Summary

✅ Daily puzzles reset at 12:00 AM Singapore Time (SGT/UTC+8)
✅ Everyone worldwide gets the same puzzle each day
✅ Deterministic seed-based generation
✅ Difficulty rotates through the week
✅ Streak tracking works correctly
✅ Leaderboards are fair and consistent
✅ No manual intervention needed

The system is production-ready and will handle timezones automatically! 🌏🎮

