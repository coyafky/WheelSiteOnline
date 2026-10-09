# 轮毂数据清洗与 Markdown 导出

- 日期：2026-10-06
- 完成：2026-10-09
- 状态：完成

## 结果

- 以 17 份来源目录与 `WHEEL-CATALOG-ALL.json` 对账；
- 输出 `outputs/exports/wheel-catalogue-by-size.md`；
- 实际口径：1349 条源记录、3485 条 variant、8 个直径组；
- 保留来源目录、重复 model、重复 productionCode、异常规格、图片候选和证据边界；
- 不自动合并重复型号，不跨 variant 拼规格，不把有图候选写成已批准产品；
- 原始 `assets/` 未修改。

## 2026-10-09 收尾修复

旧导出器把导出阶段附加的 `sourceFile/sourceKey` 等定位字段也拿去和事实总表比较，
导致第一条记录 `15寸:1081x` 必然对账失败。现已在比较前剥离两侧派生字段，并完成：

```text
✔ 已输出 outputs/exports/wheel-catalogue-by-size.md
  1349 条源记录 / 3485 条 variant / 8 个直径组
✓ 导出文件与数据一致
```

公开站仍只能消费经过 WordPress 批准覆盖层生成的公开集合，不能直接消费本审核底稿。
