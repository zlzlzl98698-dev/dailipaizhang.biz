# 原始输入资料与证据资产审计报告 (Input Audit Report)

- **审计执行日期**：`2026-11-23`
- **审计范围**：5 份原始 TXT 资料、2 份测速说明与清单文件、本地 `docs/public/images/` 下的全部测速图、Miaoko 证据图与品牌 Logo
- **核心原则**：零虚构、零猜值；所有冲突原样保留并显式标注；绝不把推广链接（AFF）标为官方网站（`officialUrl` 统一设为 `"待核实"`）。

---

## 一、原始输入文件清点

| 编号 | 文件路径 | 类型 | 原始声明日期 | 核心内容与审计结论 |
|---|---|---|---|---|
| 1 | `c:\Users\Pro User\Desktop\机场品牌信息\32家机场品牌清单.txt` | 品牌/套餐/推广资料 | `2026-10-19`（含后附 `2026-08-09` 历史档案） | 共 1213 行；含主表 28 家 + 后附 4 条记录（去重后 **31 个独立品牌**）；所有链接均为带 `code=` 的推广链接。 |
| 2 | `c:\Users\Pro User\Desktop\机场品牌信息\光速云品牌信息.txt` | 单品牌详表 | `2026-11-23` 审计 | 共 84 行；第一主推品牌，含支付方式（支付宝/微信/USDT）及 4 档套餐详情，存在 59GB vs 69GB 内部冲突。 |
| 3 | `c:\Users\Pro User\Desktop\机场品牌信息\第三方代理客户端.txt` | 客户端资料库 | `2026` | 共 107 行；覆盖 Windows / Android / iOS / macOS / Linux / OpenWrt 六大平台 24 款通用客户端，仅标注渠道名（GitHub / App Store / 官网），未给具体 URL。 |
| 4 | `c:\Users\Pro User\Desktop\机场品牌信息\机场品牌图表样式.txt` | 视觉与状态规范 | `2026` | 共 106 行；规定采用专业网络可观测性平台语言（`Measured Data` / `Vendor Data` / `Not Tested`），禁止廉价黑客风或无依据排行榜。 |
| 5 | `c:\Users\Pro User\Desktop\机场品牌信息\内容矩阵.txt` | IA 与 SEO/GEO 规范 | `2026` | 共 179 行；规定结构化字段、条件化结论、无可靠资料统一标“待核实”。 |
| 6 | `README_16个机场测速实测资料_最新版.txt` | 实测批次说明 | `2026-08-12 V2`（测速 `2026-08-11`） | 原始压缩包 `16个机场测速图_2026-08-11_实测版.zip`（36,733,598 bytes，SHA-256: `22BBBCDF4AE9F2D82DADAD9EFCBB55DBFEE6681720B0032EB31BB92C66F0D9D4`）。 |
| 7 | `speedtest-manifest.json` | 实测元数据清单 | `2026-08-11` | 记录 16 张 1122×1402 PNG 的测试时间、图中协议、工具版本与 `dateConfidence`。 |

---

## 二、品牌数量去重与编号错位审计（32 条记录 → 31 个独立品牌 + 1 个未入库测速实体）

1. **为什么《32家机场品牌清单.txt》实际只有 31 个独立品牌**：
   - 主表共 28 个品牌（编号 `#1` 至 `#28`）；
   - 文末「位置都往后面排」附带 4 条 `2026-08-09` 历史记录：`灵动云`、`浪网`、`边缘节点 EdgeNova`、`Firefly 萤火虫`；
   - 其中后附的 **`Firefly 萤火虫`** 与主表 **`#8 Firefly`** 属于同一品牌（同域名 `vip02.fireflyaff.com`、同优惠码 `firefly`、同套餐系列 `Lite / Plus / Blaze / Nova / 年付版 / 不限时`），合并后为 **28 + 3 = 31 个独立品牌**。
