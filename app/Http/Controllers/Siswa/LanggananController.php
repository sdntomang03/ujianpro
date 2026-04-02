<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\Paket;
use App\Models\Transaksi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LanggananController extends Controller
{
    /**
     * Menampilkan halaman pilihan paket
     */
    public function index()
    {
        $user = Auth::user()->load('paket');
        $pakets = Paket::orderBy('level', 'asc')->get();

        return Inertia::render('Siswa/Langganan/Index', [
            'pakets' => $pakets,
            'currentPaketId' => $user->paket_id,
        ]);
    }

    /**
     * Simulasi proses upgrade paket
     */
    public function prosesUpgrade(Request $request)
    {
        $user = Auth::user();

        // 🌟 1. CEK APAKAH ADA TRANSAKSI PENDING
        $transaksiPending = Transaksi::where('user_id', $user->id)
            ->where('status', 'pending')
            ->first();

        // Jika ada, tolak dan kembalikan dengan pesan error
        if ($transaksiPending) {
            return redirect()->back()->with('error', 'Anda masih memiliki permohonan upgrade yang sedang diproses. Mohon tunggu konfirmasi Admin.');
        }

        // 2. Validasi file gambar yang diupload
        $request->validate([
            'paket_id' => 'required|exists:pakets,id',
            'nominal_transfer' => 'required|numeric',
            'bukti_pembayaran' => 'required|image|mimes:jpeg,png,jpg|max:2048', // Max 2MB
        ]);

        // 3. Simpan Gambar ke folder 'storage/app/public/bukti_transfer'
        $path = $request->file('bukti_pembayaran')->store('bukti_transfer', 'public');

        // 4. Buat antrean transaksi di database
        Transaksi::create([
            'user_id' => $user->id,
            'paket_id' => $request->paket_id,
            'nominal_transfer' => $request->nominal_transfer,
            'bukti_pembayaran' => $path,
            'status' => 'pending',
        ]);

        // 5. Arahkan kembali ke dashboard dengan notifikasi sukses
        return redirect()->route('dashboard')->with('success', 'Bukti transfer berhasil diunggah! Mohon tunggu konfirmasi Admin maksimal 1x24 jam.');
    }
}
