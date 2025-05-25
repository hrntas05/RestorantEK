# 🍽️ Restoran Sipariş Takip Sistemi

Modern ve kullanıcı dostu bir restoran yönetim sistemi. React Native ve Expo ile geliştirilmiş,birr mobil uygulama.

## 📱 Proje Hakkında

Bu proje Sistem Analizi dersi için hazırlanmıştır, restoran işletmelerinin günlük operasyonlarını dijitalleştirmek için tasarlanmış çözümdür. Garsonlar, şefler ve yöneticiler için ayrı arayüzler sunarak restoran süreçlerini optimize eder.

### ✨ Temel Özellikler

- **🔐 Rol Tabanlı Giriş Sistemi** - Admin, Garson ve Şef rolleri
- **📋 Masa Yönetimi** - 5 farklı masa durumu (Boş, Dolu, Rezerve, Temizlik, Bakım)
- **🍕 Menü Yönetimi** - Kategori bazlı menü düzenleme
- **📝 Sipariş Takibi** - Gerçek zamanlı sipariş durumu güncellemeleri
- **👥 Personel Yönetimi** - Garson ekleme/düzenleme/silme
- **📅 Rezervasyon Sistemi** - Müşteri rezervasyonları ve masa entegrasyonu
- **📊 Gelir Raporları** - Günlük, haftalık, aylık satış analizleri


## 🏗️ Proje Yapısı

```
RestorantEK/
├── src/
│   ├── components/          # Yeniden kullanılabilir bileşenler
│   ├── screens/            # Uygulama ekranları
│   │   ├── LoginScreen.js          # Giriş ekranı
│   │   ├── AdminScreen.js          # Yönetici ana paneli
│   │   ├── ChefScreen.js           # Şef sipariş takip ekranı
│   │   ├── WaiterTablesScreen.js   # Garson masa seçim ekranı
│   │   ├── WaiterMenuScreen.js     # Garson menü ve sipariş ekranı
│   │   ├── MenuManagementScreen.js # Menü yönetim ekranı
│   │   ├── WaiterManagementScreen.js # Personel yönetim ekranı
│   │   ├── TableManagementScreen.js # Masa yönetim ekranı
│   │   ├── ReservationManagementScreen.js # Rezervasyon yönetimi
│   │   └── ReportsScreen.js        # Gelir raporları ekranı
│   ├── context/            # Global state yönetimi
│   │   └── AppContext.js           # React Context API
│   ├── services/           # Veri işleme servisleri
│   │   └── dataService.js          # AsyncStorage işlemleri
│   ├── data/              # Başlangıç verileri
│   │   └── initialData.js          # Test verileri ve varsayılan değerler
│   └── utils/             # Yardımcı fonksiyonlar
├── App.js                 # Ana uygulama ve navigasyon
├── package.json           # Proje bağımlılıkları
└── README.md             # Bu dosya
```

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler

- Node.js (v14 veya üzeri)
- npm veya yarn
- Expo CLI
- Android Studio (Android için) veya Xcode (iOS için)
- Android 11 üzeri harhangi bir telefon


## 👥 Kullanıcı Rolleri ve Giriş Bilgileri

### 🔑 Demo Hesapları

| Rol | Kullanıcı Adı | Şifre | Açıklama |
|-----|---------------|-------|----------|
| **Yönetici** | `admin` | `admin` | Tüm sistem erişimi |
| **Garson** | `garson1` | `123456` | Masa ve sipariş yönetimi |

## 📋 Özellik Detayları

### 🏢 Yönetici Paneli
- **Dashboard:** Hızlı istatistikler ve genel bakış
- **Şef Paneli Erişimi:** Sipariş durumlarını görüntüleme
- **Menü Yönetimi:** Ürün ekleme, düzenleme, silme, kategori yönetimi
- **Personel Yönetimi:** Garson hesapları oluşturma ve yönetme
- **Masa Yönetimi:** Masa durumlarını değiştirme ve takip etme
- **Rezervasyon Yönetimi:** Müşteri rezervasyonları ve masa entegrasyonu
- **Gelir Raporları:** Detaylı satış analizleri ve istatistikler

### 👨‍🍳 Şef Paneli
- **Sipariş Listesi:** Tüm aktif siparişleri görüntüleme
- **Durum Filtreleme:** Bekleyen, hazırlanan, hazır siparişler
- **Sipariş Detayları:** Ürünler, miktarlar, özel notlar
- **Durum Güncelleme:** Sipariş durumunu değiştirme (Bekliyor → Hazırlanıyor → Hazır → Tamamlandı)
- **Zaman Takibi:** Sipariş sürelerini görüntüleme

