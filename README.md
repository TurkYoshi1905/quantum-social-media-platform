# ⚡ Quantum — Sosyal Medya Platformu

<div align="center">

**Fikirlerin ışık hızında yayıldığı yer.**

*Twitter ve Instagram'ın özünü birleştiren, ancak tasarım olarak tamamen özgün, premium ve modern bir sosyal medya deneyimi.*

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-latest-FF0055?style=flat-square&logo=framer)](https://www.framer.com/motion)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)

</div>

---

## 📖 Hakkında

Quantum, dijital dünyada konuşmaları ve içerikleri daha anlamlı kılmak için tasarlanmış açık kaynaklı bir sosyal medya platformudur. Klasik sosyal medya deneyimini, lüks ve minimalist bir estetikle yeniden yorumlar. Her etkileşim titizlikle tasarlanmış; her animasyon amaca hizmet eder.

Proje; **React 19.2**, **TypeScript**, **Tailwind CSS v4** ve **Supabase** üzerine inşa edilmiştir. Tüm veriler gerçek zamanlı olarak Supabase PostgreSQL veritabanında saklanır — gerçek bir platform deneyimi sıfırdan başlar ve büyür.

---

## ✨ Özellikler

### 🔐 Kimlik Doğrulama
- E-posta/şifre ile kayıt ve giriş — Supabase Auth entegrasyonu
- **Google OAuth** ile tek tıkla giriş
- Kayıt sırasında anlık **kullanıcı adı benzersizlik kontrolü** (veritabanı sorgusu + animasyonlu hata)
- E-posta doğrulama akışı: premium bekleme sayfası → doğrulama → otomatik yönlendirme
- Hem kullanıcı adı hem e-posta ile giriş desteği
- Oturum Supabase session'ıyla yönetilir — sayfa kapatılsa bile korunur

### 🏠 Ana Sayfa & Feed
- Gerçek zamanlı feed — Supabase Realtime ile anlık güncelleme
- Başlık, içerik ve resim ekleyebilen gönderi oluşturucu
- **Beğeni**: animasyonlu kalp, anlık sayaç güncellemesi
- **Yorum**: açılır alan, kendi yorumlarını silme
- **Yeniden Gönderi**: dönen animasyonlu ikon
- **Görüntülenme** sayacı
- Kendi gönderini silme (onay dialogu)
- Tüm veriler Supabase'de kalıcı — mock veri yok

### 👤 Profil Sayfası
- Gradient banner ve profil fotoğrafı alanı
- **Premium Avatar Modal**: sürükle & bırak + dosya seç, canlı önizleme, Supabase'e kayıt
- Görünen ad, kullanıcı adı, katılım tarihi, takip edilen/takipçi sayıları
- 5 sekmeli içerik: **Gönderiler · Yeniden Gönderiler · Yanıtlar · Medya · Beğeniler**
- Sekme verileri Supabase'den çekilir
- Sekme geçişlerinde akıcı AnimatePresence animasyonu
- Mobil: çıkış yap butonu görünür

### 🔔 Bildirimler
- Gerçek zamanlı bildirim akışı — Supabase Realtime subscription
- **Beğeni**, **Yorum**, **Yeniden Gönderi**, **Takip** bildirimleri — her biri ayrı renk ve ikon
- Okunmamış bildirim sayacı (Sidebar + BottomNav badge)
- "Tümünü okundu işaretle" butonu
- Boş durum: animasyonlu empty state

### 🧭 Keşfet
- Gerçek Supabase sorgusuyla **gönderi arama** (içerik içinde arama)
- **Kullanıcı arama** (kullanıcı adı ve görünen ada göre)
- Arama sonucu sekmeli: Gönderiler / Kişiler
- Kişi kartlarında **Takip Et / Bırak** (Supabase follows tablosu)
- Arama yokken beğeni sayısına göre sıralı öne çıkan gönderiler

### 📐 Navigasyon
- Masaüstü: Sol kenar çubuğu — logo, sayfalar, okunmamış bildirim badge, kullanıcı kartı, çıkış butonu
- Mobil: Alt navigasyon — bildirim badge dahil tüm sayfalar
- Tüm sayfalar korumalıdır; giriş yapılmadan erişilemez

### 🎨 Tasarım & Animasyon
- **Dark-first premium tema** — koyu arka plan, elektrik moru vurgu rengi
- **Montserrat** yalnızca "Quantum" logo ve marka başlıklarında (`font-display`)
- **Inter** tüm diğer arayüz elemanlarında (`font-sans`)
- Framer Motion ile sayfa geçişleri, mikro-etkileşimler, AnimatePresence mount/unmount
- `whileTap`, `whileHover` her etkileşimli elementte
- Tam responsive — masaüstü ve mobilde kusursuz

---

## 🗂 Proje Yapısı

```
artifacts/quantum/src/
├── App.tsx                      # Routing, ProtectedRoute, AuthRoute
├── context/
│   └── AuthContext.tsx          # Supabase Auth state + profil yönetimi
├── lib/
│   └── supabase.ts              # Supabase client + TypeScript DB tipleri
├── data/
│   └── mockData.ts              # Legacy tip tanımları (geriye dönük uyumluluk)
├── pages/
│   ├── AuthPage.tsx             # Giriş/Kayıt + e-posta doğrulama bekleme
│   ├── EmailVerifiedPage.tsx    # E-posta doğrulama başarı animasyonu
│   ├── HomePage.tsx             # Realtime feed + gönderi oluşturucu
│   ├── ProfilePage.tsx          # Profil + sekme verileri + avatar modal
│   ├── ExplorePage.tsx          # Supabase arama (gönderi + kişi) + takip
│   ├── NotificationsPage.tsx    # Gerçek zamanlı bildirimler
│   └── MessagesPage.tsx         # Mesajlar (yakında)
└── components/
    ├── PostCard.tsx              # Gönderi kartı — beğeni/yorum/repost/silme
    ├── PostComposer.tsx          # Gönderi oluşturma alanı
    ├── AvatarModal.tsx           # Premium avatar yükleme modalı (sürükle & bırak)
    ├── Sidebar.tsx               # Masaüstü navigasyon + realtime bildirim badge
    └── BottomNav.tsx             # Mobil alt navigasyon + realtime bildirim badge
schema.sql                        # Supabase veritabanı şeması (tümü)
```

---

## 🗄 Veritabanı Şeması

| Tablo | Açıklama |
|---|---|
| `profiles` | Kullanıcı profilleri — auth.users ile bağlı, trigger ile otomatik oluşturulur |
| `posts` | Gönderiler — likes/reposts/comments/views sayaçlarıyla |
| `comments` | Yorumlar — post ile bağlı |
| `likes` | Beğeniler — unique(post_id, user_id) kısıtı |
| `reposts` | Yeniden gönderiler — unique(post_id, user_id) kısıtı |
| `follows` | Takip ilişkileri — kendini takip etme kısıtı |
| `notifications` | Gerçek zamanlı bildirimler — like/repost/comment/follow türleri |

Tüm tablolarda **Row Level Security (RLS)** aktif. Sayaç güncellemeleri ve bildirim oluşturma **PostgreSQL trigger**'larıyla otomatik yapılır.

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 24+
- pnpm

### Geliştirme Ortamını Başlatma

```bash
# Bağımlılıkları yükle
pnpm install

# Quantum uygulamasını çalıştır (port 5000)
pnpm --filter @workspace/quantum run dev
```

### Supabase Kurulumu

1. [Supabase Dashboard](https://supabase.com/dashboard/project/dtitryfpcciyudmbcihc) → **SQL Editor**'ı açın
2. `schema.sql` dosyasının tüm içeriğini kopyalayıp yapıştırın
3. **Run** butonuna tıklayın — tablolar, trigger'lar ve Realtime yayınları oluşturulur

### Ortam Değişkenleri (Replit Secrets)

| Secret | Açıklama |
|---|---|
| `VITE_SUPABASE_ANON_KEY` | Supabase anonim API anahtarı (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase servis rol anahtarı (gizli) |
| `GITHUB_PAT` | GitHub Personal Access Token (sync için) |

---

## 🔄 GitHub'a Senkronizasyon

Projeyi GitHub'a yüklemek için `github-sync.sh` betiği hazır:

```bash
bash github-sync.sh
```

Betik otomatik olarak:
- Tüm dosyaları stage'e alır ve commit oluşturur
- GitHub'a push eder (force kullanmaz)
- Uzak değişiklikler varsa rebase ile birleştirir
- Push sonrası PAT'i URL'den temizler

> **Not:** `GITHUB_PAT` Replit Secrets'ta tanımlı olmalıdır. Shell sekmesinden çalıştırın.

---

## 🛠 Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Framework | React 19.2 |
| Dil | TypeScript 5.9 |
| Build Aracı | Vite 7 |
| Stil | Tailwind CSS v4 |
| Animasyon | Framer Motion |
| Routing | wouter |
| Backend | Supabase (Auth + PostgreSQL + Realtime + Storage) |
| Paket Yöneticisi | pnpm (monorepo) |
| İkonlar | lucide-react, react-icons/si |
| Fontlar | Montserrat, Inter (Google Fonts) |

---

## 📋 Mimari Kararlar

- **Supabase Backend:** Auth, veritabanı, realtime ve storage tek platformda. Ayrı bir backend sunucusu gerektirmez.
- **RLS (Row Level Security):** Her tablo için politikalar tanımlı; kullanıcılar yalnızca kendi verilerini değiştirebilir.
- **PostgreSQL Trigger'lar:** Beğeni/yorum/repost/takip işlemleri sayaçları ve bildirimleri otomatik günceller — uygulama katmanında manuel sayım yok.
- **Realtime Subscriptions:** posts, notifications tabloları Supabase Realtime kanallarıyla anlık dinlenir.
- **Optimistic UI:** Beğeni ve repost işlemleri önce UI'da güncellenir, sonra veritabanına yazılır — gecikme hissi ortadan kalkar.
- **AvatarModal:** Bağımsız bileşen dosyası (`AvatarModal.tsx`) — yeniden kullanılabilir, sürükle & bırak destekli.
- **Dark-first tema sistemi:** CSS custom properties ile tutarlı renk sistemi; tüm bileşenler karanlık paleti otomatik kullanır.
- **Font ayrımı:** `font-display` (Montserrat) yalnızca "Quantum" logosunda; `font-sans` (Inter) diğer her şeyde.

---

## 🤝 Katkıda Bulunma

1. Bu repoyu fork edin
2. Yeni bir branch oluşturun: `git checkout -b ozellik/yeni-ozellik`
3. Değişikliklerinizi commit edin: `git commit -m "feat: yeni özellik eklendi"`
4. Branch'inizi push edin: `git push origin ozellik/yeni-ozellik`
5. Pull Request açın

---

## 📄 Lisans

Bu proje MIT Lisansı kapsamında lisanslanmıştır. Ayrıntılar için `LICENSE` dosyasına bakın.

---

<div align="center">

**Quantum** — Fikirlerin ışık hızında yayıldığı yer.

*Replit üzerinde React + TypeScript + Supabase ile geliştirildi.*

</div>
