---
title: UDP 转发失败、NAT 类型受限与防火墙阻断排查指南
description: 排查代理环境下游戏联机、语音通话、HTTP/3 (QUIC) 及 Hysteria2/TUIC 无法连接或频繁丢包的 UDP 转发、NAT 类型与本地/运营商防火墙限制问题。
pillar: troubleshooting
category: slow-network
primaryKeyword: 代理 UDP 转发失败 NAT 类型防火墙阻断排查
intent: troubleshooting
publishedAt: '2026-11-23'
updatedAt: '2026-11-24'
breadcrumbs:
  - text: 首页
    link: /
  - text: 故障排查
    link: /troubleshooting/
  - text: 连接慢与丢包
    link: /troubleshooting/slow-network/
  - text: UDP 与 NAT 防火墙排查
howTo:
  name: 排查并修复代理 UDP 转发失败与 NAT 受限
  description: 按客户端 UDP 开关、TUN 模式、本地防火墙放行与远端节点 UDP 支持顺序完成诊断与修复。
  step:
    - name: 确认客户端节点设置与代理模式下已启用 UDP 转发
      text: 核对节点配置中的 udp 字段为 true（Clash YAML）或客户端“启用 UDP 转发”开关已打开，并确认处于支持 UDP 的系统模式。
    - name: 区分普通系统代理与 TUN 模式对 UDP 的承载差异
      text: 普通 HTTP 系统代理无法转发大多数客户端的原始 UDP 游戏流量，需使用 TUN 模式、SOCKS5 UDP 或游戏专属转发方式。
    - name: 检查本地系统防火墙、路由器防火墙与 NAT 类型
      text: 确认 Windows/macOS/Linux/OpenWrt 防火墙未拦截客户端核心出站 UDP 流量，并用 STUN/NAT 检测确认当前 NAT 类型。
    - name: 排查运营商 UDP QoS 限速或端口阻断并切换传输协议
      text: 若基于 UDP 的 Hysteria2/TUIC 丢包严重或被彻底阻断，临时切换回基于 TCP 的 TLS/VLESS/Trojan 节点进行对照测试。
faq:
  - q: 为什么网页测速很快，但 Discord 语音、Teams 会议或主机/PC 游戏联机一直提示连不上或 Strict NAT？
    a: 网页浏览主要走 TCP 协议，而实时语音、视频通话与绝大多数游戏联机重度依赖 UDP 与端到端 NAT 穿透。首先，普通“系统代理（HTTP Proxy）”几乎不接管非浏览器的 UDP 游戏流量，需改用支持完整 UDP 转发的 TUN 模式；其次，若节点配置中关闭了 udp:true 或落地服务器自身处于 Symmetric（对称型）NAT 后，联机就会报严格 NAT 或连接失败。
  - q: 使用 Hysteria2 或 TUIC 等基于 UDP/QUIC 的协议时，为什么白天很快、晚上却直接断流？
    a: 许多宽带运营商对跨网或国际方向的大流量 UDP 报文存在动态 QoS 限速甚至阶段性丢包策略（UDP 阻断/限速）。在晚高峰拥塞时，纯 UDP 协议的丢包率会明显高于经过中转优化的 TCP/TLS 线路，此时建议切换为常规中转节点或调整拥塞控制参数。
  - q: 排障时能否直接把 Windows 防火墙或电脑杀毒软件全部关掉？
    a: 不建议且不需要关闭杀毒软件或彻底停用系统防火墙！正确的做法是在保留系统安全防护的前提下，仅核查防火墙中针对代理客户端核心（如 mihomo、xray、sing-box）的“公用/专用网络”出站与虚拟网卡通行规则是否被误拒绝，并在放行前做好规则备份。
  - q: 机场实测图表里的“UDP类型”（如 FullCone、Symmetric）是什么意思，应该怎么选？
    a: 测速报告（如 Miaoko 拓扑实测图）中的“UDP类型”反映的是节点落地侧对外的 NAT 映射与过滤行为。FullCone（全锥形，对应 NAT1）允许外部任意主机主动回包，最适合主机/PC 游戏 P2P 联机与低延迟语音；RestrictedCone / PortRestricted（受限锥形）属于中等可用（Moderate NAT）；而 Symmetric（对称型，对应 NAT4）每次对不同目标都会变换端口，会导致 P2P 打洞失败并显示 Strict NAT。
