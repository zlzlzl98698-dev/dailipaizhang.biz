---
title: 客户端安装教程：Win x64/ARM64、macOS 芯片区分、Linux 包格式、iOS 区服安全与 OpenWrt 指南
description: 全面整理 Windows（x64/ARM64 与 WebView2/.NET 运行时）、macOS（Intel vs Apple Silicon）、Linux（DEB/RPM/AppImage 与 v2rayA）、iOS 区服安全与禁登 iCloud 铁律、Android 防仿冒以及 OpenWrt 架构/防火墙与 Nikki 24.10+ 前置核查及回滚方案。
pillar: guides
primaryKeyword: 代理客户端安装教程
intent: informational
publishedAt: 2026-11-23
updatedAt: 2026-11-23
schemaType: HowTo
breadcrumbs:
  - text: 首页
    link: /
  - text: 使用教程
    link: /guides/
  - text: 客户端安装教程
    link: /guides/installation/
faq:
  - q: Windows 电脑下载 Clash Verge Rev 或 v2rayN 时，怎么选 x64、ARM64、安装版和便携版？
    a: 绝大多数 Intel 与 AMD 处理器的 Windows 台式机和笔记本都应选择 x64（或标注 amd64）版本，仅高通骁龙等 ARM 笔记本选 arm64 版本。日常主力安装推荐安装版以便自动配置 WebView2 或运行环境关联；绿色便携版 ZIP 必须完整解压到纯英文、有写入权限的独立目录后再运行，切忌在压缩包预览窗口直接双击。
  - q: macOS 下载客户端时，如何准确确认自己该下 Intel 还是 Apple Silicon 安装包？
    a: 点击屏幕左上角苹果图标选择关于本机，或在终端执行 uname -m 只读命令。搭载 M1、M2、M3 或 M4 系列芯片、终端输出 arm64 的电脑必须选择 Apple Silicon（arm64 / aarch64）原生包；搭载 Intel Core 处理器、终端输出 x86_64 的旧款 Mac 则选择 Intel（x64）安装包。
  - q: Linux 桌面端和无桌面纯命令行主机，分别适合选哪种包格式或客户端？
    a: Ubuntu、Debian 与 Linux Mint 等桌面环境优先选择 DEB 安装包，Fedora、RHEL 等红帽系选择 RPM 包，跨发行版免安装便携运行可选 AppImage（需匹配 x86_64 或 aarch64 架构并赋予执行权限）。如果是没有图形桌面的 Linux 服务器、NAS 或网关，最适合部署提供 Web 浏览器控制面板的 v2rayA。
  - q: 为什么在 iPhone 上下载 Shadowrocket、Stash 或 Quantumult X 时，绝不能在系统设置 iCloud 登录共享 Apple ID？
    a: 因为在系统设置主界面的 Apple ID / iCloud 处登录他人共享账号，对方就能通过后台的查找我的 iPhone 功能直接把你的设备标为丢失模式并远程锁定敲诈，风险极大。绝对安全的方式是自建海外区 Apple ID 并使用官方礼品卡购入正版，即使临时借号也只允许在 App Store 商店应用内部登录并在下载完成后立刻退出。
  - q: Android 手机安装代理客户端有哪些必须避开的架构坑和仿冒应用陷阱？
    a: 现代 64 位安卓手机应认准 arm64-v8a 架构的 APK 安装包；使用 Clash 系工具应选择活跃维护的 FlClash、Clash Mi 或 Clash Meta for Android，注意与已停更的旧版 Clash for Android 区分；尤其牢记 NekoBox 官方发出的安全警告，绝不要下载 Google Play 商店中已被第三方控制的同名 NekoBox 版本。
  - q: OpenWrt 软路由安装代理插件前必须核查哪五项指标，为什么 Nikki 经常装不上？
    a: 动手前必须通过 SSH 核对 OpenWrt 主版本号、CPU 架构、包管理器类型（opkg 还是 apk）、防火墙机制（fw3 iptables 还是 fw4 nftables）以及 /overlay 剩余闪存空间。其中 Nikki 透明代理插件已明确要求 OpenWrt 24.10 及以上版本，在 21.02、22.03 或 23.05 等旧固件上强行安装会因依赖与防火墙架构不兼容而失败。
  - q: 在 OpenWrt 路由器上安装或启用透明代理插件后导致全屋断网且进不去管理后台怎么回滚？
    a: 安装软路由插件前务必先在 LuCI 后台导出完整 backup 配置备份包。若开启后全屋断流但仍可网线直连，立即通过 SSH 登录路由器停用对应插件服务并重启 firewall 与 dnsmasq 服务即可恢复直连；若管理口也无响应，可通过网线静态 IP 直连或进入 OpenWrt 官方 Failsafe 安全模式还原备份包。
