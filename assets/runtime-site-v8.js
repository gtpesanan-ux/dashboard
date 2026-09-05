
(() => {
  "use strict";

  const root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileMedia = window.matchMedia("(max-width: 1180px)");

  const iconMarkup = (name, size = 20) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "icon-svg");
    svg.setAttribute("width", String(size));
    svg.setAttribute("height", String(size));
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", `#icon-${name}`);
    svg.append(use);
    return svg;
  };

  const setInert = (elements, inert) => {
    elements.forEach((element) => {
      if (!element) return;
      if (inert) element.setAttribute("inert", "");
      else element.removeAttribute("inert");
    });
  };

  const getFocusable = (scope) => qsa(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), details > summary, [tabindex]:not([tabindex="-1"])',
    scope,
  ).filter((element) => {
    if (element.hidden || element.closest("[hidden],[inert]") || element.getAttribute("aria-hidden") === "true") return false;
    const style = getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });

  const initActiveNavigation = () => {
    const nav = qs(".main-nav");
    if (!nav) return;
    qsa('[aria-current="page"]', nav).forEach((link) => link.removeAttribute("aria-current"));
    qsa(".nav-group.has-current", nav).forEach((group) => group.classList.remove("has-current"));
    const current = (()=>{try{return new URL(window.location.href)}catch{return new URL('https://standalone.digdaya.invalid/'+(document.body?.dataset?.ultimatePage||'index')+'.html')}})();
    const currentFile = current.pathname.split("/").filter(Boolean).pop() || "index.html";
    const matches = qsa("a[href]", nav).filter((link) => {
      let url;
      try {
        url = new URL(link.getAttribute("href") || "", current.href);
      } catch {
        return false;
      }
      const file = url.pathname.split("/").filter(Boolean).pop() || "index.html";
      return file === currentFile && !url.hash;
    });
    const active = matches.find((link) => link.closest(".nav-flyout")) || matches.at(-1);
    if (!active) return;
    active.setAttribute("aria-current", "page");
    active.closest(".nav-group")?.classList.add("has-current");
  };

  const initNavigation = () => {
    const header = qs(".site-header");
    const menuButton = qs(".menu-button");
    const navigation = qs(".main-nav");
    const navigationClose = navigation ? qs(".nav-close", navigation) : null;
    const backdrop = qs(".nav-backdrop");
    if (!header || !menuButton || !navigation) return;
    const menuIcon = qs(".menu-icon", menuButton);
    const closeIcon = qs(".close-icon", menuButton);
    const inertTargets = [qs(".skip-link"), qs(".brand", header), qs(".breadcrumb"), qs("main"), qs(".site-footer"), qs(".wa-float")];
    const groups = qsa(".nav-group", navigation);

    const closeGroup = (group, restoreFocus = false) => {
      const toggle = qs(".nav-toggle", group);
      const flyout = qs(".nav-flyout", group);
      if (!toggle || !flyout) return;
      const label = qs(".nav-parent", group)?.textContent.trim() || "navigasi";
      group.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", `Buka submenu ${label}`);
      flyout.hidden = true;
      if (restoreFocus) toggle.focus();
    };
    const closeGroups = (except = null) => groups.forEach((group) => { if (group !== except) closeGroup(group); });
    const openGroup = (group) => {
      const toggle = qs(".nav-toggle", group);
      const flyout = qs(".nav-flyout", group);
      if (!toggle || !flyout) return;
      const label = qs(".nav-parent", group)?.textContent.trim() || "navigasi";
      closeGroups(group);
      group.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", `Tutup submenu ${label}`);
      flyout.hidden = false;
    };

    groups.forEach((group) => {
      const toggle = qs(".nav-toggle", group);
      if (!toggle) return;
      toggle.addEventListener("click", () => {
        const openedByHover = group.dataset.openedByHover === "true";
        delete group.dataset.openedByHover;
        if (toggle.getAttribute("aria-expanded") === "true" && !openedByHover) closeGroup(group);
        else openGroup(group);
      });
      group.addEventListener("pointerenter", (event) => {
        if (!mobileMedia.matches && event.pointerType !== "touch") {
          group.dataset.openedByHover = "true";
          openGroup(group);
        }
      });
      group.addEventListener("pointerleave", () => {
        delete group.dataset.openedByHover;
        if (!mobileMedia.matches && !group.contains(document.activeElement)) closeGroup(group);
      });
      group.addEventListener("focusout", (event) => {
        if (!mobileMedia.matches && !group.contains(event.relatedTarget)) closeGroup(group);
      });
    });

    const updateMenuIcons = (open) => {
      if (menuIcon) menuIcon.hidden = open;
      if (closeIcon) closeIcon.hidden = !open;
    };
    const closeMenu = (restoreFocus = false) => {
      const wasOpen = navigation.classList.contains("is-open");
      navigation.classList.remove("is-open");
      navigation.setAttribute("aria-hidden", mobileMedia.matches ? "true" : "false");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Buka menu utama");
      updateMenuIcons(false);
      document.body.classList.remove("menu-open");
      if (backdrop) backdrop.hidden = true;
      setInert(inertTargets, false);
      closeGroups();
      if (restoreFocus && wasOpen) menuButton.focus();
    };
    const openMenu = (focusFirstItem = false) => {
      navigation.classList.add("is-open");
      navigation.setAttribute("aria-hidden", "false");
      menuButton.setAttribute("aria-expanded", "true");
      menuButton.setAttribute("aria-label", "Tutup menu utama");
      updateMenuIcons(true);
      document.body.classList.add("menu-open");
      if (backdrop) backdrop.hidden = false;
      setInert(inertTargets, true);
      if (focusFirstItem) requestAnimationFrame(() => getFocusable(navigation)[0]?.focus());
    };

    menuButton.addEventListener("click", (event) => navigation.classList.contains("is-open") ? closeMenu(true) : openMenu(event.detail === 0));
    navigationClose?.addEventListener("click", () => closeMenu(true));
    backdrop?.addEventListener("click", () => closeMenu(true));
    navigation.addEventListener("click", (event) => {
      if (event.target.closest("a") && mobileMedia.matches) closeMenu(false);
    });
    document.addEventListener("pointerdown", (event) => { if (!header.contains(event.target)) closeGroups(); });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        const openGroupNode = qs(".nav-group.is-open", navigation);
        if (openGroupNode) closeGroup(openGroupNode, true);
        else closeMenu(true);
      }
      if (event.key !== "Tab" || !navigation.classList.contains("is-open")) return;
      const focusable = [menuButton, ...getFocusable(navigation)];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    });
    const syncViewport = () => {
      closeMenu(false);
      navigation.setAttribute("aria-hidden", mobileMedia.matches ? "true" : "false");
    };
    mobileMedia.addEventListener?.("change", syncViewport);
    syncViewport();
  };

  const initScrollUI = () => {
    const header = qs(".site-header");
    const progress = qs(".reading-progress");
    let queued = false;
    const update = () => {
      queued = false;
      header?.classList.toggle("is-scrolled", window.scrollY > 10);
      if (!progress) return;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      progress.style.transform = `scaleX(${ratio})`;
    };
    const requestUpdate = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
  };

  const initRevealMotion = () => {
    const nodes = qsa("[data-motion], .reveal");
    if (!nodes.length || reduceMotion.matches || !("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }
    nodes.forEach((node) => node.classList.add("motion-item"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -7%", threshold: 0.08 });
    nodes.forEach((node) => observer.observe(node));
    root.classList.add("motion-ready");
  };

  const initFaqMotion = () => {
    const detailsItems = qsa(".faq details");
    if (!detailsItems.length) return;
    const animations = new WeakMap();
    detailsItems.forEach((details) => {
      const summary = qs("summary", details);
      if (!summary) return;
      let answer = qs(":scope > .faq-answer", details);
      if (!answer) {
        answer = document.createElement("div");
        answer.className = "faq-answer";
        const inner = document.createElement("div");
        inner.className = "faq-answer-inner";
        [...details.children].filter((child) => child !== summary).forEach((child) => inner.append(child));
        answer.append(inner);
        details.append(answer);
      }
      if (!qs(".faq-chevron", summary)) {
        const chevron = iconMarkup("chevron-down", 22);
        chevron.classList.add("faq-chevron");
        summary.append(chevron);
      }
      summary.addEventListener("click", (event) => {
        if (reduceMotion.matches || !("animate" in answer)) return;
        event.preventDefault();
        animations.get(details)?.cancel();
        const opening = !details.open;
        if (opening) details.open = true;
        const start = opening ? 0 : answer.scrollHeight;
        const end = opening ? answer.scrollHeight : 0;
        answer.style.overflow = "hidden";
        const animation = answer.animate(
          [{ height: `${start}px`, opacity: opening ? 0 : 1 }, { height: `${end}px`, opacity: opening ? 1 : 0 }],
          { duration: 280, easing: "cubic-bezier(.2,.8,.2,1)" },
        );
        animations.set(details, animation);
        animation.finished.then(() => {
          if (!opening) details.open = false;
          answer.style.height = "";
          answer.style.overflow = "";
          answer.style.opacity = "";
          animations.delete(details);
        }).catch(() => {});
      });
    });
  };

  const initDialogs = () => {
    qsa("dialog").forEach((dialog) => {
      qsa("[data-close-dialog]:not([data-close-inquiry])", dialog).forEach((button) => button.addEventListener("click", () => dialog.close()));
      if (!dialog.hasAttribute("data-inquiry-dialog")) {
        dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
      }
    });
    qsa("[data-open-inquiry]").forEach((button) => {
      button.addEventListener("click", (event) => {
        // widgets.js owns the full API-aware flow when it is available.
        // Keep this branch only as a progressive-enhancement fallback.
        if (window.DigdayaWidgets?.openInquiry) return;
        event.preventDefault();
        const service = button.getAttribute("data-inquiry-service") || button.getAttribute("data-service");
        const message = button.getAttribute("data-inquiry-message") || button.getAttribute("data-message");
        const fallbackMessage = message || `Halo PT Digdaya Inovasi Nusantara, saya ingin berkonsultasi${service ? ` tentang ${service}` : ""}.`;
        window.location.assign(`https://wa.me/6287892523968?text=${encodeURIComponent(fallbackMessage)}`);
      });
    });
  };

  const initImageViewer = () => {
    const dialog = qs("#image-viewer");
    const viewerImage = dialog ? qs("img", dialog) : null;
    const viewerCaption = dialog ? qs("[data-viewer-caption]", dialog) : null;
    if (!dialog || !viewerImage) return;
    qsa("[data-lightbox]").forEach((trigger) => {
      trigger.setAttribute("tabindex", "0");
      trigger.setAttribute("role", "button");
      if (!trigger.hasAttribute("aria-label")) trigger.setAttribute("aria-label", "Perbesar gambar");
      const openViewer = () => {
        const image = qs("img", trigger) || trigger;
        viewerImage.src = image.currentSrc || image.src;
        viewerImage.alt = image.alt || "";
        if (viewerCaption) viewerCaption.textContent = trigger.getAttribute("data-caption") || image.alt || "";
        dialog.showModal();
      };
      trigger.addEventListener("click", openViewer);
      trigger.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        openViewer();
      });
    });
  };

  const initYears = () => qsa("[data-year]").forEach((node) => { node.textContent = String(new Date().getFullYear()); });

  initActiveNavigation();
  initNavigation();
  initScrollUI();
  initRevealMotion();
  initFaqMotion();
  initDialogs();
  initImageViewer();
  initYears();

  window.DigdayaUI = Object.freeze({
    openInquiry: (options = {}) => {
      if (window.DigdayaWidgets?.openInquiry) {
        window.DigdayaWidgets.openInquiry(options);
        return;
      }
      const dialog = qs("#inquiry-dialog");
      if (!dialog?.showModal) {
        window.location.href = "kontak.html";
        return;
      }
      const select = qs('[name="service"]', dialog);
      const field = qs('[name="message"]', dialog);
      if (options.service && select) select.value = options.service;
      if (options.message && field) field.value = options.message.slice(0, 2000);
      dialog.showModal();
      requestAnimationFrame(() => qs("input, select, textarea", dialog)?.focus());
    },
  });
})();

  
