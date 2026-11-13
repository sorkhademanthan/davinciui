// Deterministic geometry, timing, and presentation tests for Preloader Pro V4.
// Run from the repo root while `pnpm dev` is running:
//   node scripts/test-preloader-pro-v4.mjs
// or point it at another server:
//   PRELOADER_PRO_V4_URL=http://localhost:3000 node scripts/test-preloader-pro-v4.mjs
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";

const BASE = process.env.PRELOADER_PRO_V4_URL ?? "http://localhost:3000";
const DEMO = `${BASE}/demo/preloader-pro-v4`;
const DOCS = `${BASE}/docs/components/preloader-pro-v4`;
const GALLERY = `${BASE}/experience/components`;
const VIEWPORT = { width: 1465, height: 750 };
const COUNTER_CLIP = { x: 0, y: 540, width: 360, height: 210 };
const COUNTER_SAMPLES = [
  [0.26, 2],
  [0.43, 3],
  [0.6, 6],
  [0.73, 15],
  [0.93, 29],
  [1.23, 63],
  [1.43, 80],
  [1.63, 91],
  [1.83, 97],
  [2.13, 100],
];
const CONTACT_TIMES = [
  0, 0.1, 0.2, 0.3, 0.45, 0.7, 1.0, 1.3, 1.6, 2.0, 2.4, 2.78, 2.9, 3.3, 3.5,
  3.65, 3.88, 4.1, 4.3,
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

async function openDemo(browser, path = DEMO, theme = "dark") {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
  });
  await context.addInitScript((value) => {
    localStorage.setItem("theme", value);
  }, theme);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto(path, { waitUntil: "domcontentloaded", timeout: 120000 });
  await dismissConsent(page);
  await page.waitForFunction(
    (value) => document.documentElement.classList.contains(value),
    theme,
    { timeout: 15000 },
  );
  await page.waitForFunction(
    () => typeof window.__preloaderV4Seek === "function",
    null,
    { timeout: 60000 },
  );
  return { context, page, errors };
}

async function seek(page, time) {
  await page.evaluate((target) => window.__preloaderV4Seek(target), time);
  await page.waitForTimeout(60);
}

async function readCounter(page) {
  return page.evaluate(() => {
    const root = document.querySelector('[data-slot="preloader-pro-v4"]');
    const nodes = Array.from(root?.querySelectorAll("div") ?? []);
    return (
      nodes.find((node) => /^\d{3}$/.test(node.textContent ?? ""))
        ?.textContent ?? ""
    );
  });
}

async function readCards(page) {
  return page.evaluate(() => {
    const root = document.querySelector('[data-slot="preloader-pro-v4"]');
    const stage = root?.querySelector('[aria-hidden="true"]');
    return Array.from(stage?.children ?? [])
      .filter((node) => node.hasAttribute("data-card-index"))
      .map((node) => {
        const rect = node.getBoundingClientRect();
        const transform = getComputedStyle(node).transform;
        const match = transform.match(/^matrix\(([^)]+)\)$/);
        const values = match ? match[1].split(",").map(Number) : [];
        return {
          index: Number(node.getAttribute("data-card-index")),
          featured: node.getAttribute("data-featured") === "true",
          centerX: rect.left + rect.width / 2,
          centerY: rect.top + rect.height / 2,
          width: parseFloat(node.style.width),
          height: parseFloat(node.style.height),
          radius: parseFloat(node.style.borderRadius),
          opacity: Number(getComputedStyle(node).opacity),
          rotation:
            values.length >= 2
              ? (Math.atan2(values[1], values[0]) * 180) / Math.PI
              : 0,
          rect: {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
          },
        };
      });
  });
}

