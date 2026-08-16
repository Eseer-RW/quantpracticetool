# Quant Practice — OA & Interview Simulator

A self-contained trainer for quant trading and research interviews. It reproduces the
structure, timing and scoring of real firm online assessments, runs multi-round interview
simulations, and includes a live market-making game where a partly-informed counterparty
trades against your quotes.

No build step, no server, no accounts. Open `index.html` in a browser.

```
git clone <this repo> && cd quantpracticetool
open index.html          # macOS
xdg-open index.html      # Linux
```

Progress is stored in `localStorage`, and can be exported/imported as JSON from the
Analytics page.

---

## Modes

| Mode | What it does |
|---|---|
| **Firm OAs** | 14 full assessments with each firm's real section structure, question counts, time limits and scoring rules — including negative marking where it applies. |
| **Interviews** | 6 multi-round timed interview simulations, each mixing question rounds with live market-making rounds. |
| **Market Making** | Standalone live game: you quote two-sided markets and size, and are graded on P&L, pricing accuracy, fill rate and adverse selection absorbed. |
| **Speed Maths** | 80-in-8 trainers, sequence papers and a Zetamac-style sprint, with firm-specific question mixes. |
| **Topic Drill** | One category at a time, filtered by difficulty, timed at interview pace or untimed. |
| **Review** | Spaced-repetition queue of questions you have previously missed, prioritised by miss rate and recency. |
| **Analytics** | Accuracy by category and sub-topic, weak-area detection, attempt history, market-making game history. |

---

## Firm assessment formats

Section structures follow publicly reported formats of each firm's assessment.

| Firm | Role | Structure |
|---|---|---|
| **Optiver** | Quant Trader | 80 questions / 8 min arithmetic, **+1 / −1 scoring**; NumberLogic sequences 26 / 25 min |
| **Optiver** | Software / Quant Dev | 20 CS multiple-choice / 20 min; applied programming / ~2 hr |
| **Akuna Capital** | Quant Trader | 80-in-8 (**no fractions**, +1/−1); sequences 24 / 12 min; options round |
| **Five Rings** | Quant Trader | 80-in-8 (+1/−1); sequences 24 / 12 min; probability & games |
| **IMC Trading** | Trader | Combined maths / reasoning / patterns, 24 questions / 18 min; probability round |
| **Jane Street** | Quant Trader | Arithmetic filter ~60 / 8 min; probability 6 / 30 min; estimation & markets |
| **Susquehanna (SIG)** | Quant Trader | 60–75 min total: mental arithmetic, probability & EV, options & game theory |
| **DRW** | Quant Trading Analyst | 6 questions / 45 min — probability, logic and maths |
| **Citadel** | Quant Researcher | Probability & statistics 10 / 40 min; coding 2 / 50 min |
| **Citadel Securities** | Quant Trader | Trader math 40 / 10 min; EV games & market making |
| **Hudson River Trading** | Researcher / Algo Eng | Hard algorithms / 60 min; probability & maths |
| **Two Sigma** | Quant Researcher | Statistics & ML 12 / 45 min; probability & coding |
| **XTX Markets** | Quant Researcher | Statistics & regression; linear algebra & maths |
| **AQR** | Quant Researcher | Statistics & portfolio theory, 12 / 50 min |

Negative-marked sections score **+1 correct, −1 incorrect, 0 skipped**, so guessing has
negative expected value — the tool tells you this on-screen and scores it accordingly.

---

## Question bank

172 curated questions with full worked solutions, plus unlimited procedurally generated
arithmetic and sequence questions.

| Category | Count | Covers |
|---|---|---|
| Probability | 66 | Conditional probability, Bayes, expected value, Markov chains, random walks, order statistics, geometric probability, optional stopping, classic puzzles |
| Statistics | 25 | Estimation, regression, time series, GARCH, machine learning methodology, cross-validation, multiple testing |
| Brainteasers | 31 | Logic puzzles, information-theoretic weighing, hats, game theory, Fermi estimation, number theory |
| Options & Derivatives | 15 | Put-call parity, Greeks, Black-Scholes approximations, vol surface, delta hedging, structures |
| Market Making | 12 | Fair value and quoting, adverse selection, sizing, Kelly, arbitrage |
| Programming | 12 | Algorithms, streaming data structures, order books, numerical methods, low-latency systems, pandas |
| Mathematics | 11 | Combinatorics, linear algebra, PCA, calculus, stochastic calculus |

Each question carries a category, sub-topic, difficulty, target solve time, firm
attribution, and a worked solution that explains the *method* and the common trap — not
just the number.

**Generated questions** (`js/generators.js`) reproduce the real speed-test mixes: Optiver's
includes fractions, Akuna's deliberately does not, Jane Street's leans on larger
addition/subtraction, and sequences ramp in difficulty through the paper.

### Answer formats accepted

Integers, decimals, fractions (`3/8`), percentages (`25%`), scientific notation (`2e6`),
constants (`pi`, `e`), and expressions (`1-(5/6)^4`, `sqrt(2)/2`). Estimation questions
accept a wide band. Open-ended questions are self-graded against a model answer.

---

## The market-making game

Each round presents a contract (e.g. "sum of 3 fair dice"), you quote a bid, an offer and a
size, and a counterparty decides whether to trade. Flow is a mix of two populations:

- **Informed traders** see the settlement value and only trade when your quote is wrong.
  Every fill from them costs you money.
- **Uninformed / liquidity traders** trade around a noisy view of fair value. Their fills
  pay you the spread — but they will not cross an unreasonably wide market.

That tension is the point: quote too tight and informed flow eats you, quote too wide and
the profitable flow disappears. The game is tuned so a well-priced market maker quoting
around **0.5–0.7 × the contract's standard deviation** makes money, with both extremes
losing. Feedback afterwards critiques fill rate, mid pricing error, informed fill share and
peak inventory — not just P&L.

---

## Tests

```bash
node tests/selftest.js    # bank integrity, parser, generators, blueprints, scoring, game balance
node tests/uitest.js      # browser smoke test (needs playwright)
```

`selftest.js` runs ~2,900 assertions with no dependencies: it validates every question's
schema, checks that every generated question is gradable, builds and scores every firm
blueprint, verifies negative marking arithmetic, and asserts the market-making game stays
winnable at sensible widths and unprofitable at bad ones.

`uitest.js` drives the real page in Chromium — every route, a full assessment through to
results, the rapid-entry speed mode, a complete market-making game, a drill and an
interview — and fails on any console error.

---

## Project layout

```
index.html              page shell and script loading order
css/styles.css          all styling
js/bank/*.js            curated question bank, one file per category
js/generators.js        procedural mental-arithmetic and sequence generators
js/firms.js             firm OA blueprints (structure, timing, scoring)
js/interviews.js        interview round scripts + market-making game model
js/engine.js            answer parsing, question selection, exam building, scoring, timers
js/stats.js             localStorage persistence, analytics, spaced repetition
js/app.js               router, views, exam runner, game UI
tests/                  headless and browser test suites
```

Adding a question means appending one object to a file in `js/bank/` — the schema is
documented at the top of each file, and `selftest.js` will tell you if you get it wrong.

---

## A note on the source material

The formats above follow publicly reported descriptions of each firm's assessment. Formats
change between years and roles, so treat the timings as a faithful training target rather
than a guarantee of what you will sit.

The questions are written for this tool. They cover the canonical problem types that recur
across quant interviews — many are classic puzzles long in the public domain — rather than
reproducing any prep provider's proprietary question text.
