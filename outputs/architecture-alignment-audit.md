# 架构与 README 校准审计

- 日期：2026-10-05
- 范围：根 `README.md`、`ARCHITECTURE.md`、`ARCHITECTURE/README.md` 与当前代码、DEC-023～DEC-041、现行 Page SPEC 的一致性
- 结果：三份文档已校准；应用代码、包元数据和部署配置未在本任务中修改

## 1. 校准前的主要偏差

| 项目 | 旧文档描述 | 当前事实 |
|---|---|---|
| 业务定位 | 纯 B2B 锻造轮毂厂商站 | 峰徊统一对接四条产品线，服务海外 B/C 客户 |
| 页面结构 | 16 个虚构 SKU、三类轮毂和大量竞品式路由 | 首发以四线、真实目录/详情、能力页和统一询盘为轴 |
| 渲染形态 | 56 页全部静态预渲染 | 存在 `/api/inquiries`，必须保留服务端运行时 |
| 图片 | `public/images` 没有真实照片 | 已有轮毂与 PPT 派生素材，但公开仍受来源和图权审批约束 |
| WordPress | 集成尚未建立 | 读取客户端与本地 Docker 实验场已存在，页面未系统接线 |
| 询盘 | Contact 只有前端校验、没有后端 | POST/GET 路由、校验、内存仓储和 Resend 调用已存在；生产持久化未完成 |
| 部署 | Vercel/静态站口径 | 目标为 OpenNext；当前只有 `output: "standalone"`，目标平台未配置 |
| 产品数量 | 示例型号和旧 1018 口径 | 1349 型号、3485 变体；1073 有图技术候选、276 无图 |

## 2. 本次修正

### `ARCHITECTURE.md`

- 新增系统全景和询盘时序图；
- 明确已实现、已设计、待确认三种状态；
- 写清内容、WordPress、产品事实、发布覆盖、询盘、邮件和部署接缝；
- 固化目录、详情、询盘和 sitemap 共用公开产品集合；
- 列出当前适配器与生产目标适配器；
- 增加路由族、SEO、安全、运维、差距和架构变更规则。

### `ARCHITECTURE/README.md`

- 从一段说明扩展为阅读导航；
- 建立业务、状态、架构、页面、数据和决策的阅读顺序；
- 增加状态词和 Page SPEC 入口；
- 保留历史基线的追溯位置。

### 根 `README.md`

- 改为四产品线 B/C 询盘站；
- 增加真实当前状态、开发命令、环境变量、首发路由和数据来源；
- 明确 WordPress、轮毂目录和询盘系统当前与目标差异；
- 收录上线阻断项、部署限制和文档入口；
- 删除“全部静态、16 SKU、无询盘后端、无 WordPress 读取层”等过期描述。

## 3. 仍需处理的实现差距

| 差距 | 处理建议 |
|---|---|
| `package.json` 仍名为 `ai-website-clone-template`，repository/homepage/description 仍指向模板 | 在正式仓库名称与远程地址确认后单独修改，并验证锁文件 |
| 根 `Dockerfile`、`docker-compose.yml` 仍含模板镜像和 Node 自托管假设 | OpenNext 平台确定后重做；当前不得作为生产方案 |
| 目录与详情仍读取 `wheel-skus.ts` | 按 wheel catalog/detail Page SPEC 改接公开产品集合 |
| `product-lines.ts` 仍含旧 1018 数量和未经审核营销主张 | 首页/产品中心内容改造时统一替换，不能只改 README |
| WordPress 客户端默认 fallback，可在 live 故障时返回本地内容 | 生产接入时增加“最后成功批准版本”和撤回失效策略 |
| 询盘仍使用内存 Map 和同步邮件布尔值 | 实现 PostgreSQL、幂等、事务 outbox 和邮件事件 |
| gallery/fitment/dealers/tools/insights 等旧路由仍存在 | 上线前逐路由决定保留、重定向、noindex 或关闭 |

这些差距已在 `ARCHITECTURE.md` 和 `STATUS.md` 中标为未完成，不影响本次文档校准完成。

## 4. 验收

- 三份核心文档之间的相对链接通过检查；
- 文档中的代码状态已与当前文件和运行记录核对；
- 没有将 PostgreSQL、OpenNext、WordPress 页面接线或邮件送达闭环写成现成功能；
- `git diff --check` 通过后，本记录转入完成状态。