---

# UDP 转发失败、NAT 类型受限与防火墙阻断排查指南

## 核心结论（Answer-First）

网页正常但语音通话、游戏联机或 Hysteria2/QUIC 协议不通，主要源于四点：**客户端未开 UDP 转发**、**仅用不支持游戏 UDP 的 HTTP 系统代理**、**本地或路由器防火墙拦截 UDP 包**，或**节点对称 NAT 限制与运营商 UDP 丢包**。切入 TUN 模式、核对 `udp: true`、放行防火墙并对照 TCP 节点即可定位。

## 故障现象

- **语音与游戏典型报错**：Discord 语音频道卡在 `RTC Connecting` 或 `No Route`；主机（Switch / PS5 / Xbox）或 Steam P2P 联机提示 `NAT 类型：严格（Strict / Type D / NAT4）`，无法加入好友大厅或匹配排队超时；微信/Zoom/Teams 语音频繁单向无声。
- **协议连接特征**：使用 Hysteria2、TUIC、WireGuard 等基于 UDP 的节点时完全无流量，或测速曲线呈锯齿状瞬间归零，但同一机场下的 VLESS/Trojan/Shadowsocks（TCP 承载）节点却能正常打开网页。
- **浏览器 QUIC 首屏假死**：打开开启了 Cloudflare 或 Google HTTP/3（`UDP 443`）的网站时，浏览器前 3–5 秒白屏转圈，直到触发连接超时回退到 `TCP 443` 后才突然秒开。
- **桌面端与移动端差异**：Windows 上开着“系统代理”浏览网页飞快，但游戏客户端完全直连或无法穿透；iOS/Android 由于底层运行在完整网络扩展（Network Extension / `VpnService`）上，只要客户端开关和节点开启了 UDP，App 内 UDP 理论上均会进入隧道，但仍受限于节点自身的 NAT 类型。

## 先做 3 个低风险检查

1. **检查客户端里的 UDP 开关**：
   - **v2rayN / v2rayNG**：进入“参数设置”，确认“开启 UDP（Enable UDP）”处于打开状态。
   - **Clash Verge Rev / Mihomo 客户端**：检查订阅节点条目或覆写配置中是否存在 `udp: true`（若缺失或显式为 `false`，核心在转发该节点流量时会直接丢弃 UDP 报文）。
   - **Shadowrocket**：在全局设置或单节点编辑页中确认已开启「UDP 转发」。
2. **确认当前代理接管方式**：如果是在 Windows/macOS 上打游戏或使用桌面端语音软件，检查是否只开了“系统代理”而未开 **TUN 模式（虚拟网卡）**；绝大多数 PC 游戏、WebRTC 语音引擎并不读取操作系统的 HTTP 代理注册表。
3. **切换到 TCP 协议节点做对照组**：如果使用的是 Hysteria2/TUIC 等纯 UDP 节点且完全连不上，先在同一个机场里换一个基于 TCP 的常规中转节点（如 VLESS-TCP、Trojan 或 Shadowsocks）测试，若 TCP 通而 UDP 死，即可高度锁定是本地防火墙、企业网或宽带运营商拦截了 UDP 端口。

## 看懂 NAT 四大类型与实测图 `UDP类型` 指标

在排障游戏联机或阅读第三方节点实测截图（例如 Miaoko 实测图中的 `UDP类型` / `NAT Type` 列）时，区分 NAT 等级是判断“究竟是我本地没配好，还是远端节点天生不支持联机”的关键：

