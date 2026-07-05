const SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbxoX-t2Z32IMPy1QduByrpEdohkAwSTg5mgLkGLOYYZg-wx59aLrPqT8W_HKhq2WUid/exec";

export async function uploadFile(file) {

    console.log("🚀 DRIVE UPLOAD START");

    try {

        const base64 = await new Promise((resolve) => {

            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(",")[1]);
            reader.readAsDataURL(file);
        });

        const res = await fetch(SCRIPT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                file: base64,
                filename: file.name,
                mimeType: file.type
            })
        });

        console.log("📡 STATUS:", res.status);

        const text = await res.text();

        console.log("📦 RAW:", text);

        let data;

        try {
            data = JSON.parse(text);
        } catch (e) {
            console.warn("⚠️ JSON error, fallback image gebruikt");
            return { image: "" };
        }

        if (!data?.image) {
            console.warn("⚠️ Geen image ontvangen, fallback");
            return { image: "" };
        }

        return data;

    } catch (err) {

        console.error("❌ DRIVE FAIL (SAFE MODE):", err);

        // 🔥 BELANGRIJK: CMS MAG NIET STOPPEN
        return { image: "" };
    }
}
