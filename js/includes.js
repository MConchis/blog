document.addEventListener('DOMContentLoaded', function () {
  const placeholder = document.getElementById('site-header');
  if (!placeholder) return;

  fetch('/partials/header.html', {cache: 'no-store'})
    .then(function (r) {
      if (!r.ok) throw new Error('Header fetch failed: ' + r.status);
      return r.text();
    })
    .then(function (html) {
      placeholder.innerHTML = html;
    })
    .catch(function (err) {
      console.error(err);
    });
});
