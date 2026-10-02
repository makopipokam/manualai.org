# 🐾 Finde passende Hundevorschläge

Eine experimentelle Web-App, bei der du einen Big-Five-Persönlichkeitstest machst und passende Hundevorschläge entdeckst. Die Sterne sind eine spielerische Orientierung, keine tiermedizinische oder wissenschaftliche Eignungsdiagnose.

## 🚀 Features

### ✅ Persönlichkeitstest
- Big Five Persönlichkeitstest mit 30 Fragen
- 5 Dimensionen: Offenheit, Gewissenhaftigkeit, Extraversion, Verträglichkeit, Neurotizismus
- Fünfstufige numerische Antwortskala von 1 bis 5
- Antwortwerte werden als 0, 25, 50, 75 oder 100 Prozent in die Auswertung übernommen
- Individuelle Auswertung und Hundematching

### 🐕 Hunderassen
- 18 verschiedene Hunderassen mit detaillierten Profilen
- Bilder, Beschreibungen und Charaktereigenschaften
- Persönlichkeitsbasiertes Matching

### ⭐ Bewertungssystem
- Sterne-Bewertung (1-5) für verschiedene Kriterien
- Energielevel, Pflegebedarf, Familientauglichkeit, Trainierbarkeit, Gesundheit
- Gesamtbewertung pro Hund

### 💬 Interaktiver Chat
- Chat mit jedem Hund
- Schnellauswahl-Buttons für häufige Fragen
- Individuelle Antworten pro Hunderasse
- Nutzereingaben werden als Text und nicht als HTML gerendert

### 📚 Favoriten
- Füge Hunde zu deinen Favoriten hinzu
- Local Storage Persistenz
- Favoritenliste mit Bewertungen

### 📤 Teilen
- Teile den aktuellen Hundevorschlag direkt über die native Web Share API auf Mobilgeräten
- Erstelle ein personalisiertes Share-Bild mit dem Foto, Namen, Rasse und Eignungswert des Hundes
- Wähle eines von sechs Rassefotos und passe den kurzen Bildtext an
- Speichere das Share-Bild als PNG oder teile es als Dateianhang über kompatible native Share-Sheets
- Link kopieren als Fallback für Desktop und nicht unterstützte Browser
- Social-Media-Fallbacks für X/Twitter, Facebook und WhatsApp
- Direkte, rassespezifische Links zu einzelnen Hunden (`?dog=<id>`)

### 📱 PWA (Progressive Web App)
- Installierbar auf Mobilgeräten
- Offline-App-Shell nach einem erfolgreichen Online-Besuch
- App-Dateien werden **network-first** geladen: Online gibt es immer den aktuellen Stand, der Cache dient nur als Offline-Fallback
- Bereits geladene Hundefotos liegen in einem begrenzten Runtime-Cache (max. 160 Fotos)
- Automatische Service-Worker-Registrierung auf HTTPS und localhost
- Enthaltene 192×192- und 512×512-PWA-Icons

**Release-Hinweis:** `index.html` lädt `style.css`, `data.js` und `script.js` mit einem gemeinsamen `?v=`-Token. Bei Änderungen an diesen Dateien Token **und** `STATIC_CACHE` in `sw.js` erhöhen; der Regressionstest prüft beides.

### 💾 Fortschritt speichern
- Testfortschritt wird automatisch gespeichert
- Unvollständiger Test kann nach Reload fortgesetzt werden
- Bereits beantwortete Fragen bleiben bei Zurück/Weiter auswählbar

## 🛠 Technologien

- **HTML5** - Struktur
- **CSS3** - Responsives Styling mit Variablen
- **JavaScript (ES6+)** - Logik und Interaktivität
- **Local Storage** - Datenpersistenz
- **Service Worker** - PWA Unterstützung
- **Manifest.json** - PWA Konfiguration

## 📁 Dateistruktur

```
mydog/
├── index.html          # Haupt-HTML
├── style.css           # CSS Stile
├── script.js           # JavaScript Logik
├── data.js             # Daten (Fragen, Hunde, Antworten)
├── manifest.json       # PWA Manifest
├── sw.js               # Service Worker
└── README.md           # Diese Datei
```

## 🎯 Nutzung

