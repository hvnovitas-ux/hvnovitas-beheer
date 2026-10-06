const COLORS = [
  { name: "Rood", hex: "#d93025" },
  { name: "Blauw", hex: "#1a73e8" },
  { name: "Geel", hex: "#fbbc04" },
  { name: "Oranje", hex: "#f28c28" },
  { name: "Groen", hex: "#188038" },
  { name: "Paars", hex: "#9334e6" },
  { name: "Roze", hex: "#d01884" },
  { name: "Turquoise", hex: "#129eaf" }
];

const $ = id => document.getElementById(id);
let currentRounds = [];

$("makeRounds").addEventListener("click", createRounds);
$("generateAll").addEventListener("click", generateAllPDFs);
$("saveConfig").addEventListener("click", downloadConfig);

function createRounds() {
  const count = Number($("roundCount").value);
  const cardCount = Number($("cardCount").value);
  if (!Number.isInteger(count) || count < 1 || count > 8) return showError("Aantal rondes moet 1 t/m 8 zijn.");
  if (!Number.isInteger(cardCount) || cardCount < 1 || cardCount > 500) return showError("Aantal kaarten moet 1 t/m 500 zijn.");

  currentRounds = Array.from({length: count}, (_, i) => ({
    id: i + 1,
    name: `Ronde ${i + 1}`,
    color: COLORS[i].name,
    hex: COLORS[i].hex,
    songs: []
  }));
  renderRounds(cardCount);
  $("roundsSection").classList.remove("hidden");
  $("status").textContent = `${count} ronde(s) aangemaakt. Iedere ronde heeft minimaal 60 nummers nodig.`;
}

function renderRounds(cardCount) {
  $("rounds").innerHTML = currentRounds.map((r, i) => `
    <div class="round" style="--round-color:${r.hex}" data-round="${i}">
      <div class="round-head">
        <div>
          <h3>${escapeHtml(r.name)} – ${escapeHtml(r.color)}</h3>
          <div class="songmeta">Minimaal 60 nummers · ${cardCount} unieke kaarten · één A4 per kaart</div>
        </div>
        <span class="badge">${escapeHtml(r.color)}</span>
      </div>
      <label>Naam van de ronde
        <input class="round-name" value="${escapeAttr(r.name)}">
      </label>
      <div class="fileline">
        <label>Songlijst
          <input class="songfile" type="file" accept=".txt,.csv,.tsv">
          <span class="small">TXT/CSV: één nummer per regel. CSV mag: artiest,titel.</span>
        </label>
        <button class="secondary paste-btn" type="button">Tekst plakken</button>
      </div>
      <textarea class="songs" placeholder="Artiest - Titel
Artiest - Titel
..."></textarea>
      <div class="small count">0 nummers geladen</div>
    </div>
  `).join("");

  document.querySelectorAll(".round").forEach((el, i) => {
    const ta = el.querySelector(".songs");
    const file = el.querySelector(".songfile");
    const countEl = el.querySelector(".count");
    const updateCount = () => {
      const songs = parseSongs(ta.value);
      countEl.textContent = `${songs.length} nummers geladen${songs.length < 60 ? " – minimaal 60 nodig" : ""}`;
    };
    ta.addEventListener("input", updateCount);
    file.addEventListener("change", async () => {
      const f = file.files?.[0];
      if (!f) return;
      ta.value = await f.text();
      updateCount();
    });
    el.querySelector(".paste-btn").addEventListener("click", async () => {
      try {
        const txt = await navigator.clipboard.readText();
        if (txt) { ta.value = txt; updateCount(); }
      } catch {
        alert("Plakken via de browser is geblokkeerd. Plak de lijst rechtstreeks in het tekstvak.");
      }
    });
  });
}

function collectRounds() {
  const els = [...document.querySelectorAll(".round")];
  return els.map((el, i) => {
    const songs = parseSongs(el.querySelector(".songs").value);
    return {
      id: i + 1,
      name: el.querySelector(".round-name").value.trim() || `Ronde ${i + 1}`,
      color: currentRounds[i].color,
      hex: currentRounds[i].hex,
      songs
    };
  });
}

function parseSongs(text) {
  const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const songs = [];
  const seen = new Set();
  for (const line of lines) {
    // Ondersteun CSV met artiest,titel en gewone regels met vrije tekst.
    let artist = "", title = line;
    const parts = line.split(/\t|;/);
    if (parts.length >= 2) {
      artist = parts[0].trim();
      title = parts.slice(1).join(" - ").trim();
    } else {
      const dash = line.indexOf(" - ");
      if (dash > 0) {
        artist = line.slice(0, dash).trim();
        title = line.slice(dash + 3).trim();
      }
    }
    const key = `${artist}|${title}`.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      songs.push({ artist, title, key });
    }
  }
  return songs;
}