async function measureInk(page) {
  const buffer = await page.screenshot({ clip: COUNTER_CLIP });
  return page.evaluate(
    async ({ base64, clip }) => {
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
      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const index = (y * width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          if (r > 180 && g > 175 && b > 160 && x < 260) {
            glyph.minX = Math.min(glyph.minX, x);
            glyph.maxX = Math.max(glyph.maxX, x);
            glyph.minY = Math.min(glyph.minY, y);
            glyph.maxY = Math.max(glyph.maxY, y);
          }
        }
      }

      return {
        glyph: {
          width: glyph.maxX - glyph.minX + 1,
          height: glyph.maxY - glyph.minY + 1,
          top: clip.y + glyph.minY,
          bottom: clip.y + glyph.maxY,
          left: clip.x + glyph.minX,
        },
      };
    },
    { base64: buffer.toString("base64"), clip: COUNTER_CLIP },
  );
}

async function captureFrame(page, time) {
  await seek(page, time);
  return (await page.screenshot()).toString("base64");
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
  const path = join(tmpdir(), "preloader-pro-v4-contact-sheet.png");
  await page.screenshot({ path, fullPage: true });
  await page.close();
  return path;
}

async function testDemo(browser) {
  const { context, page, errors } = await openDemo(browser);

  const timeline = await page.evaluate(() => window.__preloaderV4Timeline);
  near(timeline.duration, 2, 0.001, "duration");
  near(timeline.liftStart, 2.38, 0.001, "liftStart");
  near(timeline.expandStart, 3.15, 0.001, "expandStart");
  near(timeline.exitStart, 3.88, 0.001, "exitStart");
  near(timeline.total, 4.33, 0.001, "total");
  assert.equal(timeline.featuredIndex, 3, "featuredIndex");
  near(timeline.cardWidth, 170, 1, "card width");
  near(timeline.cardHeight, 238, 1, "card height");
  near(timeline.fanRadius, 495, 1, "fan radius");

  for (const [time, expected] of COUNTER_SAMPLES) {
    await seek(page, time);
    const text = await readCounter(page);
    near(Number(text), expected, 1, `counter at ${time}s`);
  }

  await seek(page, 1.0);
  const cards = await readCards(page);
  assert.equal(cards.length, 7, "seven cards");
  assert.equal(cards[3].featured, true, "fourth card is featured");
  near(cards[3].centerX, 732.5, 2, "featured centre x");
  near(cards[3].centerY, 386.5, 2, "featured centre y");
  near(cards[0].centerX, 431.2, 2, "left card centre x");
  near(cards[0].centerY, 488.9, 2, "left card centre y");
  near(cards[6].centerX, 1033.8, 2, "right card centre x");
  near(cards[0].rotation, -37.5, 0.2, "left card rotation");
  near(cards[6].rotation, 37.5, 0.2, "right card rotation");
  for (const card of cards) {
    near(card.width, 170, 1, `card ${card.index} width`);
    near(card.height, 238, 1, `card ${card.index} height`);
    near(card.radius, 14, 0.5, `card ${card.index} radius`);
  }

  const chrome = await page.evaluate(() => {
    const root = document.querySelector('[data-slot="preloader-pro-v4"]');
    const nodes = Array.from(
      root?.querySelectorAll("[aria-hidden] > div") ?? [],
    );
    const label = nodes.find((node) => node.textContent === "Loading");
    const counter = nodes.find((node) =>
      /^\d{3}$/.test(node.textContent ?? ""),
    );
    const labelRect = label?.getBoundingClientRect();
    const counterRect = counter?.getBoundingClientRect();
    const style = root ? getComputedStyle(root) : null;
    return {
      background: style?.backgroundColor ?? "",
      color: style?.color ?? "",
      label: labelRect ? { left: labelRect.left, top: labelRect.top } : null,
      counter: counterRect
        ? { left: counterRect.left, bottom: counterRect.bottom }
        : null,
      inert: document.querySelector("main")?.hasAttribute("inert") ?? false,
      overflow: document.documentElement.style.overflow,
    };
  });
  assert.equal(chrome.background, "rgb(15, 15, 15)", "background");
  assert.equal(chrome.color, "rgb(238, 232, 223)", "foreground");
  near(chrome.label.left, 28, 1, "label left");
  near(chrome.label.top, 25, 1, "label top");
  near(chrome.counter.left, 28, 1, "counter left");
  assert.equal(chrome.inert, true, "underlying main is inert");
  assert.equal(chrome.overflow, "hidden", "scroll locked");

  await seek(page, 1.6);
  const ink = await measureInk(page);
  near(ink.glyph.height, 72, 4, "counter glyph height");
  near(ink.glyph.bottom, 721, 4, "counter ink bottom from viewport top");
  near(ink.glyph.left, 29, 3, "counter ink left");

  await seek(page, 2.78);
  const lifted = await readCards(page);
  near(lifted[3].rect.width, 193.8, 2, "featured lifted width");
  near(lifted[3].rect.height, 271.3, 2, "featured lifted height");
  near(lifted[3].centerX, 732.5, 2, "featured lifted centre x");
  near(lifted[3].centerY, 271.5, 2, "featured lifted centre y");
  near(lifted[0].opacity, 0.48, 0.02, "fan dimmed at lift");
  const counterOpacity = await page.evaluate(() => {
    const root = document.querySelector('[data-slot="preloader-pro-v4"]');
    const nodes = Array.from(
      root?.querySelectorAll("[aria-hidden] > div") ?? [],
    );
    const counter = nodes.find((node) =>
      /^\d{3}$/.test(node.textContent ?? ""),
    );
    return counter ? Number(getComputedStyle(counter).opacity) : -1;
  });
  assert.ok(counterOpacity < 0.01, "counter fades before the lift");

  await seek(page, 3.65);
  const expanded = await readCards(page);
  near(expanded[3].rect.left, 0, 1, "expanded left");
  near(expanded[3].rect.top, (750 - 1465 / (16 / 9)) / 2, 2, "expanded top");
  near(expanded[3].rect.width, 1465, 1, "expanded width");
  near(expanded[3].rect.height, 1465 / (16 / 9), 2, "expanded height");
  near(
    expanded[3].rect.width / expanded[3].rect.height,
    16 / 9,
    0.002,
    "expanded aspect",
  );
  near(expanded[3].radius, 0, 0.5, "expanded radius");

  const expandedImage = await page.evaluate(() => {
    const root = document.querySelector('[data-slot="preloader-pro-v4"]');
    const card = root?.querySelector('[data-card-index="3"]');
    const image = card?.querySelector('[data-expand-image="true"]');
    const rootRect = root?.getBoundingClientRect();
    const imageRect = image?.getBoundingClientRect();
    return {
      root: rootRect
        ? { width: rootRect.width, height: rootRect.height }
        : null,
      image: imageRect
        ? { width: imageRect.width, height: imageRect.height }
        : null,
      objectFit: image ? getComputedStyle(image).objectFit : "",
      opacity: image ? Number(getComputedStyle(image).opacity) : -1,
      naturalWidth: image?.naturalWidth ?? 0,
      naturalHeight: image?.naturalHeight ?? 0,
    };
  });
  assert.ok(
    expandedImage.image.width >= expandedImage.root.width - 1,
    "expanded image fills width",
  );
  assert.ok(
    expandedImage.image.height >= expandedImage.root.height - 1,
    "expanded image fills height",
  );
  assert.equal(expandedImage.objectFit, "cover", "expanded image uses cover");
  assert.ok(expandedImage.opacity > 0.99, "wide image is active");
  assert.ok(expandedImage.naturalWidth > 0, "wide image decoded");
  near(
    expandedImage.naturalWidth / expandedImage.naturalHeight,
    16 / 9,
    0.01,
    "wide image source aspect",
  );

  await seek(page, 4.1);
  const fade = await page.evaluate(() => {
    const root = document.querySelector('[data-slot="preloader-pro-v4"]');
    return {
      opacity: Number(getComputedStyle(root).opacity),
      transform: getComputedStyle(root).transform,
    };
  });
  near(fade.opacity, 0.511, 0.03, "fade opacity at 4.1s");
  assert.equal(fade.transform, "none", "fade keeps the overlay in place");

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
  const { context, page, errors } = await openDemo(browser, DEMO, "light");
  await seek(page, 1.6);

  const palette = await page.evaluate(() => {
    const root = document.querySelector('[data-slot="preloader-pro-v4"]');
    const nodes = Array.from(
      root?.querySelectorAll("[aria-hidden] > div") ?? [],
    );
    const label = nodes.find((node) => node.textContent === "Loading");
    const style = root ? getComputedStyle(root) : null;
    return {
      scheme: root?.dataset.themeScheme ?? "",
      background: style?.backgroundColor ?? "",
      color: style?.color ?? "",
      label: label ? getComputedStyle(label).color : "",
      htmlClass: document.documentElement.className,
    };
  });
  assert.match(palette.htmlClass, /\blight\b/, "light class must be active");
  assert.equal(palette.scheme, "light", "light scheme detected");
  assert.equal(palette.background, "rgb(243, 239, 231)", "light background");
  assert.equal(palette.color, "rgb(20, 20, 16)", "light ink");
  assert.equal(palette.label, "rgb(111, 106, 97)", "light muted label");

  await seek(page, 3.65);
  const expanded = await page.evaluate(() => {
    const root = document.querySelector('[data-slot="preloader-pro-v4"]');
    const card = root?.querySelector('[data-card-index="3"]');
    const image = card?.querySelector('[data-expand-image="true"]');
    const rootRect = root?.getBoundingClientRect();
    const cardRect = card?.getBoundingClientRect();
    const imageRect = image?.getBoundingClientRect();
    return {
      root: rootRect
        ? { width: rootRect.width, height: rootRect.height }
        : null,
      card: cardRect
        ? { width: cardRect.width, height: cardRect.height }
        : null,
      image: imageRect
        ? { width: imageRect.width, height: imageRect.height }
        : null,
      objectFit: image ? getComputedStyle(image).objectFit : "",
      opacity: image ? Number(getComputedStyle(image).opacity) : -1,
    };
  });
  near(
    expanded.card.width / expanded.card.height,
    16 / 9,
    0.002,
    "light expanded aspect",
  );
  assert.ok(
    expanded.image.width >= expanded.root.width - 1,
    "light expanded image fills width",
  );
  assert.ok(
    expanded.image.height >= expanded.root.height - 1,
    "light expanded image fills height",
  );
  assert.ok(expanded.opacity > 0.99, "light wide image is active");
  assert.equal(expanded.objectFit, "cover", "light expanded image uses cover");
  assert.deepEqual(errors, [], "light demo console and page errors");
  await context.close();
}

