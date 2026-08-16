/* Headless self-test.  Run: node tests/selftest.js
 *
 * Loads the browser sources into a fake window and exercises the bank,
 * the answer parser, the generators, every firm blueprint and the
 * market-making game.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const FILES = [
  'js/bank/probability.js', 'js/bank/statistics.js', 'js/bank/brainteasers.js',
  'js/bank/marketmaking.js', 'js/bank/programming.js',
  'js/bank/discretemath.js', 'js/bank/datawrangling.js',
  'js/generators.js', 'js/firms.js', 'js/interviews.js', 'js/stats.js', 'js/engine.js'
];

/* Minimal browser shims: stats.js touches localStorage. */
const store = {};
const sandbox = {
  localStorage: {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; }
  },
  Math, Date, JSON, Number, String, Object, Array, isNaN, isFinite, parseInt, parseFloat,
  console, Function, Error, Blob: function () {}
};
/* In a browser `window` IS the global object, so `window.QP = ...` also
 * creates a bare `QP` binding. Mirror that here. */
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

/* The local-only imported bank is optional and gitignored. Validate it too when
 * it exists, so transcribed questions get the same schema checks. */
const IMPORTED = 'js/bank/imported.js';
if (fs.existsSync(path.join(ROOT, IMPORTED))) {
  FILES.splice(FILES.indexOf('js/bank/programming.js') + 1, 0, IMPORTED);
  console.log(`\x1b[36mincluding ${IMPORTED}\x1b[0m`);
}

for (const f of FILES) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f });
}
const QP = sandbox.window.QP;

let pass = 0, fail = 0;
const problems = [];
function ok(cond, msg) {
  if (cond) { pass++; } else { fail++; problems.push(msg); }
}
function section(name) { console.log('\n\x1b[1m' + name + '\x1b[0m'); }

/* ------------------------------------------------------- bank integrity -- */
section('Bank integrity');
const ids = new Set();
const VALID_CATS = ['probability', 'statistics', 'brainteasers', 'marketmaking',
                    'options', 'programming', 'math'];
let openEnded = 0, numeric = 0, mcq = 0;

QP.BANK.forEach(q => {
  ok(q.id, 'question missing id');
  ok(!ids.has(q.id), 'duplicate id: ' + q.id);
  ids.add(q.id);
  ok(VALID_CATS.includes(q.cat), q.id + ': unknown category ' + q.cat);
  ok(q.sub && q.sub.length, q.id + ': missing sub-category');
  ok([1, 2, 3].includes(q.diff), q.id + ': bad difficulty ' + q.diff);
  ok(typeof q.secs === 'number' && q.secs > 0, q.id + ': bad target seconds');
  ok(q.q && q.q.length > 10, q.id + ': missing/short prompt');
  ok(q.sol && q.sol.length > 20, q.id + ': missing/short solution');
  ok(Array.isArray(q.firms) && q.firms.length, q.id + ': no firm attribution');

  if (q.type === 'mcq') {
    mcq++;
    ok(Array.isArray(q.choices) && q.choices.length >= 2, q.id + ': mcq needs choices');
    ok(Number.isInteger(q.a) && q.a >= 0 && q.a < q.choices.length,
       q.id + ': mcq answer index out of range');
  } else if (q.type2 === 'discuss' || q.type === 'code') {
    openEnded++;
    ok(q.aText && q.aText.length, q.id + ': open-ended needs aText model answer');
    ok(q.a == null, q.id + ': open-ended should not carry a numeric answer');
  } else if (q.type === 'estimate') {
    ok(Array.isArray(q.range) && q.range.length === 2 && q.range[0] < q.range[1],
       q.id + ': estimate needs an ordered range');
    ok(typeof q.a === 'number' && q.a >= q.range[0] && q.a <= q.range[1],
       q.id + ': estimate reference answer outside its own accepted range');
  } else {
    numeric++;
    ok(typeof q.a === 'number' && isFinite(q.a), q.id + ': numeric answer missing/not finite');
    ok(typeof q.tol === 'number' && q.tol > 0, q.id + ': numeric needs a positive tolerance');
  }
});
console.log(`  ${QP.BANK.length} questions: ${numeric} numeric, ${mcq} MCQ, ${openEnded} open-ended`);

