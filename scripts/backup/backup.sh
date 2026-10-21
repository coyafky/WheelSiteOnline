#!/usr/bin/env bash
#
# Back up the WordPress database and uploads.
#
# Written for the single-host Docker Compose layout this project actually runs:
# WordPress lives in `fh-wp`, MySQL in `fh-wp-db`, uploads in `wp-content/uploads`.
# Everything is driven through `docker exec` so it works on a machine without
# local MySQL client tools (which is the case on this workstation).
#
# Usage:
#   scripts/backup/backup.sh [--out DIR] [--keep N] [--label TEXT]
#   scripts/backup/backup.sh --dry-run
#
# Exit codes:
#   0  backup created and verified
#   1  failure (nothing is reported as a success it cannot prove)
#   2  prerequisites missing
#
# NOTE: the archive contains the database only. Credentials are NOT copied into
# it — `.env` files are read in place. An archive that must be moved off-host
# needs encrypting separately (see docs/architecture/SECURITY.md §3).

set -euo pipefail

OUT_DIR="${FENGHUAI_BACKUP_DIR:-$HOME/.config/alma/backups/fenghuai-wp}"
KEEP="${FENGHUAI_BACKUP_KEEP:-7}"
LABEL=""
DRY_RUN=0

WP_CONTAINER="${WP_CONTAINER:-fh-wp}"
DB_CONTAINER="${DB_CONTAINER:-fh-wp-db}"
DB_NAME="${DB_NAME:-wordpress}"
DB_USER="${DB_USER:-wp}"
DB_PASSWORD="${DB_PASSWORD:-}"

while [ $# -gt 0 ]; do
  case "$1" in
    --out) OUT_DIR="$2"; shift 2 ;;
    --keep) KEEP="$2"; shift 2 ;;
    --label) LABEL="$2"; shift 2 ;;
    --dry-run) DRY_RUN=1; shift ;;
    -h|--help) sed -n '2,26p' "$0"; exit 0 ;;
    *) echo "未知参数: $1" >&2; exit 2 ;;
  esac
done

log() { printf '%s\n' "$*"; }
fail() { printf '✖ %s\n' "$*" >&2; exit 1; }

command -v docker >/dev/null 2>&1 || { echo "✖ 需要 docker" >&2; exit 2; }

# ── 前置检查（缺一不可，缺了就明确报错，不静默降级）─────────────────────────
for c in "$WP_CONTAINER" "$DB_CONTAINER"; do
  docker inspect "$c" >/dev/null 2>&1 || { echo "✖ 容器不存在: $c" >&2; exit 2; }
  running=$(docker inspect -f '{{.State.Running}}' "$c")
  [ "$running" = "true" ] || { echo "✖ 容器未运行: $c" >&2; exit 2; }
done

# 数据库凭据：优先环境变量；否则从 WordPress 容器的环境读 —— 这正是
# wp-config.php 里 getenv_docker('WORDPRESS_DB_*') 使用的同一来源，
# 而不是 MySQL 容器的 root 口令（两者不同，用错会 1045）。
from_wp_env() { docker exec "$WP_CONTAINER" printenv "$1" 2>/dev/null || true; }
[ -n "$DB_PASSWORD" ] || DB_PASSWORD=$(from_wp_env WORDPRESS_DB_PASSWORD)
[ -n "$DB_USER" ] && [ "$DB_USER" != "wp" ] || DB_USER=$(from_wp_env WORDPRESS_DB_USER || echo wp)
[ -n "$DB_NAME" ] && [ "$DB_NAME" != "wordpress" ] || DB_NAME=$(from_wp_env WORDPRESS_DB_NAME || echo wordpress)
[ -n "$DB_PASSWORD" ] || fail "取不到数据库口令（可用 DB_PASSWORD 环境变量提供）"

# 容器内连接的 host 用 Docker 网络别名；容器名不一定是该别名。
DB_HOST_IN_CONTAINER=$(from_wp_env WORDPRESS_DB_HOST)
[ -n "$DB_HOST_IN_CONTAINER" ] || DB_HOST_IN_CONTAINER=127.0.0.1

