# Quantum — Social Media Platform

Quantum, Twitter ve Instagram'ın temel mantığını birleştiren; premium dark-first tasarıma, Framer Motion animasyonlarına ve tam işlevsel React state yönetimine sahip bir sosyal medya platformu web uygulamasıdır.

## Run & Operate

- `pnpm --filter @workspace/quantum run dev` — Quantum frontend geliştirme sunucusunu çalıştır
- `pnpm run typecheck` — tüm paketlerde tam tip kontrolü
- `pnpm run build` — typecheck + tüm paketleri derle
- `bash github-sync.sh` — projeyi GitHub'a senkronize et (GITHUB_PAT gerekli)

## Stack

- **Frontend:** React 19.2, TypeScript, Vite
- **Styling:** Tailwind CSS v4, Framer Motion
- **Routing:** wouter
- **Fonts:** Montserrat (logo/marka), Inter (tüm diğer metinler)
- **Icons:** lucide-react, react-icons/si
- **State:** React Context + localStorage kalıcılığı
- **Workspace:** pnpm monorepo, Node.js 24, TypeScript 5.9

## Where things live

```
artifacts/quantum/src/
├── App.tsx                    # Routing + AuthProvider sarmalayıcı
├── context/AuthContext.tsx    # Auth state, localStorage kalıcılığı
├── data/mockData.ts           # Post ve Comment tip tanımları
├── pages/
│   ├── AuthPage.tsx           # Giriş/Kayıt formu (animasyonlu geçiş)
│   ├── HomePage.tsx           # Feed + PostComposer
│   ├── ProfilePage.tsx        # Profil, sekmeler, avatar yükleme
│   ├── ExplorePage.tsx        # Arama / Keşfet
│   ├── NotificationsPage.tsx  # Bildirimler
│   └── MessagesPage.tsx       # Mesajlar
├── components/
│   ├── PostCard.tsx           # Gönderi kartı (beğeni, yorum, repost)
│   ├── PostComposer.tsx       # Gönderi oluşturma alanı
│   ├── Sidebar.tsx            # Masaüstü sol navigasyon
│   └── BottomNav.tsx          # Mobil alt navigasyon
└── index.css                  # Tema (dark palette), Google Fonts import
```

## Architecture decisions

- **Frontend-only:** Tüm veri React state'inde tutulur, backend veya API yoktur.
- **localStorage auth:** Kullanıcı oturumu `quantum_user` anahtarıyla localStorage'a kaydedilir; sayfa yenilendiğinde oturum kaybolmaz.
- **Dark-first tema:** CSS custom properties ile tam karanlık paleti (`hsl(225 15% 8%)` arka plan, `hsl(258 90% 66%)` primary vurgu).
- **Font ayrımı:** `font-display` (Montserrat) yalnızca "Quantum" logolarında; `font-sans` (Inter) tüm diğer arayüz elemanlarında zorlanır.
- **Framer Motion:** Tüm form geçişleri, tab animasyonları, PostCard mount/unmount için `AnimatePresence` kullanılır.

## Product

