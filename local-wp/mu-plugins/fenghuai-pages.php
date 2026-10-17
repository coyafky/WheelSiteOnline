<?php
/**
 * Plugin Name:       Fenghuai 页面内容 — 原生 Page 接管
 * Description:       用 WordPress 原生 Page 管理首页、公司与产品线页面的结构化文案、SEO 和媒体。
 * Version:           0.1.0
 * Requires at least: 6.5
 * Requires PHP:      8.1
 */

if (!defined('ABSPATH')) exit;

const FH_PAGE_OPTION_AUTHORITATIVE = 'fh_pages_authoritative';
const FH_PAGE_META_KEY = 'fh_page_key';
const FH_PAGE_META_STATUS = 'fh_publication_status';
const FH_PAGE_META_CONTENT = 'fh_content_json';
const FH_PAGE_META_CONTENT_BY_LOCALE = 'fh_content_by_locale_json';
const FH_PAGE_META_SEO_TITLE = 'fh_seo_title';
const FH_PAGE_META_SEO_DESCRIPTION = 'fh_seo_description';
const FH_PAGE_META_SEO_BY_LOCALE = 'fh_seo_by_locale_json';
const FH_PAGE_META_LOCALE_STATUS = 'fh_locale_status_json';
const FH_PAGE_META_MEDIA = 'fh_featured_media_id';
// v2 逐语言独立 Page 的身份字段。旧的聚合 JSON 字段保留只读兼容。
const FH_PAGE_META_LOCALE = 'fh_page_locale';
const FH_PAGE_META_TRANSLATION_GROUP = 'fh_translation_group';
const FH_PAGE_META_SCHEMA_VERSION = 'fh_page_schema_version';

/** @var string[] */
const FH_PAGE_LOCALES = ['en', 'zh', 'es', 'th'];

/** @var array<string,array{type:string,label:string}> */
const FH_HOME_MODULES = [
    'H01' => ['type' => 'hero', 'label' => 'H01 首屏 Hero'],
    'H02' => ['type' => 'product-line-grid', 'label' => 'H02 产品线'],
    'H03' => ['type' => 'capabilities', 'label' => 'H03 制造与工程能力'],
    'H04' => ['type' => 'process', 'label' => 'H04 交付流程'],
    'H05' => ['type' => 'call-to-action', 'label' => 'H05 收口 CTA'],
];

/** 图片与链接属于已批准产品线事实，首页运营字段不能改写。 */
const FH_HOME_PRODUCT_LINE_FACTS = [
    'wheels' => ['image' => '/images/cards/card-wheels.webp', 'href' => '/products/wheels'],
    'ev-components' => ['image' => '/images/cards/card-ev.webp', 'href' => '/products/ev-components'],
    'custom-aluminum' => ['image' => '/images/cards/card-aluminum.webp', 'href' => '/products/custom-aluminum'],
    'safety-tires' => ['image' => '/images/cards/card-tires.webp', 'href' => '/products/safety-tires'],
];

/** @return string[] */
function fh_site_page_keys(): array
{
    return ['home', 'about', 'capabilities', 'product-lines', 'ev-components', 'custom-aluminum', 'safety-tires', 'request-a-quote', 'contact', 'privacy', 'thank-you'];
}

add_action('init', 'fh_pages_register_meta', 12);
function fh_pages_register_meta(): void
{
    foreach ([
        FH_PAGE_META_KEY => ['type' => 'string', 'default' => ''],
        FH_PAGE_META_STATUS => ['type' => 'string', 'default' => 'draft'],
        FH_PAGE_META_CONTENT => ['type' => 'string', 'default' => ''],
        FH_PAGE_META_CONTENT_BY_LOCALE => ['type' => 'string', 'default' => ''],
        FH_PAGE_META_SEO_TITLE => ['type' => 'string', 'default' => ''],
        FH_PAGE_META_SEO_DESCRIPTION => ['type' => 'string', 'default' => ''],
        FH_PAGE_META_SEO_BY_LOCALE => ['type' => 'string', 'default' => ''],
        FH_PAGE_META_LOCALE_STATUS => ['type' => 'string', 'default' => ''],
        FH_PAGE_META_MEDIA => ['type' => 'integer', 'default' => 0],
        FH_PAGE_META_LOCALE => ['type' => 'string', 'default' => ''],
        FH_PAGE_META_TRANSLATION_GROUP => ['type' => 'string', 'default' => ''],
        FH_PAGE_META_SCHEMA_VERSION => ['type' => 'integer', 'default' => 0],
    ] as $key => $definition) {
        register_post_meta('page', $key, [
            'type' => $definition['type'],
            'single' => true,
            'default' => $definition['default'],
            'show_in_rest' => false,
            // 独立语言 Page 的正文、SEO 和审批状态必须随原生 Page 修订恢复。
            'revisions_enabled' => in_array($key, [FH_PAGE_META_CONTENT, FH_PAGE_META_SEO_TITLE, FH_PAGE_META_SEO_DESCRIPTION, FH_PAGE_META_STATUS], true),
            'auth_callback' => static fn(): bool => current_user_can('edit_pages'),
            'sanitize_callback' => $definition['type'] === 'integer'
                ? static fn($value): int => absint($value)
                : (in_array($key, [FH_PAGE_META_CONTENT, FH_PAGE_META_CONTENT_BY_LOCALE, FH_PAGE_META_SEO_BY_LOCALE, FH_PAGE_META_LOCALE_STATUS], true)
                    ? static function ($value): string {
                        $decoded = json_decode((string) $value, true);
                        return is_array($decoded) ? (string) wp_json_encode($decoded, JSON_UNESCAPED_UNICODE) : '';
                    }
                    : static fn($value): string => sanitize_textarea_field((string) $value)),
        ]);
    }
}

