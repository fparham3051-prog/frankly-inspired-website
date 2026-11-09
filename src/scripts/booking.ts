// Opens Calendly booking on the page instead of in a new tab.
//
// Every "Schedule" link on the site points at the Calendly page, so this is
// progressive enhancement: a click on any such link opens Calendly's popup
// over the current page. Calendly's script and stylesheet load only on that
// first click (nothing from Calendly loads for visitors who never book). If
// the script can't load, or the visitor holds a modifier key to open a new
// tab, the link behaves exactly as before.

const CALENDLY_HOST = 'calendly.com';
const WIDGET_JS = 'https://assets.calendly.com/assets/external/widget.js';
const WIDGET_CSS = 'https://assets.calendly.com/assets/external/widget.css';

declare global {
  interface Window { Calendly?: { initPopupWidget: (o: { url: string }) => void } }
}

let loading: Promise<boolean> | null = null;

function loadWidget(): Promise<boolean> {
  if (window.Calendly) return Promise.resolve(true);
  if (loading) return loading;
  loading = new Promise((resolve) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = WIDGET_CSS;
    document.head.appendChild(css);
    const js = document.createElement('script');
    js.src = WIDGET_JS;
    js.async = true;
    const timer = window.setTimeout(() => resolve(false), 5000);
    js.onload = () => { window.clearTimeout(timer); resolve(!!window.Calendly); };
    js.onerror = () => { window.clearTimeout(timer); resolve(false); };
    document.head.appendChild(js);
  });
  loading.then((ok) => { if (!ok) loading = null; });
  return loading;
}

function bookingUrl(href: string): string {
  const u = new URL(href);
  u.searchParams.set('hide_gdpr_banner', '1');
  // Tells Franklin which page the booking came from (shown in Calendly).
  u.searchParams.set('utm_source', 'website');
  u.searchParams.set('utm_content', location.pathname.replace(/\/+$/, '') || '/');
  return u.toString();
}

export function enableInlineBooking() {
  document.addEventListener('click', async (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!a) return;
    let url: URL;
    try { url = new URL(a.href); } catch { return; }
    if (url.hostname !== CALENDLY_HOST && !url.hostname.endsWith('.' + CALENDLY_HOST)) return;
    e.preventDefault();
    const ok = await loadWidget();
    if (ok && window.Calendly) {
      window.Calendly.initPopupWidget({ url: bookingUrl(a.href) });
    } else {
      // Opened after a wait, a new tab would be caught by pop-up blockers,
      // so the fallback goes to Calendly in this tab.
      window.location.assign(a.href);
    }
  });
}
