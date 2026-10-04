# 联系页 Page 架构（`/contact`）

> **本文件定义 `/contact` —— 竞品的 `/contact-us/`。**
>
> 底本 = [2N Forged `/contact-us/`](https://2nforged.com/contact-us/)
> （**1 段 / 1,520 px / 187 字** —— **全站最短的一页**）

- 版本：v1.0
- 建立日期：2026-10-01
- 上位：`README.md` §2.13 ｜ `dealers-page.md` ｜ `private-label-page.md`

---

## 0. 这页的价值恰好在「短」

**竞品全站 12 页的高度排名**：

```
monoblock     13,941 px
private-label 13,953 px   ← 最长
dealers       12,880 px
process        8,072 px
about-us       7,119 px
bmw-m          5,940 px
wheel-gallery  5,535 px
products       5,096 px
2-piece        9,401 px
resources      3,804 px
home           3,331 px
contact-us     1,520 px   ← 最短
```

**它把最重的内容（贴牌 13,953px）和最轻的转化页（1,520px）放在同一个站里。**

**→ 这说明它懂一件事**：**转化页不该有说服工作量。**
说服在前面的页面已经做完了 —— 走到 `/contact-us/` 的人**已经决定要联系**，
他只需要**一个不碍事的表单**。

**⚠️ 这是最容易做错的一页** —— 常见错误是把联系页做成「第二个首页」，
再讲一遍公司优势。**那是在用户已经决定之后还继续推销。**

---

## 1. 竞品实测：单段结构

整个页面只有 **1 个 section**：

| 项 | 值 |
|---|---|
| 类名 | `section inquiry-section contact-page-section` |
| 尺寸 | 1440 × **1,195** |
| padding | `144 / 0 / 64 / 0` |
| 字数 | **187** |
| 图片 | 2 张（logo + 底部图） |
| H1 | `REQUEST WHEEL QUOTE` |
| H2 | `WHAT TO SEND IN THE FIRST MESSAGE` |
| CTA | 2 个（`Send Inquiry` / `Send Message`） |
| **表单字段** | **17 个（含隐藏）** |

### 1.1 内容顺序（实测）

```
① H1: REQUEST WHEEL QUOTE
② 导语 1：Send us your custom forged wheel project details.
          You do not need every specification ready before contacting us.
③ 导语 2：Our team can follow up by email or WhatsApp to confirm fitment,
          finish, quantity, logo or private-label needs, and production options.
④ 导语 3：If a detail is missing, send the vehicle and target look.
          2N Forged can help check the fitment direction before the order is built.
⑤ H2: WHAT TO SEND IN THE FIRST MESSAGE
   • Vehicle or VIN, target wheel size, finish direction, quantity, and the look you want.
   • Logo, center cap, private-label, NDA or source-file questions if they matter for this order.
   • If you want QC photos, finished-wheel photos or video, a factory visit,
     or a live video inspection, say that too. Visits and live checks need an appointment.
⑥ 表单（Fields marked with an asterisk (*) are required.）
⑦ 底部联系块：CONTACT OUR TEAM + Email: info@2nforged.com + WhatsApp
```

**⚠️ 注意：导语有 3 段，而且全在「降低心理门槛」**：

| 句 | 做的事情 |
|---|---|
| *"You do not need every specification ready"* | **免去准备负担** |
| *"Our team can follow up by email or WhatsApp"* | **说明下一步会发生什么** |
| *"If a detail is missing, send the vehicle and target look."* | **给最低可行输入** |

**★ 三句话解决三个顾虑，一个字不提自己多厉害。**

---

## 2. ★ 一个值得学的设计：「先发什么」清单

**H2 `WHAT TO SEND IN THE FIRST MESSAGE` + 3 条要点。**

这和经销商页、贴牌页的 `What To Send For The First Conversation` 是**同一个模式**。

**它解决了一个真实问题**：B2B 客户想询盘，但**不知道要准备什么**，
于是「算了，等我资料齐了再问」→ **永远不来问了。**

**竞品的做法**：把「要准备什么」直接写在表单上方，**而且第 3 条反过来告诉他
「不知道怎么量也没关系」**。

**⚠️ 我们的强化版**：我们比竞品多一样东西 —— **1018 个型号 + 3485 个配置**。
所以我们的清单可以更具体：

```
✅ 方案 A（客户已知道要什么）
   型号 + 表面处理 + 数量

✅ 方案 B（客户只知道车）
   车型 / 年份 + 想要的效果

✅ 方案 C（客户只有一张参考图）
   图片 + 数量

三种都能起步 —— 不用等资料齐。
```

**★ 这比竞品的「Vehicle or VIN」更降门槛**，因为我们能**从目录里帮他找到型号**。

---

## 3. ⚠️ 竞品的一个明显缺陷：**页面上有两个表单**

实测 17 个 inputs，实际是**两套表单**：

### 表单 A（自定义，5 个字段）

```
first-name   * (text)     "Enter Your First Name"
last-name      (text)     "Enter Your Last Name"
email        * (email)    "Enter Your Email"
whatsapp       (text)     "Enter Your WhatsApp"
message      * (textarea) "Enter Your Message Here"
→ CTA: "Send Inquiry"
```

### 表单 B（WPForms 插件，5 个字段 + 7 个隐藏）

```
wpforms[fields][6][first]  *  "First Name *"
wpforms[fields][6][last]   *  "Last Name *"
wpforms[fields][1]         *  "Your Email *"
wpforms[fields][4]            "Your WhatsApp"
wpforms[fields][2]         *  "Message *"
+ 隐藏：wpforms[id] / time_token / page_title / page_url / url_referer / page_id / post_id
→ CTA: "Send Message"
```

**两个表单并排出现在同一页上。**

**⚠️ 这几乎肯定是迁移遗留** —— 它换过表单方案（自定义 → WPForms），旧表单没删干净。

**从 `structure-1440.json` 能直接看出这是缺陷**：
- 两组字段**名字重复**（`first-name` vs `wpforms[...][first]`）
- 字段标签策略不同（一组用 placeholder，一组用 label）
- 第一个表单把 `last-name` 设成**非必填**，第二个表单设成**必填** —— **同一个站对同一件事给了两种规则**

**→ 我们的纪律**：**一页一个表单。** 这不需要架构决策，是常识。

**但它提醒我们一件事**：**表单方案迁移时必须清掉旧的**，否则页面上会出现两套。
这个坑很容易踩（尤其 WPForms / 第三方插件）。

---

## 4. 竞品的表单设计（值得学的部分）

### 4.1 字段极简：5 个，2 个必填

| 字段 | 必填 | 为什么 |
|---|---|---|
| First name | ✅ | |
| Last name | ❌ | **不强求** —— 老外有时就写一个名 |
| Email | ✅ | 回复渠道 |
| **WhatsApp** | ❌ | **★ B2B 外贸必备** |
| Message | ✅ | 项目描述 |

**⚠️ 注意它没有**：
- ❌ 公司名 —— **其实该有**（B2B 语境下公司比姓名重要）
- ❌ 国家 / 地区 —— 报价要看运费目的地
- ❌ 产品选择器 —— 因为它没有产品目录（`/products/` 是空的）
- ❌ 数量字段 —— 塞在 Message 里让客户自己写
- ❌ 防滥用（无 CAPTCHA / 无 Turnstile）

**✅ WhatsApp 是必留的** —— 这是 B2B 外贸的标准做法，也是竞品全站反复出现的次 CTA。

### 4.2 隐藏字段（值得学）

竞品的 7 个 hidden input 里有 5 个是**上下文自动携带**：

```
page_title  / page_url / url_referer / page_id / wpforms[post_id]
```

**这些让销售知道「这条询盘从哪来的」。**

**★ 我们要做得更细** —— 因为我们的页面有上下文：

```
page_url          → /products/wheels/1081X
来源页类型        → 详情页 / 目录页 / 车系页 / 贴牌页
轮毂型号          → 1081X（若从详情页来）
productionCode    → 1081X157001W（若已选配置）
已选规格          → 15×7 · 4×100 · ET+35 · 白色全涂装
筛选条件          → （若从目录页来）5×114.3 + 19寸 + 旋压
关注车系          → 坦克（若从车系页来）
```

**这直接决定销售回复的质量** —— 「请问您要看哪款」是最差的开场。

---

## 5. ★ 我们的联系页结构（五段式）

竞品 1 段，我们**加 3 段**（都是必要的，不是堆内容）：

```
/contact  （或 /request-a-quote）
├── ① 页头 + 三段降门槛导语     照抄竞品结构
├── ② ★「先发什么」清单          三种起步方案（比竞品更具体）
├── ③ ★★ 表单                   5–8 个字段 + 上下文自动携带
├── ④ 底部联系块                邮箱 + WhatsApp + 响应承诺
└── ⑤ 后端链路说明              ⚠️ 见 §6
```

**与竞品对照**：

| 段 | 竞品 | 我们 | 差异 |
|---|---|---|---|
| ① 页头导语 | ✅ 3 段 | ✅ | **照抄结构** |
| ② 清单 | ✅ 3 条 | ✅ **3 种起步方案** | **改进（我们有目录）** |
| ③ 表单 | ⚠️ **2 个（缺陷）** | ✅ **1 个** | **修正** |
| ④ 底部 | ✅ | ✅ + **响应承诺** | 改进 |
| ⑤ 表单后端 | ❌ 未验证 | ✅ **必做** | 我们的硬约束 |

**⚠️ 页码 vs 路由**：竞品用 `/contact-us/`，我们的架构里是 `/contact` + `/request-a-quote` 两个。
**建议合并成一个 `/contact`** —— 竞品也只有一个（它的主 CTA 全指向 `/contact-us/`）。
**两个入口指向同一个表单**会分散权重，且没有必要。

---

## 6. 🔴 与竞品最大的差别：**我们的表单必须真的有后端**

**竞品这页的诚实度无法验证** —— 它的表单是 WPForms 插件，
能收到邮件，但**是否落库、是否可追溯、丢了怎么办，全在插件黑箱里**。

**我们不行**，因为 `docs/plans/inquiry-system-architecture.md` 定了三条纪律：

| 纪律 | 含义 |
|---|---|
| **先落库再发信** | 邮件失败不丢询盘 |
| **存快照不存引用** | 产品数据会变，历史询盘不跟着变 |
| **上下文随询盘走** | 销售要知道客户从哪来、看的是什么 |

**⚠️ 这意味着联系页的架构不能只到 UI 为止** —— 它**连着后端**。所以：

```
/contact 页面
    ↓ POST /api/inquiries
[src/app/api/inquiries/route.ts]   ← ❌ 目前不存在
    ↓
  ├─ 落库（DB 选型待定）
  └─ 发信（Resend）
```

**实测现状**：
- `src/app/api/` **目录不存在**
- 零 DB / 邮件依赖（无 resend / prisma / drizzle / neon）
- `src/app/contact/page.tsx` **已有表单 UI，但无后端**

**→ 这一页的「架构」有一半在 `tech-architecture/` 里，不在本文件。**

---

## 7. 字段设计（我们的版本）

**在竞品 5 个字段基础上调整**：

| 字段 | 必填 | 来源 | 相对竞品 |
|---|---|---|---|
| 姓名 | ✅ | 客户填 | 合并 first/last（中文语境不需拆） |
| 邮箱 | ✅ | 客户填 | 同 |
| **WhatsApp** | ❌ | 客户填 | 同（**B2B 外贸必备**） |
| **公司** | ❌ | 客户填 | **★ 新增**（B2B 语境公司比姓名重要） |
| **国家 / 地区** | ❌ | 客户填 | **★ 新增**（报价要看运费） |
| **感兴趣的产品线** | ❌ | 四条线选择 | **★ 新增**（我们有四条线） |
| **型号** | ❌ | 目录选择器（1018 个） | **★ 新增**（竞品做不了） |
| **表面处理** | ❌ | 该型号的 finishes | **★ 新增** |
| **数量** | ❌ | 客户填 | **★ 新增**（单独字段比塞进正文强） |
| 项目描述 | ✅ | 客户填 | 同 |

**⚠️ 但字段数要克制** —— 竞品 5 个，我们 10 个。

**建议：分成两批**
```
第一批（必填 2 个）：姓名 + 邮箱 + 项目描述
第二批（选填，折叠）：公司 / 国家 / 产品线 / 型号 / 表面处理 / 数量
```

**理由**：**字段越多，提交率越低**。但因为**很多字段我们能自动带**
（从详情页来的询盘自动带上型号+规格），**实际要客户填的反而比竞品少**。

**★ 这才是有目录的优势** —— 竞品让客户手写「19 inch / Gunmetal」，
我们从 URL 里就知道了。

---

## 8. 数据与依赖

| 段 | 依赖 | 就绪度 |
|---|---|---|
| ① 页头导语 | 文案 | ✅ |
| ② 起步清单 | 目录数据 | ✅（1018 型号） |
| ③ 表单字段 | **`WheelModel` 类型**（型号选择器） | ⚠️ **类型在补** |
| ④ 底部 | **邮箱 / 电话 / 响应承诺** | ❌ **需丰怀确认** |
| ⑤ **后端** | **DB 选型 + Resend + 部署形态** | ❌ **全部待定** |

**→ 这页 5 段里，2 段阻塞在丰怀，1 段阻塞在技术选型。**

---

## 9. 待确认

| # | 事项 | 阻塞 |
|---|---|---|
| **1** | **公司邮箱**（竞品用 `info@2nforged.com`） | ④ |
| **2** | **电话 / WhatsApp 商务号** | ④ |
| **3** | **响应承诺**（多久回复） | ④ |
| **4** | 公司地址是否公开（丰怀在深圳/广东） | ④ |
| **5** | **数据库选型**（Neon / Supabase / 自建） | ⑤ |
| **6** | 邮件服务（Resend）账号 | ⑤ |
| **7** | 部署形态（Node runtime，非静态导出） | ⑤ |
| 8 | 是否上防滥用（Turnstile） | ③ |
| 9 | `/contact` 与 `/request-a-quote` 是否合并 | 路由 |

---

## 附：竞品实测数据

```
URL:      https://2nforged.com/contact-us/
标题:     Contact 2N Forged | Request a Custom Forged Wheel Quote
H1:       REQUEST WHEEL QUOTE
段数:     1 段 ｜ 高度 1,520 px（全站最短）｜ 字数 187
表单:     ⚠️ 2 个（自定义 5 字段 + WPForms 5 字段 + 7 隐藏）
CTA:      Send Inquiry / Send Message
邮箱:     info@2nforged.com
WhatsApp: 有（直接聊）
JSON-LD:  无（← 可改进点）
导语:     3 段，全在降门槛
清单:     "WHAT TO SEND IN THE FIRST MESSAGE" 3 条
```

**一句话**：这一页证明了 **转化页不该有说服工作量** ——
**说服在前面的页面（1.4 万 px 的贴牌页）已经做完，联系页只需要一个不碍事的表单。**

**竞品唯一的结构性缺陷是页面上留了两个表单**（迁移遗留）——
这是我们不会犯的错。
