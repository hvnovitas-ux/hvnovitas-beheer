/* =========================================================
   HV NOVITAS AGENDA WIDGET
   Google Agenda als bron
   Alleen vandaag t/m 14 dagen vooruit
   Alleen dagen waarop iets staat
   ========================================================= */

import ICAL from "https://cdn.jsdelivr.net/npm/ical.js@2.2.1/+esm";


/* =========================================================
   INSTELLINGEN
   ========================================================= */

/*
   Dit wordt de URL van de Cloudflare Worker die
   de openbare Google iCal-feed doorgeeft.

   VOORBEELD:
   https://hvnovitas-agenda-feed.workers.dev
*/

const FEED_URL =
  "https://HV-NOVITAS-AGENDA-FEED.workers.dev";


const DAYS_AHEAD = 14;


/* =========================================================
   ELEMENTEN
   ========================================================= */

const agendaList =
  document.getElementById(
    "agendaList"
  );


const agendaStatus =
  document.getElementById(
    "agendaStatus"
  );


/* =========================================================
   START
   ========================================================= */

loadAgenda();


/* =========================================================
   AGENDA LADEN
   ========================================================= */

async function loadAgenda() {

  setStatus(
    "Agenda laden..."
  );


  try {

    const response =
      await fetch(
        `${FEED_URL}?v=${Date.now()}`,
        {
          method: "GET",
          cache: "no-store"
        }
      );


    if (!response.ok) {

      throw new Error(
        `Agenda-feed gaf HTTP ${response.status}.`
      );

    }


    const icsText =
      await response.text();


    if (
      !icsText ||
      !icsText.includes(
        "BEGIN:VCALENDAR"
      )
    ) {

      throw new Error(
        "De ontvangen agenda-feed is geen geldige iCal-feed."
      );

    }


    const events =
      parseCalendar(
        icsText
      );


    renderAgenda(
      events
    );


  } catch (error) {

    console.error(
      "Agenda laden mislukt:",
      error
    );


    renderError(
      "De agenda kon momenteel niet worden geladen."
    );

  }

}


/* =========================================================
   ICS PARSEN
   ========================================================= */

function parseCalendar(
  icsText
) {

  const jcal =
    ICAL.parse(
      icsText
    );


  const calendar =
    new ICAL.Component(
      jcal
    );


  const components =
    calendar.getAllSubcomponents(
      "vevent"
    );


  const rangeStart =
    new Date();


  rangeStart.setHours(
    0,
    0,
    0,
    0
  );


  const rangeEnd =
    new Date(
      rangeStart
    );


  rangeEnd.setDate(
    rangeEnd.getDate() +
    DAYS_AHEAD
  );


  const results = [];


  components.forEach(
    component => {

      try {

        const event =
          new ICAL.Event(
            component
          );


        if (
          !event.startDate
        ) {

          return;

        }


        if (
          event.isRecurring()
        ) {

          expandRecurringEvent(
            event,
            rangeStart,
            rangeEnd,
            results
          );

        } else {

          addSingleEvent(
            event,
            event.startDate,
            event.endDate,
            rangeStart,
            rangeEnd,
            results
          );

        }

      } catch (error) {

        console.warn(
          "Agenda-item kon niet worden verwerkt:",
          error
        );

      }

    }
  );


  return results;

}


/* =========================================================
   TERUGKERENDE ACTIVITEIT
   ========================================================= */

function expandRecurringEvent(
  event,
  rangeStart,
  rangeEnd,
  results
) {

  const iterator =
    event.iterator();


  let count =
    0;


  const MAX_INSTANCES =
    500;


  while (
    count <
    MAX_INSTANCES
  ) {

    const occurrence =
      iterator.next();


    if (!occurrence) {

      break;

    }


    const startDate =
      occurrence.toJSDate();


    if (
      startDate >
      rangeEnd
    ) {

      break;

    }


    if (
      startDate >=
      rangeStart
    ) {

      try {

        const details =
          event.getOccurrenceDetails(
            occurrence
          );


        addSingleEvent(
          event,
          details.startDate,
          details.endDate,
          rangeStart,
          rangeEnd,
          results
        );

      } catch (error) {

        console.warn(
          "Terugkerende gebeurtenis kon niet worden toegevoegd:",
          error
        );

      }

    }


    count++;

  }

}


/* =========================================================
   ENKELE ACTIVITEIT
   ========================================================= */

