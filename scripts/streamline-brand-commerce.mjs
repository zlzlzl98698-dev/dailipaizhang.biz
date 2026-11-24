import fs from 'fs';
import path from 'path';

const brands = JSON.parse(fs.readFileSync('data/brands.json', 'utf8'));

for (const brand of brands) {
  const p = path.join('docs', 'brands', brand.slug, 'index.md');
  if (!fs.existsSync(p)) {
    console.log(`Missing brand page: ${p}`);
    continue;
  }
  let content = fs.readFileSync(p, 'utf8');

  // Check if it already has the review link
  const reviewLink = `/reviews/${brand.slug}/`;
  const reviewAnchor = `[${brand.name}独立深度评测报告](${reviewLink})`;
  
  if (!content.includes(reviewLink)) {
    // 1. Add banner after H1
    const h1Regex = /(#\s+[^\n]+\n\n)/;
    const banner = `> 💡 **技术审计提示**：本文档为 **${brand.name}** 的商业购买决策与套餐折扣指南。如需查看完整的节点丢包率、晚高峰实测测速图谱、流媒体/AI 解锁矩阵及异常数据法医级审计，请点击跳转至 ➔ **${reviewAnchor}**。\n\n`;
    
    if (h1Regex.test(content)) {
      content = content.replace(h1Regex, `$1${banner}`);
    }

    // 2. Add technical review section before the end or before CTA
    const reviewSection = `\n---\n\n## 深度技术评测与横向选型通道\n\n为了保障消费者的知情权与决策客观性，本站对 **${brand.name}** 实施了严格的「商业信息与技术评测物理分离」机制：\n\n- 🔬 **查阅客观技术实测**：深入了解 ${brand.name} 在 2026 年度的节点连通率、三网延迟基线、AI 工具（ChatGPT/Claude）风控拦截及法医级测速数据，请前往 ➔ **${reviewAnchor}**。\n- ⚖️ **查阅同级横向对比**：在同价位竞争品牌之间权衡优劣，请参考 ➔ **[机场品牌横向对比中心](/compare/)**。\n\n`;

    // Insert before the last heading or append
    if (content.includes('## 常见问题') || content.includes('## 六、常见问题') || content.includes('## 常见购买与服务问答')) {
      const faqHeadingMatch = content.match(/## (?:六、)?常见(?:问题|购买)/);
      if (faqHeadingMatch) {
        const idx = faqHeadingMatch.index;
        content = content.slice(0, idx) + reviewSection + content.slice(idx);
      } else {
        content += reviewSection;
      }
    } else {
      content += reviewSection;
    }

    fs.writeFileSync(p, content, 'utf8');
    console.log(`Updated ${brand.slug}: added review links`);
  } else {
    console.log(`Already linked: ${brand.slug}`);
  }
}
console.log('Finished updating brand commercial pages!');
