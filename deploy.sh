#!/bin/bash

# ArcheryTracker.io Application Deployment Script
# This script generates a .env file and deploys the application using Docker

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== ArcheryTracker.io Deployment Script ===${NC}"
echo "This script will set up your environment and deploy the application."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose plugin is not installed or not working. Please install Docker Compose first.${NC}"
    exit 1
fi

# Port selection for frontend
echo -e "\n${GREEN}Port Configuration${NC}"
echo "Choose a port for the frontend application:"
echo "1) Use suggested default port (8080)"
echo "2) Generate a random port"
echo "3) Use port 80 (WARNING: May cause conflicts)"

read -p "Enter your choice (1-3): " PORT_CHOICE

case $PORT_CHOICE in
    1)
        PORT=8080
        ;;
    2)
        PORT=$((8080 + RANDOM % 1920))  # Generates random port between 8080-9999
        ;;
    3)
        PORT=80
        echo -e "${RED}WARNING: Port 80 may cause conflicts with existing applications!${NC}"
        ;;
    *)
        echo -e "${RED}Invalid choice. Using default port 8080.${NC}"
        PORT=8080
        ;;
esac

echo -e "${GREEN}Selected frontend port: ${PORT}${NC}"

# Function to generate a random string for secrets
generate_secret() {
    local length=$1
    cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w $length | head -n 1
}

# Create the backend/.env file if it doesn't exist
if [ -f backend/.env ]; then
    echo -e "${YELLOW}A .env file already exists. Using existing configuration.${NC}"
else
    echo -e "${GREEN}Generating new .env file...${NC}"
    
    # Generate a secure JWT secret
    JWT_SECRET=$(generate_secret 32)
    
    # Collect email configuration
    echo -e "\n${YELLOW}Email Configuration${NC}"
    echo "This information is needed for sending password reset emails and notifications."
    
    # Default values
    DEFAULT_EMAIL_SERVICE="smtp"
    DEFAULT_EMAIL_HOST="smtp.example.com"
    DEFAULT_EMAIL_PORT="587"
    DEFAULT_EMAIL_SECURE="false"
    DEFAULT_EMAIL_USERNAME="your_email@example.com"
    DEFAULT_EMAIL_PASSWORD="your_password"
    DEFAULT_EMAIL_FROM="noreply@archeryscoretracker.com"
    
    # Get email configuration from user
    read -p "Email Service Type (smtp/gmail, default: smtp): " EMAIL_SERVICE
    EMAIL_SERVICE=${EMAIL_SERVICE:-$DEFAULT_EMAIL_SERVICE}
    
    if [[ $EMAIL_SERVICE == "smtp" ]]; then
        read -p "SMTP Host (default: smtp.example.com): " EMAIL_HOST
        EMAIL_HOST=${EMAIL_HOST:-$DEFAULT_EMAIL_HOST}
        
        read -p "SMTP Port (default: 587): " EMAIL_PORT
        EMAIL_PORT=${EMAIL_PORT:-$DEFAULT_EMAIL_PORT}
        
        read -p "Use Secure Connection (true/false, default: false): " EMAIL_SECURE
        EMAIL_SECURE=${EMAIL_SECURE:-$DEFAULT_EMAIL_SECURE}
    fi
    
    read -p "Email Username (default: your_email@example.com): " EMAIL_USERNAME
    EMAIL_USERNAME=${EMAIL_USERNAME:-$DEFAULT_EMAIL_USERNAME}
    
    read -p "Email Password (default: your_password): " EMAIL_PASSWORD
    EMAIL_PASSWORD=${EMAIL_PASSWORD:-$DEFAULT_EMAIL_PASSWORD}
    
    read -p "From Email Address (default: noreply@archeryscoretracker.com): " EMAIL_FROM
    EMAIL_FROM=${EMAIL_FROM:-$DEFAULT_EMAIL_FROM}
    
    # Create .env file with configuration
    cat > backend/.env << EOF
# Environment
NODE_ENV=production
PORT=5000

# Database
MONGO_URI=mongodb://mongodb:27017/archery_tracker

# Authentication
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRE=30d

# Email Configuration
EMAIL_SERVICE=${EMAIL_SERVICE}
EOF

    # Add SMTP-specific settings if using SMTP
    if [[ $EMAIL_SERVICE == "smtp" ]]; then
    cat >> backend/.env << EOF
EMAIL_HOST=${EMAIL_HOST}
EMAIL_PORT=${EMAIL_PORT}
EMAIL_SECURE=${EMAIL_SECURE}
EOF
    fi

    # Continue with rest of email settings
    cat >> backend/.env << EOF
EMAIL_USERNAME=${EMAIL_USERNAME}
EMAIL_PASSWORD=${EMAIL_PASSWORD}
EMAIL_FROM=${EMAIL_FROM}

