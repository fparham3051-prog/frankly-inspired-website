// Idea to Legacy: the shared rules behind the free check-up (Nov 2026).
//
// 1. Stage: four plain questions measure where an organization is, so the
//    path (Build, Fund, Sustain) is measured, not guessed. The situation a
//    visitor picks ("what's happening") can move it, and they can still
//    choose another path on the results screen.
// 2. Path weights and minimums: each path counts the seven areas
//    differently and sets floors an organization must clear to move on.
// 3. One rule for the gap that will break first, used everywhere:
//    an area below its path minimum comes first (the furthest below);
//    otherwise it is the area with the largest weighted shortfall,
//    weight x (100 - score). The Diagnostic applies the same rule to
//    verified scores.
// 4. Legacy Readiness: six yes/no markers of an organization that can run,
//    raise money and decide without its founder. The finish line every
//    path works toward.
//
// The weights and minimums are published on /methodology and will be
// revisited against the validation record in InstitutionalOS (self-score vs
// verified score, and outcomes).

import type { TriggerKey } from './trigger';

export type PathKey = 'build' | 'fund' | 'sustain';

// Labels exactly as the check-up names its seven areas.
export const AREA = {
  strategy: 'Strategy and Direction',
  revenue: 'Revenue Diversification',
  leadership: 'Leadership & Organizational Development',
  operations: 'Operations & Infrastructure',
  partnership: 'Partnership & Ecosystem Strategy',
  program: 'Program & Impact Evidence',
  governance: 'Governance & Risk',
} as const;

// Same numbers as InstitutionalOS (scoring.py STAGE_WEIGHTS and HARD_GATES),
// so the free check-up and the paid Diagnostic use one map.
export const WEIGHTS: Record<PathKey, Record<string, number>> = {
  build: { [AREA.strategy]: 20, [AREA.program]: 15, [AREA.revenue]: 10, [AREA.leadership]: 15, [AREA.operations]: 10, [AREA.partnership]: 10, [AREA.governance]: 20 },
  fund: { [AREA.strategy]: 10, [AREA.program]: 20, [AREA.revenue]: 20, [AREA.leadership]: 10, [AREA.operations]: 15, [AREA.partnership]: 10, [AREA.governance]: 15 },
  sustain: { [AREA.strategy]: 15, [AREA.program]: 15, [AREA.revenue]: 20, [AREA.leadership]: 15, [AREA.operations]: 15, [AREA.partnership]: 10, [AREA.governance]: 10 },
};

export const MINIMUMS: Record<PathKey, Record<string, number>> = {
  build: { [AREA.governance]: 75, [AREA.strategy]: 70 },
  fund: { [AREA.governance]: 75, [AREA.revenue]: 70, [AREA.program]: 70 },
  sustain: { [AREA.governance]: 70, [AREA.revenue]: 70, [AREA.leadership]: 70 },
};

// ---------- stage ----------
export const STAGE_QS = [
  { name: 'st_budget', q: 'About how large is your annual budget?', opts: ['Under $250,000', '$250,000 to $1 million', '$1 million to $5 million', 'Over $5 million'] },
  { name: 'st_staff', q: 'How many paid staff (full-time equivalent)?', opts: ['0 to 2', '3 to 10', '11 to 40', 'More than 40'] },
  { name: 'st_years', q: 'How long has the organization been operating?', opts: ['Under 3 years', '3 to 7 years', '8 to 15 years', 'More than 15 years'] },
  { name: 'st_decide', q: 'Who makes most day-to-day decisions?', opts: ['The founder or executive director alone', 'The executive director with one or two others', 'A leadership team with written roles'] },
] as const;

export interface StageAnswers { budget: number; staff: number; years: number; decide: number } // 0-based, -1 = unanswered

export function readStage(form: HTMLFormElement): StageAnswers {
  const v = (n: string) => { const c = form.querySelector<HTMLInputElement>(`input[name="${n}"]:checked`); return c ? Number(c.value) - 1 : -1; };
  return { budget: v('st_budget'), staff: v('st_staff'), years: v('st_years'), decide: v('st_decide') };
}

export function measuredPath(st: StageAnswers, trigger: TriggerKey | null): { path: PathKey | null; why: string } {
  if (st.budget < 0 && st.years < 0) return { path: null, why: '' };
  let path: PathKey;
  let why: string;
  if (st.budget === 0 || st.years === 0) {
    path = 'build'; why = st.years === 0 ? 'you are under three years old' : 'your budget is under $250,000';
  } else if (st.budget >= 2 && (st.years >= 2 || st.staff >= 2)) {
    path = 'sustain'; why = 'you are an established organization of $1 million or more';
  } else {
    path = 'fund'; why = 'you are a growing organization between $250,000 and $1 million';
  }
  // What's happening can move a growing organization to Sustain.
  if (path === 'fund' && (trigger === 'founder' || trigger === 'transition')) {
    path = 'sustain'; why += ', and you said ' + (trigger === 'founder' ? 'too much depends on one leader' : 'a leadership change is coming');
  } else if (path === 'fund' && st.decide === 0 && st.staff >= 2) {
    path = 'sustain'; why += ', and decisions still run through one person';
  }
  return { path, why };
}

