#!/usr/bin/env node
/**
 * Records the 10 homepage bento previews in dark + light themes and encodes
 * each one to WebM (VP9), MP4 (H.264) and a WebP poster.
 *
 * Requires a running app that serves /capture/[slug] (dev server is fine):
 *   CAPTURE_BASE_URL=http://127.0.0.1:3000 FFMPEG_PATH=/path/to/ffmpeg \
 *     node scripts/capture-home-previews.mjs [--force] [slug ...]
 *
 * Output: $TMPDIR/davinciui-home-previews/out/<slug>/<slug>-<theme>.<ext>
 */
import { chromium } from "playwright";
import { execFile } from "node:child_process";
import { mkdir, rename, rm, stat } from "node:fs/promises";
import { promisify } from "node:util";
import os from "node:os";
import path from "node:path";

const execFileAsync = promisify(execFile);

const BASE_URL = process.env.CAPTURE_BASE_URL ?? "http://127.0.0.1:3000";
const FFMPEG = process.env.FFMPEG_PATH ?? "ffmpeg";
const THEMES = ["dark", "light"];
const LEAD_MS = 1800;
const MOTION_MS = 4000;

/** Desktop media box of each homepage bento card + retina capture scale. */
const SIZES = {
  "cinematic-card-carousel": { width: 656, height: 380, scale: 1.2 },
  "pixel-wipe-carousel": { width: 312, height: 380, scale: 2 },
  "sunlight-effect": { width: 312, height: 380, scale: 2 },
  "hover-cards": { width: 885, height: 340, scale: 0.9 },
  "pixel-flow": { width: 427, height: 340, scale: 1.8 },
  "gsap-text": { width: 427, height: 260, scale: 1.8 },
  "text-video-mask": { width: 427, height: 260, scale: 1.8 },
  "scroll-reveal-image": { width: 427, height: 260, scale: 1.8 },
  "lens-drift-grid": { width: 885, height: 300, scale: 1 },
  "geometric-trail-cursor": { width: 427, height: 300, scale: 1.8 },
};

function stageSize(slug) {
  const size = SIZES[slug] ?? { width: 760, height: 480, scale: 1 };
  return {
    width: Math.round(size.width * size.scale),
    height: Math.round(size.height * size.scale),
  };
}

const ALL_SLUGS = [
  "cinematic-card-carousel",
  "pixel-wipe-carousel",
  "sunlight-effect",
  "hover-cards",
  "pixel-flow",
  "gsap-text",
  "text-video-mask",
  "scroll-reveal-image",
  "lens-drift-grid",
  "geometric-trail-cursor",
];

const args = process.argv.slice(2);
const force = args.includes("--force");
const slugs = args.filter((arg) => !arg.startsWith("--"));
const targets = slugs.length ? slugs : ALL_SLUGS;

const ROOT = path.join(os.tmpdir(), "davinciui-home-previews");
const RAW = path.join(ROOT, "raw");
const OUT = path.join(ROOT, "out");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

/** Small pointer motions so cursor-driven previews actually animate. */
async function mouseChoreography(page, slug, durationMs, stage) {
  const steps = Math.max(8, Math.round(durationMs / 90));
  const cx = stage.width / 2;
  const cy = stage.height / 2;

  if (slug === "hover-cards") {
    for (let i = 0; i < steps; i += 1) {
      const t = i / steps;
      const x = 70 + (stage.width - 140) * (0.5 + 0.5 * Math.sin(t * Math.PI * 2));
      const y = cy + Math.sin(t * Math.PI * 4) * 90;
      await page.mouse.move(x, y, { steps: 3 });
      await sleep(durationMs / steps);
    }
    return;
  }

  if (slug === "geometric-trail-cursor") {
    for (let i = 0; i < steps; i += 1) {
      const t = (i / steps) * Math.PI * 2;
      const x = cx + Math.cos(t) * 210;
      const y = cy + Math.sin(t * 2) * 140;
      await page.mouse.move(x, y, { steps: 2 });
      await sleep(durationMs / steps);
    }
    return;
  }

  if (slug === "lens-drift-grid") {
    await sleep(durationMs);
  }
}

