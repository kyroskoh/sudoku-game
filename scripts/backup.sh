#!/bin/bash
# Backup script for Sudoku Mastery database

set -e

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="sudoku_backup_${DATE}.sqlite"

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "🗄️  Creating database backup..."

# Check if container is running
if ! docker ps | grep -q sudoku-backend; then
    echo "❌ Backend container is not running"
    exit 1
fi

# Create backup
docker exec sudoku-backend sh -c "cp /app/data/app.sqlite /app/data/${BACKUP_FILE}"

# Copy to host
docker cp "sudoku-backend:/app/data/${BACKUP_FILE}" "${BACKUP_DIR}/${BACKUP_FILE}"

# Remove from container
docker exec sudoku-backend sh -c "rm /app/data/${BACKUP_FILE}"

echo "✅ Backup created: ${BACKUP_DIR}/${BACKUP_FILE}"

# Keep only last 7 backups
cd "$BACKUP_DIR"
ls -t sudoku_backup_*.sqlite | tail -n +8 | xargs -r rm
echo "🧹 Cleaned old backups (keeping last 7)"

echo "📊 Current backups:"
ls -lh sudoku_backup_*.sqlite

