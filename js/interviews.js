/* Interview simulation.
 *
 * Two things live here:
 *   1. QP.INTERVIEWS — multi-round interview scripts per firm, with the
 *      follow-up probing real interviewers do after your first answer.
 *   2. QP.MMGame     — the live market-making game: you quote two-sided
 *      markets, a counterparty (partly informed) trades against you, and
 *      you are scored on edge captured, inventory control and adverse
 *      selection, not just on whether your fair value was right.
 */
window.QP = window.QP || {};

/* ====================================================== interview rounds == */

QP.INTERVIEWS = [
  {
    firm: 'jane-street', name: 'Jane Street — Trading Interview',
    accent: '#1f6feb',
    intro: 'Two rounds of pure conversation. Jane Street interviewers interrupt, change the game mid-question and probe every assumption. Answering fast and confidently but wrongly is worse than thinking aloud slowly.',
    rounds: [
      { name: 'Round 1 — Probability & Reasoning', minutes: 45, kind: 'questions',
        filter: { cat: ['probability'], diff: [2, 3] }, count: 4,
        coaching: 'State your assumptions before computing. If you get stuck, say what you would need to know. Never go silent.' },
      { name: 'Round 2 — Market Making Game', minutes: 20, kind: 'mmgame',
        rounds: 12,
        coaching: 'Quote two-sided, manage inventory, widen when you are being picked off.' },
      { name: 'Round 3 — Estimation & Judgement', minutes: 25, kind: 'questions',
        filter: { cat: ['brainteasers'], sub: ['Estimation', 'Game Theory'] }, count: 3,
        coaching: 'Decompose out loud. Give a number, then say which assumption your answer is most sensitive to.' }
    ]
  },
  {
    firm: 'optiver', name: 'Optiver — Trader Interview',
    accent: '#ff5a1f',
    intro: 'Optiver front-loads speed, then tests whether you can hold a position and think about risk. Expect mental maths under interruption and repeated "make me a market" prompts.',
    rounds: [
      { name: 'Round 1 — Speed Maths Under Pressure', minutes: 8, kind: 'mm',
        profile: 'optiver', count: 60,
        coaching: 'They will talk to you while you work. Keep going.' },
      { name: 'Round 2 — Market Making Game', minutes: 20, kind: 'mmgame',
        rounds: 15,
        coaching: 'Say your size with your price. Skew after every fill.' },
      { name: 'Round 3 — Options & Risk', minutes: 30, kind: 'questions',
        filter: { cat: ['options', 'marketmaking'] }, count: 5,
        coaching: 'Greeks first, then intuition, then the trade you would put on.' }
    ]
  },
  {
    firm: 'sig', name: 'Susquehanna — Trader Interview',
    accent: '#7b3fe4',
    intro: 'SIG interviews feel like a poker table. Expect bet-sizing questions, games with hidden information, and constant pressure on whether your stated probability is really your belief.',
    rounds: [
      { name: 'Round 1 — EV & Bet Sizing', minutes: 35, kind: 'questions',
        filter: { cat: ['marketmaking', 'probability'], sub: ['Betting', 'Games', 'Expected Value', 'Quoting'] }, count: 5,
        coaching: 'Always convert to EV per unit risked. Mention Kelly when sizing comes up.' },
      { name: 'Round 2 — Market Making Game', minutes: 20, kind: 'mmgame',
        rounds: 15, informedProb: 0.35,
        coaching: 'This counterparty is unusually well informed — roughly a third of the flow can see the settlement value. Getting to flat here is a good result; width is your only defence.' },
      { name: 'Round 3 — Brainteasers & Game Theory', minutes: 30, kind: 'questions',
        filter: { cat: ['brainteasers'], diff: [2, 3] }, count: 4,
        coaching: 'Think about what your opponent knows and what they will do.' }
    ]
  },
  {
    firm: 'citadel', name: 'Citadel — Quant Research Interview',
    accent: '#0b6e4f',
    intro: 'A research interview, not a trading one. Expect to defend methodology: how you validated a model, why your backtest is not overfit, what you would do with more data.',
    rounds: [
      { name: 'Round 1 — Probability Depth', minutes: 45, kind: 'questions',
        filter: { cat: ['probability'], diff: [3] }, count: 4,
        coaching: 'Set up the state space explicitly before computing anything.' },
      { name: 'Round 2 — Statistics & Research Design', minutes: 45, kind: 'questions',
        filter: { cat: ['statistics'] }, count: 5,
        coaching: 'Every answer should end with how you would validate it out of sample.' },
      { name: 'Round 3 — Coding & Complexity', minutes: 45, kind: 'questions',
        filter: { cat: ['programming'] }, count: 3,
        coaching: 'State complexity before you write code. Discuss the follow-up variants.' }
    ]
  },
  {
    firm: 'two-sigma', name: 'Two Sigma — Research Interview',
    accent: '#00a0b0',
    intro: 'Methodology-first. The distinguishing questions are about validation, leakage and multiple testing rather than about deriving a distribution.',
    rounds: [
      { name: 'Round 1 — Statistics & ML', minutes: 45, kind: 'questions',
        filter: { cat: ['statistics'], sub: ['Machine Learning', 'Regression', 'Time Series', 'Estimation'] }, count: 5,
        coaching: 'Name the failure mode before naming the fix.' },
      { name: 'Round 2 — Applied Probability', minutes: 40, kind: 'questions',
        filter: { cat: ['probability'], diff: [2, 3] }, count: 4,
        coaching: 'Clean derivations, stated assumptions.' },
      { name: 'Round 3 — Data & Code', minutes: 40, kind: 'questions',
        filter: { cat: ['programming'] }, count: 3,
        coaching: 'Think about look-ahead bias in everything you touch.' }
    ]
  },
  {
    firm: 'imc', name: 'IMC — Trader Interview',
    accent: '#e8474c',
    intro: 'A friendlier process than Optiver but the same fundamentals: fast maths, clear EV thinking, and a market-making game where they will try to run you over.',
    rounds: [
      { name: 'Round 1 — Maths & Patterns', minutes: 18, kind: 'mix',
        profile: 'imc', count: 24, coaching: 'Combined arithmetic and sequences.' },
      { name: 'Round 2 — Probability & Trading Logic', minutes: 30, kind: 'questions',
        filter: { cat: ['probability', 'marketmaking'] }, count: 5,
        coaching: 'Fair value first, then the market you would show.' },
      { name: 'Round 3 — Market Making Game', minutes: 15, kind: 'mmgame',
        rounds: 12, coaching: 'Manage your position actively.' }
    ]
  }
];

