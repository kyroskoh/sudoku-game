# 🚀 Deployment Checklist

## Pre-Deployment

### 1. Set Environment Variables

**CRITICAL: Set PUZZLE_SALT before first deployment!**

```bash
cd ~/sudoku-game/backend

# Create .env file if it doesn't exist
cp .env.example .env

# Generate a strong random salt
openssl rand -hex 32

# Edit .env and add the salt
nano .env
```

Add to `.env`:
```env
DATABASE_URL="file:./data/app.sqlite"
PORT=3011
NODE_ENV=production

# IMPORTANT: Change this to your generated salt!
PUZZLE_SALT="your_generated_random_salt_here"
```

### 2. Verify .env File

```bash
# Check .env exists
ls -la backend/.env

# Verify PUZZLE_SALT is set (don't print the value!)
grep -q "PUZZLE_SALT" backend/.env && echo "✅ PUZZLE_SALT is set" || echo "❌ PUZZLE_SALT missing!"
```

### 3. Check .gitignore

```bash
# Ensure .env is NOT committed
git check-ignore backend/.env
# Should output: backend/.env

# If not, add to .gitignore:
echo "backend/.env" >> .gitignore
```

## Deployment Steps

### Quick Deploy

```bash
chmod +x deploy-with-migration.sh
./deploy-with-migration.sh
```

### Manual Deploy

```bash
# 1. Pull latest code
git pull

# 2. Stop services
sudo docker compose down

# 3. Rebuild images
sudo docker compose build --no-cache

# 4. Start services
sudo docker compose up -d

# 5. Run migrations
sleep 5
sudo docker exec -it sudoku-backend npx prisma migrate deploy

# 6. Restart to ensure changes loaded
sudo docker compose restart

# 7. Check status
sudo docker compose ps
```

## Post-Deployment

### 1. Verify Services

```bash
# Check containers are running
sudo docker compose ps
# Both should show "Up"

# Check backend health
curl http://localhost:3011/api/health
# Should return: {"status":"ok","timestamp":"..."}

# Check frontend health
curl http://localhost:3010/health
# Should return OK or index.html
```

### 2. Test Daily Puzzle

```bash
# Test daily puzzle generation
curl "http://localhost:3011/api/daily?difficulty=easy&deviceId=test" | jq '.puzzle.seed'
# Should return: "daily-YYYY-MM-DD-easy"

# Check seed is displayed (not salted)
curl "http://localhost:3011/api/daily?difficulty=easy&deviceId=test" | jq '.puzzle.seed' | grep -q "salted_"
# Should NOT contain "salted_" (that's internal only)
```

### 3. Check Logs

```bash
# Check for errors
sudo docker compose logs backend --tail=50 | grep -i error

# Check puzzle generation logs
sudo docker compose logs backend | grep "Daily Puzzle"
# Should see: [Daily Puzzle] Generating ... (salted)
```

### 4. Verify SSL

```bash
# Test HTTPS
curl -I https://sudoku.kyros.party
# Should return 200 OK

# Test API through proxy
curl https://sudoku.kyros.party/api/health | jq
# Should return: {"status":"ok","timestamp":"..."}
```

### 5. Test Frontend

Visit in browser:
- https://sudoku.kyros.party
- https://sudoku.kyros.party/casual
- https://sudoku.kyros.party/daily
- https://sudoku.kyros.party/challenge
- https://sudoku.kyros.party/leaderboard

Check:
- [ ] Pages load correctly
- [ ] Difficulty selection works
- [ ] Puzzles generate
- [ ] Seeds are displayed
- [ ] Leaderboard shows data
- [ ] Name entry modal appears

## Security Checklist

### Environment Variables

- [ ] `PUZZLE_SALT` is set in backend/.env
- [ ] `PUZZLE_SALT` is NOT in git
- [ ] `PUZZLE_SALT` is strong (32+ characters)
- [ ] `PUZZLE_SALT` is documented privately for team

### Database

- [ ] Database file permissions correct
- [ ] Migrations applied successfully
- [ ] Backups configured (if needed)

### Network

- [ ] Nginx SSL certificate valid
- [ ] HTTP redirects to HTTPS
- [ ] CORS configured correctly
- [ ] Ports not exposed publicly (except 80/443)

