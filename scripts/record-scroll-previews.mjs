#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE_URL = process.env.PREVIEW_BASE_URL || "http://localhost:3000";
const OUT_DIR = path.resolve(ROOT, "tmp/previews");
const POSTER_DIR = path.resolve(ROOT, "apps/web/public/preview-videos/home");
const WIDTH = 1280;
const HEIGHT = 720;
const FPS = 30;
const WARMUP_S = 2.5;
const FOOTAGE_S = 5;
const TOTAL_S = WARMUP_S + FOOTAGE_S;
const MAX_BYTES = 3 * 1024 * 1024;
const BITRATES = ["4800k", "3200k", "2400k", "1800k", "1200k", "800k"];
const CONSENT_KEY = "davinciui.cookie-consent";
const CONSENT_VALUE = "denied";

const TARGETS = {
  "wavy-flow-carousel": { selector: 'html[data-wavy-ready="1"]' },
  "scroll-timeline": { selector: '[data-testid="scroll-timeline-track"]' },
  "scroll-media-expand": { selector: '[data-testid="scroll-media-expand-track"]' },
  "interactive-media-accordion": { selector: '[data-slot="interactive-media-accordion"]' },
  "stacked-scroll-gallery": { selector: '[data-testid="stacked-scroll-gallery-track"]', query: "?smoothing=0" },
};

const SLUGS = Object.keys(TARGETS);

function flag(name) {
  const args = process.argv.slice(2);
  const index = args.indexOf(name);
  if (index >= 0) return args[index + 1];
  const inline = args.find((arg) => arg.startsWith(`${name}=`));
  return inline ? inline.slice(name.length + 1) : undefined;
}

function parseSlugs() {
  const only = flag("--only");
  const slugs = only
    ? only.split(",").map((slug) => slug.trim()).filter(Boolean)
    : SLUGS;
  for (const slug of slugs) {
    if (!SLUGS.includes(slug)) throw new Error(`Unknown slug: ${slug}`);
  }
  return slugs;
}

function run(bin, args, options = {}) {
  try {
    return execFileSync(bin, args, {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 32 * 1024 * 1024,
      ...options,
    });
  } catch (error) {
    throw new Error(`${bin} failed: ${error.stderr?.toString?.() || error.message}`);
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function launchBrowser() {
  return chromium.launch({
    headless: true,
    channel: "chrome",
    args: [
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
      "--ignore-gpu-blocklist",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
      "--disable-dev-shm-usage",
    ],
  });
}

async function preparePage(context, slug) {
  const target = TARGETS[slug];
  const page = await context.newPage();
  await page.route(
    (url) => /posthog/i.test(url.hostname),
    (route) => route.abort(),
  );
  await page.goto(`${BASE_URL}/demo/${slug}${target.query || ""}`, {
    waitUntil: "networkidle",
    timeout: 60000,
  });
  await page.waitForSelector(target.selector, { timeout: 20000 });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  await page.addStyleTag({
    content: `
      html, body { margin: 0 !important; overflow-x: hidden !important; scrollbar-width: none !important; }
      html::-webkit-scrollbar, body::-webkit-scrollbar { display: none !important; }
      *, *::before, *::after { cursor: none !important; }
      a[href="#main-content"],
      nextjs-portal,
      [data-nextjs-toast], [data-nextjs-dialog], [data-nextjs-portal],
      [data-sonner-toaster], [data-radix-toast-viewport],
      [data-cookie-banner], [aria-label="Cookie consent"],
      [role="dialog"], [role="alertdialog"],
      [aria-live="polite"], [aria-live="assertive"] {
        display: none !important; visibility: hidden !important;
      }
    `,
  });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(600);
  return page;
}

async function captureFrames(page, slug) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Page.enable");
  const frames = [];
  const startedAt = Date.now() / 1000;
  const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  if (slug === "wavy-flow-carousel") {
    await page.mouse.move(WIDTH / 2, HEIGHT / 2);
  }
  let lastWheel = -Infinity;
  const totalFrames = TOTAL_S * FPS;
  for (let index = 0; index < totalFrames; index += 1) {
    const target = startedAt + index / FPS;
    const delay = (target - Date.now() / 1000) * 1000;
    if (delay > 0) await wait(delay);
    const elapsed = index / FPS;
    if (elapsed >= WARMUP_S) {
      const progress = Math.min(1, (elapsed - WARMUP_S) / FOOTAGE_S);
      if (slug === "wavy-flow-carousel") {
        if (elapsed - lastWheel >= 1.2) {
          lastWheel = elapsed;
          await page.mouse.wheel(0, 160).catch(() => {});
        }
      } else {
        await page.evaluate(
          ({ max, value }) => window.scrollTo({ top: max * value, behavior: "instant" }),
          { max: maxScroll, value: progress },
        );
      }
    }
    const { data } = await cdp.send("Page.captureScreenshot", {
      format: "jpeg",
      quality: 95,
      clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT, scale: 1 },
      captureBeyondViewport: false,
      fromSurface: true,
      optimizeForSpeed: true,
    });
    frames.push(Buffer.from(data, "base64"));
  }
  await cdp.detach().catch(() => {});
  return frames;
}

function writeFrames(frames, rawDir) {
  fs.mkdirSync(rawDir, { recursive: true });
  frames.forEach((frame, index) => {
    fs.writeFileSync(
      path.join(rawDir, `frame-${String(index).padStart(4, "0")}.jpg`),
      frame,
    );
  });
}

function encode(rawDir, rawVideo) {
  run("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-framerate", String(FPS),
    "-i", path.join(rawDir, "frame-%04d.jpg"),
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
    "-pix_fmt", "yuv420p", "-an", rawVideo,
  ]);
}

