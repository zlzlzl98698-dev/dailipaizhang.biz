import fs from 'fs';
import crypto from 'crypto';

const svg = fs.readFileSync('C:/Users/Pro User/Desktop/aiwangluounk.my/public/favicon.svg', 'utf8');
const match = svg.match(/base64,([^\"']+)/);
if (match) {
  const buf = Buffer.from(match[1], 'base64');
  fs.writeFileSync('scripts/aiwangluo-favicon.webp', buf);
  console.log('Saved aiwangluo favicon, size:', buf.length, 'md5:', crypto.createHash('md5').update(buf).digest('hex'));
}
