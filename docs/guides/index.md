---
title: 代理客户端使用教程中心：全平台安装、订阅配置、分流与 TUN 实操指南
description: 按 Windows、macOS、iOS、Android、Linux、OpenWrt 六大平台与核心操作目标分路的代理客户端使用教程总目录，涵盖五步端到端配置路线、订阅导入、规则分流、TUN 虚拟网卡、DNS 防泄漏与安全回滚方案。
pillar: guides
primaryKeyword: 代理客户端使用教程
intent: informational
schemaType: TechArticle
collectionPage: true
publishedAt: '2026-11-23'
updatedAt: '2026-11-23'
breadcrumbs:
  - text: 首页
    link: /
  - text: 使用教程
    link: /guides/
itemList:
  - name: 客户端安装与系统架构核验教程
    url: /guides/installation/
  - name: 机场订阅链接导入与格式辨析教程
    url: /guides/subscriptions/
  - name: Clash 基础配置与策略组实操指南
    url: /guides/clash-setup/
  - name: 分流规则配置与 AI 防误杀指南
    url: /guides/split-routing/
  - name: TUN 虚拟网卡模式接管与权限回滚教程
    url: /guides/tun-mode/
  - name: DNS 防泄漏与 Fake-IP 配置回滚教程
    url: /guides/dns-setup/
faq:
  - q: 第一次接触第三方代理客户端，应该按什么顺序完成配置？
    a: 建议遵循五步标准顺序：第一步先做系统时间同步并确认所购机场是否提供通用订阅链接；第二步核对设备 CPU 架构下载匹配的客户端；第三步将订阅链接导入客户端并拉取节点列表；第四步在规则（Rule）模式下开启系统代理；第五步通过真连接延迟、国内外 IP 分流和 DNS 出口三项检查确认生效。已能正常上网时无需盲目折腾高级 TUN 或自定义 DNS 参数。
  - q: 购买了只有专属客户端的机场，还能套用这里的 Clash 或 Shadowrocket 教程吗？
    a: 不能。如果服务商不提供第三方通用订阅链接（例如飞猫云、无忧链接 2026-10 起、Firefly 2026-10 起、灵猫网络 2026-10 起、SOGO云、闪跃、全球云、隐形人等在品牌资料中均标注仅走官方专属客户端），你将无法导出标准 YAML 或节点列表用于 Clash Verge Rev、v2rayN、Shadowrocket 或 OpenWrt 软路由，只能使用其官方 App 内置的开关。
  - q: 为什么很多网络教程一上来就教修改系统网卡 DNS 或关闭防火墙，而本站将其标为高风险操作？
    a: 直接修改操作系统物理网卡的静态 DNS、强删虚拟网卡驱动或更改路由器防火墙，一旦配置失误或代理软件退出，会直接造成“不开代理也彻底打不开国内网页”的连锁断网；而关闭系统防火墙或 Windows Defender 更会让设备暴露在恶意木马风险下。因此本站坚持先做低风险检查，且任何涉及底层网络栈的改动必须附带可逆的回滚步骤。
  - q: Windows 和 macOS 安装包里的 x64、arm64、Intel 和 Apple Silicon 应该怎么选？
    a: Windows 绝大多数台式机与传统笔记本应选择 x64（或标为 amd64 / x86_64）版本，仅搭载高通骁龙处理器的 Surface 等设备选 arm64；macOS 请点击左上角苹果图标查看“关于本机”，搭载 M1、M2、M3、M4 芯片的 Mac 必须选择 Apple Silicon（arm64 / aarch64）安装包，2020 年以前搭载英特尔处理器的旧款 Mac 选择 Intel（x64）安装包。
  - q: 为什么我把订阅链接粘贴进客户端后提示解析失败或没有显示任何节点？
    a: 最常见的原因有三个：一是订阅格式与客户端内核不匹配，例如把 Clash YAML 格式链接直接粘贴进原生 sing-box 客户端，或把含 VLESS/Hysteria 2 的订阅导入仅支持旧版 Shadowsocks 的软件；二是客户端拉取订阅时发送的 User-Agent 被机场面板拦截或返回了 HTTP 200 空内容；三是误把机场官网浏览器登录地址当成了订阅 URL。
  - q: 代理模式里的规则（Rule）、全局（Global）和直连（Direct）有什么区别，平时该用哪一个？
    a: 日常 95% 以上的时间都应固定使用规则（Rule / 配置）模式，它会自动让国内网站走本地宽带直连、海外受阻网站走代理节点；全局（Global）模式会强制将包括微信、B站、网银在内的所有流量全部绕行海外单一节点，仅用于临时排查某冷门海外网站是否漏分流；直连（Direct）模式则完全暂停代理转发，用于 5 秒内测试本地宽带本身是否正常。
  - q: 什么时候只需要开系统代理（System Proxy），什么时候才必须开启 TUN 虚拟网卡模式？
    a: 如果你平时主要使用 Chrome、Edge、Safari 等浏览器上网、看 YouTube 或在网页端使用 ChatGPT，开启低风险的“系统代理”就完全够用。只有当你需要代理不遵守系统代理设置的软件（例如终端命令行 git/curl/docker、独立桌面客户端、Cursor/VS Code 插件进程或 PC 外服游戏）时，才需要授权并开启 TUN 虚拟网卡模式。
  - q: 开启 TUN 模式或修改 DNS 后出现全网断连、微信掉线或局域网打印机失联，怎么快速回滚？
    a: 请按三步执行 30 秒紧急回滚：第一步在代理客户端界面立即关闭 TUN 模式开关和系统代理开关；第二步若仍断网，进入系统网络连接设置禁用或卸载残留的虚拟网卡（如 Meta / wintun），并将物理网卡 IPv4 的 DNS 改回“自动获得 DNS 服务器地址”；第三步在终端执行 ipconfig /flushdns（Windows）或 killall -HUP mDNSResponder（macOS）刷新解析缓存。
  - q: 为什么使用 ChatGPT、Claude 或 Gemini 时，不建议将节点策略组设为“自动选择（URLTest）”？
    a: 自动选择（URLTest）策略组会每隔几分钟对组内所有节点测速，并自动切换到当下延迟最低的那条节点。这不仅可能误选中香港原生节点（导致 OpenAI/Gemini 触发地区封锁）或 5x 高倍率节点（导致流量暴增），还会使你的出口 IP 在不同国家和机房之间频繁跳变，极易触发 Anthropic（Claude）与 OpenAI 的异地登录风控甚至直接封禁账号。
  - q: 可以使用网上的免费“在线订阅转换网站”把通用订阅转成 Clash 或小火箭格式吗？
    a: 强烈不建议。你的机场订阅链接中包含唯一的身份鉴权 Token，一旦粘贴到不知名的第三方公开在线转换网站，该网站后台日志就能直接截获并保存你的完整订阅地址，导致套餐流量在几天内被他人盗刷耗尽。如需转换格式，应优先使用机场官方后台自带的多格式订阅按钮，或在支持多格式自动识别的本地开源客户端（如 Clash Verge Rev、Hiddify、Karing）中直接导入。
  - q: 家里软路由已经装了 OpenClash 或 PassWall2，电脑和手机上还需要同时打开代理客户端吗？
    a: 不需要，且严禁同时开启。当局域网主路由或旁路由（OpenWrt）已经通过透明代理接管了全屋设备流量时，如果局域网内的电脑或手机又打开了 Clash Verge Rev 或小火箭，就会形成“代理套代理（Proxy-over-Proxy）”的双层加密环路，不仅导致 TLS 握手延迟翻倍、网速暴跌，还会引发 Fake-IP 二次解析死锁。连接软路由 Wi-Fi 时应关闭单机代理软件。
---

# 使用教程中心：从零准备到全平台配置与核验指南

**正确部署与使用代理客户端的标准路径，严格遵循 **「环境预检与校时 → 核对架构安装客户端 → 导入匹配格式订阅 → 开启规则分流与系统代理 → 按需启用 TUN / DNS 调优并执行三项验收」** 的五步递进原则。** 超过 80% 的新手断网、白屏与循环报错，并非源于节点本身损坏，而是因为跳过了前置检查——例如拿着“仅限官方专属客户端”的账号硬套第三方 Clash 教程、在 Apple Silicon Mac 上装错 Intel 安装包、或在一知半解时盲目修改系统物理网卡 DNS 与虚拟网卡驱动。本页为你提供端到端的全平台操作总纲，并将各环节的底层参数与故障修复精准链向六个二级教程与二十四篇排障专文；**凡涉及系统底层网络改动的步骤，均在文内强制附带可逆的回滚方案。**

::: info 本专题六大二级教程导航矩阵
本页作为 **「使用教程（专题 08）」** 的任务总枢纽，重点帮你理清跨平台标准配置流程与关键避坑边界。若你已完成基础连接、需要针对特定模块查阅详细参数或代码配置，请直接点击下表进入对应的二级专题：
:::

