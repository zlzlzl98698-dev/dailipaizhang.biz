---
title: 从旧客户端、Clash for Windows 与 Mihomo Party 安全迁移并备份配置
description: 指导用户从已停止维护的旧客户端或 Clash for Windows、Mihomo Party 等向仍在活跃维护的新客户端平滑迁移，涵盖目录备份、配置兼容性处理与完整回滚方案。
pillar: troubleshooting
category: app-not-starting
primaryKeyword: Clash for Windows Mihomo Party 迁移备份配置
intent: troubleshooting
publishedAt: '2026-11-23'
updatedAt: '2026-11-24'
breadcrumbs:
  - text: 首页
    link: /
  - text: 故障排查
    link: /troubleshooting/
  - text: 客户端无法启动
    link: /troubleshooting/app-not-starting/
  - text: 客户端安全迁移与配置备份
howTo:
  name: 安全备份并迁移旧客户端配置至活跃维护客户端
  description: 先清理并重置旧端网络接管，完整备份配置与订阅信息后，再导入并适配新客户端内核。
  step:
    - name: 关闭旧客户端的系统代理、TUN 与开机自启
      text: 在卸载或停用旧客户端前，先手动关闭其系统代理、虚拟网卡（TUN/服务模式）与开机自启动，防止新旧客户端端口与网卡冲突。
    - name: 备份旧客户端数据目录与已保存的订阅地址
      text: 将旧客户端本地的配置文件夹（profiles、YAML、JSON 及自定义规则）完整复制到独立备份目录，不要直接覆盖或急于卸载删除。
    - name: 选择对应平台的活跃维护客户端完成安装
      text: 核对操作系统架构后安装新客户端（如 Clash Verge Rev、FlClash、v2rayN、Hiddify 或 Karing），注意确认目标软件当前维护状态。
    - name: 优先重新拉取订阅，而非直接硬塞旧版配置文件
      text: 优先用原始订阅链接在新客户端重新导入；仅将自行编写的分流规则或节点覆写逐段迁移，以避开旧内核废弃字段报错。
    - name: 验证新客户端运行正常后再归档旧软件
      text: 确认新客户端系统代理、TUN 与规则分流均已稳定工作，再视情况卸载旧客户端主体程序并保留只读备份一段时间。
faq:
  - q: 可以直接把 Clash for Windows 的整个 config.yaml 复制到 Clash Verge Rev 或 sing-box 里用吗？
    a: 不建议整文件直接硬塞。首先，原版 Clash 内核与目前主流的 Mihomo（Clash Meta）内核虽大部分兼容，但部分老旧字段或外部策略组语法在新内核下会告警或失效，且无法自动获取机场新增加的 VLESS Reality/Hysteria2 等协议节点；其次，sing-box 系客户端（如 Karing、官方 SFA/SFI/SFM）使用全新的 JSON 结构，与 Clash YAML 完全不通用。最稳妥的方法是在新客户端重新导入原始订阅链接，只把自建的分流规则片段迁移过去。
  - q: 装了新客户端后，为什么两个客户端同时打开就全部断网甚至无法启动？
    a: 因为绝大多数代理客户端默认监听相同的本地端口（如 7890、7897 或 10808），而且都会争抢 Windows/macOS 系统代理与虚拟网卡。在启动新客户端前，必须彻底退出旧客户端并确保其后台服务（如 Service Mode）已停止或卸载。
  - q: 从 Mihomo Party 或机场专属客户端迁移时需要注意什么？
    a: Mihomo Party 应单独关注项目当前维护状态，建议先备份其配置目录再逐步迁移到其他活跃维护的 Mihomo/sing-box 客户端；而如果原本使用的是仅支持账号密码登录、不提供通用订阅链接的“机场专属客户端”，则在服务商未开放通用订阅前，无法直接迁移到 Clash Verge Rev 或 v2rayN 等第三方客户端。
---

# 从旧客户端、Clash for Windows 与 Mihomo Party 安全迁移并备份配置

## 核心结论（Answer-First）

安全迁移代理客户端的核心原则是：**“先停服务退端口、再备份本地配置、最后在新端重拉订阅而非整份硬塞旧 YAML”**。切勿在旧版 Clash for Windows 或 Mihomo Party 仍占着系统代理或 TUN 网卡时直接启动新客户端，否则端口和网卡冲突会直接导致断网或启动失败。先留存备份再迁移，可随时无损回滚。

## 故障现象

