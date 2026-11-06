import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = 4194;
const base = `http://127.0.0.1:${port}`;

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
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

async function newPage(params = "", contextOptions = {}) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
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
  await page.waitForFunction(() => Boolean(window.__curved));
  return { context, page, errors };
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const near = (a, b, tolerance) => Math.abs(a - b) <= tolerance;

console.log("golden line table (spec theta0 = 194.07, calibrated 194.0783)");

{
  const { context, page, errors } = await newPage();
  const rows = await page.evaluate(() => {
    const fn = window.__curved.computeLineState;
    return Array.from({ length: 13 }, (_, index) =>
      fn(194.0783, index, {
        count: 14,
        sweepDeg: 260,
        textRotation: 1.15,
        fadeExponent: 1.5,
        minOpacity: 0.06,
        blurAmount: 3,
      }),
    );
  });
  const expected = [
    [-0.2432, -0.97, 190.81, 0.06173],
    [0.0783, -0.9969, -201.83, 0.060057],
    [0.3918, -0.9201, -180.48, 0.067511],
    [0.6644, -0.7474, -159.12, 0.102197],
    [0.8678, -0.4969, -137.76, 0.178608],
    [0.9809, -0.1946, -116.4, 0.300216],
    [0.9918, 0.1279, -95.05, 0.458115],
    [0.8994, 0.4371, -73.69, 0.632575],
    [0.7133, 0.7008, -52.33, 0.797176],
    [0.453, 0.8915, -30.98, 0.924566],
    [0.1455, 0.9894, -9.62, 0.992511],
    [-0.1772, 0.9842, 11.74, 0.988864],
    [-0.4814, 0.8765, 33.1, 0.914281],
  ];
  for (let index = 0; index < expected.length; index += 1) {
    const [y, z, rotateX, opacity] = expected[index];
    const got = rows[index];
    ok(
      `line ${index}: Y/Z`,
      near(got.y, y, 0.00005) && near(got.z, z, 0.00005),
      `${got.y.toFixed(4)}/${got.z.toFixed(4)}`,
    );
    ok(
      `line ${index}: rotateX`,
      near(got.rotateX, rotateX, 0.005),
      `${got.rotateX.toFixed(2)}`,
    );
    ok(
      `line ${index}: opacity`,
      near(got.opacity, opacity, 0.000002),
      `${got.opacity.toFixed(6)}`,
    );
  }
  ok("spec formula aliases", await page.evaluate(() => {
    const fn = window.__curved.computeLineState;
    const a = fn(0, 0, { count: 14, sweepDeg: 260 });
    return Math.abs(a.y) < 1e-12 && Math.abs(a.z - 1) < 1e-12 && Math.abs(a.rotateX) < 1e-12;
  }));
  ok("no console errors on math page", errors.length === 0, errors.join(" | "));
  await context.close();
}

console.log("rendered ring matches live site at p = 0, .25, .5, .75, 1");

