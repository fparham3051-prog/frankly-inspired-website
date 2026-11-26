// Save-as-you-go for the free check-up (Nov 2026).
//
// 1. Every answer is kept in this browser as it's given (localStorage
//    fi_checkup_progress). Coming back on the same device offers to pick up
//    where you left off.
// 2. Optionally, "Save my progress and email me a link to finish": the
//    answers are kept on our server under a private link, so the check-up
//    can be finished on any device, with a weekly reminder until it is
//    (one click stops them). Evidence notes (the optional "what could you
//    show?" text) stay in the browser and are never sent.
// 3. A finished check-up clears both, and tells the server so reminders stop.

const KEY = 'fi_checkup_progress';
const API = 'https://frankly-inspired-api.onrender.com';

type Fields = Record<string, string | boolean>;
type Saved = { fields: Fields; answered: number; total: number; at: number; token?: string; email?: string };

function questions(form: HTMLFormElement) {
  return Array.from(form.querySelectorAll<HTMLFieldSetElement>('fieldset.likert')).filter(
    (q) => !Array.from(q.querySelectorAll<HTMLInputElement>('input[type="radio"]')).every((r) => r.disabled)
  );
}
export function progressOf(form: HTMLFormElement) {
  const qs = questions(form);
  return { answered: qs.filter((q) => q.querySelector('input[type="radio"]:checked')).length, total: qs.length };
}
function read(form: HTMLFormElement): Fields {
  const out: Fields = {};
  form.querySelectorAll<HTMLInputElement>('input[name]').forEach((el) => {
    if (el.name === 'hp_field' || el.closest('.checkup-save')) return;
    if (el.type === 'radio') { if (el.checked) out[el.name] = el.value; }
    else if (el.type === 'checkbox') { if (el.checked) out[el.name] = true; }
    else if (el.value.trim()) out[el.name] = el.value.slice(0, 500);
  });
  return out;
}
const forServer = (f: Fields) => Object.fromEntries(Object.entries(f).filter(([k]) => !/_ev$/.test(k)));

function apply(form: HTMLFormElement, fields: Fields) {
  const touched: HTMLInputElement[] = [];
  Object.entries(fields).forEach(([name, v]) => {
    const els = form.querySelectorAll<HTMLInputElement>(`input[name="${CSS.escape(name)}"]`);
    els.forEach((el) => {
      if (el.type === 'radio') { if (el.value === v) { el.checked = true; touched.push(el); } }
      else if (el.type === 'checkbox') { el.checked = v === true; if (el.checked) touched.push(el); }
      else if (typeof v === 'string') el.value = v;
    });
  });
  // Let the page react as if each answer were given now (evidence prompts, skips), then jump to the first open question.
  touched.forEach((el) => el.dispatchEvent(new Event('change', { bubbles: true })));
  form.dispatchEvent(new CustomEvent('checkup:resume'));
}

function load(): Saved | null {
  try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); return s && s.fields ? s : null; } catch { return null; }
}
function store(s: Saved) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* still works on this page */ } }
function clear() { try { localStorage.removeItem(KEY); } catch { /* nothing to clear */ } }

