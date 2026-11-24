<script setup lang="ts">
import { computed, ref } from 'vue'
import { getAllClients, type ClientRecord } from '../utils/siteData'

const selectedOs = ref('all')
const selectedType = ref('all')

const osList = ['all', 'Windows', 'macOS', 'Android', 'iOS', 'Linux', 'OpenWrt']

const fallbackClients: ClientRecord[] = [
  {
    id: 'clash-verge-rev',
    name: 'Clash Verge Rev',
    category: 'third-party',
    platforms: ['Windows', 'macOS', 'Linux'],
    cores: ['Mihomo (Clash Meta)'],
    protocols: ['SS', 'VMess', 'VLESS', 'Trojan', 'Hysteria2', 'TUIC', 'AnyTLS'],
    maintainerStatus: '活跃维护',
    officialRepoStatus: '项目地址待核实，请以作者发布页为准',
    docPath: '/clients/clash-verge/',
    summary: '基于 Mihomo 内核的跨平台桌面客户端，支持系统代理、Service Mode TUN 与规则覆写。',
  },
  {
    id: 'v2rayn',
    name: 'v2rayN',
    category: 'third-party',
    platforms: ['Windows', 'Linux', 'macOS'],
    cores: ['Xray-core', 'sing-box', 'Mihomo'],
    protocols: ['VLESS', 'VMess', 'Trojan', 'Shadowsocks', 'Hysteria2'],
    maintainerStatus: '活跃维护',
    officialRepoStatus: '项目地址待核实，请以作者发布页为准',
    docPath: '/clients/v2rayn/',
    summary: '多核心聚合客户端，Windows 依赖 .NET Desktop Runtime，支持核心切换与分流路由。',
  },
  {
    id: 'clash-meta-android',
    name: 'Clash Meta for Android',
    category: 'third-party',
    platforms: ['Android'],
    cores: ['Mihomo (Clash Meta)'],
    protocols: ['SS', 'VMess', 'VLESS', 'Trojan', 'Hysteria2'],
    maintainerStatus: '活跃维护',
    officialRepoStatus: '项目地址待核实，请以作者发布页为准',
    docPath: '/clients/clash-meta/',
    summary: 'Android 端 Mihomo 内核客户端，依赖系统 VpnService 接管流量，需关注后台省电策略。',
  },
  {
    id: 'shadowrocket',
    name: 'Shadowrocket（小火箭）',
    category: 'third-party',
    platforms: ['iOS', 'macOS'],
    cores: ['自研多协议引擎'],
    protocols: ['SS', 'SSR', 'VMess', 'VLESS', 'Trojan', 'Hysteria2', 'TUIC'],
    maintainerStatus: 'App Store 付费工具（外区账号购买）',
    officialRepoStatus: 'App Store 官方上架，注意区分高仿同名应用',
    docPath: '/clients/shadowrocket/',
    summary: 'iOS 生态广泛使用的通用订阅客户端，支持配置模块、本地 DNS 映射与分流规则。',
  },
  {
    id: 'sing-box',
    name: 'sing-box 官方客户端 (SFA/SFI/SFM)',
    category: 'third-party',
    platforms: ['Windows', 'macOS', 'Linux', 'Android', 'iOS', 'OpenWrt'],
    cores: ['sing-box'],
    protocols: ['VLESS', 'VMess', 'Trojan', 'Hysteria2', 'TUIC', 'AnyTLS'],
    maintainerStatus: '活跃维护',
    officialRepoStatus: '项目地址待核实，请以作者发布页为准',
    docPath: '/clients/sing-box/',
    summary: '统一多端生态，支持现代协议与高效 TUN 转发；OpenWrt 常见配套为 HomeProxy / Nikki（OpenWrt 24.10+）。',
  },
  {
    id: 'nekobox',
    name: 'NekoBox for Android',
    category: 'third-party',
    platforms: ['Android'],
    cores: ['sing-box'],
    protocols: ['VLESS', 'VMess', 'Trojan', 'Hysteria2', 'TUIC'],
    maintainerStatus: '需防范应用商店仿冒包',
    maintenanceWarning: 'Google Play 商店曾出现非官方高仿包，下载前务必核对开发者签名与发布来源。',
    officialRepoStatus: '尚未核实',
    docPath: '/clients/sing-box/',
    summary: '基于 sing-box 的 Android 通用客户端，兼容性高但需严防第三方盗版安装包。',
  },
  {
    id: 'mihomo-party',
    name: 'Mihomo Party / Clash Nyanpasu',
    category: 'third-party',
    platforms: ['Windows', 'macOS', 'Linux'],
    cores: ['Mihomo'],
    protocols: ['SS', 'VMess', 'VLESS', 'Trojan', 'Hysteria2'],
    maintainerStatus: '关注上游维护动态',
    maintenanceWarning: '部分衍生分支曾出现仓库迁移或维护节奏调整，使用前请核查当前维护状态。',
    officialRepoStatus: '尚未核实',
    docPath: '/clients/mihomo/',
    summary: 'Mihomo 内核衍生桌面端，与 Clash Verge Rev 配置结构相近。',
  },
  {
    id: 'clash-for-windows',
    name: 'Clash for Windows (CFW) [已停更]',
    category: 'third-party',
    platforms: ['Windows', 'macOS', 'Linux'],
    cores: ['原 Clash 内核（无新协议支持）'],
    protocols: ['SS', 'VMess', 'Trojan'],
    maintainerStatus: '已停止维护',
    maintenanceWarning: '原项目已永久停更且不支持 VLESS/Hysteria2 等新协议，建议安全备份配置后迁移至 Clash Verge Rev 或 sing-box。',
    officialRepoStatus: '已归档停更',
    docPath: '/troubleshooting/articles/client-migration-backup',
    summary: '历史桌面客户端，不应再从非可信网盘下载安装。',
  },
  {
    id: 'brand-native-apps',
    name: '品牌专属客户端（部分机场绑定）',
    category: 'native',
    platforms: ['Windows', 'macOS', 'Android', 'iOS'],
    cores: ['闭源/定制内置内核'],
    protocols: ['随品牌调整（部分未公开）'],
    maintainerStatus: '依赖各品牌自行更新',
    maintenanceWarning: '如飞猫云、无忧链接、Firefly 等标记“专属客户端无订阅限制”，无法导入 Clash/Shadowrocket，迁移或排查受限于品牌自身面板。',
    officialRepoStatus: '仅通过品牌核验面板获取，切勿在非官方站点下载',
    docPath: '/guides/subscriptions/',
    summary: '开箱登录即可连接，但排障可控度低，且更换服务商时无法沿用原有客户端规则。',
  },
]

