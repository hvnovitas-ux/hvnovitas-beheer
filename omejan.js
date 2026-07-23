import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("📸 Ome Jan slider geladen");

// ================= ELEMENTEN =================

const track = document.getElementById("sliderTrack");
const dots = document.getElementById("dots");

let images = [];
let index = 0;
let interval = null;

// ================= DATA =================

onValue(ref(db, "omejan"), (snapshot) => {

    const data = snapshot.val() || {};

    if (!track) return;

    images = Object.values(data);

    if (images.length === 0) {
        track.innerHTML = "<p>Geen foto's</p>";
        return;
    }

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
            cursor:pointer;
        `;

        dots.appendChild(dot);
    });

    updateDots();
}

// ================= SLIDER =================

function startSlider() {

    if (interval) clearInterval(interval);

    if (images.length <= 1) return;

    interval = setInterval(() => {

        index++;

        if (index >= images.length) {
            index = 0;
        }

        track.style.transform = `translateX(-${index * 100}%)`;

        updateDots();

    }, 3000);
}

// ================= DOT UPDATE =================

function updateDots() {

    const allDots = document.querySelectorAll(".dot");

    allDots.forEach((d, i) => {
        d.style.background = i === index ? "#ff6a00" : "#ccc";
    });
}