| 核心操作目标（二级专题直达） | 适用阶段与解决的核心任务 | 操作风险等级 | 前置条件与回滚要求 |
| :--- | :--- | :--- | :--- |
| **1. [客户端安装与架构区分](/guides/installation/)** | 区分 Win `x64 / arm64`、macOS `Intel / Apple Silicon`、Android ABI、Linux 包格式及 OpenWrt 版本依赖（如 **Nikki 要求 24.10+**） | 低至高（软路由端较高） | 核对官方发布渠道与安装包签名；软路由装插件前必做固件配置备份 |
| **2. [机场订阅导入与格式辨析](/guides/subscriptions/)** | 识别 `Clash YAML`、`Base64`、`sing-box JSON` 差异，排查专属客户端无订阅限制与 User-Agent 参数 | 低风险 | 严禁泄露含 Token 的订阅原链；严禁将私密订阅粘贴至陌生在线转换站 |
| **3. [Clash 基础配置与策略组](/guides/clash-setup/)** | 掌握规则（`Rule`）/ 全局（`Global`）/ 直连（`Direct`）模式切换、策略组选点与 Profile 覆写安全 | 中低风险 | 导入自定义 Merge / Script 覆写脚本前先复制保存原订阅 Profile 副本 |
| **4. [分流规则与防误杀调优](/guides/split-routing/)** | 理解 `GeoSite / GeoIP` 短路匹配顺序，将 ChatGPT/Claude/Gemini 独立固定至纯净节点，防国内网站绕行 | 中风险 | 修改规则顺序后需刷新连接池（Flush Connections）并验证国内外 IP 归属 |
| **5. [TUN 虚拟网卡模式接管](/guides/tun-mode/)** | 对比系统代理与 L3 虚拟网卡原理、完成 Windows/macOS 服务模式（Service Mode）授权、预防路由环路 | **高风险（含虚拟网卡与路由表改动）** | 仅在命令行/游戏需要时开启；**异常断网时按回滚步骤关闭 TUN 并禁用虚拟适配器** |
| **6. [DNS 与 Fake-IP 配置回滚](/guides/dns-setup/)** | 辨析 `Fake-IP (198.18.0.x)` 与 `Redir-Host` 流程，配置 `nameserver / fake-ip-filter` 解决内网与微信冲突 | **高风险（含解析链路与缓存改动）** | 绝不随意篡改物理网卡静态 DNS；**故障时优先还原 DHCP 自动获取并清空 DNS 缓存** |

---

## 一、新手配置五步总览（端到端标准作业流 SOP）

无论你手头使用的是 Windows 台式机、MacBook、iPhone、Android 手机还是 Linux 工作站，从买完套餐到稳定访问海外服务，整个流程都可以浓缩为以下五个标准动作。**请按顺序逐一通关，前一步未确认成功前切勿跳级开启高阶开关：**

```text
[新手端到端配置五步标准路线 SOP]

步骤 1：使用前环境预检 ──> 校准系统时间(误差小于30秒) + 确认机场是「通用订阅」还是「专属客户端」 + 清理旧代理残留
         │
步骤 2：对口客户端安装 ──> 按操作系统与 CPU 架构(x64/arm64)下载对应客户端 + 验证基础运行环境(如 WebView2 / VPN 权限)
         │
步骤 3：安全导入订阅链 ──> 复制脱敏订阅 URL 导入客户端 + 核对协议兼容性(VLESS/SS/Trojan/Hysteria2) + 拉取节点列表
         │
步骤 4：启用分流与接管 ──> 代理模式选「规则 (Rule)」 + 策略组避开 0B/高倍率节点 + 开启「系统代理」(终端/游戏按需开 TUN)
         │
步骤 5：三项标准验收   ──> 1. 测 URLTest 真连接延迟(HTTP 204)  2. 验国内外双栈分流 IP  3. 查 DNS 解析无泄漏且关代理不断网
```

1. **第一关（预检）**：90% 的“导入订阅报 TLS 错误”或“找不到订阅复制按钮”，都在第一关的系统校时与服务商客户端体制核对中直接解决。
2. **第二关（安装）**：选对与设备芯片匹配的活跃开源客户端，避开停更软件与第三方篡改安装包。
3. **第三关（订阅）**：让客户端把远端面板下发的配置解析为本地可见的地区节点列表（港、日、新、美、台等）。
4. **第四关（接管）**：先用侵入性最小的 **「规则模式 + 系统代理」** 跑通浏览器上网；只有当命令行或独立游戏无法走代理时，再进阶开启 **「TUN 虚拟网卡」**。
5. **第五关（验收）**：用三项客观指标确认“国内不减速、海外不阻断、退出软件后原网不瘫痪”。

---

## 二、使用前准备清单：校时、区分通用订阅与专属端、备份意识

在下载任何代理软件之前，请花 2 分钟完成以下三项零成本预检：

### 1. 第一项预检：校准操作系统时间（NTP 自动同步）

现代代理协议（如 `VLESS`、`Trojan`、`Hysteria 2`、`AnyTLS` 依赖的 **TLS 1.3 证书握手**，以及 `VMess` 的 **AEAD 时间戳校验**）对时钟一致性要求极严：
- **故障机理**：当主板电池没电、双系统切换混用时区或关闭自动对时，导致本地时间与标准北京时间（CST）**偏差超过 60 秒至 90 秒**，客户端拉取 HTTPS 订阅或连接节点时就会直接报 `x509: certificate has expired or is not yet valid` 或全节点 `Timeout`。
- **操作动作**：Windows 右键右下角时间 → `调整日期和时间` → 开启 `自动设置时间` 并点击 **「立即同步」**；macOS 进入 `系统设置 → 通用 → 日期与时间` 开启自动设置；iOS/Android 开启自动日期与时间。若同步报错，详见[系统时间不同步导致 VLESS/TLS 握手失败校准](/troubleshooting/articles/time-sync-tls-cert-error)。

### 2. 第二项预检：确认服务商是“通用订阅型”还是“仅限专属客户端型”

很多新手在机场后台找不到“一键导入 Clash”或“复制订阅链接”，是因为没有分清市场上两类截然不同的交付体制（完整名录见[客户端软件专题](/clients/)与[机场品牌数据库](/brands/)）：

| 服务商客户端交付体制 | 核心运作特征 | 站内 31 家品牌档案真实分类对照（据 `data/brands.json`） | 适用的教程路线 |
| :--- | :--- | :--- | :--- |
| **A 类：仅限官方专属客户端（不提供第三方订阅链接）** | 下载机场官网定制 App，直接输入**注册账号与密码**登录即连；后台**不提供或已取消**标准订阅 URL | • [飞猫云](/brands/feimao/)（专属端登录即用）<br>• [无忧链接](/brands/wuyou/)（正文载 2026 年 10 月起改用专属端，与总表旧口径冲突）<br>• [Firefly](/brands/firefly/)（2026 年 10 月起专属端，明确无订阅链接）<br>• [灵猫网络](/brands/lingmao/)（2026 年 10 月起专属端，无订阅链接）<br>• [SOGO云](/brands/sogo/)（自研端，不支持 Clash/小火箭第三方导入）<br>• [闪跃](/brands/shanyue/)、[全球云](/brands/quanqiu/)、[隐形人](/brands/yinxingren/)（均明确仅限专属端、无订阅链接） | **无需套用第三方 Clash / 小火箭订阅导入教程**；直接下载其官方客户端登录，重点关注第十二至十六节的分流与验收检查 |
| **B 类：双模式兼容（既有自研端，又提供通用订阅）** | 既提供一键登录的官方自研客户端，又在面板保留标准订阅链接供导入第三方软件 | • [光速云](/brands/guangsuyun/)（支持自研端 + Clash / Shadowrocket 通用订阅）<br>• [二猫云](/brands/ermao/)、[极连云](/brands/jilian/)、[光年梯](/brands/guangnian/)、[速界](/brands/sujie/)、[梯子云](/brands/tiziyun/)<br>• 5.6 元档集群（[闪电鼠](/brands/shandianshu/)、[大佬云](/brands/dalaoyun/)、[云界线](/brands/yunjiexian/)、[榴莲云](/brands/liulianyun/)、[环球梯](/brands/huanqiuti/)）及[神行加速](/brands/shenxing/) | 新手可先用自研端快速上手；需要在软路由或精细自定义 AI 分流时，按本页流程使用第三方通用客户端 |
| **C 类：标准第三方通用订阅为主** | 服务商维护节点与面板，用户自行安装 Clash Verge Rev、v2rayN、Shadowrocket、sing-box 等导入订阅 URL | • [微风网络](/brands/weifeng/)、[星岛梦](/brands/xingdaomeng/)、[唯兔云](/brands/weitu/)、[U1S1](/brands/u1s1/)、[一翻云](/brands/yifan/)、[可信云](/brands/kexin/) 等（部分具体客户端范围待核实） | **本教程中心的核心适用对象**，请按下方各平台路线逐步配置 |

