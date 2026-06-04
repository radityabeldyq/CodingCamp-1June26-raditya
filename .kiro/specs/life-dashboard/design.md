# Design Document

## Overview

**To-Do List Life Dashboard** adalah single-page web application yang dibangun sepenuhnya dengan HTML, CSS, dan Vanilla JavaScript tanpa framework eksternal. Aplikasi ini berperan sebagai productivity dashboard personal yang berjalan sepenuhnya di sisi browser — tanpa server, tanpa dependensi jaringan, tanpa build tool.

Semua data disimpan secara persisten menggunakan `localStorage` API. Aplikasi memiliki lima widget utama yang ditampilkan dalam satu halaman: Greeting Widget, Focus Timer (Pomodoro), To-Do Manager, Quick Links, dan Theme Toggle.

### Tujuan Desain

- **Zero-dependency**: Tidak ada library, framework, atau CDN eksternal.
- **Persistence tanpa server**: Seluruh state aplikasi disimpan di `localStorage`.
- **Responsif**: Layout berfungsi dari 320px hingga 1920px.
- **No-flash theme loading**: Tema diterapkan sebelum render untuk menghindari FOUC (Flash of Unstyled Content).
- **Performa tinggi**: Load < 3 detik lokal, interaksi < 100ms.

---

## Architecture

Aplikasi ini menggunakan arsitektur **Module Pattern** berbasis IIFE dan object literal dalam satu file JavaScript. Tidak ada build step — file langsung dibuka di browser.

```
life-dashboard/
├── index.html          ← Satu file HTML utama
├── css/
│   └── style.css       ← Satu file CSS (tema, layout, komponen)
└── js/
    └── app.js          ← Satu file JS (semua logika aplikasi)
```

### Alur Data (Data Flow)

```
Browser Load
    │
    ▼
[index.html] ── muat ──► [css/style.css]
    │
    ▼
[js/app.js] dijalankan
    │
    ├─ StorageManager.load() ──► localStorage (baca semua kunci)
    │
    ├─ ThemeManager.init()   ──► apply class ke <html> (sebelum paint)
    │
    ├─ GreetingWidget.init() ──► DOM update + setInterval(1000ms)
    │
    ├─ FocusTimer.init()     ──► DOM update (durasi dari storage)
    │
    ├─ TodoManager.init()    ──► render task list dari storage
    │
    └─ QuickLinks.init()     ──► render link list dari storage

User Interaction
    │
    ▼
Event Handler (DOM event listener)
    │
    ├─ Update in-memory state
    ├─ StorageManager.save(key, value) ──► localStorage
    └─ Re-render DOM (targeted update, bukan full re-render)
```

### Pola Arsitektur

Setiap widget diimplementasikan sebagai **module object** dengan pola:

```js
const WidgetName = {
  state: { /* in-memory state */ },
  init()     { /* setup DOM, load dari storage, bind events */ },
  render()   { /* update DOM berdasarkan state */ },
  save()     { /* persist state ke localStorage via StorageManager */ },
};
```

Tidak ada shared mutable global state — setiap modul mengelola state-nya sendiri.

---

## Components and Interfaces

### 1. StorageManager

Modul singleton yang menangani seluruh operasi `localStorage`. Semua modul lain mengakses localStorage hanya melalui StorageManager.

```js
StorageManager = {
  KEYS: {
    TASKS:       'ld_tasks',
    LINKS:       'ld_links',
    THEME:       'ld_theme',
    USERNAME:    'ld_username',
    TIMER_DURATION: 'ld_timer_duration',
    SORT_PREF:   'ld_sort_pref',
  },
  get(key)         → any | null,    // JSON.parse dari localStorage
  set(key, value)  → void,          // JSON.stringify ke localStorage
  remove(key)      → void,          // hapus dari localStorage
}
```

### 2. ThemeManager

Mengelola light/dark mode. Di-inisialisasi **pertama kali** sebelum widget lain untuk mencegah flash.

