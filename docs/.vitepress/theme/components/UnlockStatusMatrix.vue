<script setup lang="ts">
import { computed } from 'vue'
import { getBrandBySlug, type BrandClaimGroup } from '../utils/siteData'

const props = defineProps<{
  slug?: string
}>()

const brand = computed(() => (props.slug ? getBrandBySlug(props.slug) : undefined))

interface UnlockRow {
  service: string
  status: string
  basis: string
  note: string
}

const rows = computed<UnlockRow[]>(() => {
  const b = brand.value
  if (!b) return []
  const list: UnlockRow[] = []

  if (Array.isArray(b.unlockMatrix) && b.unlockMatrix.length > 0) {
    for (const u of b.unlockMatrix) {
      list.push({
        service: u.service || '流媒体/AI',
        status: u.status || '待核实',
        basis: u.testedAt ? `实测/检测 (${u.testedAt})` : '检测记录',
        note: [u.region, u.note].filter(Boolean).join(' · ') || '—',
      })
    }
  }

  const pushClaimGroup = (label: string, claim: unknown) => {
    if (!claim) return
    if (typeof claim === 'string') {
      list.push({ service: label, status: claim, basis: '品牌资料宣称', note: '非独立复测结果' })
      return
    }
    if (Array.isArray(claim)) {
      list.push({ service: label, status: claim.join(' / '), basis: '品牌资料宣称', note: '非独立复测结果' })
      return
    }
    if (typeof claim === 'object') {
      const grp = claim as BrandClaimGroup
      const basisLabel =
        grp.dataStatus === 'measured'
          ? '实测记录'
          : grp.dataStatus === 'mixed'
            ? '品牌宣称 + 实测对照'
            : '品牌资料宣称'
      if (Array.isArray(grp.supported) && grp.supported.length > 0) {
        list.push({
          service: `${label} · 宣称/记录支持`,
          status: grp.supported.join(' / '),
          basis: basisLabel,
          note: grp.notes || '以实际落地 IP 批次为准',
        })
      }
      if (Array.isArray(grp.nodeDependent) && grp.nodeDependent.length > 0) {
        list.push({
          service: `${label} · 视节点而定`,
          status: grp.nodeDependent.join(' / '),
          basis: basisLabel,
          note: '需避开受限地区或手动切换可用落地',
        })
      }
      if (Array.isArray(grp.unsupportedOrFailed) && grp.unsupportedOrFailed.length > 0) {
        list.push({
          service: `${label} · 失败/受限记录`,
          status: '存在失败或送中记录',
          basis: basisLabel,
          note: grp.unsupportedOrFailed.join('；'),
        })
      }
    }
  }

  if (list.length === 0) {
    pushClaimGroup('AI 工具', b.aiClaims)
    pushClaimGroup('流媒体', b.streamingClaims)
  }

  return list
})
</script>

<template>
  <section class="dpz-unlock-lab" aria-label="AI 与流媒体解锁矩阵">
    <div class="dpz-unlock-lab__head">
      <div>
        <div class="dpz-unlock-lab__eyebrow dpz-mono">UNLOCK MATRIX · AI 与流媒体兼容性</div>
        <h4 class="dpz-unlock-lab__title">
          {{ brand ? `${brand.name} AI 与流媒体记录` : '解锁兼容矩阵' }}
        </h4>
      </div>
      <span class="dpz-unlock-lab__tag dpz-mono">
        {{ rows.length > 0 ? '区分实测与宣称' : 'NO VERIFIED UNLOCK' }}
      </span>
    </div>

    <div v-if="rows.length > 0" class="dpz-unlock-scroll">
      <table class="dpz-unlock-table dpz-mono">
        <thead>
          <tr>
            <th>类别 / 服务</th>
            <th>状态 / 覆盖项</th>
            <th>证据口径</th>
            <th>实测局限与说明</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, idx) in rows" :key="idx">
            <td><strong>{{ r.service }}</strong></td>
            <td>{{ r.status }}</td>
            <td>{{ r.basis }}</td>
            <td>{{ r.note }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="dpz-unlock-empty">
      <div class="dpz-unlock-empty__title">暂无可复核的测速/解锁记录</div>
      <p class="dpz-unlock-empty__desc">
        当前没有该品牌的独立流媒体或 AI（ChatGPT / Claude / Gemini / Netflix / YouTube 送中）解锁实测数据。提示：香港节点普遍存在 OpenAI / Claude 地区限制，且部分节点可能触发 YouTube 送中（识别为 CN）。
      </p>
    </div>
  </section>
</template>

<style scoped>
.dpz-unlock-lab {
  background: var(--dpz-lab-bg);
  color: var(--dpz-lab-text);
  border: 1px solid var(--dpz-lab-border);
  border-radius: 10px;
  padding: 18px;
  margin: 18px 0;
}

.dpz-unlock-lab__head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--dpz-lab-border);
  margin-bottom: 12px;
}

.dpz-unlock-lab__eyebrow {
  font-size: 11px;
  color: var(--dpz-lab-cyan);
}

.dpz-unlock-lab__title {
  margin: 2px 0 0 !important;
  font-size: 15.5px !important;
  color: #FFFFFF !important;
}

.dpz-unlock-lab__tag {
  font-size: 11.5px;
  padding: 3px 8px;
  border-radius: 5px;
  background: var(--dpz-lab-surface);
  border: 1px solid var(--dpz-lab-border);
  color: var(--dpz-lab-amber);
}

.dpz-unlock-scroll {
  overflow-x: auto;
}

.dpz-unlock-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
  margin: 0 !important;
  display: table !important;
  background: transparent !important;
  border: none !important;
}

.dpz-unlock-table tr,
.dpz-unlock-table tbody tr {
  background: transparent !important;
  border-top: none !important;
}

.dpz-unlock-table tbody tr:nth-child(2n) {
  background: rgba(255, 255, 255, 0.03) !important;
}

.dpz-unlock-table th,
.dpz-unlock-table td {
  padding: 9px 10px;
  border-bottom: 1px solid var(--dpz-lab-border) !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  text-align: left;
  background: transparent !important;
  color: var(--dpz-lab-text) !important;
}

.dpz-unlock-table td strong {
  color: #FFFFFF !important;
}

.dpz-unlock-table th {
  background: var(--dpz-lab-surface) !important;
  color: var(--dpz-lab-muted) !important;
}

.dpz-unlock-empty {
  background: var(--dpz-lab-surface);
  border: 1px dashed var(--dpz-lab-border);
  border-radius: 8px;
  padding: 14px 16px;
}

.dpz-unlock-empty__title {
  font-size: 14px;
  font-weight: 700;
  color: var(--dpz-lab-amber);
  margin-bottom: 4px;
}

.dpz-unlock-empty__desc {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--dpz-lab-muted);
}
</style>
