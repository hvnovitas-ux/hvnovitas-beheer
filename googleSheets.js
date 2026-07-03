// =====================================================
// HV NOVITAS CMS
// Google Sheets - Deel 1
// =====================================================

// ---------- CONFIGURATIE ----------

export const CLIENT_ID =
"71716605241-4kgftcmjlen6jakrl7s8mfq2i4dud02r.apps.googleusercontent.com";

export const API_KEY =
"AIzaSyC7OnJi3Z5BCaktePTrjb94nZgKMWSwapQ";

export const SPREADSHEET_ID =
"1rapIJstmllaV0OQyV20NEQxk_UO-IYuNYy7TQh5kMLM";

export const DISCOVERY_DOC =
"https://sheets.googleapis.com/$discovery/rest?version=v4";

export const SCOPES =
"https://www.googleapis.com/auth/spreadsheets";

// ---------- VARIABELEN ----------

let initialized = false;

let tokenClient = null;

let accessToken = null;

// =====================================================
// INITIALISEREN
// =====================================================

export async function initSheets() {

    if (initialized) {

        return;

    }

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

    console.log("✅ Google Sheets geïnitialiseerd");

}

// =====================================================
// LOGIN
// =====================================================

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

            console.log("✅ Google Login voltooid");

            resolve(accessToken);

        };

        tokenClient.requestAccessToken({

            prompt: "consent"

        });

    });

}

// =====================================================
// UITLOGGEN
// =====================================================

export function logoutSheets() {

    if (!accessToken) return;

    google.accounts.oauth2.revoke(accessToken);

    gapi.client.setToken(null);

    accessToken = null;

    console.log("🚪 Uitgelogd");

}

// =====================================================
// STATUS
// =====================================================

export function isLoggedIn() {

    return accessToken !== null;

}

export function getAccessToken() {

    return accessToken;

}

// =====================================================
// SPREADSHEET TEST
// =====================================================

export async function testConnection() {

    await loginSheets();

    return await gapi.client.sheets.spreadsheets.get({

        spreadsheetId: SPREADSHEET_ID

    });

}
// =====================================================
// RIJEN OPHALEN
// =====================================================

export async function getRows(range) {

    await loginSheets();

    const response =
        await gapi.client.sheets.spreadsheets.values.get({

            spreadsheetId: SPREADSHEET_ID,

            range: range

        });

    return response.result.values || [];

}

// =====================================================
// PROEFTRAININGEN
// =====================================================

export async function getProeftrainingen() {

    const rows = await getRows("Formulierreacties 1!A:H");

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

// =====================================================
// RIJ TOEVOEGEN
// =====================================================

export async function appendRow(range, values) {

    await loginSheets();

    return await gapi.client.sheets.spreadsheets.values.append({

        spreadsheetId: SPREADSHEET_ID,

        range: range,

        valueInputOption: "USER_ENTERED",

        resource: {

            values: [values]

        }

    });

}

// =====================================================
// RIJ BIJWERKEN
// =====================================================

export async function updateRow(range, values) {

    await loginSheets();

    return await gapi.client.sheets.spreadsheets.values.update({

        spreadsheetId: SPREADSHEET_ID,

        range: range,

        valueInputOption: "USER_ENTERED",

        resource: {

            values: [values]

        }

    });

}

// =====================================================
// RIJ VERWIJDEREN
// =====================================================

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

// =====================================================
// VERVERSEN
// =====================================================

export async function refreshSheets() {

    return await getProeftrainingen();

}

// =====================================================
// SPREADSHEET INFO
// =====================================================

export async function getSpreadsheetInfo() {

    await loginSheets();

    const response =
        await gapi.client.sheets.spreadsheets.get({

            spreadsheetId: SPREADSHEET_ID

        });

    return response.result;

}

// =====================================================
// EINDE
// =====================================================

console.log("🧡 HV Novitas Google Sheets gereed");
