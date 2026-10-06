# Page SPEC 页面开发提示词套件

更新：2026-10-06。

这套提示词用于让 Codex、Claude Code、Cursor、OpenCode 或其他能够读写仓库、运行命令和打开浏览器的 agent，沿用当前项目已经验证过的开发方式完成剩余页面。

## 使用顺序

1. 从 [`00-单页实施主提示词.md`](00-单页实施主提示词.md) 复制主提示词。
2. 把目标路由、Page SPEC 文件和本次边界填入占位符。
3. 如果页面包含 WordPress 图片，再追加 [`01-WordPress媒体与证据提示词.md`](01-WordPress媒体与证据提示词.md)。
4. 页面完成后，把 [`02-视觉与生产验收提示词.md`](02-视觉与生产验收提示词.md) 交给同一个 agent，或交给另一个 agent 做独立复核。
5. 剩余页面的建议顺序和可直接复制的任务开头在 [`03-剩余页面启动提示词.md`](03-剩余页面启动提示词.md)。

## 已验证的参考实现

这些文件是“怎样做”的代码参考，不是可以整页复制的模板：

- 首页：`src/app/page.tsx`、`src/content/homepage.ts`、`src/lib/wordpress/homepage.ts`、`src/components/home/`
- About：`src/app/about/page.tsx`、`src/content/about.ts`、`src/lib/wordpress/about.ts`、`src/components/about/`
- Capabilities：`src/app/capabilities/page.tsx`、`src/content/wheel-capabilities.ts`、`src/lib/wordpress/wheel-capabilities.ts`、`src/components/capabilities/`
- 自密封轮胎：`src/app/products/safety-tires/page.tsx`、`src/content/safety-tires.ts`、`src/lib/wordpress/safety-tires.ts`、`src/components/safety-tires/`

## 核心方法

每页都按同一条流水线完成：

```text
Page SPEC
  → 现状/证据审计
  → 类型化内容契约
  → WordPress 服务端适配器
  → 只消费稳定内容对象的 React 组件
  → 路由组装
  → 四视口视觉验收
  → live / fallback / no-JS / production 验收
  → 更新 Page SPEC、STATUS、DECISIONS 与任务记录
```

“页面看起来完成”不等于完成。只有内容证据、CMS 接缝、响应式、生产构建和项目记录同时闭环，任务才可以从 `work/active/` 移到 `work/completed/`。

