import { db, auth } from "./firebase.js";

import {
  ref,
  onValue,
  set,
  remove
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


/* =========================================================
   INSTELLINGEN
   ========================================================= */

const PATH = "evenementenbanner";
const BANNERS_API = "https://api.github.com/repos/hvnovitas-ux/hvnovitas-home/contents/banners?ref=main";
const BANNERS_SITE_PATH = "https://www.hvnovitas.nl/banners/";
const BANNER_VERSION = "20261011-imagepicker";

const $ = id =>
  document.getElementById(id);

let current = {};
let allBanners = {};
let selectedSlot = "base";
let availableBannerImages = [];

const defaultBase = {
  active: true,
  title: "HV Novitas",
  eyebrow: "HANDBALVERENIGING",
  dateText: "",
  timeText: "",
  location: "Hulst",
  link: "",
  imageUrl: "https://www.hvnovitas.nl/banners/kom-handballen-bij-novitas.webp",
  start: "",
  end: ""
};

function isStructured(value) {
  return !!value && ["base", "event1", "event2"].some(
    key => Object.prototype.hasOwnProperty.call(value, key)
  );
}

function getSlotData(slot = selectedSlot) {
  if (slot === "base") {
    const base = allBanners.base || {};
    return {
      ...defaultBase,
      ...base,
      imageUrl: base.imageUrl || defaultBase.imageUrl
    };
  }
  return allBanners[slot] || {};
}

let messageTimer = null;


/* =========================================================
   AUTHENTICATIE
   ========================================================= */

onAuthStateChanged(
  auth,
  user => {

    if (!user) {

      window.location.href =
        "login.html";

      return;
    }

    loadBanner();

  }
);


/* =========================================================
   FIREBASE LADEN
   ========================================================= */

function loadBanner() {

  onValue(
    ref(db, PATH),

    snapshot => {

      const stored = snapshot.val() || {};
      if (isStructured(stored)) {
        allBanners = {
          base: {
            ...defaultBase,
            ...(stored.base || {}),
            imageUrl: (stored.base && stored.base.imageUrl) || defaultBase.imageUrl
          },
          event1: stored.event1 || {},
          event2: stored.event2 || {}
        };
      } else {
        allBanners = {
          base: { ...defaultBase },
          event1: stored,
          event2: {}
        };
      }
      current = getSlotData();
      fillForm();
      renderBannerGallery();

      updatePreview();

      updateStatus();

    },

    error => {

      console.error(
        "Evenementenbanner laden mislukt:",
        error
      );

      message(
        "Laden mislukt.",
        "error"
      );

    }
  );

}


/* =========================================================
   FORMULIER VULLEN
   ========================================================= */

function fillForm() {
  current = getSlotData();
  $("bannerSlot").value = selectedSlot;
  $("scheduleFields").hidden = selectedSlot === "base";

  $("active").checked =
    !!current.active;

  $("title").value =
    current.title || "";

  $("eyebrow").value =
    current.eyebrow || "";

  $("dateText").value =
    current.dateText || "";

  $("timeText").value =
    current.timeText || "";

  $("location").value =
    current.location || "";

  $("link").value =
    current.link || "";

  $("imageUrl").value =
    current.imageUrl || (selectedSlot === "base" ? defaultBase.imageUrl : "");

  renderBannerGallery();

  $("start").value =
    toDateTimeLocal(
      current.start
    );

  $("end").value =
    toDateTimeLocal(
      current.end
    );

}


/* =========================================================
   DATUM
   ========================================================= */

function toDateTimeLocal(value) {

  if (!value) {
    return "";
  }

  const stringValue =
    String(value);

  if (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/
      .test(stringValue)
  ) {

    return stringValue;

  }

  const date =
    new Date(
      stringValue
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "";

  }

  const pad =
    number =>
      String(number)
        .padStart(2, "0");

  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes())
  );

}


/* =========================================================
   FORMULIER UITLEZEN
   ========================================================= */

function readForm() {

  return {

    active:
      $("active").checked,

    title:
      $("title").value.trim(),

    eyebrow:
      $("eyebrow").value.trim(),

    dateText:
      $("dateText").value.trim(),

    timeText:
      $("timeText").value.trim(),

    location:
      $("location").value.trim(),

    link:
      $("link").value.trim(),

    imageUrl:
      $("imageUrl").value.trim(),

    start:
      $("start").value,

    end:
      $("end").value

  };

}


