import { SITE_URL } from '../config';

// Pages we want found. Privacy and Terms are noindex; the older single-area
// tools still work at their addresses but are no longer promoted (Nov 2026).
const pages = [
  '/', '/about', '/consulting', '/institutionalos', '/assessment', '/insights', '/methodology', '/dmv-nonprofit-health',
];

export function GET() {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${SITE_URL}${p === '/' ? '/' : p}</loc></url>`).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
