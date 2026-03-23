# Mosque Web

Frontend dashboard dan website publik untuk ekosistem `mosque-api`.

## Stack
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS

## Setup Lokal
1. Pastikan backend `mosque-api` berjalan di `http://localhost:8080`.
2. Install dependency:

```bash
npm install
```

3. Jalankan aplikasi:

```bash
npm run dev
```

4. Buka `http://localhost:3000`.

## Environment
Gunakan `.env.local` untuk variabel publik frontend, termasuk Google OAuth client id.

## Progress Implementasi
- Tahap 1: tenant foundation (dashboard, domain, profil masjid).
- Tahap 2: modul konten (tags, posts, static pages).
- Tahap 3: modul ibadah (settings, jadwal harian, petugas, hari besar, kalender).
- Tahap 4+: komunitas, engagement, dan hardening.

Roadmap detail ada di:
- `docs/FRONTEND_EXECUTION_PLAN.md`

## Catatan Tahap 1
Fitur yang sudah aktif:
- Dashboard ikhtisar tenant.
- Halaman `Domain & Akses` (list, tambah, update status, hapus domain).
- Halaman `Profil Masjid` (ambil data profil + simpan profil).
- Integrasi endpoint Sprint 1:
  - `GET /tenant/me`
  - `PATCH /tenant/setup`
  - `GET/POST/PATCH/DELETE /tenant/domains`
  - `GET/PUT /tenant/profile`

## Catatan Tahap 2
Fitur yang sudah aktif:
- Edit tag (`PATCH /tenant/tags/{id}`) langsung dari halaman tag.
- List/create/edit/delete artikel dengan endpoint:
  - `GET /tenant/posts`
  - `POST /tenant/posts`
  - `GET /tenant/posts/{id}`
  - `PUT /tenant/posts/{id}`
  - `PATCH /tenant/posts/{id}/status`
  - `DELETE /tenant/posts/{id}`
- Manajemen halaman statis:
  - `GET /tenant/static-pages`
  - `PUT /tenant/static-pages/{slug}`

## Catatan Tahap 3
Fitur yang sudah aktif:
- Halaman `Jadwal & Agenda` menampilkan snapshot dan preview data ibadah.
- Panel operasi JSON untuk eksekusi penuh endpoint stage 3:
  - `GET/PUT /tenant/prayer-time-settings`
  - `GET/POST/PUT/DELETE /tenant/prayer-times-daily`
  - `GET/POST/PUT/DELETE /tenant/prayer-duties`
  - `GET/POST/PUT/DELETE /tenant/special-days`
  - `GET /tenant/prayer-calendar`
- Dashboard utama dan sidebar sudah menampilkan akses langsung ke menu `Jadwal & Agenda`.

## Riwayat Branch Tahap
- Tahap 1: `feat/stage-1-tenant-foundation`
- Tahap 2: `feat/stage-2-content-cms`
- Tahap 3: `feat/stage-3-worship-operations`