/* =========================================================
   LIVE PREVIEW
   ========================================================= */

$("bannerSlot")?.addEventListener("change", () => {
  selectedSlot = $("bannerSlot").value;
  fillForm();
  updatePreview();
  updateStatus();
  const frame = $("previewFrame");
  refreshFramePreview();
});

[
  "active",
  "title",
  "eyebrow",
  "dateText",
  "timeText",
  "location",
  "link",
  "start",
  "end"
]
.forEach(
  id => {

    const element =
      $(id);

    if (!element) {
      return;
    }

    element.addEventListener(
      "input",
      updatePreview
    );

    element.addEventListener(
      "change",
      updatePreview
    );

  }
);


/* =========================================================
   OPSLAAN
   ========================================================= */

$("eventForm")
  ?.addEventListener(
    "submit",
    async event => {

      event.preventDefault();

      const data =
        readForm();


      if (!data.title) {

        message(
          "Vul een titel in.",
          "error"
        );

        return;

      }


      if (
        selectedSlot !== "base" &&
        (!data.start || !data.end)
      ) {

        message(
          "Vul de zichtbaarheidperiode in.",
          "error"
        );

        return;

      }


      const startDate = data.start ? new Date(data.start) : null;
      const endDate = data.end ? new Date(data.end) : null;

      if (
        selectedSlot !== "base" &&
        (!startDate || !endDate ||
          Number.isNaN(startDate.getTime()) ||
          Number.isNaN(endDate.getTime()))
      ) {

        message(
          "Controleer de datum en tijd.",
          "error"
        );

        return;

      }


      if (
        selectedSlot !== "base" &&
        endDate <= startDate
      ) {

        message(
          "De eindtijd moet na de begintijd liggen.",
          "error"
        );

        return;

      }


      if (
        data.imageUrl &&
        !/^https?:\/\//i.test(data.imageUrl)
      ) {
        message(
          "De geselecteerde afbeeldingslink is ongeldig.",
          "error"
        );
        return;
      }


      if (
        data.link &&
        !/^https?:\/\//i.test(
          data.link
        )
      ) {

        message(
          "De link moet beginnen met http:// of https://.",
          "error"
        );

        return;

      }


      try {

        allBanners = {
          ...allBanners,
          [selectedSlot]: { ...data, updatedAt: Date.now() }
        };
        await set(ref(db, PATH), allBanners);
        current = allBanners[selectedSlot];

        refreshFramePreview();

        message(
          "Evenementenbanner opgeslagen.",
          "success"
        );


      } catch (error) {

        console.error(
          "Opslaan mislukt:",
          error
        );

        message(
          "Opslaan mislukt. Controleer Firebase-rechten.",
          "error"
        );

      }

    }
  );


/* =========================================================
   VOORBEELD
   ========================================================= */

$("previewBtn")
  ?.addEventListener(
    "click",
    () => {

      $("previewPanel")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

      updatePreview();

    }
  );


/* =========================================================
   LEEGMAKEN
   ========================================================= */

$("clearBtn")
  ?.addEventListener(
    "click",
    async () => {

      const confirmed =
        window.confirm(
          "Wil je de bannergegevens verwijderen?"
        );


      if (!confirmed) {
        return;
      }


      try {

        if (selectedSlot === "base") {
          allBanners.base = { ...defaultBase };
        } else {
          allBanners[selectedSlot] = {};
        }
        await set(ref(db, PATH), allBanners);
        current = getSlotData();
        fillForm();
        updatePreview();
        updateStatus();


        message(
          "Banner leeggemaakt.",
          "success"
        );


      } catch (error) {

        console.error(
          "Verwijderen mislukt:",
          error
        );

        message(
          "Verwijderen mislukt.",
          "error"
        );

      }

    }
  );


/* =========================================================
   STATUS
   ========================================================= */

