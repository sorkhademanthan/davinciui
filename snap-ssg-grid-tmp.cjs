const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 }, colorScheme: "dark" });
  const page = await context.newPage();
  await page.goto("http://localhost:3000/experience/components?tab=Premium+Components", { waitUntil: "networkidle" });
  await page.waitForTimeout(5000);
  const title = page.locator("h3", { hasText: "Scroll Sync Gallery" }).first();
  await title.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  // The card root is a few ancestors up (group relative flex flex-col rounded-2xl)
  const card = title.locator("xpath=ancestor::*[contains(@class,'rounded-2xl')][1]");
  await card.screenshot({ path: "/tmp/ssg-card.png", type: "png" });
  console.log("saved /tmp/ssg-card.png");
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
