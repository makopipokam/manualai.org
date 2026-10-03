#!/usr/bin/env python3
"""Download six freely licensed, breed-specific Commons photos per MyCat profile.

Uses Commons thumbnails (maximum 960px requested), preserves aspect ratio and records
artist, license, license URL and original file page for the required attribution.
"""
from __future__ import annotations
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from html import unescape
from pathlib import Path
import json
import re
import sys
import time
from urllib.parse import quote
import requests
from PIL import Image
from io import BytesIO

ROOT = Path(__file__).resolve().parents[1]
CATALOGUE = ROOT / 'breed-research.json'
DEST = ROOT / 'images' / 'v1'
MANIFEST = ROOT / 'photo-sources.json'
API = 'https://commons.wikimedia.org/w/api.php'
HEADERS = {'User-Agent': 'MyCatApp/1.0 (manualAI.org; image attribution at https://app.manualai.org/mycat/legal/attribution.html)'}
ALLOWED_LICENSES = {'CC0', 'CC BY', 'CC BY-SA', 'Public domain', 'Public Domain', 'PD', 'CC BY 2.0', 'CC BY-SA 2.0', 'CC BY 3.0', 'CC BY-SA 3.0', 'CC BY 4.0', 'CC BY-SA 4.0'}
SEARCH_TERMS = {
  1: ['domestic shorthair cat', 'house cat short-haired'], 2: ['Maine Coon cat'], 3: ['Ragdoll cat'],
  4: ['British Shorthair cat'], 5: ['Siamese cat', 'Siamese cat breed'], 6: ['Persian cat'], 7: ['Bengal cat'],
  8: ['Sphynx cat'], 9: ['Norwegian Forest cat'], 10: ['Siberian cat', 'Siberian Forest cat'], 11: ['Abyssinian cat'],
  12: ['Birman cat', 'Birman cat breed'], 13: ['Russian Blue cat', 'Russian Blue breed cat'], 14: ['Devon Rex cat'], 15: ['Turkish Angora cat', 'Turkish Angora breed cat'],
  16: ['Burmese cat', 'Burmese cat breed'], 17: ['Cornish Rex cat'], 18: ['American Shorthair cat']
}
FEATURED_FILES = {
  5: 'File:Blue Eyes (27408857786).jpg'
}

def plain(value: str) -> str:
    value = unescape(re.sub(r'<[^>]+>', '', value or ''))
    return re.sub(r'\s+', ' ', value).strip()

def accepted_license(value: str) -> bool:
    value = plain(value).strip()
    return value.lower().startswith(('cc by ', 'cc by-sa ', 'cc0', 'public domain', 'pd-')) or value.lower() in {'public domain', 'cc0'}

def candidate_from_page(page: dict) -> dict | None:
    info=(page.get('imageinfo') or [{}])[0]
    meta=info.get('extmetadata') or {}
    license_name=plain((meta.get('LicenseShortName') or {}).get('value',''))
    mime=info.get('mime','')
    thumb=info.get('thumburl')
    title=page.get('title','')
    description=plain((meta.get('ImageDescription') or {}).get('value',''))
    candidate_text=f'{title} {description}'.casefold()
    excluded=('poster','diagram','chart','map','logo','icon','illustration','drawing','painting','meme','sticker','affiche','engraving','engraved','bookplate','lithograph','woodcut','sculpture','mixed cat','mixed-breed','crossbreed','cross breed','not a pedigree','i believe this is')
    if not title.startswith('File:') or not thumb or (mime and mime not in {'image/jpeg','image/png','image/webp'}) or not accepted_license(license_name) or any(word in candidate_text for word in excluded):
        return None
    artist=plain((meta.get('Artist') or {}).get('value',''))
    if not artist:
        return None
    return {
        'title':title.removeprefix('File:'), 'thumb_url':thumb, 'direct_url':info.get('url',''),
        'commons_url':'https://commons.wikimedia.org/wiki/' + quote(title.replace(' ','_'), safe=':/()\'!*,;@&=+$-_.~'),
        'artist':artist, 'license':license_name,
        'license_url':plain((meta.get('LicenseUrl') or {}).get('value','')),
        'credit':plain((meta.get('Credit') or {}).get('value','')),
        'description':description
    }

def exact_file(title: str) -> dict | None:
    response=requests.get(API, params={
        'action':'query','format':'json','titles':title,'prop':'imageinfo',
        'iiprop':'url|extmetadata|size|mime','iiurlwidth':960
    }, headers=HEADERS, timeout=45)
    response.raise_for_status()
    page=next(iter(response.json().get('query',{}).get('pages',{}).values()), {})
    return candidate_from_page(page)

