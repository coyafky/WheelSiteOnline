#!/usr/bin/env php
<?php
/** 只读验证独立语言 Page v2 契约；可传四语言预期状态逗号串，不修改数据。 */

declare(strict_types=1);

$origin = $argv[1] ?? 'http://127.0.0.1:8081';
$expected = isset($argv[2]) ? explode(',', $argv[2]) : [];
$cases = [
    ['key' => 'home', 'locale' => 'en'],
    ['key' => 'home', 'locale' => 'zh'],
    ['key' => 'home', 'locale' => 'es'],
    ['key' => 'home', 'locale' => 'th'],
];

foreach ($cases as $index => $case) {
    $url = $origin . '/wp-json/fh/v2/pages?key=' . rawurlencode($case['key']) . '&locale=' . rawurlencode($case['locale']);
    $body = file_get_contents($url);
    if ($body === false) throw new RuntimeException("请求失败：{$url}");
    $payload = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
    $status = (string) ($payload['status'] ?? '');
    if (($payload['authoritative'] ?? false) !== true
        || !in_array($status, ['ready', 'missing-locale', 'unpublished', 'withdrawn'], true)
        || (isset($expected[$index]) && $status !== $expected[$index])
        || ($status === 'ready' && (!isset($payload['item']['page']['content']['modules']) || count($payload['item']['page']['content']['modules']) !== 5))
        || ($status !== 'ready' && isset($payload['item']))) {
        throw new RuntimeException("契约不符合预期：{$url} -> {$body}");
    }
    echo "✅ {$case['key']} × {$case['locale']}：{$status}\n";
}

$invalidUrl = $origin . '/wp-json/fh/v2/pages?key=home&locale=fr';
$context = stream_context_create(['http' => ['ignore_errors' => true]]);
$invalidBody = file_get_contents($invalidUrl, false, $context);
$statusLine = $http_response_header[0] ?? '';
if (!str_contains($statusLine, ' 400 ') || !str_contains((string) $invalidBody, 'fh_pages_invalid_locale')) {
    throw new RuntimeException("非法语言未返回 400：{$statusLine} {$invalidBody}");
}
echo "✅ 非法语言：400 / fh_pages_invalid_locale\n";