### 3. 第三项预检：清理旧代理残留与建立配置备份意识

- **单机只运行一个代理核心**：若电脑曾装过已停更的旧版 `Clash for Windows (CFW)`、旧版 `v2rayN` 或其他加速器，安装新端前请先确认旧软件已退出、开机自启已取消，且旧软件的 `系统代理` 与 `TUN / Service Mode` 已关闭。两个代理软件同时争抢端口或虚拟网卡必将引发路由死锁。
- **改动前必留副本**：修改 DNS 覆写、升级内核或迁移软件前，请先将当前可用 Profile 配置文件导出备份（详见[从旧客户端安全迁移并备份配置](/troubleshooting/articles/client-migration-backup)）。

---

## 三、如何选择适用客户端：全平台主流工具选型与安全红线

选客户端的核心标准是 **「匹配操作系统与芯片架构」、「内核完整支持所购机场协议（如 VLESS / Hysteria 2 / AnyTLS）」以及「项目处于活跃维护状态」**。根据站内 `data/clients.json` 审计档案（整理自《第三方代理客户端.txt》），六大平台主流第三方客户端选型矩阵如下（软件横评见 [客户端软件专题](/clients/)，安装细节见 [客户端安装教程](/guides/installation/)）：

| 操作系统平台 | 首选新手友好型客户端 | 进阶 / 多协议 / 备选客户端 | 核心内核引擎 | 必须核对的架构与安全注意事项 |
| :--- | :--- | :--- | :--- | :--- |
| **Windows (Win10/11)** | **[Clash Verge Rev](/clients/clash-verge/)**、**FlClash** | **[v2rayN](/clients/v2rayn/)**、Clash Nyanpasu、Hiddify、Karing、Clash Mi | Mihomo (`Clash.Meta`) / Xray / sing-box | 优先选 `x64` 安装包（骁龙本选 `arm64`）；需 WebView2 运行时；**注意 [Mihomo Party](/clients/mihomo/) 需单独关注维护状态，不宜未经核实作为首选** |
| **macOS (苹果电脑)** | **[Clash Verge Rev](/clients/clash-verge/)**、**FlClash** | **[v2rayN](/clients/v2rayn/)**、Clash Nyanpasu、**[sing-box (SFM)](/clients/sing-box/)**、Karing、Surge Mac | Mihomo / sing-box / Xray / Surge | **严格区分 `Intel (x64)` 与 `Apple Silicon (M1–M4, arm64)`** 安装包；首次开系统代理或 TUN 需在系统设置授予网络扩展与辅助进程权限 |
| **Android (安卓手机/平板)** | **FlClash**、**[Clash Meta for Android](/clients/clash-meta/)** | **v2rayNG**、Hiddify、Karing、**[sing-box (SFA)](/clients/sing-box/)** | Mihomo / Xray / sing-box | 认准 `arm64-v8a` 架构；注意与已停更旧版 CFA 区分；**严禁下载 Google Play 上已被第三方接管控制的同名 [NekoBox](/clients/sing-box/) 版本** |
| **iPhone / iPad (iOS/iPadOS)** | **[Shadowrocket（小火箭）](/clients/shadowrocket/)**、**Karing** | **Stash**、Quantumult X（圈 X）、**[sing-box (SFI)](/clients/sing-box/)**、Hiddify、Streisand、Surge 5 | 自研引擎 / Clash 兼容 / sing-box | 小火箭/Stash/圈 X 等均为**非国区 App Store 付费应用**；**严禁在系统设置 iCloud 登录他人共享 Apple ID**；Potatso/OneClick 对新协议支持有限 |
| **Linux (桌面与无头主机)** | **[Clash Verge Rev](/clients/clash-verge/)**、**FlClash** | **[v2rayN](/clients/v2rayn/)**、**v2rayA**（Web 界面，适合无桌面服务器/NAS）、Hiddify | Mihomo / Xray / sing-box | 按发行版区分 `DEB`（Ubuntu/Debian）、`RPM`（Fedora/RHEL）与 `AppImage`，注意 `cap_net_admin` 权限 |
| **OpenWrt (软路由网关)** | **OpenClash**、**Nikki** | **PassWall2**、**HomeProxy**（原生适配 fw4）、**v2rayA** | Mihomo / Xray / sing-box | 动工前必查 CPU 架构与防火墙体系（`iptables` vs `nftables`）；**原始资料明确提示：Nikki 项目要求 OpenWrt 24.10 及以上版本** |

::: warning 客户端下载渠道与安全声明（零虚构 URL 原则）
由于《第三方代理客户端.txt》原始资料仅标注了各工具的分发渠道类型（`GitHub` / `App Store` / `官网` / `官方文档`），未给出具体仓库 URL，本站严格遵守数据治理规范，在 `data/clients.json` 中将所有未独立核实的外部下载链接统一标记为 **「待核实」**，绝不拼凑第三方下载站链接。请务必通过开发者官方发布页或对应区服官方 App Store 获取安装包，切勿从搜索引擎广告或“破解版下载站”下载代理软件。
:::

---

## 四、Windows 配置路线（Clash Verge Rev / v2rayN / FlClash）

Windows 是桌面端用户量最大、环境冲突也最多的平台。无论选择基于 Mihomo 内核的 **[Clash Verge Rev](/clients/clash-verge/)** 还是多核心工具 **[v2rayN](/clients/v2rayn/)**，请按以下标准路线执行：

### 1. 架构核对与安装避坑
1. 打开 `设置 → 系统 → 系统信息`，确认“系统类型”为 **基于 x64 的处理器**（下载带 `x64-setup.exe` 的安装包；ARM 处理器选 `arm64`），建议安装在纯英文路径下。
2. **遇到启动白屏或核心无法加载时**：
   - Clash Verge Rev 界面依赖微软 **Edge WebView2 Runtime**，若启动后白屏或报错，先核查 WebView2 运行时是否完整，详见 [Clash Verge Rev 无法启动与白屏排查](/troubleshooting/articles/clash-verge-startup-fail)；
   - v2rayN 若提示找不到 `xray.exe` 或 `sing-box.exe`，多因下载了不含核心的精简包或缺少 `.NET Desktop Runtime`，请核对完整包文件，**严禁为了运行未知安装包而直接关闭 Windows Defender 或杀毒软件**，详见 [v2rayN 核心无法加载与更新失败修复](/troubleshooting/articles/v2rayn-core-load-fail)。

### 2. 导入订阅与启用规则系统代理（以 Clash Verge Rev 为例）
1. **导入订阅**：打开客户端左侧 **「订阅 (Profiles)」** → 在顶部输入框粘贴机场 Clash / Mihomo 订阅链接（脱敏示例：`https://sub.example.invalid/api/v1/client/subscribe?token=REDACTED`）→ 点击 **「导入 (Import)」**。若报 YAML 语法错误，见 [Mihomo 核心启动失败与 YAML 报错排查](/troubleshooting/articles/clash-verge-mihomo-yaml-fail)。
2. **选中并选点**：点击刚生成的订阅卡片使其高亮激活 → 切换到左侧 **「代理 (Proxies)」** → 顶部模式确认选中 **「规则 (Rule)」** → 展开主策略组测速，手动选一条延迟正常（`20–80ms`）的 `1x` 节点。
3. **开启接管**：切换到左侧 **「设置 (Settings)」** → 打开 **「系统代理 (System Proxy)」** 开关，打开浏览器即可访问海外站点。（若使用 v2rayN，则在底部状态栏将系统代理设为“自动配置系统代理”，路由设为“绕过大陆”，详见 [v2rayN 系统代理不生效排查](/troubleshooting/articles/v2rayn-system-proxy-fail)）。

---

## 五、Android 配置路线（v2rayNG / Clash Meta for Android / FlClash / Karing）

安卓手机与平板依靠系统 `VpnService` 接口接管流量，核心要点在于 **「防冒牌应用」** 与 **「国产 ROM 锁屏保活」**：

### 1. 安装包架构（ABI）选择与安全警示
- **选对 APK 架构**：主流 64 位安卓手机均应选择 **`arm64-v8a`** 安装包（老旧 32 位设备选 `armeabi-v7a`）。
- **两大安全警示**：第一，使用 **[Clash Meta for Android (CMA)](/clients/clash-meta/)** 或 **FlClash** 时，注意与早已停更的旧版 `Clash for Android (CFA)` 区分；第二，**NekoBox for Android 官方已提示维护资源有限，且特别警告不要安装 Google Play 商店中其名称下已被第三方控制的同名版本**。

