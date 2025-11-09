#!/bin/bash
# Deployment script with database migration

echo "🚀 Deploying Sudoku Mastery..."
echo ""

# Check if PUZZLE_SALT is set
if [ ! -f backend/.env ]; then
  echo "⚠️  WARNING: backend/.env not found!"
  echo "Please create backend/.env with PUZZLE_SALT"
  echo "See backend/.env.example for template"
  exit 1
fi

# Stop containers
echo "🛑 Stopping containers..."
sudo docker compose down

# Rebuild
echo "📦 Rebuilding images..."
sudo docker compose build --no-cache

# Start containers
echo "▶️ Starting containers..."
sudo docker compose up -d

# Wait for backend to be ready
echo "⏳ Waiting for backend to start..."
sleep 5

# Run database migration
echo "🗄️ Running database migration..."
sudo docker exec -it sudoku-backend npx prisma migrate deploy

# Restart to ensure changes are loaded
echo "🔄 Restarting containers..."
sudo docker compose restart

# Wait for restart
sleep 3

# Check status
echo ""
echo "📊 Container Status:"
sudo docker compose ps

echo ""
echo "🧪 Testing API..."
curl -s http://localhost:3011/api/health | jq

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "🌐 Your game is live at: https://sudoku.kyros.party"
echo "🏆 Leaderboard: https://sudoku.kyros.party/leaderboard"
echo ""
echo "📝 Test the name entry feature:"
echo "  1. Visit https://sudoku.kyros.party/casual"
echo "  2. Complete a puzzle"
echo "  3. Enter your name in the modal"
echo "  4. Check the leaderboard!"

