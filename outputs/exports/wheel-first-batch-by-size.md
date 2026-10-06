# 首期公开轮毂候选集 · 每个尺寸 30 个

> 由 `scripts/select-wheel-first-batch.py` 自动生成，不要手改。
>
> 数据源：`assets/wheel-data/WHEEL-CATALOG-ALL.json`＋ `assets/wheel-images-webp/`（2757 张图）。**inbox 那套数据本文件完全未使用。**

## 0. 三件必须先知道的事

### 0.1 ⭐ 按 model 合并是唯一正确口径

事实层是**按（来源目录, model）**分条存的，同一个 model 代码会横跨多个尺寸目录，各目录的 variant 是**彼此不重叠的真实配置**：

| 型号 | 出现的来源目录 | 各记录变体数 | 合并后 |
|---|---|---|---|
| `dx008` | 15寸 / 17寸 / 18寸 | 2 + 4 + 3 | **9** |
| `a015` | 18寸 / 19寸 | 4 + 1 | **5** |
| `dx189` | 越野款（单条记录内已跨 15/17/18） | 7 | **7** |

实测全库 **1219** 个唯一型号来自 **1349** 条源记录（合并掉 130 条）。

> ⚠️ 本脚本**上一版**按「保留分高的那条记录」去重，**丢掉了 257 个变体（734 → 991，26%）** —— 那是真实的数据丢失。本版改为合并后重新打分，并把合并语义写进产物。

### 0.2 13 / 14 英寸凑不出 30 个 —— 是数据里根本不够

`ALL.json` 里 13 寸只有 **1** 个型号、14 寸只有 **2** 个，且都过不了闸门。这两个尺寸**本期无法上架**，不是挑选标准太严。

### 0.3 styleName 里大量第三方商标 —— 法律风险，不是命名问题

实测全部 1219 个型号里有 **425 个（35%）**的 `styleName` 直接写着他人商标。下面按商标列出其涉及的全部型号数：

| 商标 | 出现型号数 | 性质 |
|---|---|---|
| `HRE` | 56 | 第三方轮毂品牌名 |
| `BBS` | 55 | 第三方轮毂品牌名 |
| `WORK` | 44 | 第三方轮毂品牌名 |
| `TE37` | 40 | 第三方轮毂品牌名 |
| `RAYS` | 30 | 第三方轮毂品牌名 |
| `ENKEI` | 12 | 第三方轮毂品牌名 |
| `OZ` | 6 | 第三方轮毂品牌名 |
| `VOSSEN` | 6 | 第三方轮毂品牌名 |
| `WEDS` | 5 | 第三方轮毂品牌名 |
| `丰田` | 33 | 车厂商标 |
| `奥迪` | 34 | 车厂商标 |
| `奔驰` | 30 | 车厂商标 |
| `宝马` | 28 | 车厂商标 |

这些应是供应商用知名型号名做的**样式指代**。若直接当自家产品名对外发布，有商标侵权风险 —— 与设计稿「第三方款式名默认不进入公开视图」一致。

**因此本候选集把「styleName 含商标」整体排除** —— 在前两道闸（有图 + 规格齐）已过的型号里，这一条又打掉 **337** 个（全量口径是 425 个）。

> ⚠️ 判定用的是**关键词启发式**，是**下界不是完整检索**。真实合规审查仍需人工过一遍，别把本清单当法律意见。

### 0.4 「好一点」是怎么算的

闸门（必须**全过**）：

- **G1 有图** —— 无图无法成页（沿用生成器 DEC-013 上架门槛）
- **G2 规格齐** —— 至少一条 variant 的尺寸/孔距/偏距/中心孔/颜色齐全
- **G3 无第三方商标** —— 见 0.3

过闸后再打分排序（0–100 分，权重写在脚本顶部常量，**可调**）：

| 维度 | 满分 | 口径 |
|---|---|---|
| 图片丰富度 | 25 | 图片张数（上限 5 张）—— 图多才好成页 |
| 工艺含金量 | 25 | 旋压/低压+旋压/锻造 满分；低压半分；未标注 0 |
| 规格广度 | 20 | variant 条数（上限 8 条）—— 可下单配置越多越好卖 |
| 颜色可选 | 15 | 颜色数（上限 5 种） |
| 规格完整度 | 10 | 五字段齐全的 variant 占比 |
| 孔距广度 | 5 | 孔距数（上限 3 种）—— 适配车型面 |

## 1. 闸门漏斗

| 阶段 | 型号数 | 说明 |
|---|---|---|
| 源记录数 | 1349 | 按（来源目录, model）分条 |
| 按 model 合并后 | 1219 | 合并掉 130 条重复记录 |
| — 无图剔除 | -255 | 无图不成页 |
| — 规格不全剔除 | -6 | 无一条完整 variant |
| — 含第三方商标剔除 | -337 | 见 0.3 |
| **过闸候选** | **621** | 按 model 合并后的唯一型号数 |

## 2. 每个尺寸的可用量与缺口

| 直径 | 过闸可用 | 已选 | 缺口 |
|---|---|---|---|
| 15 英寸 | 31 | 30 | — |
| 16 英寸 | 41 | 30 | — |
| 17 英寸 | 160 | 30 | — |
| 18 英寸 | 274 | 30 | — |
| 19 英寸 | 146 | 30 | — |
| 20 英寸 | 40 | 30 | — |
| 13 英寸 | 0 | 0 | **缺 30**（数据里不足） |
| 14 英寸 | 0 | 0 | **缺 30**（数据里不足） |

> 15 英寸仅 **31** 个过闸、20 英寸仅 **40** 个过闸、16 英寸仅 **41** 个过闸 —— 这几个尺寸的 30 个候选**几乎没有挑选余地**，等于把绝大多数可用型号都放进去。若后续要严格把关，建议这几个尺寸降低目标数量，而不是放宽门槛。

## 2.5 各尺寸为什么只剩这些（剔除原因拆解）

同一直径的可用量差异极大，原因不在筛选标准，而在数据本身。下表按尺寸拆开每道闸打掉了多少（型号可属多尺寸，故为出现次数）：

| 直径 | 含该尺寸的型号 | 无图 | 规格不全 | 含商标 | 过闸 |
|---|---|---|---|---|---|
| 13 英寸 | 1 | 1 | 0 | 0 | **0** |
| 14 英寸 | 2 | 2 | 0 | 0 | **0** |
| 15 英寸 | 117 | 57 | 0 | 29 | **31** |
| 16 英寸 | 83 | 31 | 1 | 10 | **41** |
| 17 英寸 | 258 | 29 | 2 | 67 | **160** |
| 18 英寸 | 453 | 80 | 2 | 97 | **274** |
| 19 英寸 | 350 | 64 | 1 | 139 | **146** |
| 20 英寸 | 84 | 17 | 0 | 27 | **40** |

## 3. 候选明细（按尺寸）

字段说明：`分` = 总分；`图/规格/颜色` = 图片张数/合并后 variant 数/颜色数；`记录` = 该型号由几条源记录合并而来（>1 表示跨尺寸目录）；`跨` = 该型号同时也出现在哪些尺寸。

### 3.15 英寸（已选 30 / 可用 31）

