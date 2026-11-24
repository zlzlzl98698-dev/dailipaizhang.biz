<script setup lang="ts">
import { computed } from 'vue'
import { getBrandBySlug } from '../utils/siteData'
import SourceBadge from './SourceBadge.vue'

const props = defineProps<{
  slug: string
}>()

const brand = computed(() => getBrandBySlug(props.slug))

const lineText = computed(() => {
  const b = brand.value
  if (!b) return '待核实'
  if (Array.isArray(b.lineClaims)) return b.lineClaims.join(' / ') || '未明确'
  return b.lineClaims || '未明确'
})

const thirdPartyText = computed(() => {
  const b = brand.value
  if (!b) return '待核实'
  if (b.thirdPartyClients === true) return '支持主流第三方客户端订阅'
  if (b.thirdPartyClients === false) return '仅限品牌专属客户端（无通用订阅）'
  if (Array.isArray(b.thirdPartyClients)) return b.thirdPartyClients.join('、') || '待核实'
  return String(b.thirdPartyClients || '待核实')
})
</script>

<template>
  <section v-if="brand" class="dpz-evidence-panel" aria-label="品牌核验档案面板">
    <div class="dpz-evidence-panel__lab-head">
      <div class="dpz-evidence-panel__id">
        <img
          v-if="brand.logo"
          :src="brand.logo"
          :alt="`${brand.name} 品牌图标`"
          class="dpz-evidence-panel__logo no-lightbox"
        />
        <div>
          <div class="dpz-evidence-panel__eyebrow dpz-mono">EVIDENCE DOSSIER · {{ brand.slug }}</div>
          <h3 class="dpz-evidence-panel__title">{{ brand.name }} 核验基础档案</h3>
        </div>
      </div>

      <div class="dpz-evidence-panel__badges">
        <SourceBadge :status="brand.evidenceStatus" :date="brand.verifiedAt" />
        <span v-if="brand.promotionPartner" class="dpz-evidence-panel__partner">合作展示位</span>
      </div>
    </div>

    <div class="dpz-evidence-panel__grid">
      <div class="dpz-kv">
        <span class="dpz-kv__k">运营状态 / 年份</span>
        <span class="dpz-kv__v">
          {{ brand.operatingStatus || '待核实' }}
          <template v-if="brand.openingYear">（资料记录：{{ brand.openingYear }}）</template>
        </span>
      </div>
      <div class="dpz-kv">
        <span class="dpz-kv__k">支持协议</span>
        <span class="dpz-kv__v dpz-mono">
          {{ brand.protocols?.length ? brand.protocols.join(' / ') : '未明确' }}
        </span>
      </div>
      <div class="dpz-kv">
        <span class="dpz-kv__k">宣称线路类型</span>
        <span class="dpz-kv__v">{{ lineText }}</span>
      </div>
      <div class="dpz-kv">
        <span class="dpz-kv__k">第三方订阅兼容性</span>
        <span class="dpz-kv__v">{{ thirdPartyText }}</span>
      </div>
      <div class="dpz-kv">
        <span class="dpz-kv__k">节点与地区宣称</span>
        <span class="dpz-kv__v">
          {{ brand.nodesClaimed ? `${brand.nodesClaimed}` : '未标明数量' }}
          <template v-if="brand.regions?.length">（{{ brand.regions.join('、') }}）</template>
        </span>
      </div>
      <div class="dpz-kv">
        <span class="dpz-kv__k">支付与退款边界</span>
        <span class="dpz-kv__v">
          {{ brand.paymentMethods?.join(' / ') || '待核实' }}
          <template v-if="brand.privacyAndRefundNotes"> · {{ brand.privacyAndRefundNotes }}</template>
        </span>
      </div>
    </div>

    <div v-if="brand.conflicts?.length" class="dpz-evidence-panel__conflicts">
      <div class="dpz-evidence-panel__conflicts-title">
        已识别的资料冲突与异常记录（保留原貌，未擅自折算）：
      </div>
      <ul>
        <li v-for="(c, idx) in brand.conflicts" :key="idx">{{ c }}</li>
      </ul>
    </div>

    <div v-if="brand.sourceRefs?.length" class="dpz-evidence-panel__refs">
      <span>资料来源：</span>
      <span v-for="(refItem, idx) in brand.sourceRefs" :key="idx" class="dpz-ref-chip">
        {{
          typeof refItem === 'string'
            ? refItem
            : [refItem.label || refItem.source, refItem.date, refItem.note].filter(Boolean).join(' · ')
        }}
      </span>
    </div>
  </section>

  <div v-else class="dpz-evidence-missing">
    暂无品牌 <code>{{ slug }}</code> 的档案数据（等待 <code>data/brands.json</code> 同步）。
  </div>
</template>

<style scoped>
.dpz-evidence-panel {
  border: 1px solid var(--dpz-border-strong);
  border-radius: 10px;
  overflow: hidden;
  background: var(--dpz-surface);
  margin: 18px 0;
}

.dpz-evidence-panel__lab-head {
  background: var(--dpz-lab-bg);
  color: var(--dpz-lab-text);
  padding: 16px 18px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.dpz-evidence-panel__id {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dpz-evidence-panel__logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #FFFFFF;
  object-fit: contain;
  padding: 2px;
}

.dpz-evidence-panel__eyebrow {
  font-size: 11px;
  color: var(--dpz-lab-cyan);
  letter-spacing: 0.05em;
}

.dpz-evidence-panel__title {
  margin: 2px 0 0 !important;
  font-size: 1.1rem !important;
  color: #FFFFFF !important;
}

.dpz-evidence-panel__badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.dpz-evidence-panel__partner {
  font-size: 11.5px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 5px;
  background: rgba(103, 183, 201, 0.16);
  color: var(--dpz-lab-cyan);
  border: 1px solid rgba(103, 183, 201, 0.35);
}

.dpz-evidence-panel__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  background: var(--dpz-border);
}

@media (max-width: 639px) {
  .dpz-evidence-panel__grid {
    grid-template-columns: 1fr;
  }
}

.dpz-kv {
  background: var(--dpz-surface);
  padding: 11px 16px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.dpz-kv__k {
  font-size: 12px;
  color: var(--dpz-text-muted);
}

.dpz-kv__v {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--dpz-ink);
}

.dpz-evidence-panel__conflicts {
  background: var(--dpz-amber-soft);
  border-top: 1px solid #E5CFA8;
  padding: 12px 18px;
  font-size: 13.5px;
}

.dpz-evidence-panel__conflicts-title {
  font-weight: 700;
  color: var(--dpz-amber);
  margin-bottom: 4px;
}

.dpz-evidence-panel__conflicts ul {
  margin: 0;
  padding-left: 18px;
}

.dpz-evidence-panel__refs {
  border-top: 1px solid var(--dpz-border);
  background: var(--dpz-bg);
  padding: 10px 18px;
  font-size: 12.5px;
  color: var(--dpz-text-muted);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.dpz-ref-chip {
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--dpz-surface);
  border: 1px solid var(--dpz-border);
  color: var(--dpz-text);
}

.dpz-evidence-missing {
  padding: 16px;
  border-radius: 8px;
  border: 1px dashed var(--dpz-border-strong);
  color: var(--dpz-text-muted);
  font-size: 13.5px;
}
</style>
