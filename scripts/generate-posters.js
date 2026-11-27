#!/usr/bin/env node
/**
 * Generate card posters from each component's own preview video.
 *
 * Usage:
 *   node scripts/generate-posters.js                 # regenerate all posters
 *   node scripts/generate-posters.js --only-missing  # skip existing posters
 *   node scripts/generate-posters.js --audit         # report, write nothing
 *   node scripts/generate-posters.js --check         # fail on bad/missing posters
 *   node scripts/generate-posters.js --slug=foo      # one component
 *
 * ffmpeg/ffprobe are required. Encoding prefers cwebp, then Pillow, then
 * ffmpeg's libwebp (whichever is installed).
 */
"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { execFileSync, spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const VIDEO_DIR = path.join(ROOT, "apps/web/public/preview-videos/home");
const GENERATED_MAP = path.join(
  ROOT,
  "apps/web/lib/contentful-preview-media.generated.ts",
);
const REGISTRY = path.join(ROOT, "apps/web/registry/index.ts");
const CACHE_DIR = path.join(os.tmpdir(), "davinciui-poster-cache");
const MAX_BYTES = 15 * 1024;
const WIDTH = 480;
/**
 * Contentful preview assets that currently point at another component's video
 * (or a video that only shows a thin strip of the component). We never write a
 * poster from these; we keep the existing good poster, fall back to the
 * component's other theme, or report the component.
 */
/**
 * Components whose published Contentful preview video is stale / does not match
 * the current component, but whose local preview video is correct. The poster is
 * generated from the local video first so the card cover matches the component.
 */
const PREFER_LOCAL_SOURCES = new Set(["sunlight-effect"]);

const KNOWN_BAD_SOURCES = {
  "circle-cursor": {
    light: {
      reason: "Contentful light asset is Chromatic Cursor",
      fallbackTheme: "dark",
    },
  },
  "cinematic-panel-preloader": {
    dark: { reason: "Contentful asset is Preloader Pro", keepExisting: true },
    light: { reason: "Contentful asset is Preloader Pro", keepExisting: true },
  },
  "editorial-wipe-preloader": {
    dark: { reason: "Contentful dark asset is Preloader Pro", keepExisting: true },
  },
  "scroll-media-expand": {
    dark: {
      reason: "video only shows a thin strip of the component",
      fail: true,
    },
    light: {
      reason: "video only shows a thin strip of the component",
      fail: true,
    },
  },
};

const CANDIDATE_POINTS = [0.4, 0.25, 0.55, 0.7];
const FALLBACK_POINTS = [0.15, 0.3, 0.5, 0.6, 0.8, 0.85];
const DENSE_POINTS = Array.from({ length: 19 }, (_, index) => (index + 1) / 20);

const args = new Set(process.argv.slice(2));
const onlyMissing = args.has("--only-missing");
const auditOnly = args.has("--audit");
const checkOnly = args.has("--check");
const verbose = args.has("--verbose");
const slugArg = process.argv
  .slice(2)
  .find((arg) => arg.startsWith("--slug="))
  ?.slice("--slug=".length);

function log(...parts) {
  console.log(...parts);
}

function hasBin(bin) {
  return spawnSync(bin, ["-version"], { stdio: "ignore" }).status === 0;
}

const HAS_FFMPEG = hasBin("ffmpeg");
const HAS_FFPROBE = hasBin("ffprobe");
const HAS_CWEBP = hasBin("cwebp");
const HAS_PYTHON_PIL = (() => {
  if (!hasBin("python3")) return false;
  return (
    spawnSync("python3", ["-c", "from PIL import Image"], {
      stdio: "ignore",
    }).status === 0
  );
})();

if (!HAS_FFMPEG || !HAS_FFPROBE) {
  const message =
    "ffmpeg and ffprobe are required to generate posters. Install them and retry.";
  if (checkOnly) {
    console.error(message);
    process.exit(1);
  }
  console.warn(`${message} Skipping poster generation (using committed posters).`);
  process.exit(0);
}

function run(bin, argv, options = {}) {
  return execFileSync(bin, argv, {
    maxBuffer: 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
}

function readRemoteMap() {
  const text = fs.readFileSync(GENERATED_MAP, "utf8");
  const map = {};
  let current = null;
  for (const line of text.split("\n")) {
    const entry = line.match(/^  "([^"]+)": \{/);
    if (entry) {
      current = entry[1];
      map[current] = {};
      continue;
    }
    const theme = line.match(/^    "(light|dark)": "([^"]+)"/);
    if (theme && current) map[current][theme[1]] = theme[2];
  }
  return map;
}