- **迁移后双端抢占报错**：安装新版 Clash Verge Rev、FlClash 或 v2rayN 后启动白屏、提示核心退出（`core exited`）、`bind: address already in use`（端口被占用）或 `TUN interface creation failed`。
- **直接导入旧配置报错**：把老客户端里导出的 `.yaml` 文件拖进新客户端后，提示无法解析节点协议、某些未知字段触发 `YAML parse error`，或因为配置里缺少新协议字段导致新节点无法显示。
- **卸载旧软件后直接断网**：直接强行卸载了旧客户端，却忘了在卸载前关闭“系统代理”或卸载“服务模式（Service Mode）”，导致整个电脑连国内网页都打不开（提示代理服务器拒绝连接）。

## 先做 3 个低风险检查

1. **确认手头是否保留了有效的“原始订阅链接”**：迁移前先登录机场网页端确认还能拿到通用订阅地址（或客户端里能看到完整的订阅 URL）。如果是只允许用“机场专属客户端”账号密码登录、后台不提供第三方订阅的服务，则无法直接迁往 Clash Verge Rev / v2rayN 等通用客户端。
2. **检查当前系统代理与后台残留进程**：打开任务管理器（或 macOS 活动监视器），确认没有 `clash-win64.exe`、`Clash for Windows.exe`、`mihomo.exe` 等残留后台进程还在占用 `7890` / `7897` / `10808` 端口。
3. **盘点自己真正需要保留的自定义内容**：区分“机场下发的节点订阅（随时可重新拉取）”与“自己花心思写的 `rules` / 覆写脚本 / `tun` 开关习惯”，迁移重点在于保留后者，而非死守过时的节点缓存文件。

## 分层原因排除

### 本地系统与网络

- **系统代理残留与旧虚拟网卡未卸载**：老客户端在启用系统代理或安装过服务模式（Wintun / Tap 虚拟网卡）后，如果直接关闭进程或卸载软件本体，操作系统注册表中的 `ProxyEnable=1` 或系统服务依然存在，新软件启动时会因端口或网卡名称冲突而失败。
- **操作系统架构包选错**：在迁移安装新客户端时，Windows 需区分 `x64` 与 `ARM64`，macOS 需区分 `Intel (x86_64)` 与 `Apple Silicon (arm64)`，Linux 需区分 `.deb` / `.rpm` / `AppImage`，选错安装包会直接无法启动。

### 客户端与核心配置

- **原版 Clash 内核与 Mihomo 内核差异**：早年 Clash for Windows 使用的传统内核已停止演进，不支持如今普遍使用的 VLESS Reality、Hysteria2、AnyTLS 等协议。即便把旧配置文件强行搬运到 Clash Verge Rev 或 FlClash（基于 Mihomo 内核），里面记录的也只是过时节点，无法获得服务商新更新的节点协议。
- **跨内核配置语法不通用**：Clash/Mihomo 使用 YAML 格式，而 v2rayN（底层 Xray/sing-box）与 Karing/官方 sing-box 使用 JSON 或各自独立的数据库格式，不能通过直接复制文件互导。
- **Mihomo Party 维护状态提示**：部分用户正从 Mihomo Party 迁移出来；针对该客户端应单独核查当前项目维护状态，不宜未经核实就继续当作长期默认依赖，通过标准目录备份迁出是最稳妥的过渡方式。

### DNS 与路由分流

- **旧版 Fake-IP / DNS 语法过时**：早期配置中的 `dns` 段落（例如旧 `enhanced-mode` 写法或过期 GeoIP 数据库路径）在新版核心中可能与默认开启的 `geoip` / `geosite`、`respect-rules` 产生参数冲突，引发规则不生效或启动校验失败。

### 远端订阅与节点

- **机场后台同时下发新版与旧版订阅接口**：部分机场为了兼容老客户端，在原订阅链接带上了特定参数，或者针对旧版客户端的 User-Agent 下发了降级节点（隐藏了 Reality 等新协议）。迁移到新客户端后直接用最新订阅 URL 重新拉取，才能拿全所有最新协议节点。

## 操作路径

### 适用平台说明

- **适用平台**：Windows、macOS、Linux（桌面客户端数据迁移与目录备份重点）、Android / iOS / OpenWrt（移动与路由端遵循相同“先停旧端 VPN/插件 -> 备份配置文本/订阅 -> 新端重拉订阅”的原则，但无桌面文件夹直接拷贝操作，移动端重点通过 App 内导出/云剪贴板中转）。

### 安全备份与迁移操作步骤

1. **步骤 1：安全停止旧客户端并解除系统代理与服务模式**
   - 在旧客户端（Clash for Windows / Mihomo Party / 旧版 v2rayN）内，依次关闭 **系统代理（System Proxy）**、**TUN 模式** 与 **开机自启动**。
   - 若旧客户端安装了 **Service Mode（服务模式）**，务必先在客户端“设置 -> 服务模式”界面中点击 **Uninstall / 卸载服务**，最后再右键托盘图标选择完整退出（Quit）。
