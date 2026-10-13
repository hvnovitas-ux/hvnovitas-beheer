import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, onValue, push, set, update, remove } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

/*
 * Quizvragen staan in het aparte Firebase-project hv-novitas-handbal-challenge.
 * Daarom meldt dit beheeronderdeel zich ook aan bij dát project; een login bij
 * hv-novitas-beheer geeft namelijk niet automatisch schrijftoegang tot deze database.
 */
const challengeConfig = {
  apiKey: "AIzaSyBCUZeWMIxIz__7TfNG_b0V47H_pYFPyqQ",
  authDomain: "hv-novitas-handbal-challenge.firebaseapp.com",
  databaseURL: "https://hv-novitas-handbal-challenge-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "hv-novitas-handbal-challenge",
  storageBucket: "hv-novitas-handbal-challenge.firebasestorage.app",
  messagingSenderId: "707710141199",
  appId: "1:707710141199:web:ba304ce4e5f653d0afb47a"
};
const challengeApp = getApps().find(app => app.name === "novitasChallengeAdmin")
  || initializeApp(challengeConfig, "novitasChallengeAdmin");
const challengeDb = getDatabase(challengeApp);
const challengeAuth = getAuth(challengeApp);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });
const ADMIN_EMAIL = "hvnovitas@gmail.com";
const questionsRef = ref(challengeDb, "questions");

const $ = id => document.getElementById(id);
const form = $("questionForm");
const list = $("questionList");
const message = $("message");
let questions = [];
let unsubscribe = null;
let currentUser = null;

