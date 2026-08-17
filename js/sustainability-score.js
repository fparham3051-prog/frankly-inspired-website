/* ==========================================================================
   Frankly Inspired — Organizational Sustainability Score
   Scores four dimensions grounded in named research (see leadership-health.js
   and financial-health.js for the same standard applied to those tools):
     - Strategic Clarity & Public Value  -> Mark Moore's Strategic Triangle
       (Harvard Kennedy School)
     - Risk Identification & Management  -> COSO Enterprise Risk Management
       Framework
     - Impact & Financial Integration    -> The Matrix Map / "dual bottom
       line" model (Bell, Masaoka & Zimmerman)
     - Roadmap & Implementation Discipline -> The Balanced Scorecard
       (Kaplan & Norton, Harvard Business School)

   What's different here: Moore's Strategic Triangle is used as the results
   page's organizing frame, and pulls in this visitor's saved Financial
   Health Score (fi_financial_score) and Leadership & Operations Score
   (fi_leadership_score) from localStorage — same browser only, nothing
   sent anywhere — so a visitor who's completed all three tools gets a
   genuinely blended view instead of three disconnected numbers.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  var BAND_NAMES = ['Critical', 'At Risk', 'Stable', 'Strong', 'Resilient'];
  var BAND_SUBNAMES = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  var COMPOSITE_SUMMARY = [
    'Strategy, risk management, and execution discipline all need real attention right now. That is a common starting point, but it means stabilizing the fundamentals below should come before any major new initiative.',
    'There are real gaps in more than one dimension below. These are addressable with deliberate attention, not a full strategic overhaul.',
    'The fundamentals are in place across most dimensions. The opportunity now is tightening the specific gaps below rather than a broad rebuild.',
    'This is a well-run, strategically disciplined organization by sector benchmarks. The focus shifts from fixing gaps to protecting and extending what already works.',
    'This organization shows genuine strategic and organizational maturity relative to sector norms. The conversation now is strategic use of that strength, not stabilization.'
  ];

  var DIMENSIONS = [
    {
      key: 'strategy',
      label: 'Strategic Clarity & Public Value',
      questions: ['st1', 'st2', 'st3'],
      points: [
        "Without clear agreement on what value the organization creates and for whom, every other strategic decision gets harder. Harvard Kennedy School's public value framework treats this as the starting point of strategy, not an afterthought — worth revisiting before any new planning process begins.",
        "There's a strategy on paper, but it may not be legible to the people executing it day to day. If staff and board can't restate the top 2-3 priorities in similar terms, the strategy isn't yet functioning as a real decision-making tool.",
        "Strategic priorities are reasonably clear. The next step is testing whether they're actually driving resource allocation decisions, not just living in a planning document.",
        "This is a well-articulated strategic direction. Worth checking it's been communicated deeply enough that mid-level staff, not just leadership, could explain it.",
        "This is genuine strategic clarity — mission, priorities, and the value the organization creates are well understood. That clarity is a real asset when hard tradeoff decisions come up."
      ]
    },
    {
      key: 'risk',
      label: 'Risk Identification & Management',
      questions: ['r1', 'r2', 'r3'],
      points: [
        "There's no real system for identifying risk before it becomes a crisis. The COSO framework — the world's most widely used risk management standard — starts with something as simple as a written risk register. That's a realistic first step, not a full enterprise risk program.",
        "Some risks are known, but likely informally, living in people's heads rather than a shared document. Formalizing even a short list of the top 5-10 risks, reviewed twice a year, closes most of this gap.",
        "Risk awareness exists. The next step is regularity — COSO's framework treats risk assessment as an ongoing practice, not a one-time exercise done during a crisis or a grant application.",
        "Risk management is a genuine practice here, ahead of most peer organizations. Worth checking whether it covers reputational and strategic risk, not just financial and operational.",
        "This is mature risk management by any sector's standard. The opportunity now is using it proactively in strategic decisions, not just defensively."
      ]
    },
    {
      key: 'integration',
      label: 'Impact & Financial Sustainability Integration',
      questions: ['i1', 'i2', 'i3'],
      points: [
        "Programs are likely being evaluated on mission fit alone, without a clear view of what each one costs relative to what it brings in. The nonprofit sector's own 'dual bottom line' research (Bell, Masaoka & Zimmerman) is built specifically around this blind spot — it's common, and addressable.",
        "There's some awareness of which programs are financially strained, but it may not be driving real decisions yet. Mapping every program on impact versus financial contribution, even roughly, usually surfaces at least one uncomfortable but necessary conversation.",
        "The organization has a reasonable read on which programs carry their financial weight and which don't. The next step is making that explicit enough to guide next year's resource allocation, not just this year's awareness.",
        "This is a genuinely integrated view of impact and financial sustainability — most organizations only track one side. Worth revisiting periodically, since a program's position shifts as funding and costs change.",
        "This is the dual-bottom-line thinking the sector's own sustainability research holds up as the goal. The opportunity now is using it explicitly in every major resource decision, not just strategic planning season."
      ]
    },
    {
      key: 'roadmap',
      label: 'Roadmap & Implementation Discipline',
      questions: ['e1', 'e2', 'e3'],
      points: [
        "Harvard's Robert Kaplan has found that roughly 90% of strategies fail not because the strategy itself was wrong, but because of poor execution. Without a roadmap that translates priorities into tracked initiatives, that's the most likely outcome here too — worth treating execution as its own discipline, separate from planning.",
        "There's a plan, but it may not be connected to what actually gets tracked day to day. The Balanced Scorecard's core insight is that what gets measured regularly is what gets done — worth checking whether the strategic plan and the metrics anyone actually looks at monthly are the same document.",
        "There's a real connection between strategy and execution. The next step is cadence — a regular, ideally quarterly, review of progress against the roadmap, not just an annual check-in.",
        "Implementation discipline here is ahead of most organizations, which per Kaplan's research puts this organization in a small minority that actually executes what it plans.",
        "This is genuine strategy-to-execution discipline — rare enough that it's a real competitive advantage, not just good practice."
      ]
    }
  ];

  function bandIndexFromPct(pct) {
    if (pct < 20) { return 0; }
    if (pct < 40) { return 1; }
    if (pct < 60) { return 2; }
    if (pct < 80) { return 3; }
    return 4;
  }

  function readSavedScore(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) { return null; }
      var parsed = JSON.parse(raw);
      if (typeof parsed.score !== 'number') { return null; }
      return parsed;
    } catch (e) {
      return null;
    }
  }

  var form = document.getElementById('ss-form');
  var status = document.getElementById('ss-status');
  var resultsEl = document.getElementById('ss-results');
  var metricsEl = document.getElementById('ss-metrics');
  var triangleEl = document.getElementById('ss-triangle');

  /* ---------- Sticky progress bar (same pattern as the other two tools) ---------- */
  var progressEl = document.getElementById('ss-progress');
  var progressLabel = document.getElementById('ss-progress-label');
  var progressFill = document.getElementById('ss-progress-fill');
  var pillarGroups = document.querySelectorAll('.pillar-group[data-pillar-index]');
  var dimensionLabelByIndex = {};
  DIMENSIONS.forEach(function (d, i) { dimensionLabelByIndex[i + 1] = d.label; });

  if (progressEl && progressLabel && progressFill && pillarGroups.length && 'IntersectionObserver' in window) {
    var progressObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var idx = Number(entry.target.getAttribute('data-pillar-index'));
          progressLabel.textContent = 'Section ' + idx + ' of ' + pillarGroups.length + ' — ' + (dimensionLabelByIndex[idx] || '');
          progressFill.style.width = (idx / pillarGroups.length * 100) + '%';
        }
      });
    }, { rootMargin: '-15% 0px -70% 0px' });
    pillarGroups.forEach(function (group) { progressObserver.observe(group); });
  }

  function questionScore(name, formEl) {
    var checked = formEl.querySelector('input[name="' + name + '"]:checked');
    return checked ? Number(checked.value) : 0;
  }

  function renderTriangle(strategyPct, strategyBand) {
    var financial = readSavedScore('fi_financial_score');
    var leadership = readSavedScore('fi_leadership_score');

    var legs = [
      {
        title: 'Public Value & Strategy',
        note: 'From this tool',
        score: strategyPct,
        band: strategyBand,
        available: true,
      },
      {
        title: 'Operational Capacity',
        note: leadership ? 'From your Leadership & Operations Score' : null,
        score: leadership ? leadership.score : null,
        band: leadership ? leadership.band : null,
        available: !!leadership,
        cta: { href: 'leadership-health.html', label: 'Take the Leadership & Operations Score' },
      },
      {
        title: 'Legitimacy & Support',
        note: financial ? 'From your Financial Health Score' : null,
        score: financial ? financial.score : null,
        band: financial ? financial.band : null,
        available: !!financial,
        cta: { href: 'financial-health.html', label: 'Take the Financial Health Score' },
      },
    ];

    triangleEl.innerHTML = '';
    legs.forEach(function (leg) {
      var card = document.createElement('div');
      if (leg.available) {
        card.className = 'fh-metric-row fh-band-' + leg.band;
        card.innerHTML =
          '<div class="fh-metric-head">' +
            '<span class="fh-metric-label">' + leg.title + '</span>' +
            '<span class="fh-metric-value">' + leg.score + '% &middot; ' + BAND_SUBNAMES[leg.band] + '</span>' +
          '</div>' +
          '<span class="fh-metric-track"><span class="fh-metric-fill" style="width:' + leg.score + '%"></span></span>' +
          '<p class="fh-metric-points">' + leg.note + '.</p>';
      } else {
        card.className = 'fh-metric-row';
        card.innerHTML =
          '<div class="fh-metric-head">' +
            '<span class="fh-metric-label">' + leg.title + '</span>' +
            '<span class="fh-metric-value">Not yet completed</span>' +
          '</div>' +
          '<p class="fh-metric-points">This leg isn\'t part of the score below yet. <a class="link-more" href="' + leg.cta.href + '">' + leg.cta.label + '</a> to include it.</p>';
      }
      triangleEl.appendChild(card);
    });

    return { financial: financial, leadership: leadership };
  }

  function renderResults() {
    var results = DIMENSIONS.map(function (d) {
      var scores = d.questions.map(function (q) { return questionScore(q, form); });
      var avg = scores.reduce(function (a, b) { return a + b; }, 0) / scores.length;
      var pct = Math.round(((avg - 1) / 4) * 100);
      return { dimension: d, pct: pct, bandIdx: bandIndexFromPct(pct) };
    });

    var strategyPct = Math.round(results.reduce(function (sum, r) { return sum + r.pct; }, 0) / results.length);
    var strategyBand = bandIndexFromPct(strategyPct);

    var triangleData = renderTriangle(strategyPct, strategyBand);

    // Composite blends whichever of the three legs are available — just
    // this tool's own score if the other two haven't been taken, or a true
    // three-way blend if they have.
    var legScores = [strategyPct];
    if (triangleData.leadership) { legScores.push(triangleData.leadership.score); }
    if (triangleData.financial) { legScores.push(triangleData.financial.score); }
    var composite = Math.round(legScores.reduce(function (a, b) { return a + b; }, 0) / legScores.length);
    var compositeBand = bandIndexFromPct(composite);

    var needle = document.getElementById('ss-needle');
    if (needle) { needle.setAttribute('transform', 'rotate(' + ((composite / 100) * 180 - 90) + ',100,100)'); }

    document.getElementById('ss-gauge-score').textContent = composite;
    document.getElementById('ss-gauge-band-name').textContent = BAND_NAMES[compositeBand] + ' (' + BAND_SUBNAMES[compositeBand] + ')';
    var summaryPrefix = legScores.length === 3
      ? 'Blended from all three tools — strategy, financial health, and leadership capacity. '
      : 'Based on this tool alone so far (' + (3 - legScores.length) + ' of 3 legs of the Strategic Triangle not yet completed). ';
    document.getElementById('ss-summary').textContent = summaryPrefix + COMPOSITE_SUMMARY[compositeBand];

    metricsEl.innerHTML = '';
    results.forEach(function (r) {
      var row = document.createElement('div');
      row.className = 'fh-metric-row fh-band-' + r.bandIdx;
      row.innerHTML =
        '<div class="fh-metric-head">' +
          '<span class="fh-metric-label">' + r.dimension.label + '</span>' +
          '<span class="fh-metric-value">' + r.pct + '% &middot; ' + BAND_SUBNAMES[r.bandIdx] + '</span>' +
        '</div>' +
        '<span class="fh-metric-track"><span class="fh-metric-fill" style="width:' + r.pct + '%"></span></span>' +
        '<p class="fh-metric-points">' + r.dimension.points[r.bandIdx] + '</p>';
      metricsEl.appendChild(row);
    });

    var recommendationEl = document.getElementById('ss-recommendation');
    if (recommendationEl) {
      var recommendedTier = compositeBand <= 1 ? 'implementation' : 'advisory';
      var tierName = compositeBand <= 1 ? 'Strategic Implementation Retainer' : 'Strategic Advisory Retainer';
      var tierReason = compositeBand <= 1
        ? 'with gaps across strategy, risk, or execution, hands-on weekly implementation tends to build the missing fundamentals faster than periodic advisory alone.'
        : 'with solid-to-strong strategic fundamentals already in place, experienced strategic guidance is usually enough to sharpen and protect them further.';
      recommendationEl.innerHTML =
        '<h3 class="subhead">Recommended Starting Point</h3>' +
        '<p>Based on these results, the <strong>' + tierName + '</strong> is likely the best fit — ' + tierReason + '</p>' +
        '<a class="btn btn-secondary" href="index.html#pricing-' + recommendedTier + '">See This Retainer</a>';
    }

    form.hidden = true;
    if (progressEl) { progressEl.hidden = true; }
    resultsEl.hidden = false;
    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        if (status) { status.textContent = 'Please answer every question — one is still missing.'; }
        return;
      }
      status.textContent = '';
      renderResults();
    });
  }

  var retakeBtn = document.getElementById('ss-retake');
  if (retakeBtn) {
    retakeBtn.addEventListener('click', function () {
      resultsEl.hidden = true;
      form.hidden = false;
      if (progressEl) {
        progressEl.hidden = false;
        progressLabel.textContent = 'Section 1 of ' + pillarGroups.length + ' — ' + (DIMENSIONS[0] ? DIMENSIONS[0].label : '');
        progressFill.style.width = (100 / pillarGroups.length) + '%';
      }
      form.reset();
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

});
