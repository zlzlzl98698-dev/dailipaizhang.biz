---
title: 'Mihomo 核心启动失败与 YAML 配置报错排查：语法、端口与规则修复'
description: '深入排查 Clash Verge Rev、FlClash、OpenClash 等客户端出现 Mihomo 核心启动失败及 YAML 语法报错的原因，覆盖缩进校验、废弃字段清理、Geo 数据库缺失与 mihomo -t 命令行自检。'
pillar: troubleshooting
category: app-not-starting
primaryKeyword: 'Mihomo核心启动失败YAML报错'
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
  - text: 'Mihomo 核心与 YAML 报错'
howTo:
  name: '排查并修复 Mihomo 核心启动失败与 YAML 语法报错'
  description: '利用内置或命令行校验定位 YAML 语法错误、补齐缺失或损坏的 Geo 数据库、解除端口占用并清理失效的覆写脚本。'
  step:
    - name: '读取核心启动报错原文并定位配置行数'
      text: '通过客户端核心日志或运行核心检测命令，明确报错是 YAML 语法格式问题、规则引用缺失还是端口绑定冲突。'
    - name: '排查覆写脚本与远端订阅语法兼容性'
      text: '临时停用自定义 Merge/Script 覆写测试原始订阅，排查缩进错误、Tab 字符或废弃的旧版 Clash 字段。'
    - name: '检查 GeoIP/GeoSite 数据库文件完整性'
      text: '核对数据目录下的 Country.mmdb、geoip.dat 与 geosite.dat 是否存在 0 字节损坏，必要时重新下载或切换数据库格式。'
    - name: '解除本地混合端口占用并重启核心验证'
      text: '确认 7890/7897/9090 等监听端口未被其他程序占用后，重新校验并启动核心。'
faq:
  - q: '客户端提示 yaml: line 42: did not find expected key 是什么意思？'
    a: '这说明你正在加载的 YAML 配置文件（或你自己写的覆写规则）在第 42 行附近存在语法错误，常见原因是冒号后面忘了加空格、混用了中文全角冒号/引号、用 Tab 键替代了空格缩进，或者列表项前面漏掉了短横线 -。用命令行校验工具或还原覆写文件即可快速定位。'
  - q: '为什么同一份机场订阅在以前的老 Clash 里能用，换到 Clash Verge Rev 的 Mihomo 核心就报错启动不了？'
    a: '机场下发了只适配旧版原版 Clash 的格式或非标扩展字段，而 Mihomo 核心对部分字段校验更严格；另一种常见情况是你在新客户端启用了包含旧字段或语法错误的全局覆写脚本（Script/Merge），合并后把原本正常的订阅改坏了。'
  - q: '报错 can not find geoip.dat 或 geosite.dat 导致核心退出的原因是什么？'
    a: '配置中的分流规则（如 GEOSITE,cn 或 GEOIP,CN）或 DNS 规则引用了 Geo 数据库，但首次启动时客户端还没连接外网，自动下载数据库失败或下载到半截留下了 0 字节损坏文件，核心一读就报错。先切回无 Geo 规则的临时节点或手动从可信渠道补全完整数据库文件即可恢复。'
  - q: 'Mihomo 规则里的 .mrs、.dat 和 .mmdb 文件分别是什么，混用会报错吗？'
    a: '它们是三代不同的地理与规则数据存储格式：Country.mmdb 是传统的单 IP 国家库；geoip.dat 与 geosite.dat 是兼容 V2Ray 的打包库（需开启 geodata-mode: true）；而 .mrs（Mihomo Rule Set）是 Mihomo 专有的预编译二进制规则集，内存占用最低、加载最快。如果在 rule-providers 中写了 format: mrs 却填入普通 .yaml 文本规则链接，核心会立即报解析失败。'
---

# Mihomo 核心启动失败与 YAML 配置报错排查：语法、端口与规则修复

## 核心结论（Answer-First）

Mihomo 核心启动失败但界面正常，九成报错源于 **YAML 或覆写脚本的缩进与语法错误**、**`.mrs`/`.dat`/`.mmdb` 规则数据库缺失或 0 字节损坏**，以及 **`7897`/`9090` 端口被残留进程或系统保留段占用**。排障应先运行 `mihomo -t -f <配置文件>` 打印精确报错行号，再用二分法隔离覆写脚本、补齐数据库并解除端口冲突。

