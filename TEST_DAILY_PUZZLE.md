# 🧪 Testing Daily Puzzle SGT System

## Quick Tests

### 1. Test Daily Puzzle Info

```bash
# Get SGT time info
curl http://localhost:3011/api/daily/info | jq

# Expected output:
{
  "timezone": "Asia/Singapore (SGT)",
  "utcOffset": "+08:00",
  "currentSGT": "11/10/2025, 1:23:45 AM",
  "dateKey": "daily-2025-11-10",
  "nextResetIn": "22h 36m"
}
```

### 2. Test Daily Puzzle Retrieval

```bash
# Get today's puzzle
curl "http://localhost:3011/api/daily?deviceId=test-user-123" | jq

# Expected output:
{
  "puzzle": {
    "id": "uuid...",
    "givens": [[0,3,0,...]...],
    "difficulty": "medium",
    "date": "2025-11-10T00:00:00.000Z",
    "mode": "daily",
    "seed": "daily-2025-11-10"
  },
  "streak": {
    "currentStreak": 0,
    "lastPlayedDate": null
  }
}
```

### 3. Test Puzzle Consistency

```bash
# Request 1
curl "http://localhost:3011/api/daily?deviceId=user1" | jq '.puzzle.id' > puzzle1.txt

# Request 2 (different user, same day)
curl "http://localhost:3011/api/daily?deviceId=user2" | jq '.puzzle.id' > puzzle2.txt

# Compare - should be identical
diff puzzle1.txt puzzle2.txt
# No output = same puzzle ✅
```

### 4. Test Seed Format

```bash
# Check seed format
curl "http://localhost:3011/api/daily?deviceId=test" | jq '.puzzle.seed'

# Should return:
"daily-2025-11-10"

# Format: daily-YYYY-MM-DD
```

### 5. Test Difficulty Rotation

```bash
# Get today's difficulty
curl "http://localhost:3011/api/daily/info" | jq '.dateKey'
curl "http://localhost:3011/api/daily?deviceId=test" | jq '.puzzle.difficulty'

# Check against day of week:
# Sunday: easy
# Monday: easy
# Tuesday: medium
# Wednesday: medium
# Thursday: hard
# Friday: hard
# Saturday: expert
```

## Integration Tests

### Test Streak Tracking

```bash
# Day 1 - Complete puzzle
curl -X POST http://localhost:3011/api/attempts \
  -H "Content-Type: application/json" \
  -d '{
    "puzzleId": "puzzle-id-from-daily",
    "deviceId": "test-user-123",
    "mode": "daily",
    "difficulty": "medium",
    "startedAt": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
    "result": "completed",
    "timeMs": 180000
  }'

# Check streak
curl "http://localhost:3011/api/daily?deviceId=test-user-123" | jq '.streak'

# Should show:
{
  "currentStreak": 1,
  "lastPlayedDate": "2025-11-10T..."
}
```

### Test Leaderboard Entry

```bash
# Complete a daily puzzle
# (use same puzzle ID from /api/daily)

# Check if it appears on leaderboard
curl "http://localhost:3011/api/leaderboard/global?mode=daily&difficulty=medium" | jq

# Should see your entry if in top 10
```

## Timezone Tests

### Test From Different Timezones

```bash
# New York (EST/EDT)
TZ="America/New_York" curl http://localhost:3011/api/daily/info | jq '.currentSGT'

# London (GMT/BST)
TZ="Europe/London" curl http://localhost:3011/api/daily/info | jq '.currentSGT'

# Tokyo (JST)
TZ="Asia/Tokyo" curl http://localhost:3011/api/daily/info | jq '.currentSGT'

# Sydney (AEDT)
TZ="Australia/Sydney" curl http://localhost:3011/api/daily/info | jq '.currentSGT'

# All should return same SGT time ✅
```

### Test Reset Timing

```bash
# Before midnight SGT
# Get puzzle and note the seed

# After midnight SGT (next day)
# Get puzzle again

# Seeds should be different:
# daily-2025-11-09 → daily-2025-11-10
```

## Frontend Integration Tests

### Test in Browser Console

```javascript
// Get daily info
fetch('/api/daily/info')
  .then(r => r.json())
  .then(data => console.log('SGT Info:', data));

// Get daily puzzle
fetch('/api/daily?deviceId=browser-test-123')
  .then(r => r.json())
  .then(data => console.log('Daily Puzzle:', data));

// Check if seed matches today's date
const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
// (Adjust for SGT timezone if needed)
```

### Test Countdown Display

```javascript
// Add to your DailyGame component
useEffect(() => {
  const updateCountdown = async () => {
    const response = await fetch('/api/daily/info');
    const data = await response.json();
    
    console.log('Current SGT:', data.currentSGT);
    console.log('Next reset in:', data.nextResetIn);
    
    // Display to user
    setResetInfo(`New puzzle in ${data.nextResetIn}`);
  };
  
  updateCountdown();
  const interval = setInterval(updateCountdown, 60000); // Every minute
  
  return () => clearInterval(interval);
}, []);
```

## Database Verification

### Check Database Entries

```bash
# Enter backend container
sudo docker exec -it sudoku-backend sh

# Check today's puzzle
cd /app
npx prisma studio
# Opens at localhost:5555

# Or use SQL directly:
sqlite3 data/app.sqlite

# Query today's puzzle
SELECT 
  seed,
  difficulty,
  mode,
  date,
  createdAt
FROM Puzzle
WHERE seed LIKE 'daily-%'
ORDER BY date DESC
LIMIT 5;

# Should see entries like:
# daily-2025-11-10 | medium | daily | 2025-11-10 00:00:00
```

## Performance Tests

### Test Response Time