# File storage paths
BACKUP_DIR=/app/uploads/backups
IMAGES_DIR=/app/uploads/images
QRCODES_DIR=/app/uploads/qrcodes

# Maximum file upload size (in bytes, default 1MB) [ZF Edited - max file upload set to 10MB]
MAX_FILE_UPLOAD=10000000
EOF

    echo -e "${GREEN}Successfully created .env file with email configuration.${NC}"
fi

# Check if we're in development or production mode
read -p "Deploy in development mode? (y/n, default: n): " DEV_MODE
DEV_MODE=${DEV_MODE:-n}

# Prompt for npm_proxy network inclusion
read -p "Do you need to include the docker network 'npm_proxy' ? (y/n, default: n): " INCLUDE_NPM_PROXY
INCLUDE_NPM_PROXY=${INCLUDE_NPM_PROXY:-n}

# Generate docker-compose.yml dynamically
NODE_ENV=$([[ $DEV_MODE == "y" || $DEV_MODE == "Y" ]] && echo "development" || echo "production")

cat > docker-compose.yml << EOF
services:
  backend:
    image: archeryapp-backend
    build:
      context: .
      dockerfile: docker/Dockerfile.backend
      args:
        - NODE_ENV=${NODE_ENV}
    container_name: archery-backend
    restart: always
    volumes:
      - ./backend:/app
      - /app/node_modules
      - archery_uploads:/app/uploads
    depends_on:
      - mongodb
    environment:
      - NODE_ENV=${NODE_ENV}
      - PORT=5000
      - MONGO_URI=mongodb://mongodb:27017/archery_tracker
      - JWT_SECRET=change_this_in_production
      - JWT_EXPIRE=30d
EOF

if [[ $INCLUDE_NPM_PROXY == "y" || $INCLUDE_NPM_PROXY == "Y" ]]; then
cat >> docker-compose.yml << EOF
    networks:
      - npm_proxy
EOF
fi

cat >> docker-compose.yml << EOF

  frontend:
    image: archeryapp-frontend
    build:
      context: .
      dockerfile: docker/Dockerfile.frontend
    container_name: archerytracker-frontend
    restart: always
    ports:
      - "${PORT}:80"
    depends_on:
      - backend
EOF

if [[ $INCLUDE_NPM_PROXY == "y" || $INCLUDE_NPM_PROXY == "Y" ]]; then
cat >> docker-compose.yml << EOF
    networks:
      - npm_proxy
EOF
fi

cat >> docker-compose.yml << EOF

  mongodb:
    image: mongo
    container_name: archery-mongodb
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - archery_mongodb_data:/data/db

volumes:
  archery_mongodb_data:
  archery_uploads:
EOF

if [[ $INCLUDE_NPM_PROXY == "y" || $INCLUDE_NPM_PROXY == "Y" ]]; then
cat >> docker-compose.yml << EOF

networks:
  npm_proxy:
    external: true
EOF
fi

echo -e "${GREEN}Generated docker-compose.yml${NC}"

# Build and start the Docker containers
echo -e "${GREEN}Building and starting Docker containers...${NC}"

# Try to fix Docker credential issues
echo "Resetting Docker credential helper..."

# Create a local Docker config that disables credential helpers
mkdir -p .docker
cat > .docker/config.json << EOF
{
  "credsStore": "",
  "auths": {}
}
EOF

# Set Docker to use our local config
export DOCKER_CONFIG=$(pwd)/.docker
echo "Using local Docker configuration to avoid credential issues"

if [[ $DEV_MODE == "y" || $DEV_MODE == "Y" ]]; then
    echo "Starting in development mode with live reload..."
    # Build containers individually to avoid buildx issues
    echo "Building backend..."
    docker build -t archeryapp-backend -f docker/Dockerfile.backend .
    echo "Building frontend..."
    docker build -t archeryapp-frontend -f docker/Dockerfile.frontend .
    echo "Starting containers..."
    docker compose up
else
    echo "Starting in production mode..."
    # Build containers individually to avoid buildx issues
    echo "Building backend..."
    docker build -t archeryapp-backend -f docker/Dockerfile.backend .
    echo "Building frontend..."
    docker build -t archeryapp-frontend -f docker/Dockerfile.frontend .
    echo "Starting containers..."
    docker compose up -d
    
    # Show container status
    echo -e "${GREEN}Containers started in detached mode. Status:${NC}"
    docker compose ps
    
    # Show access information
    echo -e "\n${GREEN}Application deployed successfully!${NC}"
    echo -e "Frontend: http://localhost:${PORT}"
    echo -e "\nTo view logs, run: docker compose logs -f"
    echo -e "To stop the application, run: docker compose down"
fi