async function testSlideUp(browser) {
  const { context, page, errors } = await openDemo(
    browser,
    `${DEMO}?exit=slide-up`,
  );
  await seek(page, 4.1);
  const mid = await page.evaluate(() => {
    const root = document.querySelector('[data-slot="preloader-pro-v4"]');
    return {
      opacity: Number(getComputedStyle(root).opacity),
      transform: getComputedStyle(root).transform,
    };
  });
  assert.ok(mid.opacity > 0.98, "slide-up keeps full opacity");
  assert.notEqual(mid.transform, "none", "slide-up moves the overlay");

  await seek(page, 4.58);
  const end = await page.evaluate(() => {
    const root = document.querySelector('[data-slot="preloader-pro-v4"]');
    return {
      transform: getComputedStyle(root).transform,
      matrix: root.style.transform,
    };
  });
  assert.match(
    end.matrix,
    /-100(\.0+)?%/,
    "slide-up reaches minus 100 percent",
  );
  assert.deepEqual(errors, [], "slide-up demo console and page errors");
  await context.close();
}

async function testReducedMotion(browser) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto(DEMO, { waitUntil: "domcontentloaded", timeout: 120000 });
  await dismissConsent(page);
  await page.waitForSelector('[data-slot="preloader-pro-v4"]', {
    state: "attached",
    timeout: 15000,
  });
  const pre = await page.evaluate(() => {
    const root = document.querySelector('[data-slot="preloader-pro-v4"]');
    return {
      opacity: Number(getComputedStyle(root).opacity),
      transform: getComputedStyle(root).transform,
    };
  });
  assert.ok(pre.opacity > 0.9, "reduced-motion frame starts fully opaque");
  await page.waitForSelector('[data-slot="preloader-pro-v4"]', {
    state: "detached",
    timeout: 6000,
  });
  assert.deepEqual(errors, [], "reduced-motion console and page errors");
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
  await page.waitForTimeout(3200);

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

  await page.waitForFunction(
    () => {
      const nodes = Array.from(
        document.querySelectorAll('button[aria-label="Open issues overlay"]'),
      );
      return nodes.every((node) =>
        typeof node.checkVisibility === "function"
          ? !node.checkVisibility({
              checkOpacity: true,
              checkVisibilityCSS: true,
            })
          : node.getBoundingClientRect().width === 0,
      );
    },
    null,
    { timeout: 10000 },
  );
  assert.deepEqual(errors, [], "docs console and page errors");
  await context.close();
}

