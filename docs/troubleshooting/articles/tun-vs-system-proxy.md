---
title: 'TUN 模式与系统代理有什么区别：适用场景与切换断网修复'
description: '深入解析 TUN 虚拟网卡模式与 HTTP/SOCKS 系统代理的底层机制差异、各自适用场景，以及在 Clash Verge Rev、v2rayN 中切换模式后出现全网断连的修复方法。'
pillar: troubleshooting
category: cannot-connect
primaryKeyword: 'TUN模式与系统代理区别'
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
  - text: 'TUN 与系统代理对比'
howTo:
  name: '在 TUN 模式与系统代理间安全切换并修复切换断网'
  description: '依据使用场景选择合适代理模式，并在切换后清理残留系统代理设置、刷新路由与 DNS 缓存以恢复上网。'
  step:
    - name: '明确两种模式的工作层级与场景'
      text: '仅浏览网页选系统代理，需要接管命令行、UWP、游戏或不支持代理的桌面软件时选 TUN 模式。'
    - name: '先停用旧模式并清理残留状态'
      text: '关闭软件前或切换前先取消原模式开关，核对系统代理和虚拟网卡没有双开或残余挂起。'
    - name: '清理 Windows 注册表或系统代理残留'
      text: '当关闭系统代理后仍断网，检查系统设置或注册表 ProxyEnable 是否还原为 0。'
    - name: '刷新 DNS 缓存并验证当前模式生效'
      text: '清理由 Fake-IP 切换回直连或系统代理时遗留的 DNS 缓存，再用浏览器和终端分别验证连通性。'
faq:
  - q: '系统代理和 TUN 模式能同时打开吗？'
    a: '技术上部分客户端允许同时勾选，但日常使用强烈不建议双开。两者同时打开时，浏览器流量先走本地 HTTP 端口、再可能经过不同的分流或 DNS 逻辑，不仅浪费本地转发开销，还容易在关闭其中一个开关后留下半截配置，引发莫名断网或网页打不开。'
  - q: '为什么我关闭了 TUN 或退出了客户端，电脑就连国内网页都打不开了？'
    a: '常见有两个原因：一是你此前同时开过系统代理且未正常退出，系统注册表里的代理端口（如 127.0.0.1:7897）还开着，软件退出后端口没人监听就会全部报错；二是之前 TUN 配合 Fake-IP 解析留下的 198.18.x.x DNS 缓存尚未过期，系统仍在尝试往不存在的虚拟网段发包。'
  - q: '平时只用浏览器查资料，有必要一直开着 TUN 模式吗？'
    a: '没有必要。仅用 Chrome、Edge 等常规浏览器时，系统代理资源占用更低、不需要虚拟网卡驱动和系统级权限，也不会干扰企业内网或局域网应用。只有当遇到终端命令行、游戏联机或无视系统代理的桌面软件时，再切到 TUN 模式即可。'
---

# TUN 模式与系统代理有什么区别：适用场景与切换断网修复

## 核心结论（Answer-First）

**系统代理**工作在应用层，仅向系统登记本地 HTTP/SOCKS 端口，只接管浏览器等代理感知应用；**TUN 模式**通过虚拟网卡接管整机网络层 IP 数据包，支持命令行、游戏与 UDP 流量。切换两者后断网，通常源于**双开导致代理端口残留、Fake-IP 缓存未刷新，或退出后系统路由未还原**。日常仅用浏览器选系统代理即可，需全局接管再开 TUN。

## 故障现象

许多用户在 Clash Verge Rev、v2rayN 或 Clash Nyanpasu 中反复切换“系统代理”和“TUN 模式”后，会遇到以下故障：

- **切回系统代理或退出客户端后全网瘫痪**：浏览器提示 `ERR_PROXY_CONNECTION_FAILED` 或 `ERR_CONNECTION_REFUSED`，哪怕微信能收消息，网页却完全打不开。
- **从系统代理切到 TUN 后网页反而打不开**：浏览器报 `DNS_PROBE_FINISHED_NXDOMAIN`，或页面一直转圈后超时。
- **部分软件走了代理，部分软件依然直连**：开着系统代理时 Git、Docker、Python pip、Windows Store（UWP）依然无法连接目标地址。
- **双开模式导致延迟翻倍或局部断流**：客户端两个开关同时亮着，关闭其中一个后网络立刻全部中断。

## 先做 3 个低风险检查

