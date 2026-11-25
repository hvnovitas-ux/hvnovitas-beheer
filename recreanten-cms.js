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

onValue(ref(db, ROOT + "/settings"), snapshot => {
  const settings = snapshot.val() || {};
  const form = $("settingsForm");
  Array.from(form.elements).forEach(field => {
    if (field.name && Object.prototype.hasOwnProperty.call(settings, field.name)) {
      field.value = settings[field.name] ?? "";
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
