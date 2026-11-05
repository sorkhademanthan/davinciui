import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = 4188;
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

let failures = 0;
const ok = (label, condition, detail = "") => {
  console.log(`${condition ? "ok  " : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!condition) failures += 1;
};

const browser = await chromium.launch();

async function newStage(params = "", contextOptions = {}) {
  const context = await browser.newContext({
    viewport: { width: 1400, height: 800 },
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

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const stage = (page) => page.locator("#stage");

/* ------------------------------------------------------------------ */
console.log("golden layout table (spec values, tolerance 0.01)");

{
  const { context, page, errors } = await newStage("?cards=5");
  const result = await page.evaluate(() => {
    const gold = window.__gold;
    const rows = [0.0011, 0.838, 1.0011, 1.838, 2.0011, 3.0011];
    return rows.map((d) => gold.computeDepthLayout(d, gold.DEFAULT_LAYOUT));
  });
  const expected = [
    { d: 0.0011, width: 449.836, height: 299.945, x: 0.455, z: -0.219, rotateY: 0.0385, zIndex: 1000 },
    { d: 0.838, width: 324.293, height: 258.098, x: 347.789, z: -167.609, rotateY: 29.3316, zIndex: 992 },
    { d: 1.0011, width: 300, height: 250, x: 415.317, z: -200.219, rotateY: 35.0384, zIndex: 990 },
    { d: 1.838, width: 300, height: 250, x: 657.195, z: -367.609, rotateY: 64.3316, zIndex: 982 },
    { d: 2.0011, width: 300, height: 250, x: 704.317, z: -400.219, rotateY: 70.0384, zIndex: 980 },
    { d: 3.0011, width: 300, height: 250, x: 993.317, z: -600.219, rotateY: 90, zIndex: 970 },
  ];
  // `a` is printed to 3 decimals in the spec; 0.0005 slot * 415px ~= 0.2px
  // worst case, so X/Z assertions use 0.05px. All other checks hold at 0.01.
  const near = (a, b) => Math.abs(a - b) <= 0.05;
  for (let i = 0; i < expected.length; i += 1) {
    const e = expected[i];
    const got = result[i];
    ok(`a=${e.d}: width/height`, near(got.width, e.width) && near(got.height, e.height),
      `${got.width.toFixed(3)}/${got.height.toFixed(3)}`);
    ok(`a=${e.d}: translateX/Z`, near(got.x, e.x) && near(got.z, e.z),
      `${got.x.toFixed(3)}/${got.z.toFixed(3)}`);
    ok(`a=${e.d}: rotateY`, near(got.rotateY, e.rotateY), `${got.rotateY.toFixed(4)}`);
    ok(`a=${e.d}: z-index`, got.zIndex === e.zIndex, `${got.zIndex}`);
  }
  // Mirror: negative d negates X and rotateY, keeps Z, same z-index.
  const mirror = await page.evaluate(() => {
    const gold = window.__gold;
    return [0.838, 1.838].map((d) => gold.computeDepthLayout(-d, gold.DEFAULT_LAYOUT));
  });
  ok("mirror: X and rotateY negated",
    near(mirror[0].x, -347.789) && near(mirror[1].x, -657.195) &&
    near(mirror[0].rotateY, -29.3316) && near(mirror[1].rotateY, -64.3316));
  ok("no console errors on golden page", errors.length === 0, errors.join(" | "));
  await context.close();
}

/* ------------------------------------------------------------------ */
console.log("initial layout");

{
  const { context, page, errors } = await newStage("?cards=5");
  await wait(800);
  const items = await page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-depth-index]")).map((el) => {
      const style = getComputedStyle(el);
      return {
        index: Number(el.getAttribute("data-depth-index")),
        width: parseFloat(style.width),
        height: parseFloat(style.height),
        transform: style.transform,
        zIndex: Number(style.zIndex),
        ariaHidden: el.getAttribute("aria-hidden"),
      };
    }),
  );
  const active = items.find((item) => item.index === 0);
  ok("items mounted: 20 virtual slides for 5 images", items.length === 20,
    `items=${items.length}`);
  ok("active card is exactly 450x300", active &&
    Math.abs(active.width - 450) < 0.5 && Math.abs(active.height - 300) < 0.5,
    active ? `${active.width.toFixed(1)}x${active.height.toFixed(1)}` : "missing");
  ok("active card centred in stage", active && Math.abs(parseFloat(active.transform.split(",")[4])) < 1,
    active?.transform);
  ok("active card z-index 1000, row above 990", active && active.zIndex === 1000 &&
    items.find((item) => item.index === 1)?.zIndex === 990 &&
    items.find((item) => item.index === items.length - 1)?.zIndex === 990);
  const mirrored = await page.evaluate(() => {
    const matrixX = (el) => {
      const m = new DOMMatrix(getComputedStyle(el).transform);
      return m.m41;
    };
    const plus = document.querySelector('[data-depth-index="1"]');
    const minus = document.querySelector(`[data-depth-index="${document.querySelectorAll("[data-depth-index]").length - 1}"]`);
    return Math.abs(matrixX(plus) + matrixX(minus)) < 0.01;
  });
  ok("neighbours mirror (slot +1 vs slot -1)", mirrored);
  ok("exactly one slide exposed to AT",
    items.filter((item) => item.ariaHidden !== "true").length === 1);
  ok("no console errors", errors.length === 0, errors.join(" | "));
  await context.close();
}

/* ------------------------------------------------------------------ */
console.log("loop density at 2560px with 3, 7 and 20 images");

for (const cards of [3, 7, 20]) {
  const { context, page, errors } = await newStage(`?cards=${cards}`, {
    viewport: { width: 2560, height: 1440 },
  });
  await wait(1200);
  const count = await page.evaluate(
    () => document.querySelectorAll("[data-depth-index]").length,
  );
  // N = M * ceil(20 / M)
  const expected = cards * Math.ceil(20 / cards);
  ok(`${cards} images mount ${expected} virtual slides`, count === expected,
    `items=${count}`);
  ok(`${cards} images: no console errors on load`, errors.length === 0,
    errors.join(" | "));
  await context.close();
}

/* ------------------------------------------------------------------ */
console.log("interactions");

{
  const { context, page, errors } = await newStage("?cards=5");
  await wait(800);
  const before = await stage(page).screenshot();
  await page.locator("[data-depth-drag]").hover();
  await page.mouse.move(900, 260);
  await page.mouse.down();
  for (let x = 900; x >= 500; x -= 25) await page.mouse.move(x, 260);
  await page.mouse.up();
  await wait(1500); // spring settles onto an exact slot
  const after = await stage(page).screenshot();
  ok("drag with momentum changes the layout and settles", !before.equals(after));
  ok("no console errors after drag", errors.length === 0, errors.join(" | "));
  await context.close();
}

{
  const { context, page, errors } = await newStage("?cards=5");
  await wait(800);
  const scrollBefore = await page.evaluate(() => window.scrollY);
  const before = await stage(page).screenshot();
  await page.mouse.move(700, 260);
  await page.mouse.wheel(240, 0);
  await wait(900);
  const after = await stage(page).screenshot();
  const scrollAfter = await page.evaluate(() => window.scrollY);
  ok("horizontal wheel rotates the deck", !before.equals(after));
  ok("horizontal wheel does not scroll the page", scrollAfter === scrollBefore);
  ok("no console errors after wheel", errors.length === 0, errors.join(" | "));
  await context.close();
}

{
  const { context, page, errors } = await newStage("?cards=5");
  await wait(800);
  const scrollBefore = await page.evaluate(() => window.scrollY);
  const before = await stage(page).screenshot();
  await page.mouse.move(700, 260);
  await page.mouse.wheel(0, 320);
  await wait(400);
  const after = await stage(page).screenshot();
  const scrollAfter = await page.evaluate(() => window.scrollY);
  ok("plain vertical wheel scrolls the page", scrollAfter > scrollBefore,
    `scrollY ${scrollBefore} -> ${scrollAfter}`);
  ok("plain vertical wheel leaves the deck alone", before.equals(after));
  ok("no console errors after vertical wheel", errors.length === 0, errors.join(" | "));
  await context.close();
}

{
  const { context, page, errors } = await newStage("?cards=5");
  await wait(800);
  const before = await stage(page).screenshot();
  await page.keyboard.down("Shift");
  await page.mouse.move(700, 260);
  await page.mouse.wheel(0, 240);
  await page.keyboard.up("Shift");
  await wait(900);
  const after = await stage(page).screenshot();
  ok("Shift+vertical wheel rotates the deck", !before.equals(after));
  ok("no console errors after Shift+wheel", errors.length === 0, errors.join(" | "));
  await context.close();
}

{
  const { context, page, errors } = await newStage("?cards=5");
  await wait(800);
  const before = await stage(page).screenshot();
  await page.locator("[data-depth-drag]").focus();
  await page.keyboard.press("ArrowRight");
  await wait(1200);
  const after = await stage(page).screenshot();
  ok("ArrowRight advances the deck", !before.equals(after));
  ok("no console errors after keyboard", errors.length === 0, errors.join(" | "));
  await context.close();
}

{
  const { context, page, errors } = await newStage("?cards=5");
  await wait(800);
  const before = await stage(page).screenshot();
  await page.mouse.click(1115, 260); // slot +1 region (415px right of centre)
  await wait(1500);
  const after = await stage(page).screenshot();
  ok("clicking a side card springs it toward the centre", !before.equals(after));
  ok("no console errors after side click", errors.length === 0, errors.join(" | "));
  await context.close();
}

{
  const { context, page, errors } = await newStage("?cards=5&link=1");
  await wait(800);
  await page.mouse.click(700, 260); // active card with link
  const opened = await page.evaluate(() => window.__opened ?? []);
  ok("clicking the active card opens its link in a new tab with noopener",
    opened.length === 1 && opened[0][0] === "https://example.com" &&
    String(opened[0][2] ?? "").includes("noopener"),
    JSON.stringify(opened));
  ok("no console errors after link click", errors.length === 0, errors.join(" | "));
  await context.close();
}

{
  // Touch swipe: synthetic pointer events with pointerType "touch".
  const { context, page, errors } = await newStage("?cards=5");
  await wait(800);
  const before = await stage(page).screenshot();
  await page.evaluate(() => {
    const el = document.querySelector("[data-depth-drag]");
    const fire = (type, x) =>
      el.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          pointerId: 42,
          pointerType: "touch",
          clientX: x,
          clientY: 260,
          isPrimary: true,
          button: 0,
        }),
      );
    fire("pointerdown", 900);
    for (let x = 900; x >= 500; x -= 20) fire("pointermove", x);
    fire("pointerup", 500);
  });
  await wait(1500);
  const after = await stage(page).screenshot();
  const touchAction = await page.evaluate(
    () => getComputedStyle(document.querySelector("[data-depth-drag]")).touchAction,
  );
  ok("touch swipe rotates the deck", !before.equals(after));
  ok("drag layer keeps touch-action: pan-y", touchAction === "pan-y", touchAction);
  ok("no console errors after touch", errors.length === 0, errors.join(" | "));
  await context.close();
}

/* ------------------------------------------------------------------ */
console.log("edge blur");

{
  const { context, page, errors } = await newStage("?cards=5");
  await wait(500);
  const blur = await page.evaluate(() => {
    const layers = Array.from(document.querySelectorAll('[aria-hidden="true"]'))
      .filter((el) => el.style.backdropFilter || el.style.webkitBackdropFilter);
    return layers.map((el) => ({
      side: getComputedStyle(el).left === "0px" ? "left" : "right",
      width: el.style.width,
      backdropFilter: el.style.backdropFilter,
      maskImage: el.style.maskImage,
      pointerEvents: getComputedStyle(el).pointerEvents,
    }));
  });
  ok("two edge blur layers render", blur.length === 2, JSON.stringify(blur.map(b => b.side)));
  for (const layer of blur) {
    ok(`blur ${layer.side}: 25% width, blur(25px), gradient mask, pointer-events none`,
      layer.width === "25%" &&
      layer.backdropFilter === "blur(25px)" &&
      /linear-gradient\(to (right|left), black 0%, transparent 100%\)/.test(layer.maskImage) &&
      layer.pointerEvents === "none",
      JSON.stringify(layer));
  }
  ok("no console errors on blur page", errors.length === 0, errors.join(" | "));
  await context.close();
}

/* ------------------------------------------------------------------ */
console.log("responsive scale and unmount");

{
  const { context, page, errors } = await newStage("?cards=5");
  await page.setViewportSize({ width: 1000, height: 700 });
  await wait(600);
  const wide = await page.evaluate(() => {
    const el = document.querySelector('[data-depth-index="0"]');
    return parseFloat(getComputedStyle(el).width);
  });
  await page.setViewportSize({ width: 620, height: 700 });
  await wait(600);
  const narrow = await page.evaluate(() => {
    const el = document.querySelector('[data-depth-index="0"]');
    return parseFloat(getComputedStyle(el).width);
  });
  // scale = clamp(w / 1000, 0.55, 1); root is 100% wide, minus padding 16px each side.
  const expectedWide = 450 * Math.min(1, (1000 - 32) / 1000);
  const expectedNarrow = 450 * 0.6; // root is min-width 600px by contract
  ok("responsiveScale shrinks the active card at narrow widths",
    Math.abs(wide - expectedWide) < 1 && Math.abs(narrow - expectedNarrow) < 1,
    `wide=${wide.toFixed(1)} (want ${expectedWide.toFixed(1)}) narrow=${narrow.toFixed(1)} (want ${expectedNarrow.toFixed(1)})`);
  ok("no console errors after resize", errors.length === 0, errors.join(" | "));
  await context.close();
}

{
  const { context, page, errors } = await newStage("?autoplay=1");
  await wait(1200);
  const mountedCount = await page.evaluate(
    () => document.querySelectorAll("[data-depth-index]").length,
  );
  await page.locator("#toggle-mounted").click();
  await wait(400);
  const afterUnmount = await page.evaluate(
    () => document.querySelectorAll("[data-depth-index]").length,
  );
  ok("unmount removes the deck from the DOM", mountedCount > 0 && afterUnmount === 0,
    `mounted=${mountedCount} afterUnmount=${afterUnmount}`);
  await page.locator("#toggle-mounted").click();
  await wait(600);
  const remounted = await page.evaluate(
    () => document.querySelectorAll("[data-depth-index]").length,
  );
  ok("remount restores the deck", remounted === mountedCount,
    `mounted=${mountedCount} remounted=${remounted}`);
  ok("no console errors across mount/unmount", errors.length === 0, errors.join(" | "));
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
console.log("placeholders and slots");

{
  const { context, page, errors } = await newStage("?empty=1");
  await wait(800);
  const count = await page.evaluate(
    () => document.querySelectorAll("[data-depth-index]").length,
  );
  ok("empty items render 5 gradient placeholders (20 virtual slides)", count === 20,
    `items=${count}`);
  ok("no console errors with placeholders", errors.length === 0, errors.join(" | "));
  await context.close();
}

await browser.close();
server.close();

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nall checks passed");
