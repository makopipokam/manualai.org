# Die TeeReis/ReisTee-Dispensary

Konzept einer großen runden Dispensary mit UFO-/Raumschiff-Anmutung: Das trichterförmige Dach verbindet PV-Flächen mit getrennt geführter Regenwassersammlung. Im Inneren liegen bis zu 108 getrennte Kräuterkassetten; nach außen kann ein geschlossener Ausgabering mit **maximal 108 Stellen** führen. Kleine Kochzellen starten nur bei plausibler Nachfrage und geben Teereis sowie Reistee frisch aus.

> **Status: Vorstudie.** Keine Bau-, Lebensmittel-, Anlagen- oder Standortfreigabe. Die Szenariorechnungen sind keine Leistungs- oder Wirtschaftlichkeitszusage.

## Einstieg

- [Technisches Konzeptpapier](konzept.md) – Forschung, Systementwurf, Prozess, Wasser- und Lebensmittelsicherheit, Szenarien, Risiken und Quellen
- [Teereis-Seitentext](../tearice/dispensary/index.md)
- [Reistee-Seitentext](../ricetea/dispensary/index.md)

## Visualisierungen

| Vorschau | Quelldatei / Beschreibung |
|---|---|
| [Außenansicht](visuals/dispensary-exterior.png) | Konzeptstudie der runden Station mit Trichterdach und Außenring |
| [Schnittdarstellung](visuals/dispensary-cutaway.png) | Konzeptueller Innenaufbau mit Kochzellen und Kräuterbereich |
| [Schemazeichnung](visuals/architecture.png) | Beschriftete Schnitt- und Draufsicht; [SVG-Quelle](visuals/architecture.svg) |
| [Prozessablauf](visuals/process-flow.png) | Bedarfsgetakteter Kochzyklus; [Mermaid-Quelle](visuals/process-flow.mmd) |

Die Zeichnungen sind konzeptionell und nicht maßstäblich. Der Python-Generator der Schemazeichnung liegt unter [`visuals/draw_schematic.py`](visuals/draw_schematic.py).

## Prinzipien des Vorentwurfs

1. Nur Reis, Wasser und genau eine ausgewählte Kräutersorte je Kochzyklus.
2. Nachfrage bestimmt den Start und die Losgröße; kein unkontrolliertes Vorkochen für Vorrat.
3. Reis wird frisch gegart; Teereis und Reistee sind zwei Outputs derselben Charge.
4. Regenwasser wird vor dem Einsatz als Kochwasser passend aufbereitet und regelmäßig geprüft.
5. Maximal 108 Kräutersorten und maximal 108 Ausgabestellen; eine Pilotanlage kann weniger Module verwenden.
6. Sichere Auslegung erfordert Standortdaten, Prototypversuche, Lebensmittelhygiene-/HACCP-Prüfung und lokale Bau-/Anlagenfreigaben.