/* Category spread */
const byCat = {};
QP.BANK.forEach(q => { byCat[q.cat] = (byCat[q.cat] || 0) + 1; });
Object.keys(byCat).sort().forEach(c => console.log(`  ${c.padEnd(14)} ${byCat[c]}`));

/* --------------------------------------------------------- answer parser -- */
section('Answer parser');
const P = QP.parseAnswer;
const cases = [
  ['12', 12], ['-3.5', -3.5], ['1/3', 1 / 3], ['3/8', 0.375],
  ['25%', 0.25], ['1.2e-3', 0.0012], ['2e6', 2000000],
  ['1-(5/6)^4', 1 - Math.pow(5 / 6, 4)], ['sqrt(2)', Math.SQRT2],
  ['pi', Math.PI], ['e', Math.E], ['$1,234', 1234], ['  7  ', 7],
  ['671/1296', 671 / 1296], ['2/3', 2 / 3]
];
cases.forEach(([inp, want]) => {
  const got = P(inp);
  ok(Math.abs(got - want) < 1e-9, `parse("${inp}") = ${got}, want ${want}`);
});
/* Rejections */
[['', NaN], ['abc', NaN], ['alert(1)', NaN], ['process.exit()', NaN]].forEach(([inp]) => {
  ok(Number.isNaN(P(inp)), `parse("${inp}") should be NaN, got ${P(inp)}`);
});

/* --------------------------------------------------------- answer checks -- */
section('Answer checking');
const qNum = { type: 'numeric', a: 1 / 6, tol: 1e-4 };
ok(QP.checkAnswer(qNum, '1/6').state === 'correct', 'fraction answer accepted');
ok(QP.checkAnswer(qNum, '0.1667').state === 'correct', 'decimal answer accepted');
ok(QP.checkAnswer(qNum, '0.5').state === 'wrong', 'wrong answer rejected');
ok(QP.checkAnswer(qNum, '').state === 'skipped', 'blank is skipped');
ok(QP.checkAnswer({ type: 'mcq', a: 1, choices: ['a', 'b'] }, 1).state === 'correct', 'mcq correct');
ok(QP.checkAnswer({ type: 'mcq', a: 1, choices: ['a', 'b'] }, 0).state === 'wrong', 'mcq wrong');
ok(QP.checkAnswer({ type: 'code', type2: 'discuss', a: null }, 'blah').state === 'review',
   'open-ended routed to self-review');
const qEst = { type: 'estimate', a: 1e7, range: [2e6, 5e7] };
ok(QP.checkAnswer(qEst, '5e6').state === 'correct', 'estimate inside band accepted');
ok(QP.checkAnswer(qEst, '5e9').state === 'wrong', 'estimate outside band rejected');

/* ------------------------------------------------------------ generators -- */
section('Generators');
['optiver', 'akuna', 'janestreet', 'sig', 'imc', 'zetamac', 'all'].forEach(p => {
  const qs = QP.genMentalMath(p, 200);
  ok(qs.length === 200, `genMentalMath(${p}) count`);
  let bad = 0;
  qs.forEach(q => {
    if (typeof q.a !== 'number' || !isFinite(q.a)) bad++;
    /* the generated answer must survive a round trip through the checker */
    if (QP.checkAnswer(q, String(q.a)).state !== 'correct') bad++;
  });
  ok(bad === 0, `genMentalMath(${p}): ${bad} malformed/ungradable questions`);
});
/* Akuna must not emit fractions */
const akunaQs = QP.genMentalMath('akuna', 400);
ok(!akunaQs.some(q => /\d\/\d/.test(q.q)),
   'Akuna profile leaked fraction questions (its real test has none)');
