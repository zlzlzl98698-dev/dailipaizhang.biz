---
title: 'Fake-IP 原理与 198.18.0.1 异常修复：解决微信与局域网冲突'
description: '拆解 Fake-IP 假地址池（198.18.0.0/16）的运行原理，排查微信 PC 版断连、局域网设备访问失败、网段冲突以及关闭代理后 DNS 解析仍返回 198.18.x.x 的修复与回滚方法。'
pillar: troubleshooting
category: dns-error
primaryKeyword: 'Fake-IP 198.18.0.1异常'
intent: troubleshooting
publishedAt: '2026-11-23'
updatedAt: '2026-11-24'
breadcrumbs:
  - text: '首页'
    link: '/'
  - text: '故障排查'
    link: '/troubleshooting/'
  - text: 'DNS 错误'
    link: '/troubleshooting/dns-error/'
  - text: 'Fake-IP 与 198.18 冲突'
howTo:
  name: '排查并修复 Fake-IP 模式导致的 198.18.0.1 异常与应用冲突'
  description: '通过添加 fake-ip-filter 白名单、核对 198.18 网段冲突、刷新系统 DNS 缓存或切换 redir-host 模式解决软件异常。'
  step:
    - name: '识别域名是否被映射为 198.18.x.x'
      text: '在终端对异常域名执行解析测试，确认其是否返回 198.18.0.0/16 网段地址或因退出代理后缓存失效而无法访问。'
    - name: '核对客户端退出后的 DNS 缓存残留'
      text: '关闭代理后若国内域名仍指向 198.18 网段，先刷新系统及浏览器 DNS 缓存。'
    - name: '为冲突软件与局域网域名添加 fake-ip-filter'
      text: '将微信、局域网域名、公司内网后缀及网络连通性检测域名加入 fake-ip-filter，使其返回真实 IP。'
    - name: '必要时调整网段或切换 redir-host 模式'
      text: '若目标环境强依赖真实 IP 校验或与内网 198.18 网段冲突，修改 fake-ip-range 或切为 redir-host。'
faq:
  - q: '为什么我 ping 百度或谷歌都返回 198.18.0.x 且延迟只有 1ms？'
    a: '这是 Fake-IP 模式正常工作的标志。198.18.0.0/15 是 RFC 2544 保留的基准测试网段，客户端本地内置 DNS 故意给每个查询的域名分配一个 198.18.x.x 占位 IP，把“域名到真实目标的映射”留在内核内存中，从而省去等待远端真实 DNS 返回的时间，并在 TUN 模式下精确识别域名规则。因此此时 ping 测试看到的 1ms 只是本地虚拟网卡的响应，不代表真实节点延迟。'
  - q: '为什么微信电脑版、企业 OA 或局域网设备在 Fake-IP 下容易掉线或图片加载不出？'
    a: '部分应用内置了连接复用、自建 HTTP/TCP 校验或局域网服务发现，它们拿到 198.18.x.x 假地址后，一旦客户端重启、缓存过期或通过直连路由绕开虚拟网卡，旧连接与真实目标对不上号，就会不断重连或卡死。把对应域名加进 fake-ip-filter 放行真实解析，即可恢复正常。'
  - q: 'Fake-IP 和 Redir-Host 应该选哪一个？'
    a: '日常 TUN 模式、追求降低首包解析延迟以及避免 DNS 泄漏时，优先使用配合完整 fake-ip-filter 的 Fake-IP；如果在软路由或本地开发环境下频繁出现 Docker、数据库、公司内网域名冲突，或者有特定游戏反作弊对保留地址段敏感，切换为 Redir-Host 会更省心。'
  - q: '为什么我已经退出了 Clash / Mihomo 客户端，浏览器或微信还是打不开网页并连向 198.18.x.x？'
    a: '因为操作系统（Windows DNS Client / macOS mDNSResponder）和浏览器自身都会根据 TTL 缓存之前的 DNS 记录。客户端退出后虚拟网卡已经销毁，但系统缓存里的 198.18.x.x 尚未过期，数据包发往物理网关后被直接丢弃。执行系统 DNS 缓存刷新并清理浏览器 Host 缓存即可立即恢复。'
---

# Fake-IP 原理与 198.18.0.1 异常修复：解决微信与局域网冲突

## 核心结论（Answer-First）

