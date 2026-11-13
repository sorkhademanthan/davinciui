// Deterministic geometry, timing, and presentation tests for Preloader Pro V1.
// Run from the repo root while `pnpm dev` is running:
//   node scripts/test-preloader-pro-v1.mjs
// or point it at another server:
//   PRELOADER_PRO_V1_URL=http://localhost:3000 node scripts/test-preloader-pro-v1.mjs
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";

const BASE = process.env.PRELOADER_PRO_V1_URL ?? "http://localhost:3000";
const DEMO = `${BASE}/demo/preloader-pro-v1`;
const DOCS = `${BASE}/docs/components/preloader-pro-v1`;
const GALLERY = `${BASE}/experience/components`;
const VIEWPORT = { width: 1465, height: 750 };
const COUNTER_CLIP = { x: 0, y: 540, width: 360, height: 210 };
const COUNTER_SAMPLES = [
  [0.33, 33],
  [0.53, 51],
  [0.73, 64],
  [0.93, 74],
  [1.23, 85],
  [1.53, 92],
  [1.73, 95],
  [2.03, 98],
  [2.33, 99],
];
const COVERAGE_SAMPLES = [
  [0.15, 0.12],
  [0.25, 0.21],
  [0.35, 0.33],
  [0.45, 0.45],
  [0.55, 0.59],
  [0.65, 0.72],
  [0.75, 0.82],
  [0.85, 0.9],
  [0.95, 0.98],
];
const CONTACT_TIMES = [
  0.33, 1.0, 1.6, 2.5, 3.0, 3.75, 3.95, 4.05, 4.15, 4.25, 4.35, 4.45,
  4.55, 4.65, 4.75, 4.85, 4.9,
];

