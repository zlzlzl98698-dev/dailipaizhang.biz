export interface NavSubItem {
  text: string
  link: string
  desc?: string
}

export interface NavCategory {
  id: string
  text: string
  link: string
  items: NavSubItem[]
}

export const NAV_CATEGORIES: NavCategory[] = [
  {
    id: 'airport',
    text: '机场推荐',
    link: '/airport/',
    items: [
      { text: '机场推荐总览', link: '/airport/airport-recommendation/', desc: '按场景、设备与证据分级决策' },
      { text: '多维排行框架', link: '/airport/airport-ranking/', desc: '证据充分度与月付门槛评估' },
      { text: '靠谱机场核查', link: '/airport/reliable/', desc: '运营年限、退款规则与节点透明度' },
      { text: '稳定机场标准', link: '/airport/stable/', desc: '晚高峰拥塞识别与专线证据' },
      { text: '好用的机场', link: '/airport/easy-to-use/', desc: '专属客户端 vs 通用订阅权衡' },
      { text: '新手机场避坑', link: '/airport/beginner/', desc: '低试错月付选择与防坑清单' },
    ],
  },
  {
    id: 'pricing',
    text: '价格与套餐',
    link: '/pricing/',
    items: [
      { text: '便宜机场拆解', link: '/pricing/budget/', desc: '5.6–15元低价区间结构与成本陷阱' },
      { text: '一元机场风险', link: '/pricing/one-yuan/', desc: '超售、端口限速与失联代价' },
      { text: '一分试用盘套路', link: '/pricing/one-cent/', desc: '超低价引流盘边界与安全提示' },
      { text: '月付机场筛选', link: '/pricing/monthly/', desc: '首次验证为何必须优先月付' },
      { text: '不限时流量包', link: '/pricing/non-expiring/', desc: '适用人群、回本周期与沉没成本' },
      { text: '性价比评估框架', link: '/pricing/value/', desc: '按 100G–500G 实际用量算每 GB 成本' },
    ],
  },
  {
    id: 'brands',
    text: '机场品牌',
    link: '/brands/',
    items: [
      { text: '31家品牌数据库', link: '/brands/directory/', desc: '全量去重品牌检索与协议矩阵' },
      { text: '品牌评测汇总', link: '/brands/reviews/', desc: '按证据等级与场景分组对比' },
      { text: '官网与入口核验', link: '/brands/official-sites/', desc: '区分官网与推广注册地址、格式异常' },
      { text: '优惠码与冲突记录', link: '/brands/promotions/', desc: '公开优惠码来源与双码冲突审计' },
      { text: '运营风险与跑路', link: '/brands/incidents/', desc: '历史资料、低价集群与绑定限制' },
      { text: '品牌替代方案', link: '/brands/alternatives/', desc: '订阅限制与同价位替代选型矩阵' },
    ],
  },
  {
    id: 'vpn',
    text: 'VPN 与加速器',
    link: '/vpn/',
    items: [
      { text: 'VPN 场景推荐', link: '/vpn/recommendations/', desc: '海外商业 VPN 与代理订阅差异' },
      { text: '免费 VPN 风险', link: '/vpn/free/', desc: '流量变现、DNS 泄漏与隐私隐患' },
      { text: '手机 VPN 机制', link: '/vpn/mobile/', desc: 'iOS/Android 后台保活与系统权限' },
      { text: '安卓 VPN 指南', link: '/vpn/android/', desc: 'VpnService 机制与分应用代理' },
      { text: '游戏加速器原理', link: '/vpn/gaming/', desc: 'UDP NAT 类型与延迟抖动诊断' },
      { text: 'VPN 协议对比', link: '/vpn/comparisons/', desc: 'WireGuard/OpenVPN 与代理协议差异' },
    ],
  },
  {
    id: 'clients',
    text: '客户端软件',
    link: '/clients/',
    items: [
      { text: 'Clash Verge Rev', link: '/clients/clash-verge/', desc: 'Mihomo 内核桌面端与 TUN 配置' },
      { text: 'Clash Meta / Android', link: '/clients/clash-meta/', desc: '内核演进与安卓权限适配' },
      { text: 'v2rayN 客户端', link: '/clients/v2rayn/', desc: 'Xray/sing-box 多核心与系统代理' },
      { text: 'Shadowrocket 小火箭', link: '/clients/shadowrocket/', desc: 'iOS 订阅导入与规则配置' },
      { text: 'Mihomo 内核', link: '/clients/mihomo/', desc: 'YAML 配置兼容与衍生端维护状态' },
      { text: 'sing-box 生态', link: '/clients/sing-box/', desc: '官方多端与第三方客户端防仿冒' },
    ],
  },
  {
    id: 'ai-media',
    text: 'AI 与流媒体',
    link: '/ai-media/',
    items: [
      { text: 'ChatGPT 机场适配', link: '/ai-media/chatgpt/', desc: 'OpenAI 地区风控与仅 APP(HK) 差异' },
      { text: 'Claude 节点风控', link: '/ai-media/claude/', desc: 'Anthropic 机房 IP 与切节点风险' },
      { text: 'Gemini 区域可用性', link: '/ai-media/gemini/', desc: 'Google AI 地区识别与失败排查' },
      { text: 'Netflix 解锁解析', link: '/ai-media/netflix/', desc: '原生 IP、自制剧与落地识别偏差' },
      { text: 'YouTube 送中排查', link: '/ai-media/youtube/', desc: 'CDN 调度与 YT 送中(CN)成因' },
      { text: '兼容性测试解读', link: '/ai-media/compatibility/', desc: '读懂 Miaoko 与流媒体检测报告' },
    ],
  },
  {
    id: 'routes',
    text: '线路与节点',
    link: '/routes/',
    items: [
      { text: 'IEPL 专线原理', link: '/routes/iepl/', desc: '内网专线概念与测速波动辨别' },
      { text: 'IPLC 跨境专线', link: '/routes/iplc/', desc: '点对点专线特点与常见误区澄清' },
      { text: '香港节点分析', link: '/routes/hong-kong/', desc: '低 RTT 优势与 AI 地区限制矛盾' },
      { text: '日本节点落地', link: '/routes/japan/', desc: 'IIJ/软银/NTT 落地与流媒体适配' },
      { text: '低延迟节点真相', link: '/routes/low-latency/', desc: 'TLS RTT 与 Ping 假象分析' },
      { text: '线路倍率计费', link: '/routes/multipliers/', desc: '0.5x–5x 倍率与流量异常消耗排查' },
    ],
  },
  {
    id: 'guides',
    text: '使用教程',
    link: '/guides/',
    items: [
      { text: '机场订阅教程', link: '/guides/subscriptions/', desc: 'Base64/YAML/sing-box 与订阅限制' },
      { text: 'Clash 配置指南', link: '/guides/clash-setup/', desc: '规则模式、策略组与覆写 Profile' },
      { text: '分流规则配置', link: '/guides/split-routing/', desc: 'GeoIP/GeoSite 与 AI 工具单独分流' },
      { text: 'TUN 模式详解', link: '/guides/tun-mode/', desc: '虚拟网卡授权与路由环路预防' },
      { text: '多平台安装指南', link: '/guides/installation/', desc: 'Win/macOS/Linux/OpenWrt 架构区分' },
      { text: 'DNS 与 Fake-IP', link: '/guides/dns-setup/', desc: 'Fake-IP vs Redir-Host 与回滚' },
    ],
  },
  {
    id: 'troubleshooting',
    text: '故障排查',
    link: '/troubleshooting/',
    items: [
      { text: '节点全超时排查', link: '/troubleshooting/timeout/', desc: '系统时间、本地连通与远端异常分流' },
      { text: '订阅更新失败', link: '/troubleshooting/subscription-failure/', desc: '200空订阅、401/403/404 与 TLS 报错' },
      { text: '连上但打不开网页', link: '/troubleshooting/cannot-connect/', desc: '系统代理、端口冲突与 TUN 环路' },
      { text: 'DNS 污染与泄漏', link: '/troubleshooting/dns-error/', desc: 'Fake-IP 冲突、198.18.0.1 与泄漏检测' },
      { text: '客户端无法启动', link: '/troubleshooting/app-not-starting/', desc: '白屏、WebView2 与核心加载失败' },
      { text: '连接慢与高丢包', link: '/troubleshooting/slow-network/', desc: '晚高峰拥塞、UDP 阻断与倍率核对' },
    ],
  },
  {
    id: 'security',
    text: '风险与替代',
    link: '/security/',
    items: [
      { text: '机场跑路识别', link: '/security/shutdown/', desc: '失联前兆与订阅超时区分、止损步骤' },
      { text: '常见买机场避坑', link: '/security/avoid-pitfalls/', desc: '年付诱导、伪装官网与夸大话术' },
      { text: '服务失联替代方案', link: '/security/alternatives/', desc: '专属端迁移与多备用容灾策略' },
      { text: '退款边界与争议', link: '/security/refund/', desc: '虚拟数字商品退款限制与购前核验' },
      { text: '隐私与协议安全', link: '/security/privacy/', desc: 'SNI/TLS 加密边界与闭源客户端权衡' },
      { text: '账号与订阅安全', link: '/security/account-security/', desc: '订阅 Token 泄露防护与链接重置' },
    ],
  },
]

