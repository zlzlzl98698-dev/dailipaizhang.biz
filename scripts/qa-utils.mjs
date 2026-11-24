import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const ROOT_DIR = path.resolve(__dirname, '..')
export const DOCS_DIR = path.join(ROOT_DIR, 'docs')
export const DIST_DIR = path.join(DOCS_DIR, '.vitepress', 'dist')
export const DATA_DIR = path.join(ROOT_DIR, 'data')
export const REPORTS_DIR = path.join(ROOT_DIR, 'reports')

export const SITE_ORIGIN = 'https://dailipaizhang.biz'

export const EXPECTED_PILLAR_ROUTES = [
  '/airport/',
  '/pricing/',
  '/brands/',
  '/vpn/',
  '/clients/',
  '/ai-media/',
  '/routes/',
  '/guides/',
  '/troubleshooting/',
  '/security/',
]

export const EXPECTED_BRAND_SLUGS = [
  'guangsuyun',
  'feimao',
  'weifeng',
  'xingdaomeng',
  'wuyou',
  'ermao',
  'weitu',
  'firefly',
  'muguang',
  'yuzhou',
  'u1s1',
  'lingmao',
  'jilian',
  'guangnian',
  'yifan',
  'sogo',
  'kexin',
  'sujie',
  'shanyue',
  'quanqiu',
  'shandianshu',
  'dalaoyun',
  'yunjiexian',
  'liulianyun',
  'shenxing',
  'huanqiuti',
  'yinxingren',
  'tiziyun',
  'lingdong',
  'langwang',
  'edgenova',
]

export const GOVERNANCE_ROUTES = ['/disclosure', '/methodology', '/about']

export function walkFiles(dir, predicate = () => true, skipDirs = new Set(['node_modules', '.git', '.vitepress'])) {
  const results = []
  if (!fs.existsSync(dir)) return results

  const stack = [dir]
  while (stack.length > 0) {
    const current = stack.pop()
    const entries = fs.readdirSync(current, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name)
      if (entry.isDirectory()) {
        if (!skipDirs.has(entry.name)) {
          stack.push(fullPath)
        }
      } else if (entry.isFile() && predicate(fullPath, entry.name)) {
        results.push(fullPath)
      }
    }
  }
  return results.sort()
}

export function toPosix(p) {
  return p.split(path.sep).join('/')
}

export function mdFileToRoute(absPath) {
  const rel = toPosix(path.relative(DOCS_DIR, absPath))
  if (rel === 'index.md') return '/'
  if (rel.endsWith('/index.md')) {
    return '/' + rel.slice(0, -'index.md'.length)
  }
  if (rel.endsWith('.md')) {
    return '/' + rel.slice(0, -'.md'.length)
  }
  return '/' + rel
}

export function htmlFileToRoute(absPath) {
  const rel = toPosix(path.relative(DIST_DIR, absPath))
  if (rel === 'index.html') return '/'
  if (rel.endsWith('/index.html')) {
    return '/' + rel.slice(0, -'index.html'.length)
  }
  if (rel.endsWith('.html')) {
    return '/' + rel.slice(0, -'.html'.length)
  }
  return '/' + rel
}

export function normalizeRoute(route) {
  if (!route) return '/'
  let r = route.trim()
  if (r.startsWith(SITE_ORIGIN)) {
    r = r.slice(SITE_ORIGIN.length) || '/'
  }
  const hashIdx = r.indexOf('#')
  if (hashIdx !== -1) r = r.slice(0, hashIdx)
  const qIdx = r.indexOf('?')
  if (qIdx !== -1) r = r.slice(0, qIdx)
  if (!r.startsWith('/')) r = '/' + r
  if (r.endsWith('.html')) {
    r = r === '/index.html' ? '/' : r.endsWith('/index.html') ? r.slice(0, -'index.html'.length) : r.slice(0, -'.html'.length)
  }
  if (r.length > 1 && r.endsWith('/')) {
    r = r.slice(0, -1)
  }
  return r || '/'
}

function unquoteScalar(val) {
  const s = val.trim()
  if (!s) return ''
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    const inner = s.slice(1, -1)
    return s.startsWith('"')
      ? inner.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\')
      : inner.replace(/''/g, "'")
  }
  if (s === 'true') return true
  if (s === 'false') return false
  if (s === 'null' || s === '~') return null
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s)
  return s
}

