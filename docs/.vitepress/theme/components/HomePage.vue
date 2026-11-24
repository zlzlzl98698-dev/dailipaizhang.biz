<script setup lang="ts">
import { computed } from 'vue'
import { NAV_CATEGORIES } from '../../nav'
import { formatEvidenceLabel, getAllBrands } from '../utils/siteData'
import PagefindSearch from './PagefindSearch.vue'
import DiagnosticTriage from './DiagnosticTriage.vue'
import AffiliateCta from './AffiliateCta.vue'
import SourceBadge from './SourceBadge.vue'

const highFreqFaults = [
  {
    code: 'HTTP 200 空订阅',
    title: '订阅返回 200 但节点为 0',
    desc: 'UA 被面板拦截、格式不匹配或品牌仅限专属客户端。',
    link: '/troubleshooting/articles/sub-http-200-empty',
  },
  {
    code: '401 / 403 / 404',
    title: '更新订阅失败与被重定向',
    desc: 'Token 重置、Cloudflare 拦截或旧代理形成请求死循环。',
    link: '/troubleshooting/articles/sub-http-401-403-404-503',
  },
  {
    code: 'Timeout / 0B',
    title: '所有节点同时超时无响应',
    desc: '优先区分系统时间偏差、本地断网与机场全局失联。',
    link: '/troubleshooting/articles/nodes-all-timeout',
  },
  {
    code: 'TUN 虚拟网卡',
    title: '开启 TUN 后仍直连或断网',
    desc: 'Service Mode 未授权、旧虚拟网卡残留与路由环路。',
    link: '/troubleshooting/articles/tun-not-working',
  },
  {
    code: 'DNS / 198.18',
    title: 'DNS 泄漏与 Fake-IP 冲突',
    desc: '微信/局域网异常解析到 198.18.0.1 与 DoH 绕过规则。',
    link: '/troubleshooting/articles/dns-leak-hijack-fix',
  },
  {
    code: 'No Internet',
    title: '节点连上却打不开任何网页',
    desc: '7890/10808 系统代理端口冲突或浏览器扩展覆盖设置。',
    link: '/troubleshooting/articles/connected-no-internet',
  },
]

const recentCases = [
  {
    tag: '订阅协议',
    title: '同一订阅在 Clash Verge 正常，导入 v2rayN 却空白',
    summary: '核对客户端 User-Agent 与 Base64/YAML 返回头差异，3 分钟完成格式对齐。',
    link: '/troubleshooting/articles/cross-client-inconsistency',
  },
  {
    tag: '桌面启动',
    title: 'Clash Verge Rev Windows 启动白屏与服务授权失败',
    summary: '先备份 profiles 配置目录，再核查 WebView2 运行时与核心架构匹配。',
    link: '/troubleshooting/articles/clash-verge-startup-fail',
  },
  {
    tag: 'DNS / 路由',
    title: '关闭代理后 198.18.0.1 残留导致内网与国内站点超时',
    summary: '排查 Fake-IP 缓存与系统 DNS 残留，提供安全可逆的刷新与回滚命令。',
    link: '/troubleshooting/articles/fake-ip-explained-fix',
  },
]

const clientEntries = [
  { name: 'Clash Verge Rev', os: 'Win / macOS / Linux', link: '/clients/clash-verge/' },
  { name: 'v2rayN 多核心端', os: 'Win / macOS / Linux', link: '/clients/v2rayn/' },
  { name: 'Shadowrocket 小火箭', os: 'iOS / macOS', link: '/clients/shadowrocket/' },
  { name: 'Clash Meta Android', os: 'Android VpnService', link: '/clients/clash-meta/' },
  { name: 'sing-box 全平台生态', os: '桌面 / 移动 / OpenWrt', link: '/clients/sing-box/' },
  { name: 'Mihomo 内核与衍生端', os: 'YAML 规则与维护提示', link: '/clients/mihomo/' },
]

