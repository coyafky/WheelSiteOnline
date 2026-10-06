#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把跟踪的 mu-plugin 同步进本地 WordPress 容器。

    local-wp/mu-plugins/*.php            ← 唯一源（进 git）
              ↓  本脚本
    local-wp/wp-data/wp-content/mu-plugins/   ← 运行时目标（gitignored）

用法：
    python3 scripts/sync-mu-plugins.py            # 同步
    python3 scripts/sync-mu-plugins.py --check    # 只校验是否一致，不一致退出码 1

为什么要这层：
    `local-wp/wp-data/` 是 WordPress 容器的 bind-mount 目标，在 .gitignore 里。
    mu-plugin 是**数据库 schema 的唯一所有者**（CPT 注册、meta 声明、REST 端点），
    它落在 gitignore 里意味着 schema 不受版本控制 —— 改了没人看得见，
    也没法在部署时安装。

    这与本项目反复踩到的「静默契约」是同一个病：Next 侧看不到 schema 变更，
    只能等运行时炸。把源放进 git 之后，**schema 改动会出现在 `git diff` 里**。

    跟踪副本是源，wp-data 那份是派生产物 —— 方向单一，不存在双向合并。
"""

from __future__ import annotations

import hashlib
import os
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(ROOT, "local-wp", "mu-plugins")
DST_DIR = os.path.join(ROOT, "local-wp", "wp-data", "wp-content", "mu-plugins")


def sha256(path: str) -> str:
    with open(path, "rb") as fh:
        return hashlib.sha256(fh.read()).hexdigest()


def main() -> int:
    check_only = "--check" in sys.argv

    if not os.path.isdir(SRC_DIR):
        print(f"✗ 找不到源目录：{SRC_DIR}", file=sys.stderr)
        return 1

    sources = sorted(f for f in os.listdir(SRC_DIR) if f.endswith(".php"))
    if not sources:
        print(f"✗ 源目录里没有 .php：{SRC_DIR}", file=sys.stderr)
        return 1

    if not check_only:
        os.makedirs(DST_DIR, exist_ok=True)

    out_of_sync: list[str] = []
    synced: list[str] = []
    unchanged: list[str] = []

    for name in sources:
        src = os.path.join(SRC_DIR, name)
        dst = os.path.join(DST_DIR, name)
        src_hash = sha256(src)

        if os.path.exists(dst) and sha256(dst) == src_hash:
            unchanged.append(name)
            continue

        if check_only:
            out_of_sync.append(name)
            continue

        shutil.copy2(src, dst)
        # 回读校验 —— 「执行了复制」不等于「复制对了」
        if sha256(dst) != src_hash:
            print(f"✗ {name}：复制后校验失败", file=sys.stderr)
            return 1
        synced.append(name)

    # 目标里有没有源里已删掉的残留（会让旧 plugin 继续运行）
    stale: list[str] = []
    if os.path.isdir(DST_DIR):
        for name in sorted(os.listdir(DST_DIR)):
            if name.endswith(".php") and name not in sources:
                stale.append(name)
                if not check_only:
                    os.remove(os.path.join(DST_DIR, name))

    if check_only:
        if out_of_sync or stale:
            print("✗ mu-plugin 与跟踪副本不一致：")
            for n in out_of_sync:
                print(f"    内容不一致  {n}")
            for n in stale:
                print(f"    目标侧多余  {n}")
            print("  跑 `python3 scripts/sync-mu-plugins.py` 修正。")
            return 1
        print(f"✅ mu-plugin 一致（{len(sources)} 个文件）")
        return 0

    print(f"✅ 已同步到 {os.path.relpath(DST_DIR, ROOT)}")
    if synced:
        print(f"   写入 {len(synced)}：{', '.join(synced)}")
    if unchanged:
        print(f"   未变 {len(unchanged)}：{', '.join(unchanged)}")
    if stale:
        print(f"   清理多余 {len(stale)}：{', '.join(stale)}")
    print()
    print("   改动已生效的 plugin 后，WordPress 会立刻加载新版本（mu-plugin 无缓存层）。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
