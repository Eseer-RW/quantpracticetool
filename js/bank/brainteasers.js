/* Brainteasers, logic puzzles, and estimation ("Fermi") questions.
 * These are the questions firms use to watch you think out loud rather than to
 * check whether you know a formula.
 */
window.QP = window.QP || {};
QP.BANK = (QP.BANK || []).concat([

/* ------------------------------------------------------------- logic ----- */
{
  id: 'bt-001', cat: 'brainteasers', sub: 'Logic', diff: 1, secs: 90, type: 'numeric',
  q: 'A bat and a ball cost $1.10 together. The bat costs $1.00 more than the ball. How much does the ball cost, in cents?',
  a: 5, tol: 1e-6,
  sol: 'b + (b + 1.00) = 1.10 → 2b = 0.10 → b = $0.05, so 5 cents.\n\nThe intuitive-but-wrong answer of 10 cents makes the bat $1.10 and the total $1.20. Firms include this as a calibration check on whether you verify before answering.',
  firms: ['optiver', 'imc', 'sig'], tags: ['classic', 'algebra']
},
{
  id: 'bt-002', cat: 'brainteasers', sub: 'Logic', diff: 2, secs: 120, type: 'numeric',
  q: 'You have a 3-litre jug and a 5-litre jug and unlimited water. What is the minimum number of pour/fill/empty operations to measure exactly 4 litres?',
  a: 6, tol: 0.5,
  sol: 'Fill 5 (1). Pour into 3, leaving 2 in the 5-jug (2). Empty the 3 (3). Pour the 2 into the 3-jug (4). Fill 5 again (5). Pour from 5 into the 3-jug — it only takes 1 more litre — leaving exactly 4 in the 5-jug (6).\n\nSix operations.',
  firms: ['optiver', 'imc'], tags: ['classic']
},
{
  id: 'bt-003', cat: 'brainteasers', sub: 'Logic', diff: 2, secs: 150, type: 'numeric',
  q: 'You have two ropes. Each burns for exactly 60 minutes, but not at a uniform rate. Using only these ropes and a lighter, how many minutes is the shortest interval you can measure that is not 60 or 30?',
  a: 15, tol: 1e-6,
  sol: 'Light rope A at both ends and rope B at one end simultaneously. Rope A is consumed in 30 minutes. At that moment, rope B has 30 minutes of burn left; light its other end too, and it finishes in 15 more minutes.\n\nSo you can measure 15 minutes (and 45 in total).',
  firms: ['optiver', 'sig', 'imc'], tags: ['classic']
},
{
  id: 'bt-004', cat: 'brainteasers', sub: 'Logic', diff: 3, secs: 240, type: 'numeric',
  q: 'You have 8 balls that look identical; one is heavier. Using a balance scale, what is the minimum number of weighings guaranteed to find it?',
  a: 2, tol: 1e-6,
  sol: 'Weigh 3 vs 3. If they balance, the heavy ball is among the remaining 2 — one more weighing finds it. If one side is heavier, take those 3 and weigh 1 vs 1: either one drops, or the third is the heavy one.\n\nTwo weighings. In general 3 weighings cover up to 27 balls, since each weighing has 3 outcomes.',
  firms: ['optiver', 'jane-street', 'sig'], tags: ['classic', 'information']
},
{
  id: 'bt-005', cat: 'brainteasers', sub: 'Logic', diff: 3, secs: 300, type: 'numeric',
  q: 'You have 12 identical-looking balls; exactly one has a different weight (you do not know if heavier or lighter). What is the minimum number of balance weighings that guarantees identifying it AND whether it is heavy or light?',
  a: 3, tol: 1e-6,
  sol: '3 weighings.\n\nInformation bound: there are 24 possible answers (12 balls × 2 directions) and 3 weighings give 3³ = 27 distinguishable outcomes, so 3 is at least conceivable — and a careful scheme achieves it.\n\nWeighing 1: {1,2,3,4} vs {5,6,7,8}.\n• If balanced, the odd ball is in {9,10,11,12}; weigh {9,10,11} vs three known-good balls, then one more weighing settles it.\n• If unbalanced (say left heavy), weigh {1,2,5} vs {3,6,9(known good)}. The pattern of results across the two weighings uniquely determines the ball and its direction.\n\nThe interviewer is watching for the information-theoretic bound *before* you start constructing a scheme.',
  firms: ['jane-street', 'citadel', 'optiver'], tags: ['classic', 'information', 'hard']
},
{
  id: 'bt-006', cat: 'brainteasers', sub: 'Logic', diff: 2, secs: 180, type: 'numeric',
  q: 'You have 100 doors, all closed. You make 100 passes: on pass k you toggle every k-th door. After all 100 passes, how many doors are open?',
  a: 10, tol: 1e-6,
  sol: 'Door n is toggled once per divisor of n. It ends open iff n has an odd number of divisors, which happens exactly for perfect squares.\n\nSquares up to 100: 1, 4, 9, …, 100 → 10 doors.',
  firms: ['optiver', 'imc', 'sig'], tags: ['classic', 'number-theory']
},
{
  id: 'bt-007', cat: 'brainteasers', sub: 'Logic', diff: 3, secs: 300, type: 'numeric',
  q: '100 pirates ranked by seniority split 100 gold coins. The most senior proposes a split; all survivors vote; if the proposal fails to get at least half the votes, the proposer is thrown overboard and the next most senior proposes. Pirates are perfectly rational, prefer gold, and prefer throwing others overboard when otherwise indifferent. How many coins does the most senior pirate keep?',
  a: 51, tol: 1e-6,
  sol: 'Work backwards from small cases (convention: the proposer votes, and a tie passes).\n\n2 pirates: the senior takes all 100 — his own vote is half, which is enough.\n3 pirates: the proposer needs one more vote. Pirate 1 gets 0 in the 2-pirate game, so 1 coin buys him. Proposer keeps 99.\n4 pirates: buys the pirate who gets 0 in the 3-pirate game with 1 coin, keeps 99.\n5 pirates: buys the two pirates who get 0 in the 4-pirate game, keeps 98.\n\nThe pattern: the proposer bribes every alternate pirate with 1 coin each — precisely those who would receive nothing if the proposer were eliminated.\n\nWith 100 pirates the proposer needs 50 votes total: his own plus 49 bought at 1 coin each. He keeps 100 − 49 = 51.\n\nThe answer is sensitive to the tie-breaking convention, so state yours explicitly before computing. (The widely quoted "98" is the answer to the 5-pirate version of this puzzle, not the 100-pirate one.)',
  firms: ['jane-street', 'sig', 'optiver'], tags: ['game-theory', 'induction', 'classic']
},
{
  id: 'bt-008', cat: 'brainteasers', sub: 'Logic', diff: 3, secs: 240, type: 'numeric',
  q: 'Three people each wear a hat that is red or blue, assigned by independent fair coin flips. Each sees the other two hats but not their own. Simultaneously and without communicating, each must either guess their own colour or pass. The group wins if at least one person guesses correctly and nobody guesses wrongly. What is the best achievable win probability?',
  a: 0.75, tol: 1e-4,
  sol: 'Strategy: if you see two hats of the same colour, guess the opposite colour; otherwise pass.\n\nThe group loses only when all three hats are the same colour (2 of the 8 configurations), because then all three guess and all three are wrong. In the other 6 configurations exactly one person sees a matching pair, guesses, and is right.\n\nWin probability 6/8 = 3/4.\n\nEach individual guess is still right only half the time — the trick is to correlate the errors so all the wrong guesses pile into the same two outcomes. This is a Hamming-code argument and generalises to 2^k − 1 players with win probability 1 − 1/2^k.',
  firms: ['jane-street', 'citadel', 'hrt'], tags: ['hats', 'coding-theory', 'classic', 'hard']
},
{
  id: 'bt-009', cat: 'brainteasers', sub: 'Logic', diff: 3, secs: 300, type: 'numeric',
  q: '100 prisoners in a line each wear a red or blue hat and can see all hats in front of them but not their own or those behind. Starting from the back, each says one colour word, heard by all. They may agree a strategy beforehand. What is the maximum number guaranteed to be saved?',
  a: 99, tol: 1e-6,
  sol: 'The last prisoner (who sees all 99 hats) announces the parity of red hats he sees — say "red" for even, "blue" for odd. He is right only by luck.\n\nEveryone else tracks the parity: each subsequent prisoner knows the announced parity, sees the hats ahead, and has heard the colours behind, so can deduce their own hat exactly.\n\n99 guaranteed, plus the last with probability 1/2.',
  firms: ['jane-street', 'citadel', 'optiver'], tags: ['hats', 'parity', 'classic']
},
{
  id: 'bt-010', cat: 'brainteasers', sub: 'Logic', diff: 2, secs: 180, type: 'numeric',
  q: 'You have 1000 bottles of wine, exactly one of which is poisoned. The poison kills in exactly 24 hours. You have 24 hours and some test rats. What is the minimum number of rats needed to guarantee finding the poisoned bottle?',
  a: 10, tol: 1e-6,
  sol: 'Binary encoding. Number the bottles 0–999 in binary (10 bits). Rat i drinks from every bottle whose i-th bit is 1.\n\nAfter 24 hours, the pattern of which rats died reads off the bottle number in binary.\n\n2^10 = 1024 ≥ 1000, so 10 rats suffice — and 9 (512 outcomes) cannot.',
  firms: ['optiver', 'jane-street', 'imc'], tags: ['classic', 'binary', 'information']
},
{
  id: 'bt-011', cat: 'brainteasers', sub: 'Logic', diff: 2, secs: 150, type: 'numeric',
  q: 'You have two identical eggs and a 100-storey building. Eggs break above some unknown floor. What is the minimum number of drops that guarantees finding the threshold floor in the worst case?',
  a: 14, tol: 1e-6,
  sol: 'Drop the first egg at decreasing intervals so total worst case stays constant: floors 14, 27, 39, 50, 60, 69, 77, 84, 90, 95, 99, 100.\n\nIf the first egg breaks after k drops, you have 14 − k linear checks left with the second egg. Need n(n+1)/2 ≥ 100 → n = 14 (14·15/2 = 105 ≥ 100).\n\n14 drops.',
  firms: ['optiver', 'citadel', 'imc'], tags: ['classic', 'optimization']
},
{
  id: 'bt-012', cat: 'brainteasers', sub: 'Logic', diff: 3, secs: 240, type: 'numeric',
  q: 'A 3×3×3 cube is painted on all outside faces then cut into 27 unit cubes. How many unit cubes have exactly two painted faces?',
  a: 12, tol: 1e-6,
  sol: 'Two painted faces means the cube sits on an edge but not a corner. A cube has 12 edges, and a 3×3×3 has exactly 1 non-corner cube per edge.\n\n12 cubes. (Corners: 8 with three faces; face centres: 6 with one; the very centre: 1 with none. Total 8+12+6+1 = 27 ✓.)',
  firms: ['imc', 'optiver'], tags: ['geometry', 'counting']
},
{
  id: 'bt-013', cat: 'brainteasers', sub: 'Logic', diff: 2, secs: 120, type: 'numeric',
  q: 'A clock shows 3:15. What is the angle in degrees between the hour and minute hands?',
  a: 7.5, tol: 1e-6,
  sol: 'Minute hand at 15 min → 90°. Hour hand at 3:15 → 3 hours and a quarter → (3.25/12)·360 = 97.5°.\n\nDifference 7.5°.\n\nThe classic mistake is forgetting the hour hand drifts between the numbers.',
  firms: ['optiver', 'imc', 'sig'], tags: ['classic', 'geometry']
},
{
  id: 'bt-014', cat: 'brainteasers', sub: 'Logic', diff: 2, secs: 150, type: 'numeric',
  q: 'How many times per 12-hour period do the hour and minute hands of a clock overlap exactly?',
  a: 11, tol: 1e-6,
  sol: 'The minute hand laps the hour hand at a relative rate of 360 − 30 = 330 degrees per hour, so overlaps occur every 12/11 hours.\n\nIn 12 hours: 11 overlaps (at 12:00, ~1:05:27, ~2:10:55, …, and again at 12:00 which is the start of the next cycle).',
  firms: ['optiver', 'imc'], tags: ['classic', 'rates']
},
{
  id: 'bt-015', cat: 'brainteasers', sub: 'Logic', diff: 3, secs: 240, type: 'numeric',
  q: 'A snail climbs a 30-foot wall, going up 3 feet each day and sliding back 2 feet each night. On which day does it reach the top?',
  a: 28, tol: 1e-6,
  sol: 'Net progress is 1 foot per full day/night cycle, but the snail escapes the moment it touches the top during the day.\n\nAfter 27 days and nights it is at 27 feet. On day 28 it climbs 3 feet to 30 and is out — no slide back.\n\nDay 28. The trap is answering 30.',
  firms: ['imc', 'optiver'], tags: ['classic', 'off-by-one']
},

/* --------------------------------------------------------- estimation ---- */
{
  id: 'bt-020', cat: 'brainteasers', sub: 'Estimation', diff: 2, secs: 180, type: 'estimate',
  q: 'Estimate the number of golf balls that would fit inside a standard commercial airliner (e.g. a Boeing 737).',
  a: 10000000, tol: null, range: [2e6, 5e7],
  sol: 'Structure beats precision. Cabin ≈ cylinder of radius 1.8 m, length 30 m → volume ≈ π(1.8²)(30) ≈ 305 m³. Call it 250 m³ after seats and fittings.\n\nGolf ball diameter ≈ 4.3 cm → bounding cube ≈ 8×10⁻⁵ m³. With ~65% random close packing, effective volume per ball ≈ 1.2×10⁻⁴ m³.\n\n250 / 1.2×10⁻⁴ ≈ 2 million.\n\nAnything from ~1M to ~10M with a clean derivation scores full marks. The interviewer is grading your decomposition and your willingness to state assumptions, not your answer.',
  firms: ['optiver', 'sig', 'imc', 'jane-street'], tags: ['fermi', 'estimation']
},
{
  id: 'bt-021', cat: 'brainteasers', sub: 'Estimation', diff: 2, secs: 180, type: 'estimate',
  q: 'Estimate the total annual revenue of the global coffee industry in US dollars.',
  a: 4e11, tol: null, range: [1e11, 2e12],
  sol: 'Top-down: ~2 billion cups consumed per day globally. Blended price across home-brewed (~$0.20) and cafés (~$3) — say $0.50 average.\n\n2×10⁹ × $0.50 × 365 ≈ $365 billion per year.\n\nCross-check bottom-up: ~1 billion regular drinkers × ~$300/year ≈ $300B. The two routes agreeing to within a factor of 2 is the signal you want to show.',
  firms: ['sig', 'jane-street', 'optiver'], tags: ['fermi', 'estimation', 'market-sizing']
},
{
  id: 'bt-022', cat: 'brainteasers', sub: 'Estimation', diff: 2, secs: 180, type: 'estimate',
  q: 'Estimate how many piano tuners work in New York City.',
  a: 200, tol: null, range: [30, 1500],
  sol: 'The archetypal Fermi problem.\n\nNYC ≈ 8M people ≈ 3M households. Say 1 in 25 owns a piano → 120,000 pianos, plus schools and venues, call it 150,000.\n\nEach tuned ~1×/year → 150,000 tunings/year. A tuner does ~4/day × 250 days = 1,000/year.\n\n150,000 / 1,000 ≈ 150 tuners.\n\nAny answer in the 50–500 band with this structure is fine. Say your assumptions out loud and sanity-check the ones that swing the answer most.',
  firms: ['optiver', 'sig', 'imc'], tags: ['fermi', 'estimation', 'classic']
},
{
  id: 'bt-023', cat: 'brainteasers', sub: 'Estimation', diff: 2, secs: 180, type: 'estimate',
  q: 'Estimate the daily notional trading volume of the US equity market in dollars.',
  a: 5e11, tol: null, range: [1e11, 2e12],
  sol: 'Roughly 10–12 billion shares change hands daily across US venues, at an average share price of ~$40–50.\n\n11×10⁹ × $45 ≈ $500 billion per day.\n\nCross-check: US equity market cap ≈ $50 trillion, and annual turnover is roughly 1.5× market cap → $75T/year ÷ 252 days ≈ $300B/day. Same order of magnitude.\n\nKnowing this number roughly is close to table stakes for a trading interview — it anchors questions about market share, capacity and fee revenue.',
  firms: ['jane-street', 'citadel', 'optiver', 'sig'], tags: ['fermi', 'markets', 'domain-knowledge']
},
{
  id: 'bt-024', cat: 'brainteasers', sub: 'Estimation', diff: 3, secs: 210, type: 'estimate',
  q: 'Estimate the revenue a market maker earns per day capturing half the spread on 2% of US equity volume, assuming an average effective spread of 2 basis points.',
  a: 1000000, tol: null, range: [2e5, 1e7],
  sol: 'Daily US equity volume ≈ $500B. A 2% share → $10B of notional traded.\n\nCapturing half of a 2bp spread = 1bp = 0.0001 of notional.\n\n$10B × 0.0001 = $1 million per day gross, before adverse selection, fees, rebates and technology cost.\n\nThe realistic follow-up is that adverse selection eats a large fraction of gross capture — which is exactly the conversation the interviewer wants to have.',
  firms: ['optiver', 'jane-street', 'imc', 'citadel'], tags: ['fermi', 'markets', 'market-making']
},
{
  id: 'bt-025', cat: 'brainteasers', sub: 'Estimation', diff: 2, secs: 150, type: 'estimate',
  q: 'Estimate the weight in kilograms of all the water in an Olympic-size swimming pool.',
  a: 2500000, tol: null, range: [1e6, 5e6],
  sol: 'Olympic pool: 50 m × 25 m × 2 m = 2,500 m³.\n\nWater is 1,000 kg/m³ → 2,500,000 kg = 2,500 tonnes.\n\nA clean one where the only real requirement is remembering that 1 m³ of water is 1 tonne.',
  firms: ['imc', 'optiver'], tags: ['fermi', 'estimation']
},

/* -------------------------------------------------------- game theory ---- */
{
  id: 'bt-030', cat: 'brainteasers', sub: 'Game Theory', diff: 2, secs: 180, type: 'numeric',
  q: 'In a game, everyone picks an integer from 0 to 100 and the winner is whoever is closest to 2/3 of the average guess. Under common knowledge of full rationality, what is the Nash equilibrium guess?',
  a: 0, tol: 1e-6,
  sol: 'Iterated elimination of dominated strategies. No guess above 67 can ever win, so rational players stay below 67; then no guess above 44 can win; and so on, converging to 0.\n\nThe unique Nash equilibrium is 0.\n\nIn practice, played among real people, winning guesses cluster around 20–35 — which is precisely why trading firms like this question. The right answer in a real market is not the equilibrium but your estimate of how many levels of reasoning the other players will actually perform.',
  firms: ['jane-street', 'sig', 'optiver'], tags: ['game-theory', 'keynesian-beauty-contest']
},
{
  id: 'bt-031', cat: 'brainteasers', sub: 'Game Theory', diff: 3, secs: 240, type: 'numeric',
  q: 'Two players alternate removing 1, 2 or 3 stones from a pile of 21. The player who takes the last stone wins. Playing optimally, how many stones should the first player take?',
  a: 1, tol: 1e-6,
  sol: 'Losing positions are multiples of 4. If you leave your opponent a multiple of 4, whatever they take (1–3) you can complete to 4 and preserve the invariant.\n\n21 mod 4 = 1, so take 1 stone, leaving 20. The first player wins.\n\nThis is the Nim/subtraction-game pattern; the general rule for "take 1..k" is to leave a multiple of k+1.',
  firms: ['jane-street', 'sig', 'optiver'], tags: ['game-theory', 'nim']
},
{
  id: 'bt-032', cat: 'brainteasers', sub: 'Game Theory', diff: 3, secs: 300, type: 'numeric',
  q: 'Three duellists A, B, C shoot in turn (A first, then B, then C, repeating, skipping the dead). Their hit probabilities are 30%, 50% and 100% respectively. What is A\'s optimal first action?',
  a: null, type2: 'discuss', aText: 'Deliberately miss (shoot into the air)',
  sol: 'A should intentionally miss.\n\nIf A kills B, then C shoots next and never misses — A dies with certainty.\nIf A kills C, then B shoots at A with 50% — A survives that shot half the time and then gets a 30% shot back, giving A roughly a 3/7 ≈ 43% survival.\nIf A misses deliberately, then B faces C. B must shoot at C (the greater threat). If B hits (50%), A gets a fresh 30% shot at B. If B misses, C kills B, and A gets a 30% shot at C.\n\nEither way A always gets the next shot against a single opponent, which strictly dominates the alternatives. A\'s survival probability rises to roughly 40%+ — the highest of the three, despite being the worst shot.\n\nThe lesson interviewers want: the weakest player wins by not becoming anyone\'s target, and "doing nothing" can be the optimal action.',
  firms: ['jane-street', 'sig', 'optiver'], tags: ['game-theory', 'truel', 'classic']
},
{
  id: 'bt-033', cat: 'brainteasers', sub: 'Game Theory', diff: 3, secs: 240, type: 'numeric',
  q: 'You and an opponent alternate placing identical circular coins on a rectangular table, no overlaps. The player unable to move loses. Playing first, can you guarantee a win?',
  a: null, type2: 'discuss', aText: 'Yes — place the first coin exactly at the centre, then mirror',
  sol: 'Place your first coin exactly at the centre of the table. Thereafter, mirror your opponent\'s move through the centre point (180° rotation).\n\nBy symmetry, if their move was legal, your mirrored move is legal too — the centre coin is the only self-symmetric position and you already took it. So you always have a move, and the opponent runs out first.\n\nThe strategy-stealing / symmetry argument is the transferable idea; it recurs across a whole family of combinatorial game questions.',
  firms: ['jane-street', 'citadel'], tags: ['game-theory', 'symmetry', 'classic']
},

/* ------------------------------------------------------- number sense ---- */
{
  id: 'bt-040', cat: 'brainteasers', sub: 'Number Theory', diff: 2, secs: 120, type: 'numeric',
  q: 'What is the last digit of 7^100?',
  a: 1, tol: 1e-6,
  sol: 'Last digits of powers of 7 cycle with period 4: 7, 9, 3, 1.\n\n100 mod 4 = 0 → the fourth element of the cycle → 1.',
  firms: ['optiver', 'imc', 'jane-street'], tags: ['modular-arithmetic']
},
{
  id: 'bt-041', cat: 'brainteasers', sub: 'Number Theory', diff: 2, secs: 150, type: 'numeric',
  q: 'How many trailing zeros are there in 100! ?',
  a: 24, tol: 1e-6,
  sol: 'Trailing zeros come from factors of 10 = 2×5, and 5s are the binding constraint.\n\nfloor(100/5) + floor(100/25) + floor(100/125) = 20 + 4 + 0 = 24.',
  firms: ['optiver', 'jane-street', 'citadel'], tags: ['factorials', 'classic']
},
{
  id: 'bt-042', cat: 'brainteasers', sub: 'Number Theory', diff: 2, secs: 120, type: 'numeric',
  q: 'What is the sum of all integers from 1 to 1000?',
  a: 500500, tol: 1e-6,
  sol: 'n(n+1)/2 = 1000 × 1001 / 2 = 500,500.',
  firms: ['optiver', 'imc', 'akuna'], tags: ['series', 'mental-math']
},
{
  id: 'bt-043', cat: 'brainteasers', sub: 'Number Theory', diff: 3, secs: 180, type: 'numeric',
  q: 'What is 2^10 + 2^20 ?',
  a: 1049600, tol: 0.5,
  sol: '2^10 = 1,024 and 2^20 = 1,048,576.\n\nSum = 1,049,600 ≈ 1.05 × 10⁶.\n\nKnowing 2^10 ≈ 10³ (and hence 2^20 ≈ 10⁶, 2^30 ≈ 10⁹) is the mental-math shortcut worth internalising — it makes powers of 2 convertible to powers of 10 on sight.',
  firms: ['jane-street', 'optiver', 'hrt'], tags: ['powers', 'mental-math']
},
{
  id: 'bt-044', cat: 'brainteasers', sub: 'Number Theory', diff: 3, secs: 210, type: 'numeric',
  q: 'What is the remainder when 3^100 is divided by 7?',
  a: 4, tol: 1e-6,
  sol: 'Powers of 3 mod 7 cycle with period 6: 3, 2, 6, 4, 5, 1.\n\n100 mod 6 = 4 → the fourth element → 4.\n\n(By Fermat\'s little theorem 3⁶ ≡ 1 mod 7, so 3^100 = 3^{96}·3⁴ ≡ 3⁴ = 81 ≡ 4 mod 7.)',
  firms: ['jane-street', 'citadel', 'hrt'], tags: ['modular-arithmetic', 'fermat']
},
{
  id: 'bt-045', cat: 'brainteasers', sub: 'Number Theory', diff: 2, secs: 150, type: 'numeric',
  q: 'A number is divisible by 8 and by 12. What is the smallest number of distinct positive divisors it must have?',
  a: 8, tol: 1e-6,
  sol: 'It must be divisible by lcm(8,12) = 24 = 2³·3.\n\nThe divisor count of 24 is (3+1)(1+1) = 8. Any multiple of 24 has at least the 8 divisors of 24… so the answer is 8.\n\nDivisors of 24: 1, 2, 3, 4, 6, 8, 12, 24 — eight of them.',
  firms: ['optiver', 'imc'], tags: ['divisors', 'lcm']
}

]);
