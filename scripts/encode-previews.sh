#!/usr/bin/env bash
set -euo pipefail

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg is required but not installed."
  exit 1
fi
if ! command -v ffprobe >/dev/null 2>&1; then
  echo "ffprobe is required but not installed (ships with ffmpeg)."
  exit 1
fi

# Usage: ./encode-previews.sh <input-dir> [output-dir] [width]
INPUT_DIR="${1:-}"
OUTPUT_DIR="${2:-$INPUT_DIR}"
WIDTH="${3:-480}"

if [[ -z "$INPUT_DIR" || ! -d "$INPUT_DIR" ]]; then
  echo "Usage: $0 <input-dir-containing-video-clips> [output-dir] [width]"
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

# Size budgets (bytes). Warn over video budget, hard-fail past hard ceiling.
VIDEO_BUDGET=$((300 * 1024))
VIDEO_HARD_CEILING=$((500 * 1024))
POSTER_BUDGET=$((15 * 1024))

shopt -s nullglob
FILES=(
  "$INPUT_DIR"/*.mp4
  "$INPUT_DIR"/*.mov
  "$INPUT_DIR"/*.mkv
  "$INPUT_DIR"/*.webm
  "$INPUT_DIR"/*.m4v
)
shopt -u nullglob
if [[ ${#FILES[@]} -eq 0 ]]; then
  echo "No source clips found in $INPUT_DIR"
  exit 0
fi

get_size() {
  stat -f%z "$1" 2>/dev/null || stat -c%s "$1"
}

fail=0

for input in "${FILES[@]}"; do
  base="$(basename "$input")"
  base="${base%.*}"
  scale="scale=${WIDTH}:-2,fps=24"

  # WebM (VP9) — primary, smallest.
  if ffmpeg -y -hide_banner -loglevel error -i "$input" \
    -an -vf "$scale" \
    -c:v libvpx-vp9 -crf 38 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 \
    "$OUTPUT_DIR/$base.webm" 2>&1; then
    :
  else
    echo "WARN: VP9 encode failed for $base, retrying baseline:"
    ffmpeg -y -hide_banner -loglevel error -i "$input" \
      -an -vf "$scale" -c:v libvpx-vp9 -crf 45 -b:v 0 -cpu-used 6 \
      "$OUTPUT_DIR/$base.webm"
  fi

  # MP4 (H.264) — Safari/iOS fallback.
  ffmpeg -y -hide_banner -loglevel error -i "$input" \
    -an -vf "$scale" \
    -c:v libx264 -profile:v main -pix_fmt yuv420p -crf 28 -preset slow \
    -movflags +faststart "$OUTPUT_DIR/$base.mp4"

  # Poster — one still frame as WebP.
  ffmpeg -y -hide_banner -loglevel error -i "$input" \
    -frames:v 1 -vf "$scale" -c:v libwebp -quality 75 \
    "$OUTPUT_DIR/$base.webp"

  echo "Encoded: $base.{webm,mp4,webp}"
done

echo "--- Size budgets ---"
for f in "$OUTPUT_DIR"/*.webp; do
  [[ -f "$f" ]] || continue
  size=$(get_size "$f")
  name=$(basename "$f")
  if (( size > POSTER_BUDGET )); then
    echo "FAIL: $name is $size bytes (> $POSTER_BUDGET poster budget)"
    fail=1
  fi
done
for f in "$OUTPUT_DIR"/*.webm "$OUTPUT_DIR"/*.mp4; do
  [[ -f "$f" ]] || continue
  size=$(get_size "$f")
  name=$(basename "$f")
  if (( size > VIDEO_HARD_CEILING )); then
    echo "FAIL: $name is $size bytes (> $VIDEO_HARD_CEILING hard ceiling)"
    fail=1
  elif (( size > VIDEO_BUDGET )); then
    echo "WARN: $name is $size bytes (> $VIDEO_BUDGET target)"
  fi
done

if (( fail )); then
  echo "encode-previews.sh: size budgets exceeded"
  exit 1
fi
echo "All assets within budgets (${VIDEO_BUDGET} video target, ${POSTER_BUDGET} poster target)."
