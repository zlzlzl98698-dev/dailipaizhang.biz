---
title: 机场订阅教程：Base64、Clash YAML 与 sing-box 格式原理、专属端限制与安全导入
description: 深度解析机场订阅链接工作机制、Base64/Clash YAML/sing-box JSON 三大格式差异、专属客户端无订阅限制清单、User-Agent 识别与更新间隔设定，以及防 Token 泄露和断连回滚方案。
pillar: guides
primaryKeyword: 机场订阅教程
intent: informational
publishedAt: 2026-11-23
updatedAt: 2026-11-23
schemaType: TechArticle
breadcrumbs:
  - text: 首页
    link: /
  - text: 使用教程
    link: /guides/
  - text: 机场订阅教程
    link: /guides/subscriptions/
faq:
  - q: 为什么复制同一条订阅链接到不同客户端，导入后的节点数量或协议类型不一样？
    a: 因为主流机场面板会根据客户端发送的 User-Agent 请求头自动识别内核能力，并返回对应格式或过滤不兼容协议。例如请求头识别为旧版 Clash 时会过滤 VLESS 与 Hysteria 2 节点，而识别为 clash.meta 或 mihomo 时则会下发完整的现代协议配置。
  - q: 买了某些机场套餐后，后台为什么找不到任何 Clash 或 Shadowrocket 订阅链接？
    a: 这是服务商交付体制决定的。根据站内品牌数据库核查，飞猫云、无忧链接（2026年10月起）、Firefly（2026年10月起）、灵猫网络（2026年10月起）、SOGO云、闪跃、全球云、隐形人等品牌采用纯专属客户端模式，节点封装在官方 App 登录态中，不提供第三方通用订阅链接。
  - q: 订阅导入报错时，可以把私人订阅链接放到网上的公开订阅转换网站试试吗？
    a: 强烈不建议。公开在线订阅转换站会由第三方服务器代你请求原始订阅地址，后台日志可直接截留包含账户鉴权 Token 的完整 URL，导致套餐流量被他人盗刷甚至触发异地封号。应优先使用机场官网自带的分格式参数，或在支持多格式本地解析的客户端中直接导入。
  - q: 为什么建议把客户端订阅自动更新间隔设为 24 小时以上，而不是每 15 分钟更新一次？
    a: 高频拉取订阅会让多台设备在短时间内反复向机场面板发送请求，极易触发前端 Cloudflare 或 WAF 的防刷拦截规则，导致本地公网 IP 被封禁并返回 HTTP 403 或 429 报错。日常将自动更新间隔设为 1440 分钟至 4320 分钟，仅在节点批量超时或收到变更公告时手动更新即可。
  - q: 更新订阅时一直提示超时、TLS 证书错误或卡死，为什么必须先关闭系统代理再更新？
    a: 更新订阅本身是一次标准的 HTTPS 请求。如果客户端当前处于系统代理开启状态，且上一次选中的节点已经全部失效，那么拉取新订阅的请求也会被送入故障节点通道导致死循环超时。更新订阅前必须先关闭系统代理和 TUN 开关，确保通过本地直连宽带拉取配置。
  - q: 机场更换了订阅域名或需要挂载两家机场订阅时，怎么防止丢失自己写好的本地分流规则？
    a: 不要直接修改订阅原始文件。在 Clash 系客户端中应把自定义规则放在独立的 Merge 覆写或 Script 脚本里，更换订阅域名时直接在订阅卡片的设置项中替换 URL 后点击更新即可保留覆写；若需合并多家机场，可通过 proxy-providers 挂载多条远程订阅并由本地主配置统一引用。
  - q: 不小心将订阅链接发到了群里截图，或导入可疑转换站导致流量异常减少，应该按什么顺序止损？
    a: 第一步先在本地设备卸载或停用任何来源不明的第三方可疑程序，并用正规安全软件扫描；第二步立即登录机场官网控制面板点击重置订阅链接使旧 Token 立即作废，并同步修改账号密码；第三步删除所有设备上的旧订阅卡片并重新导入新链接。
---

# 机场订阅教程：三大格式原理、专属端限制与安全导入全流程

