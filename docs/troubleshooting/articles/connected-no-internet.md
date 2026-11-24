---
title: 节点已连接但所有网页打不开排查：系统代理、端口冲突与环路修复
description: 解决代理节点延迟正常、客户端显示已连接但所有国内和海外网页均无法打开的故障，深入排查系统代理未接管、残留旧端口、端口占用与路由环路问题。
pillar: troubleshooting
category: cannot-connect
primaryKeyword: 节点已连接但所有网页打不开
intent: troubleshooting
publishedAt: '2026-11-23'
updatedAt: '2026-11-23'
breadcrumbs:
  - text: 首页
    link: /
  - text: 故障排查
    link: /troubleshooting/
  - text: 连接不上
    link: /troubleshooting/cannot-connect/
  - text: 已连接但打不开网页
howTo:
  name: 修复节点已连接但全网页断网的标准步骤
  description: 按核对系统代理与端口状态、排查双代理/插件冲突、消除 TUN 与本地端口环路三步恢复正常浏览。
  step:
    - name: 核对系统代理开关与实际监听端口是否一致
      text: 检查操作系统代理设置中的 IP 与端口（如 127.0.0.1:7897 或 10808）是否与当前客户端核心实际监听端口匹配。
    - name: 排查浏览器扩展、残留代理变量与多软件端口冲突
      text: 停用浏览器内的旧代理插件（如 SwitchyOmega 残留指向已关闭端口），清理终端环境变量与第二个正在争抢端口的代理工具。
    - name: 检查 TUN 路由环路或直接切换模式验证恢复
      text: 临时在“系统代理”和“TUN 模式”间切换排查是否因 TUN 网卡未放行直连出站造成环路断网。
faq:
  - q: 为什么关掉代理软件后，反而连国内网页也打不开了？
    a: 这是最典型的“系统代理未自动清理”现象。当客户端异常崩溃、强杀进程或电脑突然断电关机时，操作系统里仍保留着指向 127.0.0.1:7890（或 7897/10808）的代理记录；客户端退出后该端口不再监听，导致浏览器把所有请求都发向一个死端口而全部失败。
  - q: 节点延迟测速只有 40ms 绿灯，为什么一开代理所有网页都转圈？
    a: 节点测速是由代理核心直接发起的出站请求，而浏览器上网还要经过“浏览器 -> 系统代理/浏览器插件/TUN 网卡 -> 本地代理端口”这一段本地通道。只要中间监听端口不一致、端口被占用，或浏览器插件写错了端口，就会出现测速绿灯但网页全灭。
  - q: 同时开启系统代理和 TUN 模式会导致网页打不开吗？
    a: 某些情况下会的。尤其是同时运行两个代理客户端、或一个开了系统代理另一个开了 TUN 时，极易产生本地回环或策略冲突，建议同一时间只保留一个客户端并只启用一种核心接管模式。
---

# 节点已连接但所有网页打不开排查：系统代理、端口冲突与环路修复

## 核心结论（Answer-First）

节点测速正常且显示“已连接”，但浏览器内外网页全部打不开，断点几乎都在本地客户端到系统之间的通道。常见原因包括：系统代理指向了未监听的残留旧端口、核心监听端口被其他程序占用、浏览器代理插件指向错误端口、多款代理软件冲突，或开启 TUN 模式后产生本地路由环路与 DNS 卡死。核对端口监听与代理接管即可快速恢复。

## 故障现象

- **浏览器报错原文**：
  - `ERR_PROXY_CONNECTION_FAILED`（几乎百分百指向系统代理端口未监听或端口填错）
  - `ERR_CONNECTION_REFUSED` / `无法连接到代理服务器`
  - `ERR_NAME_NOT_RESOLVED` 或页面一直转圈后报 `ERR_CONNECTION_TIMED_OUT`
- **客户端状态特征**：客户端内节点列表测速呈绿色（如 `50ms`、`120ms`），没有任何订阅或节点超时提示，甚至部分非浏览器应用（或特定终端）工作情况与浏览器表现不一致。
- **典型连带症状**：有时候不仅外网打不开，连 `baidu.com` 等国内站点也同时崩溃；甚至退出代理软件后断网状态依然持续。

## 先做 3 个低风险检查

