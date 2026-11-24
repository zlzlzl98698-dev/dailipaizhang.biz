---
title: 代理客户端软件大全：第三方通用订阅客户端、机场专属 App 与六大平台选型指南
description: 系统梳理 Windows、macOS、Android、iOS/iPadOS、Linux 与 OpenWrt 六大平台 24 款主流代理客户端与协议矩阵，深度对比第三方通用订阅客户端与机场专属 App 边界，标注架构区分、仓库待核实状态与 NekoBox/Mihomo Party 安全警示。
pillar: clients
primaryKeyword: 代理客户端下载与选型
intent: informational
collectionPage: true
publishedAt: '2026-11-23'
updatedAt: '2026-11-23'
breadcrumbs:
  - text: 首页
    link: /
  - text: 客户端软件
    link: /clients/
itemList:
  - name: Clash Verge Rev 使用与配置指南
    url: /clients/clash-verge/
  - name: Clash Meta 与 Clash Meta for Android
    url: /clients/clash-meta/
  - name: v2rayN 使用与排障指南
    url: /clients/v2rayn/
  - name: Shadowrocket（小火箭）使用指南
    url: /clients/shadowrocket/
  - name: Mihomo 内核解析与生态
    url: /clients/mihomo/
  - name: sing-box 多端生态与安全警示
    url: /clients/sing-box/
faq:
  - q: 第三方通用客户端和机场专属客户端有什么本质区别？
    a: 第三方通用客户端（如 Clash Verge Rev、v2rayN、Shadowrocket、FlClash、Hiddify、Karing）通过导入标准订阅链接在本地加载代理内核，支持同时管理多家服务商、自由调整分流规则与 TUN/DNS 参数；机场专属客户端由服务商打包分发，多数封装为账号密码登录即用，但部分品牌完全不提供通用订阅链接，一旦客户端停止更新或用户想迁移至路由器与其他终端，灵活度会明显受限。
  - q: 哪些机场品牌目前仅支持专属客户端而不提供第三方通用订阅链接？
    a: 根据站内截至 2026-10-19 归档的品牌资料，明确标注仅走专属客户端或不提供第三方订阅链接的品牌包括飞猫云、无忧链接（2026 年 10 月起改用官方专属端，历史总表冲突已单列）、Firefly（2026 年 10 月起不提供订阅链接）、灵猫网络（2026 年 10 月起不提供订阅链接）、SOGO 云、闪跃、全球云与隐形人。购买前若计划使用 Clash、Shadowrocket 或 OpenWrt 软路由，应避开上述仅专属端品牌或先向客服核实。
  - q: 为什么本页所有开源客户端与商店客户端的具体仓库或下载 URL 均标注为「尚未核实」？
    a: 本站引用的原始客户端清单仅记录了托管渠道类别（如 GitHub、App Store、官方网站或官方文档），并未附带经独立签名校验的具体仓库路径或商店 ID。为杜绝拼写误差、镜像站投毒与仿冒包误导风险，所有未经人工复核的外部仓库地址统一标注为「尚未核实」或「项目地址待核实，请以作者发布页为准」。
  - q: Mihomo Party 为什么被单独标注需要核查维护状态？
    a: 在站内客户端审计资料中，Clash Verge Rev、v2rayN、FlClash、Hiddify、Karing 与 Clash Mi 均记录有跨平台活跃项目资料，而 Mihomo Party 原始资料明确提示「应单独关注项目维护状态，不宜未经核实就标为持续更新的首选客户端」，目前主要作为历史教程与配置迁移排查场景的参考对象。
  - q: 下载 NekoBox for Android 时为什么特别禁止使用 Google Play 同名版本？
    a: 根据客户端原始资料明确警示，NekoBox 官方项目维护资源有限，且已专门警告不要使用其名称下已被第三方控制的 Google Play 版本。安装被第三方接管或篡改的商店版本可能导致代理流量被劫持、订阅凭证泄露或植入恶意广告组件。
  - q: iPhone 和 iPad 上的 Shadowrocket、Stash、Quantumult X 是免费的吗？
    a: 不是。根据站内资料记录，Shadowrocket（小火箭）、Stash 与 Quantumult X（圈 X）在美国区 App Store 均显示为付费应用，Surge 5 则包含应用内购买，而具体售价与当前区服可下载状态均以用户本人所持 App Store 地区为准。切勿在系统 iCloud 主设置中登录来路不明的共享账号，以免造成设备锁机。
  - q: macOS 苹果电脑下载 Clash Verge Rev 或 FlClash 时如何避免装错安装包？
    a: 必须先确认本机处理器架构：Apple M1/M2/M3/M4 等 Apple Silicon 芯片应选择 arm64 或 aarch64 版本，而老款 Intel 处理器 Mac 必须选择 x86_64（x64）版本。部分跨平台客户端同时提供通用包或分架构包，下错架构会直接导致无法打开或性能损耗。
  - q: Linux 桌面端和没有图形界面的 Linux 服务器分别适合哪类客户端？
    a: 带有桌面环境的 Ubuntu、Debian、Fedora 等系统可按发行版包格式选择 DEB、RPM 或 AppImage 安装包（如 Clash Verge Rev、FlClash、v2rayN、Hiddify），同时匹配对应 CPU 架构；对于无桌面环境的 Linux 服务器、NAS 或网关设备，则应优先选用提供 Web 控制面板与透明代理能力的 v2rayA。
  - q: OpenWrt 软路由安装 Nikki、OpenClash、PassWall2 或 HomeProxy 前必须检查什么？
    a: 路由器环境不同于普通桌面系统，安装前必须逐一核对 OpenWrt 主版本号、设备 CPU 架构、包管理器类型（opkg 或 apk）、内核模块及防火墙依赖（fw3/iptables 还是 fw4/nftables）。其中 Nikki 项目已明确要求 OpenWrt 24.10 及以上版本，低版本固件强行安装会出现依赖缺失或透明代理失效。
  - q: 同一份机场订阅在 Clash Verge Rev、v2rayN 与 Shadowrocket 中看到的节点数量或协议不一致是为什么？
    a: 大多数机场订阅服务端会读取请求头中的 User-Agent 字段，按客户端类型自动下发不同格式或过滤掉旧内核不支持的协议节点；此外，不同客户端对同一条订阅（例如包含 AnyTLS、VLESS-Reality 或 Hysteria 2 的节点）的解析容错度不同，也会导致个别节点被静默跳过。
  - q: 客户端提示核心启动失败或缺少运行时，能通过关闭 Windows Defender 或系统杀毒软件来解决吗？
    a: 绝对不能。任何要求用户先关闭系统安全防护才能运行代理软件的做法都属于高风险行为。正确的排查方式是核验安装包来源与数字签名/哈希值，确认是否缺少合法的系统依赖（例如 v2rayN 所需的 .NET 桌面运行时或 Clash Verge Rev 所需的 WebView2 组件），并按照标准排障流程定位具体报错文件。
  - q: 使用机场订阅或排查客户端报错时，有哪些绝对不能泄露的敏感信息？
    a: 绝不能将未经脱敏的完整订阅 URL（内含鉴权 Token）、节点 UUID、密码、服务器域名或完整 YAML/JSON 配置文件直接粘贴到公开论坛、群聊或未知第三方在线订阅转换网站。如需求助排障，务必先替换掉所有鉴权参数与域名片段，仅保留脱敏后的核心报错日志。
---

# 代理客户端软件大全：第三方通用订阅客户端与机场专属 App 选型指南

> **核心结论（Answer-First）**：代理客户端按架构分为 **「第三方通用订阅客户端」** 与 **「机场品牌专属客户端」** 两大阵营。通用客户端（如 Clash Verge Rev、v2rayN、Shadowrocket、FlClash、Hiddify、Karing）通过标准订阅链接在本地调度 Mihomo、Xray 或 sing-box 内核，支持多机场切换、协议排障与自定义分流；专属客户端由服务商封装下发，账号登录即用，但**飞猫云、无忧链接（2026-10起）、Firefly（2026-10起）、灵猫网络（2026-10起）、SOGO 云、闪跃、全球云、隐形人**等品牌均在资料中标注不提供第三方订阅链接。选购与下载前，请先确认操作系统、CPU 架构与官方渠道属性；凡原始资料未提供经核验具体仓库路径的软件，本站统一标注为 **「尚未核实」**，绝不编造 GitHub 链接。

