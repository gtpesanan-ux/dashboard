(() => {
  "use strict";
  if (window.__DIRAC_CLIENT_SECURITY_BOUNDARY_V1__) return;
  window.__DIRAC_CLIENT_SECURITY_BOUNDARY_V1__ = true;

  const lastClean = new WeakMap();
  const text = (value) => String(value == null ? "" : value);

  const decodeEntities = (value) => text(value)
    .replace(/&#x([0-9a-f]{1,6});?/gi, (_, hex) => {
      const code = Number.parseInt(hex, 16);
      return Number.isFinite(code) && code <= 0x10ffff ? String.fromCodePoint(code) : " ";
    })
    .replace(/&#([0-9]{1,7});?/g, (_, dec) => {
      const code = Number.parseInt(dec, 10);
      return Number.isFinite(code) && code <= 0x10ffff ? String.fromCodePoint(code) : " ";
    })
    .replace(/&lt;?/gi, "<").replace(/&gt;?/gi, ">").replace(/&quot;?/gi, '"')
    .replace(/&apos;?/gi, "'").replace(/&colon;?/gi, ":").replace(/&sol;?/gi, "/")
    .replace(/&amp;?/gi, "&");

  const normalize = (value) => {
    let out = text(value).slice(0, 65536);
    try { out = out.normalize("NFKC"); } catch (_) {}
    out = out.replace(/%u([0-9a-f]{4})/gi, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)));
    out = out.replace(/\\x([0-9a-f]{2})/gi, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)));
    out = out.replace(/\\u\{([0-9a-f]{1,6})\}/gi, (_, hex) => {
      const code = Number.parseInt(hex, 16);
      return code <= 0x10ffff ? String.fromCodePoint(code) : " ";
    });
    out = out.replace(/\\u([0-9a-f]{4})/gi, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)));
    const percent = out.replace(/\+/g, " ");
    try { out = decodeURIComponent(percent); } catch (_) { out = percent; }
    out = decodeEntities(out);
    try { out = out.normalize("NFKC"); } catch (_) {}
    return out.replace(/[\u0000\u0008\u000b\u000c\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]/g, "").toLowerCase();
  };

  const RULES = Object.freeze([
    ["xss_html", /<\s*\/?\s*(?:script|iframe|object|embed|svg|math|meta|link|base|template)\b/i],
    ["xss_event", /\bon[a-z]{3,32}\s*=\s*(?:["']|[^\s>])/i],
    ["xss_scheme", /(?:javascript|vbscript|data\s*:\s*(?:text\/html|image\/svg\+xml))\s*:/i],
    ["xss_dom", /(?:srcdoc|xlink\s*:\s*href|formaction)\s*=|document\s*\.\s*(?:cookie|write|writeln)/i],
    ["sql_union", /\bunion\s+(?:all\s+|distinct\s+)?select\b/i],
    ["sql_statement", /\b(?:select\s+[\s\S]{1,160}\s+from|insert\s+into|update\s+[a-z0-9_.`"\[\]-]+\s+set|delete\s+from|drop\s+(?:table|database|schema)|alter\s+table|create\s+(?:table|database)|truncate\s+table)\b/i],
    ["sql_tautology", /(?:'|"|`)\s*(?:or|and)\s+(?:'[^']{0,40}'|"[^"]{0,40}"|\d+)\s*=\s*(?:'[^']{0,40}'|"[^"]{0,40}"|\d+)/i],
    ["sql_boolean", /(?:^|[\s('"`])(?:or|and)\s+\d+\s*=\s*\d+(?:$|[\s)'"`])/i],
    ["sql_time_file", /\b(?:sleep|benchmark|pg_sleep|xp_cmdshell|load_file|pg_read_file|extractvalue|updatexml)\s*\(|\bwaitfor\s+delay\b|\binto\s+(?:out|dump)file\b|\binformation_schema\s*\./i],
    ["nosql", /(?:^|[\s,{[])['"]?\$(?:where|ne|gt|gte|lt|lte|regex|in|nin|exists|expr|function|accumulator|or|and|not)['"]?\s*:/i],
    ["command_chain", /(?:;|&&|\|\||\|)\s*(?:\/[a-z0-9._/-]+\/)?(?:sh|bash|zsh|cmd(?:\.exe)?|powershell|pwsh|curl|wget|nc|ncat|netcat|python\d*|perl|ruby|php|node|chmod|chown|rm|cat|whoami|uname)\b/i],
    ["path_traversal", /\.\.[/\\]|\/(?:etc\/(?:passwd|shadow)|proc\/self\/(?:environ|cmdline)|var\/run\/secrets\/)|[a-z]:\\windows\\win\.ini/i],
    ["file_wrapper", /\b(?:php|file|expect|gopher|dict|phar|zip):\/\//i],
    ["ssrf", /https?:\/\/(?:localhost|127(?:\.\d{1,3}){0,3}|0\.0\.0\.0|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}|169\.254\.169\.254|169\.254\.170\.2|100\.100\.100\.200|metadata\.google\.internal)(?::\d+)?(?:[/?#]|$)/i],
    ["jndi", /\$\{\s*jndi\s*:\s*(?:ldap|ldaps|rmi|dns|iiop|corba):/i],
    ["crlf_header", /(?:\r\n|\n)(?:host|content-length|transfer-encoding|location|set-cookie|x-forwarded-(?:for|host|proto)|x-original-url)\s*:/i],
    ["prototype_pollution", /(?:["']?__proto__["']?|constructor\s*\.\s*prototype|prototype\s*\[\s*["'][^"']+["']\s*\])/i]
  ]);

  const check = (value) => {
    const raw = text(value);
    if (raw.length > 65536) return { detected: true, family: "oversized_input" };
    const normalized = normalize(raw);
    const hit = RULES.find((entry) => entry[1].test(normalized));
    return hit ? { detected: true, family: hit[0] } : { detected: false, family: "" };
  };

  const eligible = (node) => {
    if (!node || node.nodeType !== 1) return false;
    if (node.isContentEditable) return true;
    if (node.tagName === "TEXTAREA") return true;
    if (node.tagName !== "INPUT") return false;
    const type = text(node.type || "text").toLowerCase();
    return /^(?:text|search|url|email)$/.test(type) && !node.disabled && !node.readOnly;
  };

  const currentValue = (node) => node && node.isContentEditable ? text(node.textContent) : text(node && node.value);
  const restore = (node) => {
    const safe = lastClean.get(node) || "";
    if (node && node.isContentEditable) node.textContent = safe;
    else if (node) node.value = safe;
  };
  const warn = (family) => {
    window.alert(`Input dihentikan oleh perlindungan keamanan (${text(family).replace(/_/g, " ")}). Gunakan teks biasa tanpa pola perintah atau kode berbahaya.`);
  };
  const inspectNode = (node, candidate, event) => {
    if (!eligible(node)) return false;
    const result = check(candidate);
    if (!result.detected) {
      lastClean.set(node, candidate);
      return false;
    }
    if (event && event.cancelable) event.preventDefault();
    if (event) event.stopImmediatePropagation();
    restore(node);
    warn(result.family);
    return true;
  };

  document.addEventListener("focusin", (event) => {
    if (eligible(event.target)) lastClean.set(event.target, currentValue(event.target));
  }, true);

  document.addEventListener("beforeinput", (event) => {
    const node = event.target;
    if (!eligible(node) || event.isComposing || !event.data || /^delete/i.test(event.inputType || "")) return;
    const existing = currentValue(node);
    let candidate = existing + event.data;
    if (!node.isContentEditable && typeof node.selectionStart === "number" && typeof node.selectionEnd === "number") {
      candidate = existing.slice(0, node.selectionStart) + event.data + existing.slice(node.selectionEnd);
    }
    inspectNode(node, candidate, event);
  }, true);

  document.addEventListener("paste", (event) => {
    const node = event.target;
    if (!eligible(node)) return;
    const pasted = event.clipboardData ? text(event.clipboardData.getData("text/plain")) : "";
    if (!pasted) return;
    const existing = currentValue(node);
    let candidate = existing + pasted;
    if (!node.isContentEditable && typeof node.selectionStart === "number" && typeof node.selectionEnd === "number") {
      candidate = existing.slice(0, node.selectionStart) + pasted + existing.slice(node.selectionEnd);
    }
    inspectNode(node, candidate, event);
  }, true);

  document.addEventListener("drop", (event) => {
    const node = event.target;
    if (!eligible(node)) return;
    const dropped = event.dataTransfer ? text(event.dataTransfer.getData("text/plain")) : "";
    if (dropped) inspectNode(node, currentValue(node) + dropped, event);
  }, true);

  document.addEventListener("input", (event) => {
    const node = event.target;
    if (eligible(node)) inspectNode(node, currentValue(node), event);
  }, true);

  document.addEventListener("submit", (event) => {
    const form = event.target;
    if (!form || form.nodeName !== "FORM") return;
    const fields = Array.from(form.elements || []).filter(eligible);
    const bad = fields.find((node) => check(currentValue(node)).detected);
    if (!bad) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const result = check(currentValue(bad));
    restore(bad);
    warn(result.family || "unsafe_input");
  }, true);

  const suspiciousQuery = Array.from(new URLSearchParams(location.search).entries()).find((entry) => check(entry[1]).detected);
  if (suspiciousQuery) {
    const result = check(suspiciousQuery[1]);
    history.replaceState(history.state, document.title, location.pathname + location.hash);
    warn(result.family || "unsafe_query");
  }

  window.DiracClientSecurityBoundary = Object.freeze({ check, version: "dirac-client-security-boundary-v1" });
})();
