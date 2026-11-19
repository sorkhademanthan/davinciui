#!/usr/bin/env node
"use strict";

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_OUT = path.join(ROOT, "tmp/previews");
const BASE_URL = process.env.PREVIEW_BASE_URL || "http://localhost:3000";

const WIDTH = 1280;
const HEIGHT = 720;
const FPS = 30;
const WARMUP_S = 3;
const FOOTAGE_S = 5;
const TOTAL_S = WARMUP_S + FOOTAGE_S;
const MAX_BYTES = 3 * 1024 * 1024;
const MIN_BYTES = 0.5 * 1024 * 1024;
const MOTION_THRESHOLD = 0.3;
const BITRATES = ["1200k", "1800k", "2400k", "3200k", "4800k", "6400k", "9600k", "12800k", "800k", "500k"];
const THEMES = ["light", "dark"];
const CONSENT_KEY = "davinciui.cookie-consent";
const CONSENT_VALUE = "denied";
const OVERLAY_TERMS = [
  "Privacy-friendly analytics",
  "PostHog",
  "Accept",
  "Decline",
];

const SLUGS = {
  "curved-inline-type": { route: "/demo/curved-inline-type", root: "html", interaction: "autoScroll" },
  "shake-text": { interaction: "autoplay", motionThreshold: 0.18 },
  "rolling-text": { interaction: "autoplayReplayLoop", replayEvery: 1.4, startReplayAt: WARMUP_S + 0.2, firstFrameMinEdge: 0.004, firstFrameMinGradient: 1.0 },
  "media-text-hover": { interaction: "hoverPulse", interactionTarget: '[data-slot="media-text-hover"]' },
  "random-text-reveal": { interaction: "autoplayReplayLoop", replayEvery: 1.5 },
  "text-morph": { interaction: "autoplay", keyframeInterval: 1, firstFrameMinGradient: 0.9 },
  "text-reveal": { interaction: "scroll", linearScroll: true },
  "shader-text": { interaction: "autoplay", firstFrameMinGradient: 1.3, motionThreshold: 0.25 },
  "fluid-particle-text": { route: "/demo/fluid-particle-text", root: "html", interaction: "figure8" },
  "encrypted-text": { interaction: "autoplayReplayLoop", replayEvery: 1.2, startReplayAt: WARMUP_S + 0.2 },
  "glitch-liquid-text": { interaction: "figure8" },
};

function flag(name) {
  const args = process.argv.slice(2);
  const index = args.indexOf(name);
  if (index >= 0) return args[index + 1];
  const inline = args.find((arg) => arg.startsWith(`${name}=`));
  return inline ? inline.slice(name.length + 1) : undefined;
}

