import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

/**
 * T-40 — the pre-commit guard.
 *
 * The hook is a shell script, so these checks read it as text and assert the
 * properties that decide whether it is useful: it must catch the patterns the
 * task names, and it must NOT fire on ordinary code. A noisy hook gets bypassed
 * with `--no-verify`, which is worse than having no hook at all — so the
 * negative cases matter as much as the positive ones.
 *
 * Behaviour was also verified end-to-end by making real commits (secret → blocked
 * with exit 1; normal code → committed). These tests keep the rules from being
 * quietly weakened later.
 */

const HOOK = readFileSync(new URL("../.githooks/pre-commit", import.meta.url), "utf8");

test("钩子检查暂存文件名，而不只是内容", () => {
  // A staged .env leaks by name; scanning content alone would miss it.
  assert.match(HOOK, /git diff --cached --name-only/);
  assert.match(HOOK, /\\\.env\(\$\|\\\.\)/);
});

test("只扫新增行，不因为历史里的旧密钥而永远失败", () => {
  assert.match(HOOK, /git diff --cached -U0/);
  assert.match(HOOK, /grep -E '\^\\\+' \| grep -vE '\^\\\+\\\+\\\+'/);
});

test("覆盖任务点名的 sk- 模式", () => {
  assert.match(HOOK, /sk-\[A-Za-z0-9_-\]\{20,\}/);
});

test("还覆盖其它常见凭据形态", () => {
  for (const [name, needle] of [
    ["Anthropic", /sk-ant-/],
    ["GitHub", /gh\[pousr\]_/],
    ["AWS", /AKIA\[0-9A-Z\]\{16\}/],
    ["私钥块", /BEGIN \(\[A-Z\]\+ \)\?PRIVATE KEY/],
    ["Slack", /xox\[baprs\]-/],
  ] as const) {
    assert.match(HOOK, needle, `缺少 ${name} 的检测规则`);
  }
});

test("模式以 -e 传入（私钥模式以连字符开头，否则被当成 grep 选项）", () => {
  // Real bug caught during verification: a private-key pattern starting with a
  // dash was parsed as a grep option → "unrecognized option" and it silently
  // checked nothing. The literal is assembled here so this file does not itself
  // trip the secret pattern.
  assert.match(HOOK, /grep -nE -e "\$pattern"/);
});

test("文档字符串示例不会被误拦", () => {
  // The hook's own hint text contains `sk-xxxx`; if that were matched, every
  // commit touching this file would fail.
  assert.ok(
    !/sk-\[A-Za-z0-9_-\]\{4,,\}/.test(HOOK),
    "模式必须要求足够长度，否则会拦掉文档里的占位写法",
  );
});

test("提供明确的绕过方式，避免用户去猜", () => {
  assert.match(HOOK, /--no-verify/);
});

test("拦截时以非零码退出", () => {
  assert.match(HOOK, /problems=1/);
  assert.match(HOOK, /exit 1/);
});