function updateStatus() {

  const element =
    $("status");


  if (!element) {
    return;
  }


  const now =
    Date.now();


  const start =
    current.start
      ? new Date(
          current.start
        ).getTime()
      : 0;


  const end =
    current.end
      ? new Date(
          current.end
        ).getTime()
      : 0;


  element.className =
    "pill";


  if (selectedSlot === "base") {
    element.textContent = "Basisbanner als reserve";
    element.className = "pill";
    return;
  }

  if (!current.active) {

    element.textContent =
      "Uitgeschakeld";

    element.classList.add(
      "neutral"
    );

    return;

  }


  if (!start || !end) {

    element.textContent =
      "Nog niet gepland";

    element.classList.add(
      "neutral"
    );

    return;

  }


  if (now < start) {

    element.textContent =
      "Ingepland";

    element.classList.add(
      "neutral"
    );

    return;

  }


  if (now <= end) {

    element.textContent =
      "Actief volgens planning";

    return;

  }


  element.textContent =
    "Periode verstreken";

  element.classList.add(
    "neutral"
  );

}


/* =========================================================
   PREVIEW
   ========================================================= */

function updatePreview() {
  const root = $("previewRoot");
  const data = readForm();

  if (!root) return;
  root.replaceChildren();
  renderBanner(root, data, false);
}

function refreshFramePreview() {
  const frame = $("previewFrame");
  if (!frame) return;

  const url = new URL("evenementenbanner-widget.html", window.location.href);
  url.searchParams.set("preview", "1");
  url.searchParams.set("slot", selectedSlot);
  url.searchParams.set("v", BANNER_VERSION);
  // Een lege waarde overschrijft ook tijdelijk een eerder opgeslagen afbeelding.
  url.searchParams.set("imagePreview", $("imageUrl")?.value.trim() || "");
  frame.src = url.toString();
}

const imageExtensions = /\.(?:png|jpe?g|webp|gif|avif)$/i;

async function loadBannerImages() {
  const gallery = $("bannerImageGallery");
  if (!gallery) return;

  try {
    const response = await fetch(BANNERS_API, {
      headers: { Accept: "application/vnd.github+json" }
    });
    if (!response.ok) throw new Error("GitHub gaf status " + response.status);
    const contents = await response.json();

    availableBannerImages = contents
      .filter(item => item.type === "file" && imageExtensions.test(item.name))
      .map(item => ({
        name: item.name,
        sha: item.sha || "",
        url: BANNERS_SITE_PATH + encodeURIComponent(item.name) +
          (item.sha ? "?v=" + item.sha.slice(0, 8) : "")
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "nl"));

    renderBannerGallery();
  } catch (error) {
    console.error("Bannerafbeeldingen laden mislukt:", error);
    gallery.replaceChildren();
    const errorBox = document.createElement("div");
    errorBox.className = "banner-image-message";
    errorBox.textContent = "De map banners kon niet automatisch worden ingelezen. Controleer of de afbeeldingen in hvnovitas-home/banners staan en laad deze pagina opnieuw.";
    gallery.append(errorBox);
    const label = $("imageSelectedLabel");
    if (label) label.textContent = "Afbeeldingenlijst niet beschikbaar.";
  }
}

function renderBannerGallery() {
  const gallery = $("bannerImageGallery");
  if (!gallery) return;
  gallery.replaceChildren();

  if (!availableBannerImages.length) {
    const empty = document.createElement("div");
    empty.className = "banner-image-message";
    empty.textContent = "Nog geen afbeeldingen gevonden. Plaats een JPG-, PNG- of WebP-bestand in de map banners en laad deze pagina opnieuw.";
    gallery.append(empty);
    return;
  }

  const selectedUrl = $("imageUrl")?.value.trim() || "";
  let selectedName = "";

  availableBannerImages.forEach(item => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "banner-image-option";
    const selected = selectedUrl.includes("/banners/" + item.name);
    if (selected) {
      button.classList.add("selected");
      selectedName = item.name;
    }
    button.setAttribute("aria-pressed", String(selected));
    button.setAttribute("aria-label", "Selecteer banner " + item.name);

    const image = document.createElement("img");
    image.src = item.url;
    image.alt = item.name;
    image.loading = "lazy";

    const caption = document.createElement("span");
    caption.textContent = item.name;
    button.append(image, caption);

    button.addEventListener("click", () => {
      $("imageUrl").value = item.url;
      renderBannerGallery();
      updatePreview();
      refreshFramePreview();
    });

    gallery.append(button);
  });

  const label = $("imageSelectedLabel");
  if (label) {
    label.textContent = selectedName
      ? "Geselecteerd: " + selectedName
      : "Klik op een afbeelding om deze voor deze banner te kiezen.";
  }
}

