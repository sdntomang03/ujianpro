<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JawabanPeserta extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'jawaban_user' => 'array', // Menyimpan format kompleks (checkbox/garis)
            'is_ragu' => 'boolean',
        ];
    }

    public function pesertaUjian(): BelongsTo
    {
        return $this->belongsTo(PesertaUjian::class);
    }

    public function soal(): BelongsTo
    {
        return $this->belongsTo(Soal::class);
    }
}
