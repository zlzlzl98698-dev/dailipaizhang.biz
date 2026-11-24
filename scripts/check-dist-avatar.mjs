import fs from 'fs';
import crypto from 'crypto';

function check(p) {
  if (fs.existsSync(p)) {
    const buf = fs.readFileSync(p);
    console.log(p, crypto.createHash('md5').update(buf).digest('hex'), buf.length);
  } else {
    console.log(p, 'DOES NOT EXIST');
  }
}

check('docs/public/images/site-avatar.webp');
check('docs/.vitepress/dist/images/site-avatar.webp');
check('docs/public/favicon.svg');
check('docs/.vitepress/dist/favicon.svg');
