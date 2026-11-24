---
title: 客户端无法启动排查专题：白屏、核心加载失败与配置迁移
description: 系统解决 Clash Verge Rev 无法启动与 WebView2 白屏、Mihomo YAML 语法报错与 Geo 库 0 字节损坏、v2rayN 核心加载失败及 CFW/Mihomo Party 迁移备份问题。
pillar: troubleshooting
category: app-not-starting
primaryKeyword: 代理客户端无法启动
intent: troubleshooting
publishedAt: '2026-11-23'
updatedAt: '2026-11-23'
breadcrumbs:
  - text: 首页
    link: /
  - text: 故障排查
    link: /troubleshooting/
  - text: 客户端无法启动
faq:
  - q: 客户端双击没反应、白屏或核心启动失败，需要先卸载重装吗？
    a: 先不要直接彻底删除配置目录重装，否则极易把本地订阅清单、自定义分流规则和个人覆写脚本一并清空。应先在任务管理器中终止残留核心进程，核对是否缺少系统运行时（如 Windows WebView2 或 .NET Desktop Runtime），再将 profiles 配置目录完整备份到独立文件夹后，逐项验证纯净订阅或执行覆盖修复。
  - q: 如果怀疑杀毒软件拦截了代理核心文件，应该直接关闭 Windows Defender 或安全软件吗？
    a: 绝不建议将关闭杀毒软件或停用实时防护作为排障动作。网络上充斥大量夹带木马的仿冒代理客户端，关闭防护风险极高。正确做法是先核验安装包是否来自官方开源发布通道并比对文件哈希，检查安全中心隔离区记录，确认来源绝对可信后再按需排查安装路径与目录权限。
  - q: Clash Verge Rev 打开后窗口纯白屏，或者 macOS 提示架构错误无法运行怎么处理？
    a: Windows 端纯白屏九成源于系统缺少或损坏了 Microsoft Edge WebView2 Runtime，或显卡驱动与图形硬件加速存在兼容冲突，补装官方 WebView2 并在备份配置后清理损坏窗口状态缓存即可恢复；macOS 端则需严格区分芯片架构，Apple Silicon（M 系列）必须下载 arm64 版本，Intel 机型下载 x64 版本，装错会直接报 Bad CPU type 或闪退。
  - q: Mihomo 核心报错 yaml unmarshal errors 或启动卡死，除了 YAML 语法错误还可能是 Geo 库损坏吗？
    a: 是的。除了自定义 Merge/Script 覆写脚本缩进混用 Tab、存在旧版 Clash 废弃字段或用停更原版 Clash 内核加载 VLESS/Hysteria 2 协议外，GeoIP.dat、GeoSite.dat 或 country.mmdb 在网络抖动时下载中断形成 0 字节损坏文件，同样会导致 Mihomo 核心启动瞬间报错退出。停用覆写并核对数据目录下 Geo 文件体积即可快速定位。
  - q: v2rayN 启动提示找不到核心文件或无法连接 VLESS 与 Hysteria 2 节点怎么办？
    a: 最常见原因有三个：一是系统缺少对应版本的 .NET Desktop Runtime 导致主程序或辅助模块拉起失败；二是误下载了不含核心二进制文件的精简压缩包，文件夹内压根没有 xray.exe 或 sing-box.exe；三是解压目录放在了受保护的只读路径或含异常特殊字符路径中。补装运行时、核对完整含核包并检查各协议绑定的核心类型即可解决。
  - q: 从停更的 Clash for Windows 或 Mihomo Party 迁移到新客户端前，必须做哪些备份与清理？
    a: 迁移前先导出备份全部订阅 URL 清单与自定义覆写脚本；随后务必在旧客户端内依次关闭「系统代理」「TUN 模式」「服务模式」与「开机自启」，卸载旧虚拟网卡驱动并彻底退出进程，再安装启动新客户端（如 Clash Verge Rev、FlClash 或 v2rayN）。跳过清理步骤极易导致新旧客户端同时抢占 7890 端口和系统路由。
  - q: 安装 OpenWrt 软路由端代理插件或安卓端客户端时，有哪些容易踩坑的版本与渠道限制？
    a: 软路由端高度依赖固件版本与防火墙后端，例如 Nikki 明确要求 OpenWrt 24.10 及以上版本，低版本固件强装必然无法启动；安卓端则需警惕应用商店里的第三方接管或高仿版本，如 NekoBox for Android 官方已明确提示维护资源有限且警告勿用 Google Play 同名版，日常优先从官方开源渠道获取 v2rayNG、FlClash 或 Hiddify。
