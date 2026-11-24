---
title: sing-box 客户端生态全景：官方 SFA/SFI/SFM、JSON 配置结构、Hiddify/Karing 与 NekoBox 安全警告
description: 全面解析 sing-box 官方原生多端（SFA/SFI/SFM/Desktop）、JSON 核心配置结构、第三方衍生客户端（Hiddify、Karing、HomeProxy、v2rayN/PassWall2）差异及适用场景，并重点警示 NekoBox Google Play 仿冒版高危风险。
pillar: clients
primaryKeyword: sing-box 客户端
intent: informational
publishedAt: 2026-11-23
updatedAt: 2026-11-23
schemaType: SoftwareApplication
software:
  name: sing-box
  operatingSystem: Windows, macOS, Android, iOS, Linux, OpenWrt
  applicationCategory: NetworkingApplication
breadcrumbs:
  - text: 首页
    link: /
  - text: 客户端软件
    link: /clients/
  - text: sing-box
    link: /clients/sing-box/
faq:
  - q: sing-box 官方提供的 SFA、SFI、SFM 分别对应什么设备？
    a: 根据站内客户端资料，SFA（sing-box for Android）对应安卓手机与平板，SFI（sing-box）对应 iPhone/iPad 的 iOS 端，SFM（sing-box for macOS）对应苹果电脑端，此外桌面端也包含 sing-box for Desktop 方向。官方客户端下载来源标注为「官方文档（项目地址待核实）」。
  - q: 为什么新手用 sing-box 生态时，通常优先推荐 Hiddify 或 Karing 而不是官方端？
    a: 官方 SFA/SFI/SFM 严格要求标准 sing-box JSON 配置文件，直接粘贴 Clash YAML 或普通 Base64 节点链接会报错；而 Hiddify 与 Karing 在底层基于 sing-box 生态的同时，内置了对多种机场订阅格式（Base64、Clash、sing-box）的自动识别与新手向图形界面，上手门槛低得多。
  - q: NekoBox for Android 还能在 Google Play 上直接搜索安装吗？
    a: 绝对不建议。根据原始客户端安全资料明确警示，NekoBox 官方项目已提示维护资源有限，且特别警告用户不要使用其名称下已被第三方控制的 Google Play 版本，以免遭遇订阅凭证窃取、恶意广告植入或流量劫持风险。
  - q: sing-box 的 JSON 配置文件和 Mihomo 的 YAML 配置有哪些核心结构区别？
    a: Mihomo 使用 YAML 缩进声明 proxies、proxy-groups 与 rules；sing-box 则采用严格的 JSON 结构，通过 log、dns、inbounds（如 tun/mixed）、outbounds（如 selector/urltest 与各协议出站）、route（含 rule_set .srs 规则集与 final）及 experimental 模块解耦控制。两者语法不互通，不能混用。
  - q: 已经不小心在 Google Play 下载过同名 NekoBox 客户端，应该如何应急止损？
    a: 应立即停止连接并卸载该第三方控制的商店应用，随后立即登录你的机场用户后台点击「重置订阅链接 / 重置 UUID」，销毁可能已经泄露的旧订阅 Token，最后改用可核实渠道的 Hiddify、Karing、v2rayNG 或 FlClash 重新导入新订阅。
  - q: OpenWrt 软路由上选择 HomeProxy 和 PassWall2 使用 sing-box 核心有什么不同？
    a: HomeProxy 是专为现代 OpenWrt（尤其是原生 fw4/nftables 防火墙环境）打造的基于 sing-box 的路由代理管理插件；PassWall2 则是多核心路由器管理插件，支持在 Xray 与 sing-box 等核心之间配合节点策略分流。安装前均需核对路由器固件版本、CPU 架构与内核模块。
  - q: 为什么同一条机场订阅导入 sing-box 官方端和 Karing 表现不一致甚至导入失败？
    a: 大多数机场会根据客户端发出的 HTTP User-Agent 识别返回模板。若后端未对官方端 UA 做适配而仍下发 Clash YAML，官方 SFA/SFI/SFM 会直接因 JSON 解析失败而报错；而 Karing 或 Hiddify 具备多格式兜底转换能力，且各版 sing-box 内核对新版路由字段兼容性也存在差异。
---

# sing-box 客户端生态：官方矩阵、JSON 架构、衍生差异与 NekoBox 防仿冒警告

