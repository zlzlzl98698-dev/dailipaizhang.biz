---
title: 代理与客户端故障排查总库：分流诊断与错误码定位
description: 涵盖机场订阅失败、节点全超时、能连上打不开网页、TUN 无效、DNS 污染与 Fake-IP 冲突的交互式排障分流器、五层链路诊断与 24 篇实操故障树总索引。
pillar: troubleshooting
primaryKeyword: 代理故障排查
intent: troubleshooting
collectionPage: true
publishedAt: '2026-11-23'
updatedAt: '2026-11-23'
breadcrumbs:
  - text: 首页
    link: /
  - text: 故障排查
    link: /troubleshooting/
itemList:
  - name: 节点全超时排查
    url: /troubleshooting/timeout/
  - name: 订阅更新失败
    url: /troubleshooting/subscription-failure/
  - name: 连上但打不开网页
    url: /troubleshooting/cannot-connect/
  - name: DNS 污染与泄漏
    url: /troubleshooting/dns-error/
  - name: 客户端无法启动
    url: /troubleshooting/app-not-starting/
  - name: 连接慢与高丢包
    url: /troubleshooting/slow-network/
faq:
  - q: 代理连上后部分网页打不开，但客户端测速有延迟，该从哪里查？
    a: 先不要重装软件或切换全局模式。按先低风险后高风险顺序，依次确认系统时间误差在 30 秒内、浏览器关闭安全 DNS（DoH）防绕过、系统代理端口未被其他软件占用，再判断是单节点路由异常还是本地 DNS 分流冲突。
  - q: 为什么更新订阅时提示成功或 HTTP 200，节点列表却依然是空的？
    a: HTTP 200 仅代表服务器正常应答了请求，不代表返回内容是有效节点。常见原因包括订阅链接参数与当前客户端格式不匹配（如把 Base64 节点串直接导入 Clash YAML 解析器）、套餐已过期返回提示页或空体、以及机场面板转换接口异常或该品牌仅支持专属客户端。
  - q: 排障时为什么不建议先关闭杀毒软件或把订阅链接发给陌生人？
    a: 绝大多数断连和启动报错源自时间不同步、虚拟网卡权限不足或端口冲突，关闭安全防护会引入额外风险且极少真正解决问题；而订阅链接通常内嵌账号鉴权 Token，泄露后他人可直接消耗流量或定位账号状态。
  - q: 客户端显示所有节点同时 Timeout 或 -1ms，一定是机场跑路了吗？
    a: 不一定。全节点超时最常见的本地诱因是系统时钟与标准时间偏差超过 30 至 60 秒导致 TLS 或 VLESS 握手失败，其次是基础宽带断网、套餐到期或流量耗尽、以及长期未更新订阅导致旧中转入口 IP 下线。必须先完成时间校准、直连测试与面板核对后再判断是否服务端失联。
  - q: 更新订阅时遇到 401、403、404、503 状态码分别代表什么问题？
    a: 401 与 404 通常指向订阅 Token 已重置、链接截断或路径变更，需登录面板重新复制；403 多为 Cloudflare 等防火墙拦截出口 IP 或请求头，可切换直连与代理更新对照；503 则表示源站面板临时维护或过载，稍候或换备用订阅域名即可验证。
  - q: 开启 TUN 模式后开关弹回，或者开启后整个电脑都断网了怎么处理？
    a: 开关弹回多因未安装 Service Mode 服务模式、缺少管理员或网络扩展权限，或虚拟网卡初始化失败；开启后全网断联常见于游戏加速器与企业 VPN 虚拟网卡路由冲突，或配置未开启内置 DNS。应先关闭 TUN 并恢复自动获取 DNS 回滚网络，再逐项排除冲突软件。
  - q: 为什么退出代理客户端后，连国内网站和微信都打不开了？
    a: 常见原因有两个：一是客户端异常退出未能自动清除系统代理设置，导致浏览器继续连接已关闭的本地端口并报 ERR_PROXY_CONNECTION_FAILED；二是开启过 Fake-IP 或 TUN 模式后，系统 DNS 缓存残留 198.18.0.1 记录或网卡 DNS 停留在 127.0.0.1，需关闭系统代理并刷新 DNS 缓存。
  - q: 同一个机场订阅在手机小火箭能正常连，导入电脑 Clash Verge Rev 却少节点或报错怎么办？
    a: 不同客户端发送的 User-Agent 请求头与内核支持协议集不同，部分面板会分别下发 Shadowsocks、VLESS 或 AnyTLS，旧核心会自动过滤不识别协议，个别品牌也已改为仅限专属客户端。应升级至 Mihomo 或 sing-box 活跃核心，停用覆写脚本后核对原始格式。
  - q: 为什么 Google 和 YouTube 都能正常打开，但 ChatGPT、Claude 或 Gemini 提示地区不支持？
    a: 这属于目标 AI 平台的出口 IP 风控与分流错配而非线路断连。香港节点虽延迟极低，但多份实测样本中频繁出现 OpenAI 仅限 APP 或 Gemini 失败；浏览器 Cookie 或安全 DNS 旁路也会造成跨浏览器差异。应先无痕复测，再将 AI 域名固定分流至可用日、新、美节点。
  - q: 为什么客户端测速显示几百 Mbps，但实际下载和晚高峰看视频还是很卡？
    a: 需先区分 1 MB/s 等于 8 Mbps 的单位换算及本地宽带物理上限；一键测速多为多线程并发，而网页与视频更看重单线程吞吐和端到端延迟；晚高峰中转或落地拥塞会导致高丢包。此外全节点多线程测速单次可耗十余 GB 流量，小流量包切勿频繁全量测速。
  - q: 安卓手机锁屏几分钟代理就断开，或者切换 Wi-Fi 与移动数据后假死怎么解决？
    a: 安卓依赖 VpnService 运行，系统省电策略会在锁屏后回收后台进程。应在电池设置中将客户端设为不限制优化并锁定后台卡片，切换网络假死时重开代理开关刷新隧道，同时避免下载维护停滞或存在商店接管风险的非官方安装包。
  - q: 什么情况下说明问题不在本地，应该直接联系服务商提交工单？
    a: 当完成本地直连对照、时间校准、手机热点切换、换节点与跨设备复测后，仍出现全部节点 0B 超时、账号正常却持续报 401/503、整地区长期失效或流量倍率明显错算时，即可判定服务端或账号侧异常。提单务必脱敏隐藏订阅 Token 并附错误码与关键日志。
---

# 代理与客户端故障排查总库

## 核心结论与五层排障分类路径（Answer-First）

代理故障最忌讳一上来就卸载重装、执行高风险网络栈重置或随意关闭系统安全防护。绝大多数连不上、更新订阅报错、已连接但网页打不开或晚高峰卡顿的问题，都可按**「订阅获取 → 本地时间与端口 → 系统代理/TUN 接管 → DNS 与分流 → 远端节点与线路」**五层链路在几分钟内收窄范围，并严格遵守**「先低风险只读核查、后可回滚配置变更、最后再怀疑服务端故障」**的顺序推进。

开始动手修改任何设置前，请先按你眼前最直观的现象走对应分类判断路径：

1. **软件打不开、窗口白屏、架构报错或内核加载失败**：问题停留在本地应用与运行时层，尚未进入网络链路。请直接进入[客户端无法启动专题](/troubleshooting/app-not-starting/)，优先查 WebView2、.NET 运行时、CPU 架构匹配与 YAML 覆写语法。
2. **订阅拉取报 401/403/404/503、TLS/DNS 超时或返回 200 但节点为空**：问题出在配置同步层。请直接进入[订阅更新失败专题](/troubleshooting/subscription-failure/)，依次核对套餐有效期、鉴权 Token、格式匹配、直连与代理更新开关以及服务商是否已改用专属客户端。
3. **所有节点同时 Timeout / -1ms 或个别地区测速 0B**：问题出在握手与连通层。请进入[节点全超时排查专题](/troubleshooting/timeout/)，先做国内直连测试、系统时钟 NTP 校准与手动刷新订阅，再区分单点维护与全局异常。
4. **节点测速绿字正常，但网页全部打不开、微信发图慢、内网失联或仅 AI 不可达**：问题集中在本地流量接管与域名解析层。请分别进入[连上但打不开网页专题](/troubleshooting/cannot-connect/)与[DNS 污染与泄漏专题](/troubleshooting/dns-error/)，核对监听端口、TUN 服务权限、Fake-IP 198.18.0.1 残留与分流规则。
5. **能正常访问网页，但晚高峰卡顿丢包、语音游戏断流或流量消耗异常**：问题落在传输质量与计费层。请进入[连接慢与高丢包专题](/troubleshooting/slow-network/)，拆解宽带物理上限、入口与落地分段延迟、UDP NAT 限制以及节点流量倍率。

