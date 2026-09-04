

/* 21st.dev Animated File Tree parity layer for static HTML.
   Features mirrored: selected/hover pill, expandable sections/folders, keyboard controls,
   ResizeObserver branch lines, selected branch animation, accessible tree semantics. */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const iconSafe = (value) => value || '';

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

    const visibleItems = () => [...nav.querySelectorAll('.dv-tree-item')].filter((el) => {
      if (el.offsetParent === null) return false;
      const hiddenParent = el.closest('.dv-tree-collapse[aria-hidden="true"]');
      return !hiddenParent;
    });

    const movePill = (pill, target, visible = true) => {
      if (!pill || !target) return;
      const nr = nav.getBoundingClientRect();
      const tr = target.getBoundingClientRect();
      pill.style.width = `${tr.width}px`;
      pill.style.height = `${tr.height}px`;
      pill.style.transform = `translate3d(${tr.left - nr.left - parseFloat(getComputedStyle(nav).paddingLeft)}px,${tr.top - nr.top - parseFloat(getComputedStyle(nav).paddingTop)}px,0)`;
      pill.style.opacity = visible ? '1' : '0';
    };

    const updateLines = () => {
      if (!svg || !basePath || !activePath) return;
      const items = visibleItems();
      if (!items.length) { svg.style.opacity = '0'; return; }
      svg.style.opacity = '1';
      const nr = nav.getBoundingClientRect();
      const top = items[0].getBoundingClientRect().top - nr.top + 16;
      const points = items.map(el => el.getBoundingClientRect().top - nr.top + el.getBoundingClientRect().height / 2);
      const last = points[points.length - 1];
      const height = Math.max(nav.scrollHeight, last + 20);
      svg.setAttribute('height', String(height));
      svg.setAttribute('viewBox', `0 0 28 ${height}`);
      let d = `M8 ${Math.max(0,top-8)} V${Math.max(top,last-5)}`;
      points.forEach(y => { d += ` M8 ${Math.max(0,y-5)} Q8 ${y} 14 ${y} H27`; });
      basePath.setAttribute('d', d);

      if (selected && selected.offsetParent !== null) {
        const sr = selected.getBoundingClientRect();
        const sy = sr.top - nr.top + sr.height/2;
        const active = `M8 ${Math.max(0,top-8)} V${Math.max(top,sy-5)} Q8 ${sy} 14 ${sy} H27`;
        activePath.setAttribute('d', active);
        const length = activePath.getTotalLength?.() || 120;
        activePath.style.strokeDasharray = String(length);
        if (reduceMotion) {
          activePath.style.strokeDashoffset = '0';
        } else {
          activePath.animate([{strokeDashoffset:String(length)},{strokeDashoffset:'0'}],{duration:360,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});
        }
      } else {
        activePath.setAttribute('d','');
      }
    };

    const selectItem = (item, focus = false) => {
      if (!item || item.disabled) return;
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
      if (!reduceMotion) {
        const preview = root.querySelector('.dv-tree-preview-content');
        preview?.animate([{opacity:.35,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:260,easing:'cubic-bezier(.22,1,.36,1)'});
      }
      if (focus) item.focus({preventScroll:true});
      requestAnimationFrame(updateLines);
    };

    const toggle = (button) => {
      const collapse = button.nextElementSibling;
      if (!collapse?.classList.contains('dv-tree-collapse')) return;
      const next = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(next));
      collapse.setAttribute('aria-hidden', String(!next));
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (selected && selected.offsetParent === null) {
          const replacement = visibleItems()[0]; if (replacement) selectItem(replacement);
        }
        updateLines();
      }));
    };

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

    const ro = new ResizeObserver(() => { if (selected) movePill(selectedPill,selected,true); updateLines(); });
    ro.observe(nav);
    window.addEventListener('resize', () => { if (selected) movePill(selectedPill,selected,true); updateLines(); }, {passive:true});

    const initial = nav.querySelector(`.dv-tree-item[data-tree-id="${CSS.escape(root.dataset.defaultId || '')}"]`) || nav.querySelector('.dv-tree-item');
    if (initial) selectItem(initial);
  }

  const boot = () => document.querySelectorAll('[data-dv-tree]').forEach(initTree);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true}); else boot();
})();

