import { defineConfig, type HeadConfig, type PageData } from 'vitepress'
import { buildVitepressSidebar, NAV_CATEGORIES, SEGMENT_LABELS } from './nav'

const SITE_URL = 'https://dailipaizhang.biz'
const SITE_NAME = '代理排障'
const SITE_DESC =
  '中文网络代理诊断手册与机场排障知识库：覆盖订阅失败、DNS 泄漏、TUN 模式、客户端配置与可复核实测记录。'

// Webmaster Verification Slots (Google, Bing, Baidu, Shenma)
// Leave empty by default; will output directly into SSG HTML <head> when set via env or config
const GOOGLE_SITE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION || ''
const BING_SITE_VERIFICATION = process.env.BING_SITE_VERIFICATION || ''
const BAIDU_SITE_VERIFICATION = process.env.BAIDU_SITE_VERIFICATION || ''
const SHENMA_SITE_VERIFICATION = process.env.SHENMA_SITE_VERIFICATION || ''

const excludedUrls = new Set<string>(['/404', '/404.html', '404', '404.html'])

function toCanonicalPath(relativePath: string): string {
  if (!relativePath || relativePath === 'index.md') return '/'
  if (relativePath.endsWith('/index.md')) {
    return '/' + relativePath.slice(0, -'index.md'.length)
  }
  if (relativePath.endsWith('.md')) {
    return '/' + relativePath.slice(0, -'.md'.length)
  }
  return '/' + relativePath
}

function normalizeSitemapUrl(url: string): string {
  const withoutOrigin = url.replace(/^https?:\/\/[^/]+/, '')
  const clean = withoutOrigin.startsWith('/') ? withoutOrigin : '/' + withoutOrigin
  return clean.replace(/\/index\.html$/, '/').replace(/\.html$/, '')
}

function buildBreadcrumbs(
  pageData: PageData,
  canonicalUrl: string
): Array<{ name: string; item: string }> {
  const fm = pageData.frontmatter || {}
  if (Array.isArray(fm.breadcrumbs) && fm.breadcrumbs.length > 0) {
    return fm.breadcrumbs
      .map((entry: { text?: string; name?: string; link?: string; item?: string }) => ({
        name: String(entry.name || entry.text || '').trim(),
        item: entry.item
          ? String(entry.item)
          : entry.link
            ? `${SITE_URL}${entry.link.startsWith('/') ? entry.link : '/' + entry.link}`
            : canonicalUrl,
      }))
      .filter((x) => x.name.length > 0)
  }

  const rel = pageData.relativePath || ''
  if (!rel || rel === 'index.md') return []

  const crumbs: Array<{ name: string; item: string }> = [
    { name: '首页', item: `${SITE_URL}/` },
  ]

  const cleanRel = rel.replace(/(\/index)?\.md$/, '')
  const parts = cleanRel.split('/').filter(Boolean)

  let acc = ''
  for (let i = 0; i < parts.length; i++) {
    const seg = parts[i]
    acc += '/' + seg
    const isLast = i === parts.length - 1
    if (isLast) {
      crumbs.push({
        name: pageData.title || fm.title || SEGMENT_LABELS[seg] || seg,
        item: canonicalUrl,
      })
    } else {
      const cat = NAV_CATEGORIES.find((c) => c.id === seg)
      const label = cat?.text || SEGMENT_LABELS[seg] || seg
      crumbs.push({
        name: label,
        item: `${SITE_URL}${acc}/`,
      })
    }
  }

  return crumbs
}

