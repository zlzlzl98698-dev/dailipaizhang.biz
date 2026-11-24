---
title: Shadowrocket 小火箭无法导入订阅与分流规则不生效排查
description: 系统排查 iOS/iPadOS 与 Apple Silicon Mac 上 Shadowrocket 小火箭订阅导入失败、解析空白、节点不更新及分流规则不生效的根因与修复步骤。
pillar: troubleshooting
category: subscription-failure
primaryKeyword: Shadowrocket 无法导入订阅分流规则不生效
intent: troubleshooting
publishedAt: '2026-11-23'
updatedAt: '2026-11-24'
breadcrumbs:
  - text: 首页
    link: /
  - text: 故障排查
    link: /troubleshooting/
  - text: 订阅失败
    link: /troubleshooting/subscription-failure/
  - text: Shadowrocket 导入与规则排查
howTo:
  name: 排查并修复 Shadowrocket 订阅导入与规则失效
  description: 按低风险检查、格式识别、User-Agent 与配置覆写顺序排查 Shadowrocket 导入异常及分流未命中问题。
  step:
    - name: 核对订阅格式与 URL 完整性
      text: 确认复制的是通用 Base64 或 Shadowrocket 专属订阅地址，末尾无多余空格或换行，且未误将机场专属客户端登录页当作订阅 URL。
    - name: 开启订阅更新选项与检查网络状态
      text: 在 Shadowrocket 设置-订阅中确认已启用“打开时更新”或“后台更新”，必要时切换移动网络与 Wi-Fi 排除当前网络拦截订阅域名。
    - name: 检查当前全局路由与远程配置链接
      text: 进入 Shadowrocket 首页将“全局路由”设为“配置（Config）”，并在“配置”标签核对正在生效的 .conf 规则文件是否为默认或可用远程规则。
    - name: 使用命令行模拟拉取订阅响应头（可选）
      text: 在 macOS 终端使用脱敏后的 curl 命令检查订阅接口返回的状态码、Content-Type 与字节长度，区分客户端解析问题还是服务端下发异常。
    - name: 验证连通性、分流命中与规则日志
      text: 开启“设置-代理-日志”或首页连通性测试，分别访问国内直连站点与境外测试域名，确认流量按预期走 DIRECT 或代理策略组。
faq:
  - q: 为什么在 Shadowrocket 里导入 Clash YAML 订阅链接后提示格式不支持或节点为空？
    a: Shadowrocket 原生订阅通常读取 Base64 编码节点列表、SIP008 JSON 或包含节点与规则的 .conf 托管配置。若服务商直接下发仅面向 Mihomo/Clash 的纯 YAML 文件，Shadowrocket 可能无法直接作为普通节点订阅解析，需在机场后台复制“Shadowrocket 专用订阅”或通用 Base64 订阅地址。
  - q: 全局路由已经选了“配置”，为什么国内网站还是走代理或分流规则完全不生效？
    a: 常见原因有两点：一是“配置”页当前激活的依然是未包含完整国内规则段的空白或损坏配置文件；二是开启了“总是通过代理”的局部策略、或在“配置-编辑纯文本”中规则顺序错误（如 FINAL/MATCH 被放在前排截断了后续 GEOIP,CN 规则）。
  - q: 提示“未启用订阅”或找不到免费的 Shadowrocket 正版怎么办？
    a: Shadowrocket 是运行在 iOS、iPadOS 及 Apple Silicon（M 系列芯片）macOS 上的付费应用，仅在美区等海外 App Store 上架，没有官方免费版，也没有 Windows、Android 或 Linux 原生客户端。请勿从非官方途径安装来历不明的描述文件或共享账号，以免泄露设备数据与订阅 Token。
---

# Shadowrocket 小火箭无法导入订阅与分流规则不生效排查

## 核心结论（Answer-First）

Shadowrocket 无法导入订阅，多半因误复制了纯 Clash YAML、机场仅限专属端无通用订阅，或当前网络屏蔽了订阅域名；分流规则不生效则通常因为“全局路由”仍停在“代理/直连”而非“配置”，或激活的 `.conf` 规则文件损坏与顺序错位。先切换移动网络重试导入，并核对“全局路由 = 配置”即可定位九成问题。

## 故障现象

