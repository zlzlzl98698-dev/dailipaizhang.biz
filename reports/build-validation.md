# 构建与 QA 验收报告 (Build & QA Validation Report)

- **验收日期**：`2026-11-23`
- **运行环境**：Windows (PowerShell)，Node.js `v24.19.0`，VitePress `1.6.4`，Pagefind `1.6.0`
- **验收命令**：`npm run build` 后执行 `npm run qa`

---

## 一、生产构建与 Pagefind 索引结果 (`npm run build`)

执行命令：`vitepress build docs && pagefind --site docs/.vitepress/dist --output-subdir pagefind`

| 检查项 | 实测结果 |
| --- | --- |
| VitePress 静态构建 | 成功退出（Exit code `0`，耗时 `10.39s`），产出 `docs/.vitepress/dist/` |
| HTML 页面总数 | `130` 个 HTML 文件（`129` 个可索引内容页 + `404.html`） |
| Pagefind 索引构建 | 成功退出（耗时 `1.644s`） |
| Pagefind 索引语言与规模 | `zh-cn`：`129` 页、`45,057` 词；`dist/pagefind/` 共 `172` 个文件（`2,202,833` 字节） |
| 核心静态部署文件 | `robots.txt`、`sitemap.xml`、`.htaccess`、`favicon.svg`、`404.html`、`pagefind/` 均已就位 |

---

## 二、全量 QA 自动化校验结果 (`npm run qa`)

执行命令：`node scripts/run-qa.mjs`（总耗时 `1886ms`，Exit code `0`，**0 errors / 0 warnings**）

| 校验模块 | 状态 | 核心实测指标 |
| --- | --- | --- |
| `audit:urls` | **PASS** | `markdownPages: 129`、`pillarRoutes: 10`、`secondaryRoutes: 60`、`brandPagesFound: 31`、`troubleshootingArticles: 24`、`internalLinksChecked: 1287`、`sitemapUrls: 129`、`canonicalsChecked: 129`（0 错误、0 警告） |
| `audit:keywords` | **PASS** | `indexablePages: 129`、`uniqueTitles: 129`、`uniqueDescriptions: 129`、`uniqueH1s: 129`、`uniquePrimaryKeywords: 129`、`keywordMatrixRows: 838`、`uniqueMatrixUrls: 426`、`cannibalizationConflicts: 0`（0 错误、0 警告） |
| `audit:brands` | **PASS** | `totalBrands: 31`、`expectedBrandsPresent: 31`、`affiliateHostsTracked: 31`、`unverifiedBrandsAnnotated: 31`、`markdownFilesScanned: 129`、`builtAffLinksChecked: 40`、`builtBrandPagesChecked: 31`（0 错误、0 警告） |
| `validate:jsonld` | **PASS** | `htmlPagesScanned: 130`、`totalJsonLdScripts: 417`、`validJsonLdScripts: 417`、`faqPagesChecked: 128`、`faqQuestionsChecked: 307`（0 错误、0 警告） |
| `validate:links` | **PASS** | `htmlPagesScanned: 130`、`internalLinksChecked: 9479`、`imagesChecked: 224`、`pagefindIndexedPages: 129`、`pagefindTermsTested: 7`、`pagefindTermsMatched: 7`（0 错误、0 警告） |

### 1. JSON-LD Schema 分布明细（`validate:jsonld`）

- `BreadcrumbList`：`128`
- `FAQPage`：`128`（共核验 `307` 条问题与页面可见正文一致）
- `Article`：`69`
- `TechArticle`：`59`
- `HowTo`：`24`
- `SoftwareApplication`：`5`
- `ItemList`：`2`
- `Organization`：`1`
- `WebSite`：`1`

### 2. Pagefind 中文检索抽样验证（`validate:links`）

在 Node 中直接加载 `docs/.vitepress/dist/pagefind/pagefind.js` 及其 `.pf_meta` / `.pf_index` / `.pf_fragment` / `wasm.zh-cn.pagefind` 分片对 **7 个中文关键词**执行真实检索并校验首条分片数据返回（`7/7` 命中）：

- `订阅`
- `超时`
- `光速云`
- `小火箭`
- `分流`
- `节点`
- `DNS`

---

## 三、待后续人工复核事项（不阻断当前静态发布）

以下数据层审计遗留项已在页面与 `data/` 中如实标注 `"待核实"` 或 `"暂无可复核实测记录"`，详见 [pending-evidence.md](file:///c:/Users/Pro%20User/Desktop/dailipaizhang.biz/reports/pending-evidence.md)：

1. 31 家品牌官方非推广主域名（`officialUrl`）当前统一标注 `"待核实"`，所有对外注册入口均通过 `data/links.ts` 输出带 `rel="nofollow sponsored noopener noreferrer"` 的推广链接并附披露。
2. 24 款第三方客户端的 GitHub/商店直链（`data/clients.json`）当前标为 `"待核实"`。
3. 测速压缩包中出现但未入 31 家清单的「快狸 (`kuaili`)」已隔离归档，未混入正式品牌库。
