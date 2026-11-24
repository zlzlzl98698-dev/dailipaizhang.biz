---
title: 'DNS 污染与 DNS 泄漏怎么排查：代理环境标准 DNS 分流检查'
description: '区分代理环境下的 DNS 污染、DNS 劫持与 DNS 泄漏，提供 Clash/Mihomo/sing-box 与浏览器 DoH、IPv6 DNS 的标准排查路径、命令行验证及系统 DNS 修改回滚方案。'
pillar: troubleshooting
category: dns-error
primaryKeyword: 'DNS污染与DNS泄漏排查'
intent: troubleshooting
publishedAt: '2026-11-23'
updatedAt: '2026-11-23'
breadcrumbs:
  - text: '首页'
    link: '/'
  - text: '故障排查'
    link: '/troubleshooting/'
  - text: 'DNS 错误'
    link: '/troubleshooting/dns-error/'
  - text: 'DNS 污染与泄漏修复'
howTo:
  name: '排查代理环境下的 DNS 污染与 DNS 泄漏'
  description: '通过对比直连与代理 DNS 解析结果、核查系统及浏览器 DoH 与 IPv6 链路，并修正 Mihomo/sing-box 分流配置解决污染和泄漏。'
  step:
    - name: '区分 DNS 污染与 DNS 泄漏'
      text: '先判断问题是境外域名解析出了错误的本地/保留 IP（污染），还是境外请求能通但域名查询却跑到了本地运营商 DNS（泄漏）。'
    - name: '核查系统 DNS、IPv6 与浏览器安全 DNS（DoH）'
      text: '检查网卡是否下发了运营商 IPv6 DNS，以及浏览器是否开启了绕过本地代理的 DoH。'
    - name: '修正客户端 DNS 分组与规则遵循（respect-rules）'
      text: '确保代理组域名经由代理出口或加密 DoH/DoT 解析，国内域名走国内 DNS 且防止节点域名死循环。'
    - name: '验证国内直连加速与境外零泄漏'
      text: '确认国内域名拿到本地 CDN 就近 IP，境外域名解析经由节点对应地区出口 DNS，无运营商 DNS 暴露。'
faq:
  - q: '为什么连上代理后，国内网站能打开但境外网站报连接重置或证书错误？'
    a: '这很可能是发生了本地 DNS 污染或使用了未经加密的 UDP 53 端口向境外公共 DNS（如 8.8.8.8）直连查询。请求在明文经过本地链路时被返回了虚假 IP，客户端按虚假 IP 去连接目标站点自然会握手失败。启用加密 DNS（DoH/DoT）并配合代理分流即可解决。'
  - q: '什么是 DNS 泄漏？为什么测速正常但流媒体和 AI 工具还是识别我在国内或直接风控？'
    a: 'DNS 泄漏指的是虽然你的网页 TCP 流量走了代理节点，但域名解析（DNS 查询）却没有走代理，而是直接发给了本地宽带运营商 DNS。不仅本地网络可能获知你正在查询的域名，远端 AI 或流媒体平台还会发现请求来源和 DNS 解析所在地区严重不匹配，进而触发地区报错或风控。'
  - q: '开启了浏览器的“安全 DNS（DoH）”是好事还是会导致分流失效？'
    a: '视模式而定。在系统代理模式下，如果浏览器强制使用自己的 DoH 服务器并选用了国内厂商，可能绕过客户端的 DNS 分流逻辑；如果选用了直连被阻断的境外 DoH 地址，则会直接卡死网页解析。排查代理环境 DNS 时，建议先暂时关闭浏览器自带 DoH，统一由代理客户端接管解析。'
---

# DNS 污染与 DNS 泄漏怎么排查：代理环境标准 DNS 分流检查

## 核心结论（Answer-First）

**DNS 污染**会返回假 IP 导致连接失败；**DNS 泄漏**则是流量走节点但域名查询回到本地运营商，引发调度慢与 AI 风控。标准排查应**先查浏览器安全 DNS 与系统 IPv6 DNS 是否抢跑，再核对 `nameserver`、`proxy-server-nameserver` 与 `respect-rules` 是否彻底分流**，改系统 DNS 前须留原值回滚。