function buildStructuredData(pageData: PageData, canonicalUrl: string): Record<string, unknown>[] {
  const fm = pageData.frontmatter || {}
  const title = fm.title || pageData.title || SITE_NAME
  const description = fm.description || pageData.description || SITE_DESC
  const isHome = pageData.relativePath === 'index.md'
  const schemas: Record<string, unknown>[] = []

  const orgRef = {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/images/site-avatar.webp`,
    },
  }

  if (isHome) {
    schemas.push({
      '@context': 'https://schema.org',
      ...orgRef,
    })
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      inLanguage: 'zh-CN',
      description: SITE_DESC,
      publisher: { '@id': `${SITE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    })
  } else {
    const crumbs = buildBreadcrumbs(pageData, canonicalUrl)
    if (crumbs.length > 1) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((c, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: c.name,
          item: c.item,
        })),
      })
    }
  }

  // SoftwareApplication (only when explicitly declared in frontmatter)
  if (fm.software && typeof fm.software === 'object') {
    const sw = fm.software as Record<string, unknown>
    if (sw.name) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: sw.name,
        operatingSystem: sw.operatingSystem || 'Windows, macOS, Linux, Android, iOS',
        applicationCategory: sw.applicationCategory || 'NetworkingApplication',
        ...(sw.softwareVersion ? { softwareVersion: sw.softwareVersion } : {}),
        ...(sw.url ? { url: sw.url } : {}),
        ...(sw.offers ? { offers: sw.offers } : {}),
      })
    }
  }

  const isDocPage = !isHome && !pageData.isNotFound && fm.layout !== 'home'

  // CollectionPage (only when frontmatter declares collectionPage: true)
  if (isDocPage && fm.collectionPage === true) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      description,
      url: canonicalUrl,
      inLanguage: 'zh-CN',
      isPartOf: { '@id': `${SITE_URL}/#website` },
    })
  }

  // Article / TechArticle
  const explicitSchema = fm.schemaType as string | undefined
  if (
    isDocPage &&
    (explicitSchema === 'TechArticle' ||
      explicitSchema === 'Article' ||
      fm.publishedAt ||
      fm.updatedAt ||
      fm.date ||
      pageData.relativePath.startsWith('troubleshooting/') ||
      pageData.relativePath.startsWith('guides/') ||
      pageData.relativePath.startsWith('brands/'))
  ) {
    const articleType =
      explicitSchema === 'Article'
        ? 'Article'
        : pageData.relativePath.startsWith('troubleshooting/') ||
            pageData.relativePath.startsWith('guides/') ||
            pageData.relativePath.startsWith('clients/') ||
            pageData.relativePath.startsWith('routes/') ||
            explicitSchema === 'TechArticle'
          ? 'TechArticle'
          : 'Article'

    const datePublished = fm.publishedAt || fm.date
    const dateModified = fm.updatedAt || fm.publishedAt || fm.date

    schemas.push({
      '@context': 'https://schema.org',
      '@type': articleType,
      headline: title,
      description,
      inLanguage: 'zh-CN',
      mainEntityOfPage: canonicalUrl,
      ...(datePublished ? { datePublished: String(datePublished) } : {}),
      ...(dateModified ? { dateModified: String(dateModified) } : {}),
      author: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: `${SITE_URL}/about`,
      },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: `${SITE_URL}/`,
      },
    })
  }

  // FAQPage (only when frontmatter declares faq[] with real Q/A)
  if (Array.isArray(fm.faq) && fm.faq.length > 0) {
    const faqItems = fm.faq
      .map((item: { q?: string; question?: string; a?: string; answer?: string }) => ({
        q: String(item.question || item.q || '').trim(),
        a: String(item.answer || item.a || '').trim(),
      }))
      .filter((x) => x.q && x.a)

    if (faqItems.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((x) => ({
          '@type': 'Question',
          name: x.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: x.a,
          },
        })),
      })
    }
  }

  // HowTo (only when frontmatter declares howTo with valid steps)
  if (fm.howTo && typeof fm.howTo === 'object') {
    const ht = fm.howTo as {
      name?: string
      description?: string
      step?: Array<{ name?: string; text?: string }>
    }
    const steps = Array.isArray(ht.step)
      ? ht.step
          .map((s) => ({
            name: String(s.name || '').trim(),
            text: String(s.text || '').trim(),
          }))
          .filter((s) => s.name || s.text)
      : []

    if (ht.name && steps.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: ht.name,
        ...(ht.description ? { description: ht.description } : {}),
        step: steps.map((s, idx) => ({
          '@type': 'HowToStep',
          position: idx + 1,
          name: s.name || `步骤 ${idx + 1}`,
          text: s.text || s.name,
        })),
      })
    }
  }

  // ItemList (only when frontmatter declares itemList[])
  if (Array.isArray(fm.itemList) && fm.itemList.length > 0) {
    const items = fm.itemList
      .map((entry: string | { name?: string; url?: string }) =>
        typeof entry === 'string'
          ? { name: entry, url: undefined }
          : { name: String(entry.name || '').trim(), url: entry.url ? String(entry.url) : undefined }
      )
      .filter((x) => x.name)

    if (items.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: title,
        itemListElement: items.map((entry, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: entry.name,
          ...(entry.url
            ? {
                url: entry.url.startsWith('http') ? entry.url : `${SITE_URL}${entry.url}`,
              }
            : {}),
        })),
      })
    }
  }

  return schemas
}

