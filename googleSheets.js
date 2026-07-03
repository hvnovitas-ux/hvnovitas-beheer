// ==========================================
// HV NOVITAS - GOOGLE SHEETS
// ==========================================

export const CLIENT_ID =
"71716605241-4kgftcmjlen6jakrl7s8mfq2i4dud02r.apps.googleusercontent.com";

export const API_KEY =
"JOUW_BROWSER_API_KEY";

const DISCOVERY_DOC =
"https://sheets.googleapis.com/$discovery/rest?version=v4";

const SCOPES =
"https://www.googleapis.com/auth/spreadsheets.readonly";

const SPREADSHEET_ID =
"1rapIJstmllaV0OQyV20NEQxk_UO-IYuNYy7TQh5kMLM";

const RANGE =
"Formulierreacties 1!A:H";

let tokenClient;

// ==========================================
// Initialiseren
// ==========================================

export async function initSheets() {

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

}

// ==========================================
// Inloggen
// ==========================================

export async function loginSheets() {

    return new Promise((resolve, reject) => {

        tokenClient.callback = (resp) => {

            if (resp.error) {

                reject(resp);

                return;

            }

            resolve(resp);

        };

        tokenClient.requestAccessToken({
            prompt: "consent"
        });

    });

}

// ==========================================
// TEST
// ==========================================

export async function testSheets() {

    try {

        await loginSheets();

        const response =
            await gapi.client.sheets.spreadsheets.values.get({

                spreadsheetId: SPREADSHEET_ID,

                range: RANGE

            });

        console.log("===== GOOGLE SHEETS =====");

        console.table(response.result.values);

        alert("Google Sheets verbinding gelukt!");

        return response.result.values;

    } catch (error) {

        console.error(error);

        alert("Google Sheets verbinding mislukt.");

    }

}
