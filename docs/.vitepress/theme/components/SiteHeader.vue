<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'
import { NAV_CATEGORIES, QUICK_SHORTCUTS } from '../../nav'
import PagefindSearch from './PagefindSearch.vue'

const route = useRoute()

const openDropdownId = ref<string | null>(null)
const isAllCategoriesOpen = ref(false)
const isMobileDrawerOpen = ref(false)
const mobileExpandedIds = ref<Record<string, boolean>>({})
const headerRef = ref<HTMLElement | null>(null)
let hoverTimer: ReturnType<typeof setTimeout> | null = null

const primaryCompactIds = new Set(['troubleshooting', 'brands', 'clients', 'guides', 'ai-media'])

const compactVisibleCategories = computed(() =>
  NAV_CATEGORIES.filter((c) => primaryCompactIds.has(c.id))
)

function isActiveCategory(link: string): boolean {
  return route.path.startsWith(link)
}

function toggleDropdown(id: string) {
  isAllCategoriesOpen.value = false
  openDropdownId.value = openDropdownId.value === id ? null : id
}

function openHoverDropdown(id: string) {
  if (hoverTimer) clearTimeout(hoverTimer)
  isAllCategoriesOpen.value = false
  openDropdownId.value = id
}

function scheduleCloseDropdown() {
  if (hoverTimer) clearTimeout(hoverTimer)
  hoverTimer = setTimeout(() => {
    openDropdownId.value = null
  }, 140)
}

function toggleAllCategories() {
  openDropdownId.value = null
  isAllCategoriesOpen.value = !isAllCategoriesOpen.value
}

function toggleMobileCategory(id: string) {
  mobileExpandedIds.value = {
    ...mobileExpandedIds.value,
    [id]: !mobileExpandedIds.value[id],
  }
}

function closeAllMenus() {
  openDropdownId.value = null
  isAllCategoriesOpen.value = false
  isMobileDrawerOpen.value = false
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    closeAllMenus()
  }
}

function handleDocClick(e: MouseEvent) {
  if (!headerRef.value) return
  if (!headerRef.value.contains(e.target as Node)) {
    openDropdownId.value = null
    isAllCategoriesOpen.value = false
  }
}

watch(
  () => route.path,
  () => {
    closeAllMenus()
  }
)

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('click', handleDocClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('click', handleDocClick)
  if (hoverTimer) clearTimeout(hoverTimer)
})
</script>

