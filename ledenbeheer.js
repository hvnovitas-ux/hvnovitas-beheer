import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { ref, onValue, push, set, update } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const DB_PATH = "ledenadministratie/leden";
// Vaste historische basis uit het oude ledenbestand.
// Dit zijn alleen aantallen van namen die niet in het bestand 2026-2027 staan;
// er worden voor deze historische basis geen namen opgeslagen.
const HISTORICAL_BASELINE_BY_YEAR = Object.freeze({
  2012: 13,
  2013: 33,
  2014: 9
});
const ledenRef = ref(db, DB_PATH);
const el = (id) => document.getElementById(id);
let user = null;
let members = {};
let currentPreview = null;
let importBusy = false;

const notice = el("notice");

onAuthStateChanged(auth, (currentUser) => {
  if (!currentUser) {
    location.href = "login.html";
    return;
  }
  user = currentUser;
  el("userInfo").textContent = "👋 " + (user.displayName || user.email || "Admin");
});

el("logoutButton").addEventListener("click", async () => {
  try {
    await signOut(auth);
    location.href = "login.html";
  } catch (error) {
    console.error(error);
    showNotice("Uitloggen is niet gelukt.", "error");
  }
});

onValue(ledenRef, (snapshot) => {
  members = snapshot.val() || {};
  renderDashboard();
  renderLongevityRanking();
  renderMemberList();
}, (error) => {
  console.error("Ledenadministratie kon niet worden gelezen:", error);
  showNotice("De ledengegevens konden niet worden geladen. Controleer de Firebase-toegangsregels.", "error");
});

