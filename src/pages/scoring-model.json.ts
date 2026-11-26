// The published scoring model behind the free check-up, in the same shape
// InstitutionalOS serves at /scoring-model. The operations app's daily
// systems check compares the two, so the free check-up and the paid
// Diagnostic can't quietly drift apart.
import type { APIRoute } from 'astro';
import { AREA, WEIGHTS, MINIMUMS, LEGACY_QS } from '../scripts/arc';

// The check-up's area labels, as InstitutionalOS keys them.
const KEY: Record<string, string> = {
  [AREA.strategy]: 'strategy', [AREA.program]: 'program', [AREA.revenue]: 'financial', [AREA.leadership]: 'leadership',
  [AREA.operations]: 'operations', [AREA.partnership]: 'partnerships', [AREA.governance]: 'governance',
};
const keyed = (m: Record<string, number>) => Object.fromEntries(Object.entries(m).map(([k, v]) => [KEY[k] || k, v]));

export const GET: APIRoute = () => {
  const stages = Object.fromEntries((['build', 'fund', 'sustain'] as const).map((p) => [p.toUpperCase(), { weights: keyed(WEIGHTS[p]), minimums: keyed(MINIMUMS[p]) }]));
  const body = { version: 1, stages, legacyMarkers: LEGACY_QS.map((q) => q.name.replace(/^lg_/, '')) };
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });
};