## 故障现象

DNS 污染与 DNS 泄漏在日常使用中常表现为以下几类截然不同的症状：

- **典型 DNS 污染 / 劫持表现**：
  - 浏览器提示 `ERR_SSL_PROTOCOL_ERROR`、`ERR_CONNECTION_RESET` 或证书不匹配。
  - 终端 `nslookup` 查询海外站点时，返回非正常保留 IP、未知 IP 或与目标服务商完全不符的地址。
- **典型 DNS 泄漏表现**：
  - 网页能正常打开，但使用在线 DNS Leak 检测工具时，结果列表里出现了本地电信/联通/移动的 DNS 服务器归属地。
  - 访问流媒体或 AI 服务时，代理节点明明在日本或新加坡，却被识别成地区异常或国内 CDN 调度绕远（比如 YouTube 视频调度不顺或送中）。
- **直连域名被“反污染”拖慢（远端解析错位）**：
  - 打开淘宝、B站、网易云等国内站点反而极慢，一查发现国内域名的 DNS 请求全部被送到了香港/美国节点去解析，拿回了海外 CDN 节点 IP（CDN 调度劣化）。

## 先做 3 个低风险检查

1. **检查客户端是不是处于“无 DNS 配置”或直连 DNS 状态**：打开 Clash Verge Rev / v2rayN 的配置设置，确认核心已经启用内置 DNS（`dns.enable: true`），而不是仅靠本机网卡默认的 `192.168.1.1` 解析所有域名。
2. **临时核查浏览器的“使用安全 DNS（DoH）”**：在 Chrome/Edge 设置的「隐私和安全 → 安全」里，看看是否打开了“使用安全 DNS”。排障时先将其关闭（或暂切回默认）观察问题是否消失。
3. **排查系统是否启用了未代理的 IPv6**：如果你的宽带分配了 IPv6 地址与 IPv6 DNS，而你的代理配置只接管了 IPv4，浏览器或系统就会优先通过 IPv6 DNS 发出查询，造成“IPv4 走代理、IPv6 DNS 全泄漏”。

## 分层原因排除

### 本地系统与网络

- **运营商强制下发与路由器劫持**：家庭光猫或路由器默认把 DHCP 下发的 DNS 设为 `192.168.1.1` 或运营商 IP，部分路由器甚至开启了强制重定向内网所有 UDP 53 端口发包的功能（透明劫持）。如果在这种网络下走明文 UDP 53 查询境外 DNS，必然被污染。
- **IPv6 DNS 泄漏通道**：现代操作系统通常“IPv6 优先（Happy Eyeballs）”。即便你在客户端开启了 TUN 或系统代理，只要客户端没打开 `ipv6: true` 接管 IPv6 路由与 DNS，系统的 `AAAA` 查询仍可能顺着物理网卡直接出站。

### 客户端与核心配置

- **系统代理模式与 TUN 模式的 DNS 机制差异**：在常规系统代理模式下，如果浏览器发送的是完整的域名给本地 HTTP/SOCKS 端口，核心直接把域名交给远端节点（远端解析），通常不容易泄漏；**但若浏览器自己先做了本地 DNS 解析，再把 IP 发给代理，或者软件完全处于 TUN 模式下但核心 DNS 规则没配对**，本地 DNS 就会暴露。
- **Fake-IP vs Redir-Host 触发差异**：Redir-Host 模式必须拿到真实 IP 后才能返回给本地程序，如果配置中把所有域名同时丢给国内外两套 `nameserver` 并发竞速，国内运营商 DNS 往往因为物理距离近、几十毫秒就抢先返回了一个错误或本地化结果，从而造成泄漏或污染。

### DNS 与路由分流

这是最常见的配置错误集中区（以 Mihomo / Clash Meta 及 sing-box 为代表）：

