/* Application shell: routing, views, exam runner, market-making game UI. */
(function () {
  'use strict';

  var app = document.getElementById('view');
  var state = { route: 'home', exam: null, timer: null, qi: 0, game: null, interview: null };

  /* ------------------------------------------------------------- helpers */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function el(html) { var d = document.createElement('div'); d.innerHTML = html; return d.firstElementChild; }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function mins(s) { return Math.round(s / 60); }
  function pctColor(p) { return p >= 70 ? 'var(--good)' : p >= 50 ? 'var(--warn)' : 'var(--bad)'; }
  function dots(n, max) {
    var s = '';
    for (var i = 0; i < (max || 5); i++) s += i < n ? '●' : '○';
    return s;
  }
  function fmtDate(ts) {
    var d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' +
           d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  var CAT_LABEL = {
    probability: 'Probability', statistics: 'Statistics', brainteasers: 'Brainteasers',
    marketmaking: 'Market Making', options: 'Options & Derivatives',
    programming: 'Programming', math: 'Mathematics', mentalmath: 'Mental Math',
    sequences: 'Sequences'
  };

  /* --------------------------------------------------------------- router */
  function go(route, arg) {
    state.route = route;
    if (state.timer) { state.timer.stop(); state.timer = null; }
    window.scrollTo(0, 0);
    $$('.nav button').forEach(function (b) { b.classList.toggle('on', b.dataset.route === route); });
    ({
      home: viewHome, firms: viewFirms, interviews: viewInterviews, drill: viewDrill,
      speed: viewSpeed, review: viewReview, stats: viewStats, exam: viewExam,
      results: viewResults, mmgame: viewMMGame, about: viewAbout
    }[route] || viewHome)(arg);
  }
  window.QPgo = go;

  /* ==================================================================== */
  /*  HOME                                                                */
  /* ==================================================================== */
  function viewHome() {
    var s = QP.Stats.summary();
    var weak = QP.Stats.weakAreas(2).slice(0, 4);
    var recent = QP.Stats.history(5);

    var h = '<h1>Quant Practice</h1>' +
      '<p class="sub">Firm-accurate online assessments, timed interview simulations and a live market-making game, built on ' +
      QP.BANK.length + ' curated questions plus unlimited generated arithmetic and sequences.</p>';

    h += '<div class="grid c4">' +
      statCard(s.exams, 'Tests taken') +
      statCard(s.questions, 'Questions graded') +
      statCard(s.accuracy == null ? '—' : Math.round(s.accuracy * 100) + '%', 'Overall accuracy') +
      statCard(s.streak, 'Day streak') +
      '</div>';

    h += '<h2>Start a session</h2><div class="grid c2">' +
      quickCard('firms', '📋', 'Firm OA Simulator',
        'Full online assessments with each firm\'s real section structure, timing and scoring — including negative marking where it applies.') +
      quickCard('interviews', '🎙', 'Interview Simulator',
        'Multi-round timed interviews with follow-up probing and a live market-making game, in the style of a specific firm.') +
      quickCard('speed', '⚡', 'Speed Maths & Sequences',
        'The 80-in-8 trainer and sequence drills. Configurable length, firm-specific question mixes, instant feedback.') +
      quickCard('drill', '🎯', 'Topic Drill',
        'Practise one category at a time, timed or untimed, filtered by difficulty. Full worked solutions on every question.') +
      '</div>';

    if (weak.length) {
      h += '<h2>Your weakest areas</h2><div class="grid c2">';
      weak.forEach(function (w) {
        h += '<div class="card"><div class="row between"><div><b>' + esc(w.sub) + '</b>' +
          '<div class="small muted">' + esc(CAT_LABEL[w.cat] || w.cat) + ' · ' + w.n + ' attempts</div></div>' +
          '<div class="res-score" style="font-size:26px;color:' + pctColor(w.accuracy * 100) + '">' +
          Math.round(w.accuracy * 100) + '%</div></div></div>';
      });
      h += '</div>';
      h += '<div class="row" style="margin-top:14px"><button class="btn" onclick="QPgo(\'review\')">Drill my weak areas</button></div>';
    }

    if (recent.length) {
      h += '<h2>Recent attempts</h2><div class="card"><table><tr><th>When</th><th>Test</th>' +
        '<th class="num">Score</th><th class="num">Result</th></tr>';
      recent.forEach(function (a) {
        h += '<tr><td class="muted small">' + fmtDate(a.when) + '</td>' +
          '<td>' + esc(a.firmName) + '<div class="small muted">' + esc(a.role || a.mode) + '</div></td>' +
          '<td class="num">' + Math.round(a.pct) + '%</td>' +
          '<td class="num"><span class="pill ' + (a.passedAll ? 'good' : 'bad') + '">' +
          (a.passedAll ? 'Pass' : 'Below bar') + '</span></td></tr>';
      });
      h += '</table></div>';
    }

    app.innerHTML = h;
  }

  function statCard(n, l) {
    return '<div class="stat"><div class="n">' + esc(n) + '</div><div class="l">' + esc(l) + '</div></div>';
  }
  function quickCard(route, icon, title, desc) {
    return '<div class="card click" onclick="QPgo(\'' + route + '\')">' +
      '<h3>' + icon + '  ' + esc(title) + '</h3>' +
      '<div class="small muted">' + esc(desc) + '</div></div>';
  }

  /* ==================================================================== */
  /*  FIRM OA LIST                                                        */
  /* ==================================================================== */
  function viewFirms() {
    var h = '<h1>Firm OA Simulator</h1>' +
      '<p class="sub">Each simulation reproduces the reported structure of that firm\'s real online assessment: section order, question counts, time limits and scoring rules. Sections that are scored +1/−1 are marked — on those, guessing has negative expected value.</p>';

    h += '<div class="grid c2">';
    QP.FIRMS.forEach(function (f) {
      var totalQ = f.sections.reduce(function (s, x) { return s + x.count; }, 0);
      var totalT = f.sections.reduce(function (s, x) { return s + x.seconds; }, 0);
      var hist = QP.Stats.firmHistory(f.id);
      var best = hist.length ? Math.max.apply(null, hist.map(function (a) { return a.pct; })) : null;

      h += '<div class="card click firm-card" style="--fa:' + f.accent + '" onclick="QPstartOA(\'' + f.id + '\')">' +
        '<div class="row between"><h3>' + esc(f.name) + '</h3>' +
        '<span class="dots" style="color:' + f.accent + '" title="Difficulty">' + dots(f.intensity) + '</span></div>' +
        '<div class="firm-role">' + esc(f.role) + '</div>' +
        '<div class="firm-blurb">' + esc(f.blurb) + '</div>' +
        '<div class="firm-secs">';
      f.sections.forEach(function (sec) {
        h += '<div>› ' + esc(sec.name) + ' — ' + sec.count + 'q / ' + mins(sec.seconds) + 'min' +
          (sec.negative ? ' <span style="color:var(--bad)">±1</span>' : '') + '</div>';
      });
      h += '</div><div class="row" style="margin-top:12px">' +
        '<span class="pill">' + totalQ + ' questions</span>' +
        '<span class="pill">' + mins(totalT) + ' min</span>' +
        (best != null ? '<span class="pill ' + (best >= 60 ? 'good' : 'warn') + '">Best ' + Math.round(best) + '%</span>' : '') +
        '</div></div>';
    });
    h += '</div>';
    app.innerHTML = h;
  }

  window.QPstartOA = function (firmId) {
    var f = QP.getFirm(firmId);
    if (!f) return;
    var exam = QP.buildExam(f);
    showBriefing(f, exam);
  };

  function showBriefing(f, exam) {
    var totalT = f.sections.reduce(function (s, x) { return s + x.seconds; }, 0);
    var h = '<h1>' + esc(f.name) + '</h1><p class="sub">' + esc(f.role) + '</p>';
    h += '<div class="card" style="border-left:3px solid ' + f.accent + '">' +
      '<h3 style="margin-top:0">Format</h3><div class="small muted" style="margin-bottom:14px">' +
      esc(f.realNotes) + '</div><table>' +
      '<tr><th>Section</th><th class="num">Questions</th><th class="num">Time</th><th class="num">Scoring</th></tr>';
    f.sections.forEach(function (sec) {
      h += '<tr><td>' + esc(sec.name) + '<div class="small muted">' + esc(sec.instructions) + '</div></td>' +
        '<td class="num">' + sec.count + '</td><td class="num">' + mins(sec.seconds) + ' min</td>' +
        '<td class="num">' + (sec.negative ? '<span style="color:var(--bad)">+1 / −1</span>' : '+1 / 0') + '</td></tr>';
    });
    h += '</table></div>';

    h += '<div class="card" style="margin-top:14px"><h3 style="margin-top:0">Before you start</h3>' +
      '<ul class="small muted" style="margin:0;padding-left:20px">' +
      '<li>Total time is <b>' + mins(totalT) + ' minutes</b>. Timers run per section and cannot be paused.</li>' +
      '<li>No calculator. Use paper for working.</li>' +
      '<li>When a section timer expires the section submits automatically.</li>' +
      '<li>Answers accept fractions (<code>3/8</code>), decimals, percentages (<code>25%</code>) and expressions (<code>1-(5/6)^4</code>).</li>' +
      '<li>Press <kbd>Enter</kbd> to submit and advance.</li>' +
      '</ul></div>';

    h += '<div class="row" style="margin-top:20px">' +
      '<button class="btn" id="begin">Begin assessment</button>' +
      '<button class="btn ghost" onclick="QPgo(\'firms\')">Back</button></div>';

    app.innerHTML = h;
    $('#begin').onclick = function () { state.exam = exam; state.qi = 0; go('exam'); };
  }

  /* ==================================================================== */
  /*  EXAM RUNNER                                                         */
  /* ==================================================================== */
  function viewExam() {
    var exam = state.exam;
    if (!exam) return go('home');
    var sec = exam.sections[exam.sectionIndex];

    /* Rapid single-question mode for generated speed sections. */
    var rapid = (sec.kind === 'mm' || sec.kind === 'seq' || sec.kind === 'mix') && !sec.allowBack;
    if (rapid) return renderRapid();
    renderPaged();

    function header(extra) {
      var totalSec = exam.sections.length;
      /* Avoid repeating the same string twice for single-section custom tests. */
      var sub = sec.name === exam.firmName ? (exam.role || '') : sec.name;
      if (totalSec > 1) sub += ' · Section ' + (exam.sectionIndex + 1) + ' of ' + totalSec;
      return '<div class="exam-bar"><div><div class="t">' + esc(exam.firmName) + '</div>' +
        '<div class="sec">' + esc(sub) + '</div></div>' +
        (extra || '') +
        '<div class="clock" id="clock">' + QP.fmtTime(sec.seconds) + '</div></div>';
    }

    function startTimer() {
      state.timer = QP.Timer(sec.seconds, function (r) {
        var c = $('#clock');
        if (!c) return;
        c.textContent = QP.fmtTime(r);
        c.className = 'clock' + (r <= 10 ? ' crit' : r <= 60 ? ' warn' : '');
      }, function () { finishSection(true); });
      state.timer.start();
    }

    /* ---------------------------------------------------- rapid renderer */
    function renderRapid() {
      state.qi = 0;
      state.rapidLog = [];
      app.innerHTML = header(
        '<div class="progressbar" style="margin-left:20px"><i id="pb" style="width:0%"></i></div>' +
        '<span class="small muted" id="counter">1 / ' + sec.questions.length + '</span>') +
        '<div class="mm-wrap">' +
        '<div class="mm-q" id="mmq"></div>' +
        '<input class="mm-in" id="mmin" autocomplete="off" autocorrect="off" spellcheck="false" inputmode="decimal">' +
        '<div class="mm-meta">' +
        '<div><b id="mScore">0</b>score</div>' +
        '<div><b id="mRight">0</b>correct</div>' +
        '<div><b id="mWrong">0</b>wrong</div>' +
        '<div><b id="mRate">—</b>per min</div>' +
        '</div>' +
        (sec.negative ? '<p class="small" style="color:var(--warn);margin-top:20px">Negative marking: −1 per wrong answer. Leave it blank if you are not sure — press <kbd>Enter</kbd> on an empty box to skip.</p>' : '<p class="small muted" style="margin-top:20px">No negative marking — always guess rather than skip.</p>') +
        '</div>';

      var right = 0, wrong = 0;
      var input = $('#mmin');
      paint();
      input.focus();
      startTimer();

      input.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        var val = input.value.trim();
        var q = sec.questions[state.qi];
        sec.answers[state.qi] = val === '' ? null : val;

        if (val !== '') {
          var res = QP.checkAnswer(q, val);
          if (res.state === 'correct') { right++; flash('flash-ok'); }
          else { wrong++; flash('flash-bad'); }
        }
        $('#mRight').textContent = right;
        $('#mWrong').textContent = wrong;
        $('#mScore').textContent = sec.negative ? (right - wrong) : right;
        var elapsed = Math.max(1, state.timer.elapsed());
        $('#mRate').textContent = Math.round((right + wrong) / (elapsed / 60));

        input.value = '';
        state.qi++;
        if (state.qi >= sec.questions.length) return finishSection(false);
        paint();
      });

      function flash(cls) {
        input.classList.remove('flash-ok', 'flash-bad');
        void input.offsetWidth;
        input.classList.add(cls);
      }
      function paint() {
        var q = sec.questions[state.qi];
        $('#mmq').textContent = q.q;
        $('#counter').textContent = (state.qi + 1) + ' / ' + sec.questions.length;
        $('#pb').style.width = (state.qi / sec.questions.length * 100) + '%';
      }
    }

    /* ---------------------------------------------------- paged renderer */
    function renderPaged() {
      state.qi = 0;
      app.innerHTML = header(
        '<div class="progressbar" style="margin-left:20px"><i id="pb" style="width:0%"></i></div>' +
        '<span class="small muted" id="counter"></span>') +
        '<div id="qhost"></div>';
      startTimer();
      paintQ();
    }

    function paintQ() {
      var q = sec.questions[state.qi], n = sec.questions.length;
      $('#counter').textContent = (state.qi + 1) + ' / ' + n;
      $('#pb').style.width = ((state.qi) / n * 100) + '%';

      var body = '<div class="qcard"><div class="qmeta">' +
        '<span class="tag">' + esc(CAT_LABEL[q.cat] || q.cat) + (q.sub ? ' · ' + esc(q.sub) : '') + '</span>' +
        '<span class="tag">' + ['Easy', 'Medium', 'Hard'][(q.diff || 1) - 1] + '</span>' +
        (q.secs ? '<span class="tag">target ' + q.secs + 's</span>' : '') +
        '</div>';

      var cls = sec.kind === 'seq' ? 'qtext seq' : 'qtext';
      body += '<div class="' + cls + '">' + esc(q.q) + '</div>';

      var cur = sec.answers[state.qi];
      if (q.type === 'mcq') {
        body += '<div class="choices">';
        q.choices.forEach(function (c, i) {
          body += '<button class="choice' + (String(cur) === String(i) ? ' sel' : '') + '" data-i="' + i + '">' +
            '<span class="k">' + 'ABCD'[i] + '</span><span>' + esc(c) + '</span></button>';
        });
        body += '</div>';
      } else if (q.type2 === 'discuss' || q.type === 'code') {
        body += '<textarea id="ans" placeholder="Write your approach. In a real interview you would say this out loud — the structure of the answer is what is being graded.">' +
          esc(cur || '') + '</textarea>' +
          '<p class="small muted" style="margin-top:8px">Open-ended: you will self-grade this against the model answer at the end.</p>';
      } else if (q.type === 'estimate') {
        body += '<input class="answer" id="ans" autocomplete="off" placeholder="Your estimate (e.g. 2e6 or 2000000)" value="' + esc(cur || '') + '">' +
          '<p class="small muted" style="margin-top:8px">Order-of-magnitude question — a wide band is accepted. Note your assumptions.</p>';
      } else {
        body += '<input class="answer" id="ans" autocomplete="off" placeholder="Answer — fractions, decimals or expressions" value="' + esc(cur || '') + '">';
      }

      body += '<div class="row between" style="margin-top:22px">' +
        '<div class="row">' +
        (sec.allowBack && state.qi > 0 ? '<button class="btn ghost sm" id="prev">← Previous</button>' : '') +
        '<button class="btn ghost sm" id="skip">Skip</button></div>' +
        '<div class="row">' +
        '<button class="btn" id="next">' + (state.qi === n - 1 ? 'Finish section' : 'Next →') + '</button>' +
        '</div></div></div>';

      /* Question navigator for sections that allow revisiting. */
      if (sec.allowBack && n <= 30) {
        body += '<div class="card"><div class="small muted" style="margin-bottom:8px">Navigator</div><div class="row">';
        for (var i = 0; i < n; i++) {
          var done = sec.answers[i] != null && sec.answers[i] !== '';
          body += '<button class="btn ghost sm" data-nav="' + i + '" style="min-width:38px;' +
            (i === state.qi ? 'border-color:var(--accent);color:var(--text);' : '') +
            (done ? 'background:#3fb95022;' : '') + '">' + (i + 1) + '</button>';
        }
        body += '</div></div>';
      }

      $('#qhost').innerHTML = body;

      $$('#qhost .choice').forEach(function (b) {
        b.onclick = function () {
          sec.answers[state.qi] = parseInt(b.dataset.i, 10);
          $$('#qhost .choice').forEach(function (x) { x.classList.remove('sel'); });
          b.classList.add('sel');
        };
      });
      $$('#qhost [data-nav]').forEach(function (b) {
        b.onclick = function () { commit(); state.qi = parseInt(b.dataset.nav, 10); paintQ(); };
      });
      var prev = $('#prev'); if (prev) prev.onclick = function () { commit(); state.qi--; paintQ(); };
      $('#skip').onclick = function () { sec.answers[state.qi] = null; advance(); };
      $('#next').onclick = function () { commit(); advance(); };

      var ansEl = $('#ans');
      if (ansEl) {
        ansEl.focus();
        if (q.type !== 'code' && q.type2 !== 'discuss') {
          ansEl.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { e.preventDefault(); commit(); advance(); }
          });
        }
      }

      function commit() {
        var a = $('#ans');
        if (a) sec.answers[state.qi] = a.value.trim() === '' ? null : a.value.trim();
      }
      function advance() {
        if (state.qi >= n - 1) return finishSection(false);
        state.qi++;
        paintQ();
      }
    }

    function finishSection(expired) {
      if (state.timer) { state.timer.stop(); state.timer = null; }
      exam.sections[exam.sectionIndex].elapsed =
        expired ? sec.seconds : sec.seconds - 0;
      if (exam.sectionIndex < exam.sections.length - 1) {
        exam.sectionIndex++;
        showInterstitial(expired);
      } else {
        go('results');
      }
    }

    function showInterstitial(expired) {
      var next = exam.sections[exam.sectionIndex];
      app.innerHTML = '<div class="empty" style="padding-top:80px">' +
        (expired ? '<p class="pill warn">Time expired — section submitted automatically</p>' : '<p class="pill good">Section complete</p>') +
        '<h1 style="margin-top:20px">' + esc(next.name) + '</h1>' +
        '<p class="sub" style="margin:0 auto 24px;max-width:520px">' + esc(next.instructions) + '</p>' +
        '<div class="row" style="justify-content:center;margin-bottom:24px">' +
        '<span class="pill">' + next.questions.length + ' questions</span>' +
        '<span class="pill">' + mins(next.seconds) + ' minutes</span>' +
        (next.negative ? '<span class="pill bad">+1 / −1 scoring</span>' : '') +
        '</div>' +
        '<button class="btn" id="cont">Start section ' + (exam.sectionIndex + 1) + '</button></div>';
      $('#cont').onclick = function () { go('exam'); };
    }
  }

  /* ==================================================================== */
  /*  RESULTS                                                             */
  /* ==================================================================== */
  function viewResults() {
    var exam = state.exam;
    if (!exam) return go('home');
    var score = QP.scoreExam(exam);
    var elapsed = Math.round((Date.now() - exam.startedAt) / 1000);
    QP.Stats.recordExam(exam, score, elapsed);

    var verdict = score.passedAll ? 'Above the reported progression bar'
      : score.pct >= 45 ? 'Borderline — some sections below bar'
      : 'Below the bar';

    var h = '<h1>' + esc(exam.firmName) + ' — Results</h1>' +
      '<p class="sub">' + esc(exam.role || '') + '</p>';

    h += '<div class="res-hero" style="border-left:3px solid ' + exam.accent + '">' +
      '<div><div class="res-score" style="color:' + pctColor(score.pct) + '">' + Math.round(score.pct) + '%</div>' +
      '<div class="small muted">' + score.correct + ' of ' + (score.total - score.review) + ' auto-graded</div></div>' +
      '<div style="flex:1;min-width:220px">' +
      '<div class="res-verdict" style="color:' + pctColor(score.pct) + '">' + verdict + '</div>' +
      '<div class="small muted">Completed in ' + mins(elapsed) + ' min' +
      (score.review ? ' · ' + score.review + ' open-ended answers to self-grade below' : '') + '</div></div>' +
      '</div>';

    /* Section breakdown */
    h += '<h2>Section breakdown</h2><div class="card"><table>' +
      '<tr><th>Section</th><th class="num">Correct</th><th class="num">Wrong</th>' +
      '<th class="num">Skipped</th><th class="num">Raw</th><th class="num">Score</th><th class="num">Bar</th></tr>';
    score.sections.forEach(function (s, i) {
      var sec = exam.sections[i];
      h += '<tr><td>' + esc(sec.name) +
        (sec.negative ? ' <span class="tag" style="color:var(--bad)">±1</span>' : '') +
        '<div class="bar" style="width:150px;margin-top:5px"><i style="width:' + Math.min(100, s.pct) + '%;background:' + pctColor(s.pct) + '"></i></div></td>' +
        '<td class="num" style="color:var(--good)">' + s.correct + '</td>' +
        '<td class="num" style="color:var(--bad)">' + s.wrong + '</td>' +
        '<td class="num muted">' + s.skipped + '</td>' +
        '<td class="num">' + s.raw + '</td>' +
        '<td class="num"><b>' + Math.round(s.pct) + '%</b></td>' +
        '<td class="num"><span class="pill ' + (s.passed ? 'good' : 'bad') + '">' + sec.passPct + '%</span></td></tr>';
    });
    h += '</table></div>';

    /* Category performance in this attempt */
    var byCat = {};
    exam.sections.forEach(function (sec, si) {
      sec.questions.forEach(function (q, qi) {
        var r = score.sections[si].results[qi];
        if (r.state === 'review') return;
        var c = q.cat;
        byCat[c] = byCat[c] || { c: 0, n: 0 };
        byCat[c].n++;
        if (r.state === 'correct') byCat[c].c++;
      });
    });
    var cats = Object.keys(byCat);
    if (cats.length > 1) {
      h += '<h2>By category</h2><div class="grid c3">';
      cats.forEach(function (c) {
        var p = byCat[c].n ? byCat[c].c / byCat[c].n * 100 : 0;
        h += '<div class="card"><div class="small muted">' + esc(CAT_LABEL[c] || c) + '</div>' +
          '<div class="row between" style="align-items:baseline"><b style="font-size:22px;font-family:var(--mono);color:' + pctColor(p) + '">' +
          Math.round(p) + '%</b><span class="small muted">' + byCat[c].c + '/' + byCat[c].n + '</span></div>' +
          '<div class="bar"><i style="width:' + p + '%;background:' + pctColor(p) + '"></i></div></div>';
      });
      h += '</div>';
    }

    /* Review every question */
    h += '<h2>Review</h2><div id="reviewList"></div>';
    h += '<div class="row" style="margin-top:24px">' +
      '<button class="btn" onclick="QPstartOA(\'' + exam.firmId + '\')">Retake this assessment</button>' +
      '<button class="btn ghost" onclick="QPgo(\'firms\')">Other firms</button>' +
      '<button class="btn ghost" onclick="QPgo(\'stats\')">Analytics</button></div>';

    app.innerHTML = h;
    renderReviewList($('#reviewList'), exam, score);
  }

  function renderReviewList(host, exam, score) {
    var html = '';
    exam.sections.forEach(function (sec, si) {
      if (exam.sections.length > 1) html += '<h3>' + esc(sec.name) + '</h3>';
      sec.questions.forEach(function (q, qi) {
        var r = score.sections[si].results[qi];
        /* Don't dump 80 arithmetic rows — only show the ones missed. */
        if (q.generated && r.state === 'correct') return;
        var mark = r.state === 'correct' ? '<span style="color:var(--good)">✓</span>'
          : r.state === 'wrong' ? '<span style="color:var(--bad)">✗</span>'
          : r.state === 'review' ? '<span style="color:var(--accent)">◇</span>'
          : '<span class="muted">–</span>';
        var given = r.given == null ? '—' : String(r.given);
        var expect = q.type === 'mcq' ? q.choices[q.a]
          : q.aText ? q.aText
          : (q.a != null ? formatNum(q.a) : '—');

        html += '<div class="rev"><div class="rev-head" data-t="' + si + '-' + qi + '">' +
          '<div class="rev-mark">' + mark + '</div>' +
          '<div class="rev-q">' + esc(q.q.length > 190 ? q.q.slice(0, 190) + '…' : q.q) +
          '<div class="small muted" style="margin-top:4px">' +
          (r.state === 'review' ? 'Self-grade this' :
            'You: <b>' + esc(given) + '</b> · Answer: <b>' + esc(expect) + '</b>') +
          '</div></div>' +
          '<div class="tag">' + esc(CAT_LABEL[q.cat] || q.cat) + '</div></div>' +
          '<div class="rev-body hide" id="rb-' + si + '-' + qi + '">' +
          (q.type === 'mcq' ? '<p class="small muted">Correct choice: <b>' + esc(q.choices[q.a]) + '</b></p>' : '') +
          '<div class="sol">' + esc(q.sol || '') + '</div>' +
          (q.firms && q.firms.length ? '<div class="small muted" style="margin-top:8px">Commonly asked at: ' +
            q.firms.map(function (f) { var ff = QP.getFirm(f); return ff ? ff.name : f; }).join(', ') + '</div>' : '') +
          '</div></div>';
      });
    });
    host.innerHTML = html || '<div class="empty">Everything correct — nothing to review.</div>';

    $$('.rev-head', host).forEach(function (hd) {
      hd.onclick = function () {
        var b = $('#rb-' + hd.dataset.t);
        if (b) b.classList.toggle('hide');
      };
    });
  }

  function formatNum(n) {
    if (typeof n !== 'number') return String(n);
    if (Number.isInteger(n)) return String(n);
    var r = Math.round(n * 10000) / 10000;
    return String(r);
  }

  /* ==================================================================== */
  /*  INTERVIEWS                                                          */
  /* ==================================================================== */
  function viewInterviews() {
    var h = '<h1>Interview Simulator</h1>' +
      '<p class="sub">Multi-round interviews in the style of a specific firm. Rounds are timed the way real ones are, questions come with the follow-up probes interviewers actually use, and market-making rounds are played live against a counterparty that is sometimes better informed than you.</p>';

    h += '<div class="grid c2">';
    QP.INTERVIEWS.forEach(function (iv, idx) {
      var total = iv.rounds.reduce(function (s, r) { return s + r.minutes; }, 0);
      h += '<div class="card click firm-card" style="--fa:' + iv.accent + '" onclick="QPstartInterview(' + idx + ')">' +
        '<h3>' + esc(iv.name) + '</h3>' +
        '<div class="firm-blurb">' + esc(iv.intro) + '</div>' +
        '<div class="firm-secs">';
      iv.rounds.forEach(function (r) {
        h += '<div>› ' + esc(r.name) + ' — ' + r.minutes + ' min' +
          (r.kind === 'mmgame' ? ' <span style="color:' + iv.accent + '">live game</span>' : '') + '</div>';
      });
      h += '</div><div class="row" style="margin-top:12px">' +
        '<span class="pill">' + iv.rounds.length + ' rounds</span>' +
        '<span class="pill">' + total + ' min</span></div></div>';
    });
    h += '</div>';
    app.innerHTML = h;
  }

  window.QPstartInterview = function (idx) {
    var iv = QP.INTERVIEWS[idx];
    state.interview = { def: iv, round: 0 };
    runInterviewRound();
  };

  function runInterviewRound() {
    var iv = state.interview.def, ri = state.interview.round;
    if (ri >= iv.rounds.length) return finishInterview();
    var r = iv.rounds[ri];

    var h = '<h1>' + esc(iv.name) + '</h1>' +
      '<p class="sub">Round ' + (ri + 1) + ' of ' + iv.rounds.length + '</p>' +
      '<div class="card" style="border-left:3px solid ' + iv.accent + '">' +
      '<h3 style="margin-top:0">' + esc(r.name) + '</h3>' +
      '<div class="row" style="margin-bottom:12px">' +
      '<span class="pill">' + r.minutes + ' minutes</span>' +
      '<span class="pill">' + (r.kind === 'mmgame' ? 'Market making game' :
        r.kind === 'questions' ? r.count + ' questions' : 'Speed test') + '</span></div>' +
      '<div class="feedback warn"><b>Interviewer note:</b> ' + esc(r.coaching) + '</div>' +
      '</div>' +
      '<div class="row" style="margin-top:20px"><button class="btn" id="go">Start round</button>' +
      '<button class="btn ghost" onclick="QPgo(\'interviews\')">Exit interview</button></div>';
    app.innerHTML = h;

    $('#go').onclick = function () {
      if (r.kind === 'mmgame') {
        startMMGame({
          rounds: r.rounds || 12,
          informedProb: r.informedProb,
          title: iv.name + ' — ' + r.name,
          accent: iv.accent,
          onDone: nextRound
        });
      } else if (r.kind === 'mm' || r.kind === 'mix' || r.kind === 'seq') {
        state.exam = QP.buildCustom({
          kind: r.kind, profile: r.profile, count: r.count,
          seconds: r.minutes * 60, title: r.name,
          subtitle: iv.name, allowBack: false, mode: 'interview'
        });
        state.exam.accent = iv.accent;
        state.exam.firmName = iv.name;
        state.exam.onDone = nextRound;
        go('exam');
      } else {
        state.exam = QP.buildCustom({
          filter: r.filter, count: r.count, seconds: r.minutes * 60,
          title: r.name, subtitle: iv.name, allowBack: true, mode: 'interview',
          instructions: r.coaching
        });
        state.exam.accent = iv.accent;
        state.exam.firmName = iv.name;
        state.exam.interviewMode = true;
        state.exam.onDone = nextRound;
        go('exam');
      }
    };

    function nextRound() { state.interview.round++; runInterviewRound(); }
  }

  function finishInterview() {
    var iv = state.interview.def;
    app.innerHTML = '<div class="empty" style="padding-top:70px">' +
      '<h1>Interview complete</h1>' +
      '<p class="sub" style="margin:0 auto 24px;max-width:540px">You finished all ' + iv.rounds.length +
      ' rounds of the ' + esc(iv.name) + ' simulation. Per-round results are in your analytics.</p>' +
      '<div class="row" style="justify-content:center">' +
      '<button class="btn" onclick="QPgo(\'stats\')">See analytics</button>' +
      '<button class="btn ghost" onclick="QPgo(\'interviews\')">Another interview</button></div></div>';
    state.interview = null;
  }

  /* ==================================================================== */
  /*  MARKET MAKING GAME                                                  */
  /* ==================================================================== */
  function viewMMGame() { startMMGame({ rounds: 12, title: 'Market Making Game', accent: '#4c8dff' }); }

  function startMMGame(opts) {
    var g = QP.MMGame.newGame({ rounds: opts.rounds, informedProb: opts.informedProb });
    state.game = g;
    var accent = opts.accent || '#4c8dff';

    render();

    function render() {
      if (g.done) return finish();
      var c = QP.MMGame.startRound(g);

      var h = '<h1>' + esc(opts.title || 'Market Making') + '</h1>' +
        '<p class="sub">Quote a two-sided market and a size. A counterparty will trade against you if your price is favourable to them — and some of the time they can see the true value. You are scored on P&amp;L, pricing accuracy and how much adverse selection you absorb.</p>';

      h += '<div class="card" style="border-left:3px solid ' + accent + '">' +
        '<div class="row between"><span class="small muted">Round ' + g.round + ' of ' + g.rounds + '</span>' +
        '<span class="small muted">Cumulative P&amp;L: <b style="font-family:var(--mono);color:' +
        (g.cash >= 0 ? 'var(--good)' : 'var(--bad)') + '">' + g.cash.toFixed(1) + '</b></span></div>' +
        '<h3 style="margin:14px 0 6px;font-size:20px">' + esc(c.desc) + '</h3>' +
        '<div class="small muted">Quote your bid and offer. Size is how many lots you are willing to trade on either side.</div>' +
        '<div class="mmg-quote" style="margin-top:18px">' +
        '<div class="mmg-field"><label>Your bid</label><input class="answer" id="bid" inputmode="decimal" autocomplete="off"></div>' +
        '<div class="mmg-field"><label>Your offer</label><input class="answer" id="ask" inputmode="decimal" autocomplete="off"></div>' +
        '<div class="mmg-field"><label>Size (max ' + g.maxSize + ')</label><input class="answer" id="size" value="5" inputmode="numeric" autocomplete="off"></div>' +
        '<button class="btn" id="quote" style="height:48px">Show market</button>' +
        '</div><div id="err" class="small" style="color:var(--bad);margin-top:8px"></div></div>';

      if (g.trades.length) h += renderLog();

      app.innerHTML = h;
      $('#bid').focus();
      $('#quote').onclick = submit;
      ['bid', 'ask', 'size'].forEach(function (id) {
        $('#' + id).addEventListener('keydown', function (e) {
          if (e.key === 'Enter') { e.preventDefault(); submit(); }
        });
      });
    }

    function submit() {
      var bid = QP.parseAnswer($('#bid').value);
      var ask = QP.parseAnswer($('#ask').value);
      var size = parseInt($('#size').value, 10);
      var err = $('#err');
      if (isNaN(bid) || isNaN(ask)) { err.textContent = 'Enter both a bid and an offer.'; return; }
      if (ask <= bid) { err.textContent = 'Your offer must be above your bid — a crossed market is an instant loss.'; return; }
      if (isNaN(size) || size < 1) size = 1;
      if (size > g.maxSize) size = g.maxSize;

      var rec = QP.MMGame.submitQuote(g, bid, ask, size);
      showOutcome(rec);
    }

    function showOutcome(rec) {
      var msg;
      if (!rec.traded) {
        msg = '<div class="feedback warn"><b>No trade.</b> Your market was ' + rec.bid + ' / ' + rec.ask +
          ' and the counterparty passed. True value settled at <b>' + rec.trueValue + '</b> (fair value ' + rec.ev + ').</div>';
      } else {
        var good = rec.pnl >= 0;
        msg = '<div class="feedback ' + (good ? 'good' : 'bad') + '">' +
          '<b>' + rec.side + ' ' + rec.qty + ' @ ' + rec.price + '.</b> ' +
          'True value settled at <b>' + rec.trueValue + '</b> (fair value ' + rec.ev + '). ' +
          'P&amp;L on the trade: <b>' + rec.pnl.toFixed(1) + '</b>.' +
          (rec.informed ? ' <br><span style="color:var(--warn)">That counterparty was informed — they could see the settlement value when they traded.</span>' : '') +
          '</div>';
      }
      var midErr = Math.abs((rec.bid + rec.ask) / 2 - rec.ev);
      if (midErr > 1.5) {
        msg += '<div class="feedback warn">Your mid was ' + ((rec.bid + rec.ask) / 2).toFixed(2) +
          ' against a fair value of ' + rec.ev + ' — off by ' + midErr.toFixed(2) +
          '. Pricing error costs far more than spread width over a session.</div>';
      }

      app.innerHTML = '<h1>' + esc(opts.title || 'Market Making') + '</h1>' + msg +
        renderLog() +
        '<div class="row" style="margin-top:18px"><button class="btn" id="next">' +
        (g.done ? 'See results' : 'Next round') + '</button></div>';
      $('#next').onclick = function () { g.done ? finish() : render(); };
    }

    function renderLog() {
      var h = '<div class="card mmg-log"><h3 style="margin-top:0">Trade log</h3><table>' +
        '<tr><th>#</th><th>Contract</th><th class="num">Fair</th><th class="num">Your mkt</th>' +
        '<th class="num">Fill</th><th class="num">True</th><th class="num">P&amp;L</th></tr>';
      g.trades.slice().reverse().forEach(function (t) {
        h += '<tr><td>' + t.round + '</td><td style="font-family:var(--sans);font-size:12.5px">' +
          esc(t.contract.length > 34 ? t.contract.slice(0, 34) + '…' : t.contract) + '</td>' +
          '<td class="num muted">' + t.ev + '</td>' +
          '<td class="num">' + t.bid + '/' + t.ask + '</td>' +
          '<td class="num">' + (t.traded ? (t.side === 'you sold' ? 'S' : 'B') + t.qty + '@' + t.price +
            (t.informed ? ' <span style="color:var(--warn)">!</span>' : '') : '—') + '</td>' +
          '<td class="num">' + t.trueValue + '</td>' +
          '<td class="num" style="color:' + (t.pnl > 0 ? 'var(--good)' : t.pnl < 0 ? 'var(--bad)' : 'var(--text-3)') + '">' +
          (t.traded ? t.pnl.toFixed(1) : '—') + '</td></tr>';
      });
      h += '</table></div>';
      return h;
    }

    function finish() {
      var s = QP.MMGame.summary(g);
      QP.Stats.recordMMGame(opts.title || 'Market Making', s);
      var crit = QP.MMGame.critique(s);

      var h = '<h1>Market Making — Results</h1>';
      h += '<div class="res-hero" style="border-left:3px solid ' + accent + '">' +
        '<div><div class="res-score" style="color:' + (s.pnl >= 0 ? 'var(--good)' : 'var(--bad)') + '">' +
        (s.pnl >= 0 ? '+' : '') + s.pnl.toFixed(1) + '</div>' +
        '<div class="small muted">net P&amp;L over ' + g.rounds + ' rounds</div></div>' +
        '<div style="flex:1;min-width:200px" class="small">' +
        metric('Trades', s.trades) + metric('Fill rate', Math.round(s.fillRate * 100) + '%') +
        metric('P&L per trade', s.pnlPerTrade.toFixed(2)) +
        metric('Avg spread width', s.avgWidth.toFixed(2)) +
        metric('Avg mid error', s.avgMidError.toFixed(2)) +
        metric('Informed fill share', Math.round(s.informedShare * 100) + '%') +
        '</div></div>';

      h += '<h2>Feedback</h2>';
      crit.forEach(function (c) {
        h += '<div class="feedback ' + (c.t === 'good' ? 'good' : c.t === 'bad' ? 'bad' : 'warn') + '">' + c.m + '</div>';
      });

      h += renderLog();
      h += '<div class="row" style="margin-top:20px">' +
        (opts.onDone ? '<button class="btn" id="cont">Continue interview</button>' :
          '<button class="btn" id="again">Play again</button>') +
        '<button class="btn ghost" onclick="QPgo(\'home\')">Home</button></div>';

      app.innerHTML = h;
      if (opts.onDone) $('#cont').onclick = opts.onDone;
      else $('#again').onclick = function () { startMMGame(opts); };
    }

    function metric(l, v) {
      return '<div class="row between" style="border-bottom:1px solid var(--line);padding:4px 0">' +
        '<span class="muted">' + l + '</span><b style="font-family:var(--mono)">' + v + '</b></div>';
    }
  }

  /* ==================================================================== */
  /*  TOPIC DRILL                                                         */
  /* ==================================================================== */
  function viewDrill() {
    var cats = {};
    QP.BANK.forEach(function (q) {
      cats[q.cat] = cats[q.cat] || { n: 0, subs: {} };
      cats[q.cat].n++;
      cats[q.cat].subs[q.sub] = (cats[q.cat].subs[q.sub] || 0) + 1;
    });

    var h = '<h1>Topic Drill</h1>' +
      '<p class="sub">Practise one area at a time with full worked solutions. Timing is set to the target solve time interviewers expect, or you can turn it off entirely while you are still learning the material.</p>';

    h += '<div class="card"><div class="grid c2" style="gap:16px">' +
      '<div><label class="small muted">Category</label><select id="dcat">' +
      '<option value="">All categories</option>';
    Object.keys(cats).forEach(function (c) {
      h += '<option value="' + c + '">' + esc(CAT_LABEL[c] || c) + ' (' + cats[c].n + ')</option>';
    });
    h += '</select></div>' +
      '<div><label class="small muted">Difficulty</label><select id="ddiff">' +
      '<option value="">All difficulties</option><option value="1">Easy</option>' +
      '<option value="2">Medium</option><option value="3">Hard</option></select></div>' +
      '<div><label class="small muted">Number of questions</label><select id="dcount">' +
      '<option>5</option><option selected>10</option><option>15</option><option>20</option><option>30</option>' +
      '</select></div>' +
      '<div><label class="small muted">Timing</label><select id="dtime">' +
      '<option value="target">Interview pace (target time per question)</option>' +
      '<option value="relaxed">Relaxed (2× target)</option>' +
      '<option value="0">Untimed</option></select></div>' +
      '</div><div class="row" style="margin-top:16px"><button class="btn" id="dgo">Start drill</button>' +
      '<span class="small muted" id="dcnt"></span></div></div>';

    h += '<h2>Browse by category</h2><div class="grid c3">';
    Object.keys(cats).forEach(function (c) {
      var subs = Object.keys(cats[c].subs).sort();
      h += '<div class="card click" data-cat="' + c + '"><h3 style="margin-top:0">' +
        esc(CAT_LABEL[c] || c) + '</h3>' +
        '<div class="small muted">' + cats[c].n + ' questions</div>' +
        '<div class="small muted" style="margin-top:8px">' + esc(subs.join(' · ')) + '</div></div>';
    });
    h += '</div>';

    app.innerHTML = h;

    function updateCount() {
      var f = buildFilter();
      var n = QP.BANK.filter(function (q) { return QP.matches(q, f); }).length;
      $('#dcnt').textContent = n + ' questions match';
    }
    function buildFilter() {
      var f = {};
      var c = $('#dcat').value, d = $('#ddiff').value;
      if (c) f.cat = [c];
      if (d) f.diff = [parseInt(d, 10)];
      return f;
    }
    $('#dcat').onchange = updateCount;
    $('#ddiff').onchange = updateCount;
    updateCount();

    $$('[data-cat]').forEach(function (card) {
      card.onclick = function () { $('#dcat').value = card.dataset.cat; updateCount(); window.scrollTo(0, 0); };
    });

    $('#dgo').onclick = function () {
      var f = buildFilter();
      var count = parseInt($('#dcount').value, 10);
      var mode = $('#dtime').value;
      var qs = QP.selectFromBank(f, count, { avoidIds: QP.Stats.recentQuestionIds() });
      if (!qs.length) return;
      var secs = 0;
      if (mode !== '0') {
        var mult = mode === 'relaxed' ? 2 : 1;
        secs = qs.reduce(function (s, q) { return s + (q.secs || 120); }, 0) * mult;
      }
      state.exam = QP.buildCustom({
        filter: f, count: count, seconds: secs || 36000,
        title: (f.cat ? (CAT_LABEL[f.cat[0]] || f.cat[0]) : 'Mixed') + ' Drill',
        subtitle: 'Topic drill', mode: 'drill', allowBack: true,
        instructions: mode === '0' ? 'Untimed practice.' : 'Timed at interview pace.'
      });
      state.exam.sections[0].questions = qs;
      state.exam.sections[0].answers = new Array(qs.length).fill(null);
      state.exam.sections[0].passPct = 60;
      go('exam');
    };
  }

  /* ==================================================================== */
  /*  SPEED TRAINER                                                       */
  /* ==================================================================== */
  function viewSpeed() {
    var h = '<h1>Speed Maths &amp; Sequences</h1>' +
      '<p class="sub">The arithmetic and pattern tests that gate the first round at Optiver, Akuna, Five Rings, IMC and Jane Street. Question mixes match each firm — Optiver includes fractions, Akuna does not, Jane Street leans on larger addition and subtraction.</p>';

    h += '<h2>Preset tests</h2><div class="grid c2">';
    var presets = [
      { t: 'Optiver 80 in 8', d: '80 questions, 8 minutes, +1/−1 scoring. Integers, decimals and fractions.', k: 'mm', p: 'optiver', n: 80, s: 480, neg: true },
      { t: 'Akuna 80 in 8', d: '80 questions, 8 minutes, +1/−1. No fractions.', k: 'mm', p: 'akuna', n: 80, s: 480, neg: true },
      { t: 'Jane Street arithmetic filter', d: '60 questions in 8 minutes, no negative marking.', k: 'mm', p: 'janestreet', n: 60, s: 480, neg: false },
      { t: 'Zetamac-style 2 minutes', d: 'Classic add/subtract/multiply/divide sprint.', k: 'mm', p: 'zetamac', n: 200, s: 120, neg: false },
      { t: 'Optiver NumberLogic', d: '26 sequences in 25 minutes, ramping difficulty.', k: 'seq', p: 'optiver', n: 26, s: 1500, neg: false },
      { t: 'Akuna sequences', d: '24 sequences in 12 minutes — about 30 seconds each.', k: 'seq', p: 'akuna', n: 24, s: 720, neg: false },
      { t: 'IMC combined paper', d: '24 mixed arithmetic and pattern questions in 18 minutes.', k: 'mix', p: 'imc', n: 24, s: 1080, neg: false },
      { t: 'SIG mental arithmetic', d: '25 questions in 10 minutes, including percentages.', k: 'mm', p: 'sig', n: 25, s: 600, neg: false }
    ];
    presets.forEach(function (p, i) {
      h += '<div class="card click" data-preset="' + i + '"><h3 style="margin-top:0">' + esc(p.t) + '</h3>' +
        '<div class="small muted">' + esc(p.d) + '</div>' +
        '<div class="row" style="margin-top:10px"><span class="pill">' + p.n + 'q</span>' +
        '<span class="pill">' + (p.s >= 60 ? mins(p.s) + ' min' : p.s + 's') + '</span>' +
        (p.neg ? '<span class="pill bad">+1 / −1</span>' : '') + '</div></div>';
    });
    h += '</div>';

    h += '<h2>Custom</h2><div class="card"><div class="grid c2" style="gap:16px">' +
      '<div><label class="small muted">Type</label><select id="ck">' +
      '<option value="mm">Mental arithmetic</option><option value="seq">Sequences</option>' +
      '<option value="mix">Mixed</option></select></div>' +
      '<div><label class="small muted">Question mix</label><select id="cp">' +
      '<option value="all">All types</option><option value="optiver">Optiver</option>' +
      '<option value="akuna">Akuna (no fractions)</option><option value="janestreet">Jane Street</option>' +
      '<option value="sig">SIG</option><option value="imc">IMC</option>' +
      '<option value="zetamac">Zetamac basic</option></select></div>' +
      '<div><label class="small muted">Questions</label><input type="number" id="cn" value="40" min="5" max="300"></div>' +
      '<div><label class="small muted">Minutes</label><input type="number" id="cs" value="4" min="1" max="60"></div>' +
      '</div><label class="row small muted" style="margin-top:12px;cursor:pointer">' +
      '<input type="checkbox" id="cneg" style="width:auto"> Negative marking (−1 per wrong answer)</label>' +
      '<div class="row" style="margin-top:14px"><button class="btn" id="cgo">Start</button></div></div>';

    app.innerHTML = h;

    $$('[data-preset]').forEach(function (c) {
      c.onclick = function () {
        var p = presets[parseInt(c.dataset.preset, 10)];
        launchSpeed(p.k, p.p, p.n, p.s, p.neg, p.t);
      };
    });
    $('#cgo').onclick = function () {
      launchSpeed($('#ck').value, $('#cp').value,
        parseInt($('#cn').value, 10) || 40,
        (parseInt($('#cs').value, 10) || 4) * 60,
        $('#cneg').checked, 'Custom Speed Test');
    };
  }

  function launchSpeed(kind, profile, n, secs, neg, title) {
    state.exam = QP.buildCustom({
      kind: kind, profile: profile, count: n, seconds: secs,
      negative: neg, allowBack: false, title: title, subtitle: 'Speed test', mode: 'speed',
      instructions: neg ? '+1 correct, −1 incorrect, 0 skipped.' : 'No negative marking — answer everything.'
    });
    go('exam');
  }

  /* ==================================================================== */
  /*  REVIEW QUEUE                                                        */
  /* ==================================================================== */
  function viewReview() {
    var queue = QP.Stats.reviewQueue(30);
    var weak = QP.Stats.weakAreas(2);

    var h = '<h1>Review</h1>' +
      '<p class="sub">Questions you have missed, prioritised by how often you got them wrong and how long ago you last saw them. Spacing matters more than volume — coming back to a missed question two days later is worth more than redoing it immediately.</p>';

    if (!queue.length) {
      h += '<div class="empty"><p>Nothing queued yet.</p>' +
        '<p class="small">Take an assessment or a drill, and anything you miss will collect here.</p>' +
        '<button class="btn" onclick="QPgo(\'firms\')" style="margin-top:14px">Take an assessment</button></div>';
      app.innerHTML = h;
      return;
    }

    h += '<div class="card"><div class="row between"><div><b>' + queue.length + ' questions</b> due for review' +
      '<div class="small muted">Drawn from your missed questions across all sessions</div></div>' +
      '<button class="btn" id="rgo">Start review session</button></div></div>';

    if (weak.length) {
      h += '<h2>Weakest sub-topics</h2><div class="card"><table>' +
        '<tr><th>Topic</th><th>Category</th><th class="num">Attempts</th><th class="num">Accuracy</th></tr>';
      weak.slice(0, 10).forEach(function (w) {
        h += '<tr><td>' + esc(w.sub) + '</td><td class="muted">' + esc(CAT_LABEL[w.cat] || w.cat) + '</td>' +
          '<td class="num">' + w.n + '</td>' +
          '<td class="num" style="color:' + pctColor(w.accuracy * 100) + '"><b>' + Math.round(w.accuracy * 100) + '%</b></td></tr>';
      });
      h += '</table></div>';
    }

    h += '<h2>In the queue</h2><div id="qlist"></div>';
    app.innerHTML = h;

    var lh = '';
    queue.forEach(function (q, i) {
      lh += '<div class="rev"><div class="rev-head" data-t="q' + i + '">' +
        '<div class="rev-mark muted">' + (i + 1) + '</div>' +
        '<div class="rev-q">' + esc(q.q.length > 160 ? q.q.slice(0, 160) + '…' : q.q) +
        '<div class="small muted" style="margin-top:4px">' + esc(CAT_LABEL[q.cat] || q.cat) +
        ' · ' + esc(q.sub) + ' · ' + ['Easy', 'Medium', 'Hard'][(q.diff || 1) - 1] + '</div></div></div>' +
        '<div class="rev-body hide" id="rb-q' + i + '"><div class="sol">' + esc(q.sol) + '</div></div></div>';
    });
    $('#qlist').innerHTML = lh;
    $$('.rev-head').forEach(function (hd) {
      hd.onclick = function () { var b = $('#rb-' + hd.dataset.t); if (b) b.classList.toggle('hide'); };
    });

    $('#rgo').onclick = function () {
      var qs = queue.slice(0, 15);
      state.exam = QP.buildCustom({
        count: qs.length, seconds: qs.reduce(function (s, q) { return s + (q.secs || 120); }, 0),
        title: 'Review Session', subtitle: 'Previously missed', mode: 'review', allowBack: true,
        instructions: 'Questions you have missed before.'
      });
      state.exam.sections[0].questions = qs;
      state.exam.sections[0].answers = new Array(qs.length).fill(null);
      go('exam');
    };
  }

  /* ==================================================================== */
  /*  ANALYTICS                                                           */
  /* ==================================================================== */
  function viewStats() {
    var s = QP.Stats.summary();
    var byCat = QP.Stats.byCategory();
    var hist = QP.Stats.history(20);
    var mm = QP.Stats.mmHistory(10);

    var h = '<h1>Analytics</h1><p class="sub">Everything is stored locally in this browser. Nothing is uploaded.</p>';

    h += '<div class="grid c4">' +
      statCard(s.exams, 'Tests taken') +
      statCard(s.questions, 'Questions graded') +
      statCard(s.accuracy == null ? '—' : Math.round(s.accuracy * 100) + '%', 'Accuracy') +
      statCard(s.streak, 'Day streak') +
      '</div>';

    var cats = Object.keys(byCat);
    if (cats.length) {
      h += '<h2>Performance by category</h2><div class="card"><table>' +
        '<tr><th>Category</th><th class="num">Attempts</th><th class="num">Correct</th><th>Accuracy</th></tr>';
      cats.sort(function (a, b) { return (byCat[a].accuracy || 0) - (byCat[b].accuracy || 0); });
      cats.forEach(function (c) {
        var a = byCat[c], p = a.accuracy == null ? 0 : a.accuracy * 100;
        h += '<tr><td>' + esc(CAT_LABEL[c] || c) + '</td>' +
          '<td class="num">' + (a.correct + a.wrong) + '</td>' +
          '<td class="num">' + a.correct + '</td>' +
          '<td style="width:220px"><div class="row"><div class="bar" style="flex:1"><i style="width:' + p +
          '%;background:' + pctColor(p) + '"></i></div>' +
          '<b style="font-family:var(--mono);min-width:44px;text-align:right;color:' + pctColor(p) + '">' +
          Math.round(p) + '%</b></div></td></tr>';
      });
      h += '</table></div>';

      /* Sub-topic detail */
      h += '<h2>Sub-topic detail</h2><div class="grid c2">';
      cats.forEach(function (c) {
        var subs = byCat[c].subs;
        var keys = Object.keys(subs).filter(function (k) { return subs[k].accuracy != null; });
        if (!keys.length) return;
        keys.sort(function (a, b) { return subs[a].accuracy - subs[b].accuracy; });
        h += '<div class="card"><h3 style="margin-top:0">' + esc(CAT_LABEL[c] || c) + '</h3>';
        keys.forEach(function (k) {
          var p = subs[k].accuracy * 100;
          h += '<div class="row between" style="padding:4px 0"><span class="small">' + esc(k) + '</span>' +
            '<span class="row" style="gap:8px"><span class="bar" style="width:70px;display:inline-block"><i style="width:' +
            p + '%;background:' + pctColor(p) + '"></i></span>' +
            '<b class="small" style="font-family:var(--mono);color:' + pctColor(p) + '">' + Math.round(p) + '%</b></span></div>';
        });
        h += '</div>';
      });
      h += '</div>';
    }

    if (mm.length) {
      h += '<h2>Market-making games</h2><div class="card"><table>' +
        '<tr><th>When</th><th>Session</th><th class="num">P&amp;L</th><th class="num">Fill rate</th>' +
        '<th class="num">Mid error</th><th class="num">Informed fills</th></tr>';
      mm.forEach(function (g) {
        h += '<tr><td class="muted small">' + fmtDate(g.when) + '</td><td>' + esc(g.firmName) + '</td>' +
          '<td class="num" style="color:' + (g.pnl >= 0 ? 'var(--good)' : 'var(--bad)') + '">' + g.pnl.toFixed(1) + '</td>' +
          '<td class="num">' + Math.round(g.fillRate * 100) + '%</td>' +
          '<td class="num">' + g.avgMidError.toFixed(2) + '</td>' +
          '<td class="num">' + Math.round(g.informedShare * 100) + '%</td></tr>';
      });
      h += '</table></div>';
    }

    if (hist.length) {
      h += '<h2>History</h2><div class="card"><table>' +
        '<tr><th>When</th><th>Test</th><th class="num">Score</th><th class="num">Time</th><th class="num">Result</th></tr>';
      hist.forEach(function (a) {
        h += '<tr><td class="muted small">' + fmtDate(a.when) + '</td>' +
          '<td>' + esc(a.firmName) + '<div class="small muted">' + esc(a.role || a.mode) + '</div></td>' +
          '<td class="num" style="color:' + pctColor(a.pct) + '"><b>' + Math.round(a.pct) + '%</b></td>' +
          '<td class="num muted">' + mins(a.elapsed) + 'm</td>' +
          '<td class="num"><span class="pill ' + (a.passedAll ? 'good' : 'bad') + '">' +
          (a.passedAll ? 'Pass' : 'Below') + '</span></td></tr>';
      });
      h += '</table></div>';
    }

    if (!s.exams && !mm.length) {
      h += '<div class="empty"><p>No data yet.</p><button class="btn" onclick="QPgo(\'firms\')">Take your first assessment</button></div>';
    }

    h += '<hr class="hr"><div class="row">' +
      '<button class="btn ghost sm" id="exp">Export data</button>' +
      '<button class="btn ghost sm" id="imp">Import data</button>' +
      '<button class="btn ghost sm" id="rst" style="color:var(--bad)">Reset all progress</button></div>' +
      '<input type="file" id="impf" class="hide" accept="application/json">';

    app.innerHTML = h;

    $('#exp').onclick = function () {
      var blob = new Blob([QP.Stats.exportJSON()], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'quant-practice-progress.json';
      a.click();
    };
    $('#imp').onclick = function () { $('#impf').click(); };
    $('#impf').onchange = function (e) {
      var f = e.target.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try { QP.Stats.importJSON(r.result); go('stats'); }
        catch (err) { alert('Could not import: ' + err.message); }
      };
      r.readAsText(f);
    };
    $('#rst').onclick = function () {
      if (confirm('Delete all saved progress? This cannot be undone.')) { QP.Stats.reset(); go('stats'); }
    };
  }

  /* ==================================================================== */
  /*  ABOUT                                                               */
  /* ==================================================================== */
  function viewAbout() {
    app.innerHTML = '<h1>About</h1>' +
      '<p class="sub">A self-contained quant interview trainer. No accounts, no network calls — all progress lives in this browser\'s local storage.</p>' +
      '<div class="card"><h3 style="margin-top:0">What is in here</h3><table>' +
      '<tr><th>Component</th><th class="num">Count</th></tr>' +
      '<tr><td>Curated questions with full worked solutions</td><td class="num">' + QP.BANK.length + '</td></tr>' +
      '<tr><td>Firm OA simulations</td><td class="num">' + QP.FIRMS.length + '</td></tr>' +
      '<tr><td>Multi-round interview simulations</td><td class="num">' + QP.INTERVIEWS.length + '</td></tr>' +
      '<tr><td>Generated arithmetic &amp; sequence questions</td><td class="num">unlimited</td></tr>' +
      '</table></div>' +
      '<div class="card" style="margin-top:14px"><h3 style="margin-top:0">On accuracy of the formats</h3>' +
      '<p class="small muted">Section structures, question counts, time limits and scoring rules follow publicly reported formats of each firm\'s assessment — for example Optiver\'s 80-question / 8-minute arithmetic test with +1/−1 scoring, Akuna\'s fraction-free variant, IMC\'s combined 24-question / 18-minute paper, and DRW\'s 6 questions in 45 minutes. Formats change between years and roles, so treat the timings as a faithful training target rather than a guarantee of what you will sit.</p>' +
      '<p class="small muted">Questions are written for this tool. They cover the canonical problem types that recur across quant interviews — many are classic puzzles in the public domain — rather than reproducing any provider\'s proprietary question text.</p></div>' +
      '<div class="card" style="margin-top:14px"><h3 style="margin-top:0">Answer formats accepted</h3>' +
      '<p class="small muted">Numeric answers accept integers, decimals, fractions (<code>3/8</code>), percentages (<code>25%</code>), scientific notation (<code>2e6</code>), constants (<code>pi</code>, <code>e</code>), and expressions (<code>1-(5/6)^4</code>, <code>sqrt(2)/2</code>). Estimation questions accept a wide band. Open-ended questions are self-graded against a model answer.</p></div>';
  }

  /* ==================================================================== */
  /*  BOOT                                                                */
  /* ==================================================================== */
  /* Intercept exam completion so interview rounds can chain. */
  var origResults = viewResults;
  viewResults = function () {
    var exam = state.exam;
    if (exam && exam.onDone && exam.mode === 'interview') {
      var score = QP.scoreExam(exam);
      QP.Stats.recordExam(exam, score, Math.round((Date.now() - exam.startedAt) / 1000));
      var done = exam.onDone;
      var h = '<h1>' + esc(exam.sections[0].name) + '</h1>' +
        '<div class="res-hero"><div><div class="res-score" style="color:' + pctColor(score.pct) + '">' +
        Math.round(score.pct) + '%</div><div class="small muted">' + score.correct + ' of ' +
        (score.total - score.review) + '</div></div>' +
        '<div style="flex:1;min-width:200px"><div class="res-verdict">Round complete</div>' +
        '<div class="small muted">Review your answers below, then continue.</div></div></div>' +
        '<h2>Review</h2><div id="reviewList"></div>' +
        '<div class="row" style="margin-top:20px"><button class="btn" id="cont">Continue interview →</button></div>';
      app.innerHTML = h;
      renderReviewList($('#reviewList'), exam, score);
      $('#cont').onclick = done;
      return;
    }
    origResults();
  };

  document.addEventListener('DOMContentLoaded', function () { go('home'); });
  if (document.readyState !== 'loading') go('home');
})();
