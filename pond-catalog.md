# pwnd — Teich-Katalog und Aufbausystem

> **pwnd wird wie „pond“ ausgesprochen.** Der Teich ist kein Menü voller Sammelobjekte, sondern ein lebendiger Ort. Jede Freischaltung verändert Wasser, Lebensraum, Bewohner oder die Wege, auf denen der Spieler Ressourcen verdient.

## 1. Die vier Ressourcen

| Ressource | Bedeutung | Hauptquelle | Hauptverwendung |
|---|---|---|---|
| **Energie** | Intelligenzpunkte / IP; misst Leistung, Lernfortschritt und strategische Qualität | Quizduell, freies Quizzen, spätere Entdeckungsaufgaben | Tiere anlocken, Strukturen bauen, Pflanzen setzen, neue Bereiche erschließen |
| **Wasser** | Lebensenergie des Teichs; macht Tierentwicklung und ökologischen Betrieb möglich | Pflege, Quellen, Aktivitäten, tägliche Teichereignisse | Versickerung und Pflanzenverbrauch ausgleichen; Tiere füttern, beruhigen, trainieren und evolvieren |
| **Luft** | Offenheit, Bewegung und gesunder Kreislauf des Teichs | Schilf, freie Ufer, Wind-/Erkundungsaktivitäten und spätere Atmosphärenereignisse | Senkt die effektiven Energie-Kosten von Handlungen |
| **Liebe** | Pflege, Bindung und Vertrauen zwischen Spieler, Tieren und Teich | Tierpflege, gelungene Interaktionen, stabile Lebensräume und fürsorgliche Ereignisse | Senkt die effektiven Wasser-Kosten der Tierentwicklung und Teichpflege |

### Ökonomische Leitregel

- **Energie zeigt, was der Spieler kann.**
- **Wasser zeigt, was der Teich tragen kann.**
- **Luft zeigt, wie frei und gesund der Teich atmet.**
- **Liebe zeigt, wie gut Spieler und Bewohner miteinander verbunden sind.**
- Energie wird für die Handlung ausgegeben: anlocken, bauen, platzieren, erkunden.
- Wasser wird für zwei klar sichtbare Zwecke ausgegeben: laufende Teichpflege sowie Tierentwicklung — füttern, beruhigen, trainieren und evolvieren.
- Luft und Liebe sind unterstützende Vorräte und werden bei der Handlung nicht verbraucht.
- Luft reduziert nur Energie-Kosten; Liebe reduziert nur Wasser-Kosten, einschließlich Tierentwicklung und laufender Teichpflege. Die Zuordnung bleibt klar lesbar.
- Strukturen und Pflanzen werden mit Energie gebaut, gesetzt und auch ausgebaut.
- Wissen allein baut keinen Lebensraum; Wasser allein erschafft keinen neuen Bewohner.
- Energie darf sinken, wenn sie ausgegeben wird. Das Energiekonto ist keine unveränderliche Rangzahl.
- Wasser darf sich im Teich sichtbar ansammeln und durch Pflege, Quellen und Aktivitäten wachsen.
- Kein Rabatt darf die jeweilige Hauptressource vollständig auf null reduzieren.

### Kostenmodifikatoren

Die Basiswerte bleiben im Katalog sichtbar; erst beim Bezahlen wird der passende unterstützende Vorrat berücksichtigt:

- `effektive Energie = aufrunden(max(Basis-Energie × (1 − Luft / 2.000), Basis-Energie × 0,5))`
- `effektives Wasser = aufrunden(max(Basis-Wasser × (1 − Liebe / 2.000), Basis-Wasser × 0,5))`

Die Wirkung ist abnehmend und bei 50 % gedeckelt. Beispiel: Ein Bau mit 60 Energie kostet bei 500 Luft 45 Energie; eine Tierentwicklung mit 20 Wasser kostet bei 500 Liebe 15 Wasser. Luft beeinflusst niemals Wasser-Kosten, Liebe niemals Energie-Kosten.

### Laufender Wasserhaushalt

Der Teich verbraucht Wasser automatisch während aktiver Spielzeit:

- **Versickerung:** Grundverbrauch, der mit der nutzbaren Teichfläche steigt.
- **Pflanzen:** zusätzlicher Verbrauch pro gesetzter Teichpflanze; eine dichte, vielfältige Bepflanzung erhöht die Pflegeanforderung.
- **Tierentwicklung:** separate, einmalige Wasserinvestitionen für neue Stufen.