async function generateAllPDFs() {
  const rounds = collectRounds();
  const cardCount = Number($("cardCount").value);
  const errors = rounds.filter(r => r.songs.length < 60);
  if (errors.length) {
    showError(errors.map(r => `${r.color}: ${r.songs.length} nummers; minimaal 60 nodig.`).join("\n"));
    return;
  }

  $("generateAll").disabled = true;
  $("status").className = "status";
  $("status").textContent = "Kaarten worden gecontroleerd en gegenereerd…";

  try {
    for (const round of rounds) {
      const cards = makeUniqueCards(round.songs, cardCount);
      await makePDF(round, cards);
    }
    $("status").className = "status ok";
    $("status").textContent = `Klaar. ${rounds.length} PDF's zijn gegenereerd met ${cardCount} unieke kaarten per ronde.`;
  } catch (err) {
    console.error(err);
    showError("Er ging iets mis bij het maken van de PDF's: " + err.message);
  } finally {
    $("generateAll").disabled = false;
  }
}

function makeUniqueCards(songs, count) {
  const result = [];
  const signatures = new Set();
  const maxAttempts = Math.max(10000, count * 200);
  let attempts = 0;

  while (result.length < count && attempts++ < maxAttempts) {
    const selected = sampleUnique(songs, 24);
    shuffle(selected);
    const signature = selected.map(s => s.key).join("||");
    if (signatures.has(signature)) continue;
    signatures.add(signature);
    result.push(selected);
  }

  if (result.length !== count) {
    throw new Error(`Kon niet ${count} unieke kaarten maken.`);
  }
  return result;
}

