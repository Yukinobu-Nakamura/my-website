# 本番アップロード用 release フォルダの更新履歴

生成元: WSL ~/projects/my-website(gitが履歴のマスター)。
このファイルには release/ を最新化した日時・コミット・変更ファイルを記録する。

## 2026-07-19 09:21 — commit afa2ed2
- feat(seo): 検索結果表示を「中村幸信公式ホームページ」に統一(title/OGP/構造化データ)、meta descriptionを現行の掲載内容に合わせて更新
- 更新ファイル:
  - index.html
  - script.js
  - style.css

## 2026-07-19 12:41 — commit f7db600
- feat(hp): ヘッダーのロゴ名を拡大しメニュー幅を詰めて「勉強部屋」タグを追加、準備中ページ(benkyobeya.html)新設、ヒーローに勉強部屋への大型導線ボタンをイラスト付きで設置
- 更新ファイル:
  - benkyobeya.html
  - index.html
  - style.css
  - assets/img/nakamura_illust.png
  - assets/img/nakamura_illust_sm.png

## 2026-07-19 12:54 — commit fbdf182
- fix(hp): 勉強部屋ボタンをカード型UIに刷新(サブテキスト+矢印バッジ、折返し位置制御)、CSS/JSにバージョン付与でキャッシュ更新を強制
- 更新ファイル:
  - benkyobeya.html
  - index.html
  - style.css

## 2026-07-19 13:52 — commit ef617c6
- fix: スマホ表示でヒーローの2ボタン(政策を見る/お問い合わせ)を1行横並びに固定し、勉強部屋ボタンとScroll表示のかぶりを解消(max-width:767pxのみ、PC表示は変更なし)
- 更新ファイル:
  - style.css

## 2026-07-19 14:20 — commit 0a9815f
- fix: style.cssのキャッシュバスターをv=20260719cに更新(スマホ修正CSSが旧キャッシュで反映されない問題)
- 更新ファイル:
  - benkyobeya.html
  - index.html

## 2026-07-19 14:30 — commit f136479
- fix: 携帯表示で数字セクションの「働く意欲(∞)」の行高を他項目と揃え、「上場企業経験」とのラベル位置ズレを解消(max-width:767pxのみ)+キャッシュバスターをv=20260719dに更新
- 更新ファイル:
  - benkyobeya.html
  - index.html
  - style.css

## 2026-07-19 15:03 — commit bc9cf96
- fix: 数字セクション「働く意欲(∞)」のラベル位置ズレをPC版含む全画面幅で解消(∞を数字と同じ行高の箱に収める方式、タブレット帯は補正値を実測調整)+キャッシュバスターv=20260719e
- 更新ファイル:
  - benkyobeya.html
  - index.html
  - style.css

## 2026-08-02 04:33 — commit df76aec
- chore(deploy): sakura_uploadフォルダの移動(2026-08-01 Downloads整理→Google Drive)にrelease生成パスを追従、SAKURA_UPLOAD_BASE環境変数で上書き可能に
- 更新ファイル:
  - benkyobeya.html
  - index.html
  - privacy-policy.html
  - script.js
  - style.css

## 2026-08-02 — release フォルダ運用の終了
- Google Drive 側の sakura_upload/release ステージングを廃止し、本番アップは
  FileZilla から WSL リポジトリ直接参照(\\wsl.localhost\Ubuntu\home\ynakamura\projects\my-website)に一本化。
- 全ファイルがリポジトリ HEAD と一致していることを照合済み(assets・contact.php・note-feed.php 含む)。
- deploy/make-release.sh は役目を終えたため削除(必要になれば git 履歴から復元可)。

## 2026-11-23 都か区か国か 収録範囲拡張版(本番FTPアップ待ち)
- 対象3ファイル(FileZilla で `\\wsl.localhost\Ubuntu\home\ynakamura\projects\my-website\tokakuka\` → 本番 `/tokakuka/` に上書き):
  1. `tokakuka/map.html`(自治体絞り込み時の件数表示・出典/免責更新)
  2. `tokakuka/quiz.html`(出典/免責更新)
  3. `tokakuka/data/facilities.js`(10,388→11,009件。国48→383。約3.8MB)
- `report.php` `report_admin.php` `report_key.php` `data/boundaries.js` `reports/` は変更なし(触らない)
- アップ後の確認: map.html を Ctrl+F5 → 国 383 / 都道府県 857 / 市区町村 9,562 / その他 207。「豊島区」表示で 8/20/107/4、計139件。quiz.html で豊島区を選び10問が出ること
- テスト環境(github.io)は commit 8c766f7 で反映済み(Action 成功)。レビュー: legal 条件付き可→是正済み、critical 🔴8件→是正・再レビュー承認(nakamura-ws thoughts/reviews/20261120_tokakuka_*)
