import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = 4175;
const origin = `http://127.0.0.1:${port}`;
const base = `${origin}/index.html`;
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".webm": "video/webm",
  ".mp4": "video/mp4",
};

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url ?? "/", origin).pathname,
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

await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));

const browser = await chromium.launch();
const results = [];

function record(name, pass, detail = "") {
  results.push({ name, pass, detail });
}

function closeTo(actual, expected, tolerance) {
  return Math.abs(actual - expected) <= tolerance;
}

async function openPage(context, query = "") {
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  await page.goto(`${base}${query}`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => Boolean(window.__ARCWAVE_GOLDEN__), null, {
    timeout: 10000,
  });
  return { page, errors };
}

async function center(page, selector = "#main-carousel") {
  return page.evaluate((target) => {
    const rootElement = document.querySelector(target);
    const plate = rootElement?.querySelector('[data-center="true"]');
    const transform = plate?.style.transform ?? "";
    const match = transform.match(
      /translate3d\(([-\d.]+)px,\s*[-\d.]+px,\s*([-\d.]+)px\)\s*rotateY\(([-\d.]+)deg\)/,
    );
    return {
      slot: plate ? Number(plate.getAttribute("data-thr3-slot")) : null,
      x: match ? Number(match[1]) : Number.NaN,
      z: match ? Number(match[2]) : Number.NaN,
      rotateY: match ? Number(match[3]) : Number.NaN,
      label: plate?.getAttribute("aria-label") ?? "",
    };
  }, selector);
}

async function moveAway(page) {
  await page.mouse.move(4, 4);
}

async function loadDefault(t, page) {
  await page.selectOption('[data-testid="autoplay"]', "off");
  await moveAway(page);
  await page.waitForTimeout(250);
}

