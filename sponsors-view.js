import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const esc = (v) => String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const track = document.getElementById("sponsorTrack");
const nextButton = document.getElementById("next");
const prevButton = document.getElementById("prev");

let items = [];
let index = 0;
let timer = null;

function getActiveSponsors() {
    return items.filter(
        v => v &&
             v.active !== false &&
             (v.imageUrl || v.image)
    );
}

function sponsorHtml(v) {
    const image = v.imageUrl || v.image;
    const url = v.website || v.url || "";
    const name = v.name || v.sponsorName || "Sponsor";

    return `
        <a class="sponsor"
           href="${esc(url || "#")}"
           ${url ? 'target="_blank" rel="noopener noreferrer"' : ""}>
            <img src="${esc(image)}" alt="${esc(name)}">
        </a>
    `;
}

function render() {
    const active = getActiveSponsors();

    if (!active.length) {
        track.innerHTML = '<div class="empty">Geen sponsors beschikbaar.</div>';
        clearInterval(timer);
        return;
    }

    items = active;

    const html = active.map(sponsorHtml).join("");
    track.innerHTML = html + html;

    index = 0;
    update();

    clearInterval(timer);
    timer = setInterval(next, 3500);
}

function update() {
    const first = track.querySelector(".sponsor");
    if (!first) return;

    const gap = 50;
    const step = first.getBoundingClientRect().width + gap;

    track.style.transform = `translateX(${-index * step}px)`;
    track.style.transition = "transform .5s ease";
}

function next() {
    if (!items.length) return;
    index = (index + 1) % items.length;
    update();
}

function prev() {
    if (!items.length) return;
    index = (index - 1 + items.length) % items.length;
    update();
}

nextButton.addEventListener("click", next);
prevButton.addEventListener("click", prev);

onValue(ref(db, "sponsors"), (snap) => {
    items = Object.values(snap.val() || {});
    render();
});

window.addEventListener("resize", update);
