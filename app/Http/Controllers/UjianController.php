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
                    if ($ujian->acak_opsi) {
                        $opsis = $opsis->shuffle();
                    }
                    $dataSoal['opsi'] = $opsis->pluck('id')->toArray();
                }

                // 2. Opsi yang HARUS STATIS (Survei & Benar-Salah)
                elseif (in_array($soal->tipe_soal, ['survei', 'benar_salah'])) {
                    $dataSoal['opsi'] = $soal->opsis->pluck('id')->toArray();
                }

                // 3. Opsi Menjodohkan (Acak bagian Kanan saja)
                // 3. Opsi Menjodohkan (Acak bagian Kanan saja)
                elseif ($soal->tipe_soal === 'menjodohkan') {
                    // Filter: Ambil yang group-nya persis 'kiri' ATAU berawalan 'L' (L1, L2, dst)
                    $kiri = $soal->opsis->filter(function ($o) {
                        return $o->group === 'kiri' || str_starts_with($o->group, 'L');
                    })->pluck('id')->toArray();

                    // Filter: Ambil yang group-nya persis 'kanan' ATAU berawalan 'R' (R1, R2, dst)
                    $kanan = $soal->opsis->filter(function ($o) {
                        return $o->group === 'kanan' || str_starts_with($o->group, 'R');
                    });

                    if ($ujian->acak_opsi) {
                        $kanan = $kanan->shuffle();
                    }

                    $kanan = $kanan->pluck('id')->toArray();

                    // Pastikan array di-reindex dengan array_values agar format JSON-nya rapi
                    $dataSoal['opsi'] = [
                        'kiri' => array_values($kiri),
                        'kanan' => array_values($kanan),
                    ];
                }

                $petaAcakan[] = $dataSoal;
            }

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

        return redirect()->route('ruang.ujian', ['sesi_id' => $sesi->id]);
    }

    // Fungsi untuk menampilkan halaman React beserta Data Aslinya
    public function ruangUjian($sesi_id)
    {
        $sesi = PesertaUjian::with('ujian')->findOrFail($sesi_id);

        if ($sesi->status === 'selesai') {
            return redirect()->route('dashboard')->with('success', 'Ujian ini sudah Anda selesaikan!');
        }

        if (now()->greaterThanOrEqualTo($sesi->batas_waktu)) {
            $sesi->update(['status' => 'selesai']);

            return redirect()->route('dashboard')->with('error', 'Waktu ujian telah habis.');
        }

        $soalIds = collect($sesi->peta_acakan)->pluck('soal_id');
        $soals = Soal::with('opsis')->whereIn('id', $soalIds)->get()->keyBy('id');

        $dataSoalTampil = collect($sesi->peta_acakan)->map(function ($peta) use ($soals) {
            $soalAsli = $soals[$peta['soal_id']];

            $opsiTampil = [];

            if ($peta['tipe'] === 'menjodohkan') {
                $opsiTampil = [
                    'left' => collect($peta['opsi']['kiri'])->map(fn ($id) => $soalAsli->opsis->firstWhere('id', $id)),
                    'right' => collect($peta['opsi']['kanan'])->map(fn ($id) => $soalAsli->opsis->firstWhere('id', $id)),
                ];
            } elseif ($peta['tipe'] !== 'isian') {
                $opsiTampil = collect($peta['opsi'])->map(fn ($id) => $soalAsli->opsis->firstWhere('id', $id))->values();
            }

            return [
                'id' => $soalAsli->id,
                'no' => $peta['no'],
                'tipe' => $soalAsli->tipe_soal,
                'tanya' => $soalAsli->pertanyaan,
                'gambar' => $soalAsli->file_gambar,
                'opsi' => $opsiTampil, // ID, Teks Opsi, tapi TIDAK ADA is_correct (aman dari Inspect Element!)
            ];
        });

        return Inertia::render('RuangUjian', [
            'sesi' => $sesi,
            'dataSoal' => $dataSoalTampil,
        ]);
    }

    public function simpanJawaban(Request $request, $sesi_id)
    {
        Log::info('--- MENCOBA MENYIMPAN JAWABAN ---', $request->all());

        try {
            $sesi = PesertaUjian::findOrFail($sesi_id);

            $jawabanAman = is_array($request->jawaban) ? $request->jawaban : [$request->jawaban];

            JawabanPeserta::updateOrCreate(
                [
                    'peserta_ujian_id' => $sesi->id,
                    'soal_id' => $request->soal_id,
                ],
                [
                    'jawaban_user' => $jawabanAman,

                    // 🔥 BACA STATUS RAGU-RAGU DARI REQUEST REACT
                    'is_ragu' => $request->boolean('is_ragu'),
                ]
            );

            return back();

        } catch (\Exception $e) {
            Log::error('GAGAL MENYIMPAN DATABASE: '.$e->getMessage());

            return back()->withErrors(['pesan' => $e->getMessage()]);
        }
    }

    // --- FUNGSI MENGAKHIRI UJIAN & AUTO-SCORING (UPDATED: BASED ON `is_correct` AND RELATIONS) ---
    public function selesaiUjian($sesi_id)
    {
        $sesi = PesertaUjian::with(['jawabanPesertas.soal.opsis'])->findOrFail($sesi_id);

        if ($sesi->status !== 'selesai') {
            $totalSkor = 0;
            $totalBobot = 0;

            foreach ($sesi->jawabanPesertas as $jawaban) {
                $soal = $jawaban->soal;
                if (! $soal || $soal->tipe_soal === 'survei') {
                    continue;
                } // Lewati jika tidak ada soal / tipe survei

                $userAns = $jawaban->jawaban_user ?? [];
                $opsis = $soal->opsis->keyBy('id'); // Map semua opsi berdasarkan ID-nya

                $totalBobot += $soal->bobot_nilai;
                $skorSoal = 0;

                // =========================================================
                // 🧠 ALGORITMA PENILAIAN BERBASIS ID DAN BOOLEAN
                // =========================================================

                // A. PILIHAN GANDA (Cek apakah ID opsi yang dipilih is_correct == true)
                if ($soal->tipe_soal === 'pg') {
                    $idDipilih = $userAns[0] ?? null;
                    if ($idDipilih && isset($opsis[$idDipilih])) {
                        if ($opsis[$idDipilih]->is_correct) {
                            $skorSoal = $soal->bobot_nilai;
                        }
                    }
                }

                // B. ISIAN SINGKAT (Cek ke database teks opsi apa saja yang is_correct)
                elseif ($soal->tipe_soal === 'isian') {
                    $jawabanTeks = strtolower(trim($userAns[0] ?? ''));

                    // Ambil semua kemungkinan jawaban benar dari database (ubah jadi huruf kecil)
                    $kunciLower = $soal->opsis
                        ->where('is_correct', true)
                        ->pluck('teks_opsi')
                        ->map(fn ($t) => strtolower(trim($t)))
                        ->toArray();

                    if (in_array($jawabanTeks, $kunciLower)) {
                        $skorSoal = $soal->bobot_nilai;
                    }
                }

                // C. PG KOMPLEKS (Hitung Rasio Jawaban Benar Berbasis ID)
                elseif ($soal->tipe_soal === 'pg_kompleks') {
                    $kunciBenarIds = $soal->opsis->where('is_correct', true)->pluck('id')->toArray();
                    $totalKunci = count($kunciBenarIds);

                    if ($totalKunci > 0) {
                        $jmlBenar = 0;
                        $jmlSalah = 0;

                        // Periksa setiap ID yang dipilih siswa
                        foreach ($userAns as $idDipilih) {
                            if (in_array($idDipilih, $kunciBenarIds)) {
                                $jmlBenar++;
                            } else {
                                $jmlSalah++; // Kena penalti karena asal milih
                            }
                        }

                        $rasio = ($jmlBenar - $jmlSalah) / $totalKunci;
                        $skorSoal = max(0, $rasio * $soal->bobot_nilai);
                    }
                }

                // D. BENAR / SALAH (Format: { "opsi_id": "Benar", "opsi_id2": "Salah" })
                elseif ($soal->tipe_soal === 'benar_salah') {
                    $semuaPernyataan = $soal->opsis; // Semua baris pernyataan di tabel
                    $poinPerItem = $soal->bobot_nilai / $semuaPernyataan->count();

                    foreach ($semuaPernyataan as $pernyataan) {
                        // Terjemahkan is_correct boolean ke string "Benar" / "Salah"
                        $kunciString = $pernyataan->is_correct ? 'Benar' : 'Salah';

                        // Cek apakah jawaban siswa pada pernyataan ID ini SAMA dengan kuncinya
                        if (isset($userAns[$pernyataan->id]) && $userAns[$pernyataan->id] === $kunciString) {
                            $skorSoal += $poinPerItem;
                        }
                    }
                }

                // E. MENJODOHKAN (Format: { "id_kiri": "id_kanan" })
                elseif ($soal->tipe_soal === 'menjodohkan') {
                    // Kunci jawaban menjodohkan tersimpan dalam bentuk JSON string di tabel soals
                    $kunciMap = json_decode($soal->kunci_jawaban, true) ?? [];
                    $totalPasangan = count($kunciMap);

                    if ($totalPasangan > 0) {
                        $poinPerPasangan = $soal->bobot_nilai / $totalPasangan;

                        foreach ($userAns as $idKiri => $idKananDipilih) {
                            // Jika pemetaan ID Kiri => ID Kanan dari siswa sama persis dengan kunci di JSON
                            if (isset($kunciMap[$idKiri]) && $kunciMap[$idKiri] == $idKananDipilih) {
                                $skorSoal += $poinPerPasangan;
                            }
                        }
                    }
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

        return redirect('/dashboard')->with('success', '🎉 Ujian Selesai! Nilai Anda: '.round($sesi->nilai_akhir, 2));
    }

    public function index()
    {
        $kategoriUjians = KategoriUjian::with('ujians')->get();

        return Inertia::render('Siswa/DaftarUjian', [
            'kategoriUjians' => $kategoriUjians,
        ]);
    }

    public function persiapan($id)
    {
        $ujian = Ujian::with('kategoriUjian')->withCount('soals')->findOrFail($id);

        return Inertia::render('Siswa/PersiapanUjian', [
            'ujian' => $ujian,
        ]);
    }
}
