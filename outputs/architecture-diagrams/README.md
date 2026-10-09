# 项目架构图（drawio）

用 [drawio-skill](https://github.com/Agents365-ai/drawio-skill) v3.4.0 生成。
**交付的是可编辑 `.drawio` 源文件**，不是扁平图片 —— 可在 draw.io / VS Code 里继续改。

## 四张图

| 文件 | 内容 | 节点/边 |
|---|---|---|
| `01-system-architecture` | **系统总架构**：事实层 → 流水线 → 内容接缝 → 视图 → 运行时 → 外部系统 | 18 / 20 |
| `02-wheel-data-pipeline` | **轮毂数据链路**（DEC-052）：原始库存 → 清洗 → 闸门选品 → CPT → 批准快照 → 公开集合 → 页面 | 13 / 13 |
| `03-inquiry-write-path` | **询盘写入链路**（DEC-055）：浏览器 → Next API → 服务端复核 → WP 端点 → 事务写 3 表 | 14 / 14 |
| `04-dependency-layers` | **依赖方向分层**（ARCHITECTURE.md §4）：五层单向依赖 + 五条禁止的依赖 | 6 / 5 |

## 重新生成

IR（语义源）在生成时被内联进 `.drawio` 的 `data-*` 属性，可直接重跑：

```bash
python3 ~/.config/alma/skills/drawio-skill/scripts/diagramctl.py inspect 01-system-architecture.drawio
python3 ~/.config/alma/skills/drawio-skill/scripts/validate.py 01-system-architecture.drawio --score
```

导出图片（本机 draw.io 二进制名是 `draw.io`，不是 `drawio`）：

```bash
/Applications/draw.io.app/Contents/MacOS/draw.io -x -f png --width 2400 -o out.png in.drawio
```

## 校验状态

四张图 `validate.py` 均 **0 error / 0 warning**；几何自检 **0 重叠 / 0 文本溢出**
（首版默认 160px 节点宽装不下中文标签，已按「全角 12px / 半角 6.8px」实算宽度并重排坐标）。
