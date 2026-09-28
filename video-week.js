import { db } from "./firebase.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const content = document.getElementById("videoWeekContent");

async function loadVideoOfTheWeek() {
  if (!content) return;
  try {
    const snapshot = await get(ref(db, "videoWeek"));
    const data = snapshot.val() || {};

    const youtubeUrl = data.youtubeUrl || data.url || "";
    const title = data.title || "Video van de Week";
    const description = data.description || "";
    const buttonText = data.buttonText || "BEKIJK OP YOUTUBE";
    const active = data.active !== false;

    if (!active || !youtubeUrl) {
      content.innerHTML = `<div class="video-week-empty">Er is momenteel geen video van de week ingesteld.</div>`;
      return;
    }

    const videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) {
      content.innerHTML = `<div class="error">De ingestelde YouTube-link is niet geldig.</div>`;
      return;
    }

    renderVideo({ videoId, title, description, buttonText, youtubeUrl });
  } catch (error) {
    console.error("Fout bij Video van de Week:", error);
    content.innerHTML = `<div class="error">Video van de Week kon niet worden geladen.</div>`;
  }
}

function extractYouTubeId(value) {
  const input = String(value || "").trim();
  if (!input) return "";

  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match && match[1]) return match[1];
  }

  return /^[A-Za-z0-9_-]{11}$/.test(input) ? input : "";
}

function renderVideo({ videoId, title, description, buttonText, youtubeUrl }) {
  const safeVideoId = encodeURIComponent(videoId);
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeButtonText = escapeHtml(buttonText);
  const safeYoutubeUrl = escapeAttribute(youtubeUrl);

  content.innerHTML = `
    <div class="video-week-player">
      <iframe
        src="https://www.youtube-nocookie.com/embed/${safeVideoId}?rel=0"
        title="${safeTitle}"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen>
      </iframe>
    </div>

    <div class="video-week-meta">
      <div class="video-week-name">${safeTitle}</div>
      ${description ? `<div class="video-week-description">${safeDescription}</div>` : ""}
      <a class="video-week-button" href="${safeYoutubeUrl}" target="_blank" rel="noopener noreferrer">${safeButtonText}</a>
    </div>
  `;
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value = "") {
  return escapeHtml(value);
}

window.addEventListener("DOMContentLoaded", loadVideoOfTheWeek);