2. **原清单详表与总表的编号跳号、重号与错位**：
   - **详表 `#22` 跳号**：详表从 `## 21. 闪电鼠` 直接跳至 `## 23. 云界线`，缺失 `## 22`；而在第 943 行的「完整数据表」中，`#22` 为 **`大佬云`**（大佬云在详表中被排在 `## 5. 大佬云`）。
   - **详表 `#7` 重复三次且缺 `#9`**：详表中 `二猫云`、`无忧链接`、`唯兔云` 三个品牌均被标为 `## 7.`；`## 8. Firefly` 后直接跳到 `## 10. 宇宙云`（`暮光加速` 在详表排在 `## 2`，在完整数据总表排在 `#9`）。
3. **测速包外溢实体「快狸 (`kuaili`)」**：
   - `speedtest-manifest.json` 第 9 项及本地 `docs/public/images/speedtests/kuaili-20260811.png` 包含 **「快狸」**（测试时间 `2026-08-11 19:52:22 CST`，协议 `VLESS`，50/50 节点）；
   - 该品牌**完全不在** 31 家品牌清单中，无套餐价格、无官网/注册链接、无运营年份，已单独隔离记录至 `data/source-evidence.json` 与 `reports/pending-evidence.md`，不混入 31 家品牌库。

---

## 三、全量品牌数据冲突与异常逐项审计表

