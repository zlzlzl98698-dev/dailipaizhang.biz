import fs from 'fs';
import path from 'path';

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('strong>')) return;

  // Replace <strong> and </strong> with **
  content = content.replace(/<\/?strong[^>]*>/gi, '**');
  // Collapse quadruple asterisks
  content = content.replace(/\*{4,}/g, '**');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Replaced raw strong in: ${filePath}`);
}

function scanDir(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== '.vitepress' && f !== 'node_modules' && f !== 'dist') scanDir(full);
    } else if (full.endsWith('.md')) {
      fixFile(full);
    }
  }
}

scanDir('docs');
console.log('Finished converting raw strong tags to Markdown bold!');
