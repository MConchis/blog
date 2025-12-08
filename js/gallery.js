// Lightweight gallery that can be initialized multiple times.
function createLightboxIfNeeded() {
  let lightbox = document.getElementById('lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.innerHTML = '<button class="lightbox-close" aria-label="Close">✕</button><div class="lightbox-inner"><img class="lightbox-img" src="" alt=""></div>';
    document.body.appendChild(lightbox);
  }
  return lightbox;
}

function bindGalleryLinks() {
  // Remove previous listeners by replacing nodes (safe and simple)
  const existing = Array.from(document.querySelectorAll('.screenshot-link'));
  existing.forEach(node => {
    const clone = node.cloneNode(true);
    node.parentNode.replaceChild(clone, node);
  });

  const links = Array.from(document.querySelectorAll('.screenshot-link'));
  if (!links.length) return;

  const lightbox = createLightboxIfNeeded();
  const img = lightbox.querySelector('.lightbox-img');
  const closeBtn = lightbox.querySelector('.lightbox-close');

  function open(src, alt) {
    img.src = src;
    img.alt = alt || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    img.src = '';
  }

  links.forEach(l => {
    l.addEventListener('click', e => {
      e.preventDefault();
      const src = l.dataset.full || l.src;
      const alt = l.alt || '';
      open(src, alt);
    });
  });

  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target === img) {
      close();
    }
  });

  // ensure Escape closes
  document.addEventListener('keyup', (e) => {
    if (e.key === 'Escape') close();
  });
}

// Expose an init function for SPA usage and call once on initial load
window.initGallery = function () {
  try { bindGalleryLinks(); } catch (e) { console.error('initGallery error', e); }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.initGallery);
} else {
  window.initGallery();
}
