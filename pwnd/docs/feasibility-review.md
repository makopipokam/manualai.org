# pwnd — Grundsätzliche Spielideen- und Machbarkeitsprüfung

## Kurzurteil

**pwnd ist machbar und hat einen starken eigenen Kern.** Der Kern ist aber nicht „Quiz-App mit Tieren“ und auch nicht „kleines Clash of Clans in 3D“.

Der stärkste Kern lautet:

> **Der Spieler besucht einen eigenen Teich aus der First-Person-Perspektive, baut mit Energie an seiner Umgebung und entwickelt Tiere mit Wasser. Die Tiere reagieren sichtbar auf den Spieler und auf die geschaffenen Lebensräume. Quizzen ist eine wichtige Aktivität, aber nicht das gesamte Spiel.**

Das ist eine klare, emotionale Idee. Unmachbar wird sie nur, wenn gleichzeitig folgende Produkte gebaut werden:

- First-Person-3D-Spiel
- Aufbauspiel
- Tierverhaltenssimulation
- Quizplattform
- adaptive AI
- PvP-Rating-System
- Social Game
- Musik-KI
- offene Welt
- mobile App

Das wäre zu viel für den ersten Wurf.

## 1. Was an der Idee wirklich stark ist

### 1.1 Der Teich ist ein Ort, kein Inventar

Die First-Person-Perspektive löst ein echtes Problem vieler Aufbauspiele: Der Spieler sieht nicht nur Zahlen und Karten, sondern besucht einen Ort, der sich verändert.

- Der Frosch sitzt tatsächlich an seiner Bucht.
- Die Ente nutzt tatsächlich den Steg.
- Der Spieler watet mit Gummistiefeln durch das flache Wasser.
- Fische fliehen, wenn sich die Wasseroberfläche bewegt.
- Ein Reiher bleibt nur, wenn der Lebensraum ruhig und attraktiv ist.

Das erzeugt eine stärkere Bindung als eine Liste von Freischaltungen.

### 1.2 Energie und Wasser haben eine klare Trennung

Die aktuelle Richtung ist besser als Gold/Elixier:

- **Energie** ist die Handlung: Tiere anlocken, Strukturen bauen, Pflanzen setzen, Bereiche erschließen.
- **Wasser** ist die Tierentwicklung: füttern, beruhigen, trainieren, Vertrauen und neue Verhaltensweisen entwickeln.

Diese Trennung ist verständlich, sichtbar und thematisch passend.

### 1.3 Quizzen passt als Aktivität in die Welt

Das Quiz muss nicht der gesamte Inhalt sein. Es kann eine der Tätigkeiten sein, mit denen der Spieler Energie und Wasser verdient.

Dadurch kann pwnd später organisch wachsen:

- Quizduell
- freies Quizzen
- Waten und Entdecken
- Tiere beobachten
- Teich pflegen
- Materialien sammeln
- Strukturen bauen

Das ist deutlich stärker als ein Quiz, das nur durch eine Tier-Skin dekoriert wird.

## 2. Die größten Risiken

### Risiko A — Zu viele Genres gleichzeitig

Aufbau, First-Person-Erkundung, Tier-Simulation, Quiz, PvP und AI haben jeweils eigene technische und gestalterische Anforderungen.

**Lösung:** Für den MVP nur einen Kern testen:

> Durch den Teich gehen, eine Aktivität spielen, Energie verdienen, eine Struktur bauen, ein Tier beobachten und Wasser in dieses Tier investieren.

### Risiko B — First-Person-3D ist auf Mobile anspruchsvoll

First-Person-Steuerung mit Touchscreen, Kamera, Bewegung, Interaktion, Wasseroberfläche, Tieren und guter Performance ist deutlich schwieriger als eine Weboberfläche.

**Lösung:** Zuerst einen kleinen Godot-3D-Prototypen bauen und auf echter Zielhardware testen. Keine offene Welt, keine High-End-Grafik, keine große Streaming-Welt.

### Risiko C — Tiere wirken schnell wie Dekoration

Wenn Tiere nur herumlaufen und keine spürbare Reaktion zeigen, verliert die First-Person-Idee ihren Sinn.

**Lösung:** Wenige Tiere mit guten Reaktionen statt 30 Tiere ohne Verhalten. Für den ersten Slice reichen Frosch, Fisch und Ente.

### Risiko D — Energie als Ressource und als Ranking

Wenn Energie gleichzeitig ausgebbare Währung und MMR/IP-Rating ist, wird das System unverständlich und kompetitives Spielen bestraft den Ausbau.

**Empfehlung:**

- **Energie-Bestand:** ausgebbare Ressource für Bau und Handlung.
- **Skill-Rating:** später separates, unsichtbares oder optional sichtbares Matchmaking-Rating.
- Im MVP kein Rangsystem. Erst prüfen, ob die Welt und der Loop Spaß machen.

### Risiko E — Wasser hat keine klare Quelle

Wasser darf nicht nur „die zweite Zahl“ sein.

**Lösung:** Wasser entsteht durch Tierpflege, ruhige Aktivitäten und bestimmte Teichereignisse. Es wird ausschließlich in Tiere investiert und verändert deren Verhalten sichtbar.

