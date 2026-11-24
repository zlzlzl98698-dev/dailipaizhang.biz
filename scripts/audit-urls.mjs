import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  DOCS_DIR,
  DIST_DIR,
  DATA_DIR,
  EXPECTED_PILLAR_ROUTES,
  EXPECTED_BRAND_SLUGS,
  GOVERNANCE_ROUTES,
  SITE_ORIGIN,
  walkFiles,
  toPosix,
  mdFileToRoute,
  htmlFileToRoute,
  normalizeRoute,
  parseMarkdown,
  stripMarkdownCodeBlocks,
  printSectionResult,
} from './qa-utils.mjs'

function extractNavRoutes() {
  const navPath = path.join(DOCS_DIR, '.vitepress', 'nav.ts')
  if (!fs.existsSync(navPath)) {
    return { pillarRoutes: [], secondaryRoutes: [], error: 'Missing docs/.vitepress/nav.ts' }
  }
  const content = fs.readFileSync(navPath, 'utf8')
  const navBlockMatch = /export const NAV_CATEGORIES[\s\S]*?=\s*(\[[\s\S]*?\n\])/.exec(content)
  if (!navBlockMatch) {
    return { pillarRoutes: [], secondaryRoutes: [], error: 'Unable to parse NAV_CATEGORIES in docs/.vitepress/nav.ts' }
  }
  const block = navBlockMatch[1]
  const pillarRoutes = []
  const secondaryRoutes = []

  // Top-level category links have 4-space indentation; sub-items have 6+ spaces / inside items: [...]
  for (const line of block.split('\n')) {
    const pillarMatch = /^\s{4}link:\s*['"]([^'"]+)['"]/.exec(line)
    if (pillarMatch) {
      pillarRoutes.push(pillarMatch[1])
      continue
    }
    const itemMatch = /link:\s*['"]([^'"]+)['"]/.exec(line)
    if (itemMatch && line.includes('{')) {
      secondaryRoutes.push(itemMatch[1])
    }
  }
  return { pillarRoutes, secondaryRoutes, error: null }
}

