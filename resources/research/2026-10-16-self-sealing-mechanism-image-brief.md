# 自密封轮胎 T03 机制图生成与审核记录

- **日期**：2026-10-16
- **用途**：替换 `public/images/safety-tires/` 中带有伪文字/乱码的三张旧 WebP。
- **生成方式**：内置 imagegen；三次独立生成，使用同一视觉约束和 2:1 宽幅构图。
- **候选目录**：`resources/generated/self-sealing-mechanism/`
- **公开状态**：三张候选已完成逐张视觉审核、WebP 转换和页面回归，当前本地内容契约标记为 `approved`；本地 WordPress live 权威内容尚待 Docker 恢复后同步复验。

## 三阶段内容映射

| 文件 | 阶段 | 页面含义 | 不表达的内容 |
|---|---|---|---|
| `01-entry.png` | 01 | 穿刺物进入胎面并到达密封层 | 不表达任意穿刺均安全、不表达测试数值 |
| `02-surround.png` | 02 | 密封材料包围仍在位的穿刺物 | 不表达压力保持结果或性能保证 |
| `03-close.png` | 03 | 穿刺物移除后密封层覆盖小型通道 | 不表达无需检查、修复完成或永久不漏气 |

## 统一生成约束

- 深石墨色橡胶胎面、暖黄色密封层、金属色单一穿刺物、浅色中性背景。
- 同一侧视剖面、同一光线、同一材料比例和相近构图；只改变机制阶段。
- 图片只做解释性视觉，页面标题、阶段编号和工程边界由 HTML 输出。
- 禁止文字、字母、数字、箭头、标签、Logo、水印、车型标识、第三方品牌、伪测量刻度和夸张爆炸效果。

## 实际使用的提示词

### 01-entry

```text
Use case: scientific-educational. Asset type: wide website mechanism illustration for a self-sealing tyre technology page. Primary request: create stage one of a clean technical cutaway illustration showing a tyre tread, inner liner, and polymer sealing layer in side section. One single blunt metallic puncturing object enters vertically through the tread and reaches the sealing layer; the material layer is visible below the tread. Use a realistic but neutral industrial educational diagram style, with a centered consistent composition that can be matched by two later stages. Scene/backdrop: simple light neutral studio background. Subject: dark graphite tyre rubber, a warm amber polymer sealing layer, one metallic puncturing object. Style/medium: polished technical cutaway illustration, restrained and credible, not a dramatic advertisement. Composition/framing: wide 2:1 landscape canvas, same side-section camera angle throughout the set, generous margins, no cropping of the tyre cross-section. Lighting/mood: soft even studio lighting, clear separation of layers. Color palette: graphite, charcoal, warm amber, muted metal, off-white. Materials/textures: rubber tread texture, smooth polymer layer, brushed metal object. Text (verbatim): "". Constraints: show only the physical stage of an object entering the tread and sealing layer; do not imply that every puncture is safe or that no inspection is needed. Avoid: all words, letters, numbers, arrows, labels, no logo, no watermark, no brand, no vehicle, no claim of guaranteed sealing, explosive damage, sparks, cracks, or generated pseudo-text.
```

### 02-surround

同一视觉规格下，将阶段改为：穿刺物仍在胎面中，暖黄色密封材料连续包围穿刺物并缩短空气通道；不显示压力数值、测试结论或文字。

### 03-close

同一视觉规格下，将阶段改为：穿刺物已经移除，胎面下方密封层恢复并覆盖小型通道；“仍需检查”的事实边界保留在 HTML，不画文字或勾选标识。

## 审核结论

- 三张候选均为 1774×887 PNG，宽高比一致。
- 三张候选中未发现可读文字、数字、Logo、水印或乱码。
- 三张候选都使用相同的深色胎面/暖黄色密封层语言，阶段差异与 T03 HTML 标题一致。
- 01 的穿刺物进入密封层；02 的密封层包围仍在位的穿刺物；03 没有穿刺物，密封层在中心通道处闭合。
- 图示不包含 8 mm、测试通过、永久不漏气或无需检查等未经图片证实的结论。
- 最终 WebP 已完成格式检查，并在 1440/390/360 页面截图中复核；截图与自动化边界检查通过。WordPress live 权威同步仍待 Docker 恢复后复验。
