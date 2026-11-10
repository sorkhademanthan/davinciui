// Geometry, media, theme, and interaction tests for CMSMediaBento.
// Run from the repo root while `pnpm dev` is running:
//   node scripts/test-cms-media-bento.mjs
// or point it at another server:
//   CMS_MEDIA_BENTO_URL=http://localhost:3000 node scripts/test-cms-media-bento.mjs
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const BASE = process.env.CMS_MEDIA_BENTO_URL ?? "http://localhost:3000";
const DEMO = `${BASE}/demo/cms-media-bento`;
const DOCS = `${BASE}/experience/components/cms-media-bento`;
const VIEWPORT = { width: 1465, height: 750 };

const TALL = [
  [0, 0, 27.0588, 100],
  [27.0588, 0, 24.7059, 50],
  [27.0588, 50, 24.7059, 26.1905],
  [27.0588, 76.1905, 24.7059, 23.8095],
  [51.7647, 0, 20.2067, 45.122],
  [71.9714, 0, 11.7329, 45.122],
  [83.7043, 0, 16.2957, 45.122],
  [51.7647, 45.122, 25.7255, 22.8659],
  [51.7647, 67.9878, 25.7255, 32.0122],
  [77.4902, 45.122, 22.5098, 54.878],
];

const WIDE = [
  [0, 0, 27.0588, 100],
  [27.0588, 0, 24.7059, 50],
  [27.0588, 50, 12.9412, 50],
  [40, 50, 11.7647, 50],
  [51.7647, 0, 21.7647, 41.8919],
  [51.7647, 41.8919, 9.1108, 58.1081],
  [60.8755, 41.8919, 12.6539, 58.1081],
  [73.5294, 0, 11.0294, 53.3333],
  [84.5588, 0, 15.4412, 53.3333],
  [73.5294, 53.3333, 26.4706, 46.6667],
];

const WIDE_HOVER_5 = {
  0: [0, 0, 25.2193, 100],
  4: [48.2456, 0, 27.0833, 56.4777],
  7: [75.3289, 0, 10.2796, 53.3333],
  8: [85.6086, 0, 14.3914, 53.3333],
  9: [75.3289, 53.3333, 24.6711, 46.6667],
};

const TALL_HOVER_10 = {
  0: [0, 0, 24.63, 100],
  4: [47.11, 0, 22.16, 37.45],
  7: [47.11, 37.45, 20.54, 26.06],
  9: [67.65, 37.45, 32.35, 62.55],
};

const FILL_VIEWPORTS = [
  { width: 1280, height: 600 },
  { width: 1465, height: 750 },
  { width: 1920, height: 1080 },
  { width: 1465, height: 1200 },
];

