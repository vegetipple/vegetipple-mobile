#!/bin/bash

# Docker Android Build Script
# This script builds the Android APK using Docker with Java 21

set -e

echo "Building Android APK using Docker..."

# Build Docker image
echo "Building Docker image..."
docker build -t vegetipple-android-builder .

# Create output directory
mkdir -p build-output

# Run Docker container and copy APK
echo "Running Android build in Docker container..."
docker run --rm \
    -v "$(pwd)/build-output:/output" \
    vegetipple-android-builder \
    bash -c "
        ./android/gradlew -p android assembleDebug && \
        cp android/app/build/outputs/apk/debug/app-debug.apk /output/ && \
        echo 'APK built successfully and copied to build-output/app-debug.apk'
    "

echo "Build completed! APK available at: build-output/app-debug.apk"