## 3. Die empfohlene Produktform

### Der Spieler-Loop

```text
Teich betreten
    ↓
Tiere und Umgebung beobachten
    ↓
Aktivität wählen, z. B. Quizduell
    ↓
Energie und Wasser verdienen
    ↓
Energie ausgeben: Tier anlocken / Struktur bauen / Pflanze setzen
    ↓
Wasser ausgeben: ein Tier entwickeln
    ↓
Neue Reaktion, Fähigkeit oder Aktivität erleben
    ↓
Wieder in den Teich zurückkehren
```

### Was eine Freischaltung konkret bedeutet

**Tier:**

1. Spieler entdeckt oder lockt das Tier mit Energie an.
2. Tier zieht in einen passenden Lebensraum ein.
3. Tier reagiert zunächst vorsichtig.
4. Wasser entwickelt Vertrauen und Verhalten.
5. Neue Reaktion oder Synergie wird sichtbar.

**Struktur:**

1. Spieler wählt einen Bauplan.
2. Energie wird ausgegeben.
3. Spieler platziert die Struktur in der Welt.
4. Eine kurze Bauanimation läuft.
5. Passende Tiere nutzen die Struktur.
6. Weitere Strukturstufen kosten Energie, nicht Wasser.

**Pflanze:**

1. Spieler setzt sie mit Energie.
2. Sie wächst visuell durch Zeit, Umgebung und Teichzustand.
3. Sie zieht passende Tiere an oder verändert deren Verhalten.
4. Es gibt zunächst kein eigenes Pflanzen-Upgrade-System.

## 4. Realistischer 3D-Vertical-Slice

Der erste echte Prototyp sollte absichtlich klein sein:

### Welt

- eine kleine Teichfläche von ungefähr einem Gartenbereich
- ein Uferweg
- ein flaches Wasserstück
- eine Schilfzone
- ein kleiner Gartenrand
- keine offene Welt
- keine prozedurale Welt

### Spieler

- First-Person-Bewegung
- Blickrichtung und einfache Interaktion
- Gummistiefel im flachen Wasser
- langsamere Bewegung im Wasser
- Wasserkringel und Fußgeräusche
- ein Interaktionsknopf für Gegenstände und Tiere

### Tiere

- **Frosch:** springt bei hektischer Annäherung weg, bleibt bei ruhiger Bewegung sitzen
- **Fisch:** flieht vor Schritten im Wasser und kehrt später zurück
- **Ente:** nutzt den Steg und bleibt in der Nähe, wenn sie Vertrauen entwickelt

### Strukturen

- Froschbucht
- Entensteg
- Laichmulde oder Seerosenfeld

### Ressourcen

- Energieanzeige
- Wasseranzeige
- Energie wird für Tier-Anlocken und Bauen ausgegeben
- Wasser wird ausschließlich für Tierentwicklung ausgegeben
- lokales Speichern

### Quiz-Aktivität

- zehn deterministische Fragen
- ein kurzer Quizduell-Modus
- Energie- und Wasserbelohnung nach dem Ergebnis
- zunächst regelbasierter AI-Gegner
- kein Online-PvP
- kein LLM-Zwang für den Kernloop

### Erfolgskriterium

Der Slice ist erfolgreich, wenn ein Tester nach zehn Minuten sagen kann:

1. „Ich weiß, wofür Energie ist.“
2. „Ich weiß, wofür Wasser ist.“
3. „Mein Teich fühlt sich anders an als am Anfang.“
4. „Ich möchte sehen, wie dieses Tier auf mich reagiert.“
5. „Ich weiß, was ich als Nächstes bauen oder entwickeln will.“

## 5. Technische Einschätzung

### Engine

**Godot 4 ist für diese Richtung plausibel.** Es passt zu einer kleinen, stilisierten 3D-Welt, erlaubt eine Open-Source-orientierte Architektur und bietet gute Kontrolle über Szenen, Animationen, Navigation und Mobile-Optimierung.

### Rendering

Für den Start:

- stilisierte Low-Poly- oder handgemalte Optik
- kleine Szenen
- wenige dynamische Lichter
- einfache Wasser-Shader
- baked oder sehr einfache Beleuchtung
- begrenzte Sichtweite
- keine realistische Simulation des gesamten Teichs

### Tier-KI

Nicht mit komplexem Machine Learning beginnen. Für den MVP reichen Zustandsautomaten:

```text
idle → noticed_player → curious / flee / follow → return
```

Jedes Tier braucht zunächst nur:

- bevorzugten Lebensraum
- Wahrnehmungsradius
- Reaktion auf Nähe
- Rückkehrverhalten
- Nutzung einer passenden Struktur
- zwei oder drei Entwicklungsstufen

### Datenmodell

Die Game-Engine sollte unabhängig von der 3D-Szene bleiben:

```text
PlayerState
  energy
  water
  unlockedAnimals
  unlockedStructures
  animalProgress

AnimalDefinition
  habitat
  energyCost
  waterUpgradeCosts
  reactions
  compatibleStructures

StructureDefinition
  energyCost
  habitatEffect
  compatibleAnimals
  interactionPoint
```

