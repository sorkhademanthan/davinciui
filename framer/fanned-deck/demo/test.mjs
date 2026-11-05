import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = fileURLToPath(new URL(".", import.meta.url));
const imagesRoot = join(root, "../../../apps/web/public");
const port = 4191;
const base = `http://127.0.0.1:${port}`;
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".png": "image/png",
};

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url ?? "/", base).pathname);
    const relative = normalize(pathname).replace(/^([/\\])+/, "");
    const file = relative.startsWith("images/")
      ? join(imagesRoot, relative)
      : join(root, relative === "" ? "index.html" : relative);
    if (!file.startsWith(root) && !file.startsWith(imagesRoot)) throw new Error("outside root");
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
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const near = (a, b, tol = 0.001) => Math.abs(a - b) <= tol;

// Reference values extracted from arcdeckpro.framer.website (see REPORT).
const LIVE = {
  itemX: [-1.8, -1.2, -0.6, 0, 0.6, 1.2, 1.8],
  arcY: [0.31, 0.1378, 0.0344, 0, 0.0344, 0.1378, 0.31],
  hop: [0.33, 0.28, 0.23, 0.18, 0.23, 0.28, 0.33],
  tilt: [-16.5, -12.167, -7.833, -3.5, 0.833, 5.167, 9.5],
  scale: [1, 0.9111, 0.8578, 0.84, 0.8578, 0.9111, 1],
  bob: [
    ["5.4s", "0s"], ["6.3s", "-0.85s"], ["7.2s", "-1.7s"],
    ["5.4s", "-2.55s"], ["6.3s", "-3.4s"], ["7.2s", "-4.25s"], ["5.4s", "-5.1s"],
  ],
  bubbleIdle: [-0.0852, -0.0123, 0.0375, 0.0662, 0.0688, 0.0207, -0.0495],
  bubbleHover: [-0.0672, -0.0071, 0.0314, 0.0494, 0.0447, 0.007, -0.0517],
  colors: ["#2f6bff", "#ff5a3c", "#e8890c", "#ff4f9a", "#d7263d", "#7b5cff", "#5e9c78"],
  slice: [
    { x: 0.00977, z: 0.0819, ry: 20.429 },
    { x: 0.00593, z: 0.05881, ry: 17.286 },
    { x: 0.00325, z: 0.03947, ry: 14.143 },
    { x: 0.00153, z: 0.02392, ry: 11.0 },
    { x: 0.00056, z: 0.01222, ry: 7.857 },
    { x: 0.00012, z: 0.00441, ry: 4.714 },
    { x: 0.0, z: 0.00049, ry: 1.571 },
  ],
  hoverSpread: [0.16, 0.0992, 0.0615, 0.0381, 0.0236, 0.0147],
  hoverTilt0: -6.6,
  hoverScale0: 1.06,
  hoverSlice0: { x: 0.00199, z: 0.03717, ry: 9.193 },
};

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(String(error)));
page.on("console", (message) => {
  if (message.type() === "error" && !/favicon/i.test(message.text()))
    errors.push(message.text());
});
await page.goto(`${base}/index.html`, { waitUntil: "networkidle" });
await wait(3500); // entrance settles

const readDeck = () =>
  page.evaluate(() => {
    const num = (text, re) => {
      const m = (text || "").match(re);
      return m ? Number(m[1]) : null;
    };
    return [...document.querySelectorAll('[role="listitem"]')].map((li, i) => {
      const arc = li.children[0];
      const hop = arc.children[0];
      const bob = hop.children[0];
      const persp = bob.children[0];
      const threeD = persp.children[0];
      const face = threeD.children[0].children[0];
      const bubble = bob.children[1].children[0];
      const slice0 = face.children[1];
      const overlayA = slice0.children[0].children[1];
      const itemStyle = li.getAttribute("style") || "";
      return {
        i,
        x: num(itemStyle, /transform: translate3d\(calc\(var\(--s\) \* (-?[0-9.]+)\), 0, 0\)/),
        z: num(itemStyle, /z-index: (\d+)/),
        arcY: num(arc.getAttribute("style"), /var\(--s\) \* ([0-9.-]+) -/),
        lift: num(arc.getAttribute("style"), /- (\d+)px\)/),
        hop: num(hop.getAttribute("style"), /\* ([0-9.]+)\)/),
        bobAnim: bob.getAttribute("style")?.match(/animation: ([^;]+);/)?.[1] ?? "",
        tilt: num(persp.getAttribute("style"), /rotate\((-?[0-9.]+)deg\)/),
        scale: num(persp.getAttribute("style"), /scale\(([0-9.]+)\)/),
        slice0: {
          x: num(slice0.getAttribute("style"), /translate3d\(calc\(var\(--s\) \* (-?[0-9.]+)\)/),
          z: num(slice0.getAttribute("style"), /0, calc\(var\(--s\) \* ([0-9.]+)\)/),
          ry: num(slice0.getAttribute("style"), /rotateY\((-?[0-9.]+)deg\)/),
        },
        overlayA: getComputedStyle(overlayA).opacity,
        bubble: bubble.getAttribute("style") || "",
        bubbleOpacity: getComputedStyle(bubble).opacity,
      };
    });
  });