Für die erste Balancing-Skizze gilt pro aktiver Minute:

`Basisverbrauch = 0,20 + (Teichgröße × 0,04) + (Pflanzenzahl × 0,08)`

Der tatsächliche Abzug wird anschließend mit dem Liebe-Modifikator reduziert und auf die kleinste sinnvolle Zeiteinheit gerundet. Bei leerem Wasser entstehen keine versteckten Schulden: Stattdessen werden wasserabhängige Entwicklungsaktionen gesperrt und der HUD zeigt klar „Teich braucht Wasser“. Während der Pause läuft kein Verbrauch; Offline-Verbrauch wird erst nach einem eigenen Balancing- und Speichermeilenstein aktiviert.

### Erwerb und Verbesserung sind getrennte Schritte

Die Kostenangaben im Katalog folgen diesem Muster:

1. **Energie-Kosten:** Der Spieler lockt einen Bewohner an, baut eine Struktur, setzt eine Pflanze oder erweitert einen Bereich.
2. **Wasser-Kosten:** Der Teich bezahlt seinen laufenden Wasserhaushalt; zusätzlich entwickelt der Spieler Tiere weiter und schaltet neue Reaktionen, Animationen oder Synergien frei.

Beispiel: Ein Frosch kann für Energie in den Teich gebracht werden. Erst mit Wasser wird der Frosch zutraulicher, reagiert auf den Spieler und kann später eine Kaulquappen-Familie anlocken. Die Froschbucht selbst wird mit Energie gebaut und ausgebaut.

## 2. Lebensräume des Teichs

Jeder Bewohner gehört zu mindestens einem Lebensraum. Neue Lebensräume sind wichtiger als bloße höhere Zahlen, weil sie neue Kombinationen ermöglichen.

| Lebensraum | Charakter | Erste Strukturen |
|---|---|---|
| **Ufer** | sicherer Einstieg, Frosch, Schnecke, Kräuter | Froschbucht, Schilfgürtel, Ufersteine |
| **Flachwasser** | Seerosen, Libellen, Kaulquappen, Kleinfische | Seerosenfeld, Laichmulde, Kiesbett |
| **Tiefwasser** | Karpfen, Molche, Muscheln, seltene Pflanzen | Karpfenkolk, Tiefenbecken, Quellzulauf |
| **Schilfzone** | Schutz, Nester, Vögel, Beobachtung | dichtes Schilf, Vogelsteg, Nistkorb |
| **Bachlauf** | Bewegung, Quellen, Wasserqualität, Wanderung | Quellzulauf, kleiner Wasserfall, Moosbrücke |
| **Waldsaum** | Schatten, Blätter, Käfer, größere Besucher | Weidenast, Schattenhain, Totholzinsel |
| **Blütenufer** | Farbe, Bestäuber, seltene Ressourcen | Wildblumenrand, Kräutergarten, Blütensteg |
| **Nachtteich** | seltene Ereignisse und leise Bewohner | Mondstein, Nachtblüten, Glühwürmchenhain |

## 3. Bewohner-Katalog

**Kostenlogik für die folgenden Tabellen:** Der erste Wert ist die Energie, die nötig ist, um den Bewohner zu entdecken und in den Teich zu bringen. Der zweite Wert ist die erste Wasserinvestition, mit der sein Lebensraum aktiviert wird. Weitere Wasserstufen verbessern danach seine Wirkung.

### 3.1 Einstiegsbewohner

| Bewohner | Lebensraum | Rolle im Spiel | Freischaltidee |
|---|---|---|---|
| **Teichfrosch** | Ufer | erster Charakter; zeigt an, dass der Teich lebt | Starter oder 1.000 Energie + 250 Wasser |
| **Posthornschnecke** | Ufer / Flachwasser | verbessert langsam die Wasserqualität | 1.020 Energie + 280 Wasser |
| **Wasserläufer** | Oberfläche | markiert ruhiges Wasser und gibt kleine tägliche Wasserboni | 1.040 Energie + 300 Wasser |
| **Kaulquappen** | Flachwasser | wachsen über mehrere Teichstufen zu Fröschen | 1.080 Energie + 340 Wasser |
| **Libelle** | Flachwasser / Blütenufer | erhöht Reaktions- und Geschwindigkeitsbelohnungen im Quiz | 1.120 Energie + 420 Wasser |

