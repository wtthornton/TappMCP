#!/bin/bash

# Smart MCP Production Deployment Script
set -e

# Configuration
IMAGE_NAME="smart-mcp"
TAG="${1:-latest}"
CONTAINER_NAME="smart-mcp-prod"
PORT="${PORT:-3000}"

echo "🚀 Starting Smart MCP Production Deployment"
echo "Image: ${IMAGE_NAME}:${TAG}"
echo "Container: ${CONTAINER_NAME}"
echo "Port: ${PORT}"

# Build the Docker image
echo "📦 Building Docker image..."
docker build -t ${IMAGE_NAME}:${TAG} .

# Stop and remove existing container if it exists
echo "🛑 Stopping existing container..."
docker stop ${CONTAINER_NAME} 2>/dev/null || true
docker rm ${CONTAINER_NAME} 2>/dev/null || true

# Run the new container
echo "🚀 Starting new container..."
docker run -d \
  --name ${CONTAINER_NAME} \
  --restart unless-stopped \
  -p ${PORT}:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -v smart-mcp-data:/app/data \
  ${IMAGE_NAME}:${TAG}

# Wait for container to start
echo "⏳ Waiting for container to start..."
sleep 10

# Health check
echo "🏥 Performing health check..."
if curl -f http://localhost:${PORT}/health > /dev/null 2>&1; then
  echo "✅ Health check passed! Deployment successful."
  echo "🌐 Application is running at http://localhost:${PORT}"
  echo "🏥 Health endpoint: http://localhost:${PORT}/health"
else
  echo "❌ Health check failed! Deployment unsuccessful."
  echo "📋 Container logs:"
  docker logs ${CONTAINER_NAME}
  exit 1
fi

echo "🎉 Smart MCP Production Deployment Complete!"