function showNotice(message, type = "success") {
  notice.textContent = message;
  notice.className = "notice" + (type === "error" ? " error" : type === "info" ? " info" : "");
  notice.hidden = false;
  notice.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function normalize(value) {
  return String(value ?? "").trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ");
}

function escapeHtml(value = "") {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function validISODate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function currentRecords() {
  return Object.entries(members).map(([key, value]) => ({ key, ...(value || {}) })).filter((item) => item.naam);
}

function isCurrentMember(member) {
  // Alleen records met een echte aanmelddatum tellen mee als lid.
  return member.active !== false && validISODate(member.lidSinds);
}

function renderDashboard() {
  const records = currentRecords();
  const active = records.filter(isCurrentMember);
  const inactive = records.filter((member) => !isCurrentMember(member));
  const year = new Date().getFullYear();
  const joinedThisYear = records.filter((member) => validISODate(member.lidSinds) && Number(member.lidSinds.slice(0, 4)) === year).length;

  el("activeCount").textContent = String(active.length);
  el("inactiveCount").textContent = String(inactive.length);
  el("recordCount").textContent = String(records.length);
  el("yearCount").textContent = String(joinedThisYear);
  el("thisYearLabel").textContent = `Aanmelddatums in ${year}`;

  // Begin met de vaste historische aantallen voor leden die ontbreken
  // in het actuele Excel-bestand. Tel daarna de opgeslagen CMS/Excel-records erbij.
  const counts = new Map(
    Object.entries(HISTORICAL_BASELINE_BY_YEAR).map(([y, count]) => [Number(y), count])
  );
  for (const member of records) {
    if (!validISODate(member.lidSinds)) continue;
    const y = Number(member.lidSinds.slice(0, 4));
    counts.set(y, (counts.get(y) || 0) + 1);
  }
  const years = [...counts.keys()].sort((a, b) => a - b);
  if (!years.length) {
    el("annualChart").innerHTML = '<p class="muted">Nog geen ledengegevens. Importeer eerst het Excel-bestand.</p>';
    el("annualTableBody").innerHTML = '<tr><td colspan="3" class="empty-cell">Nog geen gegevens</td></tr>';
    return;
  }

  // Toon ook tussenliggende jaren zonder aanmeldingen, zodat hiaten zichtbaar zijn.
  const chartYears = [];
  for (let y = years[0]; y <= Math.max(years[years.length - 1], year); y++) chartYears.push(y);
  const series = chartYears.map((y) => ({ year: y, count: counts.get(y) || 0 }));
  let runningTotal = 0;
  const cumulativeSeries = series.map(({ year: y, count }) => {
    runningTotal += count;
    return { year: y, count, total: runningTotal };
  });
  // Het cumulatieve totaal is de vaste historische basis plus alle CMS-records
  // met een geldige aanmelddatum. Er worden geen historische namen vastgelegd.
  el("everCount").textContent = String(cumulativeSeries[cumulativeSeries.length - 1]?.total || 0);
  renderBarChart(series);
  renderCumulativeChart(cumulativeSeries);
  el("annualTableBody").innerHTML = cumulativeSeries.slice().reverse().map(({ year: y, count, total }) => `<tr><td>${y}</td><td><strong>${count}</strong></td><td><strong>${total}</strong></td></tr>`).join("");
}

function localDateFromISO(value) {
  if (!validISODate(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getMembershipDuration(startISO, endDate = new Date()) {
  const start = localDateFromISO(startISO);
  if (!start) return null;
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  if (start > end) return null;

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

function formatMembershipDuration(duration) {
  if (!duration) return "—";
  const parts = [];
  if (duration.years) parts.push(`${duration.years} ${duration.years === 1 ? "jaar" : "jaar"}`);
  if (duration.months) parts.push(`${duration.months} ${duration.months === 1 ? "maand" : "maanden"}`);
  if (duration.days) parts.push(`${duration.days} ${duration.days === 1 ? "dag" : "dagen"}`);
  if (!parts.length) return "minder dan een dag";
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} en ${parts[1]}`;
  return `${parts[0]}, ${parts[1]} en ${parts[2]}`;
}

function renderLongevityRanking() {
  const body = el("longevityTableBody");
  const countLabel = el("longevityCount");
  if (!body || !countLabel) return;

  const today = new Date();
  const cutoffDate = new Date(today.getFullYear() - 8, today.getMonth(), today.getDate());
  const cutoffISO = `${cutoffDate.getFullYear()}-${String(cutoffDate.getMonth() + 1).padStart(2, "0")}-${String(cutoffDate.getDate()).padStart(2, "0")}`;
  const activeRecords = currentRecords().filter(isCurrentMember);
  const patricia = activeRecords.find((member) => normalize(member.naam) === "patricia bel");
  const existingErwin = activeRecords.find((member) => normalize(member.naam) === "erwin bel");

  // De ranglijst gebruikt de afgesproken datum voor de weergave; Firebase-records blijven ongewijzigd.
  const rankingMembers = activeRecords
    .filter((member) => normalize(member.naam) !== "erwin bel")
    .map((member) => ({ ...member, rankingDate: member.lidSinds }));
  const linkedDate = validISODate(patricia?.lidSinds) ? patricia.lidSinds : "2012-05-09";
  rankingMembers.push({
    ...(existingErwin || {}),
    naam: "Erwin Bel",
    lidSinds: linkedDate,
    rankingDate: linkedDate,
    rankingOnly: true
  });

  const eligible = rankingMembers
    .filter((member) => validISODate(member.rankingDate) && member.rankingDate <= cutoffISO)
    .sort((a, b) => {
      const dateOrder = a.rankingDate.localeCompare(b.rankingDate);
      if (dateOrder) return dateOrder;
      const priority = (member) => {
        const name = normalize(member.naam);
        if (name === "patricia bel") return 0;
        if (name === "erwin bel") return 1;
        return 2;
      };
      return priority(a) - priority(b) || normalize(a.naam).localeCompare(normalize(b.naam), "nl");
    });

  if (!eligible.length) {
    body.innerHTML = '<tr><td colspan="4" class="empty-cell">Nog geen huidige leden met minimaal 8 jaar lidmaatschap.</td></tr>';
    countLabel.textContent = "Alleen huidige leden met minimaal 8 jaar lidmaatschap worden getoond.";
    return;
  }

  body.innerHTML = eligible.map((member, index) => {
    const duration = getMembershipDuration(member.rankingDate, today);
    return `<tr><td class="rank-cell">${index + 1}</td><td><strong>${escapeHtml(member.naam)}</strong></td><td>${escapeHtml(formatDate(member.rankingDate))}</td><td><strong>${escapeHtml(formatMembershipDuration(duration))}</strong></td></tr>`;
  }).join("");
  countLabel.textContent = `${eligible.length} ${eligible.length === 1 ? "lid" : "leden"} met minimaal 8 jaar lidmaatschap.`;
}

function renderCumulativeChart(series) {
  const container = el("cumulativeChart");
  if (!series.length) {
    container.innerHTML = '<p class="muted">Nog geen ledengegevens.</p>';
    return;
  }
  const width = 1000, height = 310;
  const margin = { top: 28, right: 28, bottom: 48, left: 48 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const maxValue = Math.max(1, ...series.map((d) => d.total));
  const tickMax = Math.ceil(maxValue / 5) * 5 || 5;
  const slot = series.length > 1 ? plotW / (series.length - 1) : plotW;
  const pointX = (i) => series.length > 1 ? margin.left + i * slot : margin.left + plotW / 2;
  const pointY = (value) => margin.top + plotH - (value / tickMax) * plotH;
  let svg = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Lijngrafiek van het cumulatieve aantal leden dat HV Novitas door de jaren heen heeft gehad"><title>Totaal leden opgebouwd door de jaren heen</title>`;
  for (let tick = 0; tick <= tickMax; tick += tickMax / 5) {
    const y = pointY(tick);
    svg += `<line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" stroke="#e5e9ef" stroke-width="1"/>`;
    svg += `<text x="${margin.left - 10}" y="${y + 4}" text-anchor="end" font-size="12" fill="#707987">${Math.round(tick)}</text>`;
  }
  const points = series.map((item, i) => `${pointX(i)},${pointY(item.total)}`).join(" ");
  const areaPoints = `${pointX(0)},${margin.top + plotH} ${points} ${pointX(series.length - 1)},${margin.top + plotH}`;
  svg += `<polygon points="${areaPoints}" fill="#ff6a00" opacity="0.10"/>`;
  svg += `<polyline points="${points}" fill="none" stroke="#ff6a00" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
  series.forEach((item, i) => {
    const x = pointX(i), y = pointY(item.total);
    svg += `<circle cx="${x}" cy="${y}" r="4.5" fill="#ff6a00" stroke="#ffffff" stroke-width="2"><title>${item.year}: ${item.total} leden in totaal</title></circle>`;
    if (series.length <= 18 || i % 2 === 0) {
      svg += `<text x="${x}" y="${height - 19}" text-anchor="middle" font-size="12" fill="#596272">${item.year}</text>`;
      if (series.length <= 16) svg += `<text x="${x}" y="${Math.max(15, y - 10)}" text-anchor="middle" font-size="12" font-weight="700" fill="#343b46">${item.total}</text>`;
    }
  });
  svg += "</svg>";
  container.innerHTML = svg;
}

function renderBarChart(series) {
  const width = 1000, height = 310;
  const margin = { top: 28, right: 22, bottom: 48, left: 45 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const maxValue = Math.max(1, ...series.map((d) => d.count));
  const tickMax = Math.ceil(maxValue / 5) * 5 || 5;
  const slot = plotW / series.length;
  const barW = Math.max(7, Math.min(38, slot * 0.62));
  let svg = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Staafgrafiek van het aantal aanmeldingen per kalenderjaar"><title>Aanmeldingen per kalenderjaar</title>`;
  for (let tick = 0; tick <= tickMax; tick += tickMax / 5) {
    const y = margin.top + plotH - (tick / tickMax) * plotH;
    svg += `<line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" stroke="#e5e9ef" stroke-width="1"/>`;
    svg += `<text x="${margin.left - 10}" y="${y + 4}" text-anchor="end" font-size="12" fill="#707987">${Math.round(tick)}</text>`;
  }
  series.forEach((item, i) => {
    const x = margin.left + i * slot + (slot - barW) / 2;
    const barH = (item.count / tickMax) * plotH;
    const y = margin.top + plotH - barH;
    svg += `<rect x="${x}" y="${y}" width="${barW}" height="${Math.max(0, barH)}" rx="4" fill="#ff6a00"><title>${item.year}: ${item.count} aanmelding(en)</title></rect>`;
    if (item.count > 0) svg += `<text x="${x + barW / 2}" y="${Math.max(15, y - 7)}" text-anchor="middle" font-size="12" font-weight="700" fill="#343b46">${item.count}</text>`;
    if (series.length <= 18 || i % 2 === 0) svg += `<text x="${x + barW / 2}" y="${height - 19}" text-anchor="middle" font-size="12" fill="#596272">${item.year}</text>`;
  });
  svg += "</svg>";
  el("annualChart").innerHTML = svg;
}

el("memberForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!user) return showNotice("Je moet ingelogd zijn om leden te beheren.", "error");

  const nummer = el("memberNumber").value.trim();
  const naam = el("memberName").value.trim();
  const lidSinds = el("memberSince").value;
  const categorie = el("memberCategory").value.trim();
  if (!naam || !validISODate(lidSinds)) return showNotice("Vul een naam en geldige aanmelddatum in.", "error");
  const duplicate = currentRecords().find((m) => (nummer && normalize(m.nummer) === normalize(nummer)) || normalize(m.naam) === normalize(naam));
  if (duplicate) return showNotice(`Dit lijkt al geregistreerd te zijn: ${duplicate.naam}${duplicate.nummer ? ` (lidnummer ${duplicate.nummer})` : ""}. Controleer de ledenlijst voordat je een dubbel lid toevoegt.`, "error");

  const button = el("saveMemberButton");
  button.disabled = true;
  try {
    const newRef = push(ledenRef);
    const now = Date.now();
    await set(newRef, { nummer, naam, lidSinds, categorie, active: true, endDate: null, deactivatedManually: false, source: "cms", createdAt: now, updatedAt: now, updatedBy: user.email || "CMS" });
    el("memberForm").reset();
    showNotice(`${naam} is toegevoegd. Het lid telt vanaf de aanmelddatum mee in de grafiek.`);
  } catch (error) {
    console.error(error);
    showNotice("Het lid kon niet worden opgeslagen. Controleer de Firebase-toegangsregels.", "error");
  } finally {
    button.disabled = false;
  }
});

el("searchMembers").addEventListener("input", renderMemberList);
el("memberStatusFilter").addEventListener("change", renderMemberList);
el("membersTableBody").addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const key = button.dataset.key;
  const record = members[key];
  if (!record) return;
  if (button.dataset.action === "deactivate") {
    if (!confirm(`Meld ${record.naam || "dit lid"} af? Het record blijft bewaard in de historie.`)) return;
    try {
      await update(ref(db, `${DB_PATH}/${key}`), { active: false, endDate: todayISO(), deactivatedManually: true, updatedAt: Date.now(), updatedBy: user?.email || "CMS" });
      showNotice(`${record.naam} is afgemeld. De historische aanmelding blijft in de grafiek staan.`);
    } catch (error) {
      console.error(error);
      showNotice("Afmelden is niet gelukt.", "error");
    }
  } else if (button.dataset.action === "reactivate") {
    if (!confirm(`Wil je ${record.naam || "dit lid"} weer als actief registreren?`)) return;
    try {
      await update(ref(db, `${DB_PATH}/${key}`), { active: true, endDate: null, deactivatedManually: false, updatedAt: Date.now(), updatedBy: user?.email || "CMS" });
      showNotice(`${record.naam} is weer als actief lid geregistreerd.`);
    } catch (error) {
      console.error(error);
      showNotice("Opnieuw activeren is niet gelukt.", "error");
    }
  }
});

function renderMemberList() {
  const body = el("membersTableBody");
  const query = normalize(el("searchMembers").value);
  const status = el("memberStatusFilter").value;
  let list = currentRecords().filter((m) => {
    const active = isCurrentMember(m);
    if (status === "active" && !active) return false;
    if (status === "inactive" && active) return false;
    const haystack = normalize([m.naam, m.nummer, m.categorie, m.lidSinds].join(" "));
    return !query || haystack.includes(query);
  });
  list.sort((a, b) => Number(isCurrentMember(b)) - Number(isCurrentMember(a)) || normalize(a.naam).localeCompare(normalize(b.naam), "nl"));
  if (!list.length) {
    body.innerHTML = '<tr><td colspan="6" class="empty-cell">Geen leden gevonden.</td></tr>';
  } else {
    body.innerHTML = list.map((m) => {
      const active = isCurrentMember(m);
      const action = active
        ? `<button type="button" class="button button-action button-stop" data-action="deactivate" data-key="${escapeHtml(m.key)}">Afmelden</button>`
        : `<button type="button" class="button button-action button-restore" data-action="reactivate" data-key="${escapeHtml(m.key)}">Actief maken</button>`;
      return `<tr><td>${escapeHtml(m.nummer || "—")}</td><td><strong>${escapeHtml(m.naam || "")}</strong></td><td>${escapeHtml(formatDate(m.lidSinds))}</td><td>${escapeHtml(m.categorie || "—")}</td><td><span class="pill ${active ? "pill-new" : "pill-inactive"}">${active ? "Actief" : "Niet actief"}</span></td><td>${action}</td></tr>`;
    }).join("");
  }
  el("memberListCount").textContent = `${list.length} ${list.length === 1 ? "record" : "records"} getoond.`;
}

function formatDate(value) {
  if (!validISODate(value)) return "Geen datum";
  const [year, month, day] = value.split("-");
  return `${day}-${month}-${year}`;
}

// ================= Excel import =================

el("previewImportButton").addEventListener("click", async () => {
  if (importBusy) return;
  const file = el("importFile").files?.[0];
  if (!file) return showNotice("Kies eerst het Excel-bestand dat je wilt controleren.", "error");
  if (!window.XLSX) return showNotice("De Excel-lezer is niet geladen. Controleer je internetverbinding en probeer opnieuw.", "error");

  const button = el("previewImportButton");
  button.disabled = true;
  importBusy = true;
  el("applyImportButton").disabled = true;
  currentPreview = null;
  el("importSummary").hidden = true;
  el("importPreview").innerHTML = "<p class='muted'>Bestand wordt ingelezen en vergeleken…</p>";
  try {
    const result = await parseWorkbook(file);
    if (!result.importable.length && !result.skippedNoDate.length) throw new Error("Ik kon geen ledenregels vinden. Controleer of het bestand een tabblad met de kolommen ‘Nummer’, ‘Naam’ en ‘Lid per’ bevat.");
    currentPreview = buildImportPreview(result);
    renderImportPreview(currentPreview, result);
    el("applyImportButton").disabled = currentPreview.toWrite.length === 0;
    showNotice("Controle klaar. Er is nog niets opgeslagen. Controleer de verschillen en bevestig pas daarna de import.", "info");
  } catch (error) {
    console.error(error);
    el("importPreview").innerHTML = "";
    showNotice(error.message || "Het Excel-bestand kon niet worden gecontroleerd.", "error");
  } finally {
    importBusy = false;
    button.disabled = false;
  }
});

async function parseWorkbook(file) {
  const buffer = await file.arrayBuffer();
  const workbook = window.XLSX.read(buffer, { type: "array", cellDates: true });
  const sheetName = workbook.SheetNames.find((name) => normalize(name) === "leden") || workbook.SheetNames[0];
  if (!sheetName) throw new Error("Het bestand bevat geen werkblad.");
  const matrix = window.XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, raw: true, defval: "" });
  let headerRowIndex = -1;
  let headerMap = {};
  for (let i = 0; i < Math.min(matrix.length, 20); i++) {
    const row = matrix[i].map((value) => normalizeHeader(value));
    const idxNumber = row.indexOf("nummer");
    const idxName = row.indexOf("naam");
    const idxDate = row.indexOf("lidper");
    if (idxName >= 0 && idxDate >= 0) {
      headerRowIndex = i;
      headerMap = {
        nummer: idxNumber,
        naam: idxName,
        lidSinds: idxDate,
        categorie: row.indexOf("categorie"),
        categorieAuto: row.indexOf("categorieautomatisch"),
        actief: row.indexOf("actief")
      };
      break;
    }
  }
  if (headerRowIndex < 0) throw new Error("De kolomkoppen ‘Naam’ en ‘Lid per’ zijn niet gevonden in het werkblad.");

  const importable = [];
  const skippedNoDate = [];
  const skippedNoName = [];
  const duplicateRows = [];
  const seenNumbers = new Set();
  const seenNames = new Set();
  for (let i = headerRowIndex + 1; i < matrix.length; i++) {
    const row = matrix[i];
    const value = (key) => headerMap[key] >= 0 ? row[headerMap[key]] : "";
    const naam = String(value("naam") ?? "").trim();
    const nummerRaw = value("nummer");
    const nummer = nummerRaw === null || nummerRaw === undefined ? "" : String(nummerRaw).trim().replace(/\.0$/, "");
    if (!naam) {
      if (row.some((cell) => String(cell ?? "").trim())) skippedNoName.push({ rowNumber: i + 1 });
      continue;
    }
    const lidSinds = parseExcelDate(value("lidSinds"));
    const categoryRaw = value("categorie") || value("categorieAuto");
    const categorie = String(categoryRaw ?? "").trim();
    const sourceActive = parseActive(value("actief"));
    if (!lidSinds) {
      skippedNoDate.push({ nummer, naam, categorie, rowNumber: i + 1, reason: "Geen ‘Lid per’-datum; volgens afspraak nog niet meetellen als lid." });
      continue;
    }
    const numberKey = normalize(nummer);
    const nameKey = normalize(naam);
    if ((numberKey && seenNumbers.has(numberKey)) || seenNames.has(nameKey)) {
      duplicateRows.push({ nummer, naam, rowNumber: i + 1 });
      continue;
    }
    if (numberKey) seenNumbers.add(numberKey);
    seenNames.add(nameKey);
    importable.push({ nummer, naam, lidSinds, categorie, sourceActive, rowNumber: i + 1 });
  }
  return { fileName: file.name, sheetName, importable, skippedNoDate, skippedNoName, duplicateRows };
}

