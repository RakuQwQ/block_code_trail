/* ==========================================================================
   main.js  —  App bootstrap, workspace, UI wiring, persistence, highlighting
   ========================================================================== */
(function () {
  'use strict';

  const STORAGE_KEY = 'blockcraft_workspace_v1';

  let workspace = null;
  let currentLang = 'js';
  let updateTimer = null;

  /* ------------------------------------------------------------------ */
  /* Boot                                                               */
  /* ------------------------------------------------------------------ */
    function boot() {
    // Inject Blockly into its container.
    workspace = Blockly.inject('blockly-div', {
      toolbox: buildToolbox(),
      renderer: 'zelos', // rounded, modern look; try 'geras' or 'thrasos' too
      theme: Blockly.Themes && Blockly.Themes.Dark ? Blockly.Themes.Dark : undefined,
      grid: { spacing: 24, length: 3, colour: '#2a3050', snap: true },
      zoom: { controls: true, wheel: true, startScale: 0.9, maxScale: 3, minScale: 0.3 },
      move: { scrollbars: true, drag: true, wheel: true },
      trashcan: true,
    });

    // Register the dynamic Variables category + its "Create variable" button.
    workspace.registerToolboxCategoryCallback(
      'VARIABLES_PRESETS',
      variablesCategoryFlyout
    );
    registerVariableCategory(workspace);

    // Show generated code whenever the workspace changes (debounced).
    workspace.addChangeListener(onWorkspaceChange);

    // Auto-restore previous session.
    restoreFromLocalStorage();

    wireUI();
    refreshCode();

    // Place a friendly starter program if the workspace is truly empty.
    maybeSeedExample();
  }

  /* ------------------------------------------------------------------ */
  /* Change handling                                                    */
  /* ------------------------------------------------------------------ */
  function onWorkspaceChange(event) {
    // Ignore pure UI events that shouldn't trigger regeneration.
    if (event.isUiEvent) return;
    if (updateTimer) clearTimeout(updateTimer);
    updateTimer = setTimeout(refreshCode, 120);
  }

  function refreshCode() {
    const code = workspaceToCode(workspace, currentLang);
    const out = document.getElementById('output');
    out.innerHTML = '<code>' + highlight(code, currentLang) + '</code>';
  }

  /* ------------------------------------------------------------------ */
  /* Wiring buttons                                                     */
  /* ------------------------------------------------------------------ */
  function wireUI() {
    document.getElementById('btn-save').addEventListener('click', () => {
      saveToLocalStorage();
      toast('Saved to this browser ✔');
    });

    document.getElementById('btn-load').addEventListener('click', () => {
      if (restoreFromLocalStorage()) toast('Loaded from this browser ✔');
      else toast('No saved workspace found.');
    });

    document.getElementById('btn-export').addEventListener('click', exportWorkspace);
    document.getElementById('file-input').addEventListener('change', importWorkspace);

    document.getElementById('btn-clear').addEventListener('click', () => {
      if (!workspace.getAllBlocks(false).length) return;
      if (confirm('Clear all blocks? This cannot be undone.')) {
        workspace.clear();
        refreshCode();
      }
    });

    document.getElementById('btn-copy').addEventListener('click', copyCode);

    // Tabs
    document.querySelectorAll('.tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        currentLang = tab.dataset.tab;
        refreshCode();
      });
    });

    // Ctrl/Cmd+S = save
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveToLocalStorage();
        toast('Saved to this browser ✔');
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Persistence                                                        */
  /* ------------------------------------------------------------------ */
  function saveToLocalStorage() {
    const data = Blockly.serialization.workspaces.save(workspace);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function restoreFromLocalStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    try {
      const data = JSON.parse(raw);
      Blockly.serialization.workspaces.load(data, workspace);
      refreshCode();
      return true;
    } catch (e) {
      console.warn('Failed to load workspace', e);
      return false;
    }
  }

  function exportWorkspace() {
    const data = Blockly.serialization.workspaces.save(workspace);
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blockcraft-workspace.json';
    a.click();
    URL.revokeObjectURL(url);
    toast('Exported blockcraft-workspace.json');
  }

  function importWorkspace(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        Blockly.serialization.workspaces.load(data, workspace);
        refreshCode();
        toast('Workspace imported ✔');
      } catch (err) {
        alert('Could not import file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // allow re-importing the same file
  }

  /* ------------------------------------------------------------------ */
  /* Copy code                                                          */
  /* ------------------------------------------------------------------ */
  function copyCode() {
    const text = document.getElementById('output').innerText;
    navigator.clipboard
      .writeText(text)
      .then(() => toast('Code copied ✔'))
      .catch(() => toast('Copy failed'));
  }

  /* ------------------------------------------------------------------ */
  /* Tiny toast notification                                            */
  /* ------------------------------------------------------------------ */
  let toastEl = null;
  let toastTimer = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      document.body.appendChild(toastEl);
      // Inject minimal styles once.
      const s = document.createElement('style');
      s.textContent = `
        .toast {
          position: fixed; bottom: 22px; left: 50%; transform: translateX(-50%) translateY(20px);
          background: #24324f; color: #fff; padding: 10px 18px; border-radius: 10px;
          font-size: 13px; font-weight: 600; box-shadow: 0 8px 24px rgba(0,0,0,.4);
          border: 1px solid #35406a; opacity: 0; pointer-events: none;
          transition: opacity .2s ease, transform .2s ease; z-index: 9999;
        }
        .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
      `;
      document.head.appendChild(s);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
  }

  /* ------------------------------------------------------------------ */
  /* Syntax highlighting                                                */
  /* ------------------------------------------------------------------ */
  function escapeHtml(s) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function highlight(code, lang) {
    let html = escapeHtml(code);

    if (lang === 'js') {
      // Comments
      html = html.replace(/(\/\/[^\n]*)/g, '<span class="tok-com">$1</span>');
      // Strings
      html = html.replace(/('[^']*'|"[^"]*")/g, '<span class="tok-str">$1</span>');
      // Keywords
      html = html.replace(
        /\b(var|let|const|function|if|else|while|for|return|true|false|null|do)\b/g,
        '<span class="tok-kw">$1</span>'
      );
      // Numbers
      html = html.replace(/\b(\d+(\.\d+)?)\b/g, '<span class="tok-num">$1</span>');
      // Function calls
      html = html.replace(/\b([A-Za-z_]\w*)(?=\s*\()/g, '<span class="tok-fn">$1</span>');
    } else {
      // Robot commands: highlight the leading keyword of each line.
            const KEYWORDS = [
        'TURN LEFT', 'TURN RIGHT', 'JUMP', 'DANCE', 'LAY DOWN', 'SIT DOWN',
        'LOWER BODY', 'RAISE BODY', 'STOP', 'LOAD', 'UNLOAD', 'SPEAK',
        'WALK FORWARD',
        'RECOGNIZE', 'STORE IN', 'DEFINE', 'START',
        'if', 'else', 'while', 'for',
      ];
      KEYWORDS.forEach((kw) => {
        const re = new RegExp('\\b' + kw.replace(/ /g, '\\s') + '\\b', 'g');
        html = html.replace(re, '<span class="tok-kw">' + kw + '</span>');
      });
      html = html.replace(/\b(\d+(\.\d+)?)\b/g, '<span class="tok-num">$1</span>');
      html = html.replace(/(\/\/[^\n]*)/g, '<span class="tok-com">$1</span>');
    }

    // Guard: don't let our own injected spans get re-highlighted keyword styles.
    return html;
  }

  /* ------------------------------------------------------------------ */
  /* Optional starter example                                           */
  /* ------------------------------------------------------------------ */
  function maybeSeedExample() {
    if (workspace.getAllBlocks(false).length > 0) return;
    // Load a tiny example so the canvas isn't scary-empty on first visit.
    const example = {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: 'robot_turn_left',
            x: 40,
            y: 40,
            fields: { DEGREES: 90 },
            next: {
              block: {
                type: 'robot_jump',
                fields: { HEIGHT: 2 },
                next: {
                  block: {
                    type: 'robot_dance',
                  },
                },
              },
            },
          },
        ],
      },
    };
    try {
      Blockly.serialization.workspaces.load(example, workspace);
      refreshCode();
    } catch (e) {
      // Non-fatal; an empty canvas is fine.
      console.warn('Seed example failed', e);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Resize handling: Blockly needs to know about container size changes */
  /* ------------------------------------------------------------------ */
  function onResize() {
    if (workspace) Blockly.svgResize(workspace);
  }
  window.addEventListener('resize', onResize);

  // Kick off once the DOM + Blockly scripts are ready.
  window.addEventListener('load', boot);
})();
