import { db } from "./firebase.js";
import {
    ref,
    push,
    onValue,
    remove
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("CMS FINAL LOADED");

// =====================
// ☁️ CLOUDINARY UPLOAD
// =====================

async function uploadImage(file){
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", "hvnovitas_upload");

    const res = await fetch(
        "https://api.cloudinary.com/v1_1/hwxe3jzg/image/upload",
        { method:"POST", body:form }
    );

    const data = await res.json();
    return data.secure_url || "";
}

// =====================
// 🧱 CLUB100
// =====================

document.getElementById("saveClub100")?.addEventListener("click", async () => {

    const name = document.getElementById("clubName").value;
    if(!name) return;

    await push(ref(db,"club100"),{
        name,
        created:Date.now()
    });

    document.getElementById("clubName").value="";
});

onValue(ref(db,"club100"), snap=>{
    const data = snap.val() || {};
    const list = document.getElementById("clubList");

    list.innerHTML = Object.entries(data).map(([id,v])=>`
        <div class="tile">
            ${v.name}
            <button onclick="del('club100','${id}')">🗑</button>
        </div>
    `).join("");
});

// =====================
// 🏆 HIGHLIGHTS (MET DATUM)
// =====================

document.getElementById("saveHighlight")?.addEventListener("click", async () => {

    const date = document.getElementById("hlDate").value;
    const title = document.getElementById("hlTitle").value;
    const text = document.getElementById("hlText").value;

    if(!title) return;

    await push(ref(db,"highlights"),{
        date,
        title,
        text,
        created:Date.now()
    });
});

onValue(ref(db,"highlights"), snap=>{
    const data = snap.val() || {};
    const list = document.getElementById("highlightList");

    list.innerHTML = Object.entries(data).map(([id,v])=>`
        <div class="card">
            <b>${v.title}</b>
            <p>${v.text}</p>
            <small>${v.date || ""}</small>
            <button onclick="del('highlights','${id}')">🗑</button>
        </div>
    `).join("");
});

// =====================
// 📰 NEWS + CLOUDINARY IMAGE FIX
// =====================

document.getElementById("saveNews")?.addEventListener("click", async () => {

    const file = document.getElementById("newsImage")?.files[0];

    let imgUrl = "";
    if(file){
        imgUrl = await uploadImage(file);
    }

    await push(ref(db,"news"),{
        title:document.getElementById("newsTitle").value,
        text:document.getElementById("newsText").value,
        imageUrl:imgUrl,
        created:Date.now()
    });

    document.getElementById("newsTitle").value="";
    document.getElementById("newsText").value="";
    if(document.getElementById("newsImage")) document.getElementById("newsImage").value="";
});

onValue(ref(db,"news"), snap=>{
    const data = snap.val() || {};
    const list = document.getElementById("newsList");

    list.innerHTML = Object.entries(data).map(([id,v])=>`
        <div class="card">
            <b>${v.title}</b>
            <p>${v.text}</p>

            ${v.imageUrl 
                ? `<img src="${v.imageUrl}" onerror="this.style.display='none'">`
                : ""
            }

            <button onclick="del('news','${id}')">🗑</button>
        </div>
    `).join("");
});

// =====================
// 🤝 SPONSORS (CLOUDINARY)
// =====================

document.getElementById("saveSponsor")?.addEventListener("click", async () => {

    const file = document.getElementById("sponsorImage")?.files[0];
    if(!file) return;

    const url = await uploadImage(file);

    await push(ref(db,"sponsors"),{
        imageUrl:url,
        created:Date.now()
    });

    document.getElementById("sponsorImage").value="";
});

onValue(ref(db,"sponsors"), snap=>{
    const data = snap.val() || {};
    const list = document.getElementById("sponsorList");

    list.innerHTML = Object.values(data).map(v=>`
        <div class="card">
            <img src="${v.imageUrl}" onerror="this.style.display='none'">
        </div>
    `).join("");
});

// =====================
// 📸 OME JAN (CLOUDINARY)
// =====================

document.getElementById("saveOmejan")?.addEventListener("click", async () => {

    const file = document.getElementById("omejanImage")?.files[0];
    if(!file) return;

    const url = await uploadImage(file);

    await push(ref(db,"omejan"),{
        imageUrl:url,
        created:Date.now()
    });

    document.getElementById("omejanImage").value="";
});

onValue(ref(db,"omejan"), snap=>{
    const data = snap.val() || {};
    const list = document.getElementById("omejanList");

    list.innerHTML = Object.values(data).map(v=>`
        <div class="card">
            <img src="${v.imageUrl}" onerror="this.style.display='none'">
        </div>
    `).join("");
});

// =====================
// 🧹 DELETE SYSTEM
// =====================

window.del = (path,id)=>{
    remove(ref(db,path+"/"+id));
};
