#!/usr/bin/env python3
"""Browser regressions for the local MyCat catalogue and gallery."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import sys
import threading

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
CSP = next(header['value'] for rule in json.loads((ROOT / 'vercel.json').read_text())['headers']
           for header in rule['headers'] if header['key'].lower() == 'content-security-policy')


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass
    def end_headers(self):
        self.send_header('Content-Security-Policy', CSP)
        super().end_headers()


class Server(ThreadingHTTPServer):
    def handle_error(self, request, client_address):
        if not isinstance(sys.exc_info()[1], (BrokenPipeError, ConnectionResetError)):
            super().handle_error(request, client_address)


def main():
    server = Server(('127.0.0.1', 0), partial(Handler, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}/mycat/'
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
                args=['--no-sandbox', '--disable-dev-shm-usage'])
            context = browser.new_context(viewport={'width': 390, 'height': 844}, service_workers='block')
            page = context.new_page()
            errors, external_images = [], []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.on('request', lambda req: external_images.append(req.url)
                    if req.resource_type == 'image' and not req.url.startswith(base) else None)

            breed_names, all_photo_urls = [], set()
            for cat_id in range(1, 19):
                page.goto(f'{base}?cat={cat_id}', wait_until='domcontentloaded')
                page.locator('#results-screen.active').wait_for(timeout=8000)
                page.wait_for_function("() => document.querySelector('#cat-image-main')?.naturalWidth > 0", timeout=10000)
                image = page.locator('#cat-image-main')
                src = image.get_attribute('src')
                assert src and src.startswith(f'/mycat/images/v1/{cat_id:02d}/'), f'{cat_id}: main photo does not belong to its profile: {src}'
                assert page.locator('#cat-image-status').is_hidden(), f'{cat_id}: loading status did not clear'
                name = page.locator('#cat-name').inner_text().strip()
                assert name, f'{cat_id}: missing profile heading'
                breed_names.append(name)
                assert page.locator('#cat-health-note-text').inner_text().strip(), f'{name}: health/welfare note missing'
                assert page.locator('#cat-source-link').get_attribute('href').startswith('https://tica.org/'), f'{name}: source link missing'
                page.locator('.thumbnail-gallery').scroll_into_view_if_needed()
                page.wait_for_function("() => [...document.querySelectorAll('.cat-image.thumbnail')].length===6 && [...document.querySelectorAll('.cat-image.thumbnail')].every(i=>i.naturalWidth>0)", timeout=12000)
                thumbs = page.eval_on_selector_all('.cat-image.thumbnail', 'imgs=>imgs.map(i=>({src:i.getAttribute("src"),alt:i.alt}))')
                urls = [item['src'] for item in thumbs]
                assert len(set(urls)) == 6, f'{name}: gallery repeats a photo'
                assert all(url.startswith(f'/mycat/images/v1/{cat_id:02d}/') for url in urls), f'{name}: gallery mixes profile photos'
                assert all(name in item['alt'] for item in thumbs), f'{name}: image alternatives lack profile name'
                all_photo_urls.update(urls)
            assert len(set(breed_names)) == 18, 'profile names are not unique'
            assert len(all_photo_urls) == 108, f'expected 108 unique local photos, saw {len(all_photo_urls)}'
            assert not external_images, f'third-party image request remains: {external_images[:3]}'
            print('catalogue/photos: PASS | 18 profiles, 108 unique local images, source notes and no external image calls')

            voices = {
                8: ('offen und gesellig', 'Miau, gern:'),
                7: ('neugierig und verspielt', 'Oh, spannende Frage:'),
                4: ('eigenständig und gelassen', 'Ganz in Ruhe:'),
            }
            greetings = set()
            for cat_id, (traits, lead) in voices.items():
                page.goto(f'{base}?cat={cat_id}', wait_until='domcontentloaded')
                page.locator('#results-screen.active').wait_for(timeout=8000)
                page.locator('#chat-btn').click()
                page.locator('#chat-screen.active').wait_for(timeout=8000)
                greeting = page.locator('.chat-message.assistant').first.inner_text()
                assert traits in greeting, f'{cat_id}: greeting ignores the selected profile'
                greetings.add(greeting)
                def ask(text):
                    count = page.locator('.chat-message.assistant').count()
                    page.locator('#user-message-input').fill(text)
                    page.locator('#send-message-btn').click()
                    page.wait_for_function('(n) => document.querySelectorAll(".chat-message.assistant").length > n', arg=count, timeout=5000)
                    return page.locator('.chat-message.assistant').last.inner_text()
                character = ask('Wie bist du vom Charakter?')
                assert traits in character and 'Individuelle Katzen können anders sein' in character, f'{cat_id}: profile caveat missing'
                toilet = ask('Wie oft machst du dein großes Geschäft?')
                assert toilet.startswith(lead) and 'ein- bis dreimal am Tag' in toilet and 'Tierarztpraxis' in toilet and 'PDSA' in toilet, f'{cat_id}: sourced common health guidance missing'
                urgent = ask('Blut im Kot')
                assert urgent.startswith('Bei Blut im Kot') and 'Tierarztpraxis' in urgent, f'{cat_id}: urgent reply should stay neutral'
            assert len(greetings) == len(voices), 'profile greeting voices are not distinct'
            print('profile chat: PASS | deterministic profile voices, shared sourced facts and neutral health caveat')

            page.goto(f'{base}?cat=1', wait_until='domcontentloaded')
            page.evaluate('''() => {
                appState.matchingCats = catDatabase.map(cat => ({...cat, matchScore: 75}));
                for (let n=0; n<appState.matchingCats.length; n++) {
                    appState.currentCatIndex = n;
                    showCatResult();
                }
            }''')
            expected_name = page.evaluate('catDatabase.at(-1).name')
            page.wait_for_function('''() => {
                const img=document.querySelector('#cat-image-main');
                return img?.naturalWidth>0 && img.getAttribute('src')?.startsWith('/mycat/images/v1/18/');
            }''', timeout=12000)
            assert page.locator('#cat-name').inner_text() == expected_name, 'fast switching left the wrong cat profile selected'
            print('profile switching: PASS | last profile keeps its own photo')

            page.route('**/mycat/images/v1/17/1.webp', lambda route: route.abort())
            page.goto(f'{base}?cat=17', wait_until='domcontentloaded')
            page.wait_for_function("() => document.querySelector('#cat-image-main')?.naturalWidth > 0", timeout=12000)
            fallback = page.locator('#cat-image-main').get_attribute('src')
            assert fallback.startswith('/mycat/images/v1/17/') and not fallback.endswith('/1.webp'), f'failed lead photo did not fall back to the same breed: {fallback}'
            page.unroute('**/mycat/images/v1/17/1.webp')
            print('photo fallback: PASS | failed featured image falls back within the same profile')

            page.goto(f'{base}?cat=4', wait_until='domcontentloaded')
            page.locator('#favorite-btn').click()
            assert page.evaluate("JSON.parse(localStorage.getItem('mycat_appState')).favorites.length") == 1, 'favorite was not saved locally'
            page.goto(base, wait_until='domcontentloaded')
            page.locator('#view-favorites-btn').click()
            assert page.locator('.favorite-card').count() == 1, 'saved cat profile is not visible in favorites'
            print('favorites: PASS | cat profile persists locally across page loads')

            page.goto(f'{base}?cat=17', wait_until='domcontentloaded')
            page.locator('#results-screen.active').wait_for(timeout=8000)
            page.wait_for_function("() => document.querySelector('#cat-image-main')?.naturalWidth > 0", timeout=10000)
            page.locator('#cat-image-2').scroll_into_view_if_needed()
            page.locator('#cat-image-2').click()
            selected = page.locator('#cat-image-main').get_attribute('src')
            page.evaluate('openShareModal()')
            page.locator('#share-modal.active').wait_for(timeout=8000)
            assert page.evaluate('getShareImageState().source') == selected, 'share preview ignored selected photo'
            export = page.evaluate('''async () => {
                const file=await prepareShareImageFile();
                return file && {type:file.type,bytes:file.size};
            }''')
            assert export and export['type']=='image/png' and export['bytes']>12000, f'local share image failed: {export}'
            print(f"share export: PASS | selected cat image exports locally as PNG ({export['bytes']} bytes)")

            for width, height in ((320, 568), (390, 844), (1280, 900)):
                page.set_viewport_size({'width':width,'height':height})
                page.goto(base, wait_until='domcontentloaded')
                width_data = page.evaluate('''() => ({viewport:innerWidth,document:document.documentElement.scrollWidth})''')
                assert width_data['document'] <= width_data['viewport'] + 1, f'layout overflows at {width}px: {width_data}'
            assert not errors, f'browser errors: {errors}'
            print('responsive/browser: PASS | 320px, 390px and desktop; no JS exceptions')
            browser.close()
    finally:
        server.shutdown(); server.server_close()


if __name__ == '__main__':
    main()