function near(actual, expected, tolerance, label) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${label}: expected ${expected} ± ${tolerance}, got ${actual}`,
  );
}

function percentage(expression) {
  const match = /(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)%/i.exec(expression ?? "");
  assert.ok(match, `expected a percentage in "${expression}"`);
  return Number(match[1]);
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
  await page.waitForFunction(
    () =>
      document
        .querySelector("[data-bento-stage]")
        ?.getAttribute("data-shown") === "true",
  );
  await page.waitForTimeout(300);
  return { context, page };
}

async function readLayout(page) {
  return page.$$eval("[data-bento-tile]", (nodes) =>
    nodes.map((node) => ({
      left: node.style.left,
      top: node.style.top,
      width: node.style.width,
      height: node.style.height,
      delay: node.style.getPropertyValue("--d"),
    })),
  );
}

function assertLayout(layout, expected, label) {
  assert.equal(layout.length, expected.length, `${label}: tile count`);
  expected.forEach((rect, index) => {
    const actual = layout[index];
    near(
      percentage(actual.left),
      rect[0],
      0.001,
      `${label} tile ${index + 1} left`,
    );
    near(
      percentage(actual.top),
      rect[1],
      0.001,
      `${label} tile ${index + 1} top`,
    );
    near(
      percentage(actual.width),
      rect[2],
      0.001,
      `${label} tile ${index + 1} width`,
    );
    near(
      percentage(actual.height),
      rect[3],
      0.001,
      `${label} tile ${index + 1} height`,
    );
  });
}

async function hoverTile(page, index) {
  const tile = page.locator(`[data-bento-tile="${index}"]`);
  const box = await tile.boundingBox();
  assert.ok(box, `tile ${index} has no box`);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForFunction(
    (target) =>
      document
        .querySelector("[data-bento-stage]")
        ?.getAttribute("data-hush") === "true" &&
      document
        .querySelector(`[data-bento-tile="${target}"]`)
        ?.getAttribute("data-bento-hovered") === "true",
    index,
  );
  await page.waitForTimeout(420);
}

async function geometry(page) {
  return page.evaluate(() => {
    const root = document.querySelector("[data-cms-media-bento]");
    const stage = document.querySelector("[data-bento-stage]");
    const tiles = Array.from(document.querySelectorAll("[data-bento-tile]"));
    const rootRect = root?.getBoundingClientRect();
    const stageRect = stage?.getBoundingClientRect();
    return {
      innerHeight: window.innerHeight,
      innerWidth: window.innerWidth,
      scrollHeight: document.documentElement.scrollHeight,
      scrollWidth: document.documentElement.scrollWidth,
      root: rootRect
        ? {
            top: rootRect.top,
            height: rootRect.height,
            bottom: rootRect.bottom,
          }
        : null,
      stage: stageRect
        ? {
            top: stageRect.top,
            height: stageRect.height,
            bottom: stageRect.bottom,
          }
        : null,
      tiles: tiles.map((node) => {
        const rect = node.getBoundingClientRect();
        return {
          top: rect.top,
          bottom: rect.bottom,
          left: rect.left,
          right: rect.right,
        };
      }),
      background: root ? getComputedStyle(root).backgroundColor : null,
    };
  });
}

function assertFillsViewport(data, label) {
  assert.ok(data.root, `${label}: root missing`);
  assert.ok(data.stage, `${label}: stage missing`);
  near(
    data.root.height,
    data.innerHeight,
    1,
    `${label}: root should fill the viewport`,
  );
  assert.ok(
    data.scrollHeight <= data.innerHeight + 1,
    `${label}: page should not scroll vertically (${data.scrollHeight} > ${data.innerHeight})`,
  );
  assert.ok(
    data.scrollWidth <= data.innerWidth + 1,
    `${label}: page should not scroll horizontally`,
  );
  const maxBottom = Math.max(...data.tiles.map((tile) => tile.bottom));
  assert.ok(
    maxBottom <= data.root.bottom + 0.5,
    `${label}: tiles must not overflow the canvas`,
  );
  near(
    data.stage.bottom - maxBottom,
    5,
    1.5,
    `${label}: bottom tile should sit one half-gap from the stage edge`,
  );
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
    await test("tall tree matches the measured reference", async () => {
      const { context, page } = await openDemo(browser);
      try {
        assertLayout(await readLayout(page), TALL, "tall");
        const delays = (await readLayout(page)).map((tile) => tile.delay);
        assert.deepEqual(
          delays,
          Array.from({ length: 10 }, (_, index) => `${index * 60}ms`),
        );
      } finally {
        await context.close();
      }
    });

    await test("wide tree matches the measured reference", async () => {
      const { context, page } = await openDemo(browser, "", {
        viewport: { width: 1465, height: 600 },
      });
      try {
        assertLayout(await readLayout(page), WIDE, "wide");
      } finally {
        await context.close();
      }
    });

    await test("hovering tile 5 re-solves the wide tree", async () => {
      const { context, page } = await openDemo(browser, "", {
        viewport: { width: 1465, height: 600 },
      });
      try {
        await hoverTile(page, 4);
        const layout = await readLayout(page);
        for (const [index, rect] of Object.entries(WIDE_HOVER_5)) {
          const actual = layout[Number(index)];
          near(
            percentage(actual.left),
            rect[0],
            0.01,
            `tile ${Number(index) + 1} left`,
          );
          near(
            percentage(actual.top),
            rect[1],
            0.01,
            `tile ${Number(index) + 1} top`,
          );
          near(
            percentage(actual.width),
            rect[2],
            0.01,
            `tile ${Number(index) + 1} width`,
          );
          near(
            percentage(actual.height),
            rect[3],
            0.01,
            `tile ${Number(index) + 1} height`,
          );
        }

        const shade = await page
          .locator('[data-bento-tile="4"] .bento-shade')
          .evaluate((node) => getComputedStyle(node).opacity);
        assert.equal(shade, "1");

        const veil = await page
          .locator('[data-bento-tile="0"] .bento-veil')
          .evaluate((node) => getComputedStyle(node).opacity);
        assert.equal(veil, "1");
      } finally {
        await context.close();
      }
    });

    await test("hovering tile 10 re-solves the tall tree", async () => {
      const { context, page } = await openDemo(browser);
      try {
        await hoverTile(page, 9);
        const layout = await readLayout(page);
        for (const [index, rect] of Object.entries(TALL_HOVER_10)) {
          const actual = layout[Number(index)];
          near(
            percentage(actual.left),
            rect[0],
            0.01,
            `tile ${Number(index) + 1} left`,
          );
          near(
            percentage(actual.top),
            rect[1],
            0.01,
            `tile ${Number(index) + 1} top`,
          );
          near(
            percentage(actual.width),
            rect[2],
            0.01,
            `tile ${Number(index) + 1} width`,
          );
          near(
            percentage(actual.height),
            rect[3],
            0.01,
            `tile ${Number(index) + 1} height`,
          );
        }
      } finally {
        await context.close();
      }
    });

    await test("uses ten distinct images and no video", async () => {
      const { context, page } = await openDemo(browser);
      try {
        const media = await page.$$eval("[data-bento-tile] img", (nodes) =>
          nodes.map((node) => ({
            src: node.getAttribute("src"),
            width: node.naturalWidth,
          })),
        );
        assert.equal(media.length, 10, "expected ten tiles");
        const sources = media.map((item) => item.src);
        assert.equal(
          new Set(sources).size,
          10,
          `expected ten distinct image sources, got ${JSON.stringify(sources)}`,
        );
        for (const item of media) {
          assert.ok(item.width > 0, `image failed to load: ${item.src}`);
        }
        assert.ok(
          sources.every(
            (src) =>
              !/(chrome-chair|coastal-tree|concrete-oculus|spiral-staircase|camera-reflection|silver-motion|white-motion)/.test(
                src ?? "",
              ),
          ),
          `black-and-white images must be removed: ${JSON.stringify(sources)}`,
        );
        assert.equal(
          await page.locator("[data-bento-tile] video").count(),
          0,
          "video elements must be removed",
        );
      } finally {
        await context.close();
      }
    });

    await test("full page fills every viewport in light and dark", async () => {
      for (const viewport of FILL_VIEWPORTS) {
        for (const theme of ["light", "dark"]) {
          const { context, page } = await openDemo(browser, "", {
            viewport,
            colorScheme: theme,
          });
          try {
            await page.evaluate((nextTheme) => {
              document.documentElement.classList.toggle(
                "dark",
                nextTheme === "dark",
              );
            }, theme);
            await page.waitForTimeout(200);
            const data = await geometry(page);
            assertFillsViewport(data, `${viewport.width}x${viewport.height} ${theme}`);
            if (theme === "dark") {
              assert.equal(
                data.background,
                "rgb(12, 13, 14)",
                "dark surface token should apply",
              );
            } else {
              assert.equal(
                data.background,
                "rgb(242, 241, 238)",
                "light surface token should apply",
              );
            }
          } finally {
            await context.close();
          }
        }
      }
    });

    await test("gap zero makes tiles meet the canvas edge exactly", async () => {
      const { context, page } = await openDemo(browser, "?gap=0");
      try {
        const data = await geometry(page);
        const maxBottom = Math.max(...data.tiles.map((tile) => tile.bottom));
        near(maxBottom, data.root.bottom, 1, "tile bottom vs canvas bottom");
        near(data.stage.bottom, data.root.bottom, 1, "stage vs canvas bottom");
      } finally {
        await context.close();
      }
    });

    await test("dark mode preserves an active hover state", async () => {
      const { context, page } = await openDemo(browser);
      try {
        await hoverTile(page, 4);
        await page.evaluate(() => document.documentElement.classList.add("dark"));
        await page.waitForTimeout(300);
        assert.equal(
          await page
            .locator('[data-bento-tile="4"]')
            .getAttribute("data-bento-hovered"),
          "true",
          "hover state should survive a theme change",
        );
        assert.equal(
          await page.locator("[data-bento-stage]").getAttribute("data-hush"),
          "true",
        );
        assert.equal(
          await page.evaluate(
            () =>
              getComputedStyle(
                document.querySelector("[data-cms-media-bento]"),
              ).backgroundColor,
          ),
          "rgb(12, 13, 14)",
        );
      } finally {
        await context.close();
      }
    });

    await test("moving between tiles keeps hush and leaving the stage clears it", async () => {
      const { context, page } = await openDemo(browser);
      try {
        await hoverTile(page, 0);
        const second = page.locator('[data-bento-tile="1"]');
        const box = await second.boundingBox();
        assert.ok(box);
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(80);
        assert.equal(
          await page.locator("[data-bento-stage]").getAttribute("data-hush"),
          "true",
        );

        await page.mouse.move(1, 1);
        await page.waitForFunction(
          () =>
            document
              .querySelector("[data-bento-stage]")
              ?.getAttribute("data-hush") === "false",
        );
      } finally {
        await context.close();
      }
    });

    await test("clicking a tile opens the lightbox and Escape closes it", async () => {
      const { context, page } = await openDemo(browser);
      try {
        await page.locator('[data-bento-tile="0"] button').first().click();
        await page.waitForSelector('[role="dialog"][aria-modal="true"]');
        assert.equal(
          await page.locator('[role="dialog"][aria-modal="true"]').count(),
          1,
        );
        assert.equal(
          await page.locator('[role="dialog"] img').count(),
          1,
          "lightbox should render an image",
        );
        await page.keyboard.press("Escape");
        await page.waitForFunction(
          () =>
            document.querySelector('[role="dialog"][aria-modal="true"]') ===
            null,
        );
        await page.waitForFunction(
          () =>
            document.activeElement
              ?.closest("[data-bento-tile]")
              ?.getAttribute("data-bento-tile") === "0",
          null,
          { timeout: 5000 },
        );
      } finally {
        await context.close();
      }
    });

    await test("mirror flips every rectangle horizontally", async () => {
      const { context, page } = await openDemo(browser, "?mirror=true");
      try {
        const layout = await readLayout(page);
        const mirrored = TALL.map(([x, y, w, h]) => [100 - x - w, y, w, h]);
        assertLayout(layout, mirrored, "mirror");
      } finally {
        await context.close();
      }
    });

    await test("mobile uses the two-column fallback", async () => {
      const { context, page } = await openDemo(browser, "", {
        viewport: { width: 390, height: 844 },
      });
      try {
        const stage = await page.locator("[data-bento-stage]").boundingBox();
        const first = await page.locator('[data-bento-tile="0"]').boundingBox();
        const second = await page
          .locator('[data-bento-tile="1"]')
          .boundingBox();
        assert.ok(stage && first && second);
        assert.ok(first.width > stage.width * 0.9);
        assert.ok(second.width < stage.width * 0.55);
        assert.equal(
          await page
            .locator('[data-bento-tile="0"]')
            .evaluate((node) => getComputedStyle(node).position),
          "relative",
        );
      } finally {
        await context.close();
      }
    });

    await test("component gallery shows the live bento card", async () => {
      const context = await browser.newContext({ viewport: VIEWPORT });
      const page = await context.newPage();
      try {
        await page.goto(`${BASE}/experience/components`, {
          waitUntil: "networkidle",
          timeout: 120000,
        });
        const card = page.locator(
          'a.group[href="/experience/components/cms-media-bento"]',
        );
        await card.scrollIntoViewIfNeeded();
        await page.waitForFunction(
          () => {
            const link = document.querySelector(
              'a.group[href="/experience/components/cms-media-bento"]',
            );
            return link?.querySelectorAll("[data-bento-tile]").length === 10;
          },
          null,
          { timeout: 30000 },
        );
        const metrics = await card.evaluate((node) => {
          const stage = node.querySelector("[data-bento-stage]");
          const firstTile = node.querySelector("[data-bento-tile]");
          return {
            tiles: node.querySelectorAll("[data-bento-tile]").length,
            position: firstTile
              ? getComputedStyle(firstTile).position
              : null,
            overflow: stage ? getComputedStyle(stage).overflow : null,
          };
        });
        assert.equal(metrics.tiles, 10, "expected ten live tiles");
        assert.equal(
          metrics.position,
          "absolute",
          "gallery card should force the bento composition",
        );
        assert.notEqual(
          metrics.overflow,
          "auto",
          "gallery card should not use the scrolling mobile grid",
        );
      } finally {
        await context.close();
      }
    });

    await test("docs starts on the full-page demo and fills the preview", async () => {
      const context = await browser.newContext({ viewport: VIEWPORT });
      const page = await context.newPage();
      await page.addInitScript(() => {
        try {
          window.localStorage.clear();
        } catch {
          /* noop */
        }
      });
      try {
        await page.goto(DOCS, { waitUntil: "networkidle", timeout: 120000 });
        assert.equal(
          await page.locator("[data-bento-card]").count(),
          0,
          "the old Default preview card should be removed",
        );
        const frameHandle = await page
          .locator('iframe[title="CMS Media Bento demo"]')
          .first()
          .elementHandle();
        assert.ok(frameHandle, "expected the full-page demo iframe");
        const frame = await frameHandle.contentFrame();
        assert.ok(frame, "expected iframe content");
        await frame.waitForFunction(
          () =>
            document
              .querySelector("[data-bento-stage]")
              ?.getAttribute("data-shown") === "true",
          null,
          { timeout: 30000 },
        );
        const frameBox = await frameHandle.boundingBox();
        const frameData = await frame.evaluate(() => {
          const root = document.querySelector("[data-cms-media-bento]");
          const stage = document.querySelector("[data-bento-stage]");
          const tiles = Array.from(document.querySelectorAll("[data-bento-tile]"));
          const rootRect = root.getBoundingClientRect();
          const stageRect = stage.getBoundingClientRect();
          return {
            innerHeight: window.innerHeight,
            rootHeight: rootRect.height,
            stageBottom: stageRect.bottom,
            rootBottom: rootRect.bottom,
            scrollHeight: document.documentElement.scrollHeight,
            maxTileBottom: Math.max(
              ...tiles.map((tile) => tile.getBoundingClientRect().bottom),
            ),
          };
        });
        assert.ok(frameBox && frameBox.height > 300, "iframe should be substantial");
        near(frameData.rootHeight, frameData.innerHeight, 1, "iframe root fill");
        near(
          frameData.rootBottom - frameData.stageBottom,
          5,
          1,
          "iframe stage should sit one half-gap inside the canvas",
        );
        near(
          frameData.stageBottom - frameData.maxTileBottom,
          5,
          1.5,
          "iframe bottom tile gap",
        );
        assert.ok(
          frameData.scrollHeight <= frameData.innerHeight + 1,
          "iframe should not scroll",
        );
      } finally {
        await context.close();
      }
    });

    await test("docs page has no hydration or duplicate-key errors", async () => {
      const context = await browser.newContext({ viewport: VIEWPORT });
      const page = await context.newPage();
      const errors = [];
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      page.on("pageerror", (error) => errors.push(error.message));
      try {
        await page.goto(DOCS, { waitUntil: "networkidle", timeout: 120000 });
        await page.waitForTimeout(1500);
        const offenders = errors.filter((text) =>
          /hydrat|same key|did not match|server rendered/i.test(text),
        );
        assert.deepEqual(offenders, []);
      } finally {
        await context.close();
      }
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
  console.log(
    `\n${results.length - failed.length}/${results.length} tests passed`,
  );
  if (failed.length > 0) process.exitCode = 1;
}

await run();
