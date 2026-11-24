<script setup lang="ts">
import { computed, ref } from 'vue'
import { getAllIssues, type IssueRecord } from '../utils/siteData'

const props = withDefaults(
  defineProps<{
    compact?: boolean
    defaultCategory?: string
  }>(),
  {
    compact: false,
    defaultCategory: 'all',
  }
)

const selectedOs = ref('all')
const selectedClient = ref('all')
const selectedSymptom = ref(props.defaultCategory || 'all')
const selectedCode = ref('all')

const osOptions = [
  { value: 'all', label: '全部系统' },
  { value: 'Windows', label: 'Windows' },
  { value: 'macOS', label: 'macOS' },
  { value: 'Android', label: 'Android' },
  { value: 'iOS', label: 'iOS' },
  { value: 'Linux', label: 'Linux' },
  { value: 'OpenWrt', label: 'OpenWrt' },
]

const clientOptions = [
  { value: 'all', label: '全部客户端' },
  { value: 'Clash Verge Rev', label: 'Clash Verge Rev' },
  { value: 'Clash Meta', label: 'Clash Meta / Android' },
  { value: 'v2rayN', label: 'v2rayN' },
  { value: 'Shadowrocket', label: 'Shadowrocket 小火箭' },
  { value: 'sing-box', label: 'sing-box / Hiddify / Karing' },
  { value: '专属客户端', label: '品牌专属客户端' },
]

const symptomOptions = [
  { value: 'all', label: '全部故障现象' },
  { value: 'subscription', label: '无法更新/导入订阅' },
  { value: 'timeout', label: '节点全超时 / 单地区超时' },
  { value: 'no-internet', label: '连上节点但打不开网页' },
  { value: 'tun', label: 'TUN 虚拟网卡无效' },
  { value: 'dns', label: 'DNS 泄漏 / 污染 / Fake-IP' },
  { value: 'startup', label: '客户端无法启动 / 白屏' },
  { value: 'slow', label: '晚高峰慢 / 丢包 / UDP 异常' },
]

const codeOptions = [
  { value: 'all', label: '不限报错码' },
  { value: '200', label: 'HTTP 200 空订阅' },
  { value: '401/403/404/503', label: '401 / 403 / 404 / 503' },
  { value: 'TLS/DNS', label: 'TLS 证书 / DNS 超时' },
  { value: '198.18', label: '198.18.0.1 Fake-IP' },
  { value: '0B', label: '测速 0B / Timeout' },
]