const liveTables = {
  0: [
    [-0.9869, -0.1614, 114.18, 0.31524],
    [-0.8841, -0.4673, 135.54, 0.189225],
    [-0.6893, -0.7245, 156.89, 0.108054],
    [-0.4226, -0.9063, 178.25, 0.069531],
    [-0.112, -0.9937, 199.61, 0.0601657],
    [0.2103, -0.9776, -193.04, 0.0611122],
    [0.5108, -0.8597, -171.68, 0.0774604],
    [0.758, -0.6523, -150.32, 0.128142],
    [0.9262, -0.3769, -128.96, 0.223456],
    [0.9981, -0.0623, -107.61, 0.361775],
    [0.9659, 0.2588, -86.25, 0.529383],
    [0.8332, 0.553, -64.89, 0.703176],
    [0.6137, 0.7895, -43.54, 0.855603],
    [0.3303, 0.9439, -22.18, 0.960717],
  ],
  0.25: [
    [-0.1859, -0.9826, 194.68, 0.060765],
    [0.1367, -0.9906, -197.96, 0.0603023],
    [0.4451, -0.8955, -176.61, 0.0712285],
    [0.7071, -0.7071, -155.25, 0.11268],
    [0.8955, -0.4451, -133.89, 0.197381],
    [0.9906, -0.1367, -112.54, 0.326577],
    [0.9826, 0.1859, -91.18, 0.489202],
    [0.8722, 0.4892, -69.82, 0.663945],
    [0.671, 0.7415, -48.46, 0.823763],
    [0.3999, 0.9166, -27.11, 0.941794],
    [0.0872, 0.9962, -5.75, 0.997319],
    [-0.2347, 0.9721, 15.61, 0.980384],
    [-0.532, 0.8467, 36.96, 0.894038],
    [-0.774, 0.6332, 58.32, 0.753645],
  ],
  0.5: [
    [0.8597, -0.5108, -138.82, 0.173729],
    [0.9776, -0.2103, -117.46, 0.293203],
    [0.9937, 0.112, -96.11, 0.44969],
    [0.9063, 0.4226, -74.75, 0.623917],
    [0.7245, 0.6893, -53.39, 0.789671],
    [0.4673, 0.8841, -32.04, 0.919496],
    [0.1614, 0.9869, -10.68, 0.990777],
    [-0.1614, 0.9869, 10.68, 0.990777],
    [-0.4673, 0.8841, 32.04, 0.919496],
    [-0.7245, 0.6893, 53.39, 0.789671],
    [-0.9063, 0.4226, 74.75, 0.623917],
    [-0.9937, 0.112, 96.11, 0.44969],
    [-0.9776, -0.2103, 117.46, 0.293203],
    [-0.8597, -0.5108, 138.82, 0.173729],
  ],
  0.75: [
    [0.774, 0.6332, -58.32, 0.753645],
    [0.532, 0.8467, -36.96, 0.894038],
    [0.2347, 0.9721, -15.61, 0.980384],
    [-0.0872, 0.9962, 5.75, 0.997319],
    [-0.3999, 0.9166, 27.11, 0.941794],
    [-0.671, 0.7415, 48.46, 0.823763],
    [-0.8722, 0.4892, 69.82, 0.663945],
    [-0.9826, 0.1859, 91.18, 0.489202],
    [-0.9906, -0.1367, 112.54, 0.326577],
    [-0.8955, -0.4451, 133.89, 0.197381],
    [-0.7071, -0.7071, 155.25, 0.11268],
    [-0.4451, -0.8955, 176.61, 0.0712285],
    [-0.1367, -0.9906, 197.96, 0.0603023],
    [0.1859, -0.9826, -194.68, 0.060765],
  ],
  1: [
    [-0.3303, 0.9439, 22.18, 0.960717],
    [-0.6137, 0.7895, 43.54, 0.855603],
    [-0.8332, 0.553, 64.89, 0.703176],
    [-0.9659, 0.2588, 86.25, 0.529383],
    [-0.9981, -0.0623, 107.61, 0.361775],
    [-0.9262, -0.3769, 128.96, 0.223456],
    [-0.758, -0.6523, 150.32, 0.128142],
    [-0.5108, -0.8597, 171.68, 0.0774604],
    [-0.2103, -0.9776, 193.04, 0.0611122],
    [0.112, -0.9937, -199.61, 0.0601657],
    [0.4226, -0.9063, -178.25, 0.069531],
    [0.6893, -0.7245, -156.89, 0.108054],
    [0.8841, -0.4673, -135.54, 0.189225],
    [0.9869, -0.1614, -114.18, 0.31524],
  ],
};

