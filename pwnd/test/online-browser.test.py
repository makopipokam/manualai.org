#!/usr/bin/env python3
"""Mocked-auth UI test: serve repo root on PORT=4173, no real account needed."""
import json
import os
import shutil
from playwright.sync_api import sync_playwright

URL = os.getenv('PWND_ONLINE_URL', f"http://127.0.0.1:{os.getenv('PORT', '4173')}/pwnd/online.html")
SUPABASE_MOCK = r"""
(() => {
  const initial = { resources: { energy: 1000, water: 500, air: 300, love: 100 },
    buildings: [], revision: 0, serverTime: '2026-10-02T12:00:00.000Z' };
  const mock = window.__onlineMock = { snapshot: JSON.parse(sessionStorage.getItem('mockPond') || 'null') || initial,
    calls: [], loggedIn: sessionStorage.getItem('mockLoggedIn') === 'true', listener: null };
  window.supabase = { createClient: () => ({
    auth: {
      getUser: async () => ({data: {user: mock.loggedIn ? {id:'sample-user'} : null}, error: null}),
      signInWithOtp: async ({email}) => {mock.calls.push(['send', email]); return {error:null};},
      verifyOtp: async ({token}) => {mock.calls.push(['verify', token]); mock.loggedIn=true;
        sessionStorage.setItem('mockLoggedIn','true');
        if(mock.listener) setTimeout(() => mock.listener('SIGNED_IN',{}),0); return {error:null};},
      signOut: async () => {mock.loggedIn=false;sessionStorage.removeItem('mockLoggedIn'); if(mock.listener) mock.listener('SIGNED_OUT',null);
        return {error:null};},
      onAuthStateChange: (fn) => {mock.listener=fn;return {data:{subscription:{unsubscribe(){}}}};},
    },
    rpc: async (name,args={}) => {
      mock.calls.push([name,args]);
      if(!mock.loggedIn) return {data:null,error:{message:'auth_required'}};
      if(mock.delayNext){mock.delayNext=false;await new Promise(resolve=>setTimeout(resolve,450));}
      const s=mock.snapshot;
      if(name==='pwnd_get_pond') return {data:structuredClone(s),error:null};
      if(args.p_revision!==s.revision) return {data:null,error:{message:'revision_conflict'}};
      let result;
      if(args.p_kind==='place') result=window.PwndPondDemo.placeBuilding({
        buildings:s.buildings,resources:s.resources,type:args.p_type,x:args.p_x,y:args.p_y,nowMs:1000});
      if(args.p_kind==='move') result=window.PwndPondDemo.moveBuilding({
        buildings:s.buildings,resources:s.resources,type:args.p_type,x:args.p_x,y:args.p_y,nowMs:1000});
      if(args.p_kind==='claim') result=window.PwndPondDemo.claimProduction({
        buildings:s.buildings,resources:s.resources,nowMs:1000});
      if(!result) return {data:null,error:{message:'invalid_building'}};
      s.buildings=result.buildings;
      if(result.resources) s.resources=result.resources;
      s.revision++;
      sessionStorage.setItem('mockPond',JSON.stringify(s));
      return {data:structuredClone(s),error:null};
    },
  })};
})();
"""