| # | 型号 | 主目录 | 工艺 | 款式名 | 规格数 | 图数 | 分 | 记录 | 跨 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `DX088` | 15寸 | 旋压 | — | 11 | 13 | 100.0 | 3 | 17、18寸 |
| 2 | `DX189` | 越野款 | 旋压 | — | 7 | 19 | 91.2 | 1 | 17、18寸 |
| 3 | `DX822` | 15寸 | 旋压 | — | 5 | 5 | 89.2 | 1 | — |
| 4 | `ZKX311` | 15寸 | 旋压 | — | 7 | 4 | 87.8 | 1 | — |
| 5 | `DX163` | 17寸 | 旋压 | — | 4 | 12 | 82.3 | 2 | 17寸 |
| 6 | `FF53` | 16寸 | — | — | 31 | 9 | 75.0 | 2 | 16寸 |
| 7 | `ZR-V7` | 16寸 | — | — | 9 | 10 | 75.0 | 2 | 16寸 |
| 8 | `FF13` | 16寸 | — | — | 14 | 12 | 73.3 | 3 | 16、17寸 |
| 9 | `ZR001` | 18寸 | — | — | 7 | 7 | 69.5 | 2 | 18寸 |
| 10 | `DIM687` | 15寸 | 旋压 | — | 3 | 3 | 68.2 | 1 | — |
| 11 | `F68` | 15寸 | — | — | 4 | 6 | 58.7 | 1 | — |
| 12 | `DX146` | 15寸 | 旋压 | — | 3 | 1 | 58.2 | 1 | — |
| 13 | `FF55` | 15寸 | — | — | 5 | 3 | 54.2 | 1 | — |
| 14 | `DX125` | 15寸 | — | 越野款 | 3 | 6 | 53.2 | 2 | — |
| 15 | `LR-853` | 15寸 | — | — | 4 | 3 | 48.7 | 1 | — |
| 16 | `ZT512` | 15寸 | 低压 | 螳螂刀锋 | 5 | 1 | 47.5 | 1 | — |
| 17 | `AV08` | 15寸 | — | — | 5 | 1 | 44.2 | 1 | — |
| 18 | `SR33` | 15寸 | — | — | 4 | 3 | 42.7 | 2 | 16寸 |
| 19 | `LC2715` | 越野款 | — | — | 1 | 5 | 42.2 | 1 | — |
| 20 | `ZT516` | 15寸 | 低压 | — | 2 | 1 | 38.3 | 1 | — |
| 21 | `CJF015` | 15寸 | — | — | 3 | 2 | 35.5 | 1 | — |
| 22 | `Y6002` | 15寸 | 低压 | — | 1 | 1 | 34.2 | 1 | — |
| 23 | `ITTOSAI` | 15寸 | — | — | 1 | 3 | 32.2 | 1 | — |
| 24 | `ZKX315` | 15寸 | — | — | 1 | 2 | 27.2 | 1 | — |
| 25 | `SR23` | 15寸 | — | — | 1 | 1 | 22.2 | 1 | — |
| 26 | `SY5006` | 越野款 | — | 2015五菱征程 | 1 | 1 | 22.2 | 1 | — |
| 27 | `ZKX323` | 15寸 | — | — | 1 | 1 | 22.2 | 1 | — |
| 28 | `ZS019157021S` | 15寸 | — | — | 1 | 1 | 22.2 | 1 | — |
| 29 | `ZS019157022S` | 15寸 | — | — | 1 | 1 | 22.2 | 1 | — |
| 30 | `ZY543` | 越野款 | — | — | 1 | 1 | 22.2 | 1 | — |

图片文件名（供人工核对画面，媒体标题不可信）：

```text
DX088	15-dx088-2.webp, 15-dx088-3.webp, 15-dx088-4.webp, 15-dx088-5.webp, 15-dx088-6.webp, 15-dx088-7.webp, 15-dx088-8.webp, 15-dx088.webp, 17-dx088-2.webp, 17-dx088-3.webp, 17-dx088-4.webp, 17-dx088.webp, 18-dx088.webp
DX189	off-road-dx189-10.webp, off-road-dx189-11.webp, off-road-dx189-12.webp, off-road-dx189-13.webp, off-road-dx189-14.webp, off-road-dx189-15.webp, off-road-dx189-16.webp, off-road-dx189-17.webp, off-road-dx189-18.webp, off-road-dx189-19.webp, off-road-dx189-2.webp, off-road-dx189-3.webp, off-road-dx189-4.webp, off-road-dx189-5.webp, off-road-dx189-6.webp, off-road-dx189-7.webp, off-road-dx189-8.webp, off-road-dx189-9.webp, off-road-dx189.webp
DX822	15-dx822-2.webp, 15-dx822-3.webp, 15-dx822-4.webp, 15-dx822-5.webp, 15-dx822.webp
ZKX311	15-zkx311-2.webp, 15-zkx311-3.webp, 15-zkx311-4.webp, 15-zkx311.webp
DX163	15-dx163-2.webp, 15-dx163-3.webp, 15-dx163.webp, 17-dx163-2.webp, 17-dx163-3.webp, 17-dx163-4.webp, 17-dx163-5.webp, 17-dx163-6.webp, 17-dx163-7.webp, 17-dx163-8.webp, 17-dx163-9.webp, 17-dx163.webp
FF53	15-ff53-2.webp, 15-ff53-3.webp, 15-ff53-4.webp, 15-ff53.webp, 16-ff53-2.webp, 16-ff53-3.webp, 16-ff53-4.webp, 16-ff53-5.webp, 16-ff53.webp
ZR-V7	15-zr-v7-2.webp, 15-zr-v7-3.webp, 15-zr-v7-4.webp, 15-zr-v7-5.webp, 15-zr-v7-6.webp, 15-zr-v7-7.webp, 15-zr-v7-8.webp, 15-zr-v7-9.webp, 15-zr-v7.webp, 16-zr-v7.webp
FF13	15-ff13-2.webp, 15-ff13-3.webp, 15-ff13.webp, 16-ff13-2.webp, 16-ff13-3.webp, 16-ff13-4.webp, 16-ff13.webp, 17-ff13-2.webp, 17-ff13-3.webp, 17-ff13-4.webp, 17-ff13-5.webp, 17-ff13.webp
ZR001	15-zr001-2.webp, 15-zr001-3.webp, 15-zr001.webp, 18-zr001-2.webp, 18-zr001-3.webp, 18-zr001-4.webp, 18-zr001.webp
DIM687	15-dim687-2.webp, 15-dim687-3.webp, 15-dim687.webp
F68	15-f68-2.webp, 15-f68-3.webp, 15-f68-4.webp, 15-f68-5.webp, 15-f68-6.webp, 15-f68.webp
DX146	15-dx146.webp
FF55	15-ff55-2.webp, 15-ff55-3.webp, 15-ff55.webp
DX125	15-dx125-2.webp, 15-dx125-3.webp, 15-dx125.webp, off-road-dx125-2.webp, off-road-dx125-3.webp, off-road-dx125.webp
LR-853	15-lr-853-2.webp, 15-lr-853-3.webp, 15-lr-853-4.webp
ZT512	15-zt512.webp
AV08	15-av08.webp
SR33	15-sr33.webp, 16-sr33-2.webp, 16-sr33.webp
LC2715	off-road-lc2715-2.webp, off-road-lc2715-3.webp, off-road-lc2715-4.webp, off-road-lc2715-5.webp, off-road-lc2715.webp
ZT516	15-zt516.webp
CJF015	15-cjf015-2.webp, 15-cjf015.webp
Y6002	15-y6002.webp
ITTOSAI	15-ittosai-2.webp, 15-ittosai-3.webp, 15-ittosai.webp
ZKX315	15-zkx315-2.webp, 15-zkx315.webp
SR23	15-sr23.webp
SY5006	off-road-sy5006.webp
ZKX323	15-zkx323.webp
ZS019157021S	15-zs019157021s.webp
ZS019157022S	15-zs019157022s.webp
ZY543	off-road-zy543.webp
```

### 3.16 英寸（已选 30 / 可用 41）

| # | 型号 | 主目录 | 工艺 | 款式名 | 规格数 | 图数 | 分 | 记录 | 跨 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `DX616` | 16寸 | 旋压 | — | 4 | 5 | 77.7 | 2 | 17寸 |
| 2 | `FF53` | 16寸 | — | — | 31 | 9 | 75.0 | 2 | 15寸 |
| 3 | `FF109` | 16寸 | — | — | 13 | 11 | 75.0 | 3 | 17、20寸 |
| 4 | `ZR-V7` | 16寸 | — | — | 9 | 10 | 75.0 | 2 | 15寸 |
| 5 | `FF13` | 16寸 | — | — | 14 | 12 | 73.3 | 3 | 15、17寸 |
| 6 | `HP-XF224` | 16寸 | — | — | 10 | 6 | 72.0 | 2 | — |
| 7 | `ZKX1054ZK327` | 16寸 | 旋压 | HF5 | 5 | 3 | 71.8 | 1 | — |
| 8 | `ZR-GT` | 16寸 | — | — | 9 | 8 | 69.0 | 2 | — |
| 9 | `DX424` | 16寸 | — | — | 8 | 6 | 67.3 | 2 | 17寸 |
| 10 | `FF09` | 16寸 | — | — | 7 | 7 | 66.5 | 1 | — |
| 11 | `ZS0191670-01` | 16寸 | — | — | 13 | 3 | 65.0 | 1 | — |
| 12 | `XF043` | 16寸 | — | — | 7 | 5 | 64.8 | 3 | 17、18寸 |
| 13 | `FF01` | 16寸 | 低压 | Spoon-SW388 | 6 | 2 | 64.0 | 1 | — |
| 14 | `DX552` | 16寸 | 旋压 | — | 3 | 2 | 61.8 | 2 | 19寸 |
| 15 | `FS208AV02` | 16寸 | — | — | 5 | 4 | 60.8 | 1 | — |
| 16 | `DX137` | 16寸 | 旋压 | — | 1 | 3 | 57.2 | 1 | — |
| 17 | `SR14` | 16寸 | — | — | 6 | 3 | 55.3 | 1 | — |
| 18 | `VLW143` | 17寸 | — | — | 5 | 4 | 53.2 | 2 | 17寸 |
| 19 | `ZR853X` | 17寸 | — | — | 5 | 3 | 52.8 | 2 | 17寸 |
| 20 | `HP41167001SX` | 16寸 | 低压+旋压 | 2241 | 1 | 2 | 52.2 | 1 | — |
| 21 | `YSW-61` | 16寸 | 旋压 | — | 1 | 2 | 52.2 | 1 | — |
| 22 | `ZS0191670-03` | 16寸 | — | — | 6 | 2 | 51.7 | 1 | — |
| 23 | `HP41167002SX` | 16寸 | 低压+旋压 | 2241 | 1 | 1 | 47.2 | 1 | — |
| 24 | `HP41167003SX` | 16寸 | 低压+旋压 | 2241 | 1 | 1 | 47.2 | 1 | — |
| 25 | `HP41167005SX` | 16寸 | 低压+旋压 | 2241 | 1 | 1 | 47.2 | 1 | — |
| 26 | `HP41167006SX` | 16寸 | 低压+旋压 | 2241 | 1 | 1 | 47.2 | 1 | — |
| 27 | `HP41167007SX` | 16寸 | 低压+旋压 | 2241 | 1 | 1 | 47.2 | 1 | — |
| 28 | `HP41167008SX` | 16寸 | 低压+旋压 | 2241 | 1 | 1 | 47.2 | 1 | — |
| 29 | `HP41167009SX` | 16寸 | 低压+旋压 | 2241 | 1 | 1 | 47.2 | 1 | — |
| 30 | `FF69` | 16寸 | — | — | 7 | 1 | 46.5 | 1 | — |

