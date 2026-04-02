<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaksi;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransaksiController extends Controller
{
    /**
     * Menampilkan daftar semua transaksi
     */
    public function index()
    {
        // Ambil transaksi, urutkan dari yang terbaru, bawa data user & paketnya
        $transaksis = Transaksi::with(['user', 'paket'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Admin/Transaksi/Index', [
            'transaksis' => $transaksis,
        ]);
    }

    /**
     * Jika Admin Klik "Setujui"
     */
    public function approve($id)
    {
        // Tarik data transaksi sekalian dengan relasi user dan paket-nya
        $transaksi = Transaksi::with(['user', 'paket'])->findOrFail($id);

        // Cegah klik ganda jika sudah di-approve sebelumnya
        if ($transaksi->status === 'approved') {
            return back()->with('error', 'Transaksi ini sudah disetujui sebelumnya!');
        }

        // 1. Ubah status transaksi
        $transaksi->update(['status' => 'approved']);

        // 2. 🌟 KUNCI UTAMA: Update level paket si Siswa!
        if ($transaksi->user) {
            $transaksi->user->update([
                'paket_id' => $transaksi->paket_id,
            ]);
        }

        // Tampilkan notifikasi yang lebih lengkap
        return back()->with('success', 'Pembayaran disetujui! Paket '.$transaksi->user->name.' telah diupgrade ke '.$transaksi->paket->nama_paket.'.');
    }

    /**
     * Jika Admin Klik "Tolak" (Misal: Bukti transfer palsu / buram)
     */
    public function reject(Request $request, $id)
    {
        $transaksi = Transaksi::findOrFail($id);

        // Opsional: Admin ngasih alasan kenapa ditolak
        $transaksi->update([
            'status' => 'rejected',
            'catatan_admin' => $request->catatan_admin ?? 'Bukti transfer tidak valid/nominal tidak sesuai.',
        ]);

        return back()->with('error', 'Pembayaran ditolak.');
    }
}
