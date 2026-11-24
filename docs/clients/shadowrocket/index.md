---
title: Shadowrocket（小火箭）使用指南：Apple 生态适配、App Store 切区安全、订阅导入与规则排障
description: 深度解析 Shadowrocket（小火箭）在 iOS、iPadOS 与 Apple Silicon Mac 上的适用边界、App Store 付费属性与切区禁登录 iCloud 安全铁律、订阅导入格式兼容、规则覆写排障与同生态替代方案。
pillar: clients
primaryKeyword: Shadowrocket 小火箭
intent: informational
publishedAt: 2026-11-23
updatedAt: 2026-11-23
schemaType: SoftwareApplication
software:
  name: Shadowrocket
  operatingSystem: iOS, iPadOS, macOS (Apple Silicon)
  applicationCategory: NetworkingApplication
breadcrumbs:
  - text: 首页
    link: /
  - text: 客户端软件
    link: /clients/
  - text: Shadowrocket（小火箭）
    link: /clients/shadowrocket/
faq:
  - q: Shadowrocket（小火箭）是免费的吗？支持 Windows、Android 或 Intel Mac 吗？
    a: Shadowrocket 并非免费应用，它在美国区 App Store 显示为一次性付费购买应用，且实际售价与上架状态以用户所持 App Store 地区为准（中国大陆区通常不可见）。设备适配方面，仅支持 iOS、iPadOS 以及 Apple Silicon（M 系列芯片）Mac 通过 App Store 兼容运行，从未推出 Windows、Android、Linux 或 Intel Mac 版本。
  - q: 为了下载 Shadowrocket，可以在网上购买或登录别人分享的“免费美区 Apple ID”吗？
    a: 绝对不可以登录陌生人的共享 Apple ID 到系统设置里的 iCloud。一旦在设备主账户设置中登录他人共享账号，对方可在后台开启“查找我的 iPhone”远程锁定整台手机并实施勒索，同时 iCloud 照片、备忘录与通讯录也有同步泄露风险。合规安全的做法是使用本人注册管理的海外地区 Apple ID，且仅在 App Store 内部切换下载。
  - q: 买了机场套餐后，为什么导入 Shadowrocket 时提示失败、格式不支持或列表为空？
    a: 常见原因有四类：误复制了仅供网页登录的官网或推广网址而非专用订阅 URL；订阅处于失效或过期状态（返回 HTTP 401/403/404）；直接导入了纯 Clash YAML 文件而未取用 Shadowrocket/通用 Base64 订阅；或者该机场属于仅限自研专属端、不提供第三方订阅的品牌。
  - q: 全局路由已经选了“配置（Config）”，为什么国内网站还是走代理或分流规则不生效？
    a: 常见原因有两点：一是底部“配置”页当前激活的依然是不含完整国内分流段的空白或 0 字节损坏 .conf 文件；二是在编辑纯文本规则时顺序错乱，例如把 FINAL/MATCH 兜底规则放在了前排，截断了后面的 GEOIP,CN,DIRECT 或国内域名规则。
  - q: 为什么使用 Shadowrocket 连接节点后，网页和流媒体正常，但 ChatGPT 或 Claude 仍报错无法访问？
    a: 这通常不是 Shadowrocket 软件本身故障，而是所选节点的出口 IP 地区受限（例如选中了被 OpenAI/Anthropic 限制的香港节点），或目标域名未纳入分流规则仍走直连，以及浏览器残留旧风控 Cookie。建议查看 Shadowrocket 连接日志确认该域名命中的策略组与真实出口地区。
  - q: 在 Apple Silicon（M1/M2/M3/M4）Mac 上运行 Shadowrocket 和用 Clash Verge Rev 有什么区别？
    a: Apple Silicon Mac 可以通过 App Store 运行 iPadOS 兼容版 Shadowrocket，适合习惯小火箭订阅操作的用户；但在桌面端长期使用（如需要命令行终端代理、Service Mode TUN 虚拟网卡、多策略组精细调试及原生桌面 UI），原生桌面架构的 Clash Verge Rev 或 Surge Mac 通常更顺手。
  - q: 苹果端除了 Shadowrocket，还有哪些正规同生态替代客户端？
    a: 根据站内客户端资料库，iOS/iPadOS 上付费/内购替代包括 Stash（Clash YAML 风格）、Quantumult X（圈 X，擅长请求重写与脚本）与 Surge 5（专业调试）；多协议跨平台替代则包括 Hiddify、Karing、Clash Mi、官方 sing-box（SFI）及 Streisand。至于 Potatso 与 OneClick 对 VLESS/Hysteria 2 等现代协议支持有限，选用前需核实。
