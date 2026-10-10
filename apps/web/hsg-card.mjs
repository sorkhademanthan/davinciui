import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto('http://localhost:3000/experience/components?tab=Galleries', { waitUntil: 'domcontentloaded' }).catch(()=>{});
await page.waitForTimeout(5000);
await page.screenshot({ path: '/tmp/hsg-gallery.png' });
// find horizontal card link
const hrefs = await page.evaluate(() => Array.from(document.querySelectorAll('a')).map(a=>a.getAttribute('href')).filter(h=>h&&h.includes('horizontal')));
console.log('h-links:', JSON.stringify(hrefs.slice(0,4)));
await browser.close();