- **缺少 `proxy-server-nameserver` 导致自举死循环**：如果节点服务器地址本身是个域名，必须指定由可靠 DNS 先解析节点域名，否则配置了“所有 DNS 都走代理”后会陷入鸡生蛋死循环。
- **未开启 `respect-rules: true`（Mihomo）**：老版本或简化 YAML 只配了 `nameserver` 和 `fallback`，没有让 DNS 模块遵循分流规则（`respect-rules`），导致非大陆域名照样通过本地直连去查境外加密 DNS（直连通常连不上境外 DoH 或绕路极慢）。
- **直接用明文 `8.8.8.8` 做主 DNS**：在本地直连状态下向明文 UDP `8.8.8.8:53` 查询被干扰的境外域名，绝大多数时候在请求离开本地网络前就已经收到了污染包，且明文发包会被网关记录。

### 远端订阅与节点

- **机场自带 YAML 模板过于陈旧**：很多老订阅还沿用早期 Clash 规则（无 `proxy-server-nameserver`、无 `nameserver-policy`、甚至直接 `default-nameserver: [114.114.114.114]` 并发污染），直接导入就会同时存在泄漏与污染隐患。
- **落地节点自身 DNS 异常**：极少数情况下，本地完全没有泄漏，但节点机房所在服务器自己的 `/etc/resolv.conf` 配置了有偏见的 DNS 或流媒体解锁专用 DNS 失效，表现为特定区域识别错误（例如台区节点返回跨区结果）。

## 操作路径

以下按桌面端、移动端与路由器分别说明排查与配置路径（全平台均涉及 DNS 机制，但具体修改位置不同）。

### 步骤 1：用命令行定位污染与本地 DNS 指向

在桌面终端测试本机当前直接向不同 DNS 发起请求的结果差异：

```powershell
# 适用 OS: Windows (PowerShell)
# 目的: 查看当前活跃网卡分配的 IPv4 与 IPv6 DNS 服务器地址，检查是否包含运营商地址
# 风险等级: 低（只读查询）
# 预期输出解读: 若启用了 TUN，虚拟网卡通常会显示内网接管地址（如 198.18.0.2）；若看到物理网卡上存在未经代理接管的 IPv6 DNS，则是典型的 IPv6 泄漏入口
Get-DnsClientServerAddress | Where-Object { $_.ServerAddresses.Count -gt 0 } | Format-Table InterfaceAlias, AddressFamily, ServerAddresses
```

```bash
# 适用 OS: macOS / Linux (终端)
# 目的: 对比本机默认 DNS 与指定纯净上游对同一域名的解析差异，判断是否遭遇明文 UDP/53 污染
# 风险等级: 低（只读查询）
# 预期输出解读: 若通过本机默认网关或明文 8.8.8.8 查到的 IP 为明显异常的保留地址或与可信代理后结果完全不同，说明本地存在明文 DNS 污染/劫持
dig www.google.com && dig @8.8.8.8 www.google.com +time=2 +tries=1
```

### 步骤 2：排查浏览器 DoH 与系统 IPv6 抢跑

- **Chrome / Edge / Firefox（桌面端）**：
  - 若你在系统代理或 TUN 模式下由 Clash/v2rayN 统一做规则分流，先进入浏览器「设置 → 安全」**关闭“使用安全 DNS”**（或让其“使用当前服务提供商”，即回落给系统/代理接管），避免浏览器私下把所有域名发给第三方 DoH 而破坏客户端分流。
- **处理 IPv6 泄漏**：
  - 如果你的网络有 IPv6，但所买机场只支持 IPv4 节点或不想折腾 IPv6 路由，优先在代理客户端内开启 **IPv6 分流接管（如 Clash Verge Rev 启用 IPv6 或配置 IPv6 规则/TUN `ip6`）**，或仅在必要排障时测试是否因 IPv6 引起泄漏（注意：不建议永久盲目禁用整机 IPv6 驱动，如需临时测试请见下文回滚步骤）。

### 步骤 3：应用标准 Mihomo / sing-box 分流 DNS 方案

在 **Windows / macOS / Linux** 的 **Clash Verge Rev / Mihomo**（以及 **OpenWrt 的 OpenClash / Nikki**）中，规范的防泄漏、防污染分流思路是将 DNS 拆成三层（可通过客户端「全局扩展覆写」实现，切勿将订阅链接上传第三方）：