add_action('rest_api_init', 'fh_pages_register_rest');
function fh_pages_register_rest(): void
{
    register_rest_route('fh/v1', '/pages', [[
        'methods' => WP_REST_Server::READABLE,
        'callback' => 'fh_pages_rest_collection',
        'permission_callback' => '__return_true',
        'args' => [
            'key' => ['type' => 'string', 'sanitize_callback' => 'sanitize_title'],
            'preview' => ['type' => 'boolean', 'default' => false, 'sanitize_callback' => 'rest_sanitize_boolean'],
        ],
    ]]);
    register_rest_route('fh/v2', '/pages', [[
        'methods' => WP_REST_Server::READABLE,
        'callback' => 'fh_pages_rest_v2',
        'permission_callback' => '__return_true',
        'args' => [
            'key' => ['required' => true, 'type' => 'string', 'sanitize_callback' => 'sanitize_title'],
            'locale' => ['required' => true, 'type' => 'string', 'sanitize_callback' => 'sanitize_key'],
            'preview' => ['type' => 'boolean', 'default' => false, 'sanitize_callback' => 'rest_sanitize_boolean'],
        ],
    ]]);
}

/**
 * v2：逐语言独立 Page 契约。旧 /fh/v1/pages 不改变，迁移由前端双读控制。
 */
function fh_pages_rest_v2(WP_REST_Request $request): WP_REST_Response|WP_Error
{
    $key = sanitize_title((string) $request->get_param('key'));
    $locale = sanitize_key((string) $request->get_param('locale'));
    $preview = (bool) $request->get_param('preview');
    if ($key === '' || !in_array($locale, FH_PAGE_LOCALES, true)) {
        return new WP_Error('fh_pages_invalid_locale', '页面键或语言无效。', ['status' => 400]);
    }
    if ($preview && !current_user_can('edit_pages')) {
        return new WP_Error('fh_pages_forbidden', '页面预览需要页面编辑权限。', ['status' => 401]);
    }
    $posts = get_posts([
        'post_type' => 'page',
        'post_status' => $preview ? ['publish', 'draft', 'pending', 'future', 'private'] : ['publish', 'draft', 'pending', 'future', 'private'],
        'posts_per_page' => 10,
        'orderby' => ['modified' => 'DESC', 'ID' => 'DESC'],
        'meta_query' => [
            ['key' => FH_PAGE_META_KEY, 'value' => $key],
            ['key' => FH_PAGE_META_LOCALE, 'value' => $locale],
        ],
    ]);
    $item = $posts[0] ?? null;
    $base = ['authoritative' => true, 'status' => 'missing-locale', 'source' => 'independent-page-v1'];
    if (!$item instanceof WP_Post) return new WP_REST_Response($base, 200);

    $publication = (string) get_post_meta($item->ID, FH_PAGE_META_STATUS, true) ?: 'draft';
    if ($publication === 'withdrawn') {
        $base['status'] = 'withdrawn';
        return new WP_REST_Response($base, 200);
    }
    if (!$preview && ($item->post_status !== 'publish' || $publication !== 'approved')) {
        $base['status'] = 'unpublished';
        return new WP_REST_Response($base, 200);
    }
    $content = json_decode((string) get_post_meta($item->ID, FH_PAGE_META_CONTENT, true), true);
    $schemaVersion = absint(get_post_meta($item->ID, FH_PAGE_META_SCHEMA_VERSION, true));
    $seoTitle = (string) get_post_meta($item->ID, FH_PAGE_META_SEO_TITLE, true);
    $seoDescription = (string) get_post_meta($item->ID, FH_PAGE_META_SEO_DESCRIPTION, true);
    if ($schemaVersion !== 1 || !fh_pages_home_content_ready($content, $seoTitle, $seoDescription)) {
        $base['status'] = 'unpublished';
        return new WP_REST_Response($base, 200);
    }
    $base['status'] = 'ready';
    $base['item'] = [
        'id' => $item->ID,
        'slug' => $item->post_name,
        'status' => $item->post_status,
        'title' => ['rendered' => get_the_title($item)],
        'content' => ['rendered' => apply_filters('the_content', $item->post_content)],
        'page' => [
            'page_key' => $key,
            'locale' => $locale,
            'translation_group' => (string) get_post_meta($item->ID, FH_PAGE_META_TRANSLATION_GROUP, true),
            'revision' => get_post_modified_time('c', true, $item),
            'schema_version' => $schemaVersion,
            'publication_status' => $publication,
            'content' => $content,
            'seo_title' => $seoTitle,
            'seo_description' => $seoDescription,
            'image' => fh_pages_public_image($item->ID),
        ],
    ];
    return new WP_REST_Response($base, 200);
}

function fh_pages_valid_home_modules(string $key, mixed $content): bool
{
    if ($key !== 'home' || !is_array($content) || !isset($content['modules']) || !is_array($content['modules'])) return false;
    $ids = array_map(static fn($module): string => is_array($module) ? (string) ($module['id'] ?? '') : '', $content['modules']);
    if (($content['schemaVersion'] ?? null) !== 1 || ($content['pageKey'] ?? null) !== $key || count($ids) !== count(FH_HOME_MODULES) || count(array_unique($ids)) !== count($ids)) return false;
    foreach (FH_HOME_MODULES as $id => $definition) {
        $matches = array_values(array_filter($content['modules'], static fn($module): bool => is_array($module) && ($module['id'] ?? '') === $id));
        if (count($matches) !== 1) return false;
        $module = $matches[0];
        if (($module['type'] ?? '') !== $definition['type'] || ($module['enabled'] ?? null) !== true || !is_int($module['order']) || !is_array($module['data'] ?? null)) return false;
        if ($id === 'H02') {
            $items = $module['data']['items'] ?? null;
            if (!is_array($items) || count($items) !== count(FH_HOME_PRODUCT_LINE_FACTS)) return false;
            foreach ($items as $index => $item) {
                if (!is_array($item) || !isset(FH_HOME_PRODUCT_LINE_FACTS[$item['slug'] ?? ''])) return false;
                if (($item['slug'] ?? '') !== array_keys(FH_HOME_PRODUCT_LINE_FACTS)[$index]) return false;
                $facts = FH_HOME_PRODUCT_LINE_FACTS[$item['slug']];
                if (!is_string($item['name'] ?? null) || trim($item['name']) === '' || !is_string($item['subtitle'] ?? null) || trim($item['subtitle']) === '' || !is_string($item['summary'] ?? null) || trim($item['summary']) === '' || ($item['hasRender'] ?? null) !== true || ($item['image'] ?? '') !== $facts['image'] || ($item['href'] ?? '') !== $facts['href']) return false;
            }
        }
    }
    $byId = [];
    foreach ($content['modules'] as $module) $byId[$module['id']] = $module;
    if (($byId['H01']['order'] ?? null) !== 10 || ($byId['H05']['order'] ?? null) !== 50) return false;
    $middleOrders = array_map(static fn(string $id): mixed => $byId[$id]['order'] ?? null, ['H02', 'H03', 'H04']);
    if (count(array_unique($middleOrders)) !== 3 || array_diff($middleOrders, [20, 30, 40]) !== []) return false;
    return true;
}

