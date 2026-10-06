# outputs/

保存**可以交付、审核或使用的结果**。

```
outputs/
├── reports/      # 审计报告、分析报告
├── designs/      # 设计稿、原型
├── exports/      # 导出文件
├── documents/    # 成文文档
└── releases/     # 发布产物
```

判断标准：如果这个文件可以发给用户、客户、同事、开发团队或运营团队进行审核
或使用，它通常属于 outputs。

## 与 docs/ 的区别

| | `outputs/` | `docs/` |
|---|---|---|
| 性质 | 交付物 | 项目文档 |
| 生命周期 | 交付后即可归档 | 长期维护 |
| 例子 | 给丰怀看的审计报告 | next-wp 架构调研（见 DEC-007） |

## 注意

**不要把临时文件放这里。** 本目录只放成型、可交付的东西。

## 当前内容

- [轮毂公开目录架构方案（讨论稿）](designs/wheel-publication-architecture-2026-10-06.md)：定义源记录、WordPress 发布覆盖层和公开目录模块，覆盖目录、详情、旋压、sitemap 与询盘。
- [当前实现状态审计（2026-10-06）](reports/current-implementation-status-2026-10-06.md)：逐路由核对 Page SPEC、WordPress、真实目录、询盘、SEO、部署与构建结果，并列出首发阻断项。
- `site-launch-plan/`：2026-10-04 英文首发计划、数据与询盘设计、素材分配、任务卡和代码资产盘点。
- `hangpeng-wheel-media/`：从航鹏画册提取的 68 张候选图片、清单、来源记录与本地浏览页。
- [架构与 README 校准审计](architecture-alignment-audit.md)：三份核心文档与当前代码、决策、Page SPEC 的差异和剩余实现缺口。
- `self-sealing-tire-page-review/`：自密封轮胎页 1440×900、1280×800、390×844 与 360×800 全页验收截图。
- [`page-spec-agent-prompts/`](page-spec-agent-prompts/README.md)：供其他 agent 按 Page SPEC 实施剩余页面的主提示词、WordPress 媒体提示词、独立验收提示词和七类剩余页面启动提示词。
- [`forged-wheel-review/`](forged-wheel-review/)：锻造轮毂定制页 1440×900 与 390×844 浏览器验收截图；WF05 因证据不足未公开。

以上均为可评审成果；候选素材尚未自动发布到网站。

## 定制铝制品页验收截图（2026-10-06）

- 目录：`outputs/custom-aluminum-review/`
- `custom-aluminum-1440x900.png` — 桌面基准视口
- `custom-aluminum-390x844.png` — 移动基准视口
- `custom-aluminum-200pct-zoom.png` — 200% 放大等效检查
- 对应路由：`/products/custom-aluminum`（Page SPEC `PAGE-SPECS/custom-aluminum.md`，当前 `noindex,follow`）

## 三电铝制品页验收截图（2026-10-06）

- 目录：`outputs/ev-components-review/`
- `ev-components-1440x900.png` — 桌面基准视口
- `ev-components-390x844.png` — 移动基准视口
- `ev-components-200pct-zoom.png` / `-720x450.png` — 200% 放大等效检查
- 对应路由：`/products/ev-components`（Page SPEC `PAGE-SPECS/ev-components.md`）