**Interaktionsbeispiel:** Der Spieler gibt Energie aus, um Kaulquappen an einer Laichmulde zu sichern. Danach investiert er Wasser in die Laichmulde. Erst dann beginnt die Entwicklung zu Fröschen und die Libelle kann den Bereich als Jagdrevier nutzen.

### 3.2 Wasserbewohner

| Bewohner | Lebensraum | Rolle im Spiel | Freischaltidee |
|---|---|---|---|
| **Elritzen-Schwarm** | Flachwasser | kleine, sichtbare Bewegung; Bonus auf Erkundungsfunde | 1.180 Energie + 450 Wasser |
| **Karausche** | Flachwasser | stabilisiert Wasserproduktion bei regelmäßiger Pflege | 1.240 Energie + 500 Wasser |
| **Karpfen** | Tiefwasser | macht tiefe Strukturen nutzbar; erhöht Speichergrenze | 1.320 Energie + 560 Wasser |
| **Teichmuschel** | Tiefwasser | filtert Wasser; senkt Pflegekosten | 1.360 Energie + 620 Wasser |
| **Molch** | Tiefwasser / Ufer | belohnt ruhige, fehlerarme Quizserien | 1.420 Energie + 680 Wasser |
| **Wasserkäfer** | Flachwasser | macht kurze Aktivitäten profitabler | 1.500 Energie + 720 Wasser |

### 3.3 Ufer- und Schilfbewohner

| Bewohner | Lebensraum | Rolle im Spiel | Freischaltidee |
|---|---|---|---|
| **Stockente** | Schilfzone | bringt gelegentlich Energie-Funde an den Ufersteg | 1.560 Energie + 780 Wasser |
| **Teichhuhn** | Schilfzone | erhöht die Chance auf Folgeereignisse | 1.620 Energie + 840 Wasser |
| **Eisvogel** | Bachlauf / Schilfzone | seltener Beobachter; verbessert seltene Wissensfunde | 1.800 Energie + 1.000 Wasser |
| **Graureiher** | Schilfzone / Tiefwasser | großer Meilenstein; schaltet Beobachtungsaufgaben frei | 2.100 Energie + 1.300 Wasser |
| **Biber** | Bachlauf / Ufer | verändert aktiv die Teichstruktur; erzeugt neue Wasserwege | 2.300 Energie + 1.600 Wasser |

### 3.4 Waldsaum und Nachtteich

| Bewohner | Lebensraum | Rolle im Spiel | Freischaltidee |
|---|---|---|---|
| **Igel** | Waldsaum | bringt kleine Energiefunde nach Pflegerunden | 1.700 Energie + 900 Wasser |
| **Feldmaus** | Waldsaum | erhöht die Chance auf Sammelmaterial | 1.580 Energie + 760 Wasser |
| **Fledermaus** | Nachtteich | macht Nachtquizze und seltene Ereignisse möglich | 2.000 Energie + 1.200 Wasser |
| **Glühwürmchen** | Nachtteich / Blütenufer | erzeugt nachts eine sanfte Wasserregeneration | 1.900 Energie + 1.100 Wasser |
| **Ringelnatter** | Schilfzone / Tiefwasser | anspruchsvoller Bewohner; belohnt zusammenhängende Lebensräume | 2.400 Energie + 1.700 Wasser |
| **Otter** | Bachlauf / Tiefwasser | Endgame-Bewohner; eröffnet soziale und spielerische Teichereignisse | 3.000 Energie + 2.400 Wasser |

### Bewohner-Designregeln

1. Kein Bewohner ist nur ein Skin: Jeder verändert mindestens eine Ressource, einen Lebensraum oder eine Aktivität.
2. Große Bewohner brauchen echte Voraussetzungen: genug Fläche, Wasserqualität und passende Strukturen.
3. Seltenheit ist nicht gleich Stärke. Ein Frosch kann für Wasserqualität wichtiger sein als ein Reiher.
4. Bewohner sollen auf dem Hub sichtbar leben: schwimmen, sitzen, fliegen, rascheln, tauchen oder nachts leuchten.
5. Keine zufällige Überladung: Der Spieler entscheidet, welche ökologische Richtung sein Teich nimmt.

## 4. Pflanzen und natürliche Elemente

