# HMN auf Celo – KI-Kontextnotiz

> **Kuratiertes, redigiertes Gedächtnis – kein wortgetreues Chatprotokoll.** Es bewahrt Projektentscheidungen und technische Fakten, aber keine internen System-/Toolnachrichten, E-Mail-Adresse, persönliche Wallet-Adresse, Seeds oder privaten Schlüssel. Zuletzt aktualisiert am 12. Oktober 2026.

## Zweck und Produkt

HMN (**Mensch-Nachweis-Token**) soll Apps und KI-Agenten gegen Bezahlung einen datensparsamen `isHuman`-Statuscheck anbieten. Die passendste Hackathon-Idee ist ein über **buy/x402** auffindbarer Dienst, bei dem Apps oder Agenten pro Prüfung zahlen. Der Nutzer möchte eine realistische Chance auf einen Celo-Hackathon-Preis, erwartet aber keine Gewinnzusage.

Die Identitätsprüfung soll über **Self Protocol** statt einer eigenen Dokumentenprüfung erfolgen. Self verarbeitet einen ZK-Beweis aus einem Mock-Passport in der Self-App; HMN speichert keine Ausweis-Klardaten. Ein HMN-Credential ist nicht übertragbar und belegt eine vorherige Self-Prüfung innerhalb des App-Scope – nicht, dass gerade jetzt ein Mensch am Gerät sitzt.

## Gesprächsverlauf und Entscheidungen

- **2. Oktober:** Ziel war, HMN für den Celo-Hackathon „Agents on Open Rails“ und besonders für „Build with buy“ vorzubereiten. Als Ausgangsmaterial dienten ein HMN-Prototyp-ZIP und ein Konzept-PDF. Der Nutzer untersagte zunächst Mainnet, Ausgaben, Hackathon-Anmeldung und Veröffentlichung eines öffentlichen Repos ohne vorherige Zustimmung.
- **2.–6. Oktober:** Der Prototyp wurde lokal auf Self Protocol und Celo Sepolia ausgerichtet, mit QR-Demo, x402-Vorschau, README, Pitch, Demoanleitung und Hackathon-Checkliste. Es wurden auch Hinweise zu Self-Tests, dem Kick-off und einem kurzen Präsentationsdeck angefragt.
- **3. Oktober:** Der Nutzer teilte eine persönliche MiniPay-Adresse und sagte, dass dort bevorzugt USDT statt CELO verwendet werden soll. Die Adresse wurde aus dieser Notiz ausgelassen; die Stablecoin-Präferenz bleibt als Kontext erhalten.
- **6.–7. Oktober:** Ein lokaler Vor-Kick-off-Snapshot wurde vorbereitet. Nach dem Kick-off wurden die auf der offiziellen Loops-House-Seite bestätigten Regeln in die Checkliste aufgenommen. Der Nutzer wählte anschließend die Vorbereitung des vollständigen Teilnahmewegs, aber mit **separater Bestätigung vor der Ausführung**.
- **8. Oktober:** Der Nutzer bat um die Erstellung eines öffentlichen GitHub-Repos und das Pushen der HMN-Dateien. Das HMN-Projekt wurde nicht veröffentlicht; sein lokales Repo hatte kein Remote. Eine lokale `.github`-CI und Pull-Request-Vorlage wurden vorbereitet.
- **10. Oktober:** Der Nutzer bat darum, den Gesprächskontext für spätere KI-Nutzung in GitHub abzulegen. Dafür wurde diese redigierte Kontextnotiz vorbereitet.
- **12. Oktober:** Der Nutzer bestimmte als Ziel-Repository `makopipokam/manualai.org`. Diese Notiz wird als eigenes HMN-Unterprojekt im bestehenden `docs/ai-context/`-Bereich geführt. Das Archivieren dieser Notiz veröffentlicht **nicht** automatisch das HMN-Quellrepo.

## Prototyp und überprüfter Stand

