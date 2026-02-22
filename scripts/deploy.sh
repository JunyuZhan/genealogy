#!/bin/bash

# Deploy script for Linux Servers (VPS)
# Usage: ./deploy.sh

echo "🚀 Starting deployment..."

# 1. Check for Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "⚠️ docker-compose not found, trying 'docker compose'..."
    if ! docker compose version &> /dev/null; then
         echo "❌ Docker Compose not found. Please install it."
         exit 1
    fi
    DOCKER_COMPOSE_CMD="docker compose"
else
    DOCKER_COMPOSE_CMD="docker-compose"
fi

# 2. Update Code
echo "📥 Pulling latest code..."
git pull origin main

# 3. Build and Start
echo "🏗️ Building and starting containers..."
$DOCKER_COMPOSE_CMD -f docker-compose.prod.yml down
$DOCKER_COMPOSE_CMD -f docker-compose.prod.yml up -d --build

# 4. Check Status
if [ $? -eq 0 ]; then
    echo "✅ Deployment successful! App is running on port 3000."
    $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml ps
else
    echo "❌ Deployment failed."
    exit 1
fi
