import { db } from "./firebase.js";

import {
  ref,
  onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";


/* =========================================================
   ELEMENT
   ========================================================= */

const root =
  document.getElementById(
    "eventRoot"
  );


/* =========================================================
   PREVIEW MODUS
   ========================================================= */

const isPreview =
  new URLSearchParams(
    window.location.search
  ).get("preview") === "1";


/* =========================================================
   DATA
   ========================================================= */

let data = null;


/* =========================================================
   FIREBASE
   ========================================================= */

onValue(

  ref(
    db,
    "evenementenbanner"
  ),

  snap => {

    data =
      snap.val() || null;

    render();

  },

  error => {

    console.error(
      "Evenementenbanner laden mislukt:",
      error
    );

    root.hidden =
      true;

    root.replaceChildren();

  }

);


/* =========================================================
   ELEMENT HELPER
   ========================================================= */

function createElement(
  tag,
  className = "",
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


  if (text !== "") {

    element.textContent =
      text;

  }


  return element;

}


/* =========================================================
   BANNER RENDER
   ========================================================= */

function render() {


  /* -------------------------------------------------------
     CONTROLE NORMALE WEBSITE
     ------------------------------------------------------- */

  if (
    !isPreview &&
    (
      !data ||
      !data.active ||
      !data.title ||
      !data.start ||
      !data.end ||
      Date.now() <
        new Date(
          data.start
        ).getTime() ||
      Date.now() >
        new Date(
          data.end
        ).getTime()
    )
  ) {

    root.hidden =
      true;

    root.replaceChildren();

    return;

  }


  /* -------------------------------------------------------
     CONTROLE PREVIEW
     ------------------------------------------------------- */

  if (
    isPreview &&
    (
      !data ||
      !data.title
    )
  ) {

    root.hidden =
      true;

    root.replaceChildren();

    return;

  }


  /* =======================================================
     HOOFDBANNER
     ======================================================= */

  const banner =
    createElement(
      "section",
      "event-banner"
    );


  /* =======================================================
     DECORATIE
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


  /* =======================================================
     DISCOBAL
     ======================================================= */

  const discoBallWrap =
    createElement(
      "span",
      "disco-ball-wrap"
    );


  const discoBall =
    createElement(
      "span",
      "disco-ball"
    );


  art.append(
    discoBallWrap,
    discoBall
  );


  /* =======================================================
     MUZIEKNOTEN
     ======================================================= */

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


  /* =======================================================
     BINGO KAARTEN
     ======================================================= */

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


  /* =======================================================
     BINGO BALLEN
     ======================================================= */

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
     CENTRALE INHOUD
     ======================================================= */

  const content =
    createElement(
      "div",
      "content"
    );


  /* =======================================================
     BOVENREGEL
     ======================================================= */

  const eyebrow =
    createElement(
      "div",
      "eyebrow",
      data.eyebrow ||
      "HV NOVITAS PRESENTEERT"
    );


  /* =======================================================
     TITEL
     ======================================================= */

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

    const normalText =
      document.createTextNode(

        words
          .slice(
            0,
            -1
          )
          .join(
            " "
          ) +
        " "

      );


    title.append(
      normalText
    );

  }


  const lastWord =
    words.length > 0
      ? words[
          words.length - 1
        ]
      : "EVENEMENT";


  const strong =
    createElement(
      "strong",
      "",
      lastWord
    );


  title.append(
    strong
  );


  /* =======================================================
     SCHEIDINGSLIJN
     ======================================================= */

  const rule =
    createElement(
      "div",
      "rule"
    );


  /* =======================================================
     DETAILS
     ======================================================= */

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
    .filter(
      value =>
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
    );


  detailValues.forEach(
    (
      value,
      index
    ) => {

      if (
        index > 0
      ) {

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
          String(value)
        )
      );

    }
  );


  /* =======================================================
     CONTENT OPBOUWEN
     ======================================================= */

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
    data.link &&
    /^https?:\/\//i.test(
      String(
        data.link
      )
    )
  ) {

    const link =
      createElement(
        "a",
        "event-link"
      );


    link.href =
      data.link;


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


  /* =======================================================
     ZICHTBAAR
     ======================================================= */

  root.hidden =
    false;

}
