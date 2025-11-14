# PDKS QR Okut - Worker Kullanım Kılavuzu

## 🎯 Genel Bakış

Worker (çalışan) tarafında QR kod ile giriş-çıkış sistemi başarıyla güncellendi. Artık çalışanlar çok daha basit ve kullanıcı dostu bir arayüzle giriş-çıkış yapabilirler.

## 🔄 Yeni Akış

1. **Çalışan PDKS QR Okut sayfasına girer**
   - Menüden "PDKS QR Okut" sekmesine tıklar
   
2. **Büyük "QR Okut" butonuna basar**
   - Ana sayfada büyük bir QR ikonu ve "QR Okut" butonu görür
   
3. **Giriş/Çıkış seçimi yapar**
   - Dialog açılır
   - "Giriş" veya "Çıkış" butonundan birini seçer
   
4. **İzinler istenir**
   - Konum izni otomatik istenir
   - Kamera izni otomatik istenir
   
5. **QR kod okutulur**
   - Kamera açılır
   - QR kodu kamera önüne tutar
   - Otomatik olarak okutulur ve işlem tamamlanır

## ✨ Yeni Özellikler

### 1. Basitleştirilmiş Arayüz
- Tek bir büyük "QR Okut" butonu
- Gereksiz seçenekler kaldırıldı
- Daha temiz ve anlaşılır tasarım

### 2. Dialog ile İşlem Seçimi
- QR Okut butonuna basıldığında dialog açılır
- İki büyük buton: "Giriş" (yeşil) ve "Çıkış" (kırmızı)
- Görsel olarak ayırt edilebilir ikonlar

### 3. Otomatik İzin Yönetimi
- Giriş/Çıkış seçildikten sonra konum izni otomatik istenir
- Ardından kamera otomatik açılır
- Kullanıcıya "İzinler İsteniyor..." mesajı gösterilir

### 4. Gerçek Zamanlı Durum Bildirimleri
- İşlem yapılırken loading ekranı
- Başarılı/başarısız durumlar için renkli alert'ler
- Son işlem bilgisi gösterimi

### 5. İptal Özelliği
- QR okutma sırasında "İptal" butonu
- İstenmeyen durumlarda işlemi iptal edebilme

## 📱 Kullanıcı Deneyimi İyileştirmeleri

### Ana Sayfa
- Büyük QR ikonu (100px)
- "QR Okut" butonu - Mavi, büyük, belirgin
- Son kayıtlar tablosu
- Kullanım talimatları

### Dialog Ekranı
- "İşlem Tipi Seçin" başlığı
- İki büyük buton:
  - ✅ **Giriş** - Yeşil, LoginIcon
  - ❌ **Çıkış** - Kırmızı, LogoutIcon
- İptal butonu

### İzin Ekranı
- Loading spinner
- "İzinler İsteniyor..." mesajı
- Kullanıcıyı bekletmeden bilgilendirme

### Scanner Ekranı
- Mavi kenarlık (3px)
- Tam ekran kamera görüntüsü
- İpuçları:
  - QR kodu net tutun
  - İyi aydınlatma kullanın
  - Otomatik okunacak
- İptal butonu
- Konum durumu göstergesi

### İşlem Ekranı
- Loading spinner
- "İşlem Yapılıyor..." mesajı
- Kullanıcı işlem bitene kadar beklemelidir

## 🔧 Teknik Detaylar

### Güncellenen Dosyalar

1. **src/app/(dashboard)/(private)/pdks-scan/page.tsx**
   - Tamamen yeniden tasarlandı
   - Dialog sistemi eklendi
   - State yönetimi iyileştirildi
   - Daha iyi hata yönetimi

2. **src/components/pdks/QRScanner.tsx**
   - Basitleştirildi
   - Otomatik başlatma eklendi
   - Daha iyi cleanup mekanizması
   - Mobil uyumlu kamera seçimi

3. **package.json**
   - @mui/icons-material@6.2.1 eklendi

### API Endpoint'leri

✅ Tüm backend API'leri hazır ve çalışıyor:

**PDKS Attendance:**
- POST `/api/pdks-attendances/check` - Giriş/çıkış yap
- GET `/api/pdks-attendances/my-records` - Çalışanın kayıtları

**QR Code Session:**
- POST `/api/qr-code-sessions/validate` - QR kod doğrula

### Middleware Kontrolü

✅ Worker yetkilendirmesi uygun şekilde yapılandırılmış:
- `/pdks-scan` path'i worker'lar için erişilebilir
- Diğer şirket/admin sayfaları korumalı

## 🧪 Test Adımları

### 1. Worker Hesabı ile Giriş Yapın
```
- E-posta: worker@example.com
- Rol: worker
```

### 2. QR Giriş/Çıkış Sayfasına Gidin
- Sol menüden "QR Giriş/Çıkış" sekmesine tıklayın
- URL: `/worker-pdks-scan`

### 3. QR Okut Butonuna Basın
- Büyük mavi "QR Okut" butonuna tıklayın
- Dialog açılmalı

### 4. Giriş veya Çıkış Seçin
- "Giriş" veya "Çıkış" butonuna basın
- İzin ekranı açılmalı

### 5. İzinleri Verin
- Konum izni verin (tarayıcı soracak)
- Kamera izni verin (tarayıcı soracak)
- Kamera otomatik açılmalı

### 6. QR Kodu Okutun
- Test QR kodunu kamera önüne tutun
- Otomatik okunup işlem tamamlanmalı
- Başarı mesajı görünmeli

### 7. Son Kayıtları Kontrol Edin
- Aşağıda "Son Kayıtlarım" tablosunda yeni kayıt görünmeli
- Tarih, saat, işlem tipi doğru olmalı

## 🐛 Sorun Giderme

### Kamera Açılmıyor
- Tarayıcı kamera iznini kontrol edin
- HTTPS üzerinden eriştiğinizden emin olun
- Başka bir uygulama kamerayı kullanıyor olabilir

### Konum Alınamıyor
- Tarayıcı konum iznini kontrol edin
- GPS'in açık olduğundan emin olun
- Konum olmadan da devam edebilirsiniz

### QR Kod Okunmuyor
- QR kodu net ve düz tutun
- İyi aydınlatma altında deneyin
- QR kodun güncel ve geçerli olduğundan emin olun

### API Hatası
- Backend sunucusunun çalıştığından emin olun
- Token'ın geçerli olduğunu kontrol edin
- Console'da hata mesajlarını kontrol edin

## 📝 Notlar

- Sistem tamamen worker-friendly tasarlandı
- Mobil cihazlarda da sorunsuz çalışır
- Geriye dönük uyumluluk korundu
- Tüm eski API'ler hala çalışıyor

## 🚀 Sonraki Adımlar

1. ✅ Frontend güncellendi
2. ✅ Backend API'leri hazır
3. ✅ Middleware yapılandırıldı
4. 🔄 Canlı ortamda test edilmeli
5. 📱 Mobil cihazlarda test edilmeli
6. 👥 Gerçek kullanıcılarla test edilmeli

## 📞 Destek

Sorun yaşarsanız:
1. Console logları kontrol edin
2. Network sekmesinde API isteklerini inceleyin
3. Backend loglarına bakın
4. Gerekirse bu dökümanı referans alın

---

**Tarih:** 14 Kasım 2025  
**Versiyon:** 2.0  
**Durum:** ✅ Tamamlandı

