# JEV SEO 与代码关键词证据审计

**日期**：2026-10-12  
**对象**：峰徊四产品线 Next.js 前端与 9080 预发布快照  
**输入**：`docs/research/关键词调研报告-峰徊四线.md`、当前代码、`jev-seo` 标准审计  
**审计范围**：关键词与实际能力是否一致、页面是否承接正确意图、索引/canonical/sitemap 基础信号、竞品和未经确认主张风险

## 结论

当前不能把站点理解为“锻造轮毂站”。调研报告给出的正确定位是“多线 OEM/ODM 铝制汽车零部件与自密封轮胎供应方”。代码中仍有一组旧的轮毂中心词、过期数量和未经核验的车型适配入口，必须在正式开放索引前收敛。

本轮没有发现需要立即新增关键词的理由。优先级是删除或改写证据不足的词，再开放已经有页面和数据承接的词。

## JEV 审计结果

审计命令使用本机 `/Users/fkycoya/.config/alma/tools/jev-seo/bin/jevseo`，对象为公开的 `http://119.91.205.130:9080` 预发布入口，未使用收费的 DataForSEO 全量模式。

| 项目 | 结果 | 解释 |
|---|---:|---|
| JEV 总分 | 20/100，F | 被全站 noindex 硬封顶，不代表关键词相关性得分 |
| 抓取 | 60 个 URL，60 个 HTML 页面 | 达到本次 60 页上限，sitemap 声称有 156 个 URL |
| JEV 语义判断 | 1 个页面，18 个 typed judgments | 由于预发布 noindex，不能代表所有产品页的语义质量 |
| 规则发现 | 12 项 | 其中不少来自预发布环境或查询参数页 |
| PageSpeed | 未运行 | 本轮显式关闭，不能对 Core Web Vitals 下结论 |
| DataForSEO | 未运行 | 没有搜索量、排名、KD、竞品或反链数据 |
| JEV 成本 | $0.0002 | 来自工具 ledger |

工具环境说明：本机 `jevseo doctor` 和 PDF 导出因 WeasyPrint 缺少 macOS Pango 动态库失败；审计本身、digest、Markdown 和 Excel action tracker 已成功生成。本报告不把 PDF 缺失当成网站 SEO 问题。

### JEV 结果中必须区分的内容

1. `JEV-001` 的 60 页 noindex 和 `JEV-004` 的 sitemap noindex 警告，主要反映 9080 预发布返回的 `X-Robots-Tag: noindex, nofollow`。这是预发布隔离信号，正式上线前必须重新核对，但不能把它误判为生产代码已经决定全站不收录。
2. `JEV-002` 的 HTTP、HTTPS 警告针对 9080 IP 预发布入口。正式域名必须使用 HTTPS，并做一跳收敛。
3. `JEV-006`、`JEV-007`、`JEV-008` 主要命中 `/request-a-quote` 的不同查询参数。它们都 canonical 到同一询盘页，且页面意图相同，不能为了消除工具提示而给每个参数组合制造不同标题或正文。
4. `JEV-012` 报告 Product 缺少 offers、review 或 aggregateRating。项目明确没有公开价格、库存、评价或聚合评分，不能为了通过结构化数据检查而编造这些字段。当前无 Offer 是正确的证据纪律。

## 代码中确定存在的关键词问题

### P0：车型适配词已经可索引，但工程数据全部未核验

- `src/content/fitment.ts:25` 注册 BMW M、Mercedes-AMG、Audi RS 三个入口；车型记录的 `verified` 在 `src/content/fitment.ts:40` 等处均为 `false`。
- `src/app/fitment/[platform]/page.tsx:38` 输出 `Forged Wheels - Fitment & Design` 标题，且没有 `robots: noindex` 或 canonical。
- `src/app/fitment/page.tsx:12` 也把入口命名为 `Vehicle Fitment - Forged Wheels by Platform`。
- `src/app/sitemap.ts:107-111` 无条件把 `platformFitments` 加入 sitemap。

