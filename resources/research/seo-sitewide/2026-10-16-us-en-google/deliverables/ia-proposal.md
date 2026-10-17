# 全站 Topic Map 信息架构建议

## 建议原则

- 首页与 `/products` 清楚讲明峰徊海外项目接口与四条并列产品线；不把全站收束成 forged wheels 或 aluminum components。
- 每条线保留自己的核心入口；Wheel catalog、flow-formed、custom forged、EV housings、custom aluminum、self-sealing tires 彼此按真实供货关系链接。
- SEO 增长内容通过已有产品页、资源文章或工具支持核心询盘；Topic Map 是路线图，不等于要一次性建设全部新 URL。
- 把真实业务证明、索引批准、媒体图权和内容审核作为发布 gate。

## 主题树（建议层级）

```text
首页：Fenghuai 海外汽车零部件项目入口（品牌英文身份待批准）
├── Products
│   ├── Automotive Wheels
│   │   ├── Wheel Catalogue → verified SKU/spec only
│   │   ├── Flow-Formed Wheels → process/product page
│   │   ├── Custom Forged Wheels → development/inquiry (not inventory)
│   │   └── Dealer / Private Label → defer until program and EN page approved
│   ├── EV Aluminum Components
│   │   ├── Motor Housing → module now; standalone candidate after evidence gate
│   │   └── Inverter/Controller Housing → defer until housing-specific intent + entity proof
│   ├── Custom Aluminum Manufacturing → noindex until business/publication gate
│   │   └── Drawing / 3D / Sample RFQ → conversion module, no unsupported process list
│   └── Self-Sealing Tires
│       ├── Product / Supplier Page
│       └── Mechanism & Limits → reviewed supporting article or module
├── Resources / Tools
│   ├── Wheel Offset Calculator + reviewed explanation
│   └── Bolt Pattern Guide (choose one canonical home; dedupe Insights route)
└── Request a Quote → project-specific inputs and reviewed intake boundary
```

## 先后建议（不做综合加权分）

1. **先保证定位与结构**：首页、产品总览和每线核心页的产品身份、核心能力、买家场景、证据和 CTA。即使当前没有 volume 数据也不能以此跳过。
2. **处理阻断项**：Fitment 全部 `verified:false` 仍可索引/sitemap；先修索引门槛。更新英文 `self-sealing` 术语，并核对轮毂页面、工具 canonical 与 `/capabilities` / `/manufacturing` 主题重叠。
3. **先做低新增成本内容**：在现有页面补足已验证的规格解释、按图/项目输入、轮胎机制边界；建立私牌和经销页面的批准条件。
4. **增长候选分批试做**：private label wheels、wheel offset guide、self-sealing mechanism、drawing-led RFQ 模块、EV motor housing 内容模块。均先过业务事实与页面审核；EV inverter housing、generic OEM wheel supplier 暂缓。
5. **数据允许时再复评**：获得 GSC 授权后，用真实 impressions/query/page 数据更新地图；如采用其他市场、API 或 provider，建立独立 run 并明确预算授权。

## 导航和链接

- 四条线在主导航/产品总览保持并列。首页的通用询盘入口与四线页的产品化 CTA 均可去 `/request-a-quote`，但 CTA 文案按页面任务。
- 轮毂目录链接到 offset/PCD 指南只用于教育/规格，不能声称具体 fitment 通过。
- 自密封机制文章回链产品页；供应商识别页不可承担通用轮胎维修建议。
- 按图 RFQ 说明回链定制铝件和询盘页；提交图纸的隐私与上传能力未审核前不得承诺安全上传。
- 定制开发作为跨线流程入口，不与各产品线工艺页争同一 query。
