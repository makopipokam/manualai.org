# pwnd — Vier-Ressourcen-System

Die Web-Beta nutzt vier dauerhaft gespeicherte Ressourcen. Sie ersetzen die frühere Gold-/Elixier-Anzeige vollständig.

| Ressource | Bedeutung | Startwert | Gewinn im Quiz | Funktion im Teich |
|---|---:|---:|---|---|
| **Energie** | Entscheidungskraft und Fokus | 1000 | Rating-Veränderung aus Duellergebnis, Genauigkeit, Schwierigkeit und Tempo | Gibt an, wie viel Gestaltungs- und Handlungskraft der Teich hat. |
| **Wasser** | Wachstum und lebendiger Lebensraum | 250 | Basisbelohnung, Genauigkeit und Sieg | Versorgt Bewohner und den Teich. |
| **Luft** | Bewegung, Offenheit und Aktivität | 120 | Genauigkeit und schnelle korrekte Antworten | Macht Raum für Wind, Flug, Leichtigkeit und neue Bewegungen. |
| **Liebe** | Bindung, Vertrauen und Pflege | 60 | Genauigkeit, Combo und Sieg | Zeigt die Beziehung zwischen dem Spieler, dem Teich und seinen Bewohnern. |

## Regeln

- Ein Quizabschluss schreibt **Wasser, Luft und Liebe** als positive, deterministische Belohnungen gut.
- **Energie** nutzt weiter den bestehenden Rating-Algorithmus; sie kann sich mit dem Duellergebnis erhöhen oder verringern.
- Freies Quizzen erzeugt verlässliche Ressourcen. Erfolgreiche Duelle belohnen Wasser, Luft und Liebe stärker.
- Jede Wachstumsfreischaltung prüft alle vier Ressourcen. Dadurch entsteht kein einzelner dominanter Wert.
- Bestehende lokale Spielstände werden beim ersten Laden migriert: `ip` wird zu Energie, `elixir` zu Wasser; Luft und Liebe starten mit den neuen Standardwerten.
- Das gespeicherte Profil verwendet `resourceVersion: 2`, damit zukünftige Änderungen am Ressourcenschema eindeutig migriert werden können.
