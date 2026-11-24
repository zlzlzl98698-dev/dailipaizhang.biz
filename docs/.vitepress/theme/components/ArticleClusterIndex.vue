<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vitepress'
import rawMap from '../../../../data/keywords/article-keyword-map.json'

interface ArticleItem {
  url: string
  title: string
  primaryKeyword?: string
  searchIntent?: string
  summary?: string
  badge?: string
}

interface ArticleDetail {
  url: string
  title: string
  parentTopic?: string
  parentTopicName?: string
  primaryKeyword?: string
  relatedArticles?: Array<{ url: string; title: string }>
  relatedReviews?: Array<{ url: string; name: string }>
  relatedComparisons?: Array<{ url: string; title: string }>
}

interface KeywordMapStructure {
  bySecondaryTopic?: Record<string, ArticleItem[]>
  byArticle?: Record<string, ArticleDetail>
}

const map = rawMap as KeywordMapStructure
const route = useRoute()

const normalizedPath = computed(() => {
  const p = route.path || '/'
  const clean = p.split('#')[0].split('?')[0].replace(/\.html$/, '')
  return clean || '/'
})

// Check if current page is a secondary topic that has sub-articles
const secondaryArticles = computed<ArticleItem[]>(() => {
  if (!map.bySecondaryTopic) return []
  const path = normalizedPath.value
  const withSlash = path.endsWith('/') ? path : path + '/'
  const withoutSlash = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path

  return (
    map.bySecondaryTopic[withSlash] ||
    map.bySecondaryTopic[withoutSlash] ||
    []
  )
})

// Check if current page is an article that has cluster context
const articleInfo = computed<ArticleDetail | null>(() => {
  if (!map.byArticle) return null
  const path = normalizedPath.value
  const withoutSlash = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path
  const withSlash = path.endsWith('/') ? path : path + '/'

  return (
    map.byArticle[withoutSlash] ||
    map.byArticle[withSlash] ||
    null
  )
})

const hasContent = computed(() => {
  return secondaryArticles.value.length > 0 || articleInfo.value !== null
})
</script>

<template>
  <div v-if="hasContent" class="dpz-cluster-wrapper" data-pagefind-ignore="all">
    <!-- Case 1: Secondary Topic Hub Page -> Output Subordinate Level-3 Articles List -->
    <section
      v-if="secondaryArticles.length > 0"
      class="dpz-cluster-section dpz-cluster-secondary"
      aria-label="专题下属实操与长尾排障文章"
    >
      <div class="dpz-cluster-header">
        <div class="dpz-cluster-title-wrap">
          <span class="dpz-cluster-tag">专题集群</span>
          <h2 class="dpz-cluster-title">下属实操与长尾排障指南</h2>
        </div>
        <p class="dpz-cluster-subtitle">
          收录本专题下属已发布的实战排障手册、参数调优教程与深度决策指南（静态预渲染）
        </p>
      </div>

      <div class="dpz-cluster-grid">
        <a
          v-for="item in secondaryArticles"
          :key="item.url"
          :href="item.url"
          class="dpz-cluster-card"
        >
          <div class="dpz-cluster-card__header">
            <span class="dpz-cluster-card__badge">
              {{ item.primaryKeyword || item.badge || '实操指南' }}
            </span>
            <span v-if="item.searchIntent" class="dpz-cluster-card__intent">
              {{ item.searchIntent }}
            </span>
          </div>
          <h3 class="dpz-cluster-card__title">{{ item.title }}</h3>
          <p v-if="item.summary" class="dpz-cluster-card__desc">{{ item.summary }}</p>
          <div class="dpz-cluster-card__action">
            <span>阅读完整指南</span>
            <span class="dpz-cluster-card__arrow" aria-hidden="true">→</span>
          </div>
        </a>
      </div>
    </section>

    <!-- Case 2: Level-3 Article Page -> Output Cluster Context, Related Articles, Reviews & Comparisons -->
    <section
      v-else-if="articleInfo"
      class="dpz-cluster-section dpz-cluster-article-nav"
      aria-label="所属专题与集群延伸阅读"
    >
      <div class="dpz-cluster-nav-box">
        <!-- Parent Topic Callout -->
        <div v-if="articleInfo.parentTopic" class="dpz-cluster-parent-callout">
          <div class="dpz-cluster-parent-label">
            <span class="dpz-cluster-icon" aria-hidden="true">📁</span>
            <span>所属二级专题：</span>
          </div>
          <a :href="articleInfo.parentTopic" class="dpz-cluster-parent-link">
            {{ articleInfo.parentTopicName || '查看专题中心全部内容' }}
            <span aria-hidden="true"> →</span>
          </a>
        </div>

        <!-- Related Articles within Cluster -->
        <div
          v-if="articleInfo.relatedArticles && articleInfo.relatedArticles.length > 0"
          class="dpz-cluster-group"
        >
          <h3 class="dpz-cluster-group__title">
            <span class="dpz-cluster-icon" aria-hidden="true">🔗</span>
            同集群关联阅读与排障手册
          </h3>
          <div class="dpz-cluster-links-list">
            <a
              v-for="rel in articleInfo.relatedArticles"
              :key="rel.url"
              :href="rel.url"
              class="dpz-cluster-link-item"
            >
              <span class="dpz-cluster-link-bullet" aria-hidden="true">•</span>
              <span class="dpz-cluster-link-text">{{ rel.title }}</span>
            </a>
          </div>
        </div>

        <!-- Related Brand Reviews & Comparisons -->
        <div
          v-if="
            (articleInfo.relatedReviews && articleInfo.relatedReviews.length > 0) ||
            (articleInfo.relatedComparisons && articleInfo.relatedComparisons.length > 0)
          "
          class="dpz-cluster-group dpz-cluster-group--meta"
        >
          <h3 class="dpz-cluster-group__title">
            <span class="dpz-cluster-icon" aria-hidden="true">⚖️</span>
            相关品牌深度评测与横向对比
          </h3>
          <div class="dpz-cluster-pills-wrap">
            <a
              v-for="rev in articleInfo.relatedReviews"
              :key="rev.url"
              :href="rev.url"
              class="dpz-cluster-pill dpz-cluster-pill--review"
            >
              {{ rev.name }} 深度评测
            </a>
            <a
              v-for="cmp in articleInfo.relatedComparisons"
              :key="cmp.url"
              :href="cmp.url"
              class="dpz-cluster-pill dpz-cluster-pill--compare"
            >
              {{ cmp.title }}
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dpz-cluster-wrapper {
  margin-top: 36px;
  padding-top: 24px;
  border-top: 1px solid var(--dpz-border);
}

