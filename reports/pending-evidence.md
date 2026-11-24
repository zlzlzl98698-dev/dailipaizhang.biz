# 待补充与待核实证据清单 (Pending Evidence & Verification Backlog)

- **记录更新日期**：`2026-11-23`
- **用途**：跟踪所有在原始输入资料中缺失、冲突、截断或尚未完成独立交叉验证的证据项。在以下条目补齐并由人工复核转为 `approved` 前，前端组件与页面必须如实呈现「待核实 / 暂无可复核实测记录 / 品牌资料宣称」，不得臆造补全。

---

## 一、测速包出现但未入 31 家品牌清单的独立实体：「快狸 (`kuaili`)」

| 字段 | 当前掌握证据 | 缺失待补内容 |
|---|---|---|
| **实体名称** | 快狸 (`kuaili`) | 品牌正式全称、别名及是否在运营 |
| **本地实测资产** | `/images/speedtests/kuaili-20260811.png`（来自 `16个机场测速图_2026-08-11_实测版.zip`） | 无流媒体与 AI 解锁独立测试图 |
| **实测时间与环境** | `2026-08-11 19:52:22 (CST)`；主端 `4.3.3 (696)` / 喵速 `4.7.0 (A11-32)` 珠海联通 9Gbps 32 线程，共 50/50 节点 | 测试执行人、节点筛选规则 |
| **图中协议与表现** | 协议：`Vless`；香港 01–15 均速 `505.02–550.88MB/s`（FullCone）；新加坡 `145–419MB/s`（但 **`新加坡 | Singapore08` 仅 `9.60KB / 96.00KB`**，UDP Unknown）；日本 `106–189MB/s`；台湾 `47–90MB/s`；美国 `8.63–13.89MB/s` | 缺少晚高峰跨日复测 |
| **商业与基础档案** | **完全缺失**（未出现在《32家机场品牌清单.txt》中） | 官方网站、推广链接、开业年份、套餐价格表、优惠码、客户端支持与退款规则 |

> **处置状态**：已在 `data/source-evidence.json` 与 `data/speedtest-manifest.json`（`inBrandRoster: false`, `reviewStatus: "pending-evidence"`）单独归档，未混入 `data/brands.json` 的 31 个正式品牌中。

---

## 二、31 家入库品牌的待核实核心字段

### 1. 官方网站主域 (`officialUrl`) — 全部 31 家均待核实
- 原始清单提供的 31 条链接全部为带 `?code=` 的推广注册地址（`*aff.com`、`*aff.cc` 等）。
- 为遵守「绝不把 AFF 链接标为官网」的审计铁律，31 个品牌的 `officialUrl` 均保持 `"待核实"`，待后续采集各品牌非推广主域名并完成可用性与证书校验后方可填入。

### 2. 缺失本地品牌 Logo 的 13 个品牌 (`logo: null`)
以下 13 个品牌在 `docs/public/images/logos/` 中暂无本地图标文件（前端组件已使用品牌首字与 `accent` 识别色安全降级）：
- `weifeng`（微风网络）、`wuyou`（无忧链接）、`muguang`（暮光加速）、`lingmao`（灵猫网络）、`kexin`（可信云）、`shanyue`（闪跃）、`shandianshu`（闪电鼠）、`dalaoyun`（大佬云）、`yunjiexian`（云界线）、`liulianyun`（榴莲云）、`shenxing`（神行加速）、`huanqiuti`（环球梯）、`langwang`（浪网）。

### 3. 缺乏本地独立测速截图 (`no-measured-screenshot`) 的 14 个品牌
以下品牌目前仅有商家资料/历史文本（或 `2026-10-19` 无来源表格），无本地保留的 `MAI-TEST-BOT` 或 `Miaoko` 原始测速图片：
- **主表品牌（11 家）**：`firefly`（Firefly）、`muguang`（暮光加速）、`shanyue`（闪跃）、`shandianshu`（闪电鼠）、`dalaoyun`（大佬云）、`yunjiexian`（云界线）、`liulianyun`（榴莲云）、`shenxing`（神行加速）、`huanqiuti`（环球梯）、`yinxingren`（隐形人，10-19 表格亦全空）、`tiziyun`（梯子云）。
- **后附历史品牌（3 家）**：`lingdong`（灵动云，仅有 2026-07-20/21 文字测试摘要，无本地原图）、`langwang`（浪网，原资料明确标注未实测）、`edgenova`（边缘节点 EdgeNova，未提供逐地区测速）。

