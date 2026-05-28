# Quantum — Social Media Platform

Quantum, Twitter ve Instagram'ın temel mantığını birleştiren; premium dark-first tasarıma, Framer Motion animasyonlarına, Supabase backend entegrasyonuna ve gerçek zamanlı bildirim sistemine sahip tam işlevsel bir sosyal medya platformu web uygulamasıdır.

## Run & Operate

- `pnpm --filter @workspace/quantum run dev` — Quantum frontend geliştirme sunucusunu çalıştır (port 5000)
- `pnpm run typecheck` — tüm paketlerde tam tip kontrolü
- `pnpm run build` — typecheck + tüm paketleri derle
- `bash github-sync.sh` — projeyi GitHub'a senkronize et (Shell sekmesinden çalıştırılmalı, GITHUB_PAT gerekli)

## Stack

- **Frontend:** React 19, TypeScript, Vite 7
- **Backend:** Supabase (Auth, PostgreSQL, Realtime, Storage)
- **Styling:** Tailwind CSS v4, Framer Motion
- **Routing:** wouter
- **Fonts:** Montserrat (logo/marka), Inter (tüm diğer metinler)
- **Icons:** lucide-react, react-icons/si
- **State:** React Context + Supabase Auth
- **Workspace:** pnpm monorepo, Node.js 24, TypeScript 5.9

## Supabase Yapılandırması

- **URL:** https://dtitryfpcciyudmbcihc.supabase.co
- **VITE_SUPABASE_ANON_KEY** — Replit Secrets'ta saklanır (public key, build'e gömülür)
- **SUPABASE_SERVICE_ROLE_KEY** — Replit Secrets'ta saklanır (asla client'a expose edilmez)
- **schema.sql** — Tüm tablo yapıları, trigger'lar ve Realtime ayarları

## Where things live

```
artifacts/quantum/src/
├── App.tsx                      # Routing + ProtectedRoute + AuthRoute + loading states
├── context/AuthContext.tsx      # Supabase auth state + profile yönetimi
├── lib/supabase.ts              # Supabase client + TypeScript tipleri (anon key fallback)
├── data/mockData.ts             # Legacy tip tanımları (geriye dönük uyumluluk)
├── pages/
│   ├── AuthPage.tsx             # Giriş/Kayıt + e-posta doğrulama bekleme
│   ├── EmailVerifiedPage.tsx    # E-posta doğrulama başarı sayfası + oto-yönlendirme
│   ├── HomePage.tsx             # Feed + PostComposer (Supabase realtime)
│   ├── ProfilePage.tsx          # Profil + sekme verileri + AvatarModal entegrasyonu
│   ├── ExplorePage.tsx          # Supabase arama (gönderi + kişi) + takip et/bırak
│   ├── NotificationsPage.tsx    # Gerçek zamanlı bildirimler + okundu işaretleme
│   └── MessagesPage.tsx         # Mesajlar (yakında)
├── components/
│   ├── PostCard.tsx             # Gönderi kartı (UUID, AvatarFallback, yorum silme)
│   ├── PostComposer.tsx         # Gönderi oluşturma (AvatarFallback)
│   ├── AvatarModal.tsx          # Premium avatar modal — sürükle & bırak, önizleme, kaydet
│   ├── Sidebar.tsx              # Masaüstü navigasyon + realtime bildirim badge
│   └── BottomNav.tsx            # Mobil navigasyon + realtime bildirim badge
└── index.css                    # Tema (dark palette), Google Fonts import
schema.sql                       # Supabase veritabanı şeması (tablolar + triggerlar + RLS)
```

## Architecture Decisions

- **Supabase Auth:** E-posta/şifre + Google OAuth. Kullanıcı kayıt olduğunda trigger ile profil otomatik oluşturulur.
- **E-posta Doğrulama:** Kayıt sonrası doğrulama e-postası gönderilir. Kullanıcı linke tıklayınca `/auth/verified` sayfasına yönlendirilir.
- **Kullanıcı adı ile giriş:** Login formunda hem e-posta hem kullanıcı adı kabul edilir.
- **Realtime:** posts, notifications tabloları Supabase Realtime ile canlı dinlenir.
- **Trigger'lar:** like/repost/comment/follow işlemleri sayaçları ve bildirimleri otomatik günceller.
- **Optimistic UI:** Beğeni/repost anlık UI'da güncellenir, sonra DB'ye yazılır.
- **VITE_SUPABASE_ANON_KEY fallback:** supabase.ts env var'ı önce okur, yoksa hardcoded public key'e düşer — production build hatası olmaz.
- **AvatarModal ayrı dosya:** `components/AvatarModal.tsx` — bağımsız, yeniden kullanılabilir.
- **Dark-first tema:** CSS custom properties ile tam karanlık paleti.
- **Font ayrımı:** `font-display` (Montserrat) yalnızca "Quantum" logolarında; `font-sans` (Inter) diğer her şeyde.
- **Avatar fallback:** Boşsa initials gösterilir. AvatarModal ile sürükle-bırak yükleme desteklenir.
- **Bildirim badge:** Sidebar ve BottomNav'da okunmamış bildirim sayısı realtime güncellenir.

