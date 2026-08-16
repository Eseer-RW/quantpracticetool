/* Exam engine: builds exams from blueprints, parses answers, scores sections. */
window.QP = window.QP || {};

(function () {
  'use strict';

  /* ------------------------------------------------------ answer parsing -- */
  /* Accepts: 12, -3.5, 1/3, 2 1/2, 1.2e-3, 45%, 3^2, sqrt(2), pi, e,
   * and simple arithmetic like (1+2)/3. Returns NaN if unparseable. */
  QP.parseAnswer = function (raw) {
    if (raw == null) return NaN;
    var s = String(raw).trim().toLowerCase();
    if (!s) return NaN;

    s = s.replace(/[$,\s]/g, '');
    if (!s) return NaN;

    var pct = false;
    if (/%$/.test(s)) { pct = true; s = s.slice(0, -1); }

    /* Plain number (covers 12, -3.5, 1.2e-3) — try this first and cheapest. */
    if (/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/.test(s)) {
      var plain = Number(s);
      return isFinite(plain) ? (pct ? plain / 100 : plain) : NaN;
    }

    /* Symbolic constants and functions, normalised to JS. */
    s = s.replace(/π/g, 'PI').replace(/\bpi\b/g, 'PI')
         .replace(/\bsqrt\(/g, 'S(')
         .replace(/\^/g, '**');
    /* Bare 'e' as Euler's number, but not the exponent 'e' in 1e5. */
    s = s.replace(/(^|[^0-9a-z.])e($|[^0-9a-z])/g, '$1E$2');

    /* Whitelist: digits, operators, parens, dot, and our tokens S / PI / E.
     * Anything else is rejected rather than evaluated. */
    if (!/^[0-9+\-*/().SPIE]*$/.test(s.replace(/\*\*/g, '*'))) return NaN;

    var val;
    try {
      /* eslint-disable no-new-func */
      val = Function('S', 'PI', 'E', '"use strict";return (' + s + ');')(
        Math.sqrt, Math.PI, Math.E);
    } catch (err) {
      return NaN;
    }
    if (typeof val !== 'number' || !isFinite(val)) return NaN;
    return pct ? val / 100 : val;
  };

  /* ------------------------------------------------------------ checking -- */
  QP.checkAnswer = function (q, raw) {
    if (raw == null || String(raw).trim() === '') return { state: 'skipped' };

    if (q.type === 'mcq') {
      var idx = typeof raw === 'number' ? raw : parseInt(raw, 10);
      return { state: idx === q.a ? 'correct' : 'wrong', given: idx };
    }

    if (q.type2 === 'discuss' || q.type === 'code' || q.a == null) {
      /* Open-ended: self-graded against the model answer. */
      return { state: 'review', given: String(raw) };
    }

    var v = QP.parseAnswer(raw);
    if (isNaN(v)) return { state: 'wrong', given: String(raw), unparsed: true };

    /* Estimation questions accept an order-of-magnitude range. */
    if (q.type === 'estimate' && q.range) {
      return { state: (v >= q.range[0] && v <= q.range[1]) ? 'correct' : 'wrong', given: v };
    }

    var tol = q.tol == null ? 1e-6 : q.tol;
    /* Relative tolerance for large answers, absolute for small ones. */
    var ok = Math.abs(v - q.a) <= Math.max(tol, Math.abs(q.a) * 1e-9);
    if (!ok && Math.abs(q.a) > 1000) {
      ok = Math.abs(v - q.a) / Math.abs(q.a) <= 1e-6;
    }
    return { state: ok ? 'correct' : 'wrong', given: v };
  };

  /* ------------------------------------------------------ bank selection -- */
  function matches(q, f) {
    if (!f) return true;
    if (f.cat && f.cat.indexOf(q.cat) === -1) return false;
    if (f.sub && f.sub.indexOf(q.sub) === -1) return false;
    if (f.diff && f.diff.indexOf(q.diff) === -1) return false;
    if (f.firm && (!q.firms || q.firms.indexOf(f.firm) === -1)) return false;
    if (f.tags && (!q.tags || !f.tags.some(function (t) { return q.tags.indexOf(t) >= 0; }))) return false;
    return true;
  }
  QP.matches = matches;

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  QP.shuffle = shuffle;

  QP.selectFromBank = function (filter, count, opts) {
    opts = opts || {};
    var pool = QP.BANK.filter(function (q) { return matches(q, filter); });

    if (opts.preferFirm) {
      /* Put questions actually attributed to this firm first, then fill. */
      var tagged = pool.filter(function (q) { return q.firms && q.firms.indexOf(opts.preferFirm) >= 0; });
      var rest = pool.filter(function (q) { return !q.firms || q.firms.indexOf(opts.preferFirm) < 0; });
      pool = shuffle(tagged).concat(shuffle(rest));
    } else {
      pool = shuffle(pool);
    }

    if (opts.avoidIds && opts.avoidIds.length) {
      var fresh = pool.filter(function (q) { return opts.avoidIds.indexOf(q.id) < 0; });
      if (fresh.length >= count) pool = fresh;
    }

    if (pool.length === 0) return [];
    /* If the pool is smaller than requested, repeat rather than short-change. */
    var out = [];
    while (out.length < count) {
      out = out.concat(pool.slice(0, count - out.length));
      if (pool.length === 0) break;
    }
    return out.slice(0, count);
  };

  /* -------------------------------------------------------- exam building -- */
  QP.buildExam = function (firm, opts) {
    opts = opts || {};
    var seen = QP.Stats ? QP.Stats.recentQuestionIds() : [];
    var sections = firm.sections.map(function (sec) {
      var qs;
      if (sec.kind === 'mm') {
        qs = QP.genMentalMath(sec.profile || 'all', sec.count);
      } else if (sec.kind === 'seq') {
        qs = QP.genSequences(sec.profile || 'all', sec.count);
      } else if (sec.kind === 'mix') {
        qs = QP.genMixed(sec.profile || 'all', sec.count);
      } else {
        qs = QP.selectFromBank(sec.filter, sec.count,
          { preferFirm: firm.id.split('-')[0], avoidIds: seen });
      }
      return {
        name: sec.name,
        instructions: sec.instructions,
        seconds: sec.seconds,
        negative: !!sec.negative,
        allowBack: sec.allowBack !== false,
        passPct: sec.passPct || 55,
        questions: qs,
        answers: new Array(qs.length).fill(null),
        kind: sec.kind
      };
    });

    return {
      id: 'exam-' + Date.now(),
      mode: 'oa',
      firmId: firm.id,
      firmName: firm.name,
      role: firm.role,
      accent: firm.accent,
      startedAt: Date.now(),
      sections: sections,
      sectionIndex: 0
    };
  };

  /* Build a custom practice test from user-chosen filters. */
  QP.buildCustom = function (cfg) {
    var qs;
    if (cfg.kind === 'mm') qs = QP.genMentalMath(cfg.profile || 'all', cfg.count);
    else if (cfg.kind === 'seq') qs = QP.genSequences(cfg.profile || 'all', cfg.count);
    else qs = QP.selectFromBank(cfg.filter, cfg.count,
      { avoidIds: QP.Stats ? QP.Stats.recentQuestionIds() : [] });

    return {
      id: 'exam-' + Date.now(),
      mode: cfg.mode || 'custom',
      firmId: 'custom',
      firmName: cfg.title || 'Custom Practice',
      role: cfg.subtitle || '',
      accent: '#6b7280',
      startedAt: Date.now(),
      sections: [{
        name: cfg.title || 'Practice',
        instructions: cfg.instructions || '',
        seconds: cfg.seconds,
        negative: !!cfg.negative,
        allowBack: cfg.allowBack !== false,
        passPct: 55,
        questions: qs,
        answers: new Array(qs.length).fill(null),
        kind: cfg.kind || 'bank'
      }],
      sectionIndex: 0
    };
  };

  /* -------------------------------------------------------------- scoring -- */
  QP.scoreSection = function (sec) {
    var correct = 0, wrong = 0, skipped = 0, review = 0;
    var results = sec.questions.map(function (q, i) {
      var r = QP.checkAnswer(q, sec.answers[i]);
      if (r.state === 'correct') correct++;
      else if (r.state === 'wrong') wrong++;
      else if (r.state === 'review') review++;
      else skipped++;
      return r;
    });

    var attempted = correct + wrong + review;
    var raw = sec.negative ? (correct - wrong) : correct;
    /* Open-ended questions are excluded from the auto percentage. */
    var gradable = sec.questions.length - review;
    var pct = gradable > 0 ? (correct / gradable) * 100 : 0;

    return {
      correct: correct, wrong: wrong, skipped: skipped, review: review,
      attempted: attempted, total: sec.questions.length,
      raw: raw, pct: pct, results: results,
      passed: pct >= sec.passPct,
      accuracy: attempted > 0 ? (correct / Math.max(1, correct + wrong)) * 100 : 0
    };
  };

  QP.scoreExam = function (exam) {
    var secScores = exam.sections.map(QP.scoreSection);
    var correct = 0, total = 0, review = 0;
    secScores.forEach(function (s) { correct += s.correct; total += s.total; review += s.review; });
    var gradable = total - review;
    return {
      sections: secScores,
      correct: correct, total: total, review: review,
      pct: gradable > 0 ? (correct / gradable) * 100 : 0,
      passedAll: secScores.every(function (s) { return s.passed; })
    };
  };

  /* -------------------------------------------------------------- timing -- */
  QP.Timer = function (seconds, onTick, onExpire) {
    var remaining = seconds, handle = null, running = false;
    return {
      start: function () {
        if (running) return;
        running = true;
        handle = setInterval(function () {
          remaining--;
          if (onTick) onTick(remaining);
          if (remaining <= 0) {
            clearInterval(handle); running = false;
            if (onExpire) onExpire();
          }
        }, 1000);
        if (onTick) onTick(remaining);
      },
      stop: function () { if (handle) clearInterval(handle); running = false; },
      remaining: function () { return remaining; },
      elapsed: function () { return seconds - remaining; }
    };
  };

  QP.fmtTime = function (s) {
    if (s < 0) s = 0;
    var m = Math.floor(s / 60), r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  };

})();
