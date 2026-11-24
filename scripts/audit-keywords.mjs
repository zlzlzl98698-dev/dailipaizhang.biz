import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  DOCS_DIR,
  DATA_DIR,
  walkFiles,
  toPosix,
  mdFileToRoute,
  normalizeRoute,
  parseMarkdown,
  extractH1,
  parseCsv,
  printSectionResult,
} from './qa-utils.mjs'

function normalizeTextKey(val) {
  return String(val ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

export async function runAuditKeywords() {
  const errors = []
  const warnings = []

  const mdFiles = walkFiles(DOCS_DIR, (p) => p.endsWith('.md'))
  const indexablePages = []

  const titleMap = new Map()
  const descMap = new Map()
  const h1Map = new Map()
  const kwMap = new Map()

  for (const file of mdFiles) {
    const rel = toPosix(path.relative(DOCS_DIR, file))
    if (rel === '404.md') continue
    const raw = fs.readFileSync(file, 'utf8')
    const { frontmatter, body } = parseMarkdown(raw)

    if (frontmatter.noindex === true || frontmatter.draft === true || frontmatter.published === false) {
      continue
    }

    const route = normalizeRoute(mdFileToRoute(file))
    const title = typeof frontmatter.title === 'string' ? frontmatter.title.trim() : ''
    const description = typeof frontmatter.description === 'string' ? frontmatter.description.trim() : ''
    const h1 = extractH1(body, frontmatter)
    const primaryKeyword = typeof frontmatter.primaryKeyword === 'string' ? frontmatter.primaryKeyword.trim() : ''

    if (!title) errors.push(`Missing frontmatter "title" in ${rel}`)
    if (!description) errors.push(`Missing frontmatter "description" in ${rel}`)
    if (!h1) errors.push(`Missing H1 heading in ${rel}`)
    if (!primaryKeyword) {
      errors.push(`Missing frontmatter "primaryKeyword" in ${rel}`)
    }

    if (title) {
      const k = normalizeTextKey(title)
      if (!titleMap.has(k)) titleMap.set(k, [])
      titleMap.get(k).push(rel)
    }
    if (description) {
      const k = normalizeTextKey(description)
      if (!descMap.has(k)) descMap.set(k, [])
      descMap.get(k).push(rel)
    }
    if (h1) {
      const k = normalizeTextKey(h1)
      if (!h1Map.has(k)) h1Map.set(k, [])
      h1Map.get(k).push(rel)
    }
    if (primaryKeyword) {
      const k = normalizeTextKey(primaryKeyword)
      if (!kwMap.has(k)) kwMap.set(k, [])
      kwMap.get(k).push(rel)
    }

    indexablePages.push({ rel, route, title, description, h1, primaryKeyword })
  }

  for (const [val, files] of titleMap.entries()) {
    if (files.length > 1) errors.push(`Duplicate title "${val}" in: ${files.join(', ')}`)
  }
  for (const [val, files] of descMap.entries()) {
    if (files.length > 1) errors.push(`Duplicate description in: ${files.join(', ')}`)
  }
  for (const [val, files] of h1Map.entries()) {
    if (files.length > 1) errors.push(`Duplicate H1 "${val}" in: ${files.join(', ')}`)
  }
  for (const [val, files] of kwMap.entries()) {
    if (files.length > 1) errors.push(`Duplicate primaryKeyword "${val}" in: ${files.join(', ')}`)
  }

  // Check data/keyword-matrix.csv
  const matrixPath = path.join(DATA_DIR, 'keyword-matrix.csv')
  let matrixRows = 0
  let uniqueMatrixUrls = 0
  let cannibalizationCount = 0

  if (!fs.existsSync(matrixPath)) {
    errors.push('Missing data/keyword-matrix.csv')
  } else {
    const csvRaw = fs.readFileSync(matrixPath, 'utf8')
    const { headers, records } = parseCsv(csvRaw)
    matrixRows = records.length

    const requiredCols = ['keyword', 'normalized_keyword', 'intent', 'primary_url', 'cluster_id', 'status']
    for (const col of requiredCols) {
      if (!headers.includes(col)) {
        errors.push(`keyword-matrix.csv missing required column "${col}"`)
      }
    }

    const kwToUrls = new Map()
    const urlSet = new Set()

    for (let idx = 0; idx < records.length; idx++) {
      const row = records[idx]
      const normKw = normalizeTextKey(row.normalized_keyword || row.keyword)
      const primaryUrl = normalizeRoute(row.primary_url || '')
      if (!normKw || !row.primary_url) {
        errors.push(`keyword-matrix.csv row ${idx + 2} missing keyword or primary_url`)
        continue
      }

      urlSet.add(primaryUrl)
      if (!kwToUrls.has(normKw)) kwToUrls.set(normKw, new Set())
      kwToUrls.get(normKw).add(primaryUrl)
    }

    uniqueMatrixUrls = urlSet.size

    // Cannibalization: one normalized_keyword mapped to >1 primary_url
    for (const [kw, urls] of kwToUrls.entries()) {
      if (urls.size > 1) {
        cannibalizationCount++
        errors.push(`Keyword cannibalization in keyword-matrix.csv: "${kw}" maps to multiple URLs: ${[...urls].join(', ')}`)
      }
    }

    // Check orphan pages (indexable pages missing from keyword-matrix.csv) vs stale matrix URLs
    const indexableRouteSet = new Set(indexablePages.map((p) => p.route))
    const exemptFromMatrix = new Set(['/', '/disclosure', '/methodology', '/about'])

    for (const page of indexablePages) {
      if (exemptFromMatrix.has(page.route)) continue
      if (!urlSet.has(page.route)) {
        errors.push(`Orphan page not covered in keyword-matrix.csv: ${page.route} (${page.rel})`)
      }
    }

    for (const row of records) {
      const status = (row.status || '').toLowerCase()
      const targetUrl = normalizeRoute(row.primary_url || '')
      if ((status === 'published' || status === 'active' || status === 'ready') && !indexableRouteSet.has(targetUrl)) {
        errors.push(`keyword-matrix.csv references published/active URL "${row.primary_url}" that has no indexable Markdown page`)
      }
    }
  }

  return printSectionResult('audit:keywords', {
    errors,
    warnings,
    stats: {
      indexablePages: indexablePages.length,
      uniqueTitles: titleMap.size,
      uniqueDescriptions: descMap.size,
      uniqueH1s: h1Map.size,
      uniquePrimaryKeywords: kwMap.size,
      keywordMatrixRows: matrixRows,
      uniqueMatrixUrls,
      cannibalizationConflicts: cannibalizationCount,
    },
  })
}

if (path.resolve(process.argv[1] || '') === fileURLToPath(import.meta.url)) {
  const res = await runAuditKeywords()
  if (res.errors.length > 0) process.exit(1)
}
