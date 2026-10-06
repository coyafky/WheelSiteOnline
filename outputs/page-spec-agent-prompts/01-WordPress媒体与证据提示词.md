# WordPress 媒体与证据提示词

当页面包含 WordPress 媒体时，把这段追加到主提示词后面。

```text
本页必须完成 WordPress 媒体接线，不接受只把本地图片路径硬编码进组件。

请按以下顺序执行：

1. 从目标 Page SPEC 提取所有媒体 ID、预期用途、alt 和证据边界。
2. 用一次 REST 集合请求读取这些媒体：
   `/wp-json/wp/v2/media?include=<ID列表>&per_page=<数量>&_fields=id,title,alt_text,caption,source_url,media_details`
3. 对照原图逐张确认内容；如标题和实际图片错位，修正后台标题并在任务记录中说明。
4. 为公开媒体补完整 alt 和 caption。alt 只描述画面，不塞营销主张；caption 说明它是产品、流程、测试场景还是供应商资料中的环境。
5. 补齐来源、页面用途、内容角色、品牌可见状态、claim ID、批准状态；测试图增加 test record ID。
6. 在 `src/content/<page>.ts` 建立 `MediaAsset` 对象，同时提供同图本地 WebP。
7. 在 `src/lib/wordpress/<page>.ts` 收集本页全部媒体，通过 `resolveWordpressMediaCollection` 一次批量解析，再按 WordPress ID 回填稳定视图模型。
8. React 组件只接收已经解析的 `MediaAsset`。`hasRender=false` 或未批准时走既有品牌兜底；不要请求不存在的文件。
9. live 验收必须报告：REST 请求次数、WordPress URL 数量、17/全部图片自然宽度是否大于 0。
10. fallback 验收必须报告：WordPress URL 为 0、本地 WebP 数量与公开媒体数量一致、页面返回 200。

证据纪律：

- 工厂图片不自动证明产能、认证或型号性能。
- 实验室图片不自动证明测试通过。
- 车辆案例图不自动证明车型适配、客户关系或商业授权。
- 证书缩略图不可读时不公开，也不做 Logo 墙。
- 用户确认媒体库可读取，不代表允许从图片内容继续推导新主张。
```

## 建议的媒体元数据字段

| 字段 | 用途 |
|---|---|
| `_wp_attachment_image_alt` | 无障碍图片描述 |
| `post_excerpt` | WordPress caption |
| `fh_usage_scope` | 页面与模块使用范围 |
| `fh_source_entity` | 原始资料主体 |
| `fh_source_document` | 来源文件 |
| `fh_source_page` | 来源页码 |
| `fh_rights_status` | 图权状态 |
| `fh_approval_status` | 页面使用批准状态 |
| `fh_content_role` | product / process / validation / research / production 等 |
| `fh_brand_visibility` | visible / not_present 等 |
| `fh_claim_ids` | 画面关联主张，不等于报告结论 |
| `fh_test_record_id` | 测试记录关联 |
| `fh_responsible_entity` | 研发/生产责任主体 |

