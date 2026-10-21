#!/usr/bin/env python3
"""验收原生 WordPress Page 的内容、SEO、发布门槛与预览契约。"""

from __future__ import annotations

import json
import subprocess
import sys

CONTAINER = "fh-wp"


def wordpress_php(code: str) -> str:
    result = subprocess.run(
        ["docker", "exec", CONTAINER, "php", "-d", "display_errors=1", "-r", code],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or result.stdout.strip())
    return result.stdout.strip()


def main() -> int:
    source = r'''
require "/var/www/html/wp-load.php";
$original = get_option(FH_PAGE_OPTION_AUTHORITATIVE, null);
$ids = [];
try {
  update_option(FH_PAGE_OPTION_AUTHORITATIVE, "1");
  wp_set_current_user(1);
  $records = [
    ["key" => "about", "status" => "publish", "publication" => "approved", "menu_order" => -100],
    ["key" => "capabilities", "status" => "draft", "publication" => "draft", "menu_order" => -101],
  ];
  foreach ($records as $record) {
    $id = wp_insert_post([
      "post_type" => "page",
      "post_title" => "__FH_NATIVE_PAGE_VERIFY_" . strtoupper($record["key"]) . "__",
      "post_name" => "fh-native-page-verify-" . $record["key"],
      "post_status" => $record["status"],
      "menu_order" => $record["menu_order"],
    ]);
    if (is_wp_error($id)) throw new Exception($id->get_error_message());
    $ids[] = $id;
    $_POST = [
      "fh_pages_nonce" => wp_create_nonce("fh_pages_save"),
      "fh_page_key" => $record["key"],
      "fh_publication_status" => $record["publication"],
      "fh_content_json" => wp_json_encode(["slug" => $record["key"], "probe" => true], JSON_UNESCAPED_UNICODE),
      "fh_content_by_locale_json" => wp_json_encode(["zh" => ["slug" => $record["key"], "locale" => "zh"]], JSON_UNESCAPED_UNICODE),
      "fh_seo_title" => "原生页面验收标题",
      "fh_seo_description" => "原生页面验收描述。",
      "fh_seo_by_locale_json" => wp_json_encode(["zh" => ["title" => "中文验收标题", "description" => "中文验收描述"]], JSON_UNESCAPED_UNICODE),
      "fh_locale_status_json" => wp_json_encode(["zh" => "approved"], JSON_UNESCAPED_UNICODE),
      "fh_featured_media_id" => "0",
    ];
    do_action("save_post_page", $id, get_post($id));
    $_POST = [];
  }

  $publicRequest = new WP_REST_Request("GET", "/fh/v1/pages");
  $publicRequest->set_param("key", "about");
  $public = rest_do_request($publicRequest);
  $publicData = $public->get_data();

  $draftRequest = new WP_REST_Request("GET", "/fh/v1/pages");
  $draftRequest->set_param("key", "capabilities");
  $draft = rest_do_request($draftRequest);
  $draftData = $draft->get_data();

  $previewRequest = new WP_REST_Request("GET", "/fh/v1/pages");
  $previewRequest->set_param("key", "capabilities");
  $previewRequest->set_param("preview", true);
  $preview = rest_do_request($previewRequest);
  $previewData = $preview->get_data();

  $quotePublicRequest = new WP_REST_Request("GET", "/fh/v1/pages");
  $quotePublicRequest->set_param("key", "request-a-quote");
  $quotePublic = rest_do_request($quotePublicRequest);
  $quotePublicData = $quotePublic->get_data();
  $quotePreviewRequest = new WP_REST_Request("GET", "/fh/v1/pages");
  $quotePreviewRequest->set_param("key", "request-a-quote");
  $quotePreviewRequest->set_param("preview", true);
  $quotePreview = rest_do_request($quotePreviewRequest);
  $quotePreviewData = $quotePreview->get_data();
  $privacyRequest = new WP_REST_Request("GET", "/fh/v1/pages");
  $privacyRequest->set_param("key", "privacy");
  $privacy = rest_do_request($privacyRequest);
  $privacyData = $privacy->get_data();

  ob_start();
  fh_pages_render_meta_box(get_post($ids[0]));
  $editorHtml = ob_get_clean();

  echo wp_json_encode([
    "self_check" => fh_pages_self_check(),
    "public_status" => $public->get_status(),
    "public_authoritative" => $publicData["authoritative"] ?? false,
    "public_count" => count($publicData["items"] ?? []),
    "public_content" => $publicData["items"][0]["page"]["content"] ?? null,
    "public_seo_title" => $publicData["items"][0]["page"]["seo_title"] ?? null,
    "draft_status" => $draft->get_status(),
    "draft_probe_public" => count(array_filter($draftData["items"] ?? [], static fn($item): bool => ($item["page"]["content"]["probe"] ?? false) === true)),
    "preview_status" => $preview->get_status(),
    "preview_probe_count" => count(array_filter($previewData["items"] ?? [], static fn($item): bool => ($item["page"]["content"]["probe"] ?? false) === true)),
    "quote_public_count" => count($quotePublicData["items"] ?? []),
    "quote_preview_count" => count($quotePreviewData["items"] ?? []),
    "privacy_public_count" => count($privacyData["items"] ?? []),
    "editor_rendered" => str_contains($editorHtml, "fh_content_json") && str_contains($editorHtml, "fh_content_by_locale_json") && str_contains($editorHtml, "fh_locale_status_json") && str_contains($editorHtml, "fh_publication_status"),
  ], JSON_UNESCAPED_UNICODE);
} finally {
  foreach ($ids as $id) wp_delete_post($id, true);
  if ($original === null) delete_option(FH_PAGE_OPTION_AUTHORITATIVE);
  else update_option(FH_PAGE_OPTION_AUTHORITATIVE, $original);
}
'''
    try:
        data = json.loads(wordpress_php(source))
    except (RuntimeError, json.JSONDecodeError) as error:
        print(f"❌ 原生 Page 验收无法完成：{error}", file=sys.stderr)
        return 1

    checks = {
        "原生 Page 类型存在": data["self_check"]["native_page_registered"] is True,
        "页面权威开关已生效": data["self_check"]["authoritative"] is True,
        "已批准 Page 可公开读取": data["public_status"] == 200 and data["public_authoritative"] is True,
        "结构化页面内容可读取": data["public_content"] == {"slug": "about", "probe": True},
        "页面 SEO 标题可读取": data["public_seo_title"] == "原生页面验收标题",
        "草稿 Page 不进入公开接口": data["draft_status"] == 200 and data["draft_probe_public"] == 0,
        "草稿 Page 可授权预览": data["preview_status"] == 200 and data["preview_probe_count"] == 1,
        "询盘 Page 草稿不公开": data["quote_public_count"] == 0,
        "询盘 Page 草稿可预览": data["quote_preview_count"] == 1,
        "隐私 Page 未确认版本时不公开": data["privacy_public_count"] == 0,
        "原生 Page 编辑器字段已挂载": data["editor_rendered"] is True,
    }
    for label, passed in checks.items():
        print(f"{'✅' if passed else '❌'} {label}")
    print("✅ 临时 Page 已清理，权威开关已恢复")
    return 0 if all(checks.values()) else 1


if __name__ == "__main__":
    raise SystemExit(main())
