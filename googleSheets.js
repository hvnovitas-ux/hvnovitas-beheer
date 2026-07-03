// ==========================================
// HV NOVITAS - GOOGLE SHEETS
// ==========================================

export const CLIENT_ID =
"71716605241-4kgftcmjlen6jakrl7s8mfq2i4dud02r.apps.googleusercontent.com";

export const API_KEY =
"JOUW_GOOGLE_SHEETS_BROWSER_KEY";

export const SPREADSHEET_ID =
"1rapIJstmllaV0OQyV20NEQxk_UO-IYuNYy7TQh5kMLM";

export const RANGE =
"Formulierreacties 1!A:H";

export const SCOPES =
"https://www.googleapis.com/auth/spreadsheets.readonly";

let accessToken = null;
let tokenClient = null;

// ==========================================
// Initialiseren
// ==========================================

export async function initSheets() {

    return new Promise((resolve) => {

        gapi.load("client", async () => {

            await gapi.client.init({

                apiKey: API_KEY,

                discoveryDocs: [
                    "https://sheets.googleapis.com/$discovery/rest?version=v4"
                ]

            });

            tokenClient =
                google.accounts.oauth2.initTokenClient({

                    client_id: CLIENT_ID,

                    scope: SCOPES,

                    callback: (tokenResponse) => {

                        accessToken =
                            tokenResponse.access_token;

                        gapi.client.setToken({

                            access_token: accessToken

                        });

                        resolve();

                    }

                });

        });

    });

}