### 2. 订阅导入、分应用代理与后台保活三步曲
1. **导入订阅并授权 VPN**：在 **Clash Meta for Android / FlClash** 中点击 `配置 → 新配置 → 从 URL 导入`，粘贴脱敏订阅地址保存并勾选激活，返回主界面点击启动并在系统弹窗允许创建 VPN 连接（状态栏出现钥匙图标）；在 **v2rayNG** 中点击左上角 `订阅分组设置 → + 号` 填入订阅 URL，返回主页右上角点击菜单 **「更新订阅」** 后选中节点并点击底部 `V` 字按钮启动。
2. **开启分应用代理（推荐）**：进入客户端 `设置 → 网络 → 分应用代理`，将国内网银、支付宝、微信、高德地图等设为 **「绕过列表（不走代理）」**，防止国内 App 定位漂移或风控报警。
3. **解决锁屏后自动断网（国产系统保活三件套）**：小米（HyperOS）、vivo（OriginOS）、OPPO（ColorOS）、荣耀/华为等默认会在锁屏后杀后台。请务必完成三项设置（详见 [安卓 v2rayNG / Clash Meta 后台断连与保活排查](/troubleshooting/articles/android-v2rayng-clash-disconnect)）：
   - 进入手机 `设置 → 应用设置 → 代理客户端 → 省电策略/电池优化`，设为 **「无限制 / 允许完全后台行为」**；
   - 在多任务切换界面将代理客户端卡片 **「加锁」**；
   - 进入手机 `设置 → 更多连接 / VPN`，开启该客户端的 **「始终开启的 VPN（Always-on VPN）」**（勿勾选“阻断未通过 VPN 的连接”）。

---

## 六、iPhone / iPad 配置路线（Shadowrocket / Stash / Quantumult X / SFI）

iOS 与 iPadOS 拥有极佳的 Network Extension 稳定性，新手在 iPhone 上的核心阻碍在于 **「安全获取海外区客户端」** 与 **「首次导入规则配置」**。

### 1. App Store 区服限制与共享 Apple ID 锁机红线

在 iOS 平台上，**[Shadowrocket（小火箭）](/clients/shadowrocket/)**、**Stash**、**Quantumult X（圈 X）**、**Surge 5** 以及免费的 **[sing-box (SFI)](/clients/sing-box/)**、**Karing**、**Hiddify**、**Streisand** 均未在中国大陆区 App Store 上架；且小火箭、Stash、圈 X 等属于 **海外区（如美区）付费应用**。

::: danger 铁律：严禁在系统「设置 → iCloud」登录任何他人共享的 Apple ID！
许多网店或面板会提供“共享美区 Apple ID”供下载小火箭。**绝对严禁在 iPhone「设置（Settings）」主界面顶部的 Apple ID / iCloud 处登录共享账号**！一旦对方在后台开启“查找我的 iPhone（丢失模式）”，手机会瞬间被远程锁死并遭敲诈。
- **安全做法**：建议自建美区/港区 Apple ID 并用礼品卡购入正版；若临时在 **「App Store 商店应用内部」** 登录下载，下完必须立即在 App Store 内退出。
:::

### 2. Shadowrocket（小火箭）端到端配置四步路线
1. **导入订阅**：打开 Shadowrocket → 点击右上角 **`+` 号** → 第一行“类型”选择 **`Subscribe（订阅）`** → 在“URL”栏粘贴机场通用订阅链接（脱敏示例：`https://sub.example.invalid/api/v1/client/subscribe?token=REDACTED`），填入备注后点击右上角 **「保存」**。
2. **设置全局路由**：点击首页 **「全局路由 (Global Routing)」**，勾选为 **「配置 (Config)」**（对应规则分流模式，勿长期停留在“代理”或“直连”）。
3. **测速选点**：在 `设置 → 延迟测试方法` 中确认设为 **`CONNECT`** 或 **`URLTest`**，返回首页点击 **「连通性测试」**，点选一条带绿色毫秒数的香港、日本或新加坡 `1x` 节点。
4. **授权启动**：打开首页顶部连接开关，首次开启时在 iOS 弹窗点击 **「允许 (Allow)」** 并输入锁屏密码完成 VPN 描述文件安装。若导入失败或规则不生效，见 [Shadowrocket 无法导入订阅与分流规则不生效排查](/troubleshooting/articles/shadowrocket-import-rules)。

---

## 七、macOS（Intel vs Apple Silicon）及 Linux / OpenWrt 进阶平台配置路线

### 1. macOS 苹果电脑配置脉络（芯片架构核验与权限授权）
1. **确认芯片架构**：点击左上角 ` 苹果图标 → 关于本机`。若芯片显示 **`Apple M1 / M2 / M3 / M4`**，下载 [Clash Verge Rev](/clients/clash-verge/)、FlClash 或 v2rayN 时必选 **`aarch64.dmg` / `arm64.dmg` / `Apple Silicon`** 原生包；若显示 **`Intel Core`**，则选 **`x64.dmg` / `Intel`** 包。
2. **放行签名与授予权限**：首次打开开源客户端若提示“无法验证开发者”，进入 `系统设置 → 隐私与安全性` 点击 **「仍要打开」**；开启“系统代理”或安装“服务模式（Service Mode）”时输入 Mac 开机密码完成 Helper 授权。

### 2. Linux 桌面与 OpenWrt 软路由配置要点与回滚保护
- **Linux 桌面与服务器**：Ubuntu/Debian 桌面用 `DEB` 包、Fedora/RHEL 用 `RPM` 包或通用 `AppImage`；无桌面服务器或 NAS 推荐使用自带 Web 控制台的 **v2rayA**，详见 [客户端安装教程](/guides/installation/)。
- **OpenWrt 软路由透明代理（高风险环境必读）**：
  在软路由部署 **OpenClash**、**PassWall2**、**Nikki** 或 **HomeProxy** 时：
  1. **核对固件版本与防火墙架构**：OpenWrt 22.03+ 全面采用 **`fw4 (nftables)`**，旧固件为 `fw3 (iptables)`。根据《第三方代理客户端.txt》明确警告，**Nikki 插件强制要求 OpenWrt 24.10 及以上版本**。
  2. **软路由高风险操作回滚步骤**：动工前**必须先在 LuCI 后台 `系统 → 备份与升级` 下载配置备份包**。一旦开启插件后全屋断网，请通过网线直连或 SSH 登录软路由（`ssh root@192.168.1.1`），依次执行 `/etc/init.d/openclash stop`（或对应插件 `passwall2` / `nikki` / `homeproxy` 的 `stop` 与 `disable`）停止服务，再执行 `/etc/init.d/firewall restart && /etc/init.d/dnsmasq restart` 重建原厂防火墙与本地 DNS，全屋网络即可立即恢复直连。

---

## 八、订阅链接导入与常见参数解析（Clash YAML / Base64 / sing-box JSON）

为什么同一个订阅链接在 Clash Verge Rev 里能导入，粘到原生 sing-box 或旧客户端里却报错？因为不同内核要求的 **「订阅报文数据结构」** 完全不同（详见二级专题 [机场订阅教程](/guides/subscriptions/)）。

标准机场面板下发的订阅地址通常形如以下 **脱敏占位 URL**（切勿在公开场合暴露真实 `token`）：

```text
https://sub.example.invalid/api/v1/client/subscribe?token=REDACTED&flag=meta
```

| 订阅报文格式 | 内容形态与结构特征 | 适用客户端内核生态 | 常见不兼容报错现象 |
| :--- | :--- | :--- | :--- |
| **1. Base64 通用节点串** | 将多行 `vless://`、`ss://`、`trojan://` 链接拼接后做 Base64 编码，**不含分流规则与策略组** | **v2rayN**、**v2rayNG**、**Shadowrocket**、Streisand、Hiddify、Karing | 直接导入纯 Clash 客户端会提示 `yaml: unmarshal errors` |
| **2. Clash / Mihomo YAML** | 结构化 YAML 文本，含 `proxies:`、`proxy-groups:`、`rules:` 与 `dns:` 配置 | **[Clash Verge Rev](/clients/clash-verge/)**、**FlClash**、**[Clash Meta for Android](/clients/clash-meta/)**、Clash Mi、**Stash**、**OpenClash**、**Nikki** | 导入已停更的原版 Clash 内核遇到 `vless` 或 `hysteria2` 会报 `unsupported proxy type` |
| **3. sing-box JSON 配置** | 严格的 JSON 树状结构（`inbounds / outbounds / route / dns`），与 YAML 不通用 | **[sing-box 官方客户端 (SFA/SFI/SFM)](/clients/sing-box/)**、**Hiddify**、**Karing**、**HomeProxy** | 把 Clash YAML 喂给原生 sing-box 会提示 JSON 解析错误 |

::: danger 订阅安全红线：严禁使用未知的第三方“在线订阅转换网站”
在线订阅转换网站是由对方服务器代你拉取机场订阅 URL。只要把含 `token` 的真实链接粘进去点转换，对方后台日志就能截获并永久保存你的私密订阅，导致数百 GB 流量在几天内被盗刷耗尽。转换格式请优先使用机场官网自带的多格式按钮，或用本地多格式客户端（Clash Verge Rev / Hiddify / Karing）直接导入，详见 [账号与订阅 Token 安全](/security/account-security/)。
:::