.dpz-cluster-header {
  margin-bottom: 20px;
}

.dpz-cluster-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.dpz-cluster-tag {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--dpz-accent-soft, rgba(43, 91, 108, 0.1));
  color: var(--dpz-accent);
}

.dpz-cluster-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--dpz-text);
  line-height: 1.3;
}

.dpz-cluster-subtitle {
  margin: 0;
  font-size: 13px;
  color: var(--dpz-text-muted);
  line-height: 1.5;
}

.dpz-cluster-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.dpz-cluster-card {
  display: flex;
  flex-direction: column;
  padding: 16px;
  border-radius: 8px;
  background: var(--dpz-surface, #ffffff);
  border: 1px solid var(--dpz-border);
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}

.dpz-cluster-card:hover {
  border-color: var(--dpz-accent);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.dpz-cluster-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.dpz-cluster-card__badge {
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 4px;
  background: var(--dpz-surface-muted, #f1f5f9);
  color: var(--dpz-text-muted);
  font-weight: 500;
}

.dpz-cluster-card__intent {
  font-size: 11px;
  color: var(--dpz-text-muted);
  font-family: monospace;
}

.dpz-cluster-card__title {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--dpz-text);
  line-height: 1.4;
  flex: 1;
}

.dpz-cluster-card:hover .dpz-cluster-card__title {
  color: var(--dpz-accent);
}

.dpz-cluster-card__desc {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--dpz-text-muted);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dpz-cluster-card__action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 500;
  color: var(--dpz-accent);
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px dashed var(--dpz-border);
}

.dpz-cluster-card__arrow {
  transition: transform 0.2s ease;
}

.dpz-cluster-card:hover .dpz-cluster-card__arrow {
  transform: translateX(4px);
}

/* Level-3 Article Navigation Box */
.dpz-cluster-nav-box {
  background: var(--dpz-surface-muted, #f8fafc);
  border: 1px solid var(--dpz-border);
  border-radius: 8px;
  padding: 18px 20px;
}

.dpz-cluster-parent-callout {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding-bottom: 14px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--dpz-border);
  font-size: 14px;
}

.dpz-cluster-parent-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--dpz-text-muted);
  font-weight: 500;
}

.dpz-cluster-parent-link {
  color: var(--dpz-accent);
  font-weight: 600;
  text-decoration: none;
}

.dpz-cluster-parent-link:hover {
  text-decoration: underline;
}

.dpz-cluster-group {
  margin-top: 14px;
}

.dpz-cluster-group:first-of-type {
  margin-top: 0;
}

.dpz-cluster-group__title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--dpz-text);
  display: flex;
  align-items: center;
  gap: 6px;
}

.dpz-cluster-links-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dpz-cluster-link-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 13px;
  color: var(--dpz-text);
  text-decoration: none;
  line-height: 1.5;
}

.dpz-cluster-link-bullet {
  color: var(--dpz-accent);
  font-size: 16px;
  line-height: 1;
}

.dpz-cluster-link-item:hover .dpz-cluster-link-text {
  color: var(--dpz-accent);
  text-decoration: underline;
}

.dpz-cluster-pills-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dpz-cluster-pill {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.15s ease;
}

.dpz-cluster-pill--review {
  background: var(--dpz-surface, #ffffff);
  border: 1px solid var(--dpz-border);
  color: var(--dpz-text);
}

.dpz-cluster-pill--review:hover {
  border-color: var(--dpz-accent);
  color: var(--dpz-accent);
}

.dpz-cluster-pill--compare {
  background: var(--dpz-accent-soft, rgba(43, 91, 108, 0.08));
  border: 1px solid var(--dpz-accent);
  color: var(--dpz-accent);
}

.dpz-cluster-pill--compare:hover {
  background: var(--dpz-accent);
  color: #ffffff;
}

.dpz-cluster-icon {
  font-size: 14px;
}
</style>