export function enableCheckupSave(form: HTMLFormElement | null) {
  if (!form) return { finished: (_ref: string) => {}, ref: () => '' };
  let token = load()?.token || '';
  let email = load()?.email || '';
  let lastSync = 0, syncTimer: number | undefined;

  // ---------- banner and "save for later" box, above the questions ----------
  const box = document.createElement('div');
  box.className = 'checkup-save';
  box.innerHTML = `
    <div class="checkup-resume" data-resume hidden>
      <p><strong>Welcome back.</strong> <span data-resume-text></span></p>
      <button type="button" class="link-btn" data-restart>Start over</button>
    </div>
    <details class="checkup-later" data-later>
      <summary>Need to stop? Save your progress and get a link to finish later</summary>
      <div class="checkup-later-form" data-later-form>
        <div class="hp-field" aria-hidden="true"><label>Leave this field blank<input type="text" data-hp tabindex="-1" autocomplete="off" /></label></div>
        <label for="checkup-later-email">Email the link to</label>
        <div class="checkup-later-row">
          <input type="email" id="checkup-later-email" placeholder="Email address" autocomplete="email" />
          <button type="button" class="btn btn-secondary btn-small" data-later-save>Save and email me a link</button>
        </div>
        <p class="checkup-later-note">We'll email a link that opens the check-up where you left off, then a reminder once a week until you finish. Every email has a one-click stop link. When you finish or stop, your address and saved answers are deleted. No mailing list.</p>
        <p class="form-status" data-later-status role="status" aria-live="polite"></p>
      </div>
    </details>`;
  form.prepend(box);
  const resumeEl = box.querySelector<HTMLElement>('[data-resume]')!;
  const resumeText = box.querySelector<HTMLElement>('[data-resume-text]')!;
  // A <div>, not a <form>: it sits inside the check-up's own form, and forms can't nest.
  const laterForm = box.querySelector<HTMLElement>('[data-later-form]')!;
  const laterEmail = box.querySelector<HTMLInputElement>('#checkup-later-email')!;
  const laterHp = box.querySelector<HTMLInputElement>("[data-hp]")!;
  const laterStatus = box.querySelector<HTMLElement>('[data-later-status]')!;
  const later = box.querySelector<HTMLDetailsElement>('[data-later]')!;

  function showSavedState() {
    if (!token) return;
    later.open = false;
    later.querySelector('summary')!.textContent = email ? `Progress saved. We'll remind ${email} weekly until you finish.` : 'Progress saved to your private link.';
    laterForm.hidden = true;
  }
  function showResume(p: { answered: number; total: number }, how: string) {
    resumeText.textContent = `You've answered ${p.answered} of ${p.total}. ${how}`;
    resumeEl.hidden = false;
  }

  // ---------- keep every answer as it's given ----------
  function save() {
    const fields = read(form);
    const p = progressOf(form);
    if (!p.answered && !Object.keys(fields).length) return;
    store({ fields, answered: p.answered, total: p.total, at: Date.now(), token: token || undefined, email: email || undefined });
    if (!token) return;
    // Keep the private link current, at most every 5 seconds (and when the page is left).
    const due = lastSync + 5000 - Date.now();
    window.clearTimeout(syncTimer);
    syncTimer = window.setTimeout(sync, Math.max(0, due));
  }
  function sync(beacon = false) {
    if (!token) return;
    lastSync = Date.now();
    const p = progressOf(form);
    const body = JSON.stringify({ fields: forServer(read(form)), answered: p.answered, total: p.total });
    const url = `${API}/api/checkup-progress/${encodeURIComponent(token)}`;
    if (beacon && navigator.sendBeacon) { navigator.sendBeacon(url, new Blob([body], { type: 'application/json' })); return; }
    fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true })
      .then((r) => { if (r.status === 404) { token = ''; save(); } })
      .catch(() => { /* tried again on the next answer */ });
  }
  form.addEventListener('change', save);
  form.addEventListener('input', (e) => { if ((e.target as HTMLInputElement).type === 'text') save(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && token) sync(true); });

  // ---------- coming back ----------
  const params = new URLSearchParams(location.search);
  const linkToken = params.get('resume') || '';
  const local = load();
  if (/^[A-Za-z0-9_-]{16,64}$/.test(linkToken)) {
    fetch(`${API}/api/checkup-progress/${encodeURIComponent(linkToken)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d || !d.ok) { resumeText.textContent = 'That link has already been used or its reminders were stopped, so you can start fresh below.'; resumeEl.hidden = false; return; }
        token = linkToken;
        // Answers given in this browser after the link was saved win (including evidence notes kept only here).
        const fields = local && local.token === linkToken ? { ...d.fields, ...local.fields } : d.fields;
        apply(form, fields);
        showResume(progressOf(form), 'Your saved answers are back. Pick up where you left off.');
        save();
        showSavedState();
      })
      .catch(() => { if (local) { apply(form, local.fields); showResume(progressOf(form), 'Pick up where you left off.'); } });
    history.replaceState(null, '', location.pathname);
  } else if (local && local.answered > 0) {
    apply(form, local.fields);
    showResume(progressOf(form), 'Pick up where you left off.');
    showSavedState();
  }

  box.querySelector('[data-restart]')!.addEventListener('click', () => {
    clear();
    form.reset();
    resumeEl.hidden = true;
    // A private link stays usable (and its reminders keep going) until the check-up is finished or stopped.
    if (token) { store({ fields: {}, answered: 0, total: progressOf(form).total, at: Date.now(), token, email: email || undefined }); sync(); }
  });

  // ---------- save for later ----------
  const doSave = () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(laterEmail.value.trim())) { laterStatus.textContent = 'Please enter a valid email address.'; laterEmail.focus(); return; }
    const p = progressOf(form);
    const addr = laterEmail.value.trim();
    laterStatus.textContent = 'Saving...';
    fetch(`${API}/api/checkup-progress`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: addr, hp_field: laterHp.value, fields: forServer(read(form)), answered: p.answered, total: p.total }),
    })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!ok || !d.ok) throw new Error((d && d.error) || 'Something went wrong. Please try again.');
        token = d.token || '';
        email = addr;
        save();
        laterStatus.textContent = d.emailed === false ? `Saved. Keep this link to finish later: ${d.resumeUrl}` : 'Saved. Check your inbox for your link.';
        window.setTimeout(showSavedState, 2500);
      })
      .catch((err) => { laterStatus.textContent = err.message; });
  };
  box.querySelector('[data-later-save]')!.addEventListener('click', doSave);
  laterEmail.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); doSave(); } });

  // ---------- finished ----------
  let currentRef = '';
  return {
    ref: () => (currentRef ||= (crypto.randomUUID ? crypto.randomUUID() : 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10))),
    finished(ref: string) {
      if (token) {
        fetch(`${API}/api/checkup-progress/${encodeURIComponent(token)}/complete`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ref }), keepalive: true }).catch(() => {});
      }
      token = ''; email = ''; currentRef = '';
      clear();
      resumeEl.hidden = true;
    },
  };
}
