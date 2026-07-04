const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxoX-t2Z32IMPy1QduByrpEdohkAwSTg5mgLkGLOYYZg-wx59aLrPqT8W_HKhq2WUid/exec";

export async function uploadFile(file) {

    console.log("🚀 APPS SCRIPT UPLOAD START");

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = async () => {

            try {

                const base64 = reader.result.split(",")[1];

                const res = await fetch(SCRIPT_URL, {
                    method: "POST",
                    body: JSON.stringify({
                        file: base64,
                        filename: file.name,
                        mimeType: file.type
                    })
                });

                const data = await res.json();

                console.log("📦 DRIVE RESPONSE:", data);

                resolve(data);

            } catch (err) {

                console.error("❌ UPLOAD ERROR:", err);
                reject(err);
            }
        };

        reader.readAsDataURL(file);
    });
}