| 品牌 (`slug`) | 冲突/异常类别 | 原始出处 A | 原始出处 B / 实测证据 | 审计处置方式 |
|---|---|---|---|---|
| **光速云** (`guangsuyun`) | 轻量版月流量冲突 | `光速云品牌信息.txt` 第 8 行：「年付折合约 8 元/月，**59GB**」 | 同文件第 26 行及 `32家清单.txt` 第 11/23 行：「轻量版 年付 ¥99 **69GB/月**」 | 原样保留两边数值于 `plans[]` 与 `conflicts[]`，严禁单边抹除。 |
| **光速云** (`guangsuyun`) | 入门价格口径差异 | 宣传摘要：「最低入门价格约 **8元一个月**」（实为 ¥99/年年付折算） | 最低月付套餐：「极速版 **¥25/月** 168GB」（另有 ¥147 一次性 247GB 永久包） | 明确标注 8 元/月为年付折算均价，非普通月付价。 |
| **光速云** (`guangsuyun`) | 多源测速、协议与 YouTube 送中冲突 | `32家清单.txt`：宣称 `VLESS`、全部支持 YouTube，附 `2026-10-19 非晚高峰` 表格（HK 22ms/529Mbps 等，无工具说明） | ① `2026-08-11` MAI-TEST-BOT 图：协议为 **`Shadowsocks`**（54节点），**`HK 02 = 0B/0B`**，`TW 04 = 8.40MB`，`HK 20 RTT = 201ms`；<br>② `2026-08-19` 目录 5 张 Miaoko 图：广西移动/长沙电信/河北联通 3 张为 **`Shadowsocks`**（62节点，HK OpenAI `仅APP(HK)`、Gemini `失败`、TW Disney+ `失败`）；珠海联通 2 张为 **`Vless` (60) + `AnyTLS` (10)**，**`美国02 = 1.60KB/s`**，且**新加坡 01-10、台湾 01-06/08-10、电信-台湾01/02、电信-新加坡01、电信-日本01 的 YouTube 均显示 `送中(CN)`** | 完整录入 3 个批次测速与全部 6 张本地截图特征，标注 `unlock-songzhong-observed` 与 `multi-source-speedtest-conflict`。 |
| **云界线** (`yunjiexian`) | 邀请码冲突 + 链接缺 `#` | 详表 `#23`：`https://qwerty.yunjiexianaff.com/?code=aycnwNUi` | 总表 `#23`：`https://qwerty.yunjiexianaff.com/?code=HBaZ91c6` | 两处均缺少 `#`，且 `code` 不一致；标记 `affiliateUrlFlag: "conflict-code|missing-hash"`。 |
| **环球梯** (`huanqiuti`) | 推广链接缺少 `#` | 详表 `#26` & 总表 `#26`：`https://qwerty.huanqiutiaff.com/?code=9I4KRNPH` | 标准 SPA 注册路由格式应含 `/#/` | 保持原链接不擅自篡改，标记 `affiliateUrlFlag: "missing-hash"`。 |
| **榴莲云** (`liulianyun`) | 链接 `#/` 前缺 `/` + 协议未明 | 详表 `#24` & 总表 `#24`：`https://qwerty.liulianyunaff.com#/?code=hS5pvbfE` | 原文明确写「协议类型品牌资料未统一提供」 | 标记 `affiliateUrlFlag: "missing-slash-before-hash"`，`protocols: ["待核实"]`。 |
| **Firefly** (`firefly`) | 历史与当前邀请码冲突 | 主表 `#8`：`https://vip02.fireflyaff.com/#/?code=2n7VURre`（2026-10起专属客户端，不提供订阅） | 后附 `2026-08-09` 历史记录：`https://vip02.fireflyaff.com/#/?code=jTp9wSgZ`（含季9/半85/年8折多周期表及无微信说明） | 合并为同一品牌实体，保留两套 code 冲突记录与多周期价格。 |
| **灵猫网络** (`lingmao`) | 优惠码冲突 + 套餐/价格冲突 | 基础数据 & 总表 `#12`：优惠码 **`lmao888`**，标注「`19元/月 150GB/月 + 不限时套餐`」 | 详表基础信息：优惠码 **`lingmao`**（8折，年付小包不适用），起步价 `¥7.1/月起`（年付小包 ¥85/45GB），月付 Small 实为 **¥25/150GB**，且套餐表**无不限时套餐**；`2026-08-11` 测速图为 `Shadowsocks` | 双码与价格/不限时包缺失全部记入 `conflicts[]`。 |
| **隐形人** (`yinxingren`) | 优惠码冲突 + 流量冲突 + 空测速表 | 基础数据 & 总表 `#27`：优惠码 **`yxr888`**，`24元/月 100GB/月`，总表写「60+节点详细清单 + 1小时修复承诺」 | 详表基础信息 & 正文：优惠码 **`moon80`**（8折），套餐表「白银纪元」实为 **`¥24 / 144GB/月`**；`2026-10-19` 测速表五地全为 `—` | 双优惠码、100GB vs 144GB 及无实测全部记入 `conflicts[]`。 |
| **一翻云** (`yifan`) | 优惠码冲突 + 测速协议覆盖 | 基础数据 & 总表 `#15`：优惠码 **`yfy6666`** | 介绍正文：「优惠码 **`1FLYYUN`** 可以再打 9 折」；宣称 Hysteria 2 / VLESS-Reality / SS 三协议，2026-08-11 图仅测 `Shadowsocks` | 记录双优惠码冲突与实测协议范围限制。 |
| **SOGO云** (`sogo`) | 优惠码冲突 + 协议与年份差异 | 总表 `#16`：优惠码 **`sss777`**，标注「2026年新品牌」 | 详表 & 正文：优惠码 **`SOGO10000`**（9折），标注 `VLESS` 协议；但 `2026-08-11` 实测图显示 **`Shadowsocks`** | 记录双码冲突、VLESS vs SS 差异及开业年份待核实。 |
| **全球云** (`quanqiu`) | 优惠码冲突 + 起步价口径 | 总表 `#20`：优惠码 **`qqy7777`**，标注「2026年新品牌」 | 详表基础信息：优惠码 **`qq88`**（8折），写 `¥20/月起`，但套餐表另有年付轻量版 `¥99/年 59GB/月` | 记录双码冲突与年付/月付口径差异。 |
| **暮光加速** (`muguang`) | 优惠码有无自相矛盾 | 基础数据 & 总表 `#9`：优惠码 **`muguang5555`**，`20元/月 120GB` | 介绍正文：「**目前没有查到公开的优惠码信息**，如果预算敏感，建议直接联系客服问问当前是否有活动」，且正文写 `9元/月起`（对应年付 ¥109/70GB） | 显式标注优惠码自相矛盾，提醒下单前向客服核实。 |
| **无忧链接** (`wuyou`) | 订阅策略时间线冲突 + 7月实测图 | 基础数据：`2025年运营`；总表 `#5`：「**订阅无需转换** + 6元轻量套餐」 | 介绍正文：「**2026 年 10 月起直接用官方专属客户端**，不用折腾订阅」；本地留存 `2026-07-18` 两张 Miaoko 图（`wuyou-1.jpg` Vless 50节点，新加坡SIN-02=17.59KB；`wuyou-2.jpg` **香港HKG-01 YouTube 送中(CN)**） | 记录 2026-10 专属端政策变更与 2026-07-18 实测异常节点。 |
| **微风网络** (`weifeng`) | 入门价格冲突 + 文件名与图内日期冲突 | 基础数据：「**年付约7元/月 50GB/月**」；总表 `#3`：「7元档 + 9折」 | 套餐表最低为「**清风 (Breeze) 年付 ¥137 100GB/月**」（折合 11.4 元/月，正文亦写 11 元/月起）；本地文件名为 `weifeng-20260811.png`，但图内实际时间戳为 **`2026-07-19 18:38:20 (CST)`**（Vless 50节点，**台湾02=0.00B，日本05=8.00KB**） | 同时记录价格冲突（7元/50G vs 137元年/100G）与测速图真实日期（2026-07-19）。 |
| **宇宙云** (`yuzhou`) | 文案与实测包脱节 | 详表 `#10`：「测速（2026-10-19）**暂无可核实实测数据**」，套餐表全为「待补充」 | `2026-08-11` 实测包中实际存在 `yuzhou-20260811.png`（`21:04:24 CST`，Vless 50节点，**【香港】01=0.00B，【新加坡】07=9.60KB**） | 关联 2026-08-11 实测图，同时保留当期套餐待补充警告。 |
| **可信云** (`kexin`) | 测速图日期截断 + 协议差异 | 详表 `#17`：标注 `VLESS 协议`，主动说明「AI 与流媒体目前缺乏统一实测数据」 | `kexin-20260811.png` 底部仅显示 **`15:32:35 (CST)`**（完整日历日期截断未显，按批次暂记 2026-08-11），图中协议为 **`Shadowsocks`**（55节点，JP07=12.61KB，US05=688.93KB） | 标注 `dateConfidence: "date-inferred-from-batch-time-visible-in-image"`。 |
| **二猫云** (`ermao`) | 新加坡节点前后矛盾 + 协议差异 | 介绍正文：「节点覆盖香港、日本、美国，**比不少同类机场少了新加坡这一站**」，标注 `VLESS` | 同段上方 `2026-10-19` 测速表包含**新加坡 46ms / 407Mbps**；`2026-08-11` 实测图协议为 **`Shadowsocks`** | 记录正文与表格自相矛盾及协议差异。 |
| **唯兔云 / 星岛梦 / 光年梯 / 速界** | 文案协议 vs 实测图协议不一致 | 唯兔云、星岛梦正文写 `Trojan`；光年梯、速界写 `VLESS` | 4 家在 `2026-08-11` MAI-TEST-BOT 截图中均显示为 **`Shadowsocks`** | 如实并列「品牌资料声明协议」与「2026-08-11 截图显示协议」。 |
| **U1S1** (`u1s1`) | 正文提及套餐未入套餐表 | 介绍正文：「之外还有 **1000GB 的一次性大流量包**」 | 同条套餐价格表仅列出 1 档年付 + 4 档月付，**无 1000GB 一次性套餐** | 记录套餐表遗漏冲突。 |
| **灵动云 / 浪网 / EdgeNova** | 2026-08-09 历史记录与遮挡字段 | 后附 `2026-08-09` 历史档案，明确注明「不保证当前有效」 | 灵动云定制套餐流量「**截图遮挡**」、文案 VLESS/Trojan 混提；浪网入门流量写「**截150G**」且未实测；EdgeNova 无逐地区测速与解锁测试 | 统一归入 `evidenceStatus: "historical"`，排在列表末尾。 |