const featuredBrands = computed(() => {
  const all = getAllBrands()
  if (all.length === 0) return []

  const measuredOrPartner = all.filter(
    (b) =>
      b.promotionPartner ||
      formatEvidenceLabel(b.evidenceStatus).tone === 'measured' ||
      (Array.isArray(b.tests) && b.tests.length > 0)
  )

  const pool = measuredOrPartner.length >= 4 ? measuredOrPartner : all
  return pool.slice(0, 6)
})

const partnerBrand = computed(() => {
  const all = getAllBrands()
  return all.find((b) => b.promotionPartner) || all[0] || null
})
</script>

<template>
  <div class="dpz-home" data-pagefind-body>
    <!-- 1. 故障搜索与现象分类 -->
    <section class="dpz-home-hero">
      <div class="dpz-home__container">
        <div class="dpz-home-hero__badge dpz-mono">
          WARM WHITE DIAGNOSTIC MANUAL · 2026-11-23 核验基线
        </div>
        <h1 class="dpz-home-hero__title">代理排障：先查报错与配置，再看实测证据选机场</h1>
        <p class="dpz-home-hero__lead">
          面向 Clash Verge Rev、Mihomo、v2rayN、Shadowrocket 与 sing-box 用户的中文网络诊断手册。不造虚假速度榜，先用低风险检查定位本地、DNS、TUN 或远端节点故障。
        </p>

        <div class="dpz-home-hero__search">
          <PagefindSearch variant="hero" />
        </div>

        <div class="dpz-fault-grid" data-pagefind-ignore="all">
          <a
            v-for="fault in highFreqFaults"
            :key="fault.link"
            :href="fault.link"
            class="dpz-fault-card"
          >
            <span class="dpz-fault-card__code dpz-mono">{{ fault.code }}</span>
            <strong class="dpz-fault-card__title">{{ fault.title }}</strong>
            <span class="dpz-fault-card__desc">{{ fault.desc }}</span>
          </a>
        </div>
      </div>
    </section>

    <!-- 2. 3 步自助诊断 -->
    <section class="dpz-home-sec">
      <div class="dpz-home__container">
        <div class="dpz-sec-head">
          <div>
            <span class="dpz-sec-eyebrow dpz-mono">STEP-BY-STEP TRIAGE</span>
            <h2 class="dpz-sec-title">3 步自助诊断：从低风险检查开始排除</h2>
          </div>
          <a href="/troubleshooting/" class="dpz-sec-more">进入完整排障中心 →</a>
        </div>

        <div class="dpz-steps-row">
          <div class="dpz-step-box">
            <span class="dpz-step-box__num dpz-mono">01</span>
            <h3>确认故障边界</h3>
            <p>先区分是“订阅拉取失败”、还是“已有节点但超时 / 连上打不开网页”。</p>
          </div>
          <div class="dpz-step-box">
            <span class="dpz-step-box__num dpz-mono">02</span>
            <h3>执行低风险检查</h3>
            <p>校准系统时间、关闭多代理插件冲突、核对是否被专属客户端限制订阅。</p>
          </div>
          <div class="dpz-step-box">
            <span class="dpz-step-box__num dpz-mono">03</span>
            <h3>按路径修复与回滚</h3>
            <p>若涉及修改 DNS、虚拟网卡或防火墙，每条指南均附带可逆回滚指令。</p>
          </div>
        </div>

        <DiagnosticTriage compact />
      </div>
    </section>

    <!-- 3. 最新问题修复案例（3 个入口） -->
    <section class="dpz-home-sec is-alt">
      <div class="dpz-home__container">
        <div class="dpz-sec-head">
          <div>
            <span class="dpz-sec-eyebrow dpz-mono">RECENT FIX CASES</span>
            <h2 class="dpz-sec-title">常见高频问题修复案例</h2>
          </div>
          <a href="/troubleshooting/subscription-failure/" class="dpz-sec-more">查看全部排查分类 →</a>
        </div>

        <div class="dpz-three-col">
          <a v-for="c in recentCases" :key="c.link" :href="c.link" class="dpz-case-card">
            <span class="dpz-case-card__tag">{{ c.tag }}</span>
            <h3 class="dpz-case-card__title">{{ c.title }}</h3>
            <p class="dpz-case-card__desc">{{ c.summary }}</p>
            <span class="dpz-case-card__go">查看操作步骤与回滚提示 →</span>
          </a>
        </div>
      </div>
    </section>

    <!-- 4. 客户端适配入口 -->
    <section class="dpz-home-sec">
      <div class="dpz-home__container">
        <div class="dpz-sec-head">
          <div>
            <span class="dpz-sec-eyebrow dpz-mono">CLIENT MATRIX</span>
            <h2 class="dpz-sec-title">客户端软件与平台适配入口</h2>
          </div>
          <a href="/clients/" class="dpz-sec-more">打开全平台客户端矩阵 →</a>
        </div>

        <div class="dpz-client-strip">
          <a v-for="cl in clientEntries" :key="cl.link" :href="cl.link" class="dpz-client-tile">
            <strong>{{ cl.name }}</strong>
            <span>{{ cl.os }}</span>
          </a>
        </div>
      </div>
    </section>

    <!-- 5. 网络知识图谱入口 -->
    <section class="dpz-home-sec is-alt">
      <div class="dpz-home__container">
        <div class="dpz-sec-head">
          <div>
            <span class="dpz-sec-eyebrow dpz-mono">KNOWLEDGE MAP · 10 PILLARS</span>
            <h2 class="dpz-sec-title">十大专题网络知识图谱</h2>
          </div>
          <a href="/routes/" class="dpz-sec-more">查看线路与专线原理 →</a>
        </div>

        <div class="dpz-pillar-grid" data-pagefind-ignore="all">
          <div v-for="cat in NAV_CATEGORIES" :key="cat.id" class="dpz-pillar-card">
            <a :href="cat.link" class="dpz-pillar-card__head">{{ cat.text }}</a>
            <ul class="dpz-pillar-card__list">
              <li v-for="sub in cat.items.slice(0, 4)" :key="sub.link">
                <a :href="sub.link">{{ sub.text }}</a>
              </li>
            </ul>
            <a :href="cat.link" class="dpz-pillar-card__all">查看全部 6 个子专题 →</a>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. 具证据的品牌评测入口 -->
    <section class="dpz-home-sec">
      <div class="dpz-home__container">
        <div class="dpz-sec-head">
          <div>
            <span class="dpz-sec-eyebrow dpz-mono">EVIDENCE-FIRST REVIEWS</span>
            <h2 class="dpz-sec-title">具证据的品牌档案与实测对照</h2>
          </div>
          <a href="/brands/" class="dpz-sec-more">检索全部 31 家品牌数据库 →</a>
        </div>

        <p class="dpz-sec-note">
          严格区分“合作展示位”与“证据等级”。无本地截图或可复核批次的品牌会直接标注为“品牌资料宣称”或“证据待核实”。
        </p>

        <div v-if="featuredBrands.length > 0" class="dpz-three-col" data-pagefind-ignore="all">
          <a
            v-for="b in featuredBrands"
            :key="b.slug"
            :href="`/brands/${b.slug}/`"
            class="dpz-brand-preview"
          >
            <div class="dpz-brand-preview__top">
              <strong>{{ b.name }}</strong>
              <SourceBadge :status="b.evidenceStatus" />
            </div>
            <div class="dpz-brand-preview__meta">
              <span v-if="b.promotionPartner" class="dpz-partner-pill">合作展示位（非测速排名）</span>
              <span v-if="b.conflicts?.length" class="dpz-conflict-pill">
                含 {{ b.conflicts.length }} 项冲突标注
              </span>
            </div>
            <div class="dpz-brand-preview__sub">
              协议：{{ b.protocols?.join(' / ') || '未明确' }} · 状态：{{ b.operatingStatus || '待核实' }}
            </div>
          </a>
        </div>

        <div v-else class="dpz-brand-placeholder">
          正在加载 <code>data/brands.json</code> 实测品牌清单，完成后将自动展示。可先进入 <a href="/brands/">品牌数据库</a>。
        </div>
      </div>
    </section>

    <!-- 7. 风险提示 -->
    <section class="dpz-home-sec is-alt">
      <div class="dpz-home__container">
        <div class="dpz-sec-head">
          <div>
            <span class="dpz-sec-eyebrow dpz-mono">RISK & PITFALLS</span>
            <h2 class="dpz-sec-title">购前与排障核心风险提示</h2>
          </div>
          <a href="/security/" class="dpz-sec-more">查看风险与替代专题 →</a>
        </div>

        <div class="dpz-three-col">
          <a href="/security/shutdown/" class="dpz-risk-card">
            <strong>跑路与失联前兆识别</strong>
            <p>区分单次订阅域名变更与长期失联，避免大额年付沉没成本。</p>
          </a>
          <a href="/pricing/budget/" class="dpz-risk-card">
            <strong>5.6–15 元低价集群隐患</strong>
            <p>拆解极低价同质套餐的超售、协议缺口与客服响应边界。</p>
          </a>
          <a href="/guides/subscriptions/" class="dpz-risk-card">
            <strong>专属客户端无订阅限制</strong>
            <p>部分品牌不支持 Clash/Shadowrocket 通用订阅，迁移与排障需提前核对。</p>
          </a>
        </div>
      </div>
    </section>

    <!-- 8. 有出处的商业入口与披露 -->
    <section v-if="partnerBrand" class="dpz-home-sec">
      <div class="dpz-home__container">
        <div class="dpz-sec-head">
          <div>
            <span class="dpz-sec-eyebrow dpz-mono">COMMERCIAL DISCLOSURE</span>
            <h2 class="dpz-sec-title">合作展示入口与合规披露</h2>
          </div>
          <a href="/disclosure" class="dpz-sec-more">阅读完整商业披露 →</a>
        </div>
        <AffiliateCta :slug="partnerBrand.slug" compact />
      </div>
    </section>

    <!-- 9. 站点方法论与更新记录 -->
    <section class="dpz-home-sec is-alt">
      <div class="dpz-home__container">
        <div class="dpz-method-box">
          <div>
            <h2 class="dpz-sec-title">站点方法论、六级证据体系与更新记录</h2>
            <p class="dpz-method-box__desc">
              本站全部品牌档案采用六级证据标注（<code>measured</code> / <code>third_party</code> / <code>vendor</code> / <code>historical</code> / <code>example</code> / <code>unknown</code>），保留所有原始套餐与优惠码冲突，不将推广注册地址冒充为独立官网。
            </p>
          </div>
          <div class="dpz-method-box__links">
            <a href="/methodology" class="dpz-method-btn">查看证据分级方法论</a>
            <a href="/about" class="dpz-method-btn is-outline">关于代理排障与合规边界</a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dpz-home__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.dpz-home-hero {
  background: var(--dpz-bg);
  padding: 36px 0 38px;
  border-bottom: 1px solid var(--dpz-border);
}

