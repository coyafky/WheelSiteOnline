# 2026-10-06 新能源三电铝制品页实现（EV01–EV06）

- 日期：2026-10-06
- 状态：已完成
- 任务：按唯一施工规格 `PAGE-SPECS/ev-components.md` 改造 `/products/ev-components`
  的现有实现（规格第 8 节「现有实现替换要求」7 条），并从直接 `public` 资源绑定
  切换到 WordPress 媒体接缝。

## 目标

把旧版 300 行页面 + 323 行内容模块收敛为 EV01–EV06 六视口能力页：三类有图壳体、
三个工程问题、五步制造路线、证据矩阵与工程评估询盘。页面不发布库存、材料牌号、
公差、泄漏率、压力、产能、良率、客户、车型或认证标志。

## 施工前实测（规格第 4 节与资料核验记录）

### WP 媒体 → 本地 WebP 像素对应关系

用 PIL 对 4 张 `三电_*` 源图与现有 6 张本地 WebP 做等尺寸均值绝对差比对
（阈值 < 3 视为同图）：

| WP ID | 源文件 | 像素尺寸 | 本地同图 | 均值绝对差 | 结论 |
|---:|---|---:|---|---:|---|
| 38 | `三电_焊接密封.jpeg` | 1280×1707 | 无 | ≥63 | 本地无同图；旧名 `housing-welded.webp` 也不是它 |
| 24 | `三电_水冷电机壳.jpeg` | 1440×810 | `hero.webp` | 1.13 | 同图 |
| 24 | 同上 | | `related-custom-aluminum.webp` | 2.16 | 同图（重复） |
| 49 | `三电_电机壳体.jpeg` | 1707×1280 | `housing-interfaces.webp` | 0.94 | 同图 |
| 49 | 同上 | | `ev-component.webp` | 2.02 | 同图（重复） |
| 20 | `三电_电控箱壳体.jpeg` | 1280×1707 | 无 | ≥46 | 本地无同图 |

人工目视复核（接触表）确认：WP 38 = 多层堆叠的已加工壳体批量场景；WP 24 = 米色
圆筒壳体（正面带法兰与接口）；WP 49 = 带多处管口的银色电机壳；WP 20 = 带机加工内孔
的电控箱壳体；`housing-welded.webp` = 带两根软管的壳体（与 WP 49 同件不同角度），
既不等于 WP 38，也不显示任何焊接、密封或泄漏检测动作。

### 回退图命名决定

旧文件名的两处问题：`housing-welded.webp` 的文件名本身断言焊接（规格 §9 禁止），
`hero.webp` / `ev-component.webp` 与 WP 24/49 同图却取了无语义名。因此**不沿用**旧
WebP，改为从 WP 源图重新生成四张不带主张的语义名回退：

- WP 38 → `batch-housings-in-production.webp`（只描述批量场景）
- WP 24 → `water-cooled-housing-sample.webp`（类别名来自供应商资料，不声称水道可见）
- WP 49 → `motor-housing-sample.webp`
- WP 20 → `controller-housing-sample.webp`

旧 6 张 WebP 无任何代码引用后移入 `archive/2026-10-06-ev-components-legacy-images/`，
不删除（AGENTS §8）。

## 规格约束（逐条对应）

- [x] 1. 15 个部件类型收敛为三类有图壳体；电池托盘、端板、冷板、模组支架、控制臂、
      转向节、PDU、OBC、水泵壳体、阀块全部移除（归定制铝制品页）。
- [x] 2. 新建 `src/lib/wordpress/ev-components.ts`，用 WP 38/24/49/20 批量解析替换
      直接 `public` 绑定。
- [x] 3. 删除/降级无本线证据主张：油冷壳体、PDU/OBC、电池托盘、冷板、X-ray、
      「完整受控流程 / 一个受控流程而非分包」。
- [x] 4. 气密、精度、材料、质量体系改写为项目输入/证据要求。
- [x] 5. 保留「工程评估而非直接报价」CTA 逻辑，页面不出现 quote 动作。
- [x] 6. 不使用 `in-house`、`our plant`、深圳自有制造表述；峰徊 = 深圳项目接口。
- [x] 7. 全部文案位于 `src/content/`；组件只用设计令牌与声明式动效。
- [x] EV01 逐字文案 + 两动作 → `#housing-categories` / `#engineering-assessment`。
- [x] EV02 三卡各带 `Project category — not a stock SKU`。
- [x] EV03 `Cooling path` / `Sealing boundary` / `Critical interfaces`。
- [x] EV04 五步路线 + 固定说明逐字。
- [x] EV05 3 列 × 5 行证据矩阵，只定义应索取证据。
- [x] EV06 输入清单 + CTA，不显示上传按钮。
- [x] 图片比例/裁切约束：EV01 桌面 16:9、移动 4:3；EV02 全部 4:3；
      EV02-3 `object-contain`。
- [x] 证据状态纪律：三类名称 `supplier-stated`；工艺写「资料所述路线」；`missing`
      项不显示数值或标志；不从媒体标题/文件名推断产品或工艺。
- [x] SEO：Title/Description 逐字；canonical；可输出 `Service` schema，不输出
      `Product`/`Offer`；询盘带 `product_line=ev-components`、category、来源、证据需求；
      统一 `/api/inquiries`，失败不显示假成功。
- [x] 响应式：桌面 1440×900 与移动 390×844 按规格第 6 节；EV05 移动转逐项证据卡，
      不建横向滚动表；CTA ≥44×44；200% 放大无横向滚动。

