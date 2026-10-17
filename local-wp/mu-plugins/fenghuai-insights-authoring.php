<?php
/**
 * Plugin Name:       Fenghuai Insights — 结构化编辑与媒体
 * Description:       用可增删排序的段落编辑器替代原始 JSON，并为每篇 Insights 文章关联批准图片。
 * Version:           0.1.0
 * Requires at least: 6.5
 * Requires PHP:      8.1
 * Author:            Fenghuai Tech
 */

if (!defined('ABSPATH')) {
    exit;
}

const FH_GUIDE_AUTHORING_POST_TYPE = 'fh_guide';
const FH_GUIDE_AUTHORING_NATIVE_POST_TYPE = 'post';

const FH_GUIDE_ACF_GROUP_KEY = 'group_fh_insights_structured';

/** @return string[] */
function fh_guide_acf_field_names(): array
{
    if (!function_exists('acf_get_fields') || !function_exists('acf_get_local_field_group')) return [];
    $group = acf_get_local_field_group(FH_GUIDE_ACF_GROUP_KEY);
    if (!is_array($group)) return [];
    $fields = acf_get_fields($group);
    if (!is_array($fields)) return [];
    return array_values(array_filter(array_map(
        static fn($field): ?string => is_array($field) && isset($field['name']) ? (string) $field['name'] : null,
        $fields
    )));
}

function fh_guide_acf_group_registered(): bool
{
    return function_exists('acf_get_local_field_group')
        && is_array(acf_get_local_field_group(FH_GUIDE_ACF_GROUP_KEY));
}

function fh_guide_acf_group_post_only(): bool
{
    if (!fh_guide_acf_group_registered()) return false;
    $group = acf_get_local_field_group(FH_GUIDE_ACF_GROUP_KEY);
    $locations = $group['location'] ?? [];
    foreach ($locations as $ruleGroup) {
        foreach ($ruleGroup as $rule) {
            if (($rule['param'] ?? '') === 'post_type'
                && ($rule['operator'] ?? '') === '=='
                && ($rule['value'] ?? '') === FH_GUIDE_AUTHORING_NATIVE_POST_TYPE) {
                return true;
            }
        }
    }
    return false;
}

function fh_guide_acf_repeater_available(): bool
{
    return function_exists('acf_get_field_type') && is_object(acf_get_field_type('repeater'));
}

/** @return array<int,array<string,mixed>> */
function fh_guide_acf_repeater_fields(): array
{
    return [
        [
            'key' => 'field_fh_detail', 'label' => '列表页短版', 'name' => 'fh_detail', 'type' => 'repeater', 'layout' => 'block', 'button_label' => '新增短版段落',
            'sub_fields' => [
                ['key' => 'field_fh_detail_heading', 'label' => '小标题', 'name' => 'heading', 'type' => 'text'],
                [
                    'key' => 'field_fh_detail_paragraphs', 'label' => '段落', 'name' => 'paragraphs', 'type' => 'repeater', 'layout' => 'table', 'button_label' => '新增段落',
                    'sub_fields' => [['key' => 'field_fh_detail_paragraph', 'label' => '段落内容', 'name' => 'paragraph', 'type' => 'textarea', 'rows' => 3],],
                ],
            ],
        ],
        [
            'key' => 'field_fh_sections', 'label' => '正文分段', 'name' => 'fh_sections', 'type' => 'repeater', 'layout' => 'block', 'button_label' => '新增正文分段',
            'sub_fields' => [
                ['key' => 'field_fh_sections_heading', 'label' => '小标题', 'name' => 'heading', 'type' => 'text'],
                [
                    'key' => 'field_fh_sections_body', 'label' => '段落', 'name' => 'body', 'type' => 'repeater', 'layout' => 'table', 'button_label' => '新增段落',
                    'sub_fields' => [['key' => 'field_fh_sections_paragraph', 'label' => '段落内容', 'name' => 'paragraph', 'type' => 'textarea', 'rows' => 3],],
                ],
            ],
        ],
    ];
}

