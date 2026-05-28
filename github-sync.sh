#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  github-sync.sh — Quantum Social Media Platform
#  Kullanım: bash github-sync.sh
#  Gereksinim: GITHUB_PAT Replit Secrets'a eklenmiş olmalı
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

REPO_URL="https://github.com/TurkYoshi1905/quantum-social-media-platform.git"
BRANCH="main"
COMMIT_MSG="sync: $(date '+%Y-%m-%d %H:%M:%S')"

# ── GITHUB_PAT kontrolü ──────────────────────────────────────────────────────
if [ -z "${GITHUB_PAT:-}" ]; then
  echo ""
  echo "❌  GITHUB_PAT bulunamadı."
  echo "    Replit → Secrets bölümüne GITHUB_PAT adıyla token'ınızı ekleyin."
  echo ""
  exit 1
fi

AUTH_URL="https://${GITHUB_PAT}@github.com/TurkYoshi1905/quantum-social-media-platform.git"

echo ""
echo "══════════════════════════════════════════"
echo "  🚀  Quantum → GitHub Sync"
echo "══════════════════════════════════════════"
echo ""

# ── Git kimliği ──────────────────────────────────────────────────────────────
git config user.email "quantum-sync@replit.app" 2>/dev/null || true
git config user.name  "Quantum Sync"             2>/dev/null || true

# ── Remote ayarla ────────────────────────────────────────────────────────────
if git remote get-url origin &>/dev/null; then
  git remote set-url origin "$AUTH_URL"
  echo "✔  Remote güncellendi"
else
  git remote add origin "$AUTH_URL"
  echo "✔  Remote eklendi"
fi

# ── Değişiklikleri stage'e al ────────────────────────────────────────────────
git add -A

if git diff --cached --quiet; then
  echo "ℹ️   Commit edilecek yeni değişiklik yok."
else
  git commit -m "$COMMIT_MSG"
  echo "✔  Commit oluşturuldu: $COMMIT_MSG"
fi

# ── Push (önce normal, başarısız olursa rebase ile) ──────────────────────────
echo ""
echo "📤 GitHub'a gönderiliyor → branch: $BRANCH"
echo ""

if git push origin "$BRANCH" 2>&1; then
  echo ""
  echo "✅  Başarıyla GitHub'a yüklendi!"
  echo "    $REPO_URL"
else
  echo ""
  echo "⚠️   Normal push başarısız. Uzak değişiklikler çekiliyor..."
  git pull --rebase --allow-unrelated-histories origin "$BRANCH" || {
    echo ""
    echo "❌  Rebase sırasında çakışma oluştu."
    echo "    Lütfen çakışmaları manuel olarak çözün ve tekrar çalıştırın."
    exit 1
  }
  git push origin "$BRANCH"
  echo ""
  echo "✅  Rebase sonrası başarıyla yüklendi!"
  echo "    $REPO_URL"
fi

# ── Temizlik: PAT URL'ini güvenli URL ile değiştir ───────────────────────────
git remote set-url origin "$REPO_URL"
echo ""
echo "🔒  Remote URL güvenli hale getirildi (PAT temizlendi)"
echo "══════════════════════════════════════════"
echo ""
