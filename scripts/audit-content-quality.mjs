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
  stripMarkdownCodeBlocks,
  printSectionResult,
} from './qa-utils.mjs'

function normalizeTextKey(val) {
  return String(val ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function computeShingleSimilarity(strA, strB, k = 4) {
  if (!strA || !strB) return 0
  const cleanA = strA.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '')
  const cleanB = strB.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '')
  if (cleanA.length < k || cleanB.length < k) return 0

  const setA = new Set()
  for (let i = 0; i <= cleanA.length - k; i += 2) {
    setA.add(cleanA.slice(i, i + k))
  }
  const setB = new Set()
  for (let i = 0; i <= cleanB.length - k; i += 2) {
    setB.add(cleanB.slice(i, i + k))
  }

  let intersection = 0
  for (const item of setA) {
    if (setB.has(item)) intersection++
  }
  const union = setA.size + setB.size - intersection
  return union === 0 ? 0 : intersection / union
}

export async function runAuditContentQuality(options = {}) {
  const errors = []
  const warnings = []

  const mdFiles = walkFiles(DOCS_DIR, (p) => p.endsWith('.md'))
  const indexablePages = []

  const titleMap = new Map()
  const h1Map = new Map()
  const kwMap = new Map()
  const descMap = new Map()

  let checkedPages = 0
  let faqConsistencyChecked = 0
  let similarityChecked = 0

  for (const file of mdFiles) {
    const rel = toPosix(path.relative(DOCS_DIR, file))
    if (rel === '404.md') continue
    const raw = fs.readFileSync(file, 'utf8')
    const { frontmatter, body } = parseMarkdown(raw)

    if (frontmatter.noindex === true || frontmatter.draft === true || frontmatter.published === false) {
      continue
    }

    checkedPages++
    const route = normalizeRoute(mdFileToRoute(file))
    const title = typeof frontmatter.title === 'string' ? frontmatter.title.trim() : ''
    const description = typeof frontmatter.description === 'string' ? frontmatter.description.trim() : ''
    const h1 = extractH1(body, frontmatter)
    const primaryKeyword = typeof frontmatter.primaryKeyword === 'string' ? frontmatter.primaryKeyword.trim() : ''

    // 1. Missing Core SEO Metadata
    if (!title) errors.push(`[Missing Title] in ${rel}`)
    if (!description) errors.push(`[Missing Description] in ${rel}`)
    if (!h1) errors.push(`[Missing H1 Heading] in ${rel}`)
    if (!primaryKeyword) errors.push(`[Missing primaryKeyword] in ${rel}`)

    // 2. Uniqueness Checks
    if (title) {
      const k = normalizeTextKey(title)
      if (!titleMap.has(k)) titleMap.set(k, [])
      titleMap.get(k).push(rel)
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
    if (description) {
      const k = normalizeTextKey(description)
      if (!descMap.has(k)) descMap.set(k, [])
      descMap.get(k).push(rel)
    }

    // 3. Blank / Stub Page Check (minimum body content & placeholder detection)
    const bodyNoCode = stripMarkdownCodeBlocks(body).trim()
    const cjkChars = (bodyNoCode.match(/[\u4e00-\u9fa5]/g) || []).length

    // Regular articles should have at least 800 CJK chars; hub / index pages at least 300 CJK chars
    // docs/index.md renders via <HomePage /> component
    const isRootHome = rel === 'index.md'
    const isHub = rel.endsWith('index.md')
    const minCjk = isRootHome ? 0 : isHub ? 300 : 800

    if (!isRootHome && cjkChars < minCjk) {
      errors.push(`[Blank/Stub Content] ${rel} only has ${cjkChars} Chinese characters (minimum expected: ${minCjk})`)
    }

    if (/\b(?:TODO|TBD|占位|待写|文章大纲待填充)\b/i.test(bodyNoCode)) {
      errors.push(`[Placeholder Marker] Found unfinished placeholder markers (TODO/TBD/占位) in ${rel}`)
    }

    // 4. Schema & FAQ consistency check
    if (Array.isArray(frontmatter.faq) && frontmatter.faq.length > 0) {
      faqConsistencyChecked++
      const faqHeadings = []
      const headingRegex = /^###\s+(.+)$/gm
      let m
      while ((m = headingRegex.exec(body)) !== null) {
        faqHeadings.push(m[1].trim())
      }

      for (const faqItem of frontmatter.faq) {
        const q = typeof faqItem.q === 'string' ? faqItem.q.trim() : ''
        if (q) {
          const matched = faqHeadings.some((h) => h === q || h.includes(q) || q.includes(h))
          if (!matched) {
            errors.push(`[FAQ Schema Mismatch] Question "${q}" in frontmatter.faq not found as "### ${q}" heading in ${rel}`)
          }
        }
      }
    }

    // 5. Price Caliber Consistency Check
    // Prevent misleading marketing claims that portray annual discount as uncommitted monthly price
    if (/5\.6\s*元\s*[\/每]\s*月/i.test(bodyNoCode)) {
      if (!/(?:年付|季付|折合|一次性|折算)/.test(bodyNoCode)) {
        warnings.push(`[Price Caliber Warning] Mentions "5.6元/月" without explicitly clarifying annual/quarterly billing in ${rel}`)
      }
    }
    if (/7\s*元\s*[\/每]\s*月/i.test(bodyNoCode)) {
      if (!/(?:年付|折合|一次性|折算|清风|学生)/.test(bodyNoCode)) {
        warnings.push(`[Price Caliber Warning] Mentions "7元/月" without clarifying annual billing requirement in ${rel}`)
      }
    }

    indexablePages.push({ rel, route, title, h1, primaryKeyword, bodyNoCode })
  }

  // Report Duplicate Titles
  for (const [val, files] of titleMap.entries()) {
    if (files.length > 1) errors.push(`[Duplicate Title] "${val}" in: ${files.join(', ')}`)
  }

  // Report Duplicate H1s
  for (const [val, files] of h1Map.entries()) {
    if (files.length > 1) errors.push(`[Duplicate H1] "${val}" in: ${files.join(', ')}`)
  }

  // Report Duplicate primaryKeywords (Cannibalization)
  for (const [val, files] of kwMap.entries()) {
    if (files.length > 1) errors.push(`[Keyword Cannibalization] "${val}" contested by: ${files.join(', ')}`)
  }

  // Report Duplicate Descriptions
  for (const [val, files] of descMap.entries()) {
    if (files.length > 1) warnings.push(`[Duplicate Description] in: ${files.join(', ')}`)
  }

  // 6. Content Similarity Audit (check for identical/templated pages within same directories)
  const byDir = new Map()
  for (const p of indexablePages) {
    const dir = path.posix.dirname(p.rel)
    if (!byDir.has(dir)) byDir.set(dir, [])
    byDir.get(dir).push(p)
  }

  for (const [dir, pages] of byDir.entries()) {
    if (pages.length < 2) continue
    for (let i = 0; i < pages.length; i++) {
      for (let j = i + 1; j < pages.length; j++) {
        similarityChecked++
        const sim = computeShingleSimilarity(pages[i].bodyNoCode, pages[j].bodyNoCode, 6)
        if (sim > 0.85) {
          errors.push(
            `[High Text Similarity] Pages in "${dir}" (${pages[i].rel} and ${pages[j].rel}) share ${(sim * 100).toFixed(1)}% content similarity (templated content threshold 85%)`
          )
        }
      }
    }
  }

  return printSectionResult('audit:content-quality', {
    errors,
    warnings,
    stats: {
      checkedPages,
      uniqueTitles: titleMap.size,
      uniqueH1s: h1Map.size,
      uniquePrimaryKeywords: kwMap.size,
      faqConsistencyChecked,
      similarityPairsChecked: similarityChecked,
    },
  })
}

if (path.resolve(process.argv[1] || '') === fileURLToPath(import.meta.url)) {
  const res = await runAuditContentQuality()
  if (res.errors.length > 0) process.exit(1)
}
