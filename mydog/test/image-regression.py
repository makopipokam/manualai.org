#!/usr/bin/env python3
"""Run MyDog's image E2E against a temporary local server (requires Playwright and Chromium).

Install once: python3 -m pip install playwright
Run: python3 mydog/test/image-regression.py
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import sys
import threading
import time

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
CSP = next(header['value'] for rule in json.loads((ROOT / 'vercel.json').read_text())['headers']
           for header in rule['headers'] if header['key'].lower() == 'content-security-policy')


class Handler(SimpleHTTPRequestHandler):
    slow_lead = False

    def log_message(self, *args):
        pass

    def do_GET(self):
        if self.slow_lead and self.path.split('?', 1)[0] == '/mydog/images/v1/01/2.webp':
            time.sleep(0.7)
        super().do_GET()

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
    base = f'http://127.0.0.1:{server.server_port}/mydog/'
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'])
            context = browser.new_context(viewport={'width': 390, 'height': 844}, service_workers='block')
            page = context.new_page()
            errors, external_images = [], []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.on('request', lambda request: external_images.append(request.url) if request.resource_type == 'image' and ('dog.ceo' in request.url or 'wikimedia' in request.url) else None)

            Handler.slow_lead = True
            page.goto(f'{base}?dog=1', wait_until='domcontentloaded')
            page.locator('#results-screen.active').wait_for(timeout=7000)
            assert page.locator('#dog-image-status').is_visible(), 'slow photo does not show loading state'
            assert page.locator('#dog-image-status .dog-loading-icon').is_visible(), 'small dog animation is not visible while photo loads'
            status_text_style = page.locator('#dog-image-status-text').evaluate('(node) => getComputedStyle(node).clipPath')
            assert status_text_style.startswith('inset('), 'loading text should be available only to screen readers'
            page.wait_for_function("() => document.querySelector('#dog-image-main')?.naturalWidth > 0", timeout=7000)
            assert page.locator('#dog-image-status').is_hidden(), 'loading dog icon did not disappear after photo loaded'
            Handler.slow_lead = False
            print('slow photo: PASS | animated dog while loading, no visible text, then decoded breed photo')

            for dog_id in range(1, 19):
                page.goto(f'{base}?dog={dog_id}', wait_until='domcontentloaded')
                page.wait_for_function("() => document.querySelector('#dog-image-main')?.naturalWidth > 0", timeout=7000)
                image = page.locator('#dog-image-main')
                src = image.get_attribute('src')
                assert src and src.startswith(f'/mydog/images/v1/{dog_id:02d}/'), f'{dog_id}: main image is not from its own breed: {src}'
                assert page.locator('#dog-image-status').is_hidden(), f'{dog_id}: image status did not disappear'
                assert page.locator('#dog-name').inner_text().strip(), f'{dog_id}: missing breed heading'
                page.locator('.thumbnail-gallery').scroll_into_view_if_needed()
                page.wait_for_function("() => [...document.querySelectorAll('.dog-image.thumbnail')].length===6 && [...document.querySelectorAll('.dog-image.thumbnail')].every(i=>i.naturalWidth>0)", timeout=7000)
                sources = page.eval_on_selector_all('.dog-image.thumbnail', 'imgs=>imgs.map(i=>i.getAttribute("src"))')
                assert len(set(sources)) == 6, f'{dog_id}: gallery repeats a photo'
                assert all(src.startswith(f'/mydog/images/v1/{dog_id:02d}/') for src in sources), f'{dog_id}: gallery mixes breeds'
            assert not external_images, f'third-party photo requests remain: {external_images[:3]}'
            print('all breeds: PASS | 18 main photos, 108 decoded local thumbnails, no cross-breed sources')

            # The same question should sound different for contrasting catalogue
            # personalities without inventing different medical facts for each breed.
            voices = {
                1: ('offen und gesellig', 'Wuff, gerne:'),
                3: ('neugierig und konzentriert', 'Gute Frage – schauen wir genau hin:'),
                15: ('eigenständig und gelassen', 'Ganz in Ruhe:'),
            }
            greetings, toilet_answers = set(), set()
            for dog_id, (traits, lead) in voices.items():
                page.goto(f'{base}?dog={dog_id}', wait_until='domcontentloaded')
                page.locator('#results-screen.active').wait_for(timeout=7000)
                page.locator('#chat-btn').click()
                page.locator('#chat-screen.active').wait_for(timeout=7000)
                greeting = page.locator('.chat-message.assistant').first.inner_text()
                assert traits in greeting, f'{dog_id}: greeting ignores its profile personality'
                greetings.add(greeting)

                page.locator('#user-message-input').fill('Wie bist du vom Charakter?')
                page.locator('#send-message-btn').click()
                character = page.locator('.chat-message.assistant').last.inner_text()
                assert traits in character and 'Einzelne Hunde können ganz anders sein' in character, f'{dog_id}: character answer invents individual traits'

                page.locator('#user-message-input').fill('Wie oft musst du kacken?')
                page.locator('#send-message-btn').click()
                toilet = page.locator('.chat-message.assistant').last.inner_text()
                assert toilet.startswith(lead) and 'ein- bis dreimal täglich' in toilet and 'Tierarztpraxis' in toilet, f'{dog_id}: voice or common veterinary caveat missing'
                toilet_answers.add(toilet)

                page.locator('#user-message-input').fill('Blut im Kot')
                page.locator('#send-message-btn').click()
                urgent = page.locator('.chat-message.assistant').last.inner_text()
                assert urgent.startswith('Bei Blut im Kot') and 'Tierarztpraxis' in urgent, f'{dog_id}: urgent health reply must remain neutral'
            assert len(greetings) == len(voices) and len(toilet_answers) == len(voices), 'different breed personalities still give indistinguishable answers'
            print('breed voices: PASS | three distinct greetings and answers, shared health facts and neutral urgent advice')

            # Fast changes used to reveal photos from the previous dog.
            page.goto(f'{base}?dog=1', wait_until='domcontentloaded')
            page.evaluate('''() => {
                appState.matchingDogs = dogDatabase.map(dog => ({...dog, matchScore: 75}));
                for (let n=0; n < appState.matchingDogs.length; n++) {
                    appState.currentDogIndex = n;
                    showDogResult();
                }
            }''')
            page.wait_for_function("() => document.querySelector('#dog-image-main')?.naturalWidth > 0", timeout=7000)
            assert page.locator('#dog-name').inner_text() == 'Boxer', 'fast switching left the wrong dog selected'
            assert '/18/' in page.locator('#dog-image-main').get_attribute('src'), 'old photo flashed after fast switching'
            print('fast switching: PASS | last dog photo remains associated with last dog')

            # If the lead photo fails, never show another breed and never leave a blank.
            page.route('**/mydog/images/v1/17/3.webp', lambda route: route.abort())
            page.goto(f'{base}?dog=17', wait_until='domcontentloaded')
            page.wait_for_function("() => document.querySelector('#dog-image-main')?.naturalWidth > 0", timeout=7000)
            fallback_src = page.locator('#dog-image-main').get_attribute('src')
            assert fallback_src.startswith('/mydog/images/v1/17/') and not fallback_src.endswith('/3.webp'), f'wrong failed-photo fallback: {fallback_src}'
            assert page.locator('#dog-image-status').is_hidden(), 'successful fallback left a loading status'
            page.unroute('**/mydog/images/v1/17/3.webp')
            print('broken lead photo: PASS | another photo of the same dog breed appears')

            # Existing user favorites must keep their match score but shed stale remote URLs.
            page.goto(base, wait_until='domcontentloaded')
            page.evaluate('''() => {
                appState.favorites = [{id:1,name:'Labrador Retriever',breed:'Labrador Retriever',images:['https://images.dog.ceo/old.jpg'],description:'Alt',ratings:{},matchScore:80}];
                saveState();
            }''')
            page.reload(wait_until='domcontentloaded')
            page.locator('#view-favorites-btn').click()
            favorite_src = page.locator('.favorite-card img').get_attribute('src')
            assert favorite_src.startswith('/mydog/images/v1/01/'), f'old favorite image was not migrated: {favorite_src}'
            page.wait_for_function("() => document.querySelector('.favorite-card img')?.naturalWidth > 0", timeout=7000)
            assert '4.0/5' in page.locator('.favorite-card .rating').inner_text(), 'favorite match score was lost'
            print('saved favorites: PASS | old hotlinks migrate without losing scores')

            page.goto(f'{base}?dog=17', wait_until='domcontentloaded')
            page.locator('#results-screen.active').wait_for(timeout=7000)
            page.locator('.thumbnail-gallery').scroll_into_view_if_needed()
            page.wait_for_function("() => document.querySelector('#dog-image-2')?.naturalWidth > 0", timeout=7000)
            page.locator('#dog-image-2').click()
            page.wait_for_function("() => document.querySelector('#dog-image-main')?.naturalWidth > 0", timeout=7000)
            selected_photo = page.locator('#dog-image-main').get_attribute('src')
            page.evaluate('openShareModal()')
            assert page.evaluate('getShareImageState().source') == selected_photo, 'share editor ignored the selected dog photo'
            share = page.evaluate('''async () => {
                const file = await prepareShareImageFile();
                return file && {type:file.type, bytes:file.size, name:file.name};
            }''')
            assert share and share['type']=='image/png' and share['bytes']>15000, f'photo share PNG failed: {share}'
            assert not errors, f'browser exceptions: {errors}'
            print(f"share export: PASS | selected dog-photo PNG ({share['bytes']} bytes); no page errors")

            # A native Android share sheet cannot run in headless Chromium. Intercept its API
            # to verify the actual tap sends the edited PNG while user activation is present.
            page.evaluate('''() => {
                Object.defineProperty(navigator, 'canShare', {configurable:true, value: data => data.files?.[0]?.type === 'image/png'});
                Object.defineProperty(navigator, 'share', {configurable:true, value: async data => {
                    const activated = navigator.userActivation.isActive;
                    const file = data.files?.[0];
                    const signature = file ? [...new Uint8Array(await file.slice(0, 8).arrayBuffer())] : [];
                    window.__nativeShareCapture = {
                        title: data.title, url: data.url, name: file?.name,
                        type: file?.type, bytes: file?.size, signature, activated
                    };
                }});
                closeShareModal();
                // This test already generated a PNG above; emulate the first share tap on a fresh result.
                appState.shareImageFile = null;
                appState.shareImageKey = null;
            }''')
            page.locator('#share-btn').click()
            page.locator('#share-modal.active').wait_for(timeout=7000)
            page.locator('#share-image-source').select_option(index=2)
            page.locator('#share-image-caption').fill('Ein Dalmatiner für dich!')
            page.wait_for_function('''() => getShareImageState().ready
                && getShareImageState().caption === 'Ein Dalmatiner für dich!'
                && !document.querySelector('#native-share-btn').disabled''', timeout=10000)
            edited_photo = page.evaluate('getShareImageState().source')
            page.locator('#native-share-btn').click()
            page.wait_for_function('() => !!window.__nativeShareCapture', timeout=5000)
            native = page.evaluate('window.__nativeShareCapture')
            assert native['activated'] and native['type']=='image/png' and native['bytes']>15000, f'edited share lost image or user activation: {native}'
            assert native['signature']==[137,80,78,71,13,10,26,10], f'native share image is not PNG: {native}'
            assert '?dog=17' in native['url'] and 'Dalmatiner' in native['title'], f'edited share links to wrong dog: {native}'
            assert edited_photo.startswith('/mydog/images/v1/17/') and edited_photo != selected_photo, f'photo selection was lost: {edited_photo}'
            assert not errors, f'browser exceptions after edited native share: {errors}'
            print(f"native-share preflight: PASS | edited PNG ({native['bytes']} bytes), URL, user activation (simulated sheet)")
            context.close()

            offline = browser.new_context(viewport={'width': 390, 'height': 844})
            saved = offline.new_page()
            saved.goto(f'{base}?dog=17', wait_until='domcontentloaded')
            saved.wait_for_function("() => document.querySelector('#dog-image-main')?.naturalWidth > 0", timeout=7000)
            saved.evaluate('() => navigator.serviceWorker.ready')
            saved.wait_for_function('''async () => {
                const url = document.querySelector('#dog-image-main')?.src;
                return !!(url && await caches.open('mydog-images-v3').then(cache => cache.match(url)));
            }''', timeout=7000)
            offline.set_offline(True)
            saved.reload(wait_until='domcontentloaded')
            saved.wait_for_function("() => document.querySelector('#dog-image-main')?.naturalWidth > 0", timeout=7000)
            assert saved.locator('#dog-name').inner_text() == 'Dalmatiner', 'offline dog profile changed breed'
            print('offline PWA: PASS | cached dog photo and profile survive an offline reload')
            offline.close()
            browser.close()
    finally:
        server.shutdown()
        server.server_close()


if __name__ == '__main__':
    main()
