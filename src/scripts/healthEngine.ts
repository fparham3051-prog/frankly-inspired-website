// Tier 2 scoring engine: one profile across every free tool.
//
// Each tool still shows its own results, but every answer is also recorded
// here against its question-bank item, and every item belongs to one of the
// seven Health Index dimensions. The profile is the average of all answered
// items per dimension (latest answer wins), so taking more tools fills in
// and sharpens the same seven-dimension picture the paid diagnostic uses.
//
// The profile lives only in this browser (localStorage "fi_health_profile")
// until the visitor chooses to email it.

import { ITEMS, DIMENSIONS, TOOLS, METRIC_DIMENSION, dimension, areasFor, type DimensionKey } from '../data/questionBank';
import { sealStatus, levelName, type SealAnswer, type SealLevel } from '../data/candidSeal';

const KEY = 'fi_health_profile';

export interface Org { ein: string; name: string; city?: string; state?: string }
export interface Profile {
  v: 1;
  items: Record<string, { v: number; at: string }>;
  metrics: Record<string, { pct: number; at: string }>;
  tools: Record<string, { at: string; scorePct: number }>;
  org?: Org;
  // Candid Seal path answers (tier 3): requirement id -> posted/ready/no
  seal?: { answers: Record<string, SealAnswer>; at: string };
  // One snapshot per day of the seven dimension scores and Seal level, so
  // a re-check shows progress over time.
  history?: { at: string; dims: Partial<Record<DimensionKey, number>>; seal?: SealLevel | null }[];
}
export interface DimScore {
  key: DimensionKey; num: number; label: string; anchor: string;
  pct: number | null; count: number; tools: string[];
}

const empty = (): Profile => ({ v: 1, items: {}, metrics: {}, tools: {} });

export function loadProfile(): Profile {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (p && p.v === 1 && p.items && p.metrics && p.tools) return p;
  } catch { /* storage unavailable or corrupt: start fresh */ }
  return empty();
}

function save(p: Profile) {
  snapshot(p);
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* still works for this page */ }
}

// Keep one snapshot per calendar day (the latest that day), up to 24.
function snapshot(p: Profile) {
  const dims: Partial<Record<DimensionKey, number>> = {};
  dimensionScores(p).forEach((d) => { if (d.pct !== null) dims[d.key] = d.pct; });
  if (!Object.keys(dims).length && !p.seal) return;
  const today = new Date().toISOString().slice(0, 10);
  const h = (p.history ||= []);
  const entry = { at: today, dims, seal: p.seal ? sealStatus(p.seal.answers).current : undefined };
  if (h.length && h[h.length - 1].at === today) h[h.length - 1] = entry; else h.push(entry);
  if (h.length > 24) h.splice(0, h.length - 24);
}

/** First snapshot (baseline) and the change in each dimension since then. */
export function progress(p: Profile = loadProfile()) {
  const h = p.history || [];
  if (h.length < 2) return null;
  const first = h[0], last = h[h.length - 1];
  const change: Partial<Record<DimensionKey, number>> = {};
  (Object.keys(last.dims) as DimensionKey[]).forEach((k) => {
    if (typeof first.dims[k] === 'number') change[k] = (last.dims[k] as number) - (first.dims[k] as number);
  });
  return { since: first.at, change, sealFrom: first.seal ?? null, sealTo: last.seal ?? null };
}

/** Score of one question-bank item (0-100), or null if not answered. */
export function itemPct(id: string, p: Profile = loadProfile()): number | null {
  const a = p.items[id];
  return a ? (a.v - 1) * 25 : null;
}

export function saveSeal(answers: Record<string, SealAnswer>) {
  const p = loadProfile();
  p.seal = { answers, at: new Date().toISOString() };
  save(p);
}

export function sealSummary(p: Profile = loadProfile()) {
  if (!p.seal) return null;
  const st = sealStatus(p.seal.answers);
  return { ...st, currentName: levelName(st.current), nextName: st.next ? levelName(st.next) : null, readyName: levelName(st.ready) };
}

export function clearProfile() {
  try { localStorage.removeItem(KEY); } catch { /* nothing to clear */ }
}

/** Record every bank item for this tool from the submitted form. Items
 *  left unanswered (e.g. marked not applicable) are removed, so the
 *  profile always reflects the latest submission. */
export function recordAnswers(tool: string, form: HTMLFormElement, scorePct: number) {
  const p = loadProfile();
  const at = new Date().toISOString();
  ITEMS.filter((i) => i.tool === tool).forEach((i) => {
    const checked = form.querySelector<HTMLInputElement>(`input[name="${i.name}"]:checked:not(:disabled)`);
    const v = checked ? Number(checked.value) : 0;
    if (v >= 1 && v <= 5) p.items[i.id] = { v, at };
    else delete p.items[i.id];
  });
  p.tools[tool] = { at, scorePct };
  save(p);
}

