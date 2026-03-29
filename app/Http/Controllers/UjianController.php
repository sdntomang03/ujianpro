<?php

namespace App\Http\Controllers;

use App\Models\JawabanPeserta;
use App\Models\PesertaUjian;
use App\Models\Soal;
use App\Models\Ujian;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UjianController extends Controller
{
    // Fungsi saat Siswa Klik "Mulai Ujian"
    public function mulaiUjian($id)
    {
        $ujian = Ujian::findOrFail($id);
        $user = Auth::user();

        // 1. Cek apakah siswa sudah pernah mulai?
        $sesi = PesertaUjian::where('user_id', $user->id)
            ->where('ujian_id', $ujian->id)
            ->first();

        // 2. Jika belum pernah mulai, BUAT PETA ACAKAN SEKARANG!
        if (! $sesi) {
            // Ambil semua soal dari ujian ini
            $soals = $ujian->soals()->with('opsis')->get();

            // Acak urutan soal jika pengaturan ujian meminta diacak
            if ($ujian->acak_soal) {
                $soals = $soals->shuffle();
            }

            $petaAcakan = [];
            $nomor = 1;

            foreach ($soals as $soal) {
                $dataSoal = [
                    'no' => $nomor++,
                    'soal_id' => $soal->id,
                    'tipe' => $soal->tipe_soal,
                    'opsi' => [],
                ];

                // Acak Opsi Pilihan Ganda
                if (in_array($soal->tipe_soal, ['pg', 'pg_kompleks', 'survei', 'benar_salah'])) {
                    $opsis = $soal->opsis;
                    if ($ujian->acak_opsi) {
                        $opsis = $opsis->shuffle();
                    }
                    // Simpan ID opsinya saja untuk menghemat database
                    $dataSoal['opsi'] = $opsis->pluck('id')->toArray();
                }
                // Acak Opsi Menjodohkan (Acak Kanan Saja agar tidak pusing)
                elseif ($soal->tipe_soal === 'menjodohkan') {
                    $kiri = $soal->opsis->where('group', 'kiri')->pluck('id')->toArray();
                    $kanan = $soal->opsis->where('group', 'kanan');
                    if ($ujian->acak_opsi) {
                        $kanan = $kanan->shuffle();
                    }
                    $kanan = $kanan->pluck('id')->toArray();

                    $dataSoal['opsi'] = ['kiri' => $kiri, 'kanan' => $kanan];
                }

                $petaAcakan[] = $dataSoal;
            }

            // Simpan ke database (Sangat ringan, cuma 1 baris insert!)
            $waktuMulai = now();
            $batasWaktu = $waktuMulai->copy()->addMinutes($ujian->durasi_menit);

            $sesi = PesertaUjian::create([
                'user_id' => $user->id,
                'ujian_id' => $ujian->id,
                'peta_acakan' => $petaAcakan,
                'waktu_mulai' => $waktuMulai,
                'batas_waktu' => $batasWaktu,
                'status' => 'mengerjakan',
            ]);
        }

        // Arahkan ke Halaman Pengerjaan
        return redirect()->route('ruang.ujian', ['sesi_id' => $sesi->id]);
    }

    // Fungsi untuk menampilkan halaman React beserta Data Aslinya
    public function ruangUjian($sesi_id)
    {
        // 1. Ambil Sesi Ujian Siswa
        $sesi = PesertaUjian::with('ujian')->findOrFail($sesi_id);

        // Cek apakah waktu sudah habis di server
        if (now()->greaterThanOrEqualTo($sesi->batas_waktu)) {
            abort(403, 'Waktu ujian telah habis.');
        }

        // 2. Ambil Semua Soal asli berdasarkan Peta Acakan
        $soalIds = collect($sesi->peta_acakan)->pluck('soal_id');
        $soals = Soal::with('opsis')->whereIn('id', $soalIds)->get()->keyBy('id');

        // 3. Rakit Data (Terjemahkan ID Opsi menjadi Teks Opsi sesuai Acakan)
        $dataSoalTampil = collect($sesi->peta_acakan)->map(function ($peta) use ($soals) {
            $soalAsli = $soals[$peta['soal_id']];

            $opsiTampil = [];
            // Susun opsi Menjodohkan
            if ($peta['tipe'] === 'menjodohkan') {
                $opsiTampil = [
                    'left' => collect($peta['opsi']['kiri'])->map(fn ($id) => $soalAsli->opsis->firstWhere('id', $id)),
                    'right' => collect($peta['opsi']['kanan'])->map(fn ($id) => $soalAsli->opsis->firstWhere('id', $id)),
                ];
            }
            // Susun opsi untuk PG, Survei, Benar-Salah
            elseif ($peta['tipe'] !== 'isian') {
                $opsiTampil = collect($peta['opsi'])->map(fn ($id) => $soalAsli->opsis->firstWhere('id', $id))->values();
            }

            return [
                'id' => $soalAsli->id,
                'no' => $peta['no'],
                'tipe' => $soalAsli->tipe_soal,
                'tanya' => $soalAsli->pertanyaan,
                'opsi' => $opsiTampil,
            ];
        });

        // 4. Kirim ke React (Inertia)
        return Inertia::render('RuangUjian', [
            'sesi' => $sesi,
            'dataSoal' => $dataSoalTampil,
        ]);
    }

    public function simpanJawaban(Request $request, $sesi_id)
    {
        try {
            $sesi = PesertaUjian::findOrFail($sesi_id);

            // Jika waktu habis, tolak diam-diam
            if (now()->greaterThanOrEqualTo($sesi->batas_waktu) || $sesi->status === 'selesai') {
                return back();
            }

            // PERLINDUNGAN TIPE DATA: Pastikan selalu berbentuk Array untuk kolom JSON
            $jawabanAman = is_array($request->jawaban) ? $request->jawaban : [$request->jawaban];

            JawabanPeserta::updateOrCreate(
                [
                    'peserta_ujian_id' => $sesi->id,
                    'soal_id' => $request->soal_id,
                ],
                [
                    'jawaban_user' => $jawabanAman, // Simpan dengan aman
                    'is_ragu' => false,
                ]
            );

            return back(); // Wajib return back() untuk Inertia
        } catch (\Exception $e) {
            return back()->withErrors(['pesan' => $e->getMessage()]);
        }
    }

    // --- FUNGSI MENGAKHIRI UJIAN (MANUAL / WAKTU HABIS) ---
    public function selesaiUjian($sesi_id)
    {
        $sesi = PesertaUjian::findOrFail($sesi_id);

        if ($sesi->status !== 'selesai') {
            $sesi->update([
                'status' => 'selesai',
                'waktu_selesai' => now(),
            ]);

            // NOTE: Di sini nanti kita letakkan fungsi "Hitung Nilai Otomatis" (Scoring)
            // Namun untuk saat ini, kita fokus mengamankan status selesainya dulu.
        }

        // Arahkan kembali ke Dashboard (atau halaman hasil)
        return redirect()->route('dashboard')->with('success', 'Ujian berhasil diselesaikan!');
    }
}
