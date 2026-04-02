<?php

namespace App\Exports;

use App\Models\PesertaUjian;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class LaporanNilaiExport implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithStyles
{
    protected $ujian_id;

    protected $search;

    private $rowNumber = 0;

    // Menerima parameter ujian_id dan kata kunci pencarian dari Controller
    public function __construct($ujian_id, $search = null)
    {
        $this->ujian_id = $ujian_id;
        $this->search = $search;
    }

    // Mengambil data dari database
    public function collection()
    {
        $query = PesertaUjian::with('user')
            ->where('ujian_id', $this->ujian_id)
            ->where('status', 'selesai');

        // Jika admin sedang melakukan pencarian nama siswa
        if ($this->search) {
            $query->whereHas('user', function ($q) {
                $q->where('name', 'like', '%'.$this->search.'%');
            });
        }

        return $query->orderBy('nilai_akhir', 'desc')->get();
    }

    // Judul Kolom di baris pertama Excel
    public function headings(): array
    {
        return [
            'Peringkat',
            'Nama Peserta',
            'Email / Username',
            'Waktu Mulai',
            'Waktu Selesai',
            'Status',
            'Nilai Akhir',
        ];
    }

    // Memetakan data dari database ke setiap baris Excel
    public function map($peserta): array
    {
        $this->rowNumber++;

        return [
            $this->rowNumber,
            $peserta->user->name ?? 'Siswa Dihapus',
            $peserta->user->email ?? '-',
            $peserta->waktu_mulai ? $peserta->waktu_mulai->format('d-m-Y H:i') : '-',
            $peserta->waktu_selesai ? $peserta->waktu_selesai->format('d-m-Y H:i') : '-',
            strtoupper($peserta->status),
            $peserta->nilai_akhir ?? 0,
        ];
    }

    // Memberikan style tebal (bold) pada baris pertama (Heading)
    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
