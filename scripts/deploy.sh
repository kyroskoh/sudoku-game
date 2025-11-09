#!/bin/bash
# Deployment script for Sudoku Mastery

set -e

echo "🚀 Deploying Sudoku Mastery..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if docker and docker-compose are installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi

# Create backend .env if it doesn't exist
if [ ! -f backend/.env ]; then
    echo -e "${YELLOW}⚠️  Creating backend/.env file...${NC}"
    cat > backend/.env << EOF
PORT=3011
DATABASE_URL="file:/app/data/app.sqlite"
NODE_ENV=production
EOF
    echo -e "${GREEN}✅ Created backend/.env${NC}"
fi

# Create data directory
mkdir -p backend/data

# Pull latest changes (if using git)
if [ -d .git ]; then
    echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
    git pull
fi

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose down

# Build images
echo -e "${YELLOW}🏗️  Building Docker images...${NC}"
docker-compose build --no-cache

# Start containers
echo -e "${YELLOW}🚀 Starting containers...${NC}"
docker-compose up -d

# Wait for backend to be healthy
echo -e "${YELLOW}⏳ Waiting for backend to be ready...${NC}"
sleep 5

# Initialize database if needed
echo -e "${YELLOW}🗄️  Checking database...${NC}"
docker exec sudoku-backend sh -c "npx prisma migrate deploy" || echo "Migration already applied or failed"

# Check container status
echo -e "${YELLOW}📊 Container status:${NC}"
docker-compose ps

# Test endpoints
echo -e "${YELLOW}🧪 Testing endpoints...${NC}"
sleep 2

BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3011/api/health)
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3010/health)

if [ "$BACKEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Backend is healthy (Status: $BACKEND_STATUS)${NC}"
else
    echo -e "${RED}❌ Backend check failed (Status: $BACKEND_STATUS)${NC}"
fi

if [ "$FRONTEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Frontend is healthy (Status: $FRONTEND_STATUS)${NC}"
else
    echo -e "${RED}❌ Frontend check failed (Status: $FRONTEND_STATUS)${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "📍 Access your application at:"
echo "   Frontend: http://localhost:3010"
echo "   Backend:  http://localhost:3011"
echo "   Domain:   https://sudoku.kyros.party (after nginx setup)"
echo ""
echo "📝 View logs with: docker-compose logs -f"
echo "🛑 Stop with: docker-compose down"