图片文件名（供人工核对画面，媒体标题不可信）：

```text
DX616	16-dx616-2.webp, 16-dx616.webp, 17-dx616-2.webp, 17-dx616-3.webp, 17-dx616.webp
FF53	15-ff53-2.webp, 15-ff53-3.webp, 15-ff53-4.webp, 15-ff53.webp, 16-ff53-2.webp, 16-ff53-3.webp, 16-ff53-4.webp, 16-ff53-5.webp, 16-ff53.webp
FF109	16-ff109-2.webp, 16-ff109-3.webp, 16-ff109-4.webp, 16-ff109-5.webp, 16-ff109.webp, 17-ff109-2.webp, 17-ff109-3.webp, 17-ff109-4.webp, 17-ff109-5.webp, 17-ff109.webp, 20-ff109.webp
ZR-V7	15-zr-v7-2.webp, 15-zr-v7-3.webp, 15-zr-v7-4.webp, 15-zr-v7-5.webp, 15-zr-v7-6.webp, 15-zr-v7-7.webp, 15-zr-v7-8.webp, 15-zr-v7-9.webp, 15-zr-v7.webp, 16-zr-v7.webp
FF13	15-ff13-2.webp, 15-ff13-3.webp, 15-ff13.webp, 16-ff13-2.webp, 16-ff13-3.webp, 16-ff13-4.webp, 16-ff13.webp, 17-ff13-2.webp, 17-ff13-3.webp, 17-ff13-4.webp, 17-ff13-5.webp, 17-ff13.webp
HP-XF224	16-hp-xf224-2.webp, 16-hp-xf224-3.webp, 16-hp-xf224-4.webp, 16-hp-xf224.webp, 17-hp-xf224-2.webp, 17-hp-xf224.webp
ZKX1054ZK327	16-zkx1054zk327-2.webp, 16-zkx1054zk327-3.webp, 16-zkx1054zk327.webp
ZR-GT	16-zr-gt-2.webp, 16-zr-gt-3.webp, 16-zr-gt-4.webp, 16-zr-gt-5.webp, 16-zr-gt.webp, 17-zr-gt-2.webp, 17-zr-gt-3.webp, 17-zr-gt.webp
DX424	16-dx424-2.webp, 16-dx424.webp, 17-dx424-2.webp, 17-dx424-3.webp, 17-dx424-4.webp, 17-dx424.webp
FF09	16-ff09-2.webp, 16-ff09-3.webp, 16-ff09-4.webp, 16-ff09-5.webp, 16-ff09-6.webp, 16-ff09-7.webp, 16-ff09.webp
ZS0191670-01	16-zs0191670-01-2.webp, 16-zs0191670-01-3.webp, 16-zs0191670-01-4.webp
XF043	16-xf043-2.webp, 16-xf043.webp, 17-xf043-2.webp, 17-xf043.webp, 18-xf043.webp
FF01	16-ff01-2.webp, 16-ff01.webp
DX552	16-dx552.webp, 19-dx552.webp
FS208AV02	16-fs208av02-2.webp, 16-fs208av02-3.webp, 16-fs208av02-4.webp, 16-fs208av02.webp
DX137	16-dx137-2.webp, 16-dx137-3.webp, 16-dx137.webp
SR14	16-sr14-2.webp, 16-sr14-3.webp, 16-sr14.webp
VLW143	16-vlw143-2.webp, 16-vlw143.webp, 17-vlw143-2.webp, 17-vlw143.webp
ZR853X	16-zr853x.webp, 17-zr853x-2.webp, 17-zr853x.webp
HP41167001SX	16-hp41167001sx-2.webp, 16-hp41167001sx.webp
YSW-61	16-ysw-61-2.webp, 16-ysw-61-3.webp
ZS0191670-03	16-zs0191670-03-2.webp, 16-zs0191670-03-3.webp
HP41167002SX	16-hp41167002sx.webp
HP41167003SX	16-hp41167003sx.webp
HP41167005SX	16-hp41167005sx.webp
HP41167006SX	16-hp41167006sx.webp
HP41167007SX	16-hp41167007sx.webp
HP41167008SX	16-hp41167008sx.webp
HP41167009SX	16-hp41167009sx.webp
FF69	16-ff69.webp
```

### 3.17 英寸（已选 30 / 可用 160）

| # | 型号 | 主目录 | 工艺 | 款式名 | 规格数 | 图数 | 分 | 记录 | 跨 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `DX088` | 15寸 | 旋压 | — | 11 | 13 | 100.0 | 3 | 15、18寸 |
| 2 | `ZR698` | 17寸 | 旋压 | — | 8 | 16 | 95.3 | 1 | — |
| 3 | `XF005` | 17寸 | 旋压 | WF多辐、WF款 | 55 | 21 | 94.0 | 3 | 18、19寸 |
| 4 | `DX189` | 越野款 | 旋压 | — | 7 | 19 | 91.2 | 1 | 15、18寸 |
| 5 | `ZK327` | 17寸 | 旋压 | HF5 | 8 | 9 | 91.0 | 3 | 18、19寸 |
| 6 | `ZKX040` | 17寸 | 低压+旋压 | — | 5 | 8 | 84.8 | 2 | 18寸 |
| 7 | `DX163` | 17寸 | 旋压 | — | 4 | 12 | 82.3 | 2 | 15寸 |
| 8 | `ZKX321` | 17寸 | 旋压 | — | 4 | 5 | 79.3 | 1 | — |
| 9 | `TC4` | 17寸 | 旋压 | — | 3 | 8 | 78.2 | 2 | — |
| 10 | `DX616` | 16寸 | 旋压 | — | 4 | 5 | 77.7 | 2 | 16寸 |
| 11 | `FF56` | 17寸 | — | — | 14 | 11 | 75.0 | 2 | 18寸 |
| 12 | `FF109` | 16寸 | — | — | 13 | 11 | 75.0 | 3 | 16、20寸 |
| 13 | `SR28` | 17寸 | — | TC105X | 11 | 6 | 75.0 | 2 | 18寸 |
| 14 | `FF13` | 16寸 | — | — | 14 | 12 | 73.3 | 3 | 15、16寸 |
| 15 | `FFC006` | 18寸 | — | RG | 51 | 25 | 72.0 | 3 | 18、19寸 |
| 16 | `FF566` | 17寸 | — | DX507 | 25 | 18 | 72.0 | 3 | 18、19寸 |
| 17 | `FFC015` | 18寸 | — | TC4 | 24 | 17 | 72.0 | 2 | 18寸 |
| 18 | `FFC007` | 17寸 | — | ZR10 | 8 | 10 | 72.0 | 1 | — |
| 19 | `XF006` | 17寸 | — | — | 25 | 45 | 69.0 | 3 | 18、19寸 |
| 20 | `DX424` | 16寸 | — | — | 8 | 6 | 67.3 | 2 | 16寸 |
| 21 | `ZKX054` | 17寸 | 旋压 | — | 3 | 3 | 65.5 | 1 | — |
| 22 | `ZKX059` | 17寸 | 旋压 | — | 3 | 3 | 65.5 | 1 | — |
| 23 | `XF043` | 16寸 | — | — | 7 | 5 | 64.8 | 3 | 16、18寸 |
| 24 | `XF086` | 18寸 | — | — | 10 | 25 | 64.3 | 4 | 18、19寸 |
| 25 | `ZM2505007` | 17寸-5 | — | 坦克300 | 5 | 5 | 64.2 | 1 | — |
| 26 | `SR21` | 17寸 | — | TC105N、tc105N | 12 | 3 | 63.3 | 1 | — |
| 27 | `DX282` | 17寸 | 旋压 | — | 2 | 3 | 62.7 | 2 | 18寸 |
| 28 | `ZKX3256` | 17寸 | 旋压 | — | 3 | 3 | 62.2 | 2 | 18寸 |
| 29 | `XF055` | 19寸 | — | — | 6 | 7 | 60.7 | 2 | 19寸 |
| 30 | `DM902` | 17寸 | — | — | 5 | 8 | 58.5 | 1 | — |