本总库全文严格贯彻**「现象 → 可能原因 → 检查步骤 → 处理方法 → 验证结果 → 下一步」**六步诊断标准，覆盖全平台 17 项核心排障模块，并精准链接站内 6 个二级专题与全部 24 篇一线实操手册。

---

## 一、快速诊断分流入口与故障知识地图

如果你已经看到明确的 HTTP 状态码、客户端报错日志或典型症状，建议先使用下方交互式分流器按操作系统、客户端与报错特征进行筛选，直接获取低风险首选核查动作与直达指南。

<DiagnosticTriage />

如果症状尚不明确，或者需要从六大故障域整体把握定位顺序，请对照下方的**「左侧六大分类索引 + 右侧交互故障树」**逐层收窄。

<div class="ts-knowledge-map">
  <div class="ts-map-sidebar">

### 左侧：六大故障分类索引

1. **[订阅失败（HTTP 状态码与解析异常）](/troubleshooting/subscription-failure/)**
   - 适用于：导入失败、节点列表空白、HTTP 200 返回 0 字节、401/403/404/503、被重定向、TLS/DNS 超时、多客户端导入不一致。
2. **[节点超时（全绿变红与测速异常）](/troubleshooting/timeout/)**
   - 适用于：全部节点同时 Timeout、单个地区或单条线路测速 0B、套餐到期或流量耗尽误判、旧配置过期。
3. **[连接不上（已连无网与模式接管失效）](/troubleshooting/cannot-connect/)**
   - 适用于：节点已连接但网页打不开、仅 AI/个别站点不可达、TUN 开启无效、系统代理自动失效、安卓后台断连、时间差导致 TLS 失败。
4. **[DNS 错误（污染、泄漏与 Fake-IP 冲突）](/troubleshooting/dns-error/)**
   - 适用于：国内软件或微信图片加载失败、198.18.0.1 解析残留、DNS 泄漏检查不通过、浏览器 DoH 与客户端分流打架。
5. **[客户端无法启动（白屏、内核与配置报错）](/troubleshooting/app-not-starting/)**
   - 适用于：Clash Verge Rev 白屏、WebView2 缺失、Mihomo YAML 语法报错、v2rayN 无法加载 Xray/sing-box 内核、旧客户端迁移失败。
6. **[连接慢、延迟高与丢包（晚高峰与 UDP 瓶颈）](/troubleshooting/slow-network/)**
   - 适用于：晚高峰卡顿、高丢包、UDP 转发/游戏 NAT 受限、测速数字很高但网页体感慢、流量倍率扣费异常。

  </div>
  <div class="ts-map-tree">

### 右侧：交互故障树与高频报错直达

<IssueDecisionTree />

  </div>
</div>

### 高频报错特征与状态码速查总表

| 报错特征 / 常见状态码 | 首要怀疑层级 | 首选低风险动作 | 对应实操指南 |
| :--- | :--- | :--- | :--- |
| 订阅更新返回 **HTTP 200 但 0 字节 / 节点为空** | 订阅格式 / UA / 到期空体 | 查账期余量、核对格式与是否专属端 | [订阅 HTTP 200 返回 0 字节排查](/troubleshooting/articles/sub-http-200-empty) |
| 订阅更新返回 **401 / 403 / 404 / 503 / 302** | Token 失效 / WAF 拦截 / 域名变更 | 面板重复制链接、切直连与代理开关 | [更新订阅 401/403/404/503 与重定向排查](/troubleshooting/articles/sub-http-401-403-404-503) |
| 拉取订阅提示 **TLS 证书错误 / DNS 超时** | 本地时间与证书 / 域名阻断 | 校准系统时间、切热点或备用订阅域 | [订阅更新 TLS 错误与超时排查](/troubleshooting/articles/sub-tls-dns-timeout) |
| **所有节点同时 Timeout**，测速全红 `-1ms` | 时钟偏差 / 断网 / 机场全局异常 | 测国内直连、校 NTP、更新订阅查账期 | [所有节点同时超时分流排查](/troubleshooting/articles/nodes-all-timeout) |
| **个别地区节点超时** 或测速 `0B` | 节点维护 / 路由劣化 / 落地阻断 | 同区换冷门编号、刷新订阅、用 Fallback | [单节点或特定地区超时与 0B 解读](/troubleshooting/articles/nodes-partial-region-timeout) |
| 客户端显示**已连接但所有网页打不开** | 系统代理端口冲突 / 代理环路 | 核对 7890/7897/10808、关冲突扩展 | [节点已连接但网页打不开排查](/troubleshooting/articles/connected-no-internet) |
| 仅 **ChatGPT / Claude / 个别站点打不开** | 浏览器缓存与 DoH / 分流 / IP 风控 | 无痕复测、查规则误入 DIRECT、切解锁区 | [仅个别网站与 AI 工具打不开排查](/troubleshooting/articles/specific-sites-unreachable) |
| 开启 **TUN 模式后无流量或开关弹回** | 服务模式未装 / 虚拟网卡冲突 / 权限 | 装 Service Mode、退加速器、开内置 DNS | [TUN 开启无效与虚拟网卡冲突修复](/troubleshooting/articles/tun-not-working) |
| 微信发图慢、局域网连不上、`198.18.0.1` | Fake-IP 保留段冲突或残留 | 补 `fake-ip-filter`、清 DNS 缓存还原 DHCP | [Fake-IP 原理与 198.18.0.1 异常修复](/troubleshooting/articles/fake-ip-explained-fix) |
| 国内直连走海外 DNS 或海外解析泄露 | DNS 分流规则缺失 / 浏览器 DoH 旁路 | 关闭浏览器安全 DNS、分离国内外解析 | [DNS 污染、泄漏与标准分流检查](/troubleshooting/articles/dns-leak-hijack-fix) |
| Clash Verge Rev **打不开或纯白屏** | WebView2 运行时 / GPU / 残留进程 | 装 Edge WebView2、核对芯片架构 | [Clash Verge Rev 无法启动与白屏修复](/troubleshooting/articles/clash-verge-startup-fail) |
| Mihomo 核心报错 **YAML parse error** | 缩进错误 / 覆写冲突 / 协议不兼容 | 停用 Merge/Script、确认 Mihomo 内核 | [Mihomo 核心启动与 YAML 语法报错排查](/troubleshooting/articles/clash-verge-mihomo-yaml-fail) |
| v2rayN 提示 **核心文件缺失或启动失败** | 缺 .NET 运行时 / 核心路径 / 架构错配 | 补装 .NET Runtime、下完整含核心包 | [v2rayN 核心无法加载与缺运行时修复](/troubleshooting/articles/v2rayn-core-load-fail) |
| **TLS handshake / x509** 证书过期报错 | 本地系统时钟与 UTC 偏差过大 | 直连同步 NTP 时间并重启核心重握 | [系统时间不同步导致 TLS 握手失败](/troubleshooting/articles/time-sync-tls-cert-error) |

---

## 二、节点连接超时排查（单节点、特定地区与 0B 异常）

并非每一次超时都意味着整套代理环境崩溃。同一份订阅下大部分节点正常、唯独个别编号或单一地区测速为 `0B` 属于跨境基础设施的常态波动，切忌因为个别节点失效而大幅改动原本健康的客户端配置。