```yaml
dns:
  enable: true
  ipv6: true # 若环境不需要可设 false，与客户端设置一致
  respect-rules: true
  enhanced-mode: fake-ip # 或按需使用 redir-host
  fake-ip-range: 198.18.0.1/16
  default-nameserver:
    - 223.5.5.5
    - 119.29.29.29
  proxy-server-nameserver:
    - https://dns.alidns.com/dns-query
    - https://doh.pub/dns-query
  nameserver:
    - https://dns.google/dns-query
    - https://cloudflare-dns.com/dns-query
  nameserver-policy:
    "geosite:cn,private":
      - https://dns.alidns.com/dns-query
      - https://doh.pub/dns-query
```

**关键逻辑解读**：
- `proxy-server-nameserver`：只用来解析机场节点域名本身，必须走国内可直连的加密 DNS，防止死循环。
- `nameserver-policy` 对 `geosite:cn,private` 指定国内加密 DNS（阿里/腾讯 DoH），确保国内站点拿到就近真实 CDN IP，不被拖去海外解析。
- 其余境外域名进入主 `nameserver`（Google/Cloudflare DoH），并且由于开启了 `respect-rules: true`，这些加密 DNS 查询本身也会按分流规则**经由代理节点发出**，彻底杜绝向本地宽带运营商泄漏！

在 **v2rayN（Xray / sing-box 核心）** 中：
- 进入「设置 → Core:基础设置 / 路由设置 → DNS 设置」，确保启用了内置分流 DNS：国内域名组（`geosite:cn`）走国内公共 DNS（并配合 `expectIPs: ["geoip:cn"]` 防止结果异常），国外及默认域名组走远端 DoH 或经由 `PROXY` 出站查询，切勿把全部 DNS 指向 `localhost` 或运营商默认 DNS。
- **Android / iOS（v2rayNG / Clash Meta for Android / Shadowrocket）**：在 App 设置里检查「路由/DNS 模式」，开启「本地 DNS / 域名优先嗅探（Sniffing）」，避免先用手机蜂窝运营商 DNS 解析出 IP 再发给节点。

### 步骤 4：通过终端与实际页面核验无泄漏

在开启代理（尤其 TUN 模式）后，检查核心日志及解析情况：

```bash
# 适用 OS: Windows / macOS / Linux (终端)
# 目的: 在系统代理（需配合代理环境变量）或 TUN 模式下测试海外站点连通与 TLS 证书是否正常
# 风险等级: 低（只读 HTTPS 请求）
# 预期输出解读: 应顺利完成 TLS 握手并返回 HTTP 200/301/302（而非证书报错或 Reset）；同时去客户端“连接(Connections)”面板查看，目标显示为域名而非已被本地污染的 IP
curl -Iv https://www.google.com 2>&1 | head -n 20
```

## 什么结果算修复

1. **客户端连接面板可见完整域名**：访问海外网站时，在 Clash Verge Rev / v2rayN 的连接监控里能看到清晰的目标域名与正确的 `PROXY` 规则命中，而非一串莫名的本地错误 IP。
2. **国内站点保持本地高速解析**：国内常用网站与视频加载迅速，解析结果仍指向本地运营商/就近 CDN，不绕道海外。
3. **DNS 泄漏检测纯净**：使用任意标准在线 DNS Leak 测试页面多轮检测，返回的解析服务器归属地仅对应你的代理节点出口所在地区或你指定的境外上游，**不再出现本地宽带省份的运营商 DNS**。
4. **AI 与流媒体不再因解析错位报区域错误**：网页版与桌面客户端表现一致。

## 若仍失败怎么办

- 若启用了 `fake-ip` 且修改后出现微信/局域网打不开，优先检查 `fake-ip-filter` 白名单配置：[Fake-IP 原理与 198.18.0.1 冲突修复](/troubleshooting/articles/fake-ip-explained-fix)。
- 若确认只有一两个特定 AI 网站打不开而 DNS 检测正常，需排查节点 IP 风控、浏览器指纹或缓存问题：[仅个别网站或 AI 工具打不开排查](/troubleshooting/articles/specific-sites-unreachable)。
- 若写入 YAML 配置后 Mihomo 核心报错无法启动（常见于 `geosite` 数据库未下载成功或缩进错误），请排查：[Mihomo 核心启动失败与 YAML 语法报错排查](/troubleshooting/articles/clash-verge-mihomo-yaml-fail)。

