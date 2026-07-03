// ==========================================
// HV NOVITAS - GOOGLE DRIVE
// ==========================================

export const CLIENT_ID =
"71716605241-4kgftcmjlen6jakrl7s8mfq2i4dud02r.apps.googleusercontent.com";

export const API_KEY =
"AIzaSyC7OnJi3Z5BCaktePTrjb94nZgKMWSwapQ";

export const FOLDER_ID =
"1RMn8cqcO-TQBiEHkoAeLBbJTDZApx2uG";

export const SCOPES =
"https://www.googleapis.com/auth/drive.file";

let accessToken = null;
let tokenClient = null;
let initialized = false;

// ------------------------------------------
// Initialiseren
// ------------------------------------------

export async function initDrive() {

    if (initialized) return;

    await new Promise((resolve) => gapi.load("client", resolve));

    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
        ]
    });

    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: () => {}
    });

    initialized = true;

    console.log("📷 Google Drive geïnitialiseerd");
}

// ------------------------------------------
// Aanmelden
// ------------------------------------------

export async function loginDrive() {

    await initDrive();

    if (accessToken) {
        return accessToken;
    }

    return new Promise((resolve, reject) => {

        tokenClient.callback = (response) => {

            if (response.error) {
                reject(response);
                return;
            }

            accessToken = response.access_token;

            gapi.client.setToken({
                access_token: accessToken
            });

            resolve(accessToken);

        };

        tokenClient.requestAccessToken({
            prompt: "consent"
        });

    });

}

// ------------------------------------------
// Upload bestand
// ------------------------------------------

export async function uploadFile(file) {

    await loginDrive();

    const metadata = {
        name: file.name,
        mimeType: file.type,
        parents: [FOLDER_ID]
    };

    const form = new FormData();

    form.append(
        "metadata",
        new Blob(
            [JSON.stringify(metadata)],
            { type: "application/json" }
        )
    );

    form.append("file", file);

    const response = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            body: form
        }
    );

    if (!response.ok) {
        throw new Error(await response.text());
    }

    const data = await response.json();

    console.log("✅ Upload gelukt:", data);

    return data;

}
