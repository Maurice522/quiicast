// Notifies IndexNow-compatible engines (Bing, Yandex, Seznam, Naver) of every URL
// in the built sitemap. Run after a deploy: node scripts/indexnow.mjs
const HOST = 'quiicast.com';
const KEY = 'd4f47da77b413a110a79a78ab6af5341';

const sitemap = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList })
});
console.log(`IndexNow: submitted ${urlList.length} URLs -> HTTP ${res.status}`);