/** @return array<string,array{label:string,path:string,type:string,multiline?:bool}> */
function fh_pages_home_field_specs(): array
{
    $fields = [
        'H01' => [
            ['label' => 'Eyebrow', 'path' => 'eyebrow', 'type' => 'string'], ['label' => '标题', 'path' => 'heading', 'type' => 'string'], ['label' => '引导语', 'path' => 'lead', 'type' => 'string', 'multiline' => true], ['label' => '披露说明', 'path' => 'disclosure', 'type' => 'string', 'multiline' => true], ['label' => '媒体标签', 'path' => 'mediaLabel', 'type' => 'string'], ['label' => '媒体 ID', 'path' => 'media.wordpressId', 'type' => 'integer'], ['label' => '图片替代文字（当前语言）', 'path' => 'media.alt', 'type' => 'string'], ['label' => '图片说明（当前语言）', 'path' => 'media.caption', 'type' => 'string', 'multiline' => true], ['label' => '媒体审核状态', 'path' => 'media.approvalStatus', 'type' => 'media-status'],
            ['label' => '主按钮文字', 'path' => 'primaryAction.label', 'type' => 'string'], ['label' => '主按钮链接', 'path' => 'primaryAction.href', 'type' => 'string'], ['label' => '次按钮文字', 'path' => 'secondaryAction.label', 'type' => 'string'], ['label' => '次按钮链接', 'path' => 'secondaryAction.href', 'type' => 'string'],
        ],
        'H02' => [
            ['label' => 'Eyebrow', 'path' => 'eyebrow', 'type' => 'string'], ['label' => '标题', 'path' => 'heading', 'type' => 'string'], ['label' => '引导语', 'path' => 'intro', 'type' => 'string', 'multiline' => true],
            ['label' => '轮毂按钮', 'path' => 'actionLabels.wheels', 'type' => 'string'], ['label' => 'EV 按钮', 'path' => 'actionLabels.ev-components', 'type' => 'string'], ['label' => '定制铝按钮', 'path' => 'actionLabels.custom-aluminum', 'type' => 'string'], ['label' => '自密封轮胎按钮', 'path' => 'actionLabels.safety-tires', 'type' => 'string'],
        ],
        'H03' => [
            ['label' => 'Eyebrow', 'path' => 'eyebrow', 'type' => 'string'], ['label' => '标题', 'path' => 'heading', 'type' => 'string'], ['label' => '按钮文字', 'path' => 'action.label', 'type' => 'string'], ['label' => '按钮链接', 'path' => 'action.href', 'type' => 'string'],
        ],
        'H04' => [
            ['label' => 'Eyebrow', 'path' => 'eyebrow', 'type' => 'string'], ['label' => '标题', 'path' => 'heading', 'type' => 'string'], ['label' => '引导语', 'path' => 'lead', 'type' => 'string', 'multiline' => true], ['label' => '按钮文字', 'path' => 'action.label', 'type' => 'string'], ['label' => '按钮链接', 'path' => 'action.href', 'type' => 'string'],
        ],
        'H05' => [
            ['label' => 'Eyebrow', 'path' => 'eyebrow', 'type' => 'string'], ['label' => '标题', 'path' => 'heading', 'type' => 'string'], ['label' => '正文', 'path' => 'body', 'type' => 'string', 'multiline' => true], ['label' => '输入提示标题', 'path' => 'inputLabel', 'type' => 'string'], ['label' => '提示 1', 'path' => 'inputPrompts.0', 'type' => 'string'], ['label' => '提示 2', 'path' => 'inputPrompts.1', 'type' => 'string'], ['label' => '提示 3', 'path' => 'inputPrompts.2', 'type' => 'string'], ['label' => '主按钮文字', 'path' => 'primaryAction.label', 'type' => 'string'], ['label' => '主按钮链接', 'path' => 'primaryAction.href', 'type' => 'string'], ['label' => '次按钮文字', 'path' => 'secondaryAction.label', 'type' => 'string'], ['label' => '次按钮链接', 'path' => 'secondaryAction.href', 'type' => 'string'],
        ],
    ];
    foreach (array_keys(FH_HOME_PRODUCT_LINE_FACTS) as $index => $slug) {
        $fields['H02'][] = ['label' => $slug . ' 名称', 'path' => 'items.' . $index . '.name', 'type' => 'string'];
        $fields['H02'][] = ['label' => $slug . ' 副标题', 'path' => 'items.' . $index . '.subtitle', 'type' => 'string'];
        $fields['H02'][] = ['label' => $slug . ' 摘要', 'path' => 'items.' . $index . '.summary', 'type' => 'string', 'multiline' => true];
    }
    // H03 的六条能力项、H04 的五个阶段和三条证据也必须逐字段编辑。
    foreach (range(0, 5) as $index) {
        $fields['H03'][] = ['label' => '能力 ' . ($index + 1) . ' 标题', 'path' => 'items.' . $index . '.title', 'type' => 'string'];
        $fields['H03'][] = ['label' => '能力 ' . ($index + 1) . ' 正文', 'path' => 'items.' . $index . '.body', 'type' => 'string', 'multiline' => true];
        $fields['H03'][] = ['label' => '能力 ' . ($index + 1) . ' 适用范围（每行一项）', 'path' => 'items.' . $index . '.appliesTo', 'type' => 'list', 'multiline' => true];
    }
    foreach (range(0, 4) as $index) {
        $fields['H04'][] = ['label' => '阶段 ' . ($index + 1) . ' 标题', 'path' => 'stages.' . $index . '.title', 'type' => 'string'];
        $fields['H04'][] = ['label' => '阶段 ' . ($index + 1) . ' 正文', 'path' => 'stages.' . $index . '.body', 'type' => 'string', 'multiline' => true];
    }
    foreach (range(0, 2) as $index) {
        $fields['H04'][] = ['label' => '证据 ' . ($index + 1) . ' 标签', 'path' => 'evidence.' . $index . '.label', 'type' => 'string'];
        $fields['H04'][] = ['label' => '证据 ' . ($index + 1) . ' 正文', 'path' => 'evidence.' . $index . '.body', 'type' => 'string', 'multiline' => true];
        $fields['H04'][] = ['label' => '证据 ' . ($index + 1) . ' 媒体 ID', 'path' => 'evidence.' . $index . '.media.wordpressId', 'type' => 'integer'];
        $fields['H04'][] = ['label' => '证据 ' . ($index + 1) . ' 替代文字（当前语言）', 'path' => 'evidence.' . $index . '.media.alt', 'type' => 'string'];
        $fields['H04'][] = ['label' => '证据 ' . ($index + 1) . ' 图片说明（当前语言）', 'path' => 'evidence.' . $index . '.media.caption', 'type' => 'string', 'multiline' => true];
        $fields['H04'][] = ['label' => '证据 ' . ($index + 1) . ' 媒体审核状态', 'path' => 'evidence.' . $index . '.media.approvalStatus', 'type' => 'media-status'];
    }
    return $fields;
}

