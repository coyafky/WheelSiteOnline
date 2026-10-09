#!/usr/bin/env python3
"""验收 WordPress 轮毂编辑、公开契约、Next 缓存刷新与 FH-002 生命周期。

脚本只创建带 ``__FH_VERIFY__`` 标记的临时产品和媒体，结束时无论成功失败都会清理，
并恢复缓存刷新配置。它要求本地 WordPress 容器与 WP_MODE=live 的 Next 开发服务已启动。
"""

from __future__ import annotations

import base64
import json
import subprocess
import sys
import time
import urllib.error
import urllib.request
from typing import Callable

CONTAINER = "fh-wp"
NEXT_ORIGIN = "http://127.0.0.1:3010"
WP_WHEELS_URL = "http://127.0.0.1:8081/wp-json/fh/v1/wheels"
REVALIDATE_URL = "http://host.docker.internal:3010/api/revalidate/wordpress"
REVALIDATE_SECRET = "fh-local-revalidate-20261009"


def wordpress_php(code: str) -> dict[str, object]:
    result = subprocess.run(
        ["docker", "exec", CONTAINER, "php", "-d", "display_errors=1", "-r", code],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or result.stdout.strip())
    try:
        return json.loads(result.stdout.strip())
    except json.JSONDecodeError as error:
        raise RuntimeError(f"WordPress 返回了非 JSON 输出：{result.stdout.strip()}") from error


def http_get(url: str) -> tuple[int, str]:
    try:
        with urllib.request.urlopen(url, timeout=12) as response:
            return response.status, response.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as error:
        return error.code, error.read().decode("utf-8", errors="replace")


def public_wheel() -> dict[str, object] | None:
    status, body = http_get(WP_WHEELS_URL)
    if status != 200:
        raise RuntimeError(f"轮毂公开 API 返回 {status}")
    payload = json.loads(body)
    return next((item for item in payload["items"] if item["slug"] == "fh-002"), None)


def wait_until(label: str, predicate: Callable[[], bool], timeout: float = 12) -> None:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if predicate():
            print(f"✅ {label}")
            return
        time.sleep(0.4)
    raise AssertionError(label)


def setup_probe() -> dict[str, object]:
    return wordpress_php(
        r'''
require "/var/www/html/wp-load.php";
$source = "/tmp/fh-wheel-media-20261009/18-ff107.webp";
if (!is_file($source)) throw new Exception("缺少验收图片");
$original = [
  "url" => get_option(FH_CONTENT_REVALIDATE_URL_OPTION, null),
  "secret" => get_option(FH_CONTENT_REVALIDATE_SECRET_OPTION, null),
];
update_option(FH_CONTENT_REVALIDATE_URL_OPTION, "http://host.docker.internal:3010/api/revalidate/wordpress");
update_option(FH_CONTENT_REVALIDATE_SECRET_OPTION, "fh-local-revalidate-20261009");

$upload = wp_upload_bits("__fh_verify_fh002.webp", null, file_get_contents($source));
if (!empty($upload["error"])) throw new Exception($upload["error"]);
$attachment = wp_insert_attachment([
  "post_mime_type" => "image/webp",
  "post_title" => "__FH_VERIFY__ FH-002",
  "post_excerpt" => "Temporary authoring verification image.",
  "post_status" => "inherit",
], $upload["file"]);
if (is_wp_error($attachment)) throw new Exception($attachment->get_error_message());
require_once ABSPATH . "wp-admin/includes/image.php";
wp_update_attachment_metadata($attachment, wp_generate_attachment_metadata($attachment, $upload["file"]));
update_post_meta($attachment, "_wp_attachment_image_alt", "FH-002 temporary verification wheel");

$post = wp_insert_post([
  "post_type" => "wheel_model",
  "post_title" => "FH-002",
  "post_name" => "fh-002",
  "post_status" => "draft",
]);
if (is_wp_error($post)) throw new Exception($post->get_error_message());
$variants = [
  ["production_code"=>"FH002-1885-5112", "diameter"=>18, "width"=>8.5, "pcd"=>"5*112", "offset"=>35, "center_bore"=>66.6, "finish"=>"Satin black", "approved"=>true],
  ["production_code"=>"FH002-1990-51143", "diameter"=>19, "width"=>9, "pcd"=>"5*114.3", "offset"=>38, "center_bore"=>73.1, "finish"=>"Brushed clear", "approved"=>true],
];
$meta = [
  "public_slug"=>"fh-002", "display_model"=>"FH-002", "publication_status"=>"approved",
  "image_rights_status"=>"approved", "supply_status"=>"confirmed", "specification_status"=>"verified",
  "approved_process"=>"锻造", "approved_variant_keys"=>"FH002-1885-5112,FH002-1990-51143",
  "variants_json"=>wp_json_encode($variants, JSON_UNESCAPED_UNICODE),
  "gallery_media_ids"=>(string) $attachment, "hero_image_id"=>(string) $attachment,
];
foreach ($meta as $key=>$value) update_post_meta($post, $key, $value);
do_action("save_post_wheel_model", $post, get_post($post));
echo wp_json_encode(["post"=>$post, "attachment"=>$attachment, "original"=>$original], JSON_UNESCAPED_UNICODE);
'''
    )


