/* Statistics, regression, time series and machine-learning questions.
 * Weighted toward Quant Researcher interviews (Citadel, Two Sigma, HRT, XTX)
 * rather than trader screens.
 */
window.QP = window.QP || {};
QP.BANK = (QP.BANK || []).concat([

/* ------------------------------------------------------------ inference -- */
{
  id: 'stat-001', cat: 'statistics', sub: 'Estimation', diff: 1, secs: 60, type: 'numeric',
  q: 'You observe 100 iid samples with sample standard deviation 20. What is the standard error of the sample mean?',
  a: 2, tol: 1e-6,
  sol: 'SE = s/√n = 20/√100 = 2.\n\nThe √n scaling is the single most-used fact in applied quant work: to halve your error bars you need four times the data.',
  firms: ['citadel', 'two-sigma', 'sig'], tags: ['standard-error']
},
{
  id: 'stat-002', cat: 'statistics', sub: 'Estimation', diff: 2, secs: 120, type: 'numeric',
  q: 'A strategy has a Sharpe ratio of 1.0. Roughly how many years of daily data do you need before the Sharpe is statistically distinguishable from zero at 2 standard errors?',
  a: 4, tol: 0.6,
  sol: 'The standard error of an estimated Sharpe ratio is approximately √(1/T) in the same annualisation units, where T is the number of years.\n\nFor a t-statistic of 2 you need SR·√T ≥ 2 → √T ≥ 2 → T ≥ 4 years.\n\nThis is a sobering and very commonly asked result: even a genuinely good Sharpe-1 strategy needs about four years to prove itself, which is why researchers lean so hard on cross-sectional breadth rather than long time series.',
  firms: ['citadel', 'two-sigma', 'aqr', 'xtx'], tags: ['sharpe', 'significance', 'important']
},
{
  id: 'stat-003', cat: 'statistics', sub: 'Estimation', diff: 2, secs: 120, type: 'numeric',
  q: 'You flip a coin 100 times and observe 60 heads. What is the approximate two-sided p-value for the null hypothesis that the coin is fair?',
  a: 0.0455, tol: 0.02,
  sol: 'Under H₀, heads ~ Binomial(100, 0.5) with mean 50 and SD 5.\n\nz = (60 − 50)/5 = 2.0 → two-sided p ≈ 0.046 (about 4.6%).\n\nMarginally significant at 5%. A good follow-up answer notes that with a continuity correction (59.5) z ≈ 1.9 and p ≈ 0.057 — right on the boundary, which is a nice prompt for a conversation about how fragile 5% thresholds are.',
  firms: ['citadel', 'sig', 'two-sigma'], tags: ['hypothesis-testing']
},
{
  id: 'stat-004', cat: 'statistics', sub: 'Estimation', diff: 3, secs: 180, type: 'numeric',
  q: 'You test 100 independent trading signals at the 5% significance level, and none of them truly works. What is the expected number of "significant" results, and what is the probability of at least one?',
  a: 5, tol: 1e-6,
  sol: 'Expected false positives = 100 × 0.05 = 5.\n\nP(at least one) = 1 − 0.95^100 ≈ 1 − 0.0059 = 0.994, essentially certain.\n\nThis is the multiple-comparisons / data-mining problem, and it is the single most important statistical idea in quant research. Remedies worth naming: Bonferroni (test at 0.05/100), Benjamini–Hochberg FDR control, out-of-sample holdout, and the deflated Sharpe ratio of Bailey & López de Prado.',
  firms: ['citadel', 'two-sigma', 'aqr', 'xtx'], tags: ['multiple-testing', 'important', 'research']
},
{
  id: 'stat-005', cat: 'statistics', sub: 'Estimation', diff: 2, secs: 150, type: 'numeric',
  q: 'An unbiased estimator has variance 4. A biased estimator has bias 1 and variance 2. Which has lower mean squared error, and what is the lower MSE?',
  a: 3, tol: 1e-6,
  sol: 'MSE = bias² + variance.\n\nUnbiased: 0 + 4 = 4.\nBiased: 1 + 2 = 3.\n\nThe biased estimator wins with MSE 3.\n\nThis is the bias–variance trade-off in its purest form and is the justification for shrinkage: ridge regression, James–Stein, and Ledoit–Wolf covariance shrinkage all accept bias to cut variance.',
  firms: ['citadel', 'two-sigma', 'hrt'], tags: ['bias-variance', 'important']
},

/* ----------------------------------------------------------- regression -- */
{
  id: 'stat-010', cat: 'statistics', sub: 'Regression', diff: 2, secs: 120, type: 'numeric',
  q: 'In a simple linear regression of Y on X, Corr(X,Y) = 0.6, SD(Y) = 10, SD(X) = 2. What is the slope coefficient?',
  a: 3, tol: 1e-6,
  sol: 'β = ρ · σ_Y/σ_X = 0.6 × 10/2 = 3.\n\nEquivalently β = Cov(X,Y)/Var(X).',
  firms: ['citadel', 'two-sigma', 'sig'], tags: ['ols']
},
{
  id: 'stat-011', cat: 'statistics', sub: 'Regression', diff: 2, secs: 90, type: 'numeric',
  q: 'In a simple linear regression with correlation 0.6 between X and Y, what fraction of the variance in Y is explained by X?',
  a: 0.36, tol: 1e-6,
  sol: 'R² = ρ² = 0.36, so 36%.\n\nWorth internalising how weak typical predictive signals are: a daily return predictor with ρ = 0.05 has R² = 0.25%, and that can still be extremely profitable. High R² in a return-prediction context is usually a bug, not a triumph.',
  firms: ['citadel', 'two-sigma', 'xtx'], tags: ['ols', 'r-squared']
},
{
  id: 'stat-012', cat: 'statistics', sub: 'Regression', diff: 3, secs: 180, type: 'numeric',
  q: 'You regress Y on X and get slope β₁. You then regress X on Y and get slope β₂. What is β₁·β₂?',
  a: null, type2: 'discuss', aText: 'ρ² (the R-squared)',
  sol: 'β₁ = ρσ_Y/σ_X and β₂ = ρσ_X/σ_Y, so β₁β₂ = ρ² = R².\n\nA neat consequence: the two regression lines are not inverses of each other unless ρ = ±1. Regressing "the other way round" gives a systematically flatter line — this is regression to the mean, and mixing up the two directions is a classic source of real research bugs.',
  firms: ['citadel', 'two-sigma', 'jane-street'], tags: ['ols', 'regression-to-mean']
},
{
  id: 'stat-013', cat: 'statistics', sub: 'Regression', diff: 3, secs: 210, type: 'numeric',
  q: 'You add an irrelevant predictor (pure noise, uncorrelated with Y in population) to an OLS regression. What happens to in-sample R² and to adjusted R²?',
  a: null, type2: 'discuss', aText: 'R² weakly increases (never decreases); adjusted R² typically decreases',
  sol: 'In-sample R² can never decrease when you add a regressor — the old model is nested inside the new one, so the optimiser can always reproduce it by setting the new coefficient to zero. In finite samples the noise variable will pick up a small non-zero coefficient and R² strictly rises.\n\nAdjusted R² = 1 − (1−R²)(n−1)/(n−k−1) penalises k, so it typically falls.\n\nThe expected in-sample R² gain from a pure-noise regressor is about 1/n. Adding p noise regressors to n data points lifts R² by roughly p/n — which is why a model with p comparable to n can fit anything and predict nothing.',
  firms: ['citadel', 'two-sigma', 'hrt', 'xtx'], tags: ['ols', 'overfitting', 'important']
},
{
  id: 'stat-014', cat: 'statistics', sub: 'Regression', diff: 3, secs: 240, type: 'numeric',
  q: 'Two predictors X₁ and X₂ are each correlated 0.5 with Y and 0.9 with each other. What problem will the OLS regression of Y on both exhibit?',
  a: null, type2: 'discuss', aText: 'Multicollinearity — unstable, high-variance coefficients',
  sol: 'Multicollinearity. The coefficient estimates have variance inflated by VIF = 1/(1−R²_{X₁~X₂}) = 1/(1−0.81) ≈ 5.3.\n\nThe fitted values and overall R² remain well determined; it is the *individual* coefficients that become unstable, often flipping sign across samples or subperiods.\n\nRemedies to name: ridge regression (shrinks toward each other), PCA / factor rotation on the predictors, dropping one, or combining them into a single averaged signal. In practice for correlated alpha signals, an equal-weight combination usually out-of-sample-beats the OLS-optimal weights.',
  firms: ['citadel', 'two-sigma', 'aqr'], tags: ['multicollinearity', 'ridge', 'research']
},
{
  id: 'stat-015', cat: 'statistics', sub: 'Regression', diff: 2, secs: 150, type: 'numeric',
  q: 'What are the Gauss–Markov assumptions under which OLS is the Best Linear Unbiased Estimator?',
  a: null, type2: 'discuss', aText: 'Linearity, exogeneity E[ε|X]=0, homoskedasticity, no autocorrelation, no perfect multicollinearity',
  sol: '1. The model is linear in parameters.\n2. Strict exogeneity: E[ε | X] = 0.\n3. Homoskedasticity: Var(ε_i) = σ² constant.\n4. No autocorrelation: Cov(ε_i, ε_j) = 0 for i ≠ j.\n5. No perfect multicollinearity (X has full rank).\n\nNormality of errors is NOT required for BLUE — it is only needed for exact t and F distributions in finite samples.\n\nIn finance, assumptions 3 and 4 fail constantly (volatility clustering, autocorrelated returns), which is why Newey–West / HAC standard errors are standard practice. Naming that application is what separates a memorised answer from a useful one.',
  firms: ['citadel', 'two-sigma', 'aqr'], tags: ['ols', 'gauss-markov', 'theory']
},

/* ---------------------------------------------------------- time series -- */
{
  id: 'stat-020', cat: 'statistics', sub: 'Time Series', diff: 2, secs: 150, type: 'numeric',
  q: 'An AR(1) process X_t = 0.9·X_{t−1} + ε_t has innovation variance 1. What is the unconditional variance of X?',
  a: 1/(1 - 0.81), tol: 1e-4,
  sol: 'Var(X) = σ²_ε/(1 − φ²) = 1/(1 − 0.81) = 1/0.19 ≈ 5.263.\n\nStationarity requires |φ| < 1; as φ → 1 the variance explodes and the process approaches a random walk.',
  firms: ['citadel', 'two-sigma', 'xtx'], tags: ['ar1', 'stationarity']
},
{
  id: 'stat-021', cat: 'statistics', sub: 'Time Series', diff: 2, secs: 120, type: 'numeric',
  q: 'For an AR(1) process with φ = 0.9, what is the half-life of a shock, in periods?',
  a: Math.log(0.5) / Math.log(0.9), tol: 0.05,
  sol: 'Half-life = ln(0.5)/ln(φ) = ln(0.5)/ln(0.9) ≈ (−0.6931)/(−0.10536) ≈ 6.58 periods.\n\nMean-reversion half-life is the standard way to describe how fast a signal decays and directly informs holding periods and rebalancing frequency.',
  firms: ['citadel', 'two-sigma', 'xtx'], tags: ['ar1', 'half-life', 'important']
},
{
  id: 'stat-022', cat: 'statistics', sub: 'Time Series', diff: 3, secs: 180, type: 'numeric',
  q: 'Daily returns have volatility 1%. Assuming iid returns and 252 trading days, what is the annualised volatility?',
  a: 0.01 * Math.sqrt(252), tol: 1e-4,
  sol: 'σ_annual = σ_daily × √252 = 1% × 15.87 ≈ 15.9%.\n\nThe useful mental shortcut: √252 ≈ 16, so 1% daily ≈ 16% annual. Traders quote this constantly — a 16% vol name moves about 1% a day.\n\nThe iid assumption matters: with positive autocorrelation the true annualised vol is higher, with mean reversion it is lower.',
  firms: ['optiver', 'citadel', 'jane-street', 'sig'], tags: ['volatility', 'annualisation', 'important']
},
{
  id: 'stat-023', cat: 'statistics', sub: 'Time Series', diff: 3, secs: 210, type: 'numeric',
  q: 'A random walk and a mean-reverting series are regressed against each other. Both are unrelated. What phenomenon causes the regression to appear highly significant?',
  a: null, type2: 'discuss', aText: 'Spurious regression (Granger–Newbold), from non-stationarity',
  sol: 'Spurious regression. Regressing one integrated (unit-root) series on another unrelated one produces high R² and large t-statistics, because the residuals are themselves non-stationary and the standard errors are badly understated.\n\nGranger and Newbold (1974) showed this by simulation; the t-stat diverges with sample size rather than converging.\n\nFixes: difference the series and regress returns on returns; or test for genuine cointegration (Engle–Granger, Johansen) if you believe there is a long-run relationship. In a research interview, always check stationarity before quoting a t-statistic.',
  firms: ['citadel', 'two-sigma', 'aqr', 'xtx'], tags: ['spurious-regression', 'stationarity', 'important']
},
{
  id: 'stat-024', cat: 'statistics', sub: 'Time Series', diff: 3, secs: 180, type: 'numeric',
  q: 'Returns exhibit volatility clustering. Which model family is designed to capture this, and what is the key equation of the simplest member?',
  a: null, type2: 'discuss', aText: 'GARCH; σ²_t = ω + α·ε²_{t−1} + β·σ²_{t−1}',
  sol: 'ARCH/GARCH. The GARCH(1,1) variance equation is:\n\nσ²_t = ω + α·ε²_{t−1} + β·σ²_{t−1}\n\nwith α + β < 1 for stationarity. In equity data α + β is typically around 0.95–0.99, meaning volatility shocks are highly persistent.\n\nLong-run variance = ω/(1 − α − β). Extensions worth naming: EGARCH and GJR-GARCH for the leverage effect (negative returns raise volatility more than positive ones), and HAR-RV models using realised volatility from intraday data, which often beat GARCH in practice.',
  firms: ['citadel', 'two-sigma', 'xtx'], tags: ['garch', 'volatility', 'research']
},

/* --------------------------------------------------- machine learning ---- */
{
  id: 'stat-030', cat: 'statistics', sub: 'Machine Learning', diff: 2, secs: 150, type: 'numeric',
  q: 'What is the difference between L1 (Lasso) and L2 (Ridge) regularisation, and when would you prefer each?',
  a: null, type2: 'discuss', aText: 'L1 gives sparse solutions (feature selection); L2 shrinks smoothly and handles correlated features better',
  sol: 'L1 penalises Σ|β| and produces exactly-zero coefficients, performing feature selection. Its constraint region has corners on the axes, which is geometrically why solutions land on them.\n\nL2 penalises Σβ² and shrinks all coefficients smoothly toward zero without zeroing them. It has a closed-form solution and handles correlated predictors gracefully by splitting weight between them.\n\nFor quant signals: L2 is usually preferable when your predictors are many correlated versions of a similar idea (you want to average them, not arbitrarily pick one). L1 is useful when you genuinely believe most candidate features are useless and want an interpretable sparse model. Elastic net combines both.',
  firms: ['citadel', 'two-sigma', 'hrt', 'xtx'], tags: ['regularisation', 'ml']
},
{
  id: 'stat-031', cat: 'statistics', sub: 'Machine Learning', diff: 3, secs: 210, type: 'numeric',
  q: 'Why is standard k-fold cross-validation inappropriate for financial time series, and what should you use instead?',
  a: null, type2: 'discuss', aText: 'Look-ahead leakage and autocorrelation; use walk-forward / purged CV with embargo',
  sol: 'Two problems. First, random folds train on data from *after* the test period, which leaks future information and is impossible in live trading. Second, financial data is autocorrelated and labels often overlap in time (e.g. a 5-day forward return), so adjacent train and test observations are near-duplicates — the test set is not independent.\n\nUse instead:\n• Walk-forward (expanding or rolling window) validation, always training on the past and testing on the future.\n• Purged k-fold with an embargo (López de Prado): drop training observations whose label windows overlap the test set, plus a gap afterwards.\n• Combinatorial purged CV for more robust estimates.\n\nThis is one of the highest-signal research questions asked — getting it wrong is the most common way backtests lie.',
  firms: ['citadel', 'two-sigma', 'hrt', 'xtx', 'aqr'], tags: ['cross-validation', 'backtesting', 'important', 'research']
},
{
  id: 'stat-032', cat: 'statistics', sub: 'Machine Learning', diff: 2, secs: 150, type: 'numeric',
  q: 'A classifier achieves 99% accuracy on a dataset where 99% of samples are class A. What is wrong with this evaluation?',
  a: null, type2: 'discuss', aText: 'Class imbalance — accuracy is meaningless; use precision/recall, F1, AUC or balanced accuracy',
  sol: 'The trivial "always predict A" classifier already achieves 99%, so the model has demonstrated nothing.\n\nBetter metrics: precision and recall on the minority class, F1, ROC-AUC, precision-recall AUC (preferable under heavy imbalance), balanced accuracy, or Matthews correlation coefficient.\n\nThe trading analogue: a model predicting "no large move today" is right almost every day and is worthless. What matters is performance conditional on the rare events, and more precisely the P&L-weighted performance rather than any classification metric.',
  firms: ['citadel', 'two-sigma', 'hrt'], tags: ['ml', 'imbalance', 'metrics']
},
{
  id: 'stat-033', cat: 'statistics', sub: 'Machine Learning', diff: 3, secs: 180, type: 'numeric',
  q: 'Explain the bias–variance decomposition of expected prediction error and where a random forest and a single deep decision tree each sit.',
  a: null, type2: 'discuss', aText: 'E[(y−f̂)²] = Bias² + Variance + irreducible noise; deep tree = low bias/high variance, forest reduces variance by averaging',
  sol: 'E[(y − f̂(x))²] = Bias[f̂]² + Var[f̂] + σ²_noise.\n\nA single deep decision tree has very low bias (it can fit anything) and very high variance (small data changes give a completely different tree).\n\nA random forest averages many decorrelated deep trees. Averaging B trees each with variance σ² and pairwise correlation ρ gives variance ρσ² + (1−ρ)σ²/B — the same formula as portfolio diversification. Bootstrap sampling and random feature subsetting exist precisely to push ρ down.\n\nBoosting takes the opposite route: it starts with high-bias shallow stumps and reduces bias sequentially, which is why boosted models overfit more readily and need careful early stopping.',
  firms: ['citadel', 'two-sigma', 'hrt', 'xtx'], tags: ['bias-variance', 'ensembles', 'ml']
},

/* --------------------------------------------------------- distributions */
{
  id: 'stat-040', cat: 'statistics', sub: 'Distributions', diff: 2, secs: 120, type: 'numeric',
  q: 'Daily equity returns are famously not normal. Name the two main deviations and their sign.',
  a: null, type2: 'discuss', aText: 'Fat tails (excess kurtosis > 0) and negative skew',
  sol: 'Excess kurtosis is strongly positive — daily equity index returns typically show excess kurtosis of 3–10, meaning extreme moves are far more frequent than Gaussian. A "5-sigma" day under a normal model should occur once per ~7,000 years; in practice they occur every few years.\n\nSkewness is negative for equity indices — crashes are sharper than rallies. Note single stocks often have positive skew while the index is negatively skewed, because correlations spike in selloffs.\n\nPractical consequences: VaR computed from a normal assumption badly understates tail risk; option markets price this as the volatility skew.',
  firms: ['citadel', 'optiver', 'sig', 'two-sigma'], tags: ['fat-tails', 'skew', 'important']
},
{
  id: 'stat-041', cat: 'statistics', sub: 'Distributions', diff: 2, secs: 120, type: 'numeric',
  q: 'What is the probability that a standard normal exceeds 2 standard deviations above the mean (one-sided)?',
  a: 0.02275, tol: 0.002,
  sol: 'About 2.28%.\n\nThe table worth memorising cold: 1σ → 15.9% one-sided (68% within), 2σ → 2.28% (95% within), 3σ → 0.135% (99.7% within). Also 1.645σ → 5% and 1.96σ → 2.5%.',
  firms: ['optiver', 'sig', 'citadel', 'imc'], tags: ['normal', 'memorise']
},
{
  id: 'stat-042', cat: 'statistics', sub: 'Distributions', diff: 3, secs: 180, type: 'numeric',
  q: 'X and Y are jointly normal with correlation ρ. What is E[Y | X = x] in terms of the marginal parameters?',
  a: null, type2: 'discuss', aText: 'μ_Y + ρ(σ_Y/σ_X)(x − μ_X)',
  sol: 'E[Y | X = x] = μ_Y + ρ(σ_Y/σ_X)(x − μ_X), and Var(Y | X) = σ_Y²(1 − ρ²), which notably does not depend on x.\n\nTwo things to notice. First, the conditional mean is exactly the OLS regression line — for jointly normal variables, linear regression is the true conditional expectation, not an approximation. Second, the conditional variance shrinks by the factor (1 − ρ²), which is the R² result in another guise.',
  firms: ['citadel', 'two-sigma', 'jane-street', 'hrt'], tags: ['normal', 'conditioning', 'important']
},
{
  id: 'stat-043', cat: 'statistics', sub: 'Distributions', diff: 3, secs: 180, type: 'numeric',
  q: 'You have two unbiased estimators of the same quantity with variances σ₁² and σ₂² and zero correlation. What weights minimise the variance of a weighted combination, and what is the resulting variance?',
  a: null, type2: 'discuss', aText: 'Inverse-variance weights w₁ = σ₂²/(σ₁²+σ₂²); combined variance = σ₁²σ₂²/(σ₁²+σ₂²)',
  sol: 'Minimise Var(wX₁ + (1−w)X₂) = w²σ₁² + (1−w)²σ₂².\n\nSetting the derivative to zero gives w = σ₂²/(σ₁² + σ₂²) — weight inversely proportional to variance (equivalently, proportional to precision).\n\nResulting variance = σ₁²σ₂²/(σ₁² + σ₂²), i.e. precisions add: 1/σ² = 1/σ₁² + 1/σ₂².\n\nThis is the core of signal combination, Kalman filtering and Bayesian updating with normal priors — all the same computation.',
  firms: ['citadel', 'two-sigma', 'xtx', 'hrt'], tags: ['inverse-variance', 'signal-combination', 'important']
},
{
  id: 'stat-044', cat: 'statistics', sub: 'Distributions', diff: 2, secs: 150, type: 'numeric',
  q: 'What does the Central Limit Theorem require, and give a case where sample means do NOT converge to a normal distribution.',
  a: null, type2: 'discuss', aText: 'Requires finite variance; Cauchy-distributed samples never converge',
  sol: 'The classical CLT needs iid samples with finite mean and finite variance. Then (X̄ − μ)√n/σ → N(0,1).\n\nCounterexample: the Cauchy distribution has undefined mean and infinite variance. The sample mean of n Cauchy variables is itself Cauchy with the *same* scale — averaging achieves absolutely nothing, no matter how much data you collect.\n\nMore generally, for stable distributions with tail index α < 2 the sum converges to an α-stable law, not a normal. This matters in finance because return tails are heavy enough that convergence to normality is slow, and risk estimates based on the CLT at short horizons are unreliable.',
  firms: ['citadel', 'jane-street', 'two-sigma'], tags: ['clt', 'cauchy', 'theory']
}

]);