/* Optiver must include them */
const optQs = QP.genMentalMath('optiver', 400);
ok(optQs.some(q => /\d\/\d/.test(q.q)), 'Optiver profile produced no fractions');

['optiver', 'akuna', 'fiverings', 'imc', 'all'].forEach(p => {
  const qs = QP.genSequences(p, 120);
  let bad = 0;
  qs.forEach(q => {
    if (typeof q.a !== 'number' || !isFinite(q.a)) bad++;
    if (QP.checkAnswer(q, String(q.a)).state !== 'correct') bad++;
    if (!/,\s+\?$/.test(q.q)) bad++;
  });
  ok(bad === 0, `genSequences(${p}): ${bad} malformed questions`);
});
ok(QP.genMixed('imc', 24).length === 24, 'genMixed count');

/* Verify sequence continuations are genuinely consistent with their own terms
 * for the deterministic arithmetic/geometric/fibonacci families. */
let seqChecked = 0;
for (let i = 0; i < 400; i++) {
  const q = QP.genSequences('all', 1)[0];
  const terms = q.q.replace(/,\s*\?$/, '').split(',').map(s => Number(s.trim()));
  if (terms.some(Number.isNaN)) continue;
  const full = terms.concat([q.a]);
  /* arithmetic? */
  const d = full[1] - full[0];
  if (full.every((v, j) => j === 0 || v - full[j - 1] === d)) { seqChecked++; continue; }
  /* fibonacci-like? */
  if (full.length >= 3 && full.every((v, j) => j < 2 || v === full[j - 1] + full[j - 2])) {
    seqChecked++; continue;
  }
}
ok(seqChecked > 0, 'no self-consistent sequences found at all (generator broken)');
console.log(`  ${seqChecked} sequences independently verified self-consistent`);

/* ------------------------------------------------------------ blueprints -- */
section('Firm blueprints');
QP.FIRMS.forEach(f => {
  ok(f.id && f.name && f.role, 'firm missing identity: ' + f.id);
  ok(f.sections && f.sections.length, f.id + ': no sections');
  ok(f.realNotes && f.realNotes.length > 40, f.id + ': missing format notes');
  f.sections.forEach(s => {
    ok(s.count > 0 && s.seconds > 0, f.id + '/' + s.name + ': bad count or timing');
    ok(['mm', 'seq', 'mix', 'bank'].includes(s.kind), f.id + ': unknown section kind ' + s.kind);
    if (s.kind === 'bank') {
      const pool = QP.BANK.filter(q => QP.matches(q, s.filter));
      ok(pool.length >= s.count,
         `${f.id}/${s.name}: bank pool has only ${pool.length} for ${s.count} slots (will repeat)`);
    }
  });

  /* Build a real exam and make sure it is fully formed. */
  const exam = QP.buildExam(f);
  exam.sections.forEach((s, i) => {
    ok(s.questions.length === f.sections[i].count,
       `${f.id}/${s.name}: built ${s.questions.length} of ${f.sections[i].count} questions`);
    ok(s.answers.length === s.questions.length, f.id + ': answer array mismatch');
    s.questions.forEach(q => ok(q && q.q, f.id + ': null question in built exam'));
  });

  /* Score an all-correct run and an empty run. */
  exam.sections.forEach(s => {
    s.answers = s.questions.map(q =>
      q.type === 'mcq' ? q.a : (q.a != null ? String(q.a) : 'text'));
  });
  const perfect = QP.scoreExam(exam);
  ok(perfect.pct > 99.9, `${f.id}: perfect run scored ${perfect.pct.toFixed(1)}% (expected 100)`);

  exam.sections.forEach(s => { s.answers = s.questions.map(() => null); });
  const blankRun = QP.scoreExam(exam);
  ok(blankRun.pct === 0, f.id + ': blank run should score 0');
  exam.sections.forEach((s, i) => {
    if (f.sections[i].negative) {
      ok(blankRun.sections[i].raw === 0, f.id + ': skipping should score 0 raw under ±1');
    }
  });
});
console.log(`  ${QP.FIRMS.length} firm blueprints built and scored`);

