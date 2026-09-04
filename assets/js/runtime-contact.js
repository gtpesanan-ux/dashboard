
(() => {
  "use strict";
  const qs=(s,r=document)=>r.querySelector(s);
  const qsa=(s,r=document)=>[...r.querySelectorAll(s)];
  const wrap=qs('[data-quick-contact]');
  if(wrap){
    const toggle=qs('[data-contact-toggle]',wrap), panel=qs('[data-quick-contact-panel]',wrap), close=qs('[data-contact-close]',wrap);
    const setOpen=(open,{focus=false}={})=>{ if(!toggle||!panel)return; toggle.setAttribute('aria-expanded',String(open)); panel.hidden=!open; if(open&&focus){ const f=qs('a[href],button:not([disabled])',panel); f?.focus(); } };
    toggle?.addEventListener('click',()=>setOpen(toggle.getAttribute('aria-expanded')!=='true',{focus:true}));
    close?.addEventListener('click',()=>{setOpen(false);toggle?.focus()});
    qsa('[data-contact-open]').forEach(b=>b.addEventListener('click',()=>setOpen(true,{focus:true})));
    document.addEventListener('pointerdown',e=>{if(!wrap.contains(e.target))setOpen(false)});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&toggle?.getAttribute('aria-expanded')==='true'){setOpen(false);toggle.focus()}});
  }
})();
