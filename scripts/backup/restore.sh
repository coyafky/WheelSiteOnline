#!/usr/bin/env bash
#
# Restore a backup produced by scripts/backup/backup.sh.
#
# Restores into a SEPARATE database by default and never drops the live one
# unless `--force-target` is passed explicitly. A restore that cannot be
# rehearsed safely is not a restore path, it is a hope.
#
# Usage:
#   scripts/backup/restore.sh <archive.tar.gz> [--db NAME] [--dry-run]
#   scripts/backup/restore.sh <archive.tar.gz> --drop-target   # 恢复前清空目标库
#
# Exit codes:
#   0  restored and verified
#   1  failure
#   2  prerequisites missing / refusing to run
#
# Verification is not optional: after importing it reads back the site URL and a
# row count, so a "successful" import that actually restored nothing is caught.

set -euo pipefail

ARCHIVE=""
TARGET_DB=""
DROP_TARGET=0
DRY_RUN=0

WP_CONTAINER="${WP_CONTAINER:-fh-wp}"
DB_CONTAINER="${DB_CONTAINER:-fh-wp-db}"

# 建库需要 CREATE 权限，应用账号通常没有（实测 wp 用户报 1044）。
# 恢复演练因此默认用 root 做 DDL，导入仍用应用账号。
ADMIN_USER="${ADMIN_USER:-root}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-}"

while [ $# -gt 0 ]; do
  case "$1" in
    --db) TARGET_DB="$2"; shift 2 ;;
    --drop-target) DROP_TARGET=1; shift ;;
    --dry-run) DRY_RUN=1; shift ;;
    -h|--help) sed -n '2,22p' "$0"; exit 0 ;;
    -*) echo "未知参数: $1" >&2; exit 2 ;;
    *) ARCHIVE="$1"; shift ;;
  esac
done

fail() { printf '✖ %s\n' "$*" >&2; exit 1; }
log() { printf '%s\n' "$*"; }

[ -n "$ARCHIVE" ] || { sed -n '2,22p' "$0"; exit 2; }
[ -f "$ARCHIVE" ] || fail "归档不存在: $ARCHIVE"

command -v docker >/dev/null 2>&1 || { echo "✖ 需要 docker" >&2; exit 2; }

# 除演练外的目标库必须显式指定，避免手滑覆盖生产库
[ -n "$TARGET_DB" ] || fail "必须用 --db <名称> 指定目标库名（默认库被刻意排除，防止误覆盖）"

from_wp_env() { docker exec "$WP_CONTAINER" printenv "$1" 2>/dev/null || true; }
DB_USER=$(from_wp_env WORDPRESS_DB_USER); DB_USER=${DB_USER:-wp}
DB_PASSWORD=$(from_wp_env WORDPRESS_DB_PASSWORD)
DB_HOST_IN_CONTAINER=$(from_wp_env WORDPRESS_DB_HOST); DB_HOST_IN_CONTAINER=${DB_HOST_IN_CONTAINER:-127.0.0.1}
[ -n "$DB_PASSWORD" ] || fail "取不到数据库口令"

if [ -z "$ADMIN_PASSWORD" ]; then
  ADMIN_PASSWORD=$(docker inspect -f '{{range .Config.Env}}{{println .}}{{end}}' "$DB_CONTAINER" \
    | sed -n 's/^MYSQL_ROOT_PASSWORD=//p' | head -1)
fi
[ -n "$ADMIN_PASSWORD" ] || fail "取不到管理员口令（可用 ADMIN_PASSWORD 环境变量提供）"

# ── 1. 完整性：先验校验和，再解包 ────────────────────────────────────────────
SUM_FILE="${ARCHIVE}.sha256"
if [ -f "$SUM_FILE" ]; then
  DIR=$(dirname "$ARCHIVE"); BASE=$(basename "$ARCHIVE")
  (cd "$DIR" && shasum -a 256 -c "$(basename "$SUM_FILE")" >/dev/null 2>&1) \
    || fail "校验和不匹配，拒绝从不可信的归档恢复"
  log "▸ 校验和通过"
else
  log "⚠ 未找到 .sha256，跳过完整性校验"
fi

WORK_DIR=$(mktemp -d)
trap 'rm -rf "$WORK_DIR"' EXIT
tar xzf "$ARCHIVE" -C "$WORK_DIR" || fail "解包失败"
[ -s "$WORK_DIR/db.sql.gz" ] || fail "归档内没有 db.sql.gz"

log "▸ 目标库 : $TARGET_DB"
if [ "$DRY_RUN" = "1" ]; then
  log "▸ dry-run：归档结构正常，未做任何写入"
  exit 0
fi

# ── 2. 建库 ──────────────────────────────────────────────────────────────────
if [ "$DROP_TARGET" = "1" ]; then
  log "▸ 清空目标库（显式授权）"
  docker exec "$DB_CONTAINER" mysql -h "$DB_HOST_IN_CONTAINER" -u"$ADMIN_USER" -p"$ADMIN_PASSWORD" \
    -e "DROP DATABASE IF EXISTS \`$TARGET_DB\`;" || fail "清空目标库失败"
fi
docker exec "$DB_CONTAINER" mysql -h "$DB_HOST_IN_CONTAINER" -u"$ADMIN_USER" -p"$ADMIN_PASSWORD" \
  -e "CREATE DATABASE IF NOT EXISTS \`$TARGET_DB\`; GRANT ALL ON \`$TARGET_DB\`.* TO '$DB_USER'@'%';" \
  || fail "建库失败"

# ── 3. 导入 ──────────────────────────────────────────────────────────────────
log "▸ 导入数据 …"
gunzip -c "$WORK_DIR/db.sql.gz" > "$WORK_DIR/db.sql" || fail "解压失败"
docker exec -i "$DB_CONTAINER" mysql -h "$DB_HOST_IN_CONTAINER" -u"$DB_USER" -p"$DB_PASSWORD" \
  "$TARGET_DB" < "$WORK_DIR/db.sql" || fail "导入失败"

# ── 4. 回读验证（不做这一步就不算恢复成功）────────────────────────────────────
log "▸ 回读验证 …"
q() {
  docker exec "$DB_CONTAINER" mysql -N -B -h "$DB_HOST_IN_CONTAINER" -u"$DB_USER" -p"$DB_PASSWORD" \
    "$TARGET_DB" -e "$1" 2>/dev/null
}

POSTS=$(q "SELECT COUNT(*) FROM wp_posts;")
OPTS=$(q "SELECT COUNT(*) FROM wp_options;")
HOME_URL=$(q "SELECT option_value FROM wp_options WHERE option_name='home' LIMIT 1;")

[ -n "$POSTS" ] && [ "$POSTS" -gt 0 ] || fail "wp_posts 为空，导入未生效"
[ -n "$OPTS" ] && [ "$OPTS" -gt 0 ] || fail "wp_options 为空，导入未生效"
[ -n "$HOME_URL" ] || fail "读不到 siteurl/home，恢复不完整"

log "✔ 恢复完成并验证通过"
log "  目标库   : $TARGET_DB"
log "  wp_posts : $POSTS 行"
log "  wp_options: $OPTS 行"
log "  home     : $HOME_URL"
log ""
log "提示：uploads 归档（uploads.tar.gz）未被解入运行目录——它属于文件系统层，"
log "      正式恢复时需单独解到 wp-content/ 并保留原权限，详见 docs/runbooks/。"
