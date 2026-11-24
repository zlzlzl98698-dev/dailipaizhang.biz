import fs from 'fs';

const html = fs.readFileSync('docs/.vitepress/dist/index.html', 'utf8');
const head = html.substring(0, html.indexOf('</head>'));
const iconLinks = [...head.matchAll(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]*>/gi)].map(m => m[0]);
console.log('Icon links in dist/index.html:\n', iconLinks.join('\n'));