## 规划落点

- 新增 `src/components/ev-components/ev-components-page.tsx`（EV01–EV06 组件）。
- 新增 `src/lib/wordpress/ev-components.ts`（WP 38/24/49/20 批量媒体适配）。
- 重写 `src/content/ev-components.ts`（稳定内容契约 + 逐字英文）。
- `src/content/types.ts` 新增 `EvHousingPageContent` 等类型（WordPress 契约变更 → DEC-051）。
- 重写 `src/app/products/ev-components/page.tsx`（metadata + Service JSON-LD）。
- 生成四张无主张语义名回退 WebP；旧 6 张归档。

## 验收

- `npm run typecheck` / `npm run lint` / `npm run build` 三绿；`git diff --check`。
- 扫描删除项：`in-house`、`our plant`、`X-ray`、`oil-cooled`、`PDU`、`OBC`、
  `battery tray`、`cold plate`、`controlled flow`、旧 hero 直接绑定。
- 页面 HTML：WP 20/24/38/49 出现且带证据边界；无 WP 44；无 `<input type="file">`。
- 浏览器验收截图落到 `outputs/ev-components-review/`（1440×900、390×844、200%）。
- 更新 `PAGE-SPECS/ev-components.md`、`STATUS.md`、`DECISIONS.md`、`outputs/README.md`。
- 不 commit、不 push、不 deploy。

## 独立验收数据（2026-10-06，由验收方复跑）

### 构建与命令
- `npm run typecheck` ✅ ｜ `npm run lint` ✅ ｜ `npm run build` ✅（65 路由）｜ `git diff --check` ✅
- 生产实例 `GET /products/ev-components` → 200（fallback 与 live 两种模式均 200）

### 四视口（补入 public/ 与 .next/static/ 的 standalone 实例）

| 视口 | scrollWidth / clientWidth | 横向溢出 | 图片 | 断图 | naturalWidth | H1 | 控制台错误 |
|---|---|---|---|---|---|---|---|
| 1440×900 | 1440 / 1440 | 否 | 4 | 0 | 576, 475, 475, 475 | 1 | 0 |
| 1280×800 | 1280 / 1280 | 否 | 4 | 0 | 512, 422, 422, 422 | 1 | 0 |
| 390×844 | 390 / 390 | 否 | 4 | 0 | 390×4 | 1 | 0 |
| 360×800 | 360 / 360 | 否 | 4 | 0 | 359×4 | 1 | 0 |

⚠️ standalone 不含 `public/` 与 `.next/static/`，必须手动补入，否则图片与 CSS 全 404（据此判「断图」是假警报）。

### H2 顺序 = EV01→EV06（无 JavaScript 下亦全部可见）
1. Aluminum housings for EV motor and controller projects（H1）
2. Three housing categories in the supplied portfolio
3. The drawing has to resolve cooling, sealing and interfaces together
4. A process route is selected for the part, not from a fixed menu
5. Evidence is agreed with the validation plan
6. Start with the part and its acceptance conditions

### WordPress
- **批量请求实测**（WP 容器访问日志）：`GET /wp-json/wp/v2/media?include=38,24,49,20&per_page=4` —— **单次**请求，非 4 次串行
- **live 模式**（`WP_API_URL` + `WP_MODE=live`，且**构建期**即带该变量）：4 张 WP 图全部加载，`naturalWidth` 576/475/475/475，0 断图、0 控制台错误
- **fallback 模式**：正文无任何 WP URL，4 张图切到同图本地 WebP，页面 200
- 本地回退与 WP 原始尺寸核对：WP 24 = 1440×810 **完全一致**；WP 49（1707×1280）、WP 38（1280×1707）、WP 20（1280×1707）比例吻合

### 移动端证据矩阵
- 360/390px：`<table>` 计算宽度 **0（已隐藏）**，内容转为**逐项证据卡**（每项带 Before quotation / Before sample approval / Before serial supply 三个标签）；1440px 才渲染表格。规格「不建立横向滚动表」满足。

### 元数据与 schema
- `<title>` = `EV Motor & Controller Aluminum Housings | Engineering Assessment | Fenghuai`（与规格 §7 逐字一致）
- description 与规格 §7 逐字一致
- canonical = `https://www.fenghuai.com/products/ev-components`
- `"@type":"Service"` 存在；**无** `Product`/`Offer`/`AggregateRating`
- `robots: index, follow`（本页规格无 noindex 门槛，与定制铝制品页不同）

### 越界主张复扫（均为 0 命中于对外文案）
`in-house` / `our plant` / `X-ray` / `oil-cooled` / `PDU` / `OBC` / `battery tray` / `cold plate` / `controlled flow` / `water-pump` / `valve block` —— 仅出现在代码注释中说明「已移除」，无对外主张。
图片 alt 无 `weld`/`seal`/`leak`/`x-ray` 字样。无 `<input type="file">`。

### 未验证 / 遗留
- 四张 WP 媒体的图权、拍摄主体、产品类别、alt、caption、批准状态仍待**运营侧后台录入**（页面已按 `approvalStatus` 做兜底）。
- WP 38 的 CMS 标题仍为「三电_焊接密封」，与画面（生产区批量壳体）不符，**待后台修正**；页面不复用该措辞。
- 200% 放大与键盘导航未做独立机器验证（以 390/360 移动宽度作等效检查）。
