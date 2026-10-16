const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { BetaAnalyticsDataClient } = require("@google-analytics/data");

const analytics = new BetaAnalyticsDataClient();

exports.getWebsiteAnalytics = onCall(
  {
    region: "europe-west1",
    serviceAccount: "firebase-adminsdk-fbsvc@hv-novitas-beheer.iam.gserviceaccount.com"
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Log in om bezoekersstatistieken te bekijken.");
    }

    const propertyId = "399949687";
    const startDate = "2026-10-01";

    if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      throw new HttpsError(
        "failed-precondition",
        "Stel GA4_START_DATE in op de startdatum van de nieuwe website (YYYY-MM-DD)."
      );
    }

    const today = new Date();
    const dateString = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };
    const monday = new Date(today);
    const day = (monday.getDay() + 6) % 7;
    monday.setDate(monday.getDate() - day);

    try {
      const [weekly] = await analytics.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: dateString(monday), endDate: "today" }],
        metrics: [{ name: "activeUsers" }]
      });
      const [total] = await analytics.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate: "today" }],
        metrics: [{ name: "activeUsers" }]
      });

      return {
        weeklyActiveUsers: Number(weekly.rows?.[0]?.metricValues?.[0]?.value || 0),
        totalActiveUsers: Number(total.rows?.[0]?.metricValues?.[0]?.value || 0),
        startDate,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error("GA4 rapport ophalen mislukt:", error);
      throw new HttpsError("internal", "Analytics kon niet worden opgehaald. Controleer de GA4-toegang van het serviceaccount.");
    }
  }
);
