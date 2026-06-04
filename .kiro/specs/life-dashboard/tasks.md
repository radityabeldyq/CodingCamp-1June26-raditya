# Implementation Plan: Life Dashboard

## Overview

Implementasi single-page productivity dashboard menggunakan HTML, CSS, dan Vanilla JavaScript murni. Aplikasi dibangun secara inkremental — dimulai dari struktur file dan modul inti (StorageManager, ThemeManager), dilanjutkan ke setiap widget dengan tiga tantangan yang dipilih: Light/Dark Mode Toggle (Tantangan 1), Custom Name pada Greeting (Tantangan 2), dan Sort Tasks (Tantangan 5). Tidak ada setup pengujian yang diperlukan (NFR-1).

Semua kode ditulis dalam tiga file: `index.html`, `css/style.css`, dan `js/app.js`.

---

## Tasks

- [x] 1. Buat struktur file dan kerangka HTML dasar
  - Buat `index.html` dengan struktur semantik: `<header>`, `<main>`, dan section untuk tiap widget (greeting, timer, todo, quick-links)
  - Tambahkan `<link>` ke `css/style.css` dan `<script defer>` ke `js/app.js`
  - Sisipkan `<script>` inline kecil di `<head>` untuk ThemeManager awal (mencegah FOUC) yang membaca `ld_theme` dari localStorage dan men-set `data-theme` pada `<html>` sebelum paint
  - Buat `css/style.css` kosong dan `js/app.js` kosong sebagai placeholder
  - _Requirements: 10.1, 10.2, 10.3, 11.3_

- [x] 2. Implementasi StorageManager
  - [x] 2.1 Tulis modul `StorageManager` di `js/app.js`
    - Definisikan objek `StorageManager` dengan konstanta `KEYS` (`ld_tasks`, `ld_links`, `ld_theme`, `ld_username`, `ld_sort_pref`)
    - Implementasikan metode `get(key)` dengan try-catch: `JSON.parse(localStorage.getItem(key))`, fallback `null` jika gagal
    - Implementasikan metode `set(key, value)` dengan try-catch: `localStorage.setItem(key, JSON.stringify(value))`, log error jika QuotaExceededError
    - Implementasikan metode `remove(key)`: `localStorage.removeItem(key)`
    - _Requirements: 10.4, 3.9, 4.6, 5.3_

