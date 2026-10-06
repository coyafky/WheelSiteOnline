<?php
/**
 * 首期轮毂导入器 —— 把 wheel-import-package.json 灌进 WordPress CPT。
 *
 * 用法（在 fh-wp 容器内）：
 *   php /var/www/html/fh-import.php /var/www/html/fh-import.json [--dry-run]
 *
 * 设计纪律：
 *   1. **幂等**：以 slug 为键，先查后写。重复跑不会产生重复记录。
 *   2. **只写发布决定 + 事实快照**：规格不进 WP（事实层是唯一真相源）。
 *   3. **不做静默降级**：任何一条失败都计数并逐条打印，退出码非 0。
 *   4. `--dry-run` 只读不写，用于上量前的预演。
 *
 * ⚠️ 本文件在 scripts/ 里（进 git），执行时需临时拷进容器挂载目录。
 *    容器内路径必须可读，因为 PHP CLI 要在容器里跑。
 */

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "只允许 CLI 运行\n");
    exit(1);
}

$jsonPath = $argv[1] ?? '';
$dryRun = in_array('--dry-run', $argv, true);
/**
 * `--prune`：删除**本包中已不存在**的 wheel_model 记录。
 *
 * 为什么需要：本工具是幂等的「以包为准」同步，但包变小（例如选择器改了合并语义）时，
 * 只做 upsert 会在库里留下过期记录 —— 那些记录仍带着 approved 状态，
 * 于是「已下线」的型号会继续出现在公开集合里。
 *
 * ⚠️ 这是**破坏性操作**，会永久删除未列入本包的记录（含人工建的）。
 *    仅在「以本包为唯一真相源」的场景使用；默认不开启。
 */
$prune = in_array('--prune', $argv, true);

if ($jsonPath === '' || !is_readable($jsonPath)) {
    fwrite(STDERR, "用法：php wp-import-wheels.php <package.json> [--dry-run]\n");
    exit(1);
}

require_once '/var/www/html/wp-load.php';

const FH_IMPORT_POST_TYPE = 'wheel_model';

$payload = json_decode((string) file_get_contents($jsonPath), true);
if (!is_array($payload) || !isset($payload['records']) || !is_array($payload['records'])) {
    fwrite(STDERR, "无法解析导入包：{$jsonPath}\n");
    exit(1);
}

/** 找已存在的记录（按 slug）。 */
function fh_find_by_slug(string $slug): int
{
    $ids = get_posts([
        'post_type'      => FH_IMPORT_POST_TYPE,
        'name'           => $slug,
        'post_status'    => 'any',
        'numberposts'    => 1,
        'fields'         => 'ids',
        'no_found_rows'  => true,
    ]);

    return $ids ? (int) $ids[0] : 0;
}

$created = 0;
$updated = 0;
$failed = [];
$total = count($payload['records']);

echo str_repeat('─', 66), "\n";
printf("导入包：%s\n", basename($jsonPath));
printf("记录数：%d%s\n", $total, $dryRun ? '（dry-run，不写入）' : '');
echo str_repeat('─', 66), "\n";

foreach ($payload['records'] as $i => $rec) {
    $n = $i + 1;
    $slug    = (string) ($rec['slug'] ?? '');
    $model   = (string) ($rec['model'] ?? '');
    $title   = (string) ($rec['title'] ?? $model);
    $status  = (string) ($rec['postStatus'] ?? 'draft');
    $decis   = (array) ($rec['decision'] ?? []);
    $facts   = (array) ($rec['facts'] ?? []);
    $taxes   = (array) ($rec['taxonomies'] ?? []);

    if ($slug === '' || $model === '') {
        $failed[] = "第 {$n} 条：slug 或 model 为空";
        continue;
    }

    $existingId = fh_find_by_slug($slug);

    if ($dryRun) {
        printf("  [%3d/%d] %-12s %s\n", $n, $total, $model, $existingId ? "已存在(#{$existingId}) → 将更新" : '不存在 → 将新建');
        $existingId ? $updated++ : $created++;
        continue;
    }

    $postarr = [
        'post_type'   => FH_IMPORT_POST_TYPE,
        'post_title'  => $title,
        'post_name'   => $slug,
        'post_status' => $status,
    ];
    if ($existingId) {
        $postarr['ID'] = $existingId;
    }

    $postId = wp_insert_post($postarr, true);
    if (is_wp_error($postId)) {
        $failed[] = "{$model}: " . $postId->get_error_message();
        continue;
    }
    $postId = (int) $postId;
    $existingId ? $updated++ : $created++;

    // 发布决定
    foreach ($decis as $key => $value) {
        update_post_meta($postId, (string) $key, is_scalar($value) ? (string) $value : '');
    }
    // 事实快照
    foreach ($facts as $key => $value) {
        update_post_meta($postId, (string) $key, is_scalar($value) ? (string) $value : '');
    }

    // 分类法
    if (!empty($taxes['wheel_diameter']) && is_array($taxes['wheel_diameter'])) {
        wp_set_object_terms($postId, array_map('strval', $taxes['wheel_diameter']), 'wheel_diameter');
    }
    if (!empty($taxes['wheel_process']) && is_array($taxes['wheel_process'])) {
        wp_set_object_terms($postId, array_map('strval', $taxes['wheel_process']), 'wheel_process');
    }

    if ($n % 25 === 0 || $n === $total) {
        printf("  … %d/%d\n", $n, $total);
    }
}

// 清理包外记录
$pruned = 0;
if ($prune && !$dryRun) {
    $inPackage = [];
    foreach ($payload['records'] as $rec) {
        $inPackage[] = (string) ($rec['slug'] ?? '');
    }
    $existing = get_posts([
        'post_type'      => FH_IMPORT_POST_TYPE,
        'post_status'    => 'any',
        'numberposts'    => -1,
        'fields'         => 'ids',
        'no_found_rows'  => true,
    ]);
    foreach ($existing as $id) {
        $slug = (string) get_post_field('post_name', $id);
        if (!in_array($slug, $inPackage, true)) {
            wp_delete_post($id, true);
            $pruned++;
        }
    }
}

echo str_repeat('─', 66), "\n";
printf("新建 %d ｜ 更新 %d ｜ 删除 %d ｜ 失败 %d\n", $created, $updated, $pruned, count($failed));
if ($failed) {
    foreach ($failed as $f) {
        echo "  ✗ {$f}\n";
    }
}

if (!$dryRun) {
    $q = new WP_Query([
        'post_type'      => FH_IMPORT_POST_TYPE,
        'post_status'    => 'any',
        'posts_per_page' => 1,
        'fields'         => 'ids',
    ]);
    printf("库内 wheel_model 总数：%d\n", $q->found_posts);
}

exit($failed ? 1 : 0);
