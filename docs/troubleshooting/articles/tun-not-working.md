---
title: 'TUN 模式开启无效怎么修：虚拟网卡冲突与服务授权排查'
description: '针对 Clash Verge Rev、Mihomo 与 v2rayN 开启 TUN 模式后流量仍直连或直接断网的问题，按虚拟网卡驱动、服务模式授权、路由环路与各平台权限分层排查并附回滚方案。'
pillar: troubleshooting
category: cannot-connect
primaryKeyword: 'TUN模式开启无效'
intent: troubleshooting
publishedAt: '2026-11-23'
updatedAt: '2026-11-23'
breadcrumbs:
  - text: '首页'
    link: '/'
  - text: '故障排查'
    link: '/troubleshooting/'
  - text: '连接不上'
    link: '/troubleshooting/cannot-connect/'
  - text: 'TUN 开启无效排查'
howTo:
  name: '排查并修复代理客户端 TUN 模式开启无效'
  description: '通过检查服务权限、清理冲突虚拟网卡、校准堆栈与回环排除参数，恢复 TUN 虚拟网卡全局接管能力。'
  step:
    - name: '核对管理员权限与服务模式状态'
      text: '在 Windows 安装或重启客户端 Service Mode，或在 macOS/Linux 以授权权限启动核心。'
    - name: '检查虚拟网卡是否创建及 IP 冲突'
      text: '查看系统网络适配器中是否出现 Meta/sing-tun/wintun 网卡，并排查与其他 VPN 虚拟网卡的网段或跃点数冲突。'
    - name: '校准 TUN 堆栈与自排除配置'
      text: '确认核心启用 auto-route、auto-detect-interface（或对应排除规则），并将 TUN stack 在 system、gvisor 与 mixed 之间切换测试。'
    - name: '验证非浏览器流量接管情况'
      text: '用终端或非代理感知工具验证连接是否经过虚拟网卡并正常返回预期出口结果。'
faq:
  - q: '为什么系统代理能正常上网，一打开 TUN 模式就毫无反应或直接断网？'
    a: '系统代理只修改浏览器的 HTTP/SOCKS 端口指向，不需要操作系统级网卡权限；而 TUN 模式必须创建虚拟网卡并写入系统路由表。未安装服务模式、缺少管理员权限、Wintun 驱动被占用，或未开启自动路由排除，都会导致虚拟网卡建不起来或把代理自己的出站流量又绕回 TUN 形成死循环。'
  - q: 'Windows 开启 Clash Verge Rev 的 TUN 模式一定要开服务模式（Service Mode）吗？'
    a: '是的，在普通用户权限下直接打开开关通常无法创建 Wintun 网卡或修改路由表。安装并启用服务模式后，后台守护服务会以系统权限接管核心运行，普通桌面窗口即可随时开关 TUN，无需每次右键“以管理员身份运行”。'
  - q: '同时装了企业 VPN、WireGuard 或安卓模拟器会导致 TUN 失效吗？'
    a: '会。多个虚拟网卡同时竞争默认路由（0.0.0.0/0）或占用同一套 198.18.0.0/16 地址段时，后启动的客户端往往接管失败。建议在排查时先完全退出其他 VPN、远程组网工具，并检查网络适配器中是否存在残留的失效虚拟网卡。'
---

# TUN 模式开启无效怎么修：虚拟网卡冲突与服务授权排查

## 核心结论（Answer-First）

代理客户端开启 TUN 模式后无效或断网，九成源于**缺少系统级权限（未安装服务模式/无管理员权限）**、**虚拟网卡驱动被残留网卡或第三方 VPN 占用**，以及**核心未排除自身出站网卡引发路由环路**。排障应先核对网络适配器中是否生成活跃 TUN 网卡，再授权服务模式、切换 `mixed`/`gvisor` 堆栈并停用冲突网卡，切勿直接关闭安全软件。

## 故障现象

开启客户端的 TUN 开关后，通常出现以下几类典型表征：