| Element | Funktion | Mögliche Synergie |
|---|---|---|
| **Schilfgürtel** | Schutz und Nestfläche | Teichhuhn, Ente, Reiher |
| **Seerosenfeld** | Oberfläche und Blütenfläche | Libellen, Wasserläufer, Frösche |
| **Wasserpest** | erhöht Wasserqualität bei ausreichendem Licht | Muschel, Molch |
| **Froschlöffel** | kleine Uferpflanze; günstiger Einstieg | Froschbucht |
| **Sumpfdotterblume** | Blütenbonus und gelber Farbakzent | Libellen, Glühwürmchen |
| **Wasserminze** | Pflegebonus und Duftspur | Schnecke, Bienenereignis |
| **Hornblatt** | Unterwasserversteck | Elritzen, Kaulquappen |
| **Rohrkolben** | vertikale Schilfstruktur | Vogel- und Nachtteich-Boni |
| **Moosufer** | verbessert ruhige, natürliche Optik und Wasserstabilität | Molch, Schnecke |
| **Weidenast** | Schatten und Sitzplatz | Eisvogel, Fledermaus |
| **Wildblumenrand** | Bestäuber und Farbreichtum | Libellen, Glühwürmchen |
| **Kleeinsel** | kleine, günstige Energiechance bei Pflege | Igel, Feldmaus |
| **Nachtblüten** | nur nachts aktiv | Glühwürmchen, Fledermaus |
| **Totholzinsel** | Versteck und Beobachtungspunkt | Käfer, Molch, Igel |
| **Kiesbett** | verbessert Klarheit des Wassers | Elritzen, Wasserläufer |

## 5. Strukturen und Gebäude

Strukturen sind keine statischen Dekorationen. Tiere klicken sie sinngemäß an, nutzen sie und machen dadurch ihre Funktion sichtbar:

- Enten nutzen den **Entensteg**.
- Frösche sitzen an der **Froschbucht**.
- Reiher landen auf der **Reiherplattform**.
- Biber verändern die **Biberwerkstatt**.
- Der Eisvogel beobachtet den **Beobachtungsturm**.

Der Bau und Ausbau kostet Energie. Wasser wird nicht in Gebäude gesteckt. Die Struktur schafft stattdessen den Lebensraum, in dem Tiere mit Wasser entwickelt werden können.

### 5.1 Kernstrukturen

| Struktur | Primäre Ressource | Funktion |
|---|---|---|
| **Froschbucht** | Energie | erster Bewohnerplatz und Einstieg in die Teichbevölkerung |
| **Wasserspeicher** | Energie | erhöht die maximale Wasserkapazität |
| **Energieenes Ufer** | Energie | erhöht die Energiekapazität und macht Energie sichtbar im Hub |
| **Schilfgürtel** | Energie | schafft Schutzplätze für Uferbewohner |
| **Karpfenkolk** | Energie | schaltet Tiefwasserbewohner frei |
| **Quellzulauf** | Energie | regelmäßiger Wasserzufluss, aber Pflegebedarf |
| **Ufersteg** | Energie | schaltet Sammel- und Beobachtungsaktivitäten frei |
| **Pflegehütte** | Energie | bündelt tägliche Tierpflege und Upgrade-Auswahl |

### 5.2 Wissens- und Aktivitätsstrukturen

| Struktur | Neue Aktivität | Ressourcenprofil |
|---|---|---|
| **Fragefisch-Steg** | freies Quizzen mit Themenwahl | kleiner Energiegewinn, stabiler Wassergewinn |
| **Duellplatz am Ufer** | Quizduell gegen AI-Gegner | hoher Energiegewinn, variabler Wassergewinn |
| **Beobachtungsturm** | Muster- und Naturbeobachtung | hohe Energiechance, geringe Energiekosten |
| **Quellenarchiv** | Quellen prüfen und Aussagen sortieren | Energie für Begründungsqualität |
| **Kräutergarten** | Pflege- und Kausalitätsaufgaben | Wasserbonus bei konsistenten Entscheidungen |
| **Nachtsteg** | zeitlich begrenzte Nachtquizze | seltene Ressourcen, höhere Risiken |
| **Biberwerkstatt** | Strukturen umleiten und umbauen | Energie investieren, Wasserproduktion verbessern |
| **Teichkarte** | neue Bereiche und Mini-Biome entdecken | Exploration als dritter späterer Wasserweg |

## 6. Freischaltlogik

### Phase 0 — Ein lebendiger Anfang

- Energie: 1.000
- Wasser: 250
- Offen: Froschbucht
- Sichtbar: Frosch, erstes Schilf, eine kleine Seerose
- Aktiv: Quizduell und freies Quizzen

