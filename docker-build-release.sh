#!/bin/bash

# Docker Android Release Build Script
# This script builds both debug and release APKs/AABs using Docker with Java 21

set -e

echo "Building Android APK and AAB (release) using Docker..."

# Build Docker image
echo "Building Docker image..."
docker build -t vegetipple-android-builder .

# Create output directory
mkdir -p build-output

# Run Docker container and build all variants
echo "Running builds in Docker container..."
docker run --rm \
    -v "$(pwd)/build-output:/output" \
    vegetipple-android-builder \
    bash -c "
        # Copy web build
        cp -r www /output/ && \
        echo 'Web build copied to build-output/www/' && \
        
        cd android && chmod +x gradlew 2>/dev/null || true && \
        
        # Build debug APK
        ./gradlew assembleDebug && \
        cp app/build/outputs/apk/debug/app-debug.apk /output/ && \
        echo 'Debug APK built successfully' && \
        
        # Build release APK
        ./gradlew assembleRelease && \
        cp app/build/outputs/apk/release/app-release-unsigned.apk /output/ && \
        echo 'Release APK built successfully' && \
        
        # Build release AAB
        ./gradlew bundleRelease && \
        cp app/build/outputs/bundle/release/app-release.aab /output/ && \
        echo 'Release AAB built successfully'
    "

echo "Build completed!"
echo "Files available in build-output/:"
echo "- www/ (Web application)"
echo "- app-debug.apk (Debug APK)"
echo "- app-release-unsigned.apk (Release APK - needs signing)"
echo "- app-release.aab (Release AAB - needs signing)"