`198.18.0.1` 是 Clash/Mihomo 与 sing-box 在 **Fake-IP 模式**下常用的保留地址起点。核心先返回假 IP 再按域名转发以加速解析，但本地软件拿到的是假地址。若微信断连、局域网 NAS 失联或退出后断网，多因**缺少 `fake-ip-filter` 白名单、系统留存假 IP 缓存，或本地与 `198.18.0.0/16` 网段冲突**。

## 故障现象

开启 Fake-IP 模式（常见于桌面端开启 TUN 虚拟网卡或软路由开启透明代理）后，异常往往集中出现在以下五类场景：

- **微信 / 钉钉 / 企业微信异常**：客户端开着时，微信 PC 版反复提示“当前网络不可用”、聊天图片裂开转圈、大文件发送卡在 `0%` 或语音通话接通即断，一旦关掉 TUN 切回普通系统代理就立刻恢复。
- **终端解析全部变成 `198.18.x.x`**：用 `ping` 或 `nslookup` 查任意国内外网站都返回 `198.18.0.12` 之类地址，Ping 值恒定 `<1ms`，想用命令行测真实延迟时完全失真。
- **关闭代理软件后部分软件“后遗症式”断网**：刚刚访问过的国内网站、网银或办公客户端在退出代理软件后数分钟内依然报 `ERR_CONNECTION_TIMED_OUT`，抓包可见仍在向 `198.18.x.x` 发起 TCP SYN 握手。
- **局域网 NAS / 路由器管理域名 / SMB 共享打不开**：通过主机名访问群晖、飞牛 fnOS、TrueNAS（如 `//nas.local`、`dsm.lan`、`router.asus.com`）或公司内网 `.corp` 域名时连接失败，但直接输入 `192.168.x.x` 内网 IP 却完全正常。
- **OpenWrt、企业 VPN 或容器网络撞车**：特定内网网关、基准测试环境或虚拟组网工具本身占用了 `198.18.0.0/15` 地址段，导致路由表冲突。

## 先做 3 个低风险检查

1. **确认是否刚刚关闭、重启过代理客户端或刚切换 Wi-Fi**：如果你刚退出了客户端或刚从公司网络切回家里网络，先刷新一次系统 DNS 缓存（Windows 下执行 `ipconfig /flushdns`），看断网是否瞬间消失。
2. **排查故障是否只发生在开启 TUN 模式（或软路由网关）时**：常规桌面“系统代理”模式下，浏览器通过 `HTTP CONNECT` 直接把域名字符串发给代理端口，本地网卡并不接管系统 53 端口 DNS，极少触发 Fake-IP 冲突；只有在 TUN 模式或软路由拦截全局 DNS 时，应用才会拿到 `198.18.x.x`。
3. **核对当前生效配置里是否漏配 `fake-ip-filter`**：打开你正在使用的 YAML 配置文件（在 Clash Verge Rev 中可查看运行态配置），检查 `dns:` 下开启 `enhanced-mode: fake-ip` 的同时，是否包含完整的 `fake-ip-filter` 白名单。不少极简机场下发的订阅只写了三四行基础 DNS，未过滤微信、NCSI 探针与局域网后缀。

## 深入拆解：微信 PC 与局域网 NAS 为什么会和 `198.18.x.x` 冲突？

理解 Fake-IP 的内存映射机制，就能明白为什么网页浏览飞快，偏偏即时通讯和内网设备容易抽风：

1. **微信电脑版 / 企业 IM 的长连接与多路校验冲突**：
   - 微信 PC 版不仅使用标准 HTTPS，还维护私有长连接协议（MMTLS）、内置 IP 直连兜底列表以及独立的文件/图片 CDN 校验逻辑。
   - 当微信请求图片或长连接域名被赋予 `198.18.0.85` 时，只要中间经历了一次**切换节点、重载订阅配置或核心短暂重启**（且未开启 `store-fake-ip`），核心内存里的 `198.18.0.85 -> 真实微信域名` 映射记录就会被清空或重新编号给另一个网站！而微信进程自己还在复用 `198.18.0.85` 发包，核心查不到对应域名或把包发错目标，直接返回 RST 复位，表现出来就是图片永远加载不出、消息一直转圈。
