<script setup lang="ts">
import { NAV_CATEGORIES } from '../../nav'
</script>

<template>
  <footer class="dpz-footer" data-pagefind-ignore="all">
    <div class="dpz-footer__inner">
      <div class="dpz-footer__grid">
        <div class="dpz-footer__brand">
          <div class="dpz-footer__title">代理排障 · dailipaizhang.biz</div>
          <p class="dpz-footer__desc">
            中文网络代理诊断手册与机场排障知识库。聚焦低风险排查路径、客户端配置差异与可复核实测记录。
          </p>
          <p class="dpz-footer__notice">
            独立性声明：部分品牌入口包含推广链接（标注 <code>nofollow sponsored</code>），不会影响排障结论与证据分级；未测速品牌一律不编造延迟或速度排行。
          </p>
        </div>

        <div class="dpz-footer__col">
          <h4>高频排障入口</h4>
          <ul>
            <li><a href="/troubleshooting/">故障排查分流器</a></li>
            <li><a href="/troubleshooting/articles/sub-http-200-empty">HTTP 200 返回空订阅</a></li>
            <li><a href="/troubleshooting/articles/sub-http-401-403-404-503">401/403/404 订阅失败</a></li>
            <li><a href="/troubleshooting/articles/nodes-all-timeout">所有节点同时超时</a></li>
            <li><a href="/troubleshooting/articles/tun-not-working">TUN 模式开启无效</a></li>
            <li><a href="/troubleshooting/articles/dns-leak-hijack-fix">DNS 泄漏与污染修复</a></li>
          </ul>
        </div>

        <div class="dpz-footer__col">
          <h4>核心知识专题</h4>
          <ul>
            <li v-for="cat in NAV_CATEGORIES.slice(0, 6)" :key="cat.id">
              <a :href="cat.link">{{ cat.text }}</a>
            </li>
          </ul>
        </div>

        <div class="dpz-footer__col">
          <h4>治理与方法论</h4>
          <ul>
            <li><a href="/methodology">测速与证据分级方法论</a></li>
            <li><a href="/disclosure">联盟推广与合作披露</a></li>
            <li><a href="/about">关于代理排障与合规边界</a></li>
            <li><a href="/brands/official-sites/">官网与入口核验说明</a></li>
            <li><a href="/security/shutdown/">跑路前兆与止损指南</a></li>
            <li><a href="/sitemap.xml" target="_blank" rel="noopener">站点地图 (Sitemap)</a></li>
          </ul>
        </div>
      </div>

      <div class="dpz-footer__bottom">
        <span>© 2026 代理排障 (dailipaizhang.biz) · Warm White Diagnostic Knowledge Base</span>
        <span>仅用于合法网络运维排障、跨区连通性测试与客户端软件配置参考</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.dpz-footer {
  background-color: var(--dpz-surface-muted);
  border-top: 1px solid var(--dpz-border-strong);
  padding: 40px 20px 28px;
  margin-top: 48px;
}

.dpz-footer__inner {
  max-width: 1280px;
  margin: 0 auto;
}

.dpz-footer__grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  gap: 28px;
}

@media (max-width: 959px) {
  .dpz-footer__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 599px) {
  .dpz-footer__grid {
    grid-template-columns: 1fr;
    gap: 22px;
  }
}

.dpz-footer__title {
  font-size: 16px;
  font-weight: 700;
  color: var(--dpz-ink);
  margin-bottom: 10px;
}

.dpz-footer__desc,
.dpz-footer__notice {
  font-size: 13.5px;
  line-height: 1.65;
  color: var(--dpz-text-muted);
  margin: 0 0 10px;
}

.dpz-footer__notice code {
  font-family: var(--dpz-font-mono);
  font-size: 12px;
  background: var(--dpz-surface);
  padding: 1px 5px;
  border-radius: 4px;
  border: 1px solid var(--dpz-border);
}

.dpz-footer__col h4 {
  font-size: 14px;
  font-weight: 700;
  color: var(--dpz-ink);
  margin: 0 0 10px;
}

.dpz-footer__col ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.dpz-footer__col li {
  margin-bottom: 6px;
}

.dpz-footer__col a {
  font-size: 13.5px;
  color: var(--dpz-text);
  text-decoration: none;
}

.dpz-footer__col a:hover {
  color: var(--dpz-accent);
  text-decoration: underline;
}

.dpz-footer__bottom {
  margin-top: 28px;
  padding-top: 18px;
  border-top: 1px solid var(--dpz-border);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 10px;
  font-size: 12.5px;
  color: var(--dpz-text-muted);
}
</style>