---

## 四、2026-10-19 非晚高峰表格测速的跨品牌方法论审计

在《32家机场品牌清单.txt》中，有 **15 个品牌**（光速云、暮光加速、飞猫云、微风网络、星岛梦、二猫云、无忧链接、唯兔云、Firefly、U1S1、灵猫网络、一翻云、SOGO云、闪跃、全球云）附带了标注为 `测速（2026-10-19 原文标注，非晚高峰）` 的五地（香港、台湾、新加坡、日本、美国）文本表格：

1. **高度趋同特征**：15 家品牌的香港延迟全部落在 `21–27ms`、下载 `477–548Mbps`；台湾延迟 `37–41ms`、下载 `100–135Mbps`；新加坡延迟 `42–46ms`、下载 `383–445Mbps`；日本延迟 `53–57ms`、下载 `131–150Mbps`；美国延迟 `134–180ms`、下载 `14–30Mbps`。
2. **方法论缺失**：该表格未提供任何原始截图、测试软件名称、测试运营商后端、并发线程数或具体小时分钟。
3. **审计结论**：该组 `2026-10-19` 表格数据只能作为 `dataStatus: "vendor"`（资料附带参考文本）展示，**严禁将其标为本站实验室实测（`measured`），严禁据此计算综合得分或制作跨品牌速度排行榜**。

