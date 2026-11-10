// One-question-per-screen mode for every question-based free tool.
//
// Progressive enhancement over the existing form: the markup, the answers,
// and each tool's own scoring and submit handler are untouched. The stepper
// only shows one question (fieldset.likert) at a time, with its section
// heading, a progress bar, Back/Next, auto-advance after an answer, and
// keyboard shortcuts (1-5 to answer, arrows or Enter to move). Visitors who
// prefer the old layout can switch to "Show all questions" (remembered in
// this browser). A form reset (Retake) returns to question 1.

const PREF_KEY = 'fi_stepper_off';

export function enableStepper(form: HTMLFormElement | null) {
  if (!form || form.dataset.stepper === 'on') return;
  const questions = Array.from(form.querySelectorAll<HTMLFieldSetElement>('fieldset.likert'));
  if (questions.length < 2) return;
  form.dataset.stepper = 'on';

  const groups = Array.from(form.querySelectorAll<HTMLElement>('.pillar-group'));
  const submitArea = form.querySelector<HTMLElement>('.assessment-submit');
  const rubric = form.querySelector<HTMLDetailsElement>('details.rubric-key');
  const total = questions.length;
  let i = 0;
  let advanceTimer: number | undefined;

  const groupOf = (q: HTMLElement) => q.closest<HTMLElement>('.pillar-group');
  const answered = (q: HTMLFieldSetElement) => !!q.querySelector('input[type="radio"]:checked');
  // A question whose answers are all disabled has been skipped (for example
  // "No campaign planned" on the Institutional Advancement Score).
  const skipped = (q: HTMLFieldSetElement) => Array.from(q.querySelectorAll<HTMLInputElement>('input[type="radio"]')).every((r) => r.disabled);
  const active = () => questions.filter((q) => !skipped(q));
  const step = (from: number, dir: 1 | -1) => {
    for (let n = from + dir; n >= 0 && n < total; n += dir) if (!skipped(questions[n])) return n;
    return -1;
  };
  const sectionName = (g: HTMLElement | null) =>
    (g?.querySelector('.pillar-heading')?.textContent || '').replace(/^\s*\d+\.\s*/, '').trim();

  // Controls, inserted at the top of the form (under the rubric key).
  const bar = document.createElement('div');
  bar.className = 'stepper-bar';
  bar.innerHTML = `
    <div class="stepper-meta">
      <span class="stepper-section" data-section></span>
      <span class="stepper-count" data-count aria-live="polite"></span>
    </div>
    <span class="stepper-track" aria-hidden="true"><span class="stepper-fill" data-fill></span></span>`;
  const nav = document.createElement('div');
  nav.className = 'stepper-nav';
  nav.innerHTML = `
    <button type="button" class="btn btn-ghost stepper-back" data-back>&larr; Back</button>
    <button type="button" class="btn btn-primary stepper-next" data-next>Next &rarr;</button>
    <p class="stepper-hint">Tip: press 1 to 5 to answer.</p>`;
  const toggle = document.createElement('p');
  toggle.className = 'stepper-toggle';
  toggle.innerHTML = `<button type="button" class="link-btn" data-toggle></button>`;
  const firstGroup = groups[0] || questions[0];
  firstGroup.parentElement?.insertBefore(bar, firstGroup);
  (submitArea || form).parentElement === form
    ? form.insertBefore(nav, submitArea)
    : form.appendChild(nav);
  form.appendChild(toggle);

  const els = {
    section: bar.querySelector<HTMLElement>('[data-section]')!,
    count: bar.querySelector<HTMLElement>('[data-count]')!,
    fill: bar.querySelector<HTMLElement>('[data-fill]')!,
    back: nav.querySelector<HTMLButtonElement>('[data-back]')!,
    next: nav.querySelector<HTMLButtonElement>('[data-next]')!,
    toggle: toggle.querySelector<HTMLButtonElement>('[data-toggle]')!,
  };

  let on = true;
  try { on = localStorage.getItem(PREF_KEY) !== '1'; } catch { /* default on */ }

  function render(focus = false) {
    document.body.classList.toggle('stepper-active', on);
    form.classList.toggle('is-stepping', on);
    bar.hidden = !on;
    nav.hidden = !on;
    els.toggle.textContent = on ? 'Show all questions on one page' : 'Show one question at a time';
    if (!on) {
      groups.forEach((g) => { g.hidden = false; });
      questions.forEach((q) => { q.hidden = false; });
      if (submitArea) submitArea.hidden = false;
      return;
    }
    const q = questions[i];
    const g = groupOf(q);
    groups.forEach((x) => { x.hidden = x !== g; });
    questions.forEach((x) => { x.hidden = x !== q; });
    // The section heading and its research note show on the first
    // question of each section only, so later screens stay compact.
    const firstInGroup = g ? g.querySelector('fieldset.likert') === q : true;
    g?.classList.toggle('stepper-later', !firstInGroup);
    const act = active();
    const doneCount = act.filter(answered).length;
    const pos = act.indexOf(q);
    els.section.textContent = sectionName(g);
    els.count.textContent = `Question ${pos === -1 ? '–' : pos + 1} of ${act.length}`;
    els.fill.style.width = `${Math.round((doneCount / Math.max(1, act.length)) * 100)}%`;
    els.back.disabled = step(i, -1) === -1;
    const last = step(i, 1) === -1;
    els.next.hidden = last;
    els.next.disabled = !answered(q) && !skipped(q);
    if (submitArea) submitArea.hidden = !last;
    if (focus) {
      const target = q.querySelector<HTMLInputElement>('input:checked') || q.querySelector<HTMLInputElement>('input[type="radio"]');
      target?.focus({ preventScroll: true });
      const top = bar.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.4) bar.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  const go = (n: number) => {
    window.clearTimeout(advanceTimer);
    i = Math.max(0, Math.min(total - 1, n));
    render(true);
  };

  const goNext = () => { const n = step(i, 1); if (n !== -1) go(n); };
  const goBack = () => { const n = step(i, -1); if (n !== -1) go(n); };
  els.back.addEventListener('click', goBack);
  els.next.addEventListener('click', () => { if (answered(questions[i]) || skipped(questions[i])) goNext(); });
  els.toggle.addEventListener('click', () => {
    on = !on;
    try { localStorage.setItem(PREF_KEY, on ? '0' : '1'); } catch { /* still switches for now */ }
    if (on) {
      const firstOpen = questions.findIndex((q) => !answered(q) && !skipped(q));
      i = firstOpen === -1 ? total - 1 : firstOpen;
    }
    render(on);
  });

  // Answering moves on by itself after a short pause, so the visitor sees
  // their choice register first.
  form.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement;
    // A skip checkbox can disable the current question: move past it.
    if (on && t.type === 'checkbox') {
      window.setTimeout(() => { if (skipped(questions[i])) { const n = step(i, 1); go(n === -1 ? step(i, -1) : n); } else render(); }, 0);
      return;
    }
    if (!on || t.type !== 'radio' || !questions[i].contains(t)) return;
    if (rubric && rubric.open && i === 0) rubric.open = false;
    render();
    if (step(i, 1) !== -1) {
      window.clearTimeout(advanceTimer);
      advanceTimer = window.setTimeout(goNext, 320);
    }
  });

  form.addEventListener('keydown', (e) => {
    if (!on || e.altKey || e.ctrlKey || e.metaKey) return;
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'TEXTAREA' || (tag === 'INPUT' && (e.target as HTMLInputElement).type !== 'radio')) return;
    // Keys pressed on the trigger question ("What's happening right now?")
    // belong to it, not to the current question.
    if ((e.target as HTMLElement).closest('.trigger-picker')) return;
    if (/^[1-5]$/.test(e.key)) {
      const r = questions[i].querySelector<HTMLInputElement>(`input[type="radio"][value="${e.key}"]`);
      if (r) { r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); e.preventDefault(); }
    } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
      if (step(i, 1) !== -1 && answered(questions[i])) { goNext(); e.preventDefault(); }
    } else if (e.key === 'ArrowLeft') {
      if (step(i, -1) !== -1) { goBack(); e.preventDefault(); }
    }
  });

  // Submitting with a gap (possible only in "show all" or after editing)
  // jumps to the first unanswered question instead of failing silently.
  form.addEventListener('submit', (e) => {
    if (!on) return;
    const gap = questions.findIndex((q) => !answered(q) && !skipped(q));
    if (gap !== -1) {
      e.preventDefault();
      e.stopImmediatePropagation();
      go(gap);
    }
  }, true);

  form.addEventListener('reset', () => {
    window.setTimeout(() => { i = 0; if (rubric) rubric.open = true; render(); }, 0);
  });

  render();
}