function normalizeHeader(value) {
  return normalize(value).replace(/[^a-z0-9]/g, "");
}

function parseActive(value) {
  const v = normalize(value);
  if (["nee", "nein", "no", "false", "0", "gestopt", "inactief", "afgemeld"].includes(v)) return false;
  return true;
}

function parseExcelDate(value) {
  if (value === null || value === undefined || value === "") return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = window.XLSX.SSF.parse_date_code(value);
    if (!parsed || !parsed.y || !parsed.m || !parsed.d) return "";
    return `${parsed.y}-${String(parsed.m).padStart(2, "0")}-${String(parsed.d).padStart(2, "0")}`;
  }
  const text = String(value).trim();
  let match = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (match) {
    const iso = `${match[1]}-${String(match[2]).padStart(2, "0")}-${String(match[3]).padStart(2, "0")}`;
    return validISODate(iso) ? iso : "";
  }
  match = text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (match) {
    const iso = `${match[3]}-${String(match[2]).padStart(2, "0")}-${String(match[1]).padStart(2, "0")}`;
    return validISODate(iso) ? iso : "";
  }
  if (/^\d+(\.\d+)?$/.test(text)) {
    const serial = Number(text);
    if (serial > 1000 && serial < 100000) {
      const parsed = window.XLSX.SSF.parse_date_code(serial);
      if (parsed?.y && parsed?.m && parsed?.d) return `${parsed.y}-${String(parsed.m).padStart(2, "0")}-${String(parsed.d).padStart(2, "0")}`;
    }
  }
  return "";
}

