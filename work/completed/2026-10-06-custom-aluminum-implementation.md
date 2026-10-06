# 2026-10-06 定制铝制品页实现（CA01–CA07）

## 目标

把 `PAGE-SPECS/custom-aluminum.md` 的唯一施工规格落到 `/products/custom-aluminum`，
按规格第 9 节「现有实现替换要求」改造现有实现，不新建、不重写信息架构以外的部分。

## 规格约束（逐条对应）

- [x] CA01 首屏无产品照片：排版 + 线框文件图形 + 设计令牌；右侧 2D/3D/Sample 抽象文件卡；现有 `hero.webp` 不再作为通用定制零件证明。
- [x] CA02 四组应用，每张卡固定标签 `Assessment scope`，明确为评估范围，不写成量产/现货/案例，不放产品缩略图。
- [x] CA03 输入收敛为 2D drawing / 3D data / Physical sample；逆向工程并入样件路线并增加所有权与复制权确认；删除 `competitor's part`。
- [x] CA04 三种工程方法 + WP 67/31/48，标注轮毂几何证据边界；固定证据说明 `Method examples from supplied material — not project-specific validation reports.`；WP 48 小卡片不超原始有效尺寸；WP 44 禁用。
- [x] 删除越界主张：镁合金通用能力、通用热处理、内部涂装（`applied in house`）、无限尺寸能力、通用腐蚀重复性。
- [x] CA05 五阶段：Engineering assessment / Tooling and trial / Inspection and sample review / Approval and engineering closure / Pilot and serial supply，说明每步可能停止。
- [x] CA06 三列状态矩阵：`Listed in supplier material` / `Assessed per project` / `Not yet confirmed for publication`；`declinedConfirmed=false` 不公开展示空白「不做」列；页面 noindex。
- [x] CA07 统一询盘 API，不实现直接文件上传；CTA `Start a custom aluminum assessment`。
- [x] metadata 受状态驱动：`declinedConfirmed=false` → `robots: { index: false, follow: true }`；满足门槛后才 canonical；组件不得用隐藏 CSS 绕过状态。
- [x] 三电分流：水冷电机壳 / HPDC 电机壳 / 电控或逆变器壳体 → `/products/ev-components`，固定提示语。
- [x] 不发布材料牌号、公差、MOQ、周期、模具寿命、产能、尺寸包络数字；不从文件名推断工程方法。
- [x] 内容走 `src/content/` 接缝；设计令牌；`data-reveal` / `data-reveal-group` / `data-parallax-media`；无 JS 正文可见；200% 放大与 390px 无横向滚动；按钮 ≥44×44。
- [x] 询盘上下文固定带 `product_line=custom-aluminum`、application group、input type 与页面来源。

## 规划落点

- 新增 `src/content/custom-aluminum.ts` 契约与英文内容（规格第 4、6 节）。
- 新增 `src/lib/wordpress/custom-aluminum.ts` 批量媒体适配（WP 67/31/48，同图本地 WebP 回退）。
- 新增 `src/components/custom-aluminum/custom-aluminum-page.tsx` 视口组件。
- 改写 `src/app/products/custom-aluminum/page.tsx`，metadata 由 `capabilityBoundary.declinedConfirmed` 驱动。
- 保留 `#development-flow` 锚点（`src/content/custom-development.ts` 跨页引用）。

## 记录

- 2026-10-06：开始。已读 AGENTS / PROJECT / STATUS / 规格 / 资料核验 / forged-wheel 参考实现 / WP media 接缝 / 询盘上下文接缝。
- 2026-10-06：实现完成，跑 typecheck / lint / build / git diff --check；截图写入 `outputs/custom-aluminum-review/`。

## 独立验收数据（2026-10-06，由验收方复跑）

验收环境：`.next/standalone` + 手动补入 `public/`（2928 文件）与 `.next/static/`（40 文件），生产实例 127.0.0.1:3118。
⚠️ 未补静态资源的 standalone 实例会让图片与 CSS 全部 404，据此得出的「断图」结论是测试假象，不是页面缺陷。

| 视口 | scrollWidth / clientWidth | 横向溢出 | 图片 | 断图 | naturalWidth | H1 | 询盘链接 | 控制台错误 |
|---|---|---|---|---|---|---|---|---|
| 1440×900 | 1440 / 1440 | 否 | 3 | 0 | 441, 311, 263 | 1 | 13 | 0 |
| 1280×800 | 1280 / 1280 | 否 | 3 | 0 | 392, 276, 263 | 1 | 13 | 0 |
| 390×844 | 390 / 390 | 否 | 3 | 0 | 361, 255, 263 | 1 | 13 | 0 |
| 360×800 | 360 / 360 | 否 | 3 | 0 | 359, 359, 263 | 1 | 13 | 0 |

命令验收：
- `npm run typecheck` ✅ ｜ `npm run lint` ✅ ｜ `npm run build` ✅ ｜ `git diff --check` ✅
- 生产实例 `GET /products/custom-aluminum` → 200
- 渲染结果 `<meta name="robots" content="noindex, follow"/>` ✅，且**无** `<link rel="canonical">` ✅（门槛关闭时的正确状态）
- 正文无 WordPress 媒体 URL（本地 WebP 回退生效），3 张图均由本机 `/_next/image` 提供
- `<input type="file">` 计数 0 ✅（未实现直接上传）
- 五阶段文案齐全 ✅ ｜ 证据说明句出现 2 次 ✅ ｜ 三电分流提示句逐字存在 ✅
- 询盘上下文实测：`product_line=custom-aluminum` + `from=custom-aluminum` + `application=<group>` + `input_type=<2d-drawing|3d-data|physical-sample|unspecified>` ✅
- 禁用主张复扫：`magnesium` / `competitor` / `applied in house` / `heat treatment` 仅出现在代码注释与「未确认」标签中，无对外主张 ✅

未验证 / 遗留：
- 200% 放大与键盘导航未做独立机器验证（仅按 390/360 移动宽度作等效检查）。
- 页头与页脚导航存在 32×32 与 36px 高的链接（全站 chrome，非本页组件）；本页自身 CTA 未发现低于 44×44。
- WordPress 后台媒体元数据（alt/caption/图权/来源主体）仍未录入，属运营侧待办。
- 发现跨页面问题：`src/content/wheel-capabilities.ts` 把 WP 48 当作「Reverse engineering」发布，与资料核验（WP 48 = 铸造模拟浇道界面）不符；本页未沿用该绑定。详见对话汇报。