---

## 一、交互式客户端选型矩阵（按系统与架构筛选）

在深入阅读各平台与协议细节前，可以先使用下方交互式客户端矩阵，按目标操作系统（Windows / macOS / Android / iOS / Linux / OpenWrt）与客户端类型（第三方通用端 / 品牌专属端）快速筛选兼容方案，并核查维护警示与频道状态。

<ClientMatrix />

---

## 二、代理客户端的本质：为什么「软件外壳」不等于「代理内核」

很多用户在初次配置代理软件时，常把图形界面、底层内核与机场节点混为一谈，导致遇到报错时无从下手。从网络工程视角来看，一台终端设备要把本地浏览器或 App 的流量安全、准确地送往远程代理服务器，必须经过三个清晰解耦的层次：

1. **图形外壳层（GUI / 管理面板）**：也就是用户平时直接安装、点击开关和查看节点延迟的软件窗口，例如 **Clash Verge Rev**、**v2rayN**、**FlClash**、**Shadowrocket** 或软路由上的 **OpenClash**、**PassWall2**。图形外壳本身并不直接加解密数据包，它的核心职责是管理订阅链接、保存本地配置、提供节点测速界面、开关操作系统代理端口或拉起虚拟网卡服务，并在后台把整理好的配置文件喂给底层内核。
2. **底层代理内核层（Core / 引擎）**：真正负责握手、传输加密、规则匹配和 DNS 解析的二进制程序。目前主流开源生态形成了三足鼎立的格局：**Mihomo（原 Clash.Meta）**、**Xray-core** 与 **sing-box**（另有 Shadowrocket、Quantumult X、Surge 等苹果端自研闭源商业引擎）。如果某个客户端的内核版本过旧，即使机场下发了最新协议的节点，内核也会直接报错或忽略该节点。
3. **操作系统网络接管层（Transport / Hook）**：决定系统内哪些软件的流量会被送进代理内核。桌面端通常有两种路线：一种是 **「系统代理（System Proxy）」**，通过向 Windows 或 macOS 登记本地 HTTP/SOCKS 端口来接管遵循系统设置的浏览器；另一种是 **「TUN 虚拟网卡模式」**，通过创建虚拟网络接口在三层网络栈拦截 TCP/UDP 流量（配合 Windows/macOS 后台服务权限，Android 端对应系统级 `VpnService` 接口，iOS 端对应 `NetworkExtension` 框架，OpenWrt 端则通过 `tproxy` 或 `tun` 结合 `fw3/iptables` 或 `fw4/nftables` 防火墙接管全屋设备流量）。

理解这三层架构后，绝大多数客户端疑难杂症都能立刻定位归属：软件打不开或白屏通常是图形外壳依赖缺失（例如 WebView2 或 `.NET` 运行时）；某条新协议节点连不上通常是底层内核不支持或参数格式不匹配；而面板显示已连接但命令行、游戏或部分桌面软件不走代理，则属于操作系统网络接管层未启用 TUN 或服务权限未授予。具体机制可进一步参考 [TUN 模式详解与路由环路预防](/guides/tun-mode/) 与 [DNS 与 Fake-IP 配置指南](/guides/dns-setup/)。

---

## 三、客户端与机场订阅的协同机制：订阅不是简单的文本链接

购买支持第三方客户端的机场服务后，服务商会在用户后台提供一条或多条 **「订阅链接（Subscription URL）」**。许多用户误以为订阅链接只是一串固定不变的服务器 IP 清单，其实它是一套带身份鉴权与动态渲染能力的配置下发接口：

1. **鉴权凭证内嵌**：标准订阅 URL 末尾通常附带一串由服务商生成的随机 Token 或密钥参数。客户端每隔设定周期（或用户手动点击更新）向该 URL 发起 HTTPS GET 请求时，服务端凭借 Token 验证你的账户有效期与剩余流量，随后才返回最新可用的节点配置。因此，**订阅链接等同于你的代理账号密码**，一旦泄露给他人，对方无需登录你的机场官网就能消耗你的套餐流量。
2. **User-Agent 识别与动态适配**：同一个订阅链接，用 Clash Verge Rev 去拉取和用 v2rayNG 去拉取，拿到的响应体往往完全不同。机场订阅后端（或中转转换后端）会检查客户端发送的 HTTP `User-Agent` 请求头：识别为 Clash/Mihomo 系时返回完整的 **Clash YAML** 配置文件（包含 `proxies`、`proxy-groups` 与 `rules` 分流规则）；识别为 v2rayN/v2rayNG 时可能返回 **Base64 编码的纯节点链接列表**；识别为 sing-box 官方端或 Karing 时，部分现代面板会返回原生 **sing-box JSON** 配置。如果服务端没有开启多格式自动适配，或者客户端伪装的 User-Agent 与本地内核不匹配，就会出现 [HTTP 200 返回空订阅](/troubleshooting/articles/sub-http-200-empty) 或节点导入残缺的现象。
3. **订阅拉取链路与防自锁**：拉取订阅本身也是一次 HTTPS 网络请求。当订阅域名处于直连可访问状态时，客户端应优先通过直连拉取；当旧节点已经全部失效、而客户端又勾选了 **「通过代理更新订阅」** 时，就会陷入 **「节点断连导致无法更新订阅，不更新订阅又拿不到新节点」** 的死锁。反之，若机场当前订阅域名在本地网络环境下受到 DNS 污染或阻断，则需要先核实可用备用入口再执行更新。详细排查步骤见 [订阅更新失败专题](/troubleshooting/subscription-failure/) 与 [HTTP 401/403/404/503 订阅报错处理](/troubleshooting/articles/sub-http-401-403-404-503)。

---

## 四、第三方通用客户端 vs 机场专属客户端深度区分

在选购机场与规划日常使用环境时，**「用第三方通用客户端还是用机场专属 App」** 是最先影响后续体验的分水岭。站内收录的 31 家去重机场品牌在此维度上分化极为明显，两者的控制权边界、排障能力与迁移代价完全不在同一维度。

### 1. 核心架构与控制权对比表

| 对比维度 | 第三方通用订阅客户端 | 机场专属客户端（自研 / 定制封装 App） |
| :--- | :--- | :--- |
| **代表软件与来源** | Clash Verge Rev、v2rayN、Shadowrocket、FlClash、Hiddify、Karing、OpenClash 等社区开源或独立商业工具 | 各机场服务商官网自行提供的 Windows / macOS / Android / iOS 登录端 |
| **接入与认证方式** | 导入 Clash YAML、Base64 或 sing-box JSON 订阅链接 | 账号密码一键登录，节点与路由在客户端内部黑盒下发 |
| **多机场并发与冷备** | 支持同时导入多家服务商订阅，可按策略组互为备用（Failover） | 通常强绑定单一服务商账号，无法接入其他机场节点 |
| **规则与 DNS 透明度** | 可查看并修改每一条 GeoSite/GeoIP 规则、Fake-IP 池、DNS 上游与覆写脚本 | 多数仅暴露全局/智能分流两个开关，底层规则与 DNS 行为不可见 |
| **协议与内核可观测性** | 具备实时连接日志、TLS 握手报错、测速延迟与请求匹配追踪 | 报错信息多高度简化，难以定位是本地 DNS 冲突还是远端线路丢包 |
| **软路由与 Linux 适配** | 完美支持 OpenWrt（OpenClash/PassWall2/Nikki/HomeProxy）与 Linux 服务器（v2rayA） | 绝大多数仅覆盖 Win/macOS/Android/iOS 桌面与手机端（仅极少数如 SOGO 云宣称支持主流软路由） |
| **故障与停运迁移成本** | 某家服务商波动或停止服务时，保留原客户端直接替换另一家订阅即可 | 若不提供通用订阅，专属端停更、签名过期或停服后只能整体废弃重装 |
| **典型排障重心** | 订阅状态码、YAML/JSON 语法、内核架构匹配、TUN 服务权限 | 登录接口异常、专属 App 版本过期、iOS 企业签名掉签、账号授权状态 |

