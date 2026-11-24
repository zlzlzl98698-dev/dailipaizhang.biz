import fs from 'fs';
import path from 'path';

const linkMap = {
  '/ai-media/articles/chatgpt-region-not-supported-fix': '/ai-media/articles/chatgpt-region-unsupported-fix',
  '/ai-media/articles/netflix-original-vs-full-unlock': '/ai-media/articles/netflix-originals-vs-full-unlock',
  '/routes/articles/hong-kong': '/routes/hong-kong/',
  '/ai-media/articles/claude-ip-ban-risk-prevention': '/ai-media/articles/claude-connection-ban-risks',
  '/clients/articles/clash-verge-rev-beginner-guide': '/clients/articles/clash-verge-rev-install-guide',
  '/clients/articles/mihomo-vs-clash-meta-explained': '/clients/mihomo/',
  '/clients/articles/shadowrocket-ios-install-setup': '/guides/articles/iphone-shadowrocket-add-sub',
  '/clients/articles/v2rayn-core-xray-singbox-diff': '/troubleshooting/articles/v2rayn-core-load-fail',
  '/vpn/articles/mobile-vpn-battery-auto-disconnect': '/vpn/articles/mobile-vpn-auto-disconnect',
  '/security/articles/account-security': '/security/account-security/',
  '/vpn/articles/free-vpn-risks-data-privacy': '/vpn/articles/vpn-privacy-policy-audit',
  '/vpn/articles/game-accelerator-vs-proxy-udp': '/troubleshooting/articles/udp-nat-firewall-blocks',
  '/vpn/articles/vpn-vs-proxy-airport-difference': '/vpn/articles/vpn-vs-proxy-architecture'
};

function processDir(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== '.vitepress' && f !== 'node_modules' && f !== 'dist') processDir(full);
    } else if (full.endsWith('.md')) {
      let c = fs.readFileSync(full, 'utf8');
      let changed = false;
      for (const [wrong, right] of Object.entries(linkMap)) {
        if (c.includes(wrong)) {
          c = c.replaceAll(wrong, right);
          changed = true;
          console.log(`Replaced ${wrong} -> ${right} in ${full}`);
        }
      }
      if (changed) {
        fs.writeFileSync(full, c, 'utf8');
      }
    }
  }
}

processDir('docs');
console.log('Finished updating broken link references!');