## Veritabanı Tabloları

| Tablo | Açıklama |
|-------|----------|
| `profiles` | Kullanıcı profilleri (auth.users ile ilişkili, trigger ile otomatik oluşturulur) |
| `posts` | Gönderiler (likes/reposts/comments/views sayaçları dahil) |
| `comments` | Yorumlar |
| `likes` | Beğeniler (unique: post_id + user_id) |
| `reposts` | Yeniden gönderiler (unique: post_id + user_id) |
| `follows` | Takip ilişkileri (kendini takip etme kısıtı) |
| `notifications` | Gerçek zamanlı bildirimler (like/repost/comment/follow türleri) |

## Product

- **Auth:** E-posta/şifre veya Google OAuth ile kayıt/giriş
- **E-posta doğrulama:** Premium bekleme sayfası → doğrulama → otomatik yönlendirme
- **Kullanıcı adı kontrolü:** Kayıt sırasında anlık veritabanı kontrolü + animasyonlu hata kutusu
- **Feed:** Gerçek zamanlı; beğeni/repost/yorum anlık güncellenir, optimistic UI
- **Profil:** AvatarModal (sürükle-bırak), sekmeli içerik (Supabase'den), bio, istatistikler
- **Bildirimler:** Gerçek zamanlı; okundu işaretleme, badge sayacı Sidebar + BottomNav'da
- **Keşfet:** Supabase ile gönderi ve kişi arama, takip et/bırak
- **GitHub sync:** Shell sekmesinden `bash github-sync.sh` ile GITHUB_PAT üzerinden push

## Feature & Page Development Standards

**Her yeni sayfa veya özellik aşağıdaki standartları eksiksiz karşılamalıdır.**

### Tasarım
- **Premium his:** Lüks, temiz ve özgün. Hardcoded renk yok — sadece `index.css` CSS variables.
- **Dark-first:** Tüm bileşenler dark tema üzerine.
- **Tipografi:** "Quantum" → `font-display` (Montserrat). Diğer her şey → `font-sans` (Inter).
- **İkonlar:** `lucide-react` genel, `react-icons/si` marka logoları. Emoji yok.

### Responsive
- Her sayfa hem mobil hem masaüstü — Sidebar (md:flex) + BottomNav (md:hidden).
- Mobil breakpoint önce: `sm:`, `md:`, `lg:`.

### Animasyon
- Framer Motion zorunlu. `AnimatePresence` mount/unmount için.
- `whileTap`, `whileHover` mikro-etkileşimler.
- Animasyon süresi 0.15–0.3s.

### İşlevsellik
- Tüm butonlar çalışır. Boş handler yok.
- Supabase entegrasyonu zorunlu — localStorage veri tutma yok.
- Realtime subscriptions gerektiğinde eklenir.
- Empty state: ikon + başlık + açıklama.

### Kod Kalitesi
- `any` tip yasak. Kullanılmayan import yasak.
- `data-testid` tüm interaktif elementlerde.
- Yeni sayfa: `App.tsx` route + `Sidebar.tsx` + `BottomNav.tsx` güncellemesi.

## User Preferences

- Quantum kelimesi her zaman Montserrat fontu ile yazılır.
- Tüm diğer metinler Inter fontu kullanır.
- Uygulama dark mod varsayılanıyla açılır.
- Mock veri yoktur; platform gerçekten Supabase'den büyür.
- GitHub senkronizasyonu Shell sekmesinden `bash github-sync.sh` ile yapılır.

## Gotchas

- `index.css`'in ilk satırı mutlaka Google Fonts `@import url(...)` olmalı.
- Quantum workflow'u port `5000` kullanır.
- Supabase tabloları `schema.sql` dosyasındaki SQL ile Supabase SQL Editor'da çalıştırılarak kurulur.
- `bash github-sync.sh` Shell sekmesinden çalıştırılmalı — agent sandbox'ı git write işlemlerini kısıtlar.
- `VITE_SUPABASE_ANON_KEY` Replit Secrets'ta olmalı; yoksa `supabase.ts` hardcoded public key'e düşer.
- `git commit` / `git push` agent tarafından çalıştırılamaz; Shell sekmesinden yapılır.

## Pointers

- GitHub repo: https://github.com/TurkYoshi1905/quantum.git
- Supabase Dashboard: https://supabase.com/dashboard/project/dtitryfpcciyudmbcihc
