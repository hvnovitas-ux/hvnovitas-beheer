import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const container = document.getElementById("highlightsContainer");

console.log("🏆 Highlights view geladen");

if (!container) {
  console.error("❌ highlightsContainer niet gevonden");
} else {
  onValue(
    ref(db, "highlights"),
    (snapshot) => {
      const data = snapshot.val() || {};
      const now = new Date();
      const todayNumber = (now.getMonth() + 1) * 100 + now.getDate();

      const items = Object.values(data)
        .filter((h) => h && h.date)
        .map((h) => {
          const parts = String(h.date).split("-");
          const month = Number(parts[1]);
          const day = Number(parts[2]);

          return {
            ...h,
            month,
            day,
            calendarNumber: month * 100 + day,
          };
        })
        .filter(
          (h) =>
            Number.isInteger(h.month) &&
            Number.isInteger(h.day) &&
            h.month >= 1 &&
            h.month <= 12 &&
            h.day >= 1 &&
            h.day <= 31
        );

      if (items.length === 0) {
        container.innerHTML = `
          <div class="empty-title">Er zijn geen highlights</div>
          <div class="empty-sub">Voeg een highlight toe via het CMS.</div>
        `;
        return;
      }

      // Zoek de eerstvolgende datum van het jaar.
      let upcoming = items
        .filter((h) => h.calendarNumber >= todayNumber)
        .sort(compareHighlights);

      // Niets meer dit kalenderjaar? Dan terug naar de eerste highlight van het jaar.
      if (upcoming.length === 0) {
        upcoming = [...items].sort(compareHighlights);
      }

      // Zelfde maand/dag: gebruik de laatst toegevoegde als eerste.
      // Het systeem toont standaard één eerstvolgende highlight.
      const highlight = upcoming[0];

      const imageHtml = highlight.imageUrl
        ? `
          <div class="highlight-image-wrap">
            <img
              class="highlight-image"
              src="${escapeHTML(highlight.imageUrl)}"
              alt="${escapeHTML(highlight.title || "HV Novitas highlight")}" 
              loading="eager"
            >
          </div>
        `
        : "";

      container.innerHTML = `
        <article class="highlight-card">
          ${imageHtml}

          <div class="highlight-content">
            <div class="date">
              📅 ${escapeHTML(highlight.date || "")}
            </div>

            <h1>${escapeHTML(highlight.title || "")}</h1>

            <p>${escapeHTML(highlight.text || "")}</p>
          </div>
        </article>
      `;
    },
    (error) => {
      console.error("❌ Firebase fout bij highlights:", error);
      container.innerHTML = `
        <div class="empty-title">Highlights konden niet worden geladen.</div>
        <div class="empty-sub">Probeer de pagina opnieuw te laden.</div>
      `;
    }
  );
}

function compareHighlights(a, b) {
  if (a.calendarNumber !== b.calendarNumber) {
    return a.calendarNumber - b.calendarNumber;
  }

  return Number(b.created || 0) - Number(a.created || 0);
}

function escapeHTML(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
