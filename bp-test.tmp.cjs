const { chromium } = require('playwright');

async function shellPixels(page, box) {
  const buf = await page.screenshot({ clip: box });
  return page.evaluate(async ({ b64 }) => {
    const res = await fetch('data:image/png;base64,' + b64);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const img = new Image();
    await new Promise((res2, rej) => { img.onload = res2; img.onerror = rej; img.src = url; });
    const cv = document.createElement('canvas');
    cv.width = img.width; cv.height = img.height;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, img.width, img.height).data;
    URL.revokeObjectURL(url);
    let dark = 0, lit = 0, sum = 0, sum2 = 0, n = 0;
    for (let i = 0; i < d.length; i += 16) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      sum += lum; sum2 += lum * lum; n++;
      if (lum < 24) dark++;
      if (lum > 90) lit++;
    }
    const mean = sum / n;
    return { darkFrac: dark / n, litFrac: lit / n, std: Math.sqrt(sum2 / n - mean * mean) };
  }, { b64: buf.toString('base64') });
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + String(e).slice(0, 200)));
  await page.goto('http://localhost:3000/experience/components/burn-plus', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => !!document.querySelector('[data-docs-preview-shell] [data-slot="burn-plus"] canvas'), null, { timeout: 120000 });
  await page.waitForTimeout(1500);

  const stage = page.locator('[data-docs-preview-shell] [data-slot="burn-plus"]').first();
  const box = await stage.boundingBox();
  console.log('stage box:', JSON.stringify({ w: Math.round(box.width), h: Math.round(box.height) }));
  console.log('a11y:', JSON.stringify(await stage.evaluate((el) => ({
    role: el.getAttribute('role'), aria: el.getAttribute('aria-label'),
    canvasHidden: el.querySelector('canvas')?.getAttribute('aria-hidden'),
  }))));
  console.log('initial progress:', await stage.getAttribute('data-progress'));

  // rest state (burn start=0 → hidden/black)
  console.log('rest pixels:', JSON.stringify(await shellPixels(page, box)));

  // hover → scrub to full
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 5 });
  await page.waitForFunction(() => {
    const el = document.querySelector('[data-docs-preview-shell] [data-slot="burn-plus"]');
    return el && parseFloat(el.getAttribute('data-progress') || '0') > 0.45;
  }, null, { timeout: 10000 });
  console.log('mid pixels:', JSON.stringify(await shellPixels(page, box)));
  await page.waitForFunction(() => {
    const el = document.querySelector('[data-docs-preview-shell] [data-slot="burn-plus"]');
    return el && parseFloat(el.getAttribute('data-progress') || '0') >= 0.999;
  }, null, { timeout: 10000 });
  console.log('full pixels:', JSON.stringify(await shellPixels(page, box)));

  // leave → reverse
  await page.mouse.move(40, 780);
  await page.waitForTimeout(2500);
  console.log('after-leave progress:', await stage.getAttribute('data-progress'));
  console.log('pageerrors:', errors.length ? errors : 'none');
  await browser.close();
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
