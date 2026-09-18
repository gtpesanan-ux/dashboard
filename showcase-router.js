(function(){'use strict';
if(window.__PTDIRAC_SHOWCASE_ROUTER_V1__)return;window.__PTDIRAC_SHOWCASE_ROUTER_V1__=true;
var roles={auth:1,panel:1,order:1,shop:1,security:1,project:1,api:1,www:1,cs:1,dev:1,pt:1,cv:1,secure:1,parfum:1};
function host(v){return String(v||'').trim().toLowerCase().replace(/\.$/,'');}
function local(h){return h==='localhost'||/^(?:127(?:\.\d{1,3}){3}|\d{1,3}(?:\.\d{1,3}){3})$/.test(h)||h.indexOf(':')>=0;}
function dns(h){return /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(h);}
function base(){var h=host(location.hostname);if(!h)return'';if(local(h))return h;var p=h.split('.');if(p.length>2&&roles[p[0]])p.shift();h=p.join('.');return dns(h)?h:'';}
function origin(role){var b=base();if(!b)return'';if(local(b))return location.origin;return'https://'+role+'.'+b;}
function target(a){var role=String(a.getAttribute('data-dirac-dynamic-role')||'');if(role==='shop')return origin('shop')+'/parfum.html';if(role==='dev'){var p=String(a.getAttribute('data-demo-path')||'');return /^[A-Za-z0-9._~-]+\.html$/.test(p)?origin('dev')+'/'+p:'';}return'';}
document.addEventListener('click',function(e){var a=e.target&&e.target.closest?e.target.closest('a[data-dirac-dynamic-role]'):null;if(!a)return;var u=target(a);if(!u)return;e.preventDefault();if(a.target==='_blank')window.open(u,'_blank','noopener,noreferrer');else location.assign(u);},false);
})();