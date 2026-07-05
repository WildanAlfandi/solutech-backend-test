# Solutech Technical Test - Backend Developer

REST API sederhana untuk modul inti e-commerce (product & order) menggunakan Next.js (App Router), Prisma, dan PostgreSQL.

## Tech Stack

- **Next.js 16** (App Router, Route Handlers) + TypeScript
- **Prisma 6** sebagai ORM di atas **PostgreSQL 15**
- **Zod** untuk validasi input
- **JWT (jsonwebtoken)** untuk autentikasi
- **bcryptjs** untuk hashing password
- Arsitektur berlapis: **Route Handler → Service → Repository**

## Struktur Project

```
app/
  api/
    auth/login/route.ts        -> POST login
    products/route.ts          -> GET list, POST create
    products/[id]/route.ts     -> GET detail, PUT update, DELETE soft delete
    orders/route.ts            -> POST create, GET list (milik user login)
  lib/
    prisma.ts                  -> Prisma Client singleton
    jwt.ts                     -> helper sign & verify JWT
    auth-middleware.ts         -> helper cek token di setiap request
  repositories/
    user.repository.ts
    product.repository.ts
    order.repository.ts
  services/
    auth.service.ts
    product.service.ts
    order.service.ts
prisma/
  schema.prisma
  seed.ts
init.sql                        -> raw SQL create table
postman_collection.json
.env.example
```

## Cara Setup & Menjalankan di Local

### 1. Jalankan PostgreSQL

Project ini pakai Docker untuk PostgreSQL lokal:

```bash
docker run --name solutech-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=solutech_test -p 5432:5432 -d postgres:15
```

Kalau sudah punya PostgreSQL sendiri, boleh dipakai langsung asal database `solutech_test` (atau nama lain sesuai selera) sudah dibuat.

### 2. Konfigurasi Environment

Copy `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Isi `.env`:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/solutech_test"
JWT_SECRET="bebas diisi string acak"
```

Sesuaikan `DATABASE_URL` kalau kredensial PostgreSQL berbeda dari default di atas.

### 3. Install Dependencies

```bash
npm install
```

### 4. Jalankan SQL Create Table

File `init.sql` berisi seluruh `CREATE TABLE` untuk 4 tabel (`users`, `products`, `orders`, `order_items`) beserta enum dan index. Jalankan ke database yang sudah dibuat:

```bash
docker cp init.sql solutech-postgres:/init.sql
docker exec -it solutech-postgres psql -U postgres -d solutech_test -f /init.sql
```

Kalau pakai PostgreSQL lokal (bukan Docker), jalankan langsung:

```bash
psql -U <user> -d solutech_test -f init.sql
```

### 5. Generate Prisma Client & Jalankan Seed

```bash
npx prisma generate
npx prisma db seed
```

Seed akan membuat:
- 1 user: `admin@solutech.test` / password: `password123`
- 5 product contoh dengan stok bervariasi

### 6. Jalankan Server

```bash
npm run dev
```

Server berjalan di `http://localhost:3000`.

### 7. Testing via Postman

Import `postman_collection.json` ke Postman. Alur testing:
1. Jalankan request **Login** dengan kredensial seed di atas, copy `token` dari response.
2. Buka tab **Variables** di collection, isi variable `token` dengan token yang didapat.
3. Untuk endpoint yang butuh `product_id` (detail/update/delete product, create order), isi variable `product_id` dengan salah satu id hasil dari **List Product**.
4. Jalankan request lainnya secara bebas.

## Keputusan Teknis & Asumsi

- **Soft delete pakai kolom `deletedAt` (nullable DateTime)**, bukan boolean, supaya sekaligus menyimpan kapan produk dihapus.
- **Harga di-snapshot ke `OrderItem`** saat order dibuat. Ini penting supaya riwayat order tidak berubah kalau harga product di-update belakangan.
- **Tipe data harga pakai `Decimal`**, bukan `Float`, untuk menghindari floating point rounding error saat kalkulasi total.
- **ID menggunakan UUID**, bukan auto-increment integer, supaya tidak predictable/enumerable dari luar.
- **Validasi stok & pengurangan stok dibungkus dalam satu `prisma.$transaction`** di `order.service.ts`. Kalau ada satu produk saja yang stoknya tidak mencukupi (atau produk tidak ditemukan), seluruh transaction di-rollback otomatis — termasuk pengurangan stok produk lain yang sempat berhasil diproses lebih dulu dalam request yang sama. Ini sudah diverifikasi manual: order dengan 2 item (1 valid, 1 stok kurang) menghasilkan rollback penuh, stok produk yang valid tetap utuh.
- **Field `status` pada Order** (`PENDING`, `COMPLETED`, `CANCELLED`) ditambahkan sebagai antisipasi kebutuhan production meskipun tidak diminta eksplisit di requirement. Saat ini order yang dibuat otomatis berstatus `PENDING` dan belum ada endpoint untuk mengubah status (di luar scope requirement wajib).
- **Register user tidak dibuat** — sesuai opsi yang diberikan requirement, cukup memakai user hasil seed.
- **Foreign key tanpa `ON DELETE CASCADE`** — sengaja dibiarkan `NO ACTION` karena riwayat order sebaiknya tidak ikut hilang jika produk terkait dihapus (dan produk sendiri hanya soft delete, bukan hard delete).

## Fitur yang Sudah Selesai

- [x] Login dengan JWT (bearer token)
- [x] Endpoint product & order protected (wajib login)
- [x] Product: create, list (pagination + search by nama), detail, update, soft delete
- [x] Order: create dengan pengurangan stok & kalkulasi total dalam satu transaction
- [x] Order: list hanya menampilkan order milik user yang login
- [x] Validasi input di setiap endpoint menggunakan Zod
- [x] Error handling & HTTP status code konsisten (200/201/400/401/404/409/500)
- [x] Layered architecture (route handler / service / repository)
- [x] File SQL create table + Prisma seed
- [x] `.env.example`
- [x] Postman collection

## Fitur yang Belum Dikerjakan (Nilai Tambah)

Karena keterbatasan waktu, seluruh bagian nilai tambah berikut belum dikerjakan:

- [ ] Caching Redis pada endpoint list product
- [ ] Unit / integration test
- [ ] Rate limiting atau request logging
- [ ] Frontend sederhana untuk admin (CRUD product)

Bagian-bagian ini tidak mengurangi fungsi inti API, seluruh requirement wajib sudah diuji manual dan berjalan sesuai ekspektasi.

## Estimasi Waktu Pengerjaan

Kurang lebih **1 hari** (termasuk setup environment, desain schema, implementasi seluruh endpoint, dan testing manual via Postman).