2. **步骤 2：在终端完整备份旧客户端配置目录**
   - **适用 OS**：Windows（PowerShell）
   - **目的**：将 Clash for Windows（通常位于 `~/.config/clash`）、Mihomo Party 或旧版 v2rayN 所在配置文件夹完整备份到桌面归档文件夹，防止迁移失败丢失自定义规则。
   - **风险等级**：低（仅执行只读复制备份 `Copy-Item`，不删除原文件、不修改系统设置）。

   ```powershell
   # 创建带日期的本地配置备份目录（仅备份常见 Clash 配置目录示例）
   $backupDir = "$env:USERPROFILE\Desktop\proxy-backup-20261123"
   New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
   if (Test-Path "$env:USERPROFILE\.config\clash") {
     Copy-Item -Recurse -Force "$env:USERPROFILE\.config\clash" "$backupDir\clash-config"
   }
   if (Test-Path "$env:APPDATA\mihomo-party") {
     Copy-Item -Recurse -Force "$env:APPDATA\mihomo-party" "$backupDir\mihomo-party"
   }
   Get-ChildItem $backupDir
   ```

   - **预期输出解读**：
     - 命令行列出复制后的 `clash-config` 或 `mihomo-party` 目录名与修改时间，说明旧配置及自定义规则已完整落盘至桌面备份文件夹。

   - **适用 OS**：macOS / Linux
   - **目的**：备份用户目录下的 Clash/Mihomo 配置目录至桌面安全位置。
   - **风险等级**：低（只读复制）。

   ```bash
   mkdir -p ~/Desktop/proxy-backup-20261123
   [ -d ~/.config/clash ] && cp -r ~/.config/clash ~/Desktop/proxy-backup-20261123/clash-config
   [ -d ~/.config/mihomo-party ] && cp -r ~/.config/mihomo-party ~/Desktop/proxy-backup-20261123/mihomo-party
   ls -la ~/Desktop/proxy-backup-20261123
   ```

   - **预期输出解读**：
     - 终端列出已成功复制的子目录（如 `clash-config` 或 `mihomo-party`）。打开确认里面包含 `profiles/` 文件夹或 `config.yaml` 等文件后，即可安心操作新客户端，**不要把备份目录随手发给他人或上传网盘（内含订阅 Token 与节点凭证）**。

3. **步骤 3：确认端口完全释放后再启动新客户端**
   - **适用 OS**：Windows（PowerShell）
   - **目的**：确认旧客户端常见的混合代理端口（`7890` / `7897` / `10808`）已无残留进程监听，避免新客户端启动端口冲突。
   - **风险等级**：低（只读端口检查）。

   ```powershell
   Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in 7890, 7897, 10808, 10809 } | Select-Object LocalAddress, LocalPort, OwningProcess
   ```

   - **预期输出解读**：
     - 若没有任何输出，说明上述端口已彻底空闲，可以安全启动新客户端。如果仍有输出，记录 `OwningProcess` PID 并在任务管理器核查并结束对应旧代理进程。

4. **步骤 4：在新客户端重新导入订阅并按需迁移自定义规则**
   - 从作者官方发布页或可信应用商店安装对应平台架构的新客户端（参考 [多平台客户端安装指南](/guides/installation/)；注意核对项目官方说明，避免仿冒安装包）。
   - 在新客户端中新建订阅，粘贴机场后台的原始订阅 URL 拉取最新节点，**不要直接导入旧端整个 `config.yaml`**。
   - 如有自行编写的分流规则（如特定工作域名直连或 AI 工具规则），打开备份目录里的 `profiles` 文件，**仅复制 `rules:` 或自定义覆写片段** 到新客户端的“全局扩展覆写（Merge / Script）”中测试启用。

5. **步骤 5：Android / iOS / OpenWrt 迁移补充路径**
   - **Android**：若从原版 Clash for Android 迁移至 Clash Meta for Android、FlClash、v2rayNG 或 Hiddify，先关闭旧 App 的 VPN 开关，在新 App 重新粘贴订阅地址；注意官方特别提醒勿在 Google Play 下载来历不明的仿冒 NekoBox。
   - **iOS**：Shadowrocket / Stash / Quantumult X 迁移或重装前，利用各自 App 的本地文件导出或 iCloud 同步（注意加密安全）备份 `.conf` 规则后再升级切换。
   - **OpenWrt**：例如从旧插件迁移至 Nikki（注意 Nikki 明确要求 **OpenWrt 24.10 及以上版本**）或 HomeProxy 时，先在 LuCI 停用并禁用旧插件开机启动，再通过 SSH 备份 `/etc/config/` 下对应配置文件后进行部署。

