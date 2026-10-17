# 自密封轮胎 T03 机制图替换交付报告

- **日期**：2026-10-16
- **范围**：替换 T03 三张带伪文字/乱码的公开 WebP；不改变 T03 HTML 结构、事实边界或移动布局。
- **结论**：本地媒体替换、内容契约、开发模式页面和生产模式页面均已通过；本地 WordPress 实时权威内容同步因 Docker daemon 不可用尚未执行，因此本次不能关闭全部 P0，也不能宣称 live 模式已验收。

## 已交付

### 1. 新图与审核

三张解释性图由内置 imagegen 生成，统一采用深石墨橡胶、暖黄色密封层、金属色单一穿刺物和浅色中性背景。图片只表达机制阶段，不承载标题、编号、测试数字、品牌或性能保证。

| 阶段 | PNG 源文件 | 公开 WebP | 尺寸 | 转换参数 |
|---|---|---|---:|---|
| 01 物体进入 | [`01-entry.png`](../../resources/generated/self-sealing-mechanism/01-entry.png) | [`mechanism-entry.webp`](../../public/images/safety-tires/mechanism-entry.webp) | 1774×887 | `cwebp -q 82 -m 6` |
| 02 材料包围 | [`02-surround.png`](../../resources/generated/self-sealing-mechanism/02-surround.png) | [`mechanism-surround.webp`](../../public/images/safety-tires/mechanism-surround.webp) | 1774×887 | `cwebp -q 82 -m 6` |
| 03 通道闭合 | [`03-close.png`](../../resources/generated/self-sealing-mechanism/03-close.png) | [`mechanism-close.webp`](../../public/images/safety-tires/mechanism-close.webp) | 1774×887 | `cwebp -q 82 -m 6` |

生成提示词、阶段映射和人工审核结论见 [`图像生成与审核记录`](../../resources/research/2026-10-16-self-sealing-mechanism-image-brief.md)。逐张检查确认没有文字、字母、数字、箭头、标签、Logo、水印或伪文字；图片不表达“任何穿刺都安全”“无需检查”或永久不漏气。

旧公开 WebP 未删除，已归档至 [`旧图归档`](../../archive/2026-10-16-self-sealing-mechanism-webp-replacement/)。

### 2. 内容契约

`src/content/safety-tires.ts` 的 T03-01/02/03 已切换到上述公开路径，并使用解释性图示元数据：

- `hasRender: true`；
- `approvalStatus: "approved"`，表示本地视觉和文案边界审核通过；
- 不再使用旧 WordPress 媒体 ID；
- `sourceRef` 明确说明这是基于已批准机制文案的 AI 生成解释性图示，不是测试照片或测试报告；
- `alt`、`caption` 保留“不是测试结果/仍需检查”等必要边界。

聚焦迁移包已导出到 `/tmp/fenghuai-safety-tires-page-20261016.json`，其中只包含 `safety-tires` Page，T03 三个媒体均为新路径且无 `wordpressId`。

### 3. 页面回归

- 单元测试：`59/59` 通过（包含新增 T03 媒体契约测试）。
- `npm run lint`：通过。
- `npm run typecheck`：通过。
- `npm run build`：通过；构建期间保留既有“本地 WordPress 不可用”的回退警告。
- 开发模式 E2E：`3/3` 通过，视口为 1440×900、390×844、360×800。
- 生产模式 E2E：`3/3` 通过，同样覆盖桌面和两种移动视口。
- E2E 同时验证三张图片的路径、`alt`、`naturalWidth`、T03 卡片边界和无横向溢出。

截图证据：

- [`1440px`](self-sealing-mechanism-asset-replacement-2026-10-16/t03-1440.png)
- [`390px`](self-sealing-mechanism-asset-replacement-2026-10-16/t03-390.png)
- [`360px`](self-sealing-mechanism-asset-replacement-2026-10-16/t03-360.png)

移动端整段截图中，现有 sticky header 会经过第二张卡片的上方区域；这是全局导航层叠表现，不是图片内容伪文字或媒体裁切。专项测试通过图片真实尺寸、卡片边界和横向溢出检查。

## 尚未闭环的事项

本轮没有向远程 WordPress、正式站或 DNS 写入任何内容。尝试访问本地 WordPress `http://127.0.0.1:8081` 时返回 502；`docker compose -f local-wp/docker-compose.yml ps` 也因 Docker daemon socket 不存在而失败。

因此尚未执行以下动作：

1. 将聚焦迁移包导入本地 WordPress `fh_pages_authoritative`；
2. 通过本地 WordPress live endpoint 验证 live 模式不会继续覆盖旧媒体路径；
3. 复核 mock/live 双通道最终返回完全一致。

Docker 恢复后，下一步只需执行上述单页导入、live endpoint 复核和双通道 E2E，再决定是否从 `STATUS.md` 移除该 P0。当前状态详见 [`页面规格`](../../PAGE-SPECS/self-sealing-tires.md) 与 [`项目状态`](../../STATUS.md)。

## 相关实现文件

- [`src/content/safety-tires.ts`](../../src/content/safety-tires.ts)
- [`tests/self-sealing-mechanism-assets.test.mts`](../../tests/self-sealing-mechanism-assets.test.mts)
- [`e2e/self-sealing-mechanism.spec.ts`](../../e2e/self-sealing-mechanism.spec.ts)
- [`执行计划`](../../docs/superpowers/plans/2026-10-16-self-sealing-mechanism-asset-replacement.md)

本次未执行 commit、push 或 deploy。
