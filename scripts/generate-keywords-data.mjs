import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '..')
const DATA_DIR = path.join(ROOT_DIR, 'data')
const DOCS_DIR = path.join(ROOT_DIR, 'docs')
const KEYWORDS_DIR = path.join(DATA_DIR, 'keywords')

if (!fs.existsSync(KEYWORDS_DIR)) {
  fs.mkdirSync(KEYWORDS_DIR, { recursive: true })
}

function normalizeRoute(route) {
  if (!route) return '/'
  let r = String(route).trim().split('#')[0].split('?')[0]
  r = r.replace(/^https?:\/\/[^/]+/i, '')
  if (!r.startsWith('/')) r = '/' + r
  r = r.replace(/\/index\.html$/i, '/').replace(/\.html$/i, '').replace(/\/index\.md$/i, '/').replace(/\.md$/i, '')
  if (r.length > 1 && r.endsWith('/')) r = r.slice(0, -1)
  return r || '/'
}

function normalizeKeyword(kw) {
  return String(kw ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function csvEscape(val) {
  const s = String(val ?? '')
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function parseFrontmatter(raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw)
  if (!m) return {}
  const fm = {}
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_-]+):\s*(.+)$/.exec(line)
    if (kv) {
      let val = kv[2].trim()
      if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
        val = val.slice(1, -1)
      }
      if (val === 'true') fm[kv[1]] = true
      else if (val === 'false') fm[kv[1]] = false
      else fm[kv[1]] = val
    }
  }
  return fm
}

function walkMdFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walkMdFiles(full, out)
    } else if (entry.name.endsWith('.md')) {
      out.push(full)
    }
  }
  return out
}

function mdFileToRoute(file) {
  const rel = path.relative(DOCS_DIR, file).replace(/\\/g, '/')
  if (rel === 'index.md') return '/'
  if (rel.endsWith('/index.md')) return '/' + rel.slice(0, -'/index.md'.length)
  return '/' + rel.replace(/\.md$/, '')
}

// 1. Load brand data and clients
const brands = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'brands.json'), 'utf8'))

// 2. Scan disk for existing pages
const existingPages = new Map()
for (const file of walkMdFiles(DOCS_DIR)) {
  const rel = path.relative(DOCS_DIR, file).replace(/\\/g, '/')
  if (rel === '404.md') continue
  const raw = fs.readFileSync(file, 'utf8')
  const fm = parseFrontmatter(raw)
  if (fm.noindex === true || fm.draft === true || fm.published === false) continue
  const route = normalizeRoute(mdFileToRoute(file))
  existingPages.set(route, { rel, route, file, fm })
}

