/* DIGDAYA REVISION V17 — replay measured menu-icon morph without changing nav semantics. */
(() => {
  'use strict';

  const init = () => {
    const root = document.documentElement;
    const header = document.querySelector('.site-header');
    const syncHeaderHeight = () => {
      if (!header) return;
      root.style.setProperty('--dig-v17-header-height', `${Math.ceil(header.getBoundingClientRect().height)}px`);
    };
    syncHeaderHeight();
    if ('ResizeObserver' in window && header) {
      new ResizeObserver(syncHeaderHeight).observe(header);
    } else {
      window.addEventListener('resize', syncHeaderHeight, { passive: true });
    }

    document.querySelectorAll('.menu-button[aria-controls="main-nav"]').forEach((button) => {
      let cleanupTimer = 0;
      const observer = new MutationObserver(() => {
        const opening = button.getAttribute('aria-expanded') === 'true';
        window.clearTimeout(cleanupTimer);
        button.classList.remove('dig-menu-opening', 'dig-menu-closing');
        button.classList.add(opening ? 'dig-menu-opening' : 'dig-menu-closing');
        cleanupTimer = window.setTimeout(() => {
          button.classList.remove('dig-menu-opening', 'dig-menu-closing');
        }, opening ? 360 : 320);
      });
      observer.observe(button, { attributes: true, attributeFilter: ['aria-expanded'] });
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