function fh_pages_home_path_get(array $data, string $path): mixed
{
    $value = $data;
    foreach (explode('.', $path) as $segment) {
        if (!is_array($value) || !array_key_exists($segment, $value)) return '';
        $value = $value[$segment];
    }
    return is_array($value) ? implode("\n", array_map('strval', $value)) : $value;
}

function fh_pages_home_path_set(array &$data, string $path, mixed $value): void
{
    $segments = explode('.', $path);
    $last = array_pop($segments);
    foreach ($segments as $segment) {
        if (!isset($data[$segment]) || !is_array($data[$segment])) $data[$segment] = [];
        $data = &$data[$segment];
    }
    $data[$last] = $value;
}

/**
 * 重新绑定首页 H01/H04 媒体时，先从 WordPress 附件取新事实，再进入候选状态。
 * 既有已批准映射可能使用审核后的本地 WebP 路径；同一 ID 不强制改写该路径。
 */
function fh_pages_refresh_home_media(mixed &$value, mixed $previous = null, string $key = ''): void
{
    if (!is_array($value)) return;
    if ($key === 'modules') {
        $previousById = [];
        if (is_array($previous)) {
            foreach ($previous as $oldModule) {
                if (is_array($oldModule) && is_string($oldModule['id'] ?? null)) $previousById[$oldModule['id']] = $oldModule;
            }
        }
        foreach ($value as &$module) {
            $moduleId = is_array($module) ? (string) ($module['id'] ?? '') : '';
            fh_pages_refresh_home_media($module, $previousById[$moduleId] ?? null, 'module');
        }
        unset($module);
        return;
    }
    if ($key === 'media') {
        $newId = absint($value['wordpressId'] ?? 0);
        $oldId = is_array($previous) ? absint($previous['wordpressId'] ?? 0) : 0;
        $oldStatus = is_array($previous) ? (string) ($previous['approvalStatus'] ?? '') : '';
        $requestedStatus = (string) ($value['approvalStatus'] ?? 'candidate');
        if (!in_array($requestedStatus, ['candidate', 'approved'], true)) $requestedStatus = 'candidate';

        if ($newId <= 0) {
            $value['wordpressId'] = 0;
            $value['approvalStatus'] = 'candidate';
            $value['hasRender'] = false;
            return;
        }

        // 换 ID 时取得新附件事实并降为候选；后续保存可填写当前语言的 alt/caption。
        // 同一 ID 的已批准本地 WebP 映射不强制改成 WordPress 附件 URL。
        if ($newId !== $oldId) {
            $attachmentUrl = wp_attachment_is_image($newId) ? (string) wp_get_attachment_url($newId) : '';
            $attachmentAlt = trim((string) get_post_meta($newId, '_wp_attachment_image_alt', true));
            $attachmentCaption = trim((string) wp_get_attachment_caption($newId));
            $value['src'] = $attachmentUrl;
            $value['alt'] = $attachmentAlt;
            $value['caption'] = $attachmentCaption;
            $value['sourceRef'] = 'WordPress media ' . $newId;
            $value['mediaBindingStatus'] = 'attachment';
            $value['approvalStatus'] = 'candidate';
            $value['hasRender'] = false;
            return;
        }

        $attachmentBound = is_array($previous) && ($previous['mediaBindingStatus'] ?? '') === 'attachment';
        $attachmentUrl = $attachmentBound && wp_attachment_is_image($newId) ? (string) wp_get_attachment_url($newId) : '';
        $bindingValid = !$attachmentBound || ($attachmentUrl !== '' && ($value['src'] ?? '') === $attachmentUrl);
        $languageTextChanged = is_array($previous)
            && (($value['alt'] ?? '') !== ($previous['alt'] ?? '') || ($value['caption'] ?? '') !== ($previous['caption'] ?? ''));
        if ($requestedStatus === 'approved' && $bindingValid
            && trim((string) ($value['src'] ?? '')) !== '' && trim((string) ($value['alt'] ?? '')) !== ''
            && ($oldStatus === 'candidate' || ($oldStatus === 'approved' && !$languageTextChanged))) {
            $value['approvalStatus'] = 'approved';
            $value['hasRender'] = true;
        } else {
            $value['approvalStatus'] = 'candidate';
            $value['hasRender'] = false;
        }
        return;
    }

    foreach ($value as $childKey => &$child) {
        $oldChild = is_array($previous) && array_key_exists($childKey, $previous) ? $previous[$childKey] : null;
        fh_pages_refresh_home_media($child, $oldChild, (string) $childKey);
    }
    unset($child);
}

function fh_pages_valid_content_leaves(mixed $value, string $path = ''): bool
{
    if (is_string($value)) return trim($value) !== '';
    if (is_int($value) || is_float($value) || is_bool($value)) return true;
    if (!is_array($value)) return false;
    if ($value === []) return str_ends_with($path, '.highlights');
    foreach ($value as $key => $child) {
        if (in_array((string) $key, ['wordpressId'], true) && is_int($child)) continue;
        if (!fh_pages_valid_content_leaves($child, $path . '.' . $key)) return false;
    }
    return true;
}