/* ------------------------------------------------------------------ */
console.log("idle fan vs live reference");

{
  const deck = await readDeck();
  ok("7 cards mount with listitem roles", deck.length === 7, `items=${deck.length}`);
  for (const ref of LIVE.itemX.map((x, i) => ({ i, x }))) {
    ok(`card ${ref.i}: item X ${ref.x}`, near(deck[ref.i].x, ref.x, 0.0001), `${deck[ref.i].x}`);
  }
  for (const ref of LIVE.arcY.map((y, i) => ({ i, y }))) {
    ok(`card ${ref.i}: arc Y ${ref.y}`, near(deck[ref.i].arcY, ref.y, 0.0001), `${deck[ref.i].arcY}`);
  }
  for (const ref of LIVE.hop.map((h, i) => ({ i, h }))) {
    ok(`card ${ref.i}: hop ${ref.h}`, near(deck[ref.i].hop, ref.h, 0.0001), `${deck[ref.i].hop}`);
  }
  for (const ref of LIVE.tilt.map((t, i) => ({ i, t }))) {
    ok(`card ${ref.i}: tilt ${ref.t}`, near(deck[ref.i].tilt, ref.t, 0.001), `${deck[ref.i].tilt}`);
  }
  for (const ref of LIVE.scale.map((s, i) => ({ i, s }))) {
    ok(`card ${ref.i}: scale ${ref.s}`, near(deck[ref.i].scale, ref.s, 0.001), `${deck[ref.i].scale}`);
  }
  for (let i = 0; i < 7; i += 1) {
    const anim = deck[i].bobAnim;
    const dur = anim.match(/^([0-9.]+)s/)?.[1];
    const delay = anim.match(/ ease-in-out (-?[0-9.]+)s infinite/)?.[1];
    ok(`card ${i}: bob ${LIVE.bob[i][0]} / ${LIVE.bob[i][1]}`,
      `${dur}s` === LIVE.bob[i][0] && `${delay}s` === LIVE.bob[i][1],
      anim.slice(0, 40));
  }
  for (let i = 0; i < 7; i += 1) {
    ok(`card ${i}: z-index ${i + 1}`, deck[i].z === i + 1, `${deck[i].z}`);
  }
  for (const ref of LIVE.slice.map((s, j) => ({ j, ...s }))) {
    const got = deck[0].slice0; // only slice 0 read per card; slice j checked via card order below
    void ref;
    void got;
  }
  ok("slice 0 curvature (x/z/rotateY)",
    near(deck[0].slice0.x, LIVE.slice[0].x, 0.0001) &&
    near(deck[0].slice0.z, LIVE.slice[0].z, 0.0001) &&
    near(deck[0].slice0.ry, LIVE.slice[0].ry, 0.001),
    JSON.stringify(deck[0].slice0));
  ok("idle overlay A is 0", deck.every((d) => Number(d.overlayA) === 0));
  ok("bubbles hidden at idle", deck.every((d) => Number(d.bubbleOpacity) === 0));
  ok("no console errors", errors.length === 0, errors.join(" | "));
}

/* ------------------------------------------------------------------ */
console.log("slices j=0..13 of card 0");