---

# Shadowrocket（小火箭）：Apple 生态适配、账号安全边界与规则排障指南

> **核心结论（Answer-First）**：**Shadowrocket（俗称“小火箭”）** 是 iOS 与 iPadOS 平台上最具代表性的第三方通用规则代理客户端，同时也可在 Apple Silicon（M 系列芯片）Mac 上通过 App Store 兼容运行。它**属于付费应用**（在美国区 App Store 显示为付费下载），且**上架状态与实际售价因 App Store 地区而异**（具体商店直链标为 **项目/商店地址待核实，请以所属区服 App Store 实时页面为准**）。使用前务必坚守 **「禁在系统设置登录共享 Apple ID / 禁登录他人 iCloud」** 的安全红线，并确认服务商提供标准通用订阅或 Shadowrocket 专用订阅链接。

---

## 一、平台适用边界：哪些设备能用，哪些设备绝对不能用

搜索引擎中经常出现「小火箭 Windows 电脑版下载」「Shadowrocket 安卓 APK」等虚假广告页面。在开始安装前，必须明确官方与正版生态的真实硬件支持范围：

- **支持运行的设备**：
  1. **iPhone（iOS）**：主力适用平台，通过苹果官方 `NetworkExtension` 沙盒接口创建系统 VPN 隧道，支持规则分流、本地 DNS 映射与详细请求日志。
  2. **iPad（iPadOS）**：原生大屏适配，交互与规则同步方式和 iPhone 一致。
  3. **Apple Silicon Mac（M1 / M2 / M3 / M4 等自研芯片）**：得益于 ARM 架构统一，搭载 Apple Silicon 的 Mac 可以直接在 Mac App Store 的「iPhone 与 iPad App」栏目中安装运行小火箭（部分桌面快捷键、剪贴板权限及本地网络权限需在首次弹出时手动授予）。但在长期桌面办公场景下，若需要终端命令行深度适配、本地规则合并与桌面托盘管理，原生桌面端 [Clash Verge Rev](/clients/clash-verge/) 或 Surge Mac 往往体验更完整。
- **明确不支持的设备**：
  - **Windows PC、Android 手机、Linux 主机、OpenWrt 路由器以及老款 Intel 芯片 Mac** 均 **从未推出任何官方 Shadowrocket 客户端**。任何在网页上兜售所谓「小火箭 Windows/安卓破解版」的文件均属于仿冒木马或强行套壳，切勿下载安装。上述设备请分别前往 [Clash Verge Rev](/clients/clash-verge/)、[v2rayN & v2rayNG](/clients/v2rayn/)、[Clash Meta / CMFA](/clients/clash-meta/) 或 [sing-box 生态](/clients/sing-box/) 选择正规原生替代方案。

---

## 二、App Store 付费属性、地区差异与切区账号安全铁律

根据站内 `data/clients.json` 与《2026 机场代理客户端大全》iPhone / iPad 板块的明确核查记录，苹果端代理软件生态存在显著的商业与区域规则边界：

### 1. 付费性质与区服上架差异

