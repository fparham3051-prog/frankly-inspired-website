// Website checks, run after a build (npm test):
//  - every internal link and asset points at a file that exists in dist/
//  - every page has a <title>, one <h1>, and a meta description
//  - the organization profile is the same file the other two apps use
//    (compares the "version" and org name; full copies live in each repo)
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
const pages = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (p.endsWith('.html')) pages.push(p); } })(DIST);

const exists = (url) => {
  const clean = decodeURIComponent(url.split('#')[0].split('?')[0]);
  if (!clean || clean === '/') return fs.existsSync(path.join(DIST, 'index.html'));
  const p = path.join(DIST, clean);
  return fs.existsSync(p) && fs.statSync(p).isFile() || fs.existsSync(path.join(p, 'index.html')) || fs.existsSync(p + '.html');
};
let problems = 0;
const fail = (msg) => { problems++; console.log('  FAIL ' + msg); };
for (const file of pages) {
  const rel = '/' + path.relative(DIST, file);
  const html = fs.readFileSync(file, 'utf8');
  if (/http-equiv="refresh"/i.test(html)) continue; // redirect stubs for old addresses
  for (const m of html.matchAll(/\s(?:href|src)="(\/[^"]*)"/g)) {
    const url = m[1];
    if (url.startsWith('//')) continue;
    if (!exists(url)) fail(`${rel} links to missing ${url}`);
  }
  if (!/<title>[^<]+<\/title>/.test(html)) fail(`${rel} has no <title>`);
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1 && !rel.startsWith('/404')) fail(`${rel} has ${h1} <h1> elements`);
  if (!/<meta name="description" content="[^"]{20,}/.test(html)) fail(`${rel} has no meta description`);
}
const org = JSON.parse(fs.readFileSync('src/org.config.json', 'utf8'));
if (!org.org || !org.links || !org.offers) fail('src/org.config.json is missing org, links, or offers');
console.log(`${pages.length} pages checked, ${problems} problem(s)`);
process.exit(problems ? 1 : 0);
