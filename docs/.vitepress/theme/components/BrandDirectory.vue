<script setup lang="ts">
import { computed, ref } from 'vue'
import { formatEvidenceLabel, getAllBrands, type BrandRecord } from '../utils/siteData'

const props = withDefaults(
  defineProps<{
    limit?: number
    compact?: boolean
  }>(),
  {
    limit: 0,
    compact: false,
  }
)

const searchQuery = ref('')
const priceFilter = ref('all')
const lineFilter = ref('all')
const clientFilter = ref('all')
const evidenceFilter = ref('all')
const sortBy = ref('priority')

const brands = computed(() => getAllBrands())

function extractMinPrice(brand: BrandRecord): number | null {
  if (!Array.isArray(brand.plans) || brand.plans.length === 0) return null
  const prices: number[] = []
  for (const plan of brand.plans) {
    if (typeof plan.priceCny === 'number' && !Number.isNaN(plan.priceCny) && plan.priceCny > 0) {
      prices.push(plan.priceCny)
    } else if (typeof plan.price === 'number' && !Number.isNaN(plan.price) && plan.price > 0) {
      prices.push(plan.price)
    } else if (typeof plan.priceText === 'string') {
      const m = plan.priceText.match(/(\d+(?:\.\d+)?)\s*元/)
      if (m) prices.push(Number(m[1]))
    }
  }
  if (prices.length === 0) return null
  return Math.min(...prices)
}

function getLineLabel(brand: BrandRecord): string {
  if (Array.isArray(brand.lineClaims)) return brand.lineClaims.join(' / ') || '未明确'
  if (typeof brand.lineClaims === 'string' && brand.lineClaims.trim()) return brand.lineClaims
  return '未明确'
}

function supportsThirdParty(brand: BrandRecord): 'third-party' | 'native-only' | 'unknown' {
  if (brand.thirdPartyClients === true || (Array.isArray(brand.thirdPartyClients) && brand.thirdPartyClients.length > 0)) {
    return 'third-party'
  }
  if (brand.thirdPartyClients === false) {
    return 'native-only'
  }
  const notes = `${brand.protocolNotes || ''} ${(brand.cons || []).join(' ')}`.toLowerCase()
  if (notes.includes('无订阅') || notes.includes('专属客户端') || notes.includes('不支持第三方')) {
    return 'native-only'
  }
  return 'unknown'
}

function evidenceScore(status?: string): number {
  const tone = formatEvidenceLabel(status).tone
  if (tone === 'measured') return 4
  if (tone === 'third_party') return 3
  if (tone === 'vendor') return 2
  if (tone === 'historical') return 1
  return 0
}

const filteredBrands = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()

  const list = brands.value.filter((b) => {
    if (q) {
      const hay = [
        b.name,
        b.slug,
        ...(b.aliases || []),
        ...(b.protocols || []),
        getLineLabel(b),
        ...(b.regions || []),
      ]
        .join(' ')
        .toLowerCase()
      if (!hay.includes(q)) return false
    }

    if (priceFilter.value !== 'all') {
      const p = extractMinPrice(b)
      if (priceFilter.value === 'unknown' && p !== null) return false
      if (priceFilter.value === 'under10' && (p === null || p >= 10)) return false
      if (priceFilter.value === '10to20' && (p === null || p < 10 || p > 20)) return false
      if (priceFilter.value === 'over20' && (p === null || p <= 20)) return false
    }

    if (lineFilter.value !== 'all') {
      const line = getLineLabel(b).toLowerCase()
      if (lineFilter.value === 'iepl' && !line.includes('iepl') && !line.includes('iplc') && !line.includes('专线')) {
        return false
      }
      if (lineFilter.value === 'bgp' && !line.includes('bgp') && !line.includes('中转')) {
        return false
      }
      if (lineFilter.value === 'unknown' && line !== '未明确') {
        return false
      }
    }

    if (clientFilter.value !== 'all') {
      const mode = supportsThirdParty(b)
      if (clientFilter.value === 'third-party' && mode !== 'third-party') return false
      if (clientFilter.value === 'native-only' && mode !== 'native-only') return false
    }

    if (evidenceFilter.value !== 'all') {
      const tone = formatEvidenceLabel(b.evidenceStatus).tone
      if (tone !== evidenceFilter.value) return false
    }

    return true
  })

  const sorted = [...list].sort((a, b) => {
    if (sortBy.value === 'price-asc') {
      const pa = extractMinPrice(a) ?? 99999
      const pb = extractMinPrice(b) ?? 99999
      return pa - pb
    }
    if (sortBy.value === 'evidence-desc') {
      return evidenceScore(b.evidenceStatus) - evidenceScore(a.evidenceStatus)
    }
    // Default: editorial priority (promotion partner disclosed separately, NOT speed rank)
    const da = typeof a.displayPriority === 'number' ? a.displayPriority : 999
    const db = typeof b.displayPriority === 'number' ? b.displayPriority : 999
    if (da !== db) return da - db
    return evidenceScore(b.evidenceStatus) - evidenceScore(a.evidenceStatus)
  })

  return props.limit > 0 ? sorted.slice(0, props.limit) : sorted
})

