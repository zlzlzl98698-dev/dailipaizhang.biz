# 10 大一级专题首页关键词地图与意图边界 (Pillar Keyword Map)

- **更新日期**：`2026-11-23`
- **防互抢原则**：每个一级专题锁定唯一 `primaryKeyword` 与独立搜索意图主权；与其他一级专题、60 个二级专题、31 个品牌页及 24 篇排障文章保持零同词竞争（经 `npm run audit:keywords` 验证 129 页 0 冲突）。

---

## 一、一级专题主关键词与意图边界矩阵

| 专题 | 真实路由 | 主关键词 (primaryKeyword) | 核心/次级关键词簇 | 关联实体 (Entities) | 搜索意图定位 | 与相邻专题的边界划分 |
|---|---|---|---|---|---|---|
| **机场推荐** | `/airport/` | `机场推荐知识地图` | 机场推荐、机场排行、靠谱机场、稳定机场、好用的机场、性价比机场推荐 | 光速云、飞猫云、微风网络、星岛梦、IEPL、VLESS、专属客户端 | 综合候选筛选与多维选型比较 | 只讲“怎么按场景选哪家及证据分级”，具体单价核算交由 `/pricing/`，单品牌深度档案交由 `/brands/{slug}/` |
| **价格与套餐** | `/pricing/` | `机场价格与套餐` | 便宜机场、一元机场、一分机场、月付机场、不限时机场、年付折算月价 | 每GB成本、线路倍率、年付轻量包、一次性流量包、优惠码冲突 | 计费周期核算、预算匹配与隐性成本拆解 | 专注“价格公式、折算还原与各档位花费”，不重复 `/airport/` 的线路原理与品牌综合推荐榜 |
| **机场品牌** | `/brands/` | `机场品牌库` | 机场品牌、机场品牌库、机场评测、品牌官网核验、品牌优惠码、品牌替代 | 31家去重品牌、快狸(待补证据)、AFF推广链接、六级证据状态 | 品牌档案检索、资料完整度核查与真伪辨别 | 承担“全量品牌数据库与证据审计索引”，具体购买决策由 `/airport/` 承接 |
| **VPN 与加速器** | `/vpn/` | `VPN与加速器` | VPN推荐、免费VPN、手机VPN、安卓VPN、Windows VPN、游戏加速器 | WireGuard、OpenVPN、VpnService、NetworkExtension、UDP FullCone NAT | 产品类别比较（传统VPN vs 代理机场 vs 游戏加速器） | 聚焦三类工具底层架构与平台机制差异，具体客户端安装配置交由 `/clients/` 与 `/guides/` |
| **客户端软件** | `/clients/` | `代理客户端下载与选型` | Clash Verge Rev、Clash Meta、v2rayN、v2rayNG、Shadowrocket、Mihomo、sing-box | FlClash、Hiddify、Karing、NekoBox、OpenClash、PassWall2、Nikki | 六大操作系统代理客户端选型与协议兼容矩阵 | 聚焦“选哪个软件、架构匹配与维护安全警示”，具体分步导入操作交由 `/guides/` |
| **AI 与流媒体** | `/ai-media/` | `AI与流媒体解锁` | ChatGPT机场、Claude机场、Gemini机场、Netflix解锁、YouTube送中、流媒体解锁 | OpenAI仅APP(HK)、Anthropic风控、原生IP、商宽/机房IP、IPRisk、Miaoko | AI生产力工具与海外流媒体区域兼容性验证 | 聚焦“解锁判定机制与实测兼容对比”，底层物理专线原理交由 `/routes/` |
| **线路与节点** | `/routes/` | `机场线路与节点` | IEPL专线、IPLC专线、香港节点、日本节点、低延迟节点、线路倍率、机场测速 | BGP中转、TLS RTT、HTTPS Ping、MAI-TEST-BOT、32线程测速、FullCone | 网络传输架构、地区路由特性与测速报告解读 | 聚焦“线路技术原理与如何读懂测速图”，故障断网修复交由 `/troubleshooting/` |
| **使用教程** | `/guides/` | `代理客户端使用教程` | 机场订阅教程、Clash配置、客户端安装、分流规则、TUN模式、DNS与Fake-IP配置 | Base64、Clash YAML、sing-box JSON、Rule/Global/Direct、198.18.0.1 | 从零准备到全平台导入与验收的分步任务指南 | 聚焦“正常配置标准 SOP 与高风险操作回滚”，异常报错诊断交由 `/troubleshooting/` |
| **故障排查** | `/troubleshooting/` | `代理故障排查` | 节点超时、订阅失败、连接不上、DNS错误、客户端无法启动、HTTP 200空订阅 | 401/403/404/503、TUN无效、WebView2、YAML报错、时间不同步、UDP阻断 | 故障症状分流、五层原因剥离与实操修复入口 | 作为全站排障中枢承接一切报错词，解决后再按需导向 `/guides/` 或 `/security/alternatives/` |
| **风险与替代** | `/security/` | `机场风险与安全避坑` | 机场跑路、机场避坑、机场替代、机场退款、机场安全性、订阅Token泄露 | 失联前兆、5.6元同质集群、闭源专属端边界、重置订阅链接、沉没成本 | 运营风险识别、止损取证、隐私防护与替代迁移 | 聚焦“售前防坑、售后止损与安全边界”，常规正向选型交由 `/airport/` |
