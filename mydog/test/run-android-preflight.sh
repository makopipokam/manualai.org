#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
python3 - "$ROOT" <<'PY'
import json
import pathlib
import sys

root = pathlib.Path(sys.argv[1])
manifest = json.loads((root / 'mydog/manifest.json').read_text())
twa = json.loads((root / 'android-twa/twa-manifest.json').read_text())
required = [
    root / 'mydog/legal/privacy.html',
    root / 'mydog/legal/impressum.html',
    root / 'mydog/legal/attribution.html',
    root / 'android-twa/assetlinks.json.template',
]
missing = [str(path) for path in required if not path.is_file() or path.stat().st_size == 0]
if missing:
    raise SystemExit(f'missing legal/mobile files: {missing}')

assert manifest['start_url'] == '/mydog/'
assert manifest['scope'] == '/mydog/'
assert manifest['id'] == '/mydog/'
assert twa['host'] == 'app.manualai.org' and twa['startUrl'] == '/mydog/'
assert twa['packageId'] == 'org.manualai.mydog' and twa['orientation'] == 'portrait'

privacy = (root / 'mydog/legal/privacy.html').read_text()
imprint = (root / 'mydog/legal/impressum.html').read_text()
index = (root / 'mydog/index.html').read_text()
service_worker = (root / 'mydog/sw.js').read_text()
identity = ('PICARD Lederwaren GmbH &amp; Co. KG', 'Friedensstraße 22', '63179 Obertshausen', 'info@picard-fashion.com')
assert all(part in privacy and part in imprint for part in identity), 'controller identity/address differs from the official PICARD imprint'
assert 'datenschutz@picard-fashion.com' in privacy, 'PICARD DPO contact is missing'
assert all(part in privacy for part in ('localStorage', 'Vercel', 'Art. 6 Abs. 1 lit. f DSGVO', '§ 25 Abs. 2 Nr. 2 TDDDG', 'Art. 77 DSGVO'))
assert '/mydog/images/v1/' in privacy, 'privacy page must describe locally served dog photos'
assert 'bei der Anzeige direkt von' not in privacy, 'outdated third-party image claim in privacy page'
for page in (privacy, imprint):
    assert all(part not in page.lower() for part in ('[vollständiger name', 'vor dem store-submit ergänzen', 'technische veröffentlichungsvorlage'))
for path in ('privacy.html', 'impressum.html', 'attribution.html'):
    route = f'/mydog/legal/{path}'
    assert route in index, f'missing public footer link: {route}'
    assert route in service_worker, f'missing offline-cache asset: {route}'
assert '/mydog/legal/privacy.html' in imprint and '/mydog/legal/impressum.html' in privacy

assetlinks = (root / 'android-twa/assetlinks.json.template').read_text()
assert 'REPLACE_WITH_THE_SHA256_FINGERPRINT_OF_THE_PLAY_APP_SIGNING_CERTIFICATE' in assetlinks
assert 'org.manualai.mydog' in assetlinks and 'PLAY_UPLOAD_CERTIFICATE' not in assetlinks
print('android-preflight: STRUCTURE PASS | PICARD legal identity, linked pages, PWA metadata, TWA manifest and fingerprint template')
print('android-legal: APPROVED | PICARD confirmed operator role, DPO contact and Vercel processing on 02.10.2026; legal pages live since PR #39')
print('android-release: PENDING | Play App Signing fingerprint, real-device test and Play Console declarations')
PY
