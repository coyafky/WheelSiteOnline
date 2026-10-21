# 本地交互整体失效修复说明

日期：2026-10-11

## 结论

轮毂筛选、询盘弹窗、询盘反馈与导航同时失灵的共同原因是 React 没有完成客户端水合，而不是四套业务逻辑同时损坏。

## 证据链

1. 本机同时存在三个开发服务：3000 属于 PersonalWebsite，3100 属于 Lanhui-web-static，轮毂站实际运行在 3200。浏览器旧地址 `127.0.0.1:3000` 不是当前轮毂站进程。
2. 在正确的 3200 页面上，服务端日志明确记录：`Blocked cross-origin request to Next.js dev resource`，来源包括 `127.0.0.1` 与当时的局域网地址。
3. 修复前页面能看到服务端 HTML 和 CSS，但 `motion-ready=false`，导航的键盘、hover、click 均不能改变 `aria-expanded`，直接询盘按钮不能打开 Dialog；控制台持续出现 HMR WebSocket 握手失败。
4. 修复并重启后，`motion-ready=true`、HMR connected、控制台 0 error；同一页面导航展开、Dialog 打开、Toast/Badge 更新均成功。

## 代码修复

### Next.js 开发源

`next.config.ts` 增加 `allowedDevOrigins`：

- 默认允许 `127.0.0.1`；
- 自动读取本机活动 IPv4 网络接口，支持通过当前局域网地址预览；
- 允许用 `NEXT_DEV_ALLOWED_ORIGINS` 追加稳定本地域名或开发隧道；
- 只影响 Next.js 开发资源保护，不放宽生产 CSP、询盘 Origin 校验或部署边界。

### 桌面导航

桌面下拉原来在鼠标进入时先展开，随后 click 又按相同状态切换为关闭。现在：

- 鼠标点击保持当前菜单展开；
- 键盘 Enter/Space 仍可切换；
- Escape 可关闭并保留按钮焦点；
- 移动端切换改用函数式状态更新，避免读取陈旧状态。

## Playwright 实测

- 型号搜索提交后 URL 为 `?q=DM902`，结果包含 DM902；
- “Request this configuration” 在当前详情页打开 Dialog；
- “Add to total enquiry” 显示 Astryx Toast，浮动询盘入口 Badge 为 1；
- 直接询盘与总询盘清单仍隔离；
- 数量 5000、422、429、503、邮件待投递与成功状态均通过既有回归；
- 当前局域网地址请求页面和 Next 开发脚本均返回 200。

## 验收结果

- `npm test`：42/42
- `npm run lint`：通过
- `npm run typecheck`：通过
- `npm run build`：191/191 页面
- `CI=1 PLAYWRIGHT_PORT=3300 npx playwright test --project=chromium --retries=0`：55/55
- `git diff --check`：通过

## 本地预览约定

轮毂站当前使用 `http://127.0.0.1:3200`。若 3000 端口仍由其他项目占用，不要用旧的 3000 标签页判断轮毂站状态；局域网预览使用终端显示的本机 IPv4 地址加 `:3200`。
