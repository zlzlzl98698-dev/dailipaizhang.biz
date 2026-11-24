import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  DOCS_DIR,
  DIST_DIR,
  DATA_DIR,
  EXPECTED_BRAND_SLUGS,
  walkFiles,
  toPosix,
  parseMarkdown,
  stripMarkdownCodeBlocks,
  printSectionResult,
} from './qa-utils.mjs'

const REQUIRED_REL_TOKENS = ['nofollow', 'sponsored', 'noopener', 'noreferrer']
const ALLOWED_EVIDENCE_STATUS = new Set(['measured', 'vendor', 'third_party', 'historical', 'unknown', 'example'])

function extractHostname(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return ''
  const trimmed = rawUrl.trim()
  if (!/^https?:\/\//i.test(trimmed)) return ''
  try {
    return new URL(trimmed).hostname.toLowerCase()
  } catch {
    const m = /^https?:\/\/([^/:?#]+)/i.exec(trimmed)
    return m ? m[1].toLowerCase() : ''
  }
}

export async function runAuditBrands(options = {}) {
  const sourceOnly = options.sourceOnly ?? process.argv.includes('--source-only')
  const errors = []
  const warnings = []

  const brandsPath = path.join(DATA_DIR, 'brands.json')
  if (!fs.existsSync(brandsPath)) {
    errors.push('Missing data/brands.json')
    return printSectionResult('audit:brands', { errors, warnings, stats: {} })
  }

  let brandsRaw
  try {
    brandsRaw = JSON.parse(fs.readFileSync(brandsPath, 'utf8'))
  } catch (err) {
    errors.push(`Invalid JSON in data/brands.json: ${err.message}`)
    return printSectionResult('audit:brands', { errors, warnings, stats: {} })
  }

  const brands = Array.isArray(brandsRaw) ? brandsRaw : brandsRaw?.brands
  if (!Array.isArray(brands)) {
    errors.push('data/brands.json must export an array of brands (or { brands: [...] })')
    return printSectionResult('audit:brands', { errors, warnings, stats: {} })
  }

  // 1. Check exact 31 deduplicated brands
  const slugSet = new Set()
  const duplicateSlugs = []
  for (const b of brands) {
    if (!b?.slug) {
      errors.push(`Brand entry missing slug (id=${b?.id ?? 'unknown'}, name=${b?.name ?? 'unknown'})`)
      continue
    }
    if (slugSet.has(b.slug)) duplicateSlugs.push(b.slug)
    slugSet.add(b.slug)
  }
  if (duplicateSlugs.length > 0) {
    errors.push(`Duplicate brand slugs in data/brands.json: ${duplicateSlugs.join(', ')}`)
  }
  if (brands.length !== 31) {
    errors.push(`Expected 31 deduplicated brands in data/brands.json, found ${brands.length}`)
  }

  const missingSlugs = EXPECTED_BRAND_SLUGS.filter((s) => !slugSet.has(s))
  const extraSlugs = [...slugSet].filter((s) => !EXPECTED_BRAND_SLUGS.includes(s))
  if (missingSlugs.length > 0) errors.push(`Missing brand slugs in brands.json: ${missingSlugs.join(', ')}`)
  if (extraSlugs.length > 0) errors.push(`Unexpected brand slugs in brands.json: ${extraSlugs.join(', ')}`)

  // 2. Check fields, source status, and collect AFF domains/URLs
  const affUrls = new Set()
  const affHosts = new Set()
  let unverifiedAnnotated = 0

  const requiredFields = [
    'id',
    'name',
    'slug',
    'officialUrl',
    'affiliateUrl',
    'affiliateDisclosure',
    'evidenceStatus',
    'sourceRefs',
    'conflicts',
    'verifiedAt',
    'updatedAt',
  ]

  for (const b of brands) {
    for (const f of requiredFields) {
      if (b[f] === undefined || b[f] === null || (typeof b[f] === 'string' && b[f].trim() === '')) {
        // Allow affiliateUrl empty only if explicitly flagged, otherwise warn/error
        if (f === 'affiliateUrl' && b.affiliateUrlFlag) continue
        errors.push(`Brand "${b.slug || b.name}" missing required field "${f}"`)
      }
    }

    if (b.evidenceStatus && !ALLOWED_EVIDENCE_STATUS.has(b.evidenceStatus)) {
      errors.push(`Brand "${b.slug}" has invalid evidenceStatus "${b.evidenceStatus}"`)
    }

    // Ensure officialUrl is not secretly the affiliateUrl
    if (b.officialUrl && b.affiliateUrl && b.officialUrl.trim() === b.affiliateUrl.trim()) {
      errors.push(`Brand "${b.slug}" sets officialUrl equal to affiliateUrl (must stay "待核实" if unverified)`)
    }

    // Ensure unverified/historical/vendor brands have clear sourceRefs or qualityFlags
    if (b.officialUrl === '待核实' || b.evidenceStatus === 'unknown' || b.evidenceStatus === 'historical') {
      const hasAnnotation =
        (Array.isArray(b.sourceRefs) && b.sourceRefs.length > 0) ||
        (Array.isArray(b.qualityFlags) && b.qualityFlags.length > 0) ||
        Boolean(b.evidenceStatus)
      if (!hasAnnotation) {
        errors.push(`Brand "${b.slug}" has unverified data without sourceRefs/qualityFlags`)
      } else {
        unverifiedAnnotated++
      }
    }

    if (!b.affiliateDisclosure || !String(b.affiliateDisclosure).trim()) {
      errors.push(`Brand "${b.slug}" missing affiliateDisclosure`)
    }

    if (typeof b.affiliateUrl === 'string' && b.affiliateUrl.trim()) {
      affUrls.add(b.affiliateUrl.trim())
      const host = extractHostname(b.affiliateUrl)
      if (host) affHosts.add(host)
    }
  }

  // 3. Scan all Markdown files for hardcoded AFF domains / URLs
  const mdFiles = walkFiles(DOCS_DIR, (p) => p.endsWith('.md'))
  const genericAffPattern = /https?:\/\/[^\s)"'<>]+?(?:[?&](?:aff|code|invite|ref|r)=|register\?code=)[^\s)"'<>]*/gi
  let scannedMdCount = 0

  for (const file of mdFiles) {
    scannedMdCount++
    const rel = toPosix(path.relative(DOCS_DIR, file))
    const raw = fs.readFileSync(file, 'utf8')
    const { body } = parseMarkdown(raw)
    const bodyNoCode = stripMarkdownCodeBlocks(body)

    // Check full URL matches
    const urlMatches = bodyNoCode.match(/https?:\/\/[^\s)"'<>]+/gi) || []
    for (const foundUrl of urlMatches) {
      if (affUrls.has(foundUrl)) {
        errors.push(`Hardcoded affiliate URL "${foundUrl}" found in ${rel} (must use <AffiliateCta /> / data/links.ts)`)
        continue
      }
      const host = extractHostname(foundUrl)
      if (host && affHosts.has(host)) {
        errors.push(`Hardcoded affiliate domain "${host}" in URL "${foundUrl}" found in ${rel}`)
      }
    }

    // Also check bare domain mentions of affiliate hosts in Markdown body
    for (const host of affHosts) {
      if (bodyNoCode.toLowerCase().includes(host)) {
        errors.push(`Hardcoded affiliate registration domain "${host}" found in ${rel} (must not hardcode AFF domain in Markdown)`)
      }
    }

    // Check generic AFF query patterns
    let gm
    while ((gm = genericAffPattern.exec(bodyNoCode)) !== null) {
      errors.push(`Hardcoded registration/referral URL pattern "${gm[0]}" found in ${rel}`)
    }
  }

  // 4. Verify data/links.ts & AffiliateCta.vue compliance
  const linksTsPath = path.join(DATA_DIR, 'links.ts')
  if (!fs.existsSync(linksTsPath)) {
    errors.push('Missing data/links.ts')
  } else {
    const linksCode = fs.readFileSync(linksTsPath, 'utf8')
    for (const token of REQUIRED_REL_TOKENS) {
      if (!linksCode.includes(token)) {
        errors.push(`data/links.ts missing required rel token "${token}"`)
      }
    }
    if (!linksCode.includes('getBrandLink') || !linksCode.includes('getBrandBySlug') || !linksCode.includes('getAllBrands')) {
      errors.push('data/links.ts must export getBrandLink, getBrandBySlug, and getAllBrands')
    }
  }

  const ctaPath = path.join(DOCS_DIR, '.vitepress', 'theme', 'components', 'AffiliateCta.vue')
  if (!fs.existsSync(ctaPath)) {
    errors.push('Missing AffiliateCta.vue component')
  } else {
    const ctaCode = fs.readFileSync(ctaPath, 'utf8')
    if (!ctaCode.includes('links') && !ctaCode.includes('getBrandLink')) {
      warnings.push('AffiliateCta.vue does not appear to import from data/links.ts')
    }
    if (!ctaCode.includes('nofollow') && !ctaCode.includes('rel')) {
      errors.push('AffiliateCta.vue does not set rel attribute on affiliate links')
    }
  }

  // 5. Post-build HTML check for AFF links rel + disclosure + source status markers
  let builtBrandPagesChecked = 0
  let builtAffLinksChecked = 0
  if (!sourceOnly && fs.existsSync(DIST_DIR)) {
    const htmlFiles = walkFiles(DIST_DIR, (p) => p.endsWith('.html'), new Set(['pagefind', 'assets']))
    for (const htmlFile of htmlFiles) {
      const relHtml = toPosix(path.relative(DIST_DIR, htmlFile))
      const html = fs.readFileSync(htmlFile, 'utf8')
      const aTagRegex = /<a\b([^>]*)>/gi
      let m
      while ((m = aTagRegex.exec(html)) !== null) {
        const attrs = m[1]
        const hrefMatch = /\bhref=["']([^"']+)["']/i.exec(attrs)
        if (!hrefMatch) continue
        const href = hrefMatch[1]
        const host = extractHostname(href)
        if (affUrls.has(href) || (host && affHosts.has(host))) {
          builtAffLinksChecked++
          const relMatch = /\brel=["']([^"']+)["']/i.exec(attrs)
          const relTokens = relMatch ? relMatch[1].toLowerCase().split(/\s+/) : []
          for (const reqToken of REQUIRED_REL_TOKENS) {
            if (!relTokens.includes(reqToken)) {
              errors.push(`Built AFF link "${href}" in ${relHtml} missing rel token "${reqToken}"`)
            }
          }
          if (!/\btarget=["']_blank["']/i.test(attrs)) {
            errors.push(`Built AFF link "${href}" in ${relHtml} missing target="_blank"`)
          }
        }
      }

      // Check brand detail pages include disclosure & evidence marker
      const brandMatch = /^brands\/([^/]+)\/index\.html$/.exec(relHtml)
      if (brandMatch && EXPECTED_BRAND_SLUGS.includes(brandMatch[1])) {
        builtBrandPagesChecked++
        if (!html.includes('推广') && !html.includes('佣金') && !html.includes('披露') && !html.includes('affiliate')) {
          errors.push(`Brand page ${relHtml} missing visible affiliate disclosure text`)
        }
        if (
          !html.includes('实测') &&
          !html.includes('待核实') &&
          !html.includes('品牌资料') &&
          !html.includes('历史记录') &&
          !html.includes('证据')
        ) {
          errors.push(`Brand page ${relHtml} missing visible evidence/source status annotation`)
        }
      }
    }
  }

  return printSectionResult('audit:brands', {
    errors,
    warnings,
    stats: {
      totalBrands: brands.length,
      expectedBrandsPresent: EXPECTED_BRAND_SLUGS.length - missingSlugs.length,
      affiliateHostsTracked: affHosts.size,
      unverifiedBrandsAnnotated: unverifiedAnnotated,
      markdownFilesScanned: scannedMdCount,
      builtAffLinksChecked,
      builtBrandPagesChecked,
    },
  })
}

if (path.resolve(process.argv[1] || '') === fileURLToPath(import.meta.url)) {
  const res = await runAuditBrands()
  if (res.errors.length > 0) process.exit(1)
}
