import fs from 'fs';
import path from 'path';

const distDir = 'docs/.vitepress/dist';
const sitemapPath = path.join(distDir, 'sitemap.xml');

// 1. Sitemap verification
const sitemapXml = fs.readFileSync(sitemapPath, 'utf8');
const sitemapUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
console.log('Total sitemap URLs:', sitemapUrls.length);

// Check if any sitemap URL has 404, .html, or uppercase
const badSitemap = sitemapUrls.filter(u => u.includes('404') || u.endsWith('.html') || /[A-Z]/.test(u.replace('https://dailipaizhang.biz', '')));
console.log('Bad sitemap URLs count:', badSitemap.length, badSitemap);

// 2. Sample 30 pages Canonical & Title Check
const sampleUrls = [
  '/',
  '/airport/',
  '/airport/stable/',
  '/airport/articles/how-to-judge-peak-stability',
  '/pricing/',
  '/pricing/budget/',
  '/pricing/articles/annual-to-monthly-calculation',
  '/brands/',
  '/brands/guangsuyun/',
  '/brands/feimao/',
  '/reviews/',
  '/reviews/guangsuyun/',
  '/reviews/feimao/',
  '/reviews/dalaoyun/',
  '/compare/',
  '/compare/guangsuyun-vs-feimao/',
  '/compare/tier-20-yuan-monthly-comparison/',
  '/vpn/',
  '/vpn/articles/vpn-vs-proxy-architecture',
  '/clients/',
  '/clients/clash-verge/',
  '/clients/articles/clash-verge-rev-install-guide',
  '/ai-media/',
  '/ai-media/chatgpt/',
  '/ai-media/articles/chatgpt-region-unsupported-fix',
  '/routes/',
  '/routes/iepl/',
  '/routes/articles/how-to-spot-unverified-iepl',
  '/guides/',
  '/guides/articles/iphone-shadowrocket-add-sub',
  '/troubleshooting/',
  '/troubleshooting/articles/sub-http-401-403-404-503',
  '/security/',
  '/security/articles/checklist-before-switching-airport'
];

console.log('Sampling 34 pages for Canonical verification:');
let canonicalResults = [];
for (const urlPath of sampleUrls) {
  let filePath = urlPath === '/' ? 'index.html' : (urlPath.endsWith('/') ? urlPath.slice(1) + 'index.html' : urlPath.slice(1) + '.html');
  const full = path.join(distDir, filePath);
  if (!fs.existsSync(full)) {
    console.log('File missing for:', urlPath, 'looked at:', full);
    continue;
  }
  const html = fs.readFileSync(full, 'utf8');
  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/is);
  const robotsMatch = html.match(/<meta[^>]+name=["']robots["'][^>]*content=["']([^"']+)["']/i);
  const canonical = canonicalMatch ? canonicalMatch[1] : 'NONE';
  const title = titleMatch ? titleMatch[1] : 'NONE';
  const h1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : 'NONE';
  const robots = robotsMatch ? robotsMatch[1] : 'index,follow(default)';
  
  canonicalResults.push({ urlPath, canonical, title, h1, robots, matchesSelf: canonical === `https://dailipaizhang.biz${urlPath}` });
}

console.log('Sampled pages checked:', canonicalResults.length);
const mismatch = canonicalResults.filter(r => !r.matchesSelf);
console.log('Canonical mismatches in sample:', mismatch.length);
if (mismatch.length > 0) console.log(mismatch);

// 3. Check SSG vs CSR: Measure raw text in <main> of HTML without running JS
let mainHasContent = true;
for (const r of canonicalResults.slice(0, 10)) {
  let filePath = r.urlPath === '/' ? 'index.html' : (r.urlPath.endsWith('/') ? r.urlPath.slice(1) + 'index.html' : r.urlPath.slice(1) + '.html');
  const full = path.join(distDir, filePath);
  const html = fs.readFileSync(full, 'utf8');
  const mainIdx = html.indexOf('<main');
  const mainClose = html.indexOf('</main>');
  const mainLength = (mainIdx !== -1 && mainClose !== -1) ? (mainClose - mainIdx) : 0;
  console.log(`SSG HTML check for ${r.urlPath}: <main> size = ${mainLength} bytes`);
}

// 4. Check .htaccess configuration
const htaccessPath = path.join(distDir, '.htaccess');
console.log('.htaccess exists in dist:', fs.existsSync(htaccessPath));
if (fs.existsSync(htaccessPath)) {
  console.log('.htaccess content:\n', fs.readFileSync(htaccessPath, 'utf8'));
}