2. **局域网 NAS（SMB / WebDAV / mDNS）的路由黑洞与身份校验失败**：
   - 当你在文件资源管理器访问 `\\nas.local` 或浏览器打开 `http://dsm.lan:5000` 时，本应由本地路由器或局域网多播（mDNS）返回 `192.168.1.100`，流量走二层交换机直达，根本不该进代理核心。
   - 一旦 `.local` 或 `.lan` 未加入 `fake-ip-filter`，TUN 网卡的 `dns-hijack` 会抢先拦截查询并分配假地址（如 `198.18.0.102`）。随后发往 `198.18.0.102` 的 SMB `445` 端口流量被迫绕进用户态代理内核——如果核心内部 `nameserver` 配的是阿里/Cloudflare 公共 DNS，公共 DNS 自然查不到你家里的 `dsm.lan`，直接报 `no such host`；就算解析出了内网 IP，部分 NAS 的反向代理或 SMB 签名校验也会因源/目地址被转换而拒绝连接。

## 分层原因排除

### 本地系统与网络

- **操作系统、运行库与浏览器三级 DNS 缓存叠加**：Windows 的 `Dnscache` 服务、Java/Go/Electron 应用自身连接池、以及 Chrome/Edge 内置异步解析器各自维护缓存。当代理软件退出，TUN 虚拟网卡（通常绑定在 `198.18.0.1`）随之卸载，那些还拿着 `198.18.x.x` 缓存结果的程序发出的包会被系统送往默认物理网关（路由器），路由器面对保留测试段地址直接丢弃。
- **Windows NCSI 小地球图标与苹果 Captive Portal 误判**：Windows 通过解析 `dns.msftncsi.com` 是否等于特定固定 IP（如 `131.107.255.255`）来判断电脑有没有连上互联网！如果 Fake-IP 硬塞给它一个 `198.18.0.x`，Windows 会立刻判定当前网络存在劫持，任务栏右下角变成“无 Internet 访问”小地球图标，进而导致 Outlook、OneDrive、Microsoft Store 甚至部分依赖系统联网 API 的游戏启动器直接拒绝联网。

### 客户端与核心配置

- **未开启 `store-fake-ip` 持久化**：默认情况下若 `profile.store-fake-ip` 为 `false`，每次修改分流规则或切换配置文件重载核心时，Fake-IP 池都会从 `198.18.0.2` 重新顺序洗牌，造成全机现有应用集体断流一次。
- **默认 `fake-ip-range` 与内网 / VPN 网段冲突**：Mihomo 常见配置使用 `198.18.0.1/16`，sing-box 常见配置使用 `198.18.0.0/15`（含 IPv6 `fc00::/18`）。若公司拨号 VPN（如深信服 EasyConnect、思科 AnyConnect）下发了重叠路由，就会引发双向丢包。

### DNS 与路由分流

- **把 `nslookup` 返回 `198.18.x.x` 误判为“遭到恶意 DNS 劫持”**：Fake-IP 开启期间，向本地被劫持的 53 端口查询未在过滤表内的域名，返回 `198.18.x.x` 是预期设计。判断 DNS 是否真的异常，应当查看客户端「连接」面板里该假 IP 是否正确还原出了真实 `Host` 域名并命中预期策略组。
- **NTP 授时与 STUN 打洞域名被假地址干扰**：`time.windows.com` 或游戏 STUN 服务器域名一旦被返回假 IP，前者会在开机核心未就绪时阻断系统校时（详见 [系统时间不同步导致 TLS 握手失败](/troubleshooting/articles/time-sync-tls-cert-error)），后者会导致 WebRTC/联机游戏把 `198.18.x.x` 当作候选地址交换而打洞失败。

### 远端订阅与节点

- **订阅模板强开 Fake-IP 却清空过滤集**：部分在线订阅转换模板或机场精简配置只写了 `enhanced-mode: fake-ip`，既没有引入 `geosite:private`/`geosite:cn` 过滤，也没有列举常用办公与局域网后缀。

## `fake-ip-filter` 典型必配域名分类参考表

在维护自定义覆写规则时，可按以下五大高频故障类别核对你的 `fake-ip-filter` 清单（支持 `*` 单级通配、`+.` 多级域名及根域匹配，新版 Mihomo 还支持 `geosite:` 规则集）：

