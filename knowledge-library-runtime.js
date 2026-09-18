
(() => {
  'use strict';
  const PAGE_SIZE = 16;
  function normalise(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('id-ID');
  }
  const articles = Array.isArray(globalThis.DigdayaNewsData) ? globalThis.DigdayaNewsData : [];
  const DATA = Object.freeze(articles.map(item => Object.freeze({
    id: item.id,
    title: item.title,
    category: item.category,
    angle: item.format || 'Panduan praktis',
    summary: item.summary,
    focus: item.sections?.[0]?.paragraphs?.[0] || item.summary,
    points: item.takeaways || [],
    note: 'Baca artikel lengkap untuk penjelasan dan langkah yang lebih rinci.',
    reviewedAt: item.reviewedAt,
    keywords: normalise([item.title, item.summary, item.category, ...(item.sections || []).flatMap(section => [section.heading, ...(section.paragraphs || [])]), ...(item.takeaways || [])].join(' '))
  })));
  globalThis.DigdayaKnowledgeData = DATA;
  const grid = document.getElementById('knowledge-grid');
  if (!grid) return;

  const search = document.getElementById('knowledge-search');
  const category = document.getElementById('knowledge-category');
  const angle = document.getElementById('knowledge-angle');
  const count = document.getElementById('knowledge-result-count');
  const more = document.getElementById('knowledge-more');
  const reset = document.getElementById('knowledge-reset');
  const dialog = document.getElementById('knowledge-dialog');
  const dialogTitle = document.getElementById('knowledge-dialog-title');
  const dialogMeta = document.getElementById('knowledge-dialog-meta');
  const dialogSummary = document.getElementById('knowledge-dialog-summary');
  const dialogFocus = document.getElementById('knowledge-dialog-focus');
  const dialogPoints = document.getElementById('knowledge-dialog-points');
  const dialogNote = document.getElementById('knowledge-dialog-note');
  const dialogSource = document.getElementById('knowledge-dialog-source');
  const copyButton = document.getElementById('knowledge-copy');
  const dataById = new Map(DATA.map((item) => [item.id, item]));
  const collator = new Intl.Collator('id-ID', { sensitivity: 'base' });
  const numberFormatter = new Intl.NumberFormat('id-ID');
  const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  });
  let shown = PAGE_SIZE;
  let filtered = DATA.slice();
  let active = null;

  function formatReviewDate(value) {
    return dateFormatter.format(new Date(value + 'T00:00:00Z'));
  }

  function setPageCopy() {
    const section = document.getElementById('knowledge-library');
    if (section) {
      const eyebrow = section.querySelector('.section-head .eyebrow');
      const heading = document.getElementById('knowledge-library-title');
      const description = section.querySelector('.section-head > p');
      if (eyebrow) eyebrow.textContent = 'Pustaka PT DIRAC INOVASI NUSANTARA';
      if (heading) heading.textContent = DATA.length + ' artikel untuk memahami kebutuhan usaha dan digital.';
      if (description) {
        description.textContent = 'Cari topik, baca ringkasan dan daftar periksa, lalu buka artikel lengkap untuk mendalami langkahnya.';
      }
    }

    const stats = Array.from(document.querySelectorAll('.knowledge-stats > div'));
    const values = [
      [String(DATA.length), 'artikel'],
      [String(new Set(DATA.map((item) => item.category)).size), 'kategori'],
      [String(new Set(DATA.map((item) => item.angle)).size), 'jenis panduan'],
      ['Lengkap', 'penjelasan & daftar periksa']
    ];
    stats.slice(0, values.length).forEach((box, index) => {
      const strong = box.querySelector('strong');
      const label = box.querySelector('span');
      if (strong) strong.textContent = values[index][0];
      if (label) label.textContent = values[index][1];
    });

    const seo = document.getElementById('seo-structured-data');
    if (seo) {
      try {
        const graph = JSON.parse(seo.textContent);
        const page = graph && graph['@graph'] && graph['@graph'][0];
        if (page) {
          page.description = 'Pusat pengetahuan PT DIRAC INOVASI NUSANTARA berisi ' + DATA.length + ' artikel tentang parfum, domain, website, keamanan, pembayaran, dan layanan usaha.';
          seo.textContent = JSON.stringify(graph);
        }
      } catch (error) {
        console.warn('Metadata pustaka tidak dapat diperbarui.', error);
      }
    }
  }

  function populateSelect(select, values) {
    if (!select) return;
    Array.from(select.options).slice(1).forEach((option) => option.remove());
    values.slice().sort(collator.compare).forEach((value) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function makePill(value, extraClass) {
    const pill = document.createElement('span');
    pill.className = 'knowledge-pill' + (extraClass ? ' ' + extraClass : '');
    pill.textContent = value;
    return pill;
  }

  function makeCard(item) {
    const card = document.createElement('article');
    card.className = 'knowledge-card';

    const meta = document.createElement('div');
    meta.className = 'knowledge-card-meta';
    meta.append(makePill(item.category), makePill(item.angle, 'angle'));

    const heading = document.createElement('h3');
    heading.textContent = item.title;

    const summary = document.createElement('p');
    summary.textContent = item.summary;

    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.kid = item.id;
    button.setAttribute('aria-label', 'Buka topik: ' + item.title);
    button.textContent = 'Buka topik';

    card.append(meta, heading, summary, button);
    return card;
  }

  function makeEmptyState() {
    const empty = document.createElement('div');
    empty.className = 'knowledge-empty';
    const heading = document.createElement('strong');
    heading.textContent = 'Tidak ada topik yang cocok.';
    const detail = document.createElement('span');
    detail.textContent = ' Ubah kata pencarian atau reset filter untuk menampilkan pustaka kembali.';
    empty.append(heading, document.createElement('br'), detail);
    return empty;
  }

  function render() {
    if (count) count.textContent = numberFormatter.format(filtered.length);
    const fragment = document.createDocumentFragment();
    const visible = filtered.slice(0, shown);
    if (visible.length) visible.forEach((item) => fragment.appendChild(makeCard(item)));
    else fragment.appendChild(makeEmptyState());
    grid.replaceChildren(fragment);

    if (more) {
      const remaining = Math.max(0, filtered.length - shown);
      more.hidden = remaining === 0;
      const wrapper = more.closest('.knowledge-more-wrap');
      if (wrapper) wrapper.hidden = remaining === 0;
      if (remaining) more.textContent = 'Muat ' + Math.min(PAGE_SIZE, remaining) + ' topik lagi';
    }
  }

  function applyFilters() {
    const query = normalise(search ? search.value.trim() : '');
    const selectedCategory = category ? category.value : '';
    const selectedAngle = angle ? angle.value : '';
    filtered = DATA.filter((item) => (
      (!selectedCategory || item.category === selectedCategory) &&
      (!selectedAngle || item.angle === selectedAngle) &&
      (!query || item.keywords.includes(query))
    ));
    shown = PAGE_SIZE;
    render();
  }

  function hashId() {
    let raw = '';
    try {
      raw = decodeURIComponent(globalThis.location.hash.slice(1));
    } catch (error) {
      return '';
    }
    if (!raw.startsWith('knowledge-')) return '';
    const id = raw.slice('knowledge-'.length);
    return dataById.has(id) ? id : '';
  }

  function syncHash(id) {
    const next = globalThis.location.pathname + globalThis.location.search + '#knowledge-' + id;
    if (globalThis.location.hash !== '#knowledge-' + id) {
      globalThis.history.replaceState(null, '', next);
    }
  }

  function clearHash() {
    if (!globalThis.location.hash.startsWith('#knowledge-')) return;
    globalThis.history.replaceState(
      null,
      '',
      globalThis.location.pathname + globalThis.location.search
    );
  }

  function closeDialog() {
    if (!dialog) return;
    if (typeof dialog.close === 'function' && dialog.open) dialog.close();
    else {
      dialog.removeAttribute('open');
      clearHash();
    }
  }

  function openItem(id, updateHash = true) {
    const item = dataById.get(id);
    if (!item || !dialog) return;
    active = item;

    if (dialogTitle) dialogTitle.textContent = item.title;
    if (dialogMeta) {
      dialogMeta.textContent = item.category + ' · ' + item.angle +
        ' · ' + formatReviewDate(item.reviewedAt);
    }
    if (dialogSummary) dialogSummary.textContent = item.summary;
    if (dialogFocus) dialogFocus.textContent = item.focus;
    if (dialogPoints) {
      const pointNodes = item.points.map((point) => {
        const listItem = document.createElement('li');
        listItem.textContent = point;
        return listItem;
      });
      dialogPoints.replaceChildren(...pointNodes);
    }
    if (dialogNote) dialogNote.textContent = item.note;
    if (dialogSource) {
      dialogSource.hidden = false;
      dialogSource.href = 'berita-detail.html?id=' + encodeURIComponent(item.id);
      dialogSource.removeAttribute('target');
      dialogSource.removeAttribute('rel');
      dialogSource.textContent = 'Baca artikel lengkap →';
    }

    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    if (updateHash) syncHash(item.id);
  }

  function copyActiveItem() {
    if (!active || !copyButton) return;
    const text = [
      active.title,
      '',
      active.summary,
      '',
      'Fokus: ' + active.focus,
      '',
      '- ' + active.points.join('\n- '),
      '',
      new URL('berita-detail.html?id=' + encodeURIComponent(active.id), window.location.href).href
    ].join('\n');

    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
      copyButton.textContent = 'Salin manual';
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      copyButton.textContent = 'Tersalin';
      globalThis.setTimeout(() => {
        copyButton.textContent = 'Salin ringkasan';
      }, 1400);
    }).catch(() => {
      copyButton.textContent = 'Salin manual';
    });
  }

  setPageCopy();
  populateSelect(category, Array.from(new Set(DATA.map((item) => item.category))));
  populateSelect(angle, Array.from(new Set(DATA.map((item) => item.angle))));

  grid.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('[data-kid]') : null;
    if (target) openItem(target.dataset.kid);
  });
  if (search) search.addEventListener('input', applyFilters);
  if (category) category.addEventListener('change', applyFilters);
  if (angle) angle.addEventListener('change', applyFilters);
  if (more) {
    more.addEventListener('click', () => {
      const previousVisible = Math.min(filtered.length, shown);
      shown = Math.min(filtered.length, shown + PAGE_SIZE);
      render();
      if (more.hidden) {
        const firstNewButton = grid.querySelectorAll('[data-kid]')[previousVisible];
        if (firstNewButton instanceof HTMLElement) {
          try {
            firstNewButton.focus({ preventScroll: true });
          } catch (error) {
            firstNewButton.focus();
          }
        }
      }
    });
  }
  if (reset) {
    reset.addEventListener('click', () => {
      if (search) search.value = '';
      if (category) category.value = '';
      if (angle) angle.value = '';
      applyFilters();
      if (search) search.focus({ preventScroll: true });
    });
  }
  if (dialog) {
    const closeButton = dialog.querySelector('[data-knowledge-close]');
    if (closeButton) closeButton.addEventListener('click', closeDialog);
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) closeDialog();
    });
    dialog.addEventListener('close', clearHash);
  }
  if (copyButton) copyButton.addEventListener('click', copyActiveItem);
  globalThis.addEventListener('hashchange', () => {
    const id = hashId();
    if (id) openItem(id, false);
    else closeDialog();
  });

  render();
  const initialId = hashId();
  if (initialId) globalThis.queueMicrotask(() => openItem(initialId, false));
})();

