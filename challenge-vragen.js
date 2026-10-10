import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, get, set, push, update, remove, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// Gebruik dezelfde Firebase-database als de challenge, niet de CMS-database.
const challengeConfig = {
  apiKey: "AIzaSyBCUZeWMIxIz__7TfNG_b0V47H_pYFPyQ",
  authDomain: "hv-novitas-handbal-challenge.firebaseapp.com",
  databaseURL: "https://hv-novitas-handbal-challenge-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "hv-novitas-handbal-challenge",
  storageBucket: "hv-novitas-handbal-challenge.firebasestorage.app",
  messagingSenderId: "707710141199",
  appId: "1:707710141199:web:ba304ce4e5f653d0afb47a"
};
const appName = "novitasChallengeQuestionsAdmin";
const app = getApps().find(a => a.name === appName) || initializeApp(challengeConfig, appName);
const db = getDatabase(app);
const QUESTIONS_PATH = "questions";
const SEED_VERSION_PATH = "questionBankVersion";
const CURRENT_SEED_VERSION = 1;
const originalQuestions = [
  {
    "q": "Hoeveel spelers staan er per team in het veld?",
    "a": [
      "5",
      "6",
      "7",
      "8"
    ],
    "c": 2
  },
  {
    "q": "Welke clubkleuren heeft HV Novitas?",
    "a": [
      "Groen - Zwart",
      "Oranje - Wit",
      "Rood - Geel",
      "Oranje - Zwart"
    ],
    "c": 3
  },
  {
    "q": "In welke plaats is HV Novitas gevestigd?",
    "a": [
      "Terneuzen",
      "Goes",
      "Hulst",
      "Middelburg"
    ],
    "c": 2
  },
  {
    "q": "Wie mag als enige de bal van de grond oprapen binnen het 6-metergebied?",
    "a": [
      "Cirkelspeler",
      "Iedere speler",
      "Coach",
      "Keeper"
    ],
    "c": 3
  },
  {
    "q": "Hoeveel stappen mag je zetten zonder te stuiten?",
    "a": [
      "2",
      "3",
      "4",
      "5"
    ],
    "c": 1
  },
  {
    "q": "Waar wordt een 7-meterworp genomen?",
    "a": [
      "6 meter",
      "7 meter",
      "8 meter",
      "9 meter"
    ],
    "c": 1
  },
  {
    "q": "Hoe lang mag je de bal vasthouden zonder te dribbelen of af te spelen?",
    "a": [
      "2 seconden",
      "3 seconden",
      "4 seconden",
      "5 seconden"
    ],
    "c": 1
  },
  {
    "q": "Je krijgt een inworp. Wat is volgens de regels de juiste voetplaatsing?",
    "a": [
      "Beide voeten achter de zijlijn",
      "Eén voet in het speelveld",
      "Minimaal één voet op de zijlijn",
      "Beide voeten op de middenlijn"
    ],
    "c": 2
  },
  {
    "q": "Bij een vrije worp (9-meterworp), mogen medespelers van de aanvallende ploeg al binnen de 9-meterlijn staan voordat de bal is genomen?",
    "a": [
      "Ja, dat mag altijd",
      "Nee, pas nadat de bal de hand van de nemer heeft verlaten",
      "Alleen de cirkelspeler",
      "Alleen zonder fluitsignaal"
    ],
    "c": 1
  },
  {
    "q": "Je onderschept de bal door hem weg te tikken. Daarna pak je de bal met twee handen vast. Hoeveel stappen mag je nog zetten?",
    "a": [
      "2",
      "3",
      "Geen",
      "Onbeperkt"
    ],
    "c": 1
  },
  {
    "q": "Je dribbelt met de bal, pakt hem met twee handen vast en begint daarna opnieuw te dribbelen. Wat beslist de scheidsrechter?",
    "a": [
      "Doorspelen",
      "Vrije worp voor jouw team",
      "Vrije worp voor de tegenpartij",
      "7-meterworp"
    ],
    "c": 2
  },
  {
    "q": "Een verdediger staat met beide voeten in het 6-metergebied zonder de bal te raken. Wat beslist de scheidsrechter?",
    "a": [
      "Niets",
      "Vrije worp voor de verdedigers",
      "Vrije worp voor de aanvallers",
      "7-meterworp"
    ],
    "c": 2
  },
  {
    "q": "De keeper stopt een schot. Daarna rolt de bal terug het doelgebied in. Mag de keeper de bal opnieuw oppakken?",
    "a": [
      "Nee",
      "Ja",
      "Alleen na een fluitsignaal",
      "Alleen met de voet"
    ],
    "c": 1
  },
  {
    "q": "Een verdediger staat in het 6-metergebied. Een aanvaller gooit de bal tegen deze verdediger aan waardoor een duidelijke scoringskans verloren gaat. Wat beslist de scheidsrechter?",
    "a": [
      "Vrije worp voor de verdedigers",
      "Doorspelen",
      "7-meterworp",
      "Hoekworp"
    ],
    "c": 2
  },
  {
    "q": "Een aanvaller vangt de bal terwijl hij met één voet in het 6-metergebied staat. Wat beslist de scheidsrechter?",
    "a": [
      "Doelpunt",
      "Vrije worp voor de aanvallers",
      "Vrije worp voor de verdedigers",
      "Doorspelen"
    ],
    "c": 2
  },
  {
    "q": "Op welke positie speelt Estavana Polman voornamelijk?",
    "a": [
      "Linkerhoek",
      "Keeper",
      "Linkeropbouw",
      "Cirkelloopster"
    ],
    "c": 2
  },
  {
    "q": "In welk jaar is HV Novitas opgericht?",
    "a": [
      "2010",
      "2011",
      "2012",
      "2013"
    ],
    "c": 2
  },
  {
    "q": "Uit welk land komt Győri Audi ETO KC?",
    "a": [
      "Roemenië",
      "Denemarken",
      "Hongarije",
      "Kroatië"
    ],
    "c": 2
  },
  {
    "q": "Hoe vaak zijn de Nederlandse handbaldames wereldkampioen geworden?",
    "a": [
      "Nooit",
      "2 keer",
      "1 keer",
      "3 keer"
    ],
    "c": 2
  },
  {
    "q": "Wat is de officiële slogan van HV Novitas?",
    "a": [
      "Play Hard, Win Together",
      "Orange Power",
      "Together We Score",
      "No Stress, Enjoy!"
    ],
    "c": 3
  },
  {
    "q": "Welke handbalvereniging speelde niet haar thuiswedstrijden in sporthal Den Dullaert?",
    "a": [
      "K.H.V.",
      "HV Hulst",
      "HV Hontenisse",
      "Utopia"
    ],
    "c": 3
  },
  {
    "q": "Wat zijn de standaardafmetingen van een handbalveld?",
    "a": [
      "38 x 18 meter",
      "42 x 22 meter",
      "40 x 20 meter",
      "44 x 22 meter"
    ],
    "c": 2
  },
  {
    "q": "Welke bekende Europese voetbalclub heeft géén handbalafdeling?",
    "a": [
      "PSG",
      "FC Barcelona",
      "Sporting Lissabon",
      "Real Madrid"
    ],
    "c": 3
  },
  {
    "q": "Waarvoor dient het kleine streepje (de 4-meterlijn) in het doelgebied?",
    "a": [
      "Voor de uitworp",
      "Voor een vrije worp",
      "Tot deze lijn mag de keeper naar voren komen bij een 7-meterworp",
      "Voor de aanvallers"
    ],
    "c": 2
  },
  {
    "q": "Met welke balmaat spelen de heren?",
    "a": [
      "Maat 1",
      "Maat 2",
      "Maat 3",
      "Maat 4"
    ],
    "c": 2
  },
  {
    "q": "De keeper schiet de bal met zijn voet vanuit zijn eigen doelgebied rechtstreeks in het doel van de tegenstander. Wat beslist de scheidsrechter?",
    "a": [
      "Doelpunt",
      "Vrije worp voor de tegenpartij",
      "Uitworp",
      "Hoekworp"
    ],
    "c": 0
  },
  {
    "q": "Een aanvaller krijgt de bal aangespeeld en kopt de bal rechtstreeks in het doel. Wat beslist de scheidsrechter?",
    "a": [
      "Vrije worp voor de verdedigende ploeg",
      "Uitworp",
      "Doelpunt",
      "7-meterworp"
    ],
    "c": 2
  },
  {
    "q": "Je krijgt de bal per ongeluk tegen je knie aangespeeld. Wat mag je daarna doen?",
    "a": [
      "Vrije worp voor de tegenpartij",
      "Alleen afspelen",
      "Je mag de bal oppakken en verder spelen",
      "Scheidsrechtersworp"
    ],
    "c": 2
  },
  {
    "q": "Een verdediger blokkeert een schot. De bal gaat via de verdediger rechtstreeks over de eigen achterlijn. Wat beslist de scheidsrechter?",
    "a": [
      "Uitworp",
      "Vrije worp voor de verdedigers",
      "Hoekworp",
      "Scheidsrechtersworp"
    ],
    "c": 2
  },
  {
    "q": "Wat betekent de naam 'Novitas'?",
    "a": [
      "Handbalclub",
      "Overwinning",
      "Oranje kracht",
      "Nieuw begin"
    ],
    "c": 3
  },
  {
    "q": "Een verdediger springt van buiten het 6-metergebied omhoog. In de lucht tikt hij de bal weg naar een medespeler en landt daarna in het doelgebied. Wat beslist de scheidsrechter?",
    "a": [
      "Vrije worp voor de aanvallers",
      "7-meterworp",
      "Doorspelen",
      "Uitworp"
    ],
    "c": 2
  },
  {
    "q": "De keeper staat met één voet in het doelgebied en één voet erbuiten. Mag hij de bal aanraken?",
    "a": [
      "Nee",
      "Ja",
      "Alleen met de voet",
      "Alleen na een fluitsignaal"
    ],
    "c": 0
  },
  {
    "q": "De bal ligt stil in het doelgebied. Hoe lang mag hij daar blijven liggen voordat de scheidsrechter ingrijpt?",
    "a": [
      "3 seconden",
      "5 seconden",
      "10 seconden",
      "Er is geen vaste tijd"
    ],
    "c": 3
  },
  {
    "q": "Een speler gooit de bal uit frustratie bewust tegen de scheidsrechter. Wat beslist de scheidsrechter?",
    "a": [
      "Vrije worp",
      "2 minuten tijdstraf",
      "Rode kaart",
      "Doorspelen"
    ],
    "c": 2
  },
  {
    "q": "Hoe wordt een vlieger in het internationale handbal genoemd?",
    "a": [
      "Spin",
      "Kempa",
      "Flyball",
      "Jump Shot"
    ],
    "c": 1
  },
  {
    "q": "Welke kaart bestaat niet als officiële strafkaart bij handbal?",
    "a": [
      "Geel",
      "Rood",
      "Groen",
      "Blauw"
    ],
    "c": 2
  },
  {
    "q": "Hoe lang duurt een officiële seniorenwedstrijd?",
    "a": [
      "2 x 25 minuten",
      "2 x 35 minuten",
      "2 x 30 minuten",
      "3 x 20 minuten"
    ],
    "c": 2
  },
  {
    "q": "Wie scoorde de beslissende strafworp voor Nederland in de WK-finale van 2019?",
    "a": [
      "Estavana Polman",
      "Lois Abbingh",
      "Angela Malestein",
      "Kelly Dulfer"
    ],
    "c": 1
  },
  {
    "q": "In welk jaar kreeg HV Novitas een eigen buitenveld?",
    "a": [
      "2015",
      "2016",
      "2017",
      "2018"
    ],
    "c": 2
  },
  {
    "q": "In welk land speelde HV Novitas zijn eerste competitiewedstrijd?",
    "a": [
      "Nederland",
      "België",
      "Duitsland",
      "Frankrijk"
    ],
    "c": 1
  },
  {
    "q": "Wie is recordinternational van het Nederlandse dameshandbal?",
    "a": [
      "Estavana Polman",
      "Lois Abbingh",
      "Angela Malestein",
      "Laura van der Heijden"
    ],
    "c": 3
  },
  {
    "q": "Hoe vaak werd Duitsland wereldkampioen bij de heren?",
    "a": [
      "1 keer",
      "2 keer",
      "3 keer",
      "4 keer"
    ],
    "c": 2
  },
  {
    "q": "In welk land is het moderne handbal ontstaan?",
    "a": [
      "Denemarken",
      "Duitsland",
      "Zweden",
      "Frankrijk"
    ],
    "c": 0
  },
  {
    "q": "Toen handbal nog op een voetbalveld werd gespeeld, uit hoeveel veldspelers bestond een team?",
    "a": [
      "7",
      "9",
      "11",
      "13"
    ],
    "c": 2
  },
  {
    "q": "Welke coach was bondscoach van zowel Nederland als Duitsland?",
    "a": [
      "Per Johansson",
      "Henk Groener",
      "Emir Kurtagic",
      "Henk Custers"
    ],
    "c": 1
  },
  {
    "q": "De bal raakt tijdens het spel het dak van de sporthal. Wat beslist de scheidsrechter?",
    "a": [
      "Doorspelen",
      "Vrije worp voor de tegenpartij",
      "Scheidsrechtersworp",
      "Inworp"
    ],
    "c": 3
  },
  {
    "q": "Een speler houdt de bal binnen het veld, maar staat met één voet buiten de zijlijn. Wat beslist de scheidsrechter?",
    "a": [
      "Doorspelen",
      "Inworp voor de tegenpartij",
      "Vrije worp",
      "Scheidsrechtersworp"
    ],
    "c": 1
  },
  {
    "q": "Een verzorger loopt zonder toestemming het speelveld op om een geblesseerde speler te helpen. Wat gebeurt er?",
    "a": [
      "Niets",
      "De verzorger krijgt geel",
      "De speler krijgt een 2-minutenstraf",
      "Vrije worp voor de tegenpartij"
    ],
    "c": 2
  },
  {
    "q": "Een speler moet tijdens het spel dringend naar het toilet en verlaat zonder toestemming het veld via de verkeerde zijlijn. Wat gebeurt er?",
    "a": [
      "Niets",
      "Waarschuwing",
      "2 minuten tijdstraf",
      "Rode kaart"
    ],
    "c": 2
  },
  {
    "q": "De bal gaat voor een groot deel over de doellijn, maar niet volledig. Is het een doelpunt?",
    "a": [
      "Ja",
      "Nee",
      "Alleen als de keeper de bal raakt",
      "Alleen na videoscheidsrechter"
    ],
    "c": 1
  },
  {
    "q": "Je krijgt net een doelpunt tegen. Een medespeler staat al klaar op de middenlijn en ontvangt direct de bal. Moet je wachten op het fluitsignaal van de scheidsrechter?",
    "a": [
      "Ja, altijd",
      "Nee, als aan alle voorwaarden voor de snelle middenuitworp is voldaan",
      "Alleen in de laatste 10 minuten",
      "Alleen bij een gelijkspel"
    ],
    "c": 1
  },
  {
    "q": "Na een doelpunt loopt een speler van de scorende ploeg door de middencirkel en tikt de bal weg om de snelle middenuitworp te verhinderen. Wat beslist de scheidsrechter?",
    "a": [
      "Doorspelen",
      "Vrije worp",
      "2 minuten tijdstraf",
      "Waarschuwing"
    ],
    "c": 2
  },
  {
    "q": "Een team speelt in het oranje, maar de keeper van de tegenpartij draagt ook een oranje shirt. Wat gebeurt er?",
    "a": [
      "De wedstrijd begint gewoon",
      "De keeper moet van shirt wisselen",
      "Het thuisspelende team moet wisselen",
      "De scheidsrechter beslist tijdens de rust"
    ],
    "c": 1
  },
  {
    "q": "Een zeer getalenteerde damespeelster wil uitkomen in een herenteam. Mag dat volgens de Nederlandse regels?",
    "a": [
      "Ja",
      "Nee",
      "Alleen met toestemming van de bond",
      "Alleen tot en met de jeugd"
    ],
    "c": 2
  },
  {
    "q": "Vroeger stonden er doelrechters achter de doelen. Wat was hun belangrijkste taak?",
    "a": [
      "De tijd bijhouden",
      "Wissels controleren",
      "Helpen beoordelen of de bal de doellijn volledig had gepasseerd",
      "De coaches aanspreken"
    ],
    "c": 2
  },
  {
    "q": "De scheidsrechter is zijn fluitje vergeten en niemand in de sporthal heeft een fluitje. Wat gebeurt er?",
    "a": [
      "De wedstrijd begint gewoon",
      "De wedstrijd kan niet beginnen",
      "De aanvoerders fluiten",
      "Een coach neemt de leiding over"
    ],
    "c": 1
  },
  {
    "q": "Een speler gooit de bal na een overtreding de bal bewust weg. Wat beslist de scheidsrechter?",
    "a": [
      "Doorspelen",
      "Vrije worp",
      "2 minuten tijdstraf",
      "Waarschuwing"
    ],
    "c": 2
  },
  {
    "q": "Een speler krijgt tijdens de wedstrijd drie keer een tijdstraf van 2 minuten. Wat is het gevolg?",
    "a": [
      "Niets",
      "Hij krijgt nog een waarschuwing",
      "Hij wordt gediskwalificeerd (rode kaart)",
      "Zijn team krijgt een strafpunt"
    ],
    "c": 2
  },
  {
    "q": "Hoe groot is het doel bij handbal?",
    "a": [
      "2 meter breed en 3 meter hoog",
      "3 meter breed en 2 meter hoog",
      "3 meter breed en 2,5 meter hoog",
      "2,5 meter breed en 2 meter hoog"
    ],
    "c": 1
  },
  {
    "q": "Hoeveel handbalverenigingen zijn er in Zeeuws-Vlaanderen ?",
    "a": [
      "3",
      "6",
      "1",
      "2"
    ],
    "c": 2
  }
];

