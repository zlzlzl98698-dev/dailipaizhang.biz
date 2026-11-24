---
title: 'Clash Verge Rev 无法启动或白屏怎么修：WebView2 与权限异常排查'
description: '针对 Clash Verge Rev 在 Windows 打不开、白屏卡死、macOS 提示损坏或架构不匹配、Linux WebKitGTK 黑屏等问题，提供 WebView2 修复、残留进程清理、配置文件隔离与完整回滚方案。'
pillar: troubleshooting
category: app-not-starting
primaryKeyword: 'Clash Verge Rev 无法启动白屏'
intent: troubleshooting
publishedAt: '2026-11-23'
updatedAt: '2026-11-24'
breadcrumbs:
  - text: '首页'
    link: '/'
  - text: '故障排查'
    link: '/troubleshooting/'
  - text: '客户端无法启动'
    link: '/troubleshooting/app-not-starting/'
  - text: 'Clash Verge 启动与白屏'
howTo:
  name: '排查并修复 Clash Verge Rev 无法启动或窗口白屏'
  description: '通过清理后台僵尸进程、校验 WebView2 运行时与 GPU 渲染参数、隔离损坏的用户配置目录来恢复客户端启动。'
  step:
    - name: '清理后台残留进程并确认单实例锁'
      text: '在任务管理器或终端结束残留的 clash-verge 与 verge-mihomo 进程，确认端口与数据目录未被锁死。'
    - name: '排查或修复界面渲染依赖（WebView2 / WebKitGTK）'
      text: '在 Windows 确认 Microsoft Edge WebView2 Runtime 完整可用并排除显卡硬件加速白屏；在 Linux 排查 DMA-BUF 渲染兼容。'
    - name: '校验安装包系统架构与安装路径权限'
      text: '核对 x64/ARM64 及 macOS Intel/Apple Silicon 架构一致，避免把便携版放在无写权限的系统目录。'
    - name: '隔离损坏的本地配置目录并验证启动'
      text: '先备份并重命名配置目录中的 verge.yaml 或 profiles 目录，排除损坏配置导致的闪退。'
faq:
  - q: '为什么 Clash Verge Rev 图标在任务栏闪了一下就消失，或者打开后一直是纯白画面？'
    a: 'Windows 下的纯白画面绝大多数是因为 Microsoft Edge WebView2 Runtime 缺失、损坏，或特定显卡驱动与 WebView2 硬件加速冲突；而图标闪退或打不开窗口，通常是后台已经挂着一个卡死的 clash-verge 进程（单实例互斥锁拦截了新窗口），或者是配置文件 verge.yaml / 订阅文件写入异常。'
  - q: '把 Clash Verge Rev 彻底卸载重装就能解决白屏或闪退吗？'
    a: '不一定。卸载程序通常不会删除用户数据目录（如 Windows 的 %APPDATA% 下的配置目录），也不会自动修复损坏的 WebView2 系统组件。如果是用户目录里的配置损坏，重装软件依然会闪退，必须先备份再隔离配置目录，或专门修复 WebView2 运行时。'
  - q: '可以靠关闭杀毒软件来解决 Clash Verge Rev 打不开的问题吗？'
    a: '不建议直接关闭杀毒软件。正确做法是先确认安装包来自官方可信发布渠道、核对文件完整性和系统架构，若遇到内置核心被误拦截，只在安全软件隔离记录中核实具体文件并按需设置合理信任规则，同时避免破坏系统整体防护。'
  - q: 'WebView2 Evergreen 在线引导版和离线独立版修复有什么区别？'
    a: 'Evergreen Bootstrapper（在线引导程序，仅约 2 MB）运行时需要实时连接微软更新服务器下载匹配组件，若本机正处于断网、残留系统代理未清理或精简系统禁用了 EdgeUpdate 服务就会卡死失败；而 Evergreen Standalone Installer（离线独立安装包，约 150 MB）内置完整 x64/ARM64 运行时，断网状态下也能直接覆盖修复。'
---

# Clash Verge Rev 无法启动或白屏怎么修：WebView2 与权限异常排查

## 核心结论（Answer-First）