/* Negative marking behaves */
section('Negative marking');
const negFirm = QP.getFirm('optiver');
const negExam = QP.buildExam(negFirm);
const sec0 = negExam.sections[0];
sec0.answers = sec0.questions.map((q, i) => i < 50 ? String(q.a) : String(q.a + 1));
const negScore = QP.scoreSection(sec0);
ok(negScore.correct === 50, `negative-marking: expected 50 correct, got ${negScore.correct}`);
ok(negScore.wrong === 30, `negative-marking: expected 30 wrong, got ${negScore.wrong}`);
ok(negScore.raw === 20, `negative-marking: raw should be 50-30=20, got ${negScore.raw}`);

/* ------------------------------------------------------------ interviews -- */
section('Interview scripts');
QP.INTERVIEWS.forEach(iv => {
  ok(QP.getFirm(iv.firm), iv.name + ': references unknown firm ' + iv.firm);
  ok(iv.rounds.length >= 2, iv.name + ': needs multiple rounds');
  iv.rounds.forEach(r => {
    ok(r.minutes > 0, iv.name + '/' + r.name + ': bad duration');
    ok(['questions', 'mmgame', 'mm', 'seq', 'mix'].includes(r.kind),
       iv.name + ': unknown round kind ' + r.kind);
    if (r.kind === 'questions') {
      const pool = QP.BANK.filter(q => QP.matches(q, r.filter));
      ok(pool.length >= r.count,
         `${iv.name}/${r.name}: only ${pool.length} questions match for ${r.count} slots`);
    }
  });
});
Object.keys(QP.FOLLOWUPS).forEach(c => {
  ok(QP.FOLLOWUPS[c].length >= 3, 'followups too few for ' + c);
});
console.log(`  ${QP.INTERVIEWS.length} interview tracks validated`);

/* -------------------------------------------------------------- MM game -- */
section('Market-making game');
const G = QP.MMGame;
let gamesOk = 0;
for (let t = 0; t < 200; t++) {
  const g = G.newGame({ rounds: 10 });
  while (!g.done) {
    G.startRound(g);
    const ev = g.contract.ev;
    /* quote symmetrically around fair value with a sensible width */
    G.submitQuote(g, ev - 1, ev + 1, 5);
  }
  const s = G.summary(g);
  if (isFinite(s.pnl) && s.trades >= 0 && g.trades.length === 10 && g.position === 0) gamesOk++;
}
ok(gamesOk === 200, `MM game: ${200 - gamesOk} of 200 simulated games malformed`);

/* Width must be judged relative to each contract's volatility, so quote at
 * k × sd around a (possibly mispriced) mid and measure average P&L. */
function play(k, informed, midErrSd, n) {
  let total = 0;
  for (let t = 0; t < (n || 1500); t++) {
    const g = G.newGame({ rounds: 12, informedProb: informed });
    while (!g.done) {
      G.startRound(g);
      const c = g.contract;
      const mid = c.ev + (Math.random() * 2 - 1) * (midErrSd || 0) * c.sd;
      const w = k * c.sd;
      G.submitQuote(g, mid - w, mid + w, 5);
    }
    total += G.summary(g).pnl;
  }
  return total / (n || 1500);
}

/* The game must be WINNABLE — otherwise it teaches nothing. A well-priced,
 * sensibly-wide market maker should make money against default flow. */
const good = play(0.6, 0.22, 0);
ok(good > 0, `game is not winnable: optimal-ish quoting (0.6×sd) averages ${good.toFixed(1)}`);