## 什么结果算修复

- 旧客户端进程与系统服务已完全退出，新客户端正常打开无白屏、无端口占用或 YAML 语法报错。
- 新客户端能成功拉取全部最新协议节点并正常通过延迟测试，网页、流媒体和分流规则均按预期运作。
- 系统代理关闭后本地网络恢复直连，重新开启后代理流量正常接管。

## 若仍失败怎么办

- 如果新安装 Clash Verge Rev 遇到白屏或 WebView2 缺失问题，请排查 [Clash Verge Rev 无法启动与白屏修复](/troubleshooting/articles/clash-verge-startup-fail)。
- 如果新导入 YAML 或迁移覆写片段后核心报错退出，请对照 [Mihomo 核心启动失败与 YAML 语法排查](/troubleshooting/articles/clash-verge-mihomo-yaml-fail)。
- 如果迁移至 v2rayN 后提示缺少核心或运行时，参阅 [v2rayN 核心无法加载与缺运行时修复](/troubleshooting/articles/v2rayn-core-load-fail)。

## 高风险操作与回滚提示

- **严禁在未确认新客户端正常联网前直接彻底删除旧软件及配置目录**；同时严禁将备份出来的 `proxy-backup-*` 文件夹直接打包上传至公开网盘或群聊求助（其中包含完整的订阅 URL Token 和节点鉴权信息）。
- **如何快速回滚**：只要你严格按步骤 1–2 执行且保留了备份目录，若新客户端出现不兼容或无法联网：
  1. 关闭新客户端的系统代理与 TUN 模式并彻底退出新客户端；
  2. 如果旧客户端软件本体还在，重新启动旧客户端即可一键恢复原有工作状态；
  3. 若发现误删了某条旧自定义规则，直接从桌面的 `proxy-backup-20261123` 备份文件夹中找回对应文件重新导入即可。
- **Windows 若卸载旧软件后系统依然断网**：打开 Windows 设置 -> 网络和 Internet -> 代理 -> 手动设置代理 -> 确认“使用代理服务器”处于**关闭**状态，即可立即恢复本地直连上网。

## 常见问题

### 可以直接把 Clash for Windows 的整个 config.yaml 复制到 Clash Verge Rev 或 sing-box 里用吗？

不建议整文件直接硬塞。首先，原版 Clash 内核与目前主流的 Mihomo（Clash Meta）内核虽大部分兼容，但部分老旧字段或外部策略组语法在新内核下会告警或失效，且无法自动获取机场新增加的 VLESS Reality/Hysteria2 等协议节点；其次，sing-box 系客户端（如 Karing、官方 SFA/SFI/SFM）使用全新的 JSON 结构，与 Clash YAML 完全不通用。最稳妥的方法是在新客户端重新导入原始订阅链接，只把自建的分流规则片段迁移过去。

### 装了新客户端后，为什么两个客户端同时打开就全部断网甚至无法启动？

因为绝大多数代理客户端默认监听相同的本地端口（如 7890、7897 或 10808），而且都会争抢 Windows/macOS 系统代理与虚拟网卡。在启动新客户端前，必须彻底退出旧客户端并确保其后台服务（如 Service Mode）已停止或卸载。

### 从 Mihomo Party 或机场专属客户端迁移时需要注意什么？

Mihomo Party 应单独关注项目当前维护状态，建议先备份其配置目录再逐步迁移到其他活跃维护的 Mihomo/sing-box 客户端；而如果原本使用的是仅支持账号密码登录、不提供通用订阅链接的“机场专属客户端”，则在服务商未开放通用订阅前，无法直接迁移到 Clash Verge Rev 或 v2rayN 等第三方客户端。

## 相关教程与替代入口

- [客户端无法启动与迁移排查专题](/troubleshooting/app-not-starting/)
- [多平台客户端安装指南（Win/macOS/Linux/OpenWrt）](/guides/installation/)
- [Mihomo 内核演进与衍生端维护状态说明](/clients/mihomo/)
- [Clash Verge Rev 客户端详解与配置迁移](/clients/clash-verge/)
- [sing-box 官方多端与生态防仿冒提示](/clients/sing-box/)
- [Clash Verge Rev 启动失败与白屏修复](/troubleshooting/articles/clash-verge-startup-fail)
- [Mihomo 核心启动失败与 YAML 语法报错排查](/troubleshooting/articles/clash-verge-mihomo-yaml-fail)
- [安卓 v2rayNG 与 Clash Meta 后台断连及节点失效排查](/troubleshooting/articles/android-v2rayng-clash-disconnect)
