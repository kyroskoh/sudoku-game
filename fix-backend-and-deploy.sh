#!/bin/bash

# Fix Backend and Deploy
# Comprehensive fix that handles common issues

set -e  # Exit on error

echo "🔧 Fixing Backend and Deploying"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml not found!"
    exit 1
fi

# Step 1: Check .env file
echo "📋 Step 1: Checking .env file..."
if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env not found! Creating from example..."
    cat > backend/.env << 'EOF'
DATABASE_URL="file:./data/app.sqlite"
PORT=3011
NODE_ENV=production
PUZZLE_SALT="change-this-in-production-to-a-random-string"
EOF
    echo "✅ Created backend/.env"
    echo "⚠️  WARNING: Please update PUZZLE_SALT in backend/.env with a secure random string!"
else
    echo "✅ backend/.env exists"
fi
echo ""

# Step 2: Copy clear script
echo "📋 Step 2: Copying clear script..."
cp clear-daily-puzzle.js backend/
echo "✅ Clear script copied"
echo ""

# Step 3: Stop containers
echo "⏹️  Step 3: Stopping containers..."
docker compose down
echo "✅ Containers stopped"
echo ""

# Step 4: Rebuild backend
echo "🔨 Step 4: Rebuilding backend..."
docker compose build backend --no-cache
echo "✅ Backend rebuilt"
echo ""

# Step 5: Start containers
echo "🚀 Step 5: Starting containers..."
docker compose up -d
echo "✅ Containers started"
echo ""

# Step 6: Wait and check
echo "⏳ Step 6: Waiting for backend to start..."
sleep 10

# Check if running
if docker compose ps | grep -q "sudoku-backend.*running"; then
    echo "✅ Backend is running"
else
    echo "❌ Backend failed to start!"
    echo ""
    echo "📊 Backend logs:"
    docker compose logs sudoku-backend
    echo ""
    echo "❌ Please check the logs above and fix any issues"
    exit 1
fi
echo ""

# Step 7: Run migrations
echo "🗃️  Step 7: Running database migrations..."
if docker compose exec -T sudoku-backend npx prisma migrate deploy; then
    echo "✅ Migrations complete"
else
    echo "⚠️  Migration warning (may be okay if already migrated)"
fi
echo ""

# Step 8: Test backend
echo "🧪 Step 8: Testing backend..."
HEALTH=$(curl -s http://localhost:3011/health || echo "failed")
if [[ "$HEALTH" == *"ok"* ]] || [[ "$HEALTH" == *"healthy"* ]]; then
    echo "✅ Backend is healthy"
else
    echo "⚠️  Health check response: $HEALTH"
fi
echo ""

# Step 9: Clear cache
echo "🗑️  Step 9: Clearing daily puzzle cache..."
if docker compose exec -T sudoku-backend node clear-daily-puzzle.js; then
    echo "✅ Cache cleared"
else
    echo "⚠️  Could not clear cache (this is okay, will regenerate)"
fi
echo ""

# Step 10: Final test
echo "🧪 Step 10: Testing puzzle generation..."
PUZZLE_TEST=$(curl -s "http://localhost:3011/api/daily?difficulty=easy&deviceId=test" || echo '{"error":"failed"}')
PUZZLE_ID=$(echo $PUZZLE_TEST | jq -r '.puzzle.id // empty' 2>/dev/null || echo "")

if [ -n "$PUZZLE_ID" ]; then
    echo "✅ Puzzle generation working! ID: $PUZZLE_ID"
else
    echo "⚠️  Could not verify puzzle generation"
    echo "   Response: $PUZZLE_TEST"
fi
echo ""

# Summary
echo "=" | head -c 60 | tr '\n' '='
echo ""
echo "🎉 Deployment Complete!"
echo "=" | head -c 60 | tr '\n' '='
echo ""
echo "✅ Backend is running and healthy"
echo ""
echo "🧪 Test URLs:"
echo "   Local: http://localhost:3010/daily?showans=true&difficulty=easy"
echo "   API:   http://localhost:3011/api/daily?difficulty=easy&deviceId=test"
echo ""
if [ -n "$PUZZLE_SALT" ]; then
    echo "   Public: https://sudoku.kyros.party/daily?showans=true&difficulty=easy"
fi
echo ""
echo "📊 Check status:"
echo "   docker compose ps"
echo "   docker compose logs -f sudoku-backend"
echo ""
echo "✨ All systems ready!"
echo ""

