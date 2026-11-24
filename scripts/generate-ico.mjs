import fs from 'fs';

// Generate a 32x32 32-bit RGBA ICO file depicting the mouse icon
const size = 32;
const rgba = Buffer.alloc(size * size * 4, 0); // 32x32 RGBA

function setPixel(x, y, r, g, b, a = 255) {
  if (x < 0 || x >= size || y < 0 || y >= size) return;
  // In BMP DIB, rows are stored bottom-up
  const row = (size - 1 - y);
  const idx = (row * size + x) * 4;
  rgba[idx + 0] = b; // BGRA in BMP
  rgba[idx + 1] = g;
  rgba[idx + 2] = r;
  rgba[idx + 3] = a;
}

function fillCircle(cx, cy, radius, r, g, b, a = 255) {
  for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y++) {
    for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x++) {
      const dist = Math.hypot(x - cx, y - cy);
      if (dist <= radius) {
        setPixel(x, y, r, g, b, a);
      }
    }
  }
}

// Draw mouse avatar:
// 1. Ears (Left cx=8, cy=9, r=6; Right cx=24, cy=9, r=6) - Dark/Grey with Purple inside
fillCircle(8, 9, 6.5, 30, 30, 30); // outer ear border
fillCircle(8, 9, 5.5, 170, 170, 175); // outer ear grey
fillCircle(8, 9, 4, 110, 40, 120); // inner purple
fillCircle(24, 9, 6.5, 30, 30, 30); // outer ear border
fillCircle(24, 9, 5.5, 170, 170, 175); // outer ear grey
fillCircle(24, 9, 4, 110, 40, 120); // inner purple

// 2. Head (cx=16, cy=18, r=11) - Grey #B0B0B8 with dark border
fillCircle(16, 18, 11.5, 30, 30, 30);
fillCircle(16, 18, 10.5, 185, 185, 192);

// 3. Eyes (Left: cx=12, cy=15; Right: cx=20, cy=15)
fillCircle(12, 15, 2.5, 30, 30, 30);
setPixel(11, 14, 255, 255, 255); // eye shine
fillCircle(20, 15, 2.5, 30, 30, 30);
setPixel(19, 14, 255, 255, 255); // eye shine

// 4. Nose (cx=16, cy=20, r=2.5) - Purple/Pink
fillCircle(16, 20, 2.8, 40, 20, 40);
fillCircle(16, 20, 2.2, 140, 60, 130);
setPixel(15, 19, 230, 160, 220); // nose highlight

// 5. Whiskers (simple dark lines)
setPixel(8, 20, 40, 40, 40); setPixel(9, 20, 40, 40, 40); setPixel(10, 20, 40, 40, 40);
setPixel(7, 23, 40, 40, 40); setPixel(8, 22, 40, 40, 40); setPixel(9, 21, 40, 40, 40);
setPixel(22, 20, 40, 40, 40); setPixel(23, 20, 40, 40, 40); setPixel(24, 20, 40, 40, 40);
setPixel(23, 21, 40, 40, 40); setPixel(24, 22, 40, 40, 40); setPixel(25, 23, 40, 40, 40);

// Build ICO structure
const iconDir = Buffer.alloc(6);
iconDir.writeUInt16LE(0, 0); // reserved
iconDir.writeUInt16LE(1, 2); // type 1 = ICO
iconDir.writeUInt16LE(1, 4); // 1 image

const dibHeaderSize = 40;
const imageSize = dibHeaderSize + rgba.length;
const dirEntry = Buffer.alloc(16);
dirEntry.writeUInt8(size, 0); // width
dirEntry.writeUInt8(size, 1); // height
dirEntry.writeUInt8(0, 2);    // color count
dirEntry.writeUInt8(0, 3);    // reserved
dirEntry.writeUInt16LE(1, 4); // color planes
dirEntry.writeUInt16LE(32, 6);// bpp
dirEntry.writeUInt32LE(imageSize, 8); // size of image data
dirEntry.writeUInt32LE(6 + 16, 12);   // offset of image data

const bih = Buffer.alloc(dibHeaderSize);
bih.writeUInt32LE(dibHeaderSize, 0);
bih.writeInt32LE(size, 4);
bih.writeInt32LE(size * 2, 8); // height * 2 for ICO (XOR + AND masks)
bih.writeUInt16LE(1, 12);      // planes
bih.writeUInt16LE(32, 14);     // bpp
bih.writeUInt32LE(0, 16);      // BI_RGB (uncompressed)
bih.writeUInt32LE(rgba.length, 20); // image size
bih.writeInt32LE(0, 24);
bih.writeInt32LE(0, 28);
bih.writeUInt32LE(0, 32);
bih.writeUInt32LE(0, 36);

const icoBuffer = Buffer.concat([iconDir, dirEntry, bih, rgba]);
fs.writeFileSync('docs/public/favicon.ico', icoBuffer);
console.log('Successfully generated docs/public/favicon.ico (' + icoBuffer.length + ' bytes)');
