const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const app = express();

// Port dinamis untuk hosting (Hostinger/Render) atau port 3000 untuk local (Laragon)
const port = process.env.PORT || 3000;

// Middleware agar server bisa membaca data JSON (berguna saat siswa mengirim jawaban)
app.use(express.json());

// ==========================================
// 1. KONFIGURASI DATABASE & SESSION
// ==========================================

// Pengaturan koneksi ke Database MySQL (Sesuaikan dengan Laragon kamu)
const dbOptions = {
    host: 'localhost', // Nanti diubah sesuai info dari Hostinger saat deploy
    port: 3306,
    user: 'u470537086_keluargaku',      // Username default database Laragon
    password: 'Boyol@li1',      // Password default database Laragon (biasanya kosong)
    database: 'u470537086_keluargaku' // PASTIKAN KAMU SUDAH MEMBUAT DATABASE INI DI PHPMYADMIN
};

// Membuat "Gudang" penyimpanan session di dalam tabel MySQL
const sessionStore = new MySQLStore(dbOptions);

// Memasang Session ke dalam Express
app.use(session({
    key: 'cbt_session_cookie',
    secret: 'rahasia-cbt-super-aman', // Ganti dengan teks acak yang kuat saat rilis
    store: sessionStore,              // Arahkan penyimpanan ke MySQL
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 2    // Sesi login bertahan 2 jam (dalam milidetik)
    }
}));


// ==========================================
// 2. ROUTING (JALUR APLIKASI CBT)
// ==========================================

// Route 1: Halaman Depan
app.get('/', (req, res) => {
    res.send(`
        <h1>Selamat Datang di Aplikasi CBT!</h1> 
        <p><a href="/login">Simulasi Login (Siswa A)</a></p>
    `);
});

// Route 2: Proses Login (Simulasi)
// Route 1: Halaman Depan (Form Login)
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login CBT</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 flex items-center justify-center min-h-screen font-sans">
        
        <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
            <div class="text-center mb-8">
                <h1 class="text-3xl font-extrabold text-blue-600">CBT Online</h1>
                <p class="text-gray-500 mt-2">Silakan login untuk memulai ujian</p>
            </div>
            
            <form action="/login" method="GET">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Nomor Induk Siswa (NIS)</label>
                    <input type="text" name="nis" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Masukkan NIS Anda (Misal: 12345678)" required>
                </div>
                <div class="mb-6">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Password</label>
                    <input type="password" name="password" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Masukkan Password" required>
                </div>
                <button type="submit" class="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300">
                    Masuk
                </button>
            </form>
        </div>

    </body>
    </html>
    `);
});

// Route 3: Halaman Ujian (DILINDUNGI)
app.get('/ujian', (req, res) => {
    // Pengecekan: Apakah siswa punya tiket/session login?
    if (!req.session.isLoggedIn) {
        return res.status(401).send(`
            <h3 style="color:red;">Akses Ditolak!</h3>
            <p>Anda belum login. Silakan <a href="/">Kembali ke Halaman Depan</a>.</p>
        `);
    }

    // Jika sudah login, tampilkan lembar ujian
    res.send(`
        <h1>Lembar Ujian</h1>
        <h3>Nama: ${req.session.namaSiswa} | NIS: ${req.session.nis}</h3>
        <hr>
        <p><b>1. Berapa hasil dari 5 + 5?</b></p>
        <ul>
            <li><input type="radio" name="soal1"> A. 8</li>
            <li><input type="radio" name="soal1"> B. 9</li>
            <li><input type="radio" name="soal1"> C. 10</li>
        </ul>
        <br>
        <p><a href="/logout"><button>Selesai & Keluar</button></a></p>
    `);
});

// Route 4: Contoh API Pengambilan Data (Jika butuh lewat JSON/Frontend terpisah)
app.get('/api/soal', (req, res) => {
    const soal = {
        id: 1,
        pertanyaan: "Berapa hasil dari 5 + 5?",
        pilihan: ["8", "9", "10", "11"]
    };
    res.json(soal); 
});

// Route 5: Proses Logout
app.get('/logout', (req, res) => {
    // Menghapus session dari database dan menghancurkan cookie di browser siswa
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Terjadi kesalahan saat logout.');
        }
        res.send(`
            <h3>Anda berhasil keluar.</h3> 
            <a href="/">Kembali ke Awal</a>
        `);
    });
});


// ==========================================
// 3. MENYALAKAN SERVER
// ==========================================
app.listen(port, () => {
    console.log(`Server CBT sukses berjalan di http://localhost:${port}`);
});