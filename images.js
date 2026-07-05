export let images = [];

export function resetImages() {
    images = [];
}

export function toBase64(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });
}

export function addImage(file, previewEl, statusEl) {

    if (images.length >= 3) {
        alert("Max 3 foto's toegestaan");
        return;
    }

    toBase64(file).then(base64 => {
        images.push(base64);
        render(previewEl, statusEl);
    });
}

export function render(previewEl, statusEl) {

    previewEl.innerHTML = "";

    images.forEach(img => {
        const el = document.createElement("img");
        el.src = img;
        el.style.width = "100%";
        el.style.marginTop = "10px";
        el.style.borderRadius = "10px";
        previewEl.appendChild(el);
    });

    statusEl.textContent = `${images.length} / 3 foto's`;