function near(actual, expected, tolerance, label) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${label}: expected ${expected} ± ${tolerance}, got ${actual}`,
  );
}

async function waitForServer(url) {
  const deadline = Date.now() + 90000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { method: "HEAD" });
      if (response.ok || response.status === 405) return true;
    } catch {
      /* server not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

async function ensureServer() {
  try {
    const response = await fetch(DEMO);
    if (response.ok) return null;
  } catch {
    /* start dev server below */
  }

  const child = spawn("pnpm", ["--filter", "web", "dev"], {
    cwd: process.cwd(),
    stdio: "ignore",
    detached: true,
  });
  if (!(await waitForServer(DEMO))) {
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {
      /* noop */
    }
    throw new Error(`Timed out waiting for ${BASE}`);
  }
  return child;
}

async function dismissConsent(page) {
  const accept = page.getByRole("button", { name: "Accept", exact: true });
  for (let attempt = 0; attempt < 16; attempt += 1) {
    if ((await accept.count()) > 0) {
      try {
        await accept.click({ timeout: 2000 });
        await accept.waitFor({ state: "detached", timeout: 3000 });
        return;
      } catch {
        /* banner may still be animating in */
      }
    }
    await page.waitForTimeout(250);
  }
}

async function openDemo(browser, theme) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
  });
  if (theme) {
    await context.addInitScript((value) => {
      localStorage.setItem("theme", value);
    }, theme);
  }
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto(DEMO, { waitUntil: "domcontentloaded", timeout: 120000 });
  await dismissConsent(page);
  await page.waitForFunction(
    () => typeof window.__preloaderSeek === "function",
    null,
    { timeout: 60000 },
  );
  return { context, page, errors };
}

async function seek(page, time) {
  await page.evaluate((target) => window.__preloaderSeek(target), time);
  await page.waitForTimeout(60);
}

async function readCounter(page) {
  return page.evaluate(() => {
    const root = document.querySelector('[data-slot="preloader-pro-v1"]');
    const span = Array.from(root?.querySelectorAll("span") ?? []).find((node) =>
      /^\d{3}$/.test(node.textContent ?? ""),
    );
    return span?.textContent ?? "";
  });
}

async function measureInk(page) {
  const buffer = await page.screenshot({ clip: COUNTER_CLIP });
  return page.evaluate(async (base64) => {
    const response = await fetch(`data:image/png;base64,${base64}`);
    const image = await createImageBitmap(await response.blob());
    const canvas = new OffscreenCanvas(image.width, image.height);
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0);
    const { data, width, height } = context.getImageData(
      0,
      0,
      image.width,
      image.height,
    );

    const glyph = { minX: width, maxX: -1, minY: height, maxY: -1 };
    const barRows = [];
    for (let y = 0; y < height; y += 1) {
      let bright = 0;
      for (let x = 0; x < width; x += 1) {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        if (r > 180 && g > 175 && b > 160) {
          bright += 1;
          if (y < 170 && x < 260) {
            glyph.minX = Math.min(glyph.minX, x);
            glyph.maxX = Math.max(glyph.maxX, x);
            glyph.minY = Math.min(glyph.minY, y);
            glyph.maxY = Math.max(glyph.maxY, y);
          }
        }
      }
      if (y >= 165 && bright > 100) barRows.push(y);
    }

    return {
      glyph: {
        width: glyph.maxX - glyph.minX + 1,
        height: glyph.maxY - glyph.minY + 1,
        top: 540 + glyph.minY,
        bottom: 540 + glyph.maxY,
      },
      barTop: barRows.length ? 540 + barRows[0] : null,
    };
  }, buffer.toString("base64"));
}

async function captureFrame(page, time) {
  await seek(page, time);
  const buffer = await page.screenshot();
  return buffer.toString("base64");
}

async function buildContactSheet(browser, frames) {
  const page = await browser.newPage({
    viewport: { width: 1820, height: 1200 },
    deviceScaleFactor: 1,
  });
  const cells = frames
    .map(
      ({ time, base64 }) => `
        <figure>
          <img src="data:image/png;base64,${base64}" alt="t=${time}" />
          <figcaption>t = ${time}s</figcaption>
        </figure>`,
    )
    .join("");
  await page.setContent(
    `<!doctype html>
     <style>
       body { margin: 0; padding: 20px; background: #111; color: #eee; font: 13px/1.4 ui-monospace, monospace; }
       main { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
       figure { margin: 0; background: #1b1b1b; border: 1px solid #333; }
       img { display: block; width: 100%; aspect-ratio: 1465 / 750; object-fit: cover; }
       figcaption { padding: 6px 8px; color: #aaa; }
     </style>
     <main>${cells}</main>`,
  );
  const path = join(tmpdir(), "preloader-pro-v1-contact-sheet.png");
  await page.screenshot({ path, fullPage: true });
  await page.close();
  return path;
}

async function testDemo(browser) {
  const { context, page, errors } = await openDemo(browser);

  const timeline = await page.evaluate(() => window.__preloaderTimeline);
  near(timeline.duration, 2.7, 0.001, "duration");
  near(timeline.holdTime, 1.2, 0.001, "holdTime");
  near(timeline.exitAt, 3.9, 0.001, "exitAt");
  near(timeline.exitDuration, 1, 0.001, "exitDuration");
  assert.ok(timeline.burstCount >= 5, "expected at least five glitch bursts");
  assert.ok(
    timeline.burstStarts.every((start) => start >= 1.2),
    "no glitch burst may fire before 1.2s",
  );
  near(timeline.burstStarts.at(-1), 3.75, 0.001, "pre-exit burst start");

  for (const [time, expected] of COUNTER_SAMPLES) {
    await seek(page, time);
    const text = await readCounter(page);
    near(Number(text), expected, 1, `counter at ${time}s`);
  }

  await seek(page, 3.0);
  const ink = await measureInk(page);
  near(ink.glyph.height, 91, 3, "counter glyph height");
  near(ink.glyph.bottom, 704, 3, "counter baseline from stage bottom");
  near(ink.barTop, 715, 2, "progress bar position");

  const darkPalette = await page.evaluate(() => {
    const root = document.querySelector('[data-slot="preloader-pro-v1"]');
    const style = root ? getComputedStyle(root) : null;
    return {
      background: style?.backgroundColor ?? "",
      foreground: style?.color ?? "",
    };
  });
  assert.equal(darkPalette.background, "rgb(12, 12, 9)", "dark background");
  assert.equal(darkPalette.foreground, "rgb(239, 233, 225)", "dark ink");

  const headingBefore = await page.evaluate(() => {
    const heading = document.querySelector("main h1");
    return {
      label: heading?.getAttribute("aria-label") ?? "",
      text: heading?.textContent?.trim() ?? "",
      opacity: heading ? Number(getComputedStyle(heading).opacity) : -1,
    };
  });
  assert.equal(headingBefore.label, "DaVinci UI", "demo accessible name");
  assert.equal(headingBefore.text, "DAVINCIUI", "demo only shows the wordmark");
  assert.ok(
    headingBefore.opacity < 0.05,
    "wordmark must wait for the exit to start",
  );

  await seek(page, timeline.exitAt + 0.04);
  await page.waitForTimeout(1000);
  const landing = await page.evaluate(() => {
    const heading = document.querySelector("main h1");
    const main = document.querySelector("main");
    return {
      opacity: heading ? Number(getComputedStyle(heading).opacity) : -1,
      text: main?.textContent?.replace(/\s+/g, " ").trim() ?? "",
      replay: Array.from(document.querySelectorAll("button")).some((button) =>
        /replay/i.test(button.textContent ?? ""),
      ),
    };
  });
  assert.ok(landing.opacity > 0.95, "wordmark enters as the shred starts");
  assert.equal(landing.text, "DAVINCIUI", "demo has no extra landing copy");
  assert.equal(landing.replay, false, "demo must not show a replay control");

  for (const [offset, expected] of COVERAGE_SAMPLES) {
    await seek(page, timeline.exitAt + offset);
    const coverage = await page.evaluate(() => {
      const root = document.querySelector('[data-slot="preloader-pro-v1"]');
      return Number(root?.dataset.exitCoverage);
    });
    near(coverage, expected, 0.08, `exit coverage at +${offset}s`);
  }

  await seek(page, 3.75);
  const preExitBurst = await page.evaluate(() => {
    const root = document.querySelector('[data-slot="preloader-pro-v1"]');
    return {
      start: Number(root?.dataset.burstStart),
      end: Number(root?.dataset.burstEnd),
    };
  });
  near(preExitBurst.start, 3.75, 0.001, "pre-exit burst active at 3.75s");
  near(preExitBurst.end, 3.9, 0.001, "pre-exit burst ends at exit");

  const frames = [];
  for (const time of CONTACT_TIMES) {
    frames.push({ time, base64: await captureFrame(page, time) });
  }
  const contactSheet = await buildContactSheet(browser, frames);

  assert.deepEqual(errors, [], "demo console and page errors");
  await context.close();
  return contactSheet;
}

async function testLightTheme(browser) {
  const { context, page, errors } = await openDemo(browser, "light");

  await page.waitForFunction(
    () => document.documentElement.classList.contains("light"),
    null,
    { timeout: 15000 },
  );
  await seek(page, 3.0);
  const palette = await page.evaluate(() => {
    const root = document.querySelector('[data-slot="preloader-pro-v1"]');
    const style = root ? getComputedStyle(root) : null;
    const heading = document.querySelector("main h1");
    return {
      background: style?.backgroundColor ?? "",
      foreground: style?.color ?? "",
      heading: heading ? getComputedStyle(heading).color : "",
      htmlClass: document.documentElement.className,
    };
  });
  assert.match(palette.htmlClass, /\blight\b/, "light class must be active");
  assert.equal(palette.background, "rgb(243, 239, 231)", "light background");
  assert.equal(palette.foreground, "rgb(20, 20, 16)", "light ink");
  assert.notEqual(
    palette.heading,
    palette.background,
    "light landing ink must contrast with the page",
  );
  assert.deepEqual(errors, [], "light demo console and page errors");

  await context.close();
}

async function testDocs(browser) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto(DOCS, { waitUntil: "domcontentloaded", timeout: 120000 });
  await dismissConsent(page);
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "Expand preview pane" }).click();
  await page.waitForTimeout(1200);

  const stage = await page.evaluate(() => {
    const iframe = document.querySelector("iframe");
    const rect = iframe?.getBoundingClientRect();
    return {
      top: rect?.top ?? 0,
      bottom: rect?.bottom ?? 0,
      height: rect?.height ?? 0,
      viewportHeight: window.innerHeight,
    };
  });
  near(stage.top, 44, 3, "fullscreen stage top below toolbar");
  near(stage.bottom, stage.viewportHeight, 2, "fullscreen stage bottom");
  assert.ok(stage.height > 690, "fullscreen stage must fill the viewport");

  const visibleIssues = await page
    .locator('button[aria-label="Open issues overlay"]')
    .evaluateAll((nodes) =>
      nodes.filter((node) => node.offsetParent !== null).length,
    );
  assert.equal(visibleIssues, 0, "docs page must have no visible dev issues");
  assert.deepEqual(errors, [], "docs console and page errors");
  await context.close();
}

async function testGalleryCard(browser) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto(GALLERY, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForTimeout(2200);
  await dismissConsent(page);

  const links = page.locator(
    'a[href="/experience/components/preloader-pro-v1"]',
  );
  assert.equal(await links.count(), 2, "expected sidebar and gallery links");
  const card = links.nth(1);
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);

  const preview = await card.evaluate((node) => {
    const frame = node.querySelector('div[style*="width: 1280px"]');
    const rect = frame?.getBoundingClientRect();
    return {
      present: Boolean(frame),
      width: rect?.width ?? 0,
      height: rect?.height ?? 0,
      text: node.textContent ?? "",
    };
  });
  assert.ok(preview.present, "card preview frame missing");
  near(preview.width / preview.height, 16 / 9, 0.02, "card preview aspect");
  assert.ok(preview.text.includes("066"), "card preview must show frozen 066");

  await context.close();
}

const server = await ensureServer();
const browser = await chromium.launch();
try {
  const contactSheet = await testDemo(browser);
  await testLightTheme(browser);
  await testDocs(browser);
  await testGalleryCard(browser);
  console.log(`Preloader Pro V1 checks passed`);
  console.log(`Contact sheet: ${contactSheet}`);
  await writeFile(
    join(tmpdir(), "preloader-pro-v1-contact-sheet.json"),
    JSON.stringify({ contactSheet, viewport: VIEWPORT }, null, 2),
  );
} finally {
  await browser.close();
  if (server) {
    try {
      process.kill(-server.pid, "SIGTERM");
    } catch {
      /* noop */
    }
  }
}
