import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, onValue, push, set, update, remove } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

/*
 * De CMS-database is bewust de database die ook de openbare challenge moet gebruiken.
 * Vul hieronder de Firebase-configuratie van hv-novitas-handbal-challenge in.
 * De bestaande CMS-login blijft via ./firebase.js lopen.
 */
const challengeConfig = {
  apiKey: "AIzaSyBCUZeWMIxIz__7TfNG_b0V47H_pYFPyQ",
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
const questionsRef = ref(challengeDb, "questions");

const $ = id => document.getElementById(id);
const form = $("questionForm");
const list = $("questionList");
const message = $("message");
let questions = [];
let unsubscribe = null;

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
    c: Number.isInteger(Number(q.c)) ? Number(q.c) : 0
  }));
}
function render() {
  const term = $("searchInput").value.trim().toLowerCase();
  const shown = questions.filter(q => [q.q, ...q.a].join(" ").toLowerCase().includes(term));
  $("count").textContent = `(${questions.length})`;
  if (!shown.length) {
    list.innerHTML = `<p class="muted">${questions.length ? "Geen vragen gevonden." : "Nog geen vragen in de database."}</p>`;
    return;
  }
  list.innerHTML = shown.map((q, i) => `
    <article class="question">
      <h3>${i + 1}. ${escapeHtml(q.q)}</h3>
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
  $("formTitle").textContent = "➕ Nieuwe vraag toevoegen";
  $("saveButton").textContent = "Vraag opslaan";
  $("cancelEdit").hidden = true;
}
function beginEdit(id) {
  const q = questions.find(item => item.id === id);
  if (!q) return;
  $("questionId").value = q.id;
  $("questionText").value = q.q;
  for (let i = 0; i < 4; i++) $(`answer${i}`).value = q.a[i] || "";
  const radio = document.querySelector(`input[name="correct"][value="${q.c}"]`);
  if (radio) radio.checked = true;
  $("formTitle").textContent = "✏️ Vraag aanpassen";
  $("saveButton").textContent = "Wijzigingen opslaan";
  $("cancelEdit").hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  $("userInfo").textContent = "👋 " + (user.displayName || user.email || "Admin");
  if (unsubscribe) unsubscribe();
  unsubscribe = onValue(questionsRef, snapshot => {
    questions = normalized(snapshot.val());
    render();
    say("Vragen geladen.");
  }, error => {
    console.error(error);
    say("De vragen konden niet worden geladen. Controleer de Firebase-database-regels en verbinding.", true);
  });
});
$("logoutButton").addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "login.html";
  } catch (error) {
    console.error(error);
    say("Uitloggen is niet gelukt.", true);
  }
});
form.addEventListener("submit", async event => {
  event.preventDefault();
  const q = $("questionText").value.trim();
  const a = [0,1,2,3].map(i => $(`answer${i}`).value.trim());
  const correct = document.querySelector('input[name="correct"]:checked');
  if (!q || a.some(answer => !answer) || !correct) {
    say("Vul de vraag en alle vier antwoorden in en kies het juiste antwoord.", true);
    return;
  }
  const payload = { q, a, c: Number(correct.value), updatedAt: new Date().toISOString() };
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
$("cancelEdit").addEventListener("click", resetForm);
$("searchInput").addEventListener("input", render);
$("refreshButton").addEventListener("click", () => render());
