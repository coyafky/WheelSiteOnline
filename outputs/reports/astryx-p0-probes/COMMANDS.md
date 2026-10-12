# P0 探针命令与原始输出索引

所有命令在仓库根目录 `/Users/fkycoya/Documents/Code/WordpressWheelSIte` 执行。
未修改任何业务代码；探针文件都在 `outputs/reports/astryx-p0-probes/`。

## 1. 版本与导出核验

```
node -e "console.log(require('fs').readFileSync('node_modules/@astryxdesign/core/package.json','utf8').match(/\"version\": \"[^\"]+\"/)[0])"
# => "version": "0.6.7"

ls node_modules/@astryxdesign/core/dist | wc -l           # => 120 个子目录
grep -rl "^'use client'\|^\"use client\"" <ComponentDir>  # 每个候选的客户端边界
```

## 2. 路由清单与推导

```
find src/app -name page.tsx | wc -l        # => 38
find src/app -name page.tsx | grep -v '\[' | wc -l   # => 32 static
find src/app -name page.tsx | grep '\[' | wc -l      # => 6 dynamic family files
grep -rln "permanentRedirect\|redirect(" src/app --include=page.tsx  # => 8（含 1 个条件重定向，见下）
```
8 个命中里 `src/app/products/wheels/[model]/page.tsx` 是**渲染模板**（slug 规范化时
才 `permanentRedirect`），不是纯重定向路由。纯重定向 = 7 个：
`gallery/`、`gallery/wheels/`、`manufacturing/`、`resources/`、
`resources/[slug]/`、`resources/bolt-patterns/`、`resources/bolt-patterns/[pattern]/`。
→ **38 − 7 = 31 个渲染模板。**

## 3. SSR 探针（真实渲染，非推测）

```
node outputs/reports/astryx-p0-probes/ssr-probe.mjs   > ssr-probe-output.txt
node outputs/reports/astryx-p0-probes/ssr-probe-2.mjs > ssr-probe-2-output.txt
```
用 `react-dom/server` 的 `renderToStaticMarkup` 直接渲染。

## 4. 运行中开发服务器的实际 HTML

服务器 `http://127.0.0.1:3200`（复用既有 Next 开发进程，未新起进程）。
HTML 快照在 `rendered/`：

```
curl -s -o rendered/<name>.html -w "%{http_code}" http://127.0.0.1:3200<route>
```
