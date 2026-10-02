# MyDog Android – Trusted Web Activity

Dieses Verzeichnis enthält die vorbereitete Bubblewrap-Konfiguration für eine Android-App, die `https://app.manualai.org/mydog/` als Trusted Web Activity öffnet. Die Web-App bleibt die gemeinsame Produktquelle; die Android-Hülle enthält keine zweite Kopie der MyDog-Logik.

## Status

Die Konfiguration ist vorbereitet. Am 02.10.2026 wurde nach Zustimmung zur Android-SDK-Lizenz ein **signiertes AAB (Version Code 1, Target API 36)** und ein Test-APK erzeugt und geprüft. Diese Dateien sowie der Upload-Key liegen privat **außerhalb des Repositorys**; der Android-Quellstand des AAB ist Commit `cdd557d`. **Noch nicht erfolgt:** Play-Console-Upload, Einrichtung des Play-App-Signing-Zertifikats in den Digital Asset Links und Test auf einem echten Android-Gerät. Wer den Build auf einer anderen Maschine reproduziert, muss die SDK-Lizenz dort selbst akzeptieren und den privaten Upload-Key sicher bereitstellen.

Die [MyDog-Datenschutzerklärung](../mydog/legal/privacy.html) und das [MyDog-Impressum](../mydog/legal/impressum.html) nennen PICARDs Zentrale nach deren [offiziellem Impressum](https://picard-fashion.com/pages/impressum). Diese Dateien sind im Android-Branch vorbereitet, aber **nicht automatisch auf der Produktionsdomain veröffentlicht**. Vor ihrer Verwendung als Play-Console-URL muss PICARD die Betreiberrolle, Datenschutzkontakte und Vercel-Verarbeitung rechtlich freigeben; erst nach gesonderter Veröffentlichung muss die HTTPS-URL tatsächlich erreichbar sein. Details und Quellenabweichungen stehen in [MyDogs README](../mydog/README.md#android--offizieller-closed-test).

## Einmalige Vorbereitung auf einer Android-Build-Maschine

1. Node.js, JDK 17, Android SDK und die für das aktuelle Bubblewrap erforderlichen SDK Build Tools installieren.
2. Android-SDK-Lizenzen im Android Studio/SDK Manager persönlich akzeptieren.
3. Bubblewrap installieren oder per `npx` ausführen.
4. Eine **eigene Upload-Keystore-Datei** außerhalb dieses Repositorys anlegen. Niemals Passwörter oder die `.jks`-Datei committen.
5. Den Pfad und Alias in `twa-manifest.json` anpassen.

```bash
npx @bubblewrap/cli init \
  --manifest=https://app.manualai.org/mydog/manifest.json \
  --directory=android-twa
# Werte aus twa-manifest.json übernehmen; keinen neuen Schlüssel erzeugen,
# wenn der produktive Upload-Key bereits existiert.

npx @bubblewrap/cli update --manifest=android-twa
npx @bubblewrap/cli validate --url=https://app.manualai.org/mydog/
npx @bubblewrap/cli build --manifest=android-twa --skipSigning
```

Vor der Einreichung muss das erzeugte Projekt gegen die aktuelle Google-Play-Anforderung geprüft werden: Seit 31.08.2026 müssen neue Apps und Updates Android 16 / API 36 oder höher targeten. Die verwendete Bubblewrap-Version muss deshalb ein `targetSdk` von mindestens 36 erzeugen.

## Digital Asset Links

Für eine verifizierte Vollbild-TWA muss der SHA-256-Fingerabdruck des Zertifikats, mit dem **die auf dem Gerät installierte APK signiert wurde**, in

`https://app.manualai.org/.well-known/assetlinks.json`

liegen. **Für Installationen aus Google Play ist das der App-Signing-Fingerabdruck** aus Play Console → App-Integrität → *App signing key certificate*: Google signiert die ausgelieferten APKs erneut. Der **Upload-Key-Fingerabdruck allein genügt dafür nicht**. Bei einem direkt per ADB installierten, lokal mit dem Upload-Key signierten APK kann dessen Fingerabdruck zusätzlich eingetragen werden. Wenn Play mehrere App-Signing-Zertifikate für unterstützte Geräte verwendet, müssen die relevanten Fingerabdrücke berücksichtigt werden. [Google erläutert die Unterscheidung ausdrücklich](https://developer.chrome.com/docs/android/trusted-web-activity/android-for-web-devs#upload-vs-signing-key).

Die Vorlage befindet sich in [`assetlinks.json.template`](assetlinks.json.template). Der Fingerabdruck darf nicht geraten werden. Nach Einrichtung von Play App Signing den **App-Signing**-SHA-256-Wert aus Play Console einsetzen, die JSON-Datei unter der Domainwurzel veröffentlichen und die **über Play installierte** App auf einem realen Gerät verifizieren. Eine Vorlage oder einen Platzhalter niemals öffentlich als fertige Digital Asset Links ausgeben.

Für die Android-App ist die geplante Kennung `org.manualai.mydog`. Nach dem Build prüfen:

```bash
curl -fsSL https://app.manualai.org/.well-known/assetlinks.json
# Ausgabe mit https://developers.google.com/digital-asset-links/tools/generator prüfen
```

## Google Play Closed Test

Für ein neues persönliches Play-Entwicklerkonto verlangt Google derzeit mindestens **12 dauerhaft opt-in Tester über 14 Tage**, bevor Produktionszugang beantragt werden kann. Der Store-Eintrag, Data-Safety-Formular, Datenschutz-URL, Screenshots, Content-Rating, Zielgruppe und Support-URL müssen in Play Console ausgefüllt werden.

Der empfohlene Ablauf ist: internes Test-APK auf realen Geräten prüfen → signiertes AAB bauen → Closed Track erstellen → 12 Tester einladen und 14 Tage aktiv halten → Feedback dokumentieren → Produktionszugang beantragen. Der tatsächliche Upload und die Annahme von Store-/Signaturbedingungen gehören in dein Play-Console-Konto und werden nicht aus diesem Repository automatisiert.
