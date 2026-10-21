# QA 遗留问题：越界分页 404 + e2e 端口冲突

- **状态**：待开始（**用户 2026-10-11 明确「先记着不动」**）
- **创建日期**：2026-10-11
- **优先级**：P1（ISSUE-QA-02 影响回归可运行性）｜ P2（ISSUE-QA-01）
- **来源**：`outputs/reports/QA-轮毂筛选器-测试用例-2026-10-11.md`（TC-15 / PF-04）

## 背景

轮毂筛选器 QA 核验（34 条用例，33 通过 / 1 部分通过）中挖出两个问题，
当时用户决定**只记录、不修复**。本任务用于承载它们，避免遗失。

---

## ISSUE-QA-01 · 越界分页返回 404 而非友好状态（P2）

### 现象

```
/products/wheels?page=9999  → HTTP 404
/products/wheels?page=-5    → HTTP 200（回落基线 138）
```

**两个越界方向行为不一致**。

### 期望

越界页码应统一处理：回落末页，或给出明确的空状态 + 返回目录入口，**不返回硬 404**。

### 影响

用户手改 URL、或旧链接失效时会撞到 404 错误页，而不是被引导回目录。

### 证据

`outputs/reports/QA-轮毂筛选器-测试用例-2026-10-11.md` TC-15（HTTP 状态码直接证据）

### 修法建议

统一越界归一化：`page < 1` 或 `page > 末页` 均回落 / 给空状态。
注意与已有的「非法 diameter 归一化」行为对齐（那部分已正确处理）。

---

## ISSUE-QA-02 · e2e 默认端口被其他项目占用，套件无法直接运行（P1）

### 现象

在本机直接跑 `npm run test:e2e`：

```
Error: http://127.0.0.1:3100 is already used,
make sure that nothing is running on the port/url
or set reuseExistingServer:true in config.webServer.
```

→ **套件完全启动不了。**

### 根因

- `playwright.config.ts` 用 `port 3100` + `reuseExistingServer: false`
- 而本机 **3100 端口被另一个项目（蓝辉轻改官网）长期占用**
- 实测指纹：`http://127.0.0.1:3100/` → `<title>蓝辉轻改 LANHUI | ...</title>`
- 本项目应为 `<title>... | Fenghuai</title>`

### 为什么危险（不能简单地改成 reuseExistingServer: true）

若把 `reuseExistingServer` 改成 `true` 来"修好"它，**测试会静默跑在蓝辉站上**
（蓝辉站也有产品页路由）→ **假通过**。这正是 QA 纪律里「端口归属必须先验证」的实例。

### 规避（已验证）

```bash
PLAYWRIGHT_PORT=3300 CI=1 npx playwright test e2e/wheel-filter.spec.ts --project=chromium
# → 4 passed (22.3s)
```

### 修法建议（二选一，待定）

- **A**：默认端口改成一个不易冲突的值（如 3210），并在文档中说明
- **B**：`webServer` 启动前加**端口归属断言**（比对本项目标题指纹，不符即报错退出）

**推荐 B** —— 它同时防住「端口被占」和「误连他人站点」两类问题，且对其他项目也可复用。

---

## 验收

- ISSUE-QA-01：`?page=9999` 与 `?page=-5` 行为一致，均不返回 404
- ISSUE-QA-02：新机器 / 端口被占时，`npm run test:e2e` 要么能跑，要么**明确报错说明原因**，绝不静默连到别的站点

## 暂不做

- 不修改 `webapp-qa` 通用技能（端口归属已是通用纪律，无需改）
- 不触发依赖升级或配置重构
- **未经用户明确授权，不 commit / push**
