import { db, auth } from "./firebase.js";
import {
  ref,
  get,
  set
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const ROOT = "donNova";
const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/hwxe3jzg/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "hvnovitas_upload";

const form = document.getElementById("donForm");
const userInfo = document.getElementById("userInfo");
const logoutButton = document.getElementById("logoutButton");
const statusEl = document.getElementById("status");

const stripFile = document.getElementById("stripFile");
const stripPreview = document.getElementById("stripPreview");

const extraHeading = document.getElementById("extraHeading");
const extraBody = document.getElementById("extraBody");
const extraPhotoFile = document.getElementById("extraPhotoFile");
const extraPhotoPreview = document.getElementById("extraPhotoPreview");
const extraPhotoRemove = document.getElementById("extraPhotoRemove");

const v1Url = document.getElementById("v1Url");
const v1Title = document.getElementById("v1Title");
const v1Heading = document.getElementById("v1Heading");
const v1Body = document.getElementById("v1Body");

const v2Url = document.getElementById("v2Url");
const v2Title = document.getElementById("v2Title");
const v2Heading = document.getElementById("v2Heading");
const v2Body = document.getElementById("v2Body");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  userInfo.textContent = "👋 " + (user.displayName || user.email || "Admin");
  await loadData();
});

logoutButton.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "login.html";
  } catch (error) {
    console.error(error);
    showStatus("Uitloggen is niet gelukt.", true);
  }
});

stripFile.addEventListener("change", () => {
  const file = stripFile.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    stripPreview.src = String(reader.result);
    stripPreview.hidden = false;
  };
  reader.readAsDataURL(file);
});

extraPhotoFile.addEventListener("change", () => {
  const file = extraPhotoFile.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    extraPhotoPreview.src = String(reader.result);
    extraPhotoPreview.hidden = false;
    extraPhotoRemove.checked = false;
  };
  reader.readAsDataURL(file);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    showStatus("Don Nova wordt opgeslagen...");

    const current = (await get(ref(db, ROOT))).val() || {};

    let strip = current.strip || {};

    const file = stripFile.files?.[0];
    if (file) {
      const upload = await uploadToCloudinary(file);
      strip = {
        imageUrl: upload.secure_url,
        publicId: upload.public_id || "",
        updatedAt: Date.now()
      };
    }

    let extraSection = current.extraSection || {};
    let extraImage = {
      imageUrl: extraSection.imageUrl || "",
      publicId: extraSection.publicId || ""
    };

    const extraFile = extraPhotoFile.files?.[0];
    if (extraFile) {
      const upload = await uploadToCloudinary(extraFile, "De extra foto kon niet worden geüpload.");
      extraImage = {
        imageUrl: upload.secure_url,
        publicId: upload.public_id || ""
      };
    } else if (extraPhotoRemove.checked) {
      extraImage = { imageUrl: "", publicId: "" };
    }

    const data = {
      strip,
      extraSection: {
        heading: extraHeading.value.trim(),
        body: extraBody.value.trim(),
        imageUrl: extraImage.imageUrl,
        publicId: extraImage.publicId,
        updatedAt: Date.now()
      },
      video1: {
        youtubeUrl: v1Url.value.trim(),
        title: v1Title.value.trim() || "Don Video 1",
      },
      text1: {
        heading: v1Heading.value.trim() || "Meer dan alleen handbal",
        body: v1Body.value.trim()
      },
      video2: {
        youtubeUrl: v2Url.value.trim(),
        title: v2Title.value.trim() || "Don Video 2",
      },
      text2: {
        heading: v2Heading.value.trim() || "Een perfecte afsluiting van het seizoen.",
        body: v2Body.value.trim()
      },
      updatedAt: Date.now()
    };

    await set(ref(db, ROOT), data);

    showStatus("Don Nova is opgeslagen.");
    stripFile.value = "";
    extraPhotoFile.value = "";
    extraPhotoRemove.checked = false;
  } catch (error) {
    console.error("Don Nova opslaan mislukt:", error);
    showStatus(error.message || "Opslaan is niet gelukt.", true);
  }
});

async function loadData() {
  try {
    const snapshot = await get(ref(db, ROOT));
    const data = snapshot.val() || {};

    if (data.strip?.imageUrl) {
      stripPreview.src = data.strip.imageUrl;
      stripPreview.hidden = false;
    }

    extraHeading.value = data.extraSection?.heading || "";
    extraBody.value = data.extraSection?.body || "";
    if (data.extraSection?.imageUrl) {
      extraPhotoPreview.src = data.extraSection.imageUrl;
      extraPhotoPreview.hidden = false;
    } else {
      extraPhotoPreview.removeAttribute("src");
      extraPhotoPreview.hidden = true;
    }
    extraPhotoRemove.checked = false;

    v1Url.value = data.video1?.youtubeUrl || "";
    v1Title.value = data.video1?.title || "Don Video 1";
    v1Heading.value = data.text1?.heading || "Meer dan alleen handbal";
    v1Body.value = data.text1?.body ||
      "Bij HV Novitas draait het om veel meer dan alleen wedstrijden. We organiseren regelmatig leuke activiteiten, ouder-kindwedstrijden, afsluitingsdagen en andere gezellige momenten. Zo leer je niet alleen handballen, maar maak je ook nieuwe vrienden en beleef je samen een geweldige tijd";

    v2Url.value = data.video2?.youtubeUrl || "";
    v2Title.value = data.video2?.title || "Don Video 2";
    v2Heading.value = data.text2?.heading || "Een perfecte afsluiting van het seizoen.";
    v2Body.value = data.text2?.body ||
      "Bij HV Novitas hebben we het seizoen afgesloten met een waterdag vol spelletjes, lachen en teamgevoel. Geen training vandaag... maar plezier, zon en samen genieten. Jeugd, ouders en trainers deden allemaal mee aan een dag vol energie en gezelligheid. Dit is waar een club voor staat.";
  } catch (error) {
    console.error(error);
    showStatus("De huidige Don Nova-instellingen konden niet worden geladen.", true);
  }
}

async function uploadToCloudinary(file, errorMessage = "De afbeelding kon niet worden geüpload.") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json();
}

function showStatus(message, error = false) {
  statusEl.textContent = message;
  statusEl.className = "status " + (error ? "error" : "ok");
}