Clash Verge Rev 无法启动、闪退或窗口纯白屏，多源于三类原因：**Windows 缺少或损坏 WebView2 Runtime（含 GPU 硬件加速兼容问题）**、**后台僵尸进程或异常锁文件触发单实例互斥锁死**，以及**用户目录内 `verge.yaml` 或订阅配置损坏**。排障按“清残余进程与锁 → 查渲染引擎 → 重命名备份配置目录”推进，切勿关闭杀毒软件。

## 故障现象

不同操作系统下，启动故障的典型特征如下：

- **Windows 窗口纯白或透明黑框**：软件能打开且托盘有图标，右键托盘菜单能切换系统代理，但主窗口永远是一片空白或半透明黑底，有时伴随 `msedgewebview2.exe` 子进程反复崩溃重启或 CPU 占用飙升。
- **双击毫无反应或一闪而过**：点击桌面快捷方式后鼠标转圈一秒便无下文；打开任务管理器却能看到上次未退干净的 `clash-verge.exe`、`verge-mihomo.exe` 或 `clash-verge-service.exe`。
- **macOS 无法打开或立即崩溃**：双击图标提示“无法验证开发者”、“已损坏，移废纸篓”，或图标在程序坞跳动两下直接退出，常见于 Apple Silicon 机器装错 `x64` 包或配置损坏。
- **Linux 窗口黑屏/透明或终端报错退出**：终端运行提示 `Failed to create GBM buffer of size ...`、`EGL_BAD_PARAMETER`、`libwebkit2gtk-4.1` 缺失或 AppImage 缺少 `libfuse2`。

## 先做 3 个低风险检查

1. **检查系统托盘和任务管理器是否有残留实例**：Clash Verge Rev 基于 Tauri 单实例插件运行，同一用户会话默认只允许存在一个主进程。如果前一次退出时卡在关闭 TUN 或保存配置阶段，双击新图标只会向僵尸进程发送唤醒信号而不会拉起新界面，看起来像“怎么点都没反应”。
2. **确认是否开了“静默启动（Silent Start）”**：部分用户曾打开“开机自启 + 静默启动”，软件其实已经在系统托盘隐藏折叠区（右下角向上小箭头 `^` 内）正常运行，双击托盘图标即可唤出主窗口。
3. **核对下载的安装包架构是否匹配**：Windows 主流台式机与笔记本选 `x64-setup.exe`（高通骁龙笔记本选 `arm64`）；macOS 搭载 M1/M2/M3/M4 芯片必须选 `aarch64.dmg`，老款 Intel Mac 选 `x64.dmg`。

## 分层原因排除

### 本地系统与网络