```js
ThemeManager = {
  currentTheme: 'light' | 'dark',
  init()   → void,   // baca dari storage, apply ke <html>
  toggle() → void,   // flip currentTheme, apply + save
  apply()  → void,   // set/remove class 'dark' di <html>
}
```

HTML attribute yang digunakan: `data-theme="light"` atau `data-theme="dark"` pada elemen `<html>`.

### 3. GreetingWidget

Menampilkan waktu, tanggal, salam, dan nama pengguna.

```js
GreetingWidget = {
  state: { userName: string | null },
  init()           → void,   // load userName, start interval
  tick()           → void,   // dipanggil setiap detik oleh setInterval
  getGreeting(hour) → string, // returns 'Selamat Pagi/Siang/Sore/Malam'
  formatTime(date)  → string, // returns 'HH:MM'
  formatDate(date)  → string, // returns 'Senin, 02 Juni 2025'
  saveName(name)    → void,   // simpan ke storage, re-render
  render()          → void,   // update DOM elemen greeting
}
```

Interval: `setInterval(() => greetingWidget.tick(), 1000)` dimulai saat `init()`.

### 4. FocusTimer

Implements Pomodoro countdown timer.

```js
FocusTimer = {
  state: {
    durationMinutes: number,  // 1–99, default 25
    remainingSeconds: number,
    isRunning: boolean,
    intervalId: number | null,
  },
  init()                  → void,
  start()                 → void,   // mulai setInterval(1000ms)
  stop()                  → void,   // clearInterval
  reset()                 → void,   // stop + set remainingSeconds = duration * 60
  tick()                  → void,   // decrement, check zero
  setDuration(minutes)    → boolean, // validate + set, returns success
  formatDisplay()         → string, // 'MM:SS'
  render()                → void,
  showCompletionMessage() → void,
}
```

### 5. TodoManager

Mengelola CRUD task list dengan deduplication dan sorting.

```js
TodoManager = {
  state: {
    tasks: Task[],       // urutan kanonical (urutan tambah)
    sortMode: SortMode,
    editingId: string | null,
  },
  init()                          → void,
  addTask(text)                   → { success: boolean, error?: string },
  editTask(id, newText)           → { success: boolean, error?: string },
  toggleTask(id)                  → void,
  deleteTask(id)                  → void,
  getSortedTasks()                → Task[],  // sorted view, tidak mutasi state.tasks
  validateTaskText(text, excludeId?) → { valid: boolean, error?: string },
  render()                        → void,
  save()                          → void,
}
```

**Task object:**
```js
Task = {
  id:        string,   // crypto.randomUUID() atau Date.now().toString()
  text:      string,   // teks task (sudah di-trim)
  completed: boolean,
  createdAt: number,   // timestamp untuk sort default
}
```

**SortMode enum:**
```js
SortMode = 'default' | 'az' | 'za' | 'status'
```

### 6. QuickLinks

Mengelola CRUD link bookmarks.

```js
QuickLinks = {
  state: {
    links: LinkItem[],
  },
  init()                  → void,
  addLink(label, url)     → { success: boolean, error?: string },
  deleteLink(id)          → void,
  validateUrl(url)        → boolean,
  validateLabel(label)    → boolean,
  render()                → void,
  save()                  → void,
}
```

**LinkItem object:**
```js
LinkItem = {
  id:    string,
  label: string,  // 1–100 karakter non-spasi, sudah di-trim
  url:   string,  // harus diawali http:// atau https://, maks 2048 char
}
```

---

## Data Models

### localStorage Schema

Semua data disimpan sebagai JSON string di `localStorage`. Kunci menggunakan prefix `ld_` untuk menghindari konflik dengan key lain.

#### `ld_tasks` — Array of Task

```json
[
  {
    "id": "1717293600000",
    "text": "Belajar JavaScript",
    "completed": false,
    "createdAt": 1717293600000
  },
  {
    "id": "1717293700000",
    "text": "Membuat portfolio",
    "completed": true,
    "createdAt": 1717293700000
  }
]
```

#### `ld_links` — Array of LinkItem

