---
title: DNS 与 Fake-IP 配置教程：198.18.0.1 原理、分层 DNS、关闭浏览器 DoH 与回滚命令
description: 深入解析代理场景下 Fake-IP（198.18.0.1）与 Redir-Host 核心差异，拆解 default-nameserver/nameserver/fallback/proxy-server-nameserver 分层职责、fake-ip-filter 白名单、浏览器 DoH 冲突关闭及系统 DNS 断网回滚命令。
pillar: guides
primaryKeyword: Fake-IP DNS 配置
intent: informational
publishedAt: 2026-11-23
updatedAt: 2026-11-23
schemaType: TechArticle
breadcrumbs:
  - text: 首页
    link: /
  - text: 使用教程
    link: /guides/
  - text: DNS 与 Fake-IP 配置
    link: /guides/dns-setup/
faq:
  - q: Fake-IP 和 Redir-Host 两种 DNS 模式有什么核心区别，日常使用哪个更好？
    a: Fake-IP 在收到域名查询时会立刻返回 198.18.0.0/15 网段的保留假 IP，并在建立连接时将真实域名带入海外节点由远端解析，省去本地等待时间并从根源消除 DNS 污染；Redir-Host 则在本地先查出真实公网 IP 后再按规则转发，排障更直观且兼容特殊内网软件，但对本地加密上游防污染配置要求极高。普通用户配合 TUN 模式日常首选 Fake-IP，遇局域网兼容性冲突时再补充白名单或临时切 Redir-Host 排查。
  - q: 为什么在终端里 ping 一个海外域名时返回了 198.18.0.1 这种奇怪的 IP 地址？
    a: 这是完全正常的 Fake-IP 工作表现。198.18.0.0/15 是专门用于网络基准测试的保留地址段，被 Clash、Mihomo 和 sing-box 选作虚拟地址池。内核抢先劫持 DNS 查询并分配这个伪 IP，以便在后续数据包进来时准确还原对应域名并交给远端节点解析。因此该返回结果绝不是故障，也不能用来测试节点的真实 ICMP 延迟。
  - q: default-nameserver、nameserver、fallback 和 proxy-server-nameserver 各自负责什么？
    a: default-nameserver 是引导解析器，只能填写纯 IP，专门负责解析后面加密 DNS 服务器自身的域名；nameserver 是日常默认查询组，建议配国内加密 DoH 确保淘宝、微信和国内视频拿到本地最优 CDN；fallback 是海外防污染备用解析组，当需要验证非国内 IP 时触发；proxy-server-nameserver 则专门负责解析机场节点入口服务器域名，绝对不能配置为走代理。
  - q: 为什么明明在客户端开着代理和分流，还需要关闭 Chrome 或 Edge 浏览器的安全 DNS（DoH）？
    a: 当浏览器单独开启了内置的安全 DNS（DNS-over-HTTPS）并指定了公共 DoH 服务商时，浏览器会绕过操作系统和本地代理客户端的常规 53 端口 DNS 拦截，直接向远端加密服务器查出真实 IP。这会导致代理内核拿不到原始域名来触发 Fake-IP 映射或精细域名分流，甚至把海外 CDN 解析跑偏。使用代理客户端时，应将浏览器安全 DNS 关闭或设为跟随系统服务商。
  - q: 哪些域名必须放进 fake-ip-filter 白名单，防止微信、企业内网或局域网连接出问题？
    a: 标准 fake-ip-filter 过滤名单至少应覆盖局域网与本地域名后缀（如 *.lan、*.local、localhost.ptlogin2.qq.com）、系统联网状态探测域名（如 +.msftconnecttest.com、captive.apple.com）、NTP 网络对时服务器、游戏 STUN 联机验证域名，以及对假 IP 敏感的企业内网 OA、银行网银控件和微信登录传图相关域。
  - q: 为什么在节点不支持 IPv6 时建议关闭代理内核里的 IPv6 DNS（AAAA 记录）解析？
    a: 如果客户端开启了 IPv6 解析但所连的机场中转或落地节点并不支持完整的 IPv6 转发，客户端在访问海外双栈网站时会优先拿到 AAAA 记录并尝试建立 IPv6 连接，直到超时失败才退回 IPv4，表现为所有海外网页打开总要卡顿三五秒才出来。在不支持 IPv6 的节点环境下关闭内核 ipv6 开关能明显加快首屏打开速度。
  - q: 改坏了系统网卡 DNS 或内核 DNS 配置导致退出代理后全网断网，怎么按命令完整回滚？
    a: 切勿卸载重装系统或关闭杀毒软件。第一步在客户端停用自定义 DNS 覆写并关闭 TUN 模式；第二步把本机物理网卡的 IPv4 与 IPv6 DNS 还原为自动获取（DHCP），Windows 可在图形界面或使用 ResetServerAddresses 命令复位；第三步在终端执行 ipconfig /flushdns（Windows）或 sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder（macOS）彻底清理残留的 198.18.x.x 假 IP 缓存并重启浏览器即可恢复。
