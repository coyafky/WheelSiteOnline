#!/usr/bin/env python3
"""
询盘并发探针（本地）

回答「多个用户同时提交会怎样」。真并发（ThreadPoolExecutor + 真 HTTP），
不走 mock。

用法：
  # 先起本地生产服务（必须带 Origin 白名单，否则 403）
  ALLOW_LOOPBACK_WP_MEDIA=true NODE_ENV=production \
  INQUIRY_ALLOWED_ORIGINS="http://127.0.0.1:3000" npx next start -p 3000

  python3 concurrency-probe.py api     # 完整用户路径（Next /api/inquiries）
  python3 concurrency-probe.py wp      # 直打 WP REST（数据层）
  python3 concurrency-probe.py db      # 查库现状 + outbox 一致性

⚠️ 内存限流窗口 10 分钟：跑不同场景之间**必须重启服务**，否则计数互相污染。
"""
import json
import subprocess
import sys
import time
import hashlib
from concurrent.futures import ThreadPoolExecutor

API = "http://127.0.0.1:3000/api/inquiries"
ORIGIN = "http://127.0.0.1:3000"
WP = "http://127.0.0.1:8081/wp-json/fh/v1/inquiries"
DB_CONTAINER = "fh-wp-db"
DB_NAME = "wordpress"


def _svc_key() -> str:
    try:
        for line in open(".env.local", encoding="utf-8"):
            if line.startswith("WP_INQUIRY_SERVICE_KEY="):
                return line.split("=", 1)[1].strip()
    except OSError:
        pass
    return ""


def post(url: str, payload: dict, headers: dict) -> tuple[str, dict]:
    body = json.dumps(payload).encode()
    cmd = ["curl", "-s", "-o", "-", "-w", "\n__HTTP__%{http_code}", "-X", "POST", url,
           "--data-binary", "@-", "--max-time", "90"]
    for k, v in headers.items():
        cmd += ["-H", f"{k}: {v}"]
    r = subprocess.run(cmd, input=body, capture_output=True)
    out = r.stdout.decode("utf-8", "replace")
    code = out.rsplit("__HTTP__", 1)[-1].strip() if "__HTTP__" in out else "?"
    try:
        parsed = json.loads(out.rsplit("\n__HTTP__", 1)[0])
    except Exception:
        parsed = {}
    return code, parsed


def api_post(payload):
    return post(API, payload, {"Content-Type": "application/json", "Origin": ORIGIN})


def wp_post(payload):
    return post(WP, payload, {"Content-Type": "application/json",
                              "X-FH-Service-Key": _svc_key()})


def sql(q: str) -> str:
    r = subprocess.run(["docker", "exec", DB_CONTAINER, "sh", "-c",
                        f'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" {DB_NAME} -N -B -e "{q}"'],
                       capture_output=True)
    return r.stdout.decode("utf-8", "replace").strip()


def mk_api(key, email):
    return {"idempotencyKey": key, "customerType": "business", "productLine": "wheels",
            "message": "concurrency probe message for testing", "name": "Probe",
            "email": email, "country": "DE", "privacyVersion": "v1",
            "formStartedAt": int(time.time() * 1000) - 5000,
            "context": {"model": "C", "sourcePage": "/x", "intent": "quote"}}


def mk_wp(key, email):
    return {"idempotencyKey": key, "customerType": "business", "productLine": "wheels",
            "message": "concurrency probe", "name": "Probe", "email": email,
            "countryCode": "DE", "privacyVersion": "verify-1",
            "context": {"model": "C", "productionCode": "PC", "spec": {"size": "18x8.5"},
                        "sourcePage": "/x", "intent": "quote", "variantPending": False}}


def tally(results):
    codes, ids = {}, set()
    for c, j in results:
        codes[c] = codes.get(c, 0) + 1
        if j.get("id"):
            ids.add(j["id"])
    return codes, ids


def scenario_same_key(post_fn, mk_fn, n, tag):
    """同一幂等键 N 并发 → 应只产生 1 条。email 每次不同以绕开 email 限流。"""
    s = str(int(time.time()))[-6:]
    key = hashlib.sha256(f"{tag}-{s}".encode()).hexdigest()
    with ThreadPoolExecutor(max_workers=n) as ex:
        res = list(ex.map(lambda i: post_fn(mk_fn(key, f"{tag}-{s}-{i}@example.com")), range(n)))
    codes, ids = tally(res)
    rows = sql(f"SELECT COUNT(*) FROM wp_fh_inquiry_key WHERE idempotency_key='{key}'")
    print(f"[同一幂等键 × {n} 并发]")
    print(f"  状态码 {codes}")
    print(f"  返回的不同询盘号 {len(ids)}: {ids}")
    print(f"  DB 该幂等键行数 = {rows}  →  {'✅ 幂等成立' if rows == '1' else '❌ 复查'}")


def scenario_many_keys(post_fn, mk_fn, n, tag, same_email=False):
    """N 个不同幂等键并发 → 测吞吐与是否串号。"""
    s = str(int(time.time()))[-6:]
    def one(i):
        email = f"{tag}-{s}@example.com" if same_email else f"{tag}-{s}-{i}@example.com"
        return post_fn(mk_fn(hashlib.sha256(f"{tag}-{s}-{i}".encode()).hexdigest(), email))
    with ThreadPoolExecutor(max_workers=n) as ex:
        res = list(ex.map(one, range(n)))
    codes, ids = tally(res)
    print(f"[不同密钥 × {n} 并发{'(同 email)' if same_email else '(各 email)'}]")
    print(f"  状态码 {codes}   不同询盘号 {len(ids)}")


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "api"
    if mode == "api":
        scenario_same_key(api_post, mk_api, 15, "probeA")
    elif mode == "wp":
        scenario_same_key(wp_post, mk_wp, 20, "probeW")
    elif mode == "db":
        print("inquiry key 总行数 =", sql("SELECT COUNT(*) FROM wp_fh_inquiry_key"))
        print("outbox 按状态 =", sql(
            "SELECT status, COUNT(*) FROM wp_fh_inquiry_outbox GROUP BY status"))
        print("outbox 失败原因 top3 =", sql(
            "SELECT LEFT(last_error,50), COUNT(*) FROM wp_fh_inquiry_outbox "
            "WHERE status='failed' GROUP BY LEFT(last_error,50) ORDER BY 2 DESC LIMIT 3"))
    else:
        print(__doc__)


if __name__ == "__main__":
    main()
