# ManualAI × IDQ QKD — Prüf- und Abnahmecheckliste

Diese Checkliste ist für eine **mögliche spätere Integration** gedacht. Sie ist keine Installationsanleitung für Clavis-XG-Hardware und kein Nachweis, dass die Voraussetzungen aktuell erfüllt sind.

## 1. Architektur und Verantwortlichkeiten

- [ ] Hosting-Standort und Betreiber des ManualAI-Backends schriftlich bestätigen.
- [ ] Standort, Betreiber und Zugangsschnittstelle der QPU bestätigen.
- [ ] Datenflussdiagramm erstellen: Browser, ManualAI-API, LLM-Provider, QPU-API, Datenbank und Backups.
- [ ] Für jeden Datenfluss Datenklasse, Zweck, Region, Transportverschlüsselung, Aufbewahrungsfrist und verantwortlichen Betreiber erfassen.
- [ ] Festlegen, welchen konkreten Link QKD absichern soll. QKD nicht als Schutz für den gesamten ManualAI-Dienst ausweisen.

## 2. Technische Eignung

- [ ] Prüfen, ob dedizierte oder multiplexfähige Glasfaser zwischen den QKD-Endpunkten verfügbar ist.
- [ ] IDQ um modellbezogene Reichweiten-, Verlustbudget- und Secret-Key-Rate-Angaben für die konkrete Strecke bitten.
- [ ] Abklären, ob Clavis XG Multiplex, vorhandene WDM-Systeme und klassische Verkehrswellenlängen miteinander kompatibel sind.
- [ ] Vorhandene Netzwerkverschlüsseler, Ethernet-/OTN-Schicht, Durchsatz, Latenz und unterstützte QKD-Key-APIs inventarisieren.
- [ ] Mit IDQ die konkrete Integration zwischen Clavis-XG-Geräten, Clarion KX/QKMS und dem gewählten Verschlüsseler schriftlich bestätigen.
- [ ] Klären, ob ManualAI direkt Schlüssel konsumiert oder — empfohlen als erste Zielarchitektur — nur verschlüsselten IP-Verkehr über Netzwerkgeräte nutzt.
- [ ] Rollen, Mandantentrennung, Key-ID-Austausch und API-Authentifizierung im QKMS-Sicherheitsbereich definieren.

## 3. Kryptografie und Ausfallverhalten

- [ ] Authentifizierung des klassischen QKD-Kanals, Geräteidentitäten und Management-APIs festlegen.
- [ ] PQC-/Hybridverfahren oder einen geeigneten vorab geteilten Schlüssel für erforderliche Authentifizierung prüfen.
- [ ] Datenverschlüsselungsverfahren und Schlüsselrotation mit Netzwerkverschlüsseler und Sicherheitsverantwortlichen abstimmen.
- [ ] Richtlinie bei leerem Schlüsselpuffer, QKD-Link-Ausfall, Wartung oder Störung definieren: kontrolliertes Failover zu genehmigter PQC/Hybrid-Kryptografie oder Blockierung.
- [ ] Downgrade-Schutz nachweisen: kein unbemerkter Fallback auf nicht genehmigte RSA-/ECDH-Verfahren.
- [ ] Schlüsselwerte aus Anwendungscode, Browsern, Protokollen, Tracing, Crashdumps und CI-Artefakten fernhalten.

## 4. Betrieb und Abnahmetests

- [ ] Physische Sicherheit, Rack-Zugriff, Tamper-Meldungen, Umgebungsüberwachung und sichere Wartung für beide QKD-Endpunkte nachweisen.
- [ ] Firmware-Signaturen, Updateprozess, Konfigurationssicherung, Rollen und Auditprotokolle überprüfen.
- [ ] Ende-zu-Ende-Test mit repräsentativem Backend–QPU-Datenverkehr durchführen; Verschlüsselung an beiden Enden verifizieren.
- [ ] Schlüsselrate, Pufferverhalten, Latenz, Durchsatz und Schlüsselrotation unter Spitzenlast messen.
- [ ] Ausfalltests durchführen: Faserunterbrechung, Schlüsselmangel, Stromausfall, QKMS-Ausfall, Verschlüsseler-Neustart und Wiederanlauf.
- [ ] Sicherstellen, dass Störung und Fallback sichtbar alarmiert, protokolliert und auditiert werden.
- [ ] Unabhängige Sicherheitsprüfung für QKD-Geräte, Managementebene und Gesamtintegration beauftragen.

## Go/No-Go-Kriterien

**Go** erst, wenn Standorte und Faser technisch bestätigt sind, kompatible Verschlüsseler und QKMS-Schnittstellen feststehen, Authentifizierung und Failover genehmigt sind und die Abnahmetests erfolgreich waren.

**No-Go für QKD** bei reinem Internet-/Cloud-Datenfluss ohne kontrollierte optische Strecke, ungeklärten Endpunkten oder fehlender Betriebsverantwortung. In diesem Fall HTTPS/TLS, PQC-Migration und sichere API-/Schlüsselverwaltung priorisieren.
