#!/bin/bash

# Docker build script for Vegetipple Mobile
# Usage: ./build-docker.sh [database_version]
# Example: ./build-docker.sh v2025.06.10

DB_VERSION=${1:-latest}
IMAGE_TAG="vegetipple-mobile:$(date +%Y%m%d%H%M%S)"

echo "🚀 Building Vegetipple Mobile with Docker"
echo "📦 Database version: $DB_VERSION"
echo "🏷️  Image tag: $IMAGE_TAG"
echo ""

# Build the Docker image
echo "Building Docker image..."
docker build \
  --build-arg DB_VERSION="$DB_VERSION" \
  --tag "$IMAGE_TAG" \
  --tag "vegetipple-mobile:latest" \
  .

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Build completed successfully!"
  echo ""
  echo "📦 Available images:"
  docker images | grep vegetipple-mobile
  echo ""
  echo "🔧 To extract build artifacts:"
  echo "   docker create --name extract $IMAGE_TAG"
  echo "   docker cp extract:/app/build-output ./build-output"
  echo "   docker rm extract"
  echo ""
  echo "🚀 To run the container:"
  echo "   docker run --rm $IMAGE_TAG"
else
  echo "❌ Build failed!"
  exit 1
fi