const fallbackIssues: IssueRecord[] = [
  {
    id: 'sub-200-empty',
    code: 'HTTP 200',
    category: 'subscription',
    title: '订阅返回 HTTP 200 但内容为 0 字节 / 空白',
    os: ['Windows', 'macOS', 'Android', 'iOS', 'Linux'],
    clients: ['Clash Verge Rev', 'Clash Meta', 'v2rayN', 'Shadowrocket', 'sing-box'],
    httpCodes: ['200'],
    symptoms: ['更新订阅成功但节点数 0', '导入后无任何节点'],
    lowRiskChecks: [
      '用浏览器或 curl -I 检查订阅 URL 是否返回 HTML 登录页而非 YAML/Base64',
      '确认当前机场是否属于“仅限专属客户端”品牌（无通用订阅）',
      '检查客户端 User-Agent 覆写是否被机场面板 WAF 拦截',
    ],
    targetUrl: '/troubleshooting/articles/sub-http-200-empty',
  },
  {
    id: 'sub-4xx-5xx',
    code: '401/403/404/503',
    category: 'subscription',
    title: '更新订阅报 401 / 403 / 404 / 503 或被 302 重定向',
    os: ['Windows', 'macOS', 'Android', 'iOS', 'Linux', 'OpenWrt'],
    clients: ['Clash Verge Rev', 'Clash Meta', 'v2rayN', 'Shadowrocket', 'sing-box'],
    httpCodes: ['401/403/404/503'],
    symptoms: ['403 Forbidden', '401 Unauthorized', '404 Not Found'],
    lowRiskChecks: [
      '401/404 优先登录面板核对订阅 Token 是否被手动重置或过期',
      '403/503 多为 Cloudflare 拦截或本地代理未关闭导致死循环拉取',
      '关闭系统代理后直连更新订阅，切勿在公开工单暴露完整订阅链接',
    ],
    targetUrl: '/troubleshooting/articles/sub-http-401-403-404-503',
  },
  {
    id: 'sub-tls-dns',
    code: 'TLS/DNS',
    category: 'subscription',
    title: '更新订阅提示 TLS 证书错误、DNS 解析失败或连接超时',
    os: ['Windows', 'macOS', 'Android', 'iOS', 'Linux'],
    clients: ['Clash Verge Rev', 'v2rayN', 'Shadowrocket', 'sing-box'],
    httpCodes: ['TLS/DNS'],
    symptoms: ['x509 certificate', 'EOF', 'DNS lookup failed'],
    lowRiskChecks: [
      '核对本机系统时间与时区误差（超过 90 秒会导致 TLS 握手直接失败）',
      '检查本地是否开启了旧代理或残余 hosts 记录拦截了订阅域名',
      '确认机场是否更换了备用订阅域名',
    ],
    targetUrl: '/troubleshooting/articles/sub-tls-dns-timeout',
  },
  {
    id: 'nodes-all-timeout',
    code: '0B / Timeout',
    category: 'timeout',
    title: '所有节点同时显示超时（Timeout / 0B）',
    os: ['Windows', 'macOS', 'Android', 'iOS', 'Linux', 'OpenWrt'],
    clients: ['Clash Verge Rev', 'Clash Meta', 'v2rayN', 'Shadowrocket', 'sing-box', '专属客户端'],
    httpCodes: ['0B', 'TLS/DNS'],
    symptoms: ['全部节点不可用', '延迟全部显示 -1 或 Timeout'],
    lowRiskChecks: [
      '先访问普通国内网页确认本地宽带/Wi-Fi 本身正常',
      '同步系统时间（VLESS/Trojan/VMess 对时间误差极敏感）',
      '更新一次订阅，排除套餐过期、流量耗尽或机场全局失联',
    ],
    targetUrl: '/troubleshooting/articles/nodes-all-timeout',
  },
  {
    id: 'connected-no-internet',
    code: 'No Internet',
    category: 'no-internet',
    title: '节点测速有延迟，但连上后所有网页都打不开',
    os: ['Windows', 'macOS', 'Android', 'iOS', 'Linux'],
    clients: ['Clash Verge Rev', 'v2rayN', 'Shadowrocket', 'sing-box'],
    httpCodes: ['TLS/DNS'],
    symptoms: ['能测出延迟但无法上网', '浏览器 ERR_PROXY_CONNECTION_FAILED'],
    lowRiskChecks: [
      '检查系统代理端口（如 7890 / 7897 / 10808）是否与其他代理软件冲突',
      '排查是否同时开启了多个代理工具或浏览器扩展（如 SwitchyOmega）覆盖了端口',
      '先关闭 TUN 仅保留系统代理测试单一变量',
    ],
    targetUrl: '/troubleshooting/articles/connected-no-internet',
  },
  {
    id: 'tun-not-working',
    code: 'TUN Mode',
    category: 'tun',
    title: '开启 TUN 虚拟网卡后仍然直连或直接断网',
    os: ['Windows', 'macOS', 'Linux', 'OpenWrt'],
    clients: ['Clash Verge Rev', 'Clash Meta', 'sing-box', 'v2rayN'],
    httpCodes: ['198.18', 'TLS/DNS'],
    symptoms: ['TUN 开关灰显', '开启 TUN 后局域网或全部流量断网'],
    lowRiskChecks: [
      'Windows/macOS 需先授权服务模式（Service Mode）或以管理员权限安装虚拟网卡',
      '检查是否残留旧版 Clash/VPN 虚拟网卡驱动造成路由表抢占',
      '记录当前网卡配置，准备回滚：关闭 TUN 并还原系统自动 DNS',
    ],
    targetUrl: '/troubleshooting/articles/tun-not-working',
  },
  {
    id: 'dns-leak-fakeip',
    code: '198.18 / DNS',
    category: 'dns',
    title: 'DNS 泄漏、DNS 污染与 Fake-IP (198.18.0.1) 冲突',
    os: ['Windows', 'macOS', 'Android', 'iOS', 'Linux', 'OpenWrt'],
    clients: ['Clash Verge Rev', 'Clash Meta', 'Shadowrocket', 'sing-box'],
    httpCodes: ['198.18', 'TLS/DNS'],
    symptoms: ['国内应用/微信异常', '域名解析到 198.18.x.x 后无法直连'],
    lowRiskChecks: [
      '关闭代理后执行 nslookup 检查系统 DNS 是否被残留为 127.0.0.1 或 198.18.0.2',
      '将 Fake-IP-Filter 加入常用国内应用与局域网域名，或切换为 Redir-Host 验证',
      '浏览器关闭“安全 DNS (DoH)”避免绕过客户端分流规则',
    ],
    targetUrl: '/troubleshooting/articles/dns-leak-hijack-fix',
  },
  {
    id: 'app-startup-fail',
    code: 'App Start',
    category: 'startup',
    title: '客户端无法启动、白屏或核心加载失败',
    os: ['Windows', 'macOS', 'Android', 'Linux'],
    clients: ['Clash Verge Rev', 'v2rayN', 'Clash Meta', 'sing-box'],
    httpCodes: [],
    symptoms: ['双击无反应', '白屏', 'Mihomo / Xray 核心启动报错'],
    lowRiskChecks: [
      'Windows 检查是否缺少 WebView2 Runtime（Clash Verge）或 .NET Desktop Runtime（v2rayN）',
      '检查安装包架构是否与 CPU 匹配（x64 vs ARM64 / Apple Silicon）',
      '先备份 profiles 配置目录再尝试重置核心配置，切勿随意关闭杀毒软件',
    ],
    targetUrl: '/troubleshooting/articles/clash-verge-startup-fail',
  },
  {
    id: 'slow-udp-peak',
    code: 'Latency / UDP',
    category: 'slow',
    title: '晚高峰高延迟、丢包严重或 UDP/AI 工具异常',
    os: ['Windows', 'macOS', 'Android', 'iOS', 'Linux', 'OpenWrt'],
    clients: ['Clash Verge Rev', 'Clash Meta', 'v2rayN', 'Shadowrocket', 'sing-box', '专属客户端'],
    httpCodes: ['0B'],
    symptoms: ['白天快晚上卡', '测速高但网页慢', '语音/游戏 UDP 不通'],
    lowRiskChecks: [
      '对比不同地区节点与不同时间段表现，区分本地宽带晚高峰拥塞与中转瓶颈',
      '在客户端核对节点是否开启 UDP 转发，检查是否命中高倍率（2x/5x）节点',
      '针对 ChatGPT/Claude 等 AI 工具开启独立地区分流，避免频繁跨区跳 IP',
    ],
    targetUrl: '/troubleshooting/articles/high-latency-packet-loss-peak',
  },
]