1. **检查客户端“系统代理（System Proxy）”开关状态与端口号**：确认 Clash Verge Rev / v2rayN 主界面的系统代理开关已真正打开（或排查是否误用残留旧端口），并查看设置里的混合端口（Mixed Port，常见如 `7897`、`7890` 或 `10808`）。
2. **检查浏览器是否安装了代理管理扩展**：如果你在 Chrome / Edge 里装过 SwitchyOmega 等代理插件并切到了某个固定情景模式，插件优先级高于系统代理；如果插件指向的旧端口已被停用，所有网页都会立刻失败。先将浏览器插件切回 `[系统代理]` 或 `[直接连接]` 测试。
3. **确认后台没有第二款代理或加速器在同时运行**：检查系统托盘、菜单栏或后台进程，确保没有同时运行 v2rayN、Clash Verge Rev、旧版 Clash、公司 VPN 或游戏加速器。

## 分层原因排除

### 本地系统与网络

- **系统代理残留死端口**：此前使用过其他软件或客户端意外闪退，Windows 注册表或 macOS 网络设置中保留了指向 `127.0.0.1:<旧端口>` 的代理配置，而新客户端监听的是另一个端口。
- **系统环境变量残留（常见于开发者终端/部分应用）**：系统环境变量里被写入了失效的 `HTTP_PROXY` / `HTTPS_PROXY`，影响终端及部分桌面程序。
- **虚拟网卡或防火墙策略阻拦本地回环/隧道网卡**：第三方安全规则错误拦截了本地代理端口或虚拟网卡的数据转发。

### 客户端与核心配置

- **端口冲突导致核心入站监听失败**：配置的混合端口（如 `7890`）已被本机其他程序（如另一个残留核心进程、Docker 服务或旧版软件）占用，UI 界面看起来开启了代理，但核心实际根本没能绑定该端口。
- **客户端选中了无效策略组节点**：比如把全局模式（Global）下的 `GLOBAL` 策略组停留在 `DIRECT` 或 `REJECT` 上，或者规则模式下把默认兜底规则 `MATCH` 选成了 `REJECT`，导致所有网页被客户端核心主动丢弃。

### DNS 与路由分流

- **Fake-IP 异常或本地 DNS 无响应**：在开启 TUN 模式且配置了 Fake-IP（`198.18.0.1/16`）时，若核心内部 DNS 上游失效，所有网页都会因无法解析域名而显示打不开（参见 [Fake-IP 原理与 198.18.0.1 冲突修复](/troubleshooting/articles/fake-ip-explained-fix)）。
- **TUN 路由环路（Loop）**：如果 TUN 虚拟网卡接管了全部系统流量，而代理核心发往远端节点的出站流量没有绑定物理网卡（缺少 `auto-route` 正确排除或 `interface-name` 绑定错位），出站数据包就会无限回到虚拟网卡内部死循环，导致全部断网。

### 远端订阅与节点

- **节点落地彻底无外网（仅入口通）**：较为少见但存在——中转入口服务器本身在线（TCP 延迟绿灯），但后端落地服务器断外网或服务端转发进程挂死。此时切换到系统代理下用终端通过代理请求外部 IP 测试即可一眼识破。

## 操作路径

### 步骤 1：核对系统当前代理设置与端口真实监听状态

**命令 A：检查 Windows 系统代理配置与本地监听端口（Windows PowerShell）**

- **适用 OS**：Windows 10 / Windows 11
- **目的**：读取当前系统代理是否开启、代理地址/端口是什么，并验证该端口当前到底有没有进程在监听。
- **风险等级**：低风险（只读查询系统代理注册表项与端口占用）。
- **预期输出解读**：如果 `ProxyEnable` 为 `1` 且 `ProxyServer` 为 `127.0.0.1:7890`，但下面 `Get-NetTCPConnection` 查询 `7890` 为空或显示的进程 PID 不是当前代理核心（如 `verge-mihomo.exe` / `xray.exe`），就说明系统代理指向了死端口或被其他软件占用！

```powershell
$reg = Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings"
[PSCustomObject]@{
  ProxyEnable = $reg.ProxyEnable
  ProxyServer = $reg.ProxyServer
  ProxyOverride = $reg.ProxyOverride
}
# 将 7897 替换为你客户端实际设置的混合端口号
Get-NetTCPConnection -LocalPort 7897 -State Listen -ErrorAction SilentlyContinue |
  Select-Object LocalAddress, LocalPort, OwningProcess, @{N='Process';E={(Get-Process -Id $_.OwningProcess).ProcessName}}
```

**命令 B：检查 macOS / Linux 代理环境变量与监听端口**

