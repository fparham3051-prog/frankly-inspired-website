// "Your question" on the check-up results (Nov 2026): the situation the
// visitor picked at the start, answered from their own results, plus one
// recommendation. The same answer and recommendation travel with the lead
// (if they email themselves results) so the debrief call in the operations
// app starts from exactly what they saw.
//
// The recommendation rule, in one place:
//   diagnostic: at least one area is under its path minimum, and they came
//               in with a real decision ahead (any situation but "just a
//               check-up"), or Legacy Readiness is 2 of 6 or lower.
//   self:       every path minimum is cleared and the overall score is 70%
//               or higher. The free 90-day step is enough for now; re-check
//               in 90 days.
//   debrief:    everything else. A free 30-minute call to decide.

import { TRIGGERS, type TriggerKey } from './trigger';

export type Rec = 'diagnostic' | 'debrief' | 'self';
export interface SituationInput {
  trigger: TriggerKey | null;
  gap: { label: string; pct: number; min?: number; belowMinimum: boolean };
  misses: { label: string; pct: number; min: number }[];
  pathName: string;          // "Build", "Fund", "Sustain", or ""
  price: string;             // e.g. "$2,500"
  compositePct: number;
  legacy: { met: number; total: number; missing: string[] } | null;
}

export function recommend(i: SituationInput): Rec {
  const decisionAhead = !!i.trigger && i.trigger !== 'checkup';
  if (i.misses.length && (decisionAhead || (i.legacy && i.legacy.met <= 2))) return 'diagnostic';
  if (!i.misses.length && i.compositePct >= 70) return 'self';
  return 'debrief';
}

const ACT: Record<Exclude<TriggerKey, 'checkup'>, string> = {
  expansion: 'open the new site or program',
  funder: 'go after the larger funder',
  founder: 'hand work off',
  strain: 'add more staff',
  transition: 'make the leadership change',
};

/** One or two sentences that answer the visitor's own question. */
export function shortAnswer(i: SituationInput): string {
  const g = `${i.gap.label} (${i.gap.pct}%)`;
  const handoff = i.legacy && i.legacy.missing.length
    ? ` Legacy Readiness is ${i.legacy.met} of ${i.legacy.total}; the first things to put in place: ${i.legacy.missing.slice(0, 2).join(' and ').toLowerCase()}.`
    : '';
  const t = i.trigger && i.trigger !== 'checkup' ? i.trigger : null;
  if (!t) {
    return i.misses.length
      ? `Your biggest risk is ${g}, under the ${i.gap.min}% the ${i.pathName} path needs.`
      : `Nothing is under its minimum for your path. ${g} is where strain would show first.`;
  }
  if (t === 'strain') {
    const decisions = /leadership|operations/i.test(i.gap.label);
    return decisions
      ? `Probably not headcount. The strain is coming from ${g}: who decides what, and how the work is written down. More people would add questions, not capacity.`
      : `Probably not headcount. The strain is coming from ${g}. Fix that before you hire.`;
  }
  if (t === 'founder' || t === 'transition') {
    return (i.misses.length
      ? `Not yet safely. ${g} is under the ${i.gap.min}% the ${i.pathName} path needs, so it would break first in a handoff.`
      : `It can be done. ${g} is the area to shore up before you ${ACT[t]}.`) + handoff;
  }
  return i.misses.length
    ? `Not yet. ${g} is under the ${i.gap.min}% the ${i.pathName} path needs. Fix that first, then ${ACT[t]}.`
    : `Likely yes, with one condition: ${g} is where it will strain first. Strengthen it before you ${ACT[t]}.`;
}

export function recommendationText(r: Rec, i: SituationInput): string {
  if (r === 'diagnostic') return `The ${i.pathName ? i.pathName + ' ' : ''}Diagnostic${i.price ? ` (${i.price}, flat)` : ''}: I check the evidence behind ${i.gap.label}, price the fix, and give you a 90-day plan your board can approve.`;
  if (r === 'self') return 'You don\'t need to pay for anything yet. Do the 90-day step below, then take the check-up again in 90 days to see what moved.';
  return 'A free 30-minute debrief. We go through your results, confirm the gap, and decide together whether a Diagnostic is worth it now.';
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export function situationHtml(i: SituationInput, r: Rec): string {
  const t = i.trigger && i.trigger !== 'checkup' ? TRIGGERS[i.trigger] : null;
  const cta = r === 'diagnostic'
    ? `<a class="btn btn-primary" href="/#contact" data-track="situation_diagnostic_click">Discuss the Diagnostic</a>`
    : r === 'debrief'
      ? `<a class="btn btn-primary" href="/#contact" data-track="situation_debrief_click">Book the Free Debrief</a>`
      : `<a class="btn btn-secondary" href="#results-recommendation" data-track="situation_self_click">See the 90-day step</a>`;
  return `
    <div class="situation-answer">
      ${t ? `<h3 class="subhead">Your question</h3><p class="situation-q">${esc(t.question)}</p>` : '<h3 class="subhead">The short answer</h3>'}
      <p>${t ? '<strong>The short answer:</strong> ' : ''}${esc(shortAnswer(i))}</p>
      <p><strong>My recommendation:</strong> ${esc(recommendationText(r, i))}</p>
      <div class="hero-ctas">${cta}</div>
    </div>`;
}
