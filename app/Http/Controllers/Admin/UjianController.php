<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kategori;
use App\Models\KategoriUjian;
use App\Models\PesertaUjian;
use App\Models\Soal;
use App\Models\Ujian;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class UjianController extends Controller
{
    // 1. Menampilkan Daftar Ujian (CRUD Read)
    public function index()
    {
        $ujians = Ujian::with('kategoriUjian')->latest()->paginate(10);
        $kategoriUjian = KategoriUjian::all(); // Mengambil data kategori untuk dropdown di modal

        return Inertia::render('Admin/Ujian/Index', [
            'ujians' => $ujians,
            'kategoriUjian' => $kategoriUjian, // Kirim ke React
        ]);
    }

    // 2. Menampilkan Detail Ujian & Daftar Soal di dalamnya
    public function show(Request $request, $id)
    {
        $ujian = Ujian::with(['kategoriUjian', 'soals'])->findOrFail($id);
        $kategoris = Kategori::all();

        $soalTerpakaiIds = $ujian->soals->pluck('id')->toArray();

        // 🌟 SERVER-SIDE QUERY, FILTER, DAN PAGINATION
        $bankSoal = Soal::with('kategori')
            ->whereNotIn('id', $soalTerpakaiIds)
            ->when($request->kategori_id, function ($query, $kategori_id) {
                // Filter berdasarkan Kategori jika ada parameter kategori_id
                return $query->where('kategori_id', $kategori_id);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString(); // Mempertahankan parameter filter di URL saat ganti halaman

        return Inertia::render('Admin/Ujian/Show', [
            'ujian' => $ujian,
            'kategoris' => $kategoris,
            'bankSoal' => $bankSoal,
            'filters' => $request->only(['kategori_id', 'page']), // Kirim filter saat ini ke React
        ]);
    }

    // --- FUNGSI IMPORT & MANAJEMEN SOAL ---

    // 3. Import Soal dari Bank Soal ke Ujian
    public function importSoal(Request $request, $id)
    {
        $request->validate([
            'soal_ids' => 'required|array',
            'soal_ids.*' => 'exists:soals,id',
        ]);

        $ujian = Ujian::findOrFail($id);

        // syncWithoutDetaching mencegah soal lama terhapus saat menambah soal baru
        $ujian->soals()->syncWithoutDetaching($request->soal_ids);

        return back()->with('success', 'Berhasil mengimpor '.count($request->soal_ids).' soal ke dalam ujian.');
    }

    // 4. Mengeluarkan Soal dari Ujian (TIDAK menghapus dari bank soal)
    public function removeSoal($ujian_id, $soal_id)
    {
        $ujian = Ujian::findOrFail($ujian_id);
        $ujian->soals()->detach($soal_id);

        return back()->with('success', 'Soal berhasil dikeluarkan dari ujian.');
    }

    public function store(Request $request)
    {
        $request->validate([
            'kategori_ujian_id' => 'required|exists:kategori_ujians,id',
            'judul_ujian' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'durasi_menit' => 'required|integer|min:1',
            'waktu_mulai' => 'nullable|date',
            'waktu_selesai' => 'nullable|date|after_or_equal:waktu_mulai',
            'acak_soal' => 'boolean',
            'acak_opsi' => 'boolean',
        ]);

        Ujian::create($request->all());

        return back()->with('success', 'Ujian berhasil dibuat!');
    }

    // 3. Menyimpan Perubahan Ujian (Dipanggil dari Modal Edit)
    public function update(Request $request, $id)
    {
        $request->validate([
            'kategori_ujian_id' => 'required|exists:kategori_ujians,id',
            'judul_ujian' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'durasi_menit' => 'required|integer|min:1',
            'waktu_mulai' => 'nullable|date',
            'waktu_selesai' => 'nullable|date|after_or_equal:waktu_mulai',
            'acak_soal' => 'boolean',
            'acak_opsi' => 'boolean',
        ]);

        $ujian = Ujian::findOrFail($id);
        $ujian->update($request->all());

        return back()->with('success', 'Pengaturan Ujian berhasil diperbarui!');
    }

    public function monitoring(Request $request, $id)
    {
        $ujian = Ujian::findOrFail($id);

        $pesertas = PesertaUjian::with('user')
            ->where('ujian_id', $id)
            ->when($request->search, function ($query, $search) {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->latest('waktu_mulai')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Ujian/Monitoring', [
            'ujian' => $ujian,
            'pesertas' => $pesertas,
            'filters' => $request->only(['search']),
        ]);
    }

    // 🌟 1. Fitur Reset Siswa (Mendukung Multi-Select)
    public function resetPeserta(Request $request, $ujian_id)
    {
        $request->validate([
            'peserta_ids' => 'required|array',
            'peserta_ids.*' => 'exists:peserta_ujians,id',
        ]);

        // Hapus histori ujian siswa secara massal
        PesertaUjian::where('ujian_id', $ujian_id)
            ->whereIn('id', $request->peserta_ids)
            ->delete();

        return back()->with('success', count($request->peserta_ids).' sesi ujian peserta berhasil direset.');
    }

    // 🌟 2. Fitur Tambah Waktu (Mendukung Multi-Select)
    public function tambahWaktu(Request $request, $ujian_id)
    {
        $request->validate([
            'tambahan_menit' => 'required|integer|min:1|max:120',
            'peserta_ids' => 'required|array',
            'peserta_ids.*' => 'exists:peserta_ujians,id',
        ]);

        $pesertas = PesertaUjian::where('ujian_id', $ujian_id)
            ->whereIn('id', $request->peserta_ids)
            ->get();

        foreach ($pesertas as $peserta) {
            $batasWaktuBaru = Carbon::parse($peserta->batas_waktu)->addMinutes($request->tambahan_menit);
            $peserta->update([
                'batas_waktu' => $batasWaktuBaru,
                'status' => $peserta->status === 'selesai' ? 'mengerjakan' : $peserta->status,
            ]);
        }

        return back()->with('success', 'Waktu ujian untuk '.count($pesertas).' peserta berhasil ditambah.');
    }

    // 🌟 Fitur Hitung Ulang Nilai (Recalculate) - 100% AMAN & AKURAT
    public function recalculateNilai($ujian_id)
    {
        // 1. Load relasi opsis hanya sekali
        $ujian = Ujian::with('soals.opsis')->findOrFail($ujian_id);

        $totalSoal = $ujian->soals->count();
        if ($totalSoal === 0) {
            return back()->with('error', 'Ujian ini belum memiliki soal.');
        }

        // 2. Total bobot maksimal HANYA dihitung dari soal NON-SURVEI
        $totalBobotMaksimal = $ujian->soals->where('tipe_soal', '!=', 'survei')->sum('bobot_nilai');

        if ($totalBobotMaksimal <= 0) {
            return back()->with('error', 'Total bobot soal tidak valid (0). Pastikan ada soal selain survei.');
        }

        $pesertaCount = 0;
        $errorMessage = null; // Penampung jika terjadi error

        // 3. Proses peserta 100 orang per batch agar server tidak hang
        PesertaUjian::with('jawabanPesertas')
            ->where('ujian_id', $ujian_id)
            ->chunk(100, function ($pesertasChunk) use ($ujian, $totalBobotMaksimal, &$pesertaCount, &$errorMessage) {

                // Mulai Database Transaction untuk keamanan data
                DB::beginTransaction();

                try {
                    foreach ($pesertasChunk as $peserta) {
                        $pesertaCount++;

                        if ($peserta->jawabanPesertas->isEmpty()) {
                            $peserta->update(['nilai_akhir' => 0]);

                            continue;
                        }

                        // Parse jawaban JSON dengan aman
                        $jawabanSiswa = [];
                        foreach ($peserta->jawabanPesertas as $jp) {
                            $jawabanParsed = $jp->jawaban_user;

                            if (is_string($jawabanParsed)) {
                                $temp = json_decode($jawabanParsed, true);
                                if (json_last_error() === JSON_ERROR_NONE) {
                                    $jawabanParsed = $temp;
                                }
                            }
                            if (is_string($jawabanParsed)) {
                                $temp = json_decode($jawabanParsed, true);
                                if (json_last_error() === JSON_ERROR_NONE) {
                                    $jawabanParsed = $temp;
                                }
                            }

                            $jawabanSiswa[$jp->soal_id] = [
                                'jawaban' => $jawabanParsed,
                                'model' => $jp, // Simpan objek model relasi
                            ];
                        }

                        $skorSiswa = 0;

                        // 4. Looping Pencocokan Per Soal
                        foreach ($ujian->soals as $soal) {
                            $idSoal = $soal->id;
                            $bobot = (float) $soal->bobot_nilai;
                            $skorSoalIni = 0;

                            // 🚨 ABAIKAN SOAL SURVEI
                            if ($soal->tipe_soal === 'survei') {
                                if (array_key_exists($idSoal, $jawabanSiswa)) {
                                    $jawabanSiswa[$idSoal]['model']->update(['skor_soal' => 0]);
                                }

                                continue;
                            }

                            if (! array_key_exists($idSoal, $jawabanSiswa)) {
                                continue;
                            }

                            $jawaban = $jawabanSiswa[$idSoal]['jawaban'];
                            $modelJawabanPeserta = $jawabanSiswa[$idSoal]['model'];

                            // 🚨 LOGIKA PENILAIAN
                            if ($soal->tipe_soal === 'pg') {
                                $jawabanId = is_array($jawaban) ? reset($jawaban) : $jawaban;
                                if (is_numeric($jawabanId)) {
                                    $opsiDipilih = $soal->opsis->where('id', $jawabanId)->first();
                                    if ($opsiDipilih && $opsiDipilih->is_correct) {
                                        $skorSoalIni = $bobot;
                                    }
                                }
                            } elseif ($soal->tipe_soal === 'pg_kompleks') {
                                if (is_array($jawaban)) {
                                    $correctOpsiIds = $soal->opsis->where('is_correct', true)->pluck('id')->toArray();

                                    // Ratakan array
                                    $flatJawaban = [];
                                    array_walk_recursive($jawaban, function ($a) use (&$flatJawaban) {
                                        $flatJawaban[] = $a;
                                    });

                                    $jawabanArray = array_map('intval', $flatJawaban);
                                    $kunciArray = array_map('intval', $correctOpsiIds);

                                    sort($jawabanArray);
                                    sort($kunciArray);

                                    if ($jawabanArray === $kunciArray) {
                                        $skorSoalIni = $bobot;
                                    }
                                }
                            } elseif ($soal->tipe_soal === 'isian') {
                                $jawabanTeksRaw = is_array($jawaban) ? reset($jawaban) : $jawaban;
                                if (is_scalar($jawabanTeksRaw)) {
                                    $jawabanTeks = strtolower(trim((string) $jawabanTeksRaw));

                                    $correctTexts = $soal->opsis->where('is_correct', true)->pluck('teks_opsi')
                                        ->map(function ($text) {
                                            return strtolower(trim((string) $text));
                                        })
                                        ->toArray();

                                    if (in_array($jawabanTeks, $correctTexts)) {
                                        $skorSoalIni = $bobot;
                                    }
                                }
                            } elseif ($soal->tipe_soal === 'benar_salah') {
                                if (is_array($jawaban)) {
                                    $jumlahPernyataan = $soal->opsis->count();
                                    $bobotPerPernyataan = $jumlahPernyataan > 0 ? ($bobot / $jumlahPernyataan) : 0;

                                    foreach ($jawaban as $opsiId => $jawabSiswa) {
                                        if (is_scalar($jawabSiswa)) {
                                            $opsi = $soal->opsis->where('id', $opsiId)->first();
                                            if ($opsi) {
                                                $kunciSebenarnya = $opsi->is_correct ? 'Benar' : 'Salah';
                                                if ((string) $jawabSiswa === $kunciSebenarnya) {
                                                    $skorSoalIni += $bobotPerPernyataan;
                                                }
                                            }
                                        }
                                    }
                                }
                            } elseif ($soal->tipe_soal === 'menjodohkan') {
                                $kunciJawaban = $soal->kunci_jawaban;
                                if (is_string($kunciJawaban)) {
                                    $tempKunci = json_decode($kunciJawaban, true);
                                    if (json_last_error() === JSON_ERROR_NONE) {
                                        $kunciJawaban = $tempKunci;
                                    }
                                }

                                if (is_array($kunciJawaban) && is_array($jawaban)) {
                                    $jumlahPasangan = count($kunciJawaban);
                                    $bobotPerPasangan = $jumlahPasangan > 0 ? ($bobot / $jumlahPasangan) : 0;

                                    foreach ($kunciJawaban as $kiriId => $kananIdTepat) {
                                        if (isset($jawaban[$kiriId]) && is_scalar($jawaban[$kiriId]) && is_scalar($kananIdTepat)) {
                                            if ((string) $jawaban[$kiriId] === (string) $kananIdTepat) {
                                                $skorSoalIni += $bobotPerPasangan;
                                            }
                                        }
                                    }
                                }
                            }

                            $skorSiswa += $skorSoalIni;

                            // 🌟 LANGSUNG UPDATE MENGGUNAKAN ELOQUENT (AMAN)
                            $modelJawabanPeserta->update([
                                'skor_soal' => $skorSoalIni,
                            ]);
                        }

                        $nilaiAkhir = ($skorSiswa / $totalBobotMaksimal) * 100;

                        // 🌟 LANGSUNG UPDATE MENGGUNAKAN ELOQUENT (AMAN)
                        $peserta->update([
                            'nilai_akhir' => round(min(100, max(0, $nilaiAkhir)), 2),
                        ]);
                    }

                    DB::commit();

                } catch (\Exception $e) {
                    DB::rollBack();
                    // Tangkap error dan hentikan proses chunk
                    $errorMessage = $e->getMessage();

                    return false;
                }
            });

        // 🚨 JIKA TERJADI ERROR PADA DATABASE, TAMPILKAN DI LAYAR!
        if ($errorMessage) {
            return back()->with('error', 'Terjadi kesalahan sistem saat menghitung nilai: '.$errorMessage);
        }

        return back()->with('success', "Berhasil menghitung ulang nilai untuk {$pesertaCount} peserta.");
    }
}
