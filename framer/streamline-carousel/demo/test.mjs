import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = 4183;
const base = `http://127.0.0.1:${port}`;

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".webm": "video/webm",
  ".png": "image/png",
  ".jpg": "image/jpeg",
};

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url ?? "/", base).pathname,
    );
    const relative = normalize(
      pathname === "/" ? "/index.html" : pathname,
    ).replace(/^([/\\])+/, "");
    const file = join(root, relative);
    if (!file.startsWith(root)) throw new Error("outside root");
    const data = await readFile(file);
    response.writeHead(200, {
      "Content-Type": mime[extname(file)] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(data);
  } catch {
    response.writeHead(404);
    response.end("not found");
  }
});

await new Promise((resolve) => server.listen(port, resolve));

const BG = [236, 236, 236];
let failures = 0;
const ok = (label, condition, detail = "") => {
  console.log(`${condition ? "ok  " : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!condition) failures += 1;
};

const browser = await chromium.launch();

async function newStage(params = "", contextOptions = {}) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    ...contextOptions,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() === "error" && !/favicon/i.test(message.text()))
      errors.push(message.text());
  });
  await page.goto(`${base}/index.html${params}`, { waitUntil: "load" });
  return { context, page, errors };
}

/** Decode a screenshot inside the page and return silhouette/coverage stats. */
function analyzePng(page, pngBuffer, bg = BG) {
  const base64 = pngBuffer.toString("base64");
  return page.evaluate(
    async ([data, background]) => {
      const img = new Image();
      img.src = `data:image/png;base64,${data}`;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      const { data: px } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { width, height } = canvas;
      const isBg = (index) =>
        Math.abs(px[index] - background[0]) < 14 &&
        Math.abs(px[index + 1] - background[1]) < 14 &&
        Math.abs(px[index + 2] - background[2]) < 14;

      const topmostAt = (x) => {
        for (let y = 0; y < height; y += 1) {
          const i = (y * width + x) * 4;
          if (!isBg(i)) return y;
        }
        return -1;
      };
      const longestBgRunAtMiddleRow = () => {
        const y = Math.floor(height / 2);
        let longest = 0;
        let current = 0;
        for (let x = 0; x < width; x += 1) {
          const i = (y * width + x) * 4;
          if (isBg(i)) {
            current += 1;
            if (current > longest) longest = current;
          } else current = 0;
        }
        return longest;
      };
      // Cheap diversity check: distinct quantized colour buckets.
      const buckets = new Set();
      for (let i = 0; i < px.length; i += 4 * 97) {
        buckets.add(
          `${Math.round(px[i] / 24)},${Math.round(px[i + 1] / 24)},${Math.round(px[i + 2] / 24)}`,
        );
      }
      return {
        topLeft: topmostAt(Math.floor(width * 0.05)),
        topCentre: topmostAt(Math.floor(width * 0.5)),
        topRight: topmostAt(Math.floor(width * 0.95)),
        midBgRun: longestBgRunAtMiddleRow(),
        diversity: buckets.size,
      };
    },
    [base64, bg],
  );
}

const stage = (page) => page.locator("#stage");
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ------------------------------------------------------------------ */
console.log("layout and silhouette");

{
  const { context, page, errors } = await newStage("?autoplay=0");
  await wait(2500); // let the entrance finish
  const shot = await stage(page).screenshot();
  const stats = await analyzePng(page, shot);
  console.log(`     stats: ${JSON.stringify(stats)}`);
  ok("top edge bows outward (edges higher than centre)",
    stats.topLeft !== -1 && stats.topRight !== -1 &&
    stats.topLeft < stats.topCentre - 20 && stats.topRight < stats.topCentre - 20,
    `topLeft=${stats.topLeft} topCentre=${stats.topCentre} topRight=${stats.topRight}`);
  ok("canvas is painted (colour diversity)", stats.diversity > 40, `diversity=${stats.diversity}`);
  ok("no console errors", errors.length === 0, errors.join(" | "));
  await context.close();
}

/* ------------------------------------------------------------------ */
console.log("infinite loop density (3 and 20 cards, 2560px)");

for (const cards of [3, 20]) {
  const { context, page, errors } = await newStage(`?autoplay=0&cards=${cards}`, {
    viewport: { width: 2560, height: 1440 },
  });
  await wait(2500);
  const shot = await stage(page).screenshot();
  const stats = await analyzePng(page, shot);
  console.log(`     cards=${cards} midBgRun=${stats.midBgRun}`);
  ok(`${cards} cards fill a 2560px canvas (no large voids)`, stats.midBgRun < 120,
    `longest background run=${stats.midBgRun}px`);
  ok(`${cards} cards: no console errors`, errors.length === 0, errors.join(" | "));
  await context.close();
}

/* ------------------------------------------------------------------ */
console.log("interactions");

{
  const { context, page, errors } = await newStage("?autoplay=0");
  await wait(2500);
  const before = await stage(page).screenshot();
  await page.mouse.move(640, 260);
  await page.mouse.down();
  for (let x = 640; x >= 380; x -= 20) await page.mouse.move(x, 260);
  await page.mouse.up();
  await wait(800); // momentum decay
  const after = await stage(page).screenshot();
  ok("drag changes the frame", !before.equals(after));
  ok("no console errors after drag", errors.length === 0, errors.join(" | "));
  await context.close();
}

{
  const { context, page, errors } = await newStage("?autoplay=0");
  await wait(2500);
  const scrollBefore = await page.evaluate(() => window.scrollY);
  const before = await stage(page).screenshot();
  await page.mouse.move(640, 260);
  await page.mouse.wheel(240, 0);
  await wait(700);
  const after = await stage(page).screenshot();
  const scrollAfter = await page.evaluate(() => window.scrollY);
  ok("horizontal wheel drives the carousel", !before.equals(after));
  ok("horizontal wheel does not scroll the page", scrollAfter === scrollBefore);
  ok("no console errors after wheel", errors.length === 0, errors.join(" | "));
  await context.close();
}

{
  const { context, page, errors } = await newStage("?autoplay=0");
  await wait(2500);
  const scrollBefore = await page.evaluate(() => window.scrollY);
  const before = await stage(page).screenshot();
  await page.mouse.move(640, 260);
  await page.mouse.wheel(0, 320);
  await wait(400);
  const after = await stage(page).screenshot();
  const scrollAfter = await page.evaluate(() => window.scrollY);
  ok("plain vertical wheel scrolls the page", scrollAfter > scrollBefore,
    `scrollY ${scrollBefore} -> ${scrollAfter}`);
  ok("plain vertical wheel leaves the carousel alone", before.equals(after));
  ok("no console errors after vertical wheel", errors.length === 0, errors.join(" | "));
  await context.close();
}

{
  const { context, page, errors } = await newStage("?autoplay=0");
  await wait(2500);
  const scrollBefore = await page.evaluate(() => window.scrollY);
  const before = await stage(page).screenshot();
  await page.keyboard.down("Shift");
  await page.mouse.move(640, 260);
  await page.mouse.wheel(0, 240);
  await page.keyboard.up("Shift");
  await wait(700);
  const after = await stage(page).screenshot();
  const scrollAfter = await page.evaluate(() => window.scrollY);
  ok("Shift+vertical wheel drives the carousel", !before.equals(after));
  ok("Shift+wheel does not scroll the page", scrollAfter === scrollBefore);
  ok("no console errors after Shift+wheel", errors.length === 0, errors.join(" | "));
  await context.close();
}

{
  const { context, page, errors } = await newStage("?autoplay=0");
  await wait(2500);
  await page.locator("canvas").focus();
  const before = await stage(page).screenshot();
  await page.keyboard.press("ArrowRight");
  await wait(1000);
  const after = await stage(page).screenshot();
  ok("ArrowRight tweens focus to the next card", !before.equals(after));
  ok("no console errors after keyboard", errors.length === 0, errors.join(" | "));
  await context.close();
}

{
  const { context, page, errors } = await newStage("?autoplay=0");
  await wait(2500);
  const before = await stage(page).screenshot();
  await page.mouse.click(250, 210); // side card (card 11 sliver / card 0 edge region)
  await wait(1200);
  const after = await stage(page).screenshot();
  ok("clicking a side card tweens it toward the centre", !before.equals(after));
  ok("no console errors after click", errors.length === 0, errors.join(" | "));
  await context.close();
}

{
  const { context, page, errors } = await newStage("?autoplay=0&link=1");
  await page.addInitScript(() => {
    window.__opened = [];
    window.open = (...args) => {
      window.__opened.push(args);
      return null;
    };
  });
  await page.reload({ waitUntil: "load" });
  await wait(2500);
  await page.mouse.click(640, 210); // centre card (card 0, linked)
  const opened = await page.evaluate(() => window.__opened ?? []);
  ok("clicking the centred card opens its link in a new tab",
    opened.length === 1 && opened[0][0] === "https://example.com",
    JSON.stringify(opened));
  ok("link opens with noopener",
    opened.length === 1 && String(opened[0][2] ?? "").includes("noopener"),
    JSON.stringify(opened[0]?.[2]));
  ok("no console errors after link click", errors.length === 0, errors.join(" | "));
  await context.close();
}

/* ------------------------------------------------------------------ */
console.log("video playback");

{
  const { context, page, errors } = await newStage("?autoplay=0&video=1");
  await wait(1500);
  const before = await stage(page).screenshot();
  await wait(800);
  const after = await stage(page).screenshot();
  ok("video renders and frames advance inside the canvas", !before.equals(after));
  ok("no console errors with video", errors.length === 0, errors.join(" | "));
  await context.close();
}

/* ------------------------------------------------------------------ */
console.log("media density and fallbacks");

{
  const { context, page, errors } = await newStage("?autoplay=0&empty=1");
  await wait(2500);
  const shot = await stage(page).screenshot();
  const stats = await analyzePng(page, shot);
  ok("empty items render gradient placeholders", stats.diversity > 20,
    `diversity=${stats.diversity}`);
  ok("no console errors with empty items", errors.length === 0, errors.join(" | "));
  await context.close();
}

{
  const { context, page, errors } = await newStage("?autoplay=0&natural=1");
  await wait(2500);
  const shot = await stage(page).screenshot();
  const stats = await analyzePng(page, shot);
  ok("natural aspect mode renders per-card widths", stats.diversity > 20,
    `diversity=${stats.diversity}`);
  ok("no console errors in natural mode", errors.length === 0, errors.join(" | "));
  await context.close();
}

/* ------------------------------------------------------------------ */
console.log("resize and sharpness");

{
  const { context, page, errors } = await newStage("?autoplay=0");
  await page.setViewportSize({ width: 1600, height: 700 });
  await wait(600);
  const first = await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    const rect = canvas.getBoundingClientRect();
    return { w: canvas.width, h: canvas.height, cssW: rect.width, cssH: rect.height, dpr: window.devicePixelRatio };
  });
  ok("canvas backing store matches CSS size x dpr (1600x700)",
    first.w === Math.round(first.cssW * Math.min(first.dpr, 2)) &&
    first.h === Math.round(first.cssH * Math.min(first.dpr, 2)),
    JSON.stringify(first));
  await page.setViewportSize({ width: 1000, height: 500 });
  await wait(600);
  const second = await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    const rect = canvas.getBoundingClientRect();
    return { w: canvas.width, h: canvas.height, cssW: rect.width, cssH: rect.height, dpr: window.devicePixelRatio };
  });
  ok("canvas backing store tracks resize (1000x500)",
    second.w === Math.round(second.cssW * Math.min(second.dpr, 2)) &&
    second.h === Math.round(second.cssH * Math.min(second.dpr, 2)),
    JSON.stringify(second));
  ok("no console errors after resize", errors.length === 0, errors.join(" | "));
  await context.close();
}

/* ------------------------------------------------------------------ */
console.log("mount, unmount, remount");

{
  const { context, page, errors } = await newStage("?autoplay=1");
  await wait(1200);
  const rafBefore = await page.evaluate(() => window.__rafCalls());
  await page.locator("#toggle-mounted").click();
  await wait(800);
  const rafAfter = await page.evaluate(() => window.__rafCalls());
  const delta = rafAfter - rafBefore;
  ok("unmount stops the RAF loop", delta < 30, `rafCalls grew by ${delta} in 800ms`);
  await page.locator("#toggle-mounted").click();
  await wait(800);
  const rafRemounted = await page.evaluate(() => window.__rafCalls());
  ok("remount restarts the loop", rafRemounted > rafAfter,
    `after unmount=${rafAfter}, after remount=${rafRemounted}`);
  ok("no console errors across mount/unmount", errors.length === 0, errors.join(" | "));
  await context.close();
}

/* ------------------------------------------------------------------ */
console.log("hover pause and reduced motion");

{
  const { context, page, errors } = await newStage("?autoplay=1");
  await wait(2500);
  await page.mouse.move(640, 260);
  await page.hover("canvas");
  await wait(3200); // pause eases v -> 0 asymptotically; wait for pixel-stable frames
  const a = await stage(page).screenshot();
  await wait(1200);
  const b = await stage(page).screenshot();
  ok("autoplay pauses on hover", a.equals(b));
  ok("no console errors during hover", errors.length === 0, errors.join(" | "));
  await context.close();
}

{
  const { context, page, errors } = await newStage(
    "?autoplay=1",
    { reducedMotion: "reduce" },
  );
  await wait(1200);
  const a = await stage(page).screenshot();
  await wait(1200);
  const b = await stage(page).screenshot();
  ok("reduced motion disables autoplay", a.equals(b));
  ok("no console errors under reduced motion", errors.length === 0, errors.join(" | "));
  await context.close();
}

/* ------------------------------------------------------------------ */
await browser.close();
server.close();

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nall checks passed");