Die 3D-Welt stellt diese Daten dar. Sie entscheidet nicht selbst über Kosten oder Belohnungen.

## 6. Was zunächst gestrichen oder verschoben werden sollte

### Nicht im MVP

- Spotify-Anbindung
- AI-DJ und adaptive Musikbibliothek
- Online-PvP
- globales MMR-System
- mehrere Teiche
- offene Welt
- Zucht- und Vererbungssystem
- komplexe Nahrungskette
- Wetter- und Jahreszeiten-Simulation
- zehn oder mehr Tierarten
- Accounts und Cloud-Save
- Multiplayer-Besuche
- App-Store-Release

### Warum

Jedes dieser Systeme kann später sinnvoll sein. Keines beweist aber, dass der zentrale Teich-Loop funktioniert. Der MVP muss zuerst zeigen, dass Bewegung, Beobachtung, Bauen und Tierreaktionen emotional tragen.

## 7. Meine konkreten Verbesserungen an der Idee

### Verbesserung 1 — „Fangen“ als „Anlocken“ oder „Bergen“ gestalten

Der Spieler sollte Tiere nicht gewaltsam einfangen. Besser sind konkrete Naturhandlungen:

- anlocken
- beobachten
- in Sicherheit bringen
- einen Lebensraum vorbereiten
- ein Tier willkommen heißen

Das passt besser zur warmen Teichfantasie und lässt Tiere freiwillig reagieren.

### Verbesserung 2 — Reaktionen wichtiger machen als Zahlen

Ein Wasser-Upgrade sollte nicht nur `+5 %` geben. Es sollte sichtbar sein:

- Frosch bleibt länger sitzen.
- Fisch kommt näher.
- Ente folgt dem Spieler.
- Reiher kehrt schneller zurück.
- Schmetterling landet auf der gesetzten Pflanze.

Zahlen können im Hintergrund existieren, aber die Welt muss die Belohnung zeigen.

### Verbesserung 3 — Jede Struktur braucht einen Tier-Nutzer

Keine Struktur sollte nur ein Bonusgebäude sein.

- Entensteg → Ente
- Froschbucht → Frosch und Kaulquappen
- Seerosenfeld → Frosch, Libelle und Wasserläufer
- Beobachtungsturm → Reiher und Eisvogel
- Biberwerkstatt → Biber

### Verbesserung 4 — Den Quizteil als Aktivität und nicht als Identität behandeln

Die große Identität ist **der eigene lebendige Teich**. Das Quiz ist der erste starke Weg, Energie und Wasser zu verdienen. Später können andere Aktivitäten gleichwertig werden.

### Verbesserung 5 — Den ersten Teich als „Diorama zum Begehen“ bauen

Der erste 3D-Teich muss kein großes Spielgebiet sein. Ein kleiner, dicht gestalteter Garten ist besser als eine leere Welt. Qualität entsteht durch:

- Geräusche
- Tierreaktionen
- Wasserbewegung
- sichtbare Veränderungen
- gute Blickpunkte
- kurze, sinnvolle Wege

## 8. Realistische Entwicklungsreihenfolge

### Stufe 1 — Technischer 3D-Test

- First-Person-Bewegung
- kleine Wasserfläche
- Gummistiefel im Flachwasser
- drei einfache Tierkörper
- ein Tier reagiert auf Nähe

**Ziel:** Prüfen, ob sich das Begehen des Teichs gut anfühlt.

### Stufe 2 — Spielbarer Kern

- Energie und Wasser
- ein Quizduell
- Energie für eine Struktur
- Wasser für eine Tierentwicklung
- lokales Speichern

**Ziel:** Den vollständigen Loop einmal durchspielen.

### Stufe 3 — Emotionaler Vertical Slice

- drei Tiere mit unterscheidbaren Reaktionen
- zwei Strukturen
- Pflanzen und Geräusche
- sichtbare Entwicklungsstufen
- ein kleines Ereignis nach mehreren Aktivitäten

**Ziel:** Prüfen, ob Spieler freiwillig weiterbauen und wiederkommen wollen.

### Stufe 4 — Content und App-Härtung

- weitere Tiere
- bessere Touch-Steuerung
- mobile Performance
- Save-Migration
- optionaler Account
- Analytics für anonymes Playtesting

## Schlussfolgerung

**Ja, pwnd ist als Spiel machbar.** Die Idee ist sogar stärker geworden, seit die First-Person-Teichwelt dazukam.

Aber die Priorität muss lauten:

1. Teich begehbar machen.
2. Tierreaktionen fühlbar machen.
3. Energie und Wasser einfach und verständlich machen.
4. Eine Struktur bauen.
5. Ein Tier mit Wasser entwickeln.
6. Erst danach Quiz, Content und weitere Systeme vergrößern.

Wenn der kleine Teich funktioniert, kann daraus ein großes Spiel werden. Wenn der kleine Teich nicht funktioniert, werden mehr Tiere, mehr AI und mehr Systeme das Problem nicht lösen.
