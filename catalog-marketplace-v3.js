(() => {
  "use strict";
  const dataNode = document.getElementById("ptd-market-data");
  const catalog = document.querySelector("[data-market-catalog]");
  const detail = document.getElementById("ptd-market-detail");
  if (!dataNode || !catalog || !detail) return;

  let payload;
  try { payload = JSON.parse(dataNode.textContent || "{}"); } catch (_) { return; }
  const products = Array.isArray(payload.products) ? payload.products : [];
  const productMap = Object.fromEntries(products.map((product) => [String(product.code), product]));
  const originalTitle = document.title;
  const grid = catalog.querySelector("[data-market-grid]");
  const cards = grid ? Array.from(grid.querySelectorAll("[data-market-card]")) : [];
  const search = catalog.querySelector("[data-market-search]");
  const status = catalog.querySelector("[data-market-status]");
  const brand = catalog.querySelector("[data-market-brand]");
  const price = catalog.querySelector("[data-market-price]");
  const sort = catalog.querySelector("[data-market-sort]");
  const reset = catalog.querySelector("[data-market-reset]");
  const count = catalog.querySelector("[data-market-count]");
  const empty = catalog.querySelector("[data-market-empty]");

  const clean = (value) => String(value == null ? "" : value).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const money = (value) => new Intl.NumberFormat("id-ID", { style:"currency", currency:"IDR", maximumFractionDigits:0 }).format(Number(value || 0));
  const el = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text != null) node.textContent = String(text); return node; };

  const priceMatch = (amount, bucket) => {
    if (!bucket || bucket === "all") return true;
    const n = Number(amount || 0);
    if (bucket === "under500") return n < 500000;
    if (bucket === "500to1500") return n >= 500000 && n <= 1500000;
    if (bucket === "1500to3000") return n > 1500000 && n <= 3000000;
    if (bucket === "over3000") return n > 3000000;
    return true;
  };

  const applyFilters = () => {
    if (!grid) return;
    const q = clean(search && search.value);
    const statusValue = String(status && status.value || "all");
    const brandValue = String(brand && brand.value || "all");
    const priceValue = String(price && price.value || "all");
    const sortValue = String(sort && sort.value || "default");
    const visible = cards.filter((card) => {
      if (card.dataset.mainImageHydrated !== "1") {
        const media = card.querySelector(".ptd-static-product-media");
        const remote = mainAssetUrl(card.dataset.sourceImage);
        if (media && remote) media.style.backgroundImage = cssImageStack(remote, "");
        card.dataset.mainImageHydrated = "1";
      }
      const matchesQuery = !q || clean(card.dataset.search).includes(q);
      const matchesStatus = statusValue === "all" || card.dataset.status === statusValue;
      const matchesBrand = brandValue === "all" || card.dataset.brand === brandValue;
      const matchesPrice = priceMatch(card.dataset.price, priceValue);
      const on = matchesQuery && matchesStatus && matchesBrand && matchesPrice;
      card.hidden = !on;
      return on;
    });
    const ordered = visible.slice().sort((a,b) => {
      if (sortValue === "price-asc") return Number(a.dataset.price) - Number(b.dataset.price);
      if (sortValue === "price-desc") return Number(b.dataset.price) - Number(a.dataset.price);
      if (sortValue === "name") return String(a.dataset.name).localeCompare(String(b.dataset.name), "id");
      return Number(a.dataset.order) - Number(b.dataset.order);
    });
    ordered.forEach((card) => grid.append(card));
    if (count) count.textContent = `${visible.length} dari ${cards.length} produk`;
    if (empty) empty.hidden = visible.length !== 0;
  };

  const resetFilters = () => {
    if (search) search.value = "";
    if (status) status.value = "all";
    if (brand) brand.value = "all";
    if (price) price.value = "all";
    if (sort) sort.value = "default";
    applyFilters();
  };

  const deriveBase = () => {
    const host = String(location.hostname || "").toLowerCase().replace(/\.$/, "");
    if (!host || host === "localhost" || /^(?:\d{1,3}\.){3}\d{1,3}$/.test(host) || host.includes(":")) return "";
    const roles = new Set(["auth","panel","order","shop","security","project","api","www","cs","dev","pt","cv","secure","parfum"]);
    const parts = host.split(".");
    if (parts.length > 2 && roles.has(parts[0])) parts.shift();
    return parts.join(".");
  };

  const shopUrl = () => {
    const base = deriveBase();
    if (!base) return `${location.origin}/parfum.html`;
    return `https://shop.${base}/parfum.html`;
  };

  const sourceImageFile = (value) => {
    const file = String(value || "").trim();
    return /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}\.(?:webp|png|jpe?g|avif)$/i.test(file) ? file : "";
  };

  const mainAssetUrl = (value) => {
    const file = sourceImageFile(typeof value === "object" && value ? value.img : value);
    if (!file) return "";
    const base = deriveBase();
    if (!base) return new URL(`/${file}`, location.origin).href;
    return `https://${base}/${file}`;
  };

  const cssImageStack = (primary, fallback) => {
    const first = String(primary || "").replace(/["\\]/g, "");
    const second = String(fallback || "").replace(/["\\]/g, "");
    if (first && second) return `url("${first}"),url("${second}")`;
    if (first) return `url("${first}")`;
    if (second) return `url("${second}")`;
    return "none";
  };

  const makeSpecRow = (label, value) => {
    const tr = document.createElement("tr");
    const th = el("th", "", label); th.scope = "row";
    const td = el("td", "", value);
    tr.append(th, td);
    return tr;
  };

  const makeRelated = (product) => {
    const link = el("a", "ptd-market-related-card");
    link.href = `#produk-${product.code}`;
    link.setAttribute("aria-label", `Lihat ${product.title}`);
    const media = el("div", "ptd-market-related-media");
    media.setAttribute("role", "img");
    media.setAttribute("aria-label", `Visual katalog ${product.title}`);
    media.style.backgroundImage = cssImageStack(mainAssetUrl(product), "");
    const copy = el("div", "ptd-market-related-copy");
    copy.append(el("p", "ptd-market-related-category", product.category), el("strong", "", product.title), el("span", "ptd-market-related-price", money(product.price)));
    link.append(media, copy);
    return link;
  };

  const renderSchema = (product) => {
    const schema = document.getElementById("ptd-active-product-schema");
    if (!schema) return;
    const obj = {
      "@context":"https://schema.org",
      "@type":"Product",
      name:product.title,
      category:product.category,
      description:product.longDesc || product.desc || product.notes || product.title,
      image:mainAssetUrl(product) || product.visual,
      sku:product.code,
      offers:{"@type":"Offer",priceCurrency:"IDR",price:String(product.price),url:location.href}
    };
    if (product.brand) obj.brand = {"@type":"Brand",name:product.brand};
    schema.textContent = JSON.stringify(obj);
  };

  const openProduct = (code) => {
    const product = productMap[String(code)];
    if (!product) return false;
    detail.hidden = false;
    document.body.classList.add("ptd-market-open");
    detail.scrollTop = 0;
    const setText = (selector, value) => { const node = detail.querySelector(selector); if (node) node.textContent = value || ""; };
    setText("[data-detail-breadcrumb-name]", product.title);
    setText("[data-detail-category]", product.category);
    setText("[data-detail-status]", product.statusLabel);
    setText("[data-detail-title]", product.title);
    setText("[data-detail-brandline]", product.brand ? `Merek: ${product.brand}` : "");
    setText("[data-detail-notes]", product.notes ? `Karakter aroma: ${product.notes}` : "Karakter aroma tidak dicantumkan pada data sumber.");
    setText("[data-detail-price]", money(product.price));
    setText("[data-detail-meta]", `Kode katalog ${product.code} · stok sumber ${product.stock}`);
    setText("[data-detail-shortdesc]", product.desc || "Detail singkat tidak dicantumkan pada data sumber.");
    setText("[data-detail-description]", product.longDesc || product.desc || "Deskripsi panjang tidak dicantumkan pada data sumber.");
    const statusBadge = detail.querySelector("[data-detail-status]");
    if (statusBadge) statusBadge.className = `ptd-market-badge ${product.status === "sold" ? "sold" : "ready"}`;
    const image = detail.querySelector("[data-detail-image]");
    if (image) {
      const remoteImage = mainAssetUrl(product);
      image.onerror = remoteImage && product.visual ? () => { image.onerror = null; image.src = product.visual; } : null;
      image.src = remoteImage || product.visual;
      image.alt = `Foto produk ${product.title}`;
    }
    const website = detail.querySelector("[data-detail-website]");
    if (website) website.href = shopUrl();
    const wa = detail.querySelector("[data-detail-wa]");
    if (wa) wa.href = `https://wa.me/6287892523968?text=${encodeURIComponent(`Halo PT DIRAC INOVASI NUSANTARA, saya ingin menanyakan produk ${product.title} (kode ${product.code}).`)}`;
    const backLinks = detail.querySelectorAll("[data-detail-back]");
    backLinks.forEach((link) => link.href = `#katalog-produk-${payload.slug}`);
    const specs = [
      ["Nama produk", product.title],
      ["Kategori", product.category],
      ["Merek", product.brand],
      ["Ukuran / format", product.size],
      ["Konsentrasi / tipe", product.concentration],
      ["Target penggunaan", product.target],
      ["Karakter aroma", product.notes],
      ["Harga katalog", money(product.price)],
      ["Status katalog sumber", product.statusLabel],
      ["Nilai stok pada data sumber", String(product.stock)],
      ["Kode katalog", product.code]
    ].filter((row) => row[1]);
    const tbody = detail.querySelector("[data-detail-spec]");
    if (tbody) tbody.replaceChildren(...specs.map((row) => makeSpecRow(row[0], row[1])));
    const related = detail.querySelector("[data-detail-related]");
    if (related) related.replaceChildren(...product.related.map((id) => productMap[id]).filter(Boolean).map(makeRelated));
    const allLink = detail.querySelector("[data-detail-all]");
    if (allLink) { allLink.href = `#katalog-produk-${payload.slug}`; allLink.textContent = `Lihat semua ${products.length} produk →`; }
    document.title = `${product.title} | PT DIRAC INOVASI NUSANTARA`;
    renderSchema(product);
    const title = detail.querySelector("[data-detail-title]");
    if (title) title.focus({preventScroll:true});
    return true;
  };

  const closeProduct = () => {
    if (detail.hidden) return;
    detail.hidden = true;
    document.body.classList.remove("ptd-market-open");
    document.title = originalTitle;
    const schema = document.getElementById("ptd-active-product-schema");
    if (schema) schema.textContent = "{}";
  };

  const syncRoute = () => {
    const match = String(location.hash || "").match(/^#(?:produk|detail)-(\d{3,4})$/i);
    if (match && openProduct(match[1])) return;
    closeProduct();
  };

  const productCodeFromLink = (link) => {
    const match = String(link && link.getAttribute("href") || "").match(/^#produk-(\d{3,4})$/i);
    return match ? match[1] : "";
  };

  catalog.addEventListener("click", (event) => {
    const link = event.target && event.target.closest ? event.target.closest("a.ptd-static-product-link") : null;
    if (!link || !catalog.contains(link)) return;
    const code = productCodeFromLink(link);
    if (!code || !productMap[code]) return;
    event.preventDefault();
    openProduct(code);
  }, true);

  detail.addEventListener("click", (event) => {
    const target = event.target && event.target.closest ? event.target.closest("a") : null;
    if (!target || !detail.contains(target)) return;
    if (target.matches("[data-detail-back],[data-detail-all]")) {
      event.preventDefault();
      closeProduct();
      catalog.scrollIntoView({block:"start"});
      return;
    }
    if (!target.classList.contains("ptd-market-related-card")) return;
    const code = productCodeFromLink(target);
    if (!code || !productMap[code]) return;
    event.preventDefault();
    openProduct(code);
  }, true);

  search && search.addEventListener("input", applyFilters);
  status && status.addEventListener("change", applyFilters);
  brand && brand.addEventListener("change", applyFilters);
  price && price.addEventListener("change", applyFilters);
  sort && sort.addEventListener("change", applyFilters);
  reset && reset.addEventListener("click", resetFilters);
  window.addEventListener("hashchange", syncRoute);
  applyFilters();
  syncRoute();
})();
