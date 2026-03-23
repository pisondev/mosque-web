# FRONTEND EXECUTED PLAN - Mosque Web

## Tujuan Dokumen
Dokumen ini menjelaskan hasil nyata yang sudah dibuat di frontend, termasuk:
- fitur apa yang sudah berfungsi
- alasan kenapa desain saat ini dibuat seperti itu
- cara pengguna menjalankan fitur (bahasa non-teknis)
- keterbatasan yang masih ada dan rencana perbaikannya

## Ringkasan Eksekusi
- Tahap 1: selesai (fondasi tenant)
- Tahap 2: selesai (CMS konten)
- Tahap 3: selesai (modul ibadah dan kalender)
- Tahap 4-6: belum dikerjakan

## Penjelasan Desain: Kenapa Dibuat Seperti Ini

### A. Kenapa ada "Snapshot Prayer Time Settings" dan tabel preview data
Alasan:
- untuk memastikan data backend benar-benar terbaca dari API
- untuk memberi visibilitas cepat sebelum data diubah
- untuk mempercepat validasi kontrak endpoint tahap 3

Makna untuk user:
- Snapshot = tampilan konfigurasi aktif saat ini (read-only)
- Tabel preview = 5 data terakhir agar user tahu data memang masuk ke sistem

Keterbatasan:
- tampilan ini masih format teknis, belum bahasa operasional takmir

### B. Kenapa input tahap 3 masih JSON
Alasan teknis saat eksekusi:
- endpoint tahap 3 banyak dan payload relatif kompleks
- prioritas awal adalah memastikan semua kontrak API bisa dipakai end-to-end dulu
- model JSON membuat semua field backend bisa langsung diuji tanpa menunggu desain form final

Dampak:
- user non-IT memang belum nyaman
- rawan salah format input jika tidak paham struktur data

Kesimpulan:
- desain JSON ini bersifat jembatan sementara (bridge mode), bukan desain final user-friendly

### C. Kenapa tetap dirilis walau belum user-friendly penuh
Karena target fase ini adalah:
- membuktikan integrasi kontrak backend selesai
- memastikan endpoint tidak mubazir
- membuka jalan untuk tahap UX hardening di tahap berikutnya

## Cakupan Yang Sudah Dikerjakan

### 1) Tahap 1 - Fondasi Tenant (Selesai)
Implementasi:
- dashboard tenant dengan status onboarding
- halaman `Domain & Akses`:
  - list domain
  - tambah domain
  - update status domain
  - hapus domain
- halaman `Profil Masjid`:
  - load profil
  - simpan profil

Endpoint:
- `GET /api/v1/tenant/me`
- `PATCH /api/v1/tenant/setup`
- `GET /api/v1/tenant/domains`
- `POST /api/v1/tenant/domains`
- `PATCH /api/v1/tenant/domains/{id}`
- `DELETE /api/v1/tenant/domains/{id}`
- `GET /api/v1/tenant/profile`
- `PUT /api/v1/tenant/profile`

### 2) Tahap 2 - CMS Konten (Selesai)
Implementasi:
- modul tag: list, tambah, edit nama, hapus
- modul artikel: list, create, detail, edit, ubah status, hapus
- modul halaman statis: list dan upsert berdasarkan slug

Endpoint:
- `GET /api/v1/tenant/tags`
- `POST /api/v1/tenant/tags`
- `PATCH /api/v1/tenant/tags/{id}`
- `DELETE /api/v1/tenant/tags/{id}`
- `GET /api/v1/tenant/posts`
- `POST /api/v1/tenant/posts`
- `GET /api/v1/tenant/posts/{id}`
- `PUT /api/v1/tenant/posts/{id}`
- `PATCH /api/v1/tenant/posts/{id}/status`
- `DELETE /api/v1/tenant/posts/{id}`
- `GET /api/v1/tenant/static-pages`
- `PUT /api/v1/tenant/static-pages/{slug}`

### 3) Tahap 3 - Ibadah dan Kalender (Selesai, mode teknis)
Implementasi:
- halaman `Jadwal & Agenda`
- snapshot settings
- preview tabel data ibadah
- panel operasi JSON create/update/delete