1. **检查客户端是不是同时打开了“系统代理”和“TUN 模式”**：只保留你需要的那一个开关，另一个保持关闭，测试单模式是否立刻恢复。
2. **查看系统自带代理开关是否被“锁死”**：在 Windows「设置 → 网络和 Internet → 代理」或 macOS「系统设置 → 网络 → 代理」里，确认当你关闭客户端系统代理后，里面的“使用代理服务器”是否已经变成关闭状态。
3. **测试故障范围是“全断”还是“仅网页断”**：如果在客户端断开后，桌面端 QQ/微信还能发消息，而 Chrome 打不开网页，这几乎 100% 是系统代理端口残留（`127.0.0.1:7897` 或 `10809` 没清掉）导致，不是宽带坏了。

## 分层原因排除

### 本地系统与网络

- **应用层代理（系统代理）的局限性**：Windows 的系统代理写的是 `WinINet` 注册表项，macOS 写的是 `networksetup` 代理配置。终端工具（`curl`、Git、npm）、多数游戏、Windows UWP 应用和部分桌面客户端默认不读取系统代理，因此即便系统代理正常工作，它们也会直连或失败。
- **非正常退出导致配置脏残留**：直接强杀客户端进程、电脑突然蓝屏或睡眠唤醒，会导致客户端来不及执行“退出清理”，系统依然把流量送往已关闭的本地端口，或者路由表中残留了虚拟网卡的缺省路由。

### 客户端与核心配置

- **端口差异与监听冲突**：Clash Verge Rev 默认混合端口常为 `7897`，v2rayN 默认 SOCKS/HTTP 端口常为 `10808`/`10809`。若旧进程未退出或开了两款客户端，新客户端无法绑定端口，系统代理指向的其实是死端口或另一套失效核心。
- **核心启动策略差异**：系统代理模式下，很多客户端只启动内核代理监听；切到 TUN 模式后，需要重启核心并触发管理员/Service Mode 创建虚拟网卡。如果用户没有事先安装服务模式，切过去的一瞬间核心报错退出，原本的系统代理也被取消，结果就是“一开就断”。

### DNS 与路由分流

- **Fake-IP 遗留缓存冲突**：TUN 模式常默认配合 Fake-IP（`198.18.0.0/16`）使用。当你从 TUN 切回系统代理或直连时，Windows 或浏览器自身的 DNS 缓存里还存着刚才访问网站时拿到的 `198.18.x.x` 假地址。没有虚拟网卡以后，发往 `198.18.x.x` 的包无处可去，网页只能等待超时。
- **TUN 的默认路由覆盖优先级**：在虚拟网卡启动期间，若配置里包含 `strict-route` 或低跃点数默认路由，部分内置内网解析或校园网认证页面可能会被一并吸进虚拟网卡里而无法弹出认证页。

### 远端订阅与节点

- **节点 UDP 转发支持度不同**：系统代理大多数时候处理的是浏览器 TCP 流量；一旦切到 TUN 模式，QUIC（HTTP/3、UDP 443）和游戏 UDP 包全部涌入节点。若远端节点本身不支持 UDP 或中途丢包严重，用户会体感“系统代理很快，切到 TUN 网页和视频反而打不开”。

## 两种模式核心差异对照

| 对比维度 | 系统代理（System Proxy） | TUN 模式（虚拟网卡） |
| --- | --- | --- |
| 工作层级 | 应用层（HTTP / SOCKS5） | 网络层 / 传输层（L3/L4 IP 包接管） |
| 权限要求 | 普通用户权限即可 | 桌面端需管理员 / Service Mode / root；移动端需系统 VPN 权限 |
| 适用软件 | 主流浏览器、支持填写代理的软件 | 几乎全部系统软件、终端命令行、游戏、UWP（不含被明确排除项） |
| UDP 支持 | 仅限主动走 SOCKS5 UDP 的少数程序 | 原生支持系统级 UDP 接管（依赖节点本身支持 UDP） |
| 资源与稳定性 | 开销极低、几乎不干扰局域网与校园网 | 需维持虚拟网卡与系统路由，切换或休眠唤醒时更易受驱动影响 |
| 推荐场景 | 日常网页浏览、办公轻度使用 | 开发终端、游戏联机、全局防漏、无视系统代理的软件 |

## 操作路径