> **核心结论（Answer-First）**：**机场订阅链接**本质上是一条携带用户身份鉴权 Token 的远程配置接口，客户端通过向该地址发起 HTTPS GET 请求来获取最新的服务器节点、传输协议参数与规则模板。市面通用订阅分为 **Base64 节点列表**、**Clash YAML 配置文件** 与 **sing-box JSON 配置** 三大体系。导入前务必先核对服务商是否开放第三方订阅——若属于 **「仅专属客户端（不提供订阅链接）」** 品牌，则无法导入 Clash Verge Rev、v2rayN 或 Shadowrocket；导入与更新全程必须在 **「关闭故障代理、校对本地时间、绝不泄露 Token 至陌生在线转换站」** 的安全前提下操作。

本教程属于 [代理客户端使用教程中心](/guides/) 的核心准备环节，建议先完成系统校时与客户端选型后再按以下步骤逐项核对。

---

## 一、三大主流订阅格式底层原理与差异对照

很多用户把同一条订阅链接粘进不同客户端时，经常遇到 `yaml: unmarshal errors`、`invalid json` 或导入后只有节点没有规则的情况。根本原因在于不同代理内核能够解析的 **「报文数据结构」** 完全不同。

| 对比维度 | Base64 通用节点订阅 | Clash / Mihomo YAML 配置 | sing-box JSON 配置 |
| :--- | :--- | :--- | :--- |
| **原始报文形态** | 一整段无换行或按行编码的 Base64 纯文本字符串 | 严格依靠两格空格缩进的 YAML 文本配置树 | 严格遵守双引号与大括号语法的 JSON 对象 |
| **解码后的核心字段** | 逐行排列的 `vless://`、`vmess://`、`ss://`、`trojan://`、`hysteria2://` URI 串 | `mixed-port`、`dns`、`proxies`、`proxy-groups`、`rules`、`rule-providers` | `log`、`dns`、`inbounds`、`outbounds`、`route` |
| **是否内置分流规则** | **不包含**（仅含节点列表，分流由客户端本地自带规则接管） | **完整包含**（由机场面板预编排好地区组、AI 组与国内外规则） | **完整包含**（适配现代 sing-box 路由规则集与 DNS 分流） |
| **流量与到期头解析** | 依赖响应头 `Subscription-Userinfo`（部分面板支持） | 支持通过响应头解析已用流量、总流量与到期时间戳 | 支持在客户端卡片解析 `Subscription-Userinfo` 状态 |
| **典型兼容客户端** | [v2rayN](/clients/v2rayn/)、v2rayNG、[Shadowrocket](/clients/shadowrocket/)、Streisand、Hiddify、Karing | [Clash Verge Rev](/clients/clash-verge/)、FlClash、[Clash Meta for Android](/clients/clash-meta/)、Clash Mi、Stash、OpenClash、Nikki | [sing-box 官方客户端 (SFA/SFI/SFM)](/clients/sing-box/)、Hiddify、Karing、HomeProxy |
| **最常见误用报错** | 强行喂给仅吃 YAML 的 Clash 内核会报 YAML 反序列化失败 | 喂给原版已停更 Clash 内核遇到 VLESS/Hysteria2 会直接拒载 | 把 Clash YAML 喂给原生 sing-box 会提示 JSON 解析报错 |

### 三种格式的报文机制拆解

1. **Base64 通用节点表的工作方式**：
   服务器把每一台落地节点的协议类型、地址、端口、UUID 或密码以及 TLS SNI 参数拼接成标准 URI 链接，再用换行符连接后统一执行 Base64 编码输出。它的优势是体积小、跨早期工具兼容性高；缺点是不带分流规则与策略组。当你把它导入 **v2rayN** 或 **Shadowrocket** 时，客户端会自己套用本地内置的绕过大陆规则，或者需要你额外导入第三方规则文件（如 Shadowrocket 排障见 [Shadowrocket 导入与规则排查](/troubleshooting/articles/shadowrocket-import-rules)）。
