<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kategori;
use App\Models\KategoriUjian;
use App\Models\Soal;
use App\Models\Ujian;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UjianController extends Controller
{
    // 1. Menampilkan Daftar Ujian (CRUD Read)
    public function index()
    {
        $ujians = Ujian::with('kategoriUjian')->latest()->paginate(10);
        $kategoriUjian = KategoriUjian::all(); // Mengambil data kategori untuk dropdown di modal

        return Inertia::render('Admin/Ujian/Index', [
            'ujians' => $ujians,
            'kategoriUjian' => $kategoriUjian, // Kirim ke React
        ]);
    }

    // 2. Menampilkan Detail Ujian & Daftar Soal di dalamnya
    public function show(Request $request, $id)
    {
        $ujian = Ujian::with(['kategoriUjian', 'soals'])->findOrFail($id);
        $kategoris = Kategori::all();

        $soalTerpakaiIds = $ujian->soals->pluck('id')->toArray();

        // 🌟 SERVER-SIDE QUERY, FILTER, DAN PAGINATION
        $bankSoal = Soal::with('kategori')
            ->whereNotIn('id', $soalTerpakaiIds)
            ->when($request->kategori_id, function ($query, $kategori_id) {
                // Filter berdasarkan Kategori jika ada parameter kategori_id
                return $query->where('kategori_id', $kategori_id);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString(); // Mempertahankan parameter filter di URL saat ganti halaman

        return Inertia::render('Admin/Ujian/Show', [
            'ujian' => $ujian,
            'kategoris' => $kategoris,
            'bankSoal' => $bankSoal,
            'filters' => $request->only(['kategori_id', 'page']), // Kirim filter saat ini ke React
        ]);
    }

    // --- FUNGSI IMPORT & MANAJEMEN SOAL ---

    // 3. Import Soal dari Bank Soal ke Ujian
    public function importSoal(Request $request, $id)
    {
        $request->validate([
            'soal_ids' => 'required|array',
            'soal_ids.*' => 'exists:soals,id',
        ]);

        $ujian = Ujian::findOrFail($id);

        // syncWithoutDetaching mencegah soal lama terhapus saat menambah soal baru
        $ujian->soals()->syncWithoutDetaching($request->soal_ids);

        return back()->with('success', 'Berhasil mengimpor '.count($request->soal_ids).' soal ke dalam ujian.');
    }

    // 4. Mengeluarkan Soal dari Ujian (TIDAK menghapus dari bank soal)
    public function removeSoal($ujian_id, $soal_id)
    {
        $ujian = Ujian::findOrFail($ujian_id);
        $ujian->soals()->detach($soal_id);

        return back()->with('success', 'Soal berhasil dikeluarkan dari ujian.');
    }

    public function store(Request $request)
    {
        $request->validate([
            'kategori_ujian_id' => 'required|exists:kategori_ujians,id',
            'judul_ujian' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'durasi_menit' => 'required|integer|min:1',
            'waktu_mulai' => 'nullable|date',
            'waktu_selesai' => 'nullable|date|after_or_equal:waktu_mulai',
            'acak_soal' => 'boolean',
            'acak_opsi' => 'boolean',
        ]);

        Ujian::create($request->all());

        return back()->with('success', 'Ujian berhasil dibuat!');
    }

    // 3. Menyimpan Perubahan Ujian (Dipanggil dari Modal Edit)
    public function update(Request $request, $id)
    {
        $request->validate([
            'kategori_ujian_id' => 'required|exists:kategori_ujians,id',
            'judul_ujian' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'durasi_menit' => 'required|integer|min:1',
            'waktu_mulai' => 'nullable|date',
            'waktu_selesai' => 'nullable|date|after_or_equal:waktu_mulai',
            'acak_soal' => 'boolean',
            'acak_opsi' => 'boolean',
        ]);

        $ujian = Ujian::findOrFail($id);
        $ujian->update($request->all());

        return back()->with('success', 'Pengaturan Ujian berhasil diperbarui!');
    }
}
