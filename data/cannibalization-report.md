# 关键词冲突与同词互抢审计报告 (Cannibalization Report)

- **审计生成日期**：`2026-11-23`
- **数据源**：`data/topic-map.json`、`data/keyword-matrix.csv`、`docs/**/*.md`
- **一级专题数**：`10`
- **二级专题数**：`60`
- **三级主题集群数**：`120`
- **总关键词行数**：`945`（已上线 `published`: `646` 行；规划储备 `planned`: `299` 行）
- **覆盖唯一目标 URL 数**：`505`
- **同词互抢冲突数（同一 normalized_keyword 指向多个 primary_url）**：`0`

---

## 一、同词互抢检测结果 (Exact & Normalized Keyword Collisions)

> **[PASS] 零冲突**：全部 `945` 条关键词在归一化（`normalized_keyword`）后均唯一映射至单一 `primary_url`，不存在多个页面争抢同一主关键词或长尾词的情况。

---

## 二、页面意图边界与防互抢架构规则

1. **品牌评测页 (`/brands/{slug}`) vs 品牌对比/目录页 (`/brands/directory/`, `/brands/reviews/`)**
   - 单品牌详情页只承接「品牌名 + 评测 / 怎么样 / 套餐价格 / 优惠码核实 / 实测图解读」实体意图（如 `/brands/guangsuyun` 承接光速云 59GB vs 69GB 冲突与 Miaoko 三网截图）。
   - 横向筛选与多品牌对比意图统一归口至 `/brands/directory/`、`/brands/promotions/`、`/brands/official-sites/`、`/brands/incidents/` 与 `/brands/alternatives/`，防止单品牌页互相堆砌其他品牌主词。

2. **5.6 元同质化集群（闪电鼠 / 大佬云 / 云界线 / 榴莲云 / 环球梯）边界隔离**
   - 每个单品牌页聚焦各自独有审计特征：
     - `/brands/shandianshu`：5.6 元档基准参照与 `sd88`；
     - `/brands/dalaoyun`：详表 #5 与总表 #22 编号跳号错位记录；
     - `/brands/yunjiexian`：总表 `HBaZ91c6` vs 详表 `aycnwNUi` 双码冲突及缺少 `#`；
     - `/brands/liulianyun`：5.6 元档唯一协议未明及 `#/` 前缺少 `/`；
     - `/brands/huanqiuti`：`HQ66` 优惠码与缺少 `#`。
   - 跨 5 家的共性对比词统一收敛至 `/pricing/budget/` 与 `/brands/incidents/`。

3. **教程页 (`/guides/*`) vs 实战故障排查页 (`/troubleshooting/articles/*`)**
   - `/guides/*` 承接「正向配置与架构理解」意图（如如何导入订阅、如何配置 Fake-IP、如何区分 macOS Intel/Apple Silicon 安装包）。
   - `/troubleshooting/articles/*` 承接「具体报错状态码与异常症状修复」意图（如 `HTTP 200 空订阅`、`401/403/404/503`、`198.18.0.1 残留断网`、`Timeout -1ms`、`0B 节点`）。

4. **站点索引覆盖率核查**
   - 全站所有可索引专题页（10 个一级、60 个二级）、31 个品牌页与 24 篇排障文章均已在 `data/keyword-matrix.csv` 中建立主 URL 映射，无孤立页面（Orphan Pages）。
