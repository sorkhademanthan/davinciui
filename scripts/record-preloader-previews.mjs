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
const WARMUP_S = 3;
const FOOTAGE_S = 5;
const TOTAL_S = WARMUP_S + FOOTAGE_S;
const REPLAY_EVERY_S = 1.3;
const MAX_BYTES = 3 * 1024 * 1024;
const BITRATES = ["4800k", "3200k", "2400k", "1800k", "1200k", "800k"];
const CONSENT_KEY = "davinciui.cookie-consent";
const CONSENT_VALUE = "denied";

const SLUGS = [
  "editorial-curtain-preloader",
  "pixel-preloader",
  "fill-preloader",
  "cinematic-panel-preloader",
  "glitch-shred-preloader",
  "editorial-card-arc-preloader",
  "masked-arc-preloader",
  "staircase-preloader",
  "geometric-preloader",
  "editorial-wipe-preloader",
];

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
  const page = await context.newPage();
  await page.route(
    (url) => /posthog/i.test(url.hostname),
    (route) => route.abort(),
  );
  await page.goto(`${BASE_URL}/experience/components/${slug}`, {
    waitUntil: "networkidle",
    timeout: 60000,
  });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  await page.locator('[aria-label="Expand preview pane"]').click();
  await page.waitForSelector('[data-preview-expanded="true"]', { timeout: 20000 });
  await page.waitForTimeout(650);
  await page.addStyleTag({
    content: `
      html, body { margin: 0 !important; overflow: hidden !important; scrollbar-width: none !important; }
      html::-webkit-scrollbar, body::-webkit-scrollbar { display: none !important; }
      *, *::before, *::after { cursor: none !important; }
      [data-preview-expanded="true"] > div:first-child { display: none !important; }
      [data-preview-expanded="true"] { border: 0 !important; border-radius: 0 !important; }
      nextjs-portal,
      [data-nextjs-toast], [data-nextjs-dialog], [data-nextjs-portal],
      [data-sonner-toaster], [data-radix-toast-viewport],
      [data-cookie-banner], [aria-label="Cookie consent"],
      [role="dialog"]:not([data-preview-expanded="true"]),
      [role="alertdialog"],
      [aria-live="polite"], [aria-live="assertive"] {
        display: none !important; visibility: hidden !important;
      }
    `,
  });
  return page;
}

async function captureFrames(page) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Page.enable");
  const frames = [];
  const startedAt = Date.now() / 1000;
  let lastReplay = -Infinity;
  const replay = () => page.evaluate(() => {
    document.querySelector('[aria-label="Reload preview"]')?.click();
  });
  await replay();
  const timer = setInterval(async () => {
    const elapsed = Date.now() / 1000 - startedAt;
    if (elapsed < WARMUP_S) return;
    if (elapsed - lastReplay >= REPLAY_EVERY_S) {
      lastReplay = elapsed;
      await replay().catch(() => {});
    }
  }, 40);
  const totalFrames = TOTAL_S * FPS;
  for (let index = 0; index < totalFrames; index += 1) {
    const target = startedAt + index / FPS;
    const delay = (target - Date.now() / 1000) * 1000;
    if (delay > 0) await wait(delay);
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
  clearInterval(timer);
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
  const browser = await launchBrowser();
  try {
    const context = await browser.newContext({
      viewport: { width: WIDTH, height: HEIGHT },
      deviceScaleFactor: 1,
      colorScheme: theme,
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
      const frames = await captureFrames(page);
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

async function main() {
  const slugs = parseSlugs();
  fs.mkdirSync(OUT_DIR, { recursive: true });
  if (process.argv.includes("--dry-run")) {
    console.log("Would record:", slugs.join(", "));
    return;
  }
  const results = [];
  const failures = [];
  for (const slug of slugs) {
    let accepted = null;
    let reason = "";
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const light = await recordTheme(slug, "light", attempt);
        const dark = await recordTheme(slug, "dark", attempt);
        accepted = { slug, light, dark, attempt };
        break;
      } catch (error) {
        reason = error.message;
      }
    }
    if (accepted) {
      results.push(accepted);
      console.log(`✓ ${slug} (attempt ${accepted.attempt})`);
    } else {
      failures.push({ slug, reason });
      console.log(`✗ ${slug}: ${reason}`);
    }
  }
  console.log(`\nRecorded ${results.length}/${slugs.length} preloaders.`);
  if (failures.length) {
    for (const failure of failures) console.log(`- ${failure.slug}: ${failure.reason}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