---

# DNS 与 Fake-IP 配置教程：198.18.0.1 原理、分层防泄漏、浏览器 DoH 冲突与回滚

> **核心结论（Answer-First）**：在跨境代理场景里，“节点测速正常却打不开网页”、“国内视频加载奇慢”或“微信传图转圈”，超过一半的根因落在 **DNS 污染、DNS 泄漏或 Fake-IP 缓存残留** 上。现代代理内核主要采用 **Fake-IP（返回 `198.18.0.1` 等保留假 IP 实现零延迟映射与远端解析）** 与 **Redir-Host（本地查出真实 IP 后再匹配分流）** 两条路线。配置的核心在于守住四层解析边界：**纯 IP 引导（`default-nameserver`）→ 节点入口直连（`proxy-server-nameserver`）→ 国内快速解析（`nameserver`）→ 海外防污染（`fallback`）**，同时避免浏览器内置 DoH 绕过分流。**任何修改操作系统物理网卡静态 DNS 或核心 DNS 监听端口都属于高风险操作，严禁将物理网卡 DNS 长期写死为 `127.0.0.1` 或 `8.8.8.8`，改前务必掌握标准回滚命令。**

如果你刚刚在配置虚拟网卡，建议结合 [TUN 模式教程](/guides/tun-mode/) 一起阅读；若需要修改域名分流逻辑，请对照 [分流规则配置指南](/guides/split-routing/)。

---

## 一、Fake-IP（`198.18.0.1`）vs Redir-Host 底层原理与对照

为什么开启 Clash 或 sing-box 的 TUN 模式后，绝大多数默认模板都会强推 **Fake-IP**？看清数据流转顺序就能明白其中差距：

### 1. 两种模式的底层工作流对比
- **Redir-Host 模式的工作方式**：
  1. 浏览器请求访问 `chatgpt.com`，向代理内置 DNS 发起查询。
  2. 代理内核**必须先在本地等待** `nameserver` 或 `fallback` 返回真实公网 IP（耗时约 20–150ms）。
  3. 浏览器拿到真实 IP 后发起 TCP 连接，代理内核截取连接并还原或嗅探域名匹配分流规则，最后发给远端节点。
- **Fake-IP 模式的工作方式（现代 TUN 模式默认推荐）**：
  1. 浏览器查询 `chatgpt.com` 时，代理内核**完全不向外网发起真实 DNS 查询**，而是在 1 毫秒内于本地内存中分配一个来自 `198.18.0.0/15`（RFC 2544 保留网段，常见如 `198.18.0.1`、`198.18.0.2`）的虚拟 IP 直接塞回给浏览器，同时在内部字典里记下 `198.18.0.1 <-> chatgpt.com`。
  2. 浏览器拿到假 IP 后立刻发起 TCP 握手，代理内核收到发往 `198.18.0.1` 的数据包时查表还原出真实域名 `chatgpt.com`，直接跳过本地域名查询，把 **原始域名** 通过加密隧道送给境外落地节点去就近解析！

| 对比维度 | Fake-IP 模式 | Redir-Host 模式 |
| :--- | :--- | :--- |
| **返回给本机系统的 IP** | 保留虚拟池 IP（`198.18.0.1` ~ `198.19.255.254`） | 域名对应的真实公网 IP |
| **海外域名解析发生地** | **在境外落地服务器远端解析**，天然 0 DNS 污染与最优海外 CDN | 在本地依赖配置好的加密 DoH/DoT 解析，若上游不纯仍可能泄露或污染 |
| **网页响应体感速度** | **极快**（省去一次跨网本地 DNS 往返等待，尤其配合 TUN 效果显著） | 需等待真实 DNS 解析完毕才能发起 TLS 握手 |
| **`ping` / `nslookup` 行为** | 返回 `198.18.x.x`，**此时 ICMP ping 延迟毫无真实节点参考意义** | 返回真实公网 IP，传统命令行工具诊断结果更直观 |
| **常见副作用与应对** | 个别局域网设备、企业内网 OA、游戏联机或微信组件拿到假 IP 会报错；退出代理残留缓存也会致断网 | 若未正确配齐加密 `fallback` 与 `respect-rules`，极易把海外域名解析成污染 IP 或本地 ISP 泄漏 |

