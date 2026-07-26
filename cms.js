import { db } from "./firebase.js";
import {
    ref,
    push,
    onValue,
    remove
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("CMS FULL FINAL LOADED");

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
// 🏆 HIGHLIGHTS (FIX: “vandaag geen highlights”)
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

    const items = Object.entries(data)
        .map(([id,v]) => ({ id, ...v }))
        .filter(h => h.date);

    if(items.length === 0){
        list.innerHTML = `
            <div class="card">
                Vandaag zijn er geen highlights uit het verleden
            </div>
        `;
        return;
    }

    items.sort((a,b) => new Date(b.date) - new Date(a.date));

    list.innerHTML = items.map(h=>`
        <div class="card">
            <b>${h.title}</b>
            <p>${h.text}</p>
            <small>${h.date}</small>
            <button onclick="del('highlights','${h.id}')">🗑</button>
        </div>
    `).join("");
});

// =====================
// 📰 NEWS (CLOUDINARY)
// =====================

document.getElementById("saveNews")?.addEventListener("click", async () => {

    const file = document.getElementById("newsImage")?.files[0];

    let url = "";
    if(file){
        url = await uploadImage(file);
    }

    await push(ref(db,"news"),{
        title:document.getElementById("newsTitle").value,
        text:document.getElementById("newsText").value,
        imageUrl:url,
        created:Date.now()
    });

    document.getElementById("newsTitle").value="";
    document.getElementById("newsText").value="";
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
});

// =====================
// 🧹 DELETE SYSTEM
// =====================

window.del = (path,id)=>{
    remove(ref(db,path+"/"+id));
};
