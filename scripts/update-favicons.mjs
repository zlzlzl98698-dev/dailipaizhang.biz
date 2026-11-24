import fs from 'fs';

const png16 = fs.readFileSync('rendered_avatar_16.png');
const png32 = fs.readFileSync('rendered_avatar_32.png');
const png64 = fs.readFileSync('rendered_avatar.png');

// 1. Generate multi-resolution ICO
const images = [
  { w: 16, h: 16, buf: png16 },
  { w: 32, h: 32, buf: png32 },
  { w: 64, h: 64, buf: png64 }
];

const count = images.length;
const dirHeader = Buffer.alloc(6);
dirHeader.writeUInt16LE(0, 0); // reserved
dirHeader.writeUInt16LE(1, 2); // ICO type
dirHeader.writeUInt16LE(count, 4);

let offset = 6 + count * 16;
const entries = [];
for (const img of images) {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(img.w >= 256 ? 0 : img.w, 0);
  entry.writeUInt8(img.h >= 256 ? 0 : img.h, 1);
  entry.writeUInt8(0, 2); // color palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bpp
  entry.writeUInt32LE(img.buf.length, 8); // size
  entry.writeUInt32LE(offset, 12); // offset
  entries.push(entry);
  offset += img.buf.length;
}

const icoBuffer = Buffer.concat([dirHeader, ...entries, ...images.map(img => img.buf)]);
fs.writeFileSync('docs/public/favicon.ico', icoBuffer);
if (fs.existsSync('docs/.vitepress/dist')) {
  fs.writeFileSync('docs/.vitepress/dist/favicon.ico', icoBuffer);
}
fs.writeFileSync('docs/public/favicon.png', png32);
if (fs.existsSync('docs/.vitepress/dist')) {
  fs.writeFileSync('docs/.vitepress/dist/favicon.png', png32);
}

// 2. Update favicon.svg with Base64 PNG
const b64 = png64.toString('base64');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <clipPath id="r">
      <rect x="0" y="0" width="64" height="64" rx="14" ry="14" />
    </clipPath>
  </defs>
  <image href="data:image/png;base64,${b64}" width="64" height="64" preserveAspectRatio="xMidYMid slice" clip-path="url(#r)" />
</svg>
`;
fs.writeFileSync('docs/public/favicon.svg', svg, 'utf8');
if (fs.existsSync('docs/.vitepress/dist')) {
  fs.writeFileSync('docs/.vitepress/dist/favicon.svg', svg, 'utf8');
}

// 3. Export data-URI for HTML head
const dataUri32 = `data:image/png;base64,${png32.toString('base64')}`;
console.log('FAVICON_DATA_URI_32_LENGTH:', dataUri32.length);
console.log('SUCCESS');
