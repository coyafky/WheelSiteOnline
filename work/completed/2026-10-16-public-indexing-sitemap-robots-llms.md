# 公开内容收录与发现配置

日期：2026-10-16

## 结果

- 按负责人指示，移除现有公开内容页面的 noindex 门槛，并允许英语、中文、西语、泰语路由进入索引。
- Fitment、完成/旋压/EV/定制铝件/自密封轮胎、经销商、Insights 指南、表面处理参考和政策页面进入 sitemap；产品型号、车型平台、指南与螺栓孔距文章从对应内容集合生成。
- `/robots.txt` 允许抓取公开站点、禁止抓取 `/api/`，并指向配置域名下的 sitemap。站点域名未配置时继续 fail-closed：禁止抓取且返回空 sitemap。
- `/llms.txt` 提供四条产品线、公司/能力、工程与 Fitment 页面、指南、工具、政策和询盘入口，并明确项目规格、适配、资质、交期和商业条款需要逐项确认。
- 所有现有前端内容页（包括询盘感谢页）均可索引；带筛选/搜索的组合 URL 与草稿预览仍 noindex。未把 API 或重定向旧路由加入 sitemap。预发布环境的 `X-Robots-Tag: noindex` 由部署边缘配置继续控制。

## 内容事实状态

本次只按负责人明确指示解除收录门槛，没有把 `verified: false` 改为已核验，也没有修改规格、法律文本或产品事实。Fitment 和其他带待审核说明的公开内容虽然允许被索引，其事实仍需工程、主体、图权或法务逐项确认；索引授权不等同于事实签字。

## 验收

- 定向 ESLint：通过。
- `npm run typecheck`：通过。
- 带临时校验域名的 `npm run build`：通过，Next.js 16.4.0 生成全部 App Router 路由，包括 sitemap、robots 与 llms.txt；临时域名只在命令环境中使用，没有写入仓库。
- 本地运行时 `/robots.txt`、`/sitemap.xml`、`/llms.txt` 均为 200；sitemap 共 708 条 URL，覆盖四种语言。Fitment、指南、政策、感谢页及一般内容页抽查均为 `index, follow`，canonical 指向当前语言 URL 并输出 5 个 hreflang（含 `x-default`）。
- `git diff --check`：通过。
- 构建期间本地 WordPress `127.0.0.1:8081` 不可连接，内容读取使用项目 fallback；不影响构建成功，但未验证 live CMS 内容。
- 当前未配置 `NEXT_PUBLIC_APP_URL`，所以这次本地构建产物中的 `robots.txt` 为 `Disallow: /`，`sitemap.xml` 为 0 条。需要负责人提供正式站点根域名后再做带真实域名的构建核对。
- 9080 预发布尚未部署本次代码；其边缘 `X-Robots-Tag: noindex, nofollow` 继续生效。本次没有发布或更改部署配置。

## 未决事项

1. 取得正式站点根域名，配置 `NEXT_PUBLIC_APP_URL` 并核对生成的 robots、sitemap、canonical 与 Open Graph。
2. 在 WordPress live 可用环境及最新预发布构建上检查 sitemap URL、公开页 metadata、`/llms.txt` 内容和 edge noindex 行为。
3. 依项目发布流程继续处理车型规格、素材图权、法律文本、生产运行时与部署平台的上线门槛。