## 故障现象

当你打开 Clash Verge Rev、FlClash 或软路由上的 OpenClash/Nikki，窗口界面渲染完好，但核心状态显示“已停止”或一直弹出红色 Toast 通知，常见报错信息包括：

- **YAML 语法报错**：`yaml: line XX: did not find expected key`、`yaml: line XX: found character that cannot start any token`（多为 Tab 缩进或冒号缺空格）。
- **逻辑引用缺失**：`proxy group [节点选择]: proxy [香港01] not found` 或 `use: provider [xxx] not found`（策略组引用了一个不存在的节点名，或脚本过滤掉了全部节点留下空列表）。
- **Geo 数据库或规则集损坏**：`Start clash error: can not find geoip.dat / Country.mmdb`、`geosite.dat: unexpected EOF`，或 `rule-provider` 报 `invalid mrs format`。
- **端口被占用或权限拒绝**：`listen tcp 127.0.0.1:7897: bind: address already in use` 或 Windows 特有的 `An attempt was made to access a socket in a way forbidden by its access permissions`。
- **配置被 HTML 页面污染**：报错 `yaml: unmarshal errors: line 1: cannot unmarshal !!str <!DOCTY...`（说明机场订阅返回了 Cloudflare 五秒盾拦截页或 404 网页，而非合法 YAML）。

## 先做 3 个低风险检查

1. **查看报错第一行是不是 `<!DOCTYPE html>` 或 `{ "ret": 0 }`**：如果是网页 HTML 或面板 JSON 报错文本，说明 Mihomo 核心本身完全正常，是远端订阅接口没返回 YAML 配置，应直接转去检查订阅链接有效性，不要瞎改核心参数。
2. **临时停用所有“全局扩展配置（Merge）”和“全局扩展脚本（Script）”**：在 Clash Verge Rev「订阅」页面把你自己加的 Merge 与 JavaScript 覆写卡片全部点灭（取消激活），切换到一个最纯净的原始订阅观察核心是否立刻变绿。
3. **确认是否双开了多个 Clash 系客户端或残留了僵尸核心**：如果电脑同时运行着 Clash Nyanpasu、FlClash、已停更的旧版 Clash for Windows 或上次崩溃残留的 `verge-mihomo.exe`，它们会抢占本地混合端口与 `9090/9097` 外部控制器端口，导致新核心启动即退。

## 理解数据库差异：`.mmdb`、`.dat` 与 `.mrs` 为何引发崩溃？

许多用户照搬网上的“高阶分流模板”后核心突然起不来，根源在于混淆了 Mihomo 支持的三类规则/地理数据库格式及其前置开关：

| 文件格式与典型文件名 | 作用与体积内存特征 | YAML 配置依赖条件 | 典型报错与踩坑原因 |
| :--- | :--- | :--- | :--- |
| **MaxMind 库（`Country.mmdb` / `ASN.mmdb`）** | 仅负责 `GEOIP,CN` 等 IP 归属国与自治域查询，体积约 6–12 MB，不支持域名分类 | `geodata-mode: false`（默认模式）时读取 `Country.mmdb`；若写了 `IP-ASN` 规则还需 `ASN.mmdb` | 首次未翻墙时自动拉取超时，留下 `0 KB` 空文件导致核心启动即退 |
| **V2Ray 打包库（`geoip.dat` + `geosite.dat`）** | 同时支持 `GEOIP` 与 `GEOSITE,cn` / `GEOSITE,youtube` 等大包域名分类，但在低内存软路由上全量解包较吃内存 | 使用 `GEOSITE` 规则或显式设置 `geodata-mode: true` 时必须同时具备这两个完整文件 | 仅写了 `GEOSITE,geolocation-!cn` 规则，数据目录里却只有 `Country.mmdb` 没有 `geosite.dat` |
| **Mihomo 预编译规则集（`*.mrs`）** | Mihomo 原生二进制压缩规则集（分 `domain` 与 `ipcidr` 两类），按需加载、内存占用极低、解析速度比纯文本 YAML 快一个数量级 | 在 `rule-providers` 中必须显式声明 `format: mrs` 且指定准确的 `behavior: domain`（或 `ipcidr`） | 把 `.yaml` 文本链接配成了 `format: mrs`（或把 `.mrs` 二进制链接漏写 `format: mrs` 当作默认 yaml 解析） |

