<?php

use App\Http\Controllers\Admin\BankSoalController;
use App\Http\Controllers\Admin\SiswaController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UjianController;
use App\Models\PesertaUjian;
use App\Models\Soal;
use App\Models\Ujian;
use App\Models\User;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// 1. Halaman Utama (Public)
Route::get('/', function () {
    return Inertia::render('Home', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// 2. Group Rute Terautentikasi (Sudah Login)
Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/admin/dashboard', function () {
        // 1. Hitung Metrik Utama
        $totalSiswa = User::role('siswa')->count();
        $totalSoal = Soal::count();

        // Ujian dianggap "Berjalan" jika ada peserta yang statusnya belum 'selesai'
        $ujianBerjalanCount = PesertaUjian::where('status', '!=', 'selesai')
            ->distinct('ujian_id')
            ->count('ujian_id');

        $rataRataNilai = PesertaUjian::where('status', 'selesai')->avg('nilai_akhir') ?? 0;

        // 2. Data Pemantauan Ujian (Ambil Ujian yang sedang dikerjakan siswa)
        $daftarUjianAktif = Ujian::withCount(['pesertas as peserta_aktif' => function ($query) {
            $query->where('status', '!=', 'selesai');
        }])
            ->whereHas('pesertas', function ($query) {
                $query->where('status', '!=', 'selesai');
            })
            ->get()
            ->map(function ($u) {
                return [
                    'id' => $u->id,
                    'mapel' => $u->judul_ujian,
                    'kelas' => 'Semua Kelas',
                    'peserta' => $u->peserta_aktif,
                    'status' => 'Berjalan',
                ];
            });

        // 3. Aktivitas Terbaru (Nilai yang baru masuk)
        $hasilTerbaru = PesertaUjian::with(['user', 'ujian'])
            ->where('status', 'selesai')
            ->latest('updated_at')
            ->limit(5)
            ->get()
            ->map(function ($hasil) {
                return [
                    'id' => $hasil->id,
                    'siswa' => $hasil->user->name ?? 'User Dihapus',
                    'nis' => $hasil->user->id ?? '-',
                    'mapel' => $hasil->ujian->judul_ujian ?? 'Ujian Dihapus',
                    'nilai' => (float) $hasil->nilai_akhir,
                    'waktu' => $hasil->updated_at->diffForHumans(),
                ];
            });

        return Inertia::render('AdminDashboard', [
            'stats' => [
                'totalSiswa' => number_format($totalSiswa),
                'totalSoal' => number_format($totalSoal),
                'ujianBerjalan' => $ujianBerjalanCount,
                'lulusPercent' => round($rataRataNilai, 1).'%',
            ],
            'daftarUjianAktif' => $daftarUjianAktif,
            'hasilTerbaru' => $hasilTerbaru,
        ]);
    })->middleware(['auth', 'role:admin'])->name('admin.dashboard');

    Route::middleware(['auth', 'role:admin'])->prefix('admin')->group(function () {
        // CRUD Siswa
        Route::resource('siswa', SiswaController::class)
            ->names('admin.siswa');
        // CRUD Bank Soal
        Route::resource('bank-soal', BankSoalController::class)
            ->names('admin.bank-soal');
    });

    // --- AREA KHUSUS SISWA (Spatie Role) ---
    Route::middleware(['role:siswa'])->group(function () {

        // Dashboard Siswa dengan Logika Statistik
        Route::get('/dashboard', function () {
            $user = auth()->user();

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

            // 3. Filter Ujian Tersedia (Belum dikerjakan)
            $idUjianSelesai = $riwayatRaw->pluck('ujian_id')->toArray();
            $ujianTersedia = Ujian::withCount('soals')
                ->whereNotIn('id', $idUjianSelesai)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(fn ($u) => [
                    'id' => $u->id,
                    'judul' => $u->judul_ujian,
                    'mapel' => 'Ujian Utama',
                    'durasi' => $u->durasi_menit.' Menit',
                    'soal' => $u->soals_count,
                    'status' => 'Tersedia',
                ]);

            return Inertia::render('Dashboard', [
                'statistik' => $statistik,
                'ujianTersedia' => $ujianTersedia,
                'riwayatUjian' => $riwayat,
            ]);
        })->name('dashboard');

        // Fitur Utama Ujian (Sudah menggunakan POST untuk mulai)
        Route::get('/daftar-ujian', [UjianController::class, 'index'])->name('ujian.index');
        Route::get('/ujian/{id}/persiapan', [UjianController::class, 'persiapan'])->name('ujian.persiapan');
        Route::post('/ujian/{id}/mulai', [UjianController::class, 'mulaiUjian'])->name('ujian.mulai');
        Route::get('/ruang-ujian/{sesi_id}', [UjianController::class, 'ruangUjian'])->name('ruang.ujian');
        Route::post('/ujian/{sesi_id}/simpan-jawaban', [UjianController::class, 'simpanJawaban'])->name('ujian.simpan_jawaban');
        Route::post('/ujian/{sesi_id}/selesai', [UjianController::class, 'selesaiUjian'])->name('ujian.selesai');
    });

    // Rute Profile (Admin & Siswa bisa akses)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
