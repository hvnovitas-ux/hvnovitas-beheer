/* =========================================================
   HV NOVITAS
   GOOGLE AGENDA -> ICAL PROXY
   CLOUDFLARE WORKER
   ========================================================= */

const CALENDAR_ICS_URL =
  "https://calendar.google.com/calendar/ical/hvnovitas%40gmail.com/public/basic.ics";


export default {

  async fetch(
    request
  ) {

    /* =====================================================
       CORS PREFLIGHT
       ===================================================== */

    if (
      request.method ===
      "OPTIONS"
    ) {

      return new Response(
        null,
        {
          status:
            204,

          headers:
            corsHeaders()

        }
      );

    }


    /* =====================================================
       ALLEEN GET
       ===================================================== */

    if (
      request.method !==
      "GET"
    ) {

      return new Response(
        "Method Not Allowed",
        {
          status:
            405,

          headers:
            {
              ...corsHeaders(),

              "Allow":
                "GET, OPTIONS"

            }

        }
      );

    }


    try {

      const response =
        await fetch(
          CALENDAR_ICS_URL,
          {
            headers:
              {
                "User-Agent":
                  "HV Novitas Agenda Proxy"
              },

            cf:
              {
                cacheTtl:
                  120,

                cacheEverything:
                  true
              }

          }
        );


      if (
        !response.ok
      ) {

        return new Response(
          `Google Agenda gaf HTTP ${response.status}.`,
          {
            status:
              502,

            headers:
              {
                ...corsHeaders(),

                "Content-Type":
                  "text/plain; charset=utf-8"

              }

          }
        );

      }


      const ics =
        await response.text();


      return new Response(
        ics,
        {
          status:
            200,

          headers:
            {
              ...corsHeaders(),

              "Content-Type":
                "text/calendar; charset=utf-8",

              "Cache-Control":
                "public, max-age=120"

            }

        }
      );

    } catch (
      error
    ) {

      console.error(
        error
      );


      return new Response(
        "Agenda-feed kon niet worden opgehaald.",
        {
          status:
            500,

          headers:
            {
              ...corsHeaders(),

              "Content-Type":
                "text/plain; charset=utf-8"

            }

        }
      );

    }

  }

};


/* =========================================================
   CORS
   ========================================================= */

function corsHeaders() {

  return {

    "Access-Control-Allow-Origin":
      "*",

    "Access-Control-Allow-Methods":
      "GET, OPTIONS",

    "Access-Control-Allow-Headers":
      "Content-Type",

    "Access-Control-Max-Age":
      "86400"

  };

}