---

# 客户端无法启动排查：白屏、核心报错与配置迁移

## 核心结论（Answer-First）

代理软件双击毫无反应、窗口打开一片纯白、导入配置报 `yaml: unmarshal errors`，或者主界面能开但底层核心死活拉不起来，这类故障 100% 落在**本地运行环境、权限依赖、数据文件完整性与配置语法层**，与机场服务器或宽带质量毫无关系。

动手排障前必须牢记两条铁律：**第一，绝不先删配置目录重装**，任何清理前先备份 `profiles` 与订阅清单；**第二，绝不把关闭系统杀毒软件当作默认排障步骤**，永远优先核验官方发布源、CPU 架构与文件完整性。以下按**「现象 → 可能原因 → 低风险检查 → 操作路径 → 验证标准 → 回滚提示」**六步法拆解四大高频启动故障，并直达 4 篇核心三级实操手册。

## 一、按客户端与报错特征直达三级实操指南

| 客户端与报错特征 | 核心故障点 | 第一步低风险核查动作 | 对应三级实操指南 |
| :--- | :--- | :--- | :--- |
| **Clash Verge Rev** 双击无响应、界面纯白屏、端口占用、macOS 架构报错 | 缺 Microsoft Edge WebView2、GPU 加速兼容、残留 `mihomo` 进程、arm64/x64 错装 | 查任务管理器杀残留进程，核对 WebView2 运行时与芯片架构 | [Clash Verge Rev 无法启动与白屏修复](/troubleshooting/articles/clash-verge-startup-fail) |
| **Mihomo 核心启动失败**，报 `yaml: unmarshal errors`、`unsupported proxy type` 或核心秒退 | Merge/Script 覆写语法错、Tab 缩进、停更旧核不认新协议、**Geo 库 0 字节损坏** | 暂时停用全部全局覆写脚本，检查配置目录中 GeoIP/GeoSite 体积 | [Mihomo 核心启动失败与 YAML 报错排查](/troubleshooting/articles/clash-verge-mihomo-yaml-fail) |
| **v2rayN** 弹窗缺运行时、提示找不到 `xray.exe` / `sing-box.exe` 或更新核心失败 | 缺 `.NET Desktop Runtime`、误下不含 Core 精简包、只读目录/架构错配 | 核对已安装 .NET 桌面运行时版本与 `bin` 目录下核心文件是否存在 | [v2rayN 更新失败与核心无法加载修复](/troubleshooting/articles/v2rayn-core-load-fail) |
| 从 **Clash for Windows / Mihomo Party** 迁移卡住、规则丢失或新旧端冲突 | 未关旧端自启与虚拟网卡、Parser/Script 语法不兼容、端口 7890/9090 争抢 | 先备份旧端订阅与覆写，彻底关闭旧端系统代理/TUN/服务模式 | [旧客户端安全迁移与配置备份指南](/troubleshooting/articles/client-migration-backup) |

## 二、安装前与排障前的通用前置核验（防错装、防仿冒、防丢配置）

在修改注册表、删除应用数据或重新下载安装包之前，先完成以下三项零风险只读核对：

1. **精准核对操作系统与 CPU 架构**：
   - **Windows**：主流桌面与笔记本选 `x64 (amd64)`；高通骁龙等 ARM 笔记本选 `ARM64`。
   - **macOS**：M1–M4 芯片（Apple Silicon）必须选 `arm64 / aarch64`；老款 Intel Mac 必须选 `x64 / x86_64`。装错架构会直接闪退或报 `Bad CPU type`。
   - **Linux & OpenWrt**：核对 `uname -m` 区分 `amd64` 与 `arm64`，确认包格式（`.deb` / `.rpm` / `AppImage` 是否已加执行权限）；OpenWrt 软路由还需核对固件大版本与 `fw4/nftables` 兼容性（例如 **Nikki 要求 OpenWrt 24.10 及以上版本**）。
