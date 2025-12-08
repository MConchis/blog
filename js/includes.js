document.addEventListener('DOMContentLoaded', function () {
  // Find all elements that declare a partial to include using `data-include`
  const includes = document.querySelectorAll('[data-include]');
  if (!includes.length) return;

  includes.forEach(el => {
    const url = el.getAttribute('data-include');
    if (!url) return;

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