> [!TIP]
> 在终端测试 Fake-IP 模式下的域名时看到 `198.18.0.1` 完全正常！绝对不要用系统的 `ping` 命令去测代理节点的真实快慢，而应始终在代理客户端面板点击基于 HTTP 204 的真连接测速（`URL-Test`）。若某些特定内网工具因为 `198.18.0.1` 报错，首选做法是将其域名加入 `fake-ip-filter` 豁免名单，而不是整机盲目关掉 Fake-IP（详见 [Fake-IP 198.18.0.1 冲突修复](/troubleshooting/articles/fake-ip-explained-fix)）。

---

## 二、Mihomo / Clash 四层 DNS 分层职责与关键防线

很多用户把开源社区里动辄几百行的 DNS 配置硬塞进自己订阅，结果改完一个网页都打不开——根本原因就是搞混了以下四层 DNS 字段的分工边界：

```text
[客户端内核 DNS 决策流转全景]

启动引导层：default-nameserver（仅填纯 IP，如 223.5.5.5）──▶ 只用来解析加密 DNS 域名（如 dns.alidns.com）
节点入口层：proxy-server-nameserver（国内稳定 IP/DoH） ──▶ 只用来解析机场节点域名（绝不可走代理！）
日常直连层：nameserver + nameserver-policy（国内加密 DNS）──▶ 解析淘宝/B站/微信等国内域名，保障就近 CDN
海外防污染：fallback + fallback-filter（海外可信加密/代理 DNS）──▶ 处理非国内域名，防 ISP 污染与抢答
```

### 1. 四大核心字段职责拆解
1. **`default-nameserver`（Bootstrap 引导解析器）**：
   当你后面的 `nameserver` 里写了诸如 `https://dns.alidns.com/dns-query` 这种**域名形式**的 DoH 地址时，内核自己必须先知道 `dns.alidns.com` 的 IP 是多少才能建立连接。**`default-nameserver` 里只能写纯 IP 地址**（例如国内可靠的公共 DNS IP 或本地路由网关 IP），绝对不能再填域名，否则立刻陷入“先有鸡还是先有蛋”的解析死锁！
2. **`proxy-server-nameserver`（节点服务器域名专用解析器 — 绝不能配成走代理）**：
   机场下发的节点地址常常是域名（如 `hk01.example.invalid`）。内核在还没连上机场节点之前，必须先向这个解析器查出节点服务器的真实 IP 才能握手建连。如果误把 `proxy-server-nameserver` 指成了需要走代理才能连上的境外 DNS，系统启动瞬间就会全部节点 `Timeout`。**该字段必须直连且优先用国内稳定 DNS**。
3. **`nameserver` 与 `nameserver-policy`（默认直连与精准策略分流）**：
   - `nameserver` 负责日常默认解析，在常规分流结构下建议配置国内稳定加密 DNS（如阿里/腾讯 DoH），保证国内网站拿到本地省市最优 CDN IP，绝不跨网绕路。
   - 借助 **`nameserver-policy`** 可以实现按域名或 `geosite` 精准指派上游（例如指定 `geosite:cn` 走国内 DoH，`geosite:geolocation-!cn` 直接指定走海外防污染上游或交由远端节点），实现“国内不绕外、海外不泄内”。
4. **`fallback` 与 `fallback-filter`（防污染兜底组）**：
   当 `nameserver` 返回的 IP 经过 `fallback-filter` 判断不属于中国大陆（例如 `geoip: true` 且 `geoip-code: CN` 判定在境外），或命中了海外域名集，内核会自动丢弃可能被污染的早期结果，采纳 `fallback` 组返回的可信纯净结果。