<template>
  <header ref="headerRef" class="dpz-header" data-pagefind-ignore="all">
    <!-- Row 1: Brand Logo + Search + Quick Shortcuts -->
    <div class="dpz-header__row1">
      <div class="dpz-header__inner dpz-header__row1-inner">
        <a href="/" class="dpz-brand" aria-label="代理排障首页">
          <img
            src="/images/site-avatar.webp"
            alt="代理排障站点头像"
            class="dpz-brand__logo"
            width="36"
            height="36"
          />
          <span class="dpz-brand__text">
            <strong class="dpz-brand__title">代理排障</strong>
            <span class="dpz-brand__subtitle">中文网络诊断手册</span>
          </span>
        </a>

        <div class="dpz-header__search">
          <PagefindSearch variant="header" placeholder="搜索报错、客户端或品牌..." />
        </div>

        <nav class="dpz-header__shortcuts" aria-label="快捷入口">
          <a
            v-for="item in QUICK_SHORTCUTS"
            :key="item.link"
            :href="item.link"
            class="dpz-shortcut"
            :class="{ 'is-primary': item.accent === 'primary' }"
          >
            {{ item.text }}
          </a>
        </nav>

        <button
          type="button"
          class="dpz-mobile-toggle"
          :aria-expanded="isMobileDrawerOpen"
          aria-controls="dpz-mobile-drawer"
          aria-label="展开分类导航菜单"
          @click="isMobileDrawerOpen = !isMobileDrawerOpen"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path
              v-if="!isMobileDrawerOpen"
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path
              v-else
              d="M6 6l12 12M18 6l-12 12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          <span>分类</span>
        </button>
      </div>
    </div>

    <!-- Row 2: 10 Primary Categories (Desktop >= 1220px) & Compact + All Popover (960px - 1219px) -->
    <div class="dpz-header__row2">
      <div class="dpz-header__inner dpz-header__row2-inner">
        <!-- Full 10-category bar on wide desktop -->
        <nav class="dpz-nav-full" aria-label="十大一级分类">
          <div
            v-for="cat in NAV_CATEGORIES"
            :key="cat.id"
            class="dpz-nav-item"
            :class="{ 'is-active': isActiveCategory(cat.link), 'is-open': openDropdownId === cat.id }"
            @mouseenter="openHoverDropdown(cat.id)"
            @mouseleave="scheduleCloseDropdown"
          >
            <div class="dpz-nav-trigger">
              <a :href="cat.link" class="dpz-nav-link">{{ cat.text }}</a>
              <button
                type="button"
                class="dpz-nav-caret"
                :aria-expanded="openDropdownId === cat.id"
                :aria-label="`展开${cat.text}二级菜单`"
                @click.stop="toggleDropdown(cat.id)"
              >
                <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true">
                  <path d="M2.5 4.2L6 7.8l3.5-3.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>

            <div
              v-if="openDropdownId === cat.id"
              class="dpz-dropdown"
              role="region"
              :aria-label="`${cat.text}子菜单`"
            >
              <div class="dpz-dropdown__head">
                <a :href="cat.link" class="dpz-dropdown__overview">{{ cat.text }}专题总览 →</a>
              </div>
              <ul class="dpz-dropdown__list">
                <li v-for="sub in cat.items" :key="sub.link">
                  <a :href="sub.link" class="dpz-dropdown__link">
                    <span class="dpz-dropdown__title">{{ sub.text }}</span>
                    <span v-if="sub.desc" class="dpz-dropdown__desc">{{ sub.desc }}</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <!-- Medium screen (960px - 1219px): Core categories + accessible All Categories popover -->
        <nav class="dpz-nav-compact" aria-label="常用分类与全部分类">
          <div
            v-for="cat in compactVisibleCategories"
            :key="cat.id"
            class="dpz-nav-item"
            :class="{ 'is-active': isActiveCategory(cat.link), 'is-open': openDropdownId === cat.id }"
          >
            <div class="dpz-nav-trigger">
              <a :href="cat.link" class="dpz-nav-link">{{ cat.text }}</a>
              <button
                type="button"
                class="dpz-nav-caret"
                :aria-expanded="openDropdownId === cat.id"
                :aria-label="`展开${cat.text}二级菜单`"
                @click.stop="toggleDropdown(cat.id)"
              >
                <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true">
                  <path d="M2.5 4.2L6 7.8l3.5-3.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>

            <div v-if="openDropdownId === cat.id" class="dpz-dropdown">
              <div class="dpz-dropdown__head">
                <a :href="cat.link" class="dpz-dropdown__overview">{{ cat.text }}专题总览 →</a>
              </div>
              <ul class="dpz-dropdown__list">
                <li v-for="sub in cat.items" :key="sub.link">
                  <a :href="sub.link" class="dpz-dropdown__link">
                    <span class="dpz-dropdown__title">{{ sub.text }}</span>
                    <span v-if="sub.desc" class="dpz-dropdown__desc">{{ sub.desc }}</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div class="dpz-all-cats-wrap">
            <button
              type="button"
              class="dpz-all-cats-btn"
              :aria-expanded="isAllCategoriesOpen"
              @click.stop="toggleAllCategories"
            >
              全部分类（10）
              <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true">
                <path d="M2.5 4.2L6 7.8l3.5-3.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>

            <div v-if="isAllCategoriesOpen" class="dpz-mega-popover">
              <div class="dpz-mega-grid">
                <div v-for="cat in NAV_CATEGORIES" :key="cat.id" class="dpz-mega-col">
                  <a :href="cat.link" class="dpz-mega-col__title">{{ cat.text }}</a>
                  <ul class="dpz-mega-col__list">
                    <li v-for="sub in cat.items" :key="sub.link">
                      <a :href="sub.link">{{ sub.text }}</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>

    <!-- Mobile Accordion Drawer (< 960px) -->
    <div
      v-if="isMobileDrawerOpen"
      id="dpz-mobile-drawer"
      class="dpz-mobile-drawer"
      role="dialog"
      aria-label="移动端分类菜单"
    >
      <div class="dpz-mobile-drawer__shortcuts">
        <a
          v-for="item in QUICK_SHORTCUTS"
          :key="item.link"
          :href="item.link"
          class="dpz-shortcut"
          :class="{ 'is-primary': item.accent === 'primary' }"
          @click="closeAllMenus"
        >
          {{ item.text }}
        </a>
      </div>

      <div class="dpz-mobile-accordion">
        <div v-for="cat in NAV_CATEGORIES" :key="cat.id" class="dpz-mobile-group">
          <div class="dpz-mobile-group__head">
            <a :href="cat.link" class="dpz-mobile-group__link" @click="closeAllMenus">
              {{ cat.text }}
            </a>
            <button
              type="button"
              class="dpz-mobile-group__toggle"
              :aria-expanded="Boolean(mobileExpandedIds[cat.id])"
              :aria-label="`展开或收起${cat.text}子项`"
              @click="toggleMobileCategory(cat.id)"
            >
              {{ mobileExpandedIds[cat.id] ? '−' : '+' }}
            </button>
          </div>
          <ul v-if="mobileExpandedIds[cat.id]" class="dpz-mobile-group__sub">
            <li v-for="sub in cat.items" :key="sub.link">
              <a :href="sub.link" @click="closeAllMenus">{{ sub.text }}</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.dpz-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 60;
  background-color: var(--dpz-surface);
  border-bottom: 1px solid var(--dpz-border-strong);
  box-shadow: 0 1px 4px rgba(24, 32, 38, 0.05);
}