- **现象**：同订阅下香港、新加坡、日本等主力区域多数节点延迟正常，但你常用的某个固定编号测速显示 `0B`、`-1ms` 或 `Timeout`，或者某一地区整组速率跌落至个位数 KB/s。在本站留存的原始实测截图中，此类单点异常屡见不鲜：例如 `2026-08-11` 批次中光速云 HK 02 为 `0B/0B`、宇宙云香港 01 为 `0.00B/0.00B` 且新加坡 07 仅 `9.60KB/s`、可信云日本 07 仅 `12.61KB/s`、`2026-07-19` 微风网络台湾 02 为 `0.00B/0.00B` 且日本 05 仅 `8.00KB/s`。这些可核验证据说明，单节点瞬间失联在多条线路上都会发生。
- **可能原因**：远端该编号落地服务器正在重启、例行维护或更换出口 IP；中转入口端口已轮换而本地客户端仍缓存着过期端口映射；当前运营商到该特定地区出口发生临时路由绕路或丢包；策略组被手动死锁在单一固定节点上，没有配置自动故障转移。
- **检查步骤**：采用**「三区抽样法」**——在同一地区内手动切换至少 3 个不同编号（优先避开最拥挤的 01/02 号，抽测 05、09 等靠后编号），同时在相邻地区各测 1 个节点确认本地核心建连正常；查看日志区分 `i/o timeout`（中转入口或链路不可达）与 `EOF / connection reset`（落地重启或协议特征中断）。
- **处理方法**：在客户端手动点击一次**「更新订阅」**同步最新中转端口与解析域名；将主力策略组从手动单点切换为带健康检查的 `URL-Test`（自动低延迟）或 `Fallback`（按优先级容灾）；遇到整地区维护时临时切往延迟接近的邻近区域过渡。
- **验证结果**：同地区新编号返回绿字延迟且常规网页首屏快速加载（切忌对几十个节点反复跑下载测速消耗流量）。
- **下一步**：完整单点异常与 `0B` 解读见[单节点或特定地区超时与 0B 解读](/troubleshooting/articles/nodes-partial-region-timeout)；若刷新订阅后**全部节点**依然无一可用，请立刻转入下一节。

---

## 三、所有节点无法使用排查（全红 Timeout 与 -1ms）

客户端一键测速全部变红时，本地系统时钟偏差、宽带断网、账期到期或旧配置过期导致的全局超时，在日常排障中的发生率通常高于机场服务商整体宕机。

- **现象**：所有地区节点同时显示 `Timeout` 或 `-1ms`，切换香港、台湾、新加坡、日本、美国均无法握手；或者节点列表最上方突然出现「剩余流量 0GB / 套餐已过期 / 请续费」等文字提示节点。
- **可能原因**：本地宽带断网、Wi-Fi 未完成校园网或酒店 Captive Portal 网页认证；电脑深度休眠唤醒、Windows 与 Linux 双系统时钟基准不一致，或 OpenWrt 软路由断电重启后缺少电池维持导致 RTC 时钟重置，一旦本地时间与标准 UTC+8 偏差超过 30 至 60 秒，VLESS、Trojan、VMess 等依赖时间戳与证书有效期的 TLS 握手就会被服务端统一拒绝；套餐已经到期、当月流量提前用尽（注意区分购买日重置与每月 1 日重置的账期规则）或数月未更新订阅导致全部旧入口 IP 下线；最后才是本地宽带侧临时异常或机场入口全局故障。
- **检查步骤**：第一步彻底关闭系统代理与 TUN 开关，用浏览器直连国内常规网站确认基础宽带正常；第二步核对操作系统与路由器时间是否与标准网络时间误差在 30 秒以内；第三步通过直连或手机 4G/5G 蜂窝数据登录机场用户中心，核对套餐到期时间、剩余流量及重置日；第四步手动点击一次更新订阅，观察节点地址是否发生变化。
- **处理方法**：时间存在偏差时，在关闭代理或放行 `time.windows.com`、`ntp.aliyun.com` 直连状态下立即执行 NTP 校时，校准后必须重启代理核心使新时钟生效；账期正常但配置陈旧时拉取最新订阅覆盖旧配置；若切换手机热点后全部节点立刻恢复绿字而家庭宽带全红，则转查家庭路由器 DNS 或宽带拨号状态。
- **验证结果**：重启核心后在港、新、日三地各抽测 1 个节点，均返回正常延迟并可打开目标页面。
- **下一步**：分流细则见[所有节点同时超时分流排查](/troubleshooting/articles/nodes-all-timeout)、[系统时间不同步导致 TLS 握手失败](/troubleshooting/articles/time-sync-tls-cert-error)与[套餐到期、流量耗尽与旧配置过时区分](/troubleshooting/articles/quota-expired-vs-stale-config)；若双网络双设备且面板入口连续多日均彻底失联，转至[机场跑路识别与止损清单](/security/shutdown/)。

---

## 四、订阅链接更新失败排查（401 / 403 / 404 / 503 / 302 / TLS / DNS）

订阅拉取本质是一次携带身份鉴权参数的 HTTPS 请求，只要读懂弹窗与日志中的 HTTP 状态码和网络层错误，就能在十秒内锁定责任层级。

| 状态码 / 报错 | 核心含义 | 最常见诱因 | 首选处置动作 |
| :--- | :--- | :--- | :--- |
| **HTTP 401** | 身份鉴权失败 | 面板重置过订阅 Token、账号过期或复制漏字符 | 登录面板重新复制完整订阅链接 |
| **HTTP 403** | 请求被 WAF 拦截 | Cloudflare 拦截当前出口 IP、异常 UA 或高频刷新 | 切换「直连 / 代理更新」开关并间隔重试 |
| **HTTP 404** | 订阅路径不存在 | 面板升级改路径、旧链接废弃或粘贴混入换行空格 | 清除链接首尾空白并回面板重新复制 |
| **HTTP 503 / 502** | 源站暂不可用 | 面板后端维护、源站高负载或反代网关超时 | 查服务商公告稍候重试，或切官方备用域 |
| **HTTP 301 / 302** | 异常重定向 | 校园网/酒店认证页劫持或旧域跳转至公告登录页 | 先直连完成网络认证，换手机热点拉取对照 |
| **TLS / DNS 超时** | 握手或解析失败 | 本机时钟偏差、本地 DNS 污染或订阅域名被阻断 | 校准时间，连任意可用备用节点走代理更新 |

- **现象**：在 Clash Verge Rev、v2rayN、Shadowrocket 或 sing-box 中更新订阅时弹窗失败，日志报 `401`、`403`、`404`、`503`、`302`、`x509 certificate error`、`dial tcp: lookup ... no such host` 或 `TLS handshake timeout`。
- **可能原因**：个人订阅 Token 已被重置或复制时截断；开启了「通过代理更新订阅」但当前选中的代理节点已经失效，形成拉取死锁；处于「直连更新」时订阅域名被本地运营商单点阻断或 DNS 污染；机场源站开启严苛 WAF 拦截了部分机房出口 IP；校园网或酒店未登录认证页把 HTTPS 请求劫持重定向；本机时钟偏差导致证书校验失败。
- **检查步骤**：核对订阅地址为完整 `https://` 且无换行、中文空格或多余前缀；检查客户端当前走直连更新还是走代理更新；遇 302 跳转先用浏览器直连国内普通 HTTP 站点查看是否弹出认证页；报 TLS/DNS 错时核对本机时间与 hosts 文件。切记严守安全红线——**「绝不把带个人 Token 的完整订阅链接贴到公开群聊或未知第三方在线转换网站」**。
- **处理方法**：401/404 回面板重新复制完整新链接；403 在直连更新与代理更新之间切换对照，切忌短时间连点十几次触发限流；TLS/DNS 超时且时钟无误时，换手机 5G 热点、使用面板提供的备用订阅域名，或先连接一个仍存活的备用节点走代理完成拉取。
- **验证结果**：客户端提示订阅更新成功，配置更新时间刷新至当前时刻且节点清单完整载入。
- **下一步**：逐状态码修复见[更新订阅 401/403/404/503 与重定向排查](/troubleshooting/articles/sub-http-401-403-404-503)、[订阅更新 TLS 错误与超时排查](/troubleshooting/articles/sub-tls-dns-timeout)与[机场订阅教程](/guides/subscriptions/)。