> **核心结论（Answer-First）**：**sing-box** 是近年来快速普及的新一代跨平台通用代理平台与底层核心，凭借统一的多协议栈、低内存占用与结构化 JSON 配置架构覆盖全平台。其客户端生态分为三层：**官方原生客户端（SFA / SFI / SFM / Desktop）** 面向原生 sing-box JSON 配置；**第三方兼容客户端（Hiddify、Karing、v2rayN、Clash Nyanpasu）** 降低多格式订阅门槛；**软路由插件（HomeProxy、PassWall2）** 承载 OpenWrt 透明代理。请高度警惕原始资料中的安全红线：**NekoBox 官方项目已提示维护资源有限，且特别警告不要使用其名称下已被第三方控制的 Google Play 版本！**所有原始资料未给出具体 URL 的项目，本站统一标为 **「项目地址待核实，请以作者发布页为准」**。

---

## 一、技术定位与官方原生客户端矩阵（SFA / SFI / SFM / Desktop）

与早期代理内核往往「一个核心偏重一类协议」的割裂格局不同，**sing-box** 从底层架构设计之初就定位为「通用代理平台（Universal Proxy Platform）」。它把传统需要多个二进制拼装才能完成的能力整合进同一个轻量级引擎中，原生支持 Shadowsocks、VMess、Trojan、VLESS（含 Vision / XTLS-Reality）、Hysteria 2、TUIC 以及现代新版关注的 AnyTLS 等全系协议，同时在内存占用与路由器/移动端功耗控制上表现突出。

在图形端生态中，sing-box 官方团队自己维护着一套覆盖移动与桌面的原生客户端家族（《2026 机场代理客户端大全》中渠道类型统一记为 **「官方文档」**，具体地址待核实）：

| 官方客户端简称 | 完整名称与适用平台 | 渠道类型与地址状态 | 核心定位与使用前置门槛 |
| :--- | :--- | :--- | :--- |
| **SFA** | sing-box for Android（Android） | 官方文档（待核实） | 原生安卓客户端，通过系统 `VpnService` 与现代内核交互，需使用标准 sing-box JSON 配置 |
| **SFI** | sing-box（iPhone / iPad） | 官方文档 / App Store（待核实） | 原生 iOS/iPadOS 客户端，基于 `NetworkExtension` 运行，适合掌握原生 JSON 配置的用户 |
| **SFM** | sing-box for macOS（macOS） | 官方文档（待核实） | 官方苹果桌面端，需注意区分系统版本与芯片架构及对应系统扩展权限模式 |
| **sing-box for Desktop** | 官方桌面方向（Linux 等） | 官方文档（待核实） | 面向桌面环境的官方客户端演进方向，强调标准化通用配置一致性 |

> [!NOTE]
> **为什么很多新手打开官方 SFA / SFI / SFM 却导入订阅失败？**
> 官方客户端定位偏向「标准协议与配置运行器」，**严格要求导入符合其 Schema 的原生 sing-box JSON 配置文件**。绝大多数机场后台默认下发的仍是 Clash YAML 或 Base64 节点列表，直接粘贴进 SFA/SFI/SFM 会触发 `invalid character` 等 JSON 解析报错。如果你的服务商没有明确提供「sing-box 专用订阅」，切勿硬塞进官方端，也不要把订阅链接粘贴进陌生在线转换站——应直接换用下文支持多格式自动识别的 **Hiddify** 或 **Karing**。

---

## 二、sing-box JSON 配置核心结构解析（对比 Mihomo YAML）

理解 sing-box JSON 的模块化结构，不仅能帮助进阶用户看懂官方配置，也能迅速判断第三方衍生端报错时究竟卡在哪个环节。与 [Mihomo 内核](/clients/mihomo/) 的 YAML 结构相比，sing-box JSON 更加强调「入站（Inbound）与出站（Outbound）的双向解耦」：

### 1. 六大顶级 JSON 模块职责表

