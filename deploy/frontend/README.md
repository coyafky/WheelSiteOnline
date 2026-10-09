# 9080 询盘联调前端

这是腾讯云单机上的端到端测试入口，不是 DEC-009 所定义的正式 OpenNext 部署。

## 端口与数据流

```text
浏览器 :9080 → nginx → 127.0.0.1:9081 → Next.js 容器
Next.js 容器 → Docker 内部网络 → WordPress 容器
WordPress 公网后台/API → :7080
```

构建阶段必须把 `NEXT_PUBLIC_APP_URL` 固定为 `http://119.91.205.130:9080`，否则
canonical、OG 与 sitemap 会被静默写成错误地址。运行阶段的 CMS 读取和询盘提交走
Docker 内部网络，浏览器不会接触 WordPress 服务密钥。

镜像构建使用仓库内最后有效快照，避免构建阶段依赖 CMS 可用性；容器运行时切换为
`WP_MODE=live`，启动后必须调用签名缓存失效接口，使页面读取当前 WordPress 内容。

服务器只有 2 GB 内存，**不得在服务器执行 `next build` 或 `docker compose build`**。
前端必须在开发机使用已通过门禁的 `.next/standalone` 与
`deploy/frontend/Dockerfile.prebuilt` 生成 `linux/amd64` 镜像，完成本地运行冒烟后再上传；
服务器只做 SHA-256 校验、`docker load` 和 `docker compose up --no-build`。

安全响应头按 `NEXT_PUBLIC_APP_URL` 的协议生成：HTTP 联调地址不能携带
`upgrade-insecure-requests` 或 HSTS；将来切换正式 HTTPS 域名时，两者自动恢复。

## 限制

- 9080 只有 HTTP，nginx 强制返回 `X-Robots-Tag: noindex, nofollow`。
- WordPress SMTP 使用 `.invalid` 测试收件地址，验证的是持久化与失败不丢询盘。
- 正式发布仍需域名、TLS、OpenNext 目标平台、邮件资源、监控和备份恢复演练。
