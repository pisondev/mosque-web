# Changelog

## [Unreleased]

### Added
- Dokumen roadmap eksekusi frontend bertahap di `docs/FRONTEND_EXECUTION_PLAN.md`.
- Halaman dashboard baru `Domain & Akses` dengan operasi:
  - list domain
  - tambah domain
  - ubah status domain
  - hapus domain
- Halaman dashboard baru `Profil Masjid` untuk load dan simpan profil masjid.
- Server action baru untuk integrasi endpoint tenant domains dan profile.
- Halaman dashboard baru `Halaman Statis` untuk endpoint static pages.
- Halaman dashboard baru `Jadwal & Agenda` untuk endpoint modul worship.
- Form edit artikel pada route `/dashboard/content/[id]/edit`.
- Server action baru:
  - `posts` (detail dan update artikel)
  - `static-pages`
  - `worship` (settings, daily, duties, special days, calendar)

### Changed
- Sidebar dashboard menambahkan menu `Profil Masjid`.
- Sidebar dashboard menambahkan menu `Halaman Statis`.
- Sidebar dashboard menambahkan menu `Jadwal & Agenda`.
- Ikhtisar dashboard menautkan kartu menu langsung ke halaman fungsional.
- README diperbarui untuk konteks proyek, setup lokal, roadmap, dan status tahap 1.
- README diperbarui dengan catatan implementasi tahap 2.
- README diperbarui dengan catatan implementasi tahap 3.
- README diperbarui dengan riwayat branch implementasi per tahap.
- Halaman tags mendukung update nama tag.
- Halaman content mendukung link edit artikel dan akses cepat halaman statis.
- Form create post diselaraskan dengan payload backend (termasuk excerpt).

### Verified
- `npm run dev` berhasil berjalan pada `http://localhost:3000`.
- `npx tsc --noEmit` lulus tanpa type error.
- `npm run lint` masih gagal karena isu lama lint di file yang sudah ada sebelum tahap ini.
- `npx eslint` pada file stage 3 lulus tanpa error (tersisa warning lama di file dashboard lama).