| JSON 顶级键 | 模块职能 | 核心字段与排障高频注意项 |
| :--- | :--- | :--- |
| **`log`** | 控制内核日志级别与输出路径 | `level`（如 `info`/`warn`/`error`），排障期设为 `debug` 或 `info` 观察分流命中 |
| **`dns`** | 定义多组 DNS 服务器与域名解析分流规则 | 包含 `servers`（如远程 DoH/UDP、本地直连 DNS 与 `fakeip`）、`rules`（匹配 `rule_set` 或域名走对应解析器）、`strategy`（如 `prefer_ipv4`/`ipv4_only`）及 `final` 默认服务器 |
| **`inbounds`** | 接收本机或局域网流量的入口 | 桌面与移动端最核心为 `tun`（虚拟网卡入站，配置网段 `address`/`inet4_address`、栈模式 `stack` 与 `auto_route`）与 `mixed`（混合代理端口） |
| **`outbounds`** | 所有流量出口，既包含代理协议节点也包含策略组 | 包括 `selector`（手动选组）、`urltest`（自动测速组）、具体协议节点（`vless`/`hysteria2`/`shadowsocks`/`trojan`/`anytls`）以及 `direct`、`block` |
| **`route`** | 决定入站流量具体送往哪一个出站 | 通过 `rules` 与高性能二进制规则集 `rule_set`（常见 `.srs` 后缀）匹配端口、协议嗅探（`sniff`）、IP 与域名，最终由 `final` 兜底 |
| **`experimental`** | 实验性与管理接口（如控制面板与缓存） | 常见 `clash_api`（提供兼容面板控制端口）与 `cache_file`（本地持久化选中节点、远程 `.srs` 缓存及 Fake-IP 映射） |

### 2. JSON 语法严格性与内核版本演进踩坑提示

1. **严格的逗号与引号校验**：与 YAML 不同，标准 JSON 绝对不允许最后一个字段后面多出一个尾随逗号（Trailing Comma），也不支持原生 `//` 注释（除非特定前端预处理）。手工修改配置后哪怕漏了一个引号都会导致整份配置拒载。
2. **新版本路由与 DNS 字段废弃演进**：sing-box 内核迭代节奏非常快，从早期内嵌 `geoip`/`geosite` 数据库与旧式 `dns-outbound` 拦截写法，已逐步演进至更轻量的远程或本地二进制 **`rule_set`（`.srs` 格式）** 以及独立 `sniff` / `hijack-dns` 规则动作。如果你从两年前的旧教程复制了一套老旧 JSON 模板导入最新版 SFA/SFI/SFM，往往会立刻触发字段已弃用或被移除的启动报错。遇到此类版本跨越报错时，优先在机场面板拉取最新生成的 sing-box 订阅，或使用自身负责生成现代 JSON 的 Hiddify/Karing。
3. **`.srs` 规则集加载超时与缓存失效**：当一份原生配置在 `route.rule_set` 中引用了境外托管的 `.srs` 规则集地址，而设备首次连接时处于未联网状态，规则集下载超时会导致启动中断。建议在配置中确认已为规则集下载指定合理的 `download_detour` 出站走代理，或首次先使用精简基础配置连网后再同步规则集缓存。

### 3. sing-box JSON 与 Mihomo YAML 全维度选型对照

在规划家庭网络、移动设备与桌面端选型时，很多用户会在「Mihomo（YAML 生态）」与「sing-box（JSON 生态）」之间犹豫。两者均为现代高性能核心，但在配置结构、路由插件与新手上手方式上有清晰分化：

| 对比维度 | sing-box 生态（官方端 / Hiddify / Karing / HomeProxy） | Mihomo 生态（Clash Verge Rev / FlClash / CMFA / OpenClash / Nikki） |
| :--- | :--- | :--- |
| **原生配置文件格式** | 严格 JSON 格式（`inbounds` / `outbounds` / `route` / `dns`） | 缩进 YAML 格式（`proxies` / `proxy-groups` / `rules` / `dns`） |
| **官方图形客户端** | 官方团队直接提供 SFA（安卓）、SFI（iOS）、SFM（macOS）与桌面方向 | 无官方统一图形客户端，完全依赖 Clash Verge Rev、FlClash 等社区外壳 |
| **对机场订阅格式包容度** | 官方端仅接收标准 sing-box JSON；**Hiddify** 与 **Karing** 可兼容多种常见订阅格式 | 通用接收标准 Clash YAML 订阅，各衍生端界面策略组交互高度一致 |
| **规则集与资源库格式** | 逐步统一至高性能二进制 `.srs` 规则集（`rule_set`），极省内存 | 支持 `Country.mmdb`、`geosite.dat`、`rule-providers` 与 `.mrs` 二进制格式 |
| **OpenWrt 软路由生态** | 原生契合现代 `fw4` 固件的 **HomeProxy**，以及多核心 **PassWall2** | 经典全能的 **OpenClash**，以及明确要求 OpenWrt 24.10+ 的 **Nikki** |
| **资源占用与多协议能力** | 内存占用极低，原生统一涵盖 VLESS/Reality/Hysteria2/TUIC/SS/AnyTLS | 同样全面覆盖现代协议，但在大规则文本下部分旧路由设备需注意内存分配 |

