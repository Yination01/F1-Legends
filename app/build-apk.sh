#!/bin/bash
set -e
# Local APK build script - zero dollar, needs JDK 17 + Android SDK 34
export ANDROID_HOME=${ANDROID_HOME:-$HOME/Android/Sdk}
if [ ! -d "$ANDROID_HOME" ]; then
  echo "ANDROID_HOME not found at $ANDROID_HOME"
  echo "Install Android cmdline-tools and run: sdkmanager 'platform-tools' 'platforms;android-34' 'build-tools;34.0.0'"
  exit 1
fi
echo "Using ANDROID_HOME=$ANDROID_HOME"
echo "Using JAVA_HOME=$JAVA_HOME"
java -version
cd "$(dirname "$0")"
npm install
node copy-game.js
npx cap add android || true
./android/gradlew -p android assembleDebug --no-daemon
APK=android/app/build/outputs/apk/debug/app-debug.apk
if [ -f "$APK" ]; then
  cp "$APK" ../F1-Legends-debug.apk
  echo "APK built: $(pwd)/../F1-Legends-debug.apk"
  ls -lh ../F1-Legends-debug.apk
else
  echo "Build failed, APK not found"
  exit 1
fi