2. **Clash / Mihomo YAML 配置的工作方式**：
   机场后端读取一套预设模板，把你的节点列表填入 `proxies` 区块，再自动生成 `proxy-groups`（如自动测速、手动选点、AI 专用组）与 `rules` 路由表，最后整合成一份 YAML 文档下发。由于早期原版 Clash 内核早已停止维护，现代多协议节点（如 `VLESS-Reality`、`Hysteria 2`、`AnyTLS`）均依赖 **[Mihomo 内核](/clients/mihomo/)** 解析，强行使用旧内核会触发字段不识别报错。
3. **sing-box JSON 配置的工作方式**：
   sing-box 采用与 Clash 完全独立的 JSON 结构，`outbounds` 对应节点与策略组，`route` 与 `rule_set` 对应分流规则，`dns` 负责解析路由。原生客户端（SFA / SFI / SFM）对 JSON 校验极为严格，哪怕多了一个尾随逗号都会拒绝加载；而 **Hiddify** 与 **Karing** 等新一代跨平台客户端则具备自动识别多种格式并内部转换的能力，对新手更为友好。

---

## 二、常见“后台找不到订阅链接”原因：专属客户端限制清单

在排查“为什么导入失败”之前，必须先核实一个前提：**你购买的服务商到底提不提供通用订阅 URL**。根据站内 `data/brands.json` 对 31 家机场品牌资料的交叉核查，服务商在客户端开放策略上分为以下三大阵营（完整档案可随时查阅 [品牌数据库客户端兼容性矩阵](/brands/directory/)）：

| 交付体制分类 | 后台是否提供通用订阅 URL | 能否导入 Clash / 小火箭 / 软路由 | 站内品牌档案核查名单（据 `data/brands.json`） |
| :--- | :--- | :--- | :--- |
| **A 类：纯专属客户端（无订阅链接）** | **不提供**（直接输入官网注册账号密码在专属 App 内登录） | **不能**（第三方通用客户端与 OpenWrt 无法直接导入） | [飞猫云](/brands/feimao/)、[无忧链接](/brands/wuyou/)（正文载 2026 年 10 月起改用专属端）、[Firefly](/brands/firefly/)（2026 年 10 月起不提供订阅链接）、[灵猫网络](/brands/lingmao/)（2026 年 10 月起不提供订阅链接）、[SOGO云](/brands/sogo/)（自研端含软路由方案，不提供订阅）、[闪跃](/brands/shanyue/)、[全球云](/brands/quanqiu/)、[隐形人](/brands/yinxingren/) |
| **B 类：双模式兼容（自研端 + 通用订阅）** | **提供**（既有官方面板一键登录客户端，也保留订阅复制入口） | **可以**（同时满足新手免配置与进阶自定义分流） | [光速云](/brands/guangsuyun/)、[二猫云](/brands/ermao/)、[极连云](/brands/jilian/)、[光年梯](/brands/guangnian/)、[速界](/brands/sujie/)、[梯子云](/brands/tiziyun/)、[闪电鼠](/brands/shandianshu/)、[大佬云](/brands/dalaoyun/)、[云界线](/brands/yunjiexian/)、[榴莲云](/brands/liulianyun/)、[神行加速](/brands/shenxing/)、[环球梯](/brands/huanqiuti/) |
| **C 类：标准第三方通用订阅为主** | **提供**（用户自行安装主流第三方客户端导入） | **可以**（需注意核对具体协议是否匹配客户端内核） | [微风网络](/brands/weifeng/)、[星岛梦](/brands/xingdaomeng/)、[唯兔云](/brands/weitu/)、[U1S1](/brands/u1s1/)、[一翻云](/brands/yifan/)、[可信云](/brands/kexin/)（部分品牌具体兼容明细仍标注待核实） |

> [!IMPORTANT]
> 如果你需要在 OpenWrt 软路由（如 OpenClash、PassWall2、Nikki、HomeProxy）或 iOS 的 Shadowrocket 中精细管理 AI 与流媒体分流，购买前务必避开 A 类纯专属客户端品牌。若已购买此类服务，请直接按照其官网说明下载对应平台的官方客户端登录使用，无需继续寻找或强行提取不存在的订阅 URL。

---

## 三、全平台通用客户端标准导入步骤（低风险实操）

为了避免把旧代理残留带进新配置、或误复制推广网址，请严格按照 **「先断代理 -> 校时 -> 精准复制 -> 选端导入 -> 核对节点」** 五步法执行。以下所有示例订阅地址均已做严格脱敏处理，实际操作时请从本人机场控制台复制真实地址：

