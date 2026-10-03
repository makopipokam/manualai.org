#!/usr/bin/env python3
"""Check MyCat legal pages over HTTP and under a real browser/service worker."""

from functools import partial
from html.parser import HTMLParser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys
from threading import Thread
from urllib.request import urlopen

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
ROUTES = (
    '/mycat/',
    '/mycat/legal/privacy.html',
    '/mycat/legal/impressum.html',
    '/mycat/legal/attribution.html',
)
LEGAL_HEADINGS = (
    ('/mycat/legal/privacy.html', 'Datenschutzerklärung'),
    ('/mycat/legal/impressum.html', 'Impressum'),
)


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


class QuietServer(ThreadingHTTPServer):
    def handle_error(self, request, client_address):
        if not isinstance(sys.exc_info()[1], (BrokenPipeError, ConnectionResetError)):
            super().handle_error(request, client_address)


class MyCatLinks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = set()

    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            self.links.update(value for key, value in attrs if key == 'href' and value.startswith('/mycat/'))


def check_http(base):
    for route in ROUTES:
        with urlopen(base + route) as response:
            assert response.status == 200 and 'text/html' in response.headers['Content-Type'], route
            html = response.read().decode('utf-8')
        links = MyCatLinks()
        links.feed(html)
        for link in links.links:
            with urlopen(base + link) as response:
                assert response.status == 200, (route, link)
        print(f'legal HTTP/links: PASS | {route} ({len(links.links)} internal links)')


def check_browser(base):
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        try:
            for width, height in ((320, 568), (390, 844), (1280, 900)):
                context = browser.new_context(viewport={'width': width, 'height': height})
                try:
                    page = context.new_page()
                    for route, heading in LEGAL_HEADINGS:
                        page.goto(base + route)
                        assert page.locator('h1').inner_text() == heading, route
                        assert 'PICARD Lederwaren GmbH & Co. KG' in page.locator('article').inner_text(), route
                        if not page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'):
                            metrics = page.evaluate('''() => ({
                                viewport: innerWidth,
                                document: document.documentElement.scrollWidth,
                                body: document.body.scrollWidth,
                                elements: Array.from(document.querySelectorAll('body *'))
                                    .filter(element => element.getBoundingClientRect().right > innerWidth + 1
                                        || element.scrollWidth > element.clientWidth + 1)
                                    .slice(0, 8).map(element => ({
                                        tag: element.tagName, className: element.className,
                                        right: element.getBoundingClientRect().right,
                                        scrollWidth: element.scrollWidth, clientWidth: element.clientWidth
                                    }))
                            })''')
                            raise AssertionError(f'{width}px overflow on {route}: {metrics}')
                    page.goto(base + '/mycat/')
                    assert page.locator('.mycat-footer a').count() == 4
                    page.evaluate('navigator.serviceWorker.ready')
                    page.wait_for_function('navigator.serviceWorker.controller !== null')
                    page.wait_for_function("caches.has('mycat-static-v1')")
                    context.set_offline(True)
                    for route, heading in LEGAL_HEADINGS:
                        page.goto(base + route)
                        assert page.locator('h1').inner_text() == heading, route
                    print(f'legal Chromium: PASS | {width}x{height} layout, footer and offline privacy/imprint')
                finally:
                    context.close()
        finally:
            browser.close()


def main():
    server = QuietServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        base = f'http://127.0.0.1:{server.server_port}'
        check_http(base)
        check_browser(base)
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=3)


if __name__ == '__main__':
    main()