---

## 五、本地图片与第三方客户端资产审计

1. **本地测速图 (`docs/public/images/speedtests/`)**：共 **19 个文件**
   - 16 张对应 `2026-08-11` 压缩包（`sogo`, `u1s1`, `ermao`, `feimao`, `guangnian`, `guangsuyun`, `jilian`, `kexin`, `kuaili` [未在31家清单], `lingmao`, `quanqiu`, `sujie`, `weitu`, `xingdaomeng`, `yifan`, `yuzhou`）；
   - 1 张 `weifeng-20260811.png`（图内真实时间戳为 **`2026-07-19 18:38:20 CST`**，Miaoko Vless 50/50）；
   - 2 张无忧链接（`wuyou-1.jpg` 测试时间 **`2026-07-18 21:40:48 CST`**；`wuyou-2.jpg` 测试时间 **`2026-07-18 21:47:23 CST`**）。
2. **光速云独立证据目录 (`docs/public/images/evidence/guangsuyun/`)**：共 **5 个文件**
   - `guangsuyun-miaoko-cmcc-gx.jpg`（广西移动@2Gbps，62/62 Shadowsocks）
   - `guangsuyun-miaoko-telecom-cs.jpg`（长沙电信@2Gbps，62/62 Shadowsocks）
   - `guangsuyun-miaoko-unicom-hb.jpg`（河北联通@2Gbps，62/62 Shadowsocks）
   - `guangsuyun-miaoko-speed-zh.jpg`（珠海联通 9Gbps 单线程，70/70 Vless）
   - `guangsuyun-miaoko-streaming-ai.jpg`（珠海联通 9Gbps 单线程，70/70 Vless + AnyTLS 流媒体与 AI 解锁）
   - **审计注意**：这 5 张 JPG 底部均未印出具体测试日期时间戳，仅按归档批次记录为 `2026-08-19`，已在 `speedtest-manifest.json` 标注 `dateConfidence: "archive-folder-only"`。
3. **品牌 Logo (`docs/public/images/logos/`)**：共 **18 个文件**
   - 已有 Logo（18 家）：`edgenova, ermao, feimao, firefly, guangnian, guangsuyun, jilian, lingdong, quanqiu, sogo, sujie, tiziyun, u1s1, weitu, xingdaomeng, yifan, yinxingren, yuzhou`。
   - 缺失本地 Logo（13 家）：`weifeng, wuyou, muguang, lingmao, kexin, shanyue, shandianshu, dalaoyun, yunjiexian, liulianyun, shenxing, huanqiuti, langwang`（已在 `data/brands.json` 中设 `"logo": null` 并标记 `missing-logo`）。
4. **第三方客户端 (`data/clients.json`)**：
   - 原始文件《第三方代理客户端.txt》仅标注 `GitHub`、`App Store`、`官网`、`官方文档`，未提供具体 URL，故 `officialUrl` 全部设为 `"待核实"`。
   - 完整保留了 4 项关键风险与兼容性警告：`Mihomo Party` 维护状态待核实、`NekoBox for Android` 切勿使用已被第三方控制的 Google Play 版本、iOS 客户端（Shadowrocket/Stash/Quantumult X/Surge）付费与地区属性、`Nikki` 明确要求 `OpenWrt 24.10` 及以上版本。
