// "Find your organization" lookup, shared by the Revenue & Growth Score and
// the Health Index page. Pulls the public IRS Form 990 summary (via the
// backend, from ProPublica Nonprofit Explorer) so a visitor starts from the
// same filing a grantmaker reads. The chosen org is remembered in the
// Health Index profile and sent with emailed results.

import { loadProfile, setOrg, type Org } from './healthEngine';

const API_BASE = 'https://frankly-inspired-api.onrender.com';

export interface FilingYear {
  year: number; form: string; revenue: number | null; expenses: number | null;
  netAssets: number | null; surplus: number | null; contributions: number | null;
  monthsNetAssets: number | null; contributionShare: number | null; pdfUrl: string | null;
}
export interface Snapshot {
  org: Org & { ntee?: string };
  years: FilingYear[];
  signals: { tone: 'good' | 'watch' | 'neutral'; text: string }[];
  links: { propublica: string; candid: string };
  source: string;
}

const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c] as string));
const money = (n: number | null) => n == null ? '–'
  : (n < 0 ? '−' : '') + (Math.abs(n) >= 1e6 ? '$' + (Math.abs(n) / 1e6).toFixed(1) + 'M' : '$' + Math.round(Math.abs(n) / 1e3) + 'K');

function snapshotHtml(s: Snapshot): string {
  const rows = s.years.map((y) => `<tr><td>FY${y.year}</td><td>${money(y.revenue)}</td><td>${money(y.expenses)}</td><td class="${(y.surplus ?? 0) < 0 ? 'is-neg' : ''}">${money(y.surplus)}</td><td>${money(y.netAssets)}</td></tr>`).join('');
  const signals = s.signals.map((g) => `<li class="sig-${g.tone}">${esc(g.text)}</li>`).join('');
  return `
    <div class="org-snapshot">
      <p class="org-snapshot-name"><strong>${esc(s.org.name)}</strong> &middot; EIN ${esc(s.org.ein)}${s.org.city ? ' &middot; ' + esc(s.org.city) + ', ' + esc(s.org.state) : ''}
        <button type="button" class="link-btn" data-org-change>Change</button></p>
      ${s.years.length ? `
      <div class="org-table-wrap"><table class="org-table">
        <thead><tr><th>Filed year</th><th>Revenue</th><th>Expenses</th><th>Surplus</th><th>Net assets</th></tr></thead>
        <tbody>${rows}</tbody></table></div>
      <h4>What a funder sees in these filings</h4>
      <ul class="org-signals">${signals}</ul>` : '<p>No financial data has been published for this organization\'s filings yet. Smaller organizations filing a 990-N postcard won\'t have figures here.</p>'}
      <p class="org-source">Source: ${esc(s.source)}. <a href="${esc(s.links.propublica)}" target="_blank" rel="noopener">See the filings</a> &middot; <a href="${esc(s.links.candid)}" target="_blank" rel="noopener">See your Candid profile</a></p>
    </div>`;
}

export function mountOrgLookup(root: HTMLElement | null, onSnapshot?: (s: Snapshot) => void) {
  if (!root) return;
  root.innerHTML = `
    <div class="org-lookup">
      <label for="org-q">Find your organization <span class="optional">(optional)</span></label>
      <p class="fh-field-help">Search by name or EIN to pull your public Form 990 figures. Nothing you type is stored.</p>
      <div class="org-search-row">
        <input type="search" id="org-q" placeholder="Organization name or EIN" autocomplete="off" />
        <button type="button" class="btn btn-secondary" data-org-search>Search</button>
      </div>
      <p class="form-status" data-org-status role="status" aria-live="polite"></p>
      <ul class="org-results" data-org-results></ul>
    </div>
    <div data-org-snapshot></div>`;
  const q = root.querySelector<HTMLInputElement>('#org-q')!;
  const status = root.querySelector<HTMLElement>('[data-org-status]')!;
  const list = root.querySelector<HTMLElement>('[data-org-results]')!;
  const snapEl = root.querySelector<HTMLElement>('[data-org-snapshot]')!;
  const finder = root.querySelector<HTMLElement>('.org-lookup')!;

  const load = (ein: string) => {
    status.textContent = 'Loading filings...';
    fetch(API_BASE + '/api/org-990?ein=' + encodeURIComponent(ein))
      .then((r) => r.json())
      .then((d) => {
        if (!d || !d.ok) throw new Error((d && d.error) || 'Lookup is unavailable right now.');
        const s = d as Snapshot;
        setOrg({ ein: s.org.ein, name: s.org.name, city: s.org.city, state: s.org.state });
        status.textContent = '';
        list.innerHTML = '';
        finder.hidden = true;
        snapEl.innerHTML = snapshotHtml(s);
        snapEl.querySelector('[data-org-change]')?.addEventListener('click', () => {
          setOrg(null); snapEl.innerHTML = ''; finder.hidden = false; q.focus();
        });
        (window as any).fiTrack?.('org_990_loaded', {});
        onSnapshot?.(s);
      })
      .catch((e) => { status.textContent = e.message; finder.hidden = false; });
  };

  const search = () => {
    const term = q.value.trim();
    if (term.length < 3) { status.textContent = 'Type at least three characters.'; return; }
    status.textContent = 'Searching...';
    list.innerHTML = '';
    fetch(API_BASE + '/api/org-search?q=' + encodeURIComponent(term))
      .then((r) => r.json())
      .then((d) => {
        const results = d && d.ok ? d.results : null;
        if (!results) throw new Error((d && d.error) || 'Lookup is unavailable right now.');
        if (!results.length) { status.textContent = 'No match. Try a shorter name or your EIN.'; return; }
        status.textContent = '';
        list.innerHTML = results.map((o: any) => `<li><button type="button" data-ein="${esc(o.ein)}"><strong>${esc(o.name)}</strong><span>${esc([o.city, o.state].filter(Boolean).join(', '))} &middot; EIN ${esc(o.ein)}</span></button></li>`).join('');
        list.querySelectorAll<HTMLButtonElement>('button[data-ein]').forEach((b) => b.addEventListener('click', () => load(b.dataset.ein!)));
      })
      .catch((e) => { status.textContent = e.message; });
  };
  root.querySelector('[data-org-search]')!.addEventListener('click', search);
  q.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); search(); } });

  const saved = loadProfile().org;
  if (saved) load(saved.ein);
}
