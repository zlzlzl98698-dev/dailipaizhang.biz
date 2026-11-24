import fs from 'fs';
import crypto from 'crypto';

const svg = fs.readFileSync('docs/public/favicon.svg', 'utf8');
const match = svg.match(/base64,([^\"]+)/);
if (match) {
  const buf = Buffer.from(match[1], 'base64');
  const h1 = crypto.createHash('md5').update(buf).digest('hex');
  const mouseBuf = fs.readFileSync('C:/Users/Pro User/.gemini/antigravity/brain/d65de509-237b-4fef-b658-2ad1720e5fec/.user_uploaded/media_1795439267149_ecc3749e.webp');
  const h2 = crypto.createHash('md5').update(mouseBuf).digest('hex');
  console.log('favicon inner webp md5:', h1);
  console.log('mouse webp md5:        ', h2);
}
const siteAvatarBuf = fs.readFileSync('docs/public/images/site-avatar.webp');
console.log('site-avatar.webp md5:  ', crypto.createHash('md5').update(siteAvatarBuf).digest('hex'));
