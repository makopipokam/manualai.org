#!/usr/bin/env python3
"""Owl topic entrance and commentary on local or isolated live pwnd pages."""
import json
import os
import shutil
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
QUESTIONS = json.loads((ROOT / 'pwnd-ai-questions.json').read_text())
URL = os.getenv('PWND_QUIZ_URL', f"http://127.0.0.1:{os.getenv('PORT', '4173')}/pwnd/")


def main():
    binary = shutil.which('chromium') or shutil.which('google-chrome')
    if not binary:
        raise RuntimeError('Chromium is required for this browser test')
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, executable_path=binary, args=['--no-sandbox'])
        context = browser.new_context(viewport={'width': 390, 'height': 844})
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))

        def respond(route):
            body = route.request.post_data_json
            next_question = next(q for q in QUESTIONS if q['topicId'] == body['topicId'] and q['id'] not in body.get('excludeIds', []))
            route.fulfill(status=200, content_type='application/json', body=json.dumps({'question': next_question, 'fallback': True}))

        page.route('**/api/pwnd-question', respond)
        page.goto(URL, wait_until='domcontentloaded')
        page.locator('#freeQuizBtn').click()
        page.locator('#screenFreeTopicSetup.active').wait_for()
        assert page.locator('.free-topic-option').count() == 3
        assert page.locator('.free-topic-option small, .free-topic-option em, #screenFreeTopicSetup .setup-note').count() == 0
        assert page.locator('#freeStartBtn').inner_text().strip() == 'LOS!'
        owl = page.locator('.owl-reveal img')
        owl.wait_for()
        assert owl.evaluate('(image) => image.complete && image.naturalWidth > 0'), 'The owl portrait must load'
        assert 'owlEmerge' in owl.evaluate('(image) => getComputedStyle(image).animationName')
        page.wait_for_timeout(1450)
        page.screenshot(path='/tmp/pwnd-owl-topics.png', full_page=True)
        page.locator('#freeStartBtn').click()
        assert 'shadow-owl.webp' in page.locator('#countdownAvatar img').get_attribute('src')
        page.locator('#screenBattle.active #aiComment:visible').wait_for(timeout=15000)
        first_comment = page.locator('#aiComment').inner_text()
        assert 'beobachtet' in first_comment
        assert page.locator('#questionType').inner_text() == 'DIE EULE DENKT'
        page.locator('#screenBattle.active #answers .answer').first.wait_for(timeout=10000)
        assert page.locator('#aiComment').is_visible()
        assert page.locator('#aiComment').inner_text() == first_comment
        question = next(q for q in QUESTIONS if q['prompt'] == page.locator('#questionTitle').inner_text())
        page.locator(f'#answers .answer[data-answer="{(question["answer"] + 1) % 4}"]').click()
        page.locator('#lockBtn').click()
        page.locator('#screenRound.active').wait_for()
        page.locator('#continueBtn').click()
        page.locator('#screenBattle.active #aiComment:visible').wait_for(timeout=10000)
        next_comment = page.locator('#aiComment').inner_text()
        assert next_comment != first_comment and 'Lücke' in next_comment
        page.locator('#screenBattle.active #answers .answer').first.wait_for(timeout=10000)
        assert page.locator('#aiComment').is_visible() and page.locator('#aiComment').inner_text() == next_comment
        assert not errors, errors
        reduced = browser.new_context(viewport={'width': 390, 'height': 844}, reduced_motion='reduce')
        reduced_page = reduced.new_page()
        reduced_page.goto(URL, wait_until='domcontentloaded')
        reduced_page.locator('#freeQuizBtn').click()
        assert reduced_page.locator('.free-topic-option:visible').count() == 3
        assert reduced_page.locator('.owl-reveal img').evaluate('(image) => getComputedStyle(image).animationName') == 'none'
        reduced.close()
        browser.close()
        print('owl entry UI: shadow entrance, three named topics, no helper prose, commentary while thinking and answering')


if __name__ == '__main__':
    main()
