
(() => {
  const bootFallback = () => {
    if (document.documentElement.classList.contains('dig-motion-v16-ready')) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    const nodes = [...document.querySelectorAll('main .kicker, main h1, main section h2')];
    nodes.forEach((el) => {
      el.classList.add('dig-motion-text');
      if (el.matches('.kicker')) el.classList.add('dig-motion-kicker');
      else if (el.tagName === 'H1') el.classList.add('dig-motion-h1');
      else el.classList.add('dig-motion-h2');
    });
    if (reduce || !('IntersectionObserver' in window)) {
      nodes.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    }, {threshold:.12,rootMargin:'0px 0px -6% 0px'});
    nodes.forEach((el) => io.observe(el));
  };
  const defer = window.requestAnimationFrame?.bind(window) || ((callback) => window.setTimeout(callback, 0));
  defer(bootFallback);
})();