// 3. Define 36 new L3 articles registry
const NEW_36_ARTICLES = [
  // Pillar 1: airport
  {
    targetUrl: '/airport/articles/how-to-judge-peak-stability',
    articleTitle: '如何判断机场晚高峰是否稳定：从 RTT/HTTPS 延迟/0B 异常与 7 天实测法判断',
    primaryKeyword: '如何判断机场晚高峰稳定性',
    secondaryKeywords: '机场晚高峰测速|0B节点异常|晚高峰丢包率|IEPL专线晚高峰',
    longTailQuestions: '如何测试机场晚高峰稳定性？|测速截图里的0B节点是什么意思？|晚高峰连接卡顿怎么排查？',
    searchIntent: 'informational',
    audience: 'all',
    contentType: 'guide',
    parentTopic: '/airport/stable/',
    parentTopicName: '稳定机场标准',
    parentCluster: 'c-airport-07',
    summary: '从 RTT、HTTPS 延迟、0B 异常和丢包率四维指标，拆解 7 天晚高峰独立验证 SOP 与测速避坑方法。',
    contentOutline: '判断标准|RTT与HTTPS延迟区别|0B异常与晚高峰丢包|7天晚高峰测试SOP|常见错误',
    relatedArticles: ['/airport/articles/more-nodes-better-myth', '/routes/articles/how-to-spot-unverified-iepl', '/troubleshooting/articles/nodes-partial-region-timeout'],
    relatedBrands: ['guangsuyun', 'wuyou', 'weifeng'],
    relatedComparisons: ['/compare/weifeng-vs-wuyou/'],
    conversionIntent: 'medium',
    contentPriority: 'P0',
    sourceRequirements: '32家机场品牌清单.txt + 测速图'
  },
  {
    targetUrl: '/airport/articles/more-nodes-better-myth',
    articleTitle: '机场节点数量越多越好吗：60+ 节点重复复用 vs 有效落地与负载均衡',
    primaryKeyword: '机场节点数量越多越好吗',
    secondaryKeywords: '机场节点数量真相|节点复用超售|有效落地节点|负载均衡策略',
    longTailQuestions: '机场宣称100多个节点真的有用吗？|为什么很多节点测速都是0B？|如何判断机场有效节点数量？',
    searchIntent: 'informational',
    audience: 'all',
    contentType: 'guide',
    parentTopic: '/airport/airport-recommendation/',
    parentTopicName: '机场推荐总览',
    parentCluster: 'c-airport-01',
    summary: '破除节点数量虚高迷信，深入解析入口与落地复用超售原理，教你识别真假有效节点。',
    contentOutline: '核心结论|节点数量虚高真相|入口与落地复用原理|有效节点筛选方法|适用人群',
    relatedArticles: ['/airport/articles/how-to-judge-peak-stability', '/airport/articles/multi-device-airport-selection', '/routes/articles/low-ping-vs-download-speed'],
    relatedBrands: ['guangsuyun', 'sogo', 'yuzhou'],
    relatedComparisons: ['/compare/sogo-vs-kexin/'],
    conversionIntent: 'medium',
    contentPriority: 'P0',
    sourceRequirements: '32家机场品牌清单.txt + 测速数据'
  },
  {
    targetUrl: '/airport/articles/native-app-vs-third-party-beginners',
    articleTitle: '自研客户端机场适合新手吗：8 家仅专属端 vs 通用订阅的上手与锁定权衡',
    primaryKeyword: '自研客户端机场适合新手吗',
    secondaryKeywords: '自研客户端机场优缺点|专属客户端锁定|第三方Clash订阅对比|新手选机场客户端',
    longTailQuestions: '小白买机场选专属客户端还是通用订阅？|飞猫云和隐形人的专属客户端好用吗？|自研客户端安全吗？',
    searchIntent: 'commercial',
    audience: 'beginner',
    contentType: 'comparison',
    parentTopic: '/airport/easy-to-use/',
    parentTopicName: '好用的机场',
    parentCluster: 'c-airport-09',
    summary: '深度对比 8 家仅支持自研专属 App 的品牌与通用 Clash 订阅方案，权衡上手便捷度与生态锁定风险。',
    contentOutline: '权衡结论|8家仅专属端品牌矩阵|上手体验对比|生态锁定风险|新手决策清单',
    relatedArticles: ['/airport/articles/multi-device-airport-selection', '/clients/articles/clash-verge-rev-install-guide', '/security/articles/checklist-before-switching-airport'],
    relatedBrands: ['feimao', 'yinxingren', 'guangsuyun'],
    relatedComparisons: ['/compare/guangsuyun-vs-feimao/'],
    conversionIntent: 'high',
    contentPriority: 'P0',
    sourceRequirements: '32家机场品牌清单.txt + 第三方代理客户端.txt'
  },
  {
    targetUrl: '/airport/articles/multi-device-airport-selection',
    articleTitle: '多设备用户如何选择机场：设备数限制、不限设备宣称与软路由并发策略',
    primaryKeyword: '多设备用户如何选择机场',
    secondaryKeywords: '机场多设备同时在线|不限设备数机场|软路由机场配置|多终端并发限制',
    longTailQuestions: '家里多台手机电脑怎么共用一个机场订阅？|不限设备连接数的机场靠谱吗？|软路由算几个设备？',
    searchIntent: 'commercial',
    audience: 'multi-device',
    contentType: 'guide',
    parentTopic: '/airport/airport-recommendation/',
    parentTopicName: '机场推荐总览',
    parentCluster: 'c-airport-02',
    summary: '针对家庭多终端与团队办公场景，拆解设备连接数限制机制、不限设备真实水分与软路由透明代理方案。',
    contentOutline: '选型结论|设备限制机制解析|31家品牌设备数对比|软路由并发策略|配置指南',
    relatedArticles: ['/airport/articles/more-nodes-better-myth', '/pricing/articles/is-100gb-enough-monthly', '/guides/articles/windows-proxy-client-setup'],
    relatedBrands: ['muguang', 'guangsuyun', 'ermao'],
    relatedComparisons: ['/compare/muguang-vs-yuzhou/'],
    conversionIntent: 'high',
    contentPriority: 'P1',
    sourceRequirements: '32家机场品牌清单.txt'
  },

  // Pillar 2: pricing
  {
    targetUrl: '/pricing/articles/under-20-yuan-monthly-guide',
    articleTitle: '20 元以内月付机场有哪些选择条件：14.9–20 元主力月付实算对比',
    primaryKeyword: '20元以内月付机场怎么选',
    secondaryKeywords: '20元以内月付机场|15元平价机场|便宜月付专线|低价月付试错',
    longTailQuestions: '预算20元每月能买到靠谱专线机场吗？|20元以内月付机场有哪些品牌？|低价月付机场要注意什么？',
    searchIntent: 'commercial',
    audience: 'all',
    contentType: 'guide',
    parentTopic: '/pricing/monthly/',
    parentTopicName: '月付机场筛选',
    parentCluster: 'c-pricing-19',
    summary: '梳理 14.9–20 元主流平价月付方案，实算每 GB 真实单价与倍率损耗，教你低成本试错晚高峰。',
    contentOutline: '价格结论|14.9-20元品牌对照表|流量单价与倍率实算|晚高峰质量筛选|避坑建议',
    relatedArticles: ['/pricing/articles/annual-to-monthly-calculation', '/pricing/articles/is-100gb-enough-monthly', '/pricing/articles/monthly-vs-non-expiring-value'],
    relatedBrands: ['ermao', 'u1s1', 'lingmao', 'guangsuyun'],
    relatedComparisons: ['/compare/guangsuyun-vs-ermao/'],
    conversionIntent: 'high',
    contentPriority: 'P0',
    sourceRequirements: '32家机场品牌清单.txt'
  },
  {
    targetUrl: '/pricing/articles/annual-to-monthly-calculation',
    articleTitle: '机场年付折算月价怎么算：拆解光速云 99元/年、微风 137元/年、5.6 元集群折算陷阱',
    primaryKeyword: '机场年付折算月价计算方法',
    secondaryKeywords: '机场年付折算月价|年付小包套路|5.6元年付陷阱|真实月付价格还原',
    longTailQuestions: '宣传5.6元一月的机场为什么点进去要付大几十？|年付折算月价和真实月付区别？|买年付机场划算吗？',
    searchIntent: 'informational',
    audience: 'all',
    contentType: 'guide',
    parentTopic: '/pricing/budget/',
    parentTopicName: '便宜机场拆解',
    parentCluster: 'c-pricing-13',
    summary: '拆解年付折算伪月价套路，实算光速云 99 元、微风 137 元与 5.6 元同质盘的真实门槛与沉没成本。',
    contentOutline: '折算公式|光速云与微风年付真实拆解|5.6元同质集群折算套路|沉没成本核算|决策清单',
    relatedArticles: ['/pricing/articles/under-20-yuan-monthly-guide', '/pricing/articles/monthly-vs-non-expiring-value', '/security/articles/long-term-prepaid-risks'],
    relatedBrands: ['guangsuyun', 'weifeng', 'shandianshu'],
    relatedComparisons: ['/compare/shandianshu-vs-dalaoyun/'],
    conversionIntent: 'medium',
    contentPriority: 'P0',
    sourceRequirements: '32家机场品牌清单.txt'
  },
  {
    targetUrl: '/pricing/articles/is-100gb-enough-monthly',
    articleTitle: '100GB 与 300GB 流量够用多久及如何选择：按视频/AI/测速耗流实测拆解',
    primaryKeyword: '机场100GB流量够用多久',
    secondaryKeywords: '100GB流量够用吗|300GB流量选型|YouTube看视频耗流量|测速跑流量消耗',
    longTailQuestions: '一个月100G流量够看视频吗？|查资料和用ChatGPT买多少流量够用？|为什么测几次速几十G没了？',
    searchIntent: 'informational',
    audience: 'all',
    contentType: 'guide',
    parentTopic: '/pricing/value/',
    parentTopicName: '性价比评估框架',
    parentCluster: 'c-pricing-23',
    summary: '按 1080p/4K 视频画质、AI 交互与多线程测速消耗，实测拆解 100GB 与 300GB 套餐的使用周期与匹配人群。',
    contentOutline: '用量结论|不同场景耗流模型表|4K流媒体与AI对话实测|测速倍率跑流预警|套餐档位推荐',
    relatedArticles: ['/pricing/articles/under-20-yuan-monthly-guide', '/pricing/articles/monthly-vs-non-expiring-value', '/routes/articles/low-ping-vs-download-speed'],
    relatedBrands: ['guangsuyun', 'ermao', 'weitu'],
    relatedComparisons: ['/compare/guangsuyun-vs-ermao/'],
    conversionIntent: 'medium',
    contentPriority: 'P0',
    sourceRequirements: '32家机场品牌清单.txt'
  },
  {
    targetUrl: '/pricing/articles/monthly-vs-non-expiring-value',
    articleTitle: '月付和不限时套餐哪个更划算：回本周期公式与停运沉没成本比较',
    primaryKeyword: '月付和不限时机场哪个划算',
    secondaryKeywords: '月付和不限时哪个划算|永久流量包回本周期|不限时套餐风险|冷备用流量包',
    longTailQuestions: '买不限时流量包划算还是按月买划算？|一次性流量包用不完会过期吗？|光速云147永久包多久能回本？',
    searchIntent: 'commercial',
    audience: 'all',
    contentType: 'comparison',
    parentTopic: '/pricing/non-expiring/',
    parentTopicName: '不限时流量包',
    parentCluster: 'c-pricing-21',
    summary: '给出不限时流量包回本周期计算公式，对比 15 家不限时品牌参数，评估机场运营寿命与沉没成本风险。',
    contentOutline: '核心计算公式|回本周期交叉测算|15家不限时品牌参数对比|停运沉没成本|主备搭配策略',
    relatedArticles: ['/pricing/articles/under-20-yuan-monthly-guide', '/pricing/articles/annual-to-monthly-calculation', '/security/articles/long-term-prepaid-risks'],
    relatedBrands: ['guangsuyun', 'ermao', 'yifan'],
    relatedComparisons: ['/compare/guangsuyun-vs-ermao/'],
    conversionIntent: 'high',
    contentPriority: 'P0',
    sourceRequirements: '32家机场品牌清单.txt'
  },

  // Pillar 3: brands
  {
    targetUrl: '/brands/articles/verify-official-site-vs-aff',
    articleTitle: '如何判断机场官网是否真实与识别 AFF 链接：揭秘注册跳板域名、code 参数与链接格式异常',
    primaryKeyword: '如何判断机场官网真伪',
    secondaryKeywords: '辨别机场官网真假|AFF推广链接识别|机场注册跳板域名|链接格式异常排查',
    longTailQuestions: '怎么判断搜出来的机场官网是不是假的？|AFF推广邀请链接和官网有什么区别？|注册链接缺少#为什么会报错？',
    searchIntent: 'informational',
    audience: 'all',
    contentType: 'guide',
    parentTopic: '/brands/official-sites/',
    parentTopicName: '官网与入口核验',
    parentCluster: 'c-brands-27',
    summary: '揭秘推广注册跳板域名原理、code 邀请参数与单页 Hash 路由机制，剖析 4 家格式异常品牌与防钓鱼准则。',
    contentOutline: '辨别原则|官方域名与AFF跳板区别|code参数与单页Hash原理|4家品牌格式异常案例|防钓鱼安全SOP',
    relatedArticles: ['/brands/articles/verify-brand-operating-years', '/brands/articles/coupon-code-not-working-fix', '/security/articles/what-to-do-if-airport-stops'],
    relatedBrands: ['yunjiexian', 'huanqiuti', 'liulianyun', 'firefly'],
    relatedComparisons: ['/compare/firefly-vs-lingmao/'],
    conversionIntent: 'medium',
    contentPriority: 'P0',
    sourceRequirements: '32家机场品牌清单.txt'
  },
  {
    targetUrl: '/brands/articles/verify-brand-operating-years',
    articleTitle: '机场品牌的运营时间如何核实：区分开业年份宣称、历史档案与实际可证日期',
    primaryKeyword: '机场品牌运营时间核实方法',
    secondaryKeywords: '核实机场运营时间|老牌机场真假|域名注册时间与开业年份|历史资料核验',
    longTailQuestions: '机场宣称运营5年是真的吗？|如何查询机场实际开业时间？|老牌机场跑路风险小吗？',
    searchIntent: 'informational',
    audience: 'all',
    contentType: 'guide',
    parentTopic: '/brands/directory/',
    parentTopicName: '31家品牌数据库',
    parentCluster: 'c-brands-25',
    summary: '教你区分开业年份宣称与可证历史资料，利用 Whois、历史测速快照和公告记录交叉核实品牌运营时间。',
    contentOutline: '核实方法|商家自述vs实证差异|31家品牌开业宣称四梯队|Whois与历史快照交叉验证|避坑要点',
    relatedArticles: ['/brands/articles/verify-official-site-vs-aff', '/brands/articles/maintenance-vs-shutdown-signs', '/airport/articles/how-to-judge-peak-stability'],
    relatedBrands: ['guangsuyun', 'xingdaomeng', 'lingdong'],
    relatedComparisons: ['/compare/feimao-vs-xingdaomeng/'],
    conversionIntent: 'medium',
    contentPriority: 'P0',
    sourceRequirements: '32家机场品牌清单.txt'
  },
  {
    targetUrl: '/brands/articles/coupon-code-not-working-fix',
    articleTitle: '机场优惠码无法使用怎么办与双码冲突排查：特价年付排除规则与 6 家双码记录',
    primaryKeyword: '机场优惠码无法使用怎么办',
    secondaryKeywords: '机场优惠码无效解决|双优惠码冲突|特价年付不适用优惠码|优惠券结账SOP',
    longTailQuestions: '为什么输入的机场优惠码提示无效？|两个优惠码能叠加使用吗？|特价套餐为什么不能打折？',
    searchIntent: 'troubleshooting',
    audience: 'all',
    contentType: 'guide',
    parentTopic: '/brands/promotions/',
    parentTopicName: '优惠码与冲突记录',
    parentCluster: 'c-brands-28',
    summary: '排查机场优惠券无法生效的原因，拆解特价年付排除规则与 6 家双码冲突品牌，提供标准结账验证步骤。',
    contentOutline: '排查步骤|特价年付排除规则|6家品牌双码/冲突记录|正确输入与大小写校验|结账止损建议',
    relatedArticles: ['/brands/articles/verify-official-site-vs-aff', '/pricing/articles/under-20-yuan-monthly-guide', '/pricing/articles/annual-to-monthly-calculation'],
    relatedBrands: ['lingmao', 'yinxingren', 'yifan', 'sogo', 'quanqiu', 'muguang'],
    relatedComparisons: ['/compare/firefly-vs-lingmao/'],
    conversionIntent: 'high',
    contentPriority: 'P0',
    sourceRequirements: '32家机场品牌清单.txt'
  },
  {
    targetUrl: '/brands/articles/maintenance-vs-shutdown-signs',
    articleTitle: '品牌临时维护与停止运营有什么区别：三方交叉核验流程与假失联判断',
    primaryKeyword: '机场维护与停止运营区别',
    secondaryKeywords: '机场临时维护还是跑路|假失联真停运判断|节点全红排查|机场跑路前兆',
    longTailQuestions: '机场所有节点全红是跑路了吗？|怎么判断机场是在维护还是停运？|遇到机场失联怎么办？',
    searchIntent: 'troubleshooting',
    audience: 'all',
    contentType: 'guide',
    parentTopic: '/brands/incidents/',
    parentTopicName: '运营风险与跑路',
    parentCluster: 'c-brands-29',
    summary: '建立 48 小时假失联与真停运判断框架，结合历史品牌停运证据，给出分级止损与备用容灾操作流程。',
    contentOutline: '现象区别|48小时假失联判断法|五类运营证据分级|历史品牌归档启示|四步止损SOP',
    relatedArticles: ['/brands/articles/verify-brand-operating-years', '/security/articles/what-to-do-if-airport-stops', '/troubleshooting/articles/nodes-all-timeout'],
    relatedBrands: ['lingdong', 'langwang', 'edgenova'],
    relatedComparisons: ['/compare/shandianshu-vs-dalaoyun/'],
    conversionIntent: 'medium',
    contentPriority: 'P0',
    sourceRequirements: '32家机场品牌清单.txt'
  },

  // Pillar 4: vpn
  {
    targetUrl: '/vpn/articles/vpn-vs-proxy-architecture',
    articleTitle: 'VPN 与代理有什么区别：底层协议、全局加密、分流能力与合规边界深度对比',
    primaryKeyword: 'VPN和机场代理有什么区别',
    secondaryKeywords: 'VPN与代理区别|WireGuard与Shadowsocks对比|全局接管与规则分流|隐私加密边界',
    longTailQuestions: 'VPN和机场梯子到底有什么不同？|买商业VPN好还是买机场订阅好？|为什么VPN不能智能分流国内网站？',
    searchIntent: 'informational',
    audience: 'all',
    contentType: 'guide',
    parentTopic: '/vpn/recommendations/',
    parentTopicName: 'VPN 场景推荐',
    parentCluster: 'c-vpn-37',
    summary: '从协议栈、虚拟网卡接管、分流效率与合规边界，深度对比传统商业 VPN 与规则代理机场的本质差异。',
    contentOutline: '架构对比表|底层协议差异|规则分流与全局虚拟网卡|使用场景对照|选型推荐',
    relatedArticles: ['/vpn/articles/vpn-privacy-policy-audit', '/troubleshooting/articles/udp-nat-firewall-blocks', '/guides/articles/windows-proxy-client-setup'],
    relatedBrands: ['guangsuyun'],
    relatedComparisons: ['/compare/guangsuyun-vs-feimao/'],
    conversionIntent: 'medium',
    contentPriority: 'P0',
    sourceRequirements: '内容矩阵.txt + 第三方代理客户端.txt'
  },
  {
    targetUrl: '/vpn/articles/vpn-privacy-policy-audit',
    articleTitle: '免费 VPN 有哪些限制与隐私风险：DNS 泄漏、日志转卖与明文劫持技术真相',
    primaryKeyword: '免费VPN有什么风险和限制',
    secondaryKeywords: '免费VPN安全风险|免费代理流量变现|DNS泄漏检测|隐私日志收集',
    longTailQuestions: '免费VPN靠什么赚钱？|用免费VPN会不会泄露密码和个人隐私？|为什么免费VPN速度极慢？',
    searchIntent: 'informational',
    audience: 'all',
    contentType: 'guide',
    parentTopic: '/vpn/free/',
    parentTopicName: '免费 VPN 风险',
    parentCluster: 'c-vpn-39',
    summary: '剖析免费网络工具的流量变现模式，实测演示 DNS 与 IPv6 泄漏风险，揭秘免费工具背后的隐私代价。',
    contentOutline: '风险概述|五类商业变现模式|DNS/IPv6/WebRTC泄漏实测|明文流量嗅探风险|安全合规替代思路',
    relatedArticles: ['/vpn/articles/vpn-vs-proxy-architecture', '/pricing/articles/under-20-yuan-monthly-guide', '/security/articles/long-term-prepaid-risks'],
    relatedBrands: ['general'],
    relatedComparisons: ['/compare/weifeng-vs-wuyou/'],
    conversionIntent: 'high',
    contentPriority: 'P0',
    sourceRequirements: '内容矩阵.txt'
  },
  {
    targetUrl: '/vpn/articles/mobile-vpn-auto-disconnect',
    articleTitle: '手机 VPN 为什么会自动断开：iOS NetworkExtension 与 Android 电池优化深度排查',
    primaryKeyword: '手机VPN自动断开排查',
    secondaryKeywords: '手机VPN老是断开|安卓代理后台被杀|iOS小火箭锁屏断流|系统省电策略排查',
    longTailQuestions: '手机锁屏后代理为什么就断了？|安卓怎么设置客户端常驻后台不被清理？|iOS如何防止VPN自动休眠？',
    searchIntent: 'troubleshooting',
    audience: 'all',
    contentType: 'guide',
    parentTopic: '/vpn/mobile/',
    parentTopicName: '手机 VPN 机制',
    parentCluster: 'c-vpn-41',
    summary: '针对手机端后台断流现象，深入排查 iOS 50MB 内存限制与 Android 厂商深度休眠策略，给出保活配置 SOP。',
    contentOutline: '现象原因|iOS系统50MB内存与保活机制|Android电池优化与厂商ROM策略|四步解决保活SOP|回滚检查',
    relatedArticles: ['/guides/articles/android-import-subscription-guide', '/guides/articles/iphone-shadowrocket-add-sub', '/troubleshooting/articles/android-v2rayng-clash-disconnect'],
    relatedBrands: ['general'],
    relatedComparisons: [],
    conversionIntent: 'low',
    contentPriority: 'P0',
    sourceRequirements: '第三方代理客户端.txt + issue-map.json'
  },
  {
    targetUrl: '/troubleshooting/articles/udp-nat-firewall-blocks',
    articleTitle: 'VPN 和游戏加速器有什么不同：UDP 转发、NAT 类型与延迟抖动机制剖析',
    primaryKeyword: '游戏加速器和代理机场区别',
    secondaryKeywords: '游戏加速器与机场区别|UDP转发与NAT类型|外服联机延迟抖动|FullCone排查',
    longTailQuestions: '打外服游戏可以用机场节点代替加速器吗？|为什么用机场玩游戏老是NAT严格或掉线？|加速器和代理协议有何不同？',
    searchIntent: 'informational',
    audience: 'gamer',
    contentType: 'guide',
    parentTopic: '/vpn/gaming/',
    parentTopicName: '游戏加速器原理',
    parentCluster: 'c-vpn-45',
    summary: '解读 UDP 代理机制与 FullCone/Symmetric NAT 类型，分析游戏联机延迟抖动与普通测速带宽的本质区别。',
    contentOutline: '原理对比|UDP与NAT四种类型解析|丢包与延迟抖动对游戏影响|实测图UDP字段解读|游戏选型指引',
    relatedArticles: ['/vpn/articles/vpn-vs-proxy-architecture', '/routes/articles/low-ping-vs-download-speed', '/troubleshooting/articles/udp-nat-firewall-blocks'],
    relatedBrands: ['general'],
    relatedComparisons: [],
    conversionIntent: 'medium',
    contentPriority: 'P0',
    sourceRequirements: '内容矩阵.txt + speedtest-manifest.json'
  },

  // Pillar 5: clients
  {
    targetUrl: '/clients/articles/clash-verge-rev-install-guide',
    articleTitle: 'Clash Verge Rev 新手安装与订阅配置指南：内核切换、TUN 授权与分流设置',
    primaryKeyword: 'Clash Verge Rev新手安装配置教程',
    secondaryKeywords: 'Clash Verge Rev安装教程|Mihomo内核配置|TUN模式虚拟网卡授权|订阅导入分流',
    longTailQuestions: 'Clash Verge Rev怎么导入机场订阅？|TUN模式怎么开启？|Windows和Mac安装有什么注意事项？',
    searchIntent: 'how-to',
    audience: 'beginner',
    contentType: 'tutorial',
    parentTopic: '/clients/clash-verge/',
    parentTopicName: 'Clash Verge Rev',
    parentCluster: 'c-clients-49',
    summary: '从安装包架构识别到 Mihomo 内核切换、TUN 虚拟网卡授权与 Rule 模式分流，一步步完成新手配置。',
    contentOutline: '准备事项|安装包系统架构匹配|订阅导入四步|TUN虚拟网卡授权与回滚|常见排错',
    relatedArticles: ['/clients/articles/flclash-vs-clash-verge-rev', '/guides/articles/windows-proxy-client-setup', '/troubleshooting/articles/clash-verge-startup-fail'],
    relatedBrands: ['general'],
    relatedComparisons: ['/compare/guangsuyun-vs-feimao/'],
    conversionIntent: 'medium',
    contentPriority: 'P0',
    sourceRequirements: '第三方代理客户端.txt'
  },
  {
    targetUrl: '/troubleshooting/articles/v2rayn-core-load-fail',
    articleTitle: 'v2rayN 多核心如何选择与切换：Xray vs sing-box 内核差异与系统代理避坑',
    primaryKeyword: 'v2rayN多核心区别与切换',
    secondaryKeywords: 'v2rayN多核心选择|Xray与sing-box区别|v2rayN核心加载失败|系统代理自动还原',
    longTailQuestions: 'v2rayN里Xray和sing-box核心有什么区别？|如何切换v2rayN路由模式？|提示核心加载失败怎么解决？',
    searchIntent: 'how-to',
    audience: 'all',
    contentType: 'tutorial',
    parentTopic: '/clients/v2rayn/',
    parentTopicName: 'v2rayN 客户端',
    parentCluster: 'c-clients-53',
    summary: '拆解 v2rayN 内部 Xray 与 sing-box 双核心机制，详解路由规则设置、系统代理自动还原与 .NET 依赖修复。',
    contentOutline: '核心架构|Xray与sing-box协议与性能对比|多核心切换实操|系统代理避坑与回滚|.NET依赖修复',
    relatedArticles: ['/clients/articles/clash-verge-rev-install-guide', '/guides/articles/windows-proxy-client-setup', '/troubleshooting/articles/v2rayn-core-load-fail'],
    relatedBrands: ['general'],
    relatedComparisons: [],
    conversionIntent: 'low',
    contentPriority: 'P0',
    sourceRequirements: '第三方代理客户端.txt + issue-map.json'
  },
  {
    targetUrl: '/guides/articles/iphone-shadowrocket-add-sub',
    articleTitle: 'Shadowrocket 如何添加订阅与分流配置：美区 Apple ID 获取、规则更新与防断流',
    primaryKeyword: '小火箭Shadowrocket安装与添加订阅教程',
    secondaryKeywords: '小火箭Shadowrocket配置|iOS添加订阅教程|美区Apple ID安全|Shadowrocket规则更新',
    longTailQuestions: 'iPhone怎么下载小火箭Shadowrocket？|小火箭怎么添加订阅链接？|切区下载禁止登录iCloud红线？',
    searchIntent: 'how-to',
    audience: 'all',
    contentType: 'tutorial',
    parentTopic: '/clients/shadowrocket/',
    parentTopicName: 'Shadowrocket 小火箭',
    parentCluster: 'c-clients-55',
    summary: '手把手教你在 iOS 设备上配置小火箭，涵盖美区 ID 切区红线（严禁登录系统设置）、订阅导入与分流配置。',
    contentOutline: '准备事项|美区ID切区严禁登录系统iCloud|订阅添加步骤|规则分流与防断流配置|常见问题自检',
    relatedArticles: ['/guides/articles/iphone-shadowrocket-add-sub', '/vpn/articles/mobile-vpn-auto-disconnect', '/security/articles/what-to-do-if-airport-stops'],
    relatedBrands: ['general'],
    relatedComparisons: [],
    conversionIntent: 'high',
    contentPriority: 'P0',
    sourceRequirements: '第三方代理客户端.txt'
  },
  {
    targetUrl: '/clients/articles/flclash-vs-clash-verge-rev',
    articleTitle: 'Mihomo 和 Clash 有什么关系：内核演进、YAML 规则兼容与衍生客户端生态辨析',
    primaryKeyword: 'Mihomo和Clash有什么关系',
    secondaryKeywords: 'Mihomo和Clash区别|Clash.Meta演进历史|YAML配置兼容性|Mihomo衍生客户端',
    longTailQuestions: 'Mihomo是Clash吗？|为什么原版Clash删库后大家都用Mihomo？|FlClash和Clash Verge有什么不同？',
    searchIntent: 'informational',
    audience: 'all',
    contentType: 'guide',
    parentTopic: '/clients/mihomo/',
    parentTopicName: 'Mihomo 内核',
    parentCluster: 'c-clients-57',
    summary: '厘清 Clash 到 Clash.Meta 再到 Mihomo 的演进路径，辨析衍生客户端生态与维护状态风险提示。',
    contentOutline: '演进历史|内核分层与外壳分工|新协议（VLESS/Hysteria2）支持|衍生端维护状态警示|配置规范',
    relatedArticles: ['/clients/articles/clash-verge-rev-install-guide', '/guides/articles/verify-proxy-is-working', '/troubleshooting/articles/clash-verge-mihomo-yaml-fail'],
    relatedBrands: ['general'],
    relatedComparisons: [],
    conversionIntent: 'low',
    contentPriority: 'P0',
    sourceRequirements: '第三方代理客户端.txt'
  },

  // Pillar 6: ai-media
  {
    targetUrl: '/ai-media/articles/chatgpt-region-unsupported-fix',
    articleTitle: 'ChatGPT 提示地区不支持怎么办：OpenAI IP 风控、仅 APP(HK) 识别与静态分流方案',
    primaryKeyword: 'ChatGPT提示地区不支持解决办法',
    secondaryKeywords: 'ChatGPT地区不支持排查|OpenAI仅APP(HK)|香港节点访问ChatGPT|AI独立分流规则',
    longTailQuestions: 'ChatGPT提示Not Available in Your Country怎么解决？|为什么香港节点只能用手机App不能用网页版？|怎么配置规则让ChatGPT走指定节点？',
    searchIntent: 'troubleshooting',
    audience: 'all',
    contentType: 'guide',
    parentTopic: '/ai-media/chatgpt/',
    parentTopicName: 'ChatGPT 机场适配',
    parentCluster: 'c-ai-61',
    summary: '排查 OpenAI 地区封锁与机房 IP 连坐机制，深入解读香港专线仅 APP(HK) 差异，给出规则分流锁定 SOP。',
    contentOutline: '现象原因|OpenAI IP风控与机房ASN封锁|香港专线仅APP(HK)实测解读|客户端静态分流SOP|结果验证',
    relatedArticles: ['/ai-media/articles/claude-connection-ban-risks', '/ai-media/articles/gemini-something-went-wrong-fix', '/guides/articles/verify-proxy-is-working'],
    relatedBrands: ['guangsuyun', 'sujie', 'lingdong'],
    relatedComparisons: ['/compare/guangsuyun-vs-feimao/'],
    conversionIntent: 'medium',
    contentPriority: 'P0',
    sourceRequirements: '32家机场品牌清单.txt + Miaoko截图'
  },
  {
    targetUrl: '/ai-media/articles/claude-connection-ban-risks',
    articleTitle: 'Claude 连接失败如何排查：Anthropic 机房 IP 判定、切节点封号风险与出站规避',
    primaryKeyword: 'Claude连接失败与节点封号排查',
    secondaryKeywords: 'Claude无法访问解决|Anthropic机房IP风控|Claude切节点封号|静态出站策略',
    longTailQuestions: 'Claude提示App unavailable怎么解决？|经常切换节点会导致Claude封号吗？|什么样的节点能稳定用Claude？',
    searchIntent: 'troubleshooting',
    audience: 'all',
    contentType: 'guide',
    parentTopic: '/ai-media/claude/',
    parentTopicName: 'Claude 节点风控',
    parentCluster: 'c-ai-63',
    summary: '剖析 Anthropic 对机房 IP 与 ASN 连坐的高压风控，解析自动测速切节点封号风险，提供稳定单区出口配置。',
    contentOutline: '风控机制|Anthropic IP声誉与连坐风险|url-test自动切点大忌|固定单区静态策略|账号防封SOP',
    relatedArticles: ['/ai-media/articles/chatgpt-region-unsupported-fix', '/ai-media/articles/gemini-something-went-wrong-fix', '/routes/articles/native-ip-vs-datacenter-ip'],
    relatedBrands: ['guangsuyun', 'kexin'],
    relatedComparisons: ['/compare/sogo-vs-kexin/'],
    conversionIntent: 'medium',
    contentPriority: 'P0',
    sourceRequirements: '32家机场品牌清单.txt'
  },
  {
    targetUrl: '/ai-media/articles/gemini-something-went-wrong-fix',
    articleTitle: 'Gemini 出现 Something went wrong 怎么办：Google GeoIP 送中检测与 AI Studio 域名分流',
    primaryKeyword: 'Gemini报错Something went wrong解决',
    secondaryKeywords: 'Gemini报错解决|Google GeoIP送中|AI Studio分流规则|Gemini节点区域要求',
    longTailQuestions: 'Gemini提示Something went wrong怎么解决？|为什么连了节点Gemini还是打不开？|YouTube送中会影响Gemini吗？',
    searchIntent: 'troubleshooting',
    audience: 'all',
    contentType: 'guide',
    parentTopic: '/ai-media/gemini/',
    parentTopicName: 'Gemini 区域可用性',
    parentCluster: 'c-ai-65',
    summary: '排查 Google GeoIP 与 YouTube 送中(CN)联动阻断 Gemini 的成因，配置 AI Studio 独立分流策略与缓存清理。',
    contentOutline: '报错本质|Google生态GeoIP联动机制|实测截图新马土解锁对比|AI Studio域名独立分流|清缓存验证',
    relatedArticles: ['/ai-media/articles/chatgpt-region-unsupported-fix', '/ai-media/articles/netflix-originals-vs-full-unlock', '/routes/articles/low-ping-vs-download-speed'],
    relatedBrands: ['guangsuyun', 'kexin'],
    relatedComparisons: ['/compare/sogo-vs-kexin/'],
    conversionIntent: 'medium',
    contentPriority: 'P0',
    sourceRequirements: '32家机场品牌清单.txt + Miaoko截图'
  },
  {
    targetUrl: '/ai-media/articles/netflix-originals-vs-full-unlock',
    articleTitle: 'Netflix 原创内容和地区内容有什么区别：原生住宅 IP、DNS 解锁与送中判定辨析',
    primaryKeyword: 'Netflix只能看自制剧怎么办',
    secondaryKeywords: 'Netflix自制剧与非自制剧|Netflix解锁原理|原生住宅IP与商宽机房IP|落地识别偏差',
    longTailQuestions: '为什么Netflix只能看自制剧不能看地区剧？|怎么知道自己的节点是不是原生解锁？|Netflix提示检测到代理怎么办？',
    searchIntent: 'informational',
    audience: 'streamer',
    contentType: 'guide',
    parentTopic: '/ai-media/netflix/',
    parentTopicName: 'Netflix 解锁解析',
    parentCluster: 'c-ai-67',
    summary: '拆解 Netflix 三级解锁判定与原生住宅 IP、商宽机房 IP 差异，分析实测截图中的落地识别偏差与大屏排障。',
    contentOutline: '解锁三层级|原生IP与DNS解锁区别|实测台湾识别ES与GB证据剖析|大屏4K DRM排障|避坑指南',
    relatedArticles: ['/ai-media/articles/gemini-something-went-wrong-fix', '/routes/articles/native-ip-vs-datacenter-ip', '/routes/japan/'],
    relatedBrands: ['lingdong', 'guangsuyun', 'wuyou'],
    relatedComparisons: ['/compare/weifeng-vs-wuyou/'],
    conversionIntent: 'medium',
    contentPriority: 'P0',
    sourceRequirements: '32家机场品牌清单.txt + 实测截图'
  },

  // Pillar 7: routes
  {
    targetUrl: '/routes/articles/iepl-vs-iplc-differences',
    articleTitle: 'IEPL 和 IPLC 有什么区别：二层以太网 vs 专线点对点架构与宣传辨析',
    primaryKeyword: 'IEPL和IPLC有什么区别',
    secondaryKeywords: 'IEPL与IPLC区别|专线机场架构|二层内网以太网|跨境专线宣传辨析',
    longTailQuestions: '买机场选IEPL专线好还是IPLC好？|专线真的永远不会卡顿断线吗？|为什么有些专线晚高峰也会丢包？',
    searchIntent: 'informational',
    audience: 'all',
    contentType: 'guide',
    parentTopic: '/routes/iepl/',
    parentTopicName: 'IEPL 专线原理',
    parentCluster: 'c-routes-73',
    summary: '从物理二层内网、抖动控制与过境机制，对比 IEPL 与 IPLC 的技术架构，澄清所谓专线永不掉线四大神话。',
    contentOutline: '概念定义|拓扑架构差异表|入口中转与跨境专线分工|永不掉线神话澄清|选型决策',
    relatedArticles: ['/routes/articles/how-to-spot-unverified-iepl', '/routes/articles/low-ping-vs-download-speed', '/airport/articles/how-to-judge-peak-stability'],
    relatedBrands: ['guangsuyun', 'weifeng', 'wuyou'],
    relatedComparisons: ['/compare/weifeng-vs-wuyou/'],
    conversionIntent: 'medium',
    contentPriority: 'P0',
    sourceRequirements: '32家机场品牌清单.txt'
  },
  {
    targetUrl: '/routes/articles/low-ping-vs-download-speed',
    articleTitle: '延迟低是否意味着下载速度快：RTT vs HTTPS Ping 与 32 线程测速 vs 单线程体感',
    primaryKeyword: '节点延迟低下载速度就快吗',
    secondaryKeywords: '延迟低下载速度就快吗|RTT与HTTPS延迟|32线程测速真相|单线程体感延迟',
    longTailQuestions: '为什么节点Ping只有30ms但网页打不开？|测速跑500M为什么看视频还是卡？|四类延迟指标如何区分？',
    searchIntent: 'informational',
    audience: 'all',
    contentType: 'guide',
    parentTopic: '/routes/low-latency/',
    parentTopicName: '低延迟节点真相',
    parentCluster: 'c-routes-81',
    summary: '辨析 ICMP、TCP握手、TLS RTT 与真实网页单线程延迟，揭示 32 线程多连接测速虚高与假绿死节点真相。',
    contentOutline: '核心误区|四类延迟概念辨析|32线程吞吐vs单线程真实网页打开|假绿死节点识别|自主复测SOP',
    relatedArticles: ['/routes/articles/iepl-vs-iplc-differences', '/airport/articles/how-to-judge-peak-stability', '/pricing/articles/is-100gb-enough-monthly'],
    relatedBrands: ['guangsuyun', 'kexin'],
    relatedComparisons: ['/compare/sogo-vs-kexin/'],
    conversionIntent: 'low',
    contentPriority: 'P0',
    sourceRequirements: 'README_16个机场测速实测资料_最新版.txt'
  },
  {
    targetUrl: '/routes/articles/native-ip-vs-datacenter-ip',
    articleTitle: '原生 IP 和机房 IP 有什么区别：Miaoko IPType/IPRisk 解读与解锁边界',
    primaryKeyword: '原生IP和机房IP有什么区别',
    secondaryKeywords: '原生IP与机房IP区别|Miaoko IPType解读|住宅住宅与机房商宽|IPRisk风控分',
    longTailQuestions: '什么是原生IP？|机房IP会被哪些网站风控？|怎么看测速图里的IPType和IPRisk？',
    searchIntent: 'informational',
    audience: 'all',
    contentType: 'guide',
    parentTopic: '/routes/',
    parentTopicName: '线路与节点',
    parentCluster: 'c-routes-79',
    summary: '详解 Miaoko 测速面板中 IPType 与 IPRisk 含义，对比原生住宅 IP、商宽机房 IP 与 DNS 分流解锁的实质差异。',
    contentOutline: '定义对比|IPType与IPRisk字段解读|流媒体与AI平台风控逻辑|商宽机房+DNS落地解锁机制|测试核查',
    relatedArticles: ['/ai-media/articles/claude-connection-ban-risks', '/ai-media/articles/netflix-originals-vs-full-unlock', '/routes/articles/how-to-spot-unverified-iepl'],
    relatedBrands: ['general'],
    relatedComparisons: [],
    conversionIntent: 'low',
    contentPriority: 'P0',
    sourceRequirements: 'Miaoko测速截图 + 32家机场品牌清单.txt'
  },
  {
    targetUrl: '/routes/articles/how-to-spot-unverified-iepl',
    articleTitle: '如何识别未经验证的专线宣传：比对 2026-10-19 趋同表与 0B/晚高峰丢包证据',
    primaryKeyword: '如何识别虚假专线宣传',
    secondaryKeywords: '虚假专线识别|伪IEPL公网中转|晚高峰丢包率分析|0B异常节点证据',
    longTailQuestions: '怎么知道机场宣传的IEPL专线是不是真的？|为什么几块钱的机场也敢宣称全IEPL专线？|测速图里出现0B代表什么？',
    searchIntent: 'informational',
    audience: 'all',
    contentType: 'guide',
    parentTopic: '/routes/iepl/',
    parentTopicName: 'IEPL 专线原理',
    parentCluster: 'c-routes-73',
    summary: '拆解低价专线高复用成本账本，比对 10-19 趋同表格与实测截图，教你从丢包率与 0B 节点中识别虚假专线。',
    contentOutline: '识别方法|5.6元低价高复用专线成本账本|10-19趋同表与08-11实测截图对比|0B节点异常深度剖析|防坑清单',
    relatedArticles: ['/routes/articles/iepl-vs-iplc-differences', '/airport/articles/how-to-judge-peak-stability', '/pricing/articles/annual-to-monthly-calculation'],
    relatedBrands: ['guangsuyun', 'weifeng', 'shandianshu'],
    relatedComparisons: ['/compare/shandianshu-vs-dalaoyun/'],
    conversionIntent: 'medium',
    contentPriority: 'P0',
    sourceRequirements: '32家机场品牌清单.txt + 测速图'
  },

  // Pillar 8: guides
  {
    targetUrl: '/guides/articles/windows-proxy-client-setup',
    articleTitle: 'Windows 如何配置代理客户端：从校时、导入订阅到 Rule 模式与系统代理/TUN 切换',
    primaryKeyword: 'Windows代理客户端配置教程',
    secondaryKeywords: 'Windows代理配置教程|Clash Verge Windows设置|系统校时与TLS错误|系统代理与TUN切换',
    longTailQuestions: 'Windows电脑怎么设置代理客户端？|系统时间不对导致节点全超时怎么修复？|TUN模式在Win下怎么打开？',
    searchIntent: 'how-to',
    audience: 'all',
    contentType: 'tutorial',
    parentTopic: '/guides/installation/',
    parentTopicName: '多平台安装指南',
    parentCluster: 'c-guides-93',
    summary: 'Windows 桌面环境从时间同步校准到 Clash Verge 安装、订阅导入、分流模式与虚拟网卡切换全流程。',
    contentOutline: '系统准备|校时命令w32tm实操|客户端安装与订阅导入|Rule分流与TUN授权|退出断网回滚SOP',
    relatedArticles: ['/clients/articles/clash-verge-rev-install-guide', '/guides/articles/verify-proxy-is-working', '/troubleshooting/articles/time-sync-tls-cert-error'],
    relatedBrands: ['general'],
    relatedComparisons: [],
    conversionIntent: 'low',
    contentPriority: 'P0',
    sourceRequirements: '第三方代理客户端.txt'
  },
  {
    targetUrl: '/guides/articles/android-import-subscription-guide',
    articleTitle: 'Android 如何导入订阅与防杀后台：v2rayNG / FlClash / Karing 实操与电池优化',
    primaryKeyword: '安卓代理软件导入订阅教程',
    secondaryKeywords: '安卓导入订阅教程|v2rayNG使用教程|Android防杀后台设置|分应用代理AccessControl',
    longTailQuestions: '安卓手机怎么添加机场订阅链接？|国产手机怎么防止代理后台自动断开？|安卓推荐哪款代理软件？',
    searchIntent: 'how-to',
    audience: 'all',
    contentType: 'tutorial',
    parentTopic: '/guides/subscriptions/',
    parentTopicName: '机场订阅教程',
    parentCluster: 'c-guides-85',
    summary: '涵盖 v2rayNG 与多内核客户端的安装、订阅导入、国产 ROM 电池白名单设置与分应用代理实操。',
    contentOutline: '软件准备|防仿冒核验|订阅导入步骤|电池白名单与保活设置|分应用分流配置',
    relatedArticles: ['/vpn/articles/mobile-vpn-auto-disconnect', '/guides/articles/verify-proxy-is-working', '/troubleshooting/articles/android-v2rayng-clash-disconnect'],
    relatedBrands: ['general'],
    relatedComparisons: [],
    conversionIntent: 'low',
    contentPriority: 'P0',
    sourceRequirements: '第三方代理客户端.txt'
  },
  {
    targetUrl: '/guides/articles/iphone-shadowrocket-add-sub',
    articleTitle: 'iPhone 如何添加订阅与切区安全红线：禁登录系统 iCloud 与 Shadowrocket 规则更新',
    primaryKeyword: 'iPhone小火箭添加订阅教程',
    secondaryKeywords: 'iPhone小火箭配置教程|Shadowrocket添加订阅|美区ID切区禁登iCloud|Shadowrocket规则配置',
    longTailQuestions: 'iPhone小火箭怎么导入节点？|购买美区Apple ID切区要注意什么？|为什么绝对不能在设置里登录别人iCloud？',
    searchIntent: 'how-to',
    audience: 'all',
    contentType: 'tutorial',
    parentTopic: '/guides/subscriptions/',
    parentTopicName: '机场订阅教程',
    parentCluster: 'c-guides-85',
    summary: 'iPhone 端添加小火箭订阅实操，特别警示仅限在 App Store 登录切区、严禁在系统设置登录他人 iCloud 的安全红线。',
    contentOutline: '安全红线|App Store切区严禁登录系统设置iCloud|小火箭订阅导入五步|规则文件更新与分流|防断网回滚',
    relatedArticles: ['/guides/articles/iphone-shadowrocket-add-sub', '/guides/articles/verify-proxy-is-working', '/security/articles/what-to-do-if-airport-stops'],
    relatedBrands: ['general'],
    relatedComparisons: [],
    conversionIntent: 'high',
    contentPriority: 'P0',
    sourceRequirements: '第三方代理客户端.txt'
  },
  {
    targetUrl: '/guides/articles/verify-proxy-is-working',
    articleTitle: '如何确认客户端分流与 DNS 设置已经生效：三项可验证检查路径与退出回滚',
    primaryKeyword: '怎么确认代理分流设置生效',
    secondaryKeywords: '确认代理分流生效|DNS泄漏检测|国内IP直连验证|退出代理断网回滚',
    longTailQuestions: '怎么知道代理分流有没有生效？|国内网站有没有走代理浪费流量？|退出软件后上不了网怎么修复？',
    searchIntent: 'how-to',
    audience: 'all',
    contentType: 'tutorial',
    parentTopic: '/guides/split-routing/',
    parentTopicName: '分流规则配置',
    parentCluster: 'c-guides-89',
    summary: '提供国内 IP 直连、海外落地检测与 DNS 泄漏测试三项可观测检查路径，附带退出代理软件后断网一分钟回滚步骤。',
    contentOutline: '验证目标|三项可验证检查命令|国内直连与海外代理分流验证|DNS泄漏检测|退出断网一分钟回滚',
    relatedArticles: ['/guides/articles/windows-proxy-client-setup', '/troubleshooting/articles/connected-no-internet', '/troubleshooting/articles/fake-ip-explained-fix'],
    relatedBrands: ['general'],
    relatedComparisons: [],
    conversionIntent: 'low',
    contentPriority: 'P0',
    sourceRequirements: '第三方代理客户端.txt'
  },

  // Pillar 9: security
  {
    targetUrl: '/security/articles/what-to-do-if-airport-stops',
    articleTitle: '机场突然停止服务应该怎么办：先排本地故障再取证止损与切换备用方案',
    primaryKeyword: '机场突然停运怎么办',
    secondaryKeywords: '机场突然停运解决|机场失联应对|工单取证止损|备用容灾配置',
    longTailQuestions: '买的机场打不开了怎么办？|怎么知道机场是跑路了还是临时维护？|机场停运怎么申请退款或维权？',
    searchIntent: 'troubleshooting',
    audience: 'all',
    contentType: 'guide',
    parentTopic: '/security/shutdown/',
    parentTopicName: '机场跑路识别',
    parentCluster: 'c-security-109',
    summary: '面对节点全红与服务失联，先排查本地系统与网络，三方交叉核验真假跑路，并执行留证止损与备用切换。',
    contentOutline: '第一步排查|本地系统与网络快速自检|三方交叉核验真假跑路|付款凭证留存与止损|双备用容灾切换',
    relatedArticles: ['/brands/articles/maintenance-vs-shutdown-signs', '/security/articles/how-to-preserve-payment-evidence', '/security/articles/checklist-before-switching-airport'],
    relatedBrands: ['lingdong', 'langwang', 'edgenova'],
    relatedComparisons: ['/compare/shandianshu-vs-dalaoyun/'],
    conversionIntent: 'medium',
    contentPriority: 'P0',
    sourceRequirements: '32家机场品牌清单.txt'
  },
  {
    targetUrl: '/security/articles/long-term-prepaid-risks',
    articleTitle: '长期预付年付机场套餐有哪些风险：沉没成本、不退款条款与 2026-08-09 历史品牌启示',
    primaryKeyword: '机场年付长期套餐风险',
    secondaryKeywords: '机场长期预付风险|年付大包沉没成本|特殊商品不退款条款|低试错月付原则',
    longTailQuestions: '买三年付甚至永久套餐靠谱吗？|为什么很多机场在服务条款里写明不退款？|年付套餐最大的风险是什么？',
    searchIntent: 'informational',
    audience: 'all',
    contentType: 'guide',
    parentTopic: '/security/avoid-pitfalls/',
    parentTopicName: '常见买机场避坑',
    parentCluster: 'c-security-111',
    summary: '剖析长期大额预付的三大沉没陷阱，审计 31 家品牌不退款条款现状，结合历史停运案例建立低试错决策体系。',
    contentOutline: '风险拆解|大额预付三大沉没陷阱|31家品牌退款现状审计|历史服务停运案例启示|低试错支付策略',
    relatedArticles: ['/pricing/articles/annual-to-monthly-calculation', '/pricing/articles/monthly-vs-non-expiring-value', '/security/articles/what-to-do-if-airport-stops'],
    relatedBrands: ['guangsuyun', 'shandianshu', 'lingdong'],
    relatedComparisons: ['/compare/guangsuyun-vs-feimao/'],
    conversionIntent: 'medium',
    contentPriority: 'P0',
    sourceRequirements: '32家机场品牌清单.txt'
  },
  {
    targetUrl: '/security/articles/how-to-preserve-payment-evidence',
    articleTitle: '如何保留付款记录与工单沟通证据：订单流水、脱敏截图与售后争议应对',
    primaryKeyword: '机场付款记录与证据留存',
    secondaryKeywords: '机场付款凭证保留|工单沟通截图脱敏|虚拟商品退款维权|支付流水留存',
    longTailQuestions: '买机场付款后没到账怎么找客服？|如何保留订单流水和沟通记录？|工单求助时怎样保护隐私？',
    searchIntent: 'how-to',
    audience: 'all',
    contentType: 'guide',
    parentTopic: '/security/refund/',
    parentTopicName: '退款边界与争议',
    parentCluster: 'c-security-115',
    summary: '提供支付流水留存、工单沟通脱敏截图规范与重复扣费申诉模板，明确虚拟数字商品的维权与止损边界。',
    contentOutline: '留存清单|支付订单号与商户单号留存|工单脱敏截图规范|重复扣费与掉单申诉模板|维权边界说明',
    relatedArticles: ['/security/articles/what-to-do-if-airport-stops', '/security/articles/long-term-prepaid-risks', '/brands/articles/coupon-code-not-working-fix'],
    relatedBrands: ['general'],
    relatedComparisons: [],
    conversionIntent: 'low',
    contentPriority: 'P0',
    sourceRequirements: '内容矩阵.txt'
  },
  {
    targetUrl: '/security/articles/checklist-before-switching-airport',
    articleTitle: '机场服务更换前应该检查什么：防同系套娃、协议兼容性与配置平滑迁移清单',
    primaryKeyword: '更换机场前检查清单',
    secondaryKeywords: '更换机场前检查清单|防同系换壳机场|订阅配置平滑迁移|多备用容灾方案',
    longTailQuestions: '换新机场前需要做哪些准备？|如何避免换来换去换到同一个老板的同系机场？|旧订阅节点怎么备份？',
    searchIntent: 'checklist',
    audience: 'all',
    contentType: 'checklist',
    parentTopic: '/security/alternatives/',
    parentTopicName: '服务失联替代方案',
    parentCluster: 'c-security-113',
    summary: '换新机场前必做的五项核验：识别同系换壳盘、核对客户端与协议支持、旧订阅备份与平滑迁移清单。',
    contentOutline: '检查清单|同系换壳盘与模板特征识别|客户端与协议兼容性核对|旧配置导出与无缝切换SOP|备用容灾配置',
    relatedArticles: ['/airport/articles/native-app-vs-third-party-beginners', '/security/articles/what-to-do-if-airport-stops', '/troubleshooting/articles/client-migration-backup'],
    relatedBrands: ['general'],
    relatedComparisons: ['/compare/guangsuyun-vs-feimao/'],
    conversionIntent: 'high',
    contentPriority: 'P0',
    sourceRequirements: '32家机场品牌清单.txt'
  }
]

