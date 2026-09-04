
(() => {
  "use strict";
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  const qsa = (s,r=document)=>Array.from(r.querySelectorAll(s));
  const qs = (s,r=document)=>r.querySelector(s);
  const path = location.pathname.split('/').pop() || 'index.html';
  document.body.dataset.ultimatePage = path.replace('.html','');

  const header=qs('.site-header');
  if(header){const sync=()=>header.classList.toggle('is-scrolled',scrollY>8);sync();addEventListener('scroll',sync,{passive:true});}

  // Hero: retain original controller, add deck semantics + swipe/keyboard.
  const hero=qs('[data-dig-hero]');
  if(hero){
    const tabs=qsa('[data-dig-hero-tab]',hero), panels=qsa('[data-dig-hero-panel]',hero), frame=hero.closest('.hero-frame');
    const media=qsa('[data-dig-hero-image]');
    const decorate=()=>{
      const active=Math.max(0,tabs.findIndex(t=>t.getAttribute('aria-pressed')==='true'));
      frame?.setAttribute('data-hero-index',String(active));
      if(frame) frame.style.setProperty('--hero-progress',`${((active+1)/Math.max(1,tabs.length))*100}%`);
      panels.forEach((p,i)=>{p.classList.toggle('is-prev',i===((active-1+panels.length)%panels.length));p.classList.toggle('is-next',i===((active+1)%panels.length));p.setAttribute('aria-hidden',i===active?'false':'true');});
      media.forEach((img)=>img.dataset.deckState=Number(img.dataset.digHeroImage)===active?'active':'idle');
    };
    const mo=new MutationObserver(decorate);tabs.forEach(t=>mo.observe(t,{attributes:true,attributeFilter:['aria-pressed']}));decorate();
    hero.setAttribute('tabindex','0');hero.setAttribute('role','region');hero.setAttribute('aria-roledescription','carousel');hero.querySelector('.dig-hero-console>div:last-child')?.setAttribute('aria-live','polite');
    hero.addEventListener('keydown',e=>{if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;e.preventDefault();const active=Math.max(0,tabs.findIndex(t=>t.getAttribute('aria-pressed')==='true'));const next=(active+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next]?.click();tabs[next]?.focus({preventScroll:true});});
    let sx=0,sy=0;hero.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;sx=e.clientX;sy=e.clientY},{passive:true});hero.addEventListener('pointerup',e=>{if(!sx)return;const dx=e.clientX-sx,dy=e.clientY-sy;sx=0;if(Math.abs(dx)<45||Math.abs(dx)<Math.abs(dy))return;const active=Math.max(0,tabs.findIndex(t=>t.getAttribute('aria-pressed')==='true'));tabs[(active+(dx<0?1:-1)+tabs.length)%tabs.length]?.click();},{passive:true});
  }

  // Coverflow state is derived from actual scroll position; scroll-snap remains native fallback.
  qsa('[data-dig-scroll-track],.u-motion-track').forEach(track=>{
    const cards=()=>Array.from(track.children).filter(n=>n.nodeType===1);track.setAttribute('role','region');track.setAttribute('aria-roledescription','carousel');let raf=0;
    const update=()=>{raf=0;const rect=track.getBoundingClientRect(),center=rect.left+rect.width/2;let active=0,best=Infinity;cards().forEach((c,i)=>{const r=c.getBoundingClientRect(),d=Math.abs((r.left+r.width/2)-center);if(d<best){best=d;active=i}});cards().forEach((c,i)=>{c.classList.remove('is-cover-active','is-cover-prev','is-cover-next','is-cover-far');c.classList.add(i===active?'is-cover-active':i===active-1?'is-cover-prev':i===active+1?'is-cover-next':'is-cover-far');c.setAttribute('role','group');c.setAttribute('aria-label',`${i+1} dari ${cards().length}`);});};
    const schedule=()=>{if(!raf)raf=requestAnimationFrame(update)};track.addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});track.addEventListener('keydown',e=>{if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;e.preventDefault();track.scrollBy({left:(e.key==='ArrowRight'?1:-1)*Math.max(260,track.clientWidth*.72),behavior:reduced?'auto':'smooth'});});update();
  });

  // Timeline / process progression.
  const flow=qsa('.u-flowline>div');
  if(flow.length){if(reduced){flow.forEach(x=>x.classList.add('is-line-visible'))}else{const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-line-visible');io.unobserve(e.target)}}),{threshold:.45});flow.forEach(x=>io.observe(x));}}

  // Same-origin navigation fallback for browsers without cross-document View Transition.
  // Native anchor navigation intentionally preserved for iOS/Safari reliability.

  qsa('[data-dig-video][data-fallback-src]').forEach(v=>{v.addEventListener('error',()=>{if(v.dataset.fallbackTried)return;v.dataset.fallbackTried='1';v.src=v.dataset.fallbackSrc;v.load();},{once:false});});

  // Make disabled future social channels explicit to assistive tech, without fake links.
  qsa('.social-contact[aria-disabled="true"]').forEach(el=>{el.setAttribute('tabindex','0');el.setAttribute('aria-description','Kanal ini belum tersedia.');});
})();
