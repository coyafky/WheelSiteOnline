# Knocket Web Widget 接入可行性评估

- 日期：2026-10-10
- 范围：评估 `https://knocket.trtc.io/templates/wordpress-chat/` 是否适合接入峰徊现有 Next.js + 无头 WordPress 站点
- 结论：技术上可接入；当前不建议直接全站上线。可在完成隐私、数据归属、性能和询盘分流验收后，以补充聊天入口小范围试点。

## 一、核查到的事实

1. Knocket 的 WordPress 方案不是必须安装 WordPress 插件，而是生成一个带 identifier 的异步脚本，例如：
   `https://trtc.io/knocket-sdk/sdk.js?identifier=YOUR_IDENTIFIER`。
2. 官方定位是 Web Widget、Contact Page 和统一收件箱；访客消息可以进入 Knocket Inbox，并可选 Telegram 或 Email 通知，Telegram 支持引用回复回到原会话。
3. 模板页宣传免费、无广告、无席位限制，但这是供应商产品承诺，不等于我们的业务数据、服务连续性或法律责任已经得到保证。
4. 2026-10-10 对模板页实际引用的 SDK 做只读请求，响应为 3,264,716 bytes，且脚本内可见 Tencent/TRTC、`my-imcloud.com`、`api.trtc.io`、`events.im.qcloud.com` 等外部通信或资源域名。该数字是当前响应的观测值，不应当当作供应商永久固定的包大小。
5. Knocket 的聊天隐私模块（2026-07-10）说明会处理 IP、访问时间、日志、监控和配置数据，并说明日志保留 7 天、监控数据保留 2 天、配置数据在终止后 2 个月删除；服务区域和数据处理范围仍需按实际账户配置确认。
6. 供应商条款允许对服务进行修改、限制或终止，并按“现状”提供服务。因此不能把它作为唯一询盘保存或唯一销售通知渠道。

## 二、与现有站点的兼容性

| 维度 | 判断 | 说明 |
|---|---|---|
| 前端框架 | 可行 | 我们是 Next.js，不是 WordPress 前台；应在根布局或受控客户端包装器中使用 `next/script`，不能照抄 `header.php` 方案。 |
| WordPress | 间接兼容 | 现有 WordPress 是内容后端和询盘持久化端，Knocket 不会自动写入我们的 `fh_inquiry` CPT，也不会自动产生产品/变体快照。 |
| 询盘流程 | 不可替代 | 现有 `/api/inquiries` 有服务端产品复核、幂等、隐私版本门槛、WordPress 事务保存和邮件发件箱；目前没有证据证明 Knocket 能把聊天直接转换成同一契约。 |
| 内容接缝 | 可保持 | 只把聊天开关、identifier、欢迎语和显示范围作为站点配置；不要让页面组件读取 Knocket 原始数据。 |
| CSP | 当前会阻断 | `next.config.ts` 当前只允许本站和 WordPress 的脚本/连接；接入必须先按实际 SDK 网络请求补充精确 allowlist，并重新做安全回归。 |
| 性能 | 有明显风险 | `async` 不阻塞 HTML 解析，但第三方脚本仍需下载、解析、执行，并可能加载额外字体、音频、图片和实时通信资源；3.26 MB 的当前 SDK 不能视作“零成本”。 |
| 多语言 | 可能可行 | 供应商声称支持多语言，但站点四种 URL 语言仍需单独验收欢迎语、离线语、方向性和移动端布局。 |
| 品牌与 CTA | 需要约束 | 现有页面已有浮动询价、产品详情直接询盘和完整询盘页。全站再放一个聊天气泡会造成两个竞争性主入口。 |

## 三、推荐的接入边界

如果业务希望试用，建议采用以下边界：

- Knocket 只处理“快速提问、联系方式、人工回访”，不承诺车型适配、载荷、认证、交期、价格或供应事实。
- `/request-a-quote`、`/contact`、`/thank-you` 和隐私页面不显示 Knocket，避免干扰正式询盘、成功回执和同意说明。
- 首轮只在产品能力页、轮毂详情页或 About/Capabilities 页面试点，并在欢迎语中引导需要规格、数量和交期的访客使用正式询盘。
- 不启用未经审核的 AI Agent、自动报价或知识库回答；任何工程事实仍回到已审核页面和正式询盘。
- Knocket 消息不作为询盘成功凭证。销售必须把可报价信息转入正式询盘或内部流程，并保留人工复核责任。
- 不在 URL、聊天预填字段或第三方用户身份中发送未确认的产品规格、客户隐私或内部数据。

## 四、上线前必须补齐的验证

1. 让供应商明确：聊天内容、附件、IP、访客标识、会话历史的控制者、处理者、存储区域、保留/删除机制、导出能力和分包商。
2. 确认中国、欧盟/英国及目标经销商所在区域的服务区和跨境处理要求；由业务/法务确认站点隐私政策是否需要新增第三方聊天说明和同意机制。
3. 用我们自己的测试账户生成 identifier，在本地 CSP 下实际打开、发消息、Telegram/Email 通知、回复、刷新和移动端回访；不要使用模板页的公开 identifier。
4. 记录真实浏览器网络请求，确定 `script-src`、`connect-src`、`img-src`、`font-src`、`media-src`、WebSocket 和可能的 iframe 依赖，不能只凭营销页猜 allowlist。
5. 做 Lighthouse/真实移动设备对比，设定第三方脚本预算；如果页面首屏、交互延迟或控制台错误不达标，撤销试点。
6. 做故障演练：Knocket 不可用、脚本超时、账户被暂停、通知失败时，正式询盘仍必须可用，且页面不出现破图、遮挡或不可关闭的浮层。
7. 确认供应商账户归属、管理员交接、备份和退出方案；不能只由个人 Telegram 账号接收销售线索。

## 五、最终建议

**可以加入，但现在只批准“受控试点评估”，不批准直接全站生产接入。**

优先级上，正式询盘页、产品上下文和 WordPress 持久化仍是主链路；Knocket 的价值是降低访客发起对话的门槛，尤其适合捕获“还没准备好填写完整询盘”的访客。它不应成为产品事实、询盘记录或销售责任的真相源。

## 参考资料

- [Knocket WordPress Live Chat 模板](https://knocket.trtc.io/templates/wordpress-chat/)
- [Knocket WordPress 安装说明](https://knocket.trtc.io/blog/wordpress-live-chat/)
- [Knocket Web Widget 教程入口](https://knocket.trtc.io/tutorials/)
- [Knocket 聊天隐私模块](https://knocket.trtc.io/legal/privacy/)
- [Knocket Terms of Service](https://knocket.trtc.io/legal/terms/)
- [当前站点 CSP 与安全响应头](../../next.config.ts)