// 4. Define 8 brand comparisons registry
const COMPARE_PAIRS = [
  {
    slug: 'guangsuyun-vs-feimao',
    targetUrl: '/compare/guangsuyun-vs-feimao/',
    articleTitle: '光速云 vs 飞猫云 对比评测：全能主力配置与自研小白模式的深度权衡',
    primaryKeyword: '光速云和飞猫云哪个好',
    secondaryKeywords: '光速云对比飞猫云|自研客户端与Clash订阅对比|新手选光速云还是飞猫云',
    longTailQuestions: '光速云和飞猫云哪个更好用？|新手买飞猫云还是光速云？|光速云支持第三方客户端吗？',
    searchIntent: 'comparison',
    audience: 'all',
    contentType: 'comparison',
    parentTopic: '/brands/alternatives/',
    parentTopicName: '品牌替代方案',
    parentCluster: 'c-brands-30',
    summary: '对比光速云（自研+第三方开源全协议支持）与飞猫云（纯自研客户端小白极简）在上手门槛、节点自由度与月付价格上的差异。',
    contentOutline: '比较结论|同口径核心参数表|自研端vs通用订阅差异|起步价格与套餐实测|适用人群与选型建议',
    relatedArticles: ['/airport/articles/native-app-vs-third-party-beginners', '/pricing/articles/under-20-yuan-monthly-guide'],
    relatedBrands: ['guangsuyun', 'feimao'],
    conversionIntent: 'high',
    contentPriority: 'P0',
    sourceRequirements: '32家机场品牌清单.txt + 测速图'
  },
  {
    slug: 'guangsuyun-vs-ermao',
    targetUrl: '/compare/guangsuyun-vs-ermao/',
    articleTitle: '光速云 vs 二猫云 对比评测：25元主力月付档与不限时流量包横向评测',
    primaryKeyword: '光速云和二猫云对比',
    secondaryKeywords: '光速云与二猫云价格对比|25元月付机场横评|147永久包对比100元不限时包',
    longTailQuestions: '光速云和二猫云买哪个划算？|两家不限时流量包哪个性价比高？|二猫云支持哪些协议？',
    searchIntent: 'comparison',
    audience: 'all',
    contentType: 'comparison',
    parentTopic: '/brands/alternatives/',
    parentTopicName: '品牌替代方案',
    parentCluster: 'c-brands-30',
    summary: '横向比对光速云 25 元 168GB 档位与二猫云 20 元 130GB 档位，并实算 147 永久包与 100 元不限时包的单价与回本周期。',
    contentOutline: '比较结论|月付主力档价格实算|不限时流量包回本模型|协议与节点覆盖|适用人群总结',
    relatedArticles: ['/pricing/articles/monthly-vs-non-expiring-value', '/pricing/articles/under-20-yuan-monthly-guide'],
    relatedBrands: ['guangsuyun', 'ermao'],
    conversionIntent: 'high',
    contentPriority: 'P0',
    sourceRequirements: '32家机场品牌清单.txt'
  },
  {
    slug: 'feimao-vs-xingdaomeng',
    targetUrl: '/compare/feimao-vs-xingdaomeng/',
    articleTitle: '飞猫云 vs 星岛梦 对比评测：专属客户端极简模式与2020老牌多地区节点对比',
    primaryKeyword: '飞猫云和星岛梦对比',
    secondaryKeywords: '飞猫云与星岛梦选型|专属客户端对比通用订阅|老牌机场选型对比',
    longTailQuestions: '飞猫云和星岛梦哪个更稳定？|想用软路由选飞猫云还是星岛梦？|星岛梦运营了多少年？',
    searchIntent: 'comparison',
    audience: 'all',
    contentType: 'comparison',
    parentTopic: '/brands/alternatives/',
    parentTopicName: '品牌替代方案',
    parentCluster: 'c-brands-30',
    summary: '对比飞猫云专属 App 极简上手与星岛梦 2020 年老牌背景及多地区节点覆盖，解析软路由与多设备适配差异。',
    contentOutline: '比较结论|运营年限与背景核查|客户端自由度对比|节点覆盖范围实测|适用人群决策表',
    relatedArticles: ['/airport/articles/native-app-vs-third-party-beginners', '/brands/articles/verify-brand-operating-years'],
    relatedBrands: ['feimao', 'xingdaomeng'],
    conversionIntent: 'high',
    contentPriority: 'P0',
    sourceRequirements: '32家机场品牌清单.txt'
  },
  {
    slug: 'weifeng-vs-wuyou',
    targetUrl: '/compare/weifeng-vs-wuyou/',
    articleTitle: '微风网络 vs 无忧链接 对比评测：27元 VLESS 专线与 6.58 元起年付专线博弈',
    primaryKeyword: '微风网络和无忧链接对比',
    secondaryKeywords: '微风与无忧链接对比|便宜专线机场横评|清风年付与无忧年付对比',
    longTailQuestions: '微风网络和无忧链接哪个速度快？|无忧链接年付79元靠谱吗？|微风网络支持月付吗？',
    searchIntent: 'comparison',
    audience: 'all',
    contentType: 'comparison',
    parentTopic: '/brands/alternatives/',
    parentTopicName: '品牌替代方案',
    parentCluster: 'c-brands-30',
    summary: '对比微风网络 27 元月付 VLESS 专线与无忧链接 79 元年付（折合 6.58 元/月）专线，结合真实测速图分析性价比。',
    contentOutline: '比较结论|月付自由度与年付总成本|2026实测快照丢包与0B对比|协议与客户端支持|购买建议',
    relatedArticles: ['/pricing/articles/annual-to-monthly-calculation', '/routes/articles/how-to-spot-unverified-iepl'],
    relatedBrands: ['weifeng', 'wuyou'],
    conversionIntent: 'high',
    contentPriority: 'P0',
    sourceRequirements: '32家机场品牌清单.txt + 实测截图'
  },
  {
    slug: 'shandianshu-vs-dalaoyun',
    targetUrl: '/compare/shandianshu-vs-dalaoyun/',
    articleTitle: '闪电鼠 vs 大佬云 对比评测：5.6 元极简平价同质年付集群横向审计',
    primaryKeyword: '闪电鼠和大佬云对比',
    secondaryKeywords: '闪电鼠与大佬云对比|5.6元机场评测|低价平价集群避坑',
    longTailQuestions: '闪电鼠和大佬云是不是同一家？|5.6元的机场能长期用吗？|大佬云有什么异常记录？',
    searchIntent: 'comparison',
    audience: 'all',
    contentType: 'comparison',
    parentTopic: '/brands/alternatives/',
    parentTopicName: '品牌替代方案',
    parentCluster: 'c-brands-30',
    summary: '深入审计 5.6 元极简平价同质盘代表品牌，对比闪电鼠 sd88 优惠码与大佬云编号跳号异常，提示冷备风险。',
    contentOutline: '比较结论|同质模板盘背景剖析|真实付款门槛与小包限制|异常记录与证据评级|冷备建议',
    relatedArticles: ['/pricing/articles/annual-to-monthly-calculation', '/brands/articles/maintenance-vs-shutdown-signs'],
    relatedBrands: ['shandianshu', 'dalaoyun'],
    conversionIntent: 'medium',
    contentPriority: 'P0',
    sourceRequirements: '32家机场品牌清单.txt'
  },
  {
    slug: 'sogo-vs-kexin',
    targetUrl: '/compare/sogo-vs-kexin/',
    articleTitle: 'SOGO云 vs 可信云 对比评测：15 国大覆盖客户端与高诚实度品牌取舍',
    primaryKeyword: 'SOGO云和可信云对比',
    secondaryKeywords: 'SOGO云与可信云对比|多国节点机场对比|透明诚实机场选型',
    longTailQuestions: 'SOGO云和可信云买哪个？|可信云的流媒体和AI解锁靠谱吗？|SOGO云支持通用Clash订阅吗？',
    searchIntent: 'comparison',
    audience: 'all',
    contentType: 'comparison',
    parentTopic: '/brands/alternatives/',
    parentTopicName: '品牌替代方案',
    parentCluster: 'c-brands-30',
    summary: '对比宣称覆盖 15 国节点的 SOGO云与主动披露 AI 缺乏实测的高诚实度可信云，分析信息透明度与节点覆盖度。',
    contentOutline: '比较结论|披露透明度对比|节点覆盖广度核实|客户端与订阅兼容性|适用人群指南',
    relatedArticles: ['/airport/articles/more-nodes-better-myth', '/ai-media/articles/claude-connection-ban-risks'],
    relatedBrands: ['sogo', 'kexin'],
    conversionIntent: 'high',
    contentPriority: 'P0',
    sourceRequirements: '32家机场品牌清单.txt'
  },
  {
    slug: 'firefly-vs-lingmao',
    targetUrl: '/compare/firefly-vs-lingmao/',
    articleTitle: 'Firefly vs 灵猫网络 对比评测：专属客户端异常审计与 18 元平价通用订阅对比',
    primaryKeyword: 'Firefly和灵猫网络对比',
    secondaryKeywords: 'Firefly与灵猫网络对比|双优惠码核验|专属客户端对比',
    longTailQuestions: 'Firefly和灵猫网络哪个靠谱？|Firefly有两个推广链接是怎么回事？|灵猫网络有自研客户端吗？',
    searchIntent: 'comparison',
    audience: 'all',
    contentType: 'comparison',
    parentTopic: '/brands/alternatives/',
    parentTopicName: '品牌替代方案',
    parentCluster: 'c-brands-30',
    summary: '横向审计具有多历史推广链接与双优惠码记录的两个品牌，对比专属客户端与开源通用订阅的使用成本。',
    contentOutline: '比较结论|历史链接与双优惠码审计|起步月付价格对比|客户端支持与生态锁定|避坑建议',
    relatedArticles: ['/brands/articles/verify-official-site-vs-aff', '/brands/articles/coupon-code-not-working-fix'],
    relatedBrands: ['firefly', 'lingmao'],
    conversionIntent: 'high',
    contentPriority: 'P0',
    sourceRequirements: '32家机场品牌清单.txt'
  },
  {
    slug: 'muguang-vs-yuzhou',
    targetUrl: '/compare/muguang-vs-yuzhou/',
    articleTitle: '暮光加速 vs 宇宙云 对比评测：BGP 智能调度专线与多协议大吞吐对抗',
    primaryKeyword: '暮光加速和宇宙云对比',
    secondaryKeywords: '暮光加速与宇宙云对比|多设备在线机场对比|大带宽专线对比',
    longTailQuestions: '暮光加速和宇宙云哪个更稳定？|多设备同时用选暮光还是宇宙云？|两家起步月付多少钱？',
    searchIntent: 'comparison',
    audience: 'all',
    contentType: 'comparison',
    parentTopic: '/brands/alternatives/',
    parentTopicName: '品牌替代方案',
    parentCluster: 'c-brands-30',
    summary: '对比暮光加速（主打多设备在线与 BGP 智能调度）与宇宙云（多协议混合与大带宽端口），指导多终端与高吞吐用户选型。',
    contentOutline: '比较结论|BGP专线与多协议架构对比|多设备并发支持能力|月付价格与性价比表|场景选型指引',
    relatedArticles: ['/airport/articles/multi-device-airport-selection', '/routes/articles/low-ping-vs-download-speed'],
    relatedBrands: ['muguang', 'yuzhou'],
    conversionIntent: 'high',
    contentPriority: 'P0',
    sourceRequirements: '32家机场品牌清单.txt'
  }
]

