// "What's happening right now?": the trigger event that brought a visitor
// to a free tool. Asked once at the top of every tool and remembered across
// tools in this browser (localStorage fi_trigger). The results pathway uses
// it to name the matching Diagnostic, and it is sent with the anonymous
// score log and with emailed results, so Frankly Inspired can see which
// situations are most common (the "problem rate").

export type TriggerKey = 'expansion' | 'funder' | 'founder' | 'strain' | 'transition' | 'checkup';

export const TRIGGERS: Record<TriggerKey, { label: string; door: string; question: string }> = {
  expansion: {
    label: "We're adding a site, city, or major program",
    door: 'Expansion Readiness',
    question: 'Can the organization carry the new site or program without weakening what already works?',
  },
  funder: {
    label: "We're going after bigger funding, or a major grant is ending",
    door: 'Funder Readiness',
    question: "Will your evidence, governance, and finances hold up to a larger funder's review?",
  },
  founder: {
    label: 'Too much still depends on one leader',
    door: 'Founder Dependence',
    question: 'What has to be written down and handed off so the organization runs without one person?',
  },
  strain: {
    label: "We're growing, but staff and systems are stretched",
    door: 'Capacity Strain',
    question: 'Is the real problem headcount, or decision rights, workflow, or revenue quality?',
  },
  transition: {
    label: 'A leadership change is coming',
    door: 'Leadership Transition',
    question: 'Which knowledge, relationships, and authority have to transfer first?',
  },
  checkup: {
    label: 'Nothing specific, just a check-up',
    door: '',
    question: '',
  },
};

const KEY = 'fi_trigger';
const isKey = (v: unknown): v is TriggerKey => typeof v === 'string' && v in TRIGGERS;

export function getTrigger(): TriggerKey | null {
  try { const v = localStorage.getItem(KEY); return isKey(v) ? v : null; } catch { return null; }
}

function setTrigger(k: TriggerKey) {
  try { localStorage.setItem(KEY, k); } catch { /* still works on this page */ }
}

/** Inserts the question at the top of a tool's form. Optional: a visitor
 * can skip it and answer the questions as before. Buttons, not radios, so
 * the stepper's 1-5 keys never answer it by accident. */
export function mountTriggerPicker(form: HTMLFormElement | null, tool: string) {
  if (!form || form.querySelector('.trigger-picker')) return;
  const box = document.createElement('div');
  box.className = 'trigger-picker';
  box.innerHTML = `
    <p class="trigger-q" id="trigger-q-${tool}">First, what's happening at your organization right now? <span>Optional. It shapes your results.</span></p>
    <div class="trigger-options" role="group" aria-labelledby="trigger-q-${tool}">
      ${(Object.keys(TRIGGERS) as TriggerKey[]).map((k) => `<button type="button" class="trigger-option" data-trigger="${k}" aria-pressed="false">${TRIGGERS[k].label}</button>`).join('')}
    </div>`;
  form.insertBefore(box, form.firstChild);
  const paint = () => {
    const cur = getTrigger();
    box.querySelectorAll<HTMLButtonElement>('.trigger-option').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.trigger === cur));
    });
  };
  box.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>('.trigger-option');
    if (!b || !isKey(b.dataset.trigger)) return;
    setTrigger(b.dataset.trigger);
    paint();
    (window as any).fiTrack?.('trigger_selected', { trigger: b.dataset.trigger, tool });
  });
  paint();
}

/** One line for the results pathway when a trigger was chosen. */
export function triggerRecHtml(): string {
  const k = getTrigger();
  if (!k || k === 'checkup') return '';
  const t = TRIGGERS[k];
  return `<p class="pathway-trigger">You said: <strong>${t.label.toLowerCase()}</strong>. The <strong>${t.door} Diagnostic</strong> answers one question: ${t.question}</p>`;
}
