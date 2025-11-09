#!/bin/bash
echo "🚀 Starting deployment..."
sudo docker compose down
echo "📦 Building images without cache (this will take 5-15 minutes)..."
sudo docker compose build --no-cache
echo "🎬 Starting containers..."
sudo docker compose up -d
echo "⏳ Waiting for backend to start..."
sleep 10
echo "🗃️  Running database migrations..."
sudo docker exec sudoku-backend npx prisma migrate deploy
echo "✅ Migrations complete!"
echo ""
echo "✅ Deployment complete! Status:"
sudo docker compose ps
echo ""
echo "🧪 Test URLs:"
echo "   Frontend: https://sudoku.kyros.party"
echo "   Backend Health: https://sudoku.kyros.party/api/health"
echo ""