async function record(browser, slug, theme) {
  const webmOut = path.join(OUT, slug, `${slug}-${theme}.webm`);
  if (!force && (await exists(webmOut))) {
    console.log(`skip ${slug} (${theme}) — exists`);
    return;
  }

  const videoDir = path.join(RAW, `${slug}-${theme}`);
  await rm(videoDir, { recursive: true, force: true });
  await mkdir(videoDir, { recursive: true });

  const stage = stageSize(slug);
  const recordingStartedAt = Date.now();
  const context = await browser.newContext({
    viewport: { width: stage.width, height: stage.height },
    deviceScaleFactor: 2,
    colorScheme: theme,
    recordVideo: {
      dir: videoDir,
      size: { width: stage.width, height: stage.height },
    },
  });

  await context.addInitScript(
    ({ themeName }) => {
      try {
        localStorage.setItem("theme", themeName);
        localStorage.setItem("davinciui.cookie-consent", "denied");
      } catch {}
    },
    { themeName: theme },
  );

  const page = await context.newPage();
  const posterRaw = path.join(RAW, `${slug}-${theme}.png`);
  let trimStart = 1.2;

  try {
    await page.goto(`${BASE_URL}/capture/${slug}`, {
      waitUntil: "networkidle",
      timeout: 60_000,
    });
    await page.waitForSelector('[data-capture-ready="true"]', { timeout: 30_000 });
    if (slug === "lens-drift-grid") {
      const readyAt = (Date.now() - recordingStartedAt) / 1000;
      trimStart = Math.max(1.2, readyAt + 0.3);
    }
    await page.addStyleTag({
      content:
        "nextjs-portal{display:none!important} #skip-to-content{display:none!important}",
    });

    await sleep(LEAD_MS);
    await mouseChoreography(page, slug, MOTION_MS, stage);
    await sleep(350);

    await page.screenshot({ path: posterRaw, type: "png" });
  } finally {
    const video = page.video();
    await page.close();
    await context.close();

    if (video) {
      const recorded = await video.path();
      const rawWebm = path.join(RAW, `${slug}-${theme}.webm`);
      await rename(recorded, rawWebm).catch(() => {});
      await encode(slug, theme, rawWebm, posterRaw, trimStart);
    }
  }
}

async function encode(slug, theme, rawWebm, posterRaw, trimStart = 1.2) {
  const dir = path.join(OUT, slug);
  await mkdir(dir, { recursive: true });
  const base = path.join(dir, `${slug}-${theme}`);

  // Seek after the input (accurate) and pad the tail so every clip is 4.0s
  // even when Playwright's recording is shorter than expected.
  const trim = ["-ss", String(trimStart), "-t", "4"];
  const pad = "fps=24,tpad=stop_mode=clone:stop_duration=4";

  await execFileAsync(
    FFMPEG,
    [
      "-y",
      "-i",
      rawWebm,
      ...trim,
      "-vf",
      pad,
      "-an",
      "-c:v",
      "libvpx-vp9",
      "-row-mt",
      "1",
      "-deadline",
      "good",
      "-cpu-used",
      "4",
      "-crf",
      "38",
      "-b:v",
      "0",
      "-g",
      "48",
      `${base}.webm`,
    ],
    { maxBuffer: 10 * 1024 * 1024 },
  );

  await execFileAsync(
    FFMPEG,
    [
      "-y",
      "-i",
      rawWebm,
      ...trim,
      "-vf",
      pad,
      "-an",
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "30",
      "-pix_fmt",
      "yuv420p",
      "-g",
      "48",
      "-keyint_min",
      "48",
      "-movflags",
      "+faststart",
      `${base}.mp4`,
    ],
    { maxBuffer: 10 * 1024 * 1024 },
  );

  await execFileAsync(
    FFMPEG,
    [
      "-y",
      "-i",
      posterRaw,
      "-vf",
      "scale=trunc(iw/2)*2:-2:flags=lanczos",
      "-frames:v",
      "1",
      "-c:v",
      "libwebp",
      "-quality",
      "82",
      `${base}.webp`,
    ],
    { maxBuffer: 10 * 1024 * 1024 },
  );

  const size = async (ext) =>
    Math.round((await stat(`${base}.${ext}`)).size / 1024);
  console.log(
    `done ${slug} (${theme}) — webm ${await size("webm")}KB · mp4 ${await size("mp4")}KB · webp ${await size("webp")}KB`,
  );
}

async function main() {
  await mkdir(RAW, { recursive: true });
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch();
  try {
    for (const theme of THEMES) {
      for (const slug of targets) {
        if (!ALL_SLUGS.includes(slug)) {
          console.warn(`skip unknown slug: ${slug}`);
          continue;
        }
        await record(browser, slug, theme);
      }
    }
  } finally {
    await browser.close();
  }

  console.log(`\nassets: ${OUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