### 4. 核心概念与版本迁移排障清单

1. **为什么开启 TUN 后本地开发容器、WSL 或局域网服务连不上？**：在 sing-box 的 `tun` 入站配置中，默认会拦截系统大部分 DNS 与三层 IP 流量。若规则未排除私有网段（如 `ip_is_private: true` 走 `direct`），或 DNS 启用了 `fakeip` 却未将内部开发域名排除在假 IP 范围外，就会导致局域网互访卡死。排障时应检查 `route.rules` 中私有 IP 直连规则是否位于高优先级位置。
2. **客户端报 `User-Agent` 过滤或「节点少一半」如何判断？**：同一条机场订阅链接，在 Clash Verge Rev 里能看到 40 个节点，导入部分 sing-box 客户端却报错或只有十几个节点，往往是机场订阅服务器根据请求头做了分流过滤。建议先在支持多协议与多格式自动转换的 **Karing** 或 **Hiddify** 中对比，切勿将含私人 Token 的链接交给来路不明的在线订阅转换网站。
3. **Android 端 SFA / Hiddify / Karing 的电池保活边界**：与所有安卓规则代理软件相同，官方 SFA 及衍生端同样依托系统级 `VpnService` 工作，同一时间不能与其他 VPN/去广告应用共存；遇到锁屏断连时，同样需要去手机电池设置开启「无限制」、锁定后台任务并允许常驻通知。

---

## 三、第三方衍生与多核心客户端矩阵及差异对比

正因为官方端坚持纯粹 JSON 标准而提高了普通用户的上手门槛，围绕 sing-box 生态涌现出多款兼顾多订阅格式与图形体验的第三方客户端与路由器插件：

| 客户端 / 插件名称 | 适用平台 | 渠道类型与地址状态 | 与官方端的核心差异及适用场景 |
| :--- | :--- | :--- | :--- |
| **Hiddify** | Win / macOS / Linux / Android / iOS | GitHub / App Store（待核实） | **全平台新手主力**：底层基于 sing-box，但支持多种机场订阅格式（Clash/Base64/sing-box）自动识别、自动选点与远程配置，跨全设备体验一致 |
| **Karing** | Win / macOS / Linux / Android / iOS | GitHub / App Store（待核实） | **跨端规则管理能手**：基于 sing-box 系构建，支持多订阅汇聚与精细路由管理，适合在手机与电脑之间无缝沿用配置习惯（iOS 上架与区服以所属 App Store 地区为准） |
| **[v2rayN](/clients/v2rayn/)** | Win / macOS / Linux | GitHub（待核实） | **多核心调度管理器**：GUI 外壳可根据节点协议灵活调度 Xray 或 sing-box 核心，擅长管理大量散装 Base64 节点与独立参数调试 |
| **Clash Nyanpasu** | Win / macOS / Linux | GitHub（待核实） | **多内核桌面端**：偏重 Clash 界面生态与 Merge/Script 扩展增强，同时具备多内核切换能力 |
| **HomeProxy** | OpenWrt 软路由 | GitHub（待核实） | **OpenWrt 原生路由插件**：专门基于 sing-box 构建，原生贴合现代 OpenWrt `fw4`（nftables）防火墙框架，适合路由器透明代理 |
| **PassWall2** | OpenWrt 软路由 | GitHub（待核实） | **路由器多核心插件**：支持在 OpenWrt 上按节点分别调度 Xray 或 sing-box 核心，需按路由器 CPU 架构单独匹配核心包 |
| **NekoBox for Android** | Android | GitHub（待核实） | **高危安全警告**：官方项目已提示维护资源有限，且**严禁使用已被第三方控制的 Google Play 同名版本** |

### 适用场景快速决策建议