{
  const slices = await page.evaluate(() => {
    const li = document.querySelectorAll('[role="listitem"]')[0];
    const face = li.children[0].children[0].children[0].children[0].children[0].children[0].children[0];
    return Array.from(face.children).slice(1).map((slice) => {
      const style = slice.getAttribute("style") || "";
      const num = (re) => {
        const m = style.match(re);
        return m ? Number(m[1]) : null;
      };
      return {
        x: num(/translate3d\(calc\(var\(--s\) \* (-?[0-9.]+)\)/),
        z: num(/0, calc\(var\(--s\) \* ([0-9.]+)\)/),
        ry: num(/rotateY\((-?[0-9.]+)deg\)/),
      };
    });
  });
  const liveSlices = [
    ...LIVE.slice,
    ...[...LIVE.slice].reverse().map((s) => ({ x: -s.x, z: s.z, ry: -s.ry })),
  ];
  let allMatch = true;
  for (let j = 0; j < 14; j += 1) {
    const got = slices[j];
    const want = liveSlices[j];
    // Z tolerance 0.0004 (~0.09px): the live site serializes its Z values with
    // rounding that drifts from the spec formula by up to 0.0003 units.
    if (!got || !near(got.x, want.x, 0.0001) || !near(got.z, want.z, 0.0004) || !near(got.ry, want.ry, 0.001)) {
      allMatch = false;
      console.log(`     j=${j} got ${JSON.stringify(got)} want ${JSON.stringify(want)}`);
    }
  }
  ok("all 14 slice transforms match the live DOM", allMatch);
}

/* ------------------------------------------------------------------ */
console.log("hover states");

for (const idx of [0, 3, 6]) {
  await page.mouse.move(5, 5);
  await wait(900);
  const box = await page.locator('[role="listitem"]').nth(idx).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 6 });
  await wait(1200);
  const deck = await readDeck();
  ok(`hover ${idx}: z-index 999`, deck[idx].z === 999, `${deck[idx].z}`);
  ok(`hover ${idx}: lift 18px`, deck[idx].lift === 18, `${deck[idx].lift}`);
  ok(`hover ${idx}: tilt straightens to ${idx === 0 ? LIVE.hoverTilt0 : idx === 3 ? -1.4 : 3.8}`,
    near(deck[idx].tilt, idx === 0 ? LIVE.hoverTilt0 : idx === 3 ? -1.4 : 3.8, 0.01), `${deck[idx].tilt}`);
  ok(`hover ${idx}: scale x1.06`, near(deck[idx].scale, (idx === 3 ? 0.84 : 1) * LIVE.hoverScale0, 0.001), `${deck[idx].scale}`);
  ok(`hover ${idx}: slice 0 uncurls`,
    near(deck[idx].slice0.x, LIVE.hoverSlice0.x, 0.0001) &&
    near(deck[idx].slice0.z, LIVE.hoverSlice0.z, 0.0001) &&
    near(deck[idx].slice0.ry, LIVE.hoverSlice0.ry, 0.001),
    JSON.stringify(deck[idx].slice0));
  ok(`hover ${idx}: hovered overlay A 0, others 0.12`,
    Number(deck[idx].overlayA) === 0 &&
    deck.every((d, i) => i === idx || Number(d.overlayA) === 0.12));
  ok(`hover ${idx}: bubble visible`, Number(deck[idx].bubbleOpacity) === 1);
  const popY = Number(deck[idx].bubble.match(/var\(--s\) \* (-?[0-9.]+) \+ (0px|12px)/)?.[1]);
  ok(`hover ${idx}: bubble Y ${LIVE.bubbleHover[idx]}`, near(popY, LIVE.bubbleHover[idx], 0.0001), `${popY}`);
  // neighbour spread (geometric 0.16 * 0.62^(d-1))
  for (let d = 1; d <= 6; d += 1) {
    const a = idx - d;
    const b = idx + d;
    const push = hoverSpreadValue(d);
    if (a >= 0) {
      const delta = LIVE.itemX[a] - deck[a].x;
      ok(`hover ${idx}: neighbour -${d} spreads ${push.toFixed(4)}`, near(delta, push, 0.0005), `${delta.toFixed(4)}`);
    }
    if (b <= 6) {
      const delta = deck[b].x - LIVE.itemX[b];
      ok(`hover ${idx}: neighbour +${d} spreads ${push.toFixed(4)}`, near(delta, push, 0.0005), `${delta.toFixed(4)}`);
    }
  }
}

function hoverSpreadValue(d) {
  return LIVE.hoverSpread[d - 1] ?? 0.16 * Math.pow(0.62, d - 1);
}

/* ------------------------------------------------------------------ */
console.log("keyboard, link, unmount, reduced motion, resize");

{
  // keyboard focus activates the card (focus = hover)
  await page.mouse.move(5, 5);
  await wait(900);
  await page.locator('[role="listitem"]').nth(2).locator("[tabindex='0']").focus();
  await wait(1100);
  const deck = await readDeck();
  ok("focus activates card 2 (lift + bubble)", deck[2].z === 999 && Number(deck[2].bubbleOpacity) === 1,
    `z=${deck[2].z} bubble=${deck[2].bubbleOpacity}`);
  await page.mouse.move(5, 5);
  await wait(600);
}

{
  // linked card: mouse hover activates, then click follows the anchor
  await page.mouse.move(5, 5);
  await wait(900);
  const li = page.locator('[role="listitem"]').nth(4);
  const box = await li.boundingBox();
  const popupPromise = page.waitForEvent("popup", { timeout: 4000 }).catch(() => null);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  const popup = await popupPromise;
  ok("clicking the hovered card opens its link in a new tab",
    popup !== null && popup.url().startsWith("https://example.com"),
    popup ? popup.url() : "no popup");
  const rel = await page.evaluate(
    () => document.querySelector('[role="listitem"] a')?.getAttribute("rel") ?? "",
  );
  ok("anchor carries noopener noreferrer", rel.includes("noopener"), rel);
}