function parseSlugs() {
  const only = flag("--only");
  if (!only) {
    throw new Error("--only is required (comma-separated slug list).");
  }
  const slugs = only
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);
  for (const slug of slugs) {
    if (!SLUGS[slug]) {
      throw new Error(`Unknown slug: ${slug}. Known: ${Object.keys(SLUGS).join(", ")}`);
    }
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
    const stderr = error.stderr?.toString?.() || "";
    throw new Error(`${bin} failed: ${stderr || error.message}`);
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mb(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function launchBrowser() {
  return chromium.launch({
    headless: true,
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

function previewUrl(slug) {
  const route = SLUGS[slug].route || `/experience/components/${slug}`;
  return `${BASE_URL}${route}`;
}

async function preparePage(context, slug, theme, outDir) {
  const page = await context.newPage();
  await page.route(
    (url) => /posthog/i.test(url.hostname),
    (route) => route.abort(),
  );

  await page.goto(previewUrl(slug), { waitUntil: "networkidle", timeout: 60000 });
  await page.bringToFront();
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });

  if (!SLUGS[slug].route) {
    const expand = page.locator('[aria-label="Expand preview pane"]');
    if (await expand.count()) {
      await expand.click();
      await page.waitForSelector('[data-preview-expanded="true"]', { timeout: 20000 });
      await page.waitForTimeout(650);
    }
  }

  if (slug === "text-morph") {
    await page.evaluate(() => document.querySelector('[aria-label="Personalize"]')?.click());
    await page.waitForSelector('[aria-label="Close personalize panel"]', { timeout: 10000 });
    await page.locator('input[placeholder="DAVINCIUI, COMPONENTS"]').fill("MORPH, FLUID, TYPE");
    const intervalSlider = page.locator('input[type="range"]').nth(0);
    await intervalSlider.evaluate((input) => { input.min = "400"; });
    await intervalSlider.fill("400");
    await page.locator('input[type="range"]').nth(1).fill("280");
    await page.evaluate(() => document.querySelector('[aria-label="Close personalize panel"]')?.click());
    await page.waitForSelector('[aria-label="Close personalize panel"]', { state: "detached", timeout: 5000 });
  }

  await page.addStyleTag({
    content: `
      html, body { margin: 0 !important; ${SLUGS[slug].route ? "scrollbar-width: none !important;" : "overflow: hidden !important;"} }
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

  if (slug === "text-reveal") {
    await page.evaluate(() => {
      const scroller = document.querySelector("[data-preview-scroll-region]");
      let node = document.querySelector("[data-text-reveal-preview-trigger]");
      while (node && node !== scroller) {
        node.style.setProperty("overflow", "visible", "important");
        node = node.parentElement;
      }
    });
  }

  const rootSelector = SLUGS[slug].root || '[data-preview-expanded="true"]';
  await page.waitForSelector(rootSelector, { timeout: 20000 });
  await page.evaluate(
    (selector) => document.querySelector(selector)?.scrollIntoView?.(),
    rootSelector,
  );
  await page.waitForTimeout(150);

  const themeOk = await page.evaluate((value) => {
    const root = document.documentElement;
    return value === "dark"
      ? root.classList.contains("dark")
      : root.classList.contains("light") || !root.classList.contains("dark");
  }, theme);
  if (!themeOk) throw new Error(`Theme assertion failed for ${theme}: ${await page.evaluate(() => document.documentElement.className)}`);

  const visibleText = await page.evaluate((selector) => {
    const root = document.querySelector(selector);
    if (!root) return "";
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const values = [];
    while (walker.nextNode()) {
      const text = (walker.currentNode.textContent || "").replace(/\s+/g, " ").trim();
      if (!text || text.length < 2) continue;
      const element = walker.currentNode.parentElement;
      if (!element) continue;
      const style = getComputedStyle(element);
      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) continue;
      if (!values.includes(text)) values.push(text);
    }
    return values.join("\n");
  }, rootSelector);
  if (!visibleText.trim()) throw new Error("Component text assertion failed: no visible text found.");

  const textDir = path.join(outDir, "text");
  fs.mkdirSync(textDir, { recursive: true });
  const textFile = path.join(textDir, `${slug}-${theme}.txt`);
  fs.writeFileSync(textFile, `${visibleText.trim()}\n`);

  const hits = await page.evaluate((terms) => {
    const found = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const text = (walker.currentNode.textContent || "").trim();
      if (!text || !terms.some((term) => text.includes(term))) continue;
      const element = walker.currentNode.parentElement;
      if (!element) continue;
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const visible =
        rect.width > 0 &&
        rect.height > 0 &&
        rect.bottom > 0 &&
        rect.top < window.innerHeight &&
        rect.right > 0 &&
        rect.left < window.innerWidth &&
        style.visibility !== "hidden" &&
        style.display !== "none" &&
        Number(style.opacity) > 0;
      if (visible) found.push(text.slice(0, 120));
    }
    return found;
  }, OVERLAY_TERMS);
  if (hits.length) {
    throw new Error(`Consent overlay assertion FAILED: ${JSON.stringify(hits)}`);
  }

  const box = await page.locator(rootSelector).boundingBox();
  if (!box) throw new Error("Component container has no bounding box.");
  const clip = rootSelector === "html"
    ? { x: 0, y: 0, width: WIDTH, height: HEIGHT, scale: 1 }
    : {
        x: Math.round(box.x),
        y: Math.round(box.y),
        width: Math.round(box.width),
        height: Math.round(box.height),
        scale: 1,
      };
  if (clip.width !== WIDTH || clip.height !== HEIGHT) {
    throw new Error(`Unexpected component clip: ${clip.width}x${clip.height}`);
  }

  const referenceDir = path.join(outDir, "reference");
  fs.mkdirSync(referenceDir, { recursive: true });
  const reference = path.join(referenceDir, `${slug}-${theme}.png`);
  await page.screenshot({ path: reference, clip, animations: "disabled" });

  console.log(`  text assertion: PASS (${visibleText.trim().split("\n").length} strings saved)`);
  console.log("  consent overlay assertion: PASS (no visible consent/PostHog text)");

  return {
    page,
    clip,
    useClip: rootSelector !== "html",
    reference,
    textFile,
    text: visibleText.trim(),
  };
}

function startInteractions(page, slug) {
  const config = SLUGS[slug];
  const kind = config.interaction;
  if (kind === "autoplay") return () => {};
  let replayed = false;
  let lastReplay = -Infinity;
  let hoverRect = null;
  let hoverInside = null;
  let hoverOutside = null;
  const eased = (value) => {
    const p = Math.max(0, Math.min(1, value));
    return p * p * (3 - 2 * p);
  };
  const replayPreview = async () => {
    await page.evaluate(() => {
      document.querySelector('[aria-label="Reload preview"]')?.click();
    });
  };
  const prepareHover = async () => {
    if (hoverRect) return;
    hoverRect = await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    }, config.interactionTarget);
    if (!hoverRect) return;
    hoverInside = [
      Math.round(hoverRect.x + hoverRect.width / 2),
      Math.round(hoverRect.y + hoverRect.height / 2),
    ];
    const outsideX = hoverRect.x > 90
      ? Math.round(hoverRect.x - 60)
      : Math.round(Math.min(WIDTH - 2, hoverRect.x + hoverRect.width + 60));
    hoverOutside = [outsideX, Math.round(hoverRect.y + hoverRect.height / 2)];
  };

  const timer = setInterval(async () => {
    const elapsed = Number(await page.evaluate(() => window.__captureElapsed || 0));
    try {
      if (kind === "autoScroll") {
        await page.evaluate((progress) => {
          window.dispatchEvent(new Event("wheel", { bubbles: true, passive: true }));
          const max = document.documentElement.scrollHeight - window.innerHeight;
          const p = Math.max(0, Math.min(1, progress));
          window.scrollTo(0, p * p * (3 - 2 * p) * max);
        }, elapsed / TOTAL_S);
        return;
      }
      if (elapsed < WARMUP_S) {
        if (kind === "hoverPulse") {
          await prepareHover();
          if (hoverOutside) await page.mouse.move(...hoverOutside);
        }
        return;
      }
      const t = elapsed - WARMUP_S;
      if (kind === "scroll") {
        await page.evaluate(
          ({ progress, linear }) => {
            const scroller = document.querySelector("[data-preview-scroll-region]");
            if (!scroller) return;
            const max = scroller.scrollHeight - scroller.clientHeight;
            const p = Math.max(0, Math.min(1, progress));
            scroller.scrollTop = (linear ? p : p * p * (3 - 2 * p)) * max;
          },
          { progress: t / FOOTAGE_S, linear: config.linearScroll === true },
        );
      } else if (kind === "hover") {
        const p = t < 1 ? eased(t) : t < 3.5 ? 1 : 1 - eased((t - 3.5) / 1.5);
        await page.mouse.move(120 + p * 520, 360);
      } else if (kind === "hoverPulse") {
        await prepareHover();
        const point = t % 1.2 < 0.6 ? hoverInside : hoverOutside;
        if (point) await page.mouse.move(point[0], point[1]);
      } else if (kind === "figure8") {
        await page.mouse.move(
          WIDTH / 2 + Math.sin(t * 1.6) * 320,
          HEIGHT / 2 + Math.sin(t * 3.2) * 160,
        );
      } else if (kind === "autoplayReplay" && !replayed) {
        replayed = true;
        await replayPreview();
      } else if (kind === "autoplayReplayLoop") {
        const startAt = config.startReplayAt ?? WARMUP_S;
        if (elapsed >= startAt && elapsed - lastReplay >= (config.replayEvery || 1.5)) {
          lastReplay = elapsed;
          await replayPreview();
        }
      }
    } catch {}
  }, 33);

  return () => clearInterval(timer);
}

async function captureComponentFrames(page, clip, slug, useClip) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Page.enable");
  const frames = [];
  const startedAt = Date.now() / 1000;
  const stopInteractions = startInteractions(page, slug);
  const totalFrames = TOTAL_S * FPS;

  for (let index = 0; index < totalFrames; index += 1) {
    await page.evaluate((value) => {
      window.__captureElapsed = value;
    }, (Date.now() / 1000 - startedAt));
    const target = startedAt + index / FPS;
    const delay = (target - Date.now() / 1000) * 1000;
    if (delay > 0) await wait(delay);
    const { data } = await cdp.send("Page.captureScreenshot", {
      format: "jpeg",
      quality: 95,
      ...(useClip ? { clip } : {}),
      captureBeyondViewport: false,
      fromSurface: true,
      optimizeForSpeed: true,
    });
    frames.push({
      timestamp: Date.now() / 1000,
      data: Buffer.from(data, "base64"),
    });
  }

  stopInteractions();
  await cdp.detach().catch(() => {});
  return { frames, startedAt };
}

function nearestFrame(frames, target) {
  let low = 0;
  let high = frames.length - 1;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (frames[mid].timestamp < target) low = mid + 1;
    else high = mid;
  }
  const after = frames[low];
  const before = frames[Math.max(0, low - 1)];
  if (!after) return before;
  if (!before) return after;
  return Math.abs(after.timestamp - target) < Math.abs(before.timestamp - target)
    ? after
    : before;
}

function writeFrameSequence(frames, startedAt, rawDir) {
  fs.mkdirSync(rawDir, { recursive: true });
  const totalFrames = TOTAL_S * FPS;
  for (let index = 0; index < totalFrames; index += 1) {
    const frame = nearestFrame(frames, startedAt + index / FPS);
    if (!frame) throw new Error("No screencast frames were captured.");
    fs.writeFileSync(
      path.join(rawDir, `frame-${String(index).padStart(4, "0")}.jpg`),
      frame.data,
    );
  }
  return totalFrames;
}

function encodeRaw(rawDir, rawVideo) {
  run("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-framerate", String(FPS),
    "-i", path.join(rawDir, "frame-%04d.jpg"),
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
    "-pix_fmt", "yuv420p", "-an", rawVideo,
  ]);
}

function trimVideo(rawVideo, finalVideo, bitrate, slug) {
  const args = [
    "-hide_banner", "-loglevel", "error", "-y",
    "-ss", String(WARMUP_S),
    "-i", rawVideo,
    "-t", String(FOOTAGE_S),
    "-vf", "scale=in_range=pc:out_range=tv,format=yuv420p",
    "-color_range", "tv",
    "-c:v", "libx264", "-preset", "medium",
    "-b:v", bitrate, "-minrate", bitrate, "-maxrate", bitrate,
    "-bufsize", "5M",
  ];
  const interval = SLUGS[slug]?.keyframeInterval;
  if (interval) {
    args.push("-g", String(interval), "-keyint_min", String(interval), "-sc_threshold", "0");
  }
  args.push("-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", finalVideo);
  run("ffmpeg", args);
}

function chooseBitrate(rawVideo, finalVideo, slug) {
  let best = null;
  for (const bitrate of BITRATES) {
    trimVideo(rawVideo, finalVideo, bitrate, slug);
    const size = fs.statSync(finalVideo).size;
    if (size > MAX_BYTES) continue;
    if (size >= MIN_BYTES) return { bitrate, size };
    if (!best || size > best.size) best = { bitrate, size };
  }
  if (!best) throw new Error("Unable to encode below the 3 MB limit.");
  trimVideo(rawVideo, finalVideo, best.bitrate, slug);
  return best;
}

function probe(video) {
  const output = run("ffprobe", [
    "-v", "error",
    "-show_entries", "stream=codec_name,codec_type,width,height,pix_fmt,r_frame_rate,nb_frames",
    "-show_entries", "format=duration,size",
    "-of", "json", video,
  ], { encoding: "utf8" });
  return JSON.parse(output);
}

function extractPpm(video, timestamp) {
  return run("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-ss", timestamp.toFixed(3),
    "-i", video, "-frames:v", "1",
    "-f", "image2pipe", "-vcodec", "ppm", "pipe:1",
  ], { encoding: null });
}

function decodeImage(file) {
  return run("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-i", file, "-frames:v", "1",
    "-f", "image2pipe", "-vcodec", "ppm", "pipe:1",
  ], { encoding: null });
}

function extractPng(video, timestamp, output) {
  run("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-ss", timestamp.toFixed(3),
    "-i", video, "-frames:v", "1", output,
  ]);
}

function parsePpm(buffer) {
  let pos = 0;
  const token = () => {
    while (pos < buffer.length && /\s/.test(String.fromCharCode(buffer[pos]))) pos += 1;
    const start = pos;
    while (pos < buffer.length && !/\s/.test(String.fromCharCode(buffer[pos]))) pos += 1;
    return buffer.subarray(start, pos).toString("ascii");
  };
  if (token() !== "P6") throw new Error("Unexpected PPM header.");
  const width = Number.parseInt(token(), 10);
  const height = Number.parseInt(token(), 10);
  const max = Number.parseInt(token(), 10);
  if (max !== 255) throw new Error("Unexpected PPM color depth.");
  pos += 1;
  return { width, height, data: buffer.subarray(pos) };
}

function luminanceAt(frame, x, y) {
  const index = (y * frame.width + x) * 3;
  return (
    0.2126 * frame.data[index] +
    0.7152 * frame.data[index + 1] +
    0.0722 * frame.data[index + 2]
  );
}

function meanDiff(a, b) {
  if (a.data.length !== b.data.length) throw new Error("Frame size mismatch.");
  let total = 0;
  for (let index = 0; index < a.data.length; index += 1) {
    total += Math.abs(a.data[index] - b.data[index]);
  }
  return total / a.data.length;
}

function edgeStats(frame) {
  let sum = 0;
  let edges = 0;
  let count = 0;
  const x0 = Math.floor(frame.width * 0.08);
  const x1 = Math.floor(frame.width * 0.92);
  const y0 = Math.floor(frame.height * 0.08);
  const y1 = Math.floor(frame.height * 0.92);
  for (let y = y0 + 1; y < y1 - 1; y += 1) {
    for (let x = x0 + 1; x < x1 - 1; x += 1) {
      const gx = Math.abs(luminanceAt(frame, x + 1, y) - luminanceAt(frame, x - 1, y));
      const gy = Math.abs(luminanceAt(frame, x, y + 1) - luminanceAt(frame, x, y - 1));
      const magnitude = gx + gy;
      sum += magnitude;
      if (magnitude > 24) edges += 1;
      count += 1;
    }
  }
  return { meanGradient: sum / count, edgeFraction: edges / count };
}

function motionCheck(video, duration, threshold) {
  const windows = [];
  const offsets = [0.1, 0.3, 0.5, 0.7, 0.9];
  for (let second = 0; second < Math.floor(duration); second += 1) {
    const frames = offsets.map((offset) =>
      parsePpm(extractPpm(video, second + offset)),
    );
    let diff = 0;
    for (let start = 0; start < frames.length; start += 1) {
      for (let end = start + 1; end < frames.length; end += 1) {
        diff = Math.max(diff, meanDiff(frames[start], frames[end]));
      }
    }
    windows.push({ window: `${second}-${second + 1}`, diff });
  }
  return {
    windows,
    pass: windows.every((entry) => entry.diff > threshold),
  };
}

function loopCheck(video, duration) {
  return meanDiff(
    parsePpm(extractPpm(video, 0.1)),
    parsePpm(extractPpm(video, duration - 0.1)),
  );
}

function bottomRegionStats(frame, xStart, xEnd) {
  const yStart = Math.floor(frame.height * 0.75);
  const x0 = Math.floor(frame.width * xStart);
  const x1 = Math.floor(frame.width * xEnd);
  let sum = 0;
  let bright = 0;
  let count = 0;
  let edgeSum = 0;
  let edgeCount = 0;
  for (let y = yStart; y < frame.height; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const luminance = luminanceAt(frame, x, y);
      sum += luminance;
      if (luminance > 200) bright += 1;
      count += 1;
      if (x < x1 - 1) {
        edgeSum += Math.abs(luminance - luminanceAt(frame, x + 1, y));
        edgeCount += 1;
      }
    }
  }
  return { mean: sum / count, brightFraction: bright / count, energy: edgeSum / edgeCount };
}

function overlayFrameCheck(video, duration) {
  const samples = [
    { label: "0.5s", time: 0.5 },
    { label: "2.5s", time: 2.5 },
    { label: "end", time: duration - 0.5 },
  ];
  const results = samples.map(({ label, time }) => {
    const frame = parsePpm(extractPpm(video, time));
    const left = bottomRegionStats(frame, 0, 0.3);
    const right = bottomRegionStats(frame, 0.7, 1);
    const meanDelta = left.mean - right.mean;
    const brightDelta = left.brightFraction - right.brightFraction;
    return {
      label,
      ...left,
      meanDelta,
      brightDelta,
      flagged: left.energy > 3 && (left.mean > 140 || meanDelta > 10),
    };
  });
  return { results, pass: results.every((entry) => !entry.flagged) };
}

function textFidelityCheck(video, reference, duration) {
  const referenceStats = edgeStats(parsePpm(decodeImage(reference)));
  const samples = [
    { label: "0.5s", time: 0.5 },
    { label: "2.5s", time: 2.5 },
    { label: "end", time: duration - 0.5 },
  ];
  const results = samples.map(({ label, time }) => {
    const stats = edgeStats(parsePpm(extractPpm(video, time)));
    const ratio = stats.edgeFraction / Math.max(referenceStats.edgeFraction, 0.0005);
    return {
      label,
      edgeFraction: stats.edgeFraction,
      referenceEdgeFraction: referenceStats.edgeFraction,
      ratio,
      pass: stats.edgeFraction > 0.002 && ratio > 0.35 && ratio < 3,
    };
  });
  return { results, pass: results.every((entry) => entry.pass) };
}

function firstFrameCheck(video, slug) {
  const config = SLUGS[slug];
  const samples = [0.05, 0.15, 0.25, 0.35, 0.45, 0.55].map((time) =>
    edgeStats(parsePpm(extractPpm(video, time))),
  );
  const stats = samples.reduce((best, sample) =>
    sample.meanGradient > best.meanGradient ? sample : best,
  );
  return {
    ...stats,
    pass:
      stats.edgeFraction > (config.firstFrameMinEdge || 0.002) &&
      stats.meanGradient > (config.firstFrameMinGradient || 1.5),
  };
}

function themeDifference(lightVideo, darkVideo, duration) {
  return [0.5, duration / 2, duration - 0.5].map((time) =>
    meanDiff(
      parsePpm(extractPpm(lightVideo, time)),
      parsePpm(extractPpm(darkVideo, time)),
    ),
  );
}

function verify(video) {
  const info = probe(video);
  const stream = info.streams.find((entry) => entry.codec_type === "video");
  const audio = info.streams.find((entry) => entry.codec_type === "audio");
  const duration = Number.parseFloat(info.format.duration);
  const issues = [];
  if (!stream) issues.push("no video stream");
  if (audio) issues.push("audio stream present");
  if (stream?.codec_name !== "h264") issues.push("not h264");
  if (stream?.pix_fmt !== "yuv420p") issues.push("not yuv420p");
  if (stream?.width !== WIDTH || stream?.height !== HEIGHT) issues.push("wrong resolution");
  if (stream?.r_frame_rate !== `${FPS}/1`) issues.push("wrong fps");
  if (duration < 4.8 || duration > 5.2) issues.push("duration outside 4.8-5.2s");
  if (Number.parseInt(info.format.size, 10) > MAX_BYTES) issues.push("over 3 MB");
  if (issues.length) throw new Error(`QC failed: ${issues.join(", ")}`);
  return { duration, size: Number.parseInt(info.format.size, 10) };
}

async function recordTheme(browser, slug, theme, outDir, attempt) {
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

  const { page, clip, useClip, reference, textFile, text } = await preparePage(context, slug, theme, outDir);
  const rawDir = path.join(outDir, ".raw", `${slug}-${theme}-attempt-${attempt}`);
  fs.mkdirSync(rawDir, { recursive: true });
  const rawVideo = path.join(rawDir, "full-raw.mp4");
  const finalVideo = path.join(outDir, slug, `${slug}-${theme}.mp4`);
  fs.mkdirSync(path.dirname(finalVideo), { recursive: true });

  try {
    const { frames, startedAt } = await captureComponentFrames(page, clip, slug, useClip);
    const count = writeFrameSequence(frames, startedAt, rawDir);
    encodeRaw(rawDir, rawVideo);
    const encoded = chooseBitrate(rawVideo, finalVideo, slug);
    const qc = verify(finalVideo);
    const motion = motionCheck(finalVideo, qc.duration, SLUGS[slug].motionThreshold || MOTION_THRESHOLD);
    const overlay = overlayFrameCheck(finalVideo, qc.duration);
    const fidelity = textFidelityCheck(finalVideo, reference, qc.duration);
    const firstFrame = firstFrameCheck(finalVideo, slug);
    const loop = loopCheck(finalVideo, qc.duration);

    if (!motion.pass) {
      throw new Error(`motion check failed: ${motion.windows.map((w) => `${w.window}=${w.diff.toFixed(2)}`).join(" ")}`);
    }
    if (!overlay.pass) {
      throw new Error(`overlay frame check failed: ${overlay.results.map((r) => `${r.label} mean=${r.mean.toFixed(1)} bright=${(r.brightFraction * 100).toFixed(1)}%`).join(" ")}`);
    }
    if (!fidelity.pass) {
      throw new Error(`text fidelity check failed: ${fidelity.results.map((r) => `${r.label} ratio=${r.ratio.toFixed(2)}`).join(" ")}`);
    }
    if (!firstFrame.pass) {
      throw new Error(`first frame check failed: edge=${firstFrame.edgeFraction.toFixed(4)} gradient=${firstFrame.meanGradient.toFixed(2)}`);
    }

    return {
      theme, file: finalVideo, ...qc, ...encoded,
      motion, overlay, fidelity, firstFrame, loop,
      text, textFile, reference,
      framesCaptured: frames.length, framesWritten: count,
    };
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }
}

function extractSampleFrames(entry, slug, outDir) {
  const frameDir = path.join(outDir, "frames", slug);
  fs.mkdirSync(frameDir, { recursive: true });
  const times = [
    { label: "0.5s", time: 0.5 },
    { label: "2.5s", time: 2.5 },
    { label: "end", time: entry.duration - 0.5 },
  ];
  return times.map(({ label, time }) => {
    const file = path.join(frameDir, `${slug}-${entry.theme}-${label}.png`);
    extractPng(entry.file, time, file);
    return file;
  });
}

function motionText(entry) {
  return `${entry.motion.windows.map((item) => item.diff.toFixed(2)).join(" ")} (${entry.motion.pass ? "PASS" : "FAIL"})`;
}

async function main() {
  const slugs = parseSlugs();
  const outDir = path.resolve(ROOT, flag("--out") || DEFAULT_OUT);
  fs.mkdirSync(outDir, { recursive: true });

  if (process.argv.includes("--dry-run")) {
    console.log(`Would record: ${slugs.join(", ")}`);
    for (const slug of slugs) console.log(`  ${slug}: ${previewUrl(slug)}`);
    console.log(`Output: ${outDir}`);
    return;
  }

  const results = [];
  const manual = [];

  for (const slug of slugs) {
    let accepted = null;
    let lastReason = "";
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      const browser = await launchBrowser();
      try {
        const light = await recordTheme(browser, slug, "light", outDir, attempt);
        const dark = await recordTheme(browser, slug, "dark", outDir, attempt);
        const themeDiffs = themeDifference(light.file, dark.file, light.duration);
        const pairPass =
          light.duration === dark.duration &&
          light.motion.pass && dark.motion.pass &&
          light.overlay.pass && dark.overlay.pass &&
          light.fidelity.pass && dark.fidelity.pass &&
          light.firstFrame.pass && dark.firstFrame.pass &&
          themeDiffs.some((value) => value > 0.3);
        if (pairPass) {
          accepted = { slug, light, dark, themeDiffs, attempt };
          break;
        }
        lastReason = "paired checks failed (theme/duration/motion/banner/text/first-frame)";
      } catch (error) {
        lastReason = error.message;
      } finally {
        await browser.close().catch(() => {});
      }
    }
    if (!accepted) manual.push({ slug, reason: lastReason });
    else results.push(accepted);
  }

  console.log("\n=== Preview recordings ===");
  console.log(`Consent key: ${CONSENT_KEY}=${CONSENT_VALUE} (storageState + context.addInitScript)`);
  console.log("Analytics: all posthog URLs aborted via page.route");
  console.log("| slug | light | dark | duration | resolution | motion (per second) | banner | text | first frame |");
  console.log("| --- | ---: | ---: | ---: | --- | --- | --- | --- | --- |");
  for (const result of results) {
    console.log(
      `| ${result.slug} | ${mb(result.light.size)} | ${mb(result.dark.size)} | ` +
        `${result.light.duration.toFixed(2)}s / ${result.dark.duration.toFixed(2)}s | ` +
        `${WIDTH}x${HEIGHT} ${FPS}fps | L ${motionText(result.light)} / D ${motionText(result.dark)} | ` +
        `L ${result.light.overlay.pass ? "PASS" : "FAIL"} / D ${result.dark.overlay.pass ? "PASS" : "FAIL"} | ` +
        `L ${result.light.fidelity.pass ? "PASS" : "FAIL"} / D ${result.dark.fidelity.pass ? "PASS" : "FAIL"} | ` +
        `L ${result.light.firstFrame.pass ? "PASS" : "FAIL"} / D ${result.dark.firstFrame.pass ? "PASS" : "FAIL"} |`,
    );
  }

  for (const result of results) {
    console.log(`\n${result.slug} (attempt ${result.attempt})`);
    console.log(`  route (light): ${previewUrl(result.slug)}`);
    console.log(`  visible text saved: ${result.light.textFile}, ${result.dark.textFile}`);
    for (const entry of [result.light, result.dark]) {
      console.log(
        `  ${entry.theme}: ${entry.file} | ${mb(entry.size)} | ` +
          `${entry.framesCaptured} component-clipped frames -> ${entry.framesWritten} sampled | ` +
          `loop diff ${entry.loop.toFixed(2)}${entry.loop > 8 ? " (warn: non-clean loop)" : ""}`,
      );
      console.log(
        `    overlay bottom-left: ` +
          entry.overlay.results
            .map((r) => `${r.label} mean=${r.mean.toFixed(1)} bright=${(r.brightFraction * 100).toFixed(1)}%`)
            .join(" | "),
      );
      console.log(
        `    text fidelity: ` +
          entry.fidelity.results
            .map((r) => `${r.label} edgeRatio=${r.ratio.toFixed(2)}`)
            .join(" | "),
      );
      console.log(
        `    first frame: edge=${entry.firstFrame.edgeFraction.toFixed(4)} gradient=${entry.firstFrame.meanGradient.toFixed(2)}`,
      );
      for (const file of extractSampleFrames(entry, result.slug, outDir)) {
        console.log(`    frame: ${file}`);
      }
    }
    console.log(
      `  theme pixel diff (0.5s/mid/end): ${result.themeDiffs.map((d) => d.toFixed(2)).join(" / ")}`,
    );
  }

  if (manual.length) {
    console.log("\n=== Needs manual recording ===");
    for (const item of manual) console.log(`- ${item.slug}: ${item.reason}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