const clientPool = computed<ClientRecord[]>(() => {
  const fromData = getAllClients()
  return fromData.length > 0 ? fromData : fallbackClients
})

const filteredClients = computed(() => {
  return clientPool.value.filter((c) => {
    const platforms = (c.platforms || c.os || []).map((p) => String(p).toLowerCase())
    if (selectedOs.value !== 'all') {
      if (!platforms.some((p) => p.includes(selectedOs.value.toLowerCase()))) return false
    }
    if (selectedType.value !== 'all') {
      const cat = String(c.category || c.type || '').toLowerCase()
      const isNative = cat.includes('native') || cat.includes('专属')
      if (selectedType.value === 'native' && !isNative) return false
      if (selectedType.value === 'third-party' && isNative) return false
    }
    return true
  })
})

function isUnverifiedLink(c: ClientRecord): boolean {
  const url = String(c.officialUrl || '')
  const status = String(c.officialRepoStatus || '')
  return !url.startsWith('http') || status.includes('尚未核实') || status.includes('待核实')
}
</script>

<template>
  <section class="dpz-clients" aria-label="客户端软件兼容矩阵" data-pagefind-ignore="all">
    <div class="dpz-clients__filters">
      <div class="dpz-clients__os-group" role="group" aria-label="按操作系统筛选">
        <button
          v-for="os in osList"
          :key="os"
          type="button"
          class="dpz-clients__pill"
          :class="{ 'is-active': selectedOs === os }"
          @click="selectedOs = os"
        >
          {{ os === 'all' ? '全部平台' : os }}
        </button>
      </div>

      <div class="dpz-clients__type-group">
        <select v-model="selectedType" class="dpz-clients__select" aria-label="按客户端类型筛选">
          <option value="all">全部类型（通用 + 专属）</option>
          <option value="third-party">仅第三方通用订阅客户端</option>
          <option value="native">仅品牌专属客户端</option>
        </select>
      </div>
    </div>

    <div v-if="filteredClients.length === 0" class="dpz-clients__empty">
      当前筛选组合暂无匹配客户端，请切换平台或类型查看。
    </div>

    <div v-else class="dpz-clients__grid">
      <article v-for="c in filteredClients" :key="c.id || c.name" class="dpz-client-card">
        <div class="dpz-client-card__head">
          <h3 class="dpz-client-card__title">
            <a v-if="c.docPath" :href="c.docPath">{{ c.name }}</a>
            <span v-else>{{ c.name }}</span>
          </h3>
          <span
            class="dpz-client-card__type"
            :class="(c.category || c.type || '').includes('native') || (c.category || c.type || '').includes('专属') ? 'is-native' : 'is-third'"
          >
            {{
              (c.category || c.type || '').includes('native') || (c.category || c.type || '').includes('专属')
                ? '专属客户端'
                : '第三方通用'
            }}
          </span>
        </div>

        <p v-if="c.summary" class="dpz-client-card__summary">{{ c.summary }}</p>

        <div class="dpz-client-card__meta">
          <div>
            <strong>支持平台：</strong>
            <span>{{ (c.platforms || c.os || []).join(' · ') || '待核实' }}</span>
          </div>
          <div v-if="c.cores?.length">
            <strong>内核：</strong>
            <span class="dpz-mono">{{ c.cores.join(' / ') }}</span>
          </div>
          <div v-if="c.protocols?.length">
            <strong>常见协议：</strong>
            <span class="dpz-mono">{{ c.protocols.join(', ') }}</span>
          </div>
        </div>

        <div v-if="c.maintenanceWarning" class="dpz-client-card__warn">
          维护提示：{{ c.maintenanceWarning }}
        </div>

        <div class="dpz-client-card__foot">
          <span v-if="isUnverifiedLink(c)" class="dpz-client-card__unverified">
            官网/仓库链接：{{ c.officialRepoStatus || '尚未核实' }}
          </span>
          <a
            v-else-if="c.officialUrl"
            :href="c.officialUrl"
            target="_blank"
            rel="nofollow noopener noreferrer"
            class="dpz-client-card__ext"
          >
            核验发布页 ↗
          </a>
          <a v-if="c.docPath" :href="c.docPath" class="dpz-client-card__doc">安装与排障指南 →</a>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.dpz-clients {
  margin: 20px 0;
}