// 5. Define 31 brand reviews registry
const BRAND_REVIEWS = brands.map((b) => ({
  slug: b.slug,
  name: b.name,
  targetUrl: `/reviews/${b.slug}/`,
  articleTitle: `${b.name} 深度评测：线路架构、测速表现与选型避坑指南`,
  primaryKeyword: `${b.name}深度评测`,
  secondaryKeywords: `${b.name}怎么样|${b.name}评测|${b.name}靠谱吗|${b.name}真实测速`,
  longTailQuestions: `${b.name}怎么样靠谱吗？|${b.name}最新套餐价格是多少？|${b.name}支持ChatGPT和Netflix吗？`,
  searchIntent: 'commercial',
  audience: 'all',
  contentType: 'review',
  parentTopic: '/brands/reviews/',
  parentTopicName: '品牌评测汇总',
  parentCluster: 'c-brands-26',
  summary: `基于真实品牌资料与第三方测速截图，深度评测 ${b.name} 的线路架构、套餐性价比、流媒体与 AI 解锁表现。`,
  contentOutline: '评测结论|品牌背景与运营状态|套餐完整分析|线路与协议架构|测速分析与丢包率|流媒体与AI解锁|客户端兼容|优势与限制|同类对比|FAQ',
  relatedArticles: ['/brands/directory/', `/brands/${b.slug}/`, '/reviews/'],
  relatedBrands: [b.slug],
  conversionIntent: 'high',
  contentPriority: 'P0',
  sourceRequirements: '32家机场品牌清单.txt + 测速图'
}))