## 分层原因排除

### 本地系统与网络

- **端口冲突与 Windows Hyper-V / WSL2 动态保留端口**：除了其他代理进程占用 `7890` / `7897` / `9090` 外，开启了 WSL2、Docker Desktop 或 Hyper-V 的 Windows 10/11 系统，会在每次开机时由 `WinNAT` 随机征用若干段高位 TCP 端口（如 `7800–7900`）。哪怕 `netstat` 查不到任何进程监听 `7897`，Mihomo 绑定该端口时仍会被内核拒绝。
- **首次下载 Geo 数据库断流产生 `0 KB` 坏文件**：国内直连环境下首次启动核心，如果配置依赖外部数据库或远程 `rule-providers`，自动下载超时中断留在配置目录里的半截损坏文件会在每次启动校验时触发 `unexpected EOF`。

### 客户端与核心配置

- **YAML 语法铁律违背**：YAML 依赖严格的层级缩进，只认**半角空格（Space）**，严禁混入 `Tab`（`\t`）制表符；键值冒号后必须紧跟至少一个空格（`port: 7890` 正确，`port:7890` 报错）；节点名或密码若包含 `@`、`:`、`[`、`]`、`#`、`*` 等 YAML 保留元字符，必须用双引号或单引号包裹。
- **覆写流水线污染正常订阅**：Clash Verge Rev 等现代客户端并非直接把你下载的原始订阅喂给核心，而是按 **“机场原始 YAML → 局部/全局 Merge 合并 → 局部/全局 JavaScript Script 处理 → 生成最终运行态 `clash-verge.yaml`”** 的顺序合成。只要其中某一段 JS 脚本用正则滤空了某地区节点（例如脚本写了自动组建“美国自动测速组”，而你的轻量套餐恰好没买美国节点，生成了 `proxies: []` 空数组），最终合成文件就会校验失败。

### DNS 与路由分流

- **DNS 策略引用缺失命名空间**：在 `dns.nameserver-policy` 中写入了 `'geosite:cn': 223.5.5.5`，但本地 `geosite.dat` 缺失或损坏，核心会在初始化 DNS 模块阶段直接报错退出。
- **混用已废弃的旧版 Clash 字段**：把几年前 Clash Premium 时代的实验性写法（如已移除的旧 `experimental` 子项、错误的 `tun.stack` 拼写）原封不动塞进新版 Mihomo，在严格模式下会报字段解析错误。

### 远端订阅与节点

- **机场面板输出了畸形 YAML**：个别自改面板在拼接节点名称（例如加国旗 Emoji、倍率括号或到期提醒节点 `剩余流量：50GB`——注意未加引号的英文冒号！）时未做 YAML 字符串转义，导致全体用户更新订阅后集体报错。
- **节点新协议与过旧本地核心代差**：订阅包含 `vless`（带新版 `client-fingerprint` / `reality-opts`）、`hysteria2` 或 `anytls` 节点，而用户软路由里还塞着三年前未升级的老核心，遇到不认识的 `type` 会直接拒绝启动。

## 操作路径

以下按桌面端（Windows / macOS / Linux）与 OpenWrt 适用范围提供实操方法。对于 **iOS（Shadowrocket / Stash）与 Android（Clash Meta for Android / FlClash）**，虽无法在系统终端运行 `mihomo -t`，但可在 App 内的「日志 / 配置校验」页直接看到相同的行号报错，并按步骤 3 与步骤 4 的隔离思路处理。

### 步骤 1：运行 `mihomo -t` 只读语法校验并对照解读输出

不启动真实代理，仅在命令行调用核心自带的 `-t`（Test）模式检测最终合成配置（Clash Verge Rev 的最终合成文件通常叫 `clash-verge.yaml`，位于配置目录内）：

