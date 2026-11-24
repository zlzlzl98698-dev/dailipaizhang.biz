import fs from 'fs';

const linkMap = {
  'chatgpt-region-not-supported-fix': 'chatgpt-region-unsupported-fix',
  'netflix-original-vs-full-unlock': 'netflix-originals-vs-full-unlock',
  '/routes/articles/hong-kong': '/routes/articles/low-ping-vs-download-speed',
  'claude-ip-ban-risk-prevention': 'claude-connection-ban-risks',
  'clash-verge-rev-beginner-guide': 'clash-verge-rev-install-guide',
  'mihomo-vs-clash-meta-explained': 'flclash-vs-clash-verge-rev',
  '/clients/articles/shadowrocket-ios-install-setup': '/guides/articles/iphone-shadowrocket-add-sub',
  'shadowrocket-ios-install-setup': 'windows-macos-client-selection',
  '/clients/articles/v2rayn-core-xray-singbox-diff': '/troubleshooting/articles/v2rayn-core-load-fail',
  'v2rayn-core-xray-singbox-diff': 'clash-verge-rev-import-subscription',
  'mobile-vpn-battery-auto-disconnect': 'mobile-vpn-auto-disconnect',
  '/security/articles/account-security': '/security/articles/what-to-do-if-airport-stops',
  'free-vpn-risks-data-privacy': 'vpn-privacy-policy-audit',
  '/vpn/articles/game-accelerator-vs-proxy-udp': '/troubleshooting/articles/udp-nat-firewall-blocks',
  'game-accelerator-vs-proxy-udp': 'vpn-and-proxy-coexistence',
  'vpn-vs-proxy-airport-difference': 'vpn-vs-proxy-architecture'
};

const targets = [
  'data/keywords/cluster-map.json',
  'data/keywords/article-keyword-map.json',
  'data/keywords/longtail-master.csv',
  'data/keywords/content-priority.csv',
  'scripts/generate-keywords-data.mjs'
];

for (const t of targets) {
  if (!fs.existsSync(t)) continue;
  let c = fs.readFileSync(t, 'utf8');
  for (const [k, v] of Object.entries(linkMap)) {
    c = c.replaceAll(k, v);
  }
  fs.writeFileSync(t, c, 'utf8');
  console.log(`Updated ${t}`);
}

console.log('Finished fixing data/keywords slugs!');