/** Record figure-based metrics (Revenue & Growth Score), each already 0-100. */
export function recordMetrics(tool: string, metrics: { label: string; pct: number | null }[], scorePct: number) {
  const p = loadProfile();
  const at = new Date().toISOString();
  Object.keys(p.metrics).filter((k) => k.startsWith(tool + ':')).forEach((k) => delete p.metrics[k]);
  metrics.forEach((m) => {
    if (typeof m.pct === 'number' && isFinite(m.pct)) p.metrics[`${tool}:${m.label}`] = { pct: Math.max(0, Math.min(100, m.pct)), at };
  });
  p.tools[tool] = { at, scorePct };
  save(p);
}

export function setOrg(org: Org | null) {
  const p = loadProfile();
  if (org) p.org = org; else delete p.org;
  save(p);
}

const toolName = (k: string) => TOOLS.find((t) => t.key === k)?.name || k;

export function dimensionScores(p: Profile = loadProfile()): DimScore[] {
  const buckets: Record<string, { sum: number; n: number; tools: Set<string> }> = {};
  const add = (d: DimensionKey, pct: number, tool: string) => {
    const b = (buckets[d] ||= { sum: 0, n: 0, tools: new Set() });
    b.sum += pct; b.n += 1; b.tools.add(tool);
  };
  ITEMS.forEach((i) => {
    const a = p.items[i.id];
    if (!a) return;
    const area = areasFor(i.tool).find((x) => x.key === i.area);
    if (area) add(area.dimension, (a.v - 1) * 25, i.tool);
  });
  Object.entries(p.metrics).forEach(([k, m]) => add(METRIC_DIMENSION, m.pct, k.split(':')[0]));
  return DIMENSIONS.map((d) => {
    const b = buckets[d.key];
    return {
      key: d.key, num: d.num, label: d.label, anchor: d.anchor,
      pct: b ? Math.round(b.sum / b.n) : null,
      count: b ? b.n : 0,
      tools: b ? [...b.tools].map(toolName) : [],
    };
  });
}

/** Which tool fills a dimension the profile hasn't covered yet. */
export const FILL_TOOL: Record<DimensionKey, { href: string; name: string }> = {
  strategy: { href: '/sustainability-score', name: 'Sustainability Strategy Score' },
  program: { href: '/assessment', name: 'Self-Assessment' },
  revenue: { href: '/revenue-growth-score', name: 'Revenue & Growth Score' },
  leadership: { href: '/leadership-health', name: 'Leadership & Operations Score' },
  operations: { href: '/assessment', name: 'Self-Assessment' },
  partnerships: { href: '/assessment', name: 'Self-Assessment' },
  governance: { href: '/leadership-health', name: 'Leadership & Operations Score' },
};

/** Compact "your Health Index so far" block for the end of each tool. */
export function profileTeaserHtml(): string {
  const dims = dimensionScores();
  const covered = dims.filter((d) => d.pct !== null);
  if (!covered.length) return '';
  const bars = dims.map((d) => d.pct === null
    ? `<li class="hi-mini-row is-empty"><span>${d.num}. ${d.label}</span><span class="hi-mini-val">not yet scored</span></li>`
    : `<li class="hi-mini-row"><span>${d.num}. ${d.label}</span><span class="hi-mini-track"><span style="width:${d.pct}%"></span></span><span class="hi-mini-val">${d.pct}%</span></li>`).join('');
  const missing = dims.filter((d) => d.pct === null);
  const next = missing.length ? FILL_TOOL[missing[0].key] : null;
  const seal = sealSummary();
  const sealLine = seal
    ? (seal.next
      ? `<p class="hi-seal-line"><strong>Candid Seal path:</strong> ${seal.current ? seal.currentName + ' now' : 'no Seal yet'}; next up is ${seal.nextName}. <a class="link-more" href="/candid-seal">See your steps &rarr;</a></p>`
      : `<p class="hi-seal-line"><strong>Candid Seal path:</strong> Platinum. Keep it by updating your profile every year. <a class="link-more" href="/candid-seal">Review &rarr;</a></p>`)
    : `<p class="hi-seal-line"><strong>Next, the Candid Seal:</strong> funders use Candid's free Seals of Transparency to screen applicants, and Seal holders received about 62% more in contributions in Candid's research. <a class="link-more" href="/candid-seal">Find your path to Platinum &rarr;</a></p>`;
  return `
    <div class="hi-teaser">
      <h3 class="subhead">Your Health Index so far: ${covered.length} of 7 dimensions</h3>
      <p>Every free tool adds to one profile on the same seven dimensions the paid diagnostic uses. It's saved only in this browser.</p>
      <ul class="hi-mini">${bars}</ul>
      ${sealLine}
      <div class="hero-ctas">
        <a class="btn btn-secondary" href="/health-index" data-track="health_index_open">See Your Full Health Index</a>
        ${next ? `<a class="link-more" href="${next.href}">Next: fill ${dimension(missing[0].key).label} with the ${next.name} &rarr;</a>` : ''}
      </div>
    </div>`;
}