### 2. 31 家收录品牌的订阅策略全景归类

根据站内截至 `2026-10-19` 归档的品牌档案与 `data/clients.json`、`data/brands.json` 记录，可以将站内品牌按客户端支持方式划分为以下四类，选型前务必逐一核对：

1. **明确不支持第三方通用订阅（仅限专属客户端）的品牌（共 8 家）**：
   - [飞猫云](/brands/feimao/)：品牌资料宣称不用配订阅、专属客户端下载登录即用（但 `2026-08-11` 实测截图包留有其 Shadowsocks 节点测速快照，存在历史资料与当前定位差异）。
   - [无忧链接](/brands/wuyou/)：存在明确的政策时间线冲突——总表曾标注「订阅无需转换」，但介绍正文明确说明 **自 2026 年 10 月起改用官方专属客户端，不再折腾订阅**，是否仍对老用户或后台保留第三方订阅出口尚待核实。
   - [Firefly](/brands/firefly/)：主表 `#8` 明确标注 **2026 年 10 月起改用专属客户端，下载登录即用，不提供订阅链接**，Clash/Shadowrocket/软路由用户无法直接导入。
   - [灵猫网络](/brands/lingmao/)：资料明确标注 **2026 年 10 月起采用官方专属客户端，下载登录即用，不提供订阅链接**。
   - [SOGO 云](/brands/sogo/)：资料明确标注自研客户端覆盖 Windows、macOS、iOS、Android 与主流软路由，但**不提供订阅链接**，不支持 Clash、Shadowrocket 等第三方软件。
   - [闪跃](/brands/shanyue/)：资料明确标注专属客户端下载登录即用，**不提供订阅链接**，不支持第三方软件导入。
   - [全球云](/brands/quanqiu/)：资料明确标注专属客户端下载登录即用，**不提供订阅链接**，不支持第三方订阅。
   - [隐形人](/brands/yinxingren/)：资料明确标注自带专属客户端一键配置，**不提供订阅链接**，明确不支持 Clash、Shadowrocket 等第三方客户端。

2. **宣称「自研/定制客户端 + 第三方通用订阅」双模式品牌**：
   - 具备较好迁移弹性的双模式品牌包括 [光速云](/brands/guangsuyun/)（提供自研端并明确支持 Clash 系列/Mihomo 与 Shadowrocket 第三方导入）、[极连云](/brands/jilian/)、[光年梯](/brands/guangnian/)、[梯子云](/brands/tiziyun/)（强调小白一键登录客户端与通用订阅并存），以及 [二猫云](/brands/ermao/)（配备独家定制客户端，第三方订阅具体支持清单待进一步核实）。
   - 同属低价/中档资料集群中同时标注自研客户端与支持第三方订阅导入的品牌还包括：[闪电鼠](/brands/shandianshu/)、[大佬云](/brands/dalaoyun/)、[云界线](/brands/yunjiexian/)、[榴莲云](/brands/liulianyun/)、[神行加速](/brands/shenxing/)、[环球梯](/brands/huanqiuti/)（注意该组品牌普遍缺少独立测速截图或完整套餐梯度，选型时应与证据完整度一并考量）。

3. **主打第三方通用订阅（或未提及自研专属端）的品牌**：
   - [微风网络](/brands/weifeng/)（VLESS 协议兼容 Clash 等通用客户端）、[星岛梦](/brands/xingdaomeng/)（支持 Trojan/SS 兼容通用客户端）、[唯兔云](/brands/weitu/)（支持通用订阅）、[一翻云](/brands/yifan/)（未提专属端，支持 Hysteria 2 / VLESS-Reality / Shadowsocks 三协议第三方客户端）、[可信云](/brands/kexin/)（明确支持第三方客户端）、[速界](/brands/sujie/)（自研端与第三方订阅双支持）。

4. **客户端方式仍标为「待核实」的品牌**：
   - [暮光加速](/brands/muguang/)（仅提覆盖五大平台，具体形态是否开放标准订阅待核实）、[宇宙云](/brands/yuzhou/)（总表提自研端而详表明确标注使用方式待核实）、[灵动云](/brands/lingdong/)、[浪网](/brands/langwang/)、[边缘节点 EdgeNova](/brands/edgenova/)（三者均属 `2026-08-09` 历史归档记录，客户端支持列表待核实）。

> [!WARNING]
> **避坑提醒**：如果你日常需要在 **iPhone 上用 Shadowrocket**、在 **电脑上用 Clash Verge Rev 做 AI 分流**，或者需要在 **OpenWrt 软路由上全家共享代理**，下单前务必避开上述 8 家明确不提供通用订阅的品牌。一旦购买仅专属端服务，你将失去自定义规则（如单独分流 ChatGPT/Claude、屏蔽 Windows 更新偷跑流量）和跨设备复用同一套配置的能力；若已误购或原服务商政策收紧，可参阅 [服务异常或政策受限后的替代迁移方案](/security/alternatives/)。

---

## 五、六大操作系统平台完整选型矩阵（覆盖全量 24 款客户端）

以下严格依据站内 `data/clients.json` 与《2026 机场代理客户端大全》原始资料，按六大主流平台拆解每一款工具的驱动内核、适用人群、系统依赖与风险边界。所有尚未完成独立人工复核仓库链接的项目，源码/商店具体地址一律标为 **「尚未核实」**，请结合下文的渠道核验原则操作。

### 1. Windows 电脑端选型（共 8 款收录方案）

Windows 是第三方代理客户端最成熟、可选项最多的桌面环境，但同时也是「系统代理残余」「杀软误报隔离」和「缺少运行时依赖」报错最集中的平台。

| 客户端名称 | 底层内核 | 核心定位与功能特点 | 渠道类型 | 仓库/地址状态 | 关键选型与维护提示 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Clash Verge Rev** | Mihomo (Clash.Meta) | 订阅管理、规则分流、配置覆写、Service Mode TUN 模式 | GitHub | 尚未核实 | 新手及进阶主力首选；依赖 WebView2，开启 TUN 需安装后台服务 |
| **v2rayN** | Xray / sing-box 等多核心 | 多协议与节点列表精细管理、真连接测速、PAC/全局系统代理 | GitHub | 尚未核实 | 需确认系统已装对应 `.NET` 运行时及核心二进制文件完整 |
| **FlClash** | Mihomo | 规则分流、简洁跨平台界面、订阅配置 | GitHub | 尚未核实 | 适合追求 Windows 与 Android 界面和操作逻辑统一的 Mihomo 用户 |
| **Clash Nyanpasu** | 多内核（Clash / Mihomo） | Clash 图形界面、配置增强（Merge/Script）、多内核切换 | GitHub | 尚未核实 | 适合熟悉脚本合并与多版本内核对比调试的桌面用户 |
| **Hiddify** | sing-box | 多协议支持、多种订阅格式自动识别、自动节点选择、远程配置 | GitHub | 尚未核实 | 对新手极其友好，遇到不同格式订阅时兼容性省心 |
| **Karing** | sing-box | 多种订阅格式兼容、规则分流与路由管理、全平台统一配置体验 | GitHub | 尚未核实 | 面向新手的跨平台 sing-box 客户端，适合多端同步导出 |
| **Clash Mi** | Mihomo | 标准 Clash YAML 配置导入、简洁图形界面 | GitHub | 尚未核实 | 同样覆盖五大桌面与移动系统，适合轻量 Clash YAML 用户 |
| **Mihomo Party** | Mihomo | Mihomo 内核配置与分流管理 | GitHub | 尚未核实 | **维护提示**：原始资料要求单独核查当前维护状态，仅建议作历史迁移参考 |

