<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kategori;
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

    // METHOD BARU: Buka halaman Tambah
    public function create()
    {
        $kategori = KategoriUjian::all();

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

        // Upload Gambar
        $pathGambar = null;
        if ($request->hasFile('gambar')) {
            $pathGambar = $request->file('gambar')->store('soal_images', 'public');
        }

        // Siapkan variabel untuk menampung JSON kunci jawaban
        $final_kunci = null;

        // --- A. LOGIKA FORMAT KUNCI JAWABAN (SESUAI SEEDER) ---

        if ($request->tipe_soal === 'pg') {
            // Seeder: 'kunci_jawaban' => ['Jakarta']
            // React ngirim integer index (misal: 0). Kita ambil teks aslinya dari array opsi.
            $teksKunci = $request->opsi[$request->kunci_jawaban];
            $final_kunci = [$teksKunci];
        } elseif ($request->tipe_soal === 'pg_kompleks') {
            // Seeder: 'kunci_jawaban' => ['JavaScript', 'Python']
            // React ngirim array of index [0, 2].
            $kunciArray = [];
            foreach ($request->kunci_kompleks as $idx) {
                $kunciArray[] = $request->opsi[$idx];
            }
            $final_kunci = $kunciArray;
        } elseif ($request->tipe_soal === 'isian') {
            // Seeder: 'kunci_jawaban' => ['Sapi', 'Kambing']
            // React ngirim text comma-separated: "Sapi, Kambing"
            // Kita pecah menjadi array dan bersihkan spasi
            $kunciArray = array_map('trim', explode(',', $request->kunci_isian));
            $final_kunci = $kunciArray;
        } elseif ($request->tipe_soal === 'menjodohkan') {
            // Seeder: 'kunci_jawaban' => ['L1' => 'R2', 'L2' => 'R3', 'L3' => 'R1']
            $kunciMap = [];
            foreach ($request->pasangan as $index => $pair) {
                $idx = $index + 1; // Mulai dari 1
                $kunciMap["L{$idx}"] = "R{$idx}"; // Karena input dari React berpasangan langsung L1=R1
            }
            $final_kunci = $kunciMap;
        } elseif ($request->tipe_soal === 'benar_salah') {
            // Seeder: 'kunci_jawaban' => ['row_0' => 'Salah', 'row_1' => 'Benar']
            $kunciMap = [];
            foreach ($request->pernyataan_bs as $index => $item) {
                $kunciMap["row_{$index}"] = $item['kunci']; // "Benar" atau "Salah"
            }
            $final_kunci = $kunciMap;
        }

        // --- B. SIMPAN DATA INDUK KE TABEL SOALS ---
        $soal = Soal::create([
            'kategori_id' => $request->kategori_id,
            'tipe_soal' => $request->tipe_soal,
            'pertanyaan' => $request->pertanyaan,
            'file_gambar' => $pathGambar,
            'bobot_nilai' => $request->bobot_nilai,
            // JSON Encode akan otomatis mengubah array PHP menjadi JSON valid untuk database
            'kunci_jawaban' => $final_kunci ? json_encode($final_kunci) : null,
        ]);

        // --- C. SIMPAN KE TABEL SOAL_OPSIS (SESUAI SEEDER) ---

        if (in_array($request->tipe_soal, ['pg', 'pg_kompleks', 'survei'])) {
            // Seeder: Hanya simpan teksnya saja (group = null)
            foreach ($request->opsi as $teksOpsi) {
                $soal->opsis()->create(['teks_opsi' => $teksOpsi]);
            }
        } elseif ($request->tipe_soal === 'benar_salah') {
            // Seeder: Hanya simpan teks opsinya, tanpa group
            foreach ($request->pernyataan_bs as $item) {
                $soal->opsis()->create(['teks_opsi' => $item['teks']]);
            }
        } elseif ($request->tipe_soal === 'menjodohkan') {
            // Seeder: Simpan kiri (group='kiri') dan kanan (group='kanan')
            // Namun, untuk menghindari data kembar jika 2 premis punya jawaban kanan yg sama persis,
            // kita kumpulkan dulu.
            $kiriArray = [];
            $kananArray = [];

            foreach ($request->pasangan as $pair) {
                $kiriArray[] = $pair['kiri'];
                $kananArray[] = $pair['kanan'];
            }

            // Simpan Kiri
            foreach ($kiriArray as $teks) {
                $soal->opsis()->create(['teks_opsi' => $teks, 'group' => 'kiri']);
            }
            // Simpan Kanan (Diambil unik agar tidak ada opsi ganda di layar siswa)
            foreach (array_unique($kananArray) as $teks) {
                $soal->opsis()->create(['teks_opsi' => $teks, 'group' => 'kanan']);
            }
        }
        // Catatan: Tipe 'isian' tidak menyimpan apapun ke SoalOpsi (sesuai Seeder Anda).

        return redirect()->route('admin.bank-soal.index')->with('success', 'Soal berhasil disimpan dengan format Seeder!');
    }

    // METHOD BARU: Buka halaman Edit
    public function edit($id)
    {
        $soal = Soal::findOrFail($id);
        $kategori = KategoriUjian::all();

        return Inertia::render('Admin/BankSoal/Edit', [
            'soal' => $soal,
            'kategori' => $kategori,
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'kategori_ujian_id' => 'required|exists:kategori_ujians,id',
            'pertanyaan' => 'required|string',
            // ... validasi lainnya sama seperti store
        ]);

        Soal::findOrFail($id)->update($request->all());

        // Redirect kembali ke index
        return redirect()->route('admin.bank-soal.index')->with('success', 'Soal berhasil diperbarui.');
    }

    public function destroy($id)
    {
        Soal::findOrFail($id)->delete();

        return back()->with('success', 'Soal berhasil dihapus.');
    }
}
