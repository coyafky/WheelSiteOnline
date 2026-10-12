# WordPress 原生内容接管验收报告

- 日期：2026-10-10
- 对应 Issue：`work/active/2026-10-10-wordpress-native-content-takeover.md`
- 范围：Stage 3 第一至第三切片

## 结论

本地 Docker 环境已经具备“运营通过 WordPress 原生文章/Page 管理内容，Next.js 负责展示”
的可运行闭环。博客与 7 个站点页面已完成迁移和权威读取；旧 CPT 与本地类型化内容仍保留，
因此当前是可回退的迁移状态，不是破坏性替换。

## 已实现

### 原生博客

- WordPress 原生 `post` 承载 6 篇 Insights；
- 保留结构化摘要、正文分段、SEO 和特色媒体字段；
- 草稿/撤回不进入公开 REST，拥有编辑权限时可预览；
- 保存、撤回、回收站和删除通知 Next.js 刷新 Insights 缓存；
- 旧 `fh_guide` CPT 仍保留作迁移期兜底。

### 原生页面

- WordPress 原生 `page` 通过页面键管理：`home`、`about`、`capabilities`、
  `product-lines`、`ev-components`、`custom-aluminum`、`safety-tires`；
- 结构化内容先由服务端适配器恢复为 `HomepageContent`、`AboutContent`、能力页和产品线
  既有类型，React 组件不读取原始 WordPress REST 字段；
- 页面具有发布状态、SEO 标题/描述和特色媒体字段；未批准、草稿或字段不完整时
  fail-closed，前台保留最后一次有效本地快照；
- 页面保存、撤回、回收站和删除按页面键刷新对应路径及 `/sitemap.xml`；
- 页面 metadata 已从 Page SEO 读取，缺失时使用仓库内最后一次有效默认值。

### 询盘入口与隐私受控字段

- `request-a-quote` Page 承载 Hero、Step 1/Step 2、字段提示、错误、成功、网络失败和
  邮件待投递文案；
- `thank-you` Page 承载有效/伪造回执、响应窗口和后续说明；
- `privacy` Page 承载隐私版本、同意文本和链接；
- 新增中文模板 [`outputs/templates/2026-10-10-privacy-consent-template.md`](../templates/2026-10-10-privacy-consent-template.md)，
  仅作为待公司/法务确认的编辑底稿；
- 由于本地环境没有业务/法务确认的隐私版本号，`request-a-quote` 与 `privacy` 当前为
  草稿，公开接口返回空集合，前台表单保持禁用。这是预期的 fail-closed 行为，不是迁移失败；
- 授权预览入口支持 `GET /api/preview?secret=...&page=privacy` 与
  `GET /api/preview?secret=...&page=request-a-quote`，前台会显示预览横幅；隐私页直接展示
  当前版本号、同意文本和链接，便于运营在批准前核对实际呈现；
- 版本确认后重新导出/导入即可批准，Next.js 无需修改组件代码。

## 验收记录

| 检查 | 结果 |
|---|---|
| 原生文章迁移与公开读取 | 通过 |
| 原生文章草稿/撤回/授权预览 | 通过 |
| 原生 Page 迁移与结构化字段读取 | 通过 |
| 原生 Page SEO 读取 | 通过 |
| 原生 Page 草稿公开隔离与授权预览 | 通过 |
| 询盘 Page 草稿公开隔离与授权预览 | 通过 |
| 缓存失效路径和 sitemap 覆盖 | 通过 |
| `npm test` | 29/29 |
| `npm run lint` | 通过 |
| `npm run typecheck` | 通过 |
| `npm run build` | 通过 |
| Playwright 询盘、sitemap、缓存失效契约 | 17/17 |
| Insights 与原生 Page Docker 验收脚本 | 通过 |
| `git diff --check` | 通过 |

## 尚未宣称完成的部分

1. 业务/法务尚未确认正式隐私版本号和同意文本，因此两个 Page 尚未批准公开；
2. 生产远端的预览鉴权、回调密钥、真实域名和备份恢复尚未完成；
3. 尚未执行一次由运营编辑真实页面、预览、批准、撤回再恢复的生产演练；
4. 本次没有删除旧 `fh_guide`、旧本地内容或迁移脚本。

## 运营使用边界

迁移期编辑器中的“结构化页面内容（迁移期快照）”字段必须保持合法 JSON，并且内容仍需
经过主体、媒体 alt、证据和法律审阅。保存成功不等于业务批准；只有 WordPress 页面状态为
“已发布”且编辑状态为“已批准”才会进入公开集合。
