// Candid Seal of Transparency path (tier 3).
//
// Frankly Inspired does not issue its own seal. Instead every tool points
// organizations toward Candid's Seals of Transparency (Bronze, Silver,
// Gold, Platinum), which are free, earned in order, renewed yearly, used by
// funders as an eligibility screen, and associated in Candid's research
// with ~62% more in contributions.
//
// Requirements summarized from Candid's "2026 Seals of Transparency" guide
// (cdn.candid.org/seals-of-transparency/2026/candid-seals-guide-2026.pdf).
// Re-check each year when Candid publishes the new guide. Frankly Inspired
// is not affiliated with Candid.
//
// Each requirement also names the organizational work behind it and the
// Health Index dimension that work belongs to, so posting to Candid and
// strengthening the organization become the same path.

import type { DimensionKey } from './questionBank';

export type SealLevel = 'bronze' | 'silver' | 'gold' | 'platinum';
export const SEAL_YEAR = 2026;

export const LEVELS: { key: SealLevel; name: string; purpose: string }[] = [
  { key: 'bronze', name: 'Bronze', purpose: 'Basic information so donors can find you and fund your work.' },
  { key: 'silver', name: 'Silver', purpose: 'Program information to guide funding decisions.' },
  { key: 'gold', name: 'Gold', purpose: 'Financial details and leadership demographics to build trust.' },
  { key: 'platinum', name: 'Platinum', purpose: 'Goals, strategies, and impact metrics, plus board demographics.' },
];

export interface SealItem {
  id: string;
  level: SealLevel;
  field: string;          // what Candid asks for
  work: string;           // the organizational work behind it
  step: string;           // what to do if it isn't ready
  dimension: DimensionKey;
  evidence?: string[];    // question-bank item ids that show readiness
}

export const SEAL_ITEMS: SealItem[] = [
  {
    id: 'claim', level: 'bronze', dimension: 'governance',
    field: 'A claimed Candid profile for your organization',
    work: 'Someone on staff owns your public profile and keeps it current every year.',
    step: 'Search your organization or EIN on candid.org and claim the profile. Claiming is free. Name one staff member who owns it.',
  },
  {
    id: 'mission', level: 'bronze', dimension: 'strategy', evidence: ['self-assessment:p1q1', 'sustainability:st2'],
    field: 'Mission statement',
    work: 'A current mission statement your board has adopted.',
    step: 'Have the board adopt or reaffirm a one- to two-sentence mission statement, in writing, at its next meeting.',
  },
  {
    id: 'focus', level: 'bronze', dimension: 'program',
    field: 'Subject area, population served, and geographic area served',
    work: 'Clarity about who you serve, where, and in what field.',
    step: 'Write down, in a few words each, who you serve, where, and in what subject area. Use the same answers everywhere: Candid, grant applications, and your website.',
  },
  {
    id: 'contact', level: 'bronze', dimension: 'operations',
    field: 'Mailing address and website (or a note that you have none)',
    work: 'Current, consistent public contact information.',
    step: 'Confirm your mailing address and website, and make sure they match your IRS records and grant applications.',
  },
  {
    id: 'people', level: 'bronze', dimension: 'leadership',
    field: 'Primary contact, plus your leader’s name, title, and email',
    work: 'A named leader and a named point of contact.',
    step: 'Name a primary contact for the profile, and confirm your executive leader’s title and email.',
  },
  {
    id: 'donate', level: 'bronze', dimension: 'revenue',
    field: 'Donation details: legal name, EIN, and payment address',
    work: 'A clear, verified way for donors to give.',
    step: 'Confirm your legal name, EIN, and the address donations should go to. These let Candid’s partner platforms route gifts to you.',
  },
  {
    id: 'programs', level: 'silver', dimension: 'program', evidence: ['self-assessment:p6q1'],
    field: 'For each program: name, description, geographic area, subject area, and population served',
    work: 'A clear written description of every program.',
    step: 'Write a short description of each program: what it does, where, and for whom. A one-page logic model per program makes this quick and also strengthens grant applications.',
  },
  {
    id: 'financials', level: 'gold', dimension: 'governance', evidence: ['self-assessment:p7q2'],
    field: 'Latest financials: an audited financial statement, or a Form 990, 990-EZ, 990-PF, or 990-N, for fiscal year 2024 or 2025',
    work: 'Current, filed financials your board has reviewed.',
    step: 'Upload your most recent filed Form 990 (any version, including the 990-N postcard) or audited statements. If your filing is behind, make getting current the board’s first priority; a late 990 is a red flag to funders.',
  },
  {
    id: 'leader-demo', level: 'gold', dimension: 'leadership',
    field: 'Leader demographics: race and ethnicity, gender identity, transgender identity, sexual orientation, and disability status',
    work: 'A voluntary, respectful way to collect and report leadership demographics.',
    step: 'Ask your leader to complete the demographic fields. Every answer is voluntary: “decline to state” and “we do not collect this information” are accepted and still count toward the Seal.',
  },
  {
    id: 'board-demo', level: 'platinum', dimension: 'governance',
    field: 'Board demographics in the same categories',
    work: 'A board that knows its own composition and recruits deliberately.',
    step: 'Run a short, voluntary board demographic survey (“decline to state” is accepted). Use the results in your board recruitment profile.',
  },
  {
    id: 'metric', level: 'platinum', dimension: 'program', evidence: ['self-assessment:p6q2', 'self-assessment:p6q3'],
    field: `At least one quantitative impact metric with a ${SEAL_YEAR - 1} value`,
    work: 'At least one outcome you measure every year.',
    step: `Pick one outcome your largest program produces, measure it consistently, and report the ${SEAL_YEAR - 1} number. Start with something you already count, then move toward a change in participants’ lives.`,
  },
  {
    id: 'goals', level: 'platinum', dimension: 'strategy', evidence: ['self-assessment:p1q1', 'sustainability:st1', 'sustainability:e1'],
    field: 'Your organization’s goals, its strategies, and what it aims to solve',
    work: 'Written goals and strategies the board and staff actually use.',
    step: 'Write one page covering the problem you aim to solve, three to five goals, and the strategy for each. Have the board approve it. This is the core of a strategic plan.',
  },
];

export type SealAnswer = 'posted' | 'ready' | 'no';

export interface SealStatus {
  current: SealLevel | null;   // highest level fully posted, in order
  ready: SealLevel | null;     // highest level reachable by posting what's ready
  next: SealLevel | null;      // the level after current
}

const ORDER: SealLevel[] = ['bronze', 'silver', 'gold', 'platinum'];
export const levelName = (k: SealLevel | null) => (k ? LEVELS.find((l) => l.key === k)!.name : 'None yet');

/** Seals are earned in order: a level counts only if it and every level
 *  below it are complete. */
export function sealStatus(answers: Record<string, SealAnswer>): SealStatus {
  const through = (ok: (a: SealAnswer | undefined) => boolean) => {
    let lvl: SealLevel | null = null;
    for (const l of ORDER) {
      if (SEAL_ITEMS.filter((i) => i.level === l).every((i) => ok(answers[i.id]))) lvl = l; else break;
    }
    return lvl;
  };
  const current = through((a) => a === 'posted');
  const ready = through((a) => a === 'posted' || a === 'ready');
  const next = current === 'platinum' ? null : ORDER[current ? ORDER.indexOf(current) + 1 : 0];
  return { current, ready, next };
}