.dpz-header__inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.dpz-header__row1 {
  border-bottom: 1px solid var(--dpz-border);
}

.dpz-header__row1-inner {
  height: 58px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.dpz-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}

.dpz-brand__logo {
  display: block;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 9px;
  object-fit: cover;
  border: 1px solid var(--dpz-border-strong);
  background: #FFFFFF;
}

.dpz-brand__text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.dpz-brand__title {
  font-size: 17px;
  font-weight: 700;
  color: var(--dpz-ink);
  letter-spacing: -0.01em;
}

.dpz-brand__subtitle {
  font-size: 11px;
  color: var(--dpz-text-muted);
}

.dpz-header__search {
  flex: 1 1 320px;
  max-width: 480px;
}

.dpz-header__shortcuts {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  flex-shrink: 0;
}

.dpz-shortcut {
  display: inline-flex;
  align-items: center;
  height: 34px;
  padding: 0 12px;
  border-radius: 7px;
  border: 1px solid var(--dpz-border-strong);
  background: var(--dpz-bg);
  color: var(--dpz-ink);
  font-size: 13.5px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}

.dpz-shortcut:hover {
  border-color: var(--dpz-accent);
  color: var(--dpz-accent);
}

.dpz-shortcut.is-primary {
  background: var(--dpz-accent);
  border-color: var(--dpz-accent);
  color: #FFFFFF;
}

.dpz-shortcut.is-primary:hover {
  background: var(--dpz-accent-hover);
  color: #FFFFFF;
}

.dpz-mobile-toggle {
  display: none;
  align-items: center;
  gap: 4px;
  height: 36px;
  padding: 0 10px;
  border-radius: 7px;
  border: 1px solid var(--dpz-border-strong);
  background: var(--dpz-bg);
  color: var(--dpz-ink);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
}

/* Row 2 */
.dpz-header__row2 {
  background-color: var(--dpz-bg);
}

.dpz-header__row2-inner {
  height: 46px;
  display: flex;
  align-items: center;
}

.dpz-nav-full {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 2px;
}

.dpz-nav-compact {
  display: none;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.dpz-nav-item {
  position: relative;
}

.dpz-nav-trigger {
  display: inline-flex;
  align-items: center;
  border-radius: 6px;
  transition: background-color 0.12s ease;
}

.dpz-nav-item.is-active .dpz-nav-trigger,
.dpz-nav-trigger:hover {
  background-color: var(--dpz-surface-hover);
}

.dpz-nav-link {
  padding: 6px 6px 6px 9px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--dpz-ink);
  text-decoration: none;
  white-space: nowrap;
}

.dpz-nav-item.is-active .dpz-nav-link {
  color: var(--dpz-accent);
}

.dpz-nav-caret {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 28px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--dpz-text-muted);
  cursor: pointer;
  border-radius: 0 6px 6px 0;
}

.dpz-nav-caret:hover {
  color: var(--dpz-accent);
}

