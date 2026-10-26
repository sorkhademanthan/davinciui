import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";

const BASE_URL =
  process.env.TILT_FLIP_POLAROID_URL ??
  "http://localhost:3000/demo/tilt-flip-polaroid";

let browser;

before(async () => {
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
});

async function openStory(story, contextOptions = {}) {
  const context = await browser.newContext({
    viewport: { width: 1455, height: 749 },
    colorScheme: "light",
    ...contextOptions,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error));
  await page.goto(`${BASE_URL}?story=${story}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  return { context, page, errors };
}

const cardSelector = '[data-slot="tilt-flip-polaroid"]';

async function readTilt(page) {
  return page.locator("[data-tfp-tilt]").evaluate((node) => ({
    x: Number(node.dataset.tiltX),
    y: Number(node.dataset.tiltY),
  }));
}

async function dispatchPointer(page, type, x, y) {
  await page.locator(cardSelector).evaluate(
    (node, event) => {
      node.dispatchEvent(
        new PointerEvent(event.type, {
          bubbles: true,
          cancelable: true,
          clientX: event.x,
          clientY: event.y,
          pointerType: "mouse",
          pointerId: 1,
          isPrimary: true,
        }),
      );
    },
    { type, x, y },
  );
}

test("layout matches the reference at 1455 x 749", async () => {
  const { context, page, errors } = await openStory("default");
  try {
    await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      document.documentElement.style.colorScheme = "light";
    });
    await page.waitForTimeout(400);

    const stageBackground = await page
      .locator("main")
      .evaluate((node) => getComputedStyle(node).backgroundColor);
    assert.equal(stageBackground, "rgb(250, 250, 250)");

    const card = page.locator(cardSelector);
    const cardBox = await card.boundingBox();
    assert.ok(cardBox);
    assert.equal(Math.round(cardBox.width), 396);
    assert.equal(Math.round(cardBox.height), 443);
    assert.ok(Math.abs(cardBox.x + cardBox.width / 2 - 727.5) < 1);
    assert.ok(Math.abs(cardBox.y + cardBox.height / 2 - 374.5) < 1);

    const photoBox = await page.locator("[data-tfp-photo]").boundingBox();
    assert.ok(photoBox);
    assert.equal(Math.round(photoBox.width), 372);
    assert.equal(Math.round(photoBox.height), 367);
    assert.equal(Math.round(photoBox.x - cardBox.x), 12);
    assert.equal(Math.round(photoBox.y - cardBox.y), 12);

    const date = page.locator("[data-tfp-date]");
    assert.equal((await date.textContent())?.trim(), "11/07/24");
    const dateStyle = await date.evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        textAlign: style.textAlign,
      };
    });
    assert.match(dateStyle.fontFamily, /Caveat/);
    assert.equal(dateStyle.fontSize, "20px");
    assert.equal(dateStyle.textAlign, "center");

    const shadow = await card
      .locator('[data-face="front"]')
      .evaluate((node) => getComputedStyle(node).boxShadow);
    assert.match(shadow, /rgba\(80, 40, 50, 0\.22\)/);

    assert.equal(await page.getByText("Made in Framer").count(), 0);
    assert.equal(await page.locator("main button").count(), 0);
    assert.equal(errors.length, 0);
  } finally {
    await context.close();
  }
});

test("dark theme adapts the stage, card, and ink", async () => {
  const { context, page, errors } = await openStory("default", {
    colorScheme: "dark",
  });
  try {
    const stageBackground = await page
      .locator("main")
      .evaluate((node) => getComputedStyle(node).backgroundColor);
    assert.equal(stageBackground, "rgb(10, 10, 11)");

    const front = page.locator('[data-face="front"]');
    assert.equal(
      await front.evaluate((node) => getComputedStyle(node).backgroundColor),
      "rgb(31, 29, 30)",
    );
    assert.equal(
      await page
        .locator("[data-tfp-date]")
        .evaluate((node) => getComputedStyle(node).color),
      "rgb(242, 233, 228)",
    );
    assert.equal(errors.length, 0);
  } finally {
    await context.close();
  }
});

test("click toggles uncontrolled state and hidden faces", async () => {
  const { context, page, errors } = await openStory("default");
  try {
    const card = page.locator(cardSelector);
    const front = page.locator('[data-face="front"]');
    const back = page.locator('[data-face="back"]');

    assert.equal(await card.getAttribute("aria-pressed"), "false");
    assert.equal(await front.getAttribute("aria-hidden"), "false");
    assert.equal(await back.getAttribute("aria-hidden"), "true");

    await card.click();
    await page.waitForFunction(
      (selector) =>
        document.querySelector(selector)?.getAttribute("aria-pressed") ===
        "true",
      cardSelector,
    );
    assert.equal(await front.getAttribute("aria-hidden"), "true");
    assert.equal(await back.getAttribute("aria-hidden"), "false");
    assert.match(
      (await back.locator("[data-tfp-back-text]").textContent()) ?? "",
      /the quiet all the way home/,
    );

    await card.click();
    await page.waitForFunction(
      (selector) =>
        document.querySelector(selector)?.getAttribute("aria-pressed") ===
        "false",
      cardSelector,
    );
    assert.equal(await front.getAttribute("aria-hidden"), "false");
    assert.equal(await back.getAttribute("aria-hidden"), "true");
    assert.equal(errors.length, 0);
  } finally {
    await context.close();
  }
});

test("controlled mode follows the prop while reporting requests", async () => {
  const { context, page, errors } = await openStory("controlled");
  try {
    const card = page.locator(cardSelector);
    const request = page.locator("[data-tfp-last-request]");

    assert.equal(await card.getAttribute("aria-pressed"), "false");
    await card.click();
    assert.equal(await card.getAttribute("aria-pressed"), "false");
    assert.equal(await request.getAttribute("data-tfp-last-request"), "true");

    await page.getByRole("button", { name: "Set flipped" }).click();
    assert.equal(await card.getAttribute("aria-pressed"), "true");

    await page.getByRole("button", { name: "Set front" }).click();
    assert.equal(await card.getAttribute("aria-pressed"), "false");
    assert.equal(errors.length, 0);
  } finally {
    await context.close();
  }
});

test("Space and Enter flip the focused card", async () => {
  const { context, page, errors } = await openStory("default");
  try {
    const card = page.locator(cardSelector);
    await card.focus();
    await page.keyboard.press("Space");
    await page.waitForFunction(
      (selector) =>
        document.querySelector(selector)?.getAttribute("aria-pressed") ===
        "true",
      cardSelector,
    );
    assert.equal(await card.getAttribute("aria-pressed"), "true");

    await page.keyboard.press("Enter");
    await page.waitForFunction(
      (selector) =>
        document.querySelector(selector)?.getAttribute("aria-pressed") ===
        "false",
      cardSelector,
    );
    assert.equal(await card.getAttribute("aria-pressed"), "false");
    assert.equal(errors.length, 0);
  } finally {
    await context.close();
  }
});

test("tilt signs, saturation, and reset match the mapping", async () => {
  const { context, page, errors } = await openStory("default");
  try {
    const card = page.locator(cardSelector);
    const box = await card.boundingBox();
    assert.ok(box);

    await dispatchPointer(
      page,
      "pointermove",
      box.x + box.width - 2,
      box.y + 2,
    );
    let tilt = await readTilt(page);
    assert.ok(tilt.x > 0, `top-right tilt.x ${tilt.x}`);
    assert.ok(tilt.y > 0, `top-right tilt.y ${tilt.y}`);
    assert.ok(Math.abs(tilt.x) > 13 && Math.abs(tilt.x) <= 15);

    await dispatchPointer(page, "pointermove", box.x + 2, box.y + 2);
    tilt = await readTilt(page);
    assert.ok(tilt.x > 0);
    assert.ok(tilt.y < 0);

    await dispatchPointer(
      page,
      "pointermove",
      box.x + 2,
      box.y + box.height - 2,
    );
    tilt = await readTilt(page);
    assert.ok(tilt.x < 0);
    assert.ok(tilt.y < 0);

    await dispatchPointer(
      page,
      "pointermove",
      box.x + box.width + 400,
      box.y + box.height + 400,
    );
    tilt = await readTilt(page);
    assert.equal(tilt.x, -15);
    assert.equal(tilt.y, 15);

    await dispatchPointer(page, "pointerout", box.x, box.y);
    tilt = await readTilt(page);
    assert.equal(tilt.x, 0);
    assert.equal(tilt.y, 0);
    assert.equal(errors.length, 0);
  } finally {
    await context.close();
  }
});

test("no-tilt story keeps the card flat but still flips", async () => {
  const { context, page, errors } = await openStory("notilt");
  try {
    const card = page.locator(cardSelector);
    const box = await card.boundingBox();
    assert.ok(box);
    assert.equal(await card.getAttribute("data-tilt-active"), "false");

    await dispatchPointer(
      page,
      "pointermove",
      box.x + box.width - 2,
      box.y + 2,
    );
    const tilt = await readTilt(page);
    assert.equal(tilt.x, 0);
    assert.equal(tilt.y, 0);

    await card.click();
    assert.equal(await card.getAttribute("aria-pressed"), "true");
    assert.equal(errors.length, 0);
  } finally {
    await context.close();
  }
});

test("flipped and long-back stories render their starting state", async () => {
  const flipped = await openStory("flipped");
  try {
    assert.equal(
      await flipped.page.locator(cardSelector).getAttribute("aria-pressed"),
      "true",
    );
  } finally {
    await flipped.context.close();
  }

  const long = await openStory("long");
  try {
    const card = long.page.locator(cardSelector);
    await card.click();
    const text = long.page.locator("[data-tfp-back-text]");
    assert.match((await text.textContent()) ?? "", /find this day again/);
    const textBox = await text.boundingBox();
    const cardBox = await card.boundingBox();
    assert.ok(textBox && cardBox);
    assert.ok(textBox.y >= cardBox.y);
    assert.ok(textBox.y + textBox.height <= cardBox.y + cardBox.height);
  } finally {
    await long.context.close();
  }
});

test("rapid clicks reverse without leaving a stuck state", async () => {
  const { context, page, errors } = await openStory("default");
  try {
    const card = page.locator(cardSelector);
    for (let index = 0; index < 2; index += 1) {
      await card.click();
      await page.waitForTimeout(200);
    }
    assert.equal(await card.getAttribute("aria-pressed"), "false");
    await page.waitForTimeout(400);
    assert.equal(await card.getAttribute("aria-pressed"), "false");
    assert.equal(errors.length, 0);
  } finally {
    await context.close();
  }
});

test("reduced motion disables tilt and crossfades the flip", async () => {
  const { context, page, errors } = await openStory("default", {
    reducedMotion: "reduce",
  });
  try {
    const card = page.locator(cardSelector);
    const box = await card.boundingBox();
    assert.ok(box);
    assert.equal(await card.getAttribute("data-reduced"), "true");
    assert.equal(await card.getAttribute("data-tilt-active"), "false");

    await dispatchPointer(
      page,
      "pointermove",
      box.x + box.width - 2,
      box.y + 2,
    );
    const tilt = await readTilt(page);
    assert.equal(tilt.x, 0);
    assert.equal(tilt.y, 0);

    const transition = await page
      .locator('[data-face="back"]')
      .evaluate((node) => getComputedStyle(node).transition);
    assert.match(transition, /opacity 0\.15s linear/);
    const backTransform = await page
      .locator('[data-face="back"]')
      .evaluate((node) => getComputedStyle(node).transform);
    assert.equal(backTransform, "none");

    await card.click();
    assert.equal(await card.getAttribute("aria-pressed"), "true");
    assert.equal(
      await page.locator('[data-face="back"]').getAttribute("aria-hidden"),
      "false",
    );
    assert.equal(
      await page
        .locator("[data-tfp-flip]")
        .evaluate((node) => getComputedStyle(node).transform),
      "none",
    );
    assert.equal(errors.length, 0);
  } finally {
    await context.close();
  }
});

test("coarse pointers disable tilt and tap still flips", async () => {
  const { context, page, errors } = await openStory("default", {
    hasTouch: true,
    isMobile: true,
  });
  try {
    const card = page.locator(cardSelector);
    assert.equal(await card.getAttribute("data-tilt-active"), "false");
    await card.tap();
    assert.equal(await card.getAttribute("aria-pressed"), "true");
    assert.equal(errors.length, 0);
  } finally {
    await context.close();
  }
});

test("gallery card autoplays, tilts, and flips without navigating", async () => {
  const context = await browser.newContext({
    viewport: { width: 1455, height: 900 },
    colorScheme: "light",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error));

  try {
    await page.goto(`${new URL(BASE_URL).origin}/experience/components`, {
      waitUntil: "domcontentloaded",
    });

    const link = page.locator(
      'a.group[href="/experience/components/tilt-flip-polaroid"]',
    );
    await link.scrollIntoViewIfNeeded();
    const card = link.locator(cardSelector);
    await card.waitFor();
    await page.waitForTimeout(600);

    const initialFlip = await card.getAttribute("aria-pressed");
    await page.waitForTimeout(4300);
    assert.notEqual(
      await card.getAttribute("aria-pressed"),
      initialFlip,
      "card should flip on its own",
    );

    const box = await card.boundingBox();
    assert.ok(box);
    await page.mouse.move(box.x + box.width * 0.75, box.y + box.height * 0.25, {
      steps: 6,
    });
    await page.waitForTimeout(300);

    const tilt = await card.locator("[data-tfp-tilt]").evaluate((node) => ({
      x: Number(node.dataset.tiltX),
      y: Number(node.dataset.tiltY),
    }));
    assert.ok(tilt.x > 0, `hover tilt.x ${tilt.x}`);
    assert.ok(tilt.y > 0, `hover tilt.y ${tilt.y}`);

    const beforeClick = await card.getAttribute("aria-pressed");
    await card.click({
      position: { x: box.width / 2, y: box.height / 2 },
    });
    await page.waitForTimeout(400);
    const afterClick = await card.getAttribute("aria-pressed");
    assert.notEqual(afterClick, beforeClick, "card should flip when clicked");
    assert.equal(new URL(page.url()).pathname, "/experience/components");

    await page.mouse.move(20, 20);
    await page.waitForTimeout(6000);
    assert.notEqual(
      await card.getAttribute("aria-pressed"),
      afterClick,
      "autoplay should resume after the pointer leaves",
    );
    assert.equal(errors.length, 0);
  } finally {
    await context.close();
  }
});
