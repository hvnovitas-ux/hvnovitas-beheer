import { db, auth } from "./firebase.js";
import {
  ref,
  onValue,
  push,
  update,
  remove
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const $ = id => document.getElementById(id);
const ROOT = "recreantenPagina";
const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[ch]));
let cache = { experts: {}, stories: {}, media: {} };

onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  $("userInfo").textContent = user.displayName || user.email || "Beheerder";
});

$("logoutButton").addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "login.html";
  } catch (error) {
    console.error("Uitloggen mislukt:", error);
    alert("Uitloggen is niet gelukt.");
  }
});

function status(id, message, isError = false) {
  const el = $(id);
  if (!el) return;
  el.textContent = message;
  el.className = "rec-admin-status show" + (isError ? " error" : "");
}

function clearStatus(id) {
  const el = $(id);
  if (el) {
    el.textContent = "";
    el.className = "rec-admin-status";
  }
}

function sortedItems(obj) {
  return Object.entries(obj || {})
    .map(([id, item]) => ({ id, ...item }))
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0) || Number(a.created || 0) - Number(b.created || 0));
}

async function uploadImage(file) {
  if (!file) return "";
  if (!file.type.startsWith("image/")) throw new Error("Kies een afbeeldingsbestand.");
  if (file.size > 10 * 1024 * 1024) throw new Error("De afbeelding is groter dan 10 MB.");
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", "hvnovitas_upload");
  const response = await fetch("https://api.cloudinary.com/v1_1/hwxe3jzg/image/upload", {
    method: "POST",
    body: form
  });
  if (!response.ok) throw new Error("De foto kon niet worden geüpload.");
  const result = await response.json();
  if (!result.secure_url) throw new Error("De upload gaf geen afbeeldingslink terug.");
  return result.secure_url;
}

const DEFAULT_SETTINGS = {
  heroKicker: "RECREATIEF HANDBAL BIJ HV NOVITAS",
  heroTitle: "WAAROM STOPPEN MET WAT JE HET LIEFSTE DOET?",
  heroLead: "Je hoeft niet meer in competitie te spelen om te blijven handballen. Blijf bewegen, ontmoet anderen en houd plezier in de sport.",
  heroNoteTitle: "Handbal blijft leuk!",
  heroNoteText: "Bij HV Novitas kun je ook zonder wedstrijddruk blijven trainen. Oud-handballers en beginners zijn welkom.",
  introKicker: "MEER DAN WEDSTRIJDEN",
  introTitle: "Blijf bewegen met de sport die je graag doet",
  introText: "Handbal hoeft niet te eindigen bij je laatste competitiewedstrijd. Recreatief handbal biedt ruimte om op een ontspannen manier actief te blijven, samen te sporten en plezier te hebben.",
  reason1Title: "Blijf in beweging",
  reason1Text: "Handbal brengt je in beweging en daagt je uit om actief bezig te blijven.",
  reason2Title: "Blijf mensen ontmoeten",
  reason2Text: "Samen sporten betekent samen lachen, contact houden en ergens bij horen.",
  reason3Title: "Blijf handballen",
  reason3Text: "Geen competitieverplichting, maar wel de bal, het samenspel en het plezier.",
  healthKicker: "GEZOND BEWEGEN",
  healthTitle: "Waarom blijven sporten belangrijk is",
  healthIntro: "We willen op deze pagina betrouwbare informatie delen over bewegen en gezondheid. Daarom geven we deskundigen de ruimte om hun kennis en ervaring te delen.",
  healthBody: "Bewegen is belangrijk in iedere levensfase. Hoe je verantwoord actief blijft, verschilt per persoon. Op deze pagina verzamelen we informatie en inzichten van deskundigen, zodat bezoekers zich goed kunnen informeren.\n\nHV Novitas deelt vanuit de liefde voor handbal de uitnodiging om in beweging te blijven. Voor persoonlijk medisch advies kun je terecht bij je huisarts of een andere zorgprofessional.",
  expertsKicker: "KENNIS EN ERVARING",
  expertsTitle: "Deskundigen aan het woord",
  expertsIntro: "Fysiotherapeuten, beweegdeskundigen en andere professionals delen hier hun kennis over bewegen, gezondheid en actief blijven.",
  teamKicker: "RECREANTEN BIJ NOVITAS",
  teamTitle: "Maar wat doen jullie dan?",
  teamIntro: "Een heel begrijpelijke vraag. Daarom laten we graag zien hoe onze trainingen eruitzien.",
  teamBody: "We trainen op een ontspannen manier met de handbal als uitgangspunt. Er is aandacht voor bewegen, balvaardigheid, samenspel en afronden op doel. Iedereen doet mee op zijn of haar eigen niveau.\n\nJe hoeft geen oud-handballer te zijn en je hoeft niet aan wedstrijden mee te doen. Het gaat om actief bezig zijn en plezier hebben in handbal.",
  mediaKicker: "KIJK MEE",
  mediaTitle: "Recreatief handbal in beeld",
  mediaIntro: "Foto's en video's laten beter dan woorden zien wat we samen doen en hoeveel plezier handbal kan geven.",
  storiesKicker: "VERHALEN UIT DE GROEP",
  storiesTitle: "Handbalplezier opnieuw ontdekt",
  storiesIntro: "Iedereen heeft zijn eigen reden om te blijven of opnieuw te gaan handballen.",
  ctaTitle: "Zin om weer te gaan handballen?",
  ctaText: "Wil je weten of recreatief handbal bij je past? Neem vrijblijvend contact op met HV Novitas. We vertellen je graag meer.",
  ctaLinkText: "Plan een proeftraining",
  ctaLink: "https://www.hvnovitas.nl/proeftrainingen.html"
};