## 高风险操作与回滚提示

> [!WARNING]
> **切勿关闭杀毒软件**，也**切勿向第三方网页“在线修复工具”粘贴含 Token 的订阅链接**。如果你需要改动系统网卡 DNS、禁用 IPv6 协议或变更路由器设置，请严格按以下步骤保留回滚方案：

- **修改 Windows / macOS 网卡系统 DNS 的回滚**：
  - 改动前先记下当前配置（或执行 `Get-DnsClientServerAddress` 截图留存）。
  - 如果手工将网卡 DNS 改成了 `127.0.0.1` 或公共 IP 导致**关闭代理后彻底无法解析任何域名**，请立即还原为自动获取（DHCP）：
    - **Windows PowerShell 回滚**：`Set-DnsClientServerAddress -InterfaceAlias "以太网" -ResetServerAddresses`（把 `"以太网"` 替换为你实际网卡名如 `"WLAN"`）。
    - **macOS 终端回滚**：`networksetup -setdnsservers "Wi-Fi" "Empty"`（恢复路由器 DHCP 下发）。
- **测试期间若曾关闭网卡 IPv6 绑定，回滚方法**：
  - 在 Windows 网络适配器属性重新勾选「Internet 协议版本 6 (TCP/IPv6)」，或在 PowerShell 执行 `Enable-NetAdapterBinding -Name "WLAN" -ComponentID ms_tcpip6`。
- **OpenWrt / 软路由更改 `dnsmasq` 或插件 DNS 接管端口的回滚**：
  - 修改前必须先备份 `/etc/config/dhcp` 与插件配置（`cp /etc/config/dhcp /etc/config/dhcp.bak`）；若断网失联，通过 SSH 还原备份文件并执行 `/etc/init.d/dnsmasq restart` 即可恢复全屋原始解析。

## 常见问题

### 为什么连上代理后，国内网站能打开但境外网站报连接重置或证书错误？

这很可能是发生了本地 DNS 污染或使用了未经加密的 UDP 53 端口向境外公共 DNS（如 8.8.8.8）直连查询。请求在明文经过本地链路时被返回了虚假 IP，客户端按虚假 IP 去连接目标站点自然会握手失败。启用加密 DNS（DoH/DoT）并配合代理分流即可解决。

### 什么是 DNS 泄漏？为什么测速正常但流媒体和 AI 工具还是识别我在国内或直接风控？

DNS 泄漏指的是虽然你的网页 TCP 流量走了代理节点，但域名解析（DNS 查询）却没有走代理，而是直接发给了本地宽带运营商 DNS。不仅本地网络可能获知你正在查询的域名，远端 AI 或流媒体平台还会发现请求来源和 DNS 解析所在地区严重不匹配，进而触发地区报错或风控。

### 开启了浏览器的“安全 DNS（DoH）”是好事还是会导致分流失效？

视模式而定。在系统代理模式下，如果浏览器强制使用自己的 DoH 服务器并选用了国内厂商，可能绕过客户端的 DNS 分流逻辑；如果选用了直连被阻断的境外 DoH 地址，则会直接卡死网页解析。排查代理环境 DNS 时，建议先暂时关闭浏览器自带 DoH，统一由代理客户端接管解析。

## 相关教程与替代入口

- Fake-IP 冲突修复：[Fake-IP 原理与 198.18.0.1 异常修复](/troubleshooting/articles/fake-ip-explained-fix)
- 专题配置教程：[DNS 与 Fake-IP 配置指南](/guides/dns-setup/) ｜ [分流规则配置指南](/guides/split-routing/)
- AI 与流媒体排查：[ChatGPT 机场适配与地区限制](/ai-media/chatgpt/) ｜ [YouTube 送中排查](/ai-media/youtube/)
- 专题汇总：[DNS 错误排查专题](/troubleshooting/dns-error/)