| 排除类别 | 典型域名 / 通配表达式 | 不排除时的典型故障症状 |
| :--- | :--- | :--- |
| **局域网、NAS 与路由器后台** | `*.lan`, `*.local`, `+.localdomain`, `+.home.arpa`, `router.asus.com`, `pi.hole` | 群晖/飞牛 NAS 域名访问超时、SMB 共享挂载失败、路由器管理域名打不开 |
| **系统联网状态探针（防小地球）** | `dns.msftncsi.com`, `*.msftncsi.com`, `*.msftconnecttest.com`, `captive.apple.com`, `connectivitycheck.gstatic.com` | Windows 状态栏显示“无 Internet”小地球、微软商店报无网、Wi-Fi 反复弹认证页 |
| **即时通讯与本地快速登录** | `+.weixin.qq.com`, `+.wechat.com`, `+.qpic.cn`, `localhost.ptlogin2.qq.com`, `localhost.sec.qq.com` | 微信 PC 图片裂开/文件发不出、网页快捷登录检测不到本地已登录的 QQ/企业微信 |
| **NTP 系统时钟同步池** | `time.*.com`, `time.*.gov`, `ntp.*.com`, `+.pool.ntp.org`, `time1.cloud.tencent.com` | 开机或休眠唤醒后系统对时超时，间接诱发 TLS 证书校验失败 |
| **游戏联机与语音 STUN 穿透** | `stun.*.*`, `stun.*.*.*`, `+.stun.twilio.com`, `*.turn.twilio.com`, `+.battlenet.com.cn` | Discord 语音卡连接、P2P 游戏获取本地/反射地址异常导致 NAT 受限 |

## 操作路径

以下按平台适用范围说明排查与修复步骤（Windows、macOS、Linux、OpenWrt 完整适用；**Android 与 iOS 客户端**如 Clash Meta for Android、FlClash、Shadowrocket、Stash 同样支持在 App 的 DNS 设置中补充 Fake-IP 跳过列表并开关飞行模式刷新移动网 DNS 缓存）。

### 步骤 1：验证当前域名是否落在 `198.18` 假地址池或存在残留缓存

在桌面终端对照检查系统解析结果与本地 DNS 缓存条目：

```powershell
# 适用 OS: Windows 10 / 11 (PowerShell)
# 目的: 查询目标域名（以微信或局域网域名为例）当前拿到的 IP，并检查系统 DNS 缓存中是否存在 198.18 记录
# 风险等级: 低（纯只读查询）
# 预期输出解读: 若返回 198.18.x.x，说明该域名未被 fake-ip-filter 放行（或客户端关闭后缓存未清）；放行修复后应返回真实公网/内网 IP
Resolve-DnsName -Name szshort.weixin.qq.com
Get-DnsClientCache | Where-Object { $_.Data -like "198.18.*" } | Select-Object Entry, Name, Data, TimeToLive
```

```bash
# 适用 OS: macOS / Linux (终端)
# 目的: 检查系统解析器对局域网或特定域名返回的实际地址
# 风险等级: 低（只读查询）
# 预期输出解读: 修复前若输出 198.18.0.x 说明被 Fake-IP 接管；加入 fake-ip-filter 并清缓存后应输出 192.168.x.x 或真实公网 IP
dig +short nas.local || getent hosts nas.local
```

### 步骤 2：配置 `fake-ip-filter` 与 `store-fake-ip`（推荐覆写法，更新订阅不丢失）

不要直接修改机场下发的原始订阅文件（下次点更新订阅就会被覆盖还原）。在 Clash Verge Rev 中打开「订阅 → 全局扩展配置（Merge）」或新建局部 Merge 覆写，填入如下配置：

```yaml
profile:
  store-selected: true
  store-fake-ip: true

dns:
  enable: true
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
  fake-ip-filter:
    - "*.lan"
    - "*.local"
    - "+.localdomain"
    - "+.home.arpa"
    - "localhost.ptlogin2.qq.com"
    - "dns.msftncsi.com"
    - "*.msftncsi.com"
    - "*.msftconnecttest.com"
    - "captive.apple.com"
    - "+.weixin.qq.com"
    - "+.wechat.com"
    - "+.qpic.cn"
    - "time.*.com"
    - "ntp.*.com"
    - "+.pool.ntp.org"
    - "stun.*.*"
    - "stun.*.*.*"
```

> [!NOTE]
> 如果你使用的是 Mihomo 较新版本且本地已配备完整 `geosite.dat`，还可以在 `fake-ip-filter` 列表中加入 `"geosite:private"` 与 `"geosite:connectivity-check"` 进一步覆盖各类私有域名与系统探针。在 **OpenWrt（OpenClash / Nikki）** 中，可在「插件设置 → DNS 设置 → Fake-IP 过滤」开启自动同步常用过滤列表，并把自建 NAS 域名追加进去。