```json
[
  {
    "id": "1717293800000",
    "label": "GitHub",
    "url": "https://github.com"
  }
]
```

#### `ld_theme` — String

```json
"dark"
```

Nilai valid: `"light"` | `"dark"`. Default (tidak ada kunci): `"light"`.

#### `ld_username` — String

```json
"Raditya"
```

Tidak ada kunci → tidak ada nama → salam tanpa nama.

#### `ld_timer_duration` — Number

```json
25
```

Nilai valid: integer 1–99. Default (tidak ada kunci): `25`.

#### `ld_sort_pref` — String

```json
"az"
```

Nilai valid: `"default"` | `"az"` | `"za"` | `"status"`. Default: `"default"`.

### State Initialization Order

```
1. StorageManager (hanya helper, tidak ada init state)
2. ThemeManager.init()       ← PERTAMA, sebelum DOM paint
3. GreetingWidget.init()
4. FocusTimer.init()
5. TodoManager.init()
6. QuickLinks.init()
```

ThemeManager diinisialisasi lebih awal (idealnya via `<script>` inline kecil di `<head>`) untuk menghindari flash of wrong theme.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Greeting time mapping

*For any* integer hour value dalam rentang [0, 23], fungsi `getGreeting(hour)` SHALL mengembalikan tepat satu dari empat string yang valid ("Selamat Pagi", "Selamat Siang", "Selamat Sore", "Selamat Malam") sesuai dengan rentang yang didefinisikan di requirements — dan tidak pernah mengembalikan string kosong, undefined, atau nilai lain.

**Validates: Requirements 1.3, 1.4, 1.5, 1.6**

---

### Property 2: Task whitespace rejection

*For any* string yang setelah di-trim menghasilkan string kosong (termasuk string kosong murni dan string yang hanya berisi karakter whitespace), baik `addTask()` maupun `editTask()` SHALL menolak input tersebut, mengembalikan `{ success: false }`, dan state task list SHALL tidak berubah.

**Validates: Requirements 3.2, 3.5**

---

### Property 3: Task deduplication on add (case-insensitive)

*For any* task list yang tidak kosong dan any string teks baru yang setelah di-trim dan di-lowercase identik dengan teks task yang sudah ada di daftar, `addTask()` SHALL menolak penambahan, mengembalikan `{ success: false }`, dan panjang task list SHALL tetap sama.

**Validates: Requirements 8.1**

---

### Property 4: Task deduplication on edit (case-insensitive)

*For any* task list dengan dua atau lebih task, jika teks hasil edit sebuah task (setelah di-trim, case-insensitive) identik dengan teks task lain yang berbeda ID, maka `editTask()` SHALL menolak perubahan, mengembalikan `{ success: false }`, dan teks task target SHALL tetap sama dengan nilai sebelum edit.

**Validates: Requirements 8.2, 8.3**

---

### Property 5: Task toggle round-trip

*For any* task dalam task list, memanggil `toggleTask(id)` dua kali berturut-turut SHALL mengembalikan status `completed` task tersebut ke nilai semula, sementara teks dan ID task tidak berubah.

**Validates: Requirements 3.6, 3.7**

---

### Property 6: Task persistence round-trip

*For any* task list (termasuk task dengan berbagai kombinasi teks dan status), memanggil `save()` diikuti dengan `load()` SHALL menghasilkan task list yang identik — teks, status `completed`, ID, dan urutan array harus sama persis dengan state sebelum disimpan.

**Validates: Requirements 3.9, 3.10**

---

### Property 7: Sort default — preserves insertion order

*For any* task list, menerapkan sort mode "default" SHALL menghasilkan tampilan task yang diurutkan berdasarkan nilai `createdAt` secara ascending (task yang lebih dulu ditambahkan muncul lebih dulu), dan operasi sort tersebut SHALL tidak mengubah isi array kanonik `state.tasks`.

**Validates: Requirements 9.5**

---

### Property 8: Sort A-Z dan Z-A correctness