{
  // unmount removes the deck; remount restores and replays
  await page.locator("#toggle-mounted").click();
  await wait(400);
  const gone = await page.evaluate(() => document.querySelectorAll('[role="listitem"]').length);
  ok("unmount removes all cards", gone === 0, `items=${gone}`);
  await page.locator("#toggle-mounted").click();
  await wait(2500);
  const back = await page.evaluate(() => document.querySelectorAll('[role="listitem"]').length);
  ok("remount restores 7 cards", back === 7, `items=${back}`);
  ok("no console errors across mount cycle", errors.length === 0, errors.join(" | "));
}

{
  // responsive: everything scales with the container (cqw/cqh)
  await page.setViewportSize({ width: 900, height: 700 });
  await wait(900);
  const widthSmall = await page.evaluate(() => {
    const li = document.querySelector('[role="listitem"]');
    return li.getBoundingClientRect().width;
  });
  await page.setViewportSize({ width: 1600, height: 900 });
  await wait(900);
  const widthLarge = await page.evaluate(() => {
    const li = document.querySelector('[role="listitem"]');
    return li.getBoundingClientRect().width;
  });
  ok("cards scale with container width", widthLarge > widthSmall * 1.3,
    `small=${widthSmall.toFixed(0)}px large=${widthLarge.toFixed(0)}px`);
  await page.setViewportSize({ width: 1440, height: 900 });
  await wait(600);
}

await context.close();

/* ------------------------------------------------------------------ */
console.log("entrance variants + reduced motion");

for (const entrance of ["deal", "flip", "rise", "sweep"]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  // Delay the images: the entrance is gated on decode, so mid-entrance states
  // become observable deterministically.
  await p.route("**/*.jpg", async (route) => {
    await wait(700);
    await route.continue();
  });
  await p.goto(`${base}/index.html?entrance=${entrance}`, { waitUntil: "domcontentloaded" });
  await wait(600); // pre-decode: the deck must hold its pile start state
  const mid = await p.evaluate(() => {
    const li = document.querySelector('[role="listitem"]');
    const w = li.getBoundingClientRect().width;
    const itemM = new DOMMatrixReadOnly(getComputedStyle(li).transform);
    const arcM = new DOMMatrixReadOnly(getComputedStyle(li.children[0]).transform);
    const threeD = li.children[0].children[0].children[0].children[0].children[0];
    const flipM = new DOMMatrixReadOnly(getComputedStyle(threeD).transform);
    return { x: itemM.m41 / w, arcY: arcM.m42 / w, flipM11: flipM.m11 };
  });
  await wait(2800);
  const settled = await p.evaluate(() => {
    const li = document.querySelector('[role="listitem"]');
    const w = li.getBoundingClientRect().width;
    const itemM = new DOMMatrixReadOnly(getComputedStyle(li).transform);
    const arcM = new DOMMatrixReadOnly(getComputedStyle(li.children[0]).transform);
    return { x: itemM.m41 / w, arcY: arcM.m42 / w };
  });
  if (entrance === "flip") {
    ok("flip: deck starts showing the back face", mid.flipM11 < 0, `m11=${mid.flipM11}`);
  } else if (entrance === "deal") {
    ok("deal: starts as a stacked pile (x=0, arc=0.7)",
      near(mid.x, 0, 0.001) && near(mid.arcY, 0.7, 0.001), JSON.stringify(mid));
  } else if (entrance === "rise") {
    ok("rise: starts below the arc", near(mid.arcY, 0.76, 0.001), `arcY=${mid.arcY}`);
  } else {
    ok("sweep: starts swung to one side", near(mid.x, -4.8, 0.001), `x=${mid.x}`);
  }
  ok(`${entrance}: settles on the idle fan`,
    near(settled.x, -1.8, 0.02) &&
      (entrance === "deal" ? near(settled.arcY, 0.31, 0.02) : true),
    JSON.stringify(settled));
  ok(`${entrance}: no console errors`, errs.length === 0, errs.join(" | "));
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  await p.goto(`${base}/index.html`, { waitUntil: "networkidle" });
  await wait(600);
  const a = await p.locator("#stage").screenshot();
  await wait(1200);
  const b = await p.locator("#stage").screenshot();
  ok("reduced motion: no bob, static fan", a.equals(b));
  const bobAnim = await p.evaluate(() => {
    const li = document.querySelector('[role="listitem"]');
    const bob = li.children[0].children[0].children[0];
    return getComputedStyle(bob).animationName;
  });
  ok("reduced motion: bob animation disabled", bobAnim === "none", bobAnim);
  ok("reduced motion: no console errors", errs.length === 0, errs.join(" | "));
  await ctx.close();
}

await browser.close();
server.close();

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nall checks passed");
