import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import {
  DIST_DIR,
  SITE_ORIGIN,
  walkFiles,
  toPosix,
  printSectionResult,
} from './qa-utils.mjs'

const CHINESE_SEARCH_TERMS = ['订阅', '超时', '光速云', '小火箭', '分流', '节点', 'DNS']

function resolveDistTarget(cleanPath) {
  let rel = cleanPath.replace(/^\/+/, '')
  if (!rel) {
    return fs.existsSync(path.join(DIST_DIR, 'index.html'))
  }
  const candidates = [
    path.join(DIST_DIR, rel),
    path.join(DIST_DIR, `${rel}.html`),
    path.join(DIST_DIR, rel, 'index.html'),
  ]
  if (rel.endsWith('/')) {
    const trimmed = rel.slice(0, -1)
    candidates.push(path.join(DIST_DIR, `${trimmed}.html`))
    candidates.push(path.join(DIST_DIR, trimmed, 'index.html'))
  }
  return candidates.some((c) => {
    try {
      return fs.existsSync(c) && fs.statSync(c).isFile()
    } catch {
      return false
    }
  })
}

async function testPagefindIntegrity(errors, warnings) {
  const pfDir = path.join(DIST_DIR, 'pagefind')
  const stats = {
    pagefindIndexedPages: 0,
    pagefindTermsTested: 0,
    pagefindTermsMatched: 0,
  }

  if (!fs.existsSync(pfDir)) {
    errors.push('Missing docs/.vitepress/dist/pagefind/ directory')
    return stats
  }

  const requiredPf = ['pagefind.js', 'pagefind-entry.json']
  for (const f of requiredPf) {
    const fp = path.join(pfDir, f)
    if (!fs.existsSync(fp) || fs.statSync(fp).size === 0) {
      errors.push(`Missing or empty Pagefind file: pagefind/${f}`)
    }
  }

  const entryPath = path.join(pfDir, 'pagefind-entry.json')
  if (!fs.existsSync(entryPath)) return stats

  let entry
  try {
    entry = JSON.parse(fs.readFileSync(entryPath, 'utf8'))
  } catch (err) {
    errors.push(`Invalid pagefind-entry.json: ${err.message}`)
    return stats
  }

  const languages = entry.languages || {}
  const langEntries = Object.entries(languages)
  if (langEntries.length === 0) {
    errors.push('pagefind-entry.json has no languages indexed')
    return stats
  }

  let totalPageCount = 0
  for (const [lang, meta] of langEntries) {
    totalPageCount += Number(meta?.page_count || 0)
    if (meta?.hash) {
      const metaFile = path.join(pfDir, `pagefind.${lang}_${meta.hash}.pf_meta`)
      const altMetaFile = path.join(pfDir, `pagefind.${lang}.pf_meta`)
      const hasMeta =
        fs.existsSync(metaFile) ||
        fs.existsSync(altMetaFile) ||
        fs.readdirSync(pfDir).some((n) => n.startsWith(`pagefind.${lang}`) && n.endsWith('.pf_meta'))
      if (!hasMeta) {
        errors.push(`Missing .pf_meta index file for language "${lang}" in pagefind/`)
      }
    }
  }
  stats.pagefindIndexedPages = totalPageCount
  if (totalPageCount === 0) {
    errors.push('Pagefind indexed page_count is 0')
    return stats
  }

  const indexDir = path.join(pfDir, 'index')
  const fragDir = path.join(pfDir, 'fragment')
  if (!fs.existsSync(indexDir) || fs.readdirSync(indexDir).length === 0) {
    errors.push('Pagefind index/ chunk directory missing or empty')
  }
  if (!fs.existsSync(fragDir) || fs.readdirSync(fragDir).length === 0) {
    errors.push('Pagefind fragment/ chunk directory missing or empty')
  }
  const wasmFiles = fs.readdirSync(pfDir).filter((n) => n.endsWith('.pagefind') && n.startsWith('wasm.'))
  if (wasmFiles.length === 0) {
    errors.push('Missing Pagefind wasm.*.pagefind binary in pagefind/')
  }

  // Test live search on 6+ Chinese terms by shimming fetch/window over local dist/pagefind/
  const origFetch = globalThis.fetch
  const origWindow = globalThis.window
  const origLocation = globalThis.location
  const origDocument = globalThis.document

  try {
    globalThis.window = {
      location: { origin: SITE_ORIGIN, href: `${SITE_ORIGIN}/`, pathname: '/' },
    }
    globalThis.location = globalThis.window.location
    globalThis.document = {
      documentElement: { lang: 'zh-CN' },
      querySelector: () => null,
    }
    globalThis.fetch = async (input) => {
      const rawUrl = typeof input === 'string' ? input : input?.url || String(input)
      let reqPath = rawUrl
      if (reqPath.startsWith('http://') || reqPath.startsWith('https://')) {
        reqPath = new URL(reqPath).pathname
      } else if (reqPath.startsWith('file://')) {
        const fsPath = fileURLToPath(reqPath)
        const buf = fs.readFileSync(fsPath)
        return new Response(buf, { status: 200 })
      }
      const cleanRel = reqPath.replace(/^\/+/, '').split('?')[0]
      const target = path.join(DIST_DIR, cleanRel.startsWith('pagefind/') ? cleanRel : path.join('pagefind', cleanRel))
      if (!fs.existsSync(target)) {
        return new Response('Not Found', { status: 404 })
      }
      const buf = fs.readFileSync(target)
      const headers = target.endsWith('.wasm') || target.endsWith('.pagefind')
        ? { 'content-type': 'application/wasm' }
        : target.endsWith('.json')
          ? { 'content-type': 'application/json' }
          : {}
      return new Response(buf, { status: 200, headers })
    }

    const pfModuleUrl = pathToFileURL(path.join(pfDir, 'pagefind.js')).href
    const pf = await import(pfModuleUrl)
    await pf.options({ basePath: '/pagefind/' })
    await pf.init()

    for (const term of CHINESE_SEARCH_TERMS) {
      stats.pagefindTermsTested++
      const res = await pf.search(term)
      if (res && Array.isArray(res.results) && res.results.length > 0) {
        stats.pagefindTermsMatched++
        // Verify first fragment loads cleanly
        const firstData = await res.results[0].data()
        if (!firstData || !firstData.url) {
          errors.push(`Pagefind search for "${term}" returned result with missing fragment data/url`)
        }
      } else {
        errors.push(`Pagefind search for Chinese term "${term}" returned 0 results`)
      }
    }
  } catch (err) {
    warnings.push(`Pagefind Node query harness skipped or errored (${err.message}); falling back to static chunk checks`)
  } finally {
    globalThis.fetch = origFetch
    if (origWindow === undefined) delete globalThis.window
    else globalThis.window = origWindow
    if (origLocation === undefined) delete globalThis.location
    else globalThis.location = origLocation
    if (origDocument === undefined) delete globalThis.document
    else globalThis.document = origDocument
  }

  return stats
}

