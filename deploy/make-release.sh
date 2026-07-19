#!/usr/bin/env bash
# 本番(さくらサーバー)アップロード用フォルダを git リポジトリの内容で最新化する。
#   実行: bash deploy/make-release.sh
# アップロード置き場は C:\Users\ghhrt\Downloads\sakura_upload\release に一本化。
# 更新履歴は同 sakura_upload\RELEASE_HISTORY.md に追記される。
# ※ contact.php / note-feed.php はサーバー個別設定を含むため対象外(sakura_upload 直下で管理)
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
BASE="/mnt/c/Users/ghhrt/Downloads/sakura_upload"
DEST="$BASE/release"
HIST="$BASE/RELEASE_HISTORY.md"

cd "$REPO"
COMMIT=$(git rev-parse --short HEAD)
NOW=$(date '+%Y-%m-%d %H:%M')

if [ ! -d "$BASE" ]; then
  echo "ERROR: $BASE がありません(Windows側のフォルダ構成を確認してください)" >&2
  exit 1
fi
mkdir -p "$DEST"

# release/ をリポジトリの公開ファイルと完全一致させる(余分なファイルは削除)
CHANGED=$(rsync -rci --delete \
  index.html 404.html 500.html privacy-policy.html \
  style.css script.js robots.txt sitemap.xml .htaccess assets \
  "$DEST/" | awk '$1 !~ /^\./ || $1 ~ /c/ {print $2}' | grep -v '/$' || true)

# いまreleaseに入っている版の目印
{
  echo "commit: $COMMIT"
  echo "generated: $NOW"
  echo "latest: $(git log -1 --pretty='%s')"
} > "$DEST/RELEASE_INFO.txt"

# 履歴を追記(履歴順の管理はこのファイル+git log が正)
if [ ! -f "$HIST" ]; then
  printf '# 本番アップロード用 release フォルダの更新履歴\n\n生成元: WSL ~/projects/my-website(gitが履歴のマスター)。\nこのファイルには release/ を最新化した日時・コミット・変更ファイルを記録する。\n' > "$HIST"
fi
{
  echo ""
  echo "## $NOW — commit $COMMIT"
  git log -1 --pretty='- %s'
  if [ -n "$CHANGED" ]; then
    echo "- 更新ファイル:"
    echo "$CHANGED" | sed 's/^/  - /'
  else
    echo "- 変更ファイルなし(既に最新)"
  fi
} >> "$HIST"

echo "== release/ を commit $COMMIT で最新化しました =="
if [ -n "$CHANGED" ]; then
  echo "今回サーバーへアップロードが必要なファイル:"
  echo "$CHANGED" | sed 's/^/  /'
else
  echo "変更ファイルはありません。"
fi