### 2. `respect-rules` 与关闭 IPv6（AAAA）解析策略
- **开启 `respect-rules: true` 防止海外 CDN 就近跑偏**：在传统 Mihomo 配置中，DNS 并发请求往往自成体系而不遵循底部的 `rules`。开启 `respect-rules: true`（注意要求已配置好 `proxy-server-nameserver` 防止环路）后，内核发起的海外 DNS 查询本身也会严格按分流规则走代理出口去查，这样海外站点在远端返回给你的就是距离落地机最近的高速海外 CDN IP，不会把美国网站解析成欧洲 CDN 导致慢半拍。
- **关闭不支持 IPv6 节点上的 `ipv6` DNS 解析**：如果你的本地宽带已经分配了 IPv6 地址，或者所购机场节点仅支持 IPv4 转发，保留内核 `ipv6: true` 会让应用每次优先查询 `AAAA` 记录并在 IPv6 通道上苦等超时后才退回 IPv4。在确认不需要代理 IPv6 流量时，将内核配置中的 `ipv6: false` 并阻断无效 `AAAA` 响应，能大幅消除网页首屏转圈三秒的卡顿感。

### 3. 四层 DNS 安全最小参考结构（Mihomo 配置片段示意）
以下片段展示了四层 DNS 职责如何在 YAML 中协同工作（仅作语法结构说明，切勿直接全盘替换机场自带其余网络段，建议通过 `Merge` 局部微调且保存前备份原订阅）：

```yaml
dns:
  enable: true
  ipv6: false
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
  respect-rules: true
  # 1. 引导层：只能写纯 IP，用来解析下方 DoH 域名
  default-nameserver:
    - 223.5.5.5
    - 119.29.29.29
  # 2. 节点入口层：直连解析机场节点服务器域名，严禁走代理
  proxy-server-nameserver:
    - https://dns.alidns.com/dns-query
  # 3. 日常直连层：国内常用加密 DNS，保证国内站点就近 CDN
  nameserver:
    - https://dns.alidns.com/dns-query
    - https://doh.pub/dns-query
  # 4. 精准策略分流：国内走阿里/腾讯 DoH，非国内域名转入防污染上游
  nameserver-policy:
    "geosite:cn,private":
      - https://dns.alidns.com/dns-query
    "geosite:geolocation-!cn":
      - https://dns.google/dns-query
```
**配置要点说明**：观察上述结构可以看到，如果缺少 `default-nameserver` 里的纯 IP 地址，内核就无法先把 `dns.alidns.com` 解析出来；而如果把 `proxy-server-nameserver` 删掉且开启了 `respect-rules: true`，部分机场节点域名本身就可能落入无上游可解的环路等待。

---

## 三、`fake-ip-filter` 标准白名单清单：守护微信、局域网与联网探测

使用 Fake-IP 时，以下五类请求如果拿到了 `198.18.0.x` 假 IP 极易出现诡异故障，必须在配置文件 `dns.fake-ip-filter` 中强制放行返回真实 IP：

| 白名单域名分类 | 典型过滤规则示例 | 如果没放行会触发什么故障？ |
| :--- | :--- | :--- |
| **1. 本机与局域网后缀** | `*.lan`、`*.local`、`*.home.arpa`、`+.arpa` | 打不开路由器管理页、局域网 NAS 或 AirDrop/mDNS 设备发现失败 |
| **2. 系统联网状态探测** | `+.msftconnecttest.com`、`+.msftncsi.com`、`captive.apple.com`、`connectivitycheck.gstatic.com` | Windows 任务栏右下角网络图标错误显示“无 Internet 访问”小地球，导致部分微软应用拒绝联网 |
| **3. NTP 网络时间同步** | `ntp.*.com`、`*.ntp.org.cn`、`time.*.com`、`time.apple.com` | 系统无法校准时间，进而引发所有现代 TLS 协议（VLESS/Trojan）大面积证书过期报错 |
| **4. 腾讯/微信与国内支付校验** | `localhost.ptlogin2.qq.com`、`localhost.sec.qq.com`、`+.weixin.qq.com`（按需） | 电脑版微信或 QQ 快速登录失败、微信传图转圈或部分国内银行/支付安全组件校验环境异常 |
| **5. STUN 联机与游戏服务** | `+.stun.*.*`、`+.stun.*.*.*`、`xbox.*.microsoft.com`、`*.nintendo.net` | P2P 联机语音掉线、主机游戏（Switch/Xbox/PS）NAT 类型检测失败 |

---

## 四、浏览器 DoH（安全 DNS）冲突排查与关闭步骤

很多用户配置好了客户端的 Fake-IP 与分流规则，却发现 **终端 `curl` 正常、唯独 Chrome 或 Edge 浏览器打开某海外站点依然提示连接被重置或走错了策略组**！凶手往往是浏览器自带的 **「使用安全 DNS（DoH）」**。

