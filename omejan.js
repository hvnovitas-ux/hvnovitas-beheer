import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("📸 Ome Jan JS geladen");

// ================= FIREBASE =================

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "hv-novitas-beheer.firebaseapp.com",
    databaseURL: "https://hv-novitas-beheer-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "hv-novitas-beheer"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ================= ELEMENTEN =================

const track = document.getElementById("sliderTrack");
const dots = document.getElementById("dots");

let images = [];
let index = 0;

// ================= DATA LOAD =================

onValue(ref(db, "omejan"), (snapshot) => {

    const data = snapshot.val();

    if (!track) return;

    if (!data) {
        track.innerHTML = "<p>Geen foto's</p>";
        return;
    }

    images = Object.values(data);

    track.innerHTML = images.map(img => `
        <img src="${img.imageUrl}" style="width:100%; flex-shrink:0;">
    `).join("");

    createDots();
    startSlider();
});

// ================= DOTS =================

function createDots() {

    if (!dots) return;

    dots.innerHTML = "";

    images.forEach((_, i) => {

        const dot = document.createElement("span");
        dot.className = "dot";
        dot.style.cssText = `
            height:10px;
            width:10px;
            margin:5px;
            display:inline-block;
            background:#ccc;
            border-radius:50%;
        `;

        dots.appendChild(dot);
    });
}

// ================= SLIDER =================

function startSlider() {

    if (images.length <= 1) return;

    setInterval(() => {

        index++;

        if (index >= images.length) {
            index = 0;
        }

        track.style.transform = `translateX(-${index * 100}%)`;

        updateDots();

    }, 3000);
}

// ================= DOT ACTIVE =================

function updateDots() {

    const allDots = document.querySelectorAll(".dot");

    allDots.forEach((d, i) => {
        d.style.background = i === index ? "#ff6a00" : "#ccc";
    });
}