const issuePool = computed<IssueRecord[]>(() => {
  const fromData = getAllIssues()
  return fromData.length > 0 ? fromData : fallbackIssues
})

const filteredIssues = computed(() => {
  return issuePool.value.filter((item) => {
    const osList = (item.os || []).map((x) => String(x).toLowerCase())
    const clientList = (item.clients || []).map((x) => String(x).toLowerCase())
    const codeList = (item.httpCodes || []).map((x) => String(x).toLowerCase())
    const hay = `${item.title} ${item.code || ''} ${item.category || ''} ${(item.symptoms || []).join(' ')}`.toLowerCase()

    if (selectedOs.value !== 'all' && osList.length > 0) {
      if (!osList.some((x) => x.includes(selectedOs.value.toLowerCase()))) return false
    }

    if (selectedClient.value !== 'all' && clientList.length > 0) {
      const target = selectedClient.value.toLowerCase()
      if (!clientList.some((x) => x.includes(target) || target.includes(x))) return false
    }

    if (selectedSymptom.value !== 'all') {
      const cat = String(item.category || '').toLowerCase()
      const sym = selectedSymptom.value.toLowerCase()
      if (cat && !cat.includes(sym) && !hay.includes(sym)) {
        // loose keyword fallback
        const map: Record<string, string[]> = {
          subscription: ['订阅', '200', '401', '403', '404', 'sub'],
          timeout: ['超时', 'timeout', '0b'],
          'no-internet': ['打不开', '连上', '系统代理', '端口', 'no-internet'],
          tun: ['tun', '虚拟网卡'],
          dns: ['dns', 'fake-ip', '198.18', '泄漏', '污染'],
          startup: ['启动', '白屏', '核心', 'webview', 'startup'],
          slow: ['慢', '丢包', '晚高峰', 'udp', '延迟', '倍率', 'slow'],
        }
        const words = map[sym] || [sym]
        if (!words.some((w) => hay.includes(w))) return false
      }
    }

    if (selectedCode.value !== 'all') {
      const codeTarget = selectedCode.value.toLowerCase()
      const codeHit =
        codeList.some((c) => c.includes(codeTarget) || codeTarget.includes(c)) ||
        hay.includes(codeTarget)
      if (!codeHit) return false
    }

    return true
  })
})

