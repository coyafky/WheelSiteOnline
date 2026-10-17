#!/usr/bin/env bash
#
# Export IMAGE_TAG=<git sha> so `docker compose` builds and runs an image that
# can be traced back to a commit.
#
# Usage:
#   eval "$(deploy/frontend/tag.sh)"           # export IMAGE_TAG (+ dirty marker)
#   deploy/frontend/tag.sh --print             # just print the tag
#   deploy/frontend/tag.sh --verify <image>    # assert the image's revision label
#
# Rules:
#   - Clean tree  → IMAGE_TAG = <12-char sha>
#   - Dirty tree  → IMAGE_TAG = <12-char sha>-dirty
#     A dirty build must not claim a clean commit: the image would then be
#     indistinguishable from one built from the pushed tree, and "which commit is
#     live?" would get a confidently wrong answer.
#
# Exit: 0 ok | 1 not a git repo / verification failed | 2 bad usage

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

die() { echo "tag.sh: $*" >&2; exit 1; }

git -C "$REPO_ROOT" rev-parse --git-dir >/dev/null 2>&1 || die "$REPO_ROOT 不是 git 仓库"

SHA="$(git -C "$REPO_ROOT" rev-parse HEAD)"
SHORT="${SHA:0:12}"

# `--porcelain` reports untracked files too; those are part of the build context,
# so they make the image unreproducible from the commit alone.
if [ -n "$(git -C "$REPO_ROOT" status --porcelain)" ]; then
  TAG="${SHORT}-dirty"
else
  TAG="$SHORT"
fi

case "${1:-}" in
  "")
    # Intended for `eval "$(tag.sh)"`, so print export statements only.
    echo "export IMAGE_TAG=$TAG"
    echo "export IMAGE_REVISION=$SHA"
    ;;
  --print)
    echo "$TAG"
    ;;
  --verify)
    IMAGE="${2:-}"
    [ -n "$IMAGE" ] || die "用法: tag.sh --verify <image>"
    command -v docker >/dev/null 2>&1 || die "找不到 docker"
    ACTUAL="$(docker image inspect "$IMAGE" \
      --format '{{ index .Config.Labels "org.opencontainers.image.revision" }}' 2>/dev/null)"
    [ -n "$ACTUAL" ] || die "$IMAGE 没有 org.opencontainers.image.revision 标签"
    if [ "$ACTUAL" != "$SHA" ]; then
      die "镜像 revision ($ACTUAL) 与当前 HEAD ($SHA) 不一致"
    fi
    echo "OK $IMAGE → ${SHA:0:12}"
    ;;
  *)
    die "未知参数: $1"
    ;;
esac
