const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 }, colorScheme: "dark" });
  const page = await context.newPage();
  page.on("pageerror", (err) => console.log(`[pageerror] ${String(err)}`.slice(0, 200)));
  await page.goto("http://localhost:3000/experience/components?tab=Text+Animations", { waitUntil: "networkidle" });
  for (const t of [2, 6, 10]) {
    await page.waitForTimeout(t === 2 ? 2000 : 4000);
    for (const name of ["Rolling Text", "Random Text Reveal"]) {
      const title = page.locator("h3", { hasText: name }).first();
      await title.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      const card = title.locator("xpath=ancestor::*[contains(@class,'rounded-2xl')][1]");
      const fname = `/tmp/${name.replace(/ /g, "-").toLowerCase()}-t${t}.png`;
      await card.screenshot({ path: fname, type: "png" });
      console.log("saved", fname);
    }
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