- **非免费软件**：Shadowrocket、Stash 与 Quantumult X（圈 X）在美国区 App Store 均明确显示为 **付费应用**，Surge 5 则包含应用内购买。**实际售价与上架状态以用户所属 App Store 地区为准。**
- **中国大陆区不可见**：受限于不同国家与地区的应用商店合规政策，中国大陆区 App Store 通常无法搜索到 Shadowrocket 及绝大多数境外规则代理软件。
- **商店直链与正版核验**：由于原始资料仅标注渠道类型为 App Store 而未附带经核验的直链 ID，本站统一标注为 **「具体商店地址待核实」**。购入时请在已切换好合规海外地区的 App Store 内自行核对开发者名称、版本历史与评价记录，警惕名称拼写仅差一个字母的「山寨高仿付费工具」。同时切勿下载来路不明的所谓「企业证书签名免费版 IPA」，这类包随时面临掉签失效甚至植入恶意插件的风险。

### 2. 切区下载安全警示：严禁登录系统 iCloud

> [!CAUTION]
> **最高优先级账号安全红线 —— 切勿使用陌生共享 Apple ID，更绝不可登录系统设置中的 iCloud**：
> 部分低质教程或商家售后为了省事，会给用户发一组所谓「已购小火箭的免费共享美区 Apple ID」。如果用户按提示在手机 **「设置 → Apple ID（顶部头像 / iCloud）」** 处登录该共享账号，只要账号原主人在后台开启「查找我的 iPhone（Find My）」并触发「丢失模式 / 抹掉设备」，你的整部 iPhone 将瞬间被远程锁定变砖；同时手机内的相册、通讯录、备忘录与钥匙串密码也会面临同步泄露的风险。
> **正确且合规的做法**：
> 1. 自行注册并长期独立持有海外区服（如美区）Apple ID，开启双重认证并绑定自己可控的邮箱与安全方式；
> 2. 下载或更新应用时，**仅打开蓝色图标的「App Store」应用**，点击右上角头像拉到底部「退出登录」，再登录自己的海外区 App Store 账号；**系统「设置」最顶部的个人 iCloud 主账号全程保持本人日常账号不变**；
> 3. 下载完成后即可退出海外区商店账号切回原区（但注意跨区下载的应用在后续版本更新时，可能需要重新验证下载时所用的对应地区 App Store 账号）。

### 3. iCloud 同步开关与 Mac 端权限细节

如果用户在多台自己名下的苹果设备（例如同时使用 iPhone、iPad 与 Apple Silicon Mac）之间开启了 Shadowrocket 的 iCloud 同步选项，要注意只有当所有设备登录的是**同一本人主 iCloud 账户**时才可开启。在 Apple Silicon Mac 上初次安装使用小火箭时，若系统弹出「是否允许访问本地网络」或「是否允许读取剪贴板」提示，必须点击允许，否则局域网测试或剪贴板导入订阅链接会直接失效。

---

## 三、苹果 iOS / iPadOS 同生态 11 款客户端横向对比

如果暂未持有对应海外区付费方式，或你的机场订阅格式偏向 Clash YAML / 原生 sing-box JSON，可以参考站内整理的 11 款 iOS 端收录软件进行对照选型：

