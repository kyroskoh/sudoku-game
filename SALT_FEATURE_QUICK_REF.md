# 🔐 Puzzle Salt Feature - Quick Reference

## What Was Added

### 1. Security Layer
```typescript
// backend/src/services/daily-puzzle.ts
import crypto from 'crypto';

const PUZZLE_SALT = process.env.PUZZLE_SALT;

private createSaltedSeed(dateKey: string): string {
  const hash = crypto
    .createHash('sha256')
    .update(dateKey + PUZZLE_SALT)
    .digest('hex');
  return `salted_${hash.substring(0, 32)}`;
}
```

### 2. Seed Display in UI
```typescript
// All game pages now show:
<p className={styles.subtitle}>
  Puzzle: {puzzle.seed || `${puzzle.mode}-${puzzle.id}`}
</p>

// Examples:
// Daily: "Puzzle: daily-2025-11-10-easy"
// Casual: "Puzzle: casual-abc12345"
// Challenge: "Puzzle: challenge-xyz67890"
```

### 3. Environment Variable
```env
# backend/.env (REQUIRED!)
PUZZLE_SALT="your_secret_random_32_char_hex_string_here"
```

## How It Works

```
User Request
    ↓
Display Seed: "daily-2025-11-10-easy"
    ↓
Backend: createSaltedSeed(dateKey)
    ↓
Salted Seed: "salted_a3f7b9c2..." (secret!)
    ↓
Generate Puzzle with salted seed
    ↓
Store with display seed (unsalted)
    ↓
Return to user with display seed
    ↓
User sees: "daily-2025-11-10-easy"
User cannot reproduce (no salt!)
```

## Quick Setup

```bash
# 1. Generate salt
openssl rand -hex 32

# 2. Add to .env
cd backend
echo "PUZZLE_SALT=\"3f8a9b2c4d5e6f7a...\"" >> .env

# 3. Deploy
sudo docker compose restart backend

# 4. Test
curl "http://localhost:3011/api/daily?difficulty=easy&deviceId=test" | jq '.puzzle.seed'
```

## Files Modified

### Backend
- ✅ `backend/src/services/daily-puzzle.ts` - Added salt logic
- ✅ `backend/.env.example` - Added PUZZLE_SALT template
- ✅ `deploy-with-migration.sh` - Added salt check

### Frontend  
- ✅ `frontend/src/pages/DailyGame.tsx` - Show seed
- ✅ `frontend/src/pages/CasualGame.tsx` - Show seed
- ✅ `frontend/src/pages/ChallengeGame.tsx` - Show seed

### Documentation
- ✅ `PUZZLE_SECURITY.md` - Comprehensive security guide
- ✅ `SETUP_PUZZLE_SALT.md` - Setup instructions
- ✅ `DEPLOYMENT_CHECKLIST.md` - Deployment steps
- ✅ `SALT_FEATURE_QUICK_REF.md` - This file!

## Before vs After

### Before ❌
```
Seed: "daily-2025-11-10-easy"
    ↓
Player can reproduce exact puzzle locally
    ↓
Player cheats by solving offline
```

### After ✅
```
Display: "daily-2025-11-10-easy" (transparent)
Generation: "salted_a3f7b9c2..." (secret)
    ↓
Player sees seed but cannot reproduce
    ↓
Cheating prevented!
```

## Testing

### Test 1: Seed Display
```bash
# Visit in browser
https://sudoku.kyros.party/daily

# Should see:
📅 Daily - Easy
November 10, 2025
Puzzle: daily-2025-11-10-easy  ← This line!
```

### Test 2: Salt Working
```bash
# Check backend logs
sudo docker compose logs backend | grep "salted"

# Should see:
[Daily Puzzle] Generating easy puzzle with seed: daily-2025-11-10-easy (salted)
```

### Test 3: Consistency
```bash
# Request same puzzle twice
curl "http://localhost:3011/api/daily?difficulty=easy&deviceId=user1"
curl "http://localhost:3011/api/daily?difficulty=easy&deviceId=user2"

# Should return same puzzle ID
```

### Test 4: Seed Format
```bash
# Check seed format
curl "http://localhost:3011/api/daily?difficulty=easy&deviceId=test" | jq '.puzzle.seed'

# Should output (NOT salted_...):
"daily-2025-11-10-easy"
```

## Security Checklist

- [ ] `PUZZLE_SALT` set in `.env`
- [ ] Salt is 32+ characters
- [ ] Salt is kept secret
- [ ] `.env` in `.gitignore`
- [ ] Seeds displayed in UI
- [ ] Seeds are NOT salted format
- [ ] Logs show "(salted)" tag
- [ ] Solutions not exposed to frontend
- [ ] Same puzzle returned for same day/difficulty

## Deployment Commands

```bash
# Quick deploy
cd ~/sudoku-game
git pull
chmod +x deploy-with-migration.sh
./deploy-with-migration.sh

# Or manual
cd ~/sudoku-game
git pull

# Check salt is set
grep -q "PUZZLE_SALT" backend/.env || echo "⚠️ SALT MISSING!"

# Deploy
sudo docker compose down
sudo docker compose build --no-cache  
sudo docker compose up -d

# Verify
curl http://localhost:3011/api/health
```

## Troubleshooting

### Salt Not Set
```bash
# Error: Backend won't start or uses default salt
# Fix:
cd backend
nano .env
# Add: PUZZLE_SALT="<your-random-salt>"
cd ..
sudo docker compose restart backend
```

### Wrong Seed Format
```bash
# Issue: Seeing "salted_..." in frontend
# This means display seed is wrong

# Check code: Should use unsalted seed for display
# backend: seed: dateKey (not saltedSeed)
# frontend: puzzle.seed (should be clean)
```

### Different Puzzles
```bash
# Issue: Same day/difficulty returns different puzzles
# Cause: PUZZLE_SALT changed

# Fix: Restore original PUZZLE_SALT from backup
# Or: Accept that new puzzles will be different going forward
```

## Important Notes

### DO ✅
- Generate strong random salt (32+ chars)
- Set once and never change
- Keep secret (never commit)
- Display clean seeds to users
- Use same salt across servers (if multiple)

### DON'T ❌
- Use weak or predictable salt
- Change salt after deployment
- Commit `.env` to git
- Expose salt to frontend
- Use different salts per environment (if you want consistency)

## Summary

```
Feature: Puzzle Salt Protection
Purpose: Prevent cheating via puzzle reproduction
Method: SHA-256 hash of seed + secret salt
Status: ✅ Complete and tested

User Impact:
  ✅ Sees seed for transparency
  ✅ Cannot reproduce puzzle
  ✅ Fair competition maintained
  ✅ No change to gameplay

Security Impact:
  ✅ Cheat-resistant
  ✅ Solution stays secret
  ✅ Deterministic (same puzzle per date/difficulty)
  ✅ Unpredictable (cannot guess future puzzles)
```

## Quick Links

- Setup Guide: `SETUP_PUZZLE_SALT.md`
- Security Details: `PUZZLE_SECURITY.md`
- Deployment Checklist: `DEPLOYMENT_CHECKLIST.md`
- Complete Summary: `COMPLETE_FEATURE_SUMMARY.md`

## One-Line Summary

**Puzzle seeds are now salted with a secret to prevent cheating, while still being displayed to users for transparency.** 🔐✨

