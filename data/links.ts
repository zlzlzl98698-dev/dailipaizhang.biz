import brandsData from './brands.json';

export const AFFILIATE_REL = 'nofollow sponsored noopener noreferrer' as const;
export const AFFILIATE_TARGET = '_blank' as const;
export const AFFILIATE_DISCLOSURE =
  '含推广链接，通过链接注册可能为本站带来佣金，不影响用户支付价格' as const;

export interface BrandPlan {
  name: string;
  billingCycle: string;
  priceCny: number;
  traffic: string;
  trafficPeriod: string;
  notes?: string;
  dataStatus: string;
}

export interface BrandTestRecord {
  batchDate: string;
  batchTime?: string;
  environment?: string;
  protocolDisplayed?: string;
  summary: string;
  imagePath: string | null;
  dataStatus: string;
  limitations: string;
}

export interface BrandClaimGroup {
  supported: string[];
  nodeDependent: string[];
  unsupportedOrFailed: string[];
  notes: string;
  dataStatus: string;
}

export interface BrandSourceRef {
  source: string;
  date: string;
  dataStatus: string;
  note: string;
}

export interface BrandRecord {
  id: number;
  name: string;
  aliases: string[];
  slug: string;
  logo: string | null;
  accent: string;
  displayPriority: number;
  promotionPartner: boolean;
  officialUrl: string;
  affiliateUrl: string;
  affiliateUrlFlag: string;
  coupon: string | null;
  couponNotes: string;
  affiliateDisclosure: string;
  openingYear: string;
  operatingStatus: string;
  protocols: string[];
  protocolNotes: string;
  lineClaims: string[];
  nodesClaimed: string;
  nativeApps: string;
  thirdPartyClients: string[];
  regions: string[];
  plans: BrandPlan[];
  paymentMethods: string[];
  streamingClaims: BrandClaimGroup;
  aiClaims: BrandClaimGroup;
  tests: BrandTestRecord[];
  pros: string[];
  cons: string[];
  suitableFor: string[];
  notSuitableFor: string[];
  privacyAndRefundNotes: string;
  sourceRefs: BrandSourceRef[];
  evidenceStatus: string;
  conflicts: string[];
  verifiedAt: string;
  updatedAt: string;
  qualityFlags: string[];
}

export interface BrandLinkPayload {
  slug: string;
  name: string;
  officialUrl: string;
  affiliateUrl: string;
  affiliateUrlFlag: string;
  isUrlAnomaly: boolean;
  coupon: string | null;
  couponNotes: string;
  rel: typeof AFFILIATE_REL;
  target: typeof AFFILIATE_TARGET;
  disclosure: string;
  promotionPartner: boolean;
  evidenceStatus: string;
  verifiedAt: string;
}

const BRANDS: BrandRecord[] = brandsData as BrandRecord[];
const BRAND_MAP = new Map<string, BrandRecord>(BRANDS.map((b) => [b.slug, b]));

export function getAllBrands(): BrandRecord[] {
  return [...BRANDS].sort((a, b) => a.displayPriority - b.displayPriority);
}

export function getBrandBySlug(slug: string): BrandRecord | undefined {
  return BRAND_MAP.get(slug);
}

export function getBrandLink(slug: string): BrandLinkPayload | null {
  const brand = BRAND_MAP.get(slug);
  if (!brand) return null;

  return {
    slug: brand.slug,
    name: brand.name,
    officialUrl: brand.officialUrl,
    affiliateUrl: brand.affiliateUrl,
    affiliateUrlFlag: brand.affiliateUrlFlag,
    isUrlAnomaly: brand.affiliateUrlFlag !== 'ok',
    coupon: brand.coupon,
    couponNotes: brand.couponNotes,
    rel: AFFILIATE_REL,
    target: AFFILIATE_TARGET,
    disclosure: brand.affiliateDisclosure || AFFILIATE_DISCLOSURE,
    promotionPartner: brand.promotionPartner,
    evidenceStatus: brand.evidenceStatus,
    verifiedAt: brand.verifiedAt,
  };
}