.dpz-clients__filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.dpz-clients__os-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.dpz-clients__pill {
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--dpz-border-strong);
  background: var(--dpz-surface);
  color: var(--dpz-text);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.dpz-clients__pill.is-active {
  background: var(--dpz-accent);
  border-color: var(--dpz-accent);
  color: #FFFFFF;
}

.dpz-clients__select {
  height: 36px;
  border: 1px solid var(--dpz-border-strong);
  border-radius: 7px;
  background: var(--dpz-surface);
  color: var(--dpz-ink);
  font-size: 13px;
  padding: 0 10px;
}

.dpz-clients__empty {
  padding: 24px;
  text-align: center;
  background: var(--dpz-surface);
  border: 1px solid var(--dpz-border);
  border-radius: 9px;
  color: var(--dpz-text-muted);
}

.dpz-clients__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

@media (max-width: 767px) {
  .dpz-clients__grid {
    grid-template-columns: 1fr;
  }
}

.dpz-client-card {
  display: flex;
  flex-direction: column;
  background: var(--dpz-surface);
  border: 1px solid var(--dpz-border);
  border-radius: 10px;
  padding: 16px;
}

.dpz-client-card__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.dpz-client-card__title {
  margin: 0 !important;
  font-size: 16px !important;
}

.dpz-client-card__title a {
  color: var(--dpz-ink);
  text-decoration: none;
}

.dpz-client-card__title a:hover {
  color: var(--dpz-accent);
  text-decoration: underline;
}

.dpz-client-card__type {
  font-size: 11.5px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

.dpz-client-card__type.is-third {
  background: var(--dpz-green-soft);
  color: var(--dpz-green);
}

.dpz-client-card__type.is-native {
  background: var(--dpz-amber-soft);
  color: var(--dpz-amber);
}

.dpz-client-card__summary {
  margin: 0 0 10px;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--dpz-text);
}

.dpz-client-card__meta {
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--dpz-text-muted);
  background: var(--dpz-bg);
  padding: 10px 12px;
  border-radius: 7px;
  margin-bottom: 10px;
}

.dpz-client-card__warn {
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--dpz-red);
  background: var(--dpz-red-soft);
  border-left: 3px solid var(--dpz-red);
  padding: 8px 10px;
  border-radius: 5px;
  margin-bottom: 10px;
}

.dpz-client-card__foot {
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid var(--dpz-border);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
}

.dpz-client-card__unverified {
  color: var(--dpz-text-muted);
}

.dpz-client-card__doc,
.dpz-client-card__ext {
  font-weight: 600;
  color: var(--dpz-accent);
  text-decoration: none;
}

.dpz-client-card__doc:hover,
.dpz-client-card__ext:hover {
  text-decoration: underline;
}
</style>