function resetFilters() {
  searchQuery.value = ''
  priceFilter.value = 'all'
  lineFilter.value = 'all'
  clientFilter.value = 'all'
  evidenceFilter.value = 'all'
  sortBy.value = 'priority'
}
</script>

<template>
  <section class="dpz-brands" aria-label="机场品牌核验数据库" data-pagefind-ignore="all">
    <div class="dpz-brands__banner">
      <strong>排序与标注说明：</strong>
      本站不发布主观“速度前十榜”。标有“合作展示位”的品牌仅代表商业披露优先级，不代表客观测速第一；实际性能请查看各品牌详情页的“可复核实测记录”与证据等级。
    </div>

    <div v-if="!compact" class="dpz-brands__controls">
      <input
        v-model="searchQuery"
        type="search"
        class="dpz-brands__search"
        placeholder="搜索品牌名、别名、协议（VLESS/SS/Trojan）或地区..."
        aria-label="筛选品牌"
      />

      <select v-model="priceFilter" class="dpz-brands__select" aria-label="按价格区间筛选">
        <option value="all">全部起售价</option>
        <option value="under10">10 元以下/档</option>
        <option value="10to20">10–20 元</option>
        <option value="over20">20 元以上</option>
        <option value="unknown">价格待核实</option>
      </select>

      <select v-model="lineFilter" class="dpz-brands__select" aria-label="按宣称线路筛选">
        <option value="all">全部线路类型</option>
        <option value="iepl">IEPL / IPLC 专线</option>
        <option value="bgp">BGP / 公网中转</option>
        <option value="unknown">线路未明确</option>
      </select>

      <select v-model="clientFilter" class="dpz-brands__select" aria-label="按客户端兼容筛选">
        <option value="all">全部客户端方式</option>
        <option value="third-party">支持第三方通用订阅</option>
        <option value="native-only">仅限专属客户端（无订阅）</option>
      </select>

      <select v-model="evidenceFilter" class="dpz-brands__select" aria-label="按证据等级筛选">
        <option value="all">全部证据等级</option>
        <option value="measured">有本地实测记录</option>
        <option value="third_party">第三方检测引用</option>
        <option value="vendor">仅品牌资料宣称</option>
        <option value="historical">历史归档记录</option>
        <option value="unknown">证据待核实</option>
      </select>

      <select v-model="sortBy" class="dpz-brands__select" aria-label="排序方式">
        <option value="priority">按核验与展示顺序</option>
        <option value="evidence-desc">按证据完整度从高到低</option>
        <option value="price-asc">按起售价从低到高</option>
      </select>
    </div>

    <div class="dpz-brands__summary">
      <span v-if="brands.length > 0">
        当前显示 <strong>{{ filteredBrands.length }}</strong> / {{ brands.length }} 个已去重品牌档案
      </span>
      <span v-else>正在等待品牌数据文件 `data/brands.json` 就绪...</span>
      <button v-if="!compact" type="button" class="dpz-brands__reset" @click="resetFilters">
        重置筛选
      </button>
    </div>

    <div v-if="brands.length === 0" class="dpz-brands__empty">
      品牌数据正在由数据审计模块生成，请稍后刷新构建以查看全量 31 家品牌矩阵。
    </div>

    <div v-else-if="filteredBrands.length === 0" class="dpz-brands__empty">
      <p>没有符合当前组合筛选条件的品牌。</p>
      <button type="button" class="dpz-brands__reset-btn" @click="resetFilters">
        重置全部筛选条件
      </button>
    </div>

    <div v-else class="dpz-brands__grid">
      <article v-for="b in filteredBrands" :key="b.slug" class="dpz-brand-card">
        <div class="dpz-brand-card__head">
          <div class="dpz-brand-card__identity">
            <img
              v-if="b.logo"
              :src="b.logo"
              :alt="`${b.name} Logo`"
              class="dpz-brand-card__logo no-lightbox"
              loading="lazy"
            />
            <div>
              <h3 class="dpz-brand-card__name">
                <a :href="`/brands/${b.slug}/`">{{ b.name }}</a>
              </h3>
              <div v-if="b.aliases?.length" class="dpz-brand-card__alias">
                别名：{{ b.aliases.join(' / ') }}
              </div>
            </div>
          </div>

          <div class="dpz-brand-card__badges">
            <span v-if="b.promotionPartner" class="dpz-badge is-partner">合作展示位</span>
            <span class="dpz-badge" :class="`is-${formatEvidenceLabel(b.evidenceStatus).tone}`">
              {{ formatEvidenceLabel(b.evidenceStatus).label }}
            </span>
          </div>
        </div>

        <dl class="dpz-brand-card__facts">
          <div>
            <dt>起步参考价</dt>
            <dd class="dpz-mono">
              {{ extractMinPrice(b) !== null ? `¥${extractMinPrice(b)} 起` : '待核实' }}
            </dd>
          </div>
          <div>
            <dt>客户端兼容</dt>
            <dd>
              {{
                supportsThirdParty(b) === 'third-party'
                  ? '支持第三方通用订阅'
                  : supportsThirdParty(b) === 'native-only'
                    ? '仅专属客户端（无订阅）'
                    : '待核实'
              }}
            </dd>
          </div>
          <div>
            <dt>宣称线路</dt>
            <dd>{{ getLineLabel(b) }}</dd>
          </div>
          <div>
            <dt>协议支持</dt>
            <dd class="dpz-mono">{{ b.protocols?.length ? b.protocols.join(' / ') : '未明' }}</dd>
          </div>
        </dl>

        <div v-if="b.conflicts?.length" class="dpz-brand-card__conflict">
          含 {{ b.conflicts.length }} 项资料冲突/异常（如套餐口径或优惠码不一致），详情页已逐项标注
        </div>

        <div class="dpz-brand-card__foot">
          <span class="dpz-brand-card__status">
            状态：{{ b.operatingStatus || '待核实' }}
          </span>
          <a :href="`/brands/${b.slug}/`" class="dpz-brand-card__link">查看证据档案 →</a>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.dpz-brands {
  margin: 20px 0;
}