---

## 九、代理模式区别：规则（Rule）vs 全局（Global）vs 直连（Direct）

选错客户端顶部的代理运行模式，是导致“国内网银登不上、B站卡顿”或“流量消耗翻倍”的头号原因（详见二级专题 [Clash 配置教程](/guides/clash-setup/)）：

| 代理运行模式 | 流量转发逻辑 | 国内网站（淘宝/微信/B站/网银）走向 | 海外目标网站（Google/YouTube/AI）走向 | 适用时机与致命误区 |
| :--- | :--- | :--- | :--- | :--- |
| **规则模式（Rule / 配置 Config）** | **【日常唯一主力模式】** 按分流规则表自上而下匹配，各走各路 | **走本地宽带直接连接（Direct）**，保持国内满速低延迟，不耗机场流量 | **自动走你选定的境外代理节点（Proxy）** | **95% 以上时间必须保持在此模式**；既省流量又不影响国内 App 正常定位 |
| **全局模式（Global / 代理 Proxy）** | 无视所有分流规则，强行把所有流量全部发往同一条海外节点 | **被迫绕道海外节点再回国**！延迟暴增、国内视频受限，且疯狂消耗机场流量 | 全部走当前选定的唯一海外节点 | **仅限临时排障使用 1–2 分钟**（确认某冷门海外站是否为规则漏配，用完立即切回规则模式） |
| **直连模式（Direct）** | 暂停所有代理转发，流量原封不动直出本地物理网卡 | 走本地宽带直连 | 走本地宽带直连（受阻网站无法访问） | **用于 5 秒快速对比排障**：不退软件即可立即测试某国内网站打不开是否由代理引起 |

---

## 十、系统代理（System Proxy）设置原理与 10 秒断网回滚

### 1. 系统代理的工作原理与天然盲区
1. **本地端口监听与注册表写入**：客户端启动后会在你电脑的本地回环地址 `127.0.0.1` 开启一个混合监听端口（例如 Clash Verge Rev 默认常用的 `7897` 或 `7890`，v2rayN 默认常用的 `10808` / `10809`）。当你打开“系统代理”开关时，客户端会自动将 `127.0.0.1:7897` 写入 Windows 的 `Internet 选项（WinINet 注册表项）` 或 macOS 的 `网络服务 HTTP/HTTPS/SOCKS 代理配置` 中。
2. **优点与天然盲区（为什么命令行和独立游戏不走系统代理？）**：
   - **核心优点**：完全在应用层工作，不需要安装任何虚拟网卡驱动，也不需要管理员权限，关闭开关即可瞬间还原，是新手日常浏览网页的首选低风险模式。
   - **天然盲区**：操作系统的“系统代理设置”只是一份非强制性的环境变量声明。Chrome、Edge、Firefox、Safari 以及常规办公软件会主动读取并遵守它；但 **Windows PowerShell / CMD / 终端里的 `git`、`curl`、`pip`、`npm`、`docker` 命令行工具、部分开发 IDE 的后台语言服务器进程，以及绝大多数 PC 独立客户端游戏（如 Steam 联机进程）默认完全无视系统代理设置**，依然直连物理网卡出国（对比详解见 [TUN 模式与系统代理的区别](/troubleshooting/articles/tun-vs-system-proxy)）。如果仅在终端临时需要代理，也可在终端设置 `HTTP_PROXY` / `HTTPS_PROXY` 环境变量指向本地混合端口。

### 2. 系统代理残留导致“不开代理上不了网”的 10 秒回滚步骤

若电脑遭遇突然蓝屏、断电死机或代理软件崩溃未正常退出，操作系统注册表里残留的 `127.0.0.1:7897` 就会变成一个无人监听的“死胡同”，导致开机后哪怕不开代理软件，浏览器也报 `ERR_PROXY_CONNECTION_FAILED` 打不开任何国内网页（详见 [已连接或关代理后网页打不开排查](/troubleshooting/articles/connected-no-internet)）：
- **Windows 10 / 11 回滚**：按 `Win + I` 打开 `设置 → 网络和 Internet → 代理` → 将“手动设置代理”下的 **「使用代理服务器」** 开关直接拨到 **「关闭」** 并保存，浏览器即可在 1 秒内恢复直连上网。
- **macOS 回滚**：打开 `系统设置 → 网络 → 当前连接的 Wi-Fi（或以太网）→ 详细信息 → 代理` → 将 **网页代理 (HTTP)**、**安全网页代理 (HTTPS)** 与 **SOCKS 代理** 三个开关全部关闭并点击“好”。

---

## 十一、TUN 虚拟网卡模式开关时机、前置权限与安全回滚

为了接管不遵守系统代理的命令行终端、Cursor / VS Code 远程插件与独立桌面游戏，Mihomo 与 sing-box 客户端提供了更底层的 **「TUN 模式（虚拟网络适配器模式）」**（完整参数配置见二级专题 [TUN 模式教程](/guides/tun-mode/)）。

### 1. TUN 底层原理与前置权限
- **L3 路由接管原理**：开启 TUN 后，客户端不再依赖应用程序自觉读取代理端口，而是在操作系统内核层创建一张名为 `Meta`、`Clash`、`wintun` 或 `utun` 的 **第三层（OSI 网络层）虚拟网卡** 并向系统路由表注入默认高优先级路由，将全机所有进程发出的 TCP 与 UDP 数据包统一吸进虚拟网卡，再由代理内核按分流规则精确转发。
- **开启 TUN 必备的两项前置权限**：由于创建虚拟网卡与修改系统路由表属于高权限系统调用，普通用户态进程无法直接执行——必须在客户端 `设置 → 服务模式 (Service Mode)` 中点击小盾牌图标安装并启动系统服务（macOS 端为输入密码授权安装 Helper 辅助程序），确认服务状态显示绿色 `已安装 / 运行中` 后再开启 TUN；或者右键客户端图标选择“以管理员身份运行”。同时须确保内核配置开启 `auto-route: true` 与 `auto-detect-interface: true`（自动绑定物理出站网卡）以防止流量回环死锁。若开启开关后毫无效果，请查阅 [TUN 开启无效排查指南](/troubleshooting/articles/tun-not-working)。

### 2. 高风险操作警示与 TUN 模式断网紧急回滚步骤

::: warning 高风险操作与回滚方案（TUN 虚拟网卡与系统路由表）
**风险提示**：TUN 模式直接改写系统路由表。在装有企业内网 VPN（EasyConnect、零信任、OpenVPN、Tailscale）、虚拟机桥接网卡或游戏加速器的电脑上，开启 TUN 极易引发多虚拟网卡路由冲突，导致全机断网或局域网打印机/NAS 失联。

**当开启 TUN 后出现断网或内网失联，请按以下四步执行安全回滚：**
1. **第一步（客户端内软关闭）**：在客户端界面立即关闭 **「TUN 模式」** 开关，等待 5 秒观察虚拟网卡是否销毁。
2. **第二步（停止服务模式并退软件）**：若虚拟网卡仍卡死，在客户端设置中卸载/停止 `Service Mode（服务模式）`，然后彻底退出客户端。
3. **第三步（系统层禁用残留虚拟适配器）**：Windows 按 `Win + R` 输入 `ncpa.cpl` 打开网络连接，右键名为 `Meta`、`Clash` 或 `wintun` 的虚拟网卡选择 **「禁用」**；macOS 可在 `系统设置 → 网络 → VPN 与过滤器` 中停用对应网络扩展。
4. **第四步（重启物理网卡恢复默认路由）**：将正在使用的 `Wi-Fi` 或 `以太网` 禁用 3 秒后重新启用，重新向路由器获取干净的默认网关。
:::

---

## 十二、DNS 与 Fake-IP 配置原则及断网回滚方法

在代理环境中，DNS 决定了分流准确性、防泄漏能力以及微信/企业内网是否冲突（详见二级专题 [DNS 与 Fake-IP 配置教程](/guides/dns-setup/)）：

| DNS 增强模式 | 核心工作流程 | 核心优势 | 常见副作用与必配防坑项 |
| :--- | :--- | :--- | :--- |
| **Fake-IP 模式（现代默认首选）** | 浏览器查询域名时，本地内核**不等待真实 DNS 解析**，1ms 内立即返回 **`198.18.0.0/15`（如 `198.18.0.1`）** 虚拟假 IP；待应用发起连接时，内核直接把**原始域名**通过专线发给境外落地机解析 | **消除本地 DNS 等待耗时**（网页秒开），从根源杜绝本地 DNS 抢答污染 | 1. 校验真实 IP 的内网 OA、游戏反作弊、微信组件或 Windows 联网探测拿到 `198.18.0.x` 会异常；<br>2. **必配 `fake-ip-filter` 白名单**；<br>3. 退软件后残留 `198.18.0.x` 缓存会导致直连断网 |
| **Redir-Host 模式（真实 IP）** | 本地内核先向 DNS 服务器请求拿到真实公网 IP，再拿真实 IP 匹配 `GEOIP` 分流规则 | 应用拿到的永远是真实 IP，对企业内网与老旧局域网软件兼容性好 | 每次新建连接多等一次本地 DNS 往返，且对 `nameserver / fallback` 分组要求高 |

