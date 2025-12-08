document.addEventListener('DOMContentLoaded', function () {
  const links = document.querySelectorAll('.screenshot-link');
  let lightbox = document.getElementById('lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.innerHTML = '<button class="lightbox-close" aria-label="Close">✕</button><div class="lightbox-inner"><img class="lightbox-img" src="" alt=""></div>';
    document.body.appendChild(lightbox);
  }

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

  document.addEventListener('keyup', (e) => {
    if (e.key === 'Escape') close();
  });
});