def run():
    binary = shutil.which('chromium') or shutil.which('google-chrome')
    if not binary:
        raise RuntimeError('Chromium is required')
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, executable_path=binary, args=['--no-sandbox'])
        context = browser.new_context(viewport={'width': 390, 'height': 844}, reduced_motion='reduce')
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.route('**/catsdogs/vendor/supabase.js', lambda route: route.fulfill(
            status=200, content_type='application/javascript', body=SUPABASE_MOCK))
        page.add_init_script("localStorage.setItem('pwnd-profile', JSON.stringify({energy: 900000, water: 900000, air: 900000, love: 900000}));")
        page.goto(URL, wait_until='domcontentloaded')
        page.locator('#authView:visible').wait_for()
        assert page.locator('#pondView:visible').count() == 0
        page.locator('#emailInput').fill('demo@example.test')
        page.locator('#sendCodeBtn').click()
        assert page.locator('#codeForm').is_visible()
        page.locator('#codeInput').fill('12345678')
        page.locator('#verifyCodeBtn').click()
        page.locator('#pondView:visible').wait_for()
        assert page.locator('#onlineEnergy').inner_text() == '1000', 'Local 900000 must never be imported'
        assert page.locator('.build-choice').count() == 3
        assert page.locator('.build-cell').count() == 100
        assert 'PASSIVER NACHBARSCHAFTSBONUS' in page.locator('#onlinePassiveBonusTitle').inner_text()
        assert 'automatisch' in page.locator('#onlineBonus').inner_text()
        assert page.evaluate("document.querySelector('#onlineBonus').compareDocumentPosition(document.querySelector('#onlineClaimBtn')) & Node.DOCUMENT_POSITION_FOLLOWING")
        page.locator('[data-building="solar_lily"]').click()
        page.locator('#onlineGrid [data-x="0"][data-y="0"]').click()
        page.locator('#onlineSolar.visible').wait_for()
        page.locator('[data-building="spring_pool"]').click()
        boosted = page.locator('#onlineGrid [data-x="2"][data-y="0"]')
        assert 'boosted' in boosted.get_attribute('class')
        boosted.click()
        page.locator('#onlineSpring.visible').wait_for()
        assert 'Sonnenwasser' in page.locator('#onlineBonus').inner_text()
        assert 'Solar-Seerose' in page.locator('#onlineBonus').inner_text()
        page.locator('[data-building="reed_windmill"]').click()
        page.locator('#onlineGrid [data-x="4"][data-y="0"]').click()
        page.locator('#onlineReed.visible').wait_for()
        assert 'Schilfstrom' in page.locator('#onlineBonus').inner_text()
        assert page.locator('#onlineEnergy').inner_text() == '700'
        assert page.locator('#onlineAir').inner_text() == '140'
        page.evaluate("() => { const s=window.__onlineMock.snapshot; s.buildings.forEach(b => b.bank=({solar_lily:420,spring_pool:120,reed_windmill:240})[b.type]); document.dispatchEvent(new Event('visibilitychange')); }")
        page.wait_for_function("document.querySelector('#onlinePending').textContent.includes('+420')")
        page.locator('#onlineClaimBtn').click()
        page.wait_for_function("document.querySelector('#onlineEnergy').textContent === '1120'")
        assert page.locator('#onlineWater').inner_text() == '340'
        assert page.locator('#onlineAir').inner_text() == '380'
        assert page.locator('#onlineClaimBtn').is_disabled()
        page.locator('[data-building="spring_pool"]').click()
        page.locator('#onlineGrid [data-x="8"][data-y="8"]').click()
        page.wait_for_function("document.querySelector('#onlineBonus').textContent.indexOf('Sonnenwasser') < 0")
        assert page.locator('#onlineEnergy').inner_text() == '1120', 'Moving must be free'
        page.reload(wait_until='domcontentloaded')
        page.locator('#pondView:visible').wait_for()
        assert page.locator('.build-choice.built').count() == 3
        assert page.locator('#onlineEnergy').inner_text() == '1120'
        assert json.loads(page.evaluate("localStorage.getItem('pwnd-profile')"))['energy'] == 900000
        page.screenshot(path='/tmp/pwnd-online-pond-mobile.png', full_page=True)
        page.evaluate('() => { window.__onlineMock.delayNext=true; document.dispatchEvent(new Event("visibilitychange")); }')
        page.locator('#logoutBtn').click()
        page.locator('#authView:visible').wait_for()
        page.wait_for_timeout(600)
        assert page.locator('#pondView:visible').count() == 0
        assert not page.locator('#codeForm').is_visible(), 'OTP form must reset after logout'
        assert page.locator('#codeInput').input_value() == ''
        assert not errors, errors
        browser.close()
        print('pwnd online browser test: OTP login → 3 buildings → both bonuses → server claim → free move → reload → logout, local state untouched OK')


if __name__ == '__main__':
    run()
