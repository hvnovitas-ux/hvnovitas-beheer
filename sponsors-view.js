import { db } from "./firebase.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🤝 Sponsor slider geladen");

const track = document.getElementById("sponsorTrack");
let position = 0;
const speed = 0.5;
let animationId = null;

function escapeHtml(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function loadSponsors() {
    try {
        const snap = await get(ref(db, "sponsors"));
        const data = snap.val() || {};

        const list = Object.entries(data)
            .map(([id, sponsor]) => ({
                id,
                imageUrl: sponsor.imageUrl || sponsor.image || "",
                website: sponsor.website || "",
                name: sponsor.name || "Sponsor"
            }))
            .filter(sponsor => sponsor.imageUrl);

        if (!track) return;

        if (!list.length) {
            track.innerHTML = '<p class="empty">Geen sponsors</p>';
            return;
        }

        const items = [...list, ...list];

        track.innerHTML = items.map(sponsor => `
            <div class="sponsor">
                ${
                    sponsor.website
                        ? `<a href="${escapeHtml(sponsor.website)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(sponsor.name)}">
                                <img src="${escapeHtml(sponsor.imageUrl)}" alt="${escapeHtml(sponsor.name)}">
                           </a>`
                        : `<img src="${escapeHtml(sponsor.imageUrl)}" alt="${escapeHtml(sponsor.name)}">`
                }
            </div>
        `).join("");

        position = 0;
        startSlider();
    } catch (error) {
        console.error("❌ Sponsors laden mislukt:", error);
        if (track) track.innerHTML = '<p class="empty">Sponsors konden niet worden geladen.</p>';
    }
}

function startSlider() {
    cancelAnimationFrame(animationId);

    function animate() {
        position -= speed;
        track.style.transform = `translate3d(${position}px, 0, 0)`;

        const halfWidth = track.scrollWidth / 2;
        if (halfWidth > 0 && Math.abs(position) >= halfWidth) {
            position = 0;
        }

        animationId = requestAnimationFrame(animate);
    }

    animate();
}

window.addEventListener("DOMContentLoaded", loadSponsors);
