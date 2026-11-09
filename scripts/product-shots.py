"""Regenerates the homepage product-preview screenshots.

Renders the real pages with a fictional sample organization and saves
1200x900 WebP images to public/assets/images/product/.

Usage (from the repo root, with `npx astro preview --port 4321` running):
    python3 scripts/product-shots.py [path/to/grantpass-backend]
The InstitutionalOS report shot needs a local checkout of grantpass-backend
(default: ../grantpass-backend). Requires playwright and pillow.
"""
import asyncio, io, json, os, sys
from playwright.async_api import async_playwright
from PIL import Image

SITE = 'http://localhost:4321'
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets', 'images', 'product')
GRANTPASS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..', '..', 'grantpass-backend')
HIDE = '.cookie-banner,.site-header,header{display:none!important}.reveal{opacity:1!important;transform:none!important}'

# Self-assessment answers (1-5) for a fictional organization: strong
# strategy, weak leadership bench, middling elsewhere.
ANS = {'p1': [4, 4, 3], 'p2': [3, 3, 2], 'p3': [2, 2, 3], 'p4': [3, 4, 3], 'p5': [4, 3, 3], 'p6': [3, 2, 3], 'p7': [4, 3, 2]}
NOW = '2026-11-09T15:00:00.000Z'
items = {f'self-assessment:{p}q{i+1}': {'v': v, 'at': NOW} for p, vals in ANS.items() for i, v in enumerate(vals)}
PROFILE = {
    'v': 1, 'items': items, 'metrics': {}, 'tools': {'self-assessment': {'at': NOW, 'scorePct': 54}},
    'seal': {'answers': {'claim': 'posted', 'mission': 'posted', 'focus': 'posted', 'contact': 'posted', 'people': 'posted', 'donate': 'posted',
                         'programs': 'posted', 'financials': 'ready', 'leader-demo': 'ready', 'board-demo': 'no', 'metric': 'no', 'goals': 'ready'}, 'at': NOW},
    'history': [
        {'at': '2026-08-10', 'dims': {'strategy': 58, 'program': 33, 'revenue': 33, 'leadership': 25, 'operations': 50, 'partnerships': 50, 'governance': 42}, 'seal': 'bronze'},
        {'at': '2026-11-09', 'dims': {'strategy': 67, 'program': 42, 'revenue': 42, 'leadership': 33, 'operations': 58, 'partnerships': 58, 'governance': 50}, 'seal': 'silver'},
    ],
}

REPORT = {
    'org': {'name': 'Sample Community Youth Alliance (fictional)'},
    'readiness': {
        'overall': 61.4, 'status': 'Developing', 'stage': 'SUSTAIN',
        'dimensions': [
            {'name': 'Strategy and Positioning', 'score': 68, 'level': 'yellow'},
            {'name': 'Program and Impact Evidence', 'score': 52, 'level': 'red'},
            {'name': 'Revenue and Financial Health', 'score': 58, 'level': 'yellow'},
            {'name': 'Leadership and Organizational Capacity', 'score': 44, 'level': 'red'},
            {'name': 'Operations and Infrastructure', 'score': 66, 'level': 'yellow'},
            {'name': 'Partnerships and Ecosystem', 'score': 63, 'level': 'yellow'},
            {'name': 'Governance and Risk', 'score': 71, 'level': 'yellow'},
        ],
        'candidSeal': {'current': 'silver', 'currentName': 'Silver', 'next': 'gold', 'nextName': 'Gold', 'note': 'Seals are earned in order and renewed yearly. Candid decides every Seal.',
                       'steps': [{'requirement': 'Audited financials or Form 990 for 2024 or 2025', 'dimension': 'governance', 'step': 'Upload the latest filed 990.'},
                                 {'requirement': 'Leader demographics', 'dimension': 'leadership', 'step': 'Leader completes the demographic fields.'}]},
    },
    'donorSustainability': {'hasData': False},
    'compliance': [],
}


def save(png: bytes, name: str):
    im = Image.open(io.BytesIO(png)).convert('RGB')
    w, h = im.size
    target = 4 / 3
    if w / h > target:
        nw = int(h * target); im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else:
        im = im.crop((0, 0, w, int(w / target)))
    im = im.resize((1200, 900), Image.LANCZOS)
    path = os.path.join(OUT, name)
    im.save(path, 'WEBP', quality=82, method=6)
    print('saved', path, os.path.getsize(path) // 1024, 'KB')


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width': 1000, 'height': 750}, device_scale_factor=2)
        await ctx.route('**/frankly-inspired-api.onrender.com/**', lambda r: r.fulfill(json={'ok': False}))
        await ctx.add_init_script(f"localStorage.setItem('fi_health_profile', {json.dumps(json.dumps(PROFILE))}); localStorage.setItem('fi_stage','sustain');")
        pg = await ctx.new_page()

        # 1. Health Index (narrower so more dimensions fit the 4:3 frame)
        await pg.set_viewport_size({'width': 760, 'height': 750})
        await pg.goto(SITE + '/health-index', wait_until='networkidle')
        await pg.add_style_tag(content=HIDE)
        # The seven dimension bars, with "+N since ..." progress on each.
        await pg.add_style_tag(content='#hi-dims{padding:28px 32px 8px;background:#fff;margin:0}')
        save(await pg.locator('#hi-dims').screenshot(), 'health-index.webp')

        # 2. Candid Seal Path results
        await pg.set_viewport_size({'width': 1000, 'height': 750})
        await pg.goto(SITE + '/candid-seal', wait_until='networkidle')
        await pg.add_style_tag(content=HIDE)
        await pg.click('#seal-form button[type=submit]')
        await pg.wait_for_timeout(400)
        save(await pg.locator('#seal-results').screenshot(), 'candid-seal.webp')

        # 3. InstitutionalOS client report
        report = os.path.abspath(os.path.join(GRANTPASS, 'dashboard', 'report.html'))
        if os.path.exists(report):
            await pg.route('**/public/report/**', lambda r: r.fulfill(json=REPORT))
            await pg.goto('file://' + report + '?token=sample', wait_until='networkidle')
            await pg.wait_for_timeout(500)
            save(await pg.screenshot(), 'diagnostic-report.webp')
        else:
            print('skipped report shot: grantpass-backend not found at', GRANTPASS)
        await b.close()

asyncio.run(main())
