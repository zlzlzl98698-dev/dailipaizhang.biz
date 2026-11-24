# 「代理排障 (dailipaizhang.biz)」项目实现报告 (Implementation Report)

- **报告日期**：`2026-11-23`
- **项目定位**：面向中文用户的代理客户端故障诊断与网络工具知识库（Warm White Diagnostic Knowledge Base）
- **生产构建输出**：`docs/.vitepress/dist/`（纯静态 HTML/CSS/JS + Pagefind 离线索引，可直接部署至 Apache 2.4）

---

## 一、信息架构与页面交付总览

全站共落地 **129 个可索引 Markdown 页面**（外加定制中文 `404.html`），按以下模块组织：

| 模块 | 页面数 | 路径与交付内容 |
| --- | --- | --- |
| **首页** | 1 | `docs/index.md` + `HomePage.vue`（Pagefind 搜索、6 个高频故障直达卡片、3 步分流器、修复案例、客户端与知识图谱、证据分级品牌入口、风险提示与披露） |
| **10 大一级专题 + 60 个二级专题** | 70 | 覆盖 `/airport/`、`/pricing/`、`/brands/`、`/vpn/`、`/clients/`、`/ai-media/`、`/routes/`、`/guides/`、`/troubleshooting/`、`/security/` 各 1 个一级首页与 6 个二级专题页（与 `docs/.vitepress/nav.ts` 中 `NAV_CATEGORIES` 1:1 对齐） |
| **31 家去重机场品牌详情/评测页** | 31 | `docs/brands/{slug}/index.md`（覆盖全部 31 个固定去重 slug；每页集成 `BrandEvidencePanel`、`PlanComparisonTable`、`NodeSpeedTable`、`UnlockStatusMatrix`、`AffiliateCta` 与推广披露链接） |
| **故障排查实战文章** | 24 | `docs/troubleshooting/articles/*.md`（覆盖订阅 HTTP 200 空内容、401/403/404/503、TLS/DNS 超时、节点超时、TUN、Fake-IP、DNS 泄漏、Clash Verge/Mihomo、v2rayN、Shadowrocket、Android、时间同步、UDP/NAT、晚高峰丢包、倍率、迁移与跨端差异） |
| **站点治理与透明披露页** | 3 | `docs/disclosure.md`（联盟推广披露）、`docs/methodology.md`（六级证据体系）、`docs/about.md`（关于本站） |

---

## 二、核心数据层与合规设计（`data/`）

1. **品牌与链接单一数据源**：
   - `data/brands.json`（31 个去重独立品牌，保留全部原文价格/流量/优惠码/测速/链接格式冲突于 `conflicts[]`、`officialUrl` 统一设为 `"待核实"`，不将推广地址冒充官网）。
   - `data/links.ts` 导出 `getBrandLink`、`getBrandBySlug` 与 `getAllBrands`，统一输出 `target="_blank"`、`rel="nofollow sponsored noopener noreferrer"` 及联盟披露文案。
   - 正文零硬编码推广域名：所有品牌跳转均通过 `<AffiliateCta slug="..." />` 或站内 `/brands/{slug}/` 链接实现。
2. **客户端、排障与证据清单**：
   - `data/clients.json`：收录 24 款通用第三方客户端与专属客户端分类，保留 `Mihomo Party` 维护警告、`NekoBox` Play 商店控制警告、`Nikki` 对 OpenWrt `24.10+` 要求及 iOS 付费区服说明，未核实仓库均标 `"待核实"`。
   - `data/issue-map.json`：24 个排障场景（含 `os`、`clients`、`httpCodes`、`lowRiskChecks`），与 24 篇实战文章一一对应。
   - `data/source-evidence.json` 与 `data/speedtest-manifest.json`：归档 19 张 `docs/public/images/speedtests/` 与 5 张 `docs/public/images/evidence/guangsuyun/` 图片；将未在 31 家清单内的「快狸 (`kuaili`)」单独隔离至 `reports/pending-evidence.md`。
3. **关键词矩阵与防互抢**：
   - `data/topic-map.json` 规划 10×6×2 共 120 个三级集群（838 条长尾选题）。
   - `scripts/keyword-matrix.mjs` 生成 `data/keyword-matrix.csv`（838 行）、`data/content-backlog.csv`（301 行）与 `data/cannibalization-report.md`，全站 129 个可索引页面 0 孤立、0 同词互抢。

