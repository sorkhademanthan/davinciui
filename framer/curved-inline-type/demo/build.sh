#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
bun build ./main.tsx --outdir ./dist --target browser --format esm
