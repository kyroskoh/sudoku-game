# 🔐 Setting Up PUZZLE_SALT

## Why This Is Required

**CRITICAL SECURITY FEATURE**: The PUZZLE_SALT prevents players from cheating by reproducing puzzles.

Without salt:
```
❌ Player sees seed: "daily-2025-11-10-easy"
❌ Player generates same puzzle locally
❌ Player solves it offline and cheats
```

With salt:
```
✅ Player sees seed: "daily-2025-11-10-easy" 
✅ Server uses: "salted_a3f7b9c2..." (secret)
✅ Player cannot reproduce puzzle
✅ Cheating prevented!
```

## Quick Setup (5 minutes)

### Step 1: Generate Salt

```bash
# On your server
ssh sudoku@breezehost-jp
cd ~/sudoku-game

# Generate a strong random salt
openssl rand -hex 32

# Copy the output (example):
# 3f8a9b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1
```

### Step 2: Add to .env

```bash
cd backend

# Create or edit .env file
nano .env

# Add these lines (replace with your generated salt):
DATABASE_URL="file:./data/app.sqlite"
PORT=3011
NODE_ENV=production
PUZZLE_SALT="3f8a9b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1"

# Save and exit (Ctrl+X, Y, Enter)
```

### Step 3: Verify

```bash
# Check file exists
ls -la backend/.env

# Verify PUZZLE_SALT is set (don't print value!)
grep -q "PUZZLE_SALT" backend/.env && echo "✅ Set!" || echo "❌ Missing!"
```

### Step 4: Deploy

```bash
cd ~/sudoku-game

# Use deployment script
chmod +x deploy-with-migration.sh
./deploy-with-migration.sh

# Or manual:
sudo docker compose down
sudo docker compose build --no-cache
sudo docker compose up -d
```

## Detailed Setup

### For Development

```bash
# Local development
cd sudoku-game/backend

# Copy example file
cp .env.example .env

# Edit and add your salt
nano .env

# Or quick setup:
echo "PUZZLE_SALT=$(openssl rand -hex 32)" >> .env
```

### For Production

```bash
# On production server
cd ~/sudoku-game/backend

# Generate strong salt
SALT=$(openssl rand -hex 32)

# Create .env if it doesn't exist
cat > .env << EOF
DATABASE_URL="file:./data/app.sqlite"
PORT=3011
NODE_ENV=production
PUZZLE_SALT="$SALT"
EOF

# Verify
cat .env
```

## What Gets Added to .env

```env
# Existing
DATABASE_URL="file:./data/app.sqlite"
PORT=3011
NODE_ENV=production

# NEW - Add this line:
PUZZLE_SALT="your_generated_32_character_hex_string_here"
```

## Important Rules

### ✅ DO:
- Generate a strong random salt (32+ characters)
- Keep it secret (never commit to git)
- Set it once and never change
- Use the same salt across all environments (if multiple servers)
- Document it securely for your team

### ❌ DON'T:
- Use a weak or predictable salt
- Commit `.env` to git
- Change the salt after deployment
- Share it publicly
- Use different salts on different servers

## Verification

### After Deployment

```bash
# Test puzzle generation
curl "http://localhost:3011/api/daily?difficulty=easy&deviceId=test" | jq '.puzzle.seed'

# Should show clean seed (not salted_...)
# Output: "daily-2025-11-10-easy"

# Check logs for "salted" confirmation
sudo docker compose logs backend | grep "salted"
# Should see: "Generating easy puzzle with seed: daily-2025-11-10-easy (salted)"
```

### Test in Browser

Visit: https://sudoku.kyros.party/daily

You should see:
```
📅 Daily - Easy
November 10, 2025
Puzzle: daily-2025-11-10-easy  ← Clean seed displayed
```

## Security Benefits

### What Players See

```
✅ Seed: "daily-2025-11-10-easy"
✅ Puzzle givens: [[0,3,0...]]
✅ Difficulty: easy
```

