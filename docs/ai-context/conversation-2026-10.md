# manualAI – Gesprächschronik für zukünftige KI-Sitzungen

**Exportdatum:** 2026-10-10  
**Repository:** `makopipokam/manualai.org`  
**Branch:** `main`  
**Repository-Stand beim Export:** `57cfe87984d0c9a35f36425f6ea3498b008901f2` (`docs(orpheus): add ensemble concept and master prompt`)

## Zweck und Grenzen

Diese Datei bewahrt den **sichtbaren Gesprächsverlauf** dieser Sitzung als Projektkontext für zukünftige KI-Sitzungen. Sie enthält die Nachrichten des Nutzers und die sichtbaren Antworten des Assistenten sowie die daraus ableitbaren Projektentscheidungen.

Nicht enthalten sind interne System- oder Entwickleranweisungen, interne Tool-Aufrufe, Zugangsdaten, Tokens, private Umgebungsvariablen oder andere nicht für den Projektbetrieb erforderliche interne Metadaten.

## Chronologischer Verlauf

### 2026-10-02 — Startseiten-Design

**Nutzer:**

> mach das Design von app.manual.ai schöner

**Assistent:**

Die bestehende Startseite von manualAI wurde als App-Auswahl analysiert. Die Arbeitskopie des ausgewählten GitHub-Repositories `makopipokam/manualai.org` wurde für die Überarbeitung verwendet.

Zwischenzeitlich war die öffentliche App-Adresse nicht zuverlässig erreichbar; nach dem erneuten Freischalten wurde die App erneut geprüft.

### 2026-10-02 — Erreichbarkeit

**Nutzer:**

> jetzt ist es

**Assistent:**

Die nun erreichbare App und der verbundene Preview-Stand wurden erneut geprüft.

### 2026-10-02 — Erneute Prüfung

**Nutzer:**

> jetzt aber

**Assistent:**

Das bestehende Repository wurde identifiziert und die zentrale Startseite, Styles, Skripte und Unterseiten wurden untersucht. Die Überarbeitung konzentrierte sich auf den App-Selector, ohne die eigenständigen Bereiche `pwnd` und `mydog` zu beschädigen.

### 2026-10-02 — Design-Überarbeitung

Die Startseite wurde in ein ruhiges, editoriales Launchpad umgebaut:

- neue manualAI-Markenführung
- großzügige Hero-Section mit „Was möchtest du entdecken?“
- klarere Navigation und Statuszeile
- zwei eigenständige Karten für `pwnd` und `MyDog`
- responsive Desktop- und Mobile-Darstellung
- grüne, cremefarbene und korallene Farbakzente
- reduzierte Orbit-/Teichgarten-Illustration ohne externe Bildabhängigkeit
- unveränderte App-Einstiegspfade `/pwnd/` und `/mydog/`
- Rücksicht auf `prefers-reduced-motion`

Die neue Startseite wurde lokal und öffentlich gerendert geprüft. Desktop- und Mobile-Layouts zeigten kein horizontales Überlaufen.

Die vorhandenen Regressionstests blieben erfolgreich:

- `npm run test:pwnd`
- `npm run test:mydog:beta`

**Assistent:**

