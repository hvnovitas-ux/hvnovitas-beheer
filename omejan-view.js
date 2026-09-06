import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";
const track=document.getElementById('track'),dots=document.getElementById('dots'),prev=document.getElementById('prev'),next=document.getElementById('next');
let items=[],index=0,timer=null,startX=null;
const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
function stop(){if(timer)clearInterval(timer);timer=null}
function start(){stop();if(items.length>1)timer=setInterval(()=>go(index+1),4500)}
function update(){track.style.transform=`translate3d(-${index*100}%,0,0)`;dots.querySelectorAll('.dot').forEach((d,i)=>d.classList.toggle('active',i===index))}
function go(i){if(!items.length)return;index=(i+items.length)%items.length;update();start()}
function render(){stop();if(!items.length){track.innerHTML='<div class="slide"><div class="empty">Nog geen foto’s van Ome Jan.</div></div>';dots.innerHTML='';prev.hidden=next.hidden=true;return}
 prev.hidden=next.hidden=items.length<2;
 track.innerHTML=items.map(v=>`<div class="slide"><img src="${esc(v.imageUrl)}" alt="Ome Jan"></div>`).join('');
 dots.innerHTML=items.map((_,i)=>`<button class="dot${i===index?' active':''}" data-i="${i}" aria-label="Foto ${i+1}"></button>`).join('');
 dots.querySelectorAll('.dot').forEach(d=>d.onclick=()=>go(Number(d.dataset.i)));update();start();}
prev.onclick=()=>go(index-1);next.onclick=()=>go(index+1);
track.addEventListener('touchstart',e=>startX=e.touches[0].clientX,{passive:true});
track.addEventListener('touchend',e=>{if(startX===null)return;const dx=e.changedTouches[0].clientX-startX;startX=null;if(Math.abs(dx)>45)go(index+(dx<0?1:-1))},{passive:true});
const slider=document.getElementById('slider');slider.addEventListener('mouseenter',stop);slider.addEventListener('mouseleave',start);
onValue(ref(db,'omejan'),snap=>{items=Object.values(snap.val()||{}).filter(v=>v?.imageUrl).sort((a,b)=>(a.created||0)-(b.created||0));index=Math.min(index,Math.max(items.length-1,0));render()});