export const QUICK_SHORTCUTS = [
  { text: '立即排障', link: '/troubleshooting/', accent: 'primary' },
  { text: '品牌库', link: '/brands/', accent: 'neutral' },
  { text: '客户端', link: '/clients/', accent: 'neutral' },
] as const

export const SEGMENT_LABELS: Record<string, string> = {
  airport: '机场推荐',
  pricing: '价格与套餐',
  brands: '机场品牌',
  vpn: 'VPN 与加速器',
  clients: '客户端软件',
  'ai-media': 'AI 与流媒体',
  routes: '线路与节点',
  guides: '使用教程',
  troubleshooting: '故障排查',
  security: '风险与替代',
  articles: '长尾专题文章',
  directory: '品牌数据库',
  reviews: '深度评测',
  compare: '品牌对比',
  'official-sites': '官网与入口核验',
  promotions: '优惠码与活动',
  incidents: '运营风险与跑路',
  alternatives: '替代方案',
  timeout: '节点超时',
  'subscription-failure': '订阅失败',
  'cannot-connect': '连接不上',
  'dns-error': 'DNS 错误',
  'app-not-starting': '客户端无法启动',
  'slow-network': '连接慢与丢包',
  disclosure: '联盟推广披露',
  methodology: '数据与测速方法论',
  about: '关于本站',
}