- **开关自动弹回或弹窗报错**：客户端提示 `Start TUN failed`、`configure tun interface: Access is denied.`、`operation not permitted` 或 `wintun.dll` 加载异常。
- **开关显示已打开，但流量完全不走代理**：终端 `curl` 或游戏仍然走本地宽带 IP，系统适配器列表中看不到 `Meta`、`Mihomo`、`sing-tun` 或 `utun` 接口。
- **一开 TUN 全网断流**：网页、微信和节点测速同时失效，核心日志不断刷出 `dial tcp ... i/o timeout` 或 `use of closed network connection`（典型自循环/路由环路）。
- **端口或网卡名冲突**：日志出现 `interface already exists`、`bind: address already in use` 或 `dns-hijack` 绑定 53 端口失败。

## 先做 3 个低风险检查

1. **确认是否关闭了重叠的网络代理与组网软件**：完全退出企业 SSL VPN、游戏加速器、Tailscale、ZeroTier 或另一款代理客户端（不要只点关闭窗口，需从托盘彻底退出），避免多条默认路由打架。
2. **检查当前节点本身在系统代理下是否可用**：先暂时关闭 TUN，切回系统代理模式测试同一个节点能否打开网页。若系统代理也全超时，说明问题不在 TUN，而在于节点或本地网络，应先排查节点连通性。
3. **观察适配器与客户端日志是否报错**：打开客户端日志页（如 Clash Verge Rev 的日志面板或 v2rayN 的信息输出区），在点击 TUN 开关的瞬间观察是否有红色报错关键词（如权限拒绝、53 端口占用、驱动创建失败）。

## 分层原因排除

### 本地系统与网络

- **权限不足**：Windows 创建 Wintun 虚拟网卡与写入系统路由必须拥有管理员或 SYSTEM 服务权限；macOS 需要授权系统扩展或管理员密码启动核心；Linux 需要 `CAP_NET_ADMIN` 能力或 root。
- **虚拟网卡驱动残留或冲突**：此前安装过 Clash for Windows、旧版 Clash Nyanpasu、OpenVPN TAP 或模拟器桥接网卡，可能导致网络适配器列表残留幽灵网卡或损坏的 Wintun 驱动，导致新建接口重名或路由跃点数（Metric）高于当前 TUN。
- **多网卡与 IPv6 干扰**：电脑同时插着网线和连着 Wi-Fi，或开启了本地不完整的 IPv6 网关，而核心自动探测出站网卡（`auto-detect-interface`）选错接口，流量就会卡死。

### 客户端与核心配置

- **Service Mode 未安装或已停止**：Clash Verge Rev 等客户端在 Windows 上若未安装/启动 Service Mode，UI 勾选 TUN 只会报错或静默失效；v2rayN 开启 TUN 同样提示需要以管理员身份重启。
- **TUN `stack` 不兼容**：部分老旧 Windows 网卡驱动、特定安全沙盒或 WSL2 环境对 `system` 堆栈兼容不佳，换成 `gvisor` 或 `mixed` 堆栈即可恢复；反之追求局域网穿透时 `gvisor` 可能表现异常。
- **DNS 劫持端口被占用**：TUN 默认需要劫持 `any:53` 的 DNS 请求，若本地运行了 AdGuard Home、SmartDNS、Windows 共享网络（ICS）或虚拟机内置 DNS 服务占用了 UDP/TCP 53 端口，TUN 启动流程会卡在 DNS 监听阶段。

### DNS 与路由分流

- **未配置自动路由或自排除缺失**：在 Mihomo 配置中缺少 `auto-route: true` 与 `auto-detect-interface: true`（或 sing-box 缺少 `auto_route`），虚拟网卡即使建起来，系统流量也不会被路由进去；若同时指定了错误的 `interface-name`，代理核心发往远端节点的加密包也会被重导回 TUN 网卡，造成死循环。
- **严格路由与局域网网段重叠**：部分客户端默认开启 `strict-route`，若用户本地路由器刚好使用 `198.18.0.0/16` 或与 TUN 地址池冲突的网段，局域网设备与代理流量会同时中断。

### 远端订阅与节点

- **机场覆写配置强行覆盖了本地 TUN 参数**：某些订阅自带的 YAML 头部写了静态 `interface-name: eth0` 或禁用了 `dns.enable: true`、`tun.enable: false`，客户端每次更新订阅后就把用户本地的 TUN 配置覆盖回失效状态。
- **节点不支持 UDP 转发导致误判**：开启 TUN 后如果游戏语音或 QUIC/HTTP3 请求不通，有时并非 TUN 网卡本身失效，而是所选节点或中转链路阻断了 UDP。

