FROM ubuntu:22.04

# Set environment variables
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=${PATH}:${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin:${ANDROID_SDK_ROOT}/platform-tools:${ANDROID_SDK_ROOT}/build-tools/34.0.0
ENV JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64

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

# Build web assets
RUN npm run build

# Sync Capacitor
RUN npx cap sync android

# Make gradlew executable
RUN chmod +x android/gradlew

# Configure Gradle to use Java 21
RUN echo "org.gradle.java.home=/usr/lib/jvm/java-21-openjdk-amd64" > android/gradle.properties && \
    echo "org.gradle.jvmargs=-Xmx1536m" >> android/gradle.properties && \
    echo "android.useAndroidX=true" >> android/gradle.properties

# Build Android APK
CMD ["./android/gradlew", "-p", "android", "assembleDebug"]