// Headless smoke test: loads index.html and checks that Blockly boots,
// blocks render, and code generation produces output without errors.
const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..');
const CHROME =
  process.env.CHROME_PATH ||
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
};

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p === '/') p = '/index.html';
      const file = path.join(ROOT, p);
      fs.readFile(file, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'text/plain' });
        res.end(data);
      });
    });
    server.listen(0, () => resolve(server));
  });
}

(async () => {
  const server = await serve();
  const port = server.address().port;
  const url = `http://localhost:${port}/index.html`;

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('console.error: ' + m.text());
  });

  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  // Give Blockly a moment to inject + render.
  await new Promise((r) => setTimeout(r, 1500));

  const result = await page.evaluate(() => {
    const svg = document.querySelector('#blockly-div svg');
    const blocks = document.querySelectorAll('.blocklyDraggable').length;
    const output = document.getElementById('output').innerText;
    return {
      hasSvg: !!svg,
      blockCount: blocks,
      outputSnippet: output.slice(0, 200),
    };
  });

  await browser.close();
  server.close();

  console.log('--- RESULT ---');
  console.log(JSON.stringify(result, null, 2));
  console.log('--- ERRORS ---');
  console.log(errors.length ? errors.join('\n') : '(none)');

  const ok =
    result.hasSvg &&
    result.blockCount > 0 &&
    /turnLeft|TURN LEFT|robot\./.test(result.outputSnippet) &&
    errors.length === 0;
  process.exit(ok ? 0 : 1);
})().catch((e) => {
  console.error(e);
  process.exit(2);
});