这与调研报告中“车型词整类出局，直到工程签字”的结论冲突。页面可以保留为内部或待核验内容，但正式公开索引前必须同时满足：平台页 `noindex, follow`、不进 sitemap、所有实际车型规格通过工程核验后再解除门槛。不要用页面中的免责声明抵消可索引状态。

### P0：主页和产品总览仍把“forged wheels”写成主产品

- `src/content/homepage-hero.ts:21` H1 回退值是 `Forged Wheels & Automotive Components`。
- `src/content/homepage-hero.ts:25` 使用 `self-healing tires`，但产品内容和调研采用的是 self-sealing。
- `src/content/homepage-hero.ts:63-66` 写有 `1018 catalogue models`、`off-road and HP fitments`。
- `src/app/products/page.tsx:16` 和 `src/app/layout.tsx:54` 把四线描述写成包含 `forged wheels` 与 `self-healing safety tires`。
- `src/content/site.ts:18-20` 把四条线概括为 `Aluminum components`，但其中一条是自密封轮胎，不是铝制品。

当前公开轮毂发布镜像 `src/content/wheel-publication.json:5` 的 `count` 是 138，且调研实测公开工艺标签中 forged 为 0。锻造词可以留在“custom forged wheel program”、OEM/ODM 和 private label 页面，但不能继续作为整个站点和目录的默认产品身份。`1018`、`off-road and HP fitments` 也没有与当前公开发布集合及已核验 fitment 数据对齐。

### P1：可以承接的关键词页被英文 noindex 挡住

以下页面在调研报告中属于可承接或已有内容基础的页面，但当前源代码仍声明英文页面 noindex：

- `src/app/dealers/page.tsx:21`
- `src/app/dealers/private-label/page.tsx:25`
- `src/app/insights/page.tsx:24`
- `src/app/insights/bolt-patterns/page.tsx:22`

这会阻断 `wholesale alloy wheels distributor program`、`private label wheels manufacturer`、`wheel offset explained`、`5x114.3 wheels` 等意图。这里不能直接批量删除 noindex，需先在英语内容审批矩阵中确认哪些页面已经达到公开条件，再逐页开放。未批准的中文、西班牙语、泰语仍应保持 noindex。

### P1：多个可索引候选页缺少 self-canonical

JEV `JEV-010` 发现 17 个页面没有 canonical。源代码中可以直接确认的候选包括：

- `src/app/products/page.tsx:10-17`
- `src/app/products/safety-tires/page.tsx:15-22`
- `src/app/custom-development/page.tsx:20-24`
- `src/app/fitment/page.tsx:11-15`
- `src/app/fitment/[platform]/page.tsx:36-40`
- `src/app/tools/page.tsx:8-12`
- `src/app/tools/offset-calculator/page.tsx:16-20`

其中 fitment 页面应先完成 noindex 门槛，而不是先加 canonical。其余是否开放索引要先经过英文内容状态确认，再补与实际 locale 路径一致的 canonical。

### P1：自密封轮胎的主词不统一

代码同时出现 `Self-Healing Tires`、`safety tires`、`Self-Sealing Tyres` 和 `self-sealing`。技术内容 `src/content/safety-tires.ts:150-152` 的主体是 self-sealing tyre technology，调研报告的承接词也是 `self sealing tire`、`how does a self sealing tire work`。

建议词汇规则为：英文 SEO 主词使用 `self-sealing tires`，正文可自然出现英式拼写 `self-sealing tyres`，只在确有语义需要时使用 `safety tires`，删除把它写成 `self-healing` 的表达。这样既不改变技术边界，也避免同一产品线在 title、H1、卡片和全局 description 中漂移。

## 关键词承接矩阵

