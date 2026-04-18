#!/usr/bin/env bash
# ============================================================
# SilaiMart - Android Release Build Script
# ============================================================
# Usage:
#   ./build-android.sh                         → prompts for passwords
#   KEYSTORE_PASSWORD=xxx KEY_PASSWORD=xxx ./build-android.sh  → non-interactive
# ============================================================

set -e

FRONTEND_DIR="$(cd "$(dirname "$0")" && pwd)"
ANDROID_DIR="$FRONTEND_DIR/android"
KEYSTORE_FILE="$FRONTEND_DIR/../skinosphere-release-key.jks"

echo "🔨 SilaiMart APK Builder"
echo "========================"

# 1. Build the web app
echo ""
echo "📦 Step 1: Building web app..."
cd "$FRONTEND_DIR"
npm run build
echo "✅ Web app built."

# 2. Sync to Android
echo ""
echo "🔄 Step 2: Syncing to Android..."
npx cap sync android
echo "✅ Sync complete."

# 3. Ask for signing credentials if not set
if [ -z "$KEYSTORE_PASSWORD" ]; then
  read -s -p "🔑 Enter keystore password: " KEYSTORE_PASSWORD
  echo ""
fi

if [ -z "$KEY_PASSWORD" ]; then
  read -s -p "🔑 Enter key password (leave blank if same as keystore): " KEY_PASSWORD
  echo ""
  if [ -z "$KEY_PASSWORD" ]; then
    KEY_PASSWORD="$KEYSTORE_PASSWORD"
  fi
fi

KEY_ALIAS="${KEY_ALIAS:-silaimart}"

# 4. Build the signed release APK
echo ""
echo "🏗️  Step 3: Building signed release APK..."
cd "$ANDROID_DIR"
./gradlew assembleRelease \
  -PKEYSTORE_PATH="$KEYSTORE_FILE" \
  -PKEYSTORE_PASSWORD="$KEYSTORE_PASSWORD" \
  -PKEY_ALIAS="$KEY_ALIAS" \
  -PKEY_PASSWORD="$KEY_PASSWORD"

APK_PATH="$ANDROID_DIR/app/build/outputs/apk/release/app-release.apk"

if [ -f "$APK_PATH" ]; then
  echo ""
  echo "✅ SUCCESS! APK is ready at:"
  echo "   $APK_PATH"
else
  echo ""
  echo "❌ APK build failed. Check the logs above."
  exit 1
fi

# 5. Optionally build AAB (recommended for Play Store)
echo ""
read -p "🚀 Also build Android App Bundle (.aab) for Play Store? (recommended) [y/N]: " BUILD_AAB
if [[ "$BUILD_AAB" =~ ^[Yy]$ ]]; then
  echo "🏗️  Building AAB..."
  ./gradlew bundleRelease \
    -PKEYSTORE_PATH="$KEYSTORE_FILE" \
    -PKEYSTORE_PASSWORD="$KEYSTORE_PASSWORD" \
    -PKEY_ALIAS="$KEY_ALIAS" \
    -PKEY_PASSWORD="$KEY_PASSWORD"
  AAB_PATH="$ANDROID_DIR/app/build/outputs/bundle/release/app-release.aab"
  if [ -f "$AAB_PATH" ]; then
    echo ""
    echo "✅ AAB is ready at:"
    echo "   $AAB_PATH"
  fi
fi

echo ""
echo "============================================================"
echo "🎉 Build complete! Upload the .aab to Google Play Console."
echo "============================================================"
