/**
 * Safe runtime/build-time data bridge to /data/*.json and /data/links.ts.
 * Aligned with the actual schemas produced in data/brands.json, data/clients.json,
 * data/issue-map.json, and data/links.ts.
 */

export interface BrandPlan {
  name?: string
  price?: number | string
  priceCny?: number
  priceText?: string
  billingCycle?: string
  traffic?: string
  trafficPeriod?: string
  trafficGb?: number
  pricePerGb?: number | string
  devices?: string | number
  speedLimit?: string
  notes?: string
  dataStatus?: string
  [key: string]: unknown
}

export interface BrandSpeedTest {
  batchDate?: string
  batchTime?: string
  environment?: string
  protocolDisplayed?: string
  summary?: string
  imagePath?: string | null
  dataStatus?: string
  limitations?: string
  // legacy/optional aliases
  date?: string
  tool?: string
  node?: string
  isp?: string
  avgSpeed?: string | number
  maxSpeed?: string | number
  latencyMs?: number | string
  status?: string
  image?: string
  notes?: string
  [key: string]: unknown
}

export interface BrandClaimGroup {
  supported?: string[]
  nodeDependent?: string[]
  unsupportedOrFailed?: string[]
  notes?: string
  dataStatus?: string
}

export interface BrandRecord {
  id?: string | number
  name: string
  aliases?: string[]
  slug: string
  logo?: string | null
  accent?: string
  displayPriority?: number
  promotionPartner?: boolean
  officialUrl?: string
  affiliateUrl?: string
  affiliateUrlFlag?: string
  coupon?: string | null
  couponNotes?: string
  affiliateDisclosure?: string
  openingYear?: string | number
  operatingStatus?: string
  protocols?: string[]
  protocolNotes?: string
  lineClaims?: string[] | string
  nodesClaimed?: string | number
  nativeApps?: boolean | string[] | string
  thirdPartyClients?: boolean | string[] | string
  regions?: string[]
  plans?: BrandPlan[]
  paymentMethods?: string[]
  streamingClaims?: BrandClaimGroup | Record<string, unknown> | string[] | string
  aiClaims?: BrandClaimGroup | Record<string, unknown> | string[] | string
  tests?: BrandSpeedTest[]
  unlockMatrix?: Array<{
    service?: string
    region?: string
    status?: string
    note?: string
    testedAt?: string
  }>
  pros?: string[]
  cons?: string[]
  suitableFor?: string[]
  notSuitableFor?: string[]
  privacyAndRefundNotes?: string
  sourceRefs?: Array<string | { label?: string; source?: string; date?: string; note?: string; url?: string }>
  evidenceStatus?: string
  conflicts?: string[]
  verifiedAt?: string
  updatedAt?: string
  qualityFlags?: string[]
  [key: string]: unknown
}

export interface ClientRecord {
  id?: string
  slug?: string
  name: string
  clientType?: 'third-party' | 'native' | string
  category?: 'third-party' | 'native' | string
  type?: string
  core?: string
  cores?: string[]
  platforms?: string[]
  os?: string[]
  features?: string[]
  pricing?: string
  sourceChannel?: string
  protocols?: string[]
  maintenanceStatus?: string
  maintainerStatus?: string
  maintenanceWarning?: string
  warnings?: string[]
  officialRepoStatus?: string
  officialUrl?: string
  targetUrl?: string
  docPath?: string
  summary?: string
  notes?: string
  [key: string]: unknown
}

export interface IssueRecord {
  id: string
  code?: string
  title: string
  category?: string
  os?: string[]
  osList?: string[]
  clients?: string[]
  clientList?: string[]
  symptoms?: string[]
  httpCodes?: string[]
  errorCodes?: string[]
  lowRiskChecks?: string[]
  rootCauses?: Array<{ layer?: string; cause: string; action?: string }>
  targetUrl: string
  rollbackNote?: string
  severity?: string
  [key: string]: unknown
}

export interface BrandLinkPayload {
  slug: string
  name: string
  url: string | null
  affiliateUrl?: string
  officialUrl: string
  hasAffiliateUrl: boolean
  affiliateUrlFlag?: string
  isUrlAnomaly?: boolean
  rel: string
  target: string
  coupon?: string | null
  couponNotes?: string
  disclosure: string
  promotionPartner?: boolean
}

