# De Manege — openbaar onderzoeks- en ontwerpplatform

Statische HTML/CSS/JavaScript-website; geen database, externe AI-dienst, API-sleutels of installatie nodig voor bezoekers. De generator rekent lokaal in de browser. GitHub Pages publiceert de volledige interactieve site.

## Eenmalig instellen
Deze bestanden staan in de repository `collinelbertsen/demanege`, op de branch `main`. Kies bij **Settings → Pages → Build and deployment → Source: GitHub Actions**. De workflow controleert en publiceert de map `dist`. De startpagina is `dist/index.html` in het bronproject en `index.html` op de website.

Bij iedere volgende push naar `main` draait de workflow automatisch. Wijzig broninhoud in `dist/data.js`, vormgeving in de CSS en werking in de bestaande JavaScript-modules. De live URL verschijnt na een geslaagde workflow bij de deployment. Een verwachte URL is geen bewijs van publicatie: test de daadwerkelijk opgeleverde HTTPS-link.

## Controle
Voer `node scripts/check-public.cjs`, `node tests/generator.test.cjs`, `node tests/stakeholders.test.cjs` en `node tests/simple-generator.test.cjs` uit. Alle afhankelijkheden zijn standaard Node-functionaliteit; geen npm-installatie nodig.

## Openbare bestanden
De publicatie bevat de bestaande site met alle 39 onderzoeksrecords, gekoppelde analyses, generator en editor. Respondentnamen zijn vervangen door organisatieaanduidingen. Ruwe transcripties, volledige Word-rapporten, bronfoto's en opgeslagen persoonlijke ontwerpen zijn uitgesloten. De openbare tekeningviewer bevat uitsluitend de oorspronkelijke vectoronderlegger en de bronbeperkingen. De lokale volledige onderzoeksversie blijft apart bewaard.

## Opslag en beperkingen
Ontwerpen blijven in de browser op het betreffende apparaat; JSON-export en -import maken overdracht mogelijk. Ontwerpen van een eerder lokaal geopende HTML-versie worden niet automatisch naar het nieuwe internetadres gekopieerd: exporteer eerst lokaal JSON en importeer dat online. Bezoekers hebben geen GitHub-account nodig. GitHub-beheer vereist wel een account en repositoryrechten. Hashlinks zoals `#studio` en `#wensen?id=I01` werken zonder serverroutering. De tekeningen zijn conceptueel en niet technisch goedgekeurd.

## Beheer en centrale opslag
De navigatie is Dashboard, Stakeholders en Ontwerpstudio. De beheerformulieren en Supabase-adapter zijn ingebouwd, maar er is nog geen Supabase-project gekoppeld. Beheer blijft in productie uitgeschakeld tot die koppeling en de controle van toegangsregels voltooid zijn. Zie **backend/INSTALLATIE.md** voor de eenmalige inrichting. De UI kan zonder codewijzigingen nieuwe stakeholders, wensen en gecontroleerde gespreksvoorstellen beheren nadat dit is ingericht. Lokale API-simulaties zijn geen productiebeveiligingstest.