- **WebView2 Evergreen 运行时缺失、损坏或更新服务被阉割（Windows）**：Clash Verge Rev 采用 Rust（后端）+ Web 前端（Tauri 框架）构建，不捆绑百兆体积的 Chromium 内核，而是直接调用 Windows 系统的 **Microsoft Edge WebView2 Evergreen（常青版）Runtime**。在第三方精简版 Win10/Win11、LTSC 系统，或曾用优化工具强行卸载 Edge 并禁用 `edgeupdate` 服务的电脑上，WebView2 组件极易残缺，导致主窗口直接白屏或启动报错。
- **显卡驱动、双显卡切换与第三方 OSD 叠加层引发 GPU 白屏**：WebView2 默认开启 D3D11 GPU 硬件加速合成。在核显加独显混合输出笔记本、老旧核显驱动，或者后台开启了微星小飞机 `RivaTuner Statistics Server (RTSS)`、部分屏幕录制软件钩子（Hook）时，WebView2 的 GPU 渲染进程会直接崩溃，留下空壳白屏窗口。
- **安装路径与便携模式（Portable）写权限受限**：如果使用绿色便携版（通过在 `clash-verge.exe` 同级目录手动新建 `.config\PORTABLE` 标识启用），却把整个文件夹放进了 `C:\Program Files\`，普通权限下既写不了 `verge.yaml` 也创建不了 `EBWebView` 渲染缓存目录，必然启动失败。
- **Linux Wayland 与 NVIDIA 驱动 DMA-BUF 冲突**：在 Ubuntu 24.04、Arch、Fedora 等默认启用 Wayland 的桌面上，WebKitGTK 2.42+ 默认使用 DMA-BUF 缓冲区共享渲染，遇上特定版本 NVIDIA 闭源驱动就会触发空白窗口或 `GBM buffer` 致命错误。

### 客户端与核心配置

- **单实例锁文件与 `EBWebView` 缓存目录锁残留**：强制断电或蓝屏重启后，除了进程互斥外，WebView2 用户缓存目录（位于 `%LOCALAPPDATA%\io.github.clash-verge-rev.clash-verge-rev\EBWebView`）或 Linux/macOS 下的本地 IPC Socket / Lock 文件可能处于损坏锁定状态，阻碍前端页面初始化。
- **`verge.yaml` 或 `profiles.yaml` 截断损坏**：磁盘写满或关机未等待软件退出，会导致配置目录内的 `verge.yaml`、`profiles.yaml` 变成一串 `NUL`（`\0`）空字节，程序在初始化反序列化阶段直接 Panic 闪退。
- **Service Mode（服务模式）新旧版本不兼容**：跨大版本升级 Clash Verge Rev 后，若系统后台仍跑着旧版 `clash-verge-service`，IPC 通信协议握手超时会让主界面卡死在启动画面。

### DNS 与路由分流

- **残留系统代理或 `HTTP_PROXY` 环境变量干扰本地回环**：上次客户端异常崩溃未清理系统代理（例如仍指向已关闭的 `127.0.0.1:7897`），且未排除 `localhost;127.*` 本地回环地址时，部分内嵌请求或 IPC 调用会陷入超时等待。

### 远端订阅与节点

- **巨型规则集或损坏订阅拖垮启动同步**：若开启了“启动时自动更新订阅”，且某个订阅包含数十万行未编译的原始规则集文本，低配设备在启动瞬间解析合并会造成数秒至数十秒界面无响应假白屏。

## 启动与白屏症状快速分流表

| 观察到的具体表现 | 最高概率根因 | 优先执行步骤 |
| :--- | :--- | :--- |
| 托盘有图标且右键菜单可用，唯独点开主窗口一片纯白 | WebView2 GPU 硬件加速冲突或 `EBWebView` 渲染缓存损坏 | 执行步骤 2 带 `--disable-gpu` 测试，或修复 WebView2 Evergreen |
| 双击桌面图标完全没反应，无弹窗也无新窗口 | 后台残留卡死实例触发单实例锁，或开启了静默启动躲在折叠托盘 | 执行步骤 1 清理残留进程，检查系统右下角隐藏托盘 |
| 双击后黑框/白框闪现 0.5 秒立即消失（卸载重装仍闪退） | `%APPDATA%` 用户数据目录内 `verge.yaml` / `profiles.yaml` 截断损坏 | 执行步骤 4 将配置目录重命名为 `.bak` 进行干净启动验证 |
| Windows 弹窗提示找不到 WebView2 或初始化 WebView 失败 | 精简版系统缺失 WebView2 常青版运行时 | 下载微软官方 WebView2 Evergreen Standalone 离线包覆盖安装 |
| Linux 下终端报 `GBM buffer` 错或窗口全透明/全黑 | Wayland + 显卡驱动与 WebKitGTK DMA-BUF 渲染器不兼容 | 执行步骤 3 注入 `WEBKIT_DISABLE_DMABUF_RENDERER=1` 启动 |

## 操作路径

以下按桌面端平台说明排查步骤。注意：**iOS、Android 与 OpenWrt 均不适用 Clash Verge Rev**（Clash Verge Rev 仅支持 Windows、macOS、Linux 桌面端；安卓请参见 [安卓 v2rayNG 与 Clash Meta 断连排查](/troubleshooting/articles/android-v2rayng-clash-disconnect)，iOS 请参见 [Shadowrocket 导入与规则排查](/troubleshooting/articles/shadowrocket-import-rules)，路由器请使用 OpenClash/Nikki）。

### 步骤 1：彻底清理残留进程与异常锁文件

```powershell
# 适用 OS: Windows (PowerShell)
# 目的: 检查后台是否挂着卡死的 Clash Verge Rev 主程序、Mihomo 核心或服务进程及 WebView2 子进程
# 风险等级: 低（只读进程查询）
# 预期输出解读: 若主窗口没开却能看到 clash-verge 或 verge-mihomo 进程，说明单实例互斥锁正拦截新窗口拉起
Get-Process -Name "*verge*", "*mihomo*" -ErrorAction SilentlyContinue | Select-Object ProcessName, Id, Path
```

若发现僵尸进程但托盘无图标，先强制结束残留进程再尝试启动：

```powershell
# 适用 OS: Windows (PowerShell)
# 目的: 强制结束残留的客户端与核心进程，释放单实例互斥锁与本地控制端口
# 风险等级: 低（会中断残留代理连接，重新启动软件即恢复）
# 预期输出解读: 命令执行完毕无报错；若 clash-verge-service 提示拒绝访问，需使用管理员 PowerShell 执行或先在 services.msc 停止对应服务
Stop-Process -Name "clash-verge", "verge-mihomo" -Force -ErrorAction SilentlyContinue
```

如果结束进程后仍然白屏，可一并清理损坏的 WebView2 前端缓存锁（不会丢失任何机场订阅和节点，订阅保存在 `%APPDATA%` 而渲染缓存在 `%LOCALAPPDATA%`）：先退出软件，将 `%LOCALAPPDATA%\io.github.clash-verge-rev.clash-verge-rev\EBWebView` 文件夹重命名为 `EBWebView_old`，重新启动软件让 WebView2 重建干净的渲染缓存与锁文件。

### 步骤 2：修复 Windows WebView2 Evergreen 与排查 GPU 硬件加速白屏

1. **检查系统注册表中的 WebView2 Runtime 状态与原地修复**：

```powershell
# 适用 OS: Windows 10 / 11 (PowerShell)
# 目的: 查询系统级(HKLM)与当前用户级(HKCU)是否已注册 Microsoft Edge WebView2 Runtime 及其版本号(pv)
# 风险等级: 低（只读注册表查询）
# 预期输出解读: 正常应输出类似 pv : 130.0.2849.80 的非空版本号且不为 0.0.0.0；若无任何输出，说明缺失 WebView2 常青版运行时
Get-ItemProperty -Path "HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}", "HKLM:\SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}", "HKCU:\Software\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}" -ErrorAction SilentlyContinue | Select-Object PSPath, pv
```

- **若未安装或版本号异常**：由于故障电脑往往本身处于断网状态，**不建议**使用仅 2 MB 的在线引导包（`MicrosoftEdgeWebview2Setup.exe`），请用手机或其他正常设备前往微软官方 WebView2 下载页，获取对应架构（常规电脑选 `x64`）的 **Evergreen Standalone Installer（常青版离线独立安装程序）**，拷贝到本机以管理员身份运行安装。
- **若已安装但组件损坏**：打开 Windows「设置 → 应用 → 已安装的应用」，搜索 `Microsoft Edge WebView2 Runtime`，点击右侧菜单选择 **修改（Modify） → 修复（Repair）**，系统会自动校验并补全损坏的底层 DLL。

2. **验证并绕过 GPU 硬件加速白屏**：若 WebView2 完好却依然打开即纯白屏，先暂时关闭 RTSS（微星小飞机帧率监测）等全局屏幕钩子软件，然后在 PowerShell 临时注入禁用 GPU 参数启动客户端（仅当前子进程生效，零副作用）：

```powershell
# 适用 OS: Windows (PowerShell)
# 目的: 仅在当前会话临时向 WebView2 传递 --disable-gpu 参数，验证是否由显卡驱动或硬件合成冲突引起白屏
# 风险等级: 低（关闭该终端后环境变量即失效，不影响系统其他应用）
# 预期输出解读: 若弹出的 Clash Verge Rev 主窗口文字和卡片立刻正常显示，即 100% 实锤为 GPU 硬件加速兼容问题
$env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS = "--disable-gpu"
Start-Process "$env:LOCALAPPDATA\Clash Verge\clash-verge.exe"
```

（注：若你安装时选择了“为所有用户安装”或自定义路径，请将路径替换为 `C:\Program Files\Clash Verge\clash-verge.exe` 或你的实际目录。确认有效后，优先升级核显/独显驱动，或将该客户端加入 RTSS 排除名单。）

### 步骤 3：macOS 与 Linux 启动异常及锁清理专项处理

- **macOS**：
  - 确认安装包架构匹配（`uname -m` 输出 `arm64` 对应 Apple Silicon 包）。若首次打开提示来源未确认，前往「系统设置 → 隐私与安全性」底部点击“仍要打开”。需要定位闪退原因时，在终端直接执行二进制查看实时错误堆栈：
  ```bash
  # 适用 OS: macOS (终端)
  # 目的: 先清理残留进程，再从终端前台拉起 Clash Verge Rev 观察标准错误输出
  # 风险等级: 低（诊断启动）
  # 预期输出解读: 若打印 Bad CPU type in executable 为装错架构；若打印 yaml/json panic 报错则按步骤 4 隔离配置目录
  pkill -f "clash-verge" ; "/Applications/Clash Verge.app/Contents/MacOS/clash-verge"
  ```
- **Linux（Ubuntu/Debian/Arch/Fedora 等）**：
  - 优先使用发行版原生 `.deb` / `.rpm` / AUR 包而非缺少 `libfuse2` 的旧式 AppImage。若在 Wayland 或 NVIDIA 驱动下出现窗口白屏、全透明或 `Failed to create GBM buffer`，在终端组合使用以下渲染兼容环境变量测试：
  ```bash
  # 适用 OS: Linux (Bash 终端)
  # 目的: 禁用 WebKitGTK DMA-BUF 渲染器（必要时配合关闭合成模式）规避显卡驱动白屏崩溃
  # 风险等级: 低（仅对当前启动实例生效）
  # 预期输出解读: 主窗口正常渲染且终端不再抛出 GBM/EGL 致命错误；确认有效后可写入 ~/.local/share/applications/ 下的 .desktop 启动项
  WEBKIT_DISABLE_DMABUF_RENDERER=1 clash-verge
  ```
  （若单独设置 `WEBKIT_DISABLE_DMABUF_RENDERER=1` 仍白屏，可进一步测试 `WEBKIT_DISABLE_DMABUF_RENDERER=1 WEBKIT_DISABLE_COMPOSITING_MODE=1 clash-verge`。）

### 步骤 4：安全备份并隔离损坏的配置目录

如果终端日志显示在读取配置阶段崩溃，或卸载重装软件后依然秒闪退，说明根因在卸载器未清理的用户配置目录中：
- **Windows 默认数据目录**：`%APPDATA%\io.github.clash-verge-rev.clash-verge-rev`（便携版位于主程序同级 `.config\io.github.clash-verge-rev.clash-verge-rev`）
- **macOS 默认数据目录**：`~/Library/Application Support/io.github.clash-verge-rev.clash-verge-rev`
- **Linux 默认数据目录**：`~/.local/share/io.github.clash-verge-rev.clash-verge-rev`

安全隔离与增量找回订阅步骤（以 Windows 为例）：
1. 确保所有 `clash-verge` 与 `verge-mihomo` 进程均已退出。
2. 按下 `Win + R` 输入 `%APPDATA%` 回车，找到 `io.github.clash-verge-rev.clash-verge-rev` 文件夹，将其**重命名**为 `io.github.clash-verge-rev.clash-verge-rev.bak`（**严禁直接按 Shift+Delete 删除**，你的全部机场订阅地址与自定义规则都在 `profiles.yaml` 与 `profiles\` 子目录内）。
3. 重新双击 Clash Verge Rev。此时程序会自动生成一套全新的默认配置——若窗口瞬间恢复秒开，说明原目录中的 `verge.yaml` 或某个损坏缓存引发了崩溃。
4. 用记事本或 VS Code 打开备份目录 `.bak\profiles.yaml`，只要文件文字正常未乱码，即可从中复制出你原有的订阅链接重新导入，或将完好的 `profiles\` 子目录与 `profiles.yaml` 拷回新目录。

## 什么结果算修复

1. 主窗口在 1–3 秒内完整渲染侧边栏、延迟数值与节点卡片，缩放拖动窗口无白屏、黑框或闪烁卡死。
2. 客户端设置页显示 Mihomo 内核正常运行，关闭主窗口到托盘后再次双击托盘图标能立即顺畅唤出界面，不会触发二次实例假死。
3. 原有订阅与分流配置（或从 `.bak` 备份恢复后的配置）能正常切换节点并出站联网。

## 若仍失败怎么办

- 如果界面已经能正常打开，但窗口内弹出红色报错提示核心启动失败、端口占用或配置文件解析错误，问题已从 GUI 渲染层转入内核配置层，请继续阅读：[Mihomo 核心启动失败与 YAML 语法报错排查](/troubleshooting/articles/clash-verge-mihomo-yaml-fail)。
- 如果启动后开启 TUN 开关无效或报错服务未安装，请参考：[TUN 模式开启无效与服务授权排查](/troubleshooting/articles/tun-not-working)。
- 如果本地显卡环境长期与 WebView2 冲突且不希望折腾系统组件，可先备份好配置后平滑迁移至基于 Flutter 独立渲染引擎的 FlClash 或基于原生界面的 v2rayN：[旧客户端安全迁移与配置备份指南](/troubleshooting/articles/client-migration-backup)。

## 高风险操作与回滚提示

> [!WARNING]
> **严禁把关闭杀毒软件作为启动白屏的常规解法**；也不要从非官方网盘、第三方软件站下载来路不明的“WebView2 精简修复包”或覆盖 `System32` 下的系统 DLL。

- **重命名数据目录与 `EBWebView` 缓存的回滚**：正因为操作前采用的是“重命名加 `.bak` / `_old`”而非直接删除，一旦发现新目录启动后问题依旧或需要找回历史脚本，只需退出客户端，删除新生成的默认空目录并将 `.bak` 文件夹改回原名，即可 100% 无损恢复原有界面设置与全部订阅记录。
- **修改系统环境变量（如持久化 `WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS`）的回滚**：若将其写入了 Windows 用户/系统环境变量后导致电脑上其他基于 WebView2 的办公软件（如新版 Teams、小组件）滚动掉帧，只需打开「系统属性 → 环境变量」删除 `WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS` 条目并重启对应软件即可恢复默认 GPU 硬件加速。
- **服务模式（Service Mode）与 WebView2 修复回滚**：若排查残留锁时卸载了旧版后台服务，进入客户端「设置 → 系统设置 → 服务模式」点击卸载后再点安装即可重建干净守护进程；微软官方 WebView2 Evergreen 离线包原地修复不会改动用户浏览器书签与个人数据。

## 常见问题

### 为什么 Clash Verge Rev 图标在任务栏闪了一下就消失，或者打开后一直是纯白画面？

Windows 下的纯白画面绝大多数是因为 Microsoft Edge WebView2 Runtime 缺失、损坏，或特定显卡驱动与 WebView2 硬件加速冲突；而图标闪退或打不开窗口，通常是后台已经挂着一个卡死的 clash-verge 进程（单实例互斥锁拦截了新窗口），或者是配置文件 verge.yaml / 订阅文件写入异常。

### 把 Clash Verge Rev 彻底卸载重装就能解决白屏或闪退吗？

不一定。卸载程序通常不会删除用户数据目录（如 Windows 的 %APPDATA% 下的配置目录），也不会自动修复损坏的 WebView2 系统组件。如果是用户目录里的配置损坏，重装软件依然会闪退，必须先备份再隔离配置目录，或专门修复 WebView2 运行时。

### 可以靠关闭杀毒软件来解决 Clash Verge Rev 打不开的问题吗？

不建议直接关闭杀毒软件。正确做法是先确认安装包来自官方可信发布渠道、核对文件完整性和系统架构，若遇到内置核心被误拦截，只在安全软件隔离记录中核实具体文件并按需设置合理信任规则，同时避免破坏系统整体防护。

### WebView2 Evergreen 在线引导版和离线独立版修复有什么区别？

Evergreen Bootstrapper（在线引导程序，仅约 2 MB）运行时需要实时连接微软更新服务器下载匹配组件，若本机正处于断网、残留系统代理未清理或精简系统禁用了 EdgeUpdate 服务就会卡死失败；而 Evergreen Standalone Installer（离线独立安装包，约 150 MB）内置完整 x64/ARM64 运行时，断网状态下也能直接覆盖修复。

## 相关教程与替代入口

- 下一步核心排障：[Mihomo 核心启动失败与 YAML 报错排查](/troubleshooting/articles/clash-verge-mihomo-yaml-fail) ｜ [TUN 模式开启无效排查](/troubleshooting/articles/tun-not-working)
- 配置安全备份：[从旧客户端安全迁移与备份指南](/troubleshooting/articles/client-migration-backup)
- 客户端与安装专题：[Clash Verge Rev 专题](/clients/clash-verge/) ｜ [Mihomo 内核说明](/clients/mihomo/) ｜ [多平台安装与架构区分指南](/guides/installation/)
- 专题汇总：[客户端无法启动排查专题](/troubleshooting/app-not-starting/) ｜ [替代客户端参考](/clients/)