| 客户端名称 | 核心引擎 / 格式生态 | 收费与渠道（待核实） | 适用人群与显著限制 |
| :--- | :--- | :--- | :--- |
| **Shadowrocket（小火箭）** | 自研多协议引擎（Base64 / SIP008 / `.conf`） | App Store（美区付费） | 通用首选，支持节点管理、规则分流与请求日志；不支持直接导入纯 Clash YAML 当订阅列表 |
| **Stash** | Clash 兼容内核（Clash YAML） | App Store（美区付费） | 适合桌面端用 Clash Verge Rev、希望在 iPhone 无缝沿用同一套 YAML 规则与覆写（Override）的用户 |
| **Quantumult X（圈 X）** | Quantumult X 引擎 | App Store（美区付费） | 擅长精细分流、HTTP 请求重写（Rewrite）、JS 脚本与 DNS 自定义；订阅常需专用格式或转换 |
| **Surge 5 / Surge Mac** | Surge 商业引擎 | App Store（含内购）/ 官网 | 面向专业网络工程师与开发者的深度抓包与流量分析调试工具 |
| **Hiddify** | sing-box | GitHub / App Store | 多协议支持且自动兼容多种订阅格式，上手门槛低 |
| **Karing** | sing-box | App Store | 跨桌面与移动端多格式兼容、规则分流迁移方便（受区服影响） |
| **Clash Mi** | Mihomo | App Store | 支持 Clash 风格配置，跨五大平台界面统一 |
| **sing-box (SFI)** | sing-box | 官方文档 / App Store | 官方原生 iOS 端，严格适配原生 sing-box JSON 配置 |
| **Streisand** | Xray / sing-box 兼容 | App Store | 支持 VLESS、VMess、Trojan、Hysteria 等现代协议 |
| **OneClick** | 基础代理引擎 | App Store | **协议局限**：资料仅标注支持 VMess、Shadowsocks、Trojan；用 VLESS/Hysteria 2 前需核实 |
| **Potatso** | 基础代理引擎 | App Store | **协议局限**：仅覆盖 Shadowsocks、SSR、SOCKS、HTTP(S) 等传统协议，不支持 VLESS 与 Hysteria 2 |

---

## 四、订阅导入、测速指标解析与三种全局路由模式

在正式导入前，先核查服务商支持边界：只有支持第三方通用订阅的机场（如双模式品牌 [光速云](/brands/guangsuyun/)、[梯子云](/brands/tiziyun/)，或纯通用订阅品牌 [微风网络](/brands/weifeng/)、[星岛梦](/brands/xingdaomeng/)、[一翻云](/brands/yifan/)、[可信云](/brands/kexin/)）才能导入小火箭。如果使用的是 [飞猫云](/brands/feimao/)、[无忧链接](/brands/wuyou/)（2026-10 起）、[Firefly](/brands/firefly/)（2026-10 起）、[灵猫网络](/brands/lingmao/)（2026-10 起）、[SOGO 云](/brands/sogo/)、[闪跃](/brands/shanyue/)、[全球云](/brands/quanqiu/) 或 [隐形人](/brands/yinxingren/) 等不提供订阅链接的品牌，小火箭无法接入。

### 1. 标准导入与连接步骤

1. **获取通用/小火箭订阅地址**：在机场后台复制「通用订阅（Base64）」或「Shadowrocket 专用订阅」。注意观察 URL 末尾是否误带 `&flag=clash` 等强制要求返回 YAML 的参数；若有，应更换不带该参数的通用地址。
2. **手动新增订阅（比网页一键唤起更稳妥）**：打开 Shadowrocket，点击右上角 `+` 号，将「类型（Type）」改为 `Subscribe`，把复制好的链接完整粘贴进 `URL` 框（检查首尾无多余空格或换行），在 `备注` 填写清晰的服务商名称并保存。若面板提供的「一键导入」按钮在第三方 App 内嵌浏览器点击无反应，请改用系统 Safari 打开或直接执行手动粘贴。
3. **开启打开时更新与合理拉取周期**：进入底部 **「设置（Settings）→ 订阅（Subscribe）」**，建议打开 **「打开时更新」**；注意，当旧节点全失效而直连可以访问订阅域名时，切勿勾选「通过代理更新」，否则会陷入无可用节点导致无法拉取新订阅的死锁。
4. **授予系统 VPN 权限**：回到首页点击最上方连接开关，系统弹出「Shadowrocket 想添加 VPN 配置」时点击「允许」并验证面容 ID / 锁屏密码。首次连接若手机弹出「无线数据」或「本地网络」权限请求，同样需允许。