def transition(post_id: int, action: str) -> None:
    if action == "publish":
        code = f'''require "/var/www/html/wp-load.php"; wp_update_post(["ID"=>{post_id},"post_status"=>"publish"]); do_action("save_post_wheel_model", {post_id}, get_post({post_id})); echo wp_json_encode(["ok"=>true]);'''
    elif action == "modify":
        code = f'''require "/var/www/html/wp-load.php"; $variants=json_decode((string)get_post_meta({post_id}, "variants_json", true), true); $variants[0]["diameter"]=21; update_post_meta({post_id}, "variants_json", wp_json_encode($variants, JSON_UNESCAPED_UNICODE)); do_action("save_post_wheel_model", {post_id}, get_post({post_id})); echo wp_json_encode(["ok"=>true]);'''
    elif action == "withdraw":
        code = f'''require "/var/www/html/wp-load.php"; update_post_meta({post_id}, "publication_status", "withdrawn"); do_action("save_post_wheel_model", {post_id}, get_post({post_id})); echo wp_json_encode(["ok"=>true]);'''
    else:
        raise ValueError(action)
    wordpress_php(code)


def cleanup_probe(state: dict[str, object]) -> None:
    encoded = base64.b64encode(json.dumps(state, ensure_ascii=False).encode()).decode()
    result = wordpress_php(
        f'''
require "/var/www/html/wp-load.php";
$state = json_decode(base64_decode("{encoded}"), true);
if (!empty($state["post"])) wp_delete_post((int) $state["post"], true);
if (!empty($state["attachment"])) wp_delete_attachment((int) $state["attachment"], true);
foreach (["url"=>FH_CONTENT_REVALIDATE_URL_OPTION,"secret"=>FH_CONTENT_REVALIDATE_SECRET_OPTION] as $key=>$option) {{
  if ($state["original"][$key] === null) delete_option($option);
  else update_option($option, $state["original"][$key]);
}}
echo wp_json_encode([
  "post_deleted"=>get_post((int) $state["post"]) === null,
  "attachment_deleted"=>get_post((int) $state["attachment"]) === null,
]);
'''
    )
    if result.get("post_deleted") is not True or result.get("attachment_deleted") is not True:
        raise RuntimeError("临时产品或媒体未成功删除")


def main() -> int:
    state: dict[str, object] | None = None
    try:
        # 先把目录和 sitemap 缓存热起来；后续能看到变化才证明保存 webhook 生效。
        http_get(f"{NEXT_ORIGIN}/products/wheels?q=FH-002")
        http_get(f"{NEXT_ORIGIN}/sitemap.xml")
        state = setup_probe()
        assert public_wheel() is None
        assert http_get(f"{NEXT_ORIGIN}/products/wheels/fh-002")[0] == 404
        print("✅ 草稿不进入公开 API 和详情页")

        post_id = int(state["post"])
        transition(post_id, "publish")
        wait_until("批准后进入 WordPress 公开 API", lambda: public_wheel() is not None)
        wait_until("保存 webhook 刷新目录缓存", lambda: 'href="/products/wheels/fh-002"' in http_get(f"{NEXT_ORIGIN}/products/wheels?q=FH-002")[1])
        wait_until("批准后详情页可访问", lambda: http_get(f"{NEXT_ORIGIN}/products/wheels/fh-002")[0] == 200)
        wait_until("批准后进入规格筛选", lambda: 'href="/products/wheels/fh-002"' in http_get(f"{NEXT_ORIGIN}/products/wheels?diameter=18&pcd=5x112")[1])
        wait_until("批准后进入 sitemap", lambda: "/products/wheels/fh-002" in http_get(f"{NEXT_ORIGIN}/sitemap.xml")[1])
        record = public_wheel()
        assert record is not None and len(record["wheel"]["variants"]) == 2
        assert len(record["wheel"]["images"]) == 1
        print("✅ 两条规格与媒体库图片完整映射")

        transition(post_id, "modify")
        wait_until("修改后公开 API 更新", lambda: (public_wheel() or {}).get("wheel", {}).get("variants", [{}])[0].get("diameter") == 21)
        wait_until("修改后页面缓存刷新", lambda: 'href="/products/wheels/fh-002"' in http_get(f"{NEXT_ORIGIN}/products/wheels?diameter=21&pcd=5x112")[1])

        transition(post_id, "withdraw")
        wait_until("撤回后公开 API 隐藏", lambda: public_wheel() is None)
        wait_until("撤回后目录与详情页消失", lambda: 'href="/products/wheels/fh-002"' not in http_get(f"{NEXT_ORIGIN}/products/wheels?q=FH-002")[1] and http_get(f"{NEXT_ORIGIN}/products/wheels/fh-002")[0] == 404)
        wait_until("撤回后 sitemap 消失", lambda: "/products/wheels/fh-002" not in http_get(f"{NEXT_ORIGIN}/sitemap.xml")[1])
        return 0
    except (AssertionError, KeyError, RuntimeError, ValueError, urllib.error.URLError) as error:
        print(f"❌ FH-002 全链路验收失败：{error}", file=sys.stderr)
        return 1
    finally:
        if state is not None:
            try:
                cleanup_probe(state)
                print("✅ 临时 FH-002、临时媒体与本地 webhook 配置已清理")
            except RuntimeError as error:
                print(f"❌ 临时数据清理失败：{error}", file=sys.stderr)


if __name__ == "__main__":
    raise SystemExit(main())