以下按操作步骤说明如何在 Windows、macOS、Linux 上安全切换模式并修复切换断网；对于 **Android 与 iOS 移动设备**，系统本身不存在桌面端意义的“自动修改全局浏览器注册表代理”，绝大多数手机客户端（Shadowrocket、v2rayNG、Clash Meta for Android）在系统层面只能通过 `VPN / PacketTunnel`（即 TUN 机制）接管流量，因此手机端不涉及“系统代理与 TUN 切换断网”问题（仅部分 root 安卓或 Wi-Fi 手动 HTTP 代理除外）；**OpenWrt 软路由**同理，主要使用透明代理（TProxy / Tun / Redirect），不适用桌面系统代理概念。

### 步骤 1：建立“单一主模式”原则，避免双开

- 若主要刷网页与看视频：在 Clash Verge Rev 或 v2rayN 中**关闭 TUN 模式**，仅开启**系统代理**。
- 若需要让命令行、Git、游戏或全系统走代理：先**关闭系统代理**（在 v2rayN 中选“清除系统代理”），再**开启 TUN 模式**。

### 步骤 2：修复“退出或切换后网页全打不开”的代理残留

在 Windows 下可通过以下只读命令核查注册表是否残留了系统代理开启状态：

```powershell
# 适用 OS: Windows (PowerShell)
# 目的: 查询 Windows 系统代理开关(ProxyEnable)及残留的代理地址(ProxyServer)
# 风险等级: 低（只读查询）
# 预期输出解读: 正常关闭代理后 ProxyEnable 应为 0；若客户端已关但此处仍为 1 且 ProxyServer 为 127.0.0.1:xxxx，说明代理未清理干净导致断网
Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings" | Select-Object ProxyEnable, ProxyServer, ProxyOverride
```

如果确认客户端已关闭且 `ProxyEnable` 仍为 `1`，可直接进入 Windows「设置 → 网络和 Internet → 代理 → 手动设置代理 → 编辑」将其关闭；或在命令行按需重置（详见下方高风险与回滚提示）。

在 macOS 下检查网络服务是否残留代理开关：

```bash
# 适用 OS: macOS (终端)
# 目的: 查看 Wi-Fi 或有线网卡当前是否仍启用了遗留的 HTTP/HTTPS/SOCKS 系统代理
# 风险等级: 低（只读查询）
# 预期输出解读: 若客户端已关闭但输出显示 Enabled: Yes 且指向 127.0.0.1，需关闭对应系统代理开关
networksetup -getwebproxy "Wi-Fi" && networksetup -getsecurewebproxy "Wi-Fi" && networksetup -getsocksfirewallproxy "Wi-Fi"
```

### 步骤 3：清理切换留下的 DNS 缓存与浏览器 QUIC 冲突

从 TUN 切回系统代理或直连后，立刻刷新系统 DNS 缓存，清除无效的 `198.18.x.x` 记录：

```powershell
# 适用 OS: Windows (PowerShell / CMD)
# 目的: 清空 Windows 本地 DNS 解析缓存，避免切换模式后仍命中旧 Fake-IP 地址
# 风险等级: 低（仅清缓存，不修改系统配置）
# 预期输出解读: 输出“已成功刷新 DNS 解析缓存”或“Successfully flushed the DNS Resolver Cache”即生效
ipconfig /flushdns
```

```bash
# 适用 OS: macOS (终端)
# 目的: 清空 macOS DNS 缓存并重载 mDNSResponder，防止切回系统代理后保留 Fake-IP
# 风险等级: 低（需输入当前用户密码，仅刷缓存）
# 预期输出解读: 命令执行无报错退出（返回码 0）即表示缓存已清空
sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder
```

如果开着 TUN 时部分网站加载很慢但系统代理下很快，可在 Chrome / Edge 地址栏打开 `chrome://flags/#enable-quic`（或 `edge://flags/#enable-quic`），临时将 **Experimental QUIC protocol** 设为 `Disabled` 后重启浏览器测试，验证是否为节点 UDP 丢包拖慢了 HTTPS 访问。

### 步骤 4：Linux 桌面端特殊确认

在 Linux（如 Ubuntu GNOME / KDE）下，部分终端与 Electron 应用并不完全读取桌面环境的 `gsettings` 系统代理。若只需要临时让终端走系统代理模式，可在当前终端会话注入环境变量（退出终端自动失效，无残留风险）：

```bash
# 适用 OS: Linux / macOS (Bash/Zsh 终端)
# 目的: 让当前终端会话临时走客户端混合端口（以 7897 为例，请替换为实际端口），无需开 TUN
# 风险等级: 低（仅对当前终端进程生效，关闭窗口即失效）
# 预期输出解读: 执行后 curl ipinfo.io 等请求将通过本地代理端口出口；执行 unset http_proxy https_proxy all_proxy 可随时取消
export http_proxy="http://127.0.0.1:7897" https_proxy="http://127.0.0.1:7897" all_proxy="socks5://127.0.0.1:7897"
```

