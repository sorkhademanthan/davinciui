#!/usr/bin/env bash
# Link the workspace's React installs into the repository root so this folder can
# be type-checked and bundled without adding dependencies to the monorepo.
set -euo pipefail
cd "$(dirname "$0")"

WEB_NODE_MODULES="$(cd ../../../apps/web/node_modules && pwd)"
ROOT_NODE_MODULES="$(cd ../../../node_modules && pwd)"

ln -sfn "$WEB_NODE_MODULES/react" "$ROOT_NODE_MODULES/react"
ln -sfn "$WEB_NODE_MODULES/react-dom" "$ROOT_NODE_MODULES/react-dom"
ln -sfn "$WEB_NODE_MODULES/@types" "$ROOT_NODE_MODULES/@types"

echo "Linked react, react-dom and @types from apps/web into $ROOT_NODE_MODULES"
