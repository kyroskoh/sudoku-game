#!/bin/bash
# Quick fix for database initialization

echo "🔍 Checking backend status..."
sudo docker compose ps backend

echo ""
echo "📋 Checking backend logs..."
sudo docker compose logs backend --tail=20

echo ""
echo "🗄️ Initializing database..."
sudo docker exec -it sudoku-backend npx prisma migrate deploy

echo ""
echo "🔄 Restarting backend..."
sudo docker compose restart backend

echo ""
echo "⏳ Waiting for backend to start..."
sleep 3

echo ""
echo "🧪 Testing API..."
curl http://localhost:3011/api/health
echo ""
echo ""
curl "http://localhost:3011/api/puzzles?mode=casual&difficulty=easy"
echo ""
echo ""
echo "✅ Done! If you see puzzle data above, it's working!"

