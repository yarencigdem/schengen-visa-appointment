# 🌍 Schengen Vizesi Randevu Takip Uygulaması

Modern web arayüzlü, gerçek zamanlı bildirim sistemine sahip Schengen vize randevu kontrol uygulaması. Yeni API entegrasyonu ile daha hızlı ve güvenilir randevu takibi.

## 🚀 Özellikler

### 🌍 Desteklenen Ülkeler
- Fransa 🇫🇷
- Hollanda 🇳🇱
- İrlanda 🇮🇪
- Malta 🇲🇹
- İsveç 🇸🇪
- Çekya 🇨🇿
- Hırvatistan 🇭🇷
- Bulgaristan 🇧🇬
- Finlandiya 🇫🇮
- Slovenya 🇸🇮
- Danimarka 🇩🇰
- Norveç 🇳🇴
- Estonya 🇪🇪
- Litvanya 🇱🇹
- Lüksemburg 🇱🇺
- Ukrayna 🇺🇦
- Letonya 🇱🇻
- İtalya 🇮🇹
- Avusturya 🇦🇹
- Portekiz 🇵🇹
- Yunanistan 🇬🇷
- İsviçre 🇨🇭

### 🎯 Gelişmiş Filtreleme
- **Ülke Seçimi**: 22 farklı Schengen ülkesi
- **Merkez Filtreleme**: Her ülkenin konsolosluk merkezleri
- **Vize Türü Filtreleme**: Short Term, Student, Work, Family Visit vb.
- **Dinamik Filtreleme**: Merkez değiştiğinde vize türleri otomatik güncellenir

### 🔔 Bildirim Sistemi
- 🤖 **Telegram Bildirimleri**: Anlık randevu bildirimleri
- 🔔 **Web Bildirimleri**: Tarayıcı bildirimleri
- 🔊 **Sesli Bildirimler**: Randevu bulunduğunda ses çalar
- 📱 **Mesaj Geçmişi**: Tüm randevuların geçmişi

### ⚙️ Akıllı Özellikler
- **Otomatik Kaydetme**: Telegram bilgileri otomatik kaydedilir
- **Yeni Mesajlar En Üstte**: En son bulunan randevular en üstte görünür
- **Ayrı Mesajlar**: Her randevu ayrı mesaj olarak gönderilir
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu

## 💻 Sistem Gereksinimleri

- Node.js 18.0.0 veya üzeri
- npm (Node.js ile birlikte gelir)
- Modern bir web tarayıcısı
- İnternet bağlantısı

## 🛠️ Kurulum

### 1. Projeyi İndirin
```bash
git clone https://github.com/KULLANICI_ADI/REPO_ADI.git
cd REPO_ADI
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Uygulamayı Başlatın
```bash
npm run dev
```

### 4. Tarayıcıda Açın
```
http://localhost:3000
```

## 🤖 Telegram Bot Kurulumu

### 1. Bot Oluşturun
1. [@BotFather](https://t.me/botfather) ile konuşma başlatın
2. `/newbot` komutu ile bot oluşturun
3. Bot adını ve kullanıcı adını belirleyin
4. Bot token'ı kaydedin

### 2. Chat ID Alın
1. Oluşturduğunuz bot ile konuşma başlatın
2. Herhangi bir mesaj gönderin
3. Şu URL'yi ziyaret edin (TOKEN yerine bot token'ınızı yazın):
   ```
   https://api.telegram.org/botTOKEN/getUpdates
   ```
4. `chat.id` değerini kopyalayın

### 3. Uygulamada Ayarlayın
1. Uygulamada "Telegram Bildirimleri" bölümünü açın
2. Bot Token ve Chat ID'yi girin
3. Bilgiler otomatik olarak kaydedilir

## 🎮 Kullanım

### 1. Telegram Ayarları
- Telegram toggle'ını açın
- Bot Token ve Chat ID'yi girin
- Bilgiler otomatik kaydedilir

### 2. Randevu Ayarları
- **Ülke Seçin**: İstediğiniz Schengen ülkesini seçin
- **Merkez Seçin**: "Tüm Merkezler" veya spesifik merkez
- **Vize Türü Seçin**: "Tüm Vize Türleri" veya spesifik tür
- **Kontrol Sıklığı**: 1-3600 saniye arası (varsayılan: 5 saniye)

### 3. Kontrolü Başlatın
- "Kontrolü Başlat" butonuna tıklayın
- Sistem seçilen kriterlere göre randevu aramaya başlar
- Randevu bulunduğunda anında bildirim alırsınız

### 4. Sonuçları İzleyin
- Bulunan randevular mesaj geçmişinde görünür
- Her randevu ayrı mesaj olarak gösterilir
- Yeni randevular en üstte görünür

## 📊 Mesaj Formatı

Randevu bulunduğunda şu formatta mesaj alırsınız:

```
🎉 *Fransa için randevu bulundu!*

🏢 *Konsolosluk Merkezi:*
   France Visa Application Centre - Istanbul Beyoglu

📋 *Vize Kategorisi:*
   Long Term / Uzun Donem/ Long Sejour

📝 *Vize Tipi:*
   Long Term Standard

📊 *Durum:*
   🟢 Açık

📅 *Son Müsait Tarih:*
   23/06/2025

👥 *Takip Sayısı:* 1
🆔 *Randevu ID:* 515

💡 *Önemli:* Bu randevu için hemen başvuru yapmanız önerilir!
```

## 🔧 Sorun Giderme

### Yaygın Sorunlar:

1. **"API yanıt vermedi" hatası**:
   - İnternet bağlantınızı kontrol edin
   - Birkaç dakika bekleyip tekrar deneyin

2. **Telegram bildirimi gelmiyor**:
   - Bot token ve chat ID'yi kontrol edin
   - Bot ile konuşma başlattığınızdan emin olun

3. **Randevu bulunamıyor**:
   - Filtreleri kontrol edin
   - "Tüm Merkezler" ve "Tüm Vize Türleri" seçin

4. **Port hatası**:
   - Farklı port kullanın: `PORT=3001 npm run dev`

## 🔒 Güvenlik

- Bot token'ınızı kimseyle paylaşmayın
- Chat ID'nizi gizli tutun
- Güvenli internet bağlantısı kullanın

## 🆕 Güncellemeler

### v2.0.0 (Güncel)
- ✅ Yeni API entegrasyonu
- ✅ 22 ülke desteği
- ✅ Merkez bazlı filtreleme
- ✅ Vize türü filtreleme
- ✅ Otomatik kaydetme
- ✅ Ayrı mesaj sistemi
- ✅ Yeni mesajlar en üstte
- ✅ Modern UI/UX tasarım

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📞 Destek

Sorunlarınız için:
- GitHub Issues kullanın
- Detaylı hata mesajları ekleyin
- Ekran görüntüleri paylaşın

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
