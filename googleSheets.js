const CLIENT_ID =
"71716605241-4kgftcmjlen6jakrl7s8mfq2i4dud02r.apps.googleusercontent.com";

const API_KEY =
"AIzaSyC7OnJi3Z5BCaktePTrjb94nZgKMWSwapQ";

const DISCOVERY_DOC =
"https://sheets.googleapis.com/$discovery/rest?version=v4";

const SCOPES =
"https://www.googleapis.com/auth/spreadsheets.readonly";

let tokenClient;

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

export async function loginSheets() {

    return new Promise(resolve => {

        tokenClient.callback = async (resp) => {

            if (resp.error) {

                console.error(resp);

                return;

            }

            resolve();

        };

        tokenClient.requestAccessToken();

    });

}

export async function testSheet() {

    await loginSheets();

    const response = await gapi.client.sheets.spreadsheets.values.get({

        spreadsheetId:
        "1rapIJstmllaV0OQyV20NEQxk_UO-IYuNYy7TQh5kMLM",

        range: "Formulierreacties 1!A1:H5"

    });

    console.log(response.result.values);

}
Stap 2