// 6. Define 2 hub pages
const HUB_PAGES = [
  {
    targetUrl: '/reviews/',
    articleTitle: '31家机场品牌深度评测总目录与实测资料分级导航',
    primaryKeyword: '机场品牌深度评测',
    secondaryKeywords: '机场品牌深度评测|机场评测总目录|实测资料分级|31家品牌评测',
    longTailQuestions: '去哪里看真实的机场深度评测？|如何看懂机场测速报告？|31家品牌评测报告怎么查？',
    searchIntent: 'commercial',
    audience: 'all',
    contentType: 'hub',
    parentTopic: '/brands/',
    parentTopicName: '机场品牌',
    parentCluster: 'c-brands-26',
    summary: '全面收录 31 家去重机场品牌的万字级深度评测报告，严格区分实测截图、品牌自述与待核实边界。',
    contentOutline: '评测方法论|六级证据体系|31家品牌评测全量索引|选型决策指引|FAQ',
    relatedArticles: ['/brands/directory/', '/brands/reviews/', '/compare/'],
    relatedBrands: ['guangsuyun', 'feimao', 'weifeng'],
    conversionIntent: 'high',
    contentPriority: 'P0',
    sourceRequirements: '全量品牌数据库'
  },
  {
    targetUrl: '/compare/',
    articleTitle: '机场品牌横向对比中心：同价位与技术架构深度对比',
    primaryKeyword: '机场品牌对比评测',
    secondaryKeywords: '机场品牌对比评测|机场横向对比中心|同价位机场对比|品牌选型矩阵',
    longTailQuestions: '光速云和飞猫云哪个好？|如何横向对比两家价格接近的机场？|机场对比看哪些核心指标？',
    searchIntent: 'comparison',
    audience: 'all',
    contentType: 'hub',
    parentTopic: '/brands/',
    parentTopicName: '机场品牌',
    parentCluster: 'c-brands-30',
    summary: '精选 8 组最具代表性的同价位、同架构机场品牌横向评测，通过同口径参数表给出选型决策。',
    contentOutline: '对比原则|同口径对比法则|8篇精选对比专题矩阵|三步选型决策|FAQ',
    relatedArticles: ['/brands/directory/', '/brands/alternatives/', '/reviews/'],
    relatedBrands: ['guangsuyun', 'feimao', 'ermao', 'weifeng'],
    conversionIntent: 'high',
    contentPriority: 'P0',
    sourceRequirements: '全量品牌数据库'
  }
]

