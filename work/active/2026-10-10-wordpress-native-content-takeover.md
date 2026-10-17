# Issue 3：WordPress 原生内容接管扩展

- 日期：2026-10-10
- 状态：进行中
- 依据：`work/queued/2026-10-09-wordpress-content-adapter-expansion.md`

## 问题

运营目前只能在 WordPress 管理轮毂与部分 Insights 数据；首页、公司、能力页和
产品线文案仍主要来自仓库中的 `src/content/*.ts`。博客如果继续使用自定义文章类型，
运营无法使用 WordPress 原生文章编辑器和媒体库形成稳定内容流程。页面也需要使用原生
Page 作为可预览、可撤回和可缓存失效的管理入口。

## 本次目标

在不改变页面组件和 `src/content/types.ts` 视图契约的前提下，采用
expand–migrate–contract：

1. 原生 WordPress `post` 接管 Insights，旧 `fh_guide` 保留为迁移期回退；
2. 原生 WordPress `page` 接管首页、公司、能力和四条产品线页面；
3. REST 响应先归一化为稳定内容类型，字段不完整、草稿或撤回时 fail-closed，前台使用
   最后一次有效本地快照；
4. 页面保存、撤回和删除可按页面键触发 Next.js 缓存失效；
5. 前台通过 `generateMetadata` 读取页面 SEO 标题和描述。

## 已完成切片

### 切片一：博客原生文章

- `fenghuai-guides.php` 同时支持旧 `fh_guide` 与原生 `post`；
- 6 篇已审核文章已复制到原生 `post`，保留结构化字段、媒体和日期；
- `fh_guides_native_authoritative` 开关启用后，公开接口返回 `source=wordpress-post`；
- 草稿/撤回公开接口排除，编辑权限预览仍可读；
- 原生文章保存、撤回、删除接入缓存失效钩子。
- 后台入口缺陷已修复：旧 `fh_guide` 菜单隐藏、旧文章编辑/发布能力拦截，结构化编辑框和媒体保存只挂到原生 `post`；旧 CPT 数据仍保留作回退和对账。
- 原生 `post.content.rendered` 在英文文章中优先归一化为现有文章正文契约；正文为空或结构不安全时回退旧字段，非英文优先使用已批准翻译。
- 迁移脚本新增空正文回填：仅在原生正文为空时从旧结构化分段生成安全的 H2/段落 HTML，已有原生正文不覆盖。
- 本工作区 WordPress 与 MySQL 容器已切换为当前工作区挂载；迁移前已生成旧数据库 SQL、当前 `db-data` 快照和容器配置快照，备份目录为 `/tmp/fh-wordpress-backups/2026-10-15-before-native-migration/`。
- 已实际执行迁移：`source_count=6`、`created=0`、`updated=6`、`content_backfilled=6`、`failures=[]`；二次执行 `content_backfilled=0`，证明正文回填幂等。
- Gutenberg 适配器已安全支持列表、嵌套列表、引用、安全链接和带 `wp-image-{id}`、alt、caption 的图片块；图片进入 `GuideArticleSection` 后由 Next Image 渲染。未知标签、危险协议、缺媒体 ID/替代文本和非法结构回退旧 sections。
- 本地新增原生 Post 媒体验收文章：ID `1458`、slug `native-post-media-import-verification`，使用媒体库附件 `1237` 验证特色图、正文图片、alt、caption、REST 和前台 Next.js 图片优化链路；该文章仅用于本地验收。
- ACF 本地字段组只定位原生 `post`，覆盖现有 `fh_*` 标量契约；当前 ACF 免费版无 Repeater 类型，保留项目结构化编辑器，未来 ACF Pro 可启用 `fh_detail` / `fh_sections` Repeater。

### 切片二：原生 Page 内容与 SEO

- 新增 `fenghuai-pages.php`，为原生 Page 提供页面键、发布状态、结构化内容 JSON、SEO
  标题/描述和特色媒体字段；
- 7 个页面（首页、公司、能力、产品中心、EV、定制铝制品、自密封轮胎）已迁移并启用
  `fh_pages_authoritative`；