### 冲突原理
当 Chrome / Edge / Firefox 开启了独立的安全 DNS 并选择内置的第三方 DoH 服务商时，浏览器会直接在内部把域名通过 HTTPS 443 端口发给外部 DoH 服务器解析，**彻底绕过了本地代理客户端监听的 53 端口（或 TUN DNS 劫持模块）**。这样一来，代理客户端根本没机会拦截到 DNS 请求并赋予 Fake-IP，后续浏览器拿着外边查到的真实 IP 连进来，不仅容易和国内 CDN 冲突，还会让部分仅靠域名或 Fake-IP 识别的分流规则失效。

### 各主流浏览器安全 DNS（DoH）关闭/调整方法
1. **Google Chrome**：
   打开右上角菜单 `设置 -> 隐私和安全 -> 安全 -> 高级`，找到 **「使用安全 DNS」**。建议直接将开关 **关闭**（交由代理客户端接管系统 DNS），或确需保留时确保选中“使用当前服务提供商”（不要手动指定 Cloudflare/Google 等独立自定义模板）。
2. **Microsoft Edge**：
   打开 `设置 -> 隐私、搜索和服务 -> 安全性`，向下滑动找到 **「使用安全的 DNS 指定如何查找网站的网络地址」**，直接将其开关 **关闭** 即可。
3. **Mozilla Firefox**：
   打开 `设置 -> 隐私与安全`，滚动到底部的 **「启用基于 HTTPS 的 DNS」**，选择 **「关闭」**（或默认保护关闭状态），修改后重启一次浏览器清理内置 Async DNS 缓存。

---

## 五、只读 DNS 诊断命令（验证 Fake-IP、泄漏与缓存残留）

在修改配置前后或遭遇“退出代理就断网”时，先用以下 **只读查询命令** 判断故障到底发生在“本机网卡残留”、“Fake-IP 生效中”还是“DNS 泄漏”：

### Windows（PowerShell，只读查询）
```powershell
# OS: Windows 10 / 11 (PowerShell)
# 目的: 查看当前物理网卡与虚拟网卡各自生效的 IPv4 DNS 服务器地址，检查是否被写死残留 127.0.0.1
# 风险: 纯只读查看，不修改任何网络配置
Get-DnsClientServerAddress -AddressFamily IPv4 | Select-Object InterfaceAlias, ServerAddresses
```
```powershell
# OS: Windows 10 / 11 (PowerShell)
# 目的: 测试系统当前对国内域名与海外域名各自解析返回的 IP（判断是否返回了 198.18.x.x Fake-IP）
# 风险: 纯只读域名查询，无副作用
Resolve-DnsName -Name www.baidu.com
Resolve-DnsName -Name chatgpt.com
```
**输出解读**：
- 当开启代理的 Fake-IP 模式时，查询 `chatgpt.com` 返回 `198.18.x.x` 属正常生效；而国内域名（尤其是放入白名单后）应返回真实国内公网 IP。
- 如果你**已经关闭了代理软件**，执行 `Get-DnsClientServerAddress` 却看到 Wi-Fi/以太网的 `ServerAddresses` 里依然写着 `{127.0.0.1}` 或 `{198.18.0.2}`，或者 `Resolve-DnsName www.baidu.com` 依然返回 `198.18.x.x`，就说明代理软件异常退出留下死锁，必须按第六节执行标准回滚！

### macOS / Linux（Terminal，只读查询）
```bash
# OS: macOS / Linux (Terminal)
# 目的: 只读查看系统当前真实启用的上游 DNS 列表
# 风险: 纯只读查询，零修改风险
scutil --dns 2>/dev/null | grep -E "nameserver\[|domain" | head -n 12 || cat /etc/resolv.conf
```
```bash
# OS: macOS / Linux (Terminal)
# 目的: 使用 nslookup 观察系统解析返回的是真实 IP 还是 Fake-IP (198.18.x.x)
# 风险: 纯只读查询
nslookup www.baidu.com
```
**输出解读**：关闭代理后正常状态应显示本地路由器网关地址（如 `192.168.1.1`）或运营商自动分配 DNS。如果仅剩 `127.0.0.1` 或 `198.18.0.2` 且无法上网，立即按下方回滚还原。

### 4. 四步标准验证：如何区分 Fake-IP 正常生效与 DNS 泄漏 / 劫持？
很多用户看到“DNS 泄漏”检测网站亮红灯就会恐慌，其实不同模式下判断标准完全不同。在配置或排查结束后，建议按以下四个维度做完整对照诊断：

