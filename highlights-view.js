import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";
const content=document.getElementById('content');
const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
function dateText(d){if(!d)return '';const x=new Date(d+'T00:00:00');return isNaN(x)?d:x.toLocaleDateString('nl-NL',{day:'numeric',month:'long',year:'numeric'})}
onValue(ref(db,'highlights'),snap=>{const data=Object.values(snap.val()||{}).sort((a,b)=>{const ad=new Date(a.date||0).getTime()||a.created||0,bd=new Date(b.date||0).getTime()||b.created||0;return bd-ad});
 if(!data.length){content.innerHTML='<div class="empty-title">Vandaag zijn er geen highlights uit het verleden.</div><div class="empty-sub">Mis niets van onze mooiste momenten!</div>';return}
 content.innerHTML=data.map(v=>`<article class="item">${v.date?`<div class="date">${esc(dateText(v.date))}</div>`:''}<h2>${esc(v.title||'')}</h2><p>${esc(v.text||'')}</p></article>`).join('');
});