function readRegistryPreviewVideos() {
  const text = fs.readFileSync(REGISTRY, "utf8");
  const map = {};
  let current = null;
  let body = [];
  const flush = () => {
    if (!current) return;
    const block = body.join("\n");
    const match = block.match(/previewVideo:\s*\n?\s*"([^"]+)"/);
    if (match) map[current] = match[1];
    current = null;
    body = [];
  };
  for (const line of text.split("\n")) {
    if (/^  "[^"]+": \{$/.test(line)) {
      flush();
      current = line.trim().slice(1, line.trim().indexOf('"', 1));
      continue;
    }
    if (current && /^  \},$/.test(line)) {
      flush();
      continue;
    }
    if (current) body.push(line);
  }
  flush();
  return map;
}

const remoteMap = readRemoteMap();
const registryVideos = readRegistryPreviewVideos();

function listComponentSlugs() {
  const slugs = new Set();
  if (fs.existsSync(VIDEO_DIR)) {
    for (const entry of fs.readdirSync(VIDEO_DIR, { withFileTypes: true })) {
      if (entry.isDirectory()) slugs.add(entry.name);
    }
  }
  for (const slug of Object.keys(remoteMap)) slugs.add(slug);
  for (const slug of Object.keys(registryVideos)) {
    if (slug === "liquid-chrome") slugs.add(slug);
  }
  return [...slugs].sort();
}

function localVideo(slug, theme) {
  for (const ext of ["mp4", "webm"]) {
    const file = path.join(VIDEO_DIR, slug, `${slug}-${theme}.${ext}`);
    if (fs.existsSync(file)) return file;
  }
  return null;
}

function resolveVideo(slug, theme) {
  const local = localVideo(slug, theme);
  if (local && PREFER_LOCAL_SOURCES.has(slug)) {
    return { kind: "local", src: local };
  }
  const remote = remoteMap[slug]?.[theme];
  if (remote) return { kind: "remote", src: remote };
  if (local) return { kind: "local", src: local };
  const preview = registryVideos[slug];
  if (preview) return { kind: "remote", src: preview };
  return null;
}

function cachePathFor(url) {
  const hash = crypto.createHash("sha1").update(url).digest("hex");
  const ext = (url.match(/\.(mp4|webm|mov)(?:\?|$)/i)?.[1] || "mp4").toLowerCase();
  return path.join(CACHE_DIR, `${hash}.${ext}`);
}

function download(url) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const target = cachePathFor(url);
  if (fs.existsSync(target) && fs.statSync(target).size > 0) return target;
  log(`  downloading ${url.split("/").pop()}`);
  const result = spawnSync(
    "curl",
    ["-L", "--fail", "--retry", "3", "--silent", "--show-error", "-o", target, url],
    { stdio: "inherit" },
  );
  if (result.status !== 0 || !fs.existsSync(target)) {
    throw new Error(`download failed: ${url}`);
  }
  return target;
}

function materialize(video) {
  return video.kind === "local" ? video.src : download(video.src);
}

function durationOf(file) {
  const out = run("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "csv=p=0",
    file,
  ])
    .toString()
    .trim();
  const value = Number.parseFloat(out);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function extractFrame(video, seconds, output) {
  run("ffmpeg", [
    "-y",
    "-ss",
    seconds.toFixed(3),
    "-i",
    video,
    "-frames:v",
    "1",
    "-vf",
    `scale=${WIDTH}:-2:flags=lanczos`,
    output,
  ]);
  return fs.existsSync(output) && fs.statSync(output).size > 0;
}

function signature(file) {
  const raw = run("ffmpeg", [
    "-v",
    "error",
    "-i",
    file,
    "-frames:v",
    "1",
    "-vf",
    "scale=32:32:flags=area",
    "-f",
    "rawvideo",
    "-pix_fmt",
    "rgb24",
    "-",
  ]);
  return Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
}