loadBannerImages();


/* =========================================================
   BANNER RENDERER
   ========================================================= */

function renderBanner(
  root,
  data,
  clickable
) {

  const banner =
    createElement(
      "section",
      "event-banner"
    );


  /* =======================================================
     ART
     ======================================================= */

  const art =
    createElement(
      "div",
      "art"
    );

  art.setAttribute(
    "aria-hidden",
    "true"
  );


  /* MUZIEKNOTEN */

  const musicItems = [

    ["music one", "♪"],

    ["music two", "♫"],

    ["music three", "♪"],

    ["music four", "♫"]

  ];


  musicItems.forEach(
    ([className, text]) => {

      art.append(
        createElement(
          "span",
          className,
          text
        )
      );

    }
  );


  /* BINGO KAARTEN */

  art.append(
    createElement(
      "span",
      "bingo-card card-left"
    )
  );


  art.append(
    createElement(
      "span",
      "bingo-card card-right"
    )
  );


  /* BINGO BALLEN */

  const balls = [

    ["ball ball-left-one", "5"],

    ["ball ball-left-two", "17"],

    ["ball ball-right-one", "28"],

    ["ball ball-right-two", "11"]

  ];


  balls.forEach(
    ([className, text]) => {

      art.append(
        createElement(
          "span",
          className,
          text
        )
      );

    }
  );


  banner.append(
    art
  );


  /* =======================================================
     CONTENT
     ======================================================= */

  const content =
    createElement(
      "div",
      "content"
    );


  /* EYEBROW */

  const eyebrow =
    createElement(
      "div",
      "eyebrow",
      data.eyebrow ||
      "HV NOVITAS PRESENTEERT"
    );


  /* TITEL */

  const title =
    createElement(
      "div",
      "title"
    );


  const words =
    String(
      data.title ||
      "EVENEMENT"
    )
      .trim()
      .split(/\s+/)
      .filter(Boolean);


  if (
    words.length > 1
  ) {

    const contentText =
      words
        .slice(0, -1)
        .join(" ") +
      " ";

    title.append(
      document.createTextNode(
        contentText
      )
    );

  }


  const strong =
    createElement(
      "strong",
      "",
      words[
        words.length - 1
      ]
    );


  title.append(
    strong
  );


  /* LIJN */

  const rule =
    createElement(
      "div",
      "rule"
    );


  /* DETAILS */

  const details =
    createElement(
      "div",
      "details"
    );


  const values = [

    data.dateText,

    data.timeText,

    data.location

  ]
    .filter(Boolean);


  values.forEach(
    (
      value,
      index
    ) => {

      if (index > 0) {

        details.append(
          createElement(
            "i",
            "",
            "•"
          )
        );

      }


      details.append(
        createElement(
          "span",
          "",
          value
        )
      );

    }
  );


  content.append(
    eyebrow,
    title,
    rule,
    details
  );


  banner.append(
    content
  );


  /* =======================================================
     KLIKBAAR
     ======================================================= */

  if (
    clickable &&
    data.link
  ) {

    const link =
      createElement(
        "a",
        "event-link"
      );


    link.href =
      data.link;


    link.target =
      "_blank";


    link.rel =
      "noopener";


    link.setAttribute(
      "aria-label",
      data.title ||
      "Evenement"
    );


    link.append(
      banner
    );


    root.append(
      link
    );

  } else {

    root.append(
      banner
    );

  }

}


/* =========================================================
   ELEMENT HELPER
   ========================================================= */

function createElement(
  tag,
  className,
  text = ""
) {

  const element =
    document.createElement(
      tag
    );


  if (className) {

    element.className =
      className;

  }


  if (text) {

    element.textContent =
      text;

  }


  return element;

}


/* =========================================================
   MELDING
   ========================================================= */

function message(
  text,
  type = ""
) {

  const element =
    $("message");


  if (!element) {
    return;
  }


  clearTimeout(
    messageTimer
  );


  element.textContent =
    text;


  element.className =
    "message show " +
    type;


  messageTimer =
    setTimeout(
      () => {

        element.className =
          "message";

      },
      4000
    );

}