- Hesap oluşturma: E-posta veya Google simülasyonu ile kayıt (localStorage'a kaydedilir)
- Feed: Sıfırdan başlayan boş platform; kullanıcı ilk gönderiyi kendisi oluşturur
- Gönderi etkileşimi: Beğeni toggle (animasyon), yorum açma/kapama, repost toggle, görüntülenme
- Profil: Avatar yükleme önizlemesi, katılım tarihi, sekmeli içerik (Gönderiler, YG, Yanıtlar, Medya, Beğeniler)
- Navigasyon: Masaüstü sidebar + mobil alt navigasyon (Keşfet, Bildirimler, Mesajlar, Profil)
- GitHub sync: `bash github-sync.sh` ile GITHUB_PAT üzerinden otomatik push

## Feature & Page Development Standards

**Her yeni sayfa veya özellik aşağıdaki standartları eksiksiz karşılamalıdır. Bu kurallar pazarlık konusu değildir.**

### Tasarım
- **Premium his:** Arayüz lüks, temiz ve özgün olmalı. Başka uygulamaların kopyası olmamalı. Her eleman kasıtlı ve özenle yerleştirilmiş görünmeli.
- **Dark-first:** Tüm bileşenler dark tema üzerine inşa edilir. Renkler `index.css`'teki CSS custom properties kullanılarak tanımlanır; hardcoded renk yazılmaz.
- **Tipografi kuralına uyum:** "Quantum" kelimesi yalnızca `font-display` (Montserrat) ile yazılır. Diğer tüm metinler `font-sans` (Inter) kullanır. İstisnasız.
- **İkon tutarlılığı:** `lucide-react` genel ikonlar için, `react-icons/si` marka/şirket logoları için kullanılır. Emoji kullanılmaz.

### Responsive (Mobil + Masaüstü)
- **Her sayfa hem mobilde hem masaüstünde kusursuz çalışmalıdır.** Biri için yapılıp diğeri için bırakılamaz.
- Masaüstünde `Sidebar` bileşeni gösterilir (`hidden md:flex`).
- Mobilde `BottomNav` bileşeni gösterilir (`md:hidden`, `fixed bottom-0`).
- Mobil taşma (`overflow`) sorunları önceden önlenir: yatay scroll gereken alanlarda `overflow-x-auto scrollbar-hide`, uzun metinlerde `whitespace-nowrap` veya `truncate` kullanılır.
- Breakpoint sırası: mobil önce (`sm:`, `md:`, `lg:`).

### Animasyon
- **Framer Motion zorunludur.** Bileşen mount/unmount için `AnimatePresence` kullanılır.
- Sayfalar arası geçişler, form geçişleri, tab değişimleri, liste öğeleri — hepsi animasyonlu olmalıdır.
- Mikro-etkileşimler: buton tıklaması (`whileTap`), hover efektleri (`whileHover`), sayı/ikon değişimi animasyonları.
- Animasyonlar kasıtlı ve hızlı olmalı (genellikle `duration: 0.15–0.3`). Yavaş veya dekoratif amaçsız animasyon kabul edilmez.
- `layout` prop ile konum geçişleri pürüzsüz yapılır.

### İşlevsellik
- **Tüm butonlar ve etkileşimli alanlar çalışır durumda olmalıdır.** "Yakında" veya boş handler kabul edilmez.
- State yönetimi React `useState` / `useContext` ile yapılır. Gerekirse `localStorage`'a kaydedilir.
- Form validasyonu anlık (`onChange`) olmalı; hata mesajları inline ve animasyonlu gösterilmelidir.
- Boş durumlar (`empty state`) her liste/feed için tasarlanmalı: ikon + başlık + açıklama.
- Loading/skeleton state gerektiğinde eklenir.

### Kod Kalitesi
- Her sayfa `src/pages/`, her bileşen `src/components/` altında ayrı dosyada olmalıdır.
- TypeScript tip güvenliği eksiksiz olmalı; `any` kullanılmaz.
- Kullanılmayan import yazılmaz (build hatası verir).
- `data-testid` attribute'u tüm interaktif elementlere eklenir.
- Yeni sayfa eklendikten sonra `App.tsx`'e route ve `Sidebar.tsx` + `BottomNav.tsx`'e nav linki eklenmelidir.

## User preferences

- Quantum kelimesi her zaman Montserrat fontu ile yazılır.
- Tüm diğer metinler Inter fontu kullanır.
- Uygulama dark mod varsayılanıyla açılır.
- Kendini takip etme özelliği yoktur (Takip Et butonu kendi profilinde görünmez).
- Mock veri yoktur; platform gerçekten sıfırdan büyür.
- GitHub senkronizasyonu için `GITHUB_PAT` Replit Secrets'a eklenmelidir.

## Gotchas

- `index.css`'in ilk satırı mutlaka Google Fonts `@import url(...)` olmalı — PostCSS başka türlü hata verir.
- Quantum workflow'u port `19259` kullanır; port çakışmasında workflow'u restart et.
- `github-sync.sh` çalıştırmadan önce `GITHUB_PAT` secret'ının Replit'e eklendiğinden emin ol.
- `bash github-sync.sh` kullan — `./github-sync.sh` değil (execute permission gerekmez).

## Pointers

- pnpm workspace yapısı için `pnpm-workspace` skill'ini incele.
- GitHub repo: https://github.com/TurkYoshi1905/quantum-social-media-platform.git