### 2. 首页「连通性测试」方法与「全局路由」三种模式辨析

很多用户反馈节点旁边测速显示绿字延迟却打不开网页，或者所有国内流量也走了代理。这通常与测速类型选择及首页「全局路由」设定有关：

- **TCP Ping vs URL 测试（真实可用性检测）**：在「设置 → 延迟测试方法」中，默认的 `TCP` 测速仅探测到达节点入口服务器的握手响应时间，哪怕节点后端转发故障或套餐流量已用尽，TCP 端口依然可能返回绿色毫秒数；改为基于 `CONNECT` 或 `URL` 的 HTTP 连通性测试（如返回标准响应时间），更能反映节点真实的出站可用性。
- **全局路由：配置（Config）—— 日常推荐**：严格依照底部「配置」标签页中当前勾选的 `.conf` 规则文件执行分流。国内域名与国内 IP 段直连（`DIRECT`），境外域名与规则命中项走代理策略组（`PROXY`）。
- **全局路由：代理（Proxy）—— 排障验证专用**：强制设备几乎全部流量绕过本地规则直接走当前选中的单节点或节点组。当你想验证「究竟是节点本身不通，还是分流规则写漏了某个域名」时，临时切换为 `Proxy` 测试最直观。
- **全局路由：直连（Direct）—— 临时旁路**：保持 VPN 隧道挂载但所有流量直接本地出站，常用于临时排查国内银行或本地设备访问异常。
- **场景（Scene）功能注意项**：Shadowrocket 支持在首页设置「场景」，实现连入某个特定 Wi-Fi 时自动切为直连、切回 4G/5G 时自动切回配置分流。排障时若发现回家连上 Wi-Fi 突然全直连或规则不生效，请顺手检查「场景」里是否曾配置过自动切换策略。

---

## 五、`.conf` 分流规则结构、规则覆写安全与常见异常排障

拿到节点并且「连通性测试」显示有绿字毫秒数，却依然遇到「更新订阅失败」「国内流量也走代理消耗套餐」或「规则覆写后直接断网」时，需要读懂 Shadowrocket 本地 `.conf` 配置的基本逻辑与常见异常点。

### 1. `.conf` 配置文件的核心分段与规则顺序原则

一个标准的小火箭 `.conf` 规则文件通常包含以下几个关键段落，理解它们有助于排查 90% 的分流失效问题：

- **`[General]` 全局基础段**：控制 `bypass-tun`（跳过接管的局域网保留网段如 `192.168.0.0/16`、`10.0.0.0/8`）、`dns-server`（本地 DNS 解析服务器）与 `ipv6` 开关。如果某些本地路由器管理后台或内网 NAS 打不开，优先排查 `bypass-tun` 是否缺失对应网段。
- **`[Rule]` 分流规则段（严格遵循自上而下优先匹配）**：流量按行从上往下逐一比对，一旦命中第一条匹配项就立刻执行动作并停止向下查找。因此：
  1. 精准规则（`DOMAIN`、`DOMAIN-SUFFIX`、`DOMAIN-KEYWORD`、`RULE-SET`）必须排在最前面；
  2. 国内 IP 兜底直连规则 `GEOIP,CN,DIRECT` 必须位于末尾兜底规则之前；
  3. 全局兜底规则 `FINAL,PROXY`（或 `FINAL,DIRECT`）**永远只能放在最后一行**。若误把 `FINAL` 移到了文件开头或中途，后面所有 `GEOIP,CN,DIRECT` 都将被直接截断而彻底失效。
- **`[Host]` 与 `[URL Rewrite]`**：分别用于本地域名强制解析映射与轻量级的地址重定向（例如将某些 HTTP 跳转请求规则化）。

### 2. 「策略组」与「流量日志」协同排障实战方法

当部分 App 或网页打不开、但测速又正常时，Shadowrocket 内置的日志与诊断工具可以帮你在 1 分钟内分清问题属于规则误杀还是节点出口异常：

