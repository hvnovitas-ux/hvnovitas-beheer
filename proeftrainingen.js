import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { ref, onValue, update, remove, get } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const el = (id) => document.getElementById(id);
let entries = {};
let currentUser = null;
let unsubscribe = null;

function escapeHtml(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function showNotice(text) {
  el("notice").textContent = text;
  el("notice").classList.add("show");
}
function dateLabel(value) {
  const date = new Date(Number(value));
  return Number.isNaN(date.getTime()) ? "Datum onbekend" : date.toLocaleString("nl-NL");
}
function visibleEntries() {
  const search = el("search").value.trim().toLocaleLowerCase("nl-NL");
  const filter = el("statusFilter").value;
  return Object.entries(entries).map(([id, item]) => ({ id, ...(item || {}) }))
    .filter(item => {
      if (filter !== "all" && (item.status || "Nieuw") !== filter) return false;
      if (!search) return true;
      return [item.voornaam, item.achternaam, item.email, item.telefoon, item.opmerkingen]
        .some(value => String(value || "").toLocaleLowerCase("nl-NL").includes(search));
    }).sort((a, b) => Number(b.created || 0) - Number(a.created || 0));
}
function render() {
  const all = Object.values(entries).filter(Boolean);
  el("totalCount").textContent = String(all.length);
  el("newCount").textContent = String(all.filter(item => !item.status || item.status === "Nieuw" || item.status === "Contact opgenomen").length);
  el("joinedCount").textContent = String(all.filter(item => item.status === "Lid geworden").length);
  const list = el("requestsList");
  const shown = visibleEntries();
  if (!shown.length) {
    list.innerHTML = '<div class="empty">Geen websiteaanmeldingen gevonden. Nieuwe aanvragen verschijnen hier automatisch.</div>';
    return;
  }
  list.innerHTML = shown.map(item => {
    const status = item.status || "Nieuw";
    return '<article class="request" data-id="' + escapeHtml(item.id) + '">' +
      '<div class="request-head"><h3>' + escapeHtml((item.voornaam || "") + " " + (item.achternaam || "")) + '</h3><span class="date">' + escapeHtml(dateLabel(item.created)) + '</span></div>' +
      '<div class="status">' + escapeHtml(status) + '</div>' +
      '<div class="detail"><strong>Geboortedatum</strong><span>' + escapeHtml(item.geboortedatum || "—") + '</span><strong>Geslacht</strong><span>' + escapeHtml(item.geslacht || "—") + '</span><strong>E-mail</strong><span><a href="mailto:' + escapeHtml(item.email || "") + '">' + escapeHtml(item.email || "—") + '</a></span><strong>Telefoon</strong><span><a href="tel:' + escapeHtml(item.telefoon || "") + '">' + escapeHtml(item.telefoon || "—") + '</a></span></div>' +
      (item.opmerkingen ? '<div class="notes"><strong>Opmerking:</strong> ' + escapeHtml(item.opmerkingen) + '</div>' : '') +
      '<div class="actions"><button class="secondary" type="button" data-status="Contact opgenomen">Contact opgenomen</button><button class="secondary" type="button" data-status="Proeftraining gepland">Training gepland</button><button class="secondary" type="button" data-status="Proeftraining gevolgd">Training gevolgd</button><button class="primary" type="button" data-status="Lid geworden">Lid geworden</button><button class="danger" type="button" data-action="delete">Verwijderen</button></div></article>';
  }).join("");
}
function watchEntries() {
  if (unsubscribe) unsubscribe();
  unsubscribe = onValue(ref(db, "proeftrainingen"), snapshot => {
    entries = snapshot.val() || {};
    render();
  }, error => {
    console.error("Websiteproeftrainingen laden mislukt:", error);
    showNotice("De nieuwe aanmeldingen konden niet worden geladen. Controleer of de Firebase-regels zijn gepubliceerd en of je account beheerrechten heeft.");
    el("requestsList").innerHTML = '<div class="empty">Geen toegang tot nieuwe aanvragen. Controleer de Firebase-regels.</div>';
  });
}
onAuthStateChanged(auth, user => {
  if (!user) {
    location.href = "login.html";
    return;
  }
  if (user.email !== "hvnovitas@gmail.com" || !user.emailVerified) {
    showNotice("Log in met het geverifieerde CMS-beheeraccount om de aanvragen te bekijken.");
    el("requestsList").innerHTML = '<div class="empty">Geen toegang met dit account.</div>';
    return;
  }
  currentUser = user;
  el("userInfo").textContent = user.displayName || user.email || "Beheerder";
  watchEntries();
});
el("logoutButton").addEventListener("click", async () => {
  try { await signOut(auth); location.href = "login.html"; }
  catch (error) { console.error(error); showNotice("Uitloggen is niet gelukt."); }
});
el("search").addEventListener("input", render);
el("statusFilter").addEventListener("change", render);
el("refresh").addEventListener("click", async () => {
  if (!currentUser) return;
  try {
    const snapshot = await get(ref(db, "proeftrainingen"));
    entries = snapshot.val() || {};
    render();
    showNotice("Websiteaanmeldingen zijn vernieuwd.");
  } catch (error) {
    console.error(error);
    showNotice("Vernieuwen is niet gelukt. Controleer de Firebase-regels.");
  }
});
el("requestsList").addEventListener("click", async event => {
  const button = event.target.closest("button");
  const card = event.target.closest("[data-id]");
  if (!button || !card || !entries[card.dataset.id]) return;
  const key = card.dataset.id;
  const item = entries[key];
  if (button.dataset.status) {
    const status = button.dataset.status;
    button.disabled = true;
    try {
      await update(ref(db, "proeftrainingen/" + key), { status, updatedAt: Date.now(), updatedBy: currentUser?.email || "CMS" });
      showNotice("Status bijgewerkt: " + status + ".");
    } catch (error) {
      console.error(error);
      showNotice("De status kon niet worden bijgewerkt. Controleer de Firebase-regels.");
    } finally { button.disabled = false; }
    return;
  }
  if (button.dataset.action === "delete") {
    const fullName = ((item.voornaam || "") + " " + (item.achternaam || "")).trim() || "deze aanmelding";
    if (!confirm("Weet je zeker dat je " + fullName + " wilt verwijderen?")) return;
    button.disabled = true;
    try {
      await remove(ref(db, "proeftrainingen/" + key));
      showNotice("De websiteaanmelding is verwijderd.");
    } catch (error) {
      console.error(error);
      showNotice("Verwijderen is niet gelukt. Controleer de Firebase-regels.");
      button.disabled = false;
    }
  }
});