---

## 五、订阅返回 HTTP 200 空内容与跨客户端不一致

更新提示成功且返回 `HTTP 200`，打开策略组却一个节点都没有，或者同一个订阅在手机小火箭正常、导入电脑端却缺节点或协议不同，根源通常在订阅体格式与协议下发机制。

- **现象**：拉取无报错、返回状态码 `200`，但下载文件为 0 字节、`proxies` 列表为空或报错解析失败；或者同一个机场订阅在手机 Shadowrocket / v2rayNG 上能看到几十个节点，导入电脑 Clash Verge Rev 或其他客户端后却明显少节点、甚至全部无法识别。
- **可能原因**：第一，部分面板对套餐过期或流量耗尽账号仍返回 `200` 空配置或占位提示文本；第二，订阅格式与解析器错配——标准 Clash 配置应为缩进清晰的 YAML（含 `proxies:` 与 `proxy-groups:`），v2rayN/v2rayNG 常规通用订阅多为 Base64 编码节点串，而原生 sing-box 客户端要求严格 JSON 格式，混用必然失败；第三，面板会根据客户端请求头 `User-Agent` 动态下发不同协议集，例如本站档案中光速云在 `2026-08-11` 与 `2026-08-19` 不同环境请求下分别下发了 Shadowsocks 54/62 节点与 VLESS/AnyTLS 70 节点，如果老旧客户端（如仅支持传统协议的 Potatso 或停更原版 Clash）无法解析 VLESS 与 Hysteria 2，就会静默过滤掉这些节点；第四，部分服务商已明确改为**「仅限官方专属客户端、不提供第三方订阅链接」**（资料中包括飞猫云、Firefly、无忧链接、灵猫网络、SOGO 云、闪跃、全球云、隐形人），拿面板链接硬导入第三方软件只会拉回网页 HTML 代码。
- **检查步骤**：登录用户中心核对套餐是否在有效期内，确认页面是否提供对应客户端的专属订阅按钮；核对客户端内核是否为活跃维护的 Mihomo、Xray 或 sing-box；检查订阅 URL 参数（如 `&flag=clash`）是否与当前客户端一致。
- **处理方法**：直接从服务商面板复制对应客户端类型的专用订阅，切忌轻易使用陌生公共在线转换站以免泄露 Token 并引入格式污染；若因 User-Agent 错判导致下发错误格式，在配置文件属性中调整 UA 为标准 `clash.meta` 或客户端默认值后重新拉取；若确认该品牌已彻底关闭第三方订阅接口，则在改用官方客户端与更换支持通用订阅的替代服务之间做出选择。
- **验证结果**：配置文件体积恢复正常（通常数十 KB 以上），节点列表与协议类型完整可见且可正常测速。
- **下一步**：详查见[订阅 HTTP 200 返回 0 字节排查](/troubleshooting/articles/sub-http-200-empty)、[同一订阅在不同客户端表现不一致](/troubleshooting/articles/cross-client-inconsistency)及[Shadowrocket 小火箭导入与分流故障](/troubleshooting/articles/shadowrocket-import-rules)。

---

## 六、客户端无法启动排查（Clash Verge WebView2 / Mihomo YAML / v2rayN 核心）

软件双击没反应、界面纯白屏、导入配置报语法错误或核心秒退，属于 100% 本地运行环境与配置问题，排查重点放在运行时依赖、CPU 架构、覆写脚本与软路由固件兼容性。

- **现象**：Windows 下 Clash Verge Rev 双击无反应或窗口纯白屏；macOS 弹出应用已损坏或 `Bad CPU type`；Linux AppImage 无法运行；Mihomo 核心报错 `yaml: unmarshal errors` 或 `unsupported proxy type: vless / hysteria2`；v2rayN 提示缺 `.NET Desktop Runtime` 或找不到 `xray.exe` / `sing-box.exe`；OpenWrt 软路由端安装 Nikki 或 OpenClash 后核心无法拉起。
- **可能原因**：Clash Verge Rev 依赖 Windows 的 Microsoft Edge WebView2 Runtime 与图形加速渲染，精简版系统缺失 WebView2 或驱动冲突会导致纯白屏；macOS 常见 Apple Silicon（arm64）与 Intel（x64）安装包下错；Linux 常见未赋予执行权限或架构错配；Mihomo 报 YAML 错九成源于用户自行开启了缩进错误或含废弃字段的全局 Merge/Script 覆写，或仍在用停更的原版 Clash 内核加载新协议；v2rayN 多因下载了不含 Core 的精简包、缺失对应 `.NET Desktop Runtime` 或解压至含特殊字符/只读受限目录；OpenWrt 软路由端则高度依赖固件版本与防火墙架构（iptables vs nftables/fw4），例如原始客户端资料明确提示 **Nikki 要求 OpenWrt 24.10 及以上版本**，低版本固件强装必然启动失败。
- **检查步骤**：确认安装包来源为官方开源发布渠道并核对 CPU 架构；打开任务管理器清理卡死的残留 `mihomo`、`clash-verge` 或 `xray` 后台进程；检查是否启用了自定义全局覆写脚本；软路由端核对 OpenWrt 发行版本与防火墙后端。切记**「切勿以关闭杀毒软件作为默认排障动作」**，怀疑核心文件被误杀时应核验官方哈希并查阅隔离区记录。
- **处理方法**：Clash Verge Rev 白屏先补装官方 Edge WebView2 Runtime，终止残留进程并在备份配置目录后清理损坏的窗口状态缓存；Mihomo 报 YAML 错时，先停用全部 Merge/Script 覆写验证纯净原始 Profile 能否拉起，再逐行排查自定义覆写；v2rayN 补齐 `.NET Desktop Runtime` 并使用含完整 Core 的压缩包解压至全英文可写目录；仍停留在已停更 Clash for Windows 或维护状态待核实的 Mihomo Party 的用户，先备份订阅与规则、彻底关闭旧端系统代理/TUN/自启后，再平滑迁移至 Clash Verge Rev、FlClash 或 v2rayN。
- **验证结果**：软件主界面正常显示、内核版本号正确识别、加载纯净订阅后运行稳定无报错。
- **下一步**：按端直达[Clash Verge Rev 启动与白屏修复](/troubleshooting/articles/clash-verge-startup-fail)、[Mihomo 核心与 YAML 报错排查](/troubleshooting/articles/clash-verge-mihomo-yaml-fail)、[v2rayN 核心加载与缺运行时修复](/troubleshooting/articles/v2rayn-core-load-fail)、[旧客户端安全迁移与备份](/troubleshooting/articles/client-migration-backup)以及[多平台安装指南](/guides/installation/)。

---

## 七、连接成功但打不开网页排查（已连无网与代理环路）

节点测速有绿字延迟却全网打不开，几乎都出在本地代理端口错配、代理环路或残留的系统代理开关上。

- **现象**：客户端显示已连接且节点延迟正常，但浏览器打开任何国内外网站均报 `ERR_PROXY_CONNECTION_FAILED`、`ERR_TIMED_OUT` 或持续转圈；更典型的是，退出代理软件后连国内常规网站依然彻底断网。
- **可能原因**：操作系统代理端口与客户端实际监听的 Mixed/HTTP/SOCKS 端口不一致（例如系统残留旧端端口 `7890`，而当前客户端监听在 `7897` 或 `10808`）；浏览器安装了 SwitchyOmega 等代理扩展并手动锁定了失效端口；电脑同时运行了两款代理客户端或专属客户端，互相写入系统代理并形成本地死循环环路；出站策略被误切至 `REJECT`，或在 `GLOBAL` 模式下刚好选中了一个实测 `0B` 的失效节点；客户端非正常崩溃时没来得及撤销系统代理设置。
- **检查步骤**：核对客户端首页显示的实际监听端口（区分混合端口 Mixed Port 与独立 HTTP/SOCKS 端口）和当前代理模式（Rule / Global / Direct）；打开操作系统网络代理设置，比对 `127.0.0.1` 与端口号是否完全一致；打开客户端「连接（Connections）」监控页并刷新网页，观察请求是否进入客户端、命中了哪条分流规则及落入哪个出站节点。
- **处理方法**：彻底退出所有多余的代理客户端、抓包软件与游戏加速器，确保系统只运行单一代理工具；暂时关闭浏览器代理扩展或将其切回跟随系统代理；重新关闭再开启一次客户端的系统代理开关以刷新正确端口；把模式切回「规则（Rule）」并换选有效节点；退出客户端后依然断网时，直接在操作系统代理设置中关闭「使用代理服务器」开关即可秒速恢复直连。
- **验证结果**：客户端连接日志准确记录海外走代理、国内走 `DIRECT`，网页秒开且退出软件后直连立即恢复。
- **下一步**：详查见[节点已连接但网页打不开排查](/troubleshooting/articles/connected-no-internet)与[连接不上二级专题](/troubleshooting/cannot-connect/)。