function analyze(buf) {
  const n = buf.length / 3;
  const luma = new Float64Array(n);
  let sum = 0;
  let sum2 = 0;
  let min = 255;
  let max = 0;
  let colorSum = 0;
  const bins = new Map();

  for (let i = 0, p = 0; i < buf.length; i += 3, p += 1) {
    const r = buf[i];
    const g = buf[i + 1];
    const b = buf[i + 2];
    const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    luma[p] = y;
    sum += y;
    sum2 += y * y;
    if (y < min) min = y;
    if (y > max) max = y;
    colorSum += Math.max(r, g, b) - Math.min(r, g, b);
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    bins.set(key, (bins.get(key) || 0) + 1);
  }

  const mean = sum / n;
  const std = Math.sqrt(Math.max(0, sum2 / n - mean * mean));
  const colorVar = colorSum / n;

  let dominantKey = 0;
  let dominantCount = 0;
  for (const [key, count] of bins) {
    if (count > dominantCount) {
      dominantCount = count;
      dominantKey = key;
    }
  }
  const dr = ((dominantKey >> 8) & 0xf) * 17;
  const dg = ((dominantKey >> 4) & 0xf) * 17;
  const db = (dominantKey & 0xf) * 17;

  let covered = 0;
  let x0 = 32;
  let y0 = 32;
  let x1 = -1;
  let y1 = -1;
  for (let p = 0, i = 0; p < n; p += 1, i += 3) {
    const dist = Math.hypot(buf[i] - dr, buf[i + 1] - dg, buf[i + 2] - db);
    if (dist <= 36) continue;
    covered += 1;
    const x = p % 32;
    const y = Math.floor(p / 32);
    if (x < x0) x0 = x;
    if (y < y0) y0 = y;
    if (x > x1) x1 = x;
    if (y > y1) y1 = y;
  }

  let edge = 0;
  let edgeCount = 0;
  for (let y = 0; y < 32; y += 1) {
    for (let x = 0; x < 32; x += 1) {
      const i = y * 32 + x;
      if (x < 31) {
        edge += Math.abs(luma[i] - luma[i + 1]);
        edgeCount += 1;
      }
      if (y < 31) {
        edge += Math.abs(luma[i] - luma[i + 32]);
        edgeCount += 1;
      }
    }
  }
  edge = edgeCount ? edge / edgeCount : 0;

  const coverage = covered / n;
  const dominantShare = dominantCount / n;
  const bboxW = x1 >= x0 ? (x1 - x0 + 1) / 32 : 0;
  const bboxH = y1 >= y0 ? (y1 - y0 + 1) / 32 : 0;
  const centerX = x1 >= x0 ? (x0 + x1 + 1) / 64 : 0.5;
  const centerY = y1 >= y0 ? (y0 + y1 + 1) / 64 : 0.5;
  const centered =
    centerX > 0.25 && centerX < 0.75 && centerY > 0.25 && centerY < 0.75;

  return {
    mean,
    std,
    min,
    max,
    colorVar,
    edge,
    coverage,
    dominantShare,
    bboxW,
    bboxH,
    centerX,
    centerY,
    centered,
  };
}

function rejectionReasons(stats) {
  const reasons = [];
  const hasDetail = stats.std >= 2.5 || stats.edge >= 1.5;
  if (stats.mean < 6 && !hasDetail) reasons.push("almost black");
  if (stats.mean > 250 && !hasDetail) reasons.push("almost white");
  if (!hasDetail) reasons.push("flat / no detail");
  if (stats.dominantShare > 0.995 && stats.edge < 1) reasons.push("one solid color");
  const variedFrame =
    stats.dominantShare < 0.7 && stats.edge >= 2 && stats.std >= 8;
  if (stats.coverage < 0.02 && stats.dominantShare > 0.8)
    reasons.push("almost no component pixels");
  const spansFrame = Math.max(stats.bboxW, stats.bboxH) >= 0.45;
  const centeredSubject =
    stats.centered && stats.coverage >= 0.04 && Math.max(stats.bboxW, stats.bboxH) >= 0.15;
  const thinSliver =
    stats.coverage < 0.04 &&
    Math.max(stats.bboxW, stats.bboxH) > 0.25 &&
    Math.min(stats.bboxW, stats.bboxH) < 0.15;
  if (!spansFrame && !centeredSubject && !variedFrame)
    reasons.push("component too small");
  if (thinSliver && !variedFrame) reasons.push("thin sliver of the component");
  if (
    stats.dominantShare > 0.985 &&
    stats.coverage < 0.05 &&
    !centeredSubject
  )
    reasons.push("mostly one color with tiny component");
  return reasons;
}