function buildImportPreview(parsed) {
  const existing = currentRecords();
  const usedKeys = new Set();
  const entries = parsed.importable.map((incoming) => {
    let match = null;
    if (incoming.nummer) match = existing.find((record) => !usedKeys.has(record.key) && normalize(record.nummer) === normalize(incoming.nummer));
    if (!match) match = existing.find((record) => !usedKeys.has(record.key) && normalize(record.naam) === normalize(incoming.naam));
    if (!match) return { type: "new", incoming };
    usedKeys.add(match.key);

    const preserveManualInactive = match.active === false && match.deactivatedManually === true && incoming.sourceActive;
    const targetActive = preserveManualInactive ? false : incoming.sourceActive;
    const changedFields = [];
    if (String(match.nummer || "") !== String(incoming.nummer || "")) changedFields.push("lidnummer");
    if (String(match.naam || "") !== incoming.naam) changedFields.push("naam");
    if (String(match.lidSinds || "") !== incoming.lidSinds) changedFields.push("lid per");
    if (String(match.categorie || "") !== incoming.categorie) changedFields.push("categorie");
    if (Boolean(match.active !== false && validISODate(match.lidSinds)) !== Boolean(targetActive && validISODate(incoming.lidSinds))) changedFields.push("status");
    if (preserveManualInactive) {
      const index = changedFields.indexOf("status");
      if (index >= 0) changedFields.splice(index, 1);
    }
    return { type: changedFields.length ? "changed" : "same", incoming, existingKey: match.key, existing: match, changedFields, preserveManualInactive };
  });
  const toWrite = entries.filter((item) => item.type === "new" || item.type === "changed");
  return { ...parsed, entries, toWrite, generatedAt: Date.now() };
}