- **适用 OS**：macOS、Linux（OpenWrt 不使用桌面系统代理，OpenWrt 请直接查看路由转发与防火墙日志）
- **目的**：核对当前终端代理环境变量及客户端监听端口是否存活，并测试直接穿过本地代理端口能否返回正常 HTTP 响应。
- **风险等级**：低风险（只读本地查询与单次本地代理连通测试）。
- **预期输出解读**：`lsof` 或 `ss` 应看到 `mihomo` / `clash` / `xray` 正在监听对应端口；最后一条 `curl -x` 若能迅速返回 `204` 或 `200`，说明代理核心与节点完全正常，问题仅出在浏览器插件或系统代理设置未对齐；若 `curl -x` 也卡死或报错，说明代理核心出站或环路有问题。

```bash
# macOS 查看系统代理状态（Wi-Fi 示例）
networksetup -getwebproxy "Wi-Fi" 2>/dev/null || true
# Linux/macOS 检查端口监听（以 7897 为例）
lsof -iTCP:7897 -sTCP:LISTEN 2>/dev/null || ss -tlnp | grep 7897
# 直接通过本地代理端口探测外部 204（验证核心与节点真实出站能力）
curl -I -sS --max-time 6 -x http://127.0.0.1:7897 http://cp.cloudflare.com/generate_204
```

### 步骤 2：按平台修复系统代理、端口冲突或 TUN 环路

- **Windows（Clash Verge Rev / v2rayN）**：
  1. 关闭客户端内不需要的冗余进程（打开任务管理器查看是否有残留的 `clash-meta` / `mihomo` / `xray` 进程，如有先彻底结束）。
  2. 将混合端口临时修改为一个不易冲突的高位端口（例如 `17897`），保存后先关闭再重新开启“系统代理”。
  3. 检查 `Clash Verge Rev` 的策略组：确认当前不是处于 `REJECT` 规则，且不要在未安装服务模式的情况下混开 TUN。
- **macOS**：进入“系统设置 → 网络 → 当前网络（Wi-Fi/以太网）→ 详细信息 → 代理”，核对网页代理（HTTP）和安全网页代理（HTTPS）指向的端口号与客户端一致；若退出客户端仍断网，手动把这几个代理开关关闭即可立即恢复国内网。
- **iOS（Shadowrocket）**：检查“设置 → VPN”是否同时存在多个 VPN 描述文件在相互抢占（如同时开启其他抓包软件或企业 VPN）；在 Shadowrocket 首页核对“全局路由”是否为“配置（Config）”而非误选成了非正常脚本规则，尝试把全局路由临时设为“代理（Proxy）”测试单个页面。
- **Android（v2rayNG / Clash Meta for Android）**：安卓依赖系统 `VpnService` 接管流量，同一时刻只能激活一个 VPN。确认没有后台残留的另一个 VPN 或广告拦截工具（依赖本地 VPN 接口）正在抢占；在 Clash Meta for Android 检查是否误将“分应用代理（Access Control）”设成了白名单却未勾选浏览器。
- **Linux**：桌面环境（GNOME/KDE）检查系统网络设置中的 Manual Proxy 是否指向正确端口；同时检查 `~/.bashrc`、`~/.zshrc` 或 `/etc/environment` 中是否有过时的 `http_proxy` 变量。
- **OpenWrt（PassWall / OpenClash）**：路由器环境常见原因为**透明代理防火墙规则冲突或网关 DNS 环路**。确认没有在同一个路由器上同时运行 PassWall 和 OpenClash，并检查 DHCP/DNS 转发配置与 WAN 口默认出站是否绑定正确。

### 步骤 3：排查全局模式/规则错误与切换模式交叉验证

1. 如果处于 **TUN 模式** 且全网页打不开：先关闭 TUN 模式，改用**系统代理模式**（移动端跳过此步，移动端只有 VPN 接口模式）。如果关闭 TUN 改用系统代理后网页瞬间恢复，100% 确认是 TUN 虚拟网卡路由环路或虚拟网卡服务模式权限异常（详见 [TUN 开启无效与虚拟网卡冲突排查](/troubleshooting/articles/tun-not-working)）。
2. 如果处于**规则模式（Rule）**全网页打不开：临时将代理模式切换为**全局模式（Global）**并选定一个绿灯节点测试网页；若全局通了而规则模式不通，说明当前使用的订阅规则文件损坏或默认 `MATCH` 被设为了阻断。

## 什么结果算修复

