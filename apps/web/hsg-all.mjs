import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errs = [];
page.on('pageerror', e => errs.push(e.message));
for (const [name, url] of [
  ['docs', 'http://localhost:3000/docs/components/horizontal-scroll-gallery'],
  ['exp', 'http://localhost:3000/experience/components/horizontal-scroll-gallery'],
  ['demo', 'http://localhost:3000/demo/horizontal-scroll-gallery'],
]) {
  await page.goto(url, { waitUntil: 'domcontentloaded' }).catch(()=>{});
  await page.waitForTimeout(5000);
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `/tmp/hsg-${name}.png` });
  const info = await page.evaluate(() => ({
    galleries: document.querySelectorAll('section[aria-label="Horizontal scroll gallery"]').length,
    trackXforms: Array.from(document.querySelectorAll('section[aria-label="Horizontal scroll gallery"] div.w-max')).map(t => t.style.transform || 'none'),
  }));
  console.log(name, JSON.stringify(info));
}
console.log('errs:', errs.filter(e => e !== "Unexpected token '}'"));
await browser.close();