```text
https://sub.example.invalid/api/v1/client/subscribe?token=REDACTED
```

### 第一步：导入前的两项零成本前置检查
1. **关闭当前代理与 TUN 开关**：更新订阅是一次普通的 HTTPS 请求。如果此时软件里还开着“系统代理”或“TUN 模式”且旧节点已全部失效，客户端请求新订阅的流量会被自己送进坏节点导致卡死或 `TLS timeout`。**务必先关闭系统代理与 TUN 再点更新**。
2. **核对系统时间与链接格式**：如果本机系统时间偏差超过 60 秒，HTTPS 握手会直接报证书失效错误（见 [时间不同步校准指南](/troubleshooting/articles/time-sync-tls-cert-error)）。同时确认你复制的是仪表盘“订阅中心”内的订阅 URL，而不是浏览器登录首页地址，且链接首尾没有误带全角空格、中文逗号或换行符。

### 第二步：各主流客户端实操导入路径

1. **Clash Verge Rev / FlClash / Clash Mi（Windows / macOS / Linux）**：
   - 打开软件左侧 **「订阅（Profiles）」** 面板。
   - 在顶部 URL 输入框粘贴脱敏格式类似 `https://sub.example.invalid/api/v1/client/subscribe?token=REDACTED` 的订阅链接。
   - 点击右侧 **「导入（Import）」**，等待几秒后观察下方是否生成新的配置卡片并显示可用流量与到期时间。
   - **关键动作**：点击刚导入的卡片使其高亮选中（激活生效），再切回 **「代理（Proxies）」** 页面确认节点列表已正常加载。
2. **v2rayN（Windows / macOS / Linux）**：
   - 在顶部菜单点击 **「订阅分组」 -> 「订阅分组设置」** -> 点击 **「添加」**。
   - 填写自定义备注名，在 **「可选地址（Url）」** 粘贴订阅链接后点击确定保存。
   - 回到主界面，在菜单栏点击 **「订阅分组」 -> 「更新全部订阅（不通过代理）」**——注意这里优先选“不通过代理”，除非本地网络屏蔽了订阅域名且你当前已有另一条正常代理在运行。
3. **Shadowrocket 小火箭（iPhone / iPad）**：
   - 确保当前未开启其他冲突 VPN。打开 Shadowrocket，点击右上角 **`+` 号**。
   - 第一行“类型”保持为 **`Subscribe`**，在“URL”栏粘贴机场订阅链接，填写备注并点击右上角 **「完成」**。
   - 若未自动刷新，在节点列表页按住“订阅”分组名称向左滑动点击“更新”，或在 `设置 -> 订阅` 中开启“打开时更新”。
   - 若需要使用机场预设分流规则而不仅是节点列表，请确认机场支持并下发适配模块，或在首页“全局路由”选择 **「配置（Config）」**。
4. **Clash Meta for Android / v2rayNG（Android）**：
   - **CMA**：进入 `配置 -> 右上角 + 号 -> 从 URL 导入`，输入名称与订阅链接，点击右上角保存图标后，**返回“配置”页单选勾选该配置** 使其生效。
   - **v2rayNG**：点击左上角菜单 -> `订阅分组设置 -> 右上角 + 号` 添加 URL 并保存，返回主页点击右上角三点菜单选择 **「更新订阅」**。
5. **sing-box 官方客户端（SFA / SFI / SFM）与 Hiddify / Karing**：
   - **sing-box 官方端**：由于原生客户端吃的是 `JSON` 结构，必须在后台复制标注为 `sing-box` 专用的订阅链接（或带 `&flag=sing-box` 参数的链接，视服务商面板支持而定）。在 `Profiles -> New Profile` 选择 `Type: Remote` 填入 URL。
   - **Hiddify / Karing**：这两个客户端内置了跨格式兼容解析器，进入 `添加配置 / 从剪贴板导入` 后即可自动识别 Base64 或 Clash 订阅并转换生成本地运行视图。

---

## 四、订阅参数、`User-Agent` 识别机制与更新维护规范

