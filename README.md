# 深圳峰徊四产品线独立站

面向海外 B/C 客户的英文优先询盘网站，采用 Next.js 前端与 Headless WordPress 内容后台。网站覆盖轮毂、新能源三电铝制品、定制铝制品和自密封轮胎四条产品线。

当前仓库可以本地运行和构建，已具备类型化内容层、真实轮毂生成目录、WordPress 读取接口和询盘 API。真实产品页面接线、生产数据库、邮件投递闭环与 OpenNext 部署仍在实施中，因此本仓库当前属于**开发与本地验证阶段**。

## 先读什么

| 文档 | 作用 |
|---|---|
| [`PROJECT.md`](PROJECT.md) | 业务范围、首发目标与不可突破的边界 |
| [`STATUS.md`](STATUS.md) | 当前进度、阻断项与下一步 |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | 系统模块、接缝、数据流和目标运行时 |
| [`ARCHITECTURE/README.md`](ARCHITECTURE/README.md) | 架构阅读导航 |
| [`PAGE-SPECS/README.md`](PAGE-SPECS/README.md) | 首页、产品页和询盘页施工规格 |
| [`DECISIONS.md`](DECISIONS.md) | 已定方案及其理由 |
| [`DOCUMENTATION.md`](DOCUMENTATION.md) | 全仓文档入口 |

## 业务范围

四条产品线平行进入同一产品中心和询盘系统：

- 轮毂：旋压、锻造和经过审核的真实型号；
- 新能源三电铝制品；
- 定制铝制品；
- 自密封轮胎。

深圳峰徊是网站品牌和项目对接主体。供应商工厂、图片、认证、专利、测试与产能必须按真实主体和授权公开，不能因股东或合作关系自动写成峰徊自有能力。

首期完成内容展示、真实轮毂浏览、能力说明、技术内容和项目询盘。首期不包含在线支付、订单管理、客户账号、自研 CRM、AI 客服和公开工程文件上传。

## 技术结构

| 层 | 当前选择 | 当前状态 |
|---|---|---|
| Web | Next.js 16 App Router、React 19、TypeScript strict | 已运行 |
| UI | Tailwind CSS v4、Base UI、Lucide、项目设计令牌 | 已运行 |
| 内容接缝 | `src/content/*.ts` + `src/content/types.ts` | 已运行，页面以本地内容为主 |
| 内容后台 | Headless WordPress REST + MySQL | 客户端与本地实验场已建，页面未系统接入 |
| 轮毂数据 | 1349 型号、3485 变体的生成目录 | 已生成；公开发布覆盖层与页面接线待完成 |
| 询盘 | `/api/inquiries`、验证、快照、邮件调用 | API 已有；当前内存存储，生产数据库待完成 |
| 部署 | OpenNext 目标架构 | 当前为 `output: "standalone"`，OpenNext 尚未配置 |

完整结构见 [`ARCHITECTURE.md`](ARCHITECTURE.md)。

## 本地运行

要求：Node.js 24 或更高版本，npm。

```bash
npm install
npm run dev
```

默认访问 `http://localhost:3000`。

常用校验：

```bash
npm run lint
npm run typecheck
npm run build
npm run check
```

`npm run check` 依次执行 lint、typecheck 和 build。

## 环境变量

本地页面默认不要求外部服务。WordPress 和邮件只有显式配置后才启用相应真实适配器。

| 变量 | 用途 | 说明 |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | canonical、OG 和 sitemap 基址 | 构建时固化；正式构建必须核对 |
| `WP_API_URL` | WordPress REST 基址 | 与 `WP_MODE=live` 同时存在才读取真实 CMS |
| `WP_API_TOKEN` | WordPress 服务端认证 | 只能留在服务端 |
| `WP_MODE` | WordPress 模式 | 字面量 `live` 才启用真实读取 |
| `RESEND_API_KEY` | 询盘邮件发送 | 生产缺失时 POST 返回 503，防止假成功 |
| `INQUIRY_FROM` | 发件地址 | 必须完成域名和服务商验证 |
| `INQUIRY_TO` | 销售接收地址 | 使用正式责任邮箱 |
| `INQUIRY_ADMIN_TOKEN` | 受保护的询盘列表读取 | 未配置时 GET 能力关闭并返回 404 |

不要提交 `.env*`、本地 WordPress 凭据、数据库文件或任何真实客户数据。

首页、About 与 Capabilities 媒体已经接入 Headless WordPress。开发时可用：

```bash
WP_MODE=live \
WP_API_URL=http://127.0.0.1:8081/wp-json/wp/v2 \
npm run dev
```

服务端按 WordPress 媒体 ID 批量读取正式 URL、alt 和 caption；CMS 不可用时回退到仓库内同一张批准图片。About 当前绑定 11 张制造媒体；Capabilities 绑定 12 张工程、成形、检查与验证媒体。其余页面仍在逐步接线。

## 主要路由

### 首发目标

