(() => {
  "use strict";
  const qs=(s,r=document)=>r.querySelector(s), qsa=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const mobile=()=>matchMedia?.("(max-width: 1040px)")?.matches ?? innerWidth<=1040;
  const once=(el,key)=>{if(!el||el.dataset[key]==="1")return false;el.dataset[key]="1";return true;};

  // Fallback navigation only acts when earlier handlers did not change state.
  const menu=qs('.menu-button'), nav=qs('.main-nav'), backdrop=qs('.nav-backdrop');
  if(menu&&nav&&once(menu,'hardNav')){
    let before=null;
    menu.addEventListener('click',()=>{before={expanded:menu.getAttribute('aria-expanded'),open:nav.classList.contains('is-open')};},{capture:true});
    menu.addEventListener('click',()=>{
      if(!before)return;
      const unchanged=menu.getAttribute('aria-expanded')===before.expanded && nav.classList.contains('is-open')===before.open;
      if(!unchanged)return;
      const open=!before.open;
      nav.classList.toggle('is-open',open); nav.setAttribute('aria-hidden',open?'false':(mobile()?'true':'false'));
      menu.setAttribute('aria-expanded',String(open)); menu.setAttribute('aria-label',open?'Tutup menu utama':'Buka menu utama');
      document.body.classList.toggle('menu-open',open); if(backdrop)backdrop.hidden=!open;
      const mi=qs('.menu-icon',menu), ci=qs('.close-icon',menu); if(mi)mi.hidden=open;if(ci)ci.hidden=!open;
    });
    backdrop?.addEventListener('click',()=>{nav.classList.remove('is-open');nav.setAttribute('aria-hidden',mobile()?'true':'false');menu.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open');backdrop.hidden=true;});
  }
  qsa('.nav-toggle').forEach(toggle=>{
    if(!once(toggle,'hardSubnav'))return; let before=null;
    toggle.addEventListener('click',()=>{const g=toggle.closest('.nav-group');before={expanded:toggle.getAttribute('aria-expanded'),open:g?.classList.contains('is-open')};},{capture:true});
    toggle.addEventListener('click',()=>{if(!before)return;const g=toggle.closest('.nav-group'), f=g?.querySelector('.nav-flyout');const unchanged=toggle.getAttribute('aria-expanded')===before.expanded&&g?.classList.contains('is-open')===before.open;if(!unchanged)return;const open=!before.open;g?.classList.toggle('is-open',open);toggle.setAttribute('aria-expanded',String(open));if(f)f.hidden=!open;});
  });

  // Dialog fallback: preserve native/runtime behavior and only intervene if click had no effect.
  qsa('[data-open-inquiry]').forEach(btn=>{if(!once(btn,'hardInquiryOpen'))return;let was=false;btn.addEventListener('click',()=>{was=!!qs('[data-inquiry-dialog]')?.open},{capture:true});btn.addEventListener('click',()=>{const d=qs('[data-inquiry-dialog]');if(!d||d.open!==was||was)return;try{d.showModal()}catch{d.setAttribute('open','')}})});
  qsa('[data-close-dialog],[data-close-inquiry]').forEach(btn=>{if(!once(btn,'hardDialogClose'))return;btn.addEventListener('click',()=>{const d=btn.closest('dialog');if(d?.open)try{d.close()}catch{d.removeAttribute('open')}})});

  // Quick contact fallback.
  const wrap=qs('[data-quick-contact]'); if(wrap){const t=qs('[data-contact-toggle]',wrap), p=qs('[data-quick-contact-panel]',wrap), c=qs('[data-contact-close]',wrap);if(t&&p&&once(t,'hardContact')){let hidden=true;t.addEventListener('click',()=>{hidden=p.hidden},{capture:true});t.addEventListener('click',()=>{if(p.hidden!==hidden)return;p.hidden=!hidden;t.setAttribute('aria-expanded',String(hidden));});c?.addEventListener('click',()=>{p.hidden=true;t.setAttribute('aria-expanded','false')});qsa('[data-contact-open]').forEach(b=>b.addEventListener('click',()=>{p.hidden=false;t.setAttribute('aria-expanded','true')}));}}

  document.documentElement.dataset.digdayaHardening='ready';
})();