许多用户困惑：“为什么同一个订阅地址，我复制给朋友的小火箭能用，我自己导入 Clash 却报错？或者在 A 软件里看到 60 个节点，在 B 软件里只剩 30 个？”答案全在 **URL 查询参数** 与 **HTTP 请求头 `User-Agent`** 中。

### 1. 服务商面板的 `User-Agent` 动态适配机制
主流机场后台（如 V2Board、SSPanel、Xboard 等架构）接到客户端请求时，会读取请求头里的 `User-Agent` 字符串来判断对方是什么内核：
- 当检测到 `clash.meta`、`mihomo`、`ClashVerge`、`FlClash` 时，面板确认客户端具备现代内核能力，会下发完整 YAML 并放行 **`VLESS-Reality`、`Hysteria 2`、`AnyTLS`** 等现代协议节点。
- 当检测到旧版 `ClashForWindows` 或普通浏览器 UA（如 `Mozilla/5.0`）时，部分面板为了防止旧内核崩溃，会主动剔除新协议节点，甚至直接返回 Base64 节点串或网页说明。
- **排障技巧**：如果你在 Clash Verge Rev 里导入后发现节点少了一半或缺失新协议，可右键订阅卡片 -> **「编辑信息（Edit Info）」** -> 将 `User-Agent` 手动强制改为 `clash.meta`（或 `mihomo`），保存后再点击一次更新订阅即可验证（详见 [同一订阅跨端表现不一致排查](/troubleshooting/articles/cross-client-inconsistency)）。

### 2. 查询参数 `?flag=` 与本地客户端识别
部分机场会在基础地址末尾通过参数指定输出格式，例如脱敏示例：
- Clash / Mihomo 格式：`https://sub.example.invalid/api/v1/client/subscribe?token=REDACTED&flag=meta`
- sing-box 格式：`https://sub.example.invalid/api/v1/client/subscribe?token=REDACTED&flag=sing-box`
- 通用节点格式：`https://sub.example.invalid/api/v1/client/subscribe?token=REDACTED&flag=v2rayn`

注意：不同机场面板支持的参数名并不统一（有的用 `flag=`，有的用 `target=` 或直接靠 UA 识别），切勿自己瞎编参数拼接，而应直接从机场官网控制台对应客户端按钮复制。

### 3. 自动更新间隔设定：为什么别设太短？
在客户端编辑订阅属性时，通常会看到“更新间隔（Update Interval）”选项：
- **错误做法**：设为 `15 分钟`、`30 分钟` 或 `60 分钟`。如果你同时在电脑、手机、平板和软路由上挂着同一个订阅，每小时高频请求极易触发服务商前端 Cloudflare 或 WAF 的频率限制，导致你的家庭宽带公网 IP 被临时拉黑并弹出 **`HTTP 403 Forbidden`** 或 **`HTTP 429 Too Many Requests`**。
- **推荐做法**：日常设置为 **`1440 分钟（24 小时）` 至 `4320 分钟（72 小时）`** 即可，既能同步节点 IP 变更，又不会触发风控。遇到机场临时公告换域名或大面积维护时，再手动点一次更新。

### 4. `proxy-providers` 多订阅合并与更换域名保规则技巧
- **更换订阅域名不丢本地规则**：如果你使用了 [Clash 配置指南](/guides/clash-setup/) 中推荐的 `Merge` 覆写或 `Script` 脚本来管理个人分流，当机场因域名被污染更换新订阅地址时，**不需要删除重建整个 Profile**。只需右键现有订阅卡片 -> `编辑信息` -> 替换新的 URL 并保存更新，所有附加在外部的覆写规则都会原封不动地继续生效。
- **同时挂载两家机场订阅**：如果你手里同时拥有主力机场和备用机场，不要把两份 YAML 硬拼到一个文件里。在 Mihomo 内核中可以通过 `proxy-providers`（代理集合）声明两个远程订阅源，并由本地主配置文件中的 `proxy-groups` 统一引用，实现跨服务商故障转移与按节点名正则筛选。

### 5. 只读检查命令：安全核验订阅响应头与格式（不暴露真实 Token）
当你怀疑订阅链接返回了空内容、HTML 登录页或格式错乱时，可以在终端使用只读命令仅查看响应状态码和前几行结构（切记操作时只针对脱敏或自己的本机临时检查，不要把带真实 Token 的命令历史截图发给任何人）。

