# BlockCraft 🧩

A **web-based visual block coding platform** built on [Blockly](https://developers.google.com/blockly).
Drag blocks onto the canvas, build a program, and instantly see the generated code in two views:

- **JavaScript** — real, valid JS generated from your blocks
- **Robot Commands** — a readable pseudo-code listing of what a robot would do

It's a pure static site (HTML / CSS / JS, no build step) that loads Blockly from a CDN,
so it drops straight onto **GitHub Pages**.

---

## Blocks

| Category  | Blocks |
|-----------|--------|
| **Control**  | `if` · `while` (while/until) · `for` (count with) |
| **Motion**   | turn left · turn right · jump |
| **Action**   | dance · lay down · lower body · higher body · scan front |
| **Variables**| create variable + get/set (built-in) |
| **Math**     | `calc` (basic calculation: + − × ÷ %) · plus Blockly number/arithmetic blocks |
| **Functions**| define / call functions (built-in procedures) |

That covers exactly the requested set:

1. if block · 2. while loop · 3. for loop · 4. turn left/right · 5. function block ·
6. jump · 7. dance · 8. lay · 9. lower body · 10. higher body · 11. scan front ·
12. set variable · 13. basic calculation

---

## Features

- 🎨 Modern dark UI, responsive layout (works on desktop + mobile)
- ⚡ Live code generation on every change (debounced)
- 🔀 Two output views: **JavaScript** and **Robot Commands**
- 💾 **Save / Load** to browser `localStorage`
- ⬇️ **Export** workspace to JSON · ⬆️ **Import** from JSON
- 📋 **Copy** generated code to clipboard
- ♻️ Auto-restores your last session
- 🧭 Zoom / pan / trashcan / grid, rounded `zelos` renderer

---

## Run locally

Because it's a static site, any static file server works. From this folder:

```bash
# Option A: Python
python -m http.server 8080

# Option B: Node (no install needed with npx)
npx http-server . -p 8080 -c-1
```

Then open <http://localhost:8080>.

> Opening `index.html` directly via `file://` may work, but a local server is recommended
> so the CDN scripts and `fetch`-style features behave normally.

---

## Deploy to GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Select the branch (e.g. `main`) and the **`/ (root)`** folder, then **Save**.
5. Your site appears at `https://<username>.github.io/<repo>/`.

No configuration or build step required.

---

## Project structure

```
.
├── index.html          # Page shell + Blockly CDN scripts
├── css/
│   └── style.css       # Layout, theme, responsive styles
├── js/
│   ├── blocks.js       # Toolbox + custom robot block definitions
│   ├── generators.js   # JavaScript + Robot-commands code generators
│   └── main.js         # App bootstrap, workspace, UI, persistence
└── test/               # Headless smoke / UI / deep tests (puppeteer-core)
```

### How the pieces fit

- **`blocks.js`** defines the toolbox categories and the custom blocks
  (`robot_turn_left`, `robot_scan_front`, `robot_math_calc`, …). Built-in
  blocks (`controls_if`, `controls_whileUntil`, `controls_for`, variables,
  procedures, math) come from `blockly.min.js` itself.
- **`generators.js`** registers two `Blockly.Generator`s. The JavaScript one
  reuses Blockly's built-in JS generator (so `if`/`while`/`for`/variables render
  correctly) and only adds handlers for the robot blocks. The Robot one is a
  custom pseudo-code generator with a graceful fallback for any block type.
- **`main.js`** injects the workspace, wires the toolbar (save/load/export/
  import/clear/copy), keeps the code panel in sync, and highlights the output.

---

## Tech

- [Blockly](https://developers.google.com/blockly) 13.x (UMD bundle from unpkg CDN)
- Vanilla JavaScript, no framework, no bundler
- MIT licensed

---

## Notes

This project is **visualization-only** — the blocks don't drive a real robot or
run the generated code. It's built as a coding-platform front end you can extend
later (e.g. hook the generated `robot.*` calls to a simulator).
