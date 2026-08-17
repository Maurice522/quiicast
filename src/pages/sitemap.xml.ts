import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Static, always-present routes. Error pages (404/500) are deliberately
// excluded — a sitemap tells crawlers "please index this", which is never
// true for an error page.
const STATIC_PATHS = [
  '/',
  '/caster',
  '/receiver',
  '/how-it-works',
  '/blog',
  '/faq',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms'
];

export const GET: APIRoute = async ({ site }) => {
  const base = site?.toString().replace(/\/$/, '') ?? 'https://quiicast.com';

  const posts = await getCollection('blog');
  const blogUrls = posts.map((post) => ({
    loc: `${base}/blog/${post.id}`,
    lastmod: post.data.publishDate.toISOString().slice(0, 10)
  }));

  const staticUrls = STATIC_PATHS.map((path) => ({
    loc: path === '/' ? `${base}/` : `${base}${path}`,
    lastmod: undefined as string | undefined
  }));

  const urls = [...staticUrls, ...blogUrls];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
};
