// Shared end-of-results pathway for all five free tools, so every tool
// finishes the same way:
//   1. Likely constraint: the lowest area, flagged even when the overall
//      score looks healthy (InstitutionalOS rule: a weak spot can't hide
//      behind a strong average).
//   2. One specific thing to do in the next 90 days, free.
//   3. What this tool can't tell you: the honest limit of a self-rating,
//      which is what the paid diagnostic verifies.
//   4. Recommended next step: the InstitutionalOS Diagnostic for the
//      visitor's stage (Build / Fund / Sustain), with its price.
// The stage is asked here, in the results, and remembered across tools in
// this browser (localStorage key fi_stage). Nothing leaves the browser.

import { profileTeaserHtml } from './healthEngine';
import { triggerRecHtml } from './trigger';

export type StageKey = 'build' | 'fund' | 'sustain';

export const STAGES: Record<StageKey, { name: string; full: string; price: string; question: string }> = {
  build: { name: 'Build', full: 'Formation Readiness', price: '$2,000', question: 'Forming or recently launched' },
  fund: { name: 'Fund', full: 'Grant Readiness', price: '$2,500', question: 'Preparing to win grants or major funding' },
  sustain: { name: 'Sustain', full: 'Institutional Durability', price: '$2,500', question: 'Established and want to last' },
};

const STAGE_KEY = 'fi_stage';

export function getStage(): StageKey | null {
  try {
    const v = localStorage.getItem(STAGE_KEY);
    return v === 'build' || v === 'fund' || v === 'sustain' ? v : null;
  } catch {
    return null;
  }
}

function setStage(s: StageKey) {
  try { localStorage.setItem(STAGE_KEY, s); } catch { /* storage unavailable: still works for this page */ }
}