onValue(ref(db, ROOT + "/settings"), async snapshot => {
  const settings = snapshot.val() || {};
  const missing = Object.fromEntries(
    Object.entries(DEFAULT_SETTINGS).filter(([key]) => !Object.prototype.hasOwnProperty.call(settings, key) || settings[key] === null || String(settings[key]).trim() === "")
  );
  if (Object.keys(missing).length) {
    try {
      await update(ref(db, ROOT + "/settings"), { ...missing, updated: Date.now() });
    } catch (error) {
      console.error("Standaardteksten invullen mislukt:", error);
      status("globalStatus", "De standaardteksten konden niet automatisch worden ingevuld. Controleer de Firebase-rechten.", true);
    }
  }
  const merged = { ...DEFAULT_SETTINGS, ...settings };
  const form = $("settingsForm");
  Array.from(form.elements).forEach(field => {
    if (field.name && Object.prototype.hasOwnProperty.call(merged, field.name)) {
      field.value = merged[field.name] ?? "";
    }
  });
});

$("settingsForm").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const settings = {};
  Array.from(form.elements).forEach(field => {
    if (field.name) settings[field.name] = field.value.trim();
  });
  try {
    await update(ref(db, ROOT + "/settings"), { ...settings, updated: Date.now() });
    status("settingsStatus", "De pagina-teksten zijn opgeslagen.");
  } catch (error) {
    console.error(error);
    status("settingsStatus", "Opslaan is niet gelukt. Controleer je verbinding en de Firebase-rechten.", true);
  }
});

function renderList(type) {
  const target = $(type + "List");
  const items = sortedItems(cache[type]);
  if (!items.length) {
    target.innerHTML = '<p class="rec-admin-intro">Er zijn nog geen onderdelen toegevoegd.</p>';
    return;
  }
  target.innerHTML = items.map(item => {
    const title = item.title || item.name || "Zonder titel";
    const extra = type === "experts" ? (item.role || item.intro || "") :
      type === "stories" ? (item.quote || item.text || "") :
      (item.type === "video" ? "Video · " + (item.videoUrl || "") : "Foto · " + (item.text || ""));
    return `<div class="rec-admin-item">
      <div><strong>${esc(title)}</strong><small>${esc(extra)} · ${item.active === false ? "Verborgen" : "Zichtbaar"}</small></div>
      <div class="rec-admin-item-actions">
        <button type="button" class="secondary" data-edit-type="${type}" data-edit-id="${esc(item.id)}">Bewerken</button>
        <button type="button" class="danger" data-delete-type="${type}" data-delete-id="${esc(item.id)}">Verwijderen</button>
      </div>
    </div>`;
  }).join("");
}

["experts", "stories", "media"].forEach(type => {
  onValue(ref(db, ROOT + "/" + type), snapshot => {
    cache[type] = snapshot.val() || {};
    renderList(type);
  });
});

function value(id) {
  return $(id).value.trim();
}

function updateMediaFields() {
  const isVideo = $("mediaType").value === "video";
  $("mediaVideoField").hidden = !isVideo;
  $("mediaPhotoUrlField").hidden = isVideo;
  $("mediaPhotoFileField").hidden = isVideo;
}

$("mediaType").addEventListener("change", updateMediaFields);
updateMediaFields();

async function saveItem(type, payload, id, fileInputId, urlInputId, statusId) {
  try {
    const file = fileInputId ? $(fileInputId).files[0] : null;
    if (file) {
      status(statusId, "Foto uploaden...");
      payload.imageUrl = await uploadImage(file);
    } else if (urlInputId) {
      payload.imageUrl = value(urlInputId);
    }
    payload.active = $(type === "experts" ? "expertActive" : type === "stories" ? "storyActive" : "mediaActive").checked;
    payload.order = Number(payload.order || 10);
    payload.updated = Date.now();
    if (id) {
      await update(ref(db, ROOT + "/" + type + "/" + id), payload);
      status(statusId, "Wijzigingen opgeslagen.");
    } else {
      payload.created = Date.now();
      await push(ref(db, ROOT + "/" + type), payload);
      status(statusId, "Onderdeel toegevoegd aan de pagina.");
    }
    $(type === "experts" ? "expertForm" : type === "stories" ? "storyForm" : "mediaForm").reset();
    $(type === "experts" ? "expertId" : type === "stories" ? "storyId" : "mediaId").value = "";
    if (type === "experts") $("expertOrder").value = "10";
    if (type === "stories") $("storyOrder").value = "10";
    if (type === "media") { $("mediaOrder").value = "10"; updateMediaFields(); }
    $(type === "experts" ? "expertActive" : type === "stories" ? "storyActive" : "mediaActive").checked = true;
  } catch (error) {
    console.error(error);
    status(statusId, error.message || "Opslaan is niet gelukt. Controleer de verbinding en probeer opnieuw.", true);
  }
}