图片文件名（供人工核对画面，媒体标题不可信）：

```text
DX088	15-dx088-2.webp, 15-dx088-3.webp, 15-dx088-4.webp, 15-dx088-5.webp, 15-dx088-6.webp, 15-dx088-7.webp, 15-dx088-8.webp, 15-dx088.webp, 17-dx088-2.webp, 17-dx088-3.webp, 17-dx088-4.webp, 17-dx088.webp, 18-dx088.webp
ZR698	17-zr698-10.webp, 17-zr698-11.webp, 17-zr698-12.webp, 17-zr698-13.webp, 17-zr698-14.webp, 17-zr698-15.webp, 17-zr698-16.webp, 17-zr698-2.webp, 17-zr698-3.webp, 17-zr698-4.webp, 17-zr698-5.webp, 17-zr698-6.webp, 17-zr698-7.webp, 17-zr698-8.webp, 17-zr698-9.webp, 17-zr698.webp
XF005	17-xf005-10.webp, 17-xf005-11.webp, 17-xf005-12.webp, 17-xf005-13.webp, 17-xf005-14.webp, 17-xf005-15.webp, 17-xf005-2.webp, 17-xf005-3.webp, 17-xf005-4.webp, 17-xf005-5.webp, 17-xf005-6.webp, 17-xf005-7.webp, 17-xf005-8.webp, 17-xf005-9.webp, 17-xf005.webp, 18-xf005-2.webp, 18-xf005-3.webp, 18-xf005.webp, 19-xf005-2.webp, 19-xf005-3.webp, 19-xf005.webp
DX189	off-road-dx189-10.webp, off-road-dx189-11.webp, off-road-dx189-12.webp, off-road-dx189-13.webp, off-road-dx189-14.webp, off-road-dx189-15.webp, off-road-dx189-16.webp, off-road-dx189-17.webp, off-road-dx189-18.webp, off-road-dx189-19.webp, off-road-dx189-2.webp, off-road-dx189-3.webp, off-road-dx189-4.webp, off-road-dx189-5.webp, off-road-dx189-6.webp, off-road-dx189-7.webp, off-road-dx189-8.webp, off-road-dx189-9.webp, off-road-dx189.webp
ZK327	17-zk327-2.webp, 17-zk327-3.webp, 17-zk327-4.webp, 17-zk327.webp, 18-zk327-2.webp, 18-zk327.webp, 19-zk327-2.webp, 19-zk327-3.webp, 19-zk327.webp
ZKX040	17-zkx040-2.webp, 17-zkx040-3.webp, 17-zkx040-4.webp, 17-zkx040-5.webp, 17-zkx040-6.webp, 17-zkx040.webp, 18-zkx040-2.webp, 18-zkx040.webp
DX163	15-dx163-2.webp, 15-dx163-3.webp, 15-dx163.webp, 17-dx163-2.webp, 17-dx163-3.webp, 17-dx163-4.webp, 17-dx163-5.webp, 17-dx163-6.webp, 17-dx163-7.webp, 17-dx163-8.webp, 17-dx163-9.webp, 17-dx163.webp
ZKX321	17-zkx321-2.webp, 17-zkx321-3.webp, 17-zkx321-4.webp, 17-zkx321-5.webp, 17-zkx321.webp
TC4	17-tc4-2.webp, 17-tc4-3.webp, 17-tc4-4.webp, 17-tc4-5.webp, 17-tc4-6.webp, 17-tc4.webp, 18-tc4-2.webp, 18-tc4.webp
DX616	16-dx616-2.webp, 16-dx616.webp, 17-dx616-2.webp, 17-dx616-3.webp, 17-dx616.webp
FF56	17-ff56-2.webp, 17-ff56-3.webp, 17-ff56-4.webp, 17-ff56-5.webp, 17-ff56-6.webp, 17-ff56-7.webp, 17-ff56-8.webp, 17-ff56-9.webp, 17-ff56.webp, 18-ff56-2.webp, 18-ff56.webp
FF109	16-ff109-2.webp, 16-ff109-3.webp, 16-ff109-4.webp, 16-ff109-5.webp, 16-ff109.webp, 17-ff109-2.webp, 17-ff109-3.webp, 17-ff109-4.webp, 17-ff109-5.webp, 17-ff109.webp, 20-ff109.webp
SR28	17-sr28-2.webp, 17-sr28.webp, 18-sr28-2.webp, 18-sr28-3.webp, 18-sr28-4.webp, 18-sr28.webp
FF13	15-ff13-2.webp, 15-ff13-3.webp, 15-ff13.webp, 16-ff13-2.webp, 16-ff13-3.webp, 16-ff13-4.webp, 16-ff13.webp, 17-ff13-2.webp, 17-ff13-3.webp, 17-ff13-4.webp, 17-ff13-5.webp, 17-ff13.webp
FFC006	17-ffc006-10.webp, 17-ffc006-2.webp, 17-ffc006-3.webp, 17-ffc006-4.webp, 17-ffc006-5.webp, 17-ffc006-6.webp, 17-ffc006-7.webp, 17-ffc006-8.webp, 17-ffc006-9.webp, 17-ffc006.webp, 18-ffc006-2.webp, 18-ffc006-3.webp, 18-ffc006-4.webp, 18-ffc006.webp, 19-ffc006-10.webp, 19-ffc006-11.webp, 19-ffc006-2.webp, 19-ffc006-3.webp, 19-ffc006-4.webp, 19-ffc006-5.webp, 19-ffc006-6.webp, 19-ffc006-7.webp, 19-ffc006-8.webp, 19-ffc006-9.webp, 19-ffc006.webp
FF566	17-ff566-2.webp, 17-ff566-3.webp, 17-ff566-4.webp, 17-ff566-5.webp, 17-ff566-6.webp, 17-ff566-7.webp, 17-ff566-8.webp, 17-ff566-9.webp, 17-ff566.webp, 18-ff566-2.webp, 18-ff566-3.webp, 18-ff566-4.webp, 18-ff566.webp, 19-ff566-2.webp, 19-ff566-3.webp, 19-ff566-4.webp, 19-ff566-5.webp, 19-ff566.webp
FFC015	17-ffc015-2.webp, 17-ffc015-3.webp, 17-ffc015-4.webp, 17-ffc015.webp, 18-ffc015-10.webp, 18-ffc015-11.webp, 18-ffc015-12.webp, 18-ffc015-13.webp, 18-ffc015-2.webp, 18-ffc015-3.webp, 18-ffc015-4.webp, 18-ffc015-5.webp, 18-ffc015-6.webp, 18-ffc015-7.webp, 18-ffc015-8.webp, 18-ffc015-9.webp, 18-ffc015.webp
FFC007	17-ffc007-10.webp, 17-ffc007-2.webp, 17-ffc007-3.webp, 17-ffc007-4.webp, 17-ffc007-5.webp, 17-ffc007-6.webp, 17-ffc007-7.webp, 17-ffc007-8.webp, 17-ffc007-9.webp, 17-ffc007.webp
XF006	17-xf006-10.webp, 17-xf006-11.webp, 17-xf006-12.webp, 17-xf006-13.webp, 17-xf006-14.webp, 17-xf006-15.webp, 17-xf006-16.webp, 17-xf006-17.webp, 17-xf006-18.webp, 17-xf006-19.webp, 17-xf006-2.webp, 17-xf006-20.webp, 17-xf006-21.webp, 17-xf006-22.webp, 17-xf006-3.webp, 17-xf006-4.webp, 17-xf006-5.webp, 17-xf006-6.webp, 17-xf006-7.webp, 17-xf006-8.webp, 17-xf006-9.webp, 17-xf006.webp, 18-xf006-10.webp, 18-xf006-11.webp, 18-xf006-2.webp, 18-xf006-3.webp, 18-xf006-4.webp, 18-xf006-5.webp, 18-xf006-6.webp, 18-xf006-7.webp, 18-xf006-8.webp, 18-xf006-9.webp, 18-xf006.webp, 19-xf006-10.webp, 19-xf006-11.webp, 19-xf006-12.webp, 19-xf006-2.webp, 19-xf006-3.webp, 19-xf006-4.webp, 19-xf006-5.webp, 19-xf006-6.webp, 19-xf006-7.webp, 19-xf006-8.webp, 19-xf006-9.webp, 19-xf006.webp
DX424	16-dx424-2.webp, 16-dx424.webp, 17-dx424-2.webp, 17-dx424-3.webp, 17-dx424-4.webp, 17-dx424.webp
ZKX054	17-zkx054-2.webp, 17-zkx054-3.webp, 17-zkx054.webp
ZKX059	17-zkx059-2.webp, 17-zkx059-3.webp, 17-zkx059.webp
XF043	16-xf043-2.webp, 16-xf043.webp, 17-xf043-2.webp, 17-xf043.webp, 18-xf043.webp
XF086	17-xf086-2.webp, 17-xf086-3.webp, 17-xf086-4.webp, 17-xf086-5.webp, 17-xf086-6.webp, 17-xf086-7.webp, 17-xf086-8.webp, 17-xf086.webp, 18-xf086-2.webp, 18-xf086-3.webp, 18-xf086-4.webp, 18-xf086-5.webp, 18-xf086-6.webp, 18-xf086-7.webp, 18-xf086.webp, 19-xf086-2.webp, 19-xf086-3.webp, 19-xf086-4.webp, 19-xf086-5.webp, 19-xf086.webp, off-road-xf086-2.webp, off-road-xf086-3.webp, off-road-xf086-4.webp, off-road-xf086-5.webp, off-road-xf086.webp
ZM2505007	17-5-zm2505007-2.webp, 17-5-zm2505007-3.webp, 17-5-zm2505007-4.webp, 17-5-zm2505007-5.webp, 17-5-zm2505007.webp
SR21	17-sr21-2.webp, 17-sr21-3.webp, 17-sr21.webp
DX282	17-dx282.webp, 18-dx282-2.webp, 18-dx282.webp
ZKX3256	17-zkx3256-2.webp, 17-zkx3256.webp, 18-zkx3256.webp
XF055	17-xf055-2.webp, 17-xf055-3.webp, 17-xf055.webp, 19-xf055-2.webp, 19-xf055-3.webp, 19-xf055-4.webp, 19-xf055.webp
DM902	17-dm902-2.webp, 17-dm902-3.webp, 17-dm902-4.webp, 17-dm902-5.webp, 17-dm902-6.webp, 17-dm902-7.webp, 17-dm902-8.webp, 17-dm902.webp
```

