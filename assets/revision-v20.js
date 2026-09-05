/* DIGDAYA REVISION V20 — keep the floating shortcut clear of the footer. */
(() => {
  'use strict';

  const init = () => {
    const footer = document.querySelector('.site-footer');
    const contact = document.querySelector('[data-quick-contact]');
    if (!footer || !contact) return;

    const panel = contact.querySelector('[data-quick-contact-panel]');
    const toggle = contact.querySelector('[data-contact-toggle]');
    let collision = false;

    const setCollision = (next) => {
      if (collision === next) return;
      collision = next;

      if (next) {
        if (contact.contains(document.activeElement)) {
          const footerTarget = footer.querySelector('a[href], button:not([disabled])');
          if (footerTarget) footerTarget.focus({ preventScroll: true });
        }
        if (panel) panel.hidden = true;
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      }

      contact.classList.toggle('dig-footer-collision', next);
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => setCollision(entries.some((entry) => entry.isIntersecting)),
        { root: null, rootMargin: '0px 0px -96px 0px', threshold: 0 },
      );
      observer.observe(footer);
      return;
    }

    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = footer.getBoundingClientRect();
      setCollision(rect.top < window.innerHeight - 96 && rect.bottom > 0);
    };
    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('pageshow', schedule);
    schedule();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