2. **核验官方来源，杜绝高仿与失控商店包**：代理客户端拥有极高的网络权限，切勿通过搜索引擎广告位或陌生网盘下载修改版安装包。请先对照 [客户端软件总览](/clients/) 与 [多平台客户端安装指南](/guides/installation/) 确认官方开源渠道。同时留意维护风险提示：例如 Android 生态中 NekoBox 官方已明确说明维护资源有限且警告勿用已被第三方接管的 Google Play 版本；桌面端 Mihomo Party 也应密切关注维护状态再决定是否作为主力。
3. **建立独立配置备份**：进入客户端数据目录，先将包含订阅 URL、本地节点和自定义覆写规则的文件夹整体复制一份到桌面或文档区的独立备份目录，确保后续任何重置操作都可零损失回退。

## 三、场景一：Clash Verge Rev 无法启动、窗口白屏与 WebView2 故障

Clash Verge Rev 采用轻量化前端壳层（基于系统 WebView 渲染界面）搭配底层 Mihomo 核心的双进程架构。因此「界面打不开/白屏」与「核心起不来」要分开定位：前者查 WebView2、显卡渲染与窗口状态缓存，后者查端口锁死与内核进程。

- **现象**：Windows 下双击图标转圈后毫无动静，或主窗口弹出后一直停留在纯白/纯黑画面无法点击；点击启动弹出端口 `7890` / `7897` / `9090` 已被占用报错；macOS 弹出「已损坏无法打开」或架构不兼容提示。
- **可能原因**：
  1. **缺少或损坏 Microsoft Edge WebView2 Runtime**：许多精简版 Windows 或长期未更新的系统卸载了 Edge 组件，导致壳层无法渲染前端页面，直接表现为纯白屏或进程秒退。
  2. **显卡驱动与硬件加速冲突**：在部分核显/独显切换笔记本或远程桌面环境下，WebView2 启用 GPU 硬件加速会出现整窗纯白或界面冻结。
  3. **后台残留 `mihomo.exe` 进程锁死端口**：上一次异常退出没有结束底层核心进程，导致新启动实例绑定混合端口或外部控制端口 `9090` 失败。
  4. **数据目录窗口状态文件损坏或权限不足**：异常断电造成界面状态配置写入残缺，或误把软件安装在了无写入权限的受限路径中。
- **低风险检查**：打开任务管理器（Windows）或活动监视器（macOS），查看是否存在僵尸残留的 `clash-verge` 或 `mihomo` 进程；在 Windows「设置 → 应用 → 已安装的应用」中搜索 `Microsoft Edge WebView2 Runtime` 确认其是否存在；在终端用 `netstat -ano | findstr 9090` 检查控制端口是否被旧进程占住。
- **操作路径**：
  1. 彻底结束所有残留的 `clash-verge` 与 `mihomo` 进程，避免双实例争抢控制端口。
  2. Windows 用户从微软官方渠道下载安装最新版 **Microsoft Edge WebView2 Runtime（常青独立安装程序）**，安装完成后重启客户端；若白屏依然存在，在确认已备份 `profiles` 配置目录后，尝试清理窗口缓存目录或核查显卡驱动更新。
  3. macOS 用户先核对安装包与本机芯片架构（Apple Silicon 选 `arm64`，Intel 选 `x64`）是否一致，确认源自官方发布后在「系统设置 → 隐私与安全性」中按系统合规流程完成首次放行。
  4. 如遇端口冲突，先关闭其他正在运行或开机自启的代理软件，再重启 Clash Verge Rev。
- **验证标准**：双击图标在数秒内完整渲染主界面侧边栏与节点页，右上角或设置页正确识别当前 Mihomo 核心版本号，本地控制端口无占用报错。
- **回滚提示**：在清理任何应用数据目录或重装覆盖版本之前，务必保留好完整配置备份；若更新到最新测试版反而触发渲染异常，直接退回上一个稳定正式版安装包并将备份配置还原即可。完整逐系统排障流程见 [Clash Verge Rev 无法启动与白屏修复](/troubleshooting/articles/clash-verge-startup-fail) 与 [Clash Verge Rev 专题介绍](/clients/clash-verge/)。

## 四、场景二：Mihomo 核心启动失败、YAML 语法报错与 Geo 库 0 字节损坏

