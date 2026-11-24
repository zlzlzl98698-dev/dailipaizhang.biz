import fs from 'fs';
import path from 'path';

const distDir = 'docs/.vitepress/dist';
const siteUrl = 'https://dailipaizhang.biz';

console.log('=== Starting Preventive SEO & GEO Audit Scan ===');

// 1. Robots.txt
const robotsTxtPath = path.join(distDir, 'robots.txt');
const robotsExists = fs.existsSync(robotsTxtPath);
const robotsContent = robotsExists ? fs.readFileSync(robotsTxtPath, 'utf8') : '';
console.log('robots.txt exists:', robotsExists);
console.log('robots.txt content:\n', robotsContent);

// 2. Sitemap.xml
const sitemapPath = path.join(distDir, 'sitemap.xml');
const sitemapExists = fs.existsSync(sitemapPath);
let sitemapUrls = [];
if (sitemapExists) {
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  const locMatches = [...sitemapContent.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  sitemapUrls = locMatches;
  console.log('sitemap.xml exists: true, total URLs:', sitemapUrls.length);
} else {
  console.log('sitemap.xml exists: false');
}

// 3. Scan all HTML files in dist
function getAllHtmlFiles(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAllHtmlFiles(full));
    } else if (entry.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

const htmlFiles = getAllHtmlFiles(distDir);
console.log('Total HTML files in dist:', htmlFiles.length);

// 4. Sample 30 pages and check canonical, title, robots meta, jsonld, external links
let issues = {
  robots: [],
  sitemap: [],
  canonical: [],
  csrVsSsg: [],
  emptyLinks: [],
  externalNoFollow: [],
  whoisLeak: [],
  thinContent: [],
  jsonLd: [],
  meta: []
};

// Check tracking codes across all HTML
let trackingCodes = new Set();
let leakPatterns = [/192\.168\./, /10\.\d+\.\d+\.\d+/, /172\.(1[6-9]|2\d|3[01])\./, /C:\\Users\\/i, /webpack:\/\//, /file:\/\/\//];

let externalLinksTotal = 0;
let externalLinksCompliant = 0;
let externalLinksNonCompliant = [];

let thinPages = [];
let wordCounts = [];

for (const f of htmlFiles) {
  const rel = path.relative(distDir, f).replace(/\\/g, '/');
  const html = fs.readFileSync(f, 'utf8');

  // GA / Baidu / Ads
  const gaMatch = html.match(/G-[A-Z0-9]{6,12}/g);
  if (gaMatch) gaMatch.forEach(id => trackingCodes.add(`GA:${id}`));
  const baiduMatch = html.match(/hm\.baidu\.com\/hm\.js\?([a-f0-9]{32})/g);
  if (baiduMatch) baiduMatch.forEach(id => trackingCodes.add(`Baidu:${id}`));
  const adsenseMatch = html.match(/ca-pub-\d{16}/g);
  if (adsenseMatch) adsenseMatch.forEach(id => trackingCodes.add(`AdSense:${id}`));

  // Infrastructure leaks
  for (const pat of leakPatterns) {
    if (pat.test(html)) {
      // ignore user docs that intentionally explain private IP 192.168.
      if (!html.includes('192.168.0.0/16') && !html.includes('192.168.1.1')) {
        issues.whoisLeak.push({ file: rel, match: pat.toString() });
      }
    }
  }

  // Canonical check
  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  if (!canonicalMatch) {
    if (!rel.includes('404.html')) issues.canonical.push({ file: rel, issue: 'missing-canonical' });
  } else {
    const cUrl = canonicalMatch[1];
    if (!cUrl.startsWith('https://dailipaizhang.biz')) {
      issues.canonical.push({ file: rel, issue: 'non-https-or-wrong-domain', url: cUrl });
    }
    if (cUrl.endsWith('.html') || (cUrl.endsWith('/') && cUrl !== 'https://dailipaizhang.biz/')) {
      // VitePress cleanUrls produces canonical without trailing slash for subpaths, e.g. /airport
    }
  }

  // Empty <a> tags or javascript: void(0)
  const aTags = [...html.matchAll(/<a\b([^>]*)>(.*?)<\/a>/gis)];
  for (const a of aTags) {
    const attrs = a[1];
    const text = a[2];
    const hrefMatch = attrs.match(/href=["']([^"']*)["']/i);
    if (!hrefMatch || hrefMatch[1].trim() === '' || hrefMatch[1] === '#') {
      // ignore jump anchors if they have id or aria
      if (!attrs.includes('id=') && !attrs.includes('name=')) {
        // issues.emptyLinks.push({ file: rel, snippet: a[0].slice(0, 100) });
      }
    } else {
      const href = hrefMatch[1];
      if (href.startsWith('http://') || href.startsWith('https://')) {
        if (!href.startsWith(siteUrl)) {
          externalLinksTotal++;
          const relAttr = attrs.match(/rel=["']([^"']*)["']/i);
          const hasNofollow = relAttr && relAttr[1].includes('nofollow');
          const hasSponsored = relAttr && relAttr[1].includes('sponsored');
          const isAffiliate = href.includes('aff') || href.includes('code=') || href.includes('register') || href.includes('ref=');
          
          if (isAffiliate && (!hasNofollow || !hasSponsored)) {
            externalLinksNonCompliant.push({ file: rel, href, rel: relAttr ? relAttr[1] : 'none' });
          } else {
            externalLinksCompliant++;
          }
        }
      }
    }
  }

  // Word count (CJK characters in main body)
  const mainMatch = html.match(/<main\b[^>]*>(.*?)<\/main>/is);
  if (mainMatch) {
    const mainText = mainMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, '');
    const cjkChars = (mainText.match(/[\u4e00-\u9fa5]/g) || []).length;
    wordCounts.push({ file: rel, cjkChars });
    if (cjkChars < 1000 && !rel.includes('404.html') && rel !== 'index.html') {
      thinPages.push({ file: rel, cjkChars });
    }
  }

  // Check JSON-LD
  const jsonLdScripts = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis)];
  for (const s of jsonLdScripts) {
    try {
      JSON.parse(s[1]);
    } catch (e) {
      issues.jsonLd.push({ file: rel, error: e.message });
    }
  }
}

console.log('=== Scan Results Summary ===');
console.log('Tracking codes found:', [...trackingCodes]);
console.log('External links checked:', externalLinksTotal, 'Compliant:', externalLinksCompliant, 'Non-compliant commercial:', externalLinksNonCompliant.length);
if (externalLinksNonCompliant.length > 0) {
  console.log('Non-compliant commercial sample:', externalLinksNonCompliant.slice(0, 5));
}
console.log('Canonical errors:', issues.canonical.length);
if (issues.canonical.length > 0) console.log('Canonical errors sample:', issues.canonical.slice(0, 5));
console.log('Infrastructure/Whois leak issues:', issues.whoisLeak.length);
console.log('JSON-LD syntax errors:', issues.jsonLd.length);
console.log('Thin pages (<1000 CJK):', thinPages.length);
if (thinPages.length > 0) console.log('Thin pages sample:', thinPages.slice(0, 5));

const avgCjk = Math.round(wordCounts.reduce((a, b) => a + b.cjkChars, 0) / wordCounts.length);
console.log('Average CJK count per page:', avgCjk);
console.log('Min CJK count:', Math.min(...wordCounts.map(w => w.cjkChars)), 'Max:', Math.max(...wordCounts.map(w => w.cjkChars)));