function splitInlineArray(raw) {
  const inner = raw.trim().slice(1, -1).trim()
  if (!inner) return []
  const items = []
  let buf = ''
  let quote = null
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i]
    if (quote) {
      if (ch === quote && inner[i - 1] !== '\\') quote = null
      buf += ch
    } else if (ch === '"' || ch === "'") {
      quote = ch
      buf += ch
    } else if (ch === ',') {
      items.push(unquoteScalar(buf))
      buf = ''
    } else {
      buf += ch
    }
  }
  if (buf.trim()) items.push(unquoteScalar(buf))
  return items
}

function stripYamlComment(line) {
  let quote = null
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (quote) {
      if (ch === quote && line[i - 1] !== '\\') quote = null
    } else if (ch === '"' || ch === "'") {
      quote = ch
    } else if (ch === '#' && (i === 0 || /\s/.test(line[i - 1]))) {
      return line.slice(0, i)
    }
  }
  return line
}

function parseYamlLines(lines, startIdx = 0, baseIndent = 0) {
  let result = null
  let i = startIdx

  while (i < lines.length) {
    const rawLine = lines[i]
    const cleaned = stripYamlComment(rawLine)
    if (!cleaned.trim()) {
      i++
      continue
    }
    const indent = cleaned.search(/\S/)
    if (indent < baseIndent) break

    const trimmed = cleaned.trim()
    if (trimmed.startsWith('- ') || trimmed === '-') {
      if (result === null) result = []
      if (!Array.isArray(result)) break

      const afterDash = trimmed === '-' ? '' : trimmed.slice(2).trim()
      if (!afterDash) {
        const [child, nextIdx] = parseYamlLines(lines, i + 1, indent + 2)
        result.push(child)
        i = nextIdx
        continue
      }

      const colonIdx = findKeyColon(afterDash)
      if (colonIdx !== -1) {
        const obj = {}
        const key = afterDash.slice(0, colonIdx).trim()
        const rest = afterDash.slice(colonIdx + 1).trim()
        if (rest) {
          obj[key] = rest.startsWith('[') && rest.endsWith(']') ? splitInlineArray(rest) : unquoteScalar(rest)
          i++
        } else {
          const [child, nextIdx] = parseYamlLines(lines, i + 1, indent + 4)
          obj[key] = child
          i = nextIdx
        }
        // Check sibling keys of this list item at indent + 2
        if (i < lines.length) {
          const nextClean = stripYamlComment(lines[i])
          const nextIndent = nextClean.search(/\S/)
          if (nextClean.trim() && nextIndent > indent && !nextClean.trim().startsWith('- ')) {
            const [extra, nextIdx] = parseYamlLines(lines, i, nextIndent)
            if (extra && typeof extra === 'object' && !Array.isArray(extra)) {
              Object.assign(obj, extra)
            }
            i = nextIdx
          }
        }
        result.push(obj)
      } else {
        result.push(afterDash.startsWith('[') && afterDash.endsWith(']') ? splitInlineArray(afterDash) : unquoteScalar(afterDash))
        i++
      }
    } else {
      if (result === null) result = {}
      if (Array.isArray(result)) break

      const colonIdx = findKeyColon(trimmed)
      if (colonIdx === -1) {
        i++
        continue
      }
      const key = unquoteScalar(trimmed.slice(0, colonIdx).trim())
      const rest = trimmed.slice(colonIdx + 1).trim()

      if (rest === '|' || rest === '>') {
        const blockLines = []
        i++
        let blockIndent = null
        while (i < lines.length) {
          const l = lines[i]
          if (!l.trim()) {
            blockLines.push('')
            i++
            continue
          }
          const li = l.search(/\S/)
          if (li <= indent) break
          if (blockIndent === null) blockIndent = li
          blockLines.push(l.slice(blockIndent))
          i++
        }
        result[key] = rest === '>' ? blockLines.join(' ').trim() : blockLines.join('\n').trim()
      } else if (rest) {
        result[key] = rest.startsWith('[') && rest.endsWith(']') ? splitInlineArray(rest) : unquoteScalar(rest)
        i++
      } else {
        // Peek next non-empty line
        let peek = i + 1
        while (peek < lines.length && !stripYamlComment(lines[peek]).trim()) peek++
        if (peek < lines.length) {
          const nextIndent = stripYamlComment(lines[peek]).search(/\S/)
          const nextTrimmed = stripYamlComment(lines[peek]).trim()
          if (nextIndent > indent || (nextIndent === indent && nextTrimmed.startsWith('- '))) {
            const [child, nextIdx] = parseYamlLines(lines, peek, nextIndent)
            result[key] = child
            i = nextIdx
            continue
          }
        }
        result[key] = null
        i++
      }
    }
  }

  return [result ?? {}, i]
}

