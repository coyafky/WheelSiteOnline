# 项目审计总览

审计日期：2026-10-18<br>
仓库：`WheelSiteOnline`<br>
路径：`/Users/fkycoya/Documents/Code/WordpressWheelSIte`<br>
分支：`codex/full-site-current-20261012`<br>
基线提交：`961762efd27767697b59d5b7039a1fcd1159c811`

> 本目录是一次有日期的审计交付快照，不替代项目正本。当前架构以
> [`../audit/CURRENT_ARCHITECTURE.md`](../audit/CURRENT_ARCHITECTURE.md) 为准，目标架构以
> [`../architecture/TARGET_ARCHITECTURE.md`](../architecture/TARGET_ARCHITECTURE.md) 为准，任务状态以
> [`../implementation/TASKS.md`](../implementation/TASKS.md) 为准。

## 结论

项目是单仓的 Next.js 16 App Router + Headless WordPress 模块化单体。Next.js 负责页面、SEO、多语言路由和询盘接入；WordPress 负责内容、批准状态、询盘持久化和邮件投递；MySQL 同时保存内容与询盘。展示组件通过 `src/content/` 的类型化内容接缝消费业务数据，未直接依赖 WordPress 原始响应。

当前已具备可运行的产品展示、轮毂目录、Insights、四语言路由骨架、发布资格控制、预览、缓存失效、询盘事务与 outbox、健康检查、备份脚本和 CI。但当前工作树不能判为“全绿”：`npm run lint` 有 10 个 error / 8 个 warning，定向 E2E 有 2 个失败，生产环境、正式域名、真实邮件可见性、后台 TLS、备份恢复和告警送达均未完成生产级验收。

## 可量化范围

| 项目 | 数量 | 统计口径 |
|---|---:|---|
| 页面路由模板 | 33 | `src/app/**/page.tsx`，含 5 个兼容重定向模板 |
| 可承载内容的页面模板 | 28 | 33 减 5 个兼容重定向模板；不代表 CMS 实例数 |
| 动态页面模板 | 5 | `[slug]` 2、`[pattern]` 2、`[model]` 1 |
| HTTP route 文件 | 7 | 6 个 `/api` route + `/llms.txt` |
| HTTP 方法处理器 | 8 | 7 个 route 文件；`/api/inquiries` 同时含 POST 与拒绝列表读取的 GET |
| 组件/组件辅助文件 | 68 | `src/components/**/*.{tsx,ts}` |
| 业务功能域 | 16 | 按独立用户目标与生命周期归并 |
| WordPress 自定义 REST 路径 | 6 | `/fh/v1` 与 `/fh/v2` 注册路由 |
| WordPress 内容载体 | 5 | 3 个 CPT + 原生 post + 原生 page |
| 专用询盘数据表 | 3 | 幂等键、事务 outbox、邮件事件去重 |
| 单元测试结果 | 144/144 | 2026-10-18 `npm test` |
| 定向 E2E | 20 通过 / 2 失败 | 2026-10-18 Playwright 定向运行 |

## 证据边界

- 当前工作区存在 9 个已修改文件和多个未跟踪文件；本审计以当前磁盘代码为准，但不把它们视为已提交或已发布。
- 未读取生产数据库原始数据，未触发真实邮件，未执行 DNS、发布、迁移或生产写入。
- 构建成功说明代码可构建，不说明生产内容、外部服务和商业验收已经完成。
- 审计覆盖率不是产品完成率；本项目没有经批准的全量需求分母，因此不输出虚假的总完成百分比。
