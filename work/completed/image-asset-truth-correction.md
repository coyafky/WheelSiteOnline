# 图片资产纠错：失效索引 / 实体清单 / 非 webp 归档

- **状态**：已完成
- **创建日期**：2026-10-01
- **领域**：资产层（assets/）

## 目标

查清项目图片资产的**真实家底**，并让资产层以「文件系统事实」为准，不再以一份
可能过期的索引为准。

## 执行结果

做了三件事：

1. **新建 `assets/site-data/asset-manifest.json`** —— 按**实际文件扫描**生成，
   实测 **2772 条**（2757 轮毂图 + 15 preview-media），每条标 `public: true` /
   `publicationStatus: "approved"`，字段为
   `{id, path, kind, format, bytes, public, publicationStatus}`。
   抽样首条：`{"id":"wheels/15-1081x-2","path":"/images/wheels/15-1081x-2.webp",
   "kind":"wheel-model","format":"webp","bytes":4726,...}`。
2. **新建 `assets/_non-webp-archive/`** —— 收编 5 个位图
   （`custom-product.jpg` / `custom.png` / `ev-product.jpg` / `ev.png` /
   `tire.png`），站点**只留 webp**（与 `DEC-011` 同源）。
3. **`assets/site-data/image-registry.json` 的 253 条改为 `no-asset`** ——
   诚实标注「索引有此条目，实体不存在」。实测该文件 `assets` 数组 253 条，
   `public` 字段**全为 `false`**（grep 计数 253 条 `"public": false`，无 `true`）。

实测对照：

```
assets/wheel-images-webp/   2757 个文件
assets/preview-media/         15 个文件
资产合计                     2772  ← 与 asset-manifest.json 条数一致
assets/site-data/image-registry.json assets 数组  253 条（全部 public:false）
assets/image/                 ← 不存在（ls 报 No such file or directory）
```

## 重要结论

1. **`image-registry.json` 的 253 条全部指向 `assets/image/...`，该目录不存在。**
   这份索引是**按一个已经消失的图片库生成的**（文件头 `generatedFrom` 写着
   `assets/image/ (disk scan) + assets/image-library/PUBLICATION-MAP.json`），
   项目此前一直把它当资产清单在用，**长期误导**。已加 `reconciledAt: 2026-10-01`
   与 `reconciledNote`（「按实体文件核对：指向不存在路径的记录标 no-asset；
   真实图以 asset-manifest.json 为准」）—— 但 253 条记录本身**保留不删**，
   以留存「曾经有过这样一份索引」这个信息（`AGENTS.md` §8：优先 archive 而非删除）。
2. **真实家底 = `wheel-images-webp/` 2757 张 + `preview-media/` 15 张。**
   `asset-manifest.json`（按文件扫描）从此是**权威来源**，`image-registry.json`
   从此**只作线索，不作依据**。
3. **⚠️ 诚实记账（必须写下来）**：核查过程中，我一度**没有核实文件是否真实存在
   就把 253 条全部刷成 `public:true`**，后**已回滚**为 `no-asset`。
   这个错误的教训正是本条成立的理由本身 —— **一份不核实实体的清单，会把错误
   无声地散播到全站**。凡引用图片处，必须先确认文件真实存在；`public:true`
   只代表「在清单里」，不代表「可用」。
4. **结论已记入 `DEC-018`**：图片资产以**实体文件为准**，废弃失效的
   `image-registry` 索引。

## 未解决问题

- **其他页面/组件里是否仍有代码在引用 `image-registry.json`？** 本轮只更正了
  数据文件本身，**未系统排查引用点**。若有组件仍读该索引，需改成读
  `asset-manifest.json` 或直接确认实体文件 —— 这是一项**独立待办**。
- **新增图片的流程**：需走既有 WebP 命名规则（`DEC-012`）并**重新生成
  manifest**。目前 `asset-manifest.json` 的 `generatedAt` 仍是生成时点，尚无
  自动化脚本保证「新增图后 manifest 同步」—— 存在再次漂移的风险。
- 三条非轮毂产品线**仍无图**（`STATUS.md` Open Questions #7），
  `assets/_non-webp-archive/` 里的 5 个位图正是这三条线的示意素材，等正式资产
  到位后按 WebP 规则重新落地。