---

# 客户端安装教程：全平台芯片架构区分、安全渠道与 OpenWrt 前置核查

> **核心结论（Answer-First）**：跨平台代理客户端的安装核心不在于“点下一步”，而在于安装前的 **「架构匹配」**、**「渠道防伪」** 与 **「运行时/防火墙前置核对」**。Windows 需区分 `x64` 与 `arm64` 并保障 `WebView2 / .NET` 运行环境；macOS 需严守 `Intel` 与 `Apple Silicon` 分界；Linux 需对口 `DEB / RPM / AppImage` 或无头端 `v2rayA`；iOS 必须死守 **「绝不在系统设置 iCloud 登录共享 Apple ID」** 铁律；OpenWrt 软路由动工前必须先备份固件配置并确认版本号与防火墙体制（如 **Nikki 明确要求 OpenWrt 24.10+**）。**任何平台均严禁通过关闭系统自带杀毒软件或防火墙来强行运行来历不明的安装包。**

::: warning 官方下载渠道与零虚构 URL 声明
依据本站 `data/clients.json` 审计准则，开源客户端及商店应用均来源于原作者官方仓库、官网或对应区服官方应用商店（未独立核实具体仓库完整 URL 前，本站统一保留「待核实」标注，绝不拼凑第三方非官方镜像站或网盘转载包）。请务必警惕搜索引擎竞价广告中的仿冒下载站与捆绑木马安装包。
:::

---

## 一、Windows 安装：x64 / ARM64 架构、WebView2 与 .NET 运行时

根据站内客户端清单，Windows 平台常用通用客户端涵盖 **[Clash Verge Rev](/clients/clash-verge/)**、**FlClash**、**[v2rayN](/clients/v2rayn/)**、**Clash Nyanpasu**、**Hiddify**、**Karing** 与 **Clash Mi** 等（另注：`Mihomo Party` 在站内数据中标有维护状态警告，应先核实项目维护动态，不宜未经核实作为新手首选）。

### 1. 第一步：只读核对本机处理器架构与文件校验值
在下载任何 `.exe`、`.msi` 或 `.zip` 之前，先在 PowerShell 执行以下只读查询，避免下错包导致直接无法运行：

```powershell
# OS: Windows 10 / 11 (PowerShell)
# 目的: 查看当前系统 CPU 架构，确认应下载 x64 (amd64) 还是 arm64 安装包
# 风险: 只读查询环境变量，零系统修改风险
$env:PROCESSOR_ARCHITECTURE
```
**输出解读**：
- 输出 **`AMD64`**：市面上 95% 以上 Intel 酷睿与 AMD 锐龙台式机/笔记本均属于此架构，应下载文件名带 **`x64` / `x86_64` / `amd64`** 的安装包。
- 输出 **`ARM64`**：搭载高通骁龙 X 等 ARM 芯片的笔记本，应优先下载原生的 **`arm64`** 安装包以保证虚拟网卡驱动与内核效率。

对于从官方开源发布页下载的安装包，建议同步执行一次只读 SHA256 哈希核对，与官方发布页公布的校验值比对一致后再安装：
```powershell
# OS: Windows 10 / 11 (PowerShell)
# 目的: 计算已下载安装包的 SHA256 校验和，核实文件未被第三方篡改或下载残缺
# 风险: 纯只读计算文件哈希，请将示例文件名替换为实际下载文件路径
Get-FileHash -Path "$env:USERPROFILE\Downloads\client-setup.exe" -Algorithm SHA256
```