| 经典 NAT 分类（RFC 3489 口径） | RFC 5780 行为特征 | 主机/PC 游戏显示等级 | 实测图常见标记与实际联机表现 |
| :--- | :--- | :--- | :--- |
| **Full Cone（全锥形 / NAT1）** | 端点无关映射 + 端点无关过滤（EI-Mapping / EI-Filtering） | `Open` / `Type A` | 实测图显示 `FullCone`（或 `Full Cone`）。任意外部玩家只要知道映射端口即可发包进入，支持做联机房主（Host），语音连接最快 |
| **Restricted Cone（地址受限锥形 / NAT2）** | 端点无关映射 + 地址相关过滤 | `Moderate` / `Type B` | 实测图显示 `Restricted` / `AddressRestricted`。本机先向对方 IP 发过包后即可双向互通，绝大多数联机与 Discord 语音正常 |
| **Port Restricted Cone（端口受限锥形 / NAT3）** | 端点无关映射 + 地址与端口严格过滤 | `Moderate` / `Type B~C` | 实测图显示 `PortRestricted`。仅允许与两个同样为锥形 NAT 的玩家打洞成功，遇到对称型玩家无法直连 |
| **Symmetric（对称型 / NAT4）** | 地址和端口相关映射（每次访问不同目标分配不同源端口） | `Strict` / `Type D` | 实测图显示 `Symmetric` 或 `UDP Blocked`。STUN 探测出的外部端口对其他玩家完全无效，P2P 组队极易失败，只能走官方中继服 |

> [!NOTE]
> 在代理链路中，游戏客户端看到的最终 NAT 类型由 **“代理协议是否支持 FullCone UDP（如 Shadowsocks/Trojan/VLESS XUDP/Hysteria2 的 UDP 会话保持）”** 与 **“机场落地服务器机房网关本身的 NAT 形态”** 共同决定。即便你在本地光纤做到了光猫桥接 NAT1，只要代理节点落地机本身是 `Symmetric` 或关闭了 `udp: true`，开启 TUN 后的游戏测试依然会显示 `Strict NAT`。

## 分层原因排除

### 本地系统与网络

- **本地防火墙按“公用/专用网络”差异拦截核心进程**：Windows Defender 防火墙首次弹窗时，很多用户只勾选了“专用网络”而未勾“公用网络”（或者误点了取消）。当电脑连接新 Wi-Fi 被系统归类为“公用网络”时，系统会静默阻止 `mihomo.exe`、`xray.exe` 或 `sing-box.exe` 接收或转发 UDP 数据。
- **校园网/公司内网对称 NAT 或端口封锁**：企业防火墙常只放行 TCP `80/443`，屏蔽高端口 UDP 及外部 STUN 请求（如 `UDP 3478/19302`），导致任何 P2P 穿透或 Hysteria2/TUIC 节点全部失效。
- **本地双层/三层路由器 NAT**：当节点走直连分流玩国服游戏，或使用直连 STUN 时，“光猫路由模式 + 主路由二次拨号”会叠加多层 NAT，大幅降低本地直连 UDP 打洞成功率。

### 客户端与核心配置

- **仅开系统代理未开 TUN 模式**：HTTP 系统代理本质上只监听本地端口处理 TCP 化的 `HTTP/HTTPS CONNECT` 请求，桌面端游戏与语音工具的原始 UDP 包会绕过代理直接从本地物理网卡裸奔发出。
- **TUN 堆栈（Stack）兼容性差异**：Mihomo 与 sing-box 的 TUN 模式包含 `system`、`gvisor`、`mixed` 三类网络栈。`system` 栈处理 TCP 吞吐性能最高，但在部分旧版 Windows 内核或特定网卡驱动下对非标 UDP 包兼容性不如 `gvisor`；而 `mixed`（TCP 走 `system`、UDP 走 `gvisor`）通常是兼顾大带宽下载与 UDP 语音/游戏稳定性的折中优选。
- **节点订阅显式关闭 UDP**：部分机场为了防 BT/PT 滥用或节省中转机连接表开销，会在下发的 YAML 订阅里统一写入 `udp: false`（或漏写 `udp: true`），此时就算客户端界面开了 TUN，核心也会直接拒绝 UDP 转发。

### DNS 与路由分流

- **DNS 查询走 UDP 53 被拦截或假地址未排除**：在 TUN + Fake-IP 模式下，如果未将 `stun.*.*` 等联机打洞域名加入 `fake-ip-filter`（详见 [Fake-IP 原理与 198.18.0.1 冲突修复](/troubleshooting/articles/fake-ip-explained-fix)），部分游戏客户端拿到 `198.18.x.x` 假地址去做端到端校验时会立即报错断连。
- **QUIC（UDP 443）丢包拖慢网页**：现代 Chrome / Edge 默认优先发 HTTP/3（`UDP 443`）握手。若机场中转链路对 UDP 限速或偶发丢包，网页会出现“转圈好几秒后才刷出来”的典型粘滞感。