.dpz-brands__banner {
  background: var(--dpz-surface-muted);
  border-left: 3px solid var(--dpz-accent);
  border-radius: 6px;
  padding: 12px 14px;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--dpz-text);
  margin-bottom: 16px;
}

.dpz-brands__controls {
  display: grid;
  grid-template-columns: 2fr repeat(5, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}

@media (max-width: 1079px) {
  .dpz-brands__controls {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .dpz-brands__search {
    grid-column: 1 / -1;
  }
}

@media (max-width: 599px) {
  .dpz-brands__controls {
    grid-template-columns: 1fr;
  }
}

.dpz-brands__search,
.dpz-brands__select {
  height: 38px;
  border: 1px solid var(--dpz-border-strong);
  border-radius: 7px;
  background: var(--dpz-surface);
  color: var(--dpz-ink);
  font-size: 13.5px;
  padding: 0 10px;
}

.dpz-brands__summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: var(--dpz-text-muted);
  margin-bottom: 14px;
}

.dpz-brands__reset {
  border: none;
  background: transparent;
  color: var(--dpz-accent);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}

.dpz-brands__empty {
  background: var(--dpz-surface);
  border: 1px solid var(--dpz-border);
  border-radius: 10px;
  padding: 28px 20px;
  text-align: center;
  color: var(--dpz-text-muted);
}

.dpz-brands__reset-btn {
  margin-top: 10px;
  padding: 7px 14px;
  border-radius: 6px;
  border: none;
  background: var(--dpz-accent);
  color: #FFFFFF;
  font-size: 13.5px;
  cursor: pointer;
}

.dpz-brands__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

@media (max-width: 767px) {
  .dpz-brands__grid {
    grid-template-columns: 1fr;
  }
}

.dpz-brand-card {
  display: flex;
  flex-direction: column;
  background: var(--dpz-surface);
  border: 1px solid var(--dpz-border);
  border-radius: 10px;
  padding: 16px;
}

.dpz-brand-card__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;
}

