<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    mode?: 'routes' | 'dns' | 'tun'
  }>(),
  {
    mode: 'routes',
  }
)

const activeMode = ref<'routes' | 'dns' | 'tun'>(props.mode)
</script>

<template>
  <section class="dpz-diagram" aria-label="代理网络概念拓扑示意图">
    <div class="dpz-diagram__disclaimer">
      <strong>概念示意 / 非该品牌实际物理拓扑：</strong>
      此图仅用于解释网络分层、DNS 与 TUN 接管原理，不代表任何具体机场的真实物理机房或跨境路由配置。
    </div>

    <div class="dpz-diagram__tabs" role="tablist" aria-label="切换拓扑模式">
      <button
        type="button"
        role="tab"
        :aria-selected="activeMode === 'routes'"
        class="dpz-diagram__tab"
        :class="{ 'is-active': activeMode === 'routes' }"
        @click="activeMode = 'routes'"
      >
        直连 / 公网中转 / IEPL 专线分层
      </button>
      <button
        type="button"
        role="tab"
        :aria-selected="activeMode === 'dns'"
        class="dpz-diagram__tab"
        :class="{ 'is-active': activeMode === 'dns' }"
        @click="activeMode = 'dns'"
      >
        DNS 解析：Fake-IP vs Redir-Host
      </button>
      <button
        type="button"
        role="tab"
        :aria-selected="activeMode === 'tun'"
        class="dpz-diagram__tab"
        :class="{ 'is-active': activeMode === 'tun' }"
        @click="activeMode = 'tun'"
      >
        流量接管：系统代理 vs TUN 虚拟网卡
      </button>
    </div>

    <div class="dpz-diagram__canvas">
      <svg
        v-if="activeMode === 'routes'"
        viewBox="0 0 820 260"
        class="dpz-diagram__svg"
        role="img"
        aria-label="直连、公网中转与专线概念对比拓扑图"
      >
        <!-- Path 1: Direct -->
        <rect x="20" y="20" width="130" height="44" rx="7" fill="#1B2632" stroke="#67B7C9" />
        <text x="85" y="47" text-anchor="middle" fill="#E9EFF4" font-size="13">本地客户端</text>
        <line x1="150" y1="42" x2="350" y2="42" stroke="#E07060" stroke-width="2" stroke-dasharray="5 4" />
        <text x="250" y="34" text-anchor="middle" fill="#E07060" font-size="11">公网跨境直连（易受晚高峰波动）</text>
        <rect x="350" y="20" width="150" height="44" rx="7" fill="#1B2632" stroke="#E07060" />
        <text x="425" y="47" text-anchor="middle" fill="#E9EFF4" font-size="13">海外落地服务器</text>
        <line x1="500" y1="42" x2="650" y2="42" stroke="#9BAAB8" stroke-width="2" />
        <rect x="650" y="20" width="145" height="44" rx="7" fill="#1B2632" stroke="#9BAAB8" />
        <text x="722" y="47" text-anchor="middle" fill="#E9EFF4" font-size="13">目标网站 / AI</text>

        <!-- Path 2: Transit -->
        <rect x="20" y="106" width="130" height="44" rx="7" fill="#1B2632" stroke="#67B7C9" />
        <text x="85" y="133" text-anchor="middle" fill="#E9EFF4" font-size="13">本地客户端</text>
        <line x1="150" y1="128" x2="255" y2="128" stroke="#67B7C9" stroke-width="2" />
        <rect x="255" y="106" width="155" height="44" rx="7" fill="#1B2632" stroke="#E2A952" />
        <text x="332" y="133" text-anchor="middle" fill="#E9EFF4" font-size="13">国内入口 / BGP 中转</text>
        <line x1="410" y1="128" x2="505" y2="128" stroke="#E2A952" stroke-width="2" />
        <rect x="505" y="106" width="110" height="44" rx="7" fill="#1B2632" stroke="#E2A952" />
        <text x="560" y="133" text-anchor="middle" fill="#E9EFF4" font-size="13">海外落地 IP</text>
        <line x1="615" y1="128" x2="650" y2="128" stroke="#9BAAB8" stroke-width="2" />
        <rect x="650" y="106" width="145" height="44" rx="7" fill="#1B2632" stroke="#9BAAB8" />
        <text x="722" y="133" text-anchor="middle" fill="#E9EFF4" font-size="13">目标网站 / AI</text>

        <!-- Path 3: IEPL/IPLC -->
        <rect x="20" y="192" width="130" height="44" rx="7" fill="#1B2632" stroke="#5EC2A6" />
        <text x="85" y="219" text-anchor="middle" fill="#E9EFF4" font-size="13">本地客户端</text>
        <line x1="150" y1="214" x2="255" y2="214" stroke="#5EC2A6" stroke-width="2" />
        <rect x="255" y="192" width="155" height="44" rx="7" fill="#1B2632" stroke="#5EC2A6" />
        <text x="332" y="213" text-anchor="middle" fill="#5EC2A6" font-size="12">专线入口</text>
        <text x="332" y="229" text-anchor="middle" fill="#9BAAB8" font-size="10.5">（IEPL / IPLC 概念）</text>
        <line x1="410" y1="214" x2="505" y2="214" stroke="#5EC2A6" stroke-width="3" />
        <rect x="505" y="192" width="110" height="44" rx="7" fill="#1B2632" stroke="#5EC2A6" />
        <text x="560" y="219" text-anchor="middle" fill="#E9EFF4" font-size="13">海外落地 IP</text>
        <line x1="615" y1="214" x2="650" y2="214" stroke="#9BAAB8" stroke-width="2" />
        <rect x="650" y="192" width="145" height="44" rx="7" fill="#1B2632" stroke="#9BAAB8" />
        <text x="722" y="219" text-anchor="middle" fill="#E9EFF4" font-size="13">AI 地区看落地 IP</text>
      </svg>

      <svg
        v-else-if="activeMode === 'dns'"
        viewBox="0 0 820 220"
        class="dpz-diagram__svg"
        role="img"
        aria-label="Fake-IP 与 Redir-Host DNS 解析概念图"
      >
        <rect x="20" y="26" width="155" height="50" rx="7" fill="#1B2632" stroke="#67B7C9" />
        <text x="97" y="49" text-anchor="middle" fill="#E9EFF4" font-size="13">应用发起域名请求</text>
        <text x="97" y="66" text-anchor="middle" fill="#9BAAB8" font-size="11">如 chatgpt.com</text>

        <line x1="175" y1="51" x2="250" y2="51" stroke="#67B7C9" stroke-width="2" />
        <rect x="250" y="22" width="220" height="58" rx="7" fill="#1B2632" stroke="#5EC2A6" />
        <text x="360" y="45" text-anchor="middle" fill="#5EC2A6" font-size="13">Fake-IP 模式（立即返回虚拟段）</text>
        <text x="360" y="65" text-anchor="middle" fill="#E9EFF4" font-size="11.5">返回 198.18.0.x · 交由远端落地解析</text>

        <line x1="470" y1="51" x2="555" y2="51" stroke="#5EC2A6" stroke-width="2" />
        <rect x="555" y="26" width="240" height="50" rx="7" fill="#1B2632" stroke="#5EC2A6" />
        <text x="675" y="49" text-anchor="middle" fill="#E9EFF4" font-size="12.5">减少本地 DNS 等待</text>
        <text x="675" y="66" text-anchor="middle" fill="#E2A952" font-size="11">注意：需设 fake-ip-filter 防内网冲突</text>

        <rect x="20" y="130" width="155" height="50" rx="7" fill="#1B2632" stroke="#67B7C9" />
        <text x="97" y="153" text-anchor="middle" fill="#E9EFF4" font-size="13">应用发起域名请求</text>
        <text x="97" y="170" text-anchor="middle" fill="#9BAAB8" font-size="11">Redir-Host 模式</text>

        <line x1="175" y1="155" x2="250" y2="155" stroke="#E2A952" stroke-width="2" />
        <rect x="250" y="126" width="220" height="58" rx="7" fill="#1B2632" stroke="#E2A952" />
        <text x="360" y="149" text-anchor="middle" fill="#E2A952" font-size="13">Redir-Host（先向 DNS 拿真实 IP）</text>
        <text x="360" y="169" text-anchor="middle" fill="#E9EFF4" font-size="11.5">本地取得 IP 后再匹配 GeoIP 规则</text>

        <line x1="470" y1="155" x2="555" y2="155" stroke="#E2A952" stroke-width="2" />
        <rect x="555" y="130" width="240" height="50" rx="7" fill="#1B2632" stroke="#E2A952" />
        <text x="675" y="153" text-anchor="middle" fill="#E9EFF4" font-size="12.5">兼容部分企业内网 / 微信组件</text>
        <text x="675" y="170" text-anchor="middle" fill="#9BAAB8" font-size="11">需配置可信 DoH/DoT 防止本地泄漏</text>
      </svg>

      <svg
        v-else
        viewBox="0 0 820 220"
        class="dpz-diagram__svg"
        role="img"
        aria-label="系统代理与 TUN 虚拟网卡流量路径对比图"
      >
        <rect x="20" y="26" width="160" height="52" rx="7" fill="#1B2632" stroke="#67B7C9" />
        <text x="100" y="49" text-anchor="middle" fill="#E9EFF4" font-size="13">浏览器 / 支持代理软件</text>
        <text x="100" y="66" text-anchor="middle" fill="#9BAAB8" font-size="11">读取系统 HTTP/SOCKS 设置</text>

        <line x1="180" y1="52" x2="275" y2="52" stroke="#67B7C9" stroke-width="2" />
        <rect x="275" y="26" width="225" height="52" rx="7" fill="#1B2632" stroke="#67B7C9" />
        <text x="387" y="49" text-anchor="middle" fill="#67B7C9" font-size="13">本地混合端口 (如 7890 / 7897)</text>
        <text x="387" y="66" text-anchor="middle" fill="#E9EFF4" font-size="11">无需管理员权限，风险低，易回滚</text>

        <line x1="500" y1="52" x2="575" y2="52" stroke="#9BAAB8" stroke-width="2" />
        <rect x="575" y="26" width="220" height="52" rx="7" fill="#1B2632" stroke="#E2A952" />
        <text x="685" y="49" text-anchor="middle" fill="#E9EFF4" font-size="12.5">局限：终端 CLI / 游戏常忽略</text>
        <text x="685" y="66" text-anchor="middle" fill="#9BAAB8" font-size="11">需端口不被其他工具抢占</text>

        <rect x="20" y="130" width="160" height="52" rx="7" fill="#1B2632" stroke="#5EC2A6" />
        <text x="100" y="153" text-anchor="middle" fill="#E9EFF4" font-size="13">全部系统 TCP/UDP 流量</text>
        <text x="100" y="170" text-anchor="middle" fill="#9BAAB8" font-size="11">含命令行、桌面客户端</text>

        <line x1="180" y1="156" x2="275" y2="156" stroke="#5EC2A6" stroke-width="2" />
        <rect x="275" y="130" width="225" height="52" rx="7" fill="#1B2632" stroke="#5EC2A6" />
        <text x="387" y="153" text-anchor="middle" fill="#5EC2A6" font-size="13">TUN 虚拟网卡 (L3 路由接管)</text>
        <text x="387" y="170" text-anchor="middle" fill="#E9EFF4" font-size="11">需 Service Mode / 管理员权限</text>

        <line x1="500" y1="156" x2="575" y2="156" stroke="#5EC2A6" stroke-width="2" />
        <rect x="575" y="130" width="220" height="52" rx="7" fill="#1B2632" stroke="#E07060" />
        <text x="685" y="153" text-anchor="middle" fill="#E9EFF4" font-size="12.5">注意路由环路与多网卡冲突</text>
        <text x="685" y="170" text-anchor="middle" fill="#E07060" font-size="11">断网时关闭 TUN 即可快速回滚</text>
      </svg>
    </div>
  </section>
</template>

<style scoped>
.dpz-diagram {
  margin: 20px 0;
  background: var(--dpz-lab-bg);
  color: var(--dpz-lab-text);
  border: 1px solid var(--dpz-lab-border);
  border-radius: 10px;
  padding: 16px 18px;
}

.dpz-diagram__disclaimer {
  padding: 9px 12px;
  border-radius: 6px;
  background: rgba(226, 169, 82, 0.14);
  border: 1px solid rgba(226, 169, 82, 0.45);
  color: #F4DCA8;
  font-size: 13px;
  line-height: 1.55;
  margin-bottom: 14px;
}

.dpz-diagram__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.dpz-diagram__tab {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid var(--dpz-lab-border);
  background: var(--dpz-lab-surface);
  color: var(--dpz-lab-muted);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}

.dpz-diagram__tab.is-active {
  background: var(--dpz-accent);
  border-color: var(--dpz-lab-cyan);
  color: #FFFFFF;
}

.dpz-diagram__canvas {
  overflow-x: auto;
  background: #0F171E;
  border: 1px solid var(--dpz-lab-border);
  border-radius: 8px;
  padding: 12px;
}

.dpz-diagram__svg {
  width: 100%;
  min-width: 640px;
  height: auto;
  display: block;
}
</style>