- **普通跨平台多设备用户 / 新手**：如果你既用 Windows/Mac 电脑又用安卓或 iPhone，且机场只发通用 Base64 或 Clash YAML，优先选用 **Hiddify** 或 **Karing**，既享受 sing-box 的协议兼容性又无需手写 JSON。注意 iOS 端获取 Karing、SFI 或 Hiddify 时，上架状态受所属 App Store 地区政策限制，且务必遵守「仅在 App Store 内使用本人海外区账户下载、绝不登录陌生人共享账号到系统 iCloud」的安全守则。
- **追求纯原生极客体验的开发者**：如果自己维护服务端节点或机场明确提供最新版标准 sing-box JSON 订阅，直接选用官方 **SFA / SFI / SFM**，内存与电量控制最精简。注意在 macOS 上安装 SFM 或桌面端时同样需区分 Intel（`x86_64`）与 Apple Silicon（`arm64`）芯片架构。
- **OpenWrt 软路由全屋代理用户**：搭载 OpenWrt 22.03/23.05/24.10+ 等使用 `fw4`（nftables）防火墙的路由器，且偏好 sing-box 轻量架构时，优先评估 **HomeProxy**。安装前务必核实路由器固件版本、CPU 架构、包管理器（`opkg` vs `apk`）及 `kmod-nft-tproxy` / `kmod-tun` 内核模块是否完整。
- **使用仅专属端机场的用户**：再次提醒，若服务商属于 [飞猫云](/brands/feimao/)、[无忧链接](/brands/wuyou/)（2026-10 起）、[Firefly](/brands/firefly/)（2026-10 起）、[灵猫网络](/brands/lingmao/)（2026-10 起）、[SOGO 云](/brands/sogo/)、[闪跃](/brands/shanyue/)、[全球云](/brands/quanqiu/) 或 [隐形人](/brands/yinxingren/) 等不提供通用订阅的品牌，则无法接入任何 sing-box 生态客户端。如果需要使用通用客户端与开放订阅，可参考支持双模式或通用订阅的品牌，如 [光速云](/brands/guangsuyun/)、[梯子云](/brands/tiziyun/)、[微风网络](/brands/weifeng/)、[星岛梦](/brands/xingdaomeng/)、[一翻云](/brands/yifan/)、[可信云](/brands/kexin/)。

### Hiddify、Karing 与官方端日常实操差异补充

许多用户在这几款 sing-box 系工具间切换时，容易把界面操作习惯和底层配置能力混淆。以下四点实操细节可帮你少走弯路：

1. **桌面端系统代理与 TUN 服务模式权限**：Hiddify 与 Karing 在 Windows/macOS 上同样提供「系统代理」与「TUN 全局虚拟网卡」两套接入路径。新手仅浏览网页时可先开系统代理；当需要让终端命令行、Git、游戏或桌面软件走代理再开启 TUN（Windows 下往往需以管理员身份运行或安装其配套系统服务）。开启前务必关闭电脑里并发运行的其他 VPN 或加速器，防止虚拟网卡抢路由引发全网断流。
2. **Karing 跨设备同步与规则覆写优势**：Karing 强调面向新手与跨设备用户的规则分流迁移体验，支持在同一界面下把分流规则集与多个机场订阅组合使用（例如主备机场同框切换），非常适合 iPhone 与 Windows/Mac 双端联动的玩家。
3. **官方 SFA / SFI / SFM 的日志观测与调试能力**：官方端保留了清晰的连接追踪（Connections）、延迟测速与 DNS 命中记录面板。如果遇到某个海外网站或 AI 工具打不开，可以在连接面板实时观察该域名的目标端口、匹配到了 `route.rules` 的哪一条规则，以及最终经由哪一个 `outbound` 出站，从而一分钟判断是分流规则漏域还是节点线路故障。
4. **订阅 URL 脱敏与禁止第三方在线转换**：无论使用官方端还是衍生端，当遇到格式不兼容时切忌把付费订阅链接贴入陌生网页端在线订阅转换站，避免含鉴权 Token 的地址被留存盗刷；应优先在机场官网面板核对是否自带参数切换或改用多格式直连解析的 Hiddify/Karing。

---

## 四、高危安全警示：NekoBox Google Play 第三方控制版本风险与应急处置

> [!CAUTION]
> **NekoBox for Android 重大安全警示（来自原始客户端资料原文）**：
> **NekoBox 官方项目已提示维护资源有限，且特别警告不要使用其名称下已被第三方控制的 Google Play 版本。**
>
> 在应用生态中，当一个知名开源项目因作者精力有限而减少更新或未占有官方应用商店包名时，极易出现第三方抢注同名条目甚至接管商店发布权的情况。一旦用户在 Google Play 搜索“NekoBox”并下载了被第三方控制的版本，可能面临以下直接威胁：
> 1. **订阅链接与鉴权 Token 窃取**：恶意版本可能在后台静默上报用户导入的完整订阅 URL，导致机场套餐流量被盗刷；
> 2. **流量劫持与恶意 SDK**：本地代理转发环节不再受开源代码审计约束，存在中间人注入广告或篡改网络请求的风险。

