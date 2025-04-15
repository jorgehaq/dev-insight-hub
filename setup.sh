#!/bin/bash

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up DevInsightHub development environment...${NC}"

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check for Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Check if .env file exists, create if not
if [ ! -f ".env" ]; then
    echo -e "${BLUE}Creating .env file...${NC}"
    cat > .env << EOF
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=devinsighthub
MONGODB_URI=mongodb://mongo:27017/devinsighthub
REDIS_HOST=redis
SECRET_KEY=$(openssl rand -hex 32)
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
EOF
    echo -e "${GREEN}.env file created.${NC}"
else
    echo -e "${GREEN}.env file already exists, skipping.${NC}"
fi

# Create Docker Swarm if not already created
if ! docker info | grep -q "Swarm: active"; then
    echo -e "${BLUE}Initializing Docker Swarm...${NC}"
    docker swarm init --advertise-addr 192.168.56.10 || true
    echo -e "${GREEN}Docker Swarm initialized.${NC}"
else
    echo -e "${GREEN}Docker Swarm already active, skipping initialization.${NC}"
fi

# Build and deploy the application
echo -e "${BLUE}Building and deploying the application...${NC}"
docker-compose -f docker-compose.yml build
docker-compose -f docker-compose.yml up -d

echo -e "${BLUE}Setting up the database...${NC}"
sleep 5 # Give the database time to start

# Run migrations
docker-compose exec api alembic upgrade head

echo -e "${GREEN}Setup complete!${NC}"
echo -e "${GREEN}The application is running at:${NC}"
echo -e "${GREEN}API: http://localhost:8000${NC}"
echo -e "${GREEN}Frontend: http://localhost:3000${NC}"
echo -e "${GREEN}API Documentation: http://localhost:8000/docs${NC}"