async function testGalleryCard(browser, theme = "dark") {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
  });
  await context.addInitScript((value) => {
    localStorage.setItem("theme", value);
  }, theme);
  const page = await context.newPage();
  await page.goto(GALLERY, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForTimeout(2400);
  await dismissConsent(page);

  const links = page.locator(
    'a[href="/experience/components/preloader-pro-v4"]',
  );
  assert.equal(await links.count(), 2, "expected sidebar and gallery links");
  const card = links.nth(1);
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);

  const preview = await card.evaluate((node) => {
    const root = node.querySelector('[data-slot="preloader-pro-v4"]');
    const counter = Array.from(root?.querySelectorAll("div") ?? []).find(
      (child) => /^\d{3}$/.test(child.textContent ?? ""),
    );
    const rect = root?.getBoundingClientRect();
    const featured = root?.querySelector('[data-card-index="3"]');
    return {
      present: Boolean(root),
      text: counter?.textContent ?? "",
      width: rect?.width ?? 0,
      height: rect?.height ?? 0,
      background: root ? getComputedStyle(root).backgroundColor : "",
      scheme: root?.dataset.themeScheme ?? "",
      cardWidth: featured ? parseFloat(featured.style.width) : 0,
    };
  });
  assert.ok(preview.present, "card preview missing");
  assert.equal(preview.text, "100", "card preview must show frozen 100");
  assert.ok(preview.width > 200 && preview.height > 120, "card preview sized");
  assert.equal(preview.scheme, theme, `card preview ${theme} scheme`);
  assert.equal(
    preview.background,
    theme === "light" ? "rgb(243, 239, 231)" : "rgb(15, 15, 15)",
    `card preview ${theme} background`,
  );
  near(preview.cardWidth, 170, 1, `card preview ${theme} design width`);
  await context.close();
}

const server = await ensureServer();
const browser = await chromium.launch();
try {
  const contactSheet = await testDemo(browser);
  await testLightTheme(browser);
  await testSlideUp(browser);
  await testReducedMotion(browser);
  await testDocs(browser);
  await testGalleryCard(browser, "dark");
  await testGalleryCard(browser, "light");
  console.log("Preloader Pro V4 checks passed");
  console.log(`Contact sheet: ${contactSheet}`);
  await writeFile(
    join(tmpdir(), "preloader-pro-v4-contact-sheet.json"),
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
