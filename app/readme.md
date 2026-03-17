# Zabbix Telegram Notifications

Bot Telegram ini dirancang untuk berintegrasi dengan Zabbix NMS guna memberikan notifikasi dan informasi real-time mengenai status infrastruktur jaringan langsung ke grup atau chat Telegram Anda.

## 🚀 Fitur Utama

- **Laporan Otomatis per Jam**: Bot secara otomatis mengirimkan ringkasan status host dan link setiap jam.
- **Monitoring Host Aktif**: Cek jumlah dan daftar host yang sedang aktif.
- **Deteksi Host Bermasalah**: Identifikasi host yang mengalami masalah (berdasarkan SNMP trigger).
- **Monitoring Link Down**: Pantau interface atau port yang sedang mengalami gangguan.
- **Manajemen Token Zabbix**: Dapatkan token API Zabbix dengan mudah melalui perintah bot.

## 🛠️ Daftar Perintah (Bot Commands)

Anda dapat berinteraksi dengan bot menggunakan perintah-perintah berikut:

- `/start` - Mengaktifkan bot dan memulai laporan otomatis setiap jam.
- `/gethostactive` - Mengambil jumlah dan daftar host yang aktif dari Zabbix.
- `/gethostinactive` - Mengambil daftar host yang tidak aktif/bermasalah.
- `/getlinkdown` - Menampilkan detail link atau interface yang sedang down.
- `/gettraffic` - Menampilkan daftar host untuk melihat rata-rata trafik hari ini (00:00 - sekarang).
- `/gettemp` - Menampilkan daftar host yang memiliki sensor suhu untuk melihat temperatur saat ini.
- `/stop` - Menghentikan bot.

## ⚙️ Persyaratan (Prerequisites)

- Node.js (v14+)
- Akun Telegram & Bot Token (dari [@BotFather](https://t.me/botfather))
- Akses API Zabbix (URL, Username, Password)
- Docker & Docker Compose (Opsional, untuk deployment)

## 🔧 Konfigurasi (`.env`)

Buat file `.env` di folder `app/` dan sesuaikan variabel berikut:

```env
# Telegram Configuration
ZABBIX_TELEGRAM_TOKEN=your_telegram_bot_token

# Zabbix Configuration
ZABBIX_BASE_URL=https://your-zabbix-url/api_jsonrpc.php
ZABBIX_USERNAME=your_username
ZABBIX_PASSWORD=your_password
ZABBIX_TOKEN=your_zabbix_api_token

# Keywords (Opsional)
SNMP_TRIGGER_KEYWORDS="SNMP data collection"
LINK_ERROR_KEYWORDS="Link down,Interface,port down"
```

## 📦 Instalasi

### Menggunakan Docker (Rekomendasi)

1. Clone repositori ini.
2. Sesuaikan konfigurasi di `.env`.
3. Jalankan perintah:
   ```bash
   docker-compose up -d --build
   ```

### Jalankan Lokal (Tanpa Docker)

1. Masuk ke direktori `app/`:
   ```bash
   cd app
   ```
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Jalankan bot:
   ```bash
   npm start
   ```

## 📝 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).