.dpz-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 280px;
  background: var(--dpz-surface);
  border: 1px solid var(--dpz-border-strong);
  border-radius: 10px;
  box-shadow: 0 12px 28px rgba(24, 32, 38, 0.14);
  padding: 10px;
  z-index: 80;
}

.dpz-nav-item:nth-last-child(-n + 3) .dpz-dropdown {
  left: auto;
  right: 0;
}

.dpz-dropdown__head {
  padding: 4px 8px 8px;
  border-bottom: 1px solid var(--dpz-border);
  margin-bottom: 6px;
}

.dpz-dropdown__overview {
  font-size: 13px;
  font-weight: 700;
  color: var(--dpz-accent);
  text-decoration: none;
}

.dpz-dropdown__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.dpz-dropdown__link {
  display: flex;
  flex-direction: column;
  padding: 7px 8px;
  border-radius: 6px;
  text-decoration: none;
}

.dpz-dropdown__link:hover {
  background: var(--dpz-accent-soft);
}

.dpz-dropdown__title {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--dpz-ink);
}

.dpz-dropdown__desc {
  font-size: 12px;
  color: var(--dpz-text-muted);
  line-height: 1.4;
}

/* Medium screen All Categories Popover */
.dpz-all-cats-wrap {
  position: relative;
  margin-left: auto;
}

.dpz-all-cats-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid var(--dpz-border-strong);
  background: var(--dpz-surface);
  color: var(--dpz-ink);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
}

.dpz-mega-popover {
  position: fixed;
  top: 106px;
  left: 20px;
  right: 20px;
  max-width: 1120px;
  margin: 0 auto;
  background: var(--dpz-surface);
  border: 1px solid var(--dpz-border-strong);
  border-radius: 10px;
  box-shadow: 0 16px 36px rgba(24, 32, 38, 0.16);
  padding: 18px;
  z-index: 85;
  max-height: 75vh;
  overflow-y: auto;
}

.dpz-mega-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
}

.dpz-mega-col__title {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: var(--dpz-accent);
  text-decoration: none;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--dpz-border);
  margin-bottom: 8px;
}

.dpz-mega-col__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.dpz-mega-col__list a {
  display: block;
  padding: 4px 0;
  font-size: 13px;
  color: var(--dpz-text);
  text-decoration: none;
}

.dpz-mega-col__list a:hover {
  color: var(--dpz-accent);
  text-decoration: underline;
}

/* Breakpoints */
@media (max-width: 1259px) and (min-width: 960px) {
  .dpz-nav-full {
    display: none;
  }
  .dpz-nav-compact {
    display: flex;
  }
}

@media (max-width: 959px) {
  .dpz-header__row2,
  .dpz-header__shortcuts {
    display: none;
  }
  .dpz-header__row1-inner {
    height: 60px;
    padding: 0 12px;
    gap: 10px;
  }
  .dpz-brand__subtitle {
    display: none;
  }
  .dpz-header__search {
    flex: 1 1 auto;
    min-width: 0;
  }
  .dpz-mobile-toggle {
    display: inline-flex;
  }
}

@media (max-width: 479px) {
  .dpz-brand__title {
    font-size: 15px;
  }
  .dpz-brand__logo {
    width: 28px;
    height: 28px;
  }
}

/* Mobile Drawer */
.dpz-mobile-drawer {
  background: var(--dpz-surface);
  border-top: 1px solid var(--dpz-border);
  max-height: calc(100vh - 60px);
  overflow-y: auto;
  padding: 14px 16px 28px;
}

.dpz-mobile-drawer__shortcuts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.dpz-mobile-group {
  border-bottom: 1px solid var(--dpz-border);
}

.dpz-mobile-group__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dpz-mobile-group__link {
  flex: 1;
  padding: 12px 4px;
  font-size: 15px;
  font-weight: 600;
  color: var(--dpz-ink);
  text-decoration: none;
}

.dpz-mobile-group__toggle {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  font-size: 20px;
  color: var(--dpz-accent);
  cursor: pointer;
}

.dpz-mobile-group__sub {
  list-style: none;
  margin: 0 0 10px;
  padding: 0 0 0 12px;
  border-left: 2px solid var(--dpz-border-strong);
}

.dpz-mobile-group__sub a {
  display: block;
  padding: 7px 6px;
  font-size: 14px;
  color: var(--dpz-text);
  text-decoration: none;
}
</style>
