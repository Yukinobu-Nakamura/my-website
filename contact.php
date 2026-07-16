<?php
/**
 * contact.php - お問い合わせ/ボランティア申し込みフォーム送信処理
 * さくらレンタルサーバー対応
 */

// ---- 設定 ----
define('MAIL_TO',      'info@nakamura-yukinobu.jp');  // 受信メールアドレス
define('MAIL_FROM',    'noreply@nakamura-yukinobu.jp'); // 送信元アドレス
define('SITE_NAME',    '中村幸信 公式サイト');

// ---- CORS(テスト環境 GitHub Pages からの送信を許可) ----
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
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ---- ヘッダー設定 ----
header('Content-Type: application/json; charset=UTF-8');

// ---- POSTのみ許可 ----
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

// ---- 入力値取得・サニタイズ ----
function sanitize(string $val): string {
    return htmlspecialchars(trim($val), ENT_QUOTES, 'UTF-8');
}

$type = sanitize($_POST['type'] ?? 'contact');

if ($type === 'volunteer') {
    // ボランティア申し込みフォーム
    $name    = sanitize($_POST['vol_name']    ?? '');
    $email   = sanitize($_POST['vol_email']   ?? '');
    $message = sanitize($_POST['vol_message'] ?? '');
    $subjectLabel = 'ボランティア申し込み';
    $messageRequired = false;
} else {
    // お問い合わせフォーム
    $name    = sanitize($_POST['name']    ?? '');
    $email   = sanitize($_POST['email']   ?? '');
    $subject = sanitize($_POST['subject'] ?? '');
    $message = sanitize($_POST['message'] ?? '');
    $subjectMap = [
        'hp'       => 'HPについて',
        'policy'   => '政策について',
        'sns'      => 'SNSなどの発信について',
        'donation' => 'サポートについて',
        'news'     => '政治・経済のニュースについて',
        'other'    => 'その他',
    ];
    $subjectLabel = $subjectMap[$subject] ?? 'お問い合わせ';
    $messageRequired = true;
}

$privacy = isset($_POST['privacy']);

// メールヘッダインジェクション対策(Reply-To 等に使う値の改行を明示除去)
$email = str_replace(["\r", "\n", "%0a", "%0d"], '', $email);

// ---- バリデーション ----
$errors = [];
if (empty($name))                        $errors[] = 'お名前は必須です。';
if (empty($email))                       $errors[] = 'メールアドレスは必須です。';
if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'メールアドレスの形式が正しくありません。';
if ($messageRequired && empty($message)) $errors[] = 'お問い合わせ内容は必須です。';
if (!$privacy)                           $errors[] = 'プライバシーポリシーへの同意が必要です。';

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

// ---- メール送信 ----
$mailSubject = '[' . SITE_NAME . '] ' . $subjectLabel;

$messageBlock = $message !== '' ? $message : '(記載なし)';

$mailBody = <<<EOT
{$name} 様より「{$subjectLabel}」の送信がありました。

■ お名前: {$name}
■ メールアドレス: {$email}
■ 件名: {$subjectLabel}

■ 内容:
{$messageBlock}

---
このメールは nakamura-yukinobu.jp のフォームから自動送信されました。
EOT;

// 文字化け対策
mb_language('Japanese');
mb_internal_encoding('UTF-8');

$headers  = "From: " . MAIL_FROM . "\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// エンベロープ送信元を明示(-f)。省略するとサーバー既定の ～@www1361.sakura.ne.jp になり、
// SPF レコードのないホスト名のため Gmail の送信者要件(SPF/DKIM 必須)で受信拒否される。
$envelopeFrom = '-f' . MAIL_FROM;

$sent = mb_send_mail(MAIL_TO, $mailSubject, $mailBody, $headers, $envelopeFrom);

// ---- 自動返信メール ----
if ($sent) {
    $autoReplySubject = '[' . SITE_NAME . '] 送信を受け付けました';
    $autoReplyBody    = <<<EOT
{$name} 様

ご連絡いただきありがとうございます。
以下の内容で受け付けました。

■ 件名: {$subjectLabel}
■ 内容:
{$messageBlock}

内容を確認のうえ、順次ご返信いたします。
しばらくお待ちください。

---
中村幸信 公式サイト
https://nakamura-yukinobu.jp
EOT;

    $autoHeaders  = "From: " . MAIL_FROM . "\r\n";
    $autoHeaders .= "MIME-Version: 1.0\r\n";
    $autoHeaders .= "Content-Type: text/plain; charset=UTF-8\r\n";

    mb_send_mail($email, $autoReplySubject, $autoReplyBody, $autoHeaders, $envelopeFrom);
}

// ---- レスポンス ----
if ($sent) {
    echo json_encode(['success' => true, 'message' => '送信を受け付けました。']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'メール送信に失敗しました。時間をおいて再度お試しください。']);
}
