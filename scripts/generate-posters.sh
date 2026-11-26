#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
VIDEO_DIR="${REPO_ROOT}/apps/web/public/preview-videos/home"

# Regenerating posters is optional; never block a build when tooling is absent.
if ! command -v ffmpeg >/dev/null 2>&1 || ! command -v ffprobe >/dev/null 2>&1; then
  echo "ffmpeg/ffprobe not found; skipping poster regeneration (using committed posters)."
  exit 0
fi

if [ ! -d "${VIDEO_DIR}" ]; then
  echo "Video directory not found: ${VIDEO_DIR}; skipping poster regeneration."
  exit 0
fi

# Get all .mp4 videos
video_files=$(find "${VIDEO_DIR}" -name "*.mp4" -type f || true)

if [ -z "${video_files}" ]; then
  echo "No .mp4 videos found in ${VIDEO_DIR}; skipping poster regeneration."
  exit 0
fi

echo "Found $(echo "${video_files}" | wc -l) videos"
echo "=========================="

created=0
fixed=0
skipped=0
failed=0

no_video=()
over_budget=()

# Handle --only-missing flag
only_missing=false
if [ "${1:-}" = "--only-missing" ]; then
  only_missing=true
fi

# Process each video
while IFS= read -r video_path; do
  # Get relative path and video name
  rel_path="${video_path#${REPO_ROOT}/}"
  video_name=$(basename "${video_path}" .mp4)
  poster_path="${VIDEO_DIR}/${video_name}.webp"

  # Check if poster already exists
  if [ -f "${poster_path}" ]; then
    poster_exists=1
    poster_size=$(stat -f%z "${poster_path}" 2>/dev/null || stat -c%s "${poster_path}" 2>/dev/null)
    poster_kb=$((poster_size / 1024))
  else
    poster_exists=0
    poster_kb=0
  fi

  # Skip if --only-missing and poster exists
  if [ "$only_missing" = true ] && [ "$poster_exists" -eq 1 ]; then
    echo "⚡ ${video_name}  (skipped, poster exists)"
    skipped=$((skipped + 1))
    continue
  fi

  # Get video duration
  duration=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "${video_path}" 2>/dev/null | tr -d '[:space:]')
  if [ -z "${duration}" ] || [ "${duration}" -le 0 ]; then
    echo "✖ ${video_name}  (cannot read duration)"
    failed=$((failed + 1))
    no_video+=("${video_name}")
    continue
  fi

  # Extract frame at 40% of duration
  time40=$(echo "scale=3; ${duration} * 0.4" | bc)
  png_tmp="/tmp/${video_name}_frame.png"

  ffmpeg -y -ss "${time40}" -i "${video_path}" -frames:v 1 "${png_tmp}" 2>/dev/null

  if [ ! -f "${png_tmp}" ]; then
    echo "✖ ${video_name}  (frame extraction failed)"
    failed=$((failed + 1))
    continue
  fi

  # Convert PNG to WebP with quality fallback
  final_kb=999
  best_quality=75

  for quality in 75 65 55 45 35 30 25 20 15; do
    if command -v python3 &>/dev/null; then
      python3 -c "
import sys
from PIL import Image
try:
    img = Image.open('${png_tmp}')
    img.save('${poster_path}', 'WEBP', quality=${quality})
except Exception:
    pass
" >/dev/null 2>&1
    else
      ffmpeg -y -i "${png_tmp}" -c:v libwebp -quality ${quality} "${poster_path}" 2>/dev/null
    fi

    if [ -f "${poster_path}" ]; then
      ksize=$(stat -f%z "${poster_path}" 2>/dev/null || stat -c%s "${poster_path}" 2>/dev/null)
      k=$((ksize / 1024))
      if [ "$k" -le 15 ]; then
        final_kb=$k
        best_quality=${quality}
        break
      fi
    fi
  done

  # Clean up PNG
  rm -f "${png_tmp}"

  if [ "${final_kb}" -gt 15 ]; then
    # Even at quality 15 it's too big - use the smallest we got
    if [ "${best_quality}" -lt 15 ]; then
      # Try one more pass at quality 10
      if command -v python3 &>/dev/null; then
        python3 -c "
from PIL import Image
img = Image.open('${png_tmp}') if __import__('os').path.exists('${png_tmp}') else None
if img:
    img.save('${poster_path}', 'WEBP', quality=10)
" >/dev/null 2>&1
      fi
    fi
    # Get final size
    if [ -f "${poster_path}" ]; then
      final_kb=$(stat -f%z "${poster_path}" 2>/dev/null || stat -c%s "${poster_path}" 2>/dev/null)
      final_kb=$((final_kb / 1024))
    fi
  fi

  if [ "${final_kb}" -gt 15 ]; then
    echo "✖ ${video_name}  (${final_kb} KB - cannot reduce further)"
    failed=$((failed + 1))
    over_budget+=("${video_name}")
  else
    status="created"
    if [ "${poster_exists}" -eq 1 ]; then
      status="fixed"
    fi
    echo "✔ ${video_name}  (${final_kb} KB) [${status}]"
    if [ "${poster_exists}" -eq 1 ]; then
      fixed=$((fixed + 1))
    else
      created=$((created + 1))
    fi
  fi
done <<< "${video_files}"

echo ""
echo "=== Summary ==="
echo "Created: ${created}"
echo "Fixed: ${fixed}"
echo "Skipped (--only-missing): ${skipped}"
echo "Failed: ${failed}"

if [ ${#no_video[@]} -gt 0 ]; then
  echo "No video: ${no_video[*]}"
fi
if [ ${#over_budget[@]} -gt 0 ]; then
  echo "Over budget: ${over_budget[*]}"
fi

exit $failed