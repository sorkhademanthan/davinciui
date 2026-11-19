import { chromium } from 'playwright';
const slugs = 'button gsap-text wave-bars-loader circle-cursor hover-transition fluid-particle-text label aspect-ratio cinematic-panel-preloader silk-aurora chart message-scroller skeleton accordion'.split(' ');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
for (const slug of slugs) {
  try {
    const r = await page.goto(`http://localhost:3000/docs/components/${slug}`, { waitUntil: 'networkidle', timeout: 40000 });
    await page.waitForTimeout(1500);
    const m = await page.evaluate(() => ({
      shell: !!document.querySelector('[data-docs-layout]'),
      url: location.pathname,
    }));
    console.log(`${slug} HTTP${r.status()} shell=${m.shell} url=${m.url}`);
  } catch (e) { console.log(`${slug} FAIL:${e.message.slice(0,70)}`); }
}
await browser.close();