| DNS 诊断测试项目 | Fake-IP 模式下的正常健康表现 | Redir-Host 模式下的正常健康表现 | 出现异常表现时的根因定位与修正方向 |
| :--- | :--- | :--- | :--- |
| **1. 命令行查询海外受阻域名** | `nslookup` 返回 `198.18.0.x` 保留地址（仅在代理开启时出现） | 返回真实海外公网 IP，且多次查询结果稳定一致 | 若关闭代理后仍返回 `198.18.x.x`，说明系统残留假 IP 缓存未刷新；若 Redir-Host 返回已知错误或国内假 IP，说明 `fallback` 未生效遭污染 |
| **2. 命令行查询国内常用域名** | 列入 `fake-ip-filter` 的域名直接返回本地省市最优真实国内 IP | 返回本地省市最优真实国内公网 IP | 若国内视频或淘宝返回了境外 IP 或 `198.18.x.x` 且加载缓慢，检查 `nameserver` 是否误填了海外 DNS 或白名单缺失 |
| **3. 浏览器打开海外网页时的出口测试** | 网页秒开，在外部 DNS 检测页显示当前落地节点所在国家的可信 DNS 出口 | 显示 `fallback` 中指定的海外可信加密 DoH 出口 | 若外部检测页依然赫然显示“中国大陆本地电信/联通/移动运营商 DNS”，说明存在 **DNS 泄漏** 或浏览器自带 DoH 抢先解析，应立即开启 `respect-rules` 并关闭浏览器安全 DNS |
| **4. 彻底退出代理软件后的直连测试** | 退出后本机物理网卡恢复自动 DHCP，国内网站与路由器后台瞬间秒开 | 退出后本机物理网卡恢复自动 DHCP，所有国内站正常解析 | 若退出后连百度、微信都彻底打不开，99% 是静态残留 `127.0.0.1` 或系统内存残留 `198.18.x.x` 缓存，立即按第六节清理回滚 |

### 5. Linux 环境 53 端口冲突（`systemd-resolved`）提示
在 Ubuntu / Debian 等现代 Linux 桌面或网关中，系统默认由 `systemd-resolved` 占用本地 `127.0.0.53:53` 作为存根解析器。如果你在客户端配置中强行把代理 DNS 的 `listen` 设为 `0.0.0.0:53` 或 `127.0.0.1:53`，极易发生端口抢占导致系统原有解析崩溃。在桌面端使用 Clash Verge Rev 或 sing-box 时，建议让代理 DNS 监听在非冲突高位端口（如 `1053` 或 `7874`），再由 TUN 模式自动接管 DNS 转发流量，既无需改动操作系统底层 `resolved.conf`，又能做到关掉客户端零残留复原。

### 6. 四大典型 DNS 配置死锁误区与进阶排查分支
在排查用户提交的断网配置文件时，最常见以下四类自找死锁的参数误写：
1. **在 `default-nameserver` 中填写域名形式加密 DNS**：引导解析器只允许纯 IP。一旦写进域名形式的 DoH 或 DoT 地址，内核在启动瞬间就会因找不到解析引导器的上级解析器而陷入无限死锁。
2. **让 `proxy-server-nameserver` 经过代理出站**：机场服务器域名必须在代理隧道建立前通过本地直连解析出真实入口 IP。一旦错配成走代理组，软件重启后没有任何节点能建连成功，全部显示超时。
3. **在物理网卡手工写死 `127.0.0.1` 或 `8.8.8.8`**：人工在系统网卡填入 `127.0.0.1` 会导致关闭客户端即整机无法解析域名；填 `8.8.8.8` 则在日常直连时把国内视频和网购流量解析到跨区甚至海外节点，显著拖慢网速。
4. **混淆本地系统缓存清理与浏览器内部缓存清理**：在终端敲完缓存刷新命令后，如果浏览器窗口依然没重启，浏览器内存里保留的旧主机连接池仍会继续往 `198.18.0.x` 发包，因此回滚时务必配合彻底关闭并重开浏览器。

---

## 六、高风险操作警示与系统 DNS 断网标准回滚命令

> [!CAUTION]
> **修改系统网络 DNS 与内核 DNS 配置属高风险操作**：
> 1. **绝不要在电脑物理网卡（Wi-Fi / 以太网）上手动写死 `8.8.8.8`、`1.1.1.1` 或 `127.0.0.1`**：海外公共 DNS 在国内直连环境下极慢且易丢包，会直接拉垮国内视频与网页；写死 `127.0.0.1` 则一旦关闭代理软件就整机彻底断网。**系统物理网卡永远保持“自动获取（DHCP）”**！
> 2. **切勿同时运行多个占用本地 53 端口的 DNS 拦截工具**（如同时开 AdGuard Home、SmartDNS 与 Clash DNS `listen: 0.0.0.0:53`），端口冲突会引发双双罢工。
> 3. **严禁通过关闭系统防火墙或杀毒软件来排查 DNS 解析失败**。