// 7. Collect 24 existing troubleshooting articles from disk
const TS_ARTICLES = []
for (const [route, info] of existingPages.entries()) {
  if (route.startsWith('/troubleshooting/articles/')) {
    const fm = info.fm || {}
    const title = typeof fm.title === 'string' ? fm.title.trim() : path.basename(route)
    const primaryKeyword = typeof fm.primaryKeyword === 'string' ? fm.primaryKeyword.trim() : title
    const category = fm.category || 'timeout'
    const parentTopic = `/troubleshooting/${category}/`

    TS_ARTICLES.push({
      targetUrl: route,
      articleTitle: title,
      primaryKeyword,
      secondaryKeywords: `${primaryKeyword}排查|${primaryKeyword}修复|故障自检`,
      longTailQuestions: `${title}怎么解决？|出现${primaryKeyword}怎么排查？`,
      searchIntent: 'troubleshooting',
      audience: 'all',
      contentType: 'guide',
      parentTopic,
      parentTopicName: fm.category || '故障排查',
      parentCluster: 'c-trouble-cluster',
      summary: fm.description || title,
      contentOutline: '现象概况|可能原因|分层排查步骤|修复验证|回滚提示',
      relatedArticles: ['/troubleshooting/', parentTopic],
      relatedBrands: ['general'],
      relatedComparisons: [],
      conversionIntent: 'low',
      contentPriority: 'P0',
      sourceRequirements: 'issue-map.json + 第三方客户端资料'
    })
  }
}