function renderImportPreview(preview) {
  const counts = {
    new: preview.entries.filter((item) => item.type === "new").length,
    changed: preview.entries.filter((item) => item.type === "changed").length,
    same: preview.entries.filter((item) => item.type === "same").length,
    noDate: preview.skippedNoDate.length,
    duplicates: preview.duplicateRows.length
  };
  el("importSummary").hidden = false;
  el("importSummary").innerHTML = `
    <strong>Controle van ${escapeHtml(preview.fileName)}</strong>
    <p class="muted">Werkblad: ${escapeHtml(preview.sheetName)} · ${preview.importable.length} bruikbare ledenregels</p>
    <div class="summary-grid">
      <div class="summary-item"><strong>${counts.new}</strong><span>Nieuwe leden</span></div>
      <div class="summary-item"><strong>${counts.changed}</strong><span>Gewijzigd</span></div>
      <div class="summary-item"><strong>${counts.same}</strong><span>Ongewijzigd</span></div>
      <div class="summary-item"><strong>${counts.noDate}</strong><span>Zonder lid-datum overgeslagen</span></div>
      <div class="summary-item"><strong>${counts.duplicates}</strong><span>Dubbele regels overgeslagen</span></div>
      <div class="summary-item"><strong>${preview.skippedNoName.length}</strong><span>Lege regels overgeslagen</span></div>
    </div>
    <p>Bij bevestigen worden alleen nieuwe of gewijzigde regels verwerkt. Leden die ontbreken in het Excel-bestand blijven behouden. Handmatig afgemelde leden worden niet automatisch weer actief gemaakt.</p>
  `;
  const previewRows = [];
  for (const item of preview.entries) {
    const tag = item.type === "new" ? '<span class="pill pill-new">Nieuw</span>' : item.type === "changed" ? `<span class="pill pill-change">Gewijzigd: ${escapeHtml(item.changedFields.join(", "))}</span>` : '<span class="pill pill-same">Geen wijziging</span>';
    previewRows.push(`<tr><td>${escapeHtml(item.incoming.nummer || "—")}</td><td>${escapeHtml(item.incoming.naam)}</td><td>${escapeHtml(formatDate(item.incoming.lidSinds))}</td><td>${escapeHtml(item.incoming.categorie || "—")}</td><td>${tag}</td></tr>`);
  }
  for (const item of preview.skippedNoDate) {
    previewRows.push(`<tr><td>${escapeHtml(item.nummer || "—")}</td><td>${escapeHtml(item.naam)}</td><td>Geen datum</td><td>${escapeHtml(item.categorie || "—")}</td><td><span class="pill pill-skip">Overgeslagen: nog geen lid</span></td></tr>`);
  }
  for (const item of preview.duplicateRows) {
    previewRows.push(`<tr><td>${escapeHtml(item.nummer || "—")}</td><td>${escapeHtml(item.naam)}</td><td>—</td><td>—</td><td><span class="pill pill-inactive">Dubbele Excel-regel</span></td></tr>`);
  }
  el("importPreview").innerHTML = `<div class="table-wrap"><table class="preview-table"><thead><tr><th>Lidnr.</th><th>Naam</th><th>Lid per</th><th>Categorie</th><th>Controle</th></tr></thead><tbody>${previewRows.join("") || '<tr><td colspan="5">Geen ledenregels gevonden.</td></tr>'}</tbody></table></div>`;
}

