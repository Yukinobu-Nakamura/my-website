# 本番用「準備中」ページ(勉強部屋の一時繰り下げ)

作成: 2026-08-05 / 目的: 勉強部屋を本番公開から一時的に繰り下げる

## 現在の運用状態(2026-08-05〜)

勉強部屋(講座)は**まだ開発中**のため、本番(さくら)では「準備中」ページに戻し、
フルの講座はテスト環境(GitHub Pages・パスワード保護)だけで見られる状態にしている。

| 場所 | benkyobeya.html | benkyobeya_hp_kouza.html |
|---|---|---|
| リポジトリ / テスト環境 | フル版(一覧+講座リンク) | フル講座 |
| 本番(さくら www/) | **この準備中ページ** | **削除(置かない)** |

- テスト環境は `preview.yml` がリポジトリから自動ビルドするので、フル版のまま(一般公開はパスワードで防いでいる)。
- 本番はFileZilla手動アップのみ。リポジトリと分離しているので、本番だけ準備中にできる。

## 本番を「準備中」に戻す手順(FileZilla)

1. このフォルダの `benkyobeya.html` を さくら `www/benkyobeya.html` に**上書きアップロード**
2. さくら `www/benkyobeya_hp_kouza.html` を**リモート削除**(右クリック→削除)
3. 確認: `https://nakamura-yukinobu.jp/benkyobeya.html` が「現在開発中です」/
   `https://nakamura-yukinobu.jp/benkyobeya_hp_kouza.html` が 404

※CSS変更なし=キャッシュバスター更新不要。トップの「勉強部屋」ボタンはこの準備中ページに着地する。

## 本公開する時の手順(将来)

1. リポジトリ root の `benkyobeya.html`(フル版)と `benkyobeya_hp_kouza.html` を www/ にアップ
2. noindex解除(両ファイルの `<meta name="robots" content="noindex">` を削除)
3. `sitemap.xml` に2ページ追加 + Google Search Console で再クロール依頼
4. このフォルダ(`_honban_junbichu/`)は不要になるので削除してよい

**注意**: 本公開まで、上書き用に使う benkyobeya.html は「root のフル版」ではなく
必ずこのフォルダの準備中版を使うこと(取り違えると講座が再公開される)。
