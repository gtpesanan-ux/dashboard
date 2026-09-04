(() => {
  "use strict";
  const qsa=(selector,scope=document)=>Array.from(scope.querySelectorAll(selector));
  const short=(value,limit=72)=>{const text=String(value||"").replace(/\s+/g," ").trim();return text.length>limit?`${text.slice(0,limit-1).trimEnd()}…`:text};
  const makeMark=()=>{const mark=document.createElement("span");mark.className="dig-news-mark";const image=document.createElement("img");image.src="assets/digdaya-monogram-tile-512.webp";image.alt="";image.width=512;image.height=512;image.decoding="async";mark.append(image);return mark};
  const makeLayer=(kind,category,title,limit=72)=>{const layer=document.createElement("div");layer.className=`dig-news-art-layer ${kind==="news"?"is-news":"is-trend"}`;layer.setAttribute("aria-hidden","true");const top=document.createElement("div");top.className="dig-news-art-top";const label=document.createElement("span");label.textContent=kind==="news"?`Ilustrasi · ${category}`:`Pantauan Tren · ${category}`;top.append(makeMark(),label);layer.append(top);if(kind!=="news"){const strong=document.createElement("strong");strong.textContent=short(title,limit);layer.append(strong)}return layer};
  const decorateCard=card=>{if(!card||card.dataset.digVisualDecorated==="1")return;const figure=card.querySelector(".live-news-visual");if(!figure)return;const title=card.querySelector("h3")?.textContent||"";const kind=card.dataset.kind||"";const category=figure.dataset.category||"Newsroom";figure.append(makeLayer(kind,category,title));card.dataset.digVisualDecorated="1"};
  const decorateTree=node=>{if(!(node instanceof Element))return;if(node.matches(".live-news-card"))decorateCard(node);qsa(".live-news-card",node).forEach(decorateCard)};
  const decorateDetail=()=>{const image=document.querySelector("[data-detail-image]");if(!image)return;const figure=image.closest("figure")||image.parentElement;if(!figure||figure.dataset.digVisualDecorated==="1")return;const data=Array.isArray(globalThis.DigdayaNewsData)?globalThis.DigdayaNewsData:[];const id=new URLSearchParams(location.search).get("id")||"";const item=id?data.find(entry=>entry.id===id):data[0];if(!item)return;figure.classList.add("news-detail-visual");if(item.kind!=="news")figure.classList.add("is-trend");figure.append(makeLayer(item.kind,item.category,item.title,96));figure.dataset.digVisualDecorated="1"};
  qsa(".live-news-card").forEach(decorateCard);
  decorateDetail();
  qsa("[data-live-news-grid]").forEach(host=>new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(decorateTree))).observe(host,{childList:true,subtree:true}));
})();
