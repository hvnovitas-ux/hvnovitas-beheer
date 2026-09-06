import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const track = document.getElementById("track");
const dots = document.getElementById("dots");
const prev = document.getElementById("prev");
const next = document.getElementById("next");

let items = [];
let index = 0;
let timer = null;

const esc = (v) => String(v ?? "")
  .replace(/&/g,"&amp;")
  .replace(/</g,"&lt;")
  .replace(/>/g,"&gt;")
  .replace(/"/g,"&quot;")
  .replace(/'/g,"&#039;");

function render() {
  if (!items.length) {
    track.innerHTML = '<div class="empty">Geen afbeeldingen beschikbaar.</div>';
    dots.innerHTML = "";
    prev.hidden = next.hidden = true;
    stop();
    return;
  }

  prev.hidden = next.hidden = items.length < 2;
  track.innerHTML = items.map((item) => `
    <div class="slide">
      <img src="${esc(item.imageUrl)}" alt="Ome Jan">
    </div>
  `).join("");

  dots.innerHTML = items.map((_, i) =>
    `<button class="dot${i === index ? " active" : ""}" data-index="${i}" aria-label="Afbeelding ${i+1}"></button>`
  ).join("");

  dots.querySelectorAll(".dot").forEach(btn => {
    btn.addEventListener("click", () => goTo(Number(btn.dataset.index)));
  });

  update();
  start();
}

function update() {
  track.style.transform = `translateX(-${index * 100}%)`;
  dots.querySelectorAll(".dot").forEach((d, i) => d.classList.toggle("active", i === index));
}

function goTo(i) {
  if (!items.length) return;
  index = (i + items.length) % items.length;
  update();
  restart();
}

function start() {
  stop();
  if (items.length > 1) timer = setInterval(() => goTo(index + 1), 4500);
}

function stop() {
  if (timer) clearInterval(timer);
  timer = null;
}

function restart() { start(); }

prev.addEventListener("click", () => goTo(index - 1));
next.addEventListener("click", () => goTo(index + 1));

let startX = null;
track.addEventListener("touchstart", e => { startX = e.touches[0].clientX; }, {passive:true});
track.addEventListener("touchend", e => {
  if (startX === null) return;
  const dx = e.changedTouches[0].clientX - startX;
  startX = null;
  if (Math.abs(dx) > 45) goTo(index + (dx < 0 ? 1 : -1));
}, {passive:true});

onValue(ref(db, "omejan"), snap => {
  const data = Object.values(snap.val() || {})
    .filter(v => v?.imageUrl)
    .sort((a,b) => (a.created || 0) - (b.created || 0));
  items = data;
  index = Math.min(index, Math.max(items.length - 1, 0));
  render();
});
