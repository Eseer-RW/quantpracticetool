/* Procedural generators for mental arithmetic and number sequences.
 *
 * These reproduce the structure and frequency mix of the real speed tests:
 *  - Optiver / Akuna / Five Rings "80 in 8"  (80 questions, 8 minutes, +1/-1)
 *  - Jane Street arithmetic filter           (~60 questions, 8 minutes)
 *  - Optiver NumberLogic sequences           (26 sequences, 25 minutes)
 *  - Akuna / Five Rings sequences            (24 sequences, 12 minutes)
 *  - IMC combined math + pattern             (24 questions, 18 minutes)
 */
window.QP = window.QP || {};

(function () {
  'use strict';

  function ri(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function round(x, dp) { var m = Math.pow(10, dp); return Math.round(x * m) / m; }

  /* ------------------------------------------------------- mental math -- */

  /* Each builder returns {q, a}. `a` is always a number. */
  var MM = {
    add2: function () {          // 2-digit + 2-digit
      var a = ri(11, 99), b = ri(11, 99);
      return { q: a + ' + ' + b, a: a + b };
    },
    add3: function () {          // 3-digit + 2/3-digit
      var a = ri(101, 999), b = ri(11, 999);
      return { q: a + ' + ' + b, a: a + b };
    },
    sub2: function () {
      var a = ri(20, 99), b = ri(11, a);
      return { q: a + ' - ' + b, a: a - b };
    },
    sub3: function () {
      var a = ri(200, 999), b = ri(11, a);
      return { q: a + ' - ' + b, a: a - b };
    },
    mul1x2: function () {
      var a = ri(2, 9), b = ri(11, 99);
      return { q: a + ' × ' + b, a: a * b };
    },
    mul2x2: function () {
      var a = ri(11, 99), b = ri(11, 99);
      return { q: a + ' × ' + b, a: a * b };
    },
    mul1x3: function () {
      var a = ri(2, 9), b = ri(101, 999);
      return { q: a + ' × ' + b, a: a * b };
    },
    div: function () {           // always exact
      var b = ri(2, 19), ans = ri(2, 99);
      return { q: (b * ans) + ' ÷ ' + b, a: ans };
    },
    divDec: function () {        // one decimal place
      var b = ri(2, 12), ans = round(ri(15, 400) / 10, 1);
      return { q: round(b * ans, 2) + ' ÷ ' + b, a: ans };
    },
    frac: function () {          // fraction of a number
      var dens = [2, 3, 4, 5, 6, 8, 10, 12, 20];
      var d = pick(dens), n = ri(1, d - 1);
      var mult = ri(2, 40), val = d * mult;
      return { q: n + '/' + d + ' of ' + val, a: n * mult };
    },
    fracAdd: function () {       // fraction arithmetic -> decimal
      var d1 = pick([2, 4, 5, 8, 10]), d2 = pick([2, 4, 5, 8, 10]);
      var n1 = ri(1, d1 - 1), n2 = ri(1, d2 - 1);
      var v = round(n1 / d1 + n2 / d2, 4);
      return { q: n1 + '/' + d1 + ' + ' + n2 + '/' + d2 + '  (decimal)', a: v };
    },
    pct: function () {
      var p = pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80, 90]);
      var base = ri(2, 40) * 20;
      return { q: p + '% of ' + base, a: round(base * p / 100, 4) };
    },
    pctChange: function () {
      var base = ri(2, 40) * 25;
      var p = pick([5, 10, 20, 25, 50]);
      var up = Math.random() < 0.5;
      return {
        q: base + (up ? ' increased by ' : ' decreased by ') + p + '%',
        a: round(base * (up ? 1 + p / 100 : 1 - p / 100), 4)
      };
    },
    decMul: function () {
      var a = round(ri(11, 99) / 10, 1), b = round(ri(11, 99) / 10, 1);
      return { q: a + ' × ' + b, a: round(a * b, 2) };
    },
    square: function () {
      var a = ri(11, 40);
      return { q: a + '²', a: a * a };
    },
    mixed: function () {         // two-step
      var a = ri(2, 12), b = ri(2, 12), c = ri(2, 40);
      return { q: a + ' × ' + b + ' + ' + c, a: a * b + c };
    }
  };

  /* Firm-specific weightings. Optiver includes fractions; Akuna famously
   * does not. Jane Street's filter leans on larger add/subtract. */
  var MM_PROFILES = {
    optiver: ['add2', 'add2', 'add3', 'sub2', 'sub3', 'mul1x2', 'mul1x2', 'mul2x2',
              'div', 'div', 'frac', 'frac', 'fracAdd', 'pct', 'decMul'],
    akuna:   ['add2', 'add2', 'add3', 'sub2', 'sub2', 'sub3', 'mul1x2', 'mul1x2',
              'mul2x2', 'div', 'div', 'pct', 'pct', 'decMul'],
    fiverings: ['add2', 'add3', 'sub2', 'sub3', 'mul1x2', 'mul2x2', 'div',
                'frac', 'pct', 'decMul'],
    janestreet: ['add2', 'add3', 'add3', 'sub2', 'sub3', 'mul1x2', 'mul2x2',
                 'div', 'pct', 'square', 'mixed'],
    imc: ['add2', 'add3', 'sub2', 'mul1x2', 'mul2x2', 'div', 'pct', 'frac'],
    sig: ['add2', 'add3', 'sub3', 'mul1x2', 'mul2x2', 'div', 'pct', 'pctChange',
          'frac', 'decMul'],
    zetamac: ['add2', 'add2', 'sub2', 'sub2', 'mul1x2', 'mul1x2', 'div', 'div'],
    all: Object.keys(MM)
  };

  QP.genMentalMath = function (profile, n) {
    var keys = MM_PROFILES[profile] || MM_PROFILES.all;
    var out = [];
    for (var i = 0; i < n; i++) {
      var g = MM[pick(keys)]();
      out.push({
        id: 'mm-gen-' + i,
        cat: 'mentalmath', sub: 'Speed', diff: 1,
        type: 'numeric', q: g.q, a: g.a, tol: 1e-6,
        sol: 'Answer: ' + g.a,
        generated: true
      });
    }
    return out;
  };

  /* --------------------------------------------------------- sequences -- */

  /* Every builder returns {terms:[...], next:Number, rule:'...'} */
  var SEQ = {
    arithmetic: function () {
      var a = ri(1, 40), d = ri(2, 15) * (Math.random() < 0.25 ? -1 : 1);
      var t = []; for (var i = 0; i < 5; i++) t.push(a + i * d);
      return { terms: t, next: a + 5 * d, rule: 'Arithmetic, common difference ' + d };
    },
    geometric: function () {
      var a = ri(1, 8), r = pick([2, 3, 2, 2, 4, 5]);
      var t = []; for (var i = 0; i < 5; i++) t.push(a * Math.pow(r, i));
      return { terms: t, next: a * Math.pow(r, 5), rule: 'Geometric, ratio ' + r };
    },
    secondDiff: function () {           // quadratic
      var a = ri(1, 10), d = ri(1, 8), dd = ri(1, 6);
      var t = [a], cur = a, step = d;
      for (var i = 0; i < 5; i++) { cur += step; step += dd; t.push(cur); }
      var next = t[5];
      return { terms: t.slice(0, 5), next: t[5], rule: 'Second differences constant at ' + dd };
    },
    squares: function () {
      var s = ri(1, 8), off = pick([0, 0, 1, -1, 2]);
      var t = []; for (var i = 0; i < 5; i++) t.push((s + i) * (s + i) + off);
      return { terms: t, next: (s + 5) * (s + 5) + off,
               rule: 'n² ' + (off ? (off > 0 ? '+ ' + off : '- ' + (-off)) : '') };
    },
    fibonacci: function () {
      var a = ri(1, 9), b = ri(1, 9);
      var t = [a, b]; for (var i = 2; i < 6; i++) t.push(t[i - 1] + t[i - 2]);
      return { terms: t.slice(0, 5), next: t[5], rule: 'Each term is the sum of the previous two' };
    },
    altSign: function () {
      var a = ri(2, 20), d = ri(2, 12);
      var t = []; for (var i = 0; i < 5; i++) t.push((a + i * d) * (i % 2 ? -1 : 1));
      return { terms: t, next: (a + 5 * d) * (5 % 2 ? -1 : 1),
               rule: 'Arithmetic magnitude with alternating sign' };
    },
    interleaved: function () {
      var a = ri(1, 15), d1 = ri(2, 9), b = ri(20, 60), d2 = -ri(2, 9);
      var t = [a, b, a + d1, b + d2, a + 2 * d1, b + 2 * d2];
      return { terms: t.slice(0, 6), next: a + 3 * d1,
               rule: 'Two interleaved arithmetic sequences (odd positions +' + d1 + ', even positions ' + d2 + ')' };
    },
    mulAdd: function () {
      var a = ri(1, 6), m = ri(2, 4), c = ri(1, 9);
      var t = [a]; for (var i = 1; i < 5; i++) t.push(t[i - 1] * m + c);
      return { terms: t, next: t[4] * m + c, rule: 'Each term = previous × ' + m + ' + ' + c };
    },
    primes: function () {
      var P = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
      var s = ri(0, 6);
      return { terms: P.slice(s, s + 5), next: P[s + 5], rule: 'Consecutive prime numbers' };
    },
    triangular: function () {
      var s = ri(1, 8);
      function tri(n) { return n * (n + 1) / 2; }
      var t = []; for (var i = 0; i < 5; i++) t.push(tri(s + i));
      return { terms: t, next: tri(s + 5), rule: 'Triangular numbers n(n+1)/2' };
    },
    powerPlus: function () {
      var b = pick([2, 3]), c = ri(1, 10);
      var t = []; for (var i = 1; i <= 5; i++) t.push(Math.pow(b, i) + c);
      return { terms: t, next: Math.pow(b, 6) + c, rule: b + '^n + ' + c };
    },
    diffOfDiff: function () {           // cubic-ish
      var t = [], a = ri(1, 5);
      for (var i = 0; i < 6; i++) t.push(a + i * i * i);
      return { terms: t.slice(0, 5), next: t[5], rule: 'n³ shifted by ' + a };
    }
  };

  var SEQ_PROFILES = {
    /* Optiver's NumberLogic ramps in difficulty across the paper. */
    optiver: ['arithmetic', 'geometric', 'secondDiff', 'squares', 'fibonacci',
              'altSign', 'interleaved', 'mulAdd', 'triangular', 'powerPlus', 'diffOfDiff'],
    akuna: ['arithmetic', 'geometric', 'secondDiff', 'squares', 'fibonacci',
            'altSign', 'mulAdd', 'triangular'],
    fiverings: ['arithmetic', 'geometric', 'secondDiff', 'fibonacci', 'altSign',
                'interleaved', 'mulAdd'],
    imc: ['arithmetic', 'geometric', 'secondDiff', 'squares', 'fibonacci', 'altSign'],
    all: Object.keys(SEQ)
  };

  QP.genSequences = function (profile, n) {
    var keys = SEQ_PROFILES[profile] || SEQ_PROFILES.all;
    var out = [];
    for (var i = 0; i < n; i++) {
      /* Ramp difficulty: draw from the front of the list early, the whole list later. */
      var span = Math.max(3, Math.ceil(keys.length * (0.4 + 0.6 * (i / Math.max(1, n - 1)))));
      var g = SEQ[pick(keys.slice(0, span))]();
      out.push({
        id: 'seq-gen-' + i,
        cat: 'sequences', sub: 'Pattern', diff: 2,
        type: 'numeric',
        q: g.terms.join(',  ') + ',  ?',
        a: g.next, tol: 1e-6,
        sol: g.rule + '\n\nNext term: ' + g.next,
        generated: true
      });
    }
    return out;
  };

  /* ------------------------------------------ mixed math+pattern (IMC) -- */
  QP.genMixed = function (profile, n) {
    var half = Math.ceil(n / 2);
    var a = QP.genMentalMath(profile, half);
    var b = QP.genSequences(profile, n - half);
    var all = a.concat(b);
    /* interleave rather than block, as IMC's paper does */
    all.sort(function () { return Math.random() - 0.5; });
    return all.map(function (q, i) { q.id = 'mix-gen-' + i; return q; });
  };

})();
