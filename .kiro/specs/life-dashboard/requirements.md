# Requirements Document

## Introduction

**To-Do List Life Dashboard** adalah web application berbasis HTML, CSS, dan Vanilla JavaScript yang dirancang sebagai dashboard produktivitas personal. Aplikasi ini membantu pengguna mengelola tugas harian, memantau waktu dengan teknik Pomodoro, mengakses tautan favorit dengan cepat, serta mendapatkan greeting kontekstual berdasarkan waktu. Semua data disimpan di browser melalui Local Storage tanpa memerlukan backend atau setup tambahan.

Proyek ini ditujukan untuk peserta CodingCamp sebagai latihan implementasi web app modern menggunakan teknologi dasar web.

---

## Glossary

- **Dashboard**: Halaman utama aplikasi yang menampilkan semua widget secara terpadu.
- **Greeting_Widget**: Komponen UI yang menampilkan waktu, tanggal, dan pesan salam berdasarkan waktu hari.
- **Focus_Timer**: Komponen UI yang mengimplementasikan teknik Pomodoro dengan timer hitung mundur.
- **Todo_Manager**: Komponen UI dan logika untuk mengelola daftar tugas.
- **Task**: Satu item pekerjaan yang memiliki teks deskripsi dan status selesai/belum.
- **Quick_Links**: Komponen UI untuk menyimpan dan membuka tautan website favorit.
- **Link_Item**: Satu entri tautan yang memiliki label dan URL.
- **Local_Storage**: Mekanisme penyimpanan data di browser pengguna (browser's `localStorage` API).
- **Storage_Manager**: Modul JavaScript yang menangani semua operasi baca/tulis ke Local Storage.
- **Theme_Manager**: Modul JavaScript yang mengelola mode tampilan terang (light) dan gelap (dark).
- **Session**: Satu siklus timer Pomodoro yang berjalan dari durasi penuh hingga nol.
- **Modern Browser**: Browser versi terkini dari Chrome, Firefox, Edge, atau Safari.

---

## Requirements

---

### Requirement 1: Greeting Kontekstual

**User Story:** Sebagai pengguna, saya ingin melihat waktu, tanggal, dan sapaan yang sesuai dengan waktu hari ini, agar saya merasa disambut dan langsung tahu konteks waktu saat membuka dashboard.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL menampilkan waktu saat ini dalam format HH:MM (dua digit jam 24-jam dan dua digit menit, contoh: 09:05, 14:30).
2. THE Greeting_Widget SHALL menampilkan tanggal saat ini dalam format hari, DD bulan YYYY (contoh: Senin, 02 Juni 2025), menggunakan nama hari dan bulan dalam Bahasa Indonesia.
3. IF jam lokal browser berada di rentang 05:00–11:59 (inklusif), THEN THE Greeting_Widget SHALL menampilkan pesan salam "Selamat Pagi".
4. IF jam lokal browser berada di rentang 12:00–14:59 (inklusif), THEN THE Greeting_Widget SHALL menampilkan pesan salam "Selamat Siang".
5. IF jam lokal browser berada di rentang 15:00–17:59 (inklusif), THEN THE Greeting_Widget SHALL menampilkan pesan salam "Selamat Sore".
6. IF jam lokal browser berada di rentang 18:00–23:59 atau 00:00–04:59 (inklusif), THEN THE Greeting_Widget SHALL menampilkan pesan salam "Selamat Malam".
7. THE Greeting_Widget SHALL memperbarui tampilan waktu, tanggal, dan pesan salam setiap 1 detik menggunakan waktu lokal browser tanpa memerlukan reload halaman.

---

### Requirement 2: Focus Timer (Pomodoro)

**User Story:** Sebagai pengguna, saya ingin menggunakan timer Pomodoro 25 menit, agar saya dapat bekerja dalam sesi fokus yang terstruktur.

#### Acceptance Criteria

1. THE Focus_Timer SHALL menampilkan hitung mundur dalam format MM:SS (dua digit menit dan dua digit detik, contoh: 25:00, 04:09).
2. WHEN halaman pertama kali dimuat dan tidak ada preferensi durasi tersimpan di Local Storage, THE Focus_Timer SHALL menampilkan durasi awal 25 menit (25:00).
3. WHEN pengguna menekan tombol Start dan timer dalam keadaan berhenti, THE Focus_Timer SHALL mulai menghitung mundur tepat 1 detik per interval menggunakan `setInterval`.
4. WHEN pengguna menekan tombol Stop dan timer sedang berjalan, THE Focus_Timer SHALL menghentikan hitung mundur dan mempertahankan sisa waktu yang ditampilkan.
5. WHEN pengguna menekan tombol Reset, THE Focus_Timer SHALL menghentikan hitung mundur dan mengembalikan tampilan ke durasi awal yang berlaku saat itu (termasuk durasi kustom jika telah diatur).
6. WHEN hitung mundur mencapai 00:00, THE Focus_Timer SHALL menghentikan timer secara otomatis.
7. WHEN hitung mundur mencapai 00:00, THE Focus_Timer SHALL menampilkan pesan teks yang terlihat di halaman untuk memberitahu pengguna bahwa sesi fokus telah selesai.
8. IF pengguna menekan tombol Start ketika tampilan timer menunjukkan 00:00, THEN THE Focus_Timer SHALL mengabaikan aksi tersebut dan tidak memulai hitung mundur baru.

---

### Requirement 3: To-Do List

**User Story:** Sebagai pengguna, saya ingin mengelola daftar tugas saya, agar saya dapat melacak pekerjaan yang perlu dilakukan dan yang sudah selesai.

#### Acceptance Criteria

1. WHEN pengguna mengetikkan teks tugas (minimal 1 karakter non-spasi) dan menekan tombol tambah atau tombol Enter, THE Todo_Manager SHALL menambahkan Task baru ke daftar dengan status belum selesai dan teks yang telah di-trim dari spasi awal/akhir.
2. IF teks input kosong atau hanya berisi spasi setelah di-trim, THEN THE Todo_Manager SHALL menolak penambahan Task, tidak menambahkan item ke daftar, dan input field tetap terfokus.
3. WHEN pengguna menekan tombol edit pada sebuah Task, THE Todo_Manager SHALL menampilkan input yang sudah terisi dengan teks Task saat ini sehingga pengguna dapat mengubahnya.
4. WHEN pengguna mengonfirmasi hasil edit (menekan Enter atau tombol simpan), THE Todo_Manager SHALL memperbarui teks Task dengan nilai baru yang telah di-trim, asalkan teks tidak kosong.
5. IF teks hasil edit kosong atau hanya berisi spasi setelah di-trim, THEN THE Todo_Manager SHALL menolak perubahan dan mempertahankan teks Task yang lama.
6. WHEN pengguna menekan tombol centang (mark as done) pada sebuah Task dengan status belum selesai, THE Todo_Manager SHALL mengubah status Task menjadi selesai dan menampilkan strikethrough pada teks Task.
7. WHEN pengguna menekan tombol centang pada Task yang sudah selesai, THE Todo_Manager SHALL mengubah status Task kembali menjadi belum selesai dan menghapus strikethrough.
8. WHEN pengguna menekan tombol hapus pada sebuah Task, THE Todo_Manager SHALL menghapus Task tersebut dari daftar segera tanpa konfirmasi tambahan.
9. THE Storage_Manager SHALL menyimpan seluruh data daftar Task ke Local Storage setiap kali terjadi perubahan (tambah, edit, toggle selesai, hapus).
10. WHEN halaman dimuat ulang, THE Storage_Manager SHALL memuat kembali seluruh data Task dari Local Storage dan menampilkan daftar tugas dalam urutan yang sama seperti sebelum reload.

---

### Requirement 4: Quick Links

**User Story:** Sebagai pengguna, saya ingin menyimpan tautan ke website favorit saya di dashboard, agar saya dapat mengaksesnya dengan cepat tanpa perlu mengetik URL.

#### Acceptance Criteria

1. WHEN pengguna memasukkan label (1–100 karakter non-spasi) dan URL yang valid lalu menekan tombol tambah, THE Quick_Links SHALL menambahkan Link_Item baru ke daftar tautan.
2. IF URL yang dimasukkan tidak diawali dengan `http://` atau `https://` atau panjangnya melebihi 2048 karakter, THEN THE Quick_Links SHALL menolak penambahan Link_Item dan menampilkan pesan kesalahan yang menjelaskan format URL yang diperlukan.
3. IF field label kosong atau hanya berisi spasi, THEN THE Quick_Links SHALL menolak penambahan Link_Item dan menampilkan pesan kesalahan yang meminta label diisi.
4. WHEN pengguna menekan sebuah Link_Item, THE Quick_Links SHALL membuka URL yang tersimpan di tab browser yang baru menggunakan `target="_blank"`.
5. WHEN pengguna menekan tombol hapus pada sebuah Link_Item, THE Quick_Links SHALL menghapus tautan tersebut dari daftar segera tanpa konfirmasi tambahan.
6. THE Storage_Manager SHALL menyimpan seluruh data Link_Item ke Local Storage setiap kali terjadi perubahan (tambah, hapus).
7. WHEN halaman dimuat ulang dan tidak ada Link_Item tersimpan di Local Storage, THE Quick_Links SHALL menampilkan daftar tautan kosong.
8. WHEN halaman dimuat ulang dan terdapat Link_Item tersimpan di Local Storage, THE Storage_Manager SHALL memuat kembali seluruh data Link_Item dan menampilkannya.

---

### Requirement 5: Light/Dark Mode Toggle (Tantangan 1)

**User Story:** Sebagai pengguna, saya ingin dapat beralih antara mode terang dan gelap, agar tampilan dashboard nyaman dilihat sesuai kondisi pencahayaan sekitar.

#### Acceptance Criteria

1. THE Dashboard SHALL menyediakan tombol toggle yang terlihat jelas untuk beralih antara light mode dan dark mode, dengan label atau ikon yang mengindikasikan mode saat ini.
2. WHEN pengguna menekan tombol toggle, THE Theme_Manager SHALL menerapkan kelas CSS atau atribut data pada elemen `<body>` atau `<html>` yang mengubah skema warna seluruh Dashboard ke mode yang berlawanan dalam waktu kurang dari 200 milidetik.
3. THE Storage_Manager SHALL menyimpan nilai preferensi mode ("light" atau "dark") ke Local Storage di bawah kunci yang konsisten setiap kali pengguna mengubah mode.
4. WHEN halaman dimuat ulang, THE Theme_Manager SHALL membaca preferensi mode dari Local Storage dan menerapkan kelas atau atribut yang sesuai pada elemen root sebelum browser merender konten halaman, sehingga tidak terjadi kedipan (flash) pada mode yang salah.
5. IF tidak ada preferensi mode tersimpan di Local Storage, THEN THE Theme_Manager SHALL menerapkan light mode sebagai default.

---

### Requirement 6: Custom Name pada Greeting (Tantangan 2)

**User Story:** Sebagai pengguna, saya ingin memasukkan nama saya sendiri, agar greeting yang ditampilkan terasa lebih personal.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL menyediakan input field dan tombol konfirmasi untuk pengguna memasukkan dan menyimpan nama mereka.
2. WHEN pengguna memasukkan nama (minimal 1 karakter non-spasi) dan menekan tombol konfirmasi atau Enter, THE Greeting_Widget SHALL menampilkan nama tersebut sebagai bagian dari pesan salam dalam format "[Salam], [Nama]!" (contoh: "Selamat Pagi, Raditya!").
3. IF nama yang dimasukkan kosong atau hanya berisi spasi setelah di-trim, THEN THE Greeting_Widget SHALL menampilkan pesan salam tanpa nama (hanya "[Salam]") dan menghapus nama tersimpan dari Local Storage jika ada.
4. THE Storage_Manager SHALL menyimpan nama pengguna ke Local Storage di bawah kunci yang konsisten setiap kali pengguna mengonfirmasi nama baru.
5. WHEN halaman dimuat ulang dan terdapat nama tersimpan di Local Storage, THE Greeting_Widget SHALL memuat nama tersebut dan langsung menampilkannya dalam pesan salam tanpa aksi tambahan dari pengguna.
6. WHEN halaman dimuat ulang dan tidak ada nama tersimpan di Local Storage, THE Greeting_Widget SHALL menampilkan pesan salam tanpa nama.

---

### Requirement 7: Ubah Durasi Pomodoro (Tantangan 3)

**User Story:** Sebagai pengguna, saya ingin mengatur durasi timer Pomodoro sendiri, agar saya dapat menyesuaikan sesi fokus dengan kebutuhan saya.

#### Acceptance Criteria

1. THE Focus_Timer SHALL menyediakan input number dan tombol konfirmasi untuk pengguna memasukkan durasi timer dalam satuan menit (bulat).
2. WHEN pengguna memasukkan angka valid dan menekan tombol konfirmasi, dan timer dalam keadaan berhenti, THE Focus_Timer SHALL memperbarui durasi awal menjadi nilai baru dan menampilkan nilai tersebut dalam format MM:SS.
3. IF durasi yang dimasukkan bukan bilangan bulat positif (≥1) atau lebih dari 99 menit, THEN THE Focus_Timer SHALL menolak perubahan, menampilkan pesan kesalahan, dan mempertahankan durasi awal yang sedang berlaku.
4. IF timer sedang berjalan ketika pengguna menekan tombol konfirmasi durasi, THEN THE Focus_Timer SHALL menolak perubahan dan menampilkan pesan bahwa timer harus dihentikan terlebih dahulu.
5. THE Storage_Manager SHALL menyimpan preferensi durasi Pomodoro ke Local Storage setiap kali pengguna berhasil mengonfirmasi durasi baru.
6. WHEN halaman dimuat ulang dan terdapat preferensi durasi tersimpan di Local Storage, THE Focus_Timer SHALL menggunakan nilai tersebut sebagai durasi awal dan menampilkannya dalam format MM:SS.

---

### Requirement 8: Pencegahan Duplikat Task (Tantangan 4)

**User Story:** Sebagai pengguna, saya ingin sistem mencegah saya menambahkan tugas yang sudah ada, agar daftar tugas saya tetap bersih dan tidak redundan.

#### Acceptance Criteria

1. IF teks Task baru (setelah di-trim, case-insensitive) identik dengan teks Task yang sudah ada di daftar, THEN THE Todo_Manager SHALL menolak penambahan dan menampilkan pesan peringatan kepada pengguna, serta membiarkan input field tetap berisi teks yang dimasukkan.
2. WHEN pengguna mengonfirmasi hasil edit sebuah Task, THE Todo_Manager SHALL memeriksa apakah teks hasil edit (setelah di-trim, case-insensitive) identik dengan teks Task lain yang sudah ada di daftar.
3. IF teks hasil edit identik (case-insensitive) dengan Task lain yang sudah ada, THEN THE Todo_Manager SHALL menolak perubahan, menampilkan pesan peringatan, dan mempertahankan mode edit agar pengguna dapat memperbaikinya.

---

### Requirement 9: Sort Tasks (Tantangan 5)

**User Story:** Sebagai pengguna, saya ingin mengurutkan daftar tugas saya, agar saya dapat memprioritaskan atau mengelompokkan tugas dengan mudah.

#### Acceptance Criteria

1. THE Todo_Manager SHALL menyediakan dropdown atau kontrol pilihan dengan opsi: "Default (Urutan Tambah)", "Sort A-Z", "Sort Z-A", dan "Status (Belum Selesai Dulu)".
2. WHEN pengguna memilih opsi "Sort A-Z", THE Todo_Manager SHALL menampilkan daftar Task diurutkan berdasarkan teks deskripsi secara ascending (A ke Z, case-insensitive).
3. WHEN pengguna memilih opsi "Sort Z-A", THE Todo_Manager SHALL menampilkan daftar Task diurutkan berdasarkan teks deskripsi secara descending (Z ke A, case-insensitive).
4. WHEN pengguna memilih opsi "Status (Belum Selesai Dulu)", THE Todo_Manager SHALL menampilkan Task yang belum selesai sebelum Task yang sudah selesai; Task dalam kelompok yang sama diurutkan berdasarkan urutan penambahan awal.
5. WHEN pengguna memilih opsi "Default (Urutan Tambah)", THE Todo_Manager SHALL menampilkan daftar Task sesuai urutan penambahan awal (indeks posisi dalam array).
6. THE Storage_Manager SHALL menyimpan preferensi sort yang dipilih ke Local Storage setiap kali pengguna mengubah opsi.
7. WHEN halaman dimuat ulang, THE Todo_Manager SHALL memuat preferensi sort dari Local Storage dan menerapkannya pada daftar Task; IF tidak ada preferensi tersimpan, THEN opsi "Default (Urutan Tambah)" SHALL digunakan.

---

### Requirement 10: Batasan Teknis dan Struktur File

**User Story:** Sebagai peserta CodingCamp, saya ingin membangun aplikasi menggunakan teknologi web dasar tanpa framework, agar saya berlatih fundamental HTML, CSS, dan JavaScript secara langsung.

#### Acceptance Criteria

1. THE Dashboard SHALL diimplementasikan menggunakan HTML, CSS, dan Vanilla JavaScript tanpa library atau framework eksternal (tidak menggunakan React, Vue, jQuery, dll).
2. THE Dashboard SHALL menggunakan tepat satu file CSS yang ditempatkan di dalam folder `css/`.
3. THE Dashboard SHALL menggunakan tepat satu file JavaScript yang ditempatkan di dalam folder `js/`.
4. THE Storage_Manager SHALL menggunakan browser `localStorage` API sebagai satu-satunya mekanisme penyimpanan data; tidak ada panggilan ke server atau API eksternal.
5. THE Dashboard SHALL dapat diakses dan berfungsi penuh di Modern Browser (Chrome, Firefox, Edge, Safari) versi terkini tanpa plugin tambahan.

---

### Requirement 11: Performa dan Kualitas Antarmuka

**User Story:** Sebagai pengguna, saya ingin dashboard berjalan cepat dan tampilannya bersih, agar pengalaman menggunakan aplikasi ini menyenangkan dan tidak mengganggu fokus.

#### Acceptance Criteria

1. THE Dashboard SHALL dapat dimuat dan menampilkan seluruh konten dalam waktu kurang dari 3 detik pada koneksi lokal (membuka file secara langsung di browser).
2. WHEN pengguna berinteraksi dengan elemen apapun (klik tombol, input teks), THE Dashboard SHALL memberikan respons visual dalam waktu kurang dari 100 milidetik.
3. THE Dashboard SHALL menerapkan hierarki visual yang jelas dengan ukuran font, kontras warna, dan jarak antar elemen yang konsisten sehingga pengguna dapat membaca seluruh konten tanpa kesulitan.
4. THE Dashboard SHALL menampilkan tata letak yang dapat digunakan (usable) pada lebar layar minimal 320px hingga 1920px.
