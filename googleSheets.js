// ==========================================
// HV NOVITAS - GOOGLE SHEETS
// ==========================================

export const CLIENT_ID =
"71716605241-4kgftcmjlen6jakrl7s8mfq2i4dud02r.apps.googleusercontent.com";

export const API_KEY =
"JOUW_GOOGLE_SHEETS_API_KEY";

export const SPREADSHEET_ID =
"1rapIJstmllaV0OQyV20NEQxk_UO-IYuNYy7TQh5kMLM";

export const RANGE =
"Formulierreacties 1!A:H";

const DISCOVERY_DOC =
"https://sheets.googleapis.com/$discovery/rest?version=v4";

const SCOPES =
"https://www.googleapis.com/auth/spreadsheets.readonly";

let accessToken = null;
let tokenClient = null;
let initialized = false;

// ==========================================
// Initialiseren
// ==========================================

export async function initSheets() {

    if (initialized) return;

    await new Promise(resolve => {

        gapi.load("client", resolve);

    });

    await gapi.client.init({

        apiKey: API_KEY,

        discoveryDocs: [DISCOVERY_DOC]

    });

    tokenClient = google.accounts.oauth2.initTokenClient({

        client_id: CLIENT_ID,

        scope: SCOPES,

        callback: ""

    });

    initialized = true;

    console.log("📄 Google Sheets geïnitialiseerd");

}

// ==========================================
// Aanmelden
// ==========================================

export async function loginSheets() {

    await initSheets();

    if (accessToken) {

        return accessToken;

    }

    return new Promise((resolve, reject) => {

        tokenClient.callback = (response) => {

            if (response.error) {

                console.error(response);

                reject(response);

                return;

            }

            accessToken = response.access_token;

            gapi.client.setToken({

                access_token: accessToken

            });

            console.log("✅ Google Sheets aangemeld");

            resolve(accessToken);

        };

        tokenClient.requestAccessToken({

            prompt: "consent"

        });

    });

}

// ==========================================
// Spreadsheet uitlezen
// ==========================================

export async function getRows() {

    await loginSheets();

    const response =
        await gapi.client.sheets.spreadsheets.values.get({

            spreadsheetId: SPREADSHEET_ID,

            range: RANGE

        });

    return response.result.values || [];

}

// ==========================================
// Omzetten naar objecten
// ==========================================

export async function getProeftrainingen() {

    const rows = await getRows();

    if (!rows.length) {

        return [];

    }

    const headers = rows.shift();

    return rows.map(row => {

        const item = {};

        headers.forEach((header, index) => {

            item[header] = row[index] || "";

        });

        return item;

    });

}

// ==========================================
// Vernieuwen
// ==========================================

export async function refreshSheets() {

    return await getProeftrainingen();

}

// ==========================================
// Uitloggen
// ==========================================

export function logoutSheets() {

    if (!accessToken) return;

    google.accounts.oauth2.revoke(accessToken);

    gapi.client.setToken(null);

    accessToken = null;

    console.log("🚪 Google Sheets afgemeld");

}

// ==========================================
// Status
// ==========================================

export function isSheetsLoggedIn() {

    return accessToken !== null;

}

export function getSheetsToken() {

    return accessToken;

}