function fh_pages_valid_media_leaves(mixed $value): bool
{
    if (!is_array($value)) return true;
    foreach ($value as $key => $child) {
        if ($key === 'media') {
            if (!is_array($child) || ($child['hasRender'] ?? false) !== true || ($child['approvalStatus'] ?? '') !== 'approved' || trim((string) ($child['src'] ?? '')) === '' || trim((string) ($child['alt'] ?? '')) === '') return false;
        }
        if (is_array($child) && !fh_pages_valid_media_leaves($child)) return false;
    }
    return true;
}

/** @param mixed $value */
function fh_pages_valid_home_media_bindings(mixed $value): bool
{
    if (!is_array($value)) return true;
    foreach ($value as $key => $child) {
        if ($key === 'media' && is_array($child) && ($child['approvalStatus'] ?? '') === 'approved' && ($child['mediaBindingStatus'] ?? '') === 'attachment') {
            $mediaId = absint($child['wordpressId'] ?? 0);
            $expectedSrc = $mediaId > 0 && wp_attachment_is_image($mediaId) ? (string) wp_get_attachment_url($mediaId) : '';
            if ($expectedSrc === '' || (string) ($child['src'] ?? '') !== $expectedSrc || trim((string) ($child['alt'] ?? '')) === '') return false;
        }
        if (is_array($child) && !fh_pages_valid_home_media_bindings($child)) return false;
    }
    return true;
}

function fh_pages_home_content_ready(mixed $content, string $seoTitle, string $seoDescription): bool
{
    return fh_pages_valid_home_modules('home', $content)
        && trim($seoTitle) !== ''
        && trim($seoDescription) !== ''
        && fh_pages_valid_content_leaves($content)
        && fh_pages_valid_media_leaves($content)
        && fh_pages_valid_home_media_bindings($content);
}

function fh_pages_rest_collection(WP_REST_Request $request): WP_REST_Response|WP_Error
{
    $preview = (bool) $request->get_param('preview');
    if ($preview && !current_user_can('edit_pages')) {
        return new WP_Error('fh_pages_forbidden', '页面预览需要页面编辑权限。', ['status' => 401]);
    }
    $key = sanitize_title((string) $request->get_param('key'));
    $query = [
        'post_type' => 'page',
        'post_status' => $preview ? ['publish', 'draft', 'pending', 'future', 'private'] : 'publish',
        'posts_per_page' => $key !== '' ? 1 : 100,
        'orderby' => ['menu_order' => 'ASC', 'date' => 'ASC'],
        'no_found_rows' => true,
    ];
    if ($key !== '') $query['meta_key'] = FH_PAGE_META_KEY;
    if ($key !== '') $query['meta_value'] = $key;
    $query['meta_query'] = [[
        'relation' => 'OR',
        ['key' => FH_PAGE_META_LOCALE, 'compare' => 'NOT EXISTS'],
        ['key' => FH_PAGE_META_LOCALE, 'value' => '', 'compare' => '='],
    ]];

    $items = [];
    foreach (get_posts($query) as $post) {
        $pageKey = (string) get_post_meta($post->ID, FH_PAGE_META_KEY, true);
        $publication = (string) get_post_meta($post->ID, FH_PAGE_META_STATUS, true);
        $json = json_decode((string) get_post_meta($post->ID, FH_PAGE_META_CONTENT, true), true);
        if ($pageKey === '' || !is_array($json)) continue;
        if (!$preview && $publication !== 'approved') continue;
        $contentByLocale = fh_pages_decode_json_meta($post->ID, FH_PAGE_META_CONTENT_BY_LOCALE);
        $seoByLocale = fh_pages_decode_json_meta($post->ID, FH_PAGE_META_SEO_BY_LOCALE);
        $localeStatus = fh_pages_decode_json_meta($post->ID, FH_PAGE_META_LOCALE_STATUS);
        if (!$preview) {
            foreach ($contentByLocale as $locale => $_content) {
                if (($localeStatus[$locale] ?? '') !== 'approved') unset($contentByLocale[$locale], $seoByLocale[$locale]);
            }
        }
        $items[] = [
            'id' => $post->ID,
            'slug' => $post->post_name,
            'status' => $post->post_status,
            'title' => ['rendered' => get_the_title($post)],
            'content' => ['rendered' => apply_filters('the_content', $post->post_content)],
            'page' => [
                'page_key' => $pageKey,
                'publication_status' => $publication ?: 'draft',
                'content' => $json,
                'content_by_locale' => $contentByLocale,
                'seo_title' => (string) get_post_meta($post->ID, FH_PAGE_META_SEO_TITLE, true),
                'seo_description' => (string) get_post_meta($post->ID, FH_PAGE_META_SEO_DESCRIPTION, true),
                'seo_by_locale' => $seoByLocale,
                'locale_status' => $localeStatus,
                'image' => fh_pages_public_image($post->ID),
            ],
        ];
    }
    $globalAuthoritative = get_option(FH_PAGE_OPTION_AUTHORITATIVE, '0') === '1';
    // 迁移可以按页面键分批完成：单页请求只要拿到已批准页面即可交给
    // WordPress；全量请求仍必须由站点级开关明确接管，避免半迁移时误宣称
    // 整站内容都已由 CMS 负责。
    $scopedAuthoritative = $key !== '' && $items !== [] && array_reduce(
        $items,
        static fn (bool $approved, array $item): bool => $approved
            && ($item['page']['publication_status'] ?? '') === 'approved',
        true,
    );
    return new WP_REST_Response([
        'authoritative' => $globalAuthoritative || $scopedAuthoritative,
        'items' => $items,
    ], 200);
}

/** @return array<string,mixed> */
function fh_pages_decode_json_meta(int $postId, string $metaKey): array
{
    $raw = get_post_meta($postId, $metaKey, true);
    $decoded = json_decode((string) $raw, true);
    return is_array($decoded) ? $decoded : [];
}

