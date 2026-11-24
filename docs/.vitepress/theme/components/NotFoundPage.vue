<script setup lang="ts">
import PagefindSearch from './PagefindSearch.vue'

const topIssues = [
  {
    code: 'HTTP 200',
    title: '订阅返回 200 但内容空白',
    desc: 'UA 拦截、格式不匹配或面板返回 0 字节',
    link: '/troubleshooting/articles/sub-http-200-empty',
  },
  {
    code: '401 / 403 / 404',
    title: '更新订阅报 401/403/404',
    desc: 'Token 失效、重置链接或防火墙拦截',
    link: '/troubleshooting/articles/sub-http-401-403-404-503',
  },
  {
    code: 'Timeout',
    title: '所有节点同时超时',
    desc: '本地系统时间偏差与机场全线故障分流',
    link: '/troubleshooting/articles/nodes-all-timeout',
  },
  {
    code: 'TUN Mode',
    title: 'TUN 模式开启后无效',
    desc: '虚拟网卡冲突、服务模式授权与管理员权限',
    link: '/troubleshooting/articles/tun-not-working',
  },
  {
    code: 'DNS / Fake-IP',
    title: 'DNS 泄漏与污染排查',
    desc: '198.18.0.1 冲突、nameserver 分组与回滚',
    link: '/troubleshooting/articles/dns-leak-hijack-fix',
  },
  {
    code: 'No Internet',
    title: '连上节点但打不开网页',
    desc: '系统代理端口占用、规则误拦截与环路',
    link: '/troubleshooting/articles/connected-no-internet',
  },
]
</script>

<template>
  <div class="dpz-404" data-pagefind-ignore="all">
    <div class="dpz-404__card">
      <div class="dpz-404__badge dpz-mono">HTTP 404 · 页面未找到</div>
      <h1 class="dpz-404__title">未找到你访问的诊断页面或档案地址</h1>
      <p class="dpz-404__desc">
        该路径可能已变更、拼写有误，或对应条目尚未发布。你可以直接通过下方站内搜索查找报错代码、客户端或品牌名称，或直接进入 6 大高频排障入口。
      </p>

      <div class="dpz-404__search">
        <PagefindSearch variant="hero" />
      </div>

      <div class="dpz-404__section-title">6 大高频故障快速直达</div>
      <div class="dpz-404__grid">
        <a
          v-for="item in topIssues"
          :key="item.link"
          :href="item.link"
          class="dpz-404__issue"
        >
          <span class="dpz-404__code dpz-mono">{{ item.code }}</span>
          <strong class="dpz-404__issue-title">{{ item.title }}</strong>
          <span class="dpz-404__issue-desc">{{ item.desc }}</span>
        </a>
      </div>

      <div class="dpz-404__actions">
        <a href="/" class="dpz-404__btn is-primary">返回诊断首页</a>
        <a href="/troubleshooting/" class="dpz-404__btn">打开故障分流器</a>
        <a href="/brands/" class="dpz-404__btn">查看 31 家品牌库</a>
        <a href="/clients/" class="dpz-404__btn">客户端适配矩阵</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dpz-404 {
  max-width: 960px;
  margin: 32px auto 48px;
  padding: 0 16px;
}

.dpz-404__card {
  background: var(--dpz-surface);
  border: 1px solid var(--dpz-border);
  border-radius: 12px;
  padding: 32px 28px;
}

.dpz-404__badge {
  display: inline-block;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--dpz-red);
  background: var(--dpz-red-soft);
  padding: 4px 10px;
  border-radius: 6px;
  margin-bottom: 14px;
}

.dpz-404__title {
  margin: 0 0 10px;
  font-size: clamp(1.5rem, 2.5vw, 1.9rem);
  color: var(--dpz-ink);
}

.dpz-404__desc {
  margin: 0 0 22px;
  font-size: 15.5px;
  line-height: 1.7;
  color: var(--dpz-text);
}

.dpz-404__search {
  margin-bottom: 28px;
}

.dpz-404__section-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--dpz-ink);
  margin-bottom: 12px;
}

.dpz-404__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

@media (max-width: 767px) {
  .dpz-404__grid {
    grid-template-columns: 1fr;
  }
}

.dpz-404__issue {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px;
  border-radius: 8px;
  border: 1px solid var(--dpz-border);
  background: var(--dpz-bg);
  text-decoration: none;
}

.dpz-404__issue:hover {
  border-color: var(--dpz-accent);
  background: var(--dpz-accent-soft);
}

.dpz-404__code {
  font-size: 12px;
  font-weight: 700;
  color: var(--dpz-accent);
}

.dpz-404__issue-title {
  font-size: 14.5px;
  color: var(--dpz-ink);
}

.dpz-404__issue-desc {
  font-size: 12.5px;
  color: var(--dpz-text-muted);
  line-height: 1.5;
}

.dpz-404__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.dpz-404__btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 7px;
  border: 1px solid var(--dpz-border-strong);
  background: var(--dpz-bg);
  color: var(--dpz-ink);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
}

.dpz-404__btn:hover {
  border-color: var(--dpz-accent);
  color: var(--dpz-accent);
}

.dpz-404__btn.is-primary {
  background: var(--dpz-accent);
  border-color: var(--dpz-accent);
  color: #FFFFFF;
}
</style>