const jsonModules = import.meta.glob('../../../../data/*.json', { eager: true }) as Record<
  string,
  { default?: unknown } | unknown
>

const tsLinkModules = import.meta.glob('../../../../data/links.ts', { eager: true }) as Record<
  string,
  {
    getBrandLink?: (slug: string) => Record<string, unknown> | null
    getBrandBySlug?: (slug: string) => BrandRecord | null
    getAllBrands?: () => BrandRecord[]
  }
>

const ISSUE_URL_MAP: Record<string, string> = {
  '/troubleshooting/http-200-empty-subscription': '/troubleshooting/articles/sub-http-200-empty',
  '/troubleshooting/subscription-401-403-404': '/troubleshooting/articles/sub-http-401-403-404-503',
  '/troubleshooting/subscription-tls-dns-timeout': '/troubleshooting/articles/sub-tls-dns-timeout',
  '/troubleshooting/all-nodes-timeout': '/troubleshooting/articles/nodes-all-timeout',
  '/troubleshooting/partial-region-timeout': '/troubleshooting/articles/nodes-partial-region-timeout',
  '/troubleshooting/connected-no-internet': '/troubleshooting/articles/connected-no-internet',
  '/troubleshooting/specific-site-ai-mismatch': '/troubleshooting/articles/specific-sites-unreachable',
  '/troubleshooting/tun-mode-not-working': '/troubleshooting/articles/tun-not-working',
  '/troubleshooting/tun-vs-system-proxy': '/troubleshooting/articles/tun-vs-system-proxy',
  '/troubleshooting/fake-ip-conflict': '/troubleshooting/articles/fake-ip-explained-fix',
  '/troubleshooting/dns-leak-pollution': '/troubleshooting/articles/dns-leak-hijack-fix',
  '/troubleshooting/clash-verge-startup-white-screen': '/troubleshooting/articles/clash-verge-startup-fail',
  '/troubleshooting/yaml-parse-error': '/troubleshooting/articles/clash-verge-mihomo-yaml-fail',
  '/troubleshooting/v2rayn-core-load-fail': '/troubleshooting/articles/v2rayn-core-load-fail',
  '/troubleshooting/v2rayn-system-proxy-reset': '/troubleshooting/articles/v2rayn-system-proxy-fail',
  '/troubleshooting/shadowrocket-import-fail': '/troubleshooting/articles/shadowrocket-import-rules',
  '/troubleshooting/android-background-disconnect': '/troubleshooting/articles/android-v2rayng-clash-disconnect',
  '/troubleshooting/system-time-tls-handshake': '/troubleshooting/articles/time-sync-tls-cert-error',
  '/troubleshooting/udp-nat-block': '/troubleshooting/articles/udp-nat-firewall-blocks',
  '/troubleshooting/peak-hour-high-latency': '/troubleshooting/articles/high-latency-packet-loss-peak',
  '/troubleshooting/multiplier-speedtest-diff': '/troubleshooting/articles/bandwidth-multiplier-speedtest-diff',
  '/troubleshooting/expired-quota-vs-stale-config': '/troubleshooting/articles/quota-expired-vs-stale-config',
  '/troubleshooting/proprietary-client-lockin': '/guides/subscriptions/',
}

const CLIENT_URL_MAP: Record<string, string> = {
  '/clients/clash-verge-rev': '/clients/clash-verge/',
  '/clients/flclash': '/clients/mihomo/',
  '/clients/clash-nyanpasu': '/clients/mihomo/',
  '/clients/mihomo-party': '/clients/mihomo/',
  '/clients/v2rayng': '/clients/clash-meta/',
  '/clients/clash-meta-for-android': '/clients/clash-meta/',
  '/clients/nekobox': '/clients/sing-box/',
  '/clients/hiddify': '/clients/sing-box/',
  '/clients/karing': '/clients/sing-box/',
  '/clients/stash': '/clients/shadowrocket/',
  '/clients/clash-for-windows': '/troubleshooting/articles/client-migration-backup',
  '/clients/proprietary-vs-third-party': '/guides/subscriptions/',
}

