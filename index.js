const express = require('express');
const app = express();
const port = 3000;

// Middleware: Mengizinkan server membaca data JSON (sangat penting untuk CBT nanti saat kirim jawaban)
app.use(express.json());

// Route 1: Halaman Depan
app.get('/', (req, res) => {
    res.send('<h1>Selamat Datang di Aplikasi CBT!</h1><p>Server Express.js berhasil menyala.</p>');
});

// Route 2: Contoh API untuk mengambil 1 soal
app.get('/api/soal', (req, res) => {
    // Simulasi data soal dari database
    const soal = {
        id: 1,
        pertanyaan: "Berapa hasil dari 5 + 5?",
        pilihan: ["8", "9", "10", "11"],
    };
    
    // Mengirimkan soal ke browser dalam bentuk JSON
    res.json(soal); 
});

// Menyalakan server agar terus mendengarkan permintaan masuk
app.listen(port, () => {
    console.log(`Server CBT sudah berjalan! Silakan buka http://localhost:${port} di browser Anda.`);
});