### 远端订阅与节点

- **Hysteria2 / TUIC 遭遇运营商动态 UDP QoS 与阻断**：Hysteria2 和 TUIC 底层运行在 UDP/QUIC 之上，依靠激进或自适应发包对抗弱网丢包。然而国内三大运营商对跨省、跨境长时高带宽 UDP 流普遍部署了比 TCP 严格得多的 QoS 限速乃至“间歇性端口阻断（UDP Throttling / Blackhole）”机制——表现为刚连上前 30 秒跑满带宽，随后连续数分钟收不到任何回包，换端口或等十分钟又短暂恢复。
- **中转入口未转发 UDP 或落地机非 FullCone**：部分廉价中转线路只做了 TCP 端口转发而未转发同端口 UDP，导致该节点 TCP 网页正常、UDP 流量 100% 黑洞。

## 操作路径

### 适用平台说明

- **适用平台**：Windows、macOS、Linux、OpenWrt（完整支持防火墙核查、TUN 堆栈切换与本地 UDP 验证）、iOS 与 Android（重点核对客户端 UDP 开关及协议回落切换，移动端一般无需手动操作底层防火墙）。

### 分步排查与验证命令

1. **步骤 1：核对并开启客户端 UDP 转发与 TUN `mixed` 栈**
   - **Clash 系桌面端（Clash Verge Rev / FlClash 等）**：确认开启 **TUN 模式**（需先完成服务模式授权，详见 [TUN 模式开启无效排查](/troubleshooting/articles/tun-not-working)），在 TUN 设置中将堆栈（Stack）设为 `mixed`（或 `gvisor` 对照测试），并确认所用节点包含 `udp: true`。若机场原订阅漏写了 `udp: true`，可在全局扩展覆写配置（Merge）中按需测试单节点属性，但前提是服务端确实支持 UDP 接收。
   - **v2rayN**：开启软件底部 **Enable Tun**（调用内置 `sing-box` 创建虚拟网卡），同时在「参数设置 -> v2rayN 设置」确认“开启 UDP”与“开启流量探测”处于合理状态。
   - **iOS（Shadowrocket）与 Android（v2rayNG / Clash Meta）**：在设置中核对「UDP 转发」已打开，并确保打联机游戏的 App 未被分应用代理排除。

2. **步骤 2：检查 Windows 本地防火墙对代理核心的放行状态（只读查询）**
   - **适用 OS**：Windows 10 / Windows 11（PowerShell）
   - **目的**：查看当前防火墙是否已有阻止（`Block`）代理核心（如 `mihomo`、`verge-mihomo`、`xray`、`sing-box`）的规则，以及规则作用于哪个网络配置文件（`Profile`）。
   - **风险等级**：低（仅查询并筛选规则属性，不做任何防火墙改动）。

   ```powershell
   Get-NetFirewallRule | Where-Object { $_.DisplayName -match 'clash|mihomo|xray|sing-box|v2ray' } | Select-Object DisplayName, Direction, Action, Enabled, Profile | Format-Table -AutoSize
   ```

   - **预期输出解读**：
     - 健康状态应显示 `Action : Allow`、`Enabled : True`，且 `Profile` 包含你当前所处的网络类型（`Private` 专用或 `Public` 公用，或 `Any`）。
     - 若看到如下所示的 `Block` 记录：
       ```text
       DisplayName    Direction Action Enabled Profile
       -----------    --------- ------ ------- -------
       verge-mihomo   Inbound   Block  True    Public
       ```
       说明此前在公共 Wi-Fi 或未识别网络下弹窗点过“取消”，导致公用网络下 UDP 回包被拦截。此时打开「Windows 安全中心 -> 防火墙和网络保护 -> 允许应用通过防火墙」，找到对应核心勾选「专用」与「公用」即可，切勿关掉整道防火墙。

