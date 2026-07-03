// ==========================================
// HV NOVITAS - GOOGLE DRIVE
// ==========================================

export const CLIENT_ID =
"71716605241-4kgftcmjlen6jakrl7s8mfq2i4dud02r.apps.googleusercontent.com";

export const API_KEY =
"VUL_HIER_JE_BROWSER_API_KEY_IN";

export const NEWS_FOLDER_ID =
"1RMn8cqcO-TQBiEHkoAeLBbJTDZApx2uG";

export const SCOPES =
"https://www.googleapis.com/auth/drive.file";

let tokenClient;
let accessToken = null;

export async function initDrive() {

    return new Promise((resolve) => {

        gapi.load("client", async () => {

            await gapi.client.init({
                apiKey: API_KEY,
                discoveryDocs: [
                    "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
                ]
            });

            tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: (response) => {

                    accessToken = response.access_token;

                    gapi.client.setToken({
                        access_token: accessToken
                    });

                    resolve();

                }
            });

        });

    });

}

export async function loginDrive() {

    if (accessToken) return;

    return new Promise((resolve) => {

        tokenClient.callback = (response) => {

            accessToken = response.access_token;

            gapi.client.setToken({
                access_token: accessToken
            });

            resolve();

        };

        tokenClient.requestAccessToken();

    });

}
