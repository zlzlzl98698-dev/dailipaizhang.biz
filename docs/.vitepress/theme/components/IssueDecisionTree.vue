<script setup lang="ts">
import { computed, ref } from 'vue'

interface DecisionNode {
  id: string
  question: string
  hint?: string
  options: Array<{
    label: string
    nextId?: string
    result?: {
      title: string
      summary: string
      checks: string[]
      url: string
      warning?: string
    }
  }>
}

const nodes: Record<string, DecisionNode> = {
  root: {
    id: 'root',
    question: '当前故障最先卡在哪一步？',
    hint: '先区分“订阅配置拉取阶段”还是“节点连通/DNS 转发阶段”，避免盲目重装客户端。',
    options: [
      { label: '无法导入或更新机场订阅', nextId: 'sub' },
      { label: '已有节点列表，但测速全超时 / 0B', nextId: 'timeout' },
      { label: '节点显示连上，但网页或 AI 工具打不开', nextId: 'connected' },
      { label: '客户端打不开 / 白屏 / 核心报错', nextId: 'startup' },
    ],
  },
  sub: {
    id: 'sub',
    question: '更新订阅时客户端提示什么状态或返回？',
    options: [
      {
        label: '提示成功 (HTTP 200)，但节点数为 0 或内容空白',
        result: {
          title: 'HTTP 200 空订阅 / 格式被拦截',
          summary: '常见于品牌仅支持专属客户端、面板返回 HTML 验证页或 User-Agent 不匹配。',
          checks: [
            '核对品牌是否明确“不支持第三方订阅”',
            '关闭客户端代理后用浏览器打开订阅地址确认返回格式',
            '切换 Clash / sing-box / Base64 对应 UA 重试',
          ],
          url: '/troubleshooting/articles/sub-http-200-empty',
        },
      },
      {
        label: '返回 HTTP 401 / 403 / 404 / 503',
        result: {
          title: 'HTTP 4xx/5xx 订阅权限或风控拦截',
          summary: '401/404 多为 Token 重置或套餐过期；403/503 多为防火墙或循环代理拦截。',
          checks: [
            '登录机场面板确认订阅链接是否已更新或重置',
            '暂时关闭系统代理，在直连环境下拉取一次订阅',
          ],
          url: '/troubleshooting/articles/sub-http-401-403-404-503',
        },
      },
      {
        label: '提示 TLS 证书错误、EOF 或连接超时',
        result: {
          title: '订阅域名 TLS / DNS 解析阻断',
          summary: '先排查本机系统时间与本地 DNS，再确认机场是否切换了备用域名。',
          checks: [
            '校准系统时钟误差至 30 秒内',
            '检查本机 hosts 与旧代理端口残留',
          ],
          url: '/troubleshooting/articles/sub-tls-dns-timeout',
        },
      },
    ],
  },
  timeout: {
    id: 'timeout',
    question: '是全部节点同时超时，还是仅个别地区/节点超时？',
    options: [
      {
        label: '所有节点同时超时 / 延迟全部显示 -1',
        result: {
          title: '全节点同时超时分流',
          summary: '优先排查系统时间偏差、本地断网、套餐到期或机场全局失联。',
          checks: [
            '先校准系统时间（Windows/macOS 自动同步时间）',
            '确认直连国内网站正常且流量未耗尽',
            '用同一订阅在备用客户端/手机热点交叉验证',
          ],
          url: '/troubleshooting/articles/nodes-all-timeout',
        },
      },
      {
        label: '仅部分节点超时或特定地区（如美01/香港02）0B',
        result: {
          title: '单节点维护与路由劣化排查',
          summary: '单节点故障不代表本地问题，可先更新订阅并切换备用落地。',
          checks: [
            '刷新订阅获取最新端口与域名映射',
            '查看节点是否处于维护或晚高峰拥塞时段',
          ],
          url: '/troubleshooting/articles/nodes-partial-region-timeout',
        },
      },
    ],
  },
  connected: {
    id: 'connected',
    question: '打开网页时属于以下哪种情况？',
    options: [
      {
        label: '所有海外与国内网页都打不开（浏览器报代理错误）',
        result: {
          title: '系统代理端口冲突或路由环路',
          summary: '多为端口被其他软件占用、浏览器扩展覆盖代理或系统代理未正确清理。',
          checks: [
            '核对客户端混合端口（7890/7897/10808）与系统设置是否一致',
            '停用浏览器代理插件（如 SwitchyOmega）做单一变量测试',
          ],
          url: '/troubleshooting/articles/connected-no-internet',
        },
      },
      {
        label: '开启 TUN 模式后无效，或局部软件不走代理',
        result: {
          title: 'TUN 虚拟网卡授权与权限修复',
          summary: '桌面端开启 TUN 通常需要服务模式授权或管理员权限，且需防范路由环路。',
          checks: [
            '检查 Service Mode 状态并确认无多套虚拟网卡共存',
            '准备回滚：关闭 TUN 后还原系统默认 DNS 与网卡网关',
          ],
          url: '/troubleshooting/articles/tun-not-working',
          warning: '修改虚拟网卡或系统 DNS 前建议记录原始设置，异常时立即关闭 TUN 回滚。',
        },
      },
      {
        label: '域名解析到 198.18.x.x 或出现 DNS 泄漏/国内软件异常',
        result: {
          title: 'Fake-IP 冲突与 DNS 泄漏修复',
          summary: '198.18.0.1 属于 Clash Fake-IP 保留段，退出未清理或规则缺失会导致异常。',
          checks: [
            '将微信、局域网与企业内网域名加入 fake-ip-filter',
            '或切换 Redir-Host 模式观察解析是否恢复',
          ],
          url: '/troubleshooting/articles/fake-ip-explained-fix',
        },
      },
      {
        label: '普通网页正常，仅 ChatGPT / Claude / Netflix 报错',
        result: {
          title: '特定站点风控、IP 地区与缓存排查',
          summary: '多与节点出口 IP 风控、YouTube 送中、或浏览器旧地区 Cookie 残留有关。',
          checks: [
            '用无痕窗口对比验证是否浏览器缓存所致',
            '避免香港节点直连仅限非港地区的 AI 工具',
          ],
          url: '/troubleshooting/articles/specific-sites-unreachable',
        },
      },
    ],
  },
  startup: {
    id: 'startup',
    question: '使用的是哪一类桌面客户端？',
    options: [
      {
        label: 'Clash Verge Rev / Mihomo 内核白屏或报错',
        result: {
          title: 'Clash Verge / Mihomo 启动与 YAML 修复',
          summary: '常见原因为缺少 WebView2 运行时、配置 YAML 语法错误或端口被占。',
          checks: [
            '备份 profiles 文件夹后再排查 YAML 缩进/覆写规则',
            '确认安装了对应架构的官方发布版本',
          ],
          url: '/troubleshooting/articles/clash-verge-startup-fail',
        },
      },
      {
        label: 'v2rayN 核心加载失败或更新异常',
        result: {
          title: 'v2rayN 核心与运行时修复',
          summary: '检查 .NET Desktop Runtime 与 Xray/sing-box 核心文件完整性。',
          checks: [
            '确认解压目录权限非只读且路径无特殊字符',
            '核对系统架构（win-x64 vs win-arm64）',
          ],
          url: '/troubleshooting/articles/v2rayn-core-load-fail',
        },
      },
    ],
  },
}

