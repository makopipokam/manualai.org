#!/usr/bin/env python3
"""Browser regression for the MyCat × MyDog private profile onboarding.

All Supabase calls are mocked; the test never contacts the live auth/database
service and does not create or alter any user profile.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from shutil import which
from threading import Thread

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


MOCK_SUPABASE = r"""
window.__otpRequested = null;
window.__otpVerified = null;
window.__savedPayload = null;
window.supabase = {
  createClient: () => ({
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithOtp: async ({ email }) => {
        window.__otpRequested = email;
        return { error: null };
      },
      verifyOtp: async ({ email, token }) => {
        window.__otpVerified = { email, token };
        const user = { id: '00000000-0000-4000-8000-000000000001', email };
        return { data: { user, session: { user } }, error: null };
      },
      signOut: async () => ({ error: null })
    },
    from: table => {
      if (table !== 'mycat_dating_profiles') throw new Error(`unexpected table: ${table}`);
      return {
        select() { return this; },
        eq() { return this; },
        maybeSingle: async () => ({ data: null, error: null }),
        upsert(payload) {
          window.__savedPayload = payload;
          return { select() { return this; }, single: async () => ({ data: payload, error: null }) };
        },
        delete() { return { eq: async () => ({ error: null }) }; }
      };
    }
  })
};
"""

MYCAT_STATE = r"""
localStorage.setItem('mycat_appState', JSON.stringify({
  lastResult: {
    scoringVersion: 'test-v1',
    catIds: [1, 2],
    matchScores: { 1: 91.5, 2: 84 },
    userPersonality: { O: 4, C: 3, E: 4, A: 5, N: 2 },
    completedAt: '2026-10-04T10:00:00.000Z'
  },
  userAnswers: Array(30).fill(5),
  favorites: [{ id: 3 }],
  unrelatedLocalField: 'must not leave the browser'
}));
"""


def main():
    server = ThreadingHTTPServer(
        ('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT))
    )
    Thread(target=server.serve_forever, daemon=True).start()
    errors = []
    try:
        with sync_playwright() as playwright:
            chromium_path = which('chromium')
            browser = playwright.chromium.launch(
                headless=True,
                executable_path=chromium_path,
                args=['--no-sandbox'] if chromium_path else [],
            )
            page = browser.new_page(viewport={'width': 390, 'height': 844})
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.route(
                '**/catsdogs/vendor/supabase.js',
                lambda route: route.fulfill(
                    status=200,
                    content_type='application/javascript',
                    body=MOCK_SUPABASE,
                ),
            )
            page.add_init_script(MYCAT_STATE)
            url = f'http://127.0.0.1:{server.server_address[1]}/mycat/cats&dogs/'
            page.goto(url, wait_until='networkidle')

            page.locator('#email-address').fill('tester@example.test')
            page.locator('#send-code').click()
            page.locator('#verify-form').wait_for(state='visible')
            page.locator('#email-code').fill('12345678')
            page.locator('#verify-code').click()
            page.locator('input[name="genotype"]').first.wait_for()

            values = page.locator('input[name="genotype"]').evaluate_all(
                'inputs => inputs.map(input => input.value)'
            )
            assert values == ['XX', 'XY', 'X0', 'XXY', 'XYY', 'XXX'], values
            assert page.locator('input[name="gender"]').count() == 0
            assert page.evaluate('window.__otpRequested') == 'tester@example.test'
            assert page.evaluate('window.__otpVerified.token') == '12345678'

            page.locator('.genotype-option').nth(1).click()
            page.locator('#genotype-consent').check()
            page.locator('#mycat-consent').check()
            page.locator('#save-profile').click()
            page.get_by_text(
                'Dein Profil wurde privat gespeichert. Matching ist noch nicht aktiv.',
                exact=True,
            ).wait_for()

            payload = page.evaluate('window.__savedPayload')
            assert payload['user_id'] == '00000000-0000-4000-8000-000000000001'
            assert payload['genotype'] == 'XY'
            assert payload['genotype_consent_at']
            assert payload['genotype_consent_version'].startswith('genotype-profile-v1-')
            result = payload['mycat_result']
            assert result['catIds'] == [1, 2]
            assert result['matchScores'] == {'1': 91.5, '2': 84}
            assert result['userPersonality'] == {'O': 4, 'C': 3, 'E': 4, 'A': 5, 'N': 2}
            assert set(result) == {
                'scoringVersion', 'catIds', 'matchScores', 'userPersonality', 'completedAt'
            }
            assert payload['mycat_result_consent_at']
            assert page.evaluate('document.documentElement.scrollWidth === window.innerWidth')
            assert not errors, errors
            print(
                'dating profile: PASS | email OTP, six genotypes, no gender field, '
                'explicit consent, minimal MyCat transfer, mobile width'
            )
            browser.close()
    finally:
        server.shutdown()
        server.server_close()


if __name__ == '__main__':
    main()