function normalizeIssueUrl(url?: string): string {
  if (!url) return '/troubleshooting/'
  return ISSUE_URL_MAP[url] || url
}

function normalizeClientUrl(c: ClientRecord): string {
  const raw = c.docPath || c.targetUrl || ''
  if (raw && CLIENT_URL_MAP[raw]) return CLIENT_URL_MAP[raw]
  if (
    raw === '/clients/clash-verge/' ||
    raw === '/clients/clash-meta/' ||
    raw === '/clients/v2rayn/' ||
    raw === '/clients/shadowrocket/' ||
    raw === '/clients/mihomo/' ||
    raw === '/clients/sing-box/'
  ) {
    return raw
  }
  const id = String(c.id || c.slug || '').toLowerCase()
  if (id.includes('verge')) return '/clients/clash-verge/'
  if (id.includes('v2rayn')) return '/clients/v2rayn/'
  if (id.includes('shadowrocket') || id.includes('stash') || id.includes('quantumult')) return '/clients/shadowrocket/'
  if (id.includes('clash-meta') || id.includes('v2rayng')) return '/clients/clash-meta/'
  if (id.includes('sing-box') || id.includes('neko') || id.includes('hiddify') || id.includes('karing')) return '/clients/sing-box/'
  if (id.includes('mihomo') || id.includes('flclash') || id.includes('nyanpasu')) return '/clients/mihomo/'
  if (id.includes('native') || c.clientType === 'native') return '/guides/subscriptions/'
  return '/clients/'
}

function extractJson(filename: string): unknown {
  for (const [path, mod] of Object.entries(jsonModules)) {
    if (path.endsWith(`/${filename}`) || path.endsWith(`\\${filename}`)) {
      if (mod && typeof mod === 'object' && 'default' in mod) {
        return (mod as { default: unknown }).default
      }
      return mod
    }
  }
  return null
}

function asArray<T>(raw: unknown, keys: string[]): T[] {
  if (Array.isArray(raw)) return raw as T[]
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    for (const key of keys) {
      if (Array.isArray(obj[key])) return obj[key] as T[]
    }
  }
  return []
}

export function getAllBrands(): BrandRecord[] {
  const linkMod = Object.values(tsLinkModules)[0]
  if (linkMod?.getAllBrands) {
    try {
      const res = linkMod.getAllBrands()
      if (Array.isArray(res) && res.length > 0) return res
    } catch {
      // fall through
    }
  }
  return asArray<BrandRecord>(extractJson('brands.json'), ['brands', 'items', 'data'])
}

export function getBrandBySlug(slug: string): BrandRecord | undefined {
  const linkMod = Object.values(tsLinkModules)[0]
  if (linkMod?.getBrandBySlug) {
    try {
      const b = linkMod.getBrandBySlug(slug)
      if (b) return b
    } catch {
      // fallback
    }
  }
  return getAllBrands().find((b) => b.slug === slug)
}

