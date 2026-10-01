#!/usr/bin/env bash
# Starts the local backend (Firebase Auth + Firestore emulators) and prints
# the command to run the app on your phone over the same Wi-Fi.
#   ./tool/dev.sh
set -euo pipefail
cd "$(dirname "$0")/.."

# The emulators need Java; Homebrew's OpenJDK isn't on PATH by default.
[ -d /opt/homebrew/opt/openjdk/bin ] && export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"
export JAVA_TOOL_OPTIONS="-Xmx768m"   # keep the emulator's RAM in check

IP="$(ipconfig getifaddr en0 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}')"
cat <<MSG

  Backend starting. In another terminal, with your phone paired over Wi-Fi:

    flutter run --dart-define=EMULATOR_HOST=${IP}

  Emulator UI (users, Firestore data): http://localhost:4000
  Optional live studio (OBS → MediaMTX):
    add --dart-define=LIVE_URL=http://${IP}:8888/studio/index.m3u8

MSG
# Keep accounts, reviews and progress between runs.
IMPORT=()
[ -f emulator-data/firebase-export-metadata.json ] && IMPORT=(--import emulator-data)
exec firebase emulators:start --project demo-hotstar-clone ${IMPORT[@]+"${IMPORT[@]}"} --export-on-exit emulator-data
