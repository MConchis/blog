document.addEventListener('DOMContentLoaded', function () {
  // Find all elements that declare a partial to include using `data-include`
  const includes = document.querySelectorAll('[data-include]');
  if (!includes.length) return;

  includes.forEach(el => {
    let url = el.getAttribute('data-include');
    if (!url) return;

    // Convert relative paths to absolute paths with blog subdirectory prefix
    if (url.startsWith('./') || url.startsWith('../')) {
      const currentPath = window.location.pathname;
      const basePath = currentPath.split('/').slice(0, -1).join('/');
      const resolvedPath = new URL(url, window.location.origin + basePath + '/').pathname;
      url = resolvedPath;
    } else if (!url.startsWith('/')) {
      url = '/' + url;
    }

    fetch(url, { cache: 'no-store' })
      .then(r => {
        if (!r.ok) throw new Error('Include fetch failed: ' + r.status + ' ' + url);
        return r.text();
      })
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