### 误装第三方控制版后的四步应急止损与回滚

1. **立即断开并卸载**：在安卓手机中立刻断开该应用的 VPN 连接，前往系统设置彻底卸载该 Google Play 同名版应用；
2. **立即重置机场订阅凭证**：登录机场服务商官网用户面板，点击 **「重置订阅链接 / 重置 UUID / 重置 Token」**，使之前可能泄露的旧链接永久失效（详见 [账号与订阅 Token 安全防护](/security/account-security/)）；
3. **核查安全与密码隔离**：确认自己没有在该软件或陌生转换站内输入过机场后台登录密码，也未在公共网络帖子或求助截图中残留过明文订阅参数；
4. **平滑迁移至可信替代客户端**：在核实作者官方开源发布渠道或正规商店渠道后，改用 **Hiddify**、**Karing**、**v2rayNG**（见 [v2rayN & v2rayNG 指南](/clients/v2rayn/)）或 **FlClash**（见 [Clash Meta 生态指南](/clients/clash-meta/)）重新导入重置后的新订阅链接。

### 如何核查开源代理软件下载来源是否可靠

由于本站遵循零虚构原则，对于仅在原始客户端资料中标注了发行渠道为「GitHub」「官方文档」或「App Store」而未给出经人工独立验证的 URL 的客户端，一律标注为 **「项目地址待核实，请以作者发布页为准」**。你在自行检索安装渠道时，可以通过以下四个低风险指标交叉验证：
1. **核对项目提交历史连续性**：真正的开源代理客户端通常拥有长期连续的 Release 发布版本与透明的提交记录，警惕刚创建数天且只提供网盘外链下载的同名假冒页面；
2. **核对发布附件签名与 SHA256 哈希**：Android 安装包（`.apk`）应保持前后版本的开发者签名指纹一致；桌面端压缩包与安装包建议对比作者附带的校验摘要，防范下载中转站静默篡改；
3. **远离第三方网盘整合包与「中文官网」竞价广告**：搜索引擎前排购买广告位的「XX 客户端中文官网」往往绑定诱导下载器或夹带私货；
4. **绝不以关闭系统杀软作为安装前提**：任何声称「必须彻底关闭 Windows Defender 或手机系统安全检验才能运行」的安装包都存在高危异常风险。

---

## 五、sing-box 生态常见排障方向与安全操作

不同用户在使用官方端（SFA/SFI/SFM）、跨平台衍生端（Hiddify/Karing）或路由器端（HomeProxy/PassWall2）时，最常遇到以下五类跨生态共性故障：

| 故障表现 | 典型发生端 | 首选排查根因 | 对应排障与回滚入口 |
| :--- | :--- | :--- | :--- |
| **导入订阅报 JSON 解析失败或空白** | 官方 SFA / SFI / SFM | 把 Clash YAML 或普通 Base64 塞进原生 JSON 客户端；或机场 UA 未识别 sing-box | 检查机场后台是否提供 sing-box 专用链接；或改用兼容多格式的 Hiddify / Karing；参考 [HTTP 200 返回空白排查](/troubleshooting/articles/sub-http-200-empty) |
| **新版升级后旧配置启动报错字段移除** | SFA / SFI / SFM / HomeProxy | 使用了过时的旧版 `geoip`/`geosite` 内嵌字段或旧 DNS 写法，与新版 sing-box 内核不兼容 | 从机场重拉最新模板，或使用 Hiddify/Karing 自动生成匹配当前内核版本的配置 |
| **OpenWrt HomeProxy 启动失败或无法转发** | OpenWrt 软路由 | 缺少 `kmod-nft-tproxy`/`kmod-tun` 模块、`fw3`/`fw4` 冲突或路由 Flash 空间不足 | 部署前核对固件内核模块与空间余量；修改前备份路由器配置，详见 [全平台与 OpenWrt 安装指南](/guides/installation/) |
| **Hiddify / Karing 开启 TUN 后部分软件或局域网不通** | 桌面端与移动端 | 未授予桌面管理员/服务权限；并发开启其他 VPN；或 `fakeip` 与本地开发域名冲突 | 关闭并发 VPN 网卡；检查 `ip_is_private` 直连规则；断网时关闭 TUN 并恢复 DHCP DNS |
| **所有节点同时超时，本地直连网页正常** | 全平台所有客户端 | 设备系统时间误差超过 60–90 秒导致 TLS 握手全线失效；或旧订阅链接 Token 过期 | 立即开启操作系统自动日期与时间同步；参考 [系统时间与 TLS 报错排查](/troubleshooting/articles/time-sync-tls-cert-error) |

