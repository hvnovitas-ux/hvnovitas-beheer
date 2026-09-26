import { db, auth } from "./firebase.js";
import { ref, onValue, set, remove } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const PATH = "evenementenbanner";
const $ = id => document.getElementById(id);

const ids = [
  "active", "title", "eyebrow", "dateText",
  "timeText", "location", "link", "start", "end"
];

let current = {};
let timer;

onAuthStateChanged(auth, user => {
  if (!user) location.href = "login.html";
});

onValue(ref(db, PATH), snap => {
  current = snap.val() || {};

  for (const id of ids) {
    if (id === "active") {
      $(id).checked = !!current.active;
    } else {
      $(id).value = current[id] || "";
    }
  }

  preview();
  status();
}, err => {
  console.error(err);
  message("Laden mislukt.", "error");
});

ids.forEach(id => $(id).addEventListener("input", preview));

$("eventForm").addEventListener("submit", async e => {
  e.preventDefault();

  const d = read();

  if (!d.title) {
    return message("Vul een titel in.", "error");
  }

  if (
    !d.start ||
    !d.end ||
    new Date(d.end) <= new Date(d.start)
  ) {
    return message("Controleer de zichtbaarheidperiode.", "error");
  }

  if (d.link && !/^https?:\/\//i.test(d.link)) {
    return message(
      "De link moet beginnen met http:// of https://.",
      "error"
    );
  }

  try {
    await set(ref(db, PATH), {
      ...d,
      updatedAt: Date.now()
    });

    message("Evenementenbanner opgeslagen.", "success");
  } catch (err) {
    console.error(err);
    message(
      "Opslaan mislukt. Controleer Firebase-rechten.",
      "error"
    );
  }
});

$("previewBtn").onclick = () => {
  $("preview").scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  preview();
};

$("clearBtn").onclick = async () => {
  if (!confirm("Wil je de bannergegevens verwijderen?")) return;

  try {
    await remove(ref(db, PATH));
    $("eventForm").reset();
    message("Banner leeggemaakt.", "success");
  } catch (e) {
    console.error(e);
    message("Verwijderen mislukt.", "error");
  }
};

function read() {
  return {
    active: $("active").checked,
    title: $("title").value.trim(),
    eyebrow: $("eyebrow").value.trim(),
    dateText: $("dateText").value.trim(),
    timeText: $("timeText").value.trim(),
    location: $("location").value.trim(),
    link: $("link").value.trim(),
    start: $("start").value,
    end: $("end").value
  };
}

function preview() {
  const d = read();

  $("previewEyebrow").textContent =
    d.eyebrow || "HV NOVITAS PRESENTEERT";

  const w = (d.title || "EVENEMENT").split(/\s+/);

  $("previewTitle").replaceChildren(
    document.createTextNode(
      w.slice(0, -1).join(" ") + (w.length > 1 ? " " : "")
    )
  );

  const s = document.createElement("strong");
  s.textContent = w[w.length - 1];
  $("previewTitle").append(s);

  $("previewDate").textContent = d.dateText || "DATUM";
  $("previewTime").textContent = d.timeText || "TIJD";
  $("previewLocation").textContent = d.location || "LOCATIE";
}

function status() {
  const s = $("status");
  const now = Date.now();

  const a = current.start
    ? new Date(current.start).getTime()
    : 0;

  const b = current.end
    ? new Date(current.end).getTime()
    : 0;

  s.textContent = !current.active
    ? "Uitgeschakeld"
    : !a || !b
      ? "Nog niet gepland"
      : now < a
        ? "Ingepland"
        : now <= b
          ? "Actief volgens planning"
          : "Periode verstreken";
}

function message(t, c = "") {
  clearTimeout(timer);

  $("message").textContent = t;
  $("message").className = "message show " + c;

  timer = setTimeout(() => {
    $("message").className = "message";
  }, 4000);
}