const history = ref<string[]>(['root'])
const currentResult = ref<DecisionNode['options'][number]['result'] | null>(null)

const currentNode = computed(() => {
  const id = history.value[history.value.length - 1]
  return nodes[id] || nodes.root
})

function chooseOption(opt: DecisionNode['options'][number]) {
  if (opt.nextId && nodes[opt.nextId]) {
    currentResult.value = null
    history.value = [...history.value, opt.nextId]
  } else if (opt.result) {
    currentResult.value = opt.result
  }
}

function goBack() {
  if (currentResult.value) {
    currentResult.value = null
    return
  }
  if (history.value.length > 1) {
    history.value = history.value.slice(0, -1)
  }
}

function resetTree() {
  history.value = ['root']
  currentResult.value = null
}
</script>

<template>
  <section class="dpz-tree" aria-label="故障决策树" data-pagefind-ignore="all">
    <div class="dpz-tree__head">
      <div>
        <div class="dpz-tree__eyebrow dpz-mono">DECISION TREE · 交互式故障树</div>
        <h3 class="dpz-tree__title">逐层排除：两步锁定具体排查文章</h3>
      </div>
      <div class="dpz-tree__nav">
        <button
          v-if="history.length > 1 || currentResult"
          type="button"
          class="dpz-tree__btn-sm"
          @click="goBack"
        >
          ← 上一步
        </button>
        <button type="button" class="dpz-tree__btn-sm" @click="resetTree">重新开始</button>
      </div>
    </div>

    <div v-if="!currentResult" class="dpz-tree__stage">
      <div class="dpz-tree__question">{{ currentNode.question }}</div>
      <p v-if="currentNode.hint" class="dpz-tree__hint">{{ currentNode.hint }}</p>
      <div class="dpz-tree__options">
        <button
          v-for="opt in currentNode.options"
          :key="opt.label"
          type="button"
          class="dpz-tree__option"
          @click="chooseOption(opt)"
        >
          <span>{{ opt.label }}</span>
          <span class="dpz-tree__arrow">→</span>
        </button>
      </div>
    </div>

    <div v-else class="dpz-tree__result">
      <div class="dpz-tree__result-tag dpz-mono">定位结果</div>
      <h4 class="dpz-tree__result-title">{{ currentResult.title }}</h4>
      <p class="dpz-tree__result-summary">{{ currentResult.summary }}</p>

      <div class="dpz-tree__checks-label">建议先做以下低风险核查：</div>
      <ul class="dpz-tree__checks">
        <li v-for="(chk, idx) in currentResult.checks" :key="idx">{{ chk }}</li>
      </ul>

      <div v-if="currentResult.warning" class="dpz-tree__warning">
        回滚提示：{{ currentResult.warning }}
      </div>

      <div class="dpz-tree__result-actions">
        <a :href="currentResult.url" class="dpz-tree__cta">进入完整图文排障教程 →</a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.dpz-tree {
  background: var(--dpz-surface);
  border: 1px solid var(--dpz-border-strong);
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
}

