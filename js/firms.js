/* Firm-specific exam blueprints.
 *
 * Section timings and structures below follow publicly reported formats of each
 * firm's online assessment. Where a firm runs several variants by role, the most
 * commonly reported graduate/intern version is modelled.
 *
 * Section kinds:
 *   'mm'   -> procedurally generated mental arithmetic (QP.genMentalMath)
 *   'seq'  -> procedurally generated number sequences  (QP.genSequences)
 *   'mix'  -> interleaved arithmetic + patterns        (QP.genMixed)
 *   'bank' -> drawn from the curated question bank by filter
 */
window.QP = window.QP || {};

QP.FIRMS = [
  /* ------------------------------------------------------------ Optiver -- */
  {
    id: 'optiver', name: 'Optiver', role: 'Quantitative Trader (Intern / Grad)',
    accent: '#ff5a1f', intensity: 5,
    blurb: 'The most speed-punishing screen in the industry. The 80-in-8 has negative marking, so guessing costs you. Optiver is the one firm where raw arithmetic throughput genuinely gates the process.',
    realNotes: 'Reported format: an 80-question / 8-minute arithmetic test scored +1 per correct and −1 per incorrect, followed by a separate NumberLogic sequences paper of 26 questions in 25 minutes. Candidates typically need roughly 60%+ on the maths test to progress.',
    sections: [
      { kind: 'mm', profile: 'optiver', count: 80, seconds: 480, negative: true,
        name: '80 in 8 — Mental Arithmetic',
        instructions: 'Integers, decimals and fractions. Correct answers score +1, incorrect answers score −1, skipped answers score 0. No calculator. You cannot go back.',
        allowBack: false, passPct: 60 },
      { kind: 'seq', profile: 'optiver', count: 26, seconds: 1500,
        name: 'NumberLogic — Sequences',
        instructions: 'Identify the pattern and give the next term. Difficulty ramps through the paper. No negative marking here.',
        allowBack: true, passPct: 55 }
    ]
  },
  {
    id: 'optiver-swe', name: 'Optiver', role: 'Software / Quant Developer',
    accent: '#ff5a1f', intensity: 4,
    blurb: 'Optiver\'s technology track swaps arithmetic speed for CS fundamentals and low-latency thinking.',
    realNotes: 'Reported format: 20 computer-science multiple-choice questions in 20 minutes, followed by a longer programming assessment of 2 problems in about 2 hours (one quantitative, one object-oriented design).',
    sections: [
      { kind: 'bank', name: 'CS Fundamentals', count: 12, seconds: 1200,
        filter: { cat: ['programming', 'math'] },
        instructions: '20-minute rapid section on complexity, data structures and systems.',
        allowBack: true, passPct: 60 },
      { kind: 'bank', name: 'Applied Programming', count: 6, seconds: 3600,
        filter: { cat: ['programming'], diff: [2, 3] },
        instructions: 'Longer-form problems. Describe your approach, data structures and complexity.',
        allowBack: true, passPct: 50 }
    ]
  },

  /* -------------------------------------------------------------- Akuna -- */
  {
    id: 'akuna', name: 'Akuna Capital', role: 'Quantitative Trader',
    accent: '#00c2a8', intensity: 4,
    blurb: 'Same 80-in-8 shape as Optiver but without fractions, then a shorter, faster sequences paper. Akuna leans harder on options intuition later in the process.',
    realNotes: 'Reported format: 80 questions in 8 minutes with +1/−1 scoring, notably excluding fractions; then a sequences section of roughly 24 questions in 12 minutes. Options and derivatives knowledge features prominently in later rounds.',
    sections: [
      { kind: 'mm', profile: 'akuna', count: 80, seconds: 480, negative: true,
        name: '80 in 8 — Mental Arithmetic',
        instructions: 'Integers, decimals and percentages — no fractions. +1 correct, −1 incorrect, 0 skipped.',
        allowBack: false, passPct: 60 },
      { kind: 'seq', profile: 'akuna', count: 24, seconds: 720,
        name: 'Sequences',
        instructions: '24 sequences in 12 minutes. Roughly 30 seconds each — move on fast if a pattern is not visible.',
        allowBack: true, passPct: 55 },
      { kind: 'bank', name: 'Options & Market Logic', count: 8, seconds: 900,
        filter: { cat: ['options', 'marketmaking'] },
        instructions: 'Derivatives intuition and trading logic.',
        allowBack: true, passPct: 60 }
    ]
  },

  /* -------------------------------------------------------- Five Rings -- */
  {
    id: 'fiverings', name: 'Five Rings', role: 'Quantitative Trader',
    accent: '#5b8def', intensity: 5,
    blurb: 'Speed screen followed by a genuinely hard probability and game-theory round. Five Rings filters hard on the maths test and then goes deep.',
    realNotes: 'Reported format: an 80-question / 8-minute arithmetic test and a sequences section of around 24 questions in 12 minutes, followed by probability and estimation rounds.',
    sections: [
      { kind: 'mm', profile: 'fiverings', count: 80, seconds: 480, negative: true,
        name: '80 in 8 — Mental Arithmetic',
        instructions: '+1 correct, −1 incorrect, 0 skipped. No calculator.',
        allowBack: false, passPct: 62 },
      { kind: 'seq', profile: 'fiverings', count: 24, seconds: 720,
        name: 'Sequences', instructions: 'Pattern recognition under time pressure.',
        allowBack: true, passPct: 55 },
      { kind: 'bank', name: 'Probability & Games', count: 8, seconds: 1500,
        filter: { cat: ['probability', 'brainteasers'], diff: [2, 3] },
        instructions: 'Harder probability, expected value and game-theory problems.',
        allowBack: true, passPct: 50 }
    ]
  },

  /* ---------------------------------------------------------------- IMC -- */
  {
    id: 'imc', name: 'IMC Trading', role: 'Trader / Trading Intern',
    accent: '#e8474c', intensity: 4,
    blurb: 'IMC blends arithmetic and pattern questions into a single combined paper rather than splitting them, then moves to probability.',
    realNotes: 'Reported format: a combined test of roughly 24 maths, reasoning and pattern questions in 18 minutes, followed by probability and market-making rounds.',
    sections: [
      { kind: 'mix', profile: 'imc', count: 24, seconds: 1080,
        name: 'Maths, Reasoning & Patterns',
        instructions: 'Mixed arithmetic and sequence questions, interleaved. 45 seconds per question on average.',
        allowBack: true, passPct: 58 },
      { kind: 'bank', name: 'Probability & Trading Logic', count: 10, seconds: 1500,
        filter: { cat: ['probability', 'marketmaking', 'options'] },
        instructions: 'Expected value, fair value and basic derivatives.',
        allowBack: true, passPct: 55 }
    ]
  },

  /* -------------------------------------------------------- Jane Street -- */
  {
    id: 'jane-street', name: 'Jane Street', role: 'Quantitative Trader',
    accent: '#1f6feb', intensity: 5,
    blurb: 'A fast arithmetic filter, then the hardest probability and estimation questions of any firm. Jane Street cares far more about how you reason aloud than whether you land the number.',
    realNotes: 'Reported format: an arithmetic screen of roughly 60 questions in 8 minutes, followed by probability rounds of typically 4–6 questions covering conditional probability, combinatorics and expected value. Later rounds are heavily conversational with market-making games.',
    sections: [
      { kind: 'mm', profile: 'janestreet', count: 60, seconds: 480,
        name: 'Arithmetic Filter',
        instructions: '60 questions in 8 minutes. No negative marking, so answer everything.',
        allowBack: false, passPct: 65 },
      { kind: 'bank', name: 'Probability', count: 6, seconds: 1800,
        filter: { cat: ['probability'], diff: [2, 3] },
        instructions: '6 questions in 30 minutes. Conditional probability, combinatorics, expected value. Show your reasoning.',
        allowBack: true, passPct: 50 },
      { kind: 'bank', name: 'Estimation & Markets', count: 4, seconds: 900,
        filter: { cat: ['brainteasers', 'marketmaking'], sub: ['Estimation', 'Quoting', 'Game Theory'] },
        instructions: 'Fermi estimation and market-making judgement. Structure matters more than precision.',
        allowBack: true, passPct: 50 }
    ]
  },

  /* ---------------------------------------------------------------- SIG -- */
  {
    id: 'sig', name: 'Susquehanna (SIG)', role: 'Quantitative Trader',
    accent: '#7b3fe4', intensity: 4,
    blurb: 'The most poker-flavoured process in the industry. SIG tests decision-making under uncertainty, bet sizing and EV discipline as much as raw maths.',
    realNotes: 'Reported format: a quant test running 60–75 minutes with roughly 30–50 questions spanning mental arithmetic, probability, expected value and options knowledge.',
    sections: [
      { kind: 'mm', profile: 'sig', count: 25, seconds: 600,
        name: 'Mental Arithmetic',
        instructions: '25 questions in 10 minutes, including percentages and compounding.',
        allowBack: false, passPct: 60 },
      { kind: 'bank', name: 'Probability & Expected Value', count: 14, seconds: 1800,
        filter: { cat: ['probability', 'marketmaking'] },
        instructions: 'The core of the SIG test. Think in EV and bet sizing throughout.',
        allowBack: true, passPct: 55 },
      { kind: 'bank', name: 'Options & Game Theory', count: 8, seconds: 1200,
        filter: { cat: ['options', 'brainteasers'], sub: ['Basics', 'Greeks', 'Put-Call Parity', 'Game Theory', 'Betting'] },
        instructions: 'Derivatives fundamentals and strategic reasoning.',
        allowBack: true, passPct: 55 }
    ]
  },

  /* ---------------------------------------------------------------- DRW -- */
  {
    id: 'drw', name: 'DRW', role: 'Quantitative Trading Analyst',
    accent: '#d4a017', intensity: 3,
    blurb: 'Short and deliberate. Six questions in forty-five minutes means DRW is testing careful reasoning rather than speed — there is time to check your work, and you are expected to use it.',
    realNotes: 'Reported format: 6 questions in 45 minutes mixing probability, logical brainteasers and mathematics, at medium difficulty and generally multiple-choice.',
    sections: [
      { kind: 'bank', name: 'Probability, Logic & Maths', count: 6, seconds: 2700,
        filter: { cat: ['probability', 'brainteasers', 'math'] },
        instructions: '6 questions, 45 minutes. Generous timing — verify before you commit.',
        allowBack: true, passPct: 60 }
    ]
  },

  /* ------------------------------------------------------------ Citadel -- */
  {
    id: 'citadel', name: 'Citadel', role: 'Quantitative Researcher',
    accent: '#0b6e4f', intensity: 5,
    blurb: 'A research screen: probability depth plus real statistics and coding. Citadel expects you to know why a backtest lies, not just how to compute a p-value.',
    realNotes: 'Reported format: a 90–120 minute HackerRank/CodeSignal assessment. Quant Research variants typically pair 7–10 probability multiple-choice questions with 2 coding problems; Quant Trading variants lean on speed arithmetic and EV games instead.',
    sections: [
      { kind: 'bank', name: 'Probability & Statistics', count: 10, seconds: 2400,
        filter: { cat: ['probability', 'statistics'], diff: [2, 3] },
        instructions: '10 questions in 40 minutes.',
        allowBack: true, passPct: 60 },
      { kind: 'bank', name: 'Coding & Numerical Methods', count: 4, seconds: 3000,
        filter: { cat: ['programming'] },
        instructions: '2 substantial problems in 50 minutes. State approach, data structures and complexity.',
        allowBack: true, passPct: 50 }
    ]
  },
  {
    id: 'citadel-trading', name: 'Citadel Securities', role: 'Quantitative Trader',
    accent: '#0b6e4f', intensity: 5,
    blurb: 'The trading-side screen: speed maths and expected-value games rather than research statistics.',
    realNotes: 'Reported format: speed mental arithmetic in the style of a trader-math test, combined with probability and expected-value game questions.',
    sections: [
      { kind: 'mm', profile: 'sig', count: 40, seconds: 600,
        name: 'Trader Math', instructions: '40 questions in 10 minutes.',
        allowBack: false, passPct: 65 },
      { kind: 'bank', name: 'EV Games & Market Making', count: 10, seconds: 1800,
        filter: { cat: ['marketmaking', 'probability'], diff: [2, 3] },
        instructions: 'Expected value, bet sizing and quoting judgement.',
        allowBack: true, passPct: 55 }
    ]
  },

  /* ---------------------------------------------------------------- HRT -- */
  {
    id: 'hrt', name: 'Hudson River Trading', role: 'Quantitative Researcher / Algo Engineer',
    accent: '#2b2b8f', intensity: 5,
    blurb: 'The most engineering-weighted screen of the major firms. HRT wants hard algorithms written well, under time pressure.',
    realNotes: 'Reported format: a HackerRank-style assessment with 2–3 hard problems in about 90 minutes for engineering roles; researcher variants use 3–4 algorithmic problems in Python or C++ with limits in the 70–150 minute range.',
    sections: [
      { kind: 'bank', name: 'Algorithms', count: 5, seconds: 3600,
        filter: { cat: ['programming'], diff: [2, 3] },
        instructions: '3 hard problems in 60 minutes. Optimal complexity expected, not just a working solution.',
        allowBack: true, passPct: 55 },
      { kind: 'bank', name: 'Probability & Maths', count: 5, seconds: 1800,
        filter: { cat: ['probability', 'math'], diff: [3] },
        instructions: 'Harder mathematical reasoning.',
        allowBack: true, passPct: 50 }
    ]
  },

  /* ---------------------------------------------------------- Two Sigma -- */
  {
    id: 'two-sigma', name: 'Two Sigma', role: 'Quantitative Researcher',
    accent: '#00a0b0', intensity: 4,
    blurb: 'Statistics and machine learning first. Two Sigma probes research methodology hard — cross-validation, multiple testing and overfitting come up constantly.',
    realNotes: 'Research screens emphasise statistics, time series, machine learning methodology and data handling alongside coding.',
    sections: [
      { kind: 'bank', name: 'Statistics & Machine Learning', count: 12, seconds: 2700,
        filter: { cat: ['statistics'] },
        instructions: '12 questions in 45 minutes. Methodology matters as much as the answer.',
        allowBack: true, passPct: 60 },
      { kind: 'bank', name: 'Probability & Coding', count: 6, seconds: 2100,
        filter: { cat: ['probability', 'programming'], diff: [2, 3] },
        instructions: 'Applied probability and data manipulation.',
        allowBack: true, passPct: 55 }
    ]
  },

  /* ---------------------------------------------------------------- XTX -- */
  {
    id: 'xtx', name: 'XTX Markets', role: 'Quantitative Researcher',
    accent: '#8a2be2', intensity: 5,
    blurb: 'Heavily statistical and machine-learning oriented, with an unusual emphasis on large-scale model fitting and validation discipline.',
    realNotes: 'Research screens focus on statistics, linear algebra, regression methodology and machine learning at scale.',
    sections: [
      { kind: 'bank', name: 'Statistics & Regression', count: 10, seconds: 2400,
        filter: { cat: ['statistics'], diff: [2, 3] },
        instructions: '10 questions in 40 minutes.',
        allowBack: true, passPct: 60 },
      { kind: 'bank', name: 'Linear Algebra & Maths', count: 6, seconds: 1500,
        filter: { cat: ['math', 'programming'], diff: [2, 3] },
        instructions: 'Matrix methods, PCA and numerical reasoning.',
        allowBack: true, passPct: 55 }
    ]
  },

  /* ---------------------------------------------------------------- AQR -- */
  {
    id: 'aqr', name: 'AQR Capital', role: 'Quantitative Researcher',
    accent: '#b5651d', intensity: 3,
    blurb: 'Systematic factor investing. Less speed, more depth on portfolio construction, factor models and research design.',
    realNotes: 'Research screens emphasise statistics, factor models, portfolio theory and empirical methodology rather than speed.',
    sections: [
      { kind: 'bank', name: 'Statistics & Portfolio Theory', count: 12, seconds: 3000,
        filter: { cat: ['statistics', 'math', 'probability'], diff: [2, 3] },
        instructions: '12 questions in 50 minutes. Depth over speed.',
        allowBack: true, passPct: 60 }
    ]
  }
];

QP.getFirm = function (id) {
  for (var i = 0; i < QP.FIRMS.length; i++) if (QP.FIRMS[i].id === id) return QP.FIRMS[i];
  return null;
};