// One concrete, research-grounded 90-day action per area, keyed by the
// exact area label each tool uses.
const ACTIONS: Record<string, string> = {
  // Self-assessment pillars
  'Sustainability Strategy': 'Hold a 90-minute session with your board chair and two senior staff to agree your top three priorities for the next 12 months, in writing. For the rest of the quarter, test every new request or opportunity against those three.',
  'Revenue Diversification': "List every revenue source with its share of last year's revenue. If any single source is above 30%, the commonly cited risk threshold, set a goal to open two funding conversations outside that source this quarter.",
  'Leadership & Organizational Development': 'Write a one-page role card for each senior position: its purpose, the decisions it owns, and three measures of success. Review each one in that person’s next check-in.',
  'Operations & Infrastructure': 'Choose five numbers leadership will look at every month, such as cash on hand, people served, and donor retention, and put them on a single page reviewed at each leadership meeting.',
  'Partnership & Ecosystem Strategy': 'List your ten most important partners and mark each as formal, informal, or one-off. Formalize your two most important informal partnerships with a simple memorandum of understanding.',
  'Program & Impact Evidence': 'Draft a one-page logic model for your largest program: inputs, activities, outputs, and the two or three outcomes you expect. Then pick one outcome and start measuring it with every participant this quarter.',
  'Governance & Risk': "Pull your last filed Form 990 and check Part VI. Adopt any missing core policy (conflict of interest, whistleblower, document retention), and put the 990 and an annual executive director evaluation on the board calendar. Then claim your free Candid profile and earn a Seal of Transparency: Candid's research found Seal holders received, on average, 62% more in contributions.",
  // Combined Health Index (dimension labels, used on /health-index)
  'Strategy and Positioning': 'Hold a 90-minute session with your board chair and two senior staff to agree your top three priorities for the next 12 months, in writing. For the rest of the quarter, test every new request or opportunity against those three.',
  'Program and Impact Evidence': 'Draft a one-page logic model for your largest program: inputs, activities, outputs, and the two or three outcomes you expect. Then pick one outcome and start measuring it with every participant this quarter.',
  'Revenue and Financial Health': "List every revenue source with its share of last year's revenue. If any single source is above 30%, the commonly cited risk threshold, open two funding conversations outside that source this quarter, and adopt a written reserve target.",
  'Leadership and Organizational Capacity': 'Draft a one-page emergency succession plan: who steps in as interim, who holds signing authority, and where key relationships and passwords are documented. Ask the board to approve it.',
  'Operations and Infrastructure': 'Choose five numbers leadership will look at every month, such as cash on hand, people served, and donor retention, and put them on a single page reviewed at each leadership meeting.',
  'Partnerships and Ecosystem': 'List your ten most important partners and mark each as formal, informal, or one-off. Formalize your two most important informal partnerships with a simple memorandum of understanding.',
  'Governance and Risk': "Pull your last filed Form 990 and check Part VI. Adopt any missing core policy (conflict of interest, whistleblower, document retention), and put the 990 and an annual executive director evaluation on the board calendar. Then claim your free Candid profile and earn a Seal of Transparency: Candid's research found Seal holders received, on average, 62% more in contributions.",
  // Leadership & Operations Score
  'Governance Health': 'Reserve the first 30 minutes of your next board meeting for one strategic question, with a one-page brief sent a week ahead, instead of opening with updates.',
  'Leadership Succession & Bench Strength': 'Draft a one-page emergency succession plan: who steps in as interim, who holds signing authority, and where key relationships and passwords are documented. Ask the board to approve it.',
  'Organizational Alignment & Execution': "Ask five staff at different levels to write down this year's top priority. Compare the answers at your next all-staff meeting and agree on one sentence everyone uses.",
  'Change Leadership Capacity': "For the change you're working on now, name one visible win you can deliver within 60 days, and announce it when it lands. Short-term wins are the step in Kotter's model most often skipped.",
  // Institutional Advancement Score
  'Gift Portfolio Strategy & Staffing': 'Sort your donor file into annual, mid-level, and major tiers by giving, and assign your 25 strongest major-gift prospects to a named staff or board member.',
  'Moves Management & Stewardship': 'For the next 90 days, have someone personally thank every first-time donor within 48 hours, and track how many give again. Fewer than one in five first-time donors give a second gift nationally.',
  'Campaign Structure & Readiness': 'Before setting any campaign goal, hold confidential conversations with the 10 to 15 donors most likely to make lead gifts. Their answers tell you what goal is realistic.',
  'Events as Strategy': 'For your next event, calculate true net revenue and cost per dollar raised, then decide in writing whether it earns a repeat on its numbers and its relationship value.',
  'Planned & Legacy Giving': 'Add a one-line bequest invitation to your website and your next newsletter, and list donors who have given five or more years in a row as your first legacy prospects.',
  // Sustainability Strategy Score
  'Strategic Clarity & Public Value': 'Write one sentence per program naming who benefits and what value you create for them. Use those sentences to decide yes or no on the next three new requests.',
  'Risk Identification & Management': 'Write a top-ten risk list covering financial, operational, reputational, and strategic risk, with one owner for each, and put it on the board agenda once a quarter.',
  'Impact & Financial Sustainability Integration': 'Plot each program on a simple grid of mission impact against financial contribution (the Matrix Map) and bring it to your next board meeting as the basis for next year’s budget.',
  'Roadmap & Implementation Discipline': 'Turn each strategic priority into one initiative with an owner, a deadline, and one metric, and review all of them for ten minutes at each monthly leadership meeting.',
  // Revenue & Growth Score
  'Operating Reserve': 'Adopt a written reserve policy with a target (three to six months of expenses is a common floor) and a clear rule for when reserves can be used and how they are rebuilt.',
  'Program Expense Ratio': 'Re-check how shared costs such as rent and salaries are split between programs, administration, and fundraising. Allocation errors often understate real program investment.',
  'Current Ratio (Liquidity)': 'Build a 13-week cash forecast and review it every two weeks, so a short-term cash squeeze is visible weeks before it arrives.',
  'Donor Retention Rate': 'Thank first-time donors personally within 48 hours and send an impact update within 90 days. First-time donors are where most retention is lost: about 1 in 5 give again, against about 43% of donors overall.',
};

export interface PathwayItem { label: string; pct: number; help?: string }

export interface PathwayOptions {
  tool: string;            // tool name, e.g. "Leadership & Operations Score"
  items: PathwayItem[];    // the areas this tool scored, 0-100
  compositePct: number;    // the overall score shown on the page
  basis?: 'answers' | 'figures';
  coversAllSeven?: boolean;
  extraHtml?: string;      // tool-specific links shown under the constraint
  profile?: boolean;       // show the 'Health Index so far' block (default true)
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c] as string));
}

