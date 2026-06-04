// js/app.js — Life Dashboard
// Semua modul implementasi widget dashboard

// ============================================================
// StorageManager — satu-satunya modul yang mengakses localStorage
// ============================================================
const StorageManager = {
  KEYS: {
    TASKS:          'ld_tasks',
    LINKS:          'ld_links',
    THEME:          'ld_theme',
    USERNAME:       'ld_username',
    TIMER_DURATION: 'ld_timer_duration',
    SORT_PREF:      'ld_sort_pref',
  },

  /**
   * Membaca nilai dari localStorage. Mengembalikan null jika tidak ada atau
   * data korup (JSON.parse gagal).
   * @param {string} key
   * @returns {any|null}
   */
  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : null;
    } catch (e) {
      console.warn('[StorageManager] Corrupt data for key:', key, e);
      return null;
    }
  },

  /**
   * Menyimpan nilai ke localStorage sebagai JSON.
   * @param {string} key
   * @param {any} value
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('[StorageManager] Failed to save:', key, e);
      // Aplikasi tetap berjalan dengan in-memory state
    }
  },

  /**
   * Menghapus kunci dari localStorage.
   * @param {string} key
   */
  remove(key) {
    localStorage.removeItem(key);
  },
};

// ============================================================
// GreetingWidget — Waktu, tanggal, salam kontekstual, dan nama
// ============================================================
const GreetingWidget = {
  state: {
    userName: null,
  },

  // Nama hari dalam Bahasa Indonesia (0 = Minggu, 6 = Sabtu)
  _HARI: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],

  // Nama bulan dalam Bahasa Indonesia (0 = Januari, 11 = Desember)
  _BULAN: [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ],

  /**
   * Mengembalikan salam berdasarkan jam (0–23).
   * 5–11  → 'Selamat Pagi'
   * 12–14 → 'Selamat Siang'
   * 15–17 → 'Selamat Sore'
   * 18–23 dan 0–4 → 'Selamat Malam'
   * @param {number} hour — jam dalam rentang [0, 23]
   * @returns {string}
   */
  getGreeting(hour) {
    if (hour >= 5 && hour <= 11) return 'Selamat Pagi';
    if (hour >= 12 && hour <= 14) return 'Selamat Siang';
    if (hour >= 15 && hour <= 17) return 'Selamat Sore';
    return 'Selamat Malam'; // 18–23 dan 0–4
  },

  /**
   * Memformat objek Date ke string 'HH:MM' dengan zero-padding (24-jam).
   * @param {Date} date
   * @returns {string}
   */
  formatTime(date) {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  },

  /**
   * Memformat objek Date ke string 'Hari, DD Bulan YYYY' dalam Bahasa Indonesia.
   * Contoh: 'Senin, 02 Juni 2025'
   * @param {Date} date
   * @returns {string}
   */
  formatDate(date) {
    const namaHari  = this._HARI[date.getDay()];
    const tanggal   = String(date.getDate()).padStart(2, '0');
    const namaBulan = this._BULAN[date.getMonth()];
    const tahun     = date.getFullYear();
    return `${namaHari}, ${tanggal} ${namaBulan} ${tahun}`;
  },

  /**
   * Dipanggil setiap detik oleh setInterval. Mengambil waktu sekarang dan
   * memperbarui elemen DOM waktu, tanggal, dan salam.
   */
  tick() {
    const now      = new Date();
    const timeEl   = document.getElementById('greeting-time');
    const dateEl   = document.getElementById('greeting-date');
    const msgEl    = document.getElementById('greeting-message');

    if (timeEl) timeEl.textContent = this.formatTime(now);
    if (dateEl) dateEl.textContent = this.formatDate(now);
    if (msgEl)  msgEl.textContent  = this._buildMessage(now.getHours());
  },

  /**
   * Membangun string pesan salam lengkap berdasarkan jam dan userName.
   * Jika userName tersedia: "[Salam], [Nama]!"
   * Jika tidak: "[Salam]"
   * @param {number} hour
   * @returns {string}
   */
  _buildMessage(hour) {
    const salam = this.getGreeting(hour);
    return this.state.userName
      ? `${salam}, ${this.state.userName}!`
      : salam;
  },

  /**
   * Memuat userName dari storage, memanggil render(), dan memulai setInterval.
   * Juga mengikat event listener pada tombol simpan nama dan Enter key pada input.
   */
  init() {
    // Load nama dari storage
    const savedName = StorageManager.get(StorageManager.KEYS.USERNAME);
    this.state.userName = (typeof savedName === 'string' && savedName.trim() !== '')
      ? savedName
      : null;

    // Render awal
    this.render();

    // Mulai ticker setiap 1 detik
    setInterval(() => { GreetingWidget.tick(); }, 1000);

    // Bind event: tombol Simpan
    const saveBtn   = document.getElementById('name-save-btn');
    const nameInput = document.getElementById('name-input');

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        GreetingWidget.saveName(nameInput ? nameInput.value : '');
      });
    }

    // Bind event: tekan Enter di input nama
    if (nameInput) {
      nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          GreetingWidget.saveName(nameInput.value);
        }
      });
    }
  },

  /**
   * Menyimpan nama pengguna.
   * - Jika nama tidak kosong setelah di-trim: simpan ke storage, update state.
   * - Jika kosong: hapus dari storage, set state.userName = null.
   * Kemudian panggil render().
   * @param {string} name
   */
  saveName(name) {
    const trimmed = (name || '').trim();
    if (trimmed !== '') {
      StorageManager.set(StorageManager.KEYS.USERNAME, trimmed);
      this.state.userName = trimmed;
    } else {
      StorageManager.remove(StorageManager.KEYS.USERNAME);
      this.state.userName = null;
    }
    this.render();
  },

  /**
   * Memperbarui semua elemen DOM greeting berdasarkan state saat ini.
   */
  render() {
    const now     = new Date();
    const timeEl  = document.getElementById('greeting-time');
    const dateEl  = document.getElementById('greeting-date');
    const msgEl   = document.getElementById('greeting-message');
    const inputEl = document.getElementById('name-input');

    if (timeEl)  timeEl.textContent  = this.formatTime(now);
    if (dateEl)  dateEl.textContent  = this.formatDate(now);
    if (msgEl)   msgEl.textContent   = this._buildMessage(now.getHours());
    if (inputEl) inputEl.value       = this.state.userName || '';
  },
};