/** @return array<string,mixed>|null */
function fh_pages_public_image(int $postId): ?array
{
    $mediaId = absint(get_post_meta($postId, FH_PAGE_META_MEDIA, true));
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

add_action('add_meta_boxes_page', 'fh_pages_add_meta_box');
function fh_pages_add_meta_box(): void
{
    add_meta_box('fh-site-page-fields', '峰徊站点页面内容', 'fh_pages_render_meta_box', 'page', 'normal', 'high');
}

function fh_pages_render_meta_box(WP_Post $post): void
{
    wp_enqueue_media();
    wp_nonce_field('fh_pages_save', 'fh_pages_nonce');
    $status = (string) get_post_meta($post->ID, FH_PAGE_META_STATUS, true) ?: 'draft';
    $mediaId = absint(get_post_meta($post->ID, FH_PAGE_META_MEDIA, true));
    $pageKey = (string) get_post_meta($post->ID, FH_PAGE_META_KEY, true);
    $locale = (string) get_post_meta($post->ID, FH_PAGE_META_LOCALE, true);
    ?>
    <p><strong>双重发布门槛：</strong>WordPress 页面状态为“已发布”，并且下方状态为“已批准”时才会进入前台。</p>
    <p><label for="fh_page_key"><strong>页面键</strong></label><br><input class="regular-text" id="fh_page_key" name="fh_page_key" value="<?php echo esc_attr($pageKey); ?>" placeholder="home / about / capabilities"></p>
    <p><label for="fh_page_locale"><strong>独立语言（v2 页面记录）</strong></label><br><select id="fh_page_locale" name="fh_page_locale"><option value="">旧聚合记录（迁移兼容）</option><?php foreach (FH_PAGE_LOCALES as $availableLocale) : ?><option value="<?php echo esc_attr($availableLocale); ?>" <?php selected($locale, $availableLocale); ?>><?php echo esc_html($availableLocale); ?></option><?php endforeach; ?></select> <span class="description">语言一旦用于公开记录，应与页面键和翻译组保持稳定。</span></p>
    <p><label for="fh_translation_group"><strong>翻译组</strong></label><br><input class="regular-text" id="fh_translation_group" name="fh_translation_group" value="<?php echo esc_attr((string) get_post_meta($post->ID, FH_PAGE_META_TRANSLATION_GROUP, true)); ?>" placeholder="home"><input type="hidden" name="fh_page_schema_version" value="<?php echo esc_attr((string) get_post_meta($post->ID, FH_PAGE_META_SCHEMA_VERSION, true)); ?>"></p>
    <p><label for="fh_publication_status"><strong>编辑发布状态</strong></label><br><select id="fh_publication_status" name="fh_publication_status"><?php foreach (['draft' => '草稿 / 待审', 'approved' => '已批准', 'withdrawn' => '已撤回'] as $value => $label) : ?><option value="<?php echo esc_attr($value); ?>" <?php selected($status, $value); ?>><?php echo esc_html($label); ?></option><?php endforeach; ?></select></p>
    <p><label for="fh_seo_title"><strong>SEO 标题</strong></label><br><input class="widefat" id="fh_seo_title" name="fh_seo_title" value="<?php echo esc_attr((string) get_post_meta($post->ID, FH_PAGE_META_SEO_TITLE, true)); ?>"></p>
    <p><label for="fh_seo_description"><strong>SEO 描述</strong></label><br><textarea class="widefat" rows="3" id="fh_seo_description" name="fh_seo_description"><?php echo esc_textarea((string) get_post_meta($post->ID, FH_PAGE_META_SEO_DESCRIPTION, true)); ?></textarea></p>
    <?php if ($locale === '') : ?>
    <p><label for="fh_content_json"><strong>结构化页面内容（英文正本 / 迁移期快照）</strong></label><br><textarea class="widefat code" rows="12" id="fh_content_json" name="fh_content_json"><?php echo esc_textarea((string) get_post_meta($post->ID, FH_PAGE_META_CONTENT, true)); ?></textarea></p>
    <p><label for="fh_content_by_locale_json"><strong>多语言结构化内容 JSON</strong></label><br><textarea class="widefat code" rows="8" id="fh_content_by_locale_json" name="fh_content_by_locale_json"><?php echo esc_textarea((string) get_post_meta($post->ID, FH_PAGE_META_CONTENT_BY_LOCALE, true)); ?></textarea><br><span class="description">格式：{"zh":{...},"es":{...},"th":{...}}。字段不完整时不会公开或替代英文正本。</span></p>
    <p><label for="fh_seo_by_locale_json"><strong>多语言 SEO JSON</strong></label><br><textarea class="widefat code" rows="4" id="fh_seo_by_locale_json" name="fh_seo_by_locale_json"><?php echo esc_textarea((string) get_post_meta($post->ID, FH_PAGE_META_SEO_BY_LOCALE, true)); ?></textarea><br><span class="description">格式：{"zh":{"title":"...","description":"..."},"es":{...},"th":{...}}。</span></p>
    <p><label for="fh_locale_status_json"><strong>多语言发布状态 JSON</strong></label><br><textarea class="widefat code" rows="3" id="fh_locale_status_json" name="fh_locale_status_json"><?php echo esc_textarea((string) get_post_meta($post->ID, FH_PAGE_META_LOCALE_STATUS, true)); ?></textarea><br><span class="description">格式：{"zh":"draft","es":"approved","th":"withdrawn"}。只有 approved 的语言版本进入公开接口。</span></p>
    <?php endif; ?>
    <p><label for="fh_featured_media_id"><strong>特色媒体 ID</strong></label><br><input class="small-text" id="fh_featured_media_id" name="fh_featured_media_id" value="<?php echo esc_attr((string) $mediaId); ?>"> <span class="description">媒体库图片必须填写英文 alt。</span></p>
    <?php if ($pageKey === 'home' && $locale !== '') : ?>
    <hr>
    <p><strong>首页 v1 模块</strong>：H01–H05 是首页必需模块，不能隐藏；只能调整顺序。每个模块的数据单独保存，模块类型和 ID 由系统固定。</p>
    <?php
    $homeContent = json_decode((string) get_post_meta($post->ID, FH_PAGE_META_CONTENT, true), true);
    $homeModules = is_array($homeContent['modules'] ?? null) ? $homeContent['modules'] : [];
    $homeFieldSpecs = fh_pages_home_field_specs();
    foreach (FH_HOME_MODULES as $moduleId => $definition) :
        $module = array_values(array_filter($homeModules, static fn($candidate): bool => is_array($candidate) && ($candidate['id'] ?? '') === $moduleId))[0] ?? ['data' => [], 'order' => 10];
        $order = absint($module['order'] ?? 10);
    ?>
      <p><label for="fh_home_<?php echo esc_attr(strtolower($moduleId)); ?>_order"><strong><?php echo esc_html($definition['label']); ?></strong></label><br>
      <?php if ($moduleId === 'H01' || $moduleId === 'H05') : $fixedOrder = $moduleId === 'H01' ? 10 : 50; ?><input type="hidden" name="fh_home_<?php echo esc_attr(strtolower($moduleId)); ?>_order" value="<?php echo esc_attr((string) $fixedOrder); ?>"><span class="description">固定为第 <?php echo esc_html((string) (($fixedOrder / 10))); ?> 个模块。</span><?php else : ?><select id="fh_home_<?php echo esc_attr(strtolower($moduleId)); ?>_order" name="fh_home_<?php echo esc_attr(strtolower($moduleId)); ?>_order"><?php for ($position = 20; $position <= 40; $position += 10) : ?><option value="<?php echo esc_attr((string) $position); ?>" <?php selected($order, $position); ?>><?php echo esc_html((string) (($position / 10))); ?></option><?php endfor; ?></select><?php endif; ?></p>
      <?php foreach ($homeFieldSpecs[$moduleId] as $field) : $fieldName = 'fh_home_' . strtolower($moduleId) . '_' . str_replace('.', '_', $field['path']); $fieldValue = fh_pages_home_path_get($module['data'] ?? [], $field['path']); ?>
        <p><label for="<?php echo esc_attr($fieldName); ?>"><?php echo esc_html($field['label']); ?></label><br>
        <?php if (($field['type'] ?? '') === 'media-status') : ?><select class="widefat" id="<?php echo esc_attr($fieldName); ?>" name="<?php echo esc_attr($fieldName); ?>"><option value="candidate" <?php selected($fieldValue, 'candidate'); ?>>待审核</option><option value="approved" <?php selected($fieldValue, 'approved'); ?>>已批准</option></select><?php elseif (!empty($field['multiline'])) : ?><textarea class="widefat" rows="3" id="<?php echo esc_attr($fieldName); ?>" name="<?php echo esc_attr($fieldName); ?>"><?php echo esc_textarea((string) $fieldValue); ?></textarea><?php else : ?><input class="widefat" id="<?php echo esc_attr($fieldName); ?>" name="<?php echo esc_attr($fieldName); ?>" value="<?php echo esc_attr((string) $fieldValue); ?>"><?php endif; ?></p>
      <?php endforeach; ?>
    <?php endforeach; endif; ?>
    <?php
}

add_action('save_post_page', 'fh_pages_save_meta', 20);
function fh_pages_save_meta(int $postId): void
{
    if (!isset($_POST['fh_pages_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['fh_pages_nonce'])), 'fh_pages_save')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $postId)) return;
    $existingKey = (string) get_post_meta($postId, FH_PAGE_META_KEY, true);
    $existingLocale = (string) get_post_meta($postId, FH_PAGE_META_LOCALE, true);
    $key = sanitize_title((string) wp_unslash($_POST['fh_page_key'] ?? ''));
    if ($existingKey !== '') $key = $existingKey;
    if (!in_array($key, fh_site_page_keys(), true)) $key = '';
    $status = sanitize_key((string) wp_unslash($_POST['fh_publication_status'] ?? 'draft'));
    if (!in_array($status, ['draft', 'approved', 'withdrawn'], true)) $status = 'draft';
    $locale = sanitize_key((string) wp_unslash($_POST['fh_page_locale'] ?? ''));
    if ($existingLocale !== '') $locale = $existingLocale;
    if ($locale !== '' && !in_array($locale, FH_PAGE_LOCALES, true)) $locale = '';
    $independentRecord = $existingLocale !== '' || $locale !== '';
    $translationGroup = sanitize_title((string) wp_unslash($_POST['fh_translation_group'] ?? ''));
    $existingGroup = (string) get_post_meta($postId, FH_PAGE_META_TRANSLATION_GROUP, true);
    if ($existingGroup !== '') $translationGroup = $existingGroup;
    $identityConflict = false;
    if ($key !== '' && $locale !== '') {
        $conflicts = get_posts([
            'post_type' => 'page', 'post_status' => 'any', 'posts_per_page' => 1, 'fields' => 'ids',
            'post__not_in' => [$postId],
            'meta_query' => [['key' => FH_PAGE_META_KEY, 'value' => $key], ['key' => FH_PAGE_META_LOCALE, 'value' => $locale]],
        ]);
        $identityConflict = $conflicts !== [];
        if ($identityConflict) $status = 'draft';
    }

    /*
     * A translation group names the one record that represents a language of a
     * page. Two records claiming the same group AND locale make the group
     * ambiguous — the cross-language set (hreflang, sitemap, language switcher)
     * would then have two candidates for one language and pick whichever the
     * query happened to return first.
     *
     * The homepage currently carries exactly this defect: `home` (id 1311) and
     * `home-en` (id 1461) both describe English. This guard stops new ones; the
     * existing pair is left alone because deciding which body wins is a content
     * decision, not a schema one.
     */
    $groupConflict = false;
    if ($translationGroup !== '' && $locale !== '') {
        $groupConflicts = get_posts([
            'post_type' => 'page', 'post_status' => 'any', 'posts_per_page' => 1, 'fields' => 'ids',
            'post__not_in' => [$postId],
            'meta_query' => [
                ['key' => FH_PAGE_META_TRANSLATION_GROUP, 'value' => $translationGroup],
                ['key' => FH_PAGE_META_LOCALE, 'value' => $locale],
            ],
        ]);
        $groupConflict = $groupConflicts !== [];
        if ($groupConflict) $status = 'draft';
    }
    $json = json_decode((string) wp_unslash($_POST['fh_content_json'] ?? ''), true);
    $schemaVersion = absint($_POST['fh_page_schema_version'] ?? 0);
    if ($identityConflict) {
        // 不制造第二条可识别的 page_key+locale；该记录保持草稿并脱离独立语言契约。
        $locale = '';
        $schemaVersion = 0;
    }
    if ($key === 'home' && $locale !== '') {
        $modules = [];
        $homeContent = json_decode((string) get_post_meta($postId, FH_PAGE_META_CONTENT, true), true);
        $previousHomeContent = $homeContent;
        $homeModules = is_array($homeContent['modules'] ?? null) ? $homeContent['modules'] : [];
        foreach (FH_HOME_MODULES as $moduleId => $definition) {
            $data = array_values(array_filter($homeModules, static fn($candidate): bool => is_array($candidate) && ($candidate['id'] ?? '') === $moduleId))[0]['data'] ?? [];
            if (!is_array($data)) $data = [];
            foreach (fh_pages_home_field_specs()[$moduleId] as $fieldSpec) {
                $field = 'fh_home_' . strtolower($moduleId) . '_' . str_replace('.', '_', $fieldSpec['path']);
                $rawValue = sanitize_textarea_field((string) wp_unslash($_POST[$field] ?? ''));
                if ($fieldSpec['type'] === 'integer') {
                    $value = absint($rawValue);
                } elseif ($fieldSpec['type'] === 'media-status') {
                    $value = in_array($rawValue, ['candidate', 'approved'], true) ? $rawValue : 'candidate';
                } elseif ($fieldSpec['type'] === 'list') {
                    $value = array_values(array_filter(array_map('trim', preg_split('/[\r\n,]+/', $rawValue) ?: [])));
                } else {
                    $value = $rawValue;
                }
                fh_pages_home_path_set($data, $fieldSpec['path'], $value);
            }
            $orderField = 'fh_home_' . strtolower($moduleId) . '_order';
            $order = absint($_POST[$orderField] ?? 0);
            if ($moduleId === 'H01') $order = 10;
            elseif ($moduleId === 'H05') $order = 50;
            elseif (!in_array($order, [20, 30, 40], true)) $order = 20;
            $modules[] = ['id' => $moduleId, 'type' => $definition['type'], 'order' => $order, 'enabled' => true, 'data' => $data];
        }
        $middle = array_values(array_filter($modules, static fn(array $module): bool => in_array($module['id'], ['H02', 'H03', 'H04'], true)));
        usort($middle, static fn(array $left, array $right): int => $left['order'] <=> $right['order'] ?: strcmp($left['id'], $right['id']));
        foreach ($middle as $index => &$module) $module['order'] = ($index + 2) * 10;
        unset($module);
        $modules = array_merge([$modules[0]], $middle, [$modules[4]]);
        $json = ['schemaVersion' => 1, 'pageKey' => 'home', 'locale' => $locale, 'modules' => $modules];
        $schemaVersion = 1;
        fh_pages_refresh_home_media($json, is_array($previousHomeContent) ? $previousHomeContent : null);
    }
    update_post_meta($postId, FH_PAGE_META_KEY, $key);
    update_post_meta($postId, FH_PAGE_META_STATUS, $status);
    update_post_meta($postId, FH_PAGE_META_CONTENT, is_array($json) ? wp_json_encode($json, JSON_UNESCAPED_UNICODE) : '');
    // 独立语言 Page 不得覆盖旧聚合记录；旧记录仅在明确提交有效 JSON 时更新。
    if (!$independentRecord) {
        if (array_key_exists('fh_content_by_locale_json', $_POST)) {
            $contentByLocale = json_decode((string) wp_unslash($_POST['fh_content_by_locale_json']), true);
            if (is_array($contentByLocale)) update_post_meta($postId, FH_PAGE_META_CONTENT_BY_LOCALE, wp_json_encode($contentByLocale, JSON_UNESCAPED_UNICODE));
        }
    }
    update_post_meta($postId, FH_PAGE_META_SEO_TITLE, sanitize_text_field((string) wp_unslash($_POST['fh_seo_title'] ?? '')));
    update_post_meta($postId, FH_PAGE_META_SEO_DESCRIPTION, sanitize_textarea_field((string) wp_unslash($_POST['fh_seo_description'] ?? '')));
    if (!$independentRecord) {
        if (array_key_exists('fh_seo_by_locale_json', $_POST)) {
            $seoByLocale = json_decode((string) wp_unslash($_POST['fh_seo_by_locale_json']), true);
            if (is_array($seoByLocale)) update_post_meta($postId, FH_PAGE_META_SEO_BY_LOCALE, wp_json_encode($seoByLocale, JSON_UNESCAPED_UNICODE));
        }
        if (array_key_exists('fh_locale_status_json', $_POST)) {
            $localeStatus = json_decode((string) wp_unslash($_POST['fh_locale_status_json']), true);
            if (is_array($localeStatus)) update_post_meta($postId, FH_PAGE_META_LOCALE_STATUS, wp_json_encode($localeStatus, JSON_UNESCAPED_UNICODE));
        }
    }
    update_post_meta($postId, FH_PAGE_META_MEDIA, absint($_POST['fh_featured_media_id'] ?? 0));
    update_post_meta($postId, FH_PAGE_META_LOCALE, $locale);
    update_post_meta($postId, FH_PAGE_META_TRANSLATION_GROUP, $translationGroup);
    update_post_meta($postId, FH_PAGE_META_SCHEMA_VERSION, $schemaVersion);
}

add_action('admin_init', 'fh_pages_register_setting');
function fh_pages_register_setting(): void
{
    register_setting('writing', FH_PAGE_OPTION_AUTHORITATIVE, [
        'type' => 'boolean',
        'default' => false,
        'sanitize_callback' => static fn($value): string => $value ? '1' : '0',
    ]);
    add_settings_field(FH_PAGE_OPTION_AUTHORITATIVE, '原生 Page 内容接管', static function (): void {
        $enabled = get_option(FH_PAGE_OPTION_AUTHORITATIVE, '0') === '1';
        echo '<label><input type="checkbox" name="' . esc_attr(FH_PAGE_OPTION_AUTHORITATIVE) . '" value="1" ' . checked($enabled, true, false) . '> 首页、公司和产品线 Page 已完成迁移并核验，可作为前台权威内容源</label>';
    }, 'writing');
}

function fh_pages_self_check(): array
{
    return [
        'native_page_registered' => post_type_exists('page'),
        'authoritative' => get_option(FH_PAGE_OPTION_AUTHORITATIVE, '0') === '1',
        'keys' => fh_site_page_keys(),
    ];
}
