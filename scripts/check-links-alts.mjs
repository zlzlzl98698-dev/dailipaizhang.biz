import fs from 'fs';
import path from 'path';
const distDir = 'docs/.vitepress/dist';
function getAllHtmlFiles(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results = results.concat(getAllHtmlFiles(full));
    else if (entry.name.endsWith('.html')) results.push(full);
  }
  return results;
}

let emptyHref = 0;
let missingAlt = 0;
let totalImgs = 0;
let totalLinks = 0;

for (const f of getAllHtmlFiles(distDir)) {
  const h = fs.readFileSync(f, 'utf8');
  const imgs = [...h.matchAll(/<img\b([^>]*)>/gi)];
  totalImgs += imgs.length;
  for (const img of imgs) {
    if (!img[1].includes('alt=') || /alt=["']\s*["']/.test(img[1])) {
      missingAlt++;
    }
  }
  const links = [...h.matchAll(/<a\b([^>]*)>/gi)];
  totalLinks += links.length;
  for (const a of links) {
    if (!a[1].includes('href=') || /href=["']\s*["']/.test(a[1])) {
      emptyHref++;
    }
  }
}

console.log('Total Links:', totalLinks, 'Empty/Missing Href:', emptyHref);
console.log('Total Images:', totalImgs, 'Missing Alt:', missingAlt);
