# 2026-10-16 SEO 页面写作计划执行

## 目标
按 SEO 页面写作与模块优化计划，对现有页面文案/模块逐页核对并实施证据内的优化，保持 Page SPEC、发布资格和内容接缝契约。

## 执行范围
- 计划正本：`outputs/reports/seo-page-writing-and-module-optimization-plan-2026-10-16.md`
- 页面顺序：Flow-formed → Self-sealing tires → EV components → custom aluminum（只做门槛内草稿/优化）→ wheel catalogue / forged → homepage/entity。Offset、private-label 与 OEM 词按计划先核验或暂缓。
- 不新建 SEO URL，不改变现有门槛状态；若 metadata 与 sitemap 未共同执行现有门槛，则修正为共用同一 fail-closed 条件。不写 WordPress；不提交、不推送。

## 验收
- 当前文案与相关 Page SPEC 的差异有审查；实际改动集中在对应内容接缝。
- 各页面有明确主责关键词，辅助词自然覆盖，模块能回答用户任务；未确认主张继续受限或保持未知。
- 运行相关的内容/类型检查和页面回归；检查 `git diff --check`。
- 完成后把本任务移至 `work/completed/`，更新 `STATUS.md` 与文档地图。

## 检查清单
- [x] 建立页面基线并审查现有工作区改动
- [x] 完成 Flow-formed 文案优化及对应验证
- [x] 完成 Self-sealing 文案优化及对应验证
- [x] 审核 EV / custom-aluminum / wheels / homepage 与计划的差异，实施适合当前证据门槛的最小更改
- [x] 核对技术 SEO 元信息与页面 owner，不改变索引门槛状态
- [x] 汇总验证与未决业务/工程签核，收尾文档

## 实施结果

- Flow-formed lead 加入自然的 wheel supply 需求表达；metadata 与 sitemap 共用已批准发布门槛，并要求至少有一个已批准型号，避免空目录进入索引。
- Self-sealing 模块标题直接回答 “How self-sealing tires work”；生产基地图片说明明确为 supplier-provided，保留责任主体和具体项目的审批边界。8 mm 仍保持供应商陈述及条件限制。
- Custom aluminum 的索引条件收口为 `publicationStatus === approved && declinedConfirmed`；不满足时 metadata 输出 `noindex,follow` 且不生成 canonical/alternate，sitemap 也排除该路径。当前 draft 状态仍关闭。
- 产品线总览移除“我们制造”、自动转成可生产规格、减重优势和 fitment 保证等 unsupported claims，改为逐产品线提供项目评估入口。
- EV housing、custom forged、wheel catalogue、offset 工具与首页当前主责、模块及边界已经复核；内容已有计划所需结构的部分保留，不为关键词新增 URL 或重复模块。Private label、泛 OEM 和独立 self-sealing 技术页仍暂缓。

## 验收与后续

- `npm test`：60 项通过；`npm run typecheck`：通过；本次相关文件 ESLint：通过；`npm run build`：通过；`git diff --check`：通过。
- 本轮环境为 `WP_MODE=live`；只改本地内容接缝与 Page SPEC，没有写入 WordPress，也未部署。经批准的 WordPress 正文可能优先于本地 fallback，因此尚未对 CMS 正文同步或线上页面显示作验收结论。
- 当前正式域名 `fenghuaitech.com` 尚未部署，sitemap URL 与正式 canonical 尚不能实网核验；8 mm 试验报告、产品主体、图片权利和其他供应商/工程证据继续按各 Page SPEC 门槛审核。
