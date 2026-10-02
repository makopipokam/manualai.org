# MyDog Android – Trusted Web Activity

Dieses Verzeichnis enthält die vorbereitete Bubblewrap-Konfiguration für eine Android-App, die `https://app.manualai.org/mydog/` als Trusted Web Activity öffnet. Die Web-App bleibt die gemeinsame Produktquelle; die Android-Hülle enthält keine zweite Kopie der MyDog-Logik.

## Status

Die Konfiguration ist vorbereitet, aber noch **kein signiertes APK/AAB und keine Play-Einreichung**. Das Android SDK wurde in dieser Session nicht installiert, weil dafür die Android-SDK-Lizenz aktiv akzeptiert werden müsste. Das muss der Kontoinhaber selbst auf seiner Build-Umgebung tun.

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

Für eine verifizierte Vollbild-TWA muss die SHA-256-Zertifikatsfingerprint des **tatsächlich zum Play-Upload gehörenden** Zertifikats in

`https://app.manualai.org/.well-known/assetlinks.json`

liegen. Die Vorlage befindet sich in [`assetlinks.json.template`](assetlinks.json.template). Der Fingerprint darf nicht geraten werden. Erst nach der Wahl des Play-App-Signing-/Upload-Key kann die Datei mit dem echten Wert erzeugt und in `main` veröffentlicht werden.

Für die Android-App ist die geplante Kennung `org.manualai.mydog`. Nach dem Build prüfen:

```bash
curl -fsSL https://app.manualai.org/.well-known/assetlinks.json
# Ausgabe mit https://developers.google.com/digital-asset-links/tools/generator prüfen
```

## Google Play Closed Test

Für ein neues persönliches Play-Entwicklerkonto verlangt Google derzeit mindestens **12 dauerhaft opt-in Tester über 14 Tage**, bevor Produktionszugang beantragt werden kann. Der Store-Eintrag, Data-Safety-Formular, Datenschutz-URL, Screenshots, Content-Rating, Zielgruppe und Support-URL müssen in Play Console ausgefüllt werden.

Der empfohlene Ablauf ist: internes Test-APK auf realen Geräten prüfen → signiertes AAB bauen → Closed Track erstellen → 12 Tester einladen und 14 Tage aktiv halten → Feedback dokumentieren → Produktionszugang beantragen. Der tatsächliche Upload und die Annahme von Store-/Signaturbedingungen gehören in dein Play-Console-Konto und werden nicht aus diesem Repository automatisiert.
