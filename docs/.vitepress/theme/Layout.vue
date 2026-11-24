<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'
import DefaultTheme from 'vitepress/theme-without-fonts'
import { NAV_CATEGORIES, SEGMENT_LABELS } from '../nav'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import NotFoundPage from './components/NotFoundPage.vue'
import ImageLightbox from './components/ImageLightbox.vue'
import ArticleClusterIndex from './components/ArticleClusterIndex.vue'

const { Layout: BaseLayout } = DefaultTheme
const { page, frontmatter } = useData()
const route = useRoute()

const breadcrumbs = computed(() => {
  if (Array.isArray(frontmatter.value.breadcrumbs) && frontmatter.value.breadcrumbs.length > 0) {
    return frontmatter.value.breadcrumbs.map(
      (b: { text?: string; name?: string; link?: string }) => ({
        text: b.text || b.name || '',
        link: b.link || '',
      })
    )
  }

  const rel = page.value.relativePath || ''
  if (!rel || rel === 'index.md') return []

  const clean = rel.replace(/(\/index)?\.md$/, '')
  const parts = clean.split('/').filter(Boolean)
  const items: Array<{ text: string; link?: string }> = [{ text: '首页', link: '/' }]

  let acc = ''
  for (let i = 0; i < parts.length; i++) {
    const seg = parts[i]
    acc += '/' + seg
    const isLast = i === parts.length - 1
    if (isLast) {
      items.push({
        text: String(frontmatter.value.title || page.value.title || SEGMENT_LABELS[seg] || seg),
      })
    } else {
      const cat = NAV_CATEGORIES.find((c) => c.id === seg)
      items.push({
        text: cat?.text || SEGMENT_LABELS[seg] || seg,
        link: `${acc}/`,
      })
    }
  }
  return items
})

const showDocMeta = computed(() => {
  return (
    !page.value.isNotFound &&
    route.path !== '/' &&
    frontmatter.value.layout !== 'home' &&
    (frontmatter.value.publishedAt ||
      frontmatter.value.updatedAt ||
      frontmatter.value.primaryKeyword ||
      frontmatter.value.evidenceLevel)
  )
})
</script>

<template>
  <BaseLayout>
    <template #layout-top>
      <SiteHeader />
    </template>

    <template #not-found>
      <NotFoundPage />
    </template>

    <template #doc-before>
      <nav
        v-if="breadcrumbs.length > 1"
        class="dpz-breadcrumbs"
        aria-label="面包屑导航"
        data-pagefind-ignore="all"
      >
        <template v-for="(crumb, idx) in breadcrumbs" :key="crumb.text + idx">
          <span v-if="idx > 0" class="dpz-breadcrumbs__sep" aria-hidden="true">/</span>
          <a v-if="crumb.link && idx < breadcrumbs.length - 1" :href="crumb.link">
            {{ crumb.text }}
          </a>
          <span v-else class="dpz-breadcrumbs__current">{{ crumb.text }}</span>
        </template>
      </nav>

      <div v-if="showDocMeta" class="dpz-doc-meta" data-pagefind-ignore="all">
        <span v-if="frontmatter.updatedAt || frontmatter.publishedAt" class="dpz-doc-meta__pill dpz-mono">
          核验日期：{{ frontmatter.updatedAt || frontmatter.publishedAt }}
        </span>
        <span v-if="frontmatter.pillar" class="dpz-doc-meta__pill">
          专题：{{ frontmatter.pillar }}
        </span>
        <span v-if="frontmatter.draft" class="dpz-doc-meta__pill is-warn">
          草稿（不纳入索引）
        </span>
      </div>
    </template>

    <template #doc-after>
      <ArticleClusterIndex />
    </template>

    <template #layout-bottom>
      <SiteFooter />
      <ImageLightbox />
    </template>
  </BaseLayout>
</template>

<style scoped>
.dpz-breadcrumbs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--dpz-text-muted);
  margin-bottom: 14px;
}

.dpz-breadcrumbs a {
  color: var(--dpz-accent);
  text-decoration: none;
}

.dpz-breadcrumbs a:hover {
  text-decoration: underline;
}

.dpz-breadcrumbs__sep {
  color: var(--dpz-border-strong);
}

.dpz-breadcrumbs__current {
  color: var(--dpz-text);
  font-weight: 500;
}

.dpz-doc-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 18px;
}

.dpz-doc-meta__pill {
  font-size: 12px;
  padding: 3px 9px;
  border-radius: 5px;
  background: var(--dpz-surface-muted);
  border: 1px solid var(--dpz-border);
  color: var(--dpz-text-muted);
}

.dpz-doc-meta__pill.is-warn {
  background: var(--dpz-amber-soft);
  border-color: var(--dpz-amber);
  color: var(--dpz-amber);
}
</style>
