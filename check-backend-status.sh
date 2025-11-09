#!/bin/bash

# Check Backend Status
# Diagnose why backend container is not running

echo "🔍 Checking Backend Status"
echo "=========================="
echo ""

echo "📦 Container Status:"
docker compose ps sudoku-backend
echo ""

echo "📊 Recent Logs (last 50 lines):"
echo "--------------------------------"
docker compose logs --tail=50 sudoku-backend
echo ""

echo "🔍 Container Details:"
docker ps -a | grep sudoku-backend || echo "Container not found"
echo ""

echo "💡 Next Steps:"
echo "   1. Check logs above for errors"
echo "   2. Common issues:"
echo "      - Missing .env file"
echo "      - Database migration needed"
echo "      - Port already in use"
echo "      - Node modules not installed"
echo ""

