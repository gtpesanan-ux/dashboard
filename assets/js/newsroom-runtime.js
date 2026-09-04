(() => {
  "use strict";

  const DATA = Array.isArray(globalThis.DigdayaNewsData) ? globalThis.DigdayaNewsData : [];
  const root = document.querySelector("[data-live-news]");
  if (!root) return;

  const q = (selector, scope = root) => scope.querySelector(selector);
  const grid = q("[data-live-news-grid]");
  const more = q("[data-live-news-more]");
  const retry = q("[data-live-news-retry]");
  const search = q("[data-live-news-search]");
  const total = q("[data-live-news-total]");
  const state = q("[data-live-news-state]");
  const progress = q("[data-live-news-progress]");
  const status = q("[data-live-news-status]");
  if (!grid) return;

  let visible = 30;
  let kind = "all";
  let category = "all";
  let sort = "newest";

  const visualPools = {
    Olahraga: "olahraga",
    Pendidikan: "pendidikan",
    Pariwisata: "pariwisata",
    Digital: "digital",
    Fragrance: "fragrance",
    Humaniora: "budaya",
    Nasional: "nasional",
    Lingkungan: "lingkungan",
    Ekonomi: "ekonomi",
    Bisnis: "bisnis",
    Daerah: "nasional",
    Pembangunan: "ekonomi",
    Budaya: "budaya",
    Energi: "ekonomi",
    Kesehatan: "kesehatan",
    Teknologi: "teknologi",
    Internasional: "nasional",
    Hiburan: "budaya"
  };

  const hash = value => Array.from(String(value)).reduce((sum, char) => ((sum << 5) - sum + char.charCodeAt(0)) | 0, 0);
  const imageFor = item => {
    const pool = visualPools[item.category] || "nasional";
    const index = Math.abs(hash(`${item.category}|${item.id}`)) % 3 + 1;
    return `assets/news-${pool}-${index}.webp`;
  };
  const imageDisclosure = category => `Ilustrasi kategori ${category}; bukan dokumentasi peristiwa.`;
  const normalise = value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("id");
  const timeValue = item => {
    const parsed = Date.parse(item.date || "");
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const formatStoredDate = item => {
    if (!item.date) return "Tanggal tidak tersedia";
    try {
      const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(item.date);
      const value = new Intl.DateTimeFormat("id-ID", dateOnly
        ? { dateStyle: "long", timeZone: "Asia/Jakarta" }
        : { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }
      ).format(new Date(item.date));
      return `${value}${dateOnly ? "" : " WIB"} · tanggal dari dataset lama`;
    } catch {
      return `${item.date} · tanggal dari dataset lama`;
    }
  };
  const kindLabel = item => item.kind === "title-archive"
    ? "Arsip judul — verifikasi tertunda"
    : "Pantauan kueri — bukan fakta";

  const controls = document.createElement("div");
  controls.className = "live-news-controls";
  controls.innerHTML = '<label>Jenis <select data-live-kind><option value="all">Semua catatan</option><option value="title-archive">Arsip judul</option><option value="query-monitor">Pantauan kueri</option></select></label><label>Kategori <select data-live-category><option value="all">Semua kategori</option></select></label><label>Urutkan <select data-live-sort><option value="newest">Tanggal dataset terbaru</option><option value="title">Judul A–Z</option></select></label>';
  q(".live-news-toolbar")?.insertAdjacentElement("afterend", controls);

  const categorySelect = controls.querySelector("[data-live-category]");
  [...new Set(DATA.map(item => item.category))]
    .sort((a, b) => a.localeCompare(b, "id"))
    .forEach(value => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      categorySelect.append(option);
    });

  const list = () => {
    const needle = normalise(search?.value);
    const filtered = DATA.filter(item => {
      const haystack = [item.title, item.originalTitle, item.query, item.summary, item.keywords, item.statusLabel].join(" ");
      return (kind === "all" || item.kind === kind)
        && (category === "all" || item.category === category)
        && (!needle || normalise(haystack).includes(needle));
    });
    return [...filtered].sort(sort === "title"
      ? (a, b) => a.title.localeCompare(b.title, "id")
      : (a, b) => timeValue(b) - timeValue(a) || a.title.localeCompare(b.title, "id"));
  };

  const card = (item, index) => {
    const article = document.createElement("article");
    article.className = "live-news-card";
    article.dataset.kind = item.kind;

    const figure = document.createElement("figure");
    figure.className = "live-news-visual";
    figure.dataset.seq = String(index + 1).padStart(4, "0");
    figure.dataset.category = item.category;
    const disclosure = imageDisclosure(item.category);
    const image = document.createElement("img");
    image.src = imageFor(item);
    image.alt = disclosure;
    image.loading = index < 6 ? "eager" : "lazy";
    image.decoding = "async";
    image.width = 1200;
    image.height = 675;
    const caption = document.createElement("figcaption");
    caption.textContent = disclosure;
    figure.append(image, caption);

    const body = document.createElement("div");
    body.className = "live-news-card-body";
    const meta = document.createElement("div");
    meta.className = "live-news-source";
    const categoryName = document.createElement("b");
    categoryName.textContent = item.category;
    const type = document.createElement("span");
    type.className = `news-kind-badge ${item.kind === "title-archive" ? "is-news" : "is-trend"}`;
    type.textContent = kindLabel(item);
    const time = document.createElement("span");
    time.textContent = formatStoredDate(item);
    meta.append(categoryName, type, time);

    const heading = document.createElement("h3");
    heading.textContent = item.title;
    const summary = document.createElement("p");
    summary.textContent = item.summary;
    const link = document.createElement("a");
    link.href = `berita-detail.html?id=${encodeURIComponent(item.id)}`;
    link.textContent = item.kind === "title-archive" ? "Lihat status verifikasi →" : "Lihat batas penggunaan →";
    link.setAttribute("aria-label", `${link.textContent.replace(" →", "")}: ${item.title}`);
    body.append(meta, heading, summary, link);
    article.append(figure, body);
    return article;
  };

  let renderedCount = 0;
  let renderKey = "";
  const render = (append = false) => {
    const items = list();
    const shown = items.slice(0, visible);
    const key = `${kind}|${category}|${sort}|${normalise(search?.value)}`;
    const canAppend = append && key === renderKey && shown.length >= renderedCount;
    if (!canAppend) {
      grid.replaceChildren();
      renderedCount = 0;
    }
    if (!shown.length) {
      const empty = document.createElement("div");
      empty.className = "live-news-empty";
      empty.textContent = "Tidak ada catatan yang cocok dengan filter ini.";
      grid.append(empty);
    } else if (shown.length > renderedCount) {
      const fragment = document.createDocumentFragment();
      shown.slice(renderedCount).forEach((item, index) => fragment.append(card(item, renderedCount + index)));
      grid.append(fragment);
    }
    renderedCount = shown.length;
    renderKey = key;
    if (total) total.textContent = `${DATA.length.toLocaleString("id-ID")} catatan newsroom`;
    if (state) {
      state.textContent = "Arsip lokal · bukan berita terverifikasi";
      state.classList.remove("is-loading");
      state.classList.add("is-local");
    }
    if (status) status.textContent = `Menampilkan ${shown.length} dari ${items.length} catatan. Basis data terdiri dari 46 arsip judul dan 25 pantauan kueri.`;
    if (progress) progress.value = 100;
    if (more) {
      more.hidden = shown.length >= items.length;
      more.textContent = `Muat 30 catatan lagi (${Math.max(0, items.length - shown.length)} tersisa)`;
    }
    if (retry) retry.textContent = "Reset tampilan";
  };

  const kindSelect = controls.querySelector("[data-live-kind]");
  const sortSelect = controls.querySelector("[data-live-sort]");
  let timer = 0;
  search?.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => { visible = 30; render(); }, 120);
  });
  more?.addEventListener("click", () => { visible += 30; render(true); });
  retry?.addEventListener("click", () => {
    visible = 30;
    kind = "all";
    category = "all";
    sort = "newest";
    if (search) search.value = "";
    kindSelect.value = "all";
    categorySelect.value = "all";
    sortSelect.value = "newest";
    render();
  });
  kindSelect.addEventListener("change", event => { kind = event.target.value; visible = 30; render(); });
  categorySelect.addEventListener("change", event => { category = event.target.value; visible = 30; render(); });
  sortSelect.addEventListener("change", event => { sort = event.target.value; visible = 30; render(); });
  render();
})();
