import fs from 'fs';
import path from 'path';

const brands = JSON.parse(fs.readFileSync('data/brands.json', 'utf8'));

const brandDataMap = {};
for (const b of brands) {
  brandDataMap[b.slug] = b;
}

// 9 missing brands
const targetSlugs = [
  'dalaoyun',
  'yunjiexian',
  'liulianyun',
  'shenxing',
  'huanqiuti',
  'yinxingren',
  'tiziyun',
  'langwang',
  'edgenova'
];

console.log('Writing 9 deep reviews...');
// Let's create the directories and index.md files