### DNS 配置三原则与高风险断网回滚步骤
1. **绝不在物理网卡上手工填 `8.8.8.8` / `1.1.1.1`**：海外公共 DNS 在国内直连环境下高延迟或受干扰，会导致国内 CDN 解析跨省或超时。**系统物理网卡 DNS 应永远保持“自动获得（DHCP）”**。
2. **`nameserver` 与 `proxy-server-nameserver` 用国内可靠 DNS**（如 `223.5.5.5`、`119.29.29.29`），确保首先能解析并连上国内中转入口机；同时补齐 `fake-ip-filter`（放行 `*.lan`、NTP 校时与 `+.msftconnecttest.com`），详见 [Fake-IP 198.18.0.1 冲突修复](/troubleshooting/articles/fake-ip-explained-fix) 与 [DNS 泄漏排查](/troubleshooting/articles/dns-leak-hijack-fix)。

::: warning 高风险操作与回滚方案（系统 DNS 设置与 Fake-IP 缓存污染）
**当退出代理后因残留 `198.18.0.x` 假 IP 或误改网卡 DNS 导致“能上 QQ 但网页全打不开”时，按两步在 20 秒内回滚：**
1. **第一步（还原物理网卡 DNS 为 DHCP 自动获取）**：Windows 打开 `ncpa.cpl` → 右键当前 `WLAN/以太网` → `属性` → 双击 `IPv4` → 勾选 **「自动获得 DNS 服务器地址」**；macOS 打开 `系统设置 → 网络 → 当前 Wi-Fi → 详细信息 → DNS` → 点击 `-` 清空所有手动 DNS 条目恢复默认。
2. **第二步（清空系统与浏览器 DNS 缓存）**：
   - **Windows**（打开 CMD/PowerShell 执行，低风险，清除 `198.18.0.x` 缓存）：`ipconfig /flushdns`
   - **macOS**（打开终端 Terminal 执行，低风险）：`sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`
   - 重启浏览器窗口即可立即恢复直连访问。
:::

---

## 十三、规则分流（Split Routing）核心逻辑与 AI / 流媒体定向策略

配置文件底部的 **「规则引擎（Rules Engine）」** 严格遵循 **「从第一行往最后一行逐条比对、一旦命中某条规则即刻执行并停止往下检查」** 的短路机制（详见二级专题 [分流规则配置指南](/guides/split-routing/)）：

```text
第 1 层（最高优先级）：局域网私有地址豁免 (IP-CIDR 192.168.0.0/16, 127.0.0.0/8 ──> DIRECT)
   ↓ 未命中则继续往下
第 2 层（精准业务分流）：特定高敏感域名规则 (DOMAIN-SUFFIX / GEOSITE: openai, anthropic, netflix, youtube ──> 对应专属策略组)
   ↓ 未命中则继续往下
第 3 层（国内域名与 IP 兜底直连）：GEOSITE,cn 与 GEOIP,CN,DIRECT (须加 no-resolve 防止触发多余本地 DNS 解析)
   ↓ 仍未命中的所有未知海外流量
第 4 层（最终兜底规则）：MATCH / FINAL ──> 交由主代理策略组 (PROXY) 出境
```

> **为什么 `IP-CIDR` 和 `GEOIP` 规则末尾必须带 `no-resolve` 参数？**
> 当客户端自上而下检查到一条 IP 规则时，若当前请求仍是一个域名（如 `chatgpt.com`），未加 `no-resolve` 的内核会在本地主动发起一次 DNS 查询将其解析为 IP 进行比对。这不仅拖慢网页首屏打开速度，还极易造成本地 DNS 泄漏。加上 `no-resolve` 后，纯域名请求会直接跳过该 IP 规则，仅由域名规则匹配。

### 为 ChatGPT / Claude / Gemini 单独锁定纯净节点的三步法
正如 [线路与节点专题](/routes/) 与 [AI 与流媒体专题](/ai-media/) 实测所示，**香港节点虽然吞吐最高，但 OpenAI、Claude 与 Gemini 均封锁了香港原生 IP（如光速云 Miaoko 实测中香港专线 OpenAI 为 `仅APP(HK)`、Gemini 多为 `失败`）**。因此科学的策略组选点法是：
1. 将 **「主代理组（Proxy / 节点选择）」** 选在 **香港或日本 `1x` 低延迟节点**，保障日常网页、文件下载与 YouTube 4K 的高吞吐体验；
2. 将 **「AI / OpenAI / Claude / Gemini」** 独立策略组**手动固定**在一条已验证好用的 **新加坡（SG）、美国（US）或日本（JP）节点** 上，切勿设为自动测速（URLTest），防止出口 IP 在不同国家间频繁跳变触发 AI 平台封号；
3. 将 **「流媒体 / Netflix / Disney+ / Bahamut」** 策略组按你想看的片库区域手动选点（看动画疯选台湾正常节点，避开 `0B` 与广播 IP 识别漂移为 `ES` 的节点）。

---

## 十四、订阅自动更新策略与 User-Agent（UA）识别机制

1. **User-Agent 如何决定机场面板给你下发什么协议节点**：
   主流机场面板（如 SSPanel、V2Board、Xboard）会根据客户端请求头中的 `User-Agent` 动态生成配置文件。当客户端发送 `clash.meta` / `mihomo` / `clash-verge` 时，面板确认内核支持现代协议，会下发含 `VLESS-Reality`、`Hysteria 2`、`AnyTLS` 的完整配置；若发送旧版 `ClashForWindows` 或普通浏览器 UA，面板担心旧内核报错，会自动过滤掉所有新协议，只下发兼容的 `Shadowsocks` 节点甚至返回 Base64 字符串。若发现多端节点数量或协议不一致，可在客户端订阅右键编辑中将 `User-Agent` 显式指定为 `clash.meta` 后重新更新（详见 [同一订阅不同客户端表现不一致排查](/troubleshooting/articles/cross-client-inconsistency)）。
2. **合理设置自动更新间隔（防 403 / 429 防火墙封禁）**：
   切勿将订阅自动更新间隔设为 `15–60 分钟` 高频拉取，否则多台设备每天发起数百次请求极易触发机场前端 Cloudflare / WAF 的防 CC 规则，导致家庭宽带公网 IP 被封禁报 `HTTP 403 Forbidden` 或 `429 Too Many Requests`（详见 [更新订阅失败 401/403/404/503 排查](/troubleshooting/articles/sub-http-401-403-404-503)）。建议将自动更新间隔设为 **`1440 分钟（24 小时）至 4320 分钟（72 小时）`**，或仅在节点超时及收到维护公告时手动点击更新。

---

## 十五、多设备配置与在线设备数 / IP 限制避坑

1. **分清“不限设备数”与“同时在线公网 IP 限制”**：
   站内如 [星岛梦](/brands/xingdaomeng/)、[无忧链接](/brands/wuyou/)、[二猫云](/brands/ermao/)、[唯兔云](/brands/weitu/)、[Firefly](/brands/firefly/)、[U1S1](/brands/u1s1/)、[灵猫网络](/brands/lingmao/)、[一翻云](/brands/yifan/)、[SOGO云](/brands/sogo/)、[灵动云](/brands/lingdong/) 等在品牌资料（`vendor`）中声明 **「不限设备连接数」**；但多数服务商默认禁止多人异地合租。同一家庭 Wi-Fi 下的多台设备对外共享 1 个公网 IP，而手机切 5G 流量 + 公司电脑 + 家里平板则会同时产生 3 个不同城域网源 IP。若违规外借订阅触发异地审计，会导致账号被封或订阅返回 `HTTP 200 空内容`（见 [订阅返回 HTTP 200 空白节点排查](/troubleshooting/articles/sub-http-200-empty)）。
2. **严禁“软路由透明代理 + 单机客户端”双层套娃**：
   当家里 OpenWrt 软路由已开启 OpenClash / PassWall2 / Nikki / HomeProxy 透明代理时，连在局域网内的电脑与手机**必须关闭单机代理软件**，避免形成双层加密环路与 Fake-IP 二次解析死锁。

---

## 十六、配置完成后的三项标准验收检查（延迟 / 分流 / DNS 验证）

配置完毕开启系统代理（或 TUN）后，请花 30 秒执行以下三项标准验收，确认全链路健康：

