#!/bin/bash
set -e

# Build backend
echo "Building backend..."
cd ../../backend
docker build -t devinsighthub-backend:latest .

# Build frontend
echo "Building frontend..."
cd ../frontend
docker build -t devinsighthub-frontend:latest .

# Tag images for registry
docker tag devinsighthub-backend:latest ${DOCKER_REGISTRY}/devinsighthub-backend:latest
docker tag devinsighthub-frontend:latest ${DOCKER_REGISTRY}/devinsighthub-frontend:latest

# Push images to registry
echo "Pushing images to registry..."
docker push ${DOCKER_REGISTRY}/devinsighthub-backend:latest
docker push ${DOCKER_REGISTRY}/devinsighthub-frontend:latest

# Deploy using docker-compose
echo "Deploying application..."
cd ../deployment/docker
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

echo "Deployment complete!"