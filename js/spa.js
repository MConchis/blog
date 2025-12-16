// Simple SPA navigation: intercept internal links, fetch the page, extract <main class="container"> and replace it.
(function () {
  const isInternal = (url) => {
    try {
      const u = new URL(url, location.href);
      return u.origin === location.origin;
    } catch (e) { return false; }
  };

  async function loadUrl(url, addToHistory = true) {
    try {
      const res = await fetch(url, {cache: 'no-store'});
      if (!res.ok) throw new Error('Failed to load: ' + res.status);
      const text = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const newMain = doc.querySelector('main.container');
      if (!newMain) {
        // fallback: full navigation
        location.href = url; return;
      }

      // Replace main
      const curMain = document.querySelector('main.container');
      if (curMain && newMain) {
        curMain.replaceWith(newMain);
      }

      // Update title
      if (doc.title) document.title = doc.title;

      // Update the browser URL before executing injected scripts so that
      // any relative URLs inside those scripts resolve against the new
      // location. This avoids 404s for fetch('./musings.json') when the
      // script is executed while the document.location is still the
      // previous page.
      if (addToHistory) history.pushState({spa: true, url: url}, '', url);

      // Execute scripts from the fetched document (body scripts) in order.
      // This handles inline scripts that appear after <main> in the page
      // as well as external scripts. External scripts are only loaded if
      // there isn't already a script with the same `src` in the current page.
      try {
        const runScriptsFromDoc = async (doc) => {
          // Ensure we track which inline scripts we've executed via SPA
          if (!window.__spaExecutedScripts) window.__spaExecutedScripts = new Set();
          const scripts = Array.from(doc.querySelectorAll('body script'));
          for (const old of scripts) {
            // If external script, skip if already present in current document
            const src = old.getAttribute('src');
            if (src) {
              const already = document.querySelector('script[src="' + src + '"]');
              if (already) continue;
              // create a new script element and append to head so it executes
              await new Promise((resolve, reject) => {
                const s = document.createElement('script');
                // copy attributes
                for (let i = 0; i < old.attributes.length; i++) {
                  const attr = old.attributes[i];
                  s.setAttribute(attr.name, attr.value);
                }
                s.onload = () => resolve();
                s.onerror = (e) => { console.warn('Failed to load script', src, e); resolve(); };
                document.head.appendChild(s);
              });
            } else {
              // Inline script: avoid re-running identical inline scripts which
              // can cause "Identifier ... has already been declared" errors
              // when const/let/function are declared twice. Use script text
              // as a key in a Set to skip duplicates.
              try {
                const text = (old.textContent || '').trim();
                if (text && window.__spaExecutedScripts.has(text)) {
                  // already executed this inline script via SPA
                  continue;
                }
                const s = document.createElement('script');
                if (old.type) s.type = old.type;
                s.textContent = old.textContent;
                document.body.appendChild(s);
                // remove it right away to avoid accumulation
                document.body.removeChild(s);
                if (text) window.__spaExecutedScripts.add(text);
              } catch (e) {
                console.warn('Failed to execute inline script', e);
              }
            }
          }
        };

        await runScriptsFromDoc(doc);
      } catch (e) {
        console.warn('Failed to execute scripts from fetched document', e);
      }

      // Update footer/year and gallery bindings if needed
      if (window.initGallery) window.initGallery();

      // Notify listeners that a new page was loaded via SPA
      window.dispatchEvent(new CustomEvent('spa:page-loaded', { detail: { url } }));

      window.scrollTo(0,0);
    } catch (err) {
      console.error('SPA load error', err);
      location.href = url; // fallback to full navigation
    }
  }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented) return;
    let a = e.target;
    while (a && a.nodeName !== 'A') a = a.parentNode;
    if (!a || !a.href) return;
    const href = a.getAttribute('href');
    // allow opt-out
    if (a.hasAttribute('data-no-spa')) return;
    if (!isInternal(a.href)) return; // external
    // anchor with hash only: allow default
    if (href.startsWith('#')) return;
    // file download or protocol other than http(s)
    if (!/^https?:/.test(a.href)) return;

    e.preventDefault();
    loadUrl(a.href, true);
  });

  window.addEventListener('popstate', function (e) {
    const url = location.href;
    loadUrl(url, false);
  });
})();
