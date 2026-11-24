# 二级专题与三级内容集群映射表 (Secondary Topic Clusters)

- **统计日期**：`2026-11-23`
- **集群规模**：基于 [topic-map.json](../data/topic-map.json) 共规划 **120 个三级集群**（每个二级专题配置 2 个以上独立搜索需求集群），已落地的 24 篇排障实战指南与 31 篇品牌评测均已完成上下游归属挂载。

## 一、已落地三级页面（24 篇排障指南 + 31 篇品牌详情页）与二级专题映射

- `/troubleshooting/subscription-failure/` 承接：`sub-http-200-empty`、`sub-http-401-403-404-503`、`sub-tls-dns-timeout`、`shadowrocket-import-rules`、`cross-client-inconsistency`
- `/troubleshooting/timeout/` 承接：`nodes-all-timeout`、`nodes-partial-region-timeout`、`quota-expired-vs-stale-config`
- `/troubleshooting/cannot-connect/` 承接：`connected-no-internet`、`specific-sites-unreachable`、`tun-not-working`、`tun-vs-system-proxy`、`v2rayn-system-proxy-fail`、`android-v2rayng-clash-disconnect`、`time-sync-tls-cert-error`
- `/troubleshooting/dns-error/` 承接：`fake-ip-explained-fix`、`dns-leak-hijack-fix`
- `/troubleshooting/app-not-starting/` 承接：`clash-verge-startup-fail`、`clash-verge-mihomo-yaml-fail`、`v2rayn-core-load-fail`、`client-migration-backup`
- `/troubleshooting/slow-network/` 承接：`udp-nat-firewall-blocks`、`high-latency-packet-loss-peak`、`bandwidth-multiplier-speedtest-diff`
- `/brands/directory/` & `/brands/reviews/` 承接：全部 **31 家去重品牌独立详情评测页**（`/brands/{slug}/`）。

## 二、全站 120 个三级选题集群结构清单

| 集群 ID | 所属二级专题 | 集群名称 | 规划选题数 |
|---|---|---|---:|