### What Players Don't See

```
❌ Actual generation seed: "salted_a3f7b9c2..."
❌ PUZZLE_SALT value
❌ Full solution
```

### Result

```
Players can verify puzzle identity (transparency)
BUT cannot reproduce or cheat (security)
Perfect balance! ✅
```

## Troubleshooting

### Issue: "PUZZLE_SALT not set"

```bash
# Check if .env exists
ls backend/.env

# If not, create it
cd backend
nano .env
# Add PUZZLE_SALT line

# Restart
sudo docker compose restart backend
```

### Issue: Different puzzles for same day

**Cause**: PUZZLE_SALT was changed

**Solution**: 
```bash
# Don't change PUZZLE_SALT!
# If changed, all new puzzles will be different

# Restore original salt from backup
# Or keep new salt (but puzzles will be different going forward)
```

### Issue: Backend won't start

```bash
# Check logs
sudo docker compose logs backend | tail -20

# Common issue: Invalid .env format
# Fix: Check for quotes and line breaks in .env
```

## Backup

### Save Salt Securely

```bash
# On server
cat backend/.env | grep PUZZLE_SALT > ~/puzzle-salt-backup.txt

# Store securely (not in git!)
# Options:
# - Password manager
# - Encrypted file
# - Team wiki (access controlled)
# - Cloud secret manager
```

### Restore Salt

```bash
# If .env is lost, restore from backup
cd ~/sudoku-game/backend
echo "PUZZLE_SALT=\"your_backup_salt_here\"" >> .env
```

## Migration from No Salt

If you deployed before salt was added:

### Existing Puzzles

```
Old puzzles (no salt): Still work fine
New puzzles (with salt): More secure
Both coexist peacefully ✅
```

### No Database Changes Needed

```bash
# Just add salt and redeploy
echo "PUZZLE_SALT=$(openssl rand -hex 32)" >> backend/.env
sudo docker compose restart backend

# Done! New puzzles will be salted
```

## Team Documentation

Document for your team (privately):

```markdown
# Sudoku Puzzle Salt

Location: `backend/.env`
Variable: `PUZZLE_SALT`
Value: [Store in team password manager]

## Important
- Never change this value
- Never commit to git
- Required for puzzle generation
- Keep secure and backed up
```

## Quick Reference Card

```bash
# Generate salt
openssl rand -hex 32

# Add to .env
echo "PUZZLE_SALT=<generated-salt>" >> backend/.env

# Verify
grep -q "PUZZLE_SALT" backend/.env && echo "✅" || echo "❌"

# Deploy
sudo docker compose restart backend

# Test
curl "http://localhost:3011/api/daily?difficulty=easy&deviceId=test" | jq
```

## FAQ

### Q: What if I lose the salt?

**A:** Generate a new one. All new puzzles will be different, but existing completed puzzles in the database remain valid. Leaderboards won't be affected.

### Q: Can I use the same salt for dev and production?

**A:** Yes, if you want consistency across environments. Or use different salts - puzzles will be different but that's okay.

### Q: How often should I change the salt?

**A:** **NEVER**! Set it once and keep it forever. Changing breaks consistency.

### Q: What if someone guesses my salt?

**A:** Use a strong 32+ character random string. It's effectively impossible to guess. Even if guessed, they'd need to know the exact salt value, which is never exposed.

### Q: Do all servers need the same salt?

**A:** Only if you want puzzle consistency across servers. For a single server deployment, one unique salt is fine.

## Summary

✅ **What to do:**
1. Generate: `openssl rand -hex 32`
2. Add to `backend/.env`: `PUZZLE_SALT="<value>"`
3. Deploy: `docker compose restart`
4. Never change it

✅ **Result:**
- Puzzles are cheat-proof
- Seeds displayed for transparency
- Fair competition maintained
- Security + transparency achieved!

🔒 **Your puzzles are now secure!** 🎉

