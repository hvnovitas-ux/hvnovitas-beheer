import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { ref, get, set } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const ADMIN_EMAIL = "hvnovitas@gmail.com";
const $ = id => document.getElementById(id);
let authorised = false;
const DEFAULT_TEXT = "Ze komt 17 april";

function status(message, error = false) {
  $("status").textContent = message;
  $("status").style.color = error ? "#b42318" : "#187044";
}

function updatePreview() {
  const value = $("announcementText").value.trim();
  $("charCount").textContent = String($("announcementText").value.length);
  $("previewText").textContent = value || "Jouw tekst verschijnt hier";
}

async function loadText() {
  status("Opgeslagen tekst laden...");
  try {
    const snapshot = await get(ref(db, "homepageAnnouncement"));
    const data = snapshot.val();
    $("announcementText").value = typeof data?.text === "string" ? data.text : DEFAULT_TEXT;
    updatePreview();
    status("De huidige tekst is geladen.");
  } catch (error) {
    console.error("Neonregel laden mislukt:", error);
    if (!$("announcementText").value) $("announcementText").value = DEFAULT_TEXT;
    updatePreview();
    status("De standaardtekst is ingevuld. Opslaan werkt pas als de database-regels voor homepageAnnouncement zijn gepubliceerd.", true);
  }
}

onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  if (user.email !== ADMIN_EMAIL || user.emailVerified !== true) {
    status("Alleen het geverifieerde beheeraccount hvnovitas@gmail.com mag deze tekst wijzigen.", true);
    $("saveButton").disabled = true;
    $("clearButton").disabled = true;
    return;
  }
  authorised = true;
  $("userInfo").textContent = user.displayName || user.email;
  await loadText();
});

$("announcementText").addEventListener("input", updatePreview);

$("saveButton").addEventListener("click", async () => {
  if (!authorised) {
    status("Je bent niet bevoegd om deze tekst op te slaan.", true);
    return;
  }
  const text = $("announcementText").value.trim();
  if (text.length > 120) {
    status("De tekst mag maximaal 120 tekens bevatten.", true);
    return;
  }
  $("saveButton").disabled = true;
  $("clearButton").disabled = true;
  status("Tekst opslaan...");
  try {
    await set(ref(db, "homepageAnnouncement"), {
      text,
      updatedAt: Date.now(),
      updatedBy: auth.currentUser.email
    });
    status(text ? "De tekst is opgeslagen. Vernieuw de homepage om hem te bekijken." : "De neonregel is leeggemaakt.");
  } catch (error) {
    console.error("Neonregel opslaan mislukt:", error);
    status("Opslaan is niet gelukt. Controleer of de Firebase-regels voor homepageAnnouncement zijn gepubliceerd.", true);
  } finally {
    $("saveButton").disabled = false;
    $("clearButton").disabled = false;
  }
});

$("clearButton").addEventListener("click", () => {
  $("announcementText").value = "";
  updatePreview();
  $("saveButton").click();
});

$("logoutButton").addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "login.html";
  } catch (error) {
    console.error(error);
    status("Uitloggen is niet gelukt.", true);
  }
});

updatePreview();