### 3.18 英寸（已选 30 / 可用 274）

| # | 型号 | 主目录 | 工艺 | 款式名 | 规格数 | 图数 | 分 | 记录 | 跨 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `DX088` | 15寸 | 旋压 | — | 11 | 13 | 100.0 | 3 | 15、17寸 |
| 2 | `LK026` | 18寸 | 旋压 | P103 | 9 | 5 | 100.0 | 1 | — |
| 3 | `SRFF34` | 18寸 | 旋压 | — | 8 | 12 | 96.7 | 2 | 19寸 |
| 4 | `XF005` | 17寸 | 旋压 | WF多辐、WF款 | 55 | 21 | 94.0 | 3 | 17、19寸 |
| 5 | `DX189` | 越野款 | 旋压 | — | 7 | 19 | 91.2 | 1 | 15、17寸 |
| 6 | `ZK327` | 17寸 | 旋压 | HF5 | 8 | 9 | 91.0 | 3 | 17、19寸 |
| 7 | `FF25` | 18寸 | 旋压 | RG4 | 5 | 5 | 89.2 | 1 | — |
| 8 | `DIM057` | 18寸 | 低压 | 大王皇冠五辐 | 10 | 10 | 87.0 | 2 | 19寸 |
| 9 | `ZKX040` | 17寸 | 低压+旋压 | — | 5 | 8 | 84.8 | 2 | 17寸 |
| 10 | `ZKX304` | 18寸 | 旋压 | — | 6 | 5 | 83.0 | 2 | 19寸 |
| 11 | `G5067` | 18寸 | 旋压 | — | 5 | 4 | 82.8 | 1 | — |
| 12 | `A015` | 18寸 | 旋压 | — | 5 | 3 | 79.5 | 2 | 19寸 |
| 13 | `KANA` | 18寸 | 旋压 | — | 5 | 3 | 76.2 | 1 | — |
| 14 | `FF52` | 19寸 | — | — | 14 | 6 | 75.0 | 2 | 19寸 |
| 15 | `FF56` | 17寸 | — | — | 14 | 11 | 75.0 | 2 | 17寸 |
| 16 | `SR28` | 17寸 | — | TC105X | 11 | 6 | 75.0 | 2 | 17寸 |
| 17 | `ZKX320` | 18寸 | 旋压 | — | 7 | 2 | 73.5 | 2 | 19寸 |
| 18 | `ZKX324` | 18寸 | 旋压 | — | 4 | 4 | 73.0 | 2 | 19寸 |
| 19 | `FFC006` | 18寸 | — | RG | 51 | 25 | 72.0 | 3 | 17、19寸 |
| 20 | `FF566` | 17寸 | — | DX507 | 25 | 18 | 72.0 | 3 | 17、19寸 |
| 21 | `FFC015` | 18寸 | — | TC4 | 24 | 17 | 72.0 | 2 | 17寸 |
| 22 | `ZKX333` | 19寸 | — | WFR2 | 10 | 6 | 72.0 | 2 | 19寸 |
| 23 | `ZR001` | 18寸 | — | — | 7 | 7 | 69.5 | 2 | 15寸 |
| 24 | `FFC012` | 19寸 | — | — | 29 | 8 | 69.0 | 2 | 19寸 |
| 25 | `XF006` | 17寸 | — | — | 25 | 45 | 69.0 | 3 | 17、19寸 |
| 26 | `ZKX334` | 19寸 | — | — | 10 | 5 | 69.0 | 2 | 19寸 |
| 27 | `MGWDX582` | 越野款 | 旋压 | — | 2 | 4 | 67.7 | 1 | — |
| 28 | `ZKX327` | 18寸 | 旋压 | — | 3 | 3 | 66.8 | 1 | — |
| 29 | `DIM5018` | 18寸 | 低压 | — | 4 | 4 | 65.7 | 1 | — |
| 30 | `LK020188006S6041` | 18寸 | 旋压 | — | 3 | 3 | 65.5 | 1 | — |

图片文件名（供人工核对画面，媒体标题不可信）：

