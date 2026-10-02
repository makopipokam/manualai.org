#!/usr/bin/env python3
"""Local pwnd browser regression. Serve repository root on PORT=4173."""
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


def resource_balance(save):
    return {key: save[key] for key in ['energy', 'water', 'air', 'love']}


def free_round(page, fail_final_write=False):
    page.locator('#freeQuizBtn').click()
    topic = page.locator('.free-topic-option').first.get_attribute('data-topic')
    page.locator('.free-topic-option').first.click()
    page.locator('#freeStartBtn').click()
    for index in range(8):
        page.locator('#screenBattle.active #answers .answer').first.wait_for(timeout=15000)
        prompt = page.locator('#questionTitle').inner_text()
        question = next(q for q in QUESTIONS if q['prompt'] == prompt)
        assert question['topicId'] == topic
        page.locator(f'#answers .answer[data-answer="{question["answer"]}"]').click()
        page.locator('#lockBtn').click()
        page.locator('#screenRound.active').wait_for()
        if index == 7 and fail_final_write:
            before_failure = profile(page)
            page.evaluate('() => { window.__save = Storage.prototype.setItem; Storage.prototype.setItem = () => { throw new Error("quota test"); }; }')
            page.locator('#continueBtn').click()
            assert page.locator('#screenRound.active').count() == 1
            assert profile(page) == before_failure
            assert page.locator('#saveWarning').is_visible()
            page.evaluate('() => { Storage.prototype.setItem = window.__save; }')
        page.locator('#continueBtn').click()
    page.locator('#screenEnd.active').wait_for()
    assert not page.locator('#saveWarning').is_visible()
    earned = profile(page)
    page.evaluate('finishMatch()')
    assert profile(page) == earned, 'One attempt may only be credited once'
    page.locator('#goBuildBtn').click()
    assert page.locator('#screenStart.active').count() == 1
    assert page.evaluate('document.activeElement.id') == 'pondBuildTitle'
    return earned