// ============================================================
// ThemeManager — Light/Dark Mode Toggle (Tantangan 1)
// ============================================================
const ThemeManager = {
  currentTheme: 'light',

  init() {
    const saved = StorageManager.get(StorageManager.KEYS.THEME);
    this.currentTheme = (saved === 'dark' || saved === 'light') ? saved : 'light';
    this.apply();
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => { ThemeManager.toggle(); });
    }
  },

  apply() {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    const iconEl  = document.getElementById('theme-icon');
    const labelEl = document.getElementById('theme-label');
    if (iconEl)  iconEl.textContent  = this.currentTheme === 'dark' ? '☀️' : '🌙';
    if (labelEl) labelEl.textContent = this.currentTheme === 'dark' ? 'Mode Terang' : 'Mode Gelap';
  },

  toggle() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.apply();
    StorageManager.set(StorageManager.KEYS.THEME, this.currentTheme);
  },
};

// ============================================================
// FocusTimer — Pomodoro 25 menit
// ============================================================
const FocusTimer = {
  state: {
    durationMinutes:  25,
    remainingSeconds: 25 * 60,
    isRunning:        false,
    intervalId:       null,
  },

  formatDisplay() {
    const mm = String(Math.floor(this.state.remainingSeconds / 60)).padStart(2, '0');
    const ss = String(this.state.remainingSeconds % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  },

  start() {
    if (this.state.isRunning || this.state.remainingSeconds === 0) return;
    this.state.isRunning = true;
    this.state.intervalId = setInterval(() => { FocusTimer.tick(); }, 1000);
    this.render();
  },

  stop() {
    clearInterval(this.state.intervalId);
    this.state.intervalId = null;
    this.state.isRunning  = false;
    this.render();
  },

  reset() {
    this.stop();
    this.state.remainingSeconds = this.state.durationMinutes * 60;
    const msgEl = document.getElementById('timer-completion-msg');
    if (msgEl) msgEl.hidden = true;
    this.render();
  },

  tick() {
    this.state.remainingSeconds -= 1;
    if (this.state.remainingSeconds <= 0) {
      this.state.remainingSeconds = 0;
      this.render();
      this.stop();
      this.showCompletionMessage();
    } else {
      this.render();
    }
  },

  showCompletionMessage() {
    const msgEl = document.getElementById('timer-completion-msg');
    if (msgEl) msgEl.hidden = false;
  },

  init() {
    this.state.remainingSeconds = this.state.durationMinutes * 60;
    this.render();
    const startBtn = document.getElementById('timer-start');
    const stopBtn  = document.getElementById('timer-stop');
    const resetBtn = document.getElementById('timer-reset');
    if (startBtn) startBtn.addEventListener('click', () => { FocusTimer.start(); });
    if (stopBtn)  stopBtn.addEventListener('click',  () => { FocusTimer.stop();  });
    if (resetBtn) resetBtn.addEventListener('click', () => { FocusTimer.reset(); });
  },

  render() {
    const displayEl = document.getElementById('timer-display');
    const startBtn  = document.getElementById('timer-start');
    const stopBtn   = document.getElementById('timer-stop');
    if (displayEl) displayEl.textContent = this.formatDisplay();
    if (startBtn)  startBtn.disabled = this.state.isRunning || this.state.remainingSeconds === 0;
    if (stopBtn)   stopBtn.disabled  = !this.state.isRunning;
  },
};

// ============================================================
// TodoManager — CRUD task list + Sort Tasks (Tantangan 5)
// ============================================================

// Task object shape: { id, text, completed, createdAt }

/**
 * SortMode enum — nilai-nilai mode pengurutan yang valid.
 * DEFAULT : urutan asli penambahan (ascending createdAt)
 * AZ      : teks A → Z (case-insensitive)
 * ZA      : teks Z → A (case-insensitive)
 * STATUS  : task belum selesai (false) muncul sebelum yang sudah selesai (true)
 */
const SortMode = {
  DEFAULT: 'default',
  AZ:      'az',
  ZA:      'za',
  STATUS:  'status',
};

const TodoManager = {
  state: {
    tasks:     [],        // Task[] — array kanonik (urutan tambah)
    sortMode:  'default', // SortMode
    editingId: null,      // string | null — ID task yang sedang diedit
  },

  /**
   * Memvalidasi teks task.
   * - Trim input terlebih dahulu.
   * - Tolak jika kosong atau hanya berisi whitespace.
   * @param {string} text
   * @returns {{ valid: boolean, error?: string }}
   */
  validateTaskText(text) {
    const trimmed = (text || '').trim();
    if (trimmed === '') {
      return { valid: false, error: 'Teks tugas tidak boleh kosong.' };
    }
    return { valid: true };
  },

  // ----------------------------------------------------------
  // Stub — akan diimplementasikan di task 6.2
  // ----------------------------------------------------------

  /**
   * Menambah task baru ke state.tasks.
   * Dipanggil dengan teks dari input form.
   * @param {string} text
   * @returns {{ success: boolean, error?: string }}
   */
  addTask(text) {
    const validation = this.validateTaskText(text);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    const trimmed = text.trim();
    const newTask = {
      id:        Date.now().toString(),
      text:      trimmed,
      completed: false,
      createdAt: Date.now(),
    };
    this.state.tasks.push(newTask);
    this.save();
    this.render();
    return { success: true };
  },

  /**
   * Mengedit teks task yang sudah ada berdasarkan ID.
   * @param {string} id
   * @param {string} newText
   * @returns {{ success: boolean, error?: string }}
   */
  editTask(id, newText) {
    const validation = this.validateTaskText(newText);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    const trimmed = newText.trim();
    const task = this.state.tasks.find(t => t.id === id);
    if (!task) return { success: false, error: 'Task tidak ditemukan.' };
    task.text = trimmed;
    this.state.editingId = null;
    this.save();
    this.render();
    return { success: true };
  },

  /**
   * Toggle status completed task berdasarkan ID.
   * @param {string} id
   */
  toggleTask(id) {
    const task = this.state.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.save();
      this.render();
    }
  },

  /**
   * Menghapus task berdasarkan ID.
   * @param {string} id
   */
  deleteTask(id) {
    this.state.tasks = this.state.tasks.filter(t => t.id !== id);
    this.save();
    this.render();
  },

  // ----------------------------------------------------------
  // Stub — akan diimplementasikan di task 6.3
  // ----------------------------------------------------------

  /**
   * Mengembalikan salinan state.tasks yang diurutkan sesuai state.sortMode.
   * Tidak memutasi state.tasks asli.
   * @returns {Array}
   */
  getSortedTasks() {
    const copy = [...this.state.tasks];
    switch (this.state.sortMode) {
      case 'az':
        return copy.sort((a, b) => a.text.toLowerCase().localeCompare(b.text.toLowerCase()));
      case 'za':
        return copy.sort((a, b) => b.text.toLowerCase().localeCompare(a.text.toLowerCase()));
      case 'status':
        return copy.sort((a, b) => {
          // false (belum selesai) sebelum true (sudah selesai)
          if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
          }
          // Dalam kelompok yang sama: urutan createdAt ascending
          return a.createdAt - b.createdAt;
        });
      case 'default':
      default:
        return copy.sort((a, b) => a.createdAt - b.createdAt);
    }
  },

  // ----------------------------------------------------------
  // Stub — akan diimplementasikan di task 6.4
  // ----------------------------------------------------------

  /**
   * Menyimpan tasks dan sortMode ke localStorage via StorageManager.
   */
  save() {
    StorageManager.set(StorageManager.KEYS.TASKS, this.state.tasks);
    StorageManager.set(StorageManager.KEYS.SORT_PREF, this.state.sortMode);
  },

  /**
   * Menginisialisasi modul: muat data dari storage, render daftar,
   * dan ikat event listener pada form tambah task dan kontrol sort.
   */
  init() {
    const savedTasks    = StorageManager.get(StorageManager.KEYS.TASKS);
    const savedSortMode = StorageManager.get(StorageManager.KEYS.SORT_PREF);
    this.state.tasks    = Array.isArray(savedTasks) ? savedTasks : [];
    this.state.sortMode = (typeof savedSortMode === 'string' && ['default', 'az', 'za', 'status'].includes(savedSortMode))
      ? savedSortMode
      : 'default';
    this.render();

    // Bind form tambah task
    const form      = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoError = document.getElementById('todo-error');

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const result = TodoManager.addTask(todoInput ? todoInput.value : '');
        if (result && result.success) {
          if (todoInput)  todoInput.value  = '';
          if (todoError) { todoError.hidden = true; todoError.textContent = ''; }
        } else if (result && result.error) {
          if (todoError) { todoError.textContent = result.error; todoError.hidden = false; }
          if (todoInput) todoInput.focus();
        }
      });
    }

    // Bind sort dropdown
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.value = this.state.sortMode;
      sortSelect.addEventListener('change', () => {
        TodoManager.state.sortMode = sortSelect.value;
        StorageManager.set(StorageManager.KEYS.SORT_PREF, TodoManager.state.sortMode);
        TodoManager.render();
      });
    }
  },

  /**
   * Merender ulang daftar task di DOM berdasarkan state saat ini.
   */
  render() {
    const listEl     = document.getElementById('todo-list');
    const sortSelect = document.getElementById('sort-select');
    if (!listEl) return;

    // Sync sort dropdown
    if (sortSelect) sortSelect.value = this.state.sortMode;

    // Kosongkan list
    listEl.innerHTML = '';

    const sorted = this.getSortedTasks();

    if (sorted.length === 0) {
      const placeholder = document.createElement('li');
      placeholder.className   = 'todo-empty';
      placeholder.textContent = 'Belum ada tugas. Tambahkan di atas.';
      listEl.appendChild(placeholder);
      return;
    }

    sorted.forEach(task => {
      const li = document.createElement('li');
      li.className  = 'todo-item' + (task.completed ? ' todo-item--done' : '');
      li.dataset.id = task.id;

      if (this.state.editingId === task.id) {
        // Mode edit inline
        const editInput = document.createElement('input');
        editInput.type      = 'text';
        editInput.className = 'input todo-edit-input';
        editInput.value     = task.text;
        editInput.setAttribute('aria-label', 'Edit teks tugas');

        const saveEditBtn = document.createElement('button');
        saveEditBtn.type        = 'button';
        saveEditBtn.className   = 'btn btn-primary btn-sm';
        saveEditBtn.textContent = '✓';
        saveEditBtn.setAttribute('aria-label', 'Simpan perubahan');
        saveEditBtn.addEventListener('click', () => {
          const result = TodoManager.editTask(task.id, editInput.value);
          if (result && !result.success) {
            editInput.focus();
          }
        });

        editInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter')  { e.preventDefault(); saveEditBtn.click(); }
          if (e.key === 'Escape') { TodoManager.state.editingId = null; TodoManager.render(); }
        });

        const cancelBtn = document.createElement('button');
        cancelBtn.type        = 'button';
        cancelBtn.className   = 'btn btn-ghost btn-sm';
        cancelBtn.textContent = '✕';
        cancelBtn.setAttribute('aria-label', 'Batal edit');
        cancelBtn.addEventListener('click', () => {
          TodoManager.state.editingId = null;
          TodoManager.render();
        });

        li.appendChild(editInput);
        li.appendChild(saveEditBtn);
        li.appendChild(cancelBtn);
      } else {
        // Mode tampilan normal
        const checkBtn = document.createElement('button');
        checkBtn.type        = 'button';
        checkBtn.className   = 'btn btn-ghost btn-sm todo-check-btn';
        checkBtn.textContent = task.completed ? '✓' : '○';
        checkBtn.setAttribute('aria-label', task.completed ? 'Tandai belum selesai' : 'Tandai selesai');
        checkBtn.addEventListener('click', () => { TodoManager.toggleTask(task.id); });

        const textSpan = document.createElement('span');
        textSpan.className   = 'todo-text' + (task.completed ? ' todo-text--done' : '');
        textSpan.textContent = task.text;

        const editBtn = document.createElement('button');
        editBtn.type        = 'button';
        editBtn.className   = 'btn btn-ghost btn-sm';
        editBtn.textContent = '✏';
        editBtn.setAttribute('aria-label', `Edit tugas: ${task.text}`);
        editBtn.addEventListener('click', () => {
          TodoManager.state.editingId = task.id;
          TodoManager.render();
          const editInputEl = document.querySelector('.todo-edit-input');
          if (editInputEl) editInputEl.focus();
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.type        = 'button';
        deleteBtn.className   = 'btn btn-ghost btn-sm';
        deleteBtn.textContent = '🗑';
        deleteBtn.setAttribute('aria-label', `Hapus tugas: ${task.text}`);
        deleteBtn.addEventListener('click', () => { TodoManager.deleteTask(task.id); });

        li.appendChild(checkBtn);
        li.appendChild(textSpan);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
      }

      listEl.appendChild(li);
    });
  },
};

