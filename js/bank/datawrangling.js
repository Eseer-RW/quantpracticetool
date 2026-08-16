/* Data wrangling: the practical handling of financial time series.
 *
 * These are the questions that separate someone who has actually worked with
 * market data from someone who has only read about it. Almost every one is
 * really a question about look-ahead bias in disguise.
 */
window.QP = window.QP || {};
QP.BANK = (QP.BANK || []).concat([

{
  id: 'dw-001', cat: 'programming', sub: 'Data Wrangling', diff: 3, secs: 210, type: 'code',
  q: 'You have a table of trades with timestamps and a table of quotes with timestamps. You need the prevailing quote at the moment of each trade. What join do you use, and what goes wrong with a naive equality join?',
  type2: 'discuss',
  aText: 'An as-of (backward) join on timestamp — pandas merge_asof with direction="backward"',
  sol: 'Use an as-of join: `pd.merge_asof(trades, quotes, on="timestamp", direction="backward")`. Both frames must be sorted by the join key.\n\nAn equality join fails because trade and quote timestamps almost never match exactly — you would drop nearly every row.\n\nThe critical detail is `direction`. The default `backward` takes the most recent quote at or before the trade, which is the only causally valid choice. Using `forward` or `nearest` lets a quote that arrived *after* the trade inform it, which is look-ahead bias and will make a backtest look brilliant and trade terribly.\n\nFollow-ups to expect: `allow_exact_matches=False` if the quote must strictly precede the trade; `tolerance` to avoid matching a stale quote from hours earlier; and `by="symbol"` to join within instrument rather than across the whole book.',
  firms: ['citadel', 'two-sigma', 'hrt', 'xtx'], tags: ['pandas', 'look-ahead', 'important']
},
{
  id: 'dw-002', cat: 'programming', sub: 'Data Wrangling', diff: 2, secs: 180, type: 'code',
  q: 'A price series has missing values on some days. When is forward-filling appropriate, and when is it a bug?',
  type2: 'discuss',
  aText: 'Fine for carrying a last known price forward; a bug when it fabricates observations or fills fundamentals backwards',
  sol: 'Forward-fill is appropriate when the value genuinely persists until the next observation — a last traded price, a holding, a credit rating, or a quarterly fundamental that stays in force until the next report.\n\nIt is a bug when:\n• You forward-fill *returns* or *volumes*. A missing return is not the previous return; a missing volume is not the previous volume. Zero or NaN is usually right.\n• The gap is long. Filling a price across a three-month halt manufactures a flat series with artificially low volatility, then one enormous jump.\n• You use `bfill` anywhere in a predictive pipeline. Backward-filling copies future values into the past, which is direct look-ahead bias.\n\nSafer practice: `ffill(limit=n)` to bound the staleness, and keep an explicit `is_stale` flag so downstream models can down-weight filled observations rather than trusting them.',
  firms: ['citadel', 'two-sigma', 'aqr'], tags: ['pandas', 'missing-data', 'look-ahead']
},
{
  id: 'dw-003', cat: 'programming', sub: 'Data Wrangling', diff: 2, secs: 180, type: 'code',
  q: 'You need to convert a stream of ticks into 1-minute OHLCV bars. Outline the operation and one subtlety that catches people out.',
  type2: 'discuss',
  aText: 'resample("1min").agg(...) on a DatetimeIndex; watch the closed/label conventions',
  sol: '```python\nbars = ticks.resample("1min", closed="left", label="left").agg(\n    open=("price", "first"), high=("price", "max"),\n    low=("price", "min"),   close=("price", "last"),\n    volume=("size", "sum"))\n```\n\nThe subtlety is the interval convention. By default a bar labelled 09:30 covers [09:30, 09:31), but if you set `label="right"` it is stamped 09:31. Get this wrong and every bar is shifted by one minute relative to your signals — a silent one-bar look-ahead that is very hard to spot later.\n\nOther traps: empty minutes produce NaN rows that you must decide to drop or carry; volume should sum while price should not; and for anything sub-second you need the timestamps to actually be nanosecond-resolution rather than silently truncated.\n\nA strong candidate also mentions that time bars are a poor sampling scheme statistically — volume or dollar bars give returns much closer to IID and normally distributed.',
  firms: ['citadel', 'hrt', 'xtx', 'two-sigma'], tags: ['pandas', 'resampling', 'market-data']
},
{
  id: 'dw-004', cat: 'programming', sub: 'Data Wrangling', diff: 3, secs: 180, type: 'code',
  q: 'Your backtest of a strategy on current S&P 500 members shows a Sharpe of 2. What is the most likely problem?',
  type2: 'discuss',
  aText: 'Survivorship bias — the universe is defined using future information',
  sol: 'Survivorship bias. Using *today\'s* index members over a historical period means the universe was selected with knowledge of which companies survived and thrived. Delisted, bankrupt and acquired names are missing entirely.\n\nThe effect is large — studies typically put it at 1–4% of annual return for equity strategies, and it hits hardest exactly where you least want it: value and small-cap strategies whose losers are the ones that disappear.\n\nThe fix is a point-in-time universe: a table of index membership with effective start and end dates, so on any given backtest date you use the members as of that date. The same principle applies to fundamentals, which must be indexed by *report* date rather than *period* date, since a Q4 figure is not knowable on 31 December.\n\nThis is one of the highest-signal research questions asked, because it distinguishes people who have built a backtest from people who have trusted one.',
  firms: ['citadel', 'two-sigma', 'aqr', 'xtx'], tags: ['survivorship-bias', 'backtesting', 'important']
},
{
  id: 'dw-005', cat: 'programming', sub: 'Data Wrangling', diff: 2, secs: 150, type: 'code',
  q: 'A stock\'s price series shows a −50% return on one day, but the company did not lose half its value. What happened, and how do you handle it?',
  type2: 'discuss',
  aText: 'A corporate action — most likely a 2-for-1 split; use adjusted prices',
  sol: 'A corporate action, most likely a 2-for-1 stock split. Dividends, spin-offs, rights issues and reverse splits produce the same artefact.\n\nHandling: compute returns from *adjusted* prices, where historical prices are scaled by the cumulative adjustment factor. Total-return series also fold dividends back in, which matters enormously over long horizons — the gap between price return and total return on an equity index is roughly 2% a year.\n\nTwo traps worth raising. First, adjusted prices are restated retroactively, so a series you pulled last month will not match today\'s — which quietly breaks reproducibility unless you snapshot data. Second, never mix an adjusted price series with an unadjusted volume or shares-outstanding series; market cap computed that way is wrong by exactly the split factor.\n\nA practical detection heuristic: flag any single-day move beyond, say, 40% and check it against a corporate-actions calendar rather than winsorising it away.',
  firms: ['citadel', 'two-sigma', 'aqr'], tags: ['corporate-actions', 'market-data']
},
{
  id: 'dw-006', cat: 'programming', sub: 'Data Wrangling', diff: 2, secs: 150, type: 'code',
  q: 'In pandas, what is the difference between groupby().apply() and groupby().transform(), and which do you want for cross-sectional z-scoring?',
  type2: 'discuss',
  aText: 'transform returns a result aligned to the original index — the one you want for z-scoring',
  sol: '`transform` returns an object with the *same shape and index* as the input, broadcasting the group result back to every row. `apply` is general: it can return a scalar, a Series, or a differently-shaped frame per group, and pandas then guesses how to stitch the pieces together.\n\nFor cross-sectional z-scoring you want `transform`:\n\n```python\ng = df.groupby("date")["signal"]\nz = (df["signal"] - g.transform("mean")) / g.transform("std")\n```\n\nThis keeps perfect row alignment. Doing it with `apply` risks a reordered or multi-indexed result that silently misaligns against the original frame — a bug that does not raise, it just quietly corrupts your signal.\n\n`transform` is also substantially faster for built-in aggregations, since it dispatches to a Cython path rather than calling a Python function per group.',
  firms: ['citadel', 'two-sigma', 'aqr', 'xtx'], tags: ['pandas', 'groupby']
},
{
  id: 'dw-007', cat: 'programming', sub: 'Data Wrangling', diff: 2, secs: 150, type: 'code',
  q: 'Your signal has extreme outliers. Compare winsorizing, clipping at fixed z-scores, and rank transformation. Which would you use for a cross-sectional equity signal?',
  type2: 'discuss',
  aText: 'Rank/quantile transformation is usually safest cross-sectionally; winsorize at percentiles if you need to keep magnitudes',
  sol: '**Winsorizing** caps values at empirical percentiles (e.g. 1st and 99th). Keeps ordering and rough magnitudes; the thresholds move with the data.\n\n**Clipping at fixed z-scores** (say ±3) uses the mean and standard deviation, both of which are themselves wrecked by the outliers you are trying to control. Use a median and MAD instead if you go this route.\n\n**Rank transformation** maps to uniform or normal scores. Completely immune to outliers and to the shape of the distribution, at the cost of discarding magnitude information — a stock ten times cheaper than the next becomes merely "rank 1".\n\nFor cross-sectional equity signals rank or quantile transformation is usually the right default: the cross-sectional distribution changes shape dramatically between calm and stressed markets, and ranks are stable across that regime shift while raw z-scores are not.\n\nThe caveat to state: if your signal is genuinely informative *in the tails* — as many event-driven signals are — then destroying magnitude also destroys the alpha, and winsorizing at gentler thresholds is better.',
  firms: ['citadel', 'two-sigma', 'aqr', 'xtx'], tags: ['outliers', 'signal-processing']
},
{
  id: 'dw-008', cat: 'programming', sub: 'Data Wrangling', diff: 3, secs: 180, type: 'code',
  q: 'You are joining US and European equity data. What timestamp problems should you expect?',
  type2: 'discuss',
  aText: 'Timezones, DST shifts, differing session hours and holidays; store everything in UTC',
  sol: 'Store every timestamp in UTC and convert only for display or session logic.\n\nSpecific problems:\n• **DST transitions** happen on different dates in the US and EU, so the offset between the two markets changes for a couple of weeks each spring and autumn. Code that hard-codes a 6-hour gap breaks twice a year.\n• **Non-overlapping sessions.** European close precedes US close, so a "daily" cross-market panel is comparing different information sets. A naive same-date join hands the European series information from a US session that had not happened yet — or the reverse.\n• **Different holiday calendars**, producing NaNs on one side that are not genuine missing data.\n• **Ambiguous local times** during the autumn fold-back, where one wall-clock hour occurs twice.\n\nThe right framing for an interview: for any cross-market signal, ask what was actually *knowable* at the moment you would have traded, and align on that, not on the calendar date.',
  firms: ['citadel', 'two-sigma', 'xtx', 'hrt'], tags: ['timezones', 'look-ahead', 'market-data']
},
{
  id: 'dw-009', cat: 'programming', sub: 'Data Wrangling', diff: 2, secs: 120, type: 'mcq',
  q: 'You need to compute the cumulative return of a series of daily returns. Which is correct for simple (arithmetic) returns?',
  choices: [
    'returns.sum()',
    '(1 + returns).prod() - 1',
    'returns.mean() * len(returns)',
    'np.exp(returns.sum()) - 1'
  ],
  a: 1,
  sol: 'Simple returns compound multiplicatively: (1+r₁)(1+r₂)···(1+r_n) − 1, i.e. `(1 + returns).prod() - 1`.\n\nSumming is only valid for *log* returns, where cumulative log return is the sum and you convert back with `np.exp(sum) - 1` (option 4 — correct if the inputs are log returns, wrong for simple ones).\n\nThis is precisely why log returns are convenient: they add across time. Their drawback is that they do not add across a portfolio — the log return of a portfolio is not the weighted average of log returns, whereas for simple returns it is. Time aggregation wants logs; cross-sectional aggregation wants simple.',
  firms: ['citadel', 'two-sigma', 'aqr', 'sig'], tags: ['returns', 'compounding', 'important']
},
{
  id: 'dw-010', cat: 'programming', sub: 'Data Wrangling', diff: 3, secs: 180, type: 'code',
  q: 'Your market data feed contains duplicate rows for the same symbol and timestamp, with slightly different prices. How do you resolve them?',
  type2: 'discuss',
  aText: 'Investigate the cause first — do not blindly drop_duplicates or average',
  sol: 'Diagnose before deduplicating, because the cause determines the correct fix.\n\nCommon causes: the same trade reported by multiple venues (legitimately different prices — keep them and tag the venue); a genuine feed replay or double-publish (drop exact duplicates); a late correction or bust that supersedes the original (keep the *last* by sequence number, not by arrival time); or two genuinely distinct trades that happen to share a timestamp because your resolution is too coarse (keep both — this is not a duplicate at all).\n\nWhat not to do: average the prices. That invents a print that never occurred and destroys the OHLC relationships.\n\nDefault approach: sort by (symbol, timestamp, sequence_number) and take the last per key, having first confirmed the sequence numbers are meaningful. Then assert the result — count rows before and after, and alert if the drop rate moves outside its historical norm, since a sudden spike in duplicates usually means an upstream feed problem rather than something your dedup logic should quietly absorb.',
  firms: ['hrt', 'citadel', 'xtx', 'optiver'], tags: ['data-quality', 'market-data']
}

]);
