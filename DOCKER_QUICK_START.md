# 🐳 Docker Quick Start - sudoku.kyros.party

## 🚀 Super Quick Deploy

```bash
# 1. Make scripts executable
chmod +x scripts/*.sh

# 2. Run deployment script
./scripts/deploy.sh

# 3. Configure Virtualmin nginx (see below)

# 4. Access at https://sudoku.kyros.party
```

## 📋 What's Included

- ✅ **Backend Dockerfile** - Node.js API with Prisma
- ✅ **Frontend Dockerfile** - React SPA with Nginx
- ✅ **docker compose.yml** - Orchestration
- ✅ **nginx-virtualmin.conf** - Proxy configuration
- ✅ **deploy.sh** - Automated deployment script
- ✅ **backup.sh** - Database backup script

## 🏗️ Architecture

```
                    Internet
                       ↓
        ┌──────────────────────────┐
        │  Virtualmin Nginx Proxy  │
        │   sudoku.kyros.party     │
        │      (Port 443/80)       │
        └──────────────────────────┘
                       ↓
         ┌─────────────┴─────────────┐
         ↓                           ↓
┌─────────────────┐         ┌─────────────────┐
│  Frontend       │         │  Backend API    │
│  Container      │         │  Container      │
│  Port: 3010     │←────────│  Port: 3011     │
│  (React + Nginx)│         │  (Node + SQLite)│
└─────────────────┘         └─────────────────┘
```

## 📝 Step-by-Step Deployment

### 1️⃣ On Your Local Machine (Development Test)

```bash
# Clone the repo (if not already)
cd sudoku-game

# Create backend .env
cat > backend/.env << 'EOF'
PORT=3011
DATABASE_URL="file:/app/data/app.sqlite"
NODE_ENV=production
EOF

# Build and start
docker compose up -d

# Check status
docker compose ps
docker compose logs -f

# Test locally
curl http://localhost:3011/api/health  # Should return {"status":"ok"}
curl http://localhost:3010/health      # Should return "OK"

# Open browser: http://localhost:3010
```

### 2️⃣ On Your Server (Production)

```bash
# SSH to server
ssh your-server

# Navigate to deployment location
cd /opt  # or your preferred location

# Clone repository
git clone https://github.com/kyroskoh/sudoku-game.git
cd sudoku-game

# Make scripts executable
chmod +x scripts/*.sh

# Run deployment
./scripts/deploy.sh

# The script will:
# - Create .env file
# - Build Docker images
# - Start containers
# - Initialize database
# - Test endpoints
```

### 3️⃣ Configure Virtualmin Nginx

**Option A: Via Virtualmin UI**

1. Login to Virtualmin
2. Select your virtual server for `sudoku.kyros.party`
3. Go to: **Services → Configure Website**
4. Click **Edit Directives** (or **Nginx Configuration**)
5. Copy contents from `nginx-virtualmin.conf`
6. Adjust SSL certificate paths if needed
7. Click **Save**
8. Test: `sudo nginx -t`
9. Reload: `sudo systemctl reload nginx`

**Option B: Manual Configuration**

```bash
# Copy nginx config
sudo nano /etc/nginx/sites-available/sudoku.kyros.party

# Paste contents from nginx-virtualmin.conf
# Adjust SSL certificate paths for your Virtualmin setup

# Enable site
sudo ln -s /etc/nginx/sites-available/sudoku.kyros.party /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 4️⃣ Setup SSL Certificate

```bash
# Using Virtualmin's Let's Encrypt
# In Virtualmin UI:
# Server Configuration → SSL Certificate → Let's Encrypt

# Or using certbot manually:
sudo certbot --nginx -d sudoku.kyros.party
```

### 5️⃣ Verify Deployment

```bash
# Test endpoints
curl https://sudoku.kyros.party/health
curl https://sudoku.kyros.party/api/health

# Open in browser
# https://sudoku.kyros.party
```

## 🔧 Common Commands

```bash
# View logs
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend

# Restart services
docker compose restart
docker compose restart backend
docker compose restart frontend

# Stop all
docker compose down

# Start all
docker compose up -d

