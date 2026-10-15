import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const element = document.getElementById("homepageAnnouncement");
const DEFAULT_TEXT = "Ze komt 17 april";

if (element) {
  // Toon meteen de aankondiging; een opgeslagen beheer-tekst krijgt voorrang.
  element.textContent = DEFAULT_TEXT;
  element.hidden = false;

  onValue(
    ref(db, "homepageAnnouncement/text"),
    snapshot => {
      if (snapshot.exists()) {
        const value = snapshot.val();
        element.textContent = typeof value === "string" ? value.trim() : "";
      } else {
        element.textContent = DEFAULT_TEXT;
      }
      element.hidden = !element.textContent;
    },
    error => {
      console.error("Homepage neonregel kon niet worden geladen:", error);
      // Laat de tijdelijke standaardtekst zien als Firebase nog niet bereikbaar is.
      element.textContent = DEFAULT_TEXT;
      element.hidden = false;
    }
  );
}