.dpz-tree__head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--dpz-border);
  margin-bottom: 16px;
}

.dpz-tree__eyebrow {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--dpz-accent);
  margin-bottom: 2px;
}

.dpz-tree__title {
  margin: 0 !important;
  font-size: 1.1rem !important;
  color: var(--dpz-ink);
}

.dpz-tree__nav {
  display: flex;
  gap: 8px;
}

.dpz-tree__btn-sm {
  border: 1px solid var(--dpz-border-strong);
  background: var(--dpz-bg);
  color: var(--dpz-text);
  font-size: 12.5px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 6px;
  cursor: pointer;
}

.dpz-tree__question {
  font-size: 16.5px;
  font-weight: 700;
  color: var(--dpz-ink);
  margin-bottom: 6px;
}

.dpz-tree__hint {
  margin: 0 0 14px;
  font-size: 13.5px;
  color: var(--dpz-text-muted);
}

.dpz-tree__options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

@media (max-width: 639px) {
  .dpz-tree__options {
    grid-template-columns: 1fr;
  }
}

.dpz-tree__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  text-align: left;
  padding: 13px 14px;
  border-radius: 8px;
  border: 1px solid var(--dpz-border-strong);
  background: var(--dpz-bg);
  color: var(--dpz-ink);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.14s ease, background-color 0.14s ease;
}

.dpz-tree__option:hover {
  border-color: var(--dpz-accent);
  background: var(--dpz-accent-soft);
}

.dpz-tree__arrow {
  color: var(--dpz-accent);
  flex-shrink: 0;
}

.dpz-tree__result {
  background: var(--dpz-bg);
  border: 1px solid var(--dpz-border);
  border-radius: 9px;
  padding: 16px;
}

.dpz-tree__result-tag {
  display: inline-block;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--dpz-green);
  background: var(--dpz-green-soft);
  padding: 2px 8px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.dpz-tree__result-title {
  margin: 0 0 6px;
  font-size: 16.5px;
  color: var(--dpz-ink);
}

.dpz-tree__result-summary {
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--dpz-text);
}

.dpz-tree__checks-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--dpz-ink);
  margin-bottom: 4px;
}

.dpz-tree__checks {
  margin: 0 0 14px;
  padding-left: 20px;
  font-size: 13.5px;
  line-height: 1.65;
}

.dpz-tree__warning {
  padding: 8px 12px;
  border-radius: 6px;
  background: var(--dpz-amber-soft);
  border-left: 3px solid var(--dpz-amber);
  font-size: 13px;
  color: var(--dpz-ink);
  margin-bottom: 14px;
}

.dpz-tree__cta {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 7px;
  background: var(--dpz-accent);
  color: #FFFFFF !important;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none !important;
}

.dpz-tree__cta:hover {
  background: var(--dpz-accent-hover);
}
</style>