STAMP=$(date +%Y%m%d-%H%M%S)
NAME="fenghuai-wp-${STAMP}${LABEL:+-$LABEL}"
WORK_DIR=$(mktemp -d)
trap 'rm -rf "$WORK_DIR"' EXIT

log "▸ 目标目录 : $OUT_DIR"
log "▸ 备份标识 : $NAME"
if [ "$DRY_RUN" = "1" ]; then
  log "▸ dry-run：仅做前置检查，不写任何文件"
  exit 0
fi

mkdir -p "$OUT_DIR"

# ── 1. 数据库 ────────────────────────────────────────────────────────────────
log "▸ 导出数据库 $DB_NAME …"
if ! docker exec "$DB_CONTAINER" \
  mysqldump --single-transaction --quick --skip-lock-tables \
  -h "$DB_HOST_IN_CONTAINER" \
  -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "$WORK_DIR/db.sql" 2>"$WORK_DIR/dump.err"; then
  sed 's/-p[^ ]*/-p<redacted>/' "$WORK_DIR/dump.err" >&2 || true
  fail "mysqldump 失败"
fi

[ -s "$WORK_DIR/db.sql" ] || fail "dump 文件为空"
# 粗校验：mysqldump 成功时文件末尾含 "Dump completed"
if ! tail -5 "$WORK_DIR/db.sql" | grep -q "Dump completed"; then
  fail "dump 未正常结束（缺少 'Dump completed' 标记），拒绝生成备份"
fi
gzip -9 "$WORK_DIR/db.sql"

# ── 2. 上传目录 ──────────────────────────────────────────────────────────────
log "▸ 打包 uploads …"
if docker exec "$WP_CONTAINER" test -d /var/www/html/wp-content/uploads 2>/dev/null; then
  if ! docker exec "$WP_CONTAINER" tar czf - -C /var/www/html/wp-content uploads \
    > "$WORK_DIR/uploads.tar.gz"; then
    fail "uploads 打包失败"
  fi
else
  log "  （容器内无 uploads 目录，跳过）"
  : > "$WORK_DIR/uploads.tar.gz"
fi

# ── 3. 打包 + 校验 ───────────────────────────────────────────────────────────
log "▸ 生成归档 …"
tar czf "$OUT_DIR/$NAME.tar.gz" -C "$WORK_DIR" .

SUM=$(shasum -a 256 "$OUT_DIR/$NAME.tar.gz" | awk '{print $1}')
printf '%s  %s\n' "$SUM" "$NAME.tar.gz" > "$OUT_DIR/$NAME.tar.gz.sha256"

# 回读校验：必须真的把归档重新读一遍再比对，否则「校验和」只是自我声明。
# `shasum -c` 按清单里的相对路径找文件，所以要在归档所在目录执行。
if ! (cd "$OUT_DIR" && shasum -a 256 -c "$NAME.tar.gz.sha256" >/dev/null 2>&1); then
  fail "校验和不匹配，备份不可信"
fi

SIZE=$(du -h "$OUT_DIR/$NAME.tar.gz" | cut -f1)
log "✔ 完成: $OUT_DIR/$NAME.tar.gz ($SIZE)"
log "  sha256: $SUM"

# ── 4. 轮转 ──────────────────────────────────────────────────────────────────
if [ "$KEEP" -gt 0 ]; then
  # 只清理本脚本生成的命名模式，不碰目录里其它文件
  ls -1t "$OUT_DIR"/fenghuai-wp-*.tar.gz 2>/dev/null \
    | tail -n "+$((KEEP + 1))" \
    | while read -r old; do
        rm -f "$old" "${old}.sha256"
        log "  ↺ 轮转删除: $(basename "$old")"
      done
fi

log "▸ 当前保留 $(ls -1 "$OUT_DIR"/fenghuai-wp-*.tar.gz 2>/dev/null | wc -l | tr -d ' ') 份"
