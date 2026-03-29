<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Soal extends Model
{
    protected $guarded = ['id'];

    // Fitur Laravel 11/12: Method Casting
    protected function casts(): array
    {
        return [
            'kunci_jawaban' => 'array', // Sihir JSON ke Array otomatis
        ];
    }

    public function kategori(): BelongsTo
    {
        return $this->belongsTo(Kategori::class);
    }

    public function opsis(): HasMany
    {
        return $this->hasMany(SoalOpsi::class);
    }

    public function ujians(): BelongsToMany
    {
        return $this->belongsToMany(Ujian::class, 'ujian_soal');
    }
}