1. **打开请求连接日志定位命中规则**：点击底部 **「数据（Data）」→「代理（Proxy）」连接记录**（或先在设置里开启日志记录），随后在 Safari 或目标 App 内复现一次失败访问。回到日志页面查看对应域名的处理结果：
   - 如果显示走 <code>DIRECT</code>，说明该境外域名被漏分流或被前面的直连规则截断；
   - 如果显示走 <code>REJECT</code>，说明命中了广告拦截或黑名单规则，需要将该域名加入白名单直连或代理规则前排；
   - 如果显示已经正常走出了目标 <code>PROXY</code> 节点却依然超时或报错区域受限，则说明节点本身出口地区或线路出现故障。
2. **利用「场景（Scene）」自动切换规则策略**：在需要兼顾公司内网 Wi-Fi 与外部 5G 移动网络的环境下，可以配置对应 Wi-Fi 名称的「场景」动作，例如连入内网 Wi-Fi 时自动切为 <code>直连</code> 或指定旁路由分流配置，离开 Wi-Fi 后恢复常规 <code>配置</code> 模式。排障时如果发现软件开关自己跳变，优先排查是否设置过自动场景。
3. **订阅 URL 脱敏与多机场备份管理**：Shadowrocket 首页支持同时添加多个 <code>Subscribe</code> 分组并随时折叠切换。建议保留主力与备用两家支持通用订阅的机场，并在向客服提交工单或社区求助时，务必把订阅 URL 中的鉴权 Token 替换为脱敏占位符，切勿使用陌生在线订阅转换网站。

### 3. 高频故障根因与低风险排查表

| 异常表现 | 常见技术根因 | 低风险核查与修复路径 |
| :--- | :--- | :--- |
| **点击更新订阅报错超时、格式错误或节点为 0** | ① 开着失效节点更新订阅导致死锁；② 误复制了推广链接或被返回的 Clash YAML 文本卡住；③ 套餐已过期/Token 已重置（返回 HTTP 401/403）或本地 Wi-Fi 拦截了订阅域名 | 先关闭首页代理开关，切换 5G 蜂窝网络与 Wi-Fi 对比测试；确认后台提取的是通用 Base64/小火箭订阅而非纯 Clash YAML |
| **选了「配置」模式但国内网站依然全部走代理** | ① 当前激活的 `.conf` 配置文件是空的或下载半途损坏的 0 字节文件；② 自定义规则把 `FINAL,PROXY` 放到了 `GEOIP,CN,DIRECT` 之前造成规则截断；③ 启用了首页「场景（Scene）」规则自动切成了代理 | 进入底部「配置」标签页，点击当前选中配置右侧 `i` 图标选择恢复默认或改回内置 `default.conf` 测试；检查规则顺序确保 `FINAL` 永远位于最后一行 |
| **更新远程 `.conf` 规则后部分站点打不开** | 远程托管配置中嵌套了外部 `RULE-SET` 列表域名，而在无代理状态下无法拉取规则集，导致子规则缺失；或配置内 `dns-server` 不可达 | 先连接一个可用节点后再点击更新配置；或打开「数据 → 代理日志」观察具体域名命中了哪条规则或报了什么 DNS 错误 |
| **网页正常但 ChatGPT / Claude / 流媒体报错** | 并非软件故障，而是所选节点 IP 地区受限（例如香港节点被 OpenAI/Anthropic 限制）、规则组未指向美/日/新节点，或浏览器残留风控缓存 | 在 Shadowrocket 日志里确认目标域名最终走出的节点名称与地区，单独调整规则分流并配合无痕窗口测试 |
| **所有节点同时超时，直连网站正常** | iOS 系统时间因手动调整导致偏差超过 60–90 秒（TLS 握手证书校验直接失败），或订阅域名/节点端口被本地网络阻断 | 打开手机「设置 → 通用 → 日期与时间」，确认已开启 **「自动设置」**；并在蜂窝网络下测试节点连通性 |