export default defineConfig({
  lang: 'zh-CN',
  title: SITE_NAME,
  titleTemplate: `:title｜${SITE_NAME}`,
  description: SITE_DESC,
  cleanUrls: true,
  lastUpdated: true,
  appearance: false,
  ignoreDeadLinks: [
    // Allow internal links while parallel content authors complete subpages
    /^\/(airport|pricing|brands|vpn|clients|ai-media|routes|guides|troubleshooting|security)\//,
  ],

  head: [
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: 'data:image/png;base64,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' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon.png?v=20261124' }],
    ['link', { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico?v=20261124' }],
    ['link', { rel: 'shortcut icon', href: '/favicon.ico?v=20261124' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg?v=20261124' }],
    ['link', { rel: 'alternate icon', type: 'image/webp', href: '/images/site-avatar.webp?v=20261124' }],
    ['link', { rel: 'apple-touch-icon', href: '/favicon.png?v=20261124' }],
    ['meta', { name: 'theme-color', content: '#2B5B6C' }],
    ['meta', { property: 'og:site_name', content: SITE_NAME }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ...(GOOGLE_SITE_VERIFICATION
      ? ([['meta', { name: 'google-site-verification', content: GOOGLE_SITE_VERIFICATION }]] as HeadConfig[])
      : []),
    ...(BING_SITE_VERIFICATION
      ? ([['meta', { name: 'msvalidate.01', content: BING_SITE_VERIFICATION }]] as HeadConfig[])
      : []),
    ...(BAIDU_SITE_VERIFICATION
      ? ([['meta', { name: 'baidu-site-verification', content: BAIDU_SITE_VERIFICATION }]] as HeadConfig[])
      : []),
    ...(SHENMA_SITE_VERIFICATION
      ? ([['meta', { name: 'shenma-site-verification', content: SHENMA_SITE_VERIFICATION }]] as HeadConfig[])
      : []),
  ],

  markdown: {
    lineNumbers: false,
    image: {
      lazyLoading: true,
    },
  },

  sitemap: {
    hostname: SITE_URL,
    transformItems: (items) =>
      items.filter((item) => {
        const normalized = normalizeSitemapUrl(item.url)
        if (excludedUrls.has(normalized) || normalized === '/404') return false
        return true
      }),
  },

  transformPageData(pageData) {
    const fm = pageData.frontmatter || {}
    const canonicalPath = toCanonicalPath(pageData.relativePath)
    const canonicalUrl = `${SITE_URL}${canonicalPath}`
    const isDraftOrNoindex =
      fm.draft === true || fm.noindex === true || pageData.isNotFound === true

    const head: HeadConfig[] = Array.isArray(fm.head) ? [...fm.head] : []

    if (isDraftOrNoindex) {
      excludedUrls.add(normalizeSitemapUrl(canonicalPath))
      head.push(['meta', { name: 'robots', content: 'noindex, nofollow' }])
    } else {
      head.push(['link', { rel: 'canonical', href: canonicalUrl }])
      head.push([
        'meta',
        {
          property: 'og:type',
          content: pageData.relativePath === 'index.md' ? 'website' : 'article',
        },
      ])
      head.push([
        'meta',
        { property: 'og:title', content: String(fm.title || pageData.title || SITE_NAME) },
      ])
      head.push([
        'meta',
        {
          property: 'og:description',
          content: String(fm.description || pageData.description || SITE_DESC),
        },
      ])
      head.push(['meta', { property: 'og:url', content: canonicalUrl }])
      if (typeof fm.image === 'string' && fm.image.trim()) {
        const imgUrl = fm.image.startsWith('http') ? fm.image : `${SITE_URL}${fm.image}`
        head.push(['meta', { property: 'og:image', content: imgUrl }])
      }

      const jsonLdList = buildStructuredData(pageData, canonicalUrl)
      for (const schema of jsonLdList) {
        head.push(['script', { type: 'application/ld+json' }, JSON.stringify(schema)])
      }
    }

    pageData.frontmatter.head = head
  },

  transformHtml(code) {
    // Ensure VitePress VPDoc main article content is indexed by Pagefind
    return code.replace('<main class="main"', '<main class="main" data-pagefind-body')
  },

  themeConfig: {
    siteTitle: SITE_NAME,
    logo: { src: '/images/site-avatar.webp', alt: '代理排障 Logo' },
    nav: NAV_CATEGORIES.map((c) => ({
      text: c.text,
      link: c.link,
      items: c.items.map((s) => ({ text: s.text, link: s.link })),
    })),
    sidebar: buildVitepressSidebar(),
    outline: {
      level: [2, 3],
      label: '本页目录',
    },
    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },
    lastUpdated: {
      text: '最近核验更新',
      formatOptions: {
        dateStyle: 'medium',
      },
    },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '专题目录',
    darkModeSwitchLabel: '外观',
  },
})