**Windows 平台实操建议**：
- **不要再下载已停更的 Clash for Windows（CFW）**：原 CFW 项目已永久停止维护，且其内置早期原版 Clash 内核完全不支持 VLESS-Reality、Hysteria 2 等现代协议。网络上流传的所谓“CFW 最新修改版”存在极高捆绑木马风险。迁移步骤可参考 [客户端配置备份与安全迁移指南](/troubleshooting/articles/client-migration-backup)。
- **主力与备选搭配**：日常使用常规 Clash YAML 订阅的用户优先选 [Clash Verge Rev](/clients/clash-verge/)；需要同时混用大量散装 Base64 链接、单节点测试 VLESS/Xray 参数的用户建议配一套 [v2rayN](/clients/v2rayn/)；遇到机场下发的格式混乱或需极简上手时，可以用基于 sing-box 的 Hiddify 或 Karing 兜底。

### 2. macOS 苹果电脑端选型（共 9 款收录方案 + 芯片架构严格区分）

macOS 生态在图形界面客户端上与 Windows 高度重叠，但多出了苹果系专业商业工具（Surge Mac）与原生官方客户端（SFM），且 **芯片架构选错是最常见的安装踩坑点**。

| 客户端名称 | 底层内核 | 核心定位与功能特点 | 渠道类型 | 仓库/地址状态 | 关键架构与适配提醒 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Clash Verge Rev** | Mihomo | 规则分流、TUN（utun）虚拟网卡、配置覆写 | GitHub | 尚未核实 | 必须区分 Intel (`x86_64`) 与 Apple Silicon (`aarch64`/`arm64`) 包 |
| **FlClash** | Mihomo | 简洁跨平台 UI、规则分流与订阅管理 | GitHub | 尚未核实 | 同样区分 Intel 与 Apple Silicon 架构安装包 |
| **Clash Nyanpasu** | 多内核（Clash / Mihomo） | 多内核切换、脚本与配置增强 | GitHub | 尚未核实 | 适合有进阶配置脚本合并需求的 Mac 用户 |
| **v2rayN** | Xray / sing-box 等多核心 | 跨平台多核心桌面端，已提供 macOS 适配版本 | GitHub | 尚未核实 | 适合习惯 Windows 端 v2rayN 列表逻辑迁移到 Mac 的用户 |
| **Hiddify** | sing-box | 自动识别多订阅格式、自动选点 | GitHub | 尚未核实 | 跨全平台、开箱即用型方案 |
| **Karing** | sing-box | 跨平台订阅与路由策略管理 | GitHub | 尚未核实 | 适合和 iOS 端 Karing 共享配置习惯 |
| **Clash Mi** | Mihomo | 轻量 Mihomo 图形界面 | GitHub | 尚未核实 | 轻量化标准 YAML 运行环境 |
| **Surge Mac** | Surge 自研商业引擎 | 高级网络代理、规则控制、流量分析与抓包调试 | 官网 | 尚未核实 | 官网授权模式，定位偏专业网络开发与深度抓包调试 |
| **sing-box for macOS (SFM)** | sing-box | 官方原生 macOS 客户端 | 官方文档 | 尚未核实 | 面向标准 sing-box JSON 配置，直接导入 Clash YAML 会报错 |

**macOS 必看架构核对方法**：
点击屏幕左上角苹果菜单进入 **「关于本机」**：
- 若芯片/处理器显示 **Apple M1 / M2 / M3 / M4** 等 M 系列自研芯片，下载安装包时务必选择标注 **`arm64`、`aarch64` 或 `Apple Silicon`** 的 `.dmg` 文件。
- 若显示 **Intel Core i5 / i7 / i9** 等芯片，必须下载标注 **`x86_64`、`x64` 或 `Intel`** 的安装包。
- 若遇到 macOS Gatekeeper 提示“已损坏无法打开”或“无法验证开发者”，请先核实下载文件本身来自作者原始发布页并校验完整性，切勿对来路不明的第三方打包文件执行系统绕过指令。

### 3. Android 安卓端选型（共 8 款收录方案）

Android 端代理依靠系统级 **`VpnService`** 接口接管设备全局或分应用流量，不需要 Root 权限，但非常考验客户端在国产定制系统（MIUI/HyperOS、ColorOS、OriginOS、HarmonyOS 等）下的后台保活能力。

| 客户端名称 | 底层内核 | 核心定位与功能特点 | 渠道类型 | 仓库/地址状态 | 关键安全与适配提醒 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **v2rayNG** | Xray | Xray 系协议主力端，支持单节点链接与订阅导入 | GitHub | 尚未核实 | 安卓主力推荐；安装时仅认准官方开源发布页并核验 APK 签名 |
| **FlClash** | Mihomo | 规则分流、订阅配置、界面与桌面端一致 | GitHub | 尚未核实 | 安卓 Mihomo 系界面较现代化的主力备选 |
| **Clash Meta for Android (CMFA)** | Mihomo (Clash.Meta) | 完整支持 Clash YAML、规则分流与策略组 | GitHub | 尚未核实 | 注意与早已停更的旧版 Clash for Android（CFA）区分，避免旧覆写报错 |
| **Hiddify** | sing-box | 支持多种订阅格式自动解析、新手向界面 | GitHub | 尚未核实 | 对非技术背景安卓用户极友好 |
| **Karing** | sing-box | 多订阅导入、规则管理、支持跨端同步体验 | GitHub | 尚未核实 | 安卓主流推荐之一 |
| **Clash Mi** | Mihomo | 轻量级 Clash YAML 跨平台界面 | GitHub | 尚未核实 | 轻量规则分流备选 |
| **sing-box for Android (SFA)** | sing-box | 官方原生安卓客户端 | 官方文档 | 尚未核实 | 原生支持 sing-box JSON，需机场提供对应格式或自行转换 |
| **NekoBox for Android** | sing-box | 多协议支持，适合有一定基础的排障用户 | GitHub | 尚未核实 | **高危警告**：官方已提示维护资源有限，严禁使用 Google Play 同名版 |

> [!CAUTION]
> **NekoBox Google Play 第三方控制重大警告**：根据原始客户端安全审计资料，NekoBox for Android 官方项目已明确提示维护资源有限，并 **特别警告用户不要使用其名称下已被第三方控制的 Google Play 版本**。许多安卓用户习惯直接在 Play 商店搜索软件名一键安装，这在代理工具领域是极高风险的操作——一旦安装到被第三方接管或仿冒上架的版本，你的所有访问流量、节点订阅 Token 都可能遭到静默转发或劫持。更多安卓权限与断连问题可参考 [Clash Meta / CMFA 专题](/clients/clash-meta/) 与 [安卓端断连与后台保活指南](/vpn/android/)。

### 4. iPhone / iPad（iOS / iPadOS）端选型（共 11 款收录方案）

iOS/iPadOS 与桌面、安卓最大的差异在于**严格的应用商店沙盒与区服限制**：绝大部分高质量工具无法通过安装本地安装包直接运行，必须经由 App Store 下载，且**主流名牌软件多为一次性付费或含内购应用**。

| 客户端名称 | 底层内核/引擎 | 核心定位与功能特点 | 收费与渠道属性 | 仓库/商店状态 | 选型边界与特别注意 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Shadowrocket（小火箭）** | 自研多协议引擎 | 规则代理、订阅管理、本地 DNS 映射、流量与请求日志查看 | App Store（美区付费） | 尚未核实 | iOS 最通用首选；实际售价与可下载性以所属 App Store 地区为准 |
| **Stash** | Clash 兼容内核 | Clash 风格 YAML 规则、策略组、覆写（Override） | App Store（美区付费） | 尚未核实 | 适合电脑端已习惯 Clash YAML 体系、希望在 iPhone 无缝沿用规则的用户 |
| **Quantumult X（圈 X）** | Quantumult X 引擎 | 规则分流、HTTP 请求重写、JavaScript 脚本、自定义 DNS | App Store（美区付费） | 尚未核实 | 适合极客与进阶用户；配置格式与 Clash 不同，订阅常需专用格式 |
| **Surge 5** | Surge 商业引擎 | 高级网络代理、精细规则控制、流量抓包分析与调试 | App Store（含应用内购买） | 尚未核实 | 专业级网络调试工具；部分高级特性需内购授权解锁 |
| **sing-box (SFI)** | sing-box | 官方 sing-box 客户端，原生支持 sing-box JSON | 官方文档 / App Store | 尚未核实 | 适合熟悉原生 sing-box 配置体系的进阶用户 |
| **Hiddify** | sing-box | 多协议支持、自动识别多订阅格式、新手友好 | GitHub / App Store | 尚未核实 | 兼顾多平台界面统一与低上手门槛 |
| **Karing** | sing-box | 多格式兼容、规则分流与跨设备迁移 | App Store | 尚未核实 | 上架及可用性受用户当前 App Store 区域限制 |
| **Clash Mi** | Mihomo | Mihomo 内核、支持 Clash 风格配置 | App Store | 尚未核实 | 上架状态受地区商店政策影响 |
| **Streisand** | Xray / sing-box 兼容 | 支持 VLESS、VMess、Trojan、Hysteria 等现代协议 | App Store | 尚未核实 | 具体区服售价与可用性以对应区商店为准 |
| **Potatso** | 基础代理引擎 | 仅覆盖 Shadowsocks、SSR、SOCKS、HTTP(S) 等传统协议 | App Store | 尚未核实 | **协议局限**：不支持 VLESS 与 Hysteria 2，新机场用户需谨慎核对 |
| **OneClick** | 基础代理引擎 | 资料标注支持 VMess、Shadowsocks、Trojan 与订阅链接 | App Store | 尚未核实 | **协议局限**：使用 VLESS 或 Hysteria 2 协议机场前务必先核实兼容性 |

