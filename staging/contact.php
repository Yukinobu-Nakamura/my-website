<?php
/**
 * contact.php - お問い合わせフォーム送信処理
 * さくらレンタルサーバー対応
 */

// ---- 設定 ----
define('MAIL_TO',      'info@nakamura-yukinobu.jp');  // 受信メールアドレス
define('MAIL_FROM',    'noreply@nakamura-yukinobu.jp'); // 送信元アドレス
define('SITE_NAME',    '中村幸信 Portfolio');
define('ALLOWED_ORIGIN', 'https://nakamura-yukinobu.jp');

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

$name    = sanitize($_POST['name']    ?? '');
$company = sanitize($_POST['company'] ?? '');
$email   = sanitize($_POST['email']   ?? '');
$subject = sanitize($_POST['subject'] ?? '');
$message = sanitize($_POST['message'] ?? '');
$privacy = isset($_POST['privacy'])   ? true : false;

// ---- バリデーション ----
$errors = [];
if (empty($name))                        $errors[] = 'お名前は必須です。';
if (empty($email))                       $errors[] = 'メールアドレスは必須です。';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'メールアドレスの形式が正しくありません。';
if (empty($message))                     $errors[] = 'お問い合わせ内容は必須です。';
if (!$privacy)                           $errors[] = 'プライバシーポリシーへの同意が必要です。';

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

// ---- メール送信 ----
$subjectMap = [
    'web'    => 'Webサイト制作',
    'ai'     => 'AI開発',
    'app'    => 'アプリ開発',
    'design' => 'UIデザイン',
    'other'  => 'その他',
];
$subjectLabel = $subjectMap[$subject] ?? 'お問い合わせ';

$mailSubject = '[' . SITE_NAME . '] お問い合わせ: ' . $subjectLabel;

$mailBody = <<<EOT
{$name} 様よりお問い合わせがありました。

■ お名前: {$name}
■ 会社名: {$company}
■ メールアドレス: {$email}
■ 件名: {$subjectLabel}

■ お問い合わせ内容:
{$message}

---
このメールは nakamura-yukinobu.jp のお問い合わせフォームから自動送信されました。
EOT;

// 文字化け対策
mb_language('Japanese');
mb_internal_encoding('UTF-8');

$headers  = "From: " . MAIL_FROM . "\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = mb_send_mail(MAIL_TO, $mailSubject, $mailBody, $headers);

// ---- 自動返信メール ----
if ($sent) {
    $autoReplySubject = '[' . SITE_NAME . '] お問い合わせを受け付けました';
    $autoReplyBody    = <<<EOT
{$name} 様

お問い合わせいただきありがとうございます。
以下の内容でお問い合わせを受け付けました。

■ 件名: {$subjectLabel}
■ お問い合わせ内容:
{$message}

通常2営業日以内にご返信いたします。
しばらくお待ちください。

---
中村 幸信
https://nakamura-yukinobu.jp
EOT;

    $autoHeaders  = "From: " . MAIL_FROM . "\r\n";
    $autoHeaders .= "MIME-Version: 1.0\r\n";
    $autoHeaders .= "Content-Type: text/plain; charset=UTF-8\r\n";

    mb_send_mail($email, $autoReplySubject, $autoReplyBody, $autoHeaders);
}

// ---- レスポンス ----
if ($sent) {
    echo json_encode(['success' => true, 'message' => 'お問い合わせを受け付けました。']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'メール送信に失敗しました。時間をおいて再度お試しください。']);
}