function collectKnownComponentAndDataLinks() {
  const referenced = new Set()
  const scanDirs = [
    path.join(DOCS_DIR, '.vitepress', 'theme'),
    DATA_DIR,
  ]
  const routePattern = /['"`](\/(?:airport|pricing|brands|vpn|clients|ai-media|routes|guides|troubleshooting|security|reviews|compare|disclosure|methodology|about)[^'"`\s#?]*)['"`]/g
  for (const dir of scanDirs) {
    const files = walkFiles(dir, (p) => /\.(vue|ts|mts|js|mjs|json)$/i.test(p), new Set(['node_modules', 'dist', 'cache']))
    for (const file of files) {
      const raw = fs.readFileSync(file, 'utf8')
      let m
      while ((m = routePattern.exec(raw)) !== null) {
        referenced.add(normalizeRoute(m[1]))
      }
    }
  }
  return referenced
}

function resolveRouteToMarkdown(route, routeSet) {
  const norm = normalizeRoute(route)
  if (routeSet.has(norm)) return true
  return false
}

export async function runAuditUrls(options = {}) {
  const sourceOnly = options.sourceOnly ?? process.argv.includes('--source-only')
  const errors = []
  const warnings = []

  const mdFiles = walkFiles(DOCS_DIR, (p) => p.endsWith('.md'))
  const routeToFiles = new Map()
  const mdParsed = new Map()

  for (const file of mdFiles) {
    const rel = toPosix(path.relative(DOCS_DIR, file))
    if (rel === '404.md') continue
    const route = normalizeRoute(mdFileToRoute(file))
    if (!routeToFiles.has(route)) routeToFiles.set(route, [])
    routeToFiles.get(route).push(rel)

    const raw = fs.readFileSync(file, 'utf8')
    mdParsed.set(file, { rel, route, ...parseMarkdown(raw) })
  }

  // 1. Duplicate routes / slugs
  for (const [route, files] of routeToFiles.entries()) {
    if (files.length > 1) {
      errors.push(`Duplicate route "${route}" produced by: ${files.join(', ')}`)
    }
  }

  // 2. Nav routes check (10 pillars + 60 secondary topics)
  const { pillarRoutes, secondaryRoutes, error: navErr } = extractNavRoutes()
  if (navErr) {
    errors.push(navErr)
  } else {
    if (pillarRoutes.length !== 10) {
      errors.push(`Expected 10 primary pillar routes in nav.ts, found ${pillarRoutes.length}`)
    }
    if (secondaryRoutes.length !== 60) {
      errors.push(`Expected 60 secondary topic routes in nav.ts, found ${secondaryRoutes.length}`)
    }
    for (const p of EXPECTED_PILLAR_ROUTES) {
      if (!pillarRoutes.map(normalizeRoute).includes(normalizeRoute(p))) {
        errors.push(`Missing expected pillar route in nav.ts: ${p}`)
      }
    }
    for (const route of [...pillarRoutes, ...secondaryRoutes]) {
      if (!resolveRouteToMarkdown(route, routeToFiles)) {
        errors.push(`Missing Markdown page for nav route: ${route}`)
      }
    }
  }

  // 3. Home + Governance pages
  if (!routeToFiles.has('/')) {
    errors.push('Missing home page: docs/index.md')
  }
  for (const gov of GOVERNANCE_ROUTES) {
    if (!routeToFiles.has(normalizeRoute(gov))) {
      errors.push(`Missing governance page: docs${gov}.md`)
    }
  }

  // 4. 31 Brand pages
  const missingBrands = []
  for (const slug of EXPECTED_BRAND_SLUGS) {
    if (!routeToFiles.has(`/brands/${slug}`)) {
      missingBrands.push(slug)
    }
  }
  if (missingBrands.length > 0) {
    errors.push(`Missing ${missingBrands.length} brand pages: ${missingBrands.join(', ')}`)
  }

  // Check duplicate slugs inside docs/brands/*
  const brandsDir = path.join(DOCS_DIR, 'brands')
  if (fs.existsSync(brandsDir)) {
    const brandDirs = fs.readdirSync(brandsDir, { withFileTypes: true }).filter((d) => d.isDirectory())
    const seen = new Set()
    for (const d of brandDirs) {
      if (seen.has(d.name)) errors.push(`Duplicate brand directory slug: ${d.name}`)
      seen.add(d.name)
    }
  }

  // 5. Troubleshooting articles (>= 24)
  const tsArticles = mdFiles.filter((f) => {
    const rel = toPosix(path.relative(DOCS_DIR, f))
    return rel.startsWith('troubleshooting/articles/') && rel !== 'troubleshooting/articles/index.md'
  })
  if (tsArticles.length < 24) {
    errors.push(`Expected at least 24 troubleshooting articles under docs/troubleshooting/articles/, found ${tsArticles.length}`)
  }

  // 6. Internal Markdown link validation + Inbound link graph for orphan detection
  const inboundCount = new Map()
  for (const route of routeToFiles.keys()) {
    inboundCount.set(route, 0)
  }
  for (const r of [...pillarRoutes, ...secondaryRoutes, ...GOVERNANCE_ROUTES, '/']) {
    const nr = normalizeRoute(r)
    if (inboundCount.has(nr)) inboundCount.set(nr, inboundCount.get(nr) + 1)
  }
  const componentRefs = collectKnownComponentAndDataLinks()
  for (const r of componentRefs) {
    if (inboundCount.has(r)) inboundCount.set(r, inboundCount.get(r) + 1)
  }

  const mdLinkRegex = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g
  const htmlHrefRegex = /\bhref=["']([^"']+)["']/g
  let checkedInternalLinks = 0

  for (const [file, info] of mdParsed.entries()) {
    const bodyNoCode = stripMarkdownCodeBlocks(info.body)
    const links = []
    let m
    while ((m = mdLinkRegex.exec(bodyNoCode)) !== null) {
      links.push(m[1])
    }
    while ((m = htmlHrefRegex.exec(bodyNoCode)) !== null) {
      links.push(m[1])
    }

    for (const rawTarget of links) {
      if (
        !rawTarget ||
        rawTarget.startsWith('#') ||
        rawTarget.startsWith('http://') ||
        rawTarget.startsWith('https://') ||
        rawTarget.startsWith('mailto:') ||
        rawTarget.startsWith('tel:') ||
        rawTarget.startsWith('javascript:') ||
        rawTarget.startsWith('data:')
      ) {
        continue
      }

      const cleanTarget = rawTarget.split('#')[0].split('?')[0]
      if (!cleanTarget) continue

      // Static asset links under /images/ or public files
      if (/\.(png|jpe?g|webp|gif|svg|ico|pdf|json|xml|txt)$/i.test(cleanTarget)) {
        const assetRel = cleanTarget.startsWith('/') ? cleanTarget.slice(1) : path.posix.join(path.posix.dirname(info.rel), cleanTarget)
        const publicAsset = path.join(DOCS_DIR, 'public', assetRel)
        if (!fs.existsSync(publicAsset)) {
          errors.push(`Dead asset link "${rawTarget}" in ${info.rel}`)
        }
        continue
      }

      checkedInternalLinks++
      let resolvedRoute
      if (cleanTarget.startsWith('/')) {
        resolvedRoute = normalizeRoute(cleanTarget)
      } else {
        const baseDir = info.rel.endsWith('/index.md') || info.rel === 'index.md' ? info.route : path.posix.dirname(info.route)
        const joined = path.posix.resolve(baseDir === '/' ? '/' : baseDir + '/', cleanTarget)
        resolvedRoute = normalizeRoute(joined)
      }

      if (!routeToFiles.has(resolvedRoute)) {
        errors.push(`Dead internal Markdown link "${rawTarget}" (resolved "${resolvedRoute}") in ${info.rel}`)
      } else if (resolvedRoute !== info.route) {
        inboundCount.set(resolvedRoute, (inboundCount.get(resolvedRoute) ?? 0) + 1)
      }
    }
  }

  // Brand pages are accessible via BrandDirectory component on /brands/ and /brands/directory/
  // Troubleshooting articles should also be linked from /troubleshooting/ or secondary pages or DiagnosticTriage
  const orphanPages = []
  for (const [route, count] of inboundCount.entries()) {
    if (count === 0) {
      orphanPages.push(route)
    }
  }
  if (orphanPages.length > 0) {
    errors.push(`Found ${orphanPages.length} orphan page(s) with 0 inbound links from nav/pages/components: ${orphanPages.join(', ')}`)
  }

  // 7. Post-build canonical vs sitemap.xml consistency
  let sitemapUrlCount = 0
  let canonicalChecked = 0
  if (!sourceOnly) {
    if (!fs.existsSync(DIST_DIR)) {
      errors.push('Build output directory docs/.vitepress/dist does not exist (run npm run build first, or pass --source-only)')
    } else {
      const sitemapPath = path.join(DIST_DIR, 'sitemap.xml')
      if (!fs.existsSync(sitemapPath)) {
        errors.push('Missing docs/.vitepress/dist/sitemap.xml')
      } else {
        const sitemapXml = fs.readFileSync(sitemapPath, 'utf8')
        const sitemapUrls = new Set()
        const locRegex = /<loc>\s*([^<\s]+)\s*<\/loc>/g
        let m
        while ((m = locRegex.exec(sitemapXml)) !== null) {
          sitemapUrls.add(normalizeRoute(m[1]))
        }
        sitemapUrlCount = sitemapUrls.size

        const htmlFiles = walkFiles(DIST_DIR, (p) => p.endsWith('.html'), new Set(['pagefind', 'assets']))
        const indexableHtmlRoutes = new Set()

        for (const htmlFile of htmlFiles) {
          const relHtml = toPosix(path.relative(DIST_DIR, htmlFile))
          if (relHtml === '404.html') continue
          const html = fs.readFileSync(htmlFile, 'utf8')
          const robotsMeta = /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i.exec(html) ||
            /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']robots["']/i.exec(html)
          const isNoindex = robotsMeta && robotsMeta[1].toLowerCase().includes('noindex')

          const route = normalizeRoute(htmlFileToRoute(htmlFile))
          const canonicalMatch = /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i.exec(html) ||
            /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i.exec(html)

          if (isNoindex) {
            if (sitemapUrls.has(route)) {
              errors.push(`Noindex page "${route}" must NOT appear in sitemap.xml`)
            }
            continue
          }

          indexableHtmlRoutes.add(route)
          if (!canonicalMatch) {
            errors.push(`Missing <link rel="canonical"> in ${relHtml}`)
            continue
          }
          canonicalChecked++
          const canonicalHref = canonicalMatch[1].trim()
          if (!canonicalHref.startsWith(SITE_ORIGIN)) {
            errors.push(`Canonical URL "${canonicalHref}" in ${relHtml} does not start with ${SITE_ORIGIN}`)
            continue
          }
          const canonicalRoute = normalizeRoute(canonicalHref)
          if (canonicalRoute !== route) {
            errors.push(`Canonical mismatch in ${relHtml}: expected route "${route}", got "${canonicalRoute}" (${canonicalHref})`)
          }
          if (!sitemapUrls.has(canonicalRoute)) {
            errors.push(`Indexable page "${canonicalRoute}" (${relHtml}) missing from sitemap.xml`)
          }
        }

        for (const smRoute of sitemapUrls) {
          if (!indexableHtmlRoutes.has(smRoute)) {
            errors.push(`sitemap.xml contains URL "${smRoute}" that has no matching indexable HTML page in dist/`)
          }
        }
      }
    }
  }

  return printSectionResult('audit:urls', {
    errors,
    warnings,
    stats: {
      markdownPages: routeToFiles.size,
      pillarRoutes: pillarRoutes.length,
      secondaryRoutes: secondaryRoutes.length,
      brandPagesFound: EXPECTED_BRAND_SLUGS.length - missingBrands.length,
      troubleshootingArticles: tsArticles.length,
      internalLinksChecked: checkedInternalLinks,
      sitemapUrls: sitemapUrlCount,
      canonicalsChecked: canonicalChecked,
    },
  })
}

if (path.resolve(process.argv[1] || '') === fileURLToPath(import.meta.url)) {
  const res = await runAuditUrls()
  if (res.errors.length > 0) process.exit(1)
}