**iOS 付费与账号安全铁律**：
- 站内客户端资料明确强调：**Shadowrocket、Stash 与 Quantumult X 在美国 App Store 显示为付费应用，Surge 5 包含应用内购买，实际售价与上架情况均以用户所属 App Store 地区为准**（中国大陆区商店通常不可搜索或已下架此类工具）。
- **严禁在手机「设置 → Apple ID」主账户处登录任何来源不明的「免费共享美区账号」**。一旦对方在后台开启「查找我的 iPhone」远程锁定或修改密码，你的设备将面临变砖勒索风险，且 iCloud 照片、通讯录同步也会暴露。详见 [Shadowrocket（小火箭）使用与规则说明](/clients/shadowrocket/)。

### 5. Linux 桌面端与无头主机/服务端选型（共 9 款收录方案）

Linux 环境不仅有 Ubuntu、Fedora、Arch 等桌面发行版，还有大量没有图形界面的服务器、开发机与家庭 NAS，因此选型时必须先分清 **「有桌面（Desktop）」** 还是 **「无桌面（Headless）」**，并匹配包格式。

| 客户端名称 | 底层内核 | 适用形态 | 发行版包格式与核心定位 | 渠道类型 | 仓库/地址状态 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Clash Verge Rev** | Mihomo | Linux 桌面 | 提供多种安装包格式与架构，支持规则分流与 TUN | GitHub | 尚未核实 |
| **FlClash** | Mihomo | Linux 桌面 | 明确提供多种 Linux 安装包，界面简洁 | GitHub | 尚未核实 |
| **v2rayN** | Xray / sing-box 等 | Linux 桌面 | 多核心桌面客户端，适合习惯图形节点列表用户 | GitHub | 尚未核实 |
| **Clash Nyanpasu** | Clash / Mihomo | Linux 桌面 | 支持多内核与配置增强脚本 | GitHub | 尚未核实 |
| **Hiddify** | sing-box | Linux 桌面 | 多协议订阅客户端，自动识别多种格式 | GitHub | 尚未核实 |
| **Karing** | sing-box | Linux 桌面 | 跨平台 sing-box 系客户端 | GitHub | 尚未核实 |
| **Clash Mi** | Mihomo | Linux 桌面 | Mihomo 图形界面客户端 | GitHub | 尚未核实 |
| **sing-box for Desktop** | sing-box | Linux 桌面方向 | 官方桌面客户端演进方向 | 官方文档 | 尚未核实 |
| **v2rayA** | v2ray / Xray | **无桌面主机 / 网关 / 桌面** | 提供 Web 管理控制台与透明代理，适合无传统桌面设备 | GitHub | 尚未核实 |

**Linux 安装三大核对要点**：
1. **包格式匹配**：Ubuntu / Debian / Linux Mint 系优先选用 `.deb` 安装包；Fedora / RHEL / CentOS Stream 系选用 `.rpm` 包；若系统跨版本依赖冲突或使用其他发行版，可选便携运行的 `.AppImage`（需注意部分发行版需基础 FUSE 运行环境）。
2. **CPU 架构匹配**：常规 PC 与 x86 服务器选 `amd64` / `x86_64`；树莓派、ARM 架构开发板或 ARM 云主机必须选 `arm64` / `aarch64`。
3. **无头环境选 v2rayA**：在没有显示器和桌面环境的 Linux 主机、Docker 宿主机或家庭服务器上，不要硬装基于 Electron/Tauri 的桌面端，直接部署 **v2rayA** 并通过局域网浏览器访问其 Web 端口完成订阅导入与透明代理规则设置更为稳妥。

### 6. OpenWrt 软路由端选型（共 5 款收录方案 + 版本防火墙硬性要求）

把代理部署在 OpenWrt 软路由或旁路由上，可以让局域网内的电视盒子、游戏机、智能音箱与工作站无需单独装客户端即可按规则分流。但路由器固件碎片化极其严重，错误安装直接导致全屋断网或无法进入后台管理界面。

| 插件名称 | 底层内核 | 核心定位与功能特点 | 渠道类型 | 仓库/地址状态 | 关键固件与防火墙前置要求 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **OpenClash** | Mihomo / Clash | 经典 Mihomo/Clash 系规则代理、订阅管理、丰富策略界面 | GitHub | 尚未核实 | 需核对内核二进制版本、DNS 劫持方式及防火墙框架 |
| **PassWall2** | Xray / sing-box | 多核心节点管理、分流访问控制与透明代理 | GitHub | 尚未核实 | 需根据路由器 CPU 架构单独匹配对应的 Xray/sing-box 依赖包 |
| **Nikki** | Mihomo | 面向现代 OpenWrt 的 Mihomo 透明代理与策略管理 | GitHub | 尚未核实 | **硬性要求**：项目明确要求 **OpenWrt 24.10 及以上版本** |
| **HomeProxy** | sing-box | 基于 sing-box 的路由代理管理，原生适配现代固件 | GitHub | 尚未核实 | 贴合 OpenWrt `fw4` (nftables) 环境，需核对固件内核与 sing-box 版本 |
| **v2rayA** | v2ray / Xray | Web 控制界面、透明代理 | GitHub | 尚未核实 | 可用于部分 Linux 路由与网关环境，需确认透明代理内核模块完整 |

**OpenWrt 安装前五项必查清单**（详细操作与回滚步骤见 [全平台客户端安装指南](/guides/installation/)）：
1. **OpenWrt 主版本号**：例如 21.02、22.03、23.05 还是 **24.10+**。特别注意 **Nikki 明确要求 OpenWrt 24.10 及以上版本**，老固件不要强行刷入。
2. **路由器 CPU 架构**：如 `x86_64`（软路由小主机）、`aarch64_cortex-a53`（部分 ARM 硬路由）、`mipsel_24kc` 等，插件包和核心包必须与固件架构完全一致。
3. **包管理器差异**：传统 OpenWrt 使用 `opkg`（`.ipk` 包），而 OpenWrt 24.10+ 新版及部分快照已逐步引入 `apk` 包管理器，下载脚本或安装包格式前必须先确认当前固件采用哪套包体系。
4. **防火墙依赖（`fw3` vs `fw4`）**：OpenWrt 22.03 及之后版本已从传统的 `iptables (fw3)` 全面转向 `nftables (fw4)`。老旧插件强行在 `fw4` 上调用 `iptables` 规则会导致转发彻底失效甚至防火墙崩溃。
5. **内核与存储空间**：`kmod-tun`、`kmod-nft-tproxy` 等内核模块是否齐备，以及硬路由剩余 Flash 闪存空间是否够塞下数十 MB 的 Mihomo/sing-box 核心文件。

---

## 六、核心软件与两大内核生态深度入口

如果你不想在二十多款软件里反复对比，直接按自身设备与订阅需求切入以下五大核心专题即可完成 90% 的部署：

