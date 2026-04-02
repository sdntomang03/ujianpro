<?php

namespace App\Http\Controllers\Admin;

use App\Exports\LaporanNilaiExport;
use App\Http\Controllers\Controller;
use App\Models\KategoriUjian;
use App\Models\PesertaUjian;
use App\Models\Ujian;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class LaporanController extends Controller
{
    public function index(Request $request)
    {
        // 1. Ambil data Kategori beserta Ujian di dalamnya

        $kategoriDanUjian = KategoriUjian::with(['ujians' => function ($query) {
            $query->withCount(['pesertaUjians as peserta_selesai' => function ($q) {
                $q->where('status', 'selesai');
            }]);
        }])->get();

        // 2. Ambil data Ujian untuk dropdown filter (opsional, jika masih butuh)
        $exams = Ujian::select('id', 'judul_ujian')->get();

        // 3. Query dasar: Ambil data peserta ujian yang sudah selesai
        $query = PesertaUjian::with(['user', 'ujian.kategoriUjian'])->where('status', 'selesai');

        // 4. Logika Filter Pencarian Nama Siswa
        if ($request->search) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', '%'.$request->search.'%');
            });
        }

        // 5. Logika Filter Mata Ujian
        if ($request->ujian_id) {
            $query->where('ujian_id', $request->ujian_id);
        }

        // 6. Eksekusi Query dengan Pagination (Urutkan dari nilai tertinggi)
        $reports = $query->orderBy('nilai_akhir', 'desc')->paginate(10)->withQueryString();

        // 7. Hitung Statistik Ringkas (Berdasarkan filter saat ini)
        $stats = [
            'total_peserta' => $query->count(),
            'rata_rata' => round($query->avg('nilai_akhir'), 2) ?? 0,
            'nilai_tertinggi' => $query->max('nilai_akhir') ?? 0,
            'lulus_count' => $query->where('nilai_akhir', '>=', 75)->count(), // Asumsi KKM 75
        ];

        return Inertia::render('Admin/Laporan/Index', [
            'kategoriDanUjian' => $kategoriDanUjian, // Data baru untuk struktur drill-down
            'reports' => $reports,
            'exams' => $exams,
            'stats' => $stats,
            'filters' => $request->only(['search', 'ujian_id']),
        ]);
    }

    public function show($id)
    {
        // Load peserta beserta jawaban, soal, dan opsi
        $peserta = PesertaUjian::with([
            'user',
            'ujian.kategoriUjian',
            'jawabanPesertas.soal.opsis', // Ini kunci utamanya!
        ])->findOrFail($id);

        return Inertia::render('Admin/Laporan/Show', [
            'peserta' => $peserta,
            'peta_acakan' => $peserta->peta_acakan,
        ]);
    }

    public function export(Request $request)
    {
        $request->validate([
            'ujian_id' => 'required|exists:ujians,id',
        ]);

        $ujian = Ujian::findOrFail($request->ujian_id);

        // Membersihkan nama file dari karakter yang dilarang Windows
        $namaFileSingkat = preg_replace('/[^A-Za-z0-9\- ]/', '', $ujian->judul_ujian);
        $namaFile = 'Laporan_Nilai_'.str_replace(' ', '_', $namaFileSingkat).'.xlsx';

        // Panggil Export Class dan download
        return Excel::download(new LaporanNilaiExport($request->ujian_id, $request->search), $namaFile);
    }
}
