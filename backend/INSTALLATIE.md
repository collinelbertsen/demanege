# Beveiligde onderzoeksopslag koppelen

## Status van deze oplevering
De websitecode, beheerschermen, database-adapter en toegangsregels zijn voorbereid. Er is nog geen Supabase-project beschikbaar. Daarom staat de opgeleverde productieconfiguratie leeg en blijft beheer daar uitgeschakeld. Lokale simulaties zijn geen bewijs dat productie-authenticatie of databasepolicies al actief zijn.

## Eenmalige inrichting
1. Maak een Supabase-project in je eigen account. Kies een passende regio en bewaar het databasewachtwoord zelf. Deel geen wachtwoorden of geheime sleutels in de chat of repository.
2. Open de SQL Editor en voer `schema.sql` éénmaal uit. De tabellen en de private bucket `manege-private` worden aangemaakt met Row Level Security.
3. Maak via **Authentication → Users** je beheeraccount aan of nodig het uit. Gebruik geen open registratie om automatisch beheerders aan te maken.
4. Voeg in de SQL Editor de UUID van dat Auth-account toe aan `public.manege_admins`, zoals onderaan `schema.sql` aangegeven. Alleen de projecteigenaar doet dit; de website heeft hiervoor geen rechten.
5. Geef de website de project-URL en publieke publishable/anon key via `dist/backend-config.js`. Deze twee waarden zijn openbaar. Een `service_role` of `sb_secret_` sleutel hoort hier nooit thuis. Dit is de eenmalige technische configuratie; voor latere onderzoeksinvoer hoeft de code niet meer aangepast te worden.
6. Publiceer de gewijzigde configuratie. Open **Stakeholders → Beheerder inloggen**. Test een concept, een gepubliceerde wens, een privégesprek en een upload. Controleer daarna in een aparte browser zonder login dat concepten, transcriptietekst en bestanden niet leesbaar zijn en dat directe schrijfpogingen geweigerd worden.

## Bediening
- Stakeholders: voeg naam, optionele rol en omschrijving toe. Bestaande stakeholders zijn bewerkbaar. Dubbele namen worden geweigerd.
- Wensen: omschrijving, stakeholder(s) en type zijn verplicht. Prioriteit, thema, functie, bron en toelichting zijn optioneel. Zonder functie blijft de ruimtelijke vertaling onbeoordeelbaar. Een uitspraak kan aan meerdere stakeholders worden gekoppeld zonder dat één stakeholder dubbel telt.
- Publicatie: nieuwe gegevens beginnen als beheerdersconcept. Alleen na de expliciete publicatiekeuze worden ze voor bezoekers zichtbaar. Maak een nieuwe stakeholder eerst openbaar voordat je zijn gekoppelde wens publiceert. Beheerders zien ook concepten in de analyse en generator.
- Gesprekken: titel en stakeholder plus tekst of een PDF/DOCX/TXT-bestand zijn vereist. Bestanden zijn maximaal 20 MB en blijven in een private bucket. TXT wordt ingelezen; bij PDF en DOCX blijft het originele bestand opgeslagen. Plak tekst erbij voor de lokale tekstherkenning. Er is geen automatische PDF-/Word-tekstextractie of externe AI-dienst ingebouwd.
- Herkenning: een lokale trefwoordregel stelt zinnen voor. Ook ontkenningen kunnen worden voorgesteld; de originele tekst blijft zichtbaar. Controleer context, formulering, type en bron. Voeg pas daarna een wens toe of verwerp de suggestie. Er wordt niets automatisch gepubliceerd.
- Verwijderen: vraagt bevestiging en maakt een tombstone; bestaande ontwerpobjecten blijven staan. Verwijderde onderzoeks-IDs mogen in oudere ontwerpbestanden blijven voorkomen.

## Toegangsmodel
`manege_records` bevat publieke gegevens en beheerdersconcepten. Publieke bezoekers kunnen alleen records met `published=true` lezen. Alleen UUIDs in `manege_admins` mogen schrijven. Niemand kan zichzelf vanuit de website beheerdersrechten geven. `manege_talks` en alle bronbestanden zijn uitsluitend voor beheerders leesbaar. De bestandsbucket is niet publiek. RLS beschermt de data ook bij directe API-aanroepen; het verbergen van knoppen is niet de beveiligingsgrens.

Het Auth-token blijft in sessionStorage van het beheertabblad. De site controleert de gebruiker en diens beheerderslidmaatschap bij aanmelden en herladen. De anonieme sleutel verleent geen schrijfrechten. Verlopen sessies worden ververst of vragen opnieuw aanmelden.

## Duurzaamheid en beperkingen
Onderzoeksgegevens en bestanden worden na koppeling centraal bewaard en bij herladen opnieuw opgehaald. Een gewijzigde wens gebruikt een versiecontrole om onbedoeld overschrijven van gelijktijdige wijzigingen te voorkomen. Dubbele stakeholdernamen en exact gelijke wensformuleringen voor dezelfde stakeholder worden in de database tegengehouden. Inhoudelijk vergelijkbare formuleringen vragen daarnaast menselijke controle en een bewuste groepskeuze; semantische gelijkheid is niet bewezen door de trefwoordregel.

De 39 oorspronkelijke records blijven als bronbasis beschikbaar. Databasewijzigingen worden daaroverheen toegepast; er is geen automatische kopie van volledige interne rapporten of opnamen. Gewijzigde lokale ontwerpen blijven in de browser en worden via JSON gedeeld; deze onderzoeksdatabase voegt geen centrale ontwerpcloud toe.

Kies zelf een passend opslag-/back-upbeleid in Supabase en controleer de actuele limieten van je gekozen plan. Er wordt geen onbeperkte opslag of beschikbaarheid beloofd. Het schema is bedoeld voor een nieuwe projectinrichting; voer het niet herhaaldelijk uit zonder migratiecontrole.

## Testen
`node tests/research-store.test.cjs` controleert de adapter tegen een gesimuleerde API: rechten, opslag, gedeelde wensen, concepten, uploads, bronvoorstellen, herladen en verwijderen. De bestaande generator- en ranglijsttests blijven beschikbaar. De echte Supabase-RLS- en Storage-regels moeten na de eenmalige inrichting nog met anonieme, normale en beheerdersaccounts worden getest. Die productiecontrole is nog niet uitgevoerd.