function findKeyColon(text) {
  let quote = null
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quote) {
      if (ch === quote && text[i - 1] !== '\\') quote = null
    } else if (ch === '"' || ch === "'") {
      quote = ch
    } else if (ch === ':' && (i + 1 === text.length || /\s/.test(text[i + 1]))) {
      return i
    }
  }
  return -1
}

export function parseMarkdown(raw) {
  const normalized = raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n')
  if (!normalized.startsWith('---\n')) {
    return { frontmatter: {}, body: normalized }
  }
  const endIdx = normalized.indexOf('\n---', 4)
  if (endIdx === -1) {
    return { frontmatter: {}, body: normalized }
  }
  const yamlBlock = normalized.slice(4, endIdx)
  let afterFence = endIdx + 4
  if (normalized[afterFence] === '\n') afterFence++
  const body = normalized.slice(afterFence)
  const [frontmatter] = parseYamlLines(yamlBlock.split('\n'), 0, 0)
  return { frontmatter: frontmatter && typeof frontmatter === 'object' ? frontmatter : {}, body }
}

export function extractH1(body, frontmatter = {}) {
  const lines = body.split('\n')
  let inCode = false
  for (const line of lines) {
    const t = line.trim()
    if (t.startsWith('```') || t.startsWith('~~~')) {
      inCode = !inCode
      continue
    }
    if (inCode) continue
    const m = /^#\s+(.+?)\s*#*\s*$/.exec(t)
    if (m) return m[1].trim()
    const htmlH1 = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(t)
    if (htmlH1) return htmlH1[1].replace(/<[^>]+>/g, '').trim()
  }
  if (frontmatter?.hero?.name) {
    return String(frontmatter.hero.name).trim()
  }
  if (frontmatter?.h1) {
    return String(frontmatter.h1).trim()
  }
  return ''
}

export function stripMarkdownCodeBlocks(body) {
  const lines = body.split('\n')
  const out = []
  let inCode = false
  for (const line of lines) {
    const t = line.trim()
    if (t.startsWith('```') || t.startsWith('~~~')) {
      inCode = !inCode
      continue
    }
    if (!inCode) out.push(line)
  }
  return out.join('\n')
}

export function parseCsv(raw) {
  const text = raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n')
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n') {
      row.push(field)
      if (row.some((c) => c.trim() !== '')) rows.push(row)
      row = []
      field = ''
    } else {
      field += ch
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field)
    if (row.some((c) => c.trim() !== '')) rows.push(row)
  }
  if (rows.length === 0) return { headers: [], records: [] }
  const headers = rows[0].map((h) => h.trim())
  const records = rows.slice(1).map((cols) => {
    const rec = {}
    headers.forEach((h, idx) => {
      rec[h] = (cols[idx] ?? '').trim()
    })
    return rec
  })
  return { headers, records }
}

export function decodeHtmlEntities(str) {
  return str
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
}

export function extractVisibleTextFromHtml(html) {
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
  text = decodeHtmlEntities(text)
  return text.replace(/\s+/g, ' ').trim()
}

export function printSectionResult(name, { errors = [], warnings = [], stats = {} }) {
  const status = errors.length === 0 ? 'PASS' : 'FAIL'
  console.log(`\n[${status}] ${name}`)
  for (const [k, v] of Object.entries(stats)) {
    console.log(`  - ${k}: ${v}`)
  }
  if (warnings.length > 0) {
    console.log(`  Warnings (${warnings.length}):`)
    for (const w of warnings.slice(0, 30)) {
      console.log(`    [WARN] ${w}`)
    }
    if (warnings.length > 30) {
      console.log(`    ... and ${warnings.length - 30} more warnings`)
    }
  }
  if (errors.length > 0) {
    console.log(`  Errors (${errors.length}):`)
    for (const e of errors.slice(0, 50)) {
      console.log(`    [ERROR] ${e}`)
    }
    if (errors.length > 50) {
      console.log(`    ... and ${errors.length - 50} more errors`)
    }
  }
  return { name, status, errors, warnings, stats }
}