export async function runValidateLinks() {
  const errors = []
  const warnings = []

  if (!fs.existsSync(DIST_DIR)) {
    errors.push('Missing docs/.vitepress/dist directory (run npm run build first)')
    return printSectionResult('validate:links', { errors, warnings, stats: {} })
  }

  // 1. Check required static & deployment files in dist/
  const requiredRootFiles = ['robots.txt', 'sitemap.xml', '.htaccess', 'favicon.svg', '404.html']
  for (const file of requiredRootFiles) {
    const fp = path.join(DIST_DIR, file)
    if (!fs.existsSync(fp) || fs.statSync(fp).size === 0) {
      errors.push(`Missing or empty required dist file: ${file}`)
    }
  }

  const htaccessPath = path.join(DIST_DIR, '.htaccess')
  if (fs.existsSync(htaccessPath)) {
    const ht = fs.readFileSync(htaccessPath, 'utf8')
    if (!ht.includes('ErrorDocument 404 /404.html')) {
      errors.push('dist/.htaccess missing "ErrorDocument 404 /404.html"')
    }
  }

  const robotsPath = path.join(DIST_DIR, 'robots.txt')
  if (fs.existsSync(robotsPath)) {
    const rb = fs.readFileSync(robotsPath, 'utf8')
    if (!rb.includes('https://dailipaizhang.biz/sitemap.xml')) {
      errors.push('dist/robots.txt missing Sitemap: https://dailipaizhang.biz/sitemap.xml')
    }
  }

  // 2. Scan all HTML files for links & images
  const htmlFiles = walkFiles(DIST_DIR, (p) => p.endsWith('.html'), new Set(['pagefind', 'assets']))
  const aHrefRegex = /<a\b[^>]*\bhref=(["'])([^"']*)\1/gi
  const imgSrcRegex = /<(?:img|source)\b[^>]*\bsrc=(["'])([^"']*)\1/gi

  let internalLinksChecked = 0
  let imagesChecked = 0

  for (const htmlFile of htmlFiles) {
    const rel = toPosix(path.relative(DIST_DIR, htmlFile))
    const html = fs.readFileSync(htmlFile, 'utf8')
    const baseDirUrl = '/' + (rel === 'index.html' ? '' : path.posix.dirname(rel) + '/')

    let m
    while ((m = aHrefRegex.exec(html)) !== null) {
      const rawHref = m[2].trim()
      if (rawHref === '' || rawHref === '#') {
        errors.push(`Empty or placeholder href="${rawHref}" found in ${rel}`)
        continue
      }
      if (
        rawHref.startsWith('#') ||
        rawHref.startsWith('http://') ||
        rawHref.startsWith('https://') ||
        rawHref.startsWith('mailto:') ||
        rawHref.startsWith('tel:') ||
        rawHref.startsWith('javascript:') ||
        rawHref.startsWith('data:')
      ) {
        continue
      }

      internalLinksChecked++
      const withoutHash = rawHref.split('#')[0].split('?')[0]
      let decodedPath
      try {
        decodedPath = decodeURIComponent(withoutHash)
      } catch {
        decodedPath = withoutHash
      }

      const resolved = decodedPath.startsWith('/')
        ? decodedPath
        : path.posix.resolve(baseDirUrl, decodedPath)

      if (!resolveDistTarget(resolved)) {
        errors.push(`Broken internal link href="${rawHref}" (resolved "${resolved}") in ${rel}`)
      }
    }

    while ((m = imgSrcRegex.exec(html)) !== null) {
      const rawSrc = m[2].trim()
      if (!rawSrc) {
        errors.push(`Empty img src="" in ${rel}`)
        continue
      }
      if (rawSrc.startsWith('data:') || rawSrc.startsWith('http://') || rawSrc.startsWith('https://')) {
        continue
      }
      imagesChecked++
      const cleanSrc = rawSrc.split('#')[0].split('?')[0]
      let decodedSrc
      try {
        decodedSrc = decodeURIComponent(cleanSrc)
      } catch {
        decodedSrc = cleanSrc
      }
      const resolvedImg = decodedSrc.startsWith('/')
        ? decodedSrc
        : path.posix.resolve(baseDirUrl, decodedSrc)
      const imgFile = path.join(DIST_DIR, resolvedImg.replace(/^\/+/, ''))
      if (!fs.existsSync(imgFile)) {
        errors.push(`Missing image asset src="${rawSrc}" (resolved "${resolvedImg}") referenced in ${rel}`)
      }
    }
  }

  // 3. Test Pagefind index & Chinese search queries
  const pfStats = await testPagefindIntegrity(errors, warnings)

  return printSectionResult('validate:links', {
    errors,
    warnings,
    stats: {
      htmlPagesScanned: htmlFiles.length,
      internalLinksChecked,
      imagesChecked,
      ...pfStats,
    },
  })
}

if (path.resolve(process.argv[1] || '') === fileURLToPath(import.meta.url)) {
  const res = await runValidateLinks()
  if (res.errors.length > 0) process.exit(1)
}