### 步骤 3：彻底清理操作系统与浏览器 DNS 缓存并验证恢复

修改完 `fake-ip-filter` 重载核心后（或者当你退出代理后遇到断网残留时），必须刷新各级缓存才能让应用立刻丢掉旧的 `198.18.x.x` 地址：

```powershell
# 适用 OS: Windows 10 / 11 (PowerShell)
# 目的: 清空 Windows 系统 DNS 客户端缓存，并立即复测微信与连通性探针域名是否已恢复真实 IP
# 风险等级: 低（安全缓存清理）
# 预期输出解读: Clear-DnsClientCache 无报错返回，随后 Resolve-DnsName 输出真实 IP（如 dns.msftncsi.com 返回 131.107.255.255，微信返回真实腾讯 CDN IP）
Clear-DnsClientCache
Resolve-DnsName -Name dns.msftncsi.com | Select-Object Name, IPAddress
Resolve-DnsName -Name szshort.weixin.qq.com | Select-Object Name, IPAddress
```

```bash
# 适用 OS: Linux (systemd-resolved 环境) 与 macOS
# 目的: 清空系统级 DNS 缓存并查看缓存统计归零
# 风险等级: 低（仅刷新缓存）
# 预期输出解读: Linux 下 Current Cache Size 变为 0；重新解析过滤域名不再出现 198.18.x.x
# Linux 执行:
sudo resolvectl flush-caches && resolvectl statistics | grep "Current Cache Size"
# macOS 执行:
# sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder
```

**浏览器与微信端收尾动作**：
- 若 Chrome / Edge 里某个刚才打不开的内网页面仍残留假地址，在地址栏输入 `chrome://net-internals/#dns`（Edge 为 `edge://net-internals/#dns`）点击 **Clear host cache**，再切到左侧 **Sockets** 点击 **Flush socket pools**。
- 若微信 PC 版正处于假死重连状态，无需重启电脑，退出微信客户端重新登录一次即可拿到过滤后的真实 IP。

### 步骤 4：特殊开发/内网环境下修改网段或切回 `redir-host`

如果本地运行了大量需要真实 IP 反向校验的数据库、Docker 桥接网络、K8s 集群或严苛游戏反作弊程序：
- **仅网段撞车**：将 `fake-ip-range` 从 `198.18.0.1/16` 改为未冲突的另一半保留段（如 `198.19.0.1/16`）。
- **彻底停用假地址池**：在 Merge 覆写中将 `enhanced-mode: fake-ip` 改为 `enhanced-mode: redir-host`，同时开启 `sniffer: { enable: true, force-dns-mapping: true, parse-pure-ip: true }` 域名嗅探，既让本地所有软件拿到真实 IP，又能让内核从 TLS SNI / HTTP Host 中识别域名完成精准分流。

## 什么结果算修复

1. **终端复测过滤生效**：开启 TUN + Fake-IP 状态下，在终端执行 `Resolve-DnsName dns.msftncsi.com` 返回 `131.107.255.255`，执行局域网 NAS 或微信域名查询返回真实 `192.168.x.x` 或公网 IP，而查询海外目标网站仍正常走 Fake-IP 毫秒级响应。
2. **微信与内网服务稳定**：微信 PC 版收发高清大图、文件传输与语音流畅不断线，Windows 右下角网络图标恢复正常电脑/Wi-Fi 图标（小地球消失），`\\nas.local` 共享文件夹秒开。
3. **退出代理无断网后遗症**：正常退出客户端或关闭 TUN 后，系统缓存无长期卡死的 `198.18.x.x` 连接。

## 若仍失败怎么办

- 若改回 `redir-host` 后出现网页打开明显变慢，或海外域名在客户端日志里解析出了被污染的错误 IP，需按标准路径排查上游 `nameserver` 与分流：[DNS 污染与 DNS 泄漏标准检查路径](/troubleshooting/articles/dns-leak-hijack-fix)。
- 若添加 Merge 覆写后客户端提示核心启动失败或规则报错，请用 `-t` 参数检查缩进语法：[Mihomo 核心启动失败与 YAML 语法报错排查](/troubleshooting/articles/clash-verge-mihomo-yaml-fail)。
- 若发现只有 Chrome/Edge 浏览器打不开个别网站，请检查浏览器「安全设置」里是否单独开启了自带加密 DNS（安全 DNS / DoH）绕过了本地 Fake-IP 拦截：[仅个别网站或 AI 工具打不开排查](/troubleshooting/articles/specific-sites-unreachable)。