```powershell
# OS: Windows (PowerShell)
# 目的: 只读检查脱敏占位 URL 结构与本地代理端口监听是否会干扰直连拉取
# 风险: 无修改风险；实际排查自己订阅时请勿把含真实 Token 的终端窗口截图外传
Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings" | Select-Object ProxyEnable, ProxyServer
```
**输出解读**：如果看到 `ProxyEnable` 为 `1` 且 `ProxyServer` 指向本地旧代理端口（如 `127.0.0.1:7897`），但你的代理软件此时已经断连或还没配置好，就解释了为什么点击更新订阅会一直超时——请先关闭系统代理后再拉取订阅。

```bash
# OS: macOS / Linux (Terminal)
# 目的: 只读测试远程订阅接口连通性与 User-Agent 响应头类型（使用脱敏示例地址演示参数结构）
# 风险: 只读 HTTP HEAD/GET 探测；运行真实地址后请及时清理 shell 历史记录中的敏感参数
curl -I -A "clash.meta" "https://sub.example.invalid/api/v1/client/subscribe?token=REDACTED"
```
**输出解读**：观察返回的 HTTP 状态码与 `content-type`、`subscription-userinfo` 字段。若返回 `200 OK` 但内容长度为 `0`（`content-length: 0`），说明后端因套餐到期、流量耗尽或异地并发封禁返回了空白配置；若返回 `text/html`，则说明你复制的是网页登录页地址或触发了防火墙人机验证页面，导致客户端 YAML 解析必然崩溃。

---

## 五、订阅 Token 防泄露红线与在线订阅转换安全警示

> [!CAUTION]
> **最高安全警示：订阅链接 = 你的账号节点密码，绝不能交给陌生第三方！**
> 1. **严禁使用来历不明的公开“在线订阅转换网站”**：在线转换的原理是把包含你真实身份 `token` 的订阅 URL 发送给对方服务器，由对方服务器代你向机场拉取节点后再转换成目标格式。一旦对方站点后台开启请求日志记录或存在恶意收集行为，你的真实订阅就会被永久截留，轻则几天内数百 GB 流量被陌生人白嫖耗尽，重则因为并发 IP 过多导致账号被机场封禁。
> 2. **严禁在论坛/工单公开截图中保留完整订阅链接**：求助时必须将 `?token=` 之后的所有字符抹除或替换为 `REDACTED`（详见 [账号与订阅安全指南](/security/account-security/)）。
> 3. **严禁为了运行未知来源工具而关闭 Windows Defender 或第三方杀毒软件**：正经开源代理客户端不需要通过关闭系统杀毒软件来解决订阅拉取问题。

### 如何安全地解决“格式不兼容”问题？
1. **优先渠道（零风险）**：登录机场官方控制面板，查看是否有官方自带的 Clash / Shadowrocket / sing-box / v2rayN 分格式按钮或参数说明。
2. **原生多格式客户端替代（低风险）**：如果机场只提供 Base64 或 Clash 格式，而你不想折腾转换后端，可直接选用本身兼容多种订阅格式并能在本地完成解析的客户端（如 **Clash Verge Rev**、**Hiddify**、**Karing**）。
3. **本地自建隔离转换（进阶零泄露方案）**：对于确需将 Base64 转为定制 YAML 的进阶用户，应在自己本地电脑或私有局域网容器内运行开源的转换服务，只在本机回环地址 `127.0.0.1` 调用转换，绝不把私人订阅发送至公网陌生服务器。

### 高风险操作场景与标准化回滚步骤
虽然常规导入订阅属于低风险操作，但 **「覆盖原有稳定 Profile」、「导入来源不明的远程完整 YAML（含恶意规则/DNS 劫持）」、「Token 疑似泄露后未按顺序止损」** 会导致断网或流量被盗。一旦发生异常，请按以下标准步骤回滚：

1. **订阅覆盖导致原配置损坏或内核报错的回滚**：
   - 在客户端“订阅”列表中，**删除刚刚导入报错的故障配置卡片**，重新点选此前保留的正常备份 Profile 激活并重启内核。
   - 若直接修改了唯一订阅的 `User-Agent` 或 URL 参数导致全部节点消失，右键卡片清空自定义 `User-Agent` 并恢复官网原始订阅地址（注意先关系统代理再刷新）。