add_action('acf/init', 'fh_guide_authoring_register_acf_fields');
function fh_guide_authoring_register_acf_fields(): void
{
    if (!function_exists('acf_add_local_field_group')) return;

    $fields = [
        ['key' => 'field_fh_publication_status', 'label' => '编辑发布状态', 'name' => 'fh_publication_status', 'type' => 'select', 'choices' => ['draft' => '草稿 / 待审', 'approved' => '已批准', 'withdrawn' => '已撤回'], 'default_value' => 'draft', 'return_format' => 'value'],
        ['key' => 'field_fh_summary', 'label' => '摘要', 'name' => 'fh_summary', 'type' => 'textarea', 'rows' => 3],
        ['key' => 'field_fh_category', 'label' => '分类', 'name' => 'fh_category', 'type' => 'text'],
        ['key' => 'field_fh_reading_time', 'label' => '阅读时长', 'name' => 'fh_reading_time', 'type' => 'text'],
        ['key' => 'field_fh_answer', 'label' => '直接回答', 'name' => 'fh_answer', 'type' => 'textarea', 'rows' => 3],
        // Defaults to 1 (needs verification). Unverified figures must never be
        // published as fact by default; an editor has to actively clear this.
        ['key' => 'field_fh_needs_verification', 'label' => '需要工程确认', 'name' => 'fh_needs_verification', 'type' => 'true_false', 'ui' => 1, 'default_value' => 1],
        ['key' => 'field_fh_seo_title', 'label' => 'SEO 标题', 'name' => 'fh_seo_title', 'type' => 'text'],
        ['key' => 'field_fh_seo_description', 'label' => 'SEO 描述', 'name' => 'fh_seo_description', 'type' => 'textarea', 'rows' => 3],
        ['key' => 'field_fh_featured_media_id', 'label' => '文章图片', 'name' => 'fh_featured_media_id', 'type' => 'image', 'return_format' => 'id', 'preview_size' => 'medium', 'library' => 'all'],
    ];
    if (fh_guide_acf_repeater_available()) {
        $fields = array_merge($fields, fh_guide_acf_repeater_fields());
    }

    acf_add_local_field_group([
        'key' => FH_GUIDE_ACF_GROUP_KEY,
        'title' => 'Insights 结构化文章字段',
        'fields' => $fields,
        'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => FH_GUIDE_AUTHORING_NATIVE_POST_TYPE]]],
        'position' => 'normal',
        'style' => 'default',
        'active' => true,
        'show_in_rest' => 0,
    ]);
}

add_action('init', 'fh_guide_authoring_register_meta', 20);
function fh_guide_authoring_register_meta(): void
{
    // Legacy fh_guide metadata remains readable during migration, but only the
    // native Post editor owns this authoring field going forward.
    foreach ([FH_GUIDE_AUTHORING_NATIVE_POST_TYPE] as $postType) {
        register_post_meta($postType, 'fh_featured_media_id', [
            'type' => 'integer',
            'single' => true,
            'default' => 0,
            'show_in_rest' => false,
            'auth_callback' => static fn(): bool => current_user_can('edit_posts'),
            'sanitize_callback' => static fn($value): int => absint($value),
        ]);
    }
}

add_action('add_meta_boxes_' . FH_GUIDE_AUTHORING_NATIVE_POST_TYPE, 'fh_guide_authoring_replace_meta_box', 50);
function fh_guide_authoring_replace_meta_box(): void
{
    $screen = get_current_screen();
    if (!$screen || $screen->post_type !== FH_GUIDE_AUTHORING_NATIVE_POST_TYPE) return;
    remove_meta_box('fh-guide-fields', $screen->post_type, 'normal');
    // ACF Free can render scalar fields but has no Repeater UI; keep the
    // project editor visible until ACF Pro (or an equivalent repeater field)
    // is actually available.
    if (fh_guide_acf_group_registered() && fh_guide_acf_repeater_available()) return;
    add_meta_box(
        'fh-guide-structured-fields',
        'Insights 结构化文章字段',
        'fh_guide_authoring_render_meta_box',
        $screen->post_type,
        'normal',
        'high'
    );
}

/** @return array<int,array<string,mixed>> */
function fh_guide_authoring_json_rows(int $postId, string $key): array
{
    $decoded = json_decode((string) get_post_meta($postId, $key, true), true);
    return is_array($decoded) ? array_values($decoded) : [];
}