- **导入订阅报错**：点击右上角 `+` 选择“类型：Subscribe”后提示 `Unsupported URL`、`无法连接到服务器`、`The request timed out`、`数据格式不正确`，或导入后列表新增了一条订阅但节点数量为 `0`。
- **更新订阅无变化**：下拉刷新订阅时转圈后无提示，原有过期节点未清除，或提示 SSL/TLS 握手错误。
- **iOS / iPadOS 典型表现**：在 Safari 点击“一键导入 Shadowrocket”无弹窗反应，或跳转后仅打开了空白界面。
- **Apple Silicon Mac 表现**：通过 App Store 安装 iPad 兼容版后，因剪切板权限弹窗未授权导致粘贴识别失败，或本地网络权限未放行引起订阅更新超时。
- **分流规则失效表现**：规则更新后，访问国内常见视频/网盘仍消耗大量代理流量，或访问海外站点却被直连超时；查看“数据统计”或请求日志发现所有请求均命中了同一条 `FINAL` 规则。

## 先做 3 个低风险检查

1. **检查网络与订阅域名可达性**：暂时关闭当前代理开关，在 Safari 中直接访问订阅地址的根域名（不要在公共工具或截图里暴露含 Token 的完整链接），若手机 Wi-Fi 打不开而 5G/4G 流量能打开，说明本地宽带或路由器拦截了订阅域名。
2. **核对全局路由模式**：打开 Shadowrocket 首页，确认“全局路由（Global Routing）”当前选项为 **配置（Config）**，而不是“代理（Proxy）”或“直连（Direct）”。只要选在“代理”，所有分流规则都会被绕过。
3. **确认是否属于“无第三方订阅”限制**：部分提供专属客户端的机场不开放通用订阅格式。若后台仅提供账号密码登录专属 App 而找不到 Shadowrocket/通用 Base64 链接，属于服务商产品形态限制，并非小火箭故障。

## 分层原因排除

### 本地系统与网络

- **iOS 本地网络与蜂窝权限**：iOS 首次打开 Shadowrocket 时若拒绝了“无线数据”权限，在蜂窝网络下将无法拉取订阅；若关闭了“本地网络”权限，局域网设备访问或部分底层接口也会受阻。
- **系统时间偏差**：iOS“日期与时间”关闭自动设置导致时间误差超过数分钟，会在 HTTPS 拉取订阅时触发 TLS 证书校验失败。
- **剪贴板与 Safari 跳转限制**：从浏览器点击 `sub://` URL Scheme 时，部分内置浏览器（如社交软件内嵌 WebView）会拦截自定义协议跳转，改用系统 Safari 或手动复制链接在 App 内新增更可靠。

### 客户端与核心配置

- **订阅格式与 User-Agent 不匹配**：部分机场后台会根据请求的 `User-Agent` 决定下发 Base64 还是 Clash YAML。如果 Shadowrocket 请求未携带预期标识或用户手动粘贴了带 `&flag=clash` 参数的链接，会导致返回 YAML 文本而小火箭无法识别为常规节点列表。
- **配置文件损坏或非默认配置**：在“配置”页面中，“本地文件”可能残留了过去下载失败的 0 字节 `.conf` 文件。只要当前激活（左侧带圆点选中）的是损坏配置，所有规则均无法加载。
- **全局路由与场景模式冲突**：启用了“场景（Scene）”功能切换 Wi-Fi 自动切为“直连”或“代理”，导致连上特定 Wi-Fi 后规则被自动覆盖。

### DNS 与路由分流

- **规则顺序与 `FINAL` 截断**：Shadowrocket 配置文件按自上而下顺序匹配 `[Rule]`。若在自定义规则中把 `FINAL,PROXY` 放在了 `GEOIP,CN,DIRECT` 之前，或把泛域名 `DOMAIN-SUFFIX,com,PROXY` 置于前面，后续分流全部失效。
- **GeoIP 数据库缺失或陈旧**：长时间未更新配置内的 GeoIP 库，部分新分配的国内 IP 段未被收录进 `GEOIP,CN`，从而误走代理。
- **DNS 污染与系统 DNS 缓存**：iOS 切换配置后系统 DNS 缓存未刷新，先前在直连下解析到的污染结果仍在 TTL 有效期内；同时若配置文件 `[General]` 中配置的 `dns-server` 不可达，也会引起规则域名无法解析而跳过 IP 类规则。

### 远端订阅与节点

