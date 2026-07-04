// ======================================================
// HV NOVITAS CMS
// GOOGLE SHEETS
// DEEL 1
// ======================================================

// ==========================================
// CONFIGURATIE
// ==========================================

export const CLIENT_ID =
"71716605241-4kgftcmjlen6jakrl7s8mfq2i4dud02r.apps.googleusercontent.com";

export const API_KEY =
"AIzaSyDWYYS09i4YN9tnCmAzeiicD9T4YZ3a6HE";

export const SPREADSHEET_ID =
"1rapIJstmllaV0OQyV20NEQxk_UO-IYuNYy7TQh5kMLM";

export const RANGE =
"Formulierreacties 1!A:H";

const DISCOVERY_DOC =
"https://sheets.googleapis.com/$discovery/rest?version=v4";
// ==========================================
// GOOGLE
// ==========================================

const SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets"
].join(" ");

// ==========================================
// VARIABELEN
// ==========================================

let gapiLoaded = false;
let gisLoaded = false;

let tokenClient = null;
let accessToken = null;

// ==========================================
// GAPI LADEN
// ==========================================

export async function loadGapi() {

    if (gapiLoaded) return;

    await new Promise(resolve => {

        gapi.load("client", resolve);

    });

    gapiLoaded = true;

}

// ==========================================
// GOOGLE CLIENT
// ==========================================

export async function initGoogleClient() {

    await loadGapi();

    await gapi.client.init({

        apiKey: API_KEY,

        discoveryDocs: [

            DISCOVERY_DOC

        ]

    });

}

// ==========================================
// GOOGLE IDENTITY
// ==========================================

export function initGoogleIdentity() {

    if (gisLoaded) return;

    tokenClient =
        google.accounts.oauth2.initTokenClient({

            client_id: CLIENT_ID,

            scope: SCOPES,

            callback: ""

        });

    gisLoaded = true;

}

// ==========================================
// INITIALISEREN
// ==========================================

export async function initSheets() {

    await initGoogleClient();

    initGoogleIdentity();

    console.log("✅ Google geladen");

}

// ==========================================
// LOGIN
// ==========================================

export async function loginSheets() {

    await initSheets();

    if (accessToken) {

        return accessToken;

    }

    return new Promise((resolve, reject) => {

        tokenClient.callback = response => {

            if (response.error) {

                reject(response);

                return;

            }

            accessToken = response.access_token;

            gapi.client.setToken({

                access_token: accessToken

            });

            console.log("✅ Ingelogd");

            resolve(accessToken);

        };

        tokenClient.requestAccessToken({

            prompt: "consent"

        });

    });

}

// ==========================================
// STATUS
// ==========================================

export function isLoggedIn() {

    return accessToken !== null;

}

export function getAccessToken() {

    return accessToken;

}

// ==========================================
// UITLOGGEN
// ==========================================

export function logoutSheets() {

    if (!accessToken) return;

    google.accounts.oauth2.revoke(accessToken);

    gapi.client.setToken(null);

    accessToken = null;

    console.log("🚪 Uitgelogd");

}
// ==========================================
// SPREADSHEET LEZEN
// ==========================================

export async function getRows(range) {

    await loginSheets();

    const response =
        await gapi.client.sheets.spreadsheets.values.get({

            spreadsheetId: SPREADSHEET_ID,

            range: range

        });

    if (!response.result.values) {

        return [];

    }

    return response.result.values;

}

// ==========================================
// PROEFTRAININGEN
// ==========================================

export async function getProeftrainingen() {

    const rows =
        await getRows("Formulierreacties 1!A:H");

    if (rows.length === 0) {

        return [];

    }

    const headers = rows.shift();

    return rows.map((row, index) => {

        const item = {

            _row: index + 2

        };

        headers.forEach((header, i) => {

            item[header] = row[i] || "";

        });

        return item;

    });

}

// ==========================================
// RIJ TOEVOEGEN
// ==========================================

