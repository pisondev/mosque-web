# Auth Frontend Progress

## Ringkasan

Halaman autentikasi terpusat sudah ditambahkan ke `mosque-web` pada branch `feat/auth-server`, sekaligus mengganti CTA kanan atas landing page dari Google Sign-In langsung menjadi tombol `Masuk`.

## File Ditambahkan

- `src/lib/session.ts`
- `src/lib/auth-proxy.ts`
- `src/app/api/v1/auth/login/route.ts`
- `src/app/api/v1/auth/register/route.ts`
- `src/app/api/v1/auth/forgot-password/route.ts`
- `src/app/api/v1/auth/reset-password/route.ts`
- `src/app/auth/page.tsx`
- `src/components/auth/AuthPageClient.tsx`

## File Diupdate

- `src/components/Navbar.tsx`
- `src/proxy.ts`
- `src/app/actions/auth.ts`
- `src/app/api/v1/auth/google/route.ts`
- `src/lib/upload.ts`

## File Dihapus

- Tidak ada.

## Perubahan Utama

- Menambahkan halaman `/auth` untuk:
  - login email/password
  - register tenant baru
  - forgot password
  - reset password
  - alternatif Google Sign-In
- Menambahkan route handler Next untuk meneruskan request auth ke `mosque-api` dan set cookie `mosque_session` secara server-side.
- Mengubah tombol kanan atas landing page menjadi `Masuk` yang menuju halaman auth baru.
- Mengubah proxy agar akses dashboard tanpa session diarahkan ke `/auth`.

## Alur Testing Yang Dijalankan

### 1. Focused Lint Pada File Yang Diubah

Command:

```powershell
npx eslint "src/components/Navbar.tsx" "src/components/auth/AuthPageClient.tsx" "src/lib/auth-proxy.ts" "src/lib/session.ts" "src/app/auth/page.tsx" "src/app/api/v1/auth/google/route.ts" "src/app/api/v1/auth/login/route.ts" "src/app/api/v1/auth/register/route.ts" "src/app/api/v1/auth/forgot-password/route.ts" "src/app/api/v1/auth/reset-password/route.ts"
```

Hasil:

- Lulus.

### 2. Production Build

Command:

```powershell
npm run build
```

Hasil:

- Lulus.
- Route auth baru berhasil masuk ke output build:
  - `/auth`
  - `/api/v1/auth/login`
  - `/api/v1/auth/register`
  - `/api/v1/auth/forgot-password`
  - `/api/v1/auth/reset-password`
  - `/api/v1/auth/google`

### 3. Full Repo Lint

Command:

```powershell
npm run lint
```

Hasil:

- Belum lulus karena ada banyak debt lint lama di file luar scope auth.
- Perubahan auth yang dikerjakan pada branch ini sudah lolos lint terfokus dan build produksi.
