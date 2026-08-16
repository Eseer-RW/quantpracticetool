/* Programming, algorithms, and pure-maths questions.
 * Coding questions here are stated the way OAs state them (HackerRank/CodeSignal
 * style) with a reference approach and complexity, since the tool grades the
 * approach rather than executing code.
 */
window.QP = window.QP || {};
QP.BANK = (QP.BANK || []).concat([

/* ---------------------------------------------------------- algorithms -- */
{
  id: 'prog-001', cat: 'programming', sub: 'Algorithms', diff: 2, secs: 300, type: 'code',
  q: 'Given an array of n integers, find the contiguous subarray with the largest sum. What is the optimal time complexity and the algorithm?',
  a: null, type2: 'discuss', aText: 'Kadane\'s algorithm, O(n) time, O(1) space',
  sol: 'Kadane\'s algorithm. Track the best sum ending at the current index:\n\n```python\ndef max_subarray(a):\n    best = cur = a[0]\n    for x in a[1:]:\n        cur = max(x, cur + x)\n        best = max(best, cur)\n    return best\n```\n\nO(n) time, O(1) space.\n\nThe insight is that the best subarray ending at i either extends the best ending at i−1 or restarts at i. Follow-ups you should expect: return the indices as well; handle all-negative arrays (the code above does — returning the least-negative element); and the 2D version, which is O(n³) by fixing row pairs and running Kadane on column sums.',
  firms: ['citadel', 'hrt', 'jane-street', 'optiver', 'two-sigma'], tags: ['dp', 'arrays', 'classic']
},
{
  id: 'prog-002', cat: 'programming', sub: 'Algorithms', diff: 2, secs: 300, type: 'code',
  q: 'You are given a stream of numbers and must report the running median after each element. What data structure gives the best complexity?',
  a: null, type2: 'discuss', aText: 'Two heaps (max-heap for lower half, min-heap for upper half), O(log n) per insert',
  sol: 'Maintain two heaps: a max-heap of the smaller half and a min-heap of the larger half, kept balanced to within one element.\n\nInsert into the appropriate heap, then rebalance by moving a root across if the sizes differ by more than 1. The median is the root of the larger heap, or the average of the two roots when sizes are equal.\n\nO(log n) per insertion, O(1) per query.\n\nThis is a genuinely common quant OA problem because streaming statistics matter in production. Related follow-ups: a sliding-window median (needs an order-statistic tree or an indexed skip list, or two heaps with lazy deletion), and approximate quantiles at scale (t-digest, GK sketch).',
  firms: ['citadel', 'hrt', 'two-sigma', 'jane-street'], tags: ['heaps', 'streaming', 'classic']
},
{
  id: 'prog-003', cat: 'programming', sub: 'Algorithms', diff: 3, secs: 420, type: 'code',
  q: 'Given an array of stock prices by day, find the maximum profit from at most 2 buy/sell transactions (must sell before buying again).',
  a: null, type2: 'discuss', aText: 'DP over 4 states, O(n) time O(1) space',
  sol: 'Track four running values as you scan once:\n\n```python\ndef max_profit_two(prices):\n    b1 = b2 = float("-inf")\n    s1 = s2 = 0\n    for p in prices:\n        b1 = max(b1, -p)        # after 1st buy\n        s1 = max(s1, b1 + p)    # after 1st sell\n        b2 = max(b2, s1 - p)    # after 2nd buy\n        s2 = max(s2, b2 + p)    # after 2nd sell\n    return s2\n```\n\nO(n) time, O(1) space.\n\nGeneralises to at most k transactions with an O(nk) DP, and for k ≥ n/2 it collapses to the unlimited-transaction greedy (sum all positive consecutive differences).',
  firms: ['citadel', 'hrt', 'optiver', 'two-sigma'], tags: ['dp', 'classic']
},
{
  id: 'prog-004', cat: 'programming', sub: 'Algorithms', diff: 3, secs: 420, type: 'code',
  q: 'Implement a limit order book supporting add, cancel and market-order execution. What data structures give the best complexity for each operation?',
  a: null, type2: 'discuss', aText: 'Price→level map (sorted structure) + doubly linked list of orders per level + hash map order_id→node',
  sol: 'Three structures working together:\n\n1. Per side, a sorted map from price to a price level (a balanced BST, skip list, or — for a bounded tick range — a plain array indexed by tick). Array indexing gives O(1) level access and is what production books actually use.\n2. Each price level holds a doubly linked list (FIFO queue) of resting orders, preserving time priority.\n3. A hash map from order_id to the list node, so cancels are O(1).\n\nComplexities: add O(1) amortised (O(log n) with a BST), cancel O(1), best-bid/ask O(1) if you cache the top of book, market order O(k) in the number of levels consumed.\n\nThe follow-up that separates candidates: how do you maintain the best bid/ask cheaply after a cancel empties the top level? Answer: keep a bitmask or a pointer that scans lazily, since prices move by one tick almost always.',
  firms: ['optiver', 'imc', 'hrt', 'jane-street', 'citadel'], tags: ['order-book', 'systems', 'domain', 'important']
},
{
  id: 'prog-005', cat: 'programming', sub: 'Algorithms', diff: 2, secs: 240, type: 'code',
  q: 'Given an unsorted array of n distinct integers from 1 to n+1 with exactly one missing, find the missing number in O(n) time and O(1) space.',
  a: null, type2: 'discuss', aText: 'Sum formula: (n+1)(n+2)/2 − sum(array), or XOR',
  sol: 'Two clean approaches.\n\nSum: the expected total is (n+1)(n+2)/2; subtract the observed sum. O(n) time, O(1) space. Risk: overflow for large n in fixed-width types.\n\nXOR: XOR all array elements together with all of 1..n+1. Everything present cancels, leaving the missing value. No overflow risk, which makes it the better answer in C++.\n\nGood follow-up: two numbers missing. Then use the sum and the sum of squares (two equations, two unknowns), or partition by a differing XOR bit.',
  firms: ['optiver', 'imc', 'citadel', 'akuna'], tags: ['arrays', 'xor', 'classic']
},
{
  id: 'prog-006', cat: 'programming', sub: 'Algorithms', diff: 3, secs: 360, type: 'code',
  q: 'You need the k largest elements from a stream of n numbers where n is far too large to store. What is the best approach and its complexity?',
  a: null, type2: 'discuss', aText: 'Min-heap of size k: O(n log k) time, O(k) space',
  sol: 'Maintain a min-heap of size k. For each incoming element, if it exceeds the heap root, pop and push.\n\nO(n log k) time, O(k) space — and crucially only one pass, so it works on a stream.\n\nAlternatives worth naming: quickselect gives O(n) average for the static case but needs all data in memory; for k close to n, sorting at O(n log n) is simpler and often faster in practice due to cache behaviour.\n\nIf the interviewer pushes on distributed data: each shard keeps its own top-k, then merge the shard results — top-k is decomposable in a way that median is not.',
  firms: ['citadel', 'hrt', 'two-sigma', 'jane-street'], tags: ['heaps', 'streaming']
},
{
  id: 'prog-007', cat: 'programming', sub: 'Complexity', diff: 2, secs: 120, type: 'mcq',
  q: 'What is the average-case time complexity of quicksort, and what is its worst case?',
  choices: ['O(n log n) average, O(n log n) worst', 'O(n log n) average, O(n²) worst', 'O(n²) average, O(n²) worst', 'O(n) average, O(n log n) worst'],
  a: 1,
  sol: 'O(n log n) average, O(n²) worst.\n\nThe worst case occurs when the pivot is consistently extreme — e.g. always picking the first element on already-sorted input. Randomised pivot selection or median-of-three makes the worst case vanishingly unlikely; introsort (used by std::sort) switches to heapsort once recursion gets too deep, guaranteeing O(n log n).\n\nQuicksort remains the practical default despite the worse bound because its constants and cache locality beat mergesort, and it sorts in place.',
  firms: ['optiver', 'imc', 'citadel', 'akuna'], tags: ['complexity', 'sorting']
},
{
  id: 'prog-008', cat: 'programming', sub: 'Complexity', diff: 2, secs: 120, type: 'mcq',
  q: 'You need to check membership in a set of 10 million strings with the fastest possible lookup and can tolerate a small false-positive rate. Which structure?',
  choices: ['Sorted array with binary search', 'Bloom filter', 'Balanced BST', 'Linked list'],
  a: 1,
  sol: 'A Bloom filter — O(k) lookup with k hash functions, and dramatically less memory than storing the strings themselves.\n\nA Bloom filter can produce false positives but never false negatives. With ~10 bits per element you get roughly a 1% false-positive rate, so 10M strings fit in about 12 MB versus hundreds of MB for a hash set.\n\nStandard use in trading systems: a fast pre-filter in front of an expensive exact lookup, so the expensive path runs only on candidate hits. Variants worth naming: counting Bloom filters (support deletion), cuckoo filters (better locality and deletion).',
  firms: ['citadel', 'hrt', 'two-sigma', 'jane-street'], tags: ['data-structures', 'systems']
},
{
  id: 'prog-009', cat: 'programming', sub: 'Numerical', diff: 3, secs: 300, type: 'code',
  q: 'How would you compute the implied volatility of an option given its market price? Name the method and the pitfalls.',
  a: null, type2: 'discuss', aText: 'Newton-Raphson using vega, with bisection fallback',
  sol: 'Black-Scholes price is strictly increasing in σ (vega > 0), so implied vol is uniquely defined and root-finding always converges in principle.\n\nNewton-Raphson: σ_{n+1} = σ_n − (BS(σ_n) − P_market)/vega(σ_n). Converges quadratically, typically in 3–5 iterations from a sensible start such as the Brenner-Subrahmanyam estimate σ₀ ≈ √(2π/T)·P/S.\n\nPitfalls to raise, because they are the actual point of the question:\n• Vega → 0 for deep ITM/OTM options, so Newton diverges. Fall back to bisection or Brent, which are slower but robust.\n• The market price may violate no-arbitrage bounds (below intrinsic), in which case no implied vol exists — you must detect and reject rather than iterate forever.\n• Always cap iterations and bracket σ ∈ (0, 5].\n\nProduction desks use Jäckel\'s "Let\'s Be Rational" for a near-exact non-iterative inversion.',
  firms: ['optiver', 'imc', 'citadel', 'akuna'], tags: ['numerical', 'options', 'domain', 'important']
},
{
  id: 'prog-010', cat: 'programming', sub: 'Numerical', diff: 3, secs: 300, type: 'code',
  q: 'You need to simulate 10 million paths of geometric Brownian motion to price an exotic option. What techniques reduce the variance of your estimate?',
  a: null, type2: 'discuss', aText: 'Antithetic variates, control variates, importance sampling, quasi-random (Sobol) sequences',
  sol: 'Monte Carlo error falls as 1/√N, so brute force is expensive — variance reduction is where the wins are.\n\n• Antithetic variates: for each path using Z, also run −Z. Halves variance cheaply when the payoff is monotone in Z.\n• Control variates: price a related instrument with a known closed form (e.g. a vanilla, or a geometric-average Asian) and correct your estimate by its known error. Often the biggest single win — variance reductions of 10–100×.\n• Importance sampling: shift the drift so more paths land in the region that matters. Essential for deep OTM options where almost every path pays zero.\n• Quasi-Monte Carlo with Sobol sequences: convergence approaching O(1/N) rather than O(1/√N) in low effective dimension. Use Brownian bridge construction to concentrate importance in the first dimensions.\n• Stratified sampling on the terminal value.\n\nAlso worth mentioning: use the exact GBM solution S_T = S₀exp((r−σ²/2)T + σ√T·Z) rather than Euler-discretising, since it removes discretisation bias entirely for path-independent payoffs.',
  firms: ['citadel', 'two-sigma', 'hrt', 'optiver'], tags: ['monte-carlo', 'variance-reduction', 'domain']
},
{
  id: 'prog-011', cat: 'programming', sub: 'Systems', diff: 3, secs: 240, type: 'mcq',
  q: 'In a low-latency C++ trading system, which of these typically has the largest impact on tail latency?',
  choices: ['Choice of sorting algorithm', 'Dynamic memory allocation and cache misses', 'Number of source files', 'Using const correctness'],
  a: 1,
  sol: 'Dynamic allocation and cache misses.\n\nA malloc on the hot path can cost microseconds and is unpredictable; an L3 miss to main memory costs ~100ns versus ~1ns for L1. In a system where the whole tick-to-trade budget may be a few microseconds, these dominate.\n\nStandard mitigations: pre-allocate everything at startup, use object pools and arena allocators, keep data in contiguous arrays (structure-of-arrays over array-of-structures) for prefetching, avoid virtual dispatch on the hot path, pin threads to cores, disable hyper-threading, use huge pages, and busy-poll rather than sleep to avoid context switches.\n\nThe deeper point for an interview: in latency-sensitive systems you optimise the 99.9th percentile, not the mean — and the tail is almost always driven by memory behaviour and OS scheduling, not by algorithmic complexity.',
  firms: ['optiver', 'imc', 'hrt', 'jane-street', 'citadel'], tags: ['low-latency', 'systems', 'cpp']
},
{
  id: 'prog-012', cat: 'programming', sub: 'Python', diff: 2, secs: 180, type: 'code',
  q: 'Given a pandas DataFrame of daily returns for 500 stocks, compute a 60-day rolling z-score of each stock\'s return, cross-sectionally demeaned each day. Outline the operations.',
  a: null, type2: 'discuss', aText: 'Cross-sectional demean via .sub(df.mean(axis=1), axis=0), then rolling mean/std over 60 days',
  sol: '```python\n# 1. Cross-sectional demean each day (remove market)\nresid = df.sub(df.mean(axis=1), axis=0)\n\n# 2. Rolling z-score per stock over 60 days\nroll = resid.rolling(60, min_periods=40)\nz = (resid - roll.mean()) / roll.std()\n\n# 3. Guard against degenerate std\nz = z.replace([np.inf, -np.inf], np.nan).clip(-4, 4)\n```\n\nThings the interviewer is checking: that you demean cross-sectionally along axis=1 but roll along the time axis; that you set min_periods so early rows are NaN rather than computed off 2 observations; that you use only past data (pandas `.rolling` is backward-looking by default, but `.shift(1)` the signal before using it to predict the next return, or you have look-ahead); and that you clip outliers, since a near-zero rolling std produces explosive z-scores.',
  firms: ['citadel', 'two-sigma', 'aqr', 'xtx'], tags: ['pandas', 'research', 'important']
},

/* ------------------------------------------------------------- maths ---- */
{
  id: 'math-001', cat: 'math', sub: 'Combinatorics', diff: 2, secs: 120, type: 'numeric',
  q: 'How many distinct ways can you arrange the letters of the word "BANANA"?',
  a: 60, tol: 1e-6,
  sol: '6 letters with repeats: 3 A\'s, 2 N\'s, 1 B.\n\n6!/(3!·2!·1!) = 720/12 = 60.',
  firms: ['optiver', 'imc', 'sig'], tags: ['permutations']
},
{
  id: 'math-002', cat: 'math', sub: 'Combinatorics', diff: 2, secs: 150, type: 'numeric',
  q: 'How many paths are there from the bottom-left to the top-right corner of a 5×5 grid, moving only right or up?',
  a: 252, tol: 1e-6,
  sol: 'You need 5 rights and 5 ups in some order: C(10,5) = 252.\n\nThe classic follow-up is to forbid crossing the diagonal, which gives the Catalan number C₅ = 42.',
  firms: ['optiver', 'jane-street', 'citadel'], tags: ['lattice-paths', 'binomial']
},
{
  id: 'math-003', cat: 'math', sub: 'Combinatorics', diff: 3, secs: 180, type: 'numeric',
  q: 'In how many ways can 10 identical balls be placed into 4 distinct boxes?',
  a: 286, tol: 1e-6,
  sol: 'Stars and bars: C(n + k − 1, k − 1) = C(13, 3) = 286.\n\nIf each box must be non-empty instead, it becomes C(n − 1, k − 1) = C(9,3) = 84.',
  firms: ['optiver', 'jane-street', 'citadel'], tags: ['stars-and-bars']
},
{
  id: 'math-004', cat: 'math', sub: 'Linear Algebra', diff: 2, secs: 150, type: 'numeric',
  q: 'A 2×2 matrix has trace 5 and determinant 6. What are its eigenvalues?',
  a: null, type2: 'discuss', aText: '2 and 3',
  sol: 'Eigenvalues satisfy λ² − (trace)λ + det = 0, i.e. λ² − 5λ + 6 = 0 → λ = 2, 3.\n\nWorth having reflexively: trace = sum of eigenvalues, determinant = product, for any square matrix.',
  firms: ['citadel', 'two-sigma', 'hrt'], tags: ['eigenvalues']
},
{
  id: 'math-005', cat: 'math', sub: 'Linear Algebra', diff: 3, secs: 180, type: 'numeric',
  q: 'What conditions must a matrix satisfy to be a valid covariance matrix?',
  a: null, type2: 'discuss', aText: 'Symmetric and positive semi-definite (all eigenvalues ≥ 0)',
  sol: 'Symmetric, and positive semi-definite: xᵀΣx ≥ 0 for all x, equivalently all eigenvalues ≥ 0.\n\nThe PSD requirement is not a technicality — xᵀΣx is the variance of the portfolio with weights x, and a negative value would mean a portfolio with negative variance.\n\nThis bites constantly in practice: a sample covariance matrix estimated from T observations on N assets has rank at most T, so it is singular whenever N > T and cannot be inverted for mean-variance optimisation. Fixes to name: Ledoit-Wolf shrinkage toward a structured target, factor models, eigenvalue clipping via random matrix theory (Marchenko-Pastur), or simply requiring T >> N.',
  firms: ['citadel', 'two-sigma', 'aqr', 'xtx'], tags: ['covariance', 'psd', 'important']
},
{
  id: 'math-006', cat: 'math', sub: 'Linear Algebra', diff: 3, secs: 210, type: 'numeric',
  q: 'What does Principal Component Analysis compute, and what does the first principal component of a matrix of equity returns typically represent?',
  a: null, type2: 'discuss', aText: 'Eigenvectors of the covariance matrix; PC1 is the market factor',
  sol: 'PCA finds the eigenvectors of the covariance matrix, ordered by eigenvalue — the orthogonal directions of maximum variance. Equivalently the SVD of the centred data matrix.\n\nFor equity returns the first PC is almost always the market factor: all loadings have the same sign and it typically explains 30–50% of total variance (much more in a crisis, when correlations spike toward 1). Subsequent PCs often correspond to recognisable sector or style factors.\n\nCaveats to raise: PCs are only identified up to sign; they are not scale-invariant, so you normally standardise returns first; and in high dimensions with limited history, the small eigenvalues are pure estimation noise — random matrix theory tells you which eigenvalues are distinguishable from noise, and clipping the rest materially improves out-of-sample portfolio performance.',
  firms: ['citadel', 'two-sigma', 'aqr', 'xtx'], tags: ['pca', 'factors', 'important']
},
{
  id: 'math-007', cat: 'math', sub: 'Calculus', diff: 2, secs: 120, type: 'numeric',
  q: 'What is the integral from 0 to infinity of e^(−x²) dx?',
  a: Math.sqrt(Math.PI) / 2, tol: 1e-4,
  sol: '√π/2 ≈ 0.8862.\n\nThe full Gaussian integral ∫_{−∞}^{∞} e^{−x²}dx = √π. The standard derivation squares it and switches to polar coordinates.\n\nThis is why the normal density carries its 1/√(2π) normalisation.',
  firms: ['citadel', 'jane-street', 'hrt'], tags: ['gaussian-integral']
},
{
  id: 'math-008', cat: 'math', sub: 'Calculus', diff: 3, secs: 180, type: 'numeric',
  q: 'What is the value of the infinite power tower x^(x^(x^...)) when x = √2?',
  a: 2, tol: 1e-6,
  sol: 'Let y = x^y. With x = √2: y = (√2)^y = 2^{y/2}.\n\ny = 2 works: 2^{1} = 2 ✓. y = 4 also satisfies it: 2² = 4 ✓.\n\nThe tower converges to the *smaller* root, 2. Convergence requires e^{−e} ≤ x ≤ e^{1/e} ≈ 1.4447, and √2 ≈ 1.4142 is inside that range.\n\nIterating from below: √2 ≈ 1.414, then 1.632, 1.761, 1.840, … → 2.',
  firms: ['jane-street', 'citadel'], tags: ['sequences', 'fixed-point']
},
{
  id: 'math-009', cat: 'math', sub: 'Calculus', diff: 2, secs: 120, type: 'numeric',
  q: 'What is the sum of the infinite series 1 + 1/2 + 1/4 + 1/8 + ... ?',
  a: 2, tol: 1e-9,
  sol: 'Geometric with a = 1, r = 1/2: sum = a/(1−r) = 2.\n\nThe companion facts worth knowing cold: Σ n·r^{n} = r/(1−r)² and Σ 1/n² = π²/6, while Σ 1/n diverges.',
  firms: ['optiver', 'imc', 'akuna'], tags: ['series', 'geometric']
},
{
  id: 'math-010', cat: 'math', sub: 'Stochastic Calculus', diff: 3, secs: 210, type: 'numeric',
  q: 'For standard Brownian motion W_t, what is E[W_t²] and what is d(W_t²) by Itô\'s lemma?',
  a: null, type2: 'discuss', aText: 'E[W_t²] = t; d(W_t²) = 2W_t dW_t + dt',
  sol: 'E[W_t²] = t, since W_t ~ N(0, t).\n\nItô\'s lemma for f(W) = W²: df = f\'dW + ½f\'\'(dW)² = 2W dW + ½(2)dt = 2W_t dW_t + dt.\n\nThe dt term is the entire content of Itô calculus — it comes from (dW)² = dt, which is what makes stochastic calculus differ from ordinary calculus. Taking expectations of the integral form kills the martingale term and leaves E[W_t²] = t, consistent with the direct answer.\n\nCorollary worth knowing: W_t² − t is a martingale, which is the tool used for the expected-duration gambler\'s-ruin result.',
  firms: ['citadel', 'jane-street', 'two-sigma', 'hrt'], tags: ['ito', 'brownian-motion', 'important']
},
{
  id: 'math-011', cat: 'math', sub: 'Stochastic Calculus', diff: 3, secs: 240, type: 'numeric',
  q: 'Under geometric Brownian motion dS = μS dt + σS dW, what is E[S_T] and what is the distribution of ln(S_T)?',
  a: null, type2: 'discuss', aText: 'E[S_T] = S₀e^{μT}; ln(S_T) ~ N(ln S₀ + (μ − σ²/2)T, σ²T)',
  sol: 'Applying Itô to ln S gives d(ln S) = (μ − σ²/2)dt + σ dW, so\n\nln(S_T) ~ N(ln S₀ + (μ − σ²/2)T, σ²T)\n\nand S_T = S₀·exp((μ − σ²/2)T + σ√T·Z).\n\nE[S_T] = S₀e^{μT}, but the *median* is S₀e^{(μ−σ²/2)T}, which is strictly lower.\n\nThe −σ²/2 term is the single most-tested idea here: volatility drag. A geometric random walk with zero expected arithmetic return has a negative expected log return, so the typical path loses money while the mean is flat. This is why a fund that makes +50% then −50% ends down 25%, and why compound growth rate ≈ μ − σ²/2 rather than μ.',
  firms: ['citadel', 'optiver', 'jane-street', 'two-sigma'], tags: ['gbm', 'volatility-drag', 'important']
}

]);
