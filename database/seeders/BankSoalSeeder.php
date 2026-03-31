<?php

namespace Database\Seeders;

use App\Models\Kategori;
use App\Models\KategoriUjian;
use App\Models\Soal;
use App\Models\SoalOpsi;
use App\Models\Ujian;
use Illuminate\Database\Seeder;

class BankSoalSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buat Kategori Soal (Untuk Bank Soal) & Kategori Ujian (Untuk Jadwal)
        $kategoriSoal = Kategori::create([
            'nama_kategori' => 'Pengetahuan Umum & Logika',
        ]);

        $kategoriUjian = KategoriUjian::create([
            'nama_kategori' => 'Simulasi UTBK 2026',
            'deskripsi' => 'Ujian simulasi persiapan masuk PTN.',
        ]);

        // 2. Buat Jadwal Ujian (Menggunakan kategori_ujian_id yang baru)
        $ujian = Ujian::create([
            'kategori_ujian_id' => $kategoriUjian->id, // Relasi ke tabel kategori_ujians
            'judul_ujian' => 'Tryout Premium Intensif',
            'deskripsi' => 'Ujian simulasi dengan 6 tipe soal kompleks.',
            'durasi_menit' => 90,
            'acak_soal' => true,
            'acak_opsi' => true,
        ]);

        // 3. INPUT 6 TIPE SOAL (Menggunakan kategori_id dari $kategoriSoal)

        // A. Pilihan Ganda (PG) - Menggunakan HTML Justify dan Bold
        $soal1 = Soal::create([
            'kategori_id' => $kategoriSoal->id,
            'tipe_soal' => 'pg',
            'pertanyaan' => '
                <p style="text-align: justify;">Sejak kemerdekaan tahun 1945, pusat pemerintahan dan ekonomi Indonesia terkonsentrasi di Pulau Jawa. Namun, demi pemerataan pembangunan dan mengatasi masalah ekologi, pemerintah merencanakan pemindahan pusat pemerintahan.</p>
                <p style="text-align: justify;">Berdasarkan wacana di atas, <strong>manakah ibukota negara Indonesia saat ini?</strong></p>
            ',
            'file_gambar' => 'https://images.unsplash.com/photo-1555899434-94d1368aa7af?q=80&w=800&auto=format&fit=crop', // Gambar Monas
            'kunci_jawaban' => ['Jakarta'],
            'bobot_nilai' => 10,
        ]);
        foreach (['Jakarta', 'IKN Nusantara', 'Surabaya', 'Bandung'] as $opsi) {
            SoalOpsi::create(['soal_id' => $soal1->id, 'teks_opsi' => $opsi]);
        }

        // B. Pilihan Ganda Kompleks
        $soal2 = Soal::create([
            'kategori_id' => $kategoriSoal->id,
            'tipe_soal' => 'pg_kompleks',
            'pertanyaan' => '<p>Manakah yang termasuk <strong>bahasa pemrograman</strong>? (Pilih semua yang benar)</p>',
            'kunci_jawaban' => ['JavaScript', 'Python'],
        ]);
        foreach (['JavaScript', 'HTML', 'Python', 'CSS'] as $opsi) {
            SoalOpsi::create(['soal_id' => $soal2->id, 'teks_opsi' => $opsi]);
        }

        // C. Isian Singkat - Dilengkapi Gambar Sapi
        $soal3 = Soal::create([
            'kategori_id' => $kategoriSoal->id,
            'tipe_soal' => 'isian',
            'pertanyaan' => '<p>Berdasarkan gambar di atas, hewan berkaki empat yang menghasilkan susu untuk konsumsi manusia adalah...</p>',
            'file_gambar' => 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?q=80&w=800&auto=format&fit=crop',
            'kunci_jawaban' => ['Sapi', 'Kambing'],
        ]);

        // D. Menjodohkan
        $soal4 = Soal::create([
            'kategori_id' => $kategoriSoal->id,
            'tipe_soal' => 'menjodohkan',
            'pertanyaan' => '<p>Pasangkanlah <strong>negara</strong> di sebelah kiri dengan <strong>bendera</strong> yang sesuai di sebelah kanan!</p>',
            'kunci_jawaban' => ['L1' => 'R2', 'L2' => 'R3', 'L3' => 'R1'],
        ]);
        SoalOpsi::create(['soal_id' => $soal4->id, 'group' => 'kiri', 'teks_opsi' => 'Indonesia 🇮🇩']);
        SoalOpsi::create(['soal_id' => $soal4->id, 'group' => 'kiri', 'teks_opsi' => 'Jepang 🇯🇵']);
        SoalOpsi::create(['soal_id' => $soal4->id, 'group' => 'kiri', 'teks_opsi' => 'Amerika 🇺🇸']);
        SoalOpsi::create(['soal_id' => $soal4->id, 'group' => 'kanan', 'teks_opsi' => 'Stars & Stripes']);
        SoalOpsi::create(['soal_id' => $soal4->id, 'group' => 'kanan', 'teks_opsi' => 'Merah Putih']);
        SoalOpsi::create(['soal_id' => $soal4->id, 'group' => 'kanan', 'teks_opsi' => 'Hinomaru']);

        // E. Benar Salah
        $soal5 = Soal::create([
            'kategori_id' => $kategoriSoal->id,
            'tipe_soal' => 'benar_salah',
            'pertanyaan' => '<p>Tentukan kebenaran dari pernyataan-pernyataan di bawah ini!</p>',
            'kunci_jawaban' => ['row_0' => 'Salah', 'row_1' => 'Benar'],
        ]);
        SoalOpsi::create(['soal_id' => $soal5->id, 'teks_opsi' => 'Bumi itu berbentuk bulat datar']);
        SoalOpsi::create(['soal_id' => $soal5->id, 'teks_opsi' => 'Matahari adalah pusat tata surya']);

        // F. Survei
        $soal6 = Soal::create([
            'kategori_id' => $kategoriSoal->id,
            'tipe_soal' => 'survei',
            'pertanyaan' => '<p>Seberapa puas Anda dengan kualitas platform CBT PRO ini?</p>',
            'kunci_jawaban' => null,
        ]);
        foreach (['Sangat Tidak Puas', 'Tidak Puas', 'Netral', 'Puas', 'Sangat Puas'] as $opsi) {
            SoalOpsi::create(['soal_id' => $soal6->id, 'teks_opsi' => $opsi]);
        }

        // 4. Masukkan semua soal ke dalam Ujian
        $ujian->soals()->attach([$soal1->id, $soal2->id, $soal3->id, $soal4->id, $soal5->id, $soal6->id]);
    }
}
