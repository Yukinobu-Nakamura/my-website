<?php
// 「都か区か国か」クイズ誤り報告の受付エンドポイント
// 受信内容は reports/reports.jsonl に1行1件で追記(プール)。
// 管理・閲覧は report_admin.php?key=<ADMIN_KEY> で行う。
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

$DIR = __DIR__ . '/reports';
$FILE = $DIR . '/reports.jsonl';
$MAX_PER_IP_PER_DAY = 20;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false]);
    exit;
}
$raw = file_get_contents('php://input');
if (strlen($raw) > 5000) { http_response_code(413); echo json_encode(['ok' => false]); exit; }
$d = json_decode($raw, true);
if (!is_array($d)) { http_response_code(400); echo json_encode(['ok' => false]); exit; }

$facility = mb_substr(trim((string)($d['facility'] ?? '')), 0, 200);
$detail   = mb_substr(trim((string)($d['detail'] ?? '')), 0, 1000);
$url      = mb_substr(trim((string)($d['url'] ?? '')), 0, 500);
if ($facility === '' || $detail === '' || !preg_match('#^https?://.+\..+#', $url)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'invalid']);
    exit;
}

if (!is_dir($DIR)) {
    mkdir($DIR, 0755, true);
}
// .htaccess は毎回存在確認(手動でディレクトリを作った場合の抜け防止)
if (!is_file($DIR . '/.htaccess')) {
    file_put_contents($DIR . '/.htaccess', "Require all denied\nDeny from all\n");
}

// 簡易レート制限(IPハッシュで1日上限)。秘密ランダムソルト併用で元IPの復元を防止
$saltFile = $DIR . '/.salt';
if (!is_file($saltFile)) {
    file_put_contents($saltFile, bin2hex(random_bytes(32)));
    @chmod($saltFile, 0600);
}
$salt = trim((string)file_get_contents($saltFile));
$iphash = substr(hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . date('Y-m-d') . $salt), 0, 12);
$today = date('Y-m-d');
$count = 0;
if (is_file($FILE)) {
    foreach (file($FILE, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $r = json_decode($line, true);
        if ($r && ($r['iphash'] ?? '') === $iphash && strpos($r['ts'] ?? '', $today) === 0) $count++;
    }
}
if ($count >= $MAX_PER_IP_PER_DAY) { http_response_code(429); echo json_encode(['ok' => false]); exit; }

$rec = [
    'id' => uniqid('rep_'),
    'ts' => date('Y-m-d H:i:s'),
    'facility' => $facility,
    'detail' => $detail,
    'url' => $url,
    'answer' => mb_substr((string)($d['answer'] ?? ''), 0, 20),
    'admin' => mb_substr((string)($d['admin'] ?? ''), 0, 100),
    'muni' => mb_substr((string)($d['muni'] ?? ''), 0, 30),
    'page' => mb_substr((string)($d['page'] ?? ''), 0, 20),
    'status' => '未対応',
    'iphash' => $iphash,
];
file_put_contents($FILE, json_encode($rec, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);
echo json_encode(['ok' => true]);
