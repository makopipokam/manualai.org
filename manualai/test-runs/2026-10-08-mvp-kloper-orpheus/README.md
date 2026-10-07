# ManualAI MVP – Kloper → Orpheus (Offline-Simulation)

Dieser Ordner dokumentiert den simulierten MVP-Testlauf vom 8. Oktober 2026. Er enthält:

- [`simulate.mjs`](simulate.mjs) – ruft den echten `api/manualai.js`-Handler lokal auf, ersetzt aber `fetch` durch festgelegte Provider-Fixtures.
- [`SIMULATION.md`](SIMULATION.md) – automatisch erzeugtes Protokoll mit den drei Testideen, Partituren und Beispielwerken.

## Ausführen

Vom Repository-Hauptverzeichnis aus:

```sh
node manualai/test-runs/2026-10-08-mvp-kloper-orpheus/simulate.mjs
```

Der Simulator fängt die Anthropic-SDK-Aufrufe ab und schaltet Redis-Limits für diesen Prozess aus. Es werden **keine echten Provider-, Redis-, Konto-, Wallet- oder Zahlungsdienste** angesprochen. Die Texte sind Test-Fixtures und keine Antworten eines Live-Modells.

Der Lauf prüft, dass jeder Request Kloper vor Orpheus aufruft, Orpheus die Originalidee und Klopers Partitur erhält, die API drei erfolgreiche Antworten mit der Rollenfolge `Kloper → Orpheus` zurückgibt und insgesamt sechs simulierte Modellaufrufe stattfinden.

Für einen echten Live-Test ist die separate serverseitige Provider-Konfiguration zu prüfen. Die Ergebnisse dieser Offline-Simulation belegen weder Live-Verfügbarkeit noch Modellqualität, tatsächliche Laufzeit, Kosten oder Provider-Metadaten.