| 关键词簇 | 当前判断 | 正确承接位置 | 处理意见 |
|---|---|---|---|
| wheel model、wheel specifications、PCD、offset、center bore、15-20 inch | 能 | `/products/wheels`、真实型号页、Offset 工具 | 保留，以实际 variant 数据为准 |
| 5x112、5x114.3、5x120 bolt pattern | 部分能 | bolt-pattern guide 和目录筛选 | 先开放已批准 guide，再评估其余 18 个真实 PCD 的页面化 |
| flow-formed wheels、flow forming | 部分能 | flow-formed 页面与已记录型号 | 只在 publication gate 打开且事实复核后开放 |
| custom forged wheels | 能，但只代表项目服务 | `/products/wheels/forged`、custom development | 不把它改写成现有目录已有锻造型号 |
| OEM、ODM、private label、dealer supply | 有证据但部分页面 noindex | `/custom-development`、`/dealers`、`/dealers/private-label` | 先确认英语页面审批，再逐页解除 noindex |
| self-sealing tires supplier / self-sealing tire technology | 部分能 | `/products/safety-tires` | 统一主词，保留 supplier-stated 和市场文件边界 |
| EV motor housing、controller/inverter housing assessment | 部分能 | `/products/ev-components` | 只承接 assessment/project intent，不写认证、数值或量产承诺 |
| custom aluminum components | 暂不能公开承接 | `/products/custom-aluminum` | 当前 `declinedConfirmed: false`，保持 noindex，不进 sitemap |
| vehicle fitment、BMW M、Mercedes-AMG、Audi RS | 当前不能 | fitment 页面 | 全部等待工程核验，先 noindex 且移出 sitemap |
| price、price list、MOQ、lead time | 当前不能作为承诺词 | 询盘与边界说明 | 可以说明项目化确认，不要写固定数字或“立即报价”承诺 |
| JWL、VIA、TÜV、IATF、ISO、PPAP | 当前不能作为已有资质词 | 待证据文件与正式页面 | 不要因搜索需求把缺失资质写进 title、H1、schema |
| case study、customer、testimonial | 当前不能 | 暂无 | 无真实案例和授权证据时不要补写 |

## 推荐修复顺序

1. **P0 先修关键词证据边界**：重写 homepage、products、layout 的回退 SEO 文案，删除 1018、HP fitment 和四线全铝的旧描述，统一 self-sealing 术语。改动只进入 `src/content` 或 metadata 接缝，不把营销词硬编码进组件。
2. **P0 修 fitment 发布门槛**：平台页 metadata 与 sitemap 共用一个“全部 verified 才开放”的 gate。未经工程核验的品牌和车型词不出现在 indexable HTML 的 title、description、sitemap 中。
3. **P1 建英语 SEO 发布矩阵**：明确 `/dealers`、`/dealers/private-label`、`/insights`、`/insights/bolt-patterns` 是否已获英语内容批准。批准后分别补 canonical 并解除英文 noindex，其他语言继续 noindex。
4. **P1 固化正式域名门禁**：生产构建必须提供正确的 `NEXT_PUBLIC_APP_URL`，正式环境使用 HTTPS，核对 canonical、OG、robots、sitemap 和 `X-Robots-Tag`。9080 的 noindex 不得复制到正式站，也不能以占位 `fenghuai.com` 上线。
5. **P2 补组织与网站 JSON-LD**：正式公司名、域名、联系方式确认后，在首页补 Organization/WebSite。不要添加没有价格、库存、评价证据的 Offer、Review 或 AggregateRating。
6. **上线前复跑 JEV**：使用正式 HTTPS 域名、允许索引的生产候选环境，至少跑标准模式；只有明确需要搜索量、排名、竞品或反链时，才另行批准 `--full` 的 DataForSEO 成本。

## 未在本轮执行的动作

- 没有修改源代码、WordPress 内容或预发布配置。
- 没有删除、提交或推送任何文件。
- 没有执行收费的 DataForSEO 全量审计。
- 没有把 9080 预发布的 JEV 分数当成正式生产评分。

## 产物

- [JEV digest](./jev-seo-9080-2026-10-12/digest.md)
- [JEV Markdown 报告](./jev-seo-9080-2026-10-12/report.md)
- [JEV Excel action tracker](./jev-seo-9080-2026-10-12/report.xlsx)
- [JEV 原始审计数据](./jev-seo-9080-2026-10-12/audit.json)