- 通过终端 `curl -x http://127.0.0.1:<当前端口> https://www.google.com` 或浏览器正常访问国内外测试站点，均能在 1–3 秒内返回正常页面内容。
- 浏览器不再出现 `ERR_PROXY_CONNECTION_FAILED`、`ERR_CONNECTION_REFUSED` 或全局转圈超时。
- 当你在客户端点击关闭“系统代理”并退出客户端后，系统网络设置能干净还原，国内网页依然保持直连畅通。

## 若仍失败怎么办

1. **如果是开启 TUN 模式后引发的问题**：阅读 [TUN 开启无效：虚拟网卡冲突与权限排查](/troubleshooting/articles/tun-not-working) 与 [TUN 模式与系统代理的区别及断网修复](/troubleshooting/articles/tun-vs-system-proxy)。
2. **如果只有特定站点打不开，其余正常**：说明本地代理链是通的，属于分流规则或风控问题，请转向 [仅个别网站/AI 工具打不开与浏览器结果不一致排查](/troubleshooting/articles/specific-sites-unreachable)。
3. **如果是 v2rayN 系统代理反复被自动还原或浏览器不走代理**：查阅 [v2rayN 系统代理不生效与自动还原排查](/troubleshooting/articles/v2rayn-system-proxy-fail)。

## 高风险操作与回滚提示

- **严禁关闭杀毒软件或直接卸载系统网络适配器来“排查代理断网”**：卸载物理网卡驱动或关闭杀毒软件不仅危险，而且完全对错了症结。
- **重置系统代理或清理注册表/网络栈时的回滚方案**：
  - **Windows 一键清理失效系统代理并可随时回滚**：若客户端已退出仍全网打不开，打开“设置 → 网络和 Internet → 代理 → 手动设置代理”，点击“编辑”并关闭“使用代理服务器”即可立即恢复直连；若需通过命令行清理，先用 `reg export "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" "$env:USERPROFILE\Desktop\proxy-backup.reg"` 备份后再修改，若需回滚只需双击备份 `.reg` 文件导入即可。
  - **禁止盲目执行重置 Winsock（`netsh winsock reset`）**：除非确认有残留底层 LSP 劫持且普通清理代理无效，否则不要轻易重置 Winsock，以免破坏虚拟网卡或 WSL 网络桥接；若确需执行，务必提前记录现有虚拟网卡与自定义 DNS 配置。
  - **macOS 系统代理回滚**：在执行修改前记录当前网络接口代理设置，若命令行关闭代理后需要恢复，在客户端重新点击一次“开启系统代理”或使用 `networksetup -setwebproxystate "Wi-Fi" on` 重新启用。

## 常见问题

### 为什么关掉代理软件后，反而连国内网页也打不开了？

这是最典型的“系统代理未自动清理”现象。当客户端异常崩溃、强杀进程或电脑突然断电关机时，操作系统里仍保留着指向 127.0.0.1:7890（或 7897/10808）的代理记录；客户端退出后该端口不再监听，导致浏览器把所有请求都发向一个死端口而全部失败。

### 节点延迟测速只有 40ms 绿灯，为什么一开代理所有网页都转圈？

节点测速是由代理核心直接发起的出站请求，而浏览器上网还要经过“浏览器 -> 系统代理/浏览器插件/TUN 网卡 -> 本地代理端口”这一段本地通道。只要中间监听端口不一致、端口被占用，或浏览器插件写错了端口，就会出现测速绿灯但网页全灭。

### 同时开启系统代理和 TUN 模式会导致网页打不开吗？

某些情况下会的。尤其是同时运行两个代理客户端、或一个开了系统代理另一个开了 TUN 时，极易产生本地回环或策略冲突，建议同一时间只保留一个客户端并只启用一种核心接管模式。

## 相关教程与替代入口

- [连上节点但打不开网页专题总览](/troubleshooting/cannot-connect/)
- [TUN 模式开启无效与虚拟网卡冲突排查](/troubleshooting/articles/tun-not-working)
- [TUN 模式与系统代理的区别及断网修复](/troubleshooting/articles/tun-vs-system-proxy)
- [v2rayN 系统代理不生效与自动还原排查](/troubleshooting/articles/v2rayn-system-proxy-fail)
- [Fake-IP 原理与 198.18.0.1 冲突修复](/troubleshooting/articles/fake-ip-explained-fix)
- [仅个别网站或 AI 工具打不开排查](/troubleshooting/articles/specific-sites-unreachable)
