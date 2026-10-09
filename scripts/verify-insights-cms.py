#!/usr/bin/env python3
"""安全验收 Insights WordPress 契约；只创建并清理带探针标记的临时文章。"""

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
$original = get_option(FH_GUIDE_OPTION_AUTHORITATIVE, null);
$ids = [];
$fields = [
  "fh_summary" => "CMS contract probe summary.",
  "fh_category" => "Fitment",
  "fh_reading_time" => "2 min read",
  "fh_answer" => "CMS contract probe answer.",
  "fh_detail_json" => wp_json_encode([["heading"=>"Quick", "paragraphs"=>["Probe paragraph."]]]),
  "fh_sections_json" => wp_json_encode([["heading"=>"Detail", "body"=>["Probe body."]]]),
];
try {
  update_option(FH_GUIDE_OPTION_AUTHORITATIVE, "1");
  wp_set_current_user(1);
  foreach (["approved"=>"publish", "withdrawn"=>"draft"] as $editor_status => $wp_status) {
    $id = wp_insert_post([
      "post_type"=>FH_GUIDE_POST_TYPE,
      "post_title"=>"__FH_GUIDE_VERIFY_" . strtoupper($editor_status) . "__",
      "post_name"=>"fh-guide-verify-" . $editor_status,
      "post_status"=>$wp_status,
    ]);
    if (is_wp_error($id)) throw new Exception($id->get_error_message());
    $ids[] = $id;
    foreach ($fields as $key=>$value) update_post_meta($id, $key, $value);
    update_post_meta($id, "fh_publication_status", $editor_status);
  }

  $existing = get_posts(["post_type"=>FH_GUIDE_POST_TYPE, "post_status"=>"publish", "posts_per_page"=>1, "meta_key"=>"fh_featured_media_id"]);
  $media_id = $existing ? absint(get_post_meta($existing[0]->ID, "fh_featured_media_id", true)) : 0;
  $_POST = [
    "fh_guide_nonce"=>wp_create_nonce("fh_guide_save"),
    "fh_publication_status"=>"approved",
    "fh_summary"=>"Structured editor summary.",
    "fh_category"=>"Fitment",
    "fh_reading_time"=>"3 min read",
    "fh_answer"=>"Structured editor answer.",
    "fh_detail_json"=>wp_json_encode([["heading"=>"Quick", "paragraphs"=>["First paragraph.", "Second paragraph."]]]),
    "fh_sections_json"=>wp_json_encode([["heading"=>"Details", "body"=>["Structured body."]]]),
    "fh_seo_title"=>"Structured guide test",
    "fh_seo_description"=>"Structured guide SEO description.",
    "fh_featured_media_id"=>(string) $media_id,
  ];
  do_action("save_post_" . FH_GUIDE_POST_TYPE, $ids[0], get_post($ids[0]));
  $_POST = [];

  ob_start();
  fh_guide_authoring_render_meta_box(get_post($ids[0]));
  $editor_html = ob_get_clean();

  $public = rest_do_request(new WP_REST_Request("GET", "/fh/v1/guides"));
  $preview_request = new WP_REST_Request("GET", "/fh/v1/guides");
  $preview_request->set_param("preview", true);
  $preview = rest_do_request($preview_request);
  $public_data = $public->get_data();
  $preview_data = $preview->get_data();
  $public_slugs = array_column($public_data["items"], "slug");
  $preview_slugs = array_column($preview_data["items"], "slug");
  echo wp_json_encode([
    "self_check"=>fh_guide_self_check(),
    "public_status"=>$public->get_status(),
    "preview_status"=>$preview->get_status(),
    "approved_public"=>in_array("fh-guide-verify-approved", $public_slugs, true),
    "withdrawn_public"=>in_array("fh-guide-verify-withdrawn", $public_slugs, true),
    "withdrawn_preview"=>in_array("fh-guide-verify-withdrawn", $preview_slugs, true),
    "structured_detail"=>json_decode((string) get_post_meta($ids[0], "fh_detail_json", true), true),
    "structured_sections"=>json_decode((string) get_post_meta($ids[0], "fh_sections_json", true), true),
    "media_saved"=>$media_id > 0 && absint(get_post_meta($ids[0], "fh_featured_media_id", true)) === $media_id,
    "structured_editor_rendered"=>str_contains($editor_html, "fh-guide-section-blocks") && str_contains($editor_html, "从媒体库选择"),
  ], JSON_UNESCAPED_UNICODE);
} finally {
  foreach ($ids as $id) wp_delete_post($id, true);
  if ($original === null) delete_option(FH_GUIDE_OPTION_AUTHORITATIVE);
  else update_option(FH_GUIDE_OPTION_AUTHORITATIVE, $original);
}
'''
    try:
        data = json.loads(wordpress_php(source))
    except (RuntimeError, json.JSONDecodeError) as error:
        print(f"❌ Insights CMS 验收无法完成：{error}", file=sys.stderr)
        return 1

    checks = {
        "文章类型已注册": data["self_check"]["registered"] is True,
        "REST base 正确": data["self_check"]["rest_base"] == "fh-guides",
        "公开接口可读": data["public_status"] == 200,
        "授权预览接口可读": data["preview_status"] == 200,
        "已批准文章公开": data["approved_public"] is True,
        "撤回文章不公开": data["withdrawn_public"] is False,
        "撤回文章可预览": data["withdrawn_preview"] is True,
        "结构化短版字段可保存": data["structured_detail"] == [{"heading": "Quick", "paragraphs": ["First paragraph.", "Second paragraph."]}],
        "结构化正文分段可保存": data["structured_sections"] == [{"heading": "Details", "body": ["Structured body."]}],
        "媒体库图片字段可保存": data["media_saved"] is True,
        "结构化编辑器已替换原始 JSON 界面": data["structured_editor_rendered"] is True,
    }
    for label, passed in checks.items():
        print(f"{'✅' if passed else '❌'} {label}")
    print("✅ 临时文章已清理，权威开关已恢复")
    return 0 if all(checks.values()) else 1


if __name__ == "__main__":
    raise SystemExit(main())