function sampleUnique(arr, n) {
  const copy = [...arr];
  shuffle(copy);
  return copy.slice(0, n);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function makePDF(round, cards) {
  if (!window.jspdf?.jsPDF) throw new Error("PDF-bibliotheek is niet geladen.");
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  for (let i = 0; i < cards.length; i++) {
    if (i > 0) doc.addPage();
    drawCard(doc, round, cards[i], i + 1, cards.length);
  }

  doc.save(`Muziekbingo_${$("year").value}_${round.color}.pdf`);
}

function drawCard(doc, round, songs, number, total) {
  const W = 210, H = 297;
  const margin = 12;
  const color = hexToRgb(round.hex);

  doc.setFillColor(...color);
  doc.rect(0, 0, W, 34, "F");

  doc.setTextColor(255,255,255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("MUZIEKBINGO", W/2, 15, {align:"center"});
  doc.setFontSize(13);
  doc.text(`${$("year").value} · ${round.name.toUpperCase()}`, W/2, 25, {align:"center"});

  const gridX = margin, gridY = 52, gridW = W - margin*2, gridH = 205;
  const cellW = gridW / 5, cellH = gridH / 5;

  doc.setDrawColor(35,35,35);
  doc.setLineWidth(.5);
  doc.setFont("helvetica", "normal");

  let idx = 0;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const x = gridX + col * cellW;
      const y = gridY + row * cellH;
      const center = row === 2 && col === 2;

      if (center) {
        doc.setFillColor(...color);
        doc.rect(x, y, cellW, cellH, "FD");
        doc.setTextColor(255,255,255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("VRIJ", x + cellW/2, y + cellH/2 + 4, {align:"center"});
      } else {
        doc.setFillColor(255,255,255);
        doc.rect(x, y, cellW, cellH, "FD");
        const s = songs[idx++];
        doc.setTextColor(20,20,20);
        drawSongToFit(doc, s, x, y, cellW, cellH);
      }
    }
  }

  doc.setTextColor(70,70,70);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Kaart ${String(number).padStart(3,"0")} · ${total} kaarten`, W/2, 270, {align:"center"});
  doc.setFontSize(8);
  doc.text("HV Novitas · Muziekbingo", W/2, 282, {align:"center"});
}

function formatSong(s) {
  return s.artist ? `${s.artist} – ${s.title}` : s.title;
}

/*
 * Plaatst artiest en titel binnen het vak.
 * De tekst wordt eerst gemeten. Als hij niet past:
 * 1. lettergrootte wordt verkleind;
 * 2. tekst wordt opnieuw afgebroken;
 * 3. dit herhaalt zich totdat alles binnen het vak past.
 *
 * Hierdoor kan tekst nooit buiten de cel terechtkomen.
 */
function drawSongToFit(doc, song, x, y, w, h) {
  const padX = 3.2;
  const padY = 3.2;
  const maxW = w - padX * 2;
  const maxH = h - padY * 2;

  const artist = (song.artist || "").trim();
  const title = (song.title || "").trim();

  let fontSize = 9.0;
  const minFontSize = 5.7;
  let best = null;

  while (fontSize >= minFontSize) {
    const artistLines = wrapTextStrict(doc, artist, maxW, fontSize, "bold");
    const titleLines = wrapTextStrict(doc, title, maxW, fontSize, "normal");

    const gap = artist && title ? 1.5 : 0;
    const artistLineH = fontSize * 0.48;
    const titleLineH = fontSize * 0.46;
    const totalH =
      artistLines.length * artistLineH +
      gap +
      titleLines.length * titleLineH;

    const maxLines = 8;
    const totalLines = artistLines.length + titleLines.length;

    if (totalH <= maxH && totalLines <= maxLines) {
      best = { fontSize, artistLines, titleLines, artistLineH, titleLineH, gap, totalH };
      break;
    }
    fontSize -= 0.25;
  }

  // Extra veilige fallback voor uitzonderlijk lange teksten.
  if (!best) {
    fontSize = minFontSize;
    const artistLines = wrapTextStrict(doc, artist, maxW, fontSize, "bold").slice(0, 4);
    const titleLines = wrapTextStrict(doc, title, maxW, fontSize, "normal").slice(0, 4);
    best = {
      fontSize,
      artistLines,
      titleLines,
      artistLineH: fontSize * 0.48,
      titleLineH: fontSize * 0.46,
      gap: artist && title ? 1 : 0
    };
    best.totalH =
      best.artistLines.length * best.artistLineH +
      best.gap +
      best.titleLines.length * best.titleLineH;
  }

  let cursorY = y + (h - best.totalH) / 2 + best.fontSize * 0.36;

  if (best.artistLines.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(best.fontSize);
    for (const line of best.artistLines) {
      doc.text(line, x + w / 2, cursorY, { align: "center" });
      cursorY += best.artistLineH;
    }
  }

  if (best.titleLines.length) {
    cursorY += best.gap;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(best.fontSize);
    for (const line of best.titleLines) {
      doc.text(line, x + w / 2, cursorY, { align: "center" });
      cursorY += best.titleLineH;
    }
  }
}

function wrapTextStrict(doc, text, maxWidth, fontSize, weight) {
  if (!text) return [];

  doc.setFont("helvetica", weight);
  doc.setFontSize(fontSize);

  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;

    if (doc.getTextWidth(candidate) <= maxWidth) {
      line = candidate;
      continue;
    }

    if (line) {
      lines.push(line);
      line = "";
    }

    // Een enkel woord kan zelf te lang zijn. Breek het dan karakter voor karakter.
    if (doc.getTextWidth(word) > maxWidth) {
      let part = "";
      for (const char of word) {
        const candidatePart = part + char;
        if (doc.getTextWidth(candidatePart) <= maxWidth) {
          part = candidatePart;
        } else {
          if (part) lines.push(part);
          part = char;
        }
      }
      line = part;
    } else {
      line = word;
    }
  }

  if (line) lines.push(line);
  return lines;
}

// Behouden voor compatibiliteit met oudere aanroepen.
function drawWrapped(doc, text, x, y, maxWidth, size, maxLines) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(size);
  const lines = wrapTextStrict(doc, text, maxWidth, size, "normal").slice(0, maxLines);
  const lineH = size * 0.45;
  const startY = y - ((lines.length - 1) * lineH) / 2;
  lines.forEach((line, i) => {
    doc.text(line, x + maxWidth / 2, startY + i * lineH, {align: "center"});
  });
}

function hexToRgb(hex) {
  const h = hex.replace("#","");
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}

function downloadConfig() {
  const rounds = collectRounds();
  const year = Number($("year").value);
  const cardCount = Number($("cardCount").value);
  const invalid = rounds.filter(r => r.songs.length < 60);
  if (invalid.length) {
    showError("Opslaan kan pas wanneer iedere ronde minimaal 60 nummers bevat.");
    return;
  }

  const config = {
    year,
    cardCount,
    rounds: rounds.map(r => ({
      id: r.id,
      name: r.name,
      color: r.color,
      songs: r.songs.map(s => ({artist: s.artist, title: s.title}))
    }))
  };

  const blob = new Blob([JSON.stringify(config, null, 2)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Muziekbingo_${year}_instellingen.json`;
  a.click();
  URL.revokeObjectURL(url);

  $("status").className = "status ok";
  $("status").textContent = `Instellingen voor ${year} opgeslagen als lokaal JSON-bestand.`;
}

function showError(message) {
  $("status").className = "status error";
  $("status").textContent = message;
  $("roundsSection").classList.remove("hidden");
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function escapeAttr(s) {
  return escapeHtml(s).replace(/`/g, "&#96;");
}
