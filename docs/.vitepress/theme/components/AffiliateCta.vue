<script setup lang="ts">
import { computed, ref } from 'vue'
import { getBrandBySlug, getBrandLink } from '../utils/siteData'

const props = defineProps<{
  slug: string
  compact?: boolean
}>()

const copied = ref(false)
const brand = computed(() => getBrandBySlug(props.slug))
const linkInfo = computed(() => getBrandLink(props.slug))

const hasOfficialVerified = computed(() => {
  const url = linkInfo.value?.officialUrl || brand.value?.officialUrl || ''
  return url.startsWith('http') && !url.includes('待核实')
})

async function copyCoupon(code: string) {
  if (!code || typeof navigator === 'undefined') return
  try {
    await navigator.clipboard.writeText(code)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1800)
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <aside
    class="dpz-cta"
    :class="{ 'is-compact': compact }"
    aria-label="商业入口与优惠披露"
    data-pagefind-ignore="all"
  >
    <template v-if="linkInfo">
      <div class="dpz-cta__top">
        <div>
          <div class="dpz-cta__eyebrow dpz-mono">
            {{ linkInfo.promotionPartner ? '合作展示入口 · AFFILIATE LINK' : '收录入口 · VERIFIED REGISTRY' }}
          </div>
          <h3 class="dpz-cta__title">{{ linkInfo.name }} 注册 / 入口核验</h3>
        </div>
        <span v-if="linkInfo.promotionPartner" class="dpz-cta__partner-tag">合作展示位</span>
      </div>

      <div class="dpz-cta__grid">
        <div class="dpz-cta__info">
          <div class="dpz-cta__row">
            <span class="dpz-cta__label">独立官网核验：</span>
            <a
              v-if="hasOfficialVerified"
              :href="linkInfo.officialUrl"
              target="_blank"
              rel="nofollow noopener noreferrer"
              class="dpz-cta__official"
            >
              {{ linkInfo.officialUrl }} ↗
            </a>
            <span v-else class="dpz-cta__pending">
              {{ linkInfo.officialUrl || '待核实' }}（绝不将推广注册地址冒充为独立官网）
            </span>
          </div>

          <div v-if="linkInfo.coupon" class="dpz-cta__row">
            <span class="dpz-cta__label">收录优惠码：</span>
            <code class="dpz-cta__coupon dpz-mono">{{ linkInfo.coupon }}</code>
            <button
              type="button"
              class="dpz-cta__copy"
              @click="copyCoupon(linkInfo.coupon!)"
            >
              {{ copied ? '已复制 ✓' : '复制优惠码' }}
            </button>
          </div>

          <div v-if="linkInfo.couponNotes" class="dpz-cta__coupon-note">
            优惠码口径说明：{{ linkInfo.couponNotes }}
          </div>

          <div v-if="linkInfo.isUrlAnomaly" class="dpz-cta__flag">
            链接格式异常记录：{{ linkInfo.affiliateUrlFlag }}
          </div>
        </div>

        <div class="dpz-cta__action">
          <a
            v-if="linkInfo.url"
            :href="linkInfo.url"
            :target="linkInfo.target || '_blank'"
            :rel="linkInfo.rel || 'nofollow sponsored noopener noreferrer'"
            class="dpz-cta__btn"
          >
            前往 {{ linkInfo.name }} 注册页 ↗
          </a>
          <span v-else class="dpz-cta__disabled">当前暂无可用推广入口</span>
        </div>
      </div>

      <p class="dpz-cta__disclosure">
        {{ linkInfo.disclosure }}
        <a href="/disclosure">查看推广披露政策 →</a>
      </p>
    </template>

    <div v-else class="dpz-cta__missing">
      暂未在 <code>data/links.ts</code> 找到品牌 <code>{{ slug }}</code> 的入口记录（待数据同步后自动展示）。
    </div>
  </aside>
</template>

<style scoped>
.dpz-cta {
  background: var(--dpz-surface);
  border: 1px solid var(--dpz-border-strong);
  border-left: 4px solid var(--dpz-accent);
  border-radius: 10px;
  padding: 18px 20px;
  margin: 22px 0;
}

.dpz-cta__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;
}

.dpz-cta__eyebrow {
  font-size: 11px;
  font-weight: 700;
  color: var(--dpz-accent);
  letter-spacing: 0.04em;
}

.dpz-cta__title {
  margin: 2px 0 0 !important;
  font-size: 1.05rem !important;
  color: var(--dpz-ink);
}

.dpz-cta__partner-tag {
  font-size: 11.5px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--dpz-accent-soft);
  color: var(--dpz-accent);
  white-space: nowrap;
}

.dpz-cta__grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 8px;
  background: var(--dpz-bg);
  border: 1px solid var(--dpz-border);
}

.dpz-cta__info {
  flex: 1 1 320px;
  font-size: 13.5px;
  line-height: 1.65;
}

.dpz-cta__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.dpz-cta__label {
  color: var(--dpz-text-muted);
  font-weight: 600;
}

.dpz-cta__pending {
  color: var(--dpz-amber);
}

.dpz-cta__coupon {
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--dpz-surface);
  border: 1px dashed var(--dpz-accent);
  color: var(--dpz-ink);
  font-weight: 700;
}

.dpz-cta__copy {
  padding: 3px 9px;
  border-radius: 5px;
  border: 1px solid var(--dpz-border-strong);
  background: var(--dpz-surface);
  color: var(--dpz-ink);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.dpz-cta__copy:hover {
  border-color: var(--dpz-accent);
  color: var(--dpz-accent);
}

.dpz-cta__coupon-note,
.dpz-cta__flag {
  font-size: 12.5px;
  color: var(--dpz-amber);
  margin-top: 4px;
}

.dpz-cta__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 18px;
  border-radius: 8px;
  background: var(--dpz-accent);
  color: #FFFFFF !important;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none !important;
  white-space: nowrap;
}

.dpz-cta__btn:hover {
  background: var(--dpz-accent-hover);
}

.dpz-cta__disabled {
  display: inline-block;
  padding: 8px 14px;
  border-radius: 7px;
  background: var(--dpz-surface-muted);
  color: var(--dpz-text-muted);
  font-size: 13px;
}

.dpz-cta__disclosure {
  margin: 10px 0 0;
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--dpz-text-muted);
}

.dpz-cta__missing {
  font-size: 13.5px;
  color: var(--dpz-text-muted);
}
</style>
