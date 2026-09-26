<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>HV Novitas – Evenementenbanner beheren</title>

  <link rel="stylesheet" href="evenementenbanner.css">
</head>

<body>

  <main class="page">

    <header class="header">

      <div>

        <div class="kicker">
          HV NOVITAS CMS
        </div>

        <h1>
          Evenementenbanner beheren
        </h1>

        <p>
          Stel hier de banner in die op de website boven het nieuws verschijnt.
        </p>

      </div>

      <div>

        <a
          class="back"
          href="dashboard.html">
          ← Terug naar dashboard
        </a>

      </div>

    </header>


    <div class="layout">


      <!-- =========================================
           INSTELLINGEN
           ========================================= -->

      <section class="panel">

        <div class="panel-title">

          <div>

            <h2>
              Bannerinstellingen
            </h2>

          </div>

          <div
            id="status"
            class="pill neutral">
            Laden...
          </div>

        </div>


        <form id="eventForm">


          <!-- ACTIEF -->

          <label class="toggle-row">

            <input
              id="active"
              type="checkbox">

            <span>

              <strong>
                Banner actief
              </strong>

              <small>
                Alleen binnen de ingestelde periode wordt de banner getoond.
              </small>

            </span>

          </label>


          <!-- TITEL -->

          <label>

            Titel

            <input
              id="title"
              type="text"
              placeholder="Bijvoorbeeld: Muziek Bingo"
              autocomplete="off">

          </label>


          <!-- BOVENREGEL -->

          <label>

            Bovenregel

            <input
              id="eyebrow"
              type="text"
              placeholder="HV NOVITAS PRESENTEERT"
              autocomplete="off">

          </label>


          <!-- DATUM + TIJD -->

          <div class="two">

            <label>

              Datumtekst

              <input
                id="dateText"
                type="text"
                placeholder="Zaterdag 28 november 2026">

            </label>


            <label>

              Tijdtekst

              <input
                id="timeText"
                type="text"
                placeholder="19.00 uur">

            </label>

          </div>


          <!-- LOCATIE -->

          <label>

            Locatie

            <input
              id="location"
              type="text"
              placeholder="Den Dullaert"
              autocomplete="off">

          </label>


          <!-- LINK -->

          <label>

            Link

            <input
              id="link"
              type="url"
              placeholder="https://www.hvnovitas.nl/..."
              inputmode="url">

            <small>
              Optioneel. De hele banner wordt klikbaar wanneer hier een link staat.
            </small>

          </label>


          <!-- ZICHTBAARHEID -->

          <div class="two">

            <label>

              Zichtbaar vanaf

              <input
                id="start"
                type="datetime-local">

            </label>


            <label>

              Zichtbaar tot

              <input
                id="end"
                type="datetime-local">

            </label>

          </div>


          <!-- KNOPPEN -->

          <div class="actions">

            <button
              type="submit"
              class="primary">
              Banner opslaan
            </button>


            <button
              type="button"
              id="previewBtn"
              class="secondary">
              Naar voorbeeld
            </button>


            <button
              type="button"
              id="clearBtn"
              class="danger">
              Banner leegmaken
            </button>

          </div>


          <p class="note">

            De banner gebruikt de vaste HV Novitas-vormgeving.
            Je hoeft hier alleen de tekst, periode en eventuele link in te vullen.

          </p>


        </form>

      </section>


      <!-- =========================================
           VOORBEELD
           ========================================= -->

      <section
        class="panel"
        id="previewPanel">

        <div class="panel-title">

          <div>

            <h2>
              Voorbeeld
            </h2>

            <p class="note">
              Dit voorbeeld verandert direct terwijl je de velden invult.
            </p>

          </div>


          <div class="pill">
            Voorbeeld
          </div>

        </div>


        <div id="preview">


          <section class="event-banner">


            <div
              class="art"
              aria-hidden="true">


              <span class="music one">
                ♪
              </span>


              <span class="music two">
                ♫
              </span>


              <span class="ball left">
                5
              </span>


              <span class="ball mid">
                17
              </span>


              <span class="ball right">
                28
              </span>


              <div class="bingo">

                BINGO

                <small>
                  ★ ★ ★
                </small>

              </div>


            </div>


            <div class="content">


              <div
                id="previewEyebrow"
                class="eyebrow">

                HV NOVITAS PRESENTEERT

              </div>


              <div
                id="previewTitle"
                class="title">

                MUZIEK
                <strong>BINGO</strong>

              </div>


              <div class="rule">
              </div>


              <div class="details">


                <span id="previewDate">
                  DATUM
                </span>


                <i>
                  •
                </i>


                <span id="previewTime">
                  TIJD
                </span>


                <i>
                  •
                </i>


                <span id="previewLocation">
                  LOCATIE
                </span>


              </div>


            </div>


          </section>


        </div>


      </section>


    </div>


    <!-- =========================================
         UITLEG
         ========================================= -->

    <section class="panel guidance">

      <b>
        Gebruik
      </b>

      <p>

        Zet eerst de banner aan.
        Vul daarna titel, datum, tijd en locatie in.
        Stel vervolgens de zichtbaarheidperiode in en klik op
        <strong>Banner opslaan</strong>.

      </p>

    </section>


  </main>


  <!-- MELDINGEN -->

  <div
    id="message"
    class="message"
    aria-live="polite">
  </div>


  <!-- SCRIPT -->

  <script
    type="module"
    src="evenementenbanner.js">
  </script>


</body>
</html>
