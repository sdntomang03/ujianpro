<?php

use App\Http\Controllers\Admin\BankSoalController;
use App\Http\Controllers\Admin\LaporanController;
use App\Http\Controllers\Admin\SiswaController as AdminSiswaController;
use App\Http\Controllers\Admin\TransaksiController;
use App\Http\Controllers\Admin\UjianController as AdminUjianController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Siswa\LanggananController;
use App\Http\Controllers\SiswaController;
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

// 🌟 2. Group Rute Terautentikasi (TAMBAHKAN auth.session DI SINI)
Route::middleware(['auth', 'verified', 'auth.session'])->group(function () {

    // --- AREA ADMIN ---
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
    })->middleware(['role:admin'])->name('admin.dashboard');

    // Group khusus Role Admin
    Route::middleware(['role:admin'])->prefix('admin')->group(function () {
        // CRUD Siswa
        Route::resource('siswa', AdminSiswaController::class)->names('admin.siswa');

        // CRUD Bank Soal
        Route::resource('bank-soal', BankSoalController::class)->names('admin.bank-soal');
        Route::post('bank-soal/upload-editor-image', [BankSoalController::class, 'uploadImageEditor'])->name('admin.bank-soal.upload-editor-image');

        // Laporan Nilai
        Route::get('laporan-nilai', [LaporanController::class, 'index'])->name('admin.laporan.index');
        Route::get('laporan-nilai/export', [LaporanController::class, 'export'])->name('admin.laporan.export');
        Route::get('laporan-nilai/{id}', [LaporanController::class, 'show'])->name('admin.laporan.show');

        // CRUD Ujian Dasar
        Route::resource('ujian', AdminUjianController::class)->names('admin.ujian');

        // Route Khusus Manajemen Soal di dalam Ujian
        Route::post('/ujian/{ujian}/import-soal', [AdminUjianController::class, 'importSoal'])->name('admin.ujian.import-soal');
        Route::delete('/ujian/{ujian}/remove-soal/{soal}', [AdminUjianController::class, 'removeSoal'])->name('admin.ujian.remove-soal');

        // Rute Monitoring Ujian
        Route::get('/ujian/{id}/monitoring', [AdminUjianController::class, 'monitoring'])->name('admin.ujian.monitoring');
        Route::post('/ujian/{ujian_id}/peserta/reset', [AdminUjianController::class, 'resetPeserta'])->name('admin.ujian.reset-peserta');
        Route::post('/ujian/{ujian_id}/peserta/tambah-waktu', [AdminUjianController::class, 'tambahWaktu'])->name('admin.ujian.tambah-waktu');
        Route::post('/ujian/{id}/recalculate-nilai', [AdminUjianController::class, 'recalculateNilai'])->name('admin.ujian.recalculate');

        // Transaksi (Pindah ke dalam blok admin ini agar lebih rapi)
        Route::get('/transaksi', [TransaksiController::class, 'index'])->name('admin.transaksi.index');
        Route::post('/transaksi/{id}/approve', [TransaksiController::class, 'approve'])->name('admin.transaksi.approve');
        Route::post('/transaksi/{id}/reject', [TransaksiController::class, 'reject'])->name('admin.transaksi.reject');
    });

    // --- AREA KHUSUS SISWA (Spatie Role) ---
    Route::middleware(['role:siswa'])->group(function () {
        // Dashboard Siswa
        Route::get('/dashboard', [SiswaController::class, 'index'])->name('dashboard');

        // Fitur Utama Ujian
        Route::get('/daftar-ujian', [UjianController::class, 'index'])->name('ujian.index');
        Route::get('/ujian/{id}/persiapan', [UjianController::class, 'persiapan'])->name('ujian.persiapan');
        Route::post('/ujian/{id}/mulai', [UjianController::class, 'mulaiUjian'])->name('ujian.mulai');
        Route::get('/ruang-ujian/{sesi_id}', [UjianController::class, 'ruangUjian'])->name('ruang.ujian');
        Route::post('/ujian/{sesi_id}/simpan-jawaban', [UjianController::class, 'simpanJawaban'])->name('ujian.simpan_jawaban');
        Route::post('/ujian/{sesi_id}/selesai', [UjianController::class, 'selesaiUjian'])->name('ujian.selesai');

        // Upgrade Paket (Pindah ke dalam blok siswa ini)
        Route::get('/upgrade', [LanggananController::class, 'index'])->name('upgrade.plan');
        Route::post('/upgrade/proses', [LanggananController::class, 'prosesUpgrade'])->name('upgrade.process');
    });

    // --- Rute Bebas (Admin & Siswa bisa akses) ---
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