2. **怀疑订阅 Token 泄露或导入过恶意第三方转换站的 4 步止损回滚**：
   - **第一步（先清本地隐患）**：如果曾运行过仿冒客户端（例如 Google Play 上被第三方控制的同名 NekoBox）或陌生转换脚本，**先卸载可疑应用并用系统安全软件完成全盘查杀**。切记不要在恶意软件还在运行时去重置订阅，否则新链接会立刻再次被窃取。
   - **第二步（后台重置 Token）**：登录机场官网控制面板，找到 **「重置订阅链接 / Reset Subscription Token」** 按钮立即点击重置，使泄露的旧链接瞬间作废，同时修改账户登录密码。
   - **第三步（全设备清理旧链）**：把手机、电脑、软路由上保存的失效旧订阅彻底删除，避免定时任务继续拿作废 Token 反复请求触发 `401/403` 风控。
   - **第四步（安全设备重导）**：仅在经过官方渠道核实的客户端中重新粘贴新生成的订阅 URL，观察 24 小时后台流量扣费是否恢复正常。

---

## 六、订阅导入失败常见状态码与排障入口直达

当更新或导入订阅报错时，可根据错误提示直接对照下表定位根因并跳转对应排障专文：

| 你看到的报错表现 | 最可能的根因 | 立即执行的低风险动作 | 对应排障专文直达 |
| :--- | :--- | :--- | :--- |
| **提示 `HTTP 200` 但节点列表为 0** | 套餐已过期/流量耗尽、触发异地多 IP 封禁、或 `User-Agent` 过滤了全部节点 | 登录官网核查剩余流量与到期日；尝试把 UA 改为 `clash.meta` 后重试 | [订阅返回 HTTP 200 但 0 字节空白排查](/troubleshooting/articles/sub-http-200-empty) |
| **弹出 `401 / 403 / 404 / 503`** | `401` Token 已重置；`403` 高频刷新触发 WAF；`404` 订阅域名已更换；`503` 面板维护 | 停用短间隔自动更新，登录最新官网重新复制有效订阅链接 | [更新订阅失败 401/403/404/503 排查](/troubleshooting/articles/sub-http-401-403-404-503) |
| **提示 `TLS 错误` 或 `连接超时`** | 本机系统时间偏差超 60 秒、开着坏代理更新订阅、或订阅域名被本地 DNS 干扰 | **先关闭系统代理与 TUN**，校准系统时间后重试更新 | [更新订阅提示 TLS 错误与 DNS 超时排查](/troubleshooting/articles/sub-tls-dns-timeout) |
| **不同端导入节点数量不一致** | 客户端发送的 `User-Agent` 不同，或旧内核无法识别 VLESS/Hysteria 2 | 核实客户端内核是否为 Mihomo/sing-box/Xray 新版，统一指定 UA | [同一订阅跨端表现不一致排查](/troubleshooting/articles/cross-client-inconsistency) |
| **本地旧节点全挂但后台正常** | 本地一直没更新过订阅，节点入口 IP 已下线变更但仍在使用过时缓存 | 关代理后手动点一次更新订阅，区分流量耗尽与配置过时 | [套餐到期、流量耗尽与旧配置过时区分](/troubleshooting/articles/quota-expired-vs-stale-config) |
| **导入后提示 YAML 语法解析失败** | 误把 Base64 链或 HTML 登录页当成了 Clash YAML 导入 | 用文本检查或更换对应格式参数，避免直接导入网页网址 | [Mihomo 核心启动失败与 YAML 报错排查](/troubleshooting/articles/clash-verge-mihomo-yaml-fail) |

---

## 七、常见问题

### 为什么复制同一条订阅链接到不同客户端，导入后的节点数量或协议类型不一样？
因为主流机场面板会读取客户端发出的 `User-Agent` 请求头，针对不同内核动态生成配置文件。如果请求头暴露为旧版 Clash 或普通浏览器，后端会过滤掉 `VLESS-Reality`、`Hysteria 2` 等现代协议以防报错；当请求头为 `clash.meta` 或 `mihomo` 时，才会下发完整节点列表。遇到跨端差异可手动指定 UA 后重新拉取，并参考 [同一订阅跨端表现不一致排查](/troubleshooting/articles/cross-client-inconsistency)。