### 4. 套餐表不完整或截图遮挡的 14 个品牌
- **仅有一档入门价、缺完整梯度套餐表（11 家）**：`jilian`（极连云 18元/100G）、`guangnian`（光年梯 18元/110G）、`kexin`（可信云 25元/150G）、`sujie`（速界 25元/150G）、`shandianshu`（闪电鼠 年付约5.6元/月）、`dalaoyun`（大佬云 年付约5.6元/月）、`yunjiexian`（云界线 年付约5.6元/月）、`liulianyun`（榴莲云 年付约5.6元/月）、`shenxing`（神行加速 年付约14元/月）、`huanqiuti`（环球梯 年付约5.6元/月）、`tiziyun`（梯子云 年付约7.4元/月）。
- **当期套餐完全待补充（1 家）**：`yuzhou`（宇宙云，仅有历史起价 ¥96/年，月流量未知）。
- **历史截图字段遮挡（2 家）**：`lingdong`（灵动云·至尊私人定制 ¥620/月 流量字段标注「截图遮挡」）、`langwang`（浪网 入门档流量标注「截150G」且设备限制被遮挡）。

---

## 三、待人工复核的冲突项与图片时间戳缺口

1. **图片时间戳与命名复核**：
   - `docs/public/images/speedtests/kexin-20260811.png`：图底右侧仅显示 `15:32:35 (CST)`，完整年月日被裁切未显示，需核对 `2026-08-11` 原始测试日志。
   - `docs/public/images/evidence/guangsuyun/` 下 5 张 Miaoko 截图（`cmcc-gx`、`telecom-cs`、`unicom-hb`、`speed-zh`、`streaming-ai`）：图内底部均无时间戳行，当前按归档目录标记为 `2026-08-19` 批次，需补充原始任务导出时间。
   - `docs/public/images/speedtests/weifeng-20260811.png`：文件名含 `20260811`，但图内实际打印时间为 `2026-07-19 18:38:20 (CST)`，引用时必须以图内真实时间 `2026-07-19` 为准。
2. **双优惠码与无优惠码冲突复核**：
   - `lingmao`（`lmao888` vs `lingmao`）、`yinxingren`（`yxr888` vs `moon80`）、`yifan`（`yfy6666` vs `1FLYYUN`）、`sogo`（`sss777` vs `SOGO10000`）、`quanqiu`（`qqy7777` vs `qq88`）、`muguang`（`muguang5555` vs 正文“未查到公开优惠码”）。
3. **推广注册链接异常与双邀请码复核**：
   - `yunjiexian`（详表 `aycnwNUi` vs 总表 `HBaZ91c6`，且均缺少 `#`）、`huanqiuti`（缺少 `#`）、`liulianyun`（`#/` 前缺少 `/`）、`firefly`（主表 `2n7VURre` vs 历史表 `jTp9wSgZ`）。
4. **套餐价格与流量口径复核**：
   - `guangsuyun`（轻量版 59GB vs 69GB/月）、`weifeng`（基础数据 7元/月 50GB vs 套餐表清风 ¥137/年 100GB）、`lingmao`（基础数据 19元/月 150GB + 不限时 vs 套餐表月付 ¥25 且无不限时）、`yinxingren`（基础数据 24元/100GB vs 套餐表白银纪元 ¥24/144GB）、`u1s1`（正文提 1000GB 一次性包但套餐表未列）。
5. **第三方客户端官方仓库/商店链接复核**：
   - `data/clients.json` 中 24 款客户端的具体 GitHub 仓库 URL、App Store ID 与官方文档地址待人工核验签名后填入，当前一律保持 `"待核实"`。
