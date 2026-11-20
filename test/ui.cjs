// UI test: drive the real page ??click every toolbox category, confirm blocks
// appear in the flyout, check the live code panel, and switch to Robot tab.
const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..');
const CHROME =
  process.env.CHROME_PATH ||
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

function serve() {
  return new Promise((resolve) => {
    const s = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p === '/') p = '/index.html';
      fs.readFile(path.join(ROOT, p), (err, data) => {
        if (err) { res.writeHead(404); res.end('x'); return; }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'text/plain' });
        res.end(data);
      });
    });
    s.listen(0, () => resolve(s));
  });
}

(async () => {
  const server = await serve();
  const url = `http://localhost:${server.address().port}/index.html`;
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new', args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1000));

  // Category labels rendered in the toolbox column.
  const catLabels = await page.$$eval('.blocklyToolboxCategoryLabel, .blocklyTreeLabel', (els) =>
    els.map((e) => e.textContent.trim())
  );

  // Click each category and count flyout blocks.
  const flyoutCounts = {};
  const cats = await page.$$('.blocklyToolboxCategory');
  for (let i = 0; i < cats.length; i++) {
    const label = catLabels[i];
    await cats[i].click();
    await new Promise((r) => setTimeout(r, 250));
    const count = await page.evaluate(() => { const b = document.querySelectorAll('.blocklyFlyout .blocklyDraggable').length; const btn = document.querySelectorAll('.blocklyFlyoutButton, .blocklyButton').length; return b + btn; });
    flyoutCounts[label] = count;
  }

  // Live code panel (default JS tab) should contain the seed example.
  const jsText = await page.$eval('#output', (el) => el.innerText);

  // Switch to Robot tab.
  await page.click('.tab[data-tab="robot"]');
  await new Promise((r) => setTimeout(r, 300));
  const robotText = await page.$eval('#output', (el) => el.innerText);

  await browser.close();
  server.close();

  console.log('categories:', catLabels);
  console.log('flyout counts:', flyoutCounts);
  console.log('live JS panel:', JSON.stringify(jsText.slice(0, 120)));
  console.log('live Robot panel:', JSON.stringify(robotText.slice(0, 120)));
  console.log('errors:', errors.length ? errors : '(none)');

  const allCatsHaveBlocks = Object.values(flyoutCounts).every((c) => c > 0);
  const ok =
    allCatsHaveBlocks &&
    /robot\.turnLeft/.test(jsText) &&
    /TURN LEFT/.test(robotText) &&
    errors.length === 0;
  process.exit(ok ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });

