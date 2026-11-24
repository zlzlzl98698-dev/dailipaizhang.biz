import fs from 'fs';

const p = 'C:/Users/Pro User/.gemini/antigravity/brain/d65de509-237b-4fef-b658-2ad1720e5fec/.user_uploaded/media_1795431246118_d2ec674a.png';
const buf = fs.readFileSync(p);
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);
console.log('PNG dimensions:', width, 'x', height, 'size:', buf.length);
