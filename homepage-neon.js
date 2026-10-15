import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const element = document.getElementById("homepageAnnouncement");

if (element) {
  onValue(
    ref(db, "homepageAnnouncement/text"),
    snapshot => {
      const value = snapshot.val();
      element.textContent = typeof value === "string" ? value.trim() : "";
      element.hidden = !element.textContent;
    },
    error => {
      console.error("Homepage neonregel kon niet worden geladen:", error);
      element.textContent = "";
      element.hidden = true;
    }
  );
}
