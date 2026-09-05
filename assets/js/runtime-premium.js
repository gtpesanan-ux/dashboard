(() => {
  "use strict";
  const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const initHero = () => {
    const hero = document.querySelector("[data-dig-hero]");
    if (!hero) return;
    const tabs = qsa("[data-dig-hero-tab]", hero);
    const panels = qsa("[data-dig-hero-panel]", hero);
    const media = qsa("[data-dig-hero-image]");
    let active = 0;
    const setActive = (index) => {
      active = (index + tabs.length) % tabs.length;
      tabs.forEach((tab, i) => tab.setAttribute("aria-pressed", i === active ? "true" : "false"));
      panels.forEach((panel, i) => panel.classList.toggle("is-active", i === active));
      media.forEach((image) => image.classList.toggle("is-active", Number(image.dataset.digHeroImage) === active));
    };
    tabs.forEach((tab, i) => tab.addEventListener("click", () => setActive(i)));
    setActive(0);
  };

  const initVideo = () => {
    qsa("[data-dig-film]").forEach((stage) => {
      const video = stage.querySelector("video[data-dig-video]");
      const trigger = stage.querySelector("[data-dig-video-trigger]");
      if (!video || !trigger) return;
      const activate = () => {
        if (!video.getAttribute("src")) {
          const source = video.dataset.src;
          if (source) { video.setAttribute("src", source); video.load(); }
        }
        trigger.hidden = true;
        const playAttempt = video.play();
        if (playAttempt && typeof playAttempt.catch === "function") playAttempt.catch(() => { trigger.hidden = false; });
      };
      trigger.addEventListener("click", activate);
      video.addEventListener("ended", () => { trigger.hidden = false; });
      video.addEventListener("error", () => { trigger.hidden = false; });
    });
  };

  const initScrollers = () => {
    qsa("[data-dig-scroller]").forEach((wrap) => {
      const track = wrap.querySelector("[data-dig-scroll-track]");
      const prev = wrap.querySelector("[data-dig-scroll-prev]");
      const next = wrap.querySelector("[data-dig-scroll-next]");
      if (!track) return;
      const move = (direction) => track.scrollBy({left: direction * Math.max(280, track.clientWidth * .72), behavior: reducedMotion ? "auto" : "smooth"});
      if (prev) prev.addEventListener("click", () => move(-1));
      if (next) next.addEventListener("click", () => move(1));
    });
  };

  initHero();
  initVideo();
  initScrollers();
})();
