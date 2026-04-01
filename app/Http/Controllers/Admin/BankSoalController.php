<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kategori; // Digunakan untuk Bank Soal (berdasarkan Seeder Anda)
use App\Models\KategoriUjian;
use App\Models\Soal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BankSoalController extends Controller
{
    public function index(Request $request)
    {
        $kategori = Kategori::all();

        $soal = Soal::with('kategori')
            ->when($request->kategori_id, function ($query, $kategori_id) {
                return $query->where('kategori_id', $kategori_id);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/BankSoal/Index', [
            'soal' => $soal,
            'kategori' => $kategori,
            'filters' => [
                'kategori_id' => $request->kategori_id ?? '',
            ],
        ]);
    }

    public function create()
    {
        // Diperbaiki: Menggunakan Kategori, bukan KategoriUjian (Karena KategoriUjian untuk jadwal)
        $kategori = Kategori::all();

        return Inertia::render('Admin/BankSoal/Create', [
            'kategori' => $kategori,
        ]);
    }

    public function store(Request $request)
    {
        // 1. Validasi Dasar
        $request->validate([
            'kategori_id' => 'required|exists:kategoris,id',
            'tipe_soal' => 'required',
            'pertanyaan' => 'required|string',
            'bobot_nilai' => 'required|integer',
        ]);

        // 2. Upload Gambar (Opsional)
        $pathGambar = null;
        if ($request->hasFile('gambar')) {
            $pathGambar = $request->file('gambar')->store('soal_images', 'public');
        }

        // 3. Simpan Data Induk Soal (kunci_jawaban dikosongkan dulu, khusus menjodohkan diupdate belakangan)
        $soal = Soal::create([
            'kategori_id' => $request->kategori_id,
            'tipe_soal' => $request->tipe_soal,
            'pertanyaan' => $request->pertanyaan,
            'file_gambar' => $pathGambar,
            'bobot_nilai' => $request->bobot_nilai,
            'kunci_jawaban' => null, // Default null, karena kita pakai relasi is_correct sekarang
        ]);

        // 4. LOGIKA PENYIMPANAN OPSI JAWABAN BERDASARKAN TIPE

        // A. Pilihan Ganda & PG Kompleks & Survei
        if (in_array($request->tipe_soal, ['pg', 'pg_kompleks', 'survei'])) {
            foreach ($request->opsi as $index => $teksOpsi) {
                $isCorrect = false;

                // Cek apakah index opsi ini adalah jawaban yang benar
                if ($request->tipe_soal === 'pg' && $request->kunci_jawaban == $index) {
                    $isCorrect = true;
                } elseif ($request->tipe_soal === 'pg_kompleks' && in_array($index, $request->kunci_kompleks)) {
                    $isCorrect = true;
                }

                $soal->opsis()->create([
                    'teks_opsi' => $teksOpsi,
                    'is_correct' => $isCorrect,
                ]);
            }
        }

        // B. Benar / Salah Majemuk
        elseif ($request->tipe_soal === 'benar_salah') {
            foreach ($request->pernyataan_bs as $item) {
                // Jika kunci dari React "Benar", jadikan true. Jika "Salah", jadikan false.
                $isCorrect = ($item['kunci'] === 'Benar') ? true : false;

                $soal->opsis()->create([
                    'teks_opsi' => $item['teks'],
                    'is_correct' => $isCorrect,
                ]);
            }
        }

        // C. Isian Singkat
        elseif ($request->tipe_soal === 'isian') {
            // Memecah "Sapi, Kambing" menjadi array opsi benar
            $kunciArray = array_map('trim', explode(',', $request->kunci_isian));
            foreach ($kunciArray as $kunci) {
                $soal->opsis()->create([
                    'teks_opsi' => $kunci,
                    'is_correct' => true,
                ]);
            }
        }

        // D. Menjodohkan (Peta Relasi ID Kiri -> ID Kanan)
        elseif ($request->tipe_soal === 'menjodohkan') {
            $kunciMap = [];

            foreach ($request->pasangan as $index => $pair) {
                $idx = $index + 1;

                // Simpan Opsi Kiri & Dapatkan ID-nya
                $opsiKiri = $soal->opsis()->create([
                    'teks_opsi' => $pair['kiri'],
                    'group' => "L{$idx}",
                    'is_correct' => false,
                ]);

                // Simpan Opsi Kanan & Dapatkan ID-nya
                $opsiKanan = $soal->opsis()->firstOrCreate(
                    [
                        'soal_id' => $soal->id,
                        'teks_opsi' => $pair['kanan'],
                        'group' => "R{$idx}",
                    ],
                    ['is_correct' => false]
                );

                // Petakan ID_Kiri => ID_Kanan
                $kunciMap[$opsiKiri->id] = $opsiKanan->id;
            }

            // Update tabel 'soals' dengan JSON pemetaan ID
            $soal->update([
                'kunci_jawaban' => json_encode($kunciMap),
            ]);
        }

        return redirect()->route('admin.bank-soal.index')->with('success', 'Soal berhasil disimpan secara Relasional!');
    }

    public function edit($id)
    {
        // Pastikan relasi opsi dimuat agar bisa ditampilkan di form Edit React nantinya
        $soal = Soal::with('opsis')->findOrFail($id);
        $kategori = Kategori::all(); // Diperbaiki: Menggunakan Kategori

        return Inertia::render('Admin/BankSoal/Edit', [
            'soal' => $soal,
            'kategori' => $kategori,
        ]);
    }

    public function update(Request $request, $id)
    {
        // Logika Update akan mirip dengan Store (hapus opsi lama, buat opsi baru, update parent soal)
        // Saat ini masih menggunakan struktur dasar dari Anda
        $request->validate([
            'kategori_id' => 'required|exists:kategoris,id',
            'pertanyaan' => 'required|string',
            'tipe_soal' => 'required',
        ]);

        Soal::findOrFail($id)->update([
            'kategori_id' => $request->kategori_id,
            'tipe_soal' => $request->tipe_soal,
            'pertanyaan' => $request->pertanyaan,
            'bobot_nilai' => $request->bobot_nilai,
        ]);

        return redirect()->route('admin.bank-soal.index')->with('success', 'Soal berhasil diperbarui.');
    }

    public function destroy($id)
    {
        // Cascade on delete di database akan otomatis menghapus data di tabel soal_opsis
        Soal::findOrFail($id)->delete();

        return back()->with('success', 'Soal berhasil dihapus.');
    }
}