function resetFilters() {
  selectedOs.value = 'all'
  selectedClient.value = 'all'
  selectedSymptom.value = 'all'
  selectedCode.value = 'all'
}
</script>

<template>
  <section class="dpz-triage" aria-label="交互式故障排查分流器" data-pagefind-ignore="all">
    <div class="dpz-triage__head">
      <div>
        <div class="dpz-triage__eyebrow dpz-mono">DIAGNOSTIC TRIAGE · 3 步快速分流</div>
        <h2 class="dpz-triage__title">按系统、客户端与报错现象定位排障路径</h2>
      </div>
      <button type="button" class="dpz-triage__reset" @click="resetFilters">重置条件</button>
    </div>

    <div class="dpz-triage__controls">
      <label class="dpz-field">
        <span class="dpz-field__label">1. 操作系统</span>
        <select v-model="selectedOs" class="dpz-field__select">
          <option v-for="opt in osOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </label>

      <label class="dpz-field">
        <span class="dpz-field__label">2. 客户端软件</span>
        <select v-model="selectedClient" class="dpz-field__select">
          <option v-for="opt in clientOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </label>

      <label class="dpz-field">
        <span class="dpz-field__label">3. 核心故障现象</span>
        <select v-model="selectedSymptom" class="dpz-field__select">
          <option v-for="opt in symptomOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </label>

      <label class="dpz-field">
        <span class="dpz-field__label">4. 状态码 / 特征（可选）</span>
        <select v-model="selectedCode" class="dpz-field__select">
          <option v-for="opt in codeOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </label>
    </div>

    <div class="dpz-triage__meta">
      <span>共匹配 <strong>{{ filteredIssues.length }}</strong> 条可操作排障方案（优先展示低风险检查步骤）</span>
    </div>

    <div v-if="filteredIssues.length > 0" class="dpz-triage__list" :class="{ 'is-compact': compact }">
      <article
        v-for="issue in compact ? filteredIssues.slice(0, 4) : filteredIssues"
        :key="issue.id"
        class="dpz-issue-card"
      >
        <div class="dpz-issue-card__top">
          <span v-if="issue.code" class="dpz-issue-card__code dpz-mono">{{ issue.code }}</span>
          <span v-if="issue.os?.length" class="dpz-issue-card__os">
            {{ issue.os.slice(0, 4).join(' / ') }}
          </span>
        </div>
        <h3 class="dpz-issue-card__title">
          <a :href="issue.targetUrl">{{ issue.title }}</a>
        </h3>
        <ul v-if="issue.lowRiskChecks?.length" class="dpz-issue-card__checks">
          <li v-for="(chk, idx) in issue.lowRiskChecks.slice(0, 3)" :key="idx">{{ chk }}</li>
        </ul>
        <div class="dpz-issue-card__foot">
          <a :href="issue.targetUrl" class="dpz-issue-card__link">查看完整排查路径与回滚提示 →</a>
        </div>
      </article>
    </div>

    <div v-else class="dpz-triage__empty">
      <div class="dpz-triage__empty-title">当前组合暂无精确匹配条目</div>
      <p class="dpz-triage__empty-desc">
        这通常说明故障横跨多个层级，或属于特定客户端/专属客户端限制。建议先放宽条件，或按以下低风险兜底顺序核对：
      </p>
      <ol class="dpz-triage__fallback-steps">
        <li>核对本机系统时间误差是否大于 90 秒（影响所有 TLS/VLESS 节点）。</li>
        <li>暂时关闭代理与浏览器 DoH，确认基础宽带与 DNS 解析正常。</li>
        <li>核对当前品牌是否属于“仅限专属客户端”且不支持第三方订阅。</li>
      </ol>
      <div class="dpz-triage__empty-actions">
        <button type="button" class="dpz-triage__btn" @click="resetFilters">显示全部排障条目</button>
        <a href="/troubleshooting/articles/cross-client-inconsistency" class="dpz-triage__link">
          查看跨客户端差异排查 →
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.dpz-triage {
  background: var(--dpz-surface);
  border: 1px solid var(--dpz-border-strong);
  border-radius: 12px;
  padding: 22px;
  margin: 20px 0;
}

