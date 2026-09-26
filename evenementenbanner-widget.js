import { db } from "./firebase.js";

import {
  ref,
  onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";


const root = document.getElementById("eventRoot");

let data = null;


/* =========================================================
   FIREBASE
   ========================================================= */

onValue(
  ref(db, "evenementenbanner"),

  snap => {
    data = snap.val() || null;

    render();
  },

  err => {
    console.error(err);

    root.hidden = true;

    root.replaceChildren();
  }
);


/* =========================================================
   ELEMENT HELPER
   ========================================================= */

function createElement(
  tag,
  className,
  text = ""
) {
  const el = document.createElement(tag);

  if (className) {
    el.className = className;
  }

  if (text) {
    el.textContent = text;
  }

  return el;
}


/* =========================================================
   BANNER RENDER
   ========================================================= */

function render() {

  if (
    !data ||
    !data.active ||
    !data.title ||
    !data.start ||
    !data.end ||
    Date.now() < new Date(data.start).getTime() ||
    Date.now() > new Date(data.end).getTime()
  ) {

    root.hidden = true;

    root.replaceChildren();

    return;
  }


  /* =======================================================
     BANNER
     ======================================================= */

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


  /* Muzieknoten */

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


  /* Bingo kaarten */

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


  /* Bingo ballen */

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


  banner.append(art);


  /* =======================================================
     CENTRALE CONTENT
     ======================================================= */

  const content =
    createElement(
      "div",
      "content"
    );


  /* Eyebrow */

  const eyebrow =
    createElement(
      "div",
      "eyebrow",
      data.eyebrow ||
      "HV NOVITAS PRESENTEERT"
    );


  /* Titel */

  const title =
    createElement(
      "div",
      "title"
    );


  const words =
    String(data.title)
      .trim()
      .split(/\s+/)
      .filter(Boolean);


  if (words.length > 1) {

    const normalText =
      document.createTextNode(
        words
          .slice(0, -1)
          .join(" ") + " "
      );

    title.append(normalText);
  }


  const strong =
    createElement(
      "strong",
      "",
      words[words.length - 1]
    );


  title.append(strong);


  /* Scheidingslijn */

  const rule =
    createElement(
      "div",
      "rule"
    );


  /* Details */

  const details =
    createElement(
      "div",
      "details"
    );


  const detailValues = [
    data.dateText,
    data.timeText,
    data.location
  ]
    .filter(Boolean);


  detailValues.forEach(
    (value, index) => {

      if (index > 0) {

        const dot =
          createElement(
            "i",
            "",
            "•"
          );

        details.append(dot);
      }


      const span =
        createElement(
          "span",
          "",
          value
        );

      details.append(span);

    }
  );


  /* Content vullen */

  content.append(
    eyebrow,
    title,
    rule,
    details
  );


  banner.append(content);


  /* =======================================================
     LINK
     ======================================================= */

  if (data.link) {

    const link =
      createElement(
        "a",
        "event-link"
      );

    link.href = data.link;

    link.setAttribute(
      "aria-label",
      data.title
    );

    link.append(banner);

    root.append(link);

  } else {

    root.append(banner);

  }


  root.hidden = false;
}