// 8. Load existing backlog rows from data/content-backlog.csv
const BACKLOG_ITEMS = []
const backlogCsvPath = path.join(DATA_DIR, 'content-backlog.csv')
if (fs.existsSync(backlogCsvPath)) {
  const lines = fs.readFileSync(backlogCsvPath, 'utf8').split('\n').filter(Boolean)
  const headerLine = lines[0].split(',')
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',')
    if (parts.length >= 10) {
      const kw = parts[0].replace(/^"|"$/g, '').trim()
      const normKw = parts[1]?.replace(/^"|"$/g, '').trim() || kw
      const intent = parts[2]?.replace(/^"|"$/g, '').trim() || 'informational'
      const entity = parts[3]?.replace(/^"|"$/g, '').trim() || 'general'
      const targetUrl = parts[8]?.replace(/^"|"$/g, '').trim() || ''
      const clusterId = parts[9]?.replace(/^"|"$/g, '').trim() || 'backlog'
      const priority = parts[10]?.replace(/^"|"$/g, '').trim() || 'P1'
      const evidence = parts[11]?.replace(/^"|"$/g, '').trim() || '项目审计资料库'

      BACKLOG_ITEMS.push({
        keyword: kw,
        primaryKeyword: kw,
        secondaryKeywords: `${kw}解析|${kw}指南`,
        longTailQuestions: `${kw}怎么理解？`,
        searchIntent: intent,
        audience: 'all',
        contentType: 'guide',
        parentTopic: targetUrl.split('/').slice(0, 3).join('/') + '/',
        parentCluster: clusterId,
        targetUrl,
        articleTitle: kw,
        contentOutline: '核心问题|原因分析|解决方案|验证步骤',
        existingUrl: '',
        relatedArticles: '',
        relatedBrands: entity,
        conversionIntent: 'medium',
        contentPriority: priority,
        contentStatus: 'planned',
        sourceRequirements: evidence,
        lastReviewedAt: '2026-11-23'
      })
    }
  }
}

