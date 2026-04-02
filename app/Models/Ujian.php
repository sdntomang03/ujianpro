<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ujian extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'waktu_mulai' => 'datetime',
            'waktu_selesai' => 'datetime',
            'acak_soal' => 'boolean',
            'acak_opsi' => 'boolean',
        ];
    }

    public function soals(): BelongsToMany
    {
        return $this->belongsToMany(Soal::class, 'ujian_soal')->withPivot('urutan_nomor');
    }

    public function pesertaUjians(): HasMany
    {
        return $this->hasMany(PesertaUjian::class);
    }

    // Ujian ini milik 1 Kategori Ujian
    public function kategoriUjian()
    {
        return $this->belongsTo(KategoriUjian::class);
    }

    public function pesertas(): HasMany
    {
        // Pastikan nama modelnya adalah PesertaUjian
        return $this->hasMany(PesertaUjian::class, 'ujian_id');
    }

    public function minimalPaket()
    {
        return $this->belongsTo(Paket::class, 'minimal_paket_id');
    }
}
