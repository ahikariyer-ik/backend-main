# Token Expire Sorunu - PDKS QR Okut Sayfası

## 🔴 SORUN

Terminal loglarında şu görünüyor:
```
GET /login?from=%2Fpdks-scan 200 in 617ms
```

Bu demek oluyor ki:
1. `/pdks-scan` sayfasına gitmeye çalışıyorsunuz
2. Middleware token kontrolü yapıyor
3. Token yoksa veya geçersizse `/login` sayfasına yönlendiriyor
4. Login sayfası cookie'den user bilgisini görüyor
5. Worker olduğunuz için otomatik `/worker-dashboard`'a yönlendiriyor

## ✅ ÇÖZÜM

### 1. Tamamen Logout Olun

Sol üst köşeden (veya sağ üst) **Çıkış** butonuna tıklayın.

### 2. Browser Cache'i Temizleyin

- `Ctrl + Shift + Delete`
- **Çerezler ve diğer site verileri** ✅
- **Önbelleğe alınmış resimler ve dosyalar** ✅
- **Verileri temizle**

### 3. Tekrar Worker Olarak Giriş Yapın

1. `http://localhost:3001/login` adresine gidin
2. Worker **email** ve **şifre** ile giriş yapın
3. Başarılı giriş sonrası `/worker-dashboard` açılmalı

### 4. PDKS QR Okut'a Tıklayın

Sol menüden **"PDKS QR Okut"** butonuna tıklayın.

## 🎯 ARTIK ÇALIŞMALI!

Çünkü:
- ✅ axios kuruldu
- ✅ Server yeniden başlatıldı
- ✅ Middleware `/pdks-scan` path'ini kabul ediyor
- ✅ Sayfa ve component'ler hazır

Tek sorun **token expire** olmasıydı!

## 🔍 Token Kontrolü

Console'da token'ınızı kontrol edebilirsiniz:

```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
```

Token varsa ve user varsa, artık `/pdks-scan` sayfası açılmalı!

## ⚠️ Not

Token'lar genellikle 1 gün sonra expire olur. Her gün tekrar login olmanız gerekebilir.