def search(term: str) -> list[dict]:
    params = {
        'action':'query', 'format':'json', 'generator':'search', 'gsrsearch':f'filetype:bitmap "{term}"',
        'gsrnamespace':6, 'gsrlimit':50, 'prop':'imageinfo', 'iiprop':'url|extmetadata|size|mime', 'iiurlwidth':960
    }
    response = requests.get(API, params=params, headers=HEADERS, timeout=45)
    response.raise_for_status()
    payload = response.json()
    found=[]
    for page in payload.get('query', {}).get('pages', {}).values():
        item=candidate_from_page(page)
        if item:
            found.append(item)
    return found

def collect(cats: list[dict]) -> list[dict]:
    seen=set(); records=[]
    for breed in cats:
        candidates=[]
        featured_title=FEATURED_FILES.get(breed['id'])
        if featured_title:
            featured=exact_file(featured_title)
            if not featured:
                raise RuntimeError(f'Curated featured photo is not eligible or available: {featured_title}')
            seen.add(featured['title'].casefold())
            candidates.append(featured)
        for term in SEARCH_TERMS[breed['id']]:
            try:
                matches=search(term)
            except Exception as e:
                print(f"Search warning for {breed['name']} / {term}: {e}", file=sys.stderr)
                matches=[]
            for item in matches:
                key=item['title'].casefold()
                if key in seen:
                    continue
                seen.add(key)
                candidates.append(item)
                if len(candidates)==6:
                    break
            if len(candidates)==6:
                break
            time.sleep(.3)
        if len(candidates)<6:
            raise RuntimeError(f"Only {len(candidates)} licensed unique Commons images found for {breed['name']}; add/revise a search term before building.")
        records.append({'id':breed['id'],'breed':breed['name'],'featuredPhoto':1,'photos':candidates})
        print(f"Selected {len(candidates)} unique CC/PD photographs for {breed['name']}", flush=True)
        time.sleep(.25)
    return records

def save_photo(pair):
    breed_id, photo_id, photo = pair
    response=requests.get(photo['thumb_url'], headers=HEADERS, timeout=60)
    response.raise_for_status()
    im=Image.open(BytesIO(response.content)).convert('RGB')
    im.thumbnail((960,960), Image.Resampling.LANCZOS)
    target=DEST/f'{breed_id:02d}'/f'{photo_id}.webp'
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists():
        raise FileExistsError(f'{target} exists; use --force to rebuild the MyCat images')
    im.save(target, 'WEBP', quality=82, method=6)
    return target.stat().st_size

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--force', action='store_true', help='remove only MyCat images/v1 and its source manifest before rebuilding')
    parser.add_argument('--dry-run', action='store_true', help='preview selected Commons files without downloading or changing any files')
    args=parser.parse_args()
    if not args.force and not args.dry_run and DEST.exists() and any(DEST.rglob('*.webp')):
        raise SystemExit('MyCat photos already exist; refusing to overwrite. Use --force explicitly.')
    breeds=json.loads(CATALOGUE.read_text())['breeds']
    records=collect(breeds)
    if args.dry_run:
        for record in records:
            print(f"Preview {record['id']:02d} {record['breed']}: {record['photos'][0]['title']} — {record['photos'][0]['description']}")
        print(f'Preview complete: {len(records)} profiles, {sum(len(record["photos"]) for record in records)} licensed unique photographs selected; no files changed.')
        return
    if args.force:
        import shutil
        shutil.rmtree(DEST, ignore_errors=True)
        MANIFEST.unlink(missing_ok=True)
    jobs=[(r['id'], i+1, photo) for r in records for i,photo in enumerate(r['photos'])]
    total=0
    with ThreadPoolExecutor(max_workers=5) as pool:
        futures={pool.submit(save_photo,job):job for job in jobs}
        for future in as_completed(futures):
            job=futures[future]
            try: total += future.result()
            except Exception as exc: raise RuntimeError(f'Failed downloading {job[2]["title"]}: {exc}') from exc
    manifest={
        'description':'Breed-specific photo source records. Images are resized without cropping and converted to WebP. Check each Commons file page for its original license terms.',
        'provider':'Wikimedia Commons',
        'breeds':[
          {'id':r['id'],'breed':r['breed'],'featuredPhoto':r['featuredPhoto'],
           'sources':[p['direct_url'] for p in r['photos']], 'photos':r['photos']}
          for r in records
        ]
    }
    MANIFEST.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'Completed {len(records)} breeds, {len(jobs)} photos, {total/1024/1024:.2f} MiB WebP.')

if __name__=='__main__': main()
