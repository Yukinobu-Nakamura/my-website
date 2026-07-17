<?php
/**
 * note-feed.php - note記事一覧の自前プロキシ(さくらレンタルサーバー用)
 *
 * note API v2 をサーバー側で取得して15分キャッシュし、
 * サイト(本番/GitHub Pagesプレビュー)へCORS付きJSONで返す。
 * 全記事に自動生成アイキャッチ(eyecatch)が付くため、
 * RSS(ヘッダー画像あり記事のみthumbnail)よりサムネイル取得が確実。
 */

define('NOTE_USERNAME', 'cpa_man_10969');
define('CACHE_FILE', sys_get_temp_dir() . '/note_feed_v2_' . NOTE_USERNAME . '.json');
define('CACHE_TTL', 900); // 15分
define('MAX_PAGES', 10);   // note APIは1ページ=6件。10ページ=最新60件まで遡る
define('MAX_ITEMS', 60);
define('DESC_LEN', 200);   // 一覧カード用の抜粋。全文を返すとJSONが肥大するため切り詰める

// ---- CORS(contact.php と同じ許可リスト) ----
$allowedOrigins = [
    'https://nakamura-yukinobu.jp',
    'https://www.nakamura-yukinobu.jp',
    'https://yukinobu-nakamura.github.io',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: public, max-age=300');

// ---- キャッシュが新しければそのまま返す ----
if (is_readable(CACHE_FILE) && (time() - filemtime(CACHE_FILE)) < CACHE_TTL) {
    readfile(CACHE_FILE);
    exit;
}

// ---- note API v2 から取得 ----
// 1ページ=最新6件のみのため、MAX_PAGESまで遡って取得してマージする。
// カテゴリフィルタはクライアント側でタグ判定するので、母集団を広く返す。
function fetch_note_page(int $page): ?array {
    $url = 'https://note.com/api/v2/creators/' . NOTE_USERNAME . '/contents?kind=note&page=' . $page;
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT        => 8,
        CURLOPT_USERAGENT      => 'nakamura-yukinobu.jp feed proxy',
    ]);
    $body = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($body === false || $code !== 200) return null;
    $json = json_decode($body, true);
    if (!is_array($json) || !isset($json['data']['contents'])) return null;
    return $json['data'];
}

function fetch_note_api(): ?array {
    $all = [];
    for ($page = 1; $page <= MAX_PAGES; $page++) {
        $data = fetch_note_page($page);
        if ($data === null) break;
        $all = array_merge($all, $data['contents']);
        if (!empty($data['isLastPage']) || empty($data['contents']) || count($all) >= MAX_ITEMS) break;
    }
    return $all !== [] ? $all : null;
}

function to_items(array $contents): array {
    $items = [];
    foreach (array_slice($contents, 0, MAX_ITEMS) as $c) {
        $tags = [];
        foreach (($c['hashtags'] ?? []) as $h) {
            $name = $h['hashtag']['name'] ?? $h['name'] ?? '';
            if ($name !== '') $tags[] = ltrim($name, '#');
        }
        $desc = trim(preg_replace('/\s+/u', ' ', strip_tags($c['body'] ?? '')));
        $items[] = [
            'title'     => $c['name'] ?? '無題',
            'link'      => $c['noteUrl'] ?? ('https://note.com/' . NOTE_USERNAME . '/n/' . ($c['key'] ?? '')),
            'desc'      => mb_substr($desc, 0, DESC_LEN),
            'tags'      => $tags,
            'imgUrl'    => ($c['eyecatch'] ?? '') !== '' ? $c['eyecatch'] : ($c['thumbnailExternalUrl'] ?? ''),
            'publishAt' => $c['publishAt'] ?? '',
        ];
    }
    return $items;
}

$contents = fetch_note_api();

if ($contents !== null) {
    $payload = json_encode(
        ['success' => true, 'items' => to_items($contents), 'fetchedAt' => date('c')],
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );
    @file_put_contents(CACHE_FILE, $payload, LOCK_EX);
    echo $payload;
    exit;
}

// ---- 取得失敗: 期限切れでもキャッシュがあれば代替で返す ----
if (is_readable(CACHE_FILE)) {
    readfile(CACHE_FILE);
    exit;
}

http_response_code(502);
echo json_encode(['success' => false, 'message' => 'note APIから取得できませんでした。'], JSON_UNESCAPED_UNICODE);
