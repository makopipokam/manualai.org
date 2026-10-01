# 🐾 Find deinen perfekten Hund

Eine interaktive Web-App, bei der du einen Big Five Persönlichkeitstest machst, um den passenden Hund für dich zu finden.

## 🚀 Features

### ✅ Persönlichkeitstest
- Big Five Persönlichkeitstest mit 30 Fragen
- 5 Dimensionen: Offenheit, Gewissenhaftigkeit, Extraversion, Verträglichkeit, Neurotizismus
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

### 📚 Favoriten
- Füge Hunde zu deinen Favoriten hinzu
- Local Storage Persistenz
- Favoritenliste mit Bewertungen

### 📤 Teilen
- Teile deine Ergebnisse mit Freunden
- Social Media Integration (Twitter, Facebook, WhatsApp)
- Direkte Links zu einzelnen Hunden

### 🌓 Dark Mode
- Toggle zwischen Licht- und Dunkelmodus
- Persistente Einstellung

### 📱 PWA (Progressive Web App)
- Installierbar auf Mobilgeräten
- Offline-Funktionalität
- Service Worker für Caching
- Automatische Service-Worker-Registrierung auf HTTPS und localhost
- Enthaltene 192×192- und 512×512-PWA-Icons

### 💾 Fortschritt speichern
- Testfortschritt wird automatisch gespeichert
- Setze den Test jederzeit fort

## 🛠 Technologien

- **HTML5** - Struktur
- **CSS3** - Styling mit Variablen für Dark Mode
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
