/* DIGDAYA REVISION V19 — keep the root scroll lock and sticky header in sync. */
(() => {
  'use strict';

  const init = () => {
    const root = document.documentElement;
    const body = document.body;
    if (!body) return;

    const syncNavigationLock = () => {
      root.classList.toggle('dig-nav-lock', body.classList.contains('menu-open'));
    };

    new MutationObserver(syncNavigationLock).observe(body, {
      attributes: true,
      attributeFilter: ['class'],
    });
    window.addEventListener('pageshow', syncNavigationLock);
    syncNavigationLock();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
