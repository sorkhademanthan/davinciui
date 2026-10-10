import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto('http://localhost:3000/docs/components/horizontal-scroll-gallery', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(12000);
const d = await page.evaluate(() => {
  const sec = document.querySelector('[data-docs-layout] section[aria-label="Horizontal scroll gallery"]');
  const imgs = sec ? Array.from(sec.querySelectorAll('img')).map(i => ({ done: i.complete, w: i.naturalWidth })) : [];
  const figs = sec ? sec.querySelectorAll('figure').length : 0;
  return { figs, imgs };
});
console.log(JSON.stringify(d));
await page.screenshot({ path: '/tmp/hsg-top.png' });
await browser.close();