def select(page, type):
    page.locator(f'#buildChoiceList [data-building="{type}"]').click()
    assert page.locator(f'#buildChoiceList [data-building="{type}"].selected').count() == 1


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
        assert page.locator('#buildChoiceList .build-choice').count() == 3
        assert 'PASSIVER NACHBARSCHAFTSBONUS' in page.locator('#passiveBonusTitle').inner_text()
        assert 'automatisch' in page.locator('#buildBonusPreview').inner_text()
        assert page.evaluate("document.querySelector('#buildBonusPreview').compareDocumentPosition(document.querySelector('#claimProductionBtn')) & Node.DOCUMENT_POSITION_FOLLOWING")
        assert page.locator('#pondBuiltSolar.visible, #pondBuiltSpring.visible, #pondBuiltReed.visible').count() == 0

        earned = free_round(page, fail_final_write=True)
        assert earned['energy'] == 1008 and len(earned['pondDemo']['completedAttempts']) == 1
        assert page.locator('[data-building="solar_lily"].selected').count() == 1
        page.locator('#pondBuildGrid .build-cell[data-x="2"][data-y="3"]').click()
        page.locator('#pondBuiltSolar.visible').wait_for(timeout=4000)
        solar = profile(page)
        assert resource_balance(solar) == {'energy': earned['energy'] - 120, 'water': earned['water'] - 80,
                                           'air': earned['air'] - 20, 'love': earned['love'] - 10}
        assert page.locator('[data-building="solar_lily"].built').count() == 1
        select(page, 'reed_windmill')
        page.locator('#pondBuildGrid .build-cell[data-x="0"][data-y="3"]').click()
        page.locator('#pondBuiltReed.visible').wait_for(timeout=4000)
        assert page.locator('[data-building="spring_pool"]').is_disabled(), 'The spring needs more air after solar and reed'
        earned_again = free_round(page)
        assert len(earned_again['pondDemo']['completedAttempts']) == 2
        assert page.locator('[data-building="spring_pool"].selected').count() == 1
        spring_target = page.locator('#pondBuildGrid .build-cell[data-x="1"][data-y="0"]')
        assert 'boosted' in spring_target.get_attribute('class'), 'The player can see the bonus before building'
        spring_target.click()
        page.locator('#pondBuiltSpring.visible').wait_for(timeout=4000)
        assert 'Sonnenwasser' in page.locator('#buildBonusPreview').inner_text()
        assert 'Schilfstrom' in page.locator('#buildBonusPreview').inner_text()
        assert 'Solar-Seerose' in page.locator('#buildBonusPreview').inner_text()
        assert 'Schilf-Windrad' in page.locator('#buildBonusPreview').inner_text()
        built = profile(page)
        assert len(built['pondDemo']['buildings']) == 3
        assert {b['type'] for b in built['pondDemo']['buildings']} == {'solar_lily', 'spring_pool', 'reed_windmill'}
        assert resource_balance(built) == {'energy': 716, 'water': 82, 'air': 20, 'love': 85}
        before_move = resource_balance(built)
        select(page, 'spring_pool')
        page.locator('#pondBuildGrid .build-cell[data-x="8"][data-y="8"]').click()
        assert 'Sonnenwasser' not in page.locator('#buildBonusPreview').inner_text()
        assert resource_balance(profile(page)) == before_move, 'Relocation is free'
        select(page, 'spring_pool')
        page.locator('#pondBuildGrid .build-cell[data-x="1"][data-y="0"]').click()
        assert 'Schilfstrom' in page.locator('#buildBonusPreview').inner_text()
        assert resource_balance(profile(page)) == before_move
        built = profile(page)
        page.reload(wait_until='domcontentloaded')
        assert profile(page) == built, 'Three buildings and rewards survive reload'
        assert page.locator('#pondBuildGrid .build-cell.solar_lily').count() == 4
        assert page.locator('#pondBuildGrid .build-cell.spring_pool').count() == 4
        assert page.locator('#pondBuildGrid .build-cell.reed_windmill').count() == 4
        assert page.locator('#pondBuiltSolar.visible, #pondBuiltSpring.visible, #pondBuiltReed.visible').count() == 3
        page.screenshot(path='/tmp/pwnd-pond-three-buildings-mobile.png', full_page=True)
        for building in built['pondDemo']['buildings']:
            building['lastClaimAt'] = int(time.time() * 1000) - 3600000
            building['bank'] = 0
            building['carry'] = 0
        page.evaluate('(saved) => localStorage.setItem("pwnd-profile", JSON.stringify(saved))', built)
        page.reload(wait_until='domcontentloaded')
        page.locator('#claimProductionBtn').click()
        collected = profile(page)
        assert collected['energy'] == built['energy'] + 420, collected
        assert collected['water'] == built['water'] + 120, collected
        assert collected['air'] == built['air'] + 240, collected
        assert page.locator('#claimProductionBtn').is_disabled()
        assert len(collected['pondDemo']['completedAttempts']) == 2

        legacy = browser.new_context(viewport={'width': 390, 'height': 844})
        old_page = legacy.new_page()
        old_page.goto(URL, wait_until='domcontentloaded')
        old_page.evaluate('() => localStorage.setItem("pwnd-profile", JSON.stringify({resourceVersion: 2, energy: 1203, water: 317, air: 141, love: 71, unlocked: ["frog", "reeds"], upgrades: ["memory"], pondDemo: {buildings: [{type: "solar_lily", x: 2, y: 3, lastClaimAt: Date.now()-3600000}], completedAttempts:["old"]}}))')
        old_page.reload(wait_until='domcontentloaded')
        assert old_page.locator('#pondEnergy').inner_text() == '1203'
        assert old_page.locator('#pondBuiltSolar.visible').count() == 1
        assert old_page.locator('#pondBuildGrid .build-cell').count() == 100
        assert old_page.locator('.pond-reeds.unlocked').count() == 1
        assert '+120' in old_page.locator('#pendingProduction').inner_text()
        assert old_page.locator('[data-building="solar_lily"].built').count() == 1
        old_page.evaluate('() => localStorage.setItem("pwnd-profile", JSON.stringify({resourceVersion: 2, energy: "1000", water: -3, air: 120, love: 60, upgrades: {}, unlocked: ["frog"]}))')
        old_page.reload(wait_until='domcontentloaded')
        assert old_page.locator('#pondEnergy').inner_text() == '1000'
        assert old_page.locator('#pondWater').inner_text() == '250'
        old_page.locator('#startBtn').click()
        assert old_page.locator('#screenDuelSetup.active').count() == 1
        legacy.close()

        corrupt = browser.new_context()
        broken = corrupt.new_page()
        broken.goto(URL, wait_until='domcontentloaded')
        broken.evaluate('() => localStorage.setItem("pwnd-profile", "{")')
        broken.reload(wait_until='domcontentloaded')
        assert broken.locator('#saveWarning').is_visible()
        assert broken.evaluate('localStorage.getItem("pwnd-profile-recovery")') == '{'
        corrupt.close()

        tabs = browser.new_context()
        tab_a, tab_b = tabs.new_page(), tabs.new_page()
        tab_a.goto(URL, wait_until='domcontentloaded')
        tab_b.goto(URL, wait_until='domcontentloaded')
        select(tab_a, 'solar_lily')
        tab_a.locator('#pondBuildGrid .build-cell[data-x="0"][data-y="0"]').click()
        tab_b.locator('#saveWarning').wait_for(timeout=3000)
        select(tab_b, 'solar_lily')
        tab_b.locator('#pondBuildGrid .build-cell[data-x="2"][data-y="3"]').click()
        assert tab_b.locator('#pondBuiltSolar.visible').count() == 0
        assert profile(tab_b)['pondDemo']['buildings'][0]['x'] == 0
        tabs.close()

        failed = browser.new_context()
        failed_page = failed.new_page()
        failed_page.goto(URL, wait_until='domcontentloaded')
        failed_page.evaluate('() => { Storage.prototype.setItem = () => { throw new Error("quota test"); }; }')
        select(failed_page, 'solar_lily')
        failed_page.locator('#pondBuildGrid .build-cell[data-x="0"][data-y="0"]').click()
        assert failed_page.locator('#saveWarning').is_visible()
        assert failed_page.locator('#pondBuiltSolar.visible').count() == 0
        assert profile(failed_page) is None
        failed.close()

        assert not errors, f'Browser errors: {errors}'
        context.close()
        browser.close()
        print('pwnd pond browser test: two quizzes → three buildings → both bonuses → move → triple claim → reload; legacy and storage safeguards OK')


if __name__ == '__main__':
    run()