```text
DX088	15-dx088-2.webp, 15-dx088-3.webp, 15-dx088-4.webp, 15-dx088-5.webp, 15-dx088-6.webp, 15-dx088-7.webp, 15-dx088-8.webp, 15-dx088.webp, 17-dx088-2.webp, 17-dx088-3.webp, 17-dx088-4.webp, 17-dx088.webp, 18-dx088.webp
LK026	18-lk026-2.webp, 18-lk026-3.webp, 18-lk026-4.webp, 18-lk026-5.webp, 18-lk026.webp
SRFF34	18-srff34-2.webp, 18-srff34-3.webp, 18-srff34-4.webp, 18-srff34-5.webp, 18-srff34-6.webp, 18-srff34-7.webp, 18-srff34-8.webp, 18-srff34-9.webp, 18-srff34.webp, 19-srff34-2.webp, 19-srff34-3.webp, 19-srff34.webp
XF005	17-xf005-10.webp, 17-xf005-11.webp, 17-xf005-12.webp, 17-xf005-13.webp, 17-xf005-14.webp, 17-xf005-15.webp, 17-xf005-2.webp, 17-xf005-3.webp, 17-xf005-4.webp, 17-xf005-5.webp, 17-xf005-6.webp, 17-xf005-7.webp, 17-xf005-8.webp, 17-xf005-9.webp, 17-xf005.webp, 18-xf005-2.webp, 18-xf005-3.webp, 18-xf005.webp, 19-xf005-2.webp, 19-xf005-3.webp, 19-xf005.webp
DX189	off-road-dx189-10.webp, off-road-dx189-11.webp, off-road-dx189-12.webp, off-road-dx189-13.webp, off-road-dx189-14.webp, off-road-dx189-15.webp, off-road-dx189-16.webp, off-road-dx189-17.webp, off-road-dx189-18.webp, off-road-dx189-19.webp, off-road-dx189-2.webp, off-road-dx189-3.webp, off-road-dx189-4.webp, off-road-dx189-5.webp, off-road-dx189-6.webp, off-road-dx189-7.webp, off-road-dx189-8.webp, off-road-dx189-9.webp, off-road-dx189.webp
ZK327	17-zk327-2.webp, 17-zk327-3.webp, 17-zk327-4.webp, 17-zk327.webp, 18-zk327-2.webp, 18-zk327.webp, 19-zk327-2.webp, 19-zk327-3.webp, 19-zk327.webp
FF25	18-ff25-2.webp, 18-ff25-3.webp, 18-ff25-4.webp, 18-ff25-5.webp, 18-ff25.webp
DIM057	18-dim057-2.webp, 18-dim057-3.webp, 18-dim057-4.webp, 18-dim057-5.webp, 18-dim057-6.webp, 18-dim057.webp, 19-dim057-2.webp, 19-dim057-3.webp, 19-dim057-4.webp, 19-dim057.webp
ZKX040	17-zkx040-2.webp, 17-zkx040-3.webp, 17-zkx040-4.webp, 17-zkx040-5.webp, 17-zkx040-6.webp, 17-zkx040.webp, 18-zkx040-2.webp, 18-zkx040.webp
ZKX304	18-zkx304-2.webp, 18-zkx304.webp, 19-zkx304-2.webp, 19-zkx304-3.webp, 19-zkx304.webp
G5067	18-g5067-2.webp, 18-g5067-3.webp, 18-g5067-4.webp, 18-g5067.webp
A015	18-a015.webp, 19-a015-2.webp, 19-a015.webp
KANA	18-kana-2.webp, 18-kana-3.webp, 18-kana.webp
FF52	18-ff52-2.webp, 18-ff52.webp, 19-ff52-2.webp, 19-ff52-3.webp, 19-ff52-4.webp, 19-ff52.webp
FF56	17-ff56-2.webp, 17-ff56-3.webp, 17-ff56-4.webp, 17-ff56-5.webp, 17-ff56-6.webp, 17-ff56-7.webp, 17-ff56-8.webp, 17-ff56-9.webp, 17-ff56.webp, 18-ff56-2.webp, 18-ff56.webp
SR28	17-sr28-2.webp, 17-sr28.webp, 18-sr28-2.webp, 18-sr28-3.webp, 18-sr28-4.webp, 18-sr28.webp
ZKX320	18-zkx320.webp, 19-zkx320.webp
ZKX324	18-zkx324-2.webp, 18-zkx324.webp, 19-zkx324-2.webp, 19-zkx324.webp
FFC006	17-ffc006-10.webp, 17-ffc006-2.webp, 17-ffc006-3.webp, 17-ffc006-4.webp, 17-ffc006-5.webp, 17-ffc006-6.webp, 17-ffc006-7.webp, 17-ffc006-8.webp, 17-ffc006-9.webp, 17-ffc006.webp, 18-ffc006-2.webp, 18-ffc006-3.webp, 18-ffc006-4.webp, 18-ffc006.webp, 19-ffc006-10.webp, 19-ffc006-11.webp, 19-ffc006-2.webp, 19-ffc006-3.webp, 19-ffc006-4.webp, 19-ffc006-5.webp, 19-ffc006-6.webp, 19-ffc006-7.webp, 19-ffc006-8.webp, 19-ffc006-9.webp, 19-ffc006.webp
FF566	17-ff566-2.webp, 17-ff566-3.webp, 17-ff566-4.webp, 17-ff566-5.webp, 17-ff566-6.webp, 17-ff566-7.webp, 17-ff566-8.webp, 17-ff566-9.webp, 17-ff566.webp, 18-ff566-2.webp, 18-ff566-3.webp, 18-ff566-4.webp, 18-ff566.webp, 19-ff566-2.webp, 19-ff566-3.webp, 19-ff566-4.webp, 19-ff566-5.webp, 19-ff566.webp
FFC015	17-ffc015-2.webp, 17-ffc015-3.webp, 17-ffc015-4.webp, 17-ffc015.webp, 18-ffc015-10.webp, 18-ffc015-11.webp, 18-ffc015-12.webp, 18-ffc015-13.webp, 18-ffc015-2.webp, 18-ffc015-3.webp, 18-ffc015-4.webp, 18-ffc015-5.webp, 18-ffc015-6.webp, 18-ffc015-7.webp, 18-ffc015-8.webp, 18-ffc015-9.webp, 18-ffc015.webp
ZKX333	18-zkx333-2.webp, 18-zkx333-3.webp, 18-zkx333.webp, 19-zkx333-2.webp, 19-zkx333-3.webp, 19-zkx333.webp
ZR001	15-zr001-2.webp, 15-zr001-3.webp, 15-zr001.webp, 18-zr001-2.webp, 18-zr001-3.webp, 18-zr001-4.webp, 18-zr001.webp
FFC012	18-ffc012-2.webp, 18-ffc012-3.webp, 18-ffc012-4.webp, 18-ffc012-5.webp, 18-ffc012.webp, 19-ffc012-2.webp, 19-ffc012-3.webp, 19-ffc012.webp
XF006	17-xf006-10.webp, 17-xf006-11.webp, 17-xf006-12.webp, 17-xf006-13.webp, 17-xf006-14.webp, 17-xf006-15.webp, 17-xf006-16.webp, 17-xf006-17.webp, 17-xf006-18.webp, 17-xf006-19.webp, 17-xf006-2.webp, 17-xf006-20.webp, 17-xf006-21.webp, 17-xf006-22.webp, 17-xf006-3.webp, 17-xf006-4.webp, 17-xf006-5.webp, 17-xf006-6.webp, 17-xf006-7.webp, 17-xf006-8.webp, 17-xf006-9.webp, 17-xf006.webp, 18-xf006-10.webp, 18-xf006-11.webp, 18-xf006-2.webp, 18-xf006-3.webp, 18-xf006-4.webp, 18-xf006-5.webp, 18-xf006-6.webp, 18-xf006-7.webp, 18-xf006-8.webp, 18-xf006-9.webp, 18-xf006.webp, 19-xf006-10.webp, 19-xf006-11.webp, 19-xf006-12.webp, 19-xf006-2.webp, 19-xf006-3.webp, 19-xf006-4.webp, 19-xf006-5.webp, 19-xf006-6.webp, 19-xf006-7.webp, 19-xf006-8.webp, 19-xf006-9.webp, 19-xf006.webp
ZKX334	18-zkx334-2.webp, 18-zkx334-3.webp, 18-zkx334-4.webp, 18-zkx334.webp, 19-zkx334.webp
MGWDX582	off-road-mgwdx582-2.webp, off-road-mgwdx582-3.webp, off-road-mgwdx582-4.webp, off-road-mgwdx582.webp
ZKX327	18-zkx327-2.webp, 18-zkx327-3.webp, 18-zkx327.webp
DIM5018	18-dim5018-2.webp, 18-dim5018-3.webp, 18-dim5018-4.webp, 18-dim5018.webp
LK020188006S6041	18-lk020188006s6041-2.webp, 18-lk020188006s6041-3.webp, 18-lk020188006s6041.webp
```

### 3.19 英寸（已选 30 / 可用 146）

