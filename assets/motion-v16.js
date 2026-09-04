
(()=>{
  "use strict";
  const d=document,root=d.documentElement;
  const reduce=globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches??false;
  const fine=globalThis.matchMedia?.("(hover:hover) and (pointer:fine)")?.matches??false;
  const coarse=globalThis.matchMedia?.("(pointer:coarse)")?.matches??false;
  const qsa=(s,r=d)=>Array.from(r.querySelectorAll(s));
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  root.classList.add("dig-motion-v16");

  const headingSelector="main h1,main section h2,main .kicker,main .eyebrow,main .dig-pro-intro h2,main .section-head h2";
  const cardSelector=".card,.choice-card,.dig-pro-card,.dig-campaign,.dig-promo-card,.service-card,.article-card,.u-domain-card,.u-motion-card,.live-news-card";
  const mediaSelector=".hero-picture,.dig-hero-alt-media,.editorial-media,.dig-campaign,.dig-promo-card,.dig-pro-media,.news-detail-visual,.live-news-visual,.u-motion-card";
  const standardSelector="main .lede,main .section-head>p,main .dig-manifesto-copy,main .dig-manifesto-notes,main .cta-band,main .dig-news-more,main .footer-contact-us";
  const motionSelector=".dig-m-heading,.dig-m-standard,.dig-m-card,.dig-m-media";
  const liveMedia=new Set();
  let revealObserver=null,mediaObserver=null;

  const revealNow=el=>{
    el.classList.add("is-dig-in");
    globalThis.setTimeout(()=>{
      el.style.willChange="auto";
      qsa("img.dig-m-img",el).forEach(img=>{img.style.willChange="auto"});
    },1100);
  };

  const observeNode=el=>{
    if(reduce||!("IntersectionObserver" in globalThis)){revealNow(el);return}
    const r=el.getBoundingClientRect();
    if(r.top<innerHeight*.94&&r.bottom>0)revealNow(el);else revealObserver?.observe(el);
    if(el.classList.contains("dig-m-media"))mediaObserver?.observe(el);
  };

  const decorate=(scope=d)=>{
    const includeRoot=(selector)=>scope instanceof Element&&scope.matches(selector)?[scope]:[];
    [...includeRoot(headingSelector),...qsa(headingSelector,scope)].forEach(el=>el.classList.add("dig-m-heading"));
    [...includeRoot(cardSelector),...qsa(cardSelector,scope)].forEach(el=>el.classList.add("dig-m-card"));
    [...includeRoot(mediaSelector),...qsa(mediaSelector,scope)].forEach(el=>{
      el.classList.add("dig-m-media");
      if(getComputedStyle(el).position==="static")el.classList.add("dig-m-needs-pos");
      const img=el.matches("img")?el:el.querySelector("img");
      img?.classList.add("dig-m-img");
      if(img&&el!==img&&el.tagName==="PICTURE"){
        const sibling=el.nextElementSibling;
        if(!sibling?.classList.contains("dig-photo-picture-layers")){
          const layers=d.createElement("span");layers.className="dig-photo-picture-layers";layers.setAttribute("aria-hidden","true");
          const sheen=d.createElement("span");sheen.className="dig-photo-sheen";
          const grain=d.createElement("span");grain.className="dig-photo-grain";
          layers.append(sheen,grain);el.insertAdjacentElement("afterend",layers);
        }
      }else if(img&&el!==img){
        if(!el.querySelector(":scope > .dig-photo-sheen")){
          const sheen=d.createElement("span");sheen.className="dig-photo-sheen";sheen.setAttribute("aria-hidden","true");
          if(img.parentElement===el)img.insertAdjacentElement("afterend",sheen);else el.prepend(sheen);
        }
        if(!el.querySelector(":scope > .dig-photo-grain")){
          const grain=d.createElement("span");grain.className="dig-photo-grain";grain.setAttribute("aria-hidden","true");el.append(grain);
        }
      }
    });
    [...includeRoot(standardSelector),...qsa(standardSelector,scope)].forEach(el=>el.classList.add("dig-m-standard"));

    const groups=[...includeRoot(".card-grid,.grid-2,.grid-3,.grid-4,.process-grid,.process,.dig-flow,.dig-pro-grid,.dig-promo-grid,.dig-news-list,.services-grid,.article-grid,.choice-grid,.support-intent-grid,[data-dig-scroll-track]"),...qsa(".card-grid,.grid-2,.grid-3,.grid-4,.process-grid,.process,.dig-flow,.dig-pro-grid,.dig-promo-grid,.dig-news-list,.services-grid,.article-grid,.choice-grid,.support-intent-grid,[data-dig-scroll-track]",scope)];
    groups.forEach(group=>Array.from(group.children).forEach((el,i)=>{
      if(!(el instanceof Element))return;
      const declared=Number.parseFloat(el.dataset.delay||"");
      const step=Number.isFinite(declared)?declared:i;
      el.style.setProperty("--dig-m-delay",`${Math.min(step,8)*55}ms`);
    }));
    qsa(".hero-copy",scope).forEach(hero=>Array.from(hero.children).forEach((el,i)=>{
      if(!(el instanceof Element))return;
      if(!el.classList.contains("dig-m-heading")&&!el.classList.contains("dig-m-standard"))el.classList.add("dig-m-standard");
      el.style.setProperty("--dig-m-delay",`${Math.min(i,7)*68}ms`);
    }));
  };

  if(!reduce&&"IntersectionObserver" in globalThis){
    revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){revealNow(entry.target);revealObserver.unobserve(entry.target)}
    }),{threshold:.08,rootMargin:"0px 0px -6% 0px"});
    mediaObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting)liveMedia.add(entry.target);else liveMedia.delete(entry.target);
    }),{threshold:.01,rootMargin:"18% 0px"});
  }
  decorate();
  root.classList.add("dig-motion-v16-ready");
  requestAnimationFrame(()=>requestAnimationFrame(()=>qsa(motionSelector).forEach(observeNode)));

  /* Only genuinely dynamic editorial containers are observed. */
  qsa("[data-live-news-grid],[data-news-grid],.dig-news-list").forEach(host=>{
    const observer=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{
      if(!(node instanceof Element))return;
      decorate(node);
      const local=[...(node.matches(motionSelector)?[node]:[]),...qsa(motionSelector,node)];
      local.forEach(observeNode);
    })));
    observer.observe(host,{childList:true,subtree:true});
  });

  /* Reuse the existing reading progress and touch only visible media. */
  let scrollRaf=0;
  const updateScroll=()=>{
    scrollRaf=0;
    const max=Math.max(1,d.documentElement.scrollHeight-innerHeight);
    root.style.setProperty("--dig-scroll-progress",String(clamp(scrollY/max,0,1)));
    if(!reduce&&!coarse)liveMedia.forEach(el=>{
      if(el.matches(".hero-picture,.dig-hero-alt-media"))return;
      const r=el.getBoundingClientRect();
      const delta=((r.top+r.height/2)-innerHeight/2)/innerHeight;
      el.style.setProperty("--dig-parallax",`${clamp(-delta*3,-2.25,2.25).toFixed(2)}px`);
    });
  };
  const scheduleScroll=()=>{if(!scrollRaf)scrollRaf=requestAnimationFrame(updateScroll)};
  addEventListener("scroll",scheduleScroll,{passive:true});
  addEventListener("resize",scheduleScroll,{passive:true});
  updateScroll();

  /* Pointer depth is requestAnimationFrame-throttled and intentionally minute. */
  if(fine&&!reduce){
    let pointerRaf=0,pointerEvent=null,active=null;
    const reset=card=>{if(!card)return;card.style.setProperty("--dig-card-rx","0deg");card.style.setProperty("--dig-card-ry","0deg")};
    d.addEventListener("pointermove",event=>{
      pointerEvent=event;
      if(pointerRaf)return;
      pointerRaf=requestAnimationFrame(()=>{
        pointerRaf=0;
        const event=pointerEvent;
        const card=event?.target?.closest?.(".dig-m-card:not(.choice-card):not(.u-domain-card)");
        if(!card||card.getBoundingClientRect().width<240){if(active&&active!==card)reset(active);active=null;return}
        if(active&&active!==card)reset(active);
        active=card;
        const r=card.getBoundingClientRect(),x=(event.clientX-r.left)/r.width-.5,y=(event.clientY-r.top)/r.height-.5;
        card.style.setProperty("--dig-card-rx",`${clamp(-y*1.3,-.65,.65).toFixed(2)}deg`);
        card.style.setProperty("--dig-card-ry",`${clamp(x*1.6,-.8,.8).toFixed(2)}deg`);
      });
    },{passive:true});
    d.addEventListener("pointerout",event=>{
      const card=event.target.closest?.(".dig-m-card:not(.choice-card):not(.u-domain-card)");
      if(card&&!card.contains(event.relatedTarget)){reset(card);if(active===card)active=null}
    },{passive:true});
  }

  /* Preserve native snap/coverflow and update the editorial center state. */
  qsa("[data-dig-scroll-track]").forEach(track=>{
    let raf=0;
    const sync=()=>{
      raf=0;
      const cards=Array.from(track.children).filter(node=>node instanceof Element);
      if(!cards.length)return;
      const tr=track.getBoundingClientRect(),center=tr.left+tr.width/2;
      let best=null,distance=Infinity;
      cards.forEach(card=>{const r=card.getBoundingClientRect(),value=Math.abs(r.left+r.width/2-center);if(value<distance){distance=value;best=card}});
      cards.forEach(card=>card.classList.toggle("dig-photo-current",card===best));
    };
    track.addEventListener("scroll",()=>{if(!raf)raf=requestAnimationFrame(sync)},{passive:true});
    addEventListener("resize",sync,{passive:true});sync();
  });

  /* Stagger mobile navigation while retaining the existing accessible controller. */
  const nav=d.querySelector("#main-nav");
  if(nav)Array.from(nav.children).forEach((child,index)=>child.style.setProperty("--dig-nav-i",String(index)));

  /* A DIN code resumes a conversation; it never claims an unavailable live status. */
  qsa("[data-din-form]").forEach(form=>form.addEventListener("submit",event=>{
    event.preventDefault();
    const input=form.querySelector("[data-din-input]"),status=form.querySelector("[data-din-status]");
    const code=String(input?.value||"").trim().toUpperCase().replace(/\s+/g,"");
    const valid=/^DIN-[A-Z0-9-]{4,40}$/.test(code);
    if(!valid){if(status)status.textContent="Gunakan format kode yang diawali DIN-, sesuai referensi yang Anda simpan.";input?.focus();return}
    if(status)status.textContent=`Referensi ${code} siap dicantumkan pada pesan dukungan.`;
    const message=`Halo PT Digdaya Inovasi Nusantara, saya ingin melanjutkan komunikasi terkait referensi ${code}. Mohon bantu arahkan langkah berikutnya.`;
    if(globalThis.DigdayaWidgets?.openInquiry){globalThis.DigdayaWidgets.openInquiry({service:"Konsultasi umum",message,whatsappText:message});return}
    globalThis.open(`https://wa.me/6287892523968?text=${encodeURIComponent(message)}`,"_blank","noopener,noreferrer");
  }));
})();
