(() => {
  "use strict";

  const html = document.documentElement;
  if (html.dataset.newsDetailRuntime === "v21") return;

  const q = selector => document.querySelector(selector);
  const main = q(".news-detail-main");
  if (!main) return;

  html.dataset.newsDetailRuntime = "v21";

  const PUBLIC_BASE = "https://panel.diracgroup.store/";
  const text = value => String(value ?? "").trim();
  const list = value => Array.isArray(value) ? value : [];
  const safeHttpsUrl = value => {
    try {
      const url = new URL(text(value));
      if (url.protocol !== "https:" || !url.hostname || url.username || url.password) return "";
      return url.href;
    } catch {
      return "";
    }
  };
  const setText = (selector, value) => {
    const element = q(selector);
    if (element) element.textContent = text(value);
  };
  const timestamp = item => {
    const value = Date.parse(text(item?.date));
    return Number.isFinite(value) ? value : 0;
  };
  const compareNewest = (left, right) => (
    timestamp(right) - timestamp(left)
    || text(left.title).localeCompare(text(right.title), "id-ID")
  );
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
    const minutes = Number.parseInt(item?.readingMinutes, 10);
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
  const shorten = (value, limit = 155) => {
    const clean = text(value).replace(/\s+/g, " ");
    if (clean.length <= limit) return clean;
    const clipped = clean.slice(0, Math.max(1, limit - 1)).replace(/\s+\S*$/, "").trim();
    return `${clipped || clean.slice(0, limit - 1)}…`;
  };
  const upsertMeta = (attribute, key, content) => {
    let element = [...document.head.querySelectorAll("meta")]
      .find(meta => meta.getAttribute(attribute) === key);
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute(attribute, key);
      document.head.append(element);
    }
    element.setAttribute("content", text(content));
  };
  const configureExternalLink = (anchor, href) => {
    anchor.href = href;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer external";
    anchor.referrerPolicy = "strict-origin-when-cross-origin";
  };

  const rawData = Array.isArray(globalThis.DigdayaNewsData) ? globalThis.DigdayaNewsData : [];
  const seenIds = new Set();
  const DATA = rawData.filter(item => {
    const id = text(item?.id);
    const valid = Boolean(id && text(item?.title) && !seenIds.has(id));
    if (valid) seenIds.add(id);
    return valid;
  });
  const ordered = [...DATA].sort(compareNewest);

  main.querySelectorAll("[data-news-runtime-generated], .news-detail-analysis, .news-detail-related, .news-detail-nav")
    .forEach(element => element.remove());

  const showUnavailable = message => {
    document.title = "Artikel tidak ditemukan | Digdaya";
    setText("[data-detail-title]", "Artikel tidak ditemukan.");
    setText("[data-detail-category]", "Berita & Wawasan");
    setText("[data-detail-time]", "");
    setText("[data-detail-source]", "");
    setText("[data-detail-excerpt]", message);
    q("[data-detail-image]")?.closest("figure")?.setAttribute("hidden", "");
    q("[data-detail-share]")?.setAttribute("hidden", "");
    q("[data-detail-copy]")?.setAttribute("hidden", "");
    html.dataset.newsDetail = "not-found";
    delete html.dataset.newsDetailId;
    const structuredData = q("#seo-structured-data");
    if (structuredData) {
      structuredData.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Artikel tidak ditemukan",
        url: new URL("berita-detail.html", PUBLIC_BASE).href,
        inLanguage: "id-ID"
      });
    }
  };

  if (!ordered.length) {
    showUnavailable("Data artikel belum tersedia. Kembali ke newsroom atau muat ulang halaman untuk mencoba lagi.");
    return;
  }

  const requestedId = text(new URLSearchParams(location.search).get("id"));
  const item = requestedId ? DATA.find(candidate => text(candidate.id) === requestedId) : ordered[0];
  if (!item) {
    showUnavailable("Tautan ini tidak cocok dengan artikel yang tersedia. Kembali ke newsroom untuk memilih artikel lain.");
    return;
  }

  html.dataset.newsDetailId = text(item.id);

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
  const imageFor = value => {
    const supplied = text(value.image);
    if (/^assets\/[a-z0-9][a-z0-9._/-]*\.(?:avif|jpe?g|png|webp)$/i.test(supplied) && !supplied.includes("..")) {
      return supplied;
    }
    const pool = visualPools[text(value.category)] || "bisnis";
    const index = Math.abs(hash(`${text(value.category)}|${text(value.id)}`)) % 3 + 1;
    return `assets/news-${pool}-${index}.webp`;
  };
  const imageDisclosure = category => `Ilustrasi editorial untuk topik ${text(category) || "wawasan"}; bukan dokumentasi sumber.`;
  const sourceHref = safeHttpsUrl(item.sourceUrl);
  const relativeUrl = `berita-detail.html?id=${encodeURIComponent(text(item.id))}`;
  const canonicalUrl = new URL(relativeUrl, PUBLIC_BASE).href;
  const imagePath = imageFor(item);
  const imageUrl = new URL(imagePath, PUBLIC_BASE).href;
  const disclosure = text(item.imageCaption) || imageDisclosure(item.category);
  const description = shorten(item.summary);

  setText("[data-detail-title]", item.title);
  setText("[data-detail-category]", `${text(item.category) || "Wawasan"} · ${text(item.statusLabel) || "Status pemeriksaan tersedia di bawah"}`);
  setText("[data-detail-time]", `${formatDate(item)} · ${readingLabel(item)}`);
  setText("[data-detail-excerpt]", item.summary);
  setText("#detail-summary-title", "Ringkasan artikel");
  const breadcrumbCurrent = q(".breadcrumb [aria-current='page']");
  if (breadcrumbCurrent) breadcrumbCurrent.textContent = text(item.title);

  const sourceMeta = q("[data-detail-source]");
  if (sourceMeta) {
    sourceMeta.replaceChildren();
    sourceMeta.classList.toggle("has-source", Boolean(sourceHref));
    sourceMeta.classList.toggle("is-source-missing", !sourceHref);
    if (sourceHref) {
      const sourceLink = document.createElement("a");
      configureExternalLink(sourceLink, sourceHref);
      sourceLink.textContent = text(item.sourceName) || "Buka sumber resmi";
      sourceLink.setAttribute("aria-label", `Buka sumber asli: ${text(item.sourceName) || text(item.title)}`);
      sourceMeta.append(document.createTextNode("Sumber: "), sourceLink);
    } else {
      sourceMeta.textContent = `Sumber: ${text(item.sourceName) || "belum tersedia"}`;
    }
  }

  const image = q("[data-detail-image]");
  if (image) {
    image.src = imagePath;
    image.dataset.originalSrc = imagePath;
    image.alt = text(item.imageAlt) || disclosure;
    image.loading = "eager";
    image.decoding = "async";
    image.width = 1200;
    image.height = 675;
    image.addEventListener("error", () => {
      image.src = "assets/corporate-home-v16.webp";
      image.dataset.originalSrc = "assets/corporate-home-v16.webp";
    }, { once: true });
    const figure = image.closest("figure");
    if (figure) {
      figure.removeAttribute("hidden");
      figure.classList.remove("is-trend");
      let caption = figure.querySelector("figcaption");
      if (!caption) {
        caption = document.createElement("figcaption");
        figure.append(caption);
      }
      caption.textContent = disclosure;
    }
    const aside = image.closest("aside");
    aside?.setAttribute("aria-label", disclosure);
  }

  const content = document.createElement("div");
  content.className = "news-detail-article";
  content.setAttribute("data-news-runtime-generated", "article-content");
  content.setAttribute("aria-label", "Isi lengkap artikel");

  const createContentBlock = headingText => {
    const block = document.createElement("section");
    block.className = "news-detail-summary";
    const heading = document.createElement("h2");
    heading.textContent = headingText;
    block.append(heading);
    return block;
  };
  const appendTextList = (host, values) => {
    const cleanValues = list(values).map(text).filter(Boolean);
    if (!cleanValues.length) return;
    const rows = document.createElement("ul");
    cleanValues.forEach(value => {
      const row = document.createElement("li");
      row.textContent = value;
      rows.append(row);
    });
    host.append(rows);
  };

  const takeaways = list(item.takeaways).map(text).filter(Boolean);
  if (takeaways.length) {
    const takeawayBlock = createContentBlock("Yang perlu diketahui");
    appendTextList(takeawayBlock, takeaways);
    content.append(takeawayBlock);
  }

  list(item.sections).forEach((section, index) => {
    const paragraphs = list(section?.paragraphs).map(text).filter(Boolean);
    const bullets = list(section?.bullets).map(text).filter(Boolean);
    const headingText = text(section?.heading) || `Bagian ${index + 1}`;
    if (!paragraphs.length && !bullets.length) return;
    const block = createContentBlock(headingText);
    paragraphs.forEach(value => {
      const paragraph = document.createElement("p");
      paragraph.textContent = value;
      block.append(paragraph);
    });
    appendTextList(block, bullets);
    content.append(block);
  });

  const sourceAnalysis = document.createElement("section");
  sourceAnalysis.className = "news-detail-analysis";
  sourceAnalysis.setAttribute("aria-label", "Sumber, pemeriksaan, dan batas penggunaan");
  const addInfoCard = (headingText, value) => {
    if (!text(value)) return null;
    const card = document.createElement("article");
    const heading = document.createElement("h2");
    const paragraph = document.createElement("p");
    heading.textContent = headingText;
    paragraph.textContent = text(value);
    card.append(heading, paragraph);
    sourceAnalysis.append(card);
    return card;
  };

  const sourceCard = addInfoCard("Sumber utama", text(item.sourceName) || "Sumber belum dicatat");
  if (sourceCard && sourceHref) {
    const sourceLink = document.createElement("a");
    configureExternalLink(sourceLink, sourceHref);
    sourceLink.textContent = "Buka sumber asli ↗";
    sourceLink.setAttribute("aria-label", `Buka sumber asli: ${text(item.sourceName) || text(item.title)}`);
    sourceCard.append(sourceLink);
  }
  addInfoCard("Pemeriksaan", text(item.sourceDate) || "Tanggal pemeriksaan belum dicatat");
  addInfoCard("Proses editorial", item.provenance);
  addInfoCard("Batas penggunaan", item.usageLimit);
  if (sourceAnalysis.childElementCount) content.append(sourceAnalysis);

  const integrity = q(".news-detail-integrity");
  const actions = q(".news-detail-actions");
  main.insertBefore(content, integrity || actions || null);
  if (integrity) {
    const strong = document.createElement("strong");
    strong.textContent = `${text(item.statusLabel) || "Status sumber dicatat"}. `;
    const message = sourceHref
      ? "Ringkasan ini merujuk sumber yang ditautkan dan menampilkan waktu pemeriksaannya. Buka sumber asli untuk konteks lengkap serta perubahan terbaru."
      : "Tautan sumber HTTPS belum tersedia; jangan memperlakukan ringkasan ini sebagai pengganti verifikasi mandiri.";
    integrity.replaceChildren(strong, document.createTextNode(message));
  }

  const sameCategory = ordered.filter(candidate => (
    text(candidate.id) !== text(item.id)
    && text(candidate.category) === text(item.category)
  ));
  const otherCategories = ordered.filter(candidate => (
    text(candidate.id) !== text(item.id)
    && text(candidate.category) !== text(item.category)
  ));
  const related = [...sameCategory, ...otherCategories].slice(0, 4);
  if (related.length) {
    const relatedBox = document.createElement("section");
    relatedBox.className = "news-detail-related";
    relatedBox.setAttribute("data-news-runtime-generated", "related");
    relatedBox.setAttribute("aria-labelledby", "news-related-title");
    const heading = document.createElement("h2");
    heading.id = "news-related-title";
    heading.textContent = "Bacaan terkait";
    const relatedList = document.createElement("div");
    relatedList.className = "news-detail-related-list";
    related.forEach(candidate => {
      const link = document.createElement("a");
      link.href = `berita-detail.html?id=${encodeURIComponent(text(candidate.id))}`;
      link.setAttribute("aria-label", `Baca artikel terkait: ${text(candidate.title)}`);
      const meta = document.createElement("span");
      meta.textContent = `${text(candidate.category) || "Wawasan"} · ${formatDate(candidate)}`;
      const title = document.createElement("strong");
      title.textContent = text(candidate.title);
      link.append(meta, title);
      relatedList.append(link);
    });
    relatedBox.append(heading, relatedList);
    main.append(relatedBox);
  }

  const currentIndex = ordered.findIndex(candidate => text(candidate.id) === text(item.id));
  const newer = currentIndex > 0 ? ordered[currentIndex - 1] : null;
  const older = currentIndex >= 0 && currentIndex < ordered.length - 1 ? ordered[currentIndex + 1] : null;
  if (newer || older) {
    const nav = document.createElement("nav");
    nav.className = "news-detail-nav";
    nav.setAttribute("data-news-runtime-generated", "navigation");
    nav.setAttribute("aria-label", "Navigasi artikel sebelumnya dan berikutnya");
    if (newer) {
      const link = document.createElement("a");
      link.className = "button button-ghost";
      link.href = `berita-detail.html?id=${encodeURIComponent(text(newer.id))}`;
      link.textContent = "← Artikel lebih baru";
      link.setAttribute("aria-label", `Artikel lebih baru: ${text(newer.title)}`);
      nav.append(link);
    }
    if (older) {
      const link = document.createElement("a");
      link.className = "button button-ghost";
      link.href = `berita-detail.html?id=${encodeURIComponent(text(older.id))}`;
      link.textContent = "Artikel lebih lama →";
      link.setAttribute("aria-label", `Artikel lebih lama: ${text(older.title)}`);
      nav.append(link);
    }
    main.append(nav);
  }

  document.title = `${text(item.title)} | Wawasan Digdaya`;
  upsertMeta("name", "description", description);
  upsertMeta("property", "og:type", "article");
  upsertMeta("property", "og:title", item.title);
  upsertMeta("property", "og:description", description);
  upsertMeta("property", "og:url", canonicalUrl);
  upsertMeta("property", "og:image", imageUrl);
  upsertMeta("property", "og:image:alt", disclosure);
  upsertMeta("property", "article:section", text(item.category) || "Wawasan");
  const publicationDate = /^\d{4}-\d{2}-\d{2}$/.test(text(item.publishedAt || item.date))
    ? text(item.publishedAt || item.date)
    : undefined;
  const modifiedDate = /^\d{4}-\d{2}-\d{2}$/.test(text(item.reviewedAt))
    ? text(item.reviewedAt)
    : publicationDate;
  upsertMeta("property", "article:published_time", publicationDate || "");
  upsertMeta("property", "article:modified_time", modifiedDate || "");
  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:title", item.title);
  upsertMeta("name", "twitter:description", description);
  upsertMeta("name", "twitter:image", imageUrl);
  upsertMeta("name", "twitter:image:alt", disclosure);
  let canonical = q('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.append(canonical);
  }
  canonical.href = canonicalUrl;

  const articleText = [
    item.summary,
    ...takeaways,
    ...list(item.sections).flatMap(section => [
      section?.heading,
      ...list(section?.paragraphs),
      ...list(section?.bullets)
    ])
  ].map(text).filter(Boolean).join(" ");
  const articleId = `${canonicalUrl}#article`;
  const articleSchema = {
    "@type": "Article",
    "@id": articleId,
    headline: text(item.title),
    description,
    articleBody: articleText,
    articleSection: text(item.category) || "Wawasan",
    genre: kindLabel(item.kind),
    keywords: text(item.keywords),
    inLanguage: "id-ID",
    isAccessibleForFree: true,
    mainEntityOfPage: { "@id": `${canonicalUrl}#webpage` },
    image: [imageUrl],
    author: { "@id": `${PUBLIC_BASE}#organization` },
    publisher: { "@id": `${PUBLIC_BASE}#organization` },
    wordCount: articleText ? articleText.split(/\s+/).length : undefined,
    usageInfo: text(item.usageLimit) || undefined,
    datePublished: publicationDate,
    dateModified: modifiedDate
  };
  if (sourceHref) {
    articleSchema.citation = sourceHref;
    articleSchema.isBasedOn = sourceHref;
  }

  const structuredData = q("#seo-structured-data");
  if (structuredData) {
    structuredData.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${canonicalUrl}#webpage`,
          url: canonicalUrl,
          name: text(item.title),
          description,
          inLanguage: "id-ID",
          datePublished: publicationDate,
          dateModified: modifiedDate,
          isPartOf: { "@id": `${PUBLIC_BASE}#website` },
          about: { "@id": `${PUBLIC_BASE}#organization` },
          primaryImageOfPage: {
            "@type": "ImageObject",
            url: imageUrl,
            caption: disclosure
          },
          mainEntity: { "@id": articleId }
        },
        articleSchema,
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Beranda", item: PUBLIC_BASE },
            { "@type": "ListItem", position: 2, name: "Berita & Wawasan", item: new URL("berita.html", PUBLIC_BASE).href },
            { "@type": "ListItem", position: 3, name: text(item.title), item: canonicalUrl }
          ]
        }
      ]
    });
  }

  const transientLabel = (button, value) => {
    const original = button.textContent;
    button.textContent = value;
    window.setTimeout(() => {
      if (button.isConnected) button.textContent = original;
    }, 2400);
  };
  const copyCanonicalUrl = async () => {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
    await navigator.clipboard.writeText(canonicalUrl);
  };

  const shareButton = q("[data-detail-share]");
  if (shareButton && !shareButton.dataset.newsActionBound) {
    shareButton.dataset.newsActionBound = "true";
    shareButton.addEventListener("click", async event => {
      const button = event.currentTarget;
      try {
        if (navigator.share) {
          await navigator.share({ title: text(item.title), text: text(item.summary), url: canonicalUrl });
        } else {
          await copyCanonicalUrl();
          transientLabel(button, "Tautan disalin");
        }
      } catch (error) {
        if (error?.name !== "AbortError") transientLabel(button, "Bagikan dari browser");
      }
    });
  }
  const copyButton = q("[data-detail-copy]");
  if (copyButton && !copyButton.dataset.newsActionBound) {
    copyButton.dataset.newsActionBound = "true";
    copyButton.addEventListener("click", async event => {
      const button = event.currentTarget;
      try {
        await copyCanonicalUrl();
        transientLabel(button, "Tautan tersalin");
      } catch {
        transientLabel(button, "Salin dari bilah alamat");
      }
    });
  }

  html.dataset.newsDetail = "ready";
})();
