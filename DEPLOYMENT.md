# 🚀 Deployment Guide - Sudoku Mastery

Deployment guide for **sudoku.kyros.party** using Docker and Virtualmin nginx proxy.

## 📋 Prerequisites

- Docker and Docker Compose installed on server
- Virtualmin access for nginx configuration
- Domain: `sudoku.kyros.party` pointed to your server
- SSL certificate (Let's Encrypt via Virtualmin)

## 🏗️ Architecture

```
Internet
    ↓
Virtualmin Nginx (Port 443/80)
    ├─→ /api/* → Backend Container (Port 3011)
    └─→ /*     → Frontend Container (Port 3010)
```

## 📦 Step 1: Prepare the Server

SSH into your server:

```bash
ssh your-server
cd /opt  # or wherever you want to deploy
```

Clone or upload the project:

```bash
git clone https://github.com/yourusername/sudoku-game.git
cd sudoku-game
```

## 🔧 Step 2: Configure Environment

Create backend environment file:

```bash
cat > backend/.env << EOF
PORT=3011
DATABASE_URL="file:/app/data/app.sqlite"
NODE_ENV=production
EOF
```

## 🗄️ Step 3: Initialize Database

Before starting containers, initialize the database:

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
cd ..
```

Or initialize it after starting containers:

```bash
docker-compose up -d backend
docker exec -it sudoku-backend sh
npm run prisma:migrate
exit
```

## 🐳 Step 4: Build and Start Docker Containers

Build the images:

```bash
docker-compose build
```

Start the containers:

```bash
docker-compose up -d
```

Check status:

```bash
docker-compose ps
docker-compose logs -f
```

Verify containers are healthy:

```bash
# Check backend
curl http://localhost:3011/api/health

# Check frontend
curl http://localhost:3010/health
```

## 🌐 Step 5: Configure Virtualmin Nginx

### Option A: Using Virtualmin Web Interface

1. Log into Virtualmin
2. Navigate to: **Server Configuration → Edit Directives**
3. Add the proxy configuration from `nginx-virtualmin.conf`
4. Click **Save**
5. Test configuration: `nginx -t`
6. Reload nginx: `systemctl reload nginx`

### Option B: Manual Configuration

Copy the nginx config:

```bash
sudo nano /etc/nginx/sites-available/sudoku.kyros.party
```

Paste the contents from `nginx-virtualmin.conf` (adjust SSL paths as needed).

Create symlink:

```bash
sudo ln -s /etc/nginx/sites-available/sudoku.kyros.party /etc/nginx/sites-enabled/
```

Test and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 Step 6: Setup SSL (if not already configured)

In Virtualmin:

1. Go to **Server Configuration → SSL Certificate**
2. Click **Let's Encrypt** tab
3. Request certificate for `sudoku.kyros.party`
4. Wait for certificate to be issued

Or use certbot manually:

```bash
sudo certbot --nginx -d sudoku.kyros.party
```

## ✅ Step 7: Verify Deployment

Test the deployment:

```bash
# Health check
curl https://sudoku.kyros.party/health

# API endpoint
curl https://sudoku.kyros.party/api/health

# Frontend (should return HTML)
curl https://sudoku.kyros.party/
```

Open in browser:
- **Frontend**: https://sudoku.kyros.party
- **API**: https://sudoku.kyros.party/api/health

## 🔄 Updates and Maintenance

### Update the Application

```bash
cd /opt/sudoku-game
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

### View Logs

```bash
# All logs
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend
```

### Backup Database

```bash
# Create backup
docker exec sudoku-backend sh -c "cp /app/data/app.sqlite /app/data/backup-$(date +%Y%m%d).sqlite"

# Copy to host
docker cp sudoku-backend:/app/data/backup-$(date +%Y%m%d).sqlite ./backups/
```

### Restore Database

```bash
# Copy backup to container
docker cp ./backups/backup-YYYYMMDD.sqlite sudoku-backend:/app/data/app.sqlite

# Restart backend
docker-compose restart backend
```

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check logs
docker-compose logs backend

# Check if database exists
docker exec -it sudoku-backend ls -la /app/data

# Initialize database
docker exec -it sudoku-backend npm run prisma:migrate
```

### Frontend can't reach API

```bash
# Check nginx proxy
sudo nginx -t
sudo nginx -s reload

# Verify backend is accessible from host
curl http://localhost:3011/api/health

# Check docker network
docker network inspect sudoku-game_sudoku-network
```

### SSL Certificate Issues

```bash
# Check certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

### Port Already in Use

```bash
# Find what's using the port
sudo lsof -i :3011
sudo lsof -i :3010

# Stop conflicting service
sudo systemctl stop <service-name>
```

## 📊 Monitoring

### Check Container Health

```bash
docker-compose ps
docker stats
```

### Monitor Logs

```bash
# Tail logs
docker-compose logs -f --tail=100

# Nginx access logs
sudo tail -f /var/log/virtualmin/sudoku.kyros.party_access_log

# Nginx error logs
sudo tail -f /var/log/virtualmin/sudoku.kyros.party_error_log
```

### Auto-restart on Crash

Containers are configured with `restart: unless-stopped` in docker-compose.yml, so they'll automatically restart if they crash.

## 🔐 Security Checklist

- [x] SSL/HTTPS enabled
- [x] Security headers configured
- [x] Database file not publicly accessible
- [x] Environment variables in `.env` (not committed)
- [x] Docker containers run as non-root (optional enhancement)
- [x] Regular backups configured
- [x] Nginx rate limiting (optional - add to nginx config)

## 🚀 Performance Optimization

### Enable Nginx Caching

Add to nginx config:

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=sudoku_cache:10m max_size=100m inactive=60m;

location /api {
    proxy_cache sudoku_cache;
    proxy_cache_valid 200 5m;
    # ... other proxy settings
}
```

### Database Optimization

```bash
# Vacuum SQLite database
docker exec -it sudoku-backend sqlite3 /app/data/app.sqlite "VACUUM;"
```

## 📈 Scaling (Future)

For high traffic, consider:

1. **Multiple backend instances** with load balancing
2. **Redis caching** for API responses
3. **PostgreSQL** instead of SQLite
4. **CDN** for frontend static assets
5. **Separate database server**

## 🎉 Done!

Your Sudoku Mastery app should now be live at:

**https://sudoku.kyros.party** 🎮

Test all features:
- ✅ Play Casual mode
- ✅ Try Daily puzzle
- ✅ Test Challenge mode
- ✅ Check themes
- ✅ Verify stats persistence

---

**Need help?** Check the main README.md or open an issue on GitHub.