| # | 型号 | 主目录 | 工艺 | 款式名 | 规格数 | 图数 | 分 | 记录 | 跨 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `SRFF34` | 18寸 | 旋压 | — | 8 | 12 | 96.7 | 2 | 18寸 |
| 2 | `XF005` | 17寸 | 旋压 | WF多辐、WF款 | 55 | 21 | 94.0 | 3 | 17、18寸 |
| 3 | `ZK327` | 17寸 | 旋压 | HF5 | 8 | 9 | 91.0 | 3 | 17、18寸 |
| 4 | `JS1091` | 19寸 | 低压 | — | 16 | 13 | 87.0 | 1 | — |
| 5 | `DIM057` | 18寸 | 低压 | 大王皇冠五辐 | 10 | 10 | 87.0 | 2 | 18寸 |
| 6 | `ZKX304` | 18寸 | 旋压 | — | 6 | 5 | 83.0 | 2 | 18寸 |
| 7 | `A015` | 18寸 | 旋压 | — | 5 | 3 | 79.5 | 2 | 18寸 |
| 8 | `FF52` | 19寸 | — | — | 14 | 6 | 75.0 | 2 | 18寸 |
| 9 | `ZKX320` | 18寸 | 旋压 | — | 7 | 2 | 73.5 | 2 | 18寸 |
| 10 | `ZKX324` | 18寸 | 旋压 | — | 4 | 4 | 73.0 | 2 | 18寸 |
| 11 | `FFC006` | 18寸 | — | RG | 51 | 25 | 72.0 | 3 | 17、18寸 |
| 12 | `FF566` | 17寸 | — | DX507 | 25 | 18 | 72.0 | 3 | 17、18寸 |
| 13 | `ZKX333` | 19寸 | — | WFR2 | 10 | 6 | 72.0 | 2 | 18寸 |
| 14 | `FFC012` | 19寸 | — | — | 29 | 8 | 69.0 | 2 | 18寸 |
| 15 | `XF006` | 17寸 | — | — | 25 | 45 | 69.0 | 3 | 17、18寸 |
| 16 | `ZKX334` | 19寸 | — | — | 10 | 5 | 69.0 | 2 | 18寸 |
| 17 | `RGGT` | 19寸 | — | — | 8 | 5 | 65.7 | 1 | — |
| 18 | `DX035` | 19寸 | 旋压 | — | 3 | 3 | 65.2 | 2 | 18寸 |
| 19 | `XF086` | 18寸 | — | — | 10 | 25 | 64.3 | 4 | 17、18寸 |
| 20 | `DIM5014` | 18寸 | 低压 | 螳螂刀锋 | 5 | 4 | 63.8 | 2 | 18寸 |
| 21 | `DQ002` | 19寸 | 旋压 | — | 5 | 1 | 63.5 | 1 | — |
| 22 | `ZKX303` | 19寸 | 旋压 | — | 4 | 2 | 63.0 | 2 | 18寸 |
| 23 | `FFC002` | 19寸 | — | — | 8 | 7 | 62.7 | 1 | — |
| 24 | `ZKX051` | 18寸 | 旋压 | — | 2 | 3 | 62.7 | 2 | 18寸 |
| 25 | `DX552` | 16寸 | 旋压 | — | 3 | 2 | 61.8 | 2 | 16寸 |
| 26 | `XF055` | 19寸 | — | — | 6 | 7 | 60.7 | 2 | 17寸 |
| 27 | `HPXF224` | 19寸 | — | — | 8 | 4 | 59.3 | 2 | 18寸 |
| 28 | `ZKX105` | 19寸 | 旋压 | — | 3 | 1 | 58.5 | 1 | — |
| 29 | `XF007` | 18寸 | — | — | 5 | 6 | 58.2 | 2 | 18寸 |
| 30 | `DX045` | 19寸 | 旋压 | — | 2 | 2 | 57.7 | 1 | — |

图片文件名（供人工核对画面，媒体标题不可信）：

```text
SRFF34	18-srff34-2.webp, 18-srff34-3.webp, 18-srff34-4.webp, 18-srff34-5.webp, 18-srff34-6.webp, 18-srff34-7.webp, 18-srff34-8.webp, 18-srff34-9.webp, 18-srff34.webp, 19-srff34-2.webp, 19-srff34-3.webp, 19-srff34.webp
XF005	17-xf005-10.webp, 17-xf005-11.webp, 17-xf005-12.webp, 17-xf005-13.webp, 17-xf005-14.webp, 17-xf005-15.webp, 17-xf005-2.webp, 17-xf005-3.webp, 17-xf005-4.webp, 17-xf005-5.webp, 17-xf005-6.webp, 17-xf005-7.webp, 17-xf005-8.webp, 17-xf005-9.webp, 17-xf005.webp, 18-xf005-2.webp, 18-xf005-3.webp, 18-xf005.webp, 19-xf005-2.webp, 19-xf005-3.webp, 19-xf005.webp
ZK327	17-zk327-2.webp, 17-zk327-3.webp, 17-zk327-4.webp, 17-zk327.webp, 18-zk327-2.webp, 18-zk327.webp, 19-zk327-2.webp, 19-zk327-3.webp, 19-zk327.webp
JS1091	19-js1091-10.webp, 19-js1091-11.webp, 19-js1091-12.webp, 19-js1091-13.webp, 19-js1091-2.webp, 19-js1091-3.webp, 19-js1091-4.webp, 19-js1091-5.webp, 19-js1091-6.webp, 19-js1091-7.webp, 19-js1091-8.webp, 19-js1091-9.webp, 19-js1091.webp
DIM057	18-dim057-2.webp, 18-dim057-3.webp, 18-dim057-4.webp, 18-dim057-5.webp, 18-dim057-6.webp, 18-dim057.webp, 19-dim057-2.webp, 19-dim057-3.webp, 19-dim057-4.webp, 19-dim057.webp
ZKX304	18-zkx304-2.webp, 18-zkx304.webp, 19-zkx304-2.webp, 19-zkx304-3.webp, 19-zkx304.webp
A015	18-a015.webp, 19-a015-2.webp, 19-a015.webp
FF52	18-ff52-2.webp, 18-ff52.webp, 19-ff52-2.webp, 19-ff52-3.webp, 19-ff52-4.webp, 19-ff52.webp
ZKX320	18-zkx320.webp, 19-zkx320.webp
ZKX324	18-zkx324-2.webp, 18-zkx324.webp, 19-zkx324-2.webp, 19-zkx324.webp
FFC006	17-ffc006-10.webp, 17-ffc006-2.webp, 17-ffc006-3.webp, 17-ffc006-4.webp, 17-ffc006-5.webp, 17-ffc006-6.webp, 17-ffc006-7.webp, 17-ffc006-8.webp, 17-ffc006-9.webp, 17-ffc006.webp, 18-ffc006-2.webp, 18-ffc006-3.webp, 18-ffc006-4.webp, 18-ffc006.webp, 19-ffc006-10.webp, 19-ffc006-11.webp, 19-ffc006-2.webp, 19-ffc006-3.webp, 19-ffc006-4.webp, 19-ffc006-5.webp, 19-ffc006-6.webp, 19-ffc006-7.webp, 19-ffc006-8.webp, 19-ffc006-9.webp, 19-ffc006.webp
FF566	17-ff566-2.webp, 17-ff566-3.webp, 17-ff566-4.webp, 17-ff566-5.webp, 17-ff566-6.webp, 17-ff566-7.webp, 17-ff566-8.webp, 17-ff566-9.webp, 17-ff566.webp, 18-ff566-2.webp, 18-ff566-3.webp, 18-ff566-4.webp, 18-ff566.webp, 19-ff566-2.webp, 19-ff566-3.webp, 19-ff566-4.webp, 19-ff566-5.webp, 19-ff566.webp
ZKX333	18-zkx333-2.webp, 18-zkx333-3.webp, 18-zkx333.webp, 19-zkx333-2.webp, 19-zkx333-3.webp, 19-zkx333.webp
FFC012	18-ffc012-2.webp, 18-ffc012-3.webp, 18-ffc012-4.webp, 18-ffc012-5.webp, 18-ffc012.webp, 19-ffc012-2.webp, 19-ffc012-3.webp, 19-ffc012.webp
XF006	17-xf006-10.webp, 17-xf006-11.webp, 17-xf006-12.webp, 17-xf006-13.webp, 17-xf006-14.webp, 17-xf006-15.webp, 17-xf006-16.webp, 17-xf006-17.webp, 17-xf006-18.webp, 17-xf006-19.webp, 17-xf006-2.webp, 17-xf006-20.webp, 17-xf006-21.webp, 17-xf006-22.webp, 17-xf006-3.webp, 17-xf006-4.webp, 17-xf006-5.webp, 17-xf006-6.webp, 17-xf006-7.webp, 17-xf006-8.webp, 17-xf006-9.webp, 17-xf006.webp, 18-xf006-10.webp, 18-xf006-11.webp, 18-xf006-2.webp, 18-xf006-3.webp, 18-xf006-4.webp, 18-xf006-5.webp, 18-xf006-6.webp, 18-xf006-7.webp, 18-xf006-8.webp, 18-xf006-9.webp, 18-xf006.webp, 19-xf006-10.webp, 19-xf006-11.webp, 19-xf006-12.webp, 19-xf006-2.webp, 19-xf006-3.webp, 19-xf006-4.webp, 19-xf006-5.webp, 19-xf006-6.webp, 19-xf006-7.webp, 19-xf006-8.webp, 19-xf006-9.webp, 19-xf006.webp
ZKX334	18-zkx334-2.webp, 18-zkx334-3.webp, 18-zkx334-4.webp, 18-zkx334.webp, 19-zkx334.webp
RGGT	19-rggt-2.webp, 19-rggt-3.webp, 19-rggt-4.webp, 19-rggt-5.webp, 19-rggt.webp
DX035	18-dx035-2.webp, 18-dx035.webp, 19-dx035.webp
XF086	17-xf086-2.webp, 17-xf086-3.webp, 17-xf086-4.webp, 17-xf086-5.webp, 17-xf086-6.webp, 17-xf086-7.webp, 17-xf086-8.webp, 17-xf086.webp, 18-xf086-2.webp, 18-xf086-3.webp, 18-xf086-4.webp, 18-xf086-5.webp, 18-xf086-6.webp, 18-xf086-7.webp, 18-xf086.webp, 19-xf086-2.webp, 19-xf086-3.webp, 19-xf086-4.webp, 19-xf086-5.webp, 19-xf086.webp, off-road-xf086-2.webp, off-road-xf086-3.webp, off-road-xf086-4.webp, off-road-xf086-5.webp, off-road-xf086.webp
DIM5014	18-dim5014-2.webp, 18-dim5014-3.webp, 18-dim5014.webp, 19-dim5014.webp
DQ002	19-dq002.webp
ZKX303	18-zkx303.webp, 19-zkx303.webp
FFC002	19-ffc002-2.webp, 19-ffc002-3.webp, 19-ffc002-4.webp, 19-ffc002-5.webp, 19-ffc002-6.webp, 19-ffc002-7.webp, 19-ffc002.webp
ZKX051	18-zkx051.webp, 19-zkx051-2.webp, 19-zkx051.webp
DX552	16-dx552.webp, 19-dx552.webp
XF055	17-xf055-2.webp, 17-xf055-3.webp, 17-xf055.webp, 19-xf055-2.webp, 19-xf055-3.webp, 19-xf055-4.webp, 19-xf055.webp
HPXF224	18-hpxf224-2.webp, 18-hpxf224.webp, 19-hpxf224-2.webp, 19-hpxf224.webp
ZKX105	19-zkx105.webp
XF007	18-xf007-2.webp, 18-xf007-3.webp, 18-xf007-4.webp, 18-xf007.webp, 19-xf007-2.webp, 19-xf007.webp
DX045	19-dx045-2.webp, 19-dx045.webp
```

