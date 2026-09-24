const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1400, height: 800 }, colorScheme: "dark" });
  await context.addInitScript(() => { try { window.localStorage.setItem("theme", "dark"); } catch {} });
  const page = await context.newPage();
  const bad = [];
  page.on("response", (res) => { if (res.status() >= 400) bad.push(`${res.status()} ${res.url().slice(0, 120)}`); });
  page.on("pageerror", (err) => console.log(`[pageerror] ${String(err)}`.slice(0, 200)));
  await page.goto("http://localhost:3000/demo/scroll-sync-gallery", { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  const h = await page.evaluate(() => document.body.scrollHeight);
  await page.evaluate((hh) => window.scrollTo(0, hh * 0.5), h);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "/tmp/ssg-mid.png", type: "png" });
  console.log("bad responses:", bad.length ? bad : "none");
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
