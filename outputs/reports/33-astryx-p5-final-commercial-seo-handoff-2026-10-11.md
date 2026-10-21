# Astryx P5 全站回归收口与商用／SEO 交接

- 日期：2026-10-11
- 结论：**P5 本地界面与交互回归通过；商用发布仍 No-Go。**
- 本轮未提交、推送、部署、改 DNS 或向真实 QQ／销售邮箱发信。仓库原有大量未提交改动属于既有工作，本报告不把它们全部归为本轮产出。

## 一、按规格与仓库规则双轴验收

| 轴 | 实测结论 | 证据／边界 |
|---|---|---|
| 全站主题 | 根 `Theme`、静态 Neutral CSS 与暖白令牌已覆盖 31 个渲染模板 | `src/app/providers.tsx`；`npm run theme:check` 通过；深色照片／工程段保留为受控例外 |
| 模板、视口、语言 | 31 模板 × 320×568、390×844、768×1024、1440×900 = **124 个视口组合**；每组合 200、单一 `<main>`、h1、主题、无页面级溢出、键盘可达、axe WCAG A/AA 基础扫描通过 | `e2e/astryx-sitewide-p5.spec.ts`；每模板 4 张首屏截图；每模板另有 en/zh/es/th 的 URL、h1 与截图检查（124 个语言组合）；未审批语言响应保留 `X-Robots-Tag: noindex` |
| 业务回归 | Playwright **116/116 通过**；筛选 GET、分页、真实 variant、无图不上架、直接／总询盘隔离、落库成功最低标准、无 JS、导航、语言切换与 SEO 契约未退化 | 隔离 `WP_MODE=mock`、端口 3229、单 worker 的整套 Chromium E2E；没有连接真实 SMTP |
| 工程门禁 | `npm run check` 通过：主题漂移、单测 **42/42**、lint、typecheck、191 页构建；`git diff --check` 通过；生产依赖审计此前为 0 漏洞 | 使用 Next.js 16.4.0、Astryx 0.6.7；`next start` 对 standalone 输出有警告，不能当成 OpenNext 预发布验收 |
| 内容与架构 | WordPress 稳定内容视图契约、原生多值 GET、普通链接分页与产品发布门槛保持；没有修改 `src/content/types.ts` | P0–P4 报告 26–31 与本轮回归；7 个纯重定向（6×308、1×307）已有 32 号报告 `curl -I` 证据，本轮未改其路由 |

屏幕取证由测试写入未跟踪的 `test-results/`，可在本地查看并通过同一命令重现；它们不是已发布设计稿。抽看了首页／产品总览／轮毂目录／询盘页的 320 与 1440 截图。自动 axe 通过不等于完整人工 WCAG 审计；31 个模板也不等于每个动态产品实例都被逐一人工评审。

## 二、本轮确认并修正的缺陷

1. **全站悬浮 Request Quote 退场**：按用户意见，从根布局移除挂载，旧源码归档到 `archive/2026-10-11-floating-quote.tsx`；删除目录和 EV 页的专用抑制标记。桌面 Header、移动菜单、Footer、产品直接询盘和总询盘均保留。Toast 后到询盘页核对清单，测试不再依赖浮动 Badge。决定见 DEC-094。
2. **主题深色段对比度**：能力证据卡上的铜色文字、锻造／轮胎暗卡标题及 `--fh-forge-bright` 调整后，稳定画面通过 axe。主题标题样式按 landmark 生效，深色段标题须显式声明浅色，不得仅靠继承。
3. **结构与窄屏**：四个页面的嵌套 `<main>` 改为普通容器；文章 Outline 的 grid 子项补 `min-w-0`，修复 320px 溢出；偏距公式代码区可用键盘聚焦；法律页不再链接不存在的 `/support` 面包屑。
4. **四语言生产预取循环**：深度浏览器扫描发现非英文 Cookie 与未加前缀内容链接的 RSC 预取会往返 307，报 `ERR_TOO_MANY_REDIRECTS`。Proxy 对后台数据请求尊重显式 URL，完整页面访问仍保留语言偏好；首页五个模块的内容链接按当前语言输出。中文首页点击询盘的真实浏览器回归通过。决定见 DEC-095。
5. **测试本身的误报**：两个初始失败分别是页脚两个合法询盘链接、Astryx NumberInput 的输入框与增减按钮共享部分名称；定位器已改为明确的链接／`spinbutton`。复验 2/2，最终全量 116/116。

## 三、Astryx 覆盖率的准确说法

**全站共享 Astryx Neutral 主题，不是每个组件都直接由 Astryx 包实现。** 当前 `src/components/` 有 69 个 TSX 组件，其中 8 个活动组件直接导入 `@astryxdesign/core`；根 Provider 另行接入 Theme、语言、Link 适配和 Toast。品牌 Hero、产品卡、规格表、文章、WordPress 内容与询盘业务状态仍由项目组件负责，但读取同一暖白令牌。P0/P3 探针拒绝了会破坏 GET／无 JS／表格名称的替换；不能把“100% 官方组件”当成质量目标。现行规则已回写 `DESIGN.md` 与 Astryx Page SPEC。

## 四、下一阶段：先商用证据，再 SEO 放量

正式发布仍以 `work/queued/2026-10-08-commercial-launch-remediation.md` 为唯一整改任务，不另起重复计划。

| 顺序 | 责任输入与行动 | 放行证据 |
|---|---|---|
| 1. 法定与产品事实 | 确认主体、真实联系渠道、域名；工程／业务签字首批 10–20 个有图型号、规格、图权；法务批准五项政策与隐私版本 | 无虚构数字／未签字产品；隐私同意有可追溯版本 |
| 2. 预发布与线索安全 | 选定 OpenNext 平台和区域，建隔离预发布；接 WordPress/MySQL、Outbox 定时任务、投递事件、监控、备份与恢复 | 真正写入数据库才对客户显示成功；邮件失败可追踪、不丢线索；恢复／回滚演练记录 |
| 3. 原创内容与技术 SEO | 逐页审批英文事实文案和媒体；在正式域名构建上核对 canonical、robots、sitemap、OG、404、撤回与内部链接；其余语言未审批前保持 noindex | 可索引页有原创有效内容、正确规范 URL；只发布有图且批准的轮毂；翻译与 hreflang 按页核准 |
| 4. 上线前 UAT | 真机／软键盘、无 JS、键盘、真实预发布路径、Core Web Vitals、询盘四态、异常告警、回滚与联合签字 | P0 阻断项关闭；经书面授权才配置 DNS、开放索引、向真实地址发信 |

SEO 排序遵循 Google 对[有用原创内容](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)、[站点地图](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)与[多语言版本](https://developers.google.com/search/docs/specialty/international/localized-versions)的官方指导；性能验收依据 [Core Web Vitals](https://web.dev/articles/defining-core-web-vitals-thresholds)。这只是下一阶段验收依据，**不是本地 P5 已测得正式域名搜索表现或真实性能数据**。

## 五、留下的明确边界

- 本轮 E2E 是 `WP_MODE=mock`，没有替代真实 WordPress/MySQL／Outbox／QQ SMTP 预发布联调；也没有真实地址发信。
- 31 个代表模板已自动覆盖，动态内容的全部实例、逐像素人工视觉评审与生产 Core Web Vitals 尚未完成。
- 首页内容链接已本地化；其他页面族的内容链接与可索引翻译仍归 COM-014/015 逐页核验。
- 缺正式域名、公司账号、法务文本、首发产品签字与监控恢复演练，**禁止把这次 116 个本地通过用例解释为商用上线许可**。
