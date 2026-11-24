import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  DIST_DIR,
  walkFiles,
  toPosix,
  extractVisibleTextFromHtml,
  decodeHtmlEntities,
  printSectionResult,
} from './qa-utils.mjs'

const ALLOWED_SCHEMA_TYPES = new Set([
  'Organization',
  'WebSite',
  'WebPage',
  'BreadcrumbList',
  'Article',
  'TechArticle',
  'SoftwareApplication',
  'FAQPage',
  'HowTo',
  'ItemList',
  'CollectionPage',
  'SearchAction',
  'Question',
  'Answer',
  'ListItem',
])

function normalizeForMatch(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]+/gu, '')
}

function collectTypedNodes(node, out = []) {
  if (!node || typeof node !== 'object') return out
  if (Array.isArray(node)) {
    for (const item of node) collectTypedNodes(item, out)
    return out
  }
  if (node['@type']) out.push(node)
  if (Array.isArray(node['@graph'])) {
    for (const g of node['@graph']) collectTypedNodes(g, out)
  }
  return out
}

export async function runValidateJsonLd() {
  const errors = []
  const warnings = []

  if (!fs.existsSync(DIST_DIR)) {
    errors.push('Missing docs/.vitepress/dist directory (run npm run build first)')
    return printSectionResult('validate:jsonld', { errors, warnings, stats: {} })
  }

  const htmlFiles = walkFiles(DIST_DIR, (p) => p.endsWith('.html'), new Set(['pagefind', 'assets']))
  const scriptRegex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi

  let totalScripts = 0
  let validScripts = 0
  let faqPagesChecked = 0
  let faqQuestionsChecked = 0
  const typeCounts = new Map()

  for (const htmlFile of htmlFiles) {
    const rel = toPosix(path.relative(DIST_DIR, htmlFile))
    if (rel === '404.html') continue

    const html = fs.readFileSync(htmlFile, 'utf8')
    const robotsMeta = /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i.exec(html) ||
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']robots["']/i.exec(html)
    const isNoindex = robotsMeta && robotsMeta[1].toLowerCase().includes('noindex')

    const visibleTextNorm = normalizeForMatch(extractVisibleTextFromHtml(html))
    let pageScripts = 0
    let m
    while ((m = scriptRegex.exec(html)) !== null) {
      pageScripts++
      totalScripts++
      const rawJson = decodeHtmlEntities(m[1]).trim()
      if (!rawJson) {
        errors.push(`Empty JSON-LD script in ${rel}`)
        continue
      }

      let parsed
      try {
        parsed = JSON.parse(rawJson)
      } catch (err) {
        errors.push(`Invalid JSON-LD syntax in ${rel}: ${err.message}`)
        continue
      }

      const rootContext = Array.isArray(parsed) ? parsed[0]?.['@context'] : parsed?.['@context']
      if (!rootContext || !String(rootContext).includes('schema.org')) {
        errors.push(`JSON-LD missing valid schema.org @context in ${rel}`)
      }

      const nodes = collectTypedNodes(parsed)
      if (nodes.length === 0) {
        errors.push(`JSON-LD block missing @type in ${rel}`)
        continue
      }

      validScripts++

      for (const node of nodes) {
        const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']]
        for (const t of types) {
          typeCounts.set(t, (typeCounts.get(t) ?? 0) + 1)
          if (!ALLOWED_SCHEMA_TYPES.has(t)) {
            warnings.push(`Uncommon @type "${t}" in ${rel}`)
          }
        }

        if (types.includes('FAQPage')) {
          faqPagesChecked++
          const entities = Array.isArray(node.mainEntity) ? node.mainEntity : []
          if (entities.length === 0) {
            errors.push(`FAQPage in ${rel} has empty mainEntity`)
          }
          for (const q of entities) {
            faqQuestionsChecked++
            const qText = q?.name || ''
            const aText = q?.acceptedAnswer?.text || ''
            if (!qText || !aText) {
              errors.push(`FAQPage Question in ${rel} missing name or acceptedAnswer.text`)
              continue
            }
            const qNorm = normalizeForMatch(qText)
            if (qNorm.length >= 4 && !visibleTextNorm.includes(qNorm)) {
              errors.push(`FAQPage question "${qText}" in ${rel} does not match visible page text`)
            }
          }
        }

        if (types.includes('BreadcrumbList')) {
          const items = Array.isArray(node.itemListElement) ? node.itemListElement : []
          if (items.length === 0) {
            errors.push(`BreadcrumbList in ${rel} has empty itemListElement`)
          }
        }

        if (types.includes('Article') || types.includes('TechArticle')) {
          if (!node.headline || !String(node.headline).trim()) {
            errors.push(`${types.join('/')} in ${rel} missing headline`)
          }
        }

        if (types.includes('SoftwareApplication')) {
          if (!node.name || !String(node.name).trim()) {
            errors.push(`SoftwareApplication in ${rel} missing name`)
          }
        }

        if (types.includes('ItemList')) {
          const items = Array.isArray(node.itemListElement) ? node.itemListElement : []
          if (items.length === 0) {
            errors.push(`ItemList in ${rel} has empty itemListElement`)
          }
        }
      }
    }

    if (!isNoindex && pageScripts === 0) {
      errors.push(`Indexable page ${rel} has no JSON-LD structured data`)
    }
  }

  return printSectionResult('validate:jsonld', {
    errors,
    warnings,
    stats: {
      htmlPagesScanned: htmlFiles.length,
      totalJsonLdScripts: totalScripts,
      validJsonLdScripts: validScripts,
      faqPagesChecked,
      faqQuestionsChecked,
      schemaTypes: [...typeCounts.entries()].map(([k, v]) => `${k}(${v})`).join(', '),
    },
  })
}

if (path.resolve(process.argv[1] || '') === fileURLToPath(import.meta.url)) {
  const res = await runValidateJsonLd()
  if (res.errors.length > 0) process.exit(1)
}
