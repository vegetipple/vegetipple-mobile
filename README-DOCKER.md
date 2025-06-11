# Docker Build Solution for Android

This document explains the Docker-based build solution that allows building Android APKs using Java 21 while keeping your system Java 17 environment intact.

## Problem Solved

Capacitor 7.3.0 requires Java 21 for Android builds, but your system uses Java 17. This Docker solution provides an isolated Java 21 environment for building Android apps without affecting your local Java installation.

## Files Created

### Docker Configuration
- `Dockerfile` - Creates a Ubuntu 22.04 container with Java 21, Node.js 20, and Android SDK
- `.dockerignore` - Excludes unnecessary files from Docker build context

### Build Scripts
- `docker-build.sh` - Builds debug APK using Docker
- `docker-build-release.sh` - Builds debug APK, release APK, and AAB using Docker

### GitHub Actions
- `.github/workflows/android-build.yml` - Updated to use Docker for builds

## Usage

### Local Development

#### Build Debug APK
```bash
./docker-build.sh
```
Output: `build-output/app-debug.apk`

#### Build All Variants
```bash
./docker-build-release.sh
```
Output:
- `build-output/app-debug.apk` (Debug APK)
- `build-output/app-release-unsigned.apk` (Release APK - needs signing)
- `build-output/app-release.aab` (Release AAB - needs signing)

### CI/CD with GitHub Actions

The GitHub Actions workflow automatically uses Docker to build Android apps when:
- Tags matching `v*.*.*` are pushed
- Manual workflow dispatch is triggered

## Docker Image Details

The Docker image includes:
- **Base**: Ubuntu 22.04
- **Java**: OpenJDK 21
- **Node.js**: Version 20
- **Android SDK**: Command line tools with Platform 34 and Build Tools 34.0.0
- **Build Tools**: Gradle (auto-downloaded), Git, Curl

## Build Process

1. Docker builds the image with all dependencies
2. Copies your project files into the container
3. Runs `npm run build` to build web assets
4. Runs `npx cap sync android` to sync Capacitor
5. Configures Gradle to use Java 21
6. Builds Android APK/AAB using `./gradlew`
7. Copies build artifacts to `build-output/` directory

## Advantages

- ✅ Isolates Java 21 requirement from your system
- ✅ Consistent build environment across different machines
- ✅ No need to modify your local Java installation
- ✅ Works in CI/CD environments
- ✅ Reproducible builds
- ✅ Easy to version and maintain

## System Requirements

- Docker installed and running
- At least 4GB RAM available for Docker
- Sufficient disk space (image ~2GB, builds require additional space)

## Troubleshooting

### Build Fails with "No space left on device"
Increase Docker disk space or clean up Docker images:
```bash
docker system prune -a
```

### Build Times Are Slow
First build downloads all dependencies. Subsequent builds are faster due to Docker layer caching.

### Permission Issues
Ensure Docker has proper permissions:
```bash
sudo usermod -aG docker $USER
# Then log out and back in
```

## Signing Release Builds

To sign release APKs for production:

1. Create a keystore file
2. Convert to base64: `base64 -w 0 your-key.keystore`
3. Add GitHub Secrets:
   - `KEYSTORE_BASE64`: Base64 encoded keystore
   - `KEYSTORE_PASSWORD`: Keystore password
   - `KEY_ALIAS`: Key alias
   - `KEY_PASSWORD`: Key password

The GitHub Actions workflow will automatically sign APKs when these secrets are present.