### Phase 1 — Ufer aufbauen

- Schilfgürtel
- Posthornschnecke
- Libelle
- Seerosenfeld
- Wasserspeicher

**Spielgefühl:** Der Spieler sieht nach wenigen Sessions eindeutig, dass sein Teich nicht mehr leer ist.

### Phase 2 — Wasser vertiefen

- Karpfenkolk
- Karpfen oder Elritzen-Schwarm
- Teichmuschel
- Quellzulauf
- Fragefisch-Steg

**Spielgefühl:** Der Teich bekommt eine zweite Ebene und die Ressourcen beginnen, sich gegenseitig zu verstärken.

### Phase 3 — Ufer bevölkern

- Vogelsteg
- Stockente oder Teichhuhn
- Wildblumenrand
- Igel
- Beobachtungsturm

**Spielgefühl:** Der Ort wirkt bewohnt und bietet mehr als nur Quizfragen.

### Phase 4 — Eigenes Ökosystem

- Eisvogel
- Biberwerkstatt
- Nachtsteg
- Glühwürmchenhain
- Quellzulauf-Ausbau

**Spielgefühl:** Der Teich bekommt eine erkennbare Identität und der Spieler entscheidet zwischen Energiefokus, Wasserfokus, Wissensfokus oder Naturfokus.

## 7. Synergie-Builds für unterschiedliche Spieler

### Der klare Teich

- Schnecke + Muschel + Kiesbett + Wasserpest
- niedrige Pflegekosten
- stabile Wasserproduktion
- weniger spektakulär, aber sehr zuverlässig

### Der Wissensgarten

- Libelle + Eisvogel + Beobachtungsturm + Quellenarchiv
- hoher Energiegewinn durch schnelle und gut begründete Antworten
- stärkerer Fokus auf Quizduell und freie Themenwahl

### Das lebendige Ufer

- Frosch + Schilf + Ente + Wildblumenrand
- mehr Bewohnerereignisse
- zusätzliche kleine Energie- und Wasserfunde
- besonders zugänglich für neue Spieler

### Der tiefe Teich

- Karpfen + Molch + Muschel + Karpfenkolk
- langsamere, aber größere Fortschrittsstufen
- belohnt fehlerarme Serien und langfristige Pflege

### Der Nachtteich

- Glühwürmchen + Fledermaus + Nachtblüten + Nachtsteg
- seltene und riskantere Aktivitäten
- hohe Varianz, starke Atmosphäre, eigene Musik später möglich

## 8. Was zuerst implementiert werden sollte

### Sofort spielbar

1. Zwei Ressourcen dauerhaft anzeigen und speichern.
2. Froschbucht als Starter-Freischaltung markieren.
3. Schilfgürtel, Libellen, Karpfenkolk und Seerosenfeld als erste kaufbare Ziele.
4. Bewohnerplätze optisch verändern, sobald ein Ziel gekauft wurde.
5. Quizduell und freies Quizzen mit unterschiedlichen Erträgen belohnen.

### Nächster Vertical Slice

1. Frosch animiert auf dem Hub.
2. Gekaufte Seerose erscheint dauerhaft in der Teichszene.
3. Schilfgürtel verändert den Teichrand.
4. Ein kleines Ereignis erscheint nach drei Aktivitäten: „Die Libelle ist zurück.“
5. Der Spieler kann einen Bewohner anklicken und seine Wirkung lesen.

### Später

- aktive Tierpflege mit Wasserkosten,
- Tages-/Nachtwechsel,
- saisonale Bewohner,
- seltene Quellereignisse,
- mehrere Teiche oder Biome,
- soziale Teichbesuche,
- Musik als optionale Atmosphäre, nicht als Kernsystem.

## 9. Leitplanken gegen Beliebigkeit

- Jede neue Kreatur braucht eine Rolle, einen Lebensraum und mindestens eine Synergie.
- Jede Struktur muss eine neue Entscheidung oder Aktivität ermöglichen.
- Kein neues Objekt nur für „mehr Content“.
- Keine künstliche Seltenheit ohne spielerische Bedeutung.
- Die erste Session muss den Teich lebendig machen; die zehnte Session muss eine Richtung zeigen.
- Energie und Wasser dürfen nicht zu zwei identischen Balken werden: Energie ist Leistung und Entscheidungskraft, Wasser ist Lebensraum und Wachstum.
