import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";
const track=document.getElementById('track'),dots=document.getElementById('dots'),prev=document.getElementById('prev'),next=document.getElementById('next');
let items=[],page=0,timer=null;
const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
function per(){const w=innerWidth;return w<560?1:w<1000?2:4}
function pages(){return Math.max(1,Math.ceil(items.length/per()))}
function stop(){clearInterval(timer);timer=null}
function start(){stop();if(pages()>1)timer=setInterval(()=>go(page+1),3800)}
function update(){const card=track.querySelector('.sponsor');if(!card)return;const gap=20,step=card.getBoundingClientRect().width+gap;track.style.transform=`translate3d(-${page*step*per()}px,0,0)`;dots.querySelectorAll('.dot').forEach((d,i)=>d.classList.toggle('active',i===page))}
function go(p){const n=pages();page=(p+n)%n;update();start()}
function render(){stop();if(!items.length){track.innerHTML='<div class="empty">Geen sponsors beschikbaar.</div>';dots.innerHTML='';prev.hidden=next.hidden=true;return}prev.hidden=next.hidden=pages()<2;track.innerHTML=items.map(v=>{const image=v.imageUrl||v.image;const url=v.website||v.url||'';const name=v.name||v.sponsorName||'Sponsor';const a=`<div class="logo"><img src="${esc(image)}" alt="${esc(name)}"></div><div class="label">${esc(name)}</div>`;return url?`<a class="sponsor" href="${esc(url)}" target="_blank" rel="noopener">${a}</a>`:`<div class="sponsor">${a}</div>`}).join('');page=Math.min(page,pages()-1);dots.innerHTML=Array.from({length:pages()},(_,i)=>`<button class="dot${i===page?' active':''}" data-p="${i}" aria-label="Pagina ${i+1}"></button>`).join('');dots.querySelectorAll('.dot').forEach(d=>d.onclick=()=>go(Number(d.dataset.p)));update();start()}
prev.onclick=()=>go(page-1);next.onclick=()=>go(page+1);addEventListener('resize',render);
onValue(ref(db,'sponsors'),snap=>{items=Object.values(snap.val()||{}).filter(v=>v&&v.active!==false&&(v.imageUrl||v.image));page=0;render()});