export function buildVitepressSidebar() {
  const sidebar: Record<string, Array<{ text: string; items: Array<{ text: string; link: string }> }>> = {}

  for (const cat of NAV_CATEGORIES) {
    sidebar[cat.link] = [
      {
        text: cat.text,
        items: [
          { text: `${cat.text}总览`, link: cat.link },
          ...cat.items.map((item) => ({ text: item.text, link: item.link })),
        ],
      },
    ]
  }

  // Enrich troubleshooting sidebar with top high-frequency articles
  sidebar['/troubleshooting/'] = [
    ...sidebar['/troubleshooting/'],
    {
      text: '高频故障直达',
      items: [
        { text: 'HTTP 200 返回空订阅', link: '/troubleshooting/articles/sub-http-200-empty' },
        { text: '401/403/404/503 订阅失败', link: '/troubleshooting/articles/sub-http-401-403-404-503' },
        { text: '所有节点同时超时', link: '/troubleshooting/articles/nodes-all-timeout' },
        { text: '连上节点但打不开网页', link: '/troubleshooting/articles/connected-no-internet' },
        { text: 'TUN 模式开启无效', link: '/troubleshooting/articles/tun-not-working' },
        { text: 'DNS 泄漏与污染排查', link: '/troubleshooting/articles/dns-leak-hijack-fix' },
        { text: 'Fake-IP 198.18 冲突', link: '/troubleshooting/articles/fake-ip-explained-fix' },
        { text: 'Clash Verge 启动/白屏失败', link: '/troubleshooting/articles/clash-verge-startup-fail' },
        { text: 'v2rayN 核心加载失败', link: '/troubleshooting/articles/v2rayn-core-load-fail' },
        { text: '系统时间与 TLS 握手失败', link: '/troubleshooting/articles/time-sync-tls-cert-error' },
      ],
    },
  ]

  sidebar['/reviews/'] = [
    {
      text: '品牌深度评测',
      items: [
        { text: '评测总目录', link: '/reviews/' },
        { text: '品牌数据库', link: '/brands/directory/' },
        { text: '评测方法论汇总', link: '/brands/reviews/' },
      ],
    },
    {
      text: '31家品牌深度评测',
      items: [
        { text: '光速云 深度评测', link: '/reviews/guangsuyun/' },
        { text: '飞猫云 深度评测', link: '/reviews/feimao/' },
        { text: '微风网络 深度评测', link: '/reviews/weifeng/' },
        { text: '星岛梦 深度评测', link: '/reviews/xingdaomeng/' },
        { text: '无忧链接 深度评测', link: '/reviews/wuyou/' },
        { text: '二猫云 深度评测', link: '/reviews/ermao/' },
        { text: '唯兔云 深度评测', link: '/reviews/weitu/' },
        { text: 'Firefly 深度评测', link: '/reviews/firefly/' },
        { text: '暮光加速 深度评测', link: '/reviews/muguang/' },
        { text: '宇宙云 深度评测', link: '/reviews/yuzhou/' },
        { text: 'U1S1 深度评测', link: '/reviews/u1s1/' },
        { text: '灵猫网络 深度评测', link: '/reviews/lingmao/' },
        { text: '极连云 深度评测', link: '/reviews/jilian/' },
        { text: '光年梯 深度评测', link: '/reviews/guangnian/' },
        { text: '一翻云 深度评测', link: '/reviews/yifan/' },
        { text: 'SOGO云 深度评测', link: '/reviews/sogo/' },
        { text: '可信云 深度评测', link: '/reviews/kexin/' },
        { text: '速界 深度评测', link: '/reviews/sujie/' },
        { text: '闪跃 深度评测', link: '/reviews/shanyue/' },
        { text: '全球云 深度评测', link: '/reviews/quanqiu/' },
        { text: '闪电鼠 深度评测', link: '/reviews/shandianshu/' },
        { text: '大佬云 深度评测', link: '/reviews/dalaoyun/' },
        { text: '云界线 深度评测', link: '/reviews/yunjiexian/' },
        { text: '榴莲云 深度评测', link: '/reviews/liulianyun/' },
        { text: '神行加速 深度评测', link: '/reviews/shenxing/' },
        { text: '环球梯 深度评测', link: '/reviews/huanqiuti/' },
        { text: '隐形人 深度评测', link: '/reviews/yinxingren/' },
        { text: '梯子云 深度评测', link: '/reviews/tiziyun/' },
        { text: '灵动云 深度评测', link: '/reviews/lingdong/' },
        { text: '浪网 深度评测', link: '/reviews/langwang/' },
        { text: 'EdgeNova 深度评测', link: '/reviews/edgenova/' },
      ],
    },
  ]

  sidebar['/compare/'] = [
    {
      text: '品牌对比中心',
      items: [
        { text: '对比中心总览', link: '/compare/' },
        { text: '品牌数据库检索', link: '/brands/directory/' },
        { text: '品牌替代方案', link: '/brands/alternatives/' },
      ],
    },
    {
      text: '8篇精选横向对比',
      items: [
        { text: '光速云 vs 飞猫云', link: '/compare/guangsuyun-vs-feimao/' },
        { text: '光速云 vs 二猫云', link: '/compare/guangsuyun-vs-ermao/' },
        { text: '飞猫云 vs 星岛梦', link: '/compare/feimao-vs-xingdaomeng/' },
        { text: '微风网络 vs 无忧链接', link: '/compare/weifeng-vs-wuyou/' },
        { text: '闪电鼠 vs 大佬云', link: '/compare/shandianshu-vs-dalaoyun/' },
        { text: 'SOGO云 vs 可信云', link: '/compare/sogo-vs-kexin/' },
        { text: 'Firefly vs 灵猫网络', link: '/compare/firefly-vs-lingmao/' },
        { text: '暮光加速 vs 宇宙云', link: '/compare/muguang-vs-yuzhou/' },
      ],
    },
  ]

  return sidebar
}