try {
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1300 },
  });

  {
    const { page, errors } = await openPage(context);
    const golden = await page.evaluate(() => window.__ARCWAVE_GOLDEN__);
    record(
      "golden geometry and DOM",
      Boolean(golden?.pass),
      `pitch=${golden?.pitch?.toFixed(4)} checks=${golden?.checks.length + golden?.domChecks.length}`,
    );
    record(
      "default page console errors",
      errors.length === 0,
      errors.join("; "),
    );
    await page.close();
  }

  {
    const { page } = await openPage(context, "?autoplay=0");
    await page.waitForTimeout(250);
    const start = await center(page);
    record("initial centre slot", start.slot === 0, JSON.stringify(start));

    await page.locator('[data-testid="autoplay-speed"]').fill("2");
    await page.locator('[data-testid="autoplay"]').selectOption("on");
    await moveAway(page);
    await page.waitForTimeout(650);
    const autoplay = await center(page);
    record(
      "continuous autoplay advances",
      autoplay.slot !== null && autoplay.slot !== start.slot,
      JSON.stringify(autoplay),
    );

    await page.selectOption('[data-testid="autoplay"]', "off");
    await page.waitForTimeout(250);
    await page.locator('[data-testid="autoplay-mode"]').selectOption("step");
    await page.selectOption('[data-testid="autoplay"]', "on");
    await moveAway(page);
    await page.waitForTimeout(3300);
    const step = await center(page);
    record(
      "step autoplay advances one slot",
      step.slot !== null && step.slot === (autoplay.slot ?? 0) + 1,
      JSON.stringify(step),
    );
    await page.close();
  }

  {
    const { page } = await openPage(context, "?autoplay=0");
    await loadDefault(null, page);
    const region = page.locator("#main-carousel [role=region]");
    const box = await region.boundingBox();
    if (!box) throw new Error("main carousel has no box");
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx - 320, cy, { steps: 14 });
    await page.mouse.up();
    await page.waitForTimeout(900);
    const drag = await center(page);
    record(
      "drag moves the ring",
      drag.slot !== null && drag.slot !== 0,
      JSON.stringify(drag),
    );

    await page.reload({ waitUntil: "networkidle" });
    await page.waitForFunction(() => Boolean(window.__ARCWAVE_GOLDEN__));
    await loadDefault(null, page);
    await page.mouse.move(cx, cy);
    await page.mouse.wheel(0, 420);
    await page.waitForTimeout(900);
    const wheel = await center(page);
    record(
      "wheel moves the ring",
      wheel.slot !== null && wheel.slot !== 0,
      JSON.stringify(wheel),
    );

    await page.reload({ waitUntil: "networkidle" });
    await page.waitForFunction(() => Boolean(window.__ARCWAVE_GOLDEN__));
    await loadDefault(null, page);
    await page.selectOption('[data-testid="snap"]', "on");
    await page.mouse.move(cx, cy);
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(900);
    const snap = await center(page);
    record(
      "snap settles on a slot",
      snap.slot !== null && Math.abs(snap.x) < 1.5,
      JSON.stringify(snap),
    );

    await page.reload({ waitUntil: "networkidle" });
    await page.waitForFunction(() => Boolean(window.__ARCWAVE_GOLDEN__));
    await loadDefault(null, page);
    await region.focus();
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(900);
    const keyboard = await center(page);
    record(
      "keyboard next",
      keyboard.slot === 1 && Math.abs(keyboard.x) < 1.5,
      JSON.stringify(keyboard),
    );

    await page.reload({ waitUntil: "networkidle" });
    await page.waitForFunction(() => Boolean(window.__ARCWAVE_GOLDEN__));
    await loadDefault(null, page);
    const side = page.locator('#main-carousel [data-thr3-slot="3"]');
    await side.click({ force: true });
    await page.waitForTimeout(900);
    const clicked = await center(page);
    record(
      "click side card centres it",
      clicked.slot === 3,
      JSON.stringify(clicked),
    );
    await page.close();
  }

  {
    const { page } = await openPage(context, "?autoplay=0");
    await loadDefault(null, page);
    const centre = page.locator("#main-carousel [data-center=true]");
    await centre.hover();
    await page.waitForTimeout(450);
    const hoverOn = await centre
      .locator(".thr3-caption-copy")
      .evaluate((node) => Number(getComputedStyle(node).opacity));
    await moveAway(page);
    await page.waitForTimeout(450);
    const hoverOff = await centre
      .locator(".thr3-caption-copy")
      .evaluate((node) => Number(getComputedStyle(node).opacity));
    record(
      "hover caption reveals",
      hoverOn > 0.9 && hoverOff < 0.1,
      `${hoverOn} -> ${hoverOff}`,
    );

    await page.selectOption('[data-testid="captions"]', "center");
    await page.waitForTimeout(500);
    const centreOpacity = await centre
      .locator(".thr3-caption-copy")
      .evaluate((node) => Number(getComputedStyle(node).opacity));
    const sideOpacity = await page
      .locator('#main-carousel [data-thr3-slot="3"] .thr3-caption-copy')
      .evaluate((node) => Number(getComputedStyle(node).opacity));
    record(
      "centre-only captions",
      centreOpacity > 0.9 && sideOpacity < 0.1,
      `${centreOpacity}/${sideOpacity}`,
    );

    await page.selectOption('[data-testid="captions"]', "always");
    await page.waitForTimeout(500);
    const alwaysOpacity = await page
      .locator('#main-carousel [data-thr3-slot="3"] .thr3-caption-copy')
      .evaluate((node) => Number(getComputedStyle(node).opacity));
    record("always captions", alwaysOpacity > 0.9, String(alwaysOpacity));
    await page.close();
  }

  {
    const { page } = await openPage(context, "?autoplay=0");
    await page.waitForTimeout(250);
    const compact = await page.evaluate(() => {
      const rootElement = document.querySelector("#compact-carousel");
      const plate = rootElement?.querySelector('[data-center="true"]');
      const rect = plate?.getBoundingClientRect();
      return { width: rect?.width ?? 0, height: rect?.height ?? 0 };
    });
    record(
      "fillHeight responsive sizing",
      closeTo(compact.height, 262.4, 1) && closeTo(compact.width, 183.68, 1),
      JSON.stringify(compact),
    );
    await page.close();
  }

  {
    const { page } = await openPage(context, "?canvas=1&autoplay=0");
    await page.waitForTimeout(300);
    const canvas = await center(page);
    record(
      "Framer canvas static centre",
      canvas.slot === 10,
      JSON.stringify(canvas),
    );
    await page.close();
  }

  {
    const reducedContext = await browser.newContext({
      viewport: { width: 1600, height: 1300 },
      reducedMotion: "reduce",
    });
    const { page } = await openPage(reducedContext);
    await moveAway(page);
    await page.waitForTimeout(1300);
    const reduced = await center(page);
    const rafText = await page.locator("header").textContent();
    record(
      "reduced motion disables autoplay",
      reduced.slot === 0 && Boolean(rafText?.includes("RAF 0/s")),
      `${JSON.stringify(reduced)} ${rafText?.includes("RAF 0/s")}`,
    );
    await page.close();
    await reducedContext.close();
  }

  {
    const { page, errors } = await openPage(context, "?video=1&autoplay=0");
    await loadDefault(null, page);
    await page.waitForTimeout(800);
    const centreVideo = page.locator(
      '#main-carousel [data-center="true"] video',
    );
    const centreExists = (await centreVideo.count()) === 1;
    const centrePlaying = centreExists
      ? await centreVideo.evaluate((video) => !video.paused)
      : false;
    record(
      "video renders and autoplays muted",
      centreExists && centrePlaying,
      `exists=${centreExists} playing=${centrePlaying}`,
    );

    const region = page.locator("#main-carousel [role=region]");
    await region.focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(900);
    const sideVideo = page.locator('#main-carousel [data-thr3-slot="0"] video');
    const visibleSide = await sideVideo.evaluate((video) => !video.paused);
    record(
      "visible playback keeps side video playing",
      visibleSide,
      String(visibleSide),
    );

    await page.selectOption('[data-testid="video-playback"]', "centre");
    await page.waitForTimeout(400);
    const centreSidePaused = await sideVideo.evaluate((video) => video.paused);
    record(
      "centre playback pauses side video",
      centreSidePaused,
      String(centreSidePaused),
    );

    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(900);
    const centrePlayingAgain = await page
      .locator('#main-carousel [data-center="true"] video')
      .evaluate((video) => !video.paused);
    record(
      "centre playback plays centre video",
      centrePlayingAgain,
      String(centrePlayingAgain),
    );

    await page.selectOption('[data-testid="video-playback"]', "always");
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(900);
    const alwaysSide = await sideVideo.evaluate((video) => !video.paused);
    record("always playback plays side video", alwaysSide, String(alwaysSide));
    record("video page console errors", errors.length === 0, errors.join("; "));
    await page.close();
  }

  {
    const linkContext = await browser.newContext({
      viewport: { width: 1600, height: 1300 },
    });
    await linkContext.route("https://example.com/**", (route) =>
      route.fulfill({ status: 200, contentType: "text/html", body: "linked" }),
    );
    const { page } = await openPage(linkContext, "?link=1&autoplay=0");
    await loadDefault(null, page);
    const region = page.locator("#main-carousel [role=region]");
    await region.focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(900);
    const sideLink = page.locator('#main-carousel [data-thr3-slot="0"]');
    const before = page.url();
    await sideLink.click({ force: true });
    await page.waitForTimeout(900);
    const centredLink = await center(page);
    record(
      "side link centres instead of navigating",
      page.url() === before && centredLink.slot === 0,
      `${page.url()} ${JSON.stringify(centredLink)}`,
    );

    const centreLink = page.locator('#main-carousel [data-center="true"] a');
    const [popup] = await Promise.all([
      page.waitForEvent("popup", { timeout: 5000 }),
      centreLink.click({ force: true }),
    ]);
    await popup.waitForLoadState("domcontentloaded");
    record(
      "centre link navigates",
      popup.url().startsWith("https://example.com"),
      popup.url(),
    );
    await popup.close();
    await page.close();
    await linkContext.close();
  }

  {
    const { page } = await openPage(context, "?autoplay=0");
    await page.waitForTimeout(1600);
    const header = (await page.locator("header").textContent()) ?? "";
    record("idle RAF stops", header.includes("RAF 0/s"), header.slice(0, 180));
    await page.close();
  }

  {
    const { page } = await openPage(context);
    await page.waitForTimeout(1600);
    const header = (await page.locator("header").textContent()) ?? "";
    const match = header.match(/RAF (\d+)\/s/);
    record(
      "autoplay RAF runs",
      Boolean(match) && Number(match[1]) > 30,
      header.slice(0, 180),
    );
    await page.close();
  }

  {
    const { page } = await openPage(context, "?autoplay=0");
    await page.waitForTimeout(250);
    const a11y = await page.evaluate(() => {
      const rootElement = document.querySelector("#main-carousel");
      const plates = Array.from(
        rootElement?.querySelectorAll(".thr3-plate") ?? [],
      );
      const centre = plates.find(
        (plate) => plate.getAttribute("data-center") === "true",
      );
      const hidden = plates.filter(
        (plate) => plate.getAttribute("aria-hidden") === "true",
      );
      return {
        centreTabIndex: centre?.tabIndex,
        hiddenTabIndex: hidden.every((plate) => plate.tabIndex === -1),
        hiddenCount: hidden.length,
        regionLabel: rootElement
          ?.querySelector("[role=region]")
          ?.getAttribute("aria-label"),
      };
    });
    record(
      "focus and aria state",
      a11y.centreTabIndex === 0 &&
        a11y.hiddenTabIndex &&
        a11y.hiddenCount > 0 &&
        Boolean(a11y.regionLabel),
      JSON.stringify(a11y),
    );
    await page.close();
  }

  await context.close();
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

const failed = results.filter((result) => !result.pass);
console.log(JSON.stringify({ pass: failed.length === 0, results }, null, 2));
process.exit(failed.length === 0 ? 0 : 1);