el("applyImportButton").addEventListener("click", async () => {
  if (!currentPreview || !currentPreview.toWrite.length || importBusy) return;
  const preview = currentPreview;
  const freshCount = preview.toWrite.filter((item) => item.type === "new").length;
  const changedCount = preview.toWrite.filter((item) => item.type === "changed").length;
  if (!confirm(`De gecontroleerde import verwerken?\n\nNieuwe leden: ${freshCount}\nBijgewerkte records: ${changedCount}\nOvergeslagen zonder lid-datum: ${preview.skippedNoDate.length}\n\nLeden die niet in het bestand staan, worden niet verwijderd.`)) return;

  importBusy = true;
  el("applyImportButton").disabled = true;
  el("previewImportButton").disabled = true;
  try {
    let added = 0;
    let updated = 0;
    for (const item of preview.toWrite) {
      const incoming = item.incoming;
      if (item.type === "new") {
        const newRef = push(ledenRef);
        const now = Date.now();
        await set(newRef, {
          nummer: incoming.nummer,
          naam: incoming.naam,
          lidSinds: incoming.lidSinds,
          categorie: incoming.categorie,
          active: incoming.sourceActive,
          endDate: null,
          deactivatedManually: false,
          source: "excel",
          createdAt: now,
          updatedAt: now,
          importedAt: now,
          updatedBy: user?.email || "CMS"
        });
        added++;
      } else {
        const existing = item.existing || {};
        const nextActive = item.preserveManualInactive ? false : incoming.sourceActive;
        const patch = {
          nummer: incoming.nummer,
          naam: incoming.naam,
          lidSinds: incoming.lidSinds,
          categorie: incoming.categorie,
          active: nextActive,
          source: existing.source === "cms" ? "cms+excel" : "excel",
          updatedAt: Date.now(),
          importedAt: Date.now(),
          updatedBy: user?.email || "CMS"
        };
        if (item.preserveManualInactive) {
          patch.endDate = existing.endDate || null;
          patch.deactivatedManually = true;
        } else if (nextActive) {
          patch.endDate = null;
          patch.deactivatedManually = false;
        } else {
          patch.endDate = existing.endDate || null;
          patch.deactivatedManually = Boolean(existing.deactivatedManually);
        }
        await update(ref(db, `${DB_PATH}/${item.existingKey}`), patch);
        updated++;
      }
    }
    currentPreview = null;
    el("importSummary").hidden = true;
    el("importPreview").innerHTML = "";
    el("applyImportButton").disabled = true;
    el("importFile").value = "";
    showNotice(`Import verwerkt: ${added} nieuwe leden toegevoegd en ${updated} bestaande records bijgewerkt. ${preview.skippedNoDate.length} regels zonder ‘Lid per’-datum zijn niet geïmporteerd.`);
  } catch (error) {
    console.error(error);
    showNotice("De import is niet volledig verwerkt. Controleer de ledenlijst voordat je opnieuw importeert; de import kan gedeeltelijk zijn opgeslagen.", "error");
  } finally {
    importBusy = false;
    el("previewImportButton").disabled = false;
    if (currentPreview) el("applyImportButton").disabled = currentPreview.toWrite.length === 0;
  }
});

el("exportButton").addEventListener("click", () => {
  const records = currentRecords().sort((a, b) => normalize(a.naam).localeCompare(normalize(b.naam), "nl"));
  const rows = [["Lidnummer", "Naam", "Lid per", "Categorie", "Actief", "Afmelddatum", "Bron"]];
  for (const m of records) rows.push([m.nummer || "", m.naam || "", m.lidSinds || "", m.categorie || "", isCurrentMember(m) ? "Ja" : "Nee", m.endDate || "", m.source || ""]);
  const csv = "\uFEFF" + rows.map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(";")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `HV-Novitas-leden-${todayISO()}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
});