*For any* task list dengan dua atau lebih task, menerapkan sort A-Z SHALL menghasilkan urutan di mana untuk setiap pasangan task berurutan pada posisi i dan i+1, `text[i].toLowerCase() <= text[i+1].toLowerCase()`; menerapkan sort Z-A SHALL menghasilkan kebalikannya.

**Validates: Requirements 9.2, 9.3**

---

### Property 9: Sort by status — incomplete before complete

*For any* task list, menerapkan sort "Status" SHALL menghasilkan urutan di mana seluruh task dengan `completed === false` muncul sebelum seluruh task dengan `completed === true`; tidak boleh ada task yang sudah selesai muncul sebelum task yang belum selesai.

**Validates: Requirements 9.4**

---

### Property 10: Quick Links URL validation

*For any* string URL, fungsi `validateUrl()` SHALL mengembalikan `true` jika dan hanya jika URL diawali dengan `http://` atau `https://` DAN panjang total string tidak melebihi 2048 karakter. Untuk semua string lain (skema berbeda, URL kosong, terlalu panjang), SHALL mengembalikan `false`.

**Validates: Requirements 4.2**

---

### Property 11: Timer duration boundary

*For any* nilai yang diberikan sebagai argument ke `setDuration()`, fungsi tersebut SHALL mengembalikan `true` dan mengubah durasi hanya jika nilai tersebut adalah bilangan bulat dalam rentang [1, 99] inklusif. Untuk semua nilai lain (< 1, > 99, bukan integer, NaN, string), SHALL mengembalikan `false` dan durasi timer SHALL tidak berubah.

**Validates: Requirements 7.3**

---

### Property 12: Theme toggle round-trip

*For any* tema awal yang valid ("light" atau "dark"), memanggil `ThemeManager.toggle()` dua kali berturut-turut SHALL mengembalikan `currentTheme` ke nilai awal, dan nilai yang tersimpan di localStorage SHALL selalu konsisten (sama) dengan `currentTheme` yang sedang aktif setelah setiap pemanggilan `toggle()`.

**Validates: Requirements 5.2, 5.3**

---

## Error Handling

### Input Validation Errors

Setiap fungsi yang menerima input dari pengguna menggunakan pola return value `{ success: boolean, error?: string }` daripada melempar exception, sehingga UI layer dapat menampilkan pesan error yang deskriptif.

| Skenario | Penanganan |
|---|---|
| Task text kosong/spasi | Tolak + tampilkan pesan, fokus ke input |
| Task text duplikat (add) | Tolak + tampilkan pesan, pertahankan input |
| Task text duplikat (edit) | Tolak + pertahankan mode edit |
| URL tidak valid | Tolak + tampilkan format yang diperlukan |
| Label link kosong | Tolak + tampilkan pesan |
| Durasi timer tidak valid | Tolak + tampilkan rentang valid (1–99) |
| Durasi timer saat running | Tolak + tampilkan pesan "hentikan timer dulu" |
| Start timer saat 00:00 | Abaikan aksi (no-op) |

### localStorage Errors

`localStorage` dapat melempar `SecurityError` (private mode) atau `QuotaExceededError`. StorageManager membungkus semua operasi dalam try-catch:

```js
set(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('[StorageManager] Failed to save:', key, e);
    // Aplikasi tetap berjalan dengan in-memory state
  }
}
```

### Data Corruption (localStorage)

Saat memuat data dari localStorage, jika `JSON.parse()` gagal, modul akan fallback ke nilai default (array kosong untuk tasks/links, nilai default untuk primitif):

```js
get(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.warn('[StorageManager] Corrupt data for key:', key);
    return null;
  }
}
```

### Timer Edge Cases

- `setInterval` drift: Timer menggunakan counter `remainingSeconds` yang di-decrement per interval — tidak menghitung selisih waktu aktual. Untuk use-case Pomodoro, akurasi ini memadai.
- Multiple `start()` calls: Guard dengan cek `isRunning` sebelum membuat interval baru.
- Tab visibility: Timer tetap berjalan di background (sesuai behavior `setInterval` browser).