- **桌面端主推规则生态**：前往 [Clash Verge Rev 专题](/clients/clash-verge/)，系统掌握 Mihomo 内核升级、Win/macOS/Linux 架构区分、Service Mode 后台服务授权与 TUN 模式安全开启，以及从停更的 Clash for Windows 平滑导出旧配置的步骤。
- **安卓端与 Mihomo 系排障**：前往 [Clash Meta / CMFA 专题](/clients/clash-meta/)，理解 Clash Meta 到 Mihomo 的更名脉络、Android `VpnService` 沙盒权限机制，以及解决锁屏断连和桌面与手机规则不兼容的问题。
- **多核心与 Xray 协议管理**：前往 [v2rayN 专题](/clients/v2rayn/)，了解 GUI 外壳与 Xray/sing-box 底层分离的设计理念、系统代理未还原排查，以及解决 `.NET` 运行时缺失和核心文件加载失败的常规路径。
- **苹果移动生态与付费规范**：前往 [Shadowrocket（小火箭）专题](/clients/shadowrocket/)，了解美区付费购买注意事项、合规自建账号切换原则、一键导入订阅与局部规则微调技巧。
- **两大底层内核技术架构**：分别阅读 [Mihomo 内核生态专题](/clients/mihomo/) 与 [sing-box 多端生态专题](/clients/sing-box/)，彻底分清 Clash YAML 体系与原生 sing-box JSON 体系的边界，避开 Mihomo Party 维护疑虑与 NekoBox 第三方商店包陷阱。

---

## 七、协议与客户端兼容性对照表（含站内实测协议核对）

买机场最怕出现的低级失误，就是「服务商只提供新协议节点，而用户手里的客户端只支持老协议」。结合站内 `data/brands.json` 记录（涵盖 **VLESS、VLESS-Reality、Hysteria 2、Trojan、Shadowsocks、AnyTLS** 等协议）与 `data/clients.json` 能力定位，以下整理各协议的客户端兼容矩阵：

| 代理协议 | 协议特点与机场出现情况 | Mihomo 系（Clash Verge Rev / FlClash / CMFA / Stash / OpenClash / Nikki） | Xray 系主力（v2rayN / v2rayNG / PassWall2） | sing-box 系（SFA/SFI/SFM / Hiddify / Karing / HomeProxy） | iOS 商业端（Shadowrocket / Quantumult X / Surge / Streisand / Potatso / OneClick） |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Shadowsocks (SS)** | 站内 `2026-08-11` 批次 16 张测速截图中 **14 家** 均以此协议实测（含光速云、飞猫、星岛梦、二猫、唯兔、U1S1、灵猫、极连、光年、一翻、SOGO、可信、速界、全球云） | **完全支持** | **完全支持** | **完全支持** | **全线支持**（含仅支持传统协议的 Potatso 与 OneClick） |
| **Trojan** | 星岛梦、唯兔云、全球云文案及灵动云页面均有提及；兼容性高 | **完全支持** | **完全支持** | **完全支持** | Shadowrocket / Stash / Quantumult X / Surge / Streisand / OneClick 支持；**Potatso 不支持** |
| **VLESS（含普通与 Reality）** | 微风、Firefly、宇宙云、一翻云、闪电鼠、大佬云、云界线、神行、环球梯、梯子云等主力标注；快狸、无忧、光速云 70 节点图实测可见 | **支持**（需 Mihomo 内核；老原版 Clash 内核不支持） | **原生支持**（Xray 生态主力协议，Reality 支持完善） | **原生支持** | Shadowrocket / Stash / Streisand / Hiddify / Karing 支持；**Potatso / OneClick 不支持**；部分旧端版本需先核实 Reality 字段 |
| **Hysteria 2** | 如一翻云等宣称提供；基于 QUIC/UDP 传输，对高丢包弱网有优势但受限于本地 UDP QoS | **支持**（需较新 Mihomo 内核版本） | **支持**（v2rayN 可通过切换 sing-box/hysteria 核心调度；PassWall2 支持） | **原生支持** | Shadowrocket / Stash / Streisand / Hiddify / Karing 支持；**Potatso / OneClick 不支持**；Quantumult X 需核实具体版本 |
| **AnyTLS** | 光速云 `2026-08-19` 归档目录 `guangsuyun-miaoko-streaming-ai.jpg`（70 节点测试）中 `电信-` 前缀 10 个节点明确显示为 **AnyTLS** | **现代 Mihomo 生态逐步跟进支持**（需核实内核版本，老版本会报错跳过） | 视具体 Xray/衍生核心版本而定（v2rayN 可切 sing-box 核心） | **现代 sing-box 生态已纳入支持** | Shadowrocket / Hiddify / Karing 等新版本跟进；老客户端与传统端不支持 |

> [!NOTE]
> **站内品牌协议一致性审计提醒**：查阅 `data/brands.json` 时会发现，**星岛梦、唯兔云、二猫云、光年梯、SOGO 云、可信云、速界** 等 7 家品牌在文案中标注为 `Trojan` 或 `VLESS`，但在 `2026-08-11` 的 `MAI-TEST-BOT` 实测截图中均以 `Shadowsocks` 节点测得；**光速云**文案仅写 `VLESS`，而本地截图同时记录到 `Shadowsocks`、`Vless` 与 `AnyTLS`。这意味着机场后台往往同时维护多套协议订阅或按客户端类型动态下发节点，**因此选择同时兼容 SS/Trojan/VLESS/Hysteria 2/AnyTLS 的现代内核客户端（Mihomo / sing-box / 多核心 v2rayN）能最大程度避免「订阅导入后少节点」的尴尬**。

---

## 八、安装包架构选择、渠道核验与两项重大维护/安全提示

在互联网上搜索「Clash 下载」「v2rayN 官网」「小火箭免费下载」，搜索引擎前排经常充斥着购买了广告位的仿冒站和被二次打包的木马安装器。下载任何代理客户端前，请严格执行以下核验流程：

### 1. 官方渠道类型与「尚未核实」标注准则

本站遵循 **「零虚构、可复核」** 原则。在 `data/clients.json` 所依赖的原始参考文件《第三方代理客户端.txt》中，每一款客户端仅记录了发行渠道属性（**GitHub**、**App Store**、**官方网站** 或 **官方文档**），并未给出具体、经人工审计的可访问仓库路径。因此：
- 本站 **绝不从记忆中拼写或猜测 GitHub `owner/repo` URL**，所有未经过独立复核签名和发布者身份的地址均统一标为 **「尚未核实」** 或 **「项目地址待核实，请以作者发布页为准」**。
- 当你在外部社区检索作者原始发布页时，应核对项目 Star 历史连续性、Release 附件中的 `.sha256` 校验文件与发行者 GPG/APK 签名一致性，切勿从网盘分享链接、短视频评论区附件或名称拼写极其相似的“中文官网”下载可执行程序。

### 2. 必须牢记的两项高优先级警示

1. **Mihomo Party 维护状态需单独核实**：
   在 Windows 客户端列表中，Mihomo Party 被收录在参考名单内，但原始客户端审计资料明确指出：**「Clash Verge Rev、v2rayN、FlClash、Hiddify、Karing 和 Clash Mi 均有可核实的跨平台项目资料；Mihomo Party 则应单独关注项目维护状态，不宜未经核实就标为持续更新的首选客户端，主要用于历史教程和迁移场景。」** 如果你正在寻找新装主力桌面端，建议优先考虑维护关系清晰、跨平台资料明确的 Clash Verge Rev、FlClash、Hiddify 或 v2rayN。
2. **NekoBox for Android 严禁使用 Google Play 第三方控制版本**：
   在 Android 客户端列表中，NekoBox 官方项目不仅提示自身维护资源有限，而且 **「特别警告不要使用其名称下已被第三方控制的 Google Play 版本」**。请务必远离应用商店里来路不明的同名安装包，安卓端日常主力建议优先选择 v2rayNG、FlClash、Hiddify、Karing 或经核验官方发布页的 Clash Meta for Android。

### 3. 各平台安装包后缀与 CPU 架构速查表

