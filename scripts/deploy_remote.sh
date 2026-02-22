#!/bin/bash

# Remote Deployment Script for 'myu' server
# Usage: ./scripts/deploy_remote.sh

SERVER="myu"
REMOTE_DIR="/opt/genealogy"
REPO_URL="https://github.com/JunyuZhan/genealogy.git"

echo "🚀 Starting remote deployment to $SERVER..."

ssh -t $SERVER "bash -c '
  set -e
  
  echo \"📂 Preparing directory: $REMOTE_DIR\"
  # Try creating directory (might need sudo if /opt is root-owned)
  if [ ! -d \"$REMOTE_DIR\" ]; then
    if [ -w /opt ]; then
      mkdir -p $REMOTE_DIR
    else
      echo \"🔑 Sudo access needed to create $REMOTE_DIR\"
      sudo mkdir -p $REMOTE_DIR
      sudo chown \$(whoami) $REMOTE_DIR
    fi
  fi

  # Navigate
  cd $REMOTE_DIR

  # Clone or Pull
  if [ -d \".git\" ]; then
    echo \"📥 Updating existing repository...\"
    git pull origin main
  else
    echo \"📥 Cloning repository...\"
    git clone $REPO_URL .
  fi

  # Check Port
  PORT=3000
  echo \"🔍 Checking port availability...\"
  
  # Helper to check port
  is_port_used() {
    if command -v netstat >/dev/null; then
      netstat -tuln | grep -q \":\$1 \"
    elif command -v ss >/dev/null; then
      ss -tuln | grep -q \":\$1 \"
    else
      # Fallback: try python or just assume free if tools missing
      return 1 
    fi
  }

  if is_port_used \$PORT; then
    echo \"⚠️ Port \$PORT is busy.\"
    PORT=3001
    if is_port_used \$PORT; then
       echo \"⚠️ Port \$PORT is also busy. Trying 3002...\"
       PORT=3002
    fi
  fi
  
  echo \"🎯 Selected Port: \$PORT\"

  # Docker Compose Command Detection
  if docker compose version &>/dev/null; then
    COMPOSE_CMD=\"docker compose\"
  else
    COMPOSE_CMD=\"docker-compose\"
  fi

  # Deploy
  echo \"🐳 Building and starting containers...\"
  
  # Create .env if not exists (for production safety)
  if [ ! -f .env ]; then
    cp .env.example .env 2>/dev/null || touch .env
  fi

  # Pass APP_PORT explicitly inline to ensure it overrides .env
  APP_PORT=\$PORT \$COMPOSE_CMD -f docker-compose.prod.yml down
  APP_PORT=\$PORT \$COMPOSE_CMD -f docker-compose.prod.yml up -d --build

  echo \"\"
  echo \"✅ Deployment Complete!\"
  echo \"🔗 Access URL: http://\$(curl -s ifconfig.me || hostname -I | awk \"{print \$1}\"):\$PORT\"
'"
