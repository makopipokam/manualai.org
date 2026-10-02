#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PORT="${PORT:-4174}"
URL="http://127.0.0.1:${PORT}/mydog/test/beta-regression.html"
TMP_DIR="$(mktemp -d /tmp/mydog-beta-regression.XXXXXX)"
SERVER_LOG="$TMP_DIR/server.log"

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]]; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

python3 -m http.server "$PORT" --directory "$ROOT" >"$SERVER_LOG" 2>&1 &
SERVER_PID=$!
for _ in $(seq 1 30); do
  if curl -fsS "$URL" >/dev/null 2>&1; then break; fi
  sleep 0.1
done
curl -fsS "$URL" >/dev/null

if grep -qE 'dark-mode|darkMode|toggleDark|updateDark|data-theme|Dark Mode' \
  "$ROOT/mydog/index.html" "$ROOT/mydog/script.js" "$ROOT/mydog/style.css" "$ROOT/mydog/test/beta-regression.html"; then
  echo 'theme-removal: FAIL | dark-mode code or markup remains' >&2
  exit 1
fi
echo 'theme-removal: PASS | light theme is the only supported mode'

python3 - "$ROOT/mydog/data.js" "$ROOT/mydog/photo-sources.json" <<'PY'
from pathlib import Path
import json
import re
import sys

source = Path(sys.argv[1]).read_text()
root = Path(sys.argv[1]).parent
manifest = json.loads(Path(sys.argv[2]).read_text())
entries = re.findall(
    r'\{\s*id:\s*(\d+),\s*name:\s*"([^"]+)".*?images:\s*\[(.*?)\]\s*,\s*imagesLabels:',
    source,
    re.S,
)
if len(entries) != 18 or len(manifest['breeds']) != 18:
    raise SystemExit(f'expected 18 dog entries, found {len(entries)}')
breed_images = {}
for (dog_id, breed, block), record in zip(entries, manifest['breeds']):
    dog_id = int(dog_id)
    urls = re.findall(r'"(/mydog/images/v1/\d{2}/\d\.webp)"', block)
    if record['id'] != dog_id or record['breed'] != breed or len(record['sources']) != 6:
        raise SystemExit(f'{breed}: source attribution does not match the catalogue')
    if len(urls) != 6:
        raise SystemExit(f'{breed}: expected 6 image references, found {len(urls)}')
    if len(set(urls)) != 6:
        raise SystemExit(f'{breed}: the same photo is listed more than once')
    featured = record['featuredPhoto']
    if urls[0] != f'/mydog/images/v1/{dog_id:02d}/{featured}.webp':
        raise SystemExit(f'{breed}: featured photo does not match its source record')
    for url in urls:
        if not url.startswith(f'/mydog/images/v1/{dog_id:02d}/'):
            raise SystemExit(f'{breed}: photo belongs to another breed')
        file = root / url.removeprefix('/mydog/')
        data = file.read_bytes()
        if len(data) < 2000 or data[:4] != b'RIFF' or data[8:12] != b'WEBP':
            raise SystemExit(f'{breed}: invalid or missing WebP photo: {file}')
    breed_images[breed] = set(urls)
for breed, urls in breed_images.items():
    reused_by = [other for other, other_urls in breed_images.items() if other != breed and urls & other_urls]
    if reused_by:
        raise SystemExit(f'{breed}: image URLs reused by {reused_by}')
print(f'catalogue: PASS | {len(entries)} breeds | 108 local WebP photos with recorded source URLs')
PY

if grep -qE 'unsplash|fonts.googleapis.com|CACHE_NAME = .mydog-v1' "$ROOT/mydog/sw.js"; then
  echo 'service-worker: FAIL | stale external precache entries remain' >&2
  exit 1
fi
grep -q "const STATIC_CACHE = 'mydog-static-v9'" "$ROOT/mydog/sw.js"
grep -q "name.startsWith(OWNED_CACHE_PREFIX)" "$ROOT/mydog/sw.js"
# App files must be network-first: a cache-first app shell served stale script.js with newer HTML.
if grep -qE 'cached \|\| fetch\(request\)' "$ROOT/mydog/sw.js"; then
  echo 'service-worker: FAIL | app files are served cache-first again' >&2
  exit 1
fi
grep -q "IMAGE_CACHE_LIMIT" "$ROOT/mydog/sw.js"
grep -q "url.pathname.startsWith('/mydog/images/v1/')" "$ROOT/mydog/sw.js"
python3 - "$ROOT/mydog/index.html" <<'PY'
import re, sys
from pathlib import Path
html = Path(sys.argv[1]).read_text()
versions = set(re.findall(r'(?:style\.css|data\.js|script\.js)\?v=([0-9A-Za-z._-]+)', html))
if len(versions) != 1 or len(re.findall(r'(?:style\.css|data\.js|script\.js)\?v=', html)) != 3:
    raise SystemExit('index.html must load style.css, data.js and script.js with one shared ?v= release token')
if 'rel="icon"' not in html or 'rel="apple-touch-icon"' not in html:
    raise SystemExit('index.html must declare favicon and apple-touch-icon')
PY
echo 'service-worker: PASS | network-first app files, bounded photo cache, versioned assets'

direct_output="$TMP_DIR/direct-profile.html"
chromium --headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage \
  --no-first-run --user-data-dir="$TMP_DIR/chromium-direct" \
  --virtual-time-budget=4000 --dump-dom "http://127.0.0.1:${PORT}/mydog/?dog=1" \
  >"$direct_output" 2>"$TMP_DIR/direct.log"
python3 - "$direct_output" <<'PY'
from pathlib import Path
import sys
html = Path(sys.argv[1]).read_text()
if 'id="results-screen" class="screen active"' not in html:
    raise SystemExit('direct dog profile did not activate results screen')
if 'id="start-screen" class="screen active"' in html:
    raise SystemExit('direct dog profile left start screen active')
if 'Kein persönlicher Test' not in html:
    raise SystemExit('direct dog profile did not render neutral score state')
print('direct-profile: PASS | shared dog profile renders without personal score')
PY

for mode in desktop mobile; do
  if [[ "$mode" == desktop ]]; then
    size='1280,900'
  else
    size='390,844'
  fi
  output="$TMP_DIR/${mode}.html"
  chromium --headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage \
    --no-first-run --user-data-dir="$TMP_DIR/chromium-${mode}" \
    --window-size="$size" --virtual-time-budget=8000 \
    --dump-dom "$URL" >"$output" 2>"$TMP_DIR/${mode}.log"
  python3 - "$output" "$mode" <<'PY'
from pathlib import Path
import re
import sys

html = Path(sys.argv[1]).read_text()
mode = sys.argv[2]
match = re.search(r'<pre id="status">(.*?)</pre>', html, re.S)
status = match.group(1) if match else 'status missing'
print(f'{mode}: {status.replace(chr(10), " | ")}')
if not status.startswith('PASS'):
    raise SystemExit(1)
PY
done