{
  const { context, page, errors } = await newPage();
  await wait(1200);
  for (const p of [0, 0.25, 0.5, 0.75, 1]) {
    await page.evaluate((value) => window.__curved.scrollToProgress(value), p);
    await wait(2600);
    const states = await page.evaluate(() => window.__curved.getStates());
    ok(`p=${p}: 14 lines`, states.length === 14, `${states.length}`);
    for (let index = 0; index < 14; index += 1) {
      const [y, z, rotateX, opacity] = liveTables[p][index];
      const state = states[index];
      const match = state.transform.match(
        /\* (-?[\d.]+)\), calc\(var\(--orrery-reach\) \* (-?[\d.]+)\)\) rotateX\((-?[\d.]+)deg/,
      );
      const gotY = match ? Number(match[1]) : NaN;
      const gotZ = match ? Number(match[2]) : NaN;
      const gotRotate = match ? Number(match[3]) : NaN;
      const gotOpacity = Number(state.opacity);
      const tolerance = 0.0006;
      ok(
        `p=${p} line ${index}: Y/Z/rotate/opacity`,
        near(gotY, y, tolerance) &&
          near(gotZ, z, tolerance) &&
          near(gotRotate, rotateX, 0.06) &&
          near(gotOpacity, opacity, 0.0004),
        `${gotY}/${gotZ}/${gotRotate}/${gotOpacity.toFixed(6)}`,
      );
    }
  }
  const texts = await page.evaluate(() =>
    window.__curved.getStates().map((state) => state.text),
  );
  ok(
    "content order",
    texts.join("|") ===
      "Wander|Design On|Horizon|Pulse Mode|Grain|Every Day|Drift|Echo Man|Bloom|Made Simple|Quiet|Bold Ideas|Vivid|Origin",
    texts.join("|"),
  );
  ok("no console errors while scrolling", errors.length === 0, errors.join(" | "));
  await context.close();
}

console.log("spring, direction, mapping and reduced motion");

{
  const { context, page } = await newPage();
  await wait(1200);
  await page.evaluate(() => window.__curved.scrollToProgress(0));
  await wait(2600);
  await page.evaluate(() => window.__curved.scrollToProgress(1));
  const samples = [];
  for (let index = 0; index < 70; index += 1) {
    samples.push(await page.evaluate(() => window.__curved.getStates()[0].y));
    await wait(30);
  }
  const peak = Math.max(...samples);
  const settled = samples.at(-1);
  ok("spring overshoots past the end", peak > 0.985, `peak=${peak.toFixed(4)}`);
  ok("spring settles on front line", near(settled, -0.3303, 0.002), `${settled.toFixed(4)}`);
  await context.close();
}

{
  const { context, page } = await newPage("?direction=reverse");
  await wait(1200);
  await page.evaluate(() => window.__curved.scrollToProgress(0));
  await wait(2600);
  const topStates = await page.evaluate(() => window.__curved.getStates());
  await page.evaluate(() => window.__curved.scrollToProgress(1));
  await wait(2600);
  const bottomStates = await page.evaluate(() => window.__curved.getStates());
  ok(
    "reverse puts Wander at the front at p=0",
    near(topStates[0].y, -0.3303, 0.002) && near(topStates[13].y, 0.9869, 0.002),
    `${topStates[0].y.toFixed(3)}/${topStates[13].y.toFixed(3)}`,
  );
  ok(
    "reverse puts Origin at the front at p=1",
    near(bottomStates[0].y, -0.9869, 0.002) && near(bottomStates[13].y, 0.3303, 0.002),
    `${bottomStates[0].y.toFixed(3)}/${bottomStates[13].y.toFixed(3)}`,
  );
  await context.close();
}

{
  const { context, page } = await newPage("?mapping=spec");
  await wait(1200);
  const top = await page.evaluate(() => {
    window.__curved.scrollToProgress(0);
    return window.__curved.getStates()[0].y;
  });
  ok("spec mapping puts line 0 at the front at p=0", near(top, 0, 1e-9), `${top}`);
  await context.close();
}

{
  const { context, page } = await newPage("", { reducedMotion: "reduce" });
  await wait(900);
  await page.evaluate(() => window.__curved.scrollToProgress(1));
  await wait(80);
  const immediate = await page.evaluate(() => window.__curved.getStates()[0].y);
  ok(
    "reduced motion maps scroll directly",
    near(immediate, -0.3303, 0.002),
    `${immediate.toFixed(4)}`,
  );
  await context.close();
}

console.log("media, caption, responsiveness and input");

