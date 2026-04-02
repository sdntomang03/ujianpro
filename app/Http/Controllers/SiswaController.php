<?php

namespace App\Http\Controllers;

use App\Models\PesertaUjian; // 🌟 Pastikan model ini di-import
use App\Models\Ujian;        // 🌟 Pastikan model ini di-import
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SiswaController extends Controller
{
    public function index()
    {
        // 🌟 Load relasi paket agar kita tahu "Level Kekuatan" siswa
        $user = Auth::user()->load('paket');

        // 1. Ambil Riwayat Ujian Siswa (Selesai)
        $riwayatRaw = PesertaUjian::with('ujian')
            ->where('user_id', $user->id)
            ->where('status', 'selesai')
            ->orderBy('updated_at', 'desc')
            ->get();

        $riwayat = $riwayatRaw->map(fn ($sesi) => [
            'id' => $sesi->id,
            'judul' => $sesi->ujian->judul_ujian ?? 'Ujian Dihapus',
            'tanggal' => $sesi->updated_at->format('d M Y'),
            'nilai' => (float) $sesi->nilai_akhir,
            'status' => $sesi->nilai_akhir >= 70 ? 'Lulus' : 'Remedial',
        ]);

        // 2. Hitung Statistik
        $totalSelesai = $riwayat->count();
        $rataRata = $totalSelesai > 0 ? $riwayat->avg('nilai') : 0;
        $lulus = $riwayat->where('status', 'Lulus')->count();

        $statistik = [
            ['title' => 'Ujian Diselesaikan', 'value' => $totalSelesai, 'icon' => '📝', 'color' => 'text-indigo-600', 'bg' => 'bg-indigo-50'],
            ['title' => 'Nilai Rata-rata', 'value' => round($rataRata, 1), 'icon' => '🎯', 'color' => 'text-emerald-600', 'bg' => 'bg-emerald-50'],
            ['title' => 'Lulus Ujian', 'value' => $lulus, 'icon' => '🏆', 'color' => 'text-amber-600', 'bg' => 'bg-amber-50'],
        ];

        // 3. Filter Ujian Tersedia (Belum dikerjakan & Sesuai Jenjang)
        $idUjianSelesai = $riwayatRaw->pluck('ujian_id')->toArray();
        $ujianTersedia = Ujian::with(['kategoriUjian', 'minimalPaket'])
            ->withCount('soals')
            ->where('jenjang', $user->jenjang) // 🌟 HANYA TAMPILKAN UJIAN YANG SE-JENJANG
            ->whereNotIn('id', $idUjianSelesai)
            ->orderBy('created_at', 'desc')
            ->take(4) // Dashboard biasanya cukup menampilkan max 4 ujian terbaru
            ->get()
            ->map(fn ($u) => [
                'id' => $u->id,
                'judul' => $u->judul_ujian,
                'mapel' => $u->kategoriUjian->nama_kategori ?? 'Umum',
                'durasi' => $u->durasi_menit.' Menit',
                'soal' => $u->soals_count,
                'status' => 'Tersedia',
                // 🌟 Data tambahan untuk validasi kunci gembok di React
                'min_level' => $u->minimalPaket->level ?? 0,
                'min_paket_nama' => $u->minimalPaket->nama_paket ?? 'Umum',
            ]);

        return Inertia::render('Dashboard', [
            'statistik' => $statistik,
            'ujianTersedia' => $ujianTersedia,
            'riwayatUjian' => $riwayat,
            'userPaket' => $user->paket, // 🌟 KIRIM PAKET SISWA KE REACT
        ]);
    }
}
