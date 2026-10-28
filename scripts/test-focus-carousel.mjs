// Focused interaction tests for FocusCarousel.
// Uses the repo's existing Playwright dependency instead of adding a test
// framework. Run from the repo root while `pnpm dev` is running:
//   node scripts/test-focus-carousel.mjs
// or point it at another server:
//   FOCUS_CAROUSEL_URL=http://localhost:3000 node scripts/test-focus-carousel.mjs
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const BASE = process.env.FOCUS_CAROUSEL_URL ?? "http://localhost:3000";
const DEMO = `${BASE}/demo/focus-carousel`;
const VIEWPORT = { width: 1455, height: 749 };

function near(actual, expected, tolerance, label) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${label}: expected ${expected} ± ${tolerance}, got ${actual}`,
  );
}

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

const activeIndex = (page) =>
  page.locator("[data-focus-carousel]").getAttribute("data-active-index");

const activeCard = (page) =>
  page.locator('[data-fc-card][data-fc-active="true"]');

const title = (page) => page.locator("[data-fc-title]").textContent();

async function openDemo(browser, query = "", options = {}) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    ...options,
  });
  const page = await context.newPage();
  await page.goto(`${DEMO}${query}`, {
    waitUntil: "networkidle",
    timeout: 120000,
  });
  await page.waitForTimeout(600);
  return { context, page };
}

async function settle(page, ms = 800) {
  await page.waitForTimeout(ms);
}

async function run() {
  const server = await ensureServer();
  const browser = await chromium.launch();
  const results = [];

  const test = async (name, fn) => {
    try {
      await fn();
      results.push({ name, ok: true });
      console.log(`ok    ${name}`);
    } catch (error) {
      results.push({ name, ok: false, error });
      console.error(`FAIL  ${name}`);
      console.error(`      ${error.message}`);
    }
  };

  try {
    await test("rest geometry matches the 1455×749 reference", async () => {
      const { context, page } = await openDemo(browser);
      const active = await activeCard(page).boundingBox();
      const right = await page.locator('[data-fc-index="1"]').boundingBox();
      const left = await page.locator('[data-fc-index="-1"]').boundingBox();
      const second = await page.locator('[data-fc-index="2"]').boundingBox();
      const toggle = await page.locator("[data-fc-toggle]").boundingBox();
      const titleBox = await page.locator("[data-fc-title]").boundingBox();
      const subtitleBox = await page
        .locator("[data-fc-subtitle]")
        .boundingBox();
      const captionBox = await page.locator("[data-fc-caption]").boundingBox();

      assert.ok(active && right && left && second && toggle);
      assert.ok(titleBox && subtitleBox && captionBox);

      near(active.width, 400, 0.6, "active width");
      near(active.height, 534, 0.8, "active height");
      near(
        active.x + active.width / 2,
        VIEWPORT.width / 2,
        0.6,
        "active centre x",
      );
      near(active.y + active.height / 2, 401, 1.5, "active centre y");
      near(right.width, 208, 0.6, "neighbour width");
      near(right.height, 278, 0.8, "neighbour height");
      near(right.x - (active.x + active.width), 22, 0.4, "card gap");
      near(left.x + left.width, active.x, 22.4, "left gap");
      near(second.x - (right.x + right.width), 22, 0.4, "second card gap");
      near(toggle.y, 22, 0.1, "toggle top");
      near(toggle.width, 164, 0.1, "toggle width");
      near(toggle.height, 33, 0.1, "toggle height");
      near(titleBox.x, active.x, 0.2, "title left edge");
      near(
        subtitleBox.x + subtitleBox.width,
        active.x + active.width,
        0.3,
        "subtitle right edge",
      );
      near(captionBox.width, active.width, 0.2, "caption width");
      await context.close();
    });

    await test("gallery card preview renders and advances", async () => {
      const context = await browser.newContext({ viewport: VIEWPORT });
      const page = await context.newPage();
      await page.goto(`${BASE}/experience/components?tab=Visual%20Effects`, {
        waitUntil: "networkidle",
        timeout: 120000,
      });
      const link = page
        .locator('a[href="/experience/components/focus-carousel"]')
        .last();
      await link.scrollIntoViewIfNeeded();
      const carousel = link.locator("[data-focus-carousel]");
      await carousel.waitFor({ state: "visible", timeout: 30000 });
      await page.waitForTimeout(400);

      const active = await carousel
        .locator('[data-fc-card][data-fc-active="true"]')
        .first()
        .boundingBox();
      assert.ok(active, "gallery preview should render an active card");
      near(active.width, 136, 1, "gallery active width");
      near(active.height, 181.33, 1, "gallery active height");

      const before = await carousel.getAttribute("data-active-index");
      await page.waitForTimeout(2800);
      const after = await carousel.getAttribute("data-active-index");
      assert.notEqual(after, before, "gallery preview should auto-advance");
      await context.close();
    });

    await test("click-to-centre and caption settle", async () => {
      const { context, page } = await openDemo(browser);
      assert.equal(await activeIndex(page), "0");
      await page.locator('[data-fc-index="1"]').click();
      await settle(page, 80);
      assert.equal(await activeIndex(page), "1");
      const mid = await activeCard(page).boundingBox();
      assert.ok(
        mid.width > 208 && mid.width < 400,
        `card should be mid-growth at 80ms, got ${mid.width}`,
      );
      await settle(page);
      assert.equal(await title(page), "Salvia");
      near(
        (await activeCard(page).boundingBox()).width,
        400,
        0.6,
        "settled width",
      );
      await context.close();
    });

    await test("wraps to the last item from the left", async () => {
      const { context, page } = await openDemo(browser);
      await page.locator('[data-fc-index="-1"]').click();
      await settle(page);
      assert.equal(await activeIndex(page), "9");
      assert.equal(await title(page), "Ochre");
      await context.close();
    });

    await test("keyboard arrows and Home/End", async () => {
      const { context, page } = await openDemo(browser);
      await page.locator("[data-focus-carousel]").focus();
      await page.keyboard.press("ArrowRight");
      await settle(page);
      assert.equal(await activeIndex(page), "1");
      assert.equal(await title(page), "Salvia");
      await page.keyboard.press("ArrowLeft");
      await settle(page);
      assert.equal(await activeIndex(page), "0");
      await page.keyboard.press("End");
      await settle(page);
      assert.equal(await activeIndex(page), "9");
      assert.equal(await title(page), "Ochre");
      await page.keyboard.press("Home");
      await settle(page);
      assert.equal(await activeIndex(page), "0");
      await context.close();
    });

    await test("drag suppresses the click and flick advances", async () => {
      const { context, page } = await openDemo(browser);
      const neighbour = await page.locator('[data-fc-index="1"]').boundingBox();
      assert.ok(neighbour);
      const startX = neighbour.x + neighbour.width / 2;
      const startY = neighbour.y + neighbour.height / 2;

      await page.mouse.move(startX, startY);
      await page.mouse.down();
      for (let step = 1; step <= 7; step += 1) {
        await page.mouse.move(startX + step * 10, startY);
        await page.waitForTimeout(25);
      }
      await page.waitForTimeout(250);
      await page.mouse.up();
      await settle(page);
      assert.equal(
        await activeIndex(page),
        "0",
        "small drag must not click the neighbour",
      );

      await page.mouse.move(VIEWPORT.width / 2, 402);
      await page.mouse.down();
      await page.mouse.move(VIEWPORT.width / 2 - 250, 402, { steps: 6 });
      await page.mouse.up();
      await settle(page);
      assert.ok(
        Number(await activeIndex(page)) >= 1,
        "left drag advances at least one card",
      );
      await context.close();
    });

    await test("toggle switches to video and back", async () => {
      const { context, page } = await openDemo(browser);
      await page.locator('[data-fc-mode-option="video"]').click();
      await page.waitForTimeout(250);
      assert.equal(
        await page
          .locator("[data-fc-toggle]")
          .getAttribute("data-fc-media-mode"),
        "video",
      );
      assert.ok((await page.locator("video").count()) > 0);
      const checked = await page
        .locator('[data-fc-mode-option="video"]')
        .getAttribute("aria-checked");
      assert.equal(checked, "true");

      await page.locator('[data-fc-mode-option="image"]').click();
      await page.waitForTimeout(250);
      assert.equal(
        await page
          .locator("[data-fc-toggle]")
          .getAttribute("data-fc-media-mode"),
        "image",
      );
      await context.close();
    });

    await test("controlled index and media mode", async () => {
      const { context, page } = await openDemo(browser, "?variant=controlled");
      assert.equal(await activeIndex(page), "0");
      await page.getByTestId("controlled-next").click();
      await settle(page);
      assert.equal(await activeIndex(page), "1");
      assert.equal(await title(page), "Salvia");

      await page.locator('[data-fc-index="2"]').click();
      await settle(page);
      assert.equal(await activeIndex(page), "2");
      assert.equal(await title(page), "Fathom");

      await page.getByTestId("controlled-prev").click();
      await settle(page);
      assert.equal(await activeIndex(page), "1");
      await context.close();
    });

    await test("three-item loop stays continuous", async () => {
      const { context, page } = await openDemo(browser, "?variant=three");
      assert.equal(await activeIndex(page), "1");
      await page.locator('[data-fc-index="2"]').click();
      await settle(page);
      assert.equal(await activeIndex(page), "2");
      assert.equal(await title(page), "Fathom");
      await page.locator('[data-fc-index="0"]').click();
      await settle(page);
      assert.equal(await activeIndex(page), "0");
      assert.equal(await title(page), "Tessellate");
      near(
        (await activeCard(page).boundingBox()).width,
        400,
        0.6,
        "three-item active width",
      );
      await context.close();
    });

    await test("custom sizes apply", async () => {
      const { context, page } = await openDemo(browser, "?variant=custom");
      const active = await activeCard(page).boundingBox();
      const side = await page.locator('[data-fc-index="4"]').boundingBox();
      near(active.width, 300, 0.6, "custom active width");
      near(active.height, 400, 0.6, "custom active height");
      near(side.width, 156, 0.6, "custom side width");
      await context.close();
    });

    await test("reduced motion jumps without travel", async () => {
      const { context, page } = await openDemo(browser, "", {
        reducedMotion: "reduce",
      });
      await page.locator('[data-fc-index="1"]').click();
      await page.waitForTimeout(60);
      assert.equal(await activeIndex(page), "1");
      near(
        (await activeCard(page).boundingBox()).x,
        527.5,
        0.8,
        "new active card is already centred",
      );
      await settle(page, 350);
      assert.equal(await title(page), "Salvia");
      await context.close();
    });
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

  const failed = results.filter((result) => !result.ok);
  if (failed.length > 0) {
    console.error(`\n${failed.length} of ${results.length} checks failed.`);
    process.exit(1);
  }
  console.log(`\nAll ${results.length} FocusCarousel checks passed.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
