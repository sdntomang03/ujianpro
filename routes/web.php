<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UjianController;
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
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/admin/dashboard', function () {
    return Inertia::render('AdminDashboard');
})->middleware(['auth', 'verified'])->name('admin.dashboard');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::middleware(['auth'])->group(function () {
        // Rute Generate Soal
        Route::get('/ujian/{id}/mulai', [UjianController::class, 'mulaiUjian'])->name('ujian.mulai');

        // Rute Buka Ruang Ujian (UPDATE INI)
        Route::get('/ruang-ujian/{sesi_id}', [UjianController::class, 'ruangUjian'])->name('ruang.ujian');
        // Rute Auto-Save Jawaban (Berjalan di latar belakang)
        Route::post('/ujian/{sesi_id}/simpan-jawaban', [UjianController::class, 'simpanJawaban'])->name('ujian.simpan_jawaban');

        // Rute Submit Ujian Selesai
        Route::post('/ujian/{sesi_id}/selesai', [UjianController::class, 'selesaiUjian'])->name('ujian.selesai');
    });

});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