- [x] 3. Implementasi ThemeManager (Tantangan 1: Light/Dark Mode)
  - [x] 3.1 Tulis modul `ThemeManager` di `js/app.js`
    - Definisikan objek `ThemeManager` dengan properti `currentTheme`
    - Implementasikan `init()`: baca `ld_theme` via StorageManager, default `'light'` jika tidak ada, panggil `apply()`
    - Implementasikan `apply()`: set `document.documentElement.setAttribute('data-theme', currentTheme)`
    - Implementasikan `toggle()`: flip `currentTheme` antara `'light'` dan `'dark'`, panggil `apply()`, simpan via StorageManager
    - Tambahkan tombol toggle tema di HTML dengan label/ikon yang mengindikasikan mode saat ini, dan bind event listener
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 4. Implementasi GreetingWidget dengan Custom Name (Tantangan 2)
  - [x] 4.1 Tulis modul `GreetingWidget` di `js/app.js`
    - Definisikan objek `GreetingWidget` dengan `state: { userName: null }`
    - Implementasikan `getGreeting(hour)`: return `'Selamat Pagi'` (5–11), `'Selamat Siang'` (12–14), `'Selamat Sore'` (15–17), `'Selamat Malam'` (18–23 dan 0–4)
    - Implementasikan `formatTime(date)`: return string `'HH:MM'` dengan zero-padding
    - Implementasikan `formatDate(date)`: return string format `'Hari, DD Bulan YYYY'` menggunakan nama hari dan bulan Indonesia
    - Implementasikan `tick()`: ambil `new Date()`, update DOM elemen waktu, tanggal, dan salam
    - Implementasikan `init()`: load `ld_username` via StorageManager, panggil `render()`, jalankan `setInterval(() => this.tick(), 1000)`
    - Implementasikan `saveName(name)`: trim input; jika tidak kosong simpan ke storage dan tampilkan dalam format `"[Salam], [Nama]!"`; jika kosong hapus dari storage dan tampilkan salam tanpa nama; panggil `render()`
    - Implementasikan `render()`: update semua elemen DOM greeting (waktu, tanggal, salam+nama)
    - Tambahkan input field dan tombol konfirmasi nama di HTML, bind event listener pada input dan Enter key
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 5. Implementasi FocusTimer (Pomodoro dasar)
  - [x] 5.1 Tulis modul `FocusTimer` di `js/app.js`
    - Definisikan objek `FocusTimer` dengan `state: { durationMinutes: 25, remainingSeconds, isRunning, intervalId }`
    - Implementasikan `formatDisplay()`: return string `'MM:SS'` dengan zero-padding dari `remainingSeconds`
    - Implementasikan `start()`: guard `isRunning` dan `remainingSeconds === 0`; buat `setInterval` yang memanggil `tick()` setiap 1000ms
    - Implementasikan `stop()`: panggil `clearInterval`, set `isRunning = false`
    - Implementasikan `reset()`: panggil `stop()`, set `remainingSeconds = durationMinutes * 60`, panggil `render()`
    - Implementasikan `tick()`: decrement `remainingSeconds`, panggil `render()`; jika mencapai 0, panggil `stop()` dan `showCompletionMessage()`
    - Implementasikan `showCompletionMessage()`: tampilkan pesan teks di halaman bahwa sesi fokus selesai
    - Implementasikan `init()`: set durasi default 25 menit, hitung `remainingSeconds`, panggil `render()`, bind event listener tombol Start/Stop/Reset
    - Implementasikan `render()`: update DOM tampilan timer `'MM:SS'` dan state tombol
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [x] 6. Implementasi TodoManager (CRUD + Sort Tasks sebagai Tantangan 5)
  - [x] 6.1 Tulis modul `TodoManager` di `js/app.js` — struktur data dan validasi
    - Definisikan `Task` object shape: `{ id, text, completed, createdAt }`
    - Definisikan `SortMode` enum values: `'default'`, `'az'`, `'za'`, `'status'`
    - Definisikan objek `TodoManager` dengan `state: { tasks: [], sortMode: 'default', editingId: null }`
    - Implementasikan `validateTaskText(text)`: trim input; tolak jika kosong/hanya spasi; kembalikan `{ valid: boolean, error?: string }`
    - _Requirements: 3.2, 3.5_

  - [x] 6.2 Implementasikan operasi CRUD TodoManager
    - Implementasikan `addTask(text)`: panggil `validateTaskText`, buat Task baru dengan `id` via `crypto.randomUUID()` atau `Date.now().toString()`, push ke `state.tasks`, panggil `save()` dan `render()`; kembalikan `{ success, error? }`
    - Implementasikan `editTask(id, newText)`: panggil `validateTaskText(newText)`, update teks task jika valid, panggil `save()` dan `render()`; kembalikan `{ success, error? }`
    - Implementasikan `toggleTask(id)`: flip `completed` pada task dengan ID yang cocok, panggil `save()` dan `render()`
    - Implementasikan `deleteTask(id)`: filter keluar task dengan ID tersebut dari `state.tasks`, panggil `save()` dan `render()`
    - _Requirements: 3.1, 3.3, 3.4, 3.6, 3.7, 3.8_

  - [x] 6.3 Implementasikan sorting TodoManager (Tantangan 5: Sort Tasks)
    - Implementasikan `getSortedTasks()`: kembalikan salinan `state.tasks` yang diurutkan sesuai `state.sortMode` tanpa memutasi `state.tasks` asli
      - `'default'`: urutkan ascending berdasarkan `createdAt`
      - `'az'`: urutkan ascending berdasarkan `text.toLowerCase()`
      - `'za'`: urutkan descending berdasarkan `text.toLowerCase()`
      - `'status'`: `completed === false` sebelum `completed === true`; dalam kelompok yang sama, pertahankan urutan `createdAt`
    - Tambahkan dropdown sort ke HTML dengan opsi: "Default (Urutan Tambah)", "Sort A-Z", "Sort Z-A", "Status (Belum Selesai Dulu)"
    - Bind event listener pada dropdown untuk mengubah `sortMode`, simpan ke storage, panggil `render()`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [x] 6.4 Implementasikan `save()`, `init()`, dan `render()` TodoManager
    - Implementasikan `save()`: panggil `StorageManager.set(KEYS.TASKS, state.tasks)` dan `StorageManager.set(KEYS.SORT_PREF, state.sortMode)`
    - Implementasikan `init()`: load tasks dan sortMode dari StorageManager, default array kosong dan `'default'`, panggil `render()`; bind event listener pada form tambah task dan kontrol sort
    - Implementasikan `render()`: panggil `getSortedTasks()`, buat elemen DOM untuk setiap task (teks, tombol centang/edit/hapus, strikethrough jika selesai), tampilkan mode edit inline jika `editingId` aktif
    - _Requirements: 3.9, 3.10, 9.6, 9.7_

- [x] 7. Implementasi QuickLinks
  - [x] 7.1 Tulis modul `QuickLinks` di `js/app.js`
    - Definisikan `LinkItem` shape: `{ id, label, url }`
    - Definisikan objek `QuickLinks` dengan `state: { links: [] }`
    - Implementasikan `validateUrl(url)`: kembalikan `true` jika URL diawali `http://` atau `https://` DAN panjangnya ≤ 2048 karakter; kembalikan `false` untuk semua kasus lain
    - Implementasikan `validateLabel(label)`: kembalikan `true` jika hasil trim label memiliki setidaknya 1 karakter
    - Implementasikan `addLink(label, url)`: validasi label dan URL, tampilkan pesan kesalahan yang sesuai jika tidak valid, buat LinkItem baru, push ke `state.links`, panggil `save()` dan `render()`; kembalikan `{ success, error? }`
    - Implementasikan `deleteLink(id)`: filter keluar link dengan ID tersebut, panggil `save()` dan `render()`
    - Implementasikan `save()`: panggil `StorageManager.set(KEYS.LINKS, state.links)`
    - Implementasikan `init()`: load links dari StorageManager, default array kosong, panggil `render()`; bind event listener pada form tambah link
    - Implementasikan `render()`: buat elemen `<a target="_blank">` untuk setiap link beserta tombol hapus
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

