
(() => {
  "use strict";

  const WA_NUMBER = "6287892523968";
  const API_ENDPOINT = "";
  const MAX_MESSAGE_LENGTH = 2000;
  const MAX_WHATSAPP_LENGTH = 1800;
  const REQUEST_TIMEOUT_MS = 12000;
  const SECRET_PATTERN =
    /\b(password|kata sandi|otp|pin|cvv2?|cvc2?|kode pemulihan|kode verifikasi|verification code|passcode|recovery code|recovery phrase|seed phrase|private key|auth code|email login|akses akun)\b/i;
  const VALID_SERVICES = new Set([
    "Konsultasi umum",
    "Parfum",
    "Beli atau jual domain",
    "Pembuatan website",
    "Pengembangan website",
    "Top up game",
  ]);

  const initializedWidgets = new WeakSet();
  const initializedInquiryForms = new WeakSet();
  const widgetSummaries = new WeakMap();
  const dialogContexts = new WeakMap();
  let delegatedControlsReady = false;

  const prefersReducedMotion = () =>
    globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

  const select = (root, selectors) => {
    for (const selector of selectors.split(",")) {
      const node = root.querySelector(selector.trim());
      if (node) return node;
    }
    return null;
  };

  const selectAll = (root, selectors) =>
    [...root.querySelectorAll(selectors)];

  const cleanText = (value, maxLength = 500) =>
    Array.from(String(value ?? "")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
      .replace(/\r\n?/g, "\n")
      .trim())
      .slice(0, maxLength)
      .join("");

  const cleanInline = (value, maxLength = 300) =>
    cleanText(value, maxLength).replace(/\s+/g, " ");

  const humanize = (value) =>
    cleanInline(value, 100)
      .replaceAll("-", " ")
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const normalizeSearchText = (value) =>
    cleanText(value, 20000)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("id-ID");

  const setNodeText = (node, value) => {
    if (node) node.textContent = cleanText(value, 5000);
  };

  const showNode = (node, show = true) => {
    if (!node) return;
    node.hidden = !show;
    node.setAttribute("aria-hidden", String(!show));
  };

  const focusNode = (node) => {
    if (!node) return;
    if (!node.hasAttribute("tabindex") && !node.matches("button,a,input,select,textarea")) {
      node.setAttribute("tabindex", "-1");
    }
    try {
      node.focus({ preventScroll: prefersReducedMotion() });
    } catch {
      node.focus();
    }
  };

  const getNamedControls = (form, aliases) => {
    for (const name of aliases) {
      const controls = selectAll(form, `[name="${name}"]`);
      if (controls.length) return controls;
    }
    return [];
  };

  const valueOf = (form, ...aliases) => {
    const controls = getNamedControls(form, aliases);
    if (!controls.length) return "";
    const first = controls[0];
    if (first instanceof HTMLInputElement && first.type === "radio") {
      return cleanInline(controls.find((control) => control.checked)?.value, 300);
    }
    if (first instanceof HTMLInputElement && first.type === "checkbox") {
      return first.checked ? cleanInline(first.value || "true", 300) : "";
    }
    return cleanInline(first.value, 500);
  };

  const valuesOf = (form, ...aliases) =>
    getNamedControls(form, aliases)
      .filter((control) => control.checked)
      .map((control) => cleanInline(control.value, 200));

  const checkedOf = (form, ...aliases) => {
    const controls = getNamedControls(form, aliases);
    if (!controls.length) return false;
    const checked = controls.find((control) => control.checked);
    if (!checked) return false;
    return !["false", "no", "tidak", "0"].includes(String(checked.value).toLowerCase());
  };

  const choiceLabel = (form, name, value) => {
    const control = getNamedControls(form, [name]).find(
      (item) => String(item.value) === String(value),
    );
    if (!control) return humanize(value);
    if (control instanceof HTMLSelectElement) {
      return cleanInline(control.selectedOptions?.[0]?.textContent || value, 160);
    }
    const explicit = control.id
      ? form.querySelector(`label[for="${control.id}"]`)
      : control.closest("label");
    const strong = explicit?.querySelector("strong");
    return cleanInline(strong?.textContent || explicit?.textContent || value, 160);
  };

  const listLabels = (form, name, values) =>
    values.map((value) => choiceLabel(form, name, value));

  const setControlsEnabled = (container, enabled) => {
    if (!container) return;
    selectAll(container, "input,select,textarea,button").forEach((control) => {
      if (control.hasAttribute("data-always-enabled")) return;
      control.disabled = !enabled;
    });
  };

  const setConditionalPanel = (panel, visible) => {
    if (!panel) return;
    showNode(panel, visible);
    selectAll(panel, "input,select,textarea").forEach((control) => {
      control.disabled = !visible;
    });
  };

  const hasHiddenAncestor = (node) =>
    Boolean(node?.parentElement?.closest("[hidden]"));

  const showError = (root, message, focusTarget = null) => {
    const error = select(
      root,
      "[data-widget-error],[data-domain-error],[data-scope-error],[data-topup-error]",
    );
    if (error) {
      setNodeText(error, message);
      showNode(error, true);
    } else {
      const status = select(root, "[data-widget-status]");
      setNodeText(status, message);
    }
    if (focusTarget) focusNode(focusTarget);
    return false;
  };

  const clearError = (root) => {
    const error = select(
      root,
      "[data-widget-error],[data-domain-error],[data-scope-error],[data-topup-error]",
    );
    if (error) {
      error.textContent = "";
      showNode(error, false);
    }
  };

  const announce = (root, message) => {
    const status = select(root, "[data-widget-status],[data-news-status],[data-news-count]");
    setNodeText(status, message);
  };

  const validateNativeControls = (root, container) => {
    const invalid = selectAll(container, "input,select,textarea").find(
      (control) => !control.disabled && !control.checkValidity(),
    );
    if (!invalid) return true;
    invalid.setAttribute("aria-invalid", "true");
    try {
      invalid.reportValidity();
    } catch {
      // The shared error below is sufficient where reportValidity is unavailable.
    }
    return showError(root, "Lengkapi pilihan wajib pada langkah ini.", invalid);
  };

  const makeElement = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) setNodeText(node, text);
    return node;
  };

  const renderDefinitionList = (container, entries) => {
    if (!container) return;
    const list = makeElement("dl", "widget-summary-list");
    entries.forEach(([term, description]) => {
      const wrapper = makeElement("div", "widget-summary-item");
      wrapper.append(
        makeElement("dt", "", term),
        makeElement("dd", "", description || "—"),
      );
      list.append(wrapper);
    });
    container.replaceChildren(list);
  };

  const renderBulletList = (container, items) => {
    if (!container) return;
    const list = makeElement("ul", "widget-note-list");
    items.forEach((item) => list.append(makeElement("li", "", item)));
    container.replaceChildren(list);
  };

  const composeMessage = (lines) =>
    cleanText(
      lines
        .filter((line) => line !== null && line !== undefined && line !== "")
        .join("\n")
        .replace(/\n{3,}/g, "\n\n"),
      MAX_MESSAGE_LENGTH,
    );

  const buildWhatsAppUrl = (message) => {
    const safeMessage = cleanText(message, MAX_WHATSAPP_LENGTH);
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(safeMessage)}`;
  };

  const safeSourcePath = (value = globalThis.location?.pathname || "/") => {
    const path = cleanText(value, 200);
    if (!path.startsWith("/") || path.startsWith("//")) return "/";
    return path;
  };

  const uuidV4 = () => {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    const bytes = new Uint8Array(16);
    if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
    else bytes.forEach((_, index) => {
      bytes[index] = Math.floor(Math.random() * 256);
    });
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0"));
    return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex
      .slice(6, 8)
      .join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
  };

  const buildInquiryPayload = (input = {}) => {
    const service = VALID_SERVICES.has(input.service)
      ? input.service
      : "Konsultasi umum";
    const message = cleanText(
      input.message || "Permintaan konsultasi dari website PT Digdaya Inovasi Nusantara.",
      MAX_MESSAGE_LENGTH,
    );
    return {
      name: cleanInline(input.name, 100),
      whatsapp: cleanInline(input.whatsapp, 24),
      email: cleanInline(input.email, 160),
      company: cleanInline(input.company, 120),
      service,
      budget: cleanInline(input.budget, 80),
      message: message.length >= 10 ? message : `${message} Konsultasi.`.slice(0, 2000),
      website: cleanInline(input.website, 200),
      consent: input.consent === true,
      startedAt:
        Number.isInteger(input.startedAt) && input.startedAt > 0
          ? input.startedAt
          : Date.now(),
      submissionToken: cleanInline(input.submissionToken, 36) || uuidV4(),
      sourcePath: safeSourcePath(input.sourcePath),
    };
  };

  const submitInquiry = async (payload, options = {}) => {
    if (options.signal?.aborted) {
      return {
        ok: false,
        status: 0,
        code: "ABORTED",
        error: "Pengiriman dibatalkan.",
      };
    }
    if (!API_ENDPOINT || !/^https?:$/.test(globalThis.location?.protocol || "")) {
      return {
        ok: false,
        status: 0,
        code: "WA_ONLY",
        error: "Formulir API hanya tersedia setelah website dipasang pada server.",
      };
    }

    const controller = new AbortController();
    const timeout = globalThis.setTimeout(
      () => controller.abort(),
      options.timeoutMs || REQUEST_TIMEOUT_MS,
    );
    const externalSignal = options.signal;
    const abortFromExternal = () => controller.abort();
    externalSignal?.addEventListener("abort", abortFromExternal, { once: true });

    try {
      const response = await fetch(options.endpoint || API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildInquiryPayload(payload)),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => ({}));
      return {
        ok: response.ok,
        status: response.status,
        reference: cleanInline(result.reference, 80),
        error: cleanText(result.error, 500),
        retryAfter: Number(response.headers.get("Retry-After") || 0),
      };
    } catch (error) {
      return {
        ok: false,
        status: 0,
        code: error?.name === "AbortError" ? "TIMEOUT" : "NETWORK_ERROR",
        error:
          error?.name === "AbortError"
            ? "Server tidak merespons dalam batas waktu."
            : "Koneksi ke server terputus.",
      };
    } finally {
      globalThis.clearTimeout(timeout);
      externalSignal?.removeEventListener("abort", abortFromExternal);
    }
  };

  const normalizeSummary = (summary = {}) => ({
    service: VALID_SERVICES.has(summary.service)
      ? summary.service
      : "Konsultasi umum",
    budget: cleanInline(summary.budget, 80),
    message: cleanText(
      summary.message || "Saya ingin berkonsultasi dengan PT Digdaya Inovasi Nusantara.",
      MAX_MESSAGE_LENGTH,
    ),
    whatsappText: cleanText(
      summary.whatsappText || summary.message || "Halo PT Digdaya Inovasi Nusantara, saya ingin berkonsultasi.",
      MAX_WHATSAPP_LENGTH,
    ),
  });

  const setWidgetSummary = (root, summary) => {
    const normalized = normalizeSummary(summary);
    widgetSummaries.set(root, normalized);
    selectAll(root, "[data-inquiry-wa]").forEach((link) => {
      link.href = buildWhatsAppUrl(normalized.whatsappText);
    });
    root.dispatchEvent(
      new CustomEvent("digdaya:widget-result", {
        bubbles: true,
        detail: {
          widget: root.dataset.widget || "",
          service: normalized.service,
          budget: normalized.budget,
          message: normalized.message,
          whatsappUrl: buildWhatsAppUrl(normalized.whatsappText),
        },
      }),
    );
    return normalized;
  };

  const inquiryStatusMessage = (result) => {
    if (result.ok) {
      return `Permintaan tersimpan. Kode referensi: ${result.reference || "DIN-TERKIRIM"}.`;
    }
    if (result.code === "WA_ONLY") {
      return `${result.error} Gunakan tombol WhatsApp untuk melanjutkan.`;
    }
    if (result.code === "TIMEOUT" || result.code === "NETWORK_ERROR") {
      return `${result.error} Permintaan belum dipastikan tersimpan; Anda dapat melanjutkan melalui WhatsApp.`;
    }
    if (result.status === 429) {
      return "Terlalu banyak permintaan. Tunggu beberapa menit sebelum mencoba kembali, atau gunakan WhatsApp.";
    }
    if (result.status === 409) {
      return result.error || "Isi permintaan berubah pada token yang sama. Muat ulang lalu coba kembali.";
    }
    if (result.status === 422) {
      return result.error || "Periksa kembali nama, nomor WhatsApp, persetujuan, dan isi permintaan.";
    }
    return result.error || "Permintaan belum dapat disimpan. Gunakan WhatsApp atau coba kembali.";
  };

  const bindInquiryForm = (form, getSummary) => {
    if (!form || initializedInquiryForms.has(form)) return;
    initializedInquiryForms.add(form);
    let startedAt = Date.now();
    let submissionToken = "";
    let payloadKey = "";
    let requestGeneration = 0;
    let activeController = null;

    const clearValidityState = (event) => {
      const control = event.target;
      if (control?.matches?.("input,select,textarea") && control.checkValidity()) {
        control.removeAttribute("aria-invalid");
      }
    };
    form.addEventListener("input", clearValidityState);
    form.addEventListener("change", clearValidityState);

    form.addEventListener("digdaya:inquiry-reset", () => {
      requestGeneration += 1;
      activeController?.abort();
      activeController = null;
      const scope = form.closest("[data-inquiry-dialog],dialog") || form.parentElement || form;
      const status =
        select(form, "[data-inquiry-status],[data-form-status],[role='status']") ||
        select(scope, "[data-inquiry-status],[data-form-status]");
      const fallback = select(form, "[data-inquiry-wa]") || select(scope, "[data-inquiry-wa]");
      const success = select(form, "[data-inquiry-success]") || select(scope, "[data-inquiry-success]");
      const reference = select(form, "[data-inquiry-reference]") || select(scope, "[data-inquiry-reference]");
      form.removeAttribute("aria-busy");
      selectAll(form, "[aria-invalid='true']").forEach((control) => control.removeAttribute("aria-invalid"));
      const submitButton = select(form, "[type='submit']");
      if (submitButton) submitButton.disabled = false;
      setNodeText(status, "");
      setNodeText(reference, "");
      showNode(fallback, false);
      showNode(success, false);
      startedAt = Date.now();
      submissionToken = "";
      payloadKey = "";
    });
    const dialog = form.closest("dialog");
    dialog?.addEventListener("cancel", () => {
      form.dispatchEvent(new CustomEvent("digdaya:inquiry-reset"));
    });
    dialog?.addEventListener("close", () => {
      form.dispatchEvent(new CustomEvent("digdaya:inquiry-reset"));
    });

    form.addEventListener("focusin", () => {
      if (Date.now() - startedAt > 23 * 60 * 60 * 1000) startedAt = Date.now();
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const inquiryScope =
        form.closest("[data-widget],[data-inquiry-dialog],dialog") ||
        form.parentElement ||
        form;
      const status =
        select(form, "[data-inquiry-status],[data-form-status],[role='status']") ||
        select(inquiryScope, "[data-inquiry-status],[data-form-status]");
      const submitButton = select(form, "[type='submit']");
      const consentControl = getNamedControls(form, ["consent"])[0];

      if (!form.checkValidity()) {
        form.reportValidity();
        setNodeText(status, "Lengkapi kolom wajib dengan format yang benar.");
        return;
      }
      if (!consentControl?.checked) {
        consentControl?.setAttribute("aria-invalid", "true");
        setNodeText(status, "Persetujuan penggunaan data diperlukan sebelum mengirim formulir.");
        focusNode(consentControl);
        return;
      }

      const summary = normalizeSummary(getSummary?.() || {
        service: form.dataset.inquiryService,
        budget: form.dataset.inquiryBudget,
        message: form.dataset.inquiryMessage,
        whatsappText: form.dataset.inquiryWa,
      });
      const typedService = valueOf(form, "service");
      const service = VALID_SERVICES.has(typedService) ? typedService : summary.service;
      const messageControl = getNamedControls(form, ["message"])[0];
      const typedMessage = cleanText(messageControl?.value, MAX_MESSAGE_LENGTH);
      const message = typedMessage || summary.message;
      const name = valueOf(form, "name");
      const whatsapp = valueOf(form, "whatsapp");
      const whatsappDigits = whatsapp.replace(/\D/g, "");
      if (name.length < 2) {
        setNodeText(status, "Nama minimal terdiri dari dua karakter.");
        focusNode(getNamedControls(form, ["name"])[0]);
        return;
      }
      if (!/^[0-9+()\s-]+$/.test(whatsapp) || whatsappDigits.length < 8 || whatsappDigits.length > 15) {
        setNodeText(status, "Masukkan nomor WhatsApp yang valid, berisi 8–15 digit.");
        focusNode(getNamedControls(form, ["whatsapp"])[0]);
        return;
      }
      if (messageControl && typedMessage.length < 10) {
        setNodeText(status, "Ceritakan kebutuhan Anda dengan minimal sepuluh karakter.");
        focusNode(messageControl);
        return;
      }
      if (SECRET_PATTERN.test(typedMessage)) {
        messageControl?.setAttribute("aria-invalid", "true");
        setNodeText(status, "Hapus password, OTP, PIN, CVV, kode verifikasi, atau kredensial lain dari pesan.");
        focusNode(messageControl);
        return;
      }
      const base = {
        name,
        whatsapp,
        email: valueOf(form, "email"),
        company: valueOf(form, "company"),
        service,
        budget: valueOf(form, "budget") || summary.budget,
        message,
        website: valueOf(form, "website"),
        consent: true,
        sourcePath: safeSourcePath(),
      };
      const nextKey = JSON.stringify(base);
      if (!submissionToken || nextKey !== payloadKey) {
        submissionToken = uuidV4();
        payloadKey = nextKey;
      }
      const payload = buildInquiryPayload({
        ...base,
        startedAt,
        submissionToken,
      });

      form.setAttribute("aria-busy", "true");
      if (submitButton) submitButton.disabled = true;
      setNodeText(status, "Mengirim permintaan…");
      const requestId = ++requestGeneration;
      const remainingDelay = 1200 - (Date.now() - startedAt);
      if (remainingDelay > 0) {
        await new Promise((resolve) => globalThis.setTimeout(resolve, remainingDelay));
      }
      if (requestId !== requestGeneration) return;
      activeController?.abort();
      activeController = new AbortController();
      const result = await submitInquiry(payload, { signal: activeController.signal });
      if (requestId !== requestGeneration) return;
      activeController = null;
      form.removeAttribute("aria-busy");
      if (submitButton) submitButton.disabled = false;
      setNodeText(status, inquiryStatusMessage(result));

      const fallback =
        select(form, "[data-inquiry-wa]") ||
        select(form.parentElement || form, "[data-inquiry-wa]");
      if (fallback) {
        const fallbackText = typedMessage
          ? composeMessage([
              "Halo PT Digdaya Inovasi Nusantara,",
              "",
              `Nama: ${name}`,
              `Layanan: ${service}`,
              `Pesan: ${typedMessage}`,
            ])
          : summary.whatsappText;
        fallback.href = buildWhatsAppUrl(fallbackText);
        showNode(fallback, !result.ok);
      }

      if (!result.ok) return;
      const reference =
        select(form, "[data-inquiry-reference]") ||
        select(form.parentElement || form, "[data-inquiry-reference]");
      setNodeText(reference, result.reference || "DIN-TERKIRIM");
      const success =
        select(form, "[data-inquiry-success]") ||
        select(form.parentElement || form, "[data-inquiry-success]");
      showNode(success, true);
      if (success) focusNode(success);
      form.reset();
      startedAt = Date.now();
      submissionToken = "";
      payloadKey = "";
    });
  };

  const bindInquiryForms = (scope, getSummary) => {
    selectAll(scope, "[data-inquiry-form]").forEach((form) =>
      bindInquiryForm(form, getSummary),
    );
  };

  const createStepper = ({
    root,
    form,
    stepSelector,
    previousSelector,
    nextSelector,
    submitSelector,
    validateStep,
    onStepChange,
    onSubmit,
  }) => {
    const steps = selectAll(root, stepSelector);
    const previous = select(root, previousSelector);
    const next = select(root, nextSelector);
    const submit = select(root, submitSelector);
    let index = 0;

    const sync = (focus = false) => {
      steps.forEach((step, stepIndex) => {
        const active = stepIndex === index;
        showNode(step, active);
        setControlsEnabled(step, active);
      });
      const progress = selectAll(root, "[data-progress-step]");
      progress.forEach((item, itemIndex) => {
        if (itemIndex === index) item.setAttribute("aria-current", "step");
        else item.removeAttribute("aria-current");
        item.classList.toggle("is-complete", itemIndex < index);
      });
      showNode(previous, steps.length > 1 && index > 0);
      showNode(next, steps.length > 1 && index < steps.length - 1);
      showNode(submit, steps.length <= 1 || index === steps.length - 1);
      onStepChange?.(index, steps[index]);
      if (focus && steps[index]) {
        focusNode(select(steps[index], "legend,[data-step-title],h3") || steps[index]);
      }
      announce(root, `Langkah ${index + 1} dari ${Math.max(steps.length, 1)}.`);
    };

    const validateCurrent = () => {
      clearError(root);
      if (steps[index] && !validateNativeControls(root, steps[index])) return false;
      return validateStep?.(index, steps[index]) ?? true;
    };

    previous?.addEventListener("click", () => {
      if (index <= 0) return;
      index -= 1;
      sync(true);
    });
    next?.addEventListener("click", () => {
      if (!validateCurrent() || index >= steps.length - 1) return;
      index += 1;
      sync(true);
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!validateCurrent()) return;
      if (steps.length > 1 && index < steps.length - 1) {
        index += 1;
        sync(true);
        return;
      }
      onSubmit?.(event);
    });

    const reset = () => {
      index = 0;
      clearError(root);
      sync(false);
    };

    if (steps.length) sync(false);
    else {
      showNode(previous, false);
      showNode(next, false);
      showNode(submit, true);
    }

    return { reset, sync, getIndex: () => index };
  };

  const SERVICE_ROUTES = {
    "scent-explore": {
      title: "Mulai dari Pencari Arah Aroma",
      description: "Susun konteks, kesan, intensitas, dan batas preferensi sebelum membahas produk.",
      href: "parfum-lokal.html#scent-finder",
      service: "Parfum",
    },
    "parfum-lokal": {
      title: "Jelajahi parfum lokal",
      description: "Pelajari arah aroma lokal berdasarkan konteks dan preferensi personal.",
      href: "parfum-lokal.html",
      service: "Parfum",
    },
    "parfum-niche": {
      title: "Jelajahi parfum niche",
      description: "Mulai dari karakter yang lebih spesifik dan pendekatan aroma yang eksploratif.",
      href: "parfum-niche.html",
      service: "Parfum",
    },
    "parfum-timur-tengah": {
      title: "Jelajahi parfum Timur Tengah",
      description: "Pelajari profil oud, amber, resin, musk, dan rempah sesuai konteks pemakaian.",
      href: "parfum-timur-tengah.html",
      service: "Parfum",
    },
    "parfum-designer": {
      title: "Jelajahi parfum designer",
      description: "Mulai dari gaya, situasi, dan pengalaman aroma yang ingin dibangun.",
      href: "parfum-designer.html",
      service: "Parfum",
    },
    "domain-buy": {
      title: "Susun brief pencarian domain",
      description: "Siapkan nama, tujuan, ekstensi, pasar, dan prioritas sebelum pemeriksaan resmi.",
      href: "jual-beli-domain.html?intent=buy#domain-brief-checker",
      service: "Beli atau jual domain",
    },
    "domain-sell": {
      title: "Susun brief penawaran domain",
      description: "Catat domain, registrar, kedaluwarsa, kontrol akun, dan konteks riwayatnya.",
      href: "jual-beli-domain.html?intent=sell#domain-brief-checker",
      service: "Beli atau jual domain",
    },
    "domain-evaluate": {
      title: "Tinjau kesiapan ide domain",
      description: "Periksa format dan kelengkapan brief tanpa menganggap domain tersedia atau aman secara hukum.",
      href: "jual-beli-domain.html?intent=evaluate#domain-brief-checker",
      service: "Beli atau jual domain",
    },
    "website-landing": {
      title: "Susun brief landing page",
      description: "Petakan tujuan, konten, halaman, fitur, dan tindakan utama yang diharapkan.",
      href: "jasa-pembuatan-website.html?type=landing#website-scope-builder",
      service: "Pembuatan website",
    },
    "website-company": {
      title: "Susun brief company profile",
      description: "Petakan pengguna, struktur profil, bukti pendukung, dan jalur kontak.",
      href: "jasa-pembuatan-website.html?type=company#website-scope-builder",
      service: "Pembuatan website",
    },
    "website-catalog": {
      title: "Susun brief katalog informasi",
      description: "Tentukan kategori, pencarian, detail, dan alur permintaan yang perlu dibahas.",
      href: "jasa-pembuatan-website.html?type=catalog#website-scope-builder",
      service: "Pembuatan website",
    },
    "website-development": {
      title: "Petakan kebutuhan pengembangan",
      description: "Ringkas kondisi website, masalah, fitur, prioritas, dan batas pengerjaan.",
      href: "jasa-pembuatan-website.html?type=development#website-scope-builder",
      service: "Pengembangan website",
    },
    "topup-request": {
      title: "Siapkan permintaan top up",
      description: "Periksa game, ID tujuan, server, dan produk tanpa membagikan akses akun.",
      href: "top-up-game.html#topup-request-wizard",
      service: "Top up game",
    },
    "topup-safety": {
      title: "Pelajari keamanan permintaan",
      description: "Kenali data publik yang diperlukan dan data rahasia yang tidak boleh dibagikan.",
      href: "top-up-game.html#topup-request-wizard",
      service: "Top up game",
    },
  };

  const defaultServiceGoal = {
    fragrance: "scent-explore",
    domain: "domain-evaluate",
    website: "website-company",
    topup: "topup-request",
  };

  const initServiceFinder = (root) => {
    const form = select(root, "[data-service-form],[data-widget-form]");
    if (!form) return;
    const result = select(root, "[data-service-result],[data-widget-result]");
    const groups = selectAll(root, "[data-goal-group]");
    let currentSummary = null;

    const syncGoalGroups = () => {
      const service = valueOf(form, "service");
      groups.forEach((group) => {
        const visible = group.dataset.goalGroup === service;
        setConditionalPanel(group, visible && !hasHiddenAncestor(group));
      });
    };

    getNamedControls(form, ["service"]).forEach((control) => {
      control.addEventListener("change", () => {
        getNamedControls(form, ["goal"]).forEach((goal) => {
          if (!goal.closest(`[data-goal-group="${control.value}"]`)) goal.checked = false;
        });
        syncGoalGroups();
      });
    });

    const presentResult = () => {
      const service = valueOf(form, "service");
      const goal = valueOf(form, "goal") || defaultServiceGoal[service];
      const route = SERVICE_ROUTES[goal];
      if (!route) {
        showError(root, "Pilih tujuan yang ingin dilanjutkan.", getNamedControls(form, ["goal"])[0]);
        return;
      }
      const serviceLabel = choiceLabel(form, "service", service);
      const goalLabel = choiceLabel(form, "goal", goal);
      setNodeText(select(root, "[data-service-title]"), route.title);
      setNodeText(select(root, "[data-service-description]"), route.description);
      const deepLink = select(root, "[data-service-link]");
      if (deepLink) deepLink.href = route.href;

      const message = composeMessage([
        "Halo PT Digdaya Inovasi Nusantara,",
        "",
        "Saya menggunakan Pemilih Jalur Layanan.",
        `Kebutuhan utama: ${serviceLabel}`,
        `Tujuan: ${goalLabel}`,
        `Jalur awal: ${route.title}`,
        "",
        "Saya ingin melanjutkan konsultasi. Saya memahami bahwa ketersediaan, harga, ruang lingkup, dan waktu perlu dikonfirmasi sebelum transaksi.",
      ]);
      currentSummary = setWidgetSummary(root, {
        service: route.service,
        message,
        whatsappText: message,
      });
      const wa = select(root, "[data-service-wa],[data-widget-wa]");
      if (wa) wa.href = buildWhatsAppUrl(message);
      showNode(form, false);
      showNode(result, true);
      focusNode(result);
    };

    const stepper = createStepper({
      root,
      form,
      stepSelector: "[data-service-step]",
      previousSelector: "[data-service-prev]",
      nextSelector: "[data-service-next]",
      submitSelector: "[data-service-submit]",
      validateStep: (index) => {
        if (index === 0 && !valueOf(form, "service")) {
          return showError(root, "Pilih kebutuhan utama.", getNamedControls(form, ["service"])[0]);
        }
        if (index > 0 && !valueOf(form, "goal")) {
          return showError(root, "Pilih tujuan yang ingin dilanjutkan.", getNamedControls(form, ["goal"])[0]);
        }
        return true;
      },
      onStepChange: syncGoalGroups,
      onSubmit: presentResult,
    });

    const reset = select(root, "[data-service-reset],[data-widget-reset]");
    reset?.addEventListener("click", () => {
      form.reset();
      currentSummary = null;
      showNode(result, false);
      showNode(form, true);
      stepper.reset();
      syncGoalGroups();
      focusNode(select(form, "legend,[data-step-title]") || getNamedControls(form, ["service"])[0]);
    });
    syncGoalGroups();
    bindInquiryForms(root, () => currentSummary);
  };

  const SCENT_PROFILES = [
    {
      id: "fresh-clean",
      label: "Segar & bersih",
      descriptors: ["citrus", "aromatic", "green", "soft musk"],
      routes: ["Parfum Lokal", "Parfum Designer"],
      weights: {
        occasion: { harian: 3, profesional: 3, santai: 2 },
        impressions: { segar: 5, bersih: 5, lembut: 1, hijau: 2 },
        intensity: { dekat: 2, sedang: 2 },
        environment: { "panas-terbuka": 3, "ruang-berac": 1, campuran: 2 },
      },
      conflicts: ["terlalu-musky", "terlalu-tegas"],
    },
    {
      id: "floral-expressive",
      label: "Floral & ekspresif",
      descriptors: ["floral", "fruity", "green", "citrus"],
      routes: ["Parfum Designer", "Parfum Lokal"],
      weights: {
        occasion: { harian: 2, santai: 2, acara: 2, hadiah: 3 },
        impressions: { floral: 5, buah: 4, segar: 2, lembut: 2, hijau: 2 },
        intensity: { dekat: 1, sedang: 3, tegas: 1 },
        environment: { "panas-terbuka": 2, "ruang-berac": 2, campuran: 2 },
      },
      conflicts: ["terlalu-floral", "terlalu-tegas"],
    },
    {
      id: "woody-structured",
      label: "Woody & terstruktur",
      descriptors: ["woods", "aromatic", "leather", "mineral"],
      routes: ["Parfum Designer", "Parfum Niche"],
      weights: {
        occasion: { profesional: 3, acara: 2, koleksi: 2 },
        impressions: { woody: 5, tegas: 4, mineral: 3, bersih: 1 },
        intensity: { sedang: 3, tegas: 3 },
        environment: { "ruang-berac": 2, campuran: 2 },
      },
      conflicts: ["terlalu-smoky", "terlalu-tegas"],
    },
    {
      id: "warm-amber",
      label: "Hangat & berlapis",
      descriptors: ["amber", "resin", "woods", "spice"],
      routes: ["Parfum Timur Tengah", "Parfum Niche"],
      weights: {
        occasion: { acara: 3, hadiah: 2, koleksi: 3 },
        impressions: { hangat: 5, resinous: 5, rempah: 4, woody: 3, tegas: 2 },
        intensity: { sedang: 2, tegas: 4 },
        environment: { "ruang-berac": 3, campuran: 1 },
      },
      conflicts: ["terlalu-rempah", "terlalu-tegas"],
    },
    {
      id: "soft-gourmand",
      label: "Manis & nyaman",
      descriptors: ["vanilla", "tonka", "creamy", "powdery"],
      routes: ["Parfum Lokal", "Parfum Designer"],
      weights: {
        occasion: { santai: 3, acara: 2, hadiah: 3 },
        impressions: { manis: 5, hangat: 3, lembut: 4 },
        intensity: { dekat: 3, sedang: 2 },
        environment: { "ruang-berac": 3, campuran: 1 },
      },
      conflicts: ["terlalu-manis", "terlalu-tegas"],
    },
    {
      id: "green-mineral-smoky",
      label: "Hijau, mineral & eksploratif",
      descriptors: ["green", "mineral", "dry woods", "smoky resin"],
      routes: ["Parfum Niche", "Parfum Timur Tengah"],
      weights: {
        occasion: { koleksi: 4, acara: 2, santai: 1 },
        impressions: { hijau: 4, mineral: 5, smoky: 5, resinous: 3, tegas: 2 },
        intensity: { sedang: 2, tegas: 4 },
        environment: { "panas-terbuka": 1, "ruang-berac": 2, campuran: 2 },
      },
      conflicts: ["terlalu-smoky", "terlalu-tegas"],
    },
  ];

  const scentContextLabels = {
    lokal: "Parfum Lokal",
    niche: "Parfum Niche",
    "timur-tengah": "Parfum Timur Tengah",
    designer: "Parfum Designer",
  };

  const scoreScentProfiles = (answers) =>
    SCENT_PROFILES.map((profile, position) => {
      let score = 0;
      score += profile.weights.occasion?.[answers.occasion] || 0;
      answers.impressions.forEach((answer) => {
        score += profile.weights.impressions?.[answer] || 0;
      });
      score += profile.weights.intensity?.[answers.intensity] || 0;
      score += profile.weights.environment?.[answers.environment] || 0;
      answers.avoid.forEach((answer) => {
        if (profile.conflicts.includes(answer)) score -= 6;
      });
      return { ...profile, score, position };
    })
      .sort((a, b) => b.score - a.score || a.position - b.position)
      .slice(0, 2);

  const initScentFinder = (root) => {
    const form = select(root, "[data-scent-form],[data-widget-form]");
    if (!form) return;
    const result = select(root, "[data-scent-result],[data-widget-result]");
    const summaryContainer = select(root, "[data-scent-summary],[data-widget-summary]");
    let currentSummary = null;

    getNamedControls(form, ["impressions", "impression"]).forEach((control) => {
      control.addEventListener("change", () => {
        const selected = valuesOf(form, "impressions", "impression");
        if (selected.length <= 3) return;
        control.checked = false;
        announce(root, "Pilih maksimal tiga kesan aroma.");
      });
    });
    getNamedControls(form, ["avoid"]).forEach((control) => {
      control.addEventListener("change", () => {
        const controls = getNamedControls(form, ["avoid"]);
        if (control.value === "belum-tahu" && control.checked) {
          controls.forEach((item) => {
            if (item !== control) item.checked = false;
          });
        } else if (control.checked) {
          const unknown = controls.find((item) => item.value === "belum-tahu");
          if (unknown) unknown.checked = false;
        }
      });
    });

    const presentResult = () => {
      const answers = {
        context: root.dataset.context || "lokal",
        occasion: valueOf(form, "occasion"),
        impressions: valuesOf(form, "impressions", "impression"),
        intensity: valueOf(form, "intensity"),
        environment: valueOf(form, "environment"),
        avoid: valuesOf(form, "avoid"),
      };
      const profiles = scoreScentProfiles(answers);
      const cards = makeElement("div", "widget-result-grid");
      profiles.forEach((profile, index) => {
        const card = makeElement("article", "widget-result-card");
        card.append(
          makeElement("p", "kicker", index === 0 ? "Arah utama" : "Arah alternatif"),
          makeElement("h4", "", profile.label),
          makeElement(
            "p",
            "",
            `Karakter yang dapat dieksplorasi: ${profile.descriptors.join(", ")}.`,
          ),
          makeElement("p", "fine", `Kategori untuk dipelajari: ${profile.routes.join(" dan ")}.`),
        );
        cards.append(card);
      });
      summaryContainer?.replaceChildren(cards);

      const pageLabel = scentContextLabels[answers.context] || humanize(answers.context);
      const occasionLabel = choiceLabel(form, "occasion", answers.occasion);
      const impressionLabels = listLabels(
        form,
        getNamedControls(form, ["impressions"]).length ? "impressions" : "impression",
        answers.impressions,
      );
      const intensityLabel = choiceLabel(form, "intensity", answers.intensity);
      const environmentLabel = choiceLabel(form, "environment", answers.environment);
      const avoidLabels = answers.avoid.length
        ? listLabels(form, "avoid", answers.avoid)
        : ["Belum ditentukan"];
      const direction = profiles.map((profile) => profile.label).join("; ");
      const message = composeMessage([
        "Halo PT Digdaya Inovasi Nusantara,",
        "saya ingin berkonsultasi tentang parfum.",
        "",
        `Halaman asal: ${pageLabel}`,
        `Konteks pemakaian: ${occasionLabel}`,
        `Kesan yang dicari: ${impressionLabels.join(", ")}`,
        `Intensitas: ${intensityLabel}`,
        `Lingkungan: ${environmentLabel}`,
        `Karakter yang dihindari: ${avoidLabels.join(", ")}`,
        `Arah eksplorasi dari panduan: ${direction}`,
        "",
        "Mohon bantu periksa pilihan dan ketersediaan yang relevan. Saya memahami hasil panduan bukan jaminan kecocokan atau stok.",
      ]);
      currentSummary = setWidgetSummary(root, {
        service: "Parfum",
        message,
        whatsappText: message,
      });
      const wa = select(root, "[data-scent-wa],[data-widget-wa]");
      if (wa) wa.href = buildWhatsAppUrl(message);
      showNode(form, false);
      showNode(result, true);
      focusNode(result);
    };

    const stepper = createStepper({
      root,
      form,
      stepSelector: "[data-scent-step]",
      previousSelector: "[data-scent-prev]",
      nextSelector: "[data-scent-next]",
      submitSelector: "[data-scent-submit]",
      validateStep: (index, step) => {
        const key = step?.dataset.scentStep || "";
        if (key === "impression" && !valuesOf(form, "impressions", "impression").length) {
          return showError(
            root,
            "Pilih minimal satu dan maksimal tiga kesan aroma.",
            getNamedControls(form, ["impressions", "impression"])[0],
          );
        }
        if (key === "avoid" && valuesOf(form, "avoid").length > 3) {
          return showError(root, "Pilih maksimal tiga batas preferensi.", getNamedControls(form, ["avoid"])[0]);
        }
        return true;
      },
      onSubmit: presentResult,
    });

    select(root, "[data-scent-reset],[data-widget-reset]")?.addEventListener("click", () => {
      form.reset();
      currentSummary = null;
      showNode(result, false);
      showNode(form, true);
      stepper.reset();
      focusNode(select(form, "legend,[data-step-title]") || form);
    });
    bindInquiryForms(root, () => currentSummary);
  };

  const normalizeDomainInput = (rawInput) => {
    const raw = cleanInline(rawInput, 500);
    const notes = [];
    const problems = [];
    let candidate = raw;
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(candidate)) {
      notes.push("Protokol tidak diperlukan dalam brief nama domain.");
      candidate = candidate.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "");
    }
    if (/[/?#]/.test(candidate)) {
      notes.push("Path, query, atau fragmen dipisahkan dari nama domain untuk preview.");
      candidate = candidate.split(/[/?#]/)[0];
    }
    candidate = candidate.replace(/\.$/, "").toLocaleLowerCase("id-ID");
    if (/\s/.test(candidate)) problems.push("Nama memuat spasi.");
    if (candidate.length > 253) problems.push("Panjang nama melampaui 253 karakter.");
    const unicode = /[^\x00-\x7F]/.test(candidate);
    if (unicode) notes.push("Format IDN/Unicode perlu diperiksa langsung pada registrar.");
    const labels = candidate.split(".");
    if (labels.some((label) => !label)) problems.push("Terdapat label domain yang kosong.");
    labels.forEach((label) => {
      if (label.length > 63) problems.push("Salah satu label melampaui 63 karakter.");
      if (/^-|-$/.test(label)) problems.push("Tanda hubung berada pada awal atau akhir label.");
      if (!unicode && label && !/^[a-z0-9-]+$/i.test(label)) {
        problems.push("Nama memuat karakter ASCII di luar huruf, angka, atau tanda hubung.");
      }
    });
    const core = labels[0] === "www" && labels.length > 2 ? labels[1] : labels[0] || "";
    if (core.length <= 15) notes.push("Nama inti tergolong ringkas (maksimal 15 karakter).");
    else if (core.length <= 24) notes.push("Nama inti memiliki panjang sedang (16–24 karakter).");
    else notes.push("Nama inti relatif panjang dan perlu diuji keterbacaannya.");
    const hyphens = (core.match(/-/g) || []).length;
    const digits = (core.match(/\d/g) || []).length;
    if (hyphens >= 2) notes.push("Nama memuat beberapa tanda hubung; uji kemudahan penyebutan dan pengetikan.");
    if (digits >= 3) notes.push("Nama memuat beberapa angka; uji apakah angka mudah dipahami ketika disebutkan.");
    if (labels.length < 2) notes.push("Ekstensi belum terlihat pada nama yang dimasukkan.");
    return { raw, candidate, notes: [...new Set(notes)], problems: [...new Set(problems)] };
  };

  const initDomainChecker = (root) => {
    const form = select(root, "[data-domain-form],[data-widget-form]");
    if (!form) return;
    const result = select(root, "[data-domain-result],[data-widget-result]");
    const buyPanel = select(root, "[data-mode-panel='buy']");
    const sellPanel = select(root, "[data-mode-panel='sell']");
    let currentSummary = null;

    const syncMode = () => {
      const intent = valueOf(form, "domain_intent", "intent");
      setConditionalPanel(buyPanel, ["buy", "evaluate"].includes(intent));
      setConditionalPanel(sellPanel, intent === "sell");
    };
    getNamedControls(form, ["domain_intent", "intent"]).forEach((control) =>
      control.addEventListener("change", syncMode),
    );

    const queryIntent = new URLSearchParams(globalThis.location?.search || "").get("intent");
    if (["buy", "sell", "evaluate"].includes(queryIntent)) {
      const control = getNamedControls(form, ["domain_intent", "intent"]).find(
        (item) => item.value === queryIntent,
      );
      if (control) control.checked = true;
    }
    syncMode();

    const presentResult = () => {
      clearError(root);
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const intent = valueOf(form, "domain_intent", "intent");
      const domain = normalizeDomainInput(valueOf(form, "domain"));
      const purpose = valueOf(form, "purpose");
      const market = valueOf(form, "market");
      const extensions = valuesOf(form, "extensions", "extension");
      const priorities = valuesOf(form, "priorities", "priority");
      const registrar = valueOf(form, "registrar");
      const expiry = valueOf(form, "expiry");
      const accountControl = valueOf(form, "accountControl", "account_control");
      const historyKnown = valueOf(form, "historyKnown", "history_known");
      const notes = valueOf(form, "notes");
      const alternatives = valueOf(form, "alternatives");

      if (!intent || !domain.raw) {
        showError(root, "Pilih kebutuhan dan masukkan nama domain.", getNamedControls(form, ["domain"])[0]);
        return;
      }

      const completenessFields = [intent, domain.raw, purpose, market, extensions.length, priorities.length];
      if (intent === "sell") completenessFields.push(accountControl, historyKnown);
      const complete = completenessFields.filter(Boolean).length;
      if (intent === "sell" && accountControl && accountControl !== "yes") {
        domain.problems.push("Kontrol akun belum dikonfirmasi; kepemilikan dan kewenangan transfer wajib diverifikasi.");
      }
      const status = domain.problems.length
        ? "Perlu diperbaiki sebelum pemeriksaan registrar"
        : domain.notes.length > 2 || complete < completenessFields.length
          ? "Perlu perhatian"
          : "Siap dilanjutkan ke pemeriksaan resmi";

      renderDefinitionList(select(root, "[data-domain-summary],[data-widget-summary]"), [
        ["Status brief", status],
        ["Nama untuk diperiksa", domain.candidate || domain.raw],
        ["Kelengkapan", `${complete} dari ${completenessFields.length} bagian terisi`],
        ["Tujuan", purpose ? choiceLabel(form, "purpose", purpose) : "Belum diisi"],
        ["Pasar", market ? choiceLabel(form, "market", market) : "Belum diisi"],
      ]);
      renderBulletList(
        select(root, "[data-domain-format-notes]"),
        [...domain.problems, ...domain.notes].length
          ? [...domain.problems, ...domain.notes]
          : ["Tidak ada catatan format dasar; pemeriksaan registrar tetap diperlukan."],
      );
      const nextSteps = [
        "Periksa status atau ketersediaan pada registrar ketika proses berlangsung.",
        "Tinjau penggunaan sebelumnya, konteks merek, biaya, dan ketentuan ekstensi.",
        "Catat pihak, metode, tanggung jawab, serta bukti perpindahan sebelum transaksi.",
      ];
      if (intent === "sell") {
        nextSteps.unshift("Verifikasi kontrol akun dan kewenangan pihak yang menawarkan domain.");
      }
      renderBulletList(select(root, "[data-domain-next-steps]"), nextSteps);

      const intentLabel = choiceLabel(
        form,
        getNamedControls(form, ["domain_intent"]).length ? "domain_intent" : "intent",
        intent,
      );
      const message = composeMessage([
        "Halo PT Digdaya Inovasi Nusantara,",
        "saya ingin berkonsultasi tentang domain.",
        "",
        `Kebutuhan: ${intentLabel}`,
        `Nama domain: ${domain.candidate || domain.raw}`,
        `Tujuan penggunaan: ${purpose ? choiceLabel(form, "purpose", purpose) : "Belum ditentukan"}`,
        `Pasar: ${market ? choiceLabel(form, "market", market) : "Belum ditentukan"}`,
        `Ekstensi: ${extensions.length ? listLabels(form, "extensions", extensions).join(", ") : "Belum ditentukan"}`,
        `Prioritas: ${priorities.length ? listLabels(form, "priorities", priorities).join(", ") : "Belum ditentukan"}`,
        alternatives ? `Alternatif nama: ${alternatives}` : null,
        registrar ? `Registrar: ${registrar}` : null,
        expiry ? `Tanggal kedaluwarsa: ${expiry}` : null,
        accountControl ? `Kontrol akun: ${humanize(accountControl)}` : null,
        historyKnown ? `Riwayat diketahui: ${humanize(historyKnown)}` : null,
        notes ? `Catatan: ${notes}` : null,
        `Catatan format awal: ${[...domain.problems, ...domain.notes].join("; ") || "Tidak ada catatan format dasar"}`,
        "",
        "Mohon bantu periksa status, informasi terkait, biaya, dan alur berikutnya. Saya memahami checker tidak memastikan ketersediaan, kepemilikan, valuasi, riwayat, atau keamanan merek.",
      ]);
      currentSummary = setWidgetSummary(root, {
        service: "Beli atau jual domain",
        message,
        whatsappText: message,
      });
      const wa = select(root, "[data-domain-wa],[data-widget-wa]");
      if (wa) wa.href = buildWhatsAppUrl(message);
      showNode(form, false);
      showNode(result, true);
      focusNode(result);
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      presentResult();
    });
    select(root, "[data-domain-reset],[data-widget-reset]")?.addEventListener("click", () => {
      form.reset();
      currentSummary = null;
      showNode(result, false);
      showNode(form, true);
      const intent = getNamedControls(form, ["domain_intent", "intent"])[0];
      if (intent) intent.checked = true;
      syncMode();
      focusNode(intent || form);
    });
    bindInquiryForms(root, () => currentSummary);
  };

  const PROJECT_TYPE_PREFILLS = {
    landing: "landing-page",
    company: "company-profile",
    catalog: "information-catalog",
    development: "feature-development",
  };

  const initWebsiteScopeBuilder = (root) => {
    const form = select(root, "[data-scope-form],[data-widget-form]");
    if (!form) return;
    const result = select(root, "[data-scope-result],[data-widget-result]");
    const currentUrlPanel = select(root, "[data-scope-current-url]");
    const targetDatePanel = select(root, "[data-scope-target-date]");
    let currentSummary = null;

    const limitSelection = (names, limit, message) => {
      getNamedControls(form, names).forEach((control) => {
        control.addEventListener("change", () => {
          const selected = valuesOf(form, ...names);
          if (selected.length <= limit) return;
          control.checked = false;
          announce(root, message);
        });
      });
    };
    limitSelection(["goals", "goal"], 3, "Pilih maksimal tiga tujuan utama.");
    limitSelection(["features", "feature"], 6, "Pilih maksimal enam fitur untuk dibahas.");

    const syncConditionalFields = () => {
      const projectType = valueOf(form, "projectType", "project_type");
      const development = ["redesign", "feature-development"].includes(projectType);
      setConditionalPanel(currentUrlPanel, development && !hasHiddenAncestor(currentUrlPanel));
      const targetMode = valueOf(form, "targetMode", "target_mode");
      setConditionalPanel(targetDatePanel, targetMode === "target-date" && !hasHiddenAncestor(targetDatePanel));
    };
    getNamedControls(form, ["projectType", "project_type"]).forEach((control) =>
      control.addEventListener("change", syncConditionalFields),
    );
    getNamedControls(form, ["targetMode", "target_mode"]).forEach((control) =>
      control.addEventListener("change", syncConditionalFields),
    );

    const prefill = new URLSearchParams(globalThis.location?.search || "").get("type");
    const prefillValue = PROJECT_TYPE_PREFILLS[prefill];
    if (prefillValue) {
      const control = getNamedControls(form, ["projectType", "project_type"]).find(
        (item) => item.value === prefillValue,
      );
      if (control) control.checked = true;
    }

    const presentResult = () => {
      const projectType = valueOf(form, "projectType", "project_type");
      const goals = valuesOf(form, "goals", "goal");
      const pageRange = valueOf(form, "pageRange", "page_range");
      const features = valuesOf(form, "features", "feature");
      const contentReadiness = valueOf(form, "contentReadiness", "content_readiness");
      const domainHosting = valueOf(form, "domainHosting", "domain_hosting");
      const currentUrl = valueOf(form, "currentUrl", "current_url");
      const targetMode = valueOf(form, "targetMode", "target_mode");
      const targetDate = valueOf(form, "targetDate", "target_date");
      const budget = valueOf(form, "budget");
      const notes = valueOf(form, "notes");
      if (!projectType || !goals.length || !pageRange) {
        showError(root, "Lengkapi jenis proyek, tujuan, dan perkiraan jumlah halaman.", getNamedControls(form, ["projectType", "project_type"])[0]);
        return;
      }

      let complexity = 1;
      complexity += { "1": 0, "2-5": 1, "6-10": 3, "11-plus": 5, unknown: 1 }[pageRange] || 0;
      const advanced = new Set(["cms", "multilingual", "payment", "user-account", "api-integration"]);
      features.forEach((feature) => {
        complexity += advanced.has(feature) ? 2 : 1;
      });
      if (["redesign", "feature-development"].includes(projectType)) complexity += 2;
      if (["not-ready", "need-help"].includes(contentReadiness)) complexity += 1;
      const scopeLabel =
        complexity <= 4
          ? "Ringkas untuk dibahas"
          : complexity <= 9
            ? "Menengah untuk dibahas"
            : "Lanjutan untuk dibahas";
      const projectName = choiceLabel(
        form,
        getNamedControls(form, ["projectType"]).length ? "projectType" : "project_type",
        projectType,
      );
      const goalLabels = listLabels(
        form,
        getNamedControls(form, ["goals"]).length ? "goals" : "goal",
        goals,
      );
      const featureLabels = features.length
        ? listLabels(
            form,
            getNamedControls(form, ["features"]).length ? "features" : "feature",
            features,
          )
        : ["Belum ditentukan"];
      renderDefinitionList(select(root, "[data-scope-summary],[data-widget-summary]"), [
        ["Jenis proyek", projectName],
        ["Tujuan", goalLabels.join(", ")],
        ["Perkiraan halaman", choiceLabel(form, getNamedControls(form, ["pageRange"]).length ? "pageRange" : "page_range", pageRange)],
        ["Fitur untuk dibahas", featureLabels.join(", ")],
        ["Kesiapan konten", contentReadiness ? humanize(contentReadiness) : "Belum ditentukan"],
        ["Ruang lingkup awal", scopeLabel],
      ]);
      renderBulletList(select(root, "[data-scope-next-steps]"), [
        "Konfirmasi sitemap, prioritas, tanggung jawab konten, dan kriteria penerimaan.",
        "Tinjau integrasi, keamanan, lisensi, aksesibilitas, serta biaya pihak ketiga.",
        "Sepakati revisi, serah terima akses, kepemilikan aset, dan pemeliharaan.",
      ]);

      const service = ["redesign", "feature-development"].includes(projectType)
        ? "Pengembangan website"
        : "Pembuatan website";
      const message = composeMessage([
        "Halo PT Digdaya Inovasi Nusantara,",
        "saya ingin mendiskusikan website.",
        "",
        `Jenis proyek: ${projectName}`,
        `Tujuan utama: ${goalLabels.join(", ")}`,
        `Perkiraan halaman: ${choiceLabel(form, getNamedControls(form, ["pageRange"]).length ? "pageRange" : "page_range", pageRange)}`,
        `Fitur untuk dibahas: ${featureLabels.join(", ")}`,
        `Kesiapan konten: ${contentReadiness ? humanize(contentReadiness) : "Belum ditentukan"}`,
        `Status domain/hosting: ${domainHosting ? humanize(domainHosting) : "Belum ditentukan"}`,
        currentUrl ? `Website saat ini: ${currentUrl}` : null,
        `Target waktu: ${targetMode ? humanize(targetMode) : "Belum ditentukan"}${targetDate ? ` — ${targetDate}` : ""}`,
        `Kisaran anggaran: ${budget || "Belum ditentukan"}`,
        notes ? `Catatan: ${notes}` : null,
        `Ruang lingkup awal: ${scopeLabel}`,
        "",
        "Ringkasan ini adalah brief awal dan belum merupakan penawaran, estimasi final, komitmen fitur, atau kesepakatan proyek.",
      ]);
      currentSummary = setWidgetSummary(root, {
        service,
        budget,
        message,
        whatsappText: message,
      });
      const wa = select(root, "[data-scope-wa],[data-widget-wa]");
      if (wa) wa.href = buildWhatsAppUrl(message);
      showNode(form, false);
      showNode(result, true);
      focusNode(result);
    };

    const stepper = createStepper({
      root,
      form,
      stepSelector: "[data-scope-step]",
      previousSelector: "[data-scope-prev]",
      nextSelector: "[data-scope-next]",
      submitSelector: "[data-scope-submit]",
      validateStep: (index, step) => {
        if (step?.querySelector('[name="goals"],[name="goal"]') && !valuesOf(form, "goals", "goal").length) {
          return showError(root, "Pilih minimal satu dan maksimal tiga tujuan.", getNamedControls(form, ["goals", "goal"])[0]);
        }
        if (valueOf(form, "targetMode", "target_mode") === "target-date" && !valueOf(form, "targetDate", "target_date")) {
          return showError(root, "Pilih tanggal target atau ubah target menjadi fleksibel.", getNamedControls(form, ["targetDate", "target_date"])[0]);
        }
        return true;
      },
      onStepChange: syncConditionalFields,
      onSubmit: presentResult,
    });
    syncConditionalFields();

    select(root, "[data-scope-reset],[data-widget-reset]")?.addEventListener("click", () => {
      form.reset();
      currentSummary = null;
      showNode(result, false);
      showNode(form, true);
      stepper.reset();
      syncConditionalFields();
      focusNode(select(form, "legend,[data-step-title]") || form);
    });
    bindInquiryForms(root, () => currentSummary);
  };

  const initTopupWizard = (root) => {
    const form = select(root, "[data-topup-form],[data-widget-form]");
    if (!form) return;
    const result = select(root, "[data-topup-result],[data-widget-result]");
    const serverPanel = select(root, "[data-topup-server]");
    let currentSummary = null;

    const syncServer = () => {
      const controls = getNamedControls(form, ["serverRequired", "server_required"]);
      const required = controls.length ? checkedOf(form, "serverRequired", "server_required") : true;
      setConditionalPanel(serverPanel, required && !hasHiddenAncestor(serverPanel));
      const server = getNamedControls(form, ["server", "zone"])[0];
      if (server) server.required = required;
    };
    getNamedControls(form, ["serverRequired", "server_required"]).forEach((control) =>
      control.addEventListener("change", syncServer),
    );

    const collectAnswers = () => ({
      game: valueOf(form, "game"),
      publicId: valueOf(form, "publicId", "public_id", "playerId", "player_id"),
      serverRequired: getNamedControls(form, ["serverRequired", "server_required"]).length
        ? checkedOf(form, "serverRequired", "server_required")
        : Boolean(valueOf(form, "server", "zone")),
      server: valueOf(form, "server", "zone"),
      product: valueOf(form, "product", "nominal"),
      notes: valueOf(form, "notes"),
      destinationChecked: checkedOf(form, "destinationChecked", "destination_checked"),
      noSecretsConfirmed: checkedOf(form, "noSecretsConfirmed", "no_secrets_confirmed"),
    });

    const renderReview = () => {
      const answers = collectAnswers();
      renderDefinitionList(select(root, "[data-topup-review]"), [
        ["Game/platform", answers.game],
        ["ID tujuan", answers.publicId],
        ["Server/zone", answers.server || "Tidak dicantumkan"],
        ["Produk/nominal", answers.product],
        ["Catatan", answers.notes || "Tidak ada"],
      ]);
    };

    const validateAnswers = (answers) => {
      if (!answers.game || !answers.publicId || !answers.product) {
        return showError(root, "Lengkapi game, ID tujuan, dan produk atau nominal.", getNamedControls(form, ["game"])[0]);
      }
      if (answers.serverRequired && !answers.server) {
        return showError(root, "Masukkan server/zone atau nyatakan bahwa server tidak diperlukan.", getNamedControls(form, ["server", "zone"])[0]);
      }
      if (SECRET_PATTERN.test(answers.notes)) {
        return showError(root, "Hapus password, OTP, PIN, kode pemulihan, atau data rahasia dari catatan.", getNamedControls(form, ["notes"])[0]);
      }
      if (!answers.destinationChecked || !answers.noSecretsConfirmed) {
        return showError(root, "Konfirmasi bahwa data tujuan sudah diperiksa dan tidak memuat data rahasia.", getNamedControls(form, ["destinationChecked", "destination_checked"])[0]);
      }
      return true;
    };

    const presentResult = () => {
      const answers = collectAnswers();
      if (!validateAnswers(answers)) return;
      renderDefinitionList(select(root, "[data-topup-summary],[data-widget-summary]"), [
        ["Game/platform", answers.game],
        ["ID tujuan", answers.publicId],
        ["Server/zone", answers.server || "Tidak diperlukan/dicantumkan"],
        ["Produk/nominal", answers.product],
        ["Catatan", answers.notes || "Tidak ada"],
      ]);
      const message = composeMessage([
        "Halo PT Digdaya Inovasi Nusantara,",
        "saya ingin menanyakan top up game.",
        "",
        `Game/platform: ${answers.game}`,
        `ID tujuan: ${answers.publicId}`,
        `Server/zone: ${answers.server || "Tidak diperlukan/dicantumkan"}`,
        `Produk/nominal: ${answers.product}`,
        answers.notes ? `Catatan: ${answers.notes}` : null,
        "",
        "Saya sudah memeriksa data tujuan dan tidak mengirim password, OTP, PIN, kode pemulihan, data kartu, atau akses akun.",
        "",
        "Mohon konfirmasi ketersediaan, harga saat ini, dan rincian proses sebelum transaksi.",
      ]);
      currentSummary = setWidgetSummary(root, {
        service: "Top up game",
        message,
        whatsappText: message,
      });
      const wa = select(root, "[data-topup-wa],[data-widget-wa]");
      if (wa) wa.href = buildWhatsAppUrl(message);
      showNode(form, false);
      showNode(result, true);
      focusNode(result);
    };

    const stepper = createStepper({
      root,
      form,
      stepSelector: "[data-topup-step]",
      previousSelector: "[data-topup-prev]",
      nextSelector: "[data-topup-next]",
      submitSelector: "[data-topup-submit]",
      validateStep: (index, step) => {
        const notes = valueOf(form, "notes");
        if (step?.querySelector('[name="notes"]') && SECRET_PATTERN.test(notes)) {
          return showError(root, "Hapus kata atau data rahasia dari catatan.", getNamedControls(form, ["notes"])[0]);
        }
        return true;
      },
      onStepChange: () => {
        syncServer();
        renderReview();
      },
      onSubmit: presentResult,
    });
    syncServer();

    select(root, "[data-topup-reset],[data-widget-reset]")?.addEventListener("click", () => {
      form.reset();
      currentSummary = null;
      showNode(result, false);
      showNode(form, true);
      stepper.reset();
      syncServer();
      focusNode(select(form, "legend,[data-step-title]") || form);
    });
    bindInquiryForms(root, () => currentSummary);
  };

  const writeClipboard = async (value) => {
    if (navigator.clipboard?.writeText && globalThis.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.append(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    if (!copied) throw new Error("Clipboard unavailable");
  };

  const initNewsFilter = (root) => {
    const scope = root.closest("main") || document;
    const search = select(root, "[data-news-search],input[type='search']");
    const filterButtons = selectAll(root, "[data-news-filter]");
    const count = select(root, "[data-news-count]");
    const empty = select(root, "[data-news-empty]");
    const reset = select(root, "[data-news-reset]");
    const groups = new Map();
    selectAll(scope, "[data-article-id]").forEach((node) => {
      const id = node.dataset.articleId;
      if (!id) return;
      const group = groups.get(id) || {
        id,
        nodes: [],
        category: node.dataset.category || "",
        title: node.dataset.title || "",
        keywords: node.dataset.keywords || "",
        corpus: "",
      };
      group.nodes.push(node);
      group.category ||= node.dataset.category || "";
      group.title ||= node.dataset.title || "";
      group.keywords += ` ${node.dataset.keywords || ""}`;
      group.corpus += ` ${node.textContent || ""}`;
      groups.set(id, group);
    });
    let category = "all";
    let debounceId = 0;

    const apply = () => {
      const query = normalizeSearchText(search?.value || "");
      let visible = 0;
      groups.forEach((group) => {
        const corpus = normalizeSearchText(
          `${group.title} ${group.keywords} ${group.corpus}`,
        );
        const matchesCategory = category === "all" || group.category === category;
        const matchesQuery = !query || corpus.includes(query);
        const matches = matchesCategory && matchesQuery;
        group.nodes.forEach((node) => showNode(node, matches));
        if (matches) visible += 1;
      });
      setNodeText(count, `Menampilkan ${visible} dari ${groups.size} artikel.`);
      showNode(empty, visible === 0);
    };

    search?.addEventListener("input", () => {
      globalThis.clearTimeout(debounceId);
      debounceId = globalThis.setTimeout(apply, 180);
    });
    select(root, "[data-news-search-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      apply();
    });
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        category = button.dataset.newsFilter || "all";
        filterButtons.forEach((item) =>
          item.setAttribute("aria-pressed", String(item === button)),
        );
        apply();
      });
    });
    reset?.addEventListener("click", () => {
      if (search) search.value = "";
      category = "all";
      filterButtons.forEach((button) =>
        button.setAttribute("aria-pressed", String(button.dataset.newsFilter === "all")),
      );
      apply();
      focusNode(search);
    });

    const canonical =
      document.querySelector('link[rel="canonical"]')?.href ||
      globalThis.location?.href?.split("#")[0] ||
      "";
    const articleUrl = (id, first) => {
      if (first?.matches("article[data-widget='news-filter']")) return canonical.split("#")[0];
      const href = first?.querySelector("a.card-link[href]")?.getAttribute("href");
      if (href) return new URL(href, canonical).href;
      return `${canonical.split("#")[0]}#${encodeURIComponent(id)}`;
    };
    const articleInfo = (id) => {
      const group = groups.get(id);
      const first = group?.nodes[0];
      return {
        title: cleanInline(
          group?.title || first?.querySelector("h2,h3")?.textContent || "Wawasan Digdaya",
          180,
        ),
        description: cleanInline(first?.querySelector("p")?.textContent, 180),
        url: articleUrl(id, first),
      };
    };

    selectAll(scope, "[data-copy-article]").forEach((button) => {
      if (button.dataset.copyReady === "true") return;
      button.dataset.copyReady = "true";
      button.addEventListener("click", async () => {
        const label = select(button, "[data-copy-label]") || button;
        const original = label.textContent;
        try {
          await writeClipboard(articleInfo(button.dataset.copyArticle).url);
          setNodeText(label, "Tautan tersalin");
          announce(root, "Tautan artikel berhasil disalin.");
          focusNode(button);
          globalThis.setTimeout(() => setNodeText(label, original), 2000);
        } catch {
          announce(root, "Tautan belum dapat disalin pada perangkat ini.");
        }
      });
    });
    selectAll(scope, "[data-share-article]").forEach((button) => {
      if (button.dataset.shareReady === "true") return;
      button.dataset.shareReady = "true";
      button.addEventListener("click", async () => {
        const info = articleInfo(button.dataset.shareArticle);
        if (navigator.share) {
          try {
            await navigator.share({
              title: info.title,
              text: info.description,
              url: info.url,
            });
            announce(root, "Panel berbagi telah dibuka.");
          } catch (error) {
            if (error?.name !== "AbortError") {
              announce(root, "Artikel belum dapat dibagikan pada perangkat ini.");
            }
          }
          return;
        }
        try {
          await writeClipboard(info.url);
          announce(root, "Tautan disalin untuk dibagikan.");
        } catch {
          announce(root, "Tautan belum dapat disalin pada perangkat ini.");
        } finally {
          focusNode(button);
        }
      });
    });

    const revealHashTarget = () => {
      let id = "";
      try {
        id = decodeURIComponent((globalThis.location?.hash || "").slice(1));
      } catch {
        return;
      }
      if (!id || !groups.has(id)) return;
      if (search) search.value = "";
      category = "all";
      filterButtons.forEach((button) =>
        button.setAttribute("aria-pressed", String(button.dataset.newsFilter === "all")),
      );
      apply();
    };
    globalThis.addEventListener("hashchange", revealHashTarget);
    revealHashTarget();
    apply();
  };

  const openInquiry = (options = {}) => {
    const dialog =
      document.querySelector("[data-inquiry-dialog]") ||
      document.getElementById("inquiry-dialog");
    if (!dialog) return false;
    const summary = normalizeSummary(options);
    dialogContexts.set(dialog, summary);
    selectAll(dialog, "[data-inquiry-form]").forEach((form) => {
      form.dataset.inquiryService = summary.service;
      form.dataset.inquiryBudget = summary.budget;
      form.dataset.inquiryMessage = summary.message;
      form.dataset.inquiryWa = summary.whatsappText;
      const serviceControl = getNamedControls(form, ["service"])[0];
      if (serviceControl && VALID_SERVICES.has(summary.service)) {
        serviceControl.value = summary.service;
      }
      const budgetControl = getNamedControls(form, ["budget"])[0];
      if (budgetControl && !budgetControl.value && summary.budget) {
        budgetControl.value = summary.budget;
      }
      const messageControl = getNamedControls(form, ["message"])[0];
      if (messageControl) messageControl.value = cleanText(summary.message, MAX_MESSAGE_LENGTH);
    });
    setNodeText(select(dialog, "[data-inquiry-context]"), summary.message);
    selectAll(dialog, "[data-inquiry-wa]").forEach((link) => {
      link.href = buildWhatsAppUrl(summary.whatsappText);
    });
    bindInquiryForms(dialog, () => dialogContexts.get(dialog));
    selectAll(dialog, "[data-inquiry-form]").forEach((form) => {
      form.dispatchEvent(new CustomEvent("digdaya:inquiry-reset"));
    });
    dialog.removeAttribute("hidden");
    dialog.removeAttribute("aria-hidden");

    if (typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
    } else {
      showNode(dialog, true);
      dialog.setAttribute("aria-modal", "true");
    }
    const first = select(dialog, "input:not([type='hidden']),select,textarea,button");
    globalThis.requestAnimationFrame?.(() => focusNode(first));
    return true;
  };

  const closeInquiry = (dialog) => {
    if (!dialog) return;
    if (typeof dialog.close === "function" && dialog.open) {
      dialog.close();
      return;
    }
    selectAll(dialog, "[data-inquiry-form]").forEach((form) => {
      form.dispatchEvent(new CustomEvent("digdaya:inquiry-reset"));
    });
    if (typeof dialog.close !== "function") showNode(dialog, false);
  };

  const bindDelegatedControls = () => {
    if (delegatedControlsReady) return;
    delegatedControlsReady = true;
    document.addEventListener("click", (event) => {
      const opener = event.target.closest?.("[data-open-inquiry]");
      if (opener) {
        event.preventDefault();
        const widgetRoot = opener.closest("[data-widget]");
        const widgetSummary = widgetRoot ? widgetSummaries.get(widgetRoot) : null;
        openInquiry({
          service: opener.dataset.inquiryService || widgetSummary?.service,
          budget: opener.dataset.inquiryBudget || widgetSummary?.budget,
          message: opener.dataset.inquiryMessage || widgetSummary?.message,
          whatsappText: opener.dataset.inquiryWa || widgetSummary?.whatsappText,
        });
        return;
      }
      const closer = event.target.closest?.("[data-close-inquiry]");
      if (closer) {
        event.preventDefault();
        closeInquiry(closer.closest("[data-inquiry-dialog],dialog,#inquiry-dialog"));
      }
    });
    selectAll(document, "[data-inquiry-dialog],#inquiry-dialog").forEach((dialog) => {
      dialog.addEventListener("click", (event) => {
        if (event.target === dialog && dialog.tagName === "DIALOG") closeInquiry(dialog);
      });
    });
  };

  const widgetInitializers = {
    "service-finder": initServiceFinder,
    "scent-finder": initScentFinder,
    "domain-brief-checker": initDomainChecker,
    "website-scope-builder": initWebsiteScopeBuilder,
    "topup-request-wizard": initTopupWizard,
    "news-filter": initNewsFilter,
  };

  const init = (scope = document) => {
    selectAll(scope, "[data-widget]").forEach((root) => {
      if (initializedWidgets.has(root)) return;
      const initializer = widgetInitializers[root.dataset.widget];
      if (!initializer) return;
      initializedWidgets.add(root);
      try {
        initializer(root);
      } catch (error) {
        console.error("Digdaya widget initialization failed", {
          widget: root.dataset.widget,
          errorName: error instanceof Error ? error.name : typeof error,
        });
        announce(root, "Alat interaktif belum dapat dimuat. Gunakan tautan WhatsApp manual.");
      }
    });
    bindInquiryForms(scope, () => null);
    bindDelegatedControls();
  };

  globalThis.DigdayaWidgets = Object.freeze({
    init,
    buildWhatsAppUrl,
    buildInquiryPayload,
    submitInquiry,
    openInquiry,
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => init(), { once: true });
  } else {
    init();
  }
})();

  