### 2. 安装版 vs 绿色便携版（Portable ZIP）选择与避坑
- **安装版（Setup `.exe` / `.msi`）**：自动创建开始菜单快捷方式、配置数据目录并协助引导运行环境，**适合绝大多数主力日常用户**。建议保持纯英文安装路径（例如 `C:\Program Files\...` 或 `D:\Apps\...`），避免中文或特殊符号路径触发内核路径解析报错。
- **绿色便携版（Portable `.zip`）**：把所有配置文件存在软件同级目录下，方便拷贝迁移。**常见致命踩坑**：绝对不要在压缩软件（WinRAR / 7-Zip / 资源管理器预览）里直接双击 `.exe` 运行，否则内核与订阅配置无法写盘！必须先完整右键解压到有常规写入权限的非系统保护目录（例如 `D:\Tools\ProxyClient\`，不要直接解压进权限受限的 `C:\Program Files\`）后再启动。

### 3. 运行时依赖（WebView2 / .NET）与安全边界
- **Clash Verge Rev 白屏或启动失败**：该客户端界面基于微软 **Edge WebView2 Runtime** 渲染。Win11 一般自带，部分精简版 Win10 若缺此组件会导致打开后纯白屏或报错，需从微软官方途径补装标准版 WebView2 Runtime（详见 [Clash Verge Rev 无法启动与白屏排查](/troubleshooting/articles/clash-verge-startup-fail)）。
- **v2rayN 提示缺失运行环境或核心加载失败**：新版 v2rayN 依赖微软 **.NET Desktop Runtime**（常见为 .NET 8 桌面运行时），且下载时必须留意区分“仅界面精简包”与“含核心完整包（With-Core）”，缺少核心可执行文件会导致无法连接节点（详见 [v2rayN 核心加载失败修复](/troubleshooting/articles/v2rayn-core-load-fail)）。
- **防病毒安全红线**：**绝不允许通过彻底关闭 Windows Defender 实时保护或卸载第三方杀毒软件来强行运行不明来源的压缩包**！正经官方客户端如若遇到误报或需要配合本地服务，应先二次核对官方安装包数字签名与 SHA256 哈希，确认来源 100% 清白后再按规范处理，切忌裸奔系统。

---

## 二、macOS 安装：Intel vs Apple Silicon 与签名放行边界

macOS 生态下的常用通用客户端包括 **[Clash Verge Rev](/clients/clash-verge/)**、**FlClash**、**Clash Nyanpasu**、**[v2rayN](/clients/v2rayn/)**、**Hiddify**、**Karing**、**Clash Mi**、**Surge Mac** 以及官方 **[sing-box (SFM)](/clients/sing-box/)**。

### 1. 严格区分芯片架构（`arm64` vs `x86_64`）
不要凭印象猜测电脑型号，先在 macOS 终端运行只读命令，或点击屏幕左上角苹果图标选择 **「关于本机」**：

```bash
# OS: macOS (Terminal)
# 目的: 准确识别 Mac 芯片属于 Apple Silicon 还是 Intel 处理器
# 风险: 纯只读系统信息查询，无修改风险
uname -m
```
**输出解读**：
- 输出 **`arm64`**：表示你的设备是 **Apple Silicon（M1 / M2 / M3 / M4 系列芯片）**，下载 `.dmg` 时必须认准 **`aarch64` / `arm64` / `Apple Silicon`** 原生包。若误装 Intel 版不仅靠 Rosetta 转译更耗电，后续在授权 Helper 或拉起 `utun` 虚拟网卡时也极易出现权限与架构兼容异常。
- 输出 **`x86_64`**：表示你的设备是 **Intel 处理器 Mac**，必须下载 **`x64` / `x86_64` / `Intel`** 版本。

### 2. 处理“无法验证开发者 / 已损坏”的合规边界
许多开源桌面客户端（如 GitHub 发布的 `.dmg`）未购买苹果公证证书或未上架 Mac App Store，首次拖入「应用程序（Applications）」双击打开时，macOS Gatekeeper 会弹窗阻止运行：
- **合规处理方式**：先核实安装包确实从开发者官方渠道下载且 SHA256 校验一致，点击弹窗取消后，打开 **`系统设置 -> 隐私与安全性`**，向下滚动找到被拦截应用的提示栏点击 **「仍要打开」** 并输入开机密码确认即可。
- **严禁操作的红线**：**切勿为了图省事在恢复模式里关闭 macOS 系统完整性保护（SIP）**；同时谨慎对待网络上教人直接对陌生来源文件执行 `xattr -cr` 绕过隔离属性的做法——使用任何解除隔离动作前，必须先通过哈希或官方渠道验明安装包真实身份。

---

## 三、Linux 安装：DEB / RPM / AppImage 对比与无桌面 v2rayA 方案

Linux 客户端目前覆盖 **[Clash Verge Rev](/clients/clash-verge/)**、**FlClash**、**[v2rayN](/clients/v2rayn/)**、**Clash Nyanpasu**、**Hiddify**、**Karing**、**Clash Mi**、**sing-box for Desktop** 以及专为无桌面/网关设计的 **v2rayA**。

### 1. 第一步：只读确认发行版系列与 CPU 架构
```bash
# OS: Linux (Terminal)
# 目的: 一次性查看系统内核架构与发行版版本号，精准匹配软件包格式
# 风险: 只读查询，零修改风险
uname -m && cat /etc/os-release | grep -E "^(NAME|VERSION_ID)="
```
**输出解读**：例如输出 `x86_64` + `Ubuntu 24.04`，应下载 `amd64.deb`；输出 `aarch64` + `Fedora`，则应匹配 `aarch64.rpm`。

### 2. 四种主流部署形态选型矩阵

| 安装包形态 | 适用发行版 / 环境 | 安装与运行特性 | 前置依赖与常见问题 |
| :--- | :--- | :--- | :--- |
| **DEB（`.deb`）** | Ubuntu、Debian、Linux Mint、Deepin | 完美集成 `apt` / `dpkg`，自动生成桌面图标、systemd 服务与依赖链 | 留意 `amd64` 与 `arm64` 后缀区分；安装时建议使用 `sudo apt install ./文件名.deb` 以自动补齐缺省动态库 |
| **RPM（`.rpm`）** | Fedora、RHEL、openSUSE、AlmaLinux | 集成 `dnf` / `zypper` 包管理，结构规范 | 同样须区分 `x86_64` 与 `aarch64` 架构包 |
| **AppImage（`.AppImage`）** | 几乎所有主流 Linux 图形桌面 | 单文件免安装，右键属性勾选可执行或 `chmod +x` 即可启动 | 较新的 Ubuntu（22.04/24.04+）默认未安装旧版 FUSE 2 库，直接双击没反应时需按官方发行版规范补充 `libfuse2` |
| **Web 管理端（v2rayA）** | **无图形桌面的 Linux 服务器、NAS 或小型主机** | 后台守护进程配合浏览器 Web UI 控制界面管理订阅、分流与透明代理 | 需确认服务器内核支持对应透明代理模块及 `nftables` / `iptables` 防火墙规则 |

---

## 四、Android 与 iOS 移动端安全渠道与区服铁律

移动端的系统权限高度封闭，安装时的安全重心从“文件后缀”转向了 **「应用真伪核验」** 与 **「Apple ID 账号防锁机」**。

### 1. Android 端：认准 `arm64-v8a` 与两大避坑警示
Android 主流通用工具包括 **v2rayNG**、**FlClash**、**[Clash Meta for Android (CMA)](/clients/clash-meta/)**、**Hiddify**、**Karing**、**Clash Mi** 与官方 **[sing-box (SFA)](/clients/sing-box/)**。
- **架构选择**：近几年生产的智能手机与平板绝大多数为 64 位 ARM，安装 APK 时选择 **`arm64-v8a`**（部分发布页提供包含全架构的 `universal` 通用包，但体积较大）；极老旧 32 位安卓设备才选 `armeabi-v7a`。
- **警示一：分清 CMA 与已停更的 CFA**：安装 Clash 系客户端请认准活跃维护的 **FlClash** 或 **Clash Meta for Android**，不要再下载早年已停更且不支持新协议的旧版 `Clash for Android`。
- **警示二：NekoBox Google Play 仿冒风控红线**：根据站内 `data/clients.json` 核查记录，**NekoBox for Android 官方已明确发出安全警告，提示维护资源有限，且特别警示用户绝不要安装 Google Play 商店中其名称下已被第三方控制的同名 NekoBox 版本**！获取任何开源安卓 APK 务必从开发者官方发布页核实签名。

### 2. iPhone / iPad（iOS）端：付费区服与禁登 iCloud 锁机铁律
iOS 端由于国内区 App Store 下架了相关网络工具，安装必须依靠非大陆区（如美区、港区、日区、台区）App Store。主流应用与特性对照如下：

| iOS 客户端名称 | 核心引擎与兼容格式 | 上架与收费状态（据 `data/clients.json`） | 适合人群与核心注意边界 |
| :--- | :--- | :--- | :--- |
| **[Shadowrocket（小火箭）](/clients/shadowrocket/)** | 自研引擎（支持 Base64 / 通用节点 / 规则配置） | **海外区（如美区）付费应用** | iOS 装机量最大、教程最全的通用首选 |
| **Stash** | Clash 兼容内核（原生吃 Clash YAML 与覆写） | **海外区付费应用** | 适合桌面端重度 Clash 用户在 iPhone 上无缝沿用规则与 Merge |
| **Quantumult X（圈 X）** | Quantumult X 引擎（独立规则与重写格式） | **海外区付费应用** | 适合需要请求重写、脚本和精细自定义 DNS 的进阶玩家 |
| **Surge 5** | Surge 高性能引擎 | **包含应用内购买** | 定位偏专业网络抓包、调试与深度规则控制 |
| **[sing-box (SFI)](/clients/sing-box/) / Karing / Hiddify / Streisand** | sing-box / Xray 兼容生态 | 非大陆区 App Store（具体售价与地区可见性以本人所属区服为准） | 现代新协议支持完整，适合多端统一或原生 sing-box 订阅 |
| **Potatso / OneClick** | 传统基础引擎 | App Store（地区可见性以本人区服为准） | **协议限制**：Potatso 仅覆蓋 SS/SSR/SOCKS/HTTP(S)；OneClick 资料标注覆盖 VMess/SS/Trojan，对 VLESS/Hysteria 2 支持有限 |

> [!CAUTION]
> **iOS 最高安全铁律：绝对严禁在系统「设置 -> Apple ID / iCloud」中登录任何他人共享的 Apple ID！**
> 许多不良卖家或网店会发放“免费美区共享账号”供人下载小火箭。**只要你在系统「设置」主界面顶部登录了陌生人的账号，对方就能立刻在网页端触发“查找我的 iPhone（丢失模式）”远程锁定你的整台手机并索要高额解锁赎金！**
> **正确做法**：强烈建议自行注册海外区 Apple ID 并通过官方合规途径购入正版应用；若万不得已临时借用他人账号下载，**只能打开「App Store」商店软件内部右上角头像登录**，绝不碰系统设置主账号，且下载完毕必须第一时间在 App Store 内退出。

---

## 五、OpenWrt 软路由安装前五项核查与高风险回滚

在家用或企业 OpenWrt 软路由上部署 **OpenClash**、**PassWall2**、**Nikki**、**HomeProxy** 或 **v2rayA** 可以实现全屋设备免安装客户端透明代理。但路由器掌控着全家甚至整个局域网的网络入口，**安装失败或防火墙冲突会直接造成全屋设备断网甚至进不去管理后台**，属于全教程风险等级最高的操作。

### 1. 动工前必查的五项硬性指标（含 Nikki 24.10+ 限制）
切勿拿别人网盘里的 `.ipk` 包盲目往自己路由器里装，必须先通过 SSH 运行只读命令核清以下五项条件：

1. **OpenWrt 主版本号（关键硬门槛）**：例如 **Nikki 项目在官方资料中明确要求运行环境为 OpenWrt 24.10 及以上版本**。如果你刷的是 21.02、22.03 或 23.05 等旧固件，不仅软件包依赖对不上，强行安装更会导致防火墙规则失灵。
2. **CPU 架构（Target / Subtarget）**：不同硬路由和 X86 软路由架构天差地别（如 `x86_64`、`aarch64_cortex-a53`、`mipsel_24kc`），不仅插件包要对口，里面的 `mihomo` / `sing-box` / `xray` 二进制内核也必须严格对应相同架构。
3. **包管理器体系（`opkg` vs `apk`）**：OpenWrt 23.05 及以前版本统一使用传统 `opkg` 管理器（安装 `.ipk` 包），而 **OpenWrt 24.10+ 生态已逐步引入并转向 `apk` 包格式**，两者软件包不能混装。
4. **防火墙底层架构（`fw3/iptables` vs `fw4/nftables`）**：OpenWrt 22.03 起全面切向基于 `nftables` 的 `fw4`，而早期老固件使用 `iptables (fw3)`。例如 **HomeProxy（基于 sing-box）与 Nikki 深度依赖现代 `fw4 / nftables` 机制**，而传统插件如 OpenClash 需确认安装了配套的 `kmod-nft-tproxy` 或 `iptables` 内核模块依赖。
5. **剩余闪存空间（`/overlay` 可用容量）**：许多家用硬路由闪存总容量仅有几十 MB。一个 `mihomo` 或 `sing-box` 核心动辄占用 15MB–30MB 空间，一旦 `/overlay` 写满 100%，路由器的所有配置更改都会无法写入保存，甚至导致重启后配置丢失或无法启动系统。

### 2. SSH 只读核查命令（零修改风险）
```sh
# OS: OpenWrt (通过 SSH 登录后执行)
# 目的: 一次性只读核实当前固件发行版本、架构标识、内核版本以及 /overlay 剩余磁盘空间
# 风险: 纯只读查看命令，不会对路由器配置或网络造成任何影响
cat /etc/openwrt_release && uname -a && df -h /overlay
```
**输出解读**：重点核对 `DISTRIB_RELEASE`（确认是否达到 `24.10` 等目标版本要求）、`DISTRIB_ARCH`（核对安装包架构名称），并确保 `/overlay` 的 `Available` 剩余空间远大于待安装插件与核心体积之和（建议至少留有 40MB 以上富余）。

### 3. 高风险操作警示与软路由断网回滚方案

> [!CAUTION]
> **OpenWrt 透明代理安装与修改的高风险红线**：
> 1. 千万不要在同一台 OpenWrt 路由器上**同时启用两个透明代理插件**（如同时开着 OpenClash 和 PassWall2/Nikki），它们的 `nftables` / `dnsmasq` 端口劫持链会剧烈冲突导致全屋断流！
> 2. **操作前必做备份**：在动工安装或升级任何插件前，务必登录 LuCI 管理界面进入 `系统 -> 备份与升级 -> 生成备份`，将 `backup-*.tar.gz` 完整归档文件下载保存到你的本地电脑硬盘。

**一旦安装插件或启动透明代理后导致全屋断网、所有网页打不开，按以下三层方案由浅入深回滚：**

1. **有网线直连且能登录 SSH 时的快速停用回滚**：
   用网线将电脑直接插在路由器 LAN 口，通过 `ssh root@192.168.1.1`（按你实际的路由器后台 IP）连入终端，按你安装的插件名称停用服务并重建原生防火墙与 DNS：
   ```sh
   # OS: OpenWrt (仅在发生断网故障回滚时执行)
   # 目的: 立即停止并取消开机自启引起冲突的代理插件，重启原厂防火墙与 dnsmasq 恢复全屋直连
   # 风险: 回滚操作，会关闭代理功能但能恢复本地宽带正常上网（示例以 openclash 为例，可按实际替换为 nikki / passwall2 / homeproxy）
   /etc/init.d/openclash stop
   /etc/init.d/openclash disable
   /etc/init.d/firewall restart
   /etc/init.d/dnsmasq restart
   ```
2. **后台 LuCI 页面仍能打开时的恢复法**：
   直接在浏览器进入 `系统 -> 备份与升级 -> 恢复备份`，上传动工前下载到本地的 `backup-*.tar.gz`，等待路由器自动重启即可退回安装前纯净状态。
3. **连管理页面和常规 SSH 都彻底失联时的兜底急救**：
   拔掉非必要插件占用设备，给电脑本地有线网卡手动配置路由器同网段静态 IP，按照硬件型号对应的 **OpenWrt 官方 Failsafe 安全模式** 进入极简恢复终端（通过挂载 `/overlay` 并执行 `firstboot` 或替换还原配置文件），将网络重置回出厂干净状态。

---

## 六、全平台客户端选型核查与安装期常见异常处置矩阵

在完成各系统架构与安装通道核对后，建议再结合站内 `data/clients.json` 审计结论与高频报错特征，做最后一次“避坑核验”：

### 1. 各平台通用客户端维护状态与协议兼容性总览（据 `data/clients.json`）

| 平台类别 | 推荐优先考虑客户端 | 需注意的维护或协议边界警告 | 官方主要分发渠道类型 |
| :--- | :--- | :--- | :--- |
| **Windows** | **[Clash Verge Rev](/clients/clash-verge/)**、**FlClash**、**[v2rayN](/clients/v2rayn/)**、**Hiddify**、**Karing** | `Mihomo Party` 在站内数据明确标有维护状态警告，不宜未经核实作主力首选；Clash Verge Rev 需注意 `WebView2`，v2rayN 需注意 `.NET` 与完整核心包 | GitHub（以原作者仓库发布页为准，绝不轻信广告下载站） |
| **macOS** | **[Clash Verge Rev](/clients/clash-verge/)**、**FlClash**、**Surge Mac**、**[sing-box (SFM)](/clients/sing-box/)** | 严格区分 `Apple Silicon (arm64)` 与 `Intel (x86_64)`；开源应用首次启动需在隐私与安全性合规放行，严禁关闭系统完整性保护 SIP | GitHub / 官网（以官方渠道为准） |
| **Linux** | **[Clash Verge Rev](/clients/clash-verge/)**、**FlClash**、**[v2rayN](/clients/v2rayn/)**、**v2rayA** | 桌面端按发行版匹配 `DEB / RPM / AppImage`（注意新版 Ubuntu FUSE 依赖）；无图形桌面服务器与 NAS 首选 Web 控制台形态的 **v2rayA** | GitHub（按架构区分 `amd64` / `aarch64`） |
| **Android** | **FlClash**、**[Clash Meta for Android](/clients/clash-meta/)**、**v2rayNG**、**Karing** | 认准 `arm64-v8a`；远离已停更旧版 `CFA`；**严禁下载 Google Play 上已被第三方控制的同名 NekoBox 版本** | GitHub 官方发布页（核对 APK 签名） |
| **iOS / iPadOS** | **[Shadowrocket](/clients/shadowrocket/)**、**Stash**、**Quantumult X**、**Karing**、**[sing-box (SFI)](/clients/sing-box/)** | 多款工具为海外区付费应用；`Potatso / OneClick` 对 `VLESS / Hysteria 2` 等现代协议支持有限；**铁律：严禁在系统设置 iCloud 登录共享 Apple ID** | 海外区 App Store（以本人所属区服实际可见与定价为准） |
| **OpenWrt** | **OpenClash**、**Nikki**、**PassWall2**、**HomeProxy** | **Nikki 明确要求 OpenWrt 24.10 及以上版本**；必须先核清 `fw3 (iptables)` vs `fw4 (nftables)`、`opkg` vs `apk` 及 `/overlay` 剩余空间 | GitHub / 官方软件源（动工前必备份配置） |

### 2. 安装阶段高频启动故障速查与安全处理边界

| 安装阶段典型报错症状 | 最可能的技术根因 | 正确安全的处置方式 | 绝对禁止的高危错误动作 |
| :--- | :--- | :--- | :--- |
| **Windows 双击安装包或便携版后纯白屏、闪退或无窗口** | 缺少微软 Edge WebView2 运行时，或直接把绿色便携包放在系统只读保护目录（如 `Program Files`）导致配置无法写盘 | 补装微软官方 WebView2 Runtime，并将绿色版完整解压到纯英文普通读写目录后运行 | 绝不要通过关闭 Windows Defender 实时保护来强行绕过拦截 |
| **v2rayN 打开后无法启动核心、提示缺 `xray.exe`** | 下载了不含内核二进制的纯界面精简包，或缺少对应版本的 `.NET Desktop Runtime` | 补装 `.NET` 桌面运行时，并下载官方发布的完整含核心归档或通过端内安全更新核心 | 切勿从陌生网盘或论坛私人打包链接直接替换来历不明的 `.exe` 核心 |
| **macOS 拖入应用程序后提示“已损坏，无法打开”** | 开源未公证应用被 Gatekeeper 隔离拦截，或跨芯片错装了不兼容包 | 先核对 SHA256 与官方来源无误，再通过 `系统设置 -> 隐私与安全性` 点击「仍要打开」 | 绝对不要进入恢复模式执行命令关闭 macOS SIP 系统完整性保护 |
| **OpenWrt 安装插件提示架构不符、依赖缺失或写不进去** | 下错了 CPU 架构包、混淆了 `opkg` 与 `24.10+ apk`、老系统强装 Nikki 或 `/overlay` 已满 | 退回执行 `cat /etc/openwrt_release` 与 `df -h /overlay` 核实版本、包格式与剩余容量 | 切勿使用 `--force-depends` 强行硬塞不匹配固件依赖的包，防止路由器无法启动 |

### 3. 进阶安装与维护专题规划（三级扩展阅读方向）
随着多设备与软路由使用深度增加，站内后续可进一步承接以下实操细节：
- **SHA256 哈希核对与防钓鱼下载**：通过系统自带校验命令比对开源发布页校验文件，彻底远离搜索引擎竞价仿冒包。
- **安装版 vs 便携版平滑升级与数据目录迁移**：梳理在 Windows 重装系统或更换主力客户端时，如何无损保留本地 `Profiles` 与规则集配置（当前可先查阅 [从旧客户端安全迁移并备份配置](/troubleshooting/articles/client-migration-backup)）。
- **OpenWrt 防火墙底层适配与大容量扩容**：详拆 `fw3 (iptables)` 向 `fw4 (nftables)` 迁移时的核心模块依赖，以及小容量硬路由 `/overlay` 清理与外部挂载方案。

---

## 七、常见问题

### Windows 电脑下载 Clash Verge Rev 或 v2rayN 时，怎么选 x64、ARM64、安装版和便携版？
运行 PowerShell 查询 `$env:PROCESSOR_ARCHITECTURE`，绝大多数 Intel 和 AMD 芯片返回 `AMD64` 应下载 `x64`（或 `amd64`）版本，仅高通骁龙等设备返回 `ARM64` 时选 `arm64` 版本。主力日常用推荐选安装版便于自动配置 WebView2 或运行环境关联；下载便携版 ZIP 务必完整解压到非中文、有常规读写权限的独立文件夹再运行，不要在压缩包预览窗口里直接启动。

### macOS 下载客户端时，如何准确确认自己该下 Intel 还是 Apple Silicon 安装包？
打开终端运行 `uname -m` 或查看桌面左上角苹果菜单的“关于本机”。凡是搭载 M1、M2、M3、M4 芯片且输出 `arm64` 的苹果电脑，必须选 `Apple Silicon / arm64 / aarch64` 原生镜像；搭载英特尔芯片且输出 `x86_64` 的旧款 Mac 才选择 `Intel / x64` 镜像。

### Linux 桌面端和无桌面纯命令行主机，分别适合选哪种包格式或客户端？
Ubuntu、Debian 系图形桌面优先选用集成度最好的 DEB 包，Fedora、RHEL 系选用 RPM 包，追求免安装跨发行版可用 AppImage 包（需注意补齐 FUSE 2 库并赋予执行权限）。若设备是没有图形界面的纯命令 Linux 服务器或 NAS 主机，最适合使用提供浏览器 Web 控制台的 v2rayA。

### 为什么在 iPhone 上下载 Shadowrocket、Stash 或 Quantumult X 时，绝不能在系统设置 iCloud 登录共享 Apple ID？
因为在系统“设置”最顶部登录他人共享 Apple ID，意味着对方可以通过“查找我的 iPhone”功能将你的手机设为丢失模式并远程锁死整台设备，从而引发敲诈勒索风险。安全途径是自己注册外区账号配合官方礼品卡购买；若临时借号下载，也绝对只允许在 App Store 应用商店内部登录并在下载完成后立刻退号。

### Android 手机安装代理客户端有哪些必须避开的架构坑和仿冒应用陷阱？
近几年安卓设备均认准 `arm64-v8a` 架构 APK，避免下载到老旧 32 位版本或被篡改的三方打包版；使用 Clash 生态请选择活跃维护的 FlClash、Clash Mi 或 Clash Meta for Android，注意与早已停更的旧版 Clash for Android 区分；特别牢记 NekoBox 官方发出的警告，严禁从 Google Play 下载已被第三方控制的同名 NekoBox 应用。

### OpenWrt 软路由安装代理插件前必须核查哪五项指标，为什么 Nikki 经常装不上？
安装前须通过 SSH 确认 OpenWrt 主版本号、CPU 架构、包管理器类型（`opkg` 还是 `apk`）、防火墙体系（`fw3/iptables` 还是 `fw4/nftables`）以及 `/overlay` 剩余空间。其中 Nikki 项目明确要求系统版本为 OpenWrt 24.10 及以上，旧版固件强行安装必然因依赖与防火墙架构不兼容报错。

### 在 OpenWrt 路由器上安装或启用透明代理插件后导致全屋断网且进不去管理后台怎么回滚？
任何改动前必须先在 LuCI 下载完整配置备份包。断网后若电脑接网线仍能连通 SSH，可立即执行命令停止并禁用刚启用的插件服务，随后重启 `firewall` 与 `dnsmasq` 即可还原；若管理界面彻底打不开，则通过同网段静态 IP 接入或利用 OpenWrt 官方 Failsafe 安全模式恢复动工前的配置备份。

---

## 七、安装后下一步引导

- 安装完客户端但启动白屏或加载报错：[Clash Verge Rev 启动与 WebView2 异常](/troubleshooting/articles/clash-verge-startup-fail) ｜ [v2rayN 核心加载失败](/troubleshooting/articles/v2rayn-core-load-fail)
- 开始导入你的机场订阅链接：[机场订阅格式原理与安全导入教程](/guides/subscriptions/)
- 学习核心配置与分流防线：[Clash 配置模式与策略组](/guides/clash-setup/) ｜ [TUN 模式权限与路由环路预防](/guides/tun-mode/)
