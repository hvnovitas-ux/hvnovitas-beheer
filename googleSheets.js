// ==========================================
// HV NOVITAS - GOOGLE SHEETS
// Definitieve versie
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


const SCOPES =
"https://www.googleapis.com/auth/spreadsheets";

let accessToken = null;
let tokenClient = null;
let initialized = false;

// ==========================================
// INITIALISEREN
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

        callback: () => {}

    });

    initialized = true;

    console.log("📄 Google Sheets geïnitialiseerd");

}

// ==========================================
// AANMELDEN
// ==========================================

export async function loginSheets() {

    await initSheets();

    if (accessToken) {

        return accessToken;

    }

    return new Promise((resolve, reject) => {

        tokenClient.callback = response => {

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
// RIJEN OPHALEN
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
// PROEFTRAININGEN
// ==========================================

export async function getProeftrainingen() {

    const rows = await getRows();

    if (!rows.length) {

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
// RIJ VERWIJDEREN
// ==========================================

export async function deleteRow(rowIndex) {

    await loginSheets();

    await gapi.client.sheets.spreadsheets.batchUpdate({

        spreadsheetId: SPREADSHEET_ID,

        resource: {

            requests: [

                {

                    deleteDimension: {

                        range: {

                            sheetId: 0,

                            dimension: "ROWS",

                            startIndex: rowIndex - 1,

                            endIndex: rowIndex

                        }

                    }

                }

            ]

        }

    });

}

// ==========================================
// VERVERSEN
// ==========================================

export async function refreshSheets() {

    return await getProeftrainingen();

}

// ==========================================
// UITLOGGEN
// ==========================================

export function logoutSheets() {

    if (!accessToken) return;

    google.accounts.oauth2.revoke(accessToken);

    gapi.client.setToken(null);

    accessToken = null;

    console.log("🚪 Google Sheets afgemeld");

}

// ==========================================
// STATUS
// ==========================================

export function isSheetsLoggedIn() {

    return accessToken !== null;

}

export function getSheetsToken() {

    return accessToken;

}
