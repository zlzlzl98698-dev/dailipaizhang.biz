<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vitepress'
import { NAV_CATEGORIES } from '../../nav'
import { getAllBrands, getAllClients, getAllIssues } from '../utils/siteData'

const props = withDefaults(
  defineProps<{
    variant?: 'header' | 'hero'
    placeholder?: string
  }>(),
  {
    variant: 'header',
    placeholder: '搜索报错码、客户端、机场品牌或排障步骤（如 200 空订阅、TUN、光速云）',
  }
)

interface SearchResultItem {
  url: string
  title: string
  excerpt: string
  category?: string
}

interface PagefindModule {
  options?: (opts: Record<string, unknown>) => Promise<void>
  init?: () => Promise<void>
  search: (query: string) => Promise<{
    results: Array<{
      id: string
      data: () => Promise<{
        url: string
        meta?: { title?: string }
        excerpt?: string
      }>
    }>
  }>
}

const router = useRouter()
const query = ref('')
const isOpen = ref(false)
const isLoading = ref(false)
const usingFallback = ref(false)
const results = ref<SearchResultItem[]>([])
const activeIndex = ref(-1)
const rootRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

let pagefindInstance: PagefindModule | null = null
let pagefindChecked = false
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const fallbackCorpus = computed<SearchResultItem[]>(() => {
  const items: SearchResultItem[] = []

  for (const cat of NAV_CATEGORIES) {
    items.push({
      url: cat.link,
      title: cat.text,
      excerpt: `${cat.text}专题目录：${cat.items.map((i) => i.text).join('、')}`,
      category: '一级专题',
    })
    for (const sub of cat.items) {
      items.push({
        url: sub.link,
        title: sub.text,
        excerpt: sub.desc || `${cat.text} - ${sub.text}`,
        category: cat.text,
      })
    }
  }

  for (const issue of getAllIssues()) {
    items.push({
      url: issue.targetUrl || '/troubleshooting/',
      title: issue.title,
      excerpt: [
        issue.code,
        ...(issue.symptoms || []),
        ...(issue.httpCodes || []),
        ...(issue.clients || []),
      ]
        .filter(Boolean)
        .join(' · '),
      category: '故障排查',
    })
  }

  for (const brand of getAllBrands()) {
    items.push({
      url: `/brands/${brand.slug}/`,
      title: `${brand.name} 评测与实测档案`,
      excerpt: [
        ...(brand.aliases || []),
        ...(brand.protocols || []),
        brand.evidenceStatus ? `证据状态: ${brand.evidenceStatus}` : '',
      ]
        .filter(Boolean)
        .join(' · '),
      category: '机场品牌',
    })
  }

  for (const client of getAllClients()) {
    items.push({
      url: client.docPath || '/clients/',
      title: client.name,
      excerpt: [
        client.summary,
        ...(client.platforms || client.os || []),
        ...(client.protocols || []),
      ]
        .filter(Boolean)
        .join(' · '),
      category: '客户端',
    })
  }

  // Always include key core troubleshooting articles in fallback
  const coreArticles: SearchResultItem[] = [
    {
      url: '/troubleshooting/articles/sub-http-200-empty',
      title: '订阅 HTTP 200 但返回 0 字节 / 空白订阅排查',
      excerpt: '常见于客户端 UA 被拦截、订阅格式不匹配或机场面板返回空响应，含低风险核对步骤。',
      category: '高频故障',
    },
    {
      url: '/troubleshooting/articles/sub-http-401-403-404-503',
      title: '更新订阅失败：HTTP 401 / 403 / 404 / 503 与被重定向',
      excerpt: 'Token 失效、订阅被重置、CF 盾拦截或域名变更的定位路径。',
      category: '高频故障',
    },
    {
      url: '/troubleshooting/articles/nodes-all-timeout',
      title: '所有节点同时超时：本地时间、网络连通与机场全局异常分流',
      excerpt: '先区分本地系统时间/网卡故障还是机场大面积失联。',
      category: '高频故障',
    },
    {
      url: '/troubleshooting/articles/tun-not-working',
      title: 'TUN 模式开启无效：虚拟网卡冲突与服务模式授权',
      excerpt: 'Clash Verge Rev / Mihomo / sing-box 虚拟网卡权限与路由环路处理。',
      category: '高频故障',
    },
    {
      url: '/troubleshooting/articles/dns-leak-hijack-fix',
      title: 'DNS 污染、DNS 泄漏与 Fake-IP 异常修复',
      excerpt: '检查 198.18.0.1 解析冲突、nameserver/fallback 分流与回滚方案。',
      category: '高频故障',
    },
    {
      url: '/troubleshooting/articles/connected-no-internet',
      title: '节点已连接但网页打不开：系统代理、端口冲突与环路排查',
      excerpt: '排查 7890/10808 端口占用、代理覆盖与本地环回规则。',
      category: '高频故障',
    },
  ]

  const seen = new Set(items.map((x) => x.url))
  for (const art of coreArticles) {
    if (!seen.has(art.url)) items.push(art)
  }
  return items
})