| 操作系统 | 常见设备/系统特征 | 应匹配的安装包后缀或架构标识 | 常见下错症状 |
| :--- | :--- | :--- | :--- |
| **Windows** | 绝大多数台式机、Intel/AMD 笔记本 | `x64` / `amd64` (`.exe` 安装包或便携 `.zip`) | 误下 `arm64` 会提示“此应用无法在你的电脑上运行” |
| **Windows ARM** | 骁龙处理器 Windows 平板或笔记本 | `arm64` / `aarch64` | 误下 `x64` 虽可能通过转译运行但性能损耗或驱动失败 |
| **macOS (M 系列)** | M1 / M2 / M3 / M4 芯片 Mac | `arm64` / `aarch64` / `Apple Silicon` (`.dmg`) | 误下 `x86_64` 会触发 Rosetta 转译或虚拟网卡权限异常 |
| **macOS (Intel)** | 老款 Intel 处理器 Mac | `x86_64` / `x64` / `Intel` (`.dmg`) | 误下 `arm64` 会弹出禁止图标无法启动 |
| **Android** | 主流手机和平板；老旧电视盒子 | 主流手机选 `arm64-v8a`（不确定时可选通用包）；老盒子部分需 `armeabi-v7a` | 安装时提示“与您的手机不兼容”或“解析包失败” |
| **Linux 桌面** | Ubuntu/Debian；Fedora/RHEL；通用 | `.deb`（Debian系）、`.rpm`（RedHat系）、`.AppImage`（通用），配合 `amd64`/`arm64` | 选错打包格式无法用系统包管理器直接安装 |
| **OpenWrt** | 软路由 x86；硬路由 ARM/MIPS | 核对固件版本（如 Nikki 需 **24.10+**）、`opkg`/`apk`、CPU 架构与 `fw3/fw4` | 依赖报错、防火墙规则注入失败、重启后断网 |

---

## 九、订阅导入方式对比与格式转换边界

拿到支持通用客户端的机场订阅后，常见有四种导入路径，各自的成功率与安全边界各不相同：

1. **客户端内「粘贴订阅 URL 新建配置」（最推荐）**：
   直接从已核验的机场用户面板复制订阅地址，打开 Clash Verge Rev、v2rayN、Shadowrocket 或 Hiddify，选择 **「从剪贴板导入 / 下载配置文件」**。这种方式最可控，能直观看到 HTTP 状态码（如 200、401、403）和下载报错原因。
2. **机场面板「一键导入（URL Scheme）」**：
   部分网页面板提供“一键导入到 Clash / Shadowrocket / Hiddify”按钮，本质上是调用 `clash://install-config?url=...` 或 `shadowrocket://add/sub://...` 等本地协议唤起客户端。如果电脑同时装了多个 Clash 衍生客户端，系统协议绑定可能把链接唤起到早已停用或卸载残留的旧客户端中，导致界面毫无反应。此时直接改用「复制链接手动粘贴」即可解决。
3. **下载本地 YAML / JSON 配置文件再拖入客户端**：
   当本地网络无法让客户端直接拉取订阅、但浏览器可以下载配置文本时，可以先在面板下载 `.yaml` 或 `.json` 文件再以「本地文件（Local Profile）」导入。缺点是后续机场更换节点或 IP 后不会自动同步更新，需要重新下载覆盖。
4. **使用第三方在线「订阅转换」网站（高风险警告）**：
   当你的机场只输出 Base64 节点列表，而你想使用 Clash YAML 或原生 sing-box JSON 格式时，切忌图省事把付费订阅链接贴进百度/谷歌搜出来的陌生「免费在线订阅转换站」。这等同于把包含你鉴权 Token 的钥匙交给第三方服务器日志。安全替代方案包括：先在机场面板核查是否自带 `?flag=clash` / `?target=singbox` 等官方参数；优先使用自身兼容多格式的 **Hiddify**、**Karing** 或 **v2rayN** 直接导入；或仅在本地可信环境中完成离线格式转换。更多操作细节见 [机场订阅格式与导入教程](/guides/subscriptions/)。

---

## 十、常见配置错误与快速排查指引

安装并导入订阅后，最令人挫败的莫过于「节点测速有数字，但就是上不了网」或「某些软件死活不走代理」。下表总结了客户端侧最高频的八类配置错误与直接排障入口：

| 高频故障现象 | 典型客户端与触发原因 | 首选核查方向 | 对应排障指南入口 |
| :--- | :--- | :--- | :--- |
| **点击启动后界面白屏或核心无法加载** | Clash Verge Rev（缺 WebView2 / YAML 语法错误）；v2rayN（缺 `.NET` 运行时或核心压缩包不完整） | 核对系统运行时与配置文件语法，绝不关杀软 | [客户端无法启动排障中心](/troubleshooting/app-not-starting/) ｜ [Clash Verge 启动失败](/troubleshooting/articles/clash-verge-startup-fail) ｜ [v2rayN 核心加载失败](/troubleshooting/articles/v2rayn-core-load-fail) |
| **导入订阅后节点列表为空或直接报错** | 误复制了推广/登录页 URL、订阅返回值被空响应拦截（HTTP 200 空包）、机场仅限专属端 | 检查 URL 格式、HTTP 状态码与浏览器 User-Agent 差异 | [订阅更新失败排障](/troubleshooting/subscription-failure/) ｜ [HTTP 200 返回空订阅](/troubleshooting/articles/sub-http-200-empty) |
| **节点显示已连接，但网页完全打不开** | 系统代理未自动打开、浏览器装有冲突代理插件、残留旧版代理端口占坑 | 检查系统代理端口与实际软件监听端口是否一致 | [连上但打不开网页排查](/troubleshooting/cannot-connect/) ｜ [v2rayN 系统代理失效](/troubleshooting/articles/v2rayn-system-proxy-fail) |
| **开启 TUN 模式后终端/游戏依然不走代理或全网断连** | Windows/macOS 未安装/开启 Service Mode 权限、与其他加速器/VPN 虚拟网卡发生路由环路 | 检查服务权限状态，互斥关闭其他 VPN 后再试，备好回滚 | [TUN 模式完全指南](/guides/tun-mode/) ｜ [TUN 模式无效排查](/troubleshooting/articles/tun-not-working) |
| **Ping 域名返回 `198.18.0.1` 或 DNS 泄漏** | Mihomo/sing-box 开启了 Fake-IP 机制（正常现象），但部分国内应用或局域网服务不兼容伪 IP | 按需切换 Redir-Host 对比，检查安全 DNS 抢跑 | [Fake-IP 198.18 冲突排查](/troubleshooting/articles/fake-ip-explained-fix) ｜ [DNS 泄漏与污染修复](/troubleshooting/articles/dns-leak-hijack-fix) |
| **所有节点突然同时超时（Timeout）** | **本机系统时间偏差超过 90 秒**（导致 TLS/VLESS 握手全灭）、本地网络断联或订阅地址过期 | 先校对系统自动时间，再测直连网络与拉新订阅 | [节点全超时排查](/troubleshooting/timeout/) ｜ [系统时间与 TLS 报错](/troubleshooting/articles/time-sync-tls-cert-error) |
| **同一个订阅在电脑能用、手机却连不上或分流错乱** | 桌面端覆写脚本含本地路径或系统独占字段、Android 后台省电杀进程、iOS 规则差异 | 暂时关闭自定义覆写（Override），恢复默认配置对比 | [跨客户端表现不一致排查](/troubleshooting/articles/cross-client-inconsistency) ｜ [安卓断连排查](/troubleshooting/articles/android-v2rayng-clash-disconnect) |
| **常规网页正常，唯独 ChatGPT / Claude / 特定网站报错** | 选中了香港节点（被 OpenAI/Anthropic 限制）、分流规则漏域、浏览器残留旧风控 Cookie | 单独为 AI 建立美/日/新规则组并开无痕窗口测试 | [AI 与流媒体适配指南](/ai-media/) ｜ [特定站点不可达排查](/troubleshooting/articles/specific-sites-unreachable) |

---

## 十一、客户端安全与隐私操作守则

代理客户端运行在操作系统网络流量的咽喉位置，一旦软件本身或配置习惯出现安全漏洞，危害远高于普通应用：