// ============================================================
// QuickLinks — CRUD bookmark links
// ============================================================

// LinkItem shape: { id, label, url }

const QuickLinks = {
  state: {
    links: [], // LinkItem[]
  },

  /**
   * Memvalidasi URL: harus diawali 'http://' atau 'https://' DAN panjangnya ≤ 2048 karakter.
   * @param {string} url
   * @returns {boolean}
   */
  validateUrl(url) {
    if (typeof url !== 'string') return false;
    if (url.length > 2048) return false;
    return url.startsWith('http://') || url.startsWith('https://');
  },

  /**
   * Memvalidasi label: hasil trim harus memiliki setidaknya 1 karakter.
   * @param {string} label
   * @returns {boolean}
   */
  validateLabel(label) {
    if (typeof label !== 'string') return false;
    return label.trim().length >= 1;
  },

  /**
   * Helper: tampilkan pesan error di #link-error, atau sembunyikan jika kosong.
   * @param {string} message — jika kosong, sembunyikan elemen
   */
  _showError(message) {
    const errorEl = document.getElementById('link-error');
    if (!errorEl) return;
    if (message) {
      errorEl.textContent = message;
      errorEl.removeAttribute('hidden');
    } else {
      errorEl.textContent = '';
      errorEl.setAttribute('hidden', '');
    }
  },

  /**
   * Menambah link baru setelah memvalidasi label dan URL.
   * @param {string} label
   * @param {string} url
   * @returns {{ success: boolean, error?: string }}
   */
  addLink(label, url) {
    // Validasi label terlebih dahulu
    if (!this.validateLabel(label)) {
      const error = 'Label tidak boleh kosong.';
      this._showError(error);
      return { success: false, error };
    }

    // Validasi URL
    if (!this.validateUrl(url)) {
      const error = 'URL tidak valid. Gunakan format http:// atau https:// (maks 2048 karakter).';
      this._showError(error);
      return { success: false, error };
    }

    // Buat LinkItem baru
    const newLink = {
      id:    Date.now().toString(),
      label: label.trim(),
      url:   url.trim(),
    };

    this.state.links.push(newLink);
    this.save();
    this.render();

    // Bersihkan input dan sembunyikan pesan error
    const labelInput = document.getElementById('link-label-input');
    const urlInput   = document.getElementById('link-url-input');
    if (labelInput) labelInput.value = '';
    if (urlInput)   urlInput.value   = '';
    this._showError('');

    return { success: true };
  },

  /**
   * Menghapus link berdasarkan ID, lalu simpan dan render ulang.
   * @param {string} id
   */
  deleteLink(id) {
    this.state.links = this.state.links.filter(link => link.id !== id);
    this.save();
    this.render();
  },

  /**
   * Menyimpan state.links ke localStorage via StorageManager.
   */
  save() {
    StorageManager.set(StorageManager.KEYS.LINKS, this.state.links);
  },

  /**
   * Menginisialisasi modul: load links dari storage, render, dan ikat event listener.
   */
  init() {
    // Load dari localStorage, fallback ke array kosong
    const saved = StorageManager.get(StorageManager.KEYS.LINKS);
    this.state.links = Array.isArray(saved) ? saved : [];

    this.render();

    // Bind event listener pada form tambah link
    const form       = document.getElementById('links-form');
    const labelInput = document.getElementById('link-label-input');
    const urlInput   = document.getElementById('link-url-input');

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        QuickLinks.addLink(
          labelInput ? labelInput.value : '',
          urlInput   ? urlInput.value   : ''
        );
      });
    }
  },

  /**
   * Merender ulang daftar link di DOM berdasarkan state.links.
   */
  render() {
    const listEl = document.getElementById('links-list');
    if (!listEl) return;

    // Kosongkan list
    listEl.innerHTML = '';

    if (this.state.links.length === 0) {
      // Tampilkan placeholder jika tidak ada link
      const placeholder = document.createElement('li');
      placeholder.className = 'links-empty';
      placeholder.textContent = 'Belum ada tautan. Tambahkan di atas.';
      listEl.appendChild(placeholder);
      return;
    }

    this.state.links.forEach(link => {
      const li = document.createElement('li');
      li.className = 'links-item';

      // Elemen <a> untuk tautan
      const anchor = document.createElement('a');
      anchor.href             = link.url;
      anchor.target           = '_blank';
      anchor.rel              = 'noopener noreferrer';
      anchor.textContent      = link.label;
      anchor.className        = 'links-anchor';

      // Tombol hapus
      const deleteBtn = document.createElement('button');
      deleteBtn.type           = 'button';
      deleteBtn.className      = 'btn btn-ghost btn-sm links-delete-btn';
      deleteBtn.setAttribute('aria-label', `Hapus tautan ${link.label}`);
      deleteBtn.textContent    = '✕';
      deleteBtn.addEventListener('click', () => {
        QuickLinks.deleteLink(link.id);
      });

      li.appendChild(anchor);
      li.appendChild(deleteBtn);
      listEl.appendChild(li);
    });
  },
};

// ============================================================
// Main initialization — DOMContentLoaded entry point
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // Inisialisasi dalam urutan yang benar:
  // 1. ThemeManager: terapkan tema sebelum render komponen lain
  ThemeManager.init();
  // 2. GreetingWidget: mulai ticker waktu
  GreetingWidget.init();
  // 3. FocusTimer: siapkan timer di 25:00
  FocusTimer.init();
  // 4. TodoManager: muat task list dari storage
  TodoManager.init();
  // 5. QuickLinks: muat bookmark dari storage
  QuickLinks.init();
});