.dpz-home-hero__badge {
  display: inline-block;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--dpz-green);
  background: var(--dpz-green-soft);
  border: 1px solid #C2DED5;
  padding: 4px 10px;
  border-radius: 5px;
  margin-bottom: 14px;
}

.dpz-home-hero__title {
  margin: 0 0 12px;
  font-size: clamp(1.75rem, 3.2vw, 2.35rem);
  line-height: 1.25;
  color: var(--dpz-ink);
  letter-spacing: -0.015em;
}

.dpz-home-hero__lead {
  max-width: 780px;
  margin: 0 0 22px;
  font-size: 16.5px;
  line-height: 1.7;
  color: var(--dpz-text);
}

.dpz-home-hero__search {
  max-width: 780px;
  margin-bottom: 26px;
}

.dpz-fault-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

@media (max-width: 959px) {
  .dpz-fault-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 599px) {
  .dpz-fault-grid {
    grid-template-columns: 1fr;
  }
}

.dpz-fault-card {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 15px 16px;
  background: var(--dpz-surface);
  border: 1px solid var(--dpz-border-strong);
  border-radius: 9px;
  text-decoration: none;
  transition: border-color 0.15s ease, transform 0.12s ease;
}

.dpz-fault-card:hover {
  border-color: var(--dpz-accent);
  transform: translateY(-1px);
}