1. **绝不为了运行代理软件而关闭系统安全防护**：任何攻略、客服或群文件如果要求你「先彻底关闭 Windows Defender / 火绒 / 杀毒软件，再解压运行这个魔改版客户端」，**请立即停止操作并删除文件**。正规开源客户端通过系统合法接口工作，不应以牺牲主机防线作为运行前提。
2. **严格区分开源通用端与闭源专属端的信任边界**：开源通用客户端（如 Clash Verge Rev、v2rayN、Mihomo、sing-box）的代码逻辑接受社区公开审视，前提是你从作者真实发布渠道获取且未经第三方二次打包；而各机场自研的闭源专属客户端属于不透明黑盒程序，在工作电脑或存有高敏感开发凭证的设备上安装闭源网络接管软件前，应审慎评估业务隔离需求。详见 [隐私边界与客户端安全](/security/privacy/)。
3. **发帖求助与工单排查必须先脱敏**：如需截图或导出日志排查 YAML 解析错误、核心报错，务必先清除或打码订阅链接中的 `token=`、`key=`、服务器真实域名/IP、UUID 与密码字段。若不慎在公开场合或未知转换站暴露了订阅链接，应立即前往机场用户面板点击 **「重置订阅链接 / 重置 UUID」** 并重新导入。详见 [账号与订阅 Token 防护](/security/account-security/)。
4. **合规使用与环境边界**：代理网络工具属于基础通信软件，请务必严格遵守所在地法律法规、高校/企业内网安全管理制度及目标平台服务条款，不将代理软件用于任何违规或未经授权的网络活动。

---

## 十二、常见问题（FAQ）

### 第三方通用客户端和机场专属客户端有什么本质区别？
第三方通用客户端（如 Clash Verge Rev、v2rayN、Shadowrocket、FlClash、Hiddify、Karing）通过导入标准订阅链接在本地加载代理内核，支持同时管理多家服务商、自由调整分流规则与 TUN/DNS 参数；机场专属客户端由服务商打包分发，多数封装为账号密码登录即用，但部分品牌完全不提供通用订阅链接，一旦客户端停止更新或用户想迁移至路由器与其他终端，灵活度会明显受限。

### 哪些机场品牌目前仅支持专属客户端而不提供第三方通用订阅链接？
根据站内截至 2026-10-19 归档的品牌资料，明确标注仅走专属客户端或不提供第三方订阅链接的品牌包括飞猫云、无忧链接（2026 年 10 月起改用官方专属端，历史总表冲突已单列）、Firefly（2026 年 10 月起不提供订阅链接）、灵猫网络（2026 年 10 月起不提供订阅链接）、SOGO 云、闪跃、全球云与隐形人。购买前若计划使用 Clash、Shadowrocket 或 OpenWrt 软路由，应避开上述仅专属端品牌或先向客服核实。

### 为什么本页所有开源客户端与商店客户端的具体仓库或下载 URL 均标注为「尚未核实」？
本站引用的原始客户端清单仅记录了托管渠道类别（如 GitHub、App Store、官方网站或官方文档），并未附带经独立签名校验的具体仓库路径或商店 ID。为杜绝拼写误差、镜像站投毒与仿冒包误导风险，所有未经人工复核的外部仓库地址统一标注为「尚未核实」或「项目地址待核实，请以作者发布页为准」。

### Mihomo Party 为什么被单独标注需要核查维护状态？
在站内客户端审计资料中，Clash Verge Rev、v2rayN、FlClash、Hiddify、Karing 与 Clash Mi 均记录有跨平台活跃项目资料，而 Mihomo Party 原始资料明确提示「应单独关注项目维护状态，不宜未经核实就标为持续更新的首选客户端」，目前主要作为历史教程与配置迁移排查场景的参考对象。

### 下载 NekoBox for Android 时为什么特别禁止使用 Google Play 同名版本？
根据客户端原始资料明确警示，NekoBox 官方项目维护资源有限，且已专门警告不要使用其名称下已被第三方控制的 Google Play 版本。安装被第三方接管或篡改的商店版本可能导致代理流量被劫持、订阅凭证泄露或植入恶意广告组件。

### iPhone 和 iPad 上的 Shadowrocket、Stash、Quantumult X 是免费的吗？
不是。根据站内资料记录，Shadowrocket（小火箭）、Stash 与 Quantumult X（圈 X）在美国区 App Store 均显示为付费应用，Surge 5 则包含应用内购买，而具体售价与当前区服可下载状态均以用户本人所持 App Store 地区为准。切勿在系统 iCloud 主设置中登录来路不明的共享账号，以免造成设备锁机。

### macOS 苹果电脑下载 Clash Verge Rev 或 FlClash 时如何避免装错安装包？
必须先确认本机处理器架构：Apple M1/M2/M3/M4 等 Apple Silicon 芯片应选择 arm64 或 aarch64 版本，而老款 Intel 处理器 Mac 必须选择 x86_64（x64）版本。部分跨平台客户端同时提供通用包或分架构包，下错架构会直接导致无法打开或性能损耗。

### Linux 桌面端和没有图形界面的 Linux 服务器分别适合哪类客户端？
带有桌面环境的 Ubuntu、Debian、Fedora 等系统可按发行版包格式选择 DEB、RPM 或 AppImage 安装包（如 Clash Verge Rev、FlClash、v2rayN、Hiddify），同时匹配对应 CPU 架构；对于无桌面环境的 Linux 服务器、NAS 或网关设备，则应优先选用提供 Web 控制面板与透明代理能力的 v2rayA。

### OpenWrt 软路由安装 Nikki、OpenClash、PassWall2 或 HomeProxy 前必须检查什么？
路由器环境不同于普通桌面系统，安装前必须逐一核对 OpenWrt 主版本号、设备 CPU 架构、包管理器类型（opkg 或 apk）、内核模块及防火墙依赖（fw3/iptables 还是 fw4/nftables）。其中 Nikki 项目已明确要求 OpenWrt 24.10 及以上版本，低版本固件强行安装会出现依赖缺失或透明代理失效。

### 同一份机场订阅在 Clash Verge Rev、v2rayN 与 Shadowrocket 中看到的节点数量或协议不一致是为什么？
大多数机场订阅服务端会读取请求头中的 User-Agent 字段，按客户端类型自动下发不同格式或过滤掉旧内核不支持的协议节点；此外，不同客户端对同一条订阅（例如包含 AnyTLS、VLESS-Reality 或 Hysteria 2 的节点）的解析容错度不同，也会导致个别节点被静默跳过。

### 客户端提示核心启动失败或缺少运行时，能通过关闭 Windows Defender 或系统杀毒软件来解决吗？
绝对不能。任何要求用户先关闭系统安全防护才能运行代理软件的做法都属于高风险行为。正确的排查方式是核验安装包来源与数字签名/哈希值，确认是否缺少合法的系统依赖（例如 v2rayN 所需的 .NET 桌面运行时或 Clash Verge Rev 所需的 WebView2 组件），并按照标准排障流程定位具体报错文件。

### 使用机场订阅或排查客户端报错时，有哪些绝对不能泄露的敏感信息？
绝不能将未经脱敏的完整订阅 URL（内含鉴权 Token）、节点 UUID、密码、服务器域名或完整 YAML/JSON 配置文件直接粘贴到公开论坛、群聊或未知第三方在线订阅转换网站。如需求助排障，务必先替换掉所有鉴权参数与域名片段，仅保留脱敏后的核心报错日志。

---

## 十三、下一步实用入口

- **准备装机与核对芯片架构**：[全平台客户端安装指南（Win/macOS/Linux/OpenWrt）](/guides/installation/)
- **学习导入配置与规则**：[机场订阅格式教程](/guides/subscriptions/) ｜ [Clash 基础配置指南](/guides/clash-setup/) ｜ [分流规则配置](/guides/split-routing/)
- **检索支持通用订阅的机场**：[31 家机场品牌数据库](/brands/directory/) ｜ [专属端 vs 通用订阅权衡](/airport/easy-to-use/)
- **客户端报错急救**：[客户端无法启动排障](/troubleshooting/app-not-starting/) ｜ [全部故障排查总入口](/troubleshooting/)
