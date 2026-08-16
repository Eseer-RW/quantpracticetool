/* Persistence and analytics: attempt history, per-category performance,
 * weak-area detection, and a spaced-repetition queue of missed questions.
 * Everything lives in localStorage — no server, no account.
 */
window.QP = window.QP || {};

QP.Stats = (function () {
  'use strict';

  var KEY = 'qpt.v1';

  function blank() {
    return {
      attempts: [],       // completed exams
      qstats: {},         // questionId -> {seen, correct, wrong, lastSeen, ease}
      mmGames: [],        // market-making game results
      streak: { last: null, days: 0 },
      created: Date.now()
    };
  }

  var db = null;

  function load() {
    if (db) return db;
    try {
      var raw = localStorage.getItem(KEY);
      db = raw ? JSON.parse(raw) : blank();
    } catch (e) { db = blank(); }
    if (!db.attempts) db = blank();
    return db;
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* quota */ }
  }

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  function bumpStreak() {
    load();
    var t = todayKey();
    if (db.streak.last === t) return;
    var y = new Date(Date.now() - 86400000);
    var yk = y.getFullYear() + '-' + (y.getMonth() + 1) + '-' + y.getDate();
    db.streak.days = (db.streak.last === yk) ? db.streak.days + 1 : 1;
    db.streak.last = t;
  }

  /* ------------------------------------------------------------ recording */
  function recordExam(exam, score, elapsedSec) {
    load();
    bumpStreak();

    var rec = {
      id: exam.id,
      when: Date.now(),
      mode: exam.mode,
      firmId: exam.firmId,
      firmName: exam.firmName,
      role: exam.role,
      elapsed: elapsedSec || 0,
      pct: score.pct,
      correct: score.correct,
      total: score.total,
      review: score.review,
      passedAll: score.passedAll,
      sections: score.sections.map(function (s, i) {
        return {
          name: exam.sections[i].name,
          correct: s.correct, wrong: s.wrong, skipped: s.skipped,
          review: s.review, total: s.total, raw: s.raw,
          pct: s.pct, passed: s.passed, negative: exam.sections[i].negative
        };
      })
    };
    db.attempts.unshift(rec);
    if (db.attempts.length > 200) db.attempts.length = 200;

    /* Per-question stats, skipping generated questions (ids are not stable). */
    exam.sections.forEach(function (sec, si) {
      var res = score.sections[si].results;
      sec.questions.forEach(function (q, qi) {
        if (q.generated) return;
        var st = db.qstats[q.id] || { seen: 0, correct: 0, wrong: 0, cat: q.cat, sub: q.sub, diff: q.diff };
        st.seen++;
        st.cat = q.cat; st.sub = q.sub; st.diff = q.diff;
        var r = res[qi];
        if (r.state === 'correct') st.correct++;
        else if (r.state === 'wrong') st.wrong++;
        st.lastSeen = Date.now();
        st.lastState = r.state;
        db.qstats[q.id] = st;
      });
    });

    save();
    return rec;
  }

  function recordMMGame(firmName, summary) {
    load();
    bumpStreak();
    db.mmGames.unshift({
      when: Date.now(), firmName: firmName,
      pnl: summary.pnl, trades: summary.trades,
      fillRate: summary.fillRate, avgWidth: summary.avgWidth,
      avgMidError: summary.avgMidError, peakAbsPos: summary.peakAbsPos,
      informedShare: summary.informedShare
    });
    if (db.mmGames.length > 100) db.mmGames.length = 100;
    save();
  }

  /* ------------------------------------------------------------ analytics */
  function byCategory() {
    load();
    var agg = {};
    Object.keys(db.qstats).forEach(function (id) {
      var s = db.qstats[id];
      var c = s.cat || 'other';
      if (!agg[c]) agg[c] = { seen: 0, correct: 0, wrong: 0, subs: {} };
      agg[c].seen += s.seen;
      agg[c].correct += s.correct;
      agg[c].wrong += s.wrong;
      var sub = s.sub || 'General';
      if (!agg[c].subs[sub]) agg[c].subs[sub] = { seen: 0, correct: 0, wrong: 0 };
      agg[c].subs[sub].seen += s.seen;
      agg[c].subs[sub].correct += s.correct;
      agg[c].subs[sub].wrong += s.wrong;
    });
    Object.keys(agg).forEach(function (c) {
      var a = agg[c];
      a.accuracy = (a.correct + a.wrong) ? a.correct / (a.correct + a.wrong) : null;
      Object.keys(a.subs).forEach(function (s) {
        var x = a.subs[s];
        x.accuracy = (x.correct + x.wrong) ? x.correct / (x.correct + x.wrong) : null;
      });
    });
    return agg;
  }

  /* Weakest sub-topics with enough data to be meaningful. */
  function weakAreas(minAttempts) {
    minAttempts = minAttempts || 2;
    var agg = byCategory(), out = [];
    Object.keys(agg).forEach(function (c) {
      Object.keys(agg[c].subs).forEach(function (s) {
        var x = agg[c].subs[s];
        var n = x.correct + x.wrong;
        if (n >= minAttempts && x.accuracy != null) {
          out.push({ cat: c, sub: s, accuracy: x.accuracy, n: n });
        }
      });
    });
    out.sort(function (a, b) { return a.accuracy - b.accuracy; });
    return out;
  }

  /* Questions to revisit: wrong ones first, weighted by how long ago and how
   * often they were missed. A light spaced-repetition heuristic. */
  function reviewQueue(limit) {
    load();
    var now = Date.now(), out = [];
    Object.keys(db.qstats).forEach(function (id) {
      var s = db.qstats[id];
      if (!s.wrong) return;
      var missRate = s.wrong / Math.max(1, s.seen);
      var daysSince = (now - (s.lastSeen || now)) / 86400000;
      /* Due sooner if missed often; the +1 keeps day-0 items in play. */
      var priority = missRate * 2 + Math.min(daysSince, 30) / 10 +
                     (s.lastState === 'wrong' ? 1 : 0);
      out.push({ id: id, priority: priority, missRate: missRate, seen: s.seen, wrong: s.wrong });
    });
    out.sort(function (a, b) { return b.priority - a.priority; });
    var ids = out.slice(0, limit || 20).map(function (x) { return x.id; });
    return QP.BANK.filter(function (q) { return ids.indexOf(q.id) >= 0; });
  }

  function recentQuestionIds(n) {
    load();
    var ids = [], now = Date.now();
    Object.keys(db.qstats).forEach(function (id) {
      var s = db.qstats[id];
      /* Consider "recently seen" as within the last 2 days. */
      if (s.lastSeen && now - s.lastSeen < 2 * 86400000) ids.push(id);
    });
    return ids.slice(0, n || 200);
  }

  function firmHistory(firmId) {
    load();
    return db.attempts.filter(function (a) { return a.firmId === firmId; });
  }

  function summary() {
    load();
    var a = db.attempts;
    var totalQ = 0, totalC = 0;
    a.forEach(function (x) { totalQ += (x.total - (x.review || 0)); totalC += x.correct; });
    return {
      exams: a.length,
      questions: totalQ,
      accuracy: totalQ ? totalC / totalQ : null,
      streak: db.streak.days || 0,
      mmGames: db.mmGames.length,
      bestMM: db.mmGames.reduce(function (m, g) { return Math.max(m, g.pnl); }, -Infinity),
      lastExam: a[0] || null
    };
  }

  function history(limit) { load(); return db.attempts.slice(0, limit || 25); }
  function mmHistory(limit) { load(); return db.mmGames.slice(0, limit || 25); }

  function reset() { db = blank(); save(); }

  function exportJSON() { load(); return JSON.stringify(db, null, 2); }

  function importJSON(text) {
    var parsed = JSON.parse(text);
    if (!parsed || !parsed.attempts) throw new Error('Not a valid backup file');
    db = parsed; save();
  }

  return {
    recordExam: recordExam, recordMMGame: recordMMGame,
    byCategory: byCategory, weakAreas: weakAreas, reviewQueue: reviewQueue,
    recentQuestionIds: recentQuestionIds, firmHistory: firmHistory,
    summary: summary, history: history, mmHistory: mmHistory,
    reset: reset, exportJSON: exportJSON, importJSON: importJSON
  };
})();
