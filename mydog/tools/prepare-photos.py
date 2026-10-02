#!/usr/bin/env python3
"""Rebuild MyDog's self-hosted WebP photos from the documented original URLs.

Usage: python3 mydog/tools/prepare-photos.py --bootstrap  # first run against old data.js
       python3 mydog/tools/prepare-photos.py              # rebuild from photo-sources.json

Requires Pillow. This only resizes/re-encodes existing photos, preserving aspect ratio.
Review source licenses and breed accuracy before redistributing or replacing photos.
"""
import argparse
import concurrent.futures
import hashlib
import io
import json
from pathlib import Path
import re
import time
import urllib.request
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / 'photo-sources.json'
DEST = ROOT / 'images' / 'v1'


def bootstrap_sources():
    text = (ROOT / 'data.js').read_text()
    pattern = re.compile(r'\{\s*id:\s*(\d+),\s*name:\s*"([^"]+)".*?images:\s*\[(.*?)\]\s*,\s*imagesLabels:', re.S)
    dogs = []
    for dog_id, name, block in pattern.findall(text):
        urls = re.findall(r'"(https?://[^"\n]+)"', block)
        if len(urls) != 6 or len(set(urls)) != 6:
            raise ValueError(f'{name}: expected six unique source URLs')
        dogs.append({'id': int(dog_id), 'breed': name, 'sources': urls})
    if len(dogs) != 18:
        raise ValueError(f'expected 18 breeds, got {len(dogs)}')
    SOURCES.write_text(json.dumps({'description': 'Original photo sources for the local MyDog gallery; images resized and converted to WebP without cropping.', 'breeds': dogs}, ensure_ascii=False, indent=2) + '\n')
    print(f'created {SOURCES} with {len(dogs)} breeds')


def convert(job):
    dog_id, index, url = job
    output = DEST / f'{dog_id:02d}' / f'{index}.webp'
    if output.exists():
        with Image.open(output) as current:
            current.verify()
        return output, output.stat().st_size, 'existing'
    error = None
    for attempt in range(4):
        try:
            request = urllib.request.Request(url, headers={'User-Agent': 'MyDog image preparation (+https://app.manualai.org/mydog/)', 'Accept': 'image/avif,image/webp,image/png,image/jpeg,*/*;q=0.8'})
            with urllib.request.urlopen(request, timeout=30) as response:
                content_type = response.headers.get('Content-Type', '')
                if not content_type.startswith('image/'):
                    raise ValueError(f'unexpected content type {content_type}')
                original = response.read(7_000_001)
                if len(original) > 7_000_000:
                    raise ValueError('source exceeds 7 MB safety limit')
            with Image.open(io.BytesIO(original)) as source:
                image = ImageOps.exif_transpose(source)
                image.load()
                if image.width < 160 or image.height < 160:
                    raise ValueError(f'source too small {image.size}')
                if image.mode != 'RGB':
                    image = image.convert('RGB')
                image.thumbnail((960, 960), Image.Resampling.LANCZOS)
                output.parent.mkdir(parents=True, exist_ok=True)
                image.save(output, 'WEBP', quality=80, method=5)
            with Image.open(output) as processed:
                processed.verify()
            return output, output.stat().st_size, hashlib.sha256(original).hexdigest()[:10]
        except Exception as exc:
            error = exc
            time.sleep(0.8 * (attempt + 1))
    raise RuntimeError(f'{dog_id}/{index}: {url}: {error}')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--bootstrap', action='store_true', help='read existing data.js URLs into photo-sources.json first')
    args = parser.parse_args()
    if args.bootstrap:
        if SOURCES.exists():
            raise SystemExit(f'refusing to overwrite {SOURCES}')
        bootstrap_sources()
    manifest = json.loads(SOURCES.read_text())
    jobs = [(dog['id'], n, url) for dog in manifest['breeds'] for n, url in enumerate(dog['sources'], start=1)]
    if len(jobs) != 108:
        raise ValueError(f'expected 108 photos, got {len(jobs)}')
    total = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        futures = {pool.submit(convert, job): job for job in jobs}
        for completed, future in enumerate(concurrent.futures.as_completed(futures), start=1):
            file, size, source_hash = future.result()
            total += size
            if completed % 12 == 0 or completed == len(jobs):
                print(f'{completed}/{len(jobs)} photos | {total / 1_048_576:.1f} MB processed', flush=True)
    print(f'complete: {len(jobs)} verified WebP files, {total / 1_048_576:.1f} MB total')


if __name__ == '__main__':
    main()
