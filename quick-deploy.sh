#!/bin/bash
echo "🚀 Starting deployment..."
sudo docker compose down
echo "📦 Building images (this will take 5-15 minutes)..."
sudo docker compose build
echo "🎬 Starting containers..."
sudo docker compose up -d
echo "✅ Done! Check status:"
sudo docker compose ps