export function getBrandLink(slug: string): BrandLinkPayload | null {
  const linkMod = Object.values(tsLinkModules)[0]
  if (linkMod?.getBrandLink) {
    try {
      const payload = linkMod.getBrandLink(slug)
      if (payload) {
        const aff =
          typeof payload.affiliateUrl === 'string' && payload.affiliateUrl.startsWith('http')
            ? payload.affiliateUrl
            : typeof payload.url === 'string' && payload.url.startsWith('http')
              ? payload.url
              : null
        const flag = typeof payload.affiliateUrlFlag === 'string' ? payload.affiliateUrlFlag : 'ok'
        return {
          slug: String(payload.slug || slug),
          name: String(payload.name || slug),
          url: aff,
          affiliateUrl: aff || undefined,
          officialUrl: String(payload.officialUrl || '待核实'),
          hasAffiliateUrl: Boolean(aff),
          affiliateUrlFlag: flag,
          isUrlAnomaly: Boolean(payload.isUrlAnomaly ?? (flag !== 'ok')),
          rel: String(payload.rel || 'nofollow sponsored noopener noreferrer'),
          target: String(payload.target || '_blank'),
          coupon: (payload.coupon as string | null | undefined) ?? null,
          couponNotes: payload.couponNotes ? String(payload.couponNotes) : undefined,
          disclosure: String(
            payload.disclosure ||
              '含推广链接，通过链接注册可能为本站带来佣金，不影响用户支付价格。'
          ),
          promotionPartner: Boolean(payload.promotionPartner),
        }
      }
    } catch {
      // fallback
    }
  }
  const brand = getBrandBySlug(slug)
  if (!brand) return null
  const aff =
    typeof brand.affiliateUrl === 'string' && brand.affiliateUrl.startsWith('http')
      ? brand.affiliateUrl
      : null
  const flag = brand.affiliateUrlFlag || 'ok'
  return {
    slug: brand.slug,
    name: brand.name,
    url: aff,
    affiliateUrl: aff || undefined,
    officialUrl: brand.officialUrl || '待核实',
    hasAffiliateUrl: Boolean(aff),
    affiliateUrlFlag: flag,
    isUrlAnomaly: flag !== 'ok',
    rel: 'nofollow sponsored noopener noreferrer',
    target: '_blank',
    coupon: brand.coupon ?? null,
    couponNotes: brand.couponNotes,
    disclosure:
      brand.affiliateDisclosure ||
      '含推广链接，通过链接注册可能为本站带来佣金，不影响用户支付价格。',
    promotionPartner: brand.promotionPartner,
  }
}

export function getAllClients(): ClientRecord[] {
  const raw = asArray<ClientRecord>(extractJson('clients.json'), ['clients', 'items', 'data'])
  return raw.map((c) => ({
    ...c,
    category: c.category || c.clientType || 'third-party',
    cores: c.cores || (c.core ? [c.core] : []),
    maintenanceWarning: c.maintenanceWarning || (Array.isArray(c.warnings) ? c.warnings.join(' ') : ''),
    officialRepoStatus:
      c.officialRepoStatus ||
      (c.officialUrl === '待核实' ? `${c.sourceChannel || '官方发布页'}（具体仓库 URL 待核实）` : c.officialUrl),
    docPath: normalizeClientUrl(c),
    summary: c.summary || (Array.isArray(c.features) ? `支持特性：${c.features.join('、')}` : ''),
  }))
}

export function getAllIssues(): IssueRecord[] {
  const raw = asArray<IssueRecord>(extractJson('issue-map.json'), ['issues', 'scenarios', 'items', 'data'])
  return raw.map((item) => ({
    ...item,
    os: item.os || item.osList || [],
    clients: item.clients || item.clientList || [],
    httpCodes: item.httpCodes || item.errorCodes || [],
    targetUrl: normalizeIssueUrl(item.targetUrl),
  }))
}

export function getSpeedtestManifest(): Record<string, unknown> | unknown[] | null {
  return extractJson('speedtest-manifest.json') as Record<string, unknown> | unknown[] | null
}

export function getSourceEvidence(): Record<string, unknown> | unknown[] | null {
  return extractJson('source-evidence.json') as Record<string, unknown> | unknown[] | null
}

export function formatEvidenceLabel(status?: string): {
  label: string
  tone: 'measured' | 'vendor' | 'third_party' | 'historical' | 'example' | 'unknown'
} {
  const s = String(status || 'unknown').toLowerCase()
  if (s.includes('measured') || s === '实测') {
    return { label: '有本地实测记录', tone: 'measured' }
  }
  if (s.includes('third') || s.includes('第三方')) {
    return { label: '第三方检测引用', tone: 'third_party' }
  }
  if (s.includes('vendor') || s.includes('品牌') || s.includes('自称')) {
    return { label: '品牌资料宣称', tone: 'vendor' }
  }
  if (s.includes('historical') || s.includes('历史')) {
    return { label: '历史归档记录', tone: 'historical' }
  }
  if (s.includes('example') || s.includes('概念')) {
    return { label: '概念示意', tone: 'example' }
  }
  return { label: '证据待核实', tone: 'unknown' }
}