## 操作路径

以下按操作系统说明具体排查与修复步骤（Windows、macOS、Linux、Android、OpenWrt 适用；**iOS 平台不适用传统桌面式手动 Wintun/Service 排查**，因为 iOS 由系统 `NEPacketTunnelProvider` 统一托管，权限弹窗授权后即自动生效，若失效多为系统 VPN 配置损坏或配置文件规则问题）。

### 步骤 1：确认并授予系统级虚拟网卡权限

- **Windows（Clash Verge Rev / v2rayN）**：
  - Clash Verge Rev：进入「设置」→ 找到「服务模式（Service Mode）」→ 点击安装并确认状态为运行中，随后在主界面打开 TUN 开关。
  - v2rayN：底部启用「Tun 模式」时若提示权限不足，先退出程序，右键 `v2rayN.exe` 选择「以管理员身份运行」（或按内置提示启用管理员权限自启服务）。
- **macOS（Clash Verge Rev / Mihomo / sing-box）**：
  - 桌面端开启 TUN 时系统会弹出管理员授权框，输入密码给核心授予 `utun` 与路由表修改权限；若使用 sing-box 官方 macOS 客户端（SFM），需在「系统设置 → 隐私与安全性」及「VPN」中允许系统扩展。
- **Android（Clash Meta for Android / v2rayNG / SFA）**：
  - 安卓所有标准代理客户端均通过系统 `VpnService` 模拟 TUN。若开启失败，进入系统设置检查是否已授予 VPN 权限，且不要同时开启系统自带「始终开启的 VPN」指向另一个已卸载或未运行的应用。
- **Linux（Clash Verge Rev / Mihomo / sing-box）**：
  - 使用包管理或 AppImage 运行时，需为核心二进制文件授予 `cap_net_admin` 权限，或在桌面端按提示输入 `sudo`/polkit 密码。
- **OpenWrt（OpenClash / Nikki / HomeProxy）**：
  - 需确认已安装对应内核模块 `kmod-tun` 及 `nftables`/`iptables` 透明代理依赖；注意如 Nikki 等新派工具要求 OpenWrt 24.10 及以上版本。

检查虚拟网卡与默认路由是否真正生效，可运行以下终端排查命令：

```powershell
# 适用 OS: Windows (PowerShell)
# 目的: 查看虚拟网卡是否存在、状态是否为 Up，以及是否存在多个冲突 VPN 网卡
# 风险等级: 低（只读查询）
# 预期输出解读: 正常开启 TUN 后应看到名称类似 Meta、Mihomo 或 sing-tun 且 Status 为 Up 的网卡；若看到多个其他 VPN 网卡同时为 Up，需停用冲突项
Get-NetAdapter | Select-Object Name, InterfaceDescription, Status, ifIndex
```

```powershell
# 适用 OS: Windows (PowerShell)
# 目的: 检查 IPv4 默认路由 0.0.0.0/0 是否正确指向虚拟网卡或保留物理出站旁路
# 风险等级: 低（只读查询）
# 预期输出解读: 开启 auto-route 后通常可见跃点数较低的虚拟网卡路由（或分段 0.0.0.0/1 与 128.0.0.0/1 路由）；若完全没有虚拟网卡路由条目，说明权限或 auto-route 未生效
Get-NetRoute -AddressFamily IPv4 | Where-Object { $_.DestinationPrefix -in @('0.0.0.0/0', '0.0.0.0/1', '128.0.0.0/1') } | Format-Table DestinationPrefix, NextHop, InterfaceAlias, RouteMetric
```

```bash
# 适用 OS: macOS / Linux (终端)
# 目的: 检查是否成功创建 utun / tun 虚拟接口及核心是否被授予网络能力
# 风险等级: 低（只读查询）
# 预期输出解读: macOS 应看到新增的 utunX 接口且含 inet 198.18.0.1（或类似内网地址）；Linux 应看到 Meta / tun0 等 UP 状态接口
ifconfig | grep -A 3 -E "^(utun|tun|Meta|sing)"
```