3. **步骤 3：Linux / macOS / OpenWrt 检查系统与路由器防火墙 UDP 策略**
   - **适用 OS**：OpenWrt（22.03+ 使用 `fw4 / nftables`）或常见 Linux 发行版
   - **目的**：确认路由器透明代理（TProxy / TUN）是否已挂载 UDP 转发链，避免“只代理了 TCP 漏掉了 UDP”。
   - **风险等级**：低（只读查看规则表与插件开关）。

   ```bash
   # 查看 nftables 当前挂载的表（OpenWrt / 现代 Linux）
   nft list tables
   ```

   - **预期输出解读**：
     - 正常应看到系统默认表 `inet fw4` 以及透明代理插件表（如 `inet openclash`、`inet nikki`、`inet homeproxy` 或 `inet passwall2`）。在 OpenClash / PassWall 中，还需专门进入插件页面确认 **“UDP 流量转发（TProxy）”** 开关已启用且安装了 `kmod-nft-tproxy` 内核模块；若未开启 UDP 代理项，局域网设备只会走 TCP 代理。

4. **步骤 4：Hysteria2 / QUIC 被阻断时平滑回落 TCP 与禁用异常 QUIC**
   - **协议回落对照（针对运营商 UDP QoS 断流）**：若使用 Hysteria2 或 TUIC 节点在晚高峰频繁断流、测速掉到 `0B`，请立即切换到同一服务商下的 **VLESS + TCP + Reality**、**Trojan + TLS** 或 **Shadowsocks（TCP 中转）** 节点。经过国内入口中转的 TCP 隧道不会触发家宽边缘路由器的跨境 UDP 丢包阈值，实时语音和网页稳定性往往大幅优于直连 UDP。
   - **解决网页首屏转圈（针对 UDP 443 半通不通）**：如果你不需要代理 HTTP/3，只是想消除浏览器等 QUIC 超时的 3–5 秒卡顿，可在 Clash / Mihomo 分流规则顶部加入一条 `AND,((NETWORK,UDP),(DST-PORT,443)),REJECT`（仅拒绝 `443` 端口的 UDP QUIC 握手包，**不影响**其他端口的 Discord 语音和游戏 UDP！），浏览器收到拒绝后会立刻在毫秒内平滑回退到高速 `TCP 443`。
   - 若核心诉求是主机/PC 低延迟联机，可参阅 [游戏加速器原理与 NAT 类型诊断](/vpn/gaming/) 了解专线加速与通用机场在 FullCone 承载上的结构差异。

## 什么结果算修复

- 使用游戏自带网络诊断（如主机连接测试、使命召唤/Apex/Steam 网络状态）或标准浏览器 WebRTC/STUN 检测工具时，不再提示 `UDP Blocked`，NAT 类型提升至 `Moderate（中等）` 或 `Open / FullCone`（取决于落地机上限）。
- Discord / Teams 等实时语音在 1–2 秒内完成 `RTC Connected` 绿灯握手，持续通话 15 分钟无单向失声或断线重连。
- 打开客户端「连接（Connections）」面板并按 `UDP` 筛选，能清晰看到目标软件或游戏的 `UDP` 会话正常建立并双向产生上下行字节数。

## 若仍失败怎么办

- 检查家庭宽带光猫是否处于“路由模式”叠加了二级路由器；在具备宽带账号密码与网络配置经验的前提下，改为光猫桥接、主路由 PPPoE 拨号并按需开启主路由 UPnP，可消除本地多级 NAT 损耗。
- 如果只是个别节点 UDP 不通而同组其他节点正常，请结合 [仅单个节点或特定地区超时排查](/troubleshooting/articles/nodes-partial-region-timeout) 排查单节点中转配置差异。
- 如确认当前机场全线节点明确声明“禁止 UDP 转发”、实测图 `UDP类型` 全线为受限/阻断，可前往 [机场深度评测目录](/reviews/) 核查各品牌实测档案中的 `UDP类型` 表现，或参考 [品牌替代方案](/brands/alternatives/)。

## 高风险操作与回滚提示

