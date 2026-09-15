<?php
// 誤り報告の管理画面(一覧表示+対応状況の更新)
// 使い方: report_admin.php?key=<ADMIN_KEY>  ※設置時に必ずADMIN_KEYを変更すること
$ADMIN_KEY = (string)(@include __DIR__ . '/report_key.php');  // report_key.php(コミット禁止)が無ければ403

$FILE = __DIR__ . '/reports/reports.jsonl';
// キー検証: 未設定・短すぎ・include戻り値の事故(int 1等)をすべて403に。比較はタイミング攻撃耐性のあるhash_equals
if (!is_string($ADMIN_KEY) || strlen($ADMIN_KEY) < 16
    || $ADMIN_KEY === 'CHANGE-ME-BEFORE-DEPLOY'
    || !hash_equals($ADMIN_KEY, (string)($_GET['key'] ?? ''))) {
    http_response_code(403);
    exit('403 Forbidden');
}

// 対応状況の更新(読込→変更→書込を単一のロック区間で行い、report.phpの追記との競合による消失を防ぐ)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['id'], $_POST['status'])) {
    $ok = ['未対応', '確認中', '対応済み', '却下'];
    if (in_array($_POST['status'], $ok, true) && is_file($FILE)) {
        $fh = fopen($FILE, 'c+');
        if ($fh && flock($fh, LOCK_EX)) {
            $rows = [];
            while (($line = fgets($fh)) !== false) {
                $r = json_decode(trim($line), true);
                if ($r) $rows[] = $r;
            }
            foreach ($rows as &$r) {
                if ($r['id'] === $_POST['id']) $r['status'] = $_POST['status'];
            }
            unset($r);
            $out = '';
            foreach ($rows as $r) $out .= json_encode($r, JSON_UNESCAPED_UNICODE) . "\n";
            rewind($fh);
            ftruncate($fh, 0);
            fwrite($fh, $out);
            fflush($fh);
            flock($fh, LOCK_UN);
        }
        if ($fh) fclose($fh);
    }
    header('Location: report_admin.php?key=' . urlencode($ADMIN_KEY));
    exit;
}

// 表示用の読込
$rows = [];
if (is_file($FILE)) {
    foreach (file($FILE, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $r = json_decode($line, true);
        if ($r) $rows[] = $r;
    }
}
$h = fn($s) => htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8');
usort($rows, fn($a, $b) => strcmp($b['ts'], $a['ts']));
$pending = count(array_filter($rows, fn($r) => ($r['status'] ?? '') === '未対応'));
?>
<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8"><meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer">
<title>誤り報告 管理(都か区か国か)</title>
<style>
body{font-family:system-ui,sans-serif;background:#f9f9f7;color:#0b0b0b;margin:20px;}
table{border-collapse:collapse;width:100%;background:#fff;font-size:13px;}
th,td{border:1px solid #e1e0d9;padding:6px 8px;text-align:left;vertical-align:top;}
th{background:#f0efec;}
.s-未対応{background:#fbeeee;} .s-対応済み{background:#eef7ee;} .s-却下{color:#898781;}
select,button{font-size:12px;padding:2px 6px;}
a{word-break:break-all;}
</style></head><body>
<h1 style="font-size:18px;">誤り報告 一覧(<?= count($rows) ?>件 / 未対応 <?= $pending ?>件)</h1>
<table>
<tr><th>日時</th><th>施設名</th><th>現在の答え</th><th>修正内容</th><th>根拠URL</th><th>状態</th></tr>
<?php foreach ($rows as $r): ?>
<tr class="s-<?= $h($r['status'] ?? '') ?>">
<td><?= $h($r['ts']) ?></td>
<td><b><?= $h($r['facility']) ?></b><br><small><?= $h($r['muni'] ?? '') ?></small></td>
<td><?= $h($r['answer'] ?? '') ?><br><small><?= $h($r['admin'] ?? '') ?></small></td>
<td><?= nl2br($h($r['detail'])) ?></td>
<td><a href="<?= $h($r['url']) ?>" target="_blank" rel="noopener noreferrer nofollow"><?= $h($r['url']) ?></a></td>
<td>
<form method="post" style="display:flex;gap:4px;">
<input type="hidden" name="id" value="<?= $h($r['id']) ?>">
<select name="status">
<?php foreach (['未対応','確認中','対応済み','却下'] as $s): ?>
<option value="<?= $s ?>" <?= ($r['status'] ?? '') === $s ? 'selected' : '' ?>><?= $s ?></option>
<?php endforeach; ?>
</select>
<button type="submit">更新</button>
</form>
</td>
</tr>
<?php endforeach; ?>
</table>
</body></html>