async function ensurePagefind(): Promise<PagefindModule | null> {
  if (pagefindInstance) return pagefindInstance
  if (pagefindChecked) return null
  pagefindChecked = true

  if (typeof window === 'undefined') return null

  try {
    const pagefindPath = '/pagefind/pagefind.js'
    const mod = (await import(/* @vite-ignore */ pagefindPath)) as PagefindModule
    if (mod && typeof mod.search === 'function') {
      if (mod.options) {
        await mod.options({ basePath: '/pagefind/', excerptLength: 24 })
      }
      if (mod.init) {
        await mod.init()
      }
      pagefindInstance = mod
      usingFallback.value = false
      return mod
    }
  } catch {
    usingFallback.value = true
  }
  return null
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function highlightText(text: string, q: string): string {
  const safe = escapeHtml(text)
  const terms = q
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0)
  if (terms.length === 0) return safe
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const re = new RegExp(`(${escaped.join('|')})`, 'gi')
  return safe.replace(re, '<mark>$1</mark>')
}

function runFallbackSearch(q: string): SearchResultItem[] {
  const terms = q
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
  if (terms.length === 0) return []

  const scored = fallbackCorpus.value
    .map((item) => {
      const hay = `${item.title} ${item.excerpt} ${item.category || ''} ${item.url}`.toLowerCase()
      let score = 0
      for (const term of terms) {
        if (item.title.toLowerCase().includes(term)) score += 6
        if (item.excerpt.toLowerCase().includes(term)) score += 3
        if (hay.includes(term)) score += 1
      }
      return { item, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ item }) => ({
      ...item,
      title: item.title,
      excerpt: highlightText(item.excerpt, q),
    }))

  return scored
}

async function performSearch(q: string) {
  const trimmed = q.trim()
  if (!trimmed) {
    results.value = []
    activeIndex.value = -1
    return
  }

  isLoading.value = true
  try {
    const pf = await ensurePagefind()
    if (pf) {
      const res = await pf.search(trimmed)
      const top = res.results.slice(0, 10)
      const loaded = await Promise.all(top.map((r) => r.data()))
      const pfResults = loaded.map((d) => ({
        url: d.url.replace(/index\.html$/, '').replace(/\.html$/, '') || '/',
        title: d.meta?.title || d.url,
        excerpt: d.excerpt || '',
      }))
      if (pfResults.length > 0) {
        results.value = pfResults
      } else {
        results.value = runFallbackSearch(trimmed)
      }
      activeIndex.value = results.value.length > 0 ? 0 : -1
    } else {
      usingFallback.value = true
      results.value = runFallbackSearch(trimmed)
      activeIndex.value = results.value.length > 0 ? 0 : -1
    }
  } finally {
    isLoading.value = false
  }
}

watch(query, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (!val.trim()) {
    results.value = []
    activeIndex.value = -1
    return
  }
  isOpen.value = true
  debounceTimer = setTimeout(() => {
    void performSearch(val)
  }, 140)
})

function navigateTo(url: string) {
  isOpen.value = false
  router.go(url)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    isOpen.value = false
    inputRef.value?.blur()
    return
  }
  if (!isOpen.value || results.value.length === 0) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % results.value.length
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = (activeIndex.value - 1 + results.value.length) % results.value.length
  } else if (e.key === 'Enter' && activeIndex.value >= 0) {
    e.preventDefault()
    const target = results.value[activeIndex.value]
    if (target) navigateTo(target.url)
  }
}