主界面正常显示，但切换某个订阅或开启覆写规则后顶部立刻弹出红色报错，日志提示核心未能启动，这类问题几乎都集中在 **YAML 语法与内核兼容性** 以及 **Geo 地理数据库文件损坏** 两个环节。

### 1. 读懂三类高频 Mihomo 核心报错特征

| 日志关键报错片段 | 底层真实原因 | 最快验证方式 |
| :--- | :--- | :--- |
| `yaml: line XX: found character that cannot start any token` / `unmarshal errors` | YAML 缩进混入了 `Tab` 制表符、冒号后漏加空格、引号未闭合，或 Merge/Script 覆写输出了非法结构 | 一键关闭全部全局 Merge / Script 覆写，切回纯净原始订阅测试 |
| `unsupported proxy type: vless / hysteria2 / anytls` | 仍在使用停更的老版原版 Clash 内核，或误将 Base64 / sing-box JSON 订阅当作 YAML 导入 | 核对客户端设置中当前内核是否为活跃版 **Mihomo**，并核对订阅格式 |
| `can't initial GeoIP` / `MMDB invalid` / `load geosite failed` / 核心无故退出 | 本地规则数据库 `GeoIP.dat`、`GeoSite.dat`、`country.mmdb` 或 `ASN.mmdb` 在更新时断流，落盘成了 **0 字节或半截损坏文件** | 打开配置数据目录查看各 `.dat` 与 `.mmdb` 文件大小是否为 `0 KB` 或明显异常偏小 |

### 2. Mihomo 报错与 Geo 库损坏的六步诊断闭环

- **现象**：导入或切换配置文件后报错 `yaml: unmarshal errors`、核心状态显示未运行，或者开启客户端时内核反复重启卡在初始化阶段，日志提示无法读取 `GeoIP` / `GeoSite` / `country.mmdb`。
- **可能原因**：自定义全局 Merge 覆写或 JavaScript 脚本引用了不存在的代理组、缩进用了 Tab 键或包含旧版已废弃字段；误把 v2rayN Base64 链接或网页 HTML 源码当作 Clash YAML 载入；自动更新地理数据库时因网络中断、代理未通或磁盘写入被打断，把本地 `GeoIP.dat`、`GeoSite.dat` 或 `country.mmdb` 覆盖成了 0 字节空文件，导致内核启动加载规则库时直接崩溃。
- **低风险检查**：先在客户端「配置 / 覆写」页记录当前启用了哪些全局 Merge 或 Script，暂时全部取消勾选；随后打开客户端数据文件夹，按大小排序检查 `GeoIP.dat`、`GeoSite.dat`、`country.mmdb`、`geoip.metadb` 等文件体积（健康数据库通常在数 MB 级别，若出现 `0 KB` 或几字节的错误提示页面即可确诊损坏）。
- **操作路径**：
  1. **剥离覆写测纯净配置**：停用全部全局与局部覆写后重新选中原始订阅并重启核心；若纯净订阅能顺利拉起，说明故障 100% 在你自己的覆写脚本中，逐段比对缩进（必须用英文半角空格，严禁 Tab）与字段名即可。
  2. **修复 0 字节 Geo 库**：先彻底退出客户端，把数据目录里 `0 KB` 或损坏的 `.dat` / `.mmdb` 文件先移至临时备份文件夹（不直接永久删），重新启动客户端触发内置重新下载，或通过官方发布渠道获取完好的 Geo 数据库文件放入数据目录覆盖；若直连下载常中断，可先切回不依赖大型外部库的极简配置拉起代理，再更新地理数据库。
  3. **核对订阅格式与内核版本**：确认使用的是最新活跃版 Mihomo 内核；若发现原始订阅里压根不是 YAML 而是 Base64 或 HTML，转入 [订阅失败排查专题](/troubleshooting/subscription-failure/) 获取正确格式。
- **验证标准**：核心状态转为绿色运行，日志无 `unmarshal errors` 与 `GeoIP/MMDB` 加载失败记录，且分流规则条数正常载入并可准确匹配国内外域名。
- **回滚提示**：在排查覆写脚本或替换 Geo 数据库文件前，先将旧覆写文件与原始数据目录做只读快照备份；若新下载的精简版 Geo 库导致部分国内分流漏判，切回完整版官方 Geo 库即可恢复。详细排障见 [Mihomo 核心启动失败与 YAML 报错排查](/troubleshooting/articles/clash-verge-mihomo-yaml-fail) 与 [Mihomo 内核生态说明](/clients/mihomo/)。