---

## 六、常见问题

### sing-box 官方提供的 SFA、SFI、SFM 分别对应什么设备？

根据站内客户端资料，SFA（sing-box for Android）对应安卓手机与平板，SFI（sing-box）对应 iPhone/iPad 的 iOS 端，SFM（sing-box for macOS）对应苹果电脑端，此外桌面端也包含 sing-box for Desktop 方向。官方客户端下载来源标注为「官方文档（项目地址待核实）」。

### 为什么新手用 sing-box 生态时，通常优先推荐 Hiddify 或 Karing 而不是官方端？

官方 SFA/SFI/SFM 严格要求标准 sing-box JSON 配置文件，直接粘贴 Clash YAML 或普通 Base64 节点链接会报错；而 Hiddify 与 Karing 在底层基于 sing-box 生态的同时，内置了对多种机场订阅格式（Base64、Clash、sing-box）的自动识别与新手向图形界面，上手门槛低得多。

### NekoBox for Android 还能在 Google Play 上直接搜索安装吗？

绝对不建议。根据原始客户端安全资料明确警示，NekoBox 官方项目已提示维护资源有限，且特别警告用户不要使用其名称下已被第三方控制的 Google Play 版本，以免遭遇订阅凭证窃取、恶意广告植入或流量劫持风险。

### sing-box 的 JSON 配置文件和 Mihomo 的 YAML 配置有哪些核心结构区别？

Mihomo 使用 YAML 缩进声明 proxies、proxy-groups 与 rules；sing-box 则采用严格的 JSON 结构，通过 log、dns、inbounds（如 tun/mixed）、outbounds（如 selector/urltest 与各协议出站）、route（含 rule_set .srs 规则集与 final）及 experimental 模块解耦控制。两者语法不互通，不能混用。

### 已经不小心在 Google Play 下载过同名 NekoBox 客户端，应该如何应急止损？

应立即停止连接并卸载该第三方控制的商店应用，随后立即登录你的机场用户后台点击「重置订阅链接 / 重置 UUID」，销毁可能已经泄露的旧订阅 Token，最后改用可核实渠道的 Hiddify、Karing、v2rayNG 或 FlClash 重新导入新订阅。

### OpenWrt 软路由上选择 HomeProxy 和 PassWall2 使用 sing-box 核心有什么不同？

HomeProxy 是专为现代 OpenWrt（尤其是原生 fw4/nftables 防火墙环境）打造的基于 sing-box 的路由代理管理插件；PassWall2 则是多核心路由器管理插件，支持在 Xray 与 sing-box 等核心之间配合节点策略分流。安装前均需核对路由器固件版本、CPU 架构与内核模块。

### 为什么同一条机场订阅导入 sing-box 官方端和 Karing 表现不一致甚至导入失败？

大多数机场会根据客户端发出的 HTTP User-Agent 识别返回模板。若后端未对官方端 UA 做适配而仍下发 Clash YAML，官方 SFA/SFI/SFM 会直接因 JSON 解析失败而报错；而 Karing 或 Hiddify 具备多格式兜底转换能力，且各版 sing-box 内核对新版路由字段兼容性也存在差异。

---

## 七、相关排障与指南入口

- **订阅与格式基础**：[Base64 / Clash YAML / sing-box 订阅差异指南](/guides/subscriptions/) ｜ [跨客户端表现不一致排查](/troubleshooting/articles/cross-client-inconsistency)
- **安全防护与止损**：[订阅 Token 泄露与重置指南](/security/account-security/) ｜ [开源客户端与隐私边界](/security/privacy/)
- **同生态与对照阅读**：[v2rayN & v2rayNG 多核心指南](/clients/v2rayn/) ｜ [Mihomo 内核生态解析](/clients/mihomo/) ｜ [全平台安装与 OpenWrt 前置检查](/guides/installation/)
