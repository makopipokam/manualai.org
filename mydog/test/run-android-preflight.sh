#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
python3 - "$ROOT" <<'PY'
import json, pathlib, sys
root = pathlib.Path(sys.argv[1])
manifest = json.loads((root / 'mydog/manifest.json').read_text())
twa = json.loads((root / 'android-twa/twa-manifest.json').read_text())
required = [root / 'mydog/legal/privacy.html', root / 'mydog/legal/attribution.html', root / 'android-twa/assetlinks.json.template']
missing = [str(p) for p in required if not p.is_file() or p.stat().st_size == 0]
if missing: raise SystemExit(f'missing legal/mobile files: {missing}')
assert manifest['start_url'] == '/mydog/'
assert manifest['scope'] == '/mydog/'
assert manifest['id'] == '/mydog/'
assert twa['host'] == 'app.manualai.org' and twa['startUrl'] == '/mydog/'
assert twa['packageId'] == 'org.manualai.mydog' and twa['orientation'] == 'portrait'
text = (root / 'android-twa/assetlinks.json.template').read_text()
assert 'REPLACE_WITH_THE_SHA256_FINGERPRINT_OF_THE_PLAY_APP_SIGNING_CERTIFICATE' in text
assert 'org.manualai.mydog' in text and 'PLAY_UPLOAD_CERTIFICATE' not in text
print('android-preflight: PASS | legal pages, PWA metadata, TWA manifest and fingerprint template')
PY
