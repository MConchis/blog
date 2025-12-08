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

      // Update footer/year if included fragment didn't run
      if (window.initGallery) window.initGallery();

      if (addToHistory) history.pushState({spa: true, url: url}, '', url);
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
