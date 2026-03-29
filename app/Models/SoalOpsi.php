<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SoalOpsi extends Model
{
    protected $guarded = ['id'];

    public function soal(): BelongsTo
    {
        return $this->belongsTo(Soal::class);
    }
}