// ---------- the gap that will break first ----------
export interface Scored { label: string; pct: number }
export function gapFirst(items: Scored[], path: PathKey | null): { label: string; pct: number; why: 'below-minimum' | 'weighted' | 'lowest'; min?: number } {
  if (!items.length) return { label: '', pct: 0, why: 'lowest' };
  if (!path) {
    const low = items.reduce((m, i) => (i.pct < m.pct ? i : m), items[0]);
    return { ...low, why: 'lowest' };
  }
  const mins = MINIMUMS[path], w = WEIGHTS[path];
  const under = items.filter((i) => mins[i.label] != null && i.pct < mins[i.label]);
  if (under.length) {
    const worst = under.reduce((m, i) => (mins[i.label] - i.pct > mins[m.label] - m.pct ? i : m), under[0]);
    return { ...worst, why: 'below-minimum', min: mins[worst.label] };
  }
  const top = items.reduce((m, i) => ((w[i.label] || 10) * (100 - i.pct) > (w[m.label] || 10) * (100 - m.pct) ? i : m), items[0]);
  return { ...top, why: 'weighted' };
}

export function minimumsCleared(items: Scored[], path: PathKey): { cleared: number; total: number; misses: { label: string; pct: number; min: number }[] } {
  const mins = MINIMUMS[path];
  const misses: { label: string; pct: number; min: number }[] = [];
  Object.keys(mins).forEach((label) => {
    const it = items.find((i) => i.label === label);
    if (it && it.pct < mins[label]) misses.push({ label, pct: it.pct, min: mins[label] });
  });
  const total = Object.keys(mins).length;
  return { cleared: total - misses.length, total, misses };
}

// ---------- Legacy Readiness ----------
export const LEGACY_QS = [
  { name: 'lg_deputy', q: 'Someone other than the executive director could run the organization for three months.', short: 'A deputy who could step in' },
  { name: 'lg_decisions', q: 'Key decisions, processes and passwords are written down where others can find them.', short: 'Key decisions written down' },
  { name: 'lg_succession', q: 'The board has approved a succession plan for the executive director.', short: 'Board-approved succession plan' },
  { name: 'lg_reserves', q: 'You hold at least six months of operating expenses in reserve.', short: 'Six months of reserves' },
  { name: 'lg_concentration', q: 'No single funder provides more than 30% of revenue.', short: 'No funder above 30% of revenue' },
  { name: 'lg_candid', q: 'Your Candid profile holds the Platinum Seal of Transparency.', short: "Candid's top Seal (Platinum)" },
] as const;

export function readLegacy(form: HTMLFormElement): { met: number; total: number; items: { key: string; short: string; met: boolean; unsure: boolean }[] } {
  const items = LEGACY_QS.map((q) => {
    const c = form.querySelector<HTMLInputElement>(`input[name="${q.name}"]:checked`);
    return { key: q.name.replace(/^lg_/, ''), short: q.short, met: c?.value === '1', unsure: c?.value === '3' };
  });
  return { met: items.filter((i) => i.met).length, total: items.length, items };
}

const PATH_NAMES: Record<PathKey, string> = { build: 'Build', fund: 'Fund', sustain: 'Sustain' };

export function arcHtml(path: PathKey | null): string {
  const stops: [string, string][] = [['Idea', 'Founding'], ['Build', 'Get the foundation right'], ['Fund', 'Ready for bigger money'], ['Sustain', 'Beyond one person'], ['Legacy', 'Runs without the founder']];
  const here = path ? PATH_NAMES[path] : '';
  return `<ol class="arc-mini" aria-label="Idea to Legacy">${stops.map(([n, d]) => `<li class="${n === here ? 'is-here' : ''}${n === 'Legacy' ? ' is-finish' : ''}"><strong>${n}</strong><span>${d}</span>${n === here ? '<em>You are here</em>' : ''}</li>`).join('')}</ol>`;
}

export function legacyHtml(l: ReturnType<typeof readLegacy>): string {
  const pct = Math.round((l.met / l.total) * 100);
  return `<div class="legacy-box">
    <h3 class="subhead">Legacy Readiness: ${l.met} of ${l.total}</h3>
    <p>The finish line on every path is an organization that can run, raise money and make decisions without its founder.</p>
    <span class="legacy-track" aria-hidden="true"><span class="legacy-fill" style="width:${pct}%"></span></span>
    <ul class="legacy-list">${l.items.map((i) => `<li class="${i.met ? 'is-met' : ''}">${i.met ? '&#10003;' : i.unsure ? '?' : '&ndash;'} ${i.short}</li>`).join('')}</ul>
  </div>`;
}