- [x] 8. Implementasi CSS lengkap (layout, tema, komponen)
  - Tulis CSS di `css/style.css` menggunakan CSS custom properties untuk warna tema:
    - Definisikan variabel `--bg-primary`, `--bg-secondary`, `--text-primary`, `--accent` pada `:root` (light mode) dan override di `[data-theme="dark"]` (dark mode)
  - Implementasikan layout responsive (CSS Grid atau Flexbox) yang berfungsi dari 320px hingga 1920px
  - Tambahkan transition untuk theme toggle (< 200ms) agar perpindahan tema terasa mulus
  - Styling untuk semua komponen: greeting (waktu, tanggal, salam, input nama), timer (display MM:SS, tombol Start/Stop/Reset), todo list (termasuk strikethrough task selesai, dropdown sort), quick links, tombol, input field
  - Pastikan kontras warna memenuhi WCAG AA (4.5:1 untuk teks normal) pada kedua mode (light dan dark)
  - Pastikan semua tombol dan elemen interaktif memiliki `:focus-visible` indicator yang terlihat
  - Tambahkan atribut `aria-label` dan role yang sesuai pada elemen interaktif di `index.html`
  - _Requirements: 5.1, 5.2, 5.4, 11.3, 11.4_

- [x] 9. Inisialisasi dan wiring semua modul
  - [x] 9.1 Tulis fungsi inisialisasi utama di `js/app.js`
    - Tambahkan event listener `DOMContentLoaded` sebagai entry point
    - Panggil inisialisasi dalam urutan yang benar: `ThemeManager.init()`, `GreetingWidget.init()`, `FocusTimer.init()`, `TodoManager.init()`, `QuickLinks.init()`
    - Pastikan tidak ada modul yang saling bergantung secara siklikal; semua dependensi hanya ke `StorageManager`
    - Verifikasi secara manual di browser bahwa: tema teraplikasi tanpa flash, greeting menampilkan waktu berjalan, timer siap di 25:00, todo list dan quick links memuat data dari localStorage
    - _Requirements: 10.1, 10.3, 10.4_

- [ ] 10. Upload ke GitHub dan Deploy ke GitHub Pages
  - [-] 10.1 Push source code ke GitHub menggunakan GitHub Desktop
    - Buka GitHub Desktop, pastikan repository sudah terhubung ke remote GitHub
    - Tambahkan semua file ke commit: `index.html`, `css/style.css`, `js/app.js`, dan folder `.kiro/` (termasuk specs/life-dashboard/)
    - Tulis commit message yang deskriptif (contoh: "feat: implementasi Life Dashboard lengkap")
    - Klik "Push origin" untuk mengunggah ke repository GitHub
    - _Requirements: 10.1, 10.5_

  - [~] 10.2 Publish site menggunakan GitHub Pages
    - Buka repository di GitHub melalui browser
    - Pergi ke **Settings** → **Pages**
    - Di bagian "Source", pilih branch `main` (atau `master`) dan folder `/ (root)`
    - Klik **Save** dan tunggu beberapa menit hingga deployment selesai
    - Salin URL GitHub Pages yang diberikan (format: `https://<username>.github.io/<repo-name>/`) dan verifikasi aplikasi dapat diakses dan berfungsi penuh di browser
    - _Requirements: 10.5, 11.1_

---

## Notes

- Tidak ada setup pengujian yang diperlukan (NFR-1) — tidak ada unit test, property test, atau test runner
- Tantangan yang diimplementasikan: Tantangan 1 (Light/Dark Mode), Tantangan 2 (Custom Name), Tantangan 5 (Sort Tasks)
- Tantangan yang tidak diimplementasikan: Tantangan 3 (Custom Pomodoro Duration) dan Tantangan 4 (Prevent Duplicate Tasks)
- FocusTimer hanya mengimplementasikan Pomodoro 25 menit dasar tanpa fitur ubah durasi
- `StorageManager` adalah satu-satunya modul yang mengakses `localStorage` secara langsung; semua modul lain hanya melalui `StorageManager`
- ThemeManager harus di-inisialisasi pertama (atau via inline script di `<head>`) untuk mencegah FOUC
- Seluruh state dikelola secara in-memory per modul; tidak ada shared mutable global state

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1"] },
    { "id": 1, "tasks": ["3.1", "4.1", "5.1"] },
    { "id": 2, "tasks": ["6.1", "7.1"] },
    { "id": 3, "tasks": ["6.2", "6.3"] },
    { "id": 4, "tasks": ["6.4"] },
    { "id": 5, "tasks": ["9.1"] },
    { "id": 6, "tasks": ["10.1"] },
    { "id": 7, "tasks": ["10.2"] }
  ]
}
```
