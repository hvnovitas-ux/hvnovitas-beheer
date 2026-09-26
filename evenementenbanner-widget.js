import { db } from "./firebase.js";
import {
  ref,
  onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const root = document.getElementById("eventRoot");
let data = null;

onValue(ref(db, "evenementenbanner"), snap => {
  data = snap.val() || null;
  render();
}, err => {
  console.error(err);
  root.hidden = true;
});

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

  const banner = document.createElement("section");
  banner.className = "event-banner";

  const art = document.createElement("div");
  art.className = "art";
  art.setAttribute("aria-hidden", "true");

  for (const [cls, txt] of [
    ["music one", "♪"],
    ["music two", "♫"],
    ["ball left", "5"],
    ["ball right", "17"]
  ]) {
    const el = document.createElement("span");
    el.className = cls;
    el.textContent = txt;
    art.append(el);
  }

  banner.append(art);

  const content = document.createElement("div");
  content.className = "content";

  const eyebrow = document.createElement("div");
  eyebrow.className = "eyebrow";
  eyebrow.textContent =
    data.eyebrow || "HV NOVITAS PRESENTEERT";

  const title = document.createElement("div");
  title.className = "title";

  const words = String(data.title).split(/\s+/);

  if (words.length > 1) {
    title.append(
      document.createTextNode(words.slice(0, -1).join(" ") + " ")
    );
  }

  const strong = document.createElement("strong");
  strong.textContent = words[words.length - 1];
  title.append(strong);

  const rule = document.createElement("div");
  rule.className = "rule";

  const details = document.createElement("div");
  details.className = "details";

  [data.dateText, data.timeText, data.location]
    .filter(Boolean)
    .forEach((v, i) => {
      if (i) {
        const dot = document.createElement("i");
        dot.textContent = "•";
        details.append(dot);
      }

      const span = document.createElement("span");
      span.textContent = v;
      details.append(span);
    });

  content.append(eyebrow, title, rule, details);
  banner.append(content);

  if (data.link) {
    const a = document.createElement("a");
    a.className = "event-link";
    a.href = data.link;
    a.setAttribute("aria-label", data.title);
    a.append(banner);
    root.append(a);
  } else {
    root.append(banner);
  }

  root.hidden = false;
}
