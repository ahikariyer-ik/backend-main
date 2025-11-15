# 🚀 Sunucuda Güncelleme Rehberi

## Backend Güncellemesi

### 1. Sunucuya SSH ile Bağlanın
```bash
ssh kullanici@sunucu-ip
# veya
ssh root@sunucu-ip
```

### 2. Backend Projesinin Dizinine Gidin
```bash
cd /path/to/ahikariyer-ik-backend-main
# Örnek: cd /var/www/ahikariyer-backend
```

### 3. GitHub'dan Son Değişiklikleri Çekin
```bash
# Önce mevcut değişiklikleri kontrol edin
git status

# Eğer local değişiklikler varsa yedekleyin
git stash

# Son değişiklikleri çekin
git pull origin main

# Eğer stash yaptıysanız geri alın
git stash pop
```

### 4. Bağımlılıkları Güncelleyin (Gerekirse)
```bash
npm install
# veya
pnpm install
```

### 5. Build İşlemi (Production için)
```bash
npm run build
# veya
pnpm build
```

### 6. PM2 ile Uygulamayı Yeniden Başlatın
```bash
# PM2 kullanıyorsanız
pm2 restart ahikariyer-backend

# veya isim bilmiyorsanız tüm uygulamaları listeleyin
pm2 list

# Belirli bir ID ile restart
pm2 restart <id>

# Hard restart (daha emin olmak için)
pm2 stop ahikariyer-backend
pm2 start ahikariyer-backend
```

### 7. Logları Kontrol Edin
```bash
# PM2 logları
pm2 logs ahikariyer-backend

# veya tüm loglar
pm2 logs

# Son 100 satır
pm2 logs --lines 100
```

### 8. Servis Durumunu Kontrol Edin
```bash
pm2 status
```

## 🔍 Sorun Giderme

### Eğer PM2 Çalışmıyorsa
```bash
# PM2'yi yeniden yükleyin
pm2 delete ahikariyer-backend
pm2 start npm --name "ahikariyer-backend" -- start

# veya ecosystem dosyası varsa
pm2 start ecosystem.config.js
```

### Eğer Port Sorunu Varsa
```bash
# Portu kullanan işlemi bulun
lsof -i :3000
# veya
netstat -tulpn | grep :3000

# İşlemi sonlandırın
kill -9 <PID>

# PM2'yi yeniden başlatın
pm2 restart ahikariyer-backend
```

### Nginx Kullanıyorsanız
```bash
# Nginx yapılandırmasını test edin
sudo nginx -t

# Nginx'i yeniden başlatın
sudo systemctl restart nginx
# veya
sudo service nginx restart
```

## 📋 Hızlı Güncelleme Komutları (Tek Seferde)

Backend için:
```bash
cd /path/to/ahikariyer-ik-backend-main && \
git pull origin main && \
npm install && \
npm run build && \
pm2 restart ahikariyer-backend && \
pm2 logs ahikariyer-backend --lines 50
```

## ✅ Yapılan Değişiklikler (Bu Güncelleme)

1. **Company Profili Düzeltildi**: Kullanıcılar artık kendi şirket profillerini görebiliyor
2. **Kararlar Sayfası Düzeltildi**: Forbidden hatası giderildi
3. **Çalışanlar Sayfası**: Sadece kendi şirketinin çalışanlarını gösteriyor
4. **Profile Company Loading**: Sonsuz loading sorunu çözüldü

## 🎯 Test Edilmesi Gerekenler

Güncelleme sonrası şunları test edin:
- ✅ Giriş yapın
- ✅ Çalışanlar sayfasını açın
- ✅ Kararlar sayfasını açın (Kurum Yönetimi > Kararlar)
- ✅ Profile > Company sayfasını açın
- ✅ Her sayfada veri göründüğünü kontrol edin

## 📞 Sorun Olursa

1. PM2 loglarını kontrol edin: `pm2 logs`
2. Browser console'u kontrol edin (F12)
3. Backend'in çalıştığından emin olun: `pm2 status`
4. Port'un açık olduğundan emin olun

---

**Son Güncelleme**: 15 Kasım 2025
**Commit**: fix: Company profili, kararlar ve çalışanlar sayfası sorunları düzeltildi

