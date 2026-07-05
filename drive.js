const SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbxoX-t2Z32IMPy1QduByrpEdohkAwSTg5mgLkGLOYYZg-wx59aLrPqT8W_HKhq2WUid/exec";

export async function uploadFile(file) {

    console.log("🚀 DRIVE UPLOAD START");

    const base64 = await new Promise((resolve) => {

        const reader = new FileReader();

        reader.onload = () => resolve(reader.result.split(",")[1]);

        reader.readAsDataURL(file);
    });

    try {

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

        console.log("📦 RAW RESPONSE:", text);

        let data;

        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error("Apps Script gaf geen geldige JSON terug");
        }

        if (!data.image) {
            throw new Error("Geen image URL ontvangen");
        }

        console.log("🖼️ UPLOAD OK:", data);

        return data;

    } catch (err) {

        console.error("❌ DRIVE ERROR:", err);
        throw err;
    }
}
