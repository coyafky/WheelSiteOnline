<?php
/**
 * Plugin Name:       Fenghuai Wheels — 规格与媒体运营层
 * Description:       为 wheel_model 提供可视化多规格、媒体库图库和稳定公开 REST 契约。
 * Version:           0.1.0
 * Requires at least: 6.5
 * Requires PHP:      8.1
 * Author:            Fenghuai Tech
 */

if (!defined('ABSPATH')) {
    exit;
}

const FH_WHEEL_OPTION_AUTHORITATIVE = 'fh_wheels_authoritative';
const FH_WHEEL_AUTHORING_POST_TYPE = 'wheel_model';

add_action('init', 'fh_wheel_authoring_register_meta', 20);
function fh_wheel_authoring_register_meta(): void
{
    foreach (['variants_json', 'gallery_media_ids'] as $key) {
        register_post_meta(FH_WHEEL_AUTHORING_POST_TYPE, $key, [
            'type' => 'string',
            'single' => true,
            'default' => '',
            'show_in_rest' => false,
            'auth_callback' => static fn(): bool => current_user_can('edit_posts'),
        ]);
    }
}

/** @return array<int,array<string,mixed>> */
function fh_wheel_authoring_variants(int $postId): array
{
    $raw = (string) get_post_meta($postId, 'variants_json', true);
    if ($raw === '') {
        $raw = (string) get_post_meta($postId, 'fact_variants_json', true);
    }
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        return [];
    }

    $approvedKeys = array_filter(array_map('trim', explode(',', (string) get_post_meta($postId, 'approved_variant_keys', true))));
    return array_values(array_map(static function ($row) use ($approvedKeys): array {
        $size = isset($row['size']) ? (string) $row['size'] : '';
        $diameter = isset($row['diameter']) ? (float) $row['diameter'] : 0.0;
        $width = isset($row['width']) ? (float) $row['width'] : 0.0;
        if (($diameter <= 0 || $width <= 0) && preg_match('/^(\d+(?:\.\d+)?)\s*[x*×]\s*(\d+(?:\.\d+)?)$/i', $size, $match)) {
            $diameter = (float) $match[1];
            $width = (float) $match[2];
        }
        $code = sanitize_text_field((string) ($row['production_code'] ?? $row['productionCode'] ?? ''));
        return [
            'production_code' => $code,
            'diameter' => $diameter,
            'width' => $width,
            'pcd' => sanitize_text_field((string) ($row['pcd'] ?? '')),
            'offset' => is_numeric($row['offset'] ?? null) ? (float) $row['offset'] : '',
            'center_bore' => is_numeric($row['center_bore'] ?? $row['centerBore'] ?? null)
                ? (float) ($row['center_bore'] ?? $row['centerBore']) : '',
            'finish' => sanitize_text_field((string) ($row['finish'] ?? '')),
            'approved' => array_key_exists('approved', $row)
                ? (bool) $row['approved']
                : in_array($code, $approvedKeys, true),
        ];
    }, $decoded));
}

/** @return int[] */
function fh_wheel_authoring_media_ids(int $postId): array
{
    $raw = (string) get_post_meta($postId, 'gallery_media_ids', true);
    $ids = array_values(array_unique(array_filter(array_map('absint', explode(',', $raw)))));
    $legacyHero = absint(get_post_meta($postId, 'hero_media_id', true));
    if ($legacyHero > 0 && !in_array($legacyHero, $ids, true)) {
        array_unshift($ids, $legacyHero);
    }
    return $ids;
}

add_action('add_meta_boxes_' . FH_WHEEL_AUTHORING_POST_TYPE, 'fh_wheel_authoring_add_meta_box', 20);
function fh_wheel_authoring_add_meta_box(): void
{
    add_meta_box(
        'fh-wheel-authoring',
        '产品规格与图片（运营维护）',
        'fh_wheel_authoring_render_meta_box',
        FH_WHEEL_AUTHORING_POST_TYPE,
        'normal',
        'high'
    );
}