$("expertForm").addEventListener("submit", event => {
  event.preventDefault();
  const payload = {
    title: value("expertTitle"),
    name: value("expertName"),
    role: value("expertRole"),
    intro: value("expertIntro"),
    detail: value("expertDetail"),
    order: value("expertOrder")
  };
  if (!payload.title || !payload.intro) {
    status("expertStatus", "Vul minimaal de titel en korte introductie in.", true);
    return;
  }
  saveItem("experts", payload, value("expertId"), "expertImageFile", "expertImageUrl", "expertStatus");
});

$("storyForm").addEventListener("submit", event => {
  event.preventDefault();
  const payload = {
    title: value("storyTitle"),
    name: value("storyName"),
    quote: value("storyQuote"),
    text: value("storyText"),
    order: value("storyOrder")
  };
  if (!payload.title || !payload.text) {
    status("storyStatus", "Vul minimaal de titel en het verhaal in.", true);
    return;
  }
  saveItem("stories", payload, value("storyId"), null, null, "storyStatus");
});

$("mediaForm").addEventListener("submit", event => {
  event.preventDefault();
  const type = value("mediaType");
  const payload = {
    title: value("mediaItemTitle"),
    type,
    text: value("mediaText"),
    videoUrl: value("mediaVideoUrl"),
    order: value("mediaOrder")
  };
  if (!payload.title) {
    status("mediaStatus", "Vul een titel in.", true);
    return;
  }
  if (type === "video" && !payload.videoUrl) {
    status("mediaStatus", "Vul de videolink in.", true);
    return;
  }
  saveItem("media", payload, value("mediaId"), "mediaImageFile", "mediaImageUrl", "mediaStatus");
});

function fillForm(type, item) {
  const map = {
    experts: {
      id: "expertId", title: "expertTitle", name: "expertName", role: "expertRole",
      intro: "expertIntro", detail: "expertDetail", order: "expertOrder",
      imageUrl: "expertImageUrl", active: "expertActive"
    },
    stories: {
      id: "storyId", title: "storyTitle", name: "storyName", quote: "storyQuote",
      text: "storyText", order: "storyOrder", active: "storyActive"
    },
    media: {
      id: "mediaId", title: "mediaItemTitle", type: "mediaType", text: "mediaText",
      imageUrl: "mediaImageUrl", videoUrl: "mediaVideoUrl", order: "mediaOrder", active: "mediaActive"
    }
  }[type];
  Object.entries(map).forEach(([key, id]) => {
    if (key === "id") $(id).value = item.id;
    else if (key === "active") $(id).checked = item.active !== false;
    else if ($(id)) $(id).value = item[key] ?? "";
  });
  if (type === "media") updateMediaFields();
  const formId = type === "experts" ? "expertForm" : type === "stories" ? "storyForm" : "mediaForm";
  $(formId).scrollIntoView({ behavior: "smooth", block: "center" });
}

document.addEventListener("click", async event => {
  const edit = event.target.closest("[data-edit-type]");
  if (edit) {
    const item = cache[edit.dataset.editType]?.[edit.dataset.editId];
    if (item) fillForm(edit.dataset.editType, { id: edit.dataset.editId, ...item });
    return;
  }
  const del = event.target.closest("[data-delete-type]");
  if (del) {
    const type = del.dataset.deleteType;
    const id = del.dataset.deleteId;
    if (!confirm("Dit onderdeel definitief verwijderen?")) return;
    try {
      await remove(ref(db, ROOT + "/" + type + "/" + id));
      status(type === "experts" ? "expertStatus" : type === "stories" ? "storyStatus" : "mediaStatus", "Onderdeel verwijderd.");
    } catch (error) {
      console.error(error);
      status(type === "experts" ? "expertStatus" : type === "stories" ? "storyStatus" : "mediaStatus", "Verwijderen is niet gelukt.", true);
    }
  }
});

document.querySelectorAll("[data-reset]").forEach(button => {
  button.addEventListener("click", () => {
    const form = $(button.dataset.reset);
    form.reset();
    const id = form.querySelector('input[type="hidden"]');
    if (id) id.value = "";
    const active = form.querySelector('input[type="checkbox"]');
    if (active) active.checked = true;
  });
});