- **订阅 Token 失效或流量/套餐到期**：服务端已重置订阅地址或套餐到期时，部分面板返回 HTTP 401/403 或一段中文提示文本，Shadowrocket 无法将其解析为节点，表现为导入 0 节点。
- **托管规则源（CDN/Raw）在本地被阻断**：许多远程 `.conf` 配置文件内部又引用了外部 `RULE-SET` 列表，若更新配置时未开启代理或远程规则托管域名被阻断，主配置虽导入成功，子规则集却全为空。

## 操作路径

### 适用平台说明

- **适用平台**：iOS、iPadOS、macOS（仅限 Apple Silicon M1/M2/M3/M4 系列芯片 Mac 通过 App Store 安装运行）。注意 Shadowrocket 为付费应用（如美区 App Store 售价以商店实时页面为准），无官方开源代码仓库。
- **不适用平台**：Windows、Android、Linux、OpenWrt 及 Intel 芯片 macOS 均**不适用**本教程——Shadowrocket 从未推出上述平台官方客户端；如在上述设备遇到类似问题，请前往 [客户端软件库](/clients/) 查看对应平台客户端排障。

### 具体排查步骤

1. **步骤 1：核对并清理订阅 URL 格式**
   - 在机场官网后台确认复制的是“通用订阅 / Base64”或“Shadowrocket 专用订阅”。若链接末尾带有 `flag=clash` 等明确指定其他内核的参数，建议改用无该参数的原始地址。
   - 打开 Shadowrocket 首页右上角 `+`，类型选 **Subscribe**，粘贴 URL 后检查首尾是否有空格或换行符，备注栏可先留空测试保存。
2. **步骤 2：在设置中启用订阅自动更新与拉取重试**
   - 进入底部 **设置（Settings） -> 订阅（Subscribe）**，开启 **打开时更新（Update on Open）**。
   - 若直连本地网络无法拉取订阅，可先在本地保留一个可用的临时节点并开启连接，开启全局代理后再下拉刷新订阅，或开启订阅页面内的“通过代理更新”选项（视版本名称而定）。
3. **步骤 3：检查激活的 `.conf` 配置文件与规则集**
   - 切换到底部 **配置（Config）** 标签页，查看“本地文件”下当前勾选（选中状态）的配置名称。
   - 若使用的是远程配置且规则未生效，点击该配置右侧 `i` 图标选择 **恢复默认（Restore Default）**，或者重新测试导入一份干净的默认规则配置，再将首页 **全局路由** 确认设置为 **配置**。
   - 切勿手动把 `FINAL` 规则移动到 `[Rule]` 顶部，确保 `GEOIP,CN,DIRECT` 位于 `FINAL` 之前。
4. **步骤 4：使用终端命令行验证订阅接口响应（macOS 辅助诊断）**

   在 macOS 上可通过终端先确认订阅接口本身是否正常下发数据，再判断是否为手机端 App 问题。

   - **适用 OS**：macOS（同样适用于 Linux 终端辅助验证）
   - **目的**：检查订阅接口返回的 HTTP 状态码、`Content-Type`、`subscription-userinfo` 流量头及原始返回体前缀（判断是 Base64 还是 YAML 或报错 HTML）。
   - **风险等级**：低（仅执行只读 HTTP HEAD/GET 请求；**严禁将含真实 Token 的命令粘贴给他人或公开论坛**）。

   ```bash
   # 将以下占位链接替换为你自己的订阅地址进行本地检测
   curl -i -L --max-time 10 -A "Shadowrocket/2.2" "https://sub.example.com/api/v1/client/subscribe?token=REDACTED" | head -n 25
   ```

   - **预期输出解读**：
     - 正常应看到 `HTTP/2 200`（或 `HTTP/1.1 200`），且响应头可能包含 `subscription-userinfo: upload=...; download=...; total=...; expire=...`。
     - 若响应正文第一行出现 `port:`、`mixed-port:`、`proxies:`，说明服务器返回了 Clash YAML，而非 Shadowrocket 默认 Base64 格式。
     - 若返回 `HTTP/2 401` / `403` / `404` 或 `<html` 跳转页，说明订阅本身已失效或被风控拦截，需参考 [401/403/404/503 订阅失败排查](/troubleshooting/articles/sub-http-401-403-404-503)。

5. **步骤 5：刷新规则缓存并验证日志命中**
   - 返回 Shadowrocket 首页，关闭后重新开启主开关（触发 Network Extension 重建）。
   - 打开 **设置 -> 代理 -> 日志**（或点击首页“数据”查看连接记录），在 Safari 访问一个国内站和一个境外站，观察请求记录是否按预期分别命中 `DIRECT` 与代理节点。

