# HV Novitas Muziekbingo – zelfstandige versie

Deze versie gebruikt GEEN Firebase en GEEN database.

## Werking
- Jaar invoeren
- Aantal rondes invoeren
- Aantal kaarten per ronde invoeren
- Automatische kleuren per ronde
- Minimaal 60 nummers per ronde
- Songlijsten laden als TXT/CSV of plakken
- Unieke kaarten genereren
- 5×5 kaart: 24 muziekvakken + gekleurd vrij vak
- Eén PDF per ronde
- Eén kaart per volledige A4-pagina

## Uniekheid
Iedere kaart binnen een ronde heeft een unieke combinatie van 24 nummers.
De nummers worden bovendien willekeurig over de 24 vakken verdeeld.
Een exacte dubbele kaart wordt automatisch geweigerd.

## Voorbeeld
Bij 4 rondes en 100 kaarten:
- Rood: 100 A4-kaarten
- Blauw: 100 A4-kaarten
- Geel: 100 A4-kaarten
- Oranje: 100 A4-kaarten

Totaal: 400 unieke A4-kaarten.

## Opslaan
Er is geen database nodig. De knop 'Instellingen lokaal bewaren' maakt optioneel een JSON-bestand met de ingevoerde lijsten.

## Bestanden
- muziekbingo.html
- muziekbingo.css
- muziekbingo.js


## Tekst passend maken

De kaartgenerator meet nu ieder artiest/titel-blok voordat het op de kaart wordt geplaatst.
De lettergrootte wordt automatisch verkleind als dat nodig is. Tekst wordt op woordgrenzen
afgebroken en uitzonderlijk lange woorden kunnen karakter voor karakter worden afgebroken.
Artiest en titel worden verticaal gecentreerd. Daardoor blijft alle tekst binnen het vak.


### Regels binnen het vak
De generator probeert eerst extra regels te gebruiken om artiest en titel goed leesbaar te houden.
Er zijn maximaal 8 regels beschikbaar. Pas wanneer de tekst ook daarmee niet past, wordt de
lettergrootte stapsgewijs verkleind.
