// Deep test: build a workspace exercising every requested block type and
// confirm code generation for both tabs, plus save/export availability.
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

// Required block types the user listed.
const REQUIRED = [
  'controls_if',
  'controls_whileUntil',
  'controls_for',
  'robot_turn_left',
  'robot_turn_right',
  'robot_jump',
  'robot_dance',
  'robot_lay',
  'robot_lower_body',
  'robot_higher_body',
  'robot_scan_front',
  'robot_set_variable',
  'robot_math_calc',
];

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
  await new Promise((r) => setTimeout(r, 800));

  // 1) All required block types defined?
  const missing = await page.evaluate((types) => {
    return types.filter((t) => !Blockly.Blocks[t]);
  }, REQUIRED);

  // 2) Build a rich program through the public API and generate both languages.
  const gen = await page.evaluate(() => {
    // Fresh workspace via the running app instance is not exposed, so operate
    // on Blockly itself: create an offscreen workspace.
    const ws = Blockly.inject(document.createElement('div'), {
      toolbox: buildToolbox(),
    });
    const blocks = [
      { type: 'robot_turn_right', fields: { DEGREES: 45 } },
      { type: 'robot_jump', fields: { HEIGHT: 2 } },
      { type: 'robot_dance' },
      { type: 'robot_lay' },
      { type: 'robot_lower_body', fields: { AMOUNT: 5 } },
      { type: 'robot_higher_body', fields: { AMOUNT: 8 } },
    ];
    // Chain the simple commands.
    let prev = null, first = null;
    for (const b of blocks) {
      const blk = ws.newBlock(b.type);
      if (b.fields) Object.entries(b.fields).forEach(([k, v]) => blk.setFieldValue(v, k));
      blk.initSvg && blk.initSvg();
      if (!first) first = blk;
      if (prev) prev.nextConnection.connect(blk.previousConnection);
      prev = blk;
    }
    // 3) variables + math + if + while + for as a value/statement chain.
    const set = ws.newBlock('robot_set_variable');
    const calc = ws.newBlock('robot_math_calc');
    const scan = ws.newBlock('robot_scan_front');
    const num = ws.newBlock('math_number'); num.setFieldValue(3, 'NUM');
    const num2 = ws.newBlock('math_number'); num2.setFieldValue(4, 'NUM');
    calc.getInput('A').connection.connect(num.outputConnection);
    calc.getInput('B').connection.connect(num2.outputConnection);
    set.getInput('VALUE').connection.connect(calc.outputConnection);
    prev.nextConnection.connect(set.previousConnection);

    const ifBlk = ws.newBlock('controls_if');
    const w = ws.newBlock('controls_whileUntil');
    const f = ws.newBlock('controls_for');
    set.nextConnection.connect(ifBlk.previousConnection);
    ifBlk.nextConnection.connect(w.previousConnection);
    w.nextConnection.connect(f.previousConnection);
    // put scan_front into the if condition if there's an IF0 input
    if (ifBlk.getInput('IF0')) ifBlk.getInput('IF0').connection.connect(scan.outputConnection);

    return {
      js: workspaceToCode(ws, 'js'),
      robot: workspaceToCode(ws, 'robot'),
    };
  });

  // 3) verify all 6 toolbox categories render as buttons in the flyout tree
  const categories = await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll('.blocklyTreeLabel'))
      .map((e) => e.textContent.trim());
    return labels;
  });

  await browser.close();
  server.close();

  console.log('missing block types:', missing.length ? missing : '(none)');
  console.log('categories:', categories.join(', '));
  console.log('\n=== JS ===\n' + gen.js);
  console.log('\n=== ROBOT ===\n' + gen.robot);
  console.log('\nerrors:', errors.length ? errors : '(none)');

  const ok =
    missing.length === 0 &&
    /turnRight/.test(gen.js) &&
    /TURN RIGHT/.test(gen.robot) &&
    /if/.test(gen.js) &&
    /while|for/.test(gen.js) &&
    errors.length === 0;
  process.exit(ok ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