| 验收检查项 | 具体验证动作 | 什么结果算完全合格（Pass）？ | 出现不合格表现时的修正方向 |
| :--- | :--- | :--- | :--- |
| **1. 客户端真连接延迟测活（HTTP 204）** | 点击客户端策略组测速按钮（确认测速 URL 为 `http://www.gstatic.com/generate_204`） | 当前选中节点返回真实毫秒数（如香港 `20–60ms`、日/新 `50–100ms`、美国 `140–220ms`），非 `Timeout` | 若全部 `Timeout`，先查系统时间与端口；若仅单节点 `Timeout`，换同地区其他编号节点 |
| **2. 国内外双栈 IP 分流核验** | 分别测试访问国内网站（B站/淘宝/国内 IP 查询）与海外网站（Google/GitHub） | **国内站点显示本地电信/联通/移动宽带 IP 且秒开；海外站点显示所选代理节点对应国家出口 IP** | 若国内站点也显示香港/美国 IP，说明误开了 **全局（Global）模式**，立即切回 **规则（Rule）模式** |
| **3. DNS 解析与退软件恢复测试** | 1. 核查海外访问 DNS 出口位于境外；<br>2. **关闭系统代理并退出软件**，打开国内任意网页 | 1. 海外访问不泄露本地运营商 DNS；<br>2. **退出代理软件后，本地直连上网 100% 正常打开** | 若退软件后国内网页打不开，说明代理未注销或残留 Fake-IP 缓存，按第十、十二节回滚步骤清理 |

---

## 十七、常见配置错误与排障入口直达矩阵

遇到任何报错弹窗或异常症状时，可前往 [交互式故障排查中心](/troubleshooting/) 使用分流器诊断，或直接对照下方 **「全场景报错直达表」** 进入全部 24 篇实操修复专文：

| 配置阶段 | 你看到的具体错误现象或报错代码 | 最可能的核心诱因 | 先做 1 项 10 秒低风险检查 | 实操排障专文直达入口 |
| :--- | :--- | :--- | :--- | :--- |
| **1. 安装与启动** | **Clash Verge Rev 双击打不开、白屏或权限报错** | 缺 WebView2 运行时、旧进程占端口或目录无权限 | 任务管理器结束残留的 `clash-verge` / `mihomo` 进程 | [Clash Verge Rev 无法启动与白屏排查](/troubleshooting/articles/clash-verge-startup-fail) |
| **1. 安装与启动** | **提示 `Mihomo 核心启动失败` 或 `YAML syntax error`** | 误把网页或 Base64 链当 YAML 导入，或覆写脚本错误 | 暂时禁用所有自定义 Merge / Script 覆写脚本重试 | [Mihomo 核心启动失败与 YAML 语法报错排查](/troubleshooting/articles/clash-verge-mihomo-yaml-fail) |
| **1. 安装与启动** | **v2rayN 提示核心无法加载、缺 `xray.exe` 或更新失败** | 下载了不含核心的精简包或缺少 `.NET Desktop Runtime` | 检查软件 `bin/` 目录下是否存在核心可执行文件 | [v2rayN 核心无法加载与更新失败修复](/troubleshooting/articles/v2rayn-core-load-fail) |
| **1. 安装与启动** | **从旧版 Clash for Windows 或 Mihomo Party 迁移备份** | 旧软件停更需迁移订阅 Profile 并清理旧虚拟网卡服务 | 先在旧端关闭系统代理、TUN 与自启并复制订阅原链 | [从旧客户端安全迁移并备份配置指南](/troubleshooting/articles/client-migration-backup) |
| **2. 订阅与拉取** | **更新订阅返回 `HTTP 200`，但节点列表空白或仅剩到期提示** | 套餐流量耗尽、到期、UA 不匹配或触发多 IP 封禁 | 登录机场面板查看剩余流量、有效期限与在线设备 | [订阅返回 HTTP 200 但 0 字节空白节点排查](/troubleshooting/articles/sub-http-200-empty) |
| **2. 订阅与拉取** | **更新订阅报错 `401 / 403 / 404 / 503` 或被重定向** | Token 已重置（401）、高频拉取触发 WAF（403）或维护（503） | 暂停自动更新，登录官网后台重新复制最新订阅地址 | [更新订阅失败 401/403/404/503 排查](/troubleshooting/articles/sub-http-401-403-404-503) |
| **2. 订阅与拉取** | **更新订阅提示 `TLS certificate error` 或 DNS 超时** | 本地时间偏差超 1 分钟、订阅域名被污染或开着坏代理更新 | 校准系统时间，**先关闭系统代理与 TUN** 后再点更新 | [更新订阅提示 TLS 证书错误与 DNS 超时排查](/troubleshooting/articles/sub-tls-dns-timeout) |
| **2. 订阅与拉取** | **同一条订阅在不同客户端表现不一致、少节点或协议报错** | 各客户端发送的 `User-Agent` 不同或旧内核不支持 VLESS | 核对内核版本并将订阅 UA 显式改为 `clash.meta` | [同一订阅在不同客户端表现不一致排查](/troubleshooting/articles/cross-client-inconsistency) |
| **2. 订阅与拉取** | **Shadowrocket（小火箭）无法导入订阅或分流规则不生效** | 链接格式不兼容，或“全局路由”未设为“配置 (Config)” | 检查小火箭首页“全局路由”是否选中 **「配置 (Config)」** | [Shadowrocket 无法导入订阅与分流规则不生效排查](/troubleshooting/articles/shadowrocket-import-rules) |
| **3. 连接与接管** | **列表里所有地区的全部节点同时显示 `Timeout / 超时`** | 系统时间未同步、本地断网、套餐到期或入口被攻击切换 | 校准系统时间（误差小于 30 秒），关代理状态更新订阅 | [所有节点同时超时分流排查](/troubleshooting/articles/nodes-all-timeout) / [时间不同步校准](/troubleshooting/articles/time-sync-tls-cert-error) |
| **3. 连接与接管** | **港/日节点正常，仅台湾 02 或美国个别节点超时 / 测速 `0B`** | 单台境外落地 VPS 故障维护（如微风 `台湾02=0B`） | 手动切换到同地区其他正常编号，避开 `0B` 与 `KB` 节点 | [仅单个节点或特定地区超时与测速 0B 解读](/troubleshooting/articles/nodes-partial-region-timeout) |
| **3. 连接与接管** | **分不清是套餐到期流量耗尽，还是客户端本地旧配置过时** | 未更新订阅仍连已下线旧入口，或高倍率节点提前耗尽流量 | 登录后台查账单并在客户端更新订阅拉取新入口 | [套餐到期、流量耗尽与旧配置过时快速区分](/troubleshooting/articles/quota-expired-vs-stale-config) |
| **3. 连接与接管** | **节点显示已连接且有延迟，但所有国内外网页全部打不开** | 系统代理端口冲突、双代理套娃或退软件后代理未清除 | 切为“直连模式”或按第十节回滚关闭系统手动代理 | [节点已连接但所有网页打不开排查](/troubleshooting/articles/connected-no-internet) |
| **3. 连接与接管** | **v2rayN 显示已运行，但浏览器不走代理或系统代理自动被还原** | 状态栏设为“清除系统代理”、浏览器扩展冲突或被安全软件还原 | 检查 v2rayN 底部状态栏是否为“自动配置系统代理” | [v2rayN 浏览器不走代理与系统代理自动还原排查](/troubleshooting/articles/v2rayn-system-proxy-fail) |
| **3. 连接与接管** | **开启 TUN 模式开关无效、虚拟网卡不出现或命令行仍直连** | 未安装授权 `Service Mode`、缺管理员权限或多虚拟网卡冲突 | 检查客户端设置中“服务模式”是否为绿色已安装状态 | [TUN 模式开启无效排查](/troubleshooting/articles/tun-not-working) / [TUN 与系统代理对比](/troubleshooting/articles/tun-vs-system-proxy) |
| **3. 连接与接管** | **安卓锁屏几分钟后 v2rayNG / Clash Meta 自动断连失效** | 国产安卓系统省电策略杀后台，或 Wi-Fi 切 5G 未重连 | 电池优化设为“无限制”并在系统 VPN 开启“始终开启” | [安卓 v2rayNG / Clash Meta 后台断连与保活排查](/troubleshooting/articles/android-v2rayng-clash-disconnect) |
| **4. DNS 与性能** | **解析出 `198.18.0.1` 打不开网页，或微信/企业内网掉线** | `Fake-IP` 未将内网列入 `fake-ip-filter` 或关代理残留缓存 | 执行 `ipconfig /flushdns` 清缓存并核对 `fake-ip-filter` | [Fake-IP 原理与 198.18.0.1 修复](/troubleshooting/articles/fake-ip-explained-fix) / [DNS 泄漏排查](/troubleshooting/articles/dns-leak-hijack-fix) |
| **4. DNS 与性能** | **看视频飞快，唯独 ChatGPT / Claude / Gemini 报 403** | AI 流量误走香港原生节点（如香港 OpenAI `仅APP(HK)`） | 将 AI 策略组手动固定到新加坡或美国并开无痕窗口测试 | [仅个别网站或 AI 工具打不开与浏览器不一致排查](/troubleshooting/articles/specific-sites-unreachable) |
| **4. DNS 与性能** | **晚高峰高延迟丢包、游戏联机失败或实际下载远低于测速图** | 晚高峰拥塞、本地 UDP QoS、非 FullCone NAT 或高倍率损耗 | 对比手机 5G 热点与家宽，核查倍率与 UDP FullCone 状态 | [晚高峰卡顿定位](/troubleshooting/articles/high-latency-packet-loss-peak) / [UDP 与 NAT 排查](/troubleshooting/articles/udp-nat-firewall-blocks) / [测速与实际差异](/troubleshooting/articles/bandwidth-multiplier-speedtest-diff) |

