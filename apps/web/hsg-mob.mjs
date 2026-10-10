import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const errs = [];
page.on('pageerror', e => errs.push(e.message));
await page.goto('http://localhost:3000/docs/components/horizontal-scroll-gallery', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await page.screenshot({ path: '/tmp/hsg-mob-top.png' });
const ox = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
console.log('h-overflow:', ox);
// scroll through pinned region
for (let i = 0; i < 5; i++) { await page.evaluate(() => window.scrollBy(0, 500)); await page.waitForTimeout(700); }
await page.screenshot({ path: '/tmp/hsg-mob-mid.png' });
const trackX = await page.evaluate(() => {
  const sec = document.querySelector('[data-docs-layout] section[aria-label="Horizontal scroll gallery"]');
  const track = sec?.querySelector('div.w-max');
  return track ? track.style.transform : 'NOPE';
});
console.log('track:', trackX);
console.log('errs:', errs.filter(e => e !== "Unexpected token '}'"));
await browser.close();