**当改坏 DNS 导致所有网页打不开（即使能连上 QQ 也打不开网页）时，严格按以下 4 步执行回滚：**

### 1. 第一步：停用客户端自定义 DNS 覆写并关闭代理
打开代理客户端，取消勾选所有自定义 DNS 的 `Merge` 覆写与脚本，更新一次服务商原生订阅，关闭 **「TUN 模式」** 与 **「系统代理」** 并退出客户端。

### 2. 第二步：还原系统物理网卡 DNS 为自动获取（DHCP）
- **Windows（图形界面推荐）**：打开 `控制面板 -> 网络和共享中心 -> 更改适配器设置 -> 右键当前 Wi-Fi/以太网 -> 属性 -> 双击 Internet 协议版本 4 (TCP/IPv4)` -> 选择 **「自动获取 DNS 服务器地址」** 确定保存（如曾改过 IPv6，也一并设为自动获取）。
- **Windows（PowerShell 命令行回滚参考）**：
  ```powershell
  # OS: Windows 10 / 11 (以管理员身份运行的 PowerShell，仅在断网需要回滚还原 DHCP DNS 时执行)
  # 目的: 将指定网卡（示例为 "WLAN"，请按 Get-NetAdapter 查到的实际名称替换）的 DNS 恢复为自动获取
  # 风险: 仅修改该网卡 DNS 为默认自动获取，属于安全还原操作；先用 Get-DnsClientServerAddress 确认网卡名
  Set-DnsClientServerAddress -InterfaceAlias "WLAN" -ResetServerAddresses
  ```
- **macOS（图形界面或终端回滚）**：进入 `系统设置 -> 网络 -> 当前 Wi-Fi/以太网 -> 详细信息 -> DNS`，选中列表中手动残留的 `127.0.0.1` 或 `198.18.0.2` 点击 `-` 号删除，直至列表恢复由路由器自动分配（灰字显示网关 IP）。若需在 Terminal 快速恢复常见 `"Wi-Fi"` 接口为自动获取（仅回滚时执行）：
  ```bash
  # OS: macOS (Terminal，仅在残留手动 DNS 断网回滚时执行)
  # 目的: 清空当前 Wi-Fi 手动静态 DNS，恢复路由器 DHCP 自动下发
  # 风险: 回滚复位操作，若接口名称不同（如 "USB 10/100/1000 LAN"）请先运行 networksetup -listallnetworkservices 核对
  sudo networksetup -setdnsservers "Wi-Fi" Empty
  ```

### 3. 第三步：清空操作系统残留的 `198.18.x.x` Fake-IP 缓存（最关键！）
很多时候明明还原了网卡，网页却还是报连接拒绝，原因正是内存里还缓存着刚才代理开着时拿到的 `198.18.0.x` 假 IP！请按系统执行对应清缓存命令：

- **Windows（CMD 或 PowerShell，低风险只读级缓存清理）**：
  ```powershell
  # OS: Windows 10 / 11 (CMD / PowerShell)
  # 目的: 立刻清空系统 DNS 解析缓存中的 198.18.x.x 假 IP 记录
  # 风险: 极低风险，仅清空本地临时缓存，下一次访问域名会自动重新向路由器请求真实 IP
  ipconfig /flushdns
  ```
- **macOS（Terminal，低风险缓存清理）**：
  ```bash
  # OS: macOS (Terminal)
  # 目的: 刷新 macOS 目录服务与 mDNSResponder 缓存，清除残留的 Fake-IP 记录
  # 风险: 需输入开机密码，仅清理本地缓存，不影响网络配置文件
  sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
  ```
- **Linux（systemd-resolved 环境参考）**：
  ```bash
  # OS: Linux (使用 systemd-resolved 的发行版)
  # 目的: 刷新本机 DNS 解析缓存
  # 风险: 低风险缓存清理
  sudo resolvectl flush-caches 2>/dev/null || sudo systemd-resolve --flush-caches
  ```

### 4. 第四步：重启浏览器清理内部缓存并验证
由于现代浏览器自己也维护着一份独立的主机解析缓存（Socket Pool & Host Cache），执行完系统清理后请 **彻底关闭所有浏览器窗口再重新打开**，访问常用国内网页，确认本机直连解析 100% 恢复畅通。