.dpz-fault-card__code {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--dpz-accent);
}

.dpz-fault-card__title {
  font-size: 15px;
  color: var(--dpz-ink);
}

.dpz-fault-card__desc {
  font-size: 13px;
  line-height: 1.5;
  color: var(--dpz-text-muted);
}

.dpz-home-sec {
  padding: 40px 0;
  background: var(--dpz-surface);
  border-bottom: 1px solid var(--dpz-border);
}

.dpz-home-sec.is-alt {
  background: var(--dpz-bg);
}

.dpz-sec-head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 20px;
}

.dpz-sec-eyebrow {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: var(--dpz-accent);
  letter-spacing: 0.05em;
  margin-bottom: 3px;
}

.dpz-sec-title {
  margin: 0;
  font-size: 1.38rem;
  color: var(--dpz-ink);
}

.dpz-sec-more {
  font-size: 14px;
  font-weight: 600;
  color: var(--dpz-accent);
  text-decoration: none;
}

.dpz-sec-more:hover {
  text-decoration: underline;
}

.dpz-sec-note {
  margin: -8px 0 18px;
  font-size: 14px;
  color: var(--dpz-text-muted);
}

.dpz-steps-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

@media (max-width: 767px) {
  .dpz-steps-row {
    grid-template-columns: 1fr;
  }
}

