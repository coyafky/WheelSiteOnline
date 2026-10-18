# 首页 LCP 本地测试

- **根因分析** → [`LCP-ROOTCAUSE.md`](./LCP-ROOTCAUSE.md)
- **修复与验证** → [`FIX-VERIFIED.md`](./FIX-VERIFIED.md)

| 脚本 | 用途 |
|---|---|
| `verify-fix.cjs` | **修复后验证**（3 次取中位数 + 断言实取档位）|
| `final-matrix.cjs` | 决定性对照矩阵（A 现状 / B 60vw / C 50vw / D 40vw / E 删图 / F 禁字体）|
| `regress.cjs` | 全站回归扫描（10 页，查图片 4xx / 破裂 img）|
| `oversize.cjs` | 每张图「需要的设备像素 vs 实际拉取档位」超规格倍数 |
| `lcp-probe.cjs` | 单次 LCP 探针（元素 + 相位 + 慢资源）|
| `lcp-throttled-desktop.cjs` | 桌面视口节流 LCP 分解 |
| `lcp-phases.cjs` | 相位分解 + 反事实对照 |
| `quality/local-ab.cjs` | A(3840) vs D(1200) 逐像素渲染比对 |
| `quality/local-A-vs-D.png` | 并排画质对照图 |

跑法：
```bash
cd ~/.config/alma/tools/pw-shot
NODE_PATH=<repo>/node_modules node <repo>/qa-audit/perf/verify-fix.cjs
```

⚠️ 必须先在本地起生产服务：
```bash
cd <repo> && ALLOW_LOOPBACK_WP_MEDIA=true NODE_ENV=production npx next start -p 3000
```

⚠️ **测试纪律（本目录踩过两次）**：任何「禁掉 X → LCP 变好」的结论，
都要先确认 **LCP 元素有没有换人**。详见 `LCP-ROOTCAUSE.md` §五。
