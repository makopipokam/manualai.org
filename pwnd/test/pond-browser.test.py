#!/usr/bin/env python3
"""End-to-end local demo test. Run against a static server with PORT=4173 by default."""
import json
import os
import pathlib
import shutil
import time
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
QUESTIONS = json.loads((ROOT / 'pwnd-ai-questions.json').read_text())
URL = f"http://127.0.0.1:{os.getenv('PORT', '4173')}/pwnd/"


def profile(page):
    return page.evaluate("JSON.parse(localStorage.getItem('pwnd-profile'))")


def run():
    binary = shutil.which('chromium') or shutil.which('google-chrome')
    if not binary:
        raise RuntimeError('Chromium is required for this local browser check')
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, executable_path=binary, args=['--no-sandbox'])
        context = browser.new_context(viewport={'width': 390, 'height': 844}, reduced_motion='reduce')
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))

        def answer_from_local_pool(route):
            body = route.request.post_data_json
            candidates = [q for q in QUESTIONS if q['topicId'] == body['topicId'] and q['id'] not in body.get('excludeIds', [])]
            assert candidates, f"No more prepared questions for {body['topicId']}"
            route.fulfill(status=200, content_type='application/json', body=json.dumps({'question': candidates[0], 'fallback': True}))

        page.route('**/api/pwnd-question', answer_from_local_pool)
        page.goto(URL, wait_until='domcontentloaded')
        assert page.locator('#pondBuildGrid .build-cell').count() == 100
        assert page.locator('#pondBuildGrid .build-cell.core').count() == 4
        assert page.locator('#pondBuiltSolar.visible').count() == 0
        page.locator('#freeQuizBtn').click()
        topic = page.locator('.free-topic-option').first.get_attribute('data-topic')
        page.locator('.free-topic-option').first.click()
        page.locator('#freeStartBtn').click()
        for index in range(8):
            page.locator('#screenBattle.active #answers .answer').first.wait_for(timeout=15000)
            prompt = page.locator('#questionTitle').inner_text()
            question = next(q for q in QUESTIONS if q['prompt'] == prompt)
            assert question['topicId'] == topic, f'Question escaped its topic: {prompt}'
            page.locator(f'#answers .answer[data-answer="{question["answer"]}"]').click()
            page.locator('#lockBtn').click()
            page.locator('#screenRound.active').wait_for()
            if index == 7:
                before_failed_completion = profile(page)
                page.evaluate('() => { window.__save = Storage.prototype.setItem; Storage.prototype.setItem = () => { throw new Error("quota test"); }; }')
                page.locator('#continueBtn').click()
                assert page.locator('#screenRound.active').count() == 1
                assert profile(page) == before_failed_completion, 'Failed settlement may not credit an attempt'
                assert page.locator('#saveWarning').is_visible()
                page.evaluate('() => { Storage.prototype.setItem = window.__save; }')
            page.locator('#continueBtn').click()
        page.locator('#screenEnd.active').wait_for()
        assert not page.locator('#saveWarning').is_visible(), 'Successful retry should clear transient save warning'
        earned = profile(page)
        assert earned['energy'] == 1008, earned
        assert len(earned['pondDemo']['completedAttempts']) == 1, earned
        page.evaluate('finishMatch()')
        assert profile(page) == earned, 'Repeated completion must not grant a second reward'
        page.locator('#goBuildBtn').click()
        assert page.locator('#screenStart.active').count() == 1
        assert page.evaluate('document.activeElement.id') == 'pondBuildTitle'
        assert page.locator('#pondBuildGrid .build-cell.allowed').count() > 0
        page.locator('#pondBuildGrid .build-cell[data-x="2"][data-y="3"]').click()
        page.locator('#pondBuiltSolar.visible').wait_for(timeout=4000)
        built = profile(page)
        assert built['pondDemo']['buildings'][0]['x'] == 2
        assert built['pondDemo']['buildings'][0]['y'] == 3
        assert {key: built[key] for key in ['energy', 'water', 'air', 'love']} == {
            'energy': earned['energy'] - 120, 'water': earned['water'] - 80,
            'air': earned['air'] - 20, 'love': earned['love'] - 10,
        }
        page.reload(wait_until='domcontentloaded')
        assert profile(page) == built, 'Both the reward and building must survive reload'
        page.evaluate('finishMatch()')
        assert profile(page) == built, 'Reloading cannot credit the previous run a second time'
        assert page.locator('#pondBuildGrid .build-cell.solar').count() == 4
        assert page.locator('#pondBuiltSolar.visible').count() == 1
        assert page.locator('#selectSolarBtn').is_disabled(), 'A second solar lily is unavailable in this slice'
        page.screenshot(path='/tmp/pwnd-pond-demo-mobile.png', full_page=True)
        built['pondDemo']['buildings'][0]['lastClaimAt'] = int(time.time() * 1000) - 3600000
        page.evaluate('(saved) => localStorage.setItem("pwnd-profile", JSON.stringify(saved))', built)
        page.reload(wait_until='domcontentloaded')
        page.locator('#claimSolarBtn').click()
        collected = profile(page)
        assert collected['energy'] == built['energy'] + 120
        assert page.locator('#claimSolarBtn').is_disabled()
        assert len(collected['pondDemo']['completedAttempts']) == 1

        legacy = browser.new_context(viewport={'width': 390, 'height': 844})
        old_page = legacy.new_page()
        old_page.goto(URL, wait_until='domcontentloaded')
        old_page.evaluate('() => localStorage.setItem("pwnd-profile", JSON.stringify({resourceVersion: 2, energy: 1203, water: 317, air: 141, love: 71, unlocked: ["frog", "reeds"], upgrades: ["memory"]}))')
        old_page.reload(wait_until='domcontentloaded')
        assert old_page.locator('#pondEnergy').inner_text() == '1203'
        assert old_page.locator('#pondBuiltSolar.visible').count() == 0
        assert old_page.locator('#pondBuildGrid .build-cell').count() == 100
        assert old_page.locator('.pond-reeds.unlocked').count() == 1
        old_page.evaluate('() => localStorage.setItem("pwnd-profile", JSON.stringify({resourceVersion: 2, energy: "1000", water: -3, air: 120, love: 60, upgrades: {}, unlocked: ["frog"]}))')
        old_page.reload(wait_until='domcontentloaded')
        assert old_page.locator('#pondEnergy').inner_text() == '1000'
        assert old_page.locator('#pondWater').inner_text() == '250'
        old_page.locator('#startBtn').click()
        assert old_page.locator('#screenDuelSetup.active').count() == 1, 'Malformed upgrades cannot crash the duel setup'
        old_page.close()
        legacy.close()

        corrupt = browser.new_context()
        broken = corrupt.new_page()
        broken.goto(URL, wait_until='domcontentloaded')
        broken.evaluate('() => localStorage.setItem("pwnd-profile", "{")')
        broken.reload(wait_until='domcontentloaded')
        assert broken.locator('#saveWarning').is_visible()
        assert broken.evaluate('localStorage.getItem("pwnd-profile-recovery")') == '{'
        assert broken.locator('#pondBuildGrid .build-cell').count() == 100
        broken.close()
        corrupt.close()

        tabs = browser.new_context()
        tab_a, tab_b = tabs.new_page(), tabs.new_page()
        tab_a.goto(URL, wait_until='domcontentloaded')
        tab_b.goto(URL, wait_until='domcontentloaded')
        tab_a.locator('#selectSolarBtn').click()
        tab_a.locator('#pondBuildGrid .build-cell[data-x="0"][data-y="0"]').click()
        tab_b.locator('#saveWarning').wait_for(timeout=3000)
        tab_b.locator('#selectSolarBtn').click()
        tab_b.locator('#pondBuildGrid .build-cell[data-x="2"][data-y="3"]').click()
        assert tab_b.locator('#pondBuiltSolar.visible').count() == 0, 'A stale tab cannot present an unsaved building as success'
        assert profile(tab_b)['pondDemo']['buildings'][0]['x'] == 0, 'A stale tab must not overwrite the newer building'
        tabs.close()

        failed = browser.new_context()
        failed_page = failed.new_page()
        failed_page.goto(URL, wait_until='domcontentloaded')
        failed_page.evaluate('() => { Storage.prototype.setItem = () => { throw new Error("quota test"); }; }')
        failed_page.locator('#selectSolarBtn').click()
        failed_page.locator('#pondBuildGrid .build-cell[data-x="0"][data-y="0"]').click()
        assert failed_page.locator('#saveWarning').is_visible()
        assert failed_page.locator('#pondBuiltSolar.visible').count() == 0
        assert profile(failed_page) is None, 'A failed write cannot produce a fake stored success'
        failed.close()

        assert not errors, f'Browser errors: {errors}'
        context.close()
        browser.close()
        print('pwnd pond browser test: quiz → reward once → build → reload → claim; legacy, corrupt, stale-tab and write-error paths OK')


if __name__ == '__main__':
    run()