## 高风险操作与回滚提示

> [!WARNING]
> 修改配置或清理网络状态前，**严禁将带有真实 Token 的完整订阅链接或运行态 YAML 粘贴给第三方在线转换站或公开排障帖**；也不要通过关闭防病毒软件或停用防火墙来排查 Fake-IP 问题。

- **修改 Merge 覆写、`fake-ip-range` 或切换 `redir-host` 的回滚**：
  1. 由于我们在步骤 2 中使用的是客户端独立的「全局扩展配置（Merge）」而非直接篡改原订阅，一旦填入格式有误或切换 `redir-host` 后觉得首包变慢，只需在 Clash Verge Rev「订阅」页面**关闭该扩展配置的启用开关**并点击重载，1 秒钟即可 100% 退回原始订阅状态。
  2. 修改回滚后，顺手再执行一次 `Clear-DnsClientCache` 清理过渡期缓存即可。
- **OpenWrt（OpenClash / Nikki）修改 DNS 规则回滚**：
  - 修改前在插件后台导出备份或通过 SSH 执行 `cp /etc/config/openclash /etc/config/openclash.bak`。若改错导致全屋设备解析异常，恢复 `.bak` 文件并执行 `/etc/init.d/openclash restart`（Nikki 为 `/etc/init.d/nikki restart`），并在电脑端重新断开连接一次 Wi-Fi 即可恢复。

## 常见问题

### 为什么我 ping 百度或谷歌都返回 198.18.0.x 且延迟只有 1ms？

这是 Fake-IP 模式正常工作的标志。198.18.0.0/15 是 RFC 2544 保留的基准测试网段，客户端本地内置 DNS 故意给每个查询的域名分配一个 198.18.x.x 占位 IP，把“域名到真实目标的映射”留在内核内存中，从而省去等待远端真实 DNS 返回的时间，并在 TUN 模式下精确识别域名规则。因此此时 ping 测试看到的 1ms 只是本地虚拟网卡的响应，不代表真实节点延迟。

### 为什么微信电脑版、企业 OA 或局域网设备在 Fake-IP 下容易掉线或图片加载不出？

部分应用内置了连接复用、自建 HTTP/TCP 校验或局域网服务发现，它们拿到 198.18.x.x 假地址后，一旦客户端重启、缓存过期或通过直连路由绕开虚拟网卡，旧连接与真实目标对不上号，就会不断重连或卡死。把对应域名加进 fake-ip-filter 放行真实解析，即可恢复正常。

### Fake-IP 和 Redir-Host 应该选哪一个？

日常 TUN 模式、追求降低首包解析延迟以及避免 DNS 泄漏时，优先使用配合完整 fake-ip-filter 的 Fake-IP；如果在软路由或本地开发环境下频繁出现 Docker、数据库、公司内网域名冲突，或者有特定游戏反作弊对保留地址段敏感，切换为 Redir-Host 会更省心。

### 为什么我已经退出了 Clash / Mihomo 客户端，浏览器或微信还是打不开网页并连向 198.18.x.x？

因为操作系统（Windows DNS Client / macOS mDNSResponder）和浏览器自身都会根据 TTL 缓存之前的 DNS 记录。客户端退出后虚拟网卡已经销毁，但系统缓存里的 198.18.x.x 尚未过期，数据包发往物理网关后被直接丢弃。执行系统 DNS 缓存刷新并清理浏览器 Host 缓存即可立即恢复。

## 相关教程与替代入口

- 进阶 DNS 教程：[DNS 与 Fake-IP 配置及回滚指南](/guides/dns-setup/) ｜ [TUN 模式详解](/guides/tun-mode/)
- 泄漏与连网检查：[DNS 污染与 DNS 泄漏排查](/troubleshooting/articles/dns-leak-hijack-fix) ｜ [连上节点但打不开网页排查](/troubleshooting/articles/connected-no-internet)
- 专题汇总：[DNS 错误排查专题](/troubleshooting/dns-error/) ｜ [分流规则配置指南](/guides/split-routing/)
- 客户端参考：[Clash Verge Rev 专题](/clients/clash-verge/) ｜ [Mihomo 内核说明](/clients/mihomo/)