function score(stats) {
  return (
    Math.min(1, stats.coverage / 0.5) * 0.4 +
    Math.min(1, stats.edge / 20) * 0.3 +
    Math.min(1, stats.colorVar / 70) * 0.2 +
    Math.min(1, Math.max(stats.bboxW, stats.bboxH)) * 0.1
  );
}

function encodeWebp(png, output, quality) {
  if (HAS_CWEBP) {
    run("cwebp", ["-quiet", "-q", String(quality), png, "-o", output]);
    return;
  }
  if (HAS_PYTHON_PIL) {
    const code = [
      "from PIL import Image",
      "import sys",
      `Image.open(sys.argv[1]).save(sys.argv[2], "WEBP", quality=int(sys.argv[3]), method=6)`,
    ].join("\n");
    run("python3", ["-c", code, png, output, String(quality)]);
    return;
  }
  run("ffmpeg", [
    "-y",
    "-i",
    png,
    "-c:v",
    "libwebp",
    "-quality",
    String(quality),
    output,
  ]);
}

function resizePng(png, output, width) {
  run("ffmpeg", [
    "-y",
    "-i",
    png,
    "-vf",
    `scale=${width}:-2:flags=lanczos`,
    output,
  ]);
}

function writePoster(bestPng, output) {
  const attempts = [];
  for (const quality of [75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10]) {
    attempts.push({ quality, width: WIDTH });
  }
  for (const width of [440, 400, 360, 320]) {
    for (const quality of [75, 65, 55, 45, 35, 25]) {
      attempts.push({ quality, width });
    }
  }

  let workingPng = bestPng;
  let resizedFor = WIDTH;
  for (const attempt of attempts) {
    if (attempt.width !== resizedFor) {
      const resized = bestPng.replace(/\.png$/i, `-${attempt.width}.png`);
      resizePng(bestPng, resized, attempt.width);
      workingPng = resized;
      resizedFor = attempt.width;
    }
    encodeWebp(workingPng, output, attempt.quality);
    const size = fs.statSync(output).size;
    if (size <= MAX_BYTES) {
      return { bytes: size, quality: attempt.quality, width: attempt.width };
    }
  }
  return { bytes: fs.statSync(output).size, quality: null, width: resizedFor };
}

function sampleTimes(duration, points) {
  const times = [];
  for (const point of points) {
    const seconds = Math.min(
      Math.max(duration * point, 0.05),
      Math.max(duration - 0.05, 0.05),
    );
    if (!times.some((value) => Math.abs(value - seconds) < 0.01)) {
      times.push(seconds);
    }
  }
  return times;
}

function evaluateVideo(videoFile, tmpDir, label) {
  const duration = durationOf(videoFile);
  if (!duration) throw new Error("cannot read video duration");

  const candidates = [];
  const seen = new Set();
  const tryPoints = (points) => {
    for (const seconds of sampleTimes(duration, points)) {
      const key = seconds.toFixed(2);
      if (seen.has(key)) continue;
      seen.add(key);
      const png = path.join(tmpDir, `${label}-${key}.png`);
      try {
        if (!extractFrame(videoFile, seconds, png)) continue;
        const stats = analyze(signature(png));
        candidates.push({
          png,
          seconds,
          stats,
          reasons: rejectionReasons(stats),
          score: score(stats),
        });
      } catch {
        // skip unreadable frame
      }
    }
  };

  tryPoints(CANDIDATE_POINTS);
  if (!candidates.some((candidate) => candidate.reasons.length === 0)) {
    tryPoints(FALLBACK_POINTS);
  }
  if (!candidates.some((candidate) => candidate.reasons.length === 0)) {
    tryPoints(DENSE_POINTS);
  }

  const valid = candidates
    .filter((candidate) => candidate.reasons.length === 0)
    .sort((a, b) => b.score - a.score);
  return { duration, candidates, best: valid[0] || null };
}

function posterStats(file) {
  const stats = analyze(signature(file));
  return { ...stats, bytes: fs.statSync(file).size };
}

function blankReasons(stats) {
  const reasons = [];
  const hasDetail = stats.std >= 2.5 || stats.edge >= 1.5;
  if (stats.mean < 6 && !hasDetail) reasons.push("almost black");
  if (stats.mean > 250 && !hasDetail) reasons.push("almost white");
  if (!hasDetail) reasons.push("flat / no detail");
  if (stats.dominantShare > 0.995 && stats.edge < 1) reasons.push("one solid color");
  return reasons;
}

