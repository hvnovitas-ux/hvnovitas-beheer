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


const $ = id =>
  document.getElementById(id);


let current = {};

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

      current =
        snapshot.val() || {};


      fillForm();

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

  const active =
    $("active");

  const title =
    $("title");

  const eyebrow =
    $("eyebrow");

  const dateText =
    $("dateText");

  const timeText =
    $("timeText");

  const location =
    $("location");

  const link =
    $("link");

  const start =
    $("start");

  const end =
    $("end");


  if (active) {

    active.checked =
      !!current.active;

  }


  if (title) {

    title.value =
      current.title || "";

  }


  if (eyebrow) {

    eyebrow.value =
      current.eyebrow || "";

  }


  if (dateText) {

    dateText.value =
      current.dateText || "";

  }


  if (timeText) {

    timeText.value =
      current.timeText || "";

  }


  if (location) {

    location.value =
      current.location || "";

  }


  if (link) {

    link.value =
      current.link || "";

  }


  if (start) {

    start.value =
      toDateTimeLocal(
        current.start
      );

  }


  if (end) {

    end.value =
      toDateTimeLocal(
        current.end
      );

  }

}


/* =========================================================
   DATUM VOOR INPUT
   ========================================================= */

function toDateTimeLocal(value) {

  if (!value) {

    return "";

  }


  const stringValue =
    String(value);


  /*
   * Wanneer het al exact het formaat
   * YYYY-MM-DDTHH:MM heeft.
   */

  if (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/
      .test(stringValue)
  ) {

    return stringValue;

  }


  /*
   * ISO-datum met timezone.
   */

  const date =
    new Date(stringValue);


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

    start:
      $("start").value,

    end:
      $("end").value

  };

}


/* =========================================================
   INPUT EVENTS
   ========================================================= */

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
        !data.start ||
        !data.end
      ) {

        message(
          "Vul de zichtbaarheidperiode in.",
          "error"
        );

        return;

      }


      const startDate =
        new Date(data.start);

      const endDate =
        new Date(data.end);


      if (
        Number.isNaN(
          startDate.getTime()
        ) ||
        Number.isNaN(
          endDate.getTime()
        )
      ) {

        message(
          "Controleer de datum en tijd.",
          "error"
        );

        return;

      }


      if (
        endDate <= startDate
      ) {

        message(
          "De eindtijd moet na de begintijd liggen.",
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

        await set(
          ref(
            db,
            PATH
          ),

          {
            ...data,

            updatedAt:
              Date.now()
          }
        );


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
   PREVIEW KNOP
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

        await remove(
          ref(
            db,
            PATH
          )
        );


        $("eventForm")
          ?.reset();


        updatePreview();


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

  const root =
    $("previewRoot");


  if (!root) {
    return;
  }


  const data =
    readForm();


  root.replaceChildren();


  renderBanner(
    root,
    data,
    false
  );

}


/* =========================================================
   BANNER RENDERER
   DEZELFDE OPBOUW ALS WEBSITE
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

    [
      "music one",
      "♪"
    ],

    [
      "music two",
      "♫"
    ],

    [
      "music three",
      "♪"
    ],

    [
      "music four",
      "♫"
    ]

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


  /* BINGO-KAARTEN */

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

    [
      "ball ball-left-one",
      "5"
    ],

    [
      "ball ball-left-two",
      "17"
    ],

    [
      "ball ball-right-one",
      "28"
    ],

    [
      "ball ball-right-two",
      "11"
    ]

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

    contentText =
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
     KLIKBAAR MAKEN
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