## 什么结果算修复

- 订阅列表中该条目显示正常节点数量（大于 0），且能正常读取剩余流量与到期时间（若服务商下发该响应头）。
- 首页“连通性测试”对目标节点返回有效延迟数值（非 `Timeout`）。
- 请求日志中，国内常见域名显示走向 `DIRECT`，需代理的境外站点显示走向所选策略组或节点，且实际网页加载与测速归属地符合预期。

## 若仍失败怎么办

- 确认机场本身是否支持 Shadowrocket 或第三方通用订阅；若属于仅支持专属客户端的服务，需评估替代方案，参考 [服务失联与替代方案](/security/alternatives/)。
- 尝试在相同网络下使用另一台设备或通用客户端（如 iOS 端的 Stash、Sing-box 官方 SFI 等）导入同一份订阅链接，排查是否仅当前版本的本地配置损坏。
- 若使用远程托管 `.conf` 反复加载子规则失败，可先切回 Shadowrocket 内置 `default.conf` 验证基础连通性，确认节点本身正常后再逐步排查分流规则来源。

## 高风险操作与回滚提示

- **隐私与安全红线**：**绝对不要将包含真实 `token=` 或个人密码的完整订阅 URL 上传到在线订阅转换网站、公开论坛或发给陌生人代为排障**，否则任何拿到链接的人都可直接消耗你的流量甚至关联账号。如需展示报错，务必像上文一样将 Token 替换为 `REDACTED`。
- **切勿安装未知来源的描述文件或共享 Apple ID**：非官方渠道下载的 IPA、企业签名包或公共账号登录 iCloud 可能导致设备被远程锁定或订阅凭证被窃取。
- **配置文件修改回滚**：在编辑 `.conf` 纯文本或覆盖配置前，先在 Shadowrocket **配置 -> 本地文件** 中左滑复制备份当前可用的配置，或通过“分享”导出到本地“文件”App；若修改后完全断网，直接切换回内置 `default.conf` 并重启连接开关即可立即回滚。

## 常见问题

### 为什么在 Shadowrocket 里导入 Clash YAML 订阅链接后提示格式不支持或节点为空？

Shadowrocket 原生订阅通常读取 Base64 编码节点列表、SIP008 JSON 或包含节点与规则的 `.conf` 托管配置。若服务商直接下发仅面向 Mihomo/Clash 的纯 YAML 文件，Shadowrocket 可能无法直接作为普通节点订阅解析，需在机场后台复制“Shadowrocket 专用订阅”或通用 Base64 订阅地址。

### 全局路由已经选了“配置”，为什么国内网站还是走代理或分流规则完全不生效？

常见原因有两点：一是“配置”页当前激活的依然是未包含完整国内规则段的空白或损坏配置文件；二是开启了“总是通过代理”的局部策略、或在“配置-编辑纯文本”中规则顺序错误（如 `FINAL`/`MATCH` 被放在前排截断了后续 `GEOIP,CN` 规则）。

### 提示“未启用订阅”或找不到免费的 Shadowrocket 正版怎么办？

Shadowrocket 是运行在 iOS、iPadOS 及 Apple Silicon（M 系列芯片）macOS 上的付费应用，仅在美区等海外 App Store 上架，没有官方免费版，也没有 Windows、Android 或 Linux 原生客户端。请勿从非官方途径安装来历不明的描述文件或共享账号，以免泄露设备数据与订阅 Token。

## 相关教程与替代入口

- [订阅更新失败与格式排查专题](/troubleshooting/subscription-failure/)
- [Shadowrocket 客户端详解与合规获取说明](/clients/shadowrocket/)
- [同一订阅在不同客户端表现不一致：协议支持与 UA 差异](/troubleshooting/articles/cross-client-inconsistency)
- [订阅 HTTP 200 但返回空白内容排查](/troubleshooting/articles/sub-http-200-empty)
- [更新订阅失败：401/403/404/503 与重定向排查](/troubleshooting/articles/sub-http-401-403-404-503)
- [机场订阅教程与通用格式说明](/guides/subscriptions/)
- [账号与订阅链接安全防护](/security/account-security/)
- [31 家机场品牌兼容与客户端支持数据库](/brands/)