## Rollback Plan

If deployment fails:

```bash
# 1. Check what went wrong
sudo docker compose logs backend --tail=100
sudo docker compose logs frontend --tail=100

# 2. Rollback to previous version
git log --oneline -5
git reset --hard <previous-commit>

# 3. Redeploy
sudo docker compose down
sudo docker compose build --no-cache
sudo docker compose up -d

# 4. Verify services
sudo docker compose ps
curl http://localhost:3011/api/health
```

## Troubleshooting

### Issue: Backend won't start

```bash
# Check logs
sudo docker compose logs backend

# Common causes:
# - PUZZLE_SALT not set → Set in .env
# - Database locked → Restart container
# - Port conflict → Check ports with `netstat -tulpn`
```

### Issue: Puzzles won't generate

```bash
# Check if PUZZLE_SALT is set
sudo docker exec sudoku-backend sh -c 'echo $PUZZLE_SALT'

# If empty, set in .env and restart
sudo docker compose restart backend
```

### Issue: Different puzzles for same seed

```bash
# Check if PUZZLE_SALT changed
# (Don't change PUZZLE_SALT once set!)

# Check logs
sudo docker compose logs backend | grep "Generating"
```

## Monitoring

### Regular Checks

```bash
# Daily health check
curl https://sudoku.kyros.party/api/health

# Check container status
sudo docker compose ps

# Check disk space
df -h

# Check database size
du -h backend/data/app.sqlite
```

### Metrics to Track

- Response times
- Error rates
- Daily active users
- Puzzle completions
- Leaderboard entries

## Backup

### Database Backup

```bash
# Backup database
cp backend/data/app.sqlite backend/data/app.sqlite.backup.$(date +%Y%m%d)

# Automated backup (cron)
0 2 * * * cd ~/sudoku-game && cp backend/data/app.sqlite backend/data/backups/app.sqlite.$(date +\%Y\%m\%d)
```

### Configuration Backup

```bash
# Backup .env (store securely!)
cp backend/.env backend/.env.backup
# Store in secure location (not in git!)

# Backup nginx config
sudo cp /etc/nginx/sites-available/sudoku.kyros.party nginx-virtualmin.conf.backup
```

## Success Criteria

Deployment is successful when:

- ✅ All containers running (`docker compose ps`)
- ✅ Health endpoint returns OK
- ✅ Frontend loads at https://sudoku.kyros.party
- ✅ Daily puzzles generate correctly
- ✅ Seeds displayed in UI
- ✅ Leaderboards work
- ✅ Name entry works
- ✅ No errors in logs
- ✅ SSL certificate valid
- ✅ All game modes functional

## Documentation

After deployment, update:

- [ ] Version number
- [ ] Changelog
- [ ] Known issues
- [ ] Configuration changes
- [ ] Team notification

## Support

If issues persist:

1. Check logs: `sudo docker compose logs`
2. Review documentation in repo
3. Test locally first: `npm run dev`
4. Check Nginx configuration
5. Verify SSL certificates

## Quick Reference

```bash
# Status
sudo docker compose ps

# Logs (all)
sudo docker compose logs -f

# Logs (backend only)
sudo docker compose logs -f backend

# Restart services
sudo docker compose restart

# Rebuild
sudo docker compose build --no-cache && sudo docker compose up -d

# Stop
sudo docker compose down

# Full reset (DANGEROUS!)
sudo docker compose down -v
rm -rf backend/data/app.sqlite
# Then redeploy
```

## Environment Variables Reference

### backend/.env

```env
# Database
DATABASE_URL="file:./data/app.sqlite"

# Server
PORT=3011
NODE_ENV=production

# Security (REQUIRED!)
PUZZLE_SALT="your_secret_random_salt_here"
```

### Important Notes

- **PUZZLE_SALT**: MUST be set before first deployment
- **PUZZLE_SALT**: MUST be consistent (don't change)
- **PUZZLE_SALT**: MUST be kept secret
- **PUZZLE_SALT**: MUST be strong (32+ chars recommended)

## 🎉 Deployment Complete!

Once all checks pass, your Sudoku Mastery game is live and secure!

Visit: https://sudoku.kyros.party 🎮✨