- 首页、公司、能力和四条产品线适配器均在服务端恢复为现有视图类型后再交给组件；
- REST 预览需要 `edit_pages` 权限；非已发布或非已批准页面不会进入公开集合；
- 页面缓存失效覆盖对应路径和 `/sitemap.xml`。

## 验收证据

- `python3 scripts/verify-insights-cms.py`：原生文章、结构化字段、媒体、公开/预览门槛和 ACF 兼容回退通过；
- `python3 scripts/verify-native-pages.py`：原生 Page、SEO、草稿公开隔离、授权预览通过；
- `npm test`：56/56；
- `python3 scripts/verify-insights-cms.py`、`npm test`（56/56）、`npm run lint`、`npm run typecheck`、`npm run build`、`git diff --check` 通过；媒体验收页面返回 HTTP 200，特色图和正文图片均生成 Next Image 优化请求，优化图片请求返回 HTTP 200，原始 Gutenberg 注释未泄漏。

## 第三切片：询盘入口与隐私版本

本切片已实现迁移接缝，但在隐私版本为空时保持 fail-closed：运营必须先提供经确认的
隐私版本号，迁移包才会把 `request-a-quote` 与 `privacy` Page 置为已批准。当前本地环境
没有设置正式版本号，因此这两个 Page 保持草稿，表单不会收集数据。

- `request-a-quote` 原生 Page 承载 Hero、上下文条、表单标题、Step 1/Step 2 提示、字段
  标签、错误提示、成功/网络失败/邮件待投递文案和数据说明；
- `thank-you` 原生 Page 承载有效回执、伪造回执、响应窗口和邮件失败后的说明；
- `privacy` 原生 Page 承载版本号、同意文本和隐私链接；
- 新增中文模板 `outputs/templates/2026-10-10-privacy-consent-template.md`，明确占位字段、
  公司/法务确认项、发布门槛和回滚方式；
- Next.js 适配器对页面字段做完整性检查，草稿/撤回或隐私版本为空时保留本地快照，表单
  继续因没有有效版本而禁用；
- 增加前台预览：授权访问 `/api/preview?secret=...&page=privacy` 或
  `/api/preview?secret=...&page=request-a-quote` 后，页面以 WordPress 草稿渲染并显示预览
  横幅；隐私页可直接观察版本号、同意文本和链接，退出预览不会改变发布状态；
- 缓存失效允许 `pages` 类型，覆盖询盘页、隐私页、感谢页和 sitemap。

第三切片验收：`python3 scripts/verify-native-pages.py` 已验证询盘 Page 草稿不公开、编辑
预览可读、隐私 Page 在版本未确认时不公开；Playwright 询盘与站点契约 17/17 通过。

## 尚未完成

1. 业务/法务确认正式隐私版本号和同意文本后，在生产 WordPress 批准 `request-a-quote`
   与 `privacy` Page；
2. 生产 WordPress 的预览 token、缓存回调密钥、sitemap 与真实域名联调；
3. 由运营逐页复核迁移后的英文文案、媒体 alt、主体归属和 SEO，不自动把未确认主张
   视为已批准；
4. 若正式运营需要 Repeater 可视化编辑，提供并核验 ACF Pro 许可/安装；在此之前继续使用
   免费版 ACF 标量字段 + 项目结构化编辑器回退，不把未支持的字段类型开放给运营；
5. 在预发布/生产 WordPress 重复备份、迁移和 `scripts/verify-insights-cms.py` 验收，并由运营
   逐篇复核迁移后的英文正文、媒体 alt、主体归属和 SEO；
6. 当运营完成一轮真实编辑后，再收缩本地 `src/content` 的录入职责，但仍保留最后一次
   有效快照作为故障兜底。

## 非目标

- 本切片不删除旧 CPT、旧本地内容或迁移脚本；
- 不在 WordPress 原生 Page 中允许任意 PHP/HTML 执行；
- 不把原始 WordPress REST 字段泄漏给 React 组件。
