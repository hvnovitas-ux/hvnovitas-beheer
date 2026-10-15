import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const element = document.getElementById("homepageAnnouncement");
const DEFAULT_TEXT = "Ze komt 17 april";

// Forceer de hoofdkleur ook als een oudere stylesheet nog gecachet is.
function applyReadableStyle() {
  if (!element) return;
  element.style.setProperty("color", "#fffaf2", "important");
  element.style.setProperty("-webkit-text-stroke", "0.45px rgba(105, 35, 0, 0.95)", "important");
  element.style.setProperty("text-shadow", "0 1px 1px rgba(65, 19, 0, 0.98), 0 0 3px rgba(83, 27, 0, 0.95), 0 0 8px rgba(0, 0, 0, 0.72), 0 0 14px rgba(255, 112, 20, 0.95), 0 0 26px rgba(255, 68, 0, 0.72)", "important");
}

if (element) {
  // Toon meteen de aankondiging; een opgeslagen beheer-tekst krijgt voorrang.
  element.textContent = DEFAULT_TEXT;
  element.hidden = false;
  applyReadableStyle();

  onValue(
    ref(db, "homepageAnnouncement"),
    snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        element.textContent = typeof data?.text === "string" ? data.text.trim() : "";
      } else {
        element.textContent = DEFAULT_TEXT;
      }
      element.hidden = !element.textContent;
      applyReadableStyle();
    },
    error => {
      console.error("Homepage neonregel kon niet worden geladen:", error);
      // Laat de tijdelijke standaardtekst zien als Firebase nog niet bereikbaar is.
      element.textContent = DEFAULT_TEXT;
      element.hidden = false;
      applyReadableStyle();
    }
  );
}