### Entwicklung
1. Klone das Repository
2. Öffne `mydog/index.html` in einem Browser
3. Teste die App lokal

### Deployment
Die App wird gemeinsam mit dem Repository deployed und ist unter `/mydog/` erreichbar. Die Vercel-Konfiguration und die App-Auswahl liegen bewusst im Repository-Root; die eigentlichen MyDog-Dateien bleiben vollständig in diesem Ordner.

Für eine lokale Vorschau genügt ein statischer Server im Repository-Root, zum Beispiel:

```bash
python3 -m http.server 3000
```

Danach ist die App unter `http://localhost:3000/mydog/` erreichbar.

### Beta-Test-Checkliste

Automatisierter Browser-Regressionstest für Desktop und mobiles Portrait:

```bash
npm run test:mydog:beta
```

Der Test prüft reproduzierbar:

- alle 30 Fragen mit allen fünf Likert-Werten (1–5)
- numerische Auswahl, Fortschritt sowie Zurück/Weiter inklusive gespeicherter Navigation
- Fortsetzen eines unvollständigen Tests nach einem Reload
- Ergebnisberechnung inklusive erwarteter OCEAN-Richtung
- Ergebnisdarstellung und direkter Rasseprofil-Link ohne persönlichen Score
- Favoriten speichern, entfernen und Favoritenübersicht
- Chat-Zugriff und sichere Darstellung von Nutzereingaben
- network-first Service Worker, begrenzter Foto-Cache und einheitliches `?v=`-Release-Token
- sechs unterschiedliche Fotos pro Rasse, die keine andere Rasse verwendet
- nachladende Galerie-Vorschaubilder und keine doppelte Rassenzeile, wenn Rasse und Name identisch sind
- Teilen-Dialog: Fokus wandert hinein, Esc schließt, Fokus kehrt zum Teilen-Button zurück
- „Test neu machen“ inklusive Löschen der alten Antworten
- mobile Portrait- und Desktop-Viewport-Ausführung

Vor einem breiteren Beta-Test zusätzlich auf echten Geräten prüfen:

- Safe Area/Notch, Scrollverhalten und Touch-Ziele in iOS Safari und Android Chrome
- PWA-Installation, Offline-App-Shell, Service-Worker-Update und Browser-Zurück-Navigation
- lokale Speicherung nach App-Neustart sowie Verhalten bei privatem Browsing

### PWA Installation
1. Öffne die App in Chrome auf einem Mobilgerät
2. Tippe auf "Zum Startbildschirm hinzufügen"
3. Die App wird wie eine native App installiert

## 🐛 Bugs & Verbesserungen

- [ ] Filterfunktion für Hunde nach Kriterien
- [ ] Suche nach Hunderassen
- [ ] Mehr Bilder pro Hund
- [ ] Soundeffekte
- [ ] Animierte Hundebilder
- [ ] Statistik über häufigste Persönlichkeitstypen

## 📊 Hunderassen

### Aktuell verfügbar:
1. Labrador Retriever
2. Golden Retriever
3. Border Collie
4. Dackel (Teckel)
5. Französische Bulldogge
6. Beagle
7. Malteser
8. Deutscher Schäferhund
9. Pudel
10. Chihuahua
11. Australian Shepherd
12. Cavalier King Charles Spaniel
13. Berger Picard
14. Berner Sennenhund
15. Shiba Inu
16. Sibirischer Husky
17. Dalmatiner
18. Boxer

### Geplant:
- Berner Sennenhund
- Shiba Inu
- Husky
- Dalmatiner
- Boxer
- Und viele mehr...

## 🤝 Mitwirken

1. Fork das Repository
2. Erstelle einen Feature Branch (`git checkout -b feature/neues-feature`)
3. Commit deine Änderungen (`git commit -m 'Neues Feature hinzugefügt'`)
4. Push zum Branch (`git push origin feature/neues-feature`)
5. Erstelle einen Pull Request

## 📄 Lizenz

Dieses Projekt ist Open Source und kann frei verwendet, modifiziert und verteilt werden.

## 📬 Kontakt

Für Fragen oder Vorschläge: [GitHub Repository](https://github.com/makopipokam/manualai.org)
