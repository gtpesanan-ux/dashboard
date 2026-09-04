

/* 21st.dev Animated File Tree parity layer for static HTML.
   Features mirrored: selected/hover pill, expandable sections/folders, keyboard controls,
   ResizeObserver branch lines, selected branch animation, accessible tree semantics. */
(() => {
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)') || {matches:false};
  const nextFrame = window.requestAnimationFrame?.bind(window) || ((callback) => window.setTimeout(callback, 16));

  function initTree(root) {
    const nav = root.querySelector('.dv-tree-nav');
    if (!nav || nav.dataset.treeReady === '1') return;
    nav.dataset.treeReady = '1';

    const hoverPill = nav.querySelector('.dv-tree-hover-pill');
    const selectedPill = nav.querySelector('.dv-tree-selected-pill');
    const svg = nav.querySelector('.dv-tree-lines');
    const basePath = svg?.querySelector('.dv-tree-base-path');
    const activePath = svg?.querySelector('.dv-tree-active-path');
    const title = root.querySelector('[data-tree-preview-title]');
    const desc = root.querySelector('[data-tree-preview-desc]');
    const meta = root.querySelector('[data-tree-preview-meta]');
    const link = root.querySelector('[data-tree-preview-link]');
    const announce = root.querySelector('[data-tree-announce]');
    let selected = null;
    let lineRaf = 0;
    let animateActiveOnNextFrame = false;
    let activePathAnimation = null;
    let previewAnimation = null;

    const visibleItems = (scope = nav) => [...scope.querySelectorAll('.dv-tree-item')].filter((el) => {
      if (el.offsetParent === null) return false;
      const hiddenParent = el.closest('.dv-tree-collapse[aria-hidden="true"]');
      return !hiddenParent;
    });

    const groups = () => Array.from(nav.children).filter((el) => el.classList?.contains('dv-tree-group'));
    const isReduced = () => Boolean(reduceMotion.matches);

    const movePill = (pill, target, visible = true) => {
      if (!pill || !target) return;
      const nr = nav.getBoundingClientRect();
      const tr = target.getBoundingClientRect();
      const ps = getComputedStyle(pill);
      const left = Number.parseFloat(ps.left);
      const top = Number.parseFloat(ps.top);
      const originX = nav.clientLeft + (Number.isFinite(left) ? left : 0);
      const originY = nav.clientTop + (Number.isFinite(top) ? top : 0);
      pill.style.width = `${tr.width}px`;
      pill.style.height = `${tr.height}px`;
      pill.style.transform = `translate3d(${tr.left - nr.left - originX}px,${tr.top - nr.top - originY}px,0)`;
      pill.style.opacity = visible ? '1' : '0';
    };

    const cancelActivePathAnimation = () => {
      if (!activePathAnimation) return;
      activePathAnimation.cancel();
      activePathAnimation = null;
    };

    const updateLines = (animateActive = false) => {
      if (!svg || !basePath || !activePath) return;
      const items = visibleItems();
      if (!items.length) {
        cancelActivePathAnimation();
        basePath.setAttribute('d', '');
        activePath.setAttribute('d', '');
        activePath.style.strokeDasharray = '';
        activePath.style.strokeDashoffset = '0';
        svg.style.opacity = '0';
        return;
      }
      svg.style.opacity = '1';
      const nr = nav.getBoundingClientRect();
      const sr = svg.getBoundingClientRect();
      const centerY = (el) => {
        const rect = el.getBoundingClientRect();
        return rect.top - sr.top + rect.height / 2;
      };
      const groupData = groups().map((group) => ({
        group,
        items: visibleItems(group),
      })).filter((entry) => entry.items.length);
      const allPoints = groupData.flatMap((entry) => entry.items.map(centerY));
      const last = allPoints.length ? Math.max(...allPoints) : 0;
      const svgOffset = sr.top - nr.top;
      const height = Math.ceil(Math.max(1, nav.clientTop + nav.scrollHeight - svgOffset, last + 20));
      svg.setAttribute('height', String(height));
      svg.setAttribute('viewBox', `0 0 28 ${height}`);
      const base = groupData.map(({items: groupItems}) => {
        const points = groupItems.map(centerY);
        const first = points[0];
        const groupLast = points[points.length - 1];
        let path = `M8 ${Math.max(0, first - 8)} V${Math.max(first, groupLast - 5)}`;
        points.forEach((y) => { path += ` M8 ${Math.max(0, y - 5)} Q8 ${y} 14 ${y} H27`; });
        return path;
      }).join(' ');
      basePath.setAttribute('d', base);

      const selectedGroup = selected?.closest('.dv-tree-group');
      const selectedEntry = groupData.find((entry) => entry.group === selectedGroup);
      if (selected && selectedEntry?.items.includes(selected)) {
        const first = centerY(selectedEntry.items[0]);
        const sy = centerY(selected);
        const active = `M8 ${Math.max(0, first - 8)} V${Math.max(first, sy - 5)} Q8 ${sy} 14 ${sy} H27`;
        activePath.setAttribute('d', active);
        const length = activePath.getTotalLength?.() || 120;
        activePath.style.strokeDasharray = String(length);
        if (isReduced()) {
          cancelActivePathAnimation();
          activePath.style.strokeDashoffset = '0';
        } else if (animateActive && typeof activePath.animate === 'function') {
          cancelActivePathAnimation();
          activePath.style.strokeDashoffset = String(length);
          const animation = activePath.animate(
            [{strokeDashoffset:String(length)},{strokeDashoffset:'0'}],
            {duration:360,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'},
          );
          activePathAnimation = animation;
          animation.finished.then(() => {
            if (activePathAnimation !== animation) return;
            activePath.style.strokeDashoffset = '0';
            activePathAnimation = null;
            animation.cancel();
          }, () => {});
        } else if (!activePathAnimation) {
          activePath.style.strokeDashoffset = '0';
        }
      } else {
        cancelActivePathAnimation();
        activePath.setAttribute('d', '');
        activePath.style.strokeDasharray = '';
        activePath.style.strokeDashoffset = '0';
      }
    };

    const syncLayout = (animateActive = false) => {
      if (selected && visibleItems().includes(selected)) movePill(selectedPill, selected, true);
      else if (selectedPill) selectedPill.style.opacity = '0';
      updateLines(animateActive);
    };

    const scheduleLayout = (animateActive = false) => {
      animateActiveOnNextFrame ||= animateActive;
      if (lineRaf) return;
      lineRaf = nextFrame(() => {
        lineRaf = 0;
        const shouldAnimate = animateActiveOnNextFrame;
        animateActiveOnNextFrame = false;
        syncLayout(shouldAnimate);
      });
    };

    const selectItem = (item, focus = false) => {
      if (!item || item.disabled) return;
      const selectionChanged = selected !== item;
      nav.querySelectorAll('.dv-tree-item[aria-selected="true"]').forEach(el => el.setAttribute('aria-selected','false'));
      item.setAttribute('aria-selected','true');
      selected = item;
      movePill(selectedPill,item,true);
      const label = item.dataset.treeLabel || item.textContent.trim();
      const description = item.dataset.treeDesc || '';
      const href = item.dataset.treeHref || '#';
      const metaText = item.dataset.treeMeta || '';

      if (title) title.textContent = label;
      if (desc) desc.textContent = description;
      if (link) { link.href = href; link.setAttribute('aria-label', `Buka ${label}`); }
      if (meta) {
        meta.replaceChildren();
        metaText.split('•').map(s => s.trim()).filter(Boolean).forEach(part => {
          const tag = document.createElement('span'); tag.textContent = part; meta.appendChild(tag);
        });
      }
      if (announce) announce.textContent = `${label} dipilih.`;
      if (!isReduced()) {
        const preview = root.querySelector('.dv-tree-preview-content');
        if (preview && typeof preview.animate === 'function') {
          previewAnimation?.cancel();
          const animation = preview.animate(
            [{opacity:.35,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],
            {duration:260,easing:'cubic-bezier(.22,1,.36,1)'},
          );
          previewAnimation = animation;
          animation.finished.then(() => {
            if (previewAnimation === animation) previewAnimation = null;
          }, () => {});
        }
      }
      if (focus) item.focus({preventScroll:true});
      scheduleLayout(selectionChanged);
    };

    const setCollapseInert = (collapse, inert) => {
      if (inert) collapse.setAttribute('inert', '');
      else collapse.removeAttribute('inert');
      if ('inert' in collapse) collapse.inert = inert;
    };

    const toggle = (button) => {
      const collapse = button.nextElementSibling;
      if (!collapse?.classList.contains('dv-tree-collapse')) return;
      const next = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(next));
      setCollapseInert(collapse, !next);
      collapse.setAttribute('aria-hidden', String(!next));
      if (hoverPill) hoverPill.style.opacity = '0';
      const currentItems = visibleItems();
      if (selected && !currentItems.includes(selected)) {
        const currentGroup = button.closest('.dv-tree-group');
        const replacement = (currentGroup ? visibleItems(currentGroup)[0] : null) || currentItems[0];
        if (replacement) selectItem(replacement);
      }
      scheduleLayout(false);
      nextFrame(() => scheduleLayout(false));
    };

    const collapses = [...nav.querySelectorAll('.dv-tree-collapse')];
    collapses.forEach((collapse) => {
      setCollapseInert(collapse, collapse.getAttribute('aria-hidden') === 'true');
      collapse.addEventListener('transitionend', (event) => {
        if (event.target === collapse && (event.propertyName === 'grid-template-rows' || event.propertyName === 'opacity')) scheduleLayout(false);
      });
    });

    nav.querySelectorAll('.dv-tree-section-toggle,.dv-tree-folder-toggle').forEach(button => {
      button.addEventListener('click', () => toggle(button));
      button.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(button); }
        if (event.key === 'ArrowRight' && button.getAttribute('aria-expanded') !== 'true') { event.preventDefault(); toggle(button); }
        if (event.key === 'ArrowLeft' && button.getAttribute('aria-expanded') === 'true') { event.preventDefault(); toggle(button); }
      });
    });

    nav.querySelectorAll('.dv-tree-item').forEach(item => {
      item.addEventListener('mouseenter', () => movePill(hoverPill,item,true));
      item.addEventListener('focus', () => movePill(hoverPill,item,true));
      item.addEventListener('click', () => selectItem(item));
      item.addEventListener('keydown', (event) => {
        const items = visibleItems();
        const index = items.indexOf(item);
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectItem(item); }
        if (event.key === 'ArrowDown' && index < items.length-1) { event.preventDefault(); selectItem(items[index+1],true); }
        if (event.key === 'ArrowUp' && index > 0) { event.preventDefault(); selectItem(items[index-1],true); }
        if (event.key === 'Home' && items.length) { event.preventDefault(); selectItem(items[0],true); }
        if (event.key === 'End' && items.length) { event.preventDefault(); selectItem(items[items.length-1],true); }
      });
    });

    nav.addEventListener('mouseleave', () => { if (hoverPill) hoverPill.style.opacity='0'; });
    nav.addEventListener('focusout', (event) => { if (!nav.contains(event.relatedTarget) && hoverPill) hoverPill.style.opacity='0'; });

    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(() => scheduleLayout(false));
      ro.observe(nav);
      collapses.forEach((collapse) => ro.observe(collapse));
    }
    window.addEventListener('resize', () => scheduleLayout(false), {passive:true});
    window.addEventListener('orientationchange', () => scheduleLayout(false), {passive:true});
    window.addEventListener('pageshow', () => scheduleLayout(false));
    document.fonts?.ready.then(() => scheduleLayout(false), () => {});

    const handleReducedMotionChange = () => {
      if (isReduced()) {
        cancelActivePathAnimation();
        previewAnimation?.cancel();
        previewAnimation = null;
        if (activePath) activePath.style.strokeDashoffset = '0';
      }
      scheduleLayout(false);
    };
    if (typeof reduceMotion.addEventListener === 'function') reduceMotion.addEventListener('change', handleReducedMotionChange);
    else reduceMotion.addListener?.(handleReducedMotionChange);

    const defaultId = root.dataset.defaultId || '';
    const initial = [...nav.querySelectorAll('.dv-tree-item')].find((item) => item.dataset.treeId === defaultId) || nav.querySelector('.dv-tree-item');
    if (initial) selectItem(initial);
  }

  const boot = () => document.querySelectorAll('[data-dv-tree]').forEach(initTree);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true}); else boot();
})();
