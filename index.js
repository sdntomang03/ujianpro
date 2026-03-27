const express = require('express');
const session = require('express-session');
// const MySQLStore = require('express-mysql-session')(session); // Dimatikan sementara
const app = express();

// Port dinamis untuk hosting atau port 3000 untuk local
const port = process.env.PORT || 3000;

// Middleware membaca JSON & Data Form
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 1. DATA DUMMY (Pengganti Database Sementara)
// ==========================================
// Daftar siswa yang diizinkan login
const dataSiswaDummy = [
    { nis: '12345', password: '123', nama: 'Budi Santoso' },
    { nis: '67890', password: '123', nama: 'Siti Aminah' }
];

// ==========================================
// 2. KONFIGURASI SESSION (Tanpa MySQL)
// ==========================================
app.use(session({
    secret: 'rahasia-cbt-super-aman', 
    resave: false,
    saveUninitialized: false,
    // Session disimpan di RAM server (karena MySQLStore dimatikan)
    cookie: {
        maxAge: 1000 * 60 * 60 * 2    
    }
}));

// ==========================================
// 3. ROUTING (JALUR APLIKASI CBT)
// ==========================================

// Route 1: Halaman Depan (Form Login Tailwind)
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
                <p class="text-gray-500 mt-2">Gunakan NIS: 12345 dan Pass: 123</p>
            </div>
            
            <form action="/login" method="GET">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Nomor Induk Siswa (NIS)</label>
                    <input type="text" name="nis" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Masukkan NIS Anda" required>
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

// Route 2: Proses Login (Cek Data Dummy)
app.get('/login', (req, res) => {
    const inputNis = req.query.nis;
    const inputPassword = req.query.password;

    // Mencari siswa di array data dummy
    const siswaDitemukan = dataSiswaDummy.find(s => s.nis === inputNis && s.password === inputPassword);

    if (siswaDitemukan) {
        // Jika cocok, catat di session
        req.session.isLoggedIn = true;
        req.session.namaSiswa = siswaDitemukan.nama;
        req.session.nis = siswaDitemukan.nis;

        res.redirect('/ujian');
    } else {
        res.send(`
            <div style="text-align:center; margin-top:50px; font-family:sans-serif;">
                <h2 style="color:red;">Login Gagal!</h2>
                <p>NIS atau Password salah.</p>
                <a href="/">Kembali</a>
            </div>
        `);
    }
});

// Route 3: Halaman Ujian (DILINDUNGI)
app.get('/ujian', (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.status(401).send(`
            <div style="text-align:center; margin-top:50px; font-family:sans-serif;">
                <h2 style="color:red;">Akses Ditolak!</h2>
                <p>Anda belum login. <a href="/">Kembali ke Halaman Login</a></p>
            </div>
        `);
    }

    res.send(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lembar Ujian</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-50 text-gray-800 font-sans">
        
        <nav class="bg-blue-600 text-white shadow-md">
            <div class="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
                <h1 class="text-xl font-bold tracking-wider">CBT Online</h1>
                <div class="flex items-center gap-4">
                    <span class="font-medium bg-blue-700 px-3 py-1 rounded-full text-sm">
                        👤 ${req.session.namaSiswa} (${req.session.nis})
                    </span>
                    <a href="/logout" class="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-bold transition shadow">
                        Keluar
                    </a>
                </div>
            </div>
        </nav>

        <main class="max-w-3xl mx-auto mt-8 px-4 pb-12">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="bg-blue-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 class="font-bold text-lg text-blue-800">Soal No. 1</h2>
                    <span class="bg-white border border-blue-200 text-blue-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        Matematika
                    </span>
                </div>
                
                <div class="p-6">
                    <p class="text-lg mb-6 font-medium">Berapa hasil dari 5 + 5?</p>
                    <div class="space-y-3">
                        <label class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition">
                            <input type="radio" name="jawaban1" value="A" class="w-5 h-5 text-blue-600 focus:ring-blue-500">
                            <span class="ml-3 text-gray-700 font-medium">A. 8</span>
                        </label>
                        <label class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition">
                            <input type="radio" name="jawaban1" value="B" class="w-5 h-5 text-blue-600 focus:ring-blue-500">
                            <span class="ml-3 text-gray-700 font-medium">B. 9</span>
                        </label>
                        <label class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition">
                            <input type="radio" name="jawaban1" value="C" class="w-5 h-5 text-blue-600 focus:ring-blue-500">
                            <span class="ml-3 text-gray-700 font-medium">C. 10</span>
                        </label>
                    </div>
                </div>

                <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                    <button class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition shadow-md">
                        Simpan & Lanjut
                    </button>
                </div>
            </div>
        </main>
    </body>
    </html>
    `);
});

// Route 4: Proses Logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        res.send(`
            <div style="text-align:center; margin-top:50px; font-family:sans-serif;">
                <h3>Anda berhasil keluar.</h3> 
                <a href="/">Kembali ke Login</a>
            </div>
        `);
    });
});

// ==========================================
// 4. MENYALAKAN SERVER
// ==========================================
app.listen(port, () => {
    console.log(`Server CBT DUMMY sukses berjalan di http://localhost:${port}`);
});