```bash
# First request (generates puzzle)
time curl -s "http://localhost:3011/api/daily?deviceId=test" > /dev/null

# Second request (cached)
time curl -s "http://localhost:3011/api/daily?deviceId=test2" > /dev/null

# Second should be much faster (no generation)
```

### Test Concurrent Requests

```bash
# Simulate multiple users requesting at once
for i in {1..10}; do
  curl -s "http://localhost:3011/api/daily?deviceId=user-$i" &
done
wait

# All should get same puzzle ID
```

## Edge Cases

### Test Midnight Transition

```bash
# At 11:59 PM SGT
curl http://localhost:3011/api/daily/info | jq '.nextResetIn'
# Should show: "0h 1m"

curl "http://localhost:3011/api/daily?deviceId=test" | jq '.puzzle.seed'
# Note the seed: e.g., "daily-2025-11-09"

# At 12:01 AM SGT (wait 2 minutes)
curl http://localhost:3011/api/daily/info | jq '.nextResetIn'
# Should show: "23h 59m"

curl "http://localhost:3011/api/daily?deviceId=test" | jq '.puzzle.seed'
# Should be new: "daily-2025-11-10"
```

### Test Seed Determinism

```bash
# Clear database
sudo docker exec -it sudoku-backend sh
rm /app/data/app.sqlite
npx prisma migrate deploy
exit

# Request puzzle
curl "http://localhost:3011/api/daily?deviceId=test1" | jq '.puzzle.givens' > puzzle1.json

# Restart container
sudo docker compose restart backend
sleep 3

# Request again
curl "http://localhost:3011/api/daily?deviceId=test2" | jq '.puzzle.givens' > puzzle2.json

# Compare - should be identical
diff puzzle1.json puzzle2.json
# No difference = deterministic ✅
```

## Automated Test Script

```bash
#!/bin/bash
# test-daily-puzzle.sh

echo "🧪 Testing Daily Puzzle System..."
echo ""

# Test 1: Info endpoint
echo "1. Testing /api/daily/info..."
INFO=$(curl -s http://localhost:3011/api/daily/info)
echo "$INFO" | jq '.'
TIMEZONE=$(echo "$INFO" | jq -r '.timezone')
if [ "$TIMEZONE" == "Asia/Singapore (SGT)" ]; then
  echo "✅ Timezone correct"
else
  echo "❌ Timezone incorrect: $TIMEZONE"
fi
echo ""

# Test 2: Get daily puzzle
echo "2. Testing /api/daily..."
PUZZLE=$(curl -s "http://localhost:3011/api/daily?deviceId=test-user")
echo "$PUZZLE" | jq '.puzzle | {id, seed, difficulty, mode}'
SEED=$(echo "$PUZZLE" | jq -r '.puzzle.seed')
if [[ "$SEED" =~ ^daily-[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
  echo "✅ Seed format correct: $SEED"
else
  echo "❌ Seed format incorrect: $SEED"
fi
echo ""

# Test 3: Consistency check
echo "3. Testing puzzle consistency..."
PUZZLE_ID_1=$(curl -s "http://localhost:3011/api/daily?deviceId=user1" | jq -r '.puzzle.id')
PUZZLE_ID_2=$(curl -s "http://localhost:3011/api/daily?deviceId=user2" | jq -r '.puzzle.id')
if [ "$PUZZLE_ID_1" == "$PUZZLE_ID_2" ]; then
  echo "✅ Same puzzle for different users"
else
  echo "❌ Different puzzles: $PUZZLE_ID_1 vs $PUZZLE_ID_2"
fi
echo ""

# Test 4: Difficulty rotation
echo "4. Testing difficulty rotation..."
DIFFICULTY=$(echo "$PUZZLE" | jq -r '.puzzle.difficulty')
DAY_OF_WEEK=$(date +%u) # 1=Mon, 7=Sun
echo "Today is day $DAY_OF_WEEK, difficulty: $DIFFICULTY"
echo "✅ Check manually if correct for day of week"
echo ""

echo "🎉 Tests complete!"
```

## Production Checklist

Before deploying to production:

- [ ] Test /api/daily/info returns correct SGT time
- [ ] Test /api/daily returns puzzle with correct seed format
- [ ] Test same puzzle ID for different users on same day
- [ ] Test puzzle changes after midnight SGT
- [ ] Test streak tracking works
- [ ] Test leaderboard entries for daily puzzles
- [ ] Test from different timezones (all get same puzzle)
- [ ] Test difficulty rotation through the week
- [ ] Test server restart doesn't affect puzzle consistency
- [ ] Test database contains puzzles with unique seeds per day

## Troubleshooting

### Issue: Wrong timezone

**Symptom:** Puzzle changes at wrong time

**Fix:** Check server timezone settings
```bash
# In container
sudo docker exec -it sudoku-backend sh
date
TZ=Asia/Singapore date
```

### Issue: Different puzzles for same day

**Symptom:** Users get different puzzles

**Check:** Seed in database
```bash
# Check puzzle seeds
sudo docker exec -it sudoku-backend sh
cd /app
npx prisma studio
# Look at Puzzle table, check seeds
```

### Issue: Puzzle doesn't change after midnight

**Symptom:** Same puzzle next day

**Check:** Logs
```bash
sudo docker compose logs backend | grep "Daily Puzzle"

# Should see:
# [Daily Puzzle] Requesting puzzle for SGT date: daily-2025-11-10
# [Daily Puzzle] Generating new puzzle for daily-2025-11-10
```

## Success Criteria

✅ All tests pass
✅ Puzzle resets exactly at 12:00 AM SGT
✅ Everyone gets same puzzle each day
✅ Seed format is consistent
✅ Difficulty rotates correctly
✅ Streak tracking works
✅ Leaderboard integration works
✅ System works across all timezones

Ready for production! 🚀