---

## 八、DNS 异常与 Fake-IP（198.18.0.1）冲突排查

DNS 解析与 Fake-IP 机制直接决定分流精度与本地软件兼容性，也是「微信发图慢、局域网 NAS 连不上、退出代理后彻底断网」的最核心根因。

- **现象**：开启代理后微信图片加载缓慢、企业内网系统或 NAS 打印机失联；在终端 `ping` 或 `nslookup` 任意域名都返回 `198.18.0.x`；关闭代理客户端后全网域名无法解析并报 `DNS_PROBE_FINISHED_NXDOMAIN`；做 DNS 泄漏检测时发现海外域名仍经由本地运营商 DNS 明文解析。
- **可能原因**：Fake-IP 通过向应用立即返回 `198.18.0.0/15` 保留测试网段的虚拟 IP 来消除解析等待耗时，但如果局域网域名（`*.lan`、`*.local`）、NTP 时间服务、STUN 穿透或强校验真实 IP 的国内应用未被纳入 `fake-ip-filter` 白名单，就会因为拿到虚拟地址而失败。当客户端异常崩溃或未正常还原配置时，系统 DNS 缓存残留的 `198.18.x.x` 或停留在 `127.0.0.1` 的物理网卡 DNS 会导致直连瘫痪。此外，Chrome 与 Edge 默认开启的浏览器内置「安全 DNS（DoH）」会直接绕过客户端本地 DNS 拦截，造成分流失效与 DNS 泄漏。
- **检查步骤**：修改任何网卡 DNS 前先记录默认 DHCP 自动获取配置以便随时回滚；终端测试域名解析确认是否落入 `198.18` 网段；检查浏览器「隐私和安全 → 安全 → 使用安全 DNS」开关状态；检查客户端配置中 `dns.enable: true` 以及国内 `nameserver` 与海外加密解析（DoH/DoT）是否已正确分离。
- **处理方法**：在配置覆写中补全 `fake-ip-filter` 白名单（纳入 `*.lan`、`*.local`、`*.msftconnecttest.com`、NTP 服务器与常用内网后缀）；若所在公司内网对 Fake-IP 存在顽固兼容冲突，可将 `enhanced-mode` 切换为 `redir-host`（真实 IP 模式）做对照；退出客户端后若因残留断网，核查网卡 DNS 恢复为自动获取并刷新系统 DNS 缓存；关闭浏览器独立 DoH，将域名解析权完整交回客户端按规则分流。
- **验证结果**：微信发图、局域网服务与海外网站同步畅通，DNS 泄漏测试符合预期，退出代理后直连无障碍。
- **下一步**：详查见[Fake-IP 原理与 198.18.0.1 异常修复](/troubleshooting/articles/fake-ip-explained-fix)、[DNS 污染、泄漏与标准分流检查](/troubleshooting/articles/dns-leak-hijack-fix)以及[DNS 与 Fake-IP 配置教程](/guides/dns-setup/)。

---

## 九、系统代理设置冲突排查（端口抢占与自动还原）

系统代理虽是最轻量低风险的桌面端接管方案，但在装过多款网络工具的电脑上极易因多程序同时改写注册表或网络配置而失效。

- **现象**：v2rayN 或 Clash Verge Rev 运行正常且测速绿字，但浏览器访问海外站点完全走直连；或刚勾选「自动配置系统代理」，数秒后状态栏自动还原为「清除系统代理」，端口号被偷偷改回其他值。
- **可能原因**：后台常驻了其他会接管系统代理的程序（如旧版代理端开机自启、机场专属客户端、抓包调试工具 Fiddler/Charles、游戏加速器或企业下发的 PAC 自动配置脚本）；浏览器代理扩展强行覆写了系统代理；v2rayN 底部路由模式被误设为「全部直连」；部分系统优化卫士拦截了注册表 `Internet Settings` 修改并自动回滚。
- **检查步骤**：核查系统托盘与开机自启清单，确保仅留当前一款代理工具；打开操作系统代理设置页，实时观察勾选客户端开关时地址、端口（v2rayN 常见 `10808/10809`，Clash Verge Rev 常见 `7897/7890`）以及 PAC 脚本栏是否被其他程序覆盖；使用无扩展的无痕浏览器做交叉验证。
- **处理方法**：关闭所有其他代理软件、专属客户端与抓包工具的开机自启并彻底结束进程；清空系统代理设置中残留的陌生 PAC 脚本链接；在 v2rayN 底部确认勾选「自动配置系统代理」与绕过大陆路由；将浏览器代理模式恢复为「使用系统代理设置」。
- **验证结果**：系统代理端口稳定保持不再自动回滚，浏览器流量稳定出现在客户端连接日志中。
- **下一步**：详查见[v2rayN 浏览器不走代理与系统代理自动还原排查](/troubleshooting/articles/v2rayn-system-proxy-fail)，若需接管终端命令行、Docker 或游戏流量，请继续查看下一节 TUN 模式排障。

---

## 十、TUN 模式异常与权限排查（服务模式与虚拟网卡冲突）

终端 CLI、Git、Python、UWP 应用与联机游戏通常忽略系统代理，必须借助三层 TUN 虚拟网卡接管。但 TUN 牵涉特权服务与全局路由表，冲突代价也明显高于系统代理。

- **现象**：点击开启 TUN 模式后开关数秒内自动弹回关闭，日志报 `TUN start failed`、`Service Mode not installed` 或 `wintun error`；开关保持开启但终端仍不走代理；或者开启 TUN 后全机彻底断网，连局域网与国内网站也无法打开。
- **可能原因**：Windows 未安装并启动 Service Mode 服务或缺少管理员权限，macOS 未在系统设置中批准网络扩展；配置文件未开启 `dns.enable: true` 导致 TUN 接管后无法解析域名；与企业 SSL VPN（如 EasyConnect）、网游加速器、虚拟机桥接或其他代理软件的虚拟网卡争抢 `0.0.0.0/0` 默认路由；TUN 协议栈（`system` / `gvisor` / `mixed`）在特定系统驱动环境下兼容性异常；同时开启系统代理与 TUN 叠加不兼容规则引发二次转发或卡顿。
- **检查步骤**：核对客户端设置中 Service Mode 是否处于已安装且运行状态；打开系统网络适配器列表检查是否同时存在多张启用中的虚拟网卡；检查配置中的 `dns.enable`、`tun.stack` 与 `tun.auto-route` 设置。
- **处理方法**：开启后一旦断网，遵循**「先止血回滚，再排冲突」**——立即关闭 TUN、退出客户端并恢复物理网卡自动 DNS；彻底退出企业 VPN 与游戏加速器等会创建虚拟网卡的程序；通过客户端内置按钮安装并启用 Service Mode（macOS 在「隐私与安全性」放行网络扩展），确保 `dns.enable: true`；如遇 `system` 栈在部分 Windows 机器高占用或断流，可切换为 `mixed` 或 `gvisor` 栈对照。日常仅浏览器代理时建议优先使用低风险系统代理，按需再开 TUN。
- **验证结果**：系统网络列表中出现单张健康 TUN 网卡，命令行测试请求准确出现在客户端进程日志中，关闭 TUN 后直连平滑恢复。
- **下一步**：详查见[TUN 开启无效与虚拟网卡冲突修复](/troubleshooting/articles/tun-not-working)、[TUN 模式与系统代理区别及切换断网修复](/troubleshooting/articles/tun-vs-system-proxy)以及[TUN 模式详解教程](/guides/tun-mode/)。