# Rebuild after code changes
docker compose down
docker compose build --no-cache
docker compose up -d

# Check container status
docker compose ps
docker stats

# Access container shell
docker exec -it sudoku-backend sh
docker exec -it sudoku-frontend sh

# View container logs
docker logs sudoku-backend
docker logs sudoku-frontend
```

## 💾 Backup & Restore

### Backup Database

```bash
# Run backup script
./scripts/backup.sh

# Backups stored in: ./backups/
# Format: sudoku_backup_YYYYMMDD_HHMMSS.sqlite
```

### Restore Database

```bash
# Stop backend
docker compose stop backend

# Copy backup to container
docker cp ./backups/sudoku_backup_20251109_120000.sqlite sudoku-backend:/app/data/app.sqlite

# Start backend
docker compose start backend
```

## 🔄 Update Application

```bash
# Pull latest code
git pull

# Redeploy
./scripts/deploy.sh

# Or manually:
docker compose down
docker compose build --no-cache
docker compose up -d
```

## 🐛 Troubleshooting

### Container won't start

```bash
# Check logs
docker compose logs backend
docker compose logs frontend

# Check if ports are in use
sudo lsof -i :3010
sudo lsof -i :3011

# Remove and rebuild
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

### Database issues

```bash
# Initialize database
docker exec -it sudoku-backend sh
npx prisma migrate deploy
exit

# Or reset database (WARNING: deletes all data)
rm -rf backend/data/app.sqlite
docker compose restart backend
docker exec -it sudoku-backend npx prisma migrate deploy
```

### Can't access from domain

```bash
# Check nginx config
sudo nginx -t

# Check if containers are running
docker compose ps

# Check if ports are accessible from host
curl http://localhost:3011/api/health
curl http://localhost:3010/health

# Check nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Frontend shows 404 for API calls

```bash
# Check nginx proxy configuration
# Ensure /api location block points to http://localhost:3011

# Test API directly
curl http://localhost:3011/api/health

# Check frontend environment
docker exec -it sudoku-frontend cat /etc/nginx/conf.d/default.conf
```

## 📊 Monitoring

### Health Checks

```bash
# Backend health
curl https://sudoku.kyros.party/api/health

# Frontend health
curl https://sudoku.kyros.party/health

# Check Docker health status
docker compose ps
```

### View Logs

```bash
# Real-time logs
docker compose logs -f

# Last 100 lines
docker compose logs --tail=100

# Nginx access logs (via Virtualmin)
sudo tail -f /var/log/virtualmin/sudoku.kyros.party_access_log

# Nginx error logs
sudo tail -f /var/log/virtualmin/sudoku.kyros.party_error_log
```

## 🎯 Production Checklist

Before going live:

- [ ] Backend .env file created with production values
- [ ] Database initialized with `prisma migrate deploy`
- [ ] Docker containers running (`docker compose ps`)
- [ ] Health endpoints responding (backend & frontend)
- [ ] Nginx configuration added to Virtualmin
- [ ] SSL certificate installed and working
- [ ] Domain resolves to server IP
- [ ] Test all game modes (Casual, Daily, Challenge)
- [ ] Verify data persistence (play a game, refresh page)
- [ ] Setup automatic backups (cron job)
- [ ] Configure firewall (allow 80, 443; block 3010, 3011 from external)

## 🔒 Security Notes

```bash
# Ensure Docker containers can only be accessed locally
# Add to firewall (if using ufw):
sudo ufw allow 80
sudo ufw allow 443
sudo ufw deny 3010
sudo ufw deny 3011

# Or with iptables:
sudo iptables -A INPUT -p tcp --dport 3010 -s localhost -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 3010 -j DROP
sudo iptables -A INPUT -p tcp --dport 3011 -s localhost -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 3011 -j DROP
```

## 🚀 You're Done!

Visit **https://sudoku.kyros.party** and enjoy your Sudoku game! 🎮

For detailed documentation, see:
- `DEPLOYMENT.md` - Full deployment guide
- `README.md` - Project overview
- `nginx-virtualmin.conf` - Complete nginx configuration