---

## 三、主题、交互组件与部署配置（`docs/.vitepress/` & `docs/public/`）

1. **VitePress 配置与结构化数据（`docs/.vitepress/config.mts`）**：
   - 启用 `lang: 'zh-CN'`、`cleanUrls: true`、官方 `sitemap: { hostname: 'https://dailipaizhang.biz' }`（自动排除 `draft` / `noindex` / `404`）。
   - 按页面 `frontmatter` 与可见内容动态注入每页独立的 `canonical`、OpenGraph 与 JSON-LD（`Organization`、`WebSite`、`BreadcrumbList`、`Article`、`TechArticle`、`SoftwareApplication`、`FAQPage`、`HowTo`、`ItemList`），并在 `transformHtml` 注入 `data-pagefind-body`。
2. **Warm White 主题与 15 个注册组件（`docs/.vitepress/theme/`）**：
   - 双层头部导航 `SiteHeader.vue`（一级文字真实可点击 + 二级下拉/全部分类弹出层/移动端手风琴 + Esc 关闭）、`SiteFooter.vue`、`NotFoundPage.vue`、`ImageLightbox.vue`。
   - 检索与交互诊断组件：`PagefindSearch.vue`、`DiagnosticTriage.vue`、`IssueDecisionTree.vue`、`BrandDirectory.vue`、`ClientMatrix.vue`。
   - 实验室数据与披露组件：`BrandEvidencePanel.vue`、`PlanComparisonTable.vue`、`NodeSpeedTable.vue`、`UnlockStatusMatrix.vue`、`NetworkRouteDiagram.vue`、`SourceBadge.vue`、`EvidenceNote.vue`、`AffiliateCta.vue`。
3. **Apache 2.4 静态部署与检索（`docs/public/`）**：
   - `.htaccess` 配置 `Options -Indexes -MultiViews`、`DirectoryIndex index.html`、`ErrorDocument 404 /404.html`、仅针对真实 `.html` 文件（`RewriteCond %{DOCUMENT_ROOT}%1.html -f`）的 `cleanUrls` 重写、安全响应头与 gzip/brotli 压缩，绝不把缺失路径重写回首页返回 HTTP 200。
   - `robots.txt`、`favicon.svg` 均位于 `docs/public/` 并在构建后直出至 `dist/`。

---

## 四、自动化 QA 工程体系（`scripts/`）

- `scripts/qa-utils.mjs`：共享零依赖 ESM 工具模块（YAML frontmatter 解析、CSV 解析、HTML 可见文本提取、路由归一化）。
- `scripts/audit-urls.mjs`：校验 10×6 导航结构、31 品牌页、24+ 排障文章、治理页、无重复路由、无孤立页、Markdown 内链与构建后 `canonical` vs `sitemap.xml` 一致性。
- `scripts/audit-keywords.mjs`：校验全站可索引页面的 `title`、`description`、`H1`、`primaryKeyword` 非空与全站唯一性，并审计 `keyword-matrix.csv` 的同词互抢与页面覆盖度。
- `scripts/audit-brands.mjs`：校验 31 品牌完整性、禁止在 Markdown 正文中硬编码 AFF 域名/注册参数、核对 `data/links.ts` 与构建产物中的 `rel="nofollow sponsored noopener noreferrer"`、`target="_blank"` 及推广披露与证据状态标注。
- `scripts/validate-jsonld.mjs`：解析 `dist/**/*.html` 全部 JSON-LD，验证语法、`@context`、`@type` 及 `FAQPage` 问题文本与页面可见内容的一致性。
- `scripts/validate-links.mjs`：全量扫描 `dist/**/*.html` 的内链（非 404）、空/占位 `href`（`""` / `"#"`）、图片资产存在性、部署文件完整性，并在 Node 中加载 `dist/pagefind/` 对 7 个中文检索词执行真实检索验证。
- `scripts/run-qa.mjs`：串联全部 5 项校验（支持 `--prebuild` 模式与全量 `dist` 模式）并输出结构化摘要。