function say(text, error = false) {
  message.textContent = text;
  message.style.color = error ? "#b91c1c" : "#166534";
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[ch]));
}
function normalized(data) {
  return Object.entries(data || {}).map(([id, q]) => ({
    id,
    q: String(q.q || ""),
    a: Array.isArray(q.a) ? q.a.slice(0, 4).map(String) : ["","","",""],
    c: Number.isInteger(Number(q.c)) ? Number(q.c) : 0,
    imageUrl: validImageUrl(q.imageUrl) ? String(q.imageUrl) : ""
  }));
}
function render() {
  const term = $("searchInput").value.trim().toLowerCase();
  const shown = questions.filter(q => [q.q, ...q.a].join(" ").toLowerCase().includes(term));
  $("count").textContent = `(${questions.length})`;
  const importButton = $("importOriginalButton");
  if (importButton) importButton.hidden = questions.length > 0;
  if (!shown.length) {
    list.innerHTML = `<p class="muted">${questions.length ? "Geen vragen gevonden." : "Nog geen vragen in de database."}</p>`;
    return;
  }
  list.innerHTML = shown.map((q, i) => `
    <article class="question">
      <h3>${i + 1}. ${escapeHtml(q.q)}</h3>
      ${q.imageUrl ? `<img src="${escapeHtml(q.imageUrl)}" alt="Foto bij de vraag" loading="lazy" style="max-width:100%;max-height:220px;object-fit:contain;border-radius:8px;margin:0 0 12px">` : ""}
      <div class="options">
        ${q.a.map((a, n) => `<div class="option ${n === q.c ? "correct" : ""}">${n === q.c ? "✓ " : ""}${escapeHtml(a)}</div>`).join("")}
      </div>
      <div class="actions">
        <button class="btn secondary" type="button" data-edit="${escapeHtml(q.id)}">✏️ Bewerken</button>
        <button class="btn danger" type="button" data-delete="${escapeHtml(q.id)}">🗑️ Verwijderen</button>
      </div>
    </article>`).join("");
}
function resetForm() {
  form.reset();
  $("questionId").value = "";
  updateImagePreview();
  $("formTitle").textContent = "➕ Nieuwe vraag toevoegen";
  $("saveButton").textContent = "Vraag opslaan";
  $("cancelEdit").hidden = true;
}
function beginEdit(id) {
  const q = questions.find(item => item.id === id);
  if (!q) return;
  $("questionId").value = q.id;
  $("questionText").value = q.q;
  $("imageUrl").value = q.imageUrl || "";
  updateImagePreview();
  for (let i = 0; i < 4; i++) $(`answer${i}`).value = q.a[i] || "";
  const radio = document.querySelector(`input[name="correct"][value="${q.c}"]`);
  if (radio) radio.checked = true;
  $("formTitle").textContent = "✏️ Vraag aanpassen";
  $("saveButton").textContent = "Wijzigingen opslaan";
  $("cancelEdit").hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function showLogin() {
  currentUser = null;
  if (unsubscribe) { unsubscribe(); unsubscribe = null; }
  $("userInfo").textContent = "Niet ingelogd";
  $("loginButton").hidden = false;
  $("logoutButton").hidden = true;
  $("saveButton").disabled = true;
  questions = [];
  render();
}
function beginAdmin(user) {
  if (user.email !== ADMIN_EMAIL || user.emailVerified !== true) {
    say("Alleen het geverifieerde Google-account hvnovitas@gmail.com mag quizvragen beheren.", true);
    signOut(challengeAuth).catch(console.error);
    return;
  }
  currentUser = user;
  $("userInfo").textContent = "👋 " + (user.displayName || user.email || "Beheerder");
  $("loginButton").hidden = true;
  $("logoutButton").hidden = false;
  $("saveButton").disabled = false;
  if (unsubscribe) unsubscribe();
  unsubscribe = onValue(questionsRef, snapshot => {
    questions = normalized(snapshot.val());
    render();
    say("Vragen geladen.");
  }, error => {
    console.error("Quizvragen laden mislukt:", error);
    say("Vragen laden mislukt. Controleer de regels van de database HV Novitas Handbal Challenge.", true);
  });
}
onAuthStateChanged(challengeAuth, user => user ? beginAdmin(user) : showLogin());
$("loginButton").addEventListener("click", async () => {
  $("loginButton").disabled = true;
  say("Google-inloggen voor de Handbalchallenge openen…");
  try {
    const result = await signInWithPopup(challengeAuth, provider);
    if (result.user.email !== ADMIN_EMAIL || result.user.emailVerified !== true) {
      await signOut(challengeAuth);
      say("Dit is niet het bevoegde account. Gebruik hvnovitas@gmail.com.", true);
    } else {
      say("Ingelogd. Quizvragen laden…");
    }
  } catch (error) {
    console.error("Challenge-login mislukt:", error);
    const messages = {
      "auth/configuration-not-found": "Firebase Authentication is nog niet ingesteld voor het Challenge-project. Open Firebase Console > Authentication, klik indien nodig op Aan de slag en schakel Google in.",
      "auth/operation-not-allowed": "Google-inloggen staat nog niet aan in Firebase Authentication van HV Novitas Handbal Challenge.",
      "auth/unauthorized-domain": "Voeg hvnovitas-ux.github.io toe aan de toegestane domeinen van Firebase Authentication in het Challenge-project.",
      "auth/popup-blocked": "De browser blokkeerde het inlogvenster. Sta pop-ups toe en probeer opnieuw.",
      "auth/popup-closed-by-user": "Het inlogvenster is gesloten voordat het inloggen klaar was.",
      "auth/network-request-failed": "Geen verbinding. Controleer je internet."
    };
    say(messages[error.code] || ("Inloggen mislukt (" + (error.code || "onbekende fout") + "). Controleer Google-login in het Challenge-project."), true);
  } finally {
    $("loginButton").disabled = false;
  }
});
$("logoutButton").addEventListener("click", async () => {
  try {
    await signOut(challengeAuth);
    say("Je bent uitgelogd.");
  } catch (error) {
    console.error(error);
    say("Uitloggen is niet gelukt.", true);
  }
});
form.addEventListener("submit", async event => {
  event.preventDefault();
  if (!currentUser || currentUser.email !== ADMIN_EMAIL || currentUser.emailVerified !== true) {
    say("Log eerst in met het bevoegde account hvnovitas@gmail.com.", true);
    return;
  }
  const q = $("questionText").value.trim();
  const a = [0,1,2,3].map(i => $(`answer${i}`).value.trim());
  const correct = document.querySelector('input[name="correct"]:checked');
  if (!q || a.some(answer => !answer) || !correct) {
    say("Vul de vraag en alle vier antwoorden in en kies het juiste antwoord.", true);
    return;
  }
  const imageUrlRaw = $("imageUrl").value.trim();
  const imageUrl = imageUrlRaw ? validImageUrl(imageUrlRaw) ? imageUrlRaw : null : "";
  if (imageUrl === null) {
    say("Gebruik een geldige foto-link die begint met https:// of http://.", true);
    return;
  }
  const payload = { q, a, c: Number(correct.value), imageUrl, updatedAt: new Date().toISOString() };
  const id = $("questionId").value;
  $("saveButton").disabled = true;
  try {
    if (id) {
      await update(ref(challengeDb, `questions/${id}`), payload);
      say("Vraag aangepast.");
    } else {
      payload.createdAt = new Date().toISOString();
      await set(push(questionsRef), payload);
      say("Nieuwe vraag toegevoegd.");
    }
    resetForm();
  } catch (error) {
    console.error(error);
    say("Opslaan is niet gelukt. Controleer of je Firebase-database schrijfbevoegdheid toestaat.", true);
  } finally {
    $("saveButton").disabled = false;
  }
});
list.addEventListener("click", async event => {
  const editButton = event.target.closest("[data-edit]");
  const deleteButton = event.target.closest("[data-delete]");
  if (editButton) beginEdit(editButton.dataset.edit);
  if (deleteButton) {
    const q = questions.find(item => item.id === deleteButton.dataset.delete);
    if (!q || !confirm(`Weet je zeker dat je deze vraag wilt verwijderen?\n\n${q.q}`)) return;
    try {
      await remove(ref(challengeDb, `questions/${q.id}`));
      say("Vraag verwijderd.");
      if ($("questionId").value === q.id) resetForm();
    } catch (error) {
      console.error(error);
      say("Verwijderen is niet gelukt. Controleer de Firebase-database-regels.", true);
    }
  }
});
const photoBase = "https://raw.githubusercontent.com/hvnovitas-ux/hvnovitas-handbal-challenge/main/fotos/";
const photoListApi = "https://api.github.com/repos/hvnovitas-ux/hvnovitas-handbal-challenge/contents/fotos?ref=main";
function validImageUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return (url.protocol === "https:" || url.protocol === "http:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}
function photoNameFromUrl(value) {
  if (!value) return "";
  try { return decodeURIComponent(new URL(value).pathname.split("/").pop() || ""); }
  catch { return ""; }
}
async function loadPhotoChoices() {
  const select = $("imageUrl");
  const status = $("photoListStatus");
  const current = select.value;
  try {
    const response = await fetch(photoListApi, { headers: { "Accept": "application/vnd.github+json" } });
    if (!response.ok) throw new Error("GitHub API antwoordde met " + response.status);
    const files = await response.json();
    const allowed = /\.(jpe?g|png|gif|webp)$/i;
    const photos = files.filter(file => file.type === "file" && allowed.test(file.name)).sort((a,b) => a.name.localeCompare(b.name, "nl"));
    select.replaceChildren(new Option("Geen foto", ""));
    for (const photo of photos) {
      const url = photoBase + encodeURIComponent(photo.name);
      select.add(new Option(photo.name, url));
    }
    if (current && [...select.options].some(option => option.value === current)) select.value = current;
    status.textContent = photos.length ? photos.length + " foto('s) gevonden in de map fotos." : "Nog geen foto's gevonden. Voeg eerst afbeeldingen toe aan de map fotos.";
  } catch (error) {
    console.error("Foto's laden mislukt:", error);
    status.textContent = "De fotolijst kon niet worden geladen. Controleer de map fotos en probeer opnieuw.";
  }
  updateImagePreview();
}
function updateImagePreview() {
  const select = $("imageUrl");
  const preview = $("imagePreview");
  const value = select.value.trim();
  if (!value || !validImageUrl(value)) {
    preview.hidden = true;
    preview.removeAttribute("src");
    return;
  }
  preview.onload = () => { preview.hidden = false; };
  preview.onerror = () => { preview.hidden = true; };
  preview.src = value;
}
$("imageUrl").addEventListener("change", updateImagePreview);
loadPhotoChoices();
$("cancelEdit").addEventListener("click", resetForm);
$("searchInput").addEventListener("input", render);
$("refreshButton").addEventListener("click", () => render());

/* Herstel de 60 bestaande basisvragen als de dynamische database leeg is.
   Bestaande vragen worden nooit overschreven; dubbelen worden overgeslagen. */
$("importOriginalButton").addEventListener("click", async () => {
  if (!currentUser || currentUser.email !== ADMIN_EMAIL || currentUser.emailVerified !== true) {
    say("Log eerst in met het bevoegde account hvnovitas@gmail.com.", true);
    return;
  }
  if (questions.length) {
    say("Er staan al vragen in de database. De basisvragen zijn daarom niet geïmporteerd.", true);
    return;
  }
  if (!confirm("De database is leeg. De 60 bestaande basisvragen herstellen in de Handbalchallenge?")) return;

  const button = $("importOriginalButton");
  button.disabled = true;
  say("Basisvragen ophalen en importeren…");
  try {
    const response = await fetch("./original-questions.json?v=20261013-restore", { cache: "no-store" });
    if (!response.ok) throw new Error("Basisvragen konden niet worden geladen (HTTP " + response.status + ").");
    const source = await response.json();
    if (!Array.isArray(source) || !source.length) throw new Error("Het bestand met basisvragen is leeg of ongeldig.");

    const existing = new Set(questions.map(item => item.q.trim().toLowerCase()));
    const missing = source.filter(item => item && typeof item.q === "string" &&
      item.q.trim() && !existing.has(item.q.trim().toLowerCase()));

    if (!missing.length) {
      say("Alle basisvragen staan al in de database.");
      return;
    }

    const additions = {};
    for (const item of missing) {
      const newRef = push(questionsRef);
      additions[newRef.key] = {
        q: item.q.trim(),
        a: Array.isArray(item.a) ? item.a.slice(0, 4).map(value => String(value ?? "")) : ["", "", "", ""],
        c: Number.isInteger(Number(item.c)) && Number(item.c) >= 0 && Number(item.c) <= 3 ? Number(item.c) : 0,
        imageUrl: "",
        createdAt: new Date().toISOString(),
        importedFrom: "original-questions.json"
      };
    }
    await update(questionsRef, additions);
    say(missing.length + " basisvragen zijn hersteld. Je kunt ze nu bekijken en bewerken.");
  } catch (error) {
    console.error("Basisvragen herstellen mislukt:", error);
    say("Herstellen mislukt. Controleer of de regels van de Firebase-database HV Novitas Handbal Challenge schrijven toestaan. " + (error.message || ""), true);
  } finally {
    button.disabled = false;
  }
});