```powershell
# 适用 OS: Windows 10 / 11 (PowerShell)
# 目的: 调用内置 Mihomo 核心测试模式(-t)，针对数据目录(-d)与合成配置文件(-f)执行完整语法与依赖自检
# 风险等级: 低（纯只读语法测试，不绑定网卡也不改动系统代理）
# 预期输出解读: 末尾打印 "test is successful" 代表配置与数据库 100% 合法；若打印 error 及行号，按下方对照表精准修复
& "$env:LOCALAPPDATA\Clash Verge\verge-mihomo.exe" -d "$env:APPDATA\io.github.clash-verge-rev.clash-verge-rev" -t -f "$env:APPDATA\io.github.clash-verge-rev.clash-verge-rev\clash-verge.yaml"
```

```bash
# 适用 OS: macOS / Linux / OpenWrt (终端)
# 目的: 在终端只读校验 Mihomo 配置文件语法及 Geo/Rule-Provider 引用完整性
# 风险等级: 低（只读测试，不影响线上服务）
# 预期输出解读: 输出 "configuration file ... test is successful" 即通过校验
mihomo -d /etc/openclash -t -f /etc/openclash/config.yaml
```

*(提示：Windows 不同安装包下核心文件名可能为 `verge-mihomo.exe` 或 `clash-meta.exe`，macOS 位于 `/Applications/Clash Verge.app/Contents/MacOS/verge-mihomo`，请以实际目录文件名为准。)*

**`mihomo -t` 典型终端输出逐行解读表**：

| `mihomo -t` 终端返回关键信息 | 精准病因翻译 | 一招修复方法 |
| :--- | :--- | :--- |
| `configuration file ...\clash-verge.yaml test is successful` | YAML 语法、策略组引用与本地 Geo 数据库全部健康！ | 说明不是语法错，立刻执行步骤 2 排查本地端口占用或服务权限冲突 |
| `yaml: line 1: cannot unmarshal !!str <!DOCTY...` | 第 1 行就是网页 HTML 标签，订阅下载回来的是拦截页或登录页 | 不要改核心，去更新有效订阅地址（排查 403/302 重定向） |
| `yaml: line 86: found character that cannot start any token` | 第 86 行混入了 `Tab` 制表符缩进，或不可见全角控制字符 | 打开合成文件跳到第 86 行，将缩进全部改为空格，检查哪条 Merge 覆写引入了该行 |
| `proxy group [Auto-US]: proxy [...] not found` 或 `proxies cannot be empty` | 策略组 `[Auto-US]` 引用的节点不存在，或正则筛选结果为空 | 停用写死地区分组的自定义覆写脚本，或在正则组补充兜底 `DIRECT` / 有效节点 |
| `unpack geosite.dat error: unexpected EOF` / `can not find geoip.dat` | 数据目录下的 `geosite.dat` / `geoip.dat` 下载半截损坏或缺失 | 按步骤 3 删除或重命名 `0 KB`/残缺数据文件后重新更新 GeoData |

### 步骤 2：排查端口被占用或 Windows Hyper-V 保留端口冲突

当 `mihomo -t` 测试通过，但客户端启动核心依然失败时，90% 是监听端口冲突：

```powershell
# 适用 OS: Windows (PowerShell)
# 目的: 检查 Mihomo 默认混合端口(7890, 7897)与外部控制端口(9090, 9097)是否已被其他进程监听
# 风险等级: 低（只读查询）
# 预期输出解读: 核心停止状态下应无输出；若有输出，记下 OwningProcess (PID) 并执行 Get-Process -Id <PID> 找出是谁占了端口
Get-NetTCPConnection -LocalPort 7890,7897,9090,9097 -ErrorAction SilentlyContinue | Select-Object LocalAddress, LocalPort, State, OwningProcess
```

```powershell
# 适用 OS: Windows (PowerShell)
# 目的: 检查 WSL2 / Hyper-V 是否把 7890-7900 或 9090-9100 划入了系统禁止绑定的排除端口段
# 风险等级: 低（只读查询）
# 预期输出解读: 观察“开始端口 - 结束端口”列表；若 7897 恰好落在某个区间内（如 7850 - 7949），在客户端设置把混合端口改为 17897 即可立解
netsh interface ipv4 show excludedportrange protocol=tcp
```

