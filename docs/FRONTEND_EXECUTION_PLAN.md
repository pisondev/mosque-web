# Frontend Execution Plan - Mosque Web

## Tujuan
Membuat seluruh halaman dashboard dan halaman publik yang fungsional penuh berdasarkan kontrak API `mosque-api`, sehingga endpoint backend termanfaatkan dan tidak ada yang mubazir.

## Status Proyek Saat Ini
- ✅ Tahap 1 selesai
- ✅ Tahap 2 selesai
- ✅ Tahap 3 selesai
- ⏳ Tahap 4 belum mulai
- ⏳ Tahap 5 belum mulai
- ⏳ Tahap 6 belum mulai

## Prinsip Eksekusi
- Selalu refer ke dokumen kontrak sprint backend (`mosque-api/docs/contracts`).
- Setiap tahap menghasilkan fitur yang benar-benar bisa dipakai operasional.
- Setiap tahap diakhiri update `README.md`, `CHANGELOG.md`, dan commit terpisah.
- Setiap endpoint yang dipakai punya jalur uji manual yang jelas.

## Tahapan Implementasi

### Tahap 1 - Fondasi Tenant ✅ Selesai
Fokus: sprint 1 tenant core agar area identitas dan domain benar-benar fungsional.

Endpoint:
- `GET /api/v1/tenant/me`
- `PATCH /api/v1/tenant/setup`
- `GET /api/v1/tenant/domains`
- `POST /api/v1/tenant/domains`
- `PATCH /api/v1/tenant/domains/{id}`
- `DELETE /api/v1/tenant/domains/{id}`
- `GET /api/v1/tenant/profile`
- `PUT /api/v1/tenant/profile`

Deliverable:
- Dashboard ringkas konteks tenant.
- Halaman `Domain & Akses` untuk CRUD domain dan update status.
- Halaman `Profil Masjid` untuk melihat dan mengubah profil.

### Tahap 2 - CMS Konten ✅ Selesai
Fokus: sprint 2 supaya konten inti website dapat dikelola end-to-end.

Endpoint:
- `GET/POST/PATCH/DELETE /api/v1/tenant/tags`
- `GET/POST/GET{id}/PUT/PATCH{status}/DELETE /api/v1/tenant/posts`
- `GET /api/v1/tenant/static-pages`
- `PUT /api/v1/tenant/static-pages/{slug}`

Deliverable:
- Manajemen kategori/tag termasuk edit dan hapus.
- Daftar artikel, create artikel, edit artikel, delete artikel, dan toggle status.
- Manajemen static page (tentang, kontak, visi-misi) berbasis slug.

### Tahap 3 - Ibadah dan Kalender ✅ Selesai
Fokus: sprint 3 agar kebutuhan inti ibadah masjid tertangani.

Endpoint:
- `GET/PUT /api/v1/tenant/prayer-time-settings`
- `GET/POST/PUT/DELETE /api/v1/tenant/prayer-times-daily`
- `GET/POST/PUT/DELETE /api/v1/tenant/prayer-duties`
- `GET/POST/PUT/DELETE /api/v1/tenant/special-days`
- `GET /api/v1/tenant/prayer-calendar`

Deliverable:
- Halaman `Jadwal & Agenda` sebagai panel operasi endpoint stage 3.
- Snapshot settings dan preview data jadwal/kalender.
- Form operasi create/update/delete berbasis payload JSON untuk seluruh endpoint stage 3.

### Tahap 4 - Komunitas dan Galeri ⏳ Belum Mulai
Fokus: sprint 4 untuk aktivitas komunitas dan konten visual.

Endpoint:
- `GET/POST/PUT/PATCH{status}/DELETE /api/v1/tenant/events`
- `GET/POST/PUT/DELETE /api/v1/tenant/gallery/albums`
- `GET/POST/PUT/DELETE /api/v1/tenant/gallery/items`
- `GET/POST/PUT/DELETE /api/v1/tenant/management-members`
- `GET /api/v1/public/:hostname/events`
- `GET /api/v1/public/:hostname/gallery/albums`
- `GET /api/v1/public/:hostname/gallery/items`
- `GET /api/v1/public/:hostname/management-members`

Target deliverable:
- Dashboard event dan publikasi event.
- Dashboard galeri album dan item.
- Dashboard struktur pengurus.
- Halaman publik event, galeri, dan pengurus.

### Tahap 5 - Engagement dan Monetisasi ⏳ Belum Mulai
Fokus: sprint 5 agar kanal donasi dan jejaring sosial bisa dipakai publik.

Endpoint:
- `GET/POST/PUT/DELETE /api/v1/tenant/donation-channels`
- `GET/POST/PUT/DELETE /api/v1/tenant/social-links`
- `GET/POST/PUT/DELETE /api/v1/tenant/external-links`
- `GET /api/v1/tenant/feature-catalog`
- `GET /api/v1/tenant/website-features`
- `PUT /api/v1/tenant/website-features/{feature_id}`
- `PATCH /api/v1/tenant/website-features/bulk`
- `GET /api/v1/public/:hostname/donation-channels`
- `GET /api/v1/public/:hostname/social-links`
- `GET /api/v1/public/:hostname/external-links`

Target deliverable:
- Dashboard kanal donasi.
- Dashboard tautan sosial dan eksternal.
- Pengaturan feature flag website.
- Render publik kanal engagement.

### Tahap 6 - Hardening dan Konsistensi UX ⏳ Belum Mulai
Fokus: finalisasi kualitas lintas modul agar stabil untuk produksi.

Ruang lingkup:
- Standardisasi error handling sesuai response envelope backend.
- Penyeragaman validasi form dan state loading/empty/error.
- Penguatan akses berbasis sesi JWT.
- Audit pemakaian endpoint agar tidak ada kontrak yang tertinggal.
- Uji regresi manual dashboard dan publik.

## Matriks Pemanfaatan Kontrak API
- Sprint 1: Tahap 1 ✅
- Sprint 2: Tahap 2 ✅
- Sprint 3: Tahap 3 ✅
- Sprint 4: Tahap 4 ⏳
- Sprint 5: Tahap 5 ⏳
- Sprint 6 hardening: Tahap 6 ⏳