const el = id => document.getElementById(id);
const status = el("status");
const list = el("questionsList");
let questionEntries = [];
let editingId = null;
let initialized = false;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  })[ch]);
}
function normalizeQuestion(value) {
  return { q: String(value?.q ?? "").trim(), a: Array.isArray(value?.a) ? value.a.slice(0,4).map(v => String(v ?? "").trim()) : [], c: Number(value?.c) };
}
function isValidQuestion(q) {
  return q.q.length > 0 && q.a.length === 4 && q.a.every(a => a.length > 0) && Number.isInteger(q.c) && q.c >= 0 && q.c <= 3;
}
async function seedOriginalQuestionsIfEmpty() {
  // If the question bank is already initialized, never overwrite it.
  const version = await get(ref(db, SEED_VERSION_PATH));
  if (version.exists()) return;

  const snap = await get(ref(db, QUESTIONS_PATH));
  if (snap.exists()) {
    // Existing shared data means the operator has already initialized this bank.
    await set(ref(db, SEED_VERSION_PATH), CURRENT_SEED_VERSION);
    return;
  }

  const now = Date.now();
  const payload = {};
  originalQuestions.forEach((q, index) => {
    payload["q" + String(index + 1).padStart(3, "0")] = { ...normalizeQuestion(q), created: now, updated: now, order: index + 1 };
  });
  await set(ref(db, QUESTIONS_PATH), payload);
  await set(ref(db, SEED_VERSION_PATH), CURRENT_SEED_VERSION);
}
function renderQuestions() {
  const search = el("searchQuestions").value.trim().toLocaleLowerCase("nl");
  const filtered = questionEntries.filter(([,q]) => [q.q, ...(q.a || [])].join(" ").toLocaleLowerCase("nl").includes(search));
  el("questionCount").textContent = "(" + questionEntries.length + ")";
  if (!filtered.length) { list.innerHTML = "<p>Geen vragen gevonden.</p>"; return; }
  list.innerHTML = filtered.map(([id,q]) => {
    const answers = (q.a || []).map((a,i) => '<li class="' + (i === Number(q.c) ? "correct" : "") + '">' + escapeHtml(a) + (i === Number(q.c) ? " ✓ juist" : "") + "</li>").join("");
    const number = questionEntries.findIndex(item => item[0] === id) + 1;
    return '<article class="item question-card"><div><div class="question-meta">Vraag ' + number + '</div><h3>' + escapeHtml(q.q) + '</h3><ol type="A">' + answers + '</ol><div class="question-actions"><button type="button" data-edit="' + escapeHtml(id) + '">✏️ Bewerken</button><button type="button" class="danger" data-delete="' + escapeHtml(id) + '">🗑 Verwijderen</button></div></div></article>';
  }).join("");
  list.querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", () => startEdit(b.dataset.edit)));
  list.querySelectorAll("[data-delete]").forEach(b => b.addEventListener("click", () => deleteQuestion(b.dataset.delete)));
}
function resetForm() {
  editingId = null;
  el("questionForm").reset();
  el("formHeading").textContent = "➕ Nieuwe vraag";
  el("saveQuestion").textContent = "Vraag toevoegen";
  el("cancelEdit").hidden = true;
}
function startEdit(id) {
  const entry = questionEntries.find(([key]) => key === id);
  if (!entry) return;
  editingId = id;
  const q = normalizeQuestion(entry[1]);
  el("questionText").value = q.q;
  q.a.forEach((answer,i) => { el("answer" + i).value = answer; });
  const radio = document.querySelector('input[name="correctAnswer"][value="' + q.c + '"]');
  if (radio) radio.checked = true;
  el("formHeading").textContent = "✏️ Vraag bewerken";
  el("saveQuestion").textContent = "Wijzigingen opslaan";
  el("cancelEdit").hidden = false;
  el("editorSection").scrollIntoView({behavior:"smooth",block:"start"});
}
el("cancelEdit").addEventListener("click", resetForm);
el("searchQuestions").addEventListener("input", renderQuestions);
el("questionForm").addEventListener("submit", async event => {
  event.preventDefault();
  const q = normalizeQuestion({
    q: el("questionText").value,
    a: [0,1,2,3].map(i => el("answer" + i).value),
    c: Number(document.querySelector('input[name="correctAnswer"]:checked')?.value)
  });
  if (!isValidQuestion(q)) { alert("Vul de vraag en alle vier antwoorden in en kies het juiste antwoord."); return; }
  const button = el("saveQuestion");
  button.disabled = true;
  try {
    const now = Date.now();
    if (editingId) {
      await update(ref(db, QUESTIONS_PATH + "/" + editingId), {...q, updated: now});
      status.textContent = "Vraag bijgewerkt.";
    } else {
      await push(ref(db, QUESTIONS_PATH), {...q, created: now, updated: now, order: questionEntries.length + 1});
      status.textContent = "Vraag toegevoegd.";
    }
    resetForm();
  } catch (error) {
    console.error("Vraag opslaan mislukt:", error);
    alert("Opslaan is niet gelukt. Controleer de toegangsregels van de Firebase-database van de challenge.");
  } finally { button.disabled = false; }
});
async function deleteQuestion(id) {
  const entry = questionEntries.find(([key]) => key === id);
  if (!entry || !confirm("Weet je zeker dat je deze vraag wilt verwijderen?\n\n" + entry[1].q)) return;
  try {
    await remove(ref(db, QUESTIONS_PATH + "/" + id));
    if (editingId === id) resetForm();
    status.textContent = "Vraag verwijderd.";
  } catch (error) {
    console.error("Vraag verwijderen mislukt:", error);
    alert("Verwijderen is niet gelukt. Controleer de toegangsregels van de Firebase-database van de challenge.");
  }
}
onValue(ref(db, QUESTIONS_PATH), snapshot => {
  const data = snapshot.val() || {};
  questionEntries = Object.entries(data).filter(([,q]) => q && typeof q === "object").sort(([,a],[,b]) => (Number(a.order) || 999999) - (Number(b.order) || 999999));
  renderQuestions();
  status.textContent = initialized ? "Vragenlijst bijgewerkt." : questionEntries.length + " vragen geladen.";
  initialized = true;
}, error => {
  console.error("Vragen laden mislukt:", error);
  status.textContent = "De vragen konden niet uit Firebase worden gelezen. Controleer de database-toegangsregels.";
});
try {
  await seedOriginalQuestionsIfEmpty();
} catch (error) {
  console.error("Eenmalig overzetten van bestaande vragen mislukt:", error);
  status.textContent = "De bestaande vragen konden niet automatisch worden overgezet. Controleer de Firebase-toegangsregels.";
}