### 步骤 2：排查 53 端口占用与残余虚拟网卡冲突

若终端看到虚拟网卡根本没出现，先查 53 端口是否被本地程序占用：

```powershell
# 适用 OS: Windows (PowerShell)
# 目的: 排查本地 UDP/TCP 53 端口是否被其他 DNS 服务或共享网络占用导致 TUN DNS 劫持失败
# 风险等级: 低（只读查询）
# 预期输出解读: 正常未启动 TUN 时 53 端口应无第三方程序占用；若出现 dnscrypt、SmartDNS 或 svchost（ICS 服务）占用，需先停止对应服务再开 TUN
Get-NetUDPEndpoint -LocalPort 53 -ErrorAction SilentlyContinue | Select-Object LocalAddress, LocalPort, OwningProcess
```

若发现以前残留的废弃虚拟网卡（例如已卸载的客户端留下的 Wintun 设备）：
1. 打开 Windows「设备管理器」→ 展开「网络适配器」。
2. 仅右键卸载**明确已不再使用的旧客户端遗留虚拟网卡**（如已卸载的 `Clash Tunnel`），不要误删主板有线网卡、Wi-Fi 网卡或正在使用的虚拟机网卡。
3. 重启电脑后重新安装客户端 Service Mode。

### 步骤 3：调整 TUN 堆栈与订阅覆写配置

如果虚拟网卡已生成但仍然断网，检查核心的 TUN 参数：
- 在 Clash Verge Rev 的「设置 → TUN 设置」中：
  - 将堆栈（`Stack`）从 `system` 依次切换为 `mixed` 或 `gvisor` 测试。
  - 确保开启 `自动路由（auto-route）` 与 `自动选择出站接口（auto-detect-interface）`。
  - 检查「DNS 设置」是否启用了内置 DNS（`dns.enable: true`）；若未开启 DNS，TUN 接管后极易因域名无法解析而表现为“打不开网页”。
- 如果每次更新机场订阅后配置都会被重置，请通过客户端的「全局扩展配置 / 覆写（Merge / Script）」锁定本机的 `tun` 与 `auto-detect-interface` 字段，避免远端 YAML 写死错误的网卡名。

### 步骤 4：验证非浏览器流量与出站结果

完成上述调整后，用命令行或独立软件验证 TUN 是否真正接管了全局 TCP/DNS 请求：

```bash
# 适用 OS: Windows / macOS / Linux (终端)
# 目的: 在不手动设置环境变量代理的情况下，验证系统全局请求是否已通过 TUN 虚拟网卡转发
# 风险等级: 低（只读网络请求）
# 预期输出解读: 返回的 IP 或国家代码应与当前所选代理节点出口一致；若仍返回本地宽带公网 IP，说明 TUN 路由未接管或存在分流直连规则
curl -I https://www.cloudflare.com/cdn-cgi/trace
```

## 什么结果算修复

满足以下全部可观测指标，即可确认 TUN 模式已恢复正常：

1. **接口就绪**：Windows `Get-NetAdapter` 或 macOS/Linux `ifconfig` 中存在活跃的 TUN 虚拟接口（状态 `Up`，带有效内网地址）。
2. **日志无权限或环路错误**：客户端日志不再出现 `Access is denied`、53 端口绑定失败或大量 `i/o timeout` 死循环报错。
3. **非代理感知软件可用**：无需在终端设置 `HTTP_PROXY` 环境变量，直接执行 `curl`、Git 拉取或打开桌面应用均可稳定通过选定节点出口通信。
4. **本地局域网未中断**：同一局域网下的打印机、NAS 或路由器管理页（如 `192.168.x.x`）仍可直接访问。

## 若仍失败怎么办

