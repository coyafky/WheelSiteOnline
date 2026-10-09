# 无需上级请示的商用整改

状态：completed
完成日期：2026-10-08
审计基线：`outputs/reports/01-commercial-readiness-audit-2026-10-08.md`
上位任务：`work/queued/2026-10-08-commercial-launch-remediation.md`

## 边界

本任务只处理仓库内可依据既有规格、安全基线和证据纪律完成的事项。正式主体、域名、
联系信息、法律文本、首发产品、图片/图权、部署平台、付费服务和上线授权未由开发代理代决。

## 已完成

1. **询盘链路**：实现 QF01–QF03 两步四线/B-C 表单、动态准备提示、主动隐私同意、
   浏览器幂等键与 200/201 重放；删除旧轮毂专用字段和不实成功承诺。
2. **服务端边界**：增加 16 KiB 请求体上限、Origin 白名单、蜜罐、最短填写时间、
   IP/邮箱窗口限流；超长字段显式 422；权威后台以外的 GET 恒返 404。
3. **WordPress 权限**：新增 `fh_inquiry_sales` 与专属 capability，分离业务读取/维护和
   邮件派发；Contributor/Author 无权读取询盘；验收脚本新增三项权限矩阵。
4. **发布护栏**：未批准法律、经销、洞察与适配内容 noindex 并退出 sitemap；未配置
   正式站点 URL 时 robots/sitemap fail-closed；假联系渠道隐藏。
5. **SEO/运行时**：移除语言 cookie 和未完成语言切换；根语言固定英文；统一站点 URL；
   永久迁移改 308；sitemap 不再伪造当前时间。
6. **安全与依赖**：增加 CSP/HSTS/nosniff/frame/referrer/permissions 响应头；升级
   Next.js 与 eslint-config-next 至 16.4.0；生产依赖审计归零。
7. **UI**：询盘外壳与四线契约一致；移动筛选展开时隐藏浮动询盘按钮；偏距公式限制在
   自身滚动容器，390px 视口整页不再横向溢出。
8. **成功状态防伪**：API 在持久化成功后签发 15 分钟 HMAC 回执；感谢页验证询盘号、
   时间和签名，直接访问或篡改 URL 不再伪造成功。
9. **工程门禁**：新增 7 项询盘契约测试、中文 CI；更新三份报告、Page SPEC、架构、
   状态、决策与上位任务。

## 验证证据

- `npm run check`：通过；7/7 测试、lint、typecheck、Next.js 16.4.0 build 全部成功；
  构建生成 188 个页面数据项。
- `npm audit --omit=dev`：0 漏洞。
- `git diff --check`：通过。
- `python3 scripts/verify-inquiry-backend.py`：Docker 环境 69/69 通过，覆盖鉴权、schema、
  服务端校验、201/200 幂等、事务回滚、outbox、cron、租约、退避、5 次放弃、清理与权限矩阵。
- Next 路由重放：同一幂等键首交 201、重放 200，数据库只有一条 CPT 和一条 outbox；
  测试记录已清理。
- API：匿名 GET 404、恶意 Origin 403、超大请求体 413。
- SEO：未批准路径不在 sitemap；法律页 `noindex,nofollow`，其他草稿页 `noindex,follow`；
  `/manufacturing` 与 `/resources*` 为 308。
- Playwright 390×844：两步询盘、隐私勾选、成功跳转通过；筛选展开时浮动按钮
  `opacity=0`、`pointer-events=none`；偏距页 `scrollWidth=390`。
- 感谢页：无回执与篡改回执显示“无法确认”；有效 HMAC 回执显示“已记录”。
- 截图：`resources/screenshots/2026-10-08-commercial-audit/`。

## 保留给上位任务

- COM-002、007、008、009、011、013、020、021、023、027–030；
- COM-006 的平台边缘限流、人机验证取舍与异常告警；
- COM-017 的正式域名和 OG 资产；
- COM-022 的完整浏览器 E2E、无障碍、真机和预发布测试；
- 真实邮件 delivered/bounced、生产 cron、备份恢复、回滚和 DNS/索引/真实发信授权。

## 收尾

未 commit、未 push、未部署、未改 DNS。除本地验收通知外，没有向客户地址发信。