/* Quoting far too tight must lose to adverse selection. */
const tooTight = play(0.1, 0.22, 0);
ok(tooTight < good,
   `adverse selection not modelled: tight quoting (${tooTight.toFixed(1)}) should underperform ${good.toFixed(1)}`);

/* Quoting far too wide must also underperform — the good flow walks away. */
const tooWide = play(1.5, 0.22, 0);
ok(tooWide < good,
   `flow does not dry up when wide: very wide quoting (${tooWide.toFixed(1)}) should underperform ${good.toFixed(1)}`);

/* Pricing accuracy must matter. */
const sloppy = play(0.6, 0.22, 0.6);
ok(sloppy < good,
   `mispricing is free: sloppy mid (${sloppy.toFixed(1)}) should underperform accurate mid (${good.toFixed(1)})`);

/* More informed flow must hurt. */
const hostile = play(0.6, 0.35, 0);
ok(hostile < good,
   `informed share has no effect: 35% informed (${hostile.toFixed(1)}) vs 22% (${good.toFixed(1)})`);

console.log(`  avg P&L per 12-round game (size 5):`);
console.log(`    too tight (0.1×sd) ${tooTight.toFixed(1)}   good (0.6×sd) ${good.toFixed(1)}   too wide (1.5×sd) ${tooWide.toFixed(1)}`);
console.log(`    sloppy pricing ${sloppy.toFixed(1)}   hostile flow (35% informed) ${hostile.toFixed(1)}`);

const crit = G.critique(G.summary((() => {
  const g = G.newGame({ rounds: 6 });
  while (!g.done) { G.startRound(g); G.submitQuote(g, g.contract.ev - 1, g.contract.ev + 1, 5); }
  return g;
})()));
ok(Array.isArray(crit) && crit.length >= 2, 'critique should return feedback items');

/* ---------------------------------------------------------------- stats -- */
section('Stats & persistence');
QP.Stats.reset();
const f0 = QP.getFirm('drw');
const e0 = QP.buildExam(f0);
e0.sections[0].answers = e0.sections[0].questions.map((q, i) =>
  i === 0 ? 'definitely wrong' : (q.type === 'mcq' ? q.a : (q.a != null ? String(q.a) : 'x')));
const sc0 = QP.scoreExam(e0);
QP.Stats.recordExam(e0, sc0, 600);
const sum = QP.Stats.summary();
ok(sum.exams === 1, 'exam not recorded');
ok(sum.streak === 1, 'streak not started');
ok(QP.Stats.history(5).length === 1, 'history not populated');
ok(QP.Stats.firmHistory('drw').length === 1, 'firm history not populated');
const cats = QP.Stats.byCategory();
ok(Object.keys(cats).length > 0, 'category stats empty');
const rq = QP.Stats.reviewQueue(10);
ok(Array.isArray(rq), 'review queue not an array');
QP.Stats.recordMMGame('test', { pnl: 5, trades: 3, fillRate: 0.5, avgWidth: 2, avgMidError: 0.3, peakAbsPos: 4, informedShare: 0.3 });
ok(QP.Stats.mmHistory().length === 1, 'mm game not recorded');
const dump = QP.Stats.exportJSON();
ok(dump.length > 50, 'export produced nothing');
QP.Stats.reset();
ok(QP.Stats.summary().exams === 0, 'reset did not clear');
QP.Stats.importJSON(dump);
ok(QP.Stats.summary().exams === 1, 'import did not restore');

/* --------------------------------------------------------------- report -- */
console.log('\n' + '─'.repeat(58));
if (fail === 0) {
  console.log(`\x1b[32m✓ all ${pass} assertions passed\x1b[0m`);
} else {
  console.log(`\x1b[31m✗ ${fail} failed\x1b[0m, ${pass} passed\n`);
  problems.slice(0, 40).forEach(p => console.log('  • ' + p));
  if (problems.length > 40) console.log(`  … and ${problems.length - 40} more`);
}
process.exit(fail ? 1 : 0);
