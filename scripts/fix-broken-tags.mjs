import fs from 'fs';

const filesToFix = [
  'docs/guides/articles/iphone-shadowrocket-add-sub.md',
  'docs/reviews/quanqiu/index.md',
  'docs/routes/articles/how-to-spot-unverified-iepl.md',
  'docs/routes/articles/low-ping-vs-download-speed.md',
  'docs/security/articles/checklist-before-switching-airport.md',
  'docs/security/articles/how-to-preserve-payment-evidence.md'
];

for (const rel of filesToFix) {
  let content = fs.readFileSync(rel, 'utf8');

  // Fix quanqiu line 39 where | is inside `JP|01`
  if (rel.includes('quanqiu')) {
    content = content.replace(/`JP\|01`/g, '`JP-01`');
  }

  // Replace any broken table cell <strong>
  const lines = content.split('\n');
  const newLines = lines.map(line => {
    if (!line.includes('|')) return line;
    
    // Replace <strong> and </strong> inside table lines with markdown bold **
    // or fix unclosed ones within each cell
    const cells = line.split('|');
    const newCells = cells.map(cell => {
      let c = cell;
      // If a cell has <strong> without </strong>, close it or convert to **
      // If a cell has </strong> without <strong>, open it or convert to **
      const openCount = (c.match(/<strong>/g) || []).length;
      const closeCount = (c.match(/<\/strong>/g) || []).length;
      if (openCount !== closeCount) {
        c = c.replace(/<strong>/g, '**').replace(/<\/strong>/g, '**');
      }
      return c;
    });
    return newCells.join('|');
  });

  fs.writeFileSync(rel, newLines.join('\n'), 'utf8');
  console.log(`Cleaned tags in ${rel}`);
}
