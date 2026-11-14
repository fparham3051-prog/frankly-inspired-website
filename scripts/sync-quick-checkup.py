#!/usr/bin/env python3
"""Copy the InstitutionalOS quick scorecard onto franklyinspired.associates.

Source of truth: grantpass-backend/landing/index.html (also served at
grantpass-landing.onrender.com, which FIOS embeds with ?fios=1).
This script writes public/quick-check-up/index.html with the Frankly
Inspired header and the site's naming ("Quick Check-up"), so visitors never
leave the main domain. Re-run after editing the landing page:

    python3 scripts/sync-quick-checkup.py [path/to/landing/index.html]
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT.parent / 'grantpass-backend' / 'landing' / 'index.html'
OUT = ROOT / 'public' / 'quick-check-up' / 'index.html'
CAL = 'https://calendly.com/fparham/30min'

s = SRC.read_text()

def sub(pattern, repl, flags=re.S, required=True):
    global s
    s2, n = re.subn(pattern, repl, s, flags=flags)
    if required and n == 0:
        sys.exit(f'sync-quick-checkup: pattern not found: {pattern[:60]}')
    s = s2

sub(r'<title>.*?</title>', '<title>Quick Check-up | Frankly Inspired</title>\n'
    '<link rel="canonical" href="https://franklyinspired.associates/quick-check-up/">\n'
    '<link rel="icon" href="/favicon.svg" type="image/svg+xml">')
sub(r'</style>', """  /* Frankly Inspired header (added by sync-quick-checkup.py) */
  .logo{white-space:nowrap}
  .hs-no,.needs-work .tag{color:#7A5F27 !important}
  .btn-primary{background:var(--gold) !important;color:var(--navy-deep) !important;border-color:var(--gold) !important}
  footer .wrap{color:#5f6b77 !important}
  footer .wrap a{color:var(--navy) !important}
  @media (max-width:560px){ nav .nav-text{display:none} nav .btn{padding:9px 14px} nav .btn .long{display:none} }
  @media (min-width:561px){ nav .btn .short{display:none} }
</style>""", required=True)
sub(r'<div class="breadcrumb">.*?</header>', f'''<header>
  <div class="wrap">
    <a class="logo" href="/" style="text-decoration:none"><img src="/assets/images/logo-mark.svg" alt="" width="21" height="30"> Frankly Inspired</a>
    <nav aria-label="Primary">
      <a class="nav-text" href="/tools">Free Check-up</a>
      <a href="{CAL}" class="btn btn-primary" target="_blank" rel="noopener"><span class="long">Schedule a Conversation</span><span class="short">Schedule</span></a>
    </nav>
  </div>
</header>''')
# One name for the free tool across the site.
for a, b in [
    ('Score My Org — Free', 'Start the Quick Check-up'),
    ('Free scorecard. No account required.', 'Free. No account required.'),
    ('This free scorecard is the self-service read.', 'This quick check-up is the self-service read.'),
    ('<div class="kicker">Live scorecard</div>', '<div class="kicker">Quick Check-up · about 2 minutes</div>'),
    ('https://franklyinspired.associates/#pricing', '/consulting#pricing'),
]:
    if a not in s:
        sys.exit(f'sync-quick-checkup: text not found: {a}')
    s = s.replace(a, b)
s = s.replace('href="https://franklyinspired.associates/assessment"', 'href="/assessment"')
# Cookie-free visit count for the funnel (page and date only), same as the rest of the site.
sub(r'</body>', """<script>try{if(!/^(localhost|127\\.)/.test(location.hostname))navigator.sendBeacon('https://frankly-inspired-api.onrender.com/api/pv',JSON.stringify({p:'/quick-check-up',e:'view'}))}catch(e){}</script>
</body>""")

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(s)
print(f'wrote {OUT.relative_to(ROOT)} ({len(s):,} bytes)')
