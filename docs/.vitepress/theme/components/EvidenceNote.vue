<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    tone?: 'info' | 'warning' | 'danger'
    source?: string
    updatedAt?: string
  }>(),
  {
    title: '证据与核验说明',
    tone: 'info',
    source: '',
    updatedAt: '',
  }
)
</script>

<template>
  <aside class="dpz-evidence-note" :class="`is-${tone}`">
    <div class="dpz-evidence-note__head">
      <strong>{{ title }}</strong>
      <span v-if="source || updatedAt" class="dpz-evidence-note__meta dpz-mono">
        {{ [source, updatedAt].filter(Boolean).join(' · ') }}
      </span>
    </div>
    <div class="dpz-evidence-note__body">
      <slot />
    </div>
  </aside>
</template>

<style scoped>
.dpz-evidence-note {
  margin: 18px 0;
  padding: 14px 16px;
  border-radius: 8px;
  border: 1px solid var(--dpz-border);
  border-left-width: 4px;
  background: var(--dpz-surface-muted);
  font-size: 14px;
  line-height: 1.65;
}

.dpz-evidence-note.is-info {
  border-left-color: var(--dpz-accent);
}

.dpz-evidence-note.is-warning {
  background: var(--dpz-amber-soft);
  border-color: #E5CFA8;
  border-left-color: var(--dpz-amber);
}

.dpz-evidence-note.is-danger {
  background: var(--dpz-red-soft);
  border-color: #E3BEB8;
  border-left-color: var(--dpz-red);
}

.dpz-evidence-note__head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
  color: var(--dpz-ink);
}

.dpz-evidence-note__meta {
  font-size: 12px;
  color: var(--dpz-text-muted);
}

.dpz-evidence-note__body :deep(p:last-child) {
  margin-bottom: 0;
}
</style>
