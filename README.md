# ⚡ Quantum — Sosyal Medya Platformu

<div align="center">

**Fikirlerin ışık hızında yayıldığı yer.**

*Twitter ve Instagram'ın özünü birleştiren, ancak tasarım olarak tamamen özgün, premium ve modern bir sosyal medya deneyimi.*

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-latest-FF0055?style=flat-square&logo=framer)](https://www.framer.com/motion)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)

</div>

---

## 📖 Hakkında

Quantum, dijital dünyada konuşmaları ve içerikleri daha anlamlı kılmak için tasarlanmış açık kaynaklı bir sosyal medya platformu prototipidir. Klasik sosyal medya deneyimini, lüks ve minimalist bir estetikle yeniden yorumlar. Her etkileşim titizlikle tasarlanmış; her animasyon amaca hizmet eder.

Proje; **React 19.2**, **TypeScript** ve **Tailwind CSS v4** üzerine inşa edilmiştir. Tüm veriler tarayıcı state'inde tutulur — arka uca gerek yoktur. Gerçek bir platform deneyimi sıfırdan başlar ve büyür.

---

## ✨ Özellikler

### 🔐 Kimlik Doğrulama
- Animasyonlu geçişle Giriş / Kayıt formları arasında anında geçiş
- E-Posta ile kayıt: görünen ad, kullanıcı adı doğrulaması (yalnızca küçük harf, rakam ve özel karakter), şifre
- Google simülasyonu ile hızlı kayıt (e-posta otomatik dolu gelir)
- Tüm şifre alanlarında çalışan görünürlük toggle butonu
- Kullanıcı adı anlık doğrulama ve hata mesajı
- **Oturum localStorage'a kaydedilir** — sayfa kapatılsa bile giriş korunur

### 🏠 Ana Sayfa & Feed
- Tamamen boş başlayan gerçek platform deneyimi
- Başlık, içerik ve resim ekleyebilen gönderi oluşturucu
- Yeni gönderiler feed'in en üstüne animasyonla eklenir
- Her gönderi kartında: **Beğeni** (animasyonlu kalp), **Yorum** (açılır alan), **Yeniden Gönderi**, **Görüntülenme**
- Yorumlar anlık olarak post'a eklenir

### 👤 Profil Sayfası
- Gradient banner ve üst üste gelen profil fotoğrafı alanı
- Hover'da beliren kamera ikonu ile fotoğraf değiştirme (tarayıcı önizlemesi)
- Görünen ad, kullanıcı adı ve katılım tarihi
- Takip Edilen / Takipçi istatistikleri
- **Kendini takip etme** mümkün değildir
- 5 sekmeli içerik gezinmesi: Gönderiler · Yeniden Gönderiler · Yanıtlar · Medya · Beğeniler
- Sekme geçişlerinde akıcı AnimatePresence animasyonu

### 🧭 Navigasyon
- Masaüstü: Sol kenar çubuğu — logo, tüm sayfalar, kullanıcı bilgisi ve çıkış butonu
- Mobil: Alt navigasyon çubuğu — Ana Sayfa, Keşfet, Bildirimler, Mesajlar, Profil
- Tüm sayfalar korumalıdır; giriş yapılmadan erişilemez

### 📐 Tasarım & Animasyon
- **Dark-first premium tema** — koyu lacivert arka plan, elektrik moru vurgu rengi
- **Montserrat** yalnızca "Quantum" logo ve marka başlıklarında
- **Inter** tüm diğer arayüz elemanlarında
- Framer Motion ile sayfa ve bileşen geçişleri, mikro-etkileşimler
- Tam responsive — masaüstü ve mobilde kusursuz çalışır

---

## 🗂 Proje Yapısı

```
artifacts/quantum/src/
├── App.tsx                    # Yönlendirme ve genel sarmalayıcılar
├── context/
│   └── AuthContext.tsx        # Kimlik doğrulama + localStorage kalıcılığı
├── data/
│   └── mockData.ts            # Post ve Comment tip tanımları
├── pages/
│   ├── AuthPage.tsx           # Giriş ve kayıt sayfası
│   ├── HomePage.tsx           # Feed ve gönderi oluşturucu
│   ├── ProfilePage.tsx        # Kullanıcı profili
│   ├── ExplorePage.tsx        # Keşfet ve arama
│   ├── NotificationsPage.tsx  # Bildirimler
│   └── MessagesPage.tsx       # Mesajlar
└── components/
    ├── PostCard.tsx            # Gönderi kartı bileşeni
    ├── PostComposer.tsx        # Gönderi oluşturma alanı
    ├── Sidebar.tsx             # Masaüstü navigasyon
    └── BottomNav.tsx           # Mobil alt navigasyon
```

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 24+
- pnpm

### Geliştirme ortamını başlatma

```bash
# Bağımlılıkları yükle
pnpm install

# Quantum uygulamasını çalıştır
pnpm --filter @workspace/quantum run dev
```

Uygulama `http://localhost:19259` adresinde çalışacaktır.

---

## 🔄 GitHub'a Senkronizasyon

Projeyi GitHub'a yüklemek için `github-sync.sh` betiği hazır:

```bash
bash github-sync.sh
```

Betik çalışmadan önce **GITHUB_PAT** environment değişkenini Replit Secrets'a eklemeniz gerekir:

1. Replit'te **Secrets** panelini açın
2. `GITHUB_PAT` adında yeni bir secret oluşturun
3. GitHub üzerinden oluşturduğunuz Personal Access Token'ı değer olarak girin
4. `bash github-sync.sh` komutunu çalıştırın

Betik otomatik olarak:
- Tüm dosyaları stage'e alır ve commit oluşturur
- GitHub'a push eder (force kullanmaz)
- Uzak değişiklikler varsa rebase ile birleştirir
- Push sonrası PAT'i URL'den temizler

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
| Paket Yöneticisi | pnpm (monorepo) |
| İkonlar | lucide-react, react-icons |
| Fontlar | Montserrat, Inter (Google Fonts) |

---

## 📋 Mimari Kararlar

- **Sıfır backend:** Tüm uygulama durumu React state'inde yönetilir; sunucu bağımlılığı yoktur.
- **localStorage kalıcılığı:** Oturum bilgisi `quantum_user` anahtarıyla tarayıcıda saklanır; yenileme sonrası korunur.
- **Dark-first tema sistemi:** CSS custom properties ile tutarlı renk sistemi; tüm bileşenler karanlık paleti otomatik kullanır.
- **Tip güvenliği:** `Post` ve `Comment` tip tanımları merkezi bir dosyada tutulur; tüm bileşenler bu tipleri kullanır.
- **Modüler mimari:** Her sayfa ve bileşen bağımsız dosyada; değişiklikler diğer bileşenleri etkilemez.

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

*Replit üzerinde React + TypeScript ile geliştirildi.*

</div>
