import { chromium } from 'playwright';
import fs from 'node:fs';
const slugs = fs.readFileSync('/tmp/slugs.txt', 'utf8').trim().split(/\s+/);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const out = [];
for (const slug of slugs) {
  try {
    const errs = [];
    const onErr = e => errs.push(e.message.slice(0,90));
    page.on('pageerror', onErr);
    const r = await page.goto(`http://localhost:3000/docs/components/${slug}`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1200);
    const m = await page.evaluate(() => ({
      shell: !!document.querySelector('[data-docs-layout]'),
      url: location.pathname,
      preview: !!document.querySelector('[data-docs-layout] [aria-label="Preview controls"]'),
      install: document.body.innerText.includes('pnpm dlx shadcn@latest add @davinciui/'),
    }));
    page.removeAllListeners('pageerror');
    const flags = [];
    if (m.url !== `/docs/components/${slug}`) flags.push('redirect->' + m.url);
    else {
      if (!m.shell) flags.push('no-shell');
      if (!m.preview) flags.push('no-preview');
      if (!m.install) flags.push('no-install-cmd');
    }
    const pe = [...new Set(errs)].filter(e => e !== "Unexpected token '}'");
    if (pe.length) flags.push('pageerror:' + pe[0]);
    out.push(`${slug} ${flags.length ? flags.join(',') : 'OK'}`);
  } catch (e) { out.push(`${slug} FAIL:${String(e).slice(0,70)}`); }
  if (out.length % 20 === 0) { fs.writeFileSync('/tmp/audit-live.txt', out.join('\n')); console.log('progress', out.length); }
}
fs.writeFileSync('/tmp/audit-live.txt', out.join('\n'));
console.log('done:', out.length);
await browser.close();
