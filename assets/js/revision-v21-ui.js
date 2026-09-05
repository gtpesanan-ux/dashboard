/* DIGDAYA REVISION V21 — idempotent newsroom/detail UI runtime. */
(() => {
  'use strict';

  const GLOBAL_KEY = '__digdayaRevisionV21Ui';
  const VERSION = '21.0.0';
  const existing = globalThis[GLOBAL_KEY];

  if (existing && existing.version === VERSION) {
    if (typeof existing.refresh === 'function') existing.refresh();
    return;
  }

  const runtime = {
    version: VERSION,
    refresh: null,
    observers: [],
    cleanups: [],
    cardIndex: 0,
  };
  globalThis[GLOBAL_KEY] = runtime;

  const q = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const compactMedia = window.matchMedia('(max-width: 720px)');

  const makeUniqueId = (prefix) => {
    let id = `${prefix}-${++runtime.cardIndex}`;
    while (document.getElementById(id)) id = `${prefix}-${++runtime.cardIndex}`;
    return id;
  };

  const normalise = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('id')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const enhanceFigure = (figure) => {
    if (!(figure instanceof HTMLElement)) return;

    qsa(':scope > .dig-news-art-layer', figure).forEach((layer) => {
      layer.hidden = true;
      layer.setAttribute('aria-hidden', 'true');
    });

    const image = q(':scope > img', figure);
    const caption = q(':scope > figcaption', figure);
    if (image && caption && caption.textContent.trim()) {
      /* The visible figcaption already communicates the illustrative nature. */
      image.alt = '';
      image.setAttribute('aria-hidden', 'true');
    }

    figure.dataset.v21Figure = 'true';
  };

  const enhanceCard = (card) => {
    if (!(card instanceof HTMLElement)) return;

    const heading = q('h3', card);
    if (heading) {
      if (!heading.id) heading.id = makeUniqueId('news-card-title');
      card.setAttribute('aria-labelledby', heading.id);
    }

    const figure = q('.live-news-visual', card);
    if (figure) enhanceFigure(figure);
    card.dataset.v21Card = 'true';
  };

  const enhanceCards = (scope = document) => {
    if (scope instanceof Element && scope.matches('.live-news-card')) enhanceCard(scope);
    qsa('.live-news-card', scope).forEach(enhanceCard);
  };

  const updateFilterSummary = (panel) => {
    const summaryMeta = q('[data-v21-filter-meta]', panel);
    const controls = q('.live-news-controls', panel);
    if (!summaryMeta || !controls) return;

    const selects = qsa('select', controls);
    const active = selects.filter((select) => select.value && select.value !== 'all').length;
    summaryMeta.textContent = active ? `${active} filter aktif` : `${selects.length} pilihan`;
  };

  const syncFilterMode = (panel, forceCompactReset = false) => {
    if (!(panel instanceof HTMLDetailsElement)) return;

    if (!compactMedia.matches) {
      panel.open = true;
      panel.dataset.v21Compact = 'false';
      return;
    }

    const enteringCompact = panel.dataset.v21Compact !== 'true';
    panel.dataset.v21Compact = 'true';
    if (enteringCompact || forceCompactReset) panel.open = false;
  };

  const enhanceFilters = () => {
    const controls = q('.live-news-controls');
    if (!controls) return;

    let panel = controls.closest('.live-news-filter-panel');
    if (!panel) {
      panel = document.createElement('details');
      panel.className = 'live-news-filter-panel';
      panel.dataset.v21Filters = 'true';

      const summary = document.createElement('summary');
      summary.className = 'live-news-filter-summary';

      const label = document.createElement('span');
      label.textContent = 'Filter dan urutkan';
      const meta = document.createElement('small');
      meta.dataset.v21FilterMeta = '';
      summary.append(label, meta);

      if (!controls.id) controls.id = makeUniqueId('newsroom-filters');
      summary.setAttribute('aria-controls', controls.id);

      controls.before(panel);
      panel.append(summary, controls);

      controls.addEventListener('change', () => updateFilterSummary(panel));
      const reset = q('[data-live-news-retry]');
      if (reset) {
        reset.addEventListener('click', () => {
          window.requestAnimationFrame(() => updateFilterSummary(panel));
        });
      }
    }

    updateFilterSummary(panel);
    syncFilterMode(panel);
  };

  const finishNewsroomProgress = () => {
    const progress = q('[data-live-news-progress]');
    if (!(progress instanceof HTMLProgressElement)) return;

    const complete = Number(progress.max) > 0 && Number(progress.value) >= Number(progress.max);
    progress.dataset.v21Complete = String(complete);
    progress.hidden = complete;

    if (complete) {
      progress.setAttribute('aria-hidden', 'true');
      progress.setAttribute('aria-label', 'Pemuatan wawasan selesai');
    } else {
      progress.removeAttribute('aria-hidden');
      progress.setAttribute('aria-label', 'Progres pemuatan wawasan');
    }
  };

  const sectionName = (headingText) => {
    const value = normalise(headingText);
    if (value.includes('langkah') || value.includes('pemeriksaan') || value.includes('verifikasi')) return 'verification';
    if (value.includes('asal') || value.includes('provenance')) return 'provenance';
    if (value.includes('batas')) return 'limits';
    if (value.includes('status')) return 'status';
    return value || 'section';
  };

  const enhanceDetail = () => {
    const main = q('.news-detail-main');
    if (!main) return;

    const analysis = q('.news-detail-analysis', main);
    if (analysis) {
      qsa(':scope > article', analysis).forEach((section) => {
        const heading = q('h2', section);
        if (!heading) return;
        if (!heading.id) heading.id = makeUniqueId(`news-detail-${sectionName(heading.textContent)}`);
        section.dataset.v21Section = sectionName(heading.textContent);
        section.setAttribute('aria-labelledby', heading.id);
      });

      /* The source runtime owns document order: content, integrity, actions.
       * Preserve that trust-first sequence instead of reparenting controls. */
    }

    qsa('.news-detail-actions,.news-detail-nav,.live-news-actions', main).forEach((zone) => {
      zone.dataset.contactCollisionZone = '';
    });

    const figure = q('.news-detail-visual');
    if (figure) enhanceFigure(figure);

    main.dataset.v21Detail = 'true';
  };

  const enhanceNewsroom = () => {
    enhanceFilters();
    finishNewsroomProgress();
    enhanceCards();
  };

  const initProgressObserver = () => {
    const progress = q('[data-live-news-progress]');
    if (!progress || progress.dataset.v21ProgressObserver === 'true') return;
    progress.dataset.v21ProgressObserver = 'true';

    const observer = new MutationObserver(finishNewsroomProgress);
    observer.observe(progress, { attributes: true, attributeFilter: ['value', 'max'] });
    runtime.observers.push(observer);
  };

  const initDynamicNewsObserver = () => {
    const newsroom = q('[data-live-news]');
    if (!newsroom || newsroom.dataset.v21Observer === 'true') return;
    newsroom.dataset.v21Observer = 'true';

    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        enhanceNewsroom();
      });
    };

    const observer = new MutationObserver((records) => {
      let needsRefresh = false;
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches('.live-news-card')) enhanceCard(node);
          enhanceCards(node);
          if (node.matches('.live-news-controls') || q('.live-news-controls', node)) needsRefresh = true;
        });
      });
      finishNewsroomProgress();
      if (needsRefresh) schedule();
    });
    observer.observe(newsroom, { childList: true, subtree: true });
    runtime.observers.push(observer);
  };

  const initContactSafety = () => {
    const contact = q('[data-quick-contact]');
    if (!contact || contact.dataset.v21ContactSafety === 'true') return;
    contact.dataset.v21ContactSafety = 'true';

    const toggle = q('[data-contact-toggle]', contact);
    const panel = q('[data-quick-contact-panel]', contact);
    if (!toggle) return;

    const zoneSelector = [
      '.site-footer',
      '[data-contact-collision-zone]',
      '.news-detail-analysis > article',
      '.news-detail-related-list > a',
      '.live-news-card-body > a',
    ].join(',');

    let frame = 0;
    let ownCollision = false;
    let keyboardOpen = false;

    const overlaps = (a, b, pad = 10) => (
      a.left < b.right + pad
      && a.right > b.left - pad
      && a.top < b.bottom + pad
      && a.bottom > b.top - pad
    );

    const closePanel = () => {
      if (panel) panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    };

    const moveFocusOutsideContact = () => {
      const target = document.body.classList.contains('menu-open')
        ? q('.menu-button')
        : q('.site-header .brand') || q('.skip-link');
      if (!target || typeof target.focus !== 'function') return;
      try {
        target.focus({ preventScroll: true });
      } catch (error) {
        target.focus();
      }
    };

    const syncA11yState = () => {
      const hiddenBySite = contact.classList.contains('dig-footer-collision')
        || document.body.classList.contains('menu-open');
      const hidden = ownCollision || keyboardOpen || hiddenBySite;

      if (hidden) {
        if (contact.contains(document.activeElement)) moveFocusOutsideContact();
        closePanel();
      }
      contact.toggleAttribute('inert', hidden);
      if (hidden) contact.setAttribute('aria-hidden', 'true');
      else contact.removeAttribute('aria-hidden');
    };

    const measure = () => {
      frame = 0;

      const visualViewport = window.visualViewport;
      keyboardOpen = Boolean(
        visualViewport
        && visualViewport.height > 0
        && visualViewport.height < window.innerHeight * .66
      );

      const contactRects = [toggle.getBoundingClientRect()];
      if (panel && !panel.hidden && panel.getClientRects().length) {
        contactRects.push(panel.getBoundingClientRect());
      }
      let nextCollision = false;

      if (contactRects.some((rect) => rect.width > 0 && rect.height > 0)) {
        const zones = qsa(zoneSelector).filter((zone) => !contact.contains(zone));
        nextCollision = zones.some((zone) => {
          if (!zone.getClientRects().length) return false;
          const zoneRect = zone.getBoundingClientRect();
          return contactRects.some((rect) => rect.width > 0 && rect.height > 0 && overlaps(rect, zoneRect));
        });
      }

      ownCollision = nextCollision;
      contact.classList.toggle('dig-v21-collision', ownCollision);
      contact.classList.toggle('dig-v21-keyboard', keyboardOpen);
      syncA11yState();
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('orientationchange', schedule, { passive: true });
    window.addEventListener('pageshow', schedule);
    document.addEventListener('visibilitychange', schedule);
    document.addEventListener('focusin', schedule);
    document.addEventListener('focusout', schedule);

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', schedule, { passive: true });
      window.visualViewport.addEventListener('scroll', schedule, { passive: true });
    }

    const contactObserver = new MutationObserver(schedule);
    contactObserver.observe(contact, {
      attributes: true,
      attributeFilter: ['class'],
    });
    runtime.observers.push(contactObserver);

    const bodyObserver = new MutationObserver(schedule);
    bodyObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });
    runtime.observers.push(bodyObserver);

    const main = q('main');
    if (main) {
      const contentObserver = new MutationObserver(schedule);
      contentObserver.observe(main, { childList: true, subtree: true });
      runtime.observers.push(contentObserver);
    }

    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(schedule);
      resizeObserver.observe(toggle);
      const detailMain = q('.news-detail-main');
      if (detailMain) resizeObserver.observe(detailMain);
      runtime.observers.push(resizeObserver);
    }

    runtime.cleanups.push(() => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('orientationchange', schedule);
      window.removeEventListener('pageshow', schedule);
      document.removeEventListener('visibilitychange', schedule);
      document.removeEventListener('focusin', schedule);
      document.removeEventListener('focusout', schedule);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', schedule);
        window.visualViewport.removeEventListener('scroll', schedule);
      }
    });

    schedule();
  };

  const refresh = () => {
    enhanceNewsroom();
    enhanceDetail();
    initProgressObserver();
    initDynamicNewsObserver();
    initContactSafety();
    document.documentElement.classList.add('dig-v21-ui-ready');
  };
  runtime.refresh = refresh;

  const onCompactChange = () => {
    qsa('.live-news-filter-panel').forEach((panel) => syncFilterMode(panel, true));
  };

  if (typeof compactMedia.addEventListener === 'function') {
    compactMedia.addEventListener('change', onCompactChange);
    runtime.cleanups.push(() => compactMedia.removeEventListener('change', onCompactChange));
  } else if (typeof compactMedia.addListener === 'function') {
    compactMedia.addListener(onCompactChange);
    runtime.cleanups.push(() => compactMedia.removeListener(onCompactChange));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refresh, { once: true });
  } else {
    refresh();
  }
})();