.dpz-brand-card__identity {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dpz-brand-card__logo {
  width: 36px;
  height: 36px;
  border-radius: 7px;
  object-fit: contain;
  border: 1px solid var(--dpz-border);
  background: var(--dpz-bg);
}

.dpz-brand-card__name {
  margin: 0 !important;
  font-size: 16px !important;
}

.dpz-brand-card__name a {
  color: var(--dpz-ink);
  text-decoration: none;
}

.dpz-brand-card__name a:hover {
  color: var(--dpz-accent);
  text-decoration: underline;
}

.dpz-brand-card__alias {
  font-size: 12px;
  color: var(--dpz-text-muted);
}

.dpz-brand-card__badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 5px;
}

.dpz-badge {
  font-size: 11.5px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 4px;
  white-space: nowrap;
}

.dpz-badge.is-partner {
  background: var(--dpz-accent-soft);
  color: var(--dpz-accent);
  border: 1px solid #BDD4DC;
}

.dpz-badge.is-measured {
  background: var(--dpz-green-soft);
  color: var(--dpz-green);
}

.dpz-badge.is-third_party {
  background: var(--dpz-accent-soft);
  color: var(--dpz-accent);
}

.dpz-badge.is-vendor {
  background: var(--dpz-surface-muted);
  color: var(--dpz-text);
}

.dpz-badge.is-historical {
  background: var(--dpz-amber-soft);
  color: var(--dpz-amber);
}

.dpz-badge.is-unknown {
  background: var(--dpz-red-soft);
  color: var(--dpz-red);
}

.dpz-brand-card__facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 12px;
  margin: 0 0 12px;
  padding: 10px 12px;
  background: var(--dpz-bg);
  border-radius: 7px;
}

.dpz-brand-card__facts dt {
  font-size: 11.5px;
  color: var(--dpz-text-muted);
}

.dpz-brand-card__facts dd {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--dpz-ink);
}

.dpz-brand-card__conflict {
  font-size: 12.5px;
  color: var(--dpz-amber);
  background: var(--dpz-amber-soft);
  padding: 6px 10px;
  border-radius: 6px;
  margin-bottom: 12px;
}

.dpz-brand-card__foot {
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid var(--dpz-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.dpz-brand-card__status {
  color: var(--dpz-text-muted);
}

.dpz-brand-card__link {
  font-weight: 600;
  color: var(--dpz-accent);
  text-decoration: none;
}

.dpz-brand-card__link:hover {
  text-decoration: underline;
}
</style>