{
  const { context, page } = await newPage();
  await wait(1500);
  const media = await page.evaluate(() => {
    const track = document.querySelector("[data-curved-track]");
    const images = Array.from(track.querySelectorAll("img"));
    const videos = Array.from(track.querySelectorAll("video"));
    return {
      images: images.map((image) => image.getAttribute("src")),
      videos: videos.map((video) => ({
        src: video.getAttribute("src"),
        muted: video.muted,
        loop: video.loop,
        playsInline: video.playsInline,
        autoplay: video.autoplay,
        paused: video.paused,
      })),
      imageStyle: images.map((image) => ({
        height: getComputedStyle(image).height,
        width: getComputedStyle(image).width,
        radius: getComputedStyle(image).borderRadius,
        fit: getComputedStyle(image).objectFit,
      })),
    };
  });
  ok("4 inline images", media.images.length === 4, media.images.join(","));
  ok("3 inline videos", media.videos.length === 3, media.videos.length);
  ok(
    "media sources are local",
    [...media.images, ...media.videos.map((video) => video.src)].every(
      (src) => src.startsWith("./assets/") || src.startsWith("/assets/"),
    ),
  );
  ok(
    "videos are muted, looping and inline",
    media.videos.every((video) => video.muted && video.loop && video.playsInline),
  );
  const style = media.imageStyle[0];
  ok(
    "media box is 0.900em x 1.035em with a 10px radius, cover",
    Math.abs(parseFloat(style.height) - 0.9 * 94) < 1 &&
      Math.abs(parseFloat(style.width) - 1.035 * 94) < 1 &&
      style.radius === "10px" &&
      style.fit === "cover",
    JSON.stringify(style),
  );
  ok(
    "front video plays",
    media.videos[2] && media.videos[2].paused === false,
    JSON.stringify(media.videos[2]),
  );

  const caption = await page.evaluate(() => {
    const track = document.querySelector("[data-curved-track]");
    const node = Array.from(track.querySelectorAll("div")).find(
      (element) =>
        element.textContent === "SCROLL SCROLL SCROLL..." &&
        element.children.length === 0,
    );
    const computed = getComputedStyle(node);
    return {
      text: node.textContent,
      fontSize: computed.fontSize,
      letterSpacing: computed.letterSpacing,
      textTransform: computed.textTransform,
      pointerEvents: computed.pointerEvents,
      color: computed.color,
      top: computed.top,
      animationName: computed.animationName,
      opacity: Number(computed.opacity),
    };
  });
  ok(
    "caption copy and typography",
    caption.text === "SCROLL SCROLL SCROLL..." &&
      caption.fontSize === "12px" &&
      caption.textTransform === "uppercase" &&
      caption.pointerEvents === "none",
    JSON.stringify(caption),
  );
  ok(
    "caption pulses",
    caption.animationName === "curved-caption-pulse",
    caption.animationName,
  );

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.keyboard.press("PageDown");
  await wait(400);
  const scrolled = await page.evaluate(() => window.scrollY);
  ok("keyboard scroll advances the track", scrolled > 0, `${scrolled}`);

  await context.close();
}

{
  const { context, page } = await newPage("", { viewport: { width: 390, height: 844 } });
  await wait(1500);
  const mobile = await page.evaluate(() => {
    const track = document.querySelector("[data-curved-track]");
    const ring = track.querySelector("[data-curved-ring]");
    const widest = Array.from(ring.children)
      .map((line) => {
        const rect = line.firstElementChild.getBoundingClientRect();
        return { text: line.innerText.replace(/\n/g, " "), width: rect.width };
      })
      .sort((a, b) => b.width - a.width)[0];
    return {
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      widest,
      fontSize: getComputedStyle(ring.children[11]).fontSize,
    };
  });
  ok(
    "widest line fits at 390px",
    mobile.widest.width <= mobile.innerWidth && mobile.scrollWidth <= mobile.innerWidth,
    `${mobile.widest.text} ${mobile.widest.width.toFixed(1)} <= ${mobile.innerWidth}`,
  );
  ok("mobile font matches live", mobile.fontSize === "33.345px", mobile.fontSize);
  await context.close();
}

await browser.close();
server.close();

console.log(failures === 0 ? "\nall checks passed" : `\n${failures} check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
