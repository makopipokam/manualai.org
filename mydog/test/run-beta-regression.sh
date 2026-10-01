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

python3 - "$ROOT/mydog/data.js" <<'PY'
from pathlib import Path
import re
import sys

source = Path(sys.argv[1]).read_text()
entries = re.findall(
    r'\{\s*id:\s*\d+,\s*name:\s*"([^"]+)".*?images:\s*\[(.*?)\]\s*,\s*imagesLabels:',
    source,
    re.S,
)
if len(entries) != 18:
    raise SystemExit(f'expected 18 dog entries, found {len(entries)}')
breed_images = {}
for breed, block in entries:
    urls = re.findall(r'"(https?://[^"\n]+)"', block)
    if len(urls) != 6:
        raise SystemExit(f'{breed}: expected 6 image references, found {len(urls)}')
    breed_images[breed] = set(urls)
for breed, urls in breed_images.items():
    reused_by = [other for other, other_urls in breed_images.items() if other != breed and urls & other_urls]
    if reused_by:
        raise SystemExit(f'{breed}: image URLs reused by {reused_by}')
print(f'catalogue: PASS | {len(entries)} breeds | 6 non-shared image references each')
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