---

## 十一、部分网站与 AI 工具不可达及浏览器结果不一致

大部分海外站点秒开而唯独 ChatGPT、Claude、Gemini 或特定流媒体报错拒绝访问，几乎都不是线路断连，而是应用层 IP 风控与分流精细度问题。

- **现象**：Google、GitHub 与 YouTube 主页都能流畅加载，但 ChatGPT 报地区不支持、Claude 弹出风控或 `Access Denied`、Gemini 无法访问；连着新加坡、台湾或香港节点看 YouTube 却显示 `送中(CN)`；同一节点在无痕窗口或另一款浏览器中正常，在常用浏览器中却持续报错。
- **可能原因**：第一是**出口地区政策与风控差异**——本站留存的 `2026-08-19` 光速云 Miaoko 实测图显示，香港专线节点虽然延迟极低，但 OpenAI 多为 `仅APP(HK)`、Gemini 多数显示 `失败`，且新加坡与台湾多节点记录到 YouTube `送中(CN)` 与台湾 Disney+ 失败；`2026-07-18` 无忧链接实测图亦出现香港 HKG-01 YouTube `送中(CN)`。这证明节点连通不等于解锁。第二是**分流规则遗漏或分裂**，老旧规则集未涵盖 AI 平台新域名，导致主站走美国而登录鉴权接口走香港或 `DIRECT` 直连，立刻触发风控拦截。第三是**浏览器状态污染**，历史 Cookie 缓存了旧地区标签、独立 DoH 绕过分流或 QUIC（UDP）被旁路，都会制造跨浏览器表现差异。
- **检查步骤**：先用浏览器全新无痕窗口测试目标站点，快速剥离 Cookie 与扩展干扰；打开客户端实时连接日志，搜索目标平台全部子域名，检查是否全部统一落入同一个支持的地区策略组；手动切换至已验证可用的日本、新加坡或美国节点复测。
- **处理方法**：清理目标站点历史 Cookie 与缓存，关闭浏览器独立安全 DNS 并在必要时临时停用实验性 QUIC；在分流规则中为 ChatGPT、Claude、Gemini 与流媒体建立独立策略组，绑定完整规则集并固定至单一干净地区节点，切忌在自动测速组下频繁跨国切 IP 触发账号风控。
- **验证结果**：常规与无痕窗口均可稳定登录并使用目标 AI 或流媒体，连接日志显示全套子域名落点地区完全一致。
- **下一步**：详查见[仅个别网站与 AI 工具打不开排查](/troubleshooting/articles/specific-sites-unreachable)，并参考[分流规则配置](/guides/split-routing/)及[ChatGPT](/ai-media/chatgpt/)、[Claude](/ai-media/claude/)、[Gemini](/ai-media/gemini/)、[YouTube 送中](/ai-media/youtube/)专项文档。

---

## 十二、速度慢、高延迟、UDP 阻断与晚高峰瓶颈（含倍率与测速偏差）

当代理已经连通但体感慢、游戏断流或流量掉得离奇时，必须把物理宽带上限、晚高峰链路分段、UDP NAT 类型与节点流量倍率彻底拆开排查。

- **现象**：白天流畅而每晚 20:00–23:00 视频反复缓冲、SSH 敲字粘滞；测速图写着 500Mbps 而自己下载仅 30MB/s；语音通话、联机游戏或 Hysteria 2 节点连不上且测速图 UDP 显示 `Unknown` 或 `RestrictedCone`；跑一次全量测速就扣掉十几 GB 套餐流量。
- **可能原因**：第一，**单位与带宽上限误区**，`1 MB/s = 8 Mbps`，家里 300Mbps 宽带的理论下载天花板就是 37.5MB/s，无法复现机房千兆后端的跑分；第二，**晚高峰分段拥塞**，即便到国内中转入口的 TLS RTT 只有 25ms，只要跨境传输段或境外落地机在晚高峰发生拥塞丢包，端到端 HTTPS 延迟就会飙升至 800ms 以上；第三，**UDP 转发与防火墙限制**，校园网或企业网常封禁或严限高端口 UDP，且部分节点服务端本身未开启 `udp: true` 转发（`2026-08-11` 多张 Shadowsocks 实测图 UDP 列为 `Unknown`）；第四，**全节点多线程测速耗流与高倍率叠加**，例如 `2026-08-11` 光速云 32 线程测 54 个节点单次即消耗 `19.4GB` 流量，若叠加 `2x/3x` 倍率节点，流量额度会成倍蒸发。
- **检查步骤**：参考**「测速图读数四步法」**——先核对测试时间是否为晚高峰，再看测试后端带宽与线程数，再看是否存在单节点 0B 或极低速异常，最后核对协议与解锁列。在自己设备上先关闭代理测本地宽带与 Wi-Fi 丢包（有条件换网线对照）；晚高峰对比不同运营商入口前缀与冷门靠后编号节点；检查节点配置是否开启 `udp: true` 以及节点名称标注的流量倍率。
- **处理方法**：晚高峰放弃反复跑全节点多线程下载测速，改为用单节点网页首屏与视频起播体感挑选低丢包冷门节点；高端口 UDP 受限网络中关闭浏览器 QUIC 实验项并优先采用 TCP 承载的 VLESS/Trojan 协议；联机游戏与实时语音优先筛选实测标注 `FullCone` NAT 的节点；小流量套餐务必关闭客户端的定时自动测速功能。
- **验证结果**：晚高峰网页起播与视频播放平稳，语音游戏不断流，面板流量消耗曲线与实际下载量及倍率公示一致。
- **下一步**：详查见[晚高峰高延迟、丢包与卡顿定位](/troubleshooting/articles/high-latency-packet-loss-peak)、[UDP 转发失败与 NAT 限制排查](/troubleshooting/articles/udp-nat-firewall-blocks)、[测速偏差与流量倍率计算](/troubleshooting/articles/bandwidth-multiplier-speedtest-diff)，延伸阅读[低延迟节点真相](/routes/low-latency/)与[线路倍率计费](/routes/multipliers/)。

---

## 十三、桌面端与手机端（iOS / Android）故障差异及后台保活

Windows/macOS/Linux 桌面端、iOS、Android 与 OpenWrt 软路由采用截然不同的系统网络栈与权限模型，切忌生搬桌面端排障习惯去处理手机端断连。

| 维度 | Windows / macOS / Linux 桌面端 | iOS / iPadOS（Shadowrocket / Stash） | Android（v2rayNG / Clash Meta / FlClash） |
| :--- | :--- | :--- | :--- |
| **接管机制** | 系统代理（应用层）或 TUN 虚拟网卡（需特权服务） | 系统统一 `Network Extension` VPN 描述文件 | 系统统一 `VpnService` 全局独占隧道 |
| **高频本地故障** | 多软件端口冲突、缺 WebView2/.NET、虚拟网卡打架 | 全局路由误设直连、旧描述文件冲突、规则过大内存溢出 | 锁屏后台进程被厂商杀掉、切 Wi-Fi/5G 隧道假死 |
| **渠道安全提醒** | 区分 x64/arm64 架构，淘汰已停更老端 | 外区付费应用；严禁用陌生共享 Apple ID 登录 iCloud 防锁机 | 验签官方开源渠道；NekoBox 警示勿用第三方接管的 Play 版 |
| **首查保活动作** | 查端口、装 Service Mode、保持单端运行 | 设「全局路由=配置」、删多余 VPN 描述文件、精简规则 | 电池设为「不限制优化」+ 锁后台卡片，假死重开开关 |

