import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runAuditUrls } from './audit-urls.mjs'
import { runAuditKeywords } from './audit-keywords.mjs'
import { runAuditBrands } from './audit-brands.mjs'
import { runAuditContentQuality } from './audit-content-quality.mjs'
import { runValidateJsonLd } from './validate-jsonld.mjs'
import { runValidateLinks } from './validate-links.mjs'

async function main() {
  const prebuild = process.argv.includes('--prebuild')
  const start = Date.now()
  console.log(`=== dailipaizhang.biz QA Suite (${prebuild ? 'prebuild source mode' : 'full build + dist mode'}) ===`)

  const results = []
  results.push(await runAuditUrls({ sourceOnly: prebuild }))
  results.push(await runAuditKeywords())
  results.push(await runAuditBrands({ sourceOnly: prebuild }))
  results.push(await runAuditContentQuality())

  if (!prebuild) {
    results.push(await runValidateJsonLd())
    results.push(await runValidateLinks())
  }

  const totalErrors = results.reduce((acc, r) => acc + r.errors.length, 0)
  const totalWarnings = results.reduce((acc, r) => acc + r.warnings.length, 0)
  const elapsedMs = Date.now() - start

  console.log('\n=== QA Summary ===')
  for (const r of results) {
    console.log(`- ${r.name}: ${r.status} (${r.errors.length} errors, ${r.warnings.length} warnings)`)
  }
  console.log(`Total: ${totalErrors} error(s), ${totalWarnings} warning(s) in ${elapsedMs}ms`)

  if (totalErrors > 0) {
    process.exit(1)
  }
}

if (path.resolve(process.argv[1] || '') === fileURLToPath(import.meta.url)) {
  await main()
}