function posterIssues(file) {
  if (!fs.existsSync(file)) return ["missing"];
  const stats = posterStats(file);
  const issues = blankReasons(stats);
  if (stats.bytes > MAX_BYTES)
    issues.push(`${(stats.bytes / 1024).toFixed(1)}KB over 15KB`);
  return issues;
}

function printAudit() {
  const slugs = listComponentSlugs().filter(
    (slug) => !slugArg || slug === slugArg,
  );
  let issueCount = 0;
  log("slug                             dark poster                     light poster                    video");
  log("-".repeat(110));
  for (const slug of slugs) {
    const cells = [];
    for (const theme of ["dark", "light"]) {
      const poster = path.join(VIDEO_DIR, slug, `${slug}-${theme}.webp`);
      const video = resolveVideo(slug, theme);
      const issues = posterIssues(poster);
      if (!video) issues.push("no video");
      if (issues.length) issueCount += 1;
      const size = fs.existsSync(poster)
        ? `${(fs.statSync(poster).size / 1024).toFixed(1)}KB`
        : "-";
      cells.push(
        `${theme === "dark" ? "" : ""}${issues.length ? "BAD " : "ok  "}${size.padEnd(6)}${issues.join(", ")}`,
      );
    }
    const videoLabel = resolveVideo(slug, "dark") ? "yes" : "NO";
    log(
      `${slug.padEnd(32)} ${cells[0].padEnd(32)} ${cells[1].padEnd(32)} ${videoLabel}`,
    );
  }
  log("-".repeat(110));
  log(`${issueCount} poster/theme issues found.`);
  return issueCount;
}

function check() {
  const slugs = listComponentSlugs().filter(
    (slug) => !slugArg || slug === slugArg,
  );
  const failures = [];
  const hashes = new Map();

  for (const slug of slugs) {
    for (const theme of ["dark", "light"]) {
      const poster = path.join(VIDEO_DIR, slug, `${slug}-${theme}.webp`);
      const video = resolveVideo(slug, theme);
      const issues = posterIssues(poster);
      if (!video) issues.push("no video source");
      if (issues.length) failures.push(`${slug}-${theme}: ${issues.join(", ")}`);

      if (fs.existsSync(poster)) {
        const hash = crypto
          .createHash("sha256")
          .update(signature(poster))
          .digest("hex");
        const list = hashes.get(hash) || [];
        list.push(`${slug}-${theme}`);
        hashes.set(hash, list);
      }
    }
  }

  for (const [hash, list] of hashes) {
    if (list.length < 2) continue;
    const slugsInGroup = new Set(list.map((entry) => entry.replace(/-(dark|light)$/, "")));
    if (slugsInGroup.size > 1) {
      failures.push(
        `poster image reused across components (${hash.slice(0, 8)}): ${list.join(", ")}`,
      );
    }
  }

  if (failures.length) {
    log(`Poster check failed (${failures.length}):`);
    for (const failure of failures) log(`  - ${failure}`);
    return 1;
  }

  log(`Poster check passed (${slugs.length} components).`);
  return 0;
}