## 什么结果算修复

1. 客户端只开启“系统代理”或“TUN 模式”中的一种，模式状态指示明确且没有报错弹窗。
2. 关闭代理后，系统级网络代理开关同步变为关闭，本地浏览器无需重启即可恢复正常直连国内网页。
3. 从 TUN 切回系统代理后，执行 `nslookup` 或访问网站不再返回残余的 `198.18.x.x` 私有测试地址。
4. 切换后终端与浏览器均能达到预期的直连/代理分流效果。

## 若仍失败怎么办

- 若单独开启 TUN 模式完全无效、虚拟网卡建不起来，请先排查权限与驱动冲突：[TUN 开启无效：虚拟网卡与服务授权排查](/troubleshooting/articles/tun-not-working)。
- 若确定使用系统代理但浏览器依然直连或开关自动弹回，继续查看：[v2rayN 系统代理无效或被自动还原排查](/troubleshooting/articles/v2rayn-system-proxy-fail)。
- 若两种模式下都有“显示已连接但网页全超时”，重点检查端口占用、环路或节点本身状态：[连上节点但打不开网页排查](/troubleshooting/articles/connected-no-internet)。

## 高风险操作与回滚提示

> [!WARNING]
> 切勿直接关闭 Windows Defender 防火墙或第三方安全软件来排查切换断网；也不要随意运行来源不明的“一键网络修复批处理”。

- **修改 Windows 注册表代理项与回滚**：若图形界面无法关闭残留系统代理，必须修改注册表清理 `ProxyEnable` 时，**操作前先导出备份**：
  1. 备份指令：`reg export "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" "$env:USERPROFILE\Desktop\inet-proxy-backup.reg"`
  2. 清理指令：`Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings" -Name ProxyEnable -Value 0`
  3. **回滚方法**：双击桌面的 `inet-proxy-backup.reg` 导入还原，或重新打开客户端的系统代理开关即可自动重写。
- **重置系统网络栈（仅作兜底，如 `netsh winsock reset`）的回滚与注意**：执行 `netsh winsock reset` 或 `netsh int ip reset` 会重置所有虚拟网卡协议栈与手动设置的 DNS，**操作前请截图记下宽带静态 IP、网关与自定义 DNS**，且已知该操作可能影响某些已安装的 VPN 驱动注册，需在重启后重新检查其他专业软件网络组件。

## 常见问题

### 系统代理和 TUN 模式能同时打开吗？

技术上部分客户端允许同时勾选，但日常使用强烈不建议双开。两者同时打开时，浏览器流量先走本地 HTTP 端口、再可能经过不同的分流或 DNS 逻辑，不仅浪费本地转发开销，还容易在关闭其中一个开关后留下半截配置，引发莫名断网或网页打不开。

### 为什么我关闭了 TUN 或退出了客户端，电脑就连国内网页都打不开了？

常见有两个原因：一是你此前同时开过系统代理且未正常退出，系统注册表里的代理端口（如 127.0.0.1:7897）还开着，软件退出后端口没人监听就会全部报错；二是之前 TUN 配合 Fake-IP 解析留下的 198.18.x.x DNS 缓存尚未过期，系统仍在尝试往不存在的虚拟网段发包。

### 平时只用浏览器查资料，有必要一直开着 TUN 模式吗？

没有必要。仅用 Chrome、Edge 等常规浏览器时，系统代理资源占用更低、不需要虚拟网卡驱动和系统级权限，也不会干扰企业内网或局域网应用。只有当遇到终端命令行、游戏联机或无视系统代理的桌面软件时，再切到 TUN 模式即可。

## 相关教程与替代入口

- TUN 深度排障：[TUN 模式开启无效排查](/troubleshooting/articles/tun-not-working) ｜ [TUN 模式详解指南](/guides/tun-mode/)
- Fake-IP 遗留清理：[Fake-IP 原理与 198.18.0.1 冲突修复](/troubleshooting/articles/fake-ip-explained-fix)
- 系统代理专题：[v2rayN 系统代理自动还原修复](/troubleshooting/articles/v2rayn-system-proxy-fail)
- 专题汇总：[连接不上排查专题](/troubleshooting/cannot-connect/) ｜ [客户端软件专题](/clients/clash-verge/)