function recommendationHtml(stage: StageKey | null): string {
  const picker = (Object.keys(STAGES) as StageKey[])
    .map((k) => `<button type="button" class="stage-choice${stage === k ? ' is-selected' : ''}" data-stage="${k}" aria-pressed="${stage === k}"><strong>${STAGES[k].name}</strong><span>${STAGES[k].question}</span></button>`)
    .join('');
  let rec: string;
  if (stage) {
    const s = STAGES[stage];
    rec = `<p class="pathway-rec"><strong>InstitutionalOS Diagnostic: ${s.name} (${s.full}), ${s.price} flat fee.</strong> Verifies the evidence behind every dimension for your stage, names your single binding constraint in a written memo, and ends with a 90-day plan in a live readout session.</p>`;
  } else {
    rec = `<p class="pathway-rec"><strong>InstitutionalOS Diagnostic, $2,000 to $2,500 by stage.</strong> Choose your stage above and this will show the one that fits. It verifies the evidence behind every dimension, names your binding constraint in a written memo, and ends with a 90-day plan.</p>`;
  }
  return `
    <h3 class="subhead">Recommended next step</h3>
    ${triggerRecHtml()}
    <p class="pathway-stage-q">Which best describes your organization?</p>
    <div class="stage-choices" role="group" aria-label="Organization stage">${picker}</div>
    ${rec}
    <div class="hero-ctas">
      <a class="btn btn-primary" href="/#contact" data-track="pathway_diagnostic_click">Discuss Your Diagnostic</a>
      <a class="btn btn-secondary" href="/consulting#pricing">See Pricing</a>
    </div>`;
}

export function renderPathway(el: HTMLElement | null, opts: PathwayOptions) {
  if (!el || !opts.items.length) return;
  const lowest = opts.items.reduce((m, i) => (i.pct < m.pct ? i : m), opts.items[0]);
  const hiddenWeakSpot = opts.compositePct >= 60 && lowest.pct < 40;
  const allEven = opts.items.every((i) => Math.abs(i.pct - lowest.pct) < 5);
  const action = ACTIONS[lowest.label] || ACTIONS[lowest.label.trim()] || '';
  const basis = opts.basis === 'figures'
    ? 'This score is built from figures you entered, against sector benchmarks.'
    : 'This score is one person’s self-rating.';

  el.innerHTML = `
    <div class="pathway">
      <h3 class="subhead">${allEven ? 'Where to start' : 'Your likely constraint'}: ${esc(lowest.label)}</h3>
      ${hiddenWeakSpot
        ? `<p class="pathway-flag">Your overall score looks healthy, but ${esc(lowest.label)} scored ${lowest.pct}%. A strong average doesn't cancel out a weak area; this is usually the one that limits everything else.</p>`
        : allEven
          ? `<p>Your areas scored about evenly (around ${lowest.pct}%), so no single gap stands out. ${esc(lowest.label)} is a sensible place to start; a diagnostic would show which area is really holding things back.</p>`
          : `<p>${esc(lowest.label)} scored lowest, at ${lowest.pct}%. It's the most likely place progress is getting stuck.</p>`}
      ${lowest.help ? `<p>${esc(lowest.help)}</p>` : ''}
      ${opts.extraHtml || ''}

      ${action ? `<h3 class="subhead">Your next 90 days</h3><p>${esc(action)}</p>` : ''}

      <h3 class="subhead">What this tool can't tell you</h3>
      <p>${basis} It can't tell you:</p>
      <ul class="bullet-list">
        <li>whether the evidence behind each answer would hold up to a funder or board,</li>
        <li>how your filed IRS Form 990 reads to a grantmaker,</li>
        <li>whether you'd clear the specific gates for your stage, or</li>
        <li>${opts.coversAllSeven ? 'which single dimension is truly the binding constraint once the evidence is checked.' : `whether ${esc(lowest.label)} is really the binding constraint across all seven Health Index dimensions, since this tool covers only part of them.`}</li>
      </ul>
      <p>That is what the InstitutionalOS Diagnostic verifies, directly with you.</p>

      <div class="pathway-next" data-pathway-next>${recommendationHtml(getStage())}</div>
      ${opts.profile === false ? '' : profileTeaserHtml()}
    </div>`;

  const next = el.querySelector<HTMLElement>('[data-pathway-next]');
  const wire = () => {
    next?.querySelectorAll<HTMLButtonElement>('.stage-choice').forEach((b) => {
      b.addEventListener('click', () => {
        const k = b.dataset.stage as StageKey;
        setStage(k);
        (window as any).fiTrack?.('stage_selected', { stage: k, tool: opts.tool });
        if (next) { next.innerHTML = recommendationHtml(k); wire(); }
      });
    });
  };
  wire();
}