function generate() {
  const slugs = listComponentSlugs().filter(
    (slug) => !slugArg || slug === slugArg,
  );
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "davinciui-posters-"));
  const summary = { created: 0, fixed: 0, skipped: 0, failed: 0 };
  const failures = [];

  try {
    for (const slug of slugs) {
      const dir = path.join(VIDEO_DIR, slug);
      fs.mkdirSync(dir, { recursive: true });

      for (const theme of ["dark", "light"]) {
        const poster = path.join(dir, `${slug}-${theme}.webp`);
        const exists = fs.existsSync(poster);
        const bad = KNOWN_BAD_SOURCES[slug]?.[theme];
        let video = resolveVideo(slug, theme);
        let note = "";

        if (!video) {
          summary.failed += 1;
          failures.push(`${slug}-${theme}: no video source`);
          log(`FAIL ${slug}-${theme} (no video source)`);
          continue;
        }

        if (onlyMissing && exists) {
          summary.skipped += 1;
          continue;
        }

        if (onlyMissing && bad?.fail) {
          summary.skipped += 1;
          log(`SKIP ${slug}-${theme} (${bad.reason})`);
          continue;
        }

        if (bad) {
          if (bad.keepExisting) {
            if (exists && posterIssues(poster).length === 0) {
              summary.skipped += 1;
              log(`KEEP ${slug}-${theme} (${bad.reason}; existing poster is good)`);
              continue;
            }
            summary.failed += 1;
            failures.push(`${slug}-${theme}: ${bad.reason}`);
            log(`FAIL ${slug}-${theme} (${bad.reason}; no good existing poster)`);
            continue;
          }
          if (bad.fail) {
            summary.failed += 1;
            failures.push(`${slug}-${theme}: ${bad.reason}`);
            log(`FAIL ${slug}-${theme} (${bad.reason})`);
            continue;
          }
          if (bad.fallbackTheme) {
            const fallback = resolveVideo(slug, bad.fallbackTheme);
            if (fallback) {
              video = fallback;
              note = ` [${bad.reason}; used ${bad.fallbackTheme} video]`;
            }
          }
        }

        let videoFile;
        try {
          videoFile = materialize(video);
        } catch (error) {
          summary.failed += 1;
          failures.push(`${slug}-${theme}: ${error.message}`);
          log(`FAIL ${slug}-${theme} (${error.message})`);
          continue;
        }

        let result;
        try {
          result = evaluateVideo(videoFile, tmpDir, `${slug}-${theme}`);
        } catch (error) {
          summary.failed += 1;
          failures.push(`${slug}-${theme}: ${error.message}`);
          log(`FAIL ${slug}-${theme} (${error.message})`);
          continue;
        }

        if (!result.best) {
          const best = [...result.candidates].sort((a, b) => b.score - a.score)[0];
          const detail = best
            ? `${best.reasons.join(", ")} (mean ${best.stats.mean.toFixed(0)}, std ${best.stats.std.toFixed(0)}, edge ${best.stats.edge.toFixed(1)}, coverage ${(best.stats.coverage * 100).toFixed(0)}%, dominant ${(best.stats.dominantShare * 100).toFixed(0)}%, bbox ${(best.stats.bboxW * 100).toFixed(0)}x${(best.stats.bboxH * 100).toFixed(0)}%, center ${(best.stats.centerX * 100).toFixed(0)},${(best.stats.centerY * 100).toFixed(0)})`
            : "no readable frames";
          summary.failed += 1;
          failures.push(`${slug}-${theme}: ${detail}`);
          log(`FAIL ${slug}-${theme} (${detail})`);
          continue;
        }

        const saved = writePoster(result.best.png, poster);
        if (!saved.quality) {
          summary.failed += 1;
          failures.push(
            `${slug}-${theme}: could not get under 15KB (${(saved.bytes / 1024).toFixed(1)}KB)`,
          );
          log(
            `FAIL ${slug}-${theme} (${(saved.bytes / 1024).toFixed(1)}KB at ${saved.width}px)`,
          );
          continue;
        }

        if (verbose) {
          const s = result.best.stats;
          log(
            `  stats: mean ${s.mean.toFixed(0)}, std ${s.std.toFixed(1)}, edge ${s.edge.toFixed(1)}, coverage ${(s.coverage * 100).toFixed(1)}%, dominant ${(s.dominantShare * 100).toFixed(0)}%, bbox ${(s.bboxW * 100).toFixed(0)}x${(s.bboxH * 100).toFixed(0)}%, center ${(s.centerX * 100).toFixed(0)},${(s.centerY * 100).toFixed(0)}`,
          );
        }
        if (exists) summary.fixed += 1;
        else summary.created += 1;
        log(
          `${exists ? "FIX " : "NEW "} ${slug}-${theme} (${(saved.bytes / 1024).toFixed(1)}KB, q${saved.quality}, ${saved.width}px, ${(result.best.seconds / result.duration * 100).toFixed(0)}%)${note}`,
        );
      }
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  log("");
  log("=== Poster summary ===");
  log(`Created: ${summary.created}`);
  log(`Fixed:   ${summary.fixed}`);
  log(`Skipped: ${summary.skipped}`);
  log(`Failed:  ${summary.failed}`);
  if (failures.length) {
    log("Failures:");
    for (const failure of failures) log(`  - ${failure}`);
  }
  return summary.failed > 0 ? 1 : 0;
}

if (checkOnly) {
  process.exit(check());
} else if (auditOnly) {
  printAudit();
  process.exit(0);
} else {
  process.exit(generate());
}
