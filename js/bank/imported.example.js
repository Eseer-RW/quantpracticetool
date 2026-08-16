/* TEMPLATE — copy to js/bank/imported.js (which is gitignored and never committed).
 *
 * This file is where questions transcribed from paid prep sites live. It loads
 * automatically if present and is silently skipped if absent, so the app works
 * either way.
 *
 * You do NOT need to write these by hand. Paste raw source material into the
 * chat in any state and it gets converted into this shape.
 *
 * ---------------------------------------------------------------- schema ----
 *  id      unique string. Prefix by source so it is obvious where it came from:
 *          'oq-'  OpenQuant      'qq-'  QuantQuestions
 *          'wsq-' WallStreetQuants   'eq-'  EverythingQuant
 *  cat     probability | statistics | brainteasers | marketmaking |
 *          options | programming | math
 *  sub     free-text sub-topic, e.g. 'Conditional', 'Greeks', 'Estimation'
 *  diff    1 easy | 2 medium | 3 hard
 *  secs    target solve time in seconds under interview conditions
 *  type    'numeric' | 'mcq' | 'estimate' | 'code'
 *  q       the question prompt
 *  a       numeric answer (omit for open-ended; index of correct choice for mcq)
 *  tol     numeric tolerance (required for numeric)
 *  choices array of options (mcq only)
 *  range   [lo, hi] accepted band (estimate only)
 *  type2   'discuss' marks an open-ended question; pair with aText, omit a
 *  aText   model answer string for open-ended questions
 *  sol     worked solution — the method and the common trap, not just a number
 *  firms   array of firm ids this is asked at (see js/firms.js)
 *  tags    optional free-text tags
 *  src     where it came from, for your own reference
 *
 * Run `node tests/selftest.js` after adding questions — it validates every
 * field and will name anything malformed.
 */
window.QP = window.QP || {};
QP.BANK = (QP.BANK || []).concat([

  /* ---- numeric ---- */
  {
    id: 'oq-001', cat: 'probability', sub: 'Conditional', diff: 2, secs: 120,
    type: 'numeric',
    q: 'Example: you draw two cards from a standard deck without replacement. What is the probability both are hearts?',
    a: 0.0588, tol: 0.001,
    sol: '(13/52)·(12/51) = 156/2652 = 1/17 ≈ 0.0588.\n\nThe trap is treating the draws as independent and answering (1/4)² = 0.0625.',
    firms: ['optiver', 'sig'], tags: ['cards'], src: 'OpenQuant'
  },

  /* ---- multiple choice ---- */
  {
    id: 'oq-002', cat: 'statistics', sub: 'Regression', diff: 2, secs: 90,
    type: 'mcq',
    q: 'Example: adding an irrelevant regressor to an OLS model will do what to in-sample R²?',
    choices: ['Decrease it', 'Leave it unchanged', 'Weakly increase it', 'Make it undefined'],
    a: 2,
    sol: 'R² never decreases when a regressor is added, since the old model is nested in the new one.',
    firms: ['citadel', 'two-sigma'], tags: ['ols'], src: 'OpenQuant'
  },

  /* ---- open-ended / discussion ---- */
  {
    id: 'wsq-001', cat: 'marketmaking', sub: 'Quoting', diff: 3, secs: 180,
    type: 'numeric', type2: 'discuss',
    q: 'Example: you are quoting a market and get lifted three times in a row. Walk me through what you do.',
    aText: 'Skew lower, cut size, and treat the repeated one-sided flow as information',
    sol: 'Repeated one-sided flow means either your fair value is wrong or the counterparty knows something. Move the market, reduce size, and re-derive fair value rather than defending the original price.',
    firms: ['optiver', 'imc'], tags: ['adverse-selection'], src: 'WallStreetQuants'
  },

  /* ---- estimation ---- */
  {
    id: 'eq-001', cat: 'brainteasers', sub: 'Estimation', diff: 2, secs: 180,
    type: 'estimate',
    q: 'Example: estimate the number of petrol stations in the United States.',
    a: 115000, range: [30000, 400000],
    sol: 'Roughly 330M people, ~250M drivers, each visiting ~once a week → ~250M fills/week. A station serves maybe ~2,000 fills/week → ~125,000 stations. Actual is about 115,000.',
    firms: ['jane-street', 'sig'], tags: ['fermi'], src: 'EverythingQuant'
  }

]);