- Die ältere issuer-signierte Implementierung (`HumanCredential.sol`) bleibt als Legacy-/Regressionsteil erhalten.
- Die Celo-Variante `SelfHumanCredential.sol` nutzt Selfs Hub-Callback, einen app-spezifischen Nullifier und einen separaten Claim durch die im Proof genannte Wallet. Credentials laufen nach 365 Tagen ab; Recovery erfordert einen neuen Self-Proof.
- Zielnetz des Prototyps ist **Celo Sepolia**, Chain-ID `11142220`. Die Sepolia-Registry ist `0x15cf2a6c1213EEd37EFa2AF36E9b41fAdF3e29A8`; die Beispiel-App `HumanPoll` ist `0xCf335D6a3ab796Ec08E644251Dd7f51fb481c08B`; Self Hub V2 ist `0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74`. Config-ID und Transaktionslinks stehen in der Deployment-Dokumentation des HMN-Projekts.
- **40 Foundry-Tests bestanden**; Self-Unit-Tests verwenden einen Mock-Hub und beweisen nicht die kryptografische Prüfung eines echten Self-Proofs.
- Die Self-QR-Demo baut. Ein echter Self-Mock-Pass mit Handy und Self-App wurde noch nicht end-to-end durchgeführt.
- Eine x402-API `GET /v1/is-human?address=...` ist für Sepolia vorbereitet. Sie kann eine `402 Payment Required`-Anforderung zeigen. Echte x402-Abwicklung wurde nicht durchgeführt; sie benötigt Facilitator-Zugang und Test-USDC.
- **HMN ist nicht bei buy gelistet.** Die vorhandene x402-Demo ist keine bestätigte buy-Integration.
- Selfs veröffentlichter Integrationspfad wurde in den verwendeten Unterlagen als „Legacy“ bezeichnet; vor weiterer Integration oder Abgabe aktuelle Self-Dokumentation und Adressen erneut prüfen.
- Prototyp nicht sicherheitsgeprüft; kein Mainnet-Deployment.

## Agents on Open Rails – verifizierter Stand