### 买了某些机场套餐后，后台为什么找不到任何 Clash 或 Shadowrocket 订阅链接？
这是服务商的交付架构策略。根据站内品牌数据库核查，包括 [飞猫云](/brands/feimao/)、[无忧链接](/brands/wuyou/)（2026 年 10 月起）、[Firefly](/brands/firefly/)（2026 年 10 月起）、[灵猫网络](/brands/lingmao/)（2026 年 10 月起）、[SOGO云](/brands/sogo/)、[闪跃](/brands/shanyue/)、[全球云](/brands/quanqiu/) 与 [隐形人](/brands/yinxingren/) 在内的多款服务均采用纯专属客户端登录模式，节点配置直接下发到官方 App 内部，不提供第三方通用订阅链接，因此无法导入 Clash Verge Rev、Shadowrocket 或 OpenWrt 软路由。

### 订阅导入报错时，可以把私人订阅链接放到网上的公开订阅转换网站试试吗？
强烈不建议。公网公开转换站是由陌生服务器代你请求机场接口，只要对方记录请求日志，就能直接拿到携带你个人 Token 的原始订阅链接，进而盗刷套餐流量并引发并发封号。安全的替代方法是使用机场官网自身提供的分格式订阅参数，或直接使用支持多种格式的本地开源客户端（如 Clash Verge Rev、Hiddify、Karing）完成解析。

### 为什么建议把客户端订阅自动更新间隔设为 24 小时以上，而不是每 15 分钟更新一次？
频繁请求订阅地址极易触发机场前端 Cloudflare 或 WAF 的频率风控，尤其当你家里手机、电脑、平板多设备同时每隔 15 分钟刷一次时，公网 IP 会很快被拉黑并返回 `HTTP 403` 或 `429` 错误。日常将自动更新周期设为 `1440 分钟` 至 `4320 分钟` 已经足够，遇到节点调整再手动刷新即可。

### 更新订阅时一直提示超时、TLS 证书错误或卡死，为什么必须先关闭系统代理再更新？
因为拉取订阅本身需要访问机场面板服务器。如果此时你仍开启着系统代理或 TUN 模式，而当前选中的节点已经失效或过期，更新订阅的网络请求自己就会被塞进坏节点通道里无限超时。正确的动作是先彻底关闭代理开关，用本地直连网络拉取新订阅，成功后再重新打开代理。

### 机场更换了订阅域名或需要挂载两家机场订阅时，怎么防止丢失自己写好的本地分流规则？
不要直接编辑机场下发的原始订阅文件，因为每次更新都会被远端新配置全量覆盖。建议在 [Clash 配置指南](/guides/clash-setup/) 中学习使用 `Merge` 局部覆写或独立 `Script` 脚本来存放你的个人规则；更换订阅域名时只需编辑现有订阅卡片的 URL 并更新，覆写会自动重新注入；若需同时使用两家机场，可通过 `proxy-providers` 分别挂载后由主配置统一编排。

### 不小心将订阅链接发到了群里截图，或导入可疑转换站导致流量异常减少，应该按什么顺序止损？
请严格按照 **「先清理本地隐患 -> 再重置后台 Token -> 最后重新导入」** 的顺序执行：首先卸载来源不明的仿冒客户端或停用可疑脚本并做安全扫描；接着立即登录机场后台点击“重置订阅链接”让旧 Token 立刻失效，同时修改登录密码；最后删除所有正常设备上保留的失效旧订阅卡片，重新复制新链接导入。

---

## 八、下一步配置引导

- 完成订阅导入后，继续学习模式切换与策略组配置：[Clash 配置模式与策略组指南](/guides/clash-setup/)
- 需要精细分流国内应用与 ChatGPT/Claude：[分流规则配置与 AI 防误杀指南](/guides/split-routing/)
- 账号安全与敏感信息脱敏准则：[订阅 Token 泄露排查与重置步骤](/security/account-security/)