| 路由 | 作用 |
|---|---|
| `/` | 公司定位、四条产品线、制造能力与项目入口 |
| `/products` | 四条产品线入口 |
| `/products/wheels` | 真实轮毂目录与筛选 |
| `/products/wheels/[model]` | 真实型号、批准 variant 和上下文询盘 |
| `/products/wheels/flow-formed` | 旋压轮毂入口 |
| `/products/wheels/forged` | 锻造轮毂高端定制能力 |
| `/products/ev-components` | 新能源三电铝制品能力 |
| `/products/custom-aluminum` | 定制铝制品能力 |
| `/products/safety-tires` | 自密封轮胎说明与证据 |
| `/about`、`/capabilities` | 公司角色、合作制造和质量能力 |
| `/custom-development` | 项目开发路径 |
| `/request-a-quote` | 四产品线与 B/C 共用询盘 |
| `/thank-you` | 服务端确认后的询盘回执 |
| `/resources`、`/resources/[slug]` | 技术内容 |
| `/support/*` | 隐私与交易政策 |

仓库仍保留 fitment、dealers、tools、insights 等克隆阶段路由。它们正在做首发范围审计，不能因为路由存在就当作已批准上线内容。

## 内容与产品数据

### 内容接缝

页面组件从 `src/content/*.ts` 读取类型化内容。`src/content/types.ts` 是页面与 WordPress 之间的接口；把本地内容换成 WordPress 数据时，适配器必须返回相同形状，页面组件不随数据源变化。

公开文案不能硬编码在 React 组件里。修改内容类型等于修改 WordPress 契约，需要同步记录到 `DECISIONS.md`。

### 真实轮毂数据

只读事实源位于 `assets/`，生成结果位于 `src/content/wheel-catalogue.ts`。当前数据包含 1349 个型号和 3485 条变体，其中 1073 个型号匹配图片、276 个无图。

匹配图片只是技术候选。一个型号进入目录、详情、筛选、询盘和 sitemap 前，还需要发布、图权、供货、规格和名称审核。无图或未批准型号不生成占位页。

### 素材与证据

- `assets/`：只读原始数据、图片和语料；
- `resources/`：提取过程、来源、截图和核验；
- `outputs/`：可评审交付物；
- `public/`：可以由浏览器请求的公开资源；
- WordPress 媒体：编辑与发布候选，存在不代表已获公开授权。

## 询盘系统

所有入口最终使用同一询盘契约。产品页可以带入产品线、型号、生产代码和显示规格，服务端必须重新验证并保存不可变快照。

当前实现：

- `POST /api/inquiries` 支持 JSON 校验、先保存后发信和 201/422/503 状态；
- `GET /api/inquiries` 默认关闭，配置管理 token 后才允许读取；
- 存储仍是进程内 Map，服务重启会丢失；
- 邮件当前同步调用 Resend，并用简单布尔值记录结果。

生产目标：WordPress CPT 事务写入 inquiry、上下文、隐私记录和 outbox（DEC-055，单库）；幂等键防止重复；后台发送器与回调分别记录 accepted、delivered、bounced 和 unknown。数据库事务成功才算询盘成功。

## 项目硬规则

1. 无图、未确认、未授权产品不上架，也不进入 sitemap。
2. 规格来自同一条实际 variant，不跨记录拼接。
3. 没有产品数据的产品线发布能力页，不制造空型号页。
4. 页面组件只消费类型化内容，不直接读取 WordPress 或供应商原始结构。
5. 组件使用设计令牌；滚动显现和视差使用声明式 motion 属性。
6. 竞品只作为结构参考，公开产物中的竞品品牌、文案和资源必须为零。
7. 不得把 Next.js 改成纯静态导出；询盘 API 需要服务端运行时。
8. 数据库失败不能显示成功；邮件接受不等于邮件送达。
9. 未批准法律、性能、产能、适配和售后承诺不公开。
10. 未经授权不提交、不推送、不发真实邮件、不部署、不改 DNS。

## 当前上线阻断项

- 正式英文公司名、域名、销售邮箱、供应关系和图片授权尚未全部冻结；
- 首页、轮毂目录与详情仍有旧数据或旧业务文案需要替换；
- WordPress 尚未成为页面的实际内容来源；
- 询盘尚无生产持久化、事务 outbox 和邮件事件闭环；
- OpenNext 目标平台、费用、回滚和恢复尚未验证；
- 政策文本、旧路由和竞品残留仍需逐项发布审计。

下一步和负责人状态以 [`STATUS.md`](STATUS.md) 为准。

## 部署说明

当前 `next.config.ts` 的 `output: "standalone"` 只用于保留服务端运行能力，不代表生产部署方案已经完成。目标部署层是 OpenNext，具体平台需要先通过本地和预发布样机验证。

禁止设置 `output: "export"`。正式构建前必须确认 `NEXT_PUBLIC_APP_URL`，并在产物中检查 canonical、OG 和 sitemap。仓库里**已没有**根 `Dockerfile` / `docker-compose.yml` —— 那套克隆模板留下的文件已归档（DEC-060）。生产部署文件要等 OpenNext 平台定了再写，不要拿模板默认值当基础。

## 历史与参考

现行文档入口为 [`DOCUMENTATION.md`](DOCUMENTATION.md)。被替代的 2026-10-01 架构、页面施工图和交接资料完整保存在 [`archive/2026-10-01-document-baseline/`](archive/2026-10-01-document-baseline/README.md)，用于追溯，不驱动当前开发。
