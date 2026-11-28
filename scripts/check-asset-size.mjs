#!/usr/bin/env node
import { readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const ROOT = new URL("../apps/web/public", import.meta.url).pathname
const LIMIT_BYTES = 1.5 * 1024 * 1024
const SKIP_DIRS = new Set(["preview-videos", "audio", "r"])

/** @param {string} dir */
function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue
      out.push(...walk(full))
    } else if (entry.isFile()) {
      out.push(full)
    }
  }
  return out
}

const offenders = walk(ROOT)
  .map((file) => ({ file, size: statSync(file).size }))
  .filter(({ size }) => size > LIMIT_BYTES)
  .sort((a, b) => b.size - a.size)

if (offenders.length > 0) {
  console.error(`Asset budget exceeded (limit ${LIMIT_BYTES} bytes):`)
  for (const { file, size } of offenders) {
    console.error(`  ${(size / 1024 / 1024).toFixed(2)} MB  ${relative(ROOT, file)}`)
  }
  process.exit(1)
}

console.log("Asset budget OK (no file over 1.5 MB in apps/web/public).")
