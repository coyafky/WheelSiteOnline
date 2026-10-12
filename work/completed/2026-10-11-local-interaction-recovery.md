# 本地交互整体失效诊断与修复

## 症状

页面 HTML 与样式正常，但轮毂筛选增强、询盘弹窗、导航下拉等客户端交互同时失效；开发控制台持续出现 HMR WebSocket 握手失败。

## 根因

1. 本机 3000 端口由另一个 PersonalWebsite 项目占用，轮毂站实际运行在 3200；旧预览地址并非当前轮毂站进程。
2. 轮毂站以 `--hostname 0.0.0.0` 启动时，Next.js 16 阻止来自 `127.0.0.1` 与局域网 IP 的开发资源请求，导致 React 未完成水合。
3. 桌面导航同时存在独立的 hover/click 状态竞争：鼠标移入先展开，随后 click 又把同一菜单关闭。

## 已完成

- 为本地回环地址和本机活动 IPv4 接口增加 `allowedDevOrigins`，并保留显式环境变量扩展入口。
- 修复桌面导航鼠标点击与 hover 的状态竞争，保留键盘切换与 Escape 关闭。
- 新增 Playwright 水合、导航回归；实测筛选、直接询盘和总询盘反馈。
- 重启本地开发服务器，并从 127.0.0.1 与局域网地址复验开发资源。

## 验收

- 42/42 单元测试
- lint、typecheck
- 191/191 页面 production build
- 55/55 Chromium E2E
- `git diff --check`

详细证据见 `outputs/reports/22-local-interaction-recovery-2026-10-11.md`。