## 五、场景三：v2rayN 核心加载失败、缺运行时与路径冲突

与内置单一内核的客户端不同，v2rayN 本质上是面向多内核调度（Xray-core、sing-box、Mihomo 等）的图形外壳。很多新手第一次运行 v2rayN 时连界面都打不开，或者点连任何节点都瞬间报核心退出，根源大多在运行时缺失与包体不完整。

- **现象**：双击 `v2rayN.exe` 弹窗提示必须安装 `.NET Desktop Runtime`；或者软件能打开、节点也导入了，但只要选中节点启动就提示找不到 `xray.exe` / `sing-box.exe`、日志报错核心立即退出，或在点击「检查更新内核」时持续失败。
- **可能原因**：
  1. **缺少对应版本的 .NET Desktop Runtime**：Windows 端非自包含版 v2rayN 强依赖微软官方 `.NET Desktop Runtime`（如 .NET 8 桌面运行时），只装了普通命令行版 Runtime 而没装 Desktop 版同样无法运行 GUI。
  2. **误下载不含 Core 的精简包**：v2rayN 官方发布页通常同时提供「含核心完整包（`With-Core`）」与「仅 GUI 外壳包」，误下外壳包解压后 `bin` 目录缺少核心二进制文件，自然无法启动任何协议。
  3. **协议与核心映射错配**：例如订阅里包含 Hysteria 2 节点，但该协议配置指向了不支持该协议的旧版核心，导致切换节点时核心直接退出。
  4. **解压路径受限或核心文件被隔离**：把压缩包直接放在 `C:\Program Files\` 等受管理员写入限制的目录，或者直接双击在压缩软件临时文件夹里未解压运行，导致无法写入临时配置文件；此外非官方来源压缩包或损坏核心也会触发安全拦截。
- **低风险检查**：核对压缩包文件名是否为完整含核心版本（并核对 `x64` / `arm64` 架构）；打开 v2rayN 安装目录下的 `bin` 文件夹，只读检查 `xray` 与 `sing_box` 子目录中对应的可执行文件是否存在且体积正常；检查当前所在路径是否已完整解压至全英文普通可写目录（如 `D:\Tools\v2rayN`）。
- **操作路径**：
  1. 前往微软官方渠道补装匹配架构的 **.NET Desktop Runtime**（注意必须包含 `Desktop` 字样）。
  2. 核验 v2rayN 源自官方开源发布渠道，下载含核心完整版压缩包，完整解压到独立的全英文可写文件夹（不要在压缩包预览窗口里直接双击运行）。
  3. 打开 v2rayN「设置 → 核心类型设置」，确认 VLESS/VMess/Trojan 与 Hysteria 2 等协议分别映射到了对应的 Xray 或 sing-box 活跃核心。
  4. 如怀疑核心文件消失，先打开 Windows 安全中心查看历史保护记录确认来源可信性，**严禁为了省事直接关闭实时防护**。
- **验证标准**：v2rayN 启动无弹窗报错，底部信息栏显示核心成功启动并正常监听 `10808/10809` 端口，切换常规与 Hysteria 2 节点日志均无核心崩溃记录。
- **回滚提示**：升级 v2rayN 主程序或替换 `bin` 目录内核前，先整份复制原 `guiConfigs` 配置目录留作备份；若新版内核与特定旧协议出现兼容问题，还原旧 `guiConfigs` 与旧稳定版目录即可立即回退。详尽修复步骤见 [v2rayN 更新失败与核心无法加载修复](/troubleshooting/articles/v2rayn-core-load-fail)、[v2rayN 专题介绍](/clients/v2rayn/)；若核心正常启动但浏览器不走代理，转至 [v2rayN 系统代理失效与自动还原排查](/troubleshooting/articles/v2rayn-system-proxy-fail)。

## 六、场景四：从 Clash for Windows / Mihomo Party 安全迁移与配置备份

停更已久的 Clash for Windows（CFW）早已无法解析 VLESS Reality、Hysteria 2 等现代协议，且存在已知历史安全隐患；同时，结合站内客户端档案提示，Mihomo Party 也需密切关注其项目维护状态后再决定是否继续作为主力。平稳迁移到持续活跃维护的 Clash Verge Rev、FlClash、v2rayN 或 sing-box，最忌讳「旧的没关干净、新的直接硬装」。

- **现象**：直接安装新客户端后频繁报端口冲突、系统代理刚开就被旧端抢回、开启 TUN 瞬间全网断联，或者旧端里的自定义 Parser 规则导入新端后大面积报语法错。
- **可能原因**：旧客户端的开机自启、系统服务（Service Mode）、虚拟网卡驱动与系统代理注册表项仍残留在后台持续运作；CFW 时代专属的 `Parsers` 预处理语法与现代 Clash Verge Rev 的 `Merge / Script` 覆写结构并不直接通用；未提前备份导致卸载旧端后连订阅链接一起丢失。
- **低风险检查**：整理一份只读迁移清单——列出当前旧客户端里所有在用订阅的原始 URL、有效账期与备注名称，记录你自定义过的分流白名单（特别是内网 `fake-ip-filter` 与 AI 独立分流规则），并核对旧客户端里「开机自启」「系统代理」「TUN 模式」「服务模式」四项开关的当前状态。
- **操作路径**：
  1. **完整备份数据**：将订阅清单与自定义规则文本保存到本地安全备份文件夹（切勿上传公开云剪贴板或群聊）。
  2. **按顺序安全卸载旧接管层**：在旧客户端主界面里，**依次关闭「系统代理」→ 关闭「TUN 模式」→ 卸载「Service Mode 服务模式」→ 关闭「开机自启」**，随后彻底退出旧程序并在任务管理器确认无残留核心进程。
  3. **部署新客户端并分步验证**：从官方渠道安装 Clash Verge Rev、FlClash 或 v2rayN，先导入纯净原始订阅验证基础连通性与新协议识别，再将必要的分流规则按新端规范（Merge 或规则组）逐条迁入。
- **验证标准**：重启电脑一次后，系统托盘仅运行单一新客户端，无端口占用或旧服务弹窗报错，全网分流与本地直连均按预期工作。
- **回滚提示**：在确认新客户端已连续稳定运行且日常站点、AI 与内网服务全部通过验证前，**先保留旧客户端的离线配置备份文件夹**，不要急于彻底粉碎旧备份，以便随时对照迁移遗漏的某条内网白名单规则。完整迁移清单见 [旧客户端安全迁移与配置备份指南](/troubleshooting/articles/client-migration-backup)。

## 七、主流客户端配置备份目录与排障日志位置速查

当界面已经完全白屏打不开、无法通过图形按钮导出配置时，可以直接通过系统文件管理器定位以下数据目录完成只读备份，或提取日志文本定位具体报错行：

| 客户端 | Windows 常见配置与数据目录 | macOS / Linux 常见配置目录 | 重点备份与核查对象 |
| :--- | :--- | :--- | :--- |
| **Clash Verge Rev** | `%APPDATA%\io.github.clash-verge-rev.clash-verge-rev\` | macOS：`~/Library/Application Support/io.github.clash-verge-rev.clash-verge-rev/`；Linux：`~/.local/share/` 或 `~/.config/` | `profiles/` 订阅与覆写目录、`logs/` 启动日志、`GeoIP.dat` 与 `GeoSite.dat` 体积 |
| **v2rayN** | 解压根目录下的 `guiConfigs/` 与 `bin/` | 对应解压或应用配置目录下的 `guiConfigs/` | `guiConfigs/` 完整配置备份、`bin/xray` 与 `bin/sing_box` 核心可执行文件 |
| **旧版 Clash for Windows** | `%USERPROFILE%\.config\clash\` | `~/.config/clash/` | `profiles/` 中的历史订阅 URL 与自定义分流规则（迁移前只读复制备份） |

导出日志向他人求助或提交工单前，务必通读文本并删去包含订阅域名 Token、真实节点密码与公网 IP 的敏感行，遵守 [账号与订阅安全指南](/security/account-security/) 规范。

## 八、延伸排障与下游主题入口

- [Clash Verge Rev 无法启动与白屏修复](/troubleshooting/articles/clash-verge-startup-fail)
- [Mihomo 核心启动失败与 YAML 报错排查](/troubleshooting/articles/clash-verge-mihomo-yaml-fail)
- [v2rayN 更新失败与核心无法加载修复](/troubleshooting/articles/v2rayn-core-load-fail)
- [旧客户端安全迁移与配置备份指南](/troubleshooting/articles/client-migration-backup)
- [客户端软件总览与维护状态说明](/clients/)
- [多平台客户端安装指南](/guides/installation/)
- [sing-box 专题介绍](/clients/sing-box/)
- [返回故障排查总库](/troubleshooting/)

## 常见问题

### 客户端双击没反应、白屏或核心启动失败，需要先卸载重装吗？

先不要直接彻底删除配置目录重装，否则极易把本地订阅清单、自定义分流规则和个人覆写脚本一并清空。应先在任务管理器中终止残留核心进程，核对是否缺少系统运行时（如 Windows WebView2 或 .NET Desktop Runtime），再将 profiles 配置目录完整备份到独立文件夹后，逐项验证纯净订阅或执行覆盖修复。

### 如果怀疑杀毒软件拦截了代理核心文件，应该直接关闭 Windows Defender 或安全软件吗？

绝不建议将关闭杀毒软件或停用实时防护作为排障动作。网络上充斥大量夹带木马的仿冒代理客户端，关闭防护风险极高。正确做法是先核验安装包是否来自官方开源发布通道并比对文件哈希，检查安全中心隔离区记录，确认来源绝对可信后再按需排查安装路径与目录权限。

### Clash Verge Rev 打开后窗口纯白屏，或者 macOS 提示架构错误无法运行怎么处理？

Windows 端纯白屏九成源于系统缺少或损坏了 Microsoft Edge WebView2 Runtime，或显卡驱动与图形硬件加速存在兼容冲突，补装官方 WebView2 并在备份配置后清理损坏窗口状态缓存即可恢复；macOS 端则需严格区分芯片架构，Apple Silicon（M 系列）必须下载 arm64 版本，Intel 机型下载 x64 版本，装错会直接报 Bad CPU type 或闪退。

### Mihomo 核心报错 yaml unmarshal errors 或启动卡死，除了 YAML 语法错误还可能是 Geo 库损坏吗？

是的。除了自定义 Merge/Script 覆写脚本缩进混用 Tab、存在旧版 Clash 废弃字段或用停更原版 Clash 内核加载 VLESS/Hysteria 2 协议外，GeoIP.dat、GeoSite.dat 或 country.mmdb 在网络抖动时下载中断形成 0 字节损坏文件，同样会导致 Mihomo 核心启动瞬间报错退出。停用覆写并核对数据目录下 Geo 文件体积即可快速定位。

### v2rayN 启动提示找不到核心文件或无法连接 VLESS 与 Hysteria 2 节点怎么办？

最常见原因有三个：一是系统缺少对应版本的 .NET Desktop Runtime 导致主程序或辅助模块拉起失败；二是误下载了不含核心二进制文件的精简压缩包，文件夹内压根没有 xray.exe 或 sing-box.exe；三是解压目录放在了受保护的只读路径或含异常特殊字符路径中。补装运行时、核对完整含核包并检查各协议绑定的核心类型即可解决。

### 从停更的 Clash for Windows 或 Mihomo Party 迁移到新客户端前，必须做哪些备份与清理？

迁移前先导出备份全部订阅 URL 清单与自定义覆写脚本；随后务必在旧客户端内依次关闭「系统代理」「TUN 模式」「服务模式」与「开机自启」，卸载旧虚拟网卡驱动并彻底退出进程，再安装启动新客户端（如 Clash Verge Rev、FlClash 或 v2rayN）。跳过清理步骤极易导致新旧客户端同时抢占 7890 端口和系统路由。

### 安装 OpenWrt 软路由端代理插件或安卓端客户端时，有哪些容易踩坑的版本与渠道限制？

软路由端高度依赖固件版本与防火墙后端，例如 Nikki 明确要求 OpenWrt 24.10 及以上版本，低版本固件强装必然无法启动；安卓端则需警惕应用商店里的第三方接管或高仿版本，如 NekoBox for Android 官方已明确提示维护资源有限且警告勿用 Google Play 同名版，日常优先从官方开源渠道获取 v2rayNG、FlClash 或 Hiddify。
