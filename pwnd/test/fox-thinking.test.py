#!/usr/bin/env python3
"""Local fox dialogue transition. Serve repository root on PORT=4173."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
QUESTIONS = json.loads((ROOT / 'pwnd-ai-questions.json').read_text())[:2]
URL = os.getenv('PWND_QUIZ_URL', f"http://127.0.0.1:{os.getenv('PORT', '4173')}/pwnd/")


def main():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        context = browser.new_context(viewport={'width': 390, 'height': 844}, reduced_motion='reduce')
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))

        def respond(route):
            used = route.request.post_data_json.get('excludeIds', [])
            question = next(q for q in QUESTIONS if q['id'] not in used)
            route.fulfill(status=200, content_type='application/json', body=json.dumps({'question': question, 'fallback': True}))

        page.route('**/api/pwnd-question', respond)
        page.goto(URL, wait_until='domcontentloaded')
        page.locator('#startBtn').click()
        page.locator('#duelStartBtn').click()
        page.locator('#screenBattle.active #aiComment:visible').wait_for(timeout=15000)
        first = page.locator('#aiComment').inner_text()
        assert page.locator('#questionType').inner_text() == 'DER FUCHS DENKT'
        assert page.locator('#answers .answer').count() == 0
        assert not page.locator('#lockBtn').is_visible()
        assert 'wertet deine letzte Antwort aus' not in first
        page.screenshot(path='/tmp/pwnd-fox-thinking.png', full_page=True)
        page.locator('#screenBattle.active #answers .answer').first.wait_for(timeout=10000)
        assert not page.locator('#aiComment').is_visible(), 'The fox commentary must not accompany answer options'
        assert page.locator('#lockBtn').is_visible()
        assert page.locator('#questionTitle').inner_text() == QUESTIONS[0]['prompt']
        page.screenshot(path='/tmp/pwnd-fox-question.png', full_page=True)
        wrong = (QUESTIONS[0]['answer'] + 1) % 4
        page.locator(f'#answers .answer[data-answer="{wrong}"]').click()
        page.locator('#lockBtn').click()
        page.locator('#screenRound.active').wait_for()
        page.locator('#continueBtn').click()
        page.locator('#screenBattle.active #aiComment:visible').wait_for(timeout=15000)
        second = page.locator('#aiComment').inner_text()
        assert second != first, 'The fox must react to the previous answer before the next question'
        assert 'wertet deine letzte Antwort aus' not in second
        assert page.locator('#answers .answer').count() == 0
        assert not page.locator('#lockBtn').is_visible()
        page.locator('#screenBattle.active #answers .answer').first.wait_for(timeout=10000)
        assert not page.locator('#aiComment').is_visible()
        assert page.locator('#questionTitle').inner_text() == QUESTIONS[1]['prompt']
        assert not errors, errors
        browser.close()
        print('fox thinking UI: adaptive comment on thinking screen, removed on both question screens, old placeholder absent')


if __name__ == '__main__':
    main()
