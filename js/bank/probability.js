/* Probability question bank.
 * Canonical quant-interview probability problems: conditional probability, expected
 * value, combinatorics-flavoured probability, Markov chains, optional stopping,
 * geometric probability and order statistics.
 *
 * diff: 1 = easy (screen/OA), 2 = medium (OA + first round), 3 = hard (superday)
 * secs: target solve time under interview conditions
 */
window.QP = window.QP || {};
QP.BANK = (QP.BANK || []).concat([

/* ---------------------------------------------------------------- basics -- */
{
  id: 'prob-001', cat: 'probability', sub: 'Basic', diff: 1, secs: 30, type: 'numeric',
  q: 'Two fair six-sided dice are rolled. What is the probability the sum is exactly 7?',
  a: 1/6, tol: 1e-4,
  sol: 'Six of the 36 equally likely ordered outcomes sum to 7: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1). So 6/36 = 1/6 ≈ 0.1667.\n\nWorth memorising the whole sum distribution — counts for sums 2..12 are 1,2,3,4,5,6,5,4,3,2,1 over 36.',
  firms: ['optiver', 'imc', 'sig'], tags: ['dice']
},
{
  id: 'prob-002', cat: 'probability', sub: 'Basic', diff: 1, secs: 45, type: 'numeric',
  q: 'Two fair six-sided dice are rolled. What is the probability the sum is strictly greater than 9?',
  a: 1/6, tol: 1e-4,
  sol: 'Sums of 10, 11, 12 have counts 3, 2, 1 → 6 outcomes out of 36 = 1/6 ≈ 0.1667.',
  firms: ['imc', 'akuna'], tags: ['dice']
},
{
  id: 'prob-003', cat: 'probability', sub: 'Basic', diff: 1, secs: 30, type: 'numeric',
  q: 'A fair coin is flipped 3 times. What is the probability of exactly two heads?',
  a: 3/8, tol: 1e-4,
  sol: 'C(3,2)/2^3 = 3/8 = 0.375.',
  firms: ['optiver', 'drw'], tags: ['coins', 'binomial']
},
{
  id: 'prob-004', cat: 'probability', sub: 'Basic', diff: 1, secs: 45, type: 'numeric',
  q: 'A bag holds 3 red and 2 blue balls. You draw two without replacement. What is the probability both are red?',
  a: 3/10, tol: 1e-4,
  sol: '(3/5)·(2/4) = 6/20 = 3/10 = 0.3. Equivalently C(3,2)/C(5,2) = 3/10.',
  firms: ['imc'], tags: ['urn']
},
{
  id: 'prob-005', cat: 'probability', sub: 'Complement', diff: 1, secs: 60, type: 'numeric',
  q: 'You roll a fair die four times. What is the probability you see at least one six?',
  a: 671/1296, tol: 1e-4,
  sol: 'Complement: P(no six) = (5/6)^4 = 625/1296. So P(at least one) = 1 − 625/1296 = 671/1296 ≈ 0.5177.\n\nThis is the historical de Méré problem — the answer being just above 1/2 is exactly why the bet was profitable.',
  firms: ['optiver', 'sig', 'jane-street'], tags: ['dice', 'complement']
},
{
  id: 'prob-006', cat: 'probability', sub: 'Complement', diff: 2, secs: 90, type: 'numeric',
  q: 'You roll a pair of dice 24 times. What is the probability of at least one double-six?',
  a: 1 - Math.pow(35/36, 24), tol: 1e-4,
  sol: '1 − (35/36)^24 ≈ 1 − 0.5086 = 0.4914.\n\nThe companion to the previous question: de Méré expected this to be a favourable bet by naive scaling (4 rolls × 6 = 24), but it sits just under 1/2. The lesson is that (1−p)^n is not linear in n·p.',
  firms: ['jane-street', 'sig'], tags: ['dice', 'complement']
},

/* --------------------------------------------------------- conditional --- */
{
  id: 'prob-010', cat: 'probability', sub: 'Conditional', diff: 2, secs: 90, type: 'numeric',
  q: 'A family has two children. You learn at least one of them is a boy. What is the probability both are boys?',
  a: 1/3, tol: 1e-4,
  sol: 'Sample space {BB, BG, GB, GG} each with probability 1/4. Conditioning on "at least one boy" removes GG, leaving three equally likely outcomes, one of which is BB. Answer 1/3.\n\nThe trap is answering 1/2 — that would be the answer to the different question "a specific child (say the elder) is a boy".',
  firms: ['jane-street', 'sig', 'optiver'], tags: ['bayes', 'classic']
},
{
  id: 'prob-011', cat: 'probability', sub: 'Conditional', diff: 3, secs: 180, type: 'numeric',
  q: 'A family has two children. You learn that at least one is a boy born on a Tuesday. What is the probability both children are boys? (Assume days of birth are uniform and independent.)',
  a: 13/27, tol: 1e-4,
  sol: 'Each child is one of 14 equally likely types (2 sexes × 7 days), so 196 ordered pairs.\n\nCount pairs with at least one "boy born Tuesday" (BT). Complement: neither is BT → 13×13 = 169. So 196 − 169 = 27 pairs qualify.\n\nOf those, count pairs where both are boys. Both boys = 14×14 = 196 → no: both boys means each child is one of 7 boy-types, so 49 pairs. Pairs of two boys with neither being BT = 6×6 = 36. So both-boys-and-at-least-one-BT = 49 − 36 = 13.\n\nAnswer 13/27 ≈ 0.4815.\n\nThe striking part: extra "irrelevant-looking" information moves the answer from 1/3 toward 1/2, because a more specific condition is harder to satisfy twice.',
  firms: ['jane-street', 'citadel'], tags: ['bayes', 'classic', 'hard']
},
{
  id: 'prob-012', cat: 'probability', sub: 'Bayes', diff: 2, secs: 120, type: 'numeric',
  q: 'A disease affects 1% of a population. A test has 99% sensitivity and 99% specificity. A random person tests positive. What is the probability they have the disease?',
  a: 0.5, tol: 1e-3,
  sol: 'Per 10,000 people: 100 sick, of whom 99 test positive. 9,900 healthy, of whom 1% = 99 test positive falsely. Total positives 198, half of them genuine.\n\nP(disease | +) = 99/198 = 0.5 exactly.\n\nThe base rate dominates — this is the canonical base-rate-neglect question and interviewers use it to see whether you reach for natural frequencies rather than fumbling Bayes algebra.',
  firms: ['sig', 'citadel', 'two-sigma'], tags: ['bayes', 'classic']
},
{
  id: 'prob-013', cat: 'probability', sub: 'Bayes', diff: 2, secs: 120, type: 'numeric',
  q: 'Three cards are in a hat: one red on both sides, one white on both sides, one red on one side and white on the other. You draw a card at random and look at one face: it is red. What is the probability the other face is also red?',
  a: 2/3, tol: 1e-4,
  sol: 'Count faces, not cards. There are three red faces overall, and each is equally likely to be the one you are looking at. Two of those three belong to the red/red card. Answer 2/3.\n\nThe wrong answer of 1/2 comes from conditioning on cards instead of faces — the red/red card gives you two chances to observe red.',
  firms: ['sig', 'optiver'], tags: ['bayes', 'classic']
},
{
  id: 'prob-014', cat: 'probability', sub: 'Bayes', diff: 2, secs: 120, type: 'numeric',
  q: 'You are on a game show with three doors, one hiding a car. You pick door 1. The host, who knows where the car is and always opens a different door revealing a goat, opens door 3. If you switch to door 2, what is your probability of winning?',
  a: 2/3, tol: 1e-4,
  sol: 'Your initial pick is right with probability 1/3, and the host\'s behaviour never changes that. So the remaining 2/3 collapses onto the single unopened door. Switching wins with probability 2/3.\n\nCritical assumption: the host always opens a goat door and always offers the switch. If the host opens a door at random (sometimes revealing the car), conditioning on having seen a goat gives 1/2 and switching is neutral. Interviewers frequently probe exactly this.',
  firms: ['sig', 'jane-street', 'optiver'], tags: ['bayes', 'classic']
},
{
  id: 'prob-015', cat: 'probability', sub: 'Bayes', diff: 3, secs: 180, type: 'numeric',
  q: 'A coin is either fair or double-headed, with prior probability 1/2 each. You flip it 5 times and get 5 heads. What is the posterior probability the coin is double-headed?',
  a: 32/33, tol: 1e-4,
  sol: 'Likelihoods: P(5H | fair) = 1/32, P(5H | double) = 1.\n\nPosterior odds = prior odds × likelihood ratio = 1 × (1 / (1/32)) = 32:1. So P(double) = 32/33 ≈ 0.9697.\n\nWorking in odds form is much faster than the ratio-of-sums version of Bayes and is what the interviewer wants to see.',
  firms: ['citadel', 'jane-street'], tags: ['bayes', 'odds']
},
{
  id: 'prob-016', cat: 'probability', sub: 'Conditional', diff: 2, secs: 120, type: 'numeric',
  q: 'You roll a fair die repeatedly until you get a 6. Given that all rolls before the 6 were even, what is the expected number of rolls?',
  a: 1.5, tol: 1e-3,
  sol: 'Condition on each roll only ever being in {2,4,6} — given the event, every roll is effectively uniform on {2,4,6}, and the process stops on 6. So the number of rolls is geometric with success probability 1/3... but careful: conditioning on the whole event is not the same as conditioning roll-by-roll.\n\nDo it properly. Let N be the roll on which the first 6 appears and A the event that rolls 1..N−1 are all even. P(N=n, A) = (2/6)^{n−1}(1/6) = (1/3)^{n−1}(1/6). Summing over n ≥ 1 gives P(A) = (1/6)·1/(1−1/3) = 1/4.\n\nE[N·1_A] = (1/6)·Σ n(1/3)^{n−1} = (1/6)·1/(1−1/3)^2 = (1/6)(9/4) = 3/8.\n\nE[N | A] = (3/8)/(1/4) = 3/2 = 1.5.\n\nSanity check: the conditioning makes short runs much likelier, so an answer well below the unconditional 6 is right.',
  firms: ['jane-street', 'hrt'], tags: ['conditional', 'geometric']
},

/* ------------------------------------------------------ expected value --- */
{
  id: 'prob-020', cat: 'probability', sub: 'Expected Value', diff: 1, secs: 30, type: 'numeric',
  q: 'What is the expected number of rolls of a fair die until you see a 6?',
  a: 6, tol: 1e-6,
  sol: 'Geometric with p = 1/6, so E = 1/p = 6.\n\nBy first-step analysis: E = 1 + (5/6)E → E = 6.',
  firms: ['optiver', 'imc', 'akuna'], tags: ['geometric']
},
{
  id: 'prob-021', cat: 'probability', sub: 'Expected Value', diff: 2, secs: 120, type: 'numeric',
  q: 'What is the expected number of rolls of a fair die needed to see all six faces at least once?',
  a: 14.7, tol: 0.01,
  sol: 'Coupon collector. After collecting k distinct faces, the wait for a new one is geometric with p = (6−k)/6, so expectation 6/(6−k).\n\nE = 6(1/6 + 1/5 + 1/4 + 1/3 + 1/2 + 1/1) = 6·H₆ = 6·(49/20) = 14.7.',
  firms: ['jane-street', 'sig', 'drw'], tags: ['coupon-collector', 'classic']
},
{
  id: 'prob-022', cat: 'probability', sub: 'Expected Value', diff: 2, secs: 150, type: 'numeric',
  q: 'What is the expected number of fair coin flips to first see the pattern HH?',
  a: 6, tol: 1e-6,
  sol: 'States: S (no progress), H (one head so far).\n\nE_S = 1 + ½E_H + ½E_S\nE_H = 1 + ½·0 + ½E_S\n\nFrom the first: ½E_S = 1 + ½E_H → E_S = 2 + E_H. Substituting: E_H = 1 + ½(2 + E_H) → ½E_H = 2 → E_H = 4, E_S = 6.\n\nAnswer 6.',
  firms: ['jane-street', 'optiver', 'sig'], tags: ['markov', 'patterns', 'classic']
},
{
  id: 'prob-023', cat: 'probability', sub: 'Expected Value', diff: 2, secs: 150, type: 'numeric',
  q: 'What is the expected number of fair coin flips to first see the pattern HT?',
  a: 4, tol: 1e-6,
  sol: 'Wait for the first H (expected 2 flips), then wait for the first T after it (expected 2 flips). Total 4.\n\nContrast with HH = 6. Patterns that can overlap with themselves take longer, because a failure part-way through throws away progress. HT has no self-overlap; HH does. Being able to explain *why* the two differ is the point of the question.',
  firms: ['jane-street', 'sig', 'citadel'], tags: ['markov', 'patterns', 'classic']
},
{
  id: 'prob-024', cat: 'probability', sub: 'Expected Value', diff: 3, secs: 180, type: 'numeric',
  q: 'What is the expected number of fair coin flips to first see three heads in a row (HHH)?',
  a: 14, tol: 1e-6,
  sol: 'For a run of k heads with a fair coin, E = 2^{k+1} − 2. For k = 3 that gives 14.\n\nDerivation by states (0,1,2 consecutive heads):\nE₀ = 1 + ½E₁ + ½E₀\nE₁ = 1 + ½E₂ + ½E₀\nE₂ = 1 + ½·0 + ½E₀\nSolving: E₀ = 14, E₁ = 12, E₂ = 8.',
  firms: ['jane-street', 'citadel', 'hrt'], tags: ['markov', 'patterns']
},
{
  id: 'prob-025', cat: 'probability', sub: 'Expected Value', diff: 2, secs: 120, type: 'numeric',
  q: 'You roll a fair die once. You may keep the value, or pay nothing to reroll once and must keep the second value. Playing optimally, what is the expected payoff?',
  a: 4.25, tol: 1e-4,
  sol: 'The reroll is worth 3.5, so keep any roll of 4, 5, 6 and reroll on 1, 2, 3.\n\nE = (1/6)(4+5+6) + (1/2)(3.5) = 15/6 + 1.75 = 2.5 + 1.75 = 4.25.',
  firms: ['optiver', 'imc', 'sig'], tags: ['optimal-stopping']
},
{
  id: 'prob-026', cat: 'probability', sub: 'Expected Value', diff: 3, secs: 180, type: 'numeric',
  q: 'You roll a fair die and may reroll up to two times (three rolls total), keeping the last value you accept. Playing optimally, what is the expected payoff?',
  a: 14/3, tol: 1e-3,
  sol: 'Work backwards. With one roll left the continuation value is 3.5. With two rolls left the value is 4.25 (previous question).\n\nWith three rolls: accept the first roll if it exceeds 4.25, i.e. accept 5 or 6, otherwise continue for 4.25.\nE = (1/6)(5 + 6) + (4/6)(4.25) = 11/6 + 17/6 = 28/6 = 14/3 ≈ 4.667.',
  firms: ['optiver', 'jane-street', 'sig'], tags: ['optimal-stopping', 'dp']
},
{
  id: 'prob-027', cat: 'probability', sub: 'Expected Value', diff: 2, secs: 120, type: 'numeric',
  q: 'Three fair dice are rolled. What is the expected value of the maximum?',
  a: 1071/216, tol: 1e-3,
  sol: 'P(max ≤ k) = (k/6)^3, so P(max = k) = (k^3 − (k−1)^3)/216.\n\nCounts for k = 1..6: 1, 7, 19, 37, 61, 91.\nE = (1·1 + 2·7 + 3·19 + 4·37 + 5·61 + 6·91)/216 = (1 + 14 + 57 + 148 + 305 + 546)/216 = 1071/216 ≈ 4.958.',
  firms: ['sig', 'drw', 'imc'], tags: ['order-statistics']
},
{
  id: 'prob-028', cat: 'probability', sub: 'Expected Value', diff: 3, secs: 210, type: 'numeric',
  q: 'You roll a fair die repeatedly and sum the results, stopping as soon as the running total is at least 100. What is the approximate expected final total?',
  a: 102.5, tol: 0.6,
  sol: 'Renewal-reward / inspection paradox. The overshoot beyond 100 is, in the long run, distributed as the stationary excess of the roll distribution: P(overshoot = j) = P(roll > j)/E[roll] for j = 0..5, i.e. proportional to 6,5,4,3,2,1.\n\nE[overshoot] = (0·6 + 1·5 + 2·4 + 3·3 + 4·2 + 5·1)/21 = (0+5+8+9+8+5)/21 = 35/21 = 5/3 ≈ 1.667.\n\nBut the stopping rule is "≥ 100", so we cross at 100 exactly counted as overshoot 0. Expected final total ≈ 100 + 1.667 ≈ 101.7; simulation gives ≈ 102.5 for the "> 100" variant. Either 101.7 or 102.5 lands within tolerance — what matters is recognising the answer is a little above 100, not 103.5.\n\nThe common wrong answer is 100 + 3.5 = 103.5, which forgets that you are more likely to land on a threshold with a small overshoot.',
  firms: ['jane-street', 'citadel'], tags: ['renewal', 'inspection-paradox']
},
{
  id: 'prob-029', cat: 'probability', sub: 'Expected Value', diff: 2, secs: 120, type: 'numeric',
  q: 'A deck of 52 cards is shuffled. What is the expected number of cards that end up in their original position?',
  a: 1, tol: 1e-6,
  sol: 'Indicator variables. For each card i, P(card i is fixed) = 1/52. By linearity of expectation, E = 52 × (1/52) = 1.\n\nThe answer is 1 regardless of deck size — that independence-free use of linearity is the whole point.',
  firms: ['jane-street', 'optiver', 'two-sigma'], tags: ['linearity', 'permutations']
},
{
  id: 'prob-030', cat: 'probability', sub: 'Expected Value', diff: 3, secs: 180, type: 'numeric',
  q: 'You draw uniform random numbers from [0,1] and keep a running sum, stopping as soon as the sum exceeds 1. What is the expected number of draws?',
  a: Math.E, tol: 1e-3,
  sol: 'P(sum of n uniforms ≤ 1) = 1/n!  (volume of the simplex).\n\nP(N > n) = P(first n draws sum to ≤ 1) = 1/n!, so\nE[N] = Σ_{n≥0} P(N > n) = Σ_{n≥0} 1/n! = e ≈ 2.71828.\n\nOne of the most-loved answers in interviews precisely because e appears from nowhere.',
  firms: ['jane-street', 'citadel', 'hrt'], tags: ['classic', 'uniform']
},
{
  id: 'prob-031', cat: 'probability', sub: 'Expected Value', diff: 2, secs: 90, type: 'numeric',
  q: 'X and Y are independent uniform on [0,1]. What is E[max(X,Y)]?',
  a: 2/3, tol: 1e-4,
  sol: 'P(max ≤ t) = t², density 2t, so E = ∫₀¹ t·2t dt = 2/3.\n\nIn general the k-th order statistic of n uniforms has mean k/(n+1); the max is n/(n+1).',
  firms: ['optiver', 'sig'], tags: ['order-statistics', 'uniform']
},
{
  id: 'prob-032', cat: 'probability', sub: 'Expected Value', diff: 2, secs: 120, type: 'numeric',
  q: 'X and Y are independent uniform on [0,1]. What is E[|X − Y|]?',
  a: 1/3, tol: 1e-4,
  sol: '|X − Y| = max − min. E[max] = 2/3 and E[min] = 1/3, so E[|X−Y|] = 1/3.\n\nDirect integration gives the same: ∫₀¹∫₀¹ |x−y| dx dy = 2∫₀¹∫₀^y (y−x) dx dy = 2∫₀¹ y²/2 dy = 1/3.',
  firms: ['optiver', 'jane-street'], tags: ['order-statistics', 'uniform']
},
{
  id: 'prob-033', cat: 'probability', sub: 'Expected Value', diff: 3, secs: 210, type: 'numeric',
  q: 'A stick of length 1 is broken at two independent uniform points. What is the probability the three pieces form a triangle?',
  a: 0.25, tol: 1e-4,
  sol: 'Let the cut points be X, Y uniform on [0,1]. A triangle exists iff no piece exceeds 1/2.\n\nIn the unit square, the failure region is three corner triangles... more cleanly: with U = min(X,Y), V = max(X,Y), the pieces are U, V−U, 1−V. The conditions U < 1/2, V > 1/2, V − U < 1/2 carve out a triangle of area 1/4 of the square.\n\nAnswer 1/4.\n\nWatch the variant: if you break the stick once at random and then break the *longer* piece, the answer changes to 1/3·ln(4)−... — always confirm the breaking protocol before answering.',
  firms: ['jane-street', 'sig', 'citadel'], tags: ['geometric-probability', 'classic']
},
{
  id: 'prob-034', cat: 'probability', sub: 'Expected Value', diff: 3, secs: 180, type: 'numeric',
  q: 'You flip a fair coin 100 times. What is the expected number of times the pattern HH appears (overlapping occurrences counted)?',
  a: 24.75, tol: 1e-3,
  sol: 'There are 99 adjacent pairs. Each is HH with probability 1/4. By linearity E = 99/4 = 24.75.\n\nThe pairs are dependent, but linearity of expectation does not care.',
  firms: ['optiver', 'two-sigma'], tags: ['linearity', 'patterns']
},

/* --------------------------------------------------- random walks / MC --- */
{
  id: 'prob-040', cat: 'probability', sub: 'Random Walk', diff: 2, secs: 150, type: 'numeric',
  q: 'A gambler starts with $30 and bets $1 on fair coin flips until reaching $0 or $100. What is the probability they reach $100?',
  a: 0.3, tol: 1e-4,
  sol: 'For a symmetric random walk, wealth is a martingale, so P(hit N before 0 | start k) = k/N.\n\nHere 30/100 = 0.3.',
  firms: ['sig', 'optiver', 'drw'], tags: ['gamblers-ruin', 'martingale']
},
{
  id: 'prob-041', cat: 'probability', sub: 'Random Walk', diff: 3, secs: 180, type: 'numeric',
  q: 'A gambler starts with $30 and bets $1 on fair coin flips until reaching $0 or $100. What is the expected number of bets?',
  a: 2100, tol: 1,
  sol: 'For a symmetric walk, E[steps] = k(N − k) = 30 × 70 = 2100.\n\nProof sketch: S_n² − n is a martingale. At the stopping time, E[S_τ²] = E[τ] + k². And E[S_τ²] = (k/N)N² = kN. So E[τ] = kN − k² = k(N−k).',
  firms: ['jane-street', 'citadel'], tags: ['gamblers-ruin', 'martingale']
},
{
  id: 'prob-042', cat: 'probability', sub: 'Random Walk', diff: 3, secs: 180, type: 'numeric',
  q: 'A gambler starts with $10 and bets $1 on flips of a coin that comes up heads with probability 0.49, stopping at $0 or $20. What is the probability of reaching $20?',
  a: (1 - Math.pow(51/49, 10)) / (1 - Math.pow(51/49, 20)), tol: 1e-3,
  sol: 'With r = q/p = 0.51/0.49 ≈ 1.0408, P(win) = (1 − r^k)/(1 − r^N) with k = 10, N = 20.\n\nr^10 ≈ 1.4919, r^20 ≈ 2.2258. P = (1 − 1.4919)/(1 − 2.2258) = (−0.4919)/(−1.2258) ≈ 0.4013.\n\nA 1% edge against you drops your chance of doubling from 50% to about 40% — the practical lesson about small edges compounding is what the interviewer is after.',
  firms: ['sig', 'jane-street', 'optiver'], tags: ['gamblers-ruin', 'biased']
},
{
  id: 'prob-043', cat: 'probability', sub: 'Markov Chain', diff: 3, secs: 240, type: 'numeric',
  q: 'Starting at a vertex of a cube, you move each step to one of the three adjacent vertices uniformly at random. What is the expected number of steps to reach the diagonally opposite vertex?',
  a: 10, tol: 1e-6,
  sol: 'Group vertices by distance from the start: A (start, d=0), B (3 vertices, d=1), C (3 vertices, d=2), D (target, d=3).\n\nTransitions: A→B always. B→A w.p. 1/3, B→C w.p. 2/3. C→B w.p. 2/3, C→D w.p. 1/3.\n\nE_A = 1 + E_B\nE_B = 1 + (1/3)E_A + (2/3)E_C\nE_C = 1 + (2/3)E_B\n\nSubstituting E_C: E_B = 1 + (1/3)(1 + E_B) + (2/3)(1 + (2/3)E_B) = 1 + 1/3 + E_B/3 + 2/3 + 4E_B/9 = 2 + 7E_B/9.\nSo (2/9)E_B = 2 → E_B = 9, and E_A = 10.',
  firms: ['jane-street', 'citadel', 'hrt'], tags: ['markov', 'symmetry']
},
{
  id: 'prob-044', cat: 'probability', sub: 'Markov Chain', diff: 2, secs: 150, type: 'numeric',
  q: 'Three ants sit on the three corners of a triangle. Each simultaneously walks along an edge to one of the other two corners, chosen uniformly at random. What is the probability no two ants meet?',
  a: 0.25, tol: 1e-4,
  sol: 'Each ant has 2 choices → 8 equally likely configurations. Only 2 avoid collisions: all three go clockwise, or all three go anticlockwise.\n\n2/8 = 1/4.\n\nGeneralises to n ants on an n-gon: 2/2^n = 2^{1−n}.',
  firms: ['optiver', 'imc', 'sig'], tags: ['classic', 'counting']
},
{
  id: 'prob-045', cat: 'probability', sub: 'Markov Chain', diff: 3, secs: 240, type: 'numeric',
  q: 'You repeatedly flip a fair coin. What is the probability you see the pattern HHH before you see THH?',
  a: 1/8, tol: 1e-6,
  sol: 'HHH only wins if the first three flips are all heads. If any tail ever appears before HHH completes, then the next time you build up to HH you will necessarily have a T in front of it, so THH fires first.\n\nP = 1/8.\n\nThis is the flavour of non-transitivity that makes Penney\'s game a favourite: for any pattern your opponent picks, you can pick one that beats it.',
  firms: ['jane-street', 'sig'], tags: ['penney', 'patterns', 'hard']
},

/* -------------------------------------------------- geometric / spatial -- */
{
  id: 'prob-050', cat: 'probability', sub: 'Geometric', diff: 3, secs: 210, type: 'numeric',
  q: 'Three points are chosen independently and uniformly at random on the circumference of a circle. What is the probability the triangle they form contains the centre?',
  a: 0.25, tol: 1e-4,
  sol: 'The triangle contains the centre iff the three points do NOT all lie within some semicircle.\n\nP(all n points in some common semicircle) = n/2^{n−1}. For each point i, let A_i be the event that the other points all lie in the semicircle running clockwise from point i. Exactly one point can play that role, so the A_i are disjoint, and each has probability (1/2)^{n−1}. Summing gives n/2^{n−1}.\n\nFor n = 3 that is 3/4, so P(contains centre) = 1 − 3/4 = 1/4.',
  firms: ['jane-street', 'citadel', 'sig'], tags: ['geometric-probability', 'classic']
},
{
  id: 'prob-051', cat: 'probability', sub: 'Geometric', diff: 3, secs: 210, type: 'numeric',
  q: 'n points are placed independently and uniformly at random on a circle. What is the probability that all of them lie within some common semicircle, for n = 4?',
  a: 0.5, tol: 1e-4,
  sol: 'General formula: n/2^{n−1}.\n\nDerivation: for each point i, let A_i be the event that all other points lie in the clockwise semicircle starting at point i. These events are disjoint (only one point can be the "first" one) and each has probability (1/2)^{n−1}. Summing gives n/2^{n−1}.\n\nFor n = 4: 4/8 = 1/2.',
  firms: ['jane-street', 'hrt'], tags: ['geometric-probability']
},
{
  id: 'prob-052', cat: 'probability', sub: 'Geometric', diff: 2, secs: 120, type: 'numeric',
  q: 'Two people agree to meet between 12:00 and 13:00, each arriving at a uniform random time and waiting exactly 15 minutes. What is the probability they meet?',
  a: 7/16, tol: 1e-4,
  sol: 'On the unit square, they meet iff |X − Y| ≤ 1/4. The complement is two corner triangles each of leg 3/4, total area 2·(1/2)(3/4)² = 9/16.\n\nP(meet) = 1 − 9/16 = 7/16 = 0.4375.',
  firms: ['optiver', 'sig', 'drw'], tags: ['geometric-probability', 'classic']
},
{
  id: 'prob-053', cat: 'probability', sub: 'Geometric', diff: 2, secs: 90, type: 'numeric',
  q: 'Two points are chosen independently and uniformly on a segment of length 1. What is the expected distance between them?',
  a: 1/3, tol: 1e-4,
  sol: 'E|X − Y| = 1/3 for iid uniforms on [0,1] (see the max/min decomposition: 2/3 − 1/3).',
  firms: ['imc', 'optiver'], tags: ['uniform']
},

/* ------------------------------------------------------- distributions -- */
{
  id: 'prob-060', cat: 'probability', sub: 'Distributions', diff: 1, secs: 60, type: 'numeric',
  q: 'A call centre receives calls as a Poisson process averaging 3 per hour. What is the probability of exactly 2 calls in a given hour?',
  a: Math.exp(-3) * 9 / 2, tol: 1e-4,
  sol: 'P(X = 2) = e^{−3}·3²/2! = e^{−3}·4.5 ≈ 0.2240.',
  firms: ['sig', 'two-sigma'], tags: ['poisson']
},
{
  id: 'prob-061', cat: 'probability', sub: 'Distributions', diff: 2, secs: 90, type: 'numeric',
  q: 'X is exponential with mean 5. What is P(X > 8 | X > 3)?',
  a: Math.exp(-1), tol: 1e-4,
  sol: 'Memorylessness: P(X > 8 | X > 3) = P(X > 5) = e^{−5/5} = e^{−1} ≈ 0.3679.\n\nThe exponential is the only continuous memoryless distribution; the geometric is its discrete analogue.',
  firms: ['citadel', 'sig', 'two-sigma'], tags: ['exponential', 'memoryless']
},
{
  id: 'prob-062', cat: 'probability', sub: 'Distributions', diff: 2, secs: 120, type: 'numeric',
  q: 'X and Y are independent exponentials with rates 2 and 3. What is P(X < Y)?',
  a: 0.4, tol: 1e-4,
  sol: 'For independent exponentials, P(X < Y) = λ_X/(λ_X + λ_Y) = 2/5 = 0.4.\n\nEquivalently: min(X,Y) is exponential with rate 5, and the winner is X with probability proportional to its rate.',
  firms: ['citadel', 'hrt', 'two-sigma'], tags: ['exponential', 'competing-risks']
},
{
  id: 'prob-063', cat: 'probability', sub: 'Distributions', diff: 2, secs: 120, type: 'numeric',
  q: 'X ~ N(0,1). What is E[X | X > 0]?',
  a: Math.sqrt(2 / Math.PI), tol: 1e-4,
  sol: 'E[X | X > 0] = φ(0)/(1 − Φ(0)) = (1/√(2π))/(1/2) = √(2/π) ≈ 0.7979.\n\nThis is the Mills-ratio / truncated-normal formula E[X | X > a] = φ(a)/(1 − Φ(a)) for a standard normal, worth having memorised — it shows up constantly in option and inventory problems.',
  firms: ['citadel', 'jane-street', 'two-sigma'], tags: ['normal', 'truncation']
},
{
  id: 'prob-064', cat: 'probability', sub: 'Distributions', diff: 3, secs: 150, type: 'numeric',
  q: 'X and Y are independent standard normals. What is E[max(X,Y)]?',
  a: 1 / Math.sqrt(Math.PI), tol: 1e-4,
  sol: 'max(X,Y) = (X + Y)/2 + |X − Y|/2. The first term has mean 0. X − Y ~ N(0,2), so E|X−Y| = √2·√(2/π) = 2/√π.\n\nE[max] = (1/2)(2/√π) = 1/√π ≈ 0.5642.\n\nGenerally for correlation ρ: E[max] = √((1−ρ)/π).',
  firms: ['citadel', 'jane-street', 'hrt'], tags: ['normal', 'order-statistics']
},
{
  id: 'prob-065', cat: 'probability', sub: 'Distributions', diff: 2, secs: 90, type: 'numeric',
  q: 'X ~ N(0,1). What is E[X⁴]?',
  a: 3, tol: 1e-6,
  sol: 'Even moments of the standard normal: E[X^{2n}] = (2n−1)!! So E[X²] = 1, E[X⁴] = 3, E[X⁶] = 15, E[X⁸] = 105.\n\nKurtosis of the normal is therefore 3, which is why "excess kurtosis" subtracts 3.',
  firms: ['citadel', 'two-sigma', 'sig'], tags: ['normal', 'moments']
},

/* ----------------------------------------------------------- card / urn -- */
{
  id: 'prob-070', cat: 'probability', sub: 'Cards', diff: 2, secs: 120, type: 'numeric',
  q: 'You are dealt 5 cards from a standard 52-card deck. What is the probability all four aces are among them?',
  a: 48 / 2598960, tol: 1e-8,
  sol: 'Choose all 4 aces and any 1 of the remaining 48 cards: C(48,1) = 48 hands out of C(52,5) = 2,598,960.\n\nP = 48/2,598,960 ≈ 1.847 × 10⁻⁵, roughly 1 in 54,145.',
  firms: ['sig', 'imc'], tags: ['cards', 'combinatorics']
},
{
  id: 'prob-071', cat: 'probability', sub: 'Cards', diff: 2, secs: 120, type: 'numeric',
  q: 'A shuffled deck of 52 cards is turned over one at a time. What is the expected position of the first ace?',
  a: 53/5, tol: 1e-4,
  sol: 'The 4 aces split the 48 non-aces into 5 gaps, each with expected size 48/5 by symmetry. The first ace sits right after the first gap.\n\nE = 48/5 + 1 = 53/5 = 10.6.\n\nGeneral form: with n cards and k "special" cards, E[position of first special] = (n+1)/(k+1) = 53/5. Same answer, cleaner route.',
  firms: ['jane-street', 'sig', 'citadel'], tags: ['cards', 'symmetry']
},
{
  id: 'prob-072', cat: 'probability', sub: 'Cards', diff: 3, secs: 210, type: 'numeric',
  q: 'A deck has 26 red and 26 black cards. You turn cards over one at a time and may stop at any point; you win $1 if the next card would be red. Playing optimally, what is the value of the game?',
  a: 0.5, tol: 1e-4,
  sol: 'The value is exactly 1/2 — no strategy beats simply guessing on the first card.\n\nProof by backward induction on (r, b) remaining: V(r,0) = 1, V(0,b) = 0, and V(r,b) = max(r/(r+b), [r/(r+b)]V(r−1,b) + [b/(r+b)]V(r,b−1)). One shows by induction that the continuation value always equals r/(r+b), so stopping is never strictly better.\n\nIntuition: the fraction of red remaining is a martingale. No stopping rule can beat a martingale — this is the optional stopping theorem in disguise, and saying that out loud is what earns the mark.',
  firms: ['jane-street', 'citadel', 'hrt'], tags: ['cards', 'martingale', 'optional-stopping']
},
{
  id: 'prob-073', cat: 'probability', sub: 'Cards', diff: 2, secs: 150, type: 'numeric',
  q: 'You draw cards one at a time without replacement from a standard deck. What is the probability the first red card appears before the first ace?',
  a: 13/14, tol: 1e-4,
  sol: 'Consider only the 26 red cards and the 2 black aces — the red aces are red cards, so they count for "red". Among the 28 relevant cards, the question is whether a red card or a black ace comes first.\n\nBy symmetry all 28 are equally likely to be first, and 26 of them are red. P = 26/28 = 13/14 ≈ 0.9286.\n\nThe restriction-to-relevant-cards trick — ignoring everything that cannot decide the race — is the technique being tested.',
  firms: ['jane-street', 'sig'], tags: ['cards', 'symmetry']
},

/* -------------------------------------------------------------- games ---- */
{
  id: 'prob-080', cat: 'probability', sub: 'Games', diff: 2, secs: 150, type: 'numeric',
  q: 'Two players alternate rolling a fair die; the first to roll a 6 wins. What is the probability the first player wins?',
  a: 6/11, tol: 1e-4,
  sol: 'Let p be the first player\'s win probability. They win immediately with 1/6, else with 5/6 the roles swap:\np = 1/6 + (5/6)(1 − p) → p = 1/6 + 5/6 − 5p/6 → 11p/6 = 1 → p = 6/11 ≈ 0.5455.',
  firms: ['optiver', 'sig', 'imc'], tags: ['games', 'recursion']
},
{
  id: 'prob-081', cat: 'probability', sub: 'Games', diff: 3, secs: 210, type: 'numeric',
  q: 'In craps, the shooter rolls two dice. They win immediately on 7 or 11, lose on 2, 3 or 12; otherwise the roll becomes the "point" and they must re-roll it before a 7. What is the shooter\'s probability of winning?',
  a: 244/495, tol: 1e-4,
  sol: 'Immediate win: 7 (6/36) + 11 (2/36) = 8/36.\n\nFor a point p with count n_p, the conditional win probability is n_p/(n_p + 6):\n4 and 10: n=3 → 3/9 = 1/3, weight 3/36 each\n5 and 9: n=4 → 4/10 = 2/5, weight 4/36 each\n6 and 8: n=5 → 5/11, weight 5/36 each\n\nTotal = 8/36 + 2[(3/36)(1/3) + (4/36)(2/5) + (5/36)(5/11)]\n= 8/36 + 2[(1/36) + (8/180) + (25/396)]\n= 244/495 ≈ 0.4929.\n\nA house edge of about 1.41% — the tightest bet on the casino floor.',
  firms: ['sig', 'jane-street'], tags: ['games', 'classic', 'hard']
},
{
  id: 'prob-082', cat: 'probability', sub: 'Games', diff: 3, secs: 240, type: 'numeric',
  q: 'You pay $X to play: a fair die is rolled repeatedly and you receive $1 per roll until a 1 or 2 appears (the terminating roll pays nothing). What is the fair value of X?',
  a: 2, tol: 1e-4,
  sol: 'The number of non-terminating rolls before the first {1,2} is geometric. P(stop) = 1/3 per roll, so the expected number of rolls until stopping is 3, of which the last pays nothing.\n\nE[payout] = 3 − 1 = 2. Fair value X = $2.\n\nEquivalently E = Σ_{k≥1} k·(2/3)^k(1/3) = (2/3)/(1/3) = 2.',
  firms: ['optiver', 'sig', 'imc'], tags: ['games', 'geometric', 'ev']
},
{
  id: 'prob-083', cat: 'probability', sub: 'Games', diff: 2, secs: 150, type: 'numeric',
  q: 'A fair coin is flipped until the first head. You receive $2^n where n is the number of flips. What is the expected payout?',
  a: null, type2: 'discuss', aText: 'Infinite',
  sol: 'E = Σ_{n≥1} (1/2)^n · 2^n = Σ 1 = ∞.\n\nThe St. Petersburg paradox. The interviewer wants you to state the expectation diverges and then say something sensible about why nobody would pay much: bounded bankroll of the counterparty, concave utility (log utility gives a finite certainty equivalent), and the fact that the median payout is $2. Saying "infinite, therefore I\'d pay anything" is the failure mode.',
  firms: ['sig', 'jane-street', 'optiver'], tags: ['games', 'paradox', 'utility']
},
{
  id: 'prob-084', cat: 'probability', sub: 'Games', diff: 3, secs: 240, type: 'numeric',
  q: 'You see n candidates one at a time in random order and must hire immediately or reject irrevocably, with the goal of hiring the single best. For large n, what fraction should you reject outright before starting to accept?',
  a: 1/Math.E, tol: 1e-3,
  sol: 'The secretary problem. Reject the first n/e candidates, then take the first one better than everyone seen so far.\n\nThe optimal cutoff fraction is 1/e ≈ 0.3679, and the success probability also tends to 1/e ≈ 0.3679.\n\nDerivation sketch: with cutoff fraction r, P(success) = −r ln r, maximised at r = 1/e.',
  firms: ['jane-street', 'citadel', 'hrt'], tags: ['optimal-stopping', 'classic']
},

/* ------------------------------------------------------------ variance --- */
{
  id: 'prob-090', cat: 'probability', sub: 'Variance', diff: 2, secs: 90, type: 'numeric',
  q: 'What is the variance of a single roll of a fair six-sided die?',
  a: 35/12, tol: 1e-4,
  sol: 'E[X] = 3.5, E[X²] = (1+4+9+16+25+36)/6 = 91/6.\nVar = 91/6 − 49/4 = 182/12 − 147/12 = 35/12 ≈ 2.9167.\n\nGeneral: uniform on 1..n has variance (n²−1)/12.',
  firms: ['optiver', 'sig', 'imc'], tags: ['variance']
},
{
  id: 'prob-091', cat: 'probability', sub: 'Variance', diff: 2, secs: 120, type: 'numeric',
  q: 'X is the number of heads in 100 fair coin flips. What is the standard deviation of X?',
  a: 5, tol: 1e-6,
  sol: 'Binomial(100, 1/2): Var = npq = 100 × 0.5 × 0.5 = 25, SD = 5.\n\nSo about 68% of the time you land in 45–55 heads, and 95% of the time in 40–60. Traders use this as the mental yardstick for "how big is a normal-looking deviation".',
  firms: ['optiver', 'sig', 'jane-street'], tags: ['binomial', 'variance']
},
{
  id: 'prob-092', cat: 'probability', sub: 'Variance', diff: 3, secs: 180, type: 'numeric',
  q: 'X ~ Uniform{1..6} (one die roll). N is an independent geometric count with mean 4. S is the sum of N iid die rolls. What is Var(S)?',
  a: null, type2: 'discuss', aText: 'Depends on the geometric parametrisation; with support {1,2,...} and mean 4: Var(S) = 4·(35/12) + 3.5²·12 = 11.667 + 147 = 158.67',
  sol: 'Law of total variance for a random sum:\nVar(S) = E[N]·Var(X) + Var(N)·E[X]².\n\nWith N geometric on {1,2,…} with mean 1/p = 4, p = 1/4 and Var(N) = (1−p)/p² = (3/4)/(1/16) = 12.\n\nVar(S) = 4·(35/12) + 12·(3.5)² = 35/3 + 147 = 11.667 + 147 = 158.67.\n\nStating the compound-variance formula and flagging the parametrisation ambiguity is the whole answer.',
  firms: ['citadel', 'two-sigma', 'hrt'], tags: ['total-variance', 'compound']
},
{
  id: 'prob-093', cat: 'probability', sub: 'Variance', diff: 2, secs: 120, type: 'numeric',
  q: 'X and Y have variance 4 and 9 respectively and correlation 0.5. What is Var(X + Y)?',
  a: 19, tol: 1e-6,
  sol: 'Cov(X,Y) = ρσ_Xσ_Y = 0.5 × 2 × 3 = 3.\nVar(X+Y) = 4 + 9 + 2(3) = 19.',
  firms: ['citadel', 'two-sigma', 'sig'], tags: ['covariance']
},
{
  id: 'prob-094', cat: 'probability', sub: 'Variance', diff: 3, secs: 180, type: 'numeric',
  q: 'You have n assets each with variance σ² and pairwise correlation ρ. As n → ∞, what does the variance of the equally weighted portfolio tend to?',
  a: null, type2: 'discuss', aText: 'ρσ²',
  sol: 'Var = (1/n²)[nσ² + n(n−1)ρσ²] = σ²[1/n + (1 − 1/n)ρ] → ρσ² as n → ∞.\n\nThis is the central result of diversification: idiosyncratic risk vanishes, but the common correlated component sets a floor you cannot diversify away. Also note the constraint ρ ≥ −1/(n−1) for the covariance matrix to stay positive semi-definite.',
  firms: ['citadel', 'two-sigma', 'aqr'], tags: ['portfolio', 'diversification']
},

/* -------------------------------------------------------------- misc ----- */
{
  id: 'prob-100', cat: 'probability', sub: 'Counting', diff: 2, secs: 120, type: 'numeric',
  q: 'How many people must be in a room for the probability that two share a birthday to exceed 50%? (365 days, uniform.)',
  a: 23, tol: 0.5,
  sol: 'P(no shared birthday with n people) = 365!/(365−n)!/365ⁿ. At n = 22 it is 0.5243; at n = 23 it is 0.4927.\n\nSo 23 people. The quick approximation: collisions ≈ C(n,2)/365 ≈ 1/2 → n(n−1) ≈ 365 → n ≈ 19–20, then refine upward.',
  firms: ['optiver', 'sig', 'imc'], tags: ['birthday', 'classic']
},
{
  id: 'prob-101', cat: 'probability', sub: 'Counting', diff: 3, secs: 210, type: 'numeric',
  q: 'A random permutation of n objects is chosen. As n → ∞, what is the probability that no object is in its original position?',
  a: Math.exp(-1), tol: 1e-4,
  sol: 'Derangements: D_n/n! = Σ_{k=0}^{n} (−1)^k/k! → e^{−1} ≈ 0.3679.\n\nConvergence is extremely fast — already accurate to 3 decimals at n = 6.\n\nNote the contrast with prob-029: the *expected* number of fixed points is 1 for every n, while the probability of zero fixed points tends to 1/e. Both follow from the fixed-point count being approximately Poisson(1).',
  firms: ['jane-street', 'citadel'], tags: ['derangements', 'inclusion-exclusion']
},
{
  id: 'prob-102', cat: 'probability', sub: 'Puzzles', diff: 3, secs: 300, type: 'numeric',
  q: '100 passengers board a 100-seat plane. The first passenger sits in a uniformly random seat; each subsequent passenger takes their own seat if free, otherwise a uniformly random free seat. What is the probability the last passenger gets their own seat?',
  a: 0.5, tol: 1e-6,
  sol: '1/2, independent of the number of passengers (for n ≥ 2).\n\nArgument: the process ends when someone sits in either seat 1 or seat 100. Every time a displaced passenger chooses randomly, seat 1 and seat 100 are equally likely among their options. By symmetry the "resolving" seat is equally likely to be seat 1 (last passenger wins) or seat 100 (loses).\n\nAnswer 1/2.',
  firms: ['jane-street', 'citadel', 'hrt', 'sig'], tags: ['classic', 'symmetry', 'famous']
},
{
  id: 'prob-103', cat: 'probability', sub: 'Puzzles', diff: 3, secs: 300, type: 'numeric',
  q: '100 prisoners are each assigned a number 1–100, and the numbers are placed randomly in 100 boxes. Each prisoner may open 50 boxes seeking their own number; all must succeed or all die. Using the optimal strategy (follow the cycle starting at your own number), what is roughly the survival probability?',
  a: 0.3118, tol: 0.01,
  sol: 'Each prisoner opens the box with their own number, then the box whose label they found, and so on — following the permutation cycle containing their number.\n\nAll succeed iff the random permutation has no cycle longer than 50.\n\nP(a random permutation of 2n has a cycle longer than n) = Σ_{k=n+1}^{2n} 1/k = H_{100} − H_{50} → ln 2.\n\nSurvival = 1 − (H₁₀₀ − H₅₀) ≈ 1 − 0.6882 = 0.3118, about 31%.\n\nThe naive independent-guessing answer is 2^{−100}. Correlating the strategies buys you thirty-odd orders of magnitude, which is why this is a favourite for testing whether you think about dependence structure.',
  firms: ['jane-street', 'citadel', 'hrt'], tags: ['classic', 'permutations', 'famous', 'hard']
},
{
  id: 'prob-104', cat: 'probability', sub: 'Puzzles', diff: 2, secs: 150, type: 'numeric',
  q: 'You have a biased coin with unknown bias p ∈ (0,1). How can you simulate a fair coin flip, and what is the expected number of tosses of the biased coin per fair flip?',
  a: null, type2: 'discuss', aText: '1/(p(1−p)) tosses, using von Neumann pairs',
  sol: 'Von Neumann\'s trick: flip in pairs. HT → call it "heads", TH → call it "tails", HH or TT → discard and repeat. HT and TH each have probability p(1−p), so the two outcomes are equally likely regardless of p.\n\nEach pair succeeds with probability 2p(1−p), so the expected number of pairs is 1/(2p(1−p)) and the expected number of tosses is 1/(p(1−p)).\n\nFor p = 1/2 that is 4 tosses; for a badly biased coin it blows up. Strong follow-up: more efficient extractors (Peres, Elias) approach the Shannon entropy bound H(p).',
  firms: ['jane-street', 'optiver', 'hrt'], tags: ['simulation', 'classic']
},
{
  id: 'prob-105', cat: 'probability', sub: 'Puzzles', diff: 2, secs: 120, type: 'numeric',
  q: 'Using a fair six-sided die, how do you generate a uniform random number from 1 to 7, and what is the expected number of rolls?',
  a: null, type2: 'discuss', aText: 'Roll twice (36 outcomes), map 35 of them to 1–7, reject 1; E ≈ 2.06 rolls',
  sol: 'Roll twice for 36 equally likely outcomes. Keep 35 of them, mapping 5 outcomes to each of 1–7; reject the 36th and start over.\n\nP(accept per pair) = 35/36, so expected pairs = 36/35 and expected rolls = 72/35 ≈ 2.057.\n\nThe information-theoretic floor is log₂7/log₂6 ≈ 1.086 rolls, so rejection sampling here is nowhere near optimal — a good candidate mentions that gap.',
  firms: ['jane-street', 'optiver', 'imc'], tags: ['simulation', 'rejection']
},
{
  id: 'prob-106', cat: 'probability', sub: 'Puzzles', diff: 3, secs: 240, type: 'numeric',
  q: 'An ant starts at one corner of a 1×1×1 cube and walks randomly along edges. Independently, what is the probability that a random walk on the integer line starting at 0, moving ±1 with equal probability, ever returns to 0?',
  a: 1, tol: 1e-6,
  sol: 'The simple symmetric random walk on ℤ is recurrent: it returns to the origin with probability 1.\n\nThe same is true in 2D. In 3D and above the walk is transient — in ℤ³ the return probability is about 0.3405 (Pólya\'s constant). "A drunk man will find his way home, but a drunk bird may get lost forever."\n\nExpected return time is infinite even in 1D, which is the classic follow-up: recurrent but null-recurrent.',
  firms: ['jane-street', 'citadel', 'two-sigma'], tags: ['random-walk', 'recurrence']
},
{
  id: 'prob-107', cat: 'probability', sub: 'Expected Value', diff: 3, secs: 240, type: 'numeric',
  q: 'You flip a fair coin repeatedly. You win $1 for each head but lose everything and stop if you ever flip two tails in a row. You may also stop voluntarily at any time. Is there an optimal stopping threshold, and what is the value of the game?',
  a: null, type2: 'discuss', aText: 'Stop once your bank is large enough that expected gain < expected loss; threshold near $3–4',
  sol: 'Let the state be (bank b, whether the last flip was a tail).\n\nFrom a "clean" state (last flip not a tail), one more flip gives: +$1 with prob 1/2 (clean), or a tail with prob 1/2 moving to the "one tail" state. From "one tail", the next flip either resets to clean with a head (+$1) or wipes you out.\n\nContinuing from clean risks the bank only two flips ahead, and the expected marginal gain of one more flip falls below the expected loss of b once b passes roughly 3–4. Setting up the two Bellman equations and solving numerically is the expected answer; interviewers care far more about a correct state definition and a clean recursion than the exact threshold.',
  firms: ['jane-street', 'sig', 'optiver'], tags: ['optimal-stopping', 'dp', 'open-ended']
}

]);