function addSingleEvent(
  event,
  startValue,
  endValue,
  rangeStart,
  rangeEnd,
  results
) {

  if (!startValue) {

    return;

  }


  const startDate =
    startValue.toJSDate();


  const endDate =
    endValue
      ? endValue.toJSDate()
      : new Date(
          startDate.getTime()
        );


  if (
    endDate <
    rangeStart
  ) {

    return;

  }


  if (
    startDate >
    rangeEnd
  ) {

    return;

  }


  const summary =
    cleanText(
      event.summary ||
      "Activiteit"
    );


  const location =
    cleanText(
      event.location ||
      ""
    );


  results.push({

    id:
      event.uid ||
      `${startDate.getTime()}-${summary}`,

    start:
      startDate,

    end:
      endDate,

    summary,

    location,

    allDay:
      Boolean(
        startValue.isDate
      )

  });

}


/* =========================================================
   TEKST OPSCHONEN
   ========================================================= */

function cleanText(
  value
) {

  return String(
    value || ""
  )
    .replace(
      /\\,/g,
      ","
    )
    .replace(
      /\\;/g,
      ";"
    )
    .replace(
      /\\n/g,
      " "
    )
    .replace(
      /\\\\/g,
      "\\"
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();

}


/* =========================================================
   DUBBELE ITEMS VERWIJDEREN
   ========================================================= */

function uniqueEvents(
  events
) {

  const seen =
    new Set();


  return events.filter(
    event => {

      const key =
        [
          event.id,
          event.start.getTime(),
          event.end.getTime()
        ]
          .join(
            "|"
          );


      if (
        seen.has(key)
      ) {

        return false;

      }


      seen.add(key);

      return true;

    }
  );

}


/* =========================================================
   AGENDA RENDEREN
   ========================================================= */

function renderAgenda(
  sourceEvents
) {

  const events =
    uniqueEvents(
      sourceEvents
    );


  events.sort(
    (a, b) =>
      a.start.getTime() -
      b.start.getTime()
  );


  agendaList.replaceChildren();


  if (
    events.length === 0
  ) {

    setStatus(
      "Geen activiteiten in de komende 14 dagen."
    );


    renderEmpty();

    return;

  }


  const grouped =
    groupByDate(
      events
    );


  setStatus(
    ""
  );


  agendaStatus.hidden =
    true;


  Object.entries(
    grouped
  ).forEach(
    ([dateKey, dayEvents]) => {

      agendaList.append(
        createDayCard(
          dateKey,
          dayEvents
        )
      );

    }
  );

}


/* =========================================================
   GROEPEREN PER DAG
   ========================================================= */

function groupByDate(
  events
) {

  const grouped = {};


  events.forEach(
    event => {

      const key =
        dateKey(
          event.start
        );


      if (
        !grouped[key]
      ) {

        grouped[key] =
          [];

      }


      grouped[key].push(
        event
      );

    }
  );


  return grouped;

}


/* =========================================================
   DATUMSLEUTEL
   ========================================================= */

function dateKey(
  date
) {

  const year =
    date.getFullYear();


  const month =
    String(
      date.getMonth() + 1
    )
      .padStart(
        2,
        "0"
      );


  const day =
    String(
      date.getDate()
    )
      .padStart(
        2,
        "0"
      );


  return `${year}-${month}-${day}`;

}


/* =========================================================
   DAGKAART
   ========================================================= */

function createDayCard(
  dateKeyValue,
  events
) {

  const date =
    parseDateKey(
      dateKeyValue
    );


  const article =
    document.createElement(
      "article"
    );


  article.className =
    "agenda-day";


  /* =======================================================
     DATUM
     ======================================================= */

  const dateElement =
    document.createElement(
      "div"
    );


  dateElement.className =
    "agenda-date";


  const dayNumber =
    document.createElement(
      "div"
    );


  dayNumber.className =
    "agenda-day-number";


  dayNumber.textContent =
    String(
      date.getDate()
    );


  const month =
    document.createElement(
      "div"
    );


  month.className =
    "agenda-month";


  month.textContent =
    new Intl.DateTimeFormat(
      "nl-NL",
      {
        month:
          "short"
      }
    )
      .format(
        date
      )
      .replace(
        ".",
        ""
      )
      .toUpperCase();


  const weekday =
    document.createElement(
      "div"
    );


  weekday.className =
    "agenda-weekday";


  weekday.textContent =
    new Intl.DateTimeFormat(
      "nl-NL",
      {
        weekday:
          "short"
      }
    )
      .format(
        date
      )
      .replace(
        ".",
        ""
      )
      .toUpperCase();


  dateElement.append(
    dayNumber,
    month,
    weekday
  );


  /* =======================================================
     EVENTS
     ======================================================= */

  const eventList =
    document.createElement(
      "div"
    );


  eventList.className =
    "agenda-events";


  events.forEach(
    event => {

      eventList.append(
        createEventRow(
          event
        )
      );

    }
  );


  article.append(
    dateElement,
    eventList
  );


  return article;

}


/* =========================================================
   EVENT RIJ
   ========================================================= */

function createEventRow(
  event
) {

  const row =
    document.createElement(
      "div"
    );


  row.className =
    "agenda-event " +
    (
      isTraining(
        event.summary
      )
        ? "training"
        : "match"
    );


  /* PUNT */

  const dot =
    document.createElement(
      "span"
    );


  dot.className =
    "agenda-dot";


  dot.setAttribute(
    "aria-hidden",
    "true"
  );


  /* TIJD */

  const time =
    document.createElement(
      "div"
    );


  time.className =
    "agenda-time";


  if (
    event.allDay
  ) {

    time.textContent =
      "Hele dag";

  } else {

    time.textContent =
      formatTimeRange(
        event.start,
        event.end
      );

  }


  /* INHOUD */

  const content =
    document.createElement(
      "div"
    );


  content.className =
    "agenda-event-content";


  const title =
    document.createElement(
      "div"
    );


  title.className =
    "agenda-event-title";


  title.textContent =
    event.summary;


  content.append(
    title
  );


  if (
    event.location
  ) {

    const location =
      document.createElement(
        "div"
      );


    location.className =
      "agenda-event-location";


    const icon =
      document.createElement(
        "span"
      );


    icon.className =
      "agenda-location-icon";


    icon.textContent =
      "●";


    const locationText =
      document.createElement(
        "span"
      );


    locationText.textContent =
      event.location;


    location.append(
      icon,
      locationText
    );


    content.append(
      location
    );

  }


  row.append(
    dot,
    time,
    content
  );


  return row;

}


/* =========================================================
   TRAINING HERKENNEN
   ========================================================= */

function isTraining(
  title
) {

  const text =
    String(
      title || ""
    )
      .toLowerCase();


  return (
    text.includes(
      "training"
    ) ||
    text.includes(
      "trainen"
    )
  );

}


/* =========================================================
   TIJD OPMAKEN
   ========================================================= */

function formatTimeRange(
  start,
  end
) {

  const startText =
    formatTime(
      start
    );


  const endText =
    formatTime(
      end
    );


  if (
    !end ||
    startText === endText
  ) {

    return startText;

  }


  return `${startText} – ${endText}`;

}


/* =========================================================
   TIJD
   ========================================================= */

function formatTime(
  date
) {

  return new Intl.DateTimeFormat(
    "nl-NL",
    {
      hour:
        "2-digit",

      minute:
        "2-digit",

      hour12:
        false
    }
  )
    .format(
      date
    );

}


/* =========================================================
   DATUMSLEUTEL PARSEN
   ========================================================= */

function parseDateKey(
  value
) {

  const [
    year,
    month,
    day
  ] =
    value
      .split("-")
      .map(
        Number
      );


  return new Date(
    year,
    month - 1,
    day
  );

}


/* =========================================================
   STATUS
   ========================================================= */

function setStatus(
  text
) {

  agendaStatus.hidden =
    !text;


  agendaStatus.textContent =
    text;


  agendaStatus.classList.remove(
    "error"
  );

}


/* =========================================================
   LEGE AGENDA
   ========================================================= */

function renderEmpty() {

  const box =
    document.createElement(
      "div"
    );


  box.className =
    "agenda-empty";


  const title =
    document.createElement(
      "strong"
    );


  title.textContent =
    "Geen activiteiten gevonden";


  const text =
    document.createElement(
      "span"
    );


  text.textContent =
    "Er staan de komende 14 dagen geen activiteiten in de Google Agenda.";


  box.append(
    title,
    text
  );


  agendaList.append(
    box
  );

}


/* =========================================================
   FOUT
   ========================================================= */

function renderError(
  message
) {

  agendaStatus.hidden =
    true;


  agendaList.replaceChildren();


  const box =
    document.createElement(
      "div"
    );


  box.className =
    "agenda-error-box";


  box.textContent =
    message;


  agendaList.append(
    box
  );

}
