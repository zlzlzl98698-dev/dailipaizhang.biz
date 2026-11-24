import fs from 'fs';
import path from 'path';

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const errors = [];
  
  lines.forEach((line, idx) => {
    if (line.includes('|')) {
      const cells = line.split('|');
      cells.forEach((cell, cellIdx) => {
        const strongOpens = (cell.match(/<strong>/g) || []).length;
        const strongCloses = (cell.match(/<\/strong>/g) || []).length;
        if (strongOpens !== strongCloses) {
          errors.push({ lineNum: idx + 1, cellIdx, cell, diff: strongOpens - strongCloses });
        }
      });
    }
  });

  return errors;
}

function scanDir(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== '.vitepress' && f !== 'node_modules') scanDir(full);
    } else if (full.endsWith('.md')) {
      const errs = checkFile(full);
      if (errs.length > 0) {
        console.log(`File: ${full}`);
        errs.forEach(e => console.log(`  Line ${e.lineNum} Cell ${e.cellIdx}: ${e.cell}`));
      }
    }
  }
}

scanDir('docs');