/* Follow-up probes the simulator attaches after an answer is revealed, so a
 * practice session mirrors the way real interviews escalate. */
QP.FOLLOWUPS = {
  probability: [
    'Now suppose the die is biased — how does your answer change qualitatively?',
    'What if the draws were with replacement instead of without?',
    'Can you give me a bound on this without computing it exactly?',
    'What is the variance of that quantity, not just the mean?',
    'How would you simulate this to check your answer?',
    'Generalise it to n instead of the specific number I gave you.'
  ],
  marketmaking: [
    'I lift your offer. Where are you now, and what is your new market?',
    'Now make me a market in the square of that quantity.',
    'How wide would you quote if I could trade 100 lots instead of 1?',
    'What if I told you I have information you do not?',
    'Your position is now short 20. Talk me through your risk.'
  ],
  options: [
    'What happens to that if implied volatility doubles?',
    'How would you hedge that position?',
    'Does your answer change if the stock pays a dividend?',
    'What is the P&L if the stock gaps 10% overnight?',
    'Which greek is your biggest exposure here?'
  ],
  statistics: [
    'How would you validate that out of sample?',
    'What if the observations are autocorrelated?',
    'How many data points do you need for that to be significant?',
    'What is the failure mode of that estimator?',
    'Would you still use this with 10x more features than observations?'
  ],
  brainteasers: [
    'What is your answer sensitive to? Which assumption matters most?',
    'Give me an upper and lower bound you would be confident in.',
    'Now do it a completely different way to check.'
  ],
  programming: [
    'What is the space complexity?',
    'How would you handle this if the data does not fit in memory?',
    'What breaks if this runs concurrently across 32 threads?',
    'Can you do better than that asymptotically?'
  ],
  math: [
    'Prove that.',
    'What is the intuition, in one sentence, with no algebra?',
    'What happens in the limiting case?'
  ]
};

