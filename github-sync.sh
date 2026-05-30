#!/bin/bash

# Değişkenler
REPO_URL="https://TurkYoshi1905:${GITHUB_PAT}@github.com/TurkYoshi1905/quantum.git"
TEMP_DIR="/tmp/github_sync_$$"
WORKSPACE="/home/runner/workspace"

echo ""
echo "══════════════════════════════════════════"
echo "  🚀  Quantum → GitHub Sync"
echo "══════════════════════════════════════════"
echo ""

if [ -z "${GITHUB_PAT:-}" ]; then
  echo "❌  GITHUB_PAT bulunamadı."
  echo "    Replit → Secrets bölümüne GITHUB_PAT ekleyin."
  exit 1
fi

echo "GitHub'tan clone ediliyor..."
rm -rf "$TEMP_DIR"
git clone "$REPO_URL" "$TEMP_DIR"
cd "$TEMP_DIR"

# Git kullanıcı ayarları
git config user.email "asfurkan140@gmail.com"
git config user.name "TurkYoshi1905"

echo "Dosyalar güncelleniyor..."

# Klasörleri kopyala
cp -r "$WORKSPACE/artifacts"  "$TEMP_DIR/"
[ -d "$WORKSPACE/lib" ]      && cp -r "$WORKSPACE/lib"      "$TEMP_DIR/"
[ -d "$WORKSPACE/.github" ]  && cp -r "$WORKSPACE/.github"  "$TEMP_DIR/"

# Tekil dosyaları kopyala
for f in \
  package.json pnpm-lock.yaml pnpm-workspace.yaml \
  tsconfig.json tsconfig.base.json \
  vercel.json netlify.toml \
  schema.sql \
  README.md replit.md \
  LICENSE .gitignore .gitattributes \
  github-sync.sh; do
  [ -f "$WORKSPACE/$f" ] && cp "$WORKSPACE/$f" "$TEMP_DIR/$f"
done

# node_modules ve dist klasörlerini sil (GitHub'a gitmemeli)
find "$TEMP_DIR" -name "node_modules" -type d -prune -exec rm -rf {} + 2>/dev/null || true
find "$TEMP_DIR" -name "dist" -type d -prune -exec rm -rf {} + 2>/dev/null || true

COMMIT_MSG="${1:-sync: $(date '+%Y-%m-%d %H:%M:%S')}"

# Commit
git add -A
git diff-index --quiet HEAD && echo "ℹ️   Değişiklik yok, commit atlanıyor." || git commit -m "$COMMIT_MSG"

echo ""
echo "📤 GitHub'a yükleniyor → main"
echo ""

git push origin main

STATUS=$?
if [ $STATUS -eq 0 ]; then
  echo ""
  echo "✅  Başarıyla GitHub'a yüklendi!"
  echo "    https://github.com/TurkYoshi1905/quantum"
else
  echo ""
  echo "❌  Push başarısız! (Çıkış kodu: $STATUS)"
fi

# Temizlik
rm -rf "$TEMP_DIR"
echo ""
echo "══════════════════════════════════════════"
echo ""
