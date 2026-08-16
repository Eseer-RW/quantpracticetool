/* Discrete mathematics: counting, combinatorics, number theory, graphs and
 * recursion. This is a distinct interview category from probability — the
 * questions are deterministic, and firms use them to check whether you can set
 * up a count correctly rather than whether you know a distribution.
 */
window.QP = window.QP || {};
QP.BANK = (QP.BANK || []).concat([

/* ---------------------------------------------------------- counting ---- */
{
  id: 'dm-001', cat: 'math', sub: 'Discrete Math', diff: 1, secs: 45, type: 'numeric',
  q: 'Ten people are in a room and everyone shakes hands with everyone else exactly once. How many handshakes take place?',
  a: 45, tol: 1e-6,
  sol: 'C(10,2) = 10·9/2 = 45.\n\nThe general handshake count for n people is n(n−1)/2 — the same quantity as the number of edges in a complete graph K_n, and the same as the number of pairs you compare in a naive O(n²) algorithm.',
  firms: ['optiver', 'imc', 'sig'], tags: ['combinatorics']
},
{
  id: 'dm-002', cat: 'math', sub: 'Discrete Math', diff: 1, secs: 45, type: 'numeric',
  q: 'How many subsets does a set of 10 distinct elements have, including the empty set and the set itself?',
  a: 1024, tol: 1e-6,
  sol: '2^10 = 1024. Each element is independently in or out.\n\nWorth pairing with the identity Σ_k C(n,k) = 2^n — the row sums of Pascal\'s triangle.',
  firms: ['optiver', 'imc'], tags: ['combinatorics']
},
{
  id: 'dm-003', cat: 'math', sub: 'Discrete Math', diff: 2, secs: 90, type: 'numeric',
  q: 'In how many distinct ways can 6 people be seated around a circular table, if seatings that differ only by rotation are considered identical?',
  a: 120, tol: 1e-6,
  sol: '(n−1)! = 5! = 120.\n\nFix one person to kill the rotational symmetry, then arrange the remaining 5 freely. If reflections are also considered identical (e.g. a necklace rather than a table), divide by 2 again to get 60.',
  firms: ['optiver', 'jane-street', 'imc'], tags: ['combinatorics', 'symmetry']
},
{
  id: 'dm-004', cat: 'math', sub: 'Discrete Math', diff: 2, secs: 90, type: 'numeric',
  q: 'How many diagonals does a convex 12-sided polygon have?',
  a: 54, tol: 1e-6,
  sol: 'Every pair of vertices defines a segment: C(12,2) = 66. Of those, 12 are sides, leaving 54 diagonals.\n\nGeneral formula n(n−3)/2 = 12·9/2 = 54.',
  firms: ['imc', 'optiver'], tags: ['combinatorics', 'geometry']
},
{
  id: 'dm-005', cat: 'math', sub: 'Discrete Math', diff: 2, secs: 120, type: 'numeric',
  q: 'How many distinct arrangements are there of the letters in "MISSISSIPPI"?',
  a: 34650, tol: 1e-6,
  sol: '11 letters with repeats: M×1, I×4, S×4, P×2.\n\n11!/(4!·4!·2!·1!) = 39,916,800/1,152 = 34,650.',
  firms: ['optiver', 'imc', 'sig'], tags: ['permutations']
},
{
  id: 'dm-006', cat: 'math', sub: 'Discrete Math', diff: 3, secs: 180, type: 'numeric',
  q: 'How many binary strings of length 8 contain no two consecutive 1s?',
  a: 55, tol: 1e-6,
  sol: 'Let a(n) be the count for length n. A valid string ends in 0 (any valid string of length n−1) or in 01 (any valid string of length n−2), so a(n) = a(n−1) + a(n−2) — the Fibonacci recurrence.\n\na(1) = 2, a(2) = 3, then 5, 8, 13, 21, 34, 55.\n\nAnswer 55. Fibonacci showing up in a counting problem with an adjacency restriction is a pattern worth recognising instantly.',
  firms: ['jane-street', 'citadel', 'hrt'], tags: ['recursion', 'fibonacci']
},
{
  id: 'dm-007', cat: 'math', sub: 'Discrete Math', diff: 2, secs: 150, type: 'numeric',
  q: 'How many integers from 1 to 100 inclusive are divisible by 2, 3 or 5?',
  a: 74, tol: 1e-6,
  sol: 'Inclusion-exclusion.\n\nSingles: ⌊100/2⌋ + ⌊100/3⌋ + ⌊100/5⌋ = 50 + 33 + 20 = 103.\nPairs: ⌊100/6⌋ + ⌊100/10⌋ + ⌊100/15⌋ = 16 + 10 + 6 = 32.\nTriple: ⌊100/30⌋ = 3.\n\n103 − 32 + 3 = 74.',
  firms: ['optiver', 'citadel', 'imc'], tags: ['inclusion-exclusion']
},
{
  id: 'dm-008', cat: 'math', sub: 'Discrete Math', diff: 3, secs: 180, type: 'numeric',
  q: 'How many ways are there to arrange 5 people so that nobody sits in their own assigned seat?',
  a: 44, tol: 1e-6,
  sol: 'Derangements of 5 objects.\n\nD_n = n!·Σ_{k=0}^{n}(−1)^k/k!. For n = 5: 120·(1 − 1 + 1/2 − 1/6 + 1/24 − 1/120) = 44.\n\nThe recurrence D_n = (n−1)(D_{n−1} + D_{n−2}) is faster in an interview: D_1 = 0, D_2 = 1, D_3 = 2, D_4 = 9, D_5 = 4(9+2) = 44.\n\nD_n/n! → 1/e, so about 37% of arrangements are derangements.',
  firms: ['jane-street', 'citadel'], tags: ['derangements', 'inclusion-exclusion']
},
{
  id: 'dm-009', cat: 'math', sub: 'Discrete Math', diff: 3, secs: 180, type: 'numeric',
  q: 'How many valid sequences of 4 pairs of balanced parentheses are there?',
  a: 14, tol: 1e-6,
  sol: 'The Catalan number C_4 = C(8,4)/5 = 70/5 = 14.\n\nC_n = C(2n,n)/(n+1): 1, 1, 2, 5, 14, 42, 132, …\n\nCatalan numbers count a startling number of things: balanced parentheses, binary trees with n nodes, lattice paths that never cross the diagonal, and triangulations of a polygon. Recognising the sequence 1, 2, 5, 14, 42 on sight is worth real points.',
  firms: ['jane-street', 'hrt', 'citadel'], tags: ['catalan', 'recursion']
},
{
  id: 'dm-010', cat: 'math', sub: 'Discrete Math', diff: 2, secs: 120, type: 'numeric',
  q: 'In how many ways can 10 identical balls be placed into 4 distinct boxes if every box must contain at least one ball?',
  a: 84, tol: 1e-6,
  sol: 'Stars and bars with a non-empty constraint: C(n−1, k−1) = C(9,3) = 84.\n\nPlace the 10 balls in a row and choose 3 of the 9 internal gaps to split them into 4 groups.\n\nWithout the non-empty constraint it would be C(n+k−1, k−1) = C(13,3) = 286.',
  firms: ['optiver', 'jane-street'], tags: ['stars-and-bars']
},
{
  id: 'dm-011', cat: 'math', sub: 'Discrete Math', diff: 3, secs: 180, type: 'numeric',
  q: 'How many functions from a set of 4 elements onto a set of 3 elements are surjective (every target element is hit)?',
  a: 36, tol: 1e-6,
  sol: 'Inclusion-exclusion over which targets are missed:\n\n3⁴ − C(3,1)·2⁴ + C(3,2)·1⁴ = 81 − 48 + 3 = 36.\n\nEquivalently 3!·S(4,3) where S(4,3) = 6 is a Stirling number of the second kind.',
  firms: ['citadel', 'jane-street', 'hrt'], tags: ['inclusion-exclusion', 'stirling']
},
{
  id: 'dm-012', cat: 'math', sub: 'Discrete Math', diff: 2, secs: 120, type: 'numeric',
  q: 'How many squares of any size are there on a standard 8×8 chessboard?',
  a: 204, tol: 1e-6,
  sol: 'A k×k square has (9−k)² possible positions.\n\nΣ_{k=1}^{8}(9−k)² = 64 + 49 + 36 + 25 + 16 + 9 + 4 + 1 = 204.\n\nThat is the sum of the first 8 squares, n(n+1)(2n+1)/6 = 8·9·17/6 = 204. The trap is answering 64.',
  firms: ['optiver', 'imc', 'sig'], tags: ['counting', 'classic']
},

/* ------------------------------------------------------ number theory --- */
{
  id: 'dm-020', cat: 'math', sub: 'Discrete Math', diff: 2, secs: 90, type: 'numeric',
  q: 'How many trailing zeros does 25! have?',
  a: 6, tol: 1e-6,
  sol: 'Count factors of 5 (2s are always more plentiful):\n\n⌊25/5⌋ + ⌊25/25⌋ = 5 + 1 = 6.',
  firms: ['optiver', 'jane-street'], tags: ['factorials', 'number-theory']
},
{
  id: 'dm-021', cat: 'math', sub: 'Discrete Math', diff: 2, secs: 90, type: 'numeric',
  q: 'What is the least common multiple of 12 and 18?',
  a: 36, tol: 1e-6,
  sol: '12 = 2²·3, 18 = 2·3². Take the max power of each prime: 2²·3² = 36.\n\nUseful identity: gcd(a,b)·lcm(a,b) = a·b. Here 6 × 36 = 216 = 12 × 18 ✓.',
  firms: ['imc', 'optiver'], tags: ['number-theory']
},
{
  id: 'dm-022', cat: 'math', sub: 'Discrete Math', diff: 2, secs: 120, type: 'numeric',
  q: 'You have socks of 3 different colours in a drawer, in the dark. What is the minimum number you must draw to guarantee a matching pair?',
  a: 4, tol: 1e-6,
  sol: 'Pigeonhole principle. Three draws could give one of each colour; the fourth must repeat one.\n\nAnswer 4, i.e. n+1 for n colours. Note the question asks for a *guarantee*, not a likely outcome — the distinction between worst-case and expected-case is exactly what is being tested.',
  firms: ['optiver', 'imc', 'sig'], tags: ['pigeonhole']
},
{
  id: 'dm-023', cat: 'math', sub: 'Discrete Math', diff: 3, secs: 150, type: 'numeric',
  q: 'What is the minimum number of moves to solve the Towers of Hanoi puzzle with 10 disks?',
  a: 1023, tol: 1e-6,
  sol: 'T(n) = 2T(n−1) + 1 with T(1) = 1, giving T(n) = 2ⁿ − 1.\n\nT(10) = 1024 − 1 = 1023.\n\nThe recurrence is the point: move n−1 disks aside, move the largest, move n−1 back.',
  firms: ['jane-street', 'hrt', 'citadel'], tags: ['recursion']
},

/* -------------------------------------------------------------- graphs -- */
{
  id: 'dm-030', cat: 'math', sub: 'Discrete Math', diff: 2, secs: 90, type: 'numeric',
  q: 'How many edges does the complete graph on 8 vertices have?',
  a: 28, tol: 1e-6,
  sol: 'C(8,2) = 28.\n\nBy the handshake lemma the degree sum is 2|E| = 56, consistent with 8 vertices each of degree 7.',
  firms: ['citadel', 'hrt'], tags: ['graphs']
},
{
  id: 'dm-031', cat: 'math', sub: 'Discrete Math', diff: 3, secs: 150, type: 'numeric',
  q: 'In any graph, can the number of vertices with odd degree be odd? Answer 1 for yes, 0 for no.',
  a: 0, tol: 1e-6,
  sol: 'No — the number of odd-degree vertices is always even.\n\nThe handshake lemma says Σ deg(v) = 2|E|, which is even. The even-degree vertices contribute an even total, so the odd-degree vertices must also sum to something even, which requires an even count of them.\n\nThis is the standard first result in graph theory and underpins the Eulerian-path condition (a graph has an Eulerian path iff it has 0 or exactly 2 odd-degree vertices).',
  firms: ['citadel', 'jane-street', 'hrt'], tags: ['graphs', 'parity', 'proof']
},
{
  id: 'dm-032', cat: 'math', sub: 'Discrete Math', diff: 3, secs: 180, type: 'numeric',
  q: 'A tree has 50 vertices. How many edges does it have?',
  a: 49, tol: 1e-6,
  sol: 'A tree on n vertices always has exactly n−1 edges: 49.\n\nProof sketch: start from a single vertex and note every added vertex brings exactly one edge to stay connected and acyclic. Equivalently, a connected graph with n−1 edges is acyclic, and an acyclic graph with n−1 edges is connected — any two of {connected, acyclic, n−1 edges} imply the third.',
  firms: ['citadel', 'hrt', 'two-sigma'], tags: ['graphs', 'trees']
}

]);