### 兼顾“自研客户端一键登录”与“Clash / 小火箭第三方通用订阅”的方案参考

若你希望选择一家 **「既提供官方自研客户端供新手免配置上手，又保留标准通用订阅链接供 Clash Verge Rev、Shadowrocket 做精细 AI 分流」** 的服务商，可参考站内合作展示位品牌 **[光速云](/brands/guangsuyun/)**（资料称 2020 年起运营，支持 VLESS / Shadowsocks / AnyTLS，保留有 `2026-08-11` MAI-TEST-BOT 与 `2026-08-19` Miaoko 三网实测截图）。

> **透明核验与风险披露**：根据本站[品牌数据库审计记录](/brands/guangsuyun/)，光速云属商业合作推广展示位（通过下方卡片注册可能为本站带来佣金，不影响用户支付价格，亦不代表客观测速排名第一）。购买与配置前请知悉其已核实边界：官网非推广主域仍标为“待核实”；年付轻量版（¥99/年）存在 `59GB/月` 与 `69GB/月` 资料冲突；实测图中香港节点吞吐高，但香港专线 OpenAI 多为 `仅APP(HK)`、Gemini 多为失败，且新加坡/台湾部分节点存在 YouTube `送中(CN)` 记录，配置分流时需按第十三节方法手动固定可用节点；资料注明“特殊商品不支持退款”，建议新手优先从 **月付极速版（¥25/月）** 小额试错。更多对比请查阅 [机场推荐总览](/airport/airport-recommendation/) 与 [好用的机场：专属端 vs 通用订阅权衡](/airport/easy-to-use/)。

<AffiliateCta slug="guangsuyun" />

---

## 十八、常见问题（使用教程高频 FAQ）

### 第一次接触第三方代理客户端，应该按什么顺序完成配置？

建议遵循五步标准顺序：第一步先做系统时间同步并确认所购机场是否提供通用订阅链接；第二步核对设备 CPU 架构下载匹配的客户端；第三步将订阅链接导入客户端并拉取节点列表；第四步在规则（Rule）模式下开启系统代理；第五步通过真连接延迟、国内外 IP 分流和 DNS 出口三项检查确认生效。已能正常上网时无需盲目折腾高级 TUN 或自定义 DNS 参数。

### 购买了只有专属客户端的机场，还能套用这里的 Clash 或 Shadowrocket 教程吗？

不能。如果服务商不提供第三方通用订阅链接（例如飞猫云、无忧链接 2026-10 起、Firefly 2026-10 起、灵猫网络 2026-10 起、SOGO云、闪跃、全球云、隐形人等在品牌资料中均标注仅走官方专属客户端），你将无法导出标准 YAML 或节点列表用于 Clash Verge Rev、v2rayN、Shadowrocket 或 OpenWrt 软路由，只能使用其官方 App 内置的开关。

### 为什么很多网络教程一上来就教修改系统网卡 DNS 或关闭防火墙，而本站将其标为高风险操作？

直接修改操作系统物理网卡的静态 DNS、强删虚拟网卡驱动或更改路由器防火墙，一旦配置失误或代理软件退出，会直接造成“不开代理也彻底打不开国内网页”的连锁断网；而关闭系统防火墙或 Windows Defender 更会让设备暴露在恶意木马风险下。因此本站坚持先做低风险检查，且任何涉及底层网络栈的改动必须附带可逆的回滚步骤。

### Windows 和 macOS 安装包里的 x64、arm64、Intel 和 Apple Silicon 应该怎么选？

Windows 绝大多数台式机与传统笔记本应选择 x64（或标为 amd64 / x86_64）版本，仅搭载高通骁龙处理器的 Surface 等设备选 arm64；macOS 请点击左上角苹果图标查看“关于本机”，搭载 M1、M2、M3、M4 芯片的 Mac 必须选择 Apple Silicon（arm64 / aarch64）安装包，2020 年以前搭载英特尔处理器的旧款 Mac 选择 Intel（x64）安装包。

### 为什么我把订阅链接粘贴进客户端后提示解析失败或没有显示任何节点？

最常见的原因有三个：一是订阅格式与客户端内核不匹配，例如把 Clash YAML 格式链接直接粘贴进原生 sing-box 客户端，或把含 VLESS/Hysteria 2 的订阅导入仅支持旧版 Shadowsocks 的软件；二是客户端拉取订阅时发送的 User-Agent 被机场面板拦截或返回了 HTTP 200 空内容；三是误把机场官网浏览器登录地址当成了订阅 URL。

### 代理模式里的规则（Rule）、全局（Global）和直连（Direct）有什么区别，平时该用哪一个？

日常 95% 以上的时间都应固定使用规则（Rule / 配置）模式，它会自动让国内网站走本地宽带直连、海外受阻网站走代理节点；全局（Global）模式会强制将包括微信、B站、网银在内的所有流量全部绕行海外单一节点，仅用于临时排查某冷门海外网站是否漏分流；直连（Direct）模式则完全暂停代理转发，用于 5 秒内测试本地宽带本身是否正常。

### 什么时候只需要开系统代理（System Proxy），什么时候才必须开启 TUN 虚拟网卡模式？

如果你平时主要使用 Chrome、Edge、Safari 等浏览器上网、看 YouTube 或在网页端使用 ChatGPT，开启低风险的“系统代理”就完全够用。只有当你需要代理不遵守系统代理设置的软件（例如终端命令行 git/curl/docker、独立桌面客户端、Cursor/VS Code 插件进程或 PC 外服游戏）时，才需要授权并开启 TUN 虚拟网卡模式。

### 开启 TUN 模式或修改 DNS 后出现全网断连、微信掉线或局域网打印机失联，怎么快速回滚？

请按三步执行 30 秒紧急回滚：第一步在代理客户端界面立即关闭 TUN 模式开关和系统代理开关；第二步若仍断网，进入系统网络连接设置禁用或卸载残留的虚拟网卡（如 Meta / wintun），并将物理网卡 IPv4 的 DNS 改回“自动获得 DNS 服务器地址”；第三步在终端执行 ipconfig /flushdns（Windows）或 killall -HUP mDNSResponder（macOS）刷新解析缓存。

### 为什么使用 ChatGPT、Claude 或 Gemini 时，不建议将节点策略组设为“自动选择（URLTest）”？

自动选择（URLTest）策略组会每隔几分钟对组内所有节点测速，并自动切换到当下延迟最低的那条节点。这不仅可能误选中香港原生节点（导致 OpenAI/Gemini 触发地区封锁）或 5x 高倍率节点（导致流量暴增），还会使你的出口 IP 在不同国家和机房之间频繁跳变，极易触发 Anthropic（Claude）与 OpenAI 的异地登录风控甚至直接封禁账号。

### 可以使用网上的免费“在线订阅转换网站”把通用订阅转成 Clash 或小火箭格式吗？

强烈不建议。你的机场订阅链接中包含唯一的身份鉴权 Token，一旦粘贴到不知名的第三方公开在线转换网站，该网站后台日志就能直接截获并保存你的完整订阅地址，导致套餐流量在几天内被他人盗刷耗尽。如需转换格式，应优先使用机场官方后台自带的多格式订阅按钮，或在支持多格式自动识别的本地开源客户端（如 Clash Verge Rev、Hiddify、Karing）中直接导入。

### 家里软路由已经装了 OpenClash 或 PassWall2，电脑和手机上还需要同时打开代理客户端吗？

不需要，且严禁同时开启。当局域网主路由或旁路由（OpenWrt）已经通过透明代理接管了全屋设备流量时，如果局域网内的电脑或手机又打开了 Clash Verge Rev 或小火箭，就会形成“代理套代理（Proxy-over-Proxy）”的双层加密环路，不仅导致 TLS 握手延迟翻倍、网速暴跌，还会引发 Fake-IP 二次解析死锁。连接软路由 Wi-Fi 时应关闭单机代理软件。