### 步骤 3：核查文件字节数并修复损坏的 `.mmdb` / `.dat` / `.mrs` 数据库

```powershell
# 适用 OS: Windows (PowerShell)
# 目的: 列出 Clash Verge Rev 数据目录下所有地理数据库的精确文件大小，揪出 0 字节或几 KB 的报错元凶
# 风险等级: 低（只读文件属性检查）
# 预期输出解读: 健康的 Country.mmdb 应为数 MB，geosite.dat/geoip.dat 通常在数 MB 至十几 MB；凡是 Length 为 0 或不足 10 KB 的文件均为下载失败残骸（比如返回了 404 文本保存成了 .dat）
Get-ChildItem "$env:APPDATA\io.github.clash-verge-rev.clash-verge-rev" -Include "*.mmdb","*.dat","*.mrs" -Recurse | Select-Object Name, Length, LastWriteTime
```

修复步骤：
1. 将查出来的 `0 KB` 或仅几百字节的异常 `.dat` / `.mmdb` / `.mrs` 文件重命名为 `.bak`（或移出配置目录）。
2. 先临时切换到一个不依赖 `GEOSITE` 规则的单节点或基础配置让网络连通，然后在客户端「设置 → 外部资源 / 更新 GeoData」点击更新，待完整下载数 MB 文件后再切回主力配置。

### 步骤 4：覆写脚本“二分隔离法”定位配置错误源头

不要一上来就去几千行的合成文件里大海捞针，用 30 秒隔离法分清责任归属：
1. **第一刀（测裸订阅）**：在 Clash Verge Rev「订阅」页，关闭全部全局 `Merge` 与 `Script` 扩展卡片，也取消当前订阅右键菜单里挂载的局部扩展，点击重新激活该订阅。
   - **若核心立刻启动成功**：100% 证明机场远端订阅没问题，是你本地的某个 Merge 或 JS 脚本改坏了配置！逐一重新打开扩展卡片，点亮哪一个时核心报错，故障就在哪一段代码里。
   - **若裸订阅依然报错**：说明是机场下发的原始 YAML 本身存在语法问题（或订阅 URL 失效返回了非 YAML 文本）。右键该订阅点击「编辑文件」查看前 20 行是否为正常 `mixed-port` / `proxies:` 结构；若确系机场面板转义 Bug，可临时借用本地预处理脚本清洗异常节点名，或联系服务商修复面板模板。

## 什么结果算修复

1. 终端运行 `mihomo -t -d ... -f ...` 稳定输出 `test is successful`，无任何 `yaml` 或 `unpack` 报错。
2. 客户端核心状态指示灯正常亮起，本地混合端口（如 `7897`）与控制器端口处于 `Listen` 状态。
3. 「代理」页正常加载出所有策略组与节点列表，「规则」页完整显示数千条分流规则计数，出站访问通畅。

## 若仍失败怎么办

- 如果核心本身用命令行 `mihomo -t` 测试完全正常，但双击 Clash Verge Rev 桌面图标打不开窗口或整个界面一片纯白，需转向 GUI 渲染层排障：[Clash Verge Rev 无法启动与白屏排查](/troubleshooting/articles/clash-verge-startup-fail)。
- 如果右键打开订阅文件发现里面全是 `<!DOCTYPE html>`、空白 `proxies: []` 或 HTTP 报错页，说明订阅拉取环节失败，请按现象对号入座：[更新订阅返回 401/403/404/503 排查](/troubleshooting/articles/sub-http-401-403-404-503) 或 [订阅 HTTP 200 但返回空白内容排查](/troubleshooting/articles/sub-http-200-empty)。
- 如果核心正常启动但开启 Fake-IP 后微信掉线、内网 NAS 打不开，请阅读：[Fake-IP 原理与 198.18.0.1 冲突修复](/troubleshooting/articles/fake-ip-explained-fix)。

## 高风险操作与回滚提示

> [!WARNING]
> **严禁为了排查缩进错误而把包含私人节点密码、UUID 和订阅链接的完整 YAML 文件上传到来路不明的在线 YAML 格式化网站或公开论坛贴图**！使用上文 `mihomo -t` 本地离线命令或 VS Code 本地编辑器即可 100% 安全定位行号。**也严禁建议关闭杀毒软件来强行拉起报错核心**。

