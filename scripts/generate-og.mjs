// Generates a 1200x630 share image per blog guide into public/og/<slug>.png.
// Run with: node scripts/generate-og.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const blogDir = path.resolve('src/content/blog');
const outDir = path.resolve('public/og');
fs.mkdirSync(outDir, { recursive: true });

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function wrap(text, max) {
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if ((line + ' ' + word).trim().length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = (line + ' ' + word).trim();
    }
  }
  if (line) lines.push(line);
  return lines;
}

function field(src, key) {
  const m = src.match(new RegExp(`^${key}:\\s*"((?:[^"\\\\]|\\\\.)*)"`, 'm'));
  return m ? JSON.parse(`"${m[1]}"`) : null;
}

for (const file of fs.readdirSync(blogDir).filter((f) => f.endsWith('.md'))) {
  const src = fs.readFileSync(path.join(blogDir, file), 'utf8');
  const slug = file.replace(/\.md$/, '');
  const title = field(src, 'seoTitle') ?? field(src, 'title');
  const lines = wrap(title, 26).slice(0, 4);
  const startY = 330 - ((lines.length - 1) * 78) / 2;
  const tspans = lines
    .map((l, i) => `<text x="80" y="${startY + i * 78}" font-size="66" font-weight="800" fill="#ffffff" font-family="Segoe UI, Arial, Helvetica, sans-serif">${esc(l)}</text>`)
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1e1b4b"/><stop offset="1" stop-color="#4338ca"/></linearGradient>
    <linearGradient id="q" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#818cf8"/><stop offset="1" stop-color="#4f46e5"/></linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1080" cy="110" r="220" fill="#6366f1" opacity="0.18"/>
  <rect x="80" y="64" width="64" height="64" rx="16" fill="url(#q)"/>
  <text x="112" y="108" font-size="40" font-weight="800" fill="#fff" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif">Q</text>
  <text x="162" y="108" font-size="36" font-weight="700" fill="#e0e7ff" font-family="Segoe UI, Arial, sans-serif">QuiiCast</text>
  ${tspans}
  <text x="80" y="570" font-size="30" fill="#c7d2fe" font-family="Segoe UI, Arial, sans-serif">quiicast.com  ·  free screen sharing, no sign-up</text>
</svg>`;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(path.join(outDir, `${slug}.png`));
  console.log('og:', slug, `(${lines.length} lines)`);
}
