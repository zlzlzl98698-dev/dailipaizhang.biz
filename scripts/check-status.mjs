import fs from 'fs';

const brandsFile = fs.readFileSync('docs/.vitepress/theme/utils/siteData.ts', 'utf8');
const slugMatches = [...brandsFile.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
console.log('Total brand slugs in siteData:', slugMatches.length, slugMatches);

const existingReviews = fs.readdirSync('docs/reviews').filter(f => {
  const p = 'docs/reviews/' + f;
  return fs.statSync(p).isDirectory() && fs.existsSync(p + '/index.md');
});
console.log('Existing review count:', existingReviews.length);
const missingReviews = slugMatches.filter(s => !existingReviews.includes(s));
console.log('Missing review dirs:', missingReviews);

// Check compare pages
const existingCompares = fs.readdirSync('docs/compare').filter(f => {
  const p = 'docs/compare/' + f;
  return fs.statSync(p).isDirectory() && fs.existsSync(p + '/index.md');
});
console.log('Existing compare count:', existingCompares.length, existingCompares);

// Check reports
const existingReports = fs.existsSync('reports') ? fs.readdirSync('reports') : [];
console.log('Existing reports count:', existingReports.length, existingReports);
