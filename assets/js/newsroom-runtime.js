(() => {
  "use strict";

  const root = document.querySelector("[data-live-news]");
  if (!root || root.dataset.newsroomRuntime === "v21") return;

  const q = (selector, scope = root) => scope.querySelector(selector);
  const grid = q("[data-live-news-grid]");
  if (!grid) return;

  root.dataset.newsroomRuntime = "v21";

  const PAGE_SIZE = 12;
  const rawData = Array.isArray(globalThis.DigdayaNewsData) ? globalThis.DigdayaNewsData : [];
  const text = value => String(value ?? "").trim();
  const list = value => Array.isArray(value) ? value : [];
  const normalise = value => text(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("id-ID");
  const safeHttpsUrl = value => {
    try {
      const url = new URL(text(value));
      if (url.protocol !== "https:" || !url.hostname || url.username || url.password) return "";
      return url.href;
    } catch {
      return "";
    }
  };
  const searchableText = item => {
    const sectionText = list(item.sections).flatMap(section => [
      section?.heading,
      ...list(section?.paragraphs),
      ...list(section?.bullets)
    ]);
    return normalise([
      item.title,
      item.summary,
      item.category,
      item.kind,
      item.keywords,
      item.statusLabel,
      item.sourceName,
      item.sourceDate,
      ...list(item.takeaways),
      ...sectionText
    ].join(" "));
  };

  const seenIds = new Set();
  const DATA = rawData.filter(item => {
    const id = text(item?.id);
    const valid = Boolean(id && text(item?.title) && !seenIds.has(id));
    if (valid) seenIds.add(id);
    return valid;
  }).map(item => ({ item, searchText: searchableText(item) }));

  const more = q("[data-live-news-more]");
  const retry = q("[data-live-news-retry]");
  const search = q("[data-live-news-search]");
  const total = q("[data-live-news-total]");
  const state = q("[data-live-news-state]");
  const progress = q("[data-live-news-progress]");
  const status = q("[data-live-news-status]");
  const extraMeta = [...root.querySelectorAll(".live-news-meta .live-news-pill")]
    .find(element => !element.hasAttribute("data-live-news-state") && !element.hasAttribute("data-live-news-total"));

  const visualPools = {
    Aksesibilitas: "digital",
    "Badan Usaha": "bisnis",
    Domain: "digital",
    Keamanan: "teknologi",
    Konsumen: "bisnis",
    Legalitas: "bisnis",
    Merek: "bisnis",
    Parfum: "fragrance",
    Pembayaran: "ekonomi",
    Privasi: "teknologi",
    Website: "digital"
  };
  const hash = value => Array.from(text(value)).reduce(
    (sum, character) => ((sum << 5) - sum + character.charCodeAt(0)) | 0,
    0
  );
  const imageFor = item => {
    const supplied = text(item.image);
    if (/^assets\/[a-z0-9][a-z0-9._/-]*\.(?:avif|jpe?g|png|webp)$/i.test(supplied) && !supplied.includes("..")) {
      return supplied;
    }
    const pool = visualPools[text(item.category)] || "bisnis";
    const index = Math.abs(hash(`${text(item.category)}|${text(item.id)}`)) % 3 + 1;
    return `assets/news-${pool}-${index}.webp`;
  };
  const imageDisclosure = category => `Ilustrasi editorial untuk topik ${text(category) || "wawasan"}; bukan dokumentasi sumber.`;
  const timestamp = item => {
    const value = Date.parse(text(item.date));
    return Number.isFinite(value) ? value : 0;
  };
  const dateFormatter = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta"
  });
  const formatDate = item => {
    const value = timestamp(item);
    if (!value) return "Tanggal belum dicatat";
    try {
      return dateFormatter.format(new Date(value));
    } catch {
      return text(item.date) || "Tanggal belum dicatat";
    }
  };
  const readingLabel = item => {
    const minutes = Number.parseInt(item.readingMinutes, 10);
    return Number.isFinite(minutes) && minutes > 0 ? `${minutes} menit baca` : "Waktu baca singkat";
  };
  const kindLabel = value => {
    const known = {
      "panduan-editorial": "Panduan editorial · sumber primer",
      "panduan-resmi": "Panduan editorial · sumber primer",
      "pembaruan-resmi": "Pembaruan editorial · sumber resmi"
    };
    if (known[value]) return known[value];
    const label = text(value).replace(/[-_]+/g, " ");
    return label ? `${label.charAt(0).toLocaleUpperCase("id-ID")}${label.slice(1)}` : "Artikel";
  };
  const isSourceReviewed = item => Boolean(
    safeHttpsUrl(item.sourceUrl)
    && text(item.sourceName)
    && text(item.sourceDate)
    && text(item.statusLabel)
  );

  const addOption = (select, value, label) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.append(option);
  };
  const addSelect = (host, labelText, dataAttribute) => {
    const label = document.createElement("label");
    const caption = document.createElement("span");
    const select = document.createElement("select");
    caption.textContent = labelText;
    select.setAttribute(dataAttribute, "");
    label.append(caption, select);
    host.append(label);
    return select;
  };

  q("[data-live-news-controls]")?.remove();
  const controls = document.createElement("div");
  controls.className = "live-news-controls";
  controls.setAttribute("data-live-news-controls", "");
  const kindSelect = addSelect(controls, "Jenis", "data-live-kind");
  const categorySelect = addSelect(controls, "Kategori", "data-live-category");
  const sortSelect = addSelect(controls, "Urutkan", "data-live-sort");
  addOption(kindSelect, "all", "Semua artikel");
  [...new Set(DATA.map(record => text(record.item.kind)).filter(Boolean))]
    .sort((a, b) => kindLabel(a).localeCompare(kindLabel(b), "id-ID"))
    .forEach(value => addOption(kindSelect, value, kindLabel(value)));
  addOption(categorySelect, "all", "Semua kategori");
  [...new Set(DATA.map(record => text(record.item.category)).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "id-ID"))
    .forEach(value => addOption(categorySelect, value, value));
  addOption(sortSelect, "newest", "Terbaru");
  addOption(sortSelect, "oldest", "Terlama");
  addOption(sortSelect, "title", "Judul A–Z");
  q(".live-news-toolbar")?.insertAdjacentElement("afterend", controls);

  const sourceCount = new Set(DATA.map(record => safeHttpsUrl(record.item.sourceUrl)).filter(Boolean)).size;
  const introTitle = q("#live-news-title");
  const introText = q(".live-news-intro .lede");
  const trust = q(".live-news-trust");
  const disclaimer = q(".live-news-disclaimer");
  const searchLabel = q(".live-news-search .sr-only");
  if (introTitle) introTitle.textContent = "Wawasan faktual dari sumber resmi dalam satu ruang baca.";
  if (introText) introText.textContent = `${DATA.length.toLocaleString("id-ID")} artikel merangkum informasi dari ${sourceCount.toLocaleString("id-ID")} sumber resmi atau primer yang ditautkan agar pembaca dapat memeriksa konteks aslinya.`;
  if (trust) {
    const heading = document.createElement("strong");
    heading.textContent = "Standar editorial";
    trust.replaceChildren(
      heading,
      document.createTextNode("Setiap ringkasan mencantumkan penerbit, status pemeriksaan, batas penggunaan, dan tautan HTTPS ke sumber asli.")
    );
  }
  if (disclaimer) disclaimer.textContent = "Ringkasan ini membantu orientasi awal dan tidak menggantikan sumber asli, nasihat profesional, atau pemeriksaan ketentuan terbaru yang berlaku untuk kasus Anda.";
  if (search) {
    search.placeholder = "Cari judul, topik, sumber, atau kata kunci...";
    search.setAttribute("aria-label", "Cari artikel faktual");
  }
  if (searchLabel) searchLabel.textContent = "Cari artikel faktual";
  if (progress) progress.setAttribute("aria-label", "Progres pemuatan artikel faktual");

  let visible = PAGE_SIZE;
  let selectedKind = "all";
  let selectedCategory = "all";
  let selectedSort = "newest";
  let renderedCount = 0;
  let renderKey = "";

  const filteredItems = () => {
    const needle = normalise(search?.value);
    const filtered = DATA.filter(record => (
      (selectedKind === "all" || text(record.item.kind) === selectedKind)
      && (selectedCategory === "all" || text(record.item.category) === selectedCategory)
      && (!needle || record.searchText.includes(needle))
    ));
    return [...filtered].sort((left, right) => {
      if (selectedSort === "title") return text(left.item.title).localeCompare(text(right.item.title), "id-ID");
      const dateDifference = timestamp(left.item) - timestamp(right.item);
      const orderedDate = selectedSort === "oldest" ? dateDifference : -dateDifference;
      return orderedDate || text(left.item.title).localeCompare(text(right.item.title), "id-ID");
    });
  };

  const createCard = (item, index) => {
    const article = document.createElement("article");
    article.className = "live-news-card";
    article.dataset.kind = text(item.kind) || "article";

    const figure = document.createElement("figure");
    figure.className = "live-news-visual";
    figure.dataset.seq = String(index + 1).padStart(2, "0");
    figure.dataset.category = text(item.category) || "Wawasan";
    const disclosure = text(item.imageCaption) || imageDisclosure(item.category);
    const image = document.createElement("img");
    image.src = imageFor(item);
    image.alt = text(item.imageAlt) || disclosure;
    image.loading = index < 4 ? "eager" : "lazy";
    image.decoding = "async";
    image.width = 1200;
    image.height = 675;
    image.addEventListener("error", () => {
      if (!image.src.endsWith("/assets/corporate-home-v16.webp")) image.src = "assets/corporate-home-v16.webp";
    }, { once: true });
    const caption = document.createElement("figcaption");
    caption.textContent = disclosure;
    figure.append(image, caption);

    const body = document.createElement("div");
    body.className = "live-news-card-body";
    const meta = document.createElement("div");
    meta.className = "live-news-source";
    const category = document.createElement("b");
    category.textContent = text(item.category) || "Wawasan";
    const sourceReviewed = isSourceReviewed(item);
    const badge = document.createElement("span");
    badge.className = `news-kind-badge ${sourceReviewed ? "is-news" : "is-trend"}`;
    badge.textContent = sourceReviewed
      ? (text(item.statusLabel) || "Sumber diperiksa")
      : "Pemeriksaan belum lengkap";
    const date = document.createElement("span");
    date.textContent = `${formatDate(item)} · ${readingLabel(item)}`;
    const source = document.createElement("span");
    source.textContent = `Sumber: ${text(item.sourceName) || "belum dicatat"}`;
    const reviewed = document.createElement("span");
    reviewed.textContent = text(item.sourceDate) || "Tanggal pemeriksaan belum dicatat";
    meta.append(category, badge, date, source, reviewed);

    const heading = document.createElement("h3");
    heading.textContent = text(item.title);
    const summary = document.createElement("p");
    summary.textContent = text(item.summary);
    const link = document.createElement("a");
    link.href = `berita-detail.html?id=${encodeURIComponent(text(item.id))}`;
    link.textContent = "Baca artikel lengkap →";
    link.setAttribute("aria-label", `Baca artikel lengkap: ${text(item.title)}`);
    body.append(meta, heading, summary, link);
    article.append(figure, body);
    return article;
  };

  const render = (append = false) => {
    const matches = filteredItems();
    const shown = matches.slice(0, visible);
    const key = [selectedKind, selectedCategory, selectedSort, normalise(search?.value)].join("|");
    const canAppend = append && key === renderKey && shown.length >= renderedCount;
    if (!canAppend) {
      grid.replaceChildren();
      renderedCount = 0;
    }

    if (!shown.length) {
      const empty = document.createElement("div");
      empty.className = "live-news-empty";
      empty.textContent = DATA.length
        ? "Tidak ada artikel yang cocok. Coba kata kunci atau filter lain."
        : "Data artikel belum tersedia. Muat ulang halaman atau coba kembali nanti.";
      grid.append(empty);
    } else if (shown.length > renderedCount) {
      const fragment = document.createDocumentFragment();
      shown.slice(renderedCount).forEach((record, index) => {
        fragment.append(createCard(record.item, renderedCount + index));
      });
      grid.append(fragment);
    }

    renderedCount = shown.length;
    renderKey = key;
    if (total) total.textContent = `${DATA.length.toLocaleString("id-ID")} artikel faktual`;
    if (extraMeta) extraMeta.textContent = `${sourceCount.toLocaleString("id-ID")} sumber resmi`;
    if (state) {
      state.textContent = DATA.length ? "Sumber resmi diperiksa" : "Data belum tersedia";
      state.classList.remove("is-loading");
      state.classList.toggle("is-local", Boolean(DATA.length));
    }
    if (status) status.textContent = `Menampilkan ${shown.length.toLocaleString("id-ID")} dari ${matches.length.toLocaleString("id-ID")} artikel yang cocok; ${DATA.length.toLocaleString("id-ID")} artikel tersedia.`;
    if (progress) progress.value = DATA.length ? 100 : 0;
    if (more) {
      const remaining = Math.max(0, matches.length - shown.length);
      more.hidden = remaining === 0;
      more.textContent = `Muat ${Math.min(PAGE_SIZE, remaining).toLocaleString("id-ID")} artikel lagi (${remaining.toLocaleString("id-ID")} tersisa)`;
    }
    if (retry) retry.textContent = "Reset pencarian dan filter";
  };

  let searchTimer = 0;
  search?.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => {
      visible = PAGE_SIZE;
      render();
    }, 120);
  });
  more?.addEventListener("click", () => {
    visible += PAGE_SIZE;
    render(true);
  });
  retry?.addEventListener("click", () => {
    visible = PAGE_SIZE;
    selectedKind = "all";
    selectedCategory = "all";
    selectedSort = "newest";
    if (search) search.value = "";
    kindSelect.value = "all";
    categorySelect.value = "all";
    sortSelect.value = "newest";
    render();
    search?.focus({ preventScroll: true });
  });
  kindSelect.addEventListener("change", event => {
    selectedKind = event.currentTarget.value;
    visible = PAGE_SIZE;
    render();
  });
  categorySelect.addEventListener("change", event => {
    selectedCategory = event.currentTarget.value;
    visible = PAGE_SIZE;
    render();
  });
  sortSelect.addEventListener("change", event => {
    selectedSort = event.currentTarget.value;
    visible = PAGE_SIZE;
    render();
  });

  render();
})();
