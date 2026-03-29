<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PesertaUjian extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'peta_acakan' => 'array', // Mengubah JSON Peta Acakan menjadi Array PHP
            'waktu_mulai' => 'datetime',
            'batas_waktu' => 'datetime',
            'waktu_selesai' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function ujian(): BelongsTo
    {
        return $this->belongsTo(Ujian::class);
    }

    public function jawabanPesertas(): HasMany
    {
        return $this->hasMany(JawabanPeserta::class);
    }
}