function handleOutsideClick(e: MouseEvent) {
  if (!rootRef.value) return
  if (!rootRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

function applyQuickTag(tag: string) {
  query.value = tag
  isOpen.value = true
  void performSearch(tag)
  inputRef.value?.focus()
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    const initialQ = params.get('q')
    if (initialQ && props.variant === 'hero') {
      query.value = initialQ
      isOpen.value = true
      void performSearch(initialQ)
    }
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>

<template>
  <div
    ref="rootRef"
    class="dpz-search"
    :class="`dpz-search--${variant}`"
    data-pagefind-ignore="all"
  >
    <div class="dpz-search__box">
      <svg class="dpz-search__icon" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
        <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" stroke-width="1.8" />
        <path d="M12.8 12.8 L17 17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
      <input
        ref="inputRef"
        v-model="query"
        type="search"
        class="dpz-search__input"
        :placeholder="placeholder"
        aria-label="站内搜索故障排查与品牌资料"
        :aria-expanded="isOpen"
        autocomplete="off"
        @focus="isOpen = query.trim().length > 0"
        @keydown="handleKeydown"
      />
      <button
        v-if="query"
        type="button"
        class="dpz-search__clear"
        aria-label="清空搜索词"
        @click="query = ''; isOpen = false; inputRef?.focus()"
      >
        ×
      </button>
    </div>

    <div v-if="variant === 'hero'" class="dpz-search__hints">
      <span class="dpz-search__hint-label">常见检索：</span>
      <button type="button" class="dpz-search__chip" @click="applyQuickTag('200 空订阅')">200 空订阅</button>
      <button type="button" class="dpz-search__chip" @click="applyQuickTag('TUN 模式')">TUN 模式</button>
      <button type="button" class="dpz-search__chip" @click="applyQuickTag('DNS 泄漏')">DNS 泄漏</button>
      <button type="button" class="dpz-search__chip" @click="applyQuickTag('Clash Verge')">Clash Verge</button>
      <button type="button" class="dpz-search__chip" @click="applyQuickTag('光速云')">光速云</button>
    </div>

    <div v-if="isOpen && query.trim().length > 0" class="dpz-search__dropdown" role="listbox">
      <div v-if="usingFallback" class="dpz-search__mode-note">
        当前使用本地结构化索引（完整全文索引在构建后由 Pagefind 自动启用）
      </div>

      <div v-if="isLoading" class="dpz-search__status">正在检索诊断库...</div>

      <template v-else-if="results.length > 0">
        <a
          v-for="(item, idx) in results"
          :key="item.url + idx"
          :href="item.url"
          class="dpz-search__item"
          :class="{ 'is-active': idx === activeIndex }"
          role="option"
          :aria-selected="idx === activeIndex"
          @click.prevent="navigateTo(item.url)"
        >
          <div class="dpz-search__item-head">
            <span class="dpz-search__item-title">{{ item.title }}</span>
            <span v-if="item.category" class="dpz-search__item-tag">{{ item.category }}</span>
          </div>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div class="dpz-search__item-excerpt" v-html="item.excerpt" />
        </a>
      </template>

      <div v-else class="dpz-search__empty">
        <p class="dpz-search__empty-title">未找到与“{{ query }}”直接匹配的条目</p>
        <p class="dpz-search__empty-desc">
          建议改用报错状态码（如 403、200、TLS）或直接进入交互式排障分流器定位：
        </p>
        <div class="dpz-search__empty-actions">
          <a href="/troubleshooting/" class="dpz-search__empty-btn" @click.prevent="navigateTo('/troubleshooting/')">
            打开故障分流器 →
          </a>
          <a href="/brands/" class="dpz-search__empty-link" @click.prevent="navigateTo('/brands/')">
            查看 31 家品牌库
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dpz-search {
  position: relative;
  width: 100%;
}

.dpz-search__box {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--dpz-surface);
  border: 1px solid var(--dpz-border-strong);
  border-radius: 8px;
  padding: 0 12px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.dpz-search__box:focus-within {
  border-color: var(--dpz-accent);
  box-shadow: 0 0 0 3px rgba(43, 91, 108, 0.14);
}

.dpz-search--header .dpz-search__box {
  height: 38px;
  background-color: var(--dpz-bg);
}

.dpz-search--hero .dpz-search__box {
  height: 50px;
  padding: 0 16px;
  border-width: 1.5px;
  box-shadow: 0 2px 8px rgba(24, 32, 38, 0.05);
}

.dpz-search__icon {
  color: var(--dpz-text-muted);
  flex-shrink: 0;
}

.dpz-search__input {
  width: 100%;
  border: none;
  background: transparent;
  color: var(--dpz-ink);
  font-size: 14px;
  line-height: 1.4;
  outline: none;
}

.dpz-search__input::-webkit-search-decoration,
.dpz-search__input::-webkit-search-cancel-button,
.dpz-search__input::-webkit-search-results-button,
.dpz-search__input::-webkit-search-results-decoration {
  -webkit-appearance: none;
  appearance: none;
}

.dpz-search--hero .dpz-search__input {
  font-size: 16px;
}

.dpz-search__clear {
  border: none;
  background: var(--dpz-surface-muted);
  color: var(--dpz-text-muted);
  width: 22px;
  height: 22px;
  border-radius: 999px;
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
}

.dpz-search__clear:hover {
  background: var(--dpz-surface-hover);
  color: var(--dpz-ink);
}

.dpz-search__hints {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.dpz-search__hint-label {
  font-size: 13px;
  color: var(--dpz-text-muted);
}

.dpz-search__chip {
  font-size: 13px;
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid var(--dpz-border-strong);
  background: var(--dpz-surface);
  color: var(--dpz-text);
  cursor: pointer;
}

.dpz-search__chip:hover {
  border-color: var(--dpz-accent);
  color: var(--dpz-accent);
  background: var(--dpz-accent-soft);
}

.dpz-search__dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 90;
  background: var(--dpz-surface);
  border: 1px solid var(--dpz-border-strong);
  border-radius: 10px;
  box-shadow: 0 12px 32px rgba(24, 32, 38, 0.14);
  max-height: 440px;
  overflow-y: auto;
  text-align: left;
}

.dpz-search--header .dpz-search__dropdown {
  min-width: 340px;
}

@media (max-width: 639px) {
  .dpz-search--header .dpz-search__dropdown {
    position: fixed;
    left: 12px;
    right: 12px;
    top: 62px;
    min-width: 0;
  }
}

.dpz-search__mode-note {
  padding: 6px 14px;
  font-size: 12px;
  color: var(--dpz-text-muted);
  background: var(--dpz-surface-muted);
  border-bottom: 1px solid var(--dpz-border);
}

.dpz-search__status {
  padding: 18px 14px;
  font-size: 14px;
  color: var(--dpz-text-muted);
}

.dpz-search__item {
  display: block;
  padding: 12px 14px;
  border-bottom: 1px solid var(--dpz-border);
  text-decoration: none;
  color: inherit;
}

.dpz-search__item:last-child {
  border-bottom: none;
}

.dpz-search__item:hover,
.dpz-search__item.is-active {
  background: var(--dpz-accent-soft);
}

.dpz-search__item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.dpz-search__item-title {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--dpz-ink);
}

.dpz-search__item-tag {
  font-size: 11.5px;
  padding: 1px 7px;
  border-radius: 4px;
  background: var(--dpz-surface-muted);
  color: var(--dpz-accent);
  white-space: nowrap;
}

.dpz-search__item-excerpt {
  font-size: 13px;
  line-height: 1.5;
  color: var(--dpz-text-muted);
}

.dpz-search__item-excerpt :deep(mark) {
  background-color: #F3E5B5;
  color: var(--dpz-ink);
  padding: 0 2px;
  border-radius: 2px;
}

.dpz-search__empty {
  padding: 18px 16px;
}

.dpz-search__empty-title {
  margin: 0 0 6px;
  font-size: 14.5px;
  font-weight: 600;
  color: var(--dpz-ink);
}

.dpz-search__empty-desc {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--dpz-text-muted);
}

.dpz-search__empty-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.dpz-search__empty-btn {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 6px;
  background: var(--dpz-accent);
  color: #FFFFFF;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
}

.dpz-search__empty-btn:hover {
  background: var(--dpz-accent-hover);
}

.dpz-search__empty-link {
  font-size: 13px;
  color: var(--dpz-accent);
  text-decoration: underline;
}
</style>