- **常见移动与路由端处置要点**：iOS 开关打开瞬间弹回或完全不分流时，先进入系统「VPN 与设备管理」清理多余旧配置、精简超出内存上限的超大规则集，并在 Shadowrocket 首页核对全局路由为「配置（Config）」；Android 锁屏几分钟钥匙图标消失或切网假死时，必须在电池管理中放行不限制后台耗电并锁定多任务卡片，切网假死后重启一次代理开关刷新 `VpnService`，并优先使用维护活跃的 v2rayNG、FlClash 或 Hiddify；OpenWrt 软路由端则重点核对固件版本（如 Nikki 要求 24.10+）与透明代理防火墙规则，避免路由器与电脑客户端双重开启代理导致二次套娃。
- **下一步**：详查[Shadowrocket 导入与分流故障](/troubleshooting/articles/shadowrocket-import-rules)、[安卓后台断连保活](/troubleshooting/articles/android-v2rayng-clash-disconnect)，延伸见[手机 VPN 机制](/vpn/mobile/)与[安卓 VPN 指南](/vpn/android/)。

---

## 十四、本地网络与服务端问题的分层剥离法

当你面对复杂断连拿不准「到底是自己设备、家里宽带出了问题，还是机场节点整体故障」时，按顺序完成以下 4 组低成本对照实验，5 分钟内即可用排除法精准定责：

| 对照实验 | 具体执行方式 | 指向本地问题（修自己环境） | 指向远端或账号（联系服务商） |
| :--- | :--- | :--- | :--- |
| **1. 基础直连与时钟** | 彻底关代理访问国内常规站并核对标准时间 | 国内站不通或时钟误差超 60 秒 | 国内秒开且误差 < 30 秒 → 进实验 2 |
| **2. 切换手机热点** | 断开家庭宽带/Wi-Fi 改连 4G/5G 热点复测 | 切热点立刻畅通 → 原宽带/路由器/防火墙限制 | 切热点后依旧全超时或同报错 → 进实验 3 |
| **3. 跨地区多节点** | 分别抽测港、新、日、美各 2 个不同编号 | 仅个别节点或单地区异常 → 单点维护或劣化 | 全地区全编号同时 Timeout/0B → 进实验 4 |
| **4. 跨设备/面板核对** | 用另一台设备测同订阅，直连查面板账期 | 另一设备正常 → 仅当前电脑端口/TUN/DNS 故障 | 双端跨网全失效且账期流量正常 → 服务端异常 |

**剥离铁律**：只要实验 1、实验 2 或实验 4 出现任何一项「换网就好」或「换设备就好」，就证明远端节点是存活的，绝对不要浪费钱重买服务，直接回到对应本地模块修复即可。

---

## 十五、日志与错误码阅读指南

打开客户端「日志（Logs）」与浏览器开发者工具控制台，对照下面 10 组高频报错关键词即可跳过盲猜、直接命中故障层级：

1. **`x509: certificate ...` / `tls: handshake failure`**：证书校验或 TLS 握手被拒，首要怀疑**「本地系统时钟偏差」**，其次排查域名劫持、SNI 错误或服务端证书过期。
2. **`lookup xxx: no such host` / `DNS_PROBE_FINISHED_NXDOMAIN`**：域名解析失败，核查物理网卡 DNS、内置 `nameserver` 及 `198.18`/`127.0.0.1` 残留。
3. **`i/o timeout` / `context deadline exceeded`**：发出请求在超时内毫无回应，多为本地断网、中转入口宕机、端口被防火墙静默丢包或运营商限流。
4. **`connection reset by peer` / `EOF`**：连接刚建好就被强行重置，单点多为落地维护或超在线设备数，全局需查流量归零或更新订阅同步新参数。
5. **`ERR_PROXY_CONNECTION_FAILED`**：100% 本地接管问题——客户端已退出但系统代理未关闭，或系统代理端口与实际监听端口不一致。
6. **`yaml: unmarshal errors` / `unsupported proxy type`**：YAML 缩进或覆写语法错、格式混用，或停更旧核心不识别 VLESS / Hysteria 2。
7. **`Service Mode not installed` / `wintun` / `permission denied`**：TUN 服务权限不足或虚拟网卡初始化失败，补装服务模式并清理冲突虚拟网卡。
8. **`invalid user` / `authentication failed` / `HTTP 401`**：账号鉴权失效，回面板核对是否重置过订阅 Token、UUID 变更或套餐已过期。
9. **`HTTP 403` / `Access Denied`**：订阅拉取场景切换直连/代理更新绕过 WAF；AI 或流媒体场景则更换非风控地区干净节点。
10. **`UDP Unknown` / `QUIC timeout`**：未开启 `udp: true` 或当前网络禁高端口 UDP，切 TCP 节点或优先选择实测 `FullCone` 节点。

---

## 十六、何时联系服务商、排障安全红线与脱敏工单模板

### 排障必须死守的三条安全红线

- **严禁未脱敏泄露完整订阅链接**：订阅 URL 内嵌账号鉴权 Token，求助发帖、截图或提交工单前务必遮挡 `token=` 及路径后缀；一旦不慎泄露，请立即按[账号与订阅安全指南](/security/account-security/)重置订阅密钥。
- **严禁将关闭杀毒软件当作常规排障手段**：系统安全软件极少是断连根因，遇核心文件误报应核验官方哈希并查隔离区，绝不关闭防护或安装陌生人发来的「免配置修改端」。
- **高风险网络变更先留回滚退路**：修改静态 DNS、路由表或虚拟网卡前，先截图记录原始 DHCP 状态确保 30 秒内可完整还原。

### 提交工单前 5 项脱敏自检与标准模板

当完成「双网复测、双端复测、时钟校准、账期核对、重新拉取订阅」后，仍出现全部节点 0B 超时、账号正常持续报 401/503、整地区数小时失效或流量倍率明显错算时，即可联系服务商。发送工单前务必隐去**「订阅链接 Token、注册主邮箱、本地公网 IP、内网路由表、支付凭证完整号段」**五类敏感信息：

```text
【问题类型】：订阅失败 / 全节点超时 / 特定地区异常 / 倍率核查（留一项）
【发生时间】：YYYY-MM-DD HH:MM（CST）
【设备与端】：系统版本 + 客户端及内核版本（如 Win11 + Clash Verge Rev / Mihomo）
【分层验证】：家庭宽带与手机 5G 热点均已测试，国内直连正常，系统时间误差 < 5 秒
【账号状态】：套餐有效期内、剩余流量充足，已手动重新拉取最新订阅
【脱敏订阅】：https://[域名已隐藏]/api/v1/client/subscribe?token=***[已脱敏]***
【报错现象】：具体 HTTP 状态码、受影响地区节点范围与 3-5 行脱敏日志片段
```

---

## 十七、全部 24 篇实操排障文章分类总索引

### 1. 订阅更新与配置导入（5 篇）
1. [订阅 HTTP 200 但返回 0 字节/空白订阅排查](/troubleshooting/articles/sub-http-200-empty)
2. [更新订阅失败：401/403/404/503 与被重定向排查](/troubleshooting/articles/sub-http-401-403-404-503)
3. [更新订阅提示 TLS 证书错误、DNS 解析失败或超时](/troubleshooting/articles/sub-tls-dns-timeout)
4. [Shadowrocket 小火箭无法导入订阅与分流规则不生效](/troubleshooting/articles/shadowrocket-import-rules)
5. [同一订阅在不同客户端表现不一致：协议支持与 UA 差异](/troubleshooting/articles/cross-client-inconsistency)

### 2. 节点超时与套餐状态区分（3 篇）
6. [所有节点同时超时：本地时间、网络连通与机场全局异常分流](/troubleshooting/articles/nodes-all-timeout)
7. [仅单个节点或特定地区超时：节点维护、路由劣化与测速 0B 解读](/troubleshooting/articles/nodes-partial-region-timeout)
8. [套餐到期、流量耗尽与客户端旧配置过时的快速区分](/troubleshooting/articles/quota-expired-vs-stale-config)

