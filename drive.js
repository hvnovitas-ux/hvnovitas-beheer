const SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbxoX-t2Z32IMPy1QduByrpEdohkAwSTg5mgLkGLOYYZg-wx59aLrPqT8W_HKhq2WUid/exec";

export async function uploadFile(file) {

    console.log("🚀 DRIVE UPLOAD START");

    try {

        if (!file) {
            return { image: "" };
        }

        // =========================
        // FILE → BASE64
        // =========================
        const base64 = await new Promise((resolve, reject) => {

            const reader = new FileReader();

            reader.onload = () => {
                const result = reader.result;
                if (!result) return reject("No file data");
                resolve(result.split(",")[1]);
            };

            reader.onerror = () => reject("FileReader error");

            reader.readAsDataURL(file);
        });

        // =========================
        // TIMEOUT FIX (BELANGRIJK)
        // =========================
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const res = await fetch(SCRIPT_URL, {
            method: "POST",
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                file: base64,
                filename: file.name,
                mimeType: file.type
            })
        });

        clearTimeout(timeout);

        console.log("📡 STATUS:", res.status);

        // =========================
        // SAFE TEXT READ
        // =========================
        const text = await res.text();

        console.log("📦 RAW:", text);

        // =========================
        // SAFE JSON PARSE
        // =========================
        let data = null;

        try {
            data = JSON.parse(text);
        } catch (e) {
            console.warn("⚠️ JSON invalid → fallback image");
            return { image: "" };
        }

        // =========================
        // VALIDATION
        // =========================
        if (!data || !data.image) {
            console.warn("⚠️ No image in response");
            return { image: "" };
        }

        return data;

    } catch (err) {

        console.error("❌ DRIVE FAIL SAFE:", err);

        return { image: "" };
    }
}
