import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const track = document.getElementById("track");
const dots = document.getElementById("dots");
const prev = document.getElementById("prev");
const next = document.getElementById("next");

let items = [];
let page = 0;
let timer = null;

const esc = (v) => String(v ?? "")
  .replace(/&/g,"&amp;")
  .replace(/</g,"&lt;")
  .replace(/>/g,"&gt;")
  .replace(/"/g,"&quot;")
  .replace(/'/g,"&#039;");

function perPage() {
  const w = window.innerWidth;
  if (w < 620) return 1;
  if (w < 900) return 2;
  if (w < 1200) return 3;
  return 4;
}

function pages() { return Math.max(1, Math.ceil(items.length / perPage())); }

function render() {
  if (!items.length) {
    track.innerHTML = '<div class="empty">Geen sponsors beschikbaar.</div>';
    dots.innerHTML = "";
    return;
  }

  const count = perPage();
  track.innerHTML = items.map(v => {
    const image = v.imageUrl || v.image;
    const url = v.website || v.url || "";
    const name = v.name || v.sponsorName || "Sponsor";
    return `<a class="sponsor" href="${esc(url || "#")}" ${url ? 'target="_blank" rel="noopener noreferrer"' : ""}>
      <img src="${esc(image)}" alt="${esc(name)}">
    </a>`;
  }).join("");

  page = Math.min(page, pages() - 1);

  dots.innerHTML = Array.from({length: pages()}, (_, i) =>
    `<button class="dot${i === page ? " active" : ""}" data-page="${i}" aria-label="Pagina ${i+1}"></button>`
  ).join("");

  dots.querySelectorAll(".dot").forEach(btn =>
    btn.addEventListener("click", () => goTo(Number(btn.dataset.page)))
  );

  update();
  restart();
}

function update() {
  const card = track.querySelector(".sponsor");
  if (!card) return;
  const gap = 18;
  const step = card.getBoundingClientRect().width + gap;
  track.style.transform = `translateX(-${page * step * perPage()}px)`;
  dots.querySelectorAll(".dot").forEach((d,i) => d.classList.toggle("active", i === page));
}

function goTo(p) {
  page = (p + pages()) % pages();
  update();
  restart();
}

function start() {
  stop();
  if (pages() > 1) timer = setInterval(() => goTo(page + 1), 4000);
}

function stop() {
  if (timer) clearInterval(timer);
  timer = null;
}

function restart() { start(); }

prev.addEventListener("click", () => goTo(page - 1));
next.addEventListener("click", () => goTo(page + 1));
window.addEventListener("resize", render);

onValue(ref(db, "sponsors"), snap => {
  items = Object.values(snap.val() || {})
    .filter(v => v && v.active !== false && (v.imageUrl || v.image));
  render();
});
