document.addEventListener('DOMContentLoaded', function () {
  // Find all elements that declare a partial to include using `data-include`
  const includes = document.querySelectorAll('[data-include]');
  if (!includes.length) return;

  includes.forEach(el => {
    let url = el.getAttribute('data-include');
    if (!url) return;

    // Try to fetch the URL, with fallback for / vs local dev
    const attemptFetch = async () => {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) return res;
        // If / path failed, try without /
        if (url.startsWith('/')) {
          const altUrl = url.replace('/', '/');
          const altRes = await fetch(altUrl, { cache: 'no-store' });
          if (altRes.ok) return altRes;
        }
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
