# 本机运行时约定（open-code-review · ocr）

> 本文件是**本机/本项目对 `ocr` 的运行时规范**，不是上游内容。升级技能时本文件保留。
> 上游来源与本地文本补丁见同目录 `.local-patch.md`。

## 一、默认模型：`commandcode/deepseek/deepseek-v4-flash`

**2026-09-30 定案 —— 使用本技能时默认走 deepseek-v4-flash。**

| 项 | 值 |
|---|---|
| 接入方式 | 自定义 provider `magpie`（本机网关，OpenAI 兼容） |
| Base URL | `http://127.0.0.1:3425/v1` |
| 默认模型 | **`commandcode/deepseek/deepseek-v4-flash`** |
| 评审语言 | `中文` |
| 配置落点 | `~/.opencodereview/config.json` |

### 为什么定它

1. **工具调用已实测通过** —— OCR 的评审靠模型主动调 `file_read` / `code_search` / `code_comment`，只测普通对话没有意义。本模型实测能正确发起工具调用：`file_read({"file_path": "apps/site/auth.ts"})`。
2. **成本** —— flash 档，符合本项目「上下文成本纪律」。一次全量评审动辄上百万 token。
3. **与本机既有约定一致** —— 本机 Hermes 默认模型同为 `commandcode/deepseek/deepseek-v4-flash`（同走 magpie）。
4. **避开了配额陷阱** —— 见下节。

> ⚠️ **质量口径提醒**：flash 是快速档。若某次评审要求更高判断力（安全相关改动、发布前门禁），用**单次覆盖**升档，**不要改默认**：
>
> ```bash
> ocr review --model commandcode/gpt-5.6-sol ...   # 仅本次生效
> ```

### 实测可用的备选（2026-09-30 全部验证过工具调用）

| 模型 | 工具调用 | 备注 |
|---|---|---|
| **`commandcode/deepseek/deepseek-v4-flash`** | ✅ | **本机默认** |
| `commandcode-plan/deepseek/deepseek-v4-flash` | ✅ | 同模型另一入口 |
| `group/auto-deepseek-v4-flash` | ✅ | 自动路由 |
| `opencode-go/deepseek-v4-flash` | ✅ | |
| `commandcode/gpt-5.6-sol` | ✅ | 强一些；配额易被长评审打穿 |
| `commandcode-plan/gpt-5.6-sol` | ✅ | 同上 |
| `codex/gpt-5.6-sol` | ✅ | ⚠️ 半天量级配额，全量评审一轮就能打穿 |

## 二、已知坑：模型配额会在长评审中途耗尽

**2026-09-30 实证**：一次 174 文件的全量评审用 `codex/gpt-5.6-sol` 跑到一半，配额被打穿 —— magpie 路由日志显示该模型 `200 × 226` 之后变成 **`429 Codex: The usage limit has been reached` × 11**（另有 6 次 502）。OCR 的重试逻辑会**死磕这个 429**，表现为**进程还活着但毫无进展**（不报错、不退出）。

### 怎么发现（两个信号缺一不可）

```bash
# 1) 会话文件停止增长（OCR 正常工作时它是持续增长的）
S=$(ls -t ~/.opencodereview/sessions/*/*.jsonl | head -1)
stat -f%z "$S"    # 隔 15 秒看两次，数值不变 = 疑似卡死

# 2) magpie 路由日志出现 429 风暴（agent 记作 local）
python3 - <<'PY'
import json, collections, os, datetime
R = os.path.expanduser("~/.config/magpie/routing/" + datetime.date.today().isoformat() + ".jsonl")
c = collections.Counter()
for line in open(R, encoding="utf-8", errors="replace"):
    line = line.strip()
    if not line: continue
    try: d = json.loads(line)
    except: continue
    if "gpt-5.6-sol" in str(d.get("model")): c[(d.get("model"), d.get("status"))] += 1
for k, v in c.most_common(): print(k, v)
PY
```

### 处置

1. `pkill -f "ocr review"`（它会无限重试，别等）
2. **不要删掉已产出的部分结果** —— OCR 撞预算/失败时仍会写出 `comments`，先收下
3. 换模型重跑剩余部分（见「分批补跑」）

## 三、分批补跑（长评审的正确姿势）

`--max-tokens-budget` 会在耗尽时**保留部分结果**，并把其余文件标成 `failed(budget)` —— 这是可用特性，不是故障。

```bash
# 第 1 批：限额跑（先摸清成本轮廓）
ocr review --exclude "<排除清单>" -f json -o run1.json --max-tokens-budget 3000000

# 读出第 1 批实际完成/失败的文件，把「已完成的」加进第 2 批的排除清单
# 第 2 批：不设预算（或给足），专攻剩余文件
ocr review --exclude "<排除清单>,<第1批已完成文件…>" -f json -o run2.json
```

⚠️ **不要给边界设「省成本」的小预算** —— 2026-09-30 实测：300 万 token 的「保险」恰好把 `modules/inquiry/index.ts`（667 行业务核心）、`modules/identity/*`、`db/schema.ts` 全部挡在门外，只跑完展示层。**预算上限用于防跑飞，不用于省钱。**

## 四、报告落点

评审产出的中文 HTML 报告放本项目 `docs/reports/`；原始 JSON 与运行时脚本放**仓库外**（`~/security-audit-skill/ocr-run/`），避免污染仓库。

## 五、环境前提

- **本机 git 2.39.5（Apple Git-154）低于官方要求的 2.41** → 每次运行都会打 warning。功能可用，但属未满足的前置条件（修法 `brew install git`）。
- `ocr` 版本：`1.12.11`（构建 commit `a758d9cb`）。
