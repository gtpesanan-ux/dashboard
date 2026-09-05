/* DIGDAYA V21 — idempotent mobile-menu state repair. */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var MOBILE_QUERY = "(max-width: 1180px)";
  var REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

  function boot() {
    if (root.getAttribute("data-dig-v21-menu") === "ready") return;

    var menuButton = doc.querySelector(".menu-button[aria-controls='main-nav']");
    var navigation = doc.getElementById("main-nav");
    if (!menuButton || !navigation) return;

    root.setAttribute("data-dig-v21-menu", "ready");

    var backdrop = doc.querySelector(".nav-backdrop");
    var mobileMedia = window.matchMedia(MOBILE_QUERY);
    var reducedMedia = window.matchMedia(REDUCED_QUERY);
    var groups = Array.prototype.slice.call(navigation.querySelectorAll(".nav-group"));
    var navTimer = 0;
    var subnavState = new WeakMap();

    function isMobile() {
      return mobileMedia.matches;
    }

    function prefersReducedMotion() {
      return reducedMedia.matches;
    }

    function focusWithoutScroll(element) {
      if (!element || typeof element.focus !== "function") return;
      try {
        element.focus({ preventScroll: true });
      } catch (error) {
        element.focus();
      }
    }

    function setExpandedLabel(toggle, expanded) {
      if (!toggle) return;
      var group = toggle.closest(".nav-group");
      var parent = group ? group.querySelector(".nav-parent") : null;
      var label = parent && parent.textContent.trim() ? parent.textContent.trim() : "navigasi";
      toggle.setAttribute("aria-label", (expanded ? "Tutup submenu " : "Buka submenu ") + label);
    }

    function clearSubnavTimer(flyout) {
      var state = subnavState.get(flyout);
      if (state && state.timer) window.clearTimeout(state.timer);
      if (state && state.onEnd) flyout.removeEventListener("transitionend", state.onEnd);
      return state ? state.token + 1 : 1;
    }

    function clearSubnavInlineStyles(flyout) {
      flyout.style.removeProperty("height");
      flyout.style.removeProperty("--dig-v21-subnav-duration");
    }

    function releaseSubnav(group) {
      var toggle = group.querySelector(".nav-toggle");
      var flyout = group.querySelector(".nav-flyout");
      if (!toggle || !flyout) return;

      clearSubnavTimer(flyout);
      subnavState.delete(flyout);
      flyout.classList.remove("dig-v21-subnav-open", "dig-v21-subnav-animating");
      flyout.removeAttribute("aria-hidden");
      flyout.removeAttribute("inert");
      clearSubnavInlineStyles(flyout);
    }

    function settleSubnav(group, expanded) {
      var toggle = group.querySelector(".nav-toggle");
      var flyout = group.querySelector(".nav-flyout");
      if (!toggle || !flyout) return;

      clearSubnavTimer(flyout);
      subnavState.delete(flyout);
      clearSubnavInlineStyles(flyout);
      flyout.classList.remove("dig-v21-subnav-animating");
      setExpandedLabel(toggle, expanded);

      if (expanded) {
        flyout.hidden = false;
        flyout.removeAttribute("aria-hidden");
        flyout.removeAttribute("inert");
        flyout.classList.add("dig-v21-subnav-open");
      } else {
        flyout.classList.remove("dig-v21-subnav-open");
        flyout.setAttribute("aria-hidden", "true");
        flyout.setAttribute("inert", "");
        flyout.hidden = true;
      }
    }

    function animateSubnav(group, expanded) {
      var toggle = group.querySelector(".nav-toggle");
      var flyout = group.querySelector(".nav-flyout");
      if (!toggle || !flyout) return;

      if (!isMobile()) {
        releaseSubnav(group);
        return;
      }

      if (expanded &&
          flyout.classList.contains("dig-v21-subnav-open") &&
          !flyout.classList.contains("dig-v21-subnav-animating") &&
          !flyout.hidden) return;
      if (!expanded &&
          !flyout.classList.contains("dig-v21-subnav-open") &&
          !flyout.classList.contains("dig-v21-subnav-animating") &&
          flyout.hidden) return;

      if (!expanded && flyout.contains(doc.activeElement)) {
        focusWithoutScroll(toggle);
      }

      var token = clearSubnavTimer(flyout);
      /* Legacy closeGroup() sets hidden first; expose it before measuring the
       * still-stable V21 open class so WebKit returns the painted height. */
      flyout.hidden = false;
      var from = flyout.getBoundingClientRect().height;

      flyout.classList.remove("dig-v21-subnav-open");
      flyout.classList.add("dig-v21-subnav-animating");
      /* Links remain outside the accessibility/tab sequence until the
       * opening reveal is fully painted; closing links are disabled first. */
      flyout.setAttribute("aria-hidden", "true");
      flyout.setAttribute("inert", "");
      setExpandedLabel(toggle, expanded);

      flyout.style.setProperty("height", Math.max(0, from) + "px", "important");
      /* Flush the current frame so a rapid reversal starts where it is drawn. */
      void flyout.offsetHeight;

      var target = expanded ? flyout.scrollHeight : 0;
      var fullDistance = Math.max(flyout.scrollHeight, from, 1);
      var remaining = Math.abs(target - from) / fullDistance;
      var duration = prefersReducedMotion() ? 0 : Math.round(Math.max(110, 240 * remaining));

      function finish() {
        var activeState = subnavState.get(flyout);
        if (!activeState || activeState.token !== token) return;
        flyout.removeEventListener("transitionend", activeState.onEnd);
        window.clearTimeout(activeState.timer);
        subnavState.delete(flyout);
        settleSubnav(group, expanded && toggle.getAttribute("aria-expanded") === "true");
      }

      function onEnd(event) {
        if (event.target === flyout && event.propertyName === "height") finish();
      }

      if (duration === 0 || Math.abs(target - from) < 1) {
        settleSubnav(group, expanded);
        return;
      }

      flyout.style.setProperty("--dig-v21-subnav-duration", duration + "ms");
      flyout.addEventListener("transitionend", onEnd);
      var timer = window.setTimeout(finish, duration + 90);
      subnavState.set(flyout, { token: token, timer: timer, onEnd: onEnd });

      window.requestAnimationFrame(function () {
        var activeState = subnavState.get(flyout);
        if (!activeState || activeState.token !== token) return;
        flyout.style.setProperty("height", target + "px", "important");
      });
    }

    function syncSubnavs(animate) {
      groups.forEach(function (group) {
        var toggle = group.querySelector(".nav-toggle");
        if (!toggle) return;
        var expanded = toggle.getAttribute("aria-expanded") === "true";
        if (!isMobile()) releaseSubnav(group);
        else if (animate) animateSubnav(group, expanded);
        else settleSubnav(group, expanded);
      });
    }

    function clearNavTimer() {
      if (navTimer) window.clearTimeout(navTimer);
      navTimer = 0;
    }

    function settleNavigation(expanded) {
      clearNavTimer();
      navigation.classList.remove("dig-v21-nav-animating", "dig-v21-nav-arming", "dig-v21-nav-idle", "dig-v21-nav-settled");
      navigation.classList.add(expanded ? "dig-v21-nav-settled" : "dig-v21-nav-idle");
      if (!expanded) navigation.scrollTop = 0;
    }

    function armNavigation() {
      if (!isMobile()) return;
      clearNavTimer();

      /* Moving from the settled `none` clip to inset(0) must be atomic;
       * otherwise WebKit treats it as a discrete transition before close. */
      if (navigation.classList.contains("is-open") &&
          navigation.classList.contains("dig-v21-nav-settled")) {
        navigation.classList.add("dig-v21-nav-arming");
        navigation.classList.remove("dig-v21-nav-settled", "dig-v21-nav-idle");
        void window.getComputedStyle(navigation).clipPath;
        navigation.classList.remove("dig-v21-nav-arming");
        void window.getComputedStyle(navigation).clipPath;
      }

      navigation.classList.remove("dig-v21-nav-settled", "dig-v21-nav-idle");
      navigation.classList.add("dig-v21-nav-animating");
      /* Materialise inset(0) before legacy code removes .is-open. */
      void window.getComputedStyle(navigation).clipPath;
    }

    function onNavigationStateChange() {
      var expanded = menuButton.getAttribute("aria-expanded") === "true";

      if (!expanded && navigation.contains(doc.activeElement)) {
        focusWithoutScroll(menuButton);
      }

      if (navigation.classList.contains(expanded ? "dig-v21-nav-settled" : "dig-v21-nav-idle") &&
          navigation.classList.contains("is-open") === expanded) return;

      if (!isMobile() || prefersReducedMotion()) {
        settleNavigation(expanded);
        return;
      }

      navigation.classList.remove("dig-v21-nav-settled", "dig-v21-nav-idle");
      navigation.classList.add("dig-v21-nav-animating");
      clearNavTimer();
      navTimer = window.setTimeout(function () {
        settleNavigation(menuButton.getAttribute("aria-expanded") === "true");
      }, 390);
    }

    function resetFromPageCache() {
      var focusedInside = navigation.contains(doc.activeElement);

      /* Never hide the focused subtree: move focus before restoring the
       * closed BFCache snapshot so VoiceOver/Safari retain a valid target. */
      if (focusedInside) focusWithoutScroll(menuButton);

      clearNavTimer();
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Buka menu utama");
      menuButton.classList.remove("dig-menu-opening", "dig-menu-closing");
      navigation.classList.remove("is-open", "dig-v21-nav-animating", "dig-v21-nav-arming", "dig-v21-nav-settled");
      navigation.classList.add("dig-v21-nav-idle");
      navigation.scrollTop = 0;
      if (isMobile()) navigation.setAttribute("aria-hidden", "true");
      else navigation.removeAttribute("aria-hidden");

      doc.body.classList.remove("menu-open");
      root.classList.remove("dig-nav-lock");
      if (backdrop) backdrop.hidden = true;

      [".skip-link", ".site-header .brand", ".breadcrumb", "main", ".site-footer", ".wa-float"].forEach(function (selector) {
        var element = doc.querySelector(selector);
        if (element) element.removeAttribute("inert");
      });

      groups.forEach(function (group) {
        var toggle = group.querySelector(".nav-toggle");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
        group.classList.remove("is-open");
        settleSubnav(group, false);
      });

      var menuIcon = menuButton.querySelector(".menu-icon");
      var closeIcon = menuButton.querySelector(".close-icon");
      if (menuIcon) menuIcon.hidden = false;
      if (closeIcon) closeIcon.hidden = true;
    }

    /* Arm every known close path before the legacy runtime changes .is-open. */
    menuButton.addEventListener("click", armNavigation, true);
    navigation.addEventListener("click", function (event) {
      if (event.target.closest("a[href], .nav-close")) armNavigation();
    }, true);
    if (backdrop) backdrop.addEventListener("click", armNavigation, true);
    doc.addEventListener("keydown", function (event) {
      if (event.key === "Escape" &&
          menuButton.getAttribute("aria-expanded") === "true" &&
          !navigation.querySelector(".nav-group.is-open")) {
        armNavigation();
      }
    }, true);

    navigation.addEventListener("transitionend", function (event) {
      if (event.target !== navigation) return;
      if (event.propertyName !== "clip-path" && event.propertyName !== "-webkit-clip-path") return;
      if (!navigation.classList.contains("dig-v21-nav-animating")) return;
      settleNavigation(menuButton.getAttribute("aria-expanded") === "true");
    });

    var stateObserver = new MutationObserver(function (records) {
      records.forEach(function (record) {
        if (record.target === menuButton) {
          onNavigationStateChange();
          return;
        }

        var toggle = record.target;
        var group = toggle.closest(".nav-group");
        if (group) animateSubnav(group, toggle.getAttribute("aria-expanded") === "true");
      });
    });

    stateObserver.observe(menuButton, { attributes: true, attributeFilter: ["aria-expanded"] });
    groups.forEach(function (group) {
      var toggle = group.querySelector(".nav-toggle");
      if (toggle) stateObserver.observe(toggle, { attributes: true, attributeFilter: ["aria-expanded"] });
    });

    function onViewportChange() {
      if (isMobile()) {
        settleNavigation(menuButton.getAttribute("aria-expanded") === "true");
        syncSubnavs(false);
      } else {
        clearNavTimer();
        navigation.classList.remove("dig-v21-nav-animating", "dig-v21-nav-arming", "dig-v21-nav-idle", "dig-v21-nav-settled");
        syncSubnavs(false);
      }
    }

    if (typeof mobileMedia.addEventListener === "function") {
      mobileMedia.addEventListener("change", onViewportChange);
      reducedMedia.addEventListener("change", onViewportChange);
    } else {
      mobileMedia.addListener(onViewportChange);
      reducedMedia.addListener(onViewportChange);
    }

    window.addEventListener("pageshow", function (event) {
      if (event.persisted || navigation.classList.contains("is-open") || doc.body.classList.contains("menu-open")) {
        resetFromPageCache();
      }
    });

    settleNavigation(menuButton.getAttribute("aria-expanded") === "true");
    syncSubnavs(false);
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
}());
