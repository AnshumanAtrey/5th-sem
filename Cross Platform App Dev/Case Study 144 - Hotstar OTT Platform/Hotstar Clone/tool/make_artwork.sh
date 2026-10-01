#!/usr/bin/env bash
# Grabs poster (2:3) and backdrop (16:9) stills straight from the catalogue's
# own video sources, so every image in the app is a real frame of a real,
# openly licensed film. Re-run any time: ./tool/make_artwork.sh
set -euo pipefail

OUT="$(cd "$(dirname "$0")/.." && pwd)/assets/images"
mkdir -p "$OUT"

TOS=https://download.blender.org/demo/movies/ToS/tears_of_steel_720p.mov
SINTEL=https://storage.googleapis.com/shaka-demo-assets/sintel-fmp4-aes/master.m3u8
BBB=https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
ED=https://download.blender.org/ED/elephantsdream-720-h264-st-aac.mov
NATGEO=https://demo.theoplayer.com/hubfs/videos/natgeo/playlist.m3u8
SHAKA_LIVE=https://storage.googleapis.com/shaka-live-assets/player-source.m3u8

# backdrop <name> <url> <seconds>: centre-crop to 16:9, 1280x720
backdrop() {
  ffmpeg -nostdin -loglevel error -y -ss "$3" -i "$2" -frames:v 1 \
    -vf "crop='min(iw,ih*16/9)':'min(ih,iw*9/16)',scale=1280:720" -q:v 4 \
    "$OUT/$1_backdrop.jpg"
}

# poster <name> <url> <seconds> [x-offset 0..1]: 2:3 crop, 400x600
poster() {
  local x="${4:-0.5}"
  ffmpeg -nostdin -loglevel error -y -ss "$3" -i "$2" -frames:v 1 \
    -vf "crop=ih*2/3:ih:(iw-ih*2/3)*$x:0,scale=400:600" -q:v 4 \
    "$OUT/$1_poster.jpg"
}

backdrop tears_of_steel "$TOS" 250 &
poster tears_of_steel "$TOS" 250 0.5 &
backdrop sintel "$SINTEL" 300 &
poster sintel "$SINTEL" 60 0.35 &
backdrop big_buck_bunny "$BBB" 160 &
poster big_buck_bunny "$BBB" 400 0.45 &
backdrop elephants_dream "$ED" 120 &
poster elephants_dream "$ED" 120 0.75 &
backdrop natgeo_4k "$NATGEO" 100 &
poster natgeo_4k "$NATGEO" 60 0.6 &
backdrop bbb_watch_party "$BBB" 290 &
wait

# Live streams never end, so grab the first frame with a hard timeout.
timeout 60 ffmpeg -nostdin -loglevel error -y -i "$SHAKA_LIVE" -frames:v 1 \
  -vf "crop='min(iw,ih*16/9)':'min(ih,iw*9/16)',scale=1280:720" -q:v 4 \
  "$OUT/shaka_live_backdrop.jpg" || echo "warn: live frame grab failed"

ls -lh "$OUT"