- **修改 YAML 配置或 Merge/Script 覆写规则的回滚**：
  1. 编辑任何配置文件或 JS 预处理脚本之前，先右键该卡片选择「复制」留存一份副本（或在文件夹中拷贝保存为 `.yaml.bak`）。
  2. 一旦修改覆写脚本引发循环引用或空策略组导致核心罢工，直接在「订阅」页关闭该覆写卡片开关并重新选中原订阅，即可瞬间无损退回可用状态。
- **修改本地混合端口（`mixed-port`）的回滚**：
  - 因避让 Hyper-V 保留端口而把混合端口从 `7897` 改为 `17897` 后，客户端自动管理系统代理不受影响；但若你曾在 Git（`git config --global http.proxy`）、终端配置或浏览器 SwitchyOmega 插件中硬编码了 `7897`，需同步更新端口号，或在重启电脑释放动态端口后改回原值 `7897`。
- **OpenWrt（OpenClash / Nikki）替换内核或 Geo 数据库回滚**：
  - 在 SSH 替换 `/etc/openclash/core/clash_meta` 或更新 `.dat` 数据库前，务必执行 `cp` 备份 `.bak` 原文件；出现启动失败时将 `.bak` 还原并校验 `chmod +x` 权限，执行 `/etc/init.d/openclash restart` 即可恢复全屋网络。

## 常见问题

### 客户端提示 yaml: line 42: did not find expected key 是什么意思？

这说明你正在加载的 YAML 配置文件（或你自己写的覆写规则）在第 42 行附近存在语法错误，常见原因是冒号后面忘了加空格、混用了中文全角冒号/引号、用 Tab 键替代了空格缩进，或者列表项前面漏掉了短横线 -。用命令行校验工具或还原覆写文件即可快速定位。

### 为什么同一份机场订阅在以前的老 Clash 里能用，换到 Clash Verge Rev 的 Mihomo 核心就报错启动不了？

机场下发了只适配旧版原版 Clash 的格式或非标扩展字段，而 Mihomo 核心对部分字段校验更严格；另一种常见情况是你在新客户端启用了包含旧字段或语法错误的全局覆写脚本（Script/Merge），合并后把原本正常的订阅改坏了。

### 报错 can not find geoip.dat 或 geosite.dat 导致核心退出的原因是什么？

配置中的分流规则（如 GEOSITE,cn 或 GEOIP,CN）或 DNS 规则引用了 Geo 数据库，但首次启动时客户端还没连接外网，自动下载数据库失败或下载到半截留下了 0 字节损坏文件，核心一读就报错。先切回无 Geo 规则的临时节点或手动从可信渠道补全完整数据库文件即可恢复。

### Mihomo 规则里的 .mrs、.dat 和 .mmdb 文件分别是什么，混用会报错吗？

它们是三代不同的地理与规则数据存储格式：Country.mmdb 是传统的单 IP 国家库；geoip.dat 与 geosite.dat 是兼容 V2Ray 的打包库（需开启 geodata-mode: true）；而 .mrs（Mihomo Rule Set）是 Mihomo 专有的预编译二进制规则集，内存占用最低、加载最快。如果在 rule-providers 中写了 format: mrs 却填入普通 .yaml 文本规则链接，核心会立即报解析失败。

## 相关教程与替代入口

- 界面启动异常：[Clash Verge Rev 无法启动与白屏排查](/troubleshooting/articles/clash-verge-startup-fail) ｜ [从旧客户端安全迁移与备份指南](/troubleshooting/articles/client-migration-backup)
- 教程与内核科普：[Clash 配置指南](/guides/clash-setup/) ｜ [分流规则配置指南](/guides/split-routing/) ｜ [Mihomo 内核与兼容说明](/clients/mihomo/) ｜ [Clash Verge Rev 专题](/clients/clash-verge/)
- 订阅端排查：[更新订阅失败排查专题](/troubleshooting/subscription-failure/) ｜ [跨客户端配置差异排查](/troubleshooting/articles/cross-client-inconsistency)
- 专题汇总：[客户端无法启动排查专题](/troubleshooting/app-not-starting/)