function trim(rawVideo, finalVideo, bitrate) {
  run("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-ss", String(WARMUP_S),
    "-i", rawVideo,
    "-t", String(FOOTAGE_S),
    "-vf", "scale=in_range=pc:out_range=tv,format=yuv420p",
    "-color_range", "tv",
    "-c:v", "libx264", "-preset", "medium",
    "-b:v", bitrate, "-minrate", bitrate, "-maxrate", bitrate,
    "-bufsize", "5M", "-g", String(FPS),
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", finalVideo,
  ]);
}

function chooseBitrate(rawVideo, finalVideo) {
  for (const bitrate of BITRATES) {
    trim(rawVideo, finalVideo, bitrate);
    const size = fs.statSync(finalVideo).size;
    if (size <= MAX_BYTES) return { bitrate, size };
  }
  throw new Error("Unable to encode below the 3 MB limit.");
}

function verify(video) {
  const info = JSON.parse(run("ffprobe", [
    "-v", "error",
    "-show_entries", "stream=codec_name,codec_type,width,height,pix_fmt,r_frame_rate",
    "-show_entries", "format=duration,size",
    "-of", "json", video,
  ], { encoding: "utf8" }));
  const stream = info.streams?.find((entry) => entry.codec_type === "video");
  const issues = [];
  if (stream?.codec_name !== "h264") issues.push("not h264");
  if (stream?.pix_fmt !== "yuv420p") issues.push("not yuv420p");
  if (stream?.width !== WIDTH || stream?.height !== HEIGHT) issues.push("wrong resolution");
  if (stream?.r_frame_rate !== `${FPS}/1`) issues.push("wrong fps");
  const duration = Number.parseFloat(info.format?.duration);
  if (duration < 4.8 || duration > 5.2) issues.push("wrong duration");
  const size = Number.parseInt(info.format?.size, 10);
  if (size > MAX_BYTES) issues.push("over 3 MB");
  if (issues.length) throw new Error(`QC failed: ${issues.join(", ")}`);
  return { duration, size };
}

function writePoster(video, posterFile) {
  fs.mkdirSync(path.dirname(posterFile), { recursive: true });
  const pngFile = `${posterFile}.png`;
  run("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-ss", "2.5", "-i", video, "-frames:v", "1", pngFile,
  ]);
  run("cwebp", ["-quiet", "-q", "82", "-o", posterFile, pngFile]);
  fs.rmSync(pngFile, { force: true });
}

async function recordTheme(slug, theme, attempt) {
  const target = TARGETS[slug];
  const browser = await launchBrowser();
  try {
    const context = await browser.newContext({
      viewport: { width: WIDTH, height: HEIGHT },
      deviceScaleFactor: 1,
      colorScheme: theme,
      reducedMotion: target.reducedMotion || "no-preference",
      storageState: {
        cookies: [],
        origins: [
          {
            origin: BASE_URL,
            localStorage: [
              { name: "theme", value: theme },
              { name: CONSENT_KEY, value: CONSENT_VALUE },
            ],
          },
        ],
      },
    });
    await context.addInitScript(
      ({ themeName, key, value }) => {
        try {
          localStorage.setItem("theme", themeName);
          localStorage.setItem(key, value);
          document.documentElement.classList.toggle("dark", themeName === "dark");
          document.documentElement.classList.toggle("light", themeName === "light");
        } catch {}
      },
      { themeName: theme, key: CONSENT_KEY, value: CONSENT_VALUE },
    );
    const page = await preparePage(context, slug);
    const rawDir = path.join(OUT_DIR, ".raw", `${slug}-${theme}-attempt-${attempt}`);
    const rawVideo = path.join(rawDir, "full-raw.mp4");
    const finalVideo = path.join(OUT_DIR, slug, `${slug}-${theme}.mp4`);
    const posterFile = path.join(POSTER_DIR, slug, `${slug}-${theme}.webp`);
    fs.mkdirSync(path.dirname(finalVideo), { recursive: true });
    try {
      const frames = await captureFrames(page, slug);
      writeFrames(frames, rawDir);
      encode(rawDir, rawVideo);
      const encoded = chooseBitrate(rawVideo, finalVideo);
      const qc = verify(finalVideo);
      writePoster(finalVideo, posterFile);
      return { theme, file: finalVideo, poster: posterFile, ...encoded, ...qc };
    } finally {
      fs.rmSync(rawDir, { recursive: true, force: true });
      await page.close().catch(() => {});
      await context.close().catch(() => {});
    }
  } finally {
    await browser.close().catch(() => {});
  }
}

async function recordSlug(slug) {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const light = await recordTheme(slug, "light", attempt);
      const dark = await recordTheme(slug, "dark", attempt);
      return { slug, light, dark, attempt };
    } catch (error) {
      if (attempt === 2) throw error;
    }
  }
  throw new Error("unreachable");
}

async function main() {
  const slugs = parseSlugs();
  fs.mkdirSync(OUT_DIR, { recursive: true });
  if (process.argv.includes("--dry-run")) {
    console.log("Would record:", slugs.join(", "));
    return;
  }
  const results = [];
  for (let index = 0; index < slugs.length; index += 2) {
    const batch = slugs.slice(index, index + 2);
    const settled = await Promise.allSettled(batch.map((slug) => recordSlug(slug)));
    settled.forEach((outcome, position) => {
      const slug = batch[position];
      if (outcome.status === "fulfilled") {
        results.push(outcome.value);
        console.log(`✓ ${slug} (attempt ${outcome.value.attempt})`);
      } else {
        console.log(`✗ ${slug}: ${outcome.reason.message}`);
      }
    });
  }
  console.log(`\nRecorded ${results.length}/${slugs.length} previews.`);
  if (results.length !== slugs.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