// 9. Assemble data/keywords/article-keyword-map.json
const bySecondaryTopic = {}
const byArticle = {}

// Populate bySecondaryTopic with 36 new L3 articles and 24 troubleshooting articles
for (const art of [...NEW_36_ARTICLES, ...TS_ARTICLES]) {
  const pTopic = art.parentTopic
  if (!bySecondaryTopic[pTopic]) bySecondaryTopic[pTopic] = []

  bySecondaryTopic[pTopic].push({
    url: art.targetUrl,
    title: art.articleTitle,
    primaryKeyword: art.primaryKeyword,
    searchIntent: art.searchIntent,
    summary: art.summary,
    badge: art.primaryKeyword
  })

  // Format related articles as {url, title} objects
  const relArticleObjs = (art.relatedArticles || []).map((u) => {
    const found = [...NEW_36_ARTICLES, ...TS_ARTICLES].find((a) => a.targetUrl === u)
    return {
      url: u,
      title: found ? found.articleTitle : u
    }
  })

  const relReviewObjs = (art.relatedBrands || [])
    .filter((slug) => slug !== 'general' && slug !== 'multi-brand')
    .map((slug) => {
      const b = brands.find((x) => x.slug === slug)
      return {
        url: `/reviews/${slug}/`,
        name: b ? b.name : slug
      }
    })

  const relCompareObjs = (art.relatedComparisons || []).map((u) => {
    const found = COMPARE_PAIRS.find((c) => c.targetUrl === u)
    return {
      url: u,
      title: found ? found.articleTitle.split('：')[0] : u
    }
  })

  byArticle[art.targetUrl] = {
    url: art.targetUrl,
    title: art.articleTitle,
    parentTopic: art.parentTopic,
    parentTopicName: art.parentTopicName,
    primaryKeyword: art.primaryKeyword,
    relatedArticles: relArticleObjs,
    relatedReviews: relReviewObjs,
    relatedComparisons: relCompareObjs
  }
}

// Also populate compare pairs and brand reviews into byArticle
for (const cmp of COMPARE_PAIRS) {
  byArticle[cmp.targetUrl] = {
    url: cmp.targetUrl,
    title: cmp.articleTitle,
    parentTopic: cmp.parentTopic,
    parentTopicName: cmp.parentTopicName,
    primaryKeyword: cmp.primaryKeyword,
    relatedArticles: (cmp.relatedArticles || []).map((u) => {
      const found = NEW_36_ARTICLES.find((a) => a.targetUrl === u)
      return { url: u, title: found ? found.articleTitle : u }
    }),
    relatedReviews: cmp.relatedBrands.map((slug) => {
      const b = brands.find((x) => x.slug === slug)
      return { url: `/reviews/${slug}/`, name: b ? b.name : slug }
    }),
    relatedComparisons: []
  }
}

for (const rev of BRAND_REVIEWS) {
  byArticle[rev.targetUrl] = {
    url: rev.targetUrl,
    title: rev.articleTitle,
    parentTopic: rev.parentTopic,
    parentTopicName: rev.parentTopicName,
    primaryKeyword: rev.primaryKeyword,
    relatedArticles: [
      { url: '/brands/directory/', title: '31家品牌数据库检索' },
      { url: `/brands/${rev.slug}/`, title: `${rev.name} 商业套餐详情` }
    ],
    relatedReviews: [],
    relatedComparisons: COMPARE_PAIRS.filter((c) => c.relatedBrands.includes(rev.slug)).map((c) => ({
      url: c.targetUrl,
      title: c.articleTitle.split('：')[0]
    }))
  }
}

const articleKeywordMapData = {
  version: '2.0',
  updatedAt: '2026-11-24',
  totalIndexedArticles: Object.keys(byArticle).length,
  totalSecondaryTopicsMapped: Object.keys(bySecondaryTopic).length,
  bySecondaryTopic,
  byArticle
}

fs.writeFileSync(
  path.join(KEYWORDS_DIR, 'article-keyword-map.json'),
  JSON.stringify(articleKeywordMapData, null, 2) + '\n',
  'utf8'
)

// 10. Generate data/keywords/cluster-map.json
const clusterMap = {
  version: '2.0',
  generatedAt: '2026-11-24',
  clusters: {}
}

for (const art of [...NEW_36_ARTICLES, ...COMPARE_PAIRS, ...BRAND_REVIEWS]) {
  const cId = art.parentCluster
  if (!clusterMap.clusters[cId]) {
    clusterMap.clusters[cId] = {
      id: cId,
      parentTopic: art.parentTopic,
      parentTopicName: art.parentTopicName,
      priority: art.contentPriority || 'P0',
      articles: []
    }
  }
  clusterMap.clusters[cId].articles.push({
    targetUrl: art.targetUrl,
    title: art.articleTitle,
    primaryKeyword: art.primaryKeyword,
    contentType: art.contentType,
    status: 'published'
  })
}

fs.writeFileSync(
  path.join(KEYWORDS_DIR, 'cluster-map.json'),
  JSON.stringify(clusterMap, null, 2) + '\n',
  'utf8'
)

// 11. Assemble longtail-master.csv and content-priority.csv (20 columns from §4.4)
const LONGTAIL_HEADERS = [
  'keyword',
  'primaryKeyword',
  'secondaryKeywords',
  'longTailQuestions',
  'searchIntent',
  'audience',
  'contentType',
  'parentTopic',
  'parentCluster',
  'targetUrl',
  'articleTitle',
  'contentOutline',
  'existingUrl',
  'relatedArticles',
  'relatedBrands',
  'conversionIntent',
  'contentPriority',
  'contentStatus',
  'sourceRequirements',
  'lastReviewedAt'
]

const allLongtailRecords = []

// Add published items: 36 new articles, 24 troubleshooting, 31 reviews, 8 comparisons, 2 hubs
for (const item of [
  ...HUB_PAGES,
  ...NEW_36_ARTICLES,
  ...TS_ARTICLES,
  ...BRAND_REVIEWS,
  ...COMPARE_PAIRS
]) {
  allLongtailRecords.push({
    keyword: item.primaryKeyword,
    primaryKeyword: item.primaryKeyword,
    secondaryKeywords: item.secondaryKeywords || '',
    longTailQuestions: item.longTailQuestions || '',
    searchIntent: item.searchIntent || 'informational',
    audience: item.audience || 'all',
    contentType: item.contentType || 'guide',
    parentTopic: item.parentTopic || '',
    parentCluster: item.parentCluster || '',
    targetUrl: item.targetUrl,
    articleTitle: item.articleTitle,
    contentOutline: item.contentOutline || '',
    existingUrl: item.targetUrl,
    relatedArticles: Array.isArray(item.relatedArticles) ? item.relatedArticles.join('|') : item.relatedArticles || '',
    relatedBrands: Array.isArray(item.relatedBrands) ? item.relatedBrands.join('|') : item.relatedBrands || '',
    conversionIntent: item.conversionIntent || 'medium',
    contentPriority: item.contentPriority || 'P0',
    contentStatus: 'published',
    sourceRequirements: item.sourceRequirements || '32家机场品牌清单.txt',
    lastReviewedAt: '2026-11-24'
  })
}

// Add backlog planned items
for (const item of BACKLOG_ITEMS) {
  allLongtailRecords.push(item)
}

const longtailCsvLines = [
  LONGTAIL_HEADERS.join(','),
  ...allLongtailRecords.map((r) => LONGTAIL_HEADERS.map((h) => csvEscape(r[h])).join(','))
]

fs.writeFileSync(path.join(KEYWORDS_DIR, 'longtail-master.csv'), longtailCsvLines.join('\n') + '\n', 'utf8')

// Priority sorted: P0 -> P1 -> P2, then published -> planned
const priorityOrder = { P0: 0, P1: 1, P2: 2 }
const statusOrder = { published: 0, planned: 1 }

const sortedRecords = [...allLongtailRecords].sort((a, b) => {
  const pDiff = (priorityOrder[a.contentPriority] ?? 3) - (priorityOrder[b.contentPriority] ?? 3)
  if (pDiff !== 0) return pDiff
  const sDiff = (statusOrder[a.contentStatus] ?? 2) - (statusOrder[b.contentStatus] ?? 2)
  if (sDiff !== 0) return sDiff
  return a.targetUrl.localeCompare(b.targetUrl)
})

const priorityCsvLines = [
  LONGTAIL_HEADERS.join(','),
  ...sortedRecords.map((r) => LONGTAIL_HEADERS.map((h) => csvEscape(r[h])).join(','))
]

fs.writeFileSync(path.join(KEYWORDS_DIR, 'content-priority.csv'), priorityCsvLines.join('\n') + '\n', 'utf8')

console.log(
  `[keywords-system] Generated article-keyword-map.json (${Object.keys(byArticle).length} articles), cluster-map.json (${Object.keys(clusterMap.clusters).length} clusters), longtail-master.csv (${allLongtailRecords.length} rows), content-priority.csv (${sortedRecords.length} rows).`
)
