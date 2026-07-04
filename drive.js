// ==========================================
// HV NOVITAS - DRIVE UPLOADER (STABLE)
// ==========================================

export const CLIENT_ID =
"71716605241-4kgftcmjlen6jakrl7s8mfq2i4dud02r.apps.googleusercontent.com";

export const API_KEY =
"AIzaSyC7OnJi3Z5BCaktePTrjb94nZgKMWSwapQ";

export const FOLDER_ID =
"1RMn8cqcO-TQBiEHkoAeLBbJTDZApx2uG";

export const SCOPES =
"https://www.googleapis.com/auth/drive.file";

// ==========================================
// STATE
// ==========================================

let accessToken = null;
let tokenClient = null;
let initialized = false;

// ==========================================
// INIT DRIVE (NO CALLBACK HERE!)
// ==========================================

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
        scope: SCOPES
    });

    initialized = true;

    console.log("📷 DRIVE INITIALIZED");
}

// ==========================================
// LOGIN (ONLY ONE CALLBACK SYSTEM)
// ==========================================

export async function loginDrive() {

    await initDrive();

    if (accessToken) return accessToken;

    return new Promise((resolve, reject) => {

        tokenClient.callback = (res) => {

            if (!res || res.error) {
                console.error("❌ LOGIN FAILED:", res);
                reject(res);
                return;
            }

            accessToken = res.access_token;

            console.log("🔐 LOGIN SUCCESS");

            resolve(accessToken);
        };

        console.log("🚀 OPEN GOOGLE LOGIN");

        tokenClient.requestAccessToken({
            prompt: "consent"
        });
    });
}

// ==========================================
// UPLOAD FILE
// ==========================================

export async function uploadFile(file) {

    console.log("🚀 UPLOAD START");

    const token = await loginDrive();

    if (!token) {
        throw new Error("❌ NO ACCESS TOKEN");
    }

    console.log("🔑 TOKEN OK");

    const metadata = {
        name: file.name,
        parents: [FOLDER_ID]
    };

    const form = new FormData();

    form.append(
        "metadata",
        new Blob([JSON.stringify(metadata)], {
            type: "application/json"
        })
    );

    form.append("file", file);

    const response = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
        {
            method: "POST",
            headers: {
                Authorization: "Bearer " + token
            },
            body: form
        }
    );

    console.log("📡 STATUS:", response.status);

    if (!response.ok) {
        const err = await response.text();
        console.error("❌ UPLOAD ERROR:", err);
        throw new Error(err);
    }

    const data = await response.json();

    console.log("📦 FILE:", data);

    // ==========================================
    // PUBLIC ACCESS
    // ==========================================

    await fetch(
        `https://www.googleapis.com/drive/v3/files/${data.id}/permissions`,
        {
            method: "POST",
            headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                role: "reader",
                type: "anyone"
            })
        }
    );

    // ==========================================
    // IMAGE URL
    // ==========================================

    const imageUrl =
        "https://drive.google.com/uc?export=view&id=" + data.id;

    console.log("🖼️ IMAGE URL:", imageUrl);

    return {
        id: data.id,
        image: imageUrl
    };
}

// ==========================================
// LOGOUT
// ==========================================

export function logoutDrive() {

    accessToken = null;

    if (google?.accounts?.oauth2) {
        google.accounts.oauth2.revoke(accessToken);
    }

    console.log("🚪 LOGOUT");
}

// ==========================================
// STATUS
// ==========================================

export function isDriveLoggedIn() {
    return accessToken !== null;
}

export function getDriveToken() {
    return accessToken;
}