function fh_wheel_authoring_render_meta_box(WP_Post $post): void
{
    wp_enqueue_media();
    wp_nonce_field('fh_wheel_authoring_save', 'fh_wheel_authoring_nonce');
    $variants = fh_wheel_authoring_variants($post->ID);
    $mediaIds = fh_wheel_authoring_media_ids($post->ID);
    ?>
    <style>
        .fh-wheel-editor table{border-collapse:collapse;width:100%}.fh-wheel-editor th{font-size:12px;text-align:left}
        .fh-wheel-editor th,.fh-wheel-editor td{padding:6px}.fh-wheel-editor input[type=text],.fh-wheel-editor input[type=number]{width:100%;min-width:72px}
        .fh-wheel-editor .fh-actions{display:flex;gap:4px}.fh-wheel-media{display:flex;flex-wrap:wrap;gap:10px;margin:12px 0}
        .fh-wheel-media li{position:relative;width:120px;padding:8px;border:1px solid #c3c4c7;background:#fff}
        .fh-wheel-media img{display:block;width:104px;height:104px;object-fit:contain;background:#f6f7f7}
        .fh-wheel-media .fh-media-actions{display:flex;justify-content:space-between;margin-top:6px}.fh-wheel-help{color:#646970}
    </style>
    <?php
    // PCD / 宽度的候选值来自后台「轮毂型号 → PCD / 宽度」两个字典页。
    // 这里用 <datalist> 而不是 <select>：既给候选，又保留手输 —— 运营遇到字典里
    // 还没有的新规格时不会被挡住，加完值再去字典页登记即可。
    $pcdOptions   = function_exists('fh_wheel_dictionary_options')
        ? fh_wheel_dictionary_options(FH_WHEEL_TAX_PCD) : [];
    $widthOptions = function_exists('fh_wheel_dictionary_options')
        ? fh_wheel_dictionary_options(FH_WHEEL_TAX_WIDTH) : [];
    ?>
    <div class="fh-wheel-editor">
        <p><strong>型号：</strong>使用页面顶部标题字段填写，例如 <code>FH-002</code>。规格每行必须保持为一个真实组合。</p>
        <datalist id="fh-pcd-options">
            <?php foreach ($pcdOptions as $option) : ?>
                <option value="<?php echo esc_attr($option); ?>"></option>
            <?php endforeach; ?>
        </datalist>
        <datalist id="fh-width-options">
            <?php foreach ($widthOptions as $option) : ?>
                <option value="<?php echo esc_attr($option); ?>"></option>
            <?php endforeach; ?>
        </datalist>
        <table class="widefat striped" id="fh-wheel-variants">
            <thead><tr>
                <th>公开</th><th>SKU / productionCode</th><th>直径</th><th>宽度</th><th>PCD</th><th>ET</th><th>中心孔</th><th>表面处理</th><th>排序</th>
            </tr></thead>
            <tbody>
            <?php foreach ($variants as $index => $variant) : ?>
                <?php fh_wheel_authoring_render_variant_row((int) $index, $variant); ?>
            <?php endforeach; ?>
            </tbody>
        </table>
        <p><button type="button" class="button" id="fh-add-variant">新增规格</button></p>
        <p class="fh-wheel-help">直径与宽度单位为英寸，ET 与中心孔单位为毫米。未勾选“公开”的规格会保留在后台，但不会进入前台。</p>

        <hr>
        <h3>主图与图库</h3>
        <p class="fh-wheel-help">第一张图片是前台主图。可调整顺序；没有有效图片时型号不会公开。</p>
        <input type="hidden" id="fh_gallery_media_ids" name="fh_gallery_media_ids" value="<?php echo esc_attr(implode(',', $mediaIds)); ?>">
        <ul class="fh-wheel-media" id="fh-wheel-media-list">
            <?php foreach ($mediaIds as $mediaId) :
                $src = wp_get_attachment_image_url($mediaId, 'thumbnail');
                if (!$src) continue; ?>
                <li data-id="<?php echo esc_attr((string) $mediaId); ?>">
                    <img src="<?php echo esc_url($src); ?>" alt="">
                    <div class="fh-media-actions"><button type="button" class="button-link fh-media-up">↑</button><button type="button" class="button-link-delete fh-media-remove">移除</button></div>
                </li>
            <?php endforeach; ?>
        </ul>
        <button type="button" class="button" id="fh-select-wheel-media">从媒体库选择图片</button>
    </div>
    <script>
    (() => {
      const table = document.querySelector('#fh-wheel-variants tbody');
      const mediaList = document.querySelector('#fh-wheel-media-list');
      const mediaInput = document.querySelector('#fh_gallery_media_ids');
      if (!table || !mediaList || !mediaInput || table.dataset.ready) return;
      table.dataset.ready = '1';
      const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
      const row = (i, value = {}) => `<tr>
        <td><input type="checkbox" name="fh_variants[${i}][approved]" value="1" ${value.approved ? 'checked' : ''}></td>
        <td><input required type="text" name="fh_variants[${i}][production_code]" value="${esc(value.production_code)}"></td>
        <td><input required type="number" min="10" max="26" step="0.1" name="fh_variants[${i}][diameter]" value="${esc(value.diameter)}"></td>
        <td><input required type="number" min="4" max="14" step="0.1" list="fh-width-options" name="fh_variants[${i}][width]" value="${esc(value.width)}"></td>
        <td><input required type="text" list="fh-pcd-options" name="fh_variants[${i}][pcd]" value="${esc(value.pcd)}" placeholder="5x112"></td>
        <td><input required type="number" min="-100" max="100" step="0.1" name="fh_variants[${i}][offset]" value="${esc(value.offset)}"></td>
        <td><input required type="number" min="1" max="250" step="0.1" name="fh_variants[${i}][center_bore]" value="${esc(value.center_bore)}"></td>
        <td><input type="text" name="fh_variants[${i}][finish]" value="${esc(value.finish)}"></td>
        <td><span class="fh-actions"><button type="button" class="button-link fh-row-up">↑</button><button type="button" class="button-link fh-row-down">↓</button><button type="button" class="button-link-delete fh-row-remove">删除</button></span></td>
      </tr>`;
      const renumber = () => [...table.rows].forEach((tr, index) => tr.querySelectorAll('[name]').forEach((el) => el.name = el.name.replace(/fh_variants\[\d+\]/, `fh_variants[${index}]`)));
      document.querySelector('#fh-add-variant')?.addEventListener('click', () => {
        const index = table.rows.length;
        table.insertAdjacentHTML('beforeend', row(index));
        // 加固：长表里刚加的行常在视口之外，插完滚过去并聚焦第一个输入框，
        // 否则点了「新增规格」看起来像没反应。
        const added = table.rows[index];
        if (added) {
          added.scrollIntoView({ block: 'center' });
          added.querySelector('input[type="text"]')?.focus();
        }
      });
      table.addEventListener('click', (event) => {
        const button = event.target.closest('button'); if (!button) return;
        const tr = button.closest('tr'); if (!tr) return;
        if (button.classList.contains('fh-row-remove')) tr.remove();
        if (button.classList.contains('fh-row-up') && tr.previousElementSibling) table.insertBefore(tr, tr.previousElementSibling);
        if (button.classList.contains('fh-row-down') && tr.nextElementSibling) table.insertBefore(tr.nextElementSibling, tr);
        renumber();
      });
      const syncMedia = () => { mediaInput.value = [...mediaList.children].map((li) => li.dataset.id).filter(Boolean).join(','); };
      mediaList.addEventListener('click', (event) => {
        const button = event.target.closest('button'); if (!button) return;
        const li = button.closest('li'); if (!li) return;
        if (button.classList.contains('fh-media-remove')) li.remove();
        if (button.classList.contains('fh-media-up') && li.previousElementSibling) mediaList.insertBefore(li, li.previousElementSibling);
        syncMedia();
      });
      document.querySelector('#fh-select-wheel-media')?.addEventListener('click', () => {
        const frame = wp.media({title:'选择轮毂图片', button:{text:'使用所选图片'}, multiple:true, library:{type:'image'}});
        frame.on('select', () => {
          frame.state().get('selection').each((attachment) => {
            const item = attachment.toJSON();
            if (mediaList.querySelector(`[data-id="${item.id}"]`)) return;
            const src = item.sizes?.thumbnail?.url || item.url;
            mediaList.insertAdjacentHTML('beforeend', `<li data-id="${item.id}"><img src="${esc(src)}" alt=""><div class="fh-media-actions"><button type="button" class="button-link fh-media-up">↑</button><button type="button" class="button-link-delete fh-media-remove">移除</button></div></li>`);
          });
          syncMedia();
        });
        frame.open();
      });
    })();
    </script>
    <?php
}

/** @param array<string,mixed> $variant */
function fh_wheel_authoring_render_variant_row(int $index, array $variant): void
{
    $fields = [
        'production_code' => ['text', '', ''],
        'diameter' => ['number', '10', '26'],
        'width' => ['number', '4', '14', 'fh-width-options'],
        'pcd' => ['text', '', '', 'fh-pcd-options'],
        'offset' => ['number', '-100', '100'],
        'center_bore' => ['number', '1', '250'],
        'finish' => ['text', '', ''],
    ];
    echo '<tr><td><input type="checkbox" name="fh_variants[' . esc_attr((string) $index) . '][approved]" value="1" ' . checked(!empty($variant['approved']), true, false) . '></td>';
    foreach ($fields as $key => $spec) {
        [$type, $min, $max] = $spec;
        $listId = $spec[3] ?? '';
        printf(
            '<td><input %s type="%s" %s %s %s step="%s" name="fh_variants[%d][%s]" value="%s"></td>',
            $key === 'finish' ? '' : 'required',
            esc_attr($type),
            $min !== '' ? 'min="' . esc_attr($min) . '"' : '',
            $max !== '' ? 'max="' . esc_attr($max) . '"' : '',
            $listId !== '' ? 'list="' . esc_attr($listId) . '"' : '',
            $type === 'number' ? '0.1' : '1',
            $index,
            esc_attr($key),
            esc_attr((string) ($variant[$key] ?? ''))
        );
    }
    echo '<td><span class="fh-actions"><button type="button" class="button-link fh-row-up">↑</button><button type="button" class="button-link fh-row-down">↓</button><button type="button" class="button-link-delete fh-row-remove">删除</button></span></td></tr>';
}

add_action('save_post_' . FH_WHEEL_AUTHORING_POST_TYPE, 'fh_wheel_authoring_save', 20, 2);
function fh_wheel_authoring_save(int $postId, WP_Post $post): void
{
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!isset($_POST['fh_wheel_authoring_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['fh_wheel_authoring_nonce'])), 'fh_wheel_authoring_save')) return;
    if (!current_user_can('edit_post', $postId)) return;

    $rows = isset($_POST['fh_variants']) && is_array($_POST['fh_variants']) ? wp_unslash($_POST['fh_variants']) : [];
    $variants = [];
    $approved = [];
    foreach ($rows as $row) {
        if (!is_array($row)) continue;
        $code = sanitize_text_field((string) ($row['production_code'] ?? ''));
        if ($code === '') continue;
        $variant = [
            'production_code' => $code,
            'diameter' => isset($row['diameter']) && is_numeric($row['diameter']) ? (float) $row['diameter'] : null,
            'width' => isset($row['width']) && is_numeric($row['width']) ? (float) $row['width'] : null,
            'pcd' => sanitize_text_field((string) ($row['pcd'] ?? '')),
            'offset' => isset($row['offset']) && is_numeric($row['offset']) ? (float) $row['offset'] : null,
            'center_bore' => isset($row['center_bore']) && is_numeric($row['center_bore']) ? (float) $row['center_bore'] : null,
            'finish' => sanitize_text_field((string) ($row['finish'] ?? '')),
            'approved' => !empty($row['approved']),
        ];
        if ($variant['approved']) $approved[] = $code;
        $variants[] = $variant;
    }
    update_post_meta($postId, 'variants_json', wp_json_encode($variants, JSON_UNESCAPED_UNICODE));
    update_post_meta($postId, 'approved_variant_keys', implode(',', array_values(array_unique($approved))));

    $mediaIds = isset($_POST['fh_gallery_media_ids'])
        ? array_values(array_unique(array_filter(array_map('absint', explode(',', sanitize_text_field(wp_unslash($_POST['fh_gallery_media_ids'])))))))
        : [];
    update_post_meta($postId, 'gallery_media_ids', implode(',', $mediaIds));
    update_post_meta($postId, 'hero_media_id', $mediaIds[0] ?? 0);
}

/** @return array<string,mixed>|null */
function fh_wheel_authoring_public_image(int $attachmentId): ?array
{
    if ($attachmentId <= 0 || !wp_attachment_is_image($attachmentId)) return null;
    $src = wp_get_attachment_url($attachmentId);
    if (!$src) return null;
    return [
        'id' => $attachmentId,
        'src' => $src,
        'alt' => trim((string) get_post_meta($attachmentId, '_wp_attachment_image_alt', true)),
        'caption' => trim((string) wp_get_attachment_caption($attachmentId)),
    ];
}

/** @return array<string,mixed> */
function fh_wheel_authoring_public_record(WP_Post $post): array
{
    $images = array_values(array_filter(array_map('fh_wheel_authoring_public_image', fh_wheel_authoring_media_ids($post->ID))));
    $variants = array_values(array_filter(fh_wheel_authoring_variants($post->ID), static fn($row) => !empty($row['approved'])));
    return [
        'id' => $post->ID,
        'slug' => (string) get_post_meta($post->ID, 'public_slug', true),
        'status' => $post->post_status,
        'wheel' => [
            'model' => get_the_title($post),
            'display_model' => (string) get_post_meta($post->ID, 'display_model', true),
            'publication_status' => (string) get_post_meta($post->ID, 'publication_status', true),
            'image_rights_status' => (string) get_post_meta($post->ID, 'image_rights_status', true),
            'supply_status' => (string) get_post_meta($post->ID, 'supply_status', true),
            'specification_status' => (string) get_post_meta($post->ID, 'specification_status', true),
            'approved_process' => (string) get_post_meta($post->ID, 'approved_process', true),
            'seo_title' => (string) get_post_meta($post->ID, 'seo_title', true),
            'seo_description' => (string) get_post_meta($post->ID, 'seo_description', true),
            'images' => $images,
            'variants' => $variants,
        ],
    ];
}

function fh_wheel_authoring_is_public(int $postId): bool
{
    if (!fh_wheel_is_approved($postId)) return false;
    if (!fh_wheel_authoring_media_ids($postId)) return false;
    foreach (fh_wheel_authoring_variants($postId) as $variant) {
        if (!empty($variant['approved'])) return true;
    }
    return false;
}

add_action('rest_api_init', 'fh_wheel_authoring_register_rest_route');
function fh_wheel_authoring_register_rest_route(): void
{
    register_rest_route('fh/v1', '/wheels', [[
        'methods' => WP_REST_Server::READABLE,
        'callback' => 'fh_wheel_authoring_rest_collection',
        'permission_callback' => '__return_true',
        'args' => [
            'preview' => ['type' => 'boolean', 'default' => false, 'sanitize_callback' => 'rest_sanitize_boolean'],
            'slug' => ['type' => 'string', 'sanitize_callback' => 'sanitize_title'],
        ],
    ]]);
}

function fh_wheel_authoring_rest_collection(WP_REST_Request $request): WP_REST_Response|WP_Error
{
    $preview = (bool) $request->get_param('preview');
    if ($preview && !current_user_can('edit_posts')) {
        return new WP_Error('fh_wheel_forbidden', '预览需要产品编辑权限。', ['status' => 401]);
    }
    $query = [
        'post_type' => FH_WHEEL_AUTHORING_POST_TYPE,
        'post_status' => $preview ? ['publish', 'draft', 'pending', 'future', 'private'] : 'publish',
        'posts_per_page' => 500,
        'orderby' => ['menu_order' => 'ASC', 'title' => 'ASC'],
        'no_found_rows' => true,
    ];
    $slug = (string) $request->get_param('slug');
    if ($slug !== '') {
        $query['meta_query'] = [['key' => 'public_slug', 'value' => $slug]];
    }
    $items = [];
    foreach (get_posts($query) as $post) {
        if (!$preview && !fh_wheel_authoring_is_public($post->ID)) continue;
        $items[] = fh_wheel_authoring_public_record($post);
    }
    return new WP_REST_Response([
        'authoritative' => get_option(FH_WHEEL_OPTION_AUTHORITATIVE, '0') === '1',
        'items' => $items,
    ], 200);
}

add_action('admin_init', 'fh_wheel_authoring_register_setting');
function fh_wheel_authoring_register_setting(): void
{
    register_setting('writing', FH_WHEEL_OPTION_AUTHORITATIVE, [
        'type' => 'boolean',
        'default' => false,
        'sanitize_callback' => static fn($value): string => $value ? '1' : '0',
    ]);
    add_settings_field(
        FH_WHEEL_OPTION_AUTHORITATIVE,
        '轮毂内容接管',
        static function (): void {
            $enabled = get_option(FH_WHEEL_OPTION_AUTHORITATIVE, '0') === '1';
            echo '<label><input type="checkbox" name="' . esc_attr(FH_WHEEL_OPTION_AUTHORITATIVE) . '" value="1" ' . checked($enabled, true, false) . '> WordPress 已完成规格与媒体迁移，可作为轮毂权威内容源</label>';
        },
        'writing'
    );
}

function fh_wheel_authoring_self_check(): array
{
    return [
        'authoritative' => get_option(FH_WHEEL_OPTION_AUTHORITATIVE, '0') === '1',
        'route' => '/fh/v1/wheels',
        'editable_meta' => ['variants_json', 'gallery_media_ids'],
    ];
}
