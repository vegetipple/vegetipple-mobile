FROM ubuntu:22.04

# Build arguments
ARG DB_VERSION=latest

# Set environment variables
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=${PATH}:${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin:${ANDROID_SDK_ROOT}/platform-tools:${ANDROID_SDK_ROOT}/build-tools/34.0.0
ENV JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
ENV DB_VERSION=${DB_VERSION}

# Install system dependencies
RUN apt-get update && apt-get install -y \
    openjdk-21-jdk \
    wget \
    unzip \
    git \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Create Android SDK directory
RUN mkdir -p ${ANDROID_SDK_ROOT}/cmdline-tools

# Download and install Android SDK command line tools
RUN wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O /tmp/cmdline-tools.zip \
    && unzip /tmp/cmdline-tools.zip -d ${ANDROID_SDK_ROOT}/cmdline-tools \
    && mv ${ANDROID_SDK_ROOT}/cmdline-tools/cmdline-tools ${ANDROID_SDK_ROOT}/cmdline-tools/latest \
    && rm /tmp/cmdline-tools.zip

# Accept Android SDK licenses and install required packages
RUN yes | sdkmanager --licenses \
    && sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Download latest database and build web assets
RUN npm run build

# Sync Capacitor
RUN npx cap sync android

# Copy database to Android assets (required for SQLite)
# The database needs to be in the public assets folder for Capacitor SQLite
RUN mkdir -p android/app/src/main/assets/public/assets/databases && \
    cp src/assets/databases/barnivore.db android/app/src/main/assets/public/assets/databases/ && \
    cp src/assets/databases/databases.json android/app/src/main/assets/public/assets/databases/

# Configure Gradle to use Java 21 and make gradlew executable if it exists
RUN echo "org.gradle.java.home=/usr/lib/jvm/java-21-openjdk-amd64" > android/gradle.properties && \
    echo "org.gradle.jvmargs=-Xmx1536m" >> android/gradle.properties && \
    echo "android.useAndroidX=true" >> android/gradle.properties && \
    if [ -f android/gradlew ]; then chmod +x android/gradlew; echo "Made gradlew executable"; else echo "gradlew not found, will be auto-downloaded"; fi

# Build Android APK and prepare output directory
RUN mkdir -p /app/build-output
RUN cd android && chmod +x gradlew 2>/dev/null || true && ./gradlew assembleDebug

# Copy build outputs to a central location
RUN cp android/app/build/outputs/apk/debug/app-debug.apk /app/build-output/ && \
    cp -r /app/www /app/build-output/ && \
    cp src/assets/databases/databases.json /app/build-output/database-info.json && \
    echo "Android APK built and copied to build-output" && \
    echo "Web build copied to build-output/www/" && \
    echo "Database info copied to build-output/database-info.json" && \
    ls -la /app/www/ && \
    ls -la /app/build-output/

# Default command shows build status
CMD ["bash", "-c", "echo 'Build completed successfully!' && echo 'Web app: /app/build-output/www/' && echo 'Android APK: /app/build-output/app-debug.apk' && echo 'Build outputs:' && ls -la /app/build-output/"]