.dpz-step-box {
  background: var(--dpz-bg);
  border: 1px solid var(--dpz-border);
  border-radius: 9px;
  padding: 16px;
}

.dpz-step-box__num {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  color: var(--dpz-green);
  margin-bottom: 6px;
}

.dpz-step-box h3 {
  margin: 0 0 6px;
  font-size: 15.5px;
  color: var(--dpz-ink);
}

.dpz-step-box p {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--dpz-text-muted);
}

.dpz-three-col {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

@media (max-width: 959px) {
  .dpz-three-col {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 599px) {
  .dpz-three-col {
    grid-template-columns: 1fr;
  }
}

.dpz-case-card {
  display: flex;
  flex-direction: column;
  padding: 18px;
  background: var(--dpz-surface);
  border: 1px solid var(--dpz-border);
  border-radius: 9px;
  text-decoration: none;
}

.dpz-case-card:hover {
  border-color: var(--dpz-accent);
}

.dpz-case-card__tag {
  align-self: flex-start;
  font-size: 11.5px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--dpz-accent-soft);
  color: var(--dpz-accent);
  margin-bottom: 8px;
}

.dpz-case-card__title {
  margin: 0 0 8px;
  font-size: 15.5px;
  line-height: 1.45;
  color: var(--dpz-ink);
}

.dpz-case-card__desc {
  margin: 0 0 12px;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--dpz-text-muted);
}

.dpz-case-card__go {
  margin-top: auto;
  font-size: 13px;
  font-weight: 600;
  color: var(--dpz-accent);
}

.dpz-client-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

@media (max-width: 767px) {
  .dpz-client-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 479px) {
  .dpz-client-strip {
    grid-template-columns: 1fr;
  }
}

.dpz-client-tile {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 14px 16px;
  border-radius: 8px;
  background: var(--dpz-bg);
  border: 1px solid var(--dpz-border);
  text-decoration: none;
}

.dpz-client-tile:hover {
  border-color: var(--dpz-accent);
  background: var(--dpz-accent-soft);
}

.dpz-client-tile strong {
  font-size: 14.5px;
  color: var(--dpz-ink);
}

.dpz-client-tile span {
  font-size: 12.5px;
  color: var(--dpz-text-muted);
}

.dpz-pillar-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

@media (max-width: 1079px) {
  .dpz-pillar-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 539px) {
  .dpz-pillar-grid {
    grid-template-columns: 1fr;
  }
}

.dpz-pillar-card {
  display: flex;
  flex-direction: column;
  background: var(--dpz-surface);
  border: 1px solid var(--dpz-border);
  border-radius: 9px;
  padding: 14px;
}

.dpz-pillar-card__head {
  font-size: 15px;
  font-weight: 700;
  color: var(--dpz-ink);
  text-decoration: none;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--dpz-border);
  margin-bottom: 8px;
}

.dpz-pillar-card__head:hover {
  color: var(--dpz-accent);
}

.dpz-pillar-card__list {
  list-style: none;
  margin: 0 0 10px;
  padding: 0;
}

.dpz-pillar-card__list li {
  margin-bottom: 4px;
}

.dpz-pillar-card__list a {
  font-size: 13px;
  color: var(--dpz-text);
  text-decoration: none;
}

.dpz-pillar-card__list a:hover {
  color: var(--dpz-accent);
  text-decoration: underline;
}

.dpz-pillar-card__all {
  margin-top: auto;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--dpz-accent);
  text-decoration: none;
}

.dpz-brand-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 15px;
  background: var(--dpz-bg);
  border: 1px solid var(--dpz-border);
  border-radius: 9px;
  text-decoration: none;
}

.dpz-brand-preview:hover {
  border-color: var(--dpz-accent);
}

.dpz-brand-preview__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  color: var(--dpz-ink);
}

.dpz-brand-preview__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.dpz-partner-pill {
  font-size: 11.5px;
  padding: 2px 7px;
  border-radius: 4px;
  background: var(--dpz-accent-soft);
  color: var(--dpz-accent);
}

.dpz-conflict-pill {
  font-size: 11.5px;
  padding: 2px 7px;
  border-radius: 4px;
  background: var(--dpz-amber-soft);
  color: var(--dpz-amber);
}

.dpz-brand-preview__sub {
  font-size: 12.5px;
  color: var(--dpz-text-muted);
}

.dpz-brand-placeholder {
  padding: 18px;
  border-radius: 8px;
  background: var(--dpz-bg);
  border: 1px dashed var(--dpz-border-strong);
  font-size: 14px;
  color: var(--dpz-text-muted);
}

.dpz-risk-card {
  display: block;
  padding: 16px;
  background: var(--dpz-surface);
  border: 1px solid var(--dpz-border);
  border-left: 4px solid var(--dpz-red);
  border-radius: 8px;
  text-decoration: none;
}

.dpz-risk-card strong {
  display: block;
  font-size: 15px;
  color: var(--dpz-ink);
  margin-bottom: 6px;
}

.dpz-risk-card p {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--dpz-text-muted);
}

.dpz-method-box {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  padding: 22px;
  background: var(--dpz-surface);
  border: 1px solid var(--dpz-border-strong);
  border-radius: 10px;
}

.dpz-method-box__desc {
  max-width: 720px;
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--dpz-text);
}

.dpz-method-box__links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.dpz-method-btn {
  display: inline-flex;
  align-items: center;
  padding: 9px 16px;
  border-radius: 7px;
  background: var(--dpz-accent);
  color: #FFFFFF;
  font-size: 13.5px;
  font-weight: 600;
  text-decoration: none;
}

.dpz-method-btn.is-outline {
  background: var(--dpz-bg);
  color: var(--dpz-ink);
  border: 1px solid var(--dpz-border-strong);
}
</style>
