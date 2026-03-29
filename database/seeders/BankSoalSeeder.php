<?php

namespace Database\Seeders;

use App\Models\Kategori;
use App\Models\Soal;
use App\Models\SoalOpsi;
use App\Models\Ujian;
use Illuminate\Database\Seeder;

class BankSoalSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buat Kategori Ujian
        $kategori = Kategori::create(['nama_kategori' => 'Simulasi UTBK 2026']);

        // 2. Buat Jadwal Ujian
        $ujian = Ujian::create([
            'judul_ujian' => 'Tryout Premium Intensif',
            'deskripsi' => 'Ujian simulasi dengan 6 tipe soal kompleks.',
            'durasi_menit' => 90,
            'acak_soal' => true,
            'acak_opsi' => true,
        ]);

        // 3. INPUT 6 TIPE SOAL

        // A. Pilihan Ganda (PG)
        $soal1 = Soal::create([
            'kategori_id' => $kategori->id,
            'tipe_soal' => 'pg',
            'pertanyaan' => 'Manakah ibukota negara Indonesia saat ini?',
            'kunci_jawaban' => ['Jakarta'],
        ]);
        foreach (['Jakarta', 'IKN Nusantara', 'Surabaya', 'Bandung'] as $opsi) {
            SoalOpsi::create(['soal_id' => $soal1->id, 'teks_opsi' => $opsi]);
        }

        // B. Pilihan Ganda Kompleks
        $soal2 = Soal::create([
            'kategori_id' => $kategori->id,
            'tipe_soal' => 'pg_kompleks',
            'pertanyaan' => 'Manakah yang termasuk bahasa pemrograman? (Pilih semua yang benar)',
            'kunci_jawaban' => ['JavaScript', 'Python'],
        ]);
        foreach (['JavaScript', 'HTML', 'Python', 'CSS'] as $opsi) {
            SoalOpsi::create(['soal_id' => $soal2->id, 'teks_opsi' => $opsi]);
        }

        // C. Isian Singkat
        $soal3 = Soal::create([
            'kategori_id' => $kategori->id,
            'tipe_soal' => 'isian',
            'pertanyaan' => 'Hewan berkaki empat yang menghasilkan susu untuk manusia adalah?',
            'kunci_jawaban' => ['Sapi', 'Kambing'],
        ]);

        // D. Menjodohkan
        $soal4 = Soal::create([
            'kategori_id' => $kategori->id,
            'tipe_soal' => 'menjodohkan',
            'pertanyaan' => 'Pasangkanlah negara di sebelah kiri dengan bendera yang sesuai di sebelah kanan!',
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
            'kategori_id' => $kategori->id,
            'tipe_soal' => 'benar_salah',
            'pertanyaan' => 'Tentukan kebenaran dari pernyataan-pernyataan di bawah ini!',
            'kunci_jawaban' => ['row_0' => 'Salah', 'row_1' => 'Benar'],
        ]);
        SoalOpsi::create(['soal_id' => $soal5->id, 'teks_opsi' => 'Bumi itu berbentuk bulat datar']);
        SoalOpsi::create(['soal_id' => $soal5->id, 'teks_opsi' => 'Matahari adalah pusat tata surya']);

        // F. Survei
        $soal6 = Soal::create([
            'kategori_id' => $kategori->id,
            'tipe_soal' => 'survei',
            'pertanyaan' => 'Seberapa puas Anda dengan kualitas platform CBT PRO ini?',
            'kunci_jawaban' => null,
        ]);
        foreach (['Sangat Tidak Puas', 'Tidak Puas', 'Netral', 'Puas', 'Sangat Puas'] as $opsi) {
            SoalOpsi::create(['soal_id' => $soal6->id, 'teks_opsi' => $opsi]);
        }

        // 4. Masukkan semua soal ke dalam Ujian
        $ujian->soals()->attach([$soal1->id, $soal2->id, $soal3->id, $soal4->id, $soal5->id, $soal6->id]);
    }
}