### 3.20 英寸（已选 30 / 可用 40）

| # | 型号 | 主目录 | 工艺 | 款式名 | 规格数 | 图数 | 分 | 记录 | 跨 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `F236` | 20寸 | 旋压 | WF款 | 6 | 5 | 86.0 | 1 | — |
| 2 | `FF109` | 16寸 | — | — | 13 | 11 | 75.0 | 3 | 16、17寸 |
| 3 | `F23620` | 20寸 | 旋压 | — | 2 | 2 | 59.3 | 1 | — |
| 4 | `ZKX306` | 19寸 | — | — | 9 | 3 | 51.3 | 3 | 18、19寸 |
| 5 | `K5181` | 19寸 | — | — | 5 | 4 | 50.2 | 2 | 19寸 |
| 6 | `DQ019209001S3212` | 20寸 | 旋压 | 305树杈 | 1 | 1 | 47.2 | 1 | — |
| 7 | `DQ019209011SH3212` | 20寸 | 旋压 | 305树杈 | 1 | 1 | 47.2 | 1 | — |
| 8 | `F034208511S3324` | 20寸 | 旋压 | 305树杈 | 1 | 1 | 47.2 | 1 | — |
| 9 | `F034209003S6002` | 20寸 | 旋压 | 305树杈 | 1 | 1 | 47.2 | 1 | — |
| 10 | `F034209005S6017` | 20寸 | 旋压 | 305树杈 | 1 | 1 | 47.2 | 1 | — |
| 11 | `F034209015S2051` | 20寸 | 旋压 | 305树杈 | 1 | 1 | 47.2 | 1 | — |
| 12 | `F034209017SH3324` | 20寸 | 旋压 | 305树杈 | 1 | 1 | 47.2 | 1 | — |
| 13 | `F075208513S6014` | 20寸 | 旋压 | — | 1 | 1 | 47.2 | 1 | — |
| 14 | `F075208514S6014` | 20寸 | 旋压 | — | 1 | 1 | 47.2 | 1 | — |
| 15 | `F075208519S6068` | 20寸 | 旋压 | F075208519S6068 | 1 | 1 | 47.2 | 1 | — |
| 16 | `F075209053S6014` | 20寸 | 旋压 | — | 1 | 1 | 47.2 | 1 | — |
| 17 | `ZKX319` | 20寸 | 旋压 | — | 1 | 1 | 47.2 | 1 | — |
| 18 | `L251031` | 20寸-2 | — | 坦克 | 3 | 3 | 43.2 | 1 | — |
| 19 | `ZKX3202` | 19寸 | — | — | 6 | 2 | 39.7 | 2 | 19寸 |
| 20 | `HPXF209` | 19寸 | — | — | 4 | 3 | 39.7 | 3 | 18、19寸 |
| 21 | `12` | 19寸 | — | — | 2 | 2 | 34.3 | 2 | 19寸 |
| 22 | `A091F` | 20寸 | — | 五星 | 2 | 2 | 32.7 | 1 | — |
| 23 | `L250904` | 20寸-2 | — | 坦克 | 2 | 2 | 32.7 | 1 | — |
| 24 | `Y2504006` | 20寸-2 | — | 坦克700 | 2 | 2 | 32.7 | 1 | — |
| 25 | `260202003` | 20寸-2 | — | BJ40 | 2 | 1 | 27.7 | 1 | — |
| 26 | `260203003` | 20寸-2 | — | BJ40 | 2 | 1 | 27.7 | 1 | — |
| 27 | `DX046` | 20寸 | — | — | 2 | 1 | 24.7 | 1 | — |
| 28 | `260201004` | 20寸-2 | — | BJ40 | 1 | 1 | 22.2 | 1 | — |
| 29 | `CG02B` | 20寸 | — | 日本632 | 1 | 1 | 22.2 | 1 | — |
| 30 | `CG02P` | 20寸 | — | 日本632 | 1 | 1 | 22.2 | 1 | — |

图片文件名（供人工核对画面，媒体标题不可信）：

```text
F236	20-f236-2.webp, 20-f236-3.webp, 20-f236-4.webp, 20-f236-5.webp, 20-f236.webp
FF109	16-ff109-2.webp, 16-ff109-3.webp, 16-ff109-4.webp, 16-ff109-5.webp, 16-ff109.webp, 17-ff109-2.webp, 17-ff109-3.webp, 17-ff109-4.webp, 17-ff109-5.webp, 17-ff109.webp, 20-ff109.webp
F23620	20-f23620-2.webp, 20-f23620.webp
ZKX306	18-zkx306.webp, 19-zkx306.webp, 20-zkx306.webp
K5181	19-k5181-2.webp, 19-k5181-3.webp, 19-k5181.webp, 20-k5181.webp
DQ019209001S3212	20-dq019209001s3212.webp
DQ019209011SH3212	20-dq019209011sh3212.webp
F034208511S3324	20-f034208511s3324.webp
F034209003S6002	20-f034209003s6002.webp
F034209005S6017	20-f034209005s6017.webp
F034209015S2051	20-f034209015s2051.webp
F034209017SH3324	20-f034209017sh3324.webp
F075208513S6014	20-f075208513s6014.webp
F075208514S6014	20-f075208514s6014.webp
F075208519S6068	20-f075208519s6068.webp
F075209053S6014	20-f075209053s6014.webp
ZKX319	20-zkx319.webp
L251031	20-2-l251031-2.webp, 20-2-l251031-3.webp, 20-2-l251031.webp
ZKX3202	19-zkx3202.webp, 20-zkx3202.webp
HPXF209	18-hpxf209.webp, 19-hpxf209.webp, 20-hpxf209.webp
12	15-582-12.webp, 18-21087-12.webp
A091F	20-a091f-2.webp, 20-a091f.webp
L250904	20-2-l250904-2.webp, 20-2-l250904.webp
Y2504006	20-2-y2504006-2.webp, 20-2-y2504006.webp
260202003	20-2-260202003.webp
260203003	20-2-260203003.webp
DX046	20-dx046.webp
260201004	20-2-260201004.webp
CG02B	20-cg02b.webp
CG02P	20-cg02p.webp
```

## 4. 需要拍板的

1. **13 / 14 英寸怎么办** —— 数据里确实没有，放弃，还是从 inbox 那套（6109 条）里补？
2. **被打掉的商标型号怎么处理** —— 永久排除？还是改名后可用（用编号作对外名，styleName 只留内部）？
3. **30 这个数字对 15 / 20 英寸是否合适** —— 可用量少，等于全放。
4. **打分权重是否认可** —— 尤其「工艺含金量 25 分」。
5. `processConflict` / `styleNameConflict` 的型号（合并后冲突）如何取舍。