.dpz-triage__head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.dpz-triage__eyebrow {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--dpz-green);
  letter-spacing: 0.04em;
  margin-bottom: 4px;
}

.dpz-triage__title {
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  font-size: 1.2rem !important;
  color: var(--dpz-ink);
}

.dpz-triage__reset {
  border: 1px solid var(--dpz-border-strong);
  background: var(--dpz-bg);
  color: var(--dpz-text);
  font-size: 13px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.dpz-triage__reset:hover {
  border-color: var(--dpz-accent);
  color: var(--dpz-accent);
}

.dpz-triage__controls {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

@media (max-width: 959px) {
  .dpz-triage__controls {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 539px) {
  .dpz-triage__controls {
    grid-template-columns: 1fr;
  }
}

.dpz-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.dpz-field__label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--dpz-text-muted);
}

.dpz-field__select {
  height: 38px;
  border-radius: 7px;
  border: 1px solid var(--dpz-border-strong);
  background: var(--dpz-bg);
  color: var(--dpz-ink);
  font-size: 13.5px;
  padding: 0 10px;
}

.dpz-triage__meta {
  font-size: 13px;
  color: var(--dpz-text-muted);
  margin-bottom: 14px;
}

.dpz-triage__list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

@media (max-width: 767px) {
  .dpz-triage__list {
    grid-template-columns: 1fr;
  }
}

.dpz-issue-card {
  display: flex;
  flex-direction: column;
  background: var(--dpz-bg);
  border: 1px solid var(--dpz-border);
  border-radius: 9px;
  padding: 16px;
}

.dpz-issue-card__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.dpz-issue-card__code {
  font-size: 11.5px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--dpz-accent-soft);
  color: var(--dpz-accent);
}

.dpz-issue-card__os {
  font-size: 12px;
  color: var(--dpz-text-muted);
}

.dpz-issue-card__title {
  margin: 0 0 8px !important;
  font-size: 15.5px !important;
  line-height: 1.45 !important;
}

.dpz-issue-card__title a {
  color: var(--dpz-ink);
  text-decoration: none;
}

.dpz-issue-card__title a:hover {
  color: var(--dpz-accent);
  text-decoration: underline;
}

.dpz-issue-card__checks {
  margin: 0 0 12px;
  padding-left: 18px;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--dpz-text);
}

.dpz-issue-card__foot {
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid var(--dpz-border);
}

.dpz-issue-card__link {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--dpz-accent);
  text-decoration: none;
}

.dpz-issue-card__link:hover {
  text-decoration: underline;
}

.dpz-triage__empty {
  background: var(--dpz-amber-soft);
  border: 1px solid #E2C699;
  border-radius: 9px;
  padding: 18px;
}

.dpz-triage__empty-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--dpz-ink);
  margin-bottom: 6px;
}

.dpz-triage__empty-desc {
  margin: 0 0 10px;
  font-size: 13.5px;
  color: var(--dpz-text);
}

.dpz-triage__fallback-steps {
  margin: 0 0 14px;
  padding-left: 20px;
  font-size: 13.5px;
  line-height: 1.65;
}

.dpz-triage__empty-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
}

.dpz-triage__btn {
  padding: 7px 14px;
  border-radius: 6px;
  border: none;
  background: var(--dpz-accent);
  color: #FFFFFF;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
}

.dpz-triage__link {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--dpz-accent);
}
</style>
