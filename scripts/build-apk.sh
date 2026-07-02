#!/bin/bash
set -e

echo "Building DeenFlow APK..."

# Create output directory
mkdir -p output

# Build using Docker
docker run --rm \
  --platform linux/amd64 \
  -v "$PWD:/app" \
  -v "$PWD/output:/output" \
  -w /app \
  node:20-slim \
  sh -c "
    apt-get update && apt-get install -y openjdk-17-jdk-headless wget unzip git > /dev/null 2>&1 &&
    export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 &&
    export ANDROID_HOME=/opt/android-sdk &&
    export PATH=\"\$PATH:\$ANDROID_HOME/cmdline-tools/latest/bin:\$ANDROID_HOME/platform-tools\" &&
    mkdir -p \$ANDROID_HOME/cmdline-tools &&
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O /tmp/cmdline-tools.zip &&
    unzip -q /tmp/cmdline-tools.zip -d /tmp &&
    mv /tmp/cmdline-tools \$ANDROID_HOME/cmdline-tools/latest &&
    yes | sdkmanager --licenses > /dev/null 2>&1 &&
    sdkmanager 'platform-tools' 'build-tools;34.0.0' 'platforms;android-34' > /dev/null 2>&1 &&
    npm install -g @capacitor/cli@latest &&
    npm ci &&
    npm run build &&
    npx cap add android 2>/dev/null || npx cap sync android &&
    cd android &&
    chmod +x gradlew &&
    ./gradlew assembleDebug &&
    cp app/build/outputs/apk/debug/app-debug.apk /output/deenflow.apk
  "

echo "APK built successfully!"
echo "Output: output/deenflow.apk"
