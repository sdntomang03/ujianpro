<?php

namespace App\Http\Controllers;

use App\Models\JawabanPeserta;
use App\Models\KategoriUjian;
use App\Models\PesertaUjian;
use App\Models\Soal;
use App\Models\Ujian;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
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

                // --- PENGATURAN OPSI JAWABAN ---

                // 1. Opsi yang BOLEH diacak (PG & PG Kompleks)
                if (in_array($soal->tipe_soal, ['pg', 'pg_kompleks'])) {
                    $opsis = $soal->opsis;
                    // Acak opsi hanya jika pengaturan ujian mengizinkan
                    if ($ujian->acak_opsi) {
                        $opsis = $opsis->shuffle();
                    }
                    $dataSoal['opsi'] = $opsis->pluck('id')->toArray();
                }

                // 2. Opsi yang HARUS STATIS / TIDAK BOLEH DIACAK (Survei & Benar-Salah)
                elseif (in_array($soal->tipe_soal, ['survei', 'benar_salah'])) {
                    // Abaikan pengaturan ujian, paksa urutannya sesuai aslinya di database!
                    $dataSoal['opsi'] = $soal->opsis->pluck('id')->toArray();
                }

                // 3. Opsi Menjodohkan (Acak bagian Kanan saja)
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

        // 1. CEK STATUS: Jika sudah selesai, JANGAN izinkan masuk ruang ujian lagi!
        // Langsung lempar kembali ke Dashboard.
        if ($sesi->status === 'selesai') {
            return redirect()->route('dashboard')->with('success', 'Ujian ini sudah Anda selesaikan!');
        }

        // 2. CEK WAKTU: Cek apakah waktu sudah habis di server
        if (now()->greaterThanOrEqualTo($sesi->batas_waktu)) {
            // Ubah status jadi selesai jika dia memaksa masuk saat waktu sudah habis
            $sesi->update(['status' => 'selesai']);

            return redirect()->route('dashboard')->with('error', 'Waktu ujian telah habis.');
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
                'gambar' => $soalAsli->file_gambar,
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
        // 1. PASANG CCTV: Catat apa yang dikirim oleh React ke file Log Laravel
        Log::info('--- MENCOBA MENYIMPAN JAWABAN ---');
        Log::info('Data dari React: ', $request->all());

        try {
            $sesi = PesertaUjian::findOrFail($sesi_id);

            // 2. KITA MATIKAN SEMENTARA PENGECEKAN WAKTU! (Hapus komentar // jika ingin diaktifkan lagi nanti)
            /* if (now()->greaterThanOrEqualTo($sesi->batas_waktu) || $sesi->status === 'selesai') {
                \Log::warning('Ditolak karena waktu habis / sudah selesai');
                return back();
            }
            */

            // 3. Pastikan format jawaban aman (Array)
            $jawabanAman = is_array($request->jawaban) ? $request->jawaban : [$request->jawaban];

            // 4. Simpan ke Database
            JawabanPeserta::updateOrCreate(
                [
                    'peserta_ujian_id' => $sesi->id,
                    'soal_id' => $request->soal_id,
                ],
                [
                    'jawaban_user' => $jawabanAman,
                    'is_ragu' => false,
                ]
            );

            Log::info('BERHASIL DISIMPAN KE MYSQL!');

            return back();

        } catch (\Exception $e) {
            // 5. JIKA ERROR DATABASE MUNCUL, CATAT DETAILNYA!
            Log::error('GAGAL MENYIMPAN DATABASE: '.$e->getMessage());

            return back()->withErrors(['pesan' => $e->getMessage()]);
        }
    }

    // --- FUNGSI MENGAKHIRI UJIAN & AUTO-SCORING ---
    public function selesaiUjian($sesi_id)
    {
        // 1. Ambil Data Sesi beserta Jawaban dan Opsi Soalnya
        $sesi = PesertaUjian::with(['jawabanPesertas.soal.opsis'])->findOrFail($sesi_id);

        if ($sesi->status !== 'selesai') {
            $totalSkor = 0;
            $totalBobot = 0;

            // 2. Looping (Periksa) Setiap Jawaban Siswa
            foreach ($sesi->jawabanPesertas as $jawaban) {
                $soal = $jawaban->soal;
                if (! $soal) {
                    continue;
                }

                if ($soal->tipe_soal === 'survei') {
                    continue;
                } // Survei tidak dinilai!

                $kunci = $soal->kunci_jawaban ?? [];
                $userAns = $jawaban->jawaban_user ?? [];
                $opsis = $soal->opsis->keyBy('id'); // Mapping ID ke Teks Opsi

                $totalBobot += $soal->bobot_nilai;
                $skorSoal = 0;

                // --- 🧠 ALGORITMA SMART SCORING ---

                if ($soal->tipe_soal === 'pg') {
                    // A. PILIHAN GANDA (Terjemahkan ID yang dikirim React menjadi Teks, lalu cocokkan)
                    $idDipilih = $userAns[0] ?? null;
                    if ($idDipilih && isset($opsis[$idDipilih])) {
                        if (in_array($opsis[$idDipilih]->teks_opsi, $kunci)) {
                            $skorSoal = $soal->bobot_nilai;
                        }
                    }
                } elseif ($soal->tipe_soal === 'isian') {
                    // B. ISIAN SINGKAT (Anti Huruf Besar/Kecil & Anti Spasi Berlebih)
                    $jawabanTeks = strtolower(trim($userAns[0] ?? ''));
                    $kunciLower = array_map(fn ($k) => strtolower(trim($k)), $kunci);

                    if (in_array($jawabanTeks, $kunciLower)) {
                        $skorSoal = $soal->bobot_nilai;
                    }
                } elseif ($soal->tipe_soal === 'pg_kompleks') {
                    // C. PG KOMPLEKS (Sistem Poin Parsial & Penalti)
                    $teksDipilih = [];
                    foreach ($userAns as $id) {
                        if (isset($opsis[$id])) {
                            $teksDipilih[] = $opsis[$id]->teks_opsi;
                        }
                    }

                    $jmlBenar = count(array_intersect($teksDipilih, $kunci));
                    $jmlSalah = count(array_diff($teksDipilih, $kunci)); // Penalti salah pilih
                    $totalKunci = count($kunci);

                    if ($totalKunci > 0) {
                        // Rumus: (Benar - Salah) / Total Kunci * Bobot
                        $rasio = ($jmlBenar - $jmlSalah) / $totalKunci;
                        $skorSoal = max(0, $rasio * $soal->bobot_nilai); // Skor tidak boleh minus
                    }
                } else {
                    // D. TIPE LAIN (Menjodohkan / Benar-Salah)
                    // Untuk sementara, jika diisi kita berikan nilai penuh agar simpel.
                    // (Logika pencocokan kompleks bisa dikembangkan lebih lanjut di sini)
                    $skorSoal = count($userAns) > 0 ? $soal->bobot_nilai : 0;
                }

                // 3. Simpan Nilai per Soal ke Database
                $jawaban->update(['skor_soal' => $skorSoal]);
                $totalSkor += $skorSoal;
            }

            // 4. Hitung Nilai Akhir (Skala 0 - 100)
            $nilaiAkhir = $totalBobot > 0 ? ($totalSkor / $totalBobot) * 100 : 0;

            // 5. Kunci Tiket Ujian Siswa
            $sesi->update([
                'status' => 'selesai',
                'waktu_selesai' => now(),
                'nilai_akhir' => $nilaiAkhir,
            ]);
        }

        // 6. Lempar Siswa ke Dashboard dengan membawa Pesan Nilai
        return redirect('/dashboard')->with('success', '🎉 Ujian Selesai! Nilai Anda: '.round($sesi->nilai_akhir, 2));
    }

    public function index()
    {
        // Ambil semua kategori ujian BESERTA data ujian di dalamnya
        // (Bisa ditambahkan kondisi where() jika ingin menampilkan ujian yang aktif saja)
        $kategoriUjians = KategoriUjian::with('ujians')->get();

        return Inertia::render('Siswa/DaftarUjian', [
            'kategoriUjians' => $kategoriUjians,
        ]);
    }

    public function persiapan($id)
    {
        // Mengambil data ujian dan menghitung jumlah soal yang terkait
        $ujian = Ujian::with('kategoriUjian')->withCount('soals')->findOrFail($id);

        return Inertia::render('Siswa/PersiapanUjian', [
            'ujian' => $ujian,
        ]);
    }
}