export async function appendRow(range, values) {

    await loginSheets();

    return await gapi.client
        .sheets.spreadsheets.values.append({

            spreadsheetId: SPREADSHEET_ID,

            range: range,

            valueInputOption: "USER_ENTERED",

            resource: {

                values: [

                    values

                ]

            }

        });

}

// ==========================================
// RIJ WIJZIGEN
// ==========================================

export async function updateRow(range, values) {

    await loginSheets();

    return await gapi.client
        .sheets.spreadsheets.values.update({

            spreadsheetId: SPREADSHEET_ID,

            range: range,

            valueInputOption: "USER_ENTERED",

            resource: {

                values: [

                    values

                ]

            }

        });

}

// ==========================================
// CEL LEZEN
// ==========================================

export async function getCell(range) {

    const rows =
        await getRows(range);

    if (rows.length === 0) {

        return "";

    }

    if (rows[0].length === 0) {

        return "";

    }

    return rows[0][0];

}

// ==========================================
// CEL SCHRIJVEN
// ==========================================

export async function setCell(range, value) {

    await loginSheets();

    return await gapi.client
        .sheets.spreadsheets.values.update({

            spreadsheetId: SPREADSHEET_ID,

            range: range,

            valueInputOption: "USER_ENTERED",

            resource: {

                values: [

                    [

                        value

                    ]

                ]

            }

        });

}

// ==========================================
// ALLE BLADEN
// ==========================================

export async function getSpreadsheet() {

    await loginSheets();

    const response =
        await gapi.client.sheets.spreadsheets.get({

            spreadsheetId: SPREADSHEET_ID

        });

    return response.result;

}
// ==========================================
// RIJ VERWIJDEREN
// ==========================================

export async function deleteRow(rowNumber, sheetId = 0) {

    await loginSheets();

    return await gapi.client.sheets.spreadsheets.batchUpdate({

        spreadsheetId: SPREADSHEET_ID,

        resource: {

            requests: [

                {

                    deleteDimension: {

                        range: {

                            sheetId: sheetId,

                            dimension: "ROWS",

                            startIndex: rowNumber - 1,

                            endIndex: rowNumber

                        }

                    }

                }

            ]

        }

    });

}

// ==========================================
// BLAD VERVERSEN
// ==========================================

export async function refreshSheets() {

    return await getProeftrainingen();

}

// ==========================================
// SHEET ID OPHALEN
// ==========================================

export async function getSheetId(sheetName) {

    const spreadsheet =
        await getSpreadsheet();

    const sheet =
        spreadsheet.sheets.find(

            s => s.properties.title === sheetName

        );

    if (!sheet) {

        throw new Error(

            "Werkblad niet gevonden: " + sheetName

        );

    }

    return sheet.properties.sheetId;

}

// ==========================================
// CONTROLE VERBINDING
// ==========================================

export async function testConnection() {

    try {

        await loginSheets();

        const spreadsheet =
            await getSpreadsheet();

        console.log(
            "✅ Verbonden met:",
            spreadsheet.properties.title
        );

        return true;

    }
    catch (err) {

        console.error(
            "❌ Geen verbinding",
            err
        );

        return false;

    }

}

// ==========================================
// HULPFUNCTIES
// ==========================================

export function formatDate(date) {

    const d = new Date(date);

    if (isNaN(d)) {

        return date;

    }

    return d.toLocaleDateString("nl-NL");

}

export function formatDateTime(date) {

    const d = new Date(date);

    if (isNaN(d)) {

        return date;

    }

    return d.toLocaleString("nl-NL");

}

export function isEmpty(value) {

    return value === undefined ||
           value === null ||
           value === "";

}

export function sleep(ms) {

    return new Promise(resolve => {

        setTimeout(resolve, ms);

    });

}

// ==========================================
// EINDE
// ==========================================

console.log("🧡 HV Novitas Google Sheets geladen");