- **严禁为了解决 UDP 不通而彻底关闭杀毒软件或停用系统防火墙**：关闭全局防护会让设备裸露于局域网扫描与恶意软件风险中，且根本无法解决运营商限速或节点关闭 `udp: true` 的问题。
- **修改 Windows 防火墙、OpenWrt 规则或添加 `REJECT` 分流前必须留好回滚路径**：
  - **Windows 防火墙备份与回滚**：修改规则前在管理员 PowerShell 运行 `netsh advfirewall export "$env:USERPROFILE\Desktop\fw-backup.wfw"` 导出完整快照；若改错导致联网异常，运行 `netsh advfirewall import "$env:USERPROFILE\Desktop\fw-backup.wfw"` 即可一键还原。
  - **OpenWrt 防火墙与 TProxy 回滚**：修改 `/etc/config/firewall` 或透明代理 UDP 模式前，先执行 `cp /etc/config/firewall /etc/config/firewall.bak`；一旦局域网断流，先在插件后台关闭“UDP 流量转发”，或恢复备份后执行 `/etc/init.d/firewall restart` 即可回退。
  - **QUIC `UDP 443` 拦截规则回滚**：若添加 `DST-PORT,443` 的 UDP 拒绝规则后影响了个别强制依赖 QUIC 的特定应用，直接从客户端规则覆写列表中删除该行并重载配置即可恢复。

## 常见问题

### 为什么网页测速很快，但 Discord 语音、Teams 会议或主机/PC 游戏联机一直提示连不上或 Strict NAT？

网页浏览主要走 TCP 协议，而实时语音、视频通话与绝大多数游戏联机重度依赖 UDP 与端到端 NAT 穿透。首先，普通“系统代理（HTTP Proxy）”几乎不接管非浏览器的 UDP 游戏流量，需改用支持完整 UDP 转发的 TUN 模式；其次，若节点配置中关闭了 `udp:true` 或落地服务器自身处于 Symmetric（对称型）NAT 后，联机就会报严格 NAT 或连接失败。

### 使用 Hysteria2 或 TUIC 等基于 UDP/QUIC 的协议时，为什么白天很快、晚上却直接断流？

许多宽带运营商对跨网或国际方向的大流量 UDP 报文存在动态 QoS 限速甚至阶段性丢包策略（UDP 阻断/限速）。在晚高峰拥塞时，纯 UDP 协议的丢包率会明显高于经过中转优化的 TCP/TLS 线路，此时建议切换为常规中转节点或调整拥塞控制参数。

### 排障时能否直接把 Windows 防火墙或电脑杀毒软件全部关掉？

不建议且不需要关闭杀毒软件或彻底停用系统防火墙！正确的做法是在保留系统安全防护的前提下，仅核查防火墙中针对代理客户端核心（如 mihomo、xray、sing-box）的“公用/专用网络”出站与虚拟网卡通行规则是否被误拒绝，并在放行前做好规则备份。

### 机场实测图表里的“UDP类型”（如 FullCone、Symmetric）是什么意思，应该怎么选？

测速报告（如 Miaoko 拓扑实测图）中的“UDP类型”反映的是节点落地侧对外的 NAT 映射与过滤行为。FullCone（全锥形，对应 NAT1）允许外部任意主机主动回包，最适合主机/PC 游戏 P2P 联机与低延迟语音；RestrictedCone / PortRestricted（受限锥形）属于中等可用（Moderate NAT）；而 Symmetric（对称型，对应 NAT4）每次对不同目标都会变换端口，会导致 P2P 打洞失败并显示 Strict NAT。

## 相关教程与替代入口

- 专题汇总：[连接慢与丢包排查专题](/troubleshooting/slow-network/) ｜ [晚高峰高延迟、丢包与卡顿定位指南](/troubleshooting/articles/high-latency-packet-loss-peak)
- 游戏与评测参考：[游戏加速器原理：UDP NAT 类型与延迟抖动诊断](/vpn/gaming/) ｜ [品牌实测与 UDP 类型核查](/reviews/)
- TUN 与虚拟网卡：[TUN 模式开启无效排查：虚拟网卡与服务授权](/troubleshooting/articles/tun-not-working) ｜ [TUN 模式与系统代理的区别](/troubleshooting/articles/tun-vs-system-proxy) ｜ [TUN 模式详解与路由环路预防](/guides/tun-mode/)