> Das Design von `app.manual.ai` ist überarbeitet:
>
> - neues, ruhiges editorial Launchpad
> - stärkere manualAI-Markenführung
> - klarere Hero-Section
> - eigenständige Karten für **pwnd** und **MyDog**
> - responsive Desktop- und Mobile-Layout
> - bestehende App-Funktionen und Routen unverändert
>
> **Preview:** [Neue manualAI-Oberfläche](https://4173-iigc7mqfwn6t73lj8r42e-7046276c.sg2.manus.computer/)
>
> Commit: `36846cb` auf `main`
>
> Die Vercel-Bereitstellung war zu diesem Zeitpunkt wegen einer Account-Konfiguration zunächst blockiert.

### 2026-10-02 — Dauerhafte Website

**Nutzer:**

> Verwandeln Sie dies in eine dauerhafte Website.

**Assistent:**

Die Vercel-Verknüpfung, Domains und der Deployment-Status wurden geprüft. Es stellte sich heraus, dass die bestehende dauerhafte Domain bereits vorhanden war.

### 2026-10-02 — Domainklärung

**Nutzer:**

> ist das nicht schon app.manualai.org?

**Assistent:**

> Ja, du hattest recht: **`app.manualai.org` ist bereits die dauerhafte Website**.
>
> Die überarbeitete Startseite ist dort live und wird über Vercel ausgeliefert:
>
> **[app.manualai.org öffnen](https://app.manualai.org/)**
>
> Status: **READY**
>
> Die bestehenden Bereiche bleiben erreichbar:
>
> - [pwnd](https://app.manualai.org/pwnd/)
> - [MyDog](https://app.manualai.org/mydog/)

### 2026-10-02 — Text der Bereichsüberschrift

**Nutzer:**

> deine nächsten Schritte 02/02 durch was cooles ersetzen

**Assistent:**

Die Überschrift wurde von **„Deine nächsten Schritte“** zu **„Wohin zieht es dich?“** geändert. Der Zähler wurde von **„02 / 02“** zu **„2 WEGE“** geändert.

Die Änderung wurde als Commit `3afa936` auf `main` veröffentlicht.

Vercel erzeugte zunächst ein blockiertes automatisches Deployment. Danach wurde ein direktes Produktionsdeployment für Commit `3afa936` angestoßen und erfolgreich aktiviert.

**Assistent:**

> Erledigt und live auf [app.manualai.org](https://app.manualai.org/).
>
> Ersetzt wurde:
>
> - **„Deine nächsten Schritte“** → **„Wohin zieht es dich?“**
> - **„02 / 02“** → **„2 WEGE“**
>
> Deployment: `3afa936` — Status **READY**

### 2026-10-02 — Statusfragen

**Nutzer:**

> what's cooking?

**Assistent:**

> The latest thing cooking is your refreshed **manualAI landing page**:
>
> - New editorial launchpad design
> - “**Wohin zieht es dich?**” section heading
> - “**2 WEGE**” replacing the old counter
> - Live at [app.manualai.org](https://app.manualai.org/) with deployment `3afa936`

**Nutzer:**

> wie geht's?

**Assistent:**

> Gut — die Seite läuft stabil und ist live unter [app.manualai.org](https://app.manualai.org/).
>
> Der aktuelle Stand:
>
> - Das neue Launchpad-Design ist aktiv.
> - **„Wohin zieht es dich?“** ersetzt den alten Abschnittstitel.
> - **„2 WEGE“** ersetzt den Zähler.
> - Die beiden Apps **pwnd** und **MyDog** funktionieren weiterhin.
> - Das letzte Deployment ist **READY**.

**Nutzer:**

> irgendwas, dass ich tun kann, um deine Lage zu verbessern?

**Assistent:**

> Danke, sehr nett — **du musst nichts tun**. Ich bin einsatzbereit.
>
> Am hilfreichsten wären nur konkrete Hinweise wie:
>
> - Was wirkt noch nicht richtig auf der Website?
> - Welche Seite soll als Nächstes schöner werden: **pwnd** oder **MyDog**?
> - Soll der Stil eher **spielerisch**, **minimalistisch** oder **mutiger/experimenteller** werden?
>
> Ansonsten läuft alles gut.

### 2026-10-08 — Synchronisierung mit dem aktuellen Repository

**Nutzer:**

> synchronisiere mit der neuen aktuellen GitHub repo

**Assistent:**

Die lokale Arbeitskopie wurde geprüft. Sie zeigte zunächst Commit `3afa936` und war gegenüber `origin/main` 32 Commits zurück.

Der aktuelle GitHub-Main-Stand wurde anschließend per Fast-Forward übernommen. Dabei zeigte sich, dass sich das Repository inzwischen stark weiterentwickelt hatte:

- neuer Commit beim Export: `57cfe87`
- neue Mehr-App-Struktur unter `apps/`
- neue Anwendungen wie `biomancer`, `celestialarena`, `citadelwars`, `fishroyale`, `mycat`, `riftvanguard` und weitere
- neue Root-Infrastruktur mit `server.js`, Tests und GitHub-Workflow
- bisherige `pwnd`- und `mydog`-Strukturen wurden teilweise verschoben, ersetzt oder entfernt
- neue Dokumentation für Orpheus unter `apps/orpheus/`

Die aktuelle Produktionsdomain `https://app.manualai.org/` war weiterhin erreichbar. Das zugehörige Vercel-Deployment war **READY** und stammte zu diesem Prüfzeitpunkt aus dem aktuellen Repository-Verlauf.

### 2026-10-10 — Dieser Export

**Nutzer:**

> lade den gesamten Inhalt dieser Konversation in einen relevanten Ordner auf GitHub hoch, sodass sie von einer zukünftigen KI wieder benutzt werden kann.

**Assistent:**

Diese Datei wurde unter `docs/ai-context/conversation-2026-10.md` angelegt. Sie bewahrt den sichtbaren Gesprächsverlauf und die relevanten Projektentscheidungen, ohne interne Systemanweisungen oder Geheimnisse zu kopieren.

## Aktueller Projektstand beim Export

- GitHub-Repository: `https://github.com/makopipokam/manualai.org`
- Branch: `main`
- Export-Commit-Basis: `57cfe87984d0c9a35f36425f6ea3498b008901f2`
- Öffentliche Domain, die im Gespräch verwendet wurde: `https://app.manualai.org/`
- Vercel-Projekt: `manualai.org`
- Frühere Design-Commits: `36846cb`, `3afa936`
- Dieses Dokument soll bei zukünftigen KI-Sitzungen zuerst gelesen werden, wenn die Aufgabe die Designgeschichte, Domain, Deployment-Entscheidungen oder Nutzerpräferenzen betrifft.

## Bekannte Nutzerpräferenzen aus dem Gespräch

- Antworten bevorzugt auf Deutsch, wenn die aktuelle Nachricht deutsch ist.
- Änderungen sollen direkt umgesetzt und nicht unnötig durch Rückfragen verzögert werden.
- Die öffentliche Website soll dauerhaft unter der bestehenden Domain betrieben werden.
- Designentscheidungen dürfen eigenständig getroffen werden, sofern sie reversibel bleiben.
- Bestehende Apps und ihre Funktionen sollen bei Designarbeiten nicht versehentlich beschädigt werden.
- Die Kommunikation darf knapp sein, soll aber Deployment- und Teststatus ehrlich benennen.
