<script setup lang="ts">
import { computed } from 'vue'
import { getBrandBySlug, type BrandPlan } from '../utils/siteData'

const props = defineProps<{
  slug?: string
  plans?: BrandPlan[]
  title?: string
}>()

const brand = computed(() => (props.slug ? getBrandBySlug(props.slug) : undefined))

const planRows = computed<BrandPlan[]>(() => {
  if (Array.isArray(props.plans) && props.plans.length > 0) return props.plans
  return brand.value?.plans || []
})

function formatPrice(plan: BrandPlan): string {
  if (plan.priceText) return String(plan.priceText)
  const rawPrice = typeof plan.priceCny === 'number' ? plan.priceCny : plan.price
  if (typeof rawPrice === 'number') {
    const cycle = plan.billingCycle ? `/${plan.billingCycle}` : ''
    return `¥${rawPrice}${cycle}`
  }
  return rawPrice ? String(rawPrice) : '待核实'
}

function computeUnitCost(plan: BrandPlan): string {
  if (plan.pricePerGb !== undefined && plan.pricePerGb !== null && String(plan.pricePerGb) !== '') {
    const val = Number(plan.pricePerGb)
    return Number.isFinite(val) ? `¥${val.toFixed(3)}/GB` : String(plan.pricePerGb)
  }
  const priceNum =
    typeof plan.priceCny === 'number'
      ? plan.priceCny
      : typeof plan.price === 'number'
        ? plan.price
        : Number(String(plan.priceText || '').match(/(\d+(?:\.\d+)?)/)?.[1])
  let gbNum = typeof plan.trafficGb === 'number' ? plan.trafficGb : NaN
  if (!Number.isFinite(gbNum) && typeof plan.traffic === 'string') {
    const m = plan.traffic.match(/(\d+(?:\.\d+)?)\s*(GB|G|TB|T)/i)
    if (m) {
      gbNum = Number(m[1]) * (m[2].toUpperCase().startsWith('T') ? 1024 : 1)
    }
  }
  if (Number.isFinite(priceNum) && Number.isFinite(gbNum) && gbNum > 0) {
    return `¥${(priceNum / gbNum).toFixed(3)}/GB`
  }
  return '口径未明'
}
</script>

<template>
  <section class="dpz-plan-table-wrap" aria-label="套餐与单位成本对比">
    <div class="dpz-plan-table-head">
      <h4 class="dpz-plan-table-title">
        {{ title || (brand ? `${brand.name} 套餐与流量口径对比` : '套餐与单位成本对比') }}
      </h4>
      <span class="dpz-plan-table-note">
        数据来源：品牌资料/公开套餐表；不同计费周期或资料冲突未擅自折算
      </span>
    </div>

    <div v-if="planRows.length > 0" class="dpz-table-scroll">
      <table class="dpz-plan-table">
        <thead>
          <tr>
            <th>套餐名称</th>
            <th>标价 / 周期</th>
            <th>标称流量</th>
            <th>参考单位成本</th>
            <th>设备数 / 速率限制</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(plan, idx) in planRows" :key="idx">
            <td><strong>{{ plan.name || `档位 ${idx + 1}` }}</strong></td>
            <td class="dpz-mono">{{ formatPrice(plan) }}</td>
            <td class="dpz-mono">
              {{
                plan.traffic
                  ? [plan.traffic, plan.trafficPeriod].filter(Boolean).join(' · ')
                  : plan.trafficGb
                    ? `${plan.trafficGb} GB`
                    : '待核实'
              }}
            </td>
            <td class="dpz-mono">{{ computeUnitCost(plan) }}</td>
            <td>{{ [plan.devices, plan.speedLimit].filter(Boolean).join(' · ') || '未标明' }}</td>
            <td>{{ plan.notes || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="dpz-plan-empty">
      暂无可核验的结构化套餐表格记录；请核对上方品牌档案或确认官网实时套餐说明。
    </div>
  </section>
</template>

<style scoped>
.dpz-plan-table-wrap {
  margin: 18px 0;
  border: 1px solid var(--dpz-border);
  border-radius: 10px;
  background: var(--dpz-surface);
  overflow: hidden;
}

.dpz-plan-table-head {
  padding: 12px 16px;
  background: var(--dpz-surface-muted);
  border-bottom: 1px solid var(--dpz-border);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.dpz-plan-table-title {
  margin: 0 !important;
  font-size: 15px !important;
  color: var(--dpz-ink);
}

.dpz-plan-table-note {
  font-size: 12px;
  color: var(--dpz-text-muted);
}

.dpz-table-scroll {
  overflow-x: auto;
}

.dpz-plan-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
  margin: 0 !important;
  border: none !important;
  display: table !important;
}

.dpz-plan-table th,
.dpz-plan-table td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--dpz-border);
  text-align: left;
  white-space: nowrap;
}

.dpz-plan-table th {
  background: var(--dpz-bg);
  font-size: 12.5px;
  color: var(--dpz-text-muted);
}

.dpz-plan-table tbody tr:last-child td {
  border-bottom: none;
}

.dpz-plan-empty {
  padding: 18px 16px;
  font-size: 13.5px;
  color: var(--dpz-text-muted);
}
</style>
