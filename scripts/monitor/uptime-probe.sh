#!/usr/bin/env bash
#
# Availability probe for the public site.
#
# Designed for the constraint this project actually has: no paid monitoring and
# no external service dependency. Run it from cron (on the host or another
# machine) and it alerts on state *transitions*, not on every failed check —
# otherwise a one-hour outage produces hundreds of alerts and the recipient
# starts filtering them.
#
# What it checks beyond HTTP 200:
#   - the health endpoint's own verdict (it returns 503 when a dependency is down)
#   - that the response is the site, not a captive portal or error page
#
# Usage:
#   scripts/monitor/uptime-probe.sh --url https://example.com [--alert-to a@b.c]
#   scripts/monitor/uptime-probe.sh --dry-run            # 只探测，不告警
#
# Exit: 0 healthy (or alert delivered) | 1 unhealthy | 2 prerequisites missing
#
# State is kept in a file so consecutive failures do not re-alert. Delete that
# file to reset the state machine.

set -uo pipefail

BASE_URL=""
ALERT_TO="${FH_UPTIME_ALERT_TO:-}"
STATE_DIR="${FH_UPTIME_STATE_DIR:-$HOME/.config/alma/state/uptime-probe}"
FAIL_THRESHOLD="${FH_UPTIME_FAIL_THRESHOLD:-2}"
DRY_RUN=0
TIMEOUT="${FH_UPTIME_TIMEOUT:-10}"

while [ $# -gt 0 ]; do
  case "$1" in
    --url) BASE_URL="$2"; shift 2 ;;
    --alert-to) ALERT_TO="$2"; shift 2 ;;
    --state-dir) STATE_DIR="$2"; shift 2 ;;
    --threshold) FAIL_THRESHOLD="$2"; shift 2 ;;
    --dry-run) DRY_RUN=1; shift ;;
    -h|--help) sed -n '2,24p' "$0"; exit 0 ;;
    *) echo "未知参数: $1" >&2; exit 2 ;;
  esac
done

[ -n "$BASE_URL" ] || { sed -n '2,24p' "$0"; exit 2; }

BASE_URL="${BASE_URL%/}"
mkdir -p "$STATE_DIR"
STATE_FILE="$STATE_DIR/state"
HISTORY="$STATE_DIR/history.log"

# Reading state never fails hard: a missing file just means "no prior state".
last_status="up"
fail_count=0
if [ -f "$STATE_FILE" ]; then
  # shellcheck disable=SC1090
  . "$STATE_FILE" 2>/dev/null || true
  last_status="${last_status:-up}"
  fail_count="${fail_count:-0}"
fi

probe() {
  local url="$1"
  local body_file
  body_file=$(mktemp)
  local code
  code=$(curl -sS -o "$body_file" -w '%{http_code}' --max-time "$TIMEOUT" "$url" 2>/dev/null)
  PROBE_CODE="$code"
  PROBE_BODY_FILE="$body_file"
}

# ── 1. 主页必须 200 ───────────────────────────────────────────────────────────
probe "$BASE_URL/"
home_code="$PROBE_CODE"
home_body="$PROBE_BODY_FILE"

# ── 2. 健康端点必须 200 ───────────────────────────────────────────────────────
probe "$BASE_URL/api/health"
health_code="$PROBE_CODE"
health_body="$PROBE_BODY_FILE"

problem=""
if [ "$home_code" != "200" ]; then
  problem="home returned HTTP $home_code"
elif ! grep -qi "<html" "$home_body" 2>/dev/null; then
  # A 200 that is not the site itself (proxy error page, captive portal).
  problem="home 200 but body is not HTML"
elif [ "$health_code" != "200" ]; then
  # The health endpoint knows *why*; surface its verdict instead of guessing.
  problem="health returned HTTP $health_code: $(tr -d '\n' < "$health_body" | cut -c1-300)"
fi

rm -f "$home_body" "$health_body"

now=$(date -u +%Y-%m-%dT%H:%M:%SZ)

if [ -z "$problem" ]; then
  # Recovered?
  if [ "$last_status" = "down" ]; then
    printf '%s UP   %s recovered after %d failed checks\n' "$now" "$BASE_URL" "$fail_count" >> "$HISTORY"
    if [ "$DRY_RUN" = "0" ] && [ -n "$ALERT_TO" ]; then
      printf 'Subject: [Fenghuai] 站点恢复\n\n%s 已恢复。\n\n此前连续失败次数: %d\n' "$BASE_URL" "$fail_count" \
        | sendmail -t "$ALERT_TO" 2>/dev/null || echo "（sendmail 不可用，恢复通知未发出）" >&2
    fi
    echo "RECOVERED $BASE_URL"
  fi
  printf 'last_status=%s\nfail_count=0\n' "up" > "$STATE_FILE"
  exit 0
fi

fail_count=$((fail_count + 1))
# Flip to `down` as soon as a failure is observed. Keeping `up` here meant the
# next successful probe never looked like a recovery, so the recovery event and
# its notification were lost.
printf 'last_status=%s\nfail_count=%d\n' "down" "$fail_count" > "$STATE_FILE"
printf '%s FAIL %s %s (consecutive=%d)\n' "$now" "$BASE_URL" "$problem" "$fail_count" >> "$HISTORY"

echo "UNHEALTHY $BASE_URL: $problem (consecutive=$fail_count)"

# Only alert once the failure is confirmed, and only on the transition.
if [ "$DRY_RUN" = "0" ] && [ "$fail_count" -eq "$FAIL_THRESHOLD" ] && [ -n "$ALERT_TO" ]; then
  printf 'Subject: [Fenghuai] 站点不可用\n\n%s\n\n连续失败: %d 次\n探测时间: %s\n' \
    "$problem" "$fail_count" "$now" \
    | sendmail -t "$ALERT_TO" 2>/dev/null || echo "（sendmail 不可用，告警未发出）" >&2
fi

exit 1
