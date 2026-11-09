import { SITE_URL } from '../config';

// Every indexable page. Privacy and Terms are noindex, so they're left out.
const pages = [
  '/', '/about', '/institutionalos', '/tools', '/insights', '/assessment',
  '/revenue-growth-score', '/institutional-advancement-score',
  '/leadership-health', '/sustainability-score',
];

export function GET() {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${SITE_URL}${p === '/' ? '/' : p}</loc></url>`).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
