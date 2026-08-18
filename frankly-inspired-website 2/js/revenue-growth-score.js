/* ==========================================================================
   Frankly Inspired — Revenue & Growth Score
   (Renamed from "Financial Health Score" to align with the Revenue & Growth
   service pillar — donor stewardship and retention, fundraising strategy,
   grant and public-funding strategy, revenue-pipeline design, and the
   cross-sector partnerships that sustain them. The underlying math is
   unchanged: reserve depth, spending mix, revenue concentration, and
   liquidity are the concrete numbers that determine how much room an
   organization actually has to invest in fundraising and revenue-pipeline
   growth, so they're the right diagnostic for this pillar even though two
   of the four ratios are standard balance-sheet metrics rather than
   fundraising metrics themselves.)

   Computes four standard nonprofit financial ratios from user-entered budget
   figures and bands each one (Poor/Fair/Good/Very Good/Excellent, framed
   like a credit score) against real, cited sector benchmarks. All math runs
   client-side; nothing entered on this page is sent anywhere.

   Benchmark sources (see also the Sources line in the results):
   - Operating Reserve Ratio: NORI Workgroup (3-month/25% minimum floor);
     Propel Nonprofits (6-12 months = "good shape"); Nonprofit Finance Fund
     2025 survey (52% of nonprofits report 3 months or less on hand).
   - Program Expense Ratio: BBB Wise Giving Alliance (65%+ recommended, 35%
     overhead ceiling); Charity Navigator (70%+ = full credit as of its 2023
     methodology update, which also explicitly warns against over-indexing
     on this single number — reflected in the "Excellent" band copy below).
   - Revenue Concentration: multiple sources cite >30% from one source as
     high risk; stricter guidance recommends no single funder/grant exceed
     15-20%. This tool treats LOWER concentration as healthier — it's the
     metric most directly tied to donor stewardship, retention, and
     revenue-pipeline diversification.
   - Current Ratio: 1.0 = technically solvent; 1.5+ is the commonly cited
     target for well-run organizations to absorb payment delays or seasonal
     dips.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  var BAND_NAMES = ['Critical', 'At Risk', 'Stable', 'Strong', 'Resilient'];
  var BAND_SUBNAMES = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  var BAND_SCORES = [10, 30, 50, 70, 90]; // midpoint of each quintile, used for the gauge

  var COMPOSITE_SUMMARY = [
    "This organization's core revenue and growth indicators point to real near-term risk. That's not unusual, especially for younger or fast-growing organizations, but it does mean stabilizing the revenue base — through donor stewardship, retention, and a more diversified fundraising pipeline — is worth prioritizing before taking on major new growth commitments.",
    'The revenue foundation has real gaps in more than one area below. These are addressable, but likely need a deliberate fundraising and revenue-diversification strategy rather than incremental fixes alone.',
    'The organization meets or is close to commonly cited minimums across most indicators. The opportunity now is tightening up the specific revenue and growth gaps below — through targeted donor stewardship or partnership development — rather than an overall rebuild.',
    'This is a financially healthy organization with real revenue growth capacity by sector benchmarks. The focus shifts from stabilization to strategically deploying that strength into new revenue-pipeline or partnership opportunities.',
    'This organization is in a genuinely strong revenue and growth position relative to sector norms. The conversation here is about strategic use of that strength — new partnerships, program growth, or expanded fundraising ambition — not risk mitigation.'
  ];

  // Each metric: how to compute it, the band boundaries, whether lower
  // values are better ("invert"), a formatter for display, and discussion
  // points per band — written as talking points for an advisory
  // conversation, not just visitor-facing description text.
  var METRICS = [
    {
      key: 'reserve',
      label: 'Operating Reserve',
      unit: 'months',
      compute: function (v) {
        var monthlyExpenses = v.totalExpenses / 12;
        return monthlyExpenses > 0 ? v.cash / monthlyExpenses : 0;
      },
      thresholds: [3, 6, 9, 12], // months
      invert: false,
      format: function (n) { return n.toFixed(1) + ' months'; },
      points: [
        "With less than 3 months of reserves, an unexpected revenue gap or major expense could put core operations at risk. Start with a reserve policy and a modest, automatic monthly transfer — even a small one — rather than waiting for a surplus year.",
        "3-6 months is a common starting point but still below the minimum most funders and lenders look for. Building toward 6 months should be an explicit budget line item next cycle, not an afterthought.",
        "6-9 months meets the commonly cited minimum threshold. The next step is formalizing a reserve policy, if one doesn't exist, that defines when reserves can be used and how they get replenished.",
        "9-12 months puts this organization ahead of most peers — over half of nonprofits report 3 months or less on hand. Worth revisiting the dollar target periodically as the budget grows.",
        "A reserve at this level is a real strategic asset. The conversation shifts from building it to clarifying what it's actually for, so it doesn't quietly become an unplanned budget cushion."
      ]
    },
    {
      key: 'program',
      label: 'Program Expense Ratio',
      unit: 'percent',
      compute: function (v) {
        return v.totalExpenses > 0 ? (v.programExpenses / v.totalExpenses) * 100 : 0;
      },
      thresholds: [65, 70, 80, 85], // percent
      invert: false,
      format: function (n) { return Math.round(n) + '%'; },
      points: [
        "Below 65% program spending is under what most funders and watchdog groups look for. Before cutting overhead reflexively, check whether shared costs (rent, IT, a portion of leadership time) are being allocated to programs at all — this ratio is often understated by a simple cost-allocation gap, not actual overspending.",
        "65-70% is close to the commonly cited minimum but leaves little room. Confirm cost allocation methodology first; if it's already accurate, look at which administrative costs are truly fixed versus which could shift as the budget grows.",
        "70-80% is a healthy, defensible range for most program types.",
        "80-85% is strong. Worth a periodic check that infrastructure and staff development aren't being under-invested in pursuit of a high ratio — the 'overhead myth' cuts both ways.",
        "85%+ sounds ideal but can also signal under-investment in the infrastructure that sustains program quality long-term. Charity Navigator itself moved away from over-weighting this single number in 2023 for that reason — worth discussing whether this reflects real efficiency or an under-resourced back office."
      ]
    },
    {
      key: 'concentration',
      label: 'Revenue Diversification',
      unit: 'percent',
      compute: function (v) {
        return v.totalRevenue > 0 ? (v.topSource / v.totalRevenue) * 100 : 0;
      },
      thresholds: [50, 35, 25, 15], // percent — invert: lower is better
      invert: true,
      format: function (n) { return Math.round(n) + '% concentration'; },
      points: [
        "Over 50% of revenue from one source is high-risk by every commonly cited benchmark — losing that single funder would be an existential event, not a budget problem. Revenue-pipeline design and donor stewardship should be the top-priority conversation on this page.",
        "35-50% concentration exceeds the widely cited 30% risk threshold. Diversifying through donor retention, expanded fundraising strategy, or new cross-sector partnerships should be an active priority, not a someday goal — donor stewardship is often the fastest lever, since it compounds over years rather than requiring a whole new funding relationship.",
        "25-35% is close to the commonly cited risk threshold. Worth tracking this ratio annually and continuing to build out a broader revenue pipeline — new partnerships, grant sources, or donor segments — so it doesn't drift upward unnoticed as the top funder's support grows alongside everything else.",
        "15-25% is a solid diversification position, near the stricter single-funder guidance some sources recommend — a sign that fundraising strategy and partnership development are already paying off.",
        "Under 15% from any single source is a strong, resilient revenue base built on real diversification — well-positioned to weather the loss of any one funder without an existential budget crisis."
      ]
    },
    {
      key: 'liquidity',
      label: 'Current Ratio (Liquidity)',
      unit: 'ratio',
      compute: function (v) {
        return v.currentLiabilities > 0 ? v.currentAssets / v.currentLiabilities : 0;
      },
      thresholds: [1.0, 1.5, 2.0, 3.0],
      invert: false,
      format: function (n) { return n.toFixed(2); },
      points: [
        "Below 1.0, current liabilities exceed current assets — short-term obligations may not be coverable without a cash crunch. Rolling monthly cash flow forecasting is the first move, before any longer-term fix.",
        "1.0-1.5 is technically solvent but thin. A single delayed grant payment or a slow month could create real strain — worth building toward the 1.5+ range most well-run organizations target.",
        "1.5-2.0 is the range most well-run nonprofits target for day-to-day resilience.",
        "2.0-3.0 gives real breathing room against delayed payments or seasonal revenue dips.",
        "Above 3.0 is a very strong liquidity position. Worth checking whether some of that short-term cash could be better deployed — into the operating reserve specifically, or toward new revenue-growth investment — rather than sitting idle."
      ]
    }
  ];

  function bandIndexFor(value, thresholds, invert) {
    var t = thresholds;
    if (!invert) {
      if (value < t[0]) { return 0; }
      if (value < t[1]) { return 1; }
      if (value < t[2]) { return 2; }
      if (value < t[3]) { return 3; }
      return 4;
    }
    if (value > t[0]) { return 0; }
    if (value > t[1]) { return 1; }
    if (value > t[2]) { return 2; }
    if (value > t[3]) { return 3; }
    return 4;
  }

  function compositeBandIndex(score) {
    if (score < 20) { return 0; }
    if (score < 40) { return 1; }
    if (score < 60) { return 2; }
    if (score < 80) { return 3; }
    return 4;
  }

  var form = document.getElementById('rg-form');
  var status = document.getElementById('rg-status');
  var resultsEl = document.getElementById('rg-results');
  var metricsEl = document.getElementById('rg-metrics');

  function getNum(id) {
    var el = document.getElementById(id);
    return el ? Number(el.value) : 0;
  }

  function renderResults() {
    var v = {
      cash: getNum('rg-cash'),
      totalExpenses: getNum('rg-total-expenses'),
      programExpenses: getNum('rg-program-expenses'),
      totalRevenue: getNum('rg-total-revenue'),
      topSource: getNum('rg-top-source'),
      currentAssets: getNum('rg-current-assets'),
      currentLiabilities: getNum('rg-current-liabilities'),
    };

    var results = METRICS.map(function (m) {
      var rawValue = m.compute(v);
      var bandIdx = bandIndexFor(rawValue, m.thresholds, m.invert);
      return {
        metric: m,
        rawValue: rawValue,
        bandIdx: bandIdx,
        score: BAND_SCORES[bandIdx],
      };
    });

    var composite = Math.round(results.reduce(function (sum, r) { return sum + r.score; }, 0) / results.length);
    var compositeBand = compositeBandIndex(composite);

    // Gauge needle: -90deg (score 0, far left) to +90deg (score 100, far right)
    var needle = document.getElementById('rg-needle');
    if (needle) { needle.setAttribute('transform', 'rotate(' + ((composite / 100) * 180 - 90) + ',100,100)'); }

    document.getElementById('rg-gauge-score').textContent = composite;
    document.getElementById('rg-gauge-band-name').textContent = BAND_NAMES[compositeBand] + ' (' + BAND_SUBNAMES[compositeBand] + ')';
    document.getElementById('rg-summary').textContent = COMPOSITE_SUMMARY[compositeBand];

    // Saved so the Organizational Sustainability Score tool can pull this
    // in as the "Legitimacy & Support" leg of its Strategic Triangle view,
    // if this visitor has completed both tools in the same browser. Stays
    // entirely on-device, same as every other calculation on this page.
    // Key renamed from 'fi_financial_score' when this tool was renamed —
    // see js/sustainability-score.js, which reads this same key.
    try {
      localStorage.setItem('fi_revenue_growth_score', JSON.stringify({ score: composite, band: compositeBand, at: Date.now() }));
    } catch (e) { /* localStorage unavailable (private browsing, etc.) — non-fatal */ }

    metricsEl.innerHTML = '';
    results.forEach(function (r) {
      var row = document.createElement('div');
      row.className = 'fh-metric-row fh-band-' + r.bandIdx;
      row.innerHTML =
        '<div class="fh-metric-head">' +
          '<span class="fh-metric-label">' + r.metric.label + '</span>' +
          '<span class="fh-metric-value">' + r.metric.format(r.rawValue) + ' &middot; ' + BAND_SUBNAMES[r.bandIdx] + '</span>' +
        '</div>' +
        '<span class="fh-metric-track"><span class="fh-metric-fill" style="width:' + r.score + '%"></span></span>' +
        '<p class="fh-metric-points">' + r.metric.points[r.bandIdx] + '</p>';
      metricsEl.appendChild(row);
    });

    var recommendationEl = document.getElementById('rg-recommendation');
    if (recommendationEl) {
      var recommendedTier = compositeBand <= 1 ? 'implementation' : 'advisory';
      var tierName = compositeBand <= 1 ? 'Strategic Implementation Retainer' : 'Strategic Advisory Retainer';
      var tierReason = compositeBand <= 1
        ? 'with revenue and growth gaps across more than one area, hands-on weekly implementation — including donor stewardship, revenue-pipeline design, and partnership development — tends to stabilize things faster than periodic advisory alone.'
        : 'with a stable-to-strong revenue and growth foundation, experienced strategic guidance is usually enough to sharpen fundraising strategy and protect that strength further.';
      recommendationEl.innerHTML =
        '<h3 class="subhead">Recommended Starting Point</h3>' +
        '<p>Based on these numbers, the <strong>' + tierName + '</strong> is likely the best fit — ' + tierReason + '</p>' +
        '<a class="btn btn-secondary" href="index.html#pricing-' + recommendedTier + '">See This Retainer</a>';
    }

    form.hidden = true;
    resultsEl.hidden = false;
    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        if (status) { status.textContent = 'Please fill in every figure — one is still missing.'; }
        return;
      }
      status.textContent = '';
      renderResults();
    });
  }

  var retakeBtn = document.getElementById('rg-retake');
  if (retakeBtn) {
    retakeBtn.addEventListener('click', function () {
      resultsEl.hidden = true;
      form.hidden = false;
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

});
