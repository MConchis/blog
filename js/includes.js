document.addEventListener('DOMContentLoaded', function () {
  // Lightweight on-page debug overlay so console messages are visible to the user.
  (function setupDebugOverlay() {
    try {
      if (window.__debugOverlayInstalled) return;
      window.__debugOverlayInstalled = true;
      const panel = document.createElement('div');
      panel.id = 'debug-overlay';
      const css = `#debug-overlay{position:fixed;right:12px;bottom:12px;max-width:420px;max-height:240px;overflow:auto;background:rgba(0,0,0,0.8);color:#e6e6e6;font-family:monospace;font-size:12px;padding:10px;border-radius:8px;z-index:99999;box-shadow:0 8px 32px rgba(0,0,0,0.6)}#debug-overlay .dbg-msg{margin:0 0 6px 0;padding:2px 4px;border-left:3px solid rgba(255,255,255,0.06)}#debug-overlay .dbg-err{border-left-color:#ff6b6b}#debug-overlay .dbg-warn{border-left-color:#f0ad4e}#debug-overlay .dbg-info{border-left-color:#6bc1ff}`;
      const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
      panel.setAttribute('aria-hidden','false'); panel.setAttribute('role','log');
      // Keep overlay visible so users see it's present even before any logs
      panel.style.display = 'block';
      document.body.appendChild(panel);

      let count = 0;
      const max = 80;
      window.debugLog = function debugLog(msg, level='info') {
        try {
          const text = (typeof msg === 'object') ? JSON.stringify(msg) : String(msg);
          const line = document.createElement('div');
          line.className = 'dbg-msg dbg-' + (level||'info');
          line.textContent = (`${new Date().toLocaleTimeString()} `) + text;
          panel.appendChild(line);
          count++;
          if (count > max) { panel.removeChild(panel.firstChild); count--; }
          panel.style.display = 'block';
        } catch (e) { /* don't crash logger */ }
      };

      // initial visible notice so user can see overlay is active
      try { window.debugLog('debug overlay installed and visible', 'info'); } catch(e){/*ignore*/}

      // Mirror console methods to also log into the overlay
      ['log','info','warn','error'].forEach(m => {
        const orig = console[m].bind(console);
        console[m] = function(...args) {
          try {
            window.debugLog(args.map(a=> (typeof a==='object'? JSON.stringify(a): String(a))).join(' '), m==='warn'? 'warn': (m==='error'? 'err':'info'));
          } catch(e){}
          orig(...args);
        };
      });
    } catch (e) { /* ignore overlay failures */ }
  })();
  // Find all elements that declare a partial to include using `data-include`
  const includes = document.querySelectorAll('[data-include]');
  if (!includes.length) return;

  includes.forEach(el => {
    let url = el.getAttribute('data-include');
    if (!url) return;

    // Fetch the URL
    const attemptFetch = async () => {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) return res;
        throw new Error('Not found');
      } catch (e) {
        throw new Error('Include fetch failed for ' + url);
      }
    };

    attemptFetch()
      .then(r => r.text())
      .then(html => {
        el.innerHTML = html;
        // Add a class for a smooth fade-in to reduce layout flash
        el.classList.add('included');
        // If the included fragment contains a `#year` element, set it
        const yearEl = el.querySelector('#year') || document.getElementById('year');
        if (yearEl) yearEl.textContent = new Date().getFullYear();
      })
      .catch(err => {
        console.error(err);
      });
  });
});
