<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UjianController;
use App\Models\PesertaUjian;
use App\Models\Ujian;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Home', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    $user = auth()->user();

    // 1. Ambil Riwayat Ujian Siswa (Yang statusnya 'selesai')
    $riwayatRaw = PesertaUjian::with('ujian')
        ->where('user_id', $user->id)
        ->where('status', 'selesai')
        ->orderBy('updated_at', 'desc')
        ->get();

    $riwayat = $riwayatRaw->map(function ($sesi) {
        return [
            'id' => $sesi->id,
            'judul' => $sesi->ujian->judul_ujian ?? 'Ujian Dihapus',
            'tanggal' => $sesi->updated_at->format('d M Y'),
            'nilai' => (float) $sesi->nilai_akhir,
            'status' => $sesi->nilai_akhir >= 70 ? 'Lulus' : 'Remedial', // Anggap KKM-nya 70
        ];
    });

    // 2. Hitung Statistik Nyata
    $totalSelesai = $riwayat->count();
    $rataRata = $totalSelesai > 0 ? $riwayat->avg('nilai') : 0;
    $lulus = $riwayat->where('status', 'Lulus')->count();

    $statistik = [
        ['title' => 'Ujian Diselesaikan', 'value' => $totalSelesai, 'icon' => '📝', 'color' => 'text-indigo-600', 'bg' => 'bg-indigo-50'],
        ['title' => 'Nilai Rata-rata', 'value' => round($rataRata, 1), 'icon' => '🎯', 'color' => 'text-emerald-600', 'bg' => 'bg-emerald-50'],
        ['title' => 'Lulus Ujian', 'value' => $lulus, 'icon' => '🏆', 'color' => 'text-amber-600', 'bg' => 'bg-amber-50'],
    ];

    // --- PERBAIKAN LOGIKA: FILTER UJIAN TERSEDIA ---

    // A. Ambil semua ID Ujian yang SUDAH dikerjakan oleh user ini
    $idUjianSelesai = $riwayatRaw->pluck('ujian_id')->toArray();

    // B. Ambil Ujian dari database, KECUALI yang ID-nya ada di daftar $idUjianSelesai
    $ujianTersedia = Ujian::withCount('soals')
        ->whereNotIn('id', $idUjianSelesai) // Ini kunci utamanya!
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function ($u) {
            return [
                'id' => $u->id,
                'judul' => $u->judul_ujian,
                'mapel' => 'Ujian Utama', // Bisa diganti sesuai kolom mapel di database-mu
                'durasi' => $u->durasi_menit.' Menit',
                'soal' => $u->soals_count,
                'status' => 'Tersedia',
            ];
        });

    // 4. Kirim ke React (Inertia)
    return Inertia::render('Dashboard', [
        'statistik' => $statistik,
        'ujianTersedia' => $ujianTersedia,
        'riwayatUjian' => $riwayat,
    ]);

})->name('dashboard');

Route::get('/admin/dashboard', function () {
    return Inertia::render('AdminDashboard');
})->middleware(['auth', 'verified'])->name('admin.dashboard');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/daftar-ujian', [UjianController::class, 'index'])->name('ujian.index');
    Route::get('/ujian/{id}/persiapan', [UjianController::class, 'persiapan'])->name('ujian.persiapan');
    // Rute Generate Soal
    Route::post('/ujian/{id}/mulai', [UjianController::class, 'mulaiUjian'])->name('ujian.mulai');

    // Rute Buka Ruang Ujian (UPDATE INI)
    Route::get('/ruang-ujian/{sesi_id}', [UjianController::class, 'ruangUjian'])->name('ruang.ujian');
    // Rute Auto-Save Jawaban (Berjalan di latar belakang)
    Route::post('/ujian/{sesi_id}/simpan-jawaban', [UjianController::class, 'simpanJawaban'])->name('ujian.simpan_jawaban');

    // Rute Submit Ujian Selesai
    Route::post('/ujian/{sesi_id}/selesai', [UjianController::class, 'selesaiUjian'])->name('ujian.selesai');

});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
