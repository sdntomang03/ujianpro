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
}
