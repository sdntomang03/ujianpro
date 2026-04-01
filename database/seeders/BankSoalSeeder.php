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

        // 2. Buat Jadwal Ujian
        $ujian = Ujian::create([
            'kategori_ujian_id' => $kategoriUjian->id,
            'judul_ujian' => 'Tryout Premium Intensif',
            'deskripsi' => 'Ujian simulasi dengan 6 tipe soal kompleks.',
            'durasi_menit' => 90,
            'acak_soal' => true,
            'acak_opsi' => true,
        ]);

        // 3. INPUT 6 TIPE SOAL (Menggunakan Arsitektur `is_correct`)

        // =========================================================================
        // A. Pilihan Ganda (PG)
        // =========================================================================
        $soal1 = Soal::create([
            'kategori_id' => $kategoriSoal->id,
            'tipe_soal' => 'pg',
            'pertanyaan' => '
                <p style="text-align: justify;">Sejak kemerdekaan tahun 1945, pusat pemerintahan dan ekonomi Indonesia terkonsentrasi di Pulau Jawa. Namun, demi pemerataan pembangunan dan mengatasi masalah ekologi, pemerintah merencanakan pemindahan pusat pemerintahan.</p>
                <p style="text-align: justify;">Berdasarkan wacana di atas, <strong>manakah ibukota negara Indonesia saat ini?</strong></p>
            ',
            'file_gambar' => 'https://images.unsplash.com/photo-1555899434-94d1368aa7af?q=80&w=800&auto=format&fit=crop',
            'kunci_jawaban' => null, // Kunci tidak disimpan di sini lagi
            'bobot_nilai' => 10,
        ]);

        foreach (['Jakarta', 'IKN Nusantara', 'Surabaya', 'Bandung'] as $opsi) {
            SoalOpsi::create([
                'soal_id' => $soal1->id,
                'teks_opsi' => $opsi,
                'is_correct' => ($opsi === 'Jakarta'), // Bernilai true hanya untuk Jakarta
            ]);
        }

        // =========================================================================
        // B. Pilihan Ganda Kompleks
        // =========================================================================
        $soal2 = Soal::create([
            'kategori_id' => $kategoriSoal->id,
            'tipe_soal' => 'pg_kompleks',
            'pertanyaan' => '<p>Manakah yang termasuk <strong>bahasa pemrograman</strong>? (Pilih semua yang benar)</p>',
            'kunci_jawaban' => null,
            'bobot_nilai' => 10,
        ]);

        $kunciPGK = ['JavaScript', 'Python'];
        foreach (['JavaScript', 'HTML', 'Python', 'CSS'] as $opsi) {
            SoalOpsi::create([
                'soal_id' => $soal2->id,
                'teks_opsi' => $opsi,
                'is_correct' => in_array($opsi, $kunciPGK), // Bernilai true untuk JS & Python
            ]);
        }

        // =========================================================================
        // C. Isian Singkat
        // =========================================================================
        $soal3 = Soal::create([
            'kategori_id' => $kategoriSoal->id,
            'tipe_soal' => 'isian',
            'pertanyaan' => '<p>Berdasarkan gambar di atas, hewan berkaki empat yang menghasilkan susu untuk konsumsi manusia adalah...</p>',
            'file_gambar' => 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?q=80&w=800&auto=format&fit=crop',
            'kunci_jawaban' => null,
            'bobot_nilai' => 10,
        ]);

        // Simpan semua alternatif jawaban benar ke tabel opsi
        foreach (['Sapi', 'Kambing'] as $opsi) {
            SoalOpsi::create([
                'soal_id' => $soal3->id,
                'teks_opsi' => $opsi,
                'is_correct' => true,
            ]);
        }

        // =========================================================================
        // D. Menjodohkan (Relasi ID Kiri -> ID Kanan)
        // =========================================================================
        $soal4 = Soal::create([
            'kategori_id' => $kategoriSoal->id,
            'tipe_soal' => 'menjodohkan',
            'pertanyaan' => '<p>Pasangkanlah <strong>negara</strong> di sebelah kiri dengan <strong>bendera</strong> yang sesuai di sebelah kanan!</p>',
            'kunci_jawaban' => null, // Nanti akan diupdate
            'bobot_nilai' => 10,
        ]);

        // 1. Buat Opsi Kiri (Premis)
        $l1 = SoalOpsi::create(['soal_id' => $soal4->id, 'group' => 'L1', 'teks_opsi' => 'Indonesia 🇮🇩']);
        $l2 = SoalOpsi::create(['soal_id' => $soal4->id, 'group' => 'L2', 'teks_opsi' => 'Jepang 🇯🇵']);
        $l3 = SoalOpsi::create(['soal_id' => $soal4->id, 'group' => 'L3', 'teks_opsi' => 'Amerika 🇺🇸']);

        // 2. Buat Opsi Kanan (Jawaban)
        $r1 = SoalOpsi::create(['soal_id' => $soal4->id, 'group' => 'R1', 'teks_opsi' => 'Merah Putih']);
        $r2 = SoalOpsi::create(['soal_id' => $soal4->id, 'group' => 'R2', 'teks_opsi' => 'Hinomaru']);
        $r3 = SoalOpsi::create(['soal_id' => $soal4->id, 'group' => 'R3', 'teks_opsi' => 'Stars & Stripes']);

        // 3. Simpan relasi pemetaan ID-nya ke tabel soals
        $soal4->update([
            'kunci_jawaban' => json_encode([
                $l1->id => $r1->id, // ID Kiri => ID Kanan (Indonesia -> Merah Putih)
                $l2->id => $r2->id, // Jepang -> Hinomaru
                $l3->id => $r3->id, // Amerika -> Stars & Stripes
            ]),
        ]);

        // =========================================================================
        // E. Benar Salah (Majemuk)
        // =========================================================================
        $soal5 = Soal::create([
            'kategori_id' => $kategoriSoal->id,
            'tipe_soal' => 'benar_salah',
            'pertanyaan' => '<p>Tentukan kebenaran dari pernyataan-pernyataan di bawah ini!</p>',
            'kunci_jawaban' => null,
            'bobot_nilai' => 10,
        ]);

        SoalOpsi::create([
            'soal_id' => $soal5->id,
            'teks_opsi' => 'Bumi itu berbentuk bulat datar',
            'is_correct' => false, // Karena pernyataannya Salah
        ]);

        SoalOpsi::create([
            'soal_id' => $soal5->id,
            'teks_opsi' => 'Matahari adalah pusat tata surya',
            'is_correct' => true, // Karena pernyataannya Benar
        ]);

        // =========================================================================
        // F. Survei
        // =========================================================================
        $soal6 = Soal::create([
            'kategori_id' => $kategoriSoal->id,
            'tipe_soal' => 'survei',
            'pertanyaan' => '<p>Seberapa puas Anda dengan kualitas platform CBT PRO ini?</p>',
            'kunci_jawaban' => null,
            'bobot_nilai' => 10,
        ]);

        foreach (['Sangat Tidak Puas', 'Tidak Puas', 'Netral', 'Puas', 'Sangat Puas'] as $opsi) {
            SoalOpsi::create([
                'soal_id' => $soal6->id,
                'teks_opsi' => $opsi,
                'is_correct' => false, // Survei tidak memiliki jawaban benar
            ]);
        }

        // =========================================================================
        // 4. Masukkan semua soal ke dalam Ujian (Tabel Pivot)
        // =========================================================================
        $ujian->soals()->attach([
            $soal1->id,
            $soal2->id,
            $soal3->id,
            $soal4->id,
            $soal5->id,
            $soal6->id,
        ]);
    }
}