Offizielle Quelle: [Loops House – Agents on Open Rails](https://www.loops.house/agents-on-open-rails), zuletzt geprüft am 7. Oktober 2026. Kick-off: [CeloDevs-X-Ankündigung](https://x.com/CeloDevs/status/2106021545999258063), [Aufzeichnung](https://www.youtube.com/watch?v=ik4_h2hhDME).

- Beste HMN-Passung: **Build with buy**; laut Eventseite 1.000 US-Dollar über fünf Projekte. Das Gesamtpreisgeld des Events wurde mit 5.000 US-Dollar beworben. Preise sind nicht garantiert.
- Bei Anmeldung ist ein **öffentliches GitHub-Repo** erforderlich; es muss bis zur Bewertung erreichbar bleiben.
- **Celo Mainnet only**; Testnet-Verweise im Repo sind erlaubt. Sepolia-Aktivität allein erfüllt die Mainnet-Regel nicht.
- Eine **ERC-8004-Agent-ID** ist für jeden Track Pflicht.
- **ERC-8021-Attribution** muss an jede relevante Transaktion angehängt werden, bevor sie gesendet wird; rückwirkend lässt sie sich nicht ergänzen.
- Code muss während des Hackathons geschrieben werden. Der lokale Vorab-Snapshot `947cedd` ist ausdrücklich **keine** Hackathon-Leistung.
- Für „Build with buy“ zählen Problem und Integrationstiefe: verifizierte bezahlte Aufrufe von getaggten Wallets an Dienste, die das Projekt nicht kontrolliert, und das dadurch erzeugte Wachstum. Unabhängige Nutzer sind eine Qualifikation; künstliche Billig-Aufrufe/Farming zählen nicht.
- Eine unabhängige Wallet gehört nicht dem Team, wurde nicht zuerst vom Team/Hauptgeldgeber finanziert und hatte schon vor dem Hackathon eigene Celo-Aktivität. Neue Nutzer dürfen trotzdem onboarded werden; sie sind dadurch nicht automatisch „unabhängige Nutzer“ im Sinne dieser Definition.
- Gas, das ein Projekt-Relayer bezahlt, zählt nicht als eigener Beitrag; Nutzer-Signaturen/Autorisierungen können trotzdem gezählt werden. Gas-/Relayer-Architektur offenlegen.
- Anmeldung und Einreichung schließen laut Eventseite am **9. November 2026, 09:00 UTC**; Gewinnerankündigung am 13. November 2026.
- Das Kick-off zeigte den Loops-Befehl `npx loopshouse add agents-on-open-rails`. Er wurde in dieser Unterhaltung **nicht** ausgeführt. Exakte Formularfelder waren auf der öffentlichen Eventseite nicht vollständig aufgelistet; ältere Telegram-/Wallet-Feldangaben stammten vom Vorgänger und dürfen nicht ungeprüft übernommen werden.

## Nutzerpräferenzen und Freigabegrenzen

- Antwortsprache Deutsch; möglichst kurz und einfach.
- Niemals nach Seed, Wiederherstellungsphrase oder privatem Schlüssel fragen oder diese speichern.
- Der Nutzer bevorzugt **USDT/Stablecoin-Gebühren** gegenüber CELO, sofern technisch unterstützt. Celo dokumentiert Fee Abstraction in Stablecoins; konkrete Fee-Currency-/Adapter-Unterstützung muss vor Verwendung geprüft werden. Gebühren bleiben reale Ausgaben.
- Für das Celo-Projekt galt zunächst: kein Mainnet, keine Ausgaben, keine Hackathon-Anmeldung und kein öffentliches Repo ohne vorherige Zustimmung. Danach erlaubte der Nutzer die Vorbereitung des vollständigen Teilnahmewegs, aber ausdrücklich mit **separater Bestätigung vor der Ausführung**.
- Eine frühere Bitte, ein öffentliches HMN-Repo zu erstellen und zu pushen, ist nicht als erledigt zu behandeln: am 12. Oktober hatte das lokale HMN-Repo weiterhin kein Remote und war nicht veröffentlicht.
- Die persönliche MiniPay-Adresse und E-Mail wurden bewusst nicht in diese für mögliche Veröffentlichung gedachte Notiz übernommen.

## Arbeitsstand und Ablage

- Lokales HMN-Repo: Arbeitsbranch `hackathon/build-with-buy`; Vorab-Commit `947cedd`; kein Remote.
- `.github/workflows/ci.yml` und `.github/PULL_REQUEST_TEMPLATE.md` wurden lokal angelegt. CI führt Foundry-Tests und den Self-Demo-Build aus; sie enthält keinen Deploy-Schritt.
- Hackathon-Checkliste ist nach Kick-off aktualisiert. Diese Änderungen und `.github/` waren zuletzt lokal/uncommittet.
- Für neue Commits im HMN-Repo ist noch eine echte GitHub-Autorenidentität nötig; der Baseline-Commit verwendet eine neutrale Platzhalter-Identität.
- Keine Hackathon-Registrierung, keine Veröffentlichung des HMN-Quellrepos, kein Mainnet-Deploy und keine echte Zahlung als erledigt behaupten.
- **Ziel dieser Kontextnotiz:** `makopipokam/manualai.org`, unter `docs/ai-context/hmn/`. Sie ergänzt die bestehende manualAI-Chronik als eigenes HMN-Unterprojekt und überschreibt keine andere Gesprächsdatei.
- Diese Datei ist eine redigierte, sachliche Zusammenfassung; ein rohes Protokoll mit privaten Kennungen oder internen Nachrichten ist nicht enthalten.

## Quellen

- [Loops House – offizielle Hackathonregeln und Bewertung](https://www.loops.house/agents-on-open-rails)
- [Celo Docs – Self Protocol](https://docs.celo.org/build-on-celo/build-with-self)
- [Self Docs – deployed contracts](https://docs.self.xyz/docs/self-pass/contracts/deployed-contracts)
- [Celo Docs – x402](https://docs.celo.org/build-on-celo/build-with-ai/x402)
- [Celo Docs – Agenten und Stablecoin-Gebühren](https://docs.celo.org/build-on-celo/build-with-ai/overview)