---

## Testing Strategy

### Overview

Strategi pengujian menggunakan dua pendekatan komplementer:
1. **Unit tests / example-based tests**: Untuk skenario konkret, edge case, dan integrasi antar komponen.
2. **Property-based tests (PBT)**: Untuk memverifikasi properti universal yang harus berlaku di semua input valid.

Library PBT yang direkomendasikan: **[fast-check](https://fast-check.dev/)** (JavaScript).

### Property-Based Tests

Setiap property dari bagian Correctness Properties diimplementasikan sebagai satu PBT dengan minimum **100 iterasi**.

Tag format: `// Feature: life-dashboard, Property {N}: {property_text}`

| Property | Test | Generator |
|---|---|---|
| P1: Greeting time mapping | `fc.integer({min:0, max:23})` → verify output ∈ valid greetings, never empty | integer 0–23 |
| P2: Whitespace rejection | `fc.stringMatching(/^\s*$/)` → addTask/editTask → failure, list unchanged | whitespace strings |
| P3: Task dedup on add | generate list + text variant matching existing (case variants) → list size unchanged | string arrays |
| P4: Task dedup on edit | generate list ≥2 tasks, edit to match another's text (case variants) → rejection | task arrays |
| P5: Task toggle round-trip | arbitrary task → toggle twice → completed returns to original value | task objects |
| P6: Task persistence round-trip | arbitrary task list → save → load → identical list | task arrays |
| P7: Sort default stability | arbitrary task array → sort default → verify ascending createdAt order | task arrays |
| P8: Sort A-Z / Z-A | arbitrary task array → sort → verify pairwise text comparison | task arrays |
| P9: Sort by status | arbitrary task array → sort status → all incomplete before complete | task arrays |
| P10: URL validation | valid URLs (http/https, ≤2048) → true; invalid → false | URL generators |
| P11: Timer duration boundary | `fc.integer()` + floats → setDuration → accept iff in [1,99] integer | arbitrary numbers |
| P12: Theme toggle round-trip | initial theme → toggle twice → same theme, localStorage consistent | 'light'/'dark' |

### Unit Tests

Unit tests menggunakan framework minimal (atau custom test runner) untuk menguji:

**GreetingWidget:**
- `formatTime(new Date(...))` → format HH:MM yang benar
- `formatDate(new Date(...))` → format hari Indonesia yang benar
- Batas tepat jam (05:00, 12:00, 15:00, 18:00, 00:00)

**FocusTimer:**
- Start saat `remainingSeconds === 0` → no-op
- Reset mengembalikan ke `durationMinutes * 60`
- `formatDisplay()` untuk nilai menit/detik satu digit (01:05)

**TodoManager:**
- Urutan sort "Status": task belum selesai muncul sebelum selesai
- Edit berhasil dengan teks valid yang tidak duplikat
- Delete menghilangkan task dengan ID yang tepat

**QuickLinks:**
- URL dengan berbagai skema (ftp://, mailto:, dll) → rejected
- URL valid dengan path panjang → accepted
- Label dengan spasi di awal/akhir → di-trim

**StorageManager:**
- Data korup (invalid JSON) → fallback ke null tanpa throw
- QuotaExceededError → log warning, tidak crash

### Integration Tests

- Load page → data dari localStorage diterapkan (tema, tasks, links, nama, durasi)
- Theme tidak flash: class diterapkan sebelum render konten utama
- Sort preference dipersist dan dipulihkan saat reload

### Accessibility & Visual

- Semua tombol memiliki label yang dapat dibaca screen reader
- Kontras warna memenuhi WCAG AA untuk teks normal (4.5:1)
- Focus indicator terlihat untuk navigasi keyboard
- Responsive layout diuji di 320px, 768px, 1280px, 1920px

### Performance Checks

- Cold load (cache kosong): < 3 detik
- Klik tombol → perubahan DOM: < 100ms (measure dengan `performance.now()`)
- Tidak ada memory leak dari `setInterval` (cleared saat komponen reset)