### 4. 规则覆写（Override）、`Script` 与 `MITM` 的高风险边界与回滚

> [!WARNING]
> **切勿盲目导入陌生远程 `.conf` 中的 `Script` 与 `MITM` 段落**：
> 在网络社区分享的部分「去广告增强配置」中，经常附带加密的远程 `Script`（HTTP 请求/响应重写脚本）以及要求用户安装并信任自定义根证书的 `MITM`（中间人 HTTPS 解密）配置。一旦安装并信任来路不明的 MITM 证书且运行未审计的脚本，你的网页登录 Cookie、表单请求乃至会话令牌都可能暴露给脚本作者。
> **日常安全原则与配置改坏回滚**：
> 1. 仅使用基础规则分流时，无需开启 `MITM` 与未知来源脚本；
> 2. 在修改任何本地 `.conf` 纯文本或尝试新远程配置前，先在 **「配置 → 本地文件」** 中左滑复制备份当前可用配置文件；
> 3. 一旦导入新配置后出现全面断网、证书报错或规则失效，只需进入「配置」页点选内置 **`default.conf`**（或恢复此前备份的 `.conf` 副本），然后回到首页关闭并重开一次主开关重建网络扩展即可秒级回滚；如果此前误安装并信任了不明来源的自签描述文件根证书，务必立刻前往 iOS **「设置 → 通用 → VPN 与设备管理」** 与 **「设置 → 通用 → 关于本机 → 证书信任设置」** 中撤销信任并移除该证书。

### 5. 机场面板格式适配与 Apple 生态日常维护要点

许多用户购买套餐后发现不同客户端下的节点总数或协议表现并不一致，在苹果设备上可以从以下三个层面快速判断：
1. **区分「通用 Base64 订阅」与「Clash YAML 订阅」**：Shadowrocket 原生识别节点列表与托管 `.conf`，如果机场仅下发了面向 Clash 的纯 YAML 规则模板，直接作为普通订阅导入时常显示为 0 节点。此时应回机场用户中心寻找「Shadowrocket 专用订阅」或「通用 Base64 订阅」，或选用原生适配 Clash 规则格式的 **Stash** 与兼容多格式的 **Karing** / **Hiddify**。
2. **跨设备更新与地区账号留存提示**：无论你是在 iPhone、iPad 还是 Apple Silicon Mac 上运行 Shadowrocket，每次 App Store 版本更新都会核对当初购买下载时的 Apple ID。如果切换回大陆区商店后直接点更新弹窗却记不清当时用的是哪个账号，只需在 App Store 退出当前账号并切回本人独立注册的那一个海外区账户即可完成更新，全程不要触碰系统设置顶部的主 iCloud 账号。
3. **AI 工具与流媒体防风控习惯**：由于 iOS 端 App（如 ChatGPT 官方客户端、Claude、YouTube）对设备网络环境与节点地区极其敏感，建议为 AI 域名单独建立稳定的美国、日本或新加坡节点分组，并避免频繁跨洲自动切换节点导致账号触发风控验证。

更多订阅拉取 HTTP 状态码与命令行辅助检测细节，请参阅专项排查文章：[Shadowrocket 小火箭无法导入订阅与分流规则不生效](/troubleshooting/articles/shadowrocket-import-rules) 与 [订阅 HTTP 200 返回空白内容排查](/troubleshooting/articles/sub-http-200-empty)。

---

## 六、常见问题

### Shadowrocket（小火箭）是免费的吗？支持 Windows、Android 或 Intel Mac 吗？

Shadowrocket 并非免费应用，它在美国区 App Store 显示为一次性付费购买应用，且实际售价与上架状态以用户所持 App Store 地区为准（中国大陆区通常不可见）。设备适配方面，仅支持 iOS、iPadOS 以及 Apple Silicon（M 系列芯片）Mac 通过 App Store 兼容运行，从未推出 Windows、Android、Linux 或 Intel Mac 版本。

