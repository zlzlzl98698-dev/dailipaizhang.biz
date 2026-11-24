<script setup lang="ts">
import { computed } from 'vue'
import { formatEvidenceLabel } from '../utils/siteData'

const props = withDefaults(
  defineProps<{
    status?: string
    label?: string
    date?: string
  }>(),
  {
    status: 'unknown',
    label: '',
    date: '',
  }
)

const info = computed(() => formatEvidenceLabel(props.status))
</script>

<template>
  <span class="dpz-source-badge" :class="`is-${info.tone}`">
    <span class="dpz-source-badge__dot" aria-hidden="true" />
    <span>{{ label || info.label }}</span>
    <span v-if="date" class="dpz-source-badge__date dpz-mono">· {{ date }}</span>
  </span>
</template>

<style scoped>
.dpz-source-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 5px;
  border: 1px solid transparent;
  vertical-align: middle;
}

.dpz-source-badge__dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: currentColor;
}

.dpz-source-badge.is-measured {
  background: var(--dpz-green-soft);
  color: var(--dpz-green);
  border-color: #B7D8CE;
}

.dpz-source-badge.is-third_party {
  background: var(--dpz-accent-soft);
  color: var(--dpz-accent);
  border-color: #BDD4DC;
}

.dpz-source-badge.is-vendor {
  background: var(--dpz-surface-muted);
  color: var(--dpz-text);
  border-color: var(--dpz-border-strong);
}

.dpz-source-badge.is-historical {
  background: var(--dpz-amber-soft);
  color: var(--dpz-amber);
  border-color: #E2C699;
}

.dpz-source-badge.is-example {
  background: #ECEEF2;
  color: #3B4958;
  border-color: #C5CDD6;
}

.dpz-source-badge.is-unknown {
  background: var(--dpz-red-soft);
  color: var(--dpz-red);
  border-color: #E3BEB8;
}

.dpz-source-badge__date {
  opacity: 0.85;
  font-weight: 500;
}
</style>