Endpoint:
- `GET /api/v1/tenant/prayer-time-settings`
- `PUT /api/v1/tenant/prayer-time-settings`
- `GET /api/v1/tenant/prayer-times-daily`
- `POST /api/v1/tenant/prayer-times-daily`
- `PUT /api/v1/tenant/prayer-times-daily/{id}`
- `DELETE /api/v1/tenant/prayer-times-daily/{id}`
- `GET /api/v1/tenant/prayer-duties`
- `POST /api/v1/tenant/prayer-duties`
- `PUT /api/v1/tenant/prayer-duties/{id}`
- `DELETE /api/v1/tenant/prayer-duties/{id}`
- `GET /api/v1/tenant/special-days`
- `POST /api/v1/tenant/special-days`
- `PUT /api/v1/tenant/special-days/{id}`
- `DELETE /api/v1/tenant/special-days/{id}`
- `GET /api/v1/tenant/prayer-calendar`

## Cara Penggunaan (Versi Non-Teknis)

### A. Alur dasar user
1. Login ke dashboard.
2. Jika pertama kali, isi onboarding.
3. Setelah aktif, gunakan menu sidebar:
   - Domain & Akses
   - Profil Masjid
   - Manajemen Artikel
   - Halaman Statis
   - Kategori & Tag
   - Jadwal & Agenda

### B. Cara pakai fitur tahap 1
Domain & Akses:
1. Isi hostname.
2. Pilih jenis domain.
3. Simpan.
4. Jika perlu, ubah status domain dari dropdown.
5. Hapus jika domain tidak dipakai.

Profil Masjid:
1. Isi nama resmi, jenis tempat, kontak, alamat.
2. Klik simpan profil.

### C. Cara pakai fitur tahap 2
Kategori & Tag:
1. Buat tag baru dari form.
2. Jika salah nama, klik edit.
3. Hapus tag yang tidak dipakai.

Manajemen Artikel:
1. Klik "Tulis Artikel Baru".
2. Isi judul, isi konten, kategori, status.
3. Simpan.
4. Dari daftar artikel, bisa edit/hapus/toggle status.

Halaman Statis:
1. Pilih halaman (Tentang Kami / Visi Misi / Kontak).
2. Isi judul, ringkasan, konten.
3. Simpan halaman.

### D. Cara pakai fitur tahap 3 saat ini
Menu `Jadwal & Agenda`:
1. Lihat snapshot dan preview dulu (agar tahu data aktif).
2. Untuk menambah/mengubah data, isi kotak JSON sesuai contoh yang sudah disediakan.
3. Klik tombol simpan/update/hapus.

Catatan penting:
- mode ini cocok untuk admin teknis/pendamping IT
- belum cocok untuk pengguna awam sebagai final UI

## Rencana Perbaikan UX Tahap 3 (Wajib Lanjutan)
Perbaikan yang harus dilakukan agar ramah non-IT:
- ganti input JSON menjadi form visual per modul:
  - Form Pengaturan Waktu Shalat
  - Form Jadwal Harian
  - Form Petugas Ibadah
  - Form Hari Besar
- tambah date picker, time picker, dropdown enum, dan validasi pesan human-readable
- tambah aksi tabel langsung (Edit/Hapus) tanpa input ID manual
- tambah helper text contoh penggunaan dalam bahasa operasional takmir

## Setup Lokal

### Prasyarat
- backend `mosque-api` aktif di `http://localhost:8080`
- dependency frontend sudah terpasang
- session login valid (`mosque_session`)

### Menjalankan Backend
Di folder `mosque-api`:
- setup PostgreSQL lokal (jika belum):
  - `powershell -ExecutionPolicy Bypass -File scripts/setup_local_postgres.ps1`
- jalankan API:
  - `go run main.go`

### Menjalankan Frontend
Di folder `mosque-web`:
- install dependency:
  - `npm install`
- start dev server:
  - `npm run dev`
- buka:
  - `http://localhost:3000`

## Verifikasi Yang Sudah Dilakukan
- TypeScript check:
  - `npx tsc --noEmit` lulus
- lint targeted file stage 3:
  - `npx eslint ...` lulus tanpa error (warning lama masih ada di file lama)
- dev server aktif dan route dashboard terkompilasi

## Branch dan Commit Tahap
- Tahap 1:
  - branch: `feat/stage-1-tenant-foundation`
  - commit: `3aeb51b`
- Tahap 2:
  - branch: `feat/stage-2-content-cms`
  - commit: `a454637`
- Tahap 3:
  - branch: `feat/stage-3-worship-operations`
  - commit: `5994362`

## Pekerjaan Berikutnya
- Tahap 4: community (events, gallery, management-members + public pages)
- Tahap 5: engagement (donation, social, external links, website-features)
- Tahap 6: hardening UX, standard error handling, regresi lintas modul