### 为了下载 Shadowrocket，可以在网上购买或登录别人分享的“免费美区 Apple ID”吗？

绝对不可以登录陌生人的共享 Apple ID 到系统设置里的 iCloud。一旦在设备主账户设置中登录他人共享账号，对方可在后台开启“查找我的 iPhone”远程锁定整台手机并实施勒索，同时 iCloud 照片、备忘录与通讯录也有同步泄露风险。合规安全的做法是使用本人注册管理的海外地区 Apple ID，且仅在 App Store 内部切换下载。

### 买了机场套餐后，为什么导入 Shadowrocket 时提示失败、格式不支持或列表为空？

常见原因有四类：误复制了仅供网页登录的官网或推广网址而非专用订阅 URL；订阅处于失效或过期状态（返回 HTTP 401/403/404）；直接导入了纯 Clash YAML 文件而未取用 Shadowrocket/通用 Base64 订阅；或者该机场属于仅限自研专属端、不提供第三方订阅的品牌。

### 全局路由已经选了“配置（Config）”，为什么国内网站还是走代理或分流规则不生效？

常见原因有两点：一是底部“配置”页当前激活的依然是不含完整国内分流段的空白或 0 字节损坏 .conf 文件；二是在编辑纯文本规则时顺序错乱，例如把 FINAL/MATCH 兜底规则放在了前排，截断了后面的 GEOIP,CN,DIRECT 或国内域名规则。

### 为什么使用 Shadowrocket 连接节点后，网页和流媒体正常，但 ChatGPT 或 Claude 仍报错无法访问？

这通常不是 Shadowrocket 软件本身故障，而是所选节点的出口 IP 地区受限（例如选中了被 OpenAI/Anthropic 限制的香港节点），或目标域名未纳入分流规则仍走直连，以及浏览器残留旧风控 Cookie。建议查看 Shadowrocket 连接日志确认该域名命中的策略组与真实出口地区。

### 在 Apple Silicon（M1/M2/M3/M4）Mac 上运行 Shadowrocket 和用 Clash Verge Rev 有什么区别？

Apple Silicon Mac 可以通过 App Store 运行 iPadOS 兼容版 Shadowrocket，适合习惯小火箭订阅操作的用户；但在桌面端长期使用（如需要命令行终端代理、Service Mode TUN 虚拟网卡、多策略组精细调试及原生桌面 UI），原生桌面架构的 Clash Verge Rev 或 Surge Mac 通常更顺手。

### 苹果端除了 Shadowrocket，还有哪些正规同生态替代客户端？

根据站内客户端资料库，iOS/iPadOS 上付费/内购替代包括 Stash（Clash YAML 风格）、Quantumult X（圈 X，擅长请求重写与脚本）与 Surge 5（专业调试）；多协议跨平台替代则包括 Hiddify、Karing、Clash Mi、官方 sing-box（SFI）及 Streisand。至于 Potatso 与 OneClick 对 VLESS/Hysteria 2 等现代协议支持有限，选用前需核实。

---

## 七、相关排障与指南入口

- **订阅与导入排查**：[Shadowrocket 订阅与规则排查](/troubleshooting/articles/shadowrocket-import-rules) ｜ [401/403/404 订阅失败处理](/troubleshooting/articles/sub-http-401-403-404-503) ｜ [机场订阅导入指南](/guides/subscriptions/)
- **跨端与安全防护**：[账号与订阅 Token 安全防护](/security/account-security/) ｜ [跨客户端表现不一致排查](/troubleshooting/articles/cross-client-inconsistency)
- **分流与 AI 适配**：[分流规则 GeoIP/GeoSite 教程](/guides/split-routing/) ｜ [AI 与流媒体解锁核验](/ai-media/)