QP.getFollowup = function (cat) {
  var list = QP.FOLLOWUPS[cat] || QP.FOLLOWUPS.probability;
  return list[Math.floor(Math.random() * list.length)];
};

/* ================================================== market-making game === */
/*
 * Each round:
 *   - A contract has a true value drawn from a known-ish distribution.
 *   - You publish a two-sided market (bid, ask) and a size.
 *   - The counterparty trades if your quote is favourable to them. With
 *     probability `informedProb` they can see the true value and will only
 *     trade when it is genuinely in their favour (adverse selection). The rest
 *     of the time they trade noisily on either side.
 *   - Settlement is at true value. You are scored on total P&L, edge captured
 *     per trade, and peak absolute inventory.
 */
QP.MMGame = (function () {
  'use strict';

  var CONTRACTS = [
    { desc: 'Sum of 2 fair dice', ev: 7, sd: 2.42, draw: function () { return d(6) + d(6); } },
    { desc: 'Sum of 3 fair dice', ev: 10.5, sd: 2.96, draw: function () { return d(6) + d(6) + d(6); } },
    { desc: 'Number of heads in 10 fair coin flips', ev: 5, sd: 1.58,
      draw: function () { var s = 0; for (var i = 0; i < 10; i++) s += Math.random() < 0.5 ? 1 : 0; return s; } },
    { desc: 'Max of 2 fair dice', ev: 4.47, sd: 1.4, draw: function () { return Math.max(d(6), d(6)); } },
    { desc: 'Face value of one card drawn (A=1 … K=13)', ev: 7, sd: 3.74, draw: function () { return d(13); } },
    { desc: 'Product of 2 fair dice', ev: 12.25, sd: 8.09, draw: function () { return d(6) * d(6); } },
    { desc: '10 × (number of sixes in 6 rolls)', ev: 10, sd: 9.13,
      draw: function () { var s = 0; for (var i = 0; i < 6; i++) if (d(6) === 6) s++; return 10 * s; } },
    { desc: 'Number of distinct faces seen in 4 rolls of a die', ev: 3.1, sd: 0.72,
      draw: function () { var seen = {}, n = 0; for (var i = 0; i < 4; i++) { var v = d(6); if (!seen[v]) { seen[v] = 1; n++; } } return n; } },
    { desc: 'Sum of 2 dice, squared', ev: 54.8, sd: 26.5,
      draw: function () { var v = d(6) + d(6); return v * v; } },
    { desc: 'Rolls of a die needed to first see a 6 (capped at 20)', ev: 6, sd: 5.4,
      draw: function () { var n = 1; while (d(6) !== 6 && n < 20) n++; return n; } }
  ];

  function d(n) { return 1 + Math.floor(Math.random() * n); }

  function newGame(opts) {
    opts = opts || {};
    return {
      rounds: opts.rounds || 12,
      informedProb: opts.informedProb == null ? 0.22 : opts.informedProb,
      maxSize: opts.maxSize || 10,
      round: 0,
      position: 0,
      cash: 0,
      peakAbsPos: 0,
      trades: [],
      contract: null,
      trueValue: null,
      done: false
    };
  }

  function startRound(g) {
    var c = CONTRACTS[Math.floor(Math.random() * CONTRACTS.length)];
    g.contract = c;
    g.trueValue = c.draw();
    g.round++;
    return c;
  }

  /* Counterparty decision. Returns null (no trade) or
   * {side:'buy'|'sell', price, qty} from the COUNTERPARTY's perspective.
   *
   * Flow is a mix of two populations, which is what makes the game winnable:
   *
   *  - Informed traders see the settlement value and only ever trade when your
   *    quote is genuinely wrong. Every fill from them costs you money. This is
   *    adverse selection and no spread fully protects against it.
   *
   *  - Uninformed / liquidity traders trade for their own reasons around a
   *    noisy view of fair value. Their fills pay you the spread in expectation.
   *    Crucially they will NOT cross an unreasonably wide market — the wider you
   *    quote, the less of this profitable flow you see.
   *
   * The tension between those two is the entire skill being trained: quote too
   * tight and informed flow eats you, quote too wide and the good flow leaves.
   */
  function counterpartyAct(g, bid, ask, size) {
    var tv = g.trueValue, ev = g.contract.ev, sd = g.contract.sd;
    var informed = Math.random() < g.informedProb;
    var qty = Math.max(1, Math.min(size, g.maxSize));
    var width = (ask - bid) / 2;

    if (informed) {
      /* Sees the settlement value, with a little execution noise so it is not
       * a perfect picker. Trades only when there is real edge. */
      var ref = tv + (Math.random() - 0.5) * 0.3 * sd;
      if (ref > ask) return { side: 'buy', price: ask, qty: qty, informed: true };
      if (ref < bid) return { side: 'sell', price: bid, qty: qty, informed: true };
      return null;
    }

    /* Uninformed: a noisy private view, uncorrelated with settlement. */
    var noisy = ev + (Math.random() - 0.5) * 2 * sd;
    if (noisy > ask) return { side: 'buy', price: ask, qty: Math.max(1, Math.round(qty * 0.7)), informed: false };
    if (noisy < bid) return { side: 'sell', price: bid, qty: Math.max(1, Math.round(qty * 0.7)), informed: false };

    /* Liquidity-motivated trade with no view at all. This is the flow every
     * market maker wants, and it dries up as your market gets wider. */
    var reluctance = Math.exp(-width / (0.45 * sd));
    if (Math.random() < 0.55 * reluctance) {
      return Math.random() < 0.5
        ? { side: 'buy', price: ask, qty: Math.max(1, Math.round(qty * 0.5)), informed: false }
        : { side: 'sell', price: bid, qty: Math.max(1, Math.round(qty * 0.5)), informed: false };
    }
    return null;
  }

  /* Apply a quote; returns a result record for display. */
  function submitQuote(g, bid, ask, size) {
    var act = counterpartyAct(g, bid, ask, size);
    var rec = {
      round: g.round,
      contract: g.contract.desc,
      ev: g.contract.ev,
      trueValue: g.trueValue,
      bid: bid, ask: ask, size: size,
      traded: false, side: null, price: null, qty: 0,
      informed: false, pnl: 0, posBefore: g.position
    };

    if (act) {
      rec.traded = true;
      rec.informed = act.informed;
      rec.qty = act.qty;
      rec.price = act.price;
      if (act.side === 'buy') {
        /* They buy at your ask => you are SHORT */
        rec.side = 'you sold';
        g.position -= act.qty;
        g.cash += act.price * act.qty;
      } else {
        rec.side = 'you bought';
        g.position += act.qty;
        g.cash -= act.price * act.qty;
      }
      /* Mark this trade to settlement value */
      rec.pnl = (act.side === 'buy')
        ? (act.price - g.trueValue) * act.qty
        : (g.trueValue - act.price) * act.qty;
    }

    g.peakAbsPos = Math.max(g.peakAbsPos, Math.abs(g.position));

    /* Settle the round: contract expires at true value, position flattens. */
    g.cash += g.position * g.trueValue;
    rec.posAfter = g.position;
    g.position = 0;

    g.trades.push(rec);
    if (g.round >= g.rounds) g.done = true;
    return rec;
  }

  function summary(g) {
    var traded = g.trades.filter(function (t) { return t.traded; });
    var pnl = g.trades.reduce(function (s, t) { return s + t.pnl; }, 0);
    var informedTrades = traded.filter(function (t) { return t.informed; });
    var informedPnl = informedTrades.reduce(function (s, t) { return s + t.pnl; }, 0);
    var avgWidth = g.trades.reduce(function (s, t) { return s + (t.ask - t.bid); }, 0) /
                   Math.max(1, g.trades.length);
    var avgMiss = g.trades.reduce(function (s, t) {
      return s + Math.abs((t.bid + t.ask) / 2 - t.ev);
    }, 0) / Math.max(1, g.trades.length);

    return {
      pnl: pnl,
      trades: traded.length,
      fillRate: traded.length / Math.max(1, g.trades.length),
      pnlPerTrade: traded.length ? pnl / traded.length : 0,
      informedShare: traded.length ? informedTrades.length / traded.length : 0,
      informedPnl: informedPnl,
      avgWidth: avgWidth,
      avgMidError: avgMiss,
      peakAbsPos: g.peakAbsPos
    };
  }

  /* Coaching feedback based on the shape of the results, not just the P&L. */
  function critique(s) {
    var out = [];
    if (s.fillRate < 0.35) {
      out.push({ t: 'warn', m: 'Your markets were too wide — you only got filled on ' +
        Math.round(s.fillRate * 100) + '% of rounds. Width protects you, but a market maker who never trades earns nothing. Interviewers read this as timidity.' });
    } else if (s.fillRate > 0.85 && s.pnlPerTrade < 0) {
      out.push({ t: 'bad', m: 'You were filled on almost every round and lost money per trade. That is the signature of quoting too tight: you are giving away the option to trade against you for free.' });
    } else {
      out.push({ t: 'good', m: 'Fill rate of ' + Math.round(s.fillRate * 100) + '% is a reasonable balance between earning spread and avoiding pick-offs.' });
    }

    if (s.avgMidError > 1.2) {
      out.push({ t: 'bad', m: 'Your mid was off fair value by ' + s.avgMidError.toFixed(2) +
        ' on average. Pricing error, not spread width, is your main leak — work on computing expected values faster and more accurately.' });
    } else if (s.avgMidError < 0.4) {
      out.push({ t: 'good', m: 'Your mids tracked fair value closely (average error ' + s.avgMidError.toFixed(2) + '). Pricing is not your problem.' });
    }

    if (s.informedShare > 0.6) {
      out.push({ t: 'warn', m: Math.round(s.informedShare * 100) + '% of your fills came from the informed counterparty, costing ' +
        s.informedPnl.toFixed(1) + '. This is adverse selection: when one side keeps trading with you, the market is telling you your price is wrong.' });
    }

    if (s.peakAbsPos > 15) {
      out.push({ t: 'warn', m: 'Peak inventory reached ' + s.peakAbsPos +
        ' lots. Large positions from quoting size you did not intend to carry is a common way candidates fail this exercise.' });
    }

    if (s.pnl > 0) {
      out.push({ t: 'good', m: 'Net P&L of ' + s.pnl.toFixed(1) + ' over ' + s.trades + ' trades.' });
    } else {
      out.push({ t: 'bad', m: 'Net P&L of ' + s.pnl.toFixed(1) + '. Gross spread capture did not cover adverse selection.' });
    }
    return out;
  }

  return {
    CONTRACTS: CONTRACTS,
    newGame: newGame,
    startRound: startRound,
    submitQuote: submitQuote,
    summary: summary,
    critique: critique
  };
})();