function fh_guide_authoring_render_meta_box(WP_Post $post): void
{
    wp_enqueue_media();
    wp_nonce_field('fh_guide_save', 'fh_guide_nonce');
    $status = (string) get_post_meta($post->ID, 'fh_publication_status', true);
    $detail = fh_guide_authoring_json_rows($post->ID, 'fh_detail_json');
    $sections = fh_guide_authoring_json_rows($post->ID, 'fh_sections_json');
    $mediaId = absint(get_post_meta($post->ID, 'fh_featured_media_id', true));
    $mediaSrc = $mediaId ? wp_get_attachment_image_url($mediaId, 'medium') : false;
    ?>
    <style>
      .fh-guide-grid{display:grid;grid-template-columns:180px minmax(0,1fr);gap:12px 18px;max-width:980px;align-items:start}
      .fh-guide-grid>label{font-weight:600;padding-top:8px}.fh-guide-grid input[type=text],.fh-guide-grid textarea,.fh-guide-grid select{width:100%}
      .fh-guide-blocks{display:grid;gap:12px;margin:10px 0}.fh-guide-block{padding:14px;border:1px solid #c3c4c7;background:#f6f7f7}
      .fh-guide-block textarea{min-height:110px}.fh-guide-actions{display:flex;gap:10px;margin-top:8px}.fh-guide-media img{display:block;max-width:320px;max-height:220px;object-fit:cover;margin:10px 0;background:#f6f7f7}
      .fh-guide-help{color:#646970;font-size:12px}
    </style>
    <div class="fh-guide-grid">
      <label for="fh_publication_status">编辑发布状态</label>
      <div><select id="fh_publication_status" name="fh_publication_status">
        <?php foreach (['draft' => '草稿 / 待审', 'approved' => '已批准', 'withdrawn' => '已撤回'] as $value => $label) : ?>
          <option value="<?php echo esc_attr($value); ?>" <?php selected($status ?: 'draft', $value); ?>><?php echo esc_html($label); ?></option>
        <?php endforeach; ?>
      </select><p class="fh-guide-help">WordPress 状态为“已发布”且这里为“已批准”时，文章才会公开。</p></div>

      <?php foreach ([
        'summary' => ['摘要', 'textarea'],
        'category' => ['分类', 'text'],
        'reading_time' => ['阅读时长', 'text'],
        'answer' => ['直接回答', 'textarea'],
        'seo_title' => ['SEO 标题', 'text'],
        'seo_description' => ['SEO 描述', 'textarea'],
      ] as $key => [$label, $type]) : $name = 'fh_' . $key; $value = (string) get_post_meta($post->ID, $name, true); ?>
        <label for="<?php echo esc_attr($name); ?>"><?php echo esc_html($label); ?></label>
        <div><?php if ($type === 'textarea') : ?><textarea rows="3" id="<?php echo esc_attr($name); ?>" name="<?php echo esc_attr($name); ?>"><?php echo esc_textarea($value); ?></textarea><?php else : ?><input type="text" id="<?php echo esc_attr($name); ?>" name="<?php echo esc_attr($name); ?>" value="<?php echo esc_attr($value); ?>"><?php endif; ?></div>
      <?php endforeach; ?>

      <label for="fh_translations_json">多语言正文 JSON</label>
      <div><textarea rows="8" id="fh_translations_json" name="fh_translations_json"><?php echo esc_textarea((string) get_post_meta($post->ID, 'fh_translations_json', true)); ?></textarea><p class="fh-guide-help">格式：{"zh":{"title":"...","summary":"...","detail":[...],"sections":[...]},"es":{...},"th":{...}}。</p></div>
      <label for="fh_translation_status_json">多语言发布状态 JSON</label>
      <div><textarea rows="3" id="fh_translation_status_json" name="fh_translation_status_json"><?php echo esc_textarea((string) get_post_meta($post->ID, 'fh_translation_status_json', true)); ?></textarea><p class="fh-guide-help">只有 approved 的语言正文会进入公开 REST；draft/withdrawn 只在编辑预览可见。</p></div>

      <label>列表页短版</label>
      <div><div class="fh-guide-blocks" id="fh-guide-detail-blocks" data-array-key="paragraphs"><?php fh_guide_authoring_render_blocks($detail, 'paragraphs'); ?></div><button type="button" class="button fh-guide-add-block" data-target="fh-guide-detail-blocks">新增短版段落</button><input type="hidden" id="fh_detail_json" name="fh_detail_json" value=""></div>

      <label>正文分段</label>
      <div><div class="fh-guide-blocks" id="fh-guide-section-blocks" data-array-key="body"><?php fh_guide_authoring_render_blocks($sections, 'body'); ?></div><button type="button" class="button fh-guide-add-block" data-target="fh-guide-section-blocks">新增正文分段</button><input type="hidden" id="fh_sections_json" name="fh_sections_json" value=""></div>

      <label>文章图片</label>
      <div class="fh-guide-media"><input type="hidden" id="fh_featured_media_id" name="fh_featured_media_id" value="<?php echo esc_attr((string) $mediaId); ?>"><div id="fh-guide-media-preview"><?php if ($mediaSrc) : ?><img src="<?php echo esc_url($mediaSrc); ?>" alt=""><?php endif; ?></div><button type="button" class="button" id="fh-select-guide-media">从媒体库选择</button> <button type="button" class="button-link-delete" id="fh-remove-guide-media">移除</button><p class="fh-guide-help">用于 Insights 列表卡片与文章首屏；请在媒体库填写英文替代文本和说明。</p></div>

      <label>工程确认</label>
      <div><label><input type="checkbox" name="fh_needs_verification" value="1" <?php checked((bool) get_post_meta($post->ID, 'fh_needs_verification', true), true); ?>> 文章包含仍需工程签字的数字或主张</label></div>
    </div>
    <script>
    (() => {
      const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
      const block = (value = {}) => `<div class="fh-guide-block"><label><strong>小标题</strong><input type="text" class="fh-block-heading" value="${esc(value.heading)}"></label><label><strong>段落</strong><textarea class="fh-block-body" placeholder="每个段落之间空一行">${esc((value.lines || []).join('\n\n'))}</textarea></label><div class="fh-guide-actions"><button type="button" class="button-link fh-block-up">上移</button><button type="button" class="button-link fh-block-down">下移</button><button type="button" class="button-link-delete fh-block-remove">删除</button></div></div>`;
      const serialize = (container) => [...container.children].map((node) => ({heading: node.querySelector('.fh-block-heading').value.trim(), [container.dataset.arrayKey]: node.querySelector('.fh-block-body').value.split(/\n\s*\n/).map((line) => line.trim()).filter(Boolean)})).filter((row) => row.heading || row[container.dataset.arrayKey].length);
      const sync = () => {
        const detail = document.querySelector('#fh-guide-detail-blocks');
        const sections = document.querySelector('#fh-guide-section-blocks');
        document.querySelector('#fh_detail_json').value = JSON.stringify(serialize(detail));
        document.querySelector('#fh_sections_json').value = JSON.stringify(serialize(sections));
      };
      document.querySelectorAll('.fh-guide-add-block').forEach((button) => button.addEventListener('click', () => { document.querySelector(`#${button.dataset.target}`).insertAdjacentHTML('beforeend', block()); sync(); }));
      document.querySelectorAll('.fh-guide-blocks').forEach((container) => container.addEventListener('click', (event) => {
        const button = event.target.closest('button'); if (!button) return;
        const node = button.closest('.fh-guide-block'); if (!node) return;
        if (button.classList.contains('fh-block-remove')) node.remove();
        if (button.classList.contains('fh-block-up') && node.previousElementSibling) container.insertBefore(node, node.previousElementSibling);
        if (button.classList.contains('fh-block-down') && node.nextElementSibling) container.insertBefore(node.nextElementSibling, node);
        sync();
      }));
      document.querySelector('form#post')?.addEventListener('submit', sync);
      sync();
      const mediaInput = document.querySelector('#fh_featured_media_id');
      const preview = document.querySelector('#fh-guide-media-preview');
      document.querySelector('#fh-select-guide-media')?.addEventListener('click', () => {
        const frame = wp.media({title:'选择文章图片',button:{text:'使用图片'},multiple:false,library:{type:'image'}});
        frame.on('select', () => { const item = frame.state().get('selection').first().toJSON(); mediaInput.value = item.id; preview.innerHTML = `<img src="${esc(item.sizes?.medium?.url || item.url)}" alt="">`; });
        frame.open();
      });
      document.querySelector('#fh-remove-guide-media')?.addEventListener('click', () => { mediaInput.value = ''; preview.innerHTML = ''; });
    })();
    </script>
    <?php
}

/** @param array<int,array<string,mixed>> $rows */
function fh_guide_authoring_render_blocks(array $rows, string $arrayKey): void
{
    foreach ($rows as $row) {
        $heading = (string) ($row['heading'] ?? '');
        $lines = isset($row[$arrayKey]) && is_array($row[$arrayKey]) ? array_map('strval', $row[$arrayKey]) : [];
        echo '<div class="fh-guide-block"><label><strong>小标题</strong><input type="text" class="fh-block-heading" value="' . esc_attr($heading) . '"></label><label><strong>段落</strong><textarea class="fh-block-body" placeholder="每个段落之间空一行">' . esc_textarea(implode("\n\n", $lines)) . '</textarea></label><div class="fh-guide-actions"><button type="button" class="button-link fh-block-up">上移</button><button type="button" class="button-link fh-block-down">下移</button><button type="button" class="button-link-delete fh-block-remove">删除</button></div></div>';
    }
}

add_action('save_post_' . FH_GUIDE_AUTHORING_NATIVE_POST_TYPE, 'fh_guide_authoring_save_media', 20);
function fh_guide_authoring_save_media(int $postId): void
{
    if (!isset($_POST['fh_guide_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['fh_guide_nonce'])), 'fh_guide_save')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $postId)) return;
    update_post_meta($postId, 'fh_featured_media_id', isset($_POST['fh_featured_media_id']) ? absint($_POST['fh_featured_media_id']) : 0);
}

/** @return array<string,mixed>|null */
function fh_guide_authoring_public_image(int $postId): ?array
{
    $mediaId = absint(get_post_meta($postId, 'fh_featured_media_id', true));
    if ($mediaId <= 0 || !wp_attachment_is_image($mediaId)) return null;
    $src = wp_get_attachment_url($mediaId);
    if (!$src) return null;
    return [
        'id' => $mediaId,
        'src' => $src,
        'alt' => trim((string) get_post_meta($mediaId, '_wp_attachment_image_alt', true)),
        'caption' => trim((string) wp_get_attachment_caption($mediaId)),
    ];
}
