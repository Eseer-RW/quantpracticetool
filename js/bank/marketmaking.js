/* Market-making, trading-logic and options/derivatives questions.
 * This is the category that separates trader interviews (Optiver, IMC, SIG,
 * Jane Street, Akuna, Five Rings) from researcher interviews.
 */
window.QP = window.QP || {};
QP.BANK = (QP.BANK || []).concat([

/* ------------------------------------------------------ making markets -- */
{
  id: 'mm-001', cat: 'marketmaking', sub: 'Quoting', diff: 1, secs: 90, type: 'numeric',
  q: 'I roll a fair six-sided die and pay you the value in dollars. What is the fair value of this contract?',
  a: 3.5, tol: 1e-6,
  sol: 'E = (1+2+3+4+5+6)/6 = 3.5.\n\nThe follow-up is always "make me a market". A sensible quote is 3.4 / 3.6 — tight enough to show confidence, wide enough to earn edge. Then expect the interviewer to trade against you and change the game.',
  firms: ['optiver', 'imc', 'sig', 'akuna'], tags: ['fair-value', 'basics']
},
{
  id: 'mm-002', cat: 'marketmaking', sub: 'Quoting', diff: 2, secs: 120, type: 'numeric',
  q: 'A contract pays the sum of two fair dice. You quote a market of 6.80 / 7.20 and I lift your offer (buy from you at 7.20). What is your expected profit on the trade, and what is your position?',
  a: 0.2, tol: 1e-6,
  sol: 'Fair value is 7. You sold at 7.20, so your expected edge is $0.20 and you are short one contract.\n\nThe key habit the interviewer is testing: after every trade, immediately restate (a) your position, (b) your edge, and (c) where you would now quote. Having been lifted, you should shade your market lower — say 6.70 / 7.10 — to attract a buy that flattens you.',
  firms: ['optiver', 'imc', 'sig'], tags: ['fair-value', 'edge', 'position']
},
{
  id: 'mm-003', cat: 'marketmaking', sub: 'Quoting', diff: 2, secs: 150, type: 'numeric',
  q: 'You are quoting a contract worth 50. A counterparty repeatedly hits your bid, five times in a row. What should you infer and do?',
  a: null, type2: 'discuss', aText: 'Assume adverse selection — lower your market aggressively and reduce size',
  sol: 'Repeated one-sided flow is information. Either they know something you do not, or your fair value is simply wrong.\n\nCorrect response: move your market down aggressively (not by one tick — by enough that you would be happy to buy again), and cut your quoted size. You are now long five lots, so your inventory risk alone justifies skewing lower even absent any information.\n\nThe failure mode interviewers watch for is a candidate who keeps quoting the same market and keeps getting hit, cheerfully accumulating a losing position while insisting the theoretical value is 50. Being right about fair value and wrong about flow is how market makers blow up.',
  firms: ['optiver', 'imc', 'jane-street', 'sig'], tags: ['adverse-selection', 'inventory', 'important']
},
{
  id: 'mm-004', cat: 'marketmaking', sub: 'Quoting', diff: 3, secs: 180, type: 'numeric',
  q: 'You make a market on the number of countries in the world. You quote 180 / 200 and the interviewer sells you 100 units at 180. What was your mistake?',
  a: null, type2: 'discuss', aText: 'Quoting size you were not prepared to trade — width must scale with uncertainty and size',
  sol: 'Two errors. First, the true figure (~195 UN-recognised states) sits inside your spread but near the top — your market was skewed wrongly relative to your own uncertainty. Second and more seriously, you allowed a trade of 100 units on a market where your uncertainty was ±10 or more.\n\nAlways state size along with your price: "180 / 200, ten up" means you will trade 10 units at either side. A market maker who quotes a price without a size has given the counterparty a free option on size, and a sophisticated counterparty will always take the maximum when they have the edge.\n\nThe general rule: spread width should scale with your uncertainty, and quoted size should scale inversely with it.',
  firms: ['optiver', 'imc', 'sig', 'jane-street'], tags: ['size', 'width', 'important']
},
{
  id: 'mm-005', cat: 'marketmaking', sub: 'Quoting', diff: 2, secs: 150, type: 'numeric',
  q: 'Fair value of a contract is 100 and you quote 99 / 101. A counterparty who is right 60% of the time trades against you. What is your expected P&L per trade, assuming they trade only when they believe they have edge and the contract settles at 100 ± 5?',
  a: null, type2: 'discuss', aText: 'Negative — informed flow at 60% accuracy overwhelms a 1-wide edge',
  sol: 'Set it up. You capture $1 of spread per trade. But the counterparty is informed: when they buy at 101, the settlement is 105 with probability 0.6 and 95 with probability 0.4.\n\nYour P&L when they buy: you are short from 101. E[P&L] = 0.6(101 − 105) + 0.4(101 − 95) = 0.6(−4) + 0.4(6) = −2.4 + 2.4 = 0.\n\nExactly break-even at 60%. Above 60% accuracy you lose money despite capturing spread every single trade.\n\nThis is the central economics of market making: your gross spread capture must exceed your adverse selection cost. It is why market makers widen dramatically around news events, and why they pay for uninformed retail flow.',
  firms: ['optiver', 'jane-street', 'citadel', 'imc'], tags: ['adverse-selection', 'ev', 'important']
},
{
  id: 'mm-006', cat: 'marketmaking', sub: 'Quoting', diff: 3, secs: 210, type: 'numeric',
  q: 'You are long 500 lots of a contract with fair value 20 and a daily volatility of 2. Your risk limit is $5,000 of daily standard deviation. Are you within limits, and what do you do?',
  a: 1000, tol: 1e-6,
  sol: 'Daily P&L standard deviation = position × per-unit volatility = 500 × 2 = $1,000.\n\nThat is well inside the $5,000 limit — you have room, and could in principle carry up to 2,500 lots.\n\nBut position limits are not the whole story. The right answer also flags: how liquid is the contract (can you exit 500 lots without moving the market?), how correlated is this with the rest of your book, and is your fair value estimate itself uncertain? Risk limits measure the risk you can measure.',
  firms: ['optiver', 'imc', 'citadel'], tags: ['risk', 'position-sizing']
},
{
  id: 'mm-007', cat: 'marketmaking', sub: 'Quoting', diff: 2, secs: 180, type: 'numeric',
  q: 'I will draw one card from a standard 52-card deck and pay you its face value in dollars, where A=1, 2–10 are face value, J=11, Q=12, K=13. Make a market.',
  a: 7, tol: 1e-6,
  sol: 'Values 1 through 13, each appearing 4 times, so the mean is just (1+13)/2 = 7.\n\nFair value 7. A reasonable quote is 6.75 / 7.25.\n\nVariance is worth having ready for the follow-up: uniform on 1..13 has variance (13² − 1)/12 = 168/12 = 14, so SD ≈ 3.74. That tells you the market should not be quoted a tick wide.',
  firms: ['optiver', 'imc', 'sig', 'akuna'], tags: ['fair-value', 'cards']
},
{
  id: 'mm-008', cat: 'marketmaking', sub: 'Quoting', diff: 3, secs: 240, type: 'numeric',
  q: 'I flip a fair coin 10 times. The contract pays $10 times the number of heads, but I will tell you the result of the first flip before you quote. If the first flip is heads, what is fair value?',
  a: 55, tol: 1e-6,
  sol: 'Given the first flip is a head, expected heads = 1 + 9(0.5) = 5.5. Contract pays 10 × 5.5 = $55.\n\nUnconditionally fair value is $50, so the information is worth $5.\n\nThe deeper point for the interview: the value of the information equals the change in conditional expectation, and a market maker who does not update on public information immediately will be picked off by everyone who does.',
  firms: ['optiver', 'jane-street', 'sig'], tags: ['conditional', 'information']
},

/* --------------------------------------------------------- EV / betting - */
{
  id: 'mm-020', cat: 'marketmaking', sub: 'Betting', diff: 2, secs: 150, type: 'numeric',
  q: 'You are offered a bet: win $110 with probability 0.5, lose $100 with probability 0.5. What is the expected value, and should you take it repeatedly with a $1,000 bankroll?',
  a: 5, tol: 1e-6,
  sol: 'EV = 0.5(110) + 0.5(−100) = $5 per bet — positive, so take it.\n\nBut with a $1,000 bankroll and $100 at risk per bet, you are wagering 10% of capital on a bet with a tiny edge. Ruin risk is material.\n\nKelly: the optimal fraction for a win/loss bet is f* = (p·b − q)/b where b is the win/loss ratio = 1.1. f* = (0.5×1.1 − 0.5)/1.1 = 0.05/1.1 ≈ 4.5% of bankroll, i.e. about $45 per bet, not $100. Most practitioners then trade half-Kelly or less because edge estimates are uncertain and overbetting is punished asymmetrically.',
  firms: ['optiver', 'sig', 'jane-street', 'imc'], tags: ['ev', 'kelly', 'important']
},
{
  id: 'mm-021', cat: 'marketmaking', sub: 'Betting', diff: 3, secs: 180, type: 'numeric',
  q: 'You have an edge where you win 60% of the time on even-money bets. What fraction of your bankroll should you bet to maximise long-run growth?',
  a: 0.2, tol: 1e-6,
  sol: 'Kelly criterion for even money: f* = 2p − 1 = 2(0.6) − 1 = 0.2, so 20% of bankroll.\n\nThe resulting expected log-growth per bet is 0.6·ln(1.2) + 0.4·ln(0.8) ≈ 0.0201, about 2% per bet.\n\nCritical caveats to volunteer: Kelly maximises log wealth, which implies a specific (log) utility. It produces violent drawdowns — a 50% drawdown is routine under full Kelly. And it is extremely sensitive to your estimate of p; overbetting past Kelly reduces growth and past 2×Kelly gives negative growth. Practitioners use quarter- to half-Kelly.',
  firms: ['optiver', 'sig', 'jane-street', 'citadel'], tags: ['kelly', 'important']
},
{
  id: 'mm-022', cat: 'marketmaking', sub: 'Betting', diff: 2, secs: 150, type: 'numeric',
  q: 'A bookmaker offers odds of 2.10 on Team A and 2.10 on Team B (decimal odds, two-outcome market). What is the bookmaker\'s margin?',
  a: null, type2: 'discuss', aText: 'Trick — this book is UNDERround; betting both sides locks in ≈ 5%',
  sol: 'Implied probabilities are 1/2.10 = 0.4762 each, summing to 0.9524.\n\nThat sums to less than 1, which would be an arbitrage in the punter\'s favour — so as stated the book is *underround* and you should bet both sides for a guaranteed 4.99% return.\n\nFor a normal book with a margin, odds would be below 2.00 on both sides, e.g. 1.90/1.90 → implied 0.5263 each, summing to 1.0526, an overround of 5.26%. The bookmaker\'s edge is that excess over 1.\n\nSpotting that the quoted numbers imply a free lunch — and saying so — is the point of the question.',
  firms: ['sig', 'optiver'], tags: ['odds', 'arbitrage']
},
{
  id: 'mm-023', cat: 'marketmaking', sub: 'Betting', diff: 3, secs: 210, type: 'numeric',
  q: 'Three horses have quoted decimal odds 2.0, 4.0 and 5.0. Is there an arbitrage, and what is the guaranteed return if so?',
  a: 0.05, tol: 0.005,
  sol: 'Implied probabilities: 1/2 + 1/4 + 1/5 = 0.5 + 0.25 + 0.2 = 0.95.\n\nSince the sum is below 1, there is an arbitrage. Stake proportionally to implied probabilities: bet 50%, 25% and 20% of your total outlay (0.95 of one unit) and you receive exactly 1 unit whichever horse wins.\n\nReturn = 1/0.95 − 1 = 5.26%.\n\nIn practice these vanish instantly and are eaten by fees, bet limits and the risk that one book voids the bet — worth mentioning as the reason true arbitrage is rare.',
  firms: ['sig', 'optiver', 'jane-street'], tags: ['arbitrage', 'odds']
},

/* ------------------------------------------------------------- options -- */
{
  id: 'opt-001', cat: 'options', sub: 'Basics', diff: 1, secs: 90, type: 'numeric',
  q: 'A stock trades at $100. A European call with strike $90 expires today. What is it worth?',
  a: 10, tol: 1e-6,
  sol: 'At expiry an option is worth its intrinsic value: max(S − K, 0) = max(100 − 90, 0) = $10.\n\nNo time value remains at expiry.',
  firms: ['optiver', 'imc', 'akuna', 'sig'], tags: ['payoff', 'basics']
},
{
  id: 'opt-002', cat: 'options', sub: 'Put-Call Parity', diff: 2, secs: 120, type: 'numeric',
  q: 'A stock trades at $100, a 3-month European call struck at $100 trades at $6, and interest rates are zero with no dividends. What must the $100 put be worth?',
  a: 6, tol: 1e-6,
  sol: 'Put-call parity: C − P = S − K·e^{−rT}.\n\nWith r = 0 and S = K = 100: C − P = 0, so P = C = $6.\n\nAt-the-money calls and puts have equal value when rates and dividends are zero. With positive rates the call is worth more (the forward sits above spot).',
  firms: ['optiver', 'imc', 'sig', 'akuna', 'citadel'], tags: ['put-call-parity', 'important']
},
{
  id: 'opt-003', cat: 'options', sub: 'Put-Call Parity', diff: 2, secs: 150, type: 'numeric',
  q: 'Stock at $50, one-year call struck $55 is worth $4, one-year put struck $55 is worth $7, rates are 4% continuously compounded, no dividends. Is there an arbitrage?',
  a: null, type2: 'discuss', aText: 'Yes — parity is violated by ≈ $0.84',
  sol: 'Parity requires C − P = S − Ke^{−rT}.\n\nLeft side: 4 − 7 = −3.\nRight side: 50 − 55e^{−0.04} = 50 − 55(0.9608) = 50 − 52.84 = −2.84.\n\nThe left side is $0.16 too low, so the call is cheap relative to the put. Buy the call, sell the put, short the stock, lend the proceeds — locking in about $0.16 per share at expiry, before transaction costs and borrow fees.\n\nAlways state the trade, not just "there is an arbitrage" — interviewers want the direction and the mechanics.',
  firms: ['optiver', 'imc', 'citadel', 'sig'], tags: ['put-call-parity', 'arbitrage']
},
{
  id: 'opt-004', cat: 'options', sub: 'Greeks', diff: 2, secs: 120, type: 'numeric',
  q: 'What is the approximate delta of an at-the-money European call option?',
  a: 0.5, tol: 0.06,
  sol: 'About 0.5, slightly above for a call because the forward sits above spot when rates are positive and because of the lognormal drift term.\n\nPrecisely, delta = N(d₁) with d₁ = (ln(S/K) + (r + σ²/2)T)/(σ√T). For ATM spot with r = 0, d₁ = σ√T/2 > 0, so delta is a touch over 0.5 — for a 20% vol one-year option, d₁ = 0.1 and delta ≈ 0.54.',
  firms: ['optiver', 'imc', 'akuna', 'citadel', 'sig'], tags: ['delta', 'greeks', 'important']
},
{
  id: 'opt-005', cat: 'options', sub: 'Greeks', diff: 2, secs: 150, type: 'numeric',
  q: 'You are long a straddle. What is your delta, and what are your gamma, vega and theta signs?',
  a: null, type2: 'discuss', aText: 'Delta ≈ 0; long gamma, long vega, short theta',
  sol: 'An ATM straddle is delta-neutral by construction (call delta ≈ +0.5, put delta ≈ −0.5).\n\nGamma: long — you profit from movement in either direction.\nVega: long — you profit if implied volatility rises.\nTheta: short — you pay time decay every day.\n\nThe trade is a bet that realised volatility will exceed the implied volatility you paid. The daily P&L of a delta-hedged long straddle is approximately ½Γ S²(realised² − implied²)dt — the gamma-theta trade-off that every options desk lives on.',
  firms: ['optiver', 'imc', 'akuna', 'citadel', 'sig'], tags: ['greeks', 'straddle', 'important']
},
{
  id: 'opt-006', cat: 'options', sub: 'Greeks', diff: 3, secs: 180, type: 'numeric',
  q: 'Where is gamma highest for a European option — in strike and in time to expiry?',
  a: null, type2: 'discuss', aText: 'At the money, and as expiry approaches',
  sol: 'Gamma peaks at (near) the money and increases sharply as expiry approaches. A one-day ATM option has enormous gamma; a one-year ATM option has modest gamma.\n\nΓ = φ(d₁)/(Sσ√T), so as T → 0 with S ≈ K, gamma → ∞.\n\nFar from the money, gamma is near zero at any maturity. The practical consequence: expiry-day ATM positions are where market makers get hurt, because delta flips from 0 to 1 on tiny moves and hedging costs explode. This is also the mechanism behind "gamma squeeze" and pinning near large open-interest strikes.',
  firms: ['optiver', 'imc', 'citadel', 'akuna'], tags: ['gamma', 'greeks', 'important']
},
{
  id: 'opt-007', cat: 'options', sub: 'Pricing', diff: 3, secs: 180, type: 'numeric',
  q: 'A stock is at $100 with 20% annualised volatility, zero rates. Approximately what is the price of a one-year at-the-money straddle?',
  a: 16, tol: 1.5,
  sol: 'Use the ATM approximation: an ATM option is worth approximately 0.4·S·σ·√T.\n\nCall ≈ 0.4 × 100 × 0.20 × 1 = $8. The put is worth the same at zero rates, so the straddle ≈ $16.\n\nThe constant is √(2/π)/2 ≈ 0.3989. So the straddle ≈ 0.8·S·σ·√T = 2 × 8 = $16, or 16% of spot.\n\nThis approximation is accurate to within a few percent for reasonable parameters and is the single most useful mental options formula on a trading floor.',
  firms: ['optiver', 'imc', 'akuna', 'citadel', 'jane-street'], tags: ['black-scholes', 'approximation', 'important']
},
{
  id: 'opt-008', cat: 'options', sub: 'Pricing', diff: 3, secs: 210, type: 'numeric',
  q: 'Under Black-Scholes, what happens to the value of a European call as volatility goes to infinity, and as it goes to zero (spot above strike)?',
  a: null, type2: 'discuss', aText: 'σ → ∞: call → S (spot). σ → 0: call → max(S − Ke^{−rT}, 0), the intrinsic forward value',
  sol: 'As σ → ∞, d₁ → +∞ and d₂ → −∞, so C → S·1 − Ke^{−rT}·0 = S. The call approaches the stock price itself — with unbounded volatility the strike becomes irrelevant, but the call can never be worth more than the stock (an important no-arbitrage bound).\n\nAs σ → 0, the stock grows deterministically at r, so C → max(S − Ke^{−rT}, 0), the discounted intrinsic value on the forward.\n\nMonotonicity in σ (vega > 0 always for a vanilla) is what makes implied volatility uniquely well defined by inversion.',
  firms: ['optiver', 'citadel', 'imc'], tags: ['black-scholes', 'limits', 'bounds']
},
{
  id: 'opt-009', cat: 'options', sub: 'Pricing', diff: 3, secs: 240, type: 'numeric',
  q: 'Explain why an American call on a non-dividend-paying stock should never be exercised early.',
  a: null, type2: 'discuss', aText: 'Early exercise throws away time value and the interest on the strike; better to sell the option',
  sol: 'Two losses from early exercise. You pay K now instead of at expiry, forfeiting the interest on K (worth K(1 − e^{−rT})). And you give up all remaining optionality — the downside protection if the stock falls below K.\n\nFormally, C ≥ S − Ke^{−rT} > S − K = intrinsic for r > 0, so the option is always worth more alive than exercised. If you want to realise value, sell the option rather than exercise it.\n\nThe American call therefore has the same value as the European. This breaks with dividends: it can be optimal to exercise just before a large ex-dividend date to capture the dividend. American *puts* can always be optimally exercised early, because receiving K early earns interest.',
  firms: ['optiver', 'imc', 'citadel', 'sig'], tags: ['american', 'early-exercise', 'important']
},
{
  id: 'opt-010', cat: 'options', sub: 'Vol Surface', diff: 3, secs: 210, type: 'numeric',
  q: 'Why does the equity index implied volatility skew slope downward in strike, and what would a flat skew imply?',
  a: null, type2: 'discuss', aText: 'Crash risk / negative return skew and leverage effect; flat skew implies lognormal returns',
  sol: 'Downward skew (low strikes have higher implied vol) reflects several reinforcing facts:\n\n1. The empirical return distribution is negatively skewed with fat left tails — crashes are sharper than rallies, so out-of-the-money puts are genuinely worth more than lognormal pricing implies.\n2. The leverage effect: as equity falls, leverage rises and volatility rises, so price and vol are negatively correlated.\n3. Persistent structural demand for downside protection from institutional hedgers, plus dealers charging for the tail risk they warehouse.\n\nA flat skew would imply returns are exactly lognormal with constant volatility — the pure Black-Scholes world. That has not been observed in index options since 1987, which is precisely when the skew appeared.\n\nStrong follow-up: single stocks have much flatter skew than indices, because index skew is amplified by correlation rising in selloffs.',
  firms: ['optiver', 'imc', 'citadel', 'akuna'], tags: ['skew', 'vol-surface', 'important']
},
{
  id: 'opt-011', cat: 'options', sub: 'Hedging', diff: 3, secs: 240, type: 'numeric',
  q: 'You are short a call and delta-hedging continuously. The stock realises 30% volatility but you sold the option at 20% implied. Roughly what happens to your P&L?',
  a: null, type2: 'discuss', aText: 'You lose — short gamma with realised above implied',
  sol: 'You lose money. Short a call means short gamma: your delta hedge always buys high and sells low as the stock moves.\n\nThe P&L of a continuously delta-hedged short option position is approximately:\n\nP&L ≈ ½ Σ Γ S² (σ²_implied − σ²_realised) Δt\n\nWith implied 20% and realised 30%, σ²_imp − σ²_real = 0.04 − 0.09 = −0.05, so the position bleeds every period in proportion to gamma.\n\nOver a year on a $100 stock with peak gamma, the loss is on the order of the difference in straddle values: roughly 0.8·100·(0.30 − 0.20) = $8 per share.\n\nThe headline lesson: selling options is selling volatility, and you are paid the implied while paying out the realised.',
  firms: ['optiver', 'imc', 'akuna', 'citadel'], tags: ['delta-hedging', 'gamma', 'important']
},
{
  id: 'opt-012', cat: 'options', sub: 'Structures', diff: 2, secs: 180, type: 'numeric',
  q: 'A call spread: long the $100 call, short the $110 call, both one year, on a $100 stock. What is the maximum profit and maximum loss?',
  a: null, type2: 'discuss', aText: 'Max profit = $10 minus net premium; max loss = net premium paid',
  sol: 'Max payoff at expiry is $10 (stock at or above $110). Subtract the net premium paid to get max profit.\n\nMax loss is the net premium, realised if the stock finishes at or below $100.\n\nThe structure caps both sides, which is precisely why it is cheaper than a naked call. Greeks: near-zero vega if both legs have similar vol (the long and short vega roughly offset), which makes it a directional bet with limited volatility exposure — a useful thing to say when the interviewer asks why you would choose it over an outright call.',
  firms: ['optiver', 'imc', 'sig', 'akuna'], tags: ['spreads', 'payoff']
},
{
  id: 'opt-013', cat: 'options', sub: 'Structures', diff: 3, secs: 210, type: 'numeric',
  q: 'A butterfly spread (long 1× $90 call, short 2× $100 calls, long 1× $110 call) always has non-negative value. What does that imply about option prices as a function of strike?',
  a: null, type2: 'discuss', aText: 'Call prices must be convex in strike — otherwise arbitrage',
  sol: 'The butterfly has a non-negative payoff at every terminal stock price (zero outside [90,110], peaking at $10 when S = 100). By no-arbitrage its price must be non-negative:\n\nC(90) − 2C(100) + C(110) ≥ 0\n\nThat is exactly the discrete second derivative, so call price must be a convex function of strike.\n\nTwo companion conditions: C must be non-increasing in strike (call spreads have non-negative value), and the second derivative ∂²C/∂K² equals the risk-neutral density of the terminal price (Breeden–Litzenberger). A negative butterfly price would imply a negative probability density — which is why quoting engines check exactly this constraint before publishing a surface.',
  firms: ['optiver', 'citadel', 'imc', 'jane-street'], tags: ['butterfly', 'no-arbitrage', 'breeden-litzenberger', 'hard']
},
{
  id: 'opt-014', cat: 'options', sub: 'Basics', diff: 2, secs: 120, type: 'numeric',
  q: 'A stock is $100 and pays a $5 dividend tomorrow. What happens to the price of a $100 strike call?',
  a: null, type2: 'discuss', aText: 'Falls — the stock drops by roughly the dividend on the ex-date',
  sol: 'On the ex-dividend date the stock drops by approximately the dividend, to $95. The call loses value accordingly — this is already priced in beforehand, so nothing happens *on the day* to a correctly priced option.\n\nThe key insight: options are not dividend-adjusted, so option holders do not receive dividends. Higher expected dividends lower call values and raise put values, entering Black-Scholes through the forward: F = S·e^{(r−q)T}.\n\nThis is also why early exercise of an American call can be optimal just before a large ex-dividend date.',
  firms: ['optiver', 'imc', 'sig'], tags: ['dividends', 'forward']
},
{
  id: 'opt-015', cat: 'options', sub: 'Basics', diff: 2, secs: 150, type: 'numeric',
  q: 'What is the relationship between the forward price and the spot price of a non-dividend stock, and why can\'t the forward be lower?',
  a: null, type2: 'discuss', aText: 'F = S·e^{rT}; a lower forward permits cash-and-carry arbitrage',
  sol: 'F = S·e^{rT} for a non-dividend-paying asset.\n\nIf F < S·e^{rT}, you would buy the forward, short the stock, and invest the proceeds at r. At maturity you take delivery via the forward at F, return the stock, and pocket S·e^{rT} − F risk-free. This is reverse cash-and-carry.\n\nIf F > S·e^{rT} you do the reverse: borrow, buy the stock, sell the forward.\n\nWith dividends or carry costs, F = S·e^{(r−q)T}. For commodities, storage costs and convenience yield enter the same way, which is why commodity curves can be in backwardation while equity forwards essentially never are.',
  firms: ['optiver', 'imc', 'citadel', 'sig'], tags: ['forwards', 'arbitrage', 'carry']
}

]);
