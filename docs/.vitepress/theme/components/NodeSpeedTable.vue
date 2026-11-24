<script setup lang="ts">
import { computed } from 'vue'
import { getBrandBySlug, type BrandSpeedTest } from '../utils/siteData'

const props = defineProps<{
  slug?: string
  tests?: BrandSpeedTest[]
}>()

const brand = computed(() => (props.slug ? getBrandBySlug(props.slug) : undefined))

const testRows = computed<BrandSpeedTest[]>(() => {
  if (Array.isArray(props.tests) && props.tests.length > 0) return props.tests
  return brand.value?.tests || []
})

function resolveImage(t: BrandSpeedTest): string {
  return (t.imagePath || t.image || '') as string
}

const imageEvidence = computed(() =>
  testRows.value.filter((t) => resolveImage(t).trim().length > 0)
)

function openImageLightbox(t: BrandSpeedTest) {
  const src = resolveImage(t)
  if (!src || typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent('dpz:lightbox', {
      detail: {
        src,
        alt: `${brand.value?.name || ''} 测速实测截图 (${t.batchDate || t.date || '日期见图'})`,
        caption: [t.batchDate || t.date, t.environment || t.tool, t.limitations || t.notes]
          .filter(Boolean)
          .join(' · '),
      },
    })
  )
}
</script>

<template>
  <section class="dpz-lab-panel" aria-label="实验室测速证据面板">
    <div class="dpz-lab-panel__head">
      <div>
        <div class="dpz-lab-panel__eyebrow dpz-mono">LAB TELEMETRY · 可复核测速记录</div>
        <h4 class="dpz-lab-panel__title">
          {{ brand ? `${brand.name} 测速与延迟记录` : '节点测速记录' }}
        </h4>
      </div>
      <span class="dpz-lab-panel__badge dpz-mono">
        {{ testRows.length > 0 ? `共 ${testRows.length} 批次记录` : 'NO VERIFIED TELEMETRY' }}
      </span>
    </div>

    <template v-if="testRows.length > 0">
      <div class="dpz-lab-cards">
        <article v-for="(t, idx) in testRows" :key="idx" class="dpz-lab-record">
          <div class="dpz-lab-record__top dpz-mono">
            <span class="dpz-lab-record__date">
              {{ [t.batchDate || t.date || '日期未注', t.batchTime].filter(Boolean).join(' ') }}
            </span>
            <span class="dpz-lab-record__proto">
              协议：{{ t.protocolDisplayed || '未标注' }}
            </span>
            <span
              class="dpz-lab-record__status"
              :class="t.dataStatus === 'measured' ? 'is-measured' : 'is-vendor'"
            >
              {{ t.dataStatus === 'measured' ? '实测截图批次' : t.dataStatus === 'vendor' ? '表格/资料记录' : (t.dataStatus || '记录') }}
            </span>
          </div>

          <div v-if="t.environment || t.tool || t.isp" class="dpz-lab-record__env">
            测试环境：{{ t.environment || [t.tool, t.isp].filter(Boolean).join(' · ') }}
          </div>

          <p class="dpz-lab-record__summary dpz-mono">
            {{
              t.summary ||
              [t.node, t.avgSpeed && `均速 ${t.avgSpeed}`, t.maxSpeed && `峰值 ${t.maxSpeed}`, t.latencyMs && `延迟 ${t.latencyMs}`, t.status]
                .filter(Boolean)
                .join(' · ') ||
              '详见关联原图'
            }}
          </p>

          <div v-if="t.limitations || t.notes" class="dpz-lab-record__limit">
            局限与口径说明：{{ t.limitations || t.notes }}
          </div>
        </article>
      </div>

      <div v-if="imageEvidence.length > 0" class="dpz-lab-gallery">
        <div class="dpz-lab-gallery__label">关联本地测速截图（点击可放大查看原图与测试批注）：</div>
        <div class="dpz-lab-gallery__grid">
          <button
            v-for="(imgItem, idx) in imageEvidence"
            :key="idx"
            type="button"
            class="dpz-lab-thumb"
            @click="openImageLightbox(imgItem)"
          >
            <img
              :src="resolveImage(imgItem)"
              :alt="`${brand?.name || ''} 测速截图 ${imgItem.batchDate || imgItem.date || ''}`"
              class="no-lightbox"
              loading="lazy"
            />
            <span class="dpz-lab-thumb__cap dpz-mono">
              {{ [imgItem.batchDate || imgItem.date, imgItem.protocolDisplayed].filter(Boolean).join(' · ') || '查看实测截图' }}
            </span>
          </button>
        </div>
      </div>
    </template>

    <div v-else class="dpz-lab-empty">
      <div class="dpz-lab-empty__title">暂无可复核的测速/解锁记录</div>
      <p class="dpz-lab-empty__desc">
        本站不编造未测品牌的延迟或吞吐量数字。如你已持有该品牌测试套餐，可通过以下可重复步骤自行核验：
      </p>
      <ul class="dpz-lab-empty__steps dpz-mono">
        <li>1. 优先选择最低月付周期验证，避免直接购买年付锁定套餐。</li>
        <li>2. 分别在白天非高峰与 20:30–23:00 晚高峰运行单节点 HTTPS 下载或 Miaoko/Speedtest 检查丢包与 0B 超时率。</li>
        <li>3. 记录测试当地运营商（电信/联通/移动）、测试时间与节点倍率（1x/2x）。</li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.dpz-lab-panel {
  background: var(--dpz-lab-bg);
  color: var(--dpz-lab-text);
  border: 1px solid var(--dpz-lab-border);
  border-radius: 10px;
  padding: 18px;
  margin: 18px 0;
}

