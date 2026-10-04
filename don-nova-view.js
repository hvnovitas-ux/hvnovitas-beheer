import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const ROOT = "donNova";

const stripImage = document.getElementById("donNovaStrip");
const video1 = document.getElementById("donVideo1");
const video2 = document.getElementById("donVideo2");

const text1Heading = document.getElementById("donText1Heading");
const text1Body = document.getElementById("donText1Body");
const text2Heading = document.getElementById("donText2Heading");
const text2Body = document.getElementById("donText2Body");

onValue(
  ref(db, ROOT),
  (snapshot) => {
    const data = snapshot.val() || {};

    if (data.strip?.imageUrl) {
      stripImage.src = data.strip.imageUrl;
    }

    text1Heading.textContent =
      data.text1?.heading || "Meer dan alleen handbal";

    text1Body.textContent =
      data.text1?.body ||
      "Bij HV Novitas draait het om veel meer dan alleen wedstrijden. We organiseren regelmatig leuke activiteiten, ouder-kindwedstrijden, afsluitingsdagen en andere gezellige momenten. Zo leer je niet alleen handballen, maar maak je ook nieuwe vrienden en beleef je samen een geweldige tijd.";

    text2Heading.textContent =
      data.text2?.heading ||
      "Een perfecte afsluiting van het seizoen.";

    text2Body.textContent =
      data.text2?.body ||
      "Bij HV Novitas hebben we het seizoen afgesloten met een waterdag vol spelletjes, lachen en teamgevoel. Geen training vandaag... maar plezier, zon en samen genieten. Jeugd, ouders en trainers deden allemaal mee aan een dag vol energie en gezelligheid. Dit is waar een club voor staat.";

    renderVideo(
      video1,
      data.video1?.youtubeUrl,
      data.video1?.title || "Don Video 1"
    );

    renderVideo(
      video2,
      data.video2?.youtubeUrl,
      data.video2?.title || "Don Video 2"
    );
  },
  (error) => {
    console.error("Don Nova Firebase-fout:", error);
  }
);

function renderVideo(target, youtubeUrl, title) {
  const videoId = extractYouTubeId(youtubeUrl);

  if (!videoId) {
    target.innerHTML =
      '<div class="dn-video-loading">Don Video kan via het CMS worden ingesteld.</div>';
    return;
  }

  target.innerHTML = `
    <iframe
      src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0"
      title="${escapeHtml(title)}"
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen>
    </iframe>
  `;
}

function extractYouTubeId(value) {
  const input = String(value || "").trim();
  if (!input) return "";

  try {
    const url = new URL(input);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.replace(/^\/+/, "").split("/")[0];
      return validId(id) ? id : "";
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const watchId = url.searchParams.get("v");
      if (validId(watchId)) return watchId;

      const parts = url.pathname.split("/").filter(Boolean);

      for (const type of ["shorts", "embed"]) {
        const index = parts.indexOf(type);
        if (index >= 0 && validId(parts[index + 1])) {
          return parts[index + 1];
        }
      }
    }
  } catch (error) {
    console.warn("YouTube URL kon niet worden gelezen.", error);
  }

  return validId(input) ? input : "";
}

function validId(value) {
  return typeof value === "string" &&
    value.length === 11 &&
    /^[A-Za-z0-9_-]+$/.test(value);
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