---

## 七、常见问题

### Fake-IP 和 Redir-Host 两种 DNS 模式有什么核心区别，日常使用哪个更好？
Fake-IP 收到域名请求时直接秒回 `198.18.0.x` 假 IP 并把原始域名交给远端节点去解析，速度快且能从根本上规避本地 DNS 污染，是现代 TUN 模式下的首选方案；Redir-Host 则需要在本地先等待真实 IP 解析完成再按规则走代理，在命令行排障或面对极少数排斥假 IP 的企业软件时兼容更直接，但本地配置不当易引发泄漏。日常建议优先开 Fake-IP 并维护好白名单。

### 为什么在终端里 ping 一个海外域名时返回了 198.18.0.1 这种奇怪的 IP 地址？
因为 `198.18.0.0/15` 是国际标准的基准测试保留段，代理核心用它作为 Fake-IP 的映射池。终端看到 `198.18.0.1` 说明代理客户端成功拦截并接管了这次域名解析，并非中毒或报错。切记此时 `ping` 出来的几毫秒只是本机内存的响应，不能代表真实节点网络延迟。

### default-nameserver、nameserver、fallback 和 proxy-server-nameserver 各自负责什么？
`default-nameserver` 是引导解析器（只能写纯 IP），用于把域名形式的加密 DNS 解析成 IP；`proxy-server-nameserver` 专门用来直连解析机场节点入口域名，绝不能配成走代理；`nameserver` 负责日常默认直连查询（建议配国内 DoH）；`fallback` 则是海外防污染校验解析组，负责防止海外域名被本地污染结果劫持。

### 为什么明明在客户端开着代理和分流，还需要关闭 Chrome 或 Edge 浏览器的安全 DNS（DoH）？
因为浏览器内置的安全 DNS 开启自定义服务商后，会直接在应用内部通过 HTTPS 查询解析，完全跳过代理软件监听的系统 DNS 通道。这不仅会让代理核心失去通过 DNS 与 Fake-IP 识别原始域名的机会，还可能导致国内外分流失准和 CDN 分配跨区变慢。开代理时应将浏览器安全 DNS 设为关闭或跟随系统。

### 哪些域名必须放进 fake-ip-filter 白名单，防止微信、企业内网或局域网连接出问题？
至少应包含四类核心域名：第一是局域网后缀如 `*.lan`、`*.local`；第二是 Windows 与 Apple 联网状态探测域名如 `+.msftconnecttest.com`、`captive.apple.com`；第三是系统 NTP 对时域名与游戏联机 STUN 域名；第四是腾讯快速登录和微信相关域及企业内网专用域名。

### 为什么在节点不支持 IPv6 时建议关闭代理内核里的 IPv6 DNS（AAAA 记录）解析？
如果系统拿到了 IPv6 `AAAA` 地址而你的节点或中转通道实际不支持转发 IPv6 流量，浏览器和客户端每次建连都会先傻等 IPv6 连接超时后再回退到 IPv4，表现为网页总要白屏停顿数秒才加载出来。在纯 IPv4 节点环境下将内核 `ipv6` 设为关闭能立竿见影消除这种卡顿。

### 改坏了系统网卡 DNS 或内核 DNS 配置导致退出代理后全网断网，怎么按命令完整回滚？
不要重装系统或关闭安全软件，按四步快速还原：首先停用客户端自定义 DNS 覆写并退出软件；其次将物理网卡 DNS 恢复为自动获取（DHCP），Windows 可用图形设置或 `ResetServerAddresses` 命令、macOS 用设置或 `networksetup` 清空；接着在终端执行 `ipconfig /flushdns`（Windows）或 `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`（macOS）清除残留的 `198.18.x.x` 假 IP 缓存；最后重启浏览器即可完全恢复。

---

## 八、相关排障与关联指南

- DNS 泄漏专项检测：[DNS 污染与泄漏标准检查路径](/troubleshooting/articles/dns-leak-hijack-fix)
- Fake-IP 冲突修复：[Fake-IP 原理与 198.18.0.1 冲突修复](/troubleshooting/articles/fake-ip-explained-fix)
- 节点真实延迟测法：[低延迟节点 TLS RTT 与 HTTPS Ping 区别](/routes/low-latency/)
- 底层虚拟网卡配合：[TUN 模式权限授权与路由环路回滚](/guides/tun-mode/)