.dpz-lab-panel__head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--dpz-lab-border);
  margin-bottom: 14px;
}

.dpz-lab-panel__eyebrow {
  font-size: 11px;
  color: var(--dpz-lab-cyan);
  letter-spacing: 0.05em;
}

.dpz-lab-panel__title {
  margin: 2px 0 0 !important;
  font-size: 15.5px !important;
  color: #FFFFFF !important;
}

.dpz-lab-panel__badge {
  font-size: 11.5px;
  padding: 3px 9px;
  border-radius: 5px;
  background: var(--dpz-lab-surface);
  border: 1px solid var(--dpz-lab-border);
  color: var(--dpz-lab-green);
}

.dpz-lab-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dpz-lab-record {
  background: var(--dpz-lab-surface);
  border: 1px solid var(--dpz-lab-border);
  border-radius: 8px;
  padding: 12px 14px;
}

.dpz-lab-record__top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 12px;
}

.dpz-lab-record__date {
  color: var(--dpz-lab-cyan);
  font-weight: 700;
}

.dpz-lab-record__proto {
  color: var(--dpz-lab-text);
  background: #0F171E;
  padding: 2px 7px;
  border-radius: 4px;
}

.dpz-lab-record__status {
  margin-left: auto;
  padding: 2px 7px;
  border-radius: 4px;
  font-size: 11.5px;
}

.dpz-lab-record__status.is-measured {
  background: rgba(94, 194, 166, 0.16);
  color: var(--dpz-lab-green);
}

.dpz-lab-record__status.is-vendor {
  background: rgba(226, 169, 82, 0.16);
  color: var(--dpz-lab-amber);
}

.dpz-lab-record__env {
  font-size: 12.5px;
  color: var(--dpz-lab-muted);
  margin-bottom: 6px;
}

.dpz-lab-record__summary {
  margin: 0 0 6px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--dpz-lab-text);
}

.dpz-lab-record__limit {
  font-size: 12px;
  color: var(--dpz-lab-amber);
  line-height: 1.5;
}

.dpz-lab-gallery {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--dpz-lab-border);
}

.dpz-lab-gallery__label {
  font-size: 12.5px;
  color: var(--dpz-lab-muted);
  margin-bottom: 10px;
}

.dpz-lab-gallery__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 10px;
}

.dpz-lab-thumb {
  display: flex;
  flex-direction: column;
  padding: 6px;
  border-radius: 7px;
  background: var(--dpz-lab-surface);
  border: 1px solid var(--dpz-lab-border);
  cursor: zoom-in;
  text-align: left;
}

.dpz-lab-thumb:hover {
  border-color: var(--dpz-lab-cyan);
}

.dpz-lab-thumb img {
  width: 100%;
  height: 105px;
  object-fit: cover;
  border-radius: 4px;
  border: none;
}

.dpz-lab-thumb__cap {
  margin-top: 6px;
  font-size: 11px;
  color: var(--dpz-lab-muted);
}

.dpz-lab-empty {
  background: var(--dpz-lab-surface);
  border: 1px dashed var(--dpz-lab-border);
  border-radius: 8px;
  padding: 16px;
}

.dpz-lab-empty__title {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--dpz-lab-amber);
  margin-bottom: 6px;
}

.dpz-lab-empty__desc {
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--dpz-lab-muted);
}

.dpz-lab-empty__steps {
  margin: 0;
  padding-left: 18px;
  font-size: 12.5px;
  line-height: 1.65;
  color: var(--dpz-lab-text);
}
</style>