- 若开启 TUN 后浏览器仍打不开但终端能通，排查浏览器自身的「安全 DNS（DoH）」设置，以及系统代理是否残留了失效的本地端口；详见 [连上节点但所有网页打不开排查](/troubleshooting/articles/connected-no-internet)。
- 若只要打开 TUN 模式部分国内软件（如微信桌面端）就异常，多半涉及 Fake-IP 与内网段冲突，建议继续阅读 [Fake-IP 原理与 198.18.0.1 异常修复](/troubleshooting/articles/fake-ip-explained-fix)。
- 若不确定当前环境究竟该用 TUN 还是系统代理，可参考 [TUN 模式与系统代理区别与断网修复](/troubleshooting/articles/tun-vs-system-proxy)。
- 若长期报错且服务模式反复安装失败，可将配置导出后先用系统代理兜底，并按 [旧客户端安全迁移与备份指南](/troubleshooting/articles/client-migration-backup) 清理并重装干净版本，切勿随意在网上下载来路不明的第三方修改版驱动。

## 高风险操作与回滚提示

> [!WARNING]
> **严禁盲目关闭杀毒软件或系统防火墙**来“解决”驱动问题，也不得向任何公开工单或网页工具上传包含 Token 的订阅链接或私钥。所有涉及网卡驱动、系统服务与防火墙的变更均应保留回滚路径。

- **安装/卸载 Service Mode 的回滚**：若安装服务模式后出现开机卡顿或无法卸载，可在 Clash Verge Rev 设置中先点击「卸载服务模式」；若客户端无法打开，以管理员身份运行 PowerShell 执行 `sc.exe stop "Clash Verge Service"` 与 `sc.exe delete "Clash Verge Service"`（具体服务名先用 `Get-Service *clash*` 核对）即可恢复安装前状态。
- **卸载虚拟网卡与重置驱动的回滚**：修改或卸载网卡前，建议先记录当前物理网卡的静态 IP/DNS 配置（若非 DHCP 自动获取）。若误删了物理或无线网卡，只需在设备管理器点击操作栏「扫描检测硬件改动」或重启电脑，Windows 会自动重新加载标准硬件驱动；若是自行替换过 `wintun.dll`，务必先将原文件重命名为 `wintun.dll.bak` 备份，异常时改回原名并重启服务即可。
- **OpenWrt 防火墙/TUN 模块变更回滚**：修改 `/etc/config/firewall` 或透明代理规则前，先执行 `cp /etc/config/firewall /etc/config/firewall.bak`；一旦路由器失联或断网，立即还原备份文件并执行 `/etc/init.d/firewall restart`。

## 常见问题

### 为什么系统代理能正常上网，一打开 TUN 模式就毫无反应或直接断网？

系统代理只修改浏览器的 HTTP/SOCKS 端口指向，不需要操作系统级网卡权限；而 TUN 模式必须创建虚拟网卡并写入系统路由表。未安装服务模式、缺少管理员权限、Wintun 驱动被占用，或未开启自动路由排除，都会导致虚拟网卡建不起来或把代理自己的出站流量又绕回 TUN 形成死循环。

### Windows 开启 Clash Verge Rev 的 TUN 模式一定要开服务模式（Service Mode）吗？

是的，在普通用户权限下直接打开开关通常无法创建 Wintun 网卡或修改路由表。安装并启用服务模式后，后台守护服务会以系统权限接管核心运行，普通桌面窗口即可随时开关 TUN，无需每次右键“以管理员身份运行”。

### 同时装了企业 VPN、WireGuard 或安卓模拟器会导致 TUN 失效吗？

会。多个虚拟网卡同时竞争默认路由（0.0.0.0/0）或占用同一套 198.18.0.0/16 地址段时，后启动的客户端往往接管失败。建议在排查时先完全退出其他 VPN、远程组网工具，并检查网络适配器中是否存在残留的失效虚拟网卡。

## 相关教程与替代入口

- 原理与选型对比：[TUN 模式与系统代理的区别与切换断网修复](/troubleshooting/articles/tun-vs-system-proxy)
- 模式配置指南：[TUN 模式详解：虚拟网卡授权与路由环路预防](/guides/tun-mode/)
- 客户端专属说明：[Clash Verge Rev 专题](/clients/clash-verge/) ｜ [v2rayN 客户端专题](/clients/v2rayn/) ｜ [Mihomo 内核说明](/clients/mihomo/)
- 其他连不上故障：[连接不上排查专题](/troubleshooting/cannot-connect/) ｜ [品牌替代参考](/brands/)
