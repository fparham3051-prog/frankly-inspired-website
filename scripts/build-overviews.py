"""Renders the two-page Diagnostic overviews to PDF.

    python3 scripts/build-overviews.py

Reads scripts/overviews/{leader,funder}.html (brand fonts are bundled in
scripts/overviews/fonts, so no network is needed) and writes
public/assets/docs/institutionalos-diagnostic-overview.pdf and
public/assets/docs/funder-cohort-overview.pdf. Re-run after editing the
HTML, then commit the PDFs. Both are linked from /consulting.
"""
import asyncio
import pathlib

from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "scripts" / "overviews"
OUT = ROOT / "public" / "assets" / "docs"
DOCS = {
    "leader.html": "institutionalos-diagnostic-overview.pdf",
    "funder.html": "funder-cohort-overview.pdf",
}


async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        for src, out in DOCS.items():
            await page.goto((SRC / src).as_uri(), wait_until="networkidle")
            await page.evaluate("document.fonts.ready")
            # A page fails if its content reaches the footer line.
            overflow = await page.evaluate(
                """[...document.querySelectorAll('.page')].map(p => {
                     const foot = p.querySelector('.foot');
                     const kids = [...p.children].filter(c => c !== foot);
                     const bottom = Math.max(...kids.map(c => c.getBoundingClientRect().bottom));
                     return foot ? bottom > foot.getBoundingClientRect().top - 4 : p.scrollHeight > p.clientHeight + 1;
                   })"""
            )
            if any(overflow):
                raise SystemExit(f"{src}: content runs into the footer on page(s) {[i + 1 for i, o in enumerate(overflow) if o]}")
            await page.pdf(path=str(OUT / out), format="Letter", print_background=True, prefer_css_page_size=True)
            print("wrote", (OUT / out).relative_to(ROOT))
        await browser.close()


asyncio.run(main())