### 3. 连接接管、TUN 与系统代理（7 篇）
9. [节点已连接但所有网页打不开：系统代理、端口冲突与环路排查](/troubleshooting/articles/connected-no-internet)
10. [仅个别网站/AI 工具打不开与浏览器结果不一致](/troubleshooting/articles/specific-sites-unreachable)
11. [TUN 开启无效：虚拟网卡冲突、服务模式授权与管理员权限](/troubleshooting/articles/tun-not-working)
12. [TUN 模式与系统代理的区别、适用场景与切换后断网修复](/troubleshooting/articles/tun-vs-system-proxy)
13. [v2rayN 显示已运行但浏览器不走代理或系统代理自动被还原](/troubleshooting/articles/v2rayn-system-proxy-fail)
14. [安卓 v2rayNG / Clash Meta for Android 节点失效与后台断连保活](/troubleshooting/articles/android-v2rayng-clash-disconnect)
15. [系统时间不同步导致 VLESS/TLS 握手失败与校准方法](/troubleshooting/articles/time-sync-tls-cert-error)

### 4. DNS 解析与 Fake-IP 专项（2 篇）
16. [Fake-IP 原理、198.18.0.1 解析异常与微信/局域网冲突修复](/troubleshooting/articles/fake-ip-explained-fix)
17. [DNS 污染、DNS 泄漏与代理环境标准 DNS 分流检查路径](/troubleshooting/articles/dns-leak-hijack-fix)

### 5. 客户端启动、内核与迁移（4 篇）
18. [Clash Verge Rev 无法启动、白屏与 WebView2/权限异常](/troubleshooting/articles/clash-verge-startup-fail)
19. [Mihomo 核心启动失败与导入 YAML 配置语法报错排查](/troubleshooting/articles/clash-verge-mihomo-yaml-fail)
20. [v2rayN 更新失败、Xray/sing-box 核心无法加载与缺运行时修复](/troubleshooting/articles/v2rayn-core-load-fail)
21. [从旧客户端 / Clash for Windows / Mihomo Party 安全迁移并备份配置](/troubleshooting/articles/client-migration-backup)

### 6. 延迟抖动、UDP 与测速偏差（3 篇）
22. [UDP 转发失败、NAT 类型与运营商/本地防火墙限制排查](/troubleshooting/articles/udp-nat-firewall-blocks)
23. [晚高峰高延迟、丢包与卡顿：区分本地宽带、中转与落地瓶颈](/troubleshooting/articles/high-latency-packet-loss-peak)
24. [为何客户端测速与实际下载/网页体感差异大及倍率计算](/troubleshooting/articles/bandwidth-multiplier-speedtest-diff)

---

## 十八、故障排查常见问题（FAQ）

### 代理连上后部分网页打不开，但客户端测速有延迟，该从哪里查？

先不要重装软件或切换全局模式。按先低风险后高风险顺序，依次确认系统时间误差在 30 秒内、浏览器关闭安全 DNS（DoH）防绕过、系统代理端口未被其他软件占用，再判断是单节点路由异常还是本地 DNS 分流冲突。

### 为什么更新订阅时提示成功或 HTTP 200，节点列表却依然是空的？

HTTP 200 仅代表服务器正常应答了请求，不代表返回内容是有效节点。常见原因包括订阅链接参数与当前客户端格式不匹配（如把 Base64 节点串直接导入 Clash YAML 解析器）、套餐已过期返回提示页或空体、以及机场面板转换接口异常或该品牌仅支持专属客户端。

### 排障时为什么不建议先关闭杀毒软件或把订阅链接发给陌生人？

绝大多数断连和启动报错源自时间不同步、虚拟网卡权限不足或端口冲突，关闭安全防护会引入额外风险且极少真正解决问题；而订阅链接通常内嵌账号鉴权 Token，泄露后他人可直接消耗流量或定位账号状态。

### 客户端显示所有节点同时 Timeout 或 -1ms，一定是机场跑路了吗？

不一定。全节点超时最常见的本地诱因是系统时钟与标准时间偏差超过 30 至 60 秒导致 TLS 或 VLESS 握手失败，其次是基础宽带断网、套餐到期或流量耗尽、以及长期未更新订阅导致旧中转入口 IP 下线。必须先完成时间校准、直连测试与面板核对后再判断是否服务端失联。

### 更新订阅时遇到 401、403、404、503 状态码分别代表什么问题？

401 与 404 通常指向订阅 Token 已重置、链接截断或路径变更，需登录面板重新复制；403 多为 Cloudflare 等防火墙拦截出口 IP 或请求头，可切换直连与代理更新对照；503 则表示源站面板临时维护或过载，稍候或换备用订阅域名即可验证。

### 开启 TUN 模式后开关弹回，或者开启后整个电脑都断网了怎么处理？

开关弹回多因未安装 Service Mode 服务模式、缺少管理员或网络扩展权限，或虚拟网卡初始化失败；开启后全网断联常见于游戏加速器与企业 VPN 虚拟网卡路由冲突，或配置未开启内置 DNS。应先关闭 TUN 并恢复自动获取 DNS 回滚网络，再逐项排除冲突软件。

### 为什么退出代理客户端后，连国内网站和微信都打不开了？

常见原因有两个：一是客户端异常退出未能自动清除系统代理设置，导致浏览器继续连接已关闭的本地端口并报 `ERR_PROXY_CONNECTION_FAILED`；二是开启过 Fake-IP 或 TUN 模式后，系统 DNS 缓存残留 `198.18.0.1` 记录或网卡 DNS 停留在 `127.0.0.1`，需关闭系统代理并刷新 DNS 缓存。

### 同一个机场订阅在手机小火箭能正常连，导入电脑 Clash Verge Rev 却少节点或报错怎么办？

不同客户端发送的 User-Agent 请求头与内核支持协议集不同，部分面板会分别下发 Shadowsocks、VLESS 或 AnyTLS，旧核心会自动过滤不识别协议，个别品牌也已改为仅限专属客户端。应升级至 Mihomo 或 sing-box 活跃核心，停用覆写脚本后核对原始格式。

### 为什么 Google 和 YouTube 都能正常打开，但 ChatGPT、Claude 或 Gemini 提示地区不支持？

这属于目标 AI 平台的出口 IP 风控与分流错配而非线路断连。香港节点虽延迟极低，但多份实测样本中频繁出现 OpenAI 仅限 APP 或 Gemini 失败；浏览器 Cookie 或安全 DNS 旁路也会造成跨浏览器差异。应先无痕复测，再将 AI 域名固定分流至可用日、新、美节点。

### 为什么客户端测速显示几百 Mbps，但实际下载和晚高峰看视频还是很卡？

需先区分 1 MB/s 等于 8 Mbps 的单位换算及本地宽带物理上限；一键测速多为多线程并发，而网页与视频更看重单线程吞吐和端到端延迟；晚高峰中转或落地拥塞会导致高丢包。此外全节点多线程测速单次可耗十余 GB 流量，小流量包切勿频繁全量测速。

### 安卓手机锁屏几分钟代理就断开，或者切换 Wi-Fi 与移动数据后假死怎么解决？

安卓依赖 VpnService 运行，系统省电策略会在锁屏后回收后台进程。应在电池设置中将客户端设为不限制优化并锁定后台卡片，切换网络假死时重开代理开关刷新隧道，同时避免下载维护停滞或存在商店接管风险的非官方安装包。

### 什么情况下说明问题不在本地，应该直接联系服务商提交工单？

当完成本地直连对照、时间校准、手机热点切换、换节点与跨设备复测后，仍出现全部节点 0B 超时、账号正常却持续报 401/503、整地区长期失效或流量倍率明显错算时，即可判定服务端或账号侧异常。提单务必脱敏隐藏订阅 Token 并附错误码与关键日志。

<style scoped>
.ts-knowledge-map {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
  margin: 20px 0 28px;
}

@media (min-width: 860px) {
  .ts-knowledge-map {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
}

.ts-map-sidebar,
.ts-map-tree {
  background: var(--dpz-surface-muted, #F0EFE9);
  border: 1px solid var(--dpz-border, #DFDDD4);
  border-radius: 10px;
  padding: 18px 20px;
}

.ts-map-sidebar :deep(h3),
.ts-map-tree :deep(h3) {
  margin-top: 0;
  font-size: 1.05rem;
  color: var(--dpz-ink, #182026);
}
</style>
