/* ==========================================================================
   Frankly Inspired — Leadership & Operations Health Score
   Scores four dimensions, each a simplified, cited slice of a named
   research framework rather than a generic HR checklist:
     - Governance          -> BoardSource, "Leading with Intent"
     - Succession/Bench    -> CompassPoint & Meyer Foundation, "Daring to Lead"
     - Alignment/Execution -> McKinsey Organizational Health Index (OHI)
     - Change Leadership   -> Kotter's 8-Step Change Model (HBS)
   Same gauge/banding structure as js/revenue-growth-score.js (Critical/At Risk/
   Stable/Strong/Resilient) for a consistent standard across both diagnostic
   tools. All scoring runs client-side; nothing is sent anywhere.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  var BAND_NAMES = ['Critical', 'At Risk', 'Stable', 'Strong', 'Resilient'];
  var BAND_SUBNAMES = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  var COMPOSITE_SUMMARY = [
    "Leadership and operational fundamentals need real attention. That's a common place to start, especially for younger or fast-growing organizations, but it's worth treating as the priority before adding new programs or commitments.",
    'There are real gaps in more than one dimension below. These are addressable with deliberate attention, not a full rebuild.',
    'The fundamentals are in place across most dimensions. The opportunity now is tightening the specific gaps below rather than a broad overhaul.',
    'This is a well-led, well-run organization by sector benchmarks. The focus shifts from fixing gaps to protecting and extending what already works.',
    'This organization shows genuine leadership and operational maturity relative to sector norms — the kind McKinsey’s research ties directly to outsized performance. The conversation now is strategic use of that strength.'
  ];

  // Each dimension: the 3 question names (matching the radio group "name"
  // attributes in leadership-health.html), the source it's drawn from, and
  // discussion points per band — written as advisory talking points, the
  // same standard as the Revenue & Growth Score.
  var DIMENSIONS = [
    {
      key: 'governance',
      label: 'Governance Health',
      questions: ['g1', 'g2', 'g3'],
      points: [
        "Board engagement is a significant gap right now. BoardSource's national research found nearly half of executives say their board isn't positioned to build trust with the community they serve — that's the first conversation to have with the board chair, not a full governance overhaul.",
        "There's a real disconnect between the board and the organization's strategic direction. National data shows only about a third of nonprofit boards are actively engaged in mission advocacy beyond fundraising and compliance — worth naming directly at the next board retreat.",
        "Governance is functional but has room to deepen. Worth checking whether board meeting time genuinely balances strategy against fundraising updates — BoardSource's research consistently finds boards that over-index on fundraising do so at the expense of strategic engagement.",
        "This board is more engaged than most — national benchmarks put the typical nonprofit board well behind this. Worth formalizing what's working into a written board engagement plan so it survives leadership transitions.",
        "This is governance strength most nonprofits don't have. The opportunity now is using board engagement as a real strategic asset, not just a compliance function."
      ]
    },
    {
      key: 'succession',
      label: 'Leadership Succession & Bench Strength',
      questions: ['s1', 's2', 's3'],
      points: [
        "Without a documented succession plan or a credible interim leader, this organization is one departure away from a real crisis. Only 17% of nonprofits nationally report a documented succession plan — building even a basic one is a high-leverage next step, not a someday project.",
        "There's some bench strength but real gaps remain. The research here is blunt: roughly three in four executive directors report they're likely to leave within five years, and burnout is driven specifically by weak boards, low investment in leadership development, and concentrated decision-making — worth naming which of those applies here.",
        "There's a credible interim path if leadership changed suddenly, which puts this organization ahead of most. Formalizing it in writing, with board sign-off, is what separates this from genuine resilience.",
        "Leadership development is a real, active practice here — genuinely uncommon in the sector. The next step is stress-testing it: could the plan survive an unplanned departure, not just a planned one?",
        "This is leadership bench strength most nonprofits lack entirely. Worth treating it as a retention and morale asset in its own right — staff who see a real development path tend to stay longer."
      ]
    },
    {
      key: 'alignment',
      label: 'Organizational Alignment & Execution',
      questions: ['a1', 'a2', 'a3'],
      points: [
        "When priorities, roles, and skills aren't clear or consistently reinforced, McKinsey's organizational health research — built on data from thousands of companies — consistently finds this is where performance gaps start. Direction clarity is usually the fastest lever to pull first.",
        "Alignment exists in pockets but isn't consistent across the organization. A simple test: ask three staff members at different levels what the top priority is this year, and see how closely the answers match.",
        "The organization has real alignment fundamentals in place. The opportunity is consistency — making sure accountability and skill-building keep pace as the organization grows or takes on new work.",
        "This is above-average organizational alignment. Worth protecting deliberately, since alignment tends to erode quietly during growth or leadership transitions if no one owns it explicitly.",
        "This is genuine organizational health, the kind McKinsey's research ties directly to outsized performance relative to peers. The conversation now is sustaining it, not building it."
      ]
    },
    {
      key: 'change',
      label: 'Change Leadership Capacity',
      questions: ['c1', 'c2', 'c3'],
      points: [
        "Kotter's research, based on over 100 organizational transformations, found most change efforts fail not from bad strategy but from skipping the groundwork — urgency, coalition, and a clear vision before asking people to change. That's worth revisiting before the next major initiative launches.",
        "Change tends to be announced rather than built toward. Visible short-term wins along the way, not just a distant end state, are one of the more overlooked steps in Kotter's model and often the easiest one to add immediately.",
        "The organization has real change capacity, though past changes haven't always stuck. Kotter's research points specifically to anchoring change in culture and systems as the step most often skipped — worth checking whether recent changes actually became 'how we operate' or quietly reverted.",
        "This organization leads change more deliberately than most. Kotter reports roughly 70% of change efforts succeed when the full model is actually followed — worth naming which steps are already instinctive here.",
        "This is genuine change leadership maturity. The opportunity now is using it as a real competitive advantage — the ability to adapt faster than peer organizations during funding shifts or sector change."
      ]
    }
  ];

  function bandIndexFromAvg(avgLikert) {
    // avgLikert is 1-5 across the dimension's 3 questions; map to a 0-100
    // scale, then band it on the same 20/40/60/80 cutoffs used everywhere
    // else on the site, so a "Stable" result means the same thing across
    // both diagnostic tools.
    var pct = ((avgLikert - 1) / 4) * 100;
    if (pct < 20) { return 0; }
    if (pct < 40) { return 1; }
    if (pct < 60) { return 2; }
    if (pct < 80) { return 3; }
    return 4;
  }

  var form = document.getElementById('lh-form');
  var status = document.getElementById('lh-status');
  var resultsEl = document.getElementById('lh-results');
  var metricsEl = document.getElementById('lh-metrics');

  /* ---------- Sticky progress bar (same pattern as assessment.js) ---------- */
  var progressEl = document.getElementById('lh-progress');
  var progressLabel = document.getElementById('lh-progress-label');
  var progressFill = document.getElementById('lh-progress-fill');
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

  function renderResults() {
    var results = DIMENSIONS.map(function (d) {
      var scores = d.questions.map(function (q) { return questionScore(q, form); });
      var avg = scores.reduce(function (a, b) { return a + b; }, 0) / scores.length;
      var bandIdx = bandIndexFromAvg(avg);
      return { dimension: d, avg: avg, bandIdx: bandIdx, pct: Math.round(((avg - 1) / 4) * 100) };
    });

    var composite = Math.round(results.reduce(function (sum, r) { return sum + r.pct; }, 0) / results.length);
    var compositeBand = composite < 20 ? 0 : composite < 40 ? 1 : composite < 60 ? 2 : composite < 80 ? 3 : 4;

    var needle = document.getElementById('lh-needle');
    if (needle) { needle.setAttribute('transform', 'rotate(' + ((composite / 100) * 180 - 90) + ',100,100)'); }

    document.getElementById('lh-gauge-score').textContent = composite;
    document.getElementById('lh-gauge-band-name').textContent = BAND_NAMES[compositeBand] + ' (' + BAND_SUBNAMES[compositeBand] + ')';
    document.getElementById('lh-summary').textContent = COMPOSITE_SUMMARY[compositeBand];

    // Saved so the Organizational Sustainability Score tool can pull this
    // in as the "Operational Capacity" leg of its Strategic Triangle view,
    // if this visitor has completed both tools in the same browser. Stays
    // entirely on-device, same as every other calculation on this page.
    try {
      localStorage.setItem('fi_leadership_score', JSON.stringify({ score: composite, band: compositeBand, at: Date.now() }));
    } catch (e) { /* localStorage unavailable (private browsing, etc.) — non-fatal */ }

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

    var recommendationEl = document.getElementById('lh-recommendation');
    if (recommendationEl) {
      var recommendedTier = compositeBand <= 1 ? 'implementation' : 'advisory';
      var tierName = compositeBand <= 1 ? 'Strategic Implementation Retainer' : 'Strategic Advisory Retainer';
      var tierReason = compositeBand <= 1
        ? 'with gaps across more than one leadership or operational dimension, hands-on weekly implementation tends to build capacity faster than periodic advisory alone.'
        : 'with solid-to-strong leadership fundamentals already in place, experienced strategic guidance is usually enough to sharpen and protect them further.';
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

  var retakeBtn = document.getElementById('lh-retake');
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
