(() => {
  "use strict";

  const DATA = Array.isArray(globalThis.DigdayaNewsData) ? globalThis.DigdayaNewsData : [];
  const q = selector => document.querySelector(selector);
  if (!DATA.length) return;

  const id = new URLSearchParams(location.search).get("id") || "";
  const index = id ? DATA.findIndex(item => item.id === id) : 0;
  if (id && index < 0) {
    document.title = "Catatan tidak ditemukan | Digdaya Newsroom";
    q("[data-detail-title]").textContent = "Catatan tidak ditemukan.";
    q("[data-detail-category]").textContent = "Wawasan";
    q("[data-detail-time]").textContent = "";
    q("[data-detail-source]").textContent = "";
    q("[data-detail-excerpt]").textContent = "Tautan ini tidak cocok dengan catatan lokal yang tersedia. Kembali ke indeks newsroom untuk memilih catatan lain.";
    q("[data-detail-image]")?.closest("figure")?.setAttribute("hidden", "");
    q("[data-detail-share]")?.setAttribute("hidden", "");
    q("[data-detail-copy]")?.setAttribute("hidden", "");
    document.documentElement.dataset.newsDetail = "not-found";
    return;
  }

  const item = DATA[Math.max(0, index)];
  const visualPools = {
    Olahraga: "olahraga", Pendidikan: "pendidikan", Pariwisata: "pariwisata",
    Digital: "digital", Fragrance: "fragrance", Humaniora: "budaya",
    Nasional: "nasional", Lingkungan: "lingkungan", Ekonomi: "ekonomi",
    Bisnis: "bisnis", Daerah: "nasional", Pembangunan: "ekonomi",
    Budaya: "budaya", Energi: "ekonomi", Kesehatan: "kesehatan",
    Teknologi: "teknologi", Internasional: "nasional", Hiburan: "budaya"
  };
  const hash = value => Array.from(String(value)).reduce((sum, char) => ((sum << 5) - sum + char.charCodeAt(0)) | 0, 0);
  const imageFor = value => {
    const pool = visualPools[value.category] || "nasional";
    const imageIndex = Math.abs(hash(`${value.category}|${value.id}`)) % 3 + 1;
    return `assets/news-${pool}-${imageIndex}.webp`;
  };
  const imageDisclosure = category => `Ilustrasi kategori ${category}; bukan dokumentasi peristiwa.`;
  const formatStoredDate = value => {
    if (!value.date) return "Tanggal tidak tersedia";
    try {
      const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value.date);
      const formatted = new Intl.DateTimeFormat("id-ID", dateOnly
        ? { dateStyle: "long", timeZone: "Asia/Jakarta" }
        : { dateStyle: "full", timeStyle: "short", timeZone: "Asia/Jakarta" }
      ).format(new Date(value.date));
      return `${formatted}${dateOnly ? "" : " WIB"} — ${value.dateSemantics}`;
    } catch {
      return `${value.date} — ${value.dateSemantics}`;
    }
  };
  const setMeta = (selector, content) => {
    const element = q(selector);
    if (element) element.setAttribute("content", content);
  };

  const relativeUrl = `berita-detail.html?id=${encodeURIComponent(item.id)}`;
  let canonicalUrl = relativeUrl;
  let imageUrl = imageFor(item);
  try {
    canonicalUrl = new URL(relativeUrl, location.href).href;
    imageUrl = new URL(imageFor(item), location.href).href;
  } catch { /* Relative URLs remain valid for local previews. */ }

  q("[data-detail-title]").textContent = item.title;
  q("[data-detail-category]").textContent = item.statusLabel;
  q("[data-detail-time]").textContent = formatStoredDate(item);
  q("[data-detail-source]").textContent = `Asal data: ${item.sourceName}`;
  q("[data-detail-excerpt]").textContent = item.summary;
  q(".breadcrumb [aria-current='page']")?.replaceChildren(document.createTextNode(item.title));

  const image = q("[data-detail-image]");
  if (image) {
    const disclosure = imageDisclosure(item.category);
    image.src = imageFor(item);
    image.alt = disclosure;
    const figure = image.closest("figure");
    if (figure && !figure.querySelector("figcaption")) {
      const caption = document.createElement("figcaption");
      caption.textContent = disclosure;
      figure.append(caption);
    }
  }

  document.title = `${item.title} | Catatan Newsroom Digdaya`;
  const description = item.summary.slice(0, 155);
  setMeta('meta[name="description"]', description);
  setMeta('meta[property="og:type"]', "website");
  setMeta('meta[property="og:title"]', item.title);
  setMeta('meta[property="og:description"]', description);
  setMeta('meta[property="og:url"]', canonicalUrl);
  setMeta('meta[property="og:image"]', imageUrl);
  setMeta('meta[property="og:image:alt"]', imageDisclosure(item.category));
  setMeta('meta[name="twitter:title"]', item.title);
  setMeta('meta[name="twitter:description"]', description);
  setMeta('meta[name="twitter:image"]', imageUrl);
  setMeta('meta[name="twitter:image:alt"]', imageDisclosure(item.category));
  const canonical = q('link[rel="canonical"]');
  if (canonical) canonical.href = canonicalUrl;

  const structuredData = q("#seo-structured-data");
  if (structuredData) {
    structuredData.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${canonicalUrl}#webpage`,
          url: canonicalUrl,
          name: item.title,
          description,
          inLanguage: "id-ID",
          isPartOf: { "@id": "https://panel.diracgroup.store/#website" },
          about: { "@id": "https://panel.diracgroup.store/#organization" },
          primaryImageOfPage: {
            "@type": "ImageObject",
            url: imageUrl,
            caption: imageDisclosure(item.category)
          },
          mainEntity: {
            "@type": "CreativeWork",
            name: item.title,
            description: item.summary,
            genre: item.statusLabel,
            usageInfo: item.usageLimit
          }
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Beranda", item: "https://panel.diracgroup.store/" },
            { "@type": "ListItem", position: 2, name: "Berita & Wawasan", item: "https://panel.diracgroup.store/berita.html" },
            { "@type": "ListItem", position: 3, name: item.title, item: canonicalUrl }
          ]
        }
      ]
    });
  }

  const main = q(".news-detail-main");
  const analysis = document.createElement("section");
  analysis.className = "news-detail-analysis";
  analysis.setAttribute("aria-label", "Status, batas penggunaan, dan langkah pemeriksaan");
  const addTextBlock = (headingText, value) => {
    const article = document.createElement("article");
    const heading = document.createElement("h2");
    heading.textContent = headingText;
    const paragraph = document.createElement("p");
    paragraph.textContent = value;
    article.append(heading, paragraph);
    analysis.append(article);
  };
  addTextBlock("Status", item.statusLabel);
  addTextBlock("Batas penggunaan", item.usageLimit);
  const stepsArticle = document.createElement("article");
  const stepsHeading = document.createElement("h2");
  stepsHeading.textContent = "Langkah pemeriksaan";
  const stepsList = document.createElement("ul");
  (item.verificationSteps || []).forEach(step => {
    const row = document.createElement("li");
    row.textContent = step;
    stepsList.append(row);
  });
  stepsArticle.append(stepsHeading, stepsList);
  analysis.append(stepsArticle);
  addTextBlock("Asal-usul data", item.provenance);
  main.append(analysis);

  const integrity = q(".news-detail-integrity");
  if (integrity) {
    integrity.replaceChildren();
    const strong = document.createElement("strong");
    strong.textContent = `${item.statusLabel}. `;
    integrity.append(strong, document.createTextNode("Catatan ini tidak berstatus berita terverifikasi dan tidak menyertakan artikel sumber."));
  }

  const related = DATA
    .filter(candidate => candidate.id !== item.id && candidate.category === item.category)
    .sort((a, b) => Date.parse(b.date || "") - Date.parse(a.date || "") || a.title.localeCompare(b.title, "id"))
    .slice(0, 4);
  const relatedBox = document.createElement("section");
  relatedBox.className = "news-detail-related";
  const relatedHeading = document.createElement("h2");
  relatedHeading.textContent = "Catatan terkait";
  const relatedList = document.createElement("div");
  relatedList.className = "news-detail-related-list";
  related.forEach(candidate => {
    const link = document.createElement("a");
    link.href = `berita-detail.html?id=${encodeURIComponent(candidate.id)}`;
    const label = document.createElement("span");
    label.textContent = candidate.statusLabel;
    const title = document.createElement("strong");
    title.textContent = candidate.title;
    link.append(label, title);
    relatedList.append(link);
  });
  relatedBox.append(relatedHeading, relatedList);
  main.append(relatedBox);

  const nav = document.createElement("nav");
  nav.className = "news-detail-nav";
  nav.setAttribute("aria-label", "Catatan sebelumnya dan berikutnya");
  const previous = DATA[index - 1];
  const next = DATA[index + 1];
  if (previous) {
    const link = document.createElement("a");
    link.className = "button button-ghost";
    link.href = `berita-detail.html?id=${encodeURIComponent(previous.id)}`;
    link.textContent = "← Sebelumnya";
    nav.append(link);
  }
  if (next) {
    const link = document.createElement("a");
    link.className = "button button-ghost";
    link.href = `berita-detail.html?id=${encodeURIComponent(next.id)}`;
    link.textContent = "Berikutnya →";
    nav.append(link);
  }
  main.append(nav);

  q("[data-detail-share]")?.addEventListener("click", async event => {
    try {
      if (navigator.share) await navigator.share({ title: item.title, text: item.summary, url: location.href });
      else {
        await navigator.clipboard.writeText(location.href);
        event.currentTarget.textContent = "Tautan disalin";
      }
    } catch {
      event.currentTarget.textContent = "Bagikan dari browser";
    }
  });
  q("[data-detail-copy]")?.addEventListener("click", async event => {
    try {
      await navigator.clipboard.writeText(location.href);
      event.currentTarget.textContent = "Tautan tersalin";
    } catch {
      event.currentTarget.textContent = "Salin dari bilah alamat";
    }
  });
})();
