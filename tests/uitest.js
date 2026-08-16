/* Browser smoke test.  Run: node tests/uitest.js
 *
 * Loads the real page in Chromium and drives the actual UI: every nav view,
 * a full firm OA (rapid speed section + paged section), the results screen,
 * a topic drill, and the market-making game. Fails on any console error or
 * uncaught exception.
 */
'use strict';
const path = require('path');
const { chromium } = require('playwright');

const URL = 'file://' + path.join(__dirname, '..', 'index.html');

let fail = 0;
function ok(cond, msg) {
  if (cond) console.log('  \x1b[32m✓\x1b[0m ' + msg);
  else { fail++; console.log('  \x1b[31m✗ ' + msg + '\x1b[0m'); }
}

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
  });
  const page = await browser.newPage();

  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));

  await page.goto(URL);
  await page.waitForSelector('#view h1');

  /* ------------------------------------------------------------ nav views */
  console.log('\n\x1b[1mNavigation\x1b[0m');
  const routes = ['home', 'firms', 'interviews', 'mmgame', 'speed', 'drill', 'review', 'stats', 'about'];
  for (const r of routes) {
    await page.click(`.nav button[data-route="${r}"]`);
    await page.waitForTimeout(120);
    const has = await page.$('#view h1');
    ok(!!has, `route "${r}" rendered`);
  }

  /* ------------------------------------------------- full firm OA (DRW) */
  console.log('\n\x1b[1mFirm OA — DRW (paged, 6 questions)\x1b[0m');
  await page.click('.nav button[data-route="firms"]');
  await page.waitForTimeout(100);
  await page.evaluate(() => window.QPstartOA('drw'));
  await page.waitForSelector('#begin');
  ok(true, 'briefing screen shown');
  await page.click('#begin');
  await page.waitForSelector('.qcard');
  ok(await page.$('#clock') !== null, 'section timer present');

  for (let i = 0; i < 6; i++) {
    const isText = await page.$('#ans');
    if (isText) {
      const tag = await page.evaluate(() => document.querySelector('#ans').tagName);
      await page.fill('#ans', tag === 'TEXTAREA' ? 'my reasoning' : '42');
    } else {
      const c = await page.$('.choice');
      if (c) await c.click();
    }
    await page.click('#next');
    await page.waitForTimeout(90);
  }
  await page.waitForSelector('.res-hero', { timeout: 5000 });
  ok(true, 'results screen reached after final question');
  const scoreTxt = await page.textContent('.res-score');
  ok(/%/.test(scoreTxt), 'score rendered: ' + scoreTxt.trim());
  ok(await page.$('#reviewList .rev') !== null, 'review list populated');

  /* expand a solution */
  await page.click('#reviewList .rev-head');
  await page.waitForTimeout(80);
  const solVisible = await page.evaluate(() =>
    !document.querySelector('#reviewList .rev-body').classList.contains('hide'));
  ok(solVisible, 'solution expands on click');

  /* --------------------------------------------- rapid speed section */
  console.log('\n\x1b[1mSpeed test — rapid entry mode\x1b[0m');
  await page.click('.nav button[data-route="speed"]');
  await page.waitForSelector('[data-preset]');
  await page.click('[data-preset="3"]');            // Zetamac-style sprint
  await page.waitForSelector('#mmin');
  ok(true, 'rapid mode rendered');

  const firstQ = await page.textContent('#mmq');
  ok(firstQ && firstQ.length > 0, 'question displayed: ' + firstQ);

  for (let i = 0; i < 5; i++) {
    await page.fill('#mmin', '1');
    await page.press('#mmin', 'Enter');
    await page.waitForTimeout(50);
  }
  const counter = await page.textContent('#counter');
  ok(/^6 \//.test(counter), 'advances on Enter (now at ' + counter.trim() + ')');
  const wrongCount = await page.textContent('#mWrong');
  ok(parseInt(wrongCount, 10) >= 0, 'live scoring updates (wrong=' + wrongCount + ')');

  /* skip on empty enter */
  await page.press('#mmin', 'Enter');
  await page.waitForTimeout(60);
  ok(/^7 \//.test(await page.textContent('#counter')), 'empty Enter skips without penalty');

  /* -------------------------------------------------- market making game */
  console.log('\n\x1b[1mMarket-making game\x1b[0m');
  await page.click('.nav button[data-route="mmgame"]');
  await page.waitForSelector('#bid');
  ok(true, 'game rendered');

  /* crossed market must be rejected */
  await page.fill('#bid', '10');
  await page.fill('#ask', '5');
  await page.click('#quote');
  await page.waitForTimeout(80);
  const err = await page.textContent('#err');
  ok(/offer must be above/.test(err), 'crossed market rejected');

  /* play the game through to its results screen (default 12 rounds) */
  let rounds = 0;
  while (rounds < 25) {
    const quoting = await page.$('#bid');
    if (!quoting) break;                       // reached results
    await page.fill('#bid', '3');
    await page.fill('#ask', '9');
    await page.fill('#size', '5');
    await page.click('#quote');
    await page.waitForSelector('#next');
    rounds++;
    await page.click('#next');
    await page.waitForTimeout(90);
  }
  ok(rounds === 12, 'played all 12 rounds (played ' + rounds + ')');
  ok(await page.$('.mmg-log') !== null, 'trade log rendered');
  const mmTxt = await page.textContent('#view');
  ok(/net P&L over/.test(mmTxt), 'game results screen shown');
  ok(/Feedback/.test(mmTxt), 'coaching feedback generated');

  /* --------------------------------------------------------- topic drill */
  console.log('\n\x1b[1mTopic drill\x1b[0m');
  await page.click('.nav button[data-route="drill"]');
  await page.waitForSelector('#dgo');
  await page.selectOption('#dcat', 'probability');
  await page.selectOption('#dcount', '5');
  await page.selectOption('#dtime', '0');
  await page.waitForTimeout(80);
  const cnt = await page.textContent('#dcnt');
  ok(/questions match/.test(cnt), 'match counter updates: ' + cnt.trim());
  await page.click('#dgo');
  await page.waitForSelector('.qcard');
  ok(true, 'drill started');
  ok(await page.$('[data-nav]') !== null, 'question navigator present when back-navigation allowed');

  /* ------------------------------------------------ analytics after runs */
  console.log('\n\x1b[1mAnalytics\x1b[0m');
  await page.click('.nav button[data-route="stats"]');
  await page.waitForTimeout(150);
  const statsTxt = await page.textContent('#view');
  ok(/Tests taken/.test(statsTxt), 'analytics dashboard rendered');
  ok(/Performance by category/.test(statsTxt), 'category breakdown present after real attempts');
  ok(/Market-making games/.test(statsTxt), 'MM game history recorded');

  /* ---------------------------------------------------- interview flow */
  console.log('\n\x1b[1mInterview simulator\x1b[0m');
  await page.click('.nav button[data-route="interviews"]');
  await page.waitForSelector('.firm-card');
  await page.click('.firm-card');
  await page.waitForSelector('#go');
  ok(/Round 1 of/.test(await page.textContent('#view')), 'interview round briefing shown');
  await page.click('#go');
  await page.waitForTimeout(200);
  ok(await page.$('.qcard, #mmin, #bid') !== null, 'first interview round started');

  /* --------------------------------------------------------------- done */
  console.log('\n\x1b[1mConsole cleanliness\x1b[0m');
  if (errors.length) {
    fail++;
    console.log('  \x1b[31m✗ ' + errors.length + ' console/page errors:\x1b[0m');
    errors.slice(0, 10).forEach(e => console.log('    • ' + e));
  } else {
    console.log('  \x1b[32m✓\x1b[0m no console errors or uncaught exceptions');
  }

  await browser.close();
  console.log('\n' + '─'.repeat(58));
  console.log(fail === 0 ? '\x1b[32m✓ UI smoke test passed\x1b[0m'
                         : `\x1b[31m✗ ${fail} UI checks failed\x1b[0m`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