### 👨‍💼 Garson Arayüzü
- **Masa Seçimi:** Müsait masaları görüntüleme ve seçme
- **Menü Görüntüleme:** Kategori bazlı ürün listesi
- **Sipariş Alma:** Sepete ürün ekleme, miktar ayarlama
- **Sipariş Notu:** Özel istekler için not ekleme
- **Sipariş Gönderme:** Mutfağa sipariş iletme

### 📊 Gelir Raporları
- **Dönem Seçimi:** Bugün, Bu Hafta, Bu Ay
- **Gelir Özeti:** Toplam gelir, sipariş sayısı, ortalama sipariş değeri
- **En Çok Satan Ürünler:** Top 5 ürün listesi
- **Saatlik Analiz:** 24 saatlik satış dağılımı
- **Detaylı İstatistikler:** Çeşitli performans metrikleri

### 🪑 Masa Yönetimi
- **5 Masa Durumu:**
  - 🟢 **Boş (Available):** Müşteri bekliyor
  - 🔴 **Dolu (Occupied):** Müşteri var
  - 🟡 **Rezerve (Reserved):** Rezervasyon var
  - 🔵 **Temizlik (Cleaning):** Temizleniyor
  - ⚫ **Bakım (Maintenance):** Bakımda

### 📅 Rezervasyon Sistemi
- **Müşteri Bilgileri:** Ad, telefon, kişi sayısı
- **Masa Seçimi:** Kapasite kontrolü ile masa atama
- **Tarih/Saat:** Rezervasyon zamanlaması
- **Durum Takibi:** Onaylandı, Geldi, Tamamlandı, İptal
- **Otomatik Entegrasyon:** Masa durumları ile senkronizasyon



### AsyncStorage Kullanımı
- **Kalıcı Veri:** Uygulama kapatılsa bile veriler korunur
- **Hızlı Erişim:** Anında veri yükleme
- **Güvenli Depolama:** Şifrelenmiş yerel depolama


## 🎨 Tasarım ve UI/UX

### Renk Paleti
- **Admin:** Mor (#8e44ad, #9b59b6)
- **Şef:** Turuncu (#e67e22, #d35400)
- **Garson:** Mavi (#3498db, #2980b9)
- **Başarı:** Yeşil (#27ae60)
- **Hata:** Kırmızı (#e74c3c)

### Tasarım Prensipleri
- **Responsive Design:** Tüm ekran boyutlarına uyumlu
- **Intuitive Navigation:** Kolay navigasyon
- **Visual Feedback:** Anlık geri bildirimler
- **Accessibility:** Erişilebilir tasarım
- **Modern UI:** Güncel tasarım trendleri

## 🔧 Teknik Detaylar

### Kullanılan Teknolojiler
- **Frontend:** React Native + Expo
- **State Management:** React Context API + useReducer
- **Navigation:** React Navigation v6
- **Local Storage:** AsyncStorage
- **UI Components:** React Native Elements, React Native Paper
- **Icons:** React Native Vector Icons

### Performans Optimizasyonları
- **Lazy Loading:** İhtiyaç duyulduğunda veri yükleme
- **Memoization:** Gereksiz re-render'ları önleme
- **Efficient Updates:** Sadece değişen bileşenleri güncelleme
- **Image Optimization:** Optimized görsel kullanımı

## 📱 Platform Desteği

- ✅ **Android** 
- ✅ **iOS** 
- ✅ **Web**

## 🧪 Test Verileri

Uygulama test edilebilmesi için örnek verilerle gelir:

### Menü Öğeleri
- Adana Kebap (85₺)
- Tavuk Şiş (75₺)
- Mercimek Çorbası (25₺)
- Çoban Salata (35₺)
- Ayran (15₺)
- Çay (8₺)

### Masalar
- 10 adet masa (2-8 kişilik kapasiteler)
- Çeşitli durumlarda örnek masalar

### Siparişler
- 7 adet örnek sipariş
- Farklı durumlarda siparişler
- Gerçekçi fiyat hesaplamaları


## 📞 İletişim

Proje hakkında sorularınız için:
- **Email:** [harun.tas0501.com]
- **Ögrenci e-postası** [2023512401@ogr.cu.edu.tr]


## 🙏 Teşekkürler
- Yiğithan Özhan
- Harun Kuni
- Süleyman Doğan


 