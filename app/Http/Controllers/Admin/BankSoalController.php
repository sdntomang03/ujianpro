<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kategori; // Digunakan untuk Bank Soal (berdasarkan Seeder Anda)
use App\Models\KategoriUjian;
use App\Models\Soal;
use App\Models\Ujian;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BankSoalController extends Controller
{
    public function index(Request $request)
    {
        $kategori = Kategori::all();

        // UBAH BARIS INI: Tambahkan 'opsis' ke dalam array with()
        $soal = Soal::with(['kategori', 'opsis'])
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

    public function create(Request $request)
    {
        // Diperbaiki: Menggunakan Kategori, bukan KategoriUjian (Karena KategoriUjian untuk jadwal)
        $kategori = Kategori::all();

        return Inertia::render('Admin/BankSoal/Create', [
            'kategori' => $kategori,
            'ujian_id' => $request->ujian_id,
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

        // 2. Upload Gambar (Opsional) - MENGGUNAKAN WEBP
        $pathGambar = null;
        if ($request->hasFile('gambar')) {
            // Kita panggil helper konversi WebP di sini
            $pathGambar = $this->handleWebpUpload($request->file('gambar'), 'utama');
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

        if ($request->filled('ujian_id')) {
            $ujian = Ujian::find($request->ujian_id);

            if ($ujian) {
                // Cari nomor urut terakhir di ujian ini agar urutannya rapi
                $nomorTerakhir = $ujian->soals()->max('urutan_nomor') ?? 0;

                // Attach soal baru ke tabel pivot ujian_soal
                $ujian->soals()->attach($soal->id, ['urutan_nomor' => $nomorTerakhir + 1]);

                // Redirect kembali ke halaman Kelola Ujian
                return redirect()->route('admin.ujian.show', $ujian->id)
                    ->with('success', 'Soal berhasil dibuat dan ditambahkan ke ujian.');
            }
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
        $soal = Soal::findOrFail($id);

        // 1. Validasi Dasar
        $request->validate([
            'kategori_id' => 'required|exists:kategoris,id',
            'tipe_soal' => 'required',
            'pertanyaan' => 'required|string',
            'bobot_nilai' => 'required|integer',
        ]);

        // 2. URUSAN GAMBAR (Cek apakah ada gambar baru atau gambar lama dihapus)
        $pathGambar = $soal->file_gambar; // Default pakai gambar lama

        if ($request->hasFile('gambar')) {
            // Panggil helper konversi WebP untuk gambar baru
            $pathGambar = $this->handleWebpUpload($request->file('gambar'), 'utama');

            // Hapus gambar lama dari server
            if ($soal->file_gambar && Storage::disk('public')->exists($soal->file_gambar)) {
                Storage::disk('public')->delete($soal->file_gambar);
            }
        } elseif ($request->hapus_gambar) {
            $pathGambar = null;
            if ($soal->file_gambar && Storage::disk('public')->exists($soal->file_gambar)) {
                Storage::disk('public')->delete($soal->file_gambar);
            }
        }

        // --- MENGUMPULKAN OPSI LAMA UNTUK UPDATE CERDAS ---
        // Kita ambil ID opsi yang sudah ada agar bisa di-update (bukan di-delete)
        $opsiLama = $soal->opsis()->orderBy('id')->get();
        $opsiLamaIds = $opsiLama->pluck('id')->toArray();
        $opsiTerprosesIds = [];

        // Variabel untuk kunci (akan di-encode ke json nanti)
        $final_kunci = null;

        // 3. PROSES UPDATE/CREATE OPSI & SET KUNCI SECARA BERSAMAAN
        if (in_array($request->tipe_soal, ['pg', 'pg_kompleks', 'survei'])) {
            $kunciArray = [];

            foreach ($request->opsi as $index => $teksOpsi) {
                // Tentukan status benar/salah
                $isCorrect = false;
                if ($request->tipe_soal === 'pg' && $request->kunci_jawaban == $index) {
                    $isCorrect = true;
                } elseif ($request->tipe_soal === 'pg_kompleks' && in_array($index, $request->kunci_kompleks)) {
                    $isCorrect = true;
                }

                // Jika masih ada sisa ID opsi lama, lakukan UPDATE
                if (isset($opsiLama[$index])) {
                    $opsi = $opsiLama[$index];
                    $opsi->update(['teks_opsi' => $teksOpsi, 'is_correct' => $isCorrect]);
                    $opsiTerprosesIds[] = $opsi->id;
                }
                // Jika user menambah opsi baru melebihi yang lama, lakukan CREATE
                else {
                    $opsi = $soal->opsis()->create(['teks_opsi' => $teksOpsi, 'is_correct' => $isCorrect]);
                    $opsiTerprosesIds[] = $opsi->id;
                }

                // Catat teks kunci untuk disimpan di tabel soal utama
                if ($isCorrect) {
                    $kunciArray[] = $teksOpsi;
                }
            }
            $final_kunci = $kunciArray;

        } elseif ($request->tipe_soal === 'benar_salah') {
            $kunciMap = [];

            foreach ($request->pernyataan_bs as $index => $item) {
                $isCorrect = ($item['kunci'] === 'Benar');

                if (isset($opsiLama[$index])) {
                    $opsi = $opsiLama[$index];
                    $opsi->update(['teks_opsi' => $item['teks'], 'is_correct' => $isCorrect]);
                    $opsiTerprosesIds[] = $opsi->id;
                } else {
                    $opsi = $soal->opsis()->create(['teks_opsi' => $item['teks'], 'is_correct' => $isCorrect]);
                    $opsiTerprosesIds[] = $opsi->id;
                }

                $kunciMap["row_{$index}"] = $item['kunci'];
            }
            $final_kunci = $kunciMap;

        } elseif ($request->tipe_soal === 'isian') {
            $kunciArray = array_map('trim', explode(',', $request->kunci_isian));

            // Untuk isian, kita anggap jawaban benar semua
            foreach ($kunciArray as $index => $kunci) {
                if (isset($opsiLama[$index])) {
                    $opsi = $opsiLama[$index];
                    $opsi->update(['teks_opsi' => $kunci, 'is_correct' => true]);
                    $opsiTerprosesIds[] = $opsi->id;
                } else {
                    $opsi = $soal->opsis()->create(['teks_opsi' => $kunci, 'is_correct' => true]);
                    $opsiTerprosesIds[] = $opsi->id;
                }
            }
            $final_kunci = $kunciArray;

        } elseif ($request->tipe_soal === 'menjodohkan') {
            // Karena menjodohkan agak rumit (satu baris punya L dan R),
            // kita pisahkan opsiLama Kiri dan Kanan
            $opsiKiriLama = $opsiLama->filter(function ($o) {
                return str_starts_with($o->group, 'L');
            })->values();
            $opsiKananLama = $opsiLama->filter(function ($o) {
                return str_starts_with($o->group, 'R');
            })->values();

            $kunciMapReal = [];

            foreach ($request->pasangan as $index => $pair) {
                $idx = $index + 1;

                // Update atau Create Kolom Kiri
                if (isset($opsiKiriLama[$index])) {
                    $opsiKiri = $opsiKiriLama[$index];
                    $opsiKiri->update(['teks_opsi' => $pair['kiri'], 'group' => "L{$idx}", 'is_correct' => false]);
                    $opsiTerprosesIds[] = $opsiKiri->id;
                } else {
                    $opsiKiri = $soal->opsis()->create(['teks_opsi' => $pair['kiri'], 'group' => "L{$idx}", 'is_correct' => false]);
                    $opsiTerprosesIds[] = $opsiKiri->id;
                }

                // Update atau Create Kolom Kanan
                if (isset($opsiKananLama[$index])) {
                    $opsiKanan = $opsiKananLama[$index];
                    $opsiKanan->update(['teks_opsi' => $pair['kanan'], 'group' => "R{$idx}", 'is_correct' => false]);
                    $opsiTerprosesIds[] = $opsiKanan->id;
                } else {
                    $opsiKanan = $soal->opsis()->create(['teks_opsi' => $pair['kanan'], 'group' => "R{$idx}", 'is_correct' => false]);
                    $opsiTerprosesIds[] = $opsiKanan->id;
                }

                // Hubungkan Kiri (Key ID) dengan Kanan (Value ID)
                $kunciMapReal[$opsiKiri->id] = $opsiKanan->id;
            }
            $final_kunci = $kunciMapReal;
        }

        // 4. HAPUS OPSI SISA YANG TIDAK DIPAKAI LAGI
        // Jika sebelumnya ada 5 opsi, lalu user menghapus 1 opsi jadi 4,
        // kita cari ID opsi ke-5 yang tidak terproses lalu kita hapus.
        $opsiHapusIds = array_diff($opsiLamaIds, $opsiTerprosesIds);
        if (count($opsiHapusIds) > 0) {
            $soal->opsis()->whereIn('id', $opsiHapusIds)->delete();
        }

        // 5. UPDATE DATA INDUK SOAL BESERTA KUNCI JSON FINAL
        $soal->update([
            'kategori_id' => $request->kategori_id,
            'tipe_soal' => $request->tipe_soal,
            'pertanyaan' => $request->pertanyaan,
            'file_gambar' => $pathGambar,
            'bobot_nilai' => $request->bobot_nilai,
            'kunci_jawaban' => $final_kunci ? json_encode($final_kunci) : null,
        ]);

        return redirect()->route('admin.bank-soal.index')->with('success', 'Soal berhasil diperbarui tanpa merusak riwayat ID opsi.');
    }

    public function destroy($id)
    {
        // Cascade on delete di database akan otomatis menghapus data di tabel soal_opsis
        Soal::findOrFail($id)->delete();

        return back()->with('success', 'Soal berhasil dihapus.');
    }

    // --- METHOD KHUSUS UPLOAD GAMBAR DARI TEXT EDITOR ---
    public function uploadImageEditor(Request $request)
    {
        if ($request->hasFile('image')) {
            // Gunakan helper WebP dengan prefix 'editor'
            $path = $this->handleWebpUpload($request->file('image'), 'editor');

            return response()->json([
                'url' => asset('storage/'.$path),
            ]);
        }

        return response()->json(['error' => 'Gagal mengupload gambar'], 400);
    }

    /**
     * Fungsi Helper untuk Mengubah Gambar Apapun Menjadi WebP
     */
    private function handleWebpUpload($file, $prefix = 'img')
    {
        // 1. Pastikan folder penyimpanan tersedia
        $folderPath = storage_path('app/public/soal_images');
        if (! file_exists($folderPath)) {
            mkdir($folderPath, 0755, true);
        }

        // 2. Muat gambar ke memori PHP
        $image = imagecreatefromstring(file_get_contents($file));

        // 3. Jaga transparansi jika gambar aslinya adalah PNG
        imagepalettetotruecolor($image);
        imagealphablending($image, true);
        imagesavealpha($image, true);

        // 4. Siapkan nama file WebP baru
        $filename = $prefix.'_'.time().'_'.uniqid().'.webp';
        $fullPath = $folderPath.'/'.$filename;

        // 5. Konversi dan simpan sebagai WebP (Kualitas 80%)
        imagewebp($image, $fullPath, 80);

        // 6. Bersihkan memori PHP agar server tidak berat
        imagedestroy($image);

        // Kembalikan path relatif untuk disimpan ke database
        return 'soal_images/'.$filename;
    }
}
