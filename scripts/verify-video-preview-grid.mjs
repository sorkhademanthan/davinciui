// Browser QA for VideoPreviewGrid (docs/video-preview-grid.md, section 11).
// Uses the repo's Playwright dependency. Run from the repo root while the
// dev server is up (`pnpm dev` or it auto-starts below):
//   node scripts/verify-video-preview-grid.mjs
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const BASE = process.env.VIDEO_PREVIEW_GRID_URL ?? "http://localhost:3000";
const DEMO = `${BASE}/demo/video-preview-grid`;
const VIEWPORT = { width: 1440, height: 900 };

async function waitForServer(url) {
  const deadline = Date.now() + 60000;
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

function trackVideoRequests(page) {
  const urls = [];
  page.on("request", (request) => {
    if (/\.(webm|mp4)(\?.*)?$/.test(request.url())) urls.push(request.url());
  });
  return urls;
}

function log(label, value) {
  console.log(`  ${label}: ${value}`);
}

const videoCount = (page) =>
  page.evaluate(() => document.querySelectorAll("video").length);

const waitCards = async (page, count) =>
  page.waitForFunction(
    (n) => document.querySelectorAll("a[href^='#/']").length >= n,
    count,
  );

async function main() {
  const server = await ensureServer();
  const browser = await chromium.launch();

  try {
    const context = await browser.newContext({ viewport: VIEWPORT });
    const page = await context.newPage();
    const requests = trackVideoRequests(page);
    await page.goto(DEMO, { waitUntil: "load" });
    await waitCards(page, 60);

    // A. Initial load: zero video requests, zero mounted videos.
    assert.equal(
      requests.length,
      0,
      `initial load must not request videos, got ${requests.length}`,
    );
    assert.equal(await videoCount(page), 0, "no <video> mounted at rest");
    const posterCount = await page.evaluate(
      () => document.querySelectorAll("img[loading='lazy']").length,
    );
    assert.ok(posterCount > 0, "poster <img>s should exist for rendered cards");
    log("A. video requests at load", requests.length);
    log("A. mounted <video> at rest", await videoCount(page));
    log("A. posters in DOM", posterCount);

    // B. Scroll the grid: still zero videos, DOM node count stays small.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    assert.equal(await videoCount(page), 0, "no videos while scrolling");
    await page.mouse.move(700, 10);
    await page.waitForTimeout(100);
    const nodeCount = await page.evaluate(() => document.body.children.length);
    assert.ok(
      nodeCount < 100,
      `DOM node count looks virtualized: ${nodeCount}`,
    );
    log("B. body child elements while scrolled", nodeCount);

    // C. Hover a card: exactly one video mounts and plays, poster stays.
    await page.evaluate(() => window.scrollTo(0, 0));
    const card = page.locator("a[href^='#/']").first();
    await card.hover();
    await page.waitForTimeout(500);
    assert.equal(
      await videoCount(page),
      1,
      "exactly one video mounted on hover",
    );
    await page.waitForFunction(
      () => {
        const video = document.querySelector("video");
        return video && video.currentTime > 0 && video.readyState >= 1;
      },
      null,
      { timeout: 8000 },
    );
    const posterStillThere = await page.evaluate(
      () => document.querySelectorAll("img[loading='lazy']").length > 0,
    );
    assert.ok(posterStillThere, "poster must remain in the DOM while playing");
    log("C. video requests after hover", requests.length);
    log("C. mounted <video> while playing", await videoCount(page));

    // D. Move to the footer: the video tears down.
    const footer = page.locator("footer").first();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(200);
    const footerBox = await footer.boundingBox();
    assert.ok(footerBox, "demo page has a footer to leave the grid");
    await page.mouse.move(
      VIEWPORT.width / 2,
      Math.min(footerBox.y + footerBox.height / 2, VIEWPORT.height - 20),
    );
    await page.waitForTimeout(300);
    assert.equal(
      await videoCount(page),
      0,
      "video unmounts when pointer leaves",
    );
    log("D. videos after pointer leaves", await videoCount(page));

    // E. Sweep the mouse across the grid: at most one active video.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    let maxVideos = 0;
    for (const x of [200, 500, 800, 1100, 1400]) {
      await page.mouse.move(x, 400);
      await page.waitForTimeout(450);
      const count = await videoCount(page);
      if (count > maxVideos) maxVideos = count;
    }
    await page.waitForTimeout(400);
    assert.ok(maxVideos <= 1, `max active videos during sweep: ${maxVideos}`);
    assert.equal(await videoCount(page), 0, "no videos after sweep");
    log("E. max active videos during sweep", maxVideos);

    // F. Save-Data / slow 2G (emulated via navigator.connection):
    // hovering must not request any video.
    for (const connection of [
      { saveData: true, effectiveType: "4g" },
      { saveData: false, effectiveType: "2g" },
      { saveData: false, effectiveType: "slow-2g" },
    ]) {
      const limitedContext = await browser.newContext({ viewport: VIEWPORT });
      await limitedContext.addInitScript((value) => {
        Object.defineProperty(navigator, "connection", {
          value,
          configurable: true,
        });
      }, connection);
      const page2 = await limitedContext.newPage();
      const requests2 = trackVideoRequests(page2);
      await page2.goto(DEMO, { waitUntil: "load" });
      await waitCards(page2, 60);
      await page2.locator("a[href^='#/']").first().hover();
      await page2.waitForTimeout(600);
      assert.equal(
        requests2.length,
        0,
        `connection ${JSON.stringify(connection)} must block video requests, got ${requests2.length}`,
      );
      assert.equal(
        await videoCount(page2),
        0,
        "no videos with limited connection",
      );
      await limitedContext.close();
    }

    // G. Repeated hover/leave cycles leave no videos behind (memory check).
    for (let i = 0; i < 30; i += 1) {
      await page.evaluate(() => window.scrollTo(0, 0));
      const card2 = page.locator("a[href^='#/']").nth(20 + (i % 30));
      await card2.hover();
      await page.waitForTimeout(50);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.mouse.move(VIEWPORT.width / 2, VIEWPORT.height - 20);
      await page.waitForTimeout(150);
    }
    await page.waitForTimeout(500);
    assert.equal(await videoCount(page), 0, "no videos after 30 cycles");
    log("G. videos after 30 hover/leave cycles", await videoCount(page));

    await browser.close();
    console.log(
      "✓ VideoPreviewGrid QA passed: video-on-intent only, teardown verified",
    );
  } finally {
    if (server) {
      try {
        process.kill(-server.pid, "SIGTERM");
